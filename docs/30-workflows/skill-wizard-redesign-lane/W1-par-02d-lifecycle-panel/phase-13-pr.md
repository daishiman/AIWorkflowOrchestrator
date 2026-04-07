# Phase 13: PR準備（blocked）

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| Phase      | 13                                                       |
| Phase名    | PR準備（blocked）                                        |
| タスクID   | UT-SKILL-WIZARD-W1-par-02d                               |
| 機能名     | SkillLifecyclePanel テキストエリア削除・ウィザード遷移化 |
| 前提Phase  | Phase 12: ドキュメント整備                               |
| 次Phase    | -                                                        |
| ステータス | blocked                                                  |
| 作成日     | 2026-04-07                                               |

## 目的

ユーザー承認がある場合のみ、変更サマリと local check をまとめて PR の下書きを作る。現時点では commit / push / PR を実行せず、blocked を維持する。

## 実行原則

- ユーザー承認がない限り commit / push / PR を実行しない
- W2-seq-03a（SkillCreateWizard）との統合後に `onOpenSkillWizard` の end-to-end 接続が完成する
- Phase 13 は README 的な readiness 記録に閉じ、実際のマージ作業は承認後に別 wave で行う
- タスクディレクトリの移動は merge 後にのみ実施する

## 実行タスク

### Task 1: 変更要約の準備

PR 下書きに残す変更点を整理する:

- 改修対象ファイル: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- 更新テスト群: `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel*.test.tsx`
- 削除内容: `request` state、`handleCreate()`、`handlePrepare()`、テキストエリア、「スキルを生成する」ボタン、「方針を決める」ボタン、「1. 依頼をまとめる」セクション
- 追加内容: `onOpenSkillWizard` Props、「1. スキルを作成する」セクション、ウィザード遷移ボタン（`skill-lifecycle-open-wizard-button`）
- 影響ファイル: `SkillLifecyclePanel` の呼び出し元と、分割されたテストスイート

### Task 2: blocked 条件の確認

- ユーザー承認がない限り commit / push / PR を実行しない
- `onOpenSkillWizard` の実装接続は W2-seq-03a 後の follow-up で完成する
- Phase 13 の成果物は readiness 記録のみとし、PR URL は記録しない

### Task 3: マージ前チェックリスト

承認後に実行する local check を readiness として列挙する。

```bash
# 最終テスト
pnpm --filter @repo/desktop vitest run -- SkillLifecyclePanel

# 型チェック
pnpm --filter @repo/desktop tsc --noEmit

# Lint
pnpm --filter @repo/desktop eslint apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# フォーマット確認
pnpm --filter @repo/desktop prettier --check apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

### Task 4: PR readiness 下書き

承認後に PR 本文へ転用できる下書きを `outputs/phase-13/pr-readiness.md` にまとめる。

PR 下書きの骨子:

```
## Summary
- UT-SKILL-WIZARD-W1-par-02d: SkillLifecyclePanel をテキストエリア廃止・ウィザード遷移化
- 旧: テキストエリア + 「スキルを生成する」/「方針を決める」ボタン
- 新: 「スキル作成ウィザードを開く →」ボタン1つに最小変更で置換

## Changed files
- apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
- apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel*.test.tsx
- SkillLifecyclePanel の呼び出し元（onOpenSkillWizard props 追加）

## Test plan
- `skill-lifecycle-open-wizard-button` が data-testid で取得できる
- ウィザードボタンクリックで `onOpenSkillWizard` が呼ばれる
- テキストエリア（`skill-lifecycle-request-input`）が存在しない
- 「スキルを生成する」ボタン（`skill-lifecycle-create-button`）が存在しない
- 「方針を決める」ボタン（`skill-lifecycle-prepare-button`）が存在しない
- 既存セクション（「2. スキルを確認する」等）が影響を受けていない
- 全自動テストが pass
```

### Task 5: blocked 状態の維持

- PR 作成前のため、タスクディレクトリは移動しない
- 承認が来るまで `outputs/phase-13/pr-readiness.md` のみを維持する

## 参照資料

| 資料名               | パス                                                     | 説明            |
| -------------------- | -------------------------------------------------------- | --------------- |
| 実装記録             | `outputs/phase-5/implementation-record.md`               | 変更内容        |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`                     | coverage 要約   |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`                     | 整理内容        |
| QAレポート           | `outputs/phase-9/qa-report.md`                           | 品質ゲート結果  |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`                | 判定            |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`                 | evidence        |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`               | 直前成果物      |
| 仕様準拠確認         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 の根拠 |

## 成果物

| 成果物      | パス                               | 説明                    |
| ----------- | ---------------------------------- | ----------------------- |
| PR 準備記録 | `outputs/phase-13/pr-readiness.md` | PR 下書き・blocked 理由 |

## 完了条件

- [ ] ユーザー承認の有無が明記されている
- [ ] blocked 条件が明記されている
- [ ] commit / push / PR を未実行であることが記録されている
- [ ] W2-seq-03a 統合後の統合テスト実施計画が記録されている
- [ ] PR readiness 下書きが記録されている
- [ ] 承認後に必要な成果物が定義されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、blocked のまま維持している

## 次Phase

- blocked: ユーザー承認待ち
