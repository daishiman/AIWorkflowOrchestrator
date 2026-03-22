# Phase 12: ドキュメント

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| Phase    | 12                     |
| タスクID | TASK-SC-05-IMPROVE-LLM |
| 作成日   | 2026-03-22             |

## 目的

improve() LLM 実装の実装ガイドと改善フローの解説を作成する。システム仕様書を更新し、未タスクを検出・記録する。

## 実行タスク

### Task 1: 実装ガイド

1. `implementation-guide.md` Part 1（中学生レベル概念説明）
   - 「スキル改善提案」を日常的な比喩で説明（例: 「先生への報告書を AI が添削するイメージ」）
   - improve() フローを図解（テキスト形式）
2. `implementation-guide.md` Part 2（開発者向け実装詳細）
   - AnthropicAdapter の使用方法
   - 改善提案 JSON Schema の詳細
   - SkillFileWriter 連携の実装パターン
3. `ipc-documentation.md`（IPC ハンドラの引数・戻り値仕様）

### Task 2: システム仕様書更新（spec-update-workflow.md 準拠）

#### Step 1-A: タスク完了記録

- [ ] 該当仕様書（skill-creator 関連）にタスク完了記録を追加
- [ ] `aiworkflow-requirements/LOGS.md` 更新
- [ ] `task-specification-creator/LOGS.md` 更新（2ファイル必須、P1/P25対策）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [ ] `task-specification-creator/SKILL.md` 変更履歴更新

#### Step 1-D: topic-map.md 再生成

- [ ] `node generate-index.js` を実行して topic-map.md を再生成（P2/P27対策）

### Task 3: documentation-changelog.md

- [ ] 更新した全仕様書の変更内容を記録
- [ ] 全 Step 完了前に「完了」と記載しない（P4対策）

### Task 4: 未タスク検出

- [ ] `unassigned-task-report.md` 作成（0件でも必須）
- [ ] 検出した未タスクは3ステップ全完了（P3対策）:
  1. `unassigned-task/` に指示書作成
  2. `task-workflow.md` 残課題テーブルに登録
  3. 関連仕様書に参照リンク追加
- [ ] `unassigned-task-detection.md` の件数・ステータス更新

## 参照資料

- `.claude/rules/05-task-execution.md`（Phase 12 必須チェックリスト）
- `.claude/rules/06-known-pitfalls.md`（P1〜P4, P43, P51, P59）
- Phase 11 手動テスト結果

## 成果物

- `implementation-guide.md`（Part 1 + Part 2）
- `ipc-documentation.md`
- `unassigned-task-report.md`
- `documentation-changelog.md`（更新）

## 完了条件

- [ ] 実装ガイド Part 1（日常的比喩）を作成した
- [ ] 実装ガイド Part 2（開発者向け詳細）を作成した
- [ ] IPC ドキュメントを作成した
- [ ] LOGS.md を2ファイル両方更新した（P1/P25対策）
- [ ] SKILL.md 変更履歴を2ファイル両方更新した（P29対策）
- [ ] topic-map.md を再生成した（P2/P27対策）
- [ ] documentation-changelog.md を記録した（P4対策: 全Step完了後）
- [ ] unassigned-task-report.md を作成した（0件でも必須）
- [ ] 未タスクの3ステップを全て完了した（P3対策）

## 次のPhase

Phase 13: PR 作成
