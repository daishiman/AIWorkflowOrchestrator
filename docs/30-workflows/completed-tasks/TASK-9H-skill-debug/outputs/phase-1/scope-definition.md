# スコープ定義 - TASK-9H-SKILL-DEBUG

## スコープ内

### 新規作成ファイル（3ファイル）

| ファイル         | パス                                                  | 責務               |
| ---------------- | ----------------------------------------------------- | ------------------ |
| skill-debug.ts   | packages/shared/src/types/skill-debug.ts              | デバッグ関連型定義 |
| DebugSession.ts  | apps/desktop/src/main/services/skill/DebugSession.ts  | セッション状態管理 |
| SkillDebugger.ts | apps/desktop/src/main/services/skill/SkillDebugger.ts | デバッグ統合Facade |

### 変更ファイル（5ファイル）

| ファイル         | パス                                            | 変更内容                            |
| ---------------- | ----------------------------------------------- | ----------------------------------- |
| index.ts         | packages/shared/src/types/index.ts              | re-export追加                       |
| channels.ts      | apps/desktop/src/preload/channels.ts            | 7チャネル定数+ホワイトリスト追加    |
| types.ts         | apps/desktop/src/preload/types.ts               | デバッグAPI型追加                   |
| skill-api.ts     | apps/desktop/src/preload/skill-api.ts           | debug オブジェクト追加（7メソッド） |
| skillHandlers.ts | apps/desktop/src/main/ipc/skillDebugHandlers.ts | 7ハンドラ追加                       |

### テストファイル（4ファイル）

| ファイル                   | テスト数目安 |
| -------------------------- | ------------ |
| skill-debug.test.ts        | ~10          |
| DebugSession.test.ts       | ~35          |
| SkillDebugger.test.ts      | ~40          |
| skillDebugHandlers.test.ts | ~16          |

## スコープ外

- Renderer（UI）コンポーネントの実装
- E2Eテスト
- パフォーマンスベンチマーク
- コミット・PR作成（Phase 13対象外）

## 依存関係

| 依存先           | 内容                 | ステータス   |
| ---------------- | -------------------- | ------------ |
| TASK-9B          | skill-creator スキル | 完了済み     |
| Claude Agent SDK | Hooks システム       | 利用可能     |
| SkillExecutor    | query() メソッド     | 既存実装あり |
