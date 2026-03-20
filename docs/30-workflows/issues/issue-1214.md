# [#1214] "[TASK-FIX-EVAL-STORE-DISPATCH-001] handleEvaluatePrompt の Store 経由化リファクタリング"

## メタ情報

```yaml
task_id: TASK-FIX-EVAL-STORE-DISPATCH-001
task_name: handleEvaluatePrompt の Store 経由化リファクタリング
category: リファクタリング
target_feature: `useSkillAnalysis.ts` の prompt 評価導線（Renderer hooks 層）
priority: 低
scale: 小規模（2-4時間）
status: 未実施
source_phase: TASK-SKILL-LIFECYCLE-04 Phase 10 最終レビュー FINAL-M-01
created_date: 2026-03-14
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-fix-eval-store-dispatch-001.md
```

| 項目       | 内容              |
| ---------- | ----------------- |
| 優先度     | 低                |
| 規模       | 小規模（2-4時間） |
| ステータス | 未実施            |

---

task_id: TASK-FIX-EVAL-STORE-DISPATCH-001
task_name: handleEvaluatePrompt の Store 経由化リファクタリング
category: リファクタリング
target_feature: skill lifecycle 評価導線（useSkillAnalysis / agentSlice / preload skill API）
priority: 低
scale: 小規模
status: 未実施
source_phase: TASK-SKILL-LIFECYCLE-04 Phase 10 最終レビュー FINAL-M-01
created_date: 2026-03-14
dependencies:

- TASK-SKILL-LIFECYCLE-04

---

# handleEvaluatePrompt の Store 経由化リファクタリング - タスク指示書

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`useSkillAnalysis.ts` の `handleEvaluatePrompt` が `window.electronAPI.skill.evaluatePrompt()` を直接呼び出している。現行の renderer 実装方針では、ビジネスロジックは store action へ集約し、hooks は state/selectors と action 呼び出しに限定することが原則になっている。

### 1.2 問題点・課題

- hooks 層で IPC を直接叩くため、責務境界（UI/hook/store/IPC）が崩れる
- `agentSlice` での状態遷移（loading/error）と `evaluatePrompt` の挙動が分散し、回帰テストの見通しが悪い
- 将来 `evaluatePrompt` 周辺の認証前提や timeout 契約を変更する際に変更点が拡散する

### 1.3 放置した場合の影響

- store 駆動に統一している他導線との一貫性が下がる
- hooks テストで electron API モックが必要になり、テスト戦略が複雑化する
- 同種機能で「直接呼び出し許容」の例外が増え、設計判断が不安定になる

---

## 2. 何を達成するか（What）

### 2.1 目的

`handleEvaluatePrompt` を store action 経由へ移行し、renderer の責務境界を `hooks -> store -> preload IPC` の一本化ルールに戻す。

### 2.2 最終ゴール

1. `useSkillAnalysis.ts` が `window.electronAPI` を直接参照しない
2. `agentSlice.ts` に `evaluatePromptSkill`（仮称）action が追加される
3. `evaluatePrompt` 実行時の loading/error が store 管理へ統合される
4. 既存テスト＋追加テストで回帰がないことを確認できる

### 2.3 スコープ

#### 含むもの

- `agentSlice.ts` への `evaluatePrompt` 実行 action 追加
- `useSkillAnalysis.ts` の直接呼び出し撤去
- 必要な selector/action export 更新
- 関連 unit test の拡充

#### 含まないもの

- `skill:optimize:evaluate` IPC 契約自体の変更
- prompt 評価ロジック（main/service）の仕様変更
- score gate 閾値や UI 文言の変更

### 2.4 成果物

- 更新済み `agentSlice.ts` / `store/index.ts`
- 更新済み `useSkillAnalysis.ts`
- 追加または更新されたテスト（hook/store）
- 検証ログ（test/typecheck）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-SKILL-LIFECYCLE-04 の current 実装が checkout されている
- `evaluatePrompt` preload API が実装済みである
- `agentSlice` と hook テストの実行環境（Vitest）が利用可能である

### 3.2 依存タスク

- TASK-SKILL-LIFECYCLE-04（親タスク）
- TASK-FIX-SCORE-DELTA-DEDUP-001（同時に扱うと検証効率が高い）

### 3.3 必要な知識

- Zustand slice の action 設計
- renderer hooks の責務分離パターン
- `@repo/shared` 型と desktop store 型の接続
- task-specification-creator の検証コマンド

### 3.4 推奨アプローチ

1. `agentSlice` に `evaluatePromptSkill` action を追加し、`skillError` と進行フラグの扱いを明文化する
2. `store/index.ts` に対応 selector/action hook を追加する
3. `useSkillAnalysis.ts` の `handleEvaluatePrompt` を store action 呼び出しへ置換する
4. hook テストを追加し、空入力・成功・失敗の3系統を検証する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                 | 発見経緯                                                           | 解決策                                                                 | 教訓                                                             |
| ---------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------- | ---------------------------------------------------------------- |
| hooks 直呼びが Phase 10 まで残存した                 | 機能実装を優先して store 境界チェックが後手になった                | Phase 10 MINOR を未タスク化し、store action へ集約する追補タスクを分離 | 「動く」だけで完了せず、レイヤー境界を Phase 10 で必ず再査定する |
| P31 対策（個別セレクタ）と action 追加の整合が難しい | action 追加時に依存配列や selector 参照が揺れやすい                | 既存の個別セレクタ方針を維持し、合成hookを増やさない                   | store 拡張時は selector 粒度を変えない                           |
| 未タスク配置先が workflow 内にずれた                 | `tasks/unassigned-task/` で一時運用して `--target-file` 監査が失敗 | 正式配置を `docs/30-workflows/unassigned-task/` へ統一                 | 未タスクは root canonical path を先に固定する                    |

---

## 4. 実行手順

### Phase構成

- Phase A: store action 追加設計
- Phase B: hooks 移行と state 接続
- Phase C: テスト拡充と検証

### Phase A: store action 追加設計

#### 目的

`evaluatePrompt` の責務を `agentSlice` へ移す。

#### 手順

1. `agentSlice.ts` に `evaluatePromptSkill(prompt)` action を追加する
2. 成功/失敗時の state 更新（error、進行状態）を定義する
3. `store/index.ts` に action hook を公開する

#### 成果物

- action 定義
- export 済み selector/action hook

#### 完了条件

- hooks 側から action を呼び出せる状態になっている

### Phase B: hooks 移行と state 接続

#### 目的

`useSkillAnalysis.ts` の IPC 直接呼び出しを除去する。

#### 手順

1. `handleEvaluatePrompt` から `window.electronAPI` 呼び出しを削除
2. store action 呼び出しへ置換
3. `evaluateError` / `isEvaluateError` の整合を確認

#### 成果物

- 更新済み `useSkillAnalysis.ts`

#### 完了条件

- hooks ファイル内に `window.electronAPI.skill.evaluatePrompt` が存在しない

### Phase C: テスト拡充と検証

#### 目的

移行後の挙動と回帰を検証する。

#### 手順

1. hook/store テストを更新
2. 対象テスト実行
3. 型チェック実行

#### 成果物

- 更新済みテスト
- 検証結果ログ

#### 完了条件

- 対象テスト PASS
- 型チェック PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `useSkillAnalysis.ts` で direct IPC 呼び出しが撤去されている
- [ ] `agentSlice.ts` に `evaluatePrompt` 用 action が追加されている
- [ ] error/進行状態の扱いが store に統合されている

### 品質要件

- [ ] `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/useSkillAnalysis-gate.test.ts` が PASS
- [ ] `pnpm --filter @repo/desktop exec vitest run src/renderer/store/slices/__tests__/agentSlice.skill-lifecycle.test.ts` が PASS
- [ ] `pnpm --filter @repo/desktop exec tsc -p tsconfig.json --noEmit` が PASS

### ドキュメント要件

- [ ] 本指示書が `docs/30-workflows/unassigned-task/` に存在する
- [ ] `task-workflow-backlog.md` に同一IDの参照がある
- [ ] 関連仕様書の未タスク表と参照パスが一致している

---

## 6. 検証方法

### テストケース

- TC-01: 空文字 prompt で入力エラーが表示される
- TC-02: 正常 prompt で action が1回呼ばれる
- TC-03: action 失敗時に `evaluateError` が設定される

### 検証手順

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/useSkillAnalysis-gate.test.ts
pnpm --filter @repo/desktop exec vitest run src/renderer/store/slices/__tests__/agentSlice.skill-lifecycle.test.ts
pnpm --filter @repo/desktop exec tsc -p apps/desktop/tsconfig.json --noEmit
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/unassigned-task/task-fix-eval-store-dispatch-001.md
```

---

## 7. リスクと対策

| リスク                                    | 影響度 | 発生確率 | 対策                                                             |
| ----------------------------------------- | ------ | -------- | ---------------------------------------------------------------- |
| action 追加で既存 selector の参照が崩れる | 中     | 中       | 個別セレクタ方針を維持し、既存 hook API を変更しない             |
| error 管理が二重化する                    | 中     | 低       | `skillError` と `evaluateError` の責務を明文化しテストで固定する |
| 直接呼び出し撤去時に挙動差異が出る        | 低     | 中       | TC-01〜03 を追加し旧挙動との差異を検証する                       |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-lifecycle-unification/tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-10/final-review-result.md`
- `docs/30-workflows/skill-lifecycle-unification/tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-12/unassigned-task-detection.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-details.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`

### 参考資料

- `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts`
- `apps/desktop/src/renderer/store/slices/agentSlice.ts`
- `.claude/rules/01-architecture.md`
- `.claude/rules/06-known-pitfalls.md#P31`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
handleEvaluatePrompt が window.electronAPI を直接呼び出している（Store 経由原則から外れる）
```

### 補足事項

- 本未タスクは root canonical directory（`docs/30-workflows/unassigned-task/`）に配置する。
- 実装時は `TASK-FIX-SCORE-DELTA-DEDUP-001` と同ターンで回すとテスト効率が高い。
