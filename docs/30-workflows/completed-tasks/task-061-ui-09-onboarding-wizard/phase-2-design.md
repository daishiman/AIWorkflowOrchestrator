# Phase 2: Design

## メタ情報

| 項目         | 内容       |
| ------------ | ---------- |
| Phase        | 2          |
| Phase名      | 設計       |
| ステータス   | completed  |
| 作成日       | 2026-03-13 |
| 担当SubAgent | SubAgent-B |

## 目的

要件を current Electron renderer 構造へ落とし込み、routing を増やさずに onboarding を導入できる設計を確定する。

## 実行タスク

- overlay 配置設計: `App.tsx` の shell overlay として wizard を配置する
- コンポーネント設計: `OnboardingWizard` 内で step、theme preview、completion を閉じる
- 状態設計: local UI state と persisted store key の境界を固定する
- 再表示導線設計: `SettingsView` の header action と App local state の役割を分離する

## 参照資料

| 参照資料            | パス                                                 | 用途                       |
| ------------------- | ---------------------------------------------------- | -------------------------- |
| Phase 1 要件        | `outputs/phase-1/requirements-definition.md`         | FR/NFR の入力              |
| アーキテクチャ設計  | `outputs/phase-2/architecture-design.md`             | overlay 統合方針           |
| コンポーネント設計  | `outputs/phase-2/component-design.md`                | step 責務分解              |
| 状態管理 / IPC 設計 | `outputs/phase-2/state-ipc-design.md`                | 保存キーと fallback        |
| aiworkflow 抽出表   | `outputs/phase-2/aiworkflow-requirements-extract.md` | UI/状態管理/Apple HIG 条件 |

## 統合テスト連携

| 観点         | 後続Phase      | 連携内容                                           |
| ------------ | -------------- | -------------------------------------------------- |
| overlay 統合 | Phase 4, 5     | `App.onboarding.test.tsx` の表示条件へ接続する     |
| step 遷移    | Phase 4, 6     | `OnboardingWizard.test.tsx` の step 遷移へ接続する |
| Theme 適用   | Phase 5, 9, 11 | `setThemeMode()` と preview screenshot へ接続する  |

## 成果物

- `outputs/phase-2/architecture-design.md`
- `outputs/phase-2/component-design.md`
- `outputs/phase-2/state-ipc-design.md`
- `outputs/phase-2/aiworkflow-requirements-extract.md`

## 完了条件

- [x] `ViewType` を増やさない設計が固定されている
- [x] persisted key と local state の責務境界が書面化されている
- [x] Settings 再表示が persisted reset ではなく force-open であると明記されている
