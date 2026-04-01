# Phase 10: 最終レビュー

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| Phase        | 10                                 |
| タスクID     | TASK-FIX-LIFECYCLE-PANEL-ERROR-001 |
| ステータス   | 未実施                             |
| 担当         | 実装者                             |
| 見積もり時間 | 0.25h                              |

## 目的

AC-1〜AC-5 の全充足確認と PR 可否判定を行い、Phase 11 の手動テストに進む準備が整っているかを確認する。

## 実行タスク

1. AC-1〜AC-5 の充足確認
2. 変更量の確認（small であること）
3. PR 可否判定（RELEASE OK / BLOCKED）

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容           |
| ------------------ | ---------------------------------------------------------------------------- | -------------- |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | システム全体像 |

## 実行手順

### ステップ 1: AC-1〜AC-5 充足確認

| AC   | 受入条件                                                                                                   | 確認方法                 | 充足状態 |
| ---- | ---------------------------------------------------------------------------------------------------------- | ------------------------ | -------- |
| AC-1 | `phase === 'failed'` の snapshot を受け取ったとき、`setWorkflowError(null)` が呼ばれないこと               | TC-EP-01 PASS            | 確認対象 |
| AC-2 | `phase !== 'failed'` の snapshot を受け取ったとき、`setWorkflowError(null)` が呼ばれること（既存動作維持） | TC-EP-02/03 PASS         | 確認対象 |
| AC-3 | `handoffBundle` の処理は `phase` に関わらず変わらないこと                                                  | TC-EP-04/05/09 PASS      | 確認対象 |
| AC-4 | 既存テストが全て PASS すること                                                                             | 全テスト PASS（Phase 9） | 確認対象 |
| AC-5 | UI 上でスキル生成エラー発生時にエラーメッセージが表示されたままになること                                  | 手動テスト（Phase 11）   | 確認対象 |

### ステップ 2: 変更量の確認

```bash
# 変更差分を確認する
git diff apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# 変更行数を確認する
git diff --stat apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

期待される変更量:

- `SkillLifecyclePanel.tsx`: `+2 -0`（`if` ブロックの追加 2 行のみ）
- テストファイル: 新規作成（`SkillLifecyclePanel.error-persistence.test.tsx`）

### ステップ 3: PR 可否判定

以下の条件が全て満たされている場合に RELEASE OK とする:

#### RELEASE OK の条件

- [ ] AC-1〜AC-4 が全て充足されている（ユニットテストで確認済み）
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS
- [ ] `pnpm --filter @repo/desktop lint` が PASS
- [ ] `pnpm --filter @repo/desktop exec vitest run` が全 PASS
- [ ] `SkillLifecyclePanel.tsx` の変更量が 2-3 行以内であること
- [ ] AC-5 は Phase 11 の手動テストで確認予定（RELEASE OK の前提条件ではない）

#### BLOCKED の条件

- AC-1〜AC-4 のいずれかが未充足
- 型チェック・ESLint・テストのいずれかが FAIL
- 予期しない副作用が検出された場合

### ステップ 4: 最終レビュー結果の記録

`outputs/phase-10/final-review-result.md` に以下を記録する:

```markdown
## 最終レビュー結果

### AC 充足状態

| AC   | 充足状態        | エビデンス                |
| ---- | --------------- | ------------------------- |
| AC-1 | PASS/FAIL       | TC-EP-01 テスト結果       |
| AC-2 | PASS/FAIL       | TC-EP-02/03 テスト結果    |
| AC-3 | PASS/FAIL       | TC-EP-04/05/09 テスト結果 |
| AC-4 | PASS/FAIL       | 全テスト実行結果          |
| AC-5 | Phase 11 で確認 | 手動テスト予定            |

### PR 可否判定

**判定**: RELEASE OK / BLOCKED

**理由**: （理由を記載）
```

## 多角的チェック観点

- AC-5 が「手動テストで確認予定」として RELEASE OK に含めているが、手動テスト前にユニットテストで AC-5 に近い動作確認（`setWorkflowError(null)` が呼ばれないこと）はできているか確認したか
- 変更量が 2-3 行以内で small の見積もりと一致しているか確認したか
- Phase 1〜9 の全成果物ファイル（`outputs/phase-N/`）が存在するか確認したか

## 成果物

| 成果物           | パス                                      | 説明                                             |
| ---------------- | ----------------------------------------- | ------------------------------------------------ |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | AC-1〜AC-5 充足確認表、RELEASE OK / BLOCKED 判定 |

## 完了条件

- [ ] AC-1〜AC-4 の充足状態が `final-review-result.md` に記録されている
- [ ] AC-5 が Phase 11 の手動テストで確認予定であることが明記されている
- [ ] RELEASE OK / BLOCKED 判定が明記されている
- [ ] BLOCKED の場合は理由と対処方針が記録されている

## タスク100%実行確認【必須】

- [ ] 全実行タスクが完了している
- [ ] 全成果物が存在する（`outputs/phase-10/final-review-result.md`）
- [ ] 全完了条件が満たされている

## 次Phase

Phase 11: 手動テスト へ進む（RELEASE OK の場合のみ）
