# Phase 1 要件定義サマリー

## 概要

- 対象は `apps/desktop/scripts/capture-light-theme-contrast-regression-guard-phase11.mjs` の事前判定を shared preflight bundle に切り出す改善である。
- 現状は `phase11-static-server.mjs` による localhost fallback はあるが、`native dependency` / `build output` / `harness route` / `baseUrl` の 4 観点が 1 契約に束ねられていない。
- 本タスクでは UI remediation を扱わず、Phase 11 current build capture の前提判定だけを機械化する。

## 機能要件

| ID   | 要件                                                                                                             | 根拠           |
| ---- | ---------------------------------------------------------------------------------------------------------------- | -------------- |
| FR-1 | `phase11-current-build-preflight-core.mjs` が 4 bucket を `native -> build -> harness -> baseUrl` の順で判定する | Phase 1/2 仕様 |
| FR-2 | thin CLI wrapper が shared core の結果を `JSON` / `stdout` / `exit code` に変換する                              | Phase 2 仕様   |
| FR-3 | capture script は shared core の結果を直接消費し、独自の preflight orchestration を持たない                      | Phase 1/5 仕様 |
| FR-4 | `apps/desktop/package.json` に `preflight:light-theme-contrast-guard` を追加する                                 | Phase 1/5 仕様 |
| FR-5 | Phase 11 / 12 文書と system spec が同じ bundle 名を参照する                                                      | AC-5           |

## 非機能要件

| ID    | 要件                                                                             | 補足                               |
| ----- | -------------------------------------------------------------------------------- | ---------------------------------- |
| NFR-1 | build 未実行と harness 欠落を別 bucket で返す                                    | 誤診断防止                         |
| NFR-2 | 判定ロジックを core へ集約し、wrapper と consumer に複製しない                   | duplication drift 防止             |
| NFR-3 | loopback baseUrl と remote baseUrl を区別し、loopback のみ auto serve 対象にする | `phase11-static-server.mjs` 再利用 |
| NFR-4 | guidance は次の 1 手をコマンド付きで返す                                         | Phase 11/12 再利用                 |
| NFR-5 | Phase 12 では current/baseline を別欄で記録する                                  | unassigned 監査ルール              |

## 依存関係

- 既存資産:
  - `apps/desktop/scripts/phase11-static-server.mjs`
  - `apps/desktop/scripts/capture-light-theme-contrast-regression-guard-phase11.mjs`
  - `apps/desktop/electron.vite.config.ts`
  - `apps/desktop/src/renderer/phase11-light-theme-contrast-guard.html`
- 依存タスク:
  - `TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001`
  - `UT-FIX-WORKTREE-NATIVE-BINARY-GUARD-001`

## 制約

- remediation task の UI 色修正は scope 外に保つ。
- closed Issue `#1167` は参照用とし、状態変更しない。
- Phase 1-3 完了前に Phase 4 以降の契約を変更しない。
