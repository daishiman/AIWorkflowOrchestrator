# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 11                                             |
| Phase名    | 手動テスト                                     |
| タスクID   | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| 前提Phase  | Phase 1-10                                     |
| 後続Phase  | Phase 12（ドキュメント）                       |
| ステータス | spec_created                                   |
| 作成日     | 2026-03-23                                     |
| 機能名     | guided-execution-shell-foundation              |

## 目的

front naming、route、CTA が human walkthrough で理解可能かを確認するための manual test 計画を作る。

## 実行タスク

- walkthrough シナリオ作成
- screenshot 計画作成
- discovered issues 置き場準備

## 参照資料

| 参照資料 | パス                           | 内容          |
| -------- | ------------------------------ | ------------- |
| Phase 1  | `phase-1-requirements.md`      | 要件定義      |
| Phase 2  | `phase-2-design.md`            | 設計契約      |
| Phase 5  | `phase-5-implementation.md`    | 実装計画      |
| Phase 6  | `phase-6-test-expansion.md`    | 回帰拡張      |
| Phase 7  | `phase-7-coverage-check.md`    | coverage 確認 |
| Phase 8  | `phase-8-refactoring.md`       | 整理方針      |
| Phase 9  | `phase-9-quality-assurance.md` | 品質確認      |
| Phase 10 | `phase-10-final-review.md`     | 最終判定      |

## 実行手順

### ステップ1: walkthrough シナリオを作成する

App Shell / Chat / Workspace / Skill Creator それぞれから `実行コンソール` を開く手順を定義する。

### ステップ2: screenshot 計画を作成する

front に `terminal` が主表示されない画面、CTA ボタンのラベルが統一されている画面を撮影対象に含める。

### ステップ3: discovered issues 置き場を準備する

手動テストで発見した不整合は `outputs/phase-11/discovered-issues.md` に記録する（0件でも作成必須）。

## 統合テスト連携

front naming / route / CTA の human walkthrough 結果を Phase 12 のドキュメント更新に引き継ぐ。

## 成果物

| 成果物            | パス                                    | 説明         |
| ----------------- | --------------------------------------- | ------------ |
| manual test plan  | `outputs/phase-11/manual-test-plan.md`  | 手動確認手順 |
| screenshot plan   | `outputs/phase-11/screenshot-plan.json` | 代表画面     |
| discovered issues | `outputs/phase-11/discovered-issues.md` | 発見事項     |

## 完了条件

- [ ] App Shell / Chat / Workspace / Skill Creator が walkthrough に含まれている
- [ ] front に raw terminal が主表示されない確認項目がある
- [ ] discovered issues の置き場が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 12（ドキュメント）](./phase-12-documentation.md)
