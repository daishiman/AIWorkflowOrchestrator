# Phase 12 実装ガイド（SubAgent-C）

## Part 1（中学生向け）

ナビゲーションを「学校の案内板」に例えると、どの教室に行くかを決める地図です。
今回の作業では、案内板（AppDock）とショートカットキーのルールを1つのノート（`navContract.ts`）にまとめました。
これで、案内板の順番を直すときに、別の場所を探して直す必要がなくなります。

## Part 2（技術者向け）

- 契約集約:
  - `NAV_SECTIONS` と `APP_DOCK_NAV_ITEMS` を `navigation/navContract.ts` に集約
  - `NavViewKey` / `AppDockNavItem` を正本型として使用
- APIシグネチャ（Renderer）:

```ts
type ShortcutResult = ViewType | null;
function getViewFromNavigationShortcut(event: KeyboardEvent): ShortcutResult;
function isEditableEventTarget(target: EventTarget | null): boolean;
```

- 主要フロー:
  1. `App.tsx` で `keydown` listener を登録
  2. `isEditableEventTarget()` で `input/textarea/contenteditable` を除外
  3. `getViewFromNavigationShortcut()` が `Cmd/Ctrl + 1..8,+,` を `ViewType` へ解決
  4. 解決時のみ `setCurrentView()` を呼ぶ
- エラーハンドリング/エッジケース:
  - `meta/ctrl` 未押下、`shift/alt` 併用、未知キーは `null` を返して無視
  - 編集要素上ではショートカットを無効化して誤発火を防止
  - 互換導線として `skill-center` エイリアスを許容
- 設定可能な定数:
  - `NAV_SHORTCUT_TO_VIEW`: キーコードと `ViewType` の対応表
  - `APP_DOCK_NAV_ITEMS`: AppDock 表示順序・アイコン・aria ラベル定義
- テスト:
  - `navContract.test.ts`（契約/ショートカット解決）
  - `AppDock.test.tsx`（レンダリング/操作導線）
  - `navigation.integration.test.ts`（統合遷移）
