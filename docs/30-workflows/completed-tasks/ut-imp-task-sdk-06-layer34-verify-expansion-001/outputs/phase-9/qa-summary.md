# QA Summary

| Gate                        | 結果    | 根拠                                                                                                                      |
| --------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------- |
| shared/runtime contract     | PASS    | shared type、engine、facade、IPC、preload、renderer の新規 API 名が `getVerifyDetail` / `reverifyWorkflow` で一致している |
| sibling boundary drift      | PASS    | Task07 / Task08 owner は delegated note 表示に留め、owner 移譲を実装していない                                            |
| typecheck                   | PASS    | `pnpm exec tsc --noEmit -p apps/desktop/tsconfig.json`                                                                    |
| formatting                  | PASS    | `pnpm exec prettier --check` を変更対象ファイルで通過                                                                     |
| workflow validation         | PASS    | `verify-all-specs.js` / `validate-phase-output.js` / `verify-unassigned-links.js` が通過                                  |
| unit/runtime test execution | BLOCKED | ローカル `esbuild` の host/binary mismatch により Vitest を起動できない                                                   |

## blocked detail

- 発生コマンド: `pnpm exec vitest ...`
- 発生事象: `Cannot start service: Host version "0.21.5" does not match binary version "0.27.4"`
- 補足: `pnpm rebuild esbuild` でも複数 version 期待値 (`0.21.5` / `0.27.2`) と現バイナリ (`0.27.4`) の不整合が残った
