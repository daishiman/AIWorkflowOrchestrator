# UT-IMP-AIWORKFLOW-SKILL-ENTRYPOINT-COVERAGE-GUARD-001: aiworkflow-requirements 入口導線・validator整合ガード

## メタ情報

```yaml
issue_number: 1151
task_id: UT-IMP-AIWORKFLOW-SKILL-ENTRYPOINT-COVERAGE-GUARD-001
task_name: aiworkflow-requirements 入口導線・validator整合ガード
category: 改善
target_feature: aiworkflow-requirements の SKILL.md / indexes/quick-reference.md / indexes/resource-map.md と quick_validate の整合
priority: 中
scale: 中規模
status: 未実施
source_phase: UT-TASK-10A-B-008 Phase 12 追補4-5（system spec 再同期・2026-03-06）
created_date: 2026-03-06
spec_path: docs/30-workflows/unassigned-task/task-imp-aiworkflow-skill-entrypoint-coverage-guard-001.md
related_tasks:
  - UT-TASK-10A-B-008
  - UT-IMP-SKILL-QUICK-VALIDATE-WARNING-BASELINE-CONTROL-001
```

| 項目         | 内容                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-AIWORKFLOW-SKILL-ENTRYPOINT-COVERAGE-GUARD-001                                                         |
| タスク名     | aiworkflow-requirements 入口導線・validator整合ガード                                                         |
| 分類         | 改善                                                                                                          |
| 対象機能     | `aiworkflow-requirements` の入口設計（`SKILL.md` / `indexes/quick-reference.md` / `indexes/resource-map.md`） |
| 優先度       | 中                                                                                                            |
| 見積もり規模 | 中規模                                                                                                        |
| ステータス   | 未実施                                                                                                        |
| 発見元       | UT-TASK-10A-B-008 Phase 12 追補4-5（system spec 再同期・2026-03-06）                                          |
| 発見日       | 2026-03-06                                                                                                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`skill-creator` は `SKILL.md` の直接参照導線を再編して `quick_validate` warning を 26 件から 0 件へ解消できた。一方で `aiworkflow-requirements` は `references/` 配下に約 150 ファイルを持つ大規模仕様スキルのため、同じ手法をそのまま適用すると `SKILL.md` の可読性と 500 行制限を壊しやすい状態が残っている。

### 1.2 問題点・課題

- `quick_validate.js` は `references/*.md` の文字列が `SKILL.md` に直接含まれるかだけを見ており、`indexes/quick-reference.md` や `indexes/resource-map.md` を入口として使う設計を評価できない。
- `aiworkflow-requirements` では `quick_validate` 実行時に warning が 145 件残り、実際の新規異常と既知の入口設計問題が混ざって見える。
- warning を消すために全 reference を `SKILL.md` に直列挙すると、Progressive Disclosure と line budget の両方に反し、日常運用がむしろ悪化する。

### 1.3 放置した場合の影響

- system spec スキルだけ warning 常態化が残り、品質ゲートの意味が弱くなる。
- 仕様更新時に「どこから読めばよいか」が人依存になり、参照漏れや更新漏れが再発する。
- `warning は多いが既知だから良い` という運用が固定化し、将来の本当の異常を見落としやすくなる。

---

## 2. 何を達成するか（What）

### 2.1 目的

`aiworkflow-requirements` に対して、簡潔な入口導線と validator の判定基準を両立させる運用を定義し、未管理 warning を残さない状態にする。

### 2.2 最終ゴール

1. `aiworkflow-requirements` の入口が `SKILL.md` / `indexes/quick-reference.md` / `indexes/resource-map.md` の三層で定義され、役割分担が明文化されている。
2. `quick_validate` が大規模仕様スキルに対して deterministic に判定できる。
   - 目標A: warning 0 で通る構造へ再設計する
   - 目標B: 0 が不適切なら、許容される索引経由リンクを機械判定できる
3. `aiworkflow-requirements` の warning 残件が「未対応設計問題」ではなく、明示的な運用ルールまたは検証ロジックで説明できる状態になる。

### 2.3 スコープ

#### 含むもの

- `quick_validate` の warning 145 件の棚卸しとカテゴリ分解
- `aiworkflow-requirements` の入口導線設計（`SKILL.md` / `indexes/quick-reference.md` / `indexes/resource-map.md`）
- 必要であれば `quick_validate.js` の大規模仕様スキル向け判定改善
- `task-workflow.md` / `lessons-learned.md` / `LOGS.md` / `SKILL.md` への同期

#### 含まないもの

- `aiworkflow-requirements/references/` 全150ファイルの内容更新
- 他スキルの warning 全件削減
- `quick_validate` の unrelated な検証項目変更

### 2.4 成果物

- 本未タスク指示書
- 入口導線設計の更新差分（`SKILL.md` / `indexes/quick-reference.md` / `indexes/resource-map.md`）
- 必要時の validator 更新差分（`skill-creator/scripts/quick_validate.js` とテスト）
- warning 解消または許容根拠を示す検証ログ

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements` が再現実行できること
- `aiworkflow-requirements` の `indexes/quick-reference.md` / `indexes/resource-map.md` / `indexes/topic-map.md` の役割を理解していること
- `skill-creator/scripts/quick_validate.js` の現行仕様（`SKILL.md` への直接リンク検査）を確認済みであること

### 3.2 依存タスク

- 依存なし
- ただし `UT-IMP-SKILL-QUICK-VALIDATE-WARNING-BASELINE-CONTROL-001` とは責務が近いため、並走時は「baseline管理」と「入口設計改善」を混同しないこと

### 3.3 必要な知識

- Progressive Disclosure の設計原則
- `quick_validate.js` の warning 判定ロジック
- `aiworkflow-requirements` の索引構造（`quick-reference` / `resource-map` / `topic-map`）
- system spec 更新時の `generate-index.js` 運用

### 3.4 推奨アプローチ

1. まず warning を「本当に `SKILL.md` へ直リンクが必要なもの」と「索引経由で十分なもの」に分ける。
2. 次に `SKILL.md` の責務を「最短導線」、`quick-reference.md` を「主要入口」、`resource-map.md` を「条件付き詳細台帳」として再定義する。
3. そのうえで、docs-only で解けるか、validator 側に索引経由ルールを追加すべきかを比較し、行数制限と可読性を壊さない方を採用する。
4. 最後に warning の扱いを `task-workflow` / `lessons` / `LOGS` へ同一ターンで記録する。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                                                                                 | 発見経緯                                                                                                                     | 解決策                                                             | 教訓                                                                                   |
| -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `skill-creator` では 26 warning を導線再編だけで解消できたが、`aiworkflow-requirements` では同手法をそのまま使えない | UT-TASK-10A-B-008 追補4で `skill-creator` を warning 0 にした後、`aiworkflow-requirements` は 145 warning が残ることを再確認 | 大規模仕様スキル用に「入口三層 + validator整合」の別戦略を切り出す | 同じ warning でも、スキル規模が違えば解法を分ける必要がある                            |
| `quick_validate.js` が `SKILL.md` 内の直接文字列だけを見ている                                                       | `skill-creator/scripts/quick_validate.js` を確認すると `content.includes(\"references/<file>\")` だけで warning 判定していた | docs 設計だけで解けない場合は validator に索引経由ルールを追加する | validator の前提を見ずに文書だけ調整すると再発する                                     |
| warning を消すために reference を全列挙すると 500 行制限と可読性を壊す                                               | `aiworkflow-requirements` は 150 reference を持ち、`SKILL.md` に全件直列挙すると日常運用の入口として機能しなくなる           | 入口を domain 単位に再編し、詳細は index へ落とす設計に固定する    | warning 0 だけを追うと Progressive Disclosure を壊すので、品質軸を両立させる設計が必要 |

---

## 4. 実行手順

### Phase構成

- Phase A: warning 棚卸し
- Phase B: 入口導線設計の比較
- Phase C: docs / validator の実装
- Phase D: system spec 同期と検証

### Phase A: warning 棚卸し

#### 目的

warning 145 件の内訳を把握し、入口設計の問題だけを抽出する。

#### 手順

1. `quick_validate` を実行し、warning の対象 reference 一覧を採取する。
2. warning をカテゴリ（architecture / interfaces / api / ui-ux / security / workflow / quality など）に分類する。
3. 各カテゴリについて「SKILL 直入口が必要か」「index 経由で十分か」を判定する。

#### 成果物

- warning 分類表
- 入口必要度マトリクス

#### 完了条件

- 145 warning の内訳が domain 単位で整理されている。

### Phase B: 入口導線設計の比較

#### 目的

docs-only と validator 改善のどちらが適切かを決める。

#### 手順

1. docs-only 案を作る。
   - `SKILL.md` に domain 別入口を置く
   - `indexes/quick-reference.md` に主要参照先を整理する
   - `indexes/resource-map.md` に条件付き詳細を残す
2. validator 改善案を作る。
   - 索引経由リンクを許容するルール
   - allowlist / manifest / domain map の候補を比較
3. 行数、可読性、検証容易性の3軸で採用案を決定する。

#### 成果物

- 入口設計比較メモ
- 採用方針

#### 完了条件

- 「なぜその案を採用するか」が 3 軸で説明できる。

### Phase C: docs / validator の実装

#### 目的

採用方針をコードと文書へ反映する。

#### 手順

1. 採用方針に基づき `aiworkflow-requirements/SKILL.md` と index 群を更新する。
2. 必要なら `skill-creator/scripts/quick_validate.js` とそのテストを更新する。
3. `aiworkflow-requirements/SKILL.md` が 500 行以内であることを確認する。

#### 成果物

- 更新済み `SKILL.md`
- 更新済み index 群
- 必要時の validator 差分とテスト

#### 完了条件

- 入口設計が文書化され、validator と矛盾しない。

### Phase D: system spec 同期と検証

#### 目的

変更を正本仕様へ固定し、未管理 warning を残さない。

#### 手順

1. `task-workflow.md` / `lessons-learned.md` / `SKILL.md` / `LOGS.md` を同一ターンで同期する。
2. `generate-index.js` を実行して index を再生成する。
3. `quick_validate` / `verify-unassigned-links` / `audit-unassigned-tasks` を実行する。
4. warning が残る場合は「許容根拠あり」か「別未タスク化すべきか」を明確に記録する。

#### 成果物

- 同期済み system spec
- 検証ログ

#### 完了条件

- `aiworkflow-requirements` の warning が未管理状態で残っていない。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `aiworkflow-requirements` の入口三層（`SKILL.md` / `quick-reference.md` / `resource-map.md`）の役割が定義されている
- [ ] docs-only か validator 改善かの採用方針が固定されている
- [ ] `quick_validate` の warning が未管理のまま放置されていない

### 品質要件

- [ ] `SKILL.md` が 500 行以内を維持している
- [ ] warning 判定の根拠が再現できる
- [ ] `Progressive Disclosure` を壊す全列挙方式を採用していない

### ドキュメント要件

- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` に存在する
- [ ] `task-workflow.md` 残課題テーブルへ登録済み
- [ ] `lessons-learned.md` に苦戦箇所と関連未タスクが追記されている
- [ ] `aiworkflow-requirements/SKILL.md` と `LOGS.md` に運用方針が反映されている

---

## 6. 検証方法

### テストケース

- Case 1: docs-only 案で warning が 0 になる、または許容範囲が機械判定できる
- Case 2: validator 改善案で `aiworkflow-requirements` は減警告、他スキルの挙動は維持される
- Case 3: `SKILL.md` の行数と入口可読性が維持される

### 検証手順

```bash
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/unassigned-task/task-imp-aiworkflow-skill-entrypoint-coverage-guard-001.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

---

## 7. リスクと対策

| リスク                                                  | 影響度 | 発生確率 | 対策                                                                            |
| ------------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------- |
| `SKILL.md` に reference を足しすぎて 500 行制限を超える | 高     | 中       | domain 単位の入口に限定し、詳細は index 側へ逃がす                              |
| validator 改善が他スキルに副作用を出す                  | 高     | 低       | `aiworkflow-requirements` 用の条件を明示し、回帰テストを追加する                |
| baseline 管理だけで warning を温存してしまう            | 中     | 中       | 「warning の説明」と「warning の解消計画」を別管理し、未管理 warning を残さない |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/SKILL.md`
- `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`
- `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`

### 参考資料

- `.claude/skills/skill-creator/scripts/quick_validate.js`
- `docs/30-workflows/unassigned-task/task-imp-skill-quick-validate-warning-baseline-control-001.md`
- `docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard/outputs/phase-12/spec-update-summary.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
skill-creator は direct link 導線の再編で warning 0 にできたが、
aiworkflow-requirements は同じ解き方をそのまま当てると SKILL.md が巨大化する。
Progressive Disclosure を壊さずに quick_validate と整合する入口設計が必要。
```

### 補足事項

- 本タスクは `warning 145件を全部 SKILL.md に直列挙する` ことが目的ではない。
- 「入口設計の簡潔さ」と「validator の機械判定性」を両立させることを最終目的とする。
