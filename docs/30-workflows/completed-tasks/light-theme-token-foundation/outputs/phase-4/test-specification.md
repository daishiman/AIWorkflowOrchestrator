# Phase 4 成果物: test-specification

## 1. テスト方針

- TDD（Red→Green）で token 契約テストを先に固定する。
- `tokens.css` 単体検証 + renderer 全体参照監査を同時に行う。
- light/dark/kanagawa の3テーマ整合を必須とする。

## 2. 対象テストファイル

| 種別 | ファイル                                                               |
| ---- | ---------------------------------------------------------------------- |
| 新規 | `apps/desktop/src/renderer/styles/tokens.light-theme.contract.test.ts` |

## 3. テスト観点

| 観点ID   | 観点                     | 合格条件                                             |
| -------- | ------------------------ | ---------------------------------------------------- |
| TC-04-01 | light surface 契約       | `--bg-primary`/`--bg-elevated` が純白固定でない      |
| TC-04-02 | required token 完備性    | 必須 token が light/dark/kanagawa すべてで定義される |
| TC-04-03 | missing token 検出       | fallback なし未定義 `var(--token)` が 0 件           |
| TC-04-04 | representative rendering | light で text/background が同色化しない              |

## 4. 実行コマンド

```bash
pnpm --filter @repo/desktop test:run -- src/renderer/styles/tokens.light-theme.contract.test.ts
```

## 5. 完了判定

- [x] テスト仕様を定義
- [x] テストケースIDを固定
- [x] Phase 5 実装への入力を確定
