# Phase 5 実装サマリー

## 実施日

- 2026-03-06

## 仕様書別 SubAgent 分担

| SubAgent   | 関心ごと     | 実施内容                                                                                  |
| ---------- | ------------ | ----------------------------------------------------------------------------------------- |
| SubAgent-A | 仕様整合     | Phase 1〜4 の要件/設計/テスト観点を実装対象へトレース                                     |
| SubAgent-B | UI実装       | `GlobalNavStrip` / `MobileNavBar` / `AppLayout` / `ComingSoonView` / `App.tsx` 統合を実装 |
| SubAgent-C | 自動テスト   | Phase 4 TC-ID を Green 化し、回帰軸を追加                                                 |
| SubAgent-D | 手動検証準備 | Phase 11 用の撮影スクリプトと検証導線を準備                                               |

## 実装結果

| タスク             | 結果      | 補足                                                                                         |
| ------------------ | --------- | -------------------------------------------------------------------------------------------- |
| コンポーネント実装 | completed | `GlobalNavStrip`、`MobileNavBar`、`MoreMenu`、`AppLayout`、`ComingSoonView` を追加           |
| App 統合           | completed | `App.tsx` に `VITE_USE_GLOBAL_NAV_STRIP` 分岐、`renderView()` 拡張、window resize 同期を追加 |
| 状態管理実装       | completed | `uiSlice` に `isNavExpanded` / `isMobileMoreOpen` と action 群を追加                         |
| 移行実装           | completed | Step 1/2 用の新旧ナビ共存を feature flag で維持                                              |
| テスト Green 化    | completed | Phase 4 対応 100 tests PASS                                                                  |

## 実装した主要仕様

### 1. ナビ契約の実装

- `navigation/navContract.ts` を新ナビ契約の正本として拡張した。
- 9項目/3セクション構成を維持し、日本語ラベルへ統一した。
- `puzzle`、`file-code`、`chevron-left` を `Icon` に追加した。
- `isMobilePrimary`、`MOBILE_PRIMARY_NAV_ITEMS`、`MOBILE_SECONDARY_NAV_ITEMS`、`isGoBackNavigationShortcut` を追加した。

### 2. UI状態管理の実装

- `uiSlice` に `isNavExpanded`、`isMobileMoreOpen` を追加した。
- `toggleNavExpanded`、`setNavExpanded`、`toggleMobileMore`、`closeMobileMore` を追加した。
- `setWindowSize` 実行時に mobile 以外へ遷移した場合は More メニューを閉じるようにした。
- `store/index.ts` から個別 selector/hook を公開し、P31 の責務分離を維持した。

### 3. レイアウト/導線の実装

- `AppLayout` で desktop/tablet/mobile の 3 モードを統合した。
- desktop/tablet は左レール `GlobalNavStrip`、mobile は下部 `MobileNavBar` を採用した。
- `App.tsx` は feature flag が ON の場合に新レイアウト、OFF の場合に legacy `AppDock` を使用する。
- 実体が既にある `WorkspaceView`、`SkillCenterView`、`HistorySearchView` を表示し、残りの導線は `ComingSoonView` へ退避した。

### 4. キーボード/アクセシビリティ実装

- `useNavShortcuts` を追加し、`Cmd/Ctrl+1..8`、`Cmd/Ctrl+,`、`Cmd/Ctrl+[` を実装した。
- `input` / `textarea` / `select` / `contenteditable` 上ではショートカットを無効化した。
- `GlobalNavStrip` に `aria-current="page"`、矢印/Home/End の roving focus を実装した。
- `MoreMenu` は `role="menu"` / `role="menuitem"`、Escape、外側クリック、初回フォーカス移動を実装した。

## 実行コマンドと結果

| コマンド                                                                                                                                                                                                                                                                                                                                                                                                                                    | 結果                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `pnpm install`                                                                                                                                                                                                                                                                                                                                                                                                                              | PASS。`@rollup/rollup-darwin-x64` 不足を解消 |
| `pnpm --dir apps/desktop test:run src/renderer/navigation/navContract.test.ts src/renderer/store/slices/uiSlice.test.ts src/renderer/components/organisms/AppDock/AppDock.test.tsx src/renderer/components/organisms/GlobalNavStrip/GlobalNavStrip.test.tsx src/renderer/components/organisms/MobileNavBar/MobileNavBar.test.tsx src/renderer/components/organisms/AppLayout/AppLayout.test.tsx src/renderer/hooks/useNavShortcuts.test.ts` | PASS（7 files / 100 tests）                  |
| `pnpm --dir apps/desktop typecheck`                                                                                                                                                                                                                                                                                                                                                                                                         | PASS                                         |

## 設計逸脱有無

- blocking な設計逸脱はなし。
- Step 3 の `AppDock` 削除は意図的に未実施とし、feature flag rollback path を保持した。

## 次 Phase への引き継ぎ

- Phase 6 は More メニューと shortcut 系を回帰軸として拡張する。
- Phase 7 は repo-wide threshold fail を task-057 対象コードの品質 fail と混同しない。
- Phase 8 は `AppDock` 削除 readiness を「準備済み」と「削除可能」を分けて判定する。
