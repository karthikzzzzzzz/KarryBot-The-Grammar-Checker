import React, { useEffect, useRef, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";

import './tiny.css';

const Thesis = () => {
  const editorInstance = useRef(null);
  const wsRef = useRef(null);
  const debounceTimeout = useRef(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const apikey=process.env.TINYMCE

  useEffect(() => {
    wsRef.current = new WebSocket("ws://localhost:8000/ws/thesis");

    wsRef.current.onopen = () => {
      console.log("WebSocket connected.");
    };

    wsRef.current.onmessage = (event) => {
      const aiRecommendation = event.data;
      console.log("AI Recommendation received:", aiRecommendation);
      setRecommendations((prevRecommendations) => {
        if (!prevRecommendations.includes(aiRecommendation)) {
          return [...prevRecommendations, aiRecommendation];
        }
        return prevRecommendations;
      });
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
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const plainTextContent = editor.getContent({ format: "text" });
        console.log("Sending plain text to WebSocket:", plainTextContent);

        setLoading(true);
        wsRef.current.send(plainTextContent);
      } else {
        console.log("WebSocket is not open or available.");
      }
    }, 1000);
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

  const handleRecommendationClick = (recommendation) => {
    if (editorInstance.current) {
      editorInstance.current.setContent(recommendation);
    }
  };

  const navigatetodoc = () => {
    window.location.href = "https://quillbot.com/grammar-check";
  };

  return (
    <div className="container">
      <header>
        <nav className="navbar">
          <div className="navbar-brand">
            KarryBot
          </div>
          <div className="navbar-brand">
            The Grammar Checker-Writing made Flawless
          </div>  
        </nav>
      </header>
      <div className="left-panel">
        <div className="editor-container">
          <Editor
            apiKey={apikey}
            onInit={(evt, editor) => {
              editorInstance.current = editor;
            }}
            init={{
              selector: '.editor-container',
              height: "100%",
              menu: {
                edit: { title: 'Edit', items: 'undo, redo, selectall' }
              },
              plugins: [
                'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
                'checklist', 'mediaembed', 'casechange', 'export', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'editimage', 'advtemplate', 'ai', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown', 'importword', 'exportword', 'exportpdf'
              ],
              tinycomments_mode: 'embedded',
              tinycomments_author: 'Author name',
              mergetags_list: [
                { value: 'First.Name', title: 'First Name' },
                { value: 'Email', title: 'Email' },
              ],
              toolbar:
                "undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat |insertfile image| help",
              placeholder: "Start writing your text...",
              ai_request: (request, respondWith) => respondWith.string(() => Promise.reject('You need to implement the API KEY for this feature')),
            }}
            onEditorChange={handleEditorChange}
          />
        </div>
        <div className="button-container">
          <button
            onClick={handlePasteFromClipboard}
            className="download-button"
          >
            Paste Text
          </button>
          <button
            onClick={navigatetodoc}
            className="download-button"
          >
            Docs
          </button>
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
            recommendations.map((recommendation, index) => (
              <div
                key={index}
                className="recommendation-card"
                onClick={() => handleRecommendationClick(recommendation)}
              >
                <h3>Click to correct your Grammar</h3>
                <p>{recommendation}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Thesis;
