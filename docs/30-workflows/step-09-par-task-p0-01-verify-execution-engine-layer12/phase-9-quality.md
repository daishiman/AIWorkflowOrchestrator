# Phase 9: 品質保証

## メタ情報

| 項目       | 値                                                                           |
| ---------- | ---------------------------------------------------------------------------- |
| Phase番号  | 9                                                                            |
| Phase名    | 品質保証                                                                     |
| 対象タスク | TASK-P0-01: verify 実行エンジン（Layer 1/2 コア + Layer 3/4 互換）の仕様整合 |
| 関連Issue  | #1886                                                                        |
| タスク種別 | バックエンド Main Process 実装（UI変更なし、IPC変更なし）                    |
| 実施者     | Claude Code                                                                  |

## 目的

定義された品質基準をすべて満たすことを検証する。  
本Phaseでは機能検証・型チェック・Lint・テストカバレッジ・IPC契約ドリフト検証の5つの品質ゲートを通過させる。current facts では Layer 3/4 互換も存在するため、core テストだけでなく既存互換の退行も見逃さない。

## 実行タスク

### Task 9-1: 機能検証（テスト全成功）

```bash
pnpm --filter @repo/desktop test
```

- `SkillCreatorVerificationEngine` の全ユニットテストが PASS すること
- テストファイル: `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts`
- 期待結果: 全テストケース成功、失敗 0 件

### Task 9-2: 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

- エラー 0 件であること
- 警告が出た場合はその内容を `outputs/phase-9/quality-report.md` に記録する

### Task 9-3: Lint チェック

```bash
pnpm lint
```

- エラー 0 件であること
- 警告が出た場合はその内容を `outputs/phase-9/quality-report.md` に記録する

### Task 9-4: `any` 型不使用の確認

以下のファイルに `any` 型が使用されていないことを確認する。

- `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`
- `packages/shared/src/types/skillCreator.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（変更箇所のみ）

確認コマンド（参考）:

```bash
grep -rn ": any" apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts \
  packages/shared/src/types/skillCreator.ts \
  packages/shared/src/types/index.ts
```

結果: `any` 型が検出された場合は即時修正してから再度 Task 9-2/9-3 を実施する。

### Task 9-5: テストカバレッジ基準達成確認

- `SkillCreatorVerificationEngine` のブランチカバレッジ ≥ 80%
- Layer 1 チェック・Layer 2 チェックそれぞれの正常系・異常系テストが存在すること
- Layer 3/4 の current facts 互換が崩れていないこと
- 確認コマンド:

```bash
pnpm --filter @repo/desktop test --coverage
```

### Task 9-6: IPC 契約ドリフト検証

```bash
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only
```

- exit code が 0 であること（IPC 契約の変更が本タスクに含まれていないことの確認）
- 本タスクは IPC 変更なしのため、ドリフトが検出された場合はスコープ外変更の疑いがある
- 結果を `outputs/phase-9/quality-report.md` に記録する

## 参照資料

- `phase-5-implementation.md`（実装フェーズの current facts）
- `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`（実装対象）
- `packages/shared/src/types/skillCreator.ts`（型定義）
- `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts`（テスト）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（Facade統合）

## 統合テスト連携

- 本Phaseのテスト対象はユニットテストのみ（統合テストは別Phase）
- IPC 変更なしのため、IPC 結合テストは非対象

## 成果物

| 成果物       | パス                                | 必須 |
| ------------ | ----------------------------------- | ---- |
| 品質レポート | `outputs/phase-9/quality-report.md` | 必須 |

### `quality-report.md` 記載項目

- 実行日時
- テスト実行結果（成功件数 / 失敗件数）
- 型チェック結果
- Lint 結果
- `any` 型検出結果
- テストカバレッジ数値
- IPC 契約ドリフト検証結果（exit code）
- 総合判定: PASS / FAIL

## 完了条件

- [ ] 本 Phase 内の全タスク（Task 9-1 〜 9-6）を 100% 実行完了
- [ ] `pnpm --filter @repo/desktop test` 全成功
- [ ] `pnpm --filter @repo/desktop typecheck` エラーなし
- [ ] `pnpm lint` エラーなし
- [ ] 実装ファイルに `any` 型が存在しない
- [ ] テストカバレッジ ≥ 80%
- [ ] IPC 契約ドリフト検証が exit 0
- [ ] `outputs/phase-9/quality-report.md` が出力されている

## 次の Phase

Phase 10: 最終レビューゲート（`phase-10-final-review.md`）
