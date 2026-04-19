# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| PhaseID    | 4                                                              |
| Phase名    | テスト作成                                                     |
| タスクID   | UT-LIFECYCLE-PANEL-LLM-GEN-DESCRIBE-SKIP-CLEANUP-001           |
| タスク名   | SkillLifecyclePanel LLM生成テスト describe.skip クリーンアップ |
| 前Phase    | Phase 3（PASS または MINOR）                                   |
| 次Phase    | Phase 5                                                        |
| 作成日     | 2026-04-18                                                     |
| ステータス | pending                                                        |

## 目的

Phase 5（実装）でのクリーンアップ前に、現在アクティブなテスト（describe.skip でないもの）の
PASS 状態を記録・確認する。クリーンアップ後にアクティブなテストが壊れていないことを
検証するためのベースラインを確立する。

## 実行タスク

- [ ] 現在アクティブな describe ブロックの一覧と通過数を記録する
- [ ] 対象ファイル単体での vitest 実行結果をベースラインとして保存する
- [ ] 修正対象3件（U-4/U-11/U-8b）の testid 存在を最終確認する
- [ ] snapshot 系4件（U-18b/U-19b/U-20b/U-21）の旧 API 依存箇所を行番号で特定する
- [ ] 旧 API モック宣言の全出現箇所を記録する（削除対象の特定）

## 参照資料

| 資料名                                      | パス                                                                                               | 用途                         |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 2 設計書                              | `outputs/phase-2/design.md`                                                                        | 処置設計・検証マトリクス参照 |
| Phase 3 レビュー結果                        | `outputs/phase-3/gate-decision.md`                                                                 | 処置分類の最終確定内容確認   |
| SkillLifecyclePanel.llm-generation.test.tsx | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | テスト現在状態の把握         |
| SkillLifecyclePanel.tsx                     | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | testid の最終存在確認        |
| 要件定義書                                  | `outputs/phase-1/requirements-definition.md`                                                       | Phase 1 成果物               |
| 受け入れ基準                                | `outputs/phase-1/acceptance-criteria.md`                                                           | Phase 1 成果物               |

## 実行手順

### 0. 現在アクティブなテストのベースライン記録

```bash
# アクティブな describe ブロック（.skip なし）の一覧を確認
grep -n "^describe(" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# describe.skip のブロック一覧を確認（Phase 5 の削除対象を最終確認）
grep -n "^describe\.skip(" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# 対象ファイル単体での vitest 実行（アクティブテストの現在 PASS 状態を記録）
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx \
  --reporter=verbose 2>&1 | tee /tmp/lifecycle-llm-gen-baseline.txt

# PASS / FAIL 集計
grep -E "^(PASS|FAIL|Tests)" /tmp/lifecycle-llm-gen-baseline.txt
```

### 1. 修正対象3件の testid 最終確認

```bash
# U-4: isGenerating ガード - 準備ボタンの testid 確認
grep -n "data-testid" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx | \
  grep -i "prepare\|generate\|plan\|start"

# U-11: 入力バリデーション - textarea / input の testid 確認
grep -n "data-testid" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx | \
  grep -i "input\|textarea\|text\|description"

# U-8b: canonical spec 保持 - currentPlanResult.skillSpec の render 確認
grep -n "skillSpec\|currentPlanResult\|spec" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx | head -20

# skill-lifecycle-prepare-button の最終確認（U-1〜U-4/U-8b/U-11 に共通する前提）
grep -rn "skill-lifecycle-prepare-button" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

#### testid 最終確認結果（実行時に記録）

| テスト ID | 必要な testid / 実装               | 存在確認結果 | Phase 5 での処置    |
| --------- | ---------------------------------- | ------------ | ------------------- |
| U-4       | `skill-lifecycle-prepare-button`   | pending      | 存在→修正/不在→削除 |
| U-11      | テキストエリア testid              | pending      | 存在→修正/不在→削除 |
| U-8b      | `currentPlanResult.skillSpec` 参照 | pending      | 存在→修正/不在→削除 |

### 2. snapshot 系4件の旧 API 依存箇所の特定

```bash
# U-18b の行範囲確認
grep -n "U-18b\|cancel then re-plan" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# U-19b の行範囲確認
grep -n "U-19b\|multiple textarea edits" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# U-20b の行範囲確認
grep -n "U-20b\|cancel clears approved" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# U-21 の行範囲確認
grep -n "U-21\|approved snapshot behavior after execute" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# 各テスト内の planSkill / detectMode 呼び出し箇所を特定
grep -n "planSkill\|detectMode\|skill-lifecycle-prepare-button" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
```

### 3. 旧 API モック宣言の全出現箇所記録

```bash
# mockPlanSkill の全出現（宣言・設定・呼び出し確認）
grep -n "mockPlanSkill" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# mockDetectMode の全出現
grep -n "mockDetectMode" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# mockExecutePlan の全出現（アクティブテストでも使用中のため慎重に確認）
grep -n "mockExecutePlan" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# window.skillCreatorAPI への planSkill / detectMode 設定箇所
grep -n "planSkill:\|detectMode:" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
```

#### 旧 API モック出現箇所一覧（実行時に記録）

| モック名          | 宣言行  | beforeEach 設定行 | describe.skip 内での使用行 | アクティブテスト内での使用                |
| ----------------- | ------- | ----------------- | -------------------------- | ----------------------------------------- |
| `mockPlanSkill`   | pending | pending           | pending                    | pending（あれば削除不可）                 |
| `mockDetectMode`  | pending | pending           | pending                    | pending（あれば削除不可）                 |
| `mockExecutePlan` | pending | pending           | pending                    | pending（アクティブで使用中の可能性あり） |

### 4. ベースラインサマリーの確認

```bash
# 現在の describe / it 総数（アクティブ + skip）
echo "--- describe ブロック総数 ---"
grep -c "^describe" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

echo "--- describe.skip ブロック数 ---"
grep -c "^describe\.skip" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

echo "--- アクティブな describe ブロック数 ---"
grep -c "^describe(" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# 全テスト（SkillLifecyclePanel 系）の現在の PASS 状態
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel \
  --reporter=verbose 2>&1 | tail -20
```

## 統合テスト連携

| 判定項目                                           | 基準                                 | 結果    |
| -------------------------------------------------- | ------------------------------------ | ------- |
| 現在アクティブなテストの PASS 確認                 | 全件 PASS（ベースライン確立）        | pending |
| 修正対象3件（U-4/U-11/U-8b）の testid 存在最終確認 | 存在/不在が明確に記録されている      | pending |
| snapshot 系4件の旧 API 依存行番号が特定済み        | 各テストの依存箇所が行番号で確認済み | pending |
| 旧 API モック宣言の全出現箇所が記録済み            | Phase 5 の削除範囲が確定している     | pending |

## 多角的チェック観点

| 観点               | チェック内容                                                                    |
| ------------------ | ------------------------------------------------------------------------------- |
| ベースライン完全性 | アクティブなテスト全件が PASS の状態でベースラインを記録しているか              |
| testid 調査完全性  | U-4/U-11/U-8b の testid を SkillLifecyclePanel.tsx の全ファイルで確認しているか |
| モック依存の正確性 | mockExecutePlan がアクティブテストでも使用中であることを見落としていないか      |
| 行番号の正確性     | snapshot 系4件の削除範囲が正確に行番号で記録されているか                        |

## サブタスク管理

1. 現在アクティブなテストのベースライン記録
2. 修正対象3件（U-4/U-11/U-8b）の testid 最終確認
3. snapshot 系4件の旧 API 依存行番号特定
4. 旧 API モック宣言の全出現箇所記録
5. ベースラインサマリーの確認
6. 成果物の出力

## 成果物

| 成果物                 | パス                                      | 説明                                           |
| ---------------------- | ----------------------------------------- | ---------------------------------------------- |
| ベースライン記録       | `outputs/phase-4/baseline-test-result.md` | アクティブテストの現在 PASS 状態・テスト数集計 |
| testid 確認記録        | `outputs/phase-4/testid-confirmation.md`  | U-4/U-11/U-8b の testid 存在確認結果           |
| モック宣言出現箇所一覧 | `outputs/phase-4/mock-declaration-map.md` | 旧 API モックの全出現行番号と削除可否判定      |

## 完了条件

- [ ] 現在アクティブなテストの vitest 実行結果が全件 PASS でベースライン記録済み
- [ ] 修正対象3件（U-4/U-11/U-8b）の testid 存在確認が完了し結果が記録済み
- [ ] snapshot 系4件の旧 API 依存箇所が行番号で特定済み
- [ ] 廃止済み API モック宣言（mockPlanSkill / mockDetectMode）の全出現箇所が記録済み
- [ ] Phase 5 の実装で何をどの行で削除・修正するかが明確になっている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-LIFECYCLE-PANEL-LLM-GEN-DESCRIBE-SKIP-CLEANUP-001
```

## 次Phase

Phase 5（実装）へ進む。
