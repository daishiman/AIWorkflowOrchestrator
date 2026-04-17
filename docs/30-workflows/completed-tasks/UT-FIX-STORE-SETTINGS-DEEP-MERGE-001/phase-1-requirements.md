# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 1                                            |
| タスクID   | UT-FIX-STORE-SETTINGS-DEEP-MERGE-001         |
| 機能名     | store-settings-deep-merge                    |
| タスク名   | settings:update ハンドラのディープマージ対応 |
| 前提Phase  | -                                            |
| 後続Phase  | Phase 2                                      |
| 作成日     | 2026-04-16                                   |
| ステータス | pending                                      |

## 目的

`settings:update` IPCハンドラをディープマージ対応にするための要件境界を固定する。
現在のシャローマージ実装が将来のネスト設定追加時にデータ消失バグを引き起こすリスクを特定し、
受け入れ基準（AC-1〜AC-5）を検証可能な形で定義する。

## 背景

### 問題の概要

`UT-FIX-IPC-MAIN-HANDLER-IMPL-001` で実装された `settings:update` IPCハンドラは、
現在シャローマージ（`{ ...currentSettings, ...payload }`）のみ対応している。

```typescript
// 現在の実装（storeHandlers.ts）
const currentSettings = store.get("userSettings") ?? {};
const updated = { ...currentSettings, ...payload }; // シャローマージのみ
store.set("userSettings", updated);
```

### シャローマージの問題点

ネストされた設定オブジェクトを部分更新すると、同じ親キー配下の他フィールドが消失する。

```typescript
// 現在の設定状態
currentSettings = { theme: { color: "dark", size: "medium" }, lang: "ja" };

// 部分更新（color のみ変更したい）
updatePayload = { theme: { color: "light" } };

// シャローマージ結果（意図と異なる）
result = { theme: { color: "light" }, lang: "ja" };
// theme.size が消える！

// 期待する結果（ディープマージ）
expected = { theme: { color: "light", size: "medium" }, lang: "ja" };
```

### 現時点のリスク評価

現時点では `UserSettings` にネスト構造がないため実害なし。
ただし将来ネストされた設定項目（通知設定、テーマ設定等）が追加されると、
データ消失バグの原因になる。発見元: `UT-FIX-IPC-MAIN-HANDLER-IMPL-001` Phase 12 スキルFBレポート。

## SubAgentチーム編成

| SubAgent   | 担当責務                  | 主な作業内容                                                                          |
| ---------- | ------------------------- | ------------------------------------------------------------------------------------- |
| SubAgent-A | storeHandlers.ts 責務分析 | 現在の `settings:update` 実装の詳細確認、シャローマージ箇所の特定、変更影響範囲の調査 |
| SubAgent-B | テスト戦略策定            | 既存テストケースの確認、ネストオブジェクト部分更新パターンのテスト設計                |
| SubAgent-C | 型安全性・設計方針        | `UserSettings` 型の現状確認、ディープマージ関数の型定義方針、配列・null 扱いの設計    |
| SubAgent-D | 統合監査・AC定義          | IPC契約との整合確認、受け入れ基準（AC-1〜AC-5）の定義、レグレッションリスク評価       |

## 実行タスク

- [ ] **現状調査**: `storeHandlers.ts` の現在実装を確認し、シャローマージの具体的な問題箇所を記録する
- [ ] **aiworkflow仕様抽出**: IPCハンドラ実装パターンに関する仕様（IPC契約チェックリスト、エラーハンドリング基準）を抽出する
- [ ] **型定義確認**: `UserSettings` 型の現状を確認し、ネスト構造の有無・将来の拡張方針を把握する
- [ ] **受け入れ基準化**: AC-1〜AC-5 を検証可能な形で固定する
  - AC-1: ネストオブジェクトの部分更新で同一親キー配下の他フィールドが保持される
  - AC-2: 既存テストがすべてPASS
  - AC-3: ネストオブジェクト部分更新のテストケースが追加されている
  - AC-4: `any` 型を使用しない型安全な実装
  - AC-5: 配列フィールドは上書き（ディープマージの対象外）

## 参照資料

### 実装・コード

| 資料名                 | パス                                                                                                           | 用途                             |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| storeHandlers.ts       | `apps/desktop/src/main/ipc/storeHandlers.ts`                                                                   | 対象実装ファイル・問題箇所確認   |
| storeHandlers.test.ts  | `apps/desktop/src/main/ipc/storeHandlers.test.ts`                                                              | 既存テスト構造・追加先確認       |
| channels.ts（preload） | `apps/desktop/src/preload/channels.ts`                                                                         | `settings:update` IPC契約確認    |
| electronStore 型定義   | `apps/desktop/src/main/store/` 配下                                                                            | `UserSettings` 型の現状確認      |
| タスク指示書           | `docs/30-workflows/unassigned-task/task-store-settings-deep-merge.md`                                          | 既存指示書（背景・推奨実装方針） |
| 発見元レポート         | `docs/30-workflows/completed-tasks/UT-FIX-IPC-MAIN-HANDLER-IMPL-001/outputs/phase-12/skill-feedback-report.md` | 問題発見経緯の確認               |

### システム仕様（aiworkflow-requirements）

| 資料名                 | 参照キーワード                                   | 用途                                  |
| ---------------------- | ------------------------------------------------ | ------------------------------------- |
| IPC契約チェックリスト  | `ipc-contract`, `allowed-channels`, `settings`   | `settings:update` のIPC契約と整合確認 |
| エラーハンドリング基準 | `error-handling`, `ipc-handler`, `safeInvoke`    | ハンドラのエラー処理パターン確認      |
| 品質要件               | `quality`, `type-safety`, `any-type`             | `any` 型禁止・型安全性要件の確認      |
| タスク運用ガイド       | `task-workflow`, `improvement`, `small-scale`    | 小規模改善タスクの運用方針確認        |
| 教訓・パターン         | `lessons-learned`, `shallow-merge`, `deep-merge` | 類似問題の過去教訓確認                |
| リソースマップ         | `resource-map`                                   | 関連仕様ファイルの索引確認            |

## 実行手順

### 1. P50チェック: 既実装状態の調査（必須）

```bash
# storeHandlers.ts の settings:update ハンドラを確認
grep -n -A 20 "settings:update\|settings.*update\|USER_SETTINGS_UPDATE" \
  apps/desktop/src/main/ipc/storeHandlers.ts

# シャローマージの実装箇所を特定
grep -n "spread\|\.\.\." apps/desktop/src/main/ipc/storeHandlers.ts

# 既存テストの確認
grep -n "settings.*update\|update.*settings" \
  apps/desktop/src/main/ipc/storeHandlers.test.ts

# UserSettings 型定義の確認
grep -rn "UserSettings\|userSettings" apps/desktop/src/main/ --include="*.ts" | head -20
```

### 2. aiworkflow-requirements 仕様抽出

IPCハンドラ実装パターン、エラーハンドリング基準、型安全性要件を
`references/` 配下から抽出し、本タスクへの適用方針を確認する。

### 3. 問題点の整理

| 問題           | 詳細                                                                           |
| -------------- | ------------------------------------------------------------------------------ |
| シャローマージ | `{ ...current, ...payload }` ではネスト構造の部分更新で他フィールドが消失する  |
| 型制約         | `UserSettings` が `Record<string, unknown>` のため、ネスト構造が実行時まで不明 |
| テスト不足     | ネストオブジェクト部分更新パターンのテストケースが存在しない                   |

### 4. 受け入れ基準の固定

| ID   | 受け入れ基準                                                                       | 検証方法                                                                                                                |
| ---- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| AC-1 | ネストされた設定オブジェクトの部分更新で、同じ親キー配下の他フィールドが保持される | テスト: `{ theme: { color, size } }` に `{ theme: { color } }` を更新した際に `size` が保持されることを検証             |
| AC-2 | 既存テストがすべてPASS                                                             | `pnpm --filter @repo/desktop test:run -- apps/desktop/src/main/ipc/storeHandlers.test.ts` が全件PASS                    |
| AC-3 | ネストオブジェクト部分更新のテストケースが追加されている                           | `storeHandlers.test.ts` にネスト更新テスト（最低3ケース: 部分更新・トップレベル上書き・配列上書き）が追加されていること |
| AC-4 | `any` 型を使用しない型安全な実装                                                   | `pnpm --filter @repo/desktop typecheck` でエラーなし                                                                    |
| AC-5 | 配列フィールドは上書き動作（ディープマージ非対象）                                 | テスト: 配列フィールドを含む更新で、配列が結合されず上書きされることを検証                                              |

## 統合テスト連携

| 判定項目               | 基準 | 結果    |
| ---------------------- | ---- | ------- |
| ユニットテストLine     | 80%+ | pending |
| ユニットテストBranch   | 60%+ | pending |
| ユニットテストFunction | 80%+ | pending |

## 多角的チェック観点（20思考法）

| No. | 観点               | チェック内容                                                                                             |
| --- | ------------------ | -------------------------------------------------------------------------------------------------------- |
| 1   | 後方互換性         | 既存のシャローマージ動作（トップレベルキー更新）がディープマージ後も同一結果を返すか                     |
| 2   | 型安全性           | `deepMerge<T extends Record<string, unknown>>` 型が TypeScript strict モードで正常動作するか             |
| 3   | 配列扱い           | 配列フィールドがマージされず上書きされる仕様が明示されているか                                           |
| 4   | null 扱い          | `null` 値が上書き扱いになること、`undefined` は省略扱いになることが仕様に明記されているか                |
| 5   | 再帰深度           | 深くネストされたオブジェクトでスタックオーバーフローが起きないか（実用的な深度制限の検討）               |
| 6   | パフォーマンス     | 設定オブジェクトは小規模なため、再帰マージのパフォーマンス影響は実質ゼロと判断できるか                   |
| 7   | IPC契約整合        | `settings:update` の引数・戻り値のIPC契約が変更前後で同一か                                              |
| 8   | 依存タスク整合     | `UT-FIX-IPC-MAIN-HANDLER-IMPL-001` で実装されたハンドラ構造との整合が保たれるか                          |
| 9   | ライブラリ依存     | `lodash.merge` 等の外部ライブラリ依存を追加するか、インライン実装にするかの方針が決定されているか        |
| 10  | テスト網羅性       | ネスト3階層・配列・null・undefinedの各パターンがテストでカバーされているか                               |
| 11  | エラーハンドリング | ディープマージ処理自体の例外（循環参照等）に対するハンドリング方針が定義されているか                     |
| 12  | コード配置         | `deepMerge` 関数を `storeHandlers.ts` 内に置くか、共有ユーティリティに切り出すかの方針が決定されているか |
| 13  | 命名一貫性         | `deepMerge` という関数名がプロジェクト内の既存命名規則と整合するか                                       |
| 14  | 将来の拡張性       | `UserSettings` にさらに深いネスト構造が追加されても対応できる汎用実装になっているか                      |
| 15  | CI/CD影響          | 既存のCIパイプライン（verify-ipc-4layer.cjs等）への影響がないか                                          |
| 16  | セキュリティ       | ペイロードに予期しないキーが含まれた場合の挙動（プロトタイプ汚染等のリスク）が確認されているか           |
| 17  | ドキュメント       | Phase 12でディープマージ仕様（配列扱い・null扱い）がシステム仕様書に反映されるか                         |
| 18  | レグレッション     | `settings:get` ハンドラとの連動（get→更新→get で期待値が返るか）の確認計画があるか                       |
| 19  | Issue整合          | Issue #2197（クローズド済み）の要件と本実装仕様が一致しているか                                          |
| 20  | 教訓反映           | 「設計フェーズでシャロー/ディープを明示的に決定すること」の教訓がPhase 12で記録されるか                  |

## 成果物

| 成果物                             | パス                                                         | 説明                                 |
| ---------------------------------- | ------------------------------------------------------------ | ------------------------------------ |
| 要件定義書                         | `outputs/phase-1/requirements-definition.md`                 | 機能要件・非機能要件・スコープ定義   |
| 受け入れ基準                       | `outputs/phase-1/acceptance-criteria.md`                     | AC-1〜AC-5の検証可能な定義           |
| aiworkflow-requirements 抽出       | `outputs/phase-1/aiworkflow-requirements-extraction.md`      | IPC契約・品質要件・教訓の抽出結果    |
| ブランチ差分カバレッジ             | `outputs/phase-1/branch-diff-coverage.md`                    | 変更対象ファイルとテスト対象の対応表 |
| 実装仕様トレーサビリティマトリクス | `outputs/phase-1/implementation-spec-traceability-matrix.md` | AC → 実装箇所 → テストケースの対応表 |

## 完了条件

- [ ] P50チェック実施済み（`storeHandlers.ts` のシャローマージ箇所を特定済み）
- [ ] `UserSettings` 型定義（現状・ネスト構造の有無）を確認済み
- [ ] 既存テストケースの内容を確認済み
- [ ] 問題点（シャローマージ・型制約・テスト不足）を整理済み
- [ ] AC-1〜AC-5 が検証可能な形で定義されている
- [ ] ディープマージ設計方針（配列・null・undefined扱い）が決定されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 2: 設計
