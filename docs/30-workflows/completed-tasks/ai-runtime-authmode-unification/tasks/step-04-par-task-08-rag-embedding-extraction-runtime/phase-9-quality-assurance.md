# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------- |
| Phase      | 9                                                                                              |
| Phase名    | 品質検証                                                                                       |
| タスクID   | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001                                               |
| 前提Phase  | Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認）、Phase 8（リファクタリング） |
| 後続Phase  | Phase 10（最終レビュー）                                                                       |
| ステータス | not_started                                                                                    |
| 作成日     | 2026-03-13                                                                                     |
| 更新日     | 2026-03-19                                                                                     |
| 機能名     | rag-embedding-extraction-runtime                                                               |

## 目的

backend AI surface の guidance / fail-fast / state 整合を確認する。AI runtime 統合後のコードに silent fallback、誤成功表示、partial failure が残存していないことを品質ゲートで検証する。

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断 | 仕様参照先                                                                                                                         |
| ------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | 適用     | API key がエラーメッセージやログに露出していないこと。`.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` |
| アーキテクチャ     | 適用     | RAG pipeline の責務境界が Phase 8 後も維持されていること。`architecture-rag.md`                                                    |
| API設計            | 適用     | IPC handler のレスポンス形式が仕様通りであること。`api-ipc-system.md`                                                              |
| エラーハンドリング | 適用     | fail-fast / guidance パターンが正しく機能すること。`.claude/skills/aiworkflow-requirements/references/quality-requirements.md`     |
| パフォーマンス     | 適用     | long-running job（index job）が仕様どおりに timeout / cancel state へ遷移すること。`rag-query-pipeline.md`                         |

## 実行タスク

- 基本品質ゲート: Lint / 型チェック / 全テストを実行する
- 異常系監査: silent fallback、誤成功表示、partial failure を検証する
- 状態・guidance 監査: job state、guidance、capability の一致を確認する
- 仮実装残存確認: mock / stub / placeholder / TODO を確認する
- 一括判定: 品質ゲート結果と証跡を 3 種の成果物へ出力する

### Task 1: Lint / 型チェック / 全テスト実行

品質ゲートの基本3項目を実行する。

```bash
# 1. Lint
pnpm lint

# 2. 型チェック
pnpm typecheck

# 3. 全テスト実行
pnpm --dir packages/shared exec vitest run
pnpm --dir apps/desktop exec vitest run src/main/ipc/aiHandlers.test.ts
pnpm --dir apps/desktop exec vitest run src/main/ipc/communityHandlers.test.ts
```

全項目 PASS を確認してから Task 2 に進む。失敗がある場合は Phase 8 に戻って修正する。

### Task 2: silent fallback の検出

AI runtime 統合後のコードに、エラーを握りつぶして別の値を返す silent fallback が残存していないか検証する。

#### 検出コマンド

```bash
# terminal fallback パターン（エラー時に黙ってデフォルト値を返すコード）
grep -rn "fallback.*terminal\|terminal.*fallback" packages/shared/src/services/
grep -rn "catch.*return\s*\[\]\|catch.*return\s*null\|catch.*return\s*undefined" packages/shared/src/services/embedding/ packages/shared/src/services/search/ packages/shared/src/services/extraction/ packages/shared/src/services/graph/
grep -rn "catch.*return\s*{" apps/desktop/src/main/ipc/aiHandlers.ts apps/desktop/src/main/ipc/communityHandlers.ts

# 空 catch ブロック
grep -rn "catch\s*(" packages/shared/src/services/embedding/ packages/shared/src/services/search/ packages/shared/src/services/extraction/ packages/shared/src/services/graph/ -A 2 | grep -E "^\s*\}"
```

#### 判定基準

- catch ブロック内で `return []` / `return null` / `return {}` しているコードは silent fallback の疑いあり
- エラーログを出力せずにデフォルト値を返すコードは修正対象
- 意図的な fallback（設計書に記載あり）は許容するが、コメントで理由を明記すること

### Task 3: 誤成功表示の検出

処理が実際には失敗しているにもかかわらず、`success: true` やエラーなしのレスポンスを返すパターンを検出する。

```bash
# success: true を返すが実際にはエラーが発生しうるパターン
grep -rn "success:\s*true" apps/desktop/src/main/ipc/aiHandlers.ts apps/desktop/src/main/ipc/communityHandlers.ts -B 5

# partial result を成功として返すパターン
grep -rn "partial\|incomplete" packages/shared/src/services/embedding/ packages/shared/src/services/search/ -A 3
```

#### 判定基準

- embedding 生成が一部失敗しても `success: true` を返すコードは修正対象
- RAG クエリが部分的にしか結果を返せなかった場合のステータスが正確であること
- graph summary が不完全でも成功扱いになっていないこと

### Task 4: partial failure の検出

複数ドキュメントの embedding 生成を含むバッチ処理で一部失敗した場合の挙動を検証する。

#### 検証観点

- embedding-pipeline: 10件中3件が失敗した場合のレスポンス形式
- entity-extractor / relation-extractor: 抽出片系失敗時の error propagation と guidance
- hybrid-rag-engine: 複数検索ソースのうち1つが失敗した場合の挙動
- community-summarizer: 一部コミュニティの要約が失敗した場合の挙動

#### 判定基準

- partial failure のレスポンスに失敗件数と失敗理由が含まれていること
- 成功分の結果は正しく返却されること
- 全件失敗の場合はエラーレスポンスを返すこと

### Task 5: job 状態整合性の検証

index job のライフサイクル（pending -> running -> completed/failed）が正しく管理されているか検証する。

#### 検証観点

- job がタイムアウトした場合に状態が `failed` に遷移すること
- job キャンセル時に中間状態（`running`）のまま放置されないこと
- 並行して同じドキュメントの index job が起動されないこと（排他制御）

### Task 6: guidance 表示の正確性検証

ユーザーに表示されるガイダンスメッセージが実態と一致しているか検証する。

#### 検証観点

- Provider / Model 未設定時のガイダンスが正しく表示されること
- API key 無効時のエラーメッセージが適切であること（P55 準拠: パス情報が漏洩しない）
- capability が不足している場合のメッセージが具体的であること（`embedding 未対応` / `reranking 未対応` / `CRAG 未対応`）

### Task 7: capability 表示と実態の一致検証

Phase 1 で定義した capability matrix と、実際のコードの挙動が一致しているか検証する。

```bash
# capability 関連のコードを検索
grep -rn "capability\|isSupported\|isAvailable" packages/shared/src/services/embedding/ packages/shared/src/services/search/
grep -rn "canEmbed\|canSearch\|canSummarize" apps/desktop/src/main/ipc/
```

#### 判定基準

- capability `true` のサービスが実際に動作すること
- capability `false` のサービスが適切なエラーを返すこと（silent fallback でないこと）
- capability 判定ロジックが provider / model の組み合わせを正しく評価していること

### Task 8: mock / stub / placeholder 残存の最終確認

開発中の仮実装が残存していないか検証する。

```bash
# mock / stub / placeholder の残存検出
grep -rn "mock\|stub\|placeholder" packages/shared/src/services/embedding/ packages/shared/src/services/search/ packages/shared/src/services/extraction/ packages/shared/src/services/graph/
grep -rn "TODO\|FIXME\|HACK\|XXX" packages/shared/src/services/embedding/ packages/shared/src/services/search/ packages/shared/src/services/extraction/ packages/shared/src/services/graph/
grep -rn "mock\|stub\|placeholder" apps/desktop/src/main/ipc/aiHandlers.ts apps/desktop/src/main/ipc/communityHandlers.ts
```

#### 判定基準

- テストファイル以外に mock / stub / placeholder が存在しないこと
- TODO / FIXME コメントがある場合は、未タスク化されていること
- ハードコードされたテスト用の値（ダミー API key、固定 provider id、固定 model id）が残存していないこと

### Task 9: 品質ゲート一括判定

Task 1-8 の結果を集約し、品質ゲートの合否を一括判定する。

#### 判定テーブル

| 検証項目        | 判定基準                   | PASS条件          |
| --------------- | -------------------------- | ----------------- |
| Lint            | エラー 0件                 | 0 errors          |
| 型チェック      | エラー 0件                 | 0 errors          |
| テスト          | 全 PASS                    | 0 failures        |
| silent fallback | 意図しない fallback 0件    | 0 unintended      |
| 誤成功表示      | false success 0件          | 0 false positives |
| partial failure | 適切なハンドリング確認     | all handled       |
| job 状態整合性  | 不整合 0件                 | 0 inconsistencies |
| guidance 正確性 | 不正確なメッセージ 0件     | 0 inaccurate      |
| capability 一致 | matrix と実態の不一致 0件  | 0 mismatches      |
| mock 残存       | プロダクションコード内 0件 | 0 remaining       |

全項目 PASS の場合のみ Phase 10 に進む。1項目でも FAIL の場合は、該当 Phase に戻って修正する。

## 実行手順

### ステップ 1: 基本品質ゲートを実行する

Lint、型チェック、回帰テストを順に実行し、失敗があれば Phase 8 へ戻す前提で証跡を残す。

### ステップ 2: 異常系を横断監査する

silent fallback、誤成功表示、partial failure を grep とテスト結果で確認し、各サービスの責務境界が崩れていないか確認する。

### ステップ 3: state / guidance / capability の整合を確認する

job 状態遷移、表示メッセージ、provider capability と実動作の一致を確認し、食い違いがあれば FAIL とする。

### ステップ 4: 品質成果物を出力する

まず `qa-checklist.md` に Task 1-9 の判定母体を整理し、その結果をもとに品質総括を `quality-report.md`、セキュリティ・露出確認を `security-check.md`、コマンド実行履歴を `test-execution-log.md` に記録する。

## 参照資料

| 参照資料                         | パス                                                                                    | 内容                                                 |
| -------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Phase 5（実装）                  | `phase-5-implementation.md`                                                             | 実配線後の品質観点を確認する                         |
| Phase 8（リファクタ）            | `phase-8-refactoring.md`                                                                | リファクタリング後の構造を確認する                   |
| aiHandlers                       | `apps/desktop/src/main/ipc/aiHandlers.ts`                                               | job 状態と guidance 表示を確認する                   |
| communityHandlers                | `apps/desktop/src/main/ipc/communityHandlers.ts`                                        | community summary quality を確認する                 |
| llm-query-classifier             | `packages/shared/src/services/search/llm-query-classifier.ts`                           | query classifier の品質を確認する                    |
| entity-extractor                 | `packages/shared/src/services/extraction/entity-extractor.ts`                           | entity extraction の品質を確認する                   |
| relation-extractor               | `packages/shared/src/services/extraction/relation-extractor.ts`                         | relation extraction の品質を確認する                 |
| hybrid-rag-engine                | `packages/shared/src/services/search/hybrid-rag-engine.ts`                              | silent fallback / partial failure 観点を確認する     |
| embedding-service                | `packages/shared/src/services/embedding/embedding-service.ts`                           | embedding 品質を確認する                             |
| embedding-pipeline               | `packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts`                 | pipeline 品質を確認する                              |
| community-summarizer             | `packages/shared/src/services/graph/community-summarizer.ts`                            | graph summary 品質を確認する                         |
| relevance-evaluator              | `packages/shared/src/services/search/crag/relevance-evaluator.ts`                       | 関連度評価の品質を確認する                           |
| cross-encoder-reranker           | `packages/shared/src/services/search/reranking/cross-encoder-reranker.ts`               | reranking 品質を確認する                             |
| architecture-rag                 | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                 | RAG アーキテクチャ仕様                               |
| rag-services                     | `.claude/skills/aiworkflow-requirements/references/rag-services.md`                     | RAG サービス仕様                                     |
| rag-query-pipeline               | `.claude/skills/aiworkflow-requirements/references/rag-query-pipeline.md`               | RAG クエリパイプライン仕様                           |
| api-ipc-system                   | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                   | IPC システム仕様                                     |
| llm-embedding                    | `.claude/skills/aiworkflow-requirements/references/llm-embedding.md`                    | LLM/Embedding 仕様                                   |
| interfaces-rag-entity-extraction | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-entity-extraction.md` | extraction 契約と品質判定を確認する                  |
| error-handling                   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                   | fail-fast / explicit error propagation を確認する    |
| security-electron-ipc            | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`            | IPC 入力検証、秘密情報非露出を確認する               |
| quality-requirements             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`             | 品質ゲート、coverage、silent fallback 排除を確認する |

## 統合テスト連携

silent fallback、誤成功表示、partial failure、query classifier、entity / relation extraction の fail-fast を横断観点で確認する。各サービス単体の検証に加え、aiHandlers / communityHandlers を起点とした統合的な品質検証を実施する。

## サブタスク管理

Phase 9 実行開始時に以下のサブタスクを作成すること:

- [ ] ST-9-1: Lint / 型チェック / 全テスト実行（Task 1）
- [ ] ST-9-2: silent fallback 検出（Task 2）
- [ ] ST-9-3: 誤成功表示検出（Task 3）
- [ ] ST-9-4: partial failure 検出（Task 4）
- [ ] ST-9-5: job 状態整合性検証（Task 5）
- [ ] ST-9-6: guidance 表示の正確性検証（Task 6）
- [ ] ST-9-7: capability 表示と実態の一致検証（Task 7）
- [ ] ST-9-8: mock / stub / placeholder 残存確認（Task 8）
- [ ] ST-9-9: 品質ゲート一括判定と quality / security / test log 作成（Task 9）

## 成果物

| 成果物            | パス                                    | 内容                                               |
| ----------------- | --------------------------------------- | -------------------------------------------------- |
| QA チェックリスト | `outputs/phase-9/qa-checklist.md`       | 品質観点と確認項目を整理する                       |
| 品質総括          | `outputs/phase-9/quality-report.md`     | 各検証項目の PASS / FAIL 判定と総合結果を記録する  |
| セキュリティ確認  | `outputs/phase-9/security-check.md`     | API key 露出、ログ、メッセージ整合を確認する       |
| テスト実行ログ    | `outputs/phase-9/test-execution-log.md` | 実行コマンド、対象、結果、失敗時の戻り先を記録する |

## 完了条件

- [ ] Lint / 型チェック / 全テストが PASS している
- [ ] silent fallback と誤成功表示の検出観点が含まれている
- [ ] partial failure のハンドリングが仕様どおりであることが確認されている
- [ ] job 状態整合性の検証が完了している
- [ ] guidance 表示が実態と一致していることが確認されている
- [ ] capability 表示と実態が一致していることが確認されている
- [ ] mock / stub / placeholder がプロダクションコードに残存していないことが確認されている
- [ ] 品質ゲート一括判定で全項目 PASS している
- [ ] `qa-checklist.md` が Task 1-9 の判定母体として生成されている
- [ ] `quality-report.md` / `security-check.md` / `test-execution-log.md` が生成されている
- [ ] artifacts.json が更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

検証コマンド:

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime --phase 9
```

## 次のPhase

- [Phase 10（最終レビュー）](./phase-10-final-review.md) に進む
