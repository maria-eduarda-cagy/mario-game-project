import { useEffect } from "react";
import type { JumpProps } from "../types";

export function Jump({
  src,
  alt = "Mario",
  marioRef,
  disabled,
  showInstructions,
  className = "",
  onJump,
}: JumpProps) {
  const jump = () => {
    if (disabled || showInstructions) return;
    if (!marioRef.current) return;
    if (marioRef.current.classList.contains("jump")) return;
    onJump?.();

    marioRef.current.classList.add("jump");
    setTimeout(() => {
      marioRef.current?.classList.remove("jump");
    }, 850);
  };

  useEffect(() => {
    if (showInstructions) return;

    const handleAction = () => {
      if (disabled) return;
      jump();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        handleAction();
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      event.preventDefault();
      handleAction();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [disabled, showInstructions]);

  return (
    <img
      ref={marioRef}
      src={src}
      alt={alt}
      className={`mario ${className}`}
      draggable={false}
    />
  );
}
