import type { ReactNode } from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui";

export type RightSidebarProps = {
    mainContent?: ReactNode;
    sidebarContent?: ReactNode;
}

export const RightSidebar = ({ mainContent, sidebarContent }: RightSidebarProps) => {
    return (
        <main className="w-screen h-screen">
            <ResizablePanelGroup orientation="horizontal">
                <ResizablePanel minSize="35%">
                    { mainContent }
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize="20%" minSize="20%">
                    { sidebarContent }
                </ResizablePanel>
            </ResizablePanelGroup>
        </main>
    )
}