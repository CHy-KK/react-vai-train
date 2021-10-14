import { useEffect, useRef } from "react";
import { useCodeMirror } from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";

const code = '{"graphlayout": "juxtMatrix", "timelayout": "timeline"}';

export function CodeEditor() {
  const editor = useRef();
  const { setContainer } = useCodeMirror({
    width: '400px',
    height: '450px',
    container: editor.current,
    extensions: [json()],
    value: code,
  });

  useEffect(() => {
    if (editor.current) {
      setContainer(editor.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor.current]);
  return <div ref={editor} />;
}
