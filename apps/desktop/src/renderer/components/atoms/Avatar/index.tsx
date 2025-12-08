import React, { useState } from "react";
import clsx from "clsx";

export interface AvatarProps {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  fallback?: string;
  className?: string;
}

const sizeClasses = {
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-10 h-10 text-base",
  xl: "w-16 h-16 text-xl",
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = "md",
  fallback,
  className,
}) => {
  const [imageError, setImageError] = useState(false);

  const getFallbackText = () => {
    if (fallback) return fallback.slice(0, 2).toUpperCase();
    if (alt) return alt.slice(0, 2).toUpperCase();
    return "?";
  };

  const shouldShowFallback = !src || imageError;

  return (
    <div
      className={clsx(
        "rounded-full overflow-hidden flex items-center justify-center",
        "bg-gray-700 text-white font-medium",
        sizeClasses[size],
        className,
      )}
      role="img"
      aria-label={alt}
    >
      {shouldShowFallback ? (
        <span aria-hidden="true">{getFallbackText()}</span>
      ) : (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
};

Avatar.displayName = "Avatar";
