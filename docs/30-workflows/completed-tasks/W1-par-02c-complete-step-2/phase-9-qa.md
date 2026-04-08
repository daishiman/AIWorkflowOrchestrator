# Phase 9: QA

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 9                                         |
| Phase名    | QA                                        |
| タスクID   | UT-SKILL-WIZARD-W1-COMPLETE-STEP-001      |
| 機能名     | CompleteStep 完了画面再設計（起点画面化） |
| 前提Phase  | Phase 8: リファクタリング                 |
| 次Phase    | Phase 10: 最終レビュー                    |
| ステータス | pending                                   |
| 作成日     | 2026-04-07                                |

## 目的

実装・リファクタリング後の CompleteStep を品質ゲート観点で総合検査し、Phase 10 最終レビューへの通過判定を行う。

## 実行タスク

### Task 1: 自動テスト全件実行

```bash
# 全テスト実行
pnpm --filter @repo/desktop vitest run -- CompleteStep

# カバレッジ付き実行
pnpm --filter @repo/desktop vitest run -- CompleteStep --coverage
```

### Task 2: 型チェック

```bash
pnpm --filter @repo/desktop tsc --noEmit
```

### Task 3: Lint チェック

```bash
pnpm --filter @repo/desktop eslint apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx
```

### Task 4: 品質ゲートチェックリスト

| チェック項目                                   | 基準                      | 結果 |
| ---------------------------------------------- | ------------------------- | ---- |
| 全テストがpass                                 | 0 failures                | -    |
| Statementsカバレッジ                           | 90%以上                   | -    |
| Branchesカバレッジ                             | 85%以上                   | -    |
| Functionsカバレッジ                            | 100%                      | -    |
| TypeScript型エラーなし                         | 0 errors                  | -    |
| ESLintエラーなし                               | 0 errors                  | -    |
| any型の使用なし                                | 0箇所                     | -    |
| data-testid が全インタラクティブ要素に付与済み | 10要素以上                | -    |
| aria-label が全ボタンに付与済み                | 全ボタン対象              | -    |
| Props に undefined チェックが適切に実装済み    | オプショナルProps全て対象 | -    |

### Task 5: セキュリティ観点チェック

| チェック項目                 | 確認内容                                                     |
| ---------------------------- | ------------------------------------------------------------ |
| XSS リスク                   | externalToolName が dangerouslySetInnerHTML を使っていないか |
| イベントハンドラの無限ループ | useCallback の依存配列が正しいか                             |
| メモリリーク                 | useEffect のクリーンアップが必要な処理がないか               |

### Task 6: パフォーマンス観点チェック

| チェック項目                     | 確認内容                               |
| -------------------------------- | -------------------------------------- |
| 不要な再レンダリング             | feedbackSubmittedのstate変更が最小限か |
| 重いコンポーネントの遅延読み込み | 必要に応じてReact.lazyを検討           |

### Task 7: QAレポートの作成

上記チェック結果をまとめた QA レポートを作成する。

## 参照資料

| 資料名               | パス                                                                                | 説明         |
| -------------------- | ----------------------------------------------------------------------------------- | ------------ |
| 実装ファイル         | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`                | QA対象       |
| テストファイル       | `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx` | 検証基準     |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`                                                | 参照値       |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`                                                | 変更内容確認 |

## 成果物

| 成果物     | パス                           | 説明                               |
| ---------- | ------------------------------ | ---------------------------------- |
| QAレポート | `outputs/phase-9/qa-report.md` | 品質ゲート結果・判定・指摘事項一覧 |

## 完了条件

- [ ] 全自動テストがpassしている
- [ ] カバレッジ目標値を達成している
- [ ] 型チェックが通過している
- [ ] Lintチェックが通過している
- [ ] 品質ゲートチェックリストが全項目OKである
- [ ] セキュリティ観点チェックが完了している
- [ ] QAレポートが作成されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 10: 最終レビュー](./phase-10-final-review.md)
