# `.agents/skills/` と `.claude/skills/` 完全パリティガード実装 - タスク指示書

## メタ情報

```yaml
issue_number: 2278
task_id: TASK-AGENTS-SKILLS-FULL-SYNC-001
task_name: .agents/skills/ と .claude/skills/ 完全パリティガード実装
category: 改善
priority: 高
scale: 中規模
status: 未実施
source_phase: TASK-CONFLICT-PREVENT-001 Phase 12（unassigned-task-detection.md）
created_date: 2026-04-18
related_tasks:
  - TASK-CONFLICT-PREVENT-001
  - task-imp-aiworkflow-same-wave-sync-guard-001
  - task-p0-05-mirror-sync-automation
spec_path: docs/30-workflows/unassigned-task/TASK-AGENTS-SKILLS-FULL-SYNC-001.md
```

| 項目         | 内容                                                               |
| ------------ | ------------------------------------------------------------------ |
| タスクID     | TASK-AGENTS-SKILLS-FULL-SYNC-001                                   |
| タスク名     | `.agents/skills/` と `.claude/skills/` 完全パリティガード実装      |
| 分類         | 改善                                                               |
| 優先度       | 高                                                                 |
| 見積もり規模 | 中規模                                                             |
| ステータス   | 未実施                                                             |
| 発見元       | TASK-CONFLICT-PREVENT-001 Phase 12（unassigned-task-detection.md） |
| 発見日       | 2026-04-18                                                         |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-CONFLICT-PREVENT-001 では worktree 並列開発における `.claude/skills/`（canonical root）と `.agents/skills/`（mirror）の競合を以下の手段で部分的に解決した。

- `.gitattributes` に category 別の merge policy（`merge=union` / `merge=ours`）を定義
- `generate-index.js` から日付ヘッダを除去し deterministic な出力に統一
- `post-merge-index-regenerate.sh` による merge 後の自動 index 再生成
- `session-init.sh` への `merge.ours.driver` 未設定警告の追加

しかしこれらは「特定ファイル種別の衝突を防ぐ」対症療法であり、2 ルート間の**全ファイル完全一致（full parity）を継続的に保証するガード**は未実装のままである。

現在の実測差分（2026-04-18 時点）は以下の通り。

```
.claude/skills/aiworkflow-requirements/LOGS.md
.claude/skills/aiworkflow-requirements/indexes/resource-map.md
.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md
.claude/skills/skill-creator/SKILL.md
.claude/skills/skill-creator/references/knowledge-management-guide.md
.claude/skills/skill-creator/scripts/generate_skill_md.js
(.claude/skills/int-test-skill/ は .agents/ に存在しない)
```

これらはいずれも「最後の rsync を手動で忘れた」「wave 完了後に canonical だけ更新した」ことによる drift である。

### 1.2 問題点・課題

| 課題                                           | 具体的症状                                                                                             |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| full parity 検証手段がない                     | `diff -qr` を手動実行しないと差分に気づかない。PR merge まで発覚しないことがある                       |
| mirror への sync が wave 完了後の手動作業依存  | rsync / cp を忘れると canonical と mirror が乖離し、次の worktree で旧 mirror を参照してしまう         |
| .agents/ にのみ存在しないスキルがある          | `int-test-skill` が canonical にだけ存在し、mirror では参照不能                                        |
| CI / pre-push で parity を確認する仕組みがない | ローカルで parity が壊れたままコミット・PR 作成できてしまう                                            |
| SKILL.md や scripts の差分が蓄積する           | `skill-creator/SKILL.md`・`generate_skill_md.js` など canonical と mirror で内容が違う状態が続いている |

### 1.3 放置した場合の影響

- worktree の異なる Claude Code セッションが canonical と mirror の別々のバージョンを参照し、動作が**再現不能なほど食い違う**
- 次の TASK-CONFLICT-PREVENT 系タスクが「どちらが正本か不明」な状態から始まり、再び手マージが発生する
- `int-test-skill` のような canonical-only スキルが `.agents/` 経由では一切参照できないため、スキル機能が部分的にしか使えない
- 差分が「知らず知らずに」蓄積し、一括同期しようとしたときのコンフリクトが巨大化する

---

## 2. 何を達成するか（What）

### 2.1 目的

`.claude/skills/`（canonical）から `.agents/skills/`（mirror）への**完全パリティ**を、CI とローカル hook の両方で自動検証・自動修復できる状態にする。

### 2.2 最終ゴール

1. `diff -qr .claude/skills .agents/skills` が 0 差分で通る状態を CI（pre-push または PR check）で保証できる
2. wave 完了時に手動 rsync を忘れても、hook または CI が差分を検出して警告・修正できる
3. canonical-only スキル（`int-test-skill` 等）が mirror に同期され、双方から参照可能になる
4. full parity guard スクリプトが `aiworkflow-requirements` の existing validation chain に接続される

### 2.3 スコープ

#### 含むもの

- `diff -qr .claude/skills .agents/skills` による全ファイル差分チェックスクリプトの作成
- `pre-push` hook または `PostToolUse` hook への parity check 組み込み
- 差分発生時の自動 rsync（`rsync -a --delete .claude/skills/ .agents/skills/`）または警告フロー
- `int-test-skill` の `.agents/skills/` への初回同期
- parity check を CI（GitHub Actions または pre-push）に組み込む設計・実装
- existing `session-init.sh` / `post-merge-index-regenerate.sh` との統合

#### 含まないもの

- `merge=union` / `merge=ours` の policy 変更（TASK-CONFLICT-PREVENT-001 のスコープ）
- `references/*.md merge=union` の再評価（別未タスク）
- EVALS.json schema 変更（AC-6 により凍結中）
- `.agents/skills/` を廃止して 1 root に統一するアーキテクチャ変更

### 2.4 成果物

- `scripts/verify-skills-parity.sh`（または `.js`）: full parity 検証スクリプト
- `.claude/hooks/` または `.husky/` への parity check hook
- `int-test-skill` の mirror 同期（初回）
- 既存差分の解消（LOGS.md / resource-map.md / task-workflow-completed.md / skill-creator 3ファイル）
- `docs/30-workflows/unassigned-task/TASK-AGENTS-SKILLS-FULL-SYNC-001.md`（本仕様書）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `.gitattributes` の `merge=ours` 設定と `merge.ours.driver` が設定済みであること（TASK-CONFLICT-PREVENT-001 完了済み）
- `node` および `bash` が使用可能であること
- `rsync` が macOS / Linux 環境で使用可能であること
- `diff` コマンドが使用可能であること（macOS 標準搭載）

### 3.2 依存タスク

| タスクID                                     | 依存内容                               | 状態     |
| -------------------------------------------- | -------------------------------------- | -------- |
| TASK-CONFLICT-PREVENT-001                    | `.gitattributes` / merge policy の基盤 | 完了済み |
| task-imp-aiworkflow-same-wave-sync-guard-001 | manual docs same-wave sync の補完      | 未実施   |

### 3.3 必要な知識

- `rsync -a --delete` による完全ミラー同期の動作
- `diff -qr` による 2 ディレクトリ再帰差分
- git hook（pre-push / post-merge）の配置と実行タイミング
- Claude Code の `PostToolUse` hook および `session-init.sh` の実行モデル
- `.gitattributes` の `merge=ours` が **canonical を優先するため mirror への反映は別途必要**であることの理解

### 3.4 推奨アプローチ

1. **まず現状差分を全量把握する**。`diff -qr .claude/skills .agents/skills` を実行し、ファイル単位の差分リストを確定する。
2. **スクリプトを先に作り、手で動かして検証する**。CI / hook への組み込みはその後に行う。
3. **初回同期は rsync で一括適用**し、差分を 0 にしてからガードを追加する（ガードを先に入れると既存差分でハマる）。
4. **hook は「検出のみ」と「自動修復」を分けて設計する**。CI では検出のみ、ローカル hook では自動 rsync をオプションで提供する。
5. `generate-index.js --quiet` は rsync 後に実行し、`keywords.json` / `topic-map.md` が最新状態であることを保証する。

---

## 4. 実行手順

### Phase 構成

| Phase | 名称               | 目的                                  | 見積もり |
| ----- | ------------------ | ------------------------------------- | -------- |
| 1     | 現状差分の全量把握 | 既存差分ファイルの確定と分類          | 1h       |
| 2     | 初回フル同期       | rsync による差分解消と index 再生成   | 1h       |
| 3     | parity guard 実装  | 検証スクリプトと hook の作成          | 2h       |
| 4     | 検証と統合         | 手動テスト・CI 接続・ドキュメント同期 | 1h       |

---

### Phase 1: 現状差分の全量把握

#### 目的

どのファイルが差分を持つかを機械的に洗い出し、差分の種別（内容差分 / 片方のみ存在）を分類する。

#### 手順

```bash
# 1-1. 全差分ファイルをリストアップ
diff -rq .claude/skills .agents/skills 2>/dev/null | tee /tmp/skills-diff-$(date +%Y%m%d).txt

# 1-2. canonical にのみ存在するファイルを抽出
diff -rq .claude/skills .agents/skills 2>/dev/null | grep "^Only in .claude/skills"

# 1-3. mirror にのみ存在するファイルを抽出（逆方向の残骸）
diff -rq .claude/skills .agents/skills 2>/dev/null | grep "^Only in .agents/skills"

# 1-4. 内容が異なるファイルを抽出
diff -rq .claude/skills .agents/skills 2>/dev/null | grep "^Files.*differ"
```

#### 分類基準

| 差分種別              | 対応方針                                         |
| --------------------- | ------------------------------------------------ |
| 内容差分（LOGS.md）   | canonical を正本として rsync で上書き            |
| canonical-only スキル | rsync で mirror に追加                           |
| mirror-only ファイル  | 削除候補として確認（古い worktree の残骸か確認） |
| indexes/\*.json/md    | rsync 後に generate-index.js で再生成            |

#### 成果物

- `/tmp/skills-diff-YYYYMMDD.txt`（差分リスト）
- 分類済み対応表（`outputs/phase-1/` 相当の作業メモ）

#### 完了条件

- 差分ファイルの全量が把握されている
- 各差分の対応方針が「rsync / 削除確認 / 再生成」の 3 類型に分類されている

---

### Phase 2: 初回フル同期

#### 目的

`diff -qr` が 0 差分になる状態を一度確立し、以後のガードの基準点とする。

#### 手順

```bash
# 2-1. canonical → mirror へ完全ミラー（削除も含む）
rsync -av --delete .claude/skills/ .agents/skills/

# 2-2. indexes の再生成（deterministic output を保証）
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js --quiet

# 2-3. 差分 0 を確認
diff -qr .claude/skills .agents/skills
# 出力が空であることを確認。出力がある場合は 2-1 に戻る。

# 2-4. generate-index.js が両 root で同一出力を生成することを確認
diff .claude/skills/aiworkflow-requirements/indexes/keywords.json \
     .agents/skills/aiworkflow-requirements/indexes/keywords.json
diff .claude/skills/aiworkflow-requirements/indexes/topic-map.md \
     .agents/skills/aiworkflow-requirements/indexes/topic-map.md
```

#### 注意事項

- `rsync --delete` は mirror 側にのみ存在するファイルを削除する。**mirror の独自変更は失われる**ため、Phase 1 で mirror-only ファイルを確認してから実行すること。
- `keywords.json` は `merge=ours` により worktree merge では canonical が優先されるが、rsync 後は canonical の内容で上書きされるため、generate-index.js による再生成が正確。

#### 成果物

- `diff -qr .claude/skills .agents/skills` = 空出力（差分なし）のエビデンス

#### 完了条件

- `diff -qr .claude/skills .agents/skills` が空出力であること
- `int-test-skill` が `.agents/skills/int-test-skill/` に存在すること

---

### Phase 3: parity guard 実装

#### 目的

Phase 2 で確立したゼロ差分状態を**継続的に保証するガード**を実装する。

#### 手順

##### 3-1. parity check スクリプトの作成

ファイル: `.claude/scripts/verify-skills-parity.sh`

```bash
#!/usr/bin/env bash
# verify-skills-parity.sh: .claude/skills と .agents/skills の完全パリティを検証
# 用途: pre-push hook / CI / セッション初期化 から呼び出す
# exit 0: 差分なし（parity OK）
# exit 1: 差分あり（parity NG）

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
CANONICAL="$REPO_ROOT/.claude/skills"
MIRROR="$REPO_ROOT/.agents/skills"

DIFF_OUTPUT=$(diff -qr "$CANONICAL" "$MIRROR" 2>/dev/null || true)

if [ -z "$DIFF_OUTPUT" ]; then
  echo "[parity-check] OK: .claude/skills と .agents/skills に差分はありません"
  exit 0
else
  echo "[parity-check] NG: 以下の差分が検出されました:"
  echo "$DIFF_OUTPUT"
  echo ""
  echo "修正方法: rsync -av --delete .claude/skills/ .agents/skills/"
  echo "          node .claude/skills/aiworkflow-requirements/scripts/generate-index.js --quiet"
  exit 1
fi
```

##### 3-2. 自動修復オプション付きスクリプトの作成

ファイル: `.claude/scripts/sync-skills-mirror.sh`

```bash
#!/usr/bin/env bash
# sync-skills-mirror.sh: .claude/skills を .agents/skills へ完全同期
# 用途: wave 完了後、または verify-skills-parity.sh が NG になったとき
# 引数: --check-only の場合は rsync を実行せず差分確認のみ

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
CANONICAL="$REPO_ROOT/.claude/skills"
MIRROR="$REPO_ROOT/.agents/skills"
CHECK_ONLY="${1:-}"

if [ "$CHECK_ONLY" = "--check-only" ]; then
  diff -qr "$CANONICAL" "$MIRROR" || true
  exit 0
fi

echo "[mirror-sync] rsync 開始: canonical → mirror"
rsync -av --delete "$CANONICAL/" "$MIRROR/"

echo "[mirror-sync] index 再生成中..."
node "$CANONICAL/aiworkflow-requirements/scripts/generate-index.js" --quiet

echo "[mirror-sync] parity 確認..."
DIFF=$(diff -qr "$CANONICAL" "$MIRROR" 2>/dev/null || true)
if [ -z "$DIFF" ]; then
  echo "[mirror-sync] 完了: parity OK"
else
  echo "[mirror-sync] 警告: 再生成後も差分が残っています:"
  echo "$DIFF"
  exit 1
fi
```

##### 3-3. pre-push hook への組み込み

ファイル: `.husky/pre-push`（または `.git/hooks/pre-push`）への追記

```bash
# .agents/skills と .claude/skills の parity check
PARITY_SCRIPT="$(git rev-parse --show-toplevel)/.claude/scripts/verify-skills-parity.sh"
if [ -f "$PARITY_SCRIPT" ]; then
  bash "$PARITY_SCRIPT" || {
    echo ""
    echo "[pre-push] parity NG のため push を中止します。"
    echo "  修正: bash .claude/scripts/sync-skills-mirror.sh"
    exit 1
  }
fi
```

##### 3-4. session-init.sh への parity warning 追加

既存の `session-init.sh` に以下を追記する（`merge.ours.driver` チェックの直後）。

```bash
# .agents/skills parity check（差分が多い場合のみ警告）
PARITY_SCRIPT="$PROJECT_DIR/.claude/scripts/verify-skills-parity.sh"
if [ -f "$PARITY_SCRIPT" ]; then
  PARITY_RESULT=$(bash "$PARITY_SCRIPT" 2>&1 || true)
  if echo "$PARITY_RESULT" | grep -q "NG"; then
    echo "⚠️  [session-init] .agents/skills が .claude/skills と差分があります。"
    echo "   修正: bash .claude/scripts/sync-skills-mirror.sh"
  fi
fi
```

#### 成果物

- `.claude/scripts/verify-skills-parity.sh`
- `.claude/scripts/sync-skills-mirror.sh`
- `.husky/pre-push`（または hook 追記）
- `session-init.sh` の更新

#### 完了条件

- `verify-skills-parity.sh` が差分あり時に exit 1、なし時に exit 0 を返す
- `sync-skills-mirror.sh` 実行後に `verify-skills-parity.sh` が exit 0 を返す
- pre-push 時に parity NG なら push が中止される

---

### Phase 4: 検証と統合

#### 目的

実装したガードが意図通り動作することを確認し、既存の validation chain（generate-index / validate-structure / audit-unassigned-tasks）に接続する。

#### 手順

```bash
# 4-1. 意図的に差分を作り、verify スクリプトが NG を返すことを確認
echo "test" >> /tmp/test-drift.txt
cp /tmp/test-drift.txt .claude/skills/aiworkflow-requirements/LOGS.md.bak 2>/dev/null || true
bash .claude/scripts/verify-skills-parity.sh  # exit 1 を確認

# 4-2. sync スクリプトで差分を解消し、OK を返すことを確認
bash .claude/scripts/sync-skills-mirror.sh
bash .claude/scripts/verify-skills-parity.sh  # exit 0 を確認

# 4-3. generate-index.js の deterministic 出力を確認
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js --quiet
diff .claude/skills/aiworkflow-requirements/indexes/keywords.json \
     .agents/skills/aiworkflow-requirements/indexes/keywords.json
# 差分なし = OK

# 4-4. existing validation chain との接続確認
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/aiworkflow-requirements/scripts/validate-structure.js \
  .claude/skills/aiworkflow-requirements

# 4-5. audit-unassigned-tasks で本仕様書が登録済みであることを確認
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --target-file docs/30-workflows/unassigned-task/TASK-AGENTS-SKILLS-FULL-SYNC-001.md
```

#### 成果物

- 検証ログ（exit code の記録）
- `diff -qr .claude/skills .agents/skills` = 空出力のスクリーンショットまたはログ

#### 完了条件

- `verify-skills-parity.sh` が差分あり / なし両方のケースで正しい exit code を返す
- `sync-skills-mirror.sh` 実行後に parity が回復する
- pre-push hook が parity NG 時に push を中止する
- `int-test-skill` が `.agents/skills/` に存在する
- `diff -qr .claude/skills .agents/skills` が空出力

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `verify-skills-parity.sh` が差分あり時 exit 1、なし時 exit 0 を返す
- [ ] `sync-skills-mirror.sh` が rsync + generate-index.js + parity 確認を 1 コマンドで完結する
- [ ] pre-push hook（または CI）が parity NG 時に push を中止する
- [ ] `int-test-skill` が `.agents/skills/int-test-skill/` に同期されている
- [ ] 既存差分 6 ファイル（LOGS.md / resource-map.md / task-workflow-completed.md / skill-creator 3 ファイル）が解消されている

### 品質要件

- [ ] `diff -qr .claude/skills .agents/skills` が空出力
- [ ] `generate-index.js --quiet` 実行後の `keywords.json` / `topic-map.md` が canonical と mirror で一致する
- [ ] `rsync --delete` 実行前に mirror-only ファイルの確認ステップが存在する
- [ ] スクリプトに `set -euo pipefail` が設定されている
- [ ] pre-push hook の追加が `--no-verify` 禁止ルールに沿っている

### ドキュメント要件

- [ ] 本仕様書が `docs/30-workflows/unassigned-task/` に存在する
- [ ] `verify-skills-parity.sh` と `sync-skills-mirror.sh` の使い方が `session-init.sh` の警告メッセージに記載されている
- [ ] TASK-CONFLICT-PREVENT-001 の `unassigned-task-detection.md` で HIGH 扱いだった本未タスクへの参照が接続されている

---

## 6. 検証方法

### シナリオ 1: 差分検出（NG ケース）

```bash
# canonical に変更を加えて diff を発生させる
echo "dummy" >> .claude/skills/aiworkflow-requirements/LOGS.md

# verify スクリプトが exit 1 を返すことを確認
bash .claude/scripts/verify-skills-parity.sh
echo "exit code: $?"  # 期待値: 1
```

### シナリオ 2: 同期・修復（OK ケース）

```bash
bash .claude/scripts/sync-skills-mirror.sh
bash .claude/scripts/verify-skills-parity.sh
echo "exit code: $?"  # 期待値: 0
```

### シナリオ 3: pre-push での中止

```bash
# 差分を意図的に作り git push を試みる
echo "test" >> .claude/skills/aiworkflow-requirements/LOGS.md
git add . && git commit -m "test: parity guard test"
git push  # pre-push hook が exit 1 を返し、push が中止されることを確認
# 確認後、変更を git reset --soft HEAD~1 で戻す
```

### シナリオ 4: int-test-skill の mirror 存在確認

```bash
ls .agents/skills/int-test-skill/SKILL.md
# ファイルが存在することを確認
```

### 全量検証コマンド

```bash
# parity
diff -qr .claude/skills .agents/skills

# generate-index deterministic
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js --quiet
diff .claude/skills/aiworkflow-requirements/indexes/keywords.json \
     .agents/skills/aiworkflow-requirements/indexes/keywords.json

# existing validation chain
node .claude/skills/aiworkflow-requirements/scripts/validate-structure.js \
  .claude/skills/aiworkflow-requirements

# 本仕様書の unassigned-task 登録確認
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json --target-file docs/30-workflows/unassigned-task/TASK-AGENTS-SKILLS-FULL-SYNC-001.md
```

---

## 7. リスクと対策

| リスク                                                                   | 影響度 | 発生確率 | 対策                                                                                                                                 |
| ------------------------------------------------------------------------ | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `rsync --delete` が mirror 側の独自変更を上書きする                      | 高     | 低       | Phase 1 で mirror-only ファイルを事前確認し、独自変更があれば canonical へ反映してから rsync を実行する                              |
| `keywords.json` が rsync 後に generate-index.js で再生成されず差分が残る | 中     | 中       | `sync-skills-mirror.sh` 内で rsync の直後に generate-index.js を必ず実行するシーケンスを固定する                                     |
| pre-push hook が husky の設定と競合する                                  | 中     | 低       | `.husky/pre-push` に追記する形にし、hook の置き換えを行わない。既存 hook との順序を確認する                                          |
| session-init.sh の parity check が重く、セッション開始が遅延する         | 低     | 中       | `verify-skills-parity.sh` は `diff -qr` のみで実行時間 < 1 秒を目標とする。重い場合は `CLAUDE_SKIP_HEAVY_HOOKS=1` でスキップ可にする |
| worktree が増えるたびに独立した merge が発生し、parity が再び壊れる      | 高     | 高       | post-merge hook に `sync-skills-mirror.sh` を組み込み、merge のたびに自動同期する（`post-merge-index-regenerate.sh` と統合）         |
| `.agents/skills/` が廃止・移動する際に本 guard が誤動作する              | 低     | 低       | スクリプト冒頭で CANONICAL / MIRROR のパスが存在するか確認し、どちらかが存在しない場合はスキップする                                 |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/conflict-prevent-skills-001/phase-12-documentation.md` — 本タスクの発見源
- `docs/30-workflows/conflict-prevent-skills-001/outputs/phase-12/unassigned-task-detection.md` — HIGH 優先 follow-up として記録
- `docs/30-workflows/unassigned-task/task-imp-aiworkflow-same-wave-sync-guard-001.md` — 隣接タスク（manual docs same-wave sync guard）
- `.claude/hooks/post-merge-index-regenerate.sh` — post-merge での index 再生成（本タスクの同期先）
- `.claude/hooks/session-init.sh` — session start 時の warning 導線（本タスクで拡張対象）
- `.claude/scripts/setup-merge-drivers.sh` — merge.ours.driver の登録スクリプト（参照）

### 関連ファイル（実装対象）

- `.claude/scripts/verify-skills-parity.sh`（新規作成）
- `.claude/scripts/sync-skills-mirror.sh`（新規作成）
- `.husky/pre-push`（追記）
- `.claude/hooks/session-init.sh`（追記）
- `.agents/skills/int-test-skill/`（新規同期）

### 参考コマンド

```bash
# 差分確認
diff -qr .claude/skills .agents/skills

# 完全同期
rsync -av --delete .claude/skills/ .agents/skills/

# index 再生成
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js --quiet

# merge driver 確認
git config --get merge.ours.driver
```

---

## 9. 備考

### 苦戦箇所【記入必須】

TASK-CONFLICT-PREVENT-001 の実装を通じて、以下の苦戦箇所が確認された。本タスクの設計に直接反映している。

| 苦戦箇所                                                             | 発生状況                                                                                                           | 教訓                                                                                               |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `.agents/skills/` と `.claude/skills/` の競合が 4 回発生             | worktree 並列開発で canonical と mirror を同時に参照する波が重なり、LOGS.md / keywords.json で繰り返しコンフリクト | wave 完了ごとに `diff -qr` を実行する習慣と hook による自動検出の両方が必要                        |
| `keywords.json`（自動生成）の手マージが困難だった                    | `merge=ours` を導入する前に手マージを試みたが、JSON 構造が複雑で衝突箇所を特定しづらかった                         | 自動生成ファイルは「マージしない」が正解。`merge=ours` + deterministic regenerate の方針が唯一の解 |
| `generate-index.js` に日付ヘッダが残り worktree 間で毎回 diff が発生 | 2 つの worktree が独立して生成した `topic-map.md` のヘッダ行がタイムスタンプ付きで常に差分を出していた             | 生成ファイルは deterministic（同じ入力 → 同じ出力）でなければ parity guard が機能しない            |
| rsync の実行タイミングを手動に頼っていたため忘れることがあった       | wave 完了後の rsync を忘れ、次の worktree が古い mirror を参照していた                                             | 「最後に rsync」を人間の記憶に頼るのではなく、hook または CI で強制する仕組みが必要                |

### 本タスクと隣接タスクの責務分離

| タスク                                           | 責務                                                              |
| ------------------------------------------------ | ----------------------------------------------------------------- |
| TASK-CONFLICT-PREVENT-001                        | merge policy 設計・`.gitattributes`・deterministic generator      |
| **TASK-AGENTS-SKILLS-FULL-SYNC-001（本タスク）** | **全ファイル parity の継続検証・自動同期・CI 組み込み**           |
| task-imp-aiworkflow-same-wave-sync-guard-001     | manual canonical docs の same-wave closure（ledger / backlog 等） |
| task-p0-05-mirror-sync-automation                | CI での mirror sync 自動化（より大規模）                          |

本タスクは「今ある差分を解消し、今後も差分が生まれないようにガードする」ことに集中する。merge policy の変更や manual docs の same-wave sync は隣接タスクの責務として分離する。
