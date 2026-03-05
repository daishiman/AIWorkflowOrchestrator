# Phase 11 スクリーンショット計画

## 目的

- IPC修正タスクでも、ユーザー要求に基づく回帰視覚検証を実施する。
- Apple UI/UX観点（情報階層・視認性・一貫性）で重大な回帰がないことを確認する。

## 撮影対象（TC基準）

| テストケース | 画面                 | ルート                   | 出力ファイル                                                        | ステータス |
| ------------ | -------------------- | ------------------------ | ------------------------------------------------------------------- | ---------- |
| TC-11-UI-01  | ダッシュボード       | `/dashboard`             | `outputs/phase-11/screenshots/TC-11-UI-01-root-navigation.png`      | 取得済み   |
| TC-11-UI-02  | Skill Center         | `/advanced/skill-center` | `outputs/phase-11/screenshots/TC-11-UI-02-skill-center-view.png`    | 取得済み   |
| TC-11-UI-03  | UI Design Foundation | `/ui-design-foundation`  | `outputs/phase-11/screenshots/TC-11-UI-03-ui-design-foundation.png` | 取得済み   |

## 撮影手順（実績）

1. `pnpm --filter @repo/desktop exec vite --config vite.e2e.config.ts` でE2Eサーバーを起動。
2. `pnpm --filter @repo/desktop exec node scripts/capture-auth-key-handler-registration-phase11.mjs` を実行。
3. `outputs/phase-11/screenshots/` 配下に3枚出力されていることを確認。

## 条件付き実行ルール（再利用用）

1. UI変更が1ファイルでもある場合は、TC単位でスクリーンショットを取得する。
2. 取得先は `outputs/phase-11/screenshots/` とする。
3. Apple UI/UXエンジニア観点で、情報階層・視認性・一貫性をレビューして `manual-test-result.md` に記録する。
