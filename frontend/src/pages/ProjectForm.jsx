// ProjectForm.jsx
import { useEffect, useState } from "react";
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

export default function ProjectForm({ 
  onProjectCreated, 
  initialProject = null 
}) {
  const [projectId, setProjectId] = useState(initialProject?._id || null);
  const [title, setTitle] = useState(initialProject?.title || "");
  const [description, setDescription] = useState(initialProject?.description || "");
  const [category, setCategory] = useState(initialProject?.category || "");
  const [similarProjects, setSimilarProjects] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkedForSimilar, setCheckedForSimilar] = useState(false);
  const [users, setUsers] = useState([]);
  
  //set project state if there is already student have project  
  // Update form when initialProject changes 
  useEffect(() => {
    if (initialProject) {
      setProjectId(initialProject._id);
      setTitle(initialProject.title);
      setDescription(initialProject.description);
      setCategory(initialProject.category);
      setCheckedForSimilar(false);
      setSimilarProjects([]);
    }
  }, [initialProject]);

  // Get token from localStorage
  const token = localStorage.getItem("token");

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
        },
        body: JSON.stringify({ title, description }),
      });

      const data = await response.json();
      setCheckedForSimilar(true);
      if (data.similarProjects?.length > 0) {
        setSimilarProjects(data.similarProjects);
        setUsers(data.users);
        toast.error("Warning: Similar projects found!");
      } else {
        setSimilarProjects([]);
        setUsers([]);
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
        
        // Call the callback to notify parent component
        if (onProjectCreated) {
          onProjectCreated();
        }
        
        // Reset form if not editing
        if (!projectId) {
          resetForm();
        }
      } else {
        toast.error(data.error || `Failed to ${projectId ? "update" : "create"} project.`);
      }
    } catch (error) {
      toast.error("Server error. Try again later.");
      console.error("Error submitting project:", error);
    }
    setIsSubmitting(false);
  };

  //function to reset the form 
  const resetForm = () => {
    setProjectId(null);
    setTitle("");
    setDescription("");
    setCategory("");
    setCheckedForSimilar(false);
    setSimilarProjects([]);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Create New Project Section (Left) */}
      <div className="md:col-span-7 border rounded-lg p-6 bg-black text-white">
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
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="text-sm font-medium mb-1 block">Description</label>
            <Textarea 
              id="description"
              placeholder="Project description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-24 bg-gray-800 border-gray-700 text-white" 
            />
          </div>
          
          <div>
            <label htmlFor="category" className="text-sm font-medium mb-1 block">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category" className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white">
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
              className="border-gray-600 text-gray-200 hover:bg-gray-700"
            >
              {isChecking ? "Checking..." : "Check Similar Projects"}
            </Button>
            
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !title || !description || !category}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting 
                ? (projectId ? "Updating..." : "Creating...") 
                : (projectId ? "Update Project" : "Create Project")
              }
            </Button>
            
            {projectId && (
              <Button 
                onClick={resetForm}
                variant="secondary"
                className="bg-gray-700 hover:bg-gray-600"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Similar Projects Section (Right) */}
      <div className="md:col-span-5 border rounded-lg p-6 bg-black text-white">
        <h3 className="text-xl font-semibold mb-4">Similar Projects</h3>
        
        {checkedForSimilar ? (
  similarProjects.length > 0 ? (
    <div className="space-y-3">
      <div className="p-4 border border-red-500 bg-black rounded-md">
        <p className="font-bold text-red-400 mb-2">⚠ Warning: Similar Projects Found</p>
        <div className="space-y-3">
          {similarProjects.map((proj, index) => {
            const user = users.find(u => u._id === proj.studentId); // Find user details
            return (
              <div key={index} className="p-3 border border-gray-700 rounded-md bg-gray-900">
                <p className="text-red-200 font-semibold">📌 Title:</p>
                <p className="text-white">{proj.title}</p>

                <p className="text-red-200 font-semibold mt-2">📝 Description:</p>
                <p className="text-gray-300">{proj.description}</p>

                {user && (
                  <>
                    <p className="text-red-200 font-semibold mt-2">👤 Submitted by:</p>
                    <p className="text-white-400 font-bold">{user.name}</p>
                  </>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-sm text-red-400 mt-3">🔄 Please modify your project to avoid duplication.</p>
      </div>
    </div>
  ) : (
    <div className="p-4 border border-green-500 bg-black rounded-md">
      <p className="text-green-400">✅ No similar projects found</p>
      <p className="text-sm text-green-400 mt-1">You can proceed with your submission.</p>
    </div>
  )
) : (
  <p className="text-gray-400">Click "Check Similar Projects" to see if similar projects exist.</p>
)}


        {title && description && category && checkedForSimilar && similarProjects.length === 0 && (
          <Button 
            onClick={handleSubmit}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
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
  );
}

