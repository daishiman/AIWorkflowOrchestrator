# Phase 9: 品質検証

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 9 - 品質検証                           |
| 機能名   | health-policy-unification              |
| タスクID | TASK-IMP-HEALTH-POLICY-UNIFICATION-001 |
| 作成日   | 2026-03-24                             |

## 目的

Lint、TypeScript 型チェック、全テスト実行を行い、コード品質の基準を満たしていることを検証する。37 ファイルに関連する既存テストを含めた全体的な品質を確認する。

## 前提成果物

| Phase | 成果物                                             |
| ----- | -------------------------------------------------- |
| 8     | [phase-8-refactoring.md](./phase-8-refactoring.md) |

## 参照資料

| 資料名                 | パス / 参照先                            |
| ---------------------- | ---------------------------------------- |
| コード品質ルール       | `.claude/rules/02-code-quality.md`       |
| Git & ツーリングルール | `.claude/rules/07-git-and-tooling.md`    |
| P62 暗黙 fallback      | `.claude/rules/06-known-pitfalls.md#P62` |
| P8 幽霊依存            | `.claude/rules/06-known-pitfalls.md#P8`  |

## 実行タスク

### Task 1: ESLint 実行

```bash
pnpm lint
```

#### 確認事項

- [ ] エラーが 0 件であること
- [ ] 未使用の import がないこと
- [ ] `@deprecated` マークが適切に機能していること

### Task 2: TypeScript 型チェック

```bash
pnpm typecheck
```

#### 確認事項

- [ ] エラーが 0 件であること
- [ ] `health-policy.ts` の型が `packages/shared/src/types/index.ts` 経由で正しくエクスポートされていること
- [ ] `RuntimePolicyResolver.ts` が `@repo/shared` から `HealthPolicy` 型を正しくインポートしていること
- [ ] `mainlineAccess.ts` が `@repo/shared` から `HealthPolicy` 型を正しくインポートしていること
- [ ] `@deprecated` マークが `ExecutionCapabilityInput.apiKeyDegraded` に付与されていること

### Task 3: 全テスト実行

```bash
# packages/shared テスト
cd packages/shared && pnpm vitest run

# apps/desktop テスト
cd apps/desktop && pnpm vitest run
```

#### 確認事項

- [ ] 全テストが PASS であること
- [ ] HealthPolicy 関連テストが PASS であること
- [ ] 既存の RuntimePolicyResolver テストが PASS であること（回帰なし）
- [ ] 既存の mainlineAccess テストが PASS であること（回帰なし）

### Task 4: P62 暗黙 fallback チェック

37 ファイルに関連する暗黙 fallback がないことを確認する。

```bash
# DEFAULT_CONFIG / defaultConfig の使用箇所を確認
grep -rn "DEFAULT_CONFIG\|defaultConfig" packages/shared/src/types/health-policy.ts
grep -rn "DEFAULT_CONFIG\|defaultConfig" apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts
grep -rn "DEFAULT_CONFIG\|defaultConfig" apps/desktop/src/renderer/features/mainline-access/mainlineAccess.ts
```

#### 確認事項

- [ ] `health-policy.ts` に暗黙 fallback がないこと
- [ ] `RuntimePolicyResolver.ts` に暗黙 fallback がないこと（HealthPolicy 未指定時は明示的に既存パスを通る）
- [ ] `mainlineAccess.ts` に暗黙 fallback がないこと（HealthPolicy 未指定時は明示的に既存パスを通る）

### Task 5: 依存関係チェック

```bash
# packages/shared の package.json に不要な依存がないこと
cat packages/shared/package.json | grep -A 20 "dependencies"

# apps/desktop が @repo/shared に依存していること
cat apps/desktop/package.json | grep "@repo/shared"
```

#### 確認事項

- [ ] `packages/shared` に不要な外部依存が追加されていないこと
- [ ] `apps/desktop` が `@repo/shared` に正しく依存していること
- [ ] 幽霊依存（P8）がないこと

### Task 6: 品質検証結果記録

```
## 品質検証結果

### ESLint
- 結果: [PASS/FAIL]
- エラー件数: __件
- 警告件数: __件

### TypeScript 型チェック
- 結果: [PASS/FAIL]
- エラー件数: __件

### テスト実行
- packages/shared: __/__テスト PASS
- apps/desktop: __/__テスト PASS
- 回帰テスト: [PASS/FAIL]

### P62 暗黙 fallback チェック
- health-policy.ts: [PASS/FAIL]
- RuntimePolicyResolver.ts: [PASS/FAIL]
- mainlineAccess.ts: [PASS/FAIL]

### 依存関係チェック
- 幽霊依存: [なし/あり]
```

## 成果物

| 成果物           | パス                                |
| ---------------- | ----------------------------------- |
| 品質検証レポート | `outputs/phase-9/quality-report.md` |

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

## タスク100%実行確認【必須】

Phase 完了前に以下を確認する:

- [ ] 実行タスクの全項目が実施されている
- [ ] 成果物テーブルの全成果物が作成されている
- [ ] 完了条件の全チェックボックスがチェックされている
- [ ] 次 Phase への引き継ぎ事項が明確である

## 完了条件

- [ ] `pnpm lint` が PASS（エラー 0 件）
- [ ] `pnpm typecheck` が PASS（エラー 0 件）
- [ ] 全テストが PASS
- [ ] 既存テストに回帰がない
- [ ] P62 暗黙 fallback が存在しない
- [ ] 幽霊依存（P8）がない
- [ ] 品質検証結果がレポートとして記録されている

## 次 Phase

[Phase 10: 最終レビュー](./phase-10-final-review.md)
