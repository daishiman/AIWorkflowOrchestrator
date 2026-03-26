# [#1410] [UT-RAG-08-008] Graph global mode での communitySummarizer 活用仕上げ

## メタ情報

```yaml
issue_number: 1410
title: [UT-RAG-08-008] Graph global mode での communitySummarizer 活用仕上げ
state: OPEN
priority: 中
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-03-20
updated_date: 2026-03-20
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1410
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`HybridRAGFactory.createFull()` から `GraphSearchStrategy` への `communitySummarizer` 配線は完了済み。残っているのは UT-RAG-08-006 の queryType 伝播と組み合わせて global query 時に community summary を実際の探索経路で活用する仕上げ。

## 仕様書

`docs/30-workflows/unassigned-task/task-rag-08-008-community-summarizer-config-extension.md`

## 受入基準

- [ ] global query で graph search が `communitySummarizer` を活用する経路を持つこと
- [ ] queryType 非伝播が解消され、必要な mode 切替が行われること
- [ ] `communitySummarizer` 未指定時の graceful degradation が明文化されていること
- [ ] 全テストが PASS すること
- [ ] `pnpm typecheck` がエラーゼロで通ること

## 依存

- 必須前提: UT-RAG-08-002 (HybridRAGFactory 実配線)
- 推奨前提: UT-RAG-08-006 (queryType 伝播)

## 苦戦箇所

config 実装済み vs 未実装の境界が曖昧で誤記されやすい。P62 準拠で暗黙 fallback は禁止。
