# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 8                                            |
| タスクID   | UT-FIX-STORE-SETTINGS-DEEP-MERGE-001         |
| 機能名     | settings-deep-merge                          |
| タスク名   | settings:update ハンドラのディープマージ対応 |
| 前提Phase  | Phase 7                                      |
| 後続Phase  | Phase 9                                      |
| 作成日     | 2026-04-16                                   |
| ステータス | pending                                      |

## 目的

`deepMerge` 実装のコード品質を改善し、責務境界を明確化する。
振る舞いを維持したまま、型安全性・単一責務・保守性を向上させる。

## 背景

Phase 5 で実装した `deepMerge` 関数と `settings:update` ハンドラの修正が
機能的に正しくても、コードの責務境界が曖昧な場合は将来の保守コストが上がる。
`deepMerge` 関数が純粋関数として成立しているか、
`Record<string, unknown>` の型扱いに改善余地がないかを精査する。

## SubAgentチーム編成

| SubAgent | 担当       | 責務                                                             |
| -------- | ---------- | ---------------------------------------------------------------- |
| A        | 型安全性   | `deepMerge` 関数の型制約・ジェネリクスの改善点を分析する         |
| B        | 単一責務   | `deepMerge`・storeHandler・electronStore の責務分離を検証する    |
| C        | コード品質 | 不要コメント・デッドコード・命名整合を確認し改善案を提示する     |
| D        | 統合監査   | 矛盾・漏れ・整合・依存関係を横断確認し、リファクタ計画を統合する |

## 実行タスク

- **リファクタ計画**: 改善点を列挙し、優先度（必須/推奨/任意）を決定する
- **再テスト計画**: リファクタ後の全テスト実行計画を策定する
- **責務境界マップ**: `deepMerge`・storeHandler・electronStore の責務を整理する

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

### システム仕様

| 資料名                | パス                                              | 用途                   |
| --------------------- | ------------------------------------------------- | ---------------------- |
| storeHandlers.ts      | `apps/desktop/src/main/ipc/storeHandlers.ts`      | リファクタ対象ファイル |
| storeHandlers.test.ts | `apps/desktop/src/main/ipc/storeHandlers.test.ts` | テスト整合確認         |

## 実行手順

1. 前Phase成果物（Phase 7 outputs/）を確認する。
2. SubAgent-A（型安全性）・SubAgent-B（単一責務）・SubAgent-C（コード品質）を並列実行する。
3. SubAgent-D が統合監査を行い、リファクタ計画に優先度を付与する。
4. 成果物を `outputs/phase-8/` に定義する。
5. 完了条件で矛盾・漏れ・整合・依存を判定する。

### リファクタリング観点チェックリスト

| 観点                   | 確認内容                                                                                    | 優先度 |
| ---------------------- | ------------------------------------------------------------------------------------------- | ------ |
| 型安全性               | `deepMerge<T extends Record<string, unknown>>` のジェネリクス制約が過不足なく機能しているか | 必須   |
| 純粋関数性             | `deepMerge` が副作用を持たず、入力から出力のみを返す純粋関数になっているか                  | 必須   |
| 単一責務               | `deepMerge` がマージロジックのみを担い、ストア操作は行っていないか                          | 必須   |
| 不要コメント除去       | 実装中に追加した作業用コメント・TODO コメントが残存していないか                             | 推奨   |
| デッドコード除去       | 使用されていない変数・分岐・インポートが存在しないか                                        | 推奨   |
| TypeScript strict 整合 | `strict` モードで型エラーが発生しないか（`any` の混入がないか）                             | 必須   |
| 命名一貫性             | `base`・`override`・`result`・`overrideVal`・`baseVal` の命名が既存コードと整合しているか   | 推奨   |

## 統合テスト連携

- SubAgent-A/B/C の分析結果を SubAgent-D で統合し、リファクタ計画を確定する。
- リファクタ後は `pnpm --filter @repo/desktop test:run` で全テストが PASS することを確認する計画を策定する。
- `settings:update`・`registerUserSettingsHandlers`・`deepMerge` の 3 つの責務境界をマップに明記する。
- 統合ログは `outputs/phase-8/` に保存する。

## 多角的チェック観点

| 観点     | 確認内容                                                                                   |
| -------- | ------------------------------------------------------------------------------------------ |
| 矛盾     | リファクタ後の設計が Phase 1 要件・AC-1〜AC-5 と矛盾しないか確認する                       |
| 漏れ     | 責務境界マップが `deepMerge`・storeHandler・electronStore の全責務を網羅しているか確認する |
| 整合性   | リファクタ計画の優先度付けが Phase 7 のカバレッジ結果と整合しているか確認する              |
| 依存関係 | Phase 7 成果物（カバレッジ計画・網羅率）との入力出力が整合しているか確認する               |

## サブタスク管理

1. 前Phase成果物（Phase 7 outputs/）の確認
2. SubAgent-A: 型安全性分析
3. SubAgent-B: 単一責務・責務境界分析
4. SubAgent-C: コード品質・命名・デッドコード分析
5. SubAgent-D: 統合監査・リファクタ計画確定
6. 成果物出力（3ファイル）
7. 完了条件判定

## 成果物

| 成果物         | パス                                             | 説明                           |
| -------------- | ------------------------------------------------ | ------------------------------ |
| リファクタ計画 | `outputs/phase-8/refactoring-plan.md`            | 改善点一覧・優先度付きリスト   |
| 再テスト計画   | `outputs/phase-8/post-refactor-test-plan.md`     | リファクタ後の全テスト実行計画 |
| 責務境界マップ | `outputs/phase-8/responsibility-boundary-map.md` | 3コンポーネントの責務整理      |

## 完了条件

- [ ] リファクタ計画（改善点・優先度付き）を作成済み
- [ ] 再テスト計画（リファクタ後のテスト実行計画）を作成済み
- [ ] 責務境界マップ（deepMerge・storeHandler・electronStore）を作成済み
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

Phase 9: 品質保証
