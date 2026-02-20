# コンポーネント階層と Props インターフェース要件

## メタ情報

| 項目       | 値                                                |
| ---------- | ------------------------------------------------- |
| タスクID   | TASK-9A-C                                         |
| Phase      | 1 (要件定義)                                      |
| Task       | 3 (コンポーネント階層とPropsインターフェース要件) |
| 作成日     | 2026-02-19                                        |
| 依存タスク | TASK-9A-B（ファイル編集 IPC ハンドラ）            |
| 型定義参照 | `packages/shared/src/types/skill.ts`              |

## 1. コンポーネント階層（Atomic Design）

### 1.1 全体構造図

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

**レイアウト構成**:

```
┌─────────────────────────────────────────────────┐
│                 SkillEditor                      │
├──────────┬──────────────────────────────────────┤
│          │         EditorToolbar                 │
│  File    │  [ファイル名 (未保存)] [保存] [閉じる]│
│  Tree    ├──────────────────────────────────────┤
│  Sidebar │                                      │
│          │         SkillCodeEditor               │
│  agents/ │                                      │
│    ├ a.md│         <textarea>                    │
│  refs/   │                                      │
│    ├ b.md│                                      │
│          │                                      │
└──────────┴──────────────────────────────────────┘
```

### 1.2 各コンポーネントの責務一覧

| コンポーネント名     | Atomic Design 階層 | 責務                                                                | ファイルパス                                                             |
| -------------------- | ------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **SkillEditor**      | Organism           | 全体レイアウト管理、内部状態管理、IPC通信制御、子コンポーネント結合 | `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`             |
| **FileTreeSidebar**  | Molecule           | ファイルツリーの描画、カテゴリ分類表示、ファイル選択イベント発火    | `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`（内部定義） |
| **FileTreeCategory** | Atom               | 単一カテゴリの見出し表示、配下ファイル一覧の表示                    | `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`（内部定義） |
| **FileTreeItem**     | Atom               | 単一ファイル項目の表示、選択状態のハイライト、クリックイベント発火  | `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`（内部定義） |
| **EditorToolbar**    | Molecule           | ファイル名表示、未保存ラベル表示、保存/閉じるボタン配置             | `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`（内部定義） |
| **SkillCodeEditor**  | Molecule           | テキスト編集領域の提供、言語属性の付与、タブキー挿入のハンドリング  | `apps/desktop/src/renderer/components/skill/SkillCodeEditor.tsx`         |

**設計判断**: FileTreeSidebar、FileTreeCategory、FileTreeItem、EditorToolbar は SkillEditor.tsx 内の内部コンポーネントとして定義する。理由は以下の通り:

- これらのコンポーネントは SkillEditor のコンテキスト外で再利用する想定がない
- SkillImportDialog の内部コンポーネント（`Section`、`ResourceList`）と同様のパターン
- ファイル数を最小化し、Feature Cohesion を維持する

SkillCodeEditor のみ独立ファイルとして切り出す。理由は以下の通り:

- タスク仕様書で独立ファイルとして指定されている（`SkillCodeEditor.tsx`）
- 将来的にシンタックスハイライト対応で複雑化する可能性がある
- テスト対象として独立テストが必要

## 2. Props インターフェース定義

### 2.1 SkillEditor (Organism)

```typescript
import type { ImportedSkill } from "@repo/shared";

/**
 * SkillEditor コンポーネントの Props
 *
 * @description インポート済みスキルのサブリソースファイルを
 * 閲覧・編集・保存するエディターコンポーネント。
 * ファイルツリー、ツールバー、コードエディターで構成される。
 */
export interface SkillEditorProps {
  /** 編集対象のインポート済みスキル */
  skill: ImportedSkill;
  /** エディター閉じるコールバック */
  onClose: () => void;
}
```

**Props の取得元**:

- `skill`: 呼び出し元（SkillDetailPanel 等）が agentSlice から取得した `ImportedSkill` を渡す
- `onClose`: 呼び出し元が SkillEditor の表示/非表示を制御するための関数

**ImportedSkill 型の構造**（`packages/shared/src/types/skill.ts` より）:

```typescript
interface ImportedSkill extends SkillMetadata {
  importedAt: Date;
  status: "active" | "disabled";
  content?: string;
}

interface SkillMetadata {
  name: string;
  description: string;
  allowedTools?: string[];
  path: string;
  updatedAt: Date;
  agents: SkillSubResource[];
  references: SkillSubResource[];
  scripts: SkillSubResource[];
  assets: SkillSubResource[];
  schemas: SkillSubResource[];
  indexes: SkillSubResource[];
  otherFiles: SkillOtherFile[];
}
```

### 2.2 FileTreeSidebar (Molecule)

```typescript
import type { SkillSubResource } from "@repo/shared";

/**
 * FileTreeSidebar の Props（内部コンポーネント）
 *
 * @description カテゴリ別に分類されたファイルツリーを表示する。
 * 空のカテゴリは非表示にする。
 */
interface FileTreeSidebarProps {
  /** カテゴリ名をキー、サブリソース配列を値とするファイルツリー */
  tree: Record<string, SkillSubResource[]>;
  /** 現在選択中のファイルの relativePath */
  selectedFile: string | null;
  /** ファイル選択時のコールバック（relativePath を引数に取る） */
  onSelect: (relativePath: string) => void;
}
```

**レンダリング条件**:

- `tree` のエントリのうち、値（`SkillSubResource[]`）の `length > 0` であるカテゴリのみ描画する
- カテゴリの表示順は `buildFileTree` の出力順に従う

### 2.3 FileTreeCategory (Atom)

```typescript
import type { SkillSubResource } from "@repo/shared";

/**
 * FileTreeCategory の Props（内部コンポーネント）
 *
 * @description 単一カテゴリの見出しと配下ファイル一覧を表示する。
 */
interface FileTreeCategoryProps {
  /** カテゴリ名（表示用ラベル。例: "agents/", "references/"） */
  categoryName: string;
  /** カテゴリに属するサブリソース一覧 */
  files: SkillSubResource[];
  /** 現在選択中のファイルの relativePath */
  selectedFile: string | null;
  /** ファイル選択時のコールバック */
  onSelect: (relativePath: string) => void;
}
```

**ARIA 属性要件**:

- `role="treeitem"`
- `aria-expanded="true"`（カテゴリは常に展開状態）

### 2.4 FileTreeItem (Atom)

```typescript
import type { SkillSubResource } from "@repo/shared";

/**
 * FileTreeItem の Props（内部コンポーネント）
 *
 * @description 単一ファイルの項目を表示する。
 * 選択中のファイルはハイライト表示する。
 */
interface FileTreeItemProps {
  /** ファイルのサブリソース情報 */
  file: SkillSubResource;
  /** 選択状態かどうか */
  isSelected: boolean;
  /** クリック時のコールバック */
  onClick: () => void;
}
```

**スタイル要件**:

- 選択中: `bg-blue-50 text-blue-700`（ライトモード）/ `bg-blue-900/20 text-blue-300`（ダークモード）
- 非選択: `hover:bg-gray-100`（ライトモード）/ `hover:bg-gray-800`（ダークモード）

**ARIA 属性要件**:

- `role="treeitem"`
- `aria-selected={isSelected}`

### 2.5 EditorToolbar (Molecule)

```typescript
/**
 * EditorToolbar の Props（内部コンポーネント）
 *
 * @description ファイル名表示、未保存インジケーター、保存/閉じるボタンを配置する。
 */
interface EditorToolbarProps {
  /** 現在選択中のファイル名（表示用） */
  filename: string | null;
  /** 未保存変更があるかどうか */
  hasChanges: boolean;
  /** 保存中かどうか */
  isSaving: boolean;
  /** 保存ボタンクリック時のコールバック */
  onSave: () => void;
  /** 閉じるボタンクリック時のコールバック */
  onClose: () => void;
}
```

**ボタンの状態制御**:

- 保存ボタン: `hasChanges === false` または `isSaving === true` の場合は `disabled`
- 保存ボタン表示テキスト: `isSaving ? "保存中..." : "保存"`
- 未保存ラベル: `hasChanges === true` の場合のみ「(未保存)」を表示

### 2.6 SkillCodeEditor (Molecule)

```typescript
/**
 * SkillCodeEditor コンポーネントの Props
 *
 * @description テキストエリアベースのコードエディター。
 * ファイル拡張子から推定した言語識別子を data 属性として保持する。
 * 将来のシンタックスハイライト拡張のための設計ポイント。
 *
 * @see SkillEditor.tsx - 親コンポーネント
 */
export interface SkillCodeEditorProps {
  /** エディターに表示するテキスト内容 */
  value: string;
  /** テキスト変更時のコールバック */
  onChange: (value: string) => void;
  /** ファイルの言語識別子（シンタックスハイライト用の将来拡張ポイント） */
  language: string;
}
```

**textarea 要素の属性**:

- `spellCheck={false}` -- コードエディターではスペルチェックを無効化
- `data-language={language}` -- 将来のシンタックスハイライト対応用
- `className` -- `font-mono text-sm`（JetBrains Mono, Source Code Pro, Noto Sans Mono, monospace）

**タブキーのハンドリング**:

- `onKeyDown` で `event.key === "Tab"` を検出
- `event.preventDefault()` でデフォルトのフォーカス移動を抑制
- カーソル位置に2スペースを挿入

## 3. 内部状態管理設計

### 3.1 状態一覧テーブル

| 状態名       | 型               | 初期値  | 管理方法   | 説明                                    | 更新トリガー                                    |
| ------------ | ---------------- | ------- | ---------- | --------------------------------------- | ----------------------------------------------- |
| selectedFile | `string \| null` | `null`  | `useState` | 選択中のファイルの `relativePath`       | ファイルツリーでのファイルクリック              |
| content      | `string`         | `""`    | `useState` | エディターに表示中のファイル内容        | IPC readFile のレスポンス、エディター入力       |
| isLoading    | `boolean`        | `false` | `useState` | ファイル読み込み中フラグ                | readFile 呼び出し開始/完了                      |
| isSaving     | `boolean`        | `false` | `useState` | ファイル保存中フラグ                    | writeFile 呼び出し開始/完了                     |
| hasChanges   | `boolean`        | `false` | `useState` | 未保存の変更があるかどうか              | エディター入力時に `true`、保存成功時に `false` |
| error        | `string \| null` | `null`  | `useState` | エラーメッセージ（読み込み/保存失敗時） | IPC エラーレスポンス                            |

### 3.2 状態管理方針

**方針**: 全て `useState` で管理する（Zustand Store を使用しない）

**根拠**:

1. SkillEditor の内部状態はアプリ全体で共有する必要がない一時的な UI 状態
2. `03-state-management.md` の状態配置原則に従い、「コンポーネント固有 UI」は `useState` / `useReducer` で管理する
3. `ImportedSkill` データは呼び出し元から Props で受け取る（agentSlice から取得済み）
4. Zustand Store（agentSlice）にスキルエディター専用の状態を追加すると、スコープが不必要に広がる

**Zustand Store との関係**:

- `agentSlice` の `importedSkills` から対象の `ImportedSkill` を選択する処理は、呼び出し元（SkillDetailPanel 等）の責務
- SkillEditor 内部では `agentSlice` への直接アクセスを行わない
- P31（Zustand Store Hooks無限ループ）のリスクを回避するため、Store 依存を最小化する

### 3.3 状態フロー図

#### ファイル選択フロー

```
[初期状態]
  selectedFile: null
  content: ""
  isLoading: false
  hasChanges: false
  error: null

    │
    ▼ ファイルクリック
    │
    ├─ hasChanges === true ?
    │   ├─ Yes → 確認ダイアログ表示
    │   │         ├─ "破棄" → 続行
    │   │         └─ "キャンセル" → 状態変更なし（処理中断）
    │   └─ No → 続行
    │
    ▼ 続行
    │
  selectedFile = クリックしたファイルの relativePath
  isLoading = true
  error = null
    │
    ▼ IPC: readFile(skill.name, selectedFile)
    │
    ├─ 成功
    │   content = レスポンスのファイル内容
    │   isLoading = false
    │   hasChanges = false
    │
    └─ 失敗
        content = ""
        isLoading = false
        error = サニタイズ済みエラーメッセージ
```

#### ファイル保存フロー

```
[保存ボタンクリック or Cmd+S / Ctrl+S]
    │
    ├─ hasChanges === false → 何もしない
    │
    ▼ hasChanges === true
    │
  isSaving = true
    │
    ▼ IPC: writeFile(skill.name, selectedFile, content)
    │
    ├─ 成功
    │   isSaving = false
    │   hasChanges = false
    │
    └─ 失敗
        isSaving = false
        error = サニタイズ済みエラーメッセージ
```

#### エディター編集フロー

```
[textarea の onChange イベント]
    │
    ▼
  content = 新しいテキスト内容
  hasChanges = true
  error = null（前回のエラーをクリア）
```

## 4. ユーティリティ関数仕様

### 4.1 buildFileTree

**目的**: `ImportedSkill` オブジェクトからカテゴリ別のファイルツリーを構築する。

**シグネチャ**:

```typescript
function buildFileTree(
  skill: ImportedSkill,
): Record<string, SkillSubResource[]>;
```

**入力**: `ImportedSkill` オブジェクト

**出力**: カテゴリ名をキー、`SkillSubResource[]` を値とするオブジェクト。空のカテゴリ（配列の `length === 0`）は出力に含めない。

**カテゴリの表示順と対応プロパティ**:

| 表示順 | カテゴリ表示名 | ImportedSkill のプロパティ | 型                   |
| ------ | -------------- | -------------------------- | -------------------- |
| 1      | `agents/`      | `skill.agents`             | `SkillSubResource[]` |
| 2      | `references/`  | `skill.references`         | `SkillSubResource[]` |
| 3      | `scripts/`     | `skill.scripts`            | `SkillSubResource[]` |
| 4      | `assets/`      | `skill.assets`             | `SkillSubResource[]` |
| 5      | `schemas/`     | `skill.schemas`            | `SkillSubResource[]` |
| 6      | `indexes/`     | `skill.indexes`            | `SkillSubResource[]` |
| 7      | `その他`       | `skill.otherFiles`\*       | 変換が必要（後述）   |

**`otherFiles` の変換ルール**:

`SkillOtherFile` は `SkillSubResource` と型が異なるため、以下のマッピングで変換する:

```typescript
// SkillOtherFile → SkillSubResource 変換
{
  filename: otherFile.filename,
  relativePath: otherFile.filename,  // ディレクトリ直下のファイルなのでファイル名のまま
  description: undefined,
  size: otherFile.size,
}
```

**実装例**:

```typescript
const CATEGORY_ORDER = [
  { key: "agents", label: "agents/" },
  { key: "references", label: "references/" },
  { key: "scripts", label: "scripts/" },
  { key: "assets", label: "assets/" },
  { key: "schemas", label: "schemas/" },
  { key: "indexes", label: "indexes/" },
] as const;

function buildFileTree(
  skill: ImportedSkill,
): Record<string, SkillSubResource[]> {
  const result: Record<string, SkillSubResource[]> = {};

  for (const { key, label } of CATEGORY_ORDER) {
    const resources = skill[key];
    if (resources.length > 0) {
      result[label] = resources;
    }
  }

  // otherFiles の変換と追加
  if (skill.otherFiles.length > 0) {
    result["その他"] = skill.otherFiles.map((f) => ({
      filename: f.filename,
      relativePath: f.filename,
      size: f.size,
    }));
  }

  return result;
}
```

**テスト観点**:

- 全カテゴリにファイルがある場合、7カテゴリが正しい順序で出力されること
- 空のカテゴリが出力に含まれないこと
- `otherFiles` が `SkillSubResource` 形式に正しく変換されること
- 全カテゴリが空の場合、空オブジェクト `{}` が返されること

### 4.2 getLanguage

**目的**: ファイル名の拡張子から言語識別子を推定する。

**シグネチャ**:

```typescript
function getLanguage(filename: string): string;
```

**入力**: ファイル名（`string`）。例: `"SKILL.md"`, `"agent-config.ts"`, `"data.json"`

**出力**: 言語識別子（`string`）

**拡張子と言語識別子のマッピング**:

| 拡張子          | 言語識別子   |
| --------------- | ------------ |
| `.ts`, `.tsx`   | `typescript` |
| `.js`, `.jsx`   | `javascript` |
| `.md`           | `markdown`   |
| `.json`         | `json`       |
| `.yaml`, `.yml` | `yaml`       |
| `.css`          | `css`        |
| `.html`         | `html`       |
| `.sh`           | `shell`      |
| `.py`           | `python`     |
| その他          | `plaintext`  |

**拡張子の抽出ルール**:

- ファイル名の最後の `.` 以降を拡張子として取得する
- `.` が含まれないファイル名の場合は `plaintext` を返す
- 大文字小文字を区別しない（`.MD` も `markdown` にマッチ）

**実装例**:

```typescript
const LANGUAGE_MAP: Record<string, string> = {
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

function getLanguage(filename: string): string {
  const dotIndex = filename.lastIndexOf(".");
  if (dotIndex === -1) return "plaintext";

  const ext = filename.slice(dotIndex).toLowerCase();
  return LANGUAGE_MAP[ext] ?? "plaintext";
}
```

**テスト観点**:

- 全マッピング対象の拡張子が正しい言語識別子を返すこと
- 未知の拡張子が `plaintext` を返すこと
- `.` を含まないファイル名が `plaintext` を返すこと
- 大文字拡張子（`.MD`, `.JSON`）が正しくマッチすること
- 複数のドットを含むファイル名（`config.test.ts`）が最後の拡張子で判定されること

## 5. 型定義依存関係

### 5.1 依存する外部型定義

| 型名               | 定義元                               | 用途                                   |
| ------------------ | ------------------------------------ | -------------------------------------- |
| `ImportedSkill`    | `packages/shared/src/types/skill.ts` | SkillEditor の Props（編集対象スキル） |
| `SkillMetadata`    | `packages/shared/src/types/skill.ts` | ImportedSkill の基底型                 |
| `SkillSubResource` | `packages/shared/src/types/skill.ts` | ファイルツリーの各ファイル項目         |
| `SkillOtherFile`   | `packages/shared/src/types/skill.ts` | 「その他」カテゴリのファイル項目       |

### 5.2 IPC API 依存

| API                                                                | 提供元    | 用途             |
| ------------------------------------------------------------------ | --------- | ---------------- |
| `window.electronAPI.skill.readFile(skillName, filePath)`           | TASK-9A-B | ファイル読み込み |
| `window.electronAPI.skill.writeFile(skillName, filePath, content)` | TASK-9A-B | ファイル保存     |

**注意**: readFile / writeFile はTASK-9A-B で実装予定。本タスク（TASK-9A-C）では Preload 層の `SkillAPI` インターフェースに追加されることを前提とする。

### 5.3 新規定義する型

本タスクで新規に export する型:

| 型名                   | 定義ファイル          | 用途                                   |
| ---------------------- | --------------------- | -------------------------------------- |
| `SkillEditorProps`     | `SkillEditor.tsx`     | SkillEditor コンポーネントの Props     |
| `SkillCodeEditorProps` | `SkillCodeEditor.tsx` | SkillCodeEditor コンポーネントの Props |

内部コンポーネントの Props 型（`FileTreeSidebarProps`、`FileTreeCategoryProps`、`FileTreeItemProps`、`EditorToolbarProps`）は export しない（SkillEditor.tsx 内部でのみ使用）。

### 5.4 SkillImportDialog との設計パターン整合性

既存の `SkillImportDialog` コンポーネントとの整合性を確認した結果:

| 設計要素           | SkillImportDialog                           | SkillEditor（本タスク）                                                            |
| ------------------ | ------------------------------------------- | ---------------------------------------------------------------------------------- |
| Props 型定義       | `SkillImportDialogProps`（export）          | `SkillEditorProps`（export）                                                       |
| 内部コンポーネント | `Section`, `ResourceList`（非export）       | `FileTreeSidebar`, `FileTreeCategory`, `FileTreeItem`, `EditorToolbar`（非export） |
| Atomic Design 階層 | Organism                                    | Organism                                                                           |
| Store 依存         | `useAppStore`（importSkill アクション呼出） | なし（Props 経由で ImportedSkill を受け取る）                                      |
| カテゴリ表示順     | `RESOURCE_SECTIONS` 定数配列                | `CATEGORY_ORDER` 定数配列                                                          |
| 空カテゴリ処理     | `resources.length > 0` でフィルタ           | `buildFileTree` 内でフィルタ                                                       |
