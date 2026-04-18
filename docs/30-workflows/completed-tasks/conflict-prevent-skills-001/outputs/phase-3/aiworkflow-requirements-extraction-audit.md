# Phase 3 Output: aiworkflow-requirements Extraction Audit

## 抽出した正本ルール

| 観点            | 結論                                                  |
| --------------- | ----------------------------------------------------- |
| canonical root  | `.claude/skills/` が正本、`.agents/skills/` は mirror |
| generated index | merge 手当てだけでなく regenerate 導線が必要          |
| topic-map       | 行番号索引は discoverability 契約の一部               |
| close-out       | root / outputs artifacts を含む same-wave sync が必要 |

## 初期仕様との差分

| 項目           | 初期案                      | 修正後                             |
| -------------- | --------------------------- | ---------------------------------- |
| `topic-map.md` | 日付・行番号を削除          | 日付のみ対象、行番号索引は維持     |
| `EVALS.json`   | schema 変更案が混在         | 本 task では schema 不変           |
| mirror         | policy と parity 判定が曖昧 | canonical / mirror / parity を明記 |

## 維持すべき根拠

- JSON は append-only 扱いせず、短期は `keep-ours` 系 policy を優先する
- `topic-map.md` は検索・参照の入口として discoverability を落とさない
- Phase 12 close-out は artifacts parity と same-wave sync を前提にする
