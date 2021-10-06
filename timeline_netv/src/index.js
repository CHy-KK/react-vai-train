import React, {lazy, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import datum50_5 from './data/matrixs50_5.json'
import datum15_5 from './data/matrixs15_5.json'
import * as d3 from 'd3'; 
import NetV, { link, node, nodeLimit, width } from "netv";

/**CALCULATORS
 * calculate props of graph
 */
function calNodeLink(netv, graphs, num, leng) {
  const shape = {width: 200, height: 200};
  let nodeprops, linkprops;
  let lastrecord = new Array(num);
  let record = new Array(num).fill(0);  // -1: disappear, 1: current, 2: appear
  let stay = new Array(num).fill(0);
  const colorMap = {
    '-1': { r: 0, g: 250, b: 154, a: 0.9 },
    '1': { r: 255, g: 0, b: 0, a: 0.9 },
    '2': { r: 255, g: 69, b: 0, a: 0.9 }
  };
  // calculate the position of node and links
  const calprops = (sid, links, record, shape, colorMap) => {
    let nodes = [];
    let nodeprops = [];
    let linkprops = [];
    record.map((d, idx) => {
      if (d !== 0)
        nodes.push({'index': idx});
    })
    let nodepos = JSON.parse(JSON.stringify(nodes));
    d3.forceSimulation(nodepos)
      .force('charge', d3.forceManyBody().strength(-1000))   
      .force('center', d3.forceCenter(shape.width / 2, shape.height / 2));
    nodepos.map((d, idx) => {
      nodeprops.push({ 
        id: sid + '-' + nodes[idx].index,
        x: d.x + shape.width / 2 + sid * 200, 
        y: d.y + shape.height / 2, 
        style: {
          fill: colorMap[`${record[nodes[idx].index]}`],
          r: 5,
        },
      });
    });
  
    links.map(d => {
      linkprops.push({
        source: sid + '-' + d.source,
        target: sid + '-' + d.target,
      });
    })
    return [nodeprops, linkprops];
  }

  for (let sid = 0; sid < leng; sid++) {
    for (let i = 0; i < num; i++)
      lastrecord[i] = record[i];
    record.fill(0);
    graphs[sid].link.map(d => {
      record[d.target] = 1;
      record[d.source] = 1;
    })
    if (sid == 0)
      stay = JSON.parse(JSON.stringify(record))
    for (let i = 0; i < num; i++) {
      if (lastrecord[i] > 0 && record[i] === 0) {
        record[i] = -1;
        stay[i] = 0
      }
      else if (lastrecord[i] <= 0 && record[i] === 1)
        record[i] = 2;
    }
    [nodeprops, linkprops] = calprops(sid, graphs[sid].link, record, shape, colorMap);
    // console.log(nodeprops, linkprops)
    netv.addNodes(nodeprops);
    netv.addLinks(linkprops);
  }
  let link2stay = []
  stay.map((d, idx) => {
    if (d == 1) {
      for (let sid = 0; sid < leng - 1; sid++) {
        link2stay.push({
          source: sid + '-' + idx, 
          target: (sid + 1) + '-' + idx,
          style: {
            strokeWidth: 0.5  ,
            strokeColor: {r: 255, g: 0, b: 0, a: 0.5},
            shape: 'curve'
          } 
        });
      }
    }
  });
  netv.addLinks(link2stay);
}

function calBipartite(netv, graphs, num, leng) {
  let nodeprops = []; 
  let linkprops = [];
  let nodes = new Array(num).fill(0);
  let leftnodes = new Array(num).fill(0);
  let sid = 0;
  const padding = {left: 50, top: 50};
  const yScale = d3.scaleLinear()
    .domain([0, num])
    .range([padding.top, 10 * num + padding.top]);
  for (; sid < leng; sid++) {
    leftnodes = JSON.parse(JSON.stringify(nodes))
    nodes.fill(0);
    graphs[sid].link.map(d => {
      leftnodes[d.source] = 1;
      nodes[d.target] = 1;
      linkprops.push({
        source: sid + '-' + d.source,
        target: (sid + 1) + '-' + d.target,
      });
    });
    leftnodes.map((d, idx) => {
      nodeprops.push({
        id: sid + '-' + idx,
        x: (sid + 1) * padding.left,
        y: yScale(idx),
        style: {
          shape: 'rect',  
          fill: {r: 0, g: 191, b: 255, a: d},
          width: 8,
          height: 8,
        },
      })
    });
  }
  nodes.map((d, idx) => {
    nodeprops.push({
      id: sid + '-' + idx,
      x: (sid + 1) * padding.left,
      y: yScale(idx),
      style: {
        shape: 'rect',  
        fill: {r: 0, g: 191, b: 255, a: d},
        width: 8,
        height: 8,
      },
    })
  });
  netv.addNodes(nodeprops);
  netv.addLinks(linkprops);
}

const JuxtMatrix = (props) => {
  const graphs = props.graphs;
  const num = props.num;
  const leng = props.leng;
  const padding = {left: 50, top: 50};
  const block = 15;
  const width = block * (num + 2);
  const xyScale = d3.scaleLinear()
    .domain([0, num + 2])
    .range([0, width]);
  const xValue = (x, y, angle) => x * Math.cos(angle * Math.PI / 180) - y * Math.sin(angle * Math.PI / 180);  // angle = angle
  const yValue = (x, y, angle) => x * Math.sin(angle * Math.PI / 180) + y * Math.cos(angle * Math.PI / 180);
  let lineprops = [];
  let nodeprops = [];
  for (let sid = 0; sid < leng; sid++) {
    const angle = sid % 2 ? -135 : 45;
    const xOffset = width * (sid + 1) + padding.left;
    const yOffset = (sid % 2 ? width / Math.sqrt(2) + block : 0) + padding.top;
    const links = graphs[sid].link;
    console.log(sid + '-------------------------------------')
    links.map((d, idx) => {
      console.log(d.target, d.source)
      nodeprops.push({
        id: sid + '-node-' + idx,
        // x: xValue(xyScale(Math.min(d.target, d.source)) + block * 1.5, xyScale(num + 1 - Math.max(d.target, d.source)) - block / 2, angle) + xOffset,
        // y: yValue(xyScale(Math.min(d.target, d.source)) + block * 1.5, xyScale(num + 1 - Math.max(d.target, d.source)) - block / 2, angle) + yOffset,
        x: xyScale(Math.min(d.target, d.source)) + block * 1.5 + xOffset,
        y: xyScale(num + 1 - Math.max(d.target, d.source)) - block / 2,
        r: block / 2 - 1
      })
    })
    for (let i = 0; i <= num; i++) {
      lineprops.push({
        id: sid + '-row-' + i,
        // x1: xValue(0, xyScale(i + 1), angle) + xOffset,
        // y1: yValue(0, xyScale(i + 1), angle) + yOffset,
        // x2: xValue(xyScale(num + 2 - i), xyScale(i + 1), angle) + xOffset,
        // y2: yValue(xyScale(num + 2 - i), xyScale(i + 1), angle)+ yOffset,
        x1: 0 + xOffset,
        y1: xyScale(i + 1),
        x2: xyScale(num + 2 - i) + xOffset,
        y2: xyScale(i + 1),
        stroke: 'rgb(0, 191, 255)',
        strokeWidth: 1,
        transform: {}
      });
      lineprops.push({
        id: sid + '-col-' + i,
        // x1: xValue(xyScale(i + 1), 0, angle) + xOffset,
        // y1: yValue(xyScale(i + 1), 0, angle) + yOffset,
        // x2: xValue(xyScale(i + 1), xyScale(num + 2 - i), angle) + xOffset,
        // y2: yValue(xyScale(i + 1), xyScale(num + 2 - i), angle) + yOffset,
        x1: xyScale(i + 1) + xOffset,
        y1: 0,
        x2: xyScale(i + 1) + xOffset,
        y2: xyScale(num + 2 - i),
        stroke: 'rgb(0, 191, 255)',
        strokeWidth: 1,
        
      });
    }
  }
  console.log(nodeprops);
  return (
    <svg width={2000} height={1000}>
      <p>This is Juxtposed Matrix</p>
      {lineprops.map(d => (<line key={d.id} x1={d.x1} y1={d.y1} x2={d.x2} y2={d.y2} stroke={d.stroke} strokeWidth={d.strokeWidth} transform={d.transform}></line>))}
      {/* {nodeprops.map(d => (<circle key={d.id} cx={d.x} cy={d.y} r={d.r}></circle>))} */}
    </svg>
  );
  
}


const GraphRender = (props) => {
  const graphs = props.datum.matrix;
  const num = graphs[0].nodes;
  const leng = graphs.length;
  
  const divRef = useRef();
  
  useEffect(
    () => {      
      // let div = document.getElementById('maindiv');
      let div = divRef.current;
      let netv = new NetV({ 
        container: div,
        nodeLimit: 1000,
        linkLimit: 3000,
        width: 2000
      });
      if (props.graphLayout === 'nodelink')
        calNodeLink(netv, graphs, num, leng);
      else if (props.graphLayout === 'bipartite')
        calBipartite(netv, graphs, num, leng);
        
     
      netv.on('zoom', () => { });
      netv.on('pan', () => { });
      netv.draw();
      // 这里wipe了就没法缩放和移动了
      // return netv.wipe();
    }, []
  )

  return (
    <div id='maindiv' ref={divRef}>
      {props.graphLayout === 'juxtMatrix' && <JuxtMatrix num={num} leng={leng} graphs={graphs} />}
    </div>
  );
}

const Graph = () => {
  // nodelink / matrix / bipartite / juxtMatrix
  let graphLayout = 'juxtMatrix'; 

  return <GraphRender graphLayout={graphLayout} datum={datum15_5} />
}

ReactDOM.render(
  // <React.StrictMode>
  //   <App />
  // </React.StrictMode>,
  <Graph/>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
