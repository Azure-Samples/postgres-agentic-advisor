import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { HIDDEN_HANDLE_STYLE } from '../../../../../constants/workflow';

/**
 * Invisible junction node used to create clean fan-out and fan-in routing.
 * Acts as a waypoint so edges split/merge at a single point instead of all
 * starting or ending on the same handle of a real node.
 */
const BusNode = (_props: NodeProps) => (
  <div aria-hidden="true" style={{ width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}>
    <Handle id="top" type="target" position={Position.Top} style={HIDDEN_HANDLE_STYLE} />
    <Handle id="bottom" type="source" position={Position.Bottom} style={HIDDEN_HANDLE_STYLE} />
  </div>
);

export default memo(BusNode);
