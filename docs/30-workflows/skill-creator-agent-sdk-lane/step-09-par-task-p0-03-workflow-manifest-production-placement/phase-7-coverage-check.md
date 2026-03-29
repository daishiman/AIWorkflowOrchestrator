# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 7                                      |
| 機能名   | workflow-manifest-production-placement |
| 作成日   | 2026-03-29                             |
| タスクID | TASK-P0-03                             |

## 目的

manifest の全フィールドが受入基準とテストケースでカバーされているかを確認する。未カバーの論点を洗い出す。

## 実行タスク

- manifest フィールド coverage: manifest JSON の全フィールドが AC またはテストケースに対応しているかを確認する
- AC coverage matrix: AC-1 から AC-6 と対応するテストケース・検証方法の対応表を作る
- uncovered risk 抽出: カバレッジ外の論点を洗い出す

## 参照資料

| 資料名                 | パス                                                  | 説明              |
| ---------------------- | ----------------------------------------------------- | ----------------- |
| phase-1 requirements   | `phase-1-requirements.md`                             | AC 一覧           |
| phase-4 test creation  | `phase-4-test-creation.md`                            | テストケース      |
| phase-5 implementation | `phase-5-implementation.md`                           | 実装済み manifest |
| phase-6 test expansion | `phase-6-test-expansion.md`                           | 追加テスト        |
| workflow-manifest.json | `.agents/skills/skill-creator/workflow-manifest.json` | 検証対象          |

## カバレッジ確認内容

### manifest フィールド coverage

| フィールド           | AC   | テストケース | カバー状況 |
| -------------------- | ---- | ------------ | ---------- |
| schemaVersion        | AC-5 | TC-02        | 確認対象   |
| workflowId           | AC-2 | TC-01        | 確認対象   |
| phases[].id          | AC-4 | TC-04        | 確認対象   |
| phases[].title       | AC-4 | TC-04        | 確認対象   |
| phases[].entryHookId | AC-6 | TC-06        | 確認対象   |
| phases[].exitHookId  | AC-6 | TC-07        | 確認対象   |
| phases[].dependsOn   | AC-4 | EC-01        | 確認対象   |
| phases[].resourceIds | AC-3 | TC-03        | 確認対象   |
| resources[].id       | AC-3 | TC-03        | 確認対象   |
| resources[].kind     | AC-3 | EC-02        | 確認対象   |
| resources[].path     | AC-3 | TC-03        | 確認対象   |
| resources[].phaseIds | AC-3 | TC-03        | 確認対象   |
| entry[].id           | AC-6 | TC-05, TC-06 | 確認対象   |
| entry[].command      | AC-6 | EC-03        | 確認対象   |
| exit[].id            | AC-6 | TC-05, TC-07 | 確認対象   |
| exit[].command       | AC-6 | EC-03        | 確認対象   |

### AC coverage matrix

| AC   | テストケース        | 検証方法                  |
| ---- | ------------------- | ------------------------- |
| AC-1 | TC-01               | ファイル存在確認          |
| AC-2 | TC-01               | loadManifest() エラーなし |
| AC-3 | TC-03               | resource path 実在確認    |
| AC-4 | TC-04               | phases.length >= 5        |
| AC-5 | TC-02               | schemaVersion === 1       |
| AC-6 | TC-05, TC-06, TC-07 | hooks 定義と参照整合      |

## 実行手順

### ステップ1: manifest フィールド coverage を確認する

manifest の全フィールドに対応する AC またはテストケースを紐づける。

### ステップ2: AC coverage matrix を完成させる

AC-1 から AC-6 の検証手段が全て定義されていることを確認する。

### ステップ3: uncovered risk を記録する

カバレッジ外の論点（runtime での manifest 読み込みパス等）を列挙する。

## 統合テスト連携

| 観点        | 実施内容                           |
| ----------- | ---------------------------------- |
| field cover | 全 manifest フィールドに test あり |
| AC cover    | 全 AC に検証方法あり               |
| risk        | カバレッジ外の論点の記録           |

## 多角的チェック観点

| 観点       | この Phase で確認する内容                                      |
| ---------- | -------------------------------------------------------------- |
| 網羅性     | manifest の全フィールドにテストが紐づいているか                |
| 証跡性     | 各 AC の判定根拠が追跡可能か                                   |
| リスク認識 | runtime 統合（TASK-P0-04）で必要な追加テストが識別されているか |

## サブタスク管理

1. manifest フィールド coverage 確認
2. AC coverage matrix 完成
3. uncovered risk 抽出
4. Phase 8 input 整理

## 成果物

| 成果物          | パス                                 | 説明             |
| --------------- | ------------------------------------ | ---------------- |
| coverage matrix | `outputs/phase-7/coverage-matrix.md` | フィールド対応表 |
| AC coverage     | `outputs/phase-7/ac-coverage.md`     | AC 検証方法対応  |
| uncovered risks | `outputs/phase-7/uncovered-risks.md` | カバレッジ外論点 |

## 完了条件

- [ ] manifest フィールド coverage が完成している
- [ ] AC coverage matrix が完成している
- [ ] uncovered risk が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] Phase 1 を参照した
- [ ] Phase 4 を参照した
- [ ] Phase 6 を参照した
- [ ] coverage matrix を作成した

## 次のPhase

Phase 8: リファクタリング
