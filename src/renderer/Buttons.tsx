/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
import React, { memo, useCallback, Dispatch, FC } from 'react';
import {
  useZoomPanHelper,
  OnLoadParams,
  Elements,
  FlowExportObject,
} from 'react-flow-renderer';
import localforage from 'localforage';
import $ from 'jquery';

const smalltalk = require('smalltalk');

localforage.config({
  name: 'react-flow',
  storeName: 'flows',
});

const flowKey = 'flow';

const getNodeId = () => `randomnode_${+new Date()}`;

type ButtonsProps = {
  rfInstance?: OnLoadParams;
  setElements: Dispatch<React.SetStateAction<Elements<any>>>;
};

window.setInterval(function () {
  $('[id^="random_input-"]').blur(function () {
    const val = this.value;
    const theid = this.id.replace('random_input-', '');
    $(`#random_node-${theid}`).html(val);
  });
});

const Buttons: FC<ButtonsProps> = ({ rfInstance, setElements }) => {
  const { transform } = useZoomPanHelper();

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      console.log(flow);
    }
  }, [rfInstance]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      /* const flow: FlowExportObject | null = await localforage.getItem(flowKey);

      if (flow) {
        const [x = 0, y = 0] = flow.position;
        setElements(flow.elements || []);
        transform({ x, y, zoom: flow.zoom || 0 });
      } */
      console.log('WIP');
    };

    restoreFlow();
  }, [setElements, transform]);

  const onAdd = useCallback(() => {
    smalltalk.prompt('Question', 'Enter node value', '').then((value) => {
      const newNode = {
        id: `random_node-${getNodeId()}`,
        data: {
          label: value,
        },
        position: {
          x: Math.random() * window.innerWidth - 100,
          y: Math.random() * window.innerHeight,
        },
      };
      setElements((els) => els.concat(newNode));
    });
  }, [setElements]);

  return (
    <div className="save__controls">
      <button onClick={onSave}>save</button>
      <button onClick={onRestore}>restore</button>
      <button onClick={onAdd}>add node</button>
    </div>
  );
};

export default memo(Buttons);
