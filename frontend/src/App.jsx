import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import { ModeToggle } from './components/modetoggle'
import './App.css'
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentDashboard from "./pages/StudentDashboard";
import GuideDashboard from "./pages/GuideDashboard";
import SubmitProject from "./pages/SubmitProject";
import CreateProject from "./pages/CreateProject";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/create-project" element={<CreateProject/>}></Route>
          <Route path="/submit-project" element={<SubmitProject/>}></Route>
          <Route
          path="/studentDashboard"
          element={
              <StudentDashboard />
          }
        />
          <Route
          path="/guideDashboard"
          element={
              <GuideDashboard />
          }
        />
        </Routes>
      </Router>
    </AuthProvider>
  );
}


