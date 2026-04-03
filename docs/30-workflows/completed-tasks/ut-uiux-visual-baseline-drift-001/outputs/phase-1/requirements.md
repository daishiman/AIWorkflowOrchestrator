# Phase 1: 要件定義

## 結論

`TC-11-05 error-display`、`TC-11-06 loading-state`、`TC-11-07 dark-mode` の Visual Regression は、現時点では再現不能だった。  
`git log --follow` の確認では、`OnboardingWizard` と baseline snapshots が `51b3fc0c2` で同時に更新されており、差分の起点は意図した UI 変更だったと判断できる。

## 機能要件

| ID    | 要件                                                                                                             |
| ----- | ---------------------------------------------------------------------------------------------------------------- |
| FR-01 | `diff` 画像と `git log` を照合して、UI 変更起因か regression 起因かを判定できること                              |
| FR-02 | UI 変更起因の場合、baseline snapshots を安全に更新できること                                                     |
| FR-03 | Regression 起因の場合、UI 実装を baseline に合わせて修正できること                                               |
| FR-04 | `playwright.config.ts` と `layer2-visual.spec.ts` で `colorScheme: "dark"` を明示し、OS テーマ差を排除できること |

## 非機能要件

| ID     | 要件                                                                                           |
| ------ | ---------------------------------------------------------------------------------------------- |
| NFR-01 | `pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2` が全件 PASS すること |
| NFR-02 | `ui-ux-layer2` の結果が CI でも再現可能であること                                              |
| NFR-03 | `maxDiffPixels` は 200px 以下に抑えること                                                      |

## 受け入れ条件

| ID    | 条件                                       |
| ----- | ------------------------------------------ |
| AC-01 | error-display の判定根拠が文書化されている |
| AC-02 | loading-state の判定根拠が文書化されている |
| AC-03 | dark-mode の判定根拠が文書化されている     |
| AC-04 | `ui-ux-layer2` が全 PASS している          |
| AC-05 | colorScheme が明示されている               |
| AC-06 | baseline 更新対象が 3 surface に限定される |

## 次Phaseへの引き継ぎ

- Phase 2 では、UI 変更起因と判定したときの baseline 更新、そして dark-mode の `colorScheme` 固定を設計に落とし込む。
- 既存 snapshots は `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/` にある 7 枚を基準に扱う。
