# Phase 4: テスト作成

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 4                                      |
| 機能名   | workflow-manifest-production-placement |
| 作成日   | 2026-03-29                             |
| タスクID | TASK-P0-03                             |

## 目的

Phase 5 実装前に、workflow-manifest.json が ManifestLoader.loadManifest() の検証を通過することを確認する統合テストを定義する。

## 実行タスク

- 統合テスト定義: ManifestLoader.loadManifest() を使用して本番 manifest を読み込むテストを作成する
- expected result 定義: 各 AC に対応する PASS 条件を定義する
- failure case 定義: manifest が不正な場合の検証失敗パターンを整理する

## 参照資料

| 資料名                | パス                                                                                                 | 説明               |
| --------------------- | ---------------------------------------------------------------------------------------------------- | ------------------ |
| phase-1 requirements  | `phase-1-requirements.md`                                                                            | AC と FR           |
| phase-2 design        | `phase-2-design.md`                                                                                  | manifest 構造設計  |
| phase-3 review        | `phase-3-design-review.md`                                                                           | gate decision      |
| ManifestLoader        | `apps/desktop/src/main/services/runtime/ManifestLoader.ts`                                           | 検証ロジック       |
| 既存テスト            | `apps/desktop/src/main/services/runtime/__tests__/fixtures/workflow-manifest/workflow-manifest.json` | テストフィクスチャ |
| ManifestLoader テスト | `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.test.ts`                            | 既存テストパターン |

## テスト設計

### テストケース一覧

| ID    | テストケース                               | 対応 AC | PASS 条件                                        |
| ----- | ------------------------------------------ | ------- | ------------------------------------------------ |
| TC-01 | 本番 manifest を loadManifest() で読み込む | AC-1,2  | エラーなしで WorkflowManifest オブジェクトを返す |
| TC-02 | schemaVersion が 1 であることを検証する    | AC-5    | manifest.schemaVersion === 1                     |
| TC-03 | 全 resource の path が実在ファイルを指す   | AC-3    | 全 resource.path が fs.existsSync() で true      |
| TC-04 | phases が 5 phase を含む                   | AC-4    | phases.length >= 5                               |
| TC-05 | entry/exit hooks が定義されている          | AC-6    | entry.length > 0 && exit.length > 0              |
| TC-06 | phase の entryHookId が entry[] に存在する | AC-6    | 全 phase.entryHookId が entry[].id に一致        |
| TC-07 | phase の exitHookId が exit[] に存在する   | AC-6    | 全 phase.exitHookId が exit[].id に一致          |

### failure case 一覧

| ID    | 失敗パターン                        | 期待動作                        |
| ----- | ----------------------------------- | ------------------------------- |
| FC-01 | schemaVersion が 2 の場合           | validation error がスローされる |
| FC-02 | phases が空配列の場合               | validation error がスローされる |
| FC-03 | resource.path が存在しないファイル  | Phase 9 品質保証で検出される    |
| FC-04 | entryHookId が entry[] に存在しない | validation error がスローされる |

## 実行手順

### ステップ1: テストファイル構成を決定する

既存の ManifestLoader テストパターンに倣い、本番 manifest 用の統合テストファイルを計画する。

### ステップ2: テストケースを実装する

TC-01 から TC-07 のテストケースを Vitest で記述する。

### ステップ3: failure case を定義する

FC-01 から FC-04 の失敗パターンに対する期待動作を整理する。

## 統合テスト連携

| 観点                | 実施内容                                   |
| ------------------- | ------------------------------------------ |
| ManifestLoader 互換 | 既存テストパターンと同じ assert 手法を使う |
| AC coverage         | 全 AC にテストケースが対応していること     |
| path validation     | 実在ファイルの存在確認を含めること         |

## 多角的チェック観点

| 観点     | この Phase で確認する内容                            |
| -------- | ---------------------------------------------------- |
| 分析思考 | テストケースが AC に対応しているか                   |
| 反証思考 | false positive（不正 manifest が通る）を見逃さないか |
| 再現性   | 別環境でも同じ結果になるテストか                     |

## サブタスク管理

1. テストファイル構成決定
2. テストケース TC-01 から TC-07 の定義
3. failure case FC-01 から FC-04 の定義
4. Phase 5 input 整理

## 成果物

| 成果物        | パス                               | 説明             |
| ------------- | ---------------------------------- | ---------------- |
| test matrix   | `outputs/phase-4/test-matrix.md`   | テストケース一覧 |
| test plan     | `outputs/phase-4/test-plan.md`     | テスト実行計画   |
| failure cases | `outputs/phase-4/failure-cases.md` | 失敗パターン定義 |

## 完了条件

- [ ] テストケース TC-01 から TC-07 が定義されている
- [ ] failure case FC-01 から FC-04 が定義されている
- [ ] 各テストケースの PASS 条件が明記されている
- [ ] テストファイルの配置先が決定されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] Phase 1 を参照した
- [ ] Phase 2 を参照した
- [ ] Phase 3 を参照した
- [ ] 既存 ManifestLoader テストを確認した

## 次のPhase

Phase 5: 実装
