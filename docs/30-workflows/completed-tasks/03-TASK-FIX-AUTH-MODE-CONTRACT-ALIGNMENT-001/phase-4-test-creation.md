# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 4                                         |
| 機能名     | TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001 |
| タスク名   | auth-mode 契約整合の Red テスト設計       |
| 作成日     | 2026-03-06                                |
| ステータス | completed                                 |

## 目的

現状の contract drift を Red テストで明示し、Phase 5 で shared transport DTO と adapter 実装へ一直線に進める。

## 背景

このタスクは型エラーだけでは検出し切れない。handler の戻り値 shape、event payload、Renderer の期待 shape をテストで固定しないと drift が再発する。

## SubAgentチーム編成

| SubAgent                | 担当関心            | 実行形態 | Phase 4 の責務                                                                 |
| ----------------------- | ------------------- | -------- | ------------------------------------------------------------------------------ |
| SubAgent-Contract-Main  | Main handler test   | 並列     | handler response と sender 検証の Red テストを書く                             |
| SubAgent-Bridge-Preload | Preload API test    | 並列     | `safeInvoke` / `safeOn` の引数と戻り値契約を固定する                           |
| SubAgent-Renderer-State | Renderer slice test | 並列     | `authModeSlice` の `fetchMode`, `fetchStatus`, `validate`, listener を固定する |
| SubAgent-Spec-Sync      | テスト観点統合      | 直列統合 | Red テスト行列と integration test を統合する                                   |

## 実行タスク

- Main Red テスト設計: `get`, `set`, `status`, `validate` の戻り値 shape と sender 検証順序を固定する。
- Preload Red テスト設計: `preload/index.ts` と `preload/types.ts` の公開シグネチャを固定する。
- Renderer Red テスト設計: `authModeSlice` が `data.mode`, `status`, `changed` event をどう読むか固定する。
- selector / mount Red テスト設計: SettingsView mount、AuthModeSelector interaction、infinite-loop prevention を Red に含める。
- Integration Red テスト設計: `set -> changed -> status` の直列整合を固定する。

## 参照資料

### 実装・コード

| 資料名                     | パス                                                                                                 | 用途                                               |
| -------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Phase 1 仕様               | `phase-1-requirements.md`                                                                            | AC を確認する                                      |
| Phase 2 仕様               | `phase-2-design.md`                                                                                  | canonical DTO を確認する                           |
| Phase 3 仕様               | `phase-3-design-review.md`                                                                           | Gate 条件を確認する                                |
| Phase 1 成果物             | `outputs/phase-1/`                                                                                   | drift inventory を確認する                         |
| Phase 2 成果物             | `outputs/phase-2/`                                                                                   | DTO 設計を確認する                                 |
| Phase 3 成果物             | `outputs/phase-3/`                                                                                   | レビュー指摘を確認する                             |
| Main handler テスト        | `apps/desktop/src/main/ipc/__tests__/authModeHandlers.test.ts`                                       | 既存 test 追加位置を確認する                       |
| Main handler 異常系        | `apps/desktop/src/main/ipc/__tests__/authModeHandlers.error.test.ts`                                 | invalid sender / invalid mode の追加位置を確認する |
| Renderer slice テスト      | `apps/desktop/src/renderer/store/slices/__tests__/authModeSlice.test.ts`                             | public shape の期待値を確認する                    |
| Renderer slice 異常系      | `apps/desktop/src/renderer/store/slices/__tests__/authModeSlice.error.test.ts`                       | error case の追加位置を確認する                    |
| Selector テスト            | `apps/desktop/src/renderer/store/slices/__tests__/authModeSlice.selectors.test.ts`                   | renderHook ベースの selector Red を確認する        |
| SettingsView テスト        | `apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx`                                 | mount / 表示 Red を追加する位置を確認する          |
| AuthModeSelector テスト    | `apps/desktop/src/renderer/components/settings/AuthModeSelector/__tests__/AuthModeSelector.test.tsx` | interaction Red を追加する位置を確認する           |
| 無限ループ防止テスト       | `apps/desktop/src/renderer/__tests__/infinite-loop-prevention.test.tsx`                              | P31 再発 Red を確認する                            |
| 要件定義書                 | `outputs/phase-1/requirements-definition.md`                                                         | Phase 1 成果物                                     |
| 受け入れ基準               | `outputs/phase-1/acceptance-criteria.md`                                                             | Phase 1 成果物                                     |
| 契約ドリフト台帳           | `outputs/phase-1/drift-inventory.md`                                                                 | Phase 1 成果物                                     |
| 公開型正本マップ           | `outputs/phase-1/source-of-truth-map.md`                                                             | Phase 1 成果物                                     |
| スコープ境界               | `outputs/phase-1/scope-boundary.md`                                                                  | Phase 1 成果物                                     |
| canonical contract設計     | `outputs/phase-2/canonical-contract-design.md`                                                       | Phase 2 成果物                                     |
| 層責務マトリクス           | `outputs/phase-2/layer-responsibility-matrix.md`                                                     | Phase 2 成果物                                     |
| error envelope設計         | `outputs/phase-2/error-envelope-design.md`                                                           | Phase 2 成果物                                     |
| shared型移行計画           | `outputs/phase-2/shared-type-migration-plan.md`                                                      | Phase 2 成果物                                     |
| テスト戦略                 | `outputs/phase-2/test-strategy.md`                                                                   | Phase 2 成果物                                     |
| 設計レビュー結果           | `outputs/phase-3/design-review-result.md`                                                            | Phase 3 成果物                                     |
| レビュー観点チェックリスト | `outputs/phase-3/review-checklist.md`                                                                | Phase 3 成果物                                     |
| ゲート判定                 | `outputs/phase-3/gate-decision.md`                                                                   | Phase 3 成果物                                     |
| オープンクエスチョン       | `outputs/phase-3/open-questions.md`                                                                  | Phase 3 成果物                                     |

### システム仕様（aiworkflow-requirements）

| 資料名               | パス                                                                              | 用途                                                                    |
| -------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| IPC 契約チェック     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | 3 箇所同時更新と P42 テスト観点を固定する                               |
| IPC セキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | sender 検証テストを固定する                                             |
| 品質要件             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | coverage 目標の基準を確認する                                           |
| 状態管理             | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | store listener と selector の期待を確認する                             |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/patterns.md`                   | SettingsView / `store/index.ts` の個別 selector パターンを Red に落とす |
| 開発ガイドライン     | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`     | `useEffect` 依存配列の禁止パターンを Red に落とす                       |
| コンポーネントテスト | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | happy-dom / `electronAPI.authMode` mock を Red に落とす                 |

## 実行手順

1. Phase 1-3 の成果物から channel 別 AC と design decision を抜き出す。
2. SubAgent-Contract-Main、SubAgent-Bridge-Preload、SubAgent-Renderer-State が並列で Red テスト仕様を書く。
3. `red-test-matrix.md` で channel × layer × 正常系 / 異常系 を一表にまとめる。
4. `integration-red-tests.md` に `set -> changed -> status` と `invalid sender` の直列ケースを書く。

## 統合テスト連携

- `auth-mode:get` は `data.mode` を返さない現状を Red として固定する。
- `auth-mode:status` は `isAuthenticated` と `isValid` の差分を Red として固定する。
- `auth-mode:validate` は `message` と `errorCode` 欠落を Red として固定する。
- `auth-mode:changed` は `mode` と `status` 欠落を Red として固定する。
- SettingsView mount は無限ループを起こさず、`initializeAuthMode` が個別 selector 経由で 1 経路に固定されることを Red に含める。

## 多角的チェック観点

| 観点       | 確認内容                                                        |
| ---------- | --------------------------------------------------------------- |
| 再発防止   | current drift をそのまま Red に変換できているか                 |
| 異常系     | invalid sender、invalid mode、credential missing を含んでいるか |
| event 整合 | event payload と `fetchStatus` の期待が同じ DTO になっているか  |
| 型移行     | shared 正本化後に不要になる重複型をテストで押さえているか       |
| 直列フロー | `set -> changed -> status` の順が崩れていないか                 |

## 成果物

| 成果物                    | パス                                          | 説明                                       |
| ------------------------- | --------------------------------------------- | ------------------------------------------ |
| Red テスト行列            | `outputs/phase-4/red-test-matrix.md`          | channel × layer の失敗観点一覧             |
| Main IPC Red テスト       | `outputs/phase-4/main-ipc-red-tests.md`       | handler の失敗ケース一覧                   |
| Preload Bridge Red テスト | `outputs/phase-4/preload-bridge-red-tests.md` | Preload 公開 API の失敗ケース一覧          |
| Renderer Slice Red テスト | `outputs/phase-4/renderer-slice-red-tests.md` | slice listener と fetch 系の失敗ケース一覧 |
| Integration Red テスト    | `outputs/phase-4/integration-red-tests.md`    | 直列 contract consistency の失敗ケース一覧 |

## 完了条件

- [x] `red-test-matrix.md` に 5 channel × 3 layer の組み合わせを記録する
- [x] `main-ipc-red-tests.md` に invalid sender と invalid mode のケースを書く
- [x] `preload-bridge-red-tests.md` に `get`, `status`, `validate`, `onModeChanged` の 4 つを書く
- [x] `renderer-slice-red-tests.md` に `fetchMode`, `fetchStatus`, `validate`, listener, selector stability の 5 つを書く
- [x] `integration-red-tests.md` に `set -> changed -> status` と SettingsView mount / no-loop の直列ケースを書く
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Main Red テスト設計
2. Preload Red テスト設計
3. Renderer Red テスト設計
4. Integration Red テスト設計
5. 完了条件確認

## タスク100%実行確認【必須】

- [x] drift を Red テストに変換した
- [x] 3 層の失敗ケースを別ファイルに分離した
- [x] 直列 integration case を定義した
- [x] Phase 5 の実装順序に直結する test name を付けた

## 次のPhase

Phase 5: 実装
