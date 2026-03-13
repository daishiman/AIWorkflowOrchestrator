# Phase 10 最終レビュー報告

## メタ情報

| 項目         | 内容                                         |
| ------------ | -------------------------------------------- |
| タスクID     | TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001 |
| Phase        | 10 - 最終レビュー                            |
| 作成日       | 2026-03-13                                   |
| ステータス   | completed                                    |
| レビュー対象 | Phase 1-7 全成果物（Phase 8/9 は未作成）     |
| レビュー観点 | 9 観点（後述）                               |

---

## 総合判定: PASS (MINOR 指摘 4 件)

MAJOR / CRITICAL 指摘は 0 件。Phase 1-7 の成果物は要件・設計・テスト仕様・実装計画・回帰計画・カバレッジ計画の全層で一貫しており、Phase 11（手動テスト）への進行を承認する。

Phase 8（リファクタリング）/ Phase 9（品質検証）は未作成だが、本タスク（Task01）は仕様確定タスクであり実装コードを含まないため、Phase 8/9 の対象は Phase 12 でのドキュメント品質改善に限定される。レビュー対象としては Phase 1-7 で十分である。

---

## Phase 横断レビュー

### 要件 <-> 設計の整合性

**判定: PASS**

- Phase 1 の Surface Inventory（M1-M12, R1-R9, B1-B6 = 27 surface）が Phase 2 の contract-matrix.md Section 3.5「Surface 別 Runtime 対応表」で全件カバーされている。
- Phase 1 の Capability 5 区分定義（integrated-api / terminal-handoff / terminal-only / guidance-only / stub/todo）が Phase 2 の AIAccessCapability 型（`integratedRuntime` / `terminalSurface` / `both` / `none`）に正規化されている。5 区分から 4 値への変換は design-summary.md の AIAccessCapabilityResolver 判定ロジックで明示されており、`guidance-only` と `stub/todo` は `none` + guidance 付き error として表現される設計で要件を充足している。
- Phase 1 の制約事項 C1-C7 が Phase 2 の Fallback ルール禁止事項（4 項目）および Terminal 契約の禁止操作（5 項目）で全件カバーされている。

### 設計 <-> テスト仕様の整合性

**判定: PASS**

- Phase 2 の 3 Resolver（AIAccessCapabilityResolver, AIRuntimeResolver, CredentialProvider）の入出力契約が Phase 4 テストマトリクスの C1 カテゴリ（契約テスト 14 件）で全件検証対象になっている。
- Phase 2 の Fail-Fast Error 型（5 段階: Capability評価 / Provider解決 / Credential取得 / Adapter生成 / 実行）が Phase 4 の C2 カテゴリ（失敗系テスト 10 件）で TC-C201 ~ TC-C210 として検証対象になっている。
- Phase 2 の Cache Clear 条件テーブル（4 トリガー）が Phase 4 の C3 カテゴリ（回帰系テスト 8 件）で TC-C304 ~ TC-C307 として検証対象になっている。
- Phase 2 の Terminal 禁止操作（5 項目）が Phase 4 の IPC セキュリティテスト観点で検証対象になっている。

### 設計 <-> 実装計画の整合性

**判定: PASS**

- Phase 2 の Resolver 構造（AIAccessCapabilityResolver / AIRuntimeResolver / CredentialProvider）が Phase 5 の Step 1-4 で同一の配置先（`apps/desktop/src/main/services/ai/`）に実装される計画になっている。
- Phase 2 の 6 段階解決順（Step 1-6）が Phase 5 の 8 Step 実装順序にマッピングされている。Phase 2 Step 1（Legacy Migration）= Phase 5 Step 3、Phase 2 Step 2-5（Capability/Runtime/Credential/Adapter）= Phase 5 Step 1-2 + 4-5、Phase 2 Step 6（Terminal Availability）= Phase 5 Step 8 で対応関係が成立している。
- Phase 5 の DI 順序が Phase 2 の 3 層責務設計（Renderer Preflight / Preload Transport / Main Authority）と整合しており、下位レイヤから上位レイヤへの積み上げ順が維持されている。

### テスト仕様 <-> カバレッジ計画の整合性

**判定: PASS**

- Phase 4 のテストファイル配置計画（8 ファイル）が Phase 7 の対象ファイル x カバレッジ計画（Section 2.1-2.2）で全件カバーされている。
- Phase 7 のカバレッジ目標（新規: Line 90% / Branch 70% / Function 90%、変更: Line 80% / Branch 60% / Function 80%）がプロジェクト標準（02-code-quality.md）の最低基準を満たしている。
- Phase 7 の不足リスク分析（Section 3）が Phase 4 のテストケースでカバーされていない分岐を具体的に特定し、対策を提示している。

---

## 各レビュー観点の詳細判定

### 観点 1: 全 surface が要件定義に含まれ、capability/resolver の割り当てに矛盾がないか

**判定: PASS**

Phase 1 の 27 surface（M1-M12, R1-R9, B1-B6）に対して、Phase 2 contract-matrix.md Section 3.5 の Surface 別 Runtime 対応表で `integratedRuntime` / `terminalSurface` / fail-fast 時の動作が全件定義されている。Backend surface（B1-B6）は terminal 不可（`integratedRuntime` のみ）として正しく分類されており、制約 C4（backend AI job を terminal へ逃がさない）と整合している。

### 観点 2: IPC/state/runtime 契約の一貫性が保たれているか

**判定: PASS**

- IPC: contract-matrix.md の 6 カテゴリ（Capability系 / Runtime系 / Credential系 / Legacy AuthMode系 / Terminal系 / Selected Config系）の全チャンネルに Authority = Main が指定されており、制約 C5（UI authority の一元管理）が遵守されている。
- State: contract-matrix.md Section 2 の Main State（7 key）と Renderer State（5 key）の Owner / Update Trigger / Consumer が明示されており、State 更新フロー（Section 2.3）で 4 トリガーの一連の更新順序が定義されている。
- Runtime: design-summary.md の Resolver 契約（3 Resolver）が contract-matrix.md Section 3.1 で入出力・キャッシュポリシー・失敗時動作として再掲されており、矛盾がない。

### 観点 3: UI マイクロコピー / guidance contract が surface 間で統一されているか

**判定: PASS**

ui-ux-realization.md Section 3 のマイクロコピー契約で、実行経路の表現（3 パターン）、状態説明の表現（5 パターン）、Transcript 連携の表現（4 パターン）が統一語彙で定義されている。禁止表現も併記されており、surface ごとに異なる表現が使用されるリスクが低減されている。特に「terminal を開く」の統一（「CLI を起動」「シェルを開く」等の画面ごとの別名を禁止）が明示されている。

### 観点 4: テストマトリクスが要件のすべての GAP を検証対象としているか

**判定: PASS (MINOR 1 件)**

Phase 1 で検出された主要 GAP が Phase 4 テストマトリクスで検証対象になっている:

| GAP                                               | Phase 4 対応テスト         |
| ------------------------------------------------- | -------------------------- |
| M1: legacy authMode toggle と capability の不整合 | TC-C112, TC-C113, TC-C114  |
| M3: terminal fallback 導線なし                    | TC-C103, TC-C206           |
| M4: AI_CHECK_CONNECTION の stub                   | TC-C204 (adapter 生成失敗) |
| M6/M7: provider 固定                              | TC-C106, TC-C107, TC-C108  |
| R2: authMode 概念自体が legacy                    | TC-C301 (mode 変更回帰)    |
| R8: capability card 未実装                        | TC-C111 (Settings mapping) |

**MINOR-04**: Phase 1 の Backend surface（B1-B6: RAG / Embedding / Entity Extraction / Graph Summary / CRAG / Reranking）は全て `stub/todo` であり、Phase 4 テストマトリクスでは TC-C105（RAG surface は terminal 不可）と TC-C206（RAG で terminal handoff 要求時エラー）のみがカバーしている。B2-B6 個別の stub 状態に対する検証は含まれていないが、これは Phase 1 scope-definition.md E8 で Task09 に委譲されている項目であり、本タスクのスコープ外である。ただし、B2-B6 が B1 と同一の capability 判定ロジックを共有することを明示するテスト（例: `surfaceId: 'embedding'` でも `integratedRuntime` のみ）の追加が望ましい。

### 観点 5: 実装計画が設計の resolver 構造と一致しているか

**判定: PASS**

Phase 5 の 8 Step 実装順序が Phase 2 の 3 Resolver + 3 層責務設計と完全に対応している（詳細は「設計 <-> 実装計画の整合性」セクション参照）。DI パターン選択も P34（遅延初期化が必要な依存オブジェクトの DI パターン選択）準拠で SkillExecutor / AgentExecutor に Setter Injection を適用しており、既知の落とし穴への対策が組み込まれている。

### 観点 6: 回帰計画が既存テストとの衝突を考慮しているか

**判定: PASS (MINOR 1 件)**

Phase 6 の回帰計画は 4 カテゴリ（mode 変更 / cache invalidation / guidance 表示 / terminal availability）に分割され、依存関係に基づく実行順序が定義されている。テストファイルは既存テストと別ファイル（`.regression.test.ts` / `.cache.test.ts` / `.guidance.test.ts`）に配置される計画であり、既存テストへの影響は最小限に抑えられている。

**MINOR-05**: Phase 6 の回帰テスト合計 43 件と Phase 4 の契約テスト合計 38 件の間で、一部テストケースの重複がある（例: mode 変更回帰の MR-01 ~ MR-03 と契約テストの TC-C112 ~ TC-C113 は同一の migration ロジックを検証している）。テストの重複自体は品質上の問題ではないが、Phase 6 の回帰テストファイル配置計画で「Phase 4 契約テストとの棲み分け基準」が明示されていない。回帰テストは「イベント駆動の伝播経路」を検証し、契約テストは「個別 Resolver の入出力」を検証するという区別を明文化しておくことが望ましい。

### 観点 7: カバレッジ計画が Phase 7 の基準を満たす計画になっているか

**判定: PASS**

Phase 7 のカバレッジ目標は新規ファイル（Line 90% / Branch 70% / Function 90%）と変更ファイル（Line 80% / Branch 60% / Function 80%）に分類されており、プロジェクト標準の最低基準（Line 80% / Branch 60% / Function 80%）を全ファイルで満たす計画になっている。不足リスクの分析（Branch 4 箇所 / Function 3 箇所 / Line 2 箇所）と対策が具体的に記載されており、Phase 6 へのフィードバックループ（目標値未達時の Phase 6 戻り）も定義されている。

### 観点 8: Phase 3 MINOR 指摘が後続 Phase で対応されているか

**判定: PASS (MINOR 1 件)**

Phase 3 の 3 件の MINOR 指摘の追跡結果は下記「Phase 3 MINOR 指摘の追跡結果」セクションで詳述。

**MINOR-06**: Phase 3 MINOR-01（PermissionResolver の責務帰属先）について、Phase 5 実装計画では AIAccessCapabilityResolver と AIRuntimeResolver の 2 Resolver のみが実装対象として記載されており、preflight の配置先は「Step 7: skillExecutionAuthPreflight を capability 判定に変更」で Renderer 側の変更として扱われている。Phase 3 の改善提案（「preflight は AIAccessCapabilityResolver の出力を消費する downstream 処理」という注記追加）が Phase 2 設計サマリーに反映されていない。後続タスク（Task04）の設計で確定可能な範囲であるため MINOR にとどめるが、Phase 12 の未タスク候補として記録する。

### 観点 9: セキュリティ原則（sender 検証、secret masking、fail-fast）が全レイヤーで一貫しているか

**判定: PASS**

- **sender 検証**: contract-matrix.md の IPC セキュリティ共通ルールで「全ハンドラで validateIpcSender を実行する」が明記されている。Phase 4 の IPC セキュリティテスト観点で `ai:get-capability`, `ai:resolve-runtime`, `ai:get-all-capabilities` の sender 検証が検証対象になっている。Phase 1 で検出された aiHandlers / chatEditHandlers の sender 検証不足は scope-definition.md E12 で Task03/06 に委譲されている。
- **secret masking**: contract-matrix.md Section 1.3 で `auth-key:exists` が boolean のみ返し key 値を含まないこと、Phase 2 設計サマリーで「credential は Main Process に留め Renderer には渡さない」が明記されている。Phase 4 の IPC セキュリティテスト観点で credential 非送信が検証対象になっている。
- **fail-fast**: Phase 2 の Fail-Fast ルール（5 段階）が contract-matrix.md Section 3.4 の FailFastError 型として定義され、Phase 4 の C2 カテゴリ（10 件）と Phase 6 の guidance 表示回帰（11 件）で検証対象になっている。Silent Stub Fallback 禁止が TC-C210 で、Silent Terminal Fallback 禁止が制約 C2 + TC-C206 で検証されている。

---

## Phase 3 MINOR 指摘の追跡結果

| Phase 3 ID | 指摘内容                                               | 後続 Phase での対応状況                                                                                                                                          | 判定                                  |
| ---------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| MINOR-01   | PermissionResolver（preflight）の責務帰属先が未明示    | Phase 5 Step 7 で skillExecutionAuthPreflight を capability ベースに変更する計画が記載されている。ただし Phase 2 設計サマリーへの注記追加は未実施                | 部分対応（MINOR-06 として追跡継続）   |
| MINOR-02   | Phase 12 で更新すべき system spec の候補リストが未記載 | Phase 10 仕様書（phase-10-final-review.md）の参照資料に 6 ファイルが列挙されている。Phase 3 改善提案の 5 ファイル候補とは別リストだが、Phase 12 実行時に統合可能 | 対応済み（Phase 12 で実行可能）       |
| MINOR-03   | 未タスク化の基準が未定義                               | Phase 1 scope-definition.md E1-E12 が事実上の未タスク候補リスト。Phase 3 改善提案の 3 基準（重複判定 / 新規 gap / 0 件報告）は Phase 12 標準フローで対応可能     | 対応済み（Phase 12 標準フローに委譲） |

---

## MINOR 指摘一覧

| ID       | 観点   | 指摘内容                                                                                                                                                                                                                                           | 影響度 | 対応方針                                                                                                                                             |
| -------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| MINOR-04 | 観点 4 | Backend surface B2-B6（Embedding / Entity Extraction / Graph Summary / CRAG / Reranking）が B1（RAG）と同一の capability 判定ロジックを共有することを確認するテストケースが Phase 4 テストマトリクスに含まれていない                               | 低     | Task09（RAG Pipeline）の Phase 4 で個別 surface のテストを追加する。本タスクでは TC-C105 で RAG surface の代表テストが存在するため blocking ではない |
| MINOR-05 | 観点 6 | Phase 4 契約テストと Phase 6 回帰テストの棲み分け基準（契約テスト = 個別 Resolver 入出力、回帰テスト = イベント駆動伝播経路）が明文化されていない                                                                                                  | 低     | Phase 12 のドキュメント更新で Phase 4 / Phase 6 の冒頭に棲み分け基準を注記する。テスト実行上の問題はない                                             |
| MINOR-06 | 観点 8 | Phase 3 MINOR-01（PermissionResolver の責務帰属先）の改善提案が Phase 2 設計サマリーに反映されていない                                                                                                                                             | 低     | Phase 12 の未タスク候補として記録し、Task04（Skill/Agent）設計時に確定する                                                                           |
| MINOR-07 | 横断   | Phase 8（リファクタリング）/ Phase 9（品質検証）の成果物が未作成。本タスクは仕様確定タスクのため実装コードがなく、Phase 8/9 の対象は限定的だが、Phase 1-7 のドキュメント品質改善（用語統一、クロスリファレンス整備）を Phase 12 で実施すべきである | 低     | Phase 12 Task 1（implementation-guide.md）作成時に用語統一とクロスリファレンスを整備する                                                             |

---

## 未タスク候補の検出

| ID    | 候補内容                                                           | 検出元   | 後続タスクとの重複              | 未タスク化要否                |
| ----- | ------------------------------------------------------------------ | -------- | ------------------------------- | ----------------------------- |
| UT-01 | Backend surface B2-B6 の個別 capability テスト追加                 | MINOR-04 | Task09（RAG Pipeline）と重複    | 不要（Task09 で対応）         |
| UT-02 | PermissionResolver の責務帰属先の Phase 2 設計サマリーへの注記追加 | MINOR-06 | Task04（Skill/Agent）で確定予定 | 不要（Task04 で対応）         |
| UT-03 | Phase 4 / Phase 6 テスト棲み分け基準の明文化                       | MINOR-05 | 該当なし                        | 要検討（Phase 12 で対応可能） |

Phase 1 scope-definition.md E1-E12 と照合した結果、MINOR 指摘 4 件は全て既存の後続タスクまたは Phase 12 で対応可能であり、新規の未タスク仕様書作成は不要と判断する。UT-03 は Phase 12 Task 3（documentation-changelog.md）で記録する。

---

## Phase 11 への Handoff 確認

| 確認項目                                        | 状態 | 備考                                                            |
| ----------------------------------------------- | ---- | --------------------------------------------------------------- |
| Release blocker が 0 件か                       | OK   | MAJOR / CRITICAL 指摘なし                                       |
| 全 surface の capability 割り当てに矛盾がないか | OK   | 27 surface 全件で整合確認済み                                   |
| IPC / State / Runtime 契約が一貫しているか      | OK   | 6 カテゴリ IPC + 7 Main State + 5 Renderer State で整合確認済み |
| セキュリティ原則が全レイヤーで一貫しているか    | OK   | sender 検証 / secret masking / fail-fast の 3 観点で確認済み    |
| Phase 3 MINOR 指摘が追跡されているか            | OK   | 3 件全て対応状況を記録済み                                      |
| Phase 10 MINOR 指摘が記録されているか           | OK   | 4 件全て対応方針を記載済み                                      |
| 未タスク候補が評価されているか                  | OK   | 3 件評価済み、新規未タスク仕様書作成は不要                      |

### 本タスク特有の確認

本タスク（Task01）は仕様確定タスクであり、Phase 11（手動テスト）の対象は「仕様書間のクロスリファレンス整合性」と「後続タスクへの handoff 完全性」の確認に限定される。実装コードの手動テストは後続タスク（Task02-10）で実施する。

---

## 結論

Phase 1-7 の成果物は 9 つのレビュー観点全てにおいて PASS 基準を満たしている。MINOR 指摘 4 件（MINOR-04 ~ MINOR-07）は後続タスクまたは Phase 12 での対応が可能であり、release blocker は 0 件である。Phase 11（手動テスト）への進行を承認する。
