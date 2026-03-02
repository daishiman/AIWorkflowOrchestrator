# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 値                                        |
| ---------- | ----------------------------------------- |
| タスク ID  | TASK-UI-05A-SKILL-EDITOR-VIEW             |
| Phase      | 10                                        |
| 機能名     | SkillEditorView（スキルエディター）       |
| 作成日     | 2026-03-01                                |
| 前提条件   | Phase 1, 2, 5 完了                        |
| 後続Phase  | Phase 11                                  |
| 成果物パス | `outputs/phase-10/final-review-result.md` |

## 目的

Phase 9 までに品質保証を完了した SkillEditorView の実装全体を、多角的に最終レビューする。要件充足性、設計整合性、Apple HIG 準拠、セキュリティ、アクセシビリティ、パフォーマンス、コード品質の 7 観点から品質・整合性を検証し、Phase 11（手動テスト検証）への進行可否を判定する。

## 背景

SkillEditorView はインポート済みツールの SKILL.md およびサブリソース（agents/, references/ 等）を GUI で編集できるエディタービューである。左ペインにファイルツリー、右ペインにコードエディターを配置する 2 ペインレイアウトを持ち、7 つの IPC チャネル（`skill:getFileTree`, `skill:readFile`, `skill:writeFile`, `skill:createFile`, `skill:deleteFile`, `skill:listBackups`, `skill:restoreBackup`）を使用する。セキュリティ要件が特に重要な機能であるため、IPC 4 層防御（チャネルホワイトリスト、Sender 検証、引数バリデーション、パストラバーサル防止）の実装確認を重点的に行う。

## 実行タスク

- 観点別最終レビュー: 要件・設計・実装・テスト証跡を 7 観点で照合
- 判定確定: PASS / MINOR / MAJOR / CRITICAL を根拠付きで確定
- 未タスク化: MINOR 指摘を未タスク仕様書へ 1 件ずつ変換
- Phase 11 引き継ぎ準備: 手動テストで再確認すべき論点を明示

## レビューゲート判定基準

| 判定     | 条件             | 次のアクション                                             |
| -------- | ---------------- | ---------------------------------------------------------- |
| PASS     | 全観点で問題なし | Phase 11 へ進行                                            |
| MINOR    | 軽微な指摘あり   | **全て**未タスク仕様書に変換後 Phase 11 へ進行（省略不可） |
| MAJOR    | 重大な問題あり   | 影響範囲に応じて Phase 1〜5 へ戻る                         |
| CRITICAL | 致命的な問題あり | Phase 1 へ戻りユーザーと要件を再確認                       |

> **重要**: MINOR 指摘は「機能影響なし」であっても必ず未タスク仕様書に変換する（省略不可）。

### 戻り先決定基準

| 問題の種類           | 戻り先  | 判断基準                                   |
| -------------------- | ------- | ------------------------------------------ |
| 要件の定義漏れ       | Phase 1 | 要件定義書に記載されていない機能の欠落     |
| 設計の不整合         | Phase 2 | コンポーネント構成やデータフローの設計誤り |
| 実装の不備           | Phase 5 | コードの実装ミスやロジックエラー           |
| テストの不足         | Phase 4 | テストケースのカバレッジ不足               |
| セキュリティの脆弱性 | Phase 2 | IPC セキュリティ設計の根本的な問題         |

## 参照資料

| 資料名               | パス                                                                           | 説明                          |
| -------------------- | ------------------------------------------------------------------------------ | ----------------------------- |
| Phase 1 要件定義     | `outputs/phase-1/requirements-definition.md`                                   | 要件定義書                    |
| Phase 1 受入基準     | `outputs/phase-1/acceptance-criteria.md`                                       | 受入基準                      |
| Phase 2 設計         | `outputs/phase-2/architecture-design.md`                                       | アーキテクチャ設計            |
| Phase 3 設計レビュー | `outputs/phase-3/design-review-result.md`                                      | 設計レビュー結果              |
| Phase 4 テスト仕様   | `outputs/phase-4/test-specification.md`                                        | テスト設計                    |
| Phase 5 実装         | `outputs/phase-5/implementation-summary.md`                                    | 実装サマリー                  |
| Phase 7 カバレッジ   | `outputs/phase-7/coverage-report.md`                                           | カバレッジ結果                |
| Phase 8 リファクタ   | `outputs/phase-8/refactoring-log.md`                                           | リファクタリング結果          |
| Phase 9 品質検証     | `outputs/phase-9/quality-report.md`                                            | 品質検証結果                  |
| コード品質ルール     | `.claude/rules/02-code-quality.md`                                             | 品質基準                      |
| アーキテクチャルール | `.claude/rules/01-architecture.md`                                             | Atomic Design・カラー         |
| セキュリティルール   | `.claude/rules/04-electron-security.md`                                        | IPC セキュリティ原則          |
| 状態管理ルール       | `.claude/rules/03-state-management.md`                                         | Zustand 設計原則              |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md`                                           | 全 Pitfall 参照               |
| UI/UX設計原則        | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | Apple HIG準拠チェック         |
| セキュリティ原則     | `.claude/skills/aiworkflow-requirements/references/security-principles.md`     | セキュリティレビュー基準      |
| レビューゲート基準   | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | PASS/MINOR/MAJOR/CRITICAL判定 |

## 実行手順

### レビュー観点 1: 要件充足レビュー

Phase 1 の要件定義・受け入れ基準との突合を行う。

#### 1-1. 2 ペインレイアウト要件

| 要件                                                   | 充足 | 備考 |
| ------------------------------------------------------ | ---- | ---- |
| 左ペインにファイルツリーが表示される                   | -    |      |
| 右ペインにコードエディターが表示される                 | -    |      |
| ペイン間の幅がリサイズ可能である（ドラッグ操作）       | -    |      |
| 最小幅の制約がある（ツリー: 200px、エディター: 300px） | -    |      |

#### 1-2. ファイルツリー要件

| 要件                                                             | 充足 | 備考 |
| ---------------------------------------------------------------- | ---- | ---- |
| SKILL.md がルートに表示される                                    | -    |      |
| サブディレクトリ（agents/, references/ 等）が階層表示される      | -    |      |
| ファイルアイコンが拡張子に応じて表示される                       | -    |      |
| ディレクトリの展開/折りたたみが動作する                          | -    |      |
| ファイル選択時にエディターに内容が表示される                     | -    |      |
| 新規ファイル作成がコンテキストメニューから可能                   | -    |      |
| ファイル削除がコンテキストメニューから可能（確認ダイアログ付き） | -    |      |

#### 1-3. エディター要件

| 要件                                                       | 充足 | 備考 |
| ---------------------------------------------------------- | ---- | ---- |
| Markdown ファイルの編集が可能                              | -    |      |
| 保存操作（Ctrl+S / Cmd+S）が動作する                       | -    |      |
| 未保存変更がある場合にビジュアルインジケーターが表示される | -    |      |
| 元に戻す/やり直し操作が動作する                            | -    |      |
| ステータスバーにファイルパス、行数、変更状態が表示される   | -    |      |

#### 1-4. 未保存変更ダイアログ要件

| 要件                                                           | 充足 | 備考 |
| -------------------------------------------------------------- | ---- | ---- |
| 未保存変更がある状態で別ファイルを選択すると確認ダイアログ表示 | -    |      |
| 「保存」「破棄」「キャンセル」の 3 つのアクションが提供される  | -    |      |
| ブラウザ/Electron の beforeunload イベントと連携               | -    |      |

#### 1-5. バックアップ要件

| 要件                                     | 充足 | 備考 |
| ---------------------------------------- | ---- | ---- |
| バックアップ一覧がメニューから表示される | -    |      |
| バックアップからの復元が可能             | -    |      |
| バックアップの日時が表示される           | -    |      |

#### 1-6. エラーハンドリング要件

| 要件                                                             | 充足 | 備考 |
| ---------------------------------------------------------------- | ---- | ---- |
| ファイル読み込み失敗時にエラーメッセージが表示される             | -    |      |
| ファイル保存失敗時にエラーメッセージが表示され、内容が保持される | -    |      |
| 存在しないファイルパスへのアクセス時に適切なフォールバック       | -    |      |

### レビュー観点 2: 設計整合性レビュー

Phase 2 の設計書とコードの一致を確認する。

#### 2-1. コンポーネント構成の一致

| 設計書のコンポーネント      | 実装ファイルパス                                                   | 一致 | 備考 |
| --------------------------- | ------------------------------------------------------------------ | ---- | ---- |
| `SkillEditorView/index.tsx` | `views/SkillEditorView/index.tsx`                                  | -    |      |
| `FileTreePanel.tsx`         | `views/SkillEditorView/components/FileTreePanel/FileTreePanel.tsx` | -    |      |
| `FileTreeNode.tsx`          | `views/SkillEditorView/components/FileTreePanel/FileTreeNode.tsx`  | -    |      |
| `EditorPanel.tsx`           | `views/SkillEditorView/components/EditorPanel/EditorPanel.tsx`     | -    |      |
| `EditorStatusBar.tsx`       | `views/SkillEditorView/components/EditorPanel/EditorStatusBar.tsx` | -    |      |
| `EditorToolBar.tsx`         | `views/SkillEditorView/components/EditorToolBar.tsx`               | -    |      |
| `UnsavedChangesDialog.tsx`  | `views/SkillEditorView/components/UnsavedChangesDialog.tsx`        | -    |      |
| `BackupMenu.tsx`            | `views/SkillEditorView/components/BackupMenu.tsx`                  | -    |      |
| `useSkillEditor.ts`         | `views/SkillEditorView/hooks/useSkillEditor.ts`                    | -    |      |
| `useFileTree.ts`            | `views/SkillEditorView/hooks/useFileTree.ts`                       | -    |      |
| `useUnsavedWarning.ts`      | `views/SkillEditorView/hooks/useUnsavedWarning.ts`                 | -    |      |

#### 2-2. Atomic Design 準拠

| レベル    | コンポーネント                                        | 確認結果 |
| --------- | ----------------------------------------------------- | -------- |
| atoms     | FileTreeNode, EditorStatusBar                         | -        |
| molecules | FileTreePanel, EditorPanel, EditorToolBar, BackupMenu | -        |
| organisms | SkillEditorView, UnsavedChangesDialog                 | -        |

**確認項目**:

- [ ] atoms は他のコンポーネントに依存していない
- [ ] molecules は atoms の組み合わせで構成されている
- [ ] organisms は molecules を組み合わせてセクションを構成している

#### 2-3. レイヤー依存方向

| 確認項目                                           | 結果 |
| -------------------------------------------------- | ---- |
| Renderer → Preload → Main の一方向依存を厳守       | -    |
| Renderer から Node.js API を直接使用していない     | -    |
| IPC 通信は必ず Preload Bridge（contextBridge）経由 | -    |

#### 2-4. Zustand 個別セレクタ使用（P31 対策）

| 確認項目                                                       | 結果 |
| -------------------------------------------------------------- | ---- |
| agentSlice からの状態取得が個別セレクタで行われている          | -    |
| 合成 Store Hook（`useAgentStore()`）を直接使用していない       | -    |
| useEffect 依存配列にアクション関数を含む場合、個別セレクタ経由 | -    |

### レビュー観点 3: Apple HIG 準拠レビュー

#### 3-1. カラーパレット

| 確認項目              | ライトモード         | ダークモード            | 結果 |
| --------------------- | -------------------- | ----------------------- | ---- |
| 背景色                | `#FFFFFF`            | `#000000`               | -    |
| セカンダリ背景        | `#F2F2F7`            | `#1C1C1E`               | -    |
| ターシャリ背景        | `#E5E5EA`            | `#2C2C2E`               | -    |
| プライマリテキスト    | `#000000`            | `#FFFFFF`               | -    |
| セカンダリテキスト    | `rgba(60,60,67,0.6)` | `rgba(235,235,245,0.6)` | -    |
| アクセント            | `#007AFF`            | `#0A84FF`               | -    |
| ボーダー              | `#C6C6C8`            | `#38383A`               | -    |
| Tailwind Slate 不使用 | 確認                 | 確認                    | -    |

#### 3-2. アニメーション

| 確認項目                                     | 基準              | 結果 |
| -------------------------------------------- | ----------------- | ---- |
| 全アニメーションが 200-300ms 範囲内          | 200-300ms         | -    |
| 目的のないアニメーションが存在しない         | 機能的な意味あり  | -    |
| `will-change` が設計値どおりに設定されている | transform/opacity | -    |
| layout 変更（width/height/top/left）不使用   | transform のみ    | -    |

#### 3-3. グリッドとスペーシング

| 確認項目                           | 基準     | 結果 |
| ---------------------------------- | -------- | ---- |
| 8px グリッドでスペーシング統一     | 8px 倍数 | -    |
| 角丸が 8px〜12px で統一            | 8-12px   | -    |
| 十分な余白で呼吸感のあるレイアウト | 視覚確認 | -    |

### レビュー観点 4: セキュリティレビュー

IPC 4 層防御の実装確認を行う。

#### 4-1. チャネルホワイトリスト管理

| IPC チャネル          | `IPC_CHANNELS` 定数参照 | ハードコード文字列なし | 結果 |
| --------------------- | ----------------------- | ---------------------- | ---- |
| `skill:getFileTree`   | -                       | -                      | -    |
| `skill:readFile`      | -                       | -                      | -    |
| `skill:writeFile`     | -                       | -                      | -    |
| `skill:createFile`    | -                       | -                      | -    |
| `skill:deleteFile`    | -                       | -                      | -    |
| `skill:listBackups`   | -                       | -                      | -    |
| `skill:restoreBackup` | -                       | -                      | -    |

#### 4-2. Sender 検証

| IPC チャネル          | `validateIpcSender(event, mainWindow)` 実装 | 結果 |
| --------------------- | ------------------------------------------- | ---- |
| `skill:getFileTree`   | -                                           | -    |
| `skill:readFile`      | -                                           | -    |
| `skill:writeFile`     | -                                           | -    |
| `skill:createFile`    | -                                           | -    |
| `skill:deleteFile`    | -                                           | -    |
| `skill:listBackups`   | -                                           | -    |
| `skill:restoreBackup` | -                                           | -    |

#### 4-3. P42 準拠 3 段バリデーション

| IPC チャネル          | 引数           | 型チェック | 空文字列 | trim() | 結果 |
| --------------------- | -------------- | ---------- | -------- | ------ | ---- |
| `skill:getFileTree`   | `skillName`    | -          | -        | -      | -    |
| `skill:readFile`      | `skillName`    | -          | -        | -      | -    |
| `skill:readFile`      | `relativePath` | -          | -        | -      | -    |
| `skill:writeFile`     | `skillName`    | -          | -        | -      | -    |
| `skill:writeFile`     | `relativePath` | -          | -        | -      | -    |
| `skill:createFile`    | `skillName`    | -          | -        | -      | -    |
| `skill:createFile`    | `relativePath` | -          | -        | -      | -    |
| `skill:deleteFile`    | `skillName`    | -          | -        | -      | -    |
| `skill:deleteFile`    | `relativePath` | -          | -        | -      | -    |
| `skill:listBackups`   | `skillName`    | -          | -        | -      | -    |
| `skill:restoreBackup` | `skillName`    | -          | -        | -      | -    |
| `skill:restoreBackup` | `backupPath`   | -          | -        | -      | -    |

#### 4-4. パストラバーサル防止

| 確認項目                                                             | 結果 |
| -------------------------------------------------------------------- | ---- |
| `SkillFileManager.validatePath()` がファイルパス受付時に呼び出される | -    |
| `../` を含むパスが拒否される                                         | -    |
| 絶対パスの注入が拒否される                                           | -    |
| Null バイト（`\0`）を含むパスが拒否される                            | -    |

#### 4-5. エラーサニタイズ

| 確認項目                                                         | 結果 |
| ---------------------------------------------------------------- | ---- |
| エラーレスポンスに内部パス（ファイルシステムパス）を含まない     | -    |
| エラーレスポンスにスタックトレースを含まない                     | -    |
| Renderer に送信されるエラーはコード + ユーザー向けメッセージのみ | -    |

```bash
# P42 検証
grep -rn "\.trim()" apps/desktop/src/main/ipc/ --include="*.ts" | grep -i "skill"

# P27 検証: チャネル名ハードコード
grep -rn "safeInvoke\|safeOn" apps/desktop/src/renderer/views/SkillEditorView/ --include="*.ts" --include="*.tsx" | grep -v "IPC_CHANNELS" | grep -v ".test." | grep -v "__tests__"

# パストラバーサル検証
grep -rn "validatePath\|\.\./" apps/desktop/src/main/ --include="*.ts" | grep -i "skill"
```

### レビュー観点 5: アクセシビリティレビュー

#### 5-1. WCAG 2.1 AA 準拠

| 確認項目                                  | 基準                | 結果 |
| ----------------------------------------- | ------------------- | ---- |
| 通常テキストのコントラスト比              | 4.5:1 以上          | -    |
| 大テキスト / UI 部品のコントラスト比      | 3:1 以上            | -    |
| 全機能にキーボードでアクセス可能          | Tab/Enter/Esc/Arrow | -    |
| ARIA ラベルが全インタラクティブ要素に付与 | 全要素              | -    |
| 色だけで情報を伝えていない                | アイコン併用        | -    |

#### 5-2. キーボードナビゲーション

| 操作                             | キー             | 動作確認 | 結果 |
| -------------------------------- | ---------------- | -------- | ---- |
| ファイルツリーのノード間移動     | Arrow Up/Down    | -        | -    |
| ディレクトリの展開/折りたたみ    | Arrow Right/Left | -        | -    |
| ファイル選択                     | Enter / Space    | -        | -    |
| ファイル保存                     | Ctrl+S / Cmd+S   | -        | -    |
| 未保存ダイアログ閉じる           | Escape           | -        | -    |
| ツールバーボタン間移動           | Tab              | -        | -    |
| バックアップメニュー操作         | Enter / Arrow    | -        | -    |
| フォーカストラップ（ダイアログ） | Tab              | -        | -    |

#### 5-3. ARIA 属性

| 要素                 | 期待属性                                                     | 結果 |
| -------------------- | ------------------------------------------------------------ | ---- |
| ファイルツリー       | `role="tree"`, `aria-label`                                  | -    |
| ツリーノード         | `role="treeitem"`, `aria-expanded`, `aria-selected`          | -    |
| エディターパネル     | `aria-label="エディター"` または `role="textbox"`            | -    |
| ツールバー           | `role="toolbar"`, `aria-label`                               | -    |
| 未保存変更ダイアログ | `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby` | -    |
| バックアップメニュー | `role="menu"`, `aria-label`                                  | -    |
| ステータスバー       | `role="status"`, `aria-live="polite"`                        | -    |

#### 5-4. スクリーンリーダー対応

| 確認項目                                      | 結果 |
| --------------------------------------------- | ---- |
| ファイル選択時にファイル名が読み上げられる    | -    |
| 保存成功/失敗時にステータスが読み上げられる   | -    |
| ダイアログ表示時にタイトルが読み上げられる    | -    |
| ツリーノードの展開/折りたたみ状態が伝達される | -    |

### レビュー観点 6: パフォーマンスレビュー

| 確認項目                                                  | 基準                             | 結果 |
| --------------------------------------------------------- | -------------------------------- | ---- |
| ファイルツリーの初期表示                                  | 500ms 以下                       | -    |
| ファイル内容の読み込み・表示                              | 300ms 以下                       | -    |
| ファイル保存操作のレスポンス                              | 200ms 以下                       | -    |
| React.memo の適用対象が Phase 8 レポートどおり            | Phase 8 レポート参照             | -    |
| useMemo / useCallback の適用対象が Phase 8 レポートどおり | Phase 8 レポート参照             | -    |
| 大量ファイル（50+）のツリー表示が遅延なく表示される       | 仮想スクロールまたは遅延読み込み | -    |
| 不要な再レンダリングが発生していない                      | React DevTools 確認              | -    |

### レビュー観点 7: コード品質レビュー

#### 7-1. SRP（単一責務原則）

| 確認項目                                      | 結果 |
| --------------------------------------------- | ---- |
| 1 コンポーネント 150 行以下                   | -    |
| 1 フック 1 責務                               | -    |
| UI ロジックとビジネスロジックが分離されている | -    |

#### 7-2. 型安全性

| 確認項目                          | 基準   | 結果 |
| --------------------------------- | ------ | ---- |
| `any` 型使用                      | 0 件   | -    |
| `@ts-ignore` / `@ts-expect-error` | 0 件   | -    |
| 型アサーション（`as`）            | 最小限 | -    |

#### 7-3. エラーハンドリング

| 確認項目                                         | 結果 |
| ------------------------------------------------ | ---- |
| IPC 呼び出しのエラーが catch 節で処理されている  | -    |
| エラー時にユーザーへのフィードバックが提供される | -    |
| try/catch で握りつぶしていない                   | -    |
| エラー情報が上位に伝播される                     | -    |

#### 7-4. テスト網羅性

| テストファイル                  | 存在 | テスト数 | カバー範囲                       | 結果 |
| ------------------------------- | ---- | -------- | -------------------------------- | ---- |
| `SkillEditorView.test.tsx`      | -    | -        | 統合テスト（2ペインレイアウト）  | -    |
| `FileTreePanel.test.tsx`        | -    | -        | ツリー表示・ノード操作           | -    |
| `FileTreeNode.test.tsx`         | -    | -        | 単一ノード表示・再帰レンダリング | -    |
| `EditorPanel.test.tsx`          | -    | -        | エディター表示・編集操作         | -    |
| `EditorToolBar.test.tsx`        | -    | -        | ツールバーアクション             | -    |
| `UnsavedChangesDialog.test.tsx` | -    | -        | ダイアログ表示・3アクション      | -    |
| `useSkillEditor.test.ts`        | -    | -        | ファイル読み書きロジック         | -    |
| `useFileTree.test.ts`           | -    | -        | ツリー構築・展開/折りたたみ      | -    |

#### 7-5. カバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 実測値 | 判定 |
| ----------------- | -------- | -------- | ------ | ---- |
| Line Coverage     | 80%      | 90%      | -      | -    |
| Branch Coverage   | 60%      | 70%      | -      | -    |
| Function Coverage | 80%      | 90%      | -      | -    |

### 既知の落とし穴対策

| Pitfall | 対策内容                                        | 確認方法                                                    | 結果 |
| ------- | ----------------------------------------------- | ----------------------------------------------------------- | ---- |
| **P31** | agentSlice 個別セレクタ使用                     | `useAgentStore()` 直接使用箇所が 0 件であることを grep 確認 | -    |
| **P39** | happy-dom 環境で fireEvent 使用                 | `userEvent` 使用箇所が 0 件であることを grep 確認           | -    |
| **P40** | テスト実行は `cd apps/desktop` から             | テスト実行コマンドの確認                                    | -    |
| **P42** | IPC 3 段バリデーション                          | 全ハンドラで型→空文字列→trim() 確認                         | -    |
| **P44** | IPC インターフェース整合                        | Preload 側と Main 側の引数形式が一致                        | -    |
| **P45** | 引数名が実際の値のセマンティクスと一致          | `skillName`/`relativePath`/`backupPath` 命名が一貫          | -    |
| **P47** | variantStyles Record をモジュールスコープに抽出 | コンポーネントの export 確認、テストでの import 確認        | -    |

```bash
# P31 検証
grep -rn "useAgentStore()" apps/desktop/src/renderer/views/SkillEditorView/ --include="*.ts" --include="*.tsx" | grep -v ".test." | grep -v "__tests__"

# P39 検証
grep -rn "userEvent" apps/desktop/src/renderer/views/SkillEditorView/__tests__/ --include="*.ts" --include="*.tsx"

# P42 検証
grep -rn "\.trim()" apps/desktop/src/main/ipc/ --include="*.ts" | grep -i "skill.*file\|skill.*backup"

# P44/P45 検証
grep -rn "skillId\b" apps/desktop/src/renderer/views/SkillEditorView/ --include="*.ts" --include="*.tsx" | grep -v ".test." | grep -v "__tests__"
```

## 統合テスト連携【必須】

最終レビューで統合テスト結果を確認:

| レビュー項目       | 確認内容                                   | 結果       |
| ------------------ | ------------------------------------------ | ---------- |
| 全テスト結果       | ユニット + 統合 全て成功                   | {{RESULT}} |
| カバレッジ         | Line 80%+, Branch 60%+, Function 80%+      | {{RESULT}} |
| テストファイル数   | 8 ファイル                                 | {{RESULT}} |
| Pitfall 対策テスト | P31,P39,P40,P42,P44,P45,P47 対策の自動検証 | {{RESULT}} |

## レビュー結果テンプレート

### 総合判定

| 項目                 | 判定 |
| -------------------- | ---- |
| **総合判定**         | -    |
| 判定理由             | -    |
| 指摘件数（MINOR）    | - 件 |
| 指摘件数（MAJOR）    | - 件 |
| 指摘件数（CRITICAL） | - 件 |

### 観点別判定

| #   | レビュー観点     | 判定 | 指摘件数 | 備考 |
| --- | ---------------- | ---- | -------- | ---- |
| 1   | 要件充足性       | -    | -        | -    |
| 2   | 設計整合性       | -    | -        | -    |
| 3   | Apple HIG 準拠   | -    | -        | -    |
| 4   | セキュリティ     | -    | -        | -    |
| 5   | アクセシビリティ | -    | -        | -    |
| 6   | パフォーマンス   | -    | -        | -    |
| 7   | コード品質       | -    | -        | -    |

### MINOR 指摘一覧（未タスク仕様書への変換必須）

| #   | 観点 | 指摘内容 | 未タスク仕様書パス | 対応方針 |
| --- | ---- | -------- | ------------------ | -------- |
| -   | -    | -        | -                  | -        |

> **重要**: MINOR 指摘は全て未タスク仕様書に変換する（省略不可）。
> 未タスク仕様書は `docs/30-workflows/unassigned-task/` に配置する。

### MAJOR / CRITICAL 指摘一覧（該当する場合）

| #   | 観点 | 指摘内容 | 影響範囲 | 戻り先 Phase |
| --- | ---- | -------- | -------- | ------------ |
| -   | -    | -        | -        | -            |

## 成果物

| 成果物           | パス                                      | 説明             |
| ---------------- | ----------------------------------------- | ---------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | レビュー判定結果 |

### 最終レビュー結果記載事項

1. **総合判定**: PASS / MINOR / MAJOR / CRITICAL
2. **観点別判定**: 7 観点それぞれの判定と指摘件数
3. **指摘一覧**: 全指摘の詳細（観点、内容、未タスク仕様書パス）
4. **要件充足マトリクス**: 要件定義の完了条件に対する充足状況
5. **セキュリティ検証結果**: IPC 4 層防御の検証結果
6. **Pitfall 検証結果**: P31,P39,P40,P42,P44,P45,P47 の検証結果

## 完了条件

- [ ] 7 レビュー観点全てで確認完了
- [ ] 判定結果が記録されている
- [ ] MINOR 指摘が全て未タスク仕様書に変換されている（該当する場合）
- [ ] 未タスク仕様書が `docs/30-workflows/unassigned-task/` に配置されている（該当する場合）
- [ ] MAJOR / CRITICAL 指摘の戻り先が特定されている（該当する場合）
- [ ] 統合テスト結果が確認されている
- [ ] 最終レビュー結果が作成されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 1〜9 成果物の読み込み）
2. レビュー観点 1: 要件充足性
3. レビュー観点 2: 設計整合性
4. レビュー観点 3: Apple HIG 準拠
5. レビュー観点 4: セキュリティ
6. レビュー観点 5: アクセシビリティ
7. レビュー観点 6: パフォーマンス
8. レビュー観点 7: コード品質
9. 既知の落とし穴対策確認
10. 統合テスト連携確認
11. レビュー結果作成（判定 + 指摘一覧）
12. MINOR 指摘の未タスク仕様書変換（該当する場合）
13. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

```bash
# Phase 完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-editor-view --phase 10
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

Phase 11: 手動テスト検証
