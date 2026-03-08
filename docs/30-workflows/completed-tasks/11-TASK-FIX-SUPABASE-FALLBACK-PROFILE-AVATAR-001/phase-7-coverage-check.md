# Phase 7: カバレッジ確認

## メタ情報

| 項目      | 値                                            |
| --------- | --------------------------------------------- |
| Phase     | 7                                             |
| タスクID  | TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001 |
| 機能名    | supabase-fallback-profile-avatar              |
| 作成日    | 2026-03-07                                    |
| 前提Phase | Phase 6 テスト拡充                            |

## 目的

Phase 5の実装コードに対するテストカバレッジを計測し、プロジェクト基準を満たしていることを確認する。未達の場合は Phase 6 に戻り追加テストを作成する。

## 実行タスク

- Task 1: カバレッジ計測: fallback 実装と関連テストの実測値を取得する
- Task 2: カバレッジ基準照合: Phase 6 までの結果が閾値を満たすか判定する
- Task 3: ゲート判定: PASS / FAIL を決めて次の戻り先を明確にする
- Task 4: カバレッジギャップ分析（FAILの場合）: 足りない観点を具体化する

### Task 1: カバレッジ計測

#### 実行コマンド

```bash
cd apps/desktop && pnpm vitest run --coverage src/main/ipc/__tests__/fallback-handlers.test.ts
```

#### カバレッジ対象ファイル

| ファイル                             | 対象関数                                                                |
| ------------------------------------ | ----------------------------------------------------------------------- |
| `apps/desktop/src/main/ipc/index.ts` | `registerProfileFallbackHandlers()`, `registerAvatarFallbackHandlers()` |

### Task 2: カバレッジ基準照合

| 指標              | 最低基準 | 推奨基準 | 実測値     |
| ----------------- | -------- | -------- | ---------- |
| Line Coverage     | 80%      | 90%      | 計測後記入 |
| Branch Coverage   | 60%      | 70%      | 計測後記入 |
| Function Coverage | 80%      | 90%      | 計測後記入 |

### Task 3: ゲート判定

| 判定 | 条件                         | 対応                         |
| ---- | ---------------------------- | ---------------------------- |
| PASS | 全指標が最低基準以上         | Phase 8 へ                   |
| FAIL | いずれかの指標が最低基準未満 | Phase 6 へ戻り追加テスト作成 |

### Task 4: カバレッジギャップ分析（FAILの場合）

未カバー箇所を特定し、以下を記録:

- 未カバーの行番号
- 未カバーの分岐条件
- 追加すべきテストケースの概要

## 参照資料

| 資料名         | パス                                                            | 説明                                 |
| -------------- | --------------------------------------------------------------- | ------------------------------------ |
| カバレッジ基準 | `.claude/rules/02-code-quality.md`                              | Line 80%/Branch 60%/Function 80%     |
| テストファイル | `apps/desktop/src/main/ipc/__tests__/fallback-handlers.test.ts` | テストコード                         |
| P41            | `.claude/rules/06-known-pitfalls.md`                            | v8カバレッジのインライン関数カウント |

### システム仕様（aiworkflow-requirements）

- `references/development-guidelines.md` - カバレッジ基準の正本

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

1. カバレッジ付きテスト実行
2. レポートの Line/Branch/Function カバレッジを記録
3. 最低基準と照合
4. PASS → Phase 8、FAIL → Phase 6 に戻り
5. P41（v8カバレッジのインライン関数カウント）を考慮して、低い Function Coverage が真のギャップか計測上の問題かを判別

## 統合テスト連携

- fallback ハンドラ追加で触れた `ipc/index.ts` とテストファイルの line / branch をまとめて確認する
- Phase 6 で追加した件数同期テストが branch coverage 改善に寄与しているかを評価する
- Phase 11 の手動テストへ進める水準として、代表的な fallback 分岐が自動テストで押さえられていることを確認する

## 成果物

| 成果物             | パス                                           | 説明     |
| ------------------ | ---------------------------------------------- | -------- |
| カバレッジレポート | コンソール出力（スクリーンショットまたはログ） | 計測結果 |

## 完了条件

- [ ] カバレッジ計測が完了
- [ ] 全指標が最低基準（Line 80%/Branch 60%/Function 80%）以上
- [ ] P41を考慮したFunction Coverageの妥当性確認済み
- [ ] ゲート判定（PASS/FAIL）が記録済み

## 次のPhase

Phase 8: リファクタリング（PASS時）
Phase 6: テスト拡充（FAIL時）
