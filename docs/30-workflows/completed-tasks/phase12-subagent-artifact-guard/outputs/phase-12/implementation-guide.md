# Phase 12 SubAgent成果物ガード — 実装ガイド

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| タスクID   | UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001 |
| Phase      | 12                                         |
| タスク名   | Task 12-1（実装ガイド作成）                |
| 作成日     | 2026-03-03                                 |
| ステータス | completed                                  |

---

# Part 1: 概念説明（中学生レベル）

## 1. 「班長と報告書」の例え — なぜSubAgent責務固定が必要か

クラスで5つの班がそれぞれ自由研究をやったとする。先生が「結果を報告書にまとめて」とだけ伝えたら、こんなことが起きる。

- A班: 手書きの箇条書き
- B班: パワポで図解
- C班: ノートの切れ端に殴り書き
- D班: 模造紙にマインドマップ
- E班: 何も提出しない

先生はこれを全部読んで「ちゃんとやったか」確認するのに、ものすごく時間がかかる。

**解決策: テンプレートを配る。**

先生が「この用紙に書いて出しなさい」と統一テンプレートを渡せば、どの班の報告書も同じ形式になる。先生は用紙の各欄が埋まっているかチェックするだけで済む。

Phase 12のSubAgent責務固定はまさにこれと同じ。各SubAgentに「この仕様書を、このテンプレートに沿って更新しなさい」と明確な担当と形式を決める。1つのSubAgentが担当する仕様書は最大3ファイルまで。これにより、どのSubAgentが何をやったかが一目でわかり、漏れの発見も容易になる。

---

## 2. 「三点確認」の例え — 三点突合とは何か

テストの答え合わせを思い浮かべてほしい。

1. **自分の答案用紙**（実際に書いた答え）
2. **模範解答**（正しい答え）
3. **先生のチェック表**（何点中何点か記録したもの）

この3つを見比べることで、「答えが合っているか」「点数の記録が正しいか」「全問チェックしたか」が確認できる。

Phase 12の三点突合も同じ構造を持つ。

| 点  | テストの例え | Phase 12の対応ファイル       | 役割       |
| --- | ------------ | ---------------------------- | ---------- |
| 点1 | 模範解答     | `phase-12-documentation.md`  | 計画・目標 |
| 点2 | チェック表   | `documentation-changelog.md` | 実績・証跡 |
| 点3 | 答案用紙     | `spec-update-summary.md`     | 実施内容   |

3つのファイルの内容が矛盾なく一致していれば「PASS」、食い違いがあれば「DRIFT」として修正が必要になる。

---

## 3. 「currentViolations=0」の例え — 合格基準

宿題の未提出リストをイメージしてほしい。

- **今週の未提出**: 自分が今週出し忘れた宿題 = `currentViolations`
- **過去の未提出**: 先月から溜まっている宿題 = `baselineViolations`

先生は「今週の分が全部出ていればOK」と判断する。過去の分は別の機会に片付ければよい。

つまり **`currentViolations=0`（今回分の違反がゼロ）** であれば合格。`baselineViolations`（過去から残っている違反）がいくら多くても、今回のタスクの合否には影響しない。ただし件数は記録しておき、いつか対処する。

---

## 4. 概念図 — テンプレートから合格までの流れ

```
  テンプレート配布          記入                 検証                合格
  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐    ┌─────────┐
  │  先生が用紙  │    │  各班が記入   │    │  先生が確認   │    │  全班    │
  │  を配る      │───>│  して提出     │───>│  欄が埋まって │───>│  合格!  │
  │             │    │              │    │  いるか確認   │    │         │
  └─────────────┘    └──────────────┘    └──────────────┘    └─────────┘
        │                   │                   │
        v                   v                   v
  Phase 12での対応:     Phase 12での対応:     Phase 12での対応:
  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐
  │ テンプレート  │    │ SubAgentが    │    │ 監査スクリプト │
  │ (summary /   │    │ 1仕様書ずつ   │    │ が自動検証    │
  │  report)     │    │ 担当して更新  │    │              │
  └─────────────┘    └──────────────┘    └──────────────┘
                                               │
                                               v
                                         ┌──────────────┐
                                         │ 三点突合      │
                                         │ (計画=証跡=   │
                                         │  実施内容)    │
                                         └──────────────┘
                                               │
                                               v
                                   currentViolations = 0?
                                         │          │
                                        YES         NO
                                         │          │
                                         v          v
                                      PASS       FAIL
                                                (修正して再検証)
```

---

# Part 2: 技術者レベル詳細

## 1. テンプレート構造: `spec-update-summary.md`

### 1.1 参照元テンプレート

`.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`

### 1.2 プロファイル選択基準

テンプレートは実装内容に応じて3つのプロファイルから選択する。

| プロファイル | 選択条件                                                                  | 仕様書数 |
| ------------ | ------------------------------------------------------------------------- | -------- |
| `P-STD5`     | コード変更あり + IPC/API変更あり、またはtask-workflowにStep 2更新対象あり | 5        |
| `P-UI6`      | コード変更あり + UI変更あり                                               | 6        |
| `P-RECHECK`  | コード変更なし（ドキュメント改善のみ）                                    | 5        |

### 1.3 必須セクション一覧

| セクション                                        | 必須/任意 | 内容                                                               |
| ------------------------------------------------- | --------- | ------------------------------------------------------------------ |
| `## メタ情報`                                     | 必須      | タスクID、タスク名、実施日、ステータス、プロファイル、SubAgent分担 |
| `## 実装内容サマリー`                             | 必須      | 実装要点、変更範囲、背景、完了判定根拠                             |
| `## 仕様書別SubAgent分担`                         | 必須      | 1仕様書=1SubAgentの分担表（P43対策: 3ファイル以下/SubAgent）       |
| `## Step 2判定の二重突合`（Step 2判定同期チーム） | 必須      | SubAgent-S2-A/B/Cによる計画・証跡・実施内容の整合確認              |
| `## 仕様反映先`                                   | 必須      | 仕様書ごとの反映内容と証跡の一覧                                   |
| `## 苦戦箇所`                                     | 必須      | 再発条件付きの課題・解決策・標準ルール                             |
| `## 同種課題の簡潔解決手順`                       | 必須      | 5ステップで再利用可能な解決手順                                    |
| `## 検証コマンド`                                 | 必須      | 実行コマンド、目的、期待結果の一覧表                               |

### 1.4 メタ情報フィールド詳細

| フィールド       | 型       | 必須 | 説明                                               |
| ---------------- | -------- | ---- | -------------------------------------------------- |
| タスクID         | `string` | 必須 | `UT-IMP-*` 形式のタスク識別子                      |
| タスク名         | `string` | 必須 | Phase 12内でのタスク名称                           |
| 実施日           | `date`   | 必須 | `YYYY-MM-DD` 形式                                  |
| ステータス       | `enum`   | 必須 | `completed` または `spec_created`                  |
| 監査対象workflow | `string` | 必須 | 対象workflowパス。2workflow同時監査の場合は2つ記載 |
| プロファイル     | `enum`   | 必須 | `P-STD5` / `P-UI6` / `P-RECHECK`                   |
| SubAgent分担     | `string` | 必須 | 各SubAgentの担当仕様書を列挙                       |

---

## 2. SubAgent責務表: `spec-sync-subagent-report.md`

### 2.1 参照元テンプレート

`.claude/skills/skill-creator/assets/phase12-spec-sync-subagent-template.md`

### 2.2 基本ルール

**「1仕様書=1SubAgent」ルール**: 各SubAgentは担当する仕様書を1つだけ持つ。1つのSubAgentが複数の仕様書を同時更新することを禁止する。これはP43（rate limit中断）対策として、1SubAgentあたり3ファイル以下に制限するための運用ルールである。

### 2.3 P-STD5: 標準5仕様書プロファイル

| SubAgent   | 担当仕様書                      | 主担当作業                                         | 依存関係             |
| ---------- | ------------------------------- | -------------------------------------------------- | -------------------- |
| SubAgent-A | `references/interfaces-*.md`    | 型定義・Preload API契約同期                        | 実装差分確定後       |
| SubAgent-B | `references/api-ipc-*.md`       | IPCチャネル契約（request/response/validation）同期 | SubAgent-A完了後     |
| SubAgent-C | `references/security-*.md`      | sender/P42/許可値/エラー境界の同期                 | SubAgent-B完了後     |
| SubAgent-D | `references/task-workflow.md`   | 完了記録・成果物・検証証跡・苦戦箇所同期           | SubAgent-A/B/C完了後 |
| SubAgent-E | `references/lessons-learned.md` | 苦戦箇所の再利用可能化                             | SubAgent-D完了後     |

### 2.4 P-UI6: UI機能6仕様書プロファイル

| SubAgent   | 担当仕様書                               | 主担当作業                       | 依存関係               |
| ---------- | ---------------------------------------- | -------------------------------- | ---------------------- |
| SubAgent-A | `references/ui-ux-components.md`         | 主要UI一覧・完了タスク・導線同期 | 実装差分確定後         |
| SubAgent-B | `references/ui-ux-feature-components.md` | 機能仕様・未タスク・苦戦箇所同期 | SubAgent-A完了後       |
| SubAgent-C | `references/arch-ui-components.md`       | 構造責務境界の同期               | SubAgent-A/B完了後     |
| SubAgent-D | `references/arch-state-management.md`    | 状態管理責務の同期               | SubAgent-C完了後       |
| SubAgent-E | `references/task-workflow.md`            | 完了台帳・検証証跡・残課題同期   | SubAgent-A/B/C/D完了後 |
| SubAgent-F | `references/lessons-learned.md`          | 再発条件付き教訓の同期           | SubAgent-E完了後       |

### 2.5 P-RECHECK: 再確認プロファイル

| SubAgent   | 担当範囲                                                  | 主担当作業                                  | 完了条件                               |
| ---------- | --------------------------------------------------------- | ------------------------------------------- | -------------------------------------- |
| SubAgent-A | `references/task-workflow.md`                             | 完了台帳・残課題テーブル・検証証跡同期      | 完了タスク + 証跡 + 苦戦箇所が記録済み |
| SubAgent-B | `references/lessons-learned.md`                           | 苦戦箇所の再発条件付き教訓化                | 再発条件 + 簡潔解決手順が記録済み      |
| SubAgent-C | `docs/30-workflows/unassigned-task/`                      | 未タスク指示書配置・10見出し確認・監査実行  | `missing=0` かつ `currentViolations=0` |
| SubAgent-D | 検証スクリプト実行                                        | verify/validate/audit/linksの順次実行と記録 | 4スクリプト全PASS                      |
| SubAgent-E | `spec-update-summary.md` / `spec-sync-subagent-report.md` | Step 2判定同期・三点突合確認                | summary/report/changelogの三点が整合   |

### 2.6 Step 2判定同期チーム（全プロファイル共通・必須）

全プロファイルで、通常のSubAgentに加えて以下のStep 2判定同期チームが必須となる。

| SubAgent      | 担当範囲                     | 主担当作業                             | 完了条件                                  |
| ------------- | ---------------------------- | -------------------------------------- | ----------------------------------------- |
| SubAgent-S2-A | `phase-12-documentation.md`  | Step 2更新対象の要否判定を確定         | `完了` / `該当なし` で説明可能            |
| SubAgent-S2-B | `documentation-changelog.md` | Step判定（1-A〜2）と理由を同期         | Step 2判定が実装実体と一致                |
| SubAgent-S2-C | `spec-update-summary.md`     | Step 2更新仕様書の一覧化と反映内容同期 | changelogのStep 2判定と更新対象一覧が一致 |

### 2.7 必須記載項目（仕様書別）

| 仕様書          | 必須記載                                                 |
| --------------- | -------------------------------------------------------- |
| interfaces      | 実装内容、契約差分、後方互換方針、型公開面               |
| api-ipc         | チャネル一覧、引数/戻り値、実装状況、Preload対応メソッド |
| security        | 検証要件、責務分離、許可値リスト、サニタイズ方針         |
| task-workflow   | 完了記録、成果物、苦戦箇所、検証証跡、未タスク監査結果   |
| lessons-learned | 苦戦箇所、再発条件、原因、解決策、簡潔手順               |

### 2.8 P43対策のポイント

P43（Phase 12サブエージェントのrate limit中断）を防ぐために以下を厳守する。

1. 1SubAgentあたり3ファイル以下の更新に制限する
2. LOGS.mdへの「完了」記録は全ファイル更新後の最終ステップとする
3. 中断が発生した場合は `git diff --stat -- .claude/skills/` で実際の変更ファイルを確認する

---

## 3. 三点突合アルゴリズム

### 3.1 三点の定義

| 点  | ファイル                     | 役割       | 格納する情報                           |
| --- | ---------------------------- | ---------- | -------------------------------------- |
| 点1 | `phase-12-documentation.md`  | 計画・目標 | Step 2更新対象、更新予定仕様書一覧     |
| 点2 | `documentation-changelog.md` | 実績・証跡 | 各Stepの判定結果、理由、更新済み仕様書 |
| 点3 | `spec-update-summary.md`     | 実施内容   | 実際に更新した仕様書と反映内容         |

### 3.2 三点突合の3ルール

| ルール | 検証内容               | 確認方法                                                           | PASS条件                                         |
| ------ | ---------------------- | ------------------------------------------------------------------ | ------------------------------------------------ |
| (1)    | Step 2要否の一貫性確認 | 点1に`arch/api/interfaces/security`が含まれるか → Step 2要否を判定 | 点1の更新対象と点2のStep 2判定が矛盾しない       |
| (2)    | 更新対象の包含関係確認 | 点2で「更新済み」とした全仕様書が点3に含まれるか確認               | 点2の全仕様書名が点3に存在（点2 ⊆ 点3）          |
| (3)    | 反映内容の実質確認     | 点3の各仕様書の「反映内容」欄に空欄がないか確認                    | 空欄なし（ハイフンのみ・「記録済み」のみは不可） |

### 3.3 チェックポイント一覧（CP-1〜CP-5）

| CP   | 検証内容             | 検証コマンド例                                                   | 判定基準                              |
| ---- | -------------------- | ---------------------------------------------------------------- | ------------------------------------- |
| CP-1 | タスクID一致         | 3ファイルから `rg -o 'UT-IMP-[A-Z0-9-]+'` で抽出し完全一致を確認 | 3ファイルのタスクIDが完全一致 → PASS  |
| CP-2 | 更新仕様書リスト一致 | 点2と点3の `references/` パスを抽出して照合                      | 点2の全仕様書が点3に含まれる → PASS   |
| CP-3 | Step 2判定整合       | ルール(1)(2)(3)を順次確認                                        | 3ルール全て充足 → PASS                |
| CP-4 | Step完了記録整合     | 点2と点3のStep 2判定値が一致するか確認                           | 判定値が完全一致 → PASS               |
| CP-5 | SubAgent数整合       | summaryとreportの `SubAgent-` 行数をカウントし一致を確認         | 行数一致かつSubAgent名が全一致 → PASS |

### 3.4 総合判定

| 判定      | 条件                                          | 対応                               |
| --------- | --------------------------------------------- | ---------------------------------- |
| **PASS**  | CP-1〜CP-5が全てPASS                          | Phase 12完了可                     |
| **DRIFT** | いずれかでFAIL                                | 不一致点を修正してから再確認       |
| **N/A**   | 点1にarch/api/interfaces/securityが含まれない | Step 2対象なし。N/A理由を点2に明記 |

### 3.5 検証コマンド例

```bash
# CP-1: タスクID一致確認
WF="docs/30-workflows/<FEATURE_NAME>"
for f in "${WF}/phase-12-documentation.md" \
         "${WF}/outputs/phase-12/documentation-changelog.md" \
         "${WF}/outputs/phase-12/spec-update-summary.md"; do
  echo "$(basename $f): $(rg -o 'UT-IMP-[A-Z0-9-]+' "$f" | head -1)"
done

# CP-2: 更新仕様書リスト照合
rg -n 'references/' "${WF}/outputs/phase-12/documentation-changelog.md"
rg -n '^\|.*references/' "${WF}/outputs/phase-12/spec-update-summary.md"

# CP-3: Step 2判定整合
rg -n 'arch-|api-|interfaces-|security-' "${WF}/phase-12-documentation.md"
rg -n '^\| 2\s+\|' "${WF}/outputs/phase-12/documentation-changelog.md"

# CP-5: SubAgent数整合
echo "summary: $(rg -c '^\| SubAgent-' "${WF}/outputs/phase-12/spec-update-summary.md")"
echo "report: $(rg -c '^\| SubAgent-' "${WF}/outputs/phase-12/spec-sync-subagent-report.md")"
```

---

## 4. 監査スクリプト使用方法

### 4.1 スクリプト実行順序

監査は以下の順序で実行する。前スクリプトの失敗は後続に影響しないが、全件の合否を独立して記録する。

#### ステップ1: 参照リンク整合確認

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

- **目的**: 未タスク参照リンクの実在確認
- **期待結果**: `missing: 0`
- **FAIL時**: 欠損パスを修正し再実行

#### ステップ2: 対象ファイル形式監査

```bash
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json --target-file <unassigned-file-path>
```

- **目的**: 対象ファイルの形式監査（10見出し、メタ情報1セクション原則の確認）
- **判定対象**: `currentViolations`
- **期待結果**: `currentViolations.total = 0`
- **FAIL時**: 違反箇所を修正し再実行

#### ステップ3: 今回差分監査

```bash
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json --diff-from HEAD
```

- **目的**: 今回の変更分のみの違反検出
- **判定対象**: `currentViolations`（合否判定）+ `baselineViolations`（監視値）
- **期待結果**: `currentViolations.total = 0`
- **FAIL時**: 今回変更ファイルの違反を修正し再実行

#### ステップ4: 仕様書準拠確認

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/<FEATURE_NAME> --json
```

- **目的**: ワークフロー仕様準拠確認
- **期待結果**: `errors: 0`（PASS）
- **FAIL時**: 仕様書構造を修正し再実行

#### ステップ5: Phase出力構造確認

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/<FEATURE_NAME>
```

- **目的**: Phase出力ディレクトリ構造の確認
- **期待結果**: PASS
- **FAIL時**: 不足ファイルを配置し再実行

### 4.2 2workflow同時監査（必要な場合）

```bash
# workflow-a の検証
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow <workflow-a> --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js <workflow-a>

# workflow-b の検証
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow <workflow-b> --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js <workflow-b>
```

### 4.3 補助検証コマンド

```bash
# 監査スクリプト実体の事前確認
rg --files .claude/skills | rg 'verify-all-specs|validate-phase-output|verify-unassigned-links|audit-unassigned-tasks'

# メタ情報1セクション原則の確認（出現回数が1であること）
rg -c '^## メタ情報$' <target-file>

# 10見出しの機械確認（メタ情報1件 + ## 1..9 が9件）
rg -n '^## メタ情報$|^## [1-9]\. ' <unassigned-file>

# Step 2判定行の確認
rg -n '^\| 2\s+\|' <workflow-path>/outputs/phase-12/documentation-changelog.md
```

---

## 5. currentViolations判定基準

### 5.1 区分定義

| 区分                 | 定義                                             | 合否判定への使用       | 記録方法           |
| -------------------- | ------------------------------------------------ | ---------------------- | ------------------ |
| `currentViolations`  | 今回タスクの変更（新規作成・編集）で発生した違反 | **合否判定に使用**     | 0でPASS、>0でFAIL  |
| `baselineViolations` | 着手前から存在する既存の違反                     | **監視値として別記録** | 件数を記録するのみ |

### 5.2 合否判定表

| 条件                           | 判定       | 対応                                         |
| ------------------------------ | ---------- | -------------------------------------------- |
| `currentViolations.total = 0`  | **PASS**   | Phase 12完了可。baselineViolationsは別記録   |
| `currentViolations.total > 0`  | **FAIL**   | 今回タスク内で修正必須。FAIL解消まで完了不可 |
| `baselineViolations.total > 0` | 判定対象外 | 監視値として記録。本タスクの合否に影響しない |

### 5.3 記録フォーマット

```
audit-unassigned-tasks: 全体 PASS/FAIL（baseline: N件, current: M件）→ current PASS/FAIL
```

**記録例（PASS）:**

```
audit-unassigned-tasks: 全体 FAIL（baseline: 12件, current: 0件）→ current PASS
```

**記録例（FAIL）:**

```
audit-unassigned-tasks: 全体 FAIL（baseline: 12件, current: 3件）→ current FAIL（今回修正必須）
```

### 5.4 運用上の重要ポイント

- `baselineViolations`が多数存在しても、`currentViolations=0`であればPASS
- `baselineViolations`の解消は本タスクのスコープ外
- `currentViolations > 0`の場合は、違反箇所を修正してから再度スクリプトを実行し、0になることを確認する

---

## 6. テンプレートフィールド一覧表

### 6.1 `spec-update-summary.md` フィールド一覧

| セクション             | フィールド       | 型       | 必須 | 説明                                     |
| ---------------------- | ---------------- | -------- | ---- | ---------------------------------------- |
| メタ情報               | タスクID         | `string` | 必須 | `UT-IMP-*` 形式                          |
| メタ情報               | タスク名         | `string` | 必須 | タスク名称                               |
| メタ情報               | 実施日           | `date`   | 必須 | `YYYY-MM-DD`                             |
| メタ情報               | ステータス       | `enum`   | 必須 | `completed` / `spec_created`             |
| メタ情報               | 監査対象workflow | `string` | 必須 | 対象workflowパス                         |
| メタ情報               | プロファイル     | `enum`   | 必須 | `P-STD5` / `P-UI6` / `P-RECHECK`         |
| メタ情報               | SubAgent分担     | `string` | 必須 | SubAgent-A〜Eの担当仕様書                |
| 実装内容サマリー       | 何を実装したか   | `string` | 必須 | 実装の要点1-2行                          |
| 実装内容サマリー       | 変更範囲         | `enum[]` | 必須 | Main/Preload/Renderer/Store/docsから列挙 |
| 実装内容サマリー       | なぜ必要か       | `string` | 必須 | 背景と狙い                               |
| 実装内容サマリー       | 完了判定         | `string` | 必須 | Phase 12要件と一致する根拠               |
| 仕様書別SubAgent分担   | SubAgent         | `string` | 必須 | SubAgent識別子                           |
| 仕様書別SubAgent分担   | 担当仕様書       | `string` | 必須 | 担当仕様書パス                           |
| 仕様書別SubAgent分担   | 主担当作業       | `string` | 必須 | 実施する同期作業                         |
| 仕様書別SubAgent分担   | 依存関係         | `string` | 必須 | 前提となるSubAgent                       |
| 仕様反映先             | 仕様書           | `string` | 必須 | 仕様書パス                               |
| 仕様反映先             | 反映内容         | `string` | 必須 | 実際に記載した内容（空欄不可）           |
| 仕様反映先             | 証跡             | `string` | 必須 | 該当セクションへの参照                   |
| 苦戦箇所               | 苦戦箇所         | `string` | 必須 | 課題の要約                               |
| 苦戦箇所               | 再発条件         | `string` | 必須 | 再発しやすい条件                         |
| 苦戦箇所               | 解決策           | `string` | 必須 | 今回の対処内容                           |
| 苦戦箇所               | 今後の標準ルール | `string` | 必須 | 次回の標準運用                           |
| 同種課題の簡潔解決手順 | ステップ1〜5     | `string` | 必須 | 再利用可能な5ステップの手順              |
| 検証コマンド           | コマンド         | `string` | 必須 | 実行コマンド                             |
| 検証コマンド           | 目的             | `string` | 必須 | コマンドの目的                           |
| 検証コマンド           | 期待結果         | `string` | 必須 | 合格時の出力                             |

### 6.2 `spec-sync-subagent-report.md` フィールド一覧

| セクション         | フィールド       | 型       | 必須 | 説明                             |
| ------------------ | ---------------- | -------- | ---- | -------------------------------- |
| メタ情報           | タスクID         | `string` | 必須 | `UT-IMP-*` 形式                  |
| メタ情報           | タスク名         | `string` | 必須 | タスク名称                       |
| メタ情報           | 実装対象         | `string` | 必須 | 実装ファイル/機能の概要          |
| メタ情報           | 実施日           | `date`   | 必須 | `YYYY-MM-DD`                     |
| メタ情報           | 監査対象workflow | `string` | 必須 | 対象workflowパス                 |
| メタ情報           | 反映対象仕様書   | `string` | 必須 | 仕様書名の列挙                   |
| メタ情報           | プロファイル     | `enum`   | 必須 | `P-STD5` / `P-UI6` / `P-RECHECK` |
| SubAgent分担       | SubAgent         | `string` | 必須 | SubAgent識別子                   |
| SubAgent分担       | 担当仕様書       | `string` | 必須 | 担当仕様書パス                   |
| SubAgent分担       | 主担当作業       | `string` | 必須 | 実施する同期作業                 |
| SubAgent分担       | 完了条件         | `string` | 必須 | SubAgentの完了判定基準           |
| 各仕様書の必須記載 | 仕様書           | `string` | 必須 | 対象仕様書名                     |
| 各仕様書の必須記載 | 必須記載         | `string` | 必須 | 仕様書に記載すべき項目           |
| 検証コマンド       | コマンド         | `string` | 必須 | 実行コマンド一覧                 |
| 完了チェック       | チェック項目     | `bool`   | 必須 | 全項目にチェックが入っていること |

---

## 変更履歴

| バージョン | 日付       | 内容                                  |
| ---------- | ---------- | ------------------------------------- |
| 1.0.0      | 2026-03-03 | 実装ガイド初版作成（Part 1 + Part 2） |
