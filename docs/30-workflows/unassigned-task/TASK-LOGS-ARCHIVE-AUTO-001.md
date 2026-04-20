# LOGS.md アーカイブ自動化スクリプト実装 - タスク指示書

## メタ情報

```yaml
issue_number: 2337
task_id: TASK-LOGS-ARCHIVE-AUTO-001
task_name: LOGS.md アーカイブ自動化スクリプト実装
category: 機能実装
target_feature: スキル管理 / LOGS.md 自動アーカイブ
priority: 低
scale: 中規模
status: 未実施
source_phase: Phase 12
created_date: 2026-04-19
```

## メタ情報

| 項目         | 内容                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| タスクID     | TASK-LOGS-ARCHIVE-AUTO-001                                                  |
| タスク名     | LOGS.md アーカイブ自動化スクリプト実装                                      |
| 分類         | 機能実装                                                                    |
| 対象機能     | スキル管理 / LOGS.md 自動アーカイブ                                         |
| 優先度       | 低                                                                          |
| 見積もり規模 | 中規模                                                                      |
| ステータス   | 未実施                                                                      |
| 発見元       | TASK-LOGS-ARCHIVE-POLICY-001 Phase 12 unassigned-task-detection.md (UT-002) |
| 発見日       | 2026-04-19                                                                  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-LOGS-ARCHIVE-POLICY-001` において、`.claude/skills/*/LOGS.md` および `.agents/skills/*/LOGS.md` に対するアーカイブポリシーが文書化された（Issue #2282）。ポリシーの内容は以下の OR 条件でアーカイブ対象とするハイブリッド方式である。

- 行数: 300 行超
- バイトサイズ: 30 KB 超（30720 バイト）
- 期間: 月次（毎月初第 1 営業日に前月分を評価）

Phase 1 計測では `skill-creator`（2542 行 / 123 KB）、`aiworkflow-requirements`（2908 行 / 571 KB）、`task-specification-creator`（3158 行 / 234 KB）が複数閾値を同時に超過しており、ポリシーの必要性は既に実証済みである。

しかしこのポリシーは文書化されたのみで、閾値判定・アーカイブ実行・mirror sync の各ステップは全て手動運用のままである。

### 1.2 問題点・課題

**問題1: 月次判定の実行忘れリスク**

毎月初第 1 営業日という定期タイミングでの実行は、属人的な記憶と手順書の参照に依存している。担当者の休暇・交代・多忙が重なると判定が翌月にスリップし、閾値超過のままログが肥大化し続ける。

**問題2: 手動アーカイブ運用の属人化**

アーカイブ手順（6 ステップ）は文書化されているが、誰が実行するかの担当割り当てが曖昧である。特に `aiworkflow-requirements` は 571 KB / 2908 行という規模であり、手動対応コストが高い。legacy 表記（月名英語スペル形式・トピック拡張形式・index/legacy ファイル）が混在する状況での手作業は誤操作リスクが高い。

**問題3: mirror sync の検証が手動**

`.claude/skills/*/` と `.agents/skills/*/` の両側に同等の変更を反映するミラー sync は、現在コマンドを手動実行して `diff` ゼロを確認する方式である。自動化なしでは sync 漏れが検出されないまま放置されるリスクがある。

### 1.3 放置した場合の影響

- `aiworkflow-requirements`（571 KB）・`task-specification-creator`（234 KB）などのファイルが継続肥大化し、AI モデルのコンテキストウィンドウを圧迫する
- 手動アーカイブの担当者が不在の月に閾値超過が累積し、1 回のアーカイブ作業コストが増大する
- legacy 表記との共存ルール（F-001）の理解が担当者によって異なり、命名規則違反が発生する
- `.claude/` と `.agents/` の diff が蓄積し、mirror sync の修正コストが増大する
- エスカレーションフロー（F-005）の「アーカイブ未実施」違反が月を重ねるごとに連鎖する

---

## 2. 何を達成するか（What）

### 2.1 目的

bash または Python スクリプトによって、`TASK-LOGS-ARCHIVE-POLICY-001` で定義したアーカイブポリシーの閾値判定・実行・mirror sync・検証を自動化する。CI（GitHub Actions）への統合オプションを提供し、月次アーカイブの実行忘れリスクをゼロにする。

### 2.2 最終ゴール

1. スクリプト単体実行で `.claude/skills/*/LOGS.md` と `.agents/skills/*/LOGS.md` の両方を閾値評価できること
2. dry-run モードで「対象スキル一覧と閾値超過理由」が出力できること
3. 実行モードでアーカイブ・LOGS.md 軽量化・mirror sync・diff ゼロ確認が一括実行できること
4. GitHub Actions のスケジュールジョブ（毎月 1 日）としてトリガーできること
5. 実行ログ（実行日時・対象スキル・閾値超過理由・アーカイブファイルパス）が記録されること

### 2.3 スコープ

**含むもの**:

- アーカイブ判定スクリプト（行数・サイズ・月次 OR 条件）
- dry-run モード（判定結果のみ出力・ファイル変更なし）
- アーカイブ実行モード（`references/logs-archive-YYYY-MM.md` 作成・LOGS.md 軽量化）
- mirror sync 実行と diff ゼロ検証
- 実行ログ出力（標準出力 + オプションでファイルに保存）
- GitHub Actions ワークフローファイル（スケジュールトリガー）
- legacy 表記（F-001 対応）との共存設計（既存 legacy ファイルへの誤操作ガード）

**含まないもの**:

- `docs/**/LOGS.md` の自動アーカイブ（ポリシー適用外）
- `.worktrees/**/LOGS.md` の操作（worktree 廃棄時削除のため除外）
- アーカイブポリシーの閾値変更（`logs-archive-policy.md` の改定）
- GUI・Web UI の提供
- 個人作業用テンポラリログの自動整理

### 2.4 成果物

| 成果物                                                        | 種別 | 内容                                    |
| ------------------------------------------------------------- | ---- | --------------------------------------- |
| `scripts/logs-archive.sh`（または `scripts/logs_archive.py`） | 新規 | アーカイブ自動化スクリプト本体          |
| `.github/workflows/logs-archive.yml`                          | 新規 | GitHub Actions スケジュールワークフロー |
| `scripts/README-logs-archive.md`（オプション）                | 新規 | スクリプト使用方法・オプション説明      |
| `docs/30-workflows/TASK-LOGS-ARCHIVE-AUTO-001/index.md`       | 新規 | タスクインデックス                      |

---

## 3. どのように実装するか（How）

### 3.1 前提条件

- `TASK-LOGS-ARCHIVE-POLICY-001` の成果物（`.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md`）が存在すること
- `.claude/skills/*/LOGS.md` および `.agents/skills/*/LOGS.md` が所定の位置に存在すること
- `bash` 4.x 以上、または Python 3.9 以上が実行環境に存在すること
- GitHub Actions を使用する場合は `GITHUB_TOKEN` のリポジトリ書き込み権限が付与されていること
- TASK-CONFLICT-PREVENT-001 の mirror sync 機構（自動対応可否）を事前に確認すること

### 3.2 依存タスク

| タスクID                     | 関係     | 理由                                                                           |
| ---------------------------- | -------- | ------------------------------------------------------------------------------ |
| TASK-LOGS-ARCHIVE-POLICY-001 | 前提     | アーカイブポリシー（閾値・パス規則・手順）の定義元。スクリプトはこれを実装する |
| TASK-CONFLICT-PREVENT-001    | 参照のみ | mirror sync 機構の自動対応可否を確認するための参照元                           |

### 3.3 必要な知識

- bash の `wc -l` / `wc -c` による行数・バイト数取得
- bash の glob パターン（`*.claude/skills/*/LOGS.md`）でのファイル列挙
- `git diff` を使ったアーカイブ前後の差分確認
- GitHub Actions の `schedule` トリガー（cron 記法）
- LOGS.md のエントリ日付パターン（前月分の抽出ロジックに必要）
- legacy 表記（F-001）の種類と残置ルール（スクリプトが誤操作しないガード設計）
- `.claude/` と `.agents/` の mirror 構造（同一 skill 名・同一パス）

### 3.4 推奨アプローチ

**dry-run 優先設計**: スクリプトのデフォルト動作は dry-run とし、`--execute` フラグを明示しない限りファイルへの書き込みを行わない。誤操作のリスクを最小化する。

**legacy ガード内蔵**: `references/` 配下に既存の legacy ファイルがある場合、それらには一切手を触れない。新規アーカイブファイルの命名は必ず `logs-archive-YYYY-MM.md`（YYYY-MM 数値形式）とし、legacy 形式で作成しない。

**ログ出力の二重化**: 標準出力とオプションのログファイル（`logs-archive-run-YYYY-MM-DD.log`）の両方に実行ログを出力する。CI 環境ではアーティファクトとして保存できるようにする。

**mirror sync の段階的自動化**: TASK-CONFLICT-PREVENT-001 の自動 sync が有効な場合はそれを呼び出す。無効な場合はスクリプト内で `cp` ベースの手動 sync を実行し、最後に `diff` ゼロ確認を行う。

---

## 4. 実行手順（Phase 構成）

### Phase 1: 現状調査・要件整理

**目的**: スクリプト実装に必要な情報を収集し、設計の前提を確定する。

**手順**:

1. `logs-archive-policy.md` を精読し、閾値条件・パス規則・アーカイブ手順（6 ステップ）を再確認する
2. `.claude/skills/` 以下の全 LOGS.md の行数・サイズを計測し、現在の超過状況を記録する
3. `.agents/skills/` 以下の全 LOGS.md の行数・サイズを計測し、`.claude/` 側との構造が一致していることを確認する
4. `references/` 配下の legacy アーカイブファイル一覧を取得し、F-001 で保護すべきファイル名パターンを洗い出す
5. TASK-CONFLICT-PREVENT-001 の成果物を参照し、mirror sync の自動対応可否を確認する
6. スクリプト言語（bash / Python）の選定を行う（CI 互換性・保守性を根拠に判断する）

**成果物**: 設計前提メモ（インラインコメントで可）

**完了条件**: 全 6 点の調査が完了し、設計の前提が確定していること

---

### Phase 2: スクリプト設計（インターフェース定義）

**目的**: スクリプトのコマンドラインインターフェースとデータフローを設計する。

**手順**:

1. コマンドラインオプションを定義する
   - `--dry-run`（デフォルト）: 判定のみ、ファイル変更なし
   - `--execute`: 実際にアーカイブを実行する
   - `--skill <skill-name>`: 特定 skill のみ対象（省略時は全 skill）
   - `--log-file <path>`: 実行ログをファイルに保存
   - `--no-mirror`: mirror sync をスキップ（デバッグ用）
2. 出力フォーマットを設計する
   - 判定結果テーブル（skill 名 / 行数 / サイズ / 超過理由 / 実行予定アクション）
   - 実行ログ（タイムスタンプ / skill 名 / アーカイブ先パス / diff ゼロ確認結果）
3. エラー処理方針を定義する（途中失敗時のロールバック設計）
4. スクリプトの配置先パスを確定する（`scripts/` または `tools/`）

**成果物**: インターフェース設計メモ（コメント形式で可）

**完了条件**: オプション・出力フォーマット・エラー処理方針が確定していること

---

### Phase 3: 閾値判定ロジック実装

**目的**: 300 行超・30 KB 超・月次 OR 条件の判定ロジックを実装する。

**手順**:

1. 全 LOGS.md の列挙処理を実装する
   - `.claude/skills/*/LOGS.md` と `.agents/skills/*/LOGS.md` の glob 展開
   - 存在しない skill ディレクトリを graceful にスキップする処理
2. 行数判定を実装する（`wc -l` / Python の `len(lines)`）
3. サイズ判定を実装する（`wc -c` / Python の `os.path.getsize()`）
4. 月次判定を実装する
   - 最終アーカイブ日（`references/logs-archive-*.md` の最新ファイル名から YYYY-MM を抽出）と現在月を比較
   - 最終アーカイブが存在しない場合は「未アーカイブ」として月次判定対象とする
5. OR 条件の統合ロジックを実装し、超過理由を配列で保持する
6. dry-run 出力フォーマットに従って判定結果テーブルを標準出力する

**成果物**: スクリプト（判定ロジック部分）

**完了条件**: dry-run 実行で全 skill の判定結果テーブルが正しく出力されること

---

### Phase 4: アーカイブ実行ロジック実装

**目的**: 閾値超過 skill に対するアーカイブ実行・LOGS.md 軽量化処理を実装する。

**手順**:

1. アーカイブ先パスの生成処理を実装する（`references/logs-archive-YYYY-MM.md`）
2. 前月分エントリの抽出ロジックを実装する
   - LOGS.md 内の日付パターン（`YYYY-MM-DD` 形式の行）を基準に前月範囲を特定
   - 日付パターンが存在しない場合のフォールバック処理（全エントリを対象）
3. アーカイブファイルへの追記処理を実装する
   - `references/` 配下に `logs-archive-YYYY-MM.md` が既存の場合は末尾追記
   - 新規作成の場合はヘッダー（`# LOGS Archive YYYY-MM`）を付与
4. LOGS.md から移動済みエントリを削除する処理を実装する
5. `git diff` を使って削除範囲が抽出範囲と一致することを確認する処理を実装する
6. legacy ファイルへの誤操作ガードを実装する
   - `references/` 配下の既存ファイルが legacy 形式（月名英語・トピック拡張・index/legacy）の場合は操作対象外とする

**成果物**: スクリプト（アーカイブ実行ロジック部分）

**完了条件**: テスト用の LOGS.md（300 行超）に対してアーカイブが正しく実行され、LOGS.md が軽量化されること

---

### Phase 5: mirror sync・検証ロジック実装

**目的**: `.claude/` 側の変更を `.agents/` 側に反映し、diff ゼロを検証する処理を実装する。

**手順**:

1. TASK-CONFLICT-PREVENT-001 の自動 sync 機構の呼び出し可否を確認し、分岐を実装する
   - 自動 sync が利用可能な場合: sync コマンドを呼び出す
   - 利用不可の場合: `cp` ベースの手動 sync ロジックを実装する
2. mirror sync 後の diff ゼロ確認を実装する
   - `diff .claude/skills/<skill>/references/logs-archive-YYYY-MM.md .agents/skills/<skill>/references/logs-archive-YYYY-MM.md`
   - `diff .claude/skills/<skill>/LOGS.md .agents/skills/<skill>/LOGS.md`
3. diff ゼロ確認に失敗した場合の警告出力と終了コードの設定を実装する
4. `--no-mirror` フラグで mirror sync をスキップできることを確認する

**成果物**: スクリプト（mirror sync・検証ロジック部分）

**完了条件**: `.claude/` と `.agents/` の両側で diff ゼロが確認できること

---

### Phase 6: テスト実装

**目的**: スクリプトの動作を検証するテストを実装する。

**手順**:

1. テスト用フィクスチャを準備する
   - 300 行超のダミー LOGS.md（行数閾値超過テスト用）
   - 30 KB 超のダミー LOGS.md（サイズ閾値超過テスト用）
   - 前月アーカイブが存在しないダミー構造（月次閾値テスト用）
   - legacy ファイルが `references/` に混在するダミー構造（F-001 誤操作ガードテスト用）
2. dry-run モードのテストを実装する（ファイル変更がないことの確認）
3. アーカイブ実行モードのテストを実装する
   - アーカイブファイルが正しく作成されること
   - LOGS.md が軽量化されること
   - legacy ファイルが変更されていないこと
4. mirror sync テストを実装する（diff ゼロ確認）
5. エラーケーステストを実装する（存在しない skill 指定・権限エラー等）

**成果物**: テストスクリプト（`scripts/tests/test-logs-archive.sh` 等）

**完了条件**: 全テストケースが PASS すること

---

### Phase 7: GitHub Actions ワークフロー実装

**目的**: 月次スケジュールで自動実行される GitHub Actions ワークフローを実装する。

**手順**:

1. `.github/workflows/logs-archive.yml` を作成する
   - `schedule` トリガー: `cron: '0 0 1 * *'`（毎月 1 日 0:00 UTC）
   - `workflow_dispatch` トリガー: 手動実行を可能にする
2. ジョブを定義する
   - チェックアウト（`actions/checkout@v4`）
   - 閾値評価（dry-run）
   - 閾値超過スキルが存在する場合のみアーカイブ実行（`--execute`）
   - 変更があれば自動コミット・PR 作成（`gh pr create`）
3. 実行ログをアーティファクトとして保存する処理を追加する
4. 判定結果・実行結果を GitHub Actions の step summary に出力する処理を追加する
5. `GITHUB_TOKEN` の権限設定（`contents: write`, `pull-requests: write`）を確認する

**成果物**: `.github/workflows/logs-archive.yml`

**完了条件**: ワークフローが手動トリガー（`workflow_dispatch`）で正常実行されること

---

### Phase 8: リファクタリング

**目的**: スクリプトのコード品質を向上させる。

**手順**:

1. 関数分割を見直す（閾値判定・アーカイブ実行・mirror sync・ログ出力を独立した関数に分離）
2. 定数定義を集約する（閾値値・パスパターン・ファイル名パターンを先頭に集約）
3. コメントを整備する（各関数の役割・引数・返り値を記述）
4. エラーメッセージの国際化対応を検討する（日本語・英語の切り替え）
5. シェルスクリプトの場合は `shellcheck` によるリント、Python の場合は `flake8`/`ruff` によるリントを実行する

**成果物**: リファクタリング済みスクリプト

**完了条件**: リントエラーがゼロであること、関数の役割が明確に分離されていること

---

### Phase 9: 品質保証・セキュリティ確認

**目的**: スクリプトの品質・セキュリティを確認する。

**手順**:

1. スクリプトが `--dry-run` デフォルトで意図しないファイル変更を行わないことを確認する
2. legacy ファイルへの誤操作が発生しないことを確認する（F-001 保護）
3. `--execute` フラグなしで実行した場合に誤ってアーカイブが実行されないことを確認する
4. GitHub Actions での権限（`GITHUB_TOKEN` スコープ）が最小権限になっていることを確認する
5. スクリプトの実行ログに機密情報（API キー等）が含まれないことを確認する

**成果物**: 品質確認チェックリスト

**完了条件**: 全チェック項目が PASS すること

---

### Phase 10: 最終レビュー

**目的**: 本タスクの完了条件をすべて確認する。

**手順**:

1. スクリプトが `.claude/skills/*/LOGS.md` と `.agents/skills/*/LOGS.md` の両方を対象として動作することを確認する
2. dry-run モードで「対象スキル一覧と閾値超過理由」が出力されることを確認する
3. 実行モードでアーカイブ・LOGS.md 軽量化・mirror sync・diff ゼロ確認が一括実行されることを確認する
4. GitHub Actions のスケジュールジョブ（毎月 1 日）としてトリガーできることを確認する
5. 実行ログが記録されることを確認する
6. 上記 5 点がすべて PASS の場合、最終レビュー PASS とする。FAIL があれば該当 Phase に差し戻す

**成果物**: 最終レビュー結果メモ

**完了条件**: 5 点すべての確認が PASS

---

### Phase 11: 手動確認

**目的**: `NON_VISUAL code task` として、スクリプトの存在と動作を確認する代替証跡を記録する。

**手順**:

以下のコマンドを実行し、各成果物が存在することを確認する:

```bash
# スクリプトの存在確認
ls -la scripts/logs-archive.sh  # または scripts/logs_archive.py

# GitHub Actions ワークフローの存在確認
ls -la .github/workflows/logs-archive.yml

# dry-run 実行による動作確認
bash scripts/logs-archive.sh --dry-run

# スクリプトのリント確認（bash の場合）
shellcheck scripts/logs-archive.sh

# テストの実行
bash scripts/tests/test-logs-archive.sh

# アーカイブポリシーとの整合確認
grep -n "300\|30720\|monthly\|月次" scripts/logs-archive.sh
```

各コマンドに結果（行番号・マッチ内容）が表示されることを以て手動確認の証跡とする。

**成果物**: 手動確認結果（コマンド出力スナップショット。本タスクの `outputs/phase-11/` に記録することが望ましい）

**完了条件**: 全コマンドに期待通りの結果が存在すること

---

### Phase 12: ドキュメント更新

**目的**: 本タスクの Phase 12 クローズアウトを行う。

> **中学生レベル説明**: Phase 12 は「このタスクで作ったものを記録して、次の人にバトンを渡す」フェーズです。工事が終わった後に「何を作って、どんな問題があったか」を工事日誌に書き留める作業に相当します。自動化スクリプトを作ったこと・どんな工夫をしたか・どこで詰まったかを LOGS ファイルや仕様書に残しておくことで、次に同じ作業をする人（または未来の自分）が「なぜこうなっているのか」をすぐに理解できるようになります。

**手順**:

1. 本仕様書（`TASK-LOGS-ARCHIVE-AUTO-001.md`）の「ステータス」を「未実施」→「実施済み」に更新する
2. `.claude/skills/aiworkflow-requirements/LOGS.md` に本タスクの実施記録を追記する
3. `.agents/skills/aiworkflow-requirements/LOGS.md` に同様の記録を追記する（mirror sync）
4. `aiworkflow-requirements/references/logs-archive-policy.md` の「関連タスク」セクションに `TASK-LOGS-ARCHIVE-AUTO-001` のエントリを追記する
5. `.claude/skills/aiworkflow-requirements/indexes/` 以下の各インデックスファイル（`topic-map.md` / `quick-reference.md` / `resource-map.md`）を確認し、内容変更がある場合のみ再生成する

**成果物**: 本仕様書（更新後）、LOGS.md（追記後）

**完了条件**: ステータスが「実施済み」に更新されていること

---

### Phase 13: PR 作成（ユーザー承認後）

**目的**: ユーザーの明示的承認を得た後に、変更を PR として提出する。

**手順**（ユーザー承認後に実施）:

```bash
# ブランチ作成
git checkout -b feat/logs-archive-auto-TASK-LOGS-ARCHIVE-AUTO-001

# 変更ファイルの確認
git status

# コミット
git commit -m "feat(logs-archive): TASK-LOGS-ARCHIVE-AUTO-001 LOGS.md アーカイブ自動化スクリプト実装"

# push
git push -u origin feat/logs-archive-auto-TASK-LOGS-ARCHIVE-AUTO-001

# PR 作成
gh pr create \
  --title "feat(logs-archive): TASK-LOGS-ARCHIVE-AUTO-001 LOGS.md アーカイブ自動化スクリプト実装" \
  --body "..."
```

**完了条件**: ユーザーの承認があるまで blocked。Phase 13 は実施しない。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] スクリプト単体実行で `.claude/skills/*/LOGS.md` と `.agents/skills/*/LOGS.md` の両方を閾値評価できる
- [ ] dry-run モードで「対象スキル一覧と閾値超過理由（行数超過・サイズ超過・月次）」が出力できる
- [ ] 実行モードでアーカイブファイル（`references/logs-archive-YYYY-MM.md`）が正しく作成される
- [ ] LOGS.md から移動済みエントリが削除され、軽量化されている
- [ ] mirror sync が実行され、`.claude/` と `.agents/` の diff がゼロであることが確認できる
- [ ] GitHub Actions のスケジュールジョブ（毎月 1 日）としてトリガーできる
- [ ] 実行ログ（実行日時・対象スキル・閾値超過理由・アーカイブファイルパス）が記録される
- [ ] legacy ファイル（F-001 対応）への誤操作が発生しない

### 品質要件

- [ ] `--dry-run` がデフォルト動作であり、明示的な `--execute` フラグなしでファイル変更が行われない
- [ ] リントエラー（shellcheck / flake8 / ruff）がゼロである
- [ ] テストスクリプトの全ケースが PASS する
- [ ] Phase 11 の手動確認コマンドが全件期待結果を返す
- [ ] スクリプトの実行ログに機密情報が含まれない

### ドキュメント要件

- [ ] 本タスク仕様書（`TASK-LOGS-ARCHIVE-AUTO-001.md`）のステータスが「実施済み」に更新されている
- [ ] `.claude/skills/aiworkflow-requirements/LOGS.md` に本タスクの実施記録が追記されている

---

## 6. 検証方法

### 確認コマンド

```bash
# スクリプトの存在確認
ls -la scripts/logs-archive.sh

# dry-run による全 skill 判定結果確認
bash scripts/logs-archive.sh --dry-run

# 特定 skill に対する dry-run 確認
bash scripts/logs-archive.sh --dry-run --skill aiworkflow-requirements

# アーカイブ実行（テスト環境のみ）
bash scripts/logs-archive.sh --execute --skill aiworkflow-requirements --log-file /tmp/archive-test.log

# mirror sync 後の diff 確認
diff .claude/skills/aiworkflow-requirements/LOGS.md \
     .agents/skills/aiworkflow-requirements/LOGS.md

# アーカイブファイルの存在確認
ls .claude/skills/aiworkflow-requirements/references/logs-archive-*.md

# legacy ファイルが変更されていないことの確認
git diff .claude/skills/aiworkflow-requirements/references/logs-archive-2026-feb.md
git diff .claude/skills/aiworkflow-requirements/references/logs-archive-2026-march.md
```

### 確認観点

| 確認ID | 対象                | 期待結果                                          |
| ------ | ------------------- | ------------------------------------------------- |
| AC-01  | dry-run 出力        | 全 skill の判定結果テーブルが出力される           |
| AC-02  | アーカイブファイル  | `references/logs-archive-YYYY-MM.md` が作成される |
| AC-03  | LOGS.md 軽量化      | 移動済みエントリが削除され 300 行以下になる       |
| AC-04  | mirror sync diff    | `.claude/` と `.agents/` の diff がゼロ           |
| AC-05  | legacy ファイル保護 | F-001 対象ファイルに変更が発生しない              |
| AC-06  | GitHub Actions      | `workflow_dispatch` で正常実行される              |

---

## 7. リスクと対策

| リスク                                                                     | 影響度 | 発生確率 | 対策                                                                                      |
| -------------------------------------------------------------------------- | ------ | -------- | ----------------------------------------------------------------------------------------- |
| legacy ファイルを誤って上書き・削除する                                    | 高     | 中       | F-001 ガードロジックを実装し、legacy パターンにマッチするファイルは読み取り専用として扱う |
| LOGS.md のエントリ日付形式が skill 間で統一されておらず抽出が失敗する      | 中     | 中       | Phase 1 で全 skill の日付形式を調査し、パターンマッチングのフォールバックを実装する       |
| mirror sync（TASK-CONFLICT-PREVENT-001）が利用不可の場合の手動コストが高い | 中     | 低       | `--no-mirror` オプションと手動 sync の `diff` 確認手順をドキュメントに明記する            |
| GitHub Actions の自動コミットが他の PR と競合する                          | 中     | 低       | スケジュール実行前に変更がある場合は PR 作成をスキップし、警告を出力する設計とする        |
| 月次判定の「最終アーカイブ日」の抽出が legacy ファイル名で誤動作する       | 低     | 中       | YYYY-MM 数値形式のファイルのみを月次判定の基準とし、legacy 形式は判定から除外する         |

---

## 8. 参照情報

### 関連ドキュメント

| 資料名                             | パス                                                                                      | 説明                                                               |
| ---------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| LOGS.md アーカイブポリシー（正本） | `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md`                | 閾値・パス規則・アーカイブ手順の定義元。スクリプトはこれを実装する |
| TASK-LOGS-ARCHIVE-POLICY-001       | `docs/30-workflows/logs-archive-policy-001/`                                              | ポリシー策定タスクのワーキングディレクトリ                         |
| unassigned-task-detection          | `docs/30-workflows/logs-archive-policy-001/outputs/phase-12/unassigned-task-detection.md` | 本タスクの発見元（UT-002）                                         |
| TASK-CONFLICT-PREVENT-001          | 要確認（mirror sync 機構の詳細）                                                          | mirror sync の自動対応可否を確認するための参照元                   |

### 関連ファイル（更新・作成対象）

| ファイル                                         | 変更種別 | 内容                                             |
| ------------------------------------------------ | -------- | ------------------------------------------------ |
| `scripts/logs-archive.sh`（または `.py`）        | 新規     | アーカイブ自動化スクリプト本体                   |
| `.github/workflows/logs-archive.yml`             | 新規     | GitHub Actions スケジュールワークフロー          |
| `.claude/skills/aiworkflow-requirements/LOGS.md` | 追記     | 本タスク実施記録の追記                           |
| `.agents/skills/aiworkflow-requirements/LOGS.md` | 追記     | mirror sync（同上）                              |
| `references/logs-archive-policy.md`              | 追記     | 「関連タスク」セクションへの本タスクエントリ追記 |

---

## 9. 備考

### 苦戦箇所【TASK-LOGS-ARCHIVE-POLICY-001 での経験】

| 苦戦箇所                                 | 症状                                                                                                                                                                                      | 原因                                                                                                                                                                                                 | 対応                                                                                                                                                                                   | 再発防止                                                                                                                                                                                                |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 手動アーカイブ運用の属人化               | 毎月初第 1 営業日の判定が特定担当者の記憶に依存しており、休暇・交代・多忙が重なると翌月にスリップした。複数 skill が同時に閾値超過している場合の優先順位が不明確で、対応漏れが発生した    | アーカイブ手順書（6 ステップ）は存在するが、「誰が・いつ・どの skill を対象に」実行するかの割り当てが文書化されていなかった。手順の実行主体が暗黙的に個人に依存していた                              | 本タスクでスクリプトによる自動化を実装し、月次スケジュールを GitHub Actions に移管する。手動判定に依存しない仕組みを設計する                                                           | GitHub Actions の `schedule` トリガーで「毎月 1 日に全 skill の判定を自動実行」する設計とし、担当者への依存を排除する。手動実行は `workflow_dispatch` で補完する                                        |
| legacy 表記との共存（F-001: 残置ルール） | `aiworkflow-requirements/references/` に 30 件超の legacy アーカイブファイル（月名英語・トピック拡張形式・index/legacy）が存在しており、新規アーカイブファイルの命名規則と混在していた    | 過去の legacy ファイルがリネーム禁止として保護されているため、`logs-archive-*.md` のワイルドカード検索で legacy 形式と新形式が混在してヒットし、「最終アーカイブ日」の判定が誤動作するリスクがあった | ポリシー（F-001）で legacy ファイルを明示的に「残置・リネーム禁止」とし、新規ファイルは必ず YYYY-MM 数値形式で作成するルールを確定した。検索は両形式を捕捉するワイルドカード運用とした | スクリプトの月次判定ロジックでは YYYY-MM 数値形式のファイルのみを基準とし、legacy 形式を判定から除外するフィルタリングを実装する。legacy ファイルへの書き込みを明示的に禁止するガードロジックを追加する |
| mirror sync 検証の重要性                 | `.claude/` 側のアーカイブ操作後に `.agents/` 側への同期を失念し、両ディレクトリ間に差分が発生した。`diff` による確認を手動で実施していたため、一部の skill で sync 漏れが後から発見された | mirror sync の手順（アーカイブ手順 Step 5）はポリシーに記載されているが、`diff` 確認（Step 6）を実行するタイミングが不明確で、アーカイブ実行直後ではなく後続作業の中で確認するケースがあった         | ポリシーの Step 5-6 を「アーカイブ実行と同一セッションで必ず実施する」として明確化し、`diff` 確認の結果を証跡として記録する手順を追加した                                              | スクリプトでアーカイブ実行（`--execute`）と mirror sync を不可分な処理として実装する。`diff` ゼロ確認に失敗した場合はスクリプトが非ゼロの終了コードで終了し、CI が失敗として検出する                    |

### 発見経緯

`TASK-LOGS-ARCHIVE-POLICY-001` の Phase 12 において、`outputs/phase-12/unassigned-task-detection.md` の「UT-002」として「アーカイブ判定・実行の自動化」が未実施タスクとして検出された。ポリシー策定タスクでは閾値と手順の文書化を完了したが、スクリプト実装は明示的にスコープ外として扱われていた。2026-04-19 に本タスクとして formalize した。
