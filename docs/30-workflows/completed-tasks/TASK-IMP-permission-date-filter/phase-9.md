# Phase 9: 品質保証

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 9                               |
| 機能名 | TASK-IMP-permission-date-filter |
| 作成日 | 2026-02-01                      |

## 目的

定義された品質基準をすべて満たすことを検証する。

## 実行タスク

- 機能検証: 全自動テストの完全成功
- コード品質: ESLint/TypeScript strictチェック
- テスト網羅性: カバレッジ基準達成の最終確認
- セキュリティ: 日付入力のXSS/インジェクション耐性確認

## 参照資料

| 資料名             | パス                                                                                           | 説明                 |
| ------------------ | ---------------------------------------------------------------------------------------------- | -------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`                                                           | Phase 7成果物        |
| リファクタリング   | `outputs/phase-8/refactoring-report.md`                                                        | Phase 8成果物        |
| 実装コード         | `apps/desktop/src/renderer/components/settings/PermissionSettings/dateFilterUtils.ts`          | 日付フィルタヘルパー |
| 実装コード         | `apps/desktop/src/renderer/components/settings/PermissionSettings/PermissionHistoryFilter.tsx` | フィルタUI           |
| 実装コード         | `apps/desktop/src/renderer/components/settings/PermissionSettings/PermissionHistoryPanel.tsx`  | パネルロジック       |

## 品質ゲート

| 品質項目          | 基準                      | 結果 |
| ----------------- | ------------------------- | ---- |
| 全テスト成功      | vitest run 全テストPASS   | -    |
| TypeScript strict | tsc --noEmit エラーなし   | -    |
| ESLint            | eslint エラーなし         | -    |
| Prettier          | prettier --check 整形済み | -    |
| Line Coverage     | 80%以上                   | -    |
| Branch Coverage   | 60%以上                   | -    |
| Function Coverage | 80%以上                   | -    |

## 実行手順

### 1. 全テスト実行

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/components/settings/PermissionSettings/
```

### 2. TypeScript strict チェック

```bash
pnpm --filter @repo/desktop exec tsc --noEmit
```

### 3. ESLint チェック

```bash
pnpm --filter @repo/desktop exec eslint src/renderer/components/settings/PermissionSettings/
```

### 4. Prettier チェック

```bash
pnpm --filter @repo/desktop exec prettier --check src/renderer/components/settings/PermissionSettings/
```

### 5. セキュリティチェック

| チェック項目                        | 確認内容                                      |
| ----------------------------------- | --------------------------------------------- |
| 日付入力のXSS耐性                   | `<input type="date" />`はネイティブ要素で安全 |
| ISO8601パース時のエラーハンドリング | `new Date(invalid)`がNaNを返す場合の処理      |
| safeArgsSnapshot()との互換性        | dateRange値がスナップショットに含まれても安全 |

## 統合テスト連携【必須】

| 品質項目     | 確認内容              | 結果 |
| ------------ | --------------------- | ---- |
| 機能検証     | 全自動テスト成功      | -    |
| コード品質   | Lint/型チェッククリア | -    |
| テスト網羅性 | カバレッジ基準達成    | -    |

## 多角的チェック観点（AIが判断）

| 観点             | 適用判断 | 仕様参照先                   |
| ---------------- | -------- | ---------------------------- |
| セキュリティ     | 適用     | 日付入力のバリデーション確認 |
| パフォーマンス   | 適用     | テスト実行時間の妥当性       |
| アクセシビリティ | 適用     | aria属性の確認               |

## 成果物

| 成果物       | パス                                | 説明         |
| ------------ | ----------------------------------- | ------------ |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質検証結果 |

## 完了条件

- [ ] 全品質ゲートをクリア（テスト、TypeScript、ESLint、Prettier、カバレッジ）
- [ ] セキュリティチェック完了
- [ ] 品質レポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 全テスト実行
2. TypeScript strictチェック
3. ESLint/Prettierチェック
4. セキュリティチェック
5. 品質レポートの作成
6. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-IMP-permission-date-filter --phase 9
```

## 次のPhase

Phase 10: 最終レビューゲート
