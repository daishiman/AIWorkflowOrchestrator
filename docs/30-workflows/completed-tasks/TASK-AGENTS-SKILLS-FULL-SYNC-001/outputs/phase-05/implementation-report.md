# Phase 5 成果物: 実装レポート

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 5                                      |
| 対象タスク | TASK-AGENTS-SKILLS-FULL-SYNC-001       |
| 実行日     | 2026-04-19                             |
| TDD state  | Red → Green                            |
| 完了状態   | PASS（parity 0 差分、AC-1〜AC-5 成立） |

## 実装 artifact

### 新規作成

| パス                                      | 行数 | 実行権 | 主機能                                           |
| ----------------------------------------- | ---- | ------ | ------------------------------------------------ |
| `.claude/scripts/verify-skills-parity.sh` | 40   | 755    | `diff -qr` による parity 検出。exit 0/1/0(skip)  |
| `.claude/scripts/sync-skills-mirror.sh`   | 50   | 755    | generate-index → rsync --delete → 最終 diff 3 段 |

### 修正（追記のみ、既存上書きなし）

| パス                            | 追記位置                                     | 機能                                                           |
| ------------------------------- | -------------------------------------------- | -------------------------------------------------------------- |
| `.husky/pre-push`               | 末尾（`All pre-push checks passed!` の直後） | parity NG で exit 1、blocking gate                             |
| `.claude/hooks/session-init.sh` | `merge.ours.driver` 未設定警告ブロックの直後 | parity NG の warning のみ、`CLAUDE_SKIP_HEAVY_HOOKS=1` opt-out |

### drift 解消（rsync -a --delete）

Phase 1 仕様書想定（6 件）から実測時点の drift は下記 4 件に変動:

- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`
- `.claude/skills/skill-creator/LOGS.md`
- `.claude/skills/skill-creator/SKILL.md`

全 4 件を canonical → mirror 一方向同期で解消。

### int-test-skill 同期

- canonical `.claude/skills/int-test-skill/` 側から mirror `.agents/skills/int-test-skill/` へ rsync で同期
- `test -f .agents/skills/int-test-skill/SKILL.md` で `[OK] int-test-skill synced to mirror` を実測

### 変更していない（AC-7 / AC-9 遵守）

- `.gitattributes` — `git diff` 空出力を `gitattributes-diff.txt` に記録
- `**/EVALS.json` — `git diff` 空出力を `evals-diff.txt` に記録

## 実装順序（厳守記録）

| 実行 | 内容                                                         | 実測結果                                   |
| ---- | ------------------------------------------------------------ | ------------------------------------------ |
| 1    | drift snapshot（before）                                     | `skills-diff-phase5-before.txt`（4 件）    |
| 2    | mirror-only 確認                                             | `skills-only-mirror-phase5.txt`（0 件）    |
| 3    | rsync -a --delete（初回）                                    | `int-test-skill` 同期完了                  |
| 4    | `verify-skills-parity.sh` 配置（chmod +x）                   | 755、40 行                                 |
| 5    | `sync-skills-mirror.sh` 配置（chmod +x）                     | 755、50 行                                 |
| 6    | `.husky/pre-push` へ parity gate 追記                        | 末尾追記のみ、既存 270 行非破壊            |
| 7    | `.claude/hooks/session-init.sh` へ parity warning 追記       | 既存 merge driver 警告直後、opt-out 分岐付 |
| 8    | `generate-index.js --quiet` + rsync 再実行（sync script 内） | `sync-final.log` に `parity OK` 記録       |

### sync-skills-mirror.sh の順序調整（仕様書からの修正点）

仕様書 Phase 5 は `rsync → generate-index → diff` の 3 ステップを想定していたが、実測では `generate-index.js` が canonical 側の `indexes/keywords.json` のみを更新する `__dirname` 相対スクリプトであることを確認（`.claude/skills/aiworkflow-requirements/scripts/generate-index.js:17-24` 参照）。rsync を先に走らせると最終 diff で `keywords.json` の差分が残存する問題が発生したため、順序を以下に修正した:

```
generate-index（canonical 側 index 最新化）
→ rsync -a --delete（canonical → mirror で index を含めて完全同期）
→ diff -qr（最終 parity 確認）
```

使用コマンドは仕様書の 3 種類（rsync / generate-index / diff）から変更なし。最終的な parity ゴールは達成（exit 0）。

## 最終実測結果

### sync 最終ログ（`sync-final.log`）

```
[mirror-sync] index 再生成中...
[mirror-sync] rsync 開始: canonical → mirror
[mirror-sync] parity 最終確認...
[mirror-sync] 完了: parity OK
```

### verify 最終ログ（`verify-final.log`）

```
[parity-check] OK: .claude/skills と .agents/skills に差分はありません
```

### 最終 diff（`skills-diff-phase5-after.txt`）

```
（空出力、0 行）
```

## TC-4 系 Green 化

| TC      | 期待                                          | 実測                                     | 判定                   |
| ------- | --------------------------------------------- | ---------------------------------------- | ---------------------- |
| TC-4-09 | `.agents/skills/int-test-skill/SKILL.md` 存在 | 存在確認済                               | PASS                   |
| TC-4-02 | verify で parity OK                           | `[parity-check] OK:` / exit 0            | PASS                   |
| TC-4-04 | sync 1 コマンドで parity OK                   | `[mirror-sync] 完了: parity OK` / exit 0 | PASS                   |
| TC-4-11 | Red state で exit 127（Phase 5 前実測）       | `No such file or directory` / exit=127   | PASS（Phase 4 で記録） |

## 完了条件チェック

- [x] 初回 rsync で drift ファイルが解消されている（4 件 → 0 件）
- [x] `.agents/skills/int-test-skill/SKILL.md` が存在する
- [x] `.claude/scripts/verify-skills-parity.sh` が配置され実行権あり
- [x] `.claude/scripts/sync-skills-mirror.sh` が配置され実行権あり
- [x] `.husky/pre-push` に parity gate ブロックが追記（既存 hook 非破壊）
- [x] `.claude/hooks/session-init.sh` に parity warning が追記（opt-out 分岐あり）
- [x] `generate-index.js --quiet` 実行後に `diff -qr` が空出力
- [x] すべてのスクリプトに `set -euo pipefail`
- [x] `.gitattributes` / EVALS.json が変更されていない（git diff 空出力）

## 次 Phase への引き継ぎ

- Phase 6 で fail path（generate-index エラー / 権限エラー / root 不在）の境界条件を確認
- `skills-diff-phase5-after.txt`（空出力）を Phase 9 品質保証の parity evidence として再利用
- Phase 4 の TC-4-01〜TC-4-12 のうち副作用がないものを Phase 11 manual test で再実行
