# Phase 1 SubAgent 分担表

| SubAgent   | 主責務                             | 入力                          | 出力                                 | 並列可否           |
| ---------- | ---------------------------------- | ----------------------------- | ------------------------------------ | ------------------ |
| SubAgent-A | 要件固定、Gate 判定、Phase 10 判定 | 親タスク仕様、aiworkflow 正本 | Phase 1/3/10 文書                    | B/C/D と並列調査可 |
| SubAgent-B | UI/状態/移行設計、Phase 5/8 実装   | Phase 1 要件、現行 UI         | Phase 2/5/8 文書とコード             | C と並列           |
| SubAgent-C | テスト設計、回帰、coverage/QA      | Phase 2 設計、実装差分        | Phase 4/6/7/9 文書とテスト           | B と並列           |
| SubAgent-D | 手動検証、証跡、Phase 12 同期      | Phase 4 計画、Phase 10 判定   | Phase 11/12 文書とスクリーンショット | B/C の結果待ち     |

## 重複禁止

- A と B:
  - 設計判断の正本は B、Gate 判定は A
- B と C:
  - TC-ID の命名は C、実装都合で変更しない
- C と D:
  - Phase 11 の証跡名は C の計画に D が従う
