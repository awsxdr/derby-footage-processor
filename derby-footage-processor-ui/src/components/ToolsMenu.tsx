import type { Project } from "@/types"
import { MenubarContent, MenubarGroup, MenubarItem, MenubarMenu, MenubarTrigger } from "./ui";

export type ToolsMenuProps = {
    project: Project;
}

export const ToolsMenu = ({ project }: ToolsMenuProps) => {
    return (
        <MenubarMenu>
            <MenubarTrigger>Tools</MenubarTrigger>
            <MenubarContent>
                <MenubarGroup>
                    <MenubarItem>
                        Auto-detect events
                    </MenubarItem>
                </MenubarGroup>
            </MenubarContent>
        </MenubarMenu>
    )
}