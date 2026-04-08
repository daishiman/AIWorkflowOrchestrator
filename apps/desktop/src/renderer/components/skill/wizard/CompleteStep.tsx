/**
 * @file CompleteStep.tsx
 * @description スキル作成ウィザード完了ステップ（起点画面）
 * @task UT-SKILL-WIZARD-W1-par-02c
 */

import React, { useState, useCallback } from "react";

/**
 * 生成結果コンテキスト。
 * CompleteStep は表示文言を変えず、親オーケストレーションのコンテキストとして保持するのみ。
 * 生成結果の詳細表示は W2-seq-03a が担当する。
 */
export interface GeneratedSkill {
  path?: string;
  name?: string;
}

export interface CompleteStepProps {
  /** 親から受け取る生成結果コンテキスト。表示文言には使用しない */
  generatedSkill: GeneratedSkill | null;
  hasExternalIntegration: boolean;
  externalToolName?: string;
  onExecuteNow?: () => void;
  onOpenInEditor?: () => void;
  onCreateAnother?: () => void;
  /** フィードバック受信（必須）。satisfied=true:👍, false:👎 */
  onQualityFeedback: (satisfied: boolean) => void;
  /** リカバリーフロー用: Step 0 への復帰トリガー。Step 0 のプリフィルは W2-seq-03a が担当 */
  onRetry?: () => void;
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
  hasExternalIntegration,
  externalToolName,
  onExecuteNow,
  onOpenInEditor,
  onCreateAnother,
  onQualityFeedback,
  onRetry,
}) => {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [webhookChecked, setWebhookChecked] = useState(false);
  const [testRunChecked, setTestRunChecked] = useState(false);

  const handleSatisfied = useCallback(() => {
    if (feedbackSubmitted) return;
    setFeedbackSubmitted(true);
    onQualityFeedback(true);
  }, [feedbackSubmitted, onQualityFeedback]);

  const handleUnsatisfied = useCallback(() => {
    if (feedbackSubmitted) return;
    setFeedbackSubmitted(true);
    onQualityFeedback(false);
    onRetry?.();
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
    </div>
  );
};

CompleteStep.displayName = "CompleteStep";
