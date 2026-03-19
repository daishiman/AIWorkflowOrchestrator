# Phase 3: 設計レビューレポート

## メタ情報

| 項目         | 内容                                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| タスクID     | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001                                                                                |
| Phase        | 3                                                                                                                               |
| 作成日       | 2026-03-19                                                                                                                      |
| ステータス   | completed                                                                                                                       |
| レビュー対象 | Phase 1: requirements-definition.md, scope-definition.md / Phase 2: design-summary.md, contract-matrix.md, ui-ux-realization.md |

---

## 1. レビュー観点別判定（12観点）

### 観点 1: surface ごとの capability 区分の明確性

**判定: PASS**

contract-matrix.md § 1.1〜1.3 の Capability Matrix で全 21 surface を一覧化し、`api-key-only` / `api-key-required` / `not-in-scope` / `not-implemented` の 4 区分が surface 単位で明示されている。

- Index Lane 8 surface: 全て `not-in-scope` + `guidance-only fallback: yes` — 境界明確
- Embedding Lane 4 surface: 全て `api-key-only` + `guidance-only fallback: no` — 境界明確
- Search Lane 9 surface: `api-key-required` 8件 + `not-implemented` 1件（HybridRAGFactory） — 境界明確

`api-key-only` と `guidance-only` の違いも design-summary.md § 4（runtime resolver 判定ロジック）で 3 択（guidance-only / fail-fast / proceed）として定義されており、曖昧さなし。

---

### 観点 2: production mock / TODO が成功経路に残存していないか

**判定: PASS**

- AI_CHECK_CONNECTION / AI_INDEX / community handlers (6件) の production mock は、contract-matrix.md と design-summary.md の target topology table で全て「削除」「guidance-only 置換」として Phase 5 アクションに割り当て済み。
- HybridRAGFactory の `throw stub`（PM-04）は CRITICAL として P0 優先で Phase 5 に割り当て済み。
- SF-05/07/09 の silent fallback は「修正対象」と明示し、成功経路として扱われない。
- 成功経路（`proceed`）は contract-matrix.md § 4.1 条件 5「capability = supported & key = valid」のみ。

ただし、contract-matrix.md § 7.3 の CommunitySummarizer の postconditions に `"embed 失敗は warn のみ / LLM 失敗は err throw"` と記述されており、この記述が現状の実装を反映した表現として残っている（修正方針は明示されているが、postconditions には「修正後」の状態を記載すべきか「現状」を記載すべきかが曖昧）。

**MINOR 指摘 M-01**: contract-matrix.md § 7.3 CommunitySummarizer の postconditions は「embed 失敗は warn のみ」ではなく「embed 失敗は Error throw + guidance（SF-09 修正後の目標状態）」を記載すべき。現状記述が修正前の設計として残ると Phase 5 実装者が混乱する可能性がある。

---

### 観点 3: terminal surface への silent fallback が成功経路に入っていないか

**判定: PASS**

- scope-definition.md § 3（Terminal 非対応ポリシー）で NTP-01〜NTP-05 の 5 ルールが定義されている。
- design-summary.md § 6-1（必須方針）に「terminal surface への fallback 禁止」を明文化。
- ui-ux-realization.md § 3（Fail-Fast Notice 禁止事項）と § 9（禁止事項サマリー）に「terminal での代替実行を提案しない」を明示。
- contract-matrix.md § 4.1 の Runtime Resolver 判定テーブルに terminal fallback への分岐が存在しない。
- AC-03 の検証方法（grep）も scope-definition.md に記載。

---

### 観点 4: long-running index job の失敗と guidance の充足

**判定: MINOR**

**充足している点**:

- AI_INDEX の job state が `idle → queued → running → completed / failed / cancelled / blocked` の 7 状態で定義されている（contract-matrix.md § 3.1）。
- `ai:index:progress`（IPC event）/ `ai:index:cancel` の 3 channel が設計されている。
- error policy で `JOB_FAILED` / `JOB_TIMEOUT`（code 4000-4999）が定義されている。
- ui-ux-realization.md § 6 で Progress Indicator の詳細仕様（percentage / 経過時間 / 推定残り時間 / キャンセルボタン）が定義されている。

**不足している点**:

**MINOR 指摘 M-02**: AI_INDEX の `排他制御（job_already_running）` の具体的な実装方針が未定義。contract-matrix.md § 2.2 で `JOB_ALREADY_RUNNING` エラーコードが列挙されているが、どの層で排他制御を行うか（IPC ハンドラ / Service 層 / DB ロック等）が設計書上に記載がない。Phase 5 実装者が独自判断で実装するリスクがある。

**MINOR 指摘 M-03**: job state が `failed` の際の guidance message template が ui-ux-realization.md § 5 では `"処理に失敗しました"` と汎用記述になっており、AI_INDEX 固有の失敗原因（embedding provider エラー / chunk 処理失敗 / DB 書き込み失敗等）を区別する message template が未定義。

---

### 観点 5: concern topology の 3 lane 分割の妥当性

**判定: PASS**

```
Index Lane → Embedding Lane → Search Lane
```

の依存方向が一方向で設計されており、责務境界として妥当。

- Index Lane: job lifecycle 管理（IPC ハンドラ境界）
- Embedding Lane: ベクトル生成（stateless service 境界）
- Search Lane: online query orchestration（pipeline 境界）

design-summary.md § 1-2（Lane 間依存関係）で「Search Lane が Index Lane の job state を polling して内部判定してはならない」という禁止ルールも明示。3 lane が単一責務を持ち、cross-lane 結合が禁止されている。

simpler alternative 検討（§ 3 参照）で 2 lane 案も検討したが、Index の job lifecycle と Embedding の stateless vector 生成を同一 lane にまとめるとモデルが複雑化するため 3 lane が適切と判断。

---

### 観点 6: error policy が 5 パターンを網羅しているか

**判定: PASS**

contract-matrix.md § 5.1 で以下 5 パターンが定義されている:

| パターン                         | コード範囲 | リトライ |
| -------------------------------- | ---------- | -------- |
| unsupported capability           | 1000-1999  | 不可     |
| rate limit                       | 3000-3999  | 可       |
| timeout（transport 層）          | 3000-3999  | 可       |
| long-running job failure         | 4000-4999  | 不可     |
| provider failure（非 transport） | 4000-4999  | 不可     |

各パターンに UI 表示・guidance message template が対応しており、NFR-05 の retry ポリシー（最大 3 回、exponential backoff）も RETRY_POLICY 定数として定義済み。

---

### 観点 7: UI/UX 契約が ui-ux-realization.md と整合しているか

**判定: PASS**

ui-ux-realization.md § 10（上位 UI/UX 正本との対応）で、本書の各セクションが上位正本（ai-runtime-authmode-unification/ui-ux-realization.md）の該当箇所と対応付けられている。

具体的な整合確認:

- Status Row の 5 状態（queued / running / completed / failed / blocked）が contract-matrix.md § 3.1 Job State と対応
- error policy の guidance message template が ui-ux-realization.md § 5 Error Message テンプレートと一致
- Fail-Fast Notice のトリガー条件が contract-matrix.md § 4.1 Runtime Resolver 条件 1〜4 と対応
- blank state 禁止・terminal 提案禁止・API key 露出禁止が両文書で一貫

---

### 観点 8: Task01 の access matrix を消費し、独自 mode 判定が混入していないか

**判定: PASS**

- design-summary.md § 3-2（authority ルール）で「各 surface は Task01 の access matrix を参照して capability を判定する。独自の mode 判定を持たない」と明示。
- contract-matrix.md § 4.1（Runtime Resolver 判定テーブル）の条件 2 に「access matrix = none（Task01 から取得）」と明記。
- NFR-10「各 surface は Task01 の access matrix を消費し、独自 mode 判定を持たない」が requirements-definition.md に記載。
- scope-definition.md § 4（禁止事項 F-04）で「各 surface が独自 mode 判定を持つことを禁止」と明示。

実装面では Task01 access matrix の具体的な参照インターフェース（どの関数 / モジュールから取得するか）が未定義だが、本タスク（設計のみ）のスコープとして許容範囲。

---

### 観点 9: 前提条件/事後条件が contract-matrix.md で明示されているか

**判定: MINOR**

contract-matrix.md § 7（前提条件 / 事後条件）で全 21 surface の preconditions と postconditions が定義されている点は充足。

**MINOR 指摘 M-04**: HybridRAGFactory の postconditions が `"後続タスクで実装"` と記載されており、設計段階での目標事後条件が未定義。Phase 5 実装者が何を達成すれば完了かを判断する基準が不明確。少なくとも「`HybridRAGEngine` インスタンスを返す」という事後条件の明示が必要。

**MINOR 指摘 M-05**: contract-matrix.md § 7.3 の Search Lane で RelevanceEvaluator postconditions が `"JSON parse 失敗時は score=5 で継続"` と記載されており、SF-07 の「修正対象」判定（design-summary.md § 7）と矛盾している。修正後の目標状態（`Error throw`）を postconditions に記載すべき。

---

### 観点 10: IPC ハンドラの依存が具象ではなく Port/Interface 境界で記述されているか

**判定: PASS**

contract-matrix.md § 6（DI 境界表）で全 component の injected dependency が Interface 型で定義されている:

- `IEmbeddingProvider[]` / `IEmbeddingService` / `ILLMProvider` / `IQueryClassifier` / `IReranker` / `ICorrectiveRAG` / `ILLMClient`

IPC ハンドラ層（aiHandlers / communityHandlers）は「guidance-only 固定」のため依存注入なし、という設計も明示されている。

HybridRAGFactory の DI 設計も `ILLMProvider` / `IEmbeddingProvider` / `IReranker` / `ICorrectiveRAG` の Port 型で記述されており、P61（DIP 違反）の再発が防止されている。

---

### 観点 11: DI 境界表が layer ごとに整理されているか

**判定: PASS**

contract-matrix.md § 6 の DI 境界表が以下の 3 layer で整理されている:

| layer      | component 数 | 記載内容                                    |
| ---------- | ------------ | ------------------------------------------- |
| Main (IPC) | 2件          | aiHandlers, communityHandlers（依存なし）   |
| Shared     | 13件         | 全 service / pipeline / provider の DI 定義 |

lifecycle（singleton / per-request / per-provider）も各 component に明示されている。

ただし、Main Process での provider インスタンス生成（EmbeddingService への provider 配列注入）が誰の責務かが未定義。

**MINOR 指摘 M-06**: Main Process での DI 組み立て責務（EmbeddingService / HybridRAGFactory への provider 注入タイミングとオーナー）が設計書に記載されていない。AI_INDEX IPC ハンドラが EmbeddingService を呼ぶ際の配線起点が不明確で、Phase 5 実装時に独自判断が入るリスクがある。

---

### 観点 12: Phase 1 受入基準と Phase 2 設計要素の 1:1 追跡性

**判定: PASS**

Phase 1 の受入基準 AC-01〜AC-06 が Phase 2 の設計要素に 1:1 で対応している:

| AC-ID | Phase 1 受入基準                                              | Phase 2 対応設計                                             |
| ----- | ------------------------------------------------------------- | ------------------------------------------------------------ |
| AC-01 | backend AI surface ごとの capability / status を 18行以上列挙 | contract-matrix.md § 1（21 surface の Capability Matrix）    |
| AC-02 | production mock / TODO が後続 Phase 参照を持つ                | contract-matrix.md § 8（SF 是非判定）+ design-summary.md § 2 |
| AC-03 | terminal surface への silent fallback が要件に含まれない      | design-summary.md § 6-1 + contract-matrix.md § 4.1           |
| AC-04 | FR/NFR が分類され優先度が設定されている                       | requirements-definition.md § 6-7（FR 10件, NFR 10件）        |
| AC-05 | concern topology が 3 lane 以下で定義されている               | design-summary.md § 1（3 lane topology）                     |
| AC-06 | error policy が 5 パターンを網羅                              | contract-matrix.md § 5（Error Policy Matrix）                |

AC-05 が「3 lane 以下」という条件で、実際の設計が「ちょうど 3 lane」であり充足。

---

## 2. simpler alternative 検討結果

### 代替案 1: 3 lane ではなく 2 lane（Index+Embedding / Search）

**検討結果: 否定**

Index Lane と Embedding Lane を統合すると、job lifecycle（非同期・state machine）と stateless vector 生成が同一 lane に混在する。以下の理由で分割が妥当:

- Index Lane は long-running job（progress/cancel/排他制御）を持ち、状態が外部に公開される
- Embedding Lane は per-request stateless で、外部 state を持たない
- AI_INDEX が EmbeddingService を呼ぶのは依存関係として適切。同一 lane に統合する理由にはならない

### 代替案 2: capability matrix を省略し、api-key の有無のみで判定するシンプルモデル

**検討結果: 否定**

api-key 有無のみで判定すると、以下のシナリオが未処理になる:

1. api-key はあるが provider が embedding を未対応（例: テキスト生成専用プロバイダー）
2. api-key はあるが HybridRAGFactory が throw stub のまま（not-implemented）
3. surface 自体が not-in-scope（AI_CHECK_CONNECTION, community handlers）

capability matrix は 3 lane 21 surface の多様な状態を正確に表現するために必要。省略すると silent fallback が再発するリスクが高い。

### 代替案 3: production mock を即時削除せず、feature flag で段階的に切り替える

**検討結果: 条件付き許容、ただし本設計では不採用**

feature flag による段階的切り替えは有効なパターンだが、本タスクでは guidance-only 置換という「より安全な中間状態」が設計されているため不要。guidance-only 置換は:

- mock の偽データをユーザーに見せることなく
- production 環境で安全に機能不在を通知できる

feature flag より guidance-only 置換の方がシンプルかつセキュアなアプローチとして適切。

---

## 3. 契約品質チェック結果

### 3.1 前提条件/事後条件の明示状況

| lane           | surface 数 | preconditions 定義 | postconditions 定義 | 問題             |
| -------------- | ---------- | ------------------ | ------------------- | ---------------- |
| Index Lane     | 8          | 全件定義済み       | 全件定義済み        | -                |
| Embedding Lane | 4          | 全件定義済み       | 全件定義済み        | -                |
| Search Lane    | 9          | 全件定義済み       | 全件定義済み        | M-01, M-04, M-05 |

### 3.2 Port/Interface 依存（具象クラス依存の排除）

全 DI 境界が Interface 型（`IEmbeddingProvider`, `ILLMProvider` 等）で定義されており、P61（DIP 違反）パターンの再発なし。HybridRAGFactory の配線設計も `ILLMProvider`/`IEmbeddingProvider`/`IReranker`/`ICorrectiveRAG` の Port 型を使用。

### 3.3 DI 境界表の layer 整理

Main (IPC) / Shared の 2 layer で整理済み。ただし M-06 の通り、Main Process での DI 組み立て責務が未定義。

### 3.4 Phase 1 受入基準のトレーサビリティ

AC-01〜AC-06 が全て Phase 2 設計要素に 1:1 で追跡可能（観点 12 参照）。

---

## 4. MINOR 指摘追跡テーブル

| ID   | 観点    | 対象文書                 | 指摘内容                                                                        | 対応方針                                                         | 優先度 |
| ---- | ------- | ------------------------ | ------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------ |
| M-01 | 観点 2  | contract-matrix.md § 7.3 | CommunitySummarizer の postconditions に修正前の実装状態（warn のみ）が残存     | SF-09 修正後の目標状態（Error throw）を postconditions に記載    | LOW    |
| M-02 | 観点 4  | contract-matrix.md § 2.2 | AI_INDEX の排他制御の実装層（IPC / Service / DB）が未定義                       | Phase 4 テスト設計前に実装層を決定し contract-matrix.md に追記   | MEDIUM |
| M-03 | 観点 4  | ui-ux-realization.md § 5 | AI_INDEX 失敗時の guidance message template が汎用のみ（失敗原因の区別なし）    | AI_INDEX 固有の失敗パターン別 message template を追加            | LOW    |
| M-04 | 観点 9  | contract-matrix.md § 7.3 | HybridRAGFactory の postconditions が「後続タスクで実装」のみで目標状態が未定義 | 「HybridRAGEngine インスタンスを返す」を postconditions に追記   | MEDIUM |
| M-05 | 観点 9  | contract-matrix.md § 7.3 | RelevanceEvaluator postconditions が「score=5 で継続」と記載されSF-07判定と矛盾 | 修正後の目標状態（Error throw）を postconditions に記載          | LOW    |
| M-06 | 観点 11 | contract-matrix.md § 6   | Main Process での DI 組み立て責務（provider 注入タイミングとオーナー）が未定義  | Phase 4 テスト設計前に DI 起点を決定し contract-matrix.md に追記 | MEDIUM |

---

## 5. 最終判定

**判定: MINOR**

12 観点中 10 観点が PASS、2 観点（観点 4, 9）が MINOR。MAJOR / CRITICAL 判定なし。

MINOR 指摘 6 件は全て「記述の精度向上」レベルであり、設計の根幹（lane 分割・error policy・DI 境界・UI/UX 契約）には影響しない。Phase 4 テスト設計前に M-02, M-04, M-06 の 3 件（MEDIUM 優先度）を contract-matrix.md に追記することを推奨する。

---

## 6. Phase 4 開始条件の充足確認

| 条件                                                       | 状態           | 備考                                                 |
| ---------------------------------------------------------- | -------------- | ---------------------------------------------------- |
| Phase 1: AC-01〜AC-06 が全て充足されている                 | 充足           | requirements-definition.md 完了条件チェック全件 ✅   |
| Phase 2: concern topology が 3 lane で定義されている       | 充足           | design-summary.md § 1                                |
| Phase 2: error policy が 5 パターンで定義されている        | 充足           | contract-matrix.md § 5                               |
| Phase 2: DI 境界表が layer ごとに定義されている            | 充足（条件付） | M-06 の組み立て責務追記を Phase 4 前に実施           |
| Phase 2: 全 21 surface の前提条件/事後条件が定義されている | 充足（条件付） | M-01/04/05 の postconditions 修正を Phase 4 前に実施 |
| Phase 2: UI/UX 契約が ui-ux-realization.md と整合している  | 充足           | ui-ux-realization.md § 10 参照                       |
| MAJOR / CRITICAL 判定がない                                | 充足           | 全観点 PASS または MINOR                             |

**Phase 4 開始可能**。ただし M-02, M-04, M-06（MEDIUM）の 3 件を Phase 4 開始前に contract-matrix.md へ追記することを強く推奨する。M-01, M-03, M-05（LOW）は Phase 4 並行で対応可能。
