# Phase 2 Output: マージポリシーマトリクス

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| タスクID | TASK-CONFLICT-PREVENT-001 |
| Phase    | 2                         |
| 作成日   | 2026-04-18                |

## 概要

コンフリクト源 G1〜G4 に対し、file category ごとの merge policy を確定する。  
custom driver が必要な箇所と built-in で足りる箇所を明確に区別し、`.gitattributes` の記述根拠とする。

---

## マージポリシーマトリクス

| category             | 対象例                           | policy        | 種別          | 備考                                                                                                      |
| -------------------- | -------------------------------- | ------------- | ------------- | --------------------------------------------------------------------------------------------------------- |
| G1 generated index   | `indexes/*.md`, `indexes/*.json` | `merge=ours`  | custom driver | post-merge regenerate 必須。現ブランチのインデックスを保持し、マージ後に `generate-index.js` で再生成する |
| G2 mirror tree       | `.agents/skills/**`              | `merge=ours`  | custom driver | canonical は `.claude/skills/`。マージ後に canonical → mirror sync を再実行する                           |
| G3 append-only log   | `LOGS.md`, `SKILL-changelog.md`  | `merge=union` | built-in      | custom driver 登録不要。追記のみ保証。JSON には適用しない                                                 |
| G4 volatile metadata | `EVALS.json`                     | `merge=ours`  | custom driver | schema は本 wave で変更しない。現ブランチの評価記録を優先する                                             |

---

## custom driver vs built-in の判断基準

| 判断基準             | custom driver (`merge=ours`)               | built-in (`merge=union`)                 |
| -------------------- | ------------------------------------------ | ---------------------------------------- |
| ファイル形式         | 任意（JSON/MD/binary）                     | append-only なプレーンテキスト（MD）のみ |
| コンフリクト時の挙動 | 現ブランチのファイルをそのまま保持         | 両ブランチの行を結合（重複なし）         |
| 登録要件             | `git config merge.ours.driver true` が必須 | 追加設定不要                             |
| post-merge 作業      | regenerate または sync が必要              | 通常は不要（内容が追記のみのため）       |
| 適用リスク           | 設定漏れがあると通常 3-way merge になる    | 行順序差が生じる可能性がある             |

---

## `.gitattributes` 設計（修正後）

### 現状の問題点

| 行                                          | 問題                                                                                     |
| ------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `.claude/skills/*/indexes/*.md merge=union` | generated file に `union` は不適切。regenerate 後の内容変化で差分が増大する              |
| `merge=ours` 全般                           | custom driver bootstrap（`git config merge.ours.driver true`）が未設定の場合は機能しない |

### 修正後の `.gitattributes` 設計方針

```gitattributes
# G1: generated index（custom driver必須、post-merge regenerate）
.claude/skills/*/indexes/*.json   merge=ours
.claude/skills/*/indexes/*.md     merge=ours
.agents/skills/*/indexes/*.json   merge=ours
.agents/skills/*/indexes/*.md     merge=ours

# G2: mirror tree（custom driver必須、canonical は .claude）
.agents/skills/**                 merge=ours

# G3: append-only log（built-in union、custom driver不要）
.claude/skills/*/LOGS.md              merge=union
.agents/skills/*/LOGS.md             merge=union
.claude/skills/*/SKILL-changelog.md  merge=union
.agents/skills/*/SKILL-changelog.md  merge=union

# G4: volatile metadata（custom driver必須、schema不変）
.claude/skills/*/EVALS.json   merge=ours
.agents/skills/*/EVALS.json   merge=ours
```

---

## bootstrap 手順（必須）

custom driver を有効化するために以下のコマンドを repo 初期化時またはセッション開始時に実行する。

```bash
# custom merge driver の登録（merge=ours を機能させるために必須）
git config merge.ours.driver true
```

この手順は以下の箇所に記載する。

- `session-init.sh`（Claude Code Hooks: SessionStart）
- `README.md` または `SETUP.md` のセットアップ節

---

## policy 決定の根拠

| policy                           | 根拠                                                                                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| G1 を `union` から `ours` へ変更 | generated file は手マージではなく regenerate で正しい状態に戻すべき。`union` は行追加のみ保証するため、インデックスの構造変化に対応できない |
| G2 に `ours` を適用              | `.agents/skills/` は mirror であり、canonical の状態を正とする。他ブランチの mirror 更新より canonical 側の最新を優先する                   |
| G3 に `union` を維持             | ログ系 MD は内容の保存が最優先。両ブランチの追記を統合することが目的に合致する                                                              |
| G4 を `ours` に限定              | `EVALS.json` は JSON 構造を持ち、`union` は JSON を破壊する。schema 変更は consumer 監査後の follow-up とする                               |
