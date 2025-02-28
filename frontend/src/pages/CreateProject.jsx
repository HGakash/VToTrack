import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { Card } from "@/components/ui/card";

export default function CreateProject() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [similarProjects, setSimilarProjects] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [checkedForSimilar, setCheckedForSimilar] = useState(false);

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

  const checkSimilarity = async () => {
    if (!title || !description) {
      toast.error("Title and description are required.");
      return;
    }
    setIsChecking(true);
    try {
      const response = await fetch("http://localhost:8001/api/similar/check-similarity", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title, description }),
      });

      const data = await response.json();
      setCheckedForSimilar(true);
      if (data.similarProjects?.length > 0) {
        setSimilarProjects(data.similarProjects);
        toast.error("Warning: Similar projects found!");
      } else {
        setSimilarProjects([]);
        toast.success("No duplication detected. You can submit.");
      }
    } catch (error) {
      toast.error("Error checking similarity. Try again.");
    }
    setIsChecking(false);
  };

  const handleSubmit = async () => {
    if (!title || !description || !category) {
      toast.error("All fields are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const endpoint = projectId ? `http://localhost:8001/api/projects/update/${projectId}` : "http://localhost:8001/api/projects/create";
      const method = projectId ? "PUT" : "POST";
      
      const response = await fetch(endpoint, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, category }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(`Project ${projectId ? "updated" : "created"} successfully!`);
        // Refresh project list
        await fetchStudentProjects();
        // Reset form
        setTitle("");
        setDescription("");
        setCategory("");
        setProjectId(null);
        setCheckedForSimilar(false);
        setSimilarProjects([]);
      } else {
        toast.error(data.error || `Failed to ${projectId ? "update" : "create"} project.`);
      }
    } catch (error) {
      toast.error("Server error. Try again later.");
      console.error("Error submitting project:", error);
    }
    setIsSubmitting(false);
  };

  const deleteProject = async (id) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:8001/api/projects/delete/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Update the UI by filtering out the deleted project
        setProjects(prevProjects => prevProjects.filter(project => project._id !== id));
        
        // Show success toast
        toast.success("Project deleted successfully!");
        
        // If we were editing the deleted project, reset the form
        if (projectId === id) {
          setProjectId(null);
          setTitle("");
          setDescription("");
          setCategory("");
          setCheckedForSimilar(false);
          setSimilarProjects([]);
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
    }
  };

  // Calculate some stats for the chart
  const totalProjects = projects.length;
  const societal = projects.filter(p => p.category === "Societal Project").length;
  const main = projects.filter(p => p.category === "Main Project").length;

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6">Manage Your Projects</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Your Projects Section (Left) */}
        <div className="md:col-span-3 border rounded-lg p-4 bg-black-20">
          <h3 className="text-xl font-semibold mb-4">Your Projects</h3>
          
          {projects.length > 0 ? (
            <div className="space-y-3">
              {projects.map((proj) => (
                <Card key={proj._id} className="p-3">
                  <div className="flex flex-col">
                    <div className="mb-2">
                      <p className="font-medium">{proj.title}</p>
                      <p className="text-xs text-gray-500">{proj.category}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setProjectId(proj._id);
                          setTitle(proj.title);
                          setDescription(proj.description);
                          setCategory(proj.category);
                          setCheckedForSimilar(false);
                          setSimilarProjects([]);
                        }}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm"
                        variant="destructive" 
                        onClick={() => deleteProject(proj._id)}
                        disabled={isDeleting}
                      >
                        {isDeleting && projectId === proj._id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No projects found. Create a new one.</p>
          )}
          
        </div>
        
        {/* Create New Project Section (Middle) */}
        <div className="md:col-span-6 border rounded-lg p-4 bg-black">
          <h3 className="text-xl font-semibold mb-4">
            {projectId ? "Edit Project" : "Create New Project"}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="text-sm font-medium mb-1 block">Project Title</label>
              <Input 
                id="title"
                placeholder="Enter project title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
              />
            </div>
            
            <div>
              <label htmlFor="description" className="text-sm font-medium mb-1 block">Description</label>
              <Textarea 
                id="description"
                placeholder="Project description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-24" 
              />
            </div>
            
            <div>
              <label htmlFor="category" className="text-sm font-medium mb-1 block">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Societal Project">Societal Project</SelectItem>
                  <SelectItem value="Main Project">Main Project</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button 
                onClick={checkSimilarity} 
                disabled={isChecking || !title || !description} 
                variant="outline"
              >
                {isChecking ? "Checking..." : "Check Similar Projects"}
              </Button>
              
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !title || !description || !category}
                className="flex-1"
              >
                {isSubmitting 
                  ? (projectId ? "Updating..." : "Creating...") 
                  : (projectId ? "Update Project" : "Create Project")
                }
              </Button>
              
              {projectId && (
                <Button 
                  onClick={() => {
                    setProjectId(null);
                    setTitle("");
                    setDescription("");
                    setCategory("");
                    setCheckedForSimilar(false);
                    setSimilarProjects([]);
                  }}
                  variant="secondary"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Similar Projects Section (Right) */}
        <div className="md:col-span-3 border rounded-lg p-4 bg-gray-50">
          <h3 className="text-xl font-semibold mb-4">Similar Projects</h3>
          
          {checkedForSimilar ? (
            similarProjects.length > 0 ? (
              <div className="space-y-3">
                <div className="p-3 border border-red-300 bg-red-50 rounded-md">
                  <p className="font-bold text-red-700 mb-2">Warning: Similar Projects Found</p>
                  <ul className="list-disc list-inside text-red-600">
                    {similarProjects.map((proj, index) => (
                      <li key={index}>{proj.title}</li>
                    ))}
                  </ul>
                  <p className="text-sm text-red-600 mt-2">Please consider modifying your project.</p>
                </div>
              </div>
            ) : (
              <div className="p-3 border border-green-300 bg-green-50 rounded-md">
                <p className="text-green-700">No similar projects found</p>
                <p className="text-xs text-green-600 mt-1">You can submit your project</p>
              </div>
            )
          ) : (
            <p className="text-gray-500">Click "Check Similar Projects" to see if similar projects exist.</p>
          )}
          
          {title && description && category && checkedForSimilar && similarProjects.length === 0 && (
            <Button 
              onClick={handleSubmit}
              className="w-full mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (projectId ? "Updating..." : "Creating...") 
                : (projectId ? "Update Project" : "Create Project")
              }
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

