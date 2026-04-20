# TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001 - タスク実行仕様書

## メタ情報

| 項目       | 内容                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| 機能名     | TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001                                                                        |
| タイトル   | `createSkill()` の AbortSignal 契約を実装事実に合わせて再監査し、private workflow 内の即時中断保証を統一する |
| 作成日     | 2026-04-19                                                                                                   |
| ステータス | phase13_blocked（Phase 1-12 completed / Phase 13 blocked）                                                   |
| 総Phase数  | 13                                                                                                           |
| Issue      | [#2230](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2230)                                     |
| 優先度     | medium                                                                                                       |
| 規模       | small                                                                                                        |
| カテゴリ   | enhancement / skill-creator                                                                                  |
| タスク種別 | NON_VISUAL / state-only                                                                                      |
| 検出元     | TASK-SW-CANCEL-004 Phase 12 未タスク検出                                                                     |

## 概要

本タスクは「キャンセル機構が存在しない」問題の再実装ではない。`createSkill()` はすでに
`operationSignal` を生成し、各モード分岐へ渡している。今回の主題は、`runOrchestrateWorkflow`
と `runCreateWorkflow` でも入口で `signal` を即時確認し、Abort 契約を public flow と
private flow の両方で一貫させること、およびその差分を skill 準拠で監査可能な仕様書へ
整えることにある。

## 現在事実

| 観点                  | 現在事実                                                                                                                                                    | 本タスクで扱うこと |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| 公開キャンセル契約    | `createSkill()` は `AbortController` と `operationSignal` を持ち、主要ステップ前後で `throwIfAborted()` を呼んでいる                                        | 維持               |
| private workflow 引数 | `runOrchestrateWorkflow()` / `runCreateWorkflow()` は `signal` を受け取り、入口で `throwIfAborted(signal)` を実行する                                       | 同期済み           |
| create fallback       | `createSkill()` 側は abort-like error を再スローし、通常エラーのみ null fallback へ分岐している                                                             | 維持               |
| UI 影響               | UI レイアウト変更はなく、Phase 11 は NON_VISUAL 運用で扱う                                                                                                  | 完了               |
| テスト基盤            | `@repo/desktop` のテストは Vitest。既存の `SkillCreatorService.test.ts` と `SkillCreatorService-cancel.test.ts` を再利用し、private minimal test を追加した | 完了               |

## 真の論点

1. 公開契約としてのキャンセルは成立済みで、private workflow の入口保証も今回の wave で統一した。
2. 仕様書が「未実装の大問題」と「小粒の一貫性修正」を混同していた点を、close-out 文書で解消した。
3. Phase 11/12 の canonical 名、`outputs/artifacts.json` parity、skill close-out ルールを current facts に同期した。

## 30思考法の適用方針

| カテゴリ     | 思考法                                                               | 本タスクでの適用先                                      |
| ------------ | -------------------------------------------------------------------- | ------------------------------------------------------- |
| 論理分析系   | 批判的思考、演繹思考、帰納的思考、アブダクション、垂直思考           | 実コードと旧仕様の矛盾整理、受け入れ基準の再定義        |
| 構造分解系   | 要素分解、MECE、2軸思考、プロセス思考                                | Phase 再編、artifact 整理、lane 分割                    |
| メタ・抽象系 | メタ思考、抽象化思考、ダブル・ループ思考                             | 「何を直すタスクか」の主語を `createSkill()` 契約へ戻す |
| 発想・拡張系 | ブレインストーミング、水平思考、逆説思考、類推思考、if思考、素人思考 | 13 Phase を残しつつ情報密度を上げる代替案検討           |
| システム系   | システム思考、因果関係分析、因果ループ                               | Abort 伝播点、cleanup、error suppression の関係整理     |
| 戦略・価値系 | トレードオン思考、プラスサム思考、価値提案思考、戦略的思考           | 最小修正で最大の再監査価値を取る                        |
| 問題解決系   | why思考、改善思考、仮説思考、論点思考、KJ法                          | 誤前提、過剰テスト、Phase/成果物 drift の収束           |

## 対象ファイル

| ファイル                                                                            | 役割                                              |
| ----------------------------------------------------------------------------------- | ------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                       | private workflow 入口の Abort 確認統一            |
| `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`        | create / orchestrate / create workflow の回帰証跡 |
| `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService-cancel.test.ts` | public cancel 契約の主証跡                        |
| `docs/30-workflows/TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001/`                          | 13 phase 仕様書と artifacts parity                |

## SubAgent 編成

| Lane | 役割                                  | 実行形態         | 主成果物                                                         |
| ---- | ------------------------------------- | ---------------- | ---------------------------------------------------------------- |
| A    | `task-specification-creator` 準拠監査 | Phase 2-3 で並列 | `outputs/phase-3/task-specification-creator-compliance-audit.md` |
| B    | `aiworkflow-requirements` 抽出監査    | Phase 2-3 で並列 | `outputs/phase-3/aiworkflow-requirements-extraction-audit.md`    |
| C    | 実コード整合・エレガンス監査          | Phase 2-3 で並列 | `outputs/phase-3/solution-elegance-review.md`                    |

## 実行フロー

```text
Phase 1 -> Phase 2 -> Phase 3 (Gate) -> Phase 4 -> Phase 5 -> Phase 6 -> Phase 7
                    |                     |
                    +-- 3 Lane 並列 ------+
Phase 8 -> Phase 9 -> Phase 10 (Gate) -> Phase 11 -> Phase 12 -> Phase 13(blocked)
```

## Phase一覧

| Phase | 名称                 | 仕様書                                                       | ステータス |
| ----- | -------------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | completed  |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | completed  |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | completed  |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | completed  |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | completed  |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | completed  |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | completed  |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | completed  |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | completed  |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | completed  |
| 11    | 手動テスト           | [phase-11-manual-test.md](phase-11-manual-test.md)           | completed  |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | completed  |
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | blocked    |

## 成功基準

- 矛盾なし: 仕様書が「未実装の大問題」ではなく「Abort 契約の一貫性修正」として閉じている
- 漏れなし: 13 phase、Phase 11/12 canonical 名、`outputs/artifacts.json` parity、Phase 13 blocked が揃う
- 整合性あり: 実コード、Vitest、close-out ルール、artifact 名が一致する
- 依存関係整合: Phase 2-3 の並列監査結果を受けてから Phase 4 以降へ進む

## 完了条件

- [x] `runOrchestrateWorkflow()` と `runCreateWorkflow()` の入口で `signal` を即時確認する設計になっている
- [x] `cancelCurrentOperation()` 後の `createSkill()` 中断契約が既存テストと矛盾しない
- [x] テスト戦略が Vitest / 既存 test file / public flow 優先に修正されている
- [x] Phase 11 / 12 / 13 の canonical output 名、blocked ルール、artifact parity が揃っている
- [x] `artifacts.json` と `outputs/artifacts.json` が同一内容で管理されている

## Phase完了時の必須アクション

1. Phase 内の全タスクを完了する
2. `artifacts.json` と `outputs/artifacts.json` の両方を更新する
3. 成果物を `outputs/phase-N/` に登録する
4. Phase 3 / 10 は Gate 判定を明記する
5. Phase 13 は user approval がない限り `blocked` を維持する

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001 \
  --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}:{{DESCRIPTION}}"
```
