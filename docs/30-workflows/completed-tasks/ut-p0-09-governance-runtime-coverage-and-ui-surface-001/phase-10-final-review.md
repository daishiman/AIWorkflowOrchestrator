# Phase 10: 最終レビュー

## メタ情報

| 項目   | 値                                                      |
| ------ | ------------------------------------------------------- |
| Phase  | 10                                                      |
| 機能名 | ut-p0-09-governance-runtime-coverage-and-ui-surface-001 |
| 作成日 | 2026-04-02                                              |

## 目的

受入条件（AC-1〜AC-5）の充足を確認し、Phase 11 への進行可否を判定する。

## 実行タスク

- タスク1: 受入条件チェックリスト実行
- タスク2: ゲート判定（PASS/MINOR/MAJOR/CRITICAL）

## 参照資料

| 資料名                       | パス                                    | 説明           |
| ---------------------------- | --------------------------------------- | -------------- |
| Phase 9 品質保証レポート     | `outputs/phase-9/quality-report.md`     | 品質判定の根拠 |
| Phase 8 リファクタリング記録 | `outputs/phase-8/refactoring-record.md` | 変更の収束確認 |

## 実行手順

### ステップ1: 受入条件チェックリスト

| AC   | 条件                                                             | 確認方法     | 結果 |
| ---- | ---------------------------------------------------------------- | ------------ | ---- |
| AC-1 | plan/execute/verify/improve で governance hooks が配線されている | テスト PASS  | -    |
| AC-2 | renderer に GovernanceSummaryPanel が実装されている              | コード確認   | -    |
| AC-3 | denial reason / recent denials / session summary が表示される    | UI確認       | -    |
| AC-4 | Phase 11 evidence が outputs/phase-11/ に存在する                | ファイル確認 | -    |
| AC-5 | execute-only 文言がシステム仕様から除去されている                | grep確認     | -    |

### ステップ2: Issue #1791 受入基準との照合

- [ ] plan/execute/verify/improve でも governance 適用が設計上明確化されている（コード or 仕様書）
- [ ] renderer に denial/summary 表示サーフェスが最低限実装されている
- [ ] Phase 11 evidence が存在する
- [ ] execute-only 前提の誤った文言が system spec から除去されている

## 統合テスト連携

- Phase 11 の manual test へ渡すために、受入条件の未達箇所を明文化する
- PASS/MINOR の場合でも、Phase 11 で確認すべき観点を漏れなく残す

## 成果物

| 成果物           | パス                                      | 説明                      |
| ---------------- | ----------------------------------------- | ------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | PASS/MINOR/MAJOR/CRITICAL |

## 完了条件

- [ ] 全受入条件が PASS
- [ ] ゲート判定が PASS or MINOR
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 11: 手動テスト
