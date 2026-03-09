# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 |
| Phase      | 11                                        |
| Phase名    | 手動テスト                                |
| カテゴリ   | fix                                       |
| ステータス | completed                                 |
| 前提Phase  | Phase 10                                  |
| 後続Phase  | Phase 12                                  |

## 目的

`localStorage.clear()` と `window.location.reload()` の除去後に、persist 状態が破壊されず、画面上でも `autoSyncEnabled` が reload 後に保持されることを確認する。

## 実行タスク

- タスク1: Settings 画面の初期状態を撮影し、`autoSyncEnabled=false` の開始状態を確認する
- タスク2: `autoSyncEnabled=true` に切り替えた直後の画面を撮影する
- タスク3: reload 後も `autoSyncEnabled=true` が保持されることを撮影する
- タスク4: 通常ルートで debug storage clear log / forced reload が再発していないことを metadata で確認する

## テストケース

| テストケース | 観点     | 操作                                              | 期待結果                                                                         |
| ------------ | -------- | ------------------------------------------------- | -------------------------------------------------------------------------------- |
| TC-11-UI-01  | 初期状態 | review harness を起動して Settings 画面を表示する | `自動同期を有効にする` が未チェックで表示される                                  |
| TC-11-UI-02  | 状態変更 | `自動同期を有効にする` を ON にする               | チェックボックスが ON になり、persist 状態へ `autoSyncEnabled=true` が保存される |
| TC-11-UI-03  | 永続化   | harness を reload する                            | reload 後も `自動同期を有効にする` が ON のまま表示される                        |

## 画面カバレッジマトリクス

| テストケース | 画面               | 証跡                                                          | 確認ポイント                                 |
| ------------ | ------------------ | ------------------------------------------------------------- | -------------------------------------------- |
| TC-11-UI-01  | Settings 初期表示  | `screenshots/TC-11-UI-01-settings-initial.png`                | Settings shell 表示、`autoSyncEnabled=false` |
| TC-11-UI-02  | Settings 更新直後  | `screenshots/TC-11-UI-02-autosync-enabled.png`                | `autoSyncEnabled=true` へ変更された直後      |
| TC-11-UI-03  | Settings reload 後 | `screenshots/TC-11-UI-03-autosync-persisted-after-reload.png` | reload 後も `autoSyncEnabled=true` が保持    |

## 実行手順

1. `pnpm --filter @repo/desktop run screenshot:app-debug-localstorage-clear` を実行する
2. `outputs/phase-11/screenshots/phase11-capture-metadata.json` を確認する
3. `initialNavigationType` が `navigate`、`debugLogDetected` が `false`、`storageSnapshot.state.autoSyncEnabled` が `true` であることを確認する
4. `outputs/phase-11/screenshots/*.png` の 3 枚を確認し、各 TC と一致することを確認する

## 補足検証（非視覚）

- 通常ルート (`http://localhost:5181/`) で `performance.getEntriesByType('navigation')[0].type === 'navigate'` を確認する
- metadata 上で `debugLogDetected=false` を確認し、`Clearing all storage for clean auth test` ログが再発していないことを保証する
- `skipAuthCompatibility=PASS` を確認し、既存の `skipAuth=true` 導線が壊れていないことを補足確認する

## 統合テスト連携

- `pnpm --filter @repo/desktop exec vitest run src/renderer/__tests__/App.debug-removal.test.tsx`
- `pnpm --filter @repo/desktop exec tsc --noEmit`
- `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001`

## 参照資料

| 参照資料                 | パス                                                                                                                                     |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 2 設計             | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-2-design.md`                                          |
| Phase 5 実装             | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-5-implementation.md`                                  |
| Phase 6 テスト拡充       | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-6-test-expansion.md`                                  |
| Phase 7 カバレッジ確認   | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-7-coverage-check.md`                                  |
| Phase 8 リファクタリング | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-8-refactoring.md`                                     |
| Phase 9 品質保証         | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-9-quality-assurance.md`                               |
| Phase 10 成果物          | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-10-final-review.md`                                   |
| 手動テスト結果           | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/outputs/phase-11/manual-test-result.md`                     |
| Screenshot metadata      | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/outputs/phase-11/screenshots/phase11-capture-metadata.json` |
| Phase 11/12 guide        | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                                                              |
| 状態管理設計             | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                             |

## 成果物

| 成果物             | パス                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| 手動テスト結果     | `outputs/phase-11/manual-test-result.md`                                       |
| スクリーンショット | `outputs/phase-11/screenshots/TC-11-UI-01-settings-initial.png`                |
| スクリーンショット | `outputs/phase-11/screenshots/TC-11-UI-02-autosync-enabled.png`                |
| スクリーンショット | `outputs/phase-11/screenshots/TC-11-UI-03-autosync-persisted-after-reload.png` |
| metadata           | `outputs/phase-11/screenshots/phase11-capture-metadata.json`                   |

## 完了条件

- [x] `TC-11-UI-01`〜`TC-11-UI-03` のスクリーンショットが current workflow 配下に保存されていること
- [x] metadata で `debugLogDetected=false` を確認していること
- [x] metadata で `initialNavigationType=navigate` を確認していること
- [x] metadata で `storageSnapshot.state.autoSyncEnabled=true` を確認していること
- [x] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 12: ドキュメントへ進む。
