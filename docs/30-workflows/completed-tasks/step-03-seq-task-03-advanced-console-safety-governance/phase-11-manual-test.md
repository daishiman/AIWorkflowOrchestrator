# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 11                                              |
| Phase名    | 手動テスト                                      |
| タスクID   | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| 前提Phase  | Phase 1-10                                      |
| 後続Phase  | Phase 12（ドキュメント）                        |
| ステータス | completed                                       |
| 作成日     | 2026-03-23                                      |
| 機能名     | advanced-console-safety-governance              |

## 目的

approval、AI 開示、外部送信開示、advanced console opt-in が human walkthrough で理解可能かを確認する計画を作る。

## 実行タスク

- walkthrough シナリオ作成
- screenshot 計画作成
- discovered issues 置き場準備

## 参照資料

| 参照資料      | パス                           | 内容         |
| ------------- | ------------------------------ | ------------ |
| 依存Phase     | Phase 1-10                     | 前提成果物   |
| task 要件     | `phase-1-requirements.md`      | 受入基準定義 |
| task 設計     | `phase-2-design.md`            | 設計成果物   |
| task 実装計画 | `phase-5-implementation.md`    | 実装成果物   |
| task 回帰拡張 | `phase-6-test-expansion.md`    | テスト拡充   |
| task coverage | `phase-7-coverage-check.md`    | カバレッジ   |
| task 整理方針 | `phase-8-refactoring.md`       | リファクタ   |
| task 品質確認 | `phase-9-quality-assurance.md` | 品質検証     |
| task 最終判定 | `phase-10-final-review.md`     | 最終判定結果 |

## 実行手順

### ステップ1: 設計文書ウォークスルーを実施する

仕様書の自己完結性、型定義・インターフェースの整合、スコープ外の未タスク洗い出しを確認する。

### ステップ2: Phase 3/10 レビュー指摘との照合を行う

MINOR判定事項が全て記録されているか確認する。

### ステップ3: 後続実装タスクへの引き継ぎ情報を整理する

「型定義→実装」「契約→テスト」の引き継ぎ項目を列挙する。

## 統合テスト連携

approval 表示、AI 開示、外部送信開示、advanced console opt-in の4観点でウォークスルーを実施。

## 多角的チェック観点

- approval 表示シナリオの網羅
- AI 利用 / 外部送信開示の確認項目
- advanced console opt-in フローの確認
- discovered issues の全項目が追跡可能な形で記録されているか

## サブタスク管理

| サブタスク               | 担当 | ステータス |
| ------------------------ | ---- | ---------- |
| walkthrough シナリオ作成 | -    | -          |
| screenshot 計画作成      | -    | -          |
| discovered issues 準備   | -    | -          |

## 成果物

| 成果物             | パス                                     | 説明             |
| ------------------ | ---------------------------------------- | ---------------- |
| manual test result | `outputs/phase-11/manual-test-result.md` | walkthrough 結果 |
| manual test plan   | `outputs/phase-11/manual-test-plan.md`   | 手動確認手順     |
| screenshot plan    | `outputs/phase-11/screenshot-plan.json`  | 代表画面         |
| discovered issues  | `outputs/phase-11/discovered-issues.md`  | 発見事項         |

## 完了条件

- [ ] approval 表示の確認項目がある
- [ ] AI 利用 / 外部送信開示の確認項目がある
- [ ] advanced console opt-in の確認項目がある
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認

- [ ] walkthrough シナリオ作成完了
- [ ] screenshot 計画作成完了
- [ ] discovered issues 置き場準備完了
- [ ] manual-test-result.md 作成完了

## 次のPhase

- [Phase 12（ドキュメント）](./phase-12-documentation.md)
