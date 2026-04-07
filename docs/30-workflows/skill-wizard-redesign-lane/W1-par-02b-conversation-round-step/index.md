# W1-par-02b: ConversationRoundStep コンポーネント実装（Step 1）

## メタ情報

- タスクID: UT-SKILL-WIZARD-W1-par-02b
- 機能名: ConversationRoundStep コンポーネント実装（Step 1）
- 実行順: Wave 1（並列実行可）
- 依存: W0-seq-01完了後
- 作成日: 2026-04-07

## タスク概要

`apps/desktop/src/renderer/components/skill/wizard/ConfigureStep.tsx` を削除し、`ConversationRoundStep.tsx` を新規作成する。スキルウィザードの Step 1 として、6問のインタビュー形式でスキル設定を収集するUIコンポーネントを実装する。

## 実行原則（重要）

- **Phase 1-3 はゲート**: `task-specification-creator` / `aiworkflow-requirements` の2 skill 定義に対する準拠を確認し、Phase 3 で結論を固定する。
- **30種の思考法は Phase 3 に集約**: Phase 4 以降は Phase 3 の結論を消費するだけにし、解釈 drift を防ぐ。
- **Phase 3 は並列レーン必須**: 準拠監査と多角的思考分析の両方が揃うまで Phase 4 に進まない。
- **禁止**: ユーザー指示なしの `commit` / `push` / PR 作成。Phase 13 は本タスクのスコープ外のため **blocked 扱い** とする。

## SubAgent 編成（Phase 1-4）

| SubAgent   | 主目的               | 主な担当（Phase 1-4）                                                                                   | 実行形態           |
| ---------- | -------------------- | ------------------------------------------------------------------------------------------------------- | ------------------ |
| SubAgent-A | 差分・影響範囲の確定 | 既存 `ConfigureStep` / `WizardOptions` の調査、参照箇所洗い出し（Phase 1）、削除影響の再確認（Phase 3） | Phase 1/3 で並列可 |
| SubAgent-B | 仕様整合・準拠監査   | `aiworkflow-requirements` 仕様検索・整合チェック（Phase 1-3）、UI/UX・境界条件の論点整理（Phase 2-3）   | Phase 1-3 で並列可 |
| SubAgent-C | 30思考法監査         | 30思考法の適用結果を Phase 3 に集約し、結論（PASS/MINOR/FAIL）と必要アクションを固定                    | Phase 3 で並列可   |
| Lead       | 統合とゲート判定     | Phase 3 で SubAgent 結果を統合し、Phase 4 進行可否（4条件）を判定                                       | Phase 3 で直列     |

## 依存関係

- 前提: `W0-seq-01-types-skill-info-form` 完了（`SkillInfoFormData` / `SmartDefaultResult` の型が確定していること）
- 並列: `W1-par-02a-skill-info-step`（共有型定義 `packages/shared/src/types/skillCreator.ts` を取り込み、型契約は shared を起点とする）

## 実装スコープ

### 新規作成

- `ConversationRoundStep.tsx` — 6問・2ページ構成のインタビューフォーム

### 削除対象

- `ConfigureStep.tsx`（WizardOptions チェックボックス3個含む）
- `WizardOptions` 型のエクスポート

## UIコンポーネント仕様

### ページ構成

- Page 1: Q1〜Q3
- Page 2: Q4〜Q6
- 進捗バー: 「質問 N/6」常時表示

### 6問の内容

| 問  | 内容                     | 選択肢       | 備考                      |
| --- | ------------------------ | ------------ | ------------------------- |
| Q1  | 利用者（誰が使うか）     | 4択+自由入力 | —                         |
| Q2  | 入力データ（何を渡すか） | 4択+自由入力 | —                         |
| Q3  | 実行タイミング           | 4択+自由入力 | ②選択でスケジュールUI展開 |
| Q4  | 出力先（どこへ）         | 4択+自由入力 | —                         |
| Q5  | 外部ツール連携           | 4択+自由入力 | カテゴリ依存で必須/任意   |
| Q6  | 出力フォーマット         | 4択+自由入力 | —                         |

### 特記事項

- Q3 で「②定期実行」選択時: `SkillWizardScheduleConfig` 入力UI をインライン展開
- Q5: `formData.category === "external-integration"` のとき必須★
- 「今すぐ生成する」ボタン: 適用サマリーカードを表示してから生成
- 適用サマリーカード: 残問のデフォルト値一覧・dismissible・Q5未設定警告

## コンポーネントProps

```typescript
interface ConversationRoundStepProps {
  formData: SkillInfoFormData;
  smartDefaults: SmartDefaultResult;
  answers: ConversationAnswers;
  onAnswersChange: (answers: ConversationAnswers) => void;
  onBack: () => void;
  onGenerate: (method: "complete" | "skip") => void;
}
```

## Phase一覧

| Phase | ファイル                  | 内容               |
| ----- | ------------------------- | ------------------ |
| 1     | phase-1-requirements.md   | 要件定義           |
| 2     | phase-2-design.md         | 設計               |
| 3     | phase-3-design-review.md  | 設計レビュー       |
| 4     | phase-4-test-creation.md  | テスト作成         |
| 5     | phase-5-implementation.md | 実装               |
| 6     | phase-6-test-expansion.md | テスト拡充         |
| 7     | phase-7-coverage.md       | カバレッジ確認     |
| 8     | phase-8-refactoring.md    | リファクタリング   |
| 9     | phase-9-qa.md             | QA                 |
| 10    | phase-10-final-review.md  | 最終レビュー       |
| 11    | phase-11-manual-test.md   | 手動テスト         |
| 12    | phase-12-docs.md          | ドキュメント整備   |
| 13    | phase-13-pr.md            | PRレビュー・マージ |

## Phase 13 ポリシー（スコープ外のため blocked）

- 本タスクでは Phase 13 の実行（commit / push / PR 作成）を行わない。
- Phase 12 までの完了根拠を揃えた上で、**ユーザーの明示承認がある場合のみ** Phase 13 を再開する。
