# Phase 1: 要件定義 - 検索パネル EditorView 統合

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| フェーズ   | Phase 1                                |
| 名称       | 要件定義                               |
| 目的       | EditorView統合の要件・受入基準を明確化 |
| 前提Phase  | -                                      |
| 次Phase    | Phase 2: 設計                          |
| ステータス | 未実施                                 |

---

## 目的

Phase 5 で実装した検索パネルコンポーネントを EditorView に統合するための要件を明確に定義し、受入基準を確立する。

---

## 実行タスク

### Task 1: 機能要件の定義

**目的**: 統合後に実現すべき機能を明確化する

**実行内容**:

1. ファイル内検索機能の要件を定義
   - `Cmd+F` / `Ctrl+F` で SearchPanel を開く
   - 検索クエリ入力でマッチをハイライト表示
   - 次へ/前へナビゲーション（Enter / Shift+Enter）
   - 検索オプション（大文字小文字区別、単語単位、正規表現）
   - `Escape` でパネルを閉じる

2. ファイル内置換機能の要件を定義
   - `Cmd+T` / `Ctrl+T` で置換行を表示
   - 置換テキスト入力
   - 現在のマッチを置換
   - 全マッチを一括置換

3. ワークスペース検索機能の要件を定義
   - `Cmd+Shift+F` / `Ctrl+Shift+F` で WorkspaceSearchPanel を開く
   - ワークスペース全体の検索
   - 検索結果のファイル別グルーピング表示
   - 結果クリックでファイルを開き該当行にジャンプ

**完了条件**:

- [ ] 機能要件一覧が `outputs/phase-1/functional-requirements.md` に文書化されている
- [ ] 各機能の入力/出力が明確に定義されている

### Task 2: 非機能要件の定義

**目的**: 品質特性に関する要件を定義する

**実行内容**:

1. パフォーマンス要件
   - 検索デバウンス: 150-300ms
   - 大量結果の仮想化レンダリング
   - 検索キャンセル機能

2. アクセシビリティ要件
   - WCAG 2.1 AA 準拠維持
   - キーボード完全対応
   - aria-label 適切配置
   - フォーカス管理

3. テスト要件
   - 既存テスト 94 件全合格維持
   - 統合テスト追加
   - カバレッジ目標: Line 80%+

**完了条件**:

- [ ] 非機能要件一覧が `outputs/phase-1/non-functional-requirements.md` に文書化されている
- [ ] 各要件に測定可能な基準が設定されている

### Task 3: 統合要件の定義

**目的**: EditorView との統合に必要な接続要件を定義する

**実行内容**:

1. EditorInstance インターフェース要件
   - `getContent()`: エディタ内容の取得
   - `setHighlights()`: マッチのハイライト設定
   - `scrollToLine()`: 行へのスクロール
   - `replaceText()`: テキスト置換
   - その他必要なメソッド

2. 状態管理の接続要件
   - useSearchStore との連携
   - EditorView の状態との同期

3. キーボードショートカットの接続要件
   - useSearchKeyboardShortcuts フックの統合
   - 既存ショートカットとの競合回避

**完了条件**:

- [ ] EditorInstance インターフェース要件が定義されている
- [ ] 状態管理の接続ポイントが明確化されている
- [ ] キーボードショートカットの接続方法が決定されている

### Task 4: 受入基準の確立

**目的**: タスク完了の判断基準を明確化する

**実行内容**:

以下の受入基準を文書化:

| カテゴリ         | 受入基準                                     |
| ---------------- | -------------------------------------------- |
| 機能             | `Cmd+F` で SearchPanel が開く                |
| 機能             | `Cmd+Shift+F` で WorkspaceSearchPanel が開く |
| 機能             | 検索・置換・ナビゲーションが正常動作         |
| 品質             | 既存テスト 94 件全合格                       |
| 品質             | TypeScript エラー 0 件                       |
| 品質             | ESLint 警告 0 件                             |
| アクセシビリティ | WCAG 2.1 AA 準拠                             |

**完了条件**:

- [ ] 受入基準チェックリストが `outputs/phase-1/acceptance-criteria.md` に文書化されている
- [ ] 各基準に検証方法が記載されている

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料           | パス                                                                       | 内容                  |
| ------------------ | -------------------------------------------------------------------------- | --------------------- |
| 検索パネルUI設計   | `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md`  | 検索パネルのUI/UX仕様 |
| Search Service API | `.claude/skills/aiworkflow-requirements/references/api-internal-search.md` | 検索サービスAPI仕様   |
| パネルUI/UXガイド  | `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`        | パネル共通UI/UX仕様   |

### 既存実装

| 参照資料               | パス                                                   | 内容           |
| ---------------------- | ------------------------------------------------------ | -------------- |
| Phase 5 コンポーネント | `apps/desktop/src/features/search/`                    | 検索パネル実装 |
| 既存 EditorView        | `apps/desktop/src/renderer/views/EditorView/index.tsx` | 統合先のビュー |
| 検索パネル型定義       | `apps/desktop/src/features/search/types.ts`            | 型定義         |

---

## 成果物

| 成果物                 | パス                                             |
| ---------------------- | ------------------------------------------------ |
| 機能要件定義書         | `outputs/phase-1/functional-requirements.md`     |
| 非機能要件定義書       | `outputs/phase-1/non-functional-requirements.md` |
| 統合要件定義書         | `outputs/phase-1/integration-requirements.md`    |
| 受入基準チェックリスト | `outputs/phase-1/acceptance-criteria.md`         |

---

## 完了条件

- [ ] 機能要件が明確に定義されている
- [ ] 非機能要件が測定可能な基準で定義されている
- [ ] EditorInstance インターフェース要件が確立されている
- [ ] 受入基準チェックリストが作成されている
- [ ] 全ての成果物が outputs/phase-1/ に出力されている

---

## 次のPhaseへの引き継ぎ

Phase 2（設計）では、本Phaseで定義した要件に基づいて以下を設計:

- EditorInstance アダプターの詳細設計
- EditorView 統合のコンポーネント構成
- 状態管理の接続設計
- キーボードショートカットの接続設計
