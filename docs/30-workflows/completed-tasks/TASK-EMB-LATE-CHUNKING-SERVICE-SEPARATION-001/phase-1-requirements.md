# Phase 1: 要件定義

## メタ情報

| 項目       | 値                                                           |
| ---------- | ------------------------------------------------------------ |
| Phase      | 1                                                            |
| タスクID   | TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001                |
| タスク種別 | NON_VISUAL code task                                         |
| 目的       | Late Chunking 責務分離に必要な要件・inventory・AC を固定する |
| 前Phase    | -（本 task の起点）                                          |
| 次Phase    | [phase-2-design.md](phase-2-design.md)                       |

> current fact: 本タスクは最終的に `ChunkingLateChunkingAdapter` 抽出として完了した。旧記述の `LateChunkingService` は計画時点の名称であり、実装完了時の正本は Phase 5 / 12 成果物を参照する。

## Phase 1 で固定する一次結論

| 観点               | 結論                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| 真の論点           | `ChunkingService` に混在した Late Chunking 9 メソッドを独立サービス層へ抽出し、テスト観測性と将来拡張耐性を確保する       |
| 依存関係・責務境界 | 責務は `LateChunkingService`（新設）、委譲元は `ChunkingService`、型定義の canonical は `chunking/types.ts`（移動しない） |
| 価値とコスト       | 高価値は Late Chunking 単独テスト可能化と観測性向上。コストは 9 メソッド移動・コンストラクタ拡張・SEP テスト新規作成      |
| 改善優先順位       | 9 メソッド inventory 固定 → public/private 分類 → コンストラクタ取得方法決定 → AC 確定 → artifact canonical 固定          |
| 4条件評価          | 初期は全 PASS（後方互換引数・一方向参照・ロジックコピー移動で成立）。Phase 2 で設計事項 1〜4 を確定して再評価する         |

## P50 チェック

### 実コード確認

- `packages/shared/src/services/chunking/chunking-service.ts`
  - L358-L397: `applyLateChunking(text, chunks, options)` - Late Chunking 処理の統括エントリーポイント（public）
  - L402-L429: `getTokenEmbeddings(text, tokenIds)` - トークン埋め込み取得（private）
  - L434-L447: `determineChunkBoundaries(chunks, text)` - チャンク境界 → トークン範囲変換（private）
  - L454-L464: `charPositionToTokenIndex(text, charPosition)` - 文字位置 → トークン位置変換（private）
  - L469-L505: `poolTokenEmbeddings(segmentEmbeddings, boundaries, strategy)` - プーリング処理（private）
  - L507-L515: `hasTokenOverlap(segment, boundary)` - トークン重なり判定（private）
  - L517-L526: `calculateOverlapTokens(segment, boundary)` - 重なり数計算（private）
  - L528-L552: `findNearestSegment(boundary, segments)` - 最近傍セグメント探索（private）
  - L554-L586: `averageEmbeddings(embeddings)` - 平均ベクトル計算（private）
- `packages/shared/src/services/chunking/types.ts`
  - `LateChunkingOptions` 型が定義されている（移動対象外、参照のみ）
- `packages/shared/src/services/chunking/interfaces.ts`
  - `ITokenizer` / `IEmbeddingClient` が定義されている（移動対象外、`LateChunkingService` が参照）
- `packages/shared/src/services/embedding/`
  - 既に `pipeline/` / `providers/` サブモジュールが存在。`late-chunking/` を同階層に新設する
- `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts`
  - 既存の Late Chunking 統合テストがあり、委譲後も PASS することを確認する

### 判断

- implementation_mode: `"new"`（9 メソッドの新規抽出と新規テスト作成が主体）
- 既実装コードの重複はない。`LateChunkingService.ts` は新規作成。
- 先行タスク TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001 の完了により `IEmbeddingClient.getTokenEmbeddings?()` が定義済みである前提を確認する。

## task classification【必須】

| 項目                 | 判定   | 理由                                                                                     |
| -------------------- | ------ | ---------------------------------------------------------------------------------------- |
| UI task              | いいえ | Renderer / UI コンポーネント変更を含まない                                               |
| docs-only            | いいえ | `packages/shared/src/services/embedding/late-chunking/` に新規コードを追加する           |
| NON_VISUAL code task | はい   | 変更対象は shared package の service クラス抽出と単体テスト追加で、UI 表示変更を伴わない |

Phase 11 は `NON_VISUAL code task` 用テンプレートに寄せ、screenshot は不要。自動テスト結果（SEP-01〜SEP-09）と `chunking-service.integration.test.ts` の PASS 状況を代替証跡として記録する。

## 実行タスク

### Task 1: 移動対象 9 メソッドの一覧化

以下の 9 メソッドを `outputs/phase-1/method-inventory.md` に列挙する。各メソッドについて、シグネチャ・依存先（`tokenizer` / `embeddingClient` への参照）・現在の行範囲・移動先（public/private）を記録する。

| メソッド名                 | 現在の行範囲 | 現在の可視性 | 移動先可視性 | 依存先                     |
| -------------------------- | ------------ | ------------ | ------------ | -------------------------- |
| `applyLateChunking`        | L358-L397    | private      | public       | tokenizer, embeddingClient |
| `getTokenEmbeddings`       | L402-L429    | private      | private      | tokenizer, embeddingClient |
| `determineChunkBoundaries` | L434-L447    | private      | public       | tokenizer                  |
| `charPositionToTokenIndex` | L454-L464    | private      | private      | tokenizer                  |
| `poolTokenEmbeddings`      | L469-L505    | private      | public       | なし（純粋計算）           |
| `hasTokenOverlap`          | L507-L515    | private      | private      | なし                       |
| `calculateOverlapTokens`   | L517-L526    | private      | private      | なし                       |
| `findNearestSegment`       | L528-L552    | private      | private      | なし                       |
| `averageEmbeddings`        | L554-L586    | private      | private      | なし                       |

### Task 2: public/private 分類の決定

テスト観測性の向上を目的として、以下 3 メソッドを public に昇格する。

| メソッド名                 | 昇格理由                                                               |
| -------------------------- | ---------------------------------------------------------------------- |
| `applyLateChunking`        | Late Chunking 処理のエントリーポイントとして外部呼び出し対象           |
| `determineChunkBoundaries` | 境界変換の正確性を単体テストで直接検証するため                         |
| `poolTokenEmbeddings`      | プーリング重み計算（mean/cls/attention）を単体テストで直接検証するため |

残り 6 メソッド（`getTokenEmbeddings` / `charPositionToTokenIndex` / `hasTokenOverlap` / `calculateOverlapTokens` / `findNearestSegment` / `averageEmbeddings`）は実装詳細として private を維持し、public メソッドの境界値テストで間接カバーする。

### Task 3: `LateChunkingService` のコンストラクタ取得方法決定

`ChunkingService` が `LateChunkingService` を取得する方法として以下 2 案を比較し、採用案を決定する。

| 案          | 方法                                                      | 採否   | 理由                                                                                                         |
| ----------- | --------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------ |
| オプションA | コンストラクタ第 4 引数 `lateChunkingService?` で受け取る | 採用   | テスト時にモックを注入できる。既存 3 引数呼び出しを壊さない（引数はオプショナル）                            |
| オプションB | `embeddingClient` 設定時に内部で自動生成                  | 不採用 | テスト時のモック注入ができず、SEP-08/SEP-09 の委譲確認テストで `LateChunkingService` を `vi.fn()` 化できない |

### Task 4: Canonical Artifacts の確定

| 成果物             | パス                                         |
| ------------------ | -------------------------------------------- |
| 要件定義           | `outputs/phase-1/requirements-definition.md` |
| メソッド inventory | `outputs/phase-1/method-inventory.md`        |
| artifact 一覧      | `outputs/phase-1/artifact-canonical-list.md` |

## 受入基準（AC）

| ID   | 基準                                                                                                                                                      | 検証方法                                                     |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| AC-1 | 9 メソッドの inventory が `method-inventory.md` に列挙され、現在の行範囲・依存先・移動先可視性が記録されている                                            | ファイル内容レビュー                                         |
| AC-2 | public 昇格 3 メソッド（`applyLateChunking` / `determineChunkBoundaries` / `poolTokenEmbeddings`）の昇格理由が記録されている                              | ファイル内容レビュー                                         |
| AC-3 | `ChunkingService` コンストラクタ第 4 引数 `lateChunkingService?: LateChunkingService` を採用する決定と、代替案（オプションB）の不採用理由が記録されている | 決定ログレビュー                                             |
| AC-4 | `LateChunkingOptions` を `chunking/types.ts` に残す方針と、`embedding/late-chunking → chunking/types.ts` の一方向参照方針が記録されている                 | 依存方向マップレビュー                                       |
| AC-5 | Phase 1〜13 の canonical artifact 一覧が `artifact-canonical-list.md` に固定されている                                                                    | `outputs/artifacts.json` との parity 確認（Phase 12 で実施） |

## 統合テスト連携

- 本 Phase では統合テストは実行しない。
- Phase 1 成果物をもとに Phase 4 で SEP-01〜SEP-09 を TDD Red で作成する。
- 既存 `chunking-service.integration.test.ts` の Late Chunking 関連テスト一覧を `method-inventory.md` に記録し、Phase 5 実装後の PASS 確認に使用する。

## 参照資料

- `packages/shared/src/services/chunking/chunking-service.ts`
- `packages/shared/src/services/chunking/types.ts`
- `packages/shared/src/services/chunking/interfaces.ts`
- `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts`
- `packages/shared/src/services/embedding/`
- `.claude/skills/task-specification-creator/references/phase-template-core.md`
- GitHub Issue #2314（daishiman/AIWorkflowOrchestrator、CLOSED 状態のまま参照）

## 多角的チェック観点（AI が判断）

- **論理分析系**: 9 メソッドの依存先と副作用を帰納的に分解し、public 昇格候補の判定根拠を示す
- **構造分解系**: 移動対象と対象外（`LateChunkingOptions`）を MECE に分ける
- **システム系**: `chunking → embedding/late-chunking` の一方向参照が成立するかを因果関係で確認する
- **戦略・価値系**: 観測性向上・テスト容易化・将来拡張耐性の 3 価値を個別に記述する
- **問題解決系**: 「mock では困難」を真因とし、public 昇格が解決策として妥当かを論点思考で検証する

## サブタスク管理

| サブタスク              | 責任 Lane | 成果物                              |
| ----------------------- | --------- | ----------------------------------- |
| 9 メソッド監査          | Lane A    | `method-inventory.md`               |
| public/private 分類     | Lane B    | `requirements-definition.md` に記録 |
| artifact canonical 固定 | Lane C    | `artifact-canonical-list.md`        |

## 成果物

| 成果物             | パス                                         |
| ------------------ | -------------------------------------------- |
| 要件定義           | `outputs/phase-1/requirements-definition.md` |
| メソッド inventory | `outputs/phase-1/method-inventory.md`        |
| artifact 一覧      | `outputs/phase-1/artifact-canonical-list.md` |

## 完了条件

- [ ] P50 チェック結果を記録した
- [ ] task classification（NON_VISUAL code task）を確定した
- [ ] 9 メソッドの inventory を `method-inventory.md` に列挙した
- [ ] public 昇格 3 メソッドと private 維持 6 メソッドの分類根拠を記録した
- [ ] `ChunkingService` コンストラクタ第 4 引数採用（オプションA）と不採用理由（オプションB）を記録した
- [ ] `LateChunkingOptions` を `chunking/types.ts` に残す一方向参照方針を記録した
- [ ] AC-1 から AC-5 を確定した
- [ ] artifact canonical 一覧を固定した

## タスク100%実行確認【必須】

- [ ] Task 1: 移動対象 9 メソッドの一覧化 完了
- [ ] Task 2: public/private 分類の決定 完了
- [ ] Task 3: コンストラクタ取得方法決定 完了
- [ ] Task 4: Canonical Artifacts の確定 完了

## 次Phase

[phase-2-design.md](phase-2-design.md) でコンストラクタシグネチャ・組み込み方法（オプションA）・ディレクトリ構造・SEP-01〜SEP-09 テストケース一覧を設計する。
