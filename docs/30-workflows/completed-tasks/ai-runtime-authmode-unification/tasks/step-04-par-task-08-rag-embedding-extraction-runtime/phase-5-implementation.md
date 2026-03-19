# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                 |
| ---------- | ------------------------------------------------------------------------------------ |
| Phase      | 5                                                                                    |
| Phase名    | 実装                                                                                 |
| タスクID   | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001                                     |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 3（設計レビュー）、Phase 4（テスト作成） |
| 後続Phase  | Phase 6（テスト拡充）                                                                |
| ステータス | not_started                                                                          |
| 作成日     | 2026-03-13                                                                           |
| 更新日     | 2026-03-19                                                                           |
| 機能名     | rag-embedding-extraction-runtime                                                     |

## 目的

Phase 4 で設計したテストを Green にするための実装を行う。Main 側・shared 側・失敗系の変更順序を具体化し、capability matrix と guidance の AI runtime 統合を完了する。

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断 | 仕様参照先                                                                                                                                            |
| ------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | 適用     | API key は Main Process でのみ取り扱い、Renderer に漏洩しないこと（`.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`）     |
| アーキテクチャ     | 適用     | RAG pipeline の依存方向（Renderer -> Preload -> Main -> shared）を維持する（`.claude/skills/aiworkflow-requirements/references/architecture-rag.md`） |
| API設計            | 適用     | IPC handler の register/unregister ペアを確認する（P5対策）                                                                                           |
| エラーハンドリング | 適用     | fail-fast: unsupported capability は即座にエラー返却。guidance: 代替案を含むエラーメッセージ                                                          |
| パフォーマンス     | 適用     | long-running job は非同期で処理し、進捗を IPC イベントで通知する                                                                                      |

## 事前確認【必須】

### 既存テスト回帰確認の先行実行

変更対象ファイルの既存テストを先に実行して baseline を確認する。

```bash
# Main 側の既存テスト baseline
pnpm --dir apps/desktop exec vitest run src/main/ipc/aiHandlers.test.ts 2>&1 | tail -20

# shared 側の既存テスト baseline
pnpm --dir packages/shared exec vitest run src/services/search/hybrid-rag-engine.test.ts 2>&1 | tail -20
pnpm --dir packages/shared exec vitest run src/services/embedding/pipeline/embedding-pipeline.test.ts 2>&1 | tail -20
```

全テストが PASS することを確認してから実装に着手する。失敗がある場合は先に修正する。

### IPC ハンドラ register/unregister ペアの確認（P5対策）

```bash
# 既存の register/unregister パターンを確認
grep -rn "ipcMain.handle\|ipcMain.removeHandler" apps/desktop/src/main/ipc/aiHandlers.ts

# 二重登録防止パターンの有無を確認
grep -rn "safeRegister\|unregisterAll" apps/desktop/src/main/ipc/aiHandlers.ts
```

新規ハンドラ追加時は必ず unregister 関数にも追加する。

## 実行タスク

- Main 側整理: `AI_CHECK_CONNECTION` / `AI_INDEX` / community summary の AI runtime 統合順序を固定する
- shared 側整理: embedding / search / extraction / graph summary の AI runtime 注入境界を整理する
- 失敗系整理: unsupported capability / job failure / provider failure の扱いを統一する

### Task 1: Main 側整理

`AI_CHECK_CONNECTION` / `AI_INDEX` / community summary の変更を以下の順序で実施する:

| ステップ | 変更対象                      | 変更内容                                                   |
| -------- | ----------------------------- | ---------------------------------------------------------- |
| 1-1      | `aiHandlers.ts`               | capability matrix チェックを AI runtime 経由に統一する     |
| 1-2      | `AI_CHECK_CONNECTION` handler | provider の connection check を統合 runtime API で実行する |
| 1-3      | `AI_INDEX` handler            | index ジョブの起動を統合 runtime API で実行する            |
| 1-4      | community summary handler     | graph summary の AI 呼び出しを統合 runtime API で実行する  |

各ステップ完了後にテストを実行し、Red -> Green を確認する。

### Task 2: shared 側整理

embedding / classifier / extraction / graph summary の変更を以下の順序で実施する:

| ステップ | 変更対象                | 変更内容                                          |
| -------- | ----------------------- | ------------------------------------------------- |
| 2-1      | `embedding-pipeline.ts` | embedding 呼び出しを AI runtime 経由に変更する    |
| 2-2      | `hybrid-rag-factory.ts` | search runtime の組み立てで AI runtime を注入する |
| 2-3      | `hybrid-rag-engine.ts`  | reranking / CRAG の AI 呼び出しを統合する         |
| 2-4      | extraction service      | document extraction の AI 呼び出しを統合する      |
| 2-5      | graph summary           | community-summarizer の AI 呼び出しを統合する     |

### Task 3: 失敗系整理

unsupported capability / job failure / provider failure の反映を以下の順序で実施する:

| ステップ | 変更対象                  | 変更内容                                                 |
| -------- | ------------------------- | -------------------------------------------------------- |
| 3-1      | capability validation     | unsupported capability の fail-fast エラー返却を実装する |
| 3-2      | job failure handling      | job 失敗時の状態遷移とエラー伝播を実装する               |
| 3-3      | provider failure handling | provider 障害時の retry / fallback / guidance を実装する |

## 参照資料

| 参照資料                         | パス                                                                                    | 内容                                                     |
| -------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Phase 2（設計）                  | `phase-2-design.md`                                                                     | 変更順序の前提を確認する                                 |
| Phase 4（テスト作成）            | `phase-4-test-creation.md`                                                              | 実装前の test matrix を確認する                          |
| aiHandlers                       | `apps/desktop/src/main/ipc/aiHandlers.ts`                                               | Main 側変更点を確認する                                  |
| llm-query-classifier             | `packages/shared/src/services/search/llm-query-classifier.ts`                           | query classifier の変更点を確認する                      |
| embedding-pipeline               | `packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts`                 | embedding pipeline の変更点を確認する                    |
| entity-extractor                 | `packages/shared/src/services/extraction/entity-extractor.ts`                           | entity extraction の変更点を確認する                     |
| relation-extractor               | `packages/shared/src/services/extraction/relation-extractor.ts`                         | relation extraction の変更点を確認する                   |
| community-summarizer             | `packages/shared/src/services/graph/community-summarizer.ts`                            | graph summary の変更点を確認する                         |
| hybrid-rag-factory               | `packages/shared/src/services/search/hybrid-rag-factory.ts`                             | search runtime 組み立て点を確認する                      |
| api-ipc-system-core              | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`              | `AI_CHECK_CONNECTION` / `AI_INDEX` の job 契約を確認する |
| interfaces-rag-entity-extraction | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-entity-extraction.md` | extraction 契約を確認する                                |
| rag-services                     | `.claude/skills/aiworkflow-requirements/references/rag-services.md`                     | classifier / extraction / community 契約を確認する       |
| error-handling                   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                   | fail-fast / guidance / retry 契約を確認する              |
| architecture-rag                 | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                 | service 境界と依存方向を確認する                         |
| コード品質ルール                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`             | エラーハンドリング・型安全を確認する                     |
| セキュリティルール               | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`            | IPC セキュリティ原則を確認する                           |

## 実行手順

### ステップ1: baseline と事前確認を固定する

既存テスト baseline と register/unregister パターンを確認し、Phase 5 で壊してはいけない前提を明文化する。

### ステップ2: Main 側の runtime 配線を実装する

`aiHandlers.ts` を中心に、legacy health check と index job の責務境界を保ちながら配線する。

### ステップ3: shared 側の runtime 配線を実装する

embedding / extraction / graph / search サービスに capability 判定、guidance、error propagation を反映する。

### ステップ4: 失敗系と guidance を整合させる

unsupported capability、provider failure、timeout、job failure を fail-fast 契約へ揃える。

### ステップ5: 回帰確認と成果物更新を行う

既存テストと artifacts を更新し、`implementation-plan.md` と `implementation-log.md` に baseline / after / changed files / unresolved事項を残して次の Phase へ handoff する。

## 統合テスト連携

Main、shared pipeline、IPC を跨ぐ capability matrix と guidance の変更順序を固定する。

## サブタスク管理

Phase 5 実行開始時に以下のサブタスクを作成する:

- [ ] ST-5-1: 既存テスト回帰確認（baseline 取得）
- [ ] ST-5-2: Main 側実装（aiHandlers の AI runtime 統合）
- [ ] ST-5-3: shared 側実装（embedding / RAG / extraction の AI runtime 統合）
- [ ] ST-5-4: 失敗系実装（unsupported capability / job failure / provider failure）
- [ ] ST-5-5: 全テスト PASS 確認
- [ ] ST-5-6: 実装ログ作成（baseline / after / changed files / unresolved事項）

## 成果物

| 成果物   | パス                                     | 内容                                                        |
| -------- | ---------------------------------------- | ----------------------------------------------------------- |
| 実装計画 | `outputs/phase-5/implementation-plan.md` | 変更順序、影響範囲、ロールバック観点を整理する              |
| 実装ログ | `outputs/phase-5/implementation-log.md`  | baseline / after / changed files / unresolved事項を記録する |

## 完了条件

- [ ] Main / shared / IPC の変更順序が定義されている
- [ ] 既存テストの回帰確認が完了している（baseline PASS）
- [ ] IPC ハンドラの register/unregister ペアが確認されている（P5対策）
- [ ] Phase 4 で作成したテストが全て Green になっている
- [ ] capability matrix の全対象 provider で正常系・異常系が動作する
- [ ] `implementation-log.md` に baseline / after / changed files / unresolved事項が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

検証コマンド:

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime --phase 5
```

## 次のPhase

- [Phase 6（テスト拡充）](./phase-6-test-expansion.md) に進む
