# Phase 13: PR作成

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 13                             |
| 機能名 | TASK-IMP-permission-tool-icons |
| 作成日 | 2026-01-30                     |

## 目的

実装・テスト・ドキュメントが完了した成果物をPull Requestとしてまとめ、レビュー・マージの準備を行う。

## 実行タスク

- Task 1: 差分確認 — 変更ファイルの確認
- Task 2: コミット作成 — 適切なコミットメッセージで変更をコミット
- Task 3: PR作成 — GitHub PRを作成
- Task 4: CI確認 — CIチェックの通過を確認

## 参照資料

| 資料名         | パス                                       | 説明             |
| -------------- | ------------------------------------------ | ---------------- |
| Phase 12成果物 | `outputs/phase-12/implementation-guide.md` | ドキュメント     |
| 品質レポート   | `outputs/phase-9/quality-report.md`        | 品質チェック結果 |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md`   | 手動テスト結果   |

## 実行手順

### ステップ1: 差分確認

```bash
git status
git diff --stat
```

**期待される変更ファイル**:

| ファイル                                                                         | 変更種別 |
| -------------------------------------------------------------------------------- | -------- |
| `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`                | 修正     |
| `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.test.tsx` | 修正     |
| `docs/30-workflows/TASK-IMP-permission-tool-icons/` 配下                         | 新規     |

### ステップ2: コミット作成

**重要**: ユーザーの明示的な許可を得てからPR作成を実行する。

```bash
git add apps/desktop/src/renderer/components/skill/PermissionDialog.tsx
git add apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.test.tsx
git add docs/30-workflows/TASK-IMP-permission-tool-icons/

git commit -m "feat(permission-dialog): PermissionDialog ツール別アイコン表示 (#586)

- TOOL_ICONS定数（10ツール分Emojiマッピング）を追加
- getToolIconヘルパー関数（デフォルトアイコン付き）を追加
- ツールバッジにアイコン表示を追加（aria-hidden対応）
- アイコン表示テスト・エッジケーステストを追加"
```

### ステップ3: PR作成

```bash
gh pr create \
  --title "feat(permission-dialog): PermissionDialog ツール別アイコン表示 (#586)" \
  --body "## Summary
- PermissionDialogのツール名表示にEmojiアイコンを追加
- 10種類のツール（Bash, Read, Write, Edit, Glob, Grep, LS, Task, WebSearch, WebFetch）に対応
- 未定義ツールにはデフォルトアイコン（🔧）を表示
- アクセシビリティ対応（aria-hidden=\"true\"）

## Changes
- \`PermissionDialog.tsx\`: TOOL_ICONS定数、getToolIcon関数、JSXアイコン表示を追加
- \`PermissionDialog.test.tsx\`: アイコン表示テスト、エッジケーステストを追加

## Test plan
- [ ] 全10ツールのアイコン表示テスト
- [ ] デフォルトアイコン（未定義ツール）テスト
- [ ] アクセシビリティ（aria-hidden）テスト
- [ ] エッジケース（空文字列、大小文字）テスト
- [ ] 既存テスト全PASS
- [ ] TypeScript型チェックPASS
- [ ] ESLintチェックPASS

Closes #586"
```

### ステップ4: CI確認

```bash
gh pr checks --watch
```

**期待結果**: 全CIチェックがPASS。

### ステップ5: PR情報記録

PR URL、CI結果を `outputs/phase-13/pr-info.md` に記録する。

## 統合テスト連携

Phase 13はPR作成であり、新規コード変更はない。CIで統合テストが実行される。

## 成果物

| 成果物 | パス                          | 説明                       |
| ------ | ----------------------------- | -------------------------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL、CI結果、マージ状態 |

## 完了条件

- [ ] 変更ファイルが正しくステージングされている
- [ ] コミットメッセージが規約に沿っている
- [ ] PRが作成されている
- [ ] PR本文にSummary、Changes、Test planが含まれている
- [ ] CIチェックが全てPASSしている
- [ ] PR情報が `outputs/phase-13/` に出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 多角的チェック観点（AIが判断）

Phase 13はPR作成であり、多角的チェックは前Phaseで完了済み。PR本文が全変更内容を適切に反映しているか確認する。

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 差分確認（Task 1）
3. コミット作成（Task 2）
4. PR作成（Task 3）
5. CI確認（Task 4）
6. 成果物の作成・配置
7. 完了条件の検証

各サブタスクは実行完了後すぐに completed に更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-IMP-permission-tool-icons --phase 13
```

## 備考

**PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

`/ai:diff-to-pr` コマンドの使用を推奨する。
