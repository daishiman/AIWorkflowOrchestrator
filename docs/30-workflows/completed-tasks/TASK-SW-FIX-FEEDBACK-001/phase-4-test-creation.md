# Phase 4: テスト作成（current facts evidence matrix）

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 4                        |
| Phase名    | テスト作成               |
| 対象機能   | TASK-SW-FIX-FEEDBACK-001 |
| 前提Phase  | Phase 3: 設計レビュー    |
| 次Phase    | Phase 5: 実装            |
| ステータス | pending                  |
| 作成日     | 2026-04-14               |

## 目的

TC-FEEDBACK-001〜005 を current facts の evidence matrix として定義し、既存テストが AC-1〜AC-5 をどのように担保するかを明文化する。
parity gap が別途確認された場合のみ、これらのケースを Red-first テストへ昇格させる。

## 実行タスク

### Task 1: 既存テスト棚卸し

- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` の有無と既存ケースを把握する
- `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx` の有無と既存ケースを把握する
- `fetchSkills` が `SkillLifecyclePanel` の current flow にあることを確認する
- `CompleteStep` が `skillPath === null` のみを失敗扱いにしていることを確認する

### Task 2: SkillLifecyclePanel の evidence 定義（TC-FEEDBACK-001〜002）

- **TC-FEEDBACK-001: LLMモード成功時に fetchSkills が 1 回呼ばれ、selectSkillByName が続く（AC-1）**
  - `handleExecutePlan` が成功レスポンスを返した場合、`fetchSkills` が 1 回呼ばれることを evidence として記録する
  - `selectSkillByName` が同じ success path で呼ばれることを記録する

- **TC-FEEDBACK-002: terminal_handoff 時は fetchSkills / selectSkillByName が呼ばれない（AC-2）**
  - `terminal_handoff` を受け取った場合、`fetchSkills` / `selectSkillByName` が呼ばれないことを evidence として記録する
  - handoff guidance が維持される current facts を記録する

### Task 3: CompleteStep の evidence 定義（TC-FEEDBACK-004〜006）

- **TC-FEEDBACK-004: skillPath=null の場合エラーメッセージと retry UI が表示される（AC-3）**
  - `skillPath` に `null` を渡した場合、エラーメッセージと retry UI が表示されることを記録する

- **TC-FEEDBACK-005: skillPath=null の場合成功ヘッダーが表示されない（AC-4）**
  - `skillPath` に `null` を渡した場合、「スキルの骨格を生成しました」ヘッダーが表示されないことを記録する

- **TC-FEEDBACK-006: skillPath が正常値の場合成功ヘッダーが表示される（AC-5）**
  - `skillPath` に正常値を渡した場合、成功ヘッダーと完了画面が表示されることを記録する

### Task 4: current facts 確認

- `SkillLifecyclePanel` / `CompleteStep` の current facts が evidence と一致していることを確認する
- issue 8 は follow-up 候補として本 Phase の AC から除外する
- Red-first 化が必要な場合のみ、別タスクとして test 追加を行う

## テストマトリクス

| TC番号          | ファイル内テスト名                                            | 対象関数/コンポーネント | 期待結果                                   |
| --------------- | ------------------------------------------------------------- | ----------------------- | ------------------------------------------ |
| TC-FEEDBACK-001 | LLMモード成功時にfetchSkillsが呼ばれる                        | SkillLifecyclePanel     | fetchSkills / selectSkillByName が呼ばれる |
| TC-FEEDBACK-002 | terminal_handoff では fetchSkills が呼ばれない                | SkillLifecyclePanel     | 早期リターンし handoff が維持される        |
| TC-FEEDBACK-004 | skillPath=null の場合エラーメッセージと retry UI が表示される | CompleteStep            | エラーUI が表示される                      |
| TC-FEEDBACK-005 | skillPath=null の場合成功ヘッダーが表示されない               | CompleteStep            | 成功ヘッダーが非表示                       |
| TC-FEEDBACK-006 | skillPath が正常値の場合成功ヘッダーが表示される              | CompleteStep            | 成功ヘッダーが表示される                   |

## private method テスト方針

- `handleExecutePlan` は内部ハンドラーだが、既存テストの public API 経由で evidence を確認する
- `fetchSkills` / `selectSkillByName` は `SkillLifecyclePanel.llm-generation.test.tsx` の既存モックを参照する
- `CompleteStep` の null guard は component test で直接証跡化する

## テストコマンド

```bash
# CompleteStep テスト実行
pnpm vitest run --reporter=verbose apps/desktop/src/renderer/components/skill/wizard/CompleteStep.test.tsx

# SkillLifecyclePanel テスト実行
pnpm vitest run --reporter=verbose apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
```

## 参照資料

| 資料名               | パス                                                                                               | 説明                             |
| -------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------- |
| 設計レビュー         | `phase-3-design-review.md`                                                                         | gate結果                         |
| 設計成果物           | `outputs/phase-2/design-document.md`                                                               | evidence 観測点                  |
| current facts        | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | current flow                     |
| current facts        | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`                               | current contract                 |
| 既存テスト           | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | LLM / handoff evidence           |
| 既存テスト           | `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx`                | null guard / success UI evidence |
| UIコンポーネント設計 | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                          | Wizard系アーキテクチャ           |
| 状態管理設計         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                       | ストア参照方針                   |

## 統合テスト連携

- Phase 10 の最終レビューで AC-1〜AC-5 との対応表を再利用する
- TC-FEEDBACK-001〜005 は current facts の evidence として扱い、Red-first は follow-up に限定する
- issue 8 の follow-up は別タスクで扱う

## 成果物

| 成果物       | パス                                     | 説明                            |
| ------------ | ---------------------------------------- | ------------------------------- |
| テスト仕様書 | `outputs/phase-4/test-specifications.md` | TC-FEEDBACK-001〜005の evidence |

## 完了条件

- [ ] TC-FEEDBACK-001〜005 の evidence が current facts と一致している
- [ ] SkillLifecyclePanel と CompleteStep の current facts が対応付けられている
- [ ] issue 8 が follow-up 候補として分離されている
- [ ] Red-first が必要な場合の条件が明示されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 5: 実装](./phase-5-implementation.md)
