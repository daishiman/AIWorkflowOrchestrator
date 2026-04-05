# Phase 1: 要件定義

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 1                                      |
| タスクID   | TASK-P0-03                             |
| 機能名     | workflow-manifest-production-placement |
| カテゴリ   | 新機能（Spec P0系）                    |
| タスク分類 | NON_VISUAL（UIタスクではない）         |
| 規模       | 小規模                                 |
| 依存       | なし                                   |
| 被依存     | P0-04, P0-07, P0-09                    |
| 作成日     | 2026-04-04                             |

## 目的

ManifestLoader が読み込む `workflow-manifest.json` を canonical / mirror で再確定するために、ManifestLoader の検証ロジック・既存テスト・manifest 構造の調査を行い、要件を固定する。

## 背景

ManifestLoader は動的パイプライン構築のために `workflow-manifest.json` を読み込む。canonical / mirror には既に manifest が存在するため、テストフィクスチャとの一致と本番 manifest の内容固定を先行して確認する必要がある。P0-04（loader デフォルト有効化）、P0-07（動的エージェント名解決）、P0-09（permission/hooks governance）がこのタスクに依存するため、先行して manifest の構造と配置状態を固定する必要がある。

## 実行タスク

- ManifestLoader.ts の検証ロジック（11ステップ）を精査し、manifest が満たすべき構造要件を列挙する
- 既存テスト `ManifestLoader.production-manifest.test.ts`（TC-01〜RC-03: 17ケース）の期待値を分析する
- テストフィクスチャ（`fixtures/workflow-manifest/workflow-manifest.json`）の構造を確認し、本番 manifest との差分を把握する
- 既存コードの命名規則を分析する（camelCase: `schemaVersion`, `workflowId`, `entryHookId`, `exitHookId`, `resourceIds`, `phaseIds`, `dependsOn`）
- canonical パス（`.claude/skills/skill-creator/`）と mirror パス（`.agents/skills/skill-creator/`）の現状を確認する

## 要件

### 機能要件（FR）

| 要件ID | AC   | 要件                                                                                     |
| ------ | ---- | ---------------------------------------------------------------------------------------- |
| FR-01  | AC-1 | `.claude/skills/skill-creator/workflow-manifest.json` が存在する                         |
| FR-02  | AC-2 | `.agents/skills/skill-creator/workflow-manifest.json` が存在し canonical と同一内容      |
| FR-03  | AC-3 | `ManifestLoader.loadManifest(canonicalManifestPath)` がエラーなく完了する                |
| FR-04  | AC-4 | 全 resource の absolutePath が実在ファイルを指す                                         |
| FR-05  | AC-5 | phases が 5 件（requirements-gathering, plan, execute, verify, improve）をこの順序で含む |
| FR-06  | AC-6 | schemaVersion が 1 である                                                                |
| FR-07  | AC-7 | 全 phase の entryHookId/exitHookId が entry[]/exit[] に存在する                          |

### 非機能要件（NFR）

| 要件ID | 要件                                                                  |
| ------ | --------------------------------------------------------------------- |
| NFR-01 | `ManifestLoader.production-manifest.test.ts` の全17ケースが PASS する |
| NFR-02 | `pnpm --filter @repo/desktop typecheck` がエラーなしで完了する        |
| NFR-03 | `pnpm --filter @repo/desktop lint` がエラーなしで完了する             |
| NFR-04 | manifest JSON の命名規則が既存コードベース（camelCase）に準拠する     |

## スコープ

### 含む

- `workflow-manifest.json` の構造設計と canonical パスへの配置
- mirror パス（`.agents/skills/skill-creator/`）への同一内容のコピー配置
- 5 フェーズ定義（requirements-gathering, plan, execute, verify, improve）
- resource descriptor（agent / reference / schema）の定義
- entry / exit hook の定義
- phase ↔ resource の双方向参照

### 含まない

- ManifestLoader.ts のコード変更（既存の検証ロジックをそのまま利用）
- P0-04（ManifestLoader デフォルト有効化）以降の実装
- skill-creator ディレクトリ内の agent / reference / schema ファイルの新規作成・変更
- P0-07（動的エージェント名解決）や P0-09（permission/hooks governance）の実装

## Phase 0: P50 チェック（現状調査）

### 調査項目

| 調査対象                | 確認内容                                                           |
| ----------------------- | ------------------------------------------------------------------ |
| canonical パス          | `.claude/skills/skill-creator/workflow-manifest.json` の有無と内容 |
| mirror パス             | `.agents/skills/skill-creator/workflow-manifest.json` の有無と内容 |
| canonical/mirror 同一性 | 2ファイルが byte-for-byte 同一か                                   |
| ManifestLoader 検証通過 | 既存 manifest で `loadManifest()` が成功するか                     |
| テスト結果              | `ManifestLoader.production-manifest.test.ts` の PASS/FAIL          |
| resource path 実在      | 全 resource.path が skill-creator ディレクトリに存在するか         |

### 現状（2026-04-04 時点の確認結果）

- canonical / mirror 両パスに `workflow-manifest.json` が既に存在する
- テスト実行で現状の PASS/FAIL 状態を確認する必要がある

## ManifestLoader の検証ロジック（11ステップ）

| ステップ | 検証内容                                                                        |
| -------- | ------------------------------------------------------------------------------- |
| 1        | JSON 読み込み、トップレベルフィールド確認（ALLOWED_TOP_LEVEL_FIELDS のみ）      |
| 2        | `schemaVersion === 1`（`WORKFLOW_MANIFEST_SCHEMA_VERSION` 定数）                |
| 3        | `workflowId` が空でない文字列                                                   |
| 4        | `entry[]` に id / command あり、id は一意                                       |
| 5        | `exit[]` に id / command あり、id は一意                                        |
| 6        | `resources[]` に id / kind / path あり、kind は agent\|reference\|schema\|asset |
| 7        | `phases[]` に id / title / entryHookId / exitHookId あり                        |
| 8        | `entryHookId` → `entry[]`、`exitHookId` → `exit[]` のクロスリファレンス         |
| 9        | `phase.resourceIds` → `resources[].id` の参照整合                               |
| 10       | `resource.phaseIds` ↔ `phases[].resourceIds` の双方向一致                       |
| 11       | `dependsOn` の順序検証（依存先が自身より前に定義されている）                    |
| 12       | `resource.path` のファイル存在確認（optional でない場合）                       |

## 参照資料

| 資料名                     | パス                                                                                                 | 説明                     |
| -------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------ |
| ManifestLoader             | `apps/desktop/src/main/services/runtime/ManifestLoader.ts`                                           | 検証ロジック本体         |
| production-manifest テスト | `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.production-manifest.test.ts`        | TC-01〜RC-03（17ケース） |
| テストフィクスチャ         | `apps/desktop/src/main/services/runtime/__tests__/fixtures/workflow-manifest/workflow-manifest.json` | 既存フィクスチャ構造     |
| remediation pack           | `docs/30-workflows/skill-creator-agent-sdk-lane/p0-verify-manifest-remediation-pack.md`              | 全体構成・依存マトリクス |
| canonical manifest（現状） | `.claude/skills/skill-creator/workflow-manifest.json`                                                | 現在の本番 manifest      |
| mirror manifest（現状）    | `.agents/skills/skill-creator/workflow-manifest.json`                                                | 現在の mirror manifest   |
| 共有型定義                 | `packages/shared/src/types/` 配下                                                                    | WorkflowManifest 型      |

### システム仕様（aiworkflow-requirements）

| 参照対象                     | パス                                                                                        | 要点                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| workflow manifest foundation | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | `WorkflowManifest*` / `LoadedWorkflowManifest` / `ManifestLoader` の read / validate 契約      |
| orchestration boundary       | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`           | `ManifestLoader` は workflow foundation であり state owner ではない                            |
| owner separation             | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | `ManifestLoader` は route/state authority を持たず `SkillCreatorWorkflowEngine` と責務分離する |

## 統合テスト連携

- `ManifestLoader.production-manifest.test.ts` の TC-01〜RC-03（17ケース）が本タスクの検証ゲートとなる
- TC-01: canonical manifest の loadManifest() 成功（AC-1, AC-3）
- TC-02: schemaVersion === 1（AC-6）
- TC-03: 全 resource の absolutePath 実在（AC-4）
- TC-04: phases が 5 件で正しい順序（AC-5）
- TC-05: entry/exit hooks 定義あり（AC-7）
- TC-06: entryHookId → entry[] 参照整合（AC-7）
- TC-07: exitHookId → exit[] 参照整合（AC-7）
- AC-2: canonical と mirror の同一性
- EC-01〜EC-04: エッジケース（dependsOn 不正、kind 空文字、command 空文字、1 phase のみ）
- RC-01〜RC-03: リグレッション（path 削除検出、schemaVersion 変更検出、workflowId 空文字検出）

## 多角的チェック観点

- ALLOWED_TOP_LEVEL_FIELDS（schemaVersion / workflowId / phases / resources / entry / exit）以外のフィールドが混入していないか
- resource の path が相対パスで、manifest ファイルからの相対解決で正しいファイルに到達するか
- phase ↔ resource の双方向参照が対称的に定義されているか
- dependsOn の順序が phases 配列のインデックス順序と整合するか
- entry/exit hook の id が全 phase の entryHookId/exitHookId をカバーしているか
- 命名規則（camelCase）が既存コードベースと一致しているか

## 成果物

| 成果物     | パス                              | 説明                               |
| ---------- | --------------------------------- | ---------------------------------- |
| 要件定義書 | `outputs/phase-1/requirements.md` | 要件抽出・スコープ・検証マトリクス |

## 完了条件

- [ ] ManifestLoader の検証ロジック 12 ステップが全て列挙されている
- [ ] 既存テスト 17 ケースの期待値が分析されている
- [ ] FR-01〜FR-07、NFR-01〜NFR-04 が定義されている
- [ ] スコープ（含む / 含まない）が明確に定義されている
- [ ] P50 チェック（canonical / mirror の現状調査）が実施されている
- [ ] 既存コードの命名規則（camelCase）が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

| SubAgent   | 責務                               |
| ---------- | ---------------------------------- |
| SubAgent-A | ManifestLoader 検証ロジックの精査  |
| SubAgent-B | 既存テスト期待値の分析             |
| SubAgent-C | canonical / mirror 現状調査（P50） |

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 2: 設計
