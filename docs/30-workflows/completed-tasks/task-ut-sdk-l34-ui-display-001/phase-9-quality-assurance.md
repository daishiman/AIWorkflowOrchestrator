# Phase 9: 品質保証

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 9                              |
| 機能名 | task-ut-sdk-l34-ui-display-001 |
| 作成日 | 2026-04-03                     |

## 目的

定義された品質基準をすべて満たすことを検証する。
Lint・型チェック・テスト・IPC契約ドリフトを一括確認する。

## 実行タスク

- 機能検証: 全自動テストの完全成功確認
- コード品質: Lint/型チェッククリア
- テスト網羅性: カバレッジ基準達成確認
- IPC契約ドリフト検証: IPCは変更なしだが念のため確認

## 参照資料

| 資料名        | パス                                        | 説明                   |
| ------------- | ------------------------------------------- | ---------------------- |
| Phase 7成果物 | `outputs/phase-7/coverage-report.md`        | カバレッジ基準達成確認 |
| Phase 8成果物 | `outputs/phase-8/refactoring-report.md`     | リファクタリング後状態 |
| Phase 5成果物 | `outputs/phase-5/implementation-summary.md` | 実装結果の最終確認     |

## 実行手順

### Step 1: 全品質ゲートの一括実行

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# ESLint
pnpm --filter @repo/desktop lint

# テスト（カバレッジ付き）
pnpm --filter @repo/desktop test -- --run --coverage 2>&1 | tail -30

# IPC契約ドリフト確認（本タスクはIPC変更なしだが確認）
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only 2>&1 | tail -10
```

### Step 2: 品質ゲート判定

| 品質項目                | 確認内容                                    | 結果       |
| ----------------------- | ------------------------------------------- | ---------- |
| 機能検証                | 全自動テスト（TC-01〜TC-19）成功            | {{RESULT}} |
| TypeScript型チェック    | コンパイルエラー0件                         | {{RESULT}} |
| ESLint                  | エラー0件                                   | {{RESULT}} |
| Line Coverage           | 80%+                                        | {{RESULT}} |
| Branch Coverage         | 60%+                                        | {{RESULT}} |
| Function Coverage       | 80%+                                        | {{RESULT}} |
| IPC契約ドリフト（R-01） | チャンネル孤児なし（本タスクはIPC変更なし） | N/A        |
| IPC契約ドリフト（R-02） | 引数形式不一致なし                          | N/A        |

### Step 3: セキュリティチェック

本タスクはRendererコンポーネントのUI表示変更のみ。
IPC・Preload・外部データ入力は変更なし。セキュリティリスクなし。

| セキュリティ確認項目 | 判定 | 備考                                             |
| -------------------- | ---- | ------------------------------------------------ |
| XSSリスク            | N/A  | ユーザー入力なし（バックエンドからのchecksのみ） |
| IPC変更なし          | ✅   | バックエンドはUT-IMP-SDK-06で完了                |
| CSPへの影響          | N/A  | 新規外部リソースなし                             |

## 統合テスト連携【必須】

| 品質項目     | 確認内容           | 結果       |
| ------------ | ------------------ | ---------- |
| 機能検証     | 全自動テスト成功   | {{RESULT}} |
| 統合テスト   | 全統合テスト成功   | {{RESULT}} |
| セキュリティ | 脆弱性スキャン通過 | {{RESULT}} |

### IPC契約ドリフト検証【Phase 9 品質ゲート】

- [ ] `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only` が exit 0 で完了する（または N/A）
- [ ] チャンネル孤児（R-01）の検出結果が妥当である
- [ ] 引数形式不一致（R-02）が存在しないことを確認する

## 成果物

| 成果物       | パス                                | 説明               |
| ------------ | ----------------------------------- | ------------------ |
| 品質レポート | `outputs/phase-9/quality-report.md` | 全品質ゲートの結果 |

## 完了条件

- [ ] 全自動テストがGreenである
- [ ] TypeScriptコンパイルエラー0件
- [ ] ESLintエラー0件
- [ ] Line 80%+ / Branch 60%+ / Function 80%+ を達成
- [ ] IPC契約ドリフト検証が完了している（N/Aの場合はその旨記録）
- [ ] 品質レポートが`outputs/phase-9/quality-report.md`に記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-ut-sdk-l34-ui-display-001 --phase 9
```

## 次のPhase

Phase 10: 最終レビューゲート
