# topic-map 網羅確認記録

> Phase 7 タスク1 成果物
> 作成日: 2026-04-21

## 確認コマンド

```bash
grep -n "qualityInsights" .claude/skills/aiworkflow-requirements/indexes/topic-map.md
```

## 確認結果

```
2859: | 6. qualityInsights（拡張メトリクス / writer=手動メンテ） | L128 |
```

## 網羅性チェック

topic-map のエントリは §6 全体を `L128` にリンクしている。個別フィールドは §6 テーブルから直接参照可能（セクション単位のエントリが標準形式）。

| 確認項目                                       | 状態     |
| ---------------------------------------------- | -------- |
| `qualityInsights` セクションエントリが存在する | **PASS** |
| リンク先（L128）が §6 開始位置に相当する       | **PASS** |
| 既存エントリとのフォーマット統一               | **PASS** |

## 網羅率

**topic-map 網羅率: 100%**（§6 セクション単位でエントリあり。個別フィールドは §6 テーブルから到達可能）

## 結論

topic-map 網羅確認: **PASS**
