# Phase 2: 設計

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 2                                |
| 機能名 | TASK-AGENTS-SKILLS-FULL-SYNC-001 |
| 作成日 | 2026-04-19                       |
| 前提   | Phase 1 要件定義完了             |

## 目的

Phase 1 で固定した acceptance criteria を、実装可能な以下のコンポーネント群にマッピングする:

1. parity 検証スクリプト（検出専用）
2. 自動同期スクリプト（検出 + 修復）
3. pre-push hook（push gate）
4. session-init hook（セッション開始 warning）
5. drift 解消（初回 rsync + `int-test-skill` 同期）

## 全体トポロジ

```
┌──────────────────────────────────────────────────────────────────┐
│                        parity guard chain                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   [session-init]          [pre-push]            [手動 / CI]     │
│        ↓                      ↓                      ↓          │
│   warning 出力         push abort gate        verify を単発実行 │
│        │                      │                      │          │
│        └──────────────┬───────┴──────────────────────┘          │
│                       ↓                                         │
│         .claude/scripts/verify-skills-parity.sh                │
│         （diff -qr .claude/skills .agents/skills）              │
│                       │                                         │
│                       ↓  （NG の時）                            │
│         .claude/scripts/sync-skills-mirror.sh                  │
│         （rsync -a --delete → generate-index.js → re-verify） │
│                       ↓                                         │
│                   parity OK                                    │
│                                                                 │
└──────────────────────────────────────────────────────────────────┘
```

## コンポーネント設計

### C-1: `verify-skills-parity.sh`（検出専用）

| 項目         | 値                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------ |
| 配置         | `.claude/scripts/verify-skills-parity.sh`                                                  |
| 実行権限     | `chmod +x`                                                                                 |
| 入力         | なし（repo root は `git rev-parse --show-toplevel` で解決）                                |
| 出力         | exit 0: parity OK、exit 1: parity NG / mirror 欠損、exit 0: bootstrap skip（両 root 不在） |
| 副作用       | なし（read-only）                                                                          |
| 依存コマンド | `git`、`diff`                                                                              |

#### 設計上の決定事項

- `set -euo pipefail` を冒頭で宣言し、未定義変数 / pipe 中間 fail を確実に検出する
- `diff -qr ... 2>/dev/null || true` で diff 実行自体のエラーは握るが、結果の空 / 非空で exit code を切り替える
- 両 root が不在の bootstrap 状態のみ warning 出力して exit 0 とする。`CANONICAL` が存在するのに `MIRROR` が無い場合は異常欠損として exit 1 にし、`sync-skills-mirror.sh` による復旧を促す
- 1 秒未満の実行時間を目標（stat 呼び出しのみ、内容比較は最小限）

### C-2: `sync-skills-mirror.sh`（検出 + 修復）

| 項目         | 値                                                                            |
| ------------ | ----------------------------------------------------------------------------- | -------------------- |
| 配置         | `.claude/scripts/sync-skills-mirror.sh`                                       |
| 実行権限     | `chmod +x`                                                                    |
| 入力         | オプション引数 `--check-only`（`diff -qr` のみ実行して rsync せず、診断専用） |
| 出力         | exit 0: 最終的に parity OK、exit 1: 差分残存 / `--check-only` で差分検出      |
| 副作用       | `.agents/skills/` の書き換え（`rsync -a --delete`）、`indexes/\*.json         | \*.md` の regenerate |
| 依存コマンド | `git`、`rsync`、`node`、`diff`                                                |

#### 設計上の決定事項

- 実行順は固定: `generate-index.js --quiet` → `rsync -a --delete` → `diff -qr` による最終確認
- `generate-index.js` は canonical 側のスクリプトを使う（`$CANONICAL/aiworkflow-requirements/scripts/generate-index.js`）
- rsync 前に mirror-only ファイルの存在を warning 出力する（破壊的変更に対する透明性）
- `--check-only` モードでは rsync を実行せず、差分の有無をそのまま exit 0/1 に反映する。read-only だが gate 判定にも流用できる診断モードとして扱う

### C-3: pre-push hook 追加

| 項目       | 値                                                      |
| ---------- | ------------------------------------------------------- |
| 配置       | `.husky/pre-push`（既存ファイルへ追記）                 |
| タイミング | `git push` 実行時、remote 転送前                        |
| 動作       | `verify-skills-parity.sh` を呼び、exit 1 なら push 中止 |
| 失敗時導線 | エラーメッセージで `sync-skills-mirror.sh` を案内       |

#### 設計上の決定事項

- 既存 `.husky/pre-push` の末尾にブロック追加（他 hook を上書きしない）
- CLAUDE.md の `--no-verify` 禁止ルールに違反しないよう、skip 手段を提供しない
- `PARITY_SCRIPT` 変数を使って path 存在チェックを行い、スクリプト未配置の worktree でも pre-push 自体を壊さない

### C-4: session-init.sh への parity warning

| 項目       | 値                                                         |
| ---------- | ---------------------------------------------------------- |
| 配置       | `.claude/hooks/session-init.sh`（既存ファイルへ追記）      |
| タイミング | Claude Code セッション開始時（SessionStart hook）          |
| 動作       | parity NG なら警告のみ（blocking にはしない）              |
| スキップ   | `CLAUDE_SKIP_HEAVY_HOOKS=1` の時は parity check をスキップ |

#### 設計上の決定事項

- 既存 `merge.ours.driver 未設定警告` の直後に追記し、似た trouble shooting 群を近接配置
- 警告メッセージに `sync-skills-mirror.sh` の 1 行コマンドを明示する
- session-init は blocking にしない（ユーザー作業を止めないという既存 hook 設計原則を踏襲）

### C-5: drift 解消（初回 rsync + `int-test-skill`）

| 項目         | 値                                                                            |
| ------------ | ----------------------------------------------------------------------------- |
| 手順         | Phase 5 序盤で `sync-skills-mirror.sh` を一回実行                             |
| 対象         | Phase 1 inventory の 6 内容差分 + `int-test-skill` ディレクトリ丸ごと         |
| 検証         | 実行後に `diff -qr` が空出力になることを確認                                  |
| ロールバック | `.agents/skills/` を git 履歴から復元可能（変更前に `git status` で差分記録） |

## データフロー設計

### verify スクリプトの exit code 契約

| 状況                             | stdout / stderr                                | exit |
| -------------------------------- | ---------------------------------------------- | ---- |
| `diff -qr` 出力なし              | `[parity-check] OK: ...`                       | 0    |
| `diff -qr` 出力あり              | `[parity-check] NG: ...` + 差分一覧 + 修正手順 | 1    |
| 両 root 不在（bootstrap 前）     | `[parity-check] SKIP: skills root が未配置`    | 0    |
| `CANONICAL` 存在 / `MIRROR` 欠損 | `[parity-check] NG: mirror root missing`       | 1    |

### sync スクリプトの実行順序

```
1. CANONICAL / MIRROR 存在チェック
   ├─ 両方不在なら bootstrap skip として exit 0
   └─ CANONICAL のみ存在なら異常欠損として exit 1
2. mirror-only ファイル列挙 → warning 出力（--delete 実行前の最後の情報源）
3. rsync -av --delete "$CANONICAL/" "$MIRROR/"
4. node "$CANONICAL/aiworkflow-requirements/scripts/generate-index.js" --quiet
5. diff -qr "$CANONICAL" "$MIRROR"
   ├─ 空 → [mirror-sync] 完了: parity OK → exit 0
   └─ 非空 → [mirror-sync] 警告: 再生成後も差分残存 → exit 1
```

## 設計上のトレードオフ

| 決定                                              | 採用理由                                                                           | 捨てた選択肢                                             |
| ------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------- |
| verify と sync を別スクリプトに分離               | CI / pre-push では read-only の verify のみを呼びたい（意図しない書き換え防止）    | 単一スクリプトに `--fix` フラグを持たせる案              |
| rsync `-a --delete` 固定                          | mirror の drift を完全に canonical と一致させる（不完全同期を許さない）            | `--ignore-existing` や exclude pattern での partial 同期 |
| generate-index.js を sync 内で呼ぶ                | JSON 手マージを永久に回避。canonical 側の scripts を使うため mirror 依存を作らない | sync とは別 workflow で index 再生成を運用する案         |
| pre-push 時に blocking、session-init では warning | push は破壊的・不可逆なので gate、セッション起動はユーザー作業を止めない           | session-init も blocking にする案（UX が劣化）           |
| `.gitattributes` / EVALS.json を変更しない        | TASK-CONFLICT-PREVENT-001 の責務・AC-6 を侵さない                                  | merge policy を再設計する案（スコープ逸脱）              |

## 因果ループ分析

### 強化ループ（parity の自己維持）

```
drift 発生 → session-init / pre-push が warning/abort
           → ユーザー / hook が sync-skills-mirror.sh 実行
           → drift 解消 → 次 session で warning なし
           → 「drift は起きてもすぐ直る」行動定着
```

### バランスループ（誤検知による疲労の回避）

```
session-init 毎回 diff -qr 実行 → 実行時間累積 → UX 劣化
          → CLAUDE_SKIP_HEAVY_HOOKS=1 による opt-out を用意
          → 不要環境ではスキップされ UX 維持
```

## エッジケース / 失敗シナリオ

| シナリオ                                    | 設計上の対応                                                                                       |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `.agents/skills/` が存在しない新規 clone    | verify は SKIP 扱い、sync は rsync が親ディレクトリを作成                                          |
| rsync 後も `generate-index.js` が差分を出す | sync スクリプトが exit 1 を返し、修正手順を提示（generate-index.js の deterministic 性を要確認）   |
| `.husky` を使っていない環境                 | pre-push hook は追記が存在する前提。husky 未導入なら別途 hook 配置が必要 → Phase 4 テストで検出    |
| worktree 並列開発で同時に sync を実行       | rsync は write 競合する可能性 → pre-push は transaction 的、session-init は warning のみなので許容 |
| mirror にしか存在する独自ファイルがある     | sync スクリプトが warning 出力 → Phase 1 ステップ 1 の snapshot で事前検知する                     |
| `generate-index.js` 自体が壊れている        | sync exit 1 → ユーザーが canonical 側で修正する（本タスクは index 生成契約を前提にする）           |

## 参照資料

| 資料名                           | パス                                                                               | 用途                       |
| -------------------------------- | ---------------------------------------------------------------------------------- | -------------------------- |
| Phase 1 要件定義                 | `phase-01-requirements.md`                                                         | 全 AC の根拠               |
| conflict-prevent-skills-001 設計 | `docs/30-workflows/completed-tasks/conflict-prevent-skills-001/phase-02-design.md` | 前提の merge policy 設計   |
| post-merge hook                  | `.claude/hooks/post-merge-index-regenerate.sh`                                     | 既存 hook との責務分離参考 |
| setup-merge-drivers              | `.claude/scripts/setup-merge-drivers.sh`                                           | shell script 書式の参考    |

### システム仕様（aiworkflow-requirements）

| 参照資料                    | パス                                                                 | 内容                                     |
| --------------------------- | -------------------------------------------------------------------- | ---------------------------------------- |
| canonical / mirror 責務分離 | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` | canonical 優先・mirror 派生の設計原則    |
| generate-index 契約         | `.claude/skills/aiworkflow-requirements/scripts/generate-index.js`   | deterministic output と `--quiet` フラグ |

## 成果物

- 5 コンポーネント（C-1〜C-5）の詳細仕様
- データフロー（verify 契約、sync 実行順）
- トレードオフ分析テーブル
- エッジケース対応表

## 完了条件

- [ ] 5 コンポーネントそれぞれに配置パス・exit code 契約・依存コマンドが明記されている
- [ ] pre-push と session-init の blocking 方針の違いが説明されている
- [ ] `.gitattributes` / EVALS.json を変更しない制約が再掲されている
- [ ] 6 つのエッジケースに対応設計がある
- [ ] Phase 3 のレビュー観点（整合性 / 実現性 / 運用性）を判定可能な粒度になっている

## Phase 3 への引き継ぎ

- verify / sync の 2 本スクリプト契約を中心に、依存関係（canonical → mirror の一方向）が守られているかレビューする
- session-init の 1 秒未満目標が現実的か、実測で確認するステップを Phase 4 テストに加える
- `int-test-skill` の同期は Phase 5 の最初で済ませ、ガード導入前に parity を 0 にすることを明確化する

## 実行タスク

1. verify / sync / pre-push / session-init / drift 解消の 5 コンポーネントへ責務を分解する
2. exit code 契約と bootstrap / 異常欠損の境界を固定する
3. `rsync → generate-index → re-verify` のデータフローを deterministic に定義する
4. 重複責務と将来統合候補をトレードオフとして隔離する
5. Phase 4 の TC 化に耐える粒度まで設計情報を落とす

## 統合テスト連携

- Phase 4 は本 Phase の C-1〜C-5 を TC-4-01〜TC-4-12 に展開し、exit code と副作用の両方を検証する
- Phase 6 / 7 は本 Phase の bootstrap / mirror 欠損 / `--check-only` 契約を回帰テストとカバレッジ表へ反映する
