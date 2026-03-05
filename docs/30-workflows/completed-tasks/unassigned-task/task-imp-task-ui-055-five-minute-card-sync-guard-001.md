# UT-IMP-TASK-UI-055-FIVE-MINUTE-CARD-SYNC-GUARD-001: TASK-UI-00-FOUNDATION-REFLECTION-AUDIT 5分解決カード同期ガード

## メタ情報

```yaml
issue_number: TBD
task_id: UT-IMP-TASK-UI-055-FIVE-MINUTE-CARD-SYNC-GUARD-001
task_name: TASK-UI-00-FOUNDATION-REFLECTION-AUDIT 5分解決カード同期ガード
category: 改善
target_feature: Phase 12 仕様同期（task-workflow / lessons-learned / ui-ux-feature-components）
priority: 中
scale: 小規模
status: 未実施
source_phase: TASK-UI-00-FOUNDATION-REFLECTION-AUDIT 最終追補監査（2026-03-05 12:21 JST）
created_date: 2026-03-05
dependencies:
  [
    TASK-UI-00-FOUNDATION-REFLECTION-AUDIT,
    UT-UI-055-001,
    UT-IMP-TASK-UI-00-ORGANISMS-PHASE12-SYNC-GUARD-001,
  ]
```

| 項目         | 内容                                                                                           |
| ------------ | ---------------------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-TASK-UI-055-FIVE-MINUTE-CARD-SYNC-GUARD-001                                             |
| タスク名     | TASK-UI-00-FOUNDATION-REFLECTION-AUDIT 5分解決カード同期ガード                                 |
| 分類         | 改善                                                                                           |
| 対象機能     | Phase 12 仕様同期（`task-workflow.md` / `lessons-learned.md` / `ui-ux-feature-components.md`） |
| 優先度       | 中                                                                                             |
| 見積もり規模 | 小規模                                                                                         |
| ステータス   | 未実施                                                                                         |
| 発見元       | TASK-UI-00-FOUNDATION-REFLECTION-AUDIT 最終追補監査（2026-03-05 12:21 JST）                    |
| 発見日       | 2026-03-05                                                                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-UI-00-FOUNDATION-REFLECTION-AUDIT の最終追補で「同種課題の5分解決カード」を導入したが、実運用は `task-workflow` / `lessons-learned` / `ui-ux-feature-components` の3仕様書同時更新を手作業に依存している。

### 1.2 問題点・課題

- 5分解決カードを1仕様書だけ更新しても検知しづらい。
- 5ステップ順序（実体固定→仕様是正→画面証跡→未タスク監査→台帳同期）が仕様書ごとにズレる可能性がある。
- 検証値（13/13, 28項目, TC, links, current/baseline）の転記が分散し、再監査で説明コストが増える。

### 1.3 放置した場合の影響

- 同種課題の再実行時に初動手順が統一されず、再発防止効果が弱くなる。
- Phase 12 再確認で「実装済みだが同期漏れ」の差し戻しが継続する。
- 苦戦箇所の教訓が仕様間で断片化し、再利用性が低下する。

---

## 2. 何を達成するか（What）

### 2.1 目的

5分解決カードを3仕様書で同一内容・同一順序で同期する運用ガードを整備し、Phase 12 追補時の再発を防止する。

### 2.2 最終ゴール

1. `task-workflow.md` / `lessons-learned.md` / `ui-ux-feature-components.md` に同一カードが記録される。
2. 5ステップ順序が3仕様書で一致する。
3. 未タスク監査（`--target-file`, `--diff-from HEAD`）が `currentViolations=0` で再現できる。

### 2.3 スコープ

#### 含むもの

- 5分解決カード同期ルールの標準化（3仕様書同時更新）
- 同期確認コマンド（`rg` ベース）と完了チェックの明文化
- 関連未タスク台帳（task-workflow / lessons / ui-ux-feature）の同期

#### 含まないもの

- EmptyState コントラスト課題（UT-UI-055-001）そのものの実装
- 既存 baseline 違反の一括解消
- Phase 1〜11 の仕様構造変更

### 2.4 成果物

- 本未タスク仕様書
- `task-workflow.md` の残課題登録と TASK-055 節追補
- `lessons-learned.md` / `ui-ux-feature-components.md` の関連未タスク導線追補

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` の監査スクリプトが実行できること
- `aiworkflow-requirements` の正本仕様書を更新できること
- TASK-UI-00-FOUNDATION-REFLECTION-AUDIT の最終追補（2026-03-05 12:21 JST）が反映済みであること

### 3.2 依存タスク

- TASK-UI-00-FOUNDATION-REFLECTION-AUDIT
- UT-UI-055-001
- UT-IMP-TASK-UI-00-ORGANISMS-PHASE12-SYNC-GUARD-001

### 3.3 必要な知識

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`

### 3.4 推奨アプローチ

1. 5分解決カードの標準本文を1つ定義し、3仕様書へ同一転記する。
2. 検証値（13/13, 28項目, TC, links, current/baseline）を1ソースで確定して同値転記する。
3. `rg` と監査スクリプトで同期漏れを機械確認してから完了判定する。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                           | 発見経緯                                                      | 解決策                                                                                                                   | 教訓                                                           |
| ------------------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| 検証コマンド実行経路ドリフト   | TASK-055 最終再確認で `not found` / `MODULE_NOT_FOUND` を経験 | `which` + `rg --files .claude/skills` で実体確認後、`node .claude/skills/task-specification-creator/scripts/*.js` に統一 | 再監査は「実体探索→固定コマンド」の順を固定する                |
| 再撮影証跡の時刻ドリフト       | 11:43 再撮影後に 11:51 再撮影が入り、仕様台帳の時刻更新が分散 | `stat` 実測時刻を起点に成果物と仕様台帳を同一ターンで更新                                                                | UI再撮影は1トランザクションで同期する                          |
| 5分解決カードの3仕様書同期漏れ | `task-workflow` 先行更新で他仕様への転記が遅延しやすい        | 3仕様書同時更新を完了条件へ追加し、`rg` で見出し/順序を検証                                                              | カードは「要約」ではなく「再実行手順」なので単独更新を禁止する |

---

## 4. 実行手順

### Phase構成

- Phase A: カード同期ルール確定
- Phase B: 仕様書同期と台帳反映
- Phase C: 監査と完了判定

### Phase A: カード同期ルール確定

#### 目的

3仕様書で共通化する5分解決カード本文を固定する。

#### 手順

1. TASK-055 の5分解決カード本文を正本として抽出する。
2. 5ステップ順序と検証ゲート記述を固定する。
3. 同期対象仕様書（task-workflow / lessons / ui-ux-feature）を確定する。

#### 成果物

- 同期対象3仕様書のカード共通本文

#### 完了条件

- 3仕様書へ転記可能な共通本文が確定している。

### Phase B: 仕様書同期と台帳反映

#### 目的

未タスク指示書と system spec 台帳を同一ターンで同期する。

#### 手順

1. `docs/30-workflows/unassigned-task/` に本未タスクを配置する。
2. `task-workflow.md` の TASK-055 節と残課題テーブルに本タスクIDを追加する。
3. `lessons-learned.md` と `ui-ux-feature-components.md` の関連未タスク表へ本タスクIDを追加する。

#### 成果物

- 更新済み未タスク指示書
- 更新済み system spec 3仕様書

#### 完了条件

- 3仕様書すべてに同一タスクIDと同一参照パスが存在する。

### Phase C: 監査と完了判定

#### 目的

未タスク仕様書の形式とリンク整合を機械検証する。

#### 手順

1. `verify-unassigned-links.js` を実行して参照切れを確認する。
2. `audit-unassigned-tasks.js --target-file` で本ファイルの形式監査を実施する。
3. `audit-unassigned-tasks.js --diff-from HEAD` で今回差分監査を実施する。

#### 成果物

- 監査結果ログ（links / target-file / diff-from）

#### 完了条件

- `missing=0` かつ `currentViolations.total=0` を満たす。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 5分解決カードが3仕様書で同一内容になっている
- [ ] 5ステップ順序が3仕様書で一致している
- [ ] 本未タスクIDが残課題テーブルと関連未タスク表に登録されている

### 品質要件

- [ ] `verify-unassigned-links` が PASS している
- [ ] `audit --target-file` が `currentViolations=0` である
- [ ] `audit --diff-from HEAD` が `currentViolations=0` である

### ドキュメント要件

- [ ] 本指示書が `## メタ情報` + `## 1..9` の構造を満たしている
- [ ] `## 3.5 実装課題と解決策` に親タスク苦戦箇所が反映されている
- [ ] aiworkflow-requirements の変更履歴とLOGSに追補記録がある

---

## 6. 検証方法

### テストケース

- Case 1: 3仕様書の5分解決カード見出しがすべて存在する
- Case 2: 本未タスクの参照パスが3仕様書で一致する
- Case 3: 未タスク監査で形式違反が0件である

### 検証手順

```bash
rg -n "同種課題の5分解決カード|UT-IMP-TASK-UI-055-FIVE-MINUTE-CARD-SYNC-GUARD-001" \
  .claude/skills/aiworkflow-requirements/references/task-workflow.md \
  .claude/skills/aiworkflow-requirements/references/lessons-learned.md \
  .claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md

node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json \
  --target-file docs/30-workflows/completed-tasks/unassigned-task/task-imp-task-ui-055-five-minute-card-sync-guard-001.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

---

## 7. リスクと対策

| リスク                                 | 影響度 | 発生確率 | 対策                                                                |
| -------------------------------------- | ------ | -------- | ------------------------------------------------------------------- |
| 3仕様書のどれか1つだけ更新漏れする     | 中     | 中       | 3仕様書同時 `rg` 検証を完了条件に固定する                           |
| 5ステップ順序が仕様書間でズレる        | 中     | 中       | 共通本文を1ソースで定義して転記し、順序チェックを実施する           |
| baseline違反を今回差分違反と誤判定する | 中     | 低       | 合否は `currentViolations` 固定、baselineは監視値として分離記録する |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`

### 参考資料

- `docs/30-workflows/completed-tasks/task-055-ui-00-foundation-reflection-audit/outputs/phase-12/spec-update-summary.md`
- `docs/30-workflows/completed-tasks/task-055-ui-00-foundation-reflection-audit/outputs/phase-12/unassigned-task-detection.md`

---

## 9. 備考

### 補足事項

- 本タスクは「TASK-055 で導入済みの5分解決カード運用を、3仕様書同時同期で再発防止する」ことを対象とする。
- UI実装そのもの（UT-UI-055-001）は本タスクのスコープ外とする。
