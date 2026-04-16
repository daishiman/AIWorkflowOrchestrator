# クイックリファレンス — 検索パターン集（インデックス）

> 機能・タスク別の仕様検索キーワードと読む順番
> 早見表（型定義/IPC/ディレクトリ等）は [quick-reference.md](quick-reference.md) を参照

---

## 仕様検索の分割ルール

- `search-spec.js` は **1概念1クエリ** で分割して使う
- 例: `TASK-10A-F useSkillAnalysis SkillCreateWizard` のようにまとめず、`TASK-10A-F` → `useSkillAnalysis` → `SkillCreateWizard` → `skillError` の順で個別検索する
- broad query が 0 件でも、resource-map / quick-reference / topic-map から再入場して取りこぼしを防ぐ

## 分割ファイル一覧

| ファイル | 内容 |
|---------|------|
| [quick-reference-search-patterns-skill-lifecycle.md](quick-reference-search-patterns-skill-lifecycle.md) | スキルライフサイクル関連の検索パターン（一次導線, ViewType, 評価・採点, 利用導線, 信頼・権限, 履歴・フィードバック） |
| [quick-reference-search-patterns-ipc-infra.md](quick-reference-search-patterns-ipc-infra.md) | IPC/セキュリティ/インフラ関連の検索パターン（Permission Fallback, SafetyGate, safeInvoke, Light Theme, Workspace, Main Chat/Settings, AI runtime, Skill/Agent routing, Chat Edit, Skill Docs） |
| [quick-reference-search-patterns-code.md](quick-reference-search-patterns-code.md) | コードパターン早見（Electron IPC, IPC transport DTO, ハンドラライフサイクル, Supabase fallback, Result Pattern, Zustand, P31対策, Store selector, CTA制御, ChatPanel統合） |
