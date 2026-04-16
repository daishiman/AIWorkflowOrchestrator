# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 4                        |
| Phase名    | テスト作成               |
| 対象機能   | TASK-SW-FIX-FEEDBACK-008 |
| 前提Phase  | Phase 3: 設計レビュー    |
| 次Phase    | Phase 5: 実装            |
| ステータス | completed                |
| 作成日     | 2026-04-15               |

## 目的

`fetchSkills()` 非ブロッキング化のテストシナリオを定義する。

`SkillLifecyclePanel.tsx` の `processWorkflowOutcome` および `handleExecutePlan` において、
`fetchSkills()` が失敗した場合でも `selectSkillByName` が実行されることを検証するテストケースを先に定義し、
AC-1〜AC-5の検証可能性を確保する。

## 実行タスク

### Task 1: AC-1/AC-2対応テスト（fetchSkills throw時にselectSkillByNameが呼ばれる）

- `processWorkflowOutcome` 内で `fetchSkills` が throw した場合に `selectSkillByName` が呼ばれることを検証するテストケースを定義する
- `handleExecutePlan` 内で `fetchSkills` が throw した場合に `selectSkillByName` が呼ばれることを検証するテストケースを定義する
- `executeResult.skillName` が存在する条件下で確認するケースを含める

### Task 2: AC-3対応テスト（console.warn記録・generationError非設定）

- `fetchSkills` 失敗時に `console.warn` が呼ばれることを検証するテストケースを定義する
- `fetchSkills` 失敗時に `generationError` が設定されないことをassertするケースを含める
- `.catch()` パターンにより失敗がサイレントに処理されることを確認する

### Task 3: AC-4対応テスト（回帰テスト U-8/U-13）

- `fetchSkills` 成功時に `selectSkillByName` が通常通り呼ばれることを確認する回帰テストを定義する
- 既存テスト U-8（正常生成フロー）が引き続き PASS することを確認する
- 既存テスト U-13（スキル名選択フロー）が引き続き PASS することを確認する

## テストケース一覧（TC-F8-01〜TC-F8-05）

| テストID | 対象AC | 対象関数                                   | 入力条件                                  | 期待結果                                                  | 備考                     |
| -------- | ------ | ------------------------------------------ | ----------------------------------------- | --------------------------------------------------------- | ------------------------ |
| TC-F8-01 | AC-1   | processWorkflowOutcome                     | `fetchSkills` が throw / `skillName` あり | `selectSkillByName` が呼ばれる                            | `.catch()` パターン確認  |
| TC-F8-02 | AC-2   | handleExecutePlan                          | `fetchSkills` が throw / `skillName` あり | `selectSkillByName` が呼ばれる                            | `.catch()` パターン確認  |
| TC-F8-03 | AC-1,2 | processWorkflowOutcome / handleExecutePlan | `fetchSkills` 成功 / `skillName` あり     | `selectSkillByName` が通常通り呼ばれる                    | 正常系回帰               |
| TC-F8-04 | AC-3   | processWorkflowOutcome                     | `fetchSkills` が throw                    | `console.warn` が呼ばれ、`generationError` が設定されない | エラーハンドリング観点   |
| TC-F8-05 | AC-4   | U-8/U-13（既存テスト）                     | 既存テスト条件を維持                      | 両テストが PASS（回帰なし）                               | 変更による破壊がないこと |

---

## 参照資料

| 資料名                 | パス                                                                                               | 説明                   |
| ---------------------- | -------------------------------------------------------------------------------------------------- | ---------------------- |
| 修正対象コンポーネント | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | L769-784 / L1110-1113  |
| テストファイル         | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | テスト追加対象         |
| 親タスク仕様書         | `docs/30-workflows/TASK-SW-FIX-FEEDBACK-001/`                                                      | 参照元バグ修正シリーズ |
| 実装PR                 | #2179                                                                                              | マージ済み             |

## 実行手順

```bash
# テスト実行
pnpm --filter @repo/desktop test

# 特定テストファイルのみ実行
pnpm --filter @repo/desktop test SkillLifecyclePanel.llm-generation
```

## 統合テスト連携

- Phase 5の実装後に TC-F8-01〜TC-F8-04 が PASS に反転することを確認する
- TC-F8-05（既存テスト U-8/U-13）は Phase 5実装前後で PASS を維持することを確認する
- Phase 6のテスト拡充でエッジケース（null skillName等）を追加する

## 多角的チェック観点（AIが判断）

- `.catch()` パターンが `try-catch + return` パターンと等価な動作（失敗をサイレント処理）を持つことの確認
- `selectSkillByName` のコールカウントが条件分岐によって変化しないことの確認
- `generationError` の state 変化がないことのスナップショット確認

## サブタスク管理

| サブタスクID | 内容                                      | ステータス |
| ------------ | ----------------------------------------- | ---------- |
| ST-F8-4-01   | TC-F8-01 テストケース定義                 | completed  |
| ST-F8-4-02   | TC-F8-02 テストケース定義                 | completed  |
| ST-F8-4-03   | TC-F8-03 テストケース定義（正常系回帰）   | completed  |
| ST-F8-4-04   | TC-F8-04 テストケース定義（console.warn） | completed  |
| ST-F8-4-05   | TC-F8-05 既存テスト U-8/U-13 回帰確認     | completed  |

## 成果物

| 成果物         | パス                                                                                               | 説明                  |
| -------------- | -------------------------------------------------------------------------------------------------- | --------------------- |
| テスト仕様書   | `docs/30-workflows/TASK-SW-FIX-FEEDBACK-008/phase-4-test-creation.md`                              | 本ファイル            |
| テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | TC-F8-01〜05 追加済み |

## 完了条件

- [x] AC-1〜AC-5のすべてに対応するテストケースが定義されている
- [x] fetchSkills throw時にselectSkillByNameが呼ばれることを検証するテストケース（TC-F8-01/02）が定義されている
- [x] fetchSkills成功時の正常系回帰テスト（TC-F8-03）が含まれている
- [x] console.warn記録・generationError非設定の検証テスト（TC-F8-04）が定義されている
- [x] 既存テスト U-8/U-13 の回帰確認テスト（TC-F8-05）が含まれている
- [x] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 5: 実装](./phase-5-implementation.md)
