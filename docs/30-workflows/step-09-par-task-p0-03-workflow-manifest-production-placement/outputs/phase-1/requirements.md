# Phase 1: 要件定義書 — TASK-P0-03

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 1                                      |
| タスクID | TASK-P0-03                             |
| 機能名   | workflow-manifest-production-placement |
| 実行日   | 2026-04-04                             |

## P50 チェック（現状調査結果）

| 調査対象                | 結果                                                       |
| ----------------------- | ---------------------------------------------------------- |
| canonical パス          | `.claude/skills/skill-creator/workflow-manifest.json` 存在 |
| mirror パス             | `.agents/skills/skill-creator/workflow-manifest.json` 存在 |
| canonical/mirror 同一性 | byte-for-byte 同一（diff 差分なし）                        |
| ManifestLoader 検証通過 | 既存 manifest で loadManifest() 成功見込み                 |
| resource path 実在      | 全 7 resource が skill-creator 配下に存在                  |

## ManifestLoader 検証ロジック（12ステップ）

| ステップ | 関数名                          | 検証内容                                                  |
| -------- | ------------------------------- | --------------------------------------------------------- |
| 1        | isRecord()                      | 値が Record であることを確認                              |
| 2        | isNonEmptyString()              | 値が非空文字列であることを確認                            |
| 3        | uniqueStrings()                 | 配列内の文字列が一意であることを確認                      |
| 4        | ensureUniqueArrayValues()       | 配列値の一意性を保証                                      |
| 5        | ensureTopLevelFields()          | ALLOWED_TOP_LEVEL_FIELDS のみ許可                         |
| 6        | validateHooks()                 | entry/exit hook の id/command 存在・一意性                |
| 7        | validateResources()             | resource の id/kind/path 存在・kind 値の妥当性            |
| 8        | validatePhases()                | phase の id/title/entryHookId/exitHookId/resourceIds 存在 |
| 9        | assertPhaseReferences()         | dependsOn/entryHookId/exitHookId/resourceIds の参照整合   |
| 10       | assertResourcePhaseReferences() | phase ↔ resource の双方向参照の対称性                     |
| 11       | buildResourceDescriptorHash()   | リソース記述子の SHA-256 ハッシュ生成                     |
| 12       | buildManifestContentHash()      | manifest 全体の SHA-256 ハッシュ生成                      |

### 定数値

- `ALLOWED_TOP_LEVEL_FIELDS`: `{schemaVersion, workflowId, phases, resources, entry, exit}`
- `WORKFLOW_MANIFEST_SCHEMA_VERSION`: `1`（`packages/shared/src/types/skillCreator.ts` line 279）

## 既存テスト 17 ケースの期待値分析

### メインテスト（TC-01〜TC-07 + AC-2 + 追加2件）

| ケースID  | テスト内容                         | 期待値                                                   | 対応 AC |
| --------- | ---------------------------------- | -------------------------------------------------------- | ------- |
| TC-01     | canonical manifest の loadManifest | workflowId === "skill-creator", hash は 64 文字 hex      | AC-1,3  |
| TC-02     | schemaVersion                      | manifest.schemaVersion === 1                             | AC-6    |
| TC-03     | 全 resource absolutePath 実在      | fs.access() 成功                                         | AC-4    |
| TC-04     | phases 5 件・順序                  | [requirements-gathering, plan, execute, verify, improve] | AC-5    |
| TC-05     | entry/exit hooks 定義あり          | entry/exit 各 1 件以上、全 hook に id/command            | AC-7    |
| TC-06     | entryHookId → entry[] 参照         | 全 phase.entryHookId ∈ entry[].id                        | AC-7    |
| TC-07     | exitHookId → exit[] 参照           | 全 phase.exitHookId ∈ exit[].id                          | AC-7    |
| AC-2      | canonical/mirror 同一性            | readFile 内容完全一致                                    | AC-2    |
| kind 検証 | 全 resource.kind が有効値          | kind ∈ {agent, reference, schema, asset}                 | -       |
| dep 検証  | dependsOn 正しい依存順序           | 最初の phase は undefined、以降は直前 phase に依存       | AC-5    |

### エッジケース・リグレッション（EC-01〜EC-04, RC-01〜RC-03）

| ケースID | テスト内容                 | 期待結果                          |
| -------- | -------------------------- | --------------------------------- |
| EC-01    | dependsOn に存在しない ID  | reject: "dependsOn が未定義です"  |
| EC-02    | kind 空文字                | reject                            |
| EC-03    | command 空文字             | reject                            |
| EC-04    | 1 phase のみ               | 成功（phases.length === 1）       |
| RC-01    | resource path ファイル削除 | reject（path 実在チェック失敗）   |
| RC-02    | schemaVersion = 99         | reject: "schemaVersion は 1 のみ" |
| RC-03    | workflowId 空文字          | reject                            |

## 機能要件（FR）

| 要件ID | AC   | 要件                                                                                     |
| ------ | ---- | ---------------------------------------------------------------------------------------- |
| FR-01  | AC-1 | `.claude/skills/skill-creator/workflow-manifest.json` が存在する                         |
| FR-02  | AC-2 | `.agents/skills/skill-creator/workflow-manifest.json` が存在し canonical と同一内容      |
| FR-03  | AC-3 | `ManifestLoader.loadManifest(canonicalManifestPath)` がエラーなく完了する                |
| FR-04  | AC-4 | 全 resource の absolutePath が実在ファイルを指す                                         |
| FR-05  | AC-5 | phases が 5 件（requirements-gathering, plan, execute, verify, improve）をこの順序で含む |
| FR-06  | AC-6 | schemaVersion が 1 である                                                                |
| FR-07  | AC-7 | 全 phase の entryHookId/exitHookId が entry[]/exit[] に存在する                          |

## 非機能要件（NFR）

| 要件ID | 要件                                                                |
| ------ | ------------------------------------------------------------------- |
| NFR-01 | `ManifestLoader.production-manifest.test.ts` の全テストが PASS する |
| NFR-02 | `pnpm --filter @repo/desktop typecheck` がエラーなしで完了する      |
| NFR-03 | `pnpm --filter @repo/desktop lint` がエラーなしで完了する           |
| NFR-04 | manifest JSON の命名規則が既存コードベース（camelCase）に準拠する   |

## スコープ

### 含む

- `workflow-manifest.json` の構造確認と canonical パスへの配置
- mirror パスへの同一内容の配置
- 5 フェーズ定義（requirements-gathering, plan, execute, verify, improve）
- resource descriptor（agent x3, reference x2, schema x2）の定義
- entry / exit hook の定義
- phase ↔ resource の双方向参照

### 含まない

- ManifestLoader.ts のコード変更
- P0-04（ManifestLoader デフォルト有効化）以降の実装
- skill-creator ディレクトリ内のファイル新規作成・変更
- P0-07 / P0-09 の実装

## 命名規則確認

既存コードベースの命名規則: **camelCase**

- `schemaVersion`, `workflowId`, `entryHookId`, `exitHookId`, `resourceIds`, `phaseIds`, `dependsOn`
- manifest 内の全フィールドが camelCase に準拠していることを確認済み

## 完了確認

- [x] ManifestLoader の検証ロジック 12 ステップが全て列挙されている
- [x] 既存テスト 17 ケースの期待値が分析されている
- [x] FR-01〜FR-07、NFR-01〜NFR-04 が定義されている
- [x] スコープ（含む / 含まない）が明確に定義されている
- [x] P50 チェック（canonical / mirror の現状調査）が実施されている
- [x] 既存コードの命名規則（camelCase）が確認されている
- [x] 本 Phase 内の全タスクを 100% 実行完了
