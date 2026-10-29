import { useEffect, useRef, useState, type MouseEvent, type TouchEvent, type CSSProperties } from "react";

type ColorSliderProps = {
    hue: number;
    onHueChanged?: (hue: number) => void;
    onHueCommitted?: (hue: number) => void;
}

export const ColorSlider = ({ hue, onHueChanged, onHueCommitted }: ColorSliderProps) => {

    const pickerRef = useRef<HTMLDivElement>(null);

    const [isDragging, setIsDragging] = useState(false);

    const calculateHueFromXOffset = (xOffset: number) =>
        pickerRef.current
            ? Math.min(Math.max(xOffset, 0), pickerRef.current.clientWidth) / pickerRef.current.clientWidth * 359
            : 0;

    useEffect(() => {
        if(!pickerRef.current) {
            return;
        }

        const handleMouseMove = (event: globalThis.MouseEvent) => {
            event.preventDefault();

            if(!pickerRef.current) {
                return;
            }

            const xOffset = event.clientX - pickerRef.current.getBoundingClientRect().left;
            const newHue = calculateHueFromXOffset(xOffset);

            onHueChanged?.(newHue);
        }

        const handleTouchMove = (event: globalThis.TouchEvent) => {
            event.preventDefault();

            if(!pickerRef.current) {
                return;
            }

            const xOffset = event.touches[0].clientX - pickerRef.current.getBoundingClientRect().left;
            const newHue = calculateHueFromXOffset(xOffset);

            onHueChanged?.(newHue);
        }

        const handleMouseDragEnd = (event: globalThis.MouseEvent) => {
            event.preventDefault();

            setIsDragging(false);

            if(!pickerRef.current) {
                return;
            }

            const xOffset = event.clientX - pickerRef.current.getBoundingClientRect().left;
            const newHue = calculateHueFromXOffset(xOffset);

            onHueCommitted?.(newHue);
        }

        const handleTouchDragEnd = (event: globalThis.TouchEvent) => {
            event.preventDefault();

            setIsDragging(false);

            if(!pickerRef.current) {
                return;
            }

            const xOffset = event.touches[0].clientX - pickerRef.current.getBoundingClientRect().left;
            const newHue = calculateHueFromXOffset(xOffset);

            onHueCommitted?.(newHue);
        }

        if(isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseDragEnd);
            document.addEventListener('touchmove', handleTouchMove);
            document.addEventListener('touchend', handleTouchDragEnd);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseDragEnd);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchDragEnd);
        }

    }, [isDragging]);

    const handleSliderDragStart = (event: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) => {
        event.preventDefault();

        setIsDragging(true);
    }

    return (
        <div className="h-[30px] w-full relative">
            <div 
                className="flex h-[20px] w-full" 
                onMouseDown={handleSliderDragStart}
                onTouchStart={handleSliderDragStart}
                ref={pickerRef}
            >
                <div className="bg-gradient-to-r from-[#ff0000] to-[#ffff00] grow"></div>
                <div className="bg-gradient-to-r from-[#ffff00] to-[#00ff00] grow"></div>
                <div className="bg-gradient-to-r from-[#00ff00] to-[#00ffff] grow"></div>
                <div className="bg-gradient-to-r from-[#00ffff] to-[#0000ff] grow"></div>
                <div className="bg-gradient-to-r from-[#0000ff] to-[#ff00ff] grow"></div>
                <div className="bg-gradient-to-r from-[#ff00ff] to-[#ff0000] grow"></div>

                <div 
                    className="w-[7px] h-[30px] border border-black rounded-[2px] absolute top-[-5px] left-[calc(var(--slider-value)-3px)]" 
                    style={{ '--slider-value': `${hue / 360 * 100}%` } as CSSProperties}
                    onMouseDown={handleSliderDragStart}
                    onTouchStart={handleSliderDragStart}
                >
                    <div className="w-[5px] h-[28px] border border-white rounded-[1px]">
                        <div className="w-[3px] h-[26px] border border-black">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}