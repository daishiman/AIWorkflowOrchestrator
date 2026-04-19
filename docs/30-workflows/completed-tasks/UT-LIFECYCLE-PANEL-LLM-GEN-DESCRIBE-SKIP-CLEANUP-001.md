# UT-LIFECYCLE-PANEL-LLM-GEN-DESCRIBE-SKIP-CLEANUP-001 - タスク指示書

## メタ情報

```yaml
issue_number: 2236
task_id: UT-LIFECYCLE-PANEL-LLM-GEN-DESCRIBE-SKIP-CLEANUP-001
task_name: SkillLifecyclePanel LLM生成テスト describe.skip クリーンアップ
category: 改善
target_feature: SkillLifecyclePanel LLM生成テスト（llm-generation.test.tsx）
priority: 中
scale: 中規模
status: 未実施
source_phase: UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001 Phase 12 未タスク検出
created_date: 2026-04-16
dependencies: [UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001]
spec_path: docs/30-workflows/unassigned-task/UT-LIFECYCLE-PANEL-LLM-GEN-DESCRIBE-SKIP-CLEANUP-001.md
```

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| タスクID     | UT-LIFECYCLE-PANEL-LLM-GEN-DESCRIBE-SKIP-CLEANUP-001           |
| タスク名     | SkillLifecyclePanel LLM生成テスト describe.skip クリーンアップ |
| 分類         | 改善                                                           |
| 対象機能     | SkillLifecyclePanel LLM生成テスト（llm-generation.test.tsx）   |
| 優先度       | 中                                                             |
| 見積もり規模 | 中規模                                                         |
| ステータス   | 未実施                                                         |
| 発見元       | UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001 Phase 12             |
| 発見日       | 2026-04-16                                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`SkillCreateWizard.llm-generation.test.tsx` のクリーンアップ（UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001）を実施した際、
同じ `__tests__/` ディレクトリ内の `SkillLifecyclePanel.llm-generation.test.tsx` に
旧フロー（`planSkill` / `executePlan`）に依存した **12件の `describe.skip`** が残存していることが判明した。

旧フローは W2-seq-03a 移行後に `createSkill` ベースの新フローに置き換えられており、
旧 API（`planSkill`, `executePlan`, `detectMode`）はモックとして宣言されているが
実際のコンポーネントからは削除済みの状態。

### 1.2 問題点・課題

| #   | 問題                                                                         | 影響                                   |
| --- | ---------------------------------------------------------------------------- | -------------------------------------- |
| 1   | 12件の `describe.skip` が残存し、実際には動作しないテストが存在する          | テストカバレッジが過大評価される可能性 |
| 2   | 旧 API（`planSkill`/`executePlan`/`detectMode`）依存のモックが維持されている | ファイルのメンテナンスコストが高い     |
| 3   | スキップされたままのテストはコード変更時の回帰を検出できない                 | 品質リスク                             |

**残存する describe.skip 一覧（12件）**:

| テスト名                                                            | 行   | 種別     |
| ------------------------------------------------------------------- | ---- | -------- |
| `U-1: detectMode → planSkill sequential call`                       | 397  | 旧フロー |
| `U-2: backward compatibility - detectMode='create' skips planSkill` | 420  | 旧フロー |
| `U-4: isGenerating guard prevents double invocation (R-1)`          | 458  | 要調査   |
| `U-6: terminal_handoff triggers handoff guidance display`           | 497  | 旧フロー |
| `U-10: planSkill failure propagates error`                          | 921  | 旧フロー |
| `U-11: empty input validation`                                      | 968  | 要調査   |
| `U-12: planSkill API unavailable graceful degradation`              | 984  | 旧フロー |
| `U-8b: canonical binding drift prevention`                          | 1428 | 要調査   |
| `U-18b: cancel then re-plan replaces approved snapshot`             | 1756 | snapshot |
| `U-19b: multiple textarea edits do not affect approved snapshot`    | 1794 | snapshot |
| `U-20b: cancel clears approved snapshot symmetrically`              | 1819 | snapshot |
| `U-21: approved snapshot behavior after execute failure`            | 1841 | snapshot |

### 1.3 放置した場合の影響

- スキップされたテストが増え続け、テストスイートの信頼性が低下する
- 旧 API 依存のモック宣言が維持されることで、新規開発者がコンポーネントの実際の動作を誤解する
- 旧フロー依存テストが復元されることなく積み上がり、最終的に大規模クリーンアップが必要になる

---

## 2. 何を達成するか（What）

### 2.1 目的

`SkillLifecyclePanel.llm-generation.test.tsx` の 12 件の `describe.skip` を
適切に処理し、テストスイートを現行の `createSkill` ベースフローと整合させる。

### 2.2 最終ゴール

1. 12件の `describe.skip` が以下のいずれかで解消されている:
   - **削除**: 旧フローにのみ意味がありポートできないテスト（U-1, U-2, U-6, U-10, U-12）
   - **修正**: 新フローで同等の動作を検証できるテスト（U-4, U-11, U-8b）
   - **別ファイル化**: snapshot 系テスト（U-18b, U-19b, U-20b, U-21）は別途判断
2. `describe.skip` がゼロになった後でも既存の passing tests (U-3, U-5, U-7〜9, U-13〜17等) が全て PASS
3. 旧 API 依存モック宣言のうち不要なものが除去されている

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` の `describe.skip` 解消
- 旧 API モック宣言（`mockPlanSkill`, `mockExecutePlan`, `mockDetectMode` 等）の整理
- snapshot 系テスト（U-18b〜U-21）の処置方針決定

#### 含まないもの

- `SkillLifecyclePanel.auth-regression.test.tsx` のスキップ（別タスク: UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001）
- プロダクションコード（`SkillLifecyclePanel.tsx`）の変更
- 新しいテストケースの追加（既存スキップの処置のみ）

### 2.4 成果物

- クリーンアップ済み `SkillLifecyclePanel.llm-generation.test.tsx`
- スキップ処置判断ログ（各テストの削除/修正理由）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001 が完了済み
- `SkillCreateWizard.test.tsx` の 43 件が全て PASS の状態
- `SkillLifecyclePanel.llm-generation.test.tsx` の既存 passing tests が確認済み

### 3.2 依存タスク

- UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001（完了）

### 3.3 必要な知識

- `createSkill` ベースの新フロー（`useCreateSkill` hook）の動作
- `planSkill` / `executePlan` / `detectMode` の旧フロー廃止経緯
- Vitest `describe.skip` の挙動と cleanup パターン
- `SkillLifecyclePanel` コンポーネントの現行 API

### 3.4 推奨アプローチ

1. **分類先確定**: 各 `describe.skip` を「削除」「修正」「保留」に分類する
2. **削除先行**: `planSkill`/`executePlan`/`detectMode` に直接依存するテストを削除
3. **移植判断**: 新フローで同等検証が可能なテストを `describe.skip` → `describe` に変換
4. **snapshot 系**: approve フロー UI が確立している場合は修正、未確立なら削除

---

## 4. 実行手順

### Phase構成

- Phase A: スキップ分類・処置方針確定
- Phase B: 削除対象テストの除去
- Phase C: 修正対象テストの書き直し
- Phase D: テスト実行・カバレッジ確認

### Phase A: スキップ分類・処置方針確定

#### 目的

12件の `describe.skip` を調査し、各テストの処置方針（削除/修正/保留）を確定する。

#### 手順

1. 各 `describe.skip` ブロックを読み、旧 API（`planSkill`, `executePlan`, `detectMode`）への依存を確認する
2. 新フロー（`createSkill`, `useCreateSkill`）での再現可否を判断する
3. snapshot 系テスト（U-18b〜U-21）の UI が現行コンポーネントに存在するか確認する
4. 処置方針テーブルを作成する

#### 成果物

- 処置方針テーブル（各テストの削除/修正理由付き）

#### 完了条件

- 12件全ての処置方針が確定している

---

### Phase B: 削除対象テストの除去

#### 目的

旧フローにのみ意味がある `describe.skip` を削除し、不要なモック宣言も整理する。

#### 手順

1. Phase A で「削除」に分類したテストを除去する
2. 削除によって未使用になったモック宣言（`mockPlanSkill` 等）を除去する
3. `pnpm --filter @repo/desktop test -- --reporter=verbose SkillLifecyclePanel.llm-generation` で PASS を確認

#### 成果物

- 削除済みテストファイル
- 削除理由コメント（git blame で追跡可能な形）

#### 完了条件

- 削除後のテスト実行が全て PASS

---

### Phase C: 修正対象テストの書き直し

#### 目的

新フローで同等の動作を検証できるテストを `describe.skip` → `describe` に変換する。

#### 手順

1. Phase A で「修正」に分類したテストを `describe` に変換する
2. 旧 API 呼び出しを新 API（`createSkill` 等）に置き換える
3. テスト実行し PASS を確認する

#### 成果物

- 修正済みテスト（`describe.skip` → `describe`）

#### 完了条件

- 変換後のテストが PASS
- `describe.skip` 件数がゼロ

---

### Phase D: テスト実行・カバレッジ確認

#### 目的

全テストの PASS と最低カバレッジ基準（80%）を確認する。

#### 手順

```bash
# 全 SkillLifecyclePanel テスト実行
pnpm --filter @repo/desktop test -- \
  --reporter=verbose \
  SkillLifecyclePanel

# カバレッジ確認
pnpm --filter @repo/desktop test -- \
  --coverage \
  SkillLifecyclePanel.llm-generation
```

#### 成果物

- テスト実行ログ
- カバレッジレポート

#### 完了条件

| 指標       | 最低基準 |
| ---------- | -------- |
| Statements | 80%      |
| Branch     | 60%      |
| Functions  | 80%      |
| Lines      | 80%      |

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `SkillLifecyclePanel.llm-generation.test.tsx` の `describe.skip` が 0 件
- [ ] 削除した `describe.skip` の理由が記録されている
- [ ] 不要なモック宣言（`mockPlanSkill` 等）が除去されている

### 品質要件

- [ ] 全テストが PASS（既存 passing tests の回帰なし）
- [ ] カバレッジが最低基準以上

### ドキュメント要件

- [ ] 本指示書が `docs/30-workflows/unassigned-task/` に存在する
- [ ] `task-workflow.md` に参照が追加されている

---

## 6. 検証方法

### テストケース

```bash
# describe.skip 残存確認
grep -c "describe\.skip" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
# → 0 になること

# テスト全件 PASS 確認
pnpm --filter @repo/desktop test -- \
  --reporter=verbose \
  SkillLifecyclePanel.llm-generation
```

### 検証手順

1. `describe.skip` 件数が 0 であることを `grep -c` で確認
2. `pnpm test` で PASS/FAIL 件数を確認
3. カバレッジレポートで 80% 基準を確認

---

## 7. リスクと対策

| リスク                                                 | 影響度 | 発生確率 | 対策                                          |
| ------------------------------------------------------ | ------ | -------- | --------------------------------------------- |
| snapshot 系テスト（U-18b〜U-21）が書き直せず削除になる | 中     | 中       | 削除前に approve フロー UI の現状を確認する   |
| モック削除により既存 passing tests が壊れる            | 高     | 低       | Phase D で必ず全テスト実行して確認する        |
| U-4/U-11/U-8b の新フロー対応が複雑                     | 中     | 中       | Phase A の分類で「保留」として別 Issue 化する |

---

## 8. 参照情報

### 関連ドキュメント

- `outputs/phase-12/UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001-unassigned-task-detection.md`
- `outputs/phase-12/UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001-implementation-guide.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-skill-wizard-llm-connection.md`

### 参考資料

- `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`（現行フロー参考）

---

## 9. 備考

### 苦戦箇所【記入必須】

> 実行中に迷った点、判断に時間がかかった点を記録してください（実施後に記入）

| 項目     | 内容           |
| -------- | -------------- |
| 症状     | （実施後記入） |
| 原因     | （実施後記入） |
| 対応     | （実施後記入） |
| 再発防止 | （実施後記入） |

### 補足事項

- 本タスクは `UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001` の Phase 12 未タスク検出から派生
- `planSkill`/`executePlan` 旧フローは W2-seq-03a 移行で廃止済み
- snapshot 系テスト（U-18b〜U-21）は approved snapshot の UI 確認後に処置方針を決定する
