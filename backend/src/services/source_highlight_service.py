import re

from rapidfuzz import fuzz
from sqlalchemy.ext.asyncio import AsyncSession
from src.repositories.alert_sources import AlertSourceRepository

_SIMILARITY_THRESHOLD = 70


class SourceHighlightService:
    """
    Returns pre-computed annotated markdown for a source on click.
    Annotation (sentence matching + <mark> tagging) is done at alert creation time
    by AlertWorkflowService._annotate_and_filter_sources().
    """

    async def get_or_generate_highlight(
        self,
        alert_id: int,
        source_id: int,
        db_session: AsyncSession,
    ) -> str:
        source_repo = AlertSourceRepository(db_session)
        source_row = await source_repo.get_by_id(source_id)

        if not source_row or source_row.alert_id != alert_id:
            return ""

        return source_row.annotated_markdown or ""

    @staticmethod
    def _build_annotated_markdown(
        full_text: str,
        reference_sentences: list[str],
    ) -> str:
        if not reference_sentences:
            return full_text

        # Add paragraph breaks around headings so they don't collapse into adjacent text.
        full_text = re.sub(r"(?<!\n)\n(#{1,6} )", r"\n\n\1", full_text)
        full_text = re.sub(r"(#{1,6} [^\n]+)\n(?!\n)", r"\1\n\n", full_text)

        # Split on paragraph breaks (2+ newlines), keeping separators for rejoining.
        # Single newlines within a paragraph are soft line-wraps in markdown — they
        # render identically to spaces, so collapsing them is safe.
        parts = re.split(r"(\n{2,})", full_text)

        # Normalize each content part: collapse single newlines and extra spaces
        normalized_parts = []
        for part in parts:
            if re.match(r"\n{2,}", part) or not part.strip():
                normalized_parts.append(part)
            else:
                lines = part.splitlines()
                # Preserve line structure for list blocks; collapse wrapping for flowing paragraphs.
                if any(re.match(r"\s*[-*+]\s|\s*\d+\.\s", line) for line in lines):
                    normalized = "\n".join(re.sub(r"[^\S\n]+", " ", line).strip() for line in lines if line.strip())
                else:
                    normalized = re.sub(r"\s+", " ", " ".join(lines)).strip()
                normalized_parts.append(normalized)

        # Build a flat list of all document sentences with their part index
        doc_sentences: list[tuple[int, str]] = []
        for i, part in enumerate(normalized_parts):
            if re.match(r"\n{2,}", part) or not part.strip():
                continue
            for sent in re.split(r"(?<=[.!?])\s+", part):
                sent = sent.strip()
                if sent:
                    doc_sentences.append((i, sent))

        marked_indices: set[int] = set()

        for ref_sentence in reference_sentences:
            ref_sentence = ref_sentence.strip()
            if not ref_sentence:
                continue

            best_score = 0
            best_idx = -1

            for j, (_, doc_sent) in enumerate(doc_sentences):
                if j in marked_indices:
                    continue
                score = fuzz.ratio(ref_sentence, doc_sent)
                if score > best_score:
                    best_score = score
                    best_idx = j

            if best_score >= _SIMILARITY_THRESHOLD and best_idx != -1:
                part_idx, best_sent = doc_sentences[best_idx]
                normalized_parts[part_idx] = normalized_parts[part_idx].replace(
                    best_sent,
                    f"<mark>{best_sent}</mark>",
                    1,
                )
                marked_indices.add(best_idx)

        return "".join(normalized_parts)
