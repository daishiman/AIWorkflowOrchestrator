# Phase 13: PR作成 — SkillEditorView 実装残課題収束

## メタ情報

| 項目         | 内容                                 |
| ------------ | ------------------------------------ |
| Phase        | 13                                   |
| タスクID     | UT-UI-05A-IMPLEMENTATION-CLOSURE-001 |
| 機能名       | SkillEditorView 実装残課題収束       |
| 作成日       | 2026-03-03                           |
| 前提Phase    | Phase 12（ドキュメント更新）完了     |
| 担当者       | 実装担当者                           |
| GitHub Issue | #947                                 |

## 目的

Phase 5-12 で完成した SkillEditorView 残課題収束（7課題）の実装を、
GitHub Pull Request としてまとめ、コードレビュー・マージの準備を完了する。

> **⚠️ 重要**: PR の実際の作成（`gh pr create`）は**ユーザーの許可を得てから**実行すること。
> 本仕様書の内容を準備し、実行前に確認を取ること。

## 実行タスク

### Task 1: 事前確認チェック

**目的**: PR 作成前の必須確認事項を検証する。

**手順:**

1. **ブランチ確認**

   ```bash
   git branch --show-current
   # 期待: feature/task-ui-05a-skill-editor-closure または同等のブランチ
   ```

2. **コミット状態確認**

   ```bash
   git log --oneline -10
   git status
   # 未コミットの変更がないことを確認
   ```

3. **品質チェック通過確認**

   ```bash
   # Lint
   pnpm lint
   # 型チェック
   pnpm typecheck
   # テスト
   pnpm --filter @repo/desktop test
   ```

   全て PASS していることを確認する。

4. **Phase 12 成果物確認**
   - `outputs/phase-12/implementation-guide.md` が存在する
   - `outputs/phase-12/documentation-changelog.md` が存在する
   - `outputs/phase-12/unassigned-task-detection.md` が存在する
   - `outputs/phase-12/skill-feedback-report.md` が存在する

5. **main ブランチとの差分確認**
   ```bash
   git diff main --stat
   # 変更ファイル数と内容を把握する
   ```

---

### Task 2: PR 情報の準備

**ブランチ名:**

```
feature/task-ui-05a-skill-editor-closure
```

> 注: 現在のブランチが `feature/task-ui-05a-skill-editor-closure-specs` の場合、
> 実装ブランチと統合されているか確認すること。

**PR タイトル（70文字以内）:**

```
feat(skill-editor): SkillEditorView実装残課題収束 (#947)
```

**PR 本文テンプレート:**

```markdown
## Summary

- SkillEditorView の残課題7件（UT-UI-05A-001〜007）を実装・収束
- アクセシビリティ強化（FileTree キーボードナビゲーション、ARIA属性）
- モバイル対応（ドロワーレイアウト、レスポンシブ切り替え）
- 操作性改善（Cmd/Ctrl+S 保存、Toast通知、読み取り専用表示、ナビ導線）

## 実装内容

| 課題ID        | 課題名                            | 対応ファイル                                                                              |
| ------------- | --------------------------------- | ----------------------------------------------------------------------------------------- |
| UT-UI-05A-001 | FileTree キーボードナビゲーション | `components/FileTreePanel/FileTreePanel.tsx`, `components/FileTreePanel/FileTreeNode.tsx` |
| UT-UI-05A-002 | モバイルドロワー                  | `components/MobileDrawer.tsx`（新規）                                                     |
| UT-UI-05A-003 | Cmd/Ctrl+S 保存ショートカット     | `hooks/useSaveShortcut.ts`（新規）                                                        |
| UT-UI-05A-004 | 保存成功 Toast 通知               | `hooks/useToast.ts`, `components/Toast.tsx`, `components/ToastContainer.tsx`              |
| UT-UI-05A-005 | 読み取り専用表示強化              | `components/EditorPanel/ReadOnlyBanner.tsx`（新規）                                       |
| UT-UI-05A-006 | ナビゲーション導線配線            | `index.tsx`, `store/slices/navigationSlice.ts`                                            |
| UT-UI-05A-007 | マイクロアニメーション            | `components/FileTreePanel/FileTreeNode.tsx`, `components/EditorPanel/EditorPanel.tsx`     |

## Test Plan

- [ ] `pnpm --filter @repo/desktop test` が全 PASS
- [ ] `pnpm lint` が通る
- [ ] `pnpm typecheck` が通る
- [ ] Phase 11 手動テスト: 7課題の動作確認済み（manual-test-result.md 参照）
- [ ] アクセシビリティ: キーボードのみで全操作が可能
- [ ] レスポンシブ: 390px / 768px / 1440px での表示確認済み
- [ ] `prefers-reduced-motion` によるアニメーション無効化確認済み

## Screenshots

<!-- Phase 11 手動テストで撮影したスクリーンショットを添付 -->

| 確認項目                      | スクリーンショット                                            |
| ----------------------------- | ------------------------------------------------------------- |
| FileTree キーボードフォーカス | ![keyboard-focus](screenshots/01-filetree-keyboard-focus.png) |
| モバイルドロワー（開）        | ![drawer-open](screenshots/03-mobile-drawer-open.png)         |
| 保存成功 Toast                | ![toast](screenshots/04-save-toast-success.png)               |
| 読み取り専用バナー            | ![readonly](screenshots/05-readonly-indicator.png)            |

## 関連 Issue

Closes #947

## ドキュメント

- 実装ガイド: `docs/30-workflows/completed-tasks/skill-editor-view-closure/outputs/phase-12/implementation-guide.md`
- 変更履歴: `docs/30-workflows/completed-tasks/skill-editor-view-closure/outputs/phase-12/documentation-changelog.md`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

### Task 3: ブランチ確認・作成（必要な場合）

現在のブランチが `feature/task-ui-05a-skill-editor-closure` でない場合:

```bash
# 現在のブランチを確認
git branch --show-current

# 必要であれば新しいブランチを作成（コミット済みの場合）
git checkout -b feature/task-ui-05a-skill-editor-closure
```

> **注**: `git checkout -b` は新しいブランチを作成する。既存のコミットを別ブランチに移す場合は
> 慎重に操作すること。不明な場合はユーザーに確認する。

---

### Task 4: PR 作成（ユーザー許可後に実行）

> **⚠️ このタスクはユーザーの明示的な許可を得てから実行すること。**

**実行コマンド:**

```bash
gh pr create \
  --title "feat(skill-editor): SkillEditorView実装残課題収束 (#947)" \
  --body "$(cat <<'EOF'
## Summary

- SkillEditorView の残課題7件（UT-UI-05A-001〜007）を実装・収束
- アクセシビリティ強化（FileTree キーボードナビゲーション、ARIA属性）
- モバイル対応（ドロワーレイアウト、レスポンシブ切り替え）
- 操作性改善（Cmd/Ctrl+S 保存、Toast通知、読み取り専用表示、ナビ導線）

## 実装内容

| 課題ID        | 課題名                            | 対応ファイル                                                                 |
| ------------- | --------------------------------- | ---------------------------------------------------------------------------- |
| UT-UI-05A-001 | FileTree キーボードナビゲーション | `components/FileTreePanel/FileTreePanel.tsx`, `components/FileTreePanel/FileTreeNode.tsx` |
| UT-UI-05A-002 | モバイルドロワー                  | `components/MobileDrawer.tsx`（新規）                                        |
| UT-UI-05A-003 | Cmd/Ctrl+S 保存ショートカット     | `hooks/useSaveShortcut.ts`（新規）                                           |
| UT-UI-05A-004 | 保存成功 Toast 通知               | `hooks/useToast.ts`, `components/Toast.tsx`, `components/ToastContainer.tsx` |
| UT-UI-05A-005 | 読み取り専用表示強化              | `components/EditorPanel/ReadOnlyBanner.tsx`（新規）                          |
| UT-UI-05A-006 | ナビゲーション導線配線            | `index.tsx`, `store/slices/navigationSlice.ts`                               |
| UT-UI-05A-007 | マイクロアニメーション            | `components/FileTreePanel/FileTreeNode.tsx`, `components/EditorPanel/EditorPanel.tsx` |

## Test Plan

- [ ] `pnpm --filter @repo/desktop test` が全 PASS
- [ ] `pnpm lint` が通る
- [ ] `pnpm typecheck` が通る
- [ ] Phase 11 手動テスト: 7課題の動作確認済み
- [ ] アクセシビリティ: キーボードのみで全操作が可能
- [ ] レスポンシブ: 390px / 768px / 1440px での表示確認済み
- [ ] `prefers-reduced-motion` によるアニメーション無効化確認済み

## 関連 Issue

Closes #947

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)" \
  --base main
```

**PR 作成後の確認:**

```bash
# PR URL を確認
gh pr view --web
```

---

### Task 5: PR 作成後の補足コメント投稿（任意）

Phase 12 の実装ガイドへのリンクを含む追加情報をコメントで投稿する場合:

```bash
gh pr comment <PR番号> --body "$(cat <<'EOF'
## 実装詳細

詳細な実装ガイドは以下を参照してください:
- [実装ガイド](docs/30-workflows/completed-tasks/skill-editor-view-closure/outputs/phase-12/implementation-guide.md)
- [手動テスト結果](docs/30-workflows/completed-tasks/skill-editor-view-closure/outputs/phase-11/manual-test-result.md)

## アクセシビリティ対応

本 PR では WCAG 2.1 AA 基準に準拠した実装を行いました:
- FileTree: `role="tree"`, `role="treeitem"`, `aria-selected` による選択状態通知
- MobileDrawer: `role="dialog"`, `aria-modal="true"` による適切なフォーカストラップ
- Toast: `role="status"` または `role="alert"` によるスクリーンリーダー対応
EOF
)"
```

---

### Task 6: 成果物記録

**ファイル**: `docs/30-workflows/completed-tasks/skill-editor-view-closure/outputs/phase-13/pr-info.md`

**記載内容テンプレート:**

```markdown
# PR 作成記録

## 基本情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| PR番号     | #[作成後に記入]                               |
| PR URL     | https://github.com/[owner]/[repo]/pull/[番号] |
| ブランチ   | feature/task-ui-05a-skill-editor-closure      |
| ベース     | main                                          |
| 作成日時   | 2026-03-03                                    |
| ステータス | Open / Merged（マージ後に更新）               |

## 変更統計

| 項目           | 内容             |
| -------------- | ---------------- |
| 変更ファイル数 | [記入]           |
| 追加行数       | [記入]           |
| 削除行数       | [記入]           |
| 新規ファイル   | [ファイル名一覧] |

## CI/CD 状態

| チェック  | 状態              |
| --------- | ----------------- |
| Lint      | ✅ PASS / ❌ FAIL |
| TypeCheck | ✅ PASS / ❌ FAIL |
| Tests     | ✅ PASS / ❌ FAIL |
| Build     | ✅ PASS / ❌ FAIL |

## レビュアー

| レビュアー | ステータス |
| ---------- | ---------- |
| [記入]     | 承認待ち   |
```

---

### Task 7: artifacts.json 更新

**ファイル**: `docs/30-workflows/completed-tasks/skill-editor-view-closure/artifacts.json`

Phase 13 完了後に以下のステータスを更新する:

```json
{
  "13": {
    "status": "completed",
    "artifacts": ["outputs/phase-13/pr-info.md"],
    "prNumber": "[PR番号]",
    "prUrl": "[PR URL]"
  }
}
```

## 参照資料

| 資料名                | パス                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------ |
| Phase 1 要件定義      | `docs/30-workflows/completed-tasks/skill-editor-view-closure/phase-1-requirements.md`                  |
| Phase 2 設計          | `docs/30-workflows/completed-tasks/skill-editor-view-closure/phase-2-design.md`                        |
| Phase 5 実装          | `docs/30-workflows/completed-tasks/skill-editor-view-closure/phase-5-implementation.md`                |
| Phase 6 テスト拡充    | `docs/30-workflows/completed-tasks/skill-editor-view-closure/phase-6-test-expansion.md`                |
| Phase 7 カバレッジ    | `docs/30-workflows/completed-tasks/skill-editor-view-closure/phase-7-coverage-check.md`                |
| Phase 8 リファクタ    | `docs/30-workflows/completed-tasks/skill-editor-view-closure/phase-8-refactoring.md`                   |
| Phase 9 品質保証      | `docs/30-workflows/completed-tasks/skill-editor-view-closure/phase-9-quality-assurance.md`             |
| Phase 10 最終レビュー | `docs/30-workflows/completed-tasks/skill-editor-view-closure/phase-10-final-review.md`                 |
| Phase 11 手動テスト   | `docs/30-workflows/completed-tasks/skill-editor-view-closure/phase-11-manual-test.md`                  |
| Phase 12 実装ガイド   | `docs/30-workflows/completed-tasks/skill-editor-view-closure/outputs/phase-12/implementation-guide.md` |
| Phase 12 ドキュメント | `docs/30-workflows/completed-tasks/skill-editor-view-closure/phase-12-documentation.md`                |
| Phase 11 テスト結果   | `docs/30-workflows/completed-tasks/skill-editor-view-closure/outputs/phase-11/manual-test-result.md`   |
| ワークフロー台帳仕様  | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                   |
| PR 作成ルール         | `.claude/rules/07-git-and-tooling.md` — PR 作成ルールセクション                                        |
| GitHub Issue #947     | `gh issue view 947`                                                                                    |

## 成果物

| 成果物      | パス                                                                                      | 状態   |
| ----------- | ----------------------------------------------------------------------------------------- | ------ |
| PR 情報記録 | `docs/30-workflows/completed-tasks/skill-editor-view-closure/outputs/phase-13/pr-info.md` | 要作成 |
| PR URL      | GitHub 上の Pull Request                                                                  | 要作成 |

## 完了条件

以下のチェックリストを全て完了してタスクを完了とする:

- [ ] Task 1: 全ての事前確認チェックが PASS している
- [ ] Task 2: PR 本文テンプレートが準備されている
- [ ] Task 3: 正しいブランチ（feature/task-ui-05a-skill-editor-closure）で作業している
- [ ] Task 4: ユーザーの許可を得て PR を作成した
- [ ] Task 4: PR URL が取得できた
- [ ] Task 5: PR本文で説明しきれない技術的詳細がある場合、補足コメントを投稿した
- [ ] Task 6: `outputs/phase-13/pr-info.md` に PR 情報が記録された
- [ ] Task 7: `artifacts.json` の Phase 13 ステータスが更新された
- [ ] CI/CD チェック（Lint・TypeCheck・Tests・Build）が全て PASS している
- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] タスク全体（UT-UI-05A-IMPLEMENTATION-CLOSURE-001）が完了した

## タスク完了後の通知

PR 作成・全 CI PASS 後、以下をチームリードに報告する:

- PR URL
- 変更ファイル数・行数
- CI/CD 全チェックの PASS 確認
- マージ待ち状態であること

> **マージはユーザーが GitHub UI で手動実行する。自動マージは行わない。**
