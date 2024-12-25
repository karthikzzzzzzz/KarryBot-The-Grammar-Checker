import React, { useState, useEffect, useRef } from 'react';
import { Editor } from "@tinymce/tinymce-react";
import './tiny.css';

const Thesis = () => {
  const editorInstance = useRef(null);
  const wsRef = useRef(null);
  const debounceTimeout = useRef(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const apikey = process.env.TINYMCE;

  useEffect(() => {
    // Initialize WebSocket
    wsRef.current = new WebSocket("ws://localhost:8000/ws/thesis");

    wsRef.current.onopen = () => {
      console.log("WebSocket connected.");
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.error) {
        alert(data.error);
        setLoading(false);
        return;
      }

      const { corrected_text, changes } = data;
      console.log("Corrections received:", changes);
      setRecommendations(changes);
      setLoading(false);
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket connection closed.");
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
      const plainTextContent= editor.getContent({ format: "text" });
      const wordcount=plainTextContent.split(/|s+/).filter(word=>word.length>0).length
      if (wordcount > 1000){
        alert("Please enter the words within limit")

      }
      else{
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const plainTextContent = editor.getContent({ format: "text" });
        console.log("Sending plain text to WebSocket:", plainTextContent);
        setLoading(true);
        wsRef.current.send(plainTextContent);
      } else {
        console.log("WebSocket is not open or available.");
      }
    }
    }, 2000);
  };


  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (editorInstance.current) {
        const currentContent = editorInstance.current.getContent();
        editorInstance.current.setContent(currentContent + text);
      }
    } catch (error) {
      console.error("Failed to paste from clipboard:", error);
      alert("Failed to paste content. Please ensure clipboard access is allowed.");
    }
  };

  const handleRecommendationClick = (correctedWord, position) => {
    if (editorInstance.current) {
      const content = editorInstance.current.getContent({ format: "text" });
      const words = content.split(" ");
      words[position] = correctedWord;
      editorInstance.current.setContent(words.join(" "));
    }
  };

  const navigatetodoc = () => {
    window.location.href = "https://medium.com/@karthikrajan025/building-a-real-time-grammar-correction-web-application-with-fastapi-react-and-websocket-6d65f5f99b6b";
  };

  return (
    <div className="container">
      <header>
        <nav className="navbar">
          <div className="navbar-brand">KarryBot</div>
          <div className="navbar-brand" style={{marginLeft:"200px"}}>The Grammar Checker - Writing made Flawless</div>
        </nav>
      </header>

      <div className="left-panel">
        <div className="editor-container">
          <Editor
            apiKey="ek8ibn42mleebdclgszmeu86a2vanppyp7oyqa6iajzqt1sr"
            onInit={(evt, editor) => {
              editorInstance.current = editor;
            }}
            init={{
              height: "100%",
              menu: {
                edit: { title: 'Edit', items: 'undo, redo, selectall' }
              },
              plugins: [
                'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace',
                'table', 'visualblocks', 'wordcount', 'checklist', 'mediaembed', 'casechange', 'export', 'formatpainter',
                'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode',
                'editimage', 'advtemplate', 'ai', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags',
                'autocorrect', 'typography', 'inlinecss', 'markdown', 'importword', 'exportword', 'exportpdf'
              ],
              tinycomments_mode: 'embedded',
              tinycomments_author: 'Author name',
              mergetags_list: [
                { value: 'First.Name', title: 'First Name' },
                { value: 'Email', title: 'Email' },
              ],
              toolbar: "undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | insertfile image | help",
              placeholder: "Start writing your text...",
              ai_request: (request, respondWith) => respondWith.string(() => Promise.reject('You need to implement the API KEY for this feature')),
            }}
            onEditorChange={handleEditorChange}
          />
        </div>

        <div className="button-container">
          <button onClick={handlePasteFromClipboard} className="download-button">Paste Text</button>
          <button onClick={navigatetodoc} className="download-button">Docs</button>
        </div>
      </div>

      <div className="right-panel">
        <h2>Get your Recommendations!</h2>
        <div id="recommendations-container">
          {loading ? (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Loading recommendations...</p>
            </div>
          ) : (
            recommendations.map((change, index) => (
              <div
                key={index}
                className="recommendation-card"
                onClick={() => handleRecommendationClick(change.corrected, change.position)}
              >
                <p>Click here to refine your grammar</p>
                <h3>Change "{change.original}" to "{change.corrected}"</h3>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Thesis;