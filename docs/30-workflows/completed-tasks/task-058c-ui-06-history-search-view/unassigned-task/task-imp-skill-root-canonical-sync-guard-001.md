---
task_id: UT-IMP-SKILL-ROOT-CANONICAL-SYNC-GUARD-001
task_name: `.claude` 正本と `.agents` mirror のドリフトを検知し canonical root を固定する
category: 改善
target_feature: スキル仕様同期 / Phase 12 system spec 更新運用
priority: 中
scale: 小規模
status: 未実施
source_phase: Phase 12
created_date: 2026-03-10
dependencies: []
issue_number: 1147
---

# `.claude` 正本と `.agents` mirror のドリフトを検知し canonical root を固定する - タスク指示書

## メタ情報

| 項目         | 内容                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| タスクID     | UT-IMP-SKILL-ROOT-CANONICAL-SYNC-GUARD-001                                     |
| タスク名     | `.claude` 正本と `.agents` mirror のドリフトを検知し canonical root を固定する |
| 分類         | 改善                                                                           |
| 対象機能     | スキル仕様同期 / Phase 12 system spec 更新運用                                 |
| 優先度       | 中                                                                             |
| 見積もり規模 | 小規模（2-4時間）                                                              |
| ステータス   | 未実施                                                                         |
| 発見元       | TASK-UI-06-HISTORY-SEARCH-VIEW Phase 12                                        |
| 発見日       | 2026-03-10                                                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-UI-06-HISTORY-SEARCH-VIEW` の Phase 12 再監査で、ユーザーが指定した正本は `.claude/skills/aiworkflow-requirements/` なのに、workflow 本文や `spec-update-summary.md` が `.agents/skills/aiworkflow-requirements/` を更新先として参照していた。

同時に、`.claude` と `.agents` は inode 共有ではなく別実体であり、内容差分も存在していた。そのため「mirror 側だけ更新して正本更新済みと誤認する」リスクがある。

### 1.2 問題点・課題

| ID  | 問題                                                                        | 影響                                     |
| --- | --------------------------------------------------------------------------- | ---------------------------------------- |
| P1  | system spec 更新先が `.claude` と `.agents` で混線する                      | 正本未更新のまま Phase 12 完了扱いになる |
| P2  | workflow/outputs に mirror 側パスが残る                                     | 後続監査で「どちらが正本か」が読めない   |
| P3  | skill-creator / task-specification-creator に canonical root 判定規則がない | 同じ漏れが別タスクで再発する             |

### 1.3 放置した場合の影響

- branch 上のドキュメントが「更新済みだが正本ではない」状態で増える
- user 要求の `.claude` 更新を満たしていないのに気づきにくい
- SubAgent 分担時に root ごとに別更新が走り、整合性説明コストが上がる

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12 の system spec 更新で、`.claude/skills/...` を canonical root として強制し、必要なら `.agents` を mirror として追従確認できる状態を作る。

### 2.2 最終ゴール

- task-specification-creator の guide / pattern に canonical root ルールが明記されている
- skill-creator の cross-skill reference pattern に canonical root / mirror の扱いが記載されている
- workflow/outputs に `.agents/skills/...` を system spec 正本として書かない
- `rg -n "\.agents/skills/.+references" docs/30-workflows/<workflow>` で 0 件にできる

### 2.3 スコープ

#### 含むもの

- `.claude` を canonical root とする明文化
- mirror drift 検知用の checklist / pattern 追記
- 必要なら簡易 validator または grep 手順の追加

#### 含まないもの

- repo 全体の `.agents` 廃止
- 全 historical workflow の一括置換
- filesystem レベルの symlink 化や構造変更

### 2.4 成果物

| 成果物                        | 形式     | 配置先                                                                                                                                                                                                                                 |
| ----------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| canonical root ルール更新     | Markdown | `.claude/skills/task-specification-creator/references/`                                                                                                                                                                                |
| cross-skill mirror ルール更新 | Markdown | `.claude/skills/skill-creator/references/`                                                                                                                                                                                             |
| system spec 同期結果          | Markdown | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                                                                                                                                   |
| UI系教訓の反映                | Markdown | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`, `.claude/skills/aiworkflow-requirements/references/ui-history-search-view.md`, `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |
| 必要なら監査スクリプト追補    | Script   | `.claude/skills/task-specification-creator/scripts/`                                                                                                                                                                                   |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `.claude` と `.agents` が別実体であることを確認済みであること
- Phase 12 の Step 1-A〜1-G を理解していること

### 3.2 依存タスク

- なし

### 3.3 必要な知識

- Phase 12 の system spec 更新フロー
- `aiworkflow-requirements` / `task-specification-creator` / `skill-creator` の役割
- workflow outputs の参照パス運用
- `task-workflow.md` / `ui-ux-feature-components.md` / `ui-history-search-view.md` / `lessons-learned.md` の同期粒度

### 3.4 推奨アプローチ

1. `.claude/skills/task-specification-creator/references/spec-update-workflow.md` に canonical root ルールを追加する
2. `.claude/skills/task-specification-creator/references/patterns.md` に dual-root drift の失敗/成功パターンを追加する
3. `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md` に mirror 扱いルールを追加する
4. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` / `ui-ux-feature-components.md` / `ui-history-search-view.md` / `lessons-learned.md` に、今回の苦戦箇所と再利用ルールを同期する
5. `rg -n "\.agents/skills/.+references" docs/30-workflows/` を使い、workflow outputs に mirror 側参照が残っていないか確認する

---

## 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                      | 発見経緯                                                                                   | 解決策                                                            | 教訓                                                                                         |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 正本更新先の混線                                          | 058c の `phase-12-documentation.md` / `spec-update-summary.md` が `.agents` を参照していた | `.claude` 正本へ修正し、mirror drift を未タスク化                 | 「更新した」ではなく「どの root を更新したか」を記録する                                     |
| mirror 側だけ進んでいる差分                               | `.agents` 側に 058c 追記があり `.claude` 側が stale だった                                 | canonical root を `.claude` と明記し、mirror は任意同期扱いにした | dual-root repo では canonical を明文化しないと必ず漏れる                                     |
| workflow が stale path を保持                             | current workflow が古い参照を持ち続けた                                                    | workflow 本文/outputs を正本基準で再同期した                      | system spec 更新だけでなく workflow 証跡も root ごと監査する                                 |
| worktree の依存解決を省略すると検証前に詰まる             | UI screenshot / targeted test の再確認時に Rollup native optional module が欠けた          | `pnpm install --frozen-lockfile` を preflight に追加した          | root drift 調査でも validator / screenshot 再取得が絡む場合は、依存整合を先に通す            |
| screenshot script の待機条件が broad だと証跡更新が止まる | summary/detail に同じ文字列があり strict mode violation になった                           | 一意な detail text と `data-testid` 優先の待機条件へ寄せた        | mirror drift の再確認でも画面証跡を取り直すなら、一意 selector を ready condition に固定する |

---

## 4. 実行手順

### Step 1

`.claude` と `.agents` の差分を `diff -u` または `git diff --no-index` で確認し、canonical / mirror の現状を記録する。

### Step 2

`task-specification-creator` の guide / pattern に以下を追加する。

- system spec 更新先は `.claude/skills/...` を正本とする
- `.agents` は mirror として扱い、正本の代替にしない
- workflow/outputs に `.agents/skills/.../references/` を書かない

### Step 3

`skill-creator` に cross-skill reference の canonical root ルールを追加する。

### Step 4

必要に応じて validator か grep 手順を追加し、`verify-all-specs` 前に root drift を機械確認できるようにする。

### Step 5

未タスク仕様書の内容を system spec 側にも同期し、少なくとも `task-workflow.md`、`ui-ux-feature-components.md`、`ui-history-search-view.md`、`lessons-learned.md` の4点で同じ苦戦箇所と再利用ルールを辿れるようにする。

---

## 5. 完了条件チェックリスト

- [ ] `.claude` が canonical root であることが 2 スキル以上のガイドに明記されている
- [ ] `.agents` を正本として案内する記述が今回変更範囲から除去されている
- [ ] workflow/outputs の mirror 参照を grep で検出できる手順が定義されている
- [ ] `task-workflow.md` / `ui-ux-feature-components.md` / `ui-history-search-view.md` / `lessons-learned.md` に同じ苦戦箇所と解決ルールが同期されている
- [ ] 変更後に `quick_validate.js` と関連 validator が PASS する

---

## 6. 検証方法

| #   | 検証項目                                                                      | 期待結果              |
| --- | ----------------------------------------------------------------------------- | --------------------- |
| 1   | `rg -n "\.agents/skills/.+references" docs/30-workflows/<target-workflow>`    | 0件                   |
| 2   | `quick_validate.js .claude/skills/task-specification-creator`                 | PASS                  |
| 3   | `quick_validate.js .claude/skills/skill-creator`                              | PASS                  |
| 4   | `verify-unassigned-links.js`                                                  | missing = 0           |
| 5   | `audit-unassigned-tasks.js --json --diff-from HEAD --target-file <this-file>` | currentViolations = 0 |
| 6   | guide / pattern を読んだ実行者が更新先を `.claude` と判断できる               | Yes                   |

---

## 7. リスクと対策

| リスク                                                      | 影響度 | 発生確率 | 対策                                                         |
| ----------------------------------------------------------- | ------ | -------- | ------------------------------------------------------------ |
| `.agents` も実運用で参照している箇所がある                  | 中     | 中       | canonical と mirror を区別して記述し、即削除しない           |
| repo 全体の historical workflow に mirror path が大量に残る | 中     | 高       | 今回差分のガード整備に限定し、既存全量置換は別タスクにしない |
| validator 追加が過剰になる                                  | 低     | 中       | まずは grep 手順から始め、必要時のみ script 化する           |

---

## 8. 参照情報

| ドキュメント               | パス                                                                            |
| -------------------------- | ------------------------------------------------------------------------------- |
| aiworkflow-requirements    | `.claude/skills/aiworkflow-requirements/`                                       |
| task-specification-creator | `.claude/skills/task-specification-creator/`                                    |
| skill-creator              | `.claude/skills/skill-creator/`                                                 |
| task-workflow 正本         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            |
| UI feature 正本            | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` |
| UI domain 正本             | `.claude/skills/aiworkflow-requirements/references/ui-history-search-view.md`   |
| lessons 正本               | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          |
| 親タスク workflow          | `docs/30-workflows/completed-tasks/task-058c-ui-06-history-search-view/`        |

---

## 9. 備考

- 本タスクは「今回の 058c を直す」ではなく、「次の Phase 12 で同じ root drift を再発させない」ための改善タスクである。
- `.agents` を直ちに削除する前提ではない。まずは canonical root の明文化と drift 検知を優先する。
