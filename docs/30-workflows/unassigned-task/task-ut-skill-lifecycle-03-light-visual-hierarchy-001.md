# UT-SKILL-LIFECYCLE-03-LIGHT-VISUAL-HIERARCHY-001: Skill Creator light theme 視覚階層改善

## メタ情報

```yaml
issue_number: 1166
```

| 項目         | 内容                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| タスクID     | UT-SKILL-LIFECYCLE-03-LIGHT-VISUAL-HIERARCHY-001                         |
| タスク名     | Skill Creator light theme 視覚階層改善                                   |
| 親タスクID   | TASK-SKILL-LIFECYCLE-03                                                  |
| 分類         | 改善                                                                     |
| 対象機能     | `SkillLifecycleSessionCard` / `SkillManagementPanel` の light theme 表示 |
| 優先度       | 低                                                                       |
| 見積もり規模 | 小規模                                                                   |
| ステータス   | 未実施                                                                   |
| 発見元       | Phase 11 Apple UI/UX レビュー / Phase 12 未タスク化                      |
| 発見日       | 2026-03-12                                                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-SKILL-LIFECYCLE-03` の Phase 11 再監査で、`SkillLifecycleSessionCard` の light theme 表示を確認したところ、補助テキスト・placeholder・summary card の階層差がやや弱く見えた。主導線の create / execute / improve 自体は成立していたため blocker ではないが、長文 prompt や summary を読む場面で視線誘導が鈍る。

### 1.2 問題点・課題

| #   | 問題                                    | 現状                                                                       | あるべき姿                                                              |
| --- | --------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 1   | 補助テキストが淡い                      | helper text / placeholder / validation summary が light theme で沈みやすい | 読み飛ばされず、主テキストとの差を保ったまま読める                      |
| 2   | summary card の階層差が弱い             | session card と結果 summary の surface depth が近く、情報のまとまりが弱い  | create / execute / improve の結果が一段下の情報として認識できる         |
| 3   | 親タスクの苦戦が follow-up に落ちにくい | UI polish と主導線成立確認を同時に扱うと、低優先度課題が記録止まりになる   | visual debt を独立未タスクとして formalize し、次回は短手順で着手できる |

### 1.3 放置した場合の影響

- light theme 利用時に prompt 補助情報と結果 summary の読み取り速度が落ちる
- component 局所修正と token / surface 調整が混ざり、次回の改修が広がりやすくなる
- Task03 と同種の session card 実装で、毎回同じ UI polish 指摘が再発する

### 1.4 今回実装で苦戦した箇所

| 観点       | 内容                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------ |
| 苦戦1      | primary flow の成立確認と visual polish を同一タスク内で評価すると、どこまでを current task で閉じるか判断が揺れた |
| 苦戦2      | `SkillLifecycleSessionCard` 固有の問題か、global token / surface hierarchy の問題かの切り分けに時間がかかった      |
| 苦戦3      | 未タスク化の監査で `current` と `baseline` を分けないと、既存 backlog と今回差分が混線しやすかった                 |
| 今回の結論 | UI挙動は親タスクで accept し、visual hierarchy だけを本未タスクへ分離するのが最も再利用しやすい                    |

---

## 2. 何を達成するか（What）

### 2.1 目的

Skill Creator session card の light theme における情報階層を改善し、helper text / placeholder / summary card が短時間で読み分けられる状態にする。

### 2.2 最終ゴール

- light theme の補助テキストと placeholder の視認性が改善されている
- session card と summary card の視覚階層が明確になっている
- 親タスクの苦戦箇所が、visual debt の短手順として system spec に反映されている

### 2.3 スコープ

#### 含むもの

- `SkillLifecycleSessionCard` の helper text / placeholder / summary text の見直し
- session card / summary card の surface depth、境界線、背景トーンの調整
- 必要に応じた semantic token または component-level class の調整
- `task-workflow.md` / `ui-ux-feature-components.md` / `ui-ux-navigation.md` / `lessons-learned.md` への同期

#### 含まないもの

- create / execute / improve の機能仕様変更
- `SkillCreateWizard` の sparse 問題そのものの解消
- dark theme 全面改修
- Phase 13 相当の包括的デザイン刷新

### 2.4 成果物

| 成果物             | 説明                                          |
| ------------------ | --------------------------------------------- |
| UI修正差分         | light theme 視覚階層改善の実装                |
| スクリーンショット | 改善前後または改善後の representative capture |
| system spec 更新   | Task03 関連仕様書への未タスク導線と教訓の反映 |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

| 項目       | 内容                                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 親タスク   | `docs/30-workflows/completed-tasks/step-02-par-task-03-skill-creator-execute-improve-integration/` が Phase 1-12 完了済みであること |
| 発見課題   | `outputs/phase-11/discovered-issues.md` の `ISSUE-11-01` を根拠とすること                                                           |
| 仕様書正本 | `.claude/skills/aiworkflow-requirements/` を canonical root として扱うこと                                                          |

### 3.2 依存タスク

| タスクID                                             | 関係                    | 状態     |
| ---------------------------------------------------- | ----------------------- | -------- |
| TASK-SKILL-LIFECYCLE-03                              | 親実装                  | 完了     |
| UT-IMP-PHASE12-DUAL-SKILL-ROOT-MIRROR-SYNC-GUARD-001 | Phase 12 root sync 運用 | 参照のみ |

### 3.3 必要な知識

| 知識領域                  | 参照先                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Session UI 構成           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                                     |
| 導線と screen evidence    | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                             |
| 親タスクの教訓            | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                              |
| 完了台帳と関連 UT         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                |
| current workflow evidence | `docs/30-workflows/completed-tasks/step-02-par-task-03-skill-creator-execute-improve-integration/outputs/phase-11/` |

### 3.4 推奨アプローチ

1. `ISSUE-11-01` の対象を helper text、placeholder、summary surface に限定して棚卸しする
2. token で閉じるべき問題か、`SkillLifecycleSessionCard` 固有 class で閉じるべき問題かを先に判定する
3. create / execute / improve の挙動を変えず、見た目の階層だけを調整する
4. Phase 11 相当の representative screenshot と system spec 更新を同一ターンで閉じる

### 3.5 実装課題と解決策

| 課題                                            | 発見経緯                                                                                | 解決策                                                                | 再利用ルール                                             |
| ----------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------- |
| 主導線成立確認と visual polish が同時に発生する | Task03 では UX の accept 判定が先に必要だった                                           | 挙動成立は親タスク、light theme polish は本未タスクへ分離する         | UI polish は blocker 判定と改善 backlog を分けて記録する |
| component 問題と token / surface 問題が混ざる   | screenshot だけだと `SkillLifecycleSessionCard` 固有か design system 起因か判断しづらい | helper text / placeholder / surface depth の3観点に分けて診断する     | visual debt は「text」「surface」「layout」の粒度で切る  |
| unassigned-task 監査が baseline に引っ張られる  | legacy backlog が多い repo で root 配置する                                             | `--diff-from HEAD --target-file` と `--diff-from HEAD` を分離して使う | current と baseline を同じ結論にしない                   |

### 3.6 SubAgent 編成

| SubAgent   | 関心ごと         | 主担当                                                      |
| ---------- | ---------------- | ----------------------------------------------------------- |
| SubAgent-A | issue 精査       | `ISSUE-11-01` を text / surface / hierarchy の3点へ分解する |
| SubAgent-B | UI設計           | token で直すか component で直すかを決める                   |
| SubAgent-C | 検証             | screenshot / visual regression / light-dark 比較を行う      |
| SubAgent-D | system spec 同期 | `task-workflow` / `ui-ux-*` / `lessons-learned` を更新する  |

---

## 4. 実行手順

### Phase構成

- Phase A: 対象 UI の視覚差分を整理
- Phase B: token / component / surface の修正方針を決定
- Phase C: light theme 視覚階層を改善
- Phase D: screenshot / 監査 / system spec を同期

### Phase A: 証跡整理

#### 目的

`ISSUE-11-01` の対象範囲を曖昧にせず、どの UI 要素を直すか固定する。

#### 手順

1. `discovered-issues.md` と Phase 11 screenshot を見て対象要素を列挙する
2. helper text / placeholder / summary card の3分類で問題を仕分ける
3. `SkillCreateWizard` sparsity は本タスクの対象外と明記する

#### 成果物

- 対象 UI リスト
- 改善対象 / 対象外の境界メモ

#### 完了条件

- 修正対象が 1 画面内の light theme hierarchy に限定されている

### Phase B: 修正方針決定

#### 目的

token 改修と component 改修の責務境界を決める。

#### 手順

1. 既存 token と class 名を確認する
2. text contrast と surface depth のどちらを token 化するか判断する
3. 他画面への波及を最小化する修正方針を確定する

#### 成果物

- 修正方針メモ
- 影響範囲一覧

#### 完了条件

- 「何を直し、何を触らないか」が 1 回で説明できる

### Phase C: 実装

#### 目的

light theme の視覚階層を改善しつつ、session flow を壊さない。

#### 手順

1. helper text / placeholder / summary card を調整する
2. create / execute / improve の action state が変わっていないことを確認する
3. 必要なら summary card の境界と余白を微調整する

#### 成果物

- 実装差分
- 代表 screenshot

#### 完了条件

- light theme の読み分けが改善され、機能挙動は不変

### Phase D: 監査と同期

#### 目的

未タスク・system spec・親 workflow の整合を確保する。

#### 手順

1. `verify-unassigned-links` と `audit-unassigned-tasks` を実行する
2. 親 workflow の `unassigned-task-detection.md` を更新する
3. `task-workflow.md` と関連仕様書へ未タスク導線を追加する

#### 成果物

- 検証ログ
- 更新済み仕様書

#### 完了条件

- current diff の未タスク監査が PASS し、system spec から本未タスクへ辿れる

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] light theme の helper text / placeholder / summary hierarchy が改善されている
- [ ] create / execute / improve の操作条件と挙動が変わっていない
- [ ] `SkillCreateWizard` sparsity 問題を誤って巻き込んでいない

### 品質要件

- [ ] representative screenshot で視覚差分が確認できる
- [ ] `audit-unassigned-tasks --json --diff-from HEAD --target-file ...` で `currentViolations=0`
- [ ] `audit-unassigned-tasks --json --diff-from HEAD` で今回差分が PASS

### ドキュメント要件

- [ ] 親 workflow の `unassigned-task-detection.md` が更新されている
- [ ] `task-workflow.md` に関連未タスクが追加されている
- [ ] `ui-ux-feature-components.md` / `ui-ux-navigation.md` / `lessons-learned.md` に反映されている

---

## 6. 検証方法

### テストケース

| TC-ID  | 検証内容                                      | 期待結果                                 |
| ------ | --------------------------------------------- | ---------------------------------------- |
| TC-001 | light theme の helper text / placeholder 確認 | 主要補助情報が読める                     |
| TC-002 | summary card の視覚階層確認                   | session card と summary の役割差が分かる |
| TC-003 | create / execute / improve の回帰確認         | 機能挙動に影響がない                     |

### 検証手順

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/unassigned-task/task-ut-skill-lifecycle-03-light-visual-hierarchy-001.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

---

## 7. リスクと対策

| リスク                                           | 影響度 | 発生確率 | 対策                                                      |
| ------------------------------------------------ | ------ | -------- | --------------------------------------------------------- |
| token 修正が他 UI に波及する                     | 中     | 中       | まず `SkillLifecycleSessionCard` 局所で閉じる案を比較する |
| 見た目調整で session state の DOM 構造を崩す     | 中     | 低       | action enablement と screenshot を同時確認する            |
| wizard sparse 問題まで巻き込んでスコープが広がる | 中     | 中       | `ISSUE-11-02` は別 follow-up 候補として維持する           |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント  | パス                                                                                                                                    | 用途                     |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| 親 workflow   | `docs/30-workflows/completed-tasks/step-02-par-task-03-skill-creator-execute-improve-integration/`                                      | 親実装と evidence の参照 |
| 発見課題      | `docs/30-workflows/completed-tasks/step-02-par-task-03-skill-creator-execute-improve-integration/outputs/phase-11/discovered-issues.md` | `ISSUE-11-01` の根拠     |
| task-workflow | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                                    | 残課題台帳               |
| UI機能仕様    | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                                                         | session card の正本      |
| ナビ仕様      | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                                                 | Task03 導線の正本        |
| 教訓集        | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                                                  | 苦戦箇所の再利用         |

### 参考資料

- `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/unassigned-task/task-ut-ui-03-light-secondary-text-contrast-001.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
ISSUE-11-01 | LOW | 視認性 | light theme の補助テキストと placeholder がやや淡く、summary card の階層差が弱い | 長文 prompt 時に読み取り速度が少し落ちる | blocker ではない。Phase 12 で記録のみ
```

### 補足事項

- 本未タスクは「Task03 の acceptance を崩さない visual polish」を切り出したものであり、親タスクの完了判定を覆さない
- `ISSUE-11-02` の wizard 1 step 目 sparsity は本タスクの対象外とし、別課題として監視継続する
