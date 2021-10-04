import React, {useState, useEffect, useCallback, useRef, createRef} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import datum from './data/matrixs50_5.json'
import * as d3 from 'd3'; 
import NetV, { node } from "netv";

/**CALCULATORS
 * calculate props of graph
 */

const range = (start, end) => {
  return new Array(end - start).fill(start).map((el, i) => start + i);
}

const calNodeLink = (record, shape, colorMap) => {
  let nodes = [];
  let nodeprops = [];
  record.map((d, idx) => {
    if (d !== 0)
      nodes.push({'index': idx});
  })
  let nodepos = JSON.parse(JSON.stringify(nodes));
  d3.forceSimulation(nodepos)
    .force('charge', d3.forceManyBody().strength(-1000))   
    .force('center', d3.forceCenter(shape.width / 2, shape.height / 2));
  nodepos.map((d, idx) => {

    let tmp = { 
      id: nodes[idx].index, 
      x: d.x + shape.width / 2, 
      y: d.y + shape.height / 2, 
      style: {
        fill: colorMap[`${record[nodes[idx].index]}`],
        r: 5
      },
    };
    nodeprops.push(tmp)
  });

  return nodeprops;
}

const GraphRender = (props) => {
  let sid = -1;
  const shape = {width: 400, height: 400};
  const graphs = datum.matrix;
  const num = graphs[0].nodes;
  const len = graphs.length;
  const colorMap = {
    '-1': { r: 0, g: 250, b: 154, a: 0.9 },
    '1': { r: 255, g: 0, b: 0, a: 0.9 },
    '2': { r: 255, g: 69, b: 0, a: 0.9 }
  };
  
  useEffect(
    () => {
      let nodeprops;
      let lastrecord = new Array(num);
      let record = new Array(num).fill(0);  // -1: disappear, 1: current, 2: appear
      let div = document.getElementById('maindiv');
      let netv = new NetV({ container: div });
      let intervalId = setInterval(
        () => {
          sid = (sid + 1) % len;
          for (let i = 0; i < num; i++) 
            lastrecord[i] = record[i];
          record.fill(0);
          graphs[sid].link.map(d => {
            record[d.target] = 1;
            record[d.source] = 1;
          })
          for (let i = 0; i < num; i++) {
            if (lastrecord[i] > 0 && record[i] === 0)
              record[i] = -1;
            else if (lastrecord[i] <= 0 && record[i] === 1)
              record[i] = 2;
          }
          nodeprops = calNodeLink(record, shape, colorMap);
          // console.log(record);
          netv.wipe();
          netv.addNodes(nodeprops);
          netv.addLinks(graphs[sid].link)
          netv.draw();
        }, 
        2000
      );
      return () => {
        clearInterval(intervalId);
        intervalId = null;
      }
    }, []
  )
  console.log(sid);

  return (
    <div id='maindiv'>
      
    </div>
  );
}

ReactDOM.render(
  // <React.StrictMode>
  //   <App />
  // </React.StrictMode>,
  <GraphRender/>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
