# Phase 1: 受入条件テーブル

作成日: 2026-04-02

## 受入条件

| #    | 受入条件                                                      | 確認方法                                       | 現状               |
| ---- | ------------------------------------------------------------- | ---------------------------------------------- | ------------------ |
| AC-1 | plan / verify / improve で governance hooks が正しく呼ばれる  | `RuntimeSkillCreatorFacade.ts` の確認 + テスト | コード上は確認済み |
| AC-2 | renderer に GovernanceSummaryPanel が実装されている           | コンポーネント実装確認                         | 未実装             |
| AC-3 | denial reason / recent denials / session summary が表示される | UI 設計レビュー                                | 未実装             |
| AC-4 | Phase 11 evidence が `outputs/phase-11/` に存在する           | ファイル存在確認                               | 未収集             |
| AC-5 | execute-only 文言がシステム仕様から除去されている             | grep 確認                                      | 残存               |

## 判定メモ

- AC-1 は issue 本文の前提よりも current facts を優先し、コードと仕様の乖離を是正対象として扱う。
- AC-2 〜 AC-5 は Phase 5 以降の実装・更新で解消する。
