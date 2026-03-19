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
| 2026-03-18 | 3.0.0 | 1598行の重複コンテンツを除去し、ユニークコンテンツを2ファイルに分割してインデックス化。重複セクション（TASK-SKILL-LIFECYCLE-04/05/06/07、P57-P61 等が3回出現）を除去 |
| 2026-03-17 | 2.0.0 | 651行超過のため4ファイルに分割しインデックス化。分類軸: ViewType/UI、IPC/Preload/Runtime、テスト/型安全、Phase12/ワークフロー |
| 2026-03-17 | 1.30.1 | 500行制限対応。2026-03-14〜03-15 の教訓セクションを lessons-learned-archive-2026-03.md へ移動 |
| 2026-03-17 | 1.30.0 | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 実装教訓を追加 |
| 2026-03-17 | 1.30.00 | TASK-SKILL-LIFECYCLE-08 仕様書作成の教訓4件を追加 |

---

## 分割ファイル一覧

### current 系（2026-03-17〜18 の最新教訓）

| ファイル | カテゴリ | 含まれるタスク | 行数 |
| --- | --- | --- | --- |
| [lessons-learned-current-safetygrate-ipc-gap.md](lessons-learned-current-safetygrate-ipc-gap.md) | SafetyGate / IPC GAP 修正 | TASK-SKILL-LIFECYCLE-08, UT-06-003, UT-06-005, TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 | ~324 |
| [lessons-learned-current-electron-menu-docs-task0912.md](lessons-learned-current-electron-menu-docs-task0912.md) | Electron Menu / Skill Docs / Task09-12 | TASK-FIX-ELECTRON-APP-MENU-ZOOM-001, TASK-IMP-SKILL-DOCS-AI-RUNTIME-001, P64/P65 | ~127 |

### v2.0 分割ファイル（2026-03-14〜17）

| ファイル | カテゴリ | 含まれるタスク | 行数 |
| --- | --- | --- | --- |
| [lessons-learned-viewtype-electron-ui.md](lessons-learned-viewtype-electron-ui.md) | ViewType / Electron UI | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 | ~160 |
| [lessons-learned-ipc-preload-runtime.md](lessons-learned-ipc-preload-runtime.md) | IPC / Preload / AI Runtime | P57-P61, TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 | ~180 |
| [lessons-learned-test-typesafety.md](lessons-learned-test-typesafety.md) | テスト / 型安全 / 品質 | UT-06-001, UT-06-005 | ~150 |
| [lessons-learned-phase12-workflow-lifecycle.md](lessons-learned-phase12-workflow-lifecycle.md) | Phase 12 / ワークフロー | TASK-SKILL-LIFECYCLE-04/05/06/07 | ~220 |

---

## クイックリファレンス: カテゴリ別検索ガイド

### SafetyGate / IPC GAP 修正 / バリデーション
-> [lessons-learned-current-safetygrate-ipc-gap.md](lessons-learned-current-safetygrate-ipc-gap.md)
- TASK-SKILL-LIFECYCLE-08 仕様書作成（worktree コンフリクト、55ファイル整合性、並列エージェント断絶）
- TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001（GAP-03 影響範囲、enum 値テスト回帰、P42 バリデーション順序）
- PermissionStore DI スコープ問題（P62）、metadataProvider 抽象化境界（P63）
- UT-06-003 SafetyGate（IPC レスポンス wrapper P60、DIP 違反 P61、P49 as キャスト残存）

### Electron Menu / Skill Docs AI Runtime / Task09-12
-> [lessons-learned-current-electron-menu-docs-task0912.md](lessons-learned-current-electron-menu-docs-task0912.md)
- Electron role ベースメニュー、Main Process エントリポイント副作用
- Constructor Injection / bind() パターン、CapabilityResolver
- P64（GAP ID正本テーブル後追い付番）、P65（Phase 2設計での存在しないProps前提）

### ViewType / 画面遷移 / Electron メニュー
-> [lessons-learned-viewtype-electron-ui.md](lessons-learned-viewtype-electron-ui.md)
- `renderView` 分岐テスト、screenshot 到達確認、P40 テスト実行ディレクトリ依存

### IPC / Preload / AI Runtime / 認証
-> [lessons-learned-ipc-preload-runtime.md](lessons-learned-ipc-preload-runtime.md)
- AuthMode 値乖離（P57）、同名ファイル二重存在（P58）、Preload API 未公開（P59）
- サービススコープ制限（P60）、動的アダプタ注入（P61）
- LLM adapter bind() パターン、CapabilityResolver、esbuild platform mismatch

### テスト / 型安全 / 品質検証
-> [lessons-learned-test-typesafety.md](lessons-learned-test-typesafety.md)
- Object.freeze + satisfies パターン（P19 再発防止）
- PERMISSION_MAX_RETRIES デッドコード化、abortedExecutions メモリリーク

### Phase 12 / ワークフロー / ライフサイクル設計
-> [lessons-learned-phase12-workflow-lifecycle.md](lessons-learned-phase12-workflow-lifecycle.md)
- 設計タスクでの仕様書更新先送り（P57）、未タスク指示書配置省略（P58）
- 並列エージェント changelog 件数不整合（P59）
- Phase 11 必須成果物、artifacts.json 逐次更新忘れ

---

> 2026-03-16 TASK-SKILL-LIFECYCLE-06/07、2026-03-15 TASK-SKILL-LIFECYCLE-05、2026-03-14 TASK-SKILL-LIFECYCLE-04 は [lessons-learned-phase12-workflow-lifecycle.md](lessons-learned-phase12-workflow-lifecycle.md) を参照。
> 2026-03-16 UT-06-005 Permission Fallback（S-PF-1〜S-PF-3）は [lessons-learned-safety-gate-permission-fallback.md](lessons-learned-safety-gate-permission-fallback.md) を参照。
> 2026-03-14 TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001（P57〜P61）は [lessons-learned-ipc-preload-runtime.md](lessons-learned-ipc-preload-runtime.md) を参照。
> 2026-03-13 以前の教訓は [lessons-learned-archive-2026-03.md](lessons-learned-archive-2026-03.md) を参照。
