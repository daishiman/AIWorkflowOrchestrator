# Phase 9 成果物: QA レポート仕様

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 9                                         |
| タスクID   | UT-SKILL-WIZARD-W1-par-02c                |
| 機能名     | CompleteStep 完了画面再設計（起点画面化） |
| 作成日     | 2026-04-08                                |
| ステータス | pending（Phase 8 完了後に実行）           |

---

## 品質ゲートチェックリスト

| チェック項目                                     | 基準                        | 結果（実装後記入） |
| ------------------------------------------------ | --------------------------- | ------------------ |
| 全テストが pass                                  | 0 failures                  | -                  |
| Statements カバレッジ                            | 90% 以上                    | -                  |
| Branches カバレッジ                              | 85% 以上                    | -                  |
| Functions カバレッジ                             | 100%                        | -                  |
| TypeScript 型エラーなし                          | 0 errors                    | -                  |
| ESLint エラーなし                                | 0 errors                    | -                  |
| `any` 型の使用なし                               | 0 箇所                      | -                  |
| `data-testid` が全インタラクティブ要素に付与済み | 10 要素以上                 | -                  |
| `aria-label` が全ボタンに付与済み                | 全ボタン対象                | -                  |
| Props に undefined チェックが適切に実装済み      | オプショナル Props 全て対象 | -                  |

---

## 検証コマンド

```bash
# 全テスト実行
pnpm --filter @repo/desktop vitest run -- CompleteStep

# カバレッジ付き実行
pnpm --filter @repo/desktop vitest run -- CompleteStep --coverage

# 型チェック
pnpm --filter @repo/desktop tsc --noEmit

# Lint チェック
pnpm --filter @repo/desktop eslint apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx
```

---

## セキュリティ観点チェック

| チェック項目                 | 確認内容                                                                                                | 判定（実装後記入） |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------ |
| XSS リスク                   | `externalToolName` が `dangerouslySetInnerHTML` を使っていないか                                        | -                  |
| イベントハンドラの無限ループ | `useCallback` の依存配列が正しいか                                                                      | -                  |
| メモリリーク                 | `useEffect` のクリーンアップが必要な処理がないか（本コンポーネントは `useEffect` 不使用のため該当なし） | N/A                |

---

## パフォーマンス観点チェック

| チェック項目                     | 確認内容                                           | 判定（実装後記入） |
| -------------------------------- | -------------------------------------------------- | ------------------ |
| 不要な再レンダリング             | `feedbackSubmitted` の state 変更が最小限か        | -                  |
| `useCallback` 依存配列の正確性   | `handleSatisfied` / `handleUnsatisfied` の依存配列 | -                  |
| 重いコンポーネントの遅延読み込み | 本コンポーネントは軽量なため `React.lazy` 不要     | N/A                |

---

## data-testid 付与確認リスト

| 要素                   | data-testid                           | 確認（実装後記入） |
| ---------------------- | ------------------------------------- | ------------------ |
| ルートコンテナ         | `complete-step`                       | -                  |
| 完了ヘッダー           | `complete-step-header`                | -                  |
| 👍 ボタン              | `complete-step-feedback-satisfied`    | -                  |
| 👎 ボタン              | `complete-step-feedback-unsatisfied`  | -                  |
| 今すぐ実行カード       | `complete-step-action-execute`        | -                  |
| エディタで開くカード   | `complete-step-action-open-editor`    | -                  |
| 別のスキルを作るカード | `complete-step-action-create-another` | -                  |
| 外部連携チェックリスト | `complete-step-external-checklist`    | -                  |
| Webhook チェック       | `complete-step-check-webhook`         | -                  |
| テスト実行チェック     | `complete-step-check-test-run`        | -                  |

---

## QA 総合判定（実装後記入）

| 判定基準                       | 結果 |
| ------------------------------ | ---- |
| 全テストが pass している       | -    |
| カバレッジ目標値を達成している | -    |
| 型エラー・Lint エラーなし      | -    |
| セキュリティ観点チェック完了   | -    |
| パフォーマンス観点チェック完了 | -    |

**QA 判定:** pending

---

## 完了確認（Phase 8 完了後に更新）

- [ ] 全自動テストが pass している
- [ ] カバレッジ目標値を達成している
- [ ] 型チェックが通過している
- [ ] Lint チェックが通過している
- [ ] 品質ゲートチェックリストが全項目 OK である
- [ ] セキュリティ観点チェックが完了している
- [ ] QA レポートが作成されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了
