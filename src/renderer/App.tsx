/* eslint-disable promise/no-nesting */
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

import { SmartEdge } from '@tisoap/react-flow-smart-edge';
import $ from 'jquery';
import Buttons from './Buttons';
import ConnectionLine from './ConnectionLine';

import './App.css';
import { strings } from './Locales';

import icon from '../../assets/icon.png';

window.setInterval(function() {
  $('.appicon').attr('src', icon);
});

const initialElements: Elements = [];

const CustomNodeComponent = ({ data }) => {
  return (
    <div className="node" style={data.styles}>
      <Handle
        type="target"
        position={Position.Left}
        id="a"
        style={{
          top: '30%',
          borderRadius: '50%',
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
          borderRadius: '50%',
          height: '22px',
          width: '22px',
          color: 'blue',
          backgroundColor: '#027abf',
        }}
      />
      <div
        style={{
          width: '200px',
          height: '42px',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '18pt',
          verticalAlign: 'middle',
          fontFamily: 'Arial',
          wordWrap: 'break-word',
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
        id="d"
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

const edgeTypes = {
  smart: SmartEdge,
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
        // eslint-disable-next-line promise/catch-or-return
        smalltalk
          .prompt('', strings.edgeLabelDialog, '', {
            type: 'text',
            buttons: { ok: strings.ok, cancel: strings.abort },
          })
          // eslint-disable-next-line promise/always-return
          .then((val3: string) => {
            setElements((els) =>
              addEdge(
                {
                  ...params,
                  animated: true,
                  label: `${convertShapes(val1).text} ${val3}`,
                  labelStyle: {
                    fontSize: '18pt',
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
                  type: 'smart',
                  style: { stroke: convertShapes(val1).color, strokeWidth: 4 },
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
        edgeTypes={edgeTypes}
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
    <Router>
      <Routes>
        <Route path="/" element={<GraphMaker />} />
      </Routes>
    </Router>
  );
}
