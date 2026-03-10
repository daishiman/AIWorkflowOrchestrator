# Phase 5: 実装

## メタ情報

| 項目      | 値                                  |
| --------- | ----------------------------------- |
| Phase     | 5                                   |
| タスクID  | TASK-10A-G                          |
| 機能名    | task-10a-g-lifecycle-test-hardening |
| 作成日    | 2026-03-10                          |
| 前提Phase | Phase 4 完了                        |
| 次Phase   | Phase 6                             |

## 目的

Phase 4 で定義したテストを実行可能にし、必要最小限の mock 調整・期待値調整・既存コード検証を行って Green に揃える。TASK-10A-G はテスト専用タスクであるため、Phase 5 の主成果物は大規模な production code 変更ではなく、既存実装に対して正しいテスト境界を合わせ込むことである。

## 実行タスク

- G1 の契約テストを実装実体へ合わせて Green にする
- G2 の Store 駆動 lifecycle テストを Green にする
- G3 の ChatPanel 結線テストを Green にする
- targeted regression と typecheck を通して副作用がないことを確認する

### Task 1: G1 の Green 化

**対象ファイル**: `apps/desktop/src/main/ipc/__tests__/skillHandlers.create.test.ts`

#### 実装手順

1. `apps/desktop/src/main/ipc/skillHandlers.ts` の `skill:create` 実装を読み、以下を固定する
   - 引数は `description: unknown`, `options: unknown`
   - sender 検証は `validateIpcSender` と `toIPCValidationError`
   - 成功時の委譲先は `skillService.createSkillFromWizard`
   - catch 時は `CREATE_ERROR` + `sanitizeErrorMessage`
2. mock を実体へ合わせて調整する
   - `createSkillFromWizard`
   - `validateIpcSender`
   - invoke event / senderFrame
3. 期待値を実体へ合わせる
   - validation 失敗は `VALIDATION_ERROR`
   - sender 失敗は `toIPCValidationError`
   - service 失敗は `CREATE_ERROR`
4. 個別実行で Green を確認する

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.create.test.ts
```

### Task 2: G2 の Green 化

**対象ファイル**: `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx`

#### 実装手順

1. 既存 Store 実体を確認する
   - `createSkill(description, options)`
   - `analyzeSkill(skillName)`
   - `applySkillImprovements(skillName, suggestions)`
   - `fetchSkills()`
2. テストを Store 駆動へ寄せる
   - create 成功後の `fetchSkills`
   - create / improve 失敗時の `skillError`
   - analyze 中の `isAnalyzing`
   - improve 中の `isImproving`
   - `currentAnalysis` の設定 / クリア
3. hook / selector の観点を固定する
   - `useCreateSkill`
   - `useAnalyzeSkill`
   - `useApplySkillImprovements`
4. `fireEvent` と Store reset を用いて happy-dom 互換を維持する
5. 個別実行で Green を確認する

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx
```

### Task 3: G3 の Green 化

**対象ファイル**: `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx`

#### 実装手順

1. 既存テストの責務を維持する
   - skill management toggle
   - panel visibility
   - `isExecuting` 中の disable
2. panel open 時の wiring を確認する
   - SkillManagementPanel が表示される
   - message list と排他的に表示される
3. Store / mock の reset を明示して P9 を満たす
4. 個別実行で Green を確認する

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

### Task 4: targeted regression と型確認

```bash
cd apps/desktop && pnpm vitest run \
  src/main/ipc/__tests__/skillHandlers.create.test.ts \
  src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx \
  src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx \
  src/renderer/store/slices/__tests__/agentSlice.skill-lifecycle.test.ts

pnpm --filter @repo/desktop typecheck
```

## 参照資料

| 参照資料               | パス                                                                              | 使用目的                                 |
| ---------------------- | --------------------------------------------------------------------------------- | ---------------------------------------- |
| Phase 4                | `phase-4-test-creation.md`                                                        | テストケース確認                         |
| UI実装記録             | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           | `skill:create` 契約確認                  |
| UI機能別実装記録       | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | lifecycle UI 実体確認                    |
| UIアーキテクチャ       | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`         | ChatPanel 責務境界確認                   |
| UI統合インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`    | ChatPanel 境界確認                       |
| Skill インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | Skill UI 契約確認                        |
| 状態管理設計           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | Store action / selector 確認             |
| テストパターン         | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | isolation / happy-dom 確認               |
| エラー仕様             | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | `VALIDATION_ERROR` / `CREATE_ERROR` 確認 |
| IPC セキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | sender 検証確認                          |
| 教訓                   | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`            | Phase 4-5 統合運用確認                   |

## 成果物

| 成果物          | パス                                                                                       | 説明         |
| --------------- | ------------------------------------------------------------------------------------------ | ------------ |
| G1 テストコード | `apps/desktop/src/main/ipc/__tests__/skillHandlers.create.test.ts`                         | Green 化済み |
| G2 テストコード | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx` | Green 化済み |
| G3 テストコード | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx`  | Green 化済み |

## 既知の落とし穴チェックリスト

- [ ] P9: `beforeEach` / `afterEach` で Store / mock をリセットした
- [ ] P13: タイマー使用時のみ `advanceTimersByTime` を使った
- [ ] P31: hook / selector の責務を個別に検証した
- [ ] P39: `fireEvent` を使用した
- [ ] P40: `cd apps/desktop &&` で実行した
- [ ] P42: `description.trim()` を検証した
- [ ] P48: selector stability を確認した

## 統合テスト連携

### Green 化の優先順序

```text
G1: handler 契約
G2: Store lifecycle
G3: ChatPanel wiring
```

### 多角的チェック観点

| 確認項目     | G1                      | G2               | G3               |
| ------------ | ----------------------- | ---------------- | ---------------- |
| 実装実体整合 | `createSkillFromWizard` | Store action     | ChatPanel toggle |
| 異常系       | `CREATE_ERROR`          | `skillError`     | disable guard    |
| 分離         | sender / service        | Store / hook     | panel / header   |
| 回帰確認     | handler suite           | agentSlice suite | ChatPanel suite  |

## 完了条件

- [ ] G1/G2/G3 が Green
- [ ] targeted regression が PASS
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS
- [ ] テスト専用タスクとして不要な production code 変更を増やしていない

## 次Phase

Phase 6: テスト拡充
