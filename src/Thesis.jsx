import React, { useEffect, useRef, useState, useCallback } from 'react';
import 'quill/dist/quill.snow.css';
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

  const navigatetodoc = () => {
    window.location.href = "https://medium.com/@karthikrajan025/building-a-real-time-grammar-correction-web-application-with-fastapi-react-and-websocket-6d65f5f99b6b";
  };

  return (
    <>
    <h1 style={{textAlign:"center",justifyContent:"center",fontSize:"20px",fontFamily:"sans-serif",fontStyle:"italic"}}>KarryBot-The Grammer Checker</h1>
    <div className="writing-container">
      
    <div className="editor-container">
      <div className="header">
        <h1 style={{fontSize:"20px",fontFamily:"sans-serif",fontStyle:"italic"}}>Writing made Flawless!</h1>
        <button onClick={navigatetodoc} className="save-btn">Documentation</button>
      </div>

      <div style={{height:"70%"}} >
        <EditorComponent onEditorChange={handleEditorChange} editorInstanceRef={editorInstance} />
      </div>
    </div>

    <div className="recommendation-container">
      <div className="recommendation-header">
        <h2 style={{fontSize:"20px"}}>SUGGESTIONS</h2>
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
  </>
);
};

export default Writing;