# Phase 13: PR作成

## メタ情報

| 項目         | 内容                                |
| ------------ | ----------------------------------- |
| フェーズ番号 | 13                                  |
| フェーズ名   | PR作成                              |
| カテゴリ     | 完了                                |
| 機能名       | task-imp-permission-readable-ui-001 |
| タスク名     | PermissionDialog 人間可読UI改善     |
| GitHub Issue | #585                                |
| 作成日       | 2026-01-30                          |
| ステータス   | pending                             |

---

## 目的

全Phase（1〜12）の成果物を統合し、Pull Requestを作成する。PRはユーザーの明示的な許可を得てから実行する。

---

## タスク

- Task 1: PR作成準備
  - 変更ファイル一覧を確認する
  - コミット履歴を整理する
  - ブランチがmainの最新と同期されていることを確認する

- Task 2: PR本文作成
  - PR本文を `outputs/phase-13/pr-description.md` に作成する
  - 変更サマリー、テスト結果、影響範囲を記載する
  - GitHub Issue #585 との関連付けを記載する

- Task 3: PR作成実行（ユーザー許可後）
  - `/ai:diff-to-pr` またはGitHub CLIでPRを作成する
  - PR作成後、CIの実行結果を確認する

---

## 参照資料

| ドキュメント             | パス                                       | 説明         |
| ------------------------ | ------------------------------------------ | ------------ |
| Phase 10レビューレポート | `outputs/phase-10/final-review-report.md`  | PR適格性確認 |
| Phase 12実装ガイド       | `outputs/phase-12/implementation-guide.md` | PR説明用参照 |
| artifacts.json           | `artifacts.json`                           | 全成果物一覧 |

---

## 手順

### Task 1 実行手順

1. 変更ファイル一覧を確認する：
   ```bash
   git diff --name-only main
   ```
2. ブランチの最新状態を確認する：
   ```bash
   git fetch origin main
   git log --oneline origin/main..HEAD
   ```
3. コンフリクトがないことを確認する：
   ```bash
   git merge --no-commit --no-ff origin/main && git merge --abort
   ```

### Task 2 実行手順

1. PR本文を以下のフォーマットで作成する：

```markdown
## Summary

- PermissionDialogに人間可読な操作説明文を追加
- ツール別説明テンプレート（10種類以上）を実装
- 「詳細を表示」折りたたみUIを追加
- アクセシビリティ（ARIA属性、キーボード操作）対応

## Changes

### 新規ファイル

- `apps/desktop/src/renderer/components/skill/permissionDescriptions.ts` - ツール別説明テンプレートモジュール
- `apps/desktop/src/renderer/components/skill/__tests__/permissionDescriptions.test.ts` - テスト
- `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.readable.test.tsx` - テスト

### 変更ファイル

- `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx` - 説明文表示・折りたたみUI追加

## Test plan

- [ ] 全テストPASS確認
- [ ] TypeScriptエラー0件確認
- [ ] ESLintエラー0件確認
- [ ] カバレッジ基準達成確認（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 手動テスト完了

Closes #585
```

### Task 2.5 ローカル最終確認チェックリスト

PR作成前に以下のローカル確認を全て実施する：

| 確認項目            | コマンド                                                                                  | 期待結果         |
| ------------------- | ----------------------------------------------------------------------------------------- | ---------------- |
| ビルド成功          | `cd apps/desktop && pnpm build`                                                           | エラー0件        |
| テスト全PASS        | `cd apps/desktop && npx vitest run src/renderer/components/skill/__tests__/`              | 全PASS           |
| TypeScriptエラー0件 | `cd apps/desktop && npx tsc --noEmit`                                                     | エラー0件        |
| ESLintエラー0件     | `cd apps/desktop && npx eslint src/renderer/components/skill/`                            | エラー0件        |
| 変更ファイル確認    | `git diff --name-only main`                                                               | 想定通り         |
| コンフリクトなし    | `git fetch origin main && git merge --no-commit --no-ff origin/main && git merge --abort` | コンフリクトなし |
| 手動目視確認        | Electronアプリ起動・PermissionDialog動作確認                                              | UI正常           |

全項目がPASSした場合のみTask 3に進む。

### Task 3 実行手順

1. **ユーザーの明示的な許可を得る**
2. 許可後、PRを作成する：
   ```bash
   gh pr create --title "feat(permission-dialog): PermissionDialog 人間可読UI改善 (#585)" --body-file outputs/phase-13/pr-description.md
   ```
3. CI結果を確認する：
   ```bash
   gh pr checks
   ```

---

## 統合テストアクション

| カテゴリ   | 確認内容                               |
| ---------- | -------------------------------------- |
| CI/CD      | PR作成後のCIパイプラインが全てPASSする |
| マージ準備 | コンフリクトがなくマージ可能な状態     |

---

## 成果物

| 成果物名 | パス                                 | 種別     | 説明   |
| -------- | ------------------------------------ | -------- | ------ |
| PR本文   | `outputs/phase-13/pr-description.md` | document | PR本文 |

---

## 完了条件

- [ ] 変更ファイル一覧が確認されている
- [ ] ブランチがmain最新と同期されている
- [ ] ローカル最終確認チェックリストが全てPASSしている
- [ ] PR本文が作成されている
- [ ] PR本文にGitHub Issue #585 への参照が含まれている
- [ ] ユーザーの許可を得た上でPRが作成されている
- [ ] CI結果がPASSしている
- [ ] 成果物 `outputs/phase-13/pr-description.md` が生成されている

---

## 注意事項

**PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

マージもユーザーがGitHub UIで手動実行する。
