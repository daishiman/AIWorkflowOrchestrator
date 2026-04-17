# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 4                           |
| Phase名    | テスト作成                  |
| 対象機能   | TASK-SW-STRUCT-002          |
| 前提Phase  | Phase 3: 設計レビューゲート |
| 次Phase    | Phase 5: 実装               |
| ステータス | 未実施                      |
| 作成日     | 2026-04-16                  |

## 目的

TDD の Red フェーズとして、`generateSkillMd` の実装前に失敗するテストケースを設計する。
AC-1〜AC-5 を網羅するテストケース一覧と、collaborative / orchestrate モードの回帰確認計画を策定する。

## 実行タスク

### Task 1: 新規テストケース設計（AC-1〜AC-5）

テスト対象: `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`

- AC-1: `void structurePlan;` が削除されていることを間接的に確認（`generateSkillMd` が呼ばれる）
- AC-2: create モードで `generate_skill_md.js` が `structurePlan` の内容を含む plan で呼ばれることをアサート
- AC-3: `structurePlan` が null の場合に `ensureSkillMdExists` へフォールバックすることをアサート
- AC-4: collaborative / orchestrate モードのテストが全てパスすることを確認
- AC-5: create モードで生成された SKILL.md に `purpose` / `skillName` が反映されることをアサート

### Task 2: 回帰テスト計画（AC-4）

- 既存の `collaborative` モードテストケースが全てパスすることを確認
- 既存の `orchestrate` モードテストケースが全てパスすることを確認
- `generateSkillMd` は create モード専用であり、他モードへの影響がないことを確認

### Task 3: テストコードスケルトン作成

```typescript
// TC-01: generateSkillMd が呼ばれることの確認
it("create モードで structurePlan が非 null の場合 generateSkillMd が呼ばれる", async () => {
  // generateSkillMd の呼び出しを spy で確認
  // scriptExecutor.execute が "generate_skill_md.js" で呼ばれることを確認
});

// TC-02: structurePlan の内容が plan オブジェクトに反映されることの確認
it("create モードで generateSkillMd が structurePlan.purpose を triggerDescription に変換する", async () => {
  // plan.workflow.trigger.description に purpose が含まれることを確認
});

// TC-03: structurePlan null 時のフォールバック確認
it("create モードで structurePlan が null の場合 ensureSkillMdExists にフォールバックする", async () => {
  // generateSkillMd が呼ばれず、ensureSkillMdExists が呼ばれることを確認
});

// TC-04: generate_skill_md.js 失敗時のフォールバック確認
it("generate_skill_md.js が失敗した場合 ensureSkillMdExists にフォールバックする", async () => {
  // scriptExecutor.execute が失敗を返した場合でも createSkill() が成功することを確認
});

// TC-05: SKILL.md 未生成時のフォールバック確認
it("generate_skill_md.js が成功してもSKILL.mdが存在しない場合 ensureSkillMdExists にフォールバックする", async () => {
  // fs.access が失敗する場合でも createSkill() が成功することを確認
});
```

## テストケース一覧

### 新規テストケース（TC-01〜TC-05）

| TC ID | 対応AC | テストタイトル                                                                                 | 期待結果                                                         |
| ----- | ------ | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| TC-01 | AC-1,2 | create モードで structurePlan が非 null の場合 generateSkillMd が呼ばれる                      | `scriptExecutor.execute("generate_skill_md.js", ...)` が呼ばれる |
| TC-02 | AC-2,5 | generateSkillMd が structurePlan.purpose を triggerDescription に変換する                      | `trigger.description` に purpose が含まれる                      |
| TC-03 | AC-3   | create モードで structurePlan が null の場合 ensureSkillMdExists にフォールバックする          | `createSkill()` が成功し SKILL.md が生成される                   |
| TC-04 | AC-3   | generate_skill_md.js が失敗した場合 ensureSkillMdExists にフォールバックする                   | `createSkill()` が例外をスローしない                             |
| TC-05 | AC-3   | generate_skill_md.js が成功してもSKILL.mdが存在しない場合 ensureSkillMdExists へフォールバック | `createSkill()` が例外をスローしない                             |

### 回帰テストケース（TC-R01〜TC-R03）

| TC ID  | 対応AC | テストタイトル                                                     | 期待結果       |
| ------ | ------ | ------------------------------------------------------------------ | -------------- |
| TC-R01 | AC-4   | collaborative モード: 有効な interviewResult でスキルが作成される  | 既存動作と同一 |
| TC-R02 | AC-4   | collaborative モード: runCollaborativeWorkflow が loadAgent を呼ぶ | 既存動作と同一 |
| TC-R03 | AC-4   | orchestrate モード: runOrchestrateWorkflow が正常に動作する        | 既存動作と同一 |

## TDD 確認コマンド

```bash
# Red フェーズ（実装前に TC-01〜TC-05 が失敗することを確認）
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService" --grep "generateSkillMd"

# 回帰確認（TC-R01〜TC-R03 が Green であることを確認）
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService" --grep "collaborative|orchestrate"
```

## 参照資料

- `outputs/phase-2/TASK-SW-STRUCT-002-design.md` — 設計書（テスト観測点）
- `outputs/phase-1/TASK-SW-STRUCT-002-requirements.md` — 受入条件（AC-1〜AC-5）

## 統合テスト連携

- 本タスクはユニットテストのみを対象とする
- `createSkill()` の IPC 契約は変更しないため統合テストの変更は不要

## 成果物

| 成果物                            | パス                                                |
| --------------------------------- | --------------------------------------------------- |
| TASK-SW-STRUCT-002-test-design.md | `outputs/phase-4/TASK-SW-STRUCT-002-test-design.md` |

## 完了条件

- [ ] TC-01〜TC-05 のテストケース設計が完了している
- [ ] TC-R01〜TC-R03 の回帰テスト計画が完了している
- [ ] テストコードスケルトンが作成されている
- [ ] TDD Red フェーズの確認手順が明記されている

## タスク100%実行確認【必須】

- [ ] Task 1（新規テストケース設計）を100%実行した
- [ ] Task 2（回帰テスト計画）を100%実行した
- [ ] Task 3（テストコードスケルトン作成）を100%実行した
- [ ] 成果物（TASK-SW-STRUCT-002-test-design.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 5: 実装](./phase-5-implementation.md)
