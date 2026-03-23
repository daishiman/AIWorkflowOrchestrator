# UT-SLIDE-IPC-TEMPLATE-001: IPC ハンドラ追加時の標準テンプレート（scaffold）

## メタ情報

| 項目       | 値                                            |
| ---------- | --------------------------------------------- |
| タスク ID  | UT-SLIDE-IPC-TEMPLATE-001                     |
| 優先度     | low                                           |
| 検出元     | TASK-IMP-SLIDE-RUNTIME-ALIGNMENT-001 Phase 12 |
| 関連 Issue | #1363                                         |

## 背景

D1（IPC handler 未接続）、D2（チャネル名 legacy）、D5（validateIpcSender 未実装）は全て「IPC ハンドラ追加時に最後の一手を省略した」パターンに起因する。新しい IPC ハンドラを追加する際に、以下の全ステップを確実に実施するための scaffold（テンプレート）を整備することで、同様の drift を構造的に防止する。

## 要件

1. IPC ハンドラ追加時のチェックリストテンプレートを作成する:
   - チャネル定数の定義（`as const`）
   - `registerAllIpcHandlers()` への接続
   - `unregisterAllIpcHandlers()` への解除ロジック
   - `validateIpcSender()` の適用
   - P42 3段バリデーションの適用
   - `detectPathTraversal()` の適用（パス引数がある場合）
   - Preload `channels.ts` の allowlist への追加
   - Preload API メソッドの追加
   - テストファイルの作成
2. scaffold スクリプト（`scripts/create-ipc-handler.ts`）を作成する（任意）

## 受入基準

- [ ] チェックリストテンプレートが文書化されている
- [ ] 新規 IPC ハンドラ追加時に参照可能な場所に配置されている
- [ ] セキュリティ要件（validateIpcSender, P42, path guard）が漏れなく含まれている

## 参照

- `apps/desktop/src/main/slide/ipc-handlers.ts`（実装例）
- `.claude/rules/04-electron-security.md`（IPC セキュリティ原則）
- `.claude/rules/06-known-pitfalls.md`（P42, P44, P45）
