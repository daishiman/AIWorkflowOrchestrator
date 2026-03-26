# Phase 7: カバレッジ確認

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 7 - カバレッジ確認                     |
| Phase名    | カバレッジ確認                         |
| 機能名     | health-policy-unification              |
| タスクID   | TASK-IMP-HEALTH-POLICY-UNIFICATION-001 |
| 作成日     | 2026-03-24                             |
| 前提Phase  | Phase 6                                |
| 後続Phase  | Phase 8                                |
| ステータス | 未実施                                 |

## 目的

Phase 4-6 で作成したテストのカバレッジを計測し、プロジェクトの最低基準（Line >= 80%, Branch >= 60%, Function >= 80%）を満たしていることを確認する。未達の場合は Phase 6 に戻りテストを追加する。

## 背景

Phase 4-6 で作成したテストのカバレッジを計測し、プロジェクト最低基準を満たしているか確認する。v8 カバレッジプロバイダのインライン関数カウント（P41）に注意が必要。未達の場合は Phase 6 に戻りテストを追加する。

## 前提成果物

| Phase | 成果物                                                         |
| ----- | -------------------------------------------------------------- |
| 6     | [phase-6-test-augmentation.md](./phase-6-test-augmentation.md) |

## 参照資料

| 資料名              | パス / 参照先                                                       |
| ------------------- | ------------------------------------------------------------------- |
| カバレッジ基準      | `CLAUDE.md` + プロジェクト品質基準（カバレッジ基準）                |
| v8 カバレッジの注意 | `.claude/rules-disabled/06-known-pitfalls.md#P41`（インライン関数） |

## 実行タスク

### Task 1: カバレッジ計測

#### 1-1. health-policy.ts のカバレッジ計測

```bash
cd packages/shared && pnpm vitest run --coverage src/types/__tests__/health-policy.test.ts
```

#### 1-2. RuntimePolicyResolver.ts のカバレッジ計測

```bash
cd apps/desktop && pnpm vitest run --coverage src/main/services/runtime/__tests__/RuntimePolicyResolver.health-policy.test.ts
```

#### 1-3. mainlineAccess.ts のカバレッジ計測

```bash
cd apps/desktop && pnpm vitest run --coverage src/renderer/features/mainline-access/__tests__/mainlineAccess.health-policy.test.ts
```

### Task 2: カバレッジ基準の充足確認

#### 対象ファイルと基準

| ファイル                   | Line (最低) | Line (推奨) | Branch (最低) | Branch (推奨) | Function (最低) | Function (推奨) |
| -------------------------- | ----------- | ----------- | ------------- | ------------- | --------------- | --------------- |
| `health-policy.ts`         | 80%         | 90%         | 60%           | 70%           | 80%             | 90%             |
| `RuntimePolicyResolver.ts` | 80%         | 90%         | 60%           | 70%           | 80%             | 90%             |
| `mainlineAccess.ts`        | 80%         | 90%         | 60%           | 70%           | 80%             | 90%             |

#### 判定基準

- 全ファイルが最低基準を満たす → Phase 8 へ進む
- いずれかのファイルが最低基準を満たさない → Phase 6 へ戻る

### Task 3: カバレッジレポート記録

計測結果を以下の形式で記録する。

```
## カバレッジ結果

### health-policy.ts
- Line:     __% (基準: 80%)  [PASS/FAIL]
- Branch:   __% (基準: 60%)  [PASS/FAIL]
- Function: __% (基準: 80%)  [PASS/FAIL]

### RuntimePolicyResolver.ts（HealthPolicy 関連部分）
- Line:     __% (基準: 80%)  [PASS/FAIL]
- Branch:   __% (基準: 60%)  [PASS/FAIL]
- Function: __% (基準: 80%)  [PASS/FAIL]

### mainlineAccess.ts（HealthPolicy 関連部分）
- Line:     __% (基準: 80%)  [PASS/FAIL]
- Branch:   __% (基準: 60%)  [PASS/FAIL]
- Function: __% (基準: 80%)  [PASS/FAIL]
```

### Task 4: 未達時の対応

カバレッジが未達の場合、以下の手順で Phase 6 に戻る。

1. 未達ファイル・未達指標を特定する
2. カバレッジレポートの uncovered lines/branches を確認する
3. 不足しているテストケースをリストアップする
4. Phase 6 に戻り、テストを追加する
5. 再度 Phase 7 を実行する

#### P41 注意事項

v8 カバレッジプロバイダは、インライン arrow function を独立した関数としてカウントする。`resolveHealthPolicy()` 内で使用するインライン関数がある場合、テストで明示的に実行パスを通す必要がある。

## 成果物

| 成果物             | パス                        |
| ------------------ | --------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage/` |

## 統合テスト連携

本 Phase の成果物が他 Phase や他タスクのテストに影響する場合の確認事項:

| 確認項目                                  | 確認方法                                                                     | 判定基準      |
| ----------------------------------------- | ---------------------------------------------------------------------------- | ------------- |
| 既存テスト（apiKeyDegraded 関連）への影響 | `pnpm --filter @repo/shared vitest run`                                      | 全テスト PASS |
| Task A（UiState）との型整合               | TASK-IMP-UISTATE-CONTRACT-EXTENSION-001 の CapabilityContext.isDegraded 消費 | 型定義が一致  |
| RuntimePolicyResolver 既存テスト          | `pnpm --filter @repo/desktop vitest run RuntimePolicyResolver`               | 全テスト PASS |

## サブタスク管理

Phase 実行時に TaskCreate / TaskUpdate で進捗を管理する。

- [ ] Phase 開始時: TaskUpdate で status を `in_progress` に更新
- [ ] 各 Task 完了時: TaskUpdate で該当サブタスクを `completed` に更新
- [ ] Phase 完了時: 全サブタスクが `completed` であることを確認

## Phase末端アクション【必須】

Phase 完了前に以下を確認する:

- [ ] 実行タスクの全項目が実施されている
- [ ] 成果物テーブルの全成果物が作成されている
- [ ] 完了条件の全チェックボックスがチェックされている
- [ ] 次 Phase への引き継ぎ事項が明確である

## 完了条件

- [ ] `health-policy.ts` の Line Coverage >= 80%
- [ ] `health-policy.ts` の Branch Coverage >= 60%
- [ ] `health-policy.ts` の Function Coverage >= 80%
- [ ] `RuntimePolicyResolver.ts` の Line Coverage >= 80%（HealthPolicy 関連部分）
- [ ] `RuntimePolicyResolver.ts` の Branch Coverage >= 60%（HealthPolicy 関連部分）
- [ ] `RuntimePolicyResolver.ts` の Function Coverage >= 80%（HealthPolicy 関連部分）
- [ ] `mainlineAccess.ts` の Line Coverage >= 80%（HealthPolicy 関連部分）
- [ ] `mainlineAccess.ts` の Branch Coverage >= 60%（HealthPolicy 関連部分）
- [ ] `mainlineAccess.ts` の Function Coverage >= 80%（HealthPolicy 関連部分）
- [ ] カバレッジ計測結果がレポートとして記録されている
- [ ] 未達の場合は Phase 6 へ戻り、再テスト後に再確認済み

## 依存関係

- **前提**: Phase 6 が完了していること
- **後続**: Phase 8 へ進む

## 次 Phase

[Phase 8: リファクタリング](./phase-8-refactoring.md)

### 未達時の戻り先

[Phase 6: テスト拡充](./phase-6-test-augmentation.md)
