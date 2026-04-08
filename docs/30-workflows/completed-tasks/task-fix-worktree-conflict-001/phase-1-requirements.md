# Phase 1: 要件定義

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 1                              |
| 機能名 | task-fix-worktree-conflict-001 |
| 作成日 | 2026-04-08                     |

## 目的

50〜60本の並列 worktree ブランチが `.claude/skills/` と `.agents/skills/` 配下のファイルを同時更新することで発生するマージコンフリクトの根本原因を整理し、4 core サブタスク（FIX-001-A〜D）と 2 dependent サブタスク（FIX-001-E / FIX-001-F）の修正範囲・受け入れ基準・依存関係を確定する。
あわせて、`task-specification-creator` と `aiworkflow-requirements` の 2 つの skill 定義への準拠と、30 種の思考法による多角的分析を並列に走らせ、後続 Phase の判断材料を固定する。

---

## Step 0: 現状確認【必須】

Phase 1 開始前に、対象ファイルと既存設定の実装状態を確認し、重複・齟齬を防止する。

```bash
# 本ブランチの変更差分を確認
git diff --name-only
git diff --stat

# 2 つの skill 定義を確認
sed -n '1,260p' .claude/skills/task-specification-creator/SKILL.md
sed -n '1,260p' .claude/skills/aiworkflow-requirements/SKILL.md

# .gitattributes の現在の merge 設定を確認
grep -n "merge=" .gitattributes

# CI ワークフローの paths-ignore 設定を確認
grep -n "paths-ignore\|claude\|agents" .github/workflows/ci.yml

# session-init.sh の現在の内容を確認
cat .claude/hooks/session-init.sh

# 対象スキル一覧の確認
ls .claude/skills/
ls .agents/skills/

# SKILL.md に「変更履歴」セクションが存在するか確認
grep -rn "変更履歴\|## Changelog\|## History" .claude/skills/*/SKILL.md .agents/skills/*/SKILL.md
```

**確認事項**:

- [ ] `.gitattributes` に LOGS.md / references/_.md / indexes/_.json の merge 設定が追加済みであること（前提条件）
- [ ] `.gitattributes` の `EVALS.json` が `merge=union` になっていること（FIX-001-A の対象）
- [ ] `.github/workflows/ci.yml` に `.claude/**` の paths-ignore が未設定であること（FIX-001-B の対象）
- [ ] `.claude/hooks/post-merge-index-regenerate.sh` が未存在であること（FIX-001-C の対象）
- [ ] 各 `SKILL.md` に変更履歴セクションが存在すること（FIX-001-D の対象）
- [ ] `~/.config/zsh/conf.d/73-git-worktree.zsh` の `gwt()` に `_gwt_ensure_post_merge_hook` が未追加であること（FIX-001-E の対象）
- [ ] `~/.tmux.conf` の bind B の pane 1 に `CLAUDE_SKIP_HEAVY_HOOKS=1` が未設定であること（FIX-001-F の対象）

**保存責務の確認**:

- 両方残すべき情報は union で守る
- 再生成できる情報は ours + post-merge 再生成で守る
- 状態値のように片側上書きが必要な情報は、破損防止を優先しつつ follow-up の移行先も明示する

---

## 実行タスク

- **タスク1**: 現状確認（Step 0）— 対象ファイルの実装状態確認
- **タスク2**: 問題の根本原因を分析・文書化
- **タスク3**: 6 サブタスクのスコープ（core 4 + dependent 2）を確定（変更ファイル一覧・変更種別）
- **タスク4**: 受け入れ基準（AC-1〜AC-8）の詳細定義
- **タスク5**: 依存関係・前提条件の整理

---

## 参照資料

| 資料名                     | パス                                                               | 説明                                       |
| -------------------------- | ------------------------------------------------------------------ | ------------------------------------------ |
| 現在の .gitattributes      | `.gitattributes`                                                   | 既実施のマージ戦略設定確認                 |
| task-specification-creator | `.claude/skills/task-specification-creator/SKILL.md`               | Phase 1-13 の実行ルール確認                |
| aiworkflow-requirements    | `.claude/skills/aiworkflow-requirements/SKILL.md`                  | 正本仕様・更新ルール確認                   |
| resource-map               | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`   | canonical な参照先を逆引きする入口         |
| topic-map                  | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`      | セクション・行番号を絞り込む参照マップ     |
| CI ワークフロー            | `.github/workflows/ci.yml`                                         | FIX-001-B の変更対象                       |
| session-init.sh            | `.claude/hooks/session-init.sh`                                    | FIX-001-C のフック自動インストール追加対象 |
| インデックス生成スクリプト | `.claude/skills/aiworkflow-requirements/scripts/generate-index.js` | FIX-001-C の再生成コマンド確認             |
| 全スキル SKILL.md          | `.claude/skills/*/SKILL.md`、`.agents/skills/*/SKILL.md`           | FIX-001-D の分割対象                       |

---

## 検証オーケストレーション

- SubAgent A: `task-specification-creator` の準拠検証を担当する
- SubAgent B: `aiworkflow-requirements` の準拠検証と 30 種の思考法分析を担当する
- Main agent: A/B の結果を統合し、矛盾なし・漏れなし・整合性あり・依存関係整合の 4 条件で判定する
- Gate: A/B の両結果が揃うまで Step 1 へ進まない
- 参照の起点: `resource-map.md` → `topic-map.md` の順で canonical 仕様を確認し、必要最小限だけ読む

---

## 実行手順

### ステップ1: 問題の根本原因分析

以下の5レイヤーで根本原因を分析し、成果物 `outputs/phase-1/root-cause-analysis.md` に記録する。

**レイヤー1: ファイル更新パターン**

- LOGS.md：各ブランチが末尾に追記 → merge=union で解決（実施済み）
- references/\*.md：同上 → merge=union で解決（実施済み）
- indexes/\*.json：自動生成。両ブランチが異なる内容で上書き → merge=ours + post-merge 再生成が正解
- EVALS.json：JSON 構造を持つ状態値。merge=union ではテキスト重複でキーが重複し無効 JSON になる → merge=ours が正解
- SKILL.md：静的仕様 + 変更履歴が混在。変更履歴部分が毎回コンフリクト候補になる → 分割が正解

**レイヤー2: CI コスト構造**

```
並列 PR 数: 50〜60本
CI 1回の所要時間: 約 30 分
スキルファイルのみ変更の PR 割合: 推定 40〜60%
現状の無駄な CI 実行コスト: 最大 60本 × 30分 = 1800分/日
```

**レイヤー3: フック欠落**

- `indexes/*.json` を `merge=ours` にすると、マージされた側のインデックス更新が消える
- post-merge フックで再生成しなければ、マージ後のインデックスが古くなる

**レイヤー4: SKILL.md の構造問題**

- `SKILL.md` は `name`、`description`、`triggers`、`anchors`、`allowed-tools` といった静的仕様と、`変更履歴` セクションが混在
- 変更履歴は各ブランチで追記されるため、静的仕様と同居していると毎回コンフリクトが発生する

**レイヤー5: EVALS.json の設計問題（長期）**

- `EVALS.json` は `current_level`、`total_usage_count`、`last_evaluation_date` のような状態値を JSON で保持
- 並列ブランチが同じキーを異なる値で更新すると、merge=union でもマージは解決できない
- 短期: `merge=ours`（現ブランチ優先）で JSON 破損を防ぐ
- 長期: JSONL 形式（1行1レコード）に変換して追記型にする（本タスクのスコープ外）

**レイヤー6: 保存責務の境界**

| 種別       | 例                                                 | 方針           | 失われる情報への対策                         |
| ---------- | -------------------------------------------------- | -------------- | -------------------------------------------- |
| 両方残す   | `LOGS.md`, `references/*.md`, `SKILL-changelog.md` | `merge=union`  | そのまま保持する                             |
| 再生成する | `indexes/*.json`                                   | `merge=ours`   | post-merge フックで再生成する                |
| 破損を防ぐ | `EVALS.json`                                       | `merge=ours`   | JSON 有効性を検証し、長期は JSONL 移行へ送る |
| 静的仕様   | `SKILL.md`                                         | 変更履歴を分離 | 変更履歴を別ファイルへ退避する               |

> このタスクでは、「残す」「上書きする」「再生成する」をファイル種別ごとに明示し、意図せず新しい情報が消えない状態を作る。

### ステップ2: スコープ確定

**変更ファイル（コード・設定）**:

| ファイル                                          | サブタスク | 変更種別 | 変更内容                                                     |
| ------------------------------------------------- | ---------- | -------- | ------------------------------------------------------------ |
| `.gitattributes`                                  | FIX-001-A  | 修正     | EVALS.json の merge=union → merge=ours                       |
| `.github/workflows/ci.yml`                        | FIX-001-B  | 修正     | paths-ignore 追加、merge_group: トリガー追加                 |
| `.claude/hooks/post-merge-index-regenerate.sh`    | FIX-001-C  | 新規     | インデックス再生成シェルスクリプト                           |
| `.claude/scripts/install-git-hooks.sh`            | FIX-001-C  | 新規     | git フックインストーラー                                     |
| `.claude/hooks/session-init.sh`                   | FIX-001-C  | 修正     | フック自動インストールチェック追加                           |
| `.gitattributes`                                  | FIX-001-D  | 修正     | SKILL-changelog.md の merge=union 追加                       |
| `.claude/skills/*/SKILL.md`（全スキル）           | FIX-001-D  | 修正     | 変更履歴セクションを削除                                     |
| `.claude/skills/*/SKILL-changelog.md`（全スキル） | FIX-001-D  | 新規     | 変更履歴ファイルを作成                                       |
| `.agents/skills/*/SKILL.md`（全スキル）           | FIX-001-D  | 修正     | 変更履歴セクションを削除                                     |
| `.agents/skills/*/SKILL-changelog.md`（全スキル） | FIX-001-D  | 新規     | 変更履歴ファイルを作成                                       |
| `~/.config/zsh/conf.d/73-git-worktree.zsh`        | FIX-001-E  | 修正     | `_gwt_ensure_post_merge_hook` 関数追加・`gwt()` から呼び出し |
| `~/.tmux.conf`                                    | FIX-001-F  | 修正     | bind B の pane 1 に `CLAUDE_SKIP_HEAVY_HOOKS=1` 追加         |

**スコープ外（変更しない）**:

- アプリケーションコード（apps/desktop、apps/web）
- packages/ 配下のコード
- EVALS.json の JSONL 移行（将来タスク）

### ステップ3: 受け入れ基準の確定

以下の受け入れ基準を確定し、成果物として `outputs/phase-1/acceptance-criteria.md` に記録する。

| AC番号 | 基準                                                                          | 検証方法                                                                                              | 担当サブタスク   |
| ------ | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------- |
| AC-1   | 並列ブランチが LOGS.md を更新してもマージコンフリクトが発生しない             | git merge テスト（ローカル）                                                                          | 前提（実施済み） |
| AC-2   | EVALS.json が並列マージで破損せず、意図せず新しい状態値を失わない             | `jq . EVALS.json` でエラーなし + 更新差分の確認                                                       | FIX-001-A        |
| AC-3   | `.claude/**` のみを変更した PR は CI をスキップして即マージ可能               | CI ログで "skipped" を確認                                                                            | FIX-001-B        |
| AC-4   | `indexes/*.json` がマージ後に自動再生成され、消えた情報が復元される           | `git merge` 後にフックが実行され JSON が更新される                                                    | FIX-001-C        |
| AC-5   | SKILL.md の変更履歴部分はコンフリクトなしにマージできる                       | git merge テスト（ローカル）                                                                          | FIX-001-D        |
| AC-6   | 全スキルの SKILL-changelog.md が存在し、SKILL.md から変更履歴が削除されている | `ls` + `grep` で確認                                                                                  | FIX-001-D        |
| AC-7   | `gwt` で新規 worktree 作成後に post-merge フックが自動インストールされる      | worktree 作成後 `HOOK_PATH=$(git rev-parse --git-path hooks/post-merge); test -x "$HOOK_PATH"` で確認 | FIX-001-E        |
| AC-8   | B レイアウト起動時の `gwt-layout-init` が重いフックをスキップして完了する     | tmux B 起動時のログ確認                                                                               | FIX-001-F        |

### ステップ4: 依存関係・前提条件の整理

**前提条件（実施済み）**:

- `.gitattributes` に以下が追加済み:
  - `.claude/skills/*/LOGS.md merge=union`
  - `.agents/skills/*/LOGS.md merge=union`
  - `.claude/skills/*/references/*.md merge=union`
  - `.agents/skills/*/references/*.md merge=union`
  - `.claude/skills/*/indexes/*.json merge=ours`
  - `.agents/skills/*/indexes/*.json merge=ours`

**本タスクの前提**:

- `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` が動作すること（FIX-001-C）
- `.claude/hooks/` ディレクトリが存在すること（FIX-001-C）
- 全スキルの `SKILL.md` に変更履歴セクションが存在すること（FIX-001-D）

---

## 機能要件（FR）

| ID   | 要件                                                  | 優先度 |
| ---- | ----------------------------------------------------- | ------ |
| FR-1 | EVALS.json のマージ戦略を merge=ours に変更する       | 高     |
| FR-2 | CI がスキルファイルのみの変更を検知してスキップできる | 高     |
| FR-3 | マージ後に indexes/\*.json が自動再生成される         | 高     |
| FR-4 | git フックが自動インストールされる仕組みを提供する    | 中     |
| FR-5 | SKILL.md の変更履歴が別ファイルとして管理される       | 中     |

## 非機能要件（NFR）

| ID    | 要件                                                              | 優先度 |
| ----- | ----------------------------------------------------------------- | ------ |
| NFR-1 | post-merge フックは 30 秒以内に完了すること                       | 高     |
| NFR-2 | フックのインストールは冪等であること（2回実行しても副作用がない） | 高     |
| NFR-3 | SKILL-changelog.md は UTF-8 / LF で保存すること                   | 中     |
| NFR-4 | シェルスクリプトは bash で動作すること（zsh 依存を避ける）        | 中     |

---

## サブタスク管理

| ID     | タスク名             | ステータス |
| ------ | -------------------- | ---------- |
| T-01-1 | 現状確認（Step 0）   | 未実施     |
| T-01-2 | 根本原因分析・文書化 | 未実施     |
| T-01-3 | スコープ確定         | 未実施     |
| T-01-4 | 受け入れ基準定義     | 未実施     |
| T-01-5 | 依存関係整理         | 未実施     |

---

## 成果物

| 成果物                   | 配置先                                   | 形式     |
| ------------------------ | ---------------------------------------- | -------- |
| 受け入れ基準ドキュメント | `outputs/phase-1/acceptance-criteria.md` | Markdown |
| スコープ定義書           | `outputs/phase-1/scope-definition.md`    | Markdown |
| 根本原因分析書           | `outputs/phase-1/root-cause-analysis.md` | Markdown |

---

## 完了条件

- [ ] 現状確認（Step 0）を実行し、前提条件の実施済みを確認済みであること
- [ ] EVALS.json が merge=union になっていることを確認済みであること
- [ ] post-merge フックが未存在であることを確認済みであること
- [ ] 受け入れ基準 AC-1〜AC-8 が全て定義・文書化されていること
- [ ] 変更対象ファイル一覧が確定し `outputs/phase-1/scope-definition.md` に記録されていること
- [ ] 根本原因分析が `outputs/phase-1/root-cause-analysis.md` に記録されていること

---

## タスク 100% 実行確認【必須】

- [ ] T-01-1: 現状確認（Step 0）実行済み
- [ ] T-01-2: 根本原因分析を `outputs/phase-1/root-cause-analysis.md` に記録済み
- [ ] T-01-3: スコープを `outputs/phase-1/scope-definition.md` に記録済み
- [ ] T-01-4: 受け入れ基準 AC-1〜AC-8 を `outputs/phase-1/acceptance-criteria.md` に記録済み
- [ ] T-01-5: 依存関係・前提条件を記録済み

---

## 次 Phase

**Phase 2: 設計** — 4 core サブタスク（FIX-001-A〜D）と 2 dependent サブタスク（FIX-001-E / FIX-001-F）の詳細設計と実装方針を確定する。

**ゲート条件**: Phase 1 の全完了条件を満たさない場合、Phase 2 へ進まないこと。

## 参照資料

- `index.md`
- `artifacts.json`
- `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`

## 統合テスト連携

- 後続 Phase の統合テストと台帳同期の根拠を参照する。
- この Phase 単体では、最終検証は `validate-phase-output.js` と `validate-phase12-implementation-guide.js` で確認する。
