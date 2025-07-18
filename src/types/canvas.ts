export interface Phrase {
  id: string;
  text: string;
  originalIndex: number;
}

export interface Balloon {
  id: string;
  phrase: Phrase;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface User {
  id: string;
  email: string;
  lastLogin: Date;
}

export interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
}

export interface DragState {
  isDragging: boolean;
  dragItem: Phrase | null;
  dragOffset: { x: number; y: number };
}