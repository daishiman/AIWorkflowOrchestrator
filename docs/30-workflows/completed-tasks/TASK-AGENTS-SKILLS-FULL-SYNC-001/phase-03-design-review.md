# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 3                                |
| 機能名 | TASK-AGENTS-SKILLS-FULL-SYNC-001 |
| 作成日 | 2026-04-19                       |
| 前提   | Phase 1 / Phase 2 完了           |

## 目的

Phase 4 以降（テスト作成 → 実装 → 検証）に進める状態であるかを判定する。Phase 1 の acceptance criteria と Phase 2 の設計が矛盾なく閉じているか、4 条件（価値性・実現性・整合性・運用性）で評価する。

## 一次結論

| 条件   | 判定 | 根拠                                                                                            |
| ------ | ---- | ----------------------------------------------------------------------------------------------- |
| 価値性 | OK   | 「手 rsync 忘れ」の根本原因を hook と CI で自動化する、という明確な痛みの解消                   |
| 実現性 | OK   | 既存ツール（`diff -qr` / `rsync -a --delete` / `generate-index.js`）のみで構成。新規概念なし    |
| 整合性 | OK   | canonical → mirror の一方向同期。`.gitattributes` / EVALS.json に触れない境界も明記済み         |
| 運用性 | OK   | pre-push は blocking、session-init は warning の 2 段構成。`CLAUDE_SKIP_HEAVY_HOOKS` で opt-out |

**判定: Phase 4 進行可（条件なし）**

## Phase 1 AC と Phase 2 設計のトレーサビリティ

| AC   | Phase 2 対応コンポーネント / 決定事項                               | トレース OK |
| ---- | ------------------------------------------------------------------- | ----------- |
| AC-1 | C-5 drift 解消（初回 rsync + `int-test-skill`）                     | ✅          |
| AC-2 | C-1 verify スクリプトの exit code 契約（exit 0 / 1）                | ✅          |
| AC-3 | C-2 sync スクリプトの実行順序（rsync → generate-index → diff -qr）  | ✅          |
| AC-4 | C-3 pre-push hook の blocking 設計、`--no-verify` 導線なし          | ✅          |
| AC-5 | C-5 drift 解消の対象に `int-test-skill` を含む                      | ✅          |
| AC-6 | C-4 session-init の `CLAUDE_SKIP_HEAVY_HOOKS=1` 対応、1 秒未満目標  | ✅          |
| AC-7 | トレードオフ分析「.gitattributes / EVALS.json を変更しない」決定    | ✅          |
| AC-8 | Phase 13 仕様で user 承認前は `blocked` 維持（Phase 13 で明記予定） | 🔜 Phase 13 |
| AC-9 | トレードオフ分析 AC-6 踏襲                                          | ✅          |

**結論**: AC-8 は Phase 13 で PR 仕様として具体化される前提であり、Phase 1-2 時点では「そのように書く予定」が明示されていれば十分。

## 30 種思考法による多角的レビュー

| 思考法       | レビュー観点                                                                        | 指摘・補正                                                                |
| ------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 批判的思考   | `rsync --delete` が mirror 側の独自変更を破壊する潜在リスク                         | Phase 2 が「mirror-only warning を rsync 前に出す」で対応済み。OK         |
| 要素分解     | 5 コンポーネント（verify / sync / pre-push / session-init / drift 解消）が MECE か  | 5 つとも責務が独立しており重複なし。MECE。OK                              |
| システム思考 | pre-push と post-merge hook の重複検出                                              | post-merge hook は現時点で parity を触らない。将来統合は明示未着手。OK    |
| why 思考     | 「なぜ手 rsync が忘れられるのか」の根本原因が人の記憶依存であることを踏まえた設計か | session-init warning と pre-push gate の 2 段で「忘れ」をハンドリング。OK |
| トレードオン | `diff -qr` 実行時のセッション起動コスト vs drift 検出価値                           | `CLAUDE_SKIP_HEAVY_HOOKS` opt-out で両立。OK                              |
| 状態所有権   | `.claude/skills/`（canonical）と `.agents/skills/`（mirror）の所有権が混在しないか  | sync は canonical → mirror 一方向のみ。OK                                 |
| 責務境界     | 本タスクと TASK-CONFLICT-PREVENT-001 / task-p0-05 / task-imp-aiworkflow の境界      | Phase 1 / 2 に責務境界テーブルあり。OK                                    |
| 価値と運用   | 導入コストと運用コストの対比                                                        | スクリプト 2 本 + hook 2 行追記 = 導入コスト低、運用コストほぼ 0。OK      |

## 設計レビュー観点別チェック

### R-1: 依存関係の閉塞性

- verify / sync スクリプトは `git`、`diff`、`rsync`、`node` のみに依存する
- `node` の依存先 `generate-index.js` は canonical 側にある（mirror への循環依存なし）
- pre-push hook は `.husky` 存在前提 → Phase 4 テストで非 husky 環境を想定する

### R-2: 責務分離

- verify は read-only（CI 安全）
- sync は write（手動 / pre-push NG 時の誘導のみで呼ばれる）
- pre-push は verify のみ呼ぶ（sync を自動実行しない → 予期しない mirror 書き換えを防ぐ）
- session-init も verify のみ呼ぶ（warning 専用）

### R-3: 設計上の妥当性

| 設計点                                         | 妥当性                                                                             |
| ---------------------------------------------- | ---------------------------------------------------------------------------------- |
| verify と sync のスクリプト分離                | CI / hook では read-only の verify だけを呼びたい要求を満たす                      |
| sync 実行順（rsync → index 再生成 → 最終確認） | index の手マージ永久回避と、rsync 直後の整合性ズレの両方を解消                     |
| pre-push blocking、session-init warning        | 破壊的操作（push）には gate、開発フロー開始点（session）には情報提供、の役割が明確 |
| EVALS.json / `.gitattributes` 非変更           | 隣接タスクの責務を侵食しない / 本タスクは parity 保証にフォーカス                  |

### R-4: 運用性

- `CLAUDE_SKIP_HEAVY_HOOKS=1` で session-init スキップ可能（既存の hook 制御パターン踏襲）
- pre-push は `--no-verify` 禁止ルール（CLAUDE.md）に沿い、skip 手段を意図的に提供しない
- エラーメッセージで次に実行すべきコマンドを明示（ユーザーが迷わない導線）

## 残リスクと Phase 4 への申し送り

| リスク                                                         | 影響度 | Phase 4 テストで検証すべきこと                                                     |
| -------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------- |
| `generate-index.js` が非 deterministic で rsync 後も diff 出す | 中     | sync 実行後に `diff -qr` と `diff indexes/keywords.json` の両方を確認              |
| husky 未導入環境で pre-push 追記が効かない                     | 低     | `.husky/pre-push` 存在確認 + 存在しない場合のフォールバック設計を Phase 4 で決める |
| session-init の実行時間が 1 秒を超える                         | 中     | timing 計測ステップを Phase 4 の検証シナリオへ組み込む                             |
| worktree 並列で sync が同時実行される                          | 低     | pre-push 時点では一般に push は直列 → 現実的リスク小。ドキュメントで注記するのみ   |
| mirror 側の独自変更が上書きされる                              | 高     | Phase 1 の `/tmp/skills-only-mirror.txt` 確認を Phase 4 テストの前提手順にする     |

## Phase 4 以降の TDD 方針

| Phase | 対応                                                                                                         |
| ----- | ------------------------------------------------------------------------------------------------------------ |
| 4     | verify / sync / pre-push の 3 つ × (NG / OK) でテスト列挙 + timing 計測 + husky 非存在フォールバック確認     |
| 5     | drift 解消 → script 配置 → hook 配置 の 3 段階実装（順序遵守で drift なし状態を一度確立）                    |
| 6     | mirror-only ファイル混入ケース / `generate-index.js` エラー時の再現テスト                                    |
| 7     | 5 コンポーネント × 各 exit code パスのカバレッジ可視化                                                       |
| 8     | 既存 post-merge hook との重複検出 / スクリプト共通化の余地（当面なしで良い）                                 |
| 9     | `diff -qr` による parity 0 確認、`node .../validate-structure.js` による structure 整合、mirror 書き換え検出 |
| 10    | Phase 1 AC-1〜AC-9 の総点検、Phase 13 blocked 状態の再確認                                                   |
| 11    | scripts 手動実行 3 シナリオ（NG / OK / pre-push abort）の再現確認                                            |
| 12    | 実装ガイド（Part 1 中学生レベル + Part 2 開発者向け）、ドキュメント更新、未タスク検出                        |
| 13    | user 承認取得までは `blocked`、承認後のみ PR 作成                                                            |

## 判定

- Phase 1 AC-1〜AC-9 と Phase 2 設計コンポーネント C-1〜C-5 が 1:1 でトレース可能
- 4 条件すべて OK
- 残リスクはいずれも Phase 4 / Phase 5 で検証可能な粒度
- 設計変更は不要

**→ Phase 4（テスト作成）へ進行可**

## 成果物

- AC ↔ コンポーネント トレーサビリティマトリクス
- 30 種思考法レビュー結果
- 残リスク 5 件と Phase 4 申し送り
- Phase 4-13 TDD 方針サマリ

## 完了条件

- [ ] AC-1〜AC-9 が Phase 2 コンポーネントへトレースされている
- [ ] 批判的思考 / システム思考 / why 思考の 3 系統で Phase 2 が検証されている
- [ ] 残リスクが Phase 4 テスト対象として申し送られている
- [ ] 4 条件（価値性・実現性・整合性・運用性）すべてが OK 判定
- [ ] 設計変更が不要であることを明記

## 参照資料

| 資料名           | パス                                                                          | 用途               |
| ---------------- | ----------------------------------------------------------------------------- | ------------------ |
| Phase 1 要件定義 | `phase-01-requirements.md`                                                    | AC 根拠            |
| Phase 2 設計     | `phase-02-design.md`                                                          | 設計コンポーネント |
| task-spec skill  | `.claude/skills/task-specification-creator/references/phase-template-core.md` | Phase 3 必須骨格   |
| aiworkflow skill | `.claude/skills/aiworkflow-requirements/SKILL.md`                             | 4 条件評価         |

## 実行タスク

1. AC-1〜AC-9 と C-1〜C-5 のトレーサビリティを確認する
2. 4 条件で設計の進行可否を判定する
3. 境界条件、依存関係、運用導線に矛盾がないかをレビューする
4. Phase 4 に渡す残リスクと検証観点を固定する

## 統合テスト連携

- Phase 4 / 6 は本 Phase の残リスク表を TC と edge case の入力に使う
- Phase 10 は本 Phase の 4 条件判定を最終レビューの初期仮説として再評価する
