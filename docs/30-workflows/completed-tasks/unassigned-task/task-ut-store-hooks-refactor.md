# UT-STORE-HOOKS-REFACTOR-001: Store Hooksを個別セレクタベースに再設計

> **この未タスクは完了済みです**
>
> UT-STORE-HOOKS-COMPONENT-MIGRATION-001（2026-02-12完了）で実施されました。
> task-workflow.md の残課題テーブルでも取り消し線で完了マークされています。

---

## メタ情報

| 項目       | 値                                                        |
| ---------- | --------------------------------------------------------- |
| タスクID   | UT-STORE-HOOKS-REFACTOR-001                               |
| タスク名   | Store Hooksを個別セレクタベースに再設計                   |
| 優先度     | 中                                                        |
| 検出元     | TASK-UT-AUTH-MODE-UI-INTEGRATION タスク仕様書 セクション8 |
| ステータス | **完了**（UT-STORE-HOOKS-COMPONENT-MIGRATION-001で実施）  |
| 完了日     | 2026-02-12                                                |

---

## 背景

P31（Zustand Store Hooks無限ループ）の根本解決策として、合成Store Hook（`useAuthModeStore()`, `useLLMStore()`, `useSkillStore()`）が毎回新しいオブジェクトを返す問題を、個別セレクタベースのHookに再設計する必要があった。

## 解決内容

UT-STORE-HOOKS-COMPONENT-MIGRATION-001 で以下を実施:

1. **個別セレクタHook 30個の実装**
   - LLM系: 12個（`useLLMModels()`, `useSetLLMModels()` 等）
   - Skill系: 15個（`useSkills()`, `useSetSkills()` 等）
   - AuthMode追加: 3個（`useAuthModeInitialized()` 等）

2. **コンポーネント移行 3件**
   - `LLMSelectorPanel.tsx`: useRefガード除去、個別セレクタ使用
   - `SkillSelector.tsx`: 個別セレクタ使用
   - `SettingsView/index.tsx`: useRefガード除去、個別セレクタ使用

3. **テスト 71件PASS**
   - 参照安定性テスト: 31件
   - 無限ループ防止テスト: 40件

---

## 参照

- 実装タスク: `docs/30-workflows/UT-STORE-HOOKS-COMPONENT-MIGRATION-001/`
- P31: `.claude/rules/06-known-pitfalls.md`
