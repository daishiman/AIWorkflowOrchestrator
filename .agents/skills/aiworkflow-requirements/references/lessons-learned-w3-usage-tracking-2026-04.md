# Lessons Learned: W3-seq-04 使用率計装 / trackEvent（2026-04）

> 分離元: [lessons-learned-current-2026-04.md](lessons-learned-current-2026-04.md)
> 関連: [lessons-learned-skill-wizard-redesign.md](lessons-learned-skill-wizard-redesign.md)

---

## UT-SKILL-WIZARD-W3-seq-04 使用率計装 教訓（2026-04-08）

### L-W3-TRACK-001: trackEvent renderer-local 抽象設計パターン

| 項目       | 内容                                                                                                                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | trackEvent を既存の `SkillAnalytics` / `AnalyticsStore` と接続しようとすると、execution-centric 計装と wizard-centric 計装が混在し責務が不明確になる                                                               |
| 原因       | 既存 Store は実行ライフサイクル中心の計装設計であり、ウィザード UI 操作イベントの粒度と一致しない                                                                                                                    |
| 解決策     | `apps/desktop/src/renderer/utils/trackEvent.ts` として renderer-local の薄い抽象を実装し、既存 Store とは独立させる。将来的な IPC 接続を想定した interface 設計にとどめ、現フェーズは console.debug ロギングのみとした |
| 標準ルール | UIコンポーネント固有の計装は execution/lifecycle Store に接続せず、renderer-local util として閉じる。Store との接続は計装ポイントが安定した後の別タスクで実施する                                                    |
| 関連タスク | UT-SKILL-WIZARD-W3-seq-04                                                                                                                                                                                         |
| 対象ファイル | `apps/desktop/src/renderer/utils/trackEvent.ts`                                                                                                                                                                  |

### L-W3-TRACK-002: 計装ポイントとstateフローの設計的分離

| 項目       | 内容                                                                                                                                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | 5つの計装ポイントが `SkillCreateWizard` と `CompleteStep` に分散しており、どちらが責務を持つか不明確になりやすい                                                                                                               |
| 原因       | 「何が起きたか」でイベントを分類すると、ウィザード起動・ステップ遷移・生成完了・フィードバックが同一レイヤーに見えてしまう                                                                                                      |
| 解決策     | ウィザード起動系（`skill_wizard_started` / `skill_wizard_step1_completed` / `skill_wizard_next_action`）は `SkillCreateWizard` に、生成完了系（`skill_wizard_generation_completed`）は `GenerateStep` コールバック経由で `ConversationRoundStep` に、フィードバック系（`skill_skeleton_quality_feedback`）は `ConversationRoundStep` に責務分離 |
| 標準ルール | 計装ポイントは「何が起きたか」ではなく「誰がその状態を知っているか」でコンポーネント配置を決定する。state を直接持つコンポーネントが計装を担う                                                                                   |
| 関連タスク | UT-SKILL-WIZARD-W3-seq-04                                                                                                                                                                                                    |

### L-WIZARD-LANE-CLEANUP-001: 完了レーン仕様書の移動後の参照更新

| 項目       | 内容                                                                                                                                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `docs/30-workflows/skill-wizard-redesign-lane/` 配下の仕様書削除後、`quick-reference.md` の参照パスが旧パスのまま残った                                                                                                       |
| 原因       | タスク仕様書のディレクトリ移動・削除と quick-reference の参照更新が別ターンになっていた                                                                                                                                        |
| 解決策     | `docs/30-workflows/` 直下への canonical 移行を完了したタイミングで quick-reference を同波更新する。`grep -r "skill-wizard-redesign-lane" .claude/` 等で残存参照を検出してから削除する                                          |
| 標準ルール | タスク仕様書のディレクトリ移動はquick-referenceの同行更新を必須とし、Phase 12 close-outの必須チェックリストに「参照パス整合確認（`grep` による残存参照検出）」を追加する                                                         |
| 関連タスク | UT-SKILL-WIZARD-W3-seq-04                                                                                                                                                                                                    |
