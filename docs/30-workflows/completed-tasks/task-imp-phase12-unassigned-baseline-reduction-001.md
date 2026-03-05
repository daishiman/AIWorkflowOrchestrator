# UT-IMP-PHASE12-UNASSIGNED-BASELINE-REDUCTION-001 - 未タスク baseline 負債削減の段階実行 タスク指示書

## メタ情報

```yaml
issue_number: 1072
```

| 項目         | 内容                                                               |
| ------------ | ------------------------------------------------------------------ |
| タスクID     | UT-IMP-PHASE12-UNASSIGNED-BASELINE-REDUCTION-001                   |
| タスク名     | 未タスク baseline 負債削減の段階実行                               |
| 分類         | 改善                                                               |
| 対象機能     | `docs/30-workflows/unassigned-task/` の配置・命名・9セクション準拠 |
| 優先度       | 中                                                                 |
| 見積もり規模 | 中規模                                                             |
| ステータス   | 未実施                                                             |
| 発見元       | TASK-UI-01-A-STORE-SLICE-BASELINE Phase 12 再監査                  |
| 発見日       | 2026-03-05                                                         |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 12 再監査で `audit-unassigned-tasks --json --diff-from HEAD` は `currentViolations=0` だった一方、全体監査では `baselineViolations=90`（format/naming/misplaced）が継続していることを確認した。

### 1.2 問題点・課題

- 現在の差分品質は担保できているが、既存未タスク資産の負債が大きく、再監査時の読解コストが高い。
- `--target-file` 監査の適用境界（`unassigned-task` 配下限定）を誤ると、運用改善の進捗判定が揺れる。
- 既存資産の是正優先順位（format/naming/misplaced）が統一されていない。

### 1.3 放置した場合の影響

- 未タスク品質監査のノイズが増え、今回差分の合否判断が遅延する。
- 未タスクの探索性が下がり、実施漏れや重複対応のリスクが増える。
- Phase 12 完了判定の再現性が低下する。

---

## 2. 何を達成するか（What）

### 2.1 目的

`baselineViolations` を計画的に削減し、未タスク台帳を「配置・命名・9セクション」準拠へ段階的に正規化する。

### 2.2 最終ゴール

1. baseline違反をカテゴリ別（format/naming/misplaced）で分割管理できる。
2. 各カテゴリに対して実施順序と完了条件を持つ是正タスク群が整備される。
3. `audit-unassigned-tasks` の判定が `current=差分合否 / baseline=資産健全性` として運用固定される。

### 2.3 スコープ

#### 含むもの

- 未タスク資産の違反カテゴリ分解と優先順位策定
- 代表ファイルからのフォーマット是正ルール標準化
- 配置ミス（`completed-tasks/unassigned-task`）の段階移管計画

#### 含まないもの

- 全342件の未タスクを単一ターンで一括修正
- タスク本文の内容改善（技術仕様の再設計）

### 2.4 成果物

- baseline削減計画ドキュメント（カテゴリ別WBS）
- 代表是正サンプル（format/naming/misplaced 各1件以上）
- `task-workflow.md` / `lessons-learned.md` への運用ルール反映

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` の監査スクリプトを実行できること
- `aiworkflow-requirements` の task-workflow/lessons が正本として更新可能であること

### 3.2 依存タスク

- TASK-UI-01-A-STORE-SLICE-BASELINE（完了）
- UT-TASK-10A-B-009（完了済み運用ガードの再利用）

### 3.3 必要な知識

- 未タスク9セクション規約
- `audit-unassigned-tasks` の `current/baseline` 判定軸
- `verify-unassigned-links` のリンク整合ルール

### 3.4 推奨アプローチ

1. baseline違反をカテゴリ別に分解し、1カテゴリずつ是正する。
2. `--target-file` は `docs/30-workflows/unassigned-task/*.md` のみ適用する。
3. 各是正後に `--diff-from HEAD` と全体監査を併記して進捗を定量記録する。

---

## 4. 実行手順

### Phase構成

- Phase A: 違反分類と優先順位確定
- Phase B: format違反の是正
- Phase C: naming/misplaced違反の是正
- Phase D: 監査基準の定着

### Phase A: 違反分類と優先順位確定

#### 目的

baseline違反90件をカテゴリ別に分解し、実行順序を確定する。

#### 手順

1. `audit-unassigned-tasks --json` を実行し、違反一覧をカテゴリ別に抽出する。
2. `format` → `naming` → `misplaced` の順で優先順位を固定する。
3. カテゴリごとに対象ファイル数と完了条件を定義する。

#### 成果物

- 違反カテゴリ別計画表

#### 完了条件

- 全カテゴリに担当範囲と検証方法が定義されている。

### Phase B: format違反の是正

#### 目的

9セクション不足の指示書をテンプレート準拠へ修正する。

#### 手順

1. 代表3件を選定し、`assets/unassigned-task-template.md` 準拠で修正する。
2. `## メタ情報` の重複を解消し、1セクション運用に統一する。
3. `audit-unassigned-tasks --target-file <file>` で個別監査する。

#### 成果物

- フォーマット準拠化済みファイル

#### 完了条件

- 対象ファイルで `currentViolations=0` が確認できる。

### Phase C: naming/misplaced違反の是正

#### 目的

命名規則逸脱と配置ドリフトを正しいディレクトリへ是正する。

#### 手順

1. naming違反5件を命名規則へリネームする。
2. misplaced違反19件を完了/未実施で振り分けて移管する。
3. `verify-unassigned-links` でリンク切れを検証する。

#### 成果物

- 命名正規化ファイル
- 正規配置済みファイル

#### 完了条件

- 参照リンクが全件解決し、移管理由が記録されている。

### Phase D: 監査基準の定着

#### 目的

再発防止として、監査基準を仕様書とスキルへ固定する。

#### 手順

1. `task-workflow.md` に baseline削減進捗を記録する。
2. `lessons-learned.md` に再発条件と短手順を追記する。
3. `skill-creator` / `task-specification-creator` のガイドへ運用ルールを同期する。

#### 成果物

- 更新済み仕様書・スキルガイド

#### 完了条件

- 同種タスクで再利用できる手順が定義されている。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] baseline違反をカテゴリ別に分解した
- [ ] 各カテゴリの是正タスクと完了条件を定義した
- [ ] `current/baseline` 判定を分離運用として文書化した

### 品質要件

- [ ] 代表ファイルの `--target-file` 監査が PASS
- [ ] `verify-unassigned-links` が PASS
- [ ] 命名規則・配置規則の適合を確認した

### ドキュメント要件

- [ ] `task-workflow.md` に進捗を反映した
- [ ] `lessons-learned.md` に苦戦箇所と短手順を反映した
- [ ] Phase 12 成果物へ監査結果を記録した

---

## 6. 検証方法

### テストケース

- TC-UT-01: `--target-file` で対象ファイルが `currentViolations=0` になる
- TC-UT-02: `--diff-from HEAD` で `currentViolations=0` を維持できる
- TC-UT-03: 全体監査の baseline件数が計画どおり減少する

### 検証手順

1. `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/unassigned-task/task-imp-phase12-unassigned-baseline-reduction-001.md`
2. `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`
3. `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json`
4. `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`

---

## 7. リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                                              |
| ------------------------------------ | ------ | -------- | ------------------------------------------------- |
| 是正対象が多く単発で終わらない       | 中     | 高       | カテゴリ別に分割し、1カテゴリずつ完了させる       |
| リネームで参照切れが発生する         | 高     | 中       | 変更後に `verify-unassigned-links` を必ず実行する |
| baseline改善が current判定へ混入する | 中     | 中       | `current` と `baseline` を別表で管理する          |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

### 参考資料

- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056-ui-01-store-ipc-architecture/task-056a-a-store-slice-baseline/outputs/phase-12/unassigned-task-detection.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

> 「未タスクをタスク仕様書のフォーマットどおりに指定のディレクトリ（docs/30-workflows/unassigned-task/）に配置できているか確認して」

### 補足事項

- 本タスクは「今回差分の不備」ではなく「既存baseline負債の段階削減」を目的とする。
