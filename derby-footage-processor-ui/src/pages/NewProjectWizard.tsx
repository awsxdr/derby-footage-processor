import { AddFootageWizardStep } from "@/components/AddFootageWizardStep";
import { AddOverlayWizardStep } from "@/components/AddOverlayWizardStep";
import { CancelButton } from "@/components/CancelButton";
import { Spinner } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { CenteredDialog } from "@/layouts";
import { cn } from "cn";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router";

export const NewProjectWizard = () => {

    const navigate = useNavigate();

    const handleCancel = useCallback(() => {
        navigate('/');
    }, [navigate]);

    const [readyToContinue, setReadyToContinue] = useState(false);
    const [isBusy, setIsBusy] = useState(false);

    const pages = useMemo(() => [
        () => (<AddFootageWizardStep onBusyChanged={setIsBusy} onReadyToContinueChanged={setReadyToContinue} />),
        () => (<AddOverlayWizardStep onBusyChanged={setIsBusy} onReadyToContinueChanged={setReadyToContinue} />),
    ], [setReadyToContinue]);

    const [currentPage, setCurrentPage] = useState(0);

    const handleNext = useCallback(async () => {
        if (currentPage + 1 >= pages.length) {
            await window.api.generateDefaultPeriods();
            await navigate('/project');
            return;
        }
        setCurrentPage(s => s + 1);
    }, [currentPage, setCurrentPage]);

    const handleBack = useCallback(() => {
        setCurrentPage(s => s - 1);
    }, [setCurrentPage]);

    return (
        <CenteredDialog
            title="New Project"
            content={
                <div className="relative w-[75vw] max-w-[1200px] max-h-[80vh]">
                    <div className={cn(["relative flex flex-col gap-4", isBusy && "opacity-25"])}>
                        {pages[currentPage]()}
                        <div className="flex">
                            <CancelButton onCancel={handleCancel} />
                            <div className="flex justify-end w-full gap-2">
                                <Button 
                                    variant="secondary"
                                    disabled={currentPage === 0}
                                    onClick={handleBack}
                                >
                                    Back
                                </Button>
                                <Button 
                                    disabled={!readyToContinue}
                                    onClick={handleNext}
                                >
                                    {(currentPage < pages.length - 1 ? "Next" : "Finish")}
                                </Button>
                            </div>
                        </div>
                    </div>
                    { isBusy && (
                        <div className="absolute w-full h-full flex justify-center align-center top-0 bottom-0 items-center">
                            <Spinner className="size-8" />
                        </div>
                    )}
                </div>
            }
        />
    );
}