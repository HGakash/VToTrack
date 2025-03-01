import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {Input} from "@/components/ui/input"
import { useDropzone } from "react-dropzone";

const FileUpload = ({ title, file, setFile }) => {
  const onDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <Card className="w-full p-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className="border-dashed border-2 border-gray-400 p-6 text-center cursor-pointer rounded-lg"
        >
          <input {...getInputProps()} />
          <p className="text-gray-600">Drag & drop file here or click to browse</p>
        </div>
        {file && (
          <div className="mt-2">
            <p className="text-green-600 text-sm">Uploaded: {file.name}</p>
            <Button variant="link" onClick={() => window.open(URL.createObjectURL(file))}>
              View File
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ProjectCard = ({ title, category, description }) => {
  const [synopsisFile, setSynopsisFile] = useState(null);
  const [reportFile, setReportFile] = useState(null);

  return (
    <Card className="w-full max-w-5xl mx-auto mb-6 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <p className="text-gray-600">{description}</p>
        <p className="text-sm text-blue-600">Category: {category}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <FileUpload title="Project Synopsis" file={synopsisFile} setFile={setSynopsisFile} />
          <FileUpload title="Project Report" file={reportFile} setFile={setReportFile} />
        </div>
      </CardContent>
    </Card>
  );
};

const SubmitProject = () => {
  const projects = [
    { title: "AI Chatbot", category: "Machine Learning", description: "An AI chatbot project using NLP and Python." },
    { title: "E-Commerce Website", category: "Web Development", description: "A full-stack e-commerce website using React and Node.js." }
  ];

  return (
    <div className="p-12 bg-gray-100 min-h-screen flex flex-col items-center">
      <h1 className="text-4xl font-bold text-center mb-10">Project Submissions</h1>
      <div className="w-full max-w-6xl">
        {projects.map((project, index) => (
          <ProjectCard key={index} {...project} />
        ))}
      </div>
    </div>
  );
};

export default SubmitProject;
