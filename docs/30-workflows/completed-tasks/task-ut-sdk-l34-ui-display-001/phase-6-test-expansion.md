# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 6                              |
| 機能名 | task-ut-sdk-l34-ui-display-001 |
| 作成日 | 2026-04-03                     |

## 目的

Phase 5の実装を踏まえ、fail path・境界値・回帰ガードのテストを追加し、
テストスイートを実装の現実に合わせて強化する。

## 実行タスク

- fail pathテスト追加: エラー状態・空状態・不正データのテスト
- 境界値テスト追加: 大量checks・同一Layer全部・全Layer混在のテスト
- reverifyループテスト追加: verifyDetail更新後のグルーピング再計算テスト
- 回帰ガードテスト: 既存Layer1/2表示の後方互換性を明示的にテスト

## 参照資料

| 資料名             | パス                                                                 | 説明                            |
| ------------------ | -------------------------------------------------------------------- | ------------------------------- |
| Phase 4成果物      | `outputs/phase-4/test-design.md`                                     | 既存テストケース一覧            |
| Phase 5成果物      | `outputs/phase-5/implementation-summary.md`                          | 実装サマリー（分岐・Hooks一覧） |
| 実装コンポーネント | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 実装済みコンポーネント          |

## 実行手順

### Step 1: fail pathテスト

```typescript
describe("verifyDetail Layer別グルーピング - fail path", () => {
  it("TC-12: verifyDetailがnullの場合、Layerグループが表示されない", () => {
    // verifyDetail=nullでレンダリング → Layerヘッダーなし
  });

  it("TC-13: checksが空配列の場合、Layerグループが一切表示されない", () => {
    // checks=[]でレンダリング → グループなし
  });

  it("TC-14: 未知のlayer値（'layer5'等）のcheckは表示されない", () => {
    // layer='layer5'のcheck → LAYER_ORDERに含まれないためスキップ
  });
});
```

### Step 2: 境界値テスト

```typescript
describe("verifyDetail Layer別グルーピング - 境界値", () => {
  it("TC-15: 全checksがlayer1のみの場合、Layer2/3/4グループが非表示", () => {
    // layer1のchecksのみ → Layer2/3/4ヘッダーなし
  });

  it("TC-16: 同一Layerに複数checksがある場合、全件表示される", () => {
    // layer3に3件 → Layer 3グループ内に3件表示
  });

  it("TC-17: 全Layer・全severity混在での集計バッジ正確性", () => {
    // layer3: error×1, warning×2, info×1 → "1 error", "2 warning", "1 info"
  });
});
```

### Step 3: reverifyループテスト

```typescript
describe("verifyDetail reverify後のグルーピング更新", () => {
  it("TC-18: verifyDetail更新後にchecksByLayerが再計算される", () => {
    // 初回: layer3のchecks → 再render with 新verifyDetail → 更新反映
  });

  it("TC-19: reverify後も開閉状態が保持される", () => {
    // Layer3を折りたたむ → verifyDetail更新 → Layer3が折りたたまれたまま
  });
});
```

### Step 4: テスト実行と確認

```bash
# 全テスト実行
pnpm --filter @repo/desktop test -- --run 2>&1 | tail -30

# カバレッジレポート生成（Phase 7の準備）
pnpm --filter @repo/desktop test -- --run --coverage 2>&1 | tail -20
```

## 統合テスト連携【必須】

| 確認項目                          | 確認方法                                    | 期待結果     |
| --------------------------------- | ------------------------------------------- | ------------ |
| 全テストGreen（Phase 4+6追加分）  | `pnpm --filter @repo/desktop test -- --run` | 全テストPASS |
| fail pathテストがカバーされている | カバレッジ確認                              | Branch 60%+  |

## 成果物

| 成果物             | パス                                                                                | 説明                   |
| ------------------ | ----------------------------------------------------------------------------------- | ---------------------- |
| 拡充テスト         | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx` | TC-12〜TC-19追加       |
| テスト拡充レポート | `outputs/phase-6/test-expansion-report.md`                                          | 追加テストの概要・結果 |

## 完了条件

- [ ] fail pathテスト（TC-12〜TC-14）が追加・PASSしている
- [ ] 境界値テスト（TC-15〜TC-17）が追加・PASSしている
- [ ] reverifyループテスト（TC-18〜TC-19）が追加・PASSしている
- [ ] 全テスト（Phase 4+6追加分）がGreenである
- [ ] **本Phase内の全タスクを100%実行完了**

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-ut-sdk-l34-ui-display-001 --phase 6
```

## 次のPhase

Phase 7: カバレッジ確認
