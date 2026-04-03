# Phase 7: カバレッジ確認 -- Skill Output Integration

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase番号  | 7                        |
| 機能名     | skill-output-integration |
| タスクID   | TASK-SDK-SC-04           |
| 作成日     | 2026-04-02               |
| 依存 Phase | Phase 6（テスト拡充）    |

## 目的

`SkillCreatorOutputHandler` のテストカバレッジが目標値（≥85%）を達成していることを確認する。ファイル I/O を含む実装であるため、通常より高いカバレッジ目標を設定する。

## カバレッジ目標

| 対象ファイル                   | ライン | ブランチ | 関数 | 備考                            |
| ------------------------------ | ------ | -------- | ---- | ------------------------------- |
| `SkillCreatorOutputHandler.ts` | ≥85%   | ≥85%     | 100% | ファイル I/O を含むため高目標   |
| `SkillCreatorResultPanel.tsx`  | ≥80%   | ≥75%     | 100% | UI コンポーネント               |
| `SkillRegistry.ts`（追加部分） | ≥90%   | ≥85%     | 100% | `registerFromPath()` のみが対象 |

## 実行タスク

### Task 7-1: カバレッジ計測コマンド

```bash
# desktop パッケージのカバレッジ計測
pnpm --filter @repo/desktop vitest run \
  --coverage \
  --coverage.include="src/main/services/runtime/SkillCreatorOutputHandler.ts" \
  --coverage.include="src/renderer/components/skill-creator/SkillCreatorResultPanel.tsx" \
  --reporter=verbose

# shared パッケージのカバレッジ計測（型定義・channels）
pnpm --filter @repo/shared vitest run \
  --coverage \
  --coverage.include="src/ipc/channels.ts" \
  --coverage.include="src/types/skillCreator.ts" \
  --reporter=verbose
```

### Task 7-2: カバレッジ不足時の対応方針

| 不足箇所                                                | 対応方法                                                                      |
| ------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `extractSkillFromOutput` の境界条件                     | T-07 のエッジケーステストで補完（Phase 6 で追加済み）                         |
| `saveSkill` の正常系のみカバー                          | T-08 のエラーケース（mkdir 失敗・writeFile 失敗）で補完（Phase 6 で追加済み） |
| `handleSessionComplete` の上書き確認分岐                | T-04 と T-09 で補完（Phase 4/6 で追加済み）                                   |
| `registerToRegistry` のエラーハンドリング               | T-09a で補完（Phase 6 で追加済み）                                            |
| `SkillCreatorResultPanel` の `requiresOverwriteConfirm` | 追加テストで `requiresOverwriteConfirm: true` のケースを明示的にテストする    |

### Task 7-3: カバレッジ確認チェックリスト

| 確認項目                                                  | 目標値 | 実測値 | 判定 |
| --------------------------------------------------------- | ------ | ------ | ---- |
| `SkillCreatorOutputHandler.ts` ライン カバレッジ          | ≥85%   | -      | -    |
| `SkillCreatorOutputHandler.ts` ブランチ カバレッジ        | ≥85%   | -      | -    |
| `SkillCreatorOutputHandler.ts` 関数 カバレッジ            | 100%   | -      | -    |
| `SkillCreatorResultPanel.tsx` ライン カバレッジ           | ≥80%   | -      | -    |
| `SkillCreatorResultPanel.tsx` 関数 カバレッジ             | 100%   | -      | -    |
| `SkillRegistry.ts` `registerFromPath()` ライン カバレッジ | ≥90%   | -      | -    |

### Task 7-4: カバレッジが目標未達の場合

1. カバレッジレポートで未カバーの行・ブランチを特定する
2. 未カバー箇所に対応するテストケースを Phase 6 テストファイルに追加する
3. 追加後に再度カバレッジを計測し、目標値を達成していることを確認する

## 参照資料

| 資料名             | パス                                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Phase 5 実装       | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-03-seq-task-04-skill-output-integration/phase-5-implementation.md` |
| Phase 6 テスト拡充 | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-03-seq-task-04-skill-output-integration/phase-6-test-expansion.md` |

## 成果物

| 成果物                         | パス                                                                                                                                                         | 形式     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| カバレッジ確認書（本ファイル） | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-03-seq-task-04-skill-output-integration/phase-7-coverage.md` | Markdown |

## 完了条件

- [ ] `SkillCreatorOutputHandler.ts` のカバレッジが ライン ≥85% / ブランチ ≥85% / 関数 100% を達成した
- [ ] `SkillCreatorResultPanel.tsx` のカバレッジが ライン ≥80% / 関数 100% を達成した
- [ ] `SkillRegistry.ts` 追加部分のカバレッジが ライン ≥90% / 関数 100% を達成した
- [ ] カバレッジ未達箇所があった場合は追加テストで補完した

## 次の Phase: Phase 8 (phase-8-refactoring.md)
