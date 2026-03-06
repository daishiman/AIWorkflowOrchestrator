# Phase 2: 設計

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 2                                         |
| 機能名     | TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001 |
| タスク名   | auth-mode canonical transport DTO 設計    |
| 作成日     | 2026-03-06                                |
| ステータス | completed                                 |

## 目的

`auth-mode` の公開 request / response / event を shared transport DTO へ統一し、Main 内部型との境界を adapter で固定する。

## 背景

現状は service 内部型と UI 向け transport 型が混在し、`preload/types.ts` と `authModeSlice.ts` が Main handler の戻り値を正しく表現していない。

## SubAgentチーム編成

| SubAgent                | 担当関心                       | 実行形態 | Phase 2 の責務                                              |
| ----------------------- | ------------------------------ | -------- | ----------------------------------------------------------- |
| SubAgent-Contract-Main  | Main service / handler adapter | 並列     | 内部型から transport DTO への変換規則を設計する             |
| SubAgent-Bridge-Preload | Preload API / type re-export   | 並列     | `preload/index.ts` と `preload/types.ts` の公開面を設計する |
| SubAgent-Renderer-State | Store / UI                     | 並列     | `authModeSlice.ts` と Settings UI が読む DTO を設計する     |
| SubAgent-Spec-Sync      | system spec 反映対象           | 直列統合 | aiworkflow 正本仕様の更新対象と記載順を確定する             |

## 実行タスク

- canonical DTO 設計: `AuthModeStatus`, `AuthModeValidation`, `AuthModeChangedEvent`, error union を shared に定義する。
- adapter 設計: Main の `AuthStatus` と `AuthModeValidationResult` から transport DTO を作る変換関数を設計する。
- channel stability 設計: `apps/desktop/src/preload/channels.ts` の channel 名と whitelist は維持し、payload shape のみ揃える。
- selector / mount 設計: SettingsView は `store/index.ts` の個別 selector を使い続け、`useAuthModeStore` 再導入を禁止する。
- ownership 設計: shared、main、preload、renderer の責務境界を表で固定する。
- system spec 設計: Phase 12 で更新する references の章立てと更新順序を決め、`arch-state-management.md` の削除済み hook path と旧 `useRef` guard 記述を是正対象に含める。

## 参照資料

### 実装・コード

| 資料名                | パス                                                                    | 用途                                              |
| --------------------- | ----------------------------------------------------------------------- | ------------------------------------------------- |
| Phase 1 仕様          | `phase-1-requirements.md`                                               | 要件と AC を引き継ぐ                              |
| Phase 1 成果物        | `outputs/phase-1/`                                                      | drift inventory と source-of-truth map を引き継ぐ |
| Shared AuthMode 型    | `packages/shared/src/types/auth-mode.ts`                                | 正本候補を設計する                                |
| Main auth 型          | `apps/desktop/src/main/services/auth/types.ts`                          | 内部型との差分を設計する                          |
| Subscription provider | `apps/desktop/src/main/services/auth/SubscriptionAuthProvider.ts`       | subscription token guidance の供給源を確認する    |
| Main IPC handler      | `apps/desktop/src/main/ipc/authModeHandlers.ts`                         | handler adapter の差し込み点を設計する            |
| Preload API           | `apps/desktop/src/preload/index.ts`                                     | bridge API のシグネチャを設計する                 |
| Preload 型            | `apps/desktop/src/preload/types.ts`                                     | transport type の import / export 方針を決める    |
| Preload channels      | `apps/desktop/src/preload/channels.ts`                                  | channel 名と whitelist を維持する前提を確認する   |
| Renderer Slice        | `apps/desktop/src/renderer/store/slices/authModeSlice.ts`               | Renderer の依存型を設計する                       |
| Store selector        | `apps/desktop/src/renderer/store/index.ts`                              | individual selector export の維持方針を決める     |
| Settings View         | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                | mount 時の初期化と status 表示の責務を設計する    |
| SettingsView テスト   | `apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx`    | mount / 表示 contract をテスト設計へ反映する      |
| 無限ループ防止テスト  | `apps/desktop/src/renderer/__tests__/infinite-loop-prevention.test.tsx` | P31 再発防止の受け入れ条件を設計へ反映する        |
| 要件定義書            | `outputs/phase-1/requirements-definition.md`                            | Phase 1 成果物                                    |
| 受け入れ基準          | `outputs/phase-1/acceptance-criteria.md`                                | Phase 1 成果物                                    |
| 契約ドリフト台帳      | `outputs/phase-1/drift-inventory.md`                                    | Phase 1 成果物                                    |
| 公開型正本マップ      | `outputs/phase-1/source-of-truth-map.md`                                | Phase 1 成果物                                    |
| スコープ境界          | `outputs/phase-1/scope-boundary.md`                                     | Phase 1 成果物                                    |

### システム仕様（aiworkflow-requirements）

| 資料名               | パス                                                                              | 用途                                                       |
| -------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 認証仕様             | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`            | AuthMode 記載粒度を揃える                                  |
| システム IPC         | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`             | channel 仕様の到達点を決める                               |
| IPC 契約チェック     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | P23 / P32 / P42 / P44 を設計に埋め込む                     |
| IPC セキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | sender -> 構造 -> P42 -> 許可値 の順序を固定する           |
| 認証アーキテクチャ   | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md` | auth provider と auth-mode service の責務を確認する        |
| 状態管理             | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | slice と selector の境界を確認する                         |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/patterns.md`                   | SettingsView / `store/index.ts` の移行例を確認する         |
| 開発ガイドライン     | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`     | 個別 selector と `useEffect` 規約を設計に固定する          |
| コンポーネントテスト | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | renderHook と `electronAPI.authMode` mock を設計に固定する |
| エラーハンドリング   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | transport error の構造を揃える                             |

## 実行手順

1. Phase 1 の `drift-inventory.md` と `acceptance-criteria.md` を読み、 channel ごとの差分を再確認する。
2. SubAgent-Contract-Main、SubAgent-Bridge-Preload、SubAgent-Renderer-State が並列で DTO と adapter の設計案を作る。
3. `canonical-contract-design.md` と `layer-responsibility-matrix.md` で公開面の正本を固定する。
4. `error-envelope-design.md`, `shared-type-migration-plan.md`, `test-strategy.md` で実装順序と検証順序を固定する。

## 統合テスト連携

- `get -> status` の初期読込フローを 1 つの contract として固定する。
- `set -> changed -> fetchStatus` の連鎖を 1 つの event consistency として固定する。
- `validate` は `status` と同じ DTO を返す方針をテスト観点へ引き継ぐ。
- SettingsView の mount 初期化は個別 selector + 安定参照のまま保持し、無限ループ防止テストへ渡す。
- `invalid sender`, `invalid mode`, `credential missing` の 3 異常系を Main / Preload / Renderer で共通 fixture にする。

## 多角的チェック観点

| 観点            | 確認内容                                                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------------------------- |
| 正本統一        | 公開型の owner が shared 1 箇所に固定されているか                                                                     |
| Adapter 分離    | Main 内部型と公開型の境界が handler adapter に閉じているか                                                            |
| UI 完結性       | Renderer が event payload のみで画面更新できるか                                                                      |
| Selector 安定性 | SettingsView が合成 hook に戻らず P31 防止条件を維持できるか                                                          |
| エラー整合      | `code`, `message`, `guidance`, `lastCheckedAt` の扱いを固定したか                                                     |
| 仕様同期        | Phase 12 Step 2 の更新対象が設計書に書かれ、`arch-state-management.md` の古い hook path / `useRef` 記述補正も含めたか |

## 成果物

| 成果物                  | パス                                             | 説明                                          |
| ----------------------- | ------------------------------------------------ | --------------------------------------------- |
| canonical contract 設計 | `outputs/phase-2/canonical-contract-design.md`   | request / response / event の正式形           |
| 層責務表                | `outputs/phase-2/layer-responsibility-matrix.md` | shared / main / preload / renderer の責務境界 |
| error envelope 設計     | `outputs/phase-2/error-envelope-design.md`       | error union と UI 表示メッセージ規則          |
| shared 型移行計画       | `outputs/phase-2/shared-type-migration-plan.md`  | 実装順序と import 置換順序                    |
| テスト戦略              | `outputs/phase-2/test-strategy.md`               | Phase 4-11 へ渡す検証戦略                     |

## 完了条件

- [x] `canonical-contract-design.md` に `get`, `set`, `status`, `validate`, `changed` の 5 契約がある
- [x] `layer-responsibility-matrix.md` に shared / main / preload / renderer の 4 層がある
- [x] `error-envelope-design.md` に `code`, `message`, `guidance`, `lastCheckedAt` の 4 項目がある
- [x] `shared-type-migration-plan.md` に実装順序を `shared -> main -> preload -> renderer -> tests` の順で書く
- [x] `test-strategy.md` に unit, integration, manual の 3 区分があり、renderHook / `electronAPI.authMode` mock / infinite-loop prevention を含む
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. DTO 設計
2. Adapter 設計
3. 責務境界整理
4. テスト戦略整理
5. 完了条件確認

## タスク100%実行確認【必須】

- [x] Phase 1 の差分を設計へ反映した
- [x] 公開 DTO の正本を `packages/shared/src/types/auth-mode.ts` に固定した
- [x] Preload と Renderer の重複型を削る方針を書いた
- [x] system spec 更新対象の references を列挙した

## 次のPhase

Phase 3: 設計レビューゲート
