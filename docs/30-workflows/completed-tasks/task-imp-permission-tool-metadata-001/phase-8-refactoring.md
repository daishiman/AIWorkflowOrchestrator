# Phase 8: リファクタリング（TDD Refactor）

## メタ情報

| 項目           | 内容                                                                    |
| -------------- | ----------------------------------------------------------------------- |
| Phase          | 8                                                                       |
| Phase名        | リファクタリング                                                        |
| カテゴリ       | TDD-Refactor                                                            |
| 機能名         | task-imp-permission-tool-metadata-001                                   |
| Issue          | #606                                                                    |
| 前提Phase      | Phase 7（テストカバレッジ確認）                                         |
| 次Phase        | Phase 9（品質保証）                                                     |
| テストコマンド | `pnpm vitest run apps/desktop/src/renderer/components/skill/__tests__/` |

---

## 目的

TDD Refactorフェーズとして、全テストがPASSした状態を維持しながら、toolMetadata.tsとPermissionDialog.tsx（リスクバッジ関連部分）のコード品質を改善する。

---

## 実行タスク

### Task 1: コード品質分析

**目的**: リファクタリング対象を特定する。

**手順**:

1. toolMetadata.tsの分析：
   - 重複コードの有無を確認する
   - 命名の一貫性を確認する（RiskLevel, ToolMetadata, TOOL_METADATA等）
   - 関数の単一責務を確認する
   - エクスポートの必要最小限を確認する

2. PermissionDialog.tsx（リスクバッジ関連部分）の分析：
   - RISK_LEVEL_STYLESマッピングの適切性を確認する
   - RiskBadge表示ロジックの分離可能性を検討する
   - 既存コードとの一貫性（コーディングスタイル、命名規則）を確認する

3. リファクタリング候補リストを作成する

**期待される成果物**: リファクタリング候補リスト

### Task 2: リファクタリング実施

**目的**: コード品質を改善する。

**手順**:

1. リファクタリング候補の中から優先度の高いものを実施する

2. 実施候補（該当する場合のみ）：
   - RISK_LEVEL_STYLESをtoolMetadata.tsに移動（メタデータの集約）
   - PermissionDialogから共通化可能なバッジスタイルロジックの抽出
   - 定数名・変数名の改善（既存コードの命名規則に合わせる）
   - 不要なimportの削除

3. 各リファクタリング後にテストを実行し、全テストがPASSすることを確認する：

   ```bash
   pnpm vitest run apps/desktop/src/renderer/components/skill/__tests__/
   ```

4. リファクタリングが不要と判断した場合は、その理由を記録する

**期待される成果物**: リファクタリング結果

### Task 3: テスト回帰確認

**目的**: リファクタリング後に全テストがPASSしていることを最終確認する。

**手順**:

1. 全テストを実行する：

   ```bash
   pnpm vitest run apps/desktop/src/renderer/components/skill/__tests__/
   ```

2. TypeScript型チェックを実行する：

   ```bash
   pnpm --filter @repo/desktop exec tsc --noEmit
   ```

3. 全テストPASS・型チェッククリアを確認する

**期待される成果物**: テスト回帰確認結果

---

## 参照資料

| 資料名                    | パス                                                              |
| ------------------------- | ----------------------------------------------------------------- |
| Phase 7カバレッジレポート | `outputs/phase-7/coverage-report.md`                              |
| toolMetadata実装          | `apps/desktop/src/renderer/components/skill/toolMetadata.ts`      |
| PermissionDialog修正版    | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx` |

---

## 統合テスト連携アクション

- リファクタリング後の全テストスイートPASSを確認する
- カバレッジがリファクタリングにより低下していないことを確認する

---

## 成果物

| 成果物名                 | パス                                    | 種別     |
| ------------------------ | --------------------------------------- | -------- |
| リファクタリングレポート | `outputs/phase-8/refactoring-report.md` | document |

---

## 完了条件

- [ ] コード品質分析が完了し、リファクタリング候補が特定されている
- [ ] リファクタリングが実施されている（不要な場合はその理由が記録されている）
- [ ] リファクタリング後に全テストがPASSしている
- [ ] TypeScript strict modeで型エラーがない
- [ ] カバレッジがリファクタリング前から低下していない
- [ ] リファクタリングレポートが作成されている

---

## 次Phase

Phase 9（品質保証）: 静的解析、セキュリティチェック、アクセシビリティ検証を実施する。
