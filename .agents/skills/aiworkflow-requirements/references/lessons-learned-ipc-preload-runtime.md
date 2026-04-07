# Lessons Learned: IPC / Preload / AI Runtime

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: IPC ハンドラ、Preload API、AI Runtime アダプタ、認証モード統合に関する教訓
> 分割元: [lessons-learned-current.md](lessons-learned-current.md)

## メタ情報

| 項目     | 値                                                                     |
| -------- | ---------------------------------------------------------------------- |
| 正本     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |
| 目的     | IPC/Preload/AI Runtime に関する教訓を集約                              |
| スコープ | IPC 契約、Preload API 公開、AuthMode 統一、LLM アダプタ                |
| 対象読者 | AIWorkflowOrchestrator 開発者                                          |

---

## 変更履歴

| 日付       | バージョン | 変更内容                                                                                                                                                         |
| ---------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-04-06 | 1.19.0     | Phase-12 IPC 4層型同期（Session Resume / Session Resume UI遷移）教訓3件を追加（L-IPC-4LAYER-001: 4層型定義 shared 集約原則 / L-IPC-4LAYER-002: errorReason 3分岐の全層同期パターン / L-SESSION-RESUME-UI-001: snapshot nullability 設計パターン） |
| 2026-04-06 | 1.18.0     | TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 教訓1件を追加（L-IPC-VARIADIC-001: multi-arg IPC event は preload で variadic 化する） |
| 2026-04-01 | 1.17.0     | TASK-FIX-AUTH-IPC-001 教訓2件を追加（L-AUTH-IPC-001: IPC channel timeout と fire-and-forget パターン / L-AUTH-IPC-002: AUTH_STATE_CHANGED 責務境界の分離）       |
| 2026-03-31 | 1.16.0     | TASK-FIX-BETTER-SQLITE3-ELECTRON-ABI-001 教訓1件を追加（L-BETTER-SQLITE3-ABI-001: native addon ABI 不一致 / postinstall rebuild / best-effort esbuild パターン） |
| 2026-03-27 | 1.15.0     | runtime policy centralization close-out 教訓1件を追加（composition root authority と handoff reason source の単一化）                                            |
| 2026-03-27 | 1.14.0     | TASK-SDK-04 教訓2件を追加（回答送信後 semantics の owner 不在、planId と execute payload の canonical drift）                                                    |
| 2026-03-25 | 1.13.0     | UT-SC-02-005 教訓1件を追加（L-SC-07-005: Preload executePlan 型追従漏れ、IPC ハンドラ変更時の3層走査）                                                           |
| 2026-03-25 | 1.12.0     | TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION 教訓4件を追加（L-SC-07-001〜004: vi.mock gaps、非破壊拡張、Symmetric Clear横展開、GenerationMode SSoT）            |
| 2026-03-24 | 1.11.0     | TASK-SC-06-UI-RUNTIME-CONNECTION 苦戦箇所3件を追加（L-SC-06-001〜003: Hybrid State Pattern SSoT問題、executePlan引数設計ミス、PlanResult型一本化）               |
| 2026-03-24 | 1.10.0     | UT-SC-03-004 教訓3件を追加（esbuild worktree arch mismatch、2層バリデーション境界、BGエージェント doc 精度乖離）                                                 |
| 2026-03-23 | 1.9.0      | TASK-SC-05-IMPROVE-LLM 教訓3件を追加（LLM統合パターン再利用、空文字列beforeバグ、P4/P51早期完了記載の再発）                                                      |
| 2026-03-23 | 1.8.0      | UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001 苦戦箇所2件を追加（エスケープテスト lookbehind regex パターン、adapter サニタイズ対象の統一漏れ）                      |
| 2026-03-22 | 1.7.0      | TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR の same-wave sync 教訓を追加（structured error primary / legacy fallback 分離、Task 03 root 移管の同波反映）                |
| 2026-03-21 | 1.6.0      | UT-TASK06-007-EXT-006 正規表現 lastIndex 汚染パターン（教訓4）を追加                                                                                             |
| 2026-03-21 | 1.5.0      | UT-TASK06-007-EXT-006 Phase 12 再監査教訓を追加（mkdtempSync 一時ディレクトリ戦略、same-wave 指標同期、EXT-006 完了と EXT-001〜005 継続の切り分け）              |
| 2026-03-20 | 1.4.0      | TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE 再監査教訓を追加（AIChatResponse.error の code/message drift、Renderer raw message fallback、system spec same-wave 同期） |
| 2026-03-19 | 1.3.0      | UT-TASK06-007 実装セッション苦戦箇所を追加（esbuild worktree 不一致、process.argv[1] パス解決、fs モック制約、main() カバレッジ改善）                            |
| 2026-03-19 | 1.2.0      | UT-TASK06-007 再監査教訓を追加（generic/multiline preload 抽出、spec drift 同期、P45 の書き分け）                                                                |
| 2026-03-18 | 1.1.0      | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 教訓3件を追加（esbuild worktree不一致 P53派生、テスト数伝播 P37派生、P62 DEFAULT_CONFIG三層防御）                   |
| 2026-03-17 | 1.0.0      | lessons-learned-current.md から分割作成                                                                                                                          |

---

---

## 分割ファイル一覧

| ファイル | 期間 | 含まれるタスク |
| -------- | ---- | -------------- |
| [lessons-learned-ipc-preload-runtime-2026-03-early.md](lessons-learned-ipc-preload-runtime-2026-03-early.md) | 2026-03-14〜2026-03-23 | UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001、TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-IMPLEMENTATION-CLOSURE-001、TASK-SDK-04、TASK-SDK-04-U1、TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION、TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR、TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE、UT-TASK06-007-EXT-006、UT-TASK06-007（再監査）、TASK-IMP-SKILL-DOCS-AI-RUNTIME-001、TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |
| [lessons-learned-ipc-preload-runtime-2026-03-late.md](lessons-learned-ipc-preload-runtime-2026-03-late.md) | 2026-03-22〜2026-03-27 | TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001、TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001、UT-TASK06-007（実装）、TASK-SC-02-RUNTIME-POLICY-CLOSURE、TASK-SC-05-IMPROVE-LLM、TASK-SC-06-UI-RUNTIME-CONNECTION、TASK-IMP-HEALTH-POLICY-UNIFICATION-001、TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION、UT-SC-02-005 |
| [lessons-learned-ipc-preload-runtime-2026-04.md](lessons-learned-ipc-preload-runtime-2026-04.md) | 2026-04 | TASK-FIX-EXECUTE-PLAN-FF-001、TASK-FIX-BETTER-SQLITE3-ELECTRON-ABI-001、TASK-FIX-PRELOAD-VITE-ALIAS-SHARED-IPC-001、TASK-FIX-AUTH-IPC-001、Phase-12 IPC 4層型同期、TASK-UT-RT-01 executeAsync エラー伝搬パス |

