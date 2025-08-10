'use client'
import {
   Sidebar,
   SidebarContent,
   SidebarGroup,
   SidebarGroupContent,
   SidebarGroupLabel,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image"
import { VIVO_LOGO } from "@/lib/constants"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../ui/collapsible"
import sidebarItems from "./sidebar-items"
import { Button } from "../button"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"




export function AppSidebar() {
   const [loading, setLoading] = useState(false);
   const [loggedInUser, setLoggedInUser] = useState<any>(null);
   const router = useRouter();

   useEffect(() => {
      if (typeof document !== "undefined") {
         const userCookie = document.cookie
            .split("; ")
            .find((row) => row.startsWith("vivoUser="));

         if (userCookie) {
            const userData = userCookie.split("=")[1];
            setLoggedInUser(
               userData ? JSON.parse(decodeURIComponent(userData)) : null
            );
         }
      }
   }, []);

   // useEffect(() => {
   //    if (!loggedInUser) {
   //       router.push("/login");
   //    }
   // }, [loggedInUser, router]);

   const handleLogout = () => {
      if (typeof document !== "undefined") {
         document.cookie = "vivoUser=; Max-Age=0; path=/";
      }
      setLoading(true);
      setLoggedInUser(null);
      setTimeout(() => {
         router.push("/login");
      }, 3000);
   };


   // const [loading, setLoading] = useState(false)
   // const [loggedInUser, setLoggedInUser] = useState(() => {
   //    const userCookie = document.cookie.split('; ').find(row => row.startsWith('vivoUser='));
   //    if (userCookie) {
   //       const userData = userCookie.split('=')[1];
   //       return userData ? JSON.parse(decodeURIComponent(userData)) : null;
   //    }
   //    return null;
   // });
   // const router = useRouter();
   // useEffect(() => {
   //    if (!loggedInUser) {
   //       router.push('/login');
   //    }
   // }, [loggedInUser, router]);


   // const handleLogout = () => {
   //    document.cookie = 'vivoUser=; Max-Age=0; path=/';
   //    setLoading(true);
   //    setLoggedInUser(null);
   //    const router = useRouter();
   //    setTimeout(() => {
   //       router.push('/login');
   //    }, 3000);
   // };


  

   return (
      <Sidebar collapsible="icon">
         <SidebarContent>
            <SidebarGroup>
               <SidebarGroupLabel>
                  <Image
                     src={VIVO_LOGO}
                     alt="VIVO Logo"
                     width={200}
                     height={200}
                     className="rounded-full "
                  />
               </SidebarGroupLabel>
               <div className="border-b border-gray-300 my-3"></div>
               <SidebarGroupContent>
                  {sidebarItems.map((item, index) => (
                     <Collapsible key={index} defaultOpen={true}>
                        <SidebarGroup >
                           <div className="text-sm text-gray-950">
                              <CollapsibleTrigger className="flex items-center justify-between gap-2 text-[16px] text-black/90">
                                 <div className="flex gap-4 text-primary">
                                    {item.icon}
                                    {item.title}
                                 </div>
                              </CollapsibleTrigger>
                           </div>
                           <CollapsibleContent  >
                              <SidebarMenu className="ml-4">
                                 {item.children.map((child) => (
                                    <SidebarMenuItem key={child.title}>
                                       <SidebarMenuButton asChild>
                                          <a href={child.url}>
                                             <span>{child.title}</span>
                                          </a>
                                       </SidebarMenuButton>
                                    </SidebarMenuItem>
                                 ))}
                              </SidebarMenu>
                           </CollapsibleContent>
                        </SidebarGroup>
                     </Collapsible>
                  ))}
               </SidebarGroupContent>
               <Button
                  className="cursor-pointer mt-4"
                  onClick={handleLogout} variant={"destructive"}>{loading ? 'Redirecting...' : 'Logout'}</Button>
            </SidebarGroup>
         </SidebarContent>
      </Sidebar>
   )
}