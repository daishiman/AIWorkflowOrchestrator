# TASK-MERGE-DRIVER-BOOTSTRAP-GUARD-001 - タスク指示書

## メタ情報

```yaml
issue_number: 2335
```

## メタ情報

| 項目         | 内容                                                                                           |
| ------------ | ---------------------------------------------------------------------------------------------- |
| タスクID     | TASK-MERGE-DRIVER-BOOTSTRAP-GUARD-001                                                          |
| タスク名     | merge.ours.driver 未登録検出 guard 機構実装                                                    |
| 分類         | インフラ改善 / Git 運用                                                                        |
| 対象機能     | Git hooks / setup-merge-drivers.sh / session-start hook                                        |
| 優先度       | 中（MEDIUM）                                                                                   |
| 見積もり規模 | 小規模（実装 0.5d / テスト 0.5d / Phase 11 再実施 0.5d）                                       |
| ステータス   | 未実施                                                                                         |
| 発見元       | TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001 Phase 12 unassigned-task-detection.md（DISC-MED-01） |
| 発見日       | 2026-04-19                                                                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001 の Phase 11 手動テスト（DISC-MED-01）において、以下の事実が判明した。

`.gitattributes` に `merge=ours` を指定していても、`git config merge.ours.driver true`（`setup-merge-drivers.sh` で設定）を事前実行していなければ、Git 2.38 系は **stderr に何も出力せず**、暗黙的に default 3-way マージへフォールバックする。

実測ログ（Phase 11 MT 実施時）:

```
$ git config --get merge.ours.driver
(unset)

$ git merge idx-d --no-edit 2>stderr.log
Auto-merging .claude/skills/test-skill/indexes/topic-map.json
CONFLICT (content): Merge conflict in ...

$ cat stderr.log
（空）
```

stderr が空であることで「driver が未登録であること」を実行時に検知できない。

現在の `session-init.sh`（SessionStart hook）には `(unset)` 検出 → 警告出力の仕組みが存在するが、セッション開始時のみの実行であるため、新規 clone 後に session-init.sh が動く前に `git merge / git pull` を実行するワークフローでは保護されない。

### 1.2 問題点・課題

| 問題                                    | 内容                                                                                                                               |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| driver 未登録が実行時に検知されない     | Git 2.38 系は `merge=ours` driver 未登録時に stderr へ警告を出力せず、デフォルト 3-way マージへ静かにフォールバックする            |
| 新規 clone 後の window が存在する       | `setup-merge-drivers.sh` 実行前に `git pull/merge` を実行した場合、誤った merge strategy が適用されても気づかない                  |
| session-init.sh は事後検知にすぎない    | SessionStart hook は開発セッション開始時の警告であり、マージ実行の直前ガードにはなっていない                                       |
| `merge=ours` はカスタムドライバーである | `.gitattributes` の `merge=ours` は Git 組み込みの `ours` 戦略（recursive merge の ours オプション）とは別物であり、混同されやすい |

### 1.3 放置した場合の影響

- 新規 clone した開発者が `setup-merge-drivers.sh` 未実行のまま長期間作業するリスクがある
- `indexes/*.json` や `indexes/*.md` などの自動生成ファイルが、`merge=ours`（ブランチ側優先）ではなく default 3-way マージで解決され、予期しないコンフリクトやデータ混入が発生する可能性がある
- コンフリクトが発生しても「driver 未登録が原因」と気づくまでに時間がかかり、誤構成が長期化する
- TASK-CONFLICT-PREVENT-001 / TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001 で整備した `merge=ours` 設計が形骸化する

---

## 2. 何を達成するか（What）

### 2.1 目的

`merge.ours.driver` が未登録の状態でマージが実行される前（または後）に、開発者へ自動で警告または自動登録を行う guard 機構を実装する。これにより、新規 clone 環境での誤構成が早期に検知・修復される。

### 2.2 最終ゴール

| ID   | 達成すること                                                                                                   |
| ---- | -------------------------------------------------------------------------------------------------------------- |
| G-01 | `post-merge` hook に `git config --get merge.ours.driver` チェックを追加し、未登録時に警告または自動登録を行う |
| G-02 | `session-init.sh`（SessionStart hook）の既存チェックを強化し、`(unset)` 検出時の案内メッセージを改善する       |
| G-03 | guard 機構が idempotent（何度実行しても安全）であることを確認する                                              |
| G-04 | 実装した guard が macOS（Darwin）環境で動作することを確認する                                                  |

### 2.3 スコープ（含む/含まない）

**含むもの**:

- `.husky/_/post-merge` への driver 未登録チェックロジック追加
- `session-init.sh` の `(unset)` 検出メッセージの改善（`setup-merge-drivers.sh` 実行案内の強化）
- guard 機構の動作テスト（driver 登録前後での挙動確認）
- `setup-merge-drivers.sh` の冪等性確認

**含まないもの**:

- CI（GitHub Actions 等）での driver 登録自動化（別タスク扱い）
- `core.attributesfile`（グローバル attributes）への対応
- `merge=ours` 以外のカスタム merge driver の guard
- `.gitattributes` の glob 変更（TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001 のスコープ）
- TypeScript / Next.js コードへの変更

### 2.4 受入条件（AC）

| AC   | 条件                                                                                                              | 検証方法                                                                                          |
| ---- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| AC-1 | `merge.ours.driver` が未登録の状態で `git merge` を実行した後、警告メッセージが表示される（または自動登録される） | `git config --unset merge.ours.driver` で未登録状態にし、テストブランチをマージして出力を確認する |
| AC-2 | `setup-merge-drivers.sh` 実行後に guard を再実行しても、警告・エラーが発生しない（idempotent）                    | `setup-merge-drivers.sh` を実行後、再度 `git merge` を実行して警告が出ないことを確認する          |
| AC-3 | `session-init.sh` が `(unset)` を検出した場合に、`setup-merge-drivers.sh` の実行手順が案内される                  | `git config --unset merge.ours.driver` 後にセッションを開始し、`session-init.sh` の出力を確認する |
| AC-4 | guard スクリプトが macOS（Darwin）環境で動作する                                                                  | ローカル macOS 環境でテストを実行し、AC-1〜AC-3 が PASS することを確認する                        |

### 2.5 成果物

| 成果物                                                  | 内容                                                     |
| ------------------------------------------------------- | -------------------------------------------------------- |
| `.husky/_/post-merge`（変更）                           | driver 未登録検出 → 警告または自動登録ロジックの追記     |
| `.claude/scripts/session-init.sh`（変更、存在する場合） | `(unset)` 検出時の案内メッセージ強化                     |
| `outputs/phase-11/manual-test-result.md`                | guard 動作の手動テスト結果                               |
| `outputs/phase-11/manual-test-checklist.md`             | テスト項目チェックリスト（NON_VISUAL 判定理由を含む）    |
| `outputs/phase-11/discovered-issues.md`                 | 発見された課題一覧（0 件でも出力）                       |
| `outputs/phase-11/phase11-capture-metadata.json`        | キャプチャメタデータ（`CAPTURE_BLOCKED` を明示）         |
| `outputs/phase-11/screenshot-plan.json`                 | スクリーンショット計画（`non_visual: true` を明示）      |
| `outputs/phase-12/implementation-guide.md`              | 実装内容の概要・変更ファイル一覧・苦戦箇所の記録         |
| `outputs/phase-12/unassigned-task-detection.md`         | 本タスク実施中に発見された未タスクの一覧（0 件でも記録） |
| `outputs/phase-12/skill-feedback-report.md`             | スキルへのフィードバック・改善点（なしでも記録）         |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

| 確認項目                                                                     | 確認方法                                                                                                          |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 現在の `.husky/_/post-merge` の内容を把握する                                | ファイルを読み込み、既存処理（husky の `h` スクリプト呼び出し）の構造を確認する                                   |
| `session-init.sh` の `(unset)` 検出ロジックを把握する                        | `.claude/scripts/session-init.sh`（またはパスが異なる場合は実際のパス）の `merge.ours.driver` 関連箇所を確認する  |
| `setup-merge-drivers.sh` の冪等性を確認する                                  | `setup-merge-drivers.sh` を複数回実行して副作用がないことを確認する（`git config merge.ours.driver true` は冪等） |
| TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001 の Phase 11 DISC-MED-01 を把握する | `docs/30-workflows/gitattributes-merge-union-reeval-001/outputs/phase-11/discovered-issues.md` を参照する         |

### 3.2 依存タスク

| タスクID                                  | 状態         | 関係                                                             |
| ----------------------------------------- | ------------ | ---------------------------------------------------------------- |
| TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001 | 完了済み     | 発見元タスク。問題の背景・実測ログ（DISC-MED-01）を提供する      |
| TASK-CONFLICT-PREVENT-001                 | 完了済み想定 | `.claude/scripts/` 系ファイルの変更ルール（mirror 同期等）の前提 |

### 3.3 アーキテクチャ設計方針

**設計判断: post-merge hook vs. session-start hook**

| 配置場所           | メリット                                                                    | デメリット                                                                     |
| ------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| post-merge hook    | マージ直後に検知できる（タイムリー）。実際のマージと紐付いた警告            | post-merge は `git pull --rebase` では呼ばれない場合がある（git version 依存） |
| session-start hook | 開発セッション開始時に必ず実行される。既存の `session-init.sh` を強化できる | マージ実行タイミングではなくセッション開始時の遅延検知                         |

推奨: **両方に配置する**（post-merge hook での即時警告 + session-init.sh での補完）

**自動登録 vs. 警告ログのトレードオフ**

| 対応         | メリット                           | デメリット                                                             |
| ------------ | ---------------------------------- | ---------------------------------------------------------------------- |
| 自動登録     | 開発者の手間なし。誤構成が即時修復 | hook が `git config` を変更するため、CI 環境での意図しない副作用リスク |
| 警告ログのみ | 安全。開発者が意図して実行する     | 警告を無視した場合に誤構成が継続する可能性がある                       |

推奨: **警告ログ + `setup-merge-drivers.sh` 実行案内**（自動登録はオプション）

### 3.4 主要ファイルと役割

| ファイル                                                                                       | 役割                                                           |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `.husky/_/post-merge`                                                                          | 変更対象。`merge.ours.driver` 未登録チェックを追加する         |
| `.claude/scripts/setup-merge-drivers.sh`                                                       | 既存の driver 登録スクリプト。guard からの案内先として参照する |
| `.claude/scripts/session-init.sh`（存在する場合）                                              | 既存の SessionStart hook。`(unset)` 検出メッセージの改善対象   |
| `docs/30-workflows/gitattributes-merge-union-reeval-001/outputs/phase-11/discovered-issues.md` | 背景コンテキスト。DISC-MED-01 の実測ログを参照する             |

---

## 4. 実行手順（Phase 構成）

### Phase 1: 要件定義

**目的**: guard 機構の実装方針と受入条件を確定する。

**作業内容**:

1. `.husky/_/post-merge` の現在の内容を確認し、追記可能かどうかを判断する
2. `.claude/scripts/session-init.sh`（または実際のパス）の `merge.ours.driver` 関連ロジックを確認する
3. TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001 の Phase 11 `discovered-issues.md`（DISC-MED-01）を読み、実測ログを把握する
4. guard を「post-merge hook」「session-start hook」「両方」のどれに配置するかを決定する
5. 「自動登録」か「警告ログ + 案内」かを決定する（推奨: 警告ログ + 案内）
6. AC-1〜AC-4 を検証可能な形で確定する

**完了条件**:

- 配置場所（post-merge / session-start / 両方）が決定されている
- 対応方針（自動登録 / 警告ログ）が決定されている
- 変更対象ファイルのパスが特定されている

---

### Phase 2: 設計

**目的**: guard スクリプトの具体的な実装内容を設計する。

**作業内容**:

1. post-merge hook 追加分のシェルスクリプトを設計する

   設計案（`.husky/_/post-merge` への追記）:

   ```bash
   # merge.ours.driver bootstrap guard
   _DRIVER_VAL=$(git config --get merge.ours.driver 2>/dev/null || echo "(unset)")
   if [ "$_DRIVER_VAL" = "(unset)" ]; then
     echo "[post-merge] WARNING: merge.ours.driver が未登録です。"
     echo "  .gitattributes の merge=ours 指定が default 3-way にフォールバックしている可能性があります。"
     echo "  以下を実行して driver を登録してください:"
     echo "    bash .claude/scripts/setup-merge-drivers.sh"
   fi
   ```

2. `session-init.sh` の改善箇所を設計する（既存の `(unset)` 検出メッセージを強化する）
3. 自動登録を選択する場合、`git config merge.ours.driver true` を hook 内で実行する設計を追加する
4. idempotent 性（driver 登録済みの場合は何も出力しない）を確保する
5. CI 環境での副作用を避けるため、`CI` 環境変数を検出して自動登録をスキップするロジックを検討する

**完了条件**:

- post-merge hook への追加スクリプトが Draft として出力されている
- `session-init.sh` の変更箇所が Draft として出力されている
- 両方の Draft が idempotent であることが確認されている

---

### Phase 3: 設計レビューゲート

**目的**: Phase 2 の設計を Phase 5 へ進めるか判定する。

**レビュー観点**:

| 観点                                | 確認内容                                                                                 |
| ----------------------------------- | ---------------------------------------------------------------------------------------- |
| 既存 hook との整合性                | `.husky/_/post-merge` の既存処理（`.husky/_/h` の呼び出し）を壊さないか                  |
| idempotent 性                       | driver 登録済みの場合に警告が出ないことが設計されているか                                |
| macOS / Linux 互換性                | `git config --get` の終了コード（未登録時 exit 1）を前提にした防御的な記述になっているか |
| `setup-merge-drivers.sh` との整合性 | guard からの案内先として `setup-merge-drivers.sh` の実行コマンドが正確か                 |
| 自動登録の副作用リスク評価          | 自動登録を選択する場合、CI 等で意図しない `git config` 変更が発生しないか                |

**判定基準**:

- PASS: 全観点がクリアされれば Phase 5 へ進む
- MAJOR: 既存 hook との矛盾がある場合は Phase 2 に戻る
- CRITICAL: 前提条件（依存タスク未確認など）がある場合は Phase 1 に戻る

---

### Phase 4: テスト設計

**目的**: guard 機構の動作を検証するためのテストシナリオを設計する。

**テストシナリオ**:

| テスト ID | シナリオ                                          | 期待される結果                                                                            |
| --------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| MT-01     | driver 未登録状態でテストブランチをマージする     | post-merge hook が警告メッセージを出力する（または自動登録する）                          |
| MT-02     | driver 登録済み状態でテストブランチをマージする   | post-merge hook が何も出力しない（警告なし）                                              |
| MT-03     | driver 未登録状態でセッションを開始する           | session-init.sh が `(unset)` 検出メッセージと `setup-merge-drivers.sh` 実行案内を出力する |
| MT-04     | `setup-merge-drivers.sh` を実行後、再度マージする | post-merge hook が警告を出力しない（idempotent 確認）                                     |

**チェックリスト**:

| チェック ID | 対応 AC | 確認内容                                                                              |
| ----------- | ------- | ------------------------------------------------------------------------------------- |
| CHK-01      | AC-1    | driver 未登録時に post-merge hook が警告または自動登録を実行する                      |
| CHK-02      | AC-2    | driver 登録済み時に post-merge hook が何も出力しない                                  |
| CHK-03      | AC-3    | `session-init.sh` が `(unset)` 検出時に `setup-merge-drivers.sh` の実行案内を表示する |
| CHK-04      | AC-4    | macOS 環境で MT-01〜MT-04 が全て PASS する                                            |

---

### Phase 5: 実装計画

**目的**: Phase 3 でレビュー済みの設計を元に、実装手順を決定する。

**実装ステップ**:

1. `.husky/_/post-merge` の現在の内容を確認し、追記位置を決定する
2. post-merge hook に driver 未登録チェックロジックを追記する
3. `.claude/scripts/session-init.sh` の `(unset)` 検出メッセージを改善する（オプション）
4. 変更後の hook スクリプトが実行権限を持っていることを確認する（`ls -la` で確認）
5. Phase 4 で設計した CHK-01〜CHK-04 でテストする

---

### Phase 6: テスト実装

**目的**: Phase 4 で設計したテストシナリオを実際に実行し、guard の動作を検証する。

**作業内容**:

1. テスト用ブランチを作成し、`merge=ours` 対象ファイル（`indexes/*.json` 等）を変更してコミットする
2. `git config --unset merge.ours.driver 2>/dev/null || true` で driver 未登録状態にする
3. テストブランチをマージし、MT-01 の期待結果を確認する（警告メッセージが出力される）
4. `setup-merge-drivers.sh` を実行して driver を登録する
5. 再度マージし、MT-02 の期待結果を確認する（警告なし）
6. テスト完了後、テスト用ブランチを削除し、`setup-merge-drivers.sh` を実行して driver を登録状態に戻す

**出力先**:

- `outputs/phase-6/test-execution-log.md`

---

### Phase 7: カバレッジ確認

**目的**: guard 機構がカバーすべきシナリオを網羅していることを確認する。

**確認項目**:

| 確認項目                                  | 基準                                                                         |
| ----------------------------------------- | ---------------------------------------------------------------------------- |
| driver 未登録の検知                       | MT-01 が PASS（警告または自動登録が実行される）                              |
| driver 登録済みの場合の無出力             | MT-02 が PASS（idempotent）                                                  |
| session-init.sh による補完                | MT-03 が PASS（案内メッセージが表示される）                                  |
| `setup-merge-drivers.sh` 実行後の正常動作 | MT-04 が PASS（再実行後に警告なし）                                          |
| `git pull`（merge を伴う）での動作確認    | `git pull` 実行後にも post-merge hook が動作することを確認（環境依存に注意） |

---

### Phase 8: リファクタリング

**目的**: guard スクリプトの可読性と保守性を向上させる。

**確認観点**:

- シェルスクリプトの変数名が明確で意図が伝わるか
- 警告メッセージが「なぜ問題なのか」と「どうすれば解決するか」を両方含んでいるか
- 既存の `.husky/_/post-merge` のスタイルと統一されているか
- スクリプト冒頭にコメント（目的・実行条件）が記載されているか
- `set -e` 環境での `git config --get` の終了コード 1 による意図しない hook 失敗を防ぐ防御的記述（`|| true` 等）が含まれているか

---

### Phase 9: 品質保証

**目的**: guard 機構が品質ゲートをクリアしていることを確認する。

**実行コマンド**:

```bash
# post-merge hook の実行権限確認
ls -la .husky/_/post-merge

# driver 未登録状態での動作確認
git config --unset merge.ours.driver 2>/dev/null || true
git config --get merge.ours.driver 2>/dev/null || echo "(unset) - 未登録確認"

# setup-merge-drivers.sh の冪等性確認
bash .claude/scripts/setup-merge-drivers.sh
bash .claude/scripts/setup-merge-drivers.sh  # 2回目も安全
git config --get merge.ours.driver  # true であることを確認

# シェルスクリプトシンタックスチェック
bash -n .husky/_/post-merge
```

**合格基準**:

- post-merge hook に `merge.ours.driver` チェックが含まれている
- driver 未登録時に警告メッセージが出力される（または自動登録される）
- driver 登録済み時に何も出力されない（idempotent）
- `setup-merge-drivers.sh` が 2 回実行しても安全
- `bash -n` によるシンタックスチェックがエラー 0

---

### Phase 10: 最終レビュー

**目的**: AC-1〜AC-4 の完了判定を行い、マージ可能かどうかを判断する。

**確認チェックリスト**:

- [ ] AC-1: driver 未登録時に post-merge hook が警告または自動登録を実行する
- [ ] AC-2: driver 登録済み時に guard が何も出力しない（idempotent）
- [ ] AC-3: session-init.sh が `(unset)` 検出時に `setup-merge-drivers.sh` 実行案内を表示する
- [ ] AC-4: macOS 環境で AC-1〜AC-3 が PASS する

**判定基準**:

- PASS: 全 AC がクリアされれば Phase 11 へ進む
- MAJOR: AC 未達の場合は対応 Phase に戻る

---

### Phase 11: 手動テスト

**目的**: guard 機構が実際の開発フローで正しく動作することを人間が確認する。

> 本タスクは NON_VISUAL タスク（UI 変更なし）のため、スクリーンショットは不要。
> 補助成果物 4 ファイルを同一 wave で生成する。

**確認手順**:

1. `git config --unset merge.ours.driver 2>/dev/null || true` で driver 未登録状態にする
2. `merge=ours` 対象ファイル（`indexes/*.json` など）を含むテストブランチを作成・マージする
3. post-merge hook の出力を確認し、警告メッセージが表示されることを確認する（MT-01）
4. `setup-merge-drivers.sh` を実行してから再度マージし、警告が出ないことを確認する（MT-02）
5. `git config --unset merge.ours.driver` 後にセッションを開始し（または `session-init.sh` を直接実行し）、案内メッセージが表示されることを確認する（MT-03）
6. `setup-merge-drivers.sh` 実行後の再テストで idempotent を確認する（MT-04）

**生成する補助成果物（同一 wave）**:

- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/manual-test-checklist.md`
- `outputs/phase-11/discovered-issues.md`
- `outputs/phase-11/phase11-capture-metadata.json`
- `outputs/phase-11/screenshot-plan.json`

---

### Phase 12: ドキュメント更新

**目的**: 実装ガイド・未タスク検出・フィードバックレポートを記録する。

**作成する成果物**:

| 成果物                                          | 内容                                                     |
| ----------------------------------------------- | -------------------------------------------------------- |
| `outputs/phase-12/implementation-guide.md`      | guard 実装の概要・変更ファイル一覧・苦戦箇所の記録       |
| `outputs/phase-12/unassigned-task-detection.md` | 本タスク実施中に発見された未タスクの一覧（0 件でも記録） |
| `outputs/phase-12/skill-feedback-report.md`     | スキルへのフィードバック・改善点（なしでも記録）         |

**記録必須項目（implementation-guide.md）**:

- 変更したファイルのパスと変更概要（追記箇所の前後）
- 採用した設計判断（自動登録 vs. 警告ログ、配置場所）
- `git pull` と post-merge hook の動作検証結果（git version 依存の挙動）
- 苦戦箇所と解決策（セクション 9 を参照）

---

### Phase 13: PR 作成

**目的**: ユーザーの承認を得た後に PR を作成する。

> **重要**: このフェーズはユーザーの明示的な承認なしに実行禁止。

**PR 作成手順**:

1. `git status` で変更ファイルを確認する
2. `pnpm --filter @repo/desktop typecheck` でエラー 0 を最終確認する（コード変更はないため、副作用なし確認）
3. コミットメッセージ案をユーザーに提示し承認を得る
4. `gh pr create` で PR を作成する

**コミットメッセージ案**:

```
feat(git-hooks): merge.ours.driver 未登録検出 guard を post-merge hook に追加
```

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] AC-1: driver 未登録時に post-merge hook が警告または自動登録を実行する
- [ ] AC-2: driver 登録済み時に guard が何も出力しない（idempotent）
- [ ] AC-3: session-init.sh が `(unset)` 検出時に `setup-merge-drivers.sh` 実行案内を表示する
- [ ] AC-4: macOS 環境で AC-1〜AC-3 が PASS する

### ドキュメント要件

- [ ] `outputs/phase-12/implementation-guide.md` が作成されている（実装内容・苦戦箇所を含む）
- [ ] `outputs/phase-12/unassigned-task-detection.md` が作成されている（0 件でも出力）
- [ ] `outputs/phase-12/skill-feedback-report.md` が作成されている

### 品質要件

- [ ] post-merge hook に `merge.ours.driver` チェックが含まれている
- [ ] guard スクリプトが実行権限を持っている（`ls -la` で確認）
- [ ] `setup-merge-drivers.sh` が 2 回実行しても安全（idempotent）
- [ ] `bash -n .husky/_/post-merge` によるシンタックスチェックがエラー 0

---

## 6. 検証方法

### 6.1 driver 未登録状態の再現

```bash
# driver を未登録状態にする
git config --unset merge.ours.driver 2>/dev/null || true

# 未登録を確認
git config --get merge.ours.driver 2>/dev/null || echo "(unset) - 未登録確認"
```

### 6.2 post-merge hook 動作確認

```bash
# テスト用ブランチ作成（merge=ours 対象ファイルを変更）
git checkout -b test/merge-driver-guard
# （indexes/*.json か indexes/*.md にダミー変更を加えてコミット）

# main に戻ってマージ（driver 未登録状態で）
git checkout main
git merge test/merge-driver-guard

# post-merge hook の出力に警告が含まれることを確認（AC-1 PASS の確認）
```

### 6.3 idempotent 確認

```bash
# setup-merge-drivers.sh を実行
bash .claude/scripts/setup-merge-drivers.sh

# driver 登録確認
git config --get merge.ours.driver  # true が返ることを確認

# 再度マージ（警告が出ないことを確認）
# （AC-2 PASS の確認）
```

### 6.4 session-init.sh 確認

```bash
# driver を未登録状態にする
git config --unset merge.ours.driver 2>/dev/null || true

# session-init.sh を直接実行（SessionStart hook 相当）
bash .claude/scripts/session-init.sh 2>&1 | grep -i "ours\|driver\|setup-merge"
# 案内メッセージが表示されることを確認（AC-3 PASS の確認）
```

### 6.5 シンタックスチェック

```bash
# hook スクリプトのシンタックスチェック
bash -n .husky/_/post-merge
echo "exit: $?"  # 0 であることを確認
```

---

## 7. リスクと対策

| リスク                                                                                 | 影響度 | 発生確率 | 対策                                                                                                                                    |
| -------------------------------------------------------------------------------------- | ------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `git pull` では post-merge hook が呼ばれない場合がある（git version / pull 方法 依存） | 中     | 中       | Phase 4 のテストシナリオに `git pull` での動作確認を含め、動作しない場合は session-init.sh を主防衛ラインとして文書化する               |
| 自動登録を選択した場合に CI 環境で意図しない `git config` 変更が発生する               | 中     | 低       | 推奨を「警告ログ + 案内」にし、自動登録はオプションとして明記する。`CI=true` 環境変数を検出して自動登録をスキップするロジックを追加する |
| `.husky/_/post-merge` の既存処理を壊してしまう                                         | 高     | 低       | Phase 1 で現在の内容を完全に把握してから追記する。追記前後で `bash -n .husky/_/post-merge` でシンタックスチェックを実施する             |
| `merge.ours.driver` の検出に使う `git config --get` の終了コードが環境依存である       | 低     | 低       | `git config --get merge.ours.driver 2>/dev/null \|\| echo "(unset)"` のように防御的記述にする                                           |
| `session-init.sh` のパスが想定と異なる場合                                             | 低     | 低       | Phase 1 で `session-init.sh` の実際のパスを確認する。存在しない場合は post-merge hook のみに集中する                                    |
| guard 追加によって `git merge` の実行時間が増加する                                    | 低     | 低       | `git config --get` は高速（<10ms）のため、実用上の影響はほぼなし                                                                        |

---

## 8. 参照情報

| 参照先                                                                                                 | 目的                                                                         |
| ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `docs/30-workflows/gitattributes-merge-union-reeval-001/outputs/phase-11/discovered-issues.md`         | 発見元。DISC-MED-01 の実測ログ（stderr 空の確認）                            |
| `docs/30-workflows/gitattributes-merge-union-reeval-001/outputs/phase-12/unassigned-task-detection.md` | 本タスクの申し送り元。TASK-MERGE-DRIVER-BOOTSTRAP-GUARD-001 の要件定義ソース |
| `.claude/scripts/setup-merge-drivers.sh`                                                               | guard からの案内先スクリプト。冪等性確認対象                                 |
| `.husky/_/post-merge`                                                                                  | post-merge hook の変更対象ファイル                                           |
| `.claude/scripts/session-init.sh`（存在する場合）                                                      | SessionStart hook の改善対象ファイル                                         |
| `docs/30-workflows/unassigned-task/TASK-SKILL-SPEC-NON-VISUAL-RULE-001.md`                             | タスク指示書フォーマットの参照例                                             |

---

## 9. 備考（苦戦箇所【記入必須】）

### 9.1 既知の苦戦箇所（分析から記録）

実施前の時点での予測リスクを記録する。**実施後は各行の「実際の結果」列を更新すること**
（Phase 12 の `skill-feedback-report.md` へ転記できる粒度で記載する）。

| 苦戦箇所                                                                  | 原因                                                                                                                                                                             | 対応策（予測）                                                                                                                                    | 実際の結果（実施後に記入） |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `merge=ours` はカスタム driver であることの発見（組み込み戦略との混同）   | `.gitattributes` の `merge=ours` は Git 組み込みの `ours` マージ戦略とは別物であり、`merge.ours.driver = true` の登録が別途必要。Git 2.38 系は未登録時に stderr に何も出力しない | Phase 1 で DISC-MED-01 の実測ログ（stderr が空）を確認し、「stderr 監視では検知不可」という事実を前提に guard 設計を行う                          | （実施後に記入）           |
| `git pull` での post-merge hook 動作保証                                  | `git pull` は内部で `git merge` を実行するが、post-merge hook が呼ばれるかどうかは git version と pull 方法（rebase vs. merge）に依存する                                        | Phase 4 のテストシナリオに `git pull` での動作確認を含め、動作しない場合は session-init.sh を主防衛ラインとして文書化する                         | （実施後に記入）           |
| bootstrap guard の設計判断（post-merge vs. session-start の配置先の二択） | post-merge hook はマージ直後の即時警告に適しているが、`git pull --rebase` ではトリガーされない。session-start hook は遅延検知だが確実にトリガーされる                            | 両方に配置する（post-merge での即時警告 + session-init.sh での補完）という設計を Phase 2 で明示し、Phase 3 レビューゲートで確認する               | （実施後に記入）           |
| 自動登録と警告ログのトレードオフ判断                                      | hook が自動的に `git config` を書き換えることは副作用（CI 環境での意図しない設定変更）のリスクがある。一方、警告のみでは開発者が無視する可能性がある                             | 推奨を「警告ログ + `setup-merge-drivers.sh` 実行案内」にし、自動登録はオプションとして Phase 2 で設計する。`CI=true` 環境変数による分岐も検討する | （実施後に記入）           |
| `.husky/_/post-merge` の既存内容との干渉                                  | `.husky/_/post-merge` は現在 `#!/usr/bin/env sh` と `. "$(dirname "$0")/h"` の 2 行のみ。追記する driver チェックが husky の実行フレームワーク（`h`）と干渉しないか確認が必要    | Phase 1 で `.husky/_/post-merge` の内容を確認し、`h` が何をするかを把握してから追記位置を決定する。`bash -n` でシンタックスチェックを実施する     | （実施後に記入）           |

### 9.2 背景コンテキスト（将来実装者へ）

- 本タスクの直接の動機は TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001 Phase 11 の DISC-MED-01 である。
  実測により「Git 2.38 系（Darwin）では `merge.ours.driver` 未登録時に stderr が**空**」であることが確認された。
  これは `failed to resolve 'ours'` などの警告が出るという一般的な期待と異なる。
  **「stderr 監視では driver 未登録を検知できない」**という事実を前提に guard を設計すること。

- `merge=ours` の正体について: `.gitattributes` の `merge=ours` は Git 組み込みの `ours` マージ戦略（`git merge -s ours`）とは**別物**である。`merge=ours` はカスタムドライバー名であり、`git config merge.ours.driver true` で登録することで「マージ時に現ブランチ側を採用する」ドライバーとして機能する。未登録の場合は default 3-way にフォールバックする。

- `session-init.sh` には既存の `(unset)` 検出ロジックがある（TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001 の設計で言及）。本タスクでは「案内メッセージの具体化」として session-init.sh を改善するが、session-init.sh の根本的な再設計は本タスクのスコープ外である。

- `.husky/_/post-merge` の現在の実装（`#!/usr/bin/env sh` + `. "$(dirname "$0")/h"` の 2 行のみ）は非常にシンプルである。追記する driver チェックは `h` のソース後に記述すること。

- `git config --get merge.ours.driver` は driver が未登録の場合に**終了コード 1** を返す。`set -e` 環境の hook 内でそのまま実行するとシェル全体が終了する可能性がある。`2>/dev/null || echo "(unset)"` のような防御的記述を必ず使うこと。

- **100人中100人が同じ理解で実行できる**ために特に重要なポイント:
  1. Phase 1 で `.husky/_/post-merge` と `session-init.sh` の現状を読んでから設計する（内容を確認せずに追記すると既存ロジックと干渉する）
  2. `git config --get merge.ours.driver` の終了コード 1（未登録時）が `set -e` 環境で hook 全体を失敗させる可能性がある。`2>/dev/null || echo "(unset)"` または `|| true` を適切に使うこと
  3. guard スクリプトは driver 登録済みの場合に**何も出力しない**こと（idempotent の原則）
  4. Phase 13 はユーザーの承認なしに絶対に実行しない
