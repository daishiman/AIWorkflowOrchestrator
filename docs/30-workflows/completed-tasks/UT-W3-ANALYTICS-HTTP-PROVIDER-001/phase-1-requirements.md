# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 1                                                    |
| 機能名     | UT-W3-ANALYTICS-HTTP-PROVIDER-001                    |
| タスク名   | 本番 analytics HTTP 送信実装（外部分析基盤への接続） |
| 前提Phase  | -                                                    |
| 後続Phase  | Phase 2                                              |
| 作成日     | 2026-04-13                                           |
| ステータス | pending                                              |

## 目的

`analyticsHandler.ts` Line 106 の TODO を実装し、Renderer からの analytics イベントを外部分析基盤（HTTP エンドポイント）へ実際に送信できるよう要件を固定する。

## 背景

UT-W3-ANALYTICS-ADAPTER-001 で analytics の IPC パイプライン（Renderer → preload → Main）は完成した。Main プロセス側の `analyticsHandler.ts` でオプトアウトをパスしたイベントはコンソール出力のみで、実際の外部送信は未実装（TODO コメント残存）。

```ts
// apps/desktop/src/main/ipc/analyticsHandler.ts:106
// TODO: 本番環境での HTTP 送信実装（外部分析基盤への接続）
// await sendToAnalyticsProvider({ eventName, payload, timestamp });
```

## タスク分類

| 項目         | 値                                       |
| ------------ | ---------------------------------------- |
| タスク分類   | non-ui-task（UI変更なし）                |
| IPC変更      | なし（既存 analytics:send チャネル使用） |
| 新規内部関数 | `sendToAnalyticsProvider` 関数のみ       |
| 環境変数追加 | `ANALYTICS_ENDPOINT_URL`                 |

## SubAgentチーム編成

| SubAgent   | 関心ごと          | 主担当                                |
| ---------- | ----------------- | ------------------------------------- |
| SubAgent-A | Main プロセス責務 | analyticsHandler, HTTP 送信設計       |
| SubAgent-B | 設定・環境変数    | 環境変数設計、設定管理                |
| SubAgent-C | テスト・品質      | HTTP モック、エラーハンドリングテスト |
| SubAgent-D | 統合監査          | IPC 契約整合、依存整合                |

## 機能要件

| ID    | 要件                                                                        |
| ----- | --------------------------------------------------------------------------- |
| FR-01 | `NODE_ENV === "production"` 時に `ANALYTICS_ENDPOINT_URL` へ HTTP POST する |
| FR-02 | リクエストボディは `{ eventName, payload, timestamp }` の JSON              |
| FR-03 | タイムアウトは 5000ms（AbortController 使用）                               |
| FR-04 | HTTP 送信失敗時はエラーを握り潰し、IPC 応答を壊さない                       |
| FR-05 | `ANALYTICS_ENDPOINT_URL` が未設定の場合は静かにスキップする                 |
| FR-06 | 既存のオプトアウト二重防衛構造（Renderer + Main）を破らない                 |

## 非機能要件

| ID     | 要件                                                                     |
| ------ | ------------------------------------------------------------------------ |
| NFR-01 | 送信失敗がアプリケーション全体を壊さないこと（エラー非伝播設計）         |
| NFR-02 | `pnpm typecheck && pnpm lint && pnpm test` が PASS すること              |
| NFR-03 | 既存 `AnalyticsSendRequest` / `AnalyticsSendResponse` 型を変更しないこと |
| NFR-04 | テスト時は `global.fetch` をモックして実際の HTTP 通信を行わないこと     |

## 実行タスク

- 要件抽出: 既存コードと carry-over 仕様から機能要件・非機能要件を抽出する
- aiworkflow仕様抽出: resource-map 起点で analytics / IPC / error-handling 仕様を抽出する
- 受け入れ基準化: 矛盾なし・漏れなし・整合ありの判定基準を定義する
- 命名規則確認: 既存 analyticsHandler.ts の命名パターン（camelCase）を確認する

## 参照資料

### 実装・コード

| 資料名             | パス                                                                                                     | 用途                        |
| ------------------ | -------------------------------------------------------------------------------------------------------- | --------------------------- |
| analyticsHandler   | `apps/desktop/src/main/ipc/analyticsHandler.ts`                                                          | TODO 実装対象・既存構造確認 |
| IPC チャネル定義   | `apps/desktop/src/preload/channels.ts`                                                                   | ANALYTICS_SEND チャネル確認 |
| 前タスク実装ガイド | `docs/30-workflows/completed-tasks/UT-W3-ANALYTICS-ADAPTER-001/outputs/phase-12/implementation-guide.md` | 前タスクの設計思想確認      |
| 未タスク仕様書     | `docs/30-workflows/unassigned-task/UT-W3-ANALYTICS-HTTP-PROVIDER-001.md`                                 | carry-over 仕様確認         |

### システム仕様（aiworkflow-requirements）

| 資料名                 | パス                                                                                        | 用途                        |
| ---------------------- | ------------------------------------------------------------------------------------------- | --------------------------- |
| Analytics IPC 仕様     | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | analytics:send チャネル仕様 |
| エラーハンドリング     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラー非伝播設計            |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Main プロセス設計パターン   |
| 品質要件               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 品質ゲート基準              |
| タスク運用             | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 台帳同期ルール              |

## 受け入れ基準

| ID    | 基準                                                                                | 検証方法          |
| ----- | ----------------------------------------------------------------------------------- | ----------------- |
| AC-01 | `NODE_ENV=production` かつ `ANALYTICS_ENDPOINT_URL` 設定時に HTTP POST が呼ばれる   | Unit Test         |
| AC-02 | `NODE_ENV` が production 以外の場合は HTTP POST を呼ばない                          | Unit Test         |
| AC-03 | `ANALYTICS_ENDPOINT_URL` 未設定時は HTTP POST を呼ばずに `{ success: true }` を返す | Unit Test         |
| AC-04 | fetch タイムアウト（5000ms）後も `success: true` を返し、例外を外へ出さない         | Unit Test         |
| AC-05 | fetch 例外発生時も `success: true` を返し、例外を外へ出さない                       | Unit Test         |
| AC-06 | オプトアウト時は HTTP POST を呼ばずに `{ success: true, skipped: true }` を返す     | Unit Test（既存） |
| AC-07 | `pnpm typecheck && pnpm lint && pnpm test` が PASS                                  | CI                |

## 統合テスト連携【必須】

統合テストの要点を要件に固定する:

| 接続要件カテゴリ | 記載内容                                                             |
| ---------------- | -------------------------------------------------------------------- |
| API接続          | `analytics:send` から `analyticsHandler.ts` を経由して HTTP 送信する |
| 設定             | `ANALYTICS_ENDPOINT_URL` の有無で送信可否を分岐する                  |
| データフロー     | Renderer のイベント → Main の検証 → HTTP 送信 → 外部分析基盤         |
| 非伝播           | HTTP 送信失敗でも IPC 応答を壊さない                                 |

## 苦戦箇所（前タスクからの教訓）

| 教訓                 | 内容                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------ |
| IPC 型契約の保守     | `AnalyticsSendRequest` / `AnalyticsSendResponse` の型定義は変更せず拡張すること      |
| エラー非伝播設計     | HTTP エラーが analytics の IPC 呼び出し全体を壊さないよう catch で握り潰す設計を維持 |
| オプトアウト二重防衛 | Renderer 側と Main 側の両方でオプトアウトを確認する既存の構造を破らないこと          |

## 成果物

| 成果物               | パス                                                         | 説明                   |
| -------------------- | ------------------------------------------------------------ | ---------------------- |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`                 | 機能要件と非機能要件   |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`                     | 検証可能なAC一覧       |
| 仕様抽出結果         | `outputs/phase-1/aiworkflow-requirements-extraction.md`      | aiworkflow仕様抽出結果 |
| 差分カバレッジ       | `outputs/phase-1/branch-diff-coverage.md`                    | ブランチ差分反映確認   |
| トレーサビリティ行列 | `outputs/phase-1/implementation-spec-traceability-matrix.md` | 要件と仕様の対応表     |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 機能要件 FR-01〜FR-06 が明確に定義されていること
- [ ] 非機能要件 NFR-01〜NFR-04 が定義されていること
- [ ] 受け入れ基準 AC-01〜AC-07 が検証可能な形で定義されていること
- [ ] 前タスク（UT-W3-ANALYTICS-ADAPTER-001）との carry-over 確認完了
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列作業
3. SubAgent-D の統合判定
4. 成果物出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001
```

## 次のPhase

Phase 2: 設計
