# Phase 2: 設計

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 2                            |
| 機能名 | TASK-8C-C-e2e-import-execute |
| 作成日 | 2026-02-02                   |

## 目的

E2Eテストのアーキテクチャ設計とテスト構造を定義する。

## 実行タスク

- テストアーキテクチャ設計: Playwright + Vitest + Electron統合の設計
- テストファイル構造設計: テストスイート・テストケースの構成設計
- フィクスチャ連携設計: TASK-8C-Eフィクスチャの参照設計

## 参照資料

| 資料名        | パス                                                                       | 説明                |
| ------------- | -------------------------------------------------------------------------- | ------------------- |
| 要件定義書    | `outputs/phase-1/requirements-definition.md`                               | Phase 1成果物       |
| E2Eテスト仕様 | `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md` | E2Eテスト設計ガイド |

## 実行手順

### ステップ1: テストアーキテクチャ設計

**Electron + Playwright統合構成**:

| コンポーネント         | 役割                             |
| ---------------------- | -------------------------------- |
| Playwright `_electron` | Electronアプリケーション起動     |
| ElectronApplication    | アプリインスタンス管理           |
| Page                   | Rendererプロセスの操作           |
| TEST_SKILLS_DIR        | フィクスチャディレクトリ環境変数 |

**テスト環境設定**:

| 設定項目     | 値                                                 |
| ------------ | -------------------------------------------------- |
| 起動パス     | `path.join(__dirname, "../../dist/main/index.js")` |
| NODE_ENV     | `test`                                             |
| フィクスチャ | `path.join(__dirname, "__fixtures__/skills")`      |

### ステップ2: テストファイル構造設計

**ファイル配置**:

```
apps/desktop/src/__tests__/
├── skillImportExecution.e2e.ts       # 本タスクで作成
├── __fixtures__/
│   └── skills/                        # TASK-8C-Eで作成済み
│       ├── test-skill/
│       ├── another-skill/
│       └── invalid-skill/
```

**テストスイート構成**:

| describe             | it（テストケース）                              |
| -------------------- | ----------------------------------------------- |
| Skill Import Flow    | should open import dialog for unimported skill  |
| Skill Import Flow    | should display skill details in import dialog   |
| Skill Import Flow    | should import skill and add to imported list    |
| Skill Execution Flow | should show streaming view when executing       |
| Skill Execution Flow | should display abort button while executing     |
| Skill Execution Flow | should abort execution when stop button clicked |

### ステップ3: セレクタ設計

**UIセレクタ一覧**:

| 要素                       | セレクタ                               |
| -------------------------- | -------------------------------------- |
| スキル選択ボタン           | `[aria-label="スキルを選択"]`          |
| インポートボタン           | `[data-testid="import-skill-button"]`  |
| インポートダイアログ       | `text="スキルをインポート"`            |
| チャット入力               | `[data-testid="chat-input"]`           |
| ストリーミングビュー       | `[data-testid="skill-streaming-view"]` |
| 停止ボタン                 | `button:has-text("停止")`              |
| キャンセル表示             | `text="キャンセル"`                    |
| インポート済みセクション   | `text="インポート済み"`                |
| 許可ツールセクション       | `text="許可ツール"`                    |
| サブエージェントセクション | `text="サブエージェント"`              |

### ステップ4: ヘルパー関数設計

| ヘルパー        | 用途                         |
| --------------- | ---------------------------- |
| resetForTesting | テスト間のスキル状態リセット |
| importSkill     | プログラム的スキルインポート |

## 統合テスト連携【必須】

統合ポイントと契約を設計:

| 統合ポイント     | 契約定義                                   |
| ---------------- | ------------------------------------------ |
| Electron起動     | `electron.launch()` + 環境変数設定         |
| フィクスチャ参照 | `TEST_SKILLS_DIR` 環境変数                 |
| IPC経由操作      | `window.electronAPI?.skill?.import?.()` 等 |

## アーキテクチャ層別設計

| 層               | 設計観点                                     |
| ---------------- | -------------------------------------------- |
| E2Eテスト層      | Playwright APIでUI操作、Electronプロセス制御 |
| Renderer Process | セレクタによる要素取得・操作                 |
| IPC通信          | `page.evaluate()`経由でのAPI呼び出し         |

## 成果物

| 成果物             | パス                                     | 説明           |
| ------------------ | ---------------------------------------- | -------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | テスト構造     |
| セレクタ設計       | `outputs/phase-2/selector-design.md`     | UIセレクタ一覧 |

## 完了条件

- [ ] テストアーキテクチャが定義されている
- [ ] テストスイート構成が設計されている
- [ ] UIセレクタが一覧化されている
- [ ] フィクスチャ連携方法が明確化されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビューゲート
