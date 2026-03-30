# Phase 4 — 失敗ケース定義 (TASK-P0-03)

## 概要

workflow-manifest.json のバリデーションにおける異常系テストケース。
ManifestLoader が不正な manifest を検出した際に適切なエラーメッセージを返すことを検証する。

## 失敗ケース一覧

### FC-01: schemaVersion が 2

- **入力**: `{ "schemaVersion": 2, ... }`
- **期待エラー**: `"schemaVersion は 1 のみ受理します"`
- **対応 AC**: AC-6
- **検証ポイント**: schemaVersion の厳密な値チェック。将来のバージョンアップ時にも後方互換を保証するため、未知のバージョンは明示的に拒否する。

### FC-02: phases が空配列

- **入力**: `{ "phases": [], ... }`
- **期待エラー**: `"phases は1件以上の配列である必要があります"`
- **対応 AC**: AC-5
- **検証ポイント**: ワークフローには最低1つの phase が必要。空の phases は実行不可能なワークフローを意味するため、読み込み時点で拒否する。

### FC-03: resource.path が存在しないファイル

- **入力**: `{ "resources": [{ "path": "./nonexistent/file.md", ... }], ... }`
- **期待エラー**: `fs.access` error (ENOENT)
- **対応 AC**: AC-4
- **検証ポイント**: resource descriptor が参照するファイルの実在性チェック。デプロイ後に参照切れが発生することを防止する。

### FC-04: entryHookId が entry[] に存在しない

- **入力**: `{ "phases": [{ "entryHookId": "nonexistent-hook", ... }], "hooks": { "entry": [], ... } }`
- **期待エラー**: `"phases[N].entryHookId が entry に存在しません"`
- **対応 AC**: AC-7
- **検証ポイント**: phase が参照する hook ID が hooks.entry[] 内に定義されていることを保証する。hook の参照整合性が壊れた状態でのワークフロー実行を防止する。

## 失敗ケースの実装方針

各失敗ケースは、正常な manifest JSON を base にして対象フィールドのみを改変した fixture を使用する。
テストでは `expect(...).rejects.toThrow()` または `expect(...).toThrowError()` パターンでエラーメッセージを検証する。
