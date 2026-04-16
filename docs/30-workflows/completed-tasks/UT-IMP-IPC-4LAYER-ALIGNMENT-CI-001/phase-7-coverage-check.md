# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 7                                  |
| Phase名    | カバレッジ確認                     |
| 前提Phase  | Phase 6                            |
| 後続Phase  | Phase 8                            |
| ステータス | 未実施                             |
| 作成日     | 2026-04-14                         |
| 機能名     | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 |
| タスク分類 | 改善（NON_VISUAL）                 |

---

## 目的

`scripts/verify-ipc-4layer.js` および関連モジュール（パーサー / バリデーター / レポーター）のテストカバレッジを計測し、未到達コードパスを特定する。Line 80%+、Branch 60%+、Function 80%+ のカバレッジ基準を満たしていることを確認し、未達の場合は Phase 6 へ戻りテストを補完する。

## 背景

Phase 6 で追加・拡充したユニットテストが、検証スクリプトの主要コードパスを十分にカバーしているかを定量的に確認する。IPC 4層整合検証スクリプトは正規表現ベースの静的解析であり、正常系だけでなく異常系（不正フォーマット、空ファイル、動的チャネル生成パターン）のブランチカバレッジが特に重要である。カバレッジの可視化により、見落としているエッジケースや未テストのエラーハンドリングパスを早期に発見する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。
>
> **Task / Step 分離ルール**
>
> - このセクションには plan のみを書く。
> - 実行結果、判定、取得値は `Phase実行記録` または `outputs/phase-7/` 配下の成果物へ記録する。

### タスク1: カバレッジ計測計画の策定

**目的**: カバレッジ計測対象ファイルと計測コマンドを明確化する

**実行手順**:

1. カバレッジ計測対象ファイルを一覧化する
   - `scripts/verify-ipc-4layer.js`（メインエントリポイント）
   - パーサーモジュール群（sharedChannelParser / preloadWhitelistParser / mainHandlerParser / rendererSinkParser）
   - バリデーターモジュール群（sharedToPreloadValidator / preloadToMainValidator / rendererToSharedValidator）
   - レポーターモジュール
2. Vitest の `--coverage` オプションと `--coverage.include` 指定パターンを確定する
3. カバレッジレポーターのフォーマット（text / lcov / html）を決定する

**期待される成果物**:

- カバレッジ計測計画（`outputs/phase-7/coverage-plan.md`）

---

### タスク2: カバレッジ計測の実行

**目的**: 実際にカバレッジ計測を行い、定量データを取得する

**実行手順**:

1. Phase 6 で作成した全テストファイルを対象に、カバレッジ付きでテスト実行する
2. 以下のカバレッジ指標を計測する

| 指標              | 最低基準 | 推奨基準 | 計測結果 |
| ----------------- | -------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      | TBD      |
| Branch Coverage   | 60%      | 70%      | TBD      |
| Function Coverage | 80%      | 90%      | TBD      |

3. モジュール別のカバレッジ内訳を記録する

| モジュール                   | Line | Branch | Function | 判定 |
| ---------------------------- | ---- | ------ | -------- | ---- |
| verify-ipc-4layer.js（全体） | TBD  | TBD    | TBD      | TBD  |
| sharedChannelParser          | TBD  | TBD    | TBD      | TBD  |
| preloadWhitelistParser       | TBD  | TBD    | TBD      | TBD  |
| mainHandlerParser            | TBD  | TBD    | TBD      | TBD  |
| rendererSinkParser           | TBD  | TBD    | TBD      | TBD  |
| sharedToPreloadValidator     | TBD  | TBD    | TBD      | TBD  |
| preloadToMainValidator       | TBD  | TBD    | TBD      | TBD  |
| rendererToSharedValidator    | TBD  | TBD    | TBD      | TBD  |
| reporter                     | TBD  | TBD    | TBD      | TBD  |

**期待される成果物**:

- トレーサビリティ付きカバレッジレポート（`outputs/phase-7/traceability-coverage-report.md`）

---

### タスク3: 未到達コードパス分析

**目的**: カバレッジ未到達のコードパスを特定し、リスク評価を行う

**実行手順**:

1. カバレッジレポートから未到達行・未到達ブランチを抽出する
2. 未到達コードパスを以下の観点で分類する

| 分類       | 説明                                               | 対応方針           |
| ---------- | -------------------------------------------------- | ------------------ |
| MUST_COVER | 検証ロジックの正常系・異常系パス                   | Phase 6 に戻り追加 |
| SHOULD     | エッジケース（空ファイル、不正エンコーディング等） | Phase 6 に戻り追加 |
| ACCEPTABLE | 防御的コード（到達困難なガード節等）               | 理由を記録し許容   |

3. 重点確認対象ブランチを特定する

| ブランチ                                       | 対応テスト | カバー済み |
| ---------------------------------------------- | ---------- | ---------- |
| パーサーがファイル未発見時のエラーハンドリング | TBD        | TBD        |
| 正規表現がマッチしない場合の空集合返却         | TBD        | TBD        |
| バリデーターが差分0件の場合（全整合）          | TBD        | TBD        |
| バリデーターが差分検出の場合（不整合あり）     | TBD        | TBD        |
| レポーターの CRITICAL / WARNING / INFO 分岐    | TBD        | TBD        |
| CI exit code 分岐（exit 0 / exit 1）           | TBD        | TBD        |

**期待される成果物**:

- 未到達コード分析計画（`outputs/phase-7/uncovered-analysis-plan.md`）

---

### タスク4: カバレッジゲート判定

**目的**: Phase 8 へ進行可能かを判定する

**実行手順**:

1. タスク2・タスク3 の結果を集約する
2. 以下の判定基準でゲート判定を行う

| 状態                                         | 判定 | 次のアクション                   |
| -------------------------------------------- | ---- | -------------------------------- |
| 全指標が最低基準以上 + MUST_COVER 未到達なし | PASS | Phase 8 へ進む                   |
| SHOULD 未到達のみ残存                        | PASS | Phase 8 へ（改善項目として記録） |
| いずれかの指標が最低基準未満                 | FAIL | Phase 6 に戻りテスト補完         |
| MUST_COVER 未到達が残存                      | FAIL | Phase 6 に戻りテスト補完         |

3. カバレッジ未達時の対応: 最大2回の反復（Phase 6 → Phase 7）で目標達成を目指す

**期待される成果物**:

- ゲート判定結果（トレーサビリティ付きカバレッジレポートに統合記録）

---

## 参照資料

| 参照資料                     | パス                                             | 内容                |
| ---------------------------- | ------------------------------------------------ | ------------------- |
| Phase 6 テスト実行結果       | `outputs/phase-6/test-execution-result.md`       | 全テスト GREEN 確認 |
| Phase 6 テストケース一覧     | `outputs/phase-6/test-case-list.md`              | テスト件数・分類    |
| Phase 2 テスト戦略           | `outputs/phase-2/test-strategy.md`               | テスト方針          |
| Phase 2 アーキテクチャ設計   | `outputs/phase-2/architecture-design.md`         | モジュール構成      |
| Phase 2 検証アルゴリズム設計 | `outputs/phase-2/validation-algorithm-design.md` | 検証ロジック        |
| Phase 1 要件定義書           | `outputs/phase-1/requirements-definition.md`     | FR/NFR一覧          |
| Phase 1 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`         | AC-1〜AC-8          |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料    | パス                                                                                                                      | 内容                   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| IPC命名監査 | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-ipc-naming.md`          | 命名規則と監査パターン |
| IPC契約監査 | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-ipc-contract-audits.md` | データフロー型ギャップ |

---

## 成果物

| 成果物                                 | パス                                              | 内容                             |
| -------------------------------------- | ------------------------------------------------- | -------------------------------- |
| カバレッジ計測計画                     | `outputs/phase-7/coverage-plan.md`                | 計測対象・コマンド・基準値       |
| トレーサビリティ付きカバレッジレポート | `outputs/phase-7/traceability-coverage-report.md` | 計測結果・モジュール別内訳・判定 |
| 未到達コード分析計画                   | `outputs/phase-7/uncovered-analysis-plan.md`      | 未到達パス分類・リスク評価       |

---

## 統合テスト連携（Phase 1〜11は必須）

- カバレッジ計測対象: `verify-ipc-4layer.js` の全モジュール（パーサー / バリデーター / レポーター）が4層ファイルを正しく解析する統合パスを含む
- CI環境再現: GitHub Actions 環境でのカバレッジ計測が可能な構成であることを確認する
- 既存スクリプト共存: `check-ipc-contracts.ts` のカバレッジとは独立して計測する

---

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] カバレッジ計測を実行済みであること
- [ ] Line Coverage が 80% 以上であること
- [ ] Branch Coverage が 60% 以上であること
- [ ] Function Coverage が 80% 以上であること
- [ ] MUST_COVER 分類の未到達コードパスが0件であること
- [ ] モジュール別カバレッジ内訳が記録されていること
- [ ] ゲート判定（PASS/FAIL）が確定していること
- [ ] 本Phase内の全タスクを100%実行完了

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 6 が完了していること
- **後続**: Phase 8 へ進む
- **カバレッジ未達時**: Phase 6 に戻りテスト補完後、再度 Phase 7 を実行する（最大2回反復）

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 7 実行記録

### 実行タスク

- タスク1 カバレッジ計測計画の策定: {{result}}
- タスク2 カバレッジ計測の実行: {{result}}
- タスク3 未到達コードパス分析: {{result}}
- タスク4 カバレッジゲート判定: {{result}}

### カバレッジ計測結果サマリ

| 指標     | 結果  | 基準 | 判定    |
| -------- | ----- | ---- | ------- |
| Line     | {{%}} | 80%+ | {{P/F}} |
| Branch   | {{%}} | 60%+ | {{P/F}} |
| Function | {{%}} | 80%+ | {{P/F}} |

### ゲート判定結果

- 判定: {{PASS/FAIL}}
- 未到達コードパス（MUST_COVER）: {{0件/N件}}
- 反復回数: {{1回目/2回目}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001/phase-8-refactoring.md`
