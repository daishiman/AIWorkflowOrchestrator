# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | UT-FIX-DEBUG-CLEAR-STORAGE-SHIM-CLEANUP-001 |
| Phase      | 7                                           |
| Phase名    | カバレッジ確認                              |
| カテゴリ   | 改善                                        |
| ステータス | not_started                                 |
| 前提Phase  | Phase 6                                     |
| 後続Phase  | Phase 8                                     |

## 目的

Phase 4（テスト作成）+ Phase 6（テスト拡充）で作成した全テストのカバレッジを計測し、プロジェクトのカバレッジ基準を充足していることを確認する。基準未達の場合は Phase 6 へ戻り追加テストを作成する。

## 実行タスク

- タスク1: カバレッジ計測を実施する
- タスク2: カバレッジ基準との差分を分析する
- タスク3: ゲート判定を行い、Phase 8 への進行可否を決定する

### タスク1: カバレッジ計測

**目的**: Phase 5 で変更した全ファイルと、Phase 4/6 で作成した全テストのカバレッジを正確に計測する

**手順**:

1. テスト実行ディレクトリで Vitest カバレッジを実行する（P40 準拠）:
   ```bash
   cd apps/desktop && pnpm vitest run --coverage
   ```
2. Phase 5 で変更した各ファイルのカバレッジを個別に確認する
3. Phase 4/6 で作成したテストファイル自体のカバレッジも確認する
4. カバレッジレポートを記録する

**計測対象ファイル**:

| #   | ファイル                                | 変更内容                             |
| --- | --------------------------------------- | ------------------------------------ |
| 1   | `apps/desktop/e2e/global-setup.ts`      | `debug-clear-storage` 関連コード削除 |
| 2   | screenshot script（Phase 1 棚卸し結果） | storage clear 前提コード削除         |
| 3   | `.claude/skills/` 配下の該当ファイル群  | workaround 説明更新                  |

**計測対象テストファイル**:

| #   | テストファイル                                                         | Phase |
| --- | ---------------------------------------------------------------------- | ----- |
| 1   | `apps/desktop/src/__tests__/debug-clear-storage-remnant.test.ts`       | 4     |
| 2   | `apps/desktop/src/__tests__/e2e-global-setup-no-debug-storage.test.ts` | 4     |
| 3   | `apps/desktop/src/__tests__/no-unintended-localstorage-clear.test.ts`  | 4     |
| 4   | `apps/desktop/src/__tests__/e2e-preflight-integration.test.ts`         | 6     |
| 5   | `apps/desktop/src/__tests__/screenshot-no-storage-clear.test.ts`       | 6     |
| 6   | `apps/desktop/src/__tests__/auth-bypass-regression.test.ts`            | 6     |

### タスク2: カバレッジ基準差分分析

**目的**: 計測結果とカバレッジ基準を比較し、不足箇所を特定する

**カバレッジ基準**:

| 指標              | 最低基準 | 推奨基準 | 判定         |
| ----------------- | -------- | -------- | ------------ |
| Line Coverage     | 80%      | 90%      | 最低基準必達 |
| Branch Coverage   | 60%      | 70%      | 最低基準必達 |
| Function Coverage | 80%      | 90%      | 最低基準必達 |

**分析手順**:

1. 各ファイルの Line / Branch / Function Coverage を一覧化する
2. 最低基準（Line 80%、Branch 60%、Function 80%）を下回るファイルを特定する
3. 下回るファイルについて、カバーされていないコードパスを列挙する
4. 追加テストが必要な箇所を具体的に記録する

**分析結果テーブル形式**:

| ファイル | Line | Branch | Function | 最低基準充足 | 不足箇所 |
| -------- | ---- | ------ | -------- | ------------ | -------- |
| (対象)   | N%   | N%     | N%       | OK/NG        | (詳細)   |

### タスク3: ゲート判定

**目的**: カバレッジ基準を満たしているかを判定し、次 Phase への進行可否を決定する

**判定基準**:

| 判定 | 条件                        | 対応                               |
| ---- | --------------------------- | ---------------------------------- |
| PASS | 全ファイルが最低基準を充足  | Phase 8 へ進む                     |
| FAIL | 1ファイル以上が最低基準未達 | Phase 6 へ戻り追加テストを作成する |

**FAIL 時の対応手順**:

1. カバレッジ不足箇所の一覧を Phase 6 に引き渡す
2. 不足箇所に対応するテストケースを設計する
3. Phase 6 → Phase 7 のサイクルを基準充足まで繰り返す
4. サイクル回数の上限は3回とし、3回目で未達の場合は理由を記録して Phase 8 へ進む

**注意事項**:

- 本タスクは主にコードの削除とドキュメントの降格が中心であるため、新規コードのカバレッジ対象は限定的
- 静的解析テスト（ソースコード内の文字列パターン検証）はカバレッジ計測の対象外になる場合がある
- その場合は「テストが PASS すること」をカバレッジの代替指標として使用する

## 参照資料

| 参照資料       | パス                           | 説明       |
| -------------- | ------------------------------ | ---------- |
| Phase 4 成果物 | Phase 4 のテストファイル群     | 基本テスト |
| Phase 5 成果物 | Phase 5 で変更されたファイル群 | 実装結果   |
| Phase 6 成果物 | Phase 6 のテストファイル群     | 拡充テスト |

### システム仕様（aiworkflow-requirements）

> カバレッジ基準の判定に以下のシステム仕様を参照してください。

| 参照資料       | パス                                                                         | 内容                           |
| -------------- | ---------------------------------------------------------------------------- | ------------------------------ |
| 品質要件       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | テストカバレッジ基準・TDD 方針 |
| カバレッジ基準 | `.claude/skills/task-specification-creator/references/coverage-standards.md` | カバレッジ最低基準・推奨基準   |
| 教訓集         | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`       | P41（v8 カバレッジプロバイダ） |

## 統合テスト連携

- PASS の場合: Phase 8（リファクタリング）で Phase 4/6 のテストを回帰テストとして活用する
- FAIL の場合: Phase 6 に戻り、不足箇所のテストを追加した後、再度本 Phase を実行する
- P41（v8 カバレッジプロバイダのインライン関数カウント）に注意し、カバレッジ低下の原因が本質的なテスト不足かプロバイダの特性かを区別する

## 成果物

| 成果物             | パス                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------- |
| カバレッジレポート | `pnpm --filter @repo/desktop exec vitest run --coverage` の実行結果                       |
| 差分分析結果       | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-7/coverage-analysis.md` |
| ゲート判定結果     | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-7/gate-decision.md`     |

## 完了条件

- [ ] 全計測対象ファイルのカバレッジが計測されていること
- [ ] カバレッジ基準との差分分析が完了していること
- [ ] ゲート判定（PASS/FAIL）が記録されていること
- [ ] PASS の場合: 全ファイルが Line 80%以上、Branch 60%以上、Function 80%以上であること
- [ ] FAIL の場合: 不足箇所の一覧が Phase 6 に引き渡されていること
- [ ] 全テストが `pnpm --filter @repo/desktop exec vitest run` で PASS すること（P40 準拠）
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

- **PASS**: Phase 8: リファクタリングへ進む
- **FAIL**: Phase 6: テスト拡充へ戻る（不足箇所のテスト追加）
