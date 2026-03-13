# Phase 4 Output: Mirror Checklist

## canonical root / mirror 基本ルール

1. `.claude/skills/task-specification-creator/` を正本として更新する。
2. `.agents/skills/task-specification-creator/` は `.claude` 更新後に同期する。
3. parent / child / archive の導線は mirror 側でも同名構造を維持する。

## 実施チェックリスト

| チェック          | PASS 条件                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| 正本先行          | `.agents` 側だけ先に更新していない                                                                  |
| file set 同値     | `find` 結果で `.claude` と `.agents` の path が一致する                                             |
| content 同値      | `diff -qr` の差分が 0                                                                               |
| entrypoint parity | `SKILL.md` の family file / archive link が mirror 側にもある                                       |
| archive parity    | `LOGS.md` と `logs-archive-*` が mirror 側にもある                                                  |
| family parity     | `patterns-*`、`phase-template-*`、`spec-update-*`、`phase-11-*` / `phase-12-*` が mirror 側にもある |
| validation parity | `.claude` で PASS した validator 前提を mirror 側の file set が壊していない                         |

## レーン別確認担当

| レーン  | mirror 前の責務                                | mirror 後の確認                             |
| ------- | ---------------------------------------------- | ------------------------------------------- |
| Codex-A | `SKILL.md`、`LOGS.md`、archive files 更新      | entrypoint / archive parity                 |
| Codex-B | `patterns*`、`phase-template*` 更新            | family file parity                          |
| Codex-C | `spec-update*`、`phase-11*` / `phase-12*` 更新 | guide file parity                           |
| Codex-V | 全体同期                                       | `diff -qr`、file list、dependency edge 確認 |

## blocker 条件

- `diff -qr` に差分が残る
- parent file はあるが child file が mirror 側に欠落する
- archive index はあるが archive 実体が mirror 側にない
- `.agents` 側のみに存在する stray file がある
