# Phase 6 成果物: カバレッジレポート

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| タスクID   | TASK-9B            |
| Phase      | 6                  |
| 成果物     | カバレッジレポート |
| 作成日     | 2026-02-26         |
| ステータス | 完了               |

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 最終カバレッジ結果

### ファイル別カバレッジ

| ファイル                | % Stmts | % Branch | % Funcs | % Lines | 判定 |
| ----------------------- | ------- | -------- | ------- | ------- | ---- |
| **All files**           | 90.26   | 85.86    | 100     | 90.26   | PASS |
| **ipc/**                |         |          |         |         |      |
| skillCreatorHandlers.ts | 81.18   | 74.25    | 100     | 81.18   | PASS |
| **services/skill/**     |         |          |         |         |      |
| ApiIntegrator.ts        | 92.15   | 87.5     | 100     | 92.15   | PASS |
| CodeGenerator.ts        | 97.01   | 90.9     | 100     | 97.01   | PASS |
| HearingFacilitator.ts   | 94.23   | 87.09    | 100     | 94.23   | PASS |
| SkillCreatorService.ts  | 94.13   | 86.77    | 100     | 94.13   | PASS |
| SkillValidator.ts       | 97.91   | 96.55    | 100     | 97.91   | PASS |
| TaskGenerator.ts        | 100     | 96.36    | 100     | 100     | PASS |

### 基準充足状況

| 指標              | 結果   | 最低基準 | 推奨基準 | 判定     |
| ----------------- | ------ | -------- | -------- | -------- |
| Line Coverage     | 90.26% | 80%      | 90%      | 推奨達成 |
| Branch Coverage   | 85.86% | 60%      | 70%      | 推奨達成 |
| Function Coverage | 100%   | 80%      | 90%      | 推奨達成 |

## カバレッジ推移

### Phase 5 終了時（初期測定）

| ファイル                | % Lines | % Branch | % Funcs |
| ----------------------- | ------- | -------- | ------- |
| skillCreatorHandlers.ts | 47.03   | 59.09    | 90      |
| ApiIntegrator.ts        | 0       | 0        | 0       |
| CodeGenerator.ts        | 0       | 0        | 0       |
| HearingFacilitator.ts   | 0       | 0        | 0       |
| SkillCreatorService.ts  | 93.15   | 84.16    | 100     |
| SkillValidator.ts       | 0       | 0        | 0       |
| TaskGenerator.ts        | 0       | 0        | 0       |

### 0%カバレッジの原因

Phase 4（テスト作成）で作成されたサブコンポーネントテストは `vi.fn()` によるモックオブジェクトのみを使用しており、実クラスを import していなかった。テストとしては PASS するが、v8 カバレッジプロバイダの対象にならないためカバレッジ 0% となっていた。

### Phase 6 テスト書き換え後

テストファイルを実クラス import に書き換え、以下のテストを追加:

- HF-EX-001/002: 複数機能抽出、空制約処理
- TG-EX-001/002: 15機能→15タスク生成、独立タスクの1グループ化
- CG-EX-001/002: SDK タイムアウト、未定義変数残存
- VL-EX-001/002: セキュリティ検証でのパストラバーサル、null データ
- AI-001~008: ApiIntegrator 新規テスト（REST、Webhook、認証設定）
- SC-EX-001~010: SkillCreatorService 拡張テスト
- IPC-EX-001~005: IPCハンドラ拡張テスト
- IPC-SP-001~023: IPCハンドラ成功パス・エラーパス・catch ブロック
- INT-EX-001~004: 統合テスト拡張

## テスト結果サマリー

| テストファイル                          | テスト数 | 結果                        |
| --------------------------------------- | -------- | --------------------------- |
| SkillCreatorService.test.ts             | 52       | 全PASS                      |
| HearingFacilitator.test.ts              | 12       | 全PASS                      |
| TaskGenerator.test.ts                   | 12       | 全PASS                      |
| CodeGenerator.test.ts                   | 11       | 全PASS                      |
| Validator.test.ts                       | 16       | 全PASS                      |
| ApiIntegrator.test.ts                   | 8        | 全PASS                      |
| skillCreatorHandlers.validation.test.ts | 40       | 全PASS                      |
| SkillCreatorService.integration.test.ts | 19       | 15PASS / 4FAIL（Red-state） |
| **合計**                                | **170**  | **166 PASS / 4 FAIL**       |

### Red-state 統合テスト（Phase 5 からの継続）

| テストID | 失敗理由                                                           |
| -------- | ------------------------------------------------------------------ |
| INT-001  | createSkill の create モードが実スクリプト（ScriptExecutor）を要求 |
| INT-002  | executeTasks が実タスクファイルの ScriptExecutor 実行を要求        |
| INT-003  | INT-002 と同様（エラーリカバリシナリオ）                           |
| INT-004  | executeTasks のドライラン実行が estimatedTime を未設定で返す       |

## Uncovered Lines 分析

| ファイル                | 未カバー行              | 原因                                          |
| ----------------------- | ----------------------- | --------------------------------------------- |
| skillCreatorHandlers.ts | 577-578, 608-609        | share/schedule ハンドラの一部分岐             |
| ApiIntegrator.ts        | 80-81, 104-105          | ScriptExecutor 実行後の結果パース分岐         |
| CodeGenerator.ts        | 106-107                 | ScriptExecutor 実行後のエラー分岐             |
| HearingFacilitator.ts   | 105-106, 130-131        | 回答バリデーション内部の細かい分岐            |
| SkillCreatorService.ts  | 549-550, 696-703        | タスク実行の細かいエラーパス                  |
| SkillValidator.ts       | 61-62                   | validateStructure の fs.access 内部エラー分岐 |
| TaskGenerator.ts        | 159, 190（Branch のみ） | 分岐条件のフォールバックパス                  |
