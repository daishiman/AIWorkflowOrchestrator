# Phase 7: カバレッジ確認

## メタ情報

| 項目         | 内容                         |
| ------------ | ---------------------------- |
| Phase        | 7                            |
| タスクID     | TASK-FIX-EXECUTE-PLAN-FF-001 |
| ステータス   | 未実施                       |
| 担当         | 実装者                       |
| 見積もり時間 | 1h                           |

## 目的

修正した 4 ファイルのテストカバレッジを計測し、Phase 5 の目標値を満たしているか確認する。未達の場合は Phase 6 に戻りテストを追加する。

## 実行タスク

1. 4 ファイルのカバレッジを計測する
2. カバレッジ目標との差分を確認する
3. 未達ブランチを特定する
4. 未達の場合は Phase 6 に戻りテストを追加する
5. 全要件（AC-1〜AC-6）のトレーサビリティを確認する

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容                      |
| ------------------ | ---------------------------------------------------------------------------- | ------------------------- |
| セキュリティ仕様   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | Electron IPC セキュリティ |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | システム全体像            |

## 実行手順

### ステップ 1: カバレッジ計測

```bash
# 対象ファイルのカバレッジ計測
pnpm --filter @repo/desktop exec vitest run --coverage \
  src/preload/__tests__/ipc-utils.execute-plan-timeout.test.ts \
  src/main/ipc/__tests__/creatorHandlers.fire-and-forget.test.ts \
  src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.phase-events.test.ts \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts

# 全体カバレッジ（参考）
pnpm --filter @repo/desktop exec vitest run --coverage
```

### ステップ 2: カバレッジ目標の確認

| 対象ファイル                                      | 行カバレッジ目標 | ブランチカバレッジ目標 | 確認結果 |
| ------------------------------------------------- | ---------------- | ---------------------- | -------- |
| `ipc-utils.ts`（execute-plan 部分）               | 100%             | 100%                   | 確認対象 |
| `creatorHandlers.ts`（execute ハンドラー）        | 90% 以上         | 85% 以上               | 確認対象 |
| `SkillCreatorWorkflowEngine.ts`（onPhaseChanged） | 90% 以上         | 85% 以上               | 確認対象 |
| `RuntimeSkillCreatorFacade.ts`（executeAsync）    | 90% 以上         | 85% 以上               | 確認対象 |

### ステップ 3: ブランチカバレッジの確認観点

| ブランチ                                              | 対応テスト | カバレッジ状態 |
| ----------------------------------------------------- | ---------- | -------------- |
| `CHANNEL_TIMEOUTS['skill-creator:execute-plan']` 存在 | TC-T1-01   | 確認対象       |
| `executeAsync` 正常パス                               | TC-T2-02   | 確認対象       |
| `executeAsync` エラーパス                             | TC-T4-01   | 確認対象       |
| `onPhaseChanged` が定義されている場合                 | TC-T3-02   | 確認対象       |
| `onPhaseChanged` が undefined の場合                  | TC-T3-01   | 確認対象       |
| fire-and-forget 即時 return                           | TC-T2-01   | 確認対象       |

### ステップ 4: トレーサビリティ確認

| AC                                        | 対応テストケース     | カバレッジ状態 |
| ----------------------------------------- | -------------------- | -------------- |
| AC-1（100ms 以内返却）                    | TC-T2-01, TC-T2-07   | 確認対象       |
| AC-2（executeAsync が query() 呼び出し）  | TC-T2-02, TC-T4-01   | 確認対象       |
| AC-3（フェーズ遷移で STATE_CHANGED 発火） | TC-T3-02, TC-T4-01   | 確認対象       |
| AC-4（CHANNEL_TIMEOUTS 登録）             | TC-T1-01, TC-T1-02   | 確認対象       |
| AC-5（breaking change なし）              | Phase 9 の既存テスト | 確認対象       |
| AC-6（onPhaseChanged が型安全）           | TC-T3-04             | 確認対象       |

### ステップ 5: 未達時の対応

カバレッジが目標未達の場合:

1. 未カバーブランチを `coverage-report.md` に記録する
2. Phase 6 に戻り、対象ブランチをカバーするテストを追加する
3. 再度カバレッジを計測する

## 多角的チェック観点

- `ipc-utils.ts` の `CHANNEL_TIMEOUTS` 部分のみに着目し、他の部分の低カバレッジが目標達成を妨げていないか確認したか
- ブランチカバレッジの「未達ブランチ」を特定する際に、実装上のデッドコードが含まれていないか確認したか
- AC-5（breaking change なし）を Phase 9 の既存テスト実行で代替できるか確認したか

## 成果物

| 成果物             | パス                                 | 説明                                                         |
| ------------------ | ------------------------------------ | ------------------------------------------------------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 各ファイルのカバレッジ数値、未達ブランチ、トレーサビリティ表 |

## 完了条件

- [ ] 4 ファイルのカバレッジが計測されている
- [ ] `ipc-utils.ts` の execute-plan 部分が 100% カバレッジ
- [ ] `creatorHandlers.ts` の execute ハンドラーが 90% 以上の行カバレッジ
- [ ] `SkillCreatorWorkflowEngine.ts` の onPhaseChanged 部分が 90% 以上の行カバレッジ
- [ ] `RuntimeSkillCreatorFacade.ts` の executeAsync 部分が 90% 以上の行カバレッジ
- [ ] AC-1〜AC-6 の全てがいずれかのテストケースでカバーされている
- [ ] カバレッジ未達の場合は Phase 6 に戻ってテストを追加している

## タスク100%実行確認【必須】

- [ ] 全実行タスクが完了している
- [ ] 全成果物が存在する（`outputs/phase-7/coverage-report.md`）
- [ ] 全完了条件が満たされている

## 次Phase

Phase 8: リファクタリング へ進む
