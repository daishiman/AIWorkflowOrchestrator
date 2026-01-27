# Phase 13: PR作成

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 13                           |
| カテゴリ   | 完了                         |
| 前提Phase  | Phase 12（ドキュメント更新） |
| ステータス | 未実施                       |

---

## 1. 目的

実装をコミットし、Pull Requestを作成してCI/CDパイプラインを通過させる。

---

## 2. 前提確認

### 2.1 必須チェック

| 項目                     | 状態 |
| ------------------------ | ---- |
| 全テストパス             | [ ]  |
| 型エラー 0件             | [ ]  |
| Lintエラー 0件           | [ ]  |
| Phase 12ドキュメント完了 | [ ]  |
| 未コミットの変更がある   | [ ]  |

### 2.2 確認コマンド

```bash
# テスト
pnpm --filter @repo/desktop test -- --run

# 型チェック
pnpm --filter @repo/desktop typecheck

# Lint
pnpm --filter @repo/desktop lint

# 変更確認
git status
```

---

## 3. タスク一覧

### Task 1: 変更内容の確認

#### 手順

1. `git status` で変更ファイルを確認
2. `git diff` で差分を確認
3. 不要なファイルが含まれていないか確認

#### 確認項目

| 項目         | 確認内容                   | 状態 |
| ------------ | -------------------------- | ---- |
| 新規ファイル | 意図したファイルのみ       | [ ]  |
| 変更ファイル | 意図した変更のみ           | [ ]  |
| 削除ファイル | 意図した削除のみ           | [ ]  |
| 機密情報     | .env等が含まれていないこと | [ ]  |

---

### Task 2: コミット作成

#### コミット対象

| カテゴリ           | ファイル                                                   |
| ------------------ | ---------------------------------------------------------- |
| 新規コンポーネント | `FileAttachmentButton.tsx`, `FileContextList.tsx`          |
| テストファイル     | `*.test.tsx`, `*.edge.test.tsx`                            |
| Storybook          | `*.stories.tsx`                                            |
| ドキュメント       | `implementation-guide.md`, `documentation-changelog.md` 等 |
| 型定義             | 更新された `index.ts`                                      |

#### コミットメッセージ形式

```
feat(workspace-chat-edit): add FileAttachmentButton and FileContextList UI components

- Add FileAttachmentButton for file selection dialog
- Add FileContextList for displaying attached files
- Add Storybook stories for all components
- Add comprehensive unit and accessibility tests
- Update system specifications (arch-ui-components.md)

Closes #494

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

#### コマンド

```bash
# ステージング
git add apps/desktop/src/renderer/features/workspace-chat-edit/
git add docs/30-workflows/workspace-chat-edit-ui/
git add .claude/skills/aiworkflow-requirements/references/arch-ui-components.md

# コミット
git commit -m "$(cat <<'EOF'
feat(workspace-chat-edit): add FileAttachmentButton and FileContextList UI components

- Add FileAttachmentButton for file selection dialog
- Add FileContextList for displaying attached files
- Add Storybook stories for all components
- Add comprehensive unit and accessibility tests
- Update system specifications (arch-ui-components.md)

Closes #494

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: リモートへプッシュ

#### コマンド

```bash
# プッシュ
git push -u origin feat/workspace-chat-edit-ui-494
```

---

### Task 4: Pull Request作成

#### PR作成コマンド

```bash
gh pr create --title "feat(workspace-chat-edit): add FileAttachmentButton and FileContextList UI components" --body "$(cat <<'EOF'
## Summary

- FileAttachmentButtonコンポーネントを追加（ファイル選択ダイアログ）
- FileContextListコンポーネントを追加（添付ファイル一覧表示）
- 全コンポーネントのStorybook Storiesを作成
- ユニットテスト・アクセシビリティテストを追加
- システム仕様書（arch-ui-components.md）を更新

## Test plan

- [ ] `pnpm --filter @repo/desktop test` が全てパス
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm --filter @repo/desktop lint` がエラーなし
- [ ] 開発サーバーで手動動作確認
- [ ] Storybookで全コンポーネント確認

## Checklist

- [x] テストを追加/更新した
- [x] ドキュメントを更新した
- [x] アクセシビリティ要件を満たしている

Closes #494

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

### Task 5: CI/CD確認

#### 確認項目

| CI Job        | 状態 | 備考 |
| ------------- | ---- | ---- |
| Build         | [ ]  |      |
| Test          | [ ]  |      |
| Lint          | [ ]  |      |
| Type Check    | [ ]  |      |
| Security Scan | [ ]  |      |

#### 確認コマンド

```bash
# CIステータス確認
gh pr checks
```

---

### Task 6: レビュー対応（必要に応じて）

#### レビューコメント対応フロー

1. コメントを確認
2. 必要な修正を実施
3. 追加コミット（`fix:` または `chore:`）
4. プッシュ
5. レビュアーに再確認依頼

---

## 4. 多角的チェック観点

タスクの性質に応じて、以下の観点を確認する:

| 観点         | 適用判断      | 仕様参照先 |
| ------------ | ------------- | ---------- |
| 完全性       | ✅ 全変更含む | -          |
| 品質         | ✅ CI/CD通過  | -          |
| ドキュメント | ✅ PR本文充実 | -          |

---

## 5. サブタスク管理

Phase実行開始時に、以下のサブタスクを作成・管理すること:

1. Task 1: 変更内容の確認
2. Task 2: コミット作成
3. Task 3: リモートへプッシュ
4. Task 4: Pull Request作成
5. Task 5: CI/CD確認
6. Task 6: レビュー対応（必要に応じて）

**重要**: 各サブタスクは実行完了後すぐに完了に更新すること。

---

## 6. タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスク（Task 1-6）を100%実行完了
- [ ] PRが作成されている
- [ ] CI/CDが全てパスしている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

---

## 7. 完了条件

- [ ] 全変更がコミットされている
- [ ] リモートにプッシュされている
- [ ] PRが作成されている
- [ ] CI/CDが全てパスしている
- [ ] PR URLが記録されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認）**

---

## 8. 成果物

| 成果物   | 内容                            |
| -------- | ------------------------------- |
| コミット | feat(workspace-chat-edit)...    |
| ブランチ | feat/workspace-chat-edit-ui-494 |
| PR       | #XXX                            |

---

## 6. 注意事項

- **マージは自動実行しない**: レビュー・承認後にユーザーがGitHub UIで実行
- **Force Pushは禁止**: レビュー中の履歴を保持
- **CI失敗時**: 原因を特定し、修正後に再プッシュ

---

## 7. 完了報告

全Phase完了後、以下の形式で報告:

```markdown
## タスク完了報告

### タスク情報

- タスクID: TASK-WCE-UI-001
- Issue: #494
- PR: #XXX

### 成果物

- FileAttachmentButton.tsx
- FileContextList.tsx
- Storybook Stories
- テストファイル群
- 実装ガイド

### 品質メトリクス

- Line Coverage: XX%
- Branch Coverage: XX%
- 全テスト: XXX件 PASS

### 次のアクション

- [ ] PRレビュー依頼
- [ ] マージ後のリリースノート更新
```
