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

## 次のPhase

Phase 10: 最終レビューゲート
