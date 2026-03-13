# Branch Diff Reflection Matrix

## ブランチ情報

- 作業ブランチ: `task-061-ui-09-onboarding-wizard-spec`
- ベースライン: 現行ワークツリーの既存 Electron アプリ構成
- 変更種別: 仕様書作成のみ

## 実ブランチ差分の扱い

| 項目         | 現状                   | 仕様書への反映                  |
| ------------ | ---------------------- | ------------------------------- |
| 実装コード   | 未変更                 | 変更予定箇所のみ Phase 5 に明記 |
| テスト       | 未作成                 | Phase 4/6/7/11 で計画化         |
| ドキュメント | 本 workflow で新規作成 | Phase 1-3 completed として反映  |

## 原本タスク案からの補正

| 原本案                                     | 現行システム上の問題                         | 補正方針                                            |
| ------------------------------------------ | -------------------------------------------- | --------------------------------------------------- |
| `electronAPI.config` 利用                  | 現行 preload/main に config API が存在しない | `electronAPI.store.get/set` を再利用                |
| 独立 route/view としてオンボーディング追加 | 公開シェル契約と競合しやすい                 | `App.tsx` 配下 overlay に統合                       |
| `onboardingUserName` のみ保存              | Dashboard greeting が参照しない              | `useDisplayName()` 側のフォールバック設計まで含める |
| 3テーマ固定                                | 現行 ThemeMode は4値契約                     | curated UI は3種でも保存契約は既存4値維持           |
| ツール追加即実行                           | 実在 inventory 対応が不明                    | `starterIntent` 保存に後退させる                    |

## Phase 5 で想定する実装対象

- `apps/desktop/src/renderer/App.tsx`
- `apps/desktop/src/renderer/views/SettingsView/index.tsx`
- `apps/desktop/src/renderer/store/index.ts` または表示名 selector 周辺
- `apps/desktop/src/renderer/components/organisms/OnboardingWizard/index.tsx`
- `apps/desktop/src/renderer/components/molecules/*` / `components/atoms/*` の新規追加

## 反映判断

本仕様書は「既存システムを壊さずに task-061 の体験要件を満たす」ことを基準に、原本タスク案を現行契約へ再マッピングした設計仕様である。
