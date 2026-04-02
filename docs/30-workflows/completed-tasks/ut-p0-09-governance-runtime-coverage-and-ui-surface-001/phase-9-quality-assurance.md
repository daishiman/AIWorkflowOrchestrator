# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                                      |
| ------ | ------------------------------------------------------- |
| Phase  | 9                                                       |
| 機能名 | ut-p0-09-governance-runtime-coverage-and-ui-surface-001 |
| 作成日 | 2026-04-02                                              |

## 目的

lint/typecheck/IPC 契約確認を一括実行し、品質基準を満たしているか判定する。

## 実行タスク

- タスク1: ESLint チェック
- タスク2: TypeScript 型チェック
- タスク3: IPC 契約ドリフト確認
- タスク4: 品質保証レポート作成

## 参照資料

| 資料名                       | パス                                    | 説明             |
| ---------------------------- | --------------------------------------- | ---------------- |
| Phase 8 リファクタリング記録 | `outputs/phase-8/refactoring-record.md` | 変更後の差分確認 |
| Phase 7 カバレッジレポート   | `outputs/phase-7/coverage-report.md`    | テスト品質の前提 |

## 実行手順

### ステップ1: ESLint

```bash
pnpm --filter @repo/desktop lint
```

### ステップ2: TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/shared typecheck
```

### ステップ3: IPC 契約ドリフト確認

- `skill-creator:get-governance-state` チャネルの型が `apps/desktop/src/preload/channels.ts` ↔ `creatorHandlers.ts` ↔ `skill-creator-api.ts` ↔ `skillCreator.ts` で一致しているか確認
- `SkillCreatorGovernanceState` の型定義が変更されていないことを確認

### ステップ4: 品質レポート

| 確認項目             | 結果      |
| -------------------- | --------- |
| ESLint               | PASS/FAIL |
| TypeScript typecheck | PASS/FAIL |
| IPC 契約一致         | PASS/FAIL |
| テスト全 PASS        | PASS/FAIL |

## 統合テスト連携

- lint / typecheck / IPC 契約の結果を Phase 10 判定にそのまま引き渡す
- 失敗があれば Phase 8 または Phase 5 に戻す前提で記録する

## 成果物

| 成果物           | パス                                | 説明       |
| ---------------- | ----------------------------------- | ---------- |
| 品質保証レポート | `outputs/phase-9/quality-report.md` | 全確認結果 |

## 完了条件

- [ ] ESLint が PASS
- [ ] TypeScript typecheck が PASS
- [ ] IPC 契約ドリフトがない
- [ ] 全テストが PASS
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 10: 最終レビュー
