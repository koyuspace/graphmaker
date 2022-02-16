/* eslint-disable react/button-has-type */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/require-default-props */
/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
import React, { memo, useCallback, Dispatch, FC } from 'react';
import {
  useZoomPanHelper,
  OnLoadParams,
  Elements,
  FlowExportObject,
} from 'react-flow-renderer';
import $ from 'jquery';

import smalltalk from 'smalltalk';

const electron = require('electron');
// eslint-disable-next-line prefer-destructuring
const ipc = electron.ipcRenderer;

const getNodeId = () => `randomnode_${+new Date()}`;

type ButtonsProps = {
  rfInstance?: OnLoadParams;
  setElements: Dispatch<React.SetStateAction<Elements<any>>>;
};

window.setInterval(function () {
  $('[id^="random_input-"]').on('blur', function () {
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
      ipc.send('run-save-dialog', JSON.stringify(flow));
    }
  }, [rfInstance]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      $.getJSON(
        'http://localhost:3290/get/b5faba27846c3bcd3164b16700d93e76',
        function (data) {
          const flow: FlowExportObject | null = data;

          if (flow) {
            const [x = 0, y = 0] = flow.position;
            setElements(flow.elements || []);
            transform({ x, y, zoom: flow.zoom || 0 });
          }
        }
      );
    };

    restoreFlow();
  }, [setElements, transform]);

  const onAdd = useCallback(() => {
    smalltalk.prompt('Question', 'Enter node value', '').then((value: any) => {
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

  onRestore();

  return (
    <div className="save__controls">
      <button onClick={onSave}>save</button>
      <button onClick={onAdd}>add node</button>
    </div>
  );
};

export default memo(Buttons);
