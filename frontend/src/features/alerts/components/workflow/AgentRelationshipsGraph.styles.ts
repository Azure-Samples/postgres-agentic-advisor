import styled from 'styled-components';

export const RelationshipCanvasWrapper = styled.div`
  width: 100%;
  height: 460px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.workflow.relationshipCanvasBg};

  /* Ensure HTML node elements always paint above SVG edge paths so a node
     sitting in the middle of an edge route is never "cut through" by the line. */
  .react-flow__edges {
    z-index: 0;
  }
  .react-flow__nodes {
    z-index: 1;
  }
`;

/** Shown in place of the canvas when an agent has no relationship data */
export const EmptyRelationshipOverlay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.disabledText};
`;
