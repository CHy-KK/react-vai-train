import React, {useCallback, useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './mydiv.css'
import reportWebVitals from './reportWebVitals';
import datum50_5 from './data/matrixs50_5.json'
import datum15_5 from './data/matrixs15_5.json'
import * as d3 from 'd3'; 
import NetV, { height, link, node, nodeLimit, width } from "netv";
import { JsonInputArea } from './JsonInput';


/**CALCULATORS
 * calculate props of graph
 */
function NodeLink(netv, graphs, num, leng) {
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

function Bipartite(netv, graphs, num, leng) {
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
  let recordS = new Array(num).fill(0);
  let recordT = new Array(num).fill(0);
  for (let sid = 0; sid < leng; sid++) {
    const angle = sid % 2 ? -135 : 45;
    const xOffset = width * (sid + 1) + padding.left;
    const yOffset = (sid % 2 ? width / Math.sqrt(2) + block : 0) + padding.top;
    const links = graphs[sid].link;
    const lastRecordT = JSON.parse(JSON.stringify(recordT));
    const lastRecordS = JSON.parse(JSON.stringify(recordS));
    recordS.fill(0);
    recordT.fill(0);
    links.map((d, idx) => {
      recordS[sid % 2 ? Math.min(d.target, d.source) : Math.max(d.target, d.source)] = 1;
      recordT[sid % 2 ? Math.max(d.target, d.source) : Math.min(d.target, d.source)] = 1;
      nodeprops.push({
        id: sid + '-node-' + idx,
        // (1 - 0.7) / 2 = 0.15
        x: xyScale(sid % 2 ? num + 1 - Math.max(d.target, d.source) : Math.min(d.target, d.source)) + (sid % 2 ? - block * 0.85 : block * 1.15),  
        y: xyScale( sid % 2 ? Math.min(d.target, d.source) : num + 1 - Math.max(d.target, d.source)) - (sid % 2 ? - block * 1.15 : block * 0.85), 
        width: block * 0.7,
        height: block * 0.7,
        fill: 'rgb(70, 130, 180)',
        transform: `translate(${xOffset}, ${yOffset}), rotate(${angle})`,
      })
    });
    recordS.map((d, idx) => {
      nodeprops.push({
        id: sid + '-source-' + idx,
        x: 0 + (sid % 2 ? block * 0.5 : block * 0.5),
        y: xyScale(sid % 2 ? idx : num + 1 - idx) - (sid % 2 ? - block * 1.5 : block * 0.5),
        r: block * 0.425,
        fill: `rgba(112, 128, 144, ${d * 0.8 + 0.15})`,
        transform: `translate(${xOffset}, ${yOffset}), rotate(${angle})`,
      })
    });
    recordT.map((d, idx) => {
      nodeprops.push({
        id: sid + '-target-' + idx,
        x: xyScale( sid % 2 ? num + 1 - idx : idx) + (sid % 2 ? - block * 0.5 : block * 1.5),
        y: 0 + (sid % 2 ? block * 0.5 : block * 0.5),
        r: block * 0.425,
        fill: `rgba(112, 128, 144, ${d * 0.8 + 0.15})`,
        transform: `translate(${xOffset}, ${yOffset}), rotate(${angle})`,
      })
    });
    if (sid > 0) {
      for (let i = 0; i < num; i++) {
        if (sid % 2) {
          if (lastRecordT[i] === recordT[i] && recordT[i] === 1) {
            const sourceX = xValue(xyScale(i + 1) + block * 0.5, 0 + block * 0.5, (sid - 1) % 2 ? -135 : 45) + width * sid + padding.left;
            const sourceY = yValue(xyScale(i + 1) + block * 0.5, 0 + block * 0.5, (sid - 1) % 2 ? -135 : 45) + ((sid - 1) % 2 ? width / Math.sqrt(2) + block : 0) + padding.top;
            const targetX = xValue(xyScale(num + 1 - i) - block * 0.5, block * 0.5, angle) + xOffset;
            const targetY = yValue(xyScale(num + 1 - i) - block * 0.5, block * 0.5, angle) + yOffset;
            lineprops.push({
              id: (sid - 1) + '-' + sid + '-' + i,
              d: `M ${sourceX} 
                    ${sourceY} 
                  C ${sourceX + (targetX - sourceX) * 0.33} 
                    ${sourceY - block}
                  , ${sourceX + (targetX - sourceX) * 0.66} 
                    ${sourceY + block}
                  , ${targetX} 
                    ${targetY}`,
              fill: 'none',
              stroke: 'rgb(0, 191, 255)',
              strokeWidth: 1,
            });
            
          }
        }
        else {
          if (lastRecordS[i] === recordS[i] && recordS[i] === 1) {
            const sourceX = xValue(0 + block * 0.5, xyScale(num + 1 - i) - block * 0.5, (sid - 1) % 2 ? -135 : 45) + width * sid + padding.left;
            const sourceY = yValue(0 + block * 0.5, xyScale(num + 1 - i) - block * 0.5, (sid - 1) % 2 ? -135 : 45) + ((sid - 1) % 2 ? width / Math.sqrt(2) + block : 0) + padding.top;
            const targetX = xValue(0 + block * 0.5, xyScale(i + 1) + block * 0.5, angle) + xOffset;
            const targetY = yValue(0 + block * 0.5, xyScale(i + 1) + block * 0.5, angle) + yOffset;
            lineprops.push({
              id: (sid - 1) + '-' + sid + '-' + i,
              d: `M ${sourceX} 
                    ${sourceY} 
                  C ${sourceX + (targetX - sourceX) * 0.33} 
                    ${sourceY + block}
                  , ${sourceX + (targetX - sourceX) * 0.66} 
                    ${sourceY - block}
                  , ${targetX} 
                    ${targetY}`,
              fill: 'none',
              stroke: 'rgb(0, 191, 255)',
              strokeWidth: 1,
            });
          }
        }
      }
    }
    for (let i = 0; i <= num; i++) {
      lineprops.push({
        id: sid + '-row-' + i,
        x1: 0,
        y1: xyScale(i + 1),
        x2: xyScale(num + 2 - i),
        y2: xyScale(i + 1),
        stroke: 'rgb(0, 191, 255)',
        strokeWidth: 1,
        transform: `translate(${xOffset}, ${yOffset}), rotate(${angle})`
      });
      lineprops.push({
        id: sid + '-col-' + i,
        x1: xyScale(i + 1),
        y1: 0,
        x2: xyScale(i + 1),
        y2: xyScale(num + 2 - i),
        stroke: 'rgb(0, 191, 255)',
        strokeWidth: 1,
        transform: `translate(${xOffset}, ${yOffset}), rotate(${angle})`
      });
    }
  }
  return (
    <svg width={500} height={500} viewBox={'0, 0, 1000, 500'}>
      <p>This is Juxtposed Matrix</p>
      {lineprops.map(d => d.d ?
        (<path key={d.id} d={d.d} fill={d.fill} stroke={d.stroke} strokeWidth={d.strokeWidth}></path>)
       : (<line key={d.id} x1={d.x1} y1={d.y1} x2={d.x2} y2={d.y2} stroke={d.stroke} strokeWidth={d.strokeWidth} transform={d.transform}></line>))}
      {nodeprops.map(d => d.r ? 
        (<circle key={d.id} cx={d.x} cy={d.y} r={d.r} fill={d.fill} transform={d.transform}></circle>)
       : (<rect key={d.id} x={d.x} y={d.y} width={d.width} height={d.height} fill={d.fill} transform={d.transform}></rect>))}
    </svg>
  ); 
}


const GraphRender = (props) => {
  const graphs = props.datum.matrix;
  const num = graphs[0].nodes;
  const leng = graphs.length;
  const divRef = useRef();
  const ifdisplay = useCallback(() => {
    if (props.graphLayout == 'juxtMatrix')
      return 'none';
  }, [props.graphLayout])
  useEffect(
    () => {      
      console.log(props.graphLayout)
      let div = divRef.current;
      while (div.hasChildNodes())
        div.removeChild(div.firstChild);
      if (props.graphLayout == 'juxtMatrix')
        return;
      let childdiv = document.createElement('div');
      div.appendChild(childdiv);
      
      console.log(childdiv);
      console.log(div);
      let netv = new NetV({ 
        container: childdiv,
        nodeLimit: 1000,
        linkLimit: 3000,
        width: 700,
        height: 450,
      });
      if (props.graphLayout === 'nodelink')
        NodeLink(netv, graphs, num, leng);
      else if (props.graphLayout === 'bipartite')
        Bipartite(netv, graphs, num, leng);
      // else
      //   childdiv.appendChild(<JuxtMatrix num={num} leng={leng} graphs={graphs} />)
        
     
      netv.on('zoom', () => { });
      netv.on('pan', () => { });
      netv.draw();
      // console.log(div)
      // 这里wipe了就没法缩放和移动了
      return;
    }, [props.graphLayout]
  )

  return (
    <>
      <div id='graphdiv' ref={divRef} >
      </div>
      <div id='othergraph'>
        {props.graphLayout === 'juxtMatrix' && <JuxtMatrix num={num} leng={leng} graphs={graphs} />}
      </div>
    </>
    
  );
}



const Graph = () => {
  // nodelink / matrix / bipartite / juxtMatrix
  const taref = useRef(null);
  const btref = useRef(null);
  const [graphLayout, setGraphLayout] = useState('juxtMatrix');
  
  const submit = (e) => {
    const textarea = taref.current;
    const input = textarea.value;
    const config=JSON.parse(input);
    setGraphLayout(config.graphlayout);
    console.log(graphLayout)
    // try {
    //     if(typeof config == 'object' && config) {
    //       setGraphLayout(config.graphlayout);
    //     }
    // } catch(e) {
    //     alert('not json');
    //     return false;
    // }
    
  }
  return (
    <div id='maindiv'>
      <div id='opdiv' className='box'>
        <textarea id='textarea' ref={taref} defaultValue={`{"graphlayout": "juxtMatrix", "timelayout": "timeline"}`}></textarea>
        <button id='submitbutton' onClick={(e) => submit(e)}>submit</button>
      </div>
      <div id='renderdiv' className='box'>
        <GraphRender graphLayout={graphLayout} datum={datum15_5} />
      </div>
    </div>
  )
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
