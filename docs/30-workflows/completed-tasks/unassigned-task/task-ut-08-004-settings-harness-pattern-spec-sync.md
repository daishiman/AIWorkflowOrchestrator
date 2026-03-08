# UT-08-004 SettingsView 統合ハーネス仕様同期 - タスク指示書

## メタ情報

| 項目         | 内容                              |
| ------------ | --------------------------------- |
| タスクID     | UT-08-004                         |
| タスク名     | SettingsView 統合ハーネス仕様同期 |
| 分類         | 改善                              |
| 対象機能     | testing-component-patterns 正本   |
| 優先度       | 低                                |
| 見積もり規模 | 小規模                            |
| ステータス   | 未実施                            |
| 発見元       | 08-TASK Phase 12                  |
| 発見日       | 2026-03-08                        |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

SettingsView で有効だった統合ハーネス設計（store + electronAPI 一本化）が、正本仕様書に未反映。

### 1.2 問題点・課題

次タスクで同じ設計を再発明し、品質がぶれる。

### 1.3 放置した場合の影響

過剰モック再発やP31/P39/P40系の再発率が上がる。

## 2. 何を達成するか（What）

### 2.1 目的

`testing-component-patterns.md` に再利用可能な統合ハーネスパターンを追加する。

### 2.2 最終ゴール

Settings系以外でも同パターンを適用できる仕様記述がある。

### 2.3 スコープ

#### 含むもの

- ハーネス生成パターン
- vi.mock hoist対策
- `fireEvent + act` 基準

#### 含まないもの

- テストフレームワーク置換
- 既存全テストの一括書換

### 2.4 成果物

- `testing-component-patterns.md` 追記
- changelog/lessons 反映

## 3. どのように実行するか（How）

### 3.1 前提条件

- 08-TASK の統合テスト実装が存在

### 3.2 依存タスク

- 08-TASK 実装成果物

### 3.3 必要な知識

- Vitest `vi.mock` hoist
- Zustand selectorモック

### 3.4 推奨アプローチ

設定タスク固有名を避け、汎用ハーネスパターンとして定義する。

## 4. 実行手順

1. 現行ハーネスの責務を抽出
2. 汎用パターンとして文書化
3. pitfalls参照（P31/P39/P40）を追加
4. 仕様リンクを task-workflow/lessons と同期

## 5. 完了条件チェックリスト

- [ ] testing-component-patterns に新規節が追加される
- [ ] 既存パターンと矛盾しない
- [ ] 参照導線が task-workflow/lessons と整合

## 6. 検証方法

- `rg "統合テスト用ハーネス|S-INT-HARNESS" .claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`

## 7. リスクと対策

| リスク                   | 影響度 | 発生確率 | 対策                   |
| ------------------------ | ------ | -------- | ---------------------- |
| 抽象化しすぎて再利用不能 | 中     | 中       | コード例を最小限で併記 |
| 固有実装依存の混入       | 低     | 中       | 命名を汎用化して記述   |

## 8. 参照情報

- `apps/desktop/src/renderer/views/SettingsView/__tests__/settings-test-harness.ts`
- `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`

## 9. 備考

- 本タスクは仕様同期タスク。機能動作変更は含まない。
