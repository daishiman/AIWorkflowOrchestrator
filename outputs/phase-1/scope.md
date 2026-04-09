# Phase 1 タスク4: スコープ定義書

## 調査日: 2026-04-08

---

## スコープ内

- SkillCreateWizard.tsx への `generationMode` state 追加
- Step 0 への生成モード選択 UI 追加（ラジオボタン）
- LLM モード時のシンプルな description 入力 UI（SkillInfoStep を経由しない）
- SkillCreateWizard.tsx への `planSkill` / `executePlan` ハンドラ追加
- GenerateStep への `localPlanResult`、`onExecutePlan`、`onCancelPlan` 接続
- `generationProgress` の表示（GenerateStep 経由）
- エラーハンドリング
- 既存テストの維持（W-7, W-8, M-3）
- スキップ中テストの `.skip` 解除と Green 確認

## スコープ外

- Preload API の変更（既存の planSkill / executePlan をそのまま使用）
- agentSlice の変更（既存の PlanResult 型・hooks をそのまま使用）
- SkillLifecyclePanel の変更
- SkillInfoStep / ConversationRoundStep のロジック変更
- improve / feedback フロー（別タスク）
- 認証情報（authMode/apiKey）の接続（初期実装では省略）

---

## 実装上の注意事項

### コードベースの現状差異

仕様書は DescribeStep → ConfigureStep 構成を前提としているが、実際のコードは **SkillInfoStep → ConversationRoundStep** 構成（W2-seq-03a 改修済み）。

以下の適応を行う：

- DescribeStep → SkillInfoStep（Step 0）
- ConfigureStep → ConversationRoundStep（Step 1）
- LLMモード時は SkillInfoStep を表示せず、独自の description textarea を Step 0 に表示

### ステップ番号対応

| ステップ番号 | コンポーネント                        | 備考                     |
| ------------ | ------------------------------------- | ------------------------ |
| 0            | SkillInfoStep + generationMode ラジオ | LLMモード時はシンプルUI  |
| 1            | ConversationRoundStep                 | テンプレートモード時のみ |
| 2            | GenerateStep                          | 生成中 / plan 結果表示   |
| 3            | CompleteStep                          | 完了                     |

LLMモード: step 0 → step 2 → step 3（step 1 スキップ）
テンプレートモード: step 0 → step 1 → step 2 → step 3（既存フロー）
