/**
 * @file CompleteStep.tsx
 * @description スキル作成ウィザードの完了ステップ
 * @task TASK-10A-C, UT-SKILL-WIZARD-W1-par-02c, UT-SKILL-WIZARD-W2-seq-03a
 *
 * W1-par-02c: action cards / quality feedback / external integration / onRetry 追加
 * W2-seq-03a: skillPath prop 追加・onClose 後方互換維持
 */

import React, { useState, useCallback } from "react";

export interface GeneratedSkill {
  path?: string;
  name?: string;
}

export interface CompleteStepProps {
  skillPath?: string | null;
  /** 外部ツール連携が必要かどうか（W2-seq-03a） */
  hasExternalIntegration?: boolean;
  /** 外部ツール名（W2-seq-03a） */
  externalToolName?: string | null;
  /** 今すぐ実行するアクションカード（W2-seq-03a） */
  onExecuteNow?: () => void;
  /** エディタで開くアクションカード（W2-seq-03a） */
  onOpenInEditor?: () => void;
  /** 別のスキルを作るアクションカード（W2-seq-03a） */
  onCreateAnother?: () => void;
  /** 品質フィードバックハンドラ（W2-seq-03a） */
  onQualityFeedback?: (satisfied: boolean) => void;
  /** 👎 → Step 0 復帰（W2-seq-03a） */
  onRetry?: () => void;
  /** 後方互換: 閉じるボタン */
  onClose?: () => void;
}

const HEADER_MESSAGE = "スキルの骨格を生成しました" as const;
const HEADER_SUB_MESSAGE =
  "※ これは骨格です。完全に動作するまでには設定が必要な場合があります。" as const;

const styles = {
  card: [
    "flex flex-col items-center gap-2 rounded-xl w-full",
    "border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4",
    "text-sm font-medium",
    "hover:bg-[var(--bg-hover)] transition-colors",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" "),
  feedbackButton: [
    "rounded-lg px-4 py-2 text-sm font-medium",
    "border border-[var(--border-primary)]",
    "hover:bg-[var(--bg-hover)]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" "),
  header: "text-xl font-semibold text-[var(--text-primary)]",
  subText: "text-sm text-[var(--text-secondary)] mt-1",
} as const;

export const CompleteStep: React.FC<CompleteStepProps> = ({
  skillPath,
  hasExternalIntegration = false,
  externalToolName,
  onExecuteNow,
  onOpenInEditor,
  onCreateAnother,
  onQualityFeedback,
  onRetry,
  onClose,
}) => {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [webhookChecked, setWebhookChecked] = useState(false);
  const [testRunChecked, setTestRunChecked] = useState(false);

  const handleSatisfied = useCallback(() => {
    if (feedbackSubmitted) return;
    setFeedbackSubmitted(true);
    onQualityFeedback?.(true);
  }, [feedbackSubmitted, onQualityFeedback]);

  const handleUnsatisfied = useCallback(() => {
    if (feedbackSubmitted) return;
    setFeedbackSubmitted(true);
    try {
      onQualityFeedback?.(false);
    } finally {
      // フィードバック処理が失敗しても、回復導線は止めない
      onRetry?.();
    }
  }, [feedbackSubmitted, onQualityFeedback, onRetry]);

  const nextActions = [
    {
      testId: "complete-step-action-execute",
      label: "今すぐ実行する",
      icon: "▶",
      ariaLabel: "今すぐ実行する",
      handler: onExecuteNow,
    },
    {
      testId: "complete-step-action-open-editor",
      label: "エディタで開く",
      icon: "✏",
      ariaLabel: "エディタで開く",
      handler: onOpenInEditor,
    },
    {
      testId: "complete-step-action-create-another",
      label: "別のスキルを作る",
      icon: "＋",
      ariaLabel: "別のスキルを作る",
      handler: onCreateAnother,
    },
  ] as const;

  return (
    <div data-testid="complete-step" className="flex flex-col gap-6 py-6">
      {/* CompleteHeader */}
      <div
        data-testid="complete-step-header"
        role="status"
        className="flex flex-col items-center gap-1 text-center"
      >
        <span aria-hidden="true" className="text-2xl">
          ✓
        </span>
        <h2 className={styles.header}>{HEADER_MESSAGE}</h2>
        <p className={styles.subText}>{HEADER_SUB_MESSAGE}</p>
      </div>

      {/* SkillPath */}
      {skillPath && (
        <section
          data-testid="complete-step-skill-path"
          className="flex flex-col gap-1 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-3"
        >
          <p className="text-xs text-[var(--text-tertiary)]">生成先パス</p>
          <code className="text-xs break-all text-[var(--text-primary)]">
            {skillPath}
          </code>
        </section>
      )}

      {/* QualityFeedback */}
      <section className="flex flex-col items-center gap-3">
        <p className="text-sm text-[var(--text-secondary)]">
          この骨格は期待通りでしたか？
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            data-testid="complete-step-feedback-satisfied"
            aria-label="期待通り"
            disabled={feedbackSubmitted}
            onClick={handleSatisfied}
            className={styles.feedbackButton}
          >
            👍 はい
          </button>
          <button
            type="button"
            data-testid="complete-step-feedback-unsatisfied"
            aria-label="イメージと違う、やり直す"
            disabled={feedbackSubmitted}
            onClick={handleUnsatisfied}
            className={styles.feedbackButton}
          >
            👎 イメージと違う → やり直す
          </button>
        </div>
      </section>

      {/* NextActionCards */}
      <section
        aria-label="次のアクション"
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
      >
        {nextActions.map((action) => (
          <button
            key={action.testId}
            type="button"
            data-testid={action.testId}
            aria-label={action.ariaLabel}
            disabled={!action.handler}
            aria-disabled={!action.handler ? "true" : undefined}
            onClick={() => action.handler?.()}
            className={styles.card}
          >
            <span aria-hidden="true" className="text-lg">
              {action.icon}
            </span>
            <span>{action.label}</span>
          </button>
        ))}
      </section>

      {/* ExternalIntegrationChecklist（条件付き表示） */}
      {hasExternalIntegration && (
        <section
          data-testid="complete-step-external-checklist"
          className="flex flex-col gap-2"
        >
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            動作確認チェック
          </h3>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              data-testid="complete-step-check-webhook"
              checked={webhookChecked}
              onChange={(e) => setWebhookChecked(e.target.checked)}
              aria-checked={webhookChecked}
            />
            <span className="truncate">
              {externalToolName ?? "外部ツール"} Webhook URL を設定する
            </span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              data-testid="complete-step-check-test-run"
              checked={testRunChecked}
              onChange={(e) => setTestRunChecked(e.target.checked)}
              aria-checked={testRunChecked}
            />
            テスト実行で動作確認する
          </label>
        </section>
      )}

      {/* 後方互換: 閉じるボタン */}
      {onClose && (
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-[var(--status-primary)] text-[var(--text-inverse)]"
          >
            閉じる
          </button>
        </div>
      )}
    </div>
  );
};

CompleteStep.displayName = "CompleteStep";
