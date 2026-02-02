# Phase 1: 要件定義書

## メタ情報

| 項目     | 値                           |
| -------- | ---------------------------- |
| Phase    | 1                            |
| タスクID | TASK-8C-B                    |
| タスク名 | E2Eテスト - スキル選択フロー |
| 作成日   | 2026-02-02                   |
| 更新日   | 2026-02-02                   |

## 1. テスト対象コンポーネント

### 1.1 SkillSelector

- **パス**: `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`
- **責務**: スキル選択ドロップダウンUI
- **ARIA属性**:
  - トリガーボタン: `role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded`
  - ドロップダウン: `role="listbox"`, `id="skill-listbox"`
  - オプション: `role="option"`, `aria-selected`

### 1.2 ChatPanel統合

- **パス**: `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`
- **統合**: SkillSelectorがChatPanelヘッダー内に配置

## 2. 機能要件（FR）

| ID    | 要件                                     | 優先度 | 実装状況 |
| ----- | ---------------------------------------- | ------ | -------- |
| FR-01 | スキルセレクターがChatPanelに表示される  | 高     | 実装済み |
| FR-02 | ドロップダウンが開閉できる               | 高     | 実装済み |
| FR-03 | 利用可能なスキル一覧が表示される         | 高     | 実装済み |
| FR-04 | スキルを選択できる                       | 高     | 実装済み |
| FR-05 | 「なし」を選択してスキル選択を解除できる | 高     | 実装済み |
| FR-06 | キーボードナビゲーションが動作する       | 中     | 実装済み |
| FR-07 | 外側クリックでドロップダウンが閉じる     | 中     | 実装済み |

## 3. 非機能要件（NFR）

| ID     | 要件                                           | 優先度 | 検証方法         |
| ------ | ---------------------------------------------- | ------ | ---------------- |
| NFR-01 | テストは安定して再現可能であること             | 高     | 5回連続実行PASS  |
| NFR-02 | テスト実行時間は10秒以内であること（各ケース） | 中     | タイムアウト設定 |
| NFR-03 | アクセシビリティ属性（aria-label等）を検証     | 中     | ARIA属性テスト   |

## 4. テストケース要件

| No  | テストケースID | 要件                                                   | 対応FR/NFR    |
| --- | -------------- | ------------------------------------------------------ | ------------- |
| 1   | TC-SEL-001     | スキルセレクターがChatPanelに表示されることを検証      | FR-01, NFR-03 |
| 2   | TC-SEL-002     | ドロップダウンが開き、スキル一覧が表示されることを検証 | FR-02, FR-03  |
| 3   | TC-SEL-003     | スキルをクリックして選択できることを検証               | FR-04         |
| 4   | TC-SEL-004     | 「なし」を選択してスキル選択解除できることを検証       | FR-05         |
| 5   | TC-SEL-005     | キーボードナビゲーションで操作できることを検証         | FR-06, NFR-03 |
| 6   | TC-SEL-006     | 外側クリックでドロップダウンが閉じることを検証         | FR-07         |

## 5. 接続要件（IPC/UI連携/データフロー）

### 5.1 Electron IPC

| API                                              | 用途                     | 必要性 |
| ------------------------------------------------ | ------------------------ | ------ |
| `window.electronAPI?.skill?.resetForTesting?.()` | テスト状態リセット       | 高     |
| `skill.getImportedSkills()`                      | インポート済みスキル取得 | 高     |
| `skill.getAvailableSkills()`                     | 利用可能スキル取得       | 高     |

### 5.2 UI連携

| コンポーネント | 連携内容                         |
| -------------- | -------------------------------- |
| ChatPanel      | SkillSelectorをヘッダー内に配置  |
| SkillSelector  | ドロップダウンUI、キーボード操作 |
| ZustandStore   | selectedSkillName状態管理        |

### 5.3 データフロー

```
Main Process
    ↓ (IPC: skill.getAvailableSkills)
Preload
    ↓ (window.electronAPI)
Renderer (SkillSelector)
    ↓ (useSkillStore)
Zustand Store
    ↓ (selectedSkillName)
UI Update
```

## 6. テスト環境要件

| 項目               | 値                                                |
| ------------------ | ------------------------------------------------- |
| テストランナー     | Vitest                                            |
| E2Eフレームワーク  | Playwright (Electron mode)                        |
| スキルディレクトリ | `TEST_SKILLS_DIR` 環境変数でフィクスチャ指定      |
| NODE_ENV           | `test`                                            |
| フィクスチャ       | `apps/desktop/src/__tests__/__fixtures__/skills/` |

## 7. 依存タスク

| タスクID  | 名称                    | 依存関係 |
| --------- | ----------------------- | -------- |
| TASK-7D   | ChatPanel統合           | 依存元   |
| TASK-8C-E | テストフィクスチャ作成  | 依存元   |
| TASK-8C-C | E2Eインポート実行テスト | 並列     |
| TASK-8C-D | E2E権限フローテスト     | 並列     |

## 完了チェック

- [x] 6件のテストケース要件が抽出されている
- [x] 各テストケースに受け入れ基準がある
- [x] FR/NFRが分類されている
- [x] テスト優先度が設定されている
- [x] 接続要件（IPC/UI連携/データフロー）が明記されている
