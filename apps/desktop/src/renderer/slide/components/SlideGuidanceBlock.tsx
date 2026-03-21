import React from "react";

export type GuidanceVariant = "guidance" | "degraded";

export interface GuidanceStep {
  label: string;
  description: string;
}

export interface SlideGuidanceBlockProps {
  variant: GuidanceVariant;
  title: string;
  reason: string;
  steps?: GuidanceStep[];
  primaryCTA: { label: string; onClick: () => void };
  secondaryCTA?: { label: string; onClick: () => void };
}

export const variantStyles: Record<GuidanceVariant, string> = {
  guidance:
    "border-[#007AFF] dark:border-[#0A84FF] bg-[rgba(0,122,255,0.08)] dark:bg-[rgba(10,132,255,0.08)]",
  degraded:
    "border-[#FF9500] dark:border-[#FF9F0A] bg-[rgba(255,149,0,0.12)] dark:bg-[rgba(255,159,10,0.12)]",
};

export const SlideGuidanceBlock: React.FC<SlideGuidanceBlockProps> = ({
  variant,
  title,
  reason,
  steps,
  primaryCTA,
  secondaryCTA,
}) => {
  const role = variant === "degraded" ? "alert" : "complementary";

  return (
    <div
      role={role}
      data-testid="slide-guidance-block"
      className={`rounded-xl border p-4 ${variantStyles[variant]}`}
      aria-label={title}
    >
      <p className="font-semibold text-[#000000] dark:text-[#FFFFFF] mb-1">
        {title}
      </p>
      <p className="text-sm text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)] mb-3">
        {reason}
      </p>
      {steps !== undefined && steps.length > 0 && (
        <ol className="mb-3 space-y-1 list-decimal list-inside text-sm text-[#3C3C43] dark:text-[rgba(235,235,245,0.6)]">
          {steps.map((step, index) => (
            <li key={index}>
              <span className="font-medium">{step.label}</span>
              {step.description ? `: ${step.description}` : ""}
            </li>
          ))}
        </ol>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={primaryCTA.onClick}
          className="rounded-lg px-4 py-2 text-sm font-medium bg-[#007AFF] dark:bg-[#0A84FF] text-white hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:ring-offset-2"
        >
          {primaryCTA.label}
        </button>
        {secondaryCTA !== undefined && (
          <button
            type="button"
            onClick={secondaryCTA.onClick}
            className="rounded-lg px-4 py-2 text-sm font-medium border border-[#C6C6C8] dark:border-[#38383A] text-[#3C3C43] dark:text-[rgba(235,235,245,0.6)] hover:bg-[#F2F2F7] dark:hover:bg-[#1C1C1E] transition-colors focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:ring-offset-2"
          >
            {secondaryCTA.label}
          </button>
        )}
      </div>
    </div>
  );
};
