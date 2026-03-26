# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 9                                     |
| 機能名 | task-sdk-02-system-spec-and-path-sync |
| 作成日 | 2026-03-26                            |

## 目的

docs-only remediation の品質基準、主要リスク、validator 実行条件を最終整理する。

## 実行タスク

- 品質基準を固定する
- 主要リスクと対策を列挙する
- validator 実行条件を固定する

## 参照資料

| 資料名                   | パス                                           | 説明           |
| ------------------------ | ---------------------------------------------- | -------------- |
| Phase 4 テスト作成       | `phase-4-test-creation.md`                     | validator 群   |
| Phase 8 リファクタリング | `phase-8-refactoring.md`                       | 正規化済み前提 |
| Phase 5 成果物           | `outputs/phase-5/implementation-sequencing.md` | QA 対象        |

## 実行手順

### ステップ1: 品質基準を固定する

- 未完了表現 0 件
- old path 0 件
- validator PASS
- parity drift 0 件

### ステップ2: リスクを固定する

- canonical target 漏れ
- ledger / lessons 片落ち
- parentWorkflow stale
- mirror parity 漏れ

## 統合テスト連携

- Phase 9 では grep / validator / parity 確認の合格条件を品質基準として再掲し、Phase 10 の最終判定を数値化する。
- docs-only remediation のためテスト対象は文書と導線だが、失敗時はコード変更と同等に blocker 扱いとする。

## 成果物

| 成果物     | パス                            | 説明         |
| ---------- | ------------------------------- | ------------ |
| 品質保証   | `phase-9-quality-assurance.md`  | QA 基準      |
| qa summary | `outputs/phase-9/qa-summary.md` | リスクと対策 |

## 完了条件

- [ ] 品質基準 4 件が定義されている
- [ ] 主要リスク 4 件が定義されている
- [ ] validator 実行条件が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認
2. 品質基準とリスクの固定
3. 統合テスト連携の確認
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が最新の成果物名と整合している
- [ ] Phase 10 へ渡す gate 条件が固定されている
