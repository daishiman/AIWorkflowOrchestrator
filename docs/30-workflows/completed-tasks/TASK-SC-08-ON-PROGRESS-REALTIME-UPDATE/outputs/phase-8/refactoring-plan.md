# Phase 8 成果物: リファクタリング計画

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| タスク     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE |
| Phase      | 8                                      |
| 作成日     | 2026-04-19                             |
| ステータス | 完了                                   |

## 概要

本タスクの変更内容（`PHASE_TO_STAGE`マップへの4エントリ追加）は最小変更で完了しており、
リファクタリングが必要な重大な問題は検出されなかった。
以下に各対象の分析結果を記録する。

## 対象1: PHASE_TO_STAGEマップの重複チェック

| 項目                        | 内容                                                                                                                                   |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 対象                        | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`                                                                              |
| 分析結果                    | 追加した4エントリ（`"loading-skill"`, `"analyzing"`, `"engine-selection"`, `"improving"`）はそれぞれ異なるキーを持ち、意味論的重複なし |
| collaborativeオーバーラップ | collaborativeモードはcreateと同じphase名を使用するが、これは意図的な共有設計（overlap非該当）                                          |
| 判定                        | リファクタリング不要。コメントでcollaborative共有設計の意図を明示することを推奨                                                        |
| 変更                        | なし                                                                                                                                   |

**詳細分析:**

```
PHASE_TO_STAGE = {
  // createモード（既存）
  "planning": "planning",
  "generating-skill": "generating-skill",
  "generating-agents": "generating-agents",
  "validating": "validating",
  "done": "done",
  // update/orchestrateモード追加（新規 - 重複なし）
  "loading-skill": "planning",    // updateモード固有キー
  "analyzing": "planning",        // updateモード固有キー
  "engine-selection": "planning", // orchestrate/updateモード固有キー
  // improve-promptモード追加（新規 - 重複なし）
  "improving": "generating-skill" // improve-promptモード固有キー
}
```

全キーがユニークであることを確認済み。重複なし。

## 対象2: モード別phaseメッセージ文字列の定数化要否

| 項目           | 内容                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------- |
| 対象           | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`                                                     |
| 調査結果       | `"loading-skill"`, `"analyzing"`, `"engine-selection"`, `"improving"`の各文字列はマップキーの単一箇所のみ使用 |
| 他ファイル重複 | Main/Preload/テストファイルに同文字列リテラルが存在するが、それはphaseメッセージ値として別の文脈で使用        |
| 判定           | 定数化の便益がコスト（共有ファイル追加・インポート変更）を上回らない。現状維持                                |
| 変更           | なし                                                                                                          |

## 対象3: マッピングロジックの純粋関数切り出し要否

| 項目         | 内容                                                                                            |
| ------------ | ----------------------------------------------------------------------------------------------- |
| 対象         | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`                                       |
| 現状         | `PHASE_TO_STAGE[phase] ?? "planning"` のフォールバックロジックがHook内で使用されている          |
| 切り出し評価 | ロジックが1行（マップルックアップ＋nullish coalescing）のため、純粋関数化の複雑度増加リスクあり |
| 判定         | 現時点ではHook内インラインが適切。将来フェーズが10以上に増えた場合に再評価                      |
| 変更         | なし                                                                                            |

## 変更内容テーブル（全対象）

| 対象                          | 問題の有無 | リファクタリング内容 | 変更ファイル |
| ----------------------------- | ---------- | -------------------- | ------------ |
| PHASE_TO_STAGE重複エントリ    | なし       | 不要                 | なし         |
| モード別phaseメッセージ文字列 | なし       | 不要（単一箇所確認） | なし         |
| マッピングロジック責務分離    | なし       | 不要（1行ロジック）  | なし         |

## 結論

本タスクはPHASE_TO_STAGEマップへの4エントリ追加という最小変更で要件を満たしており、
追加のリファクタリングは不要。Phase 9（品質保証）への移行可。
