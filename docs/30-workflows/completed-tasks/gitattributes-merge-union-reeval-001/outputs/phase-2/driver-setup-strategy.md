# Phase 2: ドライバー設定戦略

## 1. 背景

`.gitattributes` に記述された `merge=ours` は **Git 組み込みドライバーではなく、カスタムドライバー名**。
`git config merge.ours.driver <cmd>` で登録されないと、マージ時に:

- Git 2.x系: `warning: failed to resolve 'ours'` が出力され、デフォルト 3-way にフォールバック
- 一部環境: `error: unknown merge driver 'ours'` として失敗

現行のセッション環境でも `git config --get merge.ours.driver` が空（未登録）であり、
`session-init.sh` 起動時の警告と一致する。

## 2. 案の列挙と評価

### 案 A: 自動化（`session-init.sh` から起動）

**内容**: `.claude/hooks/session-init.sh` から `bash .claude/scripts/setup-merge-drivers.sh` を呼び出す。

| 評価軸                 | 結果                                                                           |
| ---------------------- | ------------------------------------------------------------------------------ |
| 実行コスト             | 低（idempotent なので毎回実行しても副作用なし）                                |
| 副作用                 | 中（`git config` のローカル設定が Claude Code セッション経由で自動変更される） |
| 既存セッションへの影響 | `session-init.sh` の責務が広がり、失敗時の切り分けが困難化                     |
| スコープ外性           | `session-init.sh` の修正は本タスクの非スコープに抵触するおそれ                 |

### 案 B: 現状維持＋ドキュメント化（推奨）

**内容**: `setup-merge-drivers.sh` は手動実行のまま。以下でドキュメント化:

1. `setup-merge-drivers.sh` 冒頭コメントに「初回 clone 後に必ず実行」を明記
2. `.gitattributes` 冒頭の関連リソースセクションに起動コマンド記載
3. Phase 12 `implementation-guide.md` の Part 2 に手順を記述
4. `session-init.sh` が未登録警告を出すのを活用（既存動作で変更なし）

| 評価軸                 | 結果                      |
| ---------------------- | ------------------------- |
| 実行コスト             | 低（手動 1 コマンドのみ） |
| 副作用                 | なし                      |
| 既存セッションへの影響 | なし                      |
| スコープ外性           | スコープ内に完全収束      |

## 3. 判断軸と推奨案

| 判断軸                 | 重み | 案 A                    | 案 B                             |
| ---------------------- | ---- | ----------------------- | -------------------------------- |
| 本タスクのスコープ維持 | 高   | △                       | ◎                                |
| 運用者の認知負荷       | 高   | ◎（気付かなくても動く） | ○（警告で気付く）                |
| 失敗時の切り分けやすさ | 中   | △                       | ◎                                |
| 将来の自動化余地       | 中   | ◎（既に自動）           | ◎（未タスク候補 A として起票可） |

**推奨案**: **案 B（現状維持＋ドキュメント化）**

案 A は本タスクのスコープを超え、`session-init.sh` の副作用を増やすため採用しない。
代わりに **Phase 12 Task 4 未タスク検出候補 A** として「setup-merge-drivers.sh の自動実行化」を
別タスクに起票候補として記録し、監査を残す。

## 4. 既存コンポーネント再利用（[FB-SDK-07-1] 対応）

### 再利用対象

- `.claude/scripts/setup-merge-drivers.sh`（ロジック変更なし、冒頭コメントのみ追記）

### 新規作成しないもの（明示的 NO）

- 新規スクリプト
- 新規 hook
- 新規 CI ワークフロー
- 新規 Makefile ターゲット

### 変更対象ファイル一覧（最小差分）

| 種別 | ファイル                                 | 変更内容                         |
| ---- | ---------------------------------------- | -------------------------------- |
| 修正 | `.gitattributes`                         | glob 精緻化 + コメント整理       |
| 修正 | `.claude/scripts/setup-merge-drivers.sh` | 冒頭コメント追記（ロジック不変） |

## 5. `setup-merge-drivers.sh` 追記コメント案

```bash
#!/bin/bash
# ── カスタム merge ドライバー登録スクリプト ──
#
# このスクリプトは、リポジトリの .gitattributes で参照される
# `merge=ours` カスタムドライバーをローカル Git 設定に登録します。
#
# === 登録されるドライバー ===
# merge.ours.driver = true
#   用途: .gitattributes の `merge=ours` 指定を解決し、マージ時に現ブランチ側を採用する。
#   適用ファイル例: indexes/*.json, indexes/*.md, EVALS.json
#
# === 未登録時の挙動 ===
# Git は `merge=ours` 指定を解決できず、以下のいずれかが発生する:
#   - warning: failed to resolve 'ours' でデフォルト 3-way マージにフォールバック
#   - 環境によりマージ失敗
# マージ後の自動生成インデックス再生成:
#   node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
#
# === 実行タイミング（必須） ===
# - 初回 clone 直後（.git/config はリポジトリ内に含まれないため毎回必要）
# - macOS / Linux 両対応、idempotent（何度実行しても安全）
#
# 使い方:
#   bash .claude/scripts/setup-merge-drivers.sh

set -euo pipefail
# 以下ロジック不変
```
