# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 11                                                 |
| 機能名     | UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001   |
| タスク名   | スキル名バリデーション正規表現の shared 定数一元化 |
| 前提Phase  | Phase 10                                           |
| 後続Phase  | Phase 12                                           |
| 作成日     | 2026-04-06                                         |
| ステータス | completed                                          |

## 目的

NON_VISUAL タスクのため、UI スクリーンショットに代わり自動テスト結果・ビルド成果物・動作確認コマンドの出力を代替証跡として記録する。
スキル名バリデーションが一元化された定数を通じて正しく機能することを確認する。

## NON_VISUAL タスクについて

本タスクは UI 変更を伴わない NON_VISUAL タスクである。
そのため、スクリーンショットによる目視確認の代わりに以下を証跡とする。

- 自動テスト結果（vitest の出力ログ）
- ビルド成果物の存在確認（ls コマンド出力）
- Node.js による require 動作確認（コンソール出力）
- スキルウィザードからのスキル作成フロー確認（自動テストで代替）

## SubAgentチーム編成

| SubAgent   | 関心ごと             | 主担当                                           |
| ---------- | -------------------- | ------------------------------------------------ |
| SubAgent-A | ビルド確認           | shared ビルド・成果物存在確認                    |
| SubAgent-B | require 動作確認     | CJS モジュール読み込み確認                       |
| SubAgent-C | スキル作成フロー確認 | バリデーション動作の自動テスト代替証跡           |
| SubAgent-D | 統合監査             | 証跡インデックス作成・スクリーンショット計画記録 |

## 実行タスク

- Task 11-1: `pnpm --filter @repo/shared build` の実行と成功確認
- Task 11-2: `dist/src/constants/index.cjs` の存在確認
- Task 11-3: `dist/src/constants/index.js`（ESM）の存在確認
- Task 11-4: `node -e "const s = require('./packages/shared/dist/src/constants/index.cjs'); console.log(s.SKILL_NAME_PATTERN)"` の動作確認（ローカル dist から）
- Task 11-5: スキルウィザードからスキル作成フローの名前バリデーション動作確認（自動テスト代替）

## 参照資料

| 参照資料         | パス                                              | 説明            |
| ---------------- | ------------------------------------------------- | --------------- |
| 要件定義書       | `outputs/phase-1/requirements-definition.md`      | Phase 1 成果物  |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`          | Phase 1 成果物  |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md`       | Phase 5 成果物  |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md`       | Phase 6 成果物  |
| 品質レポート     | `outputs/phase-9/quality-report.md`               | Phase 9 成果物  |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`         | Phase 10 成果物 |
| 出荷準備チェック | `outputs/phase-10/release-readiness-checklist.md` | Phase 10 成果物 |

## テスト項目

| No. | テスト項目                                 | 実行コマンド / 手順                                                                                                | 合格基準                             | 証跡種別       |
| --- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------ | -------------- |
| 1   | shared ビルドの成功確認                    | `pnpm --filter @repo/shared build`                                                                                 | exit code 0、エラーなし              | コマンド出力   |
| 2   | CJS 成果物の存在確認                       | `ls packages/shared/dist/src/constants/index.cjs`                                                                  | ファイルが存在すること               | コマンド出力   |
| 3   | ESM 成果物の存在確認                       | `ls packages/shared/dist/src/constants/index.js`                                                                   | ファイルが存在すること               | コマンド出力   |
| 4   | CJS モジュール読み込み確認                 | `node -e "const s = require('./packages/shared/dist/src/constants/index.cjs'); console.log(s.SKILL_NAME_PATTERN)"` | 正規表現オブジェクトが出力されること | コマンド出力   |
| 5   | スキルウィザード名前バリデーション動作確認 | `pnpm --filter @repo/desktop test -- --grep "validateSkillName"`                                                   | 関連テストが PASS すること           | 自動テスト出力 |

## 実行手順

1. SubAgent-A: `pnpm --filter @repo/shared build` を実行し、成功ログを記録する。
2. SubAgent-A: `dist/src/constants/index.cjs` と `dist/src/constants/index.js` の存在を `ls` コマンドで確認し、出力を記録する。
3. SubAgent-B: `node -e` コマンドで `SKILL_NAME_PATTERN` が正しく require できることを確認し、出力を記録する。
4. SubAgent-C: `validateSkillName` に関連する自動テストを実行し、PASS を確認する。スクリーンショットの代替証跡として記録する。
5. SubAgent-D: 証跡インデックス・スクリーンショット計画（NON_VISUAL 代替記録）・手動テスト結果を作成する。

## 多角的チェック観点

| 観点     | 確認内容                                                                               |
| -------- | -------------------------------------------------------------------------------------- |
| 矛盾     | テスト結果と受け入れ基準に矛盾がないか                                                 |
| 漏れ     | 5件の全テスト項目が実行・記録されているか                                              |
| 整合性   | CJS・ESM の双方が正常にビルドされ、require が成功しているか                            |
| 依存関係 | Phase 10 の出荷準備チェックが PASS していることを確認してから本 Phase を実行しているか |

## 統合テスト連携

- Phase 10 の出荷準備チェック結果を前提として手動確認を行う。
- Phase 12 のドキュメント更新に渡すため、証跡と補助ファイルを整える。

## 成果物

| 成果物                   | パス                                        | 説明                               |
| ------------------------ | ------------------------------------------- | ---------------------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | 実行前の確認項目                   |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | 全テスト項目の実行結果・合否・証跡 |
| 発見課題一覧             | `outputs/phase-11/discovered-issues.md`     | 実行中に見つかった課題の記録       |
| 証跡インデックス         | `outputs/phase-11/evidence-index.md`        | 証跡ファイル一覧とリンク           |
| スクリーンショット計画   | `outputs/phase-11/screenshot-plan.md`       | NON_VISUAL 代替証跡の記録計画      |

## 完了条件

- [ ] テスト項目 No.1〜5 の全件を実行・記録済み
- [ ] `pnpm --filter @repo/shared build` が成功している
- [ ] `dist/src/constants/index.cjs` が存在する
- [ ] `dist/src/constants/index.js`（ESM）が存在する
- [ ] `node -e "require(...)"` が成功している
- [ ] `validateSkillName` 関連テストが PASS している
- [ ] 成果物テーブル記載のファイルを全件生成

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

Phase 12: ドキュメント更新
