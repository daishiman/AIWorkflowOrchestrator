# TASK-UI-01: LifecyclePanel 一次導線昇格 — 実装ガイド

## 概要

`SkillLifecyclePanel` をスキル作成の一次導線として昇格させた。
SkillCenterView の「作成を始める」CTA からメインナビゲーション経由で直接アクセスできるようになった。

## 変更の背景

会話型インタビューによるスキル作成フロー（SkillLifecyclePanel）は高品質だが、
メインナビゲーションから直結していないため到達性が低かった。
ルーティング層の最小変更（約42行）で到達性を改善した。

## 変更ファイル

| ファイル                                                                  | 変更内容                                                           |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `apps/desktop/src/renderer/store/types.ts`                                | `"skillLifecycle"` ViewType 追加                                   |
| `apps/desktop/src/renderer/App.tsx`                                       | `SkillLifecyclePanel` import・case追加、`dockCurrentView` 変換更新 |
| `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`           | `SKILL_LIFECYCLE_PRIMARY_VIEW` 定数追加、surface責務更新           |
| `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts` | `navigateToSkillLifecycle` 追加                                    |
| `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`               | `journeyActions.create` を `navigateToSkillLifecycle` に変更       |
| `apps/desktop/src/renderer/__tests__/App.renderView.viewtype.test.tsx`    | `skillLifecycle` render / onClose / onOpenWizard 回帰テスト追加    |
| `apps/desktop/src/renderer/__tests__/App.mainline-shell.test.tsx`         | legacy / mobile shell の dock 正規化回帰テスト追加                 |
| `apps/desktop/src/renderer/store/types.test.ts`                           | `ViewType` union の件数・含有確認を更新                            |
| `apps/desktop/scripts/capture-task-ui-01-phase11.mjs`                     | Phase 11 の Playwright スクリーンショット取得スクリプト            |

## 視覚証跡

| ID    | ファイル                                                              | 確認内容                                       |
| ----- | --------------------------------------------------------------------- | ---------------------------------------------- |
| ss-01 | `outputs/phase-11/screenshots/ss-01-skill-center-initial.png`         | SkillCenterView の初期表示                     |
| ss-04 | `outputs/phase-11/screenshots/ss-04-header-create-cta.png`            | SkillCenterView ヘッダーの +新規作成 ボタン    |
| ss-02 | `outputs/phase-11/screenshots/ss-02-skill-lifecycle-panel.png`        | 一次導線から開いた SkillLifecyclePanel         |
| ss-03 | `outputs/phase-11/screenshots/ss-03-app-dock-active-skill-center.png` | skillLifecycle 表示中の AppDock アクティブ状態 |
| meta  | `outputs/phase-11/phase11-capture-metadata.json`                      | capture / unit-test の統合メタデータ           |

## ナビゲーションフロー（変更後）

```
SkillCenterView「作成を始める」
  → navigateToSkillLifecycle()
  → setCurrentView("skillLifecycle")
  → App.tsx case "skillLifecycle" / renderAdvancedSkillCenterView()
  → <SkillLifecyclePanel onClose={() => handleViewChange("skillCenter")} onOpenWizard={() => handleViewChange("skillCreate")} />
```

## 後方互換

```
SkillCenterView「+新規作成」ヘッダーボタン  ← 変更なし
  → navigateToSkillCreate()
  → setCurrentView("skillCreate")
  → <SkillCreateWizard />

SkillManagementPanel → SkillLifecyclePanel  ← 変更なし
```

## テスト結果

- 関連テスト 93 件 PASS
- targeted regression 35 件 PASS (`App.renderView.viewtype` / `App.mainline-shell` / `store/types`)
- TypeScript 型チェック: エラーなし
- ESLint: 警告なし
- 新規テスト: TC-SL-16/17, TC-07/08, TC-CTA-12 更新, TASK-UI-01-E1/E2

## 受入条件

| AC                                     | 結果 |
| -------------------------------------- | ---- |
| AC-1: SkillLifecyclePanel 一次導線化   | PASS |
| AC-2: SkillCreateWizard 後方互換       | PASS |
| AC-3: normalizeSkillLifecycleView 対応 | PASS |
| AC-4: skillLifecycleJourney.ts 更新    | PASS |
| AC-5: モバイル/デスクトップ両対応      | PASS |
| AC-6: 既存テスト pass                  | PASS |

## 後続タスク

- TASK-UI-02: （TASK-UI-01 完了後）
- TASK-UI-03: （TASK-UI-01 完了後）
