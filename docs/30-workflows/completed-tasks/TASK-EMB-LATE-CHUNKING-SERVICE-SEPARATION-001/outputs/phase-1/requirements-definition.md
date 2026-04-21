# 要件定義 - Phase 1

## タスク ID / 名称

- TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001
- Late Chunking 責務分離・専用サービス層抽出

## タスク分類

| 項目                 | 判定   | 理由                                                                           |
| -------------------- | ------ | ------------------------------------------------------------------------------ |
| UI task              | いいえ | Renderer/UI コンポーネント変更を含まない                                       |
| docs-only            | いいえ | `packages/shared/src/services/embedding/late-chunking/` に新規コードを追加する |
| NON_VISUAL code task | はい   | shared package 内の service クラス抽出と単体テスト追加。UI 表示変更なし        |

## 真の論点

1. `ChunkingService` が「戦略統合ファサード」本来の責務を超えて Late Chunking アルゴリズムの具体ロジックを保持している（SRP 違反）
2. Late Chunking の中間ステップ（境界変換・プーリング）が private に閉じており、`ChunkingService` 経由では入出力しか検証できない
3. 将来 token-level hidden states を使う真の Late Chunking（先行タスク）や `EmbeddingPipeline` 統合（後続タスク）を重ねると責務混在が悪化

## 実態ベースの方針確定

仕様書前提（9 メソッド / 638 行）と実コード（4 メソッド / 502 行）に乖離があるため、実コードに即した以下の方針で進める:

- 実在 4 メソッド（`applyLateChunking` / `getTokenEmbeddings` / `determineChunkBoundaries` / `poolTokenEmbeddings`）のみを抽出
- 仕様書が前提とする 5 メソッド（`charPositionToTokenIndex` 他）は不在のため抽出対象外
- `IEmbeddingClient.getTokenEmbeddings?()` は現在未定義。既存の `embed()` フォールバックをそのまま維持
- SEP-01〜SEP-09 は 4 メソッドと委譲ロジック範囲に再マッピング（Phase 4 で確定）
- Phase 12 `unassigned-task-detection.md` に「先行タスク TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001 未完了」を記録

## public/private 分類の決定

### public 昇格 3 メソッド

| メソッド                   | 昇格理由                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------ |
| `applyLateChunking`        | Late Chunking 処理のエントリーポイント。外部呼び出し対象                             |
| `determineChunkBoundaries` | チャンク境界変換の正確性を単体テストで直接検証するため                               |
| `poolTokenEmbeddings`      | プーリング戦略（`mean` / `cls` / `attention`）別の挙動を単体テストで直接検証するため |

### private 維持 1 メソッド

| メソッド             | 維持理由                                                  |
| -------------------- | --------------------------------------------------------- |
| `getTokenEmbeddings` | 実装詳細。public 3 メソッドの入出力テストで間接カバー可能 |

## コンストラクタ取得方法決定

| 案           | 方法                                                      | 採否   | 理由                                                                                                         |
| ------------ | --------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------ |
| オプション A | コンストラクタ第 4 引数 `lateChunkingService?` で受け取る | 採用   | テスト時にモック注入可能。既存 3 引数呼び出し（`tokenizer`, `embeddingClient?`, `llmClient?`）を壊さない     |
| オプション B | `embeddingClient` 設定時に内部で自動生成                  | 不採用 | テスト時のモック注入ができず、SEP-07/SEP-08 の委譲確認テストで `LateChunkingService` を `vi.fn()` 化できない |

既定挙動: `lateChunkingService` 未指定かつ `embeddingClient` 設定時は `ChunkingService` 側で `new LateChunkingService(tokenizer, embeddingClient)` を生成する（後方互換）。

## `LateChunkingOptions` 参照方針

- canonical 位置: `packages/shared/src/services/chunking/types.ts` に据え置き
- `embedding/late-chunking` 側はこれを型 import のみで参照（一方向参照）
- `chunking → embedding` の逆方向参照は発生させない（循環参照回避）

## 受入基準（AC）

| ID   | 基準                                                                                                                                               | 検証方法                                                     |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| AC-1 | 実在 4 メソッドの inventory が `method-inventory.md` に列挙され、行範囲・依存先・移動先可視性が記録されている                                      | ファイル内容レビュー                                         |
| AC-2 | public 昇格 3 メソッドの昇格理由が記録されている                                                                                                   | ファイル内容レビュー                                         |
| AC-3 | `ChunkingService` コンストラクタ第 4 引数 `lateChunkingService?: LateChunkingService` 採用決定と代替案（オプション B）の不採用理由が記録されている | 決定ログレビュー                                             |
| AC-4 | `LateChunkingOptions` を `chunking/types.ts` に残す方針と `embedding → chunking` 一方向参照方針が記録されている                                    | 依存方向マップレビュー                                       |
| AC-5 | Phase 1〜13 の canonical artifact 一覧が `artifact-canonical-list.md` に固定されている                                                             | `outputs/artifacts.json` との parity 確認（Phase 12 で実施） |

## 4 条件評価（初期）

| 条件   | 判定 | 主因                                                                    |
| ------ | ---- | ----------------------------------------------------------------------- |
| 価値性 | PASS | Late Chunking 単独テスト可能化・観測性向上                              |
| 実現性 | PASS | 実在 4 メソッドのコピー移動と委譲配線のみ。新規アルゴリズムは導入しない |
| 整合性 | PASS | `chunking → embedding/late-chunking` の一方向参照で循環回避             |
| 運用性 | PASS | 既存 3 引数コンストラクタ呼び出しを破壊しない（新引数はオプショナル）   |

## サブタスク管理

| サブタスク              | 責任 Lane | 成果物                       |
| ----------------------- | --------- | ---------------------------- |
| 4 メソッド監査          | Lane A    | `method-inventory.md`        |
| public/private 分類     | Lane B    | 本ファイル内の分類表         |
| artifact canonical 固定 | Lane C    | `artifact-canonical-list.md` |

## 完了条件

- [x] P50 チェック結果を記録した（method-inventory.md に実コード確認記載）
- [x] task classification（NON_VISUAL code task）を確定した
- [x] 実在 4 メソッドの inventory を `method-inventory.md` に列挙した
- [x] public 昇格 3 メソッドと private 維持 1 メソッドの分類根拠を記録した
- [x] コンストラクタ第 4 引数採用（オプション A）と不採用理由（オプション B）を記録した
- [x] `LateChunkingOptions` 据え置き・一方向参照方針を記録した
- [x] AC-1 から AC-5 を確定した
- [x] artifact canonical 一覧を固定した（`artifact-canonical-list.md` 側）
