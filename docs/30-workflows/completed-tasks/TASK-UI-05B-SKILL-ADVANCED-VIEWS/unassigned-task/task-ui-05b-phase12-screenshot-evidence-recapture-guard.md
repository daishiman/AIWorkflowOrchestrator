# UT-UI-05B-001: Phase 12 画面証跡再取得ガード（Skill Advanced Views）

## メタ情報

```yaml
issue_number: 944
```

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | UT-UI-05B-001                                                |
| タスク名     | Phase 12 画面証跡再取得ガード（Skill Advanced Views）        |
| 分類         | 改善                                                         |
| 対象機能     | TASK-UI-05B-SKILL-ADVANCED-VIEWS の Phase 11/12 画面検証運用 |
| 優先度       | 中                                                           |
| 見積もり規模 | 小規模                                                       |
| ステータス   | 未実施                                                       |
| 発見元       | TASK-UI-05B Phase 12 再確認（苦戦箇所抽出・2026-03-02）      |
| 発見日       | 2026-03-02                                                   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-UI-05B の再確認では、4ビューの画面検証証跡を再取得して品質を担保したが、再取得手順が個別運用のままで、次回の同種タスクで再発しやすい状態が残っている。

### 1.2 問題点・課題

- 画面検証が「既存スクリーンショットの存在確認」で止まり、再撮影が省略されやすい。
- スクリーンショット再取得の実行条件（いつ再撮影が必要か）が明文化されていない。
- 再撮影後の更新時刻確認と仕様書同期の連動が弱く、証跡の鮮度を判定しづらい。

### 1.3 放置した場合の影響

- UI仕様書の証跡が古いままでも完了判定されるリスクがある。
- Phase 11/12 の再監査時に差し戻しが発生し、再作業コストが増える。
- 同種の UI タスクで同じ確認漏れが繰り返される。

---

## 2. 何を達成するか（What）

### 2.1 目的

UIタスクの Phase 11/12 で、スクリーンショット証跡を必ず当日再取得し、更新時刻と仕様書記録を一貫して同期できる運用ガードを確立する。

### 2.2 最終ゴール

1. 「再撮影必須条件」「再撮影コマンド」「更新時刻確認」の3点が手順化される。
2. TASK-UI-05B の関連仕様書に未タスクとして登録され、追跡可能になる。
3. 再監査時に画面証跡の鮮度を機械的に確認できる。

### 2.3 スコープ

#### 含むもの

- `capture-skill-advanced-views-screenshots.mjs` を基準にした再撮影運用ルール
- `outputs/phase-11/screenshots/` の更新時刻確認手順
- `task-workflow.md` / `ui-ux-feature-components.md` への未タスク同期

#### 含まないもの

- 4ビュー本体の機能追加・UI改修
- Playwright テストケースの全面再設計
- 既存 baseline 違反の一括解消

### 2.4 成果物

- 画面証跡再取得ガード手順（未タスク実装成果）
- 仕様台帳の同期記録（残課題テーブル・関連未タスク表）
- 検証証跡（コマンド実行ログと更新時刻確認ログ）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `apps/desktop/scripts/capture-skill-advanced-views-screenshots.mjs` が実行可能であること
- TASK-UI-05B のスクリーンショット保存先が確定していること
- `task-specification-creator` の監査スクリプトを利用できること

### 3.2 依存タスク

- TASK-UI-05B-SKILL-ADVANCED-VIEWS（完了済み）
- UT-UI-05-007（Phase 12 UI仕様同期プロファイル適用ガード）

### 3.3 必要な知識

- Phase 11/12 の画面検証要件
- `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` の検証運用
- `audit-unassigned-tasks` の `current` / `baseline` 判定

### 3.4 推奨アプローチ

1. 再撮影が必要な条件を先に定義する（UI差分あり、または Phase 12 再確認時）。
2. 再撮影コマンド実行後に更新時刻確認を必須化する。
3. 証跡値を仕様書へ同一ターンで同期し、監査コマンドで確認する。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                       | 発見経緯                                                  | 解決策                                                  | 教訓                                                        |
| ------------------------------------------ | --------------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------- |
| 画面検証が既存画像の存在確認で止まりやすい | TASK-UI-05B Phase 12 再確認で、再撮影手順の明示不足を確認 | 再撮影コマンドを固定し、更新時刻確認を完了条件へ追加    | UI証跡は「存在確認」ではなく「再取得 + 時刻確認」で判定する |
| `verify-all-specs` warning のドリフト      | Phase 12 文書の依存資料不足で warning が変動              | 依存Phase成果物の参照を先に補完してから検証             | 画面証跡更新はドキュメント依存関係の同期とセットで実施する  |
| 未タスク監査の baseline 誤読               | `audit --diff-from HEAD` の判定軸が混在                   | 合否を `currentViolations=0` に固定し、baselineは別管理 | 監査は `current` と `baseline` を二軸で記録する             |

---

## 4. 実行手順

### Phase構成

- Phase A: 運用ルール定義
- Phase B: 証跡再取得フロー実装
- Phase C: 仕様同期と監査

### Phase A: 運用ルール定義

#### 目的

再撮影必須条件と確認項目を固定する。

#### 手順

1. 再撮影トリガー条件を定義する。
2. 対象スクリーンショット（TC-04〜TC-07）を明示する。
3. 更新時刻確認コマンドを手順化する。

#### 成果物

- 画面証跡再取得ガード定義書

#### 完了条件

- 再撮影条件と更新時刻確認手順が一意に読めること

### Phase B: 証跡再取得フロー実装

#### 目的

画面証跡の再取得と鮮度確認を機械的に実施可能にする。

#### 手順

1. スクリーンショット再取得コマンドを実行する。
2. 取得先ファイルの更新時刻を確認する。
3. 結果を Phase 11/12 記録に反映する。

#### 成果物

- 再取得済みスクリーンショット
- 更新時刻確認ログ

#### 完了条件

- TC-04〜TC-07 の全証跡が同一実行で更新されること

### Phase C: 仕様同期と監査

#### 目的

未タスク台帳と関連仕様を同期し、品質監査を通す。

#### 手順

1. `task-workflow.md` 残課題テーブルに登録する。
2. `ui-ux-feature-components.md` の関連未タスク表を更新する。
3. `verify-unassigned-links` と `audit --target-file` を実行する。

#### 成果物

- 更新済み仕様書
- 監査結果

#### 完了条件

- 参照切れ 0 件、対象監査 `currentViolations.total=0`

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 画面証跡再取得の必須条件が定義されている
- [ ] 再取得対象（TC-04〜TC-07）が固定されている
- [ ] 更新時刻確認の手順が記載されている

### 品質要件

- [ ] 証跡の鮮度を確認する検証コマンドが定義されている
- [ ] `current/baseline` 分離判定の記録ルールが記載されている
- [ ] `verify-all-specs` warning ドリフト対策が記載されている

### ドキュメント要件

- [ ] 本指示書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` 残課題テーブルへ登録済み
- [ ] `ui-ux-feature-components.md` の関連未タスクへ登録済み

---

## 6. 検証方法

### テストケース

- Case 1: UI差分ありで再撮影が実行され、TC-04〜TC-07 が更新される
- Case 2: 再撮影後に更新時刻が当日値へ揃う
- Case 3: 未タスク監査で `currentViolations.total=0` を満たす

### 検証手順

```bash
node apps/desktop/scripts/capture-skill-advanced-views-screenshots.mjs
ls -lt docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/outputs/phase-11/screenshots/
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/unassigned-task/task-ui-05b-phase12-screenshot-evidence-recapture-guard.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

---

## 7. リスクと対策

| リスク                                     | 影響度 | 発生確率 | 対策                                            |
| ------------------------------------------ | ------ | -------- | ----------------------------------------------- |
| 再撮影コマンドを実行せず古い証跡を流用する | 高     | 中       | 完了条件に「再撮影 + 更新時刻確認」を必須化する |
| 証跡更新後に仕様書同期が漏れる             | 中     | 中       | 仕様書更新と監査コマンド実行を同一ターンで行う  |
| `current/baseline` の判定を誤る            | 中     | 中       | 判定軸を `currentViolations` 固定で記録する     |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- `docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/outputs/phase-12/documentation-changelog.md`
- `docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/phase-12-documentation.md`

### 参考資料

- `apps/desktop/scripts/capture-skill-advanced-views-screenshots.mjs`
- `docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/outputs/phase-11/screenshots/`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
画面検証は「既存スクリーンショットがある」だけで完了にせず、
必ず再撮影して更新時刻まで確認すること。
```

### 補足事項

- 本タスクは運用ガードの整備が対象であり、ビュー機能の新規実装は含まない。
