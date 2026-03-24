# Phase 9: 品質検証

## メタ情報

| 項目   | 値             |
| ------ | -------------- |
| Phase  | 9              |
| 機能名 | slide-impl-001 |
| 作成日 | 2026-03-24     |

## 目的

定義された品質基準をすべて満たすことを検証する。Lint・TypeCheck・全テスト実行を行い、品質ゲートを通過させる。

> **注記**: 本 Phase は品質チェックの Single Source of Truth として機能する。Phase 5（実装後確認）や Phase 8（リファクタリング後確認）でも部分的な品質チェックを行うが、最終的な品質ゲート判定は本 Phase で一元的に実施する。

## 実行タスク

### Task 1: TypeScript 型チェック

```bash
pnpm typecheck
```

確認項目:

- `packages/shared/src/slide/types.ts` の新型定義に型エラーがない
- `apps/desktop/src/main/slide/` 配下の全ファイルが型チェック PASS
- `apps/desktop/src/preload/` 配下の変更ファイルが型チェック PASS

### Task 2: Lint チェック

```bash
pnpm lint
```

確認項目:

- ESLint ルール違反が 0 件
- 未使用 import がない
- `any` 型の使用がない

### Task 3: 全テスト実行

```bash
cd apps/desktop && pnpm vitest run src/main/slide/__tests__/ --reporter verbose
```

### Task 4: 品質ゲート判定

| 品質項目     | 確認内容                  | 結果       |
| ------------ | ------------------------- | ---------- |
| TypeCheck    | `pnpm typecheck` PASS     | {{RESULT}} |
| Lint         | `pnpm lint` 違反 0 件     | {{RESULT}} |
| テスト       | 全テスト PASS             | {{RESULT}} |
| セキュリティ | P42/P60/P62 準拠          | {{RESULT}} |
| 型安全       | `any` 不使用、`as` 不使用 | {{RESULT}} |

### Task 4-2: 型安全性検証

```bash
# any 型の使用確認（0件であること）
grep -rn "any" apps/desktop/src/main/slide/ --include="*.ts" | grep -v "test" | grep -v "\.d\.ts"

# as キャスト の使用確認（テストファイル除く、0件であること）
grep -rn " as " apps/desktop/src/main/slide/ --include="*.ts" | grep -v "test"

# non-null assertion の使用確認（0件であること）
grep -rn "\!" apps/desktop/src/main/slide/ --include="*.ts" | grep -v "test" | grep -v "!=\|!=="
```

### Task 5: IPC 契約ドリフト検証

```bash
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only
```

- [x] チャンネル孤児（R-01）の検出結果が妥当である
- [x] 引数形式不一致（R-02）が存在しないことを確認する
- [x] `slide:capability:get` が正しく登録されている

## 参照資料

| 資料名         | パス                                    | 内容             |
| -------------- | --------------------------------------- | ---------------- |
| 品質基準       | `.claude/rules/02-code-quality.md`      | コーディング規約 |
| セキュリティ   | `.claude/rules/04-electron-security.md` | IPC セキュリティ |
| 既知の落とし穴 | `.claude/rules/06-known-pitfalls.md`    | P42/P60/P62      |

## 統合テスト連携

| 品質項目     | 確認内容           | 結果       |
| ------------ | ------------------ | ---------- |
| 機能検証     | 全自動テスト成功   | {{RESULT}} |
| 統合テスト   | 全統合テスト成功   | {{RESULT}} |
| セキュリティ | 脆弱性スキャン通過 | {{RESULT}} |

## 成果物

| 成果物       | パス                                | 説明         |
| ------------ | ----------------------------------- | ------------ |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質検証結果 |

## 完了条件

- [x] `pnpm typecheck` PASS
- [x] `pnpm lint` 違反 0 件
- [x] 全テスト PASS
- [x] IPC 契約ドリフト検証 PASS
- [x] P42/P60/P62 準拠を確認
- [x] `any` / `as` / `!` 不使用を確認
- [x] 品質レポートが出力されている
- [x] 本 Phase 内の全タスクを 100% 実行完了

## 次の Phase

Phase 10: 最終レビュー
