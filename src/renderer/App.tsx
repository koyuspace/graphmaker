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

import smalltalk from 'smalltalk';

import Buttons from './Buttons';
import ConnectionLine from './ConnectionLine';

import './App.css';
import { strings } from './Locales';

const initialElements: Elements = [];

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
        style={{
          top: '30%',
          borderRadius: 0,
          height: '22px',
          width: '22px',
          backgroundColor: '#027abf',
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="b"
        style={{
          top: '70%',
          borderRadius: 0,
          height: '22px',
          width: '22px',
          color: 'blue',
          backgroundColor: '#027abf',
        }}
      />
      <div
        style={{
          width: '100px',
          height: '42px',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '24pt',
          verticalAlign: 'middle',
          fontFamily: 'Arial',
        }}
      >
        {data.label}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="c"
        style={{
          top: '30%',
          borderRadius: 0,
          height: '22px',
          width: '22px',
          backgroundColor: '#ffe300',
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="c"
        style={{
          top: '70%',
          borderRadius: 0,
          height: '22px',
          width: '22px',
          backgroundColor: '#ffe300',
        }}
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
  const convertShapes = (shape) => {
    if (shape === 'x') {
      return { text: 'X', color: '#0000ff' };
      // eslint-disable-next-line no-else-return
    } else if (shape === 'l') {
      return { text: 'L', color: '#ff00ff' };
    } else if (shape === 'y') {
      return { text: 'Y', color: '#ffff00' };
    } else if (shape === 'triangle') {
      return { text: '▲', color: '#8000ff' };
    } else if (shape === 'square') {
      return { text: '◼', color: '#00ff00' };
    } else if (shape === 'circle') {
      return { text: '●', color: '#ff0000' };
    } else {
      return { text: '', color: '#fff' };
    }
  };
  const onConnect = (params: Connection | Edge) => {
    smalltalk
      .prompt('', strings.edgeValueDialog, '', {
        type: 'shapes',
        buttons: { ok: strings.next, cancel: strings.abort },
      })
      // eslint-disable-next-line promise/always-return
      .then((val1: string) => {
        // eslint-disable-next-line promise/no-nesting
        smalltalk
          .prompt('', strings.edgeColorDialog, '', {
            type: 'color',
            buttons: { ok: strings.ok, cancel: strings.abort },
          })
          // eslint-disable-next-line promise/always-return
          .then((val2: string) => {
            setElements((els) =>
              addEdge(
                {
                  ...params,
                  animated: true,
                  label: convertShapes(val1).text,
                  labelStyle: {
                    fontSize: '24pt',
                    fontWeight: 'bold',
                    fontFamily: 'Arial',
                    fill: convertShapes(val1).color,
                  },
                  labelBgPadding: [8, 4],
                  labelBgBorderRadius: 4,
                  labelBgStyle: {
                    fill: '#fff',
                    color: '#fff',
                    fillOpacity: 1,
                  },
                  style: { stroke: val2, strokeWidth: 4 },
                },
                els
              )
            );
          })
          .catch(() => {});
      })
      .catch(() => {});
  };
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
        connectionLineComponent={ConnectionLine}
      >
        <Controls />
        <Buttons rfInstance={rfInstance} setElements={setElements} />
      </ReactFlow>
    </ReactFlowProvider>
  );
};

export default function App() {
  return (
    <div>
      <header id="titlebar">
        <div id="drag-region" />
      </header>
      <Router>
        <Routes>
          <Route path="/" element={<GraphMaker />} />
        </Routes>
      </Router>
    </div>
  );
}
