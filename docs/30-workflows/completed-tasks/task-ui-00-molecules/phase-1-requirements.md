# Phase 1: 要件定義 - TASK-UI-00-MOLECULES

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 1                       |
| Phase名    | 要件定義                |
| 前提Phase  | なし                    |
| 後続Phase  | Phase 2                 |
| ステータス | completed（2026-03-04） |
| 作成日     | 2026-03-04              |
| 機能名     | task-ui-00-molecules    |

## 目的

Molecules 5コンポーネントの機能要件、非機能要件、受入基準を確定し、Phase 2 の設計入力を固定する。

## 背景

Phase 1 は前段Phaseの成果物を引き継ぎ、TASK-UI-00-MOLECULES の要件・設計・品質基準を次段へ確実に接続するために実行する。

## 実行タスク

- Task 1-1: SearchBar要件を確定する
- Task 1-2: CodeViewer要件を確定する
- Task 1-3: TabSwitcher要件を確定する
- Task 1-4: SlideInPanel要件を確定する
- Task 1-5: ConfirmDialog要件を確定する
- Task 1-6: 共通非機能要件を確定する

### Task 1-1: SearchBar要件

| 要件ID    | 要件                                         | 受入基準                          |
| --------- | -------------------------------------------- | --------------------------------- |
| SB-REQ-01 | `onChange` は即時発火                        | 入力直後に呼び出し回数が1回増える |
| SB-REQ-02 | `onDebouncedChange` は `debounceMs` 後に発火 | 300ms 既定値で遅延発火を確認      |
| SB-REQ-03 | クリアボタン表示制御                         | 空文字で非表示、文字ありで表示    |
| SB-REQ-04 | `Escape` で入力クリア                        | キー入力後に value が空になる     |
| SB-REQ-05 | `role="searchbox"` を付与                    | DOM属性で確認                     |

### Task 1-2: CodeViewer要件

| 要件ID    | 要件                               | 受入基準                                     |
| --------- | ---------------------------------- | -------------------------------------------- |
| CV-REQ-01 | `showLineNumbers` で行番号表示制御 | true で表示、false で非表示                  |
| CV-REQ-02 | コピー操作を提供                   | `navigator.clipboard.writeText` 呼び出し確認 |
| CV-REQ-03 | コピー後アイコン遷移               | Copy → Check → Copy の順で遷移               |
| CV-REQ-04 | `filePath` 指定時にヘッダー表示    | ファイル名ラベルを表示                       |
| CV-REQ-05 | `aria-label` を保持                | `コード表示` / `コードをコピー` を確認       |

### Task 1-3: TabSwitcher要件

| 要件ID    | 要件                          | 受入基準                         |
| --------- | ----------------------------- | -------------------------------- |
| TS-REQ-01 | `underline` / `pill` を切替   | variant ごとのスタイル差分を確認 |
| TS-REQ-02 | ArrowLeft/ArrowRight 移動     | disabled を除外して移動          |
| TS-REQ-03 | Home/End キー対応             | 先頭/末尾タブへ移動              |
| TS-REQ-04 | `role="tablist"`/`role="tab"` | ARIA属性で確認                   |
| TS-REQ-05 | mobile 横スクロール           | `overflow-x: auto` を確認        |

### Task 1-4: SlideInPanel要件

| 要件ID    | 要件                     | 受入基準                    |
| --------- | ------------------------ | --------------------------- |
| SP-REQ-01 | `isOpen` で開閉制御      | true/false で表示切替       |
| SP-REQ-02 | `side` で左右切替        | left/right の遷移方向を確認 |
| SP-REQ-03 | フォーカストラップを実装 | Tab 循環で閉じ込め確認      |
| SP-REQ-04 | フォーカス復元を実装     | close 後に元要素へ復帰      |
| SP-REQ-05 | `Escape` で閉じる        | onClose 発火を確認          |

### Task 1-5: ConfirmDialog要件

| 要件ID    | 要件                         | 受入基準                     |
| --------- | ---------------------------- | ---------------------------- |
| CD-REQ-01 | `isDestructive` で見た目切替 | 確認ボタンが error 色へ変更  |
| CD-REQ-02 | `isLoading` で操作ロック     | Confirm/Cancel が disabled   |
| CD-REQ-03 | 初期フォーカスはキャンセル   | open 後 activeElement を確認 |
| CD-REQ-04 | `role="alertdialog"` を保持  | ARIA属性を確認               |
| CD-REQ-05 | Enter / Escape キー挙動      | Confirm/Close の発火を確認   |

### Task 1-6: 共通非機能要件

| 要件ID | 要件                                                | 判定                                 |
| ------ | --------------------------------------------------- | ------------------------------------ |
| NFR-01 | 3テーマ対応（kanagawa-dragon / light / dark）       | 各テストで描画確認                   |
| NFR-02 | WCAG 2.1 AA                                         | コントラスト、キーボード、ARIAを確認 |
| NFR-03 | Props駆動（P31対策）                                | Molecules内のStore直接参照禁止       |
| NFR-04 | テスト基盤は `fireEvent` を使用                     | happy-dom 互換運用                   |
| NFR-05 | 実行コマンドは `cd apps/desktop && pnpm vitest run` | 実行手順へ固定                       |

## 実行手順

1. 前提Phaseの成果物を確認する。
2. 本Phaseの実行タスクを上から順に実施する。
3. 成果物を指定パスへ配置し、完了条件をチェックする。

## システム仕様（aiworkflow-requirements）

| 参照仕様             | パス                                                                                        | 確認観点                                  |
| -------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------- |
| UI責務               | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | Molecules責務とAtomic Design境界          |
| UI原則               | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              | Apple HIG / WCAG 2.1 AA / キーボード操作  |
| UIデザインシステム   | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                  | テーマ変数・トークン・4テーマ運用         |
| UIアーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                   | role/aria、構造分離、Atomic層連携         |
| 状態管理             | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | P31対策（Props駆動、Store直接参照禁止）   |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | props最小化・happy-dom/fireEvent運用      |
| Atoms→Molecules連携  | `.claude/skills/aiworkflow-requirements/references/ui-ux-atoms-patterns.md`                 | Props駆動継承、Molecules再利用指針        |
| コンポーネントテスト | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | happy-dom前提の単体/統合テスト手法        |
| テストfixture        | `.claude/skills/aiworkflow-requirements/references/testing-fixtures.md`                     | Builder/fixture再利用、テストデータ標準化 |
| a11yテスト           | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                | WCAG 2.1 AA、フォーカストラップ・ARIA検証 |
| 品質                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | カバレッジと品質ゲート                    |

## 参照資料

| 参照資料                   | パス                                                                                         | 内容             |
| -------------------------- | -------------------------------------------------------------------------------------------- | ---------------- |
| 元タスク仕様               | `../skill-import-agent-system/tasks/completed-task/task-053-ui-00-3-molecules-components.md` | 要件の正本       |
| デザイントークン           | `../skill-import-agent-system/tasks/completed-task/00-1-design-tokens.md`                    | 色・余白・タイポ |
| Atoms仕様                  | `../skill-import-agent-system/tasks/completed-task/00-2-atoms-components.md`                 | 下位レイヤ境界   |
| ui-ux-components           | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                      | Molecules責務    |
| ui-ux-design-principles    | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`               | HIG / WCAG基準   |
| arch-state-management      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                 | P31対策          |
| testing-component-patterns | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`            | テスト手法       |

## 統合テスト連携

- 画面統合対象を先に固定する（SkillCenter / Workspace / Settings）
- Molecules単体テストと画面統合テストの境界を定義する
- API依存を持たないUI部品として、状態入力を props で統一する

## 多角的チェック観点

| 観点             | 確認内容                                |
| ---------------- | --------------------------------------- |
| UI/UX            | Apple HIG準拠、操作一貫性、視認性       |
| アクセシビリティ | WCAG 2.1 AA、キーボード完結、ARIA整合   |
| 状態管理         | P31回避、Props駆動、不要なStore依存排除 |
| テスト容易性     | 単体テスト可能な責務境界、モック容易性  |
| 保守性           | 命名一貫性、責務分離、再利用性          |

## 成果物

| 成果物       | パス                                         | 内容                |
| ------------ | -------------------------------------------- | ------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 5コンポーネント要件 |
| 受入基準     | `outputs/phase-1/acceptance-criteria.md`     | REQ-ID別受入条件    |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 含む/含まない範囲   |

## 完了条件

- [x] 5コンポーネント全件の機能要件を表形式で定義した
- [x] 共通非機能要件（テーマ、a11y、P31、テスト運用）を定義した
- [x] REQ-IDと受入基準の対応表を作成した
- [x] Phase 2 で必要な入力資料を列挙した
- [x] 本Phase内の全タスクを100%実行完了した

## サブタスク管理

Phase開始時に以下サブタスクを定義し、完了ごとに即時 `completed` 化する。

1. 参照資料確認（task-053 / aiworkflow 11仕様）
2. 実行タスク実施（Task N-\* を個別トラック）
3. 統合テスト連携の反映（Phase 1〜11）
4. 成果物生成・配置（`outputs/phase-N` または実装パス）
5. 完了条件と依存引き渡しの検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認する。

- [x] 本Phase内の全タスクを100%実行完了した
- [x] 各タスクの成果物が生成されている
- [x] `artifacts.json` / `outputs/artifacts.json` の整合要件を確認した
- [x] Phase末尾で完了記録と次Phaseへの依存引き渡しを明記した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-ui-00-molecules --phase <N>
```

## 次のPhase

Phase 2 へ進む。
