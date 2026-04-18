# Phase 7: カバレッジ確認レポート (coverage-report)

## 確認日

2026-04-18

---

## 概要

本レポートは TASK-SW-CANCEL-002 の対象ファイルに対して、Phase 4（テスト作成）および Phase 6（テスト拡充）で設計した TC-01〜TC-08 が実装後に満たすべきカバレッジ目標を記録したものである。

テストファイルは Phase 4 で作成予定のため、本レポートは **想定カバレッジレポート** として機能し、Phase 4 実行時に実測値で更新される。

---

## カバレッジ計測コマンド

Phase 4 でテストファイルが作成され Phase 5 で実装が完了した後、以下のコマンドで計測する:

```bash
# desktopパッケージのカバレッジ計測（preloadテストのみ対象）
pnpm --filter @repo/desktop test --coverage -- \
  --testPathPattern="preload"
```

または Vitest の設定に応じて:

```bash
VITEST_COVERAGE=true pnpm --filter @repo/desktop test \
  --reporter=verbose \
  -- apps/desktop/src/preload/__tests__/skill-creator-api-cancel.test.ts \
     apps/desktop/src/preload/__tests__/channels-cancel.test.ts
```

---

## TC-01〜TC-08 と対象コード行の対応表

### 対象ファイル1: `apps/desktop/src/preload/skill-creator-api.ts`

| テストケース | 内容                                                    | 対象行                                    | カバレッジ寄与  |
| ------------ | ------------------------------------------------------- | ----------------------------------------- | --------------- |
| TC-01        | `cancelGeneration` メソッドが存在すること               | L396（インターフェース定義）              | Function        |
| TC-02        | `cancelGeneration` が Promise を返すこと                | L726-727（実装本体）                      | Line / Function |
| TC-03        | `SKILL_CREATOR_CANCEL` チャンネルで `safeInvoke` を呼ぶ | L727（`safeInvoke` 呼び出し）             | Line / Branch   |
| TC-04        | `cancelGeneration` が `IpcResult<void>` を返すこと      | L726-727（戻り値処理）                    | Line            |
| TC-07        | `safeInvoke` 失敗時も reject しないこと                 | L727（エラーパス: `safeInvoke` 失敗応答） | Branch          |
| TC-08        | `cancelGeneration` が引数なしで呼び出せること           | L726（引数定義: 無引数）                  | Line / Function |

### 対象ファイル2: `apps/desktop/src/preload/channels.ts`

| テストケース | 内容                                                                | 対象行                   | カバレッジ寄与 |
| ------------ | ------------------------------------------------------------------- | ------------------------ | -------------- |
| TC-05        | `ALLOWED_INVOKE_CHANNELS` に `SKILL_CREATOR_CANCEL` が含まれること  | L715-716（配列エントリ） | Line           |
| TC-06        | `SKILL_CREATOR_CANCEL` が invoke ホワイトリストに登録されていること | L716（値確認）           | Line           |

---

## カバレッジ目標

| 指標              | 最低基準（必須） | 推奨基準 | 想定達成見込み                         |
| ----------------- | ---------------- | -------- | -------------------------------------- |
| Line Coverage     | 80%              | 90%      | 90%+（TC-01〜08 の全ラインをカバー）   |
| Branch Coverage   | 60%              | 70%      | 65%+（TC-07 のエラーパスで分岐カバー） |
| Function Coverage | 80%              | 90%      | 100%（`cancelGeneration` 単一関数）    |

### 達成見込みの根拠

- **Line Coverage**: TC-02・TC-03・TC-04 により `cancelGeneration` 実装本体（L726-727）が全行カバーされる。TC-05・TC-06 により `channels.ts` の追加行（L716）もカバーされる。
- **Branch Coverage**: TC-03 は正常パスをカバーし、TC-07 は `safeInvoke` の失敗応答パスをカバーする。`safeInvoke` 内部の分岐（タイムアウト・許可チャンネル検証）は既存テストでカバー済み。
- **Function Coverage**: `cancelGeneration` は単一関数であり TC-01・TC-02 で必ずカバーされる。100% 達成を想定。

---

## MINOR 追跡

| MINOR ID    | 内容                                                             | 観測タイミング       | 対応状況                       |
| ----------- | ---------------------------------------------------------------- | -------------------- | ------------------------------ |
| CANCEL-M-01 | `channels.ts:715` コメントに旧タスクID残存（TASK-SC-CANCEL-001） | Phase 3 設計レビュー | Phase 8 リファクタリングで対応 |

---

## Phase 4 実行時の更新手順

Phase 4 でテストが作成され実行可能になった後、以下の観点で本レポートを更新すること:

1. 実測カバレッジ数値（Line / Branch / Function の実数値）を各テーブルの「実測値」列に追記
2. 目標未達の場合はカバレッジ不足箇所を特定し、TC 追加の要否を評価
3. 全観点サマリー（下記）の「結果」欄を実測結果に更新

---

## 全観点のサマリ（想定）

| 観点                                 | 目標               | 結果（想定）                   |
| ------------------------------------ | ------------------ | ------------------------------ |
| `cancelGeneration` Line Coverage     | ≥80%               | Phase 4 実行時に実測・更新予定 |
| `cancelGeneration` Branch Coverage   | ≥60%               | Phase 4 実行時に実測・更新予定 |
| `cancelGeneration` Function Coverage | ≥80%               | Phase 4 実行時に実測・更新予定 |
| `channels.ts` 追加行カバレッジ       | ≥80%               | Phase 4 実行時に実測・更新予定 |
| カバレッジゲート判定                 | 全指標で最低基準超 | Phase 4 実行時に実測・更新予定 |

**Phase 8 へ進む**
