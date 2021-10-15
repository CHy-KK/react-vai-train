import React, {useCallback, useEffect, useRef, useState} from 'react';
import * as d3 from 'd3'; 
import '../mydiv.css'

export const JuxtMatrix = (props) => {
  const gref = useRef(null);
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
  const handleScroll = function(e) {
    e.preventDefault();
    const svg = gref.current;
    const atr = svg.getAttribute('transform');
    let scale = 1;
    const pattern = /scale\(\d+(.\d+)?\)/;
    scale = parseFloat(pattern.exec(atr)[0].slice(6, -1));
    if (e.deltaY < 0)
      scale *= 0.9;
    else
      scale *= 1.1;
    
    svg.setAttribute('transform', atr.replace(pattern, `scale(${scale})`));
  }
  const handleDrag = function(e) {
    document.onmousemove = function(e) {
      const svg = gref.current;
      const atr = svg.getAttribute('transform');
      let xpos = 0;
      let ypos = 0;
      const pattern = /translate\(-?\d+,-?\d+\)/;
      const result = pattern.exec(atr)[0];
      const pos = result.search(',');
      xpos = parseInt(result.slice(10, pos));
      ypos = parseInt(result.slice(pos + 1, -1));
      svg.setAttribute('transform', atr.replace(pattern, `translate(${xpos + e.movementX},${ypos + e.movementY})`));
    }
    document['onmouseup'] = function(e) {
      document['onmousemove'] = null;
    }
  }
  const handleStopDrag = function(e) {
    e.preventDefault();
  }

  return (
    <svg width={750} height={480} 
      onWheel={e => handleScroll(e)}
      onMouseDown={e => {e.persist(); handleDrag(e)}}
      onDragStart={handleStopDrag}>
      <g ref={gref} width={500} height={500} transform='scale(1), translate(0,0)' draggable='true'>
        <p>This is Juxtposed Matrix</p>
        {lineprops.map(d => d.d ?
          (<path key={d.id} d={d.d} fill={d.fill} stroke={d.stroke} strokeWidth={d.strokeWidth}></path>)
        : (<line key={d.id} x1={d.x1} y1={d.y1} x2={d.x2} y2={d.y2} stroke={d.stroke} strokeWidth={d.strokeWidth} transform={d.transform}></line>))}
        {nodeprops.map(d => d.r ? 
          (<circle key={d.id} cx={d.x} cy={d.y} r={d.r} fill={d.fill} transform={d.transform}></circle>)
        : (<rect key={d.id} x={d.x} y={d.y} width={d.width} height={d.height} fill={d.fill} transform={d.transform}></rect>))}
      </g>
    </svg>
  ); 
}
