# Lessons Learned（教訓集） / current index

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: current summary のインデックス。各カテゴリ別ファイルへの導線を提供する。

## メタ情報

| 項目     | 値                                                                     |
| -------- | ---------------------------------------------------------------------- |
| 正本     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |
| 目的     | タスク実行時の苦戦箇所と解決策を記録し、将来の開発効率を向上           |
| スコープ | 実装過程で遭遇した課題、解決策、コード例                               |
| 対象読者 | AIWorkflowOrchestrator 開発者                                          |

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|----------|
| 2026-03-17 | 2.0.0 | 651行超過のため4ファイルに分割しインデックス化。分類軸: ViewType/UI、IPC/Preload/Runtime、テスト/型安全、Phase12/ワークフロー |
| 2026-03-17 | 1.29.98 | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 の苦戦箇所3件を追加 |
| 2026-03-16 | 1.29.97 | TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION の教訓3件を追加 |
| 2026-03-16 | 1.29.96 | TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 / UT-06-005 / UT-06-001 / TASK-SKILL-LIFECYCLE-06/07 の教訓を追加 |
| 2026-03-15 | 1.29.94 | TASK-SKILL-LIFECYCLE-05 苦戦箇所6追加 |
| 2026-03-14 | 1.29.91 | TASK-SKILL-LIFECYCLE-04 / TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 / TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001 追加 |

> 以前の変更履歴（2026-03-11以前）は各専用ファイル（lessons-learned-*.md）の archive を参照してください。

---

## 分割ファイル一覧

| ファイル | カテゴリ | 含まれるタスク | 行数目安 |
| --- | --- | --- | --- |
| [lessons-learned-viewtype-electron-ui.md](lessons-learned-viewtype-electron-ui.md) | ViewType / Electron UI | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001, TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 | ~160 |
| [lessons-learned-ipc-preload-runtime.md](lessons-learned-ipc-preload-runtime.md) | IPC / Preload / AI Runtime | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001, TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 (P57-P61), TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001, TASK-IMP-CLAUDE-CODE-TERMINAL-SURFACE-001 | ~200 |
| [lessons-learned-test-typesafety.md](lessons-learned-test-typesafety.md) | テスト / 型安全 / 品質 | UT-06-001 (tool-risk-config), UT-06-005 (Permission Fallback) | ~170 |
| [lessons-learned-phase12-workflow-lifecycle.md](lessons-learned-phase12-workflow-lifecycle.md) | Phase 12 / ワークフロー / ライフサイクル | TASK-SKILL-LIFECYCLE-04/05/06/07 | ~290 |

---

## クイックリファレンス: カテゴリ別検索ガイド

### ViewType / 画面遷移 / Electron メニュー
→ [lessons-learned-viewtype-electron-ui.md](lessons-learned-viewtype-electron-ui.md)
- `renderView` 分岐テスト、screenshot 到達確認、P40 テスト実行ディレクトリ依存
- Electron role ベースメニュー、Main Process エントリポイント副作用

### IPC / Preload / AI Runtime / 認証
→ [lessons-learned-ipc-preload-runtime.md](lessons-learned-ipc-preload-runtime.md)
- AuthMode 値乖離（P57）、同名ファイル二重存在（P58）、Preload API 未公開（P59）
- サービススコープ制限（P60）、動的アダプタ注入（P61）
- LLM adapter bind() パターン、CapabilityResolver、esbuild platform mismatch
- IPC payload 契約ドリフト、未タスク target-file 監査

### テスト / 型安全 / 品質検証
→ [lessons-learned-test-typesafety.md](lessons-learned-test-typesafety.md)
- Object.freeze + satisfies パターン（P19 再発防止）
- テンプレートリテラル型による CSS 変数名の値域制限
- SKILL.md 変更履歴更新漏れ（P29 再発）
- 既実装コードの abort フロー発見遅延（P50）
- PERMISSION_MAX_RETRIES デッドコード化、abortedExecutions メモリリーク

### Phase 12 / ワークフロー / ライフサイクル設計
→ [lessons-learned-phase12-workflow-lifecycle.md](lessons-learned-phase12-workflow-lifecycle.md)
- 設計タスクでの仕様書更新先送り（P57）、未タスク指示書配置省略（P58）
- 並列エージェント changelog 件数不整合（P59）
- Phase 12 サブエージェントの実ファイル更新保留
- Phase 3 MINOR 追跡マトリクス、TaskOutput timeout、コンテキスト消失
- Phase 11 必須成果物、artifacts.json 逐次更新忘れ
- 未タスク配置先ドリフト、system spec same-wave 同期

---

> 2026-03-13 以前の教訓は [lessons-learned-archive-2026-03.md](lessons-learned-archive-2026-03.md) を参照。
