# Phase 1: 要件定義

## メタ情報

| 項目                | 値                                                              |
| ------------------- | --------------------------------------------------------------- |
| Phase               | 1                                                               |
| 機能名              | TASK-AGENTS-SKILLS-FULL-SYNC-001                                |
| 作成日              | 2026-04-19                                                      |
| 種別                | NON_VISUAL / infra-guard / spec_created                         |
| implementation_mode | new                                                             |
| 発見元              | TASK-CONFLICT-PREVENT-001 Phase 12（unassigned-task-detection） |

## 目的

`.claude/skills/`（canonical root）と `.agents/skills/`（mirror）の**全ファイル完全一致（full parity）を継続的に保証するガード**を設計するための acceptance criteria と inventory を固定する。TASK-CONFLICT-PREVENT-001 で導入された merge policy・deterministic generator の上に、`parity 検出 → 自動修復 → pre-push 禁止`の三層で drift を止める。

## タスク分類（task-specification-creator 規約）

| 項目             | 値                                                  |
| ---------------- | --------------------------------------------------- |
| UI 変更          | なし（NON_VISUAL）                                  |
| 画面遷移         | なし                                                |
| 新規 IPC channel | なし                                                |
| artifact 命名    | `verify-skills-parity.sh` / `sync-skills-mirror.sh` |
| 主な影響レイヤ   | `.claude/scripts/`、`.claude/hooks/`、`.husky/`     |

## 実行タスク

1. 現行 drift 6 ファイル（LOGS / indexes / task-workflow-completed / skill-creator 3 ファイル）と canonical-only 1 スキル（`int-test-skill`）を棚卸しし、parity の初期状態を固定する
2. TASK-CONFLICT-PREVENT-001 の成果物（`.gitattributes` / `post-merge-index-regenerate.sh` / `session-init.sh`）と本タスクの責務境界を明文化する
3. `diff -qr` / `rsync -a --delete` / generate-index.js の呼び出し順序を Phase 2 設計の入力として固定する
4. pre-push / session-init / post-merge の 3 hook 差し込みポイントと重複回避方針を決める
5. `int-test-skill` を mirror へ初回同期する扱いを Phase 5 実装ステップに織り込む（drift 解消は Phase 5、ガード導入は Phase 5 後半で切り分ける）
6. Phase 4 以降のテスト観点（NG / OK / pre-push abort / skill 追加）を列挙する

## 受入基準

- AC-1: `diff -qr .claude/skills .agents/skills` が空出力となる状態を Phase 5 完了時点で確立できる
- AC-2: `verify-skills-parity.sh` が差分あり時 exit 1、なし時 exit 0 を deterministic に返す
- AC-3: `sync-skills-mirror.sh` は `rsync -a --delete` → `generate-index.js --quiet` → `diff -qr` の 3 ステップを単一コマンドで完結させる
- AC-4: pre-push hook は parity NG 時に push を中止し、`--no-verify` 回避導線を設けない
- AC-5: `int-test-skill` が `.agents/skills/int-test-skill/` 配下に SKILL.md ごと同期されている
- AC-6: session-init.sh の parity warning は `diff -qr` の実行コストを 1 秒未満に抑える（`CLAUDE_SKIP_HEAVY_HOOKS=1` でスキップ可能にする）
- AC-7: `.gitattributes` の merge policy（`merge=union` / `merge=ours`）は本タスクで変更しない（TASK-CONFLICT-PREVENT-001 のスコープを侵さない）
- AC-8: 本仕様書の Phase 13 は user の明示承認があるまで `blocked` を維持する
- AC-9: EVALS.json の schema は本タスクで変更しない（AC-6 of TASK-CONFLICT-PREVENT-001 を踏襲）

## Inventory（実測差分 2026-04-18 時点）

| 差分種別   | ファイル / ディレクトリ                                                        | Phase 5 対応方針                            |
| ---------- | ------------------------------------------------------------------------------ | ------------------------------------------- |
| 内容差分   | `.claude/skills/aiworkflow-requirements/LOGS.md`                               | rsync で canonical を正本に mirror へ上書き |
| 内容差分   | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`               | rsync 後に generate-index.js 再生成         |
| 内容差分   | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` | rsync で canonical を正本に mirror へ上書き |
| 内容差分   | `.claude/skills/skill-creator/SKILL.md`                                        | rsync で canonical を正本に mirror へ上書き |
| 内容差分   | `.claude/skills/skill-creator/references/knowledge-management-guide.md`        | rsync で canonical を正本に mirror へ上書き |
| 内容差分   | `.claude/skills/skill-creator/scripts/generate_skill_md.js`                    | rsync で canonical を正本に mirror へ上書き |
| mirror不在 | `.claude/skills/int-test-skill/`                                               | rsync で mirror へ新規配置                  |

> 実測は Phase 1 実行時の `/tmp/skills-diff-YYYYMMDD.txt` で再取得する。差分ファイルが増減した場合は Phase 2 設計へ波及させる。

## 参照資料

| 資料名                     | パス                                                                                          | 用途                                     |
| -------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------- |
| task-specification-creator | `.claude/skills/task-specification-creator/SKILL.md`                                          | Phase 1-13 骨格、P50 チェック            |
| aiworkflow-requirements    | `.claude/skills/aiworkflow-requirements/SKILL.md`                                             | canonical / mirror 原則                  |
| TASK-CONFLICT-PREVENT-001  | `docs/30-workflows/completed-tasks/conflict-prevent-skills-001/`                              | 直上タスクの成果物と責務境界             |
| 発見元 unassigned-task     | `docs/30-workflows/conflict-prevent-skills-001/outputs/phase-12/unassigned-task-detection.md` | HIGH 優先 follow-up としての初期レポート |
| 単一ファイル版仕様書       | `docs/30-workflows/unassigned-task/TASK-AGENTS-SKILLS-FULL-SYNC-001.md`                       | Issue #2278 本文（本仕様の元ネタ）       |
| post-merge hook            | `.claude/hooks/post-merge-index-regenerate.sh`                                                | 本タスクの同期フックと統合先             |
| session-init hook          | `.claude/hooks/session-init.sh`                                                               | parity warning 差し込み先                |
| setup-merge-drivers        | `.claude/scripts/setup-merge-drivers.sh`                                                      | merge.ours.driver 登録参照               |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、canonical / mirror 運用との整合性を確保する。

| 参照資料              | パス                                                                 | 内容                                            |
| --------------------- | -------------------------------------------------------------------- | ----------------------------------------------- |
| canonical root policy | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` | `.claude` を正本とし mirror を派生とする原則    |
| generate-index 契約   | `.claude/skills/aiworkflow-requirements/scripts/generate-index.js`   | deterministic regenerate と index parity の契約 |
| merge policy          | `.gitattributes` / `.claude/scripts/setup-merge-drivers.sh`          | 本タスクの前提条件                              |

## P50 チェック（Phase 1 冒頭）

| 確認項目                         | 判定 | 対応                                                                                             |
| -------------------------------- | ---- | ------------------------------------------------------------------------------------------------ |
| 現ブランチに実装が存在する       | No   | Phase 5 で新規実装として扱う（差分確認モードではない）                                           |
| upstream main にマージ済み       | No   | 未マージ。仕様書作成のみ本タスクで行い、実装 PR は別ブランチで対応する                           |
| 前提タスクが完了済み             | Yes  | TASK-CONFLICT-PREVENT-001 は `docs/30-workflows/completed-tasks/conflict-prevent-skills-001/` 済 |
| 実装コード変更を本タスクで行うか | No   | 本タスクは仕様書作成のみ（commit / PR 禁止）                                                     |

## 実行手順

### ステップ 0: 差分スナップショット取得

```bash
diff -qr .claude/skills .agents/skills 2>/dev/null | tee /tmp/skills-diff-$(date +%Y%m%d).txt
diff -qr .claude/skills .agents/skills 2>/dev/null | grep "^Only in .claude/skills" > /tmp/skills-only-canonical.txt
diff -qr .claude/skills .agents/skills 2>/dev/null | grep "^Only in .agents/skills" > /tmp/skills-only-mirror.txt
diff -qr .claude/skills .agents/skills 2>/dev/null | grep "^Files.*differ"         > /tmp/skills-files-differ.txt
```

### ステップ 1: 差分分類

差分を以下の 3 類型へ機械的に割り振る。

| 分類                  | 判定基準                          | 初期処理（Phase 5）                     |
| --------------------- | --------------------------------- | --------------------------------------- |
| 内容差分              | `Files ... differ` に該当         | rsync で canonical を正本に上書き       |
| canonical-only スキル | `Only in .claude/skills` に該当   | rsync で mirror へ追加                  |
| mirror-only ファイル  | `Only in .agents/skills` に該当   | 削除前に **必ず** 独自変更の有無を確認  |
| 生成物 index          | `indexes/*.json` / `indexes/*.md` | rsync 後に `generate-index.js` で再生成 |

### ステップ 2: 責務境界の固定

| タスク                                       | 責務                                                           | 本タスクとの境界                                   |
| -------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------- |
| TASK-CONFLICT-PREVENT-001                    | merge policy / `.gitattributes` / deterministic generator 設計 | 本タスクは merge policy を変更しない               |
| **TASK-AGENTS-SKILLS-FULL-SYNC-001（本）**   | **parity 継続検証・自動同期・CI / hook 組み込み**              | -                                                  |
| task-imp-aiworkflow-same-wave-sync-guard-001 | manual canonical docs の same-wave closure（ledger / backlog） | 本タスクはスキル 2 ルート間のみを対象              |
| task-p0-05-mirror-sync-automation            | CI での mirror sync 自動化（より大規模）                       | 本タスクは pre-push と session-init を最小限で提供 |

### ステップ 3: スクリプト / hook 差し込み設計点の確定

| 位置                                           | 役割                                           | 実行頻度                  |
| ---------------------------------------------- | ---------------------------------------------- | ------------------------- |
| `.claude/scripts/verify-skills-parity.sh`      | `diff -qr` の成否を exit code で返す           | 手動 / CI / hook 呼び出し |
| `.claude/scripts/sync-skills-mirror.sh`        | rsync + generate-index + 再検証の一括実行      | 手動 / 自動修復           |
| `.husky/pre-push`                              | push 前に parity を強制検証                    | push ごと                 |
| `.claude/hooks/session-init.sh`                | セッション開始時の parity warning 追記         | Claude Code 起動時        |
| `.claude/hooks/post-merge-index-regenerate.sh` | 既存 hook に parity チェックを連結（将来検討） | merge / checkout 時       |

## 多角的チェック観点（AIが判断）

- 批判的思考: `rsync --delete` が mirror の独自変更を破壊しないか。Phase 1 の mirror-only ファイル確認ステップが十分か
- 要素分解: 内容差分 / canonical-only / mirror-only / 生成物 index の 4 類型が MECE か
- システム思考: pre-push / session-init / post-merge の 3 hook が重複しないか、順序が副作用を起こさないか
- why思考: 「手 rsync 忘れ」の根本原因が人の記憶依存であることを踏まえ、人手介入を減らす設計になっているか
- トレードオン思考: `diff -qr` のコスト（セッション起動遅延）と drift 検出頻度のバランスが取れているか
- 生成ファイル思考: index 再生成を rsync 後に固定することで、JSON の手マージを永久に回避できているか

## サブタスク管理

| SubTask | 内容                                         | 並列性 | 担当 Lane          |
| ------- | -------------------------------------------- | ------ | ------------------ |
| ST-1    | drift 実測スナップショット取得 / 分類        | seq    | Lane A（観測）     |
| ST-2    | TASK-CONFLICT-PREVENT-001 との責務境界明文化 | par    | Lane B（責務整理） |
| ST-3    | 3 hook 差し込み設計点の確定                  | par    | Lane C（hook）     |
| ST-4    | acceptance criteria 集約                     | seq    | Lane A（まとめ）   |

## 成果物

- `/tmp/skills-diff-YYYYMMDD.txt` / canonical-only / mirror-only / files-differ の 4 分類ログ
- Phase 1 確定の acceptance criteria リスト（AC-1 〜 AC-9）
- 差し込み点 5 箇所の設計サマリ（Phase 2 入力）
- タスク分類テーブル（NON_VISUAL / infra-guard）

## 完了条件

- [ ] `/tmp/skills-diff-YYYYMMDD.txt` が取得され、3 類型分類テーブルが埋まっている
- [ ] TASK-CONFLICT-PREVENT-001 との責務境界が本仕様書に明記されている
- [ ] acceptance criteria AC-1〜AC-9 が全て verifiable な文言で記述されている
- [ ] Phase 2 以降で参照する 5 つの差し込み点（scripts 2 本 / hook 3 箇所）が確定している
- [ ] `.gitattributes` と EVALS.json に手を入れない旨が明文化されている

## Phase 2 への引き継ぎ

- 差分 7 件（内容差分 6 + canonical-only 1）の rsync 対象リスト
- Phase 5 実装順（`drift 解消 → script 配置 → hook 配置`）の固定
- pre-push hook の husky 既存設定との共存方針（上書きではなく追記）

## 統合テスト連携

- Phase 4 では AC-1〜AC-9 を TC に 1:1 でトレースし、差分検出・同期・hook abort を個別に検証する
- Phase 5 / 9 では本 Phase の inventory 7 件を初回 rsync 入力と parity 収束確認の根拠として使う
- Phase 11 では NON_VISUAL 代替証跡として bash 実行ログへ AC-2 / AC-4 / AC-6 の実測結果を引き渡す
