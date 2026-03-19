# Phase 1: スコープ定義 - 成果物

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| タスクID   | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001 |
| Phase      | 1                                                |
| 作成日     | 2026-03-19                                       |
| ステータス | completed                                        |

---

## 1. 対象範囲

### 1.1 対象 Surface（21 surface）

#### Index Lane (8 surface)

| surface                | 対象理由                                           |
| ---------------------- | -------------------------------------------------- |
| AI_CHECK_CONNECTION    | legacy 互換残置方針の明示、guidance-only 設計      |
| AI_INDEX               | long-running job contract 設計、guidance-only 設計 |
| COMMUNITY_GET_ALL      | production mock の guidance 置換設計               |
| COMMUNITY_GET_BY_LEVEL | production mock の guidance 置換設計               |
| COMMUNITY_GET_BY_ID    | production mock の guidance 置換設計               |
| COMMUNITY_GET_MEMBERS  | production mock の guidance 置換設計               |
| COMMUNITY_GET_SUMMARY  | production mock の guidance 置換設計               |
| COMMUNITY_SEARCH       | production mock の guidance 置換設計               |

#### Embedding Lane (4 surface)

| surface                 | 対象理由                                                          |
| ----------------------- | ----------------------------------------------------------------- |
| EmbeddingService        | runtime capability (api-key-only) の明示、fallback chain 設計確認 |
| EmbeddingPipeline       | batch/retry の runtime 統合確認                                   |
| OpenAIEmbeddingProvider | API key 前提の capability 明示、仕様差分解消                      |
| Qwen3EmbeddingProvider  | API key 前提の capability 明示、仕様差分解消                      |

#### Search Lane (9 surface)

| surface                   | 対象理由                                                      |
| ------------------------- | ------------------------------------------------------------- |
| LLMQueryClassifier        | api-key-required の capability 明示、fallback 判定明文化      |
| LLMEntityExtractor        | api-key-required の capability 明示、fail-fast 確認           |
| LLMRelationExtractor      | api-key-required の capability 明示、fail-fast 確認           |
| CommunitySummarizer       | api-key-required の capability 明示、embed 失敗 guidance 設計 |
| GraphRAGQueryService      | api-key-required の capability 明示、fallback 判定明文化      |
| HybridRAGEngine           | api-key-required の capability 明示、stage 別 fallback 設計   |
| HybridRAGFactory          | CRITICAL: throw stub の配線設計                               |
| RelevanceEvaluator (CRAG) | api-key-required の capability 明示、fallback score 判定      |
| CrossEncoderReranker      | api-key-required の capability 明示、reranker variant 設計    |

### 1.2 concern topology (3 lane)

| lane           | concern                                                             | 判断ポイント                                    |
| -------------- | ------------------------------------------------------------------- | ----------------------------------------------- |
| Index Lane     | AI_CHECK_CONNECTION, AI_INDEX, community handlers                   | job lifecycle, long-running, mock -> guidance   |
| Embedding Lane | embedding service, pipeline, providers                              | API key 前提, provider 切替, batch/retry        |
| Search Lane    | classifier, extraction, graph, GraphRAG, HybridRAG, CRAG, reranking | online query pipeline, orchestration, fail-fast |

---

## 2. 除外範囲

### 2.1 明示的に除外する項目

| 除外項目                                                | 理由                                                                                |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| AI_CHECK_CONNECTION の実装置換                          | legacy 互換残置方針により、`llm:check-health` が primary。guidance 設計のみ対象     |
| AI_INDEX の RAG 実装                                    | RAG index 実装は別タスクスコープ。job contract 設計のみ対象                         |
| community handlers の実サービス実装                     | mock -> 本番実装の置換は別タスク。guidance-only 設計のみ対象                        |
| embedding provider の新規追加 (cohere / voyage / local) | 仕様に記載ありだが、現行は openai / qwen3 のみ。設計で拡張ポイントを明示するのみ    |
| HybridRAGFactory の実配線実装                           | 配線設計は対象だが、依存モジュール完成前の実装は不可。設計 + throw -> guidance 置換 |
| UI コンポーネント実装                                   | 設計タスク (type: design)。UI/UX 契約の定義のみ                                     |
| Renderer 側コード変更                                   | backend AI surface の runtime ルールを Main/shared に限定                           |

### 2.2 本タスクで「設計のみ」行い実装は後続タスクに委譲する項目

| 項目                             | 設計内容                                       | 後続タスク種別         |
| -------------------------------- | ---------------------------------------------- | ---------------------- |
| HybridRAGFactory 配線            | createFull()/createLite() の依存注入設計       | 実装タスク             |
| production mock の guidance 置換 | guidance レスポンス形式と message 設計         | 実装タスク             |
| AI_INDEX job contract            | progress/cancel/排他制御のインターフェース設計 | 実装タスク             |
| IPC response 形式統一            | `{success,data}` への統一方針                  | 実装タスク             |
| EMB-001/002 逆転解消             | 仕様書 or 実装のどちらを正とするかの判定       | 仕様更新 or 実装タスク |

---

## 3. Terminal 非対応ポリシー

### 3.1 基本方針

**backend AI surface は terminal surface への fallback を一切持たない。**

| ルール | 内容                                                                                 |
| ------ | ------------------------------------------------------------------------------------ |
| NTP-01 | API runtime 接続が backend AI job の唯一の実行経路である                             |
| NTP-02 | terminal surface や consumer subscription を backend job の fallback に使わない      |
| NTP-03 | index job と online query は別責務として扱い、terminal に逃がさない                  |
| NTP-04 | 各 surface は Task01 の access matrix を消費し、独自の mode 判定を持たない           |
| NTP-05 | unsupported capability 時は fail-fast + guidance で応答し、terminal 実行を提案しない |

### 3.2 判定理由

backend AI 機能（embedding生成、エンティティ抽出、グラフ要約、検索パイプライン等）は以下の理由で terminal 実行に適さない:

1. **バッチ処理**: embedding 生成は大量チャンクの逐次処理であり、terminal の対話的実行モデルに合わない
2. **パイプライン依存**: HybridRAG は query classification -> search -> fusion -> reranking -> CRAG の多段パイプラインであり、terminal コマンドの単発実行に分解できない
3. **状態管理**: index job は progress / cancel / 排他制御が必要であり、terminal では管理できない
4. **API key セキュリティ**: Main Process でのみ API key を扱う設計原則に反する

### 3.3 検証方法

```bash
# terminal fallback が存在しないことを確認
grep -rn "fallback.*terminal\|terminal.*fallback" \
  apps/desktop/src/main/ipc/aiHandlers.ts \
  apps/desktop/src/main/ipc/communityHandlers.ts \
  packages/shared/src/services/embedding/ \
  packages/shared/src/services/search/ \
  packages/shared/src/services/extraction/ \
  packages/shared/src/services/graph/
# 期待結果: 0 件
```

---

## 4. 禁止事項（Task08 スコープ内）

| #    | 禁止事項                                                                          | 根拠                                   |
| ---- | --------------------------------------------------------------------------------- | -------------------------------------- |
| F-01 | silent fallback 禁止: API key 不足・capability 未充足時に見かけ上の成功を返さない | pack index.md, quality-requirements.md |
| F-02 | terminal を integrated runtime の代替として使用禁止                               | pack index.md                          |
| F-03 | production mock を設計上の残置として許可しない                                    | index.md 設計方針                      |
| F-04 | 各 surface が独自 mode 判定を持つことを禁止 (Task01 access matrix を消費)         | pack index.md                          |
| F-05 | API key 実値を UI / command / error へ露出しない                                  | security-electron-ipc.md               |
| F-06 | hidden prompt injection 禁止                                                      | ui-ux-realization.md                   |
| F-07 | blank state 禁止: unavailable 時も理由と次アクションを示す                        | ui-ux-realization.md                   |
| F-08 | progress 不明のまま放置禁止: running 時は中断手段を示す                           | ui-ux-realization.md                   |

---

## 5. 完了条件チェック

- [x] 対象範囲が 3 lane x 21 surface で定義されている
- [x] 除外範囲が明示されている（実装除外、設計のみ対象の項目が列挙）
- [x] terminal 非対応ポリシーが 5 ルールで定義されている
- [x] 禁止事項が 8 項目で整理されている
- [x] 検証方法が定義されている
- [x] 本 Phase 内の全タスクを 100% 実行完了
