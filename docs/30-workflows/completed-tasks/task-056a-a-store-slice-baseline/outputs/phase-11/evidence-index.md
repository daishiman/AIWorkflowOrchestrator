# Phase 11 証跡一覧

## メタ情報

| 項目       | 値                                |
| ---------- | --------------------------------- |
| タスクID   | TASK-UI-01-A-STORE-SLICE-BASELINE |
| Phase      | 11                                |
| 実施日     | 2026-03-05                        |
| ステータス | completed                         |

## 証跡命名規則

- ファイル形式: `phase11-{screen}.png`
- 保存先: `outputs/phase-11/screenshots/`

## 証跡一覧

| ID    | 証跡ファイル                                              | 対応テストケース | 備考                 |
| ----- | --------------------------------------------------------- | ---------------- | -------------------- |
| EV-01 | `outputs/phase-11/screenshots/phase11-dashboard.png`      | TC-11-01         | Dashboard 全体表示   |
| EV-02 | `outputs/phase-11/screenshots/phase11-skill-center.png`   | TC-11-02         | SkillCenter 探索画面 |
| EV-03 | `outputs/phase-11/screenshots/phase11-history-search.png` | TC-11-03         | History 空状態画面   |

## 取得コマンド（再実行用）

`pnpm --filter @repo/desktop exec node --input-type=module` で Playwright + Vite を起動し、3画面を連続キャプチャした。

## 保管確認

- EV-01〜EV-03 の PNG 実体が存在することを `ls` + `file` コマンドで確認済み。
