# Phase 1: 要件定義 - UT-W3-ANALYTICS-STORE-INTEGRATION-001

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 1                                     |
| 機能名     | UT-W3-ANALYTICS-STORE-INTEGRATION-001 |
| 作成日     | 2026-04-13                            |
| ステータス | not-started                           |

---

## 目的

renderer 側の `analyticsSlice`（Zustand slice）の要件定義と、スキル実行ライフサイクル（start / complete / error）を `analyticsAdapter` へ直接送信するスコープを確定する。既存の `trackEvent` 公開 API は変更せず、main-process 側の `AnalyticsStore` / `SkillAnalytics` も触らない。

このタスクでは `packages/shared/src/types/skill-analytics.ts` を共有型の正本として扱い、`analytics.ts` という新規ファイルは作成しない。

---

## Step 0: P50チェック（既存資産の確認）

Phase 1 着手前に以下のコマンドを実行し、既存資産を把握すること。結果は `outputs/phase-1/p50-check-result.md` に記録する。

```bash
# 既存の store ディレクトリ構造確認
find apps/desktop/src/renderer/store -type f 2>/dev/null

# analyticsAdapter の公開インターフェース確認
grep -n "export\|interface\|trackEvent\|analyticsAdapter" \
  apps/desktop/src/renderer/utils/analyticsAdapter.ts 2>/dev/null | head -30

# trackEvent の既存イベント定義確認
grep -n "SkillWizardEvents\|export type\|export function" \
  apps/desktop/src/renderer/utils/trackEvent.ts 2>/dev/null | head -30

# 既存のZustand slice パターン確認
grep -rn "createSlice\|create(" apps/desktop/src/renderer/store/ 2>/dev/null | head -20

# スキル実行フローのエントリポイント確認
grep -rn "runSkill\|executeSkill\|skillExecution" \
  apps/desktop/src/renderer/ 2>/dev/null | grep -v test | head -20

# 既存の main-process analytics 実装確認（今回の変更対象外）
grep -rn "class AnalyticsStore\|class SkillAnalytics" \
  apps/desktop/src/main/services/skill/ 2>/dev/null | head -20

# 共有型の正本確認
grep -n "SkillUsageEvent\|export type" \
  packages/shared/src/types/skill-analytics.ts 2>/dev/null | head -40
```

---

## 実行タスク

| タスクID | タスク名                     | 説明                                                                           |
| -------- | ---------------------------- | ------------------------------------------------------------------------------ |
| T-01-1   | 既存store構造確認            | P50チェック実施、`slices/` 配置の既存 slice パターンを把握する                 |
| T-01-2   | 送信境界API確認              | `analyticsAdapter` と `trackEvent` のシグネチャを把握し、変更禁止APIを特定する |
| T-01-3   | スキル実行ライフサイクル確認 | `start` / `complete` / `error` の各タイミングと送信先を特定する                |
| T-01-4   | スコープ確定                 | renderer-side analyticsSlice が担う責務と担わない責務を明文化する              |
| T-01-5   | 受入基準の文書化             | AC-1〜AC-4 を `outputs/phase-1/acceptance-criteria.md` に記録する              |

---

## 受入基準

| ID   | 基準                                                                         |
| ---- | ---------------------------------------------------------------------------- |
| AC-1 | スキル実行の開始・完了・エラーが自動的に `analyticsAdapter` へ送信されること |
| AC-2 | renderer-side `analyticsSlice` が Zustand slice として実装されていること     |
| AC-3 | 既存の `trackEvent` 公開 API シグネチャが変更されないこと                    |
| AC-4 | `pnpm typecheck && pnpm lint && pnpm test` が PASS すること                  |

---

## 参照資料

| 資料名                             | パス                                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| analyticsAdapter 実装              | `apps/desktop/src/renderer/utils/analyticsAdapter.ts`                          |
| trackEvent 実装                    | `apps/desktop/src/renderer/utils/trackEvent.ts`                                |
| 既存 renderer store 配置           | `apps/desktop/src/renderer/store/slices/`                                      |
| main-process analytics 実装        | `apps/desktop/src/main/services/skill/AnalyticsStore.ts` / `SkillAnalytics.ts` |
| shared 型の正本                    | `packages/shared/src/types/skill-analytics.ts`                                 |
| UT-W3-ANALYTICS-ADAPTER-001 仕様書 | `docs/30-workflows/ut-w3-analytics-adapter-001/` （完了済み）                  |

---

## 実行手順

### ステップ 1: 既存 store 構造確認

1. P50チェックコマンドを実行し、`apps/desktop/src/renderer/store/` 配下のファイル一覧を取得する
2. 既存 Zustand slice のパターン（`create()` / `createSlice()` の使い方）を把握する
3. `analyticsSlice.ts` がすでに存在する場合は内容を確認し、重複実装を避ける

### ステップ 2: analyticsAdapter 公開 API 確認

1. `analyticsAdapter.ts` のエクスポートを全て列挙する
2. `trackEvent` の型シグネチャ（引数・戻り値）を記録する
3. **変更禁止リスト** を作成し、`outputs/phase-1/scope-definition.md` に記録する

### ステップ 3: スコープ確定

スキル実行ライフサイクルの各タイミングを以下の観点で整理する。ここでいう `SkillAnalyticsEvent` は shared 型のドメイン表現であり、送信時のイベント名は `skill_start` / `skill_complete` / `skill_error` を使う。

| ライフサイクルイベント | 発火タイミング         | analyticsSlice が行うこと                                      |
| ---------------------- | ---------------------- | -------------------------------------------------------------- |
| `skillStart`           | スキル実行開始時       | `analyticsAdapter.send("skill_start", SkillAnalyticsEvent)`    |
| `skillComplete`        | スキル実行正常完了時   | `analyticsAdapter.send("skill_complete", SkillAnalyticsEvent)` |
| `skillError`           | スキル実行エラー終了時 | `analyticsAdapter.send("skill_error", SkillAnalyticsEvent)`    |

### ステップ 4: 受入基準の文書化

AC-1〜AC-4 を `outputs/phase-1/acceptance-criteria.md` に記録し、各基準の検証方法も明記する。

---

## 変更ファイル一覧（スコープ確定時に記録）

| ファイル                                                                  | 変更種別       | 変更内容                                   |
| ------------------------------------------------------------------------- | -------------- | ------------------------------------------ |
| `apps/desktop/src/renderer/store/slices/analyticsSlice.ts`                | 新規           | renderer-side analyticsSlice Zustand slice |
| `packages/shared/src/types/skill-analytics.ts`                            | 新規または修正 | `SkillAnalyticsEvent` 型定義               |
| `apps/desktop/src/renderer/store/slices/__tests__/analyticsSlice.test.ts` | 新規           | ユニットテスト                             |

---

## 多角的チェック観点

### システム系

- `analyticsSlice` → `analyticsAdapter` の依存方向が一方向であることを確認
- Zustand の middleware は使わず、action-first で十分かを確認する
- SSR（Next.js）環境での副作用有無を確認（desktop/Electron 専用であれば問題なし）

### 価値コスト系

- 自動送信によりスキル実行コードへの手動イベント発火が不要になるか確認
- renderer-side analyticsSlice を action-only に保つことで複雑性を抑えられるか確認

### 問題解決系

- 循環依存（analyticsSlice → analyticsAdapter → analyticsSlice）が発生しないことを要件に明記
- スキル実行の非同期エラーが確実に捕捉され、送信失敗で UI 側が壊れないことを確認する

---

## サブタスク管理

| ID     | タスク                       | 担当 | ステータス  |
| ------ | ---------------------------- | ---- | ----------- |
| T-01-1 | 既存store構造確認            | AI   | not-started |
| T-01-2 | analyticsAdapter 公開API確認 | AI   | not-started |
| T-01-3 | スキル実行ライフサイクル確認 | AI   | not-started |
| T-01-4 | スコープ確定                 | AI   | not-started |
| T-01-5 | 受入基準の文書化             | AI   | not-started |

---

## 成果物

| 成果物ファイル                           | 内容                                          |
| ---------------------------------------- | --------------------------------------------- |
| `outputs/phase-1/acceptance-criteria.md` | AC-1〜AC-4 の詳細定義と検証方法               |
| `outputs/phase-1/p50-check-result.md`    | P50チェックコマンドの実行結果・既存資産の整理 |
| `outputs/phase-1/scope-definition.md`    | スコープ確定テーブル・変更禁止APIリスト       |

---

## 完了条件

- [ ] P50チェックを実施し、結果を `outputs/phase-1/p50-check-result.md` に記録した
- [ ] `analyticsAdapter` の変更禁止 API シグネチャを特定・記録した
- [ ] スキル実行ライフサイクルの3イベント（start / complete / error）のエントリポイントを特定した
- [ ] スコープ確定テーブルを `outputs/phase-1/scope-definition.md` に記録した
- [ ] AC-1〜AC-4 を `outputs/phase-1/acceptance-criteria.md` に記録した

---

## タスク100%実行確認

Phase 1 完了時は以下を確認すること：

1. 全サブタスク（T-01-1〜T-01-5）が completed になっていること
2. 3つの成果物ファイルが `outputs/phase-1/` に存在すること
3. 次Phase（Phase 2: 設計）の入力として必要な情報が揃っていること

---

## 次Phase説明

**Phase 2: 設計**

Phase 1 で確定したスコープ・受入基準・変更禁止 API リストを入力として、renderer-side `analyticsSlice` の Zustand slice インターフェース設計を行う。`analyticsAdapter` への直接送信、ドメイン型と transport 名の分離、依存グラフを確定し、Phase 4（テスト作成）への設計書を完成させる。
