# Phase 8 リファクタリング記録

## 実施内容

| 項目                  | 内容                                                                   |
| --------------------- | ---------------------------------------------------------------------- |
| scoring 分離          | `buildSearchResults()` / `scoreFilePath()` を pure function として保持 |
| timeout 抽出          | `readFileWithTimeout()` を `WorkspaceView` 内 helper として切り出し    |
| fallback 整理         | PreviewPanel 内で `read error` と `structured fallback` を分岐整理     |
| error boundary テスト | crash / reset の回帰を専用 test に分離                                 |

## 方針

- 新規 abstraction を増やしすぎず、既存 04A への接続面を小さく保つ
- ロジック分離は test の観測点が増える箇所だけに限定した
