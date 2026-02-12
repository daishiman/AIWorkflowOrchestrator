# スコープ定義

## タスク情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| タスクID | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION |
| 作成日   | 2026-02-11                            |

## スコープ内

| 項目                                 | 説明                                   |
| ------------------------------------ | -------------------------------------- |
| SkillService と SkillExecutor の接続 | Setter Injection パターンによる委譲    |
| 型変換実装                           | Skill → SkillMetadata の変換関数       |
| エラーハンドリングの統合             | 初期化エラー、スキル未検出エラーの処理 |
| E2E スモークテスト作成               | 全経路の動作確認テスト                 |

## スコープ外

| 項目                                | 理由                               |
| ----------------------------------- | ---------------------------------- |
| SkillExecutor 内部のSDKロジック変更 | 既存の実装を活用                   |
| Preload API の変更                  | 別タスク（TASK-FIX-5-1）で対応済み |
| 新しい実行モードの追加              | 本タスクの範囲外                   |
| ストリーミング機能の変更            | 既存の SkillExecutor 実装を使用    |

## 依存タスク

| タスクID      | 依存関係     |
| ------------- | ------------ |
| TASK-FIX-15-1 | 前提（完了） |
| TASK-FIX-16-1 | 前提（完了） |
| TASK-FIX-5-1  | 前提（完了） |

## 影響範囲

- `apps/desktop/src/main/services/skill/SkillService.ts`
- `apps/desktop/src/main/services/skill/SkillService.test.ts`（テスト追加）
- 関連するモック設定ファイル
