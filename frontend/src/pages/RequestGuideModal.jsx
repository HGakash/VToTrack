import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";


const GuideRequestModal = ({ open, setOpen }) => {
  const [guides, setGuides] = useState([]);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token")


  useEffect(() => {
    if (!open) return; // Fetch only when modal opens

    const fetchGuides = async () => {
      try {
        const response = await fetch("http://localhost:8001/api/getuser/user?role=guide",{
          method:"GET",
          headers:{
            "Content-Type": "application/json",
             "Authorization": `Bearer ${token}`
          }
        }); // Fetch only guides
        const data = await response.json();
        setGuides(data);
        console.log(data)
      } catch (error) {
        toast.error("Failed to fetch guides.");
      }
    };

    fetchGuides();
  }, [open]);

  const handleRequestGuide = async () => {
    if (!selectedGuide) {
      toast.error("Please select a guide.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8001/api/guide/request-guide", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ guideId: selectedGuide }),
      });

      if (response.ok) {
        toast.success("Guide request sent successfully!");
        setOpen(false); // Close modal
      } else {
        toast.error("Failed to send guide request.");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select a Guide</DialogTitle>
          </DialogHeader>

          {/* List of Guides */}
          <ScrollArea className="max-h-60 overflow-y-auto">
            {guides.length > 0 ? (
              guides.map((guide) => (
                <div
                key={guide._id}
                className={`p-2 rounded-md border cursor-pointer my-1 transition duration-200 ${
                  selectedGuide === guide._id ? "text-white bg-blue-800" : "bg-black-100 hover:bg-gray-500" //hover effect bg-color changes
                }`}
                onClick={() => {
                  setSelectedGuide(guide._id);
                  console.log("Selected Guide:", guide._id); // Debugging
                }}
              >
                {guide.name} ({guide.email})
              </div>              
              ))
            ) : (
              <p className="text-gray-500">No guides available.</p>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleRequestGuide} disabled={loading}>
              {loading ? "Sending..." : "Request Guide"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GuideRequestModal;
