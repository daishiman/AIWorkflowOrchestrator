# TASK-SDK-04-U2: planId と execute payload の canonical binding drift を是正する

## メタ情報

```yaml
issue_number: 1671
task_id: TASK-SDK-04-U2
task_name: planId と execute payload の canonical binding drift を是正する
category: 実装改善
target_feature: SkillLifecyclePanel execute flow
priority: 高
scale: 小規模
status: 未実施
source_phase: TASK-SDK-04 Phase 12 再監査
created_date: 2026-03-27
dependencies:
  - TASK-SDK-04
parent_workflow: docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui
spec_path: docs/30-workflows/unassigned-task/task-imp-task-sdk-04-plan-execute-canonical-binding-001.md
```

| 項目         | 内容                                                            |
| ------------ | --------------------------------------------------------------- |
| タスクID     | TASK-SDK-04-U2                                                  |
| タスク名     | planId と execute payload の canonical binding drift を是正する |
| 分類         | 実装改善                                                        |
| 対象機能     | `SkillLifecyclePanel.handleExecutePlan()`                       |
| 優先度       | 高                                                              |
| 見積もり規模 | 小規模                                                          |
| ステータス   | 未実施                                                          |
| 発見元       | TASK-SDK-04 Phase 12 再監査                                     |
| 発見日       | 2026-03-27                                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Task04 は plan review 後に execute へ進む UI を追加したが、execute payload が canonical plan snapshot ではなく current textarea 値へ再依存している。

### 1.2 問題点・課題

- `executePlan(planId, request.trim())` により、review 後に input 欄を書き換えるだけで plan と execute が乖離する
- provenance / summary には review 時点の plan が表示されても、実行対象が別文字列になる
- UI test が drift を検出していない

### 1.3 放置した場合の影響

- plan review の承認が無意味になる
- 実行ログと review 証跡の整合が崩れる
- downstream task が planId を canonical key と見なせなくなる

---

## 2. 何を達成するか（What）

### 2.1 目的

execute は canonical plan に対してのみ行い、textarea の current draft は別責務へ分離する。

### 2.2 最終ゴール

1. `planId` と execute payload が同一 plan snapshot を指す
2. review 後の textarea 編集が execute 対象を勝手に変えない
3. renderer test で drift 再発を防止する

### 2.3 スコープ

#### 含むもの

- `SkillLifecyclePanel` の execute 引数設計見直し
- 必要なら shared/runtime API の引数整理
- renderer test の追加

#### 含まないもの

- plan 作成 UX 全体の再設計
- Task05 の review detail UI

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- canonical な plan 内容は runtime owner が持つ
- textarea は draft 編集用であり、承認済み execute payload の SSoT ではない

### 3.2 必要な知識

- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx`

### 3.3 推奨アプローチ

1. execute が参照すべき canonical plan source を特定する
2. textarea draft の責務を切り分ける
3. review 後入力変更ケースの test を追加する

### 3.4 苦戦箇所

| ID   | 内容                                                     | 解決策                                                                |
| ---- | -------------------------------------------------------- | --------------------------------------------------------------------- |
| U2-1 | draft と approved plan の state owner が混ざりやすい     | approved plan を runtime/store へ固定し、textarea は draft として扱う |
| U2-2 | 後方互換で `executePlan(planId, skillSpec)` を崩しづらい | API を変えない場合でも caller 側で canonical skillSpec を使う         |

---

## 4. 実行手順

### Step 1: source of truth 決定

1. execute が参照すべき canonical plan source を特定する
2. textarea draft の責務を切り分ける

### Step 2: 実装

1. execute payload を canonical plan 由来へ変更する
2. UI 表示と実行対象が同じであることを担保する

### Step 3: テスト

1. review 後に input を変えても execute payload が不変であることを検証する
2. 既存 execute flow の回帰を確認する

---

## 5. 完了条件

- [ ] execute が canonical plan だけを実行する
- [ ] review 後 textarea 編集で execute 対象が変わらない
- [ ] renderer test が drift を検出できる

## 6. 関連タスク

| タスクID       | 関係     | 説明                          |
| -------------- | -------- | ----------------------------- |
| TASK-SDK-04    | 親タスク | interaction bridge / phase UI |
| TASK-SDK-04-U1 | 近接課題 | review 回答の phase semantics |
| TASK-SDK-04-U3 | 近接課題 | evidence/path sync            |

## 7. 検証方法

```bash
pnpm exec vitest run apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
```

## 8. リスクと対策

| リスク                                   | 影響度 | 対策                                                            |
| ---------------------------------------- | ------ | --------------------------------------------------------------- |
| caller と runtime の二重修正が必要になる | 中     | 先に caller 側で canonical payload を固定し、必要最小限で始める |
| draft 消失 UX を生む                     | 中     | draft state は保持し、execute source だけ切り分ける             |

## 9. 参照情報

- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx`
- `docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/outputs/phase-12/implementation-guide.md`
