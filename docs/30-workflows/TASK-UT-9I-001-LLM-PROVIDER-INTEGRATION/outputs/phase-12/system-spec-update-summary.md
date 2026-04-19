# System Spec Update Summary

## 目的

task-local の Phase 12 文書を current code と current canonical reference に揃える。今回の wave では task-local 成果物を修正しつつ、global ledger / LOGS / mirror parity は既存同期済みかを再確認した。

## 更新内容

| ファイル                                     | 反映内容                                                                  | 判定           |
| -------------------------------------------- | ------------------------------------------------------------------------- | -------------- |
| `index.md`                                   | Phase status を current state に更新し、`LLMDocQueryAdapter` を基準に記述 | 更新           |
| `phase-1-requirements.md`                    | stub の残存箇所と API キー取得元を current code に合わせて修正            | 更新           |
| `phase-2-design.md`                          | `ipc/index.ts` の薄い wiring と `LLMDocQueryAdapter` 委譲を明確化         | 更新           |
| `phase-3-design-review.md`                   | `LLMDocQueryAdapter` stub を監査対象に変更                                | 更新           |
| `phase-4-test-creation.md`                   | TC-11 を `Generated content for:` 基準へ修正                              | 更新           |
| `phase-5-implementation.md`                  | 実装責務を `LLMDocQueryAdapter` 委譲に寄せ、current wiring に一致させた   | 更新           |
| `phase-8-refactoring.md`                     | stub 排除確認を `Generated content for:` に変更                           | 更新           |
| `phase-9-quality-assurance.md`               | 品質確認の grep 対象を `Generated content for:` 基準に変更                | 更新           |
| `phase-10-final-review.md`                   | AC-7 の表現を `Generated content for:` 基準に変更                         | 更新           |
| `phase-11-manual-test.md`                    | NON_VISUAL、スクリーンショット不要、manual-test-result 参照を明示         | 更新           |
| `phase-12-documentation.md`                  | 6 タスク / 6 成果物の整合を維持                                           | no-op/確認済み |
| `phase-4`〜`phase-10` 各 phase 本文          | `index.md` / `artifacts.json` と同じ `completed` に正規化                 | 更新           |
| `outputs/phase-10/final-review-result.md`    | Phase 10 gate と workflow overall の判定を分離                            | 更新           |
| `outputs/phase-10/shipping-checklist.md`     | 出荷保留と対象テスト実績に修正                                            | 更新           |
| `apps/desktop/src/main/ipc/skillHandlers.ts` | docs generate 失敗時に `errorCode` / `retryable` を保持するよう修正       | 更新           |
| `apps/desktop/src/preload/skill-api.ts`      | `safeInvokeUnwrap` が `retryable` を thrown Error へ伝播するよう修正      | 更新           |
| `outputs/phase-11/manual-test-result.md`     | 新規作成                                                                  | 新規           |
| `outputs/phase-12/*`                         | 新規作成                                                                  | 新規           |
| `artifacts.json` / `outputs/artifacts.json`  | phase status と成果物一覧を同期                                           | 更新           |

## current state の要点

- `ipc/index.ts` は LLM docs の起点で、薄い wiring として残している。
- 実際の stub は解消済みで、`LLMDocQueryAdapter.ts` は `LLMClient` へ委譲する current adapter になっている。
- `LLMClient.ts` と `AnthropicProvider.ts` は current runtime path として docs に明示した。
- `phase-11-manual-test.md` は NON_VISUAL だが、実機 Anthropic API 検証は `ANTHROPIC_API_KEY` 未設定のため BLOCKED。
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md` / `task-workflow-completed.md` / `task-workflow-backlog.md` と `LOGS.md` には 2026-04-17 wave で UT-9I-001 current reference sync が記録済み。
- `.claude` と `.agents` の両方に同内容の task-workflow / LOGS 記録があり、mirror parity は追加更新不要と確認した。
- `skill:docs:generate` は docs generate 失敗時も `API_KEY_MISSING` などの `errorCode` と `retryable` を IPC で保持し、preload まで伝播するよう current code を補強した。

## sync 判定

| 項目                                                                           | 判定                 | 根拠                                                                                       |
| ------------------------------------------------------------------------------ | -------------------- | ------------------------------------------------------------------------------------------ |
| `task-workflow.md` / `task-workflow-completed.md` / `task-workflow-backlog.md` | PASS（既存同期済み） | `aiworkflow-requirements/LOGS.md` に 2026-04-17 current reference sync 記録あり            |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                               | PASS（既存同期済み） | UT-9I-001 専用エントリあり                                                                 |
| `.claude/skills/task-specification-creator/LOGS.md`                            | PASS（既存同期済み） | Phase-12 完了確認エントリあり                                                              |
| `topic-map.md` / index 再生成                                                  | no-op                | 今回は task-local docs の wording 修正のみで global spec 見出し追加なし                    |
| `.claude` / `.agents` mirror parity                                            | PASS（既存同期済み） | task-workflow / LOGS の双方で対応記録あり                                                  |
| `outputs/phase-11/screenshots/.gitkeep`                                        | no-op                | task-local `outputs/phase-11/` は NON_VISUAL のため screenshots ディレクトリ自体を持たない |
| root-level `outputs/phase-12/`                                                 | no-op                | 別 workflow 群の repo-wide 成果物であり、この task の正本ではない                          |

## 参照

- Phase 11 正本: `outputs/phase-11/manual-test-result.md`
- Phase 12 正本: `phase-12-documentation.md`
