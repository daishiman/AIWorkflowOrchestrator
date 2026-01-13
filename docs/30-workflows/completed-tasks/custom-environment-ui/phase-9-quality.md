# Phase 9: 品質チェック

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 9                     |
| 機能名 | custom-environment-ui |
| 作成日 | 2026-01-13            |

## 目的

Lint、型チェック、セキュリティ監査を実行し、品質を確保する。

## 実行タスク

- Lintチェック: ESLint実行と警告・エラー解消
- 型チェック: TypeScriptコンパイラでの型検証
- セキュリティ監査: 依存関係の脆弱性チェック
- コードフォーマット: Prettier適用

## 参照資料

| 資料名         | パス                                   | 説明          |
| -------------- | -------------------------------------- | ------------- |
| カバレッジ結果 | `outputs/phase-7/coverage-report.html` | Phase 7成果物 |
| リファクタログ | `outputs/phase-8/refactoring-log.md`   | Phase 8成果物 |

### システム仕様（aiworkflow-requirements）

> 品質チェック時に以下のシステム仕様を参照してください。

| 参照資料               | パス                                                                         | 内容            |
| ---------------------- | ---------------------------------------------------------------------------- | --------------- |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | 設計パターン    |
| Electronセキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | CSP/sandbox設定 |
| テストカバレッジ戦略   | `.claude/skills/aiworkflow-requirements/references/test-msw-coverage.md`     | Vitest/MSW設定  |

---

## 品質チェックコマンド

```bash
# ESLint
pnpm --filter @repo/desktop lint
pnpm --filter @repo/shared lint

# TypeScript型チェック
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/shared typecheck

# Prettier
pnpm --filter @repo/desktop format
pnpm --filter @repo/shared format

# 依存関係監査
pnpm audit

# 全チェック一括
pnpm lint && pnpm typecheck
```

---

## チェック項目

### ESLint

| ルール         | 期待値      |
| -------------- | ----------- |
| エラー         | 0件         |
| 警告           | 0件（推奨） |
| 無効化コメント | 最小限      |

### TypeScript

| チェック項目     | 期待値 |
| ---------------- | ------ |
| コンパイルエラー | 0件    |
| strict mode      | 有効   |
| any型使用        | 0件    |

### セキュリティ

| チェック項目   | 期待値      |
| -------------- | ----------- |
| 高リスク脆弱性 | 0件         |
| 中リスク脆弱性 | 0件（推奨） |
| DOMPurify設定  | 安全        |

---

## 対象ファイル

| ファイル/ディレクトリ                                  | チェック内容         |
| ------------------------------------------------------ | -------------------- |
| `packages/shared/src/types/`                           | 型定義、export確認   |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts` | 状態管理、型安全性   |
| `apps/desktop/src/renderer/utils/sanitize.ts`          | セキュリティ、テスト |
| `apps/desktop/src/renderer/components/organisms/`      | コンポーネント品質   |
| `apps/desktop/src/renderer/components/molecules/`      | コンポーネント品質   |

---

## 統合テスト連携【必須】

統合ポイントの型安全性を確認する:

| 統合ポイント           | 品質確認事項                           |
| ---------------------- | -------------------------------------- |
| agentSlice拡張         | 型定義が厳密、any型なし                |
| SplitLayout↔親         | Props型が正確、オプショナル適切        |
| ExecutionEnvironment   | 環境タイプの網羅性（exhaustive check） |
| HTMLPreviewEnvironment | DOMPurify設定の安全性                  |

---

## 問題発見時の対応

### Lintエラー

1. エラーメッセージを確認
2. 該当箇所を修正
3. 再度Lintを実行

### 型エラー

1. エラーの原因を特定
2. 型定義を修正または追加
3. 再度型チェックを実行

### セキュリティ脆弱性

1. 脆弱性の重要度を確認
2. パッケージを更新または代替を検討
3. 更新後に再監査

---

## 成果物

| 成果物               | パス                                  | 説明           |
| -------------------- | ------------------------------------- | -------------- |
| Lintレポート         | `outputs/phase-9/lint-report.md`      | ESLint結果     |
| 型チェックレポート   | `outputs/phase-9/typecheck-report.md` | TypeScript結果 |
| セキュリティレポート | `outputs/phase-9/security-report.md`  | 脆弱性確認     |

---

## 完了条件

- [ ] ESLintエラーが0件
- [ ] TypeScriptエラーが0件
- [ ] any型使用が0件
- [ ] 高リスク脆弱性が0件
- [ ] コードフォーマットが統一されている
- [ ] 統合ポイントの型安全性が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. ESLint実行
2. Lintエラー/警告の修正
3. TypeScript型チェック実行
4. 型エラーの修正
5. any型使用箇所の確認・修正
6. セキュリティ監査実行
7. 脆弱性対応（必要な場合）
8. コードフォーマット適用
9. 統合ポイントの型安全性確認
10. 成果物の作成・配置
11. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# 品質チェック一括実行
pnpm lint && pnpm typecheck && pnpm audit

# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/custom-environment-ui --phase 9
```

## 次のPhase

Phase 10: 最終レビューゲート
