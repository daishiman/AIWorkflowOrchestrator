# Phase 12: ドキュメント

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 12                               |
| タスクID | TASK-SC-07-STREAMING-PROGRESS-UI |
| 作成日   | 2026-03-22                       |

## 目的

実装ガイド・UI変更記録・システム仕様書更新・未タスク検出の4タスクを完了させる。P1-P4・P43・P51・P59 等の既知の落とし穴に注意しながら全 Step を逐次確認する。

## 実行タスク

### Task 1: 実装ガイド

1. `implementation-guide.md` Part 1（中学生レベル概念説明）
   - ストリーミング進捗表示を日常的なアナロジーで説明する（例: 「料理の手順をリアルタイムで表示するレシピアプリ」）
   - プログレスバーの仕組みを図示する

2. `implementation-guide.md` Part 2（開発者向け実装詳細）
   - `useGenerationProgress` Hook の使い方
   - Zustand スライスへのアクセス方法
   - エラーハンドリングパターン
   - キャンセルフローの実装方法

3. `component-documentation.md`
   - `GenerateStep` コンポーネントの Props・状態・イベント
   - カスタムHook（`useGenerationProgress` / `useCancelGeneration`）のインターフェース

### Task 2: システム仕様書更新（spec-update-workflow.md 準拠）

#### Step 1-A: タスク完了記録

- 該当仕様書（`ui-ux-skill-creator.md`）にタスク完了記録を追加する
- `aiworkflow-requirements/LOGS.md` を更新する（**2ファイル両方**: P1対策）
- `task-specification-creator/LOGS.md` を更新する
- `aiworkflow-requirements/SKILL.md` 変更履歴を更新する
- `task-specification-creator/SKILL.md` 変更履歴を更新する

#### Step 1-B: 実装状況テーブル

- UIコンポーネント一覧の実装ステータスを更新する

#### Step 1-C: 関連タスクテーブル

- `grep -rn "TASK-SC-07" references/` で関連仕様書を検索して更新する

#### Step 1-D: topic-map.md 再生成

- `node generate-index.js` を実行する（P2対策）

#### Step 2: システム仕様更新

- GenerateStep コンポーネントの仕様変更を `arch-ui-components.md` に反映する

### Task 3: documentation-changelog.md

- 更新した全仕様書の変更内容を記録する
- 全 Step 完了後に記録する（P4対策: 全Step確認前に「完了」と書かない）

### Task 4: 未タスク検出

- `unassigned-task-report.md` を作成する（0件でも必須）
- 検出した未タスクは3ステップ全完了: ①指示書作成 → ②task-workflow.md 登録 → ③関連仕様書リンク追加（P3対策）
- `unassigned-task-detection.md` の件数・ステータスを更新する
- `artifacts.json` の Phase 12 ステータスを更新する

## 参照資料

- `.claude/rules/05-task-execution.md` (Phase 12 チェックリスト)
- `.claude/rules/06-known-pitfalls.md` (P1, P2, P3, P4, P43, P51, P59)

## 成果物

- `docs/30-workflows/skill-creator-llm-integration/07-sc-streaming-progress-ui/implementation-guide.md`
- `docs/30-workflows/skill-creator-llm-integration/07-sc-streaming-progress-ui/component-documentation.md`
- `documentation-changelog.md`（更新）
- `unassigned-task-report.md`

## 完了条件

- [ ] Task 1: `implementation-guide.md` Part 1・Part 2 が作成されている
- [ ] Task 1: `component-documentation.md` が作成されている
- [ ] Task 2 Step 1-A: LOGS.md が**2ファイル両方**更新されている（P1対策）
- [ ] Task 2 Step 1-A: SKILL.md 変更履歴が**2ファイル両方**更新されている
- [ ] Task 2 Step 1-D: topic-map.md が再生成されている（P2対策）
- [ ] Task 3: `documentation-changelog.md` が全Step完了後に記録されている（P4対策）
- [ ] Task 4: `unassigned-task-report.md` が作成されている（0件でも）
- [ ] Task 4: 検出した未タスクの3ステップが全完了している（P3対策）

## 次のPhase

Phase 13: PR作成
