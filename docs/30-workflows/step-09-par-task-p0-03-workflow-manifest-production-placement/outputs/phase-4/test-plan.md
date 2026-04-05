# Phase 4: テスト計画書 — TASK-P0-03

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 4                                      |
| タスクID | TASK-P0-03                             |
| 機能名   | workflow-manifest-production-placement |
| 実行日   | 2026-04-04                             |

## タスク4-1: 既存テスト全ケース確認

ファイル: `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.production-manifest.test.ts`

### メインテスト（10 ケース）

| ケースID  | テスト内容                                                     | 対応 AC | 期待結果                                                                                |
| --------- | -------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------- |
| TC-01     | canonical manifest を loadManifest() でエラーなく読み込む      | AC-1,3  | manifest 定義済み、workflowId が "skill-creator"、hash が 64 文字 hex                   |
| TC-02     | schemaVersion が 1 である                                      | AC-6    | manifest.schemaVersion === 1                                                            |
| TC-03     | 全 resource descriptor の path が実在ファイルを指す            | AC-4    | 全 resource の absolutePath に対し fs.access() が成功                                   |
| TC-04     | phases が 5 phase を含む                                       | AC-5    | phases 配列の長さ 5、ID 順序が [requirements-gathering, plan, execute, verify, improve] |
| TC-05     | entry/exit hooks が定義されている                              | AC-7    | entry/exit 各 1 件以上、全 hook に id と command が存在                                 |
| TC-06     | 全 phase の entryHookId が entry[] に存在する                  | AC-7    | 各 phase の entryHookId が entry[].id の集合に含まれる                                  |
| TC-07     | 全 phase の exitHookId が exit[] に存在する                    | AC-7    | 各 phase の exitHookId が exit[].id の集合に含まれる                                    |
| AC-2      | canonical と mirror の manifest が同一内容である               | AC-2    | fs.readFile() の内容が canonical と mirror で完全一致                                   |
| kind 検証 | 全 resource の kind が agent/reference/schema/asset のいずれか | -       | 全 resource.kind が有効値集合 {agent, reference, schema, asset} に含まれる              |
| dep 検証  | phase の dependsOn が正しい依存順序を形成する                  | AC-5    | 最初の phase は dependsOn が undefined、2 番目以降は直前 phase の id を含む             |

### エッジケーステスト（4 ケース）

| ケースID | テスト内容                                       | 期待結果                                             |
| -------- | ------------------------------------------------ | ---------------------------------------------------- |
| EC-01    | dependsOn に存在しない phase ID を指定すると拒否 | loadManifest() が "dependsOn が未定義です" で reject |
| EC-02    | resource の kind が空文字だと拒否                | loadManifest() が reject                             |
| EC-03    | entry hook の command が空文字だと拒否           | loadManifest() が reject                             |
| EC-04    | phases が 1 つでも検証は通過                     | loadManifest() が成功、phases 長さ 1                 |

### リグレッションテスト（3 ケース）

| ケースID | テスト内容                         | 期待結果                                                        |
| -------- | ---------------------------------- | --------------------------------------------------------------- |
| RC-01    | resource path のファイル削除を検出 | loadManifest() が reject                                        |
| RC-02    | schemaVersion 変更を検出           | loadManifest() が "schemaVersion は 1 のみ受理します" で reject |
| RC-03    | workflowId が空文字だと拒否        | loadManifest() が reject                                        |

## タスク4-2: manifest 構造要件

テストコードから逆算した本番 manifest の構造要件:

- workflowId: "skill-creator"
- schemaVersion: 1
- manifestContentHash: SHA-256（64 文字の hex 文字列）
- phases: 5 件、順序は [requirements-gathering, plan, execute, verify, improve]
- resources: 全件の absolutePath が実在ファイル、kind は agent|reference|schema|asset
- entry: 1 件以上、各 hook に id と command
- exit: 1 件以上、各 hook に id と command
- canonical と mirror の内容が完全一致
- dependsOn: 最初の phase は undefined、2 番目以降は直前の phase に依存

## タスク4-3: テスト実行結果

```
pnpm --filter @repo/desktop test ManifestLoader.production-manifest --run

Test Files  1 passed (1)
     Tests  17 passed (17)
```

**現行 manifest は仕様と一致しており GREEN 状態**

## タスク4-4: 追加テストの必要性判断

| 観点                          | カバー状況                     | 判断 |
| ----------------------------- | ------------------------------ | ---- |
| AC-1: canonical manifest 配置 | TC-01 でカバー                 | 十分 |
| AC-2: mirror 同一性           | AC-2 テストでカバー            | 十分 |
| AC-3: ManifestLoader 読込成功 | TC-01 でカバー                 | 十分 |
| AC-4: resource 実在           | TC-03 でカバー                 | 十分 |
| AC-5: 5 フェーズ順序          | TC-04 + dep 検証でカバー       | 十分 |
| AC-6: schemaVersion=1         | TC-02 + RC-02 でカバー         | 十分 |
| AC-7: hook 整合               | TC-05 + TC-06 + TC-07 でカバー | 十分 |

**結論: 既存 17 ケースで AC-1〜AC-7 を十分にカバーしている。追加テスト不要。**

## 完了確認

- [x] 既存テスト全 17 ケースの内容が確認されている
- [x] 各テストケースの期待値と対応 AC が整理されている
- [x] テストが期待する manifest 構造が一覧化されている
- [x] テスト結果が GREEN であることが確認されている
- [x] 追加テストの必要性が判断され「追加不要」と記録されている
- [x] 本 Phase 内の全タスクを 100% 実行完了
