# Phase 12: ドキュメント更新

## メタ情報

| 項目      | 値                                              |
| --------- | ----------------------------------------------- |
| Phase     | 12                                              |
| 機能名    | TASK-AGENTS-SKILLS-FULL-SYNC-001                |
| Issue番号 | #2278                                           |
| 作成日    | 2026-04-19                                      |
| 種別      | NON_VISUAL / infra-guard / shell-script         |
| 前提      | Phase 1-11 完了（要件・設計・実装・手動テスト） |

## 視覚証跡

**UI/UX変更なしのため Phase 11 スクリーンショット不要。**

本タスクは `.claude/scripts/` 配下の shell スクリプト 2 本と、`.husky/pre-push` / `.claude/hooks/session-init.sh` への追記のみを扱う NON_VISUAL タスクである。したがって実装ガイドおよび本 Phase の compliance-check では、Phase 11 の bash 実行ログ（`outputs/phase-11/bash-execution-log.txt`）を視覚証跡の代替として参照する。

## 目的

NON_VISUAL docs-only task として、task-specification-creator skill の Phase 12 必須 5 タスク（実装ガイド / システム仕様更新 / ドキュメント更新履歴 / 未タスク検出 / スキルフィードバック）を same-wave で閉じる。Phase 13 は user approval 取得までは `blocked` のまま維持する。

## 実行タスク

1. **Task 1**: `implementation-guide.md` を 2 パート構成（Part 1: 中学生レベル / Part 2: 開発者向け）で作成する
2. **Task 2**: システム仕様を 4 サブステップ（1-A / 1-B / 1-C / Step 2）で更新する
3. **Task 3**: `documentation-changelog.md` を scripts による自動生成で作成する
4. **Task 4**: `unassigned-task-detection.md` を 0 件でも出力する
5. **Task 5**: `skill-feedback-report.md` を改善点なしでも出力する

## 参照資料

| 資料名                           | パス                                                                                    | 用途                                  |
| -------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------- |
| phase 12 guide                   | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`  | 必須成果物 5 件と same-wave sync 原則 |
| phase 11 手動テスト              | `phase-11-manual-test.md`                                                               | evidence 引継ぎ                       |
| Phase 2 設計                     | `phase-02-design.md`                                                                    | Part 2（開発者向け）の API 仕様出所   |
| verify スクリプト                | `.claude/scripts/verify-skills-parity.sh`                                               | Part 2 の API / exit code 記録対象    |
| sync スクリプト                  | `.claude/scripts/sync-skills-mirror.sh`                                                 | Part 2 の API / exit code 記録対象    |
| generate-documentation-changelog | `.claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js` | Task 3 の自動生成スクリプト           |
| audit-unassigned-tasks           | `.claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js`           | Task 4 の登録確認                     |
| task-p0-05 mirror sync           | `docs/30-workflows/unassigned-task/task-p0-05-mirror-sync-automation.md`                | Task 4 の将来課題候補                 |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容                    |
| ----------------------- | ------------------------------------------------------------------------------ | ----------------------- |
| task-workflow           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | canonical / mirror 原則 |
| task-workflow-completed | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` | 完了タスク登録テーブル  |
| LOGS.md                 | `.claude/skills/aiworkflow-requirements/LOGS.md`                               | 同期結果ログ            |
| topic-map.md            | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                  | topic 索引              |
| resource-map.md         | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`               | リソース索引            |

## 実行手順

### Task 1: 実装ガイド作成（2 パート構成）

出力先: `outputs/phase-12/implementation-guide.md`

#### Part 1: 初学者・中学生レベル（例え話で説明）

- 冒頭に「鏡写しとは何か」の例え話を配置する
- 専門用語（canonical / mirror / rsync / hook など）は**一切使わない**
- 説明順序: **なぜ必要か → 何をするか → どう便利か**
- 推奨する例え話:

  > 家族で同じ写真アルバムを 2 冊持っていて、1 冊は居間、もう 1 冊は別の部屋に置いている場面を考えます。
  > 本物のアルバムに新しい写真を追加したとき、コピー部屋のアルバムにも同じ写真を入れないと、
  > 家族の誰かが「コピー部屋にだけ行った人」と「本物のアルバムを見た人」で話が噛み合わなくなります。
  > これまでは「追加したらコピー部屋に持っていく」のを人が覚えておく必要がありました。
  > このタスクは、その作業を自動でやってくれる「お手伝いロボット」を置く仕事です。
  > ロボットは 2 匹います。1 匹は「2 冊がズレていないか見張る係」。
  > もう 1 匹は「ズレていたら自動で揃える係」です。
  > さらに、お父さんが家族写真を外に持ち出す（= git push）前に、
  > 見張り係が「2 冊の内容がズレてるよ」と止めてくれる仕組みも追加します。

- Part 1 末尾に「何もしなくていいこと」を箇条書きで示し、ユーザーが身構えなくて良いことを伝える

#### Part 2: 開発者・技術者向け

下記項目をすべて記載する。

| 項目                   | 記載内容                                                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| スクリプト API         | `verify-skills-parity.sh` / `sync-skills-mirror.sh` の関数シグネチャ相当（入力・出力・引数）                                                     |
| exit code 契約         | verify: 0=OK, 1=NG / mirror欠損, 0=SKIP（両root不在またはcanonical不在）。sync: 0=最終 parity OK, 1=再同期後も差分残存 / `--check-only` 差分検出 |
| 環境変数               | `CLAUDE_SKIP_HEAVY_HOOKS=1` による session-init スキップ仕様                                                                                     |
| 実行例                 | Phase 11 `bash-execution-log.txt` から 6 シナリオの command / expected output / actual output を引用                                             |
| エラーハンドリング     | `set -euo pipefail`、bootstrap skip と mirror欠損の分離、rsync 前の mirror-only warning 出力                                                     |
| 設定可能パラメータ     | `--check-only` オプション（sync）、PARITY_SCRIPT 変数（pre-push hook）                                                                           |
| 統合ポイント           | `.husky/pre-push` と `.claude/hooks/session-init.sh` の追記ブロック位置                                                                          |
| 依存コマンド           | `git` / `diff` / `rsync` / `node`（+ `generate-index.js`）                                                                                       |
| トラブルシューティング | parity NG 時の修復手順、husky 未導入時のフォールバック案内、generate-index.js 非 deterministic 時の対処                                          |

- Part 2 末尾に「視覚証跡」セクションを設け、`UI/UX変更なしのため Phase 11 スクリーンショット不要` を明記。代わりに Phase 11 bash 実行ログを参照する旨を記載する
- TypeScript 風の型シグネチャを示すときは shell の関数として擬似表現する（例: `verify_skills_parity() -> { exit_code: 0 | 1 }`）

### Task 2: システム仕様更新（4 サブステップ）

出力先: `outputs/phase-12/system-spec-update-summary.md`

#### Step 1-A: LOGS.md / topic-map.md 更新

- `artifacts.json` と `outputs/artifacts.json` を最初に diff し、title / type / status / phase artifact 名の parity を確認する
- `task-workflow.md` / `task-workflow-completed.md` / `lane/index.md` / `outputs/artifacts.json` / skill artifacts の 5 対象について same-wave 同期チェックを行う
  - `lane/index.md` は lane 非採用 workflow のため `N/A（lane 非採用）` と記録する
- `.claude/skills/aiworkflow-requirements/LOGS.md` に完了タスクエントリを追加
  - エントリ形式: `- 2026-04-19 TASK-AGENTS-SKILLS-FULL-SYNC-001 完了（canonical/mirror full parity guard 導入）`
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` を `generate-index.js --quiet` で再生成
- `.claude/skills/aiworkflow-requirements/indexes/resource-map.md` の current facts を確認し、変更が不要なら `no-op` を明記する
- `.agents/skills/` 側にも `sync-skills-mirror.sh` 経由で同期を反映

#### Step 1-B: 実装状況テーブルへの登録

- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` の実装状況テーブルに追加
  - `task_id`: `TASK-AGENTS-SKILLS-FULL-SYNC-001`
  - `status`: `spec_created`（本タスクは仕様書作成のみ。実装 PR は別ブランチ）
  - `issue_number`: `2278`
  - `category`: `infra-guard`
  - `completed_date`: `2026-04-19`（仕様書完成日）

#### Step 1-C: 関連タスクテーブル更新

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md` に open 側残留がないことを確認し、必要なら完了/関連リンクへ反映する
- `TASK-CONFLICT-PREVENT-001` のエントリにある「後続タスク」列へ `TASK-AGENTS-SKILLS-FULL-SYNC-001` を追加
- `task-p0-05-mirror-sync-automation` エントリの「前提タスク」列に本タスクへの参照を追加
- `task-imp-aiworkflow-same-wave-sync-guard-001` エントリの「隣接タスク」列に本タスクへの参照を追加
- 更新後に `diff -qr .claude/skills .agents/skills` で parity 0 を確認

#### Step 2: 新規インターフェース追加（条件付き）

- 本タスクでは新規 IPC channel・新規 TypeScript API・新規 public 関数のいずれも追加しない
- したがって **Step 2 はスキップ**する（条件付き Step 2 の非適用）
- `system-spec-update-summary.md` に「本タスクは shell スクリプトのみの追加で、アプリケーションレイヤのインターフェースは追加しない。Step 2 スキップ理由: NON_VISUAL infra-guard スコープ」と明記する

### Task 3: ドキュメント更新履歴作成

出力先: `outputs/phase-12/documentation-changelog.md`

実行手順:

```bash
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --task-id TASK-AGENTS-SKILLS-FULL-SYNC-001 \
  --output docs/30-workflows/TASK-AGENTS-SKILLS-FULL-SYNC-001/outputs/phase-12/documentation-changelog.md
```

記録対象:

- 追加ファイル: `.claude/scripts/verify-skills-parity.sh`、`.claude/scripts/sync-skills-mirror.sh`
- 追記ファイル: `.husky/pre-push`、`.claude/hooks/session-init.sh`
- 更新ファイル: LOGS.md / resource-map.md / task-workflow-completed.md / skill-creator 3 ファイル
- 新規同期: `.agents/skills/int-test-skill/` 一式
- 仕様書: 本 Phase 1-13 の 13 本

### Task 4: 未タスク検出レポート作成

出力先: `outputs/phase-12/unassigned-task-detection.md`

**0 件でも出力必須。** 0 件の場合も「本 Phase 実行時点で HIGH / MID / LOW いずれも 0 件」と明記する。

本タスク実装時に発見した将来課題の候補（HIGH/MID/LOW 分類の叩き台）:

| 優先度 | 課題                                                                         | 関連                                                  |
| ------ | ---------------------------------------------------------------------------- | ----------------------------------------------------- |
| MID    | `task-p0-05-mirror-sync-automation` との統合（CI 側で mirror sync を自動化） | 本タスクは local 側ガードのみを提供する               |
| MID    | post-merge hook への parity check 連結（現状は index 再生成のみ）            | `.claude/hooks/post-merge-index-regenerate.sh` と合流 |
| LOW    | worktree 並列で sync が同時実行される場合の lock 機構                        | 現状は pre-push の直列性に依存                        |
| LOW    | `generate-index.js` が非 deterministic になった場合の自動検出ガード          | 現状は sync exit 1 により間接的に検知                 |

レポート末尾で audit-unassigned-tasks.js による登録確認を実行:

```bash
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json \
  --target-file docs/30-workflows/unassigned-task/TASK-AGENTS-SKILLS-FULL-SYNC-001.md
```

### Task 5: スキルフィードバックレポート作成

出力先: `outputs/phase-12/skill-feedback-report.md`

**改善点なしでも出力必須。**

記載項目:

| 項目                                        | 内容                                                                           |
| ------------------------------------------- | ------------------------------------------------------------------------------ |
| task-specification-creator skill の運用評価 | Phase 1-13 骨格の適合度、NON_VISUAL 対応（視覚証跡 N/A 明示ルール）の有効性    |
| 有効だった箇所                              | Phase 2 のコンポーネント分離（C-1〜C-5）、Phase 3 のトレーサビリティマトリクス |
| 改善提案                                    | shell script 専用の Phase 4 テストテンプレート追加（現状は TypeScript 前提）   |
| aiworkflow-requirements skill の参照頻度    | Phase 1 で 3 回、Phase 2 で 2 回、Phase 12 で 5 回（Step 1-A〜1-C 更新時）     |
| aiworkflow-requirements skill の有効性      | canonical / mirror 原則が task 全体を貫く軸となり、責務境界の明文化に直結      |
| 未改善事項                                  | 本タスクでは skill 自体の改善を提案しない（skill は現状維持で十分機能した）    |

## 統合テスト連携

- Phase 11 の `manual-test-result.md` / `bash-execution-log.txt` / `timing-measurement.txt` を Task 1 Part 2 の「実行例」へ引用
- Task 2 Step 1-A の LOGS.md 更新後は `sync-skills-mirror.sh` を実行して mirror へ同期
- Task 4 の audit-unassigned-tasks.js 出力は `unassigned-task-detection.md` に JSON で添付

## 多角的チェック観点（AIが判断）

- 抽象化思考: Part 1（中学生レベル）と Part 2（開発者向け）の用語・抽象度が混ざっていないか
- ダブル・ループ思考: close-out 自体が新たな drift を生まないか（Task 2 Step 1-A 後に parity 0 を再確認）
- 価値提案思考: implementation-guide が「新規参入者が 30 分で理解できる」目標を満たしているか
- 網羅性思考: 必須 5 タスクすべてに正本 evidence が紐付いているか
- 責務境界: Task 2 Step 2 スキップ理由が NON_VISUAL スコープ逸脱回避として正当化されているか

## サブタスク管理

| SubTask | 内容                                                  | 並列性 | 担当 Lane              |
| ------- | ----------------------------------------------------- | ------ | ---------------------- |
| ST-41   | implementation-guide.md Part 1 執筆                   | par    | Lane C（ドキュメント） |
| ST-42   | implementation-guide.md Part 2 執筆                   | par    | Lane C（ドキュメント） |
| ST-43   | system-spec-update-summary.md（Step 1-A / 1-B / 1-C） | seq    | Lane C（ドキュメント） |
| ST-44   | documentation-changelog.md 生成（scripts 実行）       | par    | Lane B（スクリプト）   |
| ST-45   | unassigned-task-detection.md 作成（audit 確認含む）   | par    | Lane B（スクリプト）   |
| ST-46   | skill-feedback-report.md 作成                         | par    | Lane C（ドキュメント） |
| ST-47   | phase12-task-spec-compliance-check.md 作成            | seq    | Lane C（集約）         |

## 成果物

- `outputs/phase-12/implementation-guide.md`（Task 1: Part 1 + Part 2）
- `outputs/phase-12/system-spec-update-summary.md`（Task 2: Step 1-A / 1-B / 1-C / Step 2 スキップ理由）
- `outputs/phase-12/documentation-changelog.md`（Task 3: scripts 自動生成）
- `outputs/phase-12/unassigned-task-detection.md`（Task 4: 0 件でも出力）
- `outputs/phase-12/skill-feedback-report.md`（Task 5: 改善点なしでも出力）
- `outputs/phase-12/phase12-task-spec-compliance-check.md`（5 タスク充足チェック）
- `outputs/artifacts.json`（root `artifacts.json` と same-wave 同期する台帳）

## 完了条件

- [ ] Task 1: `implementation-guide.md` に Part 1（中学生レベル・例え話）と Part 2（開発者向け・API/exit code/環境変数）の両方が揃っている
- [ ] Task 1: Part 2 末尾の `## 視覚証跡` に `UI/UX変更なしのため Phase 11 スクリーンショット不要` を明記している
- [ ] Task 2 Step 1-A: LOGS.md / topic-map.md が更新され、`.agents/` 側にも同期されている
- [ ] Task 2 Step 1-A: `artifacts.json` / `outputs/artifacts.json` の parity が確認されている
- [ ] Task 2 Step 1-B: `task-workflow-completed.md` に `spec_created` で登録されている
- [ ] Task 2 Step 1-C: 関連タスクテーブルに本タスクへの相互参照が追加されている
- [ ] Task 2 Step 1-C: `task-workflow.md` / `task-workflow-completed.md` / `lane/index.md` / `outputs/artifacts.json` / skill artifacts の 5 対象が same-wave で記録されている
- [ ] Task 2 Step 2: 新規インターフェース追加なしのためスキップ理由を明記している
- [ ] Task 3: `documentation-changelog.md` が scripts 経由で自動生成されている
- [ ] Task 4: `unassigned-task-detection.md` が 0 件でも出力されている
- [ ] Task 5: `skill-feedback-report.md` が改善点なしでも出力されている
- [ ] same-wave sync 完了後に `diff -qr .claude/skills .agents/skills` が空出力であることを再確認している
- [ ] planned wording（「予定」「見込み」）を残していない
- [ ] Phase 13 が `blocked` のまま維持されることを明記している

## タスク100%実行確認【必須】

- [ ] Phase 12 必須 5 タスクをすべて列挙した
- [ ] same-wave sync 対象（LOGS / indexes / task-workflow-completed）を記載した
- [ ] NON_VISUAL 規則（視覚証跡 N/A）を記載した
- [ ] Part 1 / Part 2 の役割分担を明記した
- [ ] Step 2 スキップ理由を明記した
- [ ] Phase 13 blocked 維持を明記した

## 次のPhaseへの引き継ぎ

- Phase 13 は user の明示承認を得るまで `blocked` のまま保持する
- 承認後に Phase 13 で実行する local check は、本 Phase の `documentation-changelog.md` と `phase12-task-spec-compliance-check.md` を再利用する
- PR 本文の Summary は本 Phase の `implementation-guide.md` Part 1 の要約 + Part 2 の API 一覧から組み立てる
- PR title は `feat(parity-guard): TASK-AGENTS-SKILLS-FULL-SYNC-001 .claude/.agents skills完全パリティガード実装・Phase12完了` を雛形として Phase 13 で利用する
