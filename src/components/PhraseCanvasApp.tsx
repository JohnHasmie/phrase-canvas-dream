import { useState, useEffect, useCallback } from "react";
import { Phrase, Balloon, User, DragState } from "@/types/canvas";
import { generatePhrases } from "@/data/phrases";
import { AuthForm } from "./AuthForm";
import { Header } from "./Header";
import { PhraseList } from "./PhraseList";
import { Canvas } from "./Canvas";
import { toast } from "sonner";

export const PhraseCanvasApp = () => {
  const [user, setUser] = useState<User | null>(null);
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragItem: null,
    dragOffset: { x: 0, y: 0 }
  });

  // Initialize phrases and check for existing user session
  useEffect(() => {
    setPhrases(generatePhrases());
    
    // Check for existing user session
    const savedUser = localStorage.getItem('phrase-canvas-user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser({
          id: userData.id,
          email: userData.email,
          lastLogin: new Date(userData.lastLogin)
        });
        
        // Load saved balloons for this user
        const savedBalloons = localStorage.getItem(`phrase-canvas-balloons-${userData.id}`);
        if (savedBalloons) {
          const balloonsData = JSON.parse(savedBalloons);
          setBalloons(balloonsData);
          
          // Remove phrases that are already on canvas
          const usedPhraseIds = balloonsData.map((b: Balloon) => b.phrase.id);
          setPhrases(prev => prev.filter(p => !usedPhraseIds.includes(p.id)));
        }
      } catch (error) {
        console.error('Error loading user session:', error);
        localStorage.removeItem('phrase-canvas-user');
      }
    }
  }, []);

  // Save balloons whenever they change (continuous save)
  useEffect(() => {
    if (user && balloons.length >= 0) {
      localStorage.setItem(`phrase-canvas-balloons-${user.id}`, JSON.stringify(balloons));
    }
  }, [balloons, user]);

  const handleAuth = (userData: { id: string; email: string }) => {
    const userWithTimestamp = {
      ...userData,
      lastLogin: new Date()
    };
    setUser(userWithTimestamp);
    toast.success("Welcome to Phrase Canvas!");
  };

  const handleLogout = () => {
    setUser(null);
    setPhrases(generatePhrases());
    setBalloons([]);
    setDragState({
      isDragging: false,
      dragItem: null,
      dragOffset: { x: 0, y: 0 }
    });
    toast.success("Signed out successfully");
  };

  const handleDragStart = useCallback((phrase: Phrase, startPos: { x: number; y: number }) => {
    setDragState({
      isDragging: true,
      dragItem: phrase,
      dragOffset: startPos
    });

    const handleMouseMove = (e: MouseEvent) => {
      setDragState(prev => ({
        ...prev,
        dragOffset: { x: e.clientX, y: e.clientY }
      }));
    };

    const handleMouseUp = () => {
      setDragState(prev => ({
        ...prev,
        isDragging: false,
        dragItem: null
      }));
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  const handleCreateBalloon = useCallback((phrase: Phrase, x: number, y: number) => {
    const textLength = phrase.text.length;
    const width = Math.max(120, textLength * 8 + 32);
    const height = 40;

    const newBalloon: Balloon = {
      id: `balloon-${Date.now()}-${Math.random()}`,
      phrase,
      x: Math.max(0, x - width / 2), // Center the balloon on cursor
      y: Math.max(0, y - height / 2),
      width,
      height
    };

    setBalloons(prev => [...prev, newBalloon]);
    setPhrases(prev => prev.filter(p => p.id !== phrase.id));
    
    toast.success(`Added "${phrase.text}" to canvas`);
  }, []);

  const handleMoveBalloon = useCallback((id: string, x: number, y: number) => {
    setBalloons(prev => prev.map(balloon => 
      balloon.id === id ? { ...balloon, x, y } : balloon
    ));
  }, []);

  const handleDeleteBalloon = useCallback((id: string) => {
    const balloonToDelete = balloons.find(b => b.id === id);
    if (balloonToDelete) {
      // Return phrase to list in its original position
      setPhrases(prev => {
        const newPhrases = [...prev, balloonToDelete.phrase];
        return newPhrases.sort((a, b) => a.originalIndex - b.originalIndex);
      });
      
      setBalloons(prev => prev.filter(b => b.id !== id));
      toast.success(`Removed "${balloonToDelete.phrase.text}" from canvas`);
    }
  }, [balloons]);

  // Show auth form if user not logged in
  if (!user) {
    return <AuthForm onAuth={handleAuth} />;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header user={user} onLogout={handleLogout} />
      
      <div className="flex-1 flex overflow-hidden">
        <PhraseList 
          phrases={phrases}
          onDragStart={handleDragStart}
        />
        
        <Canvas
          balloons={balloons}
          onCreateBalloon={handleCreateBalloon}
          onMoveBalloon={handleMoveBalloon}
          onDeleteBalloon={handleDeleteBalloon}
          isDragging={dragState.isDragging}
          dragItem={dragState.dragItem}
          dragPosition={dragState.dragOffset}
        />
      </div>
    </div>
  );
};