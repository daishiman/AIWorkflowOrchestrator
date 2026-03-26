# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 7                                     |
| 機能名 | task-sdk-02-system-spec-and-path-sync |
| 作成日 | 2026-03-26                            |

## 目的

canonical docs、ledger、workflow local、validator 証跡の 4 concern が全て成果物に対応しているかを確認する。

## 実行タスク

- concern と証跡を対応付ける
- AC-1 から AC-6 の coverage を確認する
- grep / validator / manual review の重複不足を確認する

## 参照資料

| 資料名             | パス                                           | 説明                  |
| ------------------ | ---------------------------------------------- | --------------------- |
| Phase 1 要件       | `phase-1-requirements.md`                      | AC 群                 |
| Phase 6 テスト拡充 | `phase-6-test-expansion.md`                    | guard                 |
| Phase 5 成果物     | `outputs/phase-5/implementation-sequencing.md` | 実更新対象の coverage |
| Phase 6 成果物     | `outputs/phase-6/test-expansion-summary.md`    | guard coverage        |

## 実行手順

### ステップ1: concern coverage を表にする

- canonical docs
- ledger / lessons
- workflow local path
- validator / manual evidence

### ステップ2: AC coverage を表にする

- AC ごとにどの成果物で満たすかを固定する。

## 統合テスト連携

- Phase 7 では `outputs/phase-4/test-matrix.md` と `outputs/phase-6/test-expansion-summary.md` を根拠に、grep / validator / manual review の coverage gap を可視化する。
- docs-only remediation でも統合ゲートの抜けは blocker 候補として扱い、concern 単位で穴を残さない。

## 成果物

| 成果物           | パス                                  | 説明                       |
| ---------------- | ------------------------------------- | -------------------------- |
| カバレッジ確認   | `phase-7-coverage-check.md`           | coverage 判定              |
| coverage summary | `outputs/phase-7/coverage-summary.md` | concern と evidence の対応 |

## 完了条件

- [ ] 4 concern が全て証跡に対応している
- [ ] AC-1 から AC-6 の対応表がある
- [ ] coverage gap が 0 件である
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認
2. concern / AC coverage の整理
3. 統合テスト連携の確認
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が最新の成果物名と整合している
- [ ] coverage gap が 0 件である
