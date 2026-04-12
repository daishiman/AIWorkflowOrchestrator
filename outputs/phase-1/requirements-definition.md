# Phase 1: 要件定義書

## タスクID: UT-SKILL-WIZARD-W2-seq-03a

## 機能要件

- description / options / generationMode state の完全削除
- 全 template 条件分岐の除去
- inferSmartDefaults(formData) 純粋関数の実装（purpose小文字化、slack/github/notion大小文字不問検出）
- handleStep0Next() - formData→smartDefaults推論→Step 1遷移
- handleGenerate(method: "complete" | "skip") - generationLockRef + isGenerating で二重呼び出し防止
- handleQualityFeedback(satisfied: boolean) - trackEvent呼び出し
- handleRetry() - formData保持、answers/smartDefaults/skillPath等リセット、Step 0復帰
- STEPS = ["スキル情報入力", "詳細設定", "生成", "完了"]
- Step 3 で skillPath を表示
- hasExternalIntegration / externalToolName を CompleteStep に接続

## 非機能要件

- TypeScript 型エラー 0件
- ESLint エラー 0件
- 全テスト Green（vitest）

## 実装状況（2026-04-11）

- 新state・ハンドラは実装済み
- 削除対象の generationMode / hasActivatedLlmMode / llmDescription state が残存
- Step 0 のテンプレート切替UIが残存
