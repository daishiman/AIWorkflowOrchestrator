# Phase 8: リファクタリング

## メタ情報

| 項目      | 値                                                      |
| --------- | ------------------------------------------------------- |
| Phase     | 8                                                       |
| 機能名    | TASK-AGENTS-SKILLS-FULL-SYNC-001                        |
| 作成日    | 2026-04-19                                              |
| 前提Phase | Phase 1 要件 / Phase 2 設計 / Phase 3 設計レビュー 完了 |

## 目的

Phase 5 実装後の 2 本のスクリプト（`verify-skills-parity.sh` / `sync-skills-mirror.sh`）と 2 箇所の hook 追記（`.husky/pre-push` / `.claude/hooks/session-init.sh`）について、重複排除・命名統一・wording 整理を行い、運用上の最小セットへ圧縮する。既存 `post-merge-index-regenerate.sh` との統合は本 Phase では扱わず、将来検討として明記する。

## 実行タスク

1. 変更内容テーブル（対象 / Before / After / 理由）を確定する
2. `post-merge-index-regenerate.sh` との責務重複を確認し、現時点では統合せず将来検討として記録する
3. verify / sync スクリプト間の共通関数抽出の要否を判断し、抽出しない結論を明文化する
4. session-init と pre-push の警告メッセージ導線を「情報提示」と「中止誘導」に切り分ける
5. `CANONICAL` / `MIRROR` など共有変数名を 2 スクリプトで統一する
6. 不要コメント・冗長な出力（navigation drift）を削除する
7. 既存 TASK-CONFLICT-PREVENT-001 成果物（`.gitattributes` / `merge.ours.driver` / deterministic generator 既存 log）に**触れない**制約を明文化する

## 参照資料

| 資料名                           | パス                                                                           | 用途                                 |
| -------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------ |
| Phase 1 要件定義                 | `docs/30-workflows/TASK-AGENTS-SKILLS-FULL-SYNC-001/phase-01-requirements.md`  | AC-1〜AC-9 の参照                    |
| Phase 2 設計                     | `docs/30-workflows/TASK-AGENTS-SKILLS-FULL-SYNC-001/phase-02-design.md`        | C-1〜C-5 コンポーネント契約          |
| Phase 3 設計レビュー             | `docs/30-workflows/TASK-AGENTS-SKILLS-FULL-SYNC-001/phase-03-design-review.md` | 30 種思考法レビューと残リスク        |
| post-merge hook                  | `.claude/hooks/post-merge-index-regenerate.sh`                                 | 本タスクの同期 hook との責務分離参考 |
| session-init hook                | `.claude/hooks/session-init.sh`                                                | parity warning 導線                  |
| setup-merge-drivers              | `.claude/scripts/setup-merge-drivers.sh`                                       | bash script 書式の参考               |
| TASK-CONFLICT-PREVENT-001 成果物 | `docs/30-workflows/completed-tasks/conflict-prevent-skills-001/`               | 本 Phase で触らない対象の境界定義    |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                 | 用途                                     |
| ----------------------- | -------------------------------------------------------------------- | ---------------------------------------- |
| canonical / mirror 原則 | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` | canonical 優先・mirror 派生の設計原則    |
| generate-index 契約     | `.claude/skills/aiworkflow-requirements/scripts/generate-index.js`   | deterministic output と `--quiet` フラグ |

## 実行手順

### ステップ 1: 変更内容テーブルの確定

| 対象                                          | Before                                                                    | After                                                                                                          | 理由                                                                              |
| --------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `verify-skills-parity.sh` の変数名            | スクリプト内で `CANONICAL_ROOT` / `MIRROR_ROOT` など命名ゆらぎがある状態  | `CANONICAL` / `MIRROR` に統一                                                                                  | sync 側との読み比べコストを下げ、保守時の grep を 1 パターンに集約する            |
| `sync-skills-mirror.sh` の変数名              | `SRC` / `DEST` など別名称が混在し得る                                     | `CANONICAL` / `MIRROR` に統一                                                                                  | verify と sync を 1:1 で対応させ、将来の共通化判断の前提を揃える                  |
| verify スクリプトの診断出力                   | 差分あり時に `diff -qr` 原文をそのまま垂れ流す                            | `[parity-check] NG:` の見出し 1 行 + 差分一覧 + `sync-skills-mirror.sh` 1 行コマンドの順で整形                 | エラー時の次の行動（sync 実行）を即座に提示し、ユーザーが迷わない導線を作る       |
| sync スクリプトの進捗出力                     | rsync `-av` の冗長 verbose が数百行出る                                   | 主要ステップ（rsync / generate-index / 再検証）の開始行のみ出力、verbose は warning/error 時のみ残す           | セッション UI のノイズを減らしつつ、失敗時のトレース情報は保つ                    |
| session-init.sh の parity warning             | `bash "$PARITY_SCRIPT" 2>&1` の出力を全量エコー                           | NG 検出時のみ 2 行（⚠ 警告行 + sync コマンド 1 行）を出す。OK 時は何も出さない                                 | セッション開始時のノイズを最小化。OK 時の沈黙を前提にし、1 秒未満の UX 目標を守る |
| `.husky/pre-push` の parity ブロック          | warning ではなく blocking だが、案内文が sync / verify 両方を列挙して長い | `[pre-push] parity NG のため push を中止します` + `修正: bash .claude/scripts/sync-skills-mirror.sh` の 2 行   | 中止理由と復帰コマンドを 1:1 に揃え、`--no-verify` 回避導線を含めない             |
| verify スクリプトの CANONICAL/MIRROR 欠損分岐 | bootstrap 前と mirror 欠損時の扱いが同じに見える                          | 両 root 不在のみ SKIP、`CANONICAL` 存在 / `MIRROR` 欠損は `[parity-check] NG:` で exit 1 に分離                | bootstrap と異常欠損を切り分け、pre-push の fail-closed を守る                    |
| verify スクリプトの未使用ヘルパー関数         | 早期コミットで放置された一時的な関数コメント                              | 削除                                                                                                           | navigation drift（コード内の読解コスト）を削減                                    |
| sync スクリプトの `--check-only` 分岐ログ     | 分岐内外で重複する情報ログ                                                | `--check-only` 時は verify と同等の差分表示のみ、差分ありなら exit 1、rsync/generate-index 非実行を 1 行で示す | オプションの意味と exit code が 1 行で伝わるようにする                            |

### ステップ 2: `post-merge-index-regenerate.sh` との重複回避

| 観点             | 現状                                                                                 | 本 Phase の対応                                                                               |
| ---------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| 実行タイミング   | `post-merge-index-regenerate.sh` は merge / checkout 時に index を再生成する         | 本タスクの 2 本は pre-push / session-init / 手動実行から呼ばれ、merge 契機には触れない        |
| 責務             | 既存 hook は index の整合性維持のみを担当                                            | 本タスクは `diff -qr` の parity 保証と `rsync --delete` の全量同期を担当                      |
| 重複可能性       | `generate-index.js` 呼び出しが両者に現れるが、呼ばれる契機が異なるため実質重複しない | 統合は行わない。将来の検討項目として本 Phase 末尾の「将来検討」節に記録のみ                   |
| 将来統合時の前提 | -                                                                                    | 統合する場合は post-merge hook 側で `sync-skills-mirror.sh --check-only` を呼ぶ形が候補となる |

### ステップ 3: 共通関数抽出の要否判断

| 判断軸                                   | 結論           | 根拠                                                                                                                  |
| ---------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------- |
| 2 スクリプト間で重複しているロジックの量 | 少             | `REPO_ROOT` 解決、`CANONICAL` / `MIRROR` パス組み立て、存在チェックの 3 ブロックのみ                                  |
| 共通化の技術的コスト                     | 中             | bash で source 可能な共通ファイルを新設する必要があり、`.claude/scripts/lib/*.sh` のような 3 つ目のファイルが生まれる |
| 共通化しないことの運用コスト             | 小             | 重複は 10〜15 行程度で、変数名統一（ステップ 1）で読解コストは十分に下がる                                            |
| **結論**                                 | **抽出しない** | bash script 2 本という規模では、共通ファイルを増やすほうが保守コストが高い。変数名統一で十分                          |

### ステップ 4: 警告メッセージ導線の切り分け

| 位置            | 目的                    | メッセージ形式                                                                                                            |
| --------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| session-init    | 情報提示（非 blocking） | `⚠ [session-init] .agents/skills と .claude/skills に差分があります` + `修正: bash .claude/scripts/sync-skills-mirror.sh` |
| pre-push        | 中止誘導（blocking）    | `[pre-push] parity NG のため push を中止します` + `修正: bash .claude/scripts/sync-skills-mirror.sh`                      |
| verify 単体実行 | 状態診断                | `[parity-check] OK:...` または `[parity-check] NG:...` + 差分一覧                                                         |
| sync 実行       | 作業ログ                | `[mirror-sync] rsync 開始` / `[mirror-sync] index 再生成中` / `[mirror-sync] 完了: parity OK`                             |

### ステップ 5: CANONICAL / MIRROR 変数名の統一

| スクリプト                | 変数                                                   |
| ------------------------- | ------------------------------------------------------ |
| `verify-skills-parity.sh` | `REPO_ROOT` / `CANONICAL` / `MIRROR`                   |
| `sync-skills-mirror.sh`   | `REPO_ROOT` / `CANONICAL` / `MIRROR`（+ `CHECK_ONLY`） |

- 両スクリプトで `CANONICAL="$REPO_ROOT/.claude/skills"` / `MIRROR="$REPO_ROOT/.agents/skills"` と固定
- 変数名の grep 経路が 1 本に揃い、保守時の探索を簡略化する

### ステップ 6: navigation drift の削除

| 削除対象                                                         | 削除理由                                               |
| ---------------------------------------------------------------- | ------------------------------------------------------ |
| 初期コミット時に入った `TODO` / `FIXME` のうち既に解決済みのもの | 実装完了後の残骸であり誤読を招く                       |
| `# debug:` で始まる verbose print 文                             | 開発中のみ必要。運用後は警告/エラー時に limited に残す |
| `.husky/pre-push` 内の「将来こうする」系のコメント               | Phase 8 の「将来検討」節へ移動し、実装コードからは削除 |
| session-init 内のコメント重複（同じ内容の日本語 / 英語併記）     | 日本語のみに統一                                       |

### ステップ 7: 非スコープ（本 Phase で触らない対象）の明文化

- `.gitattributes`（TASK-CONFLICT-PREVENT-001 の merge policy） — 触らない
- `merge.ours.driver` の登録スクリプト `setup-merge-drivers.sh` — 触らない
- EVALS.json の schema — 触らない（AC-9）
- `post-merge-index-regenerate.sh` — 触らない（統合は将来検討）
- `generate-index.js` の実装本体 — 触らない（呼び出し方のみ本タスクの責務）

## 将来検討（本 Phase スコープ外）

| 検討項目                                                           | 起票タイミング                                                |
| ------------------------------------------------------------------ | ------------------------------------------------------------- |
| `post-merge-index-regenerate.sh` と `sync-skills-mirror.sh` の統合 | 本タスク完了 + 1 wave 運用後、drift 再発頻度を見て判断する    |
| `.claude/scripts/lib/` 的な共通 bash ライブラリ導入                | スクリプトが 3 本以上に増え、重複ロジックが 30 行超になった時 |
| GitHub Actions 側での parity check（pre-push の fallback）         | task-p0-05-mirror-sync-automation の実装時                    |

## 多角的チェック観点（AIが判断）

- 抽象化思考: 概念名を増やさずに「検出 / 同期」の 2 機能を表現できているか
- 素人思考: 初見で session-init の警告とコマンドを見たら即 sync を打てるか
- 改善思考: 文章量ではなく判断負荷（読むべき行数）を減らせているか
- システム思考: post-merge hook との責務境界が実装コードの命名・コメントからも読み取れるか

## 成果物

- 変更内容テーブル（対象 / Before / After / 理由）
- 重複回避判断の記録（post-merge hook 統合は将来検討として記録）
- 共通関数抽出しない結論と根拠
- CANONICAL / MIRROR 変数名統一後のスクリプトファイル 2 本
- session-init / pre-push それぞれの警告メッセージ整理済み追記ブロック
- 将来検討 3 項目の起票条件

## 完了条件

- [ ] 変更内容テーブルで Before / After / 理由が全行埋まっている
- [ ] `post-merge-index-regenerate.sh` を触らない制約と将来検討化が明記されている
- [ ] 共通関数抽出しない結論とその根拠が記録されている
- [ ] `CANONICAL` / `MIRROR` 変数名が 2 スクリプトで一致している
- [ ] session-init（warning）と pre-push（blocking）の導線差が実装とドキュメントで一致している
- [ ] navigation drift（TODO / debug print / 重複コメント）が削除されている
- [ ] `.gitattributes` / EVALS.json / `post-merge-index-regenerate.sh` に本 Phase で手を入れていない

## 次のPhaseへの引き継ぎ

- Phase 9（品質保証）: 変数名統一後のスクリプトを対象に、`shellcheck`・`diff -qr`・`validate-structure.js` を束ねた一括判定コマンド列を作る
- Phase 9: 各 bash script の line budget（< 80 行）を実測し、超過があれば原因を記録する
- Phase 9: 本 Phase の警告メッセージ整理後の出力サンプルを quality-report 入力として渡す

## 統合テスト連携

- Phase 9 は本 Phase の Before/After テーブルを品質レビューの説明責任に使う
- Phase 10 / 12 は本 Phase で残した将来統合候補を future scope と unassigned-task 候補へ分離して扱う
