# TASK-SW-STREAM-FUP-03: モード別 onProgress 進捗フロー詳細化

## 概要

`SkillCreatorService.createSkill()` の進捗通知をモード別に詳細化する。
`create`/`collaborative`/`orchestrate`/`update`/`improve-prompt` で異なるフェーズ・メッセージを持つようにする。
現在は全モード共通の5段階フローのため、ユーザーへの進捗説明が不正確。

## 背景

TASK-SW-STREAM-001 で実装した5段階フロー（planning → generating-skill → generating-agents → validating → done）は
`create` モードに最適化されており、他モードでは不正確なメッセージが表示される。

- 例: `collaborative` モードでは「インタビュー実施中」「合意形成中」などの独自フェーズがある
- `orchestrate` モードでは「実行エンジン選択中」などのフェーズが追加される
- `update` / `improve-prompt` モードでは既存スキルの読み込みフェーズが先行する

## 変更対象ファイル

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（モード別フローに変更）
- `apps/desktop/src/__tests__/main/services/skill/SkillCreatorService.progress.test.ts`（モード別テスト追加）

## 受入基準

- `create` モードの5段階フローが既存通り動作する
- `collaborative` モードで独自の進捗フェーズ（インタビュー実施中・合意形成中 等）が通知される
- `orchestrate` モードで独自の進捗フェーズ（実行エンジン選択中 等）が通知される
- `update`/`improve-prompt` モードで適切な進捗フェーズが通知される
- 既存14テストケースが全てpass（回帰なし）

## 苦戦箇所（実装知見）

| 苦戦箇所               | 問題                                                                 | 解決策                                                             |
| ---------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| モード別フロー数の違い | モードによってフェーズ数が異なると percentage 計算が複雑になる       | モード別の進捗マップを定義し、各フロー内で emitProgress を呼び出す |
| 回帰テストの影響       | 既存14テストは create モードを想定しており、変更で壊れる可能性がある | create モードのテストは変更せず、各モードのテストを追加する        |
| FUP-02 との依存関係    | 定数化（FUP-02）が完了してから取り組むとスムーズ                     | FUP-02 完了後に実施推奨                                            |

## 参照

- TASK-SW-STREAM-001（共通フローの初出）
- FUP-02（定数化タスク - 先行完了推奨）
- `apps/desktop/src/main/services/skill/SkillCreatorService.ts` の各 run\*Workflow メソッド
