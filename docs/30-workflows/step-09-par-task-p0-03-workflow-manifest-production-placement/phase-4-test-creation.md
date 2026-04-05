# Phase 4: テスト作成（TDD Red）

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 4                                      |
| タスクID   | TASK-P0-03                             |
| 機能名     | workflow-manifest-production-placement |
| カテゴリ   | 新機能（Spec P0系）                    |
| タスク分類 | NON_VISUAL（UIタスクではない）         |
| 作成日     | 2026-04-04                             |

## 目的

既存テスト `ManifestLoader.production-manifest.test.ts` の全ケース（TC-01〜RC-03、17ケース）を確認し、現行 manifest が期待値と一致するかを検証する。追加テストの必要性を判断し、不足がある場合はテスト設計を行う。

## 実行タスク

### タスク4-1: 既存テスト ManifestLoader.production-manifest.test.ts の全ケース確認

既存テストファイル `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.production-manifest.test.ts` を読み込み、全 17 ケースの内容・期待値・対応 AC を整理する。

### タスク4-2: 既存テストが期待する manifest 構造の整理

テストコードから逆算して、本番 manifest が満たすべき構造要件を一覧化する:

- `workflowId`: `"skill-creator"`
- `schemaVersion`: `1`
- `manifestContentHash`: SHA-256（64文字の hex 文字列）
- `phases`: 5件、順序は `[requirements-gathering, plan, execute, verify, improve]`
- `resources`: 全件の `absolutePath` が実在ファイル、`kind` は `agent|reference|schema|asset`
- `entry`: 1件以上、各 hook に `id` と `command` が存在
- `exit`: 1件以上、各 hook に `id` と `command` が存在
- 全 phase の `entryHookId` が `entry[]` に存在
- 全 phase の `exitHookId` が `exit[]` に存在
- canonical と mirror の内容が完全一致
- `dependsOn`: 最初の phase は undefined、2番目以降は直前の phase に依存

### タスク4-3: テストが RED（失敗）状態であることの確認

manifest が仕様と不一致の場合に RED になることを確認し、現行 manifest が仕様と一致している場合は GREEN であることを記録する。

```bash
pnpm --filter @repo/desktop test ManifestLoader.production-manifest
```

期待結果: manifest が未配置または不正な場合は TC-01 で `loadManifest()` がエラーを投げ、現行 manifest が仕様一致の場合は全ケースが PASS する。

### タスク4-4: 追加テストの必要性判断

既存の 17 ケースが AC-1〜AC-7 を十分にカバーしているか評価する。

## 参照資料

| 資料名                     | パス                                                                                                 | 説明               |
| -------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------ |
| production-manifest テスト | `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.production-manifest.test.ts`        | テスト本体（17件） |
| テストフィクスチャ         | `apps/desktop/src/main/services/runtime/__tests__/fixtures/workflow-manifest/workflow-manifest.json` | 構造リファレンス   |
| Phase 2 設計書             | `outputs/phase-2/design.md`                                                                          | manifest 構造設計  |
| Phase 3 設計レビュー       | `outputs/phase-3/design-review-result.md`                                                            | 設計レビュー結果   |
| 要件定義書                 | `outputs/phase-1/requirements.md`                                                                    | Phase 1 成果物     |

### システム仕様（aiworkflow-requirements）

| 参照対象                     | パス                                                                                        | 要点                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| workflow manifest foundation | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | `WorkflowManifest*` / `LoadedWorkflowManifest` / `ManifestLoader` の read / validate 契約      |
| orchestration boundary       | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`           | `ManifestLoader` は workflow foundation であり state owner ではない                            |
| owner separation             | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | `ManifestLoader` は route/state authority を持たず `SkillCreatorWorkflowEngine` と責務分離する |

## テストケース一覧

### メインテスト（describe: "TASK-P0-03: production workflow-manifest.json"）

| ケースID | テスト内容                                                     | 対応 AC | 期待結果                                                                                  |
| -------- | -------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------- |
| TC-01    | canonical manifest を loadManifest() でエラーなく読み込む      | AC-1,3  | manifest が定義済み、workflowId が `"skill-creator"`、hash が 64文字 hex                  |
| TC-02    | schemaVersion が 1 である                                      | AC-6    | `manifest.schemaVersion === 1`                                                            |
| TC-03    | 全 resource descriptor の path が実在ファイルを指す            | AC-4    | 全 resource の `absolutePath` に対し `fs.access()` が成功                                 |
| TC-04    | phases が 5 phase を含む                                       | AC-5    | phases 配列の長さ 5、ID 順序が `[requirements-gathering, plan, execute, verify, improve]` |
| TC-05    | entry/exit hooks が定義されている                              | AC-7    | entry/exit 各1件以上、全 hook に id と command が存在                                     |
| TC-06    | 全 phase の entryHookId が entry[] に存在する                  | AC-7    | 各 phase の `entryHookId` が `entry[].id` の集合に含まれる                                |
| TC-07    | 全 phase の exitHookId が exit[] に存在する                    | AC-7    | 各 phase の `exitHookId` が `exit[].id` の集合に含まれる                                  |
| AC-2     | canonical と mirror の manifest が同一内容である               | AC-2    | `fs.readFile()` の内容が canonical と mirror で完全一致                                   |
| kind検証 | 全 resource の kind が agent/reference/schema/asset のいずれか | -       | 全 resource.kind が有効値集合 `{agent, reference, schema, asset}` に含まれる              |
| dep検証  | phase の dependsOn が正しい依存順序を形成する                  | AC-5    | 最初の phase は dependsOn が undefined、2番目以降は直前 phase の id を含む                |

### エッジケーステスト（describe: "TASK-P0-03: edge case & regression tests"）

| ケースID | テスト内容                                       | 前提操作                                      | 期待結果                                                 |
| -------- | ------------------------------------------------ | --------------------------------------------- | -------------------------------------------------------- |
| EC-01    | dependsOn に存在しない phase ID を指定すると拒否 | `phases[1].dependsOn = ["nonexistent-phase"]` | `loadManifest()` が `"dependsOn が未定義です"` で reject |
| EC-02    | resource の kind が空文字だと拒否                | `resources[0].kind = ""`                      | `loadManifest()` が reject                               |
| EC-03    | entry hook の command が空文字だと拒否           | `entry[0].command = ""`                       | `loadManifest()` が reject                               |
| EC-04    | phases が 1 つでも検証は通過                     | phases を 1件のみに絞る                       | `loadManifest()` が成功、phases 長さ 1                   |

### リグレッションテスト

| ケースID | テスト内容                         | 前提操作                           | 期待結果                                                            |
| -------- | ---------------------------------- | ---------------------------------- | ------------------------------------------------------------------- |
| RC-01    | resource path のファイル削除を検出 | `agents/analyze-request.md` を削除 | `loadManifest()` が reject                                          |
| RC-02    | schemaVersion 変更を検出           | `schemaVersion = 99`               | `loadManifest()` が `"schemaVersion は 1 のみ受理します"` で reject |
| RC-03    | workflowId が空文字だと拒否        | `workflowId = ""`                  | `loadManifest()` が reject                                          |

## 統合テスト連携

- 本 Phase の確認結果は Phase 5（実装）の入力条件となる
- テスト結果により現行 manifest と期待値の差分を固定し、差分がある場合は Phase 5（実装）へフィードバックする
- エッジケース・リグレッションテストは Phase 6 で詳細確認される
- 既存の `ManifestLoader.test.ts` のテスト群はリグレッション確認用として Phase 6 で実行する

## テストコマンド

```bash
# 本番 manifest テスト（現状確認）
pnpm --filter @repo/desktop test ManifestLoader.production-manifest

# 既存テスト（リグレッション確認用）
pnpm --filter @repo/desktop test ManifestLoader

# 型チェック
pnpm --filter @repo/desktop typecheck

# Lint
pnpm --filter @repo/desktop lint
```

## 多角的チェック観点

- 既存 17 ケースが AC-1〜AC-7 の全てを網羅しているか
- エッジケーステスト（EC-01〜EC-04）が ManifestLoader の主要な検証パスを十分にカバーしているか
- リグレッションテスト（RC-01〜RC-03）が manifest 破損パターンを検出できるか
- テストが本番 manifest の配置パスに正しくアクセスしているか（相対パスの解決）
- テスト間で ManifestLoader のインスタンスが独立しており、状態汚染がないか

## 成果物

| 成果物       | パス                           | 説明                                   |
| ------------ | ------------------------------ | -------------------------------------- |
| テスト計画書 | `outputs/phase-4/test-plan.md` | テストケース確認・追加テスト判断の記録 |

## 完了条件

- [ ] 既存テスト ManifestLoader.production-manifest.test.ts の全 17 ケースの内容が確認されている
- [ ] 各テストケースの期待値と対応 AC が整理されている
- [ ] テストが期待する manifest 構造が一覧化されている
- [ ] テスト結果が現行 manifest の状態と整合していることが確認されている（未配置なら RED、整合済みなら GREEN）
- [ ] 追加テストの必要性が判断され、結論が記録されている（既存テストが十分な場合は「追加不要」と記録）
- [ ] テスト計画書が `outputs/phase-4/test-plan.md` に出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

| SubAgent   | 責務                                   |
| ---------- | -------------------------------------- |
| SubAgent-A | 既存テスト 17 ケースの確認・期待値整理 |
| SubAgent-B | テスト状態確認・追加テスト必要性判断   |

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 5: 実装（TDD Green）
