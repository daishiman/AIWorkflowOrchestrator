# SkillCreator resource-map cross-root link 解消 - タスク指示書

## メタ情報

```yaml
issue_number: null
task_id: UNASSIGNED-EVALS-MIRROR-RESOURCE-MAP-CROSS-ROOT-LINK-001
task_name: SkillCreator resource-map cross-root link 解消
category: 改善
target_feature: .agents / .claude mirror（skill-creator references）
priority: 低
scale: 小規模
status: 未実施
source_phase: TASK-EVALS-CONSUMER-AUDIT-001 Phase 5/12
created_date: 2026-04-19
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-mirror-resource-map-cross-root-link-001.md
```

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| タスクID     | UNASSIGNED-EVALS-MIRROR-RESOURCE-MAP-CROSS-ROOT-LINK-001 |
| タスク名     | SkillCreator resource-map cross-root link 解消           |
| 分類         | 改善                                                     |
| 対象機能     | .agents / .claude mirror（skill-creator references）     |
| 優先度       | 低                                                       |
| 見積もり規模 | 小規模                                                   |
| ステータス   | 未実施                                                   |
| 発見元       | TASK-EVALS-CONSUMER-AUDIT-001 Phase 5/12                 |
| 発見日       | 2026-04-19                                               |
| 関連タスク   | 独立                                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

skill-creator スキルは `.agents/skills/skill-creator/` と `.claude/skills/skill-creator/` の双方に mirror され、
dual root 運用（両 root を同一 commit で bit-for-bit 同期）で維持されている。
`.agents/skills/skill-creator/references/resource-map.md:229` には `.claude/...` への片方向参照が残っており、
Phase 5/12 consumer audit（`docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md` §8 未タスク候補 #3）で検出された。

### 1.2 問題点・課題

- `.agents` 側が `.claude` 側の存在を前提にしており、mirror の独立性が崩れている
- 片方の root だけを利用する consumer（例：`.claude` を配布しない運用）で参照がリンク切れになり得る
- 同様の cross-root link が他スキルにも潜在している可能性があり、単純な文字列置換では漏れる

### 1.3 放置した場合の影響

- mirror sync 時に「どちらが正か」が不明瞭になり、dual-root-parity 崩壊のリスクが残る
- 将来別コンシューマーが `.agents` 単体で skill-creator を利用するとき、参照が辿れず実害が出る
- consumer audit の未タスク候補として永続的に積み残り、後続監査のノイズになる

---

## 2. 何を達成するか（What）

### 2.1 目的

`.agents/skills/skill-creator/references/resource-map.md` の `.claude` 絶対参照を相対パスもしくは root 非依存な参照へ置換し、
mirror の片方向依存を解消する。

### 2.2 最終ゴール

- `resource-map.md:229` の cross-root link が root 非依存な表現になっている
- skill-creator 全体で同種の残存参照がゼロになっている
- `.agents` と `.claude` の dual-root-parity が修正後も維持されている

### 2.3 スコープ

#### 含むもの

- `.agents/skills/skill-creator/references/resource-map.md` の該当行の修正
- `.claude/skills/skill-creator/references/resource-map.md` の対応修正（dual root 同期）
- skill-creator 配下（references / agents / scripts 含む）の cross-root link grep 洗い出し
- 書式統一（同一 skill 内参照 / 両 root 横断参照 の表記ルール）

#### 含まないもの

- 他スキルの resource-map 監査（別タスク化推奨）
- skill-creator の機能・スクリプトのロジック変更
- mirror sync 方針そのものの見直し

### 2.4 成果物

| 成果物                        | パス                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------- |
| 修正後 resource-map（agents） | `.agents/skills/skill-creator/references/resource-map.md`                             |
| 修正後 resource-map（claude） | `.claude/skills/skill-creator/references/resource-map.md`                             |
| 参照根拠レポート              | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md` |
| dual root 一致確認            | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/dual-root-parity.md`      |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- 現在の skill-creator が typecheck / test を通過していること
- `.agents` と `.claude` の skill-creator 配下が dual-root-parity.md 時点で一致していること
- consumer-audit-report.md の §8 未タスク候補 #3 の指摘内容を読了していること

### 3.2 依存タスク

| タスクID | ステータス |
| -------- | ---------- |
| （独立） | -          |

### 3.3 必要な知識

- skill-creator mirror 運用（`.agents` ↔ `.claude` の同期方針）
- Markdown 相対パス記法（`./` / `../` の使い分け）
- `grep -n` による横断的検索と dual root 比較

### 3.4 推奨アプローチ

1. `resource-map.md:229` を含む該当行を Read で確認し、リンク先の実ファイル所在を把握
2. skill-creator 配下を `\.claude/` および `\.agents/` 絶対参照で grep し、同種 cross-root link を列挙
3. 同一 skill 内参照は skill ルート起点の相対パス、両 root 横断参照は root 非依存な説明に書き換える書式ルールを先に決定
4. 両 root を同じ差分で更新し、bit-for-bit 一致を `diff -r` で確認
5. dual-root-parity.md の手順に沿って検証、必要ならレポートを更新

---

## 4. 苦戦箇所記録

### 4.1 記録1: `.agents` から `.claude` への片方向絶対参照

mirror 独立性の前提が崩れるため、単なる書き換えでなく「どちら root でも成立する」表現が必要。

**対処方針**: skill 内部参照は skill ルート起点の相対パスにし、どうしても他 root を指す必要がある場合は
「両 root に同一ファイルが存在する」という注記付きで root 非依存な記述にする。

### 4.2 記録2: 同系統参照が他スキルに潜む可能性

該当 1 行だけ直しても、他の references / agents / scripts に同型の link が残ると再発する。

**対処方針**: `.claude/` および `.agents/` のパスリテラルを正規表現で grep し、skill-creator 配下の残存を
完全列挙してから修正する。単純な文字列置換は避け、1 件ずつ意図を確認する。

### 4.3 記録3: dual root の bit-for-bit 一致維持

修正後に `.agents` 側と `.claude` 側が同一である必要があるが、相対パス表現にすると root 名が異なっても
ファイル内容は同じであるべきという制約が発生する。

**対処方針**: 両ファイルに同一テキストを書き込む。どちら root から読んでも成立する記述のみ採用し、
`diff -r .agents/skills/skill-creator .claude/skills/skill-creator` で差分ゼロを確認する。

### 4.4 記録4: 参照書式の統一

resource-map.md は複数の参照リンクを含むため、同一 skill 内参照と両 root 横断参照とで書式が混在すると読者が混乱する。

**対処方針**: 修正時に resource-map.md 全体をレビューし、参照書式のルール（例：同一 skill 内は `./references/...`、
横断は文章で説明）を冒頭コメントに明文化して統一する。

---

## 5. 完了条件

- [ ] `.agents/skills/skill-creator/references/resource-map.md:229` の cross-root link が解消されている
- [ ] `.claude/skills/skill-creator/references/resource-map.md` にも同内容の修正が反映されている
- [ ] skill-creator 配下を `.claude/` / `.agents/` で grep しても新規の cross-root link が存在しない
- [ ] `diff -r .agents/skills/skill-creator .claude/skills/skill-creator` が差分ゼロ（または既知差分のみ）
- [ ] dual-root-parity.md の一致確認手順で OK となっている
- [ ] consumer-audit-report.md §8 未タスク候補 #3 に「解消」記載ができる状態になっている
