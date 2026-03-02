# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目       | 値                                   |
| ---------- | ------------------------------------ |
| タスク ID  | TASK-UI-05A-SKILL-EDITOR-VIEW        |
| Phase      | 8                                    |
| 機能名     | SkillEditorView（スキルエディター）  |
| 作成日     | 2026-03-01                           |
| 前提条件   | Phase 1, 2, 5, 6, 7 完了             |
| 後続Phase  | Phase 9                              |
| 成果物パス | `outputs/phase-8/refactoring-log.md` |

## 目的

Phase 5〜7 で実装・テスト拡充した SkillEditorView のコード品質を改善する。TDD の Refactor ステップとして、全テストが Green 状態を維持したまま、可読性・保守性・パフォーマンスを向上させる。

## 背景

SkillEditorView は左ペインにファイルツリー、右ペインにコードエディターを配置する 2 ペインレイアウトのエディタービューである。SKILL.md およびサブリソース（agents/, references/ 等）を GUI で編集するための機能を提供する。Phase 5 で実装した 8 コンポーネント + 3 カスタムフックに対して、コード重複の排除・命名の改善・責務の見直し・型安全性の強化を行う。

## 実行タスク

- コード重複の排除: IPC 呼び出しやユーティリティ処理の重複を特定し共通化する
- 命名の改善: ドメイン用語と一致する命名へ統一する
- コンポーネント責務の見直し: SRP 違反を解消する
- カスタムフックの最適化: `useSkillEditor` / `useFileTree` / `useUnsavedWarning` の責務境界を明確化する
- マイクロインタラクションの統一: 200-300ms 基準に揃えて定数化する
- TypeScript 型の強化: `any` と抑制コメントを排除し型安全性を高める

### タスク 1: コード重複の排除

共通パターンを抽出し、ユーティリティ関数やコンポーネントに集約する。

#### 1-1. 重複パターン調査

```bash
# ファイル間の類似コードを検出
grep -rn "window.electronAPI" apps/desktop/src/renderer/views/SkillEditorView/ --include="*.ts" --include="*.tsx" | grep -v ".test." | grep -v "__tests__"

# IPC 呼び出しパターンの重複を検出
grep -rn "safeInvoke" apps/desktop/src/renderer/views/SkillEditorView/ --include="*.ts" --include="*.tsx" | grep -v ".test." | grep -v "__tests__"
```

| 対象ファイル        | 重複パターン候補                                  |
| ------------------- | ------------------------------------------------- |
| `EditorPanel.tsx`   | ファイル読み込み・書き込みの IPC 呼び出しパターン |
| `FileTreePanel.tsx` | ファイル操作（作成・削除）の IPC 呼び出しパターン |
| `useSkillEditor.ts` | エラーハンドリングの共通パターン                  |
| `useFileTree.ts`    | ファイルパス操作ユーティリティ                    |
| `EditorToolBar.tsx` | ボタン群の共通スタイルパターン                    |

**判断基準**: 3 行以上の同一コード / 同一ロジックが 2 箇所以上にある場合、共通ユーティリティまたは共通コンポーネントに抽出する。

#### 1-2. 共通化候補

| 共通化対象                  | 抽出先                            | 理由                                         |
| --------------------------- | --------------------------------- | -------------------------------------------- |
| IPC エラーハンドリング      | `useSkillEditor.ts` 内ヘルパー    | 各 IPC 呼び出しで同一のエラー処理が重複      |
| ファイルパス結合ロジック    | `useFileTree.ts` 内ユーティリティ | ツリーノードのパス生成が複数箇所で実行される |
| 保存/キャンセル UI パターン | `EditorToolBar.tsx` に集約        | ツールバー内のアクションボタン群             |

### タスク 2: 命名の改善

変数名・関数名がドメイン用語と一致しているかを検証し、不一致があれば修正する。

#### 2-1. 命名検証チェックリスト

| 対象ファイル               | 確認項目                                                                       |
| -------------------------- | ------------------------------------------------------------------------------ |
| `useSkillEditor.ts`        | `content` → `fileContent`、`path` → `filePath` の明確化                        |
| `useFileTree.ts`           | ツリーノード操作メソッド名がドメイン用語と一致（`expand`/`collapse`/`select`） |
| `FileTreeNode.tsx`         | props 名がコンポーネントの意図を正確に表現しているか                           |
| `EditorPanel.tsx`          | 編集状態を表す変数が `isDirty`/`isModified` で統一されているか                 |
| `EditorStatusBar.tsx`      | 表示情報のラベルが UI 言語として適切か                                         |
| `UnsavedChangesDialog.tsx` | ダイアログのコールバック名が意図を明示（`onSave`/`onDiscard`/`onCancel`）      |

**判断基準**: 変数名を読んだだけで値の意味が理解できない場合、または複数の解釈が可能な場合に修正する。

### タスク 3: コンポーネント責務の見直し（SRP 確認）

1 コンポーネント 1 責務の原則を確認し、責務が混在している場合は分離する。

| コンポーネント              | 期待される責務                                  | 確認観点                                                     |
| --------------------------- | ----------------------------------------------- | ------------------------------------------------------------ |
| `SkillEditorView/index.tsx` | 2 ペインレイアウトの統合と全体状態管理          | ファイル操作ロジックがビューに混在していないか               |
| `FileTreePanel.tsx`         | ファイルツリーの表示とユーザー操作の受付        | ツリーデータの取得ロジックがコンポーネントに混在していないか |
| `FileTreeNode.tsx`          | 単一ツリーノードの表示（ファイル/ディレクトリ） | 再帰レンダリングの責務のみか                                 |
| `EditorPanel.tsx`           | テキストエディター領域の表示と編集操作の管理    | ファイル I/O ロジックがフックに分離されているか              |
| `EditorStatusBar.tsx`       | ファイル情報（パス、行数、変更状態）の表示      | ステータス計算ロジックが混入していないか                     |
| `EditorToolBar.tsx`         | 保存・元に戻す等のアクションボタン群の表示      | ボタン操作のハンドラーが props 経由で渡されているか          |
| `UnsavedChangesDialog.tsx`  | 未保存変更の確認ダイアログの表示                | ダイアログ制御ロジックが親に委譲されているか                 |
| `BackupMenu.tsx`            | バックアップ一覧の表示と復元操作の提供          | バックアップデータの取得がフック経由か                       |

**判断基準**: 1 コンポーネント 150 行以下を目安とする。超過している場合は責務分離を検討する。

### タスク 4: カスタムフックの最適化

useSkillEditor, useFileTree, useUnsavedWarning の責務境界を確認し、重複や漏れがないか検証する。

| フック名            | 期待される責務                                      | 確認項目                                                 |
| ------------------- | --------------------------------------------------- | -------------------------------------------------------- |
| `useSkillEditor`    | ファイルの読み込み・書き込み・編集状態管理          | エディターの表示ロジックが混在していないか               |
| `useFileTree`       | ファイルツリーの構築・ノード展開/折りたたみ状態管理 | ファイル操作（作成/削除）の IPC 呼び出しが含まれているか |
| `useUnsavedWarning` | 未保存変更の検知・警告ダイアログの制御              | ブラウザの beforeunload イベント連携が適切か             |

**判断基準**: フック間で状態の重複がある場合は統合を検討する。1 フックが 3 つ以上の独立した責務を持つ場合は分割を検討する。

### タスク 5: マイクロインタラクションの統一

アニメーション定数を共有化し、200-300ms の基準を統一する。

| アニメーション対象              | 現在のduration | 統一後のduration | 確認項目                               |
| ------------------------------- | -------------- | ---------------- | -------------------------------------- |
| ファイルツリーの展開/折りたたみ | 確認必要       | 200ms            | `transition-duration` の値を統一       |
| エディターパネルの切替          | 確認必要       | 250ms            | crossFade またはフェードトランジション |
| ステータスバーの更新            | 確認必要       | 200ms            | 保存状態表示の切り替えアニメーション   |
| ダイアログの表示/非表示         | 確認必要       | 300ms            | opacity + scale トランジション         |
| バックアップメニューの開閉      | 確認必要       | 200ms            | ドロップダウンの展開アニメーション     |

**定数化パターン**:

```typescript
// ❌ 各コンポーネントに個別定義
<div className="transition-all duration-200" />
<div className="transition-all duration-300" />

// ✅ 共通定数として定義
export const ANIMATION_DURATION = {
  fast: 200,    // ツリー展開、ステータス更新、メニュー開閉
  normal: 250,  // パネル切替
  slow: 300,    // ダイアログ表示
} as const;
```

### タスク 6: TypeScript 型の強化

any 型の排除と型アサーション（as）の最小化を行う。

#### 6-1. 検査コマンド

```bash
# any 型の使用箇所を検索（テストファイル除外）
grep -rn ": any\|<any>\|as any" apps/desktop/src/renderer/views/SkillEditorView/ --include="*.ts" --include="*.tsx" | grep -v ".test." | grep -v "__tests__"

# 型アサーション（as）の使用箇所を検索（テストファイル除外）
grep -rn " as " apps/desktop/src/renderer/views/SkillEditorView/ --include="*.ts" --include="*.tsx" | grep -v ".test." | grep -v "__tests__" | grep -v "import.*as"

# @ts-ignore / @ts-expect-error の使用箇所を検索
grep -rn "@ts-ignore\|@ts-expect-error" apps/desktop/src/renderer/views/SkillEditorView/ --include="*.ts" --include="*.tsx"
```

#### 6-2. 目標値

| 検査項目               | 目標                               |
| ---------------------- | ---------------------------------- |
| `any` 型使用           | 0 件                               |
| `@ts-ignore`           | 0 件                               |
| `@ts-expect-error`     | 0 件                               |
| 型アサーション（`as`） | 最小限（理由コメント付きのみ許可） |

## 参照資料

| 資料名               | パス                                                                         | 説明                         |
| -------------------- | ---------------------------------------------------------------------------- | ---------------------------- |
| Phase 1 要件         | `outputs/phase-1/requirements-definition.md`                                 | 要件境界の再確認             |
| Phase 2 設計         | `outputs/phase-2/architecture-design.md`                                     | 設計契約の再確認             |
| Phase 5 実装         | `outputs/phase-5/implementation-summary.md`                                  | 実装コード                   |
| Phase 6 テスト拡充   | `outputs/phase-6/test-expansion-report.md`                                   | 拡充テストの観点             |
| Phase 7 カバレッジ   | `outputs/phase-7/coverage-report.md`                                         | カバレッジ確認結果           |
| コード品質ルール     | `.claude/rules/02-code-quality.md`                                           | 品質基準                     |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md`                                         | P31, P39, P40, P47 対策      |
| アーキテクチャ       | `.claude/rules/01-architecture.md`                                           | Atomic Design 原則           |
| 状態管理             | `.claude/rules/03-state-management.md`                                       | Zustand 設計原則             |
| UIコンポーネント設計 | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`    | コンポーネントアーキテクチャ |
| 状態管理設計         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | Zustand設計原則              |

## 実行手順

### ステップ 1: リファクタリング対象の特定

Phase 5〜7 で作成した全ファイルを対象に、タスク 1〜6 の観点で改善対象を洗い出す。

対象ファイル一覧:

```
apps/desktop/src/renderer/views/SkillEditorView/
├── index.tsx
├── components/
│   ├── FileTreePanel/
│   │   ├── FileTreePanel.tsx
│   │   └── FileTreeNode.tsx
│   ├── EditorPanel/
│   │   ├── EditorPanel.tsx
│   │   └── EditorStatusBar.tsx
│   ├── EditorToolBar.tsx
│   ├── UnsavedChangesDialog.tsx
│   └── BackupMenu.tsx
└── hooks/
    ├── useSkillEditor.ts
    ├── useFileTree.ts
    └── useUnsavedWarning.ts
```

### ステップ 2: リファクタリング実施

タスク 1〜6 で特定した対象に対して、以下の優先順位で実施する。

| 優先度 | タスク                         | 理由                                 |
| ------ | ------------------------------ | ------------------------------------ |
| 1      | タスク 6: TypeScript型の強化   | コンパイル時エラー検出による品質基盤 |
| 2      | タスク 1: コード重複の排除     | 保守性への直接的影響                 |
| 3      | タスク 2: 命名の改善           | 可読性向上                           |
| 4      | タスク 3: コンポーネント責務   | SRP 準拠                             |
| 5      | タスク 4: カスタムフック最適化 | 責務境界の明確化                     |
| 6      | タスク 5: アニメーション統一   | UX 一貫性                            |

**各タスク実施後、必ず全テストを実行して Green 状態を確認すること。**

### ステップ 3: パフォーマンス最適化

#### 3-1. React.memo の適用

| コンポーネント    | 適用判断                                                |
| ----------------- | ------------------------------------------------------- |
| `FileTreeNode`    | ツリーが大量ノードを持つ場合に不要な再描画を防止 → 適用 |
| `EditorStatusBar` | 親（EditorPanel）の再レンダリングで不要に再描画 → 適用  |
| `EditorToolBar`   | アクションボタン群は静的 → 適用                         |
| `BackupMenu`      | メニュー表示時のみ再レンダリング必要 → 適用             |

**判断基準**: 親の再レンダリングで不要に再描画される可能性があるコンポーネントに `React.memo` を適用する。

#### 3-2. useMemo / useCallback の適用

| 対象                        | メモ化するロジック/コールバック                                |
| --------------------------- | -------------------------------------------------------------- |
| `useFileTree`               | ツリー構造の構築ロジック（`useMemo`）                          |
| `useSkillEditor`            | ファイル保存ハンドラ（`useCallback`）                          |
| `useSkillEditor`            | ファイル読み込みハンドラ（`useCallback`）                      |
| `SkillEditorView/index.tsx` | `handleFileSelect`, `handleSave` コールバック（`useCallback`） |

### ステップ 4: CSS 変数・デザイントークンの一貫性確認（P47 準拠）

| 確認項目                              | 対応方針                                                                    |
| ------------------------------------- | --------------------------------------------------------------------------- |
| `variantStyles` Record の抽出         | コンポーネント外部（モジュールスコープ）に `Record<Variant, string>` で抽出 |
| テスト側でのハードコード文字列        | コンポーネントから export した定数を import して期待値生成                  |
| Apple HIG System Colors の CSS 変数化 | `var(--color-accent)` 等が全箇所で統一されているか確認                      |
| ダーク/ライトモード対応               | CSS 変数がモード切替で正しく動作するか確認                                  |

### ステップ 5: リファクタリング後のテスト確認

```bash
# 1. 全テスト実行（P40 対策: apps/desktop から実行）
cd apps/desktop && pnpm vitest run src/renderer/views/SkillEditorView/

# 2. カバレッジ再測定（Phase 7 基準を維持していることを確認）
cd apps/desktop && pnpm vitest run --coverage src/renderer/views/SkillEditorView/

# 3. 型チェック
pnpm typecheck

# 4. Lint チェック
pnpm lint
```

**確認項目**:

- [ ] リファクタリング前後でテスト結果が同一（全テスト PASS）
- [ ] カバレッジが Phase 7 基準を維持（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 型チェック・Lint チェックがクリア

## 統合テスト連携【必須】

リファクタリング後の統合テスト継続成功を確認:

```bash
cd apps/desktop && pnpm vitest run src/renderer/views/SkillEditorView/
```

| テストカテゴリ | 確認内容                                     | 結果       |
| -------------- | -------------------------------------------- | ---------- |
| ユニットテスト | 全コンポーネントテスト PASS（8 ファイル）    | {{RESULT}} |
| フックテスト   | useSkillEditor, useFileTree テスト PASS      | {{RESULT}} |
| 統合テスト     | ファイル選択→編集→保存フローテスト PASS      | {{RESULT}} |
| カバレッジ     | Line 80%+, Branch 60%+, Function 80%+ を維持 | {{RESULT}} |

## 多角的チェック観点

| 観点             | 確認項目                                                             |
| ---------------- | -------------------------------------------------------------------- |
| UI/UX            | マイクロインタラクションが維持されているか                           |
| アーキテクチャ   | Atomic Design（atoms → molecules → organisms）準拠が維持されているか |
| パフォーマンス   | アニメーション 60fps が維持されているか                              |
| アクセシビリティ | WCAG 2.1 AA、キーボードナビが維持されているか                        |
| 型安全性         | any 0 件、@ts-ignore 0 件が達成されているか                          |
| デザイントークン | P47 準拠の variantStyles Record 抽出が完了しているか                 |

**Electron デスクトップアプリ観点**:

| 層                         | 確認項目                                                                                        |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| フロントエンド（Renderer） | コンポーネント分割が Atomic Design に準拠                                                       |
| 状態管理                   | agentSlice 個別セレクタ使用が維持（P31 対策）                                                   |
| IPC 通信                   | skill:getFileTree/readFile/writeFile/createFile/deleteFile/listBackups/restoreBackup が正常動作 |

## 既知の Pitfall 対策

| Pitfall | 確認項目                                                                          |
| ------- | --------------------------------------------------------------------------------- |
| **P31** | リファクタリング後も個別セレクタ使用が維持されているか                            |
| **P39** | テストコードで `userEvent` が混入していないか（happy-dom 環境）                   |
| **P40** | テスト実行ディレクトリが `apps/desktop` からであることを確認                      |
| **P47** | variantStyles Record がモジュールスコープに抽出され、テストで import されているか |

## 成果物

| 成果物               | パス                                 | 説明                     |
| -------------------- | ------------------------------------ | ------------------------ |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md` | 変更内容と品質改善の記録 |

### リファクタリングログ記載事項

1. **変更一覧**: ファイルごとの変更内容（コンポーネント責務見直し、フック最適化、型修正、重複除去）
2. **命名改善**: 変更前後の命名対照表
3. **パフォーマンス最適化**: React.memo / useMemo / useCallback の適用箇所
4. **アニメーション統一**: 定数化した duration 値の一覧
5. **P47 対応**: variantStyles Record 抽出の詳細（該当する場合）
6. **テスト結果**: リファクタリング前後のテスト結果比較
7. **カバレッジ**: リファクタリング前後のカバレッジ比較

## 完了条件

- [ ] テストが継続成功（全テスト PASS、カバレッジ維持）
- [ ] `any` 型が 0 件
- [ ] `@ts-ignore` / `@ts-expect-error` が 0 件
- [ ] 型アサーション（`as`）が最小限（理由コメント付きのみ）
- [ ] 150 行超のコンポーネントが存在しない（または分割計画を記録）
- [ ] カスタムフック（useSkillEditor, useFileTree, useUnsavedWarning）の責務境界が明確
- [ ] コード重複が排除
- [ ] 命名がドメイン用語と一致
- [ ] アニメーション duration が定数化され 200-300ms 基準に統一
- [ ] React.memo / useMemo / useCallback の適用対象が設計どおり
- [ ] 統合テストが継続成功
- [ ] リファクタリングログが作成されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. タスク 1: コード重複の排除
3. タスク 2: 命名の改善
4. タスク 3: コンポーネント責務の見直し
5. タスク 4: カスタムフックの最適化
6. タスク 5: マイクロインタラクションの統一
7. タスク 6: TypeScript 型の強化
8. パフォーマンス最適化（ステップ 3）
9. CSS 変数一貫性確認（ステップ 4）
10. リファクタリング後のテスト確認（ステップ 5）
11. リファクタリングログ作成
12. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

```bash
# Phase 完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-editor-view --phase 8
```

## TDD 検証

```bash
# テスト実行コマンド（P40 対策: apps/desktop から実行）
cd apps/desktop && pnpm vitest run src/renderer/views/SkillEditorView/

# 確認項目
# - [ ] リファクタリング後もテストが全て成功することを確認（Green 維持）
```

## 依存関係

| 依存タスク | 関係                                         |
| ---------- | -------------------------------------------- |
| TASK-UI-00 | デザイン基盤（トークン、共通コンポーネント） |
| TASK-UI-01 | アーキテクチャ基盤                           |
| TASK-UI-02 | ナビゲーションコア                           |
| TASK-UI-05 | スキルセンター（SkillCenterView）            |
| TASK-9A    | SkillFileManager + IPC ハンドラ              |

## 次の Phase

Phase 9: 品質保証
