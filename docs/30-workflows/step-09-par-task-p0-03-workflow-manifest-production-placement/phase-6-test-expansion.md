# Phase 6: テスト拡充

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 6                                      |
| タスクID   | TASK-P0-03                             |
| 機能名     | workflow-manifest-production-placement |
| カテゴリ   | 新機能（Spec P0系）                    |
| タスク分類 | NON_VISUAL（UIタスクではない）         |
| 作成日     | 2026-04-04                             |

## 目的

Phase 5 で配置した本番 manifest に対し、エッジケーステスト（EC-01〜EC-04）とリグレッションテスト（RC-01〜RC-03）が全て PASS することを確認する。既存の `ManifestLoader.test.ts` のテスト群でリグレッションがないことを検証し、不足するテストケースがあれば追加設計を行う。

## 実行タスク

### タスク6-1: エッジケーステスト（EC-01〜EC-04）の確認

本番 manifest をベースにした一時コピーを改変し、ManifestLoader が不正な入力を正しく拒否することを確認する。

テスト実行:

```bash
pnpm --filter @repo/desktop test ManifestLoader.production-manifest
```

エッジケーステスト結果の確認ポイント:

- EC-01〜EC-03: `loadManifest()` が reject すること（不正入力の拒否）
- EC-04: `loadManifest()` が resolve すること（最小構成の受理）

### タスク6-2: リグレッションテスト（RC-01〜RC-03）の確認

本番 manifest をベースにした一時コピーを破壊的に変更し、ManifestLoader がデータ破損を正しく検出することを確認する。

リグレッションテスト結果の確認ポイント:

- RC-01: ファイル削除による resource path の破損検出
- RC-02: schemaVersion 変更の検出
- RC-03: workflowId 空文字化の検出

### タスク6-3: ManifestLoader.test.ts の既存テスト全 PASS 確認

```bash
pnpm --filter @repo/desktop test ManifestLoader
```

期待結果: `ManifestLoader.test.ts` と `ManifestLoader.production-manifest.test.ts` の両方が全 PASS

### タスク6-4: 不足テストケースの判断

既存の 17 ケース（メイン 10 + エッジ 4 + リグレッション 3 ※ describe 内の実テスト数）が以下の観点を十分にカバーしているか評価する:

| 観点                          | カバー状況                     | 判断 |
| ----------------------------- | ------------------------------ | ---- |
| AC-1: canonical manifest 配置 | TC-01 でカバー                 | 十分 |
| AC-2: mirror 同一性           | AC-2 テストでカバー            | 十分 |
| AC-3: ManifestLoader 読込成功 | TC-01 でカバー                 | 十分 |
| AC-4: resource 実在           | TC-03 でカバー                 | 十分 |
| AC-5: 5フェーズ順序           | TC-04 + dep検証でカバー        | 十分 |
| AC-6: schemaVersion=1         | TC-02 + RC-02 でカバー         | 十分 |
| AC-7: hook 整合               | TC-05 + TC-06 + TC-07 でカバー | 十分 |
| エッジ: 不正 dependsOn        | EC-01 でカバー                 | 十分 |
| エッジ: 空 kind               | EC-02 でカバー                 | 十分 |
| エッジ: 空 command            | EC-03 でカバー                 | 十分 |
| エッジ: 最小構成              | EC-04 でカバー                 | 十分 |
| リグレッション: path 削除     | RC-01 でカバー                 | 十分 |
| リグレッション: schema 変更   | RC-02 でカバー                 | 十分 |
| リグレッション: workflowId 空 | RC-03 でカバー                 | 十分 |

既存テストが十分な場合は「追加不要」と記録する。不足がある場合は追加テスト設計を行う。

## エッジケーステスト一覧

| ケースID | テスト内容                                       | 改変操作                                      | 期待結果                                                 |
| -------- | ------------------------------------------------ | --------------------------------------------- | -------------------------------------------------------- |
| EC-01    | dependsOn に存在しない phase ID を指定すると拒否 | `phases[1].dependsOn = ["nonexistent-phase"]` | `loadManifest()` が `"dependsOn が未定義です"` で reject |
| EC-02    | resource の kind が空文字だと拒否                | `resources[0].kind = ""`                      | `loadManifest()` が reject                               |
| EC-03    | entry hook の command が空文字だと拒否           | `entry[0].command = ""`                       | `loadManifest()` が reject                               |
| EC-04    | phases が 1 つでも検証は通過                     | phases を最初の 1 件のみに絞る                | `loadManifest()` が成功、`manifest.phases.length === 1`  |

### EC テストの前提

- 本番 canonical manifest の一時コピーを `os.tmpdir()` に作成
- コピーに対して改変を加えた上で `loadManifest()` を実行
- テスト終了後に `afterEach` で一時ディレクトリを削除（クリーンアップ）

## リグレッションテスト一覧

| ケースID | テスト内容                         | 破壊操作                                         | 期待結果                                                            |
| -------- | ---------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------- |
| RC-01    | resource path のファイル削除を検出 | `agents/analyze-request.md` を一時コピーから削除 | `loadManifest()` が reject（resource path 実在チェック失敗）        |
| RC-02    | schemaVersion 変更を検出           | `schemaVersion` を `99` に変更                   | `loadManifest()` が `"schemaVersion は 1 のみ受理します"` で reject |
| RC-03    | workflowId が空文字だと拒否        | `workflowId` を `""` に変更                      | `loadManifest()` が reject                                          |

### RC テストの前提

- EC テストと同様に一時コピーを使用
- 破壊操作は一時コピーにのみ適用（本番 manifest は影響なし）

## 参照資料

| 資料名                     | パス                                                                                          | 説明                    |
| -------------------------- | --------------------------------------------------------------------------------------------- | ----------------------- |
| production-manifest テスト | `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.production-manifest.test.ts` | テスト本体（EC/RC含む） |
| ManifestLoader テスト      | `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.test.ts`                     | 既存テスト群            |
| Phase 4 テスト計画         | `outputs/phase-4/test-plan.md`                                                                | テストケース確認結果    |
| Phase 5 実装計画           | `outputs/phase-5/implementation-plan.md`                                                      | 実装結果                |
| ManifestLoader             | `apps/desktop/src/main/services/runtime/ManifestLoader.ts`                                    | 検証ロジック本体        |

## テストコマンド

```bash
# 本番 manifest テスト（エッジケース・リグレッション含む）
pnpm --filter @repo/desktop test ManifestLoader.production-manifest

# 既存テスト（リグレッション確認）
pnpm --filter @repo/desktop test ManifestLoader

# 型チェック
pnpm --filter @repo/desktop typecheck

# Lint
pnpm --filter @repo/desktop lint
```

## 統合テスト連携

- Phase 5 の GREEN 状態が維持されていることを前提とする
- `ManifestLoader.production-manifest.test.ts` のエッジケース・リグレッションテストは、本番 manifest の一時コピーを改変して実行するため、本番 manifest 自体に影響を与えない
- `ManifestLoader.test.ts` の既存テスト群が全 PASS であれば、ManifestLoader の既存機能にリグレッションがないことが保証される
- テスト拡充の結果は Phase 7 以降（コードレビュー等）の品質ゲートとなる

## 多角的チェック観点

- エッジケーステスト（EC-01〜EC-04）が ManifestLoader の検証パスを網羅的にテストしているか
- リグレッションテスト（RC-01〜RC-03）が想定される manifest 破損パターンをカバーしているか
- 一時コピーの作成と `afterEach` によるクリーンアップが手順どおりに実行され、テスト間の独立性が保たれているか
- `ManifestLoader.test.ts` の既存テストと `ManifestLoader.production-manifest.test.ts` の新規テストに重複や矛盾がないか
- 追加テストの判断基準が明確で、根拠が記録されているか

## 成果物

| 成果物           | パス                                | 説明                                 |
| ---------------- | ----------------------------------- | ------------------------------------ |
| テスト拡充結果書 | `outputs/phase-6/test-expansion.md` | テスト確認結果・追加テスト判断の記録 |

## 完了条件

- [ ] エッジケーステスト（EC-01〜EC-04）が全て PASS していることが確認されている
- [ ] リグレッションテスト（RC-01〜RC-03）が全て PASS していることが確認されている
- [ ] `ManifestLoader.test.ts` の既存テスト群が全 PASS（リグレッションなし）
- [ ] `ManifestLoader.production-manifest.test.ts` の全テストが PASS
- [ ] 不足するテストケースの有無が判断され、結論が記録されている
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm --filter @repo/desktop lint` がエラーなし
- [ ] テスト拡充結果書が `outputs/phase-6/test-expansion.md` に出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

| SubAgent   | 責務                                             |
| ---------- | ------------------------------------------------ |
| SubAgent-A | エッジケーステスト確認・結果記録                 |
| SubAgent-B | リグレッションテスト確認・既存テスト全 PASS 確認 |
| SubAgent-C | 追加テスト判断・テスト拡充結果書の作成           |

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 7: コードレビュー
