# UT-IMP-PHASE12-UI-TIMESTAMP-SYSTEM-SPEC-SYNC-GUARD-001: Phase 12 UI証跡時刻とSystem Spec同時同期ガード

## メタ情報

```yaml
issue_number: 1001
task_id: UT-IMP-PHASE12-UI-TIMESTAMP-SYSTEM-SPEC-SYNC-GUARD-001
task_name: Phase 12 UI証跡時刻とSystem Spec同時同期ガード
category: 改善
target_feature: TASK-UI-00-MOLECULES の Phase 11/12 証跡同期
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-UI-00-MOLECULES Phase 12 再確認（2026-03-04）
created_date: 2026-03-04
dependencies:
  [
    UT-IMP-PHASE12-IMPLEMENTATION-GUIDE-QUALITY-GATE-001,
    UT-IMP-PHASE12-EVIDENCE-VALUE-SYNC-GUARD-001,
  ]
```

| 項目         | 内容                                                                |
| ------------ | ------------------------------------------------------------------- |
| タスクID     | UT-IMP-PHASE12-UI-TIMESTAMP-SYSTEM-SPEC-SYNC-GUARD-001              |
| タスク名     | Phase 12 UI証跡時刻とSystem Spec同時同期ガード                      |
| 分類         | 改善                                                                |
| 対象機能     | TASK-UI-00-MOLECULES の Phase 11/12 証跡同期（画面証跡 + 仕様正本） |
| 優先度       | 中                                                                  |
| 見積もり規模 | 中規模                                                              |
| ステータス   | 未実施                                                              |
| 発見元       | TASK-UI-00-MOLECULES Phase 12 再確認（苦戦箇所・2026-03-04）        |
| 発見日       | 2026-03-04                                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UIスクリーンショットを再取得した後、`manual-test-result.md` / `screenshot-coverage.md` / `spec-update-summary.md` の時刻が旧値のまま残るケースが再発した。  
さらに、system spec 側（`task-workflow.md` / `ui-ux-components.md` / `lessons-learned.md`）への同期が別ターン化し、証跡の説明責任が弱くなる局面があった。

### 1.2 問題点・課題

- UI再撮影後の時刻同期が手作業で、反映先漏れが起きやすい
- 画面証跡（workflow）と仕様正本（aiworkflow-requirements）が分離更新されやすい
- `audit --diff-from HEAD` の `current`/`baseline` 判定を誤読し、不要な再修正が発生しやすい

### 1.3 放置した場合の影響

- Phase 11/12 の証跡鮮度が担保されず、再監査で差し戻しが発生する
- 同種UIタスクで毎回時刻同期の手戻りが発生する
- 「実装済みだが仕様同期不足」の状態が残り、ナレッジ再利用性が下がる

---

## 2. 何を達成するか（What）

### 2.1 目的

UI再撮影時の証跡時刻と system spec 更新を同一ターンで完了できる運用ガードを定義する。

### 2.2 最終ゴール

1. UI再撮影時に `stat` 実測時刻を 3成果物（manual/screenshot/spec-update）へ必ず同期する
2. 同ターンで `task-workflow.md` / `ui-ux-components.md` / `lessons-learned.md` に反映する
3. 未タスク監査の合否を `currentViolations=0` に固定し、baseline を監視値として分離記録する
4. 上記を再利用可能なチェックリストと検証コマンドセットとして固定する

### 2.3 スコープ

#### 含むもの

- UI再撮影時刻同期の標準手順
- workflow成果物と system spec 正本の同時同期ルール
- `current/baseline` 判定ルールの明文化

#### 含まないもの

- 既存 baseline 違反の一括解消
- 非UIタスクの Phase 11 証跡手順変更
- 実装コードの機能追加

### 2.4 成果物

- 本未タスク仕様書
- 同期ガード手順（チェックリスト + コマンドセット）
- `task-workflow.md` / `lessons-learned.md` への再発防止導線

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UIタスクの Phase 11 スクリーンショット再取得が可能である
- `task-specification-creator` / `aiworkflow-requirements` の検証スクリプトが利用可能である
- system spec 正本（`references/`）を更新可能である

### 3.2 依存タスク

- UT-IMP-PHASE12-IMPLEMENTATION-GUIDE-QUALITY-GATE-001
- UT-IMP-PHASE12-EVIDENCE-VALUE-SYNC-GUARD-001

### 3.3 必要な知識

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

### 3.4 推奨アプローチ

1. UI再撮影直後に `stat` で実測時刻を取得し、3成果物へ同一ターンで同期する
2. 続けて system spec 3仕様書（task-workflow/ui-ux-components/lessons）へ同一時刻・同一証跡を転記する
3. `verify-all-specs` / `validate-phase-output` / `validate-phase11-screenshot-coverage` / `verify-unassigned-links` / `audit --diff-from HEAD` を連続実行し、合否を固定する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                      | 発見経緯                                                      | 解決策                                                                                                   | 教訓                                              |
| --------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| UI再撮影後に時刻記録が旧値のまま残る                      | TASK-UI-00-MOLECULES 再確認で `17:09` と `18:04` の混在を確認 | `stat` 実測値を `manual-test-result.md` / `screenshot-coverage.md` / `spec-update-summary.md` に同時反映 | UI再撮影は「再撮影→stat→文書同期」を1セット化する |
| workflow成果物と system spec 正本の反映タイミングがずれる | 画面証跡更新後に `ui-ux-components.md` の履歴更新が遅延       | workflow更新と同ターンで `task-workflow` / `ui-ux-components` / `lessons` を更新する運用へ統一           | 証跡更新と正本更新を分離すると再発する            |
| `audit` 判定で baseline を fail と誤読しやすい            | `audit --diff-from HEAD` 実行時に baseline 件数を合否扱いした | 合否軸を `currentViolations` 固定、baseline は監視値として別記録                                         | current/baseline の役割分離を必須ルール化する     |

---

## 4. 実行手順

### Phase構成

- Phase A: UI証跡時刻の実測同期
- Phase B: system spec 同時反映
- Phase C: 監査実行と合否固定

### Phase A: UI証跡時刻の実測同期

#### 目的

再撮影済みスクリーンショットの時刻を正とし、Phase 11/12 成果物へ同期する。

#### 手順

1. `screenshot:<feature>` で UIスクリーンショットを再取得する
2. `stat -f "%Sm %N" -t "%Y-%m-%d %H:%M:%S %Z"` で実測時刻を取得する
3. `manual-test-result.md` / `screenshot-coverage.md` / `spec-update-summary.md` の時刻欄を更新する

#### 成果物

- 時刻同期済み Phase 11/12 証跡

#### 完了条件

- 3成果物の時刻が `stat` 実測値と一致している

### Phase B: system spec 同時反映

#### 目的

workflow 側の証跡更新を system spec 正本へ同一ターンで同期する。

#### 手順

1. `task-workflow.md` に証跡時刻と苦戦箇所を反映する
2. `ui-ux-components.md` に画面証跡時刻と変更履歴を反映する
3. `lessons-learned.md` に再発条件付き教訓と簡潔手順を追記する

#### 成果物

- 仕様正本3ファイルの同期記録

#### 完了条件

- 3仕様書で同一時刻・同一証跡が確認できる

### Phase C: 監査実行と合否固定

#### 目的

証跡同期と未タスク登録の品質を機械検証で固定する。

#### 手順

1. `verify-all-specs` / `validate-phase-output` / `validate-phase11-screenshot-coverage` を実行する
2. `verify-unassigned-links` を実行する
3. `audit-unassigned-tasks --diff-from HEAD` を実行し、`currentViolations=0` で判定する

#### 成果物

- 検証ログ

#### 完了条件

- `missing=0` かつ `currentViolations=0`

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] UI再撮影時刻の同期対象（manual/screenshot/spec-update）が定義されている
- [ ] system spec 3仕様書（task-workflow/ui-ux-components/lessons）への同時反映手順が定義されている
- [ ] `current/baseline` 判定ルールが明文化されている

### 品質要件

- [ ] `validate-phase11-screenshot-coverage` が PASS する
- [ ] `verify-unassigned-links` が `missing=0` である
- [ ] `audit --diff-from HEAD` が `currentViolations=0` である

### ドキュメント要件

- [ ] 本未タスク仕様書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` 残課題テーブルへ登録されている
- [ ] `lessons-learned.md` に関連未タスクとして登録されている

---

## 6. 検証方法

### テストケース

- Case 1: UI再撮影後に3成果物の時刻が全て一致する
- Case 2: system spec 3仕様書で同一時刻・同一証跡が確認できる
- Case 3: `audit` で `current=0` かつ `baseline>0` を正しく分離記録できる
- Case 4: 本未タスク仕様書の見出しフォーマット（`## メタ情報` + `## 1..9`）が適合する

### 検証手順

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/task-ui-00-molecules --json
stat -f "%Sm %N" -t "%Y-%m-%d %H:%M:%S %Z" docs/30-workflows/completed-tasks/task-ui-00-molecules/outputs/phase-11/screenshots/*.png
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-ui-00-molecules --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-ui-00-molecules
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
# completed-tasks 配下へ移動後は --target-file 対象外のため、差分監査を使用
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                                                                       |
| ------------------------------ | ------ | -------- | -------------------------------------------------------------------------- |
| 時刻同期対象ファイルの更新漏れ | 中     | 中       | 同期対象3ファイルをチェックリスト固定し、更新後に `rg -n "JST"` で確認する |
| system spec 反映の順序ズレ     | 中     | 中       | workflow成果物更新直後に 3仕様書を同ターン更新する                         |
| baseline 誤読による再作業      | 中     | 低       | 合否は `currentViolations` 固定、baseline は監視欄へ分離記録する           |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `docs/30-workflows/completed-tasks/task-ui-00-molecules/outputs/phase-11/manual-test-result.md`
- `docs/30-workflows/completed-tasks/task-ui-00-molecules/outputs/phase-11/screenshot-coverage.md`
- `docs/30-workflows/completed-tasks/task-ui-00-molecules/outputs/phase-12/spec-update-summary.md`

### 参考資料

- `.claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js`
- `.claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js`
- `.claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
UI再撮影後の時刻が成果物と仕様正本でずれて残ると、再監査で証跡として採用できない。
```

### 補足事項

- 本タスクは「証跡同期運用の標準化」が目的であり、UI機能自体の追加実装は対象外とする。
