# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                                            |
| -------- | --------------------------------------------- |
| Phase    | 7                                             |
| タスクID | TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 |
| 機能名   | ipc-handler-graceful-degradation              |
| 作成日   | 2026-03-07                                    |

## 目的

Phase 6 までのテストが品質基準のカバレッジ閾値を満たしているかを確認する。未達の場合は Phase 6 に戻る。

## 実行タスク

- カバレッジ計測: `safeRegister` と `registerAllIpcHandlers` のカバレッジを計測する
- 基準照合: プロジェクトのカバレッジ基準と照合する
- ギャップ分析: 未カバー箇所を特定し、Phase 6 への差し戻し要否を判定する

## 参照資料

| 資料名             | パス                                   | 説明           |
| ------------------ | -------------------------------------- | -------------- |
| 品質基準           | `.claude/rules/02-code-quality.md`     | カバレッジ閾値 |
| テストファイル     | `apps/desktop/src/main/ipc/__tests__/` | テスト成果物   |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`   | Phase 6 成果物 |

### 前提Phase成果物

| 資料名          | パス                | 用途                                |
| --------------- | ------------------- | ----------------------------------- |
| Phase 1 成果物  | `outputs/phase-1/`  | Phase 1 の出力を入力として参照する  |
| Phase 2 成果物  | `outputs/phase-2/`  | Phase 2 の出力を入力として参照する  |
| Phase 3 成果物  | `outputs/phase-3/`  | Phase 3 の出力を入力として参照する  |
| Phase 4 成果物  | `outputs/phase-4/`  | Phase 4 の出力を入力として参照する  |
| Phase 5 成果物  | `outputs/phase-5/`  | Phase 5 の出力を入力として参照する  |
| Phase 6 成果物  | `outputs/phase-6/`  | Phase 6 の出力を入力として参照する  |
| Phase 7 成果物  | `outputs/phase-7/`  | Phase 7 の出力を入力として参照する  |
| Phase 8 成果物  | `outputs/phase-8/`  | Phase 8 の出力を入力として参照する  |
| Phase 9 成果物  | `outputs/phase-9/`  | Phase 9 の出力を入力として参照する  |
| Phase 10 成果物 | `outputs/phase-10/` | Phase 10 の出力を入力として参照する |
| Phase 11 成果物 | `outputs/phase-11/` | Phase 11 の出力を入力として参照する |
| Phase 12 成果物 | `outputs/phase-12/` | Phase 12 の出力を入力として参照する |

## 実行手順

### ステップ1: カバレッジ計測実行

```bash
cd apps/desktop && pnpm vitest run --coverage src/main/ipc/__tests__/ipc-graceful-degradation.test.ts src/main/ipc/__tests__/safe-register.test.ts
```

### ステップ2: 基準照合

| 指標              | 最低基準 | 推奨基準 | 実測値 | 判定 |
| ----------------- | -------- | -------- | ------ | ---- |
| Line Coverage     | 80%      | 90%      | -      | -    |
| Branch Coverage   | 60%      | 70%      | -      | -    |
| Function Coverage | 80%      | 90%      | -      | -    |

### ステップ3: ゲート判定

| 判定                   | 対応                               |
| ---------------------- | ---------------------------------- |
| 全指標が最低基準以上   | Phase 8 へ進む                     |
| いずれかが最低基準未満 | Phase 6 に戻り不足テストを追加する |

**注意事項:**

- P41（v8 カバレッジプロバイダのインライン関数カウント）に注意する
- `safeRegister` 内のアロー関数がカバレッジに影響する可能性がある

## 統合テスト連携

| 統合ポイント | 確認内容                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------ |
| 起動フロー   | `registerAllIpcHandlers()` の部分失敗後も `app.whenReady()` 直後の主要機能が利用可能かを確認する             |
| 再登録フロー | `unregisterAllIpcHandlers()` → `registerAllIpcHandlers()` の既存ライフサイクルテストに回帰がないかを確認する |
| 依存グループ | Skill/Auth/Profile の各依存初期化グループの1件失敗時に、無関係ハンドラのテストが継続 PASS するかを確認する   |

## 成果物

| 成果物         | パス                                 | 説明           |
| -------------- | ------------------------------------ | -------------- |
| カバレッジ結果 | `outputs/phase-7/coverage-result.md` | 計測結果と判定 |

## 完了条件

- [ ] Line Coverage が 80% 以上
- [ ] Branch Coverage が 60% 以上
- [ ] Function Coverage が 80% 以上
- [ ] `safeRegister` 関数のカバレッジが 100%
- [ ] 未カバー箇所がある場合、Phase 6 差し戻しまたは正当な除外理由が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 8: リファクタリング
