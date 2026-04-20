# 既存 LOGS.md への新規アーカイブポリシー遡及適用 - タスク指示書

## メタ情報

```yaml
issue_number: 2338
task_id: TASK-LOGS-ARCHIVE-RETROACTIVE-001
task_name: 既存 LOGS.md への新規アーカイブポリシー遡及適用
category: ドキュメント整備
target_feature: スキル管理 / LOGS.md 運用
priority: 低
scale: 小規模
status: 未実施
source_phase: TASK-LOGS-ARCHIVE-POLICY-001 Phase 12 unassigned-task-detection.md (UT-001)
created_date: 2026-04-19
```

## メタ情報

| 項目         | 内容                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| タスクID     | TASK-LOGS-ARCHIVE-RETROACTIVE-001                                           |
| タスク名     | 既存 LOGS.md への新規アーカイブポリシー遡及適用                             |
| 分類         | ドキュメント整備                                                            |
| 対象機能     | スキル管理 / LOGS.md 運用                                                   |
| 優先度       | 低                                                                          |
| 見積もり規模 | 小規模                                                                      |
| ステータス   | 未実施                                                                      |
| 発見元       | TASK-LOGS-ARCHIVE-POLICY-001 Phase 12 unassigned-task-detection.md (UT-001) |
| 発見日       | 2026-04-19                                                                  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-LOGS-ARCHIVE-POLICY-001` において、LOGS.md アーカイブポリシー（閾値・命名規則・手順・mirror sync 方式）が確定し、正本として `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md` に収録された。

しかし同タスクの Phase 12 で生成された `unassigned-task-detection.md`（UT-001）に明示されている通り、**既存スキルの LOGS.md への遡及適用は本タスクのスコープ外**として意図的に切り出された。

現状では、閾値（300 行超 または 30 KB 超）を大幅に超過している LOGS.md がポリシー確定後も手つかずのまま残っている。また一部スキルには `logs-archive-2026-feb.md` 等の legacy 形式アーカイブが存在するが、新規ポリシーで定義された `YYYY-MM` 数値形式（`logs-archive-2026-04.md`）での月次アーカイブは未作成である。

### 1.2 問題点・課題

**問題1: LOGS.md が閾値を大幅に超過したまま放置されている**

TASK-LOGS-ARCHIVE-POLICY-001 Phase 1 の計測時点（2026-04-19）で、以下のスキルが閾値を超過している。

| skill                      | 行数 | サイズ(KB) | 300行超 | 30KB超 |
| -------------------------- | ---- | ---------- | ------- | ------ |
| skill-creator              | 2542 | 123.0      | 超      | 超     |
| aiworkflow-requirements    | 2908 | 571.4      | 超      | 超     |
| task-specification-creator | 3158 | 233.9      | 超      | 超     |
| claude-agent-sdk           | 336  | 26.4       | 超      | 未達   |

ポリシーが「active」になった以上、これらは遡及的に月次アーカイブを実行して閾値以下に戻す必要がある。

**問題2: 新規ポリシー形式のアーカイブファイルが存在しない**

一部スキルには `logs-archive-2026-feb.md` / `logs-archive-2026-march.md`（F-001 定義の legacy 表記）が存在するが、`logs-archive-2026-04.md` 等の YYYY-MM 数値形式アーカイブは未作成である。運用を継続する前提として、各スキルに新規ポリシー形式のアーカイブファイルを少なくとも 1 つ存在させる必要がある。

**問題3: mirror（.agents/ 側）との同期が未実施**

`.claude/` 側の LOGS.md が更新されても、対応する `.agents/skills/*/LOGS.md` が更新されていないケースが想定される。アーカイブ実行のタイミングで mirror sync（diff=0 確認）も実施する必要がある。

### 1.3 放置した場合の影響

- 閾値超過 LOGS.md が膨れ続け、Claude Code セッションのコンテキスト消費が増大する
- 新旧ポリシーが混在し、他の開発者がどちらに従えばよいか判断できなくなる
- mirror 同期漏れが蓄積し、`.claude/` と `.agents/` で内容乖離が発生する
- ポリシー文書が「形だけ存在する dead doc」になり、次サイクル（2026-10-19 見直し）での判断精度が下がる

---

## 2. 何を達成するか（What）

### 2.1 目的

確定済みアーカイブポリシー（`logs-archive-policy.md`）を、既存の全対象スキルの LOGS.md に遡及適用する。legacy ファイルは F-001 に従い残置しつつ、新規ポリシー形式（`logs-archive-YYYY-MM.md`）での月次アーカイブを各スキルに対して実行し、現役 LOGS.md を閾値以下に戻す。

### 2.2 最終ゴール

1. `.claude/skills/*/LOGS.md` および `.agents/skills/*/LOGS.md` のうち閾値超過しているファイルがアーカイブ済みであること
2. 各スキルの `references/` 配下に `logs-archive-YYYY-MM.md`（YYYY-MM 数値形式）が少なくとも 1 つ作成されていること
3. legacy ファイル（`logs-archive-2026-feb.md` 等）がリネームされずにそのまま残置されていること
4. `.claude/` と `.agents/` の両側で `diff` による差分ゼロが確認されていること
5. 現役 LOGS.md のサイズが閾値（300 行以下 AND 30 KB 以下）に収まっていること

### 2.3 スコープ

**含むもの**:

- `.claude/skills/skill-creator/LOGS.md` の月次アーカイブ実行
- `.claude/skills/aiworkflow-requirements/LOGS.md` の月次アーカイブ実行
- `.claude/skills/task-specification-creator/LOGS.md` の月次アーカイブ実行
- `.claude/skills/claude-agent-sdk/LOGS.md` の月次アーカイブ実行（行数閾値超過）
- 各スキルの `.agents/` 側 mirror sync（diff=0 確認）
- アーカイブ実行後の閾値確認

**含まないもの**:

- legacy ファイルのリネームや削除（F-001 禁止）
- `docs/**/LOGS.md` の操作（除外対象）
- アーカイブポリシー本文の変更
- 新規スキルのアーカイブ運用開始（本タスクは「遡及適用」のみ）
- 月次アーカイブの自動化実装（MINOR / 別タスク）

### 2.4 成果物

| 成果物                                                                         | 種別     | 内容                                            |
| ------------------------------------------------------------------------------ | -------- | ----------------------------------------------- |
| `.claude/skills/skill-creator/references/logs-archive-YYYY-MM.md`              | 新規作成 | skill-creator の月次アーカイブ（1ファイル以上） |
| `.claude/skills/aiworkflow-requirements/references/logs-archive-YYYY-MM.md`    | 新規作成 | aiworkflow-requirements の月次アーカイブ        |
| `.claude/skills/task-specification-creator/references/logs-archive-YYYY-MM.md` | 新規作成 | task-specification-creator の月次アーカイブ     |
| `.claude/skills/claude-agent-sdk/references/logs-archive-YYYY-MM.md`           | 新規作成 | claude-agent-sdk の月次アーカイブ               |
| 各スキル `.claude/skills/*/LOGS.md`                                            | 更新     | 移動済みエントリ削除・閾値以下に縮小            |
| 各スキル `.agents/skills/*/` の対応ファイル                                    | 更新     | mirror sync（.claude/ と diff=0）               |

---

## 3. どのように実装するか（How）

### 3.1 前提条件

- `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md` が `active` 状態であること
- 各スキルの LOGS.md および `references/` ディレクトリが読み取り可能であること
- `.agents/skills/*/` の mirror ディレクトリが存在すること
- legacy ファイル（`logs-archive-2026-feb.md` 等）は F-001 に従い**絶対にリネーム・削除しない**こと

### 3.2 依存タスク

| タスクID                     | 関係       | 理由                                                                   |
| ---------------------------- | ---------- | ---------------------------------------------------------------------- |
| TASK-LOGS-ARCHIVE-POLICY-001 | 前提タスク | アーカイブポリシー（閾値・命名規則・手順）の確定元。本タスクの根拠文書 |
| TASK-CONFLICT-PREVENT-001    | 参照のみ   | mirror sync 機構の詳細が同タスク成果物に記録されている                 |

### 3.3 必要な知識

- `logs-archive-policy.md` のアーカイブ手順 6 ステップ（閾値検知→抽出→アーカイブ作成→削除→mirror sync→動作確認）
- F-001: legacy 表記残置ルール（`logs-archive-2026-feb.md` 等はリネーム禁止）
- 各スキルの LOGS.md エントリ構造（日付・タスクID・操作内容の記述形式）
- `.agents/` 側 mirror sync 方法（手動コピーまたは自動機構）
- `wc -l` / `wc -c` による行数・バイト数計測

### 3.4 推奨アプローチ

**スキル単位で完結させる**: 1スキルあたり「アーカイブ作成 → LOGS.md 縮小 → mirror sync → diff 確認」の4ステップを完結させてから次スキルへ進む。中断した場合の影響範囲を最小化するため。

**月次単位でアーカイブする**: 1回のアーカイブで複数月分をまとめて処理せず、月ごとにファイルを分ける（`logs-archive-2026-01.md`、`logs-archive-2026-02.md` 等）。

**legacy ファイルへの誤操作を防ぐ**: 作業前に `ls references/logs-archive-*.md` を実行して legacy ファイルの一覧を把握し、誤って上書き・削除しないよう注意する。

**mirror sync は毎スキル必ず実施**: アーカイブ後に必ず `.agents/` 側の対応ファイルを更新し、`diff` で差分ゼロを確認してから次スキルへ進む。

---

## 4. 実行手順（Phase 構成）

### Phase 1: 現状調査・対象スキル特定

**目的**: 全対象スキルの LOGS.md の現在の行数・サイズを計測し、アーカイブが必要なスキルと月次範囲を特定する。

**手順**:

1. 以下コマンドで全対象スキルの LOGS.md を計測する:

   ```bash
   for skill in skill-creator aiworkflow-requirements task-specification-creator claude-agent-sdk; do
     echo "=== $skill ==="
     wc -l .claude/skills/$skill/LOGS.md
     wc -c .claude/skills/$skill/LOGS.md
   done
   ```

2. 閾値判定（300 行超 OR 30 KB 超）を各スキルについて実施し、対象一覧を作成する
3. 各スキルの `references/` 配下に既存の `logs-archive-*.md` ファイルがあるか確認する:

   ```bash
   ls .claude/skills/*/references/logs-archive-*.md 2>/dev/null
   ```

4. legacy ファイルの一覧を把握し、リネーム禁止リストとして記録する（F-001 遵守）
5. `.agents/skills/*/LOGS.md` と `.claude/` 側の差分を確認する:

   ```bash
   for skill in skill-creator aiworkflow-requirements task-specification-creator claude-agent-sdk; do
     diff .claude/skills/$skill/LOGS.md .agents/skills/$skill/LOGS.md && echo "$skill: diff=0" || echo "$skill: DIFF FOUND"
   done
   ```

6. 計測結果をもとに、月次アーカイブの対象月範囲（例: 2026-01〜2026-03）を各スキルについて決定する

**成果物**: 対象スキル・対象月一覧（インラインメモで可）

**完了条件**: 全4スキルの行数・サイズが計測済みで、対象月範囲が確定していること

---

### Phase 2: task-specification-creator の月次アーカイブ実行

**目的**: 最大超過スキル（3158 行 / 233.9 KB）である `task-specification-creator` の LOGS.md を月次アーカイブして閾値以下に縮小する。

**手順**:

1. `.claude/skills/task-specification-creator/LOGS.md` を読み、月別のエントリ範囲を把握する
2. 前月分（例: 2026-03 以前）のエントリを対象月ごとに `references/logs-archive-YYYY-MM.md` へ移動する:
   - ファイル命名: `logs-archive-2026-01.md`、`logs-archive-2026-02.md`、`logs-archive-2026-03.md` 等
   - 配置先: `.claude/skills/task-specification-creator/references/`
   - legacy ファイル（`logs-archive-2026-feb.md` / `logs-archive-2026-march.md`）は**触らない**
3. LOGS.md から移動済みエントリを削除し、`git diff` で削除範囲と抽出範囲が一致することを確認する
4. `wc -l` / `wc -c` で LOGS.md が閾値以下（300 行以下 AND 30 KB 以下）になったことを確認する

**成果物**: `.claude/skills/task-specification-creator/references/logs-archive-YYYY-MM.md`（月数分）、更新後 LOGS.md

**完了条件**: LOGS.md が 300 行以下 AND 30 KB 以下であること、新規アーカイブファイルが `YYYY-MM` 数値形式であること

---

### Phase 3: aiworkflow-requirements の月次アーカイブ実行

**目的**: 最大サイズスキル（2908 行 / 571.4 KB）である `aiworkflow-requirements` の LOGS.md を月次アーカイブして閾値以下に縮小する。

**手順**:

1. `.claude/skills/aiworkflow-requirements/LOGS.md` を読み、月別のエントリ範囲を把握する
2. 既存の `references/logs-archive-2026-*-*.md`（トピック拡張形式）の存在を確認し、誤って上書きしないよう注意する（F-001: トピック拡張形式も残置）
3. 前月分のエントリを対象月ごとに `references/logs-archive-YYYY-MM.md` へ移動する
4. LOGS.md から移動済みエントリを削除し、`git diff` で削除範囲を確認する
5. `wc -l` / `wc -c` で LOGS.md が閾値以下になったことを確認する

**成果物**: `.claude/skills/aiworkflow-requirements/references/logs-archive-YYYY-MM.md`（月数分）、更新後 LOGS.md

**完了条件**: LOGS.md が 300 行以下 AND 30 KB 以下であること

---

### Phase 4: skill-creator の月次アーカイブ実行

**目的**: `skill-creator`（2542 行 / 123.0 KB）の LOGS.md を月次アーカイブして閾値以下に縮小する。

**手順**:

1. `.claude/skills/skill-creator/LOGS.md` を読み、月別のエントリ範囲を把握する
2. 既存の `references/` 配下にアーカイブファイルがあれば確認し、命名規則違反がないかチェックする
3. 前月分のエントリを対象月ごとに `references/logs-archive-YYYY-MM.md` へ移動する
4. LOGS.md から移動済みエントリを削除し、`git diff` で削除範囲を確認する
5. `wc -l` / `wc -c` で LOGS.md が閾値以下になったことを確認する

**成果物**: `.claude/skills/skill-creator/references/logs-archive-YYYY-MM.md`（月数分）、更新後 LOGS.md

**完了条件**: LOGS.md が 300 行以下 AND 30 KB 以下であること

---

### Phase 5: claude-agent-sdk の月次アーカイブ実行

**目的**: `claude-agent-sdk`（336 行 / 26.4 KB）の LOGS.md を月次アーカイブして行数閾値以下に縮小する。

**手順**:

1. `.claude/skills/claude-agent-sdk/LOGS.md` を読み、月別のエントリ範囲を把握する
2. 前月分のエントリを `references/logs-archive-YYYY-MM.md` へ移動する
3. LOGS.md から移動済みエントリを削除し、`git diff` で削除範囲を確認する
4. `wc -l` / `wc -c` で LOGS.md が閾値以下になったことを確認する

**注意**: claude-agent-sdk は行数のみ超過（336 行）のため、優先度は他スキルより低い。ただし閾値の OR 条件に従い実施が必要。

**成果物**: `.claude/skills/claude-agent-sdk/references/logs-archive-YYYY-MM.md`（月数分）、更新後 LOGS.md

**完了条件**: LOGS.md が 300 行以下であること

---

### Phase 6: mirror sync 実行・差分確認

**目的**: Phase 2〜5 で更新した `.claude/` 側の変更を `.agents/` 側に反映し、diff=0 を確認する。

**手順**:

1. 各スキルについて `.agents/skills/<skill-name>/` 配下に対応するアーカイブファイルをコピーする:

   ```bash
   for skill in skill-creator aiworkflow-requirements task-specification-creator claude-agent-sdk; do
     # LOGS.md の同期
     cp .claude/skills/$skill/LOGS.md .agents/skills/$skill/LOGS.md
     # 新規アーカイブファイルの同期
     ls .claude/skills/$skill/references/logs-archive-2026-*.md | while read f; do
       cp "$f" ".agents/skills/$skill/references/$(basename $f)"
     done
   done
   ```

2. 同期後に各スキルで diff=0 を確認する:

   ```bash
   for skill in skill-creator aiworkflow-requirements task-specification-creator claude-agent-sdk; do
     diff .claude/skills/$skill/LOGS.md .agents/skills/$skill/LOGS.md && echo "$skill LOGS: OK" || echo "$skill LOGS: DIFF FOUND"
     for f in .claude/skills/$skill/references/logs-archive-2026-*.md; do
       af=".agents/skills/$skill/references/$(basename $f)"
       diff "$f" "$af" && echo "$(basename $f): OK" || echo "$(basename $f): DIFF FOUND"
     done
   done
   ```

3. 差分が残る場合は手動同期後に再実行する

**成果物**: `.agents/skills/*/LOGS.md`（更新後）、`.agents/skills/*/references/logs-archive-YYYY-MM.md`（新規）

**完了条件**: 全4スキルで `.claude/` と `.agents/` の diff が 0 であること

---

### Phase 7: 設計レビュー・整合性確認

**目的**: アーカイブ実行結果がポリシー（`logs-archive-policy.md`）に準拠しているかを確認する。

**手順**:

1. 作成したアーカイブファイルの命名が正規表現 `^logs-archive-\d{4}-(0[1-9]|1[0-2])\.md$` に適合していることを確認する:

   ```bash
   ls .claude/skills/*/references/logs-archive-*.md | grep -v -E 'logs-archive-[0-9]{4}-(0[1-9]|1[0-2])\.md' | grep -v 'feb\|march\|jan\|topic\|index\|legacy'
   ```

   出力が空（命名規則違反ゼロ）であることを確認する

2. legacy ファイルが削除・リネームされていないことを確認する:

   ```bash
   ls .claude/skills/task-specification-creator/references/logs-archive-2026-feb.md
   ls .claude/skills/task-specification-creator/references/logs-archive-2026-march.md
   ```

3. 全4スキルの現役 LOGS.md が閾値以下であることを再確認する

**成果物**: 整合性確認メモ（インラインで可）

**完了条件**: 命名規則違反ゼロ、legacy ファイル残置確認、全スキル閾値以下

---

### Phase 8: テスト・品質確認

**目的**: アーカイブファイルの内容と LOGS.md の縮小が正確であることを確認する。

**手順**:

1. 各アーカイブファイルを `wc -l` で計測し、空ファイルでないことを確認する
2. LOGS.md の先頭・末尾エントリが途中で切断されていないことを Markdown 構文で確認する
3. アーカイブファイルの先頭に対象月ヘッダー（例: `# logs-archive-2026-01`）が含まれていることを確認する
4. `git diff` で意図しないファイル変更がないことを確認する（legacy ファイル・policy ファイルへの変更がないこと）

**成果物**: 品質確認結果メモ

**完了条件**: 全アーカイブファイルが非空、LOGS.md が Markdown 構文破損なし、意図しない変更がないこと

---

### Phase 9: リファクタリング・最終整形

**目的**: アーカイブファイルと LOGS.md の形式を統一し、冗長・重複を除去する。

**手順**:

1. 各アーカイブファイルのヘッダー形式が既存の最新エントリと整合していることを確認する
2. LOGS.md の残留エントリが既存形式（日付・タスクID・操作の3要素）を維持していることを確認する
3. 各アーカイブファイルの末尾に余分な空行が多数ある場合は削除する
4. mirror sync が漏れなく行われているかを最終チェックする

**成果物**: 整形済み各ファイル

**完了条件**: 全ファイルの形式が統一され、mirror sync が完了していること

---

### Phase 10: 最終レビュー

**目的**: 本タスクの完了条件をすべて確認する。

**手順**:

1. 全4スキルの現役 LOGS.md が 300 行以下 AND 30 KB 以下であることを確認する
2. 各スキルの `references/` 配下に `logs-archive-YYYY-MM.md`（YYYY-MM 数値形式）が作成されていることを確認する
3. legacy ファイルがリネーム・削除されていないことを確認する（F-001）
4. `.claude/` と `.agents/` の各対応ファイルで diff=0 が確認されていることを確認する
5. アーカイブファイルの命名が正規表現に適合していることを確認する
6. 上記5点がすべて PASS の場合、最終レビュー PASS とする。FAIL があれば該当 Phase に差し戻す

**成果物**: 最終レビュー結果メモ

**完了条件**: 5点すべての確認が PASS

---

### Phase 11: 手動確認（NON_VISUAL タスク代替証跡）

**目的**: `NON_VISUAL` タスクとして、ファイルの存在と閾値確認コマンドの出力を代替証跡として記録する。

> **NON_VISUAL タスク証跡方針（TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001 で確立）**:
> スクリーンショットが取得できないドキュメント操作タスクでは、`outputs/phase-11/manual-test-result.md` にコマンド出力をそのまま記録することを一次証跡とする。

**手順**:

以下のコマンドを実行し、結果を `outputs/phase-11/manual-test-result.md` に記録する:

```bash
# 各スキルの閾値確認
for skill in skill-creator aiworkflow-requirements task-specification-creator claude-agent-sdk; do
  echo "=== $skill LOGS.md ==="
  wc -l .claude/skills/$skill/LOGS.md
  wc -c .claude/skills/$skill/LOGS.md
done

# 新規アーカイブファイルの存在確認
ls .claude/skills/*/references/logs-archive-2026-[0-9][0-9].md

# legacy ファイル残置確認
ls .claude/skills/task-specification-creator/references/logs-archive-2026-feb.md
ls .claude/skills/task-specification-creator/references/logs-archive-2026-march.md

# mirror diff=0 確認
for skill in skill-creator aiworkflow-requirements task-specification-creator claude-agent-sdk; do
  diff .claude/skills/$skill/LOGS.md .agents/skills/$skill/LOGS.md \
    && echo "$skill: diff=0" || echo "$skill: DIFF FOUND"
done
```

各コマンドの出力（行数・バイト数・ファイル一覧・diff 結果）を `manual-test-result.md` に記録することで証跡とする。

**成果物**: `outputs/phase-11/manual-test-result.md`

**完了条件**: 全コマンドの出力が記録されており、閾値超過・diff 発生がないこと

---

### Phase 12: ドキュメント更新

**目的**: 本タスク自身のクローズアウト処理を行い、関連スキルへの記録を更新する。

**中学生レベルでの説明**:

> **Phase 12 とは何か？**
>
> たとえば、掃除が終わったあとに「掃除した日」「どこを掃除したか」「次いつ掃除するか」をノートに書き残す作業があるとします。これが Phase 12 です。
>
> プログラムやドキュメントを作ったり直したりする作業（Phase 1〜11）が終わったあと、「何をやったか」「どこで苦労したか」「次の人が困らないように何を残すか」を決まった場所に書き残します。
>
> これをしないと、次に同じ作業をする人（または将来の自分）が「前回どうやったっけ？」と困ることになります。Phase 12 は「自分のメモを残す作業」です。

**手順**:

1. 本仕様書（`TASK-LOGS-ARCHIVE-RETROACTIVE-001.md`）のメタ情報テーブルの「ステータス」を「未実施」→「実施済み」に更新する
2. `.claude/skills/task-specification-creator/LOGS.md` に本タスク（`TASK-LOGS-ARCHIVE-RETROACTIVE-001`）の実施記録エントリを追記する
3. `.claude/skills/aiworkflow-requirements/LOGS.md` に本タスクの close-out 記録エントリを追記する
4. `aiworkflow-requirements/references/task-workflow.md` に本タスクの完了記録を追加する
5. Phase 12 の更新内容を `.agents/` 側にも mirror sync する

**成果物**: 本仕様書（更新後）、各 LOGS.md（追記後）、`task-workflow.md`（更新後）

**完了条件**: ステータスが「実施済み」に更新されており、LOGS 記録が追記されていること

---

### Phase 13: PR 作成（ユーザー承認後）

**目的**: ユーザーの明示的承認を得た後に、変更を PR として提出する。

**手順**（ユーザー承認後に実施）:

```bash
# ブランチ確認
git status

# 変更ファイルの確認
git diff --name-only

# コミット
git commit -m "docs(skill-logs): TASK-LOGS-ARCHIVE-RETROACTIVE-001 既存LOGS.md新規アーカイブポリシー遡及適用"

# push
git push -u origin docs/task-logs-archive-retroactive-001

# PR 作成
gh pr create \
  --title "docs(skill-logs): TASK-LOGS-ARCHIVE-RETROACTIVE-001 既存LOGS.md新規ポリシー遡及適用" \
  --body "..."
```

**完了条件**: ユーザーの承認があるまで blocked。Phase 13 は実施しない。

---

## 4. 苦戦箇所・知見（TASK-LOGS-ARCHIVE-POLICY-001 での経験）

### 苦戦箇所【記入必須】

| 苦戦箇所                                    | 症状                                                                                                                                                                        | 原因                                                                                                                                                                | 対応                                                                                                                                                                          | 再発防止                                                                                                                                                                                                           |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| legacy 表記残置ルール（F-001）の厳守        | `logs-archive-2026-feb.md` / `logs-archive-2026-march.md` 等の legacy ファイルをリネームしたくなる誘惑がある。「統一されていない」という不快感が作業の判断を歪める          | アーカイブポリシー策定段階（TASK-LOGS-ARCHIVE-POLICY-001）で、legacy 表記が「誤り」ではなく「過去の合理的な判断の産物」であることが十分に説明されていなかった       | F-001 として命名規則違反の「リネーム禁止」を policy 文書に明示し、legacy ファイルを「残置」という意図的な状態として記録した。本タスクでも冒頭の注意事項として再掲している     | アーカイブ実行前に `ls references/logs-archive-*.md` で legacy ファイルの一覧を把握し、「これは触らない」と明示的に確認してから作業を開始するチェックリストを Phase 1 に組み込む                                   |
| mirror 同期の手動確認負荷                   | `.claude/` 側を更新するたびに `.agents/` 側への手動コピーと `diff` 確認が必要となり、スキル数×アーカイブファイル数の組み合わせで確認作業が線形増加した                      | mirror sync 機構（TASK-CONFLICT-PREVENT-001 成果物）の自動化範囲が LOGS.md アーカイブに対応していないケースがあり、手動介入が必要な範囲が明確でなかった             | Phase 6 に「全スキル一括 mirror sync」ステップを設け、スキル単位でループ処理するコマンドを手順に明示した。diff 結果をログに残すことで確認の抜け漏れを防いだ                   | TASK-CONFLICT-PREVENT-001 成果物に「アーカイブファイル（`logs-archive-YYYY-MM.md`）の自動同期対応」を MINOR タスクとして記録する。手動確認が必要な間は Phase 6 の手順を忠実に実行する                              |
| NON_VISUAL タスクでの Phase 11 証跡代替方針 | ドキュメント操作タスクではスクリーンショットが取得できないため、「Phase 11 完了の証明」が曖昧になりやすい。「ファイルを更新した」という事実の証跡をどう残すかが問題になった | `task-specification-creator` の Phase 11 テンプレートが「UI 操作のスクリーンショット」を前提としており、NON_VISUAL タスクに対する代替証跡方法が明記されていなかった | TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001 での先例に倣い、`outputs/phase-11/manual-test-result.md` にコマンド出力を記録することを一次証跡として採用した。Phase 11 手順に明示した | `task-specification-creator/LOGS.md` と Phase 11 テンプレートに「NON_VISUAL タスクでは `manual-test-result.md` へのコマンド出力記録を一次証跡とする」ルールを標準化する（TASK-SC-CANCEL-LOGS-SYNC-001 で追記予定） |

### 発見経緯

`TASK-LOGS-ARCHIVE-POLICY-001` の Phase 12 において、`outputs/phase-12/unassigned-task-detection.md` の UT-001 として「既存 LOGS.md への遡及適用：ポリシー確定後も各スキルの LOGS.md に月次アーカイブが未実施。別タスクとして formalize が必要」と記録された。これを根拠として 2026-04-19 に本タスクを formalize した。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `.claude/skills/task-specification-creator/LOGS.md` が 300 行以下 AND 30 KB 以下に縮小されている
- [ ] `.claude/skills/aiworkflow-requirements/LOGS.md` が 300 行以下 AND 30 KB 以下に縮小されている
- [ ] `.claude/skills/skill-creator/LOGS.md` が 300 行以下 AND 30 KB 以下に縮小されている
- [ ] `.claude/skills/claude-agent-sdk/LOGS.md` が 300 行以下に縮小されている
- [ ] 各スキルの `references/` 配下に `logs-archive-YYYY-MM.md`（数値形式）が作成されている
- [ ] legacy ファイル（`logs-archive-2026-feb.md` 等）がリネーム・削除されずに残置されている（F-001）
- [ ] `.claude/` と `.agents/` の各対応ファイルで diff=0 が確認されている

### 品質要件

- [ ] 作成したアーカイブファイルの命名が正規表現 `^logs-archive-\d{4}-(0[1-9]|1[0-2])\.md$` に適合している
- [ ] アーカイブファイルが空でなく、移動されたエントリが含まれている
- [ ] 現役 LOGS.md の Markdown 構文が壊れていない（エントリが途中で切断されていない）
- [ ] Phase 11 の `manual-test-result.md` に全コマンドの出力が記録されている
- [ ] `git diff` で legacy ファイル・policy ファイルへの意図しない変更がないことが確認されている

### ドキュメント要件

- [ ] 本タスク仕様書（`TASK-LOGS-ARCHIVE-RETROACTIVE-001.md`）のステータスが「実施済み」に更新されている
- [ ] `.claude/skills/task-specification-creator/LOGS.md` に本タスクの実施記録エントリが追記されている
- [ ] `.claude/skills/aiworkflow-requirements/LOGS.md` に本タスクの close-out 記録エントリが追記されている
- [ ] `aiworkflow-requirements/references/task-workflow.md` に本タスクの完了記録が追加されている

---

## 6. 検証方法

### 確認コマンド

```bash
# 全スキルの閾値確認
for skill in skill-creator aiworkflow-requirements task-specification-creator claude-agent-sdk; do
  echo "=== $skill ==="
  wc -l .claude/skills/$skill/LOGS.md
  wc -c .claude/skills/$skill/LOGS.md
done

# 新規アーカイブファイルの存在確認（数値形式のみ）
ls .claude/skills/*/references/logs-archive-2026-[0-9][0-9].md

# legacy ファイル残置確認
ls .claude/skills/task-specification-creator/references/logs-archive-2026-feb.md
ls .claude/skills/task-specification-creator/references/logs-archive-2026-march.md

# 命名規則適合確認（違反ファイルが出力されないことを確認）
ls .claude/skills/*/references/logs-archive-*.md \
  | grep -v -E 'logs-archive-[0-9]{4}-(0[1-9]|1[0-2])\.md' \
  | grep -v 'feb\|march\|jan\|[0-9]{4}-[0-9]{2}-' \
  | grep -v 'index\|legacy'

# mirror diff=0 確認
for skill in skill-creator aiworkflow-requirements task-specification-creator claude-agent-sdk; do
  diff .claude/skills/$skill/LOGS.md .agents/skills/$skill/LOGS.md \
    && echo "$skill LOGS: diff=0" || echo "$skill LOGS: DIFF FOUND"
done
```

### 確認観点

| 確認ID | 対象                                        | 期待結果                                                             |
| ------ | ------------------------------------------- | -------------------------------------------------------------------- |
| AC-01  | 全4スキルの LOGS.md 行数                    | 300 行以下                                                           |
| AC-02  | 全4スキルの LOGS.md バイト数                | 30 KB 以下（claude-agent-sdk は行数のみ適用）                        |
| AC-03  | 各スキル `references/` のアーカイブファイル | `logs-archive-YYYY-MM.md` 形式のファイルが 1 件以上存在する          |
| AC-04  | legacy ファイル残置確認                     | `logs-archive-2026-feb.md` / `logs-archive-2026-march.md` が存在する |
| AC-05  | `.claude/` vs `.agents/` diff               | 全4スキルで diff=0                                                   |
| AC-06  | 命名規則チェック                            | 正規表現違反ファイルが 0 件                                          |

---

## 7. リスクと対策

| リスク                                                                       | 影響度 | 発生確率 | 対策                                                                                                                                  |
| ---------------------------------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| legacy ファイルを誤ってリネーム・削除する（F-001 違反）                      | 高     | 中       | Phase 1 で legacy ファイル一覧を必ず把握し、作業前に「リネーム禁止リスト」として記録する。`git diff` で変更ファイルを随時確認する     |
| 月次範囲の判定を誤り、新しいエントリをアーカイブに含めてしまう               | 中     | 中       | アーカイブ対象は「前月末 23:59 までのエントリ」に限定し、当月分は現役 LOGS.md に残す。`git diff` で削除範囲を抽出前と照合する         |
| mirror sync の漏れにより `.claude/` と `.agents/` の乖離が残る               | 中     | 高       | Phase 6 でスキル単位のループ処理により全ファイルを一括 sync し、`diff` で確認する。漏れがあれば Phase 6 を再実行する                  |
| LOGS.md の Markdown 構文が破損し、エントリが読めなくなる                     | 高     | 低       | 削除はエントリの区切り（見出し・水平線）を単位として実施し、行単位での削除は避ける。削除後に Markdown レンダリングで確認する          |
| アーカイブファイルが `references/` 以外に作成される（配置ミス）              | 低     | 低       | Phase 2〜5 の手順に配置先パスを明示する。Phase 7 の整合性確認でパスを確認する                                                         |
| aiworkflow-requirements のトピック拡張形式（`YYYY-MM-topic.md`）を上書きする | 中     | 低       | Phase 3 で既存の `references/` ファイル一覧を確認してから新規ファイルを作成する。トピック拡張形式はポリシーで禁止されていない（残置） |

---

## 8. 参照情報

### 関連ドキュメント

| 資料名                                 | パス                                                                                      | 説明                                                                                       |
| -------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| アーカイブポリシー正本                 | `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md`                | 本タスクの根拠文書。閾値・命名規則・手順・F-001 を規定                                     |
| mirror 版アーカイブポリシー            | `.agents/skills/aiworkflow-requirements/references/logs-archive-policy.md`                | `.claude/` 側と同内容。diff=0 であることを確認する                                         |
| TASK-LOGS-ARCHIVE-POLICY-001 index     | `docs/30-workflows/logs-archive-policy-001/index.md`                                      | ポリシー策定タスクのインデックス。Phase 12 の unassigned-task-detection が本タスクの発見元 |
| unassigned-task-detection (UT-001)     | `docs/30-workflows/logs-archive-policy-001/outputs/phase-12/unassigned-task-detection.md` | 本タスクが UT-001 として記録されているファイル                                             |
| TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001 | `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md`                       | NON_VISUAL 代替証跡方針の先例タスク                                                        |

### 関連ファイル（操作対象）

| ファイル                                              | 変更種別 | 内容                                     |
| ----------------------------------------------------- | -------- | ---------------------------------------- |
| `.claude/skills/task-specification-creator/LOGS.md`   | 縮小     | 閾値超過エントリをアーカイブへ移動・削除 |
| `.claude/skills/aiworkflow-requirements/LOGS.md`      | 縮小     | 閾値超過エントリをアーカイブへ移動・削除 |
| `.claude/skills/skill-creator/LOGS.md`                | 縮小     | 閾値超過エントリをアーカイブへ移動・削除 |
| `.claude/skills/claude-agent-sdk/LOGS.md`             | 縮小     | 行数超過エントリをアーカイブへ移動・削除 |
| `.claude/skills/*/references/logs-archive-YYYY-MM.md` | 新規作成 | 各スキルの月次アーカイブファイル         |
| `.agents/skills/*/LOGS.md`                            | 更新     | mirror sync（.claude/ と diff=0）        |
| `.agents/skills/*/references/logs-archive-YYYY-MM.md` | 新規作成 | mirror 側の月次アーカイブファイル        |

### F-001 残置対象（変更禁止）

| ファイル                                                                                      | 理由             |
| --------------------------------------------------------------------------------------------- | ---------------- |
| `.claude/skills/task-specification-creator/references/logs-archive-2026-feb.md`               | legacy 月名形式  |
| `.claude/skills/task-specification-creator/references/logs-archive-2026-march.md`             | legacy 月名形式  |
| `.claude/skills/aiworkflow-requirements/references/logs-archive-2026-*-*.md`（30 件超）       | トピック拡張形式 |
| `.claude/skills/task-specification-creator/references/logs-archive-index.md`                  | index 形式       |
| `.claude/skills/task-specification-creator/references/logs-archive-legacy.md`（存在する場合） | legacy 形式      |
