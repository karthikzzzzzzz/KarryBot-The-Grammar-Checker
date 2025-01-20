import Spinner from "../components/spinner";
import React from "react";

const fileName=()=> {
    const filename=`thesis_${Math.random().toString(36)}.pdf`
  return filename
}

const wordCount=(plainTextContent)=>{
    const wordcount=plainTextContent.split(/|s+/).filter(word=>word.length>0).length
    return wordcount
}
const renderSpinner = (loading) => {
    return <Spinner />; 
  };

export { fileName, wordCount, renderSpinner };


