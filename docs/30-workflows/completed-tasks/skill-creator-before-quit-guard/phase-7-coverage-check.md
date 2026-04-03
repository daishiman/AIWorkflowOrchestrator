# Phase 7: テストカバレッジ確認

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| Phase        | 7                                        |
| タスクID     | TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001 |
| ステータス   | 未実施                                   |
| 担当         | 実装者                                   |
| 見積もり時間 | 0.25h                                    |

## 目的

全テストを実行してカバレッジ目標を達成していることを確認する。未達の場合は Phase 6 に差し戻す。

## カバレッジ目標

| ファイル                                                         | ライン | 分岐 | 関数 |
| ---------------------------------------------------------------- | ------ | ---- | ---- |
| `beforeQuitGuard.ts`                                             | 100%   | 100% | 100% |
| `RuntimeSkillCreatorFacade.ts`（`hasRunningExecution` 関連部分） | 90%+   | 90%+ | 100% |

## 実行タスク

1. `beforeQuitGuard.test.ts` と `RuntimeSkillCreatorFacade.notification.test.ts` を実行する
2. coverage 出力から対象範囲の行・分岐・関数を確認する
3. 目標達成状況を `outputs/phase-7/coverage-report.md` に記録する

## 参照資料

| 参照資料               | パス                                                                                              | 用途             |
| ---------------------- | ------------------------------------------------------------------------------------------------- | ---------------- |
| Phase 6 テスト拡充     | `phase-6-test-expansion.md`                                                                       | 追加テストの確定 |
| beforeQuitGuard テスト | `apps/desktop/src/main/ipc/__tests__/beforeQuitGuard.test.ts`                                     | coverage 対象    |
| Facade テスト          | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts` | coverage 対象    |

## 実行手順

### ステップ 1: 全テスト実行

```bash
pnpm --filter @repo/desktop test --run
```

全テスト（TC-B-01〜TC-B-05, TC-F-04〜TC-F-08）が PASS することを確認する。

### ステップ 2: カバレッジレポート取得

```bash
pnpm --filter @repo/desktop test --coverage --run \
  --reporter=verbose
```

### ステップ 3: カバレッジ結果の記録

`outputs/phase-7/coverage-report.md` に以下の形式で記録する:

```markdown
## カバレッジ結果

| ファイル                     | ライン | 分岐 | 関数 | 目標達成 |
| ---------------------------- | ------ | ---- | ---- | -------- |
| beforeQuitGuard.ts           | XX%    | XX%  | XX%  | ✅/❌    |
| RuntimeSkillCreatorFacade.ts | XX%    | XX%  | XX%  | ✅/❌    |

## テスト結果サマリー

- 合計テスト数: XX
- PASS: XX
- FAIL: 0
```

## 成果物

| 成果物          | パス                                 | 説明                |
| --------------- | ------------------------------------ | ------------------- |
| coverage-report | `outputs/phase-7/coverage-report.md` | coverage 結果の記録 |

## 統合テスト連携

- Phase 6 の追加テストと Phase 11 の手動テスト結果を coverage 判定に接続する
- `beforeQuitGuard.ts` と `RuntimeSkillCreatorFacade.ts` の関連経路は unit coverage で閉じる

## 判定基準

| 結果                               | 次のアクション                    |
| ---------------------------------- | --------------------------------- |
| カバレッジ目標達成 + 全テスト PASS | Phase 8（リファクタリング）に進む |
| カバレッジ未達                     | Phase 6 に差し戻し、テスト追加    |
| テスト FAIL                        | Phase 5 に差し戻し、実装修正      |

## 完了条件

- [ ] 全テスト PASS を確認
- [ ] `beforeQuitGuard.ts` カバレッジ 100%
- [ ] `outputs/phase-7/coverage-report.md` に結果記録

## タスク 100% 実行確認【必須】

- [ ] カバレッジレポートを取得した
- [ ] 目標達成を確認した（または差し戻し判断をした）

## 次 Phase

Phase 7 完了後、Phase 8（リファクタリング）に進む。
