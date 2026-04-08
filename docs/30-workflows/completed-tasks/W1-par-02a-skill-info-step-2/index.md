# W1-par-02a: SkillInfoStep コンポーネント実装（Step 0: スキル情報入力）

## メタ情報

- タスクID: UT-SKILL-WIZARD-W1-SKILL-INFO-STEP-001
- 機能名: SkillInfoStep コンポーネント実装（Step 0: スキル情報入力）
- 実行順: Wave 1（並列実行可）
- 依存: W0-seq-01 / W0-seq-02 完了後
- 作成日: 2026-04-08
- ステータス: **completed**（Issue #2012 クローズ済み / PR #2019 マージ済み）

## タスク概要

`apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx` に Step 0 の基本情報入力コンポーネントを実装し、
`apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx` で挙動を固定する。
Step 0 は `SkillInfoFormData` を受け取り、スキル名・目的・カテゴリの 3 項目を入力し、
`wizard/index.ts` から再利用できる状態にする。

## 実行原則（重要）

- **Phase 1-3 はゲート**: `task-specification-creator` / `aiworkflow-requirements` の 2 skill 定義への準拠を確認し、Phase 3 で結論を固定する。
- **30種の思考法は Phase 3 に集約**: Phase 4 以降は Phase 3 の結論を消費するだけにし、解釈 drift を防ぐ。
- **Phase 3 は並列レーン必須**: 準拠監査と多角的思考分析の両方が揃うまで Phase 4 に進まない。
- **禁止**: ユーザー指示なしの `commit` / `push` / PR 作成。

## SubAgent 編成（Phase 1-4）

| SubAgent   | 主目的               | 主な担当（Phase 1-4）                                                                | 実行形態           |
| ---------- | -------------------- | ------------------------------------------------------------------------------------ | ------------------ |
| SubAgent-A | 差分・影響範囲の確定 | 既存コンポーネントの調査・`SkillInfoFormData` / `SkillCategory` 型確認（Phase 1）    | Phase 1/3 で並列可 |
| SubAgent-B | 仕様整合・準拠監査   | `aiworkflow-requirements` 仕様検索・整合チェック（Phase 1-3）、UI 境界条件の整理     | Phase 1-3 で並列可 |
| SubAgent-C | 30思考法監査         | 30思考法の適用結果を Phase 3 に集約し、結論（PASS/MINOR/FAIL）と必要アクションを固定 | Phase 3 で並列可   |
| Lead       | 統合とゲート判定     | Phase 3 で SubAgent 結果を統合し、Phase 4 進行可否（4条件）を判定                    | Phase 3 で直列     |

## 依存関係

- 前提: `W0-seq-01-types-skill-info-form` 完了（`SkillInfoFormData` / `SkillCategory` の型が確定していること）
- 前提: `W0-seq-02-smart-default-reasoning-service` 完了（`inferSmartDefaults` が `@repo/shared` から公開済み）
- 並列: `W1-par-02b-conversation-round-step` / `W1-par-02c-complete-step` / `W1-par-02d-lifecycle-panel`

## 実装スコープ

### 新規作成

- `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx` — Step 0 フォームコンポーネント
- `apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx` — ユニットテスト

### 修正

- `apps/desktop/src/renderer/components/skill/wizard/index.ts` — `SkillInfoStep` の re-export 追加

## コンポーネントProps

```typescript
interface SkillInfoStepProps {
  formData: SkillInfoFormData;
  onFormDataChange: (data: SkillInfoFormData) => void;
  onNext: () => void;
}
```

## フィールド構成（3フィールド）

| フィールド | 入力 UI   | 型                      | 必須 | 補足                      |
| ---------- | --------- | ----------------------- | ---- | ------------------------- |
| スキル名   | text 入力 | `string \| undefined`   | 任意 | 空文字は許容              |
| 目的       | textarea  | `string`                | 必須 | 10文字以上で次へ可        |
| カテゴリ   | button 群 | `SkillCategory \| null` | 必須 | `null` を未選択として扱う |

## Phase一覧

| Phase | ファイル                  | 内容             | ステータス |
| ----- | ------------------------- | ---------------- | ---------- |
| 1     | phase-1-requirements.md   | 要件定義         | completed  |
| 2     | phase-2-design.md         | 設計             | completed  |
| 3     | phase-3-design-review.md  | 設計レビュー     | completed  |
| 4     | phase-4-test-creation.md  | テスト作成       | completed  |
| 5     | phase-5-implementation.md | 実装             | completed  |
| 6     | phase-6-test-expansion.md | テスト拡充       | completed  |
| 7     | phase-7-coverage.md       | カバレッジ確認   | completed  |
| 8     | phase-8-refactoring.md    | リファクタリング | completed  |
| 9     | phase-9-qa.md             | 品質検証         | completed  |
| 10    | phase-10-final-review.md  | 最終レビュー     | completed  |
| 11    | phase-11-manual-test.md   | 手動テスト       | completed  |
| 12    | phase-12-docs.md          | ドキュメント更新 | completed  |
| 13    | phase-13-pr.md            | PR 作成          | completed  |

## Phase 13 ポリシー

- 本タスクは Issue #2012 のクローズ・PR #2019 のマージにより全 Phase 完了済み。
- 現在のワークツリーでは commit / push / PR を実行しない。これは過去の完了記録であり、現タスクの操作指示ではない。

## 受入条件（AC）チェックリスト

| AC   | 内容                                                                                          | 判定 |
| ---- | --------------------------------------------------------------------------------------------- | ---- |
| AC-1 | `SkillInfoStep.tsx` が `apps/desktop/src/renderer/components/skill/wizard/` に存在する        | PASS |
| AC-2 | `SkillInfoStep` が `SkillInfoFormData` 型（`@repo/shared/types/skillCreator`）を props に使用 | PASS |
| AC-3 | スキル名・目的・カテゴリの 3フィールドが描画される                                            | PASS |
| AC-4 | カテゴリは `SkillCategory` 型の全値を選択肢として表示する                                     | PASS |
| AC-5 | フォーム変更が `onFormDataChange(data: SkillInfoFormData)` コールバックで親へ通知される       | PASS |
| AC-6 | `wizard/index.ts` から `SkillInfoStep` が export される                                       | PASS |
| AC-7 | `pnpm --filter @repo/desktop typecheck` が PASS する                                          | PASS |
| AC-8 | `pnpm --filter @repo/desktop lint` が PASS する                                               | PASS |
| AC-9 | `SkillInfoStep.test.tsx` の全テストが PASS する                                               | PASS |

## 関連タスク

| タスクID                                  | 関係     | 内容                                                                 |
| ----------------------------------------- | -------- | -------------------------------------------------------------------- |
| W0-seq-01-types-skill-info-form           | 直接依存 | `SkillInfoFormData` / `SkillCategory` 型定義（完了）                 |
| W0-seq-02-smart-default-reasoning-service | 間接依存 | `inferSmartDefaults` サービス（完了）                                |
| W1-par-02b-conversation-round-step        | 並列     | ConversationRoundStep.tsx（Step 1）実装                              |
| W1-par-02c-complete-step                  | 並列     | CompleteStep.tsx（完了画面）実装                                     |
| W1-par-02d-lifecycle-panel                | 並列     | SkillLifecyclePanel.tsx 遷移ボタン化                                 |
| W2-seq-03a-skill-create-wizard            | 後続     | SkillCreateWizard.tsx オーケストレーション（本タスク完了後に着手可） |

## 参照設計書

| ドキュメント                 | パス                                                                          |
| ---------------------------- | ----------------------------------------------------------------------------- |
| 元タスク仕様書（unassigned） | `docs/30-workflows/unassigned-task/UT-SKILL-WIZARD-W1-SKILL-INFO-STEP-001.md` |
| 共有型定義                   | `packages/shared/src/types/skillCreator.ts`                                   |
| ウィザードコンポーネント     | `apps/desktop/src/renderer/components/skill/wizard/`                          |
| Phase 1-13 フォーマット      | `.claude/skills/task-specification-creator/SKILL.md`                          |
| System spec 正本             | `.claude/skills/aiworkflow-requirements/SKILL.md`                             |
| レーンindex                  | `docs/30-workflows/skill-wizard-redesign-lane/index.md`                       |
