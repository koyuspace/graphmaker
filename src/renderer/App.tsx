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
} from 'react-flow-renderer';

import Buttons from './Buttons';

import './App.css';

const initialElements: Elements = [
  {
    id: '1',
    data: { label: 'Node 1' },
    position: { x: 100, y: 100 },
  },
  {
    id: '2',
    data: { label: 'Node 2' },
    position: { x: 100, y: 200 },
  },
  { id: 'e1-2', source: '1', target: '2' },
];

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
