# Phase 5: Implementation

## メタ情報

| 項目         | 内容       |
| ------------ | ---------- |
| Phase        | 5          |
| Phase名      | 実装       |
| ステータス   | completed  |
| 作成日       | 2026-03-13 |
| 担当SubAgent | SubAgent-B |

## 目的

Phase 4 で固定したテストを満たす最小差分で onboarding wizard を実装し、保存契約と UI 契約を current shell へ接続する。

## 実行タスク

- wizard 実装: `OnboardingWizard` を新規追加して 4 step と completion を実装する
- App 統合: `App.tsx` に overlay mount、persist load、complete handler を追加する
- Settings 連携: `SettingsView` に再表示 action を追加する
- state 補正: `useDisplayName()` fallback と generic name 判定を修正する

## 参照資料

| 参照資料     | パス                                        | 用途           |
| ------------ | ------------------------------------------- | -------------- |
| 実装計画     | `outputs/phase-5/implementation-plan.md`    | 実装順と境界   |
| 実装サマリー | `outputs/phase-5/implementation-summary.md` | 変更内容の記録 |
| テスト仕様   | `outputs/phase-4/test-specification.md`     | Green の根拠   |

## 統合テスト連携

| 観点            | 対応実装                   | 連携内容                                        |
| --------------- | -------------------------- | ----------------------------------------------- |
| persist load    | `App.tsx`                  | `store.get` の結果で overlay 表示条件を制御する |
| persist save    | `App.tsx`                  | 完了時に 4 キーと theme を保存する              |
| rerun           | `SettingsView` + `App.tsx` | `onOpenOnboarding` で force-open を起動する     |
| greeting update | `store/index.ts`           | `userProfile.name` を fallback へ組み込む       |

## 成果物

- `outputs/phase-5/implementation-plan.md`
- `outputs/phase-5/implementation-summary.md`

## 完了条件

- [x] wizard が App shell 上で動作する
- [x] persisted key が `window.electronAPI.store` へ保存される
- [x] Settings 再表示と Dashboard 表示名反映が実装されている
