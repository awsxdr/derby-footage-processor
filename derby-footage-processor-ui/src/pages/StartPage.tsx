import { Button } from "@/components/ui/button"
import { CenteredDialog } from "../layouts"
import { useCallback } from "react"
import { useNavigate } from "react-router"

export const StartPage = () => {

    const navigate = useNavigate();

    const handleNewClick = useCallback(async () => {
        await window.api.startNewProject();
        await navigate('/newProject');
    }, [navigate]);

    return (
        <CenteredDialog
            title="Derby Footage Processor"
            content={(
                <div className="flex flex-col gap-2">
                    <div className="pb-2">What would you like to do?</div>
                    <Button onClick={handleNewClick}>New Project</Button>
                    <Button>Open Project</Button>
                </div>
            )}
        />
    )
}