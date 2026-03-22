# 未タスク検出レポート

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| タスクID | TASK-SC-02-RUNTIME-POLICY-CLOSURE  |
| Phase    | 12 Task 4                          |
| 検出日   | 2026-03-22                         |
| 更新日   | 2026-03-22（30種思考法分析後拡充） |

## 検出結果

検出件数: 4件

### UT-SC-02-001: RuntimeSkillCreatorFacade の subscriptionAuthProvider DI 配線

| 項目     | 値                                                                                                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 優先度   | 中                                                                                                                                                                                   |
| 概要     | `RuntimeSkillCreatorFacade` のコンストラクタに `subscriptionAuthProvider` を追加したが、実際の DI 配線（`ipc/index.ts:889`）で `subscriptionAuthProvider` インスタンスを渡していない |
| 影響     | subscription 判定は常に false（no-auth）になる。安全側だが subscription ユーザーが subscription モードで実行できない                                                                 |
| 対応方針 | `ipc/index.ts` の `RuntimeSkillCreatorFacade` 生成箇所で `SubscriptionAuthProvider` インスタンスを DI する                                                                           |

### UT-SC-02-002: RuntimeSkillCreatorFacade.execute() の terminal_handoff 未分岐

| 項目     | 値                                                                                                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 優先度   | 高                                                                                                                                                                                                |
| 概要     | `plan()` と `improve()` は `terminal_handoff` 時に早期リターンするが、`execute()` は `void decision;` で lint エラー回避しているだけで terminal_handoff 時も `SkillExecutor.execute()` を呼び出す |
| 影響     | 認証情報がない状態で SkillExecutor が呼ばれるセキュリティリスク                                                                                                                                   |
| 対応方針 | `plan()` / `improve()` と同様に terminal_handoff 時の早期リターンを追加                                                                                                                           |
| 検出元   | 30種思考法分析 - 垂直思考（発見2）                                                                                                                                                                |

### UT-SC-02-003: Facade の RuntimePolicyResolver 直接生成（DIP 違反、P61 再発）

| 項目     | 値                                                                                                                                                                                       |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 優先度   | 中                                                                                                                                                                                       |
| 概要     | `RuntimeSkillCreatorFacade` のコンストラクタが `new RuntimePolicyResolver()` で具象クラスを直接生成している。`IRuntimePolicyResolver` インターフェースが定義済みなのに DI 注入していない |
| 影響     | テスタビリティ低下、モック差し替え困難、P61（DIP 違反が Phase 10 まで検出されない）パターンの再発                                                                                        |
| 対応方針 | Deps インターフェースに `resolver?: IRuntimePolicyResolver` を追加し、未指定時のみデフォルト生成                                                                                         |
| 検出元   | 30種思考法分析 - メタ認知（発見6）                                                                                                                                                       |

### UT-SC-02-004: bundle 構築の二重責務（Resolver と Builder の分散）

| 項目     | 値                                                                                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 優先度   | 低                                                                                                                                                            |
| 概要     | `TerminalHandoffBundle` の構築が `RuntimePolicyResolver` のプライベートメソッドと `TerminalHandoffBuilder.build()` に分散。shell injection 対策の有無が不均一 |
| 影響     | Resolver の bundle は `sanitizePrompt()` を経由しない。プロンプトが空文字列のため直接の脆弱性はないが、構造的な不整合                                         |
| 対応方針 | Resolver の bundle 構築を TerminalHandoffBuilder に委譲し、一箇所に統合する                                                                                   |
| 検出元   | 30種思考法分析 - MECE 分析（発見3）                                                                                                                           |
