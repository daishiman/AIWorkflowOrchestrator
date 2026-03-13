# Onboarding Step 3 mobile 選択カードの優先表示改善 - タスク指示書

## メタ情報

| 項目         | 内容                                                             |
| ------------ | ---------------------------------------------------------------- |
| タスクID     | UT-IMP-ONBOARDING-MOBILE-STARTER-CARD-ORDER-001                  |
| タスク名     | Onboarding Step 3 mobile 選択カードの優先表示改善                |
| 分類         | 改善                                                             |
| 対象機能     | OnboardingWizard / Step 3 starter tool cards / mobile first fold |
| 優先度       | 低                                                               |
| 見積もり規模 | 小規模                                                           |
| ステータス   | 未実施                                                           |
| Issue        | 未採番                                                           |
| 発見元       | Phase 11, Phase 12                                               |
| 発見日       | 2026-03-13                                                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-UI-09-ONBOARDING-WIZARD の Phase 11 手動検証では、mobile 幅向けに step indicator の高さ問題は解消できた一方、Step 3 の starter tool card で選択済みカードが 2 番目に残るケースが確認された。既存の follow-up 未タスク 2 件は `test hardening` と `Settings rerun discoverability` を扱っており、Step 3 の mobile choice clarity は未タスク化されていないため、別責務として formalize する。

### 1.2 問題点・課題

- mobile の Step 3 では selected card が強調されていても、表示順が 2 番目のままだと最初に視線が当たる位置と選択状態がずれる。
- `first fold に主コンテンツが見える` ことと、`選択済みの選択肢が最初に理解できる` ことは別の品質観点だが、同じ確認項目に埋もれやすい。
- representative screenshot は既に選択済み状態を切り取るため、実際のタップ後の理解しやすさを過大評価しやすい。
- データ保存契約と表示順改善を混ぜると、`selectedStarterTool` の永続化や dashboard handoff に不要な変更が入りやすい。

### 1.3 放置した場合の影響

- 初回ユーザーが mobile で「自分がどれを選んだか」を理解するまでに余分な視線移動が必要になる。
- QA や今後の wizard 系 UI で、`first fold` だけ通れば十分だと誤解しやすくなる。
- choice card 型 UI の mobile 調整で、同じ selected-state prominence 問題が再発しやすい。

---

## 2. 何を達成するか（What）

### 2.1 目的

Onboarding Step 3 の mobile 表示で、選択済み starter card を最初に理解しやすい状態へ改善する。

### 2.2 最終ゴール

- mobile 幅で starter tool を選択した後、selected card が first fold 内で最優先に認識できる。
- `selectedStarterTool` の保存契約、completion handoff、desktop / tablet の基本レイアウトは壊さない。
- `TC-11-05` 相当の screenshot と手動確認で、first fold 可視性と selected-state prominence の両方を説明できる。
- system spec と未タスク台帳に、今回の改善意図と苦戦箇所が残る。

### 2.3 スコープ

#### 含むもの

- Step 3 starter card の mobile 向け表示順または selected-state prominence 改善
- 必要に応じた `OnboardingWizard` の responsive UI 調整
- 対象テスト、manual verification、screenshot 証跡の更新
- `aiworkflow-requirements` の onboarding 関連仕様同期

#### 含まないもの

- starter tool の選択肢追加や削除
- `selectedStarterTool` / `onboarding.hasCompleted` の保存契約変更
- Settings rerun 導線や completion 後の view handoff 変更
- Step 4 theme preview や Step 2 AI mock response の UI 変更

### 2.4 成果物

- Step 3 mobile の改善済み UI 差分
- 更新されたテストまたは responsive harness
- 更新された screenshot / manual verification note
- 必要に応じた system spec 更新差分

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-UI-09-ONBOARDING-WIZARD の current implementation が worktree に存在すること
- `selectedStarterTool` は `workspace | skillCenter | agent` の 3 値契約を維持していること
- rerun は force-open local state、completion は persist save という責務分離が維持されていること
- current Phase 11 証跡として `TC-11-05` mobile screenshot が存在すること

### 3.2 依存タスク

- TASK-UI-09-ONBOARDING-WIZARD

### 3.3 必要な知識

- React / Tailwind による responsive card UI
- `apps/desktop/src/renderer/components/organisms/OnboardingWizard/index.tsx` の Step 3 描画
- selected state の keyboard focus / DOM order / visual order の関係
- `/.claude/skills/aiworkflow-requirements/` の onboarding / navigation / lessons 正本

### 3.4 推奨アプローチ

保存契約と見せ方を分離して扱う。`STARTER_TOOLS` の canonical id 群は維持したまま、mobile だけ selected card の理解しやすさを上げる。実装手段は `selected-first stable sort`、`selected summary + scrollIntoView`、`selected card の別枠 summary` のいずれでもよいが、DOM と visual の順序ずれで keyboard / screen reader が不自然にならない方法を優先する。

### 3.5 実装課題と解決策

| 実装課題                                            | 内容                                                                                   | 解決策                                                                 |
| --------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| first fold PASS と選択状態の理解しやすさは別問題    | step indicator の高さ問題が直っても、selected card が 2 番目だと choice clarity が弱い | `first fold` と `selected-state prominence` を別チェック項目に分ける   |
| CSS だけで順序を変えると DOM order がずれやすい     | visual order のみ変えると focus / screen reader の順番が自然でなくなる                 | data-level の stable sort か summary UI を採用し、DOM 意味づけも保つ   |
| screenshot だけでは実操作の分かりやすさが見えにくい | 既に選択済みの静止画だけだと、実際のタップ後の理解しやすさを過大評価しやすい           | screenshot と manual touch flow をセットで残す                         |
| state 契約まで巻き込みやすい                        | card 順の改善に合わせて persistence や handoff へ手を入れたくなる                      | `selectedStarterTool` の保存契約と view handoff は変更対象外に固定する |

---

## 4. 実行手順

### Phase構成

3 フェーズで進める。`観点の分離`、`UI 実装`、`検証と仕様同期` の順に進める。

### Phase 1: 問題観点の分離

#### 目的

first fold と selected-state prominence を別問題として固定する。

#### 手順

1. `TC-11-05` と Phase 11 manual note を再確認し、現在の見え方を言語化する。
2. mobile での不満点を `表示順`、`選択強調`、`スクロール位置` の 3 観点で分解する。
3. desktop / tablet に持ち込まない改善境界を決める。

#### 成果物

- 観点分離メモ
- 採用する改善方針 1 件

#### 完了条件

- `first fold は PASS だが selected-state prominence は未改善` と説明できる。

### Phase 2: UI 実装

#### 目的

mobile で選択済み card を最初に理解しやすい UI へ改善する。

#### 手順

1. Step 3 の mobile 表示戦略を実装する。
2. selected card の強調が伝わるように card 順または summary を調整する。
3. desktop / tablet の既存表示と state 契約に影響が出ていないか確認する。

#### 成果物

- `OnboardingWizard` の更新差分
- 必要に応じた helper / style 調整

#### 完了条件

- mobile で selected card を説明なしに見つけやすい。
- `selectedStarterTool` の保存契約は不変である。

### Phase 3: 検証と文書同期

#### 目的

改善内容を再利用できる形で固定する。

#### 手順

1. target test と mobile screenshot / manual verification を更新する。
2. `task-workflow.md`、`ui-ux-feature-components.md`、`ui-ux-navigation.md`、`lessons-learned.md` を同期する。
3. 未タスク完了時は関連テーブルと status を更新する。

#### 成果物

- 更新済み screenshot / manual note
- system spec 更新差分
- 検証ログ

#### 完了条件

- `TC-11-05` 相当の evidence で改善後状態を説明できる。
- task/spec/output の記述が同じ結論を向いている。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] mobile Step 3 で selected card が最優先に認識できる
- [ ] desktop / tablet の基本レイアウトが崩れていない
- [ ] `selectedStarterTool` の保存契約を変更していない

### 品質要件

- [ ] first fold 可視性と selected-state prominence を別観点で検証している
- [ ] keyboard focus または DOM order が不自然になっていない
- [ ] screenshot と manual touch flow の両方で改善意図を示せる

### ドキュメント要件

- [ ] `task-workflow.md` に関連未タスクとして登録されている
- [ ] `ui-ux-feature-components.md` / `ui-ux-navigation.md` に follow-up 導線がある
- [ ] `lessons-learned.md` に苦戦箇所と標準ルールが反映されている

---

## 6. 検証方法

### テストケース

| テストケース                | 目的                                                                         |
| --------------------------- | ---------------------------------------------------------------------------- |
| mobile selected prominence  | 選択後の card が最初に理解しやすいか確認する                                 |
| mobile first fold           | step indicator と card 表示が first fold を圧迫していないか確認する          |
| desktop / tablet regression | 大画面側の card 順と強調が崩れていないか確認する                             |
| persistence contract        | `selectedStarterTool` の保存と completion handoff が変わっていないか確認する |
| screenshot/manual trace     | representative screenshot と manual note が同じ結論を向いているか確認する    |

### 検証手順

1. `pnpm --filter @repo/desktop exec vitest run apps/desktop/src/renderer/components/organisms/OnboardingWizard/OnboardingWizard.test.tsx` を実行する。
2. 必要に応じて responsive test を追加し、mobile 幅の selected-state 表示を確認する。
3. `node apps/desktop/scripts/capture-task-061-onboarding-wizard-phase11.mjs` を使い、mobile evidence を再取得する。
4. `verify-unassigned-links.js` と `audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/unassigned-task/task-imp-onboarding-mobile-starter-card-order-001.md` を実行する。

---

## 7. リスクと対策

| リスク                                          | 影響度 | 発生確率 | 対策                                                                   |
| ----------------------------------------------- | ------ | -------- | ---------------------------------------------------------------------- |
| selected card を先頭へ移すことで focus が飛ぶ   | 中     | 中       | key の安定性と focus 継続を確認し、必要なら summary 方式へ切り替える   |
| mobile 向け改善が desktop / tablet まで波及する | 中     | 低       | breakpoint 条件を明確化し、desktop / tablet で回帰確認する             |
| visual order と state 契約を同時変更してしまう  | 高     | 低       | persistence / handoff は対象外と明記し、変更差分を UI scope に限定する |
| screenshot だけで改善完了と誤判定する           | 中     | 中       | manual touch flow と screenshot をセットで残す                         |

---

## 8. 参照情報

### 関連ドキュメント

- `/.claude/skills/aiworkflow-requirements/references/workflow-onboarding-wizard-alignment.md`
- `/.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `/.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- `/.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`
- `/.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `/.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`

### 参考資料

- `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-11/manual-test-result.md`
- `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/phase-11-manual-test.md`
- `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-11/screenshots/TC-11-05-onboarding-step3-dark-mobile.png`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

2. **TC-11-05 mobile カード順序**: 選択済みカード (ツールを探して試す) が 2 番目に表示されるため、未選択時は 1 番目のカードから選択する必要がある。selected カードを先頭に移動する UX 改善の余地があるが、現状でも操作可能であり、onboarding の性質上 1 回限りの操作のため影響は軽微

### 補足事項

この未タスクは「選択肢を増やす」話ではなく、「mobile で選択済み状態を最初に理解しやすくする」話である。保存契約や dashboard handoff は親タスクの current contract を維持する。
