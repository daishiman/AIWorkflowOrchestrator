# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 13                        |
| Phase名    | PR作成                    |
| 前提Phase  | Phase 12                  |
| 後続Phase  | なし（最終Phase）         |
| ステータス | 未実施                    |
| 作成日     | 2026-04-02                |
| 機能名     | fix-lifecycle-panel-error |

---

## 目的

ユーザーの明示的な承認後、Pull Requestを作成してCI/CDを確認する。

## 背景

**PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

---

## 実行タスク

### タスク1: コミット作成

**目的**: 変更内容を適切なコミットメッセージでコミットする。

**前提**: ユーザーの明示的な承認が必要

**実行手順**:

1. 変更ファイルを確認する
2. 以下の形式でコミットを作成する:

```bash
git add apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
git add apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.error-persistence.test.tsx
git add docs/30-workflows/completed-tasks/fix-step5-seq-lifecycle-panel-error/

git commit -m "fix(desktop): TASK-FIX-LIFECYCLE-PANEL-ERROR-001 — SkillLifecyclePanel currentPhase:handoff 時エラー消去バグ修正"
```

**変更ファイル一覧**:

| 種別 | ファイルパス                                                                                          |
| ---- | ----------------------------------------------------------------------------------------------------- |
| 修正 | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                  |
| 追加 | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.error-persistence.test.tsx` |
| 追加 | `docs/30-workflows/completed-tasks/fix-step5-seq-lifecycle-panel-error/` （タスク仕様書一式）         |

**期待される成果物**:

- コミット作成済み

---

### タスク2: PR作成

**目的**: GitHub Pull Requestを作成する。

**前提**: ユーザーの明示的な承認が必要

**実行手順**:

1. ブランチをプッシュする:

```bash
git push -u origin docs/TASK-FIX-LIFECYCLE-PANEL-ERROR-001-specs
```

2. PRを作成する:

```bash
gh pr create \
  --title "fix(desktop): TASK-FIX-LIFECYCLE-PANEL-ERROR-001 — SkillLifecyclePanel currentPhase:handoff 時エラー消去バグ修正" \
  --body "$(cat <<'EOF'
## 概要

`SkillLifecyclePanel.tsx` の `onWorkflowStateChanged` コールバックで `setWorkflowError(null)` が無条件呼び出しされており、`currentPhase: 'handoff'` 後に別スナップショットが届くとエラーメッセージが消えるバグを修正します。

## 変更内容

- `onWorkflowStateChanged` コールバックに `if (snapshot.currentPhase !== 'handoff')` 条件を追加
- `SkillLifecyclePanel.error-persistence.test.tsx` を新規作成（AC-1〜AC-3の検証テスト）

## 関連Issue

Closes #1844

## テスト

- [x] AC-1: `currentPhase: 'handoff'` 時に `setWorkflowError(null)` が呼ばれない
- [x] AC-2: `currentPhase: 'handoff'` 以外では `setWorkflowError(null)` が呼ばれる
- [x] AC-3: `currentPhase: 'handoff'` 後の連続スナップショットでエラーが消えない
- [x] AC-4: 既存テスト全PASS
- [x] AC-5: TypeScript型エラーなし、ESLintエラーなし

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

**期待される成果物**:

- GitHub Pull Request（URL記録）

---

### タスク3: CI/CD確認

**目的**: PRに対するCI/CDが通過することを確認する。

**実行手順**:

1. PRのCI/CD結果を確認する
2. 全チェックが通過することを確認する
3. 失敗した場合は原因を調査して修正する

```bash
gh pr checks
```

**期待される成果物**:

- CI/CD全チェック通過確認

---

## 参照資料

| 参照資料         | パス                                      | 内容                 |
| ---------------- | ----------------------------------------- | -------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | PR作成前提条件確認   |
| Phase 12成果物   | `outputs/phase-12/`                       | ドキュメント完了確認 |

---

## 成果物

| 成果物              | パス                                                      | 内容   |
| ------------------- | --------------------------------------------------------- | ------ |
| GitHub Pull Request | https://github.com/daishiman/AIWorkflowOrchestrator/pulls | PR URL |

---

## 完了条件

- [ ] **ユーザーの明示的な承認を得ていること**（最重要前提）
- [ ] 変更ファイルがコミットされている
- [ ] PRが作成されている
- [ ] CI/CD全チェックが通過している
- [ ] Issue #1844 がクローズされている（またはPR経由で自動クローズ設定済み）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜3）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] PR URLを記録済み

---

## 重要な注意事項

> **PR作成はユーザーの明示的な承認後のみ実施すること。**
> このPhaseを自動実行しないこと。

---

## 依存関係

- **前提**: Phase 12（ドキュメント更新）が完了していること、かつユーザーの明示承認があること
- **後続**: マージ準備完了（タスク完了）
