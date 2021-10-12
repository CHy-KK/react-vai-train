import { mode } from 'd3-array';
import { JSONEditor } from 'jsoneditor';
import React, {useEffect, useRef} from 'react';
import { useState } from 'react/cjs/react.development';

const JsonInputArea = (props) => {
  const divref = useRef(null);
  useEffect(() => {
    const option = {
      mode: 'code',
    }
    let editor = new JSONEditor(divref.current, option);
    
  }, [])
  return (
    <div>
      <div style={{height: '80%', width: '100%'}} ref={divref}></div>
    </div>
  )
}

export {JsonInputArea}