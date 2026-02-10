# Phase 1: 要件定義

## メタ情報

| 項目      | 内容                                 |
| --------- | ------------------------------------ |
| タスクID  | UT-FIX-STORE-HOOKS-INFINITE-LOOP-001 |
| Phase     | 1 - 要件定義                         |
| 作成日    | 2026-02-10                           |
| 前提Phase | なし                                 |
| 次Phase   | Phase 2（設計）                      |
| 関連Issue | #763                                 |
| 親タスク  | UT-AUTH-MODE-UI-001                  |
| 発見元    | Phase 11（手動テスト検証）           |

---

## 1. ユーザーストーリー

### 1.1 主要ストーリー

**As a** ユーザー
**I want** 設定画面を正常に開いて認証方式を選択できること
**So that** Claude Agent SDKの認証方式を安全に切り替えられる

### 1.2 サブストーリー

| ID    | ユーザー | 目標                                      | 価値                        |
| ----- | -------- | ----------------------------------------- | --------------------------- |
| US-01 | ユーザー | 設定画面が無限ローディングにならない      | 設定変更操作が可能になる    |
| US-02 | ユーザー | LLM選択パネルが正常に表示される           | LLMプロバイダーを選択できる |
| US-03 | ユーザー | スキル選択ドロップダウンが正常に動作する  | スキルを選択して実行できる  |
| US-04 | 開発者   | useEffectの依存配列による無限ループを回避 | 安定したUI動作を提供できる  |

---

## 2. 受入基準

### 2.1 機能要件

| ID     | 要件                                                    | 優先度 | 検証方法        |
| ------ | ------------------------------------------------------- | ------ | --------------- |
| AC-001 | SettingsViewを開いても無限ローディングが発生しない      | 必須   | 手動テスト      |
| AC-002 | 認証方式初期化（initializeAuthMode）が1回だけ実行される | 必須   | console.log確認 |
| AC-003 | LLMSelectorPanelのfetchProvidersが1回だけ実行される     | 必須   | console.log確認 |
| AC-004 | LLMSelectorPanelのcheckHealthがprovider変更時のみ実行   | 必須   | 手動テスト      |
| AC-005 | SkillSelectorのrescanSkillsが手動操作時のみ実行される   | 必須   | 手動テスト      |
| AC-006 | TypeScriptの型エラーが発生しない                        | 必須   | pnpm typecheck  |
| AC-007 | ESLintエラーが発生しない（既存警告除く）                | 必須   | pnpm lint       |
| AC-008 | 既存の単体テストがすべてPASS                            | 必須   | pnpm test       |

### 2.2 非機能要件

| ID      | 要件                                            | 優先度 |
| ------- | ----------------------------------------------- | ------ |
| NFR-001 | 修正後のレンダリングパフォーマンスが劣化しない  | 必須   |
| NFR-002 | React StrictModeでも二重実行が発生しない        | 必須   |
| NFR-003 | 将来のStore Hooks再設計の妨げにならない修正方法 | 推奨   |

---

## 3. スコープ

### 3.1 対象（In Scope）

| 項目             | 詳細                                          |
| ---------------- | --------------------------------------------- |
| SettingsView     | initializeAuthModeのuseEffectをuseRefで保護   |
| LLMSelectorPanel | fetchProviders/checkHealthのuseEffectを修正   |
| SkillSelector    | rescanSkillsのuseCallback依存配列を確認・修正 |
| 既存テスト       | 修正による影響がないことを確認                |
| 手動テスト       | 3コンポーネントの正常動作を確認               |

### 3.2 対象外（Out of Scope）

| 項目                    | 理由                                      |
| ----------------------- | ----------------------------------------- |
| Store Hooks自体の再設計 | 将来タスク（UT-STORE-HOOKS-REFACTOR-001） |
| 新規テストケース追加    | 既存テストで動作確認可能                  |
| AgentViewの潜在的問題   | 別タスクで対応（影響範囲が広い）          |
| store/index.tsの修正    | Hook自体ではなく呼び出し側で対処          |

---

## 4. 前提条件

### 4.1 技術的前提

| 項目              | 内容                                          |
| ----------------- | --------------------------------------------- |
| React 18+         | useRefフックが利用可能                        |
| Zustand Store     | 既存のStore構造を変更しない                   |
| TypeScript strict | 型安全な修正を行う                            |
| ESLint設定        | exhaustive-deps警告は無効化せずコメントで対処 |

### 4.2 環境前提

| 項目     | 内容                         |
| -------- | ---------------------------- |
| Node.js  | 20.x                         |
| pnpm     | 9.x                          |
| Electron | 開発環境でのアプリ起動が可能 |

---

## 5. 問題の根本原因分析

### 5.1 現在の問題構造

```
useAuthModeStore()呼び出し
    ↓
毎回新しいオブジェクト{ mode, initializeAuthMode, ... }を返す
    ↓
useEffect依存配列にinitializeAuthModeを含める
    ↓
オブジェクト参照が変わるたびにuseEffectが再実行
    ↓
initializeAuthMode()がfetchMode()を呼び出す
    ↓
状態更新（isLoading変更）
    ↓
コンポーネント再レンダリング
    ↓
useAuthModeStore()呼び出し（ループの始まり）
```

### 5.2 影響コンポーネント詳細

| コンポーネント   | Hook             | 問題の関数         | 症状                       |
| ---------------- | ---------------- | ------------------ | -------------------------- |
| SettingsView     | useAuthModeStore | initializeAuthMode | 無限ローディング           |
| LLMSelectorPanel | useLLMStore      | fetchProviders     | プロバイダー取得が無限実行 |
| LLMSelectorPanel | useLLMStore      | checkHealth        | ヘルスチェックが無限実行   |
| SkillSelector    | useSkillStore    | rescanSkills       | 再スキャンが勝手に実行     |

---

## 6. リスク分析

| リスク                        | 影響度 | 発生確率 | 対策                   |
| ----------------------------- | ------ | -------- | ---------------------- |
| useRefで初期化が2回実行される | 中     | 低       | StrictModeでの動作確認 |
| ESLint exhaustive-depsの警告  | 低     | 高       | コメントで意図を明示   |
| 他に同様のパターンが存在する  | 中     | 中       | grepで全体検索を実施   |
| 修正によりテストが失敗する    | 高     | 低       | テスト実行で確認       |

---

## 7. 成果物

| 成果物               | パス                                                            |
| -------------------- | --------------------------------------------------------------- |
| 要件定義書（本文書） | `docs/30-workflows/auth-mode-store-fix/phase-1-requirements.md` |

---

## 8. 完了条件チェックリスト

- [x] ユーザーストーリーが定義されている
- [x] 受入基準が明確に定義されている
- [x] スコープ（対象・対象外）が明確
- [x] 前提条件が記載されている
- [x] 問題の根本原因が分析されている
- [x] リスクが識別されている
- [x] 成果物パスが明確

---

## 9. 次Phase

**Phase 2: 設計** に進む

- 修正ファイル一覧の確定
- 具体的なコード変更箇所の設計
- 依存関係の整理
