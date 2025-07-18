import { useState, useRef, useEffect, useCallback } from "react";
import { Balloon, Phrase, CanvasState } from "@/types/canvas";
import { WordBalloon } from "./WordBalloon";
import { ZoomIn, ZoomOut, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CanvasProps {
  balloons: Balloon[];
  onCreateBalloon: (phrase: Phrase, x: number, y: number) => void;
  onMoveBalloon: (id: string, x: number, y: number) => void;
  onDeleteBalloon: (id: string) => void;
  isDragging: boolean;
  dragItem: Phrase | null;
  dragPosition: { x: number; y: number };
}

export const Canvas = ({
  balloons,
  onCreateBalloon,
  onMoveBalloon,
  onDeleteBalloon,
  isDragging,
  dragItem,
  dragPosition
}: CanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedBalloon, setSelectedBalloon] = useState<string | null>(null);
  const [canvasState, setCanvasState] = useState<CanvasState>({
    zoom: 1,
    panX: 0,
    panY: 0
  });
  
  // Handle dropping phrases onto canvas
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isDragging && dragItem && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - canvasState.panX) / canvasState.zoom;
      const y = (e.clientY - rect.top - canvasState.panY) / canvasState.zoom;
      
      // Calculate balloon dimensions based on text length
      const textLength = dragItem.text.length;
      const width = Math.max(120, textLength * 8 + 32); // Dynamic width based on text length
      const height = 40; // Fixed height
      
      onCreateBalloon(dragItem, x, y);
    }
  }, [isDragging, dragItem, canvasState, onCreateBalloon]);

  // Handle canvas click to deselect balloons
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedBalloon(null);
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    setCanvasState(prev => ({
      ...prev,
      zoom: Math.min(prev.zoom * 1.2, 3)
    }));
  };

  const handleZoomOut = () => {
    setCanvasState(prev => ({
      ...prev,
      zoom: Math.max(prev.zoom / 1.2, 0.3)
    }));
  };

  const handleResetView = () => {
    setCanvasState({
      zoom: 1,
      panX: 0,
      panY: 0
    });
  };

  // Panning functionality
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const handlePanStart = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) { // Middle mouse or Ctrl+click
      setIsPanning(true);
      setPanStart({
        x: e.clientX - canvasState.panX,
        y: e.clientY - canvasState.panY
      });
      e.preventDefault();
    }
  };

  const handlePanMove = useCallback((e: MouseEvent) => {
    if (isPanning) {
      setCanvasState(prev => ({
        ...prev,
        panX: e.clientX - panStart.x,
        panY: e.clientY - panStart.y
      }));
    }
  }, [isPanning, panStart]);

  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handlePanMove);
      document.addEventListener('mouseup', handlePanEnd);
      
      return () => {
        document.removeEventListener('mousemove', handlePanMove);
        document.removeEventListener('mouseup', handlePanEnd);
      };
    }
  }, [isPanning, handlePanMove, handlePanEnd]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedBalloon && e.key === 'Delete') {
        onDeleteBalloon(selectedBalloon);
        setSelectedBalloon(null);
      }
      if (e.key === 'Escape') {
        setSelectedBalloon(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedBalloon, onDeleteBalloon]);

  return (
    <div className="flex-1 relative overflow-hidden">
      {/* Canvas Controls */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleZoomIn}
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleResetView}
          title="Reset View"
        >
          <Home size={16} />
        </Button>
      </div>

      {/* Canvas Container */}
      <div
        ref={canvasRef}
        className="canvas-container w-full h-full bg-canvas-gradient cursor-grab active:cursor-grabbing relative overflow-hidden"
        onMouseUp={handleMouseUp}
        onClick={handleCanvasClick}
        onMouseDown={handlePanStart}
        style={{
          cursor: isPanning ? 'grabbing' : isDragging ? 'copy' : 'grab'
        }}
      >
        {/* Canvas Content - transformed by zoom and pan */}
        <div
          className="w-full h-full relative"
          style={{
            transform: `translate(${canvasState.panX}px, ${canvasState.panY}px) scale(${canvasState.zoom})`,
            transformOrigin: '0 0'
          }}
        >
          {/* Render all balloons */}
          {balloons.map((balloon) => (
            <WordBalloon
              key={balloon.id}
              balloon={balloon}
              canvasHeight={canvasRef.current?.clientHeight || 600}
              isSelected={selectedBalloon === balloon.id}
              onMove={onMoveBalloon}
              onDelete={onDeleteBalloon}
              onSelect={setSelectedBalloon}
            />
          ))}

          {/* Preview balloon while dragging */}
          {isDragging && dragItem && (
            <div
              className="absolute pointer-events-none rounded-lg border border-dashed border-primary bg-primary/20 p-2 text-sm z-30"
              style={{
                left: (dragPosition.x - (canvasRef.current?.getBoundingClientRect().left || 0) - canvasState.panX) / canvasState.zoom,
                top: (dragPosition.y - (canvasRef.current?.getBoundingClientRect().top || 0) - canvasState.panY) / canvasState.zoom,
                width: Math.max(120, dragItem.text.length * 8 + 32),
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {dragItem.text}
            </div>
          )}
        </div>
      </div>

      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 text-sm text-muted-foreground max-w-xs">
        <div className="space-y-1">
          <p><strong>Drag</strong> phrases from the list to create balloons</p>
          <p><strong>Click</strong> balloons to select them</p>
          <p><strong>Delete</strong> key or X button to remove balloons</p>
          <p><strong>Ctrl+click</strong> or middle mouse to pan canvas</p>
        </div>
      </div>
    </div>
  );
};