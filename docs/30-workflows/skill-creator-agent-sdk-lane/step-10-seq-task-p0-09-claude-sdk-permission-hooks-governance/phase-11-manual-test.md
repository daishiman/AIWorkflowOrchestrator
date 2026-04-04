# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 11                                     |
| 機能名 | claude-sdk-permission-hooks-governance |
| 作成日 | 2026-03-29                             |

## 目的

phase ごとの tool policy と denial 表示、hook 記録を手動確認する。

## 実行タスク

- plan の read-only 確認
- execute の限定 write 確認
- denial / audit 表示確認
- docs/spec 中心の manual walkthrough 判定
- 必要時のみ representative screenshot へ昇格

## 参照資料

| 資料名            | パス                                                                             | 説明             |
| ----------------- | -------------------------------------------------------------------------------- | ---------------- |
| Phase 10          | `phase-10-final-review.md`                                                       | 最終レビュー     |
| Phase 11 template | `.claude/skills/task-specification-creator/references/phase-template-phase11.md` | manual test 正本 |

## 実行手順

### ステップ1: 判定種別を確認する

- 設計タスクか docs-only task かを確認する
- UI 実装がない場合は `NON_VISUAL` を基本とする

### ステップ2: manual walkthrough を実施する

- 参照リンクの到達性を確認する
- skill 準拠の記録欄が揃っているか確認する

### ステップ3: evidence を整理する

- `manual-test-result.md`
- `manual-test-report.md`
- `discovered-issues.md`
- 必要時のみ screenshot / coverage matrix

## 成果物

| 成果物             | パス                                     | 説明     |
| ------------------ | ---------------------------------------- | -------- |
| manual test result | `outputs/phase-11/manual-test-result.md` | 手動確認 |
| manual test report | `outputs/phase-11/manual-test-report.md` | 実施概要 |
| discovered issues  | `outputs/phase-11/discovered-issues.md`  | 発見事項 |

## 完了条件

- [x] 手動確認が完了している
- [x] docs-only / NON_VISUAL の判定が明記されている
- [x] 必要時の screenshot 昇格方針が明記されている
- [x] **本Phase内の全タスクを100%実行完了**

## 統合テスト連携

- Phase 10 の最終レビュー結果と manual walkthrough の所見を突合する
- Phase 12 の未タスク検出へ引き渡す発見事項を整理する

## 多角的チェック観点（AIが判断）

- 参照リンクの到達性が保たれているか
- docs-only task としての扱いが妥当か
- `manual-test-result.md` だけでなく所見・発見事項が残るか

## サブタスク管理

| SubAgent   | 責務               |
| ---------- | ------------------ |
| SubAgent-A | 文書ウォークスルー |
| SubAgent-B | evidence 整理      |
| SubAgent-C | 発見事項分類       |

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.jsonが更新されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

Phase 12: ドキュメント更新
