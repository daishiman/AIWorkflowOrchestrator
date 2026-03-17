# UT-IMP-SKILL-LIFECYCLE-ROUTING-DIRECT-RENDERVIEW-CAPTURE-GUARD-001: direct renderView 到達ガード

## メタ情報

```yaml
issue_number: N/A
task_id: UT-IMP-SKILL-LIFECYCLE-ROUTING-DIRECT-RENDERVIEW-CAPTURE-GUARD-001
task_name: direct renderView 到達ガード
category: 改善
target_feature: skill-lifecycle-routing Phase 11 screenshot harness / renderView route validation
priority: 中
scale: 小規模
status: 未実施
source_phase: TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 Phase 11 Note-01
created_date: 2026-03-17
dependencies:
  - TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001
```

| 項目         | 内容                                                               |
| ------------ | ------------------------------------------------------------------ |
| タスクID     | UT-IMP-SKILL-LIFECYCLE-ROUTING-DIRECT-RENDERVIEW-CAPTURE-GUARD-001 |
| タスク名     | direct renderView 到達ガード                                       |
| 分類         | 改善                                                               |
| 対象機能     | screenshot harness と renderView 契約検証の分離                    |
| 優先度       | 中                                                                 |
| 見積もり規模 | 小規模（2-4時間）                                                  |
| ステータス   | 未実施                                                             |
| 発見元       | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 Phase 11 Note-01       |
| 発見日       | 2026-03-17                                                         |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001` の Phase 11 では、`renderView()` に追加した
`skillAnalysis` / `skillCreate` の証跡を取得するために `advanced route fallback` を採用した。
この時、`currentView` 注入で直接到達させる方式は auth/persist 初期化タイミングの揺れを受けやすく、
スクリーンショット用途では安定しなかった。

### 1.2 問題点・課題

1. `currentView` 注入経路が screenshot 実行時に flaky になり、画面到達失敗の再現性が低い
2. route-based 到達と renderView 分岐保証が 1 つの実行に混在し、失敗時の切り分けが難しい
3. 今回は `advanced route fallback + unit test` で回避できたが、同種タスクで再発する余地がある

### 1.3 放置した場合の影響

- Phase 11 での UI 証跡取得が再び不安定になる
- 分岐ロジックの回帰を「画面到達失敗」と誤認しやすくなる
- screenshot 再取得に余分な時間がかかる

---

## 2. 何を達成するか（What）

### 2.1 目的

`renderView` 系タスクで、画面到達（route）と分岐保証（unit test）の責務を標準分離する。

### 2.2 最終ゴール

1. `phase-11-manual-test.md` で route-based evidence を既定化できる
2. `App.renderView.*.test.tsx` を分岐保証の正本として明示できる
3. capture script 失敗時に「route問題」か「renderView分岐問題」かを即時判定できる

### 2.3 スコープ

#### 含むもの

- Phase 11 guide への標準ルール追記
- screenshot script テンプレートのガード項目追補
- `renderView` 分岐テストの必須チェック追加

#### 含まないもの

- `App.tsx` のナビゲーション仕様変更
- AuthGuard や persist 実装そのものの改修
- Playwright 基盤全体の刷新

### 2.4 成果物

- 更新済み `phase-11-12-guide.md`（責務分離ルール）
- 必要なら capture script テンプレート更新
- task-workflow / lessons-learned への導線追記

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001` の証跡一式が存在する
- `validate-phase11-screenshot-coverage.js` が利用可能
- `vitest` で `App.renderView.*` テストを実行できる

### 3.2 依存タスク

- `TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001`

### 3.3 必要な知識

- `App.tsx` の `renderView()` 分岐
- `react-router` の advanced route fallback
- Phase 11 screenshot coverage 検証

### 3.4 推奨アプローチ

1. screenshot は route-based 到達のみを扱う
2. renderView 分岐は unit test で保証する
3. Phase 12 で両者の証跡を `documentation-changelog` と `spec-update-summary` へ同値記録する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                 | 発見経緯                             | 解決策                                        | 教訓                                     |
| ------------------------------------ | ------------------------------------ | --------------------------------------------- | ---------------------------------------- |
| `currentView` 注入で画面到達が揺れる | step-01 Phase 11 screenshot 再取得時 | route fallback を採用し direct 注入を使わない | 到達保証と分岐保証は同じテストに混ぜない |
| 失敗原因の切り分けが遅れる           | UI 証跡と分岐テストが混在            | screenshot と unit test を別コマンドで実行    | 失敗面を 2 軸で分離して記録する          |

---

## 4. 実行手順

### Phase構成

- Phase A: ルール定義
- Phase B: ガイド反映
- Phase C: 検証と台帳同期

### Phase A: ルール定義

#### 目的

責務分離ルールを固定する。

#### 手順

1. 既存の Phase 11/12 guide と step-01 evidence を確認する
2. route-based evidence / unit-test-based routing contract の境界を定義する
3. 再利用手順を 3 ステップで整理する

#### 成果物

- ルール定義メモ

#### 完了条件

- 境界定義が 1 箇所に明文化されている

### Phase B: ガイド反映

#### 目的

再発防止ルールをスキル文書へ反映する。

#### 手順

1. `phase-11-12-guide.md` に direct 注入回避ルールを追加する
2. screenshot と unit test の必須コマンドを追記する
3. task-spec 側の変更履歴とログへ記録する

#### 成果物

- 更新済みガイド

#### 完了条件

- 同種タスクの参照先が 1 つにまとまっている

### Phase C: 検証と台帳同期

#### 目的

変更が実運用に効くことを確認する。

#### 手順

1. `validate-phase11-screenshot-coverage` と `vitest` を実行する
2. `task-workflow-backlog.md` に未タスク行を追加する
3. `lessons-learned-current.md` に再発防止を追記する

#### 成果物

- 実行ログ
- 更新済み task-workflow / lessons

#### 完了条件

- 証跡取得と分岐保証が両方 PASS で記録される

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] screenshot と unit test の責務分離ルールが文書化されている
- [ ] route fallback の使用条件が明文化されている
- [ ] direct 注入を使う場合の注意点が定義されている

### 品質要件

- [ ] `validate-phase11-screenshot-coverage` が PASS
- [ ] `App.renderView.*` 系テストが PASS
- [ ] `audit-unassigned-tasks --target-file` で current 違反 0

### ドキュメント要件

- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` に存在する
- [ ] `task-workflow-backlog.md` に登録されている
- [ ] `lessons-learned-current.md` に導線が追記されている

---

## 6. 検証方法

### テストケース

- Case 1: route-based screenshot が再取得できる
- Case 2: renderView 分岐テストが通る
- Case 3: 未タスク台帳リンクが有効

### 検証手順

```bash
node apps/desktop/scripts/capture-task-skill-lifecycle-routing-step01-phase11.mjs
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/__tests__/App.renderView.viewtype.test.tsx \
  src/renderer/navigation/skillLifecycleJourney.test.ts \
  src/renderer/store/types.test.ts
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/skill-lifecycle-routing/tasks/step-01-seq-task-01-viewtype-renderView-foundation
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --diff-from HEAD \
  --target-file docs/30-workflows/unassigned-task/task-imp-skill-lifecycle-routing-direct-renderview-capture-guard-001.md
```

---

## 7. リスクと対策

| リスク                                   | 影響度 | 発生確率 | 対策                                                        |
| ---------------------------------------- | ------ | -------- | ----------------------------------------------------------- |
| route fallback に依存しすぎる            | 中     | 中       | unit test で分岐保証を必須化し、UI証跡だけに依存しない      |
| guide 更新だけで実行コマンドが定着しない | 中     | 中       | spec-update-summary に実行コマンドを実測値で残す            |
| 未タスク台帳への登録漏れ                 | 中     | 低       | Task 4 で指示書作成→backlog登録→仕様書リンクの3段階を必須化 |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-lifecycle-routing/tasks/step-01-seq-task-01-viewtype-renderView-foundation/outputs/phase-11/discovered-issues.md`
- `docs/30-workflows/skill-lifecycle-routing/tasks/step-01-seq-task-01-viewtype-renderView-foundation/outputs/phase-11/manual-test-result.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-routing-render-view-foundation.md`

### 参考資料

- `apps/desktop/src/renderer/App.tsx`
- `apps/desktop/src/renderer/__tests__/App.renderView.viewtype.test.tsx`
- `apps/desktop/scripts/capture-task-skill-lifecycle-routing-step01-phase11.mjs`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
Note: screenshot harness は advanced route fallback で安定化したが、
currentView 注入による direct 画面到達は auth/persist 初期化の影響を受けやすい。
```

### 補足事項

- 本タスクは「現状の workaround を正式ガードへ昇格する」ための改善タスクであり、
  現行機能の不具合修正タスクではない。
