# UT-UI-03-LIGHT-SECONDARY-TEXT-CONTRAST-001: light theme の副次テキスト token コントラスト改善

## メタ情報

```yaml
issue_number: 1141
```

## メタ情報

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| タスクID     | UT-UI-03-LIGHT-SECONDARY-TEXT-CONTRAST-001      |
| タスク名     | light theme 副次テキスト token コントラスト改善 |
| 親タスクID   | TASK-UI-03-AGENT-VIEW-ENHANCEMENT               |
| 分類         | UI/UX / デザインシステム / アクセシビリティ     |
| 優先度       | 低                                              |
| 見積もり規模 | 小規模                                          |
| ステータス   | 未実施                                          |
| 発見元       | Phase 11 Apple UI/UX レビュー                   |
| 発見日       | 2026-03-10                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-UI-03-AGENT-VIEW-ENHANCEMENT` の Phase 11 再監査で、`TC-01-main-view-light.png`、`TC-06-panel-open-light.png`、`TC-07-recent-list-light.png` を Apple UI/UX 観点で確認したところ、light theme の `--text-secondary` を使う説明文・補助ラベルがダークテーマより弱く見える箇所が残っていた。

AgentView 固有のレイアウト不具合ではなく、`apps/desktop/src/renderer/styles/tokens.css` の light theme semantic token 設計に起因する可能性が高い。

### 1.2 問題点

| #   | 問題                                            | 現状                                                                         | あるべき姿                                                          |
| --- | ----------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 1   | light theme の副次テキストが薄い                | `--text-secondary: rgba(60, 60, 67, 0.6)` が長文説明や補助ラベルで弱く見える | 通常テキスト相当の用途で WCAG 2.1 AA を満たし、視認性が安定している |
| 2   | token と component の責務境界が曖昧になりやすい | AgentView 側の問題に見えるが、実際は global token の調整余地                 | token 側改善として一元管理し、個別画面で色をハードコードしない      |
| 3   | 再監査結果が観察止まりになりやすい              | screenshot 所見が task 化されないと再利用しづらい                            | 未タスク仕様書、task-workflow、design system 正本へ同時反映する     |

### 1.3 放置した場合の影響

- light theme の説明文や補助ラベルが長文時に読みづらくなり、情報階層の理解コストが上がる
- 画面ごとに個別修正が入り、semantic token による一貫性が崩れる
- 今後の UI 再監査でも同じ指摘が繰り返される

### 1.4 今回の苦戦箇所と教訓

| 項目     | 内容                                                                                                                  |
| -------- | --------------------------------------------------------------------------------------------------------------------- |
| 課題     | screenshot 上では違和感が見えるが、AgentView 固有のバグか global token の課題かを切り分ける必要があった               |
| 原因     | Phase 11 では layout / state の確認が主目的で、token 基盤の改善は別責務になりやすい                                   |
| 対処     | dedicated harness で component state を固定しつつ、所見は token scope として別未タスクへ切り出す                      |
| 再発防止 | UI 再監査で light/dark の視認性差分を見つけたら、「component 修正」か「token 改善」かを先に判定してから未タスク化する |

---

## 2. 何を達成するか（What）

### 2.1 目的

light theme の副次テキスト token のコントラストを見直し、補助説明や履歴ラベルで視認性を安定させる。

### 2.2 最終ゴール

- `tokens.css` の light theme text token が見直されている
- AgentView を含む light theme 画面で補助テキストの視認性が改善している
- screenshot とコントラスト確認結果が Phase 11/12 に記録されている

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/renderer/styles/tokens.css` の `--text-secondary` / 必要に応じて `--text-muted` の見直し
- 影響を受ける主要 UI（AgentView、Settings、履歴系）の light theme 目視確認
- system spec / lessons / task-workflow への反映

#### 含まないもの

- 全 UI の全面的な配色刷新
- dark theme の再設計
- component ごとの個別ハードコード色追加

### 2.4 成果物

| 成果物               | 説明                                         |
| -------------------- | -------------------------------------------- |
| 調整済み tokens.css  | light theme の text token 改善               |
| 更新済み screenshot  | 視認性改善後の画面証跡                       |
| 更新済み system spec | design system / task-workflow / lessons 反映 |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

| タスクID                          | 関係       | 状況 |
| --------------------------------- | ---------- | ---- |
| TASK-UI-03-AGENT-VIEW-ENHANCEMENT | 発見元     | 完了 |
| TASK-UI-00-TOKENS                 | token 基盤 | 完了 |

### 3.2 必要な知識

| 知識領域              | 参照先                                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------------ |
| design tokens         | `apps/desktop/src/renderer/styles/tokens.css`                                                                |
| デザインシステム仕様  | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                                   |
| UI デザイン原則       | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                               |
| TASK-UI-03 手動テスト | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/outputs/phase-11/manual-test-result.md` |
| Phase 11 発見課題     | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/outputs/phase-11/discovered-issues.md`  |

### 3.3 推奨アプローチ

1. `tokens.css` の light theme `--text-secondary` / `--text-muted` 使用箇所を確認する
2. 通常テキスト用途と UI 補助要素用途を分け、必要なら semantic token を分離する
3. AgentView と少なくとももう1画面で screenshot を取り、light / dark の視認性差分を比較する
4. `ui-ux-design-system.md` / `task-workflow.md` / `lessons-learned.md` に判断根拠を同一ターンで記録する

### 3.4 注意事項

- component 側で直接色を上書きせず、まず token の責務で閉じられるか判断すること
- 通常テキスト用途で使っている要素は WCAG 2.1 AA の 4.5:1 を基準に確認すること
- token 調整が広範囲に影響するため、少なくとも AgentView 以外の 1 画面も再確認すること
- `AgentView` 側で色をハードコードして差し戻さず、親タスクで分離した adapter helper / dedicated harness を前提に token 修正だけへ集中すること

### 3.5 影響範囲

| ファイル / 領域                                                            | 影響内容                            |
| -------------------------------------------------------------------------- | ----------------------------------- |
| `apps/desktop/src/renderer/styles/tokens.css`                              | light theme text token の調整       |
| `apps/desktop/src/renderer/views/AgentView/`                               | 補助テキストの視認性変化            |
| `apps/desktop/src/renderer/views/SettingsView/` など                       | 同 token を使う説明文・ラベルへ波及 |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md` | token 契約・関連未タスクの更新      |

### 3.6 実装課題と解決策（親タスクからの教訓）

| 課題                                                | 発見経緯                                                                                                                 | 解決策                                                                                                      | 教訓                                                                                   |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| component 問題と token 問題の境界が曖昧             | Phase 11 screenshot で light theme の違和感が見えたが、AgentView 固有不具合か token 基盤か即断しづらかった               | dedicated harness で layout/state を先に固定し、token 由来と判定した所見だけを本未タスクへ切り出す          | UI再監査では「component scope」か「design-system scope」かを先に決めてから修正先を選ぶ |
| view 実装の苦戦が token 調整タスクへ伝播しにくい    | 親タスク側では `Skill` の adapter helper と harness 構成で解消しており、未タスク側にその前提がないと再現手順を誤りやすい | 本未タスクでは App shell 直修正ではなく `tokens.css` と screenshot 比較を主手順とし、UI構造の修正と分離する | token 改善タスクには親タスクの「何を触らないか」を明記する                             |
| 未タスク指示書の監査が repo baseline に引っ張られる | `audit --target-file` 単独実行は既存違反を current 判定に寄せる場合がある                                                | `--diff-from HEAD --target-file` を個別合否、`--diff-from HEAD` を今回差分全体の合否として使い分ける        | 未タスクの品質判定は target 監査と diff 監査を分離する                                 |

---

## 4. 実行手順

1. `tokens.css` の light theme `--text-secondary` / `--text-muted` 使用箇所を棚卸しする
2. 通常テキスト用途と UI 補助要素用途を分け、必要なら semantic token を分離する
3. AgentView と代表別画面で screenshot を取得し、light / dark の視認性差分を比較する
4. `ui-ux-design-system.md` / `task-workflow.md` / `lessons-learned.md` を同一ターンで更新する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] light theme の副次テキスト token 調整方針が決定している
- [ ] `tokens.css` が更新されている
- [ ] AgentView の light theme screenshot で視認性改善が確認できる

### 品質要件

- [ ] コントラスト確認結果が記録されている
- [ ] 影響を受ける主要 UI の regression が確認されている
- [ ] `verify-unassigned-links` が PASS し、completed parent workflow の検証（`verify-all-specs` / `validate-phase-output`）が維持されている
- [ ] 移管前の `docs/30-workflows/unassigned-task/` 配置時に `audit-unassigned-tasks --json --diff-from HEAD --target-file ...` の `currentViolations=0` を確認した履歴が残っている

### ドキュメント要件

- [ ] `ui-ux-design-system.md` に反映されている
- [ ] `task-workflow.md` に登録されている
- [ ] `lessons-learned.md` または関連 UI 仕様に苦戦箇所が反映されている

---

## 6. 検証方法

### テストケース

| TC-ID  | 検証内容                                       | 期待結果                         |
| ------ | ---------------------------------------------- | -------------------------------- |
| TC-001 | AgentView light theme の説明文・補助ラベル確認 | 長文説明と補助ラベルが読みやすい |
| TC-002 | AgentView dark theme 比較                      | dark theme の視認性を維持する    |
| TC-003 | 代表別画面の light theme 確認                  | token 変更による副作用がない     |

### 実行コマンド

```bash
node .agents/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .agents/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement --strict
node .agents/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement
rg -n '^## メタ情報$|^## [1-9]\\. ' docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/unassigned-task/task-ut-ui-03-light-secondary-text-contrast-001.md
```

---

## 7. リスクと対策

| リスク                                                  | 影響度 | 発生確率 | 対策                                                                                                             |
| ------------------------------------------------------- | ------ | -------- | ---------------------------------------------------------------------------------------------------------------- |
| token 変更が広範囲 UI に波及する                        | 中     | 中       | AgentView 以外の代表画面でも screenshot を確認する                                                               |
| contrast 改善で light/dark バランスが崩れる             | 中     | 低       | light/dark の両テーマを比較し、dark 側は変更不要なら固定する                                                     |
| component ごとの個別色上書きが増える                    | 中     | 中       | token 責務で閉じる方針を先に決め、例外を最小化する                                                               |
| 親タスクの UI 構造修正と本タスクの token 修正が混線する | 中     | 中       | layout/state の修正は親タスクの責務に戻し、本タスクでは `tokens.css` と design-system 正本だけを主変更対象にする |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント     | パス                                                                           | 参照理由         |
| ---------------- | ------------------------------------------------------------------------------ | ---------------- |
| デザインシステム | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`     | token 契約の正本 |
| UI デザイン原則  | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | コントラスト基準 |
| task-workflow    | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | 未タスク台帳     |
| lessons-learned  | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`         | 苦戦箇所の再利用 |

### 関連証跡

| 証跡                    | パス                                                                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Phase 11 手動テスト結果 | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/outputs/phase-11/manual-test-result.md`                 |
| Phase 11 発見課題       | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/outputs/phase-11/discovered-issues.md`                  |
| Screenshot              | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/outputs/phase-11/screenshots/TC-01-main-view-light.png` |

---

## 9. 備考

- 本タスクは AgentView 固有の layout bug ではなく、global token 改善として扱う
- 2026-03-10 の Apple UI/UX レビューで「重大問題なし、ただし light theme の副次テキストに改善余地あり」と判定した
- 同種課題の簡潔解決手順は「component/token の責務判定 → token 使用箇所棚卸し → representative screenshot 比較 → diff 監査付き未タスク検証 → system spec 同期」の 5 ステップで進める
- 2026-03-10 23:xx JST に親 workflow を `completed-tasks/task-ui-03-agent-view-enhancement/` へ移管したため、本指示書も親 workflow 配下の `unassigned-task/` で管理する
- `audit --target-file` の `currentViolations=0` は移管前に root `unassigned-task/` 配置時点で確認済み。移管後はリンク整合と親 workflow validator を主ゲートにする
