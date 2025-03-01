// CreateProject.jsx
import { useState, useEffect } from "react";
import ProjectForm from "./ProjectForm";
import ProjectList from "./ProjectList";

export default function CreateProject() {
  const [projects, setProjects] = useState([]);
  const [projectToEdit, setProjectToEdit] = useState(null);
  
  // Get token from localStorage
  const token = localStorage.getItem("token");
  
  useEffect(() => {
    fetchStudentProjects();
  }, []);

  const fetchStudentProjects = async () => {
    try {
      const response = await fetch("http://localhost:8001/api/projects/my-project", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(Array.isArray(data) ? data : [data]);
      }
    } catch (error) {
      console.log("No existing project found or error:", error);
    }
  };

  const handleProjectCreated = () => {
    // Refresh the project list
    fetchStudentProjects();
    // Clear any editing state
    setProjectToEdit(null);
  };

  const handleEditProject = (project) => {
    // Set the project to edit
    setProjectToEdit(project);
    // Scroll to the form to 
    //this is the auto scrolling when the user clicks edit button 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProject = (projectId) => {
    // Update local state without fetching
    setProjects(prevProjects => prevProjects.filter(proj => proj._id !== projectId));
    
    // If we were editing this project, clear the editing state
    if (projectToEdit && projectToEdit._id === projectId) {
      setProjectToEdit(null);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Manage Your Projects</h2>
      
      {/* Project Form Component */}
      <ProjectForm 
        onProjectCreated={handleProjectCreated}
        initialProject={projectToEdit}
      />
      
      {/* Project List Component */}
      <ProjectList 
        projects={projects}
        onEditProject={handleEditProject}
        onDeleteProject={handleDeleteProject}
        onProjectUpdated={fetchStudentProjects}
      />
    </div>
  );
}



