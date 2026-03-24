# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 11                                        |
| Phase名    | 手動テスト                                |
| タスクID   | TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001 |
| 前提Phase  | Phase 1-10                                |
| 後続Phase  | Phase 12（ドキュメント）                  |
| ステータス | completed                                 |
| 作成日     | 2026-03-23                                |
| 機能名     | session-dock-artifact-bridge              |

## 目的

session open / close / reopen、artifact summary、manual share が human walkthrough で理解可能かを確認する計画を作る。

## 実行タスク

- walkthrough シナリオ作成
- screenshot 計画作成
- discovered issues 置き場準備

## 参照資料

| 参照資料        | パス                           | 内容                       |
| --------------- | ------------------------------ | -------------------------- |
| Phase 1 成果物  | `phase-1-requirements.md`      | task 要件（依存Phase）     |
| Phase 2 成果物  | `phase-2-design.md`            | task 設計（依存Phase）     |
| Phase 5 成果物  | `phase-5-implementation.md`    | task 実装計画（依存Phase） |
| Phase 6 成果物  | `phase-6-test-expansion.md`    | task 回帰拡張（依存Phase） |
| Phase 7 成果物  | `phase-7-coverage-check.md`    | task coverage（依存Phase） |
| Phase 8 成果物  | `phase-8-refactoring.md`       | task 整理方針（依存Phase） |
| Phase 9 成果物  | `phase-9-quality-assurance.md` | task 品質確認（依存Phase） |
| Phase 10 成果物 | `phase-10-final-review.md`     | task 最終判定（依存Phase） |

## 実行手順

### ステップ1: walkthrough シナリオを作成する

session open / close / reopen、artifact summary 確認、manual share と provenance 確認のシナリオを記述する。

### ステップ2: screenshot 計画を作成する

代表画面の一覧を screenshot-plan.json に記録する（P53 対策: CLI 環境では Playwright / webContents.capturePage() で代替可能）。

### ステップ3: discovered issues を記録する

発見事項と改善提案を discovered-issues.md に記録する。

## 統合テスト連携

手動テストで発見された issue のうち、スコープ外のものは Phase 12 の未タスク検出に引き継ぐ。

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 適用判断                                | 仕様参照先                                   |
| ------------------ | --------------------------------------- | -------------------------------------------- |
| UI/UX              | dock / artifact / share の surface 設計 | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | session state / store 設計              | `aiworkflow-requirements: architecture-*.md` |
| セキュリティ       | transcript share / provenance           | `aiworkflow-requirements: security-*.md`     |
| エラーハンドリング | aborted state / restore failure         | `aiworkflow-requirements: error-handling.md` |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## 成果物

| 成果物            | パス                                    | 説明         |
| ----------------- | --------------------------------------- | ------------ |
| manual test plan  | `outputs/phase-11/manual-test-plan.md`  | 手動確認手順 |
| screenshot plan   | `outputs/phase-11/screenshot-plan.json` | 代表画面     |
| discovered issues | `outputs/phase-11/discovered-issues.md` | 発見事項     |

## 完了条件

- [ ] reopen restore の walkthrough がある
- [ ] artifact-first の確認項目がある
- [ ] manual share と provenance の確認項目がある
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次のPhase

- [Phase 12（ドキュメント）](./phase-12-documentation.md)
