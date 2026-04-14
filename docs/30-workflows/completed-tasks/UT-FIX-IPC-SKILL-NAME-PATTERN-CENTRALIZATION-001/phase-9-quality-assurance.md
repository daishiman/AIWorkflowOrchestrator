# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 9                                                  |
| 機能名     | UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001   |
| タスク名   | スキル名バリデーション正規表現の shared 定数一元化 |
| 前提Phase  | Phase 8                                            |
| 後続Phase  | Phase 10                                           |
| 作成日     | 2026-04-06                                         |
| ステータス | completed                                          |

## 目的

リファクタリング完了後の品質を多角的に検証し、全テスト・型チェック・lint・ビルド成果物・mirror同期の合格を確認する。

## 背景

- `SKILL_NAME_PATTERN` の一元化により、既存コードの import パスが変更される。
- TypeScript/ESM 双方のビルドが成功すること、および既存テストが回帰していないことを確認する必要がある。
- mirror parity（`.claude` ↔ `.agents`）も品質基準の一部として検証する。

## SubAgentチーム編成

| SubAgent   | 関心ごと           | 主担当                                          |
| ---------- | ------------------ | ----------------------------------------------- |
| SubAgent-A | shared パッケージ  | typecheck・test・ビルド成果物確認               |
| SubAgent-B | desktop パッケージ | typecheck・回帰テスト確認                       |
| SubAgent-C | mirror 同期        | `.claude` ↔ `.agents` の init_skill.js 一致確認 |
| SubAgent-D | 統合監査           | リスク評価・因果ループ・品質レポート統合        |

## 実行タスク

- Task 9-1: `pnpm typecheck`（全パッケージ）実行と結果記録
- Task 9-2: `pnpm lint` 実行と結果記録
- Task 9-3: `pnpm --filter @repo/shared test` 実行と結果記録
- Task 9-4: `pnpm --filter @repo/desktop test`（回帰確認）実行と結果記録
- Task 9-5: mirror parity 確認（`.claude` ↔ `.agents` の `init_skill.js` diff 検証）
- Task 9-6: CJS/ESM ビルド成果物の存在確認（`dist/src/constants/index.cjs`・`dist/src/constants/index.js`）
- Task 9-7: リスク台帳・因果ループ監査・品質レポートの作成

## 参照資料

| 参照資料             | パス                                             | 説明           |
| -------------------- | ------------------------------------------------ | -------------- |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`     | Phase 1 成果物 |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`         | Phase 1 成果物 |
| アーキテクチャ設計   | `outputs/phase-2/design-document.md`             | Phase 2 成果物 |
| 実装サマリー         | `outputs/phase-5/implementation-summary.md`      | Phase 5 成果物 |
| 拡張テストケース     | `outputs/phase-6/expanded-test-cases.md`         | Phase 6 成果物 |
| 回帰テスト結果       | `outputs/phase-6/regression-test-result.md`      | Phase 6 成果物 |
| カバレッジ計画       | `outputs/phase-7/coverage-plan.md`               | Phase 7 成果物 |
| リファクタリング計画 | `outputs/phase-8/refactoring-plan.md`            | Phase 8 成果物 |
| 再テスト計画         | `outputs/phase-8/post-refactor-test-plan.md`     | Phase 8 成果物 |
| 責務境界マップ       | `outputs/phase-8/responsibility-boundary-map.md` | Phase 8 成果物 |

## 品質チェック項目

| チェック項目                 | コマンド                                          | 合格基準                          |
| ---------------------------- | ------------------------------------------------- | --------------------------------- |
| 全パッケージ型チェック       | `pnpm typecheck`                                  | エラー 0 件                       |
| lint                         | `pnpm lint`                                       | エラー 0 件（warning は許容）     |
| shared パッケージテスト      | `pnpm --filter @repo/shared test`                 | 全テスト PASS                     |
| desktop パッケージ回帰テスト | `pnpm --filter @repo/desktop test`                | 既存テスト PASS（新規 FAIL なし） |
| mirror parity 確認           | `diff .claude/.../init_skill.js .agents/...`      | diff 出力 0 行（完全一致）        |
| CJS ビルド成果物存在確認     | `ls packages/shared/dist/src/constants/index.cjs` | ファイルが存在すること            |
| ESM ビルド成果物存在確認     | `ls packages/shared/dist/src/constants/index.js`  | ファイルが存在すること            |

## 実行手順

1. SubAgent-A: `pnpm typecheck` を実行し、エラーの有無を記録する。
2. SubAgent-A: `pnpm lint` を実行し、エラー・warning を記録する。
3. SubAgent-A: `pnpm --filter @repo/shared test` を実行し、テスト結果を記録する。
4. SubAgent-B: `pnpm --filter @repo/desktop test` を実行し、回帰がないことを確認する。
5. SubAgent-C: `.claude/skills/skill-creator/scripts/init_skill.js` と `.agents/skills/skill-creator/scripts/init_skill.js` の diff を取得し、差分ゼロを確認する。
6. SubAgent-A: `pnpm --filter @repo/shared build` 後、`dist/src/constants/index.cjs` と `dist/src/constants/index.js` の存在を確認する。
7. SubAgent-D: 上記結果を集約し、quality-report.md・risk-register.md・causal-loop-check.md を作成する。

## 多角的チェック観点

| 観点        | 確認内容                                                         |
| ----------- | ---------------------------------------------------------------- |
| 矛盾        | typecheck/lint/test の結果が全て合格しているか                   |
| 漏れ        | 全チェック項目が実行・記録されているか                           |
| 整合性      | CJS・ESM ビルド成果物が正しく生成されているか                    |
| 依存関係    | @repo/shared の変更が @repo/desktop に正しく伝播しているか       |
| mirror 同期 | `.claude` と `.agents` の `init_skill.js` が完全に一致しているか |
| リスク評価  | 未解決のリスクがあれば risk-register.md に記録されているか       |

## 統合テスト連携

- Phase 8 のリファクタリング結果を受け取り、Phase 10 の最終レビューへつなぐ。
- CJS/ESM ビルド成果物の確認は Phase 11 の手動テストでも再確認する。

## 成果物

| 成果物         | パス                                   | 説明                           |
| -------------- | -------------------------------------- | ------------------------------ |
| 品質レポート   | `outputs/phase-9/quality-report.md`    | 全チェック項目の実行結果・合否 |
| リスク台帳     | `outputs/phase-9/risk-register.md`     | 残存リスクと対応策             |
| 因果ループ監査 | `outputs/phase-9/causal-loop-check.md` | 変更の波及効果と因果関係の確認 |

## 完了条件

- [ ] `pnpm typecheck` エラー 0 件
- [ ] `pnpm lint` エラー 0 件
- [ ] `pnpm --filter @repo/shared test` 全 PASS
- [ ] `pnpm --filter @repo/desktop test` 回帰なし
- [ ] mirror parity 確認完了（diff 0 行）
- [ ] CJS/ESM ビルド成果物の存在確認完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001
```

## 次のPhase

Phase 10: 最終レビュー
