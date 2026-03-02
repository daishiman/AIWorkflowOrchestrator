# Phase 9: 品質保証

## メタ情報

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| タスク ID  | TASK-UI-05A-SKILL-EDITOR-VIEW       |
| Phase      | 9                                   |
| 機能名     | SkillEditorView（スキルエディター） |
| 作成日     | 2026-03-01                          |
| 前提条件   | Phase 5（実装）完了                 |
| 後続Phase  | Phase 10                            |
| 成果物パス | `outputs/phase-9/quality-report.md` |

## 目的

Phase 8 までに完成した SkillEditorView の全コードに対し、定義された品質基準を全て満たすことを検証する。Lint・型チェック・Prettier フォーマット・全テスト実行・セキュリティチェック・アクセシビリティチェックを通じて、Phase 10（最終レビュー）に進む前の品質ゲートをクリアする。

## 背景

SkillEditorView は IPC チャネル（`skill:getFileTree`, `skill:readFile`, `skill:writeFile`, `skill:createFile`, `skill:deleteFile`, `skill:listBackups`, `skill:restoreBackup`）を使用してファイル操作を行う。セキュリティ要件（P42 準拠 3 段バリデーション、パストラバーサル防止）の確認が特に重要である。

## 実行タスク

- ESLint 実行: Lint エラーと警告を 0 件にする
- TypeScript 型チェック: 型エラー、`any`、抑制コメントを検証する
- Prettier フォーマット検証: フォーマット準拠を確認する
- 全テスト実行: 成果物の回帰とカバレッジ基準を確認する
- セキュリティチェック: P42/P45 と IPC 防御の実装整合を確認する
- アクセシビリティチェック: ARIA とキーボード操作、コントラストを検証する

### タスク 1: ESLint 実行

```bash
# プロジェクト全体の Lint 実行
pnpm lint

# SkillEditorView 固有のファイルに絞って確認
cd apps/desktop && pnpm eslint src/renderer/views/SkillEditorView/ --ext .ts,.tsx
```

**品質ゲート**: エラー 0 件、警告 0 件（auto-fix 適用後）

| 確認項目         | 基準               | 結果       |
| ---------------- | ------------------ | ---------- |
| ESLint エラー    | 0 件               | {{RESULT}} |
| ESLint 警告      | 0 件               | {{RESULT}} |
| 未使用 import    | 0 件               | {{RESULT}} |
| console.log 残留 | 0 件（テスト除外） | {{RESULT}} |

### タスク 2: TypeScript 型チェック

```bash
# TypeScript 型チェック
pnpm typecheck
```

**品質ゲート**: エラー 0 件

| 確認項目                    | 基準                               | 結果       |
| --------------------------- | ---------------------------------- | ---------- |
| TypeScript コンパイルエラー | 0 件                               | {{RESULT}} |
| `any` 型使用                | 0 件                               | {{RESULT}} |
| `@ts-ignore`                | 0 件                               | {{RESULT}} |
| `@ts-expect-error`          | 0 件                               | {{RESULT}} |
| 型アサーション（`as`）      | 最小限（理由コメント付きのみ許可） | {{RESULT}} |

#### any 型・型アサーション検査

```bash
# any 型の使用箇所を検索（テストファイル除外）
grep -rn ": any\|<any>\|as any" apps/desktop/src/renderer/views/SkillEditorView/ --include="*.ts" --include="*.tsx" | grep -v ".test." | grep -v "__tests__"

# @ts-ignore / @ts-expect-error の使用箇所を検索
grep -rn "@ts-ignore\|@ts-expect-error" apps/desktop/src/renderer/views/SkillEditorView/ --include="*.ts" --include="*.tsx"

# 型アサーション（as）の使用箇所を検索（テストファイル除外）
grep -rn " as " apps/desktop/src/renderer/views/SkillEditorView/ --include="*.ts" --include="*.tsx" | grep -v ".test." | grep -v "__tests__" | grep -v "import.*as"
```

### タスク 3: Prettier フォーマット検証

```bash
# フォーマットチェック（修正せず確認のみ）
pnpm prettier --check "apps/desktop/src/renderer/views/SkillEditorView/**/*.{ts,tsx}"
```

**品質ゲート**: 全ファイルが Prettier 準拠

| 確認項目                     | 基準 | 結果       |
| ---------------------------- | ---- | ---------- |
| フォーマット未準拠ファイル数 | 0 件 | {{RESULT}} |

### タスク 4: 全テスト実行

```bash
# 全テスト実行（P40 対策: apps/desktop から実行）
cd apps/desktop && pnpm vitest run src/renderer/views/SkillEditorView/

# カバレッジ付き実行
cd apps/desktop && pnpm vitest run --coverage src/renderer/views/SkillEditorView/
```

**品質ゲート**:

| 指標              | 最低基準 | 推奨基準 | 結果       |
| ----------------- | -------- | -------- | ---------- |
| 全テスト PASS     | 100%     | 100%     | {{RESULT}} |
| Line Coverage     | 80%      | 90%      | {{RESULT}} |
| Branch Coverage   | 60%      | 70%      | {{RESULT}} |
| Function Coverage | 80%      | 90%      | {{RESULT}} |

#### テストファイル別結果

| テストファイル                  | テスト数 | PASS | FAIL | 結果       |
| ------------------------------- | -------- | ---- | ---- | ---------- |
| `SkillEditorView.test.tsx`      | -        | -    | -    | {{RESULT}} |
| `FileTreePanel.test.tsx`        | -        | -    | -    | {{RESULT}} |
| `FileTreeNode.test.tsx`         | -        | -    | -    | {{RESULT}} |
| `EditorPanel.test.tsx`          | -        | -    | -    | {{RESULT}} |
| `EditorToolBar.test.tsx`        | -        | -    | -    | {{RESULT}} |
| `UnsavedChangesDialog.test.tsx` | -        | -    | -    | {{RESULT}} |
| `useSkillEditor.test.ts`        | -        | -    | -    | {{RESULT}} |
| `useFileTree.test.ts`           | -        | -    | -    | {{RESULT}} |

### タスク 5: セキュリティチェック

IPC 引数バリデーションが P42 準拠の 3 段バリデーション（型チェック → 空文字列 → トリム空文字列）を満たしているか確認する。

#### 5-1. IPC チャネル別バリデーション確認

| IPC チャネル          | 引数           | 型チェック            | 空文字列チェック    | trim() チェック  | 結果       |
| --------------------- | -------------- | --------------------- | ------------------- | ---------------- | ---------- |
| `skill:getFileTree`   | `skillName`    | `typeof === "string"` | `=== ""`            | `.trim() === ""` | {{RESULT}} |
| `skill:readFile`      | `skillName`    | `typeof === "string"` | `=== ""`            | `.trim() === ""` | {{RESULT}} |
| `skill:readFile`      | `relativePath` | `typeof === "string"` | `=== ""`            | `.trim() === ""` | {{RESULT}} |
| `skill:writeFile`     | `skillName`    | `typeof === "string"` | `=== ""`            | `.trim() === ""` | {{RESULT}} |
| `skill:writeFile`     | `relativePath` | `typeof === "string"` | `=== ""`            | `.trim() === ""` | {{RESULT}} |
| `skill:writeFile`     | `content`      | `typeof === "string"` | N/A（空文字列許可） | N/A              | {{RESULT}} |
| `skill:createFile`    | `skillName`    | `typeof === "string"` | `=== ""`            | `.trim() === ""` | {{RESULT}} |
| `skill:createFile`    | `relativePath` | `typeof === "string"` | `=== ""`            | `.trim() === ""` | {{RESULT}} |
| `skill:deleteFile`    | `skillName`    | `typeof === "string"` | `=== ""`            | `.trim() === ""` | {{RESULT}} |
| `skill:deleteFile`    | `relativePath` | `typeof === "string"` | `=== ""`            | `.trim() === ""` | {{RESULT}} |
| `skill:listBackups`   | `skillName`    | `typeof === "string"` | `=== ""`            | `.trim() === ""` | {{RESULT}} |
| `skill:restoreBackup` | `skillName`    | `typeof === "string"` | `=== ""`            | `.trim() === ""` | {{RESULT}} |
| `skill:restoreBackup` | `backupPath`   | `typeof === "string"` | `=== ""`            | `.trim() === ""` | {{RESULT}} |

#### 5-2. セキュリティ追加チェック

| 確認項目                                                     | 基準                                 | 結果       |
| ------------------------------------------------------------ | ------------------------------------ | ---------- |
| Sender 検証: `validateIpcSender(event, mainWindow)`          | 全ハンドラで実装                     | {{RESULT}} |
| パストラバーサル防止: `SkillFileManager.validatePath()`      | ファイルパス受付時に実行             | {{RESULT}} |
| エラーサニタイズ: 内部情報（スタックトレース等）を漏洩しない | エラーレスポンスに内部パスを含まない | {{RESULT}} |
| チャネル名がホワイトリスト管理（`IPC_CHANNELS` 定数参照）    | ハードコード文字列 0 件（P27 対策）  | {{RESULT}} |
| CSP 準拠: 外部リソース読み込みなし                           | `script-src 'self'`                  | {{RESULT}} |

```bash
# チャネル名ハードコード検出（P27 対策）
grep -rn "safeInvoke\|safeOn" apps/desktop/src/renderer/views/SkillEditorView/ --include="*.ts" --include="*.tsx" | grep -v "IPC_CHANNELS" | grep -v ".test." | grep -v "__tests__"

# パストラバーサルテストの存在確認
grep -rn "traversal\|\.\./" apps/desktop/src/renderer/views/SkillEditorView/__tests__/ --include="*.ts" --include="*.tsx"
```

### タスク 6: アクセシビリティチェック

#### 6-1. ARIA 属性の付与確認

| コンポーネント         | 期待される ARIA 属性                                                      | 結果       |
| ---------------------- | ------------------------------------------------------------------------- | ---------- |
| `FileTreePanel`        | `role="tree"`, `aria-label="ファイルツリー"`                              | {{RESULT}} |
| `FileTreeNode`         | `role="treeitem"`, `aria-expanded`（ディレクトリの場合）, `aria-selected` | {{RESULT}} |
| `EditorPanel`          | `role="textbox"` または `aria-label="エディター"`                         | {{RESULT}} |
| `EditorToolBar`        | `role="toolbar"`, `aria-label="エディターツールバー"`                     | {{RESULT}} |
| `UnsavedChangesDialog` | `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby`              | {{RESULT}} |
| `BackupMenu`           | `role="menu"`, `aria-label="バックアップメニュー"`                        | {{RESULT}} |
| `EditorStatusBar`      | `role="status"`, `aria-live="polite"`                                     | {{RESULT}} |

#### 6-2. キーボード操作確認

| 操作                          | キー             | 期待動作                       | 結果       |
| ----------------------------- | ---------------- | ------------------------------ | ---------- |
| ファイルツリーのノード間移動  | Arrow Up/Down    | 前/次のノードにフォーカス移動  | {{RESULT}} |
| ディレクトリの展開/折りたたみ | Arrow Right/Left | 展開/折りたたみ                | {{RESULT}} |
| ファイル選択                  | Enter / Space    | エディターにファイル内容を表示 | {{RESULT}} |
| 保存                          | Ctrl+S / Cmd+S   | ファイルを保存                 | {{RESULT}} |
| ダイアログ閉じる              | Escape           | ダイアログをキャンセル         | {{RESULT}} |
| ツールバーボタン間移動        | Tab              | 次のボタンにフォーカス移動     | {{RESULT}} |
| バックアップメニュー開閉      | Enter / Space    | メニューの表示/非表示          | {{RESULT}} |

#### 6-3. コントラスト比確認

| 対象                     | 前景色                  | 背景色                | コントラスト比 | 基準    | 結果       |
| ------------------------ | ----------------------- | --------------------- | -------------- | ------- | ---------- |
| ファイルツリーテキスト   | `var(--text-primary)`   | `var(--bg-secondary)` | 4.5:1 以上     | AA      | {{RESULT}} |
| エディターテキスト       | `var(--text-primary)`   | `var(--bg-primary)`   | 4.5:1 以上     | AA      | {{RESULT}} |
| ステータスバーテキスト   | `var(--text-secondary)` | `var(--bg-tertiary)`  | 4.5:1 以上     | AA      | {{RESULT}} |
| ツールバーボタンアイコン | `var(--text-primary)`   | `var(--bg-primary)`   | 3:1 以上       | AA (UI) | {{RESULT}} |
| 変更あり表示（ドット）   | `var(--status-warning)` | `var(--bg-primary)`   | 3:1 以上       | AA (UI) | {{RESULT}} |

## 参照資料

| 資料名               | パス                                                                              | 説明                  |
| -------------------- | --------------------------------------------------------------------------------- | --------------------- |
| Phase 5 実装         | `outputs/phase-5/implementation-summary.md`                                       | 実装内容の確認        |
| Phase 8 レポート     | `outputs/phase-8/refactoring-log.md`                                              | リファクタリング結果  |
| コード品質ルール     | `.claude/rules/02-code-quality.md`                                                | 品質基準              |
| アーキテクチャルール | `.claude/rules/01-architecture.md`                                                | Atomic Design・カラー |
| セキュリティルール   | `.claude/rules/04-electron-security.md`                                           | IPC セキュリティ原則  |
| 状態管理ルール       | `.claude/rules/03-state-management.md`                                            | Zustand 設計原則      |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md`                                              | P31,P39,P40,P42,P47   |
| 品質要件（正本）     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 品質しきい値の正本    |
| IPC セキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | セキュリティ検証基準  |
| コンポーネント試験   | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | 試験観点の正本        |
| a11y 試験            | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      | WCAG 試験観点         |
| 品質基準             | `.claude/skills/task-specification-creator/references/quality-standards.md`       | 品質ゲート基準        |

## 品質ゲート

全項目が PASS であることが Phase 10 進行の条件:

| ゲート項目            | 基準                                      | 判定       |
| --------------------- | ----------------------------------------- | ---------- |
| ESLint                | エラー 0 件、警告 0 件                    | {{RESULT}} |
| TypeScript            | コンパイルエラー 0 件                     | {{RESULT}} |
| Prettier              | 全ファイル準拠                            | {{RESULT}} |
| 全テスト              | 全件 PASS                                 | {{RESULT}} |
| Line Coverage         | 80% 以上                                  | {{RESULT}} |
| Branch Coverage       | 60% 以上                                  | {{RESULT}} |
| Function Coverage     | 80% 以上                                  | {{RESULT}} |
| any 型                | 0 件                                      | {{RESULT}} |
| @ts-ignore            | 0 件                                      | {{RESULT}} |
| P42 3段バリデーション | 全 IPC ハンドラで実装                     | {{RESULT}} |
| Sender 検証           | 全 IPC ハンドラで実装                     | {{RESULT}} |
| パストラバーサル防止  | ファイルパス受付時に実行                  | {{RESULT}} |
| ARIA 属性             | 全インタラクティブ要素に付与              | {{RESULT}} |
| キーボード操作        | 全機能にアクセス可能                      | {{RESULT}} |
| コントラスト比        | 通常テキスト 4.5:1 以上、UI 部品 3:1 以上 | {{RESULT}} |

## 統合テスト連携【必須】

品質保証で統合テスト結果を確認:

| 品質項目      | 確認内容                                                          | 結果       |
| ------------- | ----------------------------------------------------------------- | ---------- |
| 機能検証      | 全自動テスト成功（8 ファイル）                                    | {{RESULT}} |
| Lint          | ESLint エラー・警告 0 件                                          | {{RESULT}} |
| 型チェック    | TypeScript コンパイルエラー 0 件                                  | {{RESULT}} |
| カバレッジ    | Line 80%+, Branch 60%+, Function 80%+                             | {{RESULT}} |
| コード品質    | any 0, @ts-ignore 0, boolean プレフィックス準拠                   | {{RESULT}} |
| Atomic Design | atoms(FileTreeNode, EditorStatusBar)/molecules/organisms 分類準拠 | {{RESULT}} |
| セキュリティ  | P42 3段バリデーション、Sender検証、パストラバーサル防止           | {{RESULT}} |
| Apple HIG     | System Colors 準拠                                                | {{RESULT}} |
| WCAG 2.1 AA   | コントラスト比、キーボードナビ、ARIA                              | {{RESULT}} |
| Pitfall 対策  | P31,P39,P40,P42,P47 全対策確認                                    | {{RESULT}} |

## 多角的チェック観点

| 観点               | 確認項目                                                                |
| ------------------ | ----------------------------------------------------------------------- |
| セキュリティ       | IPC 経由のファイル操作が P42 準拠 3 段バリデーションで保護されているか  |
| UI/UX              | ファイルツリーとエディターの操作が直感的であるか                        |
| アーキテクチャ     | レイヤー依存方向（Renderer → Preload → Main）が守られているか           |
| パフォーマンス     | 大量ファイルのツリー表示が高速であるか                                  |
| アクセシビリティ   | WCAG 2.1 AA、キーボードナビ、ARIA、コントラスト比                       |
| エラーハンドリング | ファイル読み書き失敗時の UI フィードバック（Toast、ステータスバー表示） |

**Electron デスクトップアプリ観点**:

| 層                         | 確認項目                                                |
| -------------------------- | ------------------------------------------------------- |
| フロントエンド（Renderer） | 全コンポーネントテスト PASS、Atomic Design 準拠         |
| 状態管理                   | agentSlice 個別セレクタ使用、useEffect 依存配列の安全性 |
| IPC 通信                   | 7 チャネル全てで引数バリデーション・Sender検証          |

## 既知の Pitfall 対策確認

| Pitfall | 確認方法                                                                 | 結果       |
| ------- | ------------------------------------------------------------------------ | ---------- |
| **P31** | agentSlice からの状態取得が個別セレクタ使用になっているか確認            | {{RESULT}} |
| **P39** | テストコード内に `userEvent.setup()` が存在しないか grep 確認            | {{RESULT}} |
| **P40** | テスト実行コマンドが `cd apps/desktop` から開始しているか確認            | {{RESULT}} |
| **P42** | 全 IPC ハンドラで 3 段バリデーション（型→空文字列→trim()）が実装済み     | {{RESULT}} |
| **P47** | variantStyles Record がモジュールスコープで定義・export されているか確認 | {{RESULT}} |

```bash
# P31 確認: 合成Store Hook使用の検出
grep -rn "useAgentStore()" apps/desktop/src/renderer/views/SkillEditorView/ --include="*.ts" --include="*.tsx" | grep -v ".test." | grep -v "__tests__"

# P39 確認: userEvent 使用の検出
grep -rn "userEvent" apps/desktop/src/renderer/views/SkillEditorView/ --include="*.ts" --include="*.tsx"

# P42 確認: trim() バリデーション
grep -rn "\.trim()" apps/desktop/src/main/ipc/ --include="*.ts" | grep -i "skill"

# P47 確認: variantStyles Record
grep -rn "variantStyles\|export const.*Styles" apps/desktop/src/renderer/views/SkillEditorView/ --include="*.ts" --include="*.tsx" | grep -v ".test." | grep -v "__tests__"
```

## 成果物

| 成果物       | パス                                | 説明         |
| ------------ | ----------------------------------- | ------------ |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質検証結果 |

### 品質レポート記載事項

1. **Lint 結果**: ESLint 実行結果（エラー/警告件数）
2. **型チェック結果**: TypeScript コンパイル結果（エラー件数、any/型アサーション件数）
3. **Prettier 結果**: フォーマット未準拠ファイル件数
4. **テスト結果**: テストファイル別 PASS/FAIL、カバレッジ数値
5. **セキュリティ検証結果**: P42 3 段バリデーション、Sender 検証、パストラバーサル防止の検証結果
6. **アクセシビリティ検証結果**: ARIA 属性、キーボード操作、コントラスト比の検証結果
7. **Pitfall 対策結果**: P31,P39,P40,P42,P47 の検証結果
8. **品質ゲート判定**: 全項目 PASS / 要改善項目リスト

## 完了条件

- [ ] `pnpm lint` がエラー・警告 0 件で通過
- [ ] `pnpm typecheck` がエラー 0 件で通過
- [ ] Prettier フォーマット検証が全ファイルで通過
- [ ] 全テスト実行（`cd apps/desktop && pnpm vitest run src/renderer/views/SkillEditorView/`）が全件 PASS
- [ ] カバレッジ基準達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] `any` 型使用が 0 件
- [ ] `@ts-ignore` / `@ts-expect-error` 使用が 0 件
- [ ] P42 準拠 3 段バリデーションが全 IPC ハンドラで確認済み
- [ ] Sender 検証（`validateIpcSender`）が全 IPC ハンドラで確認済み
- [ ] パストラバーサル防止（`SkillFileManager.validatePath()`）が確認済み
- [ ] ARIA 属性が全インタラクティブ要素に付与されていることを確認済み
- [ ] キーボード操作で全機能にアクセス可能であることを確認済み
- [ ] コントラスト比が基準値以上であることを確認済み（通常テキスト 4.5:1、UI 部品 3:1）
- [ ] 既知の Pitfall（P31,P39,P40,P42,P47）対策が全て確認済み
- [ ] 品質レポートが作成されている
- [ ] **全品質ゲート項目が PASS**
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. タスク 1: ESLint 実行
3. タスク 2: TypeScript 型チェック
4. タスク 3: Prettier フォーマット検証
5. タスク 4: 全テスト実行
6. タスク 5: セキュリティチェック（P42 3段バリデーション、Sender検証、パストラバーサル防止）
7. タスク 6: アクセシビリティチェック（ARIA、キーボード、コントラスト比）
8. Pitfall 対策確認
9. 品質レポート作成
10. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

```bash
# Phase 完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-editor-view --phase 9
```

## 次の Phase

Phase 10: 最終レビュー
