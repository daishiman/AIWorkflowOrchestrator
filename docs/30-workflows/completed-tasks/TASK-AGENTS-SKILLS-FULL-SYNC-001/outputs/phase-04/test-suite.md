# Phase 4 成果物: テストスイート定義（TDD Red 状態スナップショット付き）

## メタ情報

| 項目       | 値                               |
| ---------- | -------------------------------- |
| Phase      | 4                                |
| 対象タスク | TASK-AGENTS-SKILLS-FULL-SYNC-001 |
| 実行日     | 2026-04-19                       |
| TDD state  | Red（スクリプト未配置時点）      |
| 前提       | Phase 1 / 2 / 3 完了             |

## TC-4-01〜TC-4-12 テスト定義

| TC      | シナリオ                     | 対象         | 入力条件                                   | 実行コマンド                                                   | 期待 exit | 期待出力キー文字列                        |
| ------- | ---------------------------- | ------------ | ------------------------------------------ | -------------------------------------------------------------- | --------- | ----------------------------------------- |
| TC-4-01 | NG 検出（内容差分）          | C-1 verify   | canonical 側 LOGS.md に 1 行追記           | `bash .claude/scripts/verify-skills-parity.sh`                 | 1         | `[parity-check] NG:`                      |
| TC-4-02 | OK 確認（差分なし）          | C-1 verify   | sync 実行直後                              | `bash .claude/scripts/verify-skills-parity.sh`                 | 0         | `[parity-check] OK:`                      |
| TC-4-03 | pre-push abort               | C-3 pre-push | drift 作成 → disposable bare remote push   | `git push "$TMP_REMOTE" HEAD`                                  | 非 0      | `[pre-push] parity NG のため push を中止` |
| TC-4-04 | sync 1 コマンド完結          | C-2 sync     | int-test-skill 未同期 + 内容差分あり       | `bash .claude/scripts/sync-skills-mirror.sh`                   | 0         | `[mirror-sync] 完了: parity OK`           |
| TC-4-05 | `--check-only` 読み取り専用  | C-2 sync     | 内容差分あり                               | `bash .claude/scripts/sync-skills-mirror.sh --check-only`      | 1         | `Files .claude/...`                       |
| TC-4-06 | session-init timing          | C-4          | parity 済                                  | `time bash .claude/hooks/session-init.sh`                      | 0         | real < 1.0 秒                             |
| TC-4-07 | session-init スキップ        | C-4          | `CLAUDE_SKIP_HEAVY_HOOKS=1`                | `CLAUDE_SKIP_HEAVY_HOOKS=1 bash .claude/hooks/session-init.sh` | 0         | parity check ブロック未実行               |
| TC-4-08 | husky 未導入フォールバック   | C-3          | `.husky/pre-push` が存在しない             | `test -f .husky/pre-push \|\| echo "husky not installed"`      | 0         | `husky not installed`                     |
| TC-4-09 | `int-test-skill` mirror 存在 | C-5          | Phase 5 の rsync 後                        | `test -f .agents/skills/int-test-skill/SKILL.md`               | 0         | —                                         |
| TC-4-10 | mirror-only warning 出力     | C-2          | `.agents/skills/dummy-only/README.md` 作成 | `bash .claude/scripts/sync-skills-mirror.sh --check-only`      | 1         | `Only in .agents/skills`                  |
| TC-4-11 | TDD Red（スクリプト未配置）  | C-1          | Phase 5 未実施                             | `bash .claude/scripts/verify-skills-parity.sh`                 | 127       | `No such file or directory`               |
| TC-4-12 | CANONICAL 未存在時の SKIP    | C-1          | `.claude/skills/` を一時退避               | `bash .claude/scripts/verify-skills-parity.sh`                 | 0         | `[parity-check] SKIP:`                    |

## AC トレーサビリティ

| AC   | 対応 TC                                                |
| ---- | ------------------------------------------------------ |
| AC-1 | TC-4-02, TC-4-09                                       |
| AC-2 | TC-4-01, TC-4-02, TC-4-12                              |
| AC-3 | TC-4-04                                                |
| AC-4 | TC-4-03, TC-4-08                                       |
| AC-5 | TC-4-09                                                |
| AC-6 | TC-4-06, TC-4-07                                       |
| AC-7 | Phase 5 差分レビューで対応（`.gitattributes` 非変更）  |
| AC-9 | Phase 5 差分レビューで対応（EVALS.json schema 非変更） |

## Red state スナップショット実測（Phase 5 前）

```
$ test ! -f .claude/scripts/verify-skills-parity.sh && echo "[Red] verify script absent (OK for Red state)"
[Red] verify script absent (OK for Red state)

$ test ! -f .claude/scripts/sync-skills-mirror.sh && echo "[Red] sync script absent (OK for Red state)"
[Red] sync script absent (OK for Red state)

$ bash .claude/scripts/verify-skills-parity.sh
bash: .claude/scripts/verify-skills-parity.sh: No such file or directory
exit=127
```

TC-4-11（TDD Red）の期待通り `exit 127 / No such file or directory` を実測確認。

## 実測 drift snapshot

`red-state-diff-snapshot.txt` に保存された同日計測:

- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` と mirror 側が differ
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` と mirror 側が differ
- `.claude/skills/skill-creator/LOGS.md` と mirror 側が differ
- `.claude/skills/skill-creator/SKILL.md` と mirror 側が differ

計 4 ファイルの内容差分を確認。仕様書 Phase 1 想定（6 件）から drift 内訳は変動しているが、`rsync -a --delete` による canonical → mirror 一方向同期で全件解消可能（Phase 5 で実施）。

## 完了条件チェック

- [x] TC-4-01〜TC-4-12 が定義され、各 exit code と期待出力キー文字列を記載
- [x] AC-1〜AC-9 に対応する TC 対応表を作成（AC-7 / AC-9 は Phase 5 差分レビュー対応）
- [x] TDD Red state の事前スナップショット実測（exit 127 確認）
- [x] session-init 1 秒未満目標の計測コマンド記載
- [x] husky 未導入フォールバック確認手順記載
- [x] int-test-skill mirror 存在チェック（TC-4-09）独立
- [x] mirror-only warning 出力確認（TC-4-10）独立

## 次 Phase への引き継ぎ

- Phase 5 で `drift 解消 → script 配置 → hook 配置` の厳密な順序で実装を行い、TC-4-09 → TC-4-01〜04 → TC-4-06〜08 を順次 Green 化する
- TC-4-11 の Red state は本成果物で永続化済み（`red-state-diff-snapshot.txt`）
