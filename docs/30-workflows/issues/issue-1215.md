# [#1215] "[TASK-FIX-SCORE-DELTA-DEDUP-001] ScoreDelta direction 判定ロジックの重複解消"

## メタ情報

```yaml
task_id: TASK-FIX-SCORE-DELTA-DEDUP-001
task_name: ScoreDelta direction 判定ロジックの重複解消
category: リファクタリング
target_feature: `ScoreDisplay.tsx` と `@repo/shared` の ScoreDelta 計算契約
priority: 低
scale: 小規模（2-4時間）
status: 未実施
source_phase: TASK-SKILL-LIFECYCLE-04 Phase 10 最終レビュー FINAL-M-02
created_date: 2026-03-14
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-fix-score-delta-dedup-001.md
```

| 項目       | 内容              |
| ---------- | ----------------- |
| 優先度     | 低                |
| 規模       | 小規模（2-4時間） |
| ステータス | 未実施            |

---

task_id: TASK-FIX-SCORE-DELTA-DEDUP-001
task_name: ScoreDelta direction 判定ロジックの重複解消
category: リファクタリング
target_feature: score delta 計算契約（ScoreDisplay / @repo/shared skill-improver）
priority: 低
scale: 小規模
status: 未実施
source_phase: TASK-SKILL-LIFECYCLE-04 Phase 10 最終レビュー FINAL-M-02
created_date: 2026-03-14
dependencies:

- TASK-SKILL-LIFECYCLE-04

---

# ScoreDelta direction 判定ロジックの重複解消 - タスク指示書

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`calculateScoreDelta` が `apps/desktop/src/renderer/components/skill/ScoreDisplay.tsx` と `packages/shared/src/types/skill-improver.ts` の2箇所で実装されている。現状は閾値判定も含めてロジックが重複しており、将来の仕様変更時に片側だけ更新されるリスクがある。

### 1.2 問題点・課題

- direction 判定ロジックが二重実装でドリフトしやすい
- shared 側と UI 側で型の意味が近く、命名衝突で読み取りコストが高い
- テストが重複仕様に依存し、差分検知が遅れる

### 1.3 放置した場合の影響

- score gate と表示バッジの判定が将来不一致になる可能性がある
- バグ修正時に変更漏れを起こしやすい
- 実装意図（計算責務と表示責務）が曖昧なまま固定される

---

## 2. 何を達成するか（What）

### 2.1 目的

ScoreDelta 計算責務を `@repo/shared` に一本化し、UI 側は表示責務に限定する。

### 2.2 最終ゴール

1. `ScoreDisplay.tsx` のローカル `calculateScoreDelta` 実装が削除される
2. `ScoreDisplay.tsx` が `@repo/shared` の計算関数を利用する
3. `ScoreDelta` の型命名・変換責務が明確になる
4. 既存 UI テストが回帰なく通る

### 2.3 スコープ

#### 含むもの

- `ScoreDisplay.tsx` から重複計算ロジック削除
- shared 計算関数の import 利用
- 必要な型変換（表示専用型が必要な場合）
- テスト更新

#### 含まないもの

- score gate の閾値仕様変更
- `calculateScoreFromBreakdown` など他関数の再設計
- UI デザイン変更（色・レイアウト）

### 2.4 成果物

- 更新済み `ScoreDisplay.tsx`
- 必要に応じた型変換ヘルパー
- 更新済み `ScoreDisplay.test.tsx`
- 検証ログ（test/typecheck）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `packages/shared/src/types/skill-improver.ts` の `calculateScoreDelta` が利用可能
- `@repo/shared` import 経路が desktop から解決できる
- ScoreDisplay の現行テストが実行可能

### 3.2 依存タスク

- TASK-SKILL-LIFECYCLE-04（親タスク）
- TASK-FIX-EVAL-STORE-DISPATCH-001（同時対応で Phase 10 MINOR をまとめて解消可能）

### 3.3 必要な知識

- shared 型と renderer ローカル型の境界設計
- React コンポーネントの表示責務分離
- Vitest + React Testing Library

### 3.4 推奨アプローチ

1. shared 側 `calculateScoreDelta` の戻り値を基準に表示ロジックを組み替える
2. `ScoreDisplay.tsx` のローカル計算関数を削除する
3. 表示都合で必要な変換は小さな adapter 関数に分離する
4. 既存テストを shared 契約準拠に更新する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                           | 発見経緯                                                | 解決策                                                                     | 教訓                                     |
| ---------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------- |
| 計算型と表示型が同名で混在した                 | Phase 10 で「ロジック重複 + 命名衝突」指摘が出た        | 計算責務は shared、表示責務は UI に分離し、必要なら adapter 命名を明示する | 同じ概念名を別責務で再利用しない         |
| ロジック重複が「軽微」と判断され後回しになった | 機能影響が小さいため先送りされた                        | 未タスクとして formalize し、台帳と仕様書を同ターン同期した                | MINOR でも再発確率が高い重複は即記録する |
| 未タスクの配置先が workflow 内へずれた         | `tasks/unassigned-task/` 参照で root 運用と不整合が出た | root `docs/30-workflows/unassigned-task/` へ正規化した                     | path canonicalization を最初に固定する   |

---

## 4. 実行手順

### Phase構成

- Phase A: 計算契約の統一方針を確定
- Phase B: ScoreDisplay 実装を shared 参照へ移行
- Phase C: テスト更新と品質確認

### Phase A: 計算契約の統一方針を確定

#### 目的

shared 計算結果と UI 表示項目の対応を明確にする。

#### 手順

1. shared の `calculateScoreDelta` 戻り値を確認する
2. UI で必要な表示情報（ラベル、矢印、文言）を整理する
3. adapter が必要かを判定する

#### 成果物

- 計算契約メモ

#### 完了条件

- UI が依存する値が shared 契約で説明できる

### Phase B: ScoreDisplay 実装を shared 参照へ移行

#### 目的

重複計算ロジックを削除する。

#### 手順

1. `ScoreDisplay.tsx` のローカル `calculateScoreDelta` を削除
2. shared 関数 import を追加
3. 表示用の direction ラベル変換を必要最小限で実装

#### 成果物

- 更新済み `ScoreDisplay.tsx`

#### 完了条件

- ファイル内に重複計算ロジックが存在しない

### Phase C: テスト更新と品質確認

#### 目的

移行後の表示挙動を保証する。

#### 手順

1. `ScoreDisplay.test.tsx` を更新
2. 対象テストと型チェックを実行
3. 既存 gating テストを再実行

#### 成果物

- 更新済みテスト
- 検証結果ログ

#### 完了条件

- 対象テスト PASS
- 型チェック PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `ScoreDisplay.tsx` にローカル `calculateScoreDelta` 実装が残っていない
- [ ] shared 計算関数を import している
- [ ] direction 表示が既存 UX と同等である

### 品質要件

- [ ] `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/ScoreDisplay.test.tsx` が PASS
- [ ] `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/scoring-gate.test.ts` が PASS
- [ ] `pnpm --filter @repo/desktop exec tsc -p tsconfig.json --noEmit` が PASS

### ドキュメント要件

- [ ] 本指示書が `docs/30-workflows/unassigned-task/` に存在する
- [ ] `task-workflow-backlog.md` 参照が一致している
- [ ] `interfaces-agent-sdk-skill-details.md` の関連未タスク参照が一致している

---

## 6. 検証方法

### テストケース

- TC-01: `previousAnalysis` なしでは Δバッジ非表示
- TC-02: score 上昇時に up 表示
- TC-03: score 低下時に down 表示
- TC-04: 微差（閾値内）は neutral 表示

### 検証手順

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/ScoreDisplay.test.tsx
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/scoring-gate.test.ts
pnpm --filter @repo/desktop exec tsc -p apps/desktop/tsconfig.json --noEmit
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/unassigned-task/task-fix-score-delta-dedup-001.md
```

---

## 7. リスクと対策

| リスク                        | 影響度 | 発生確率 | 対策                                           |
| ----------------------------- | ------ | -------- | ---------------------------------------------- |
| shared 型と UI 表示型の不一致 | 中     | 中       | adapter 関数で責務を分離し、型を明示する       |
| 表示文言が回帰する            | 低     | 中       | ScoreDisplay テストで文言・方向を固定する      |
| shared import 解決に失敗する  | 中     | 低       | desktop tsconfig と package 依存を事前確認する |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-lifecycle-unification/tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-10/final-review-result.md`
- `docs/30-workflows/skill-lifecycle-unification/tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-12/unassigned-task-detection.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-details.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`

### 参考資料

- `apps/desktop/src/renderer/components/skill/ScoreDisplay.tsx`
- `packages/shared/src/types/skill-improver.ts`
- `.claude/rules/02-code-quality.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
ScoreDeltaBadge の direction 判定ロジックが ScoreDisplay.tsx と skill-improver.ts に二重定義
```

### 補足事項

- 本未タスクは root canonical directory（`docs/30-workflows/unassigned-task/`）で管理する。
- `TASK-FIX-EVAL-STORE-DISPATCH-001` と同時対応すると検証コマンドを共通化できる。
