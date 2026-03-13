# UT-IMP-PHASE12-EXACT-COUNT-CROSS-DOCUMENT-VALIDATOR-001: Phase 12 exact count 横断整合バリデータ

## メタ情報

```yaml
issue_number: 1198
task_id: UT-IMP-PHASE12-EXACT-COUNT-CROSS-DOCUMENT-VALIDATOR-001
task_name: Phase 12 exact count 横断整合バリデータ
category: 改善
target_feature: Phase 12 outputs の exact count 同期（spec-update-summary / system-spec-sync-checklist / unassigned-task-detection / verification-report）
priority: 中
scale: 小規模
status: 未実施
source_phase: UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001 Phase 12 follow-up（2026-03-13）
created_date: 2026-03-13
dependencies:
  - UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001
  - UT-IMP-PHASE12-EVIDENCE-VALUE-SYNC-GUARD-001
  - UT-IMP-PHASE12-RELATED-UT-EXACT-COUNT-RESYNC-GUARD-001
spec_path: docs/30-workflows/unassigned-task/task-imp-phase12-exact-count-cross-document-validator-001.md
```

| 項目         | 内容                                                                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-PHASE12-EXACT-COUNT-CROSS-DOCUMENT-VALIDATOR-001                                                                                                        |
| タスク名     | Phase 12 exact count 横断整合バリデータ                                                                                                                        |
| 分類         | 改善                                                                                                                                                           |
| 対象機能     | Phase 12 outputs の exact count 同期（`spec-update-summary.md` / `system-spec-sync-checklist.md` / `unassigned-task-detection.md` / `verification-report.md`） |
| 優先度       | 中                                                                                                                                                             |
| 見積もり規模 | 小規模                                                                                                                                                         |
| ステータス   | 未実施                                                                                                                                                         |
| 発見元       | UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001 Phase 12 follow-up                                                                                        |
| 発見日       | 2026-03-13                                                                                                                                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001` の Phase 12 追補で、`spec-update-summary.md`、`system-spec-sync-checklist.md`、`unassigned-task-detection.md`、`verification-report.md` に書く exact count と監査値を人手でそろえた。  
既存の未タスクは「related UT moved/closed 後の再同期」や「実測値のプレースホルダ除去」は扱っているが、複数成果物の同一 count を横断突合する validator はまだ存在しない。

### 1.2 問題点・課題

- `verify-unassigned-links` や `audit` の実測値を 4 成果物へ転記する際、1 ファイルだけ古い値が残っても機械検知しにくい。
- `0 件` 判定のあとに follow-up 未タスクを formalize すると、`unassigned-task-detection.md` だけでなく summary/checklist/report も同時に直す必要があるが、現状は手順依存で漏れやすい。
- `.claude` 正本更新後に `.agents` mirror を同期しないと、validator 実測値と成果物の count がズレても原因が source 側か転記側か切り分けにくい。

### 1.3 放置した場合の影響

- Phase 12 が PASS でも、成果物間で count が食い違う stale 記録が残る。
- 同種課題で毎回 manual diff が必要になり、再監査コストが増える。
- 「未タスクを formalize したのに parent workflow が 0 件のまま」という説明責任の欠落が再発する。

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12 outputs に記録する exact count と current/baseline bucket を横断比較し、1 コマンドで不一致箇所を検知できるようにする。

### 2.2 最終ゴール

1. `spec-update-summary.md` / `system-spec-sync-checklist.md` / `unassigned-task-detection.md` / `verification-report.md` の exact count と監査値を機械比較できる。
2. `verify-unassigned-links` / `audit-unassigned-tasks` / `quick_validate` のどの値がどこへ転記されるかが固定される。
3. 不一致時に「不足ファイル」「古い count」「current/baseline 混同」のどれかを判別できる。
4. Phase 12 follow-up で新規未タスクを切ったとき、parent workflow の 0 件報告を自動で検出できる。

### 2.3 スコープ

#### 含むもの

- `task-specification-creator/scripts/` 配下への exact count 横断整合 validator 追加
- Phase 12 template / guide への validator 利用手順追記
- `aiworkflow-requirements` の `task-workflow.md` / `lessons-learned.md` / workflow 正本への未タスク導線追加

#### 含まないもの

- 過去すべての completed workflow を自動修復するバッチ
- `verify-unassigned-links.js` や `audit-unassigned-tasks.js` 本体の全面リライト
- Phase 11 screenshot harness の改修

### 2.4 成果物

- Phase 12 exact count 横断整合 validator
- validator のテストまたは fixture
- `task-specification-creator` の guide / template 更新
- `aiworkflow-requirements` 側の関連未タスク導線

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `verify-unassigned-links.js`、`audit-unassigned-tasks.js`、`quick_validate.js` を current worktree で実行できること
- `.claude/skills/aiworkflow-requirements/` を canonical root、`.agents/skills/aiworkflow-requirements/` を mirror として同期できること
- Phase 12 outputs に `spec-update-summary.md`、`system-spec-sync-checklist.md`、`unassigned-task-detection.md`、`verification-report.md` が存在すること

### 3.2 依存タスク

- `UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001`（完了）
- `UT-IMP-PHASE12-EVIDENCE-VALUE-SYNC-GUARD-001`（未実施）
- `UT-IMP-PHASE12-RELATED-UT-EXACT-COUNT-RESYNC-GUARD-001`（未実施）

### 3.3 必要な知識

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/aiworkflow-requirements/references/workflow-workspace-preview-search-resilience-guard.md`

### 3.4 推奨アプローチ

1. まず `verify-unassigned-links`、`audit-unassigned-tasks`、`quick_validate` から転記元の canonical value を定義する。
2. 次に 4 成果物から対象行を抽出し、値比較だけを行う軽量 validator を追加する。
3. 最後に template 側へ validator 実行を完了条件として固定し、manual diff を補助作業へ落とす。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                                                                                                                           | 発見経緯                                                                                                                  | 解決策                                                                            | 教訓                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `spec-update-summary.md` と `system-spec-sync-checklist.md` の count を直しても `unassigned-task-detection.md` / `verification-report.md` が古いまま残りやすい | `UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001` の follow-up で新規 UT formalize 後に 4 成果物の値を手で再同期した | 4 成果物を横断して exact count を比較する validator を追加する                    | 「再同期ルールがある」だけでは足りず、「再同期漏れを検知する仕組み」まで必要              |
| `.claude` と `.agents` の source 差分で実測値の解釈が揺れる                                                                                                    | `verify-unassigned-links` の既定 source と成果物転記の source がズレるケースを parent task 群で複数回確認した             | validator 実行前に canonical root と mirror sync の確認を前提条件へ含める         | count validator は file content だけでなく source root も固定しないと再現性が落ちる       |
| follow-up 未タスクを 0→1 に変えた後、Phase 12 outputs のどれを直すべきかが人依存になる                                                                         | current workflow では `unassigned-task-detection.md` だけでなく summary/checklist/report の更新対象判断に時間がかかった   | validator の対象ファイル一覧を 4 成果物で固定し、追加タスク時の更新面を明文化する | 未タスク formalize は「1ファイル作成」ではなく「parent outputs の count 更新」までが1単位 |

### 3.6 SubAgent 分担

| SubAgent   | 関心ごと                   | 主担当成果物                                                          |
| ---------- | -------------------------- | --------------------------------------------------------------------- |
| SubAgent-A | validator 設計             | count 抽出ルール、比較項目、エラー出力形式                            |
| SubAgent-B | template / guide sync      | `phase-11-12-guide.md`、`spec-update-workflow.md`、必要 template      |
| SubAgent-C | system spec / backlog sync | `task-workflow.md`、`lessons-learned.md`、workflow 正本、未タスク導線 |
| SubAgent-D | 検証                       | `verify-unassigned-links`、`audit --target-file`、mirror sync         |

---

## 4. 実行手順

### Phase構成

- Phase A: canonical value と対象ファイルの固定
- Phase B: validator 実装
- Phase C: template / system spec 同期と検証

### Phase A: canonical value と対象ファイルの固定

#### 目的

exact count の正本と比較対象ファイルを確定する。

#### 手順

1. `verify-unassigned-links`、`audit-unassigned-tasks`、`quick_validate` の出力から転記対象値を列挙する。
2. `spec-update-summary.md`、`system-spec-sync-checklist.md`、`unassigned-task-detection.md`、`verification-report.md` の対象行を抽出する。
3. `current` と `baseline` を別 bucket として扱う比較仕様を定義する。

#### 成果物

- 比較項目一覧
- 対象ファイル一覧

#### 完了条件

- 4 成果物で比較する exact count 項目が一意に定義されている。

### Phase B: validator 実装

#### 目的

4 成果物の exact count を 1 コマンドで横断検証できるようにする。

#### 手順

1. `task-specification-creator/scripts/` に validator を追加する。
2. 4 成果物の該当行を抽出し、実測コマンド値と比較する。
3. 不一致時に file / field / expected / actual を出力する。
4. 正常系と異常系のテストを追加する。

#### 成果物

- validator 本体
- validator テスト

#### 完了条件

- 一致時は exit code 0、不一致時は非 0 を返す。

### Phase C: template / system spec 同期と検証

#### 目的

validator を Phase 12 の標準手順として固定する。

#### 手順

1. `task-specification-creator` の guide / template に validator 実行を追記する。
2. `aiworkflow-requirements` の `task-workflow.md` / `lessons-learned.md` / workflow 正本へ未タスク導線を追加する。
3. `verify-unassigned-links`、`audit --diff-from HEAD --target-file ...`、mirror sync を実行する。

#### 成果物

- 更新済み guide / template
- 更新済み system spec
- 検証ログ

#### 完了条件

- validator 利用手順が template に反映され、未タスク導線が system spec から辿れる。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 4 成果物の exact count を横断比較できる
- [ ] `current` と `baseline` を別 bucket として判定できる
- [ ] 不一致箇所を file / field 単位で出力できる

### 品質要件

- [ ] mirror sync 前提の source root が明記されている
- [ ] `verify-unassigned-links` と `audit-unassigned-tasks` の実測値を転記元として扱える
- [ ] validator の正常系 / 異常系テストがある

### ドキュメント要件

- [ ] `task-workflow.md` に関連未タスクとして登録されている
- [ ] `lessons-learned.md` に苦戦箇所と再利用手順が追記されている
- [ ] 本指示書が `## メタ情報` + `## 1..9` 構成を満たしている

---

## 6. 検証方法

### テストケース

- Case 1: 4 成果物の count が一致している場合、validator PASS
- Case 2: `unassigned-task-detection.md` だけ 0 件のまま残っている場合、validator FAIL
- Case 3: `current` / `baseline` を取り違えている場合、validator FAIL
- Case 4: `.claude` と `.agents` の source 差分で実測値がズレる場合、mirror sync 不足として判定できる

### 検証手順

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --diff-from HEAD \
  --target-file docs/30-workflows/unassigned-task/task-imp-phase12-exact-count-cross-document-validator-001.md
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
rsync -a .claude/skills/aiworkflow-requirements/ .agents/skills/aiworkflow-requirements/
diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements
rg -n "verify-unassigned-links|current violations|baseline violations|新規未割当タスク" \
  docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/phase-12/spec-update-summary.md \
  docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/phase-12/system-spec-sync-checklist.md \
  docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/phase-12/unassigned-task-detection.md \
  docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/verification-report.md
```

---

## 7. リスクと対策

| リスク                                                   | 影響度 | 発生確率 | 対策                                                                                                |
| -------------------------------------------------------- | ------ | -------- | --------------------------------------------------------------------------------------------------- |
| validator が string match 前提になり、文言変更に弱くなる | 中     | 中       | 比較対象を固定見出しと key/value 抽出へ寄せ、全文一致を避ける                                       |
| 既存 UT の責務と重複して運用が分散する                   | 中     | 中       | 本タスクは「横断比較 validator」、既存 UT は「resync 運用 / evidence 値同期」と役割を分けて明記する |
| current/baseline のどちらかだけ更新して誤判定する        | 高     | 中       | validator 出力で bucket 名を明示し、成果物側も `current` / `baseline` を別行に固定する              |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/aiworkflow-requirements/references/workflow-workspace-preview-search-resilience-guard.md`

### 参考資料

- `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/phase-12/spec-update-summary.md`
- `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/phase-12/system-spec-sync-checklist.md`
- `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/phase-12/unassigned-task-detection.md`
- `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/verification-report.md`

---

## 9. 備考

### 補足事項

- 本タスクは `UT-IMP-PHASE12-EVIDENCE-VALUE-SYNC-GUARD-001` の一般的な実測値同期と、`UT-IMP-PHASE12-RELATED-UT-EXACT-COUNT-RESYNC-GUARD-001` の row 移動後再同期を前提に、その上で「複数成果物の count 一致を検知する validator」に責務を限定する。
- 実装時は `workspace-preview-search-resilience-guard` だけをハードコードせず、任意 workflow の Phase 12 outputs に対して再利用できる形にする。
