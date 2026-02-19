# Phase 1 成果物: 要件定義書

## メタ情報

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| タスクID   | TASK-FIX-10-1-VITEST-ERROR-HANDLING |
| Phase      | 1                                   |
| 作成日     | 2026-02-19                          |
| ステータス | 完了                                |

---

## 概要

`apps/desktop/vitest.config.ts` L43 の `dangerouslyIgnoreUnhandledErrors: true` 設定を削除し、未処理 Promise 拒否をテスト実行時にエラーとして検出可能にする。テスト総数 9,876 件中、設定変更により 252 件のテストが 32 ファイルで失敗することが判明した。

---

## 影響範囲サマリー

| 指標                   | 値    |
| ---------------------- | ----- |
| テスト総数             | 9,876 |
| スキップ中テスト       | 50    |
| テストファイル総数     | 460   |
| スキップ中ファイル     | 2     |
| **失敗テスト数**       | 252   |
| **失敗ファイル数**     | 32    |
| 失敗率（テスト単位）   | 2.6%  |
| 失敗率（ファイル単位） | 7.0%  |

---

## 根本原因カテゴリ

失敗テスト 252 件は以下の 3 カテゴリに分類される。

| カテゴリ ID | カテゴリ名                            | 失敗ファイル数 | 推定失敗テスト数 | 根本原因                                                                                               |
| ----------- | ------------------------------------- | -------------- | ---------------- | ------------------------------------------------------------------------------------------------------ |
| C-1         | @repo/shared サブパスエイリアス不足   | 25             | ~220             | `vitest.config.ts` の `resolve.alias` に未登録のサブパスが存在し、モジュール解決に失敗                 |
| C-2         | chat-history 非同期クリーンアップ不備 | 6              | ~30              | happy-dom の AsyncTaskManager 破壊後にスクリプト実行が継続し、テスト teardown でのクリーンアップ不完全 |
| C-3         | Worker 予期せぬ終了                   | 1              | ~2               | Vitest Worker がメモリ圧迫またはタイムアウトにより予期せず終了（P22 既知問題）                         |

### C-1: @repo/shared サブパスエイリアス不足（詳細）

以下のサブパスが `vitest.config.ts` の `resolve.alias` に未登録:

- `@repo/shared/types/auth`
- `@repo/shared/types/api-keys`
- `@repo/shared/types/agent`
- `@repo/shared/types/skill`
- `@repo/shared/infrastructure/auth`

これらの未登録サブパスを import するファイルが直接失敗するほか、IPC ハンドラテスト（authHandlers, apiKeyHandlers, profileHandlers 等）が連鎖的に失敗する。

### C-2: chat-history 非同期クリーンアップ不備（詳細）

happy-dom 環境において、テスト teardown（`afterEach` / `afterAll`）で非同期処理のクリーンアップが不完全。AsyncTaskManager が破壊された後もスクリプト実行が継続し、未処理の Promise 拒否が発生する。

### C-3: Worker 予期せぬ終了（詳細）

既知の問題 P22 に該当。大規模テスト実行時に Vitest Worker が予期せず終了する。本タスクのスコープ外として扱い、発生時はリトライで対処する。

---

## 機能要件（FR）

### FR-1: dangerouslyIgnoreUnhandledErrors 設定の削除

- `apps/desktop/vitest.config.ts` から `dangerouslyIgnoreUnhandledErrors: true` の設定行を削除する
- 削除後、Vitest のデフォルト動作（未処理 Promise 拒否をテスト失敗として検出）が復元されること

### FR-2: 全テストの PASS

- `apps/desktop/src/**/*.test.{ts,tsx}` の全テスト（9,876 件）が PASS すること
- 既存のスキップテスト（50 件）はスキップ状態を維持してよい
- 新たにスキップするテストを追加しないこと

### FR-3: @repo/shared サブパスエイリアスの登録

- `vitest.config.ts` の `resolve.alias` に以下のサブパスを追加する:
  - `@repo/shared/types/auth`
  - `@repo/shared/types/api-keys`
  - `@repo/shared/types/agent`
  - `@repo/shared/types/skill`
  - `@repo/shared/infrastructure/auth`
- 登録後、これらのサブパスを import するテストファイルが全て PASS すること

---

## 非機能要件（NFR）

### NFR-1: テスト実行時間の維持

- 設定変更前後でテスト実行時間が 20% 以上増加しないこと
- 測定方法: `time pnpm --filter @repo/desktop exec vitest run` を変更前後で各 3 回実行し、平均値を比較

### NFR-2: プロダクションコード動作の不変性

- プロダクションコード（`apps/desktop/src/**/*.{ts,tsx}` のうちテストファイル以外）の変更は最小限に留める
- ビルド成果物（Electron アプリ）の実行時動作が変更されないこと
- プロダクションコードを変更する場合は、変更理由と影響範囲を明示すること

### NFR-3: 他パッケージへの影響なし

- `packages/shared`、`apps/web`、`apps/backend` のテストに影響を与えないこと
- 各パッケージは独自の `vitest.config.ts` を持つため、`apps/desktop` の設定変更は影響しない（検証は実施する）

---

## アーキテクチャ層別影響範囲

| 層               | 影響範囲                                                                                             | 修正対象                          |
| ---------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------- |
| Main Process     | IPC ハンドラテスト（auth, apiKey, profile, agent, session）、サービステスト（Agent, Session, Slide） | テストコード + vitest.config.ts   |
| Renderer Process | コンポーネントテスト（SkillCard, SkillList, AgentView）、chat-history テスト                         | テストコード                      |
| Preload          | 直接的な影響なし                                                                                     | -                                 |
| Shared           | サブパスエイリアス不足による間接的影響                                                               | vitest.config.ts のエイリアス設定 |
| Vitest 設定      | `dangerouslyIgnoreUnhandledErrors` 削除、`resolve.alias` 追加                                        | vitest.config.ts                  |

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-02-19 | 初版作成 |
