# Phase 10: 最終レビュー

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 10                                    |
| 機能名 | task-sdk-02-system-spec-and-path-sync |
| 作成日 | 2026-03-26                            |

## 目的

Phase 1-9 の成果物が remediation 実行準備として十分か、Blocker なしで判定する。

## 実行タスク

- acceptance を最終判定する
- blocker / minor / deferred を分類する
- Phase 11 へ渡す手動レビュー観点を固定する

## 参照資料

| 資料名         | パス                                              | 説明         |
| -------------- | ------------------------------------------------- | ------------ |
| Phase 1 要件   | `phase-1-requirements.md`                         | AC           |
| Phase 2 成果物 | `outputs/phase-2/canonical-sync-target-matrix.md` | same-wave 順 |
| Phase 5 成果物 | `outputs/phase-5/implementation-sequencing.md`    | 実更新対象   |
| Phase 9 QA     | `phase-9-quality-assurance.md`                    | 基準         |

## 実行手順

### ステップ1: acceptance 判定

- AC-1 から AC-6 が evidence と結び付いているかを見る。

### ステップ2: deferred 判定

- commit / PR / push は blocked のまま残す。

## 統合テスト連携

- Phase 10 では `outputs/phase-4/test-matrix.md` と `outputs/phase-9/qa-summary.md` を基に、grep / validator / parity の最終判定を一本化する。
- docs-only remediation のため code test 再実行は不要だが、文書導線の失敗は blocker として扱う。

## 成果物

| 成果物               | パス                                       | 説明                   |
| -------------------- | ------------------------------------------ | ---------------------- |
| 最終レビュー         | `phase-10-final-review.md`                 | gate 判定              |
| final review summary | `outputs/phase-10/final-review-summary.md` | PASS / MINOR / BLOCKER |

## 完了条件

- [ ] blocker が 0 件である
- [ ] deferred が commit / PR / push のみである
- [ ] Phase 11 の手動レビュー観点が固定されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認
2. acceptance / blocker / deferred の判定
3. 統合テスト連携の確認
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が最新の成果物名と整合している
- [ ] Phase 11 へ引き継ぐ観点が固定されている
