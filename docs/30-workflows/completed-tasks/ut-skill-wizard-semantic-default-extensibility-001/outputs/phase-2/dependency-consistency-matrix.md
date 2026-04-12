# Phase 2: 依存整合マトリクス

| コンポーネント                 | 依存先                                 | 変更影響                        |
| ------------------------------ | -------------------------------------- | ------------------------------- |
| ConversationRoundStep.tsx      | @repo/shared/types/skillWizard（新規） | 新規依存追加のみ、後方互換あり  |
| packages/shared                | なし（新規ファイル追加のみ）           | barrel 変更なし（subpath のみ） |
| ConversationRoundStep.test.tsx | @repo/shared/types/skillWizard（新規） | テスト用 import 追加            |
| 他のウィザードコンポーネント   | ConversationRoundStep の public Props  | シグネチャ不変（影響なし）      |

## ビルド影響確認

- `packages/shared/package.json` の `exports` 追加は既存エントリを変更しない
- `typesVersions` 追加も既存エントリに影響なし
- subpath `./types/skillWizard` は新規のため衝突なし
