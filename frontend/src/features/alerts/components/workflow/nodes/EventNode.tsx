import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { CIRCLE_HANDLE_STYLE, HIDDEN_HANDLE_STYLE } from '../../../../../constants/workflow';
import { EventNodeRoot } from './EventNode.styles';

interface EventNodeData extends Record<string, unknown> {
  label?: string;
  /** Number of bottom (source) handles to spread. Injected by the adapter. */
  bottomHandleCount?: number;
}

const handleLeft = (i: number, n: number) => `${((i + 1) * 100) / (n + 1)}%`;

/**
 * Event trigger node — rendered inside the React Flow canvas at the very top
 * of the pipeline graph.  Styled with the purple eventBorder to distinguish it
 * from regular agent nodes.
 */
const EventNode = ({ data }: NodeProps) => {
  const { label = 'Event', bottomHandleCount = 1 } = data as EventNodeData;

  return (
    <EventNodeRoot>
      {/* Invisible top handle so edges can target this node if needed */}
      <Handle id="top" type="target" position={Position.Top} style={HIDDEN_HANDLE_STYLE} />

      {label}

      {/* Bottom source handles — spread evenly for fan-out */}
      {Array.from({ length: bottomHandleCount }, (_, i) => (
        <Handle
          key={`bottom-${i}`}
          id={bottomHandleCount === 1 ? 'bottom' : `bottom-${i}`}
          type="source"
          position={Position.Bottom}
          style={{ ...CIRCLE_HANDLE_STYLE, left: handleLeft(i, bottomHandleCount) }}
        />
      ))}
    </EventNodeRoot>
  );
};

export default memo(EventNode);
