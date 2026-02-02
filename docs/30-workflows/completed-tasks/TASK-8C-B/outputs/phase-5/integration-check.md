# Phase 5: 連携確認書

## メタ情報

| 項目     | 値                           |
| -------- | ---------------------------- |
| Phase    | 5                            |
| タスクID | TASK-8C-B                    |
| タスク名 | E2Eテスト - スキル選択フロー |
| 作成日   | 2026-02-02                   |

## 1. フィクスチャ連携確認

### 1.1 テストスキルフィクスチャ

| 確認項目                                          | 状況 | 備考                        |
| ------------------------------------------------- | ---- | --------------------------- |
| `__fixtures__/skills/test-skill/SKILL.md` 存在    | ✅   | E2Eテスト用スキル           |
| `__fixtures__/skills/another-skill/SKILL.md` 存在 | ✅   | 複数スキルテスト用          |
| SKILL.md フォーマット正常                         | ✅   | YAML frontmatter + Markdown |

### 1.2 フィクスチャ内容

#### test-skill

```yaml
name: test-skill
description: E2Eテスト用のスキル
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
```

#### another-skill

```yaml
name: another-skill
description: 複数スキルテスト用
```

### 1.3 フィクスチャパス設定

| 設定         | 値                                            |
| ------------ | --------------------------------------------- |
| 絶対パス     | `path.join(__dirname, "__fixtures__/skills")` |
| 環境変数キー | `TEST_SKILLS_DIR`                             |
| 実行時参照   | `process.env.TEST_SKILLS_DIR`                 |

## 2. コンポーネント連携確認

### 2.1 SkillSelector

| 確認項目                 | ファイル                                          | 状況 |
| ------------------------ | ------------------------------------------------- | ---- |
| コンポーネント存在       | `src/renderer/components/skill/SkillSelector.tsx` | ✅   |
| ARIA属性実装             | role, aria-haspopup, aria-expanded                | ✅   |
| キーボードナビゲーション | handleKeyDown実装                                 | ✅   |
| 外側クリック閉じ         | handleClickOutside実装                            | ✅   |

### 2.2 ChatPanel

| 確認項目           | ファイル                                     | 状況 |
| ------------------ | -------------------------------------------- | ---- |
| コンポーネント存在 | `src/renderer/components/chat/ChatPanel.tsx` | ✅   |
| SkillSelector統合  | `<SkillSelector />` インポート・配置         | ✅   |
| data-testid        | `chat-panel`, `chat-header`                  | ✅   |

### 2.3 Zustand Store

| 確認項目          | ファイル                 | 状況 |
| ----------------- | ------------------------ | ---- |
| useSkillStore存在 | `src/renderer/store/`    | ✅   |
| selectedSkillName | 選択スキル名状態         | ✅   |
| selectSkillByName | スキル選択アクション     | ✅   |
| availableSkills   | 利用可能スキル一覧       | ✅   |
| importedSkills    | インポート済みスキル一覧 | ✅   |

## 3. IPC連携確認

### 3.1 Preload API

| API                                             | 用途               | 状況 |
| ----------------------------------------------- | ------------------ | ---- |
| `window.electronAPI.skill.getAvailableSkills()` | スキル一覧取得     | ✅   |
| `window.electronAPI.skill.getImportedSkills()`  | インポート済み取得 | ✅   |
| `window.electronAPI.skill.selectSkill(name)`    | スキル選択         | ✅   |
| `window.electronAPI.skill.resetForTesting()`    | テスト状態リセット | ⚠️   |

**注記**: `resetForTesting` は実装されていない可能性があるため、オプショナルチェイニングで呼び出す。

### 3.2 IPC通信フロー

```
E2Eテスト (Playwright)
    ↓ page.evaluate()
Renderer Process
    ↓ window.electronAPI.skill.xxx()
Preload Script
    ↓ ipcRenderer.invoke()
Main Process
    ↓ skill handler
Response
```

## 4. 依存タスク連携確認

### 4.1 TASK-7D (ChatPanel統合)

| 確認項目              | 状況 | 備考                         |
| --------------------- | ---- | ---------------------------- |
| SkillSelector統合完了 | ✅   | ChatPanelヘッダー内に配置    |
| UIコンポーネント動作  | ✅   | ドロップダウン開閉、選択機能 |

### 4.2 TASK-8C-E (テストフィクスチャ)

| 確認項目          | 状況 | 備考               |
| ----------------- | ---- | ------------------ |
| test-skill存在    | ✅   | 基本テスト用       |
| another-skill存在 | ✅   | 複数スキルテスト用 |
| フォーマット準拠  | ✅   | SKILL.md形式       |

### 4.3 並列タスク

| タスク    | 確認項目 | 状況 | 備考             |
| --------- | -------- | ---- | ---------------- |
| TASK-8C-C | 競合なし | ✅   | 別テストファイル |
| TASK-8C-D | 競合なし | ✅   | 別テストファイル |

## 5. セレクタ連携確認

### 5.1 実装との整合性

| セレクタ                     | コンポーネント実装         | 整合性 |
| ---------------------------- | -------------------------- | ------ |
| `[role="combobox"]`          | `role="combobox"`          | ✅     |
| `[aria-haspopup="listbox"]`  | `aria-haspopup="listbox"`  | ✅     |
| `[role="listbox"]`           | `role="listbox"`           | ✅     |
| `[role="option"]`            | `role="option"`            | ✅     |
| `[data-testid="chat-panel"]` | `data-testid="chat-panel"` | ✅     |

## 6. テスト実行確認

### 6.1 実行コマンド

```bash
# ビルド
pnpm --filter @repo/desktop build

# E2Eテスト実行
pnpm --filter @repo/desktop test skillSelection.e2e.ts
```

### 6.2 期待結果

| 項目               | 期待値           |
| ------------------ | ---------------- |
| テストファイル認識 | ✅               |
| テストケース数     | 8件              |
| Electron起動       | 成功             |
| 全テストPASS       | 目標（環境依存） |

## 完了チェック

- [x] テストフィクスチャとの連携が確認されている
- [x] コンポーネント実装との整合性が確認されている
- [x] IPC APIの確認が完了している
- [x] 依存タスクとの連携が確認されている
- [x] セレクタの整合性が確認されている
