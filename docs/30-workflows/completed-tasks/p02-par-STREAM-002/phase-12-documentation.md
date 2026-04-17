# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 12                                     |
| タスクID   | TASK-SW-STREAM-002                     |
| 機能名     | skill-creator-handlers-progress-wiring |
| 前提Phase  | Phase 11                               |
| 後続Phase  | Phase 13                               |
| 作成日     | 2026-04-15                             |
| ステータス | pending                                |

## 目的

実装ガイドの作成・システム仕様の更新・ドキュメント変更履歴の記録・未タスク検出を行い、
本タスクの知見を次の開発者・AIへ引き継げる状態にする。

## 実行タスク

- 実装ガイドの作成（中学生レベルの概念説明を含む）
- システム仕様更新サマリーの作成
- ドキュメント変更履歴の記録
- 未タスク検出レポートの作成
- スキルフィードバックレポートの作成
- Phase 12 準拠チェックの実施

## 実行手順

### 1. 実装ガイドの作成

`outputs/phase-12/implementation-guide.md` に以下を記述する:

**中学生レベルの概念説明**:

> スキル生成が始まると、バックエンド（メインプロセス）は「今どこまで進んだか」を
> 定期的にフロントエンド（画面）に送ります。この「進捗を送る仕組み」を
> 「コールバック」と「IPC 通信」でつないでいます。
>
> たとえば、スキル生成が 40% まで進んだとき、バックエンドは
> 「generating-skill, 40%」というメッセージを画面に送ります。
> 画面はそのメッセージを受け取ってプログレスバーを 40% まで進めます。

**技術者向け説明**:

- `SKILL_CREATOR_CREATE` ハンドラーで `createSkill()` の第2引数に `onProgress` コールバックを渡す
- コールバック内で `sendSkillCreatorProgress(mainWindow, progress)` を呼び出す
- `sendSkillCreatorProgress` が `mainWindow.webContents.send(SKILL_CREATOR_PROGRESS, progress)` を呼ぶ
- Preload の `safeOn` が IPC メッセージを受信して `useStreamingProgress` のコールバックに渡す
- Zustand ストアが更新され `GenerateStep.tsx` のプログレスバーが再レンダリングされる

### 2. システム仕様更新サマリー

`outputs/phase-12/system-spec-update-summary.md` に以下を記述する:

- 変更されたシステム仕様: `skillCreatorHandlers.ts` の `SKILL_CREATOR_CREATE` ハンドラーの動作
- current facts: `createSkill()` が第2引数に `onProgress` コールバックを受け取り、`sendSkillCreatorProgress` と配線済み
- baseline との差分: コールバック接続前は `sendSkillCreatorProgress` の呼び出し元が存在しなかった

### 3. ドキュメント変更履歴

`outputs/phase-12/documentation-changelog.md` に以下を記述する:

- 変更日: 2026-04-15
- 変更内容: `skillCreatorHandlers.ts` の `SKILL_CREATOR_CREATE` ハンドラーにコールバック接続を追加
- 関連タスク: TASK-SW-STREAM-001（前提）、TASK-SW-CANCEL-001〜004（後続）

### 4. 未タスク検出レポート

`outputs/phase-12/unassigned-task-detection.md` に以下を記録する:

- `SkillCreatorProgressData` 型の `packages/shared/` への移動（Phase 2 設計書で未タスクとして記録済み）
- `GenerateStep.tsx` の props 接続確認結果（接続済みか未接続かの記録）
- エラー時のプログレスバー状態管理（Phase 11 で余裕があれば確認した項目）

### 5. スキルフィードバックレポート

`outputs/phase-12/skill-feedback-report.md` に以下を記述する:

- task-specification-creator スキルへのフィードバック
- IPC 配線タスクのテンプレート品質に関する知見
- 4層整合チェックの有効性に関する評価

### 6. Phase 12 準拠チェック

`outputs/phase-12/phase12-task-spec-compliance-check.md` に以下を記述する:

- 全 AC の充足確認（AC-1〜AC-4）
- 全 Phase（1〜11）の完了確認
- 未タスクが次のタスクとして積まれているか確認

## 統合テスト連携【必須】

（Phase 12 はドキュメント作業のため統合テストの実行は不要。前フェーズの結果を参照のみ）

| 確認項目       | 参照先                                   |
| -------------- | ---------------------------------------- |
| 品質 PASS 確認 | `outputs/phase-9/quality-report.md`      |
| 手動テスト確認 | `outputs/phase-11/manual-test-result.md` |

## 多角的チェック観点

| 観点         | チェック内容                                                                       |
| ------------ | ---------------------------------------------------------------------------------- |
| 引き継ぎ品質 | 次の開発者が実装内容を理解できる説明になっているか                                 |
| 未タスク検出 | フォローアップが必要な観点（型移動・エラー状態等）が未タスクとして記録されているか |
| 仕様更新     | システム仕様の current facts が最新の実装を正確に反映しているか                    |

## 成果物

| 成果物                   | パス                                                     | 説明                                          |
| ------------------------ | -------------------------------------------------------- | --------------------------------------------- |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`               | 中学生レベル・技術者レベルの説明              |
| システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | current facts・baseline 差分                  |
| ドキュメント変更履歴     | `outputs/phase-12/documentation-changelog.md`            | 変更内容・関連タスク記録                      |
| 未タスク検出レポート     | `outputs/phase-12/unassigned-task-detection.md`          | フォローアップ必要な観点                      |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`              | task-specification-creator へのフィードバック |
| Phase 12 準拠チェック    | `outputs/phase-12/phase12-task-spec-compliance-check.md` | AC 充足・Phase 完了の最終確認                 |

## 完了条件

- [ ] 実装ガイド（中学生レベル概念説明を含む）が作成済み
- [ ] システム仕様更新サマリーが作成済み
- [ ] ドキュメント変更履歴が記録済み
- [ ] 未タスク検出レポートが作成済み
- [ ] スキルフィードバックレポートが作成済み
- [ ] Phase 12 準拠チェックが完了済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 実装ガイド作成（中学生レベル説明）
2. システム仕様更新サマリー作成
3. ドキュメント変更履歴記録
4. 未タスク検出レポート作成
5. スキルフィードバックレポート作成
6. Phase 12 準拠チェック実施

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 13: PR作成（blocked）
