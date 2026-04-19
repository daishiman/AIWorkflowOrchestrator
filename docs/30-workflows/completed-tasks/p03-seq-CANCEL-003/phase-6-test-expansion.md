# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 6                                 |
| タスクID   | TASK-SW-CANCEL-003                |
| 機能名     | skill-creator-cancel-main-handler |
| 前提Phase  | Phase 5                           |
| 後続Phase  | Phase 7                           |
| 作成日     | 2026-04-15                        |
| ステータス | pending                           |

## 目的

基本回帰確認の後に、null-safe、register/unregister の対、`AbortSignal` 調査結果に関わる補助テスト観点を追加する。

## 背景

cancel 系は happy path よりも fail-safe と state reset が重要である。Phase 6 では、新規機能追加ではなく、「将来 drift しやすい点」を押さえるための補助テストを追加する。

## 実行タスク

### タスク0: edge case 追加

**目的**: null-safe と reset を固定する。

**実行手順**:

1. `currentAbortController` が `null` の場合の安全性を確認する。
2. abort 後に controller が再利用されないことを確認する。
3. `finally` reset の観点を補助テストへ追加する。

**期待される成果物**:

- `outputs/phase-6/test-expansion-record.md`

### タスク1: handler 対称性確認

**目的**: register/unregister の対を固定する。

**実行手順**:

1. `ipcMain.handle` と `ipcMain.removeHandler` の channel 対称性を確認する。
2. `SKILL_CREATOR_CANCEL` が既存 handler 群の naming と整合しているか確認する。

**期待される成果物**:

- `outputs/phase-6/test-expansion-record.md`

### タスク2: 調査結果の反映

**目的**: `AbortSignal` consumer 調査を後続 task に引き継げる形で残す。

**実行手順**:

1. Renderer 側で signal がどう扱われるかを要約する。
2. CANCEL-004 側へ引き継ぐ点を整理する。

**期待される成果物**:

- `outputs/phase-6/test-expansion-record.md`

## 参照資料

| 参照資料                         | パス                                                                                | 内容           |
| -------------------------------- | ----------------------------------------------------------------------------------- | -------------- |
| Phase 1 調査レポート             | `outputs/phase-1/abort-signal-usage-report.md`                                      | consumer 調査  |
| Phase 4 テスト設計               | `outputs/phase-4/test-design.md`                                                    | test matrix    |
| Phase 5 差分確認                 | `outputs/phase-5/implementation-summary.md`                                         | 補修要否       |
| SkillCreatorService回帰テスト    | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService-cancel.test.ts` | Phase 4 成果物 |
| skillCreatorHandlers回帰テスト   | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers-cancel.test.ts`           | Phase 4 成果物 |
| SkillCreatorService実装確認対象  | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                       | Phase 5 成果物 |
| skillCreatorHandlers実装確認対象 | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                                 | Phase 5 成果物 |

## 成果物

| 成果物         | パス                                       | 内容                            |
| -------------- | ------------------------------------------ | ------------------------------- |
| テスト拡充記録 | `outputs/phase-6/test-expansion-record.md` | edge case、対称性、引き継ぎ事項 |

## 統合テスト連携【必須】

| 判定項目                                  | 基準 | 結果    |
| ----------------------------------------- | ---- | ------- |
| edge case が整理されている                | 完了 | pending |
| register/unregister 対称性を確認している  | 完了 | pending |
| CANCEL-004 への引き継ぎ事項を記録している | 完了 | pending |

## 完了条件

- [ ] edge case を整理している
- [ ] handler 対称性を確認している
- [ ] 後続 task への引き継ぎ事項を記録している
- [ ] outputs に記録を残している
