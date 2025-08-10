import { SidebarProvider } from "@/components/ui/sidebar"

import Navbar from "@/components/navbar"
import { VIVO_LOGO } from "@/lib/constants"
import { AppSidebar } from "@/components/ui/sidebar/app-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
   return (
      <SidebarProvider>
         <AppSidebar />
         <main className="w-full flex flex-col">
            <Navbar />
            <div>
               <div
                  className="fixed inset-0 -z-10 opacity-10"
                  style={{
                     backgroundImage: `url(${VIVO_LOGO})`,
                     backgroundRepeat: 'no-repeat',
                     backgroundSize: '400px',
                     backgroundPosition: 'center',
                     backgroundAttachment: 'fixed'
                  }}
               />
            </div>
            <div className="p-4 flex-1 overflow-y-auto container mx-auto">
               {children}
            </div>

         </main>
      </SidebarProvider>
   )
}