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
| 2026-03-18 | 3.0.0 | 1489行 → 400行以下に圧縮。3重重複セクション除去。UT-06-003 を `lessons-learned-safety-gate-ipc-quality.md` に分割。TASK-SKILL-LIFECYCLE-08 仕様書作成/再監査を `lessons-learned-phase12-workflow-lifecycle.md` に移動。SafetyGate P62/P63 は `lessons-learned-safety-gate-permission-fallback.md` で管理 |
| 2026-03-18 | 2.1.1 | TASK-SKILL-LIFECYCLE-02 の苦戦箇所3件追加（P50 既実装検出 / P4+P43 テスト数値伝達ミス / P4 Mirror Sync 早期完了記載）を `lessons-learned-phase12-workflow-lifecycle.md` に追記。合計5件 |
| 2026-03-18 | 2.1.0 | TASK-SKILL-LIFECYCLE-02 の苦戦箇所2件（P31 Zustand 個別セレクタ / P39 happy-dom fireEvent）を `lessons-learned-phase12-workflow-lifecycle.md` に追加 |
| 2026-03-17 | 2.0.0 | 651行超過のため4ファイルに分割しインデックス化。分類軸: ViewType/UI、IPC/Preload/Runtime、テスト/型安全、Phase12/ワークフロー |
| 2026-03-17 | 1.30.00 | TASK-SKILL-LIFECYCLE-08 仕様書作成の教訓4件を追加 |
| 2026-03-17 | 1.29.99 | TASK-SKILL-LIFECYCLE-08 / UT-06-005 の苦戦箇所3件（P62/P63）を追加 |
| 2026-03-17 | 1.29.98 | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 の苦戦箇所3件を追加 |
| 2026-03-17 | 1.29.97 | UT-06-003 SafetyGate 実装の教訓5件を追加 |

> 2026-03-13〜03-14 の旧セクション（TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001 / CHAT-EDIT / TERMINAL-SURFACE）は [lessons-learned-archive-2026-03.md](lessons-learned-archive-2026-03.md) を参照。
> TASK-SKILL-LIFECYCLE-04/05、P57〜P61 は [lessons-learned-skill-lifecycle-test-hardening.md](lessons-learned-skill-lifecycle-test-hardening.md) および [lessons-learned-archive-2026-03.md](lessons-learned-archive-2026-03.md) を参照。

---

## 分割ファイル一覧

### 分割ファイル対応表

| ファイル | カテゴリ | 含まれるタスク | 行数目安 |
| --- | --- | --- | --- |
| [lessons-learned-viewtype-electron-ui.md](lessons-learned-viewtype-electron-ui.md) | ViewType / Electron UI | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001, TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 | ~160 |
| [lessons-learned-ipc-preload-runtime.md](lessons-learned-ipc-preload-runtime.md) | IPC / Preload / AI Runtime | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001, TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 (P57-P61), TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001, TASK-IMP-CLAUDE-CODE-TERMINAL-SURFACE-001 | ~200 |
| [lessons-learned-test-typesafety.md](lessons-learned-test-typesafety.md) | テスト / 型安全 / 品質 | UT-06-001 (tool-risk-config), UT-06-005 (Permission Fallback) | ~170 |
| [lessons-learned-phase12-workflow-lifecycle.md](lessons-learned-phase12-workflow-lifecycle.md) | Phase 12 / ワークフロー / ライフサイクル | TASK-SKILL-LIFECYCLE-02/04/05/06/07/08 | ~390 |
| [lessons-learned-safety-gate-permission-fallback.md](lessons-learned-safety-gate-permission-fallback.md) | SafetyGate / Permission / DI スコープ | TASK-SKILL-LIFECYCLE-08 / UT-06-005 (P62, P63) | ~155 |
| [lessons-learned-safety-gate-ipc-quality.md](lessons-learned-safety-gate-ipc-quality.md) | SafetyGate IPC / DIP / 型安全 | UT-06-003 (P60, P61, P49 再発, P38 再発) | ~130 |

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
- TASK-SKILL-LIFECYCLE-08 仕様書作成: worktree 実更新、成果物間整合性、並列エージェント統合
- TASK-SKILL-LIFECYCLE-08 再監査: planned wording 残存、screenshot 証跡、未タスクリンク切れ
- 設計タスクでの仕様書更新先送り（P57）、未タスク指示書配置省略（P58）
- 並列エージェント changelog 件数不整合（P59）
- Phase 12 サブエージェントの実ファイル更新保留
- Phase 3 MINOR 追跡マトリクス、TaskOutput timeout、コンテキスト消失
- Phase 11 必須成果物、artifacts.json 逐次更新忘れ
- 未タスク配置先ドリフト、system spec same-wave 同期

### SafetyGate / Permission / DI スコープ
→ [lessons-learned-safety-gate-permission-fallback.md](lessons-learned-safety-gate-permission-fallback.md)
- PermissionStore DI スコープ問題（P62）、SafetyGate metadataProvider 抽象化境界（P63）
- フォールバック制御の境界条件テスト設計

### SafetyGate IPC / DIP / 型安全パターン
→ [lessons-learned-safety-gate-ipc-quality.md](lessons-learned-safety-gate-ipc-quality.md)
- IPC テスト応答形式の不一致（P60）、DIP 違反遅発検出（P61）
- P49 違反（as キャスト）残存、ternary 分岐カバレッジ特定困難
- 未タスク配置ディレクトリ間違い（P38 再発）
