# Phase 1: 要件定義書

## メタ情報

| 項目           | 内容                                                |
| -------------- | --------------------------------------------------- |
| タスクID       | TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001           |
| 機能名         | gitattributes-merge-union-reeval                    |
| taskType       | **NON_VISUAL**（UI/UX 変更を一切伴わない設定改善）  |
| P50 判定       | small（数行〜十数行の `.gitattributes` 差分に収束） |
| 作成日         | 2026-04-19                                          |
| 前提完了タスク | TASK-CONFLICT-PREVENT-001                           |

## 1. 目的

`.gitattributes` で `references/*.md` 全体に適用されている `merge=union` を、
append-only ファイルと構造化ドキュメントに分類して再適用範囲を絞り込む。
これにより構造化 Markdown（見出し・表・箇条書き・コードフェンス）の
長期的な破損リスクを排除する。

## 2. 背景（現状の課題）

- 現行 `.gitattributes` (line 15-16) は `.{claude,agents}/skills/*/references/*.md`
  全体に `merge=union` を一括適用している。
- 実測: `git check-attr merge <任意>` で以下のファイルまで `merge: union` が返る。
  - `references/task-workflow.md`（構造化）
  - `references/lessons-learned-current.md`（構造化・見出し階層あり）
  - `references/api-*.md`（構造化 API ドキュメント）
  - `references/arch-*.md`（構造化 アーキテクチャドキュメント）
- `merge=union` は **行レベルで両ブランチの差分行を順序保持せず連結**するため、
  構造化ファイルではテーブル破損・見出し重複・順序不明な箇条書きを生む。
- さらに `merge=ours`（カスタム）は `setup-merge-drivers.sh` の事前実行が必要で、
  現時点では `git config --get merge.ours.driver` が空（未登録）。

## 3. taskType 判定（P50 チェック）

| 判定項目           | 結果                                                                   |
| ------------------ | ---------------------------------------------------------------------- |
| UI/UX 変更有無     | 無し（`.gitattributes` と `setup-merge-drivers.sh` のみ）              |
| スクリーンショット | 不要                                                                   |
| 影響ファイル数     | 2 ファイル（`.gitattributes` + `setup-merge-drivers.sh` コメントのみ） |
| 実装規模           | small（差分 20 行以内）                                                |
| **taskType**       | **NON_VISUAL**                                                         |

## 4. スコープ

### in-scope（本タスクで対応）

1. `.{claude,agents}/skills/*/references/*.md` の append-only / 構造化 分類
2. `.gitattributes` の glob 精緻化（`merge=union` 適用範囲の縮小）
3. `setup-merge-drivers.sh` の動作確認（ロジック変更なし、コメント追記のみ）
4. 判断基準の文書化（新規ファイル追加時の再評価フロー）
5. Phase 11 でマージシミュレーションによる挙動検証

### out-of-scope（本タスクで対応しない）

- `indexes/*.json` / `indexes/*.md` の戦略変更（既存 `merge=ours` を維持、レビューのみ）
- `EVALS.json` のスキーマ変更（EVALS consumer 監査タスク完了まで凍結）
- Git フック / CI ワークフローの変更
- `.gitattributes` 以外の Git 設定ファイル（`.gitignore` / `.gitconfig`）
- 既存 `merge=ours` カスタムドライバーのロジック変更

## 5. 前提・制約

- **再利用方針**: 新規スクリプト・新規フックを作成しない（[FB-SDK-07-1]）。
- **mirror parity**: `.claude/skills/*` と `.agents/skills/*` の対称性を維持する。
- **既完了タスク整合**: TASK-CONFLICT-PREVENT-001 で導入した `merge=ours` と
  `LOGS.md merge=union` の既存方針は維持する。
- **ドライバー自動登録**: `setup-merge-drivers.sh` の自動化は本タスクでは扱わず、
  ドキュメント化による手動運用で閉じる（未タスク候補 A として Phase 12 で記録）。

## 6. `merge.ours.driver` 登録状況（現状確認）

| 項目                                 | 実測結果                                      |
| ------------------------------------ | --------------------------------------------- |
| `git config --get merge.ours.driver` | `(unset)` — **未登録**                        |
| `setup-merge-drivers.sh` の存在      | 存在（`.claude/scripts/` 配下）               |
| `setup-merge-drivers.sh` の起動方法  | `bash .claude/scripts/setup-merge-drivers.sh` |
| セッション開始時の警告               | `merge=ours が機能しません` の警告が出ている  |

## 7. 期待される成果（完了時の状態）

- `.gitattributes` の `merge=union` 対象が append-only ファイルに限定されている。
- 構造化ドキュメント（`task-workflow.md` / `lessons-learned*.md` 等）は
  デフォルト 3-way マージ対象となり、並列編集時は人手解決される。
- `setup-merge-drivers.sh` 実行で `merge.ours.driver` が登録され、
  `indexes/*.json` が `merge=ours` として機能する。
- 新規 `references/` ファイル追加時の分類フローが `implementation-guide.md` に明記され、
  運用者が再評価できる。
