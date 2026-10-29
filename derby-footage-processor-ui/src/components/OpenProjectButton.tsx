import { useCallback, useRef } from "react";
import { Button } from "./ui/button"

export const OpenProjectButton = () => {

    const projectFileInputRef = useRef<HTMLInputElement>(null);
    
    const handleOpenProject = useCallback(() => {
        projectFileInputRef.current?.click();
    }, [projectFileInputRef]);

    return (
        <>
            <Button onClick={handleOpenProject}>Open Project</Button>
            <input type="file" id="projectFile" accept=".dfpproj" className="hidden" ref={projectFileInputRef} />
        </>
    )
}