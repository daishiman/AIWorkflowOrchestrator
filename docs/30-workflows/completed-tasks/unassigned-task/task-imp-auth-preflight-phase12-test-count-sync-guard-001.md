# UT-IMP-AUTH-PREFLIGHT-PHASE12-TEST-COUNT-SYNC-GUARD-001: AUTH preflight 実装のPhase 12数値同期ガード

## メタ情報

```yaml
issue_number: 962
task_id: UT-IMP-AUTH-PREFLIGHT-PHASE12-TEST-COUNT-SYNC-GUARD-001
task_name: AUTH preflight 実装のPhase 12数値同期ガード
category: 改善
target_feature: TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001 の再監査時に発生したテスト件数ドリフト再発防止
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001 Phase 12 再監査（2026-03-04）
created_date: 2026-03-04
dependencies:
  [
    TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001,
    UT-IMP-PHASE12-SYSTEM-SPEC-EXTRACTION-GUARD-001,
    UT-IMP-PHASE12-EVIDENCE-VALUE-SYNC-GUARD-001,
  ]
```

| 項目         | 値                                                                    |
| ------------ | --------------------------------------------------------------------- |
| タスクID     | UT-IMP-AUTH-PREFLIGHT-PHASE12-TEST-COUNT-SYNC-GUARD-001               |
| タスク名     | AUTH preflight 実装のPhase 12数値同期ガード                           |
| 分類         | 改善                                                                  |
| 対象機能     | 認証 preflight 実装タスクの Phase 9/10/台帳 数値同期                  |
| 優先度       | 中                                                                    |
| 見積もり規模 | 中規模                                                                |
| ステータス   | 未実施                                                                |
| 発見元       | TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001 Phase 12 再監査（2026-03-04） |
| 発見日       | 2026-03-04                                                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001` の Phase 12 再監査で、`quality-report.md` / `final-review-result.md` / `task-workflow.md` のテスト件数が `264` と `267` で一時的に不一致になった。  
実装自体は正しくても、成果物間の数値同期が弱いと再監査で差し戻しが発生する。

### 1.2 問題点・課題

- 回帰テスト追加後の実測値を、Phase 9/10/台帳へ同時反映するガードが弱い。
- 数値更新後の旧値残存チェック（`rg "264|7ファイル"`）が運用として固定されていない。
- SubAgent分担をしていても「数値単一ソース」の責任境界が曖昧になりやすい。

### 1.3 放置した場合の影響

- Phase 12 完了条件の説明責任が低下し、同種タスクで同じ差し戻しが再発する。
- `current=0` でも文書整合性不備として追加再監査が必要になる。
- 実装よりドキュメント整合作業に時間を消費する。

---

## 2. 何を達成するか（What）

### 2.1 目的

AUTH preflight 実装系タスクで、Phase 6 実測値を単一ソースに固定し、Phase 9/10/台帳へ同一ターンで同期する標準ガードを確立する。

### 2.2 最終ゴール

1. 数値系証跡の正本を「最新テスト実行ログ」に統一できる。
2. `quality-report.md` / `final-review-result.md` / `task-workflow.md` を同一ターンで同期できる。
3. `rg "264|7ファイル"` で旧値残存 0 件を機械確認できる。
4. `verify-all-specs` / `validate-phase-output` / `audit --diff-from HEAD` の再検証結果を一貫形式で残せる。

### 2.3 スコープ

#### 含むもの

- AUTH preflight 系タスクの Phase 12 数値同期ガード運用
- SubAgent責務分離（実測値固定・台帳同期・監査）
- `aiworkflow-requirements` への台帳/教訓同期

#### 含まないもの

- 認証 preflight の追加実装（Main/Preload/Renderer の新機能）
- 既存 baseline 違反の全件解消
- UI デザイン刷新

### 2.4 成果物

- 本未タスク仕様書
- `task-workflow.md` 残課題登録行
- `lessons-learned.md` 関連未タスク導線
- 検証ログ（links/audit/current判定）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` の未タスクフォーマット要件（10見出し）を満たせること。
- `aiworkflow-requirements` の `resource-map/topic-map/search-spec` を参照できること。
- `verify-unassigned-links` / `audit-unassigned-tasks` を実行できること。

### 3.2 依存タスク

- `TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001`（完了）
- `UT-IMP-PHASE12-SYSTEM-SPEC-EXTRACTION-GUARD-001`（未実施）
- `UT-IMP-PHASE12-EVIDENCE-VALUE-SYNC-GUARD-001`（未実施）

### 3.3 必要な知識

- `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`

### 3.4 推奨アプローチ（SubAgent分担）

1. SubAgent-A（実測値固定）: Phase 6 実行ログから正本数値を抽出する。
2. SubAgent-B（台帳同期）: Phase 9/10/`task-workflow.md` を同時更新する。
3. SubAgent-C（教訓反映）: `lessons-learned.md` に再発条件と簡潔手順を同期する。
4. SubAgent-D（検証）: `verify`/`validate`/`audit` を実行し `current=0` を確定する。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                           | 発見経緯                                      | 解決策                                            | 教訓                                   |
| ---------------------------------------------- | --------------------------------------------- | ------------------------------------------------- | -------------------------------------- | ----------------------------------------------------- |
| `AUTHENTICATION_ERROR` が UI で識別不能        | Main 失敗契約が `error` 文字列のみだった      | `errorCode` を Main→Preload→Renderer で伝搬       | 契約拡張は3層同時更新が必須            |
| preflight 判定と実行時判定の乖離               | store 値のみで事前判定し env キーを見落とした | `auth-key:exists` を store->env fallback へ統一   | 判定順を仕様書に固定しテストで担保する |
| Phase 9/10/台帳のテスト件数ドリフト（264↔267） | 回帰テスト増加後に成果物を部分更新で止めた    | 実測値単一ソース + 3文書同一ターン同期 + `rg "264 | 7ファイル"` 検査                       | 数値証跡は「同時更新 + 旧値ゼロ確認」を完了条件にする |

---

## 4. 実行手順

### Phase構成

- Phase A: 仕様抽出（aiworkflow-requirements）
- Phase B: 数値同期ガード実装（運用ルール化）
- Phase C: 台帳/教訓反映
- Phase D: 監査・完了判定

### Phase A: 仕様抽出（aiworkflow-requirements）

1. `resource-map.md` で Phase 12/品質/未タスク運用に必要な参照を確定する。
2. `search-spec.js` で `preflight`, `テスト件数`, `Phase 12` を検索し不足参照を補完する。
3. `topic-map.md` で該当節を特定する。

### Phase B: 数値同期ガード実装（運用ルール化）

1. Phase 6 の最新テスト実行結果を正本値として固定する。
2. Phase 9（quality）/ Phase 10（final review）/ `task-workflow.md` に同一値を同時反映する。
3. `rg "264|7ファイル"` で旧値残存 0 件を確認する。

### Phase C: 台帳/教訓反映

1. `task-workflow.md` 残課題テーブルへ本未タスクを登録する。
2. `lessons-learned.md` の関連未タスクへ本タスクを登録する。
3. 変更履歴（task-workflow / lessons / SKILL）を更新する。

### Phase D: 監査・完了判定

1. `verify-unassigned-links.js` を実行し `missing=0` を確認する。
2. `audit-unassigned-tasks.js --json --target-file <本ファイル>` を実行し `currentViolations=0` を確認する。
3. `audit-unassigned-tasks.js --json --diff-from HEAD` を実行し今回差分の健全性を確認する。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 数値系証跡の正本が「最新実行ログ」に固定されている
- [ ] Phase 9/10/台帳の同時同期手順が定義されている
- [ ] SubAgent責務（A/B/C/D）が明文化されている

### 品質要件

- [ ] `rg "264|7ファイル"` の旧値残存チェックが完了条件に含まれる
- [ ] `current`/`baseline` の判定軸が分離されている
- [ ] `currentViolations.total=0` を合否基準として明記している

### ドキュメント要件

- [ ] 本ファイルが `docs/30-workflows/unassigned-task/` に存在する
- [ ] `task-workflow.md` 残課題テーブルに登録済み
- [ ] `lessons-learned.md` の関連未タスク導線に登録済み

---

## 6. 検証方法

### テストケース

- Case 1: 本指示書が 10見出し（`メタ情報 + 1..9`）を満たす
- Case 2: `task-workflow.md` から本指示書へのリンクが解決できる
- Case 3: `audit --target-file` で `currentViolations=0`
- Case 4: `audit --diff-from HEAD` で今回差分に新規違反がない

### 検証手順

```bash
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "preflight Phase 12 テスト件数" -C 3
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json \
  --target-file docs/30-workflows/unassigned-task/task-imp-auth-preflight-phase12-test-count-sync-guard-001.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
rg -n "264|7ファイル" docs/30-workflows/TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001/outputs/phase-{9,10} \
  .claude/skills/aiworkflow-requirements/references/task-workflow.md
```

---

## 7. リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                                                            |
| ------------------------------------ | ------ | -------- | --------------------------------------------------------------- | -------------------------------------------- |
| 数値同期が担当者依存で再ドリフトする | 高     | 中       | SubAgent-A/B責務を固定し、同一ターン同期を必須化する            |
| baseline違反を今回差分違反と誤認する | 中     | 中       | 判定は `currentViolations` 固定、baselineは監視値で分離記録する |
| 旧値検査が手順から漏れる             | 中     | 中       | `rg "264                                                        | 7ファイル"` を完了条件チェックへ固定追加する |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`

### 関連タスク

- `TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001`
- `UT-IMP-PHASE12-SYSTEM-SPEC-EXTRACTION-GUARD-001`
- `UT-IMP-PHASE12-EVIDENCE-VALUE-SYNC-GUARD-001`

### 関連スクリプト

- `.claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`
- `.claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js`
- `.claude/skills/aiworkflow-requirements/scripts/search-spec.js`

---

## 9. 備考

- 本タスクは機能実装ではなく、Phase 12 数値整合の再発防止を目的とした運用ガードである。
- 完了判定は「新規違反ゼロ（current=0）」を採用し、baseline は別タスクで段階改善する。
