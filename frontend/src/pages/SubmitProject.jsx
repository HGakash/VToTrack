import React, { useState, useEffect } from "react";
import axios from "axios";

const SubmitDocs = () => {
  const [project, setProject] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("synopsis");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

//   useEffect(() => {
//     fetchProjectDetails();
//     fetchSubmissions();
//   }, []);

  const fetchProjectDetails = async () => {
    try {
      const res = await axios.get("/api/projects/student");
      setProject(res.data);
    } catch (err) {
      console.error("Error fetching project:", err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get("/api/submissions");
      setSubmissions(res.data);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file!");

    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", fileType);

    try {
      const res = await axios.post("/api/submissions/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(res.data.message);
      fetchSubmissions();
    } catch (err) {
      console.error("Error uploading file:", err);
      setMessage("Upload failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 text-white p-8 rounded-xl shadow-lg w-full max-w-lg">
        {/* Project Details */}
        {project ? (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-blue-400">{project.title}</h2>
            <p className="text-gray-300">{project.description}</p>
            <p className="text-sm text-gray-400">Category: {project.category}</p>
          </div>
        ) : (
          <p className="text-gray-400">Loading project details...</p>
        )}

        {/* Previous Submissions */}
        <h3 className="text-lg font-semibold mb-2">Previous Submissions</h3>
        <ul className="bg-gray-700 p-4 rounded-md shadow">
          {submissions.length > 0 ? (
            submissions.map((sub) => (
              <li key={sub._id} className="flex justify-between items-center border-b border-gray-600 py-2">
                <span className="text-gray-300">{sub.fileType.toUpperCase()}</span>
                <span
                  className={`px-2 py-1 rounded text-white ${
                    sub.status === "approved" ? "bg-green-500" : sub.status === "pending" ? "bg-yellow-500" : "bg-red-500"
                  }`}
                >
                  {sub.status}
                </span>
              </li>
            ))
          ) : (
            <p className="text-gray-400">No submissions yet.</p>
          )}
        </ul>

        {/* Upload Form */}
        <h3 className="text-lg font-semibold mt-6 mb-2">Upload New Submission</h3>
        <form onSubmit={handleSubmit} className="bg-gray-700 p-4 rounded-md shadow">
          <div className="mb-4">
            <label className="block text-gray-300">Select File Type:</label>
            <select
              className="w-full p-2 border border-gray-600 bg-gray-800 text-white rounded"
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
            >
              <option value="synopsis">Synopsis</option>
              <option value="presentation">Presentation</option>
              <option value="report">Report</option>
              <option value="code">Code</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-300">Upload File:</label>
            <input type="file" className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white" onChange={handleFileChange} />
          </div>

          <button type="submit" className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" disabled={loading}>
            {loading ? "Uploading..." : "Submit"}
          </button>
        </form>

        {/* Message Display */}
        {message && <p className="mt-4 text-center text-green-400">{message}</p>}
      </div>
    </div>
  );
};

export default SubmitDocs;
