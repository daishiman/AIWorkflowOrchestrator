# Phase 12: 未タスク検出レポート

## 検出件数: 3件

Phase 12 ドキュメント作成時に以下の未タスクを検出した。

## 検出された未タスク

| #   | 未タスクID                       | 概要                                                                                         | 優先度 | 指示書パス                                            |
| --- | -------------------------------- | -------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------- |
| 1   | UT-06-003-PRELOAD-API-IMPL       | Preload 層に evaluateSafety の safeInvoke 呼び出しを追加。Renderer → Main の通信チェーン完成 | 高     | `unassigned-task/UT-06-003-PRELOAD-API-IMPL.md`       |
| 2   | UT-06-003-METADATA-PROVIDER-IMPL | stub metadataProvider を実際の SkillMetadataProvider 実装に置換。SKILL.md からツール情報取得 | 中     | `unassigned-task/UT-06-003-METADATA-PROVIDER-IMPL.md` |
| 3   | UT-06-003-DIP-REFACTOR           | registerSafetyGateHandlers の DIP 準拠化、as キャスト除去（P49）、unregister 関数追加（P5）  | 中     | `unassigned-task/UT-06-003-DIP-REFACTOR.md`           |

## P3 準拠 3 ステップ管理

| ステップ                            | 内容                                     | ステータス |
| ----------------------------------- | ---------------------------------------- | ---------- |
| 1. 指示書作成                       | `unassigned-task/` 配下に 3 ファイル作成 | 完了       |
| 2. task-workflow 残課題テーブル登録 | 別エージェント担当                       | 未実施     |
| 3. 関連仕様書リンク追加             | 別エージェント担当                       | 未実施     |

## 備考

- UT-06-003-PRELOAD-API-IMPL は TASK-SKILL-LIFECYCLE-08（PermissionDialog）の前提条件として優先度「高」に設定
- UT-06-003-METADATA-PROVIDER-IMPL は評価精度に影響するが、stub でも基本動作は可能なため優先度「中」
- UT-06-003-DIP-REFACTOR は技術的負債の解消であり、機能的な影響はないため優先度「中」
