# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目           | 値                                                                                   |
| -------------- | ------------------------------------------------------------------------------------ |
| タスク ID      | TASK-10A-A                                                                           |
| タスク名       | SkillManagementPanel 実装                                                            |
| Phase          | 5                                                                                    |
| 作成日         | 2026-03-02                                                                           |
| 前 Phase       | Phase 4（テスト作成）                                                                |
| 次 Phase       | Phase 6（テスト拡充）                                                                |
| 対象ファイル   | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`                |
| テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx` |
| 状態           | 未着手                                                                               |

## 目的

TDD の Green フェーズとして、Phase 4 で作成した 23 件のテストを全て PASS させる最小限の実装を行う。

---

## 実行タスク

以下のタスクを順番に実行する。

---

### タスク 1: 型定義とインポートの追加

**目的**: コンポーネントに必要な型定義と依存モジュールの import を宣言する

**実行手順**:

1. `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx` を作成する
2. 以下の import を記述する:

```typescript
import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { ImportedSkill } from "@repo/shared";
import {
  useImportedSkills,
  useIsLoadingSkills,
  useFetchSkills,
  useRemoveSkill,
} from "../../store";
import { SkillEditor } from "./SkillEditor";
```

3. ビュー切り替え用のユニオン型を定義する:

```typescript
type View = "list" | "editor" | "analysis" | "create";
```

**注意事項**:

- `SkillAnalysisView` と `SkillCreateWizard` は別タスクで実装される可能性がある。存在しない場合はプレースホルダコンポーネント（`<div>分析ビュー（準備中）</div>` / `<div>新規スキル作成（準備中）</div>`）を表示する
- import パスは `../../store` を使用する（相対パス）。パスエイリアス `@/renderer/store` でも可

---

### タスク 2: SkillCard サブコンポーネントの実装

**目的**: スキル 1 件分の表示カードを実装する

**実行手順**:

1. `SkillManagementPanel.tsx` 内に SkillCard コンポーネントを定義する（50 行以下であればファイル内定義で可。Phase 8 で分離判定する）
2. Props インターフェースを以下のとおり定義する:

```typescript
interface SkillCardProps {
  skill: ImportedSkill;
  onEdit: () => void;
  onAnalyze: () => void;
  onRemove: () => void;
}
```

3. 以下の要素を含むカードを実装する:
   - スキル名（`skill.name`）— テキスト表示
   - スキル説明（`skill.description`）— テキスト表示。未設定の場合は非表示
   - 「編集」ボタン — `onClick` で `onEdit` を呼び出す。`aria-label` に `${skill.name} を編集` を設定する
   - 「分析」ボタン — `onClick` で `onAnalyze` を呼び出す。`aria-label` に `${skill.name} を分析` を設定する
   - 「削除」ボタン — `onClick` で `onRemove` を呼び出す。`aria-label` に `${skill.name} を削除` を設定する

4. スタイリング:
   - カード全体: `bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg p-4`
   - スキル名: `text-[var(--text-primary)] font-medium`
   - スキル説明: `text-[var(--text-secondary)] text-sm mt-1`
   - ボタン群: `flex gap-2 mt-3`
   - 個別ボタン: `px-3 py-1 text-sm rounded-md`
   - 編集ボタン: `bg-[var(--status-primary)] text-[var(--text-inverse)]`
   - 分析ボタン: `border border-[var(--border-primary)] text-[var(--text-primary)]`
   - 削除ボタン: `text-[var(--status-error)] hover:bg-[var(--status-error-subtle)]`

---

### タスク 3: SkillManagementPanel メインコンポーネントの実装

**目的**: ビュー切り替えロジックとスキル一覧表示を実装する

**実行手順**:

1. 以下のローカル状態を定義する:

```typescript
const [currentView, setCurrentView] = useState<View>("list");
const [selectedSkill, setSelectedSkill] = useState<ImportedSkill | null>(null);
const [searchQuery, setSearchQuery] = useState("");
```

2. 以下の Store セレクタを使用する（個別セレクタ — P31 対策）:

```typescript
const importedSkills = useImportedSkills();
const isLoadingSkills = useIsLoadingSkills();
const fetchSkills = useFetchSkills();
const removeSkill = useRemoveSkill();
```

3. マウント時に `fetchSkills()` を 1 回呼び出す:

```typescript
useEffect(() => {
  fetchSkills();
}, [fetchSkills]);
```

4. ビューごとの条件レンダリングを実装する:

```typescript
// currentView === "list": スキル一覧を表示
// currentView === "editor": SkillEditor を表示（selectedSkill を渡す）
// currentView === "analysis": 分析ビューを表示
// currentView === "create": 作成ビューを表示
```

5. 各ビューの閉じる操作で `setCurrentView("list")` と `setSelectedSkill(null)` を呼び出す

---

### タスク 4: 検索フィルタリングロジックの実装

**目的**: 検索クエリによるスキル一覧のフィルタリングを実装する

**実行手順**:

1. `useMemo` でフィルタリング結果をメモ化する:

```typescript
const filteredSkills = useMemo(() => {
  if (searchQuery.trim() === "") {
    return importedSkills;
  }
  const query = searchQuery.toLowerCase();
  return importedSkills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(query) ||
      (skill.description && skill.description.toLowerCase().includes(query)),
  );
}, [importedSkills, searchQuery]);
```

2. 検索入力フィールドの JSX:

```tsx
<input
  type="text"
  placeholder="スキルを検索..."
  aria-label="スキルを検索"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="w-full px-3 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)]"
/>
```

---

### タスク 5: 削除確認ダイアログの実装

**目的**: 削除操作の誤操作防止のための確認ダイアログを実装する

**実行手順**:

1. 削除確認用のローカル状態を追加する:

```typescript
const [skillToDelete, setSkillToDelete] = useState<ImportedSkill | null>(null);
```

2. SkillCard の `onRemove` で `setSkillToDelete(skill)` を呼び出す（即座に削除しない）
3. 確認ダイアログを表示し、以下の 2 つのボタンを配置する:
   - 「削除する」ボタン: `removeSkill(skillToDelete.name)` を呼び出し、`setSkillToDelete(null)` でダイアログを閉じる。P44/P45 対策として `skill.name` を使用する（`skill.id` ではない）
   - 「キャンセル」ボタン: `setSkillToDelete(null)` でダイアログを閉じる

---

### タスク 6: ローディング状態の実装

**目的**: スキル読み込み中の表示を実装する

**実行手順**:

1. `isLoadingSkills === true` の場合、スキル一覧の代わりに「読み込み中...」テキストを表示する:

```tsx
{isLoadingSkills ? (
  <div className="flex items-center justify-center py-8 text-[var(--text-secondary)]">
    読み込み中...
  </div>
) : (
  // filteredSkills の一覧表示
)}
```

2. ローディング中はスキルカードを表示しない

---

### タスク 7: リストビューの JSX 組み立て

**目的**: リストビュー全体の JSX を組み立てる

**実行手順**:

1. 以下の構造で JSX を記述する:

```tsx
<div className="flex flex-col h-full">
  {/* ヘッダー */}
  <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-primary)]">
    <h2 className="text-lg font-semibold text-[var(--text-primary)]">
      スキル管理
    </h2>
    <button
      onClick={() => setCurrentView("create")}
      aria-label="新規スキル作成"
      className="px-4 py-2 text-sm rounded-lg bg-[var(--status-primary)] text-[var(--text-inverse)]"
    >
      新規スキル作成
    </button>
  </div>

  {/* 検索バー */}
  <div className="px-4 py-3">{/* タスク 4 の検索入力フィールド */}</div>

  {/* スキル一覧 */}
  <div className="flex-1 overflow-y-auto px-4 pb-4" role="list">
    {/* ローディング or filteredSkills のマッピング */}
    {filteredSkills.map((skill) => (
      <div key={skill.name} role="listitem" className="mb-3">
        <SkillCard
          skill={skill}
          onEdit={() => {
            setSelectedSkill(skill);
            setCurrentView("editor");
          }}
          onAnalyze={() => {
            setSelectedSkill(skill);
            setCurrentView("analysis");
          }}
          onRemove={() => setSkillToDelete(skill)}
        />
      </div>
    ))}
  </div>
</div>
```

2. `role="list"` をスキル一覧コンテナに、`role="listitem"` を各カードラッパーに付与する（TC-023 アクセシビリティ要件）

---

### タスク 8: テスト Green 状態確認

**目的**: Phase 4 で作成した全テストが PASS することを確認する

**実行手順**:

1. Phase 4 のテストファイルのコメントアウトを解除する（`expect(true).toBe(false)` を実際のアサーションに置き換える）
2. 以下のコマンドでテストを実行する:

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx
```

3. 全 23 件のテストが PASS であることを確認する
4. テスト実行結果を `outputs/phase-5/test-green-result.md` に記録する

**記録フォーマット**:

```markdown
# Phase 5 テスト Green 状態確認

- テスト件数: 23
- PASS: 23
- FAIL: 0
- 実行日時: YYYY-MM-DD HH:mm:ss（実行時に記録）
```

---

## 参照資料

| 参照資料               | パス                                                                                        | 内容                             |
| ---------------------- | ------------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 4 テスト作成     | `phase-4-test-creation.md`                                                                  | Redテスト観点の実装反映          |
| UI コンポーネント仕様  | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | スキル管理 UI 仕様               |
| UI 機能仕様            | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | Skill関連導線の責務境界確認      |
| UI デザイン原則        | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              | Apple HIG カラーパレット         |
| スキルインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | ImportedSkill, SkillMetadata 型  |
| IPC API契約            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | skill操作APIの実装整合           |
| IPCセキュリティ        | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | sender/入力検証ポリシー確認      |
| 状態管理               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Zustand 個別セレクタ設計         |
| テスト方針             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | カバレッジ基準                   |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | fireEvent 使い分けパターン       |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                                        | P9, P31, P39, P40, P44, P45, P47 |
| SkillEditor 既存実装   | `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`                                | エディタビューの参照             |
| SkillSelector 既存実装 | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`                              | Store セレクタ使用パターンの参照 |
| SkillCenterView        | `apps/desktop/src/renderer/views/SkillCenterView/`                                          | SkillCard スタイルパターン参照   |

---

## 統合テスト連携

- 仕様契約確認: `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` と `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md` を参照し、一覧/検索/編集/分析/削除/新規作成の入力・戻り値契約を一致させる。
- セキュリティ観点: `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` と `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md` の sender 検証・入力検証方針を適用する。
- テスト接続: Phase 4/6/7 のテスト成果物を Phase 10/11 の判定基準へ接続し、差分が出た場合は Phase 2（設計）または Phase 5（実装）へ戻して再検証する。

## 成果物

| 成果物                    | パス                                                                  | 説明                 |
| ------------------------- | --------------------------------------------------------------------- | -------------------- |
| SkillManagementPanel 実装 | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx` | メインコンポーネント |
| Green 状態確認レポート    | `outputs/phase-5/test-green-result.md`                                | 全テスト PASS の記録 |

---

## 完了条件

- [ ] `SkillManagementPanel.tsx` が作成されている
- [ ] SkillCard サブコンポーネントが実装されている
- [ ] ビュー遷移（list / editor / analysis / create）が動作する
- [ ] 検索フィルタリングが `useMemo` でメモ化されている
- [ ] 削除確認ダイアログが実装されている
- [ ] ローディング状態（`isLoadingSkills`）の表示切り替えが実装されている
- [ ] Store 個別セレクタを使用している（P31 対策）
- [ ] `skill.name` で削除を呼び出している（P44/P45 対策）
- [ ] アクセシビリティ属性（`aria-label`, `role="list"`, `role="listitem"`）が付与されている
- [ ] Phase 4 の全 23 件のテストが PASS（Green 状態）
- [ ] `outputs/phase-5/test-green-result.md` が作成されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## 次の Phase

Phase 6: テスト拡充（`phase-6-test-expansion.md`）
