# Phase 1 成果物: 要件チェックリスト

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| Phase      | 1          |
| 作成日     | 2026-04-06 |
| ステータス | completed  |

---

## 機能要件 (FR)

| ID    | 要件                                                                                                     | 優先度 | AC対応 |
| ----- | -------------------------------------------------------------------------------------------------------- | ------ | ------ |
| FR-01 | `"skillLifecycle"` ViewType を `store/types.ts` に追加する                                               | P0     | AC-1   |
| FR-02 | `App.tsx` の `renderView()` に `case "skillLifecycle"` を追加し `SkillLifecyclePanel` をレンダリングする | P0     | AC-1   |
| FR-03 | `useSkillCenter.ts` に `navigateToSkillLifecycle` 関数を追加する                                         | P0     | AC-1   |
| FR-04 | `SkillCenterView/index.tsx` の create ジョブアクションを `navigateToSkillLifecycle` に変更する           | P0     | AC-1   |
| FR-05 | `skillLifecycleJourney.ts` に一次導線定数 `SKILL_LIFECYCLE_PRIMARY_VIEW` を追加する                      | P0     | AC-4   |
| FR-06 | `normalizeSkillLifecycleView()` が `"skillLifecycle"` を正しく通過させることを確認する                   | P1     | AC-3   |
| FR-07 | `App.tsx` の `case "skillCreate"` を維持し `SkillCreateWizard` への後方互換を保証する                    | P0     | AC-2   |
| FR-08 | `SkillManagementPanel` → `SkillLifecyclePanel` の既存導線を変更しない                                    | P0     | AC-2   |

## 非機能要件 (NFR)

| ID     | 要件                                                         | 優先度 |
| ------ | ------------------------------------------------------------ | ------ |
| NFR-01 | 変更による既存テストの破壊なし (TC-01等は維持)               | P0     |
| NFR-02 | デスクトップ/モバイル両方のナビゲーションで動作する          | P0     |
| NFR-03 | 新規 ViewType は最小限に留める（`"skillLifecycle"` 1件のみ） | P1     |
| NFR-04 | `SkillLifecyclePanel` 内部ロジックは変更しない               | P0     |
| NFR-05 | バックエンド/IPC は変更しない                                | P0     |

---

## AC マッピング詳細

### AC-1: SkillLifecyclePanel が一次導線として直接アクセス可能

- FR-01: ViewType追加
- FR-02: App.tsx renderView case追加
- FR-03: navigateToSkillLifecycle追加
- FR-04: create job mapping変更
- 検証方法: E2Eテスト（SkillCenter → create CTA → SkillLifecyclePanel表示確認）

### AC-2: 既存 SkillCreateWizard への導線維持

- FR-07: skillCreate case維持
- FR-08: SkillManagementPanel変更なし
- navigateToSkillCreate 関数は削除・変更しない
- 検証方法: 既存 TC-04d / TC-01 / TC-CTA-03 が pass すること

### AC-3: normalizeSkillLifecycleView() が新ルーティングを正しく扱う

- FR-06: skillLifecycle は正規化対象外（そのままパスする）
- `normalizeSkillLifecycleView("skillLifecycle") === "skillLifecycle"` を確認
- 検証方法: ユニットテスト（新規追加）

### AC-4: skillLifecycleJourney.ts のナビゲーション定義更新

- FR-05: 一次導線定数追加
- `SKILL_LIFECYCLE_PRIMARY_VIEW = "skillLifecycle"` として定義
- 検証方法: ユニットテスト（新規追加）

### AC-5: モバイル/デスクトップ両方のナビゲーションで動作

- ViewType ベースのレンダリングは AppDock のモード（desktop/mobile）に依存しない
- `dockCurrentView` の変換: `skillLifecycle` → DockViewType外のため `default` ケースになるが、実際のナビゲーションは `setCurrentView` 経由
- 検証方法: 手動テスト（Phase 11）

### AC-6: 既存テストが pass する

- 更新が必要なテスト:
  - `SkillCenterView.cta.test.tsx`: TC-CTA-12 (`skill-lifecycle-cta-create` → `navigateToSkillLifecycle` に変更)
  - `skillLifecycleJourney.test.ts`: normalizeSkillLifecycleView の新ケース追加
- 維持するテスト（変更不要）:
  - `useSkillCenter.navigation.test.ts`: TC-01〜TC-06（navigateToSkillCreate は維持）
  - `SkillCenterView.cta.test.tsx`: TC-CTA-03, TC-04d（header-create-cta は変更なし）

---

## スコープ境界チェックリスト

- [x] 含む: App.tsx のルート定義変更
- [x] 含む: normalizeSkillLifecycleView() の確認・更新
- [x] 含む: skillLifecycleJourney.ts のナビゲーション定義更新
- [x] 含む: SkillManagementPanel.tsx からの既存導線維持（変更なし）
- [x] 含まない: SkillCreateWizard の廃止・機能変更
- [x] 含まない: SkillLifecyclePanel の内部ロジック変更
- [x] 含まない: 新しい UI コンポーネントの作成
- [x] 含まない: バックエンド / IPC の変更
- [x] 含まない: commit、push、PR 作成

---

## 完了確認

- [x] ルート所有者の調査が完了している
- [x] 既存ハンドオフの調査が完了している
- [x] 状態管理者の調査が完了している
- [x] 対象ビューの調査が完了している
- [x] AC-1〜AC-6 と FR/NFR のマッピングが完了している
- [x] 含む / 含まないが明確である
- [x] 本Phase内の全タスクを100%実行完了
