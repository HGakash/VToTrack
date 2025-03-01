// ProjectList.jsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, FileText, Upload, Loader2, Trash, Pencil } from "lucide-react";
import { Toaster } from 'react-hot-toast';
import { toast } from "react-hot-toast";

export default function ProjectList({ 
  //destructuring of props      
  projects, 
  onEditProject, 
  onDeleteProject, 
  onProjectUpdated 
}) {
  const [synopsisFile, setSynopsisFile] = useState(null);
  const [reportFile, setReportFile] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [projectId, setProjectId] = useState(null);
  
  // Get token from localStorage
  const token = localStorage.getItem("token");

  const handleSynopsisUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSynopsisFile(file);
    } else {
      toast.error("Please upload a PDF file for the synopsis");
    }
  };
  
  const handleReportUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setReportFile(file);
    } else {
      toast.error("Please upload a PDF file for the report");
    }
  };

  const handleDocumentSubmit = async (documentType) => {
    // Validation for the specific document type
    if (documentType === 'synopsis' && !synopsisFile) {
      toast.error("Please upload a synopsis file");
      return;
    }
    
    if (documentType === 'report' && !reportFile) {
      toast.error("Please upload a report file");
      return;
    }

    // Create FormData object for file upload
    const formData = new FormData();

    formData.append("fileType", documentType);

    if (documentType === 'synopsis' && synopsisFile) {
      formData.append("file", synopsisFile);
    }
    if (documentType === 'report' && reportFile) {
      formData.append("file", reportFile);
    }

    try {
      const response = await fetch("http://localhost:8001/api/submission/submit", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        toast.success(`${documentType === 'synopsis' ? 'Synopsis' : 'Report'} uploaded successfully!`);
        
        // Reset the specific file input
        if (documentType === 'synopsis') {
          setSynopsisFile(null);
        } else {
          setReportFile(null);
        }
        
        // Notify parent component to refresh projects
        if (onProjectUpdated) {
          onProjectUpdated();
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || `Failed to upload ${documentType}.`);
      }
    } catch (error) {
      console.error(`Error uploading ${documentType}:`, error);
      toast.error("Server error. Try again later.");
    }
  };

  const deleteProject = async (id) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    
    setIsDeleting(true);
    setProjectId(id);
    
    try {
      const response = await fetch(`http://localhost:8001/api/projects/delete/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        toast.success("Project deleted successfully!");
        
        // Call the parent callback to update project list
        if (onDeleteProject) {
          onDeleteProject(id);
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete project.");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Server error. Try again later.");
    } finally {
      setIsDeleting(false);
      setProjectId(null);
    }
  };

  const previewDocument = (docType, projectId) => {
    // Placeholder for document preview functionality
    toast.success(`Previewing ${docType} for project ID: ${projectId}`);
    // window.open(`http://localhost:8001/api/projects/preview/${projectId}/${docType}`, '_blank');
  };

  return (
    <>
    <Toaster/>
    <div className="mt-8 border rounded-lg p-6 bg-black text-white">
      <h3 className="text-2xl font-semibold mb-6 text-center">Your Projects</h3>
      
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((proj) => (
            <Card key={proj._id} className="p-5 bg-gray-800 text-white border-gray-700">
              <div className="flex flex-col">
                <div className="mb-4">
                  <h4 className="text-xl font-bold">{proj.title}</h4>
                  <p className="text-sm text-gray-300 mt-1">{proj.category}</p>
                  <p className="mt-3 text-gray-200">{proj.description}</p>
                </div>
                
                {/* Document Upload Section - Separated into Cards */}
                <div className="mt-2 mb-4 border-t border-gray-700 pt-4">
                  <h5 className="text-md font-semibold mb-3">Project Documents</h5>
                  
                  <div className="space-y-4">
                    {/* Synopsis Upload Card */}
                    <div className="border border-gray-700 rounded p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h6 className="font-medium">Synopsis</h6>
                        {proj.synopsisUrl && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-blue-500 text-blue-400 hover:bg-blue-900"
                            onClick={() => previewDocument('synopsis', proj._id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        )}
                      </div>
                      
                      <div className="border border-dashed border-gray-600 rounded p-3">
                        <label className="flex flex-col items-center space-y-2 cursor-pointer">
                          <FileText className="h-8 w-8 text-blue-400" />
                          <span className="text-sm">Upload Synopsis (PDF)</span>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={handleSynopsisUpload}
                            className="hidden"
                          />
                        </label>
                        {synopsisFile && (
                          <div className="mt-2 text-sm text-green-400">
                            {synopsisFile.name} ({Math.round(synopsisFile.size / 1024)} KB)
                          </div>
                        )}
                      </div>
                      
                      <Button
                        onClick={() => handleDocumentSubmit('synopsis')}
                        className="mt-3 w-full bg-blue-600 hover:bg-blue-700"
                        disabled={!synopsisFile}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Submit Synopsis
                      </Button>
                    </div>
                    
                    {/* Report Upload Card */}
                    <div className="border border-gray-700 rounded p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h6 className="font-medium">Report</h6>
                        {proj.reportUrl && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-blue-500 text-blue-400 hover:bg-blue-900"
                            onClick={() => previewDocument('report', proj._id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        )}
                      </div>
                      
                      <div className="border border-dashed border-gray-600 rounded p-3">
                        <label className="flex flex-col items-center space-y-2 cursor-pointer">
                          <FileText className="h-8 w-8 text-blue-400" />
                          <span className="text-sm">Upload Report (PDF)</span>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={handleReportUpload}
                            className="hidden"
                          />
                        </label>
                        {reportFile && (
                          <div className="mt-2 text-sm text-green-400">
                            {reportFile.name} ({Math.round(reportFile.size / 1024)} KB)
                          </div>
                        )}
                      </div>
                      
                      <Button
                        onClick={() => handleDocumentSubmit('report')}
                        className="mt-3 w-full bg-blue-600 hover:bg-blue-700"
                        disabled={!reportFile}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Submit Report
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {/* Edit/Delete Buttons */}
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-yellow-500 text-yellow-400 hover:bg-yellow-900"
                    onClick={() => onEditProject(proj)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit Project
                  </Button>
                  
                  <Button 
                    size="sm"
                    variant="destructive" 
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => deleteProject(proj._id)}
                    disabled={isDeleting && projectId === proj._id}
                  >
                    {isDeleting && projectId === proj._id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash className="h-4 w-4 mr-1" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center py-6">No projects found. Create a new one.</p>
      )}
    </div>
    </>
  );
}



