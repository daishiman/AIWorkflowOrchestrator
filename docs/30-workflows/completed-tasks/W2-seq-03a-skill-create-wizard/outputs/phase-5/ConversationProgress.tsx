import React from "react";

export interface ConversationProgressProps {
  current: number;
  estimatedTotal: number;
}

export const ConversationProgress: React.FC<ConversationProgressProps> = ({
  current,
  estimatedTotal,
}) => {
  const percentage =
    estimatedTotal > 0 ? Math.min((current / estimatedTotal) * 100, 100) : 0;

  return (
    <div className="mb-4">
      <p className="text-sm text-gray-600 mb-1">
        質問 {current} / {estimatedTotal}
      </p>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          role="progressbar"
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={estimatedTotal}
        />
      </div>
    </div>
  );
};
