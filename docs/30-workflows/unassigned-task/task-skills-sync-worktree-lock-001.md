# task-skills-sync-worktree-lock-001: skills mirror sync の worktree 間排他ロック追加

## 1. メタ情報

| 項目          | 値                                                                                    |
| ------------- | ------------------------------------------------------------------------------------- |
| task_id       | `task-skills-sync-worktree-lock-001`                                                  |
| issue_number  | [#2332](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2332)              |
| name          | skills mirror sync の worktree 間排他ロック追加                                       |
| category      | 改善（Improvement）                                                                   |
| priority      | 低（LOW）                                                                             |
| scale         | 小規模（推定 2 時間）                                                                 |
| status        | unassigned                                                                            |
| source_phase  | `TASK-AGENTS-SKILLS-FULL-SYNC-001` Phase-12 `unassigned-task-detection.md`            |
| created_date  | 2026-04-19                                                                            |
| related_tasks | `TASK-AGENTS-SKILLS-FULL-SYNC-001`（親）、`task-p0-05-mirror-sync-automation`（前提） |
| target_files  | `.claude/scripts/sync-skills-mirror.sh`、`.husky/pre-push`（呼び出し元）              |

---

## 2. なぜ必要か（Why）

### 2.1 背景

AIWorkflowOrchestrator は複数 worktree による並列開発を採用しており、
現在も `/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/` 配下に
最大 10 本程度の worktree が同時に存在する運用が定着し始めている。

`TASK-AGENTS-SKILLS-FULL-SYNC-001` で導入された
`.claude/scripts/sync-skills-mirror.sh` は canonical（`.claude/skills/`）から
mirror（`.agents/skills/`）へ rsync するスクリプトで、pre-push hook から呼ばれる。

### 2.2 検出された事象

Phase-12 `unassigned-task-detection.md` の LOW 優先度項目として、
以下の race condition が理論上存在することが検出された。

- 複数 worktree が**同時刻に `git push`** を実行した場合、
  それぞれの pre-push hook が同じ `.claude/skills/` → `.agents/skills/` に対して
  `rsync -a --delete` を並列実行する
- rsync の `--delete` フラグは、他方のプロセスが書き込み途中のファイルを
  一時的に「不要」と判定して削除する可能性がある
- 結果として mirror 側が一時的に inconsistent state に陥る

### 2.3 現状のリスク評価

| 項目                 | 現状                                                                       |
| -------------------- | -------------------------------------------------------------------------- |
| 実害の観測有無       | 観測されていない                                                           |
| 理由                 | pre-push の直列性（1 開発者 1 push 1 実行）に依存                          |
| 顕在化の条件         | CI での並列 push、複数開発者の同時 push、手動で複数 worktree から並列実行  |
| 顕在化した場合の影響 | mirror が壊れた状態でコミットされると `verify-skills-parity.sh` が赤になる |

### 2.4 放置した場合の影響

- 並列 worktree 運用がさらに定着した際に、再現性の低い "たまに parity check が落ちる" 問題が発生
- CI 環境で複数ジョブが同じリポジトリに対して同期を走らせる構成に移行した場合に即座に顕在化
- デバッグコスト: race condition は再現困難で、原因特定に数時間〜半日かかる可能性

### 2.5 起票タイミング

並列 worktree 運用が定着し、かつ以下のいずれかが発生した時点で着手する:

1. `verify-skills-parity.sh` が理由不明で落ちるインシデントが 1 件でも発生
2. CI で skills sync を並列実行する要件が生まれた
3. 開発者が 3 人以上になり同時 push が常態化

---

## 3. 何を達成するか（What）

### 3.1 目的

`.claude/scripts/sync-skills-mirror.sh` に排他ロック機構を追加し、
複数プロセスから同時に呼び出されても mirror の整合性が保証される状態にする。

### 3.2 最終ゴール

- `sync-skills-mirror.sh` 実行中は他プロセスがロック取得できず、
  待機または即時失敗するどちらかの明示的な動作になる
- macOS / Linux の両環境で動作する（CI 互換性）
- stale lock（プロセス異常終了時の残留）が自動クリーンアップされる
- 並列 2 プロセス実行テストで parity が必ず保たれる

### 3.3 スコープ

#### 含む

- `sync-skills-mirror.sh` への lock 取得・解放ロジック追加
- macOS 互換のロック実装（flock 不使用 or 代替）
- stale lock 検出とクリーンアップ
- lock 取得失敗時のリトライ or 即時失敗ポリシーの明文化
- `verify-skills-parity.sh` はロック対象外（read-only のため）
- 同時 2 プロセス実行の検証スクリプト追加（任意、`.claude/scripts/test-skills-sync-lock.sh`）

#### 含まない

- rsync 自体のアルゴリズム変更
- canonical / mirror の入れ替え
- `.claude/settings.local.json` や hooks の大幅改修
- Windows 対応（プロジェクトは macOS 前提）

### 3.4 成果物

- 修正版 `.claude/scripts/sync-skills-mirror.sh`
- （任意）`.claude/scripts/test-skills-sync-lock.sh`
- `docs/30-workflows/TASK-AGENTS-SKILLS-FULL-SYNC-001/` 配下に完了ノート
- lock ファイルの配置場所と命名規則のドキュメント化

---

## 4. どのように実行するか（How）

### 4.1 前提条件

- `TASK-AGENTS-SKILLS-FULL-SYNC-001` が完了し、`.claude/scripts/sync-skills-mirror.sh` が稼働していること
- `task-p0-05-mirror-sync-automation` で pre-push hook 経由の呼び出し経路が確立していること
- canonical = `.claude/skills/`、mirror = `.agents/skills/` の規約が変更されていないこと
- merge policy が `copy-from-canonical-with-delete` のままであること

### 4.2 依存タスク

| タスク                              | 関係             |
| ----------------------------------- | ---------------- |
| `TASK-AGENTS-SKILLS-FULL-SYNC-001`  | 完了済み（前提） |
| `task-p0-05-mirror-sync-automation` | 完了済み（前提） |

### 4.3 必要な知識

- Bash スクリプティング（`set -euo pipefail`、`trap`、サブシェル）
- ファイルロックの 3 つの基本パターン
  - `flock(1)`: Linux のみ、ファイルディスクリプタベース
  - `mkdir`: POSIX 互換、atomic、macOS でも動作
  - `lockfile(1)`: procmail 付属、macOS では非標準
- stale lock 対策（PID 記録 + `kill -0` での生存確認）
- rsync のセマンティクス（`--delete` と並列実行の危険性）

### 4.4 推奨アプローチ

**第一候補: `mkdir` ベースの atomic lock**

理由:

- `mkdir` は POSIX atomic（同時呼び出しで片方だけが成功）
- macOS / Linux で動作が同一
- 外部コマンド依存なし（bash 組み込みに近い）
- lock ディレクトリに PID を書き込めば stale 検出も可能

**第二候補: `flock` + `mkdir` のハイブリッド**

- Linux では flock、macOS では mkdir にフォールバック
- 実装が複雑化するため、シンプルさを優先して第一候補を採用する

### 4.5 lock 仕様（ドラフト）

| 項目           | 値                                                                    |
| -------------- | --------------------------------------------------------------------- |
| lock path      | `<repo-root>/.claude/.locks/sync-skills-mirror.lock/`（ディレクトリ） |
| PID file       | `<lock-path>/pid`                                                     |
| timestamp file | `<lock-path>/started_at`                                              |
| 取得方式       | `mkdir` で atomic 作成                                                |
| 取得失敗時     | exponential backoff（初回 100ms、最大 3 回、合計 ~700ms 待機）        |
| stale 判定     | PID が存在しない、かつ timestamp が 60 秒以上前                       |
| stale 時の動作 | WARN ログ出力して lock を removeして再取得を試みる                    |
| 解放           | `trap 'cleanup_lock' EXIT ERR INT TERM` で確実に実行                  |

---

## 5. 実行手順

### Phase 1: 現状調査と設計確定

1. `.claude/scripts/sync-skills-mirror.sh` の現行実装を読み、
   エントリポイント・rsync コマンド位置・エラーハンドリングを把握する
2. `.husky/pre-push` から sync-skills-mirror.sh がどのように呼ばれているか確認
3. macOS の `flock` 非対応を実機で確認（`which flock` が空または missing）
4. lock ディレクトリの配置 `.claude/.locks/` を決定し、`.gitignore` に追加する必要を確認

### Phase 2: lock 取得・解放ロジック実装

1. 冒頭に `set -euo pipefail` が既にあることを確認（なければ追加）
2. lock 取得関数 `acquire_lock` を追加
   - `mkdir` で atomic 作成試行
   - 失敗したら PID 生存確認
   - 生存していれば backoff してリトライ
   - stale なら強制削除して再取得
   - 3 回失敗したら exit 1
3. lock 解放関数 `release_lock` を追加
4. `trap release_lock EXIT ERR INT TERM` をスクリプト先頭で登録
5. PID と timestamp を lock ディレクトリに書き込む
6. 既存の rsync 呼び出しの前後を lock で挟む

### Phase 3: テストとパリティ確認

1. 手動単体実行: `bash .claude/scripts/sync-skills-mirror.sh` で通常動作確認
2. 同時 2 プロセス実行テスト:

   ```bash
   bash .claude/scripts/sync-skills-mirror.sh &
   bash .claude/scripts/sync-skills-mirror.sh &
   wait
   bash .claude/scripts/verify-skills-parity.sh
   ```

   - 片方が lock 待機し、両方完了後に parity が OK になること

3. stale lock テスト:
   - 手動で `.claude/.locks/sync-skills-mirror.lock/` を作成し PID に 99999 を記入
   - スクリプト実行して stale 検出 & クリーンアップされることを確認
4. 異常終了テスト:
   - スクリプト実行中に `kill -9` で強制終了
   - 次回実行で stale 判定され復旧すること

### Phase 4: ドキュメント更新と完了ノート

1. `.gitignore` に `.claude/.locks/` を追加
2. `CLAUDE.md` または `.claude/scripts/README.md` に lock の存在を記載
3. 完了ノートを `docs/30-workflows/TASK-AGENTS-SKILLS-FULL-SYNC-001/task-skills-sync-worktree-lock-001-completed.md` に作成
4. 親タスク `unassigned-task-detection.md` の該当項目を "RESOLVED" に更新

---

## 6. 完了条件チェックリスト

- [ ] `sync-skills-mirror.sh` に lock 取得・解放ロジックが追加されている
- [ ] `set -euo pipefail` と `trap` が設定され、異常終了時も lock が解放される
- [ ] macOS で `flock` 非依存（`mkdir` ベース）で動作する
- [ ] 同時 2 プロセス実行で parity が保たれることを検証済み
- [ ] stale lock の自動クリーンアップが動作する
- [ ] `.gitignore` に `.claude/.locks/` が追加されている
- [ ] pre-push hook 経由での実行が壊れていない（実機 `git push` で確認）
- [ ] `verify-skills-parity.sh` が lock の影響を受けない（read-only のまま）
- [ ] 完了ノートが `docs/30-workflows/TASK-AGENTS-SKILLS-FULL-SYNC-001/` に追加されている
- [ ] 親タスクの `unassigned-task-detection.md` が更新されている

---

## 7. 検証方法

### 7.1 単体実行

```bash
bash .claude/scripts/sync-skills-mirror.sh
bash .claude/scripts/verify-skills-parity.sh
# => 両方 exit 0
```

### 7.2 並列実行テスト（race condition 再現抑止）

```bash
bash .claude/scripts/sync-skills-mirror.sh &
PID_A=$!
bash .claude/scripts/sync-skills-mirror.sh &
PID_B=$!
wait "$PID_A" "$PID_B"
bash .claude/scripts/verify-skills-parity.sh
# => parity OK
```

### 7.3 stale lock テスト

```bash
mkdir -p .claude/.locks/sync-skills-mirror.lock
echo 99999 > .claude/.locks/sync-skills-mirror.lock/pid
date -u +%s > .claude/.locks/sync-skills-mirror.lock/started_at
# 61 秒待つ or timestamp を過去にする
bash .claude/scripts/sync-skills-mirror.sh
# => WARN ログ後に正常終了
```

### 7.4 異常終了テスト

```bash
bash -c 'bash .claude/scripts/sync-skills-mirror.sh & sleep 0.1; kill -9 $!'
bash .claude/scripts/sync-skills-mirror.sh
# => 次回実行で復旧
```

### 7.5 pre-push 経由

```bash
git commit --allow-empty -m "test lock"
git push origin HEAD
# => hook 成功、remote へ反映
```

---

## 8. リスクと対策

| リスク                                            | 影響度 | 対策                                                                             |
| ------------------------------------------------- | ------ | -------------------------------------------------------------------------------- |
| macOS で flock が存在せず実装が壊れる             | 高     | `mkdir` ベースで実装、flock を使わない                                           |
| stale lock が残って次回以降の sync が永続的に失敗 | 高     | PID 生存確認 + timestamp ベースの自動クリーンアップ                              |
| lock 取得が常に失敗して pre-push が落ちる         | 中     | backoff 上限後に exit 1、エラーメッセージで手動削除の方法を案内                  |
| CI と手動実行で lock パスが食い違う               | 低     | リポジトリルート相対で固定（`$(git rev-parse --show-toplevel)/.claude/.locks/`） |
| trap が発火せず lock が残る                       | 中     | `trap 'release_lock' EXIT ERR INT TERM` で複数シグナル捕捉                       |
| lock ディレクトリが `.git` 管理に入る             | 低     | `.gitignore` に追加、ディレクトリ名に `.` プレフィックス                         |

---

## 9. 参照情報

### 9.1 内部ドキュメント

- `docs/30-workflows/unassigned-task/TASK-AGENTS-SKILLS-FULL-SYNC-001.md`（親タスク）
- `docs/30-workflows/unassigned-task/task-p0-05-mirror-sync-automation.md`（前提、フォーマット参考）
- `docs/30-workflows/TASK-AGENTS-SKILLS-FULL-SYNC-001/` 配下の完了ノート群
- `.claude/scripts/sync-skills-mirror.sh`（修正対象）
- `.claude/scripts/verify-skills-parity.sh`（影響確認対象）
- `.husky/pre-push`（呼び出し元）

### 9.2 外部リファレンス

- POSIX `mkdir` の atomic 性: IEEE Std 1003.1-2017 mkdir(2)
- `flock(1)` が macOS で非標準である件（util-linux 由来、macOS は別実装）
- rsync `--delete` と並列実行の相互作用に関する rsync メーリングリスト過去ログ

### 9.3 規約

- canonical = `.claude/skills/`
- mirror = `.agents/skills/`
- merge policy = canonical を正、mirror は `rsync -a --delete` で上書き
- generate-index は deterministic（入力が同じなら出力も同じ）

---

## 10. 苦戦箇所セクション（必須・詳細）

親タスク `TASK-AGENTS-SKILLS-FULL-SYNC-001` の実装とレビューで得られた知見をもとに、
本タスクで着手前に押さえておくべき落とし穴を以下に整理する。

### 10.1 macOS の flock 非対応問題

#### 症状

- macOS には BSD 由来の `lockf(3)` はあるが、Linux 的な `flock(1)` コマンドは標準で入っていない
- Homebrew の `util-linux` を入れれば使えるが、開発者全員にインストールを強制できない
- CI で macOS runner を使う場合も同様

#### 対策（本タスクでの方針）

- **`flock` を使わない**。`mkdir` の atomic 性を利用する
- `mkdir /path/to/lock.d` は、ディレクトリが既に存在する場合 exit 1 を返すため、
  POSIX 準拠システムで atomic な lock 取得として成立する
- `lockfile(1)` も procmail 依存で macOS 非標準のため不採用
- ロジック例:
  ```bash
  if mkdir "$LOCK_DIR" 2>/dev/null; then
    echo "$$" > "$LOCK_DIR/pid"
    date -u +%s > "$LOCK_DIR/started_at"
    # acquired
  else
    # 既に別プロセスが取得 → stale check / backoff
  fi
  ```

#### 落とし穴

- `mkdir -p` を使うと既存でも成功してしまうので、必ず `-p` なしで使うこと
- ファイルシステムが NFS の場合 `mkdir` の atomic 性が保証されない環境がある（本プロジェクトはローカル APFS のため問題なし）

### 10.2 lock 取得失敗時のリトライポリシー

#### 検討した選択肢

| ポリシー               | メリット                            | デメリット                                         |
| ---------------------- | ----------------------------------- | -------------------------------------------------- |
| 即時失敗               | シンプル、予測可能                  | 並列 push が一方だけ成功して片側の push が失敗する |
| 無限待機               | 両 push が必ず成功                  | deadlock 時にハングする                            |
| 有限回 backoff（推奨） | deadlock 回避＋一時競合で成功率向上 | 実装が少し複雑                                     |

#### 推奨: exponential backoff（有限回）

- 初回待機 100ms、倍々で 200ms → 400ms、計 3 回 = 最大 ~700ms
- 並列 sync の実行時間は通常 100ms 未満なので 3 回で十分
- 失敗時は明確な exit code 2 と stderr メッセージ（`sync-skills-mirror: lock busy, try again later`）

#### 落とし穴

- backoff を無限にすると pre-push hook がハングして push がタイムアウトする
- 上限到達時のメッセージで「手動で `.claude/.locks/` を削除する手順」を必ず案内する

### 10.3 stale lock（プロセス異常死時の残留）

#### 発生パターン

- 開発者が sync 中に ctrl+C で中断
- bash プロセスが OOM killer に殺される
- 停電・強制再起動
- エディタの保存時フックがスクリプトを kill -9

#### 検出ロジック

```bash
is_stale_lock() {
  local pid_file="$LOCK_DIR/pid"
  local ts_file="$LOCK_DIR/started_at"
  [[ -f "$pid_file" ]] || return 0  # PID file 自体が無い → stale
  local pid
  pid=$(cat "$pid_file")
  if kill -0 "$pid" 2>/dev/null; then
    # プロセス生存 → not stale
    return 1
  fi
  # プロセス死亡 → stale
  return 0
}
```

#### タイムスタンプによる二重防御

- `kill -0` は PID が再利用されていると誤判定する（別プロセスが同じ PID を取る稀なケース）
- `started_at` ファイルと現在時刻の差が 60 秒以上なら stale とみなす
- 二つの条件を AND で結合すると誤検出が実質ゼロになる

#### 落とし穴

- `cat` が空文字を返した場合（書き込み途中で死んだ）に `kill -0 ""` がエラーになる
  → `[[ -n "$pid" ]]` のガードを入れる
- timestamp の書式を統一（UTC の epoch 秒、`date -u +%s`）。macOS と Linux で `date` のフラグが微妙に違うため epoch 秒が最も安全

### 10.4 pre-push / CI / 手動実行で lock 粒度が異なる可能性

#### 呼び出し経路

1. **pre-push hook** 経由: 通常の `git push` で発動。開発者 1 人 1 worktree で 1 プロセス
2. **CI** 経由: 将来 CI で sync を走らせる場合、同一リポジトリに対し複数 job が同時実行し得る
3. **手動実行**: 開発者がデバッグ目的で直接 `bash .claude/scripts/sync-skills-mirror.sh` を叩く

#### lock パスの共有範囲

- すべての経路で **同じ lock path** を共有する必要がある
- `$(git rev-parse --show-toplevel)/.claude/.locks/sync-skills-mirror.lock` で統一
- worktree からの実行でも `git rev-parse --show-toplevel` は worktree ルートを返すため、
  **worktree ごとに独立した lock になる**
- ただし canonical / mirror は共通の git リポジトリを指しているため、本来は main リポジトリルートで lock すべき
- 本タスクのスコープでは worktree 単位の lock で十分（mirror も worktree 単位に存在するため）

#### 落とし穴

- `.git/worktrees/...` 配下には書かない（git 内部ファイルと競合）
- main リポジトリと worktree で lock path が異なる場合、main 側と worktree 側が同時に実行されると race が残る
  → 本タスクでは「mirror が worktree 単位」という現状モデルに合わせ worktree lock で解決する
  → 将来 mirror を集中管理するモデルに移行する場合は、lock も main リポジトリルート基準に変更する follow-up タスクを起票する

### 10.5 `set -euo pipefail` + `trap ERR` での lock 解放の確実性

#### 目標

- どのような終了経路（正常・エラー・シグナル）でも lock が必ず解放される

#### 正解パターン

```bash
#!/usr/bin/env bash
set -euo pipefail

LOCK_DIR="$(git rev-parse --show-toplevel)/.claude/.locks/sync-skills-mirror.lock"

release_lock() {
  # 自分が取得した lock のみ解放（PID 一致確認）
  if [[ -f "$LOCK_DIR/pid" ]] && [[ "$(cat "$LOCK_DIR/pid" 2>/dev/null || echo '')" == "$$" ]]; then
    rm -rf "$LOCK_DIR"
  fi
}
trap release_lock EXIT ERR INT TERM

acquire_lock  # mkdir & PID 書き込み
rsync -a --delete .claude/skills/ .agents/skills/
```

#### 落とし穴

- `trap 'release_lock' EXIT` だけだと `ERR INT TERM` でシェルが落ちる前に解放されないケースがある
- `EXIT` は `set -e` でのエラー時にも発火するが、明示的に `ERR INT TERM` も列挙した方が明確
- release_lock 内で **PID 一致確認** をしないと、別プロセスの lock を誤って削除する危険性がある
- サブシェル（`(...)`）内で trap を設定しても親シェル終了時には発火しないため、スクリプト最上位で trap を張る
- `rsync` の exit code を握りつぶさないため、`set -e` を有効にしたまま lock 解放を trap で行うのが正解

### 10.6 rsync `--delete` と並列実行の相互作用

#### 具体的な壊れ方

- プロセス A が canonical → mirror にコピー中、mirror 側に一時ファイル `foo.tmp` が存在
- 同時刻にプロセス B が rsync を開始
- プロセス B から見ると `foo.tmp` は canonical に存在しない → `--delete` で消そうとする
- プロセス A が書き込み中のファイルが消えて不整合

#### lock による解決

- lock を取ってから rsync するので A と B が時間的に重ならない
- A の rsync 完了後に B が実行されるため、canonical と mirror が毎回整合する

#### verify-skills-parity.sh は lock 不要

- 読み取り専用のため race condition の書き込み側にいない
- ただし sync の途中で parity check が走ると一時的に不整合に見える可能性はある
- 本タスクのスコープ外（必要なら別タスクで read lock を検討）

---

## 11. 推定工数と優先度再確認

| 項目         | 見積もり                                |
| ------------ | --------------------------------------- |
| 実装         | 45 分（lock 関数 + trap 追加）          |
| テスト       | 45 分（単体・並列・stale・異常終了）    |
| ドキュメント | 30 分（.gitignore、README、完了ノート） |
| 合計         | **約 2 時間**                           |

**優先度が LOW である理由の再確認**:

- 現状 pre-push の直列性で race は顕在化していない
- 実害ゼロの状態で先回り対応するより、顕在化時の即時対応の方が合理的
- ただし実装コストが低いため、並列 worktree 運用が広がり次第すぐに着手する

---

## 12. 完了後の次ステップ（参考）

本タスク完了後に検討すべき follow-up:

1. `verify-skills-parity.sh` の read lock 導入（sync 中の parity check を一時待機させる）
2. mirror を main リポジトリに集中管理するモデルへの移行検討
3. CI での skills sync 並列実行を許可する設定（本タスク完了が前提）
