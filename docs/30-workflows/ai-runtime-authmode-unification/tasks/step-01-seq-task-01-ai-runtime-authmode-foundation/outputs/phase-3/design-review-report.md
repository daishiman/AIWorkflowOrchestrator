# Phase 3 設計レビュー報告

## メタ情報

| 項目         | 内容                                         |
| ------------ | -------------------------------------------- |
| タスクID     | TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001 |
| Phase        | 3 - 設計レビュー                             |
| 作成日       | 2026-03-13                                   |
| ステータス   | completed                                    |
| レビュー対象 | Phase 1 要件定義 + Phase 2 設計              |

---

## 総合判定: PASS (MINOR 指摘 3 件)

MAJOR 指摘は 0 件。設計は後続タスク（Task02-10）への handoff に十分な粒度を持っており、Phase 4 に進行可能である。

---

## レビュー観点別 詳細判定

### 観点 1: 全 AI surface が inventory に含まれているか

**判定: PASS**

**根拠:**

- Main Process surface: M1-M12 の 12 項目が網羅されている。AuthModeService、LLMAdapterFactory、aiHandlers（3 種）、SkillExecutor、AgentExecutor、chatEditHandlers、SkillDocGenerator、Claude CLI IPC Handler、slide skill-executor、slide agent-client が全て列挙されている。
- Renderer surface: R1-R9 の 9 項目が網羅されている。skillExecutionAuthPreflight、authModeSlice、ChatView/LLM Selector、System Prompt Panel、WorkspaceChatPanel、ChatPanel、Agent SDK UI/Hook、Settings/Access Card、SlideWorkspace が列挙されている。
- Backend/Pipeline surface: B1-B6 の 6 項目が網羅されている。RAG/AI_INDEX、Embedding、Entity Extraction、Graph Summary、CRAG、Reranking が列挙されている。
- 合計 27 surface に対して全件に現状 capability と目標 capability の割り当てがある。

### 観点 2: resolver を通らない direct key read が残っていないか

**判定: PASS**

**根拠:**

- Phase 2 設計サマリーで CredentialProvider が `SecureStorage.getApiKey(providerId)` をラップする単一インターフェースとして定義されている。
- AIRuntimeResolver の解決フロー（Step 3 -> Step 4 -> Step 5）において、credential 取得は必ず CredentialProvider 経由で行われる設計になっている。
- Phase 1 の Gap 分析で、M2（LLMAdapterFactory）が `SecureStorage.getApiKey(providerId)` を直接呼び出している現状が記録されており、目標として CredentialProvider 経由への移行が明記されている。
- M6（SkillExecutor）の AuthKeyService DI 経由のアクセスも CredentialProvider への統合対象として識別されている。
- direct key read の残存は Phase 1 で gap として検出済みであり、後続タスクでの解消方針が設計に含まれている。

### 観点 3: integrated runtime と terminal surface が同じ error envelope / guidance contract を共有しつつ、同じ実行 lane に誤統合されていないか

**判定: PASS**

**根拠:**

- error envelope: contract-matrix.md の Fail-Fast Error 型定義で `{ error, reason, guidance, retryable }` の共通型が定義されている。この型は integrated runtime の全段階（Capability 評価、Provider 解決、Credential 取得、Adapter 生成、実行）で共通使用される。
- guidance contract: ui-ux-realization.md の Guidance Block で共通の構成要素（Failure Reason、再設定手順、代替導線）が定義されている。
- 実行 lane の分離: AIAccessCapability 型が `integratedRuntime` / `terminalSurface` / `both` / `none` の 4 値で明確に分離されている。`both` の場合でも UI は「自動実行する」と「terminal で手動実行する」を別の CTA として表示する設計であり、同一 lane への誤統合は発生しない。
- 制約 C2（Silent fallback 禁止）が明記されており、integrated runtime 失敗時に terminal への自動切替を禁止している。

### 観点 4: Task02 以降へ渡す契約と rollout 順序が明記されているか

**判定: PASS**

**根拠:**

- scope-definition.md Section 4.1 に Task01 -> Task02-10 の Handoff Matrix が定義されている。各後続タスクが受け取る成果物、定義、接点 surface が明記されている。
- scope-definition.md Section 4.2 に実行順序制約の依存グラフが記載されている。Task02/Task06 の並列実行可能性、Task07/Task08 の Task02+Task06 への依存、Task09/Task10 の独立実行可能性が明示されている。
- design-summary.md に Task02、Task03-08、Task09、Task10 それぞれへの Handoff Contract が個別に定義されている。capability 参照方法、操作許可/禁止、fail-fast ルールが契約項目として列挙されている。
- contract-matrix.md の Surface 別 Runtime 対応表（Section 3.5）で各 surface の integratedRuntime / terminalSurface 対応と fail-fast 時の動作が一覧化されている。

### 観点 5: legacy authMode migration と providerId/modelId 解決順が競合していないか

**判定: PASS**

**根拠:**

- design-summary.md の解決順設計で Step 1（Legacy authMode Migration）-> Step 2（Access Capability 評価）-> Step 3（providerId/modelId 解決）-> Step 4（Credential 取得）-> Step 5（Adapter 生成 + Cache 管理）-> Step 6（Terminal Availability 反映）の 6 段階が時系列で定義されている。
- Step 1 はアプリ起動時 / authMode 変更時に実行され、`authMode=subscription` を `terminalSurface enabled` に、`authMode=api-key` を `integratedRuntime enabled` に変換する。この変換は Step 3 の providerId/modelId 解決よりも先に完了する。
- Step 3 は AI 実行リクエスト受信時にオンデマンドで実行される。Step 1 の migration は起動時に完了済みのため、Step 3 実行時点では capability が確定しており、競合は発生しない。
- contract-matrix.md の State 更新フロー（Section 2.3）で authMode 変更トリガーが capabilityMap 再評価を経由してから IPC 通知される設計になっており、途中状態での providerId/modelId 解決が発生しない。

### 観点 6: terminal surface が user-operated のままで、auto send / hidden prompt injection / hidden retry が禁止されているか

**判定: PASS**

**根拠:**

- requirements-definition.md Section 5.3 で No Auto-Send 境界の 4 項目（auto-send 禁止、copy 許可、auto retry 禁止、hidden prompt injection 禁止）が定義されている。
- contract-matrix.md Section 4.2 で禁止操作が 5 項目（Auto Send、Auto Retry、Hidden Prompt Injection、Token/Session 取得、Auto Transcript Share）に拡張されており、各項目に理由と検証方法が記載されている。
- ui-ux-realization.md の Terminal 常設ルール（Section 5）で「dock を開いてもコマンドは自動送信しない」「transcript share は手動選択/手動添付/手動貼付の 3 形態に限定」が明記されている。
- 制約 C1（consumer subscription token の取得・保存・再利用・中継禁止）と C3（execute-script の consumer subscription 用本線使用禁止）が追加の防壁として機能する。
- design-summary.md の Fallback ルール禁止事項で Silent Stub Fallback、Silent Terminal Fallback、Auto-Send、Hidden Prompt Injection の 4 つが明示的に禁止されている。

### 観点 7: sender 検証、PermissionResolver、guidance 表示、launcher 表示の責務境界が崩れていないか

**判定: PASS (MINOR 1 件)**

**根拠:**

- sender 検証: contract-matrix.md の IPC セキュリティ共通ルールで「全ハンドラで validateIpcSender を実行する」が明記されている。Phase 1 の Section 5.1 で sender 検証の有無が経路ごとに列挙されており、aiHandlers / chatEditHandlers での不足が gap として検出済み。
- PermissionResolver: Phase 1 Section 5.4 で surface ごとの権限確認フローが定義されている。Skill Execution（API key 存在 + provider 一致）、Agent Execution（API key 存在）、Terminal Launch（CLI 存在 + PATH 解決）、RAG Pipeline（API key + embedding provider）が分離されている。
- guidance 表示: ui-ux-realization.md の Guidance Block で責務が「failure reason と next action」に限定されており、「runtime 判定」は持たないことが明記されている（Section 8）。
- launcher 表示: ui-ux-realization.md Section 4 の Surface 別 UI/UX 対応表で Terminal Launcher の有無が surface ごとに定義されている。RAG/Embedding と Claude Code Terminal Surface 自身は Terminal Launcher を持たない設計。

**MINOR-01**: PermissionResolver の責務について、Phase 2 設計サマリーでは AIAccessCapabilityResolver と AIRuntimeResolver の 2 resolver が定義されているが、Phase 1 Section 5.4 に記載されている「権限確認フロー」（preflight）がこの 2 resolver のどちらに属するか、あるいは別の PermissionResolver として独立するかが明示されていない。後続タスク（特に Task04: Skill/Agent）で設計時に判断可能な範囲ではあるが、responsibility の帰属先を Phase 2 設計に注記しておくことが望ましい。

### 観点 8: Phase 12 の system spec sync 先と未タスク化条件が明記されているか

**判定: PASS (MINOR 2 件)**

**根拠:**

- scope-definition.md Section 2.1 で除外一覧（E1-E12）が定義されており、各除外項目の委譲先タスクが明記されている。これにより、本タスクで検出された gap のうち実装が必要なものは未タスク化の候補として識別可能。
- Phase 3 仕様書（phase-3-design-review.md）の参照資料セクションに system spec の正本リスト（18 ファイル）が列挙されている。

**MINOR-02**: Phase 12 で更新すべき system spec ファイルの具体的なリストが Phase 1 / Phase 2 の成果物に含まれていない。Phase 3 仕様書の参照資料に 18 ファイルの正本が列挙されているが、「この中のどれを Phase 12 で更新対象とするか」の判断基準が明示されていない。Phase 12 実行時に判断可能ではあるが、設計段階で更新候補を絞り込んでおくと Phase 12 の漏れリスクが低減する。

**MINOR-03**: 未タスク化の条件（「どのような gap が検出された場合に未タスク仕様書を作成するか」）が Phase 1 / Phase 2 に明示されていない。scope-definition.md の除外一覧（E1-E12）が事実上の未タスク候補リストとして機能しているが、Phase 10 / Phase 12 で新たに検出された gap を未タスク化する基準（深刻度、影響範囲、後続タスクとの重複判定）が定義されていない。これは Phase 12 の task-specification-creator の標準フローで対応可能であるため、設計上の重大な欠陥ではない。

---

## MINOR 指摘一覧

| ID       | 観点   | 指摘内容                                                                                                                                                                                 | 影響度 | 対応方針                                                                                  |
| -------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------- |
| MINOR-01 | 観点 7 | PermissionResolver（preflight）の責務帰属先が AIAccessCapabilityResolver / AIRuntimeResolver のどちらに属するか、あるいは独立 resolver として存在するかが Phase 2 設計に明示されていない | 低     | Task04（Skill/Agent）の設計時に PermissionResolver の配置を確定する。Phase 2 に注記を追加 |
| MINOR-02 | 観点 8 | Phase 12 で更新すべき system spec ファイルの具体的な候補リストが Phase 1/2 成果物に含まれていない                                                                                        | 低     | Phase 12 実行時に参照資料リスト（18 ファイル）から更新対象を絞り込む                      |
| MINOR-03 | 観点 8 | Phase 10/12 で新規 gap を未タスク化する基準（深刻度閾値、後続タスクとの重複判定）が定義されていない                                                                                      | 低     | Phase 12 の標準フロー（task-specification-creator）に従い、0 件でも報告を作成する         |

---

## 改善提案

### 1. PermissionResolver の責務明確化（MINOR-01 対応）

Phase 2 設計サマリーに以下の注記を追加することを推奨する:

- AIAccessCapabilityResolver は「surface が何を使えるか」を判定する（capability 判定）
- AIRuntimeResolver は「provider/model/adapter をどう解決するか」を判定する（runtime 解決）
- preflight（権限確認フロー）は AIAccessCapabilityResolver の出力を消費する downstream 処理であり、各 surface の実装タスク（Task04 等）で concrete な実装を定義する

この注記により、3 つの resolver の関係が明確になり、後続タスクでの設計判断が容易になる。

### 2. Phase 12 更新候補の事前絞り込み（MINOR-02 対応）

Phase 12 での漏れリスクを低減するため、以下のファイルを更新候補として記録しておくことを推奨する:

- `interfaces-auth.md`: authMode -> accessCapability の型定義変更
- `api-ipc-system.md`: 新規 IPC チャンネル（ai:get-capability 等）の追加
- `arch-state-management.md`: aiAccessSlice の追加、capabilityMap の追加
- `ui-ux-settings.md`: Access Capability Card の追加
- `task-workflow.md`: 完了タスク記録

### 3. 未タスク化基準の明文化（MINOR-03 対応）

Phase 12 の標準フローに従い、以下の基準で未タスク化を判断することを推奨する:

- 既存の除外一覧（E1-E12）と重複する gap: 該当する後続タスクに含める（未タスク化不要）
- E1-E12 に含まれない新規 gap: 未タスク仕様書を作成する
- 0 件の場合でも unassigned-task-report.md を作成する（P3 対策）

---

## 責務境界の整合性確認

### selected config の責務境界

| レイヤー | 責務                                                | 持たない責務            |
| -------- | --------------------------------------------------- | ----------------------- |
| Renderer | provider/model の選択 UI、selectedConfig の表示     | config の最終解決       |
| Preload  | `llm:set-selected-config` の IPC 転送               | config のバリデーション |
| Main     | selectedConfig の永続化、AIRuntimeResolver への入力 | UI 表示判定             |

矛盾なし。Renderer は選択のみ、Main が最終解決を行う単方向の authority が維持されている。

### permission の責務境界

| レイヤー | 責務                                              | 持たない責務            |
| -------- | ------------------------------------------------- | ----------------------- |
| Renderer | capability 値に基づく CTA の活性/非活性制御       | 独自の capability 算出  |
| Preload  | capability 値の IPC 転送                          | capability のキャッシュ |
| Main     | AIAccessCapabilityResolver による capability 判定 | UI 表示ロジック         |

矛盾なし。capability 判定は Main に一元化されており、Renderer は受信した値を表示に反映するのみ。制約 C5（UI authority の一元管理）が遵守されている。

### error envelope の責務境界

| レイヤー | 責務                                    | 持たない責務         |
| -------- | --------------------------------------- | -------------------- |
| Renderer | guidance の表示、retry CTA の提供       | error code の生成    |
| Preload  | error envelope の IPC 転送              | error のサニタイズ   |
| Main     | fail-fast error の生成、guidance の付与 | 表示用文言の組み立て |

矛盾なし。Main が error code と guidance を生成し、Renderer が表示する分離が維持されている。ui-ux-realization.md Section 8 の「Main Process は曖昧な説明文の組み立てを持たない」という制約とも整合する。

---

## 次 Phase への Handoff 確認

### Phase 4（テスト作成）への Handoff

| 確認項目                                        | 状態 | 備考                                                                |
| ----------------------------------------------- | ---- | ------------------------------------------------------------------- |
| Capability 5 区分の定義が確定している           | OK   | requirements-definition.md Section 3                                |
| Resolver の入出力型が定義されている             | OK   | contract-matrix.md Section 3.1-3.4                                  |
| IPC チャンネルと Payload が定義されている       | OK   | contract-matrix.md Section 1                                        |
| State の更新フローが定義されている              | OK   | contract-matrix.md Section 2.3                                      |
| Fail-Fast Error の型と条件が定義されている      | OK   | design-summary.md Fail-Fast ルール + contract-matrix.md Section 3.4 |
| Terminal 禁止操作が検証方法付きで定義されている | OK   | contract-matrix.md Section 4.2                                      |
| Legacy migration の入出力が定義されている       | OK   | design-summary.md Step 1                                            |
| Cache invalidation の条件が定義されている       | OK   | design-summary.md Cache Clear 条件                                  |

全項目 OK。Phase 4 でテスト仕様を作成するために必要な契約が全て定義されている。

### 完了条件の充足確認

- [x] MAJOR 指摘 0 件
- [x] selected config、permission、error envelope の責務境界が矛盾なく説明されている（上記「責務境界の整合性確認」参照）
- [x] Task02 以降に handoff できる設計粒度になっている（上記「Phase 4 への Handoff」参照）

---

## 結論

Phase 1 の要件定義と Phase 2 の設計は、8 つのレビュー観点全てにおいて PASS 基準を満たしている。MINOR 指摘 3 件は後続 Phase での対応が可能であり、Phase 4（テスト作成）への進行を承認する。
