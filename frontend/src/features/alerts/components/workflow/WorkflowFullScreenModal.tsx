import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ReactFlowProvider, type NodeTypes, type EdgeTypes, type Node, type Edge } from '@xyflow/react';
import RelationshipFlowCanvas from '../../../../components/graphs/RelationshipFlowCanvas';
import { WorkflowRelationshipHeaderIcon, CloseIcon } from '../../../../icons';
import {
  FullScreenOverlay,
  FullScreenContainer,
  FullScreenHeader,
  FullScreenTitleGroup,
  FullScreenTitle,
  FullScreenCloseButton,
  FullScreenCanvasWrapper,
  FullScreenLogoImage,
} from './WorkflowFullScreenModal.styles';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface WorkflowFullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Node[];
  edges: Edge[];
  nodeTypes: NodeTypes;
  edgeTypes: EdgeTypes;
}

// ─── Component ─────────────────────────────────────────────────────────────────

const WorkflowFullScreenModal: React.FC<WorkflowFullScreenModalProps> = ({
  isOpen,
  onClose,
  nodes,
  edges,
  nodeTypes,
  edgeTypes,
}) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return createPortal(
    <FullScreenOverlay role="dialog" aria-modal="true" aria-label="Relationship graph full screen">
      <FullScreenContainer>
        <FullScreenHeader>
          <FullScreenTitleGroup>
            <WorkflowRelationshipHeaderIcon />
            <FullScreenTitle>Relationships</FullScreenTitle>
            <FullScreenLogoImage src="/apache.webp" alt="" aria-hidden="true" />
          </FullScreenTitleGroup>
          <FullScreenCloseButton type="button" onClick={onClose} aria-label="Close full screen">
            <CloseIcon width={20} height={20} />
          </FullScreenCloseButton>
        </FullScreenHeader>
        <FullScreenCanvasWrapper>
          <ReactFlowProvider>
            <RelationshipFlowCanvas
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              showControls
              onCollapse={onClose}
              fitPadding={0.05}
              zoomSteps={1}
            />
          </ReactFlowProvider>
        </FullScreenCanvasWrapper>
      </FullScreenContainer>
    </FullScreenOverlay>,
    document.body,
  );
};

export default WorkflowFullScreenModal;
