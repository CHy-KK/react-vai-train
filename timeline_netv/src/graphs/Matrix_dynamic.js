import React, {useCallback, useEffect, useRef, useState} from 'react';
import * as d3 from 'd3'; 
import '../mydiv.css'

export const Matrix_dynamic = (props) => {
  const type2id = {'downtriMatrix': -1, 'matrix': 0, 'uptriMatrix': 1};
  const direct = props.direct;
  const num = props.num;
  const type = type2id[props.type];
  const padding = {left: 50, top: 50};
  const block = 15;
  const xyScale = d3.scaleLinear()
    .domain([0, num + 2])
    .range([0, block * (num + 2)]);
  let lineprops = [];
  let nodeprops = [];
  let recordS = new Array(num).fill(0);
  let recordT = new Array(num).fill(0);

  const xOffset = padding.left;
  const yOffset = padding.top;
  const links = props.links;
  recordS.fill(0);
  recordT.fill(0);
  links.map((d, idx) => {
    if (type > 0) {
      recordS[Math.min(d.target, d.source)] = 1;
      recordT[Math.max(d.target, d.source)] = 1;
      nodeprops.push({
        id: '-node-' + idx,
        // (1 - 0.7) / 2 = 0.15
        x: xyScale(Math.max(d.target, d.source)) + block * 1.15,
        y: xyScale(Math.min(d.target, d.source)) + block * 1.15,
        width: block * 0.7,
        height: block * 0.7,
        fill: 'rgb(70, 130, 180)',
        transform: `translate(${xOffset}, ${yOffset})`,
      })
    }
    if (type < 0) {
      recordS[Math.max(d.target, d.source)] = 1;
      recordT[Math.min(d.target, d.source)] = 1;
      nodeprops.push({
        id: '-node-' + idx,
        // (1 - 0.7) / 2 = 0.15
        x: xyScale(Math.min(d.target, d.source)) + block * 1.15,
        y: xyScale(Math.max(d.target, d.source)) + block * 1.15,
        width: block * 0.7,
        height: block * 0.7,
        fill: 'rgb(70, 130, 180)',
        transform: `translate(${xOffset}, ${yOffset})`,
      })
    }
    if (type == 0){
      if (direct) {
        recordS[d.source] = 1;
        recordT[d.target] = 1;
        nodeprops.push({
          id: '-node-' + idx,
          // (1 - 0.7) / 2 = 0.15
          x: xyScale(d.target) + block * 1.15,
          y: xyScale(d.source) + block * 1.15,
          width: block * 0.7,
          height: block * 0.7,
          fill: 'rgb(70, 130, 180)',
          transform: `translate(${xOffset}, ${yOffset})`,
        })
      }
      else {
        recordS[d.source] = 1;
        recordS[d.target] = 1;
        recordT[d.source] = 1;
        recordT[d.target] = 1;
        nodeprops.push({
          id: '-node-' + idx + '1',
          // (1 - 0.7) / 2 = 0.15
          x: xyScale(d.target) + block * 1.15,
          y: xyScale(d.source) + block * 1.15,
          width: block * 0.7,
          height: block * 0.7,
          fill: 'rgb(70, 130, 180)',
          transform: `translate(${xOffset}, ${yOffset})`,
        })
        nodeprops.push({
          id: '-node-' + idx + '2',
          // (1 - 0.7) / 2 = 0.15
          x: xyScale(d.source) + block * 1.15,
          y: xyScale(d.target) + block * 1.15,
          width: block * 0.7,
          height: block * 0.7,
          fill: 'rgb(70, 130, 180)',
          transform: `translate(${xOffset}, ${yOffset})`,
        })
      }
    }
  });
  recordS.map((d, idx) => {
    if (type > 0) {
      nodeprops.push({
        id: '-source-' + idx,
        x: xyScale(num + 2) - block * 0.5,
        y: xyScale(idx + 1) + block * 0.5,
        r: block * 0.425,
        fill: `rgba(112, 128, 144, ${d * 0.8 + 0.15})`,
        transform: `translate(${xOffset}, ${yOffset})`,
      })
    }
    else {
      nodeprops.push({
        id: '-source-' + idx,
        x: block * 0.5,
        y: xyScale(idx + 1) + block * 0.5,
        r: block * 0.425,
        fill: `rgba(112, 128, 144, ${d * 0.8 + 0.15})`,
        transform: `translate(${xOffset}, ${yOffset})`,
      })
    }
  });
  recordT.map((d, idx) => {
    if (type >= 0) {
      nodeprops.push({
        id: '-target-' + idx,
        x: xyScale(idx + 1) + block * 0.5,
        y: block * 0.5,
        r: block * 0.425,
        fill: `rgba(112, 128, 144, ${d * 0.8 + 0.15})`,
        transform: `translate(${xOffset}, ${yOffset})`,
      })
    }
    else {
      nodeprops.push({
        id: '-target-' + idx,
        x: xyScale(idx + 1) + block * 0.5,
        y: xyScale(num + 1) + block * 0.5,
        r: block * 0.425,
        fill: `rgba(112, 128, 144, ${d * 0.8 + 0.15})`,
        transform: `translate(${xOffset}, ${yOffset})`,
      })
    }
  });
  
  for (let i = 0; i <= num; i++) {
    if (type > 0) {
      lineprops.push({
        id: '-row-' + i,
        x1: xyScale(i + 1),
        y1: xyScale(i + 1),
        x2: xyScale(num + 2),
        y2: xyScale(i + 1),
        stroke: 'rgb(0, 191, 255)',
        strokeWidth: 1,
        transform: `translate(${xOffset}, ${yOffset})`
      });
      lineprops.push({
        id: '-col-' + i,
        x1: xyScale(i + 1),
        y1: 0,
        x2: xyScale(i + 1),
        y2: xyScale(i + 1),
        stroke: 'rgb(0, 191, 255)',
        strokeWidth: 1,
        transform: `translate(${xOffset}, ${yOffset})`
      });
    }
    else if (type < 0) {
      lineprops.push({
        id: '-row-' + i,
        x1: 0,
        y1: xyScale(i + 1),
        x2: xyScale(i + 1),
        y2: xyScale(i + 1),
        stroke: 'rgb(0, 191, 255)',
        strokeWidth: 1,
        transform: `translate(${xOffset}, ${yOffset})`
      });
      lineprops.push({
        id: '-col-' + i,
        x1: xyScale(i + 1),
        y1: xyScale(i + 1),
        x2: xyScale(i + 1),
        y2: xyScale(num + 2),
        stroke: 'rgb(0, 191, 255)',
        strokeWidth: 1,
        transform: `translate(${xOffset}, ${yOffset})`
      });
    }
    else {
      lineprops.push({
        id: '-row-' + i,
        x1: 0,
        y1: xyScale(i + 1),
        x2: xyScale(num + 1),
        y2: xyScale(i + 1),
        stroke: 'rgb(0, 191, 255)',
        strokeWidth: 1,
        transform: `translate(${xOffset}, ${yOffset})`
      });
      lineprops.push({
        id: '-col-' + i,
        x1: xyScale(i + 1),
        y1: 0,
        x2: xyScale(i + 1),
        y2: xyScale(num + 1),
        stroke: 'rgb(0, 191, 255)',
        strokeWidth: 1,
        transform: `translate(${xOffset}, ${yOffset})`
      });
    }
  }

  return (
    <svg width={750} height={480}
      // onWheel={e => handleScroll(e)}
      // onMouseDown={e => {e.persist(); handleDrag(e)}}
      // onDragStart={handleStopDrag}
      >
      <g width={500} height={500} transform='scale(1), translate(0,0)' draggable='true'>
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