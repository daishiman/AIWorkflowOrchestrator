# LOGS.md アーカイブポリシー CI 検証スクリプト統合 - タスク指示書

## メタ情報

```yaml
issue_number: 2339
task_id: TASK-LOGS-ARCHIVE-CI-VALIDATE-001
task_name: LOGS.md アーカイブポリシー CI 検証スクリプト統合
category: CI/CD整備
target_feature: CI / LOGS.md 自動検証
priority: 低
scale: 小規模
status: 未実施
source_phase: Phase 12
created_date: 2026-04-19
```

## メタ情報

| 項目         | 内容                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| タスクID     | TASK-LOGS-ARCHIVE-CI-VALIDATE-001                                           |
| タスク名     | LOGS.md アーカイブポリシー CI 検証スクリプト統合                            |
| 分類         | CI/CD整備                                                                   |
| 対象機能     | CI / LOGS.md 自動検証                                                       |
| 優先度       | 低                                                                          |
| 見積もり規模 | 小規模                                                                      |
| ステータス   | 未実施                                                                      |
| 発見元       | TASK-LOGS-ARCHIVE-POLICY-001 Phase 12 unassigned-task-detection.md (UT-003) |
| 発見日       | 2026-04-19                                                                  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-LOGS-ARCHIVE-POLICY-001` にて、LOGS.md のアーカイブポリシーが確定した（`.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md` 参照）。ポリシーでは以下の閾値が定められている。

- **行数閾値**: 300 行超
- **バイトサイズ閾値**: 30 KB 超（30720 バイト）
- **対象**: `.claude/skills/*/LOGS.md` および `.agents/skills/*/LOGS.md`

しかし現時点では、アーカイブポリシーに違反した状態（閾値超過のまま放置）を **PR マージ前に自動検知する仕組みが存在しない**。違反の検知は担当者の手動確認に依存しており、見落としが発生しやすい状況にある。

`TASK-LOGS-ARCHIVE-POLICY-001` の Phase 12 unassigned-task-detection（UT-003）において、「CI での自動検証（閾値超過チェック）が未実装」として本タスクが unassigned task として記録・formalize された。

### 1.2 問題点・課題

**問題1: アーカイブポリシー違反がPRマージ前に検知されない**

現在の開発フローでは、LOGS.md が閾値を超過していても PR レビュー・マージが可能な状態になっている。月次アーカイブが未実施のまま積み重なり、LOGS.md が数千行に膨れ上がった状態で PR がマージされるケースが生じうる。

**問題2: 違反検知が属人化している**

ポリシー文書（`logs-archive-policy.md`）の §5.3 エスカレーションフロー（F-005 対応）では「アーカイブ未実施」の一次対応として「該当 skill 担当が当月内に実施」と定められているが、担当者が閾値超過に気づくタイミングは不定。自動通知がなければ手動確認を失念しやすい。

**問題3: .claude/ と .agents/ の mirror sync 検証が手動**

ポリシー §4「アーカイブ手順」では `.agents/` 側への mirror sync 後に `diff` コマンドで差分ゼロ確認を行うことが定められているが、この検証も手動。CI で自動化することで確認漏れを防げる。

### 1.3 放置した場合の影響

- LOGS.md が無制限に肥大化し、スキルのコンテキスト参照が低速化・困難化する
- エスカレーションフロー（F-005）の「アーカイブ未実施」違反が常態化し、ポリシーが形骸化する
- `.agents/` への mirror sync 漏れが静かに蓄積し、`.claude/` と `.agents/` の内容乖離が拡大する
- 手動確認によるコストが継続的に発生し、担当者の負担が増す

---

## 2. 何を達成するか（What）

### 2.1 目的

GitHub Actions ワークフローに LOGS.md サイズ検証スクリプトを統合し、PR マージ時に 300 行超・30 KB 超の閾値チェックを自動実行する仕組みを構築する。検知時は **warning（警告）として通知**し、エラーによるマージブロックは行わない（非破壊的 CI）。

### 2.2 最終ゴール

1. GitHub Actions ワークフロー（`.github/workflows/`）に LOGS.md サイズ検証 job または step が追加されていること
2. PR がオープン・更新されるたびに `.claude/skills/*/LOGS.md` と `.agents/skills/*/LOGS.md` の全ファイルについて 300 行 / 30 KB チェックが自動実行されること
3. 閾値超過が検出された場合、GitHub Actions の警告アノテーションまたはコメントとして通知されること（エラーではなく warning）
4. CI 失敗によるマージブロックは発生しないこと（exit code 0 を返す非ブロッキング設計）
5. 検証スクリプトがローカルでも単体実行可能であること

### 2.3 スコープ

**含むもの**:

- LOGS.md サイズ検証シェルスクリプト（`scripts/ci/check-logs-size.sh`）の作成
- GitHub Actions ワークフローへの統合（既存 workflow への step 追加または新規 workflow ファイル作成）
- `.claude/skills/*/LOGS.md` と `.agents/skills/*/LOGS.md` の両方を対象とした検証
- 300 行超・30 KB 超の OR 条件チェック
- 警告出力（GitHub Actions warning アノテーション）

**含まないもの**:

- アーカイブ処理の自動実行（警告のみ。実際のアーカイブは手動）
- エラーによるマージブロック設計
- mirror sync の自動実行（検証のみ）
- 他の CI チェック（lint / typecheck / test）の変更
- Slack / メール等の外部通知連携

### 2.4 成果物

| 成果物                                                         | 種別 | 内容                                                                  |
| -------------------------------------------------------------- | ---- | --------------------------------------------------------------------- |
| `scripts/ci/check-logs-size.sh`                                | 新規 | LOGS.md サイズ検証スクリプト（ローカル単体実行可能）                  |
| `.github/workflows/logs-size-check.yml`                        | 新規 | GitHub Actions ワークフロー定義（または既存 workflow への step 追加） |
| `docs/30-workflows/TASK-LOGS-ARCHIVE-CI-VALIDATE-001/index.md` | 新規 | 本タスクのインデックス                                                |

---

## 3. どのように実装するか（How）

### 3.1 前提条件

- `TASK-LOGS-ARCHIVE-POLICY-001` が完了し、`logs-archive-policy.md` が確定していること
- `.github/workflows/` ディレクトリが存在し、既存 CI ワークフローが稼働していること
- GitHub Actions の `permissions: contents: read` が利用可能であること
- `bash` / `wc` / `find` コマンドが CI 環境（ubuntu-latest）で使用可能であること

### 3.2 依存タスク

| タスクID                     | 関係       | 理由                                           |
| ---------------------------- | ---------- | ---------------------------------------------- |
| TASK-LOGS-ARCHIVE-POLICY-001 | 前提タスク | 閾値・対象パス・エスカレーションフローの定義元 |
| TASK-CONFLICT-PREVENT-001    | 参照のみ   | mirror sync 機構の設計参照（検証対象の理解）   |

### 3.3 必要な知識

- GitHub Actions の `workflow_call` / `pull_request` トリガーと step 定義
- GitHub Actions の warning アノテーション出力形式（`echo "::warning file=...::message"`）
- `find` コマンドによる glob パターンマッチ（`*/LOGS.md`）
- `wc -l` / `wc -c` による行数・バイト数取得
- bash の条件分岐と exit code 設計（非ブロッキング: 常に exit 0）

### 3.4 推奨アプローチ

**警告設計を先に決める**: GitHub Actions の warning アノテーション形式を先に確認し、スクリプト出力形式を合わせて設計する。

**スクリプトをローカル先行で作成**: `check-logs-size.sh` をローカルで動作確認した後に、workflow yaml に組み込む。

**既存 workflow の確認優先**: 新規 workflow ファイルを作成する前に、既存の CI workflow（`ci.yml` 等）に step 追加できないかを確認する。

**閾値はハードコードしない**: 閾値値（300 行 / 30720 バイト）はスクリプト冒頭の変数として定義し、ポリシー変更時に 1 箇所の修正で対応できるようにする。

---

## 4. 実行手順（Phase構成）

### Phase 1: 現状確認・設計方針決定

**目的**: 既存の GitHub Actions ワークフロー構成と LOGS.md の現状を確認し、統合方針を決定する。

**手順**:

1. `.github/workflows/` 以下のワークフローファイル一覧を確認する
2. 既存 workflow の構成（トリガー・job 構成・使用ランナー）を把握する
3. `.claude/skills/*/LOGS.md` の対象ファイル一覧と現在の行数・サイズを計測する（`find .claude/skills -name "LOGS.md" | xargs wc -l -c`）
4. `.agents/skills/*/LOGS.md` についても同様に確認する
5. GitHub Actions warning アノテーション出力形式を確認する
6. 既存 workflow への step 追加 vs 新規 workflow ファイル作成の方針を決定する

**成果物**: 設計方針メモ（インラインコメントで可）

**完了条件**: 既存 workflow 構成の把握と統合方針の決定が完了していること

---

### Phase 2: 検証スクリプト設計

**目的**: `check-logs-size.sh` のロジック設計を確定する。

**手順**:

1. スクリプトの入力（対象パターン: `.claude/skills/*/LOGS.md` および `.agents/skills/*/LOGS.md`）を定義する
2. 閾値変数を定義する:
   ```bash
   LINE_THRESHOLD=300
   BYTE_THRESHOLD=30720
   ```
3. 検出ロジックを設計する:
   - `find` で対象 LOGS.md を列挙
   - 各ファイルに対して `wc -l` / `wc -c` を実行
   - 300 行超 OR 30720 バイト超の場合に warning を出力
4. GitHub Actions アノテーション出力形式を確定する:
   ```bash
   echo "::warning file=${file}::LOGS.md が閾値超過（${lines}行 / ${bytes}バイト）。アーカイブポリシーを確認してください。"
   ```
5. 非ブロッキング設計（exit 0 を保証）を確認する
6. ローカル実行時の出力形式を設計する（CI 環境と区別するための `CI` 環境変数チェック）

**成果物**: スクリプト設計ドキュメント（インラインコメントで可）

**完了条件**: 設計の全要素が確定していること

---

### Phase 3: 検証スクリプト実装（`scripts/ci/check-logs-size.sh`）

**目的**: Phase 2 の設計に基づいて `check-logs-size.sh` を実装する。

**手順**:

1. `scripts/ci/` ディレクトリが存在しない場合は作成する
2. `check-logs-size.sh` を以下の構成で実装する:

   ```bash
   #!/usr/bin/env bash
   set -euo pipefail

   LINE_THRESHOLD=300
   BYTE_THRESHOLD=30720
   WARNING_COUNT=0

   # .claude/skills/*/LOGS.md と .agents/skills/*/LOGS.md を検索
   while IFS= read -r file; do
     lines=$(wc -l < "${file}")
     bytes=$(wc -c < "${file}")
     if [[ "${lines}" -gt "${LINE_THRESHOLD}" ]] || [[ "${bytes}" -gt "${BYTE_THRESHOLD}" ]]; then
       if [[ "${CI:-}" == "true" ]]; then
         echo "::warning file=${file}::LOGS.md が閾値超過（${lines}行 / ${bytes}バイト）。アーカイブポリシーを確認してください: .claude/skills/aiworkflow-requirements/references/logs-archive-policy.md"
       else
         echo "[WARNING] ${file}: ${lines}行 / ${bytes}バイト（閾値: ${LINE_THRESHOLD}行 / ${BYTE_THRESHOLD}バイト）"
       fi
       WARNING_COUNT=$((WARNING_COUNT + 1))
     fi
   done < <(find .claude/skills -name "LOGS.md" -type f 2>/dev/null; find .agents/skills -name "LOGS.md" -type f 2>/dev/null)

   if [[ "${WARNING_COUNT}" -gt 0 ]]; then
     echo "合計 ${WARNING_COUNT} 件の LOGS.md が閾値を超過しています。"
   else
     echo "すべての LOGS.md が閾値以内です。"
   fi

   exit 0  # 非ブロッキング: 常に成功
   ```

3. 実行権限を付与する: `chmod +x scripts/ci/check-logs-size.sh`
4. ローカルで動作確認を行う: `./scripts/ci/check-logs-size.sh`

**成果物**: `scripts/ci/check-logs-size.sh`

**完了条件**: スクリプトがローカルで正常に実行され、閾値超過ファイルの警告が出力されること

---

### Phase 4: GitHub Actions ワークフロー統合

**目的**: Phase 3 で作成したスクリプトを GitHub Actions に組み込む。

**手順**:

1. Phase 1 の方針に従って、既存 workflow への追加 or 新規ファイル作成を選択する
2. **新規ファイルを作成する場合**: `.github/workflows/logs-size-check.yml` を以下の構成で作成する:

   ```yaml
   name: LOGS.md サイズ検証

   on:
     pull_request:
       branches:
         - main
       paths:
         - "**/*.md"

   jobs:
     check-logs-size:
       name: LOGS.md 閾値チェック
       runs-on: ubuntu-latest
       permissions:
         contents: read
       steps:
         - uses: actions/checkout@v4
         - name: LOGS.md サイズ検証
           run: bash scripts/ci/check-logs-size.sh
   ```

3. **既存 workflow に追加する場合**: 適切な job に step を追加し、`scripts/ci/check-logs-size.sh` を実行するステップを組み込む
4. `paths` フィルターで `**/*.md` に絞ることで、LOGS.md 変更のない PR では job をスキップする

**成果物**: `.github/workflows/logs-size-check.yml`（または既存 workflow の更新）

**完了条件**: ワークフロー定義が作成・追加されていること

---

### Phase 5: ローカル動作確認

**目的**: Phase 3 のスクリプトがローカルで期待通りに動作することを確認する。

**手順**:

1. プロジェクトルートで `./scripts/ci/check-logs-size.sh` を実行する
2. 既知の閾値超過ファイル（例: `aiworkflow-requirements/LOGS.md`・`task-specification-creator/LOGS.md`）が警告対象として出力されることを確認する
3. `exit 0` で終了することを確認する（`echo $?` で確認）
4. CI 環境変数を設定した場合の出力形式を確認する: `CI=true ./scripts/ci/check-logs-size.sh`
5. `.agents/` 側の LOGS.md も検出対象に含まれることを確認する

**成果物**: ローカル実行結果（手動確認の証跡）

**完了条件**: 全確認項目が PASS であること

---

### Phase 6: テスト拡充

**目的**: スクリプトの正常系・異常系・境界値を網羅した動作確認を行う。

**手順**:

1. **正常系**: 全 LOGS.md が閾値以内のケース（テスト用ダミーファイルで確認）
2. **行数閾値超過**: 301 行のダミー LOGS.md を作成して警告が出ることを確認
3. **バイト閾値超過**: 30721 バイトのダミー LOGS.md を作成して警告が出ることを確認
4. **両方超過**: 行数・バイト両方が閾値超過の場合に警告が 1 件のみ出ることを確認（OR 条件の重複排除）
5. **LOGS.md が存在しない場合**: `.claude/skills/` や `.agents/skills/` が空の場合にエラーにならないことを確認
6. テスト用ダミーファイルは確認後に削除する

**成果物**: テスト確認メモ（インラインコメントで可）

**完了条件**: 全6パターンの動作が期待通りであること

---

### Phase 7: カバレッジ確認

**目的**: スクリプトが対象ファイルを網羅していることを確認する。

**手順**:

1. `find .claude/skills -name "LOGS.md" -type f` の出力と `check-logs-size.sh` の検証対象が一致することを確認する
2. `find .agents/skills -name "LOGS.md" -type f` の出力についても同様に確認する
3. 新規 skill が追加された場合に自動で検証対象に含まれることを確認する（glob パターンの汎用性確認）
4. ポリシーの除外対象（`docs/**/LOGS.md`・`.worktrees/**/LOGS.md`）が検証対象に含まれていないことを確認する

**成果物**: カバレッジ確認メモ

**完了条件**: 対象範囲とポリシーの一致が確認されていること

---

### Phase 8: リファクタリング

**目的**: スクリプトとワークフロー定義の品質を整理する。

**手順**:

1. `check-logs-size.sh` の可読性を確認し、コメントを整理する
2. 閾値変数（`LINE_THRESHOLD` / `BYTE_THRESHOLD`）がスクリプト冒頭にまとめられていることを確認する
3. GitHub Actions 警告アノテーションのメッセージにポリシー参照パスが含まれていることを確認する
4. ワークフロー定義の `name` フィールドが日本語（または英語統一）で揃っているかを確認する
5. 不要なコメント・重複コードを削除する

**成果物**: 整理後の `check-logs-size.sh` および workflow ファイル

**完了条件**: コードレビュー可能な状態になっていること

---

### Phase 9: 品質保証

**目的**: CI 統合の品質を最終確認する。

**手順**:

1. `shellcheck scripts/ci/check-logs-size.sh` を実行し、シェルスクリプトの静的解析を通すこと（警告 0 件が理想。やむを得ない場合は `disable` コメントを付ける）
2. `.github/workflows/logs-size-check.yml` の YAML 構文が正しいことを確認する（`yamllint` または GitHub Actions の構文チェック）
3. `chmod +x scripts/ci/check-logs-size.sh` が設定されていることを確認する（`git ls-files --stage` で実行権限ビット確認）
4. ワークフローの `permissions` が最小権限（`contents: read` のみ）になっていることを確認する
5. `paths` フィルターで `**/*.md` が正しく機能することをドキュメントで確認する

**成果物**: 品質確認チェックリスト

**完了条件**: 全 quality gate を通過していること

---

### Phase 10: 最終レビュー

**目的**: 本タスクの完了条件をすべて確認する。

**手順**:

1. `scripts/ci/check-logs-size.sh` が存在し、実行権限が付与されていることを確認する
2. ワークフローファイルが存在し、`pull_request` トリガーで `check-logs-size.sh` を実行する設定になっていることを確認する
3. `.claude/skills/*/LOGS.md` と `.agents/skills/*/LOGS.md` の両方が検証対象に含まれていることを確認する
4. 警告出力が GitHub Actions アノテーション形式であることを確認する
5. スクリプトが常に `exit 0` を返す（非ブロッキング設計）ことを確認する
6. 上記 5 点が PASS であれば最終レビュー PASS とする。FAIL があれば該当 Phase に差し戻す

**成果物**: 最終レビュー結果メモ

**完了条件**: 5 点すべての確認が PASS

---

### Phase 11: 手動確認

**目的**: スクリプトと CI 統合の動作証跡を記録する。

**手順**:

以下のコマンドを実行し、各ファイルの存在と内容を確認する:

```bash
# スクリプト存在・実行権限確認
ls -la scripts/ci/check-logs-size.sh

# ワークフロー存在確認
ls -la .github/workflows/logs-size-check.yml

# スクリプトの対象ファイル検出確認
find .claude/skills -name "LOGS.md" -type f
find .agents/skills -name "LOGS.md" -type f

# ローカル実行（警告出力確認）
./scripts/ci/check-logs-size.sh

# CI モード実行（アノテーション形式確認）
CI=true ./scripts/ci/check-logs-size.sh

# exit code が 0 であることを確認
echo "exit code: $?"
```

各コマンドの出力が期待通りであることを以て手動確認の証跡とする。

**成果物**: 手動確認結果（コマンド出力スナップショット。本タスクの `outputs/phase-11/` に記録することが望ましい）

**完了条件**: 全コマンドが期待通りの出力を返すこと

---

### Phase 12: ドキュメント更新

**目的**: 本タスクの Phase 12 クローズアウトを行う。

> **中学生レベルで説明すると**: Phase 12 は「作ったものを記録しておくフェーズ」です。コードを書いて動作確認したら、「何を作ったか・どう使うか」をメモに残します。これをしておかないと、未来の自分や他の人が「これ何のファイル？」と困ってしまいます。作業日記をつけるイメージで、「今日ここまで終わりました」という記録を残しておきましょう。

**手順**:

1. 本仕様書（`TASK-LOGS-ARCHIVE-CI-VALIDATE-001.md`）の「ステータス」を「未実施」→「実施済み」に更新する
2. `.claude/skills/aiworkflow-requirements/LOGS.md` に本タスクの完了記録を追記する
3. `.agents/skills/aiworkflow-requirements/LOGS.md` にも同様の完了記録を追記する（mirror sync）
4. `aiworkflow-requirements/references/logs-archive-policy.md` の §5.3 エスカレーションフローに「CI 自動検証（本タスクで実装）」の参照を追記する
5. `docs/30-workflows/TASK-LOGS-ARCHIVE-CI-VALIDATE-001/index.md` の Phase 12 ステータスを `completed` に更新する

**成果物**: 本仕様書（更新後）

**完了条件**: ステータスが「実施済み」に更新されていること

---

### Phase 13: PR作成（ユーザー承認後）

**目的**: ユーザーの明示的承認を得た後に、変更を PR として提出する。

**手順**（ユーザー承認後に実施）:

```bash
# ブランチ作成
git checkout -b ci/task-logs-archive-ci-validate-001

# 変更ファイルの確認
git status

# コミット
git commit -m "ci(logs): TASK-LOGS-ARCHIVE-CI-VALIDATE-001 LOGS.mdアーカイブポリシーCI検証スクリプト統合"

# push
git push -u origin ci/task-logs-archive-ci-validate-001

# PR 作成
gh pr create \
  --title "ci(logs): TASK-LOGS-ARCHIVE-CI-VALIDATE-001 LOGS.md アーカイブポリシー CI 検証スクリプト統合" \
  --body "..."
```

**完了条件**: ユーザーの承認があるまで blocked。Phase 13 は実施しない。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `scripts/ci/check-logs-size.sh` が存在し、実行権限が付与されている
- [ ] GitHub Actions ワークフローが存在し、PR 時に `check-logs-size.sh` を実行する設定になっている
- [ ] `.claude/skills/*/LOGS.md` が検証対象に含まれている
- [ ] `.agents/skills/*/LOGS.md` が検証対象に含まれている
- [ ] 300 行超または 30 KB 超の場合に warning アノテーションが出力される
- [ ] スクリプトが常に exit 0 を返す（非ブロッキング設計）
- [ ] 警告メッセージにポリシー参照パス（`logs-archive-policy.md`）が含まれている

### 品質要件

- [ ] `shellcheck` が警告 0 件（または適切な `disable` コメント付き）
- [ ] ワークフロー YAML の構文が正しい
- [ ] 閾値（300 行 / 30720 バイト）がスクリプト冒頭の変数として定義されている
- [ ] ローカル実行時と CI 実行時で出力形式が適切に切り替わる
- [ ] `docs/**/LOGS.md` および `.worktrees/**/LOGS.md` が検証対象に含まれていない

### ドキュメント要件

- [ ] 本タスク仕様書（`TASK-LOGS-ARCHIVE-CI-VALIDATE-001.md`）のステータスが「実施済み」に更新されている
- [ ] `aiworkflow-requirements/LOGS.md`（`.claude/` および `.agents/` 両方）に完了記録が追記されている

---

## 6. 検証方法

### 確認コマンド

```bash
# スクリプト存在・実行権限確認
ls -la scripts/ci/check-logs-size.sh

# ワークフロー存在確認
cat .github/workflows/logs-size-check.yml

# 対象 LOGS.md 検出確認
find .claude/skills -name "LOGS.md" -type f
find .agents/skills -name "LOGS.md" -type f

# ローカル実行
./scripts/ci/check-logs-size.sh

# CI モード実行（アノテーション形式確認）
CI=true ./scripts/ci/check-logs-size.sh && echo "exit: $?"

# shellcheck
shellcheck scripts/ci/check-logs-size.sh
```

### 確認観点

| 確認ID | 対象                                    | 期待結果                                                              |
| ------ | --------------------------------------- | --------------------------------------------------------------------- |
| CV-01  | `scripts/ci/check-logs-size.sh`         | ファイルが存在し、実行権限ビットが立っている                          |
| CV-02  | `.github/workflows/logs-size-check.yml` | `pull_request` トリガーと `check-logs-size.sh` 実行ステップが存在する |
| CV-03  | ローカル実行出力                        | 閾値超過 LOGS.md の警告が出力される                                   |
| CV-04  | `CI=true` 実行出力                      | `::warning file=...::` 形式のアノテーションが出力される               |
| CV-05  | exit code                               | 常に 0 が返る（警告があっても CI はブロックされない）                 |
| CV-06  | `shellcheck` 出力                       | 警告 0 件（または適切な無効化コメント付き）                           |

---

## 7. リスクと対策

| リスク                                                                  | 影響度 | 発生確率 | 対策                                                                                          |
| ----------------------------------------------------------------------- | ------ | -------- | --------------------------------------------------------------------------------------------- |
| CI の warning が多数出力され、実際に問題のある警告が埋もれる            | 中     | 高       | 初回実行時に警告件数が多いことを前提とし、メッセージにアーカイブポリシーへの参照 URL を含める |
| `paths` フィルターで LOGS.md 変更以外の PR で job がスキップされる      | 低     | 中       | `paths` を `**/*.md` に設定して Markdown 変更全般で発火させる（または paths 指定なしとする）  |
| mirror sync（`.agents/` 側）が検証されないまま乖離が進む                | 中     | 中       | 将来的に mirror diff チェックを追加する候補として unassigned task に登録する                  |
| `shellcheck` の警告対応で bash 構文が複雑化する                         | 低     | 低       | `disable` コメントを使用し、可読性を優先する                                                  |
| スクリプトが CI 環境（ubuntu-latest）と macOS（ローカル）で挙動が異なる | 低     | 低       | `wc` の出力形式差異（先頭スペースの有無）を `tr -d ' '` または算術展開で吸収する              |

---

## 8. 参照情報

### 関連ドキュメント

| 資料名                       | パス                                                                                      | 説明                                       |
| ---------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------ |
| LOGS.md アーカイブポリシー   | `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md`                | 本タスクが実装する閾値・対象範囲の定義元   |
| mirror 側ポリシーコピー      | `.agents/skills/aiworkflow-requirements/references/logs-archive-policy.md`                | mirror sync 対象                           |
| TASK-LOGS-ARCHIVE-POLICY-001 | `docs/30-workflows/logs-archive-policy-001/index.md`                                      | アーカイブポリシー確定タスク（前提タスク） |
| unassigned-task-detection    | `docs/30-workflows/logs-archive-policy-001/outputs/phase-12/unassigned-task-detection.md` | 本タスク発見元（UT-003 として記録）        |
| TASK-CONFLICT-PREVENT-001    | `docs/30-workflows/` 以下                                                                 | mirror sync 機構の設計参照                 |

### 関連ファイル（作成・更新対象）

| ファイル                                         | 変更種別 | 内容                            |
| ------------------------------------------------ | -------- | ------------------------------- |
| `scripts/ci/check-logs-size.sh`                  | 新規作成 | LOGS.md サイズ検証スクリプト    |
| `.github/workflows/logs-size-check.yml`          | 新規作成 | GitHub Actions ワークフロー定義 |
| `.claude/skills/aiworkflow-requirements/LOGS.md` | 追記     | 本タスク完了記録                |
| `.agents/skills/aiworkflow-requirements/LOGS.md` | 追記     | mirror sync 完了記録            |

---

## 9. 備考

### 苦戦箇所【記入必須】

| 苦戦箇所                                 | 症状                                                                                                                                                 | 原因                                                                                                                                                 | 対応                                                                                                                                                                | 再発防止                                                                                                                                                                    |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| アーカイブポリシー違反の早期検知の重要性 | TASK-LOGS-ARCHIVE-POLICY-001 では「違反検知の自動化は MINOR（本タスク範囲外）」として後回しにしたが、CI 検証なしではポリシーが形骸化する懸念が残った | ポリシー策定フェーズと CI 実装フェーズを同一タスクに含めると規模が大きくなりすぎるため、意図的に分離したが、後続タスクとして明示する仕組みがなかった | `TASK-LOGS-ARCHIVE-POLICY-001` の Phase 12 unassigned-task-detection に UT-003 として記録し、本タスクとして formalize した                                          | ポリシー策定タスクでは「ポリシーの自動検証 CI が存在するか？」を Phase 12 のチェック項目に含めることで、未実装のまま完了宣言されることを防ぐ                                |
| CI の警告 vs. エラー判断基準             | LOGS.md の閾値超過は「放置すると問題だが、緊急のマージブロックが必要なレベルではない」という中間的な性質を持ち、error / warning の判断が難しい       | マージブロック（exit 1）にすると既存の閾値超過 skill が多いため、初回 CI 統合で全 PR がブロックされる副作用が発生する可能性があった                  | 非ブロッキング warning 設計（exit 0）を採用し、警告は通知するが CI を失敗させない方針とした。将来的にアーカイブが進んで件数が減ったタイミングでエラー化を検討できる | CI チェックを新規追加する際は「blocking か non-blocking か」を設計時に明示し、初回統合時の副作用（既存違反の影響範囲）を事前に評価する                                      |
| mirror sync 検証の CI 自動化の難しさ     | `.claude/` と `.agents/` の LOGS.md mirror sync が正しく行われているかをCIで自動検証しようとすると、「どのタイミングで diff を取るか」が複雑になる   | PR ブランチ上では `.agents/` 側の変更が未完了の場合があり、「sync 漏れ」と「意図的な段階的適用」の区別がコマンドレベルでは難しい                     | 本タスクでは mirror sync diff 検証はスコープ外とし、サイズ閾値チェックのみに絞った。mirror sync の CI 検証は別タスクとして unassigned task に登録することを推奨する | mirror sync の CI 検証は「`.claude/` と `.agents/` の対応ファイルが必ず同時にコミットされる」という運用ルールを先に確立してから、差分チェックを CI に組み込む順番が望ましい |

### 発見経緯

`TASK-LOGS-ARCHIVE-POLICY-001` の Phase 12 において、`outputs/phase-12/unassigned-task-detection.md` の UT-003 として「CIでの自動検証（閾値超過チェック）は未実装」が記録された。ポリシー文書（`logs-archive-policy.md`）の §5.3 エスカレーションフロー（F-005 対応）において「ポリシー違反検知を自動化する案は MINOR（本タスク範囲外）とする」と明記されていたため、意図的に後続タスクとして formalize され、2026-04-19 に本タスクが起票された。
