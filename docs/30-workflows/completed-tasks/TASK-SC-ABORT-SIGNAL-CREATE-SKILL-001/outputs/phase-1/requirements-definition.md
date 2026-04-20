# Phase 1: 要件定義書

## 本タスクの主語

`createSkill()` の Abort 契約再監査 + private workflow 入口統一

## 現在事実

| 観点             | 現在事実                                                                                                                         |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------- | --- | ---------------------------------------------------------------------------- |
| public 契約      | `createSkill()` は `AbortController` / `operationSignal` を生成し、主要ステップ前後で `throwIfAborted()` を呼んでいる → 成立済み |
| private workflow | `runOrchestrateWorkflow()` は `_signal?: AbortSignal` を受け取るが入口で未使用                                                   |
| private workflow | `runCreateWorkflow()` は `_signal?: AbortSignal` を受け取るが入口で未使用                                                        |
| create fallback  | `createSkill()` 側で `isAbortError(error)                                                                                        |     | operationSignal.aborted` を確認し abort-like error を再スローしている → 維持 |
| UI 影響          | なし (NON_VISUAL)                                                                                                                |

## 要件

| ID   | 要件                                                                                 | 種別 |
| ---- | ------------------------------------------------------------------------------------ | ---- |
| R-01 | `runOrchestrateWorkflow()` と `runCreateWorkflow()` の入口で `signal` を即時確認する | 機能 |
| R-02 | `cancelCurrentOperation()` 後に `createSkill()` が abort-like error を握り潰さない   | 機能 |
| R-03 | 新規作成ディレクトリ cleanup 契約を壊さない                                          | 機能 |
| R-04 | テスト仕様は Vitest / 既存 test file / public flow 優先に統一する                    | 品質 |
| R-05 | Phase 11/12/13 の canonical artifact 名と blocked 運用を揃える                       | 品質 |

## 変更面積

- 修正ファイル: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`
- 変更箇所: `runOrchestrateWorkflow()` と `runCreateWorkflow()` の引数名 `_signal` → `signal` + 入口 `throwIfAborted(signal)` 追加
- テストファイル: `SkillCreatorService-cancel.test.ts` に TC-03 / TC-04 追加
