# [#950] "[UT-IMP-PHASE12-STEP2-TARGET-TRACE-GUARD-001] Phase 12 Step 2 判定と更新対象突合ガード"

## メタ情報

```yaml
task_id: UT-IMP-PHASE12-STEP2-TARGET-TRACE-GUARD-001
task_name: Phase 12 Step 2 判定と更新対象突合ガード
category: 改善
target_feature: Phase 12 Step 2 判定（phase-12-documentation と changelog と system spec の同期）
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-10A-A Phase 12 再確認（2026-03-02）
created_date: 2026-03-02
dependencies: []
spec_path: docs/30-workflows/completed-tasks/TASK-10A-A-SKILL-MANAGEMENT-PANEL/unassigned-task/task-imp-phase12-step2-target-trace-guard-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-10A-A の Phase 12 再確認で、`documentation-changelog.md` の Step 2 が一度 `該当なし` と記録され、後から `完了` に修正された。原因は、`phase-12-documentation.md` の Task 2 更新対象と `changelog` の判定を機械的に突合していなかったことだった。

### 1.2 問題点・課題

- Step 2 判定が手動判断に依存し、更新対象ファイル（`arch-ui-components.md` など）の見落としが発生しやすい。
- `documentation-changelog.md` / `spec-update-summary.md` / `task-workflow.md` の三点で、Step 2 の記録粒度が揺れやすい。
- `current` と `baseline` の監査値が同時出力されるため、合否判定軸がぶれやすい。
- UIタスクでは画面証跡同期が優先され、Step 2 突合が後回しになりやすい。

### 1.3 放置した場合の影響

- Phase 12 完了判定の再現性が下がり、再監査時に同じ差し戻しが繰り返される。
- system spec 正本（`aiworkflow-requirements`）と workflow 成果物の記録が乖離する。
- 未タスク監査の判定を誤り、不要修正または見逃しが発生する。

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12 Step 2 の「更新要否」と「更新実績」を、単一ルールで機械検証可能にし、判定揺れをなくす。

### 2.2 最終ゴール

1. `phase-12-documentation.md` の Task 2 更新対象と `documentation-changelog.md` Step 2 判定が常に一致する。
2. `spec-update-summary.md` の更新対象一覧と system spec 正本更新（`task-workflow.md` / `lessons-learned.md` / 対象仕様書）が一致する。
3. 監査結果は `currentViolations.total` を合否軸、`baselineViolations` を監視軸として常に分離記録される。
4. 同種タスクで再利用できる SubAgent 分担テンプレートが整備される。

### 2.3 スコープ

#### 含むもの

- Step 2 判定の突合ルール定義（更新対象抽出、判定、証跡記録）
- `documentation-changelog` と `spec-update-summary` の整合チェック手順
- `task-workflow.md` / `lessons-learned.md` 同期条件の明文化
- `current` / `baseline` 分離記録のテンプレート固定化

#### 含まないもの

- 既存 baseline 違反の一括修正
- Renderer/Main/Preload の機能追加実装
- Phase 1〜11 の仕様変更

### 2.4 成果物

- Step 2 判定突合ルール（手順書または検証スクリプト仕様）
- 更新済み未タスク指示書（本ファイル）
- `task-workflow.md` 残課題テーブル登録
- `lessons-learned.md` 参照導線（必要時）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `.claude/skills/task-specification-creator/references/spec-update-workflow.md` を理解していること
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md` と `lessons-learned.md` の更新手順を理解していること
- `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit-unassigned-tasks` を実行できること

### 3.2 依存タスク

- UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001
- TASK-DOC-PHASE12-JUDGMENT-CRITERIA-001

### 3.3 必要な知識

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`

### 3.4 推奨アプローチ（SubAgent 分離）

| SubAgent   | 担当            | 入力                                                    | 出力                           |
| ---------- | --------------- | ------------------------------------------------------- | ------------------------------ |
| SubAgent-A | Step 2 対象抽出 | `phase-12-documentation.md` Task 2                      | 対象仕様書リスト               |
| SubAgent-B | 判定突合        | `documentation-changelog.md` / `spec-update-summary.md` | 一致/不一致レポート            |
| SubAgent-C | 正本同期        | `aiworkflow-requirements/references/*`                  | task-workflow/lessons 同期結果 |
| SubAgent-D | 監査判定        | `verify-unassigned-links` / `audit --diff-from HEAD`    | `current`/`baseline` 分離判定  |

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                               | 発見経緯                                                    | 解決策                                                                                  | 教訓                                             |
| ---------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Step 2 を `該当なし` と誤判定      | TASK-10A-A の `documentation-changelog.md` 再監査で発覚     | Task 2 更新対象表を正本として Step 2 判定を固定し、`arch-ui-components.md` 反映を必須化 | Step判定は口頭判断せず、対象一覧との突合で決める |
| system spec への苦戦箇所転記遅延   | `task-workflow` 更新後に `lessons-learned` が後回しになった | `arch + task + lessons` を同一ターン更新ルールに統一                                    | UI機能の Phase 12 は3仕様書同時同期が完了条件    |
| `current`/`baseline` 判定の誤読    | `audit` 全体出力を今回差分失敗と誤認しやすかった            | 合否は `currentViolations.total` 固定、baseline は監視値として別記録                    | 未タスク監査は二軸記録を必須化                   |
| 画面証跡優先で Step 2 突合が後回し | UI検証対応時にドキュメント突合が遅延                        | 画面証跡取得後に Step 2 突合を即実行する順序をテンプレート化                            | UIタスクは「画面証跡」と「仕様同期」を同列で扱う |

---

## 4. 実行手順

### Phase構成

- Phase A: Step 2 判定ルール設計
- Phase B: 判定突合の自動/半自動化
- Phase C: 正本同期と監査運用定着

### Phase A: Step 2 判定ルール設計

#### 目的

更新対象抽出と Step 2 判定ルールを確定する。

#### 手順

1. `phase-12-documentation.md` の Task 2 更新対象抽出ルールを定義する。
2. `documentation-changelog.md` Step 2 判定の許容値（完了/更新不要）を定義する。
3. `spec-update-summary.md` で必須列（対象仕様書、更新有無、更新内容）を固定する。

#### 成果物

- Step 2 判定ルール仕様

#### 完了条件

- 同一入力で判定結果が一意に決まる。

### Phase B: 判定突合の自動/半自動化

#### 目的

Step 2 の更新対象と判定結果の不一致を機械検出できるようにする。

#### 手順

1. 突合スクリプト（または既存スクリプト拡張）の仕様を作成する。
2. `documentation-changelog` と `spec-update-summary` の突合チェックを実装する。
3. 不一致時に具体的修正先（ファイル名 + セクション）を出力する。

#### 成果物

- 突合チェック手順書または検証スクリプト

#### 完了条件

- Step 2 不一致を CI/ローカルで再現検出できる。

### Phase C: 正本同期と監査運用定着

#### 目的

system spec 正本と未タスク監査の運用を固定化する。

#### 手順

1. `task-workflow.md` 残課題テーブルへ本タスクを登録する。
2. 必要に応じて `lessons-learned.md` に参照導線を追加する。
3. `verify-unassigned-links` と `audit --target-file/--diff-from` を実行する。

#### 成果物

- 更新済み台帳（`task-workflow.md`）
- 監査結果ログ（current/baseline 分離）

#### 完了条件

- 参照切れ0件、対象監査 `currentViolations.total=0` を満たす。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Step 2 判定ルール（対象抽出→判定→記録）が定義されている
- [ ] `documentation-changelog` と `spec-update-summary` の突合手順が定義されている
- [ ] `task-workflow` / `lessons-learned` 同期条件が明文化されている

### 品質要件

- [ ] 同一入力で Step 2 判定が再現可能
- [ ] `current`/`baseline` 分離判定が文書化されている
- [ ] `audit --target-file` で `currentViolations.total=0` を満たす

### ドキュメント要件

- [ ] 本指示書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` 残課題テーブルへ登録済み
- [ ] 変更履歴に本タスク登録が記録されている

---

## 6. 検証方法

### テストケース

- Case 1: Task 2 対象あり + changelog が `更新不要` の場合に FAIL できる
- Case 2: changelog と summary の更新対象ファイル差分を検出できる
- Case 3: `current=0` / `baseline>0` を分離記録できる
- Case 4: 台帳リンクが実在ファイルへ解決される

### 検証手順

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/TASK-10A-A-SKILL-MANAGEMENT-PANEL --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-10A-A-SKILL-MANAGEMENT-PANEL
```

---

## 7. リスクと対策

| リスク                                       | 影響度 | 発生確率 | 対策                                                            |
| -------------------------------------------- | ------ | -------- | --------------------------------------------------------------- |
| 既存の Phase 12 自動検証タスクと要件重複する | 中     | 中       | 既存タスクとの差分（Step 2 突合特化）を明示し、重複実装を避ける |
| UI以外タスクに画面証跡手順を誤適用する       | 低     | 中       | UIタスク条件を明示し、非UIでは対象外とする                      |
| 判定ルールが複雑化して運用負荷が上がる       | 中     | 中       | 必須判定を「対象抽出」「Step判定」「証跡整合」の3点に限定する   |
| baseline違反を今回差分失敗と誤認する         | 高     | 中       | 合否軸を `currentViolations.total` 固定で記録する               |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`
- `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`

### 参考資料

- `docs/30-workflows/completed-tasks/TASK-10A-A-SKILL-MANAGEMENT-PANEL/outputs/phase-12/documentation-changelog.md`
- `docs/30-workflows/completed-tasks/TASK-10A-A-SKILL-MANAGEMENT-PANEL/outputs/phase-12/spec-update-summary.md`
- `docs/30-workflows/completed-tasks/TASK-10A-A-SKILL-MANAGEMENT-PANEL/outputs/phase-12/unassigned-task-detection.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
documentation-changelog の Step 2 を該当なしと誤判定しやすい。
phase-12-documentation.md の Task 2 更新対象と突合して判断を固定する必要がある。
```

### 補足事項

- 本タスクは「Step 2 判定の突合ガード」に限定し、既存 baseline 負債の解消は別タスクで扱う。
- 実装時は `task-specification-creator` と `aiworkflow-requirements` を同一ターンで更新し、台帳と教訓の乖離を防止する。
