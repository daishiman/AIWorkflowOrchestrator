# Phase 11 スクリーンショット計画

## 目的

非視覚修正（IPC契約・Store正規化）の回帰確認として、主要導線3画面を固定スナップショット化する。

## 撮影対象（TC-ID）

| TC-ID       | 画面/状態                     | ルート                           | 期待する証跡                           |
| ----------- | ----------------------------- | -------------------------------- | -------------------------------------- |
| TC-11-UI-01 | ルート初期表示（AppDock可視） | `/`                              | `TC-11-UI-01-root-navigation.png`      |
| TC-11-UI-02 | Skill Center 一覧             | `/advanced/skill-center`         | `TC-11-UI-02-skill-center-view.png`    |
| TC-11-UI-03 | UI Design Foundation Preview  | `/advanced/ui-design-foundation` | `TC-11-UI-03-ui-design-foundation.png` |

## 実行コマンド

```bash
# 1) Vite起動（別ターミナル）
cd apps/desktop
npx vite --config vite.e2e.config.ts --host 127.0.0.1 --port 5173

# 2) スクリーンショット撮影
cd ../..
node apps/desktop/scripts/capture-electron-sandbox-iterable-phase11.mjs
```

## 事前条件

- `window.electronAPI` はスクリプト内でモック注入する。
- `sessionStorage.debug-clear-storage=done` を注入し、初回リロード競合を回避する。

## Apple UI/UXレビュー観点

- 情報階層（見出し→本文→操作）
- 余白/整列（カード・リスト・フォームの崩れ）
- コントラスト（ダーク背景での可読性）
- 操作導線（主要CTAの発見可能性）
