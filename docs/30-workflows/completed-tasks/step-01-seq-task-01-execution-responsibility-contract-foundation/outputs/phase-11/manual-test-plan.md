# Phase 11: 手動テスト計画

## メタ情報

| 項目            | 内容                                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| タスクID        | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001                                                 |
| Phase           | 11                                                                                                        |
| 実行方式        | dedicated review-board harness + Playwright capture                                                       |
| capture command | `pnpm exec tsx apps/desktop/scripts/capture-task-execution-responsibility-contract-foundation-phase11.ts` |

## 実施方針

本タスクは contract foundation の design task であり、Phase 11 では live app ではなく review-board harness を使用する。harness は `packages/shared/src/types/execution-capability.ts` の pure function 実装結果を可視化し、Settings capability card / Main Chat CTA / guard panel を 1 画面に統合して撮影する。

## TC ごとの手順

### TC-01 integratedRuntime ready

1. capture script を実行する。
2. `TC-01-integrated-runtime-ready.png` を開く。
3. Settings 側で `AI統合実行` card が `active`、Main Chat 側で primary=`AI で実行` / secondary=`設定を開く` を確認する。

### TC-02 terminalSurface ready

1. `TC-02-terminal-surface-ready.png` を開く。
2. Settings 側で `ターミナル handoff` card が `active` であることを確認する。
3. Main Chat 側で primary=`ターミナルで実行` / secondary=`コマンドをコピー` を確認する。

### TC-03 both ready

1. `TC-03-both-ready.png` を開く。
2. Settings 側で `AI統合実行` と `ターミナル handoff` の両 card が `active` であることを確認する。
3. Main Chat 側で primary=`AI で実行` / secondary=`ターミナルで実行` を確認する。

### TC-04 none unavailable

1. `TC-04-none-unavailable.png` を開く。
2. Settings 側で `利用不可メッセージ` card が `focus` であることを確認する。
3. Main Chat 側で primary CTA が表示されず、secondary=`セットアップガイド` と理由テキストが表示されることを確認する。

### TC-05 blocked -> ready transition

1. `TC-05-blocked-to-ready-transition.png` を開く。
2. before 側で primary=`設定を開く`、resolution=`settings path` を確認する。
3. after 側で primary=`AI で実行`、uiState=`ready` を確認する。

### TC-06 silent fallback guard

1. `TC-06-silent-fallback-guard.png` を開く。
2. guard panel で `silent fallback · PASS` と `primary CTA DOM guard · PASS` を確認する。
3. Main Chat 側で primary CTA 非表示と理由テキストが両立していることを確認する。

## 完了条件

- 6 TC すべてに対応する screenshot が `outputs/phase-11/screenshots/` に存在する
- `manual-test-result.md` に 6 TC すべての結果と証跡が記録されている
- `screenshot-coverage.md` に 6 TC すべての対応が記録されている
- `validate-phase11-screenshot-coverage` が PASS する
