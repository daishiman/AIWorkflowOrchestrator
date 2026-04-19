# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 6                                     |
| 機能名 | TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001 |
| 作成日 | 2026-04-19                            |

## 目的

Phase 4 の基本ケースを補強し、誤前提ベースの過剰テストを排除した failure mode だけを追加する。

## 実行タスク

1. `undefined signal` と `aborted signal` の分岐を補完する
2. cleanup 契約と normal flow の非回帰を補強する
3. `createSkill(options, controller)` や `jest.spyOn` 前提の誤ケースを採用しない

## 参照資料

| 資料     | パス                                                          | 用途                   |
| -------- | ------------------------------------------------------------- | ---------------------- |
| Phase 4  | `phase-4-test-creation.md`                                    | 基本ケース             |
| 実装本体 | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | cleanup / abort 点確認 |

## 実行手順

### Step 1: 追加観点

| ID    | 観点            | 内容                                              |
| ----- | --------------- | ------------------------------------------------- |
| EX-01 | undefined guard | `signal` なしでも private workflow が正常終了する |
| EX-02 | cleanup         | 新規作成ディレクトリのみ cleanup 対象になる       |
| EX-03 | normal flow     | abort なしの create / orchestrate が非回帰である  |

## 統合テスト連携

- Phase 7 で EX-01〜EX-03 を coverage traceability に接続する
- Phase 10 で「削除した誤ケース」を review note として残す

## 成果物

- `outputs/phase-6/expanded-test-matrix.md`
- `outputs/phase-6/regression-checks.md`
- `outputs/phase-6/failure-mode-catalog.md`

## 完了条件

- [ ] 誤ったテスト前提を除去した
- [ ] cleanup / undefined / normal flow を補強した
- [ ] public flow 優先方針を維持した
