# UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001: Phase 12 2workflow同時監査の証跡集約ガード

## メタ情報

```yaml
issue_number: 942
task_id: UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001
task_name: Phase 12 2workflow同時監査の証跡集約ガード
category: 改善
target_feature: Phase 12 再確認（spec_created + completed workflow 同時監査）
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-UI-05A / TASK-UI-05 Phase 12再確認（2026-03-02）
created_date: 2026-03-02
dependencies:
  [
    UT-IMP-PHASE12-EVIDENCE-LINK-GUARD-001,
    UT-IMP-PHASE12-EVIDENCE-VALUE-SYNC-GUARD-001,
    UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001,
  ]
```

| 項目         | 内容                                                          |
| ------------ | ------------------------------------------------------------- |
| タスクID     | UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001               |
| タスク名     | Phase 12 2workflow同時監査の証跡集約ガード                    |
| 分類         | 改善                                                          |
| 対象機能     | Phase 12 再確認（spec_created + completed workflow 同時監査） |
| 優先度       | 中                                                            |
| 見積もり規模 | 中規模                                                        |
| ステータス   | 未実施                                                        |
| 発見元       | TASK-UI-05A / TASK-UI-05 Phase 12再確認（苦戦箇所）           |
| 発見日       | 2026-03-02                                                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 12再確認で `spec_created` workflow（`docs/30-workflows/skill-editor-view`）と完了workflow（`docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW`）を同時監査した際、検証証跡の記録先が分散しやすいことが再確認された。

### 1.2 問題点・課題

- `verify-all-specs` / `validate-phase-output` を2workflowで実行しても、結果の集約形式が固定されていない。
- Task 1/3/4/5 成果物実体確認と `implementation-guide.md` Part 1/2 確認が、手動で個別転記されるため漏れやすい。
- UIタスクでスクリーンショットを取得しても、監査レポートに最新証跡（取得日付き）を残し忘れやすい。
- `audit-unassigned-tasks` の `current` と `baseline` の判定軸を誤ると、今回差分と既存負債の切り分けが崩れる。

### 1.3 放置した場合の影響

- Phase 12 完了判定の再現性が低下し、再監査で同じ確認作業を繰り返す。
- 証跡が散在して説明コストが増え、SubAgent間で判断がぶれる。
- 同種タスクで「実装は完了しているが証跡が不十分」という差し戻しが再発する。

---

## 2. 何を達成するか（What）

### 2.1 目的

2workflow同時監査時の証跡を1フォーマットに集約し、Phase 12 完了判定を機械検証可能な状態へ標準化する。

### 2.2 最終ゴール

1. 2workflowの `verify-all-specs` / `validate-phase-output` 結果を同一フォーマットで記録できる。
2. Task 1/3/4/5 成果物実体確認と Part 1/2 確認を定型チェックリスト化できる。
3. UIタスクでスクリーンショット証跡の取得日・ファイル実在を同時検証できる。
4. `currentViolations=0` を合否基準に固定し、`baseline` は監視値として分離記録できる。

### 2.3 スコープ

#### 含むもの

- 2workflow同時監査向けの証跡集約テンプレート/手順定義
- Task 1/3/4/5 実体確認チェック項目の固定化
- UIスクリーンショット存在確認の監査手順追加
- `task-workflow.md` / `lessons-learned.md` への台帳同期ルール

#### 含まないもの

- 既存 baseline 違反の一括解消
- アプリ機能実装（Renderer/Main/Preload の機能追加）
- Phase 1〜11 のワークフロー定義変更

### 2.4 成果物

- 2workflow同時監査の証跡集約手順（テンプレート or スクリプト仕様）
- 更新済み未タスク指示書（本ファイル）
- `task-workflow.md` 残課題テーブル登録
- `lessons-learned.md` との参照同期

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` の監査スクリプトを実行できること
- `aiworkflow-requirements` の正本更新手順（task-workflow/lessons/SKILL/LOGS）を理解していること
- 監査対象workflowが2本とも存在し、`phase-12-documentation.md` を持つこと

### 3.2 依存タスク

- UT-IMP-PHASE12-EVIDENCE-LINK-GUARD-001
- UT-IMP-PHASE12-EVIDENCE-VALUE-SYNC-GUARD-001
- UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001

### 3.3 必要な知識

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

### 3.4 推奨アプローチ

1. 監査対象workflowを先に固定し、証跡の記録先を `task-workflow.md` に一本化する。
2. 構造検証・出力検証・成果物実体確認・未タスク監査を定型順序で実行する。
3. 同一ターンで `task-workflow.md` と `lessons-learned.md` に反映して記録分散を防ぐ。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                   | 発見経緯                                                                 | 解決策                                                                                                                        | 教訓                                                       |
| -------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 2workflow監査の証跡が分散しやすい      | TASK-UI-05A/TASK-UI-05 の再確認で、記録先が複数に分かれた                | 監査対象workflowを先に固定し、`verify`→`validate`→成果物実体確認を同一レポートへ集約                                          | 複数workflow監査は「対象固定」と「記録先固定」を先に決める |
| `current`/`baseline` の誤判定が起こる  | `audit --diff-from HEAD` 実行時に baseline件数を fail と誤認しやすかった | 合否は `currentViolations.total` 固定、baselineは監視欄へ分離                                                                 | 監査値は「判定値」と「監視値」を分離しないと再発する       |
| 成果物実体確認（Task 1/3/4/5）が抜ける | コマンドPASSのみで完了扱いにしやすい                                     | `implementation-guide` / `documentation-changelog` / `unassigned-task-detection` / `skill-feedback-report` の実体確認を必須化 | Phase 12 は「構造PASS」だけで完了判定しない                |
| 画面証跡の鮮度管理が弱い               | UIタスクで旧スクリーンショットのみ参照してしまう                         | `outputs/phase-11/screenshots` の実在確認と取得日付きファイル名記録を必須化                                                   | UI検証は「画像の存在」だけでなく「取得日の明示」まで必要   |

---

## 4. 実行手順

### Phase構成

- Phase A: 2workflow監査仕様の定義
- Phase B: 証跡集約テンプレート/手順の実装
- Phase C: 既存タスク適用とシステム仕様同期

### Phase A: 2workflow監査仕様の定義

#### 目的

同時監査の必須項目と合否基準を固定する。

#### 手順

1. 監査対象workflow A/Bを定義する。
2. 必須検証（`verify-all-specs` / `validate-phase-output` / Task 1/3/4/5 実体確認）を定義する。
3. 監査合否を `currentViolations.total` 固定で定義する。

#### 成果物

- 2workflow監査必須項目マトリクス

#### 完了条件

- 検証順序と判定軸が1つの手順として確定している。

### Phase B: 証跡集約テンプレート/手順の実装

#### 目的

監査証跡を再利用可能な形へ標準化する。

#### 手順

1. 2workflow結果を1表に記録するテンプレートを作成/更新する。
2. UIタスク向けにスクリーンショット実在確認手順を追加する。
3. Task 1/3/4/5 実体確認チェックリストを追加する。

#### 成果物

- 証跡集約テンプレートまたは運用手順差分

#### 完了条件

- 同種タスクでテンプレートを流用して再監査できる。

### Phase C: 既存タスク適用とシステム仕様同期

#### 目的

運用ルールを正本仕様に反映し、追跡可能にする。

#### 手順

1. `task-workflow.md` 残課題テーブルへ本未タスクを登録する。
2. `lessons-learned.md` に参照を追記し、苦戦箇所の再利用導線を作る。
3. `verify-unassigned-links` と `audit --target-file` で品質確認する。

#### 成果物

- 更新済み `task-workflow.md` / `lessons-learned.md`

#### 完了条件

- 参照切れ0件、対象監査 `currentViolations.total=0` を満たす。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 2workflow同時監査の証跡集約手順が定義されている
- [ ] Task 1/3/4/5 実体確認チェックが手順化されている
- [ ] UIスクリーンショットの存在確認と取得日記録が手順化されている

### 品質要件

- [ ] `current`/`baseline` 分離判定が明文化されている
- [ ] 監査手順の再実行で同じ判定が得られる
- [ ] `audit --target-file` で `currentViolations.total=0` を満たす

### ドキュメント要件

- [ ] 本指示書が `docs/30-workflows/unassigned-task/` に作成されている
- [ ] `task-workflow.md` 残課題テーブルへ登録済み
- [ ] `lessons-learned.md` に参照導線が追加されている

---

## 6. 検証方法

### テストケース

- Case 1: 2workflowの `verify-all-specs` / `validate-phase-output` が同一レポートに集約される
- Case 2: Task 1/3/4/5 実体確認欄に未記入がある場合、未完了判定になる
- Case 3: `current=0` / `baseline>0` を分離して記録できる
- Case 4: UIスクリーンショットのファイル実在が確認できる

### 検証手順

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/skill-editor-view --json
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-editor-view
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/unassigned-task/task-imp-phase12-two-workflow-evidence-bundle-001.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
ls -la docs/30-workflows/skill-editor-view/outputs/phase-11/screenshots
```

---

## 7. リスクと対策

| リスク                                  | 影響度 | 発生確率 | 対策                                                       |
| --------------------------------------- | ------ | -------- | ---------------------------------------------------------- |
| 監査項目が増えて運用が重くなる          | 中     | 中       | 必須項目を「構造/出力/成果物/未タスク/画面証跡」に限定する |
| UI以外タスクに画面証跡要件を誤適用する  | 低     | 中       | UIタスク時のみ実行する条件をテンプレートに明記する         |
| baselineを合否に誤適用する              | 高     | 中       | 判定軸を `currentViolations.total` 固定で明記する          |
| 仕様更新が `task-workflow` のみで止まる | 中     | 中       | `lessons-learned` 同期を完了条件に含める                   |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`

### 参考資料

- `docs/30-workflows/skill-editor-view/outputs/phase-12/implementation-guide.md`
- `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/outputs/phase-12/implementation-guide.md`
- `docs/30-workflows/skill-editor-view/outputs/phase-11/screenshots/UI05A-03-current-dashboard-20260302.png`
- `docs/30-workflows/skill-editor-view/outputs/phase-11/screenshots/UI05A-04-current-editor-20260302.png`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
spec_created workflow と completed workflow を同時に再監査すると、証跡が分散しやすく、
current/baseline の判定誤読が再発する。
```

### 補足事項

- 本タスクは「2workflow同時監査の証跡運用最適化」を対象とし、既存baseline違反の一括修正は対象外とする。
