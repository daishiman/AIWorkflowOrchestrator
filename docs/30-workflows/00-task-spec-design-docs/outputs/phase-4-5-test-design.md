# Phase 4-5: テスト設計・実装

## TASK-SW-STRUCT-001 テスト方針

- `runCreateWorkflow` が `purpose: options.description` を返すことを検証
- `agents` がエージェント名文字列リストであることを検証

## TASK-SW-STREAM-001 テスト方針

- コールバックなしで `createSkill` が正常動作すること（後方互換性）
- コールバックあり時に各段階で呼び出されること
- コールバックの phase/percentage/message が仕様に沿うこと
