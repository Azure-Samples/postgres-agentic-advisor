import styled from 'styled-components';

export const AgentResponseContainer = styled.div`
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[5]};
  margin-bottom: 0;
  word-wrap: break-word;

  /* Markdown content styling */
  .markdown-container {
    color: ${({ theme }) => theme.colors.contentPrimary || '#272f3a'};
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
    line-height: 1.57;

    p {
      margin: 0 0 ${({ theme }) => theme.spacing[2]} 0;
      &:last-child {
        margin-bottom: 0;
      }
    }

    ul,
    ol {
      margin: ${({ theme }) => theme.spacing[2]} 0;
      padding-left: ${({ theme }) => theme.spacing[5]};
    }

    li {
      margin-bottom: ${({ theme }) => theme.spacing[2]};
    }

    strong {
      font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin: ${({ theme }) => theme.spacing[3]} 0 ${({ theme }) => theme.spacing[2]} 0;
      font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
      &:first-child {
        margin-top: 0;
      }
    }

    /* Highlighted text injected by the backend as <mark>…</mark> */
    mark {
      background-color: rgba(255, 214, 0, 0.25);
      color: inherit;
      border-radius: 2px;
      padding: 0 2px;
    }
  }
`;
