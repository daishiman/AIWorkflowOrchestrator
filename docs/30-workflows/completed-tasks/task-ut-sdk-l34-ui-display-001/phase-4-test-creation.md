# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 4                              |
| 機能名 | task-ut-sdk-l34-ui-display-001 |
| 作成日 | 2026-04-03                     |

## 目的

Phase 2設計に基づき、Layer別グルーピングUIのコンポーネントテストを先に作成し（TDD Red）、
既存テストとの互換性を確認したうえで実装（Phase 5）に進む準備をする。

## 実行タスク

- 命名規則確認: Phase 1で記録したcamelCase/PascalCase規則とテストパターンの整合確認
- 新規テスト作成: `SkillLifecyclePanel.test.tsx`にLayer別グルーピングテストを追加
- fixture更新: `SkillLifecyclePanel.llm-generation.test.tsx`のlayer3 fixture確認
- TDD Red確認: テストが失敗する（実装前のRed状態）を確認

## 参照資料

| 資料名              | パス                                                                                               | 説明                             |
| ------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 2設計書       | `outputs/phase-2/design.md`                                                                        | コンポーネント設計・状態管理設計 |
| Phase 3レビュー結果 | `outputs/phase-3/design-review.md`                                                                 | 設計レビューPASS確認             |
| 型定義              | `packages/shared/src/types/skillCreator.ts`                                                        | RuntimeSkillCreatorVerifyCheck型 |
| 既存テスト          | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx`                | 既存テスト構造                   |
| LLM生成テスト       | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | layer3 fixture（L.286〜310付近） |
| テストパターン仕様  | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                  | Reactコンポーネントテスト手法    |

### システム仕様（aiworkflow-requirements）

| 参照資料       | パス                                                                              | 内容                                |
| -------------- | --------------------------------------------------------------------------------- | ----------------------------------- |
| テストパターン | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | vitest/RTL コンポーネントテスト手法 |

## 実行手順

### Step 0: 命名規則・テストパターン整合確認（必須）

**Phase 1で確認した命名規則との整合チェック**:

```bash
# 既存テストの命名パターン確認
grep -n "describe\|it(\|test(" apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx | head -30

# layer3フィクスチャの確認
grep -n "layer3\|layer4\|L3-\|L4-" apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
```

確認事項:

- テスト記述: `describe`/`it`/`expect` パターンを継承
- fixture形式: 既存`layer3-verify-status`を変更せず、新規テストは`L3-001`形式で追加
- モック: 既存のmock設定を再利用

### Step 1: テストケース一覧の設計

Phase 1の受け入れ条件（AC-1〜AC-8）に対応するテストケース：

| TC-ID | 受け入れ条件 | テスト内容                                                   | ファイル |
| ----- | ------------ | ------------------------------------------------------------ | -------- |
| TC-01 | AC-1         | 4つのLayerグループヘッダーが表示される                       | test.tsx |
| TC-02 | AC-2         | layer3のcheckがLayer 3グループ内に表示される                 | test.tsx |
| TC-03 | AC-3         | severity=errorのcheckに`✗`アイコンが表示される               | test.tsx |
| TC-04 | AC-3         | severity=warningのcheckに`⚠`アイコンが表示される             | test.tsx |
| TC-05 | AC-3         | severity=infoのcheckに`✓`アイコンが表示される                | test.tsx |
| TC-06 | AC-4         | Layerヘッダーに集計バッジ（件数）が表示される                | test.tsx |
| TC-07 | AC-5         | checksが空のLayerのグループは表示されない                    | test.tsx |
| TC-08 | AC-6         | 既存Layer1/2のchecksが正しいグループに表示される（後方互換） | test.tsx |
| TC-09 | AC-7         | Layerヘッダークリックでグループが折りたたまれる              | test.tsx |
| TC-10 | AC-7         | 折りたたみ後に再クリックで再展開される                       | test.tsx |
| TC-11 | AC-8         | pnpm typecheck がエラー0件で完了する                         | CLI確認  |

### Step 2: テストコードの作成

`apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx`に
以下のdescribeブロックを追加する：

```typescript
describe("verifyDetail Layer別グルーピング表示", () => {
  const makeVerifyDetailWithAllLayers = () => ({
    checks: [
      {
        id: "L1-001",
        layer: "layer1",
        severity: "error",
        summary: "SKILL.md が存在しない",
        passed: false,
      },
      {
        id: "L2-001",
        layer: "layer2",
        severity: "warning",
        summary: "Triggerセクションが短い",
        passed: false,
      },
      {
        id: "L3-001",
        layer: "layer3",
        severity: "warning",
        summary: "$schemaフィールドが欠損",
        passed: false,
      },
      {
        id: "L4-001",
        layer: "layer4",
        severity: "error",
        summary: "Anchorsセクションが不備",
        passed: false,
      },
    ],
    passed: false,
    score: 0,
    // ...他の必須フィールド
  });

  it("TC-01: Layer別グループヘッダーが4つ表示される", () => {
    // renderして各Layerヘッダーのテキストを確認
  });

  it("TC-02: layer3のcheckがLayer 3グループ内に表示される", () => {
    // L3-001がLayer 3のグループ内にあることを確認
  });

  it("TC-03〜05: severityアイコンが正しく表示される", () => {
    // error: ✗, warning: ⚠, info: ✓
  });

  it("TC-06: Layerヘッダーに集計バッジが表示される", () => {
    // Layer 3ヘッダーに warning バッジが表示される
  });

  it("TC-07: checksが空のLayerグループは表示されない", () => {
    // layer3のchecksが空の場合、Layer 3ヘッダーが存在しない
  });

  it("TC-08: Layer1/2のchecksが後方互換で正しく表示される", () => {
    // 既存Layer1/2 checksがグルーピング後も正しい位置に表示される
  });

  it("TC-09〜10: Layerヘッダークリックで開閉動作する", () => {
    // クリックで非表示、再クリックで再表示
  });
});
```

### Step 3: TDD Red確認

テスト追加後、実装前の状態でテストを実行し、追加したテストが「失敗（Red）」になることを確認：

```bash
pnpm --filter @repo/desktop test -- --run --reporter=verbose 2>&1 | grep -E "FAIL|PASS|✗|✓" | head -30
```

**期待結果**: 新規追加テスト（TC-01〜TC-10）が全てFAILすること（Red状態）。

### Step 4: llm-generation テストの確認

`SkillLifecyclePanel.llm-generation.test.tsx`のlayer3 fixtureを確認：

- 既存fixture（`layer3-verify-status`形式）はそのまま維持する
- Layer別グルーピング後の`layer`フィールドを使って正しくグルーピングされるか確認
- assertionをグルーピング後のDOM構造に合わせて更新

## 統合テスト連携【必須】

TDD Red確認：

| 確認項目                          | 確認方法                                    |
| --------------------------------- | ------------------------------------------- |
| 新規テストがRedになること         | `pnpm --filter @repo/desktop test -- --run` |
| 既存テストがGreenのままであること | 既存テストの結果を確認                      |
| TypeScript型エラーがないこと      | `pnpm --filter @repo/desktop typecheck`     |

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                                                           |
| -------------- | ------------------------------------------------------------------ |
| UI/UX          | コンポーネントテストのため適用 - RTLのユーザー操作シミュレーション |
| アーキテクチャ | テストの責務分離（unit vs integration）確認                        |

## 成果物

| 成果物                 | パス                                                                                | 説明                              |
| ---------------------- | ----------------------------------------------------------------------------------- | --------------------------------- |
| 更新済みテストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx` | Layer別グルーピングテスト追加     |
| テスト設計書           | `outputs/phase-4/test-design.md`                                                    | テストケース一覧・TDD Red確認結果 |

## 完了条件

- [ ] Phase 1命名規則（camelCase/PascalCase）とテストパターンの整合を確認している
- [ ] TC-01〜TC-10のテストケースが`SkillLifecyclePanel.test.tsx`に追加されている
- [ ] 追加したテストがTDD Red（失敗）状態であることを確認している
- [ ] 既存テストがGreenのまま維持されていることを確認している
- [ ] `llm-generation.test.tsx`のlayer3 fixtureとの互換性を確認している
- [ ] TypeScriptコンパイルエラーがないことを確認している
- [ ] **本Phase内の全タスクを100%実行完了**

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-ut-sdk-l34-ui-display-001 --phase 4
```

## 次のPhase

Phase 5: 実装（TDD: Green）
