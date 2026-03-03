# UT-IMP-TASK10A-C-PHASE11-SCREENSHOT-COVERAGE-GUARD-001: TASK-10A-C Phase 11 スクリーンショット証跡ガード

## メタ情報

```yaml
issue_number: 950
task_id: UT-IMP-TASK10A-C-PHASE11-SCREENSHOT-COVERAGE-GUARD-001
task_name: TASK-10A-C Phase 11 スクリーンショット証跡ガード
category: 改善
target_feature: SkillCreateWizard UI検証（再撮影 + TCカバレッジ + 鮮度確認）
priority: 中
scale: 小規模
status: 未実施
source_phase: TASK-10A-C Phase 11/12再確認（2026-03-03）
created_date: 2026-03-03
dependencies:
  [UT-TASK-10A-B-007, UT-UI-05B-001, UT-IMP-TASK10A-C-FIVE-SPEC-SYNC-GUARD-001]
```

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | UT-IMP-TASK10A-C-PHASE11-SCREENSHOT-COVERAGE-GUARD-001       |
| タスク名     | TASK-10A-C Phase 11 スクリーンショット証跡ガード             |
| 分類         | 改善                                                         |
| 対象機能     | SkillCreateWizard UI検証（再撮影 + TCカバレッジ + 鮮度確認） |
| 優先度       | 中                                                           |
| 見積もり規模 | 小規模                                                       |
| ステータス   | 未実施                                                       |
| 発見元       | TASK-10A-C Phase 11/12再確認（苦戦箇所）                     |
| 発見日       | 2026-03-03                                                   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-10A-C の画面検証では、スクリーンショット再撮影とTC紐付け検証をセット運用することで証跡品質を維持できた。一方で、この手順は明文化しないと省略されやすい。

### 1.2 問題点・課題

- `screenshot:*` 実行後に `ls` のみ確認して完了判定する運用が残りやすい。
- `validate-phase11-screenshot-coverage` 未実行でも、画像枚数だけでは欠落を検知できない。
- 取得時刻の鮮度確認が台帳へ残らず、再監査時に「いつの証跡か」を再調査する必要がある。

### 1.3 放置した場合の影響

- TC欠落や命名ズレを見逃し、手動テスト結果の信頼性が低下する。
- UI再監査で差し戻しが発生し、Phase 12 の完了判定が遅延する。
- 同種UIタスクで再撮影とカバレッジ検証が分離され、品質が不安定になる。

---

## 2. 何を達成するか（What）

### 2.1 目的

UIタスクの画面証跡を「再撮影 + TCカバレッジ + 鮮度確認」の3点セットで標準化し、Phase 11/12 の検証を再現可能にする。

### 2.2 最終ゴール

1. `screenshot:<feature>` 実行と `validate-phase11-screenshot-coverage` 実行が必須手順として固定される。
2. `expected TC` と `covered TC` の一致を完了条件として記録できる。
3. スクリーンショット更新時刻を証跡として台帳へ転記できる。

### 2.3 スコープ

#### 含むもの

- Phase 11 UI証跡検証手順の標準化
- TCカバレッジ検証コマンドの必須化
- 鮮度確認（更新時刻）記録ルールの追加

#### 含まないもの

- スクリーンショット取得スクリプト自体の機能改修
- UIコンポーネントの見た目や動作の変更
- 非UIタスクへの画面証跡要件適用

### 2.4 成果物

- 本未タスク仕様書（本ファイル）
- UI証跡ガード手順の仕様反映差分
- `task-workflow.md` / `lessons-learned.md` の関連未タスク追記

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `pnpm --filter @repo/desktop run screenshot:<feature>` が実行可能であること
- `validate-phase11-screenshot-coverage.js` が利用可能であること
- 対象workflowの `outputs/phase-11/screenshots/` が存在すること

### 3.2 依存タスク

- UT-TASK-10A-B-007
- UT-UI-05B-001
- UT-IMP-TASK10A-C-FIVE-SPEC-SYNC-GUARD-001

### 3.3 必要な知識

- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js`
- `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/manual-test-result.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

### 3.4 推奨アプローチ

1. UI証跡検証を「再撮影」「TCカバレッジ」「鮮度確認」の3フェーズに分離する。
2. 3フェーズの実行結果を `task-workflow` と `lessons` に同時転記する。
3. `expected TC == covered TC` を満たさない場合は即未完了判定にする。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                 | 発見経緯                                    | 解決策                                                   | 教訓                               |
| ------------------------------------ | ------------------------------------------- | -------------------------------------------------------- | ---------------------------------- |
| 再撮影後にTC紐付け検証を省略しやすい | TASK-10A-C 再監査で確認                     | `validate-phase11-screenshot-coverage` を必須コマンド化  | 画像の存在確認だけでは不十分       |
| 更新時刻の記録が残らない             | 再監査時に証跡鮮度の追跡が必要になった      | `ls -lt` の結果を台帳へ転記する運用を追加                | UI証跡は時刻情報まで必要           |
| UI証跡と仕様書更新が分離される       | Phase 11 と Phase 12 を別担当で進めると発生 | `task-workflow` / `lessons` へ同一ターン同期を完了条件化 | 証跡更新と仕様更新は同時完了が前提 |

---

## 4. 実行手順

### Phase構成

- Phase A: UI証跡取得ルールの固定
- Phase B: 機械検証の標準化
- Phase C: 台帳同期と監査

### Phase A: UI証跡取得ルールの固定

#### 目的

再撮影条件と対象TCを明確化し、取得漏れを防ぐ。

#### 手順

1. 対象workflowと対象TC一覧を固定する。
2. `screenshot:<feature>` 実行を必須手順として定義する。
3. 画像保存先と命名規則を確認する。

#### 成果物

- UI証跡取得ルール

#### 完了条件

- 対象TCと取得手順が固定されている。

### Phase B: 機械検証の標準化

#### 目的

TC欠落を機械判定できる運用にする。

#### 手順

1. `validate-phase11-screenshot-coverage` を実行する。
2. `expected TC` と `covered TC` を記録する。
3. `ls -lt` で更新時刻を確認する。

#### 成果物

- カバレッジ検証結果
- 鮮度確認結果

#### 完了条件

- `expected == covered` かつ鮮度確認済みである。

### Phase C: 台帳同期と監査

#### 目的

検証結果を仕様書へ固定し、再利用可能な知見として残す。

#### 手順

1. `task-workflow.md` に検証値（件数・時刻）を反映する。
2. `lessons-learned.md` に苦戦箇所と簡潔手順を同期する。
3. `audit-unassigned-tasks --target-file` で本ファイルの形式を検証する。

#### 成果物

- 更新済み台帳と教訓
- 未タスク監査結果

#### 完了条件

- 台帳同期完了かつ target監査で `currentViolations.total=0`。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] UI再撮影手順が必須化されている
- [ ] TCカバレッジ検証手順が必須化されている
- [ ] 鮮度確認（更新時刻確認）手順が必須化されている

### 品質要件

- [ ] `expected TC == covered TC` を完了基準にしている
- [ ] 3点セット（再撮影/カバレッジ/鮮度）の省略が防止されている
- [ ] 非UIタスクへ誤適用しない条件が明記されている

### ドキュメント要件

- [ ] 本ファイルが `docs/30-workflows/completed-tasks/unassigned-task/` に配置済み
- [ ] `task-workflow.md` 残課題テーブルへ登録済み
- [ ] `lessons-learned.md` へ関連未タスクとして追記済み

---

## 6. 検証方法

### テストケース

- Case 1: TC 8件を想定するworkflowで `expected=8, covered=8` になる
- Case 2: 画像欠落時に coverage 検証が fail になる
- Case 3: 取得時刻が古い場合に鮮度確認で検出できる

### 検証手順

```bash
pnpm --filter @repo/desktop run screenshot:skill-create-wizard
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/skill-create-wizard
ls -lt docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/skill-create-wizard --strict
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/skill-create-wizard
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/unassigned-task/task-imp-task10a-c-phase11-screenshot-coverage-guard-001.md
```

---

## 7. リスクと対策

| リスク                           | 影響度 | 発生確率 | 対策                                                   |
| -------------------------------- | ------ | -------- | ------------------------------------------------------ |
| 取得時間が長く再撮影が省略される | 中     | 中       | UIタスク完了条件に再撮影必須を固定する                 |
| coverage検証を忘れる             | 高     | 中       | 検証コマンドをテンプレートに固定しチェックリスト化する |
| 古い画像で誤判定する             | 中     | 中       | 鮮度確認を `ls -lt` で必須化する                       |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshot-coverage.md`

### 参考資料

- `.claude/skills/skill-creator/references/patterns.md`（TASK-10A-C UI証跡パターン）

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
未タスク仕様書に今回実装で苦戦した箇所を記述し、同じ課題を簡潔に解決できるようにすること。
```

### 補足事項

- 本未タスクは UI検証運用の標準化タスクであり、機能仕様の変更は対象外。
