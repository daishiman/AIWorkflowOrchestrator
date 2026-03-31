# Phase 4: テスト作成

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| Phase      | 4                         |
| 機能名     | task-rt-05-test-rerun-ac4 |
| 前提Phase  | Phase 3                   |
| 後続Phase  | Phase 5                   |
| ステータス | 未実施                    |
| 作成日     | 2026-03-31                |

## 目的

既存テストファイルが AC-1〜AC-3 を満たす検証ケースを含んでいるかを静的に確認し、Phase 9 の品質保証で実行するテストメニューを固定する。新規テストが必要な場合はスコープ拡大として記録する。

## 実行タスク

### タスク1: Engine テストの静的確認

**目的**: `SkillCreatorWorkflowEngine.test.ts` が AC-1 を満たす 4 件以上のテストを持つことを確認する

**実行手順**:

1. テストケース数の確認
   ```bash
   grep -c "it\|test\|describe" apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts
   ```
2. multi_select 関連テストの確認
   ```bash
   grep -n "multi_select" apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts
   ```
3. テスト構造の確認（describe/it の入れ子）
   ```bash
   grep -n "describe\|it(" apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts | head -20
   ```

**期待される成果物**:

- テストケース数（4 件以上）の確認結果

### タスク2: Renderer テストの静的確認

**目的**: `SkillLifecyclePanel.llm-generation.test.tsx` が AC-2 を満たす 5 件以上のテストを持つことを確認する

**実行手順**:

1. テストケース数の確認
   ```bash
   grep -c "it\|test\|describe" apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
   ```
2. multi_select 関連テストの確認
   ```bash
   grep -n "multi_select" apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
   ```

### タスク3: AC-3 対象 kind のテスト存在確認（事前確認）

**目的**: 既存 4 kind の回帰テストが両テストファイルに存在することを事前確認する（Phase 6 で詳細確認）

**実行手順**:

```bash
grep -n "single_select\|free_text\|secret\|confirm" \
  apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
```

## 参照資料

| 資料名           | パス                                                                                               | 内容            |
| ---------------- | -------------------------------------------------------------------------------------------------- | --------------- |
| Engine テスト    | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`              | 確認対象        |
| Renderer テスト  | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | 確認対象        |
| Phase 1 要件定義 | `phase-1-requirements.md`                                                                          | AC-1〜AC-3 定義 |
| Phase 2 設計     | `phase-2-design.md`                                                                                | 実行順序の根拠  |

## 成果物

| 成果物           | パス                                     | 内容                           |
| ---------------- | ---------------------------------------- | ------------------------------ |
| テスト作成仕様   | `phase-4-test-creation.md`               | 静的確認と品質保証メニュー固定 |
| テストカバー確認 | `outputs/phase-4/test-coverage-check.md` | テストケース数と AC 対応の記録 |

## 統合テスト連携

- Phase 6 でこの確認を基に AC-3 の詳細 grep を行う
- Phase 7 で AC-coverage matrix を完成させる根拠とする

## 完了条件

- [ ] Engine テストのケース数が 4 件以上と確認されている（または不足の場合は記録されている）
- [ ] Renderer テストのケース数が 5 件以上と確認されている（または不足の場合は記録されている）
- [ ] 既存 4 kind の grep 結果が記録されている
- [ ] 新規テスト追加が必要かどうかの判断が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## Phase末端アクション【必須】

- `outputs/phase-4/test-coverage-check.md` を作成し、テストケース数と AC 対応を記録する
- `artifacts.json` の Phase 4 ステータスを `completed` に更新する
