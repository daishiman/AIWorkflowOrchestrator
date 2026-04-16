# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 4                           |
| Phase名    | テスト作成                  |
| 対象機能   | TASK-SW-STRUCT-001          |
| 前提Phase  | Phase 3: 設計レビューゲート |
| 次Phase    | Phase 5: 実装               |
| ステータス | 未実施                      |
| 作成日     | 2026-04-15                  |

## 目的

TDD の Red フェーズとして、`runCreateWorkflow` 出力仕様修正の実装前に失敗するテストケースを設計する。
AC-1〜AC-5 を網羅するテストケース一覧と、`collaborative` モードの回帰確認計画を策定する。

## 実行タスク

### Task 1: 新規テストケース設計（AC-1〜AC-4）

テスト対象: `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`

- AC-1: `structurePlan.purpose` が `options.description` と一致することをアサートする
- AC-2: `structurePlan.agents` が `["extract-purpose", "plan-structure"]` と一致することをアサートする
- AC-3: `structurePlan.features` が空配列であることをアサートする
- AC-4: `loadAgent` が存在しない環境でも `createSkill()` が成功することをアサートする

### Task 2: 回帰テスト計画（AC-5）

- 既存の `collaborative` モードテストケースが全てパスすることを確認
- 型変更がないため既存テストへの影響はない見込みだが、実行して確認する

### Task 3: テストコードスケルトン作成

```typescript
// TC-01: purpose フィールドの値確認
it("create モードで runCreateWorkflow が返す structurePlan.purpose は options.description と一致する", async () => {
  const service = createTestService();
  // createSkill を呼び出し、内部の structurePlan の purpose を検証
  // ※ runCreateWorkflow は private のため createSkill 経由で間接検証
});

// TC-02: agents フィールドの値確認
it("create モードで runCreateWorkflow が返す structurePlan.agents はエージェント名リストである", async () => {
  // agents に ["extract-purpose", "plan-structure"] が含まれることを確認
});

// TC-03: features フィールドの値確認
it("create モードで runCreateWorkflow が返す structurePlan.features は空配列である", async () => {
  // features が [] であることを確認
});

// TC-04: フォールバック動作確認
it("create モードで内部エラーが発生しても createSkill() は成功する", async () => {
  // エラーが発生しても null フォールバックで継続する
});
```

## テストケース一覧

### 新規テストケース（TC-01〜TC-04）

| TC ID | 対応AC | テストタイトル                                                          | 期待結果                                                       |
| ----- | ------ | ----------------------------------------------------------------------- | -------------------------------------------------------------- |
| TC-01 | AC-1   | create モードで structurePlan.purpose は options.description と一致する | `purpose === options.description`                              |
| TC-02 | AC-2   | create モードで structurePlan.agents はエージェント名リストである       | `agents` が `["extract-purpose", "plan-structure"]` と一致する |
| TC-03 | AC-3   | create モードで structurePlan.features は空配列である                   | `features` が `[]` と一致する                                  |
| TC-04 | AC-4   | create モードで内部エラーが発生しても createSkill() は成功する          | `createSkill()` が例外をスローしない                           |

### 回帰テストケース（TC-R01〜TC-R02）

| TC ID  | 対応AC | テストタイトル                                                     | 期待結果       |
| ------ | ------ | ------------------------------------------------------------------ | -------------- |
| TC-R01 | AC-5   | collaborative モード: 有効な interviewResult でスキルが作成される  | 既存動作と同一 |
| TC-R02 | AC-5   | collaborative モード: runCollaborativeWorkflow が loadAgent を呼ぶ | 既存動作と同一 |

## TDD 確認コマンド

```bash
# Red フェーズ（実装前に TC-01〜TC-04 が失敗することを確認）
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService" --grep "structurePlan"

# 回帰確認（TC-R01〜TC-R02 が Green であることを確認）
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService" --grep "collaborative"
```

## 参照資料

- `outputs/phase-2/design.md` — 設計書（テスト観測点）
- `outputs/phase-1/requirements.md` — 受入条件（AC-1〜AC-5）

## 統合テスト連携

- 本タスクはユニットテストのみを対象とする
- `createSkill()` の IPC 契約は変更しないため統合テストの変更は不要

## 成果物

| 成果物         | パス                             |
| -------------- | -------------------------------- |
| test-design.md | `outputs/phase-4/test-design.md` |

## 完了条件

- [ ] TC-01〜TC-04 のテストケース設計が完了している
- [ ] TC-R01〜TC-R02 の回帰テスト計画が完了している
- [ ] テストコードスケルトンが作成されている
- [ ] TDD Red フェーズの確認手順が明記されている

## タスク100%実行確認【必須】

- [ ] Task 1（新規テストケース設計）を100%実行した
- [ ] Task 2（回帰テスト計画）を100%実行した
- [ ] Task 3（テストコードスケルトン作成）を100%実行した
- [ ] 成果物（test-design.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 5: 実装](./phase-5-implementation.md)
