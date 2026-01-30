# Phase 9: 品質保証

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 9                           |
| 機能名 | TASK-7B-skill-import-dialog |
| 作成日 | 2026-01-30                  |

## 目的

定義された品質基準をすべて満たすことを検証する。

## 品質ゲート

### 1. 機能検証

- [ ] 全ユニットテストが成功
- [ ] ダイアログの開閉が正常動作
- [ ] スキル情報が全項目表示される
- [ ] インポートボタンが機能する
- [ ] ローディング状態が正しく表示される

### 2. コード品質

```bash
# TypeScript型チェック
pnpm --filter @repo/desktop typecheck

# ESLint
pnpm --filter @repo/desktop lint

# Prettier
pnpm --filter @repo/desktop format:check
```

### 3. テスト網羅性

| 指標              | 基準 | 結果       |
| ----------------- | ---- | ---------- |
| Line Coverage     | 80%+ | {{RESULT}} |
| Branch Coverage   | 60%+ | {{RESULT}} |
| Function Coverage | 80%+ | {{RESULT}} |

### 4. アクセシビリティ

- [ ] `role="dialog"` 設定済み
- [ ] `aria-modal="true"` 設定済み
- [ ] `aria-labelledby` 設定済み
- [ ] フォーカストラップ動作
- [ ] ESCキー対応
- [ ] 閉じるボタンに`aria-label`設定

### 5. セキュリティ

- [ ] ユーザー入力のサニタイゼーション不要（表示のみ）
- [ ] XSS脆弱性なし（Reactの自動エスケープ）
- [ ] dangerouslySetInnerHTML不使用

## 統合テスト連携【必須】

品質保証で統合テスト結果を確認:

| 品質項目     | 確認内容                         | 結果       |
| ------------ | -------------------------------- | ---------- |
| 機能検証     | 全ユニットテスト成功             | {{RESULT}} |
| コード品質   | TypeScript/ESLint/Prettierクリア | {{RESULT}} |
| セキュリティ | XSS/入力検証チェック通過         | {{RESULT}} |
| A11y         | ARIA/キーボード/フォーカス確認   | {{RESULT}} |

## 成果物

| 成果物       | パス                                | 説明         |
| ------------ | ----------------------------------- | ------------ |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質検証結果 |

## 完了条件

- [ ] 全品質ゲートをクリア
- [ ] TypeScript型チェック通過
- [ ] ESLint/Prettierクリア
- [ ] テストカバレッジ基準達成
- [ ] アクセシビリティチェック完了
- [ ] セキュリティチェック完了
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 機能検証の実施
2. コード品質チェックの実施
3. テスト網羅性確認
4. アクセシビリティチェックの実施
5. セキュリティチェックの実施
6. 統合テスト結果確認
7. 成果物の作成・配置
8. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-7B-skill-import-dialog --phase 9
```

## 次のPhase

Phase 10: 最終レビューゲート
