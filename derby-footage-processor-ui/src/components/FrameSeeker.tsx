import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cn } from "cn";
import { useCallback, useEffect, useRef, useState } from "react";
import { FrameTime } from "./FrameTime";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "./ui";
import { HugeiconsIcon } from "@hugeicons/react";
import { GreaterThanIcon, KeyframeBottomIcon, KeyframeIcon, LessThanIcon } from "@hugeicons/core-free-icons";

export type FrameSeekerProps = {
    min: number;
    max: number;
    value: number;
    className?: string;
    onValueChanged?: (value: number) => void;
};

export const FrameSeeker = ({ value, min, max, className, onValueChanged }: FrameSeekerProps) => {

    const [adjustValue, setAdjustValue] = useState(0);
    const adjustValueRef = useRef(0);
    const [uncommittedValue, setUncommittedValue] = useState(value);

    useEffect(() => {
        adjustValueRef.current = adjustValue;
    }, [adjustValue]);

    useEffect(() => {
        setUncommittedValue(value);
    }, [setUncommittedValue, value]);

    const handleAdjustValueCommitted = useCallback(() => {
        setAdjustValue(0);
        onValueChanged?.(uncommittedValue);
    }, [uncommittedValue, setAdjustValue]);

    const handleIncrementValue = useCallback(() => {
        onValueChanged?.(Math.min(max, uncommittedValue + 1));
    }, [uncommittedValue, max, onValueChanged]);

    const handleDecrementValue = useCallback(() => {
        onValueChanged?.(Math.max(min, uncommittedValue - 1));
    }, [uncommittedValue, min, onValueChanged]);

    useEffect(() => {
        const interval = setInterval(() => {
            if(adjustValueRef.current != 0) {
                setUncommittedValue(v => Math.min(max, Math.max(min, v + Math.pow(Math.floor(adjustValueRef.current / 10), 3))));
            }
        }, 100);

        return () => clearInterval(interval);
    }, [adjustValueRef, setUncommittedValue]);

    return (
        <div className="w-full flex flex-col items-center gap-2">
            <div className="flex gap-1 w-full items-center">
                <Button variant="ghost" size="icon-sm" onClick={handleDecrementValue}>
                    <HugeiconsIcon icon={LessThanIcon} />
                </Button>
                <SliderPrimitive.Root
                    className={cn("w-full", className)}
                    data-slot="slider"
                    defaultValue={0}
                    value={adjustValue}
                    min={-100}
                    max={100}
                    thumbAlignment="edge"
                    onValueChange={setAdjustValue}
                    onValueCommitted={handleAdjustValueCommitted}
                >
                    <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col">
                        <SliderPrimitive.Track
                            data-slot="slider-track"
                            className="relative grow overflow-hidden rounded-4xl bg-muted select-none data-horizontal:h-3 data-horizontal:w-full data-vertical:h-full data-vertical:w-3"
                        >
                        </SliderPrimitive.Track>
                        <SliderPrimitive.Thumb
                            data-slot="slider-thumb"
                            className="block h-4 w-8 shrink-0 rounded-4xl border border-primary bg-white shadow-sm ring-ring/50 transition-colors select-none hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
                        />
                    </SliderPrimitive.Control>
                </SliderPrimitive.Root>
                <Button variant="ghost" size="icon-sm" onClick={handleIncrementValue}>
                    <HugeiconsIcon icon={GreaterThanIcon} />
                </Button>
                <Tooltip>
                    <TooltipTrigger>
                        <Button variant="ghost" size="icon-sm">
                            <HugeiconsIcon icon={KeyframeIcon} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Use current frame</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger>
                        <Button variant="ghost" size="icon-sm">
                            <HugeiconsIcon icon={KeyframeBottomIcon} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>View frame</TooltipContent>
                </Tooltip>
            </div>
            <FrameTime frame={uncommittedValue} includeFrames />
        </div>
    );
};
