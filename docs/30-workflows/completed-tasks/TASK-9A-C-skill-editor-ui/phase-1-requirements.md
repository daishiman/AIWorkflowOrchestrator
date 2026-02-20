# Phase 1: 要件定義 — SkillEditor コンポーネント実装

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| タスク ID  | TASK-9A-C                              |
| Phase      | 1（要件定義）                          |
| 前提 Phase | なし                                   |
| 後続 Phase | Phase 2（設計）                        |
| ステータス | 未着手                                 |
| 作成日     | 2026-02-19                             |
| 機能名     | SkillEditor コンポーネント             |
| 依存タスク | TASK-9A-B（ファイル編集 IPC ハンドラ） |

## 目的

SkillEditor コンポーネントの UI 要件を定義する。
TASK-9A-B で実装される `readFile` / `writeFile` IPC メソッドを利用して、インポート済みスキルのサブリソースファイル（agents, references, scripts, assets, schemas, indexes, その他）を Renderer Process 上で閲覧・編集・保存する機能の要件を明確化する。

## 実行タスク

### Task 1: 既存スキルコンポーネント分析

**目的**: 既存の SkillSelector / SkillImportDialog / SkillStreamingView のインターフェースパターンと Atomic Design 階層を分析し、SkillEditor の設計基盤とする。

**実行手順**:

1. 以下の既存コンポーネントの Props インターフェース・状態管理パターン・アクセシビリティ実装を確認する
   - `apps/desktop/src/renderer/components/skill/SkillSelector.tsx` — Molecule、個別セレクタベース
   - `apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx` — Organism、Props: `{ skill, isOpen, onClose }`
   - `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx` — Organism、forwardRef + useImperativeHandle
2. 各コンポーネントが使用している Store 個別セレクタ一覧を記録する
3. 各コンポーネントのキーボードナビゲーション実装（Escape、Tab、ArrowUp/Down）を記録する

**期待される成果物**: `outputs/phase-1/existing-component-analysis.md`

### Task 2: SkillEditor UI 要件定義

**目的**: SkillEditor コンポーネントが満たすべき機能要件を網羅的に定義する。

**実行手順**:

1. SkillEditor の機能要件を以下の観点で列挙する

   **ファイルツリーサイドバー要件**:
   - `ImportedSkill` 型の `agents`, `references`, `scripts`, `assets`, `schemas`, `indexes`, `otherFiles` プロパティからツリー構造を構築する
   - 各 `SkillSubResource` の `relativePath` をツリーノードのキーとして使用する
   - `SkillOtherFile` は「その他」カテゴリとしてツリーに表示する
   - 空のカテゴリ（ファイルが0件）は非表示にする
   - ファイル選択時に `selectedFile` 状態を更新する
   - 選択中のファイルはハイライト表示する（`bg-blue-50` / ダークモード: `bg-blue-900/20`）

   **コードエディター要件**:
   - テキストエリアベースのコードエディター（`<textarea>` 要素）を使用する
   - ファイル拡張子に基づいて `language` を自動推定する（`getLanguage` ユーティリティ）
   - コードフォント `JetBrains Mono, Source Code Pro, Noto Sans Mono, monospace` を適用する
   - フォントサイズは `14px`（`text-sm` トークン）を使用する
   - タブキー押下時にタブ文字（2スペース）を挿入する（デフォルトのフォーカス移動を抑制）
   - 変更があった場合 `hasChanges` を `true` に設定する

   **ツールバー要件**:
   - 保存ボタン: `isSaving` が `true` の間は無効化し、スピナーを表示する
   - 閉じるボタン: `hasChanges` が `true` の場合、確認ダイアログを表示する
   - 保存ショートカット: macOS は `Cmd+S`、Windows/Linux は `Ctrl+S`
   - ファイル名をツールバー中央に表示する
   - 未保存変更がある場合、ファイル名の後に「（未保存）」ラベルを表示する

   **ローディング・エラー要件**:
   - ファイル読み込み中は `isLoading: true` でスピナーを表示する
   - 読み込みエラー時はエディター領域にインラインエラーメッセージを表示する
   - 保存エラー時はトースト通知でエラーメッセージを表示する
   - エラーメッセージは Main Process からサニタイズ済みの文字列を受け取る（内部パスを含まない）

2. 非機能要件を以下の観点で列挙する
   - **パフォーマンス**: 1MB 以下のテキストファイルを 500ms 以内に表示する
   - **アクセシビリティ**: WCAG 2.1 AA 準拠（コントラスト比 4.5:1 以上、キーボード操作可能）
   - **セキュリティ**: Renderer Process から直接ファイルシステムにアクセスしない（IPC 経由のみ）

**期待される成果物**: `outputs/phase-1/skill-editor-requirements.md`

### Task 3: コンポーネント階層と Props インターフェース要件

**目的**: SkillEditor を構成するコンポーネントの階層構造と Props インターフェースの要件を定義する。

**実行手順**:

1. 以下のコンポーネント階層を定義する

   ```
   SkillEditor (Organism)
   ├── FileTreeSidebar (Molecule)
   │   ├── FileTreeCategory (Atom) × N
   │   │   └── FileTreeItem (Atom) × N
   │   └── （空カテゴリは非表示）
   ├── EditorToolbar (Molecule)
   │   ├── ファイル名表示 + 未保存ラベル
   │   ├── SaveButton (Atom)
   │   └── CloseButton (Atom)
   └── SkillCodeEditor (Molecule)
       └── <textarea> 要素
   ```

2. 各コンポーネントの Props インターフェース要件を定義する

   **SkillEditor**（Organism）:

   ```typescript
   interface SkillEditorProps {
     /** 編集対象のインポート済みスキル */
     skill: ImportedSkill;
     /** エディター閉じるコールバック */
     onClose: () => void;
   }
   ```

   **SkillCodeEditor**（Molecule）:

   ```typescript
   interface SkillCodeEditorProps {
     /** エディターに表示するテキスト内容 */
     value: string;
     /** テキスト変更時のコールバック */
     onChange: (value: string) => void;
     /** ファイルの言語（シンタックスハイライト用の将来拡張ポイント） */
     language: string;
   }
   ```

3. 内部状態の管理方針を定義する

   | 状態名       | 型               | 初期値  | 管理方法   | 説明                                    |
   | ------------ | ---------------- | ------- | ---------- | --------------------------------------- |
   | selectedFile | `string \| null` | `null`  | `useState` | 選択中のファイルの `relativePath`       |
   | content      | `string`         | `""`    | `useState` | エディターに表示中のファイル内容        |
   | isLoading    | `boolean`        | `false` | `useState` | ファイル読み込み中フラグ                |
   | isSaving     | `boolean`        | `false` | `useState` | ファイル保存中フラグ                    |
   | hasChanges   | `boolean`        | `false` | `useState` | 未保存の変更があるかどうか              |
   | error        | `string \| null` | `null`  | `useState` | エラーメッセージ（読み込み/保存失敗時） |

   **状態管理方針**:
   - SkillEditor の内部状態は全て `useState` で管理する（アプリ全体で共有する必要がない一時的な UI 状態のため）
   - Zustand Store（agentSlice）にはスキルエディター専用の状態を追加しない
   - `ImportedSkill` データは呼び出し元から Props で受け取る

4. ユーティリティ関数の要件を定義する

   **buildFileTree**:
   - 入力: `ImportedSkill` オブジェクト
   - 出力: カテゴリ名をキー、`SkillSubResource[]` を値とする `Record<string, SkillSubResource[]>` 型
   - 空のカテゴリ（配列の length が 0）は出力に含めない
   - カテゴリの表示順: agents → references → scripts → assets → schemas → indexes → その他

   **getLanguage**:
   - 入力: ファイル名（`string`）
   - 出力: 言語識別子（`string`）
   - 対応マッピング:
     | 拡張子 | 言語識別子 |
     | --- | --- |
     | `.ts`, `.tsx` | `typescript` |
     | `.js`, `.jsx` | `javascript` |
     | `.md` | `markdown` |
     | `.json` | `json` |
     | `.yaml`, `.yml` | `yaml` |
     | `.css` | `css` |
     | `.html` | `html` |
     | `.sh` | `shell` |
     | `.py` | `python` |
     | その他 | `plaintext` |

**期待される成果物**: `outputs/phase-1/component-hierarchy-requirements.md`

### Task 4: インタラクション仕様定義

**目的**: SkillEditor のユーザーインタラクション（キーボード操作、アニメーション、確認ダイアログ）の仕様を定義する。

**実行手順**:

1. キーボードショートカット一覧を定義する

   | ショートカット        | アクション       | 条件                     |
   | --------------------- | ---------------- | ------------------------ |
   | `Cmd+S` / `Ctrl+S`    | ファイル保存     | `hasChanges` が `true`   |
   | `Escape`              | エディター閉じる | 常時                     |
   | `Tab`（エディター内） | 2スペース挿入    | エディターにフォーカス中 |

2. ファイル選択時のフローを定義する

   ```
   ファイルツリーでファイルクリック
     ↓
   hasChanges が true の場合
     ↓ Yes                              ↓ No
   確認ダイアログ表示                  ファイル読み込み開始
   「未保存の変更があります。            ↓
    破棄しますか？」                   isLoading = true
     ↓ 破棄        ↓ キャンセル         ↓
   ファイル読み込み  何もしない        IPC: readFile(skillName, relativePath)
     ↓                                  ↓
   isLoading = true                    content = レスポンス
     ↓                                  ↓
   IPC: readFile(skillName, relativePath) isLoading = false
     ↓                                  ↓
   content = レスポンス                hasChanges = false
     ↓
   isLoading = false
     ↓
   hasChanges = false
   ```

3. 保存フローを定義する

   ```
   保存ボタンクリック or Cmd+S / Ctrl+S
     ↓
   isSaving = true
     ↓
   IPC: writeFile(skillName, selectedFile, content)
     ↓ 成功                   ↓ 失敗
   isSaving = false           isSaving = false
     ↓                        ↓
   hasChanges = false         error = サニタイズ済みエラーメッセージ
                               ↓
                             トースト通知で表示
   ```

4. アニメーション仕様を定義する

   | 対象                     | 継続時間 | イージング  | トリガー                   |
   | ------------------------ | -------- | ----------- | -------------------------- |
   | ファイルツリー項目ホバー | 100ms    | ease-out    | マウスホバー               |
   | ツールバーボタンホバー   | 100ms    | ease-out    | マウスホバー               |
   | 保存中スピナー           | 回転     | linear      | `isSaving` が `true`       |
   | 読み込み中スピナー       | 回転     | linear      | `isLoading` が `true`      |
   | エラーメッセージ表示     | 200ms    | ease-in-out | `error` が `null` → 文字列 |

5. アクセシビリティ要件を定義する

   | 要素               | ARIA 属性                                                                  | キーボード操作                |
   | ------------------ | -------------------------------------------------------------------------- | ----------------------------- |
   | ファイルツリー     | `role="tree"`, `aria-label="スキルファイル一覧"`                           | ArrowUp/Down でフォーカス移動 |
   | ツリーカテゴリ     | `role="treeitem"`, `aria-expanded`                                         | Enter/Space で展開/折りたたみ |
   | ツリーファイル項目 | `role="treeitem"`, `aria-selected`                                         | Enter で選択                  |
   | コードエディター   | `role="textbox"`, `aria-label="コードエディター"`, `aria-multiline="true"` | 標準テキスト編集              |
   | 保存ボタン         | `aria-label="保存"`, `aria-disabled`                                       | Enter/Space で実行            |
   | 閉じるボタン       | `aria-label="閉じる"`                                                      | Enter/Space で実行            |

**期待される成果物**: `outputs/phase-1/interaction-specifications.md`

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| ドキュメント                     | パス                                                                                        | 利用目的                               |
| -------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------- |
| UI コンポーネント仕様            | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | 既存コンポーネント分析                 |
| UI 設計原則                      | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              | Atomic Design・アクセシビリティ基準    |
| デザインシステム                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                  | カラー・スペーシング・フォント値       |
| 機能コンポーネント仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | 既存 Organism パターン                 |
| アーキテクチャ概要               | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | 全体アーキテクチャ・レイヤー依存方向   |
| 実装パターン                     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン集・fireEvent vs userEvent |
| 状態管理                         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | useState vs Zustand 判断基準           |
| Agent SDK Skill インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | ImportedSkill 型定義                   |
| セキュア API                     | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | Electron contextBridge セキュリティ    |
| Electron IPC セキュリティ        | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC セキュリティ原則                   |
| エラーハンドリング               | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーカテゴリ・コード範囲             |

### 実装コード参照

| ドキュメント            | パス                                                                | 利用目的                         |
| ----------------------- | ------------------------------------------------------------------- | -------------------------------- |
| 型定義ファイル          | `packages/shared/src/types/skill.ts`                                | SkillMetadata / ImportedSkill 型 |
| 既存 SkillSelector      | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`      | Props パターン・セレクタ使用例   |
| 既存 SkillImportDialog  | `apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx`  | Organism 設計パターン            |
| 既存 SkillStreamingView | `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx` | Organism 設計パターン            |
| agentSlice              | `apps/desktop/src/renderer/store/slices/agentSlice.ts`              | スキル関連 Store 構造            |

## 統合テスト連携【必須】

### TASK-9A-B（ファイル編集 IPC ハンドラ）との接続要件

- [ ] `window.electronAPI.skill.readFile(skillName: string, filePath: string): Promise<string>` が利用可能であること
- [ ] `window.electronAPI.skill.writeFile(skillName: string, filePath: string, content: string): Promise<void>` が利用可能であること
- [ ] 読み込みエラー時にサニタイズ済みエラーメッセージが返却されること（内部パス非露出）
- [ ] 書き込みエラー時にサニタイズ済みエラーメッセージが返却されること（内部パス非露出）
- [ ] `filePath` にパストラバーサル文字列（`../`）が含まれる場合、Main Process 側で拒否されること

### 呼び出し元（SkillDetailPanel 等）との接続要件

- [ ] SkillEditor の Props `skill: ImportedSkill` は呼び出し元が agentSlice から取得した値を渡すこと
- [ ] SkillEditor の Props `onClose: () => void` で呼び出し元がエディターの表示/非表示を制御すること

## アーキテクチャ層別要件（AIが判断）

タスクの性質に応じて、以下の層別に要件を整理する：

| 層                         | 確認観点                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------- |
| フロントエンド（Renderer） | SkillEditor / SkillCodeEditor の UI 要件、useState による状態管理要件、WCAG 2.1 AA 要件 |
| バックエンド（Main）       | TASK-9A-B の責務（本タスクのスコープ外）                                                |
| IPC通信                    | readFile / writeFile チャンネルの利用要件（Renderer → Main の一方向通信）               |
| セキュリティ               | contextBridge 経由の IPC 利用、パストラバーサル防御は Main 側（TASK-9A-B）              |
| データ                     | ファイル内容はローカル状態（useState）で管理、永続化は Main Process 側で実施            |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                                               | 仕様参照先                                                                     |
| ------------------ | ------------------------------------------------------ | ------------------------------------------------------------------------------ |
| セキュリティ       | ✅ 適用（IPC経由のファイル操作、パストラバーサル防御） | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`   |
| UI/UX              | ✅ 適用（SkillEditor UIコンポーネント実装）            | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`        |
| アーキテクチャ     | ✅ 適用（Renderer Process コンポーネント設計）         | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`   |
| API設計            | ✅ 適用（IPC readFile/writeFile チャンネル利用）       | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`           |
| データ整合性       | ❌ 非適用（DB操作なし）                                | -                                                                              |
| エラーハンドリング | ✅ 適用（読み込み/保存エラーの分類と表示）             | `.claude/skills/aiworkflow-requirements/references/error-handling.md`          |
| パフォーマンス     | ✅ 適用（1MB以下のファイルを500ms以内に表示）          | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`   |
| アクセシビリティ   | ✅ 適用（WCAG 2.1 AA、ARIA属性、キーボード操作）       | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断                                                    | 仕様参照先                                                                        |
| -------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------- |
| フロントエンド（Renderer） | ✅ 適用（SkillEditor / SkillCodeEditor コンポーネント実装） | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           |
| バックエンド（Main）       | ❌ 非適用（TASK-9A-B の責務）                               | -                                                                                 |
| IPC通信                    | ✅ 適用（readFile / writeFile チャンネル利用）              | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` |
| Preload/セキュリティ       | ✅ 適用（contextBridge 経由の API 利用）                    | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`      |
| ローカルストレージ         | ❌ 非適用（ファイル操作は Main Process 側）                 | -                                                                                 |

## 成果物

| 成果物                         | パス                                                  | 説明                                         |
| ------------------------------ | ----------------------------------------------------- | -------------------------------------------- |
| 既存コンポーネント分析         | `outputs/phase-1/existing-component-analysis.md`      | 既存スキルコンポーネントの分析結果           |
| SkillEditor UI 要件定義        | `outputs/phase-1/skill-editor-requirements.md`        | 機能要件・非機能要件の定義                   |
| コンポーネント階層・Props 要件 | `outputs/phase-1/component-hierarchy-requirements.md` | Atomic Design に基づくコンポーネント階層定義 |
| インタラクション仕様           | `outputs/phase-1/interaction-specifications.md`       | キーボード操作・アニメーション・A11y 仕様    |

## 完了条件

- [ ] Task 1: 既存スキルコンポーネント（SkillSelector, SkillImportDialog, SkillStreamingView）の分析が完了し、Props パターン・Store セレクタ使用・アクセシビリティ実装が記録されている
- [ ] Task 2: SkillEditor の機能要件（ファイルツリー・エディター・ツールバー・ローディング/エラー）と非機能要件（パフォーマンス・アクセシビリティ・セキュリティ）が定義されている
- [ ] Task 3: コンポーネント階層（SkillEditor → FileTreeSidebar / EditorToolbar / SkillCodeEditor）が Atomic Design に準拠して定義されている
- [ ] Task 3: 各コンポーネントの Props インターフェースと内部状態管理方針が定義されている
- [ ] Task 3: ユーティリティ関数（buildFileTree, getLanguage）の入出力仕様が定義されている
- [ ] Task 4: キーボードショートカット・ファイル選択/保存フロー・アニメーション・アクセシビリティ仕様が定義されている
- [ ] 全タスクの成果物ファイルが `outputs/phase-1/` に作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Task 1: 既存スキルコンポーネント分析
3. Task 2: SkillEditor UI 要件定義
4. Task 3: コンポーネント階層と Props インターフェース要件
5. Task 4: インタラクション仕様定義
6. 統合テスト連携の実施
7. 成果物の作成・配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-9A-C-skill-editor-ui --phase 1
```

## 次のPhase

Phase 2（設計）: コンポーネント詳細設計・テスト戦略設計に進む。
