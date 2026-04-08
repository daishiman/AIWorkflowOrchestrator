# タスク実行仕様書生成ガイド

## 概要
この親仕様書は分割後の entrypoint であり、詳細仕様と履歴は child companion へ分離した。
旧連番 suffix の completed shard は semantic filename へ移行済み。旧 filename と current filename の対応や migration 根拠が必要なときは `legacy-ordinal-family-register.md` を参照する。
Runtime Skill Creator 系 completed workflow の canonical root は `docs/30-workflows/completed-tasks/` 配下であり、Phase 13 が `blocked` の task でも completed ledger 側導線は current root と同じ path へ同期する。2026-03-30 時点で completed ledger には `TASK-P0-02` verify→improve→re-verify 閉ループ修復を追記済み。2026-04-04 時点で `TASK-P0-01` verify 実行エンジンの完了記録と TASK-SDK-SC-04 Skill Output Integration（OutputHandler / SkillRegistry / ResultPanel / 3 IPC channel）の完了記録を `task-workflow-completed.md` 先頭に追記済み。また、2026-04-04 時点で `TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001` の Phase 11/12 current facts と executePlan ack 後の failure snapshot 再読込を追加済み。2026-04-06 時点で follow-up の `TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001` を close-out し、completed record へ追記済み。同日、`UT-SDK-07-APPROVAL-REQUEST-SURFACE-001`（approval request surface 追加）も completed record へ同期し、backlog から完了扱いへ移管済み。2026-04-07 時点で `UT-RT-02-TYPE-EXPANSION-TEST-001` を backlog 登録済み。同日、`UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001` も Phase 12 close-out まで完了し、`task-workflow-completed.md` / lane index / artifacts parity を同波で同期済み。

## 仕様書インデックス
| ファイル | 役割 | 主な見出し |
| --- | --- | --- |
| [task-workflow-active.md](task-workflow-active.md) | active guide | 概要 / ドキュメント構成 / フェーズ構造（概要） / 品質ゲート（概要） / 出力テンプレート / 実行時のコマンド・エージェント・スキル |
| [task-workflow-completed.md](task-workflow-completed.md) | completed records (baseline completed ledger) | 完了タスク / TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001（spec_created, 2026-03-20） / TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001（Phase 1-12 完了, 2026-04-04） / TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001（Phase 12 close-out, 2026-04-06） |
| [task-workflow-completed-workspace-chat-lifecycle-tests.md](task-workflow-completed-workspace-chat-lifecycle-tests.md) | completed records (workspace / chat path / lifecycle tests) | 完了タスク / TASK-FIX-LLM-CONFIG-PERSISTENCE 再監査記録（2026-03-21） |
| [task-workflow-completed.md](task-workflow-completed.md) | completed records (baseline completed ledger) | 完了タスク / TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001（implementation completed, 2026-03-21） |
| [task-workflow-completed-workspace-chat-lifecycle-tests.md](task-workflow-completed-workspace-chat-lifecycle-tests.md) | completed records (workspace / chat path / lifecycle tests) | TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR / TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE / TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE |
| [task-workflow-completed-ipc-graceful-degradation-lifecycle.md](task-workflow-completed-ipc-graceful-degradation-lifecycle.md) | completed records (IPC graceful degradation / lifecycle store integration) | 完了タスク |
| [task-workflow-completed-notification-history-auth-key-state.md](task-workflow-completed-notification-history-auth-key-state.md) | completed records (notification-history / auth key / state baseline) | 完了タスク |
| [task-workflow-completed-skill-import-skill-center-nav.md](task-workflow-completed-skill-import-skill-center-nav.md) | completed records (skill import / skill center / global nav) | 完了タスク |
| [task-workflow-completed-advanced-views-analytics-audit.md](task-workflow-completed-advanced-views-analytics-audit.md) | completed records (advanced views / analytics / shared-source audit) | 完了タスク |
| [task-workflow-completed-debug-scheduler-doc-generation-theme.md](task-workflow-completed-debug-scheduler-doc-generation-theme.md) | completed records (debug / scheduler / document generation / theme switch) | 完了タスク |
| [task-workflow-completed-ipc-contract-preload-alignment.md](task-workflow-completed-ipc-contract-preload-alignment.md) | completed records (IPC contract / preload alignment) | 完了タスク |
| [task-workflow-completed-quality-gates-module-resolution-logging.md](task-workflow-completed-quality-gates-module-resolution-logging.md) | completed records (quality gates / module resolution / logging) | 完了タスク |
| [task-workflow-completed-abort-contract-auth-session-chat.md](task-workflow-completed-abort-contract-auth-session-chat.md) | completed records (abort contract / auth session / chat panel) | 完了タスク / TASK-10A-B: SkillAnalysisView 実装完了記録（2026-03-02） |
| [task-workflow-completed-skill-lifecycle-agent-view-line-budget.md](task-workflow-completed-skill-lifecycle-agent-view-line-budget.md) | completed records (skill lifecycle / agent view / theme guard / line-budget current) | TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 Electronメニュー初期化・ズームショートカット（2026-03-16） / TASK-10A-C: SkillCreateWizard 実装完了記録（2026-03-02） / TASK-10A-D: スキルライフサイクルUI統合 実装完了記録（2026-03-03） / TASK-UI-03-AGENT-VIEW-ENHANCEMENT current workflow 再監査記録（2026-03-10） / TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 Phase 1-12 実行記録（2026-03-12 JST） / TASK-SKILL-LIFECYCLE-04 採点・評価・受け入れゲート統合 再監査記録（2026-03-14） / TASK-SKILL-LIFECYCLE-07 ライフサイクル履歴・フィードバック統合（spec_created, 2026-03-16） |
| [task-workflow-completed-skill-lifecycle.md](task-workflow-completed-skill-lifecycle.md) | completed records (skill lifecycle TASK-02/04/05/06/08 + Task08 runtime re-audit current) | TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001: AgentView 改善導線 round-trip 完了（2026-03-20） / TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001: SkillDetailPanel action buttons handoff 完了（2026-03-19） / TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001 current-state 再監査記録（2026-03-19） / TASK-SKILL-LIFECYCLE-02: SkillCenterView CTA ルーティング完了（2026-03-18） / TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 完了記録（2026-03-17） / TASK-SKILL-LIFECYCLE-08: スキル共有・公開・互換性統合（spec_created + 再監査追補, 2026-03-17） / TASK-SKILL-LIFECYCLE-06: 信頼・権限ガバナンス（2026-03-16） / TASK-SKILL-LIFECYCLE-05: 作成済みスキル利用導線（2026-03-15） / UT-06-003 / UT-06-005 / UT-06-001 |
| [task-workflow-completed-skill-create-ui-integration.md](task-workflow-completed-skill-create-ui-integration.md) | completed records (skill create & UI integration) | TASK-10A-C: SkillCreateWizard 実装完了記録（2026-03-02） / TASK-10A-D: スキルライフサイクルUI統合 実装完了記録（2026-03-03） |
| [task-workflow-completed-ui-ux-visual-baseline-drift.md](task-workflow-completed-ui-ux-visual-baseline-drift.md) | completed records (UI/UX visual baseline drift / dark-mode screenshot) | UT-UIUX-VISUAL-BASELINE-DRIFT-001 / Phase 11 evidence / Phase 12 sync |
| [workflow-ai-chat-llm-integration-fix.md](workflow-ai-chat-llm-integration-fix.md) | workflow integration spec（ChatView silent failure / selector guidance / persist / Workspace stream error） | current canonical set / 実装・監査ステータス / 最小読書セット |
| [workflow-skill-lifecycle-evaluation-scoring-gate.md](workflow-skill-lifecycle-evaluation-scoring-gate.md) | workflow integration spec（TASK-SKILL-LIFECYCLE-04） | 実装内容 / 苦戦箇所 / current canonical set / artifact inventory / legacy path 互換 / same-wave 検証手順 |
| [workflow-skill-lifecycle-created-skill-usage-journey.md](workflow-skill-lifecycle-created-skill-usage-journey.md) | workflow integration spec（TASK-SKILL-LIFECYCLE-05） | 3シナリオ導線（Immediate / Deferred / History） / Task04依存契約 / Phase 11 screenshot証跡 / follow-up backlog |
| [workflow-skill-lifecycle-routing-render-view-foundation.md](workflow-skill-lifecycle-routing-render-view-foundation.md) | workflow integration spec（TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 family） | ViewType拡張 / renderView分岐 / detail panel secondary handoff / AgentView round-trip / Phase 11 screenshot / Phase 12同期 / follow-up backlog |
| [workflow-ui-ux-visual-baseline-drift.md](workflow-ui-ux-visual-baseline-drift.md) | workflow integration spec（UT-UIUX-VISUAL-BASELINE-DRIFT-001） | dark-mode colorScheme / Phase 11 screenshot evidence / completed ledger / same-wave sync |
| [workflow-ai-runtime-execution-responsibility-realignment.md](workflow-ai-runtime-execution-responsibility-realignment.md) | workflow integration spec（TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001） | execution responsibility / access capability foundation / policy authority / same-wave sync |
| [task-workflow-backlog.md](task-workflow-backlog.md) | backlog | 残課題（未タスク） / 2026-04-07 UT-RT-02 follow-up 1件（type-expansion test） / 2026-04-04 TASK-RT-01 follow-up 1件（executeAsync snapshot message format） / 2026-03-21 runtime policy capability bridge follow-up 2件 / 2026-03-26 TASK-SDK-01 follow-up は code hardening 吸収後に close |
| [task-workflow-history.md](task-workflow-history.md) | history bundle | 関連ドキュメント / 変更履歴 |

## 利用順序
- まずこの親仕様書で対象 child companion を選ぶ。
- 実装や契約の詳細は `core` / `details` / `advanced` 系を読む。
- 完了タスク、変更履歴、補助情報は `history` / `archive` 系を読む。

## 関連ドキュメント
- `indexes/quick-reference.md`
- `indexes/resource-map.md`
