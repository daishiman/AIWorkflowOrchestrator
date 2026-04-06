# Unassigned Task Detection

## サマリー

| 区分               | 件数 |
| ------------------ | ---- |
| current            | 0    |
| baseline / related | 1    |

## current

- 新規未タスクなし。

## baseline / related

#### 未タスク-01: `IpcResult<T>` 型の共有化

| 項目           | 内容                                                              |
| -------------- | ----------------------------------------------------------------- |
| 検出源         | Phase 8 リファクタリングログ セクション 4-2                       |
| 問題           | `IpcResult<T>` 型が複数ファイルにローカル定義されている           |
| 推奨対応       | `packages/shared/src/ipc/` などへ移し、両ファイルから import する |
| 優先度         | 低                                                                |
| スコープ外理由 | 共有パッケージ変更を伴うため独立タスクとして扱うべき              |

## 判定メモ

- 旧ディレクトリ参照、Phase 12 の欠落成果物、validator 警告は current wave 内で是正した。
- `assertSender` / `validateSender` の統一化と `deleteSession` の結果返却は current wave 内で是正済み。
- `IpcResult<T>` の共有化は、今回のドキュメント整備とは独立した follow-up として保持する。
