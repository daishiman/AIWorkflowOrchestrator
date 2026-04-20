# EVALS snake_case v1 スキーマ正本化 - タスク指示書

## メタ情報

```yaml
issue_number: null
task_id: UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001
task_name: EVALS snake_case v1 スキーマ正本化
category: 要件
target_feature: aiworkflow-requirements 正本 - EVALS スキーマ方言
priority: 中
scale: 小規模
status: completed
completed_date: 2026-04-19
completed_in: TASK-EVALS-CONSUMER-AUDIT-001-SKILL-REFLECT-WAVE
source_phase: TASK-EVALS-CONSUMER-AUDIT-001 Phase 9/12 follow-up
created_date: 2026-04-19
dependencies: []
successors: [task-evals-schema-dialect-unification-001]
spec_path: docs/30-workflows/completed-tasks/task-evals-spec-snake-case-v1-document-001.md
```

| 項目         | 内容                                               |
| ------------ | -------------------------------------------------- |
| タスクID     | UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001   |
| タスク名     | EVALS snake_case v1 スキーマ正本化                 |
| 分類         | 要件                                               |
| 対象機能     | aiworkflow-requirements 正本 - EVALS スキーマ方言  |
| 優先度       | 中                                                 |
| 見積もり規模 | 小規模                                             |
| ステータス   | 完了（2026-04-19）                                 |
| 発見元       | TASK-EVALS-CONSUMER-AUDIT-001 Phase 9/12 follow-up |
| 発見日       | 2026-04-19                                         |
| 関連タスク   | task-evals-schema-dialect-unification-001（後続）  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-EVALS-CONSUMER-AUDIT-001 Phase 5/9 の調査で、現在リポジトリ内の EVALS.json には 2 系統の方言が共存していることが判明した。

- **snake_case v1 系**: `skill-creator` / `aiworkflow-requirements` / `skill-fixture-runner` 系で採用。`current_level` / `levels.{N}` ツリー / `metrics.total_usage_count` / `average_satisfaction` など snake_case フィールドを使う。
- **camelCase v2 系**: 上記以外のスキル/エージェントで採用。`currentLevel` / `totalUsageCount` 等。

しかし `aiworkflow-requirements/references/` の正本（EVALS に関する節）には camelCase v2 系前提の記述しか残っておらず、snake_case v1 系の定義（フィールド意味・ツリー構造・どのスキルが採用しているか）が正本化されていない。結果として、監査・Lint・Consumer 実装のどれも「snake_case v1 は正当な方言なのか、レガシーで除却対象なのか」を正本から判定できない状態になっている。

### 1.2 問題点・課題

- `schema_origin: snake_case_v1` のスキーマ定義が正本（aiworkflow-requirements/references/）に存在しない
- `levels.{N}` のツリー構造（レベル別の閾値・基準）が camelCase 側と異なる設計なのに、意味定義が散逸している
- `average_satisfaction` / `metrics.total_usage_count` など、camelCase 系に対応フィールドがない項目の存在が正本に記述されていない
- 後続タスク（方言統一）の判断材料（どちらを legacy にするか／両立で行くか）が正本側に揃っていない
- dual root（`.claude/` / `.agents/`）両方で mirror 更新する手順も未整備

### 1.3 放置した場合の影響

- Phase 5 の `evals-field-map.md` が「正本根拠なし」のまま残り、監査結果の信頼性が下がる
- 方言統一タスク（後続）で「どちらが正」か判断できず、合意形成コストが増える
- 新規スキルが v1 / v2 どちらで書くべきか判断できず、方言が増殖する
- Consumer（EVALS 消費側）実装が両方言を特殊ケースでハンドリングし続ける負債が固定化する

---

## 2. 何を達成するか（What）

### 2.1 目的

`aiworkflow-requirements` 正本に snake_case v1 系 EVALS スキーマの定義・採用範囲・camelCase v2 系との関係を追記し、後続の方言統一判断と Consumer 実装の根拠を正本化する。

### 2.2 最終ゴール

- snake_case v1 のフィールド定義（`current_level` / `levels.{N}` / `metrics.total_usage_count` / `average_satisfaction` など）が正本に記述されている
- snake_case v1 を採用しているスキル群（skill-creator / aiworkflow-requirements / skill-fixture-runner 系）が正本で明示されている
- camelCase v2 系との関係（代表 / legacy の断定はせず、両立方針で記述）が正本で整理されている
- dual root（`.claude/` / `.agents/`）両方で mirror が同期されている

### 2.3 スコープ

#### 含むもの

- `aiworkflow-requirements/references/` 配下に snake_case v1 スキーマ定義ドキュメントを追記（または既存 EVALS 節への追記）
- フィールド意味定義（`current_level` / `levels.{N}` / `metrics.*` / `average_satisfaction` 等）
- snake_case v1 採用スキル一覧
- camelCase v2 系との関係（両立の旨、断定しない記述スタイル）
- mirror 更新手順（`.claude/` / `.agents/` 両側への反映手順）
- resource-map / topic-map / keywords への索引追加

#### 含まないもの

- 方言統一の判断・実施（後続タスク `task-evals-schema-dialect-unification-001` で扱う）
- 既存 EVALS.json 本体の書き換え
- Consumer 実装の変更
- camelCase v2 側の仕様書き換え（影響箇所の相互リンクのみ）

### 2.4 成果物

| 成果物                            | パス                                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------------------ |
| snake_case v1 仕様追記            | `.claude/skills/aiworkflow-requirements/references/` 配下（既存 EVALS 節 or 新規ファイル） |
| mirror 反映                       | `.agents/skills/aiworkflow-requirements/references/` 配下同等                              |
| resource-map / topic-map 索引追加 | `.claude/skills/aiworkflow-requirements/resource-map.md` 等                                |
| 参照元ドキュメント更新            | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-9/spec-alignment-report.md`      |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-EVALS-CONSUMER-AUDIT-001 Phase 5/9 の成果物が参照可能であること
  - `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md`
  - `docs/30-workflows/evals-consumer-audit-001/outputs/phase-9/spec-alignment-report.md`
- `.claude/skills/skill-creator/EVALS.json` / `.claude/skills/aiworkflow-requirements/EVALS.json` が snake_case v1 の実例として読める状態であること
- `aiworkflow-requirements` スキルの既存 references 構造を把握していること

### 3.2 依存タスク

| タスクID                      | ステータス                               |
| ----------------------------- | ---------------------------------------- |
| TASK-EVALS-CONSUMER-AUDIT-001 | 進行中（本タスクは Phase 9/12 から派生） |

### 3.3 必要な知識

- `aiworkflow-requirements` スキルの正本運用（resource-map / topic-map / keywords / references の関係）
- EVALS.json の構造（snake_case v1 / camelCase v2 両方）
- dual root（`.claude/` / `.agents/`）の mirror ルール
- 方言を断定せず両立させる正本スタイル（「代表 / legacy」と決めつけない記述）

### 3.4 推奨アプローチ

1. **実例収集**: `.claude/skills/skill-creator/EVALS.json` / `.claude/skills/aiworkflow-requirements/EVALS.json` を読み、snake_case v1 の実フィールドをすべて抽出する
2. **採用範囲特定**: Phase 5 `evals-field-map.md` §1.1 の `schema_origin` タグ一覧から snake_case v1 採用スキルを確定
3. **記述方針決定**: camelCase v2 との関係は「両立」スタイルで記述（代表 / legacy を断定しない）
4. **正本追記**: `aiworkflow-requirements/references/` 配下に追記 or 新規ファイル作成
5. **索引更新**: resource-map / topic-map / keywords に検索語を追加（`snake_case` / `current_level` / `levels` など）
6. **mirror 反映**: `.agents/` 側にも同じ内容を反映
7. **相互リンク**: `spec-alignment-report.md` から新設された正本へリンクを張る

### 3.5 参考資料

- `docs/30-workflows/evals-consumer-audit-001/outputs/phase-9/spec-alignment-report.md`（正本整合・不整合一覧）
- `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md` §1.1 `schema_origin` タグ一覧
- `.claude/skills/skill-creator/EVALS.json`（snake_case v1 実例）
- `.claude/skills/aiworkflow-requirements/EVALS.json`（snake_case v1 実例）
- `.claude/skills/skill-fixture-runner/EVALS.json`（snake_case v1 実例）

---

## 4. 苦戦箇所記録

### 4.1 記録1: snake_case v1 の採用範囲が正本で未定義

snake_case v1 は `skill-creator` / `aiworkflow-requirements` / `skill-fixture-runner` 系のみで使用されているが、`aiworkflow-requirements/references/` には camelCase v2 系前提の記述しか残っておらず、「どのスキルが snake_case v1 を採用しているのか」を正本から特定できない。そのため後続タスクで方言統一を検討するときに、「現状の分布」を正本ではなく EVALS.json の grep に頼る必要があり、合意形成の根拠が脆弱になる。

**対処方針**: Phase 5 `evals-field-map.md` §1.1 の `schema_origin: snake_case_v1` タグ付きスキル一覧を正本に写像し、採用スキル名を列挙する節を設ける。

### 4.2 記録2: `levels.{N}` ツリー構造・`average_satisfaction` など camelCase 系に対応フィールドがない

snake_case v1 には `levels.{1..4}` のようなレベル別ツリー構造や、`average_satisfaction` / `metrics.total_usage_count` など camelCase v2 系に直接対応フィールドが存在しない項目がある。camelCase v2 系の仕様ドキュメントだけを読んでも、これらのフィールドの意味は復元できない。単に「フィールド名を列挙する」だけでなく、**各フィールドが何を測定するのか・どう集計するのか・どの Consumer が読むのか**まで意味定義しなければ、正本としての価値が生まれない。

**対処方針**: `current_level` / `levels.{N}` / `metrics.total_usage_count` / `average_satisfaction` 各項目について、以下 4 観点で記述する。

- 意味（何を表すか）
- 値域・型
- 算出元 / 更新タイミング
- 想定 Consumer

### 4.3 記録3: camelCase v2 系との関係を断定せず両立させる必要

snake_case v1 / camelCase v2 のどちらが「代表」でどちらが「legacy」かは、**本タスクでは決定しない**（決定は後続の `task-evals-schema-dialect-unification-001` の責務）。しかし正本に書くときに、ついどちらかを「推奨」「レガシー」と記述したくなる。これを断定的に書いてしまうと、後続タスクの意思決定に先入観を与え、統一議論の公平性を損なう。

**対処方針**: 正本では「両方言が現時点で並存している」「採用範囲は以下の通り」「統一判断は別タスク（task-evals-schema-dialect-unification-001）に委ねる」という中立的な記述に徹する。優劣判断は一切書かない。

### 4.4 記録4: dual root（`.claude/` / `.agents/`）の mirror 同期

`aiworkflow-requirements` スキルは `.claude/` と `.agents/` の 2 root に同一内容を mirror する運用になっており、正本追記時もこの対称性を崩してはいけない。片側だけ更新すると、実行環境によって参照先の内容が食い違い、正本運用が破綻する。さらに `.claude/` と `.agents/` の差分を検査する既存ツール（mirror 検査）が存在するため、手順を飛ばすとエラーが後段で顕在化する。

**対処方針**: 追記対象ファイルの更新と同じ commit 内で、両 root 双方に同一内容を反映する。完了確認時に `.claude/` と `.agents/` の該当ファイルを diff し、差分ゼロを確認する手順を完了条件に含める。

---

## 5. 完了条件

- [ ] `aiworkflow-requirements/references/` 配下に snake_case v1 スキーマ定義が追記されている
- [ ] `current_level` / `levels.{N}` / `metrics.total_usage_count` / `average_satisfaction` など主要フィールドが意味・値域・算出元・想定 Consumer の 4 観点で記述されている
- [ ] snake_case v1 採用スキル一覧（skill-creator / aiworkflow-requirements / skill-fixture-runner 系）が正本で明示されている
- [ ] camelCase v2 系との関係が「両立・優劣判断は後続タスクに委ねる」スタイルで記述されている
- [ ] resource-map / topic-map / keywords に snake_case v1 関連の索引が追加されている
- [ ] `.claude/` と `.agents/` 両 root で同一内容が mirror されている（diff ゼロ確認済み）
- [ ] `spec-alignment-report.md` から新設正本へのリンクが張られている
- [ ] 後続タスク `task-evals-schema-dialect-unification-001` が本タスクの成果物を前提として実行可能になっている

---

## 完了記録

- **完了ステータス**: completed
- **完了日**: 2026-04-19
- **完了方法**: aiworkflow-requirements skill への反映（UPDATE-SPEC-001）
- **実装場所**:
  - `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md` §3（snake_case v1 スキーマ定義）
  - `.agents/skills/aiworkflow-requirements/references/evals-schema-spec.md` §3（dual-root mirror）
- **完了の根拠**: TASK-EVALS-CONSUMER-AUDIT-001 Phase-12 close-out に続く skill 反映 wave（TASK-EVALS-CONSUMER-AUDIT-001-SKILL-REFLECT-WAVE）で UPDATE-SPEC-001 として実装完了
- **関連**: `docs/30-workflows/evals-consumer-audit-001/outputs/phase-12/system-spec-update-summary.md` UPDATE-SPEC-001
- **後続タスクへの影響**: `task-evals-schema-dialect-unification-001` は本タスク完了により実行可能状態に遷移（ただし方言統一自体は将来の設計判断が必要なため未実施のまま保持）
