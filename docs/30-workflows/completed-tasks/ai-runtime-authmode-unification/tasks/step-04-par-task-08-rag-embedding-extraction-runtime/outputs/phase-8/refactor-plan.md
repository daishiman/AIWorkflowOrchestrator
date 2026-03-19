# Phase 8: リファクタリング計画

## メタ情報

- 実行日: 2026-03-19
- 対象タスク: step-04-par-task-08-rag-embedding-extraction-runtime
- Phase 5 変更対象ファイル:
  - `apps/desktop/src/main/ipc/aiHandlers.ts`
  - `apps/desktop/src/main/ipc/communityHandlers.ts`

## 5観点分析

### 観点 1: IPC handler の薄さ（index job / online query 境界）

**調査コマンド**:

```
grep -n "ipcMain.handle" apps/desktop/src/main/ipc/aiHandlers.ts
```

**結果**:

- `AI_CHAT` ハンドラ: LLM chat のみ担当。RAG クエリ実行は行わない
- `AI_CHECK_CONNECTION`: guidance-only スタブ（status: "disconnected", indexedDocuments: 0 を返す）
- `AI_INDEX`: guidance-only スタブ（エラーメッセージ付きで indexedCount: 0 を返す）
- Community 系 6ハンドラ: 全て `GUIDANCE_RESPONSE` の定数返しスタブ

**判定**: ハンドラはいずれも単一責務かつ薄い。境界の混乱なし。

### 観点 2: embedding / extraction / query classifier / graph summary helper 境界整理

**調査結果**:

- Phase 5 では `packages/shared/src/services/embedding/`、`extraction/`、`graph/`、`search/` に変更なし
- これらのサービス層は今回のスコープ外（RAG runtime は guidance-only として登録済み）
- `hybrid-rag-factory.ts` に `@placeholder` アノテーションが存在するが、Phase 5 変更ではなく既存の設計意図（依存モジュール完成後に置換予定）

**判定**: スコープ外。リファクタリング不要。

### 観点 3: 重複コード検出

**調査コマンド**:

```
grep -rn "guidance-only|not-in-scope|FACTORY_NOT_READY" apps/desktop/src/main/ipc/ packages/shared/src/services/
```

**結果**:

- `GUIDANCE_RESPONSE` 定数: `communityHandlers.ts` のモジュールスコープに正しく集約済み。6ハンドラが共有しており重複なし
- `aiHandlers.ts`: `AI_CHECK_CONNECTION` / `AI_INDEX` は独立した guidance レスポンスを inline 記述しているが、戻り値の型と構造が異なるため定数化は不適切
- `FACTORY_NOT_READY` 文字列: `hybrid-rag-factory.ts` の 2 箇所に存在するが Phase 5 変更外

**判定**: communityHandlers.ts の重複解消は既に達成済み。追加リファクタリング不要。

### 観点 4: 命名規則の一貫性

**調査結果**:

- `communityHandlers.ts`: 定数名 `GUIDANCE_RESPONSE`（SCREAMING_SNAKE_CASE）、コメント `guidance-only`（kebab-case）
- `aiHandlers.ts`: コメント `// Check AI/RAG connection (guidance-only: legacy 互換残置)` と命名一貫
- `guidanceAction` というシンボルは存在しない（混乱要素なし）

**判定**: 命名規則は `GUIDANCE_RESPONSE`（定数）/ `guidance-only`（コメント）で統一済み。

### 観点 5: import path 最適化

**調査コマンド**:

```
grep -rn "from '.*\.\.\/\.\.\/\.\.\/\.\.\/''" apps/desktop/src/main/ipc/aiHandlers.ts apps/desktop/src/main/ipc/communityHandlers.ts
```

**結果**: 深い相対 import パス（4階層以上）は存在しない。`../../preload/channels` 等の適切な深度の相対パスのみ使用。

**判定**: import path は適切。最適化不要。

## リファクタリング実施判断

| 観点         | 問題の有無                                   | 対応     |
| ------------ | -------------------------------------------- | -------- |
| IPC 境界     | なし                                         | 変更不要 |
| サービス境界 | なし（スコープ外）                           | 変更不要 |
| 重複コード   | なし（communityHandlers は既に定数集約済み） | 変更不要 |
| 命名規則     | なし                                         | 変更不要 |
| import path  | なし                                         | 変更不要 |

**結論**: Phase 5 の変更は最小限（guidance-only スタブへの置換）であり、変更範囲が小さく責務境界が明確なため、追加リファクタリングは不要。

## 既存テスト確認

Phase 8 実施前の確認コマンドおよび結果は `test-pass-confirmation.md` を参照。
