import React, { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import jsPDF from "jspdf";

const Thesis = () => {

  const editorInstance = useRef(null);
  const wsRef = useRef(null);
  const debounceTimeout = useRef(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    wsRef.current = new WebSocket("ws://localhost:8000/ws/thesis");
    wsRef.current.onopen = () => {
      console.log("WebSocket connected.");
    };
    
    wsRef.current.onmessage = (event) => {
      const aiRecommendation = event.data; 
      console.log(aiRecommendation)
      setRecommendations((prevRecommendations) => {
        if (!prevRecommendations.includes(aiRecommendation)) {
          return [...prevRecommendations, aiRecommendation];
        }
        return prevRecommendations; 
      });
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

 
  useEffect(() => {
    if (!editorInstance.current) {
      editorInstance.current = new Quill("#editor-container", {
        theme: "snow",
        modules: {
          toolbar: [
            [{ font: ["arial", "times-new-roman", "courier", "roboto"] }],
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ script: "sub" }, { script: "super" }],
            [{ indent: "-1" }, { indent: "+1" }],
            [{ align: [] }],
            ["link", "image", "video"],
            ["clean"],
          ],
        },
        placeholder: "Start writing your thesis...",
      });
     
      editorInstance.current.on("text-change", () => {
        if (debounceTimeout.current) {
          clearTimeout(debounceTimeout.current);
        }
        debounceTimeout.current = setTimeout(() => {
          const editorContent = editorInstance.current.getText();
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(editorContent);
          }
        }, 3000); 
      });
    }
  }, []);

  const handleSave = () => {
    try {
      const editorContent = editorInstance.current.getText();
      const pdf = new jsPDF();
      pdf.text(editorContent, 10, 10);
      const randomFilename = `thesis_${Math.random().toString(36)}.pdf`;
      pdf.save(randomFilename);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to save the file. Please try again.");
    }
  };
  

  const handleRecommendationClick = (recommendation) => {
    editorInstance.current.setText(recommendation);
  };

   

  return (
    <div style={{display: "flex",height: "100vh",fontFamily: "Arial, sans-serif",backgroundColor: "#ffffff",}}>
      <div style={{flex: 1,padding: "20px",backgroundColor: "#ffffff",display: "flex",flexDirection: "column",}}>
        <h1 style={{ marginBottom: "20px", color: "#333" }}>Thesis Writing</h1>
        <div id="editor-container" style={{height: "80%",border: "1px solid #ccc",borderRadius: "5px",backgroundColor: "#fff",}}></div>
        <button onClick={handleSave} style={{marginTop: "20px",padding: "10px 20px",backgroundColor: "#007bff",color: "#fff",border: "none",borderRadius: "5px",cursor: "pointer",boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",transition: "background-color 0.2s",}}>
          Download
        </button>
      </div>
      <div style={{ flex: 0.5, padding: "20px" }}>
        <h2 style={{ color: "#00000", marginBottom: "15px" }}>
          AI Recommendations
        </h2>
        <div id="recommendations-container" style={{ height: "85%",border: "1px solid #ccc",borderRadius: "5px",padding: "10px",backgroundColor: "#ffffff",boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",overflow: "auto",}}>
          {recommendations.map((recommendation, index) => (
            <p
              key={index}
              style={{
                cursor: "pointer",
                color: "black",
              }}
              onClick={() => handleRecommendationClick(recommendation)}
            >
              {recommendation}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Thesis;
