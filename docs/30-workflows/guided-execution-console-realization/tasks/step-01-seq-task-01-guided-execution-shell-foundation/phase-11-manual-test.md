# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 11                                             |
| Phase名    | 手動テスト                                     |
| タスクID   | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| 前提Phase  | Phase 1-10                                     |
| 後続Phase  | Phase 12（ドキュメント）                       |
| ステータス | not_started                                    |
| 作成日     | 2026-03-23                                     |
| 機能名     | guided-execution-shell-foundation              |

## 目的

front naming、route、CTA が human walkthrough で理解可能かを確認するための manual test 計画を作る。

## 実行タスク

- walkthrough シナリオ作成
- screenshot 計画作成
- discovered issues 置き場準備

## 参照資料

- 依存Phase: Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10
- task 要件: `phase-1-requirements.md`
- task 設計: `phase-2-design.md`
- task 実装計画: `phase-5-implementation.md`
- task 回帰拡張: `phase-6-test-expansion.md`
- task coverage: `phase-7-coverage-check.md`
- task 整理方針: `phase-8-refactoring.md`
- task 品質確認: `phase-9-quality-assurance.md`
- task 最終判定: `phase-10-final-review.md`

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
