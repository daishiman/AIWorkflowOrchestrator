# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 6                                         |
| 機能名     | TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001 |
| タスク名   | auth-mode 回帰テスト拡充                  |
| 作成日     | 2026-03-06                                |
| ステータス | completed                                 |

## 目的

Red テストを Green に反転した後、Main / Preload / Renderer をまたぐ回帰ケースと event regression を追加し、契約ドリフト再発を検出できる状態にする。

## 背景

このタスクは public shape の更新だけでなく event payload の更新を含む。単体テストだけでは drift の再発条件を取り切れない。

## SubAgentチーム編成

| SubAgent                | 担当関心               | 実行形態 | Phase 6 の責務                       |
| ----------------------- | ---------------------- | -------- | ------------------------------------ |
| SubAgent-Contract-Main  | handler / adapter 回帰 | 並列     | 正常系と異常系を追加する             |
| SubAgent-Bridge-Preload | bridge / fixture 回帰  | 並列     | shared DTO を使う fixture を固定する |
| SubAgent-Renderer-State | slice / UI 回帰        | 並列     | event と fetch 系の再取得を固定する  |
| SubAgent-Spec-Sync      | cross-layer 監査       | 直列統合 | cross-layer test result をまとめる   |

## 実行タスク

- 正常系拡充: `get`, `status`, `validate`, `changed` が canonical DTO で通るケースを追加する。
- 異常系拡充: invalid sender、invalid mode、credential missing、storage error を追加する。
- fixture 統一: Main / Preload / Renderer が同じ payload 名を使う共通 fixture を作る。
- event regression: `set` 後の `changed` event と `fetchStatus` 再取得が一致するケースを固定する。
- selector stability regression: SettingsView mount、AuthModeSelector interaction、`infinite-loop-prevention.test.tsx` を回帰対象に含める。

## 参照資料

### 実装・コード

| 資料名                   | パス                                                                                                 | 用途                                        |
| ------------------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Phase 4 仕様             | `phase-4-test-creation.md`                                                                           | Red テスト観点を確認する                    |
| Phase 5 仕様             | `phase-5-implementation.md`                                                                          | 実装順序を確認する                          |
| Phase 4 成果物           | `outputs/phase-4/`                                                                                   | Red テスト名を確認する                      |
| Phase 5 成果物           | `outputs/phase-5/`                                                                                   | changed files と migration order を確認する |
| Main handler テスト      | `apps/desktop/src/main/ipc/__tests__/authModeHandlers.test.ts`                                       | 回帰テスト追加位置                          |
| Main handler 異常系      | `apps/desktop/src/main/ipc/__tests__/authModeHandlers.error.test.ts`                                 | 異常系追加位置                              |
| Renderer slice テスト    | `apps/desktop/src/renderer/store/slices/__tests__/authModeSlice.test.ts`                             | event regression 追加位置                   |
| Renderer slice 異常系    | `apps/desktop/src/renderer/store/slices/__tests__/authModeSlice.error.test.ts`                       | error path 追加位置                         |
| Selector テスト          | `apps/desktop/src/renderer/store/slices/__tests__/authModeSlice.selectors.test.ts`                   | renderHook 回帰追加位置                     |
| SettingsView テスト      | `apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx`                                 | mount / 表示回帰追加位置                    |
| AuthModeSelector テスト  | `apps/desktop/src/renderer/components/settings/AuthModeSelector/__tests__/AuthModeSelector.test.tsx` | interaction 回帰追加位置                    |
| 無限ループ防止テスト     | `apps/desktop/src/renderer/__tests__/infinite-loop-prevention.test.tsx`                              | P31 再発回帰追加位置                        |
| Redテストマトリクス      | `outputs/phase-4/red-test-matrix.md`                                                                 | Phase 4 成果物                              |
| Main IPC Redテスト       | `outputs/phase-4/main-ipc-red-tests.md`                                                              | Phase 4 成果物                              |
| Preload bridge Redテスト | `outputs/phase-4/preload-bridge-red-tests.md`                                                        | Phase 4 成果物                              |
| Renderer slice Redテスト | `outputs/phase-4/renderer-slice-red-tests.md`                                                        | Phase 4 成果物                              |
| Integration Redテスト    | `outputs/phase-4/integration-red-tests.md`                                                           | Phase 4 成果物                              |
| 実装計画                 | `outputs/phase-5/implementation-plan.md`                                                             | Phase 5 成果物                              |
| 変更ファイル計画         | `outputs/phase-5/changed-files-plan.md`                                                              | Phase 5 成果物                              |
| 移行順序                 | `outputs/phase-5/migration-order.md`                                                                 | Phase 5 成果物                              |
| ロールバック計画         | `outputs/phase-5/rollback-plan.md`                                                                   | Phase 5 成果物                              |

### システム仕様（aiworkflow-requirements）

| 資料名               | パス                                                                              | 用途                                                |
| -------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------- |
| IPC 契約チェック     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | regression 観点を揃える                             |
| IPC セキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | sender failure の回帰観点を揃える                   |
| 品質要件             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | coverage 目標の最低線を確認する                     |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/patterns.md`                   | `useAuthModeStore` 非推奨化の回帰観点を固定する     |
| 開発ガイドライン     | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`     | 個別 selector / `useEffect` 回帰観点を固定する      |
| コンポーネントテスト | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | happy-dom / `electronAPI` mock の回帰観点を固定する |
| lessons learned      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`            | 過去の drift 再発条件を確認する                     |

## 実行手順

1. Phase 4 の Red テスト一覧を読み、 Green 化したケースと不足ケースを分ける。
2. SubAgent-Contract-Main、SubAgent-Bridge-Preload、SubAgent-Renderer-State が並列で回帰ケースを追加する。
3. `contract-fixtures.md` に shared DTO ベースの fixture と event payload を記録する。
4. `cross-layer-test-result.md` に Main / Preload / Renderer の通過結果を統合する。

## 統合テスト連携

- `get -> status` の初期表示フローを integration case として固定する。
- `set -> changed -> fetchStatus` の event consistency を integration case として固定する。
- invalid sender が validation より先に遮断されることを integration case として固定する。
- `validate(mode?)` が current mode と指定 mode の両方で同じ DTO を返すことを固定する。
- SettingsView mount が個別 selector のまま初期化され、無限ループ防止テストを通ることを固定する。

## 多角的チェック観点

| 観点            | 確認内容                                                                  |
| --------------- | ------------------------------------------------------------------------- |
| 回帰密度        | 正常系と異常系の両方が channel 単位で揃っているか                         |
| fixture 一貫性  | 3 層で同じ payload 名を使っているか                                       |
| event 一貫性    | event payload と status DTO が同一 shape か                               |
| 障害分類        | sender, validation, credential, storage の 4 系統を分けているか           |
| Selector 安定性 | SettingsView / `store/index.ts` / renderHook テストが同時に壊れていないか |
| 監査証跡        | cross-layer pass / fail が 1 ファイルにまとまっているか                   |

## 成果物

| 成果物               | パス                                            | 説明                                 |
| -------------------- | ----------------------------------------------- | ------------------------------------ |
| 回帰テスト拡充       | `outputs/phase-6/regression-test-expansion.md`  | 追加した回帰ケース一覧               |
| 共通 fixture         | `outputs/phase-6/contract-fixtures.md`          | shared DTO ベースの payload 一覧     |
| event 回帰 checklist | `outputs/phase-6/event-regression-checklist.md` | event consistency の確認項目         |
| cross-layer 結果     | `outputs/phase-6/cross-layer-test-result.md`    | Main / Preload / Renderer の通過結果 |

## 完了条件

- [x] `regression-test-expansion.md` に正常系と異常系の両方がある
- [x] `contract-fixtures.md` に `get`, `status`, `validate`, `changed` の payload がある
- [x] `event-regression-checklist.md` に `set -> changed -> fetchStatus` の直列確認がある
- [x] `cross-layer-test-result.md` に Main / Preload / Renderer の 3 層結果がある
- [x] selector / SettingsView / infinite-loop prevention の回帰を少なくとも 1 件ずつ含める
- [x] sender failure と credential missing を別ケースで記録する
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 正常系回帰追加
2. 異常系回帰追加
3. fixture 統一
4. event 回帰整理
5. cross-layer 結果統合

## タスク100%実行確認【必須】

- [x] Red から漏れた回帰ケースを補完した
- [x] 3 層で同じ fixture を使う方針を固定した
- [x] event regression を個別成果物で残した
- [x] cross-layer の結果を集約した

## 次のPhase

Phase 7: テストカバレッジ確認
