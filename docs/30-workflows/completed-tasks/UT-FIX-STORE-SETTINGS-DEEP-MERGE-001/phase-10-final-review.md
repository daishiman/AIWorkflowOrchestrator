# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 10                                           |
| タスクID   | UT-FIX-STORE-SETTINGS-DEEP-MERGE-001         |
| 機能名     | settings-deep-merge                          |
| タスク名   | settings:update ハンドラのディープマージ対応 |
| 前提Phase  | Phase 9                                      |
| 後続Phase  | Phase 11（PASS または MINOR の場合）         |
| 作成日     | 2026-04-16                                   |
| ステータス | pending                                      |

## 目的

Phase 1〜9 の全成果物を横断確認し、出荷可否を判定する。
PASS / MINOR / MAJOR のいずれかを決定し、MINOR の場合は是正計画に記録する。
PASS または MINOR のみ Phase 11（手動テスト検証）へ進む。

## 背景

`settings:update` ハンドラへの `deepMerge` 導入が、AC-1〜AC-5 を全て満たし、
IPC 4 層整合性（チャンネル定数・ホワイトリスト・ハンドラ・Preload API）を維持し、
回帰テスト全件 PASS の状態で出荷できるかを最終確認する。

## SubAgentチーム編成

| SubAgent | 担当             | 責務                                                                   |
| -------- | ---------------- | ---------------------------------------------------------------------- |
| A        | AC 整合確認      | AC-1〜AC-5 の全達成を横断確認し、未達成項目を記録する                  |
| B        | IPC 4 層整合確認 | チャンネル定数・ホワイトリスト・ハンドラ・Preload API の整合を確認する |
| C        | 品質基準確認     | deepMerge 実装とテストの 1 対 1 対応・回帰テスト全件 PASS を確認する   |
| D        | 統合監査・判定   | PASS/MINOR/MAJOR を判定し、是正計画と出荷準備チェックリストを確定する  |

## ゲート判定基準

| 判定  | 条件                                                                  |
| ----- | --------------------------------------------------------------------- |
| PASS  | 全 AC 達成・型チェック/テスト/Lint 全 PASS・リスク許容済み            |
| MINOR | 軽微な指摘あり（Phase 12 で追跡可能・出荷に支障なし）                 |
| MAJOR | 根本的な問題あり（AC 未達成・型エラー・テスト FAIL）→ 前 Phase へ戻る |

**MAJOR 判定となる条件の例**:

- AC-1〜AC-5 のいずれかが未達成
- TypeScript 型チェック・Lint・テストのいずれかが FAIL
- IPC 4 層（チャンネル定数・ホワイトリスト・ハンドラ・Preload API）の整合が崩れている
- `deepMerge` 実装とテストの 1 対 1 対応が確認できない
- リスク台帳で「対処方針なし」のリスクが影響度「高」に分類されている

## 実行タスク

- **最終レビュー**: Phase 1〜9 の全成果物を横断確認する
- **是正計画**: MINOR 指摘があれば是正方針を記録する
- **出荷準備チェック**: チェックリストを完成させる

## 参照資料

### 前Phase成果物

| 資料名                 | パス                                               | 説明           |
| ---------------------- | -------------------------------------------------- | -------------- |
| 要件定義書             | `outputs/phase-1/requirements-definition.md`       | Phase 1 成果物 |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`           | Phase 1 成果物 |
| アーキテクチャ設計書   | `outputs/phase-2/architecture-design.md`           | Phase 2 成果物 |
| IPC 契約設計書         | `outputs/phase-2/ipc-contract-design.md`           | Phase 2 成果物 |
| テスト戦略書           | `outputs/phase-2/test-strategy.md`                 | Phase 2 成果物 |
| 依存整合マトリクス     | `outputs/phase-2/dependency-consistency-matrix.md` | Phase 2 成果物 |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`        | Phase 5 成果物 |
| 変更ファイル一覧       | `outputs/phase-5/changed-files.md`                 | Phase 5 成果物 |
| 契約差分               | `outputs/phase-5/contract-diff.md`                 | Phase 5 成果物 |
| 拡張テストケース       | `outputs/phase-6/expanded-test-cases.md`           | Phase 6 成果物 |
| 回帰テスト結果         | `outputs/phase-6/regression-test-result.md`        | Phase 6 成果物 |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                 | Phase 7 成果物 |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md`  | Phase 7 成果物 |
| リファクタ計画         | `outputs/phase-8/refactoring-plan.md`              | Phase 8 成果物 |
| 再テスト計画           | `outputs/phase-8/post-refactor-test-plan.md`       | Phase 8 成果物 |
| 責務境界マップ         | `outputs/phase-8/responsibility-boundary-map.md`   | Phase 8 成果物 |
| 品質レポート           | `outputs/phase-9/quality-report.md`                | Phase 9 成果物 |
| リスク台帳             | `outputs/phase-9/risk-register.md`                 | Phase 9 成果物 |
| 因果ループ監査         | `outputs/phase-9/causal-loop-check.md`             | Phase 9 成果物 |

### システム仕様

| 資料名                | パス                                              | 用途                   |
| --------------------- | ------------------------------------------------- | ---------------------- |
| storeHandlers.ts      | `apps/desktop/src/main/ipc/storeHandlers.ts`      | 最終実装確認           |
| storeHandlers.test.ts | `apps/desktop/src/main/ipc/storeHandlers.test.ts` | テスト 1 対 1 対応確認 |

## 実行手順

1. 前Phase成果物（Phase 1〜9 outputs/）を確認する。
2. SubAgent-A（AC 整合）・SubAgent-B（IPC 4 層）・SubAgent-C（品質基準）を並列実行する。
3. SubAgent-D が統合監査・ゲート判定を直列で確定する。
4. 成果物を `outputs/phase-10/` に定義する。
5. 完了条件で矛盾・漏れ・整合・依存を判定する。

### AC 最終確認マトリクス

| AC ID | 達成基準                                                         | 確認結果 |
| ----- | ---------------------------------------------------------------- | -------- |
| AC-1  | `deepMerge(current, updates)` でネストフィールドが保持されること | pending  |
| AC-2  | 配列フィールドが上書き（マージしない）されること                 | pending  |
| AC-3  | `null` 値が上書き扱い・`undefined` 値が省略扱いであること        | pending  |
| AC-4  | 既存の `registerStoreHandlers` テストが設計変更後も通過すること  | pending  |
| AC-5  | `pnpm --filter @repo/desktop typecheck` が PASS であること       | pending  |

### IPC 4 層整合確認

| 層             | 確認内容                                                | 確認結果 |
| -------------- | ------------------------------------------------------- | -------- |
| チャンネル定数 | `USER_SETTINGS_UPDATE` 定数が正しく定義されているか     | pending  |
| ホワイトリスト | `settings:update` がホワイトリストに登録されているか    | pending  |
| ハンドラ       | `registerUserSettingsHandlers` が正しく登録されているか | pending  |
| Preload API    | `window.api.settings.update` が正しく公開されているか   | pending  |

### ゲート判定記録

| 判定           | 記録内容                  |
| -------------- | ------------------------- |
| 総合判定       | （実行時に記録）          |
| 判定根拠       | （実行時に記録）          |
| MINOR 指摘事項 | （該当時に実行時に記録）  |
| 次のアクション | （PASS/MINOR → Phase 11） |

## 統合テスト連携

- SubAgent-A/B/C の確認結果を SubAgent-D で統合し、ゲート判定を確定する。
- AC-1〜AC-5 全達成・IPC 4 層整合・回帰テスト全件 PASS が揃って PASS 判定となる。
- MAJOR 判定の場合は原因となった Phase を特定し、戻り先を明記する。
- 統合ログは `outputs/phase-10/` に保存する。

## 多角的チェック観点

| 観点     | 確認内容                                                                                       |
| -------- | ---------------------------------------------------------------------------------------------- |
| 矛盾     | 最終レビュー結果が Phase 1 要件・AC-1〜AC-5 と矛盾しないか確認する                             |
| 漏れ     | Phase 1〜9 の全成果物が出荷準備チェックリストに網羅されているか確認する                        |
| 整合性   | IPC 4 層整合確認の結果が Phase 2 の IPC 契約設計書と整合しているか確認する                     |
| 依存関係 | Phase 9 成果物（品質レポート・リスク台帳・因果ループ監査）との入力出力が整合しているか確認する |

## サブタスク管理

1. 前Phase成果物（Phase 1〜9 outputs/）の確認
2. SubAgent-A: AC-1〜AC-5 最終達成確認
3. SubAgent-B: IPC 4 層整合確認（4 層すべて）
4. SubAgent-C: deepMerge 実装とテストの 1 対 1 対応・回帰テスト全件 PASS 確認
5. SubAgent-D: ゲート判定（PASS/MINOR/MAJOR）・是正計画・出荷準備チェックリスト確定
6. 成果物出力（3ファイル）
7. 完了条件判定

## 成果物

| 成果物           | パス                                              | 説明                             |
| ---------------- | ------------------------------------------------- | -------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`         | 全成果物横断確認・ゲート判定結果 |
| 是正計画         | `outputs/phase-10/corrective-action-plan.md`      | MINOR 指摘の是正方針             |
| 出荷準備チェック | `outputs/phase-10/release-readiness-checklist.md` | 移行可否の最終チェックリスト     |

## 完了条件

- [ ] 最終レビュー結果（Phase 1〜9 横断確認・ゲート判定）を作成済み
- [ ] 是正計画（MINOR 指摘がある場合の是正方針）を作成済み
- [ ] 出荷準備チェックリスト（移行可否）を作成済み
- [ ] AC-1〜AC-5 の全達成を確認
- [ ] IPC 4 層整合性（チャンネル定数・ホワイトリスト・ハンドラ・Preload API）を確認
- [ ] deepMerge 実装とテストの 1 対 1 対応を確認
- [ ] 回帰テスト全件 PASS を確認
- [ ] ゲート判定 PASS または MINOR の場合のみ Phase 11 へ進む
- [ ] ゲート判定 MAJOR の場合は前 Phase へ戻り再実施する
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成（3ファイル）
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-FIX-STORE-SETTINGS-DEEP-MERGE-001
```

## 次Phase

Phase 11: 手動テスト検証（ゲート判定 PASS または MINOR の場合のみ進む）
