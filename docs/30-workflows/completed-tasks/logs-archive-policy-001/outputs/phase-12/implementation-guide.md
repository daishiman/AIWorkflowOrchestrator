# Implementation Guide: TASK-LOGS-ARCHIVE-POLICY-001

## Part 1: 中学生向け

### なぜ必要か

LOGS.md は、スキルがいつ何を変えたかを書く日記帳のようなものです。これが厚くなりすぎると、読み返しにくくなるだけでなく、同じページを複数人が同時に直して Git でぶつかりやすくなります。

### 何をしたか

たとえば、学校のプリントを教科ごと、月ごとにファイルへ分けて整理すると探しやすくなります。同じように、LOGS.md も一定量を超えたら月ごとの archive ファイルへ分けるルールを決めました。

今回のタスクでは、次の 3 つをそろえました。

- いつ分けるか: `300 行超` または `30 KB超` または `月次`
- どういう名前にするか: `logs-archive-YYYY-MM.md`
- どこに置くか: 各 skill の `references/` 配下を canonical として扱う

### 今回作ったもの

- LOGS.md archive の正本ポリシー文書
- `.claude` / `.agents` 間の mirror 参照
- quick-reference / topic-map / resource-map の導線

## Part 2: 技術者向け

### 変更ファイル

| ファイル                                                                   | 役割                        |
| -------------------------------------------------------------------------- | --------------------------- |
| `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md` | 正本ポリシー                |
| `.agents/skills/aiworkflow-requirements/references/logs-archive-policy.md` | mirror                      |
| `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`              | topic-map 参照追加          |
| `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`        | quick lookup 追加           |
| `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`           | resource lookup 追加        |
| `outputs/phase-11/TASK-LOGS-ARCHIVE-POLICY-001-manual-test-report.md`      | NON_VISUAL primary evidence |

### 型定義 / データ契約

```ts
type LogsArchiveThresholdPolicy = {
  lineLimit: 300;
  byteLimit: 30720;
  cadence: "monthly";
};

type LogsArchiveNamingPolicy = {
  pattern: "^logs-archive-\\d{4}-(0[1-9]|1[0-2])\\.md$";
  canonicalDir: "references";
};
```

### APIシグネチャ

```bash
wc -l LOGS.md
wc -c LOGS.md
diff .claude/skills/<skill>/references/logs-archive-YYYY-MM.md \
     .agents/skills/<skill>/references/logs-archive-YYYY-MM.md
rg -n "logs-archive-policy" .claude/skills/aiworkflow-requirements/indexes/*.md
```

### 使用例

```bash
# 例: 312行に達した LOGS.md を 2026-04 分として評価
wc -l .claude/skills/aiworkflow-requirements/LOGS.md
wc -c .claude/skills/aiworkflow-requirements/LOGS.md
ls .claude/skills/aiworkflow-requirements/references/logs-archive-2026-04.md
diff .claude/skills/aiworkflow-requirements/references/logs-archive-2026-04.md \
     .agents/skills/aiworkflow-requirements/references/logs-archive-2026-04.md
```

### エラーハンドリング

- `legacy` 名 (`logs-archive-2026-feb.md` など) は残置し、リネームしない
- `diff` 差分が残る場合は mirror sync を再実行し、差分ゼロになるまで close-out しない

### エッジケース

- 抽出対象月が曖昧な場合は「毎月初の第1営業日」に前月分を評価するルールを優先する
- references 配置と既存直下配置が混在しても、canonical は `references/` として index 参照を維持する

### 設定項目と定数一覧

| 名称           | 値                            | 用途           |
| -------------- | ----------------------------- | -------------- | -------- |
| `lineLimit`    | `300`                         | 行数閾値       |
| `byteLimit`    | `30720`                       | バイト閾値     |
| `cadence`      | `monthly`                     | 月次判定       |
| `pattern`      | `^logs-archive-\\d{4}-(0[1-9] | 1[0-2])\\.md$` | 命名規則 |
| `canonicalDir` | `references`                  | archive 配置先 |

### テスト構成

- `outputs/phase-10/final-review-result.md`: 最終レビューの集約
- `outputs/phase-11/manual-test-result.md`: NON_VISUAL summary evidence
- `outputs/phase-11/TASK-LOGS-ARCHIVE-POLICY-001-manual-test-report.md`: task 固有 primary evidence
- `outputs/phase-12/phase12-task-spec-compliance-check.md`: Phase 12 再監査結果

## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要

代替証跡:

- `outputs/phase-10/final-review-result.md`
- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/TASK-LOGS-ARCHIVE-POLICY-001-manual-test-report.md`

## 検証結果

- root `artifacts.json` と `outputs/artifacts.json` を同期
- Phase 12 canonical 6成果物の存在確認
- Phase 11 NON_VISUAL primary evidence を task 固有名へ補正
- 正本 / mirror のポリシー本文は `diff` 差分ゼロ
