# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 7                         |
| Phase名    | カバレッジ確認            |
| 対象機能   | TASK-SW-FIX-FEEDBACK-001  |
| 前提Phase  | Phase 6: テスト拡充       |
| 次Phase    | Phase 8: リファクタリング |
| ステータス | pending                   |
| 作成日     | 2026-04-14                |

## 目的

`CompleteStep.tsx` の `skillPath === null` / `skillPath !== null` の両パスと、`SkillLifecyclePanel` の success / terminal_handoff の両パスが current facts としてカバーされていることを確認する。

## 実行タスク

### Task 1: CompleteStep ブランチカバレッジ確認

- `CompleteStep.tsx` のブランチカバレッジを確認する
- 確認対象ブランチ:
  - `skillPath === null` → エラーUI表示パス
  - `skillPath !== null` → 成功ヘッダー・完了画面表示パス
  - `onRetry` が定義されている場合 → retry 呼び出しが安全に動作するパス
  - `onRetry` が未定義の場合 → retry 呼び出しが crash しないパス
- TC-FEEDBACK-004〜006 + Phase 6 の境界ケースで全ブランチがカバーされていることを確認する

### Task 2: SkillLifecyclePanel パスカバレッジ確認

- `SkillLifecyclePanel.tsx` 内の current flow を確認する
- 確認対象パス:
  - 成功パス → loadVerifyDetail → fetchSkills → selectSkillByName → clear state
  - terminal_handoff パス → fetchSkills / selectSkillByName が呼ばれない
  - 失敗パス → generationError が設定される
- TC-FEEDBACK-001〜002 + 既存の handoff テストで上記パスがカバーされていることを確認する

### Task 3: カバレッジ目標判定

| 指標              | 最低基準 | 推奨基準 | 判定 |
| ----------------- | -------- | -------- | ---- |
| Line Coverage     | 80%      | 90%      | -    |
| Branch Coverage   | 60%      | 70%      | -    |
| Function Coverage | 80%      | 90%      | -    |

- 最低基準を満たしていない場合は Phase 6 へ差し戻す
- 最低基準を満たしている場合は推奨基準との差分を記録する

## カバレッジ測定コマンド

```bash
# CompleteStep + SkillLifecyclePanel のカバレッジ測定
pnpm vitest run --coverage --reporter=verbose apps/desktop/src/renderer/components/skill/wizard/CompleteStep.test.tsx apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
```

## 参照資料

| 資料名         | パス                                                                 | 説明                 |
| -------------- | -------------------------------------------------------------------- | -------------------- |
| テスト拡充記録 | `outputs/phase-6/extended-test-record.md`                            | カバレッジ入力       |
| 実装記録       | `outputs/phase-5/implementation-record.md`                           | current facts の根拠 |
| テスト仕様書   | `outputs/phase-4/test-specifications.md`                             | evidence matrix      |
| current facts  | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | カバレッジ対象       |
| current facts  | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx` | カバレッジ対象       |

## 統合テスト連携

- AC-1〜AC-5 に対応するテストが存在し、変更箇所をカバーしていることを確認する
- ブランチカバレッジで `skillPath` null / non-null の両パスがカバーされていることを確認する
- `SkillLifecyclePanel` の success / terminal_handoff の両パスが current facts と一致していることを確認する

## 成果物

| 成果物             | パス                                 | 説明                             |
| ------------------ | ------------------------------------ | -------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | ブランチ・ライン・関数カバレッジ |

## 完了条件

- [ ] CompleteStep.tsx のブランチカバレッジが確認されている
- [ ] SkillLifecyclePanel の success / terminal_handoff パスカバレッジが確認されている
- [ ] Line Coverage 80%以上を満たしている
- [ ] Branch Coverage 60%以上を満たしている
- [ ] Function Coverage 80%以上を満たしている
- [ ] カバレッジ未達の場合、不足箇所が特定・記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 8: リファクタリング](./phase-8-refactoring.md)
