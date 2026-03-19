# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 3                                                |
| Phase名    | 設計レビュー                                     |
| タスクID   | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001 |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）             |
| 後続Phase  | Phase 4（テスト作成）                            |
| ステータス | not_started                                      |
| 作成日     | 2026-03-13                                       |
| 更新日     | 2026-03-19                                       |
| 機能名     | rag-embedding-extraction-runtime                 |

## 目的

backend AI surface の capability 設計が矛盾なく一貫しているか確認し、Phase 4 以降へ進む判定を行う。

## 実行タスク

- レビュー runner 実行: `run-review-task.js --runner codex` で共通 `review-prompt.txt` を生成し、同一入力で設計レビューを実施する
- レビュー実施: レビュー観点に沿って PASS / MINOR / MAJOR の判定根拠を整理する
- simpler alternative 検討: より単純な設計代替案がないか検討し結果を記録する
- 契約品質確認: 前提条件/事後条件、Port/Interface 依存、DI 境界表、受入基準トレーサビリティを追加確認する
- MINOR 追跡計画: MINOR 指摘がある場合、解決予定 Phase を設定する

## レビュー観点

- surface ごとの capability 区分が曖昧でないか（`api-key-only` と `guidance-only` の境界が明確か）
- production mock / TODO が残ったまま成功経路に入らないか
- terminal surface や consumer subscription への silent fallback が紛れ込まないか
- long-running index job の失敗と guidance が不足していないか
- concern topology の 3 lane 分割が責務境界として妥当か
- error policy が unsupported / rate limit / timeout / job failure / provider failure の 5 パターンを網羅しているか
- UI/UX 契約が pack 正本（`ui-ux-realization.md`）と整合しているか
- Task01 の access matrix を消費しており、独自 mode 判定が混入していないか
- 各契約の前提条件/事後条件が `contract-matrix.md` で明示されているか
- IPC ハンドラの依存が具象ではなく Port/Interface 境界で記述されているか
- DI 境界表が layer ごとに整理されているか
- Phase 1 の受入基準と Phase 2 の設計要素が 1:1 で追跡できるか

## レビューゲート

設計レビューの判定基準は `.claude/skills/task-specification-creator/references/review-gate-criteria.md` に従う。

| 判定  | 条件                     | 次のアクション            |
| ----- | ------------------------ | ------------------------- |
| PASS  | 重大な問題がない         | Phase 4 に進む            |
| MINOR | 軽微な指摘がある         | 指摘を記録して Phase 4 へ |
| MAJOR | 戻り先が必要な問題がある | 下表の戻り先へ戻す        |

| 問題の種類                                 | 戻り先              |
| ------------------------------------------ | ------------------- |
| 要件の問題（AC 不足）                      | Phase 1（要件定義） |
| 設計の問題（topology / capability matrix） | Phase 2（設計）     |

### MINOR 追跡テーブル

Phase 3 で MINOR 判定された指摘は、以下のテーブルで追跡計画を明示する。

| MINOR ID | 指摘内容 | 解決予定Phase | 解決確認Phase | 備考 |
| -------- | -------- | ------------- | ------------- | ---- |
| RAG-M-01 | ...      | Phase 5       | Phase 9/10    | ...  |

- 「解決予定Phase」を Phase 3 時点で決定し、追跡の見通しを立てる
- 「解決確認Phase」は Phase 9（品質検証）または Phase 10（最終レビュー）で記録する

## Phase 4 開始条件

- Phase 3 の判定が PASS または MINOR であること
- MAJOR 判定がある場合は戻り先 Phase の再実行が必要
- Phase 13 は Phase 3 PASS 後も blocked（user approval 待ち）

## 参照資料

### 前提 Phase

| 参照資料            | パス                      | 内容                            |
| ------------------- | ------------------------- | ------------------------------- |
| Phase 1（要件定義） | `phase-1-requirements.md` | capability inventory を確認する |
| Phase 2（設計）     | `phase-2-design.md`       | 設計成果物を確認する            |

### ソースコード

| 参照資料             | パス                                                            | 内容                                                  |
| -------------------- | --------------------------------------------------------------- | ----------------------------------------------------- |
| aiHandlers           | `apps/desktop/src/main/ipc/aiHandlers.ts`                       | `AI_CHECK_CONNECTION` / `AI_INDEX` の TODO を確認する |
| communityHandlers    | `apps/desktop/src/main/ipc/communityHandlers.ts`                | community summary mock の現状を確認する               |
| embedding-service    | `packages/shared/src/services/embedding/embedding-service.ts`   | embedding 実行サービスを確認する                      |
| llm-query-classifier | `packages/shared/src/services/search/llm-query-classifier.ts`   | query classifier の契約境界を確認する                 |
| entity-extractor     | `packages/shared/src/services/extraction/entity-extractor.ts`   | entity extraction の契約境界を確認する                |
| relation-extractor   | `packages/shared/src/services/extraction/relation-extractor.ts` | relation extraction の契約境界を確認する              |

### システム仕様（aiworkflow-requirements）

| 参照資料                         | パス                                                                                    | 内容                                                    |
| -------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| api-ipc-system                   | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                   | `AI_CHECK_CONNECTION` / `AI_INDEX` の正本               |
| api-ipc-system-core              | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`              | `AI_CHECK_CONNECTION` legacy 方針と `AI_INDEX` job 契約 |
| llm-embedding                    | `.claude/skills/aiworkflow-requirements/references/llm-embedding.md`                    | embedding provider / pipeline 契約の正本                |
| architecture-rag                 | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                 | RAG / graph / search 正本                               |
| interfaces-rag                   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag.md`                   | entity / relation extraction と GraphRAG の上位契約     |
| interfaces-rag-entity-extraction | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-entity-extraction.md` | `IEntityExtractor` と fallback 抽出器の契約             |
| rag-services                     | `.claude/skills/aiworkflow-requirements/references/rag-services.md`                     | classifier / extraction / community 関連の正本          |
| rag-query-pipeline               | `.claude/skills/aiworkflow-requirements/references/rag-query-pipeline.md`               | GraphRAG / HybridRAG の正本                             |
| error-handling                   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                   | fail-fast / explicit error propagation の正本           |
| security-electron-ipc            | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`            | IPC 入力検証、秘密情報非露出、guidance-only 契約        |
| quality-requirements             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`             | silent fallback 排除、coverage、品質ゲート基準          |

## 実行手順

### ステップ1: Phase 1 / Phase 2 成果物を確認する

要件定義の capability inventory と設計の capability matrix / concern topology / error policy を確認する。

### ステップ2: review runner と prompt artifact を生成する

`run-review-task.js` を `codex` runner で実行し、レビュー入力を `outputs/phase-3/review-prompt.txt` に固定する。

```bash
node .claude/skills/task-specification-creator/scripts/run-review-task.js \
  --runner codex \
  --phase 3 \
  --workflow docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime \
  --output-prompt docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/outputs/phase-3/review-prompt.txt
```

### ステップ3: レビュー観点に沿ってレビューを実施する

12 のレビュー観点を 1 つずつ確認し、PASS / MINOR / MAJOR の判定根拠を記録する。

### ステップ4: simpler alternative を検討する

より単純な設計代替案がないか検討し、検討結果を記録する。採用しなかった場合はその理由を明記する。

### ステップ5: 契約品質チェックを実施する

`review-gate-criteria.md` に従い、前提条件/事後条件、Port/Interface 依存、DI 境界表、受入基準トレーサビリティを追加確認する。

### ステップ6: MINOR 追跡テーブルを作成する

MINOR 指摘がある場合、解決予定 Phase を設定し追跡テーブルに記録する。

### ステップ7: ゲート判定と成果物を記録する

最終判定（PASS / MINOR / MAJOR）を記録し、Phase 4 開始条件の充足を確認する。

## 統合テスト連携

AI_INDEX、check connection、embedding、query classifier、extraction、graph summary の設計が Phase 1 と Phase 2 に整合するかをレビューする。3 lane 境界を跨ぐ統合テスト観点を確認する。

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                             | 仕様参照先                                          |
| ------------------ | ------------------------------------ | --------------------------------------------------- |
| セキュリティ       | API key / provider 認証の設計妥当性  | `aiworkflow-requirements: security-api-electron.md` |
| アーキテクチャ     | concern topology / lane 分割の妥当性 | `aiworkflow-requirements: architecture-rag.md`      |
| API設計            | IPC handler / resolver の設計整合性  | `aiworkflow-requirements: api-ipc-system.md`        |
| エラーハンドリング | error policy 5 パターンの網羅性      | `aiworkflow-requirements: error-handling.md`        |

## 成果物

| 成果物             | パス                                      | 内容                                                           |
| ------------------ | ----------------------------------------- | -------------------------------------------------------------- |
| 設計レビュー報告   | `outputs/phase-3/design-review-report.md` | PASS / MINOR / MAJOR の判定根拠と MINOR 追跡テーブルを記録する |
| レビュープロンプト | `outputs/phase-3/review-prompt.txt`       | `run-review-task.js` が生成する共通 review 入力                |

## 完了条件

- [ ] MAJOR 指摘 0 件
- [ ] Task01 契約との矛盾がない
- [ ] simpler alternative の検討結果が記録されている
- [ ] review runner の `review-prompt.txt` が生成されている
- [ ] 前提条件/事後条件、Port/Interface 依存、DI 境界表、受入基準トレーサビリティが確認されている
- [ ] MINOR 指摘がある場合、追跡テーブルに解決予定 Phase が設定されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. Phase 1 / Phase 2 成果物の確認
2. review runner 実行と `review-prompt.txt` 生成
3. レビュー観点のレビュー実施
4. simpler alternative の検討
5. 契約品質チェックの実施
6. MINOR 追跡テーブルの作成（該当する場合）
7. ゲート判定の記録
8. 成果物の作成・配置
9. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime --phase 3
```

## 次のPhase

- [Phase 4（テスト作成）](./phase-4-test-creation.md) に進む
- Phase 1-3 完了前に Phase 4 へは進まない
