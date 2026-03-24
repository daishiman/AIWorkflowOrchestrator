import React from "react";

export const ExecutionConsoleView: React.FC = () => {
  return (
    <div
      className="flex h-full items-center justify-center"
      data-testid="execution-console-view"
    >
      <p className="text-[var(--text-secondary)]">
        実行コンソール — Task02/03 で内部コンポーネントを実装
      </p>
    </div>
  );
};

export default ExecutionConsoleView;
