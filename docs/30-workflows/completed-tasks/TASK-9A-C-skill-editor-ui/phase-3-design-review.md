# Phase 3: 設計レビュー — SkillEditor コンポーネント実装

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| タスク ID  | TASK-9A-C                              |
| Phase      | 3（設計レビュー）                      |
| 前提 Phase | Phase 2（設計）                        |
| 後続 Phase | Phase 4（テスト作成）                  |
| ステータス | 未着手                                 |
| 作成日     | 2026-02-19                             |
| 機能名     | SkillEditor コンポーネント             |
| 依存タスク | TASK-9A-B（ファイル編集 IPC ハンドラ） |

## 目的

Phase 1（要件定義）と Phase 2（設計）の成果物を多角的にレビューし、設計の妥当性・整合性・セキュリティ・アクセシビリティを検証する。
レビュー結果に基づいてゲート判定（PASS / MINOR / MAJOR / CRITICAL）を行い、次 Phase への進行可否を決定する。

## 判定基準

| 判定     | 条件                                      | 対応                                                  |
| -------- | ----------------------------------------- | ----------------------------------------------------- |
| PASS     | CRITICAL: 0件、MAJOR: 0件、MINOR: 0件     | Phase 4（テスト作成）へ進む                           |
| MINOR    | CRITICAL: 0件、MAJOR: 0件、MINOR: 1件以上 | 全 MINOR 指摘を未タスク仕様書に変換後、Phase 4 へ進む |
| MAJOR    | CRITICAL: 0件、MAJOR: 1件以上             | 要件問題 → Phase 1 へ戻る / 設計問題 → Phase 2 へ戻る |
| CRITICAL | CRITICAL: 1件以上                         | Phase 1 へ戻り要件を再確認                            |

## 実行タスク

### Task 1: 要件整合性レビュー

**目的**: Phase 2 の設計が Phase 1 の要件を漏れなく満たしているかを検証する。

**実行手順**:

1. Phase 1 の機能要件と Phase 2 の設計を突き合わせ、以下のレビュー観点で検証する

   | #   | レビュー観点                                                        | 確認先（Phase 1）                    | 確認先（Phase 2）                         | 判定 |
   | --- | ------------------------------------------------------------------- | ------------------------------------ | ----------------------------------------- | ---- |
   | 1   | ファイルツリーが ImportedSkill の全サブリソースカテゴリを表示するか | Task 2: ファイルツリーサイドバー要件 | Task 1: FileTreeSidebar 設計              |      |
   | 2   | 空カテゴリの非表示が実装されているか                                | Task 2: 空カテゴリ非表示要件         | Task 3: buildFileTree フィルタリング      |      |
   | 3   | ファイル選択で readFile IPC が呼び出されるか                        | Task 2: コードエディター要件         | Task 2: handleSelectFile 設計             |      |
   | 4   | 編集で hasChanges が true になるか                                  | Task 2: コードエディター要件         | Task 1: 内部状態設計                      |      |
   | 5   | 保存ボタンで writeFile IPC が呼び出されるか                         | Task 2: ツールバー要件               | Task 2: handleSave 設計                   |      |
   | 6   | Cmd+S / Ctrl+S で保存が実行されるか                                 | Task 4: キーボードショートカット一覧 | Task 1: キーボードイベント処理            |      |
   | 7   | 未保存変更時の確認ダイアログが実装されているか                      | Task 4: ファイル選択フロー           | Task 2: handleSelectFile の未保存チェック |      |
   | 8   | エラー表示（インライン/トースト）が要件通りか                       | Task 2: ローディング・エラー要件     | Task 4: エラーハンドリング設計            |      |
   | 9   | コードフォント（JetBrains Mono）が適用されているか                  | Task 2: コードエディター要件         | Task 1: SkillCodeEditor textarea style    |      |
   | 10  | Tab キーで2スペース挿入が実装されているか                           | Task 2: コードエディター要件         | Task 1: SkillCodeEditor handleKeyDown     |      |

2. 非機能要件の設計カバレッジを検証する

   | #   | 非機能要件                    | Phase 2 での対応状況                              | 判定 |
   | --- | ----------------------------- | ------------------------------------------------- | ---- |
   | 1   | パフォーマンス: 500ms以内表示 | IPC 呼び出しは非同期、UI はローディング状態で遮断 |      |
   | 2   | アクセシビリティ: WCAG 2.1 AA | ARIA 属性定義済み、キーボード操作定義済み         |      |
   | 3   | セキュリティ: IPC 経由のみ    | Renderer から直接ファイルアクセスなし             |      |

**期待される成果物**: `outputs/phase-3/requirements-alignment-review.md`

### Task 2: Electron セキュリティレビュー

**目的**: SkillEditor の設計が Electron 3プロセスモデルのセキュリティ原則に準拠しているかを検証する。

**実行手順**:

1. 以下のセキュリティレビュー観点で検証する

   | #   | レビュー観点                                                                                  | 根拠ルール                                         | 判定 |
   | --- | --------------------------------------------------------------------------------------------- | -------------------------------------------------- | ---- |
   | 1   | Renderer Process から Node.js API（fs, path）を直接使用していないか                           | `contextIsolation: true`, `nodeIntegration: false` |      |
   | 2   | ファイル操作は全て IPC（`window.electronAPI.skill.readFile` / `writeFile`）経由か             | IPC セキュリティ原則                               |      |
   | 3   | IPC チャンネル名がホワイトリスト管理されているか（ハードコード文字列なし）                    | P27: Preload ハードコード文字列の見落とし          |      |
   | 4   | エラーメッセージが Main Process でサニタイズされ、内部パスを含まないか                        | IPC セキュリティ原則: エラーサニタイズ             |      |
   | 5   | パストラバーサル防御が Main Process 側に委譲されているか                                      | 多層防御 (Defense in Depth)                        |      |
   | 6   | SkillEditor が表示するファイル内容をそのまま innerHTML に挿入していないか（XSS 防止）         | CSP: `script-src 'self'`                           |      |
   | 7   | `skill.name` と `selectedFile` パラメータが Renderer 側で信頼できるソースから取得されているか | 完全仲介 (Complete Mediation)                      |      |

2. セキュリティリスク評価

   | リスク                                     | 影響度 | 発生可能性          | 対策                                          |
   | ------------------------------------------ | ------ | ------------------- | --------------------------------------------- |
   | パストラバーサルによる任意ファイル読み取り | 高     | 低（Main側で検証）  | TASK-9A-B で detectPathTraversal() 実装       |
   | XSS（ファイル内容に悪意あるスクリプト）    | 中     | 低（textarea 表示） | textarea は HTML をレンダリングしないため安全 |
   | エラーメッセージによる内部パス漏洩         | 低     | 中                  | Main Process でサニタイズ済みメッセージを返却 |

**期待される成果物**: `outputs/phase-3/security-review.md`

### Task 3: デザインシステム・アクセシビリティレビュー

**目的**: SkillEditor の UI 設計がデザインシステムと WCAG 2.1 AA に準拠しているかを検証する。

**実行手順**:

1. デザインシステム準拠性を検証する

   | #   | レビュー観点                                                         | デザイントークン                                             | 設計値                                   | 判定 |
   | --- | -------------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------- | ---- |
   | 1   | 背景色がデザインシステムのカラーパレットに準拠しているか             | `white` / `slate-900`（ダーク）                              | `bg-white dark:bg-slate-900`             |      |
   | 2   | テキスト色がデザインシステムに準拠しているか                         | `slate-900` / `slate-50`（ダーク）                           | `text-slate-900 dark:text-slate-50`      |      |
   | 3   | ボーダー色がデザインシステムに準拠しているか                         | `slate-200` / `slate-700`（ダーク）                          | `border-slate-200 dark:border-slate-700` |      |
   | 4   | コードフォントがデザインシステムのフォントスタックに準拠しているか   | `JetBrains Mono, Source Code Pro, Noto Sans Mono, monospace` | `style={{ fontFamily: '...' }}`          |      |
   | 5   | フォントサイズがデザインシステムのスケールに準拠しているか           | `text-sm` = 14px                                             | `text-sm`                                |      |
   | 6   | スペーシングが 8px グリッドに準拠しているか                          | `p-4` = 16px, `px-3` = 12px, `py-1.5` = 6px                  | 各コンポーネントの padding/margin        |      |
   | 7   | 選択状態のハイライト色が適切か                                       | `blue-50` / `blue-900/20`（ダーク）                          | ツリーアイテム選択時                     |      |
   | 8   | エラー色がデザインシステムに準拠しているか                           | `red-600` / `red-400`（ダーク）                              | エラーメッセージ表示                     |      |
   | 9   | アニメーション時間がデザインシステムのタイムスケールに準拠しているか | ホバー: 100ms, モーダル: 200-300ms                           | `transition-colors duration-100`         |      |

2. WCAG 2.1 AA 準拠性を検証する

   | #   | レビュー観点                                                               | WCAG 基準                | 判定 |
   | --- | -------------------------------------------------------------------------- | ------------------------ | ---- |
   | 1   | テキストのコントラスト比が 4.5:1 以上か                                    | 1.4.3 Contrast (Minimum) |      |
   | 2   | 全機能がキーボードで操作可能か                                             | 2.1.1 Keyboard           |      |
   | 3   | フォーカスが可視か                                                         | 2.4.7 Focus Visible      |      |
   | 4   | ファイルツリーに `role="tree"` / `role="treeitem"` が設定されているか      | 4.1.2 Name, Role, Value  |      |
   | 5   | エディターに `role="textbox"`, `aria-multiline="true"` が設定されているか  | 4.1.2 Name, Role, Value  |      |
   | 6   | ボタンに `aria-label` が設定されているか                                   | 4.1.2 Name, Role, Value  |      |
   | 7   | エラーメッセージに `role="alert"`, `aria-live="polite"` が設定されているか | 4.1.3 Status Messages    |      |
   | 8   | 色だけで情報を伝えていないか（テキスト併用）                               | 1.4.1 Use of Color       |      |

**期待される成果物**: `outputs/phase-3/design-system-accessibility-review.md`

### Task 4: 既存パターン整合性レビュー

**目的**: SkillEditor の設計が既存スキルコンポーネント（SkillImportDialog, SkillSelector, SkillStreamingView）のパターンと整合しているかを検証する。

**実行手順**:

1. 既存コンポーネントとの設計パターン比較

   | #   | レビュー観点                                                         | 既存パターン                                    | SkillEditor 設計                         | 判定 |
   | --- | -------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------- | ---- |
   | 1   | Props 設計が既存 Organism パターンに準拠しているか                   | SkillImportDialog: `{ skill, isOpen, onClose }` | `{ skill, onClose }`                     |      |
   | 2   | カテゴリ表示名が SkillImportDialog の RESOURCE_SECTIONS と一致するか | `'サブエージェント (agents/)'` 等               | CATEGORY_LABELS の値                     |      |
   | 3   | 状態管理方針が既存パターンと整合しているか                           | SkillImportDialog: Store 経由の isImporting     | useState でローカル管理                  |      |
   | 4   | index.ts からの export パターンが既存と一致しているか                | `export { SkillImportDialog }` + Props 型       | SkillEditor + Props 型を export          |      |
   | 5   | エラー表示パターンが既存と整合しているか                             | SkillStreamingView: インライン表示              | インライン（読み込み）+ トースト（保存） |      |
   | 6   | テスト環境設定が既存テストと一致しているか                           | happy-dom, fireEvent 使用                       | happy-dom, fireEvent 使用                |      |

2. 命名規則の整合性確認

   | 対象             | 既存パターン                 | SkillEditor 設計       | 一致 |
   | ---------------- | ---------------------------- | ---------------------- | ---- |
   | ファイル名       | `SkillImportDialog.tsx`      | `SkillEditor.tsx`      |      |
   | コンポーネント名 | `SkillImportDialog`          | `SkillEditor`          |      |
   | Props 型名       | `SkillImportDialogProps`     | `SkillEditorProps`     |      |
   | テストファイル名 | `SkillImportDialog.test.tsx` | `SkillEditor.test.tsx` |      |

**期待される成果物**: `outputs/phase-3/pattern-alignment-review.md`

### Task 5: レビュー結果判定

**目的**: Task 1-4 のレビュー結果を総合し、ゲート判定を行う。

**実行手順**:

1. 各レビュータスクの結果を集約する

   | Task | レビュー名                                 | 指摘数（CRITICAL） | 指摘数（MAJOR） | 指摘数（MINOR） | 総合判定 |
   | ---- | ------------------------------------------ | ------------------ | --------------- | --------------- | -------- |
   | 1    | 要件整合性レビュー                         |                    |                 |                 |          |
   | 2    | Electron セキュリティレビュー              |                    |                 |                 |          |
   | 3    | デザインシステム・アクセシビリティレビュー |                    |                 |                 |          |
   | 4    | 既存パターン整合性レビュー                 |                    |                 |                 |          |

2. ゲート判定基準に基づいて最終判定を行う

   | 判定     | 条件                                      | 次のアクション                                        |
   | -------- | ----------------------------------------- | ----------------------------------------------------- |
   | PASS     | CRITICAL: 0件、MAJOR: 0件、MINOR: 0件     | Phase 4（テスト作成）へ進む                           |
   | MINOR    | CRITICAL: 0件、MAJOR: 0件、MINOR: 1件以上 | 指摘対応後 Phase 4 へ進む                             |
   | MAJOR    | CRITICAL: 0件、MAJOR: 1件以上             | 要件問題 → Phase 1 へ戻る / 設計問題 → Phase 2 へ戻る |
   | CRITICAL | CRITICAL: 1件以上                         | Phase 1 へ戻り要件再確認                              |

3. 戻り先決定基準

   | 問題の種類                               | 戻り先  |
   | ---------------------------------------- | ------- |
   | 要件の漏れ・矛盾（機能要件が未定義）     | Phase 1 |
   | セキュリティ要件の根本的な問題           | Phase 1 |
   | 設計の不整合（Props 設計、状態管理方針） | Phase 2 |
   | Tailwind CSS クラスの誤り                | Phase 2 |
   | テスト戦略の不備                         | Phase 2 |

4. MINOR 指摘の処理
   - 全ての MINOR 指摘を未タスク仕様書に変換する（「機能影響なし」でも省略不可）
   - 変換先: `tasks/unassigned-task/` 配下に指示書を作成
   - `task-workflow.md` 残課題テーブルに登録
   - 関連仕様書に参照リンクを追加

**期待される成果物**: `outputs/phase-3/review-summary.md`

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| ドキュメント                     | パス                                                                                        | 利用目的                               |
| -------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------- |
| Phase 1 成果物                   | `outputs/phase-1/`                                                                          | 要件定義との整合性確認                 |
| Phase 2 成果物                   | `outputs/phase-2/`                                                                          | 設計内容の検証対象                     |
| UI コンポーネント仕様            | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | 既存コンポーネント設計パターン照合     |
| UI 設計原則                      | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              | デザインシステム・アクセシビリティ基準 |
| デザインシステム                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                  | カラートークン・フォント値の照合       |
| 機能コンポーネント仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | 既存 Organism パターンの照合           |
| アーキテクチャ概要               | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | 全体アーキテクチャとの整合性確認       |
| 実装パターン                     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 既存パターンとの整合性確認             |
| 状態管理                         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | useState vs Zustand 判断のレビュー     |
| Agent SDK Skill インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | ImportedSkill 型定義の照合             |
| セキュア API                     | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | API セキュリティパターンの照合         |
| Electron IPC セキュリティ        | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | セキュリティ原則の照合                 |
| エラーハンドリング               | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラー分類・表示方法の照合             |
| 既存コンポーネント分析           | `outputs/phase-1/existing-component-analysis.md`                                            | Phase 1 成果物                         |
| UI要件定義                       | `outputs/phase-1/skill-editor-requirements.md`                                              | Phase 1 成果物                         |
| コンポーネント階層定義           | `outputs/phase-1/component-hierarchy-requirements.md`                                       | Phase 1 成果物                         |
| インタラクション仕様             | `outputs/phase-1/interaction-specifications.md`                                             | Phase 1 成果物                         |

### 実装コード・ルール参照

| ドキュメント       | パス                                                  | 利用目的                 |
| ------------------ | ----------------------------------------------------- | ------------------------ |
| 既存コンポーネント | `apps/desktop/src/renderer/components/skill/index.ts` | export パターンの照合    |
| 落とし穴集         | `.claude/rules/06-known-pitfalls.md`                  | P27, P39, P40 の考慮確認 |

## 統合テスト連携【必須】

### TASK-9A-B（ファイル編集 IPC ハンドラ）との設計整合性確認

- [ ] Phase 2 の IPC 呼び出しパターン（readFile / writeFile）が TASK-9A-B の設計と整合しているか
- [ ] エラーハンドリング設計が TASK-9A-B のサニタイズ済みエラーメッセージ形式と整合しているか
- [ ] TASK-9A-B の IPC チャンネル名（`skill:readFile`, `skill:writeFile`）が SkillEditor 設計と一致しているか

### 後続タスク（TASK-10A）への影響確認

- [ ] SkillEditor の設計が TASK-10A（スキルライフサイクル）の統合要件をブロックしていないか
- [ ] SkillEditor の Props インターフェースが TASK-10A から呼び出し可能な設計か

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                                                  | 仕様参照先                                                                     |
| ------------------ | --------------------------------------------------------- | ------------------------------------------------------------------------------ |
| セキュリティ       | ✅ 適用（Electron 3プロセスモデル準拠性レビュー）         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`   |
| UI/UX              | ✅ 適用（デザインシステム・カラートークン準拠性レビュー） | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`     |
| アーキテクチャ     | ✅ 適用（コンポーネント階層・状態管理方針レビュー）       | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`   |
| API設計            | ✅ 適用（IPC チャンネル設計の整合性レビュー）             | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`           |
| データ整合性       | ❌ 非適用（DB操作なし）                                   | -                                                                              |
| エラーハンドリング | ✅ 適用（エラー分類・表示方法のレビュー）                 | `.claude/skills/aiworkflow-requirements/references/error-handling.md`          |
| パフォーマンス     | ✅ 適用（非機能要件のカバレッジレビュー）                 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`   |
| アクセシビリティ   | ✅ 適用（WCAG 2.1 AA 全基準のレビュー）                   | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断                                                | 仕様参照先                                                                        |
| -------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------- |
| フロントエンド（Renderer） | ✅ 適用（コンポーネント設計・テスト実現可能性レビュー） | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           |
| バックエンド（Main）       | ❌ 非適用（TASK-9A-B の責務）                           | -                                                                                 |
| IPC通信                    | ✅ 適用（TASK-9A-B との設計整合性レビュー）             | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` |
| Preload/セキュリティ       | ✅ 適用（contextBridge API 利用パターンのレビュー）     | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`      |
| ローカルストレージ         | ❌ 非適用（ファイル操作は Main Process 側）             | -                                                                                 |

## 成果物

| 成果物                                         | パス                                                    | 説明                                             |
| ---------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------ |
| 要件整合性レビュー結果                         | `outputs/phase-3/requirements-alignment-review.md`      | Phase 1 要件と Phase 2 設計の整合性検証結果      |
| セキュリティレビュー結果                       | `outputs/phase-3/security-review.md`                    | Electron セキュリティ原則準拠性の検証結果        |
| デザインシステム・アクセシビリティレビュー結果 | `outputs/phase-3/design-system-accessibility-review.md` | デザイントークンと WCAG 2.1 AA の検証結果        |
| 既存パターン整合性レビュー結果                 | `outputs/phase-3/pattern-alignment-review.md`           | 既存コンポーネントとの設計パターン整合性検証     |
| レビュー結果サマリー・ゲート判定               | `outputs/phase-3/review-summary.md`                     | 全レビューの集約とゲート判定（PASS/MINOR/MAJOR） |

## 完了条件

- [ ] Task 1: Phase 1 の全機能要件（10項目）と非機能要件（3項目）の設計カバレッジが検証されている
- [ ] Task 2: Electron セキュリティ原則（7項目）の準拠性が検証されている
- [ ] Task 3: デザインシステム準拠性（9項目）と WCAG 2.1 AA 準拠性（8項目）が検証されている
- [ ] Task 4: 既存コンポーネントとの設計パターン（6項目）と命名規則（4項目）の整合性が検証されている
- [ ] Task 5: レビュー結果の集約とゲート判定（PASS / MINOR / MAJOR / CRITICAL）が行われている
- [ ] Task 5: MINOR 指摘がある場合、全て未タスク仕様書に変換されている
- [ ] 全タスクの成果物ファイルが `outputs/phase-3/` に作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Task 1: 要件整合性レビュー
3. Task 2: Electron セキュリティレビュー
4. Task 3: デザインシステム・アクセシビリティレビュー
5. Task 4: 既存パターン整合性レビュー
6. Task 5: レビュー結果判定
7. 統合テスト連携の実施
8. 成果物の作成・配置
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-9A-C-skill-editor-ui --phase 3
```

## 次のPhase

ゲート判定が PASS または MINOR（対応完了後）の場合、Phase 4（テスト作成）に進む。
MAJOR の場合は問題種別に応じて Phase 1 または Phase 2 に戻る。
CRITICAL の場合は Phase 1 に戻り要件を再確認する。
