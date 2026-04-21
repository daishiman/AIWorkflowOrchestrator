# Design Review Result - Phase 3

## 4 条件再評価

| 条件   | Phase 1 初期判定 | Phase 3 再判定 | 判定根拠                                                                                                                       |
| ------ | ---------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 価値性 | PASS             | PASS           | public 昇格 3 メソッドの単体テスト可能化で「mock では困難」の真因を解消。Phase 1 の method-inventory で範囲限定済み            |
| 実現性 | PASS             | PASS           | 実在 4 メソッドのコピー移動のみで完結。新規アルゴリズム導入なし                                                                |
| 整合性 | PASS             | PASS           | `chunking → embedding/late-chunking` の一方向参照で循環回避。`LateChunkingOptions` を `chunking/types.ts` 据え置きで責務明確化 |
| 運用性 | PASS             | PASS           | `ChunkingService` 第 4 引数オプショナル。既存 3 引数呼び出しは非破壊                                                           |

## 逆方向参照チェック

- `chunking/types.ts` の import 文を確認: `embedding/late-chunking` への依存なし → OK
- `chunking/interfaces.ts` の import 文: 同上 → OK
- `chunking/errors.ts`: 同上 → OK
- `chunking/chunking-service.ts` → `embedding/late-chunking/index.ts`: 新規 import（value） → OK
- `embedding/late-chunking/LateChunkingService.ts` → `chunking/interfaces.ts`, `chunking/types.ts`, `chunking/errors.ts`: type/value import → OK

## `LateChunkingOptions` 据え置き方針の再確認

| 案                                        | 採否   | 理由                                                                                          |
| ----------------------------------------- | ------ | --------------------------------------------------------------------------------------------- |
| `chunking/types.ts` 据え置き              | 採用   | chunking 層の公開インターフェースの一部。`ChunkingInput.advanced.lateChunking` から参照される |
| `embedding/late-chunking/types.ts` へ移動 | 不採用 | `ChunkingInput` が `embedding` を import する逆方向参照が発生する                             |

## Phase 2 設計事項 1〜4 の完備確認

| 設計事項 | 完備 | 記載場所                                                          |
| -------- | ---- | ----------------------------------------------------------------- |
| 1        | ✓    | `constructor-signature.md`                                        |
| 2        | ✓    | `constructor-signature.md` （オプションA 採用・B 不採用理由記載） |
| 3        | ✓    | `solution-design.md` （ディレクトリ構造・参照方向マップ）         |
| 4        | ✓    | `validation-path.md` （SEP-01〜SEP-09）                           |

## ゲート判定

- Phase 2 → Phase 3: PASS
  - コンストラクタシグネチャ確定
  - オプションA 採用
  - ディレクトリ構造確定
  - SEP-01〜SEP-09 明記済み
- Phase 3 → Phase 4: PASS
  - 4 条件全 PASS
  - 逆方向参照ゼロ確認済み
  - `LateChunkingOptions` 据え置き方針確定

## 残課題（Phase 4 以降で対応）

| ID  | 課題                                                                                         | 対応 Phase |
| --- | -------------------------------------------------------------------------------------------- | ---------- |
| R1  | 先行タスク未完了のため `IEmbeddingClient.getTokenEmbeddings?()` 参照を前提としない実装に限定 | Phase 5    |
| R2  | 仕様書前提の 5 メソッド不在を `unassigned-task-detection.md` に記録                          | Phase 12   |
| R3  | `poolTokenEmbeddings` が現状「簡略化実装」（全 strategy で同値を返す）である旨を記録         | Phase 10   |
