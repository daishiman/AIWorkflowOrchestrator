import React from "react";
import clsx from "clsx";
import { GlassPanel } from "../GlassPanel";

export interface SettingsCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  children,
  className,
  id,
}) => {
  return (
    <GlassPanel radius="md" blur="md" className={clsx("p-6", className)}>
      <div className="mb-4">
        <h3 id={id} className="text-lg font-semibold text-white">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-white/60">{description}</p>
        )}
      </div>

      <div className="space-y-4">{children}</div>
    </GlassPanel>
  );
};

SettingsCard.displayName = "SettingsCard";
