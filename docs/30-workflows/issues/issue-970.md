# [#970] "[UT-IMP-PHASE12-SCRIPT-PATH-DISCOVERY-GUARD-001] Phase 12 検証スクリプト実体探索ガード"

## メタ情報

```yaml
task_id: UT-IMP-PHASE12-SCRIPT-PATH-DISCOVERY-GUARD-001
task_name: Phase 12 検証スクリプト実体探索ガード
category: 改善
target_feature: Phase 12 検証コマンド運用（verify/validate/audit/links）
priority: 中
scale: 小規模
status: 未実施
source_phase: TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001 Phase 12 再確認
created_date: 2026-03-04
dependencies: []
spec_path: docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-script-path-discovery-guard-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 12 再確認時に、検証スクリプトの所在を記憶ベースで実行するとパス誤認が発生しやすい。

### 1.2 問題点・課題

- `aiworkflow-requirements/scripts` と `task-specification-creator/scripts` の責務境界を誤認しやすい
- 実体探索なしでコマンドを実行すると、検証が途中で止まり証跡が欠落する
- 同じ誤りが繰り返され、再確認コストが増える

### 1.3 放置した場合の影響

- Phase 12 の検証ログが不完全になり、完了判定が遅延する
- `task-workflow.md` と `lessons-learned.md` の証跡整合が崩れる
- 仕様同期の再現性が下がる

---

## 2. 何を達成するか（What）

### 2.1 目的

検証コマンド実行前にスクリプト実体を機械的に解決する手順を標準化する。

### 2.2 最終ゴール

1. Phase 12 検証の冒頭で実体探索コマンドを必須化する
2. 実体探索ログを `spec-update-summary.md` に記録する
3. 誤ディレクトリ実行を防止するチェックを追加する

### 2.3 スコープ

#### 含むもの

- `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit-unassigned-tasks` の実体探索手順
- Phase 12 テンプレートへの反映
- 監査ログ記録フォーマットの追加

#### 含まないもの

- 各検証スクリプト本体の機能変更
- 既存 baseline 違反の一括解消

### 2.4 成果物

- 実体探索手順を含む運用ガード
- テンプレート更新差分
- 再確認ログの記録例

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` スクリプト群が利用可能である
- `rg` コマンドが実行可能である
- Phase 12 対象 workflow が確定している

### 3.2 依存タスク

- なし（単独で着手可能）

### 3.3 必要な知識

- Phase 12 検証コマンドの役割分担
- current/baseline 分離判定
- aiworkflow-requirements の台帳同期ルール

### 3.4 推奨アプローチ

1. 検証前に `rg --files .claude/skills | rg '<pattern>'` を実行する
2. 実体パス確認後に検証4点セットを順次実行する
3. コマンドと結果を同一ターンで仕様台帳へ転記する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                           | 発見経緯                                     | 解決策                                                   | 教訓                           |
| ------------------------------ | -------------------------------------------- | -------------------------------------------------------- | ------------------------------ | --------------------- | ----------------------- | ----------------------------------- | ------------------------------------- |
| 検証スクリプトの所在を誤認した | Phase 12 再確認で `scripts` 配下の責務を誤読 | `rg --files .claude/skills                               | rg 'verify-all-specs           | validate-phase-output | verify-unassigned-links | audit-unassigned-tasks'` を先行実行 | 検証は「実体探索→実行」の順を固定する |
| 記憶ベース実行で証跡が分散した | workflow ごとに別ターンで実行し記録が分断    | 実行コマンドと結果を `spec-update-summary.md` へ同時記録 | 検証ログは実行と同時に転記する |

---

## 4. 実行手順

### Phase構成

- Phase A: 実体探索ルール定義
- Phase B: テンプレート反映
- Phase C: 検証ログ運用化

### Phase A: 実体探索ルール定義

#### 目的

コマンド実行前のパス誤認を防止する。

#### 手順

1. 対象コマンド4種の実体探索パターンを定義する
2. 失敗時（未検出）のフォールバック手順を定義する
3. 期待出力を規定する

#### 成果物

- 実体探索ルール表

#### 完了条件

- 4コマンドすべてに実体探索手順が定義されている

### Phase B: テンプレート反映

#### 目的

再利用可能な手順として固定する。

#### 手順

1. Phase 12 テンプレートへ実体探索コマンドを追記する
2. 監査チェック項目に探索済み確認を追加する
3. 変更履歴を更新する

#### 成果物

- 更新済みテンプレート

#### 完了条件

- テンプレートから実体探索手順が参照できる

### Phase C: 検証ログ運用化

#### 目的

運用時の記録漏れを防止する。

#### 手順

1. 対象 workflow で探索→検証を実行する
2. 結果を `task-workflow.md` / `lessons-learned.md` に転記する
3. `verify-unassigned-links` と `audit --diff-from HEAD` を実行する

#### 成果物

- 検証証跡ログ

#### 完了条件

- 探索ログと検証ログが同一ターンで残る

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 実体探索コマンドが4検証コマンド分定義されている
- [ ] テンプレートへ探索手順が追記されている
- [ ] 実行ログへ探索結果が記録されている

### 品質要件

- [ ] 記憶ベース実行を防ぐガードが明記されている
- [ ] 失敗時フォールバック手順が定義されている
- [ ] current/baseline 判定軸が分離記載されている

### ドキュメント要件

- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` 残課題テーブルへ登録されている
- [ ] `lessons-learned.md` への参照導線が追加されている

---

## 6. 検証方法

### テストケース

- Case 1: 実体探索後に4コマンドが全て実行可能
- Case 2: 実体探索を省略した場合にガードで検出される
- Case 3: ログに探索結果と検証結果が同時記録される

### 検証手順

```bash
rg --files .claude/skills | rg 'verify-all-specs|validate-phase-output|verify-unassigned-links|audit-unassigned-tasks'
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <workflow-path> --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js <workflow-path>
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

---

## 7. リスクと対策

| リスク                           | 影響度 | 発生確率 | 対策                                                    |
| -------------------------------- | ------ | -------- | ------------------------------------------------------- |
| 実体探索を省略して誤パス実行する | 中     | 中       | テンプレートで探索を必須手順化する                      |
| 実行結果の転記漏れが発生する     | 中     | 中       | `spec-update-summary.md` の固定表に探索結果列を追加する |
| baseline を今回差分と誤認する    | 中     | 高       | `currentViolations` を合否軸に固定する                  |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`

### 参考資料

- `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/outputs/phase-12/spec-update-summary.md`
- `.claude/rules/06-known-pitfalls.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
Phase 12 再確認で、検証スクリプトの所在誤認による手戻りが発生した。
コマンド実行前に実体探索を必須化し、探索ログを証跡に残す必要がある。
```

### 補足事項

- 本タスクは運用ガードの強化が目的であり、機能実装の変更は対象外。
