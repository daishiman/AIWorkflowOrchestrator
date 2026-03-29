# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 8                           |
| 機能名 | skill-creation-result-panel |
| 作成日 | 2026-03-29                  |

## 目的

共通 UI ユーティリティの抽出、コンポーネント間の共通パターン統一、Tailwind CSS class の整理を行う。

## 実行タスク

- 共通 UI ユーティリティを抽出する
- コンポーネント間の共通パターンを統一する
- Tailwind CSS class の命名を整理する

## 参照資料

| 資料名              | パス                                     | 説明          |
| ------------------- | ---------------------------------------- | ------------- |
| Phase 2 設計        | `phase-2-design.md`                      | 元設計        |
| Phase 5 実装        | `phase-5-implementation.md`              | 実装対象      |
| Phase 6 テスト拡充  | `phase-6-test-expansion.md`              | edge case     |
| panel props catalog | `outputs/phase-2/panel-props-catalog.md` | props 仕様    |
| Phase 7 coverage    | `phase-7-coverage-check.md`              | coverage 観点 |

## 実行手順

### ステップ1: 共通 UI ユーティリティを抽出する

PlanResultDetailPanel と ExecuteResultDetailPanel に共通するパターン:

- **SectionHeader**: セクション区切り + ヘッダーテキスト
  ```typescript
  function SectionHeader({ title }: { title: string }): JSX.Element;
  ```
- **TagList**: タグ形式の一覧表示（triggers, anchors で共通）
  ```typescript
  function TagList({
    items,
    variant,
  }: {
    items: string[];
    variant?: "default" | "accent";
  }): JSX.Element;
  ```
- **DetailFooter**: ID をフッターに小さく表示（planId, executeId で共通）
  ```typescript
  function DetailFooter({
    label,
    value,
  }: {
    label: string;
    value: string;
  }): JSX.Element;
  ```
- **StatusBadge**: 成功/失敗/pending のバッジ表示
  ```typescript
  function StatusBadge({
    status,
  }: {
    status: "success" | "failure" | "pending";
  }): JSX.Element;
  ```

上記を `result-panel-parts.tsx` として同ディレクトリに配置する候補とする。

### ステップ2: コンポーネント間の共通パターンを統一する

- カードコンテナの class 文字列を定数化する
  ```typescript
  const PANEL_CARD_CLASSES =
    "rounded-lg border bg-white dark:bg-gray-800 p-4 shadow-sm";
  ```
- loading 状態のスケルトンパターンを統一する
- null 状態の early return パターンを統一する
- error 状態の ErrorBanner 表示パターンを統一する

### ステップ3: Tailwind CSS class を整理する

- インライン class 文字列をコンポーネント単位で整理する
- ダークモード対応（`dark:` prefix）の一貫性を確認する
- レスポンシブ対応（`sm:`, `md:` prefix）の必要性を評価する
- ImprovementProposalPanel との class パターン乖離がないことを確認する

## 統合テスト連携

- Phase 6/7 の test case が refactoring 後も pass することを確認する
- Phase 9 で refactoring によるレグレッションがないことを監査する

## 成果物

| 成果物           | パス                     | 説明                             |
| ---------------- | ------------------------ | -------------------------------- |
| refactoring plan | `phase-8-refactoring.md` | ユーティリティ抽出方針と一覧本文 |

## 完了条件

- [ ] 共通 UI ユーティリティが抽出候補として定義されている
- [ ] コンポーネント間のパターンが統一されている
- [ ] Tailwind CSS class の整理方針が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**
