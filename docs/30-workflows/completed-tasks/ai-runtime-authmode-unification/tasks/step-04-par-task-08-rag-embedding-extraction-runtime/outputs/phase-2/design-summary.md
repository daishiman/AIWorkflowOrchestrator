# Phase 2 設計サマリー

## メタ情報

| 項目     | 内容                                                              |
| -------- | ----------------------------------------------------------------- |
| Phase    | 2                                                                 |
| タスクID | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001                  |
| 前提     | Phase 1 調査結果（Index/Embedding/Search 3 lane の gap 整理完了） |
| 作成日   | 2026-03-19                                                        |

---

## 1. concern topology（3 lane）

### 1-1. Lane 定義と責務境界

```
┌─────────────────────────────────────────────────────────────┐
│ Index Lane                                                  │
│   責務: job lifecycle 管理（queued/running/failed/blocked） │
│   surface: AI_CHECK_CONNECTION, AI_INDEX                    │
│   owner: aiHandlers.ts                                      │
│   制約: long-running job は online query と別責務          │
└──────────────────────────────┬──────────────────────────────┘
                               │ job 完了後に Embedding が利用可能
┌──────────────────────────────▼──────────────────────────────┐
│ Embedding Lane                                              │
│   責務: ベクトル生成（batch / retry / persistence）         │
│   surface: EmbeddingService, EmbeddingPipeline,             │
│            openai-provider, qwen3-provider                  │
│   制約: API key 必須、provider 切替は DI で実施            │
└──────────────────────────────┬──────────────────────────────┘
                               │ 生成済みベクトルを Search が消費
┌──────────────────────────────▼──────────────────────────────┐
│ Search Lane                                                 │
│   責務: online query pipeline の orchestration              │
│   surface: QueryClassifier, EntityExtractor,                │
│            RelationExtractor, CommunitySummarizer,          │
│            GraphRAGQueryService, HybridRAGFactory/Engine,   │
│            RelevanceEvaluator (CRAG), CrossEncoderReranker  │
│   制約: HybridRAGFactory が create stub の間は全 pipeline  │
│         が blocked。fail-fast を upward propagation する    │
└─────────────────────────────────────────────────────────────┘
```

### 1-2. Lane 間依存関係

| 依存元         | 依存先         | 方向 | 内容                                             |
| -------------- | -------------- | ---- | ------------------------------------------------ |
| Embedding Lane | Index Lane     | 下流 | AI_INDEX job 完了後にチャンクが embed 対象になる |
| Search Lane    | Embedding Lane | 下流 | Query embed に EmbeddingService を利用する       |
| Search Lane    | Index Lane     | 参照 | AI_CHECK_CONNECTION で接続確認後に query 開始    |

**禁止**: Search Lane が Index Lane の job state を polling して内部判定してはならない。

---

## 2. target topology table

| surface                   | current state                                                           | target state                        | action required                                     | priority |
| ------------------------- | ----------------------------------------------------------------------- | ----------------------------------- | --------------------------------------------------- | -------- |
| AI_CHECK_CONNECTION       | production mock (always "connected")                                    | guidance-only + not-in-scope legacy | production mock 削除、guidance メッセージ追加       | P2       |
| AI_INDEX                  | production mock (setTimeout 固定値)                                     | api-key-only + job lifecycle IPC    | mock 削除、実 job 契約実装、long-running 管理       | P1       |
| community handlers (6)    | 全て production mock                                                    | not-in-scope（削除）                | mock 削除、guidance-only 誘導 microcopy 追加        | P2       |
| IPC response 形式         | 不統一 (aiHandlers: `{success,data}` / communityHandlers: `{ok,value}`) | 統一: `{success,data,error}`        | communityHandlers 廃止に伴い自然解消                | P2       |
| EmbeddingService          | implemented (api-key-only)                                              | 変更なし（仕様差分修正のみ）        | EMB-001/002 逆転・次元数・PipelineOutput 修正       | P1       |
| EmbeddingPipeline         | implemented (api-key-only)                                              | 変更なし                            | -                                                   | -        |
| openai-provider           | implemented (api-key-only)                                              | 変更なし                            | -                                                   | -        |
| qwen3-provider            | implemented (fail-fast on missing key)                                  | 変更なし（fail-fast は設計意図）    | -                                                   | -        |
| QueryClassifier           | implemented + fallback to fallbackClassifier                            | 変更なし（SF-04 許容）              | -                                                   | -        |
| EntityExtractor           | implemented (api-key-required)                                          | 変更なし                            | -                                                   | -        |
| RelationExtractor         | implemented (api-key-required)                                          | 変更なし                            | -                                                   | -        |
| CommunitySummarizer       | embed 失敗 = console.warn のみ                                          | explicit error propagation          | console.warn → error throw + guidance (SF-09 修正)  | P1       |
| GraphRAGQueryService      | implemented + 空配列 fallback                                           | explicit error propagation          | 空配列 silent return → Error throw (SF-05 修正)     | P1       |
| HybridRAGFactory          | createFull()/createLite() = throw stub (CRITICAL)                       | implemented                         | factory stub 実装（Phase 5 最優先）                 | P0       |
| HybridRAGEngine           | implemented + silent fusions + any 型                                   | any 型排除 + 許容 fallback 明示     | any 型 (L428,442,461) 修正 (SF-06 許容、型修正)     | P1       |
| RelevanceEvaluator (CRAG) | score=5 fallback                                                        | explicit error propagation          | フォールバックスコア排除 → Error throw (SF-07 修正) | P1       |
| CrossEncoderReranker      | fusedScore fallback                                                     | 変更なし（SF-08 許容）              | -                                                   | -        |
| ILLMClient 型             | crag 独自定義 vs llm/types.ts 乖離                                      | llm/types.ts に統一                 | crag 独自 ILLMClient 型を削除、llm/types.ts 参照へ  | P1       |

**優先度**: P0 = blocking、P1 = Phase 5 必須、P2 = Phase 5 対応またはその後

---

## 3. flow 設計

### 3-1. 実行順序と authority

```
[Check Connection]
  └─ AI_CHECK_CONNECTION IPC
       ├─ guidance-only: "API key が必要です" を返す（backend job を起動しない）
       └─ not-in-scope: legacy 扱い（production mock は削除）

[Index Job]
  └─ AI_INDEX IPC
       ├─ api-key-only: EmbeddingService を利用してチャンクを処理
       ├─ job state: queued → running → completed / failed
       └─ long-running: job ID を返し、状態を polling で確認

[Embedding]
  └─ EmbeddingService (DI: openai-provider | qwen3-provider)
       ├─ api-key missing → fail-fast (throw EXTERNAL_SERVICE_ERROR)
       └─ batch retry: EmbeddingPipeline が管理

[Query Pipeline] ← online query（Index とは独立した責務）
  │
  ├─[1] QueryClassifier
  │       ├─ LLM available → full classification
  │       └─ LLM unavailable → fallbackClassifier (SF-04 許容: LLM 非依存動作保証)
  │
  ├─[2] EntityExtractor + RelationExtractor
  │       └─ api-key missing → fail-fast (throw EXTERNAL_SERVICE_ERROR)
  │
  ├─[3] CommunitySummarizer
  │       └─ embed 失敗 → Error throw + guidance (SF-09 修正: console.warn 禁止)
  │
  ├─[4] GraphRAGQueryService
  │       └─ query 失敗 → Error throw (SF-05 修正: 空配列 silent return 禁止)
  │
  ├─[5] HybridRAGFactory → HybridRAGEngine  ← CRITICAL GAP
  │       ├─ createFull() / createLite() stub 解消が最優先（P0）
  │       └─ fusion fallback (SF-06 許容: graceful degradation)
  │
  ├─[6] RelevanceEvaluator (CRAG)
  │       └─ score 計算失敗 → Error throw (SF-07 修正: score=5 fallback 禁止)
  │
  └─[7] CrossEncoderReranker
          └─ rerank 失敗 → fusedScore fallback (SF-08 許容: graceful degradation)
```

### 3-2. authority ルール

- 各 surface は Task01 の access matrix を参照して capability を判定する。
- 独自の mode 判定（provider check、API key 存在確認の二重実装）を持たない。
- terminal surface（ローカル CLI 等）を backend job の fallback として使用しない。

---

## 4. runtime resolver 判定ロジック

```
runtime_resolver(surface, context):

  Step1: Task01 access matrix 参照
    → surface に対応する capability を取得
    → "not-in-scope" の場合 → 即 guidance-only を返して終了

  Step2: provider / model capability チェック
    → provider が surface の capability を持つか確認
    → 持たない場合 → EXTERNAL_SERVICE_ERROR + guidance を返して終了

  Step3: api-key 有無チェック
    → api-key が設定されているか確認
    → 未設定の場合 → VALIDATION_ERROR (code: 1001) + "APIキーを設定してください" guidance

  Step4: 実行
    → api-key-only surface → proceed (API を呼び出す)
    → guidance-only surface → guidance block を返して終了（実行しない）
```

### 4-1. 判定結果の3択

| 結果          | 条件                                          | UI 表示                                 |
| ------------- | --------------------------------------------- | --------------------------------------- |
| guidance-only | surface が guidance-only、または not-in-scope | guidance block + "設定を開く" CTA       |
| fail-fast     | api-key 未設定、または provider 非対応        | fail-fast notice + "設定を開く" CTA     |
| proceed       | 全チェック通過                                | status row (queued/running/failed 遷移) |

---

## 5. 依存関係図

```
┌───────────────────────────────────────────────────┐
│                  Task01 (access matrix)           │
│           runtime resolver の authority 源泉       │
└──────────┬────────────────────────────────────────┘
           │ capability 参照
           ▼
┌──────────────────────┐
│     Index Lane       │
│  AI_CHECK_CONNECTION │──[guidance-only]──► UI guidance block
│  AI_INDEX            │──[api-key-only]───► EmbeddingService
└──────────┬───────────┘
           │ チャンク完了通知
           ▼
┌──────────────────────────────────────────────────┐
│                 Embedding Lane                   │
│  EmbeddingService ──► EmbeddingPipeline          │
│       │                    │                     │
│  openai-provider      qwen3-provider             │
│  (api-key-only)       (fail-fast)                │
└──────────────────────┬───────────────────────────┘
                       │ embed ベクトル
                       ▼
┌──────────────────────────────────────────────────┐
│                  Search Lane                     │
│                                                  │
│  QueryClassifier ──► [fallback OK: SF-04]        │
│       │                                          │
│       ▼                                          │
│  EntityExtractor + RelationExtractor             │
│  (api-key-only, fail-fast)                       │
│       │                                          │
│       ▼                                          │
│  CommunitySummarizer ──► [Error throw: SF-09]    │
│       │                                          │
│       ▼                                          │
│  GraphRAGQueryService ──► [Error throw: SF-05]   │
│       │                                          │
│       ▼                                          │
│  HybridRAGFactory ──► HybridRAGEngine ← P0 STUB │
│       │                    │                     │
│       │              [fusion OK: SF-06]          │
│       ▼                                          │
│  RelevanceEvaluator ──► [Error throw: SF-07]     │
│       │                                          │
│       ▼                                          │
│  CrossEncoderReranker ──► [fusedScore OK: SF-08] │
└──────────────────────────────────────────────────┘
```

---

## 6. 設計方針（禁止事項含む）

### 6-1. 必須方針

| 方針                                         | 根拠                                                                                     |
| -------------------------------------------- | ---------------------------------------------------------------------------------------- |
| terminal surface への fallback 禁止          | backend job の失敗をローカル CLI 等で代替しない。API runtime が唯一の実行経路            |
| production mock 残置禁止                     | AI_CHECK_CONNECTION / AI_INDEX / communityHandlers の mock は Phase 5 で削除             |
| 独自 mode 判定禁止                           | 各 surface は Task01 access matrix を参照し、重複判定を持たない                          |
| silent fallback → explicit error propagation | SF-05/07/09 に該当する箇所は console.warn や silent return を禁止し、Error を throw する |

### 6-2. 許容される fallback（設計意図）

| surface              | fallback           | 許容理由                                            |
| -------------------- | ------------------ | --------------------------------------------------- |
| QueryClassifier      | fallbackClassifier | SF-04: LLM 非依存動作を保証するためのデグレード     |
| HybridRAGEngine      | fusion result      | SF-06: 一部 retriever 失敗時の graceful degradation |
| CrossEncoderReranker | fusedScore         | SF-08: rerank 失敗時の graceful degradation         |

### 6-3. 修正対象（Phase 5 で対応）

| gap ID  | surface              | 問題                                          | 対応方針                            |
| ------- | -------------------- | --------------------------------------------- | ----------------------------------- |
| SF-05   | GraphRAGQueryService | 空配列を silent return                        | Error throw + guidance              |
| SF-07   | RelevanceEvaluator   | score=5 fallback（根拠不明）                  | Error throw + guidance              |
| SF-09   | CommunitySummarizer  | embed 失敗 = console.warn のみ                | Error throw + guidance              |
| CRIT-01 | HybridRAGFactory     | createFull()/createLite() = stub throw        | factory 実装（Phase 5 P0 最優先）   |
| TYPE-01 | HybridRAGEngine      | any 型使用 (L428,442,461)                     | ILLMClient 型を llm/types.ts に統一 |
| SPEC-01 | EmbeddingService     | EMB-001/002 逆転・次元数・PipelineOutput 欠落 | 仕様差分を修正                      |

---

## 7. silent fallback 判定一覧（Phase 1 SF-01〜09）

| SF-ID | surface              | 判定               | 理由                                                                    |
| ----- | -------------------- | ------------------ | ----------------------------------------------------------------------- |
| SF-01 | AI_CHECK_CONNECTION  | 修正対象           | production mock を削除し、guidance-only を返す                          |
| SF-02 | AI_INDEX             | 修正対象           | setTimeout mock を削除し、実 job lifecycle を実装                       |
| SF-03 | communityHandlers    | 修正対象（削除）   | production mock を削除、guidance-only microcopy を追加                  |
| SF-04 | QueryClassifier      | 設計意図として許容 | LLM 非依存動作を保証。fallbackClassifier はデグレードとして明示的に設計 |
| SF-05 | GraphRAGQueryService | 修正対象           | 空配列 silent return は explicit error propagation へ                   |
| SF-06 | HybridRAGEngine      | 設計意図として許容 | 一部 retriever 失敗時の graceful degradation として許容                 |
| SF-07 | RelevanceEvaluator   | 修正対象           | score=5 フォールバックの根拠が不明。Error throw へ変更                  |
| SF-08 | CrossEncoderReranker | 設計意図として許容 | rerank 失敗時の graceful degradation として許容                         |
| SF-09 | CommunitySummarizer  | 修正対象           | console.warn は検出不可能な silent failure。err + guidance へ           |

---

## 8. error policy

| エラーパターン        | コード範囲 | UI 表示                               | リカバリ手段             |
| --------------------- | ---------- | ------------------------------------- | ------------------------ |
| api-key 未設定        | 1001       | fail-fast notice + "設定を開く" CTA   | Settings 画面へ遷移      |
| provider 非対応       | 1002       | guidance block + "プロバイダを選択"   | Settings 画面へ遷移      |
| rate limit            | 3001       | status row: failed + retry 案内       | 一定時間後に再試行       |
| timeout               | 3002       | status row: failed + 再実行 CTA       | ユーザーが再実行         |
| long-running job 失敗 | 4001       | status row: failed + 詳細 CTA         | ログ確認、再実行         |
| provider failure      | 3003       | fail-fast notice + provider 切替 案内 | 別 provider を選択       |
| stub / unsupported    | 5001       | guidance block + "現在未対応" 表示    | 後続バージョンで対応予定 |

---

## 9. 統合テスト接続点

| 接続点                          | 検証内容                                                       |
| ------------------------------- | -------------------------------------------------------------- |
| AI_CHECK_CONNECTION → guidance  | production mock が削除され、guidance block が返ること          |
| AI_INDEX → EmbeddingService     | job state が queued→running→completed と遷移すること           |
| EmbeddingService → provider     | api-key 未設定時に fail-fast が発火すること                    |
| QueryClassifier → fallback      | LLM 非接続時に fallbackClassifier が使用されること             |
| GraphRAGQueryService → Error    | クエリ失敗時に空配列ではなく Error が throw されること         |
| HybridRAGFactory → createFull() | stub 解消後に factory が正しく Engine を組み立てること         |
| RelevanceEvaluator → Error      | score 計算失敗時に score=5 ではなく Error が返ること           |
| CommunitySummarizer → Error     | embed 失敗時に console.warn ではなく Error が throw されること |

---

## 完了確認

- [x] concern topology が 3 lane 以下で定義されている（Index / Embedding / Search）
- [x] target topology table が全 surface を網羅している（17 surface）
- [x] flow 設計で authority と実行順序が明示されている
- [x] runtime resolver の判定ロジックが 3 択（guidance-only / fail-fast / proceed）で定義されている
- [x] 依存関係図（ASCII art）が作成されている
- [x] 設計方針と禁止事項が明文化されている（terminal fallback 禁止、mock 残置禁止、独自 mode 判定禁止）
- [x] SF-04/06/08 が「設計意図として許容」、SF-05/07/09 が「修正対象」と判定されている
- [x] error policy が定義されている
- [x] 統合テスト接続点が列挙されている
