# UT-IMP-TASK10A-D-SCREENSHOT-PURPOSE-DISAMBIGUATION-GUARD-001: Phase 11 画面証跡の状態名・検証目的分離ガード

## メタ情報

```yaml
issue_number: TBD
task_id: UT-IMP-TASK10A-D-SCREENSHOT-PURPOSE-DISAMBIGUATION-GUARD-001
task_name: Phase 11 画面証跡の状態名・検証目的分離ガード
category: 改善
target_feature: Phase 11 manual-test-result / screenshots 証跡管理
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-10A-D Phase 11/12 再確認（TC-02/TC-05 証跡解釈）
created_date: 2026-03-04
dependencies:
  [
    UT-IMP-TASK10A-C-PHASE11-SCREENSHOT-COVERAGE-GUARD-001,
    UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001,
  ]
```

| 項目         | 内容                                                            |
| ------------ | --------------------------------------------------------------- |
| タスクID     | UT-IMP-TASK10A-D-SCREENSHOT-PURPOSE-DISAMBIGUATION-GUARD-001    |
| タスク名     | Phase 11 画面証跡の状態名・検証目的分離ガード                   |
| 分類         | 改善                                                            |
| 対象機能     | `manual-test-result.md` と `outputs/phase-11/screenshots/` 管理 |
| 優先度       | 中                                                              |
| 見積もり規模 | 中規模                                                          |
| ステータス   | 未実施                                                          |
| 発見元       | TASK-10A-D Phase 11/12 再確認（TC-02/TC-05の証跡混在）          |
| 発見日       | 2026-03-04                                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-10A-D の再確認で、TC-02（analysis遷移時フォールバック）とTC-05（意図的エラー検証）のスクリーンショットが見た目上似ており、証跡の意図を読み違えるリスクが確認された。

### 1.2 問題点・課題

- `manual-test-result.md` の記述が「結果」中心になり、検証目的が省略されやすい
- `validate-phase11-screenshot-coverage` は件数整合を確認できるが、証跡意図の妥当性までは検証しない
- エラー表示系UIで「異常系検証」と「フォールバック表示」の区別が曖昧になりやすい

### 1.3 放置した場合の影響

- 画面レビュー時に誤判定が発生し、再撮影や再テストのコストが増加する
- 同種UIタスクで証跡品質が劣化し、Phase 11/12の再監査負荷が高まる
- `lessons-learned` の再利用性が低下する

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 11 の画面証跡に対して「状態名 + 検証目的」の二軸記録を必須化し、TC間の意図混同を防止する。

### 2.2 最終ゴール

1. `manual-test-result.md` の各TCに「状態名」「検証目的」「期待結果」が明記される
2. スクリーンショット一覧に証跡意図タグ（例: `fallback`, `intentional-error`）が記録される
3. `validate-phase11-screenshot-coverage` と併せて意図確認チェックを運用に組み込める

### 2.3 スコープ

#### 含むもの

- Phase 11 証跡記録フォーマットの拡張
- 画面証跡の意図分離チェック手順
- TASK-10A-D に基づく再利用ルールの仕様化

#### 含まないもの

- UI機能そのものの改修
- スクリーンショット撮影ツールの全面置換

### 2.4 成果物

- 証跡記録ルール（状態名 + 検証目的）
- 意図分離チェック手順（テンプレート/ガイド追記）
- 監査ログ（件数整合 + 意図整合）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Phase 11 でスクリーンショットを取得する運用が存在する
- `manual-test-result.md` と `phase-11-manual-test.md` を更新可能である
- `validate-phase11-screenshot-coverage.js` を実行できる

### 3.2 依存タスク

- UT-IMP-TASK10A-C-PHASE11-SCREENSHOT-COVERAGE-GUARD-001
- UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001

### 3.3 必要な知識

- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION/outputs/phase-11/manual-test-result.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`

### 3.4 推奨アプローチ

1. 各TCに「状態名」「検証目的」「結果」を明記するテンプレートを定義する
2. エラー表示系TCでは、`fallback` と `intentional-error` を区別する注記を必須化する
3. 件数検証（coverage）と意図検証（記述チェック）を連続実行する
4. 結果を `task-workflow` / `ui-ux-feature-components` / `lessons` に同一ターンで反映する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                     | 発見経緯                                              | 解決策                                            | 教訓                                   |
| ---------------------------------------- | ----------------------------------------------------- | ------------------------------------------------- | -------------------------------------- |
| TC-02/TC-05 の見た目が類似して意図が混同 | TASK-10A-D の再確認で証跡解釈が揺れた                 | TCごとに状態名+検証目的を必須化し、注記を統一     | UI証跡は見た目だけでなく目的を記録する |
| coverage PASS でも意図整合が担保されない | `validate-phase11-screenshot-coverage` は件数判定中心 | 記述チェック（grep/テンプレート）を追加する       | 件数整合と意味整合は別監査に分ける     |
| 再利用時に注記粒度がばらつく             | タスクごとに書き方が異なる                            | `fallback`/`intentional-error` のタグ語彙を標準化 | 証跡語彙を固定すると再利用しやすい     |

---

## 4. 実行手順

### Phase構成

- Phase A: 記録フォーマット定義
- Phase B: 証跡意図分離ルール適用
- Phase C: 検証と仕様同期

### Phase A: 記録フォーマット定義

#### 目的

証跡の意味を判定できる記録形式を定義する。

#### 手順

1. TC表に「状態名」「検証目的」列を追加する
2. エラー表示系の必須タグ（`fallback` / `intentional-error`）を定義する
3. 例示（TC-02/TC-05）をテンプレートへ追加する

#### 成果物

- 記録フォーマット定義

#### 完了条件

- すべてのTCで状態名+検証目的を記録できる

### Phase B: 証跡意図分離ルール適用

#### 目的

既存の画面証跡へ意図分離を反映する。

#### 手順

1. `manual-test-result.md` の該当TCへ注記を追記する
2. スクリーンショット一覧に意図タグを追記する
3. 記述漏れを `rg` で検出する

#### 成果物

- 更新済み `manual-test-result.md`

#### 完了条件

- TC-02/TC-05 を含むすべての対象TCで注記が統一される

### Phase C: 検証と仕様同期

#### 目的

件数整合と意図整合の両方を満たすことを確認する。

#### 手順

1. `validate-phase11-screenshot-coverage` を実行する
2. `rg` で状態名+検証目的の記述存在を確認する
3. 結果を `task-workflow.md` / `ui-ux-feature-components.md` / `lessons-learned.md` に同期する

#### 成果物

- 検証ログ
- 仕様書更新差分

#### 完了条件

- coverage PASS かつ記述チェック PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 各TCに状態名+検証目的が記録されている
- [ ] エラー表示系TCに意図タグ（fallback/intentional-error）が付与されている
- [ ] 記録形式が再利用可能なテンプレートとして定義されている

### 品質要件

- [ ] `validate-phase11-screenshot-coverage` が PASS
- [ ] `rg` による意図記述チェックが PASS
- [ ] TC間の証跡意図が衝突しない

### ドキュメント要件

- [ ] 本指示書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` 残課題テーブルへ登録されている
- [ ] `lessons-learned.md` に関連未タスクとして追加されている

---

## 6. 検証方法

### テストケース

- Case 1: coverage は PASS だが意図タグが欠落している場合に検出できる
- Case 2: TC-02 と TC-05 の目的文が同一記述になった場合に検出できる
- Case 3: 画面証跡とTC表の対応が崩れた場合に検出できる

### 検証手順

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION
rg -n "fallback|intentional-error|状態名|検証目的" docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION/outputs/phase-11/manual-test-result.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/unassigned-task/task-imp-task10a-d-screenshot-purpose-disambiguation-guard-001.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

---

## 7. リスクと対策

| リスク                                           | 影響度 | 発生確率 | 対策                                                      |
| ------------------------------------------------ | ------ | -------- | --------------------------------------------------------- |
| 記述ルールが複雑で運用されない                   | 中     | 中       | 必須タグを2種に限定し、テンプレート例を固定する           |
| coverage PASS を過信して意図チェックが省略される | 高     | 中       | Phase 11 完了条件に意図チェックを追加する                 |
| タスク間で語彙が揺れる                           | 中     | 中       | `fallback` / `intentional-error` の固定語彙を運用ルール化 |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

### 参考資料

- `docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION/outputs/phase-11/manual-test-result.md`
- `docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION/outputs/phase-11/screenshots/TC-02-analysis-view.png`
- `docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION/outputs/phase-11/screenshots/TC-05-error-state.png`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
TC-02（analysis遷移時フォールバック）と TC-05（意図的エラー検証）は見た目が近く、証跡意図の説明がないと誤判定しやすい。
```

### 補足事項

- 本タスクは画面証跡の記録品質改善を対象とし、UIコンポーネントの機能追加は対象外。
