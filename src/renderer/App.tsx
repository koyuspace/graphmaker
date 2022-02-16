import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  removeElements,
  Controls,
  addEdge,
  updateEdge,
  Elements,
  Connection,
  Edge,
  OnLoadParams,
  Handle,
  Position,
} from 'react-flow-renderer';

import Buttons from './Buttons';

import './App.css';

const initialElements: Elements = [
  {
    id: '1',
    data: { label: 'Node 1' },
    position: { x: 100, y: 100 },
    type: 'special',
  },
  {
    id: '2',
    data: { label: 'Node 2' },
    position: { x: 100, y: 200 },
    type: 'special',
  },
  { id: 'e1-2', source: '1', target: '2' },
];

const customNodeStyles = {
  background: '#aaa',
  color: '#333',
  border: '2px solid #333',
  padding: 10,
  borderRadius: '4px',
};

const CustomNodeComponent = ({ data }) => {
  return (
    <div style={customNodeStyles}>
      <Handle
        type="target"
        position={Position.Left}
        id="a"
        style={{ top: '30%', borderRadius: 0 }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="b"
        style={{ top: '70%', borderRadius: 0 }}
      />
      <div>{data.label}</div>
      <Handle
        type="source"
        position={Position.Right}
        id="c"
        style={{ top: '30%', borderRadius: 0 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="c"
        style={{ top: '70%', borderRadius: 0 }}
      />
    </div>
  );
};

const nodeTypes = {
  special: CustomNodeComponent,
};

const GraphMaker = () => {
  const [rfInstance, setRfInstance] = useState<OnLoadParams>();
  const [elements, setElements] = useState<Elements>(initialElements);
  const onElementsRemove = (elementsToRemove: Elements) =>
    setElements((els) => removeElements(elementsToRemove, els));
  const onConnect = (params: Connection | Edge) =>
    setElements((els) => addEdge(params, els));
  const onEdgeUpdate = (oldEdge, newConnection) =>
    setElements((els) => updateEdge(oldEdge, newConnection, els));

  return (
    <ReactFlowProvider>
      <ReactFlow
        elements={elements}
        onElementsRemove={onElementsRemove}
        onConnect={onConnect}
        onLoad={setRfInstance}
        onEdgeUpdate={onEdgeUpdate}
        style={{ height: '100vh' }}
        nodeTypes={nodeTypes}
      >
        <Controls />
        <Buttons rfInstance={rfInstance} setElements={setElements} />
      </ReactFlow>
    </ReactFlowProvider>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GraphMaker />} />
      </Routes>
    </Router>
  );
}
