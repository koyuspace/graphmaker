/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/prop-types */
import React from 'react';

export default ({
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  connectionLineType,
  connectionLineStyle,
}) => {
  return (
    <g>
      <path
        fill="none"
        stroke="#222"
        strokeWidth={4}
        className="animated"
        d={`M${sourceX},${sourceY} C ${sourceX} ${targetY} ${sourceX} ${targetY} ${targetX},${targetY}`}
      />
      <circle
        cx={targetX}
        cy={targetY}
        fill="#fff"
        r={3}
        stroke="#222"
        strokeWidth={4}
      />
    </g>
  );
};
