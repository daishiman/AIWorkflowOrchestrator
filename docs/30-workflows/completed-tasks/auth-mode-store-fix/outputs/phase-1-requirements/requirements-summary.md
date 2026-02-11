# Phase 1: 要件定義サマリー

## メタ情報

| 項目      | 内容                                 |
| --------- | ------------------------------------ |
| タスクID  | UT-FIX-STORE-HOOKS-INFINITE-LOOP-001 |
| 関連Issue | #763                                 |
| 親タスク  | UT-AUTH-MODE-UI-001                  |
| 作成日    | 2026-02-10                           |

---

## 問題概要

Zustand Store Hooksが毎回新しいオブジェクトを返すため、`useEffect`の依存配列に含めると無限ループが発生する。

### 影響コンポーネント

| コンポーネント   | 問題の関数         | 症状                       |
| ---------------- | ------------------ | -------------------------- |
| SettingsView     | initializeAuthMode | 無限ローディング           |
| LLMSelectorPanel | fetchProviders     | プロバイダー取得が無限実行 |
| LLMSelectorPanel | checkHealth        | ヘルスチェックが無限実行   |
| SkillSelector    | rescanSkills       | 再スキャンが勝手に実行     |

---

## 受入基準（必須）

| ID     | 要件                                               |
| ------ | -------------------------------------------------- |
| AC-001 | SettingsViewを開いても無限ローディングが発生しない |
| AC-002 | initializeAuthModeが1回だけ実行される              |
| AC-003 | fetchProvidersが1回だけ実行される                  |
| AC-004 | checkHealthがprovider変更時のみ実行                |
| AC-005 | rescanSkillsが手動操作時のみ実行される             |
| AC-006 | TypeScriptの型エラーが発生しない                   |
| AC-007 | ESLintエラーが発生しない                           |
| AC-008 | 既存の単体テストがすべてPASS                       |

---

## スコープ

### 対象

- SettingsView: initializeAuthModeのuseEffectをuseRefで保護
- LLMSelectorPanel: fetchProviders/checkHealthのuseEffectを修正
- SkillSelector: rescanSkillsのuseCallback依存配列を確認・修正
- 既存テスト: 修正による影響がないことを確認

### 対象外

- Store Hooks自体の再設計（将来タスク）
- AgentViewの潜在的問題（別タスクで対応）
- store/index.tsの修正

---

## 成果物

- 要件定義書: `docs/30-workflows/auth-mode-store-fix/phase-1-requirements.md`
