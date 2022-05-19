/* eslint-disable prefer-destructuring */
/* eslint-disable no-lone-blocks */
/* eslint-disable promise/no-nesting */
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
import { strings } from './Locales';

const electron = require('electron');

let isEdeka = false;
fetch(
  'http://wso2no-lb01.nord-gh.edekanet.de:8380/express_gateway/alm/markets/getLunarStatus?_=1652952720487'
)
  .then(() => {
    {
      isEdeka = true;
    }
  })
  .catch(() => {});

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
    const restoreFlow = () => {
      try {
        const flow: FlowExportObject | null = JSON.parse($('#flowdata').html()); // Don't question it, I already lost my sanity with IPC

        if (flow) {
          const [x = 0, y = 0] = flow.position;
          setElements(flow.elements || []);
          transform({ x, y, zoom: flow.zoom || 0 });
        }
      } catch (e) {}
    };

    restoreFlow();
  }, [setElements, transform]);

  const onOpen = () => {
    ipc.send('run-open-dialog');
  };

  ipc.on('restore-flow', function (event, arg) {
    // This somehow executes onRestore() multiple times, I hope this won't cause any problems
    $('#flowdata').html(arg);
    onRestore();
  });

  const convertShapes = (shape) => {
    if (shape === 'x') {
      return { text: 'X', color: '#3867d6' };
      // eslint-disable-next-line no-else-return
    } else if (shape === 'l') {
      return { text: 'L', color: '#0fb9b1' };
    } else if (shape === 'y') {
      return { text: 'Y', color: '#f7b731' };
    } else if (shape === 'triangle') {
      return { text: '▲', color: '#8854d0' };
    } else if (shape === 'square') {
      return { text: '◼', color: '#26de81' };
    } else if (shape === 'circle') {
      return { text: '●', color: '#eb3b5a' };
    } else {
      return { text: '', color: '#fff' };
    }
  };

  const onAbout = useCallback(() => {
    let abouttext = strings.abouttext;
    if (isEdeka) {
      abouttext = strings.abouttext_edeka;
    }
    smalltalk.alert('', abouttext.replaceAll('%%version%%', '1.2.2'), '', {
      buttons: {
        ok: strings.ok,
      },
    });
  }, [setElements]);

  const onAdd = useCallback(() => {
    smalltalk
      .prompt('', strings.nodeValue, '', {
        buttons: {
          ok: strings.next,
          cancel: strings.cancel,
        },
      })
      .then((val1: any) => {
        smalltalk
          .prompt('', strings.nodeShape, '', {
            type: 'shapes',
            buttons: { ok: strings.ok, cancel: strings.abort },
          })
          // eslint-disable-next-line promise/always-return
          .then((val2: string) => {
            const newNode = {
              id: `random_node-${getNodeId()}`,
              data: {
                label: val1,
                styles: {
                  background: convertShapes(val2).color,
                  color: '#333',
                  border: '2px solid #333',
                  padding: 10,
                  borderRadius: '4px',
                },
              },
              type: 'special',
              position: {
                x: Math.random() * window.innerWidth - 100,
                y: Math.random() * window.innerHeight,
              },
            };
            setElements((els) => els.concat(newNode));
          });
      })
      .catch(() => {}); // Why does this library require such a hacky thing?
  }, [setElements]);

  return (
    <div className="save__controls">
      <button onClick={onSave}>{strings.save}</button>
      <button onClick={onOpen}>{strings.open}</button>
      {/* <button onClick={window.print}>{strings.print}</button> */}
      <button onClick={onAdd}>{strings.addNode}</button>
      <button onClick={onAbout}>{strings.about}</button>
      <div id="flowdata" style={{ display: 'none' }} />
    </div>
  );
};

export default memo(Buttons);
