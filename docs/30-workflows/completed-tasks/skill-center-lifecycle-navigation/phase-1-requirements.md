# Phase 1: 要件定義

## TASK-SKILL-CENTER-LIFECYCLE-NAV-001

---

## 1. タスク分類

**タスク種別: UI task**

- Renderer 層（React コンポーネント）の変更を含む
- IPC 変更なし
- Phase 11 でスクリーンショット取得が必要

---

## 2. 真の論点（要件レビュー思考法）

### 主問題（1文）

`SkillCenterView` から `SkillManagementPanel` に到達する main-shell 導線が存在しないため、実装済みの `SkillLifecyclePanel`（会話型スキル作成・外部API設定・Layer3/4検証）を含む高度な管理面がユーザーに届いていない。

### why now

PR #1863/#1869/#1871/#1872 が既に実装済みで、機能は完成しているが main-shell に接続されていない。

### why this way

- `skillCreate` は canonical な主導線なので維持する必要がある
- `skillManagement` は既存の高度機能を main-shell から見えるようにする副導線であり、最小の追加で最大の到達性を得られる
- `SkillLifecyclePanel` を top-level に昇格させるより、`SkillManagementPanel` に内包したまま公開する方が責務境界が明確で、重複も少ない

---

## 3. スコープ

### 含む

- `ViewType` への `"skillManagement"` 追加（TASK-A）
- `App.tsx` の `renderView()` switch への `"skillManagement"` case 追加（TASK-A）
- `SkillManagementPanel` の `onClose` / 戻る導線整備（TASK-A）
- `SkillCenterView` から `SkillManagementPanel` への導線追加（TASK-B）
- `SkillCenterView` の既存 `skillCreate` CTA を維持し、回帰防止テストを追加（TASK-B）
- 関連する Unit Test の追加・修正

### 含まない

- `SkillLifecyclePanel` の内部実装変更
- `SkillCreateWizard` の削除
- `skillLifecycle` の top-level ViewType 追加
- IPC チャンネルの変更
- Phase 13（PR作成）はユーザー明示承認後のみ

---

## 4. 受入条件

| ID    | 条件                                                                                            | 検証方法              |
| ----- | ----------------------------------------------------------------------------------------------- | --------------------- |
| AC-01 | サイドバー「スキルセンター」(⌘+5) で `SkillCenterView` が開く（既存動作保持）                   | 手動確認              |
| AC-02 | `SkillCenterView` の主 CTA「作成を始める」は `skillCreate` を維持し、`SkillCreateWizard` が開く | 手動確認              |
| AC-03 | `SkillCenterView` に「スキル管理」ボタンが追加され、クリックで `SkillManagementPanel` が開く    | 手動確認              |
| AC-04 | `SkillManagementPanel` の `onClose` / 戻るボタンで `SkillCenterView` に戻る                     | 手動確認              |
| AC-05 | `ViewType` に `"skillManagement"` が追加され、`skillCreate` は既存のまま維持されている          | TypeScript 型チェック |
| AC-06 | `SkillManagementPanel` 内部の `lifecycle` / `create` 切替は既存テストで保証されている           | 自動テスト            |
| AC-07 | 既存の `/advanced/skill-create-wizard` URL で `SkillCreateWizard` が引き続き動作する            | 自動テスト            |
| AC-08 | 新規追加した遷移の Unit Test が全 PASS                                                          | `pnpm vitest run`     |

---

## 5. 既存コードの命名規則

| 対象                      | 規則                   | 例                                                    |
| ------------------------- | ---------------------- | ----------------------------------------------------- |
| ViewType 値               | camelCase              | `"skillCenter"`, `"skillCreate"`, `"skillManagement"` |
| ViewType の navigate 関数 | `navigateTo{ViewName}` | `navigateToSkillCreate`, `navigateToSkillManagement`  |
| App.tsx case 文           | ViewType 値と同じ      | `case "skillCenter":`                                 |
| コンポーネント props      | camelCase              | `onClose`, `onOpenWizard`                             |
| testid                    | kebab-case             | `header-create-cta`, `header-management-cta`          |

---

## 6. 変更対象ファイル一覧

### 新規作成

なし

### 修正対象

| ファイル                                                                  | 変更内容                                                            |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `apps/desktop/src/renderer/store/types.ts`                                | ViewType に `"skillManagement"` を追加                              |
| `apps/desktop/src/renderer/App.tsx`                                       | renderView() switch に `skillManagement` case 追加、dock 正規化追加 |
| `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts` | `navigateToSkillManagement` 関数を追加                              |
| `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`               | 「スキル管理」ボタン追加、`skillCreate` CTA を維持                  |
| `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`     | `onClose` / 戻るボタン追加                                          |

---

## 7. 依存関係

| 依存先                            | 説明                                                                       |
| --------------------------------- | -------------------------------------------------------------------------- |
| `SkillCreateWizard` (実装済み)    | `skillCreate` の主導線。`/advanced/skill-create-wizard` で残存             |
| `SkillLifecyclePanel` (実装済み)  | `SkillManagementPanel` の内部サブビューとして使用                          |
| `SkillManagementPanel` (実装済み) | `skillManagement` の遷移先。`onClose` と内部 `lifecycle/create` 切替を保持 |
| Zustand `setCurrentView`          | 既存の View 切り替え機構を使用                                             |

---

## 8. 強化ループと依存因果

```
[強化ループ]
SkillManagementPanel利用増加
  → ユーザーが既存の管理・作成・会話フローを再発見
  → SkillCreateWizard の主導線は維持される
  → 高度機能への到達性だけが改善する

[バランスループ]
skillCreate を secondary に落とさず維持
  → skillManagement は補助導線として追加
  → 既存の主導線と副導線が両立する
```

---

## Phase 1 完了確認

- [x] スコープ定義完了
- [x] 受入条件定義完了
- [x] 変更対象ファイル特定完了
- [x] 命名規則記録完了
- [x] 依存関係整理完了
- [x] タスク種別（UI task）記録完了
