import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui";

export type YesNoAlertDialogProps = {
    title: string;
    description?: string;
    open: boolean;
    onYes: () => void;
    onNo: () => void;
}

export const YesNoAlertDialog = ({ title, description, open, onYes, onNo }: YesNoAlertDialogProps) => (
    <AlertDialog open={open}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>
                    {title}
                </AlertDialogTitle>
                <AlertDialogDescription>
                    {description}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={onNo}>No</AlertDialogCancel>
                <AlertDialogAction onClick={onYes}>Yes</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
)