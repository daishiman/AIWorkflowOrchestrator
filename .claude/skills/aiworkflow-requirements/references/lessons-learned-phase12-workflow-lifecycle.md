# Lessons Learned: Phase 12 / ワークフロー / ライフサイクル

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: Phase 12 ドキュメント管理、ワークフロー運用、スキルライフサイクル設計に関する教訓
> 分割元: [lessons-learned-current.md](lessons-learned-current.md)

## メタ情報

| 項目     | 値                                                                     |
| -------- | ---------------------------------------------------------------------- |
| 正本     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |
| 目的     | Phase 12/ワークフロー/ライフサイクルに関する教訓を集約                 |
| スコープ | Phase 12 成果物管理、並列エージェント、未タスク管理、設計タスク運用    |
| 対象読者 | AIWorkflowOrchestrator 開発者                                          |

---

## 変更履歴

| 日付       | バージョン | 変更内容                                                                                                                                                                                                         |
| ---------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-04-06 | 1.9.4      | TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 教訓3件を追加（L-EXECUTE-ASYNC-001: vi.spyOn vs executeMock / L-EXECUTE-ASYNC-002: onWorkflowStateSnapshot 複数呼び出しテスト / L-EXECUTE-ASYNC-003: snapshot ?? null パターン） |
| 2026-04-04 | 1.9.3      | TASK-SKILL-CENTER-LIFECYCLE-NAV-001 教訓2件を追加（secondary surface の戻り導線は同一 surface の実画像と action trace を分けて扱う / `skillManagement` は `skillCenter` に正規化して dock を維持する） |
| 2026-04-03 | 1.9.3      | task-ut-p0-02-001-repeat-feedback-memory 教訓2件追加（L-FEEDBACK-MEM-001: feedback memory 構造化 / L-FEEDBACK-MEM-002: module-level 非 export 関数テスト戦略）                                                                                                                             |
| 2026-04-03 | 1.9.2      | TASK-FIX-LIFECYCLE-PANEL-ERROR-001 current facts sync（L-LIFECYCLE-EP-001〜003 / setupCallbackCapture / NON_VISUAL state-only 判定を current facts へ反映）                                                   |
| 2026-04-02 | 1.9.1      | TASK-FIX-LIFECYCLE-PANEL-ERROR-001 教訓3件を追加（L-LIFECYCLE-ERR-001: `handoff` guard の共通 helper 化 / L-LIFECYCLE-ERR-002 stale `phase: 'failed'` 語彙の除去 / L-LIFECYCLE-ERR-003 NON_VISUAL blocker を PASS へ偽装しない） |
| 2026-04-01 | 1.9.0      | TASK-SC-DIALOG-MANDATORY-001 教訓3件を追加（L-SC-DIALOG-001: 宣言型→命令型転換 / L-SC-DIALOG-002: 実行ゲートパターン / L-SC-DIALOG-003: graceful degradation で problem-definition.json 欠損時エラー停止を回避） |
| 2026-03-31 | 1.8.9      | TASK-ELECTRON-BUILD-FIX の Phase 4/5 教訓3件を追加（Rosetta 2 arch 検出 / pnpm strict resolution Phase 2 設計 / 並列化効果）                                                                                     |
| 2026-03-31 | 1.8.8      | TASK-ELECTRON-BUILD-FIX の Phase 11/12 教訓2件を追加（NON_VISUAL placeholder 撤去 / afterPack arch enum 正規化）                                                                                                 |
| 2026-03-29 | 1.8.7      | TASK-RT-04 skill-authkey-api-key-management-ui の Phase 12 教訓2件を追加（esbuild アーキ不一致対処 / shared IPC channel 再利用時の主導線/補助導線責務境界明文化）                                                |
| 2026-03-28 | 1.8.6      | TASK-SDK-07 execution-governance-and-handoff-alignment の Phase 12 教訓3件を追加（shared channel 再利用パターン / disclosure graceful degradation / spec_created task への code wave 注入後の AC 追跡）          |
| 2026-03-27 | 1.8.5      | UT-EXEC-01 の docs-only close-out 教訓2件を追加（Implementation Anchor path 実在確認 / duplicate source の baseline 判定）                                                                                       |
| 2026-03-27 | 1.8.4      | TASK-SDK-04 の Phase 12 教訓1件を追加（spec_created task に code wave が入った時の screenshot/evidence reclassification）                                                                                        |
| 2026-03-27 | 1.8.4      | UT-IMP-TASK-SDK-06-LAYER34-VERIFY-EXPANSION-001 の Phase 11/12 教訓3件を追加                                                                                                                                     |
| 2026-03-26 | 1.8.3      | UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001 の Phase 12 教訓2件を追加                                                                                                                                     |
| 2026-03-26 | 1.8.2      | TASK-SDK-01 hardening sync の Phase 12 教訓3件を追加                                                                                                                                                             |
| 2026-03-26 | 1.8.1      | TASK-SDK-01 manifest-contract-foundation / follow-up completion の Phase 12 教訓4件へ更新                                                                                                                        |
| 2026-03-23 | 1.7.0      | TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001 教訓3件を追加（L-CHRHA-001〜003）                                                                                                                                |
| 2026-03-21 | 1.6.0      | TASK-FIX-LLM-CONFIG-PERSISTENCE の Phase 11/12 教訓3件を追加                                                                                                                                                     |
| 2026-03-21 | 1.5.0      | TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE の Phase 12 教訓4件を追加                                                                                                                                                  |
| 2026-03-21 | 1.5.2      | TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001 の Phase 12 教訓3件を追加                                                                                                                                          |
| 2026-03-21 | 1.5.1      | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 最終再監査の教訓1件を追加                                                                                                                                             |
| 2026-03-21 | 1.5.0      | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 の Phase 12 close-out 教訓2件を追加                                                                                                                                   |

| 2026-03-20 | 1.4.0 | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 の Phase 12 教訓2件を追加 |
| 2026-03-18 | 1.3.0 | TASK-SKILL-LIFECYCLE-08 仕様書作成4件 + 再監査3件を lessons-learned-current.md から移動 |
| 2026-03-18 | 1.2.0 | TASK-SKILL-LIFECYCLE-02 の苦戦箇所3件追加（P50 既実装検出 / P4+P43 テスト数値伝達ミス / P4 Mirror Sync 早期完了記載）。合計5件 |
| 2026-03-18 | 1.1.0 | TASK-SKILL-LIFECYCLE-02 の苦戦箇所2件（P31 Zustand 個別セレクタ / P39 happy-dom fireEvent）を追加 |
| 2026-03-17 | 1.0.0 | lessons-learned-current.md から分割作成 |

---

---

## 分割ファイル一覧

| ファイル | 期間 | 含まれるタスク |
| -------- | ---- | -------------- |
| [lessons-learned-phase12-lifecycle-recent.md](lessons-learned-phase12-lifecycle-recent.md) | 2026-03-26〜2026-04 | TASK-FIX-LIFECYCLE-PANEL-ERROR-001、TASK-SKILL-CENTER-LIFECYCLE-NAV-001、TASK-RT-04、TASK-ELECTRON-BUILD-FIX、TASK-SDK-07、UT-IMP-TASK-SDK-06-LAYER34-VERIFY-EXPANSION-001、TASK-SDK-04、UT-EXEC-01、TASK-SDK-05、TASK-SDK-01 |
| [lessons-learned-phase12-lifecycle-mid.md](lessons-learned-phase12-lifecycle-mid.md) | 2026-03-21〜2026-03-25 | TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001、TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001、TASK-FIX-LLM-CONFIG-PERSISTENCE、TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001、TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001、TASK-SKILL-LIFECYCLE-08（仕様書作成）|
| [lessons-learned-phase12-lifecycle-early.md](lessons-learned-phase12-lifecycle-early.md) | 2026-03-14〜2026-03-18 | TASK-SKILL-LIFECYCLE-08（再監査）、TASK-SKILL-LIFECYCLE-06/07/05/04、TASK-SKILL-LIFECYCLE-02 |
| [lessons-learned-phase12-lifecycle-early-b.md](lessons-learned-phase12-lifecycle-early-b.md) | 2026-03-23〜2026-04（追加分） | TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001、TASK-RT-06 Phase 12、UT-RT-06-ESBUILD-ARCH-MISMATCH-001、UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001、TASK-UIUX-FEEDBACK-001、TASK-SC-DIALOG-MANDATORY-001、TASK-FIX-LIFECYCLE-PANEL-ERROR-001（handoff）、task-ut-p0-02-001、TASK-UT-RT-01 |

