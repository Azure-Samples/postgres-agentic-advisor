import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { HIDDEN_HANDLE_STYLE } from '../../../../../constants/workflow';

interface SpacerData extends Record<string, unknown> {
  bottomHandleCount?: number;
}

/** Resolve handle id matching the convention used everywhere else in the pipeline */
const resolveId = (idx: number, count: number) => (count === 1 ? 'bottom' : `bottom-${idx}`);

/**
 * Invisible 1×1 layout spacer. When `data.bottomHandleCount` is provided
 * it renders that many hidden source handles so edges can connect to it.
 */
const LayoutSpacerNode = ({ data }: { data?: SpacerData }) => {
  const count = (data as SpacerData)?.bottomHandleCount ?? 0;
  return (
    <div aria-hidden="true" style={{ width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}>
      {Array.from({ length: count }, (_, i) => (
        <Handle key={i} id={resolveId(i, count)} type="source" position={Position.Bottom} style={HIDDEN_HANDLE_STYLE} />
      ))}
    </div>
  );
};

export default memo(LayoutSpacerNode);
