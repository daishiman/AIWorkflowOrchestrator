# Phase 1 成果物: 要件定義書

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| タスクID   | TASK-P0-07                               |
| 機能名     | hardcoded-agent-names-dynamic-resolution |
| カテゴリ   | リファクタリング（Feature Gap系）        |
| 作成日     | 2026-04-06                               |
| Phase      | 1                                        |
| ステータス | 完了                                     |

## 概要

`RuntimeSkillCreatorFacade` の `plan()` / `improve()` メソッドにおいて、エージェントリソースの解決を `workflow-manifest.json` から動的に行う仕組みへリファクタリングする。

現状、動的パイプライン（`hasDynamicResourcePipeline() === true`）であっても `resolveOperationResources()` に渡されるリソースリストは `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` という静的定数であり、manifest の `phases[].resourceIds` が活用されていない。本タスクでは manifest を主正本としてリソースを動的に解決し、manifest が利用できない場合は既存の静的定数にフォールバックする二重構造を実現する。

## 機能要件

| ID    | 要件                                                                                                                                                 | 優先度 |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-01 | `plan()` の動的パスで、manifest の `plan` フェーズの `resourceIds` からエージェントリストを動的に組み立てる                                          | must   |
| FR-02 | `improve()` の動的パスで、manifest の `improve` フェーズの `resourceIds` からエージェントリストを動的に組み立てる                                    | must   |
| FR-03 | manifest にフェーズが存在しない / `resourceIds` が空の場合、静的リスト（`PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS`）にフォールバックする | must   |
| FR-04 | フォールバック発動時にログ出力（`warn` レベル）を行う                                                                                                | should |
| FR-05 | `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` は削除せず、静的フォールバックとして保持する                                                  | must   |
| FR-06 | manifest の `resources[]` から `id` / `kind` / `path` を取得し、`PhaseResourceRequest` にマッピングするユーティリティを実装する                      | must   |

## 非機能要件

| ID     | 要件                                                               | 優先度 |
| ------ | ------------------------------------------------------------------ | ------ |
| NFR-01 | 既存テスト `T-P7-04` が引き続き PASS すること                      | must   |
| NFR-02 | `pnpm --filter @repo/desktop typecheck` がエラーなしで通過すること | must   |
| NFR-03 | `pnpm --filter @repo/desktop lint` がエラーなしで通過すること      | must   |
| NFR-04 | manifest ロード前 / 失敗時に動作が後退しないこと                   | must   |
| NFR-05 | 新たな `const` としてエージェント名が追加されないこと              | should |

## 受け入れ基準

| AC ID | 基準                                                                                                                                 | 検証方法       |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| AC-1  | `plan()` の動的パスで manifest の `plan` フェーズ `resourceIds` からエージェントリストが組み立てられる                               | automated-test |
| AC-2  | `improve()` の動的パスで manifest の `improve` フェーズ `resourceIds` からエージェントリストが組み立てられる                         | automated-test |
| AC-3  | manifest にフェーズが存在しない場合、対応する静的定数（`PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS`）にフォールバックする  | automated-test |
| AC-4  | manifest の `resourceIds` が空の場合、対応する静的定数（`PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS`）にフォールバックする | automated-test |
| AC-5  | フォールバック発動時にログ出力がある                                                                                                 | automated-test |
| AC-6  | `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` は削除されず保持されている                                                    | code-review    |
| AC-7  | 既存テスト `T-P7-04` が PASS する                                                                                                    | automated-test |
| AC-8  | typecheck / lint がエラーなし                                                                                                        | automated-test |

## スコープ

### 含むもの

- `RuntimeSkillCreatorFacade.ts` における `plan()` / `improve()` フェーズの manifest 動的解決パスの強化
- manifest の `phases[]` / `resources[]` からフェーズ別エージェントリストを組み立てるユーティリティ実装
- manifest ロード失敗時のフォールバック設計（`PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` を維持）
- 動的解決パスのテスト追加

### 含まないもの

- `workflow-manifest.json` 内容の変更（TASK-P0-03 の責務）
- `ManifestLoader` 自体の変更（TASK-P0-04 の責務）
- `SkillCreatorWorkflowEngine.ts` の phase 状態機械の定義変更
- 新規フェーズの追加やフェーズ順序の変更
- `execute` / `verify` / `requirements-gathering` 等の他フェーズの動的解決（将来タスク）

## カバレッジ基準

| メトリクス    | 閾値 | 対象                                          |
| ------------- | ---- | --------------------------------------------- |
| Line Coverage | 80%+ | RuntimeSkillCreatorFacade 関連ファイル        |
| Branch        | 60%+ | 動的パス / フォールバックパスの分岐カバレッジ |
| Function      | 80%+ | 新規ユーティリティ関数含む                    |

## 関連タスク

| タスク     | 関係                                      | ステータス |
| ---------- | ----------------------------------------- | ---------- |
| TASK-P0-03 | 前提: workflow-manifest.json 本番配置     | 完了       |
| TASK-P0-04 | 前提: ManifestLoader デフォルト有効化     | 完了       |
| TASK-P0-01 | 並行: SkillCreatorVerificationEngine 実装 | 完了       |
