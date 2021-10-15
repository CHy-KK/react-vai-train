import React, {useCallback, useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './mydiv.css'
import reportWebVitals from './reportWebVitals';
import datum50_5 from './data/matrixs50_5.json'
import datum15_5 from './data/matrixs15_5.json'
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { GraphRender } from './GraphRender';


const Graph = () => {
  // nodelink / matrix / bipartite / juxtMatrix
  const graphLayoutList = ['nodelink', 'matrix', 'uptriMatrix', 'downtriMatrix', 'bipartite', 'juxtMatrix']
  const timeLayoutList = ['timeline', 'dynamic']
  const defaultConfig = {
    graphLayout: "uptriMatrix", 
    timeLayout: "timeline",
    direct: true,
  };
  const [config, setConfig] = useState(defaultConfig);

  const code = '{\n\t"graphLayout": "uptriMatrix",\n\t"timeLayout": "timeline",\n\t"direct": "true"\n}';
  return (
    <div id='maindiv'>
      <div id='opdiv' className='box'>
        <CodeMirror
          width={'400px'}
          height={'450px'}
          extensions={[json()]}
          value={code}
          onChange={(value) => {
            try {
              let input = JSON.parse(value);
              if(typeof input === 'object' && input) {
                if (!graphLayoutList.includes(input.graphLayout))
                  return false;
                if (!timeLayoutList.includes(input.timeLayout))
                  return false;
                if (input.direct === 'true') { input.direct = true; }
                else if (input.direct === 'false') { input.direct = false; }
                else { return false; }
                console.log('here2');

                setConfig({
                    graphLayout: input.graphLayout,
                    timeLayout: input.timeLayout,
                    direct: input.direct,
                });
              }
            } catch(e) {
              console.log(e);
              return false;
            }
          }}
        />
      </div>
      <div id='renderdiv' className='box'>
        <GraphRender config={config} datum={datum15_5} />
      </div>
    </div>
  )
}

ReactDOM.render(
  <Graph/>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
