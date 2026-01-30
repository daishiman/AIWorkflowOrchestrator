# Phase 12: 実装ガイド

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 12                          |
| 機能名     | TASK-7B-skill-import-dialog |
| 成果物種別 | 実装ガイド                  |
| 作成日     | 2026-01-30                  |
| ステータス | 完了                        |

---

# Part 1: SkillImportDialogってなに？（概念的な説明）

## どんな場面で使うの？

スマートフォンでアプリをインストールするとき、「このアプリはカメラを使います」「連絡先にアクセスします」といった説明が表示されて、「インストール」ボタンを押す画面がありますよね？

**SkillImportDialog**は、まさにそれと同じ役割のものです。

AIWorkflowOrchestratorでは「スキル」と呼ばれる機能拡張パッケージをインポート（取り込み）できます。SkillImportDialogは、スキルをインポートする前に「このスキルにはこんな内容が入っていますよ」とユーザーに見せて、「本当にインポートしますか？」と確認する画面です。

## なぜ必要なの？

アプリストアで何も確認せずにアプリをインストールしたら怖いですよね。同じように、スキルをインポートする前に中身を確認できる仕組みが必要です。

- **安心してインポートできる**: スキルの名前、説明、含まれるファイルなどを事前に確認できる
- **間違いを防げる**: インポートしたくないスキルをうっかり取り込むことを防ぐ「キャンセル」ボタンがある
- **処理中だとわかる**: インポート中は「インポート中...」と表示されて、ボタンが押せなくなるので、二重にインポートしてしまう心配がない

## どんな情報が見えるの？

ダイアログ（ポップアップ画面）を開くと、以下の情報が表示されます：

1. **スキルの名前** — 何というスキルなのか
2. **説明** — このスキルが何をするものなのか
3. **許可ツール** — このスキルが使えるツールの一覧（あれば）
4. **サブリソース** — スキルに含まれるファイルの一覧
   - サブエージェント（agents/）
   - 参照資料（references/）
   - スクリプト（scripts/）
   - アセット（assets/）
   - スキーマ（schemas/）
   - インデックス（indexes/）

空っぽのカテゴリは自動的に非表示になるので、画面がすっきり見えます。

## 操作方法

- **「インポート」ボタン**: スキルの取り込みを開始する
- **「キャンセル」ボタン**: 何もせずに画面を閉じる
- **×ボタン（右上）**: 何もせずに画面を閉じる
- **ESCキー**: キーボードのESCキーを押しても閉じられる

インポートが成功すると、自動的にダイアログが閉じます。失敗した場合はダイアログが開いたままになるので、もう一度試せます。

---

# Part 2: 技術的な詳細

## 1. ファイル構成

```
apps/desktop/src/renderer/components/skill/
  SkillImportDialog.tsx          # メインコンポーネント（276行）
  index.ts                       # バレルエクスポート
  __tests__/
    SkillImportDialog.test.tsx   # テストスイート（31テスト）
```

---

## 2. Props定義

### SkillImportDialogProps

```typescript
export interface SkillImportDialogProps {
  /** 表示するスキルのメタデータ */
  skill: SkillMetadata;
  /** ダイアログの開閉状態 */
  isOpen: boolean;
  /** ダイアログを閉じるコールバック */
  onClose: () => void;
}
```

| Prop      | 型              | 必須 | 説明                                           |
| --------- | --------------- | ---- | ---------------------------------------------- |
| `skill`   | `SkillMetadata` | Yes  | インポート対象スキルのメタデータオブジェクト   |
| `isOpen`  | `boolean`       | Yes  | ダイアログの表示/非表示を制御                  |
| `onClose` | `() => void`    | Yes  | ダイアログを閉じる際に呼ばれるコールバック関数 |

### 依存する外部型

| 型名               | 提供元         | 説明                 |
| ------------------ | -------------- | -------------------- |
| `SkillMetadata`    | `@repo/shared` | スキルメタデータ定義 |
| `SkillSubResource` | `@repo/shared` | サブリソース定義     |

---

## 3. 内部コンポーネント

### Section

ダイアログ内の各セクション（説明、許可ツール、サブリソース等）を統一的にレンダリングする内部コンポーネント。

```tsx
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="mb-4">
    <h3 className="mb-2 text-sm font-medium text-gray-500">{title}</h3>
    <div className="border-l-2 border-gray-200 pl-2">{children}</div>
  </div>
);
```

### ResourceList

`SkillSubResource[]`をリスト形式で表示する内部コンポーネント。各リソースの`filename`と`description`（存在する場合）を描画する。

```tsx
const ResourceList: React.FC<{ resources: SkillSubResource[] }> = ({
  resources,
}) => (
  <ul className="space-y-1">
    {resources.map((resource) => (
      <li
        key={resource.relativePath}
        className="flex items-start gap-2 text-sm"
      >
        <span className="text-gray-400">•</span>
        <div>
          <span className="font-mono text-gray-700">{resource.filename}</span>
          {resource.description && (
            <span className="text-gray-500"> - {resource.description}</span>
          )}
        </div>
      </li>
    ))}
  </ul>
);
```

---

## 4. RESOURCE_SECTIONS パターン

サブリソースセクションの定義を宣言的に管理するための定数配列。各セクションは`SkillMetadata`のフィールドに対応し、`skill[key].length > 0`の場合のみ描画される。

```typescript
const RESOURCE_SECTIONS = [
  { key: "agents", title: "サブエージェント (agents/)" },
  { key: "references", title: "参照資料 (references/)" },
  { key: "scripts", title: "スクリプト (scripts/)" },
  { key: "assets", title: "アセット (assets/)" },
  { key: "schemas", title: "スキーマ (schemas/)" },
  { key: "indexes", title: "インデックス (indexes/)" },
] as const;
```

描画ロジック:

```tsx
{
  RESOURCE_SECTIONS.filter(({ key }) => skill[key].length > 0).map(
    ({ key, title }) => (
      <Section key={key} title={`${title} - ${skill[key].length}件`}>
        <ResourceList resources={skill[key]} />
      </Section>
    ),
  );
}
```

このパターンにより:

- セクションの追加・変更が1箇所で管理可能
- 空セクションの非表示ロジックが自動的に適用
- 6種類のサブリソースを重複コードなしで描画

---

## 5. 状態管理（useAppStore連携）

コンポーネントはZustandストア（`useAppStore`）から以下の状態・アクションを個別セレクターで取得する。

```tsx
// 個別セレクター呼び出しパターン（オブジェクト分割代入ではなく）
const importSkill = useAppStore((state) => state.importSkill);
const isImporting = useAppStore((state) => state.isImporting);
const importingSkillName = useAppStore((state) => state.importingSkillName);
```

| ストア項目           | 型                                     | 用途                           |
| -------------------- | -------------------------------------- | ------------------------------ |
| `importSkill`        | `(skillName: string) => Promise<void>` | スキルインポート実行アクション |
| `isImporting`        | `boolean`                              | インポート処理中フラグ         |
| `importingSkillName` | `string \| null`                       | 現在インポート中のスキル名     |

### 特定スキルのインポート判定

```typescript
const isCurrentlyImporting = isImporting && importingSkillName === skill.name;
```

### インポートフロー

```typescript
const handleImport = useCallback(async () => {
  try {
    await importSkill(skill.name);
    onClose(); // 成功時のみダイアログを閉じる
  } catch {
    // エラー時はダイアログを開いたまま維持
    // skillSliceがskillErrorを設定する
  }
}, [importSkill, skill.name, onClose]);
```

1. ユーザーが「インポート」ボタンをクリック
2. `handleImport` → `importSkill(skill.name)` が呼び出される
3. `isImporting` が `true` になり、ボタンが`disabled`化・テキスト変更
4. 成功時: `onClose()` が呼ばれダイアログが閉じる
5. 失敗時: `catch`ブロックでダイアログを維持（`onClose`を呼ばない）

---

## 6. ESCキーハンドラー

```tsx
const handleKeyDown = useCallback(
  (event: KeyboardEvent) => {
    if (event.key === "Escape" && !isCurrentlyImporting) {
      onClose();
    }
  },
  [onClose, isCurrentlyImporting],
);

useEffect(() => {
  if (isOpen) {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }
}, [isOpen, handleKeyDown]);
```

- `isOpen=true`の場合のみリスナーを登録
- インポート処理中（`isCurrentlyImporting=true`）はESCキーを無視
- クリーンアップでリスナーを確実に解除

---

## 7. フォーカストラップ

```tsx
useEffect(() => {
  if (isOpen && dialogRef.current) {
    const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement?.focus(); // ダイアログ開時に最初の要素にフォーカス

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    dialogRef.current.addEventListener("keydown", handleTabKey);
    const currentRef = dialogRef.current;
    return () => currentRef.removeEventListener("keydown", handleTabKey);
  }
}, [isOpen]);
```

- `querySelectorAll`でフォーカス可能な要素を検出
- ダイアログ外にフォーカスが逃げないよう、末尾→先頭、先頭→末尾の循環を実装
- `PermissionDialog`/`RestoreDialog`の既存パターンを踏襲

---

## 8. アクセシビリティ

| ARIA属性              | 値                            | 目的                         |
| --------------------- | ----------------------------- | ---------------------------- |
| `role="dialog"`       | ダイアログ本体                | スクリーンリーダーに種類通知 |
| `aria-modal="true"`   | ダイアログ本体                | モーダルであることを明示     |
| `aria-labelledby`     | `"skill-import-dialog-title"` | タイトルとの関連付け         |
| `aria-label="閉じる"` | 閉じるボタン（×）             | ボタンの説明                 |

---

## 9. 使用例

### 基本的な使用方法

```tsx
import { SkillImportDialog } from "@/components/skill";
import { useState } from "react";

function SkillListPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<SkillMetadata | null>(
    null,
  );

  const handleSkillSelect = (skill: SkillMetadata) => {
    setSelectedSkill(skill);
    setIsDialogOpen(true);
  };

  return (
    <>
      {/* スキル一覧 */}
      <SkillList onSelect={handleSkillSelect} />

      {/* インポート確認ダイアログ */}
      {selectedSkill && (
        <SkillImportDialog
          skill={selectedSkill}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
        />
      )}
    </>
  );
}
```

---

## 10. テストガイド

### useAppStoreモックパターン

テストでは`useAppStore`をモックして、ストアの状態とアクションを制御する。

```tsx
import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SkillImportDialog } from "../SkillImportDialog";
import { useAppStore } from "../../../store";

// ストアモック
vi.mock("../../../store", () => ({
  useAppStore: vi.fn(),
}));

const mockImportSkill = vi.fn().mockResolvedValue(undefined);

const mockState = {
  importSkill: mockImportSkill,
  isImporting: false,
  importingSkillName: null,
};

beforeEach(() => {
  vi.mocked(useAppStore).mockImplementation(
    (selector: any) => selector(mockState) as unknown,
  );
});
```

### ローディング状態のテスト

```tsx
it("ローディング中はボタンが無効化される", () => {
  const loadingState = {
    ...mockState,
    isImporting: true,
    importingSkillName: "test-skill",
  };
  vi.mocked(useAppStore).mockImplementation(
    (selector: any) => selector(loadingState) as unknown,
  );

  render(
    <SkillImportDialog skill={mockSkill} isOpen={true} onClose={vi.fn()} />,
  );

  const button = screen.getByRole("button", { name: /インポート/ });
  expect(button).toBeDisabled();
});
```

---

## 11. 注意事項

- `isOpen={false}` の場合、コンポーネントはDOMに描画されない（`return null`）
- フォーカストラップはダイアログが開いている間のみ有効
- インポート処理中（`isCurrentlyImporting=true`）はキャンセルボタン・閉じるボタン・ESCキーすべて無効化
- `skill` propが変更された場合、表示内容は即座に更新される
- テスト環境は`happy-dom`（`jsdom`ではない）— `vitest.config.ts`で設定済み
