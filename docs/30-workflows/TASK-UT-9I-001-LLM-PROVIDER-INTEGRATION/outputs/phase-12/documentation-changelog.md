# Documentation Changelog

## 変更ファイル

| ファイル                                               | 変更理由                                                |
| ------------------------------------------------------ | ------------------------------------------------------- |
| `index.md`                                             | current code に合わせた overview と phase status の更新 |
| `phase-1-requirements.md`                              | `LLMDocQueryAdapter` stub と API key source の明確化    |
| `phase-2-design.md`                                    | `ipc/index.ts` の薄い wiring と委譲境界の明確化         |
| `phase-3-design-review.md`                             | stub 置換対象の用語を current state に合わせた          |
| `phase-4-test-creation.md`                             | TC-11 を `Generated content for:` 監査基準へ修正        |
| `phase-5-implementation.md`                            | 実装責務を `LLMDocQueryAdapter` に寄せた                |
| `phase-8-refactoring.md`                               | stub 排除の grep 対象を修正                             |
| `phase-9-quality-assurance.md`                         | quality check の grep 対象を修正                        |
| `phase-10-final-review.md`                             | AC-7 の表現を修正                                       |
| `phase-4-test-creation.md`〜`phase-10-final-review.md` | `ステータス` を `completed` に正規化                    |
| `outputs/phase-10/final-review-result.md`              | Phase 10 gate と workflow overall の判定を分離          |
| `outputs/phase-10/shipping-checklist.md`               | 出荷可能判定を保留に修正し、対象テスト実績を更新        |
| `phase-11-manual-test.md`                              | NON_VISUAL と `manual-test-result.md` 参照を明示        |
| `outputs/phase-11/manual-test-result.md`               | 新規作成                                                |
| `outputs/phase-12/*.md`                                | Phase 12 canonical outputs を新規作成                   |
| `artifacts.json` / `outputs/artifacts.json`            | phase status を同期                                     |

## 検証メモ

- `rg -n 'LLMDocQueryAdapter.*stub' docs/30-workflows/TASK-UT-9I-001-LLM-PROVIDER-INTEGRATION` の結果は legacy reference のみ。
- `Generated content for:` は historical regression check として一部に残っている。
- `phase-12-documentation.md` の 6 タスク / 6 成果物の構成は維持されている。
- `manual-test-result.md` への参照は `phase-12-documentation.md` と `implementation-guide.md` に明記した。
- `pnpm --filter @repo/desktop exec tsc --noEmit` は PASS 済み。
- vitest の対象 6 ファイル 109 tests は PASS 済み。
- `validate-phase12-implementation-guide.js --workflow docs/30-workflows/TASK-UT-9I-001-LLM-PROVIDER-INTEGRATION --json` は PASS 済み。
- `validate-phase-output.js docs/30-workflows/TASK-UT-9I-001-LLM-PROVIDER-INTEGRATION` は PASS 済み。
- `outputs/phase-11/screenshots/.gitkeep` は task-local NON_VISUAL scope では不要で、screenshots ディレクトリ未作成を no-op として記録した。

## ソースコード変更概要

- `apps/desktop/src/main/services/skill/LLMDocQueryAdapter.ts`: stub を排し、`LLMClient` 委譲と `DocError` 正規化を導入。
- `apps/desktop/src/main/services/llm/LLMClient.ts`: `AnthropicProvider` を経由した retry / timeout 制御を実装。
- `apps/desktop/src/main/services/llm/providers/AnthropicProvider.ts`: HTTP error / timeout / network のマッピングを実装。
- `apps/desktop/src/main/ipc/index.ts`: docs query の wiring を薄く保ち、adapter 側に責務を集約。
- `apps/desktop/src/main/ipc/skillHandlers.ts`: `docError` 由来の `errorCode` / `retryable` を保持したまま返すように修正。
- `apps/desktop/src/preload/skill-api.ts`: `safeInvokeUnwrap` が `errorCode` に加えて `retryable` も thrown Error に載せるように修正。

## current / baseline

- current: task-local workflow 文書と Phase 10〜12 成果物の整合を更新。
- baseline: root-level `outputs/phase-12/` と他 workflow の成果物は変更なし。global ledger / LOGS は 2026-04-17 wave で同期済みのため今回は再更新なし。

## 補足

- 仕様書間の矛盾は、current state の実体に合わせることで解消した。
- code-side validator は PASS 済み。
