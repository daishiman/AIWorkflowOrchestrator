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
| 解決策     | `apps/desktop/src/renderer/utils/trackEvent.ts` として renderer-local の薄い抽象を実装し、既存 Store とは独立させる。将来的な IPC 接続を想定した interface 設計にとどめ、現フェーズは console.info ロギングのみとした |
| 解決策     | `apps/desktop/src/renderer/utils/trackEvent.ts` として renderer-local の薄い抽象を実装し、既存 Store とは独立させる。後続の `UT-W3-ANALYTICS-ADAPTER-001` で production sink を analytics adapter / IPC 経由へ差し替えた |
| 標準ルール | UIコンポーネント固有の計装は execution/lifecycle Store に接続せず、renderer-local util として閉じる。Store との接続は計装ポイントが安定した後の別タスクで実施する                                                    |
| 関連タスク | UT-SKILL-WIZARD-W3-seq-04                                                                                                                                                                                         |
| 対象ファイル | `apps/desktop/src/renderer/utils/trackEvent.ts`                                                                                                                                                                  |

### L-W3-TRACK-002: 計装ポイントとstateフローの設計的分離

| 項目       | 内容                                                                                                                                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | 5つの計装ポイントが `SkillCreateWizard` と `CompleteStep` に分散しており、どちらが責務を持つか不明確になりやすい                                                                                                               |
| 原因       | 「何が起きたか」でイベントを分類すると、ウィザード起動・ステップ遷移・生成完了・フィードバックが同一レイヤーに見えてしまう                                                                                                      |
| 解決策     | ウィザード起動系（`skill_wizard_started` / `skill_wizard_step1_completed` / `skill_wizard_abandon`）は `SkillCreateWizard` に、次の行動選択（`skill_wizard_next_action`）は `CompleteStep` に、生成完了系（`skill_wizard_generation_completed`）は `SkillCreateWizard` の `handleGenerate` に、フィードバック系（`skill_skeleton_quality_feedback`）は `ConversationRoundStep` に責務分離 |
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

### L-W3-TRACK-003: useRef パターンによる cleanup 計装タイミングの確定

| 項目         | 内容                                                                                                                                                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 症状         | `SkillCreateWizard` の useEffect cleanup で abandon イベントを発火する際、state staleness による二重発火の懸念が発生した                                                                                                              |
| 原因         | React の非同期更新モデルでは、クリーンアップ関数内で `useState` の値を参照すると古いクロージャの値を掴む可能性がある                                                                                                                  |
| 解決策       | `currentStepRef` / `wizardCompletedRef` を `useRef` で保持し、cleanup 関数内で ref の最新値を参照する。Phase 8 リファクタリングで確認済み                                                                                            |
| 標準ルール   | React 非同期更新モデルでのクリーンアップは ref パターンが再利用可能な解法。計装が絡む useEffect cleanup では常に `useRef` を用いて最新値を保証し、state を直接参照しないこと                                                           |
| 関連タスク   | UT-SKILL-WIZARD-W3-USAGE-TRACKING-001                                                                                                                                                                                                |
| 対象ファイル | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                                                                                                                                                                   |

### L-PHASE12-001: artifacts.json と outputs/artifacts.json のパリティ維持

| 項目         | 内容                                                                                                                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状         | Phase 12 実施時、タスクルートの `artifacts.json` と `outputs/phase-12/artifacts.json` の 2 つを同期更新する必要があったが、片方だけ更新すると root evidence 検証で漏れが出た                                            |
| 原因         | Phase 12 テンプレートに「両ファイルを同一 step で更新する」旨の明示がなく、一方のみ更新して進めてしまいやすい                                                                                                           |
| 解決策       | Phase 12 の実施時は `artifacts.json`（タスクルート）と `outputs/phase-12/artifacts.json` の両方を同一 wave で更新し、`documentation-changelog.md` で両者の更新を個別に記録する                                          |
| 標準ルール   | Phase 12 テンプレートに「artifacts.json parity 確認チェック（タスクルート + outputs/phase-12/ の両方が更新済みか）」を組み込み、完了条件の必須チェック項目として明示する                                                  |
| 関連タスク   | UT-SKILL-WIZARD-W3-USAGE-TRACKING-001                                                                                                                                                                                  |
| 対象ファイル | `docs/30-workflows/*/artifacts.json`, `docs/30-workflows/*/outputs/phase-12/artifacts.json`                                                                                                                           |

---

## UT-W3-ANALYTICS-ADAPTER-001 analytics adapter接続 教訓（2026-04-12）

### L-W3-TRACK-003: opt-out final gate は renderer と main の二重防衛にする

| 項目       | 内容 |
| ---------- | ---- |
| 症状       | renderer 側だけで送信停止しても、Main 側の最終 gate が弱いと store 読み取り失敗時に telemetry が漏れる |
| 原因       | 送信前判定と最終判定が 1 層しかなかった |
| 解決策     | renderer で予備判定、Main で `electron-store` の `analyticsOptOut` を final gate にする。store が無い / 読めない場合は safe-side で skip する |
| 標準ルール | analytics transport は dual gate を必須とし、片側だけの opt-out 判定で完了扱いにしない |
| 関連タスク | UT-W3-ANALYTICS-ADAPTER-001 |
| 対象ファイル | `apps/desktop/src/renderer/utils/analyticsAdapter.ts` / `apps/desktop/src/main/ipc/analyticsHandler.ts` |

### L-W3-TRACK-004: trackEvent の API を変えず sink だけ差し替える

| 項目       | 内容 |
| ---------- | ---- |
| 症状       | sink 差し替えと同時に `trackEvent` の公開 API を変えると、呼び出し側の回帰が広がる |
| 原因       | 計装ポイントの責務と transport の責務が混ざっていた |
| 解決策     | `trackEvent<K>(eventName, payload): void` のシグネチャは維持し、transport のみ `analyticsAdapter` / `analytics:send` に差し替える |
| 標準ルール | 呼び出し側のイベント契約は固定し、transport は adapter で吸収する |
| 関連タスク | UT-W3-ANALYTICS-ADAPTER-001 |
| 対象ファイル | `apps/desktop/src/renderer/utils/trackEvent.ts` / `apps/desktop/src/renderer/utils/analyticsAdapter.ts` |

### L-W3-TRACK-005: queue / flush / validation は serial に扱う

| 項目       | 内容 |
| ---------- | ---- |
| 症状       | offline queue と online flush と opt-out 更新が並列に走ると、古い state で二重送信や取りこぼしが起こりやすい |
| 原因       | send / flush / gate check の順序が非同期競合しうる |
| 解決策     | `analyticsAdapter` 内で send / flush の操作を直列化し、queue TTL と max size を固定したうえで safe-side skip を優先する |
| 標準ルール | analytics adapter は state mutation を直列化し、検証失敗時は送信より停止を優先する |
| 関連タスク | UT-W3-ANALYTICS-ADAPTER-001 |
| 対象ファイル | `apps/desktop/src/renderer/utils/analyticsAdapter.ts` |

