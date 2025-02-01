import React, { useEffect } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { useState, useRef } from 'react';

const Editor = ({ onEditorChange, editorInstanceRef }) => {
  const [wordcount, setWordcount] = useState(0);
  const quillRef = useRef(null); 

  useEffect(() => {
   
    if (!quillRef.current) {
     
      quillRef.current = new Quill('#editor', {
        modules: {
          toolbar: [
            [{ font: [] }],
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ indent: '-1' }, { indent: '+1' }],
            [{ align: [] }],
            ['link', 'image', 'video'],
            ['clean'],
          ],
        },
        placeholder: 'Start your writing here...',
        theme: 'snow',
      });

    
      editorInstanceRef.current = quillRef.current;

      quillRef.current.on('text-change', () => {
        const content = quillRef.current.getText(); 
        if (onEditorChange) {
          onEditorChange(content, quillRef.current); 
        }

     
        const words = content.trim().split(/\s+/).filter(Boolean);
        setWordcount(words.length);
      });
    }

    return () => {
     
      if (quillRef.current) {
        quillRef.current.off('text-change');
      }
    };
  }, [onEditorChange, editorInstanceRef]);

  return (
  
      <><div id="editor" className="editor"></div><div className="word-count">
      <p style={{fontWeight:"bold"}}>Word Count: {wordcount}</p>
    </div></>
   
  );
};

export default Editor;
