import { useState, useRef, useEffect } from "react";
import { Balloon } from "@/types/canvas";
import { X } from "lucide-react";

interface WordBalloonProps {
  balloon: Balloon;
  canvasHeight: number;
  isSelected: boolean;
  onMove: (id: string, x: number, y: number) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
}

export const WordBalloon = ({ 
  balloon, 
  canvasHeight, 
  isSelected, 
  onMove, 
  onDelete, 
  onSelect 
}: WordBalloonProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const balloonRef = useRef<HTMLDivElement>(null);

  // Calculate color based on vertical position (0 = top gradient color, 1 = bottom gradient color)
  const verticalRatio = Math.min(Math.max(balloon.y / canvasHeight, 0), 1);
  
  // Create a color that blends with the gradient background
  const getPositionColor = () => {
    // HSL colors for gradient positions
    const topHue = 280; // Purple
    const bottomHue = 120; // Green
    const hue = topHue + (bottomHue - topHue) * verticalRatio;
    
    return `hsl(${hue}, 70%, 85%)`; // Semi-transparent pastel color
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    onSelect(balloon.id);
    
    const rect = balloonRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const canvas = balloonRef.current?.closest('.canvas-container');
      const canvasRect = canvas?.getBoundingClientRect();
      
      if (canvasRect) {
        const newX = e.clientX - canvasRect.left - dragOffset.x;
        const newY = e.clientY - canvasRect.top - dragOffset.y;
        
        // Keep balloon within canvas bounds
        const maxX = canvasRect.width - balloon.width;
        const maxY = canvasRect.height - balloon.height;
        
        const clampedX = Math.max(0, Math.min(newX, maxX));
        const clampedY = Math.max(0, Math.min(newY, maxY));
        
        onMove(balloon.id, clampedX, clampedY);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(balloon.id);
  };

  return (
    <div
      ref={balloonRef}
      className={`
        absolute cursor-move select-none group
        rounded-lg border border-balloon-border
        shadow-sm transition-all duration-200
        ${isSelected ? 'ring-2 ring-primary ring-opacity-50' : ''}
        ${isDragging ? 'z-50 scale-105' : 'z-10'}
      `}
      style={{
        left: balloon.x,
        top: balloon.y,
        width: balloon.width,
        height: balloon.height,
        backgroundColor: getPositionColor(),
        boxShadow: isDragging 
          ? '0 8px 32px rgba(0, 0, 0, 0.15)' 
          : '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Delete button - only visible on hover or when selected */}
      <button
        className={`
          absolute -top-2 -right-2 w-6 h-6 rounded-full
          bg-destructive text-destructive-foreground
          flex items-center justify-center text-xs
          transition-opacity duration-200
          ${isSelected || isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
        `}
        onClick={handleDelete}
        title="Delete balloon"
      >
        <X size={12} />
      </button>
      
      {/* Phrase text */}
      <div className="p-2 h-full flex items-center justify-center text-center">
        <span className="text-sm font-medium text-foreground leading-tight">
          {balloon.phrase.text}
        </span>
      </div>
    </div>
  );
};
