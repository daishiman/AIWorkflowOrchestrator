# 実装ガイド: TASK-AGENTS-SKILLS-FULL-SYNC-001（.claude/.agents skills 完全パリティガード）

本書は 2 部構成。Part 1 は初学者・中学生レベルで日常のたとえだけで説明し、Part 2 は開発者向けに API / exit code / 環境変数 / 実行例を網羅する。

---

## Part 1: なぜこの仕組みが必要なのか（中学生レベル）

### 例え話 ─ 「2 冊の写真アルバム」

家族で同じ写真アルバムを 2 冊持っていて、1 冊は居間、もう 1 冊は別の部屋（コピー部屋）に置いている場面を考えます。

本物のアルバムに新しい写真を追加したとき、コピー部屋のアルバムにも同じ写真を入れないと、家族の誰かが「コピー部屋にだけ行った人」と「本物のアルバムを見た人」で話が噛み合わなくなります。

これまではこの「追加したらコピー部屋に持っていく」のを人が覚えておく必要がありました。今回のタスクは、その作業を自動でやってくれる「お手伝いロボット」を置く仕事です。

ロボットは 2 匹います。

- 1 匹目 ─ 「2 冊がズレていないか見張る係」
- 2 匹目 ─ 「ズレていたら自動で揃える係」

さらに、外に持ち出す直前に、見張り係が「今、2 冊の内容がズレてるよ。今は出したらダメだよ」と教えてくれる門番も置きました。

### なぜ必要か

- 本物のアルバムが 1 冊なら起きない問題ですが、このプロジェクトでは別の場所にある 2 冊をみんなが見ています
- 片方だけ更新して反対側を忘れると、AI が古い情報を読んで答えを間違えることがありました
- そこで「2 冊がいつも完全に同じ内容であること」をロボットに守らせる、というのが今回の目的です

### 何をするか

- 家族の誰かが新しい写真（ファイル）を貼り足したら、見張り係がすぐ「コピー部屋と違うよ」と教えてくれる
- 揃え係に命じると、30 秒以内に 2 冊をピッタリ同じにしてくれる
- 外に出す（push する）前にも見張り係が走ってくれるので、「うっかり片方だけを外に持ち出す」ことがなくなる

### 今回作ったもの

- 2 冊のズレを見つける見張り係
- ズレた 2 冊を同じに戻す揃え係
- 外に持ち出す直前に止める門番
- 作業を始めた瞬間に知らせる案内板

### どう便利か

- これまでは「人が覚えておく」タスクだったので、疲れているときに忘れていた
- これからは「ロボットが絶対に忘れない」ので、家族みんなが安心して自分の仕事に集中できる
- 見張り係は 1 秒もかからない軽さなので、作業の邪魔にもなりません

### 何もしなくていいこと（ユーザーへ）

- いつもどおり本物の 1 冊だけを直せば十分です。もう 1 冊を手で写し直す必要はありません
- 外に出す前の見張りも自動で動くので、特別な操作を毎回覚える必要はありません
- もしズレても、案内どおりに 1 回そろえ直せば元どおりになります

---

## Part 2: 開発者・技術者向け

### TypeScript 型定義

```ts
type ParityExitCode = 0 | 1;

interface ScriptExecutionResult {
  exitCode: ParityExitCode;
  stdout: string;
  stderr?: string;
}

interface ParityCheckSummary {
  canonicalPath: string;
  mirrorPath: string;
  differs: boolean;
  diffLines: string[];
}
```

### CLIシグネチャ

#### 1. `.claude/scripts/verify-skills-parity.sh`

```text
verify_skills_parity() -> { exit_code: 0 | 1 }
```

| 項目   | 内容                                                                                                     |
| ------ | -------------------------------------------------------------------------------------------------------- |
| 入力   | 引数なし / stdin なし                                                                                    |
| 出力   | stdout: `[parity-check] OK:` または `[parity-check] NG: 以下の差分が検出されました:` + `diff -qr` の出力 |
| 判定軸 | `.claude/skills` と `.agents/skills` の `diff -qr` 結果                                                  |
| 依存   | `git` / `diff`                                                                                           |

#### 2. `.claude/scripts/sync-skills-mirror.sh`

```text
sync_skills_mirror(opts?: { "--check-only" }) -> { exit_code: 0 | 1 }
```

| 項目     | 内容                                                                                                     |
| -------- | -------------------------------------------------------------------------------------------------------- |
| 入力     | 任意: `--check-only`（read-only 判定モード、書き込みなし）                                               |
| 出力     | stdout: `[mirror-sync] index 再生成中...` → `rsync 開始: ...` → `parity 最終確認...` → `完了: parity OK` |
| 処理順序 | ① `generate-index.js --quiet` ② `rsync -a --delete canonical/ mirror/` ③ `diff -qr` 最終確認             |
| 依存     | `git` / `node`（generate-index.js） / `rsync` / `diff`                                                   |

### APIシグネチャ

```text
bash .claude/scripts/verify-skills-parity.sh
bash .claude/scripts/sync-skills-mirror.sh
bash .claude/scripts/sync-skills-mirror.sh --check-only
CLAUDE_SKIP_HEAVY_HOOKS=1 bash .claude/hooks/session-init.sh
```

### exit code 契約

| スクリプト                           | exit code | 条件                                                       |
| ------------------------------------ | --------- | ---------------------------------------------------------- |
| `verify-skills-parity.sh`            | 0         | `diff -qr .claude/skills .agents/skills` が空（parity OK） |
| `verify-skills-parity.sh`            | 0 (SKIP)  | CANONICAL 両不在 OR canonical 不在（bootstrap 状態）       |
| `verify-skills-parity.sh`            | 1         | canonical 存在かつ mirror 不在 OR 差分あり                 |
| `sync-skills-mirror.sh`              | 0         | 最終 `diff -qr` が空（parity OK）                          |
| `sync-skills-mirror.sh`              | 1         | 再同期後も差分残存（generate-index が非 deterministic 等） |
| `sync-skills-mirror.sh --check-only` | 0         | parity OK                                                  |
| `sync-skills-mirror.sh --check-only` | 1         | 差分あり（rsync を実行せず判定のみ）                       |

### 環境変数

| 変数名                    | 値     | 効果                                                                                    |
| ------------------------- | ------ | --------------------------------------------------------------------------------------- |
| `CLAUDE_SKIP_HEAVY_HOOKS` | `1`    | `.claude/hooks/session-init.sh` の parity warning block を完全スキップ（0.228s で通過） |
| `CLAUDE_SKIP_HEAVY_HOOKS` | 未設定 | parity check を実行（parity OK: 0.384s / NG: 0.443s のいずれも AC-6 基準 < 1 秒）       |

### 実行例（Phase 11 `bash-execution-log.txt` より抜粋）

### 使用例

#### 例 1: parity NG 検出（シナリオ 1）

```bash
$ echo "dummy" >> .claude/skills/aiworkflow-requirements/LOGS.md
$ bash .claude/scripts/verify-skills-parity.sh
[parity-check] NG: 以下の差分が検出されました:
Files .claude/skills/aiworkflow-requirements/LOGS.md and .agents/skills/aiworkflow-requirements/LOGS.md differ

修正: bash .claude/scripts/sync-skills-mirror.sh
$ echo "exit=$?"
exit=1
```

#### 例 2: sync による修復（シナリオ 2）

```bash
$ bash .claude/scripts/sync-skills-mirror.sh
[mirror-sync] index 再生成中...
[mirror-sync] rsync 開始: canonical → mirror
[mirror-sync] parity 最終確認...
[mirror-sync] 完了: parity OK
$ bash .claude/scripts/verify-skills-parity.sh
[parity-check] OK: .claude/skills と .agents/skills に差分はありません
$ echo "exit=$?"
exit=0
```

#### 例 3: pre-push parity gate 発火（シナリオ 3 isolated）

```bash
$ bash -c '
    PARITY_SCRIPT="$(git rev-parse --show-toplevel)/.claude/scripts/verify-skills-parity.sh"
    bash "$PARITY_SCRIPT" || {
      echo ""
      echo "[pre-push] parity NG のため push を中止します。"
      echo "  修正: bash .claude/scripts/sync-skills-mirror.sh"
      exit 1
    }
  '
[parity-check] NG: ...
[pre-push] parity NG のため push を中止します。
  修正: bash .claude/scripts/sync-skills-mirror.sh
$ echo "exit=$?"
exit=1
```

#### 例 4: CLAUDE_SKIP_HEAVY_HOOKS=1 opt-out（シナリオ 6）

```bash
$ time CLAUDE_SKIP_HEAVY_HOOKS=1 bash .claude/hooks/session-init.sh > /dev/null 2>&1
# 0.09s user 0.09s system 76% cpu 0.228 total
$ CLAUDE_SKIP_HEAVY_HOOKS=1 bash .claude/hooks/session-init.sh 2>&1 | grep -c "parity"
0
```

### エラーハンドリング

| 観点                               | 実装                                                                                         |
| ---------------------------------- | -------------------------------------------------------------------------------------------- |
| `set -euo pipefail`                | 2 スクリプト双方で先頭に宣言し、未定義変数参照・コマンド失敗・パイプ途中失敗の全てを即時停止 |
| bootstrap 状態（CANONICAL 両不在） | verify: SKIP 扱いで exit 0（hook chain を壊さない）                                          |
| mirror 不在（canonical のみ）      | verify: NG exit 1（意図的な drift として扱う）                                               |
| rsync 前 mirror-only ファイル      | 現実装では warning なし（将来拡張ポイント。未解消の未タスク候補として記録）                  |
| generate-index.js 非 deterministic | sync 最終 `diff -qr` が 0 にならず exit 1 となり可視化される                                 |

### エッジケース

| ケース                                            | 振る舞い                                                                                            |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `.claude/skills` と `.agents/skills` が両方未作成 | bootstrap 扱いで verify / sync ともに SKIP または初期化に寄せる                                     |
| canonical はあるが mirror がない                  | verify は exit 1 を返し、sync 実行を促す                                                            |
| docs-only push                                    | tests を省略しても parity gate は先に実行されるため、mirror drift は push 前に必ず検出される        |
| `CLAUDE_SKIP_HEAVY_HOOKS=1` が設定されている      | session-init の parity warning だけを外し、他の初期化処理は維持する                                 |
| mirror 側にだけ独自ファイルがある                 | sync 実行時に `rsync --delete` で削除されるため、正本への反映前に mirror 側だけを編集してはいけない |

### 設定項目と定数一覧

| 箇所                            | パラメータ                | 用途                                         |
| ------------------------------- | ------------------------- | -------------------------------------------- |
| `.husky/pre-push`               | `PARITY_SCRIPT` 変数      | verify スクリプトのパスを repo-root から解決 |
| `sync-skills-mirror.sh`         | `--check-only`            | rsync を実行せず差分判定のみ                 |
| `.claude/hooks/session-init.sh` | `CLAUDE_SKIP_HEAVY_HOOKS` | parity warning block を丸ごとスキップ        |

### テスト構成

| 層        | 主要証跡                                             | 目的                                                  |
| --------- | ---------------------------------------------------- | ----------------------------------------------------- |
| Phase 4   | `outputs/phase-04/test-suite.md`                     | 正常系/異常系の bash シナリオを先に定義する           |
| Phase 5-9 | `verify-final.log` / `sync-final.log` / 品質レポート | 実装後の deterministic 性と parity 収束を自動確認する |
| Phase 11  | `manual-test-result.md` / `bash-execution-log.txt`   | docs-only push / hook / timing を手動で実測する       |
| Phase 12  | `phase12-task-spec-compliance-check.md`              | 実装ガイドと仕様同期の完了条件を再検証する            |

### 統合ポイント

| ファイル                        | 追記位置                                     | ブロック識別子                                                     |
| ------------------------------- | -------------------------------------------- | ------------------------------------------------------------------ |
| `.husky/pre-push`               | `CHANGED_FILES` 算出直後、docs-only 分岐の前 | parity gate 本体（軽量 check のため docs-only 早期 return より前） |
| `.claude/hooks/session-init.sh` | `merge.ours.driver` 未設定警告ブロックの直後 | `# ---- TASK-AGENTS-SKILLS-FULL-SYNC-001: parity warning ----`     |

### 依存コマンド一覧

| コマンド | 最低バージョン | 用途                                   |
| -------- | -------------- | -------------------------------------- |
| `git`    | 2.x 以降       | `git rev-parse` でリポジトリ root 解決 |
| `diff`   | GNU diff 同等  | `-qr` オプション                       |
| `rsync`  | 3.x 以降       | `-a --delete` オプション               |
| `node`   | 18 以降        | `generate-index.js` 実行               |
| `bash`   | 4 以降         | `set -euo pipefail`                    |

### トラブルシューティング

| 症状                                               | 対処                                                                                                   |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| verify が NG で exit 1                             | `bash .claude/scripts/sync-skills-mirror.sh` を実行して parity 復元                                    |
| sync 実行後も parity NG が消えない                 | `generate-index.js` が非 deterministic になっている可能性。index スクリプトを個別検証                  |
| husky が導入されていない環境で pre-push が動かない | `pnpm install` で husky が `.husky/_` を生成することを確認。CI では別途 parity check を配置            |
| session-init が重い（>1 秒）                       | `CLAUDE_SKIP_HEAVY_HOOKS=1` を一時的に export して切り分け。Phase 11 実測では最大 0.443s               |
| rsync が mirror の独自変更を削除した               | 本タスクでは canonical を唯一の正本とするため `.agents/` 側の独自変更は破棄。事前に canonical 側で編集 |

### 視覚証跡

**UI/UX変更なしのため Phase 11 スクリーンショット不要。**

本タスクは shell スクリプト 2 本 + hook 追記 2 箇所のみの NON_VISUAL タスク。3 層評価（Semantic / Visual / AI UX）の Visual 層は対象外とし、Phase 11 の以下の代替証跡を参照する:

- `outputs/phase-11/bash-execution-log.txt`（6 シナリオ）
- `outputs/phase-11/timing-measurement.txt`（AC-6 < 1 秒の実測値）
- `outputs/phase-11/diff-snapshot-before-after.txt`（同期前後の差分比較）

### 新規参入者 30 分 オンボーディングフロー

1. Part 1 の「2 冊のアルバム」例え話を読む（5 分）
2. `bash .claude/scripts/verify-skills-parity.sh` を 1 回実行して `[parity-check] OK:` を確認（1 分）
3. `outputs/phase-11/bash-execution-log.txt` を頭から眺める（10 分）
4. `.husky/pre-push` 末尾 / `.claude/hooks/session-init.sh` の parity block を各 1 回読む（5 分）
5. Part 2「統合ポイント」表で追記位置を頭に入れて完了（9 分）
