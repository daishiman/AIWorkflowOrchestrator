# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 3                                            |
| タスクID   | UT-FIX-STORE-SETTINGS-DEEP-MERGE-001         |
| 機能名     | settings-deep-merge                          |
| タスク名   | settings:update ハンドラのディープマージ対応 |
| 前提Phase  | Phase 2                                      |
| 後続Phase  | Phase 4（PASS または MINOR の場合）          |
| 作成日     | 2026-04-16                                   |
| ステータス | pending                                      |

## 目的

Phase 2 の設計内容（deepMerge アーキテクチャ・IPC 契約・テスト戦略）を多角的にレビューし、
Phase 4（テスト作成）への進行可否を判定する。
PASS / MINOR / MAJOR のいずれかを決定し、MINOR の場合は追跡テーブルに記録する。

## 背景

`settings:update` IPC ハンドラのシャローマージ問題に対して、Phase 2 で設計した
`deepMerge` 関数（`storeHandlers.ts` 内プライベート関数）の設計が正確か、
IPC 契約・型安全性・後方互換性・マージルールに矛盾・漏れ・不整合がないかを検証する。

## SubAgentチーム編成

| SubAgent | 担当         | 責務                                                     |
| -------- | ------------ | -------------------------------------------------------- |
| A        | 設計レビュー | Phase 2 成果物の設計一貫性・AC 整合・命名規則を検証する  |
| B        | 矛盾チェック | deepMerge 設計と IPC 契約・型安全性の整合を確認する      |
| C        | ゲート判定   | PASS/MINOR/MAJOR を決定し、理由を記録する                |
| D        | 統合監査     | 後方互換性・リスク評価・Phase 4 開始条件の最終確認を行う |

## ゲート判定基準

| 判定  | 条件                                                         |
| ----- | ------------------------------------------------------------ |
| PASS  | 全ての設計項目が矛盾なし・漏れなし・整合ありで確認された場合 |
| MINOR | 軽微な不整合があるが修正を Phase 4 と並行して解消できる場合  |
| MAJOR | 設計に根本的な矛盾があり、Phase 2 に戻る必要がある場合       |

**MAJOR 判定となる条件の例**:

- `deepMerge` のマージルール（配列上書き・null 上書き・undefined 省略）が IPC 契約と矛盾する
- `Record<string, unknown>` 制約でジェネリック型が成立せず、型安全性が確保できない
- 既存の `registerUserSettingsHandlers` 呼び出し元に型エラーが発生する
- 追加テストケース 3 ケースの設計が AC を構造的に満たせない

## 実行タスク

- **設計レビュー**: Phase 2 成果物をレビューし、矛盾・漏れ・整合性を検証する
- **矛盾チェック**: deepMerge 設計と IPC 契約・型安全性の整合を確認する
- **ゲート判定**: PASS/MINOR/MAJOR を決定し、理由を記録する
- **後方互換性確認**: 既存の `registerUserSettingsHandlers` 呼び出し元への影響を確認する
- **リスク評価**: 設計上のリスクを識別し、対応策が設計に反映されているか確認する

## 参照資料

| 資料名                       | パス                                               | 用途                  |
| ---------------------------- | -------------------------------------------------- | --------------------- |
| Phase 1 要件定義書           | `outputs/phase-1/requirements-definition.md`       | 要件・AC 参照         |
| Phase 1 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`           | AC 整合確認           |
| Phase 2 アーキテクチャ設計書 | `outputs/phase-2/architecture-design.md`           | 設計内容参照          |
| Phase 2 IPC 契約設計書       | `outputs/phase-2/ipc-contract-design.md`           | 入出力型・4層整合確認 |
| Phase 2 テスト戦略書         | `outputs/phase-2/test-strategy.md`                 | テストケース確認      |
| Phase 2 依存整合マトリクス   | `outputs/phase-2/dependency-consistency-matrix.md` | 型安全性確認          |
| storeHandlers.ts             | `apps/desktop/src/main/ipc/storeHandlers.ts`       | 現状実装確認          |
| storeHandlers.test.ts        | `apps/desktop/src/main/ipc/storeHandlers.test.ts`  | 既存テスト構造確認    |

## 実行手順

### 1. 設計一貫性チェック

| チェック項目                                                                                                 | 判定基準             | 結果    |
| ------------------------------------------------------------------------------------------------------------ | -------------------- | ------- |
| `deepMerge` 関数が `storeHandlers.ts` 内プライベート関数として配置される設計が明記されているか               | 配置と責務の整合     | pending |
| マージルール（配列上書き・null 上書き・undefined 省略・プレーンオブジェクト再帰）が設計に明記されているか    | ルールの完全性       | pending |
| `settings:update` ハンドラの変更前後（before/after）が設計書に明記されているか                               | 変更箇所の特定可能性 | pending |
| `deepMerge` のジェネリック型制約 `T extends Record<string, unknown>` が明記されているか                      | 型安全性の設計対応   | pending |
| IPC 入力型 `Record<string, unknown>`・出力型 `{ success: boolean; error?: string }` が設計に明記されているか | 契約の明確性         | pending |
| 追加テストケース 3 ケース（ネスト保持・トップレベル上書き・配列上書き）が設計に明記されているか              | テスト戦略の具体性   | pending |
| 4層整合性チェック（Shared/Preload/Main/API）の確認方針が設計に明記されているか                               | IPC 整合の設計対応   | pending |

### 2. AC 整合チェック

| AC ID | 設計対応内容                                                                                                        | 充足判定 |
| ----- | ------------------------------------------------------------------------------------------------------------------- | -------- |
| AC-1  | `deepMerge(current, updates)` で `settings:update` ハンドラがネストフィールドを保持することが設計に明記されているか | pending  |
| AC-2  | 配列フィールドが上書き（マージしない）となることが設計に明記されているか                                            | pending  |
| AC-3  | `null` 値が上書き扱い・`undefined` 値が省略扱いとなることが設計に明記されているか                                   | pending  |
| AC-4  | 既存の `registerStoreHandlers` テストが設計変更後も通過することが設計に考慮されているか                             | pending  |
| AC-5  | `pnpm --filter @repo/desktop typecheck` が PASS となる型設計になっているか                                          | pending  |

### 3. 後方互換性チェック

```bash
# registerUserSettingsHandlers の呼び出し元確認（既存フローへの影響確認）
grep -rn "registerUserSettingsHandlers" apps/ packages/

# USER_SETTINGS_UPDATE ハンドラの呼び出し元確認
grep -rn "USER_SETTINGS_UPDATE\|settings:update" \
  apps/desktop/src/main/ipc/

# storeHandlers.test.ts の既存テスト確認
grep -n "describe\|it(" \
  apps/desktop/src/main/ipc/storeHandlers.test.ts
```

| チェック項目                                                                | 判定基準                                                   | 結果    |
| --------------------------------------------------------------------------- | ---------------------------------------------------------- | ------- |
| `registerUserSettingsHandlers()` の呼び出し元が設計変更後も動作するか       | ハンドラ登録方式に変更なし（deepMerge は内部実装のみ変更） | pending |
| 既存の `registerStoreHandlers` テストが `deepMerge` 追加の影響を受けないか  | `registerStoreHandlers` のスコープは独立していること       | pending |
| `deepMerge` をプライベート関数として配置することで外部 API が変更されないか | モジュール export に変更なし                               | pending |

### 4. 命名規則チェック

```bash
# 既存の private 関数命名パターン確認（camelCase）
grep -n "^function " apps/desktop/src/main/ipc/storeHandlers.ts

# 既存の変数命名パターン確認
grep -n "const\|let " apps/desktop/src/main/ipc/storeHandlers.ts | head -20
```

| 確認項目                                        | 期待パターン     | 結果    |
| ----------------------------------------------- | ---------------- | ------- |
| 関数名 `deepMerge`                              | camelCase        | pending |
| 型パラメータ `T`                                | 単一大文字       | pending |
| パラメータ名 `base`・`override`                 | camelCase        | pending |
| ローカル変数 `result`・`overrideVal`・`baseVal` | camelCase        | pending |
| `USER_SETTINGS_STORE_KEY` 定数名                | UPPER_SNAKE_CASE | pending |

### 5. リスクチェック

| リスク                                                                       | Phase 2 での対策                                                                                                   | 対応充足度 |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------- |
| `deepMerge` の再帰が `UserSettings` の将来のネスト深度増加に対応できるか     | 無制限再帰のため自然に対応可能。循環参照は `Record<string, unknown>` 制約内では実用上発生しない                    | 充足       |
| `undefined` 省略ルールにより意図的な `undefined` 削除ができないケース        | 現行 `UserSettings` では `undefined` を意図的に設定する用途なし。設計に明記が必要か確認する                        | 要確認     |
| 既存の `{ ...current, ...updates }` からの移行でテストが壊れるリスク         | 既存テストは `registerStoreHandlers` 対象のみ。`registerUserSettingsHandlers` テストが存在しない場合は新規追加のみ | 要確認     |
| `storeHandlers.test.ts` に `registerUserSettingsHandlers` テストが含まれるか | 現状のテストファイルを確認し、テスト追加で既存テストと競合しないことを確認する                                     | 要確認     |

### 6. レビュー判定基準

| 判定  | 条件                                                                | 次のアクション         |
| ----- | ------------------------------------------------------------------- | ---------------------- |
| PASS  | 全チェック項目でリスクなし・AC 全充足・後方互換性確保               | Phase 4 へ進む         |
| MINOR | 小さな指摘事項あり（実装時に並行解消可能）                          | Phase 4 へ進む（追跡） |
| MAJOR | 設計の根本的な問題（型安全性の破綻・AC 未充足・後方互換が管理不能） | Phase 2 へ戻る         |

**総合判定**: （実行時に PASS / MINOR / MAJOR を記録）

### 7. MINOR 追跡テーブル

| MINOR ID         | 指摘内容 | 解決予定 Phase | 解決確認 Phase | 備考 |
| ---------------- | -------- | -------------- | -------------- | ---- |
| （実行時に記録） | -        | -              | -              | -    |

### 8. Phase 4 開始条件

Phase 4（テスト作成）を開始できる条件:

- [ ] 総合判定が PASS または MINOR であること
- [ ] MAJOR 判定の場合は Phase 2 へ戻り再設計を行うこと
- [ ] MINOR の指摘事項が追跡テーブルに記録されていること
- [ ] 既存の `storeHandlers.test.ts` 構造を確認し、テスト追加位置が決定されていること

## 統合テスト連携

| 判定項目               | 基準    | 結果    |
| ---------------------- | ------- | ------- |
| 型チェック（設計段階） | PASS    | pending |
| lint                   | 0 error | pending |

## 多角的チェック観点

| 観点               | チェック内容                                                                                             |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| 型設計妥当性       | `deepMerge<T extends Record<string, unknown>>` が `Record<string, unknown>` 引数と型エラーなく整合するか |
| 最小変更原則       | 設計変更が `storeHandlers.ts` の `settings:update` ハンドラ内に限定されているか（ファイル追加なし）      |
| テスト設計適合     | Phase 4 で TDD（Red→Green）の流れで 3 ケースを追加しやすい設計になっているか                             |
| マージルール一貫性 | 配列上書き・null 上書き・undefined 省略のルールがコード設計とテスト設計で一致しているか                  |
| 将来の拡張性       | `UserSettings` にネストが追加された際に `deepMerge` が追加修正なしに対応できるか                         |

## 成果物

| 成果物             | パス                                         | 説明                            |
| ------------------ | -------------------------------------------- | ------------------------------- |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md`    | 全チェック項目の確認結果        |
| ゲート判定書       | `outputs/phase-3/gate-decision.md`           | PASS/MINOR/MAJOR 判定・判定根拠 |
| 矛盾チェックリスト | `outputs/phase-3/contradiction-checklist.md` | 矛盾・漏れ・不整合の詳細リスト  |

## 完了条件

- [ ] 設計一貫性チェック（7項目）が完了
- [ ] AC 整合チェック（AC-1〜AC-5）が確認済み
- [ ] 後方互換性チェック（影響範囲確認）が完了
- [ ] 命名規則チェック（5項目）が完了
- [ ] リスクチェック（4項目）が完了
- [ ] 総合判定（PASS/MINOR/MAJOR）が記録されている
- [ ] MINOR 判定の指摘事項があれば追跡テーブルに記録済み
- [ ] Phase 4 開始条件（PASS または MINOR）が充足されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. 設計一貫性チェック（7項目）
2. AC 整合チェック（AC-1〜AC-5）
3. 後方互換性チェック（grep による影響範囲確認）
4. 命名規則チェック（5項目）
5. リスクチェック（4項目）
6. 総合判定記録
7. MINOR 追跡テーブル記録（該当時）
8. 成果物の出力

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 4: テスト作成（PASS または MINOR の場合）
Phase 2: 設計（MAJOR の場合）
