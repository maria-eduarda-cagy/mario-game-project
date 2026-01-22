export type JumpProps = {
  src: string;
  alt?: string;
  marioRef: React.RefObject<HTMLImageElement | null>;
  disabled?: boolean;
  className?: string;
  showInstructions?: boolean;
  onJump?: () => void;
};

export type HitBoxConfig = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

export type CollisionSide = "TOP" | "BOTTOM" | "LEFT" | "RIGHT";

export type ApplyGamePhysicsArgs = {
  boardEl: HTMLDivElement | null;
  pipeEl: HTMLImageElement | null;
  score: number;
};

export type PipeFlags = {
  counted: boolean;
  jumped: boolean;
  prevX: number | null;
};
