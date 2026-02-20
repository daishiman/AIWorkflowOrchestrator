# Phase 5: 実装（TDD: Green）— SkillEditor コンポーネント実装

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| タスク ID  | TASK-9A-C                              |
| Phase      | 5（実装）                              |
| 前提 Phase | Phase 4（テスト作成）                  |
| 後続 Phase | Phase 6（テスト拡充）                  |
| ステータス | 未着手                                 |
| 作成日     | 2026-02-19                             |
| 機能名     | SkillEditor コンポーネント             |
| 依存タスク | TASK-9A-B（ファイル編集 IPC ハンドラ） |

## 目的

Phase 4 で作成した全テストを通すための最小限の実装を行う（TDD Green 状態）。Phase 2 の設計に従い、SkillEditor / SkillCodeEditor コンポーネントと buildFileTree / getLanguage ユーティリティ関数を実装する。

## ⚠️ 既知の Pitfall 注意事項

| Pitfall | 内容                       | 対策                                     |
| ------- | -------------------------- | ---------------------------------------- |
| P5      | リスナー二重登録           | useEffect の return でリスナーを解除する |
| P31     | Zustand Hook 無限ループ    | useState のみ使用（Zustand 不使用）      |
| P39     | happy-dom userEvent 非互換 | fireEvent ベースのテスト設計             |

## 実行タスク

### Task 1: getLanguage ユーティリティ関数の実装

**目的**: ファイル拡張子から言語識別子を推定する関数を実装する。

**出力ファイル**: `apps/desktop/src/renderer/components/skill/SkillEditor.tsx` 内にエクスポート

**実装コード**:

```typescript
// ========================================
// getLanguage ユーティリティ
// ========================================

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

**テスト通過確認**:

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/getLanguage.test.ts
```

### Task 2: buildFileTree ユーティリティ関数の実装

**目的**: ImportedSkill のサブリソースからカテゴリ別ファイルツリー構造を構築する関数を実装する。

**出力ファイル**: `apps/desktop/src/renderer/components/skill/SkillEditor.tsx` 内にエクスポート

**実装コード**:

```typescript
import type { ImportedSkill, SkillSubResource } from "@repo/shared";

// ========================================
// buildFileTree ユーティリティ
// ========================================

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
        relativePath: f.filename,
        size: f.size,
      })),
    },
  ];

  return categories.filter((cat) => cat.files.length > 0);
}
```

**テスト通過確認**:

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/buildFileTree.test.ts
```

### Task 3: SkillCodeEditor コンポーネントの実装

**目的**: テキストエリアベースのコードエディターを実装する。Phase 2 設計の Props インターフェースに準拠する。

**出力ファイル**: `apps/desktop/src/renderer/components/skill/SkillCodeEditor.tsx`

**Props インターフェース（Phase 2 設計準拠）**:

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

**実装コード**:

```typescript
// apps/desktop/src/renderer/components/skill/SkillCodeEditor.tsx

import React from "react";

export interface SkillCodeEditorProps {
  /** エディターに表示するテキスト内容 */
  value: string;
  /** テキスト変更時のコールバック */
  onChange: (value: string) => void;
  /** ファイルの言語（将来のシンタックスハイライト用） */
  language: string;
  /** 読み取り専用モード */
  isReadOnly?: boolean;
}

export const SkillCodeEditor: React.FC<SkillCodeEditorProps> = ({
  value,
  onChange,
  language,
  isReadOnly = false,
}) => {
  // Tab キーで2スペース挿入
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue =
        value.substring(0, start) + "  " + value.substring(end);
      onChange(newValue);
      // 次の描画後にカーソル位置を復元
      requestAnimationFrame(() => {
        textarea.selectionStart = start + 2;
        textarea.selectionEnd = start + 2;
      });
    }
  };

  return (
    <textarea
      className="w-full h-full p-4 font-mono text-sm resize-none
        bg-white text-[#1D1D1F]
        focus:outline-none"
      style={{
        fontFamily:
          "JetBrains Mono, Source Code Pro, Noto Sans Mono, monospace",
      }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      readOnly={isReadOnly}
      role="textbox"
      aria-label="コードエディター"
      aria-multiline="true"
      spellCheck={false}
      data-language={language}
    />
  );
};
```

**テスト通過確認**:

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillCodeEditor.test.tsx
```

### Task 4: SkillEditor コンポーネントの実装

**目的**: ファイルツリーサイドバー + エディタメインエリア + ツールバーを持つ SkillEditor を実装する。Phase 2 設計の Props と内部状態に準拠する。

**出力ファイル**: `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`

**Props インターフェース（Phase 2 設計準拠）**:

```typescript
import type { ImportedSkill } from "@repo/shared";

export interface SkillEditorProps {
  /** 編集対象のインポート済みスキル */
  skill: ImportedSkill;
  /** エディター閉じるコールバック */
  onClose: () => void;
}
```

**内部状態（Phase 2 設計準拠）**:

| 状態名       | 型               | 初期値  | 説明                             |
| ------------ | ---------------- | ------- | -------------------------------- |
| selectedFile | `string \| null` | `null`  | 選択中ファイルの relativePath    |
| content      | `string`         | `""`    | エディターに表示中のファイル内容 |
| isLoading    | `boolean`        | `false` | ファイル読み込み中フラグ         |
| isSaving     | `boolean`        | `false` | ファイル保存中フラグ             |
| hasChanges   | `boolean`        | `false` | 未保存の変更フラグ               |
| error        | `string \| null` | `null`  | エラーメッセージ                 |

**実装の構成要素**:

1. **ファイルツリーサイドバー**（インライン実装）
   - `buildFileTree(skill)` でカテゴリ別ファイル一覧を生成
   - カテゴリヘッダーをクリックで展開/折畳
   - ファイル名をクリックで `handleSelectFile` を呼び出し
   - 選択中ファイルはハイライト表示（`bg-blue-50 text-blue-700`）

2. **エディタツールバー**（インライン実装）
   - ファイル名 + 「（未保存）」ラベル表示
   - 保存ボタン（`hasChanges && !isSaving` のとき有効）
   - 閉じるボタン（常時有効）

3. **SkillCodeEditor 統合**
   - `value={content}` で内容表示
   - `onChange` で `content` と `hasChanges` を更新
   - `language={getLanguage(selectedFile)}` で言語を自動推定

4. **IPC 連携**
   - ファイル選択時: `window.electronAPI.skill.readFile(skill.name, relativePath)`
   - 保存時: `window.electronAPI.skill.writeFile(skill.name, selectedFile, content)`

5. **キーボードショートカット**（`useEffect` でグローバルリスナー登録）
   - `Cmd+S` / `Ctrl+S`: `handleSave()`
   - `Escape`: `onClose()`
   - クリーンアップ: `useEffect` の return で `removeEventListener`（P5 対策）

**実装コード**（SkillEditor.tsx の全体構成）:

```typescript
// apps/desktop/src/renderer/components/skill/SkillEditor.tsx

import React, { useState, useCallback, useEffect, useMemo } from "react";
import type { ImportedSkill, SkillSubResource } from "@repo/shared";
import { SkillCodeEditor } from "./SkillCodeEditor";

// ========================================
// getLanguage ユーティリティ（Task 1）
// ========================================
// ...（Task 1 のコードをここに配置）

// ========================================
// buildFileTree ユーティリティ（Task 2）
// ========================================
// ...（Task 2 のコードをここに配置）

// ========================================
// SkillEditor コンポーネント
// ========================================

export interface SkillEditorProps {
  skill: ImportedSkill;
  onClose: () => void;
}

export const SkillEditor: React.FC<SkillEditorProps> = ({
  skill,
  onClose,
}) => {
  // --- 内部状態 ---
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );

  // --- ファイルツリー生成 ---
  const fileTree = useMemo(() => buildFileTree(skill), [skill]);

  // --- ファイル選択ハンドラ ---
  const handleSelectFile = useCallback(
    async (relativePath: string) => {
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
    },
    [skill.name],
  );

  // --- 保存ハンドラ ---
  const handleSave = useCallback(async () => {
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
        err instanceof Error
          ? err.message
          : "ファイルの保存に失敗しました";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }, [skill.name, selectedFile, content, hasChanges, isSaving]);

  // --- テキスト変更ハンドラ ---
  const handleContentChange = useCallback((newValue: string) => {
    setContent(newValue);
    setHasChanges(true);
  }, []);

  // --- カテゴリ展開/折畳 ---
  const toggleCategory = useCallback((categoryKey: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryKey)) {
        next.delete(categoryKey);
      } else {
        next.add(categoryKey);
      }
      return next;
    });
  }, []);

  // --- キーボードショートカット（P5: クリーンアップ必須） ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave, onClose]);

  // --- レンダリング ---
  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {/* ツールバー */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#D2D2D7] bg-[#F5F5F7]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#1D1D1F]">
            {selectedFile ?? skill.name}
          </span>
          {hasChanges && (
            <span className="text-xs text-[#FF9500]">（未保存）</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="px-3 py-1 text-sm rounded-lg bg-[#007AFF] text-white
                       disabled:opacity-50 disabled:cursor-not-allowed
                       hover:bg-[#0066CC] transition-colors duration-200"
            aria-label="保存"
          >
            {isSaving ? "保存中..." : "保存"}
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm text-[#86868B] rounded-lg
                       hover:bg-[#E8E8ED] transition-colors duration-200"
            aria-label="閉じる"
          >
            ✕ 閉じる
          </button>
        </div>
      </div>

      {/* エラー表示（保存エラー） */}
      {error && selectedFile && !isLoading && (
        <div
          className="px-4 py-2 bg-red-50 text-[#FF3B30] text-sm border-b border-red-100"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* メインコンテンツ: 2カラム */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左カラム: ファイルツリー */}
        <nav
          className="w-64 border-r border-[#D2D2D7] overflow-y-auto bg-[#F5F5F7]"
          aria-label="ファイルツリー"
        >
          {fileTree.map((category) => {
            const isExpanded = expandedCategories.has(category.key);
            return (
              <div key={category.key}>
                <button
                  onClick={() => toggleCategory(category.key)}
                  className="w-full text-left px-3 py-2 text-xs font-semibold
                             text-[#86868B] uppercase tracking-wide
                             hover:bg-[#E8E8ED] transition-colors duration-100"
                  aria-expanded={isExpanded}
                >
                  <span className="mr-1">{isExpanded ? "▼" : "▶"}</span>
                  {category.label}
                </button>
                {isExpanded &&
                  category.files.map((file) => (
                    <button
                      key={file.relativePath}
                      onClick={() => handleSelectFile(file.relativePath)}
                      className={`w-full text-left px-6 py-1.5 text-sm
                        transition-colors duration-100
                        ${
                          selectedFile === file.relativePath
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-[#1D1D1F] hover:bg-[#E8E8ED]"
                        }`}
                      aria-selected={selectedFile === file.relativePath}
                    >
                      {file.filename}
                    </button>
                  ))}
              </div>
            );
          })}
        </nav>

        {/* 右カラム: エディタ */}
        <main className="flex-1 overflow-hidden" aria-label="ファイルエディタ">
          {!selectedFile && (
            <div className="flex items-center justify-center h-full text-[#86868B] text-sm">
              ファイルを選択してください
            </div>
          )}
          {selectedFile && isLoading && (
            <div className="flex items-center justify-center h-full text-[#86868B] text-sm">
              読み込み中...
            </div>
          )}
          {selectedFile && !isLoading && error && (
            <div
              className="flex items-center justify-center h-full text-[#FF3B30] text-sm"
              role="alert"
            >
              {error}
            </div>
          )}
          {selectedFile && !isLoading && !error && (
            <SkillCodeEditor
              value={content}
              onChange={handleContentChange}
              language={getLanguage(selectedFile)}
              isReadOnly={isSaving}
            />
          )}
        </main>
      </div>
    </div>
  );
};
```

**テスト通過確認**:

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillEditor.test.tsx
```

### Task 5: 全テスト Green 確認

**目的**: Phase 4 で作成した全テストが通ることを確認する。

**実行手順**:

```bash
# 全テスト実行（apps/desktop ディレクトリから）
cd apps/desktop && pnpm vitest run \
  src/renderer/components/skill/__tests__/getLanguage.test.ts \
  src/renderer/components/skill/__tests__/buildFileTree.test.ts \
  src/renderer/components/skill/__tests__/SkillCodeEditor.test.tsx \
  src/renderer/components/skill/__tests__/SkillEditor.test.tsx
```

**確認項目**:

- [ ] getLanguage テスト: 13/13 PASS
- [ ] buildFileTree テスト: 7/7 PASS
- [ ] SkillCodeEditor テスト: 6/6 PASS
- [ ] SkillEditor テスト: 13/13 PASS
- [ ] 合計: 39/39 PASS

## 参照資料

| ドキュメント     | パス                                                                                        | 利用目的                         |
| ---------------- | ------------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 2 設計書   | `docs/30-workflows/TASK-9A-C-skill-editor-ui/phase-2-design.md`                             | コンポーネント・関数設計         |
| Phase 4 テスト   | `docs/30-workflows/TASK-9A-C-skill-editor-ui/phase-4-test-creation.md`                      | テスト仕様                       |
| デザインシステム | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                  | カラーパレット・スタイル         |
| 実装パターン     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン集                   |
| IPC セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC 通信パターン                 |
| 型定義ファイル   | `packages/shared/src/types/skill.ts`                                                        | ImportedSkill / SkillSubResource |

### システム仕様（aiworkflow-requirements）

| ドキュメント                     | パス                                                                                        | 利用目的                     |
| -------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------- |
| UIコンポーネント仕様             | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | コンポーネント構成の参照     |
| デザインシステム                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                  | カラーパレット・スタイル参照 |
| 機能コンポーネント仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | 機能コンポーネント設計参照   |
| アーキテクチャ概要               | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | レイヤー構造の参照           |
| 実装パターン                     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターンの参照           |
| 状態管理                         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | 状態管理設計の参照           |
| Agent SDK Skill インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Skill 型定義の参照           |
| セキュリティ API                 | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | Electron セキュリティ設計    |
| IPC セキュリティ                 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC 通信パターンの参照       |
| エラーハンドリング               | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラー処理パターンの参照     |
| テストコンポーネントパターン     | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | テスト設計パターンの参照     |

## 実行手順

### 1. ユーティリティ関数実装

getLanguage 関数を実装し、getLanguage テスト 13 ケースを PASS させる（Task 1）。続いて buildFileTree 関数を実装し、buildFileTree テスト 7 ケースを PASS させる（Task 2）。

### 2. SkillCodeEditor コンポーネント実装

テキストエリアベースのコードエディターを実装し、SkillCodeEditor テスト 6 ケースを PASS させる（Task 3）。

### 3. SkillEditor コンポーネント実装

ファイルツリーサイドバー + エディタメインエリア + ツールバーを持つ SkillEditor を実装し、SkillEditor テスト 13 ケースを PASS させる（Task 4）。

### 4. 全テスト Green 確認

Phase 4 で作成した全テスト 39 ケースが PASS することを確認する（Task 5）。

## 統合テスト連携【必須】

| 実装項目           | 内容                                          | 検証方法                   |
| ------------------ | --------------------------------------------- | -------------------------- |
| IPC readFile       | `window.electronAPI.skill.readFile` 呼び出し  | SE-03, SE-04 テスト        |
| IPC writeFile      | `window.electronAPI.skill.writeFile` 呼び出し | SE-06, SE-12 テスト        |
| エラーハンドリング | IPC エラーを UI エラーメッセージに変換        | SE-08, SE-09 テスト        |
| 状態管理           | useState による selectedFile, hasChanges 管理 | SE-05, SE-10, SE-11 テスト |

## アーキテクチャ層別実装（AIが判断）

| 層               | 実装観点                                             | 実装ファイル配置                                                                    | 仕様参照先                                      |
| ---------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------- |
| Renderer Process | SkillEditor / SkillCodeEditor コンポーネント         | `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`, `SkillCodeEditor.tsx` | `ui-ux-components.md`, `ui-ux-design-system.md` |
| Main Process     | 対象外（本タスクは Renderer のみ）                   | —                                                                                   | —                                               |
| IPC通信          | 対象外（TASK-9A-B で readFile / writeFile 実装済み） | —                                                                                   | `security-electron-ipc.md`                      |
| Preload          | 対象外（TASK-9A-B で実装済み）                       | —                                                                                   | `security-api-electron.md`                      |
| Shared           | 対象外（ImportedSkill 型は既存）                     | —                                                                                   | `interfaces-agent-sdk-skill.md`                 |
| データ層         | 対象外（本タスクはデータ永続化なし）                 | —                                                                                   | —                                               |

## 設計変更記録

Phase 2 設計からの乖離がある場合、以下に記録する:

| 変更箇所         | Phase 2 設計 | 実装での変更 | 変更理由 |
| ---------------- | ------------ | ------------ | -------- |
| （実装時に記録） | —            | —            | —        |

> **注意**: 実装中に Phase 2 設計と異なる判断をした場合は必ず本テーブルに記録すること。

## デザインシステム準拠

| 要素           | 適用スタイル                                     | トークン                       |
| -------------- | ------------------------------------------------ | ------------------------------ |
| 背景色         | `#FFFFFF`（メイン）、`#F5F5F7`（サイド）         | bg-white, bg-[#F5F5F7]         |
| テキスト色     | `#1D1D1F`（プライマリ）、`#86868B`（セカンダリ） | text-[#1D1D1F], text-[#86868B] |
| アクセント色   | `#007AFF`（選択状態、保存ボタン）                | bg-[#007AFF]                   |
| エラー色       | `#FF3B30`                                        | text-[#FF3B30]                 |
| 警告色         | `#FF9500`（未保存インジケーター）                | text-[#FF9500]                 |
| ボーダー色     | `#D2D2D7`                                        | border-[#D2D2D7]               |
| 角丸           | `rounded-xl`（12px）、`rounded-lg`（8px）        | —                              |
| 影             | `0 1px 3px rgba(0,0,0,0.04)`                     | shadow-[...]                   |
| アニメーション | `transition-colors duration-200`                 | —                              |

## 多角的チェック観点

### 一般観点

| 観点               | 適用判断 | 仕様参照先                                                                                |
| ------------------ | -------- | ----------------------------------------------------------------------------------------- |
| Phase 2 設計準拠   | 適用     | `phase-2-design.md` — Props インターフェースと内部状態が設計書と一致しているか            |
| Atomic Design      | 適用     | `ui-ux-components.md` — Organism → Molecule の階層が Atomic Design 原則に合致しているか   |
| Tailwind CSS       | 適用     | `ui-ux-design-system.md` — クラス名がデザインシステムトークンに準拠しているか             |
| IPC セキュリティ   | 適用     | `security-electron-ipc.md` — Renderer から直接ファイルシステムにアクセスしていないか      |
| エラーハンドリング | 適用     | `error-handling.md` — 読込/保存の両エラーケースで UI にエラーメッセージが表示されるか     |
| P5 リスナー管理    | 適用     | `06-known-pitfalls.md` — useEffect の return で keydown リスナーが解除されているか        |
| P31 無限ループ防止 | 適用     | `06-known-pitfalls.md` — Zustand Store を使わず useState のみで状態管理しているか         |
| アクセシビリティ   | 適用     | `ui-ux-design-system.md` — aria-label / aria-expanded / aria-selected / role="alert" 付与 |

### Electron デスクトップアプリ観点

| 層       | 適用判断                                 | 仕様参照先                      |
| -------- | ---------------------------------------- | ------------------------------- |
| Renderer | 適用 — React コンポーネント実装          | `ui-ux-components.md`           |
| Main     | 対象外 — 本タスクは Renderer 層のみ      | —                               |
| IPC      | 適用 — readFile / writeFile 呼び出し検証 | `security-electron-ipc.md`      |
| Preload  | 対象外 — TASK-9A-B で実装済み            | —                               |
| Shared   | 適用 — ImportedSkill 型の使用            | `interfaces-agent-sdk-skill.md` |

## 成果物

| 成果物          | パス                                                             | 説明                 |
| --------------- | ---------------------------------------------------------------- | -------------------- |
| SkillEditor     | `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`     | メインコンポーネント |
| SkillCodeEditor | `apps/desktop/src/renderer/components/skill/SkillCodeEditor.tsx` | コードエディタ       |

## 完了条件

- [ ] getLanguage 関数が実装され、13 テストが PASS している
- [ ] buildFileTree 関数が実装され、7 テストが PASS している
- [ ] SkillCodeEditor が実装され、6 テストが PASS している
- [ ] SkillEditor が実装され、13 テストが PASS している
- [ ] 全 39 テストが Green 状態
- [ ] `pnpm --filter @repo/desktop build` が成功する
- [ ] デザインシステムのカラーパレットに準拠している
- [ ] アクセシビリティ属性（aria-label 等）が付与されている
- [ ] P5 対策: キーボードリスナーのクリーンアップが実装されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## TDD 検証

```bash
# 全テスト実行（apps/desktop ディレクトリから実行）
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/

# 確認項目
# - [ ] テストが成功することを確認（Green 状態）
```

## サブタスク管理

Phase 実行開始時に、以下のサブタスクを作成すること:

1. getLanguage ユーティリティ実装（Task 1）
2. buildFileTree ユーティリティ実装（Task 2）
3. SkillCodeEditor コンポーネント実装（Task 3）
4. SkillEditor コンポーネント実装（Task 4）
5. 全テスト Green 確認（Task 5: 39/39 PASS）
6. ビルド確認（`pnpm --filter @repo/desktop build`）
7. 完了条件の検証

---

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] テストが成功状態（Green）であることを確認
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-9A-C-skill-editor-ui --phase 5
```

---

## 次の Phase

Phase 6: テスト拡充
