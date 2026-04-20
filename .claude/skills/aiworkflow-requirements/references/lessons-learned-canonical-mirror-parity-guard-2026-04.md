# lessons-learned: canonical/mirror parity guard 導入（2026-04）

> TASK-AGENTS-SKILLS-FULL-SYNC-001 で得た知見。`.claude/skills/`（canonical）と `.agents/skills/`（mirror）の完全パリティ保証で同じ課題を将来簡潔に解決するための記録。

## 背景

TASK-CONFLICT-PREVENT-001 で `.gitattributes` の merge policy / deterministic index 生成 / post-merge hook / session-init 警告は整備済みだったが、「full parity を継続的に検証するガード」が欠落していた。本タスクで `verify-skills-parity.sh` / `sync-skills-mirror.sh` を追加し、pre-push と session-init で自動化した。

## 苦戦した点と解決策

### 1. pre-push hook の gate 優先順位問題

| 項目       | 内容                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------- |
| 事象       | full pre-push hook 経由で `git push` すると Phase 1（shared-build）で先に落ち、parity gate 未到達           |
| 原因       | `.husky/pre-push` の gate 順序が lint/build/typecheck/test → parity となっており、前段失敗で末尾到達しない |
| 一次検証   | `bash -c` で parity gate block のみ isolated 実行 → AC-4 ロジック要件（exit=1 / abort / sync 案内）は充足  |
| 判断       | gate 優先順位はスコープ外。先頭配置は「lint 通ったのに parity で弾かれる」UX 逆転を招く                    |
| 将来的検討 | `task-skills-parity-prepush-precedence-001` 相当で別タスク化                                               |

### 2. esbuild darwin-arm64 バージョン不整合

| 項目   | 内容                                                                                |
| ------ | ----------------------------------------------------------------------------------- |
| 事象   | `Host version "0.27.2" does not match binary version "0.25.12"` で shared-build 失敗 |
| 対処   | `pnpm install` 再実行 または `pnpm --force rebuild esbuild`                         |
| 教訓   | parity guard の評価と binary 環境問題は切り分けて扱うこと                           |

### 3. rsync -a --delete の順序設計

```
1. diff -qr で mirror-only ファイルを事前検出 → 警告出力
2. node generate-index.js --quiet で canonical 側 index 再生成
3. rsync -a --delete canonical/ mirror/（mirror-only は削除、timestamp まで複製）
4. 最終 diff -qr で parity 0 を確認
```

- `--delete` は削除前に warning を出すことで「意図せず削除される mirror-only ファイル」を可視化する
- index 再生成を rsync より前に行う理由: mirror に流すデータを deterministic な最新状態にするため

### 4. session-init timing（< 1 秒要件）の実測

| 条件                          | real 時間 | 備考                       |
| ----------------------------- | --------- | -------------------------- |
| opt-out（SKIP_HEAVY_HOOKS=1） | 0.228s    | parity block 完全スキップ  |
| normal（parity OK）           | 0.384s    | diff -qr の差分なし経路    |
| normal（parity NG）           | 0.443s    | diff -qr オーバーヘッド+   |

- `CLAUDE_SKIP_HEAVY_HOOKS=1` は parity block 先頭の early return で opt-out される
- `diff -qr` は数十ミリ秒で済み、1 秒基準に対して十分な margin

### 5. canonical-only スキルの mirror 同期

- `int-test-skill` は canonical にのみ存在し mirror 未配置だった
- `sync-skills-mirror.sh` 初回実行で `int-test-skill/SKILL.md`（1016 bytes）が timestamp 含めて完全複製されることを確認
- 「canonical-only」は drift 発生前に parity guard が検出する運用に切り替わった

### 6. worktree 並列での race condition（未対応）

- 複数 worktree から同時に `sync-skills-mirror.sh` を起動すると `.agents/skills/` への rsync が競合する可能性がある
- 現状は lock 未実装。将来 `flock` による排他制御が必要になった場合は本スキルに追記する
- 当面は pre-push hook の直列性により事実上のシリアライズが効く

## 将来同様課題を解決するための原則

1. **「検証＋修復」を 1 セットで実装**: verify 単体では drift が止まらないため、sync スクリプトを必ず対で用意する
2. **pre-push + session-init の二段防御**: push 直前の強制検証と、セッション開始時の早期警告を両立
3. **opt-out 経路を用意**: 重い hook には `CLAUDE_SKIP_HEAVY_HOOKS=1` で早期 return を入れる
4. **exit code 契約を明文化**: bootstrap skip（両 root 不在）と NG（mirror 欠損 / 差分）を区別する
5. **deterministic index 生成を前提**: rsync 前に `generate-index.js --quiet` を走らせて状態を固定する

## 関連成果物

| 成果物                                    | パス                                                           |
| ----------------------------------------- | -------------------------------------------------------------- |
| `verify-skills-parity.sh`                 | `.claude/scripts/verify-skills-parity.sh`                      |
| `sync-skills-mirror.sh`                   | `.claude/scripts/sync-skills-mirror.sh`                        |
| pre-push 組込み                           | `.husky/pre-push`                                              |
| session-init 警告                         | `.claude/hooks/session-init.sh`                                |
| Phase 11 timing 実測                      | `docs/30-workflows/completed-tasks/TASK-AGENTS-SKILLS-FULL-SYNC-001/outputs/phase-11/timing-measurement.txt` |
| Phase 11 発見事項                         | `docs/30-workflows/completed-tasks/TASK-AGENTS-SKILLS-FULL-SYNC-001/outputs/phase-11/discovered-issues.md`   |
