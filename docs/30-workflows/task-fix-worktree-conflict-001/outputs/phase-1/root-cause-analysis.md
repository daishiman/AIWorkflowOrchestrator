# 根本原因分析 - TASK-FIX-WORKTREE-CONFLICT-001

## 確認済み現状（Step 0）

| 確認項目                                            | 実際の状態                         | 対応要否     |
| --------------------------------------------------- | ---------------------------------- | ------------ |
| `.gitattributes` EVALS.json                         | `merge=union` → 要変更             | ✅ FIX-001-A |
| `.gitattributes` LOGS.md / references/\*.md         | `merge=union` 設定済み             | 前提条件 OK  |
| `.gitattributes` indexes/\*.json                    | `merge=ours` 設定済み              | 前提条件 OK  |
| `.github/workflows/ci.yml` paths-ignore             | `.claude/**` / `.agents/**` 未設定 | ✅ FIX-001-B |
| `.github/workflows/ci.yml` merge_group              | 未設定                             | ✅ FIX-001-B |
| post-merge フック                                   | 未存在                             | ✅ FIX-001-C |
| `SKILL.md` 変更履歴セクション                       | 全スキルに存在                     | ✅ FIX-001-D |
| `73-git-worktree.zsh` `_gwt_ensure_post_merge_hook` | 未追加                             | ✅ FIX-001-E |
| `~/.tmux.conf` bind B CLAUDE_SKIP_HEAVY_HOOKS       | 未設定                             | ✅ FIX-001-F |

---

## 5レイヤー根本原因分析

### レイヤー1: ファイル更新パターン

| ファイル種別                  | 更新パターン              | 発生コンフリクト               | 根本原因                                                           |
| ----------------------------- | ------------------------- | ------------------------------ | ------------------------------------------------------------------ |
| `LOGS.md` / `references/*.md` | 各ブランチが末尾に追記    | 行単位でコンフリクト           | `merge=union` 未設定（前タスクで解決済み）                         |
| `indexes/*.json`              | 自動生成（全上書き）      | 異なる内容で上書き合戦         | `merge=ours` 設定なし（前タスクで解決済み）・post-merge 再生成なし |
| `EVALS.json`                  | JSON 状態値（上書き型）   | キー重複で無効 JSON            | `merge=union` が設定されており JSON 構造を破壊するリスク           |
| `SKILL.md`                    | 静的仕様 + 変更履歴が混在 | 変更履歴部分で毎回コンフリクト | 変更履歴が別ファイルに分離されていない                             |

### レイヤー2: CI コスト構造

```
並列 PR 数:              50〜60本
CI 1回の所要時間:        約 30 分
スキルファイルのみ変更:  推定 40〜60% の PR
無駄な CI 実行コスト:    最大 60本 × 30分 = 1,800分/日

根本原因: .claude/**, .agents/** が paths-ignore に未設定
```

### レイヤー3: フック欠落

```
indexes/*.json が merge=ours → マージされた側の更新が消失
post-merge フックなし → マージ後のインデックスが古いまま

根本原因: post-merge-index-regenerate.sh が未作成
         install-git-hooks.sh が未作成
         session-init.sh に自動インストールチェックなし
```

### レイヤー4: SKILL.md の構造問題

```
SKILL.md = 静的仕様（name/description/triggers/anchors） + 変更履歴（追記型）
変更履歴は各ブランチで更新 → 静的仕様と同居でコンフリクト頻発

根本原因: 追記型情報（変更履歴）と静的情報（仕様）が同一ファイルに混在
```

### レイヤー5: EVALS.json の設計問題（長期）

```
EVALS.json = current_level, total_usage_count などのカウンタ型 JSON
merge=union → テキスト行ユニオン → JSON キー重複 → 無効 JSON リスク

短期解決: merge=ours（現ブランチ優先）で JSON 破損防止
長期解決: JSONL 形式（1行1レコード）に変換して追記型にする（スコープ外）
```

---

## 保存責務の分類

| 種別        | 代表ファイル                                       | 方針           | 情報ロストへの対策                   |
| ----------- | -------------------------------------------------- | -------------- | ------------------------------------ |
| 追記型      | `LOGS.md`, `references/*.md`, `SKILL-changelog.md` | `merge=union`  | 追記をそのまま保持                   |
| 再生成可能  | `indexes/*.json`                                   | `merge=ours`   | post-merge フックで再生成            |
| 状態値 JSON | `EVALS.json`                                       | `merge=ours`   | JSON 有効性を保ち、長期は JSONL 移行 |
| 静的仕様    | `SKILL.md`                                         | 変更履歴を分離 | 変更履歴を SKILL-changelog.md へ退避 |

---

## スキル一覧（変更履歴セクション保有確認）

**`.claude/skills/` (8スキル)**:

- aiworkflow-requirements: `## 変更履歴` あり ✅
- claude-agent-sdk: `## 変更履歴` あり ✅
- github-issue-manager: `## 変更履歴` あり ✅
- google: `## 変更履歴` あり ✅
- ipc-preload-spec-sync-guardian: `## 変更履歴` あり ✅
- skill-creator: `## 変更履歴` あり ✅
- skill-fixture-runner: `## 変更履歴` あり ✅
- task-specification-creator: `## 変更履歴` あり ✅

**`.agents/skills/` (8スキル)**: 同一構成（.claude と同期）
