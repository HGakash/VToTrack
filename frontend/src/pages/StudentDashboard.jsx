import {React,useContext,useEffect} from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import {SidebarProvider} from "@/components/ui/sidebar"
import AuthContext from "../context/AuthContext";

function StudentDashboard() {
const {user} = useContext(AuthContext);

useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user]);

  if (!user) return null;

  return (
    <div>
       <SidebarProvider>
        <AppSidebar/>
        <div>
           <p> Welcome {user.name} </p>
                 {user.email}
        </div>
      </SidebarProvider>
    </div>
  )
}


export default StudentDashboard


