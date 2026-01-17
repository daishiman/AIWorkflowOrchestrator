# Phase 13: コミット履歴

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| Phase      | 13         |
| Phase名    | PR作成     |
| 実行日     | 2026-01-14 |
| ステータス | 準備完了   |

---

## 推奨コミット構成

PR作成時は以下のコミット構成を推奨:

### Option A: 単一コミット（推奨）

```
feat(search): implement RRF Fusion + Reranking (CONV-07-05)

- Add RRFFusion and WeightedScoreFusion implementations
- Add LLM/Cohere/Voyage/NoOp Reranker implementations
- Add unit tests (47 tests)
- Add task specification documents (Phase 1-13)
```

### Option B: 機能別コミット

```
feat(search): add Fusion types and interfaces
feat(search): implement RRFFusion and WeightedScoreFusion
feat(search): add Reranker types and interfaces
feat(search): implement Cross-Encoder Rerankers
test(search): add Fusion and Reranker tests
docs(workflows): add RRF Fusion task specifications
```

---

## コミットメッセージ規約

| Prefix      | 用途             |
| ----------- | ---------------- |
| `feat:`     | 新機能           |
| `fix:`      | バグ修正         |
| `docs:`     | ドキュメント     |
| `test:`     | テスト           |
| `refactor:` | リファクタリング |

---

## 現在の変更状況

```
新規ファイル (untracked):
  docs/30-workflows/rrf-fusion-reranking/
  packages/shared/src/services/llm/
  packages/shared/src/services/search/__tests__/fusion-reranking.integration.test.ts
  packages/shared/src/services/search/fusion/
  packages/shared/src/services/search/reranking/
```

---

## 結論

コミット履歴の整理方針を記載。PR作成時に適切なコミット構成を選択する。
