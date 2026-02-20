# Phase 2: 設計 — SkillEditor コンポーネント実装

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| タスク ID  | TASK-9A-C                              |
| Phase      | 2（設計）                              |
| 前提 Phase | Phase 1（要件定義）                    |
| 後続 Phase | Phase 3（設計レビュー）                |
| ステータス | 未着手                                 |
| 作成日     | 2026-02-19                             |
| 機能名     | SkillEditor コンポーネント             |
| 依存タスク | TASK-9A-B（ファイル編集 IPC ハンドラ） |

## 目的

Phase 1 で定義した要件に基づき、SkillEditor コンポーネント群の詳細設計を行う。
コンポーネント構造、Props/State インターフェース、IPC 通信パターン、エラーハンドリング、テスト戦略を具体的なコードレベルで設計する。

## 実行タスク

### Task 1: コンポーネント詳細設計

**目的**: SkillEditor / SkillCodeEditor / FileTreeSidebar / EditorToolbar の詳細なコンポーネント設計を行う。

**実行手順**:

1. **SkillEditor**（Organism）の詳細設計

   **ファイルパス**: `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`

   **Props インターフェース**:

   ```typescript
   import type { ImportedSkill } from "@repo/shared";

   export interface SkillEditorProps {
     /** 編集対象のインポート済みスキル */
     skill: ImportedSkill;
     /** エディター閉じるコールバック */
     onClose: () => void;
   }
   ```

   **内部状態**:

   ```typescript
   const [selectedFile, setSelectedFile] = useState<string | null>(null);
   const [content, setContent] = useState<string>("");
   const [isLoading, setIsLoading] = useState<boolean>(false);
   const [isSaving, setIsSaving] = useState<boolean>(false);
   const [hasChanges, setHasChanges] = useState<boolean>(false);
   const [error, setError] = useState<string | null>(null);
   ```

   **レイアウト構造**:

   ```
   ┌──────────────────────────────────────────────────┐
   │ EditorToolbar                                     │
   │  [ファイル名 (未保存)] [保存ボタン] [閉じるボタン]  │
   ├──────────────┬───────────────────────────────────┤
   │ FileTree     │ SkillCodeEditor                   │
   │ Sidebar      │                                   │
   │              │                                   │
   │ agents/      │  （テキストエリア）                 │
   │  ├── a.md    │                                   │
   │  └── b.md    │                                   │
   │ references/  │                                   │
   │  └── c.md    │                                   │
   │              │                                   │
   ├──────────────┴───────────────────────────────────┤
   ```

   **CSS レイアウト**:
   - 外枠: `flex flex-col h-full`
   - コンテンツ領域: `flex flex-1 overflow-hidden`
   - サイドバー: `w-64 border-r border-slate-200 dark:border-slate-700 overflow-y-auto`
   - エディター領域: `flex-1 overflow-hidden`

   **キーボードイベント処理**:
   - `useEffect` でグローバル `keydown` リスナーを登録する
   - `Cmd+S` / `Ctrl+S`: `handleSave()` を呼び出す（`event.preventDefault()` 必須）
   - `Escape`: `handleClose()` を呼び出す
   - クリーンアップ: `useEffect` の return でリスナーを解除する

2. **SkillCodeEditor**（Molecule）の詳細設計

   **ファイルパス**: `apps/desktop/src/renderer/components/skill/SkillCodeEditor.tsx`

   **Props インターフェース**:

   ```typescript
   export interface SkillCodeEditorProps {
     /** エディターに表示するテキスト内容 */
     value: string;
     /** テキスト変更時のコールバック */
     onChange: (value: string) => void;
     /** ファイルの言語（将来のシンタックスハイライト用） */
     language: string;
     /** 読み取り専用モード（保存中・読み込み中に使用） */
     isReadOnly?: boolean;
   }
   ```

   **textarea 要素設計**:

   ```typescript
   <textarea
     className="w-full h-full p-4 font-mono text-sm resize-none
       bg-white dark:bg-slate-900
       text-slate-900 dark:text-slate-50
       focus:outline-none"
     style={{ fontFamily: 'JetBrains Mono, Source Code Pro, Noto Sans Mono, monospace' }}
     value={value}
     onChange={(e) => onChange(e.target.value)}
     onKeyDown={handleKeyDown}
     readOnly={isReadOnly}
     role="textbox"
     aria-label="コードエディター"
     aria-multiline="true"
     spellCheck={false}
   />
   ```

   **Tab キー処理**:

   ```typescript
   const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
     if (e.key === "Tab") {
       e.preventDefault();
       const textarea = e.currentTarget;
       const start = textarea.selectionStart;
       const end = textarea.selectionEnd;
       const newValue = value.substring(0, start) + "  " + value.substring(end);
       onChange(newValue);
       // 次の描画後にカーソル位置を復元
       requestAnimationFrame(() => {
         textarea.selectionStart = start + 2;
         textarea.selectionEnd = start + 2;
       });
     }
   };
   ```

3. **FileTreeSidebar**（Molecule）の詳細設計

   **SkillEditor 内部のインライン実装**として設計する（独立ファイルとしては切り出さない）。

   **Props**:

   ```typescript
   // SkillEditor 内部で使用する型
   interface FileTreeProps {
     /** カテゴリ別ファイルツリー */
     fileTree: Record<string, SkillSubResource[]>;
     /** 選択中のファイルパス */
     selectedFile: string | null;
     /** ファイル選択コールバック */
     onSelectFile: (relativePath: string) => void;
   }
   ```

   **カテゴリ表示名マッピング**:

   ```typescript
   const CATEGORY_LABELS: Record<string, string> = {
     agents: "エージェント (agents/)",
     references: "参照資料 (references/)",
     scripts: "スクリプト (scripts/)",
     assets: "アセット (assets/)",
     schemas: "スキーマ (schemas/)",
     indexes: "インデックス (indexes/)",
     otherFiles: "その他",
   };
   ```

   **ツリーアイテムスタイル**:
   - 通常: `px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-100`
   - 選択中: `bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium`

4. **EditorToolbar**（Molecule）の詳細設計

   **SkillEditor 内部のインライン実装**として設計する。

   **構造**:

   ```
   <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
     <span>ファイル名 {hasChanges && '（未保存）'}</span>
     <div className="flex gap-2">
       <SaveButton />
       <CloseButton />
     </div>
   </div>
   ```

   **保存ボタン仕様**:
   - 有効条件: `hasChanges === true && isSaving === false && selectedFile !== null`
   - 無効時: `opacity-50 cursor-not-allowed`
   - 保存中: ボタンテキストを「保存中...」に変更し、スピナーアイコンを表示

   **閉じるボタン仕様**:
   - 常時有効
   - クリック時に `handleClose()` を呼び出す

**期待される成果物**: `outputs/phase-2/component-detail-design.md`

### Task 2: IPC 通信パターン設計

**目的**: Renderer → Preload → Main の IPC 通信パターンを設計する。

**実行手順**:

1. ファイル読み込みの IPC 呼び出しパターンを設計する

   ```typescript
   const handleSelectFile = async (relativePath: string) => {
     // 未保存変更チェック
     if (hasChanges) {
       const shouldDiscard = window.confirm(
         "未保存の変更があります。破棄してファイルを切り替えますか？",
       );
       if (!shouldDiscard) return;
     }

     setSelectedFile(relativePath);
     setIsLoading(true);
     setError(null);
     setHasChanges(false);

     try {
       const fileContent = await window.electronAPI.skill.readFile(
         skill.name,
         relativePath,
       );
       setContent(fileContent);
     } catch (err: unknown) {
       const message =
         err instanceof Error
           ? err.message
           : "ファイルの読み込みに失敗しました";
       setError(message);
       setContent("");
     } finally {
       setIsLoading(false);
     }
   };
   ```

2. ファイル保存の IPC 呼び出しパターンを設計する

   ```typescript
   const handleSave = async () => {
     if (!selectedFile || !hasChanges || isSaving) return;

     setIsSaving(true);
     setError(null);

     try {
       await window.electronAPI.skill.writeFile(
         skill.name,
         selectedFile,
         content,
       );
       setHasChanges(false);
     } catch (err: unknown) {
       const message =
         err instanceof Error ? err.message : "ファイルの保存に失敗しました";
       setError(message);
     } finally {
       setIsSaving(false);
     }
   };
   ```

3. IPC チャンネル定義の確認（TASK-9A-B で追加予定）

   | チャンネル名      | 方向            | 引数                                                     | 戻り値            |
   | ----------------- | --------------- | -------------------------------------------------------- | ----------------- |
   | `skill:readFile`  | Renderer → Main | `(skillName: string, filePath: string)`                  | `Promise<string>` |
   | `skill:writeFile` | Renderer → Main | `(skillName: string, filePath: string, content: string)` | `Promise<void>`   |

   **セキュリティ要件**:
   - `filePath` のパストラバーサル検証は Main Process 側で実施（TASK-9A-B の責務）
   - Renderer 側では `filePath` に `../` が含まれないことをバリデーションしない（多層防御の観点から Main 側で防御）
   - エラーメッセージは Main Process でサニタイズ済み（内部パス非露出）

**期待される成果物**: `outputs/phase-2/ipc-communication-design.md`

### Task 3: ユーティリティ関数設計

**目的**: `buildFileTree` と `getLanguage` ユーティリティ関数の詳細設計を行う。

**実行手順**:

1. **buildFileTree** の詳細設計

   **配置先**: `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`（コンポーネントファイル内にエクスポートして配置）

   ```typescript
   import type { ImportedSkill, SkillSubResource } from "@repo/shared";

   export interface FileTreeCategory {
     /** カテゴリキー */
     key: string;
     /** カテゴリ表示名 */
     label: string;
     /** カテゴリ内のファイル一覧 */
     files: SkillSubResource[];
   }

   /**
    * ImportedSkill のサブリソースからファイルツリー構造を構築する。
    * 空のカテゴリ（ファイル数0）は結果に含めない。
    *
    * @param skill - 対象の ImportedSkill
    * @returns カテゴリ別ファイルツリー（空カテゴリ除外済み）
    */
   export function buildFileTree(skill: ImportedSkill): FileTreeCategory[] {
     const categories: {
       key: string;
       label: string;
       files: SkillSubResource[];
     }[] = [
       { key: "agents", label: "エージェント (agents/)", files: skill.agents },
       {
         key: "references",
         label: "参照資料 (references/)",
         files: skill.references,
       },
       { key: "scripts", label: "スクリプト (scripts/)", files: skill.scripts },
       { key: "assets", label: "アセット (assets/)", files: skill.assets },
       { key: "schemas", label: "スキーマ (schemas/)", files: skill.schemas },
       {
         key: "indexes",
         label: "インデックス (indexes/)",
         files: skill.indexes,
       },
       {
         key: "otherFiles",
         label: "その他",
         files: skill.otherFiles.map((f) => ({
           filename: f.filename,
           relativePath: f.relativePath,
           size: f.size,
         })),
       },
     ];

     return categories.filter((cat) => cat.files.length > 0);
   }
   ```

2. **getLanguage** の詳細設計

   **配置先**: `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`（コンポーネントファイル内にエクスポートして配置）

   ```typescript
   const EXTENSION_LANGUAGE_MAP: Record<string, string> = {
     ".ts": "typescript",
     ".tsx": "typescript",
     ".js": "javascript",
     ".jsx": "javascript",
     ".md": "markdown",
     ".json": "json",
     ".yaml": "yaml",
     ".yml": "yaml",
     ".css": "css",
     ".html": "html",
     ".sh": "shell",
     ".py": "python",
   };

   /**
    * ファイル名の拡張子から言語識別子を推定する。
    * 未対応の拡張子は 'plaintext' を返す。
    *
    * @param filename - ファイル名（例: 'SKILL.md', 'index.ts'）
    * @returns 言語識別子（例: 'markdown', 'typescript', 'plaintext'）
    */
   export function getLanguage(filename: string): string {
     const lastDotIndex = filename.lastIndexOf(".");
     if (lastDotIndex === -1) return "plaintext";
     const ext = filename.substring(lastDotIndex).toLowerCase();
     return EXTENSION_LANGUAGE_MAP[ext] ?? "plaintext";
   }
   ```

**期待される成果物**: `outputs/phase-2/utility-functions-design.md`

### Task 4: エラーハンドリング設計

**目的**: SkillEditor で発生しうるエラーの分類と表示方法を設計する。

**実行手順**:

1. エラーシナリオの一覧と対応方法を定義する

   | シナリオ                       | エラーカテゴリ         | コード範囲 | UI 表示方法                          | リトライ               |
   | ------------------------------ | ---------------------- | ---------- | ------------------------------------ | ---------------------- |
   | スキルファイルが存在しない     | Business Error         | 2000-2999  | エディター領域にインラインメッセージ | 不可                   |
   | ファイル読み込み失敗           | Infrastructure Error   | 4000-4999  | エディター領域にインラインメッセージ | 可能（再選択で再試行） |
   | ファイル保存失敗               | Infrastructure Error   | 4000-4999  | トースト通知                         | 可能（再保存で再試行） |
   | IPC 通信タイムアウト           | External Service Error | 3000-3999  | トースト通知                         | 可能                   |
   | 不正なファイルパス（Main拒否） | Validation Error       | 1000-1999  | エディター領域にインラインメッセージ | 不可                   |

2. エラー表示コンポーネントを設計する

   **インラインエラー**（エディター領域に表示）:

   ```typescript
   {error && !isLoading && (
     <div
       className="flex items-center justify-center h-full p-8"
       role="alert"
       aria-live="polite"
     >
       <div className="text-center">
         <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
         <button
           className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
           onClick={() => selectedFile && handleSelectFile(selectedFile)}
         >
           再読み込み
         </button>
       </div>
     </div>
   )}
   ```

   **トースト通知**（保存エラー時）:
   - 保存エラーは `error` 状態に設定し、ツールバー下部に一時表示する
   - 5秒後に自動消去する
   - 赤色背景（`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800`）

**期待される成果物**: `outputs/phase-2/error-handling-design.md`

### Task 5: テスト戦略設計

**目的**: SkillEditor / SkillCodeEditor のテスト戦略とテストケース概要を設計する。

**実行手順**:

1. テスト対象とカバレッジ目標を定義する

   | テスト対象      | テスト種別     | カバレッジ目標（Line） | カバレッジ目標（Branch） |
   | --------------- | -------------- | ---------------------- | ------------------------ |
   | SkillEditor     | ユニットテスト | 90%                    | 70%                      |
   | SkillCodeEditor | ユニットテスト | 90%                    | 70%                      |
   | buildFileTree   | ユニットテスト | 100%                   | 100%                     |
   | getLanguage     | ユニットテスト | 100%                   | 100%                     |

2. テスト環境と制約を定義する
   - テストフレームワーク: Vitest + @testing-library/react
   - DOM 環境: happy-dom（P39: `userEvent` 使用禁止、`fireEvent` を使用する）
   - IPC モック: `window.electronAPI.skill.readFile` / `writeFile` を `vi.fn()` でモック化
   - テスト実行ディレクトリ: `apps/desktop/`（P40: モノレポ環境でのディレクトリ依存回避）

3. テストケース概要を定義する

   **SkillEditor テストケース**:

   | #   | テストケース                                                         | テスト観点         |
   | --- | -------------------------------------------------------------------- | ------------------ |
   | 1   | ファイルツリーが skill のサブリソースから生成される                  | 正常系・描画       |
   | 2   | 空カテゴリはファイルツリーに表示されない                             | 境界値             |
   | 3   | ファイル選択時に readFile が呼び出される                             | IPC 連携           |
   | 4   | ファイル読み込み中にスピナーが表示される                             | ローディング状態   |
   | 5   | ファイル読み込みエラー時にエラーメッセージが表示される               | エラーハンドリング |
   | 6   | コンテンツ編集で「未保存」ラベルが表示される                         | 状態変更           |
   | 7   | 保存ボタンクリックで writeFile が呼び出される                        | IPC 連携           |
   | 8   | 保存中に保存ボタンが無効化される                                     | 状態変更           |
   | 9   | 保存エラー時にエラーメッセージが表示される                           | エラーハンドリング |
   | 10  | Cmd+S / Ctrl+S で保存が実行される                                    | キーボード操作     |
   | 11  | 未保存変更がある状態でファイル切り替え時に確認ダイアログが表示される | 確認フロー         |
   | 12  | 閉じるボタンで onClose が呼び出される                                | コールバック       |
   | 13  | Escape キーで onClose が呼び出される                                 | キーボード操作     |
   | 14  | アクセシビリティ属性が正しく設定される                               | アクセシビリティ   |

   **SkillCodeEditor テストケース**:

   | #   | テストケース                                            | テスト観点       |
   | --- | ------------------------------------------------------- | ---------------- |
   | 1   | value prop の内容が textarea に表示される               | 正常系・描画     |
   | 2   | テキスト入力で onChange が呼び出される                  | コールバック     |
   | 3   | Tab キーで2スペースが挿入される                         | キーボード操作   |
   | 4   | isReadOnly が true の場合 textarea が読み取り専用になる | Props 制御       |
   | 5   | aria 属性が正しく設定される                             | アクセシビリティ |

   **buildFileTree テストケース**:

   | #   | テストケース                                         | テスト観点 |
   | --- | ---------------------------------------------------- | ---------- |
   | 1   | 全カテゴリにファイルがある場合、全カテゴリが返される | 正常系     |
   | 2   | 空カテゴリがフィルタリングされる                     | 境界値     |
   | 3   | 全カテゴリが空の場合、空配列が返される               | 境界値     |
   | 4   | otherFiles が SkillSubResource 形式に変換される      | 変換処理   |

   **getLanguage テストケース**:

   | #   | テストケース                            | テスト観点   |
   | --- | --------------------------------------- | ------------ |
   | 1   | `.ts` ファイルが `typescript` を返す    | 正常系       |
   | 2   | `.md` ファイルが `markdown` を返す      | 正常系       |
   | 3   | 拡張子なしファイルが `plaintext` を返す | 境界値       |
   | 4   | 未対応の拡張子が `plaintext` を返す     | 境界値       |
   | 5   | 大文字拡張子（`.MD`）が正しく処理される | 大文字小文字 |

**期待される成果物**: `outputs/phase-2/test-strategy-design.md`

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| ドキュメント                     | パス                                                                                        | 利用目的                             |
| -------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------ |
| Phase 1 成果物                   | `outputs/phase-1/`                                                                          | 要件定義の参照                       |
| UI コンポーネント仕様            | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | 既存コンポーネント設計パターン       |
| UI 設計原則                      | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              | Atomic Design・Tailwind CSS クラス   |
| デザインシステム                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                  | カラートークン・フォント指定         |
| 機能コンポーネント仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | 既存 Organism パターン               |
| アーキテクチャ概要               | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | 全体アーキテクチャ・レイヤー依存方向 |
| 実装パターン                     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | fireEvent vs userEvent パターン      |
| 状態管理                         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | useState vs Zustand 使い分け         |
| Agent SDK Skill インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | ImportedSkill / SkillSubResource 型  |
| セキュア API                     | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | Electron contextBridge セキュリティ  |
| Electron IPC セキュリティ        | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC 通信パターン                     |
| エラーハンドリング               | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーカテゴリ・コード範囲           |
| 既存コンポーネント分析           | `outputs/phase-1/existing-component-analysis.md`                                            | Phase 1 成果物                       |
| UI要件定義                       | `outputs/phase-1/skill-editor-requirements.md`                                              | Phase 1 成果物                       |
| コンポーネント階層定義           | `outputs/phase-1/component-hierarchy-requirements.md`                                       | Phase 1 成果物                       |
| インタラクション仕様             | `outputs/phase-1/interaction-specifications.md`                                             | Phase 1 成果物                       |

### 実装コード参照

| ドキュメント           | パス                                                               | 利用目的                         |
| ---------------------- | ------------------------------------------------------------------ | -------------------------------- |
| 既存 SkillImportDialog | `apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx` | RESOURCE_SECTIONS パターン参照   |
| 型定義ファイル         | `packages/shared/src/types/skill.ts`                               | SkillSubResource / ImportedSkill |

## 統合テスト連携【必須】

### TASK-9A-B（ファイル編集 IPC ハンドラ）との接続設計

- [ ] IPC モック（`vi.fn()`）の戻り値が TASK-9A-B の実際の戻り値型と一致すること
  - `readFile`: `Promise<string>`
  - `writeFile`: `Promise<void>`
- [ ] エラー時のモック（`vi.fn().mockRejectedValue()`）が TASK-9A-B のサニタイズ済みエラーメッセージ形式に準拠すること
- [ ] パストラバーサル検証は Main Process 側の責務であり、Renderer 側テストではバリデーションテストを含めないこと

### 呼び出し元との接続設計

- [ ] SkillEditor の Props は `ImportedSkill` 型を直接受け取り、Store セレクタに依存しない設計であること
- [ ] `onClose` コールバックの呼び出し条件（未保存変更時の確認含む）がテストされること

## アーキテクチャ層別設計（AIが判断）

タスクの性質に応じて、以下の層別に設計を行う：

| 層                         | 設計観点                                                           | 仕様参照先                                                                        |
| -------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| フロントエンド（Renderer） | コンポーネント詳細設計、useState 状態管理、Tailwind CSS レイアウト | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           |
| バックエンド（Main）       | TASK-9A-B の責務（本タスクのスコープ外）                           | -                                                                                 |
| IPC通信                    | readFile / writeFile チャンネルの呼び出しパターン設計              | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` |
| Preload                    | contextBridge 経由の API 利用設計                                  | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`      |
| データ                     | ファイル内容は useState ローカル管理（Store 不使用）               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                                                | 仕様参照先                                                                     |
| ------------------ | ------------------------------------------------------- | ------------------------------------------------------------------------------ |
| セキュリティ       | ✅ 適用（IPC経由のファイル操作設計）                    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`   |
| UI/UX              | ✅ 適用（Tailwind CSSクラス・レイアウト設計）           | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`     |
| アーキテクチャ     | ✅ 適用（Organism → Molecule のコンポーネント階層設計） | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`   |
| API設計            | ✅ 適用（readFile / writeFile IPC呼び出しパターン設計） | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`           |
| データ整合性       | ❌ 非適用（DB操作なし）                                 | -                                                                              |
| エラーハンドリング | ✅ 適用（インラインエラー・トースト通知の設計）         | `.claude/skills/aiworkflow-requirements/references/error-handling.md`          |
| パフォーマンス     | ✅ 適用（非同期IPC呼び出し・ローディング状態設計）      | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`   |
| アクセシビリティ   | ✅ 適用（ARIA属性・キーボード操作設計）                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断                                             | 仕様参照先                                                                        |
| -------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------- |
| フロントエンド（Renderer） | ✅ 適用（コンポーネント詳細設計・状態管理・CSS）     | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           |
| バックエンド（Main）       | ❌ 非適用（TASK-9A-B の責務）                        | -                                                                                 |
| IPC通信                    | ✅ 適用（readFile / writeFile 呼び出しパターン設計） | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` |
| Preload/セキュリティ       | ✅ 適用（contextBridge 経由の API 利用設計）         | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`      |
| ローカルストレージ         | ❌ 非適用（ファイル操作は Main Process 側）          | -                                                                                 |

## 成果物

| 成果物                 | パス                                          | 説明                                        |
| ---------------------- | --------------------------------------------- | ------------------------------------------- |
| コンポーネント詳細設計 | `outputs/phase-2/component-detail-design.md`  | SkillEditor / SkillCodeEditor の詳細設計    |
| IPC 通信パターン設計   | `outputs/phase-2/ipc-communication-design.md` | readFile / writeFile の呼び出しパターン設計 |
| ユーティリティ関数設計 | `outputs/phase-2/utility-functions-design.md` | buildFileTree / getLanguage の詳細設計      |
| エラーハンドリング設計 | `outputs/phase-2/error-handling-design.md`    | エラーシナリオ分類と UI 表示方法設計        |
| テスト戦略設計         | `outputs/phase-2/test-strategy-design.md`     | テストケース一覧と環境設計                  |

## 完了条件

- [ ] Task 1: SkillEditor / SkillCodeEditor の Props インターフェース・内部状態・レイアウト・CSS クラスが具体的に設計されている
- [ ] Task 1: FileTreeSidebar / EditorToolbar のインライン実装設計が完了している
- [ ] Task 2: readFile / writeFile の IPC 呼び出しパターン（try/catch、状態更新順序）が設計されている
- [ ] Task 2: IPC チャンネル定義とセキュリティ要件が確認されている
- [ ] Task 3: buildFileTree 関数の入出力型・フィルタリングロジック・カテゴリ順序が設計されている
- [ ] Task 3: getLanguage 関数の拡張子マッピングとフォールバック値が設計されている
- [ ] Task 4: エラーシナリオ一覧と UI 表示方法（インライン/トースト）が設計されている
- [ ] Task 5: テスト環境（happy-dom、fireEvent 使用）とテストケース一覧が設計されている
- [ ] 全タスクの成果物ファイルが `outputs/phase-2/` に作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Task 1: コンポーネント詳細設計
3. Task 2: IPC 通信パターン設計
4. Task 3: ユーティリティ関数設計
5. Task 4: エラーハンドリング設計
6. Task 5: テスト戦略設計
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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-9A-C-skill-editor-ui --phase 2
```

## 次のPhase

Phase 3（設計レビュー）: 要件・設計の妥当性を多角的に検証する。
