import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type CenteredDialogProps = {
    title?: string;
    content?: ReactNode;
}

export const CenteredDialog = ({ title, content }: CenteredDialogProps) => {
    return (
        <div className="w-screen h-screen flex items-center justify-center">
            <main>
                <Card className="shadow-2xl">
                    <CardHeader>
                        <CardTitle>{title}</CardTitle>
                    </CardHeader>
                    <CardContent className="min-w-80">
                        {content}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}