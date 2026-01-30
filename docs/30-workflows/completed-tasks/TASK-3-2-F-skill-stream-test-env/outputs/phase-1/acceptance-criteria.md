# 受け入れ基準定義書 - TASK-3-2-F Phase 1

## 受け入れ基準

| AC   | 基準                          | 検証コマンド                                                                                                     | 期待結果                                              |
| ---- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| AC-1 | 全テストがPASS                | `pnpm --filter @repo/desktop vitest run`                                                                         | 全テストPASS、FAILゼロ                                |
| AC-2 | `describe.skip`が0件          | `grep -r "describe.skip" apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay*`           | 出力0行                                               |
| AC-3 | Clipboard APIテストが正常PASS | `pnpm --filter @repo/desktop vitest run src/renderer/components/AgentView/__tests__/SkillStreamDisplay.test.tsx` | Clipboard Copy関連17テスト全PASS                      |
| AC-4 | `act()`警告がゼロ             | `pnpm --filter @repo/desktop vitest run 2>&1 \| grep -c "act()"`                                                 | 出力が0                                               |
| AC-5 | カバレッジ目標維持            | `pnpm --filter @repo/desktop vitest run --coverage`                                                              | Line 80%+, Branch 60%+, Function 80%+, Statement 80%+ |
| AC-6 | テスト実行時間+20%以内        | テスト実行時間を変更前後で比較                                                                                   | 変更後の実行時間がベースライン比+20%以内              |

## スコープ

### 含む

- テスト環境設定変更（happy-dom → jsdom）
- Clipboard APIモック改善
- `describe.skip`解消（5ブロック / 43テスト）
- `act()`警告解消
- 既存テストの互換性維持

### 含まない

- 新規テストケースの追加
- テスト対象コンポーネント（SkillStreamDisplay）の機能変更
- Playwright/Cypress等のE2Eテスト導入
- 他コンポーネントのテスト環境変更

## 対象ファイル

| ファイル                                                                                                | 変更内容                                          |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `apps/desktop/vitest.config.ts`                                                                         | テスト環境設定変更（happy-dom → jsdom）           |
| `apps/desktop/src/test/setup.ts`                                                                        | テストセットアップ更新（Clipboard APIモック追加） |
| `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.test.tsx`                  | describe.skip解消（3箇所）                        |
| `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.i18n.test.tsx`             | describe.skip解消（1箇所）                        |
| `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.i18n.integration.test.tsx` | describe.skip解消（1箇所）                        |

## 現状ベースライン

- **スキップブロック数**: 5
- **スキップテスト数**: 43
- **テスト環境**: happy-dom v20.0.11
- **jsdom**: v27.4.0（既にdependenciesに存在）
- **テスト実行時間**: Phase 2で計測予定
