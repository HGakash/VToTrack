import { ChevronRight } from "lucide-react";
import GuideRequestModal from "@/pages/RequestGuideModal";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useState } from "react";

export function NavMain({ items }) {
  const [open, setOpen] = useState(false); // ✅ Modal state

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>A VTU Platform</SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item, index) => (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {index !== 2 && (
                      <ChevronRight
                        className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                      />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      {/* ✅ Button to Open Modal */}
      <div className="mt-2 px-2">
        <button
          className="w-full max-w-64 mx-auto py-2 bg-white text-black rounded-md font-medium"
          onClick={() => setOpen(true)} // ✅ Open modal on click
        >
          Request Guide
        </button>
      </div>

      {/* ✅ Modal Component */}
      <GuideRequestModal open={open} setOpen={setOpen} />
    </>
  );
}
