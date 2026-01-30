# Phase 13: PR作成 - PermissionDialog コンポーネント

## メタ情報

| 項目      | 値                                      |
| --------- | --------------------------------------- |
| Phase     | 13                                      |
| Phase名   | PR作成                                  |
| カテゴリ  | 完了                                    |
| Feature   | skill-import-agent-system               |
| Task      | TASK-7C PermissionDialog コンポーネント |
| 前提Phase | Phase 12（ドキュメント更新）            |
| 次Phase   | なし（完了）                            |
| 作成日    | 2026-01-30                              |

## 目的

PermissionDialogコンポーネントの全実装・テスト・ドキュメントをPull Requestとして作成し、CI/CDの通過を確認する。

**注意: PR作成はユーザーの明示的な許可を得てから実行すること。**

## 実行タスク

### Task 1: ローカル最終検証

**目的**: PR作成前にローカル環境で全チェックを通過させる

**手順**:

1. 以下のコマンドを順番に実行し、全てPASSすることを確認する:

```bash
# 1. TypeScript型チェック
pnpm --filter @repo/desktop typecheck

# 2. ESLintチェック
pnpm --filter @repo/desktop lint

# 3. テスト実行
pnpm --filter @repo/desktop vitest run src/renderer/components/skill/__tests__/PermissionDialog.test.tsx

# 4. カバレッジ確認
pnpm --filter @repo/desktop vitest run --coverage src/renderer/components/skill/__tests__/PermissionDialog.test.tsx
```

2. 検証結果を記録する:

| チェック項目   | 結果 | 判定 |
| -------------- | ---- | ---- |
| TypeScript型   |      | □    |
| ESLint         |      | □    |
| テスト全PASS   |      | □    |
| カバレッジ基準 |      | □    |

### Task 2: 変更内容サマリーの作成

**目的**: PRに含まれる変更の概要を整理する

**手順**:

1. `git status` で変更ファイルを確認する
2. `git diff` で変更内容を確認する
3. 以下のサマリーを作成する:

**変更ファイル一覧**:

| 操作 | ファイル                                                                         | 説明                           |
| ---- | -------------------------------------------------------------------------------- | ------------------------------ |
| 作成 | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`                | PermissionDialogコンポーネント |
| 作成 | `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.test.tsx` | コンポーネントテスト           |
| 修正 | `apps/desktop/src/renderer/components/skill/index.ts`                            | エクスポート追加               |
| 作成 | `docs/30-workflows/skill-import-agent-system/tasks/TASK-7C-permission-dialog/`   | Phase仕様書ディレクトリ        |

### Task 3: PR作成

**目的**: Pull Requestを作成する

**⚠️ ユーザーの明示的な許可を得てから実行すること。**

**手順**:

1. コミットメッセージを作成する:

   ```
   feat(desktop): PermissionDialog コンポーネント (TASK-7C)

   スキル実行中のツール使用権限確認ダイアログを実装。
   - 3種類の応答ボタン（拒否/1回許可/許可）
   - セッション中の自動許可チェックボックス
   - ツール別引数フォーマット（Bash/ファイルパス/JSON）
   - WCAG 2.1 AA準拠アクセシビリティ（フォーカストラップ、ARIA属性）
   - コンポーネントテスト
   ```

2. `/ai:diff-to-pr` コマンドを使用してPRを作成する:
   - PRタイトル: `feat(desktop): PermissionDialog コンポーネント (TASK-7C)`
   - ブランチ名: `task/TASK-7C-permission-dialog`

3. PR本文に以下を含める:
   - 変更概要
   - テスト結果
   - スクリーンショット（可能であれば）
   - 関連Issue番号

### Task 4: CI/CD確認

**目的**: CIパイプラインの通過を確認する

**手順**:

1. PR作成後、CIの実行状況を確認する:

   ```bash
   gh pr checks <PR番号> --watch
   ```

2. CI結果を記録する:

| CIジョブ             | 結果 | 判定 |
| -------------------- | ---- | ---- |
| TypeScript型チェック |      | □    |
| ESLint               |      | □    |
| ユニットテスト       |      | □    |
| ビルド               |      | □    |

3. CIが失敗した場合:
   - エラーログを確認する
   - 修正をコミットする
   - CIの再実行を待つ

### Task 5: マージ可能性の報告

**目的**: PRがマージ可能な状態であることを報告する

**手順**:

1. 以下の条件を確認する:

| 条件                         | 状態 | 判定 |
| ---------------------------- | ---- | ---- |
| CI全チェックPASS             |      | □    |
| コンフリクトなし             |      | □    |
| レビュー承認済み（必要なら） |      | □    |

2. **マージはユーザーがGitHub UIで手動実行する。自動マージしない。**

## 成果物

| 成果物名 | パス                          | タイプ   |
| -------- | ----------------------------- | -------- |
| PR情報   | `outputs/phase-13/pr-info.md` | document |

## 完了条件

- [ ] ローカル最終検証（型チェック、リント、テスト、カバレッジ）が全てPASS
- [ ] 変更内容サマリーが作成されている
- [ ] ユーザーの許可を得てPRが作成されている
- [ ] CIパイプラインが通過している
- [ ] マージ可能性が報告されている
- [ ] PR URLが記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/tasks/TASK-7C-permission-dialog --phase 13
```

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/skill-import-agent-system/tasks/TASK-7C-permission-dialog/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep TASK-7C-permission-dialog

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-7C-permission-dialogをcompleted-tasksに移動"
git push
```

## 次のPhase

なし（ワークフロー完了）

## 参照資料

| 参照資料         | パス                | 説明         |
| ---------------- | ------------------- | ------------ |
| Phase 12成果物   | `outputs/phase-12/` | ドキュメント |
| 全Phase成果物    | `outputs/`          | 全成果物     |
| diff-to-prスキル | `/ai:diff-to-pr`    | PR作成スキル |
