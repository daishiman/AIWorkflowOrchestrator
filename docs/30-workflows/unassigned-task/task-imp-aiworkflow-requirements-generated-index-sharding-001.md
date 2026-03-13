# TASK-IMP-AIWORKFLOW-REQUIREMENTS-GENERATED-INDEX-SHARDING-001 - タスク指示書

## メタ情報

```yaml
issue_number: 1195
task_id: TASK-IMP-AIWORKFLOW-REQUIREMENTS-GENERATED-INDEX-SHARDING-001
task_name: generated topic-map の generator-aware sharding / summary index 化
category: 改善
target_feature: .claude/skills/aiworkflow-requirements/indexes/topic-map.md
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001 Phase 12
created_date: 2026-03-13
```

| 項目         | 内容                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| タスクID     | `TASK-IMP-AIWORKFLOW-REQUIREMENTS-GENERATED-INDEX-SHARDING-001`             |
| タスク名     | generated `topic-map.md` の generator-aware sharding / summary index 化     |
| 分類         | 改善                                                                        |
| 対象機能     | `aiworkflow-requirements` の generated discovery index                      |
| 優先度       | 中                                                                          |
| 見積もり規模 | 中規模                                                                      |
| ステータス   | 未実施                                                                      |
| 発見元       | `TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001` Phase 9 / 10 / 12 |
| 発見日       | 2026-03-13                                                                  |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`aiworkflow-requirements` の line budget reform により manual docs 34件の 500行超は解消した。一方で generated artifact である `indexes/topic-map.md` は `generate-index.js` 再生成後も 500行超のままで、manual docs とは別レイヤーの課題として残った。

### 1.2 問題点・課題

- `topic-map.md` は再生成のたびに 500 行基準を大きく超える
- manual docs reform 側では generator 出力を恒久修正できない
- `resource-map.md` / `quick-reference.md` / `keywords.json` との discovery contract を壊さずに分割する必要がある

### 1.3 放置した場合の影響

- generated artifact だけが line budget 例外として残り続ける
- `topic-map.md` の閲覧性が悪く、検索・参照コストが高止まりする
- manual docs と generated docs の合否境界が曖昧になり、Phase 12 監査で誤判定を招く

## 2. 何を達成するか（What）

### 2.1 目的

generated `topic-map.md` を generator-aware に再設計し、再生成だけで parent index と shard 群が整合する状態を作る。

### 2.2 最終ゴール

1. `topic-map.md` が 500行以下、または parent + shard 構成へ再設計される
2. `generate-index.js` 実行だけで parent / shard / `keywords.json` が一貫再生成される
3. `validate-structure.js`、raw `wc -l`、Phase 12 documentation が同じ説明で閉じる

### 2.3 スコープ

#### 含むもの

- `.claude/skills/aiworkflow-requirements/scripts/generate-index.js`
- `.claude/skills/aiworkflow-requirements/indexes/topic-map*.md`
- `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`
- `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`
- `.claude/skills/aiworkflow-requirements/indexes/keywords.json`
- `.agents/skills/aiworkflow-requirements/` mirror 同期

#### 含まないもの

- manual docs 34件の再分割
- Phase 11 screenshot evidence の再取得
- 他 skill の unrelated generated artifact 修正

### 2.4 成果物

- generator 更新差分
- shard 化された `topic-map` parent / child ファイル
- 生成手順と検証手順を含む workflow outputs
- 必要に応じた system spec / backlog / lessons 更新

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001` の manual docs reform が完了済みである
- `generate-index.js`、`validate-structure.js`、`verify-all-specs.js` を実行できる
- `.claude` を canonical root、`.agents` を mirror として扱う

### 3.2 依存タスク

- 親タスク: `TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001`
- 参照 backlog: `task-imp-unassigned-task-format-normalization-001.md`
- 参照 backlog: `task-imp-unassigned-task-legacy-normalization-001.md`
- 参照 backlog: `task-imp-phase12-unassigned-baseline-remediation-002.md`

### 3.3 必要な知識

- `aiworkflow-requirements` の discovery index 構造
- `task-specification-creator` の Phase 12 current / baseline 分離ルール
- mirror parity と generated artifact 再生成の運用

### 3.4 推奨アプローチ

1. まず現行 `topic-map.md` のセクション密度と分割単位を分析する
2. `generate-index.js` 側に parent + shard を出力する責務を追加する
3. `resource-map.md` / `quick-reference.md` / `keywords.json` の discovery contract を維持する
4. 最後に `validate-structure.js`、`verify-all-specs.js`、`diff -qr` で再検証する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                                            | 発見経緯                                                                                                         | 解決策                                                                        | 教訓                                                                   |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `current` と `baseline` の読み分けが崩れやすい                                  | Phase 12 再監査で `current=0` でも baseline backlog が残った                                                     | 合否は `currentViolations`、repo 全体健全性は `baselineViolations` と分離する | generated index follow-up も「今回差分」と「既存負債」を別軸で記録する |
| `verify-unassigned-links` が split parent だけでは backlog shard を拾えなかった | `task-workflow.md` 親ファイルは child index だけを持ち、未タスクリンクは `task-workflow-backlog.md` に残っていた | 親 `task-workflow.md` 指定時は sibling `task-workflow*.md` を一括走査する     | split 後の ledger 監査は parent entrypoint 基準で sibling aware にする |
| summary-only の compliance 記録では実装ガイド品質漏れを見逃す                   | `implementation-guide.md` に型/API/設定が足りなくても浅い PASS 表では閉じられた                                  | root evidence に Part 1 / Part 2 / 10見出し / current/baseline を固定する     | Phase 12 は「成果物あり」ではなく「証跡密度あり」で完了判定する        |

### 3.6 SubAgent 分担（関心ごとの分離）

| SubAgent   | 担当関心         | 主担当作業                                                      | 依存       |
| ---------- | ---------------- | --------------------------------------------------------------- | ---------- |
| SubAgent-A | generator 設計   | `generate-index.js` の出力モデル設計                            | なし       |
| SubAgent-B | index 生成物     | `topic-map` parent / shard の生成確認                           | A 後       |
| SubAgent-C | discovery 契約   | `resource-map` / `quick-reference` / `keywords.json` の整合確認 | A と並列可 |
| SubAgent-D | system spec 同期 | `task-workflow` / `lessons-learned` / outputs 更新              | B/C 後     |
| SubAgent-E | 検証             | `validate-structure.js` / `verify-all-specs.js` / parity 実行   | D 後       |

## 4. 実行手順

### Phase構成

- Phase A: 現行 generated index の棚卸し
- Phase B: generator-aware 設計と実装
- Phase C: discovery contract の整合確認
- Phase D: system spec と workflow 反映
- Phase E: 検証と close-out

### Phase A: 現行 generated index の棚卸し

#### 目的

再生成後にどの単位で肥大化しているかを把握する。

#### 手順

1. `wc -l` と見出し抽出で `topic-map.md` の密度を調べる
2. parent / shard の候補単位を整理する
3. `resource-map.md` / `quick-reference.md` / `keywords.json` の依存関係を確認する

#### 成果物

- 現行構造の棚卸しメモ

#### 完了条件

- shard 単位の候補が説明可能になっている

### Phase B: generator-aware 設計と実装

#### 目的

再生成だけで line budget を守れる構造を作る。

#### 手順

1. `generate-index.js` に parent + shard 出力ロジックを実装する
2. `topic-map.md` を summary index として軽量化する
3. child shard へのリンクと back link を付与する

#### 成果物

- generator 更新差分
- `topic-map` parent / child

#### 完了条件

- 再生成後も parent / child 構成が壊れない

### Phase C: discovery contract の整合確認

#### 目的

既存 discovery 導線を維持する。

#### 手順

1. `resource-map.md` と `quick-reference.md` の参照先を確認する
2. `keywords.json` が shard 後も検索起点として使えるか確認する
3. 必要なら generated index の説明文を更新する

#### 成果物

- discovery contract 確認ログ

#### 完了条件

- 入口導線が旧構造と同等以上に保たれる

### Phase D: system spec と workflow 反映

#### 目的

実装結果を台帳と教訓へ残す。

#### 手順

1. `task-workflow.md` に結果と残課題を同期する
2. `lessons-learned.md` に苦戦箇所と簡潔解決手順を記録する
3. workflow `outputs/phase-12/` と `documentation-changelog` を更新する

#### 成果物

- 更新済み system spec
- 更新済み workflow outputs

#### 完了条件

- 実装内容と検証値が outputs と system spec で一致する

### Phase E: 検証と close-out

#### 目的

再発しない状態で完了判定する。

#### 手順

1. `validate-structure.js` を実行する
2. `verify-all-specs.js` と `validate-phase-output.js` を実行する
3. `.claude` / `.agents` parity を確認する
4. 必要なら follow-up backlog を更新する

#### 成果物

- 検証ログ
- close-out summary

#### 完了条件

- generated index の line budget と mirror parity が説明可能な状態になる

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `generate-index.js` だけで `topic-map` parent / shard が再生成される
- [ ] `topic-map` 系の構造が 500行基準に対して説明可能である
- [ ] `resource-map.md` / `quick-reference.md` / `keywords.json` の discovery contract が維持される

### 品質要件

- [ ] `validate-structure.js` が PASS する
- [ ] `verify-all-specs.js` が PASS する
- [ ] `.claude` / `.agents` parity が 0 差分である
- [ ] generated artifact の合否境界が manual docs gate と混同されていない

### ドキュメント要件

- [ ] `task-workflow.md` に結果と残課題が記録されている
- [ ] `lessons-learned.md` に苦戦箇所と 5分解決カードが記録されている
- [ ] workflow `outputs/phase-12/` が最終状態へ同期されている

## 6. 検証方法

### テストケース

| テストケース                                                                             | 期待値                                      |
| ---------------------------------------------------------------------------------------- | ------------------------------------------- |
| `generate-index.js` 再生成                                                               | `topic-map` parent / shard が再生成される   |
| `wc -l indexes/topic-map*.md`                                                            | parent / shard の行数が説明可能な範囲にある |
| `verify-all-specs.js --workflow ...`                                                     | workflow が PASS する                       |
| `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements` | 差分 0                                      |

### 検証手順

1. `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`
2. `node .claude/skills/aiworkflow-requirements/scripts/validate-structure.js .claude/skills/aiworkflow-requirements`
3. `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform`
4. `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements`

## 7. リスクと対策

| リスク                          | 影響度 | 発生確率 | 対策                                             |
| ------------------------------- | ------ | -------- | ------------------------------------------------ |
| shard 粒度が粗く再び肥大化する  | 中     | 中       | 見出し密度を測ってから分割単位を決める           |
| `keywords.json` 契約が崩れる    | 高     | 低       | 再生成後に discovery 導線を確認する              |
| mirror 同期漏れが起きる         | 中     | 中       | canonical root 更新後に parity を必ず実行する    |
| system spec が outputs とずれる | 高     | 中       | close-out 前に root evidence 1ファイルへ集約する |

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-12/implementation-guide.md`
- `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-12/phase12-task-spec-compliance-check.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`

### 参考資料

- `.claude/skills/aiworkflow-requirements/scripts/generate-index.js`
- `.claude/skills/aiworkflow-requirements/scripts/validate-structure.js`
- `.claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
generated artifact (`topic-map.md`) は manual docs gate と別レイヤーで扱い、
generator-aware な恒久対応を follow-up へ切り出すこと。
```

### 補足事項

- 親タスクでは docs-only scope を守るため generator 自体は変更しなかった
- 本未タスクは generated artifact 専用の恒久対策であり、manual docs reform の完了状態を巻き戻さない
