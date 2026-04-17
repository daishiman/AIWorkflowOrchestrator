# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 7                                            |
| 機能名     | UT-FIX-STORE-SETTINGS-DEEP-MERGE-001         |
| タスク名   | settings:update ハンドラのディープマージ対応 |
| 前提Phase  | Phase 6                                      |
| 後続Phase  | Phase 8                                      |
| 作成日     | 2026-04-16                                   |
| ステータス | pending                                      |

## 目的

`deepMerge` 関数と `settings:update` ハンドラのカバレッジを計測し、不足を特定する。AC-1〜AC-7 が全てテストでカバーされているかトレーサビリティを確認し、補完計画を固定する。

## 背景

Phase 6 で TC-01〜TC-12 が全件 PASS した。しかし、`deepMerge` 関数内の全分岐（配列判定・null 判定・再帰呼び出し・入力検証・危険キー除外）および `settings:update` ハンドラの Line/Branch カバレッジが十分かは未確認。カバレッジ計測により不足箇所を定量化し、次フェーズ（リファクタリング・品質保証）へのインプットとする。

## SubAgentチーム編成

| SubAgent   | 関心ごと         | 主担当                                      |
| ---------- | ---------------- | ------------------------------------------- |
| SubAgent-A | IPC/ストア責務   | deepMerge 分岐カバレッジの計測・分析        |
| SubAgent-B | 型契約・型安全性 | 型ガード分岐のカバレッジ確認                |
| SubAgent-C | テスト実行・計測 | coverage レポート取得・トレーサビリティ確認 |
| SubAgent-D | 統合監査         | 矛盾・漏れ・整合・依存判定                  |

## 実行タスク

- カバレッジ計測: 行・分岐・関数の計測値を取得する
- 不足分析: 不足箇所の根因と補完策を記録する
- 受け入れ照合: 受け入れ基準（AC-1〜AC-5）の網羅率を計測する

### 確認観点詳細

| 確認観点                       | 対象                             | 目標値        |
| ------------------------------ | -------------------------------- | ------------- |
| `deepMerge` 配列判定分岐       | `Array.isArray(patch[key])` 分岐 | Line 100%     |
| `deepMerge` null 判定分岐      | `patch[key] === null` 分岐       | Branch 100%   |
| `deepMerge` 再帰呼び出し分岐   | オブジェクト再帰パス             | Branch 100%   |
| `settings:update` 入力検証分岐 | plain object validation          | Branch 100%   |
| `deepMerge` 危険キー除外分岐   | `DISALLOWED_MERGE_KEYS` 判定     | Branch 100%   |
| `settings:update` ハンドラ全体 | Line / Branch カバレッジ         | Line 80% 以上 |
| AC-1〜AC-7 のトレーサビリティ  | TC-01〜TC-12 との 1 対 1 対応    | 全件カバー    |

## 参照資料

| 参照資料         | パス                                              | 説明           |
| ---------------- | ------------------------------------------------- | -------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md`       | Phase 5 成果物 |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`                | Phase 5 成果物 |
| 契約差分         | `outputs/phase-5/contract-diff.md`                | Phase 5 成果物 |
| 拡張テストケース | `outputs/phase-6/expanded-test-cases.md`          | Phase 6 成果物 |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md`       | Phase 6 成果物 |
| 異常系結果       | `outputs/phase-6/edge-case-result.md`             | Phase 6 成果物 |
| 対象ハンドラ     | `apps/desktop/src/main/ipc/storeHandlers.ts`      | 実装対象       |
| テストファイル   | `apps/desktop/src/main/ipc/storeHandlers.test.ts` | テスト対象     |

## 実行手順

1. Phase 5〜6 成果物（`outputs/phase-5/`, `outputs/phase-6/`）を確認する。
2. SubAgent-A/B/C を並列実行し、SubAgent-D で統合判定する。
3. 以下のコマンドでカバレッジレポートを取得する。

```bash
pnpm --filter @repo/desktop test:run -- --coverage apps/desktop/src/main/ipc/storeHandlers.test.ts
```

4. `deepMerge` 関数の分岐カバレッジ（配列判定・null 判定・再帰）を確認する。
5. `settings:update` ハンドラの Line/Branch カバレッジを確認する。
6. AC-1〜AC-7 と TC-01〜TC-12 のトレーサビリティ対応表を作成する。
7. 不足分岐があれば補完策を `outputs/phase-7/uncovered-analysis-plan.md` に記録する。
8. 成果物を `outputs/phase-7/` に定義する。
9. 完了条件で矛盾・漏れ・整合・依存を判定する。

## 統合テスト連携

- SubAgent-A/B/C のカバレッジ計測・型確認・トレーサビリティ作成を並列で進める。
- SubAgent-D が統合順序を直列で確定する。
- `settings:update` / `deepMerge` を計測対象に固定する。
- カバレッジ不足が発見された場合、Phase 6 へのフィードバックループを記録する。
- カバレッジレポートは `outputs/phase-7/` に保存する。

## 多角的チェック観点

| 観点     | 確認内容                                                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 矛盾     | カバレッジ計測結果が Phase 6 の回帰テスト結果（全件 PASS）と矛盾しないか確認する                                                            |
| 漏れ     | AC-1〜AC-7 の全項目が TC-01〜TC-12 のいずれかにトレースされているか確認する                                                                 |
| 整合性   | `deepMerge` と `settings:update` の 5 分岐（配列・null・再帰・入力検証・危険キー除外）が全て Line/Branch カバレッジに含まれているか確認する |
| 依存関係 | Phase 6 の拡張テストケースが存在し、カバレッジ計測の入力として整合しているか確認する                                                        |

## サブタスク管理

1. Phase 5〜6 成果物の確認
2. SubAgent-A/B/C の並列作業（カバレッジ計測・型確認・トレーサビリティ）
3. SubAgent-D の統合判定
4. 不足分析と補完計画の策定
5. 成果物出力
6. 完了条件判定

## 成果物

| 成果物                 | パス                                              | 説明                            |
| ---------------------- | ------------------------------------------------- | ------------------------------- |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                | 計測方法・目標値・実測値        |
| 未到達分析             | `outputs/phase-7/uncovered-analysis-plan.md`      | 不足分岐の根因と補完策          |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md` | AC-1〜AC-5 の要件網羅率レポート |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] カバレッジレポートを取得し、Line/Branch 計測値を記録した
- [ ] `deepMerge` と `settings:update` の 5 分岐（配列・null・再帰・入力検証・危険キー除外）のカバレッジを確認した
- [ ] AC-1〜AC-7 が全て TC-01〜TC-12 のいずれかにトレースされている
- [ ] 不足分岐がある場合、補完計画を記録した
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-FIX-STORE-SETTINGS-DEEP-MERGE-001
```

## 次のPhase

Phase 8: リファクタリング
