import { useState, useRef } from "react";
import { Phrase } from "@/types/canvas";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PhraseListProps {
  phrases: Phrase[];
  onDragStart: (phrase: Phrase, startPos: { x: number; y: number }) => void;
}

export const PhraseList = ({ phrases, onDragStart }: PhraseListProps) => {
  const [draggedPhrase, setDraggedPhrase] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, phrase: Phrase) => {
    e.preventDefault();
    setDraggedPhrase(phrase.id);
    
    // Get the mouse position relative to the viewport
    const startPos = {
      x: e.clientX,
      y: e.clientY
    };
    
    onDragStart(phrase, startPos);
  };

  const handleMouseUp = () => {
    setDraggedPhrase(null);
  };

  return (
    <div className="w-80 h-full bg-phrase-list border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Phrase Library</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Drag phrases to your canvas ({phrases.length} available)
        </p>
      </div>
      
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1" ref={listRef}>
          {phrases.map((phrase) => (
            <div
              key={phrase.id}
              className={`
                p-3 rounded-md cursor-grab text-sm transition-colors
                hover:bg-phrase-item-hover border border-transparent
                ${draggedPhrase === phrase.id ? 'opacity-50 cursor-grabbing' : ''}
                hover:border-border
              `}
              onMouseDown={(e) => handleMouseDown(e, phrase)}
              onMouseUp={handleMouseUp}
              draggable={false} // Prevent default HTML5 drag
            >
              <span className="text-xs text-muted-foreground mr-2">
                {phrase.originalIndex + 1}.
              </span>
              {phrase.text}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};