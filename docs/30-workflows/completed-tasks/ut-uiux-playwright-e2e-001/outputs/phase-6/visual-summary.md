# Phase 6 実装サマリー — Layer 2 Visual Regression Tests

## 概要

`apps/desktop/e2e/ui-ux/layer2-visual.spec.ts` を新規作成し、
VIS-001〜007 の Visual Regression テストを実装した。

## 実装ファイル

| ファイル                                        | 役割                                                 |
| ----------------------------------------------- | ---------------------------------------------------- |
| `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts`  | Layer 2 Visual Regression テスト本体（新規作成）     |
| `apps/desktop/e2e/ui-ux/test-targets.config.ts` | テスト対象設定（Phase 4 所有・読み取り専用）         |
| `apps/desktop/e2e/ui-ux/helpers.ts`             | ナビゲーションヘルパー（Phase 4 所有・読み取り専用） |

## テスト構成

### describe ブロック 1: `[VIS] Layer 2 Visual Regression Tests`

`TEST_TARGETS.filter(t => t.layer2)` をイテレートして動的に生成。
7 件の対象が VIS-001〜007 に 1:1 対応する。

| テスト ID | target.id            | 説明                             | maxDiffPixels | clip                       |
| --------- | -------------------- | -------------------------------- | ------------- | -------------------------- |
| VIS-001   | `chat-main`          | メインチャット画面               | 50            | なし（fullPage）           |
| VIS-002   | `skill-list`         | スキル一覧画面                   | 50            | なし（fullPage）           |
| VIS-003   | `settings-general`   | 設定画面（一般タブ）             | 50            | なし（fullPage）           |
| VIS-004   | `sidebar-navigation` | サイドバーナビゲーション         | 30            | `{x:0, y:0, w:200, h:768}` |
| VIS-005   | `error-display`      | エラー表示コンポーネント         | 20            | なし（fullPage）           |
| VIS-006   | `loading-state`      | ローディング状態                 | 20            | なし（fullPage）           |
| VIS-007   | `dark-mode`          | ダークモード（テーマ切り替え後） | 50            | なし（fullPage）           |

スナップショットファイル名: `{target.id}-baseline.png`
保存先: `apps/desktop/e2e/ui-ux/snapshots/`

### describe ブロック 2: `[VIS] Fail Path & Regression Guard`

| テスト名                                               | 目的                                                    |
| ------------------------------------------------------ | ------------------------------------------------------- |
| fail-path: 存在しないセレクタは要素を見つけられない    | `waitFor({ timeout: 1000 })` が reject されることを確認 |
| regression guard: layer2 対象は 7 件以上定義されている | `TEST_TARGETS.filter(t => t.layer2).length >= 7` を守る |
| ANTHROPIC_API_KEY が設定されていてもテストは完走できる | API キー非依存であることを確認                          |

## 主要な設計判断

- **Playwright 標準 `page` fixture 使用**: `launchElectronApp()` は使わず、
  `playwright.config.ts` の `webServer` + Chromium で Renderer のみをテストする。
- **`fullyParallel: false`**: `ui-ux-layer2` プロジェクト設定に従い、
  スナップショット競合を防ぐためシリアル実行。
- **`animations: "disabled"`**: アニメーションによるピクセル差分を排除。
- **baseline 未生成時**: `--update-snapshots` フラグで初回生成モードになる。

## 実行コマンド

```bash
# baseline 初回生成
pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2 --update-snapshots

# 通常比較実行
pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2
```

## 完了条件チェック

- [x] VIS-001〜007 が全て実装されている（7 件が TEST_TARGETS から動的に生成）
- [x] fail-path テストが実装されている
- [x] regression guard テストが実装されている
- [x] ANTHROPIC_API_KEY 非依存チェックが実装されている
- [x] `test-targets.config.ts` を変更していない
- [x] `launchElectronApp()` を使っていない
- [x] describe ブロック名が仕様通り: `"[VIS] Layer 2 Visual Regression Tests"`
- [x] `snapshots/` ディレクトリが存在している（.gitkeep で確認済み）
