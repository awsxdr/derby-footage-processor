import type { ReactNode } from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui";

export type RightSidebarProps = {
    menu?: ReactNode;
    mainContent?: ReactNode;
    sidebarContent?: ReactNode;
}

export const RightSidebar = ({ menu, mainContent, sidebarContent }: RightSidebarProps) => {
    return (
        <div className="w-screen h-screen grid grid-rows-[min-content_1fr] max-h-[100vh] overflow-hidden">
            <div className="grid-row-1 border-b-1">
                {menu}
            </div>
            <div className="grid-row-2">
                <ResizablePanelGroup orientation="horizontal">
                    <ResizablePanel minSize="35%">
                        <main className="w-full h-full max-h-[calc(100vh-var(--spacing)*9)]">
                            { mainContent }
                        </main>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize="35%" minSize="20%">
                        <aside className="w-full h-full max-h-[calc(100vh-var(--spacing)*9)] overflow-hidden">
                            { sidebarContent }
                        </aside>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    )
}