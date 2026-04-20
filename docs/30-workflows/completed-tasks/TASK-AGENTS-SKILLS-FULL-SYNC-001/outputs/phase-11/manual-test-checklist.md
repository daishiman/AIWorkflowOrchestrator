# Phase 11 手動テスト checklist（補助成果物）

## 実行準備

- [x] 作業用ブランチが clean（`git status` 確認、本タスクの前提変更のみ）
- [x] `outputs/phase-11/` ディレクトリ作成
- [x] `diff-snapshot-before-after.txt` に実行前 snapshot 保存（空出力 = parity OK 状態で開始）

## 6 シナリオ checklist

### シナリオ 1: 差分検出（NG ケース）

- [x] canonical 側 `LOGS.md` に drift を追加
- [x] `verify-skills-parity.sh` 実行
- [x] stdout に `[parity-check] NG:` を含む
- [x] stdout に `修正: bash .claude/scripts/sync-skills-mirror.sh` を含む
- [x] exit code = 1
- [x] `git checkout` で drift を復元

### シナリオ 2: 同期・修復（OK ケース）

- [x] drift 作成後に `sync-skills-mirror.sh` 実行
- [x] 最終行が `[mirror-sync] 完了: parity OK`
- [x] 直後の `verify-skills-parity.sh` が exit 0
- [x] `diff -qr .claude/skills .agents/skills` 出力が空（exit 0）

### シナリオ 3: pre-push abort（isolated 実測）

- [x] disposable local bare remote への push で exit=1 を確認（ただし停止理由は esbuild 環境問題）
- [x] 環境問題の切り分けを `discovered-issues.md` に Note 記録
- [x] pre-push hook 末尾の parity gate block を `bash -c` で isolated 実行
- [x] isolated: exit=1
- [x] isolated: `[pre-push] parity NG のため push を中止します。` が出力に含まれる
- [x] isolated: `sync-skills-mirror.sh` の案内が出力に含まれる（count=2）
- [x] 事後処理: commit を soft reset、LOGS.md を復元、remote dir を削除

### シナリオ 4: int-test-skill の mirror 確認

- [x] `ls -la .agents/skills/int-test-skill/SKILL.md` で stat 出力あり
- [x] exit code = 0
- [x] ファイルサイズ ≥ 1 byte（実測 1016 bytes）

### シナリオ 5: 全量検証

- [x] `diff -qr .claude/skills .agents/skills` exit=0、出力空
- [x] `node generate-index.js --quiet` exit=0
- [x] `node validate-structure.js .claude/skills/aiworkflow-requirements` exit=0

### シナリオ 6: CLAUDE_SKIP_HEAVY_HOOKS=1 opt-out + timing

- [x] `CLAUDE_SKIP_HEAVY_HOOKS=1 bash .claude/hooks/session-init.sh` 実行
- [x] stdout に `parity` を含む行が 0 件（完全スキップ）
- [x] 全体 exit code = 0
- [x] timing 実測 Run 1（opt-out）: 0.228s（< 1 秒）
- [x] timing 実測 Run 2（normal / parity OK）: 0.384s（< 1 秒）
- [x] timing 実測 Run 3（normal / parity NG）: 0.443s（< 1 秒）

## HIGH 検出時の unassigned-task 自動生成フロー

- [x] Phase 11 で HIGH 問題が検出されたか判定 → **検出なし（0 件）**
- [x] HIGH が 1 件以上ある場合の follow-up task 生成 → **スキップ（HIGH 0 件のため不要）**
- [x] `discovered-issues.md` に Blocker / HIGH / Note / Info を分類記録

## 正本 evidence のまとめ

- [x] `manual-test-result.md` を正本 evidence とした
- [x] `manual-test-checklist.md`（本ファイル）を補助成果物として残した
- [x] `discovered-issues.md` に HIGH / Note / Info 分類を記載
- [x] `bash-execution-log.txt` と `timing-measurement.txt` を evidence として出力

## Phase 12 への申し送り

- [x] `bash-execution-log.txt` / `timing-measurement.txt` を `implementation-guide.md` Part 2 で引用予定
- [x] `manual-test-result.md` を `phase12-task-spec-compliance-check.md` の evidence として渡す
- [x] HIGH 問題が生成した unassigned-task 仕様書は 0 件 → `unassigned-task-detection.md` は「検出なし」で記述予定

## Phase 13 の扱い再確認

- [x] Phase 13 は user 明示承認まで `blocked` 維持
- [x] 本 Phase 11 で project remote への push / PR 作成は一切実行していない
- [x] disposable local bare remote の使用のみ（Phase 11 evidence 用途）
