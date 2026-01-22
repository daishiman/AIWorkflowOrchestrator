# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 7                           |
| Phase名    | カバレッジ確認              |
| 前提Phase  | Phase 6（テスト拡充）       |
| 後続Phase  | Phase 8（リファクタリング） |
| ステータス | 未実施                      |
| 作成日     | 2026-01-22                  |
| 機能名     | React Context DI実装        |

---

## 目的

テストカバレッジ目標を検証し、統合テストを実行してゲート判定を行う。

## 背景

Phase 6でテストを拡充した。本Phaseでは、カバレッジ目標（Line 80%、Branch 60%、Function 80%）を達成しているかを検証し、不足があればPhase 6に戻る。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: カバレッジ計測実行

**目的**: テストカバレッジを計測し、目標達成状況を確認する。

**実行手順**:

1. カバレッジ付きでテストを実行:

   ```bash
   pnpm --filter @repo/desktop test -- --coverage apps/desktop/src/features/chat-history/
   ```

2. 以下のカバレッジ指標を確認:

   | 指標              | 最低基準 | 推奨基準 | 実測値 |
   | ----------------- | -------- | -------- | ------ |
   | Line Coverage     | 80%      | 90%      | ?%     |
   | Branch Coverage   | 60%      | 70%      | ?%     |
   | Function Coverage | 80%      | 90%      | ?%     |

3. カバレッジ結果を `outputs/phase-7/coverage-final.md` に記録

**期待される成果物**:

- `outputs/phase-7/coverage-final.md`

---

### タスク2: カバレッジ目標判定

**目的**: カバレッジ目標を達成しているかを判定する。

**実行手順**:

1. 以下の判定基準に従って判定:

   | 判定 | 条件                         | 次のアクション |
   | ---- | ---------------------------- | -------------- |
   | PASS | 全指標が最低基準以上         | Phase 8へ進む  |
   | FAIL | いずれかの指標が最低基準未満 | Phase 6に戻る  |

2. 判定結果を `outputs/phase-7/coverage-verdict.md` に記録

**期待される成果物**:

- `outputs/phase-7/coverage-verdict.md`

---

### タスク3: 統合テスト実行

**目的**: 統合テストを実行し、全体の動作を確認する。

**実行手順**:

1. 統合テストを実行:

   ```bash
   pnpm --filter @repo/desktop test -- --run apps/desktop/src/features/chat-history/__tests__/ChatHistoryIntegration.test.tsx
   ```

2. テスト結果を確認
3. 統合テスト結果を `outputs/phase-7/integration-test-result.md` に記録

**期待される成果物**:

- `outputs/phase-7/integration-test-result.md`

---

### タスク4: 全テスト実行

**目的**: 全テストを実行し、リグレッションがないことを確認する。

**実行手順**:

1. 全テストを実行:

   ```bash
   pnpm --filter @repo/desktop test -- --run
   ```

2. 全テストが成功することを確認
3. テスト結果を `outputs/phase-7/all-tests-result.md` に記録

**期待される成果物**:

- `outputs/phase-7/all-tests-result.md`

---

### タスク5: カバレッジ未達時の対応（該当する場合）

**目的**: カバレッジ未達時に追加テストを特定し、Phase 6に戻る準備をする。

**実行手順**:

1. カバレッジ未達の場合:
   - 未カバーのコード行を特定
   - 必要な追加テストを一覧化
   - Phase 6に戻る

2. 未達時の対応を `outputs/phase-7/uncovered-analysis.md` に記録（該当時のみ）

**期待される成果物**:

- `outputs/phase-7/uncovered-analysis.md`（カバレッジ未達時のみ）

---

### タスク6: ゲート判定レポート作成

**目的**: Phase 7のゲート判定レポートを作成する。

**実行手順**:

1. タスク1〜5の結果を集約
2. ゲート判定レポートを `outputs/phase-7/gate-verdict.md` に作成
3. 以下のセクションを含める:
   - カバレッジ結果サマリー
   - 統合テスト結果サマリー
   - 全テスト結果サマリー
   - 最終判定（PASS/FAIL）

**期待される成果物**:

- `outputs/phase-7/gate-verdict.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> テストカバレッジ確認時に以下のシステム仕様を参照し、テスト網羅性を確認してください。

| 参照資料             | パス                                                                             | 内容                   |
| -------------------- | -------------------------------------------------------------------------------- | ---------------------- |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`   | 型定義・Repository IF  |
| アーキテクチャ仕様   | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md` | Clean Architecture構成 |

### 前Phase成果物

| 参照資料           | パス                                  | 内容              |
| ------------------ | ------------------------------------- | ----------------- |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`  | Phase 6カバレッジ |
| 追加テスト一覧     | `outputs/phase-6/additional-tests.md` | 追加テスト記録    |

---

## 成果物

| 成果物         | パス                                         | 内容               |
| -------------- | -------------------------------------------- | ------------------ |
| 最終カバレッジ | `outputs/phase-7/coverage-final.md`          | カバレッジ計測結果 |
| カバレッジ判定 | `outputs/phase-7/coverage-verdict.md`        | 目標達成判定       |
| 統合テスト結果 | `outputs/phase-7/integration-test-result.md` | 統合テスト結果     |
| 全テスト結果   | `outputs/phase-7/all-tests-result.md`        | 全テスト結果       |
| ゲート判定     | `outputs/phase-7/gate-verdict.md`            | 最終判定レポート   |

---

## 統合テスト連携（Phase 7は必須）

統合テストの再実行とゲート判定:

- 統合テストが全て成功すること
- カバレッジ目標を達成していること
- 全テストがリグレッションなく成功すること

---

## 完了条件

- [ ] タスク1: カバレッジ計測実行完了
- [ ] タスク2: カバレッジ目標判定完了（PASS）
- [ ] タスク3: 統合テスト実行完了（全成功）
- [ ] タスク4: 全テスト実行完了（全成功）
- [ ] タスク6: ゲート判定レポート作成完了
- [ ] 全成果物が `outputs/phase-7/` に出力されている
- [ ] Line Coverage ≥ 80%
- [ ] Branch Coverage ≥ 60%
- [ ] Function Coverage ≥ 80%

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## ゲート判定基準

| 判定 | 条件                              | 次のアクション |
| ---- | --------------------------------- | -------------- |
| PASS | カバレッジ目標達成 & 全テスト成功 | Phase 8へ進む  |
| FAIL | カバレッジ未達 or テスト失敗      | Phase 6に戻る  |

---

## 依存関係

- **前提**: Phase 6（テスト拡充）が完了していること
- **後続**: Phase 8（リファクタリング）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/react-context-di/phase-8-refactoring.md`
