# Phase 3 MINOR 指摘 追跡レポート

## メタ情報

| 項目     | 内容                                             |
| -------- | ------------------------------------------------ |
| タスクID | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001 |
| Phase    | 10（最終レビュー）                               |
| 作成日   | 2026-03-19                                       |
| 追跡対象 | Phase 3 設計レビュー MINOR 指摘 M-01 〜 M-06     |

---

## 追跡結果サマリー

| ID   | 優先度 | 対象文書                 | 解決状況         | 備考                                               |
| ---- | ------ | ------------------------ | ---------------- | -------------------------------------------------- |
| M-01 | LOW    | contract-matrix.md § 7.3 | 未解決（許容）   | Phase 5 スコープ外。後続タスク委譲                 |
| M-02 | MEDIUM | contract-matrix.md § 2.2 | 未解決（要追跡） | Phase 5 実装が guidance-only のため影響保留        |
| M-03 | LOW    | ui-ux-realization.md § 5 | 未解決（許容）   | Phase 5 スコープ外。後続タスク委譲                 |
| M-04 | MEDIUM | contract-matrix.md § 7.3 | 部分解決         | Phase 5 で throw stub → guidance error に変更済み  |
| M-05 | LOW    | contract-matrix.md § 7.3 | 未解決（許容）   | Phase 5 スコープ外。後続タスク委譲                 |
| M-06 | MEDIUM | contract-matrix.md § 6   | 未解決（要追跡） | aiHandlers は guidance-only のため DI 組み立て不要 |

---

## 個別追跡

### M-01: CommunitySummarizer postconditions の記述不整合

**Phase 3 指摘内容**: contract-matrix.md § 7.3 の CommunitySummarizer の postconditions に「embed 失敗は warn のみ」と修正前の状態が記載されており、SF-09 修正後の目標状態（Error throw）を記載すべき。

**Phase 5 後の状態**:

- `community-summarizer.ts` に SF-09 対応のログ強化が実施済み（implementation-log.md 参照）
- ただし contract-matrix.md § 7.3 の postconditions 記述自体は更新されていない
- Phase 5 の実装は guidance-only スタブ化（communityHandlers）であり、CommunitySummarizer への直接変更は SF-09 ログ強化のみ

**解決状況**: 未解決

- contract-matrix.md は設計文書であり、Phase 5 実装ログに PostConditions 更新の記録なし
- Phase 12 spec sync の対象として追跡継続

**Phase 10 対応**: Phase 10 MINOR として未タスク化

---

### M-02: AI_INDEX 排他制御の実装層未定義

**Phase 3 指摘内容**: AI_INDEX の「排他制御（job_already_running）」の具体的な実装方針が未定義。IPC ハンドラ / Service 層 / DB ロックのどの層で行うか未記載。

**Phase 5 後の状態**:

- Phase 5 では AI_INDEX は guidance-only スタブに変換された（aiHandlers.ts L200-216）
- 実際の AI_INDEX job 実装は Phase 5 スコープ外（U-02: HybridRAGFactory 実配線が別タスク）
- 排他制御の実装は後続の AI_INDEX 実装タスクで設計する必要あり

**解決状況**: 未解決（保留）

- 現時点では AI_INDEX が guidance-only のため排他制御の実装自体が発生しない
- ただし AI_INDEX 実装タスクへの設計インプットとして M-02 の内容は有効
- 後続タスク（U-02 対応時）で必ず再確認が必要

**Phase 10 対応**: Phase 10 MINOR として未タスク化（後続実装タスク向け）

---

### M-03: AI_INDEX 失敗時の guidance message 汎用化

**Phase 3 指摘内容**: AI_INDEX 失敗時の guidance message template が「処理に失敗しました」と汎用のみ。embedding provider エラー / chunk 処理失敗 / DB 書き込み失敗等の区別が未定義。

**Phase 5 後の状態**:

- Phase 5 では AI_INDEX は guidance-only スタブ。失敗原因の細分化は現時点では不要
- guidance message は「AI_INDEX は現在利用できません。RAG インデックス機能は今後のリリースで対応予定です。」の固定文言（qa-checklist.md Task 6）
- 失敗パターン別の message template は AI_INDEX 実装タスクで設計する必要あり

**解決状況**: 未解決（保留）

- guidance-only フェーズでは単一メッセージが適切
- AI_INDEX 実装タスクで設計する内容

**Phase 10 対応**: Phase 10 MINOR として未タスク化（後続実装タスク向け）

---

### M-04: HybridRAGFactory postconditions が目標状態未定義

**Phase 3 指摘内容**: HybridRAGFactory の postconditions が「後続タスクで実装」のみで、「HybridRAGEngine インスタンスを返す」という目標事後条件が未記載。

**Phase 5 後の状態**:

- Phase 5 で HybridRAGFactory の `createFull()/createLite()` は throw stub から guidance error（`FACTORY_NOT_READY`）に変更済み（implementation-log.md 参照）
- 具体的な変更内容: `throw new Error("not implemented")` → `throw new Error("FACTORY_NOT_READY: HybridRAGFactory は現在利用できません")`
- HybridRAGEngine インスタンスを返す本実装は U-02 として後続タスクに委譲済み

**解決状況**: 部分解決

- throw stub が guidance error に変換され、エラーの意図が明示的になった
- ただし postconditions に「HybridRAGEngine インスタンスを返す」という目標記述の追加は未対応
- Phase 12 spec sync で contract-matrix.md を更新する必要あり

**Phase 10 対応**: Phase 10 MINOR として未タスク化（Phase 12 spec sync 対象）

---

### M-05: RelevanceEvaluator postconditions と SF-07 判定の矛盾

**Phase 3 指摘内容**: RelevanceEvaluator の postconditions が「JSON parse 失敗時は score=5 で継続」と記載されており、SF-07「修正対象」判定と矛盾。修正後の目標状態（Error throw）を記載すべき。

**Phase 5 後の状態**:

- Phase 5 で RelevanceEvaluator には SF-07 fallback ログ追加が実施済み（implementation-log.md）
- ただし実装は「score=5 + warn ログ出力」（テストマトリクス S-08 Green state）であり、Error throw ではない
- Phase 2 設計 design-summary.md § 7 では「SF-07: 修正対象（score=5 fallback 禁止）」と記載
- Phase 2 設計と Phase 5 実装に乖離が発生している

**解決状況**: 未解決（乖離あり）

- Phase 2 design では「Error throw」を目標としていたが、Phase 5 実装は「score=5 + warn ログ」に留まった
- テストマトリクス S-08 の Green state が「score=5 + warn ログ」として設計されており、Phase 4 で誤って目標が変更された可能性
- Phase 12 spec sync で contract-matrix.md の postconditions を実装事実に合わせて更新するか、別タスクで Error throw 実装を追加するかを判断が必要

**Phase 10 対応**: Phase 10 MINOR として未タスク化（設計意図と実装の乖離を記録）

---

### M-06: Main Process DI 組み立て責務の未定義

**Phase 3 指摘内容**: Main Process での DI 組み立て責務（EmbeddingService / HybridRAGFactory への provider 注入タイミングとオーナー）が設計書に記載されていない。

**Phase 5 後の状態**:

- Phase 5 の aiHandlers.ts は guidance-only スタブであり、EmbeddingService / HybridRAGFactory への DI は発生しない
- AI_CHECK_CONNECTION / AI_INDEX は guidance-only を返すのみで、実際のサービス呼び出しをしない
- DI 組み立ての必要が生じるのは U-02（HybridRAGFactory 実配線）の実装時

**解決状況**: 未解決（保留）

- guidance-only フェーズでは DI 組み立ての実装自体が不要
- AI_INDEX 実装タスク（U-02）で必ず解決が必要

**Phase 10 対応**: Phase 10 MINOR として未タスク化（後続実装タスク向け）

---

## Phase 3 MINOR 解決率

| 状態           | 件数 | 対象                         |
| -------------- | ---- | ---------------------------- |
| 解決済み       | 0    | -                            |
| 部分解決       | 1    | M-04                         |
| 未解決（保留） | 5    | M-01, M-02, M-03, M-05, M-06 |

**部分解決 1件、未解決 5件** — 全件を Phase 10 MINOR として未タスク仕様書に変換する。

ただし:

- M-02/03/06 は AI_INDEX 実装タスク（後続）の設計インプットとして委譲
- M-01/04/05 は Phase 12 spec sync（contract-matrix.md 更新）の対象として委譲
