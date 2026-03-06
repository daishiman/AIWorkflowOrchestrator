# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 1                                         |
| 機能名     | TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001 |
| タスク名   | auth-mode 公開契約の差分固定              |
| 作成日     | 2026-03-06                                |
| ステータス | completed                                 |

## 目的

Main、Preload、Renderer の `auth-mode` 契約差分を要件として固定し、Phase 2 で単一 transport DTO を設計できる状態にする。

## 背景

現状は `get`, `status`, `validate`, `changed` の公開契約が層ごとに異なる。型の重複定義と event payload の差分が連鎖し、SettingsView の状態反映とテスト期待値が同時に壊れる条件を持っている。

## SubAgentチーム編成

| SubAgent                | 担当関心               | 実行形態 | Phase 1 の責務                                                     |
| ----------------------- | ---------------------- | -------- | ------------------------------------------------------------------ |
| SubAgent-Contract-Main  | Main handler / service | 並列     | `authModeHandlers.ts` と `AuthModeService.ts` の実契約を棚卸しする |
| SubAgent-Bridge-Preload | Preload API / 型定義   | 並列     | `preload/index.ts` と `preload/types.ts` の期待契約を棚卸しする    |
| SubAgent-Renderer-State | Zustand slice / UI     | 並列     | `authModeSlice.ts` と Settings UI の受信期待を棚卸しする           |
| SubAgent-Spec-Sync      | aiworkflow 正本仕様    | 直列統合 | references / indexes から既存仕様を収集し、要件抜けをなくす        |

## 実行タスク

- 契約棚卸し: `get`, `set`, `status`, `validate`, `changed` の request / response / event を現行コードから抽出する。
- 型正本候補整理: `packages/shared`, `main/services/auth/types.ts`, `preload/types.ts`, `authModeSlice.ts` の重複項目を一覧化する。
- selector / 初期化経路棚卸し: `store/index.ts`, `SettingsView`, `infinite-loop-prevention.test.tsx` を確認し、P31 再発条件を scope に含める。
- スコープ固定: contract alignment に含める変更と含めない変更を切り分ける。
- 受け入れ基準化: channel 単位で Yes / No 判定できる条件を書く。

## 参照資料

### 実装・コード

| 資料名                  | パス                                                                                                 | 用途                                                         |
| ----------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Shared AuthMode 型      | `packages/shared/src/types/auth-mode.ts`                                                             | transport DTO の正本候補を確認する                           |
| Main auth 型            | `apps/desktop/src/main/services/auth/types.ts`                                                       | Main 内部契約を確認する                                      |
| Subscription provider   | `apps/desktop/src/main/services/auth/SubscriptionAuthProvider.ts`                                    | subscription token 不在時の status / validate 条件を確認する |
| Main IPC handler        | `apps/desktop/src/main/ipc/authModeHandlers.ts`                                                      | 現在の request / response / event を確認する                 |
| Preload API             | `apps/desktop/src/preload/index.ts`                                                                  | `safeInvoke` / `safeOn` の公開境界を確認する                 |
| Preload 型              | `apps/desktop/src/preload/types.ts`                                                                  | UI が参照する transport 型を確認する                         |
| Renderer Slice          | `apps/desktop/src/renderer/store/slices/authModeSlice.ts`                                            | Renderer 側の期待契約を確認する                              |
| Store selector          | `apps/desktop/src/renderer/store/index.ts`                                                           | AuthMode 用個別 selector と export 面を確認する              |
| Settings View           | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                                             | mount 時の初期化、表示 message、selector 利用を確認する      |
| AuthModeSelector        | `apps/desktop/src/renderer/components/settings/AuthModeSelector/index.tsx`                           | UI 操作と status 表示の入口を確認する                        |
| Main テスト             | `apps/desktop/src/main/ipc/__tests__/authModeHandlers.test.ts`                                       | 現在の handler 期待値を確認する                              |
| Renderer テスト         | `apps/desktop/src/renderer/store/slices/__tests__/authModeSlice.test.ts`                             | 現在の slice 期待値を確認する                                |
| Selector テスト         | `apps/desktop/src/renderer/store/slices/__tests__/authModeSlice.selectors.test.ts`                   | renderHook 前提の selector 期待値を確認する                  |
| SettingsView テスト     | `apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx`                                 | mount / 表示 / status 期待値を確認する                       |
| AuthModeSelector テスト | `apps/desktop/src/renderer/components/settings/AuthModeSelector/__tests__/AuthModeSelector.test.tsx` | 操作導線の期待値を確認する                                   |
| 無限ループ防止テスト    | `apps/desktop/src/renderer/__tests__/infinite-loop-prevention.test.tsx`                              | P31 再発条件の既存防波堤を確認する                           |

### システム仕様（aiworkflow-requirements）

| 資料名               | パス                                                                              | 用途                                                      |
| -------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------- |
| resource-map         | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                  | 読むべき正本仕様を絞る                                    |
| quick-reference      | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`               | IPC / Auth / Store の既存パターンを確認する               |
| 認証仕様             | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`            | AuthMode 関連の現行仕様を確認する                         |
| システム IPC         | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`             | auth-mode channel の記載有無を確認する                    |
| IPC 契約チェック     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | P23 / P32 / P42 / P44 の検査項目を固定する                |
| IPC セキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | sender 検証順序を確認する                                 |
| 状態管理             | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | Renderer の状態更新パターンを確認する                     |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/patterns.md`                   | `useAuthModeStore` 非推奨と SettingsView 移行例を確認する |
| 開発ガイドライン     | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`     | 個別 selector と `useEffect` の推奨形を確認する           |
| コンポーネントテスト | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | `window.electronAPI.authMode` mock 範囲を確認する         |
| エラーハンドリング   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | error envelope の記録方法を確認する                       |
| 品質要件             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | テスト閾値を固定する                                      |
| task workflow        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | Phase 12 の同期対象を確認する                             |
| lessons learned      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`            | 過去の契約ドリフトを確認する                              |

## 実行手順

1. `resource-map.md` と `quick-reference.md` から auth / IPC / state-management の参照先を確定する。
2. SubAgent-Contract-Main、SubAgent-Bridge-Preload、SubAgent-Renderer-State が並列で現行 contract を抽出する。
3. SubAgent-Spec-Sync が正本仕様との差分を整理し、`drift-inventory.md` に統合する。
4. `requirements-definition.md`, `acceptance-criteria.md`, `source-of-truth-map.md`, `scope-boundary.md` に要件を固定する。

## 統合テスト連携

- `auth-mode:get` と `auth-mode:status` の連続呼び出しで shape が連続整合する条件を書く。
- `auth-mode:set` 後に `auth-mode:changed` の payload と `status` 再取得結果が一致する条件を書く。
- invalid mode、invalid sender、credential 不在の 3 系統を必須異常系に固定する。
- Main / Preload / Renderer の 3 層で同じ fixture 名を使う方針を Phase 4 に引き継ぐ。

## 多角的チェック観点

| 観点            | 確認内容                                                            |
| --------------- | ------------------------------------------------------------------- |
| 契約境界        | request / response / event を層別に分解できているか                 |
| 型正本          | 公開型の所有者を 1 ファイルに決められるか                           |
| セキュリティ    | sender 検証順序を要件に含めているか                                 |
| UI 影響         | SettingsView が必要とする表示情報を落としていないか                 |
| Selector 安定性 | `store/index.ts` と SettingsView が個別 selector 前提のまま保てるか |
| 文書同期        | Phase 12 で更新する references を要件に含めているか                 |

## 成果物

| 成果物           | パス                                         | 説明                               |
| ---------------- | -------------------------------------------- | ---------------------------------- |
| 要件定義書       | `outputs/phase-1/requirements-definition.md` | channel 単位の機能要件と非機能要件 |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`     | Yes / No 判定できる AC 一覧        |
| 契約ドリフト台帳 | `outputs/phase-1/drift-inventory.md`         | 現行 contract の差分一覧           |
| 公開型正本マップ | `outputs/phase-1/source-of-truth-map.md`     | 重複型と正本候補の対応表           |
| スコープ境界     | `outputs/phase-1/scope-boundary.md`          | 実施対象と非スコープの明文化       |

## 完了条件

- [x] `drift-inventory.md` に `get`, `set`, `status`, `validate`, `changed` の 5 項目がある
- [x] `source-of-truth-map.md` に `packages/shared`, `main/services/auth/types.ts`, `preload/types.ts`, `authModeSlice.ts` の 4 つを記録する
- [x] `scope-boundary.md` に非スコープとして auth provider 実装変更、認証方式追加、UI 全面改修を記録する
- [x] `acceptance-criteria.md` に channel 単位の AC を 1 件以上ずつ書く
- [x] `SettingsView`, `store/index.ts`, `SubscriptionAuthProvider.ts` を影響範囲と非スコープ境界の両面で整理する
- [x] Phase 12 で更新する aiworkflow 正本仕様の一覧を要件へ転記する
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 現行 contract 抽出
2. system spec 抽出
3. 差分台帳作成
4. 受け入れ基準作成
5. 完了条件確認

## タスク100%実行確認【必須】

- [x] 成果物テーブルの 5 ファイルを全て出力した
- [x] Main / Preload / Renderer の差分を 1 つの台帳へ統合した
- [x] Phase 2 へ渡す正本候補を 1 つに絞った
- [x] 実行記録を残した

## 次のPhase

Phase 2: 設計
