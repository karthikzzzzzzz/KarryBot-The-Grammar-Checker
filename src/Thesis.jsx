import React, { useEffect, useRef, useState, useCallback } from 'react';
import 'quill/dist/quill.snow.css';
import jsPDF from 'jspdf';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RecommendationCard from './suggestions';
import  './writing.css';
import EditorComponent from './editor';


const Writing = () => {
 
  const editorInstance = useRef(null);
  const wsRef = useRef(null);
  const debounceTimeout = useRef(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  


  const maxWordCount = parseInt(process.env.REACT_APP_MAX_WORD_COUNT, 10);

  useEffect(() => {
    wsRef.current = new WebSocket('ws://127.0.0.1:8000/api/v1/ws/thesis');
    wsRef.current.onopen = () => {
      console.log('WebSocket connection established.');
    };
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.error) {
        toast.error(data.error);
        setLoading(false);
        return;
      }
      const { corrected, changes } = data;
      setRecommendations((prevRecommendations) => {
        const newRecommendations = changes.filter(
          (newChange) =>
            !prevRecommendations.some(
              (prevChange) => prevChange.original === newChange.original && prevChange.position === newChange.position
            )
        );
        return [...prevRecommendations, ...newRecommendations];
      });

      setLoading(false);
    };

    wsRef.current.onerror = () => {
      console.log('WebSocket connection error.');
    };
    wsRef.current.onclose = () => {
      console.log('WebSocket connection closed.');
    };
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

 

  const handleEditorChange = (content, editor) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      const plainTextContent = editor.getText({ format: 'text' });
      const wordcount = plainTextContent.split(' ').length;
      console.log(plainTextContent);

      if (wordcount > maxWordCount) {
        toast.error("error");
      } else {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          setLoading(true);
          wsRef.current.send(plainTextContent);
        } else {
          toast.error("error");
        }
      }
    }, 3000);
  };

  const handleRecommendationClick = useCallback((correctedWord, position) => {
    if (editorInstance.current) {
      const content = editorInstance.current.getText({ format: 'text' });
      const words = content.split(' ');
      words[position] = correctedWord;
      editorInstance.current.setText(words.join(' '));
      setRecommendations((prevRecommendations) =>
        prevRecommendations.filter(
          (change) => change.position !== position || change.corrected !== correctedWord
        )
      );
    }
  }, [editorInstance, setRecommendations]);

  const handleSave = useCallback(() => {
    try {
      const editorContent = editorInstance.current.getText();
      const pdf = new jsPDF();
      pdf.text(editorContent, 10, 10);
      const randomFilename = `thesis_${Math.random().toString(36)}.pdf`;
      pdf.save(randomFilename);
    } catch (error) {
      toast.error('Error saving the document.');
    }
  }, [editorInstance]);

  return (
    <div className="writing-container">
    <div className="editor-container">
      <div className="header">
        <h1>KarryBot</h1>
        <button onClick={handleSave} className="save-btn">Save & Download</button>
      </div>

      <div className="editor">
        <EditorComponent onEditorChange={handleEditorChange} editorInstanceRef={editorInstance} />
      </div>
    </div>

    <div className="recommendation-container">
      <div className="recommendation-header">
        <h2>Suggestions</h2>
        {loading ? (
          <div className="spinner"></div> 
        ) : (
          <div className="recommendations-list">
            {recommendations.map((change, index) => (
              <RecommendationCard
                key={index}
                original={change.original}
                corrected={change.corrected}
                onClick={() => handleRecommendationClick(change.corrected, change.position)}
              />
            ))}
          </div>
        )}
      </div>
    </div>

    <ToastContainer />
  </div>
);
};

export default Writing;