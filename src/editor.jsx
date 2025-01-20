import React, { useEffect } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { useState, useRef } from 'react';

const Editor = ({ onEditorChange, editorInstanceRef }) => {
  const [wordcount, setWordcount] = useState(0);
  const quillRef = useRef(null); // Create a reference for the Quill instance

  useEffect(() => {
    // Only initialize Quill once to avoid multiple renders
    if (!quillRef.current) {
      // Initialize Quill editor
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

      // Set the Quill instance to the passed ref
      editorInstanceRef.current = quillRef.current;

      // Listen to text-change events
      quillRef.current.on('text-change', () => {
        const content = quillRef.current.getText(); // Get the text content
        if (onEditorChange) {
          onEditorChange(content, quillRef.current); // Pass content back to parent
        }

        // Count words and update word count
        const words = content.trim().split(/\s+/).filter(Boolean);
        setWordcount(words.length);
      });
    }

    return () => {
      // Clean up when the component is unmounted
      if (quillRef.current) {
        quillRef.current.off('text-change');
      }
    };
  }, [onEditorChange, editorInstanceRef]);

  return (
    <div className="editor-container">
      <div id="editor" className="editor"></div>
      <div className="word-count">
        <p>Word Count: {wordcount}</p>
      </div>
    </div>
  );
};

export default Editor;
