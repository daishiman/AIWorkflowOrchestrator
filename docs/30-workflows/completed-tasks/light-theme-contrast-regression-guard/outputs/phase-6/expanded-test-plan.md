# Phase 6 Expanded Test Plan

## 追加で固定した検証観点

| 観点           | 今回の扱い                                       | 目的                                |
| -------------- | ------------------------------------------------ | ----------------------------------- |
| false positive | exclusion で `.test.*` / `phase11-*` を除外      | harness 自体を drift と誤判定しない |
| false negative | current target を Settings / Dashboard に明示    | 今回差分 0 件を監視できる           |
| selector drift | `data-testid` を ThemeSelector / AuthView に追加 | capture ready 状態を安定化          |
| metadata drift | assetEntries を metadata に保存                  | current build source pinning を残す |
| visual drift   | Dashboard dark baseline を比較用に追加           | light 改善の見え方を比較する        |

## representative screen 拡張時の更新点

1. `light-theme-contrast-guard.config.mjs` に scenario / selector / output を追加する。
2. `phase-11-manual-test.md` の TC-ID / coverage matrix を更新する。
3. `manual-test-result.md` の証跡列と `discovered-issues.md` の issue routing を追加する。
4. `implementation-guide.md` の TypeScript 型と CLI 使用例を追記する。

## Phase 7 へ渡す集計単位

| 集計対象      | 単位                                                             |
| ------------- | ---------------------------------------------------------------- |
| audit         | `currentViolations`, `baselineViolations`, `byFile`, `byPattern` |
| screenshot    | TC-ID 5件、png 5件、metadata 1件                                 |
| automation    | typecheck 1件、build 1件、targeted vitest 46件                   |
| documentation | Phase 11 validator 1件、Phase 12 validator 1件                   |

## 今回の拡張で確定したこと

- current build static serve を preflight に含める。
- WorkspaceSearch は preCapture で検索実行後に撮影する。
- 0件報告でも baseline backlog の件数と routing を残す。
