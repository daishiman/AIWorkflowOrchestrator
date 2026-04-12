# Phase 1: aiworkflow-requirements 仕様抽出結果

## shared 型配置ルール

### packages/shared 配置基準

- UI コンポーネント固有のビジネスロジック（変換テーブル等）は `packages/shared/src/types/` に配置
- ファイル命名: kebab-case（例: `skill-wizard-label-map.ts`）
- subpath export 方式: `packages/shared/package.json` の `exports` + `typesVersions` に追加

### リファクタリング品質基準

- 型安全: any型禁止、`Record<string, Record<string, string>>` 形式で型安全性を保証
- 後方互換: デフォルト引数でシグネチャ変更なしの既存コード互換を維持
- テスト: 変更ファイルのline カバレッジ 100%、branch カバレッジ 90%以上

## IPC 影響確認

- 本タスクは UI コンポーネントの内部ロジックリファクタリングのみ
- IPC チャンネル・Electron メインプロセスへの影響なし（NON_VISUAL）
