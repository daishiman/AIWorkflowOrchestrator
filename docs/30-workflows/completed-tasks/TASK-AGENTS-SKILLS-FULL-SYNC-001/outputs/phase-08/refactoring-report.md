# Phase 8 成果物: リファクタリングレポート

## メタ情報

| 項目       | 値                               |
| ---------- | -------------------------------- |
| Phase      | 8                                |
| 対象タスク | TASK-AGENTS-SKILLS-FULL-SYNC-001 |
| 実行日     | 2026-04-19                       |

## 変更内容テーブル（Before / After / 理由）

Phase 5 実装時点でリファクタリング観点を組み込み済のため、本 Phase は**確認レビュー**として扱う。

| 対象                                  | Before（想定）                            | After（Phase 5 実装）                                                        | 理由                                                                        |
| ------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `verify-skills-parity.sh` の変数名    | `CANONICAL_ROOT` / `MIRROR_ROOT` 混在     | `REPO_ROOT` / `CANONICAL` / `MIRROR` に統一                                  | sync 側との 1:1 対応、grep 経路を 1 パターンに集約                          |
| `sync-skills-mirror.sh` の変数名      | `SRC` / `DEST` 等混在                     | `REPO_ROOT` / `CANONICAL` / `MIRROR` / `CHECK_ONLY` で統一                   | verify との対称性、将来の共通化判断の前提                                   |
| verify の診断出力                     | `diff -qr` 原文垂れ流し                   | `[parity-check] NG:` 見出し + 差分 + `sync-skills-mirror.sh` 案内の 3 段     | エラー後の次行動を即提示し導線を単純化                                      |
| sync の進捗出力                       | rsync `-av` の verbose 数百行             | `rsync -a --delete`（非 verbose）+ 主要ステップ 3 行のみ                     | セッション UI のノイズ削減、失敗時は `[mirror-sync] 警告:` で露出           |
| session-init.sh の parity warning     | NG 時に全量エコー                         | NG 検出時のみ 2 行（⚠ 警告 + sync コマンド）                                 | 1 秒未満目標、OK 時は沈黙                                                   |
| `.husky/pre-push` の parity ブロック  | warning・中止・案内を全列挙で冗長         | 2 行のみ（`[pre-push] parity NG のため push を中止します` + 修正コマンド）   | `--no-verify` 回避導線を含めない、意図を 1:1                                |
| verify の CANONICAL / MIRROR 欠損分岐 | 両欠損と MIRROR 単独欠損が同一扱い        | 両不在 / canonical 不在は SKIP、mirror 単独欠損は NG exit 1 に分離           | bootstrap と異常欠損の切り分け、pre-push fail-closed 維持                   |
| verify の未使用関数                   | 早期コミットの残骸（想定）                | 未配置（Phase 5 で新規作成のため残骸なし）                                   | navigation drift 削減                                                       |
| sync の `--check-only` 分岐ログ       | 分岐内外で重複                            | `--check-only` 時は `diff -qr` のみ、rsync/generate-index 非実行（exit 0/1） | オプション意味と exit code を 1 対 1 で提示                                 |
| `sync-skills-mirror.sh` 実行順序      | （仕様書: rsync → generate-index → diff） | **generate-index → rsync → diff** に修正（Phase 5 実装レポート参照）         | generate-index が canonical 側のみ更新する \_\_dirname 相対スクリプトのため |

## `post-merge-index-regenerate.sh` との重複回避

| 観点             | 現状                                                                               | 本 Phase の対応                                                                      |
| ---------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 実行タイミング   | post-merge は merge / checkout 時に index 再生成                                   | 本タスクの 2 本は pre-push / session-init / 手動実行から呼ぶ。merge 契機には触れない |
| 責務             | 既存 hook は index 整合性維持のみ                                                  | 本タスクは `diff -qr` parity と `rsync --delete` 全量同期を担当                      |
| 重複可能性       | `generate-index.js` 呼び出しが両者に現れるが、呼び出し契機が異なるため実質重複せず | 統合は行わない。将来検討として末尾に記録                                             |
| 将来統合時の前提 | -                                                                                  | 統合する場合は post-merge 側で `sync-skills-mirror.sh --check-only` を呼ぶ形が候補   |

## 共通関数抽出の要否判断

| 判断軸                       | 結論           | 根拠                                                                   |
| ---------------------------- | -------------- | ---------------------------------------------------------------------- |
| 重複ロジックの量             | 少             | `REPO_ROOT` / `CANONICAL` / `MIRROR` 設定の 3 ブロックのみ（10-15 行） |
| 共通化の技術的コスト         | 中             | `.claude/scripts/lib/*.sh` 相当の新規ファイルが必要                    |
| 共通化しないことの運用コスト | 小             | 重複 10-15 行、変数名統一で読解コスト十分低減                          |
| **結論**                     | **抽出しない** | bash 2 本の規模では共通ファイル導入の保守コストが上回る                |

## 警告メッセージ導線の切り分け

| 位置            | 目的                    | メッセージ形式                                                                                                              |
| --------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| session-init    | 情報提示（非 blocking） | `⚠️  [session-init] .agents/skills が .claude/skills と差分があります` + `修正: bash .claude/scripts/sync-skills-mirror.sh` |
| pre-push        | 中止誘導（blocking）    | `[pre-push] parity NG のため push を中止します` + `修正: bash .claude/scripts/sync-skills-mirror.sh`                        |
| verify 単体実行 | 状態診断                | `[parity-check] OK:...` / `[parity-check] NG:...` + 差分一覧                                                                |
| sync 実行       | 作業ログ                | `[mirror-sync] index 再生成中` / `[mirror-sync] rsync 開始` / `[mirror-sync] 完了: parity OK`                               |

## CANONICAL / MIRROR 変数名の統一

| スクリプト                | 変数                                                              |
| ------------------------- | ----------------------------------------------------------------- |
| `verify-skills-parity.sh` | `REPO_ROOT` / `CANONICAL` / `MIRROR`                              |
| `sync-skills-mirror.sh`   | `REPO_ROOT` / `CANONICAL` / `MIRROR` / `CHECK_ONLY` / `GEN_INDEX` |

- 両スクリプトで `CANONICAL="$REPO_ROOT/.claude/skills"` / `MIRROR="$REPO_ROOT/.agents/skills"` に固定
- 変数名統一により保守時の探索経路を 1 本化

## 非スコープ（本 Phase / 本タスクで触らない対象）

- `.gitattributes`（TASK-CONFLICT-PREVENT-001 merge policy）
- `merge.ours.driver` の登録スクリプト `setup-merge-drivers.sh`
- EVALS.json の schema（AC-9）
- `post-merge-index-regenerate.sh`（統合は将来検討）
- `generate-index.js` の実装本体（呼び出し方のみ本タスク責務）

## 将来検討

| 検討項目                                                           | 起票タイミング                                         |
| ------------------------------------------------------------------ | ------------------------------------------------------ |
| `post-merge-index-regenerate.sh` と `sync-skills-mirror.sh` の統合 | 本タスク完了 + 1 wave 運用後、drift 再発頻度を見て判断 |
| `.claude/scripts/lib/` 的な共通 bash ライブラリ導入                | スクリプト 3 本以上かつ重複 30 行超になった時          |
| GitHub Actions 側での parity check（pre-push の fallback）         | `task-p0-05-mirror-sync-automation` の実装時           |

## 完了条件チェック

- [x] 変更内容テーブルで Before / After / 理由が全行埋まっている
- [x] `post-merge-index-regenerate.sh` を触らない制約と将来検討化を明記
- [x] 共通関数抽出しない結論とその根拠を記録
- [x] `CANONICAL` / `MIRROR` 変数名が 2 スクリプトで一致
- [x] session-init（warning）と pre-push（blocking）の導線差が実装と一致
- [x] navigation drift（TODO / debug print / 重複コメント）が無い
- [x] `.gitattributes` / EVALS.json / `post-merge-index-regenerate.sh` に本 Phase で手を入れていない
