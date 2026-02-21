# Phase 7: テストカバレッジ確認 - TypeScript @repo/shared モジュール解決エラー修正

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase      | 7                                        |
| 機能名     | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 |
| Phase名    | テストカバレッジ確認                     |
| 前提Phase  | Phase 6 (テスト拡充)                     |
| 次Phase    | Phase 8 (リファクタリング)               |
| 作成日     | 2026-02-20                               |
| ステータス | 未着手                                   |

---

## 目的

Phase 6 で拡充したテストのカバレッジを測定し、プロジェクトのカバレッジ基準を満たしていることを確認する。基準未達の場合は Phase 6 へ戻りテストを追加する。

本タスクは設定ファイル変更（`tsconfig.json`, `package.json` の `exports` フィールド, `vitest.config.ts`）が中心であるため、設定変更に対するテストのカバレッジが十分であることを重点的に確認する。

---

## 実行タスク

- ユニットテストカバレッジ測定: 変更対象ファイルのカバレッジを数値で確認
- 結合テストカバレッジ確認: モジュール解決シナリオの網羅性を確認
- 未カバー箇所の特定と記録: カバレッジレポートから未テストのコードパスを特定
- ゲート判定: 基準達成・未達の判定を実施

| #   | タスク名                     | 目的                                             |
| --- | ---------------------------- | ------------------------------------------------ |
| 1   | ユニットテストカバレッジ測定 | 変更対象ファイルのカバレッジを数値で確認         |
| 2   | 結合テストカバレッジ確認     | モジュール解決シナリオの網羅性を確認             |
| 3   | 未カバー箇所の特定と記録     | カバレッジレポートから未テストのコードパスを特定 |
| 4   | ゲート判定                   | 基準達成・未達の判定を実施                       |

---

## 参照資料

| 参照資料              | パス                                                                                   | 確認内容                    |
| --------------------- | -------------------------------------------------------------------------------------- | --------------------------- |
| Phase 5 成果物        | `phase-5-implementation.md`                                                            | 実装変更点・検証対象        |
| Phase 6 成果物        | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/phase-6-test-expansion.md` | テスト拡充結果              |
| Phase 4 テスト設計    | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/phase-4-test-creation.md`  | テストケース一覧            |
| 品質要件              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`            | カバレッジ基準              |
| DevOps/テスト実行基盤 | `.claude/skills/aiworkflow-requirements/references/technology-devops.md`               | Vitest 実行・カバレッジ運用 |
| コード品質ルール      | `.claude/rules/02-code-quality.md`                                                     | カバレッジ基準テーブル      |

---

## 実行手順

### 1. ユニットテストカバレッジ測定

```bash
# @repo/shared パッケージのカバレッジ測定
cd packages/shared
pnpm vitest run --coverage

# apps/desktop パッケージのカバレッジ測定（モジュール解決関連テスト）
cd apps/desktop
pnpm vitest run --coverage -- src/**/*.test.ts
```

### カバレッジ基準テーブル（ユニットテスト）

| 指標              | 最低基準 | 推奨基準 | 現状 | 判定 |
| ----------------- | -------- | -------- | ---- | ---- |
| Line Coverage     | 80%      | 90%      | -    | -    |
| Branch Coverage   | 60%      | 70%      | -    | -    |
| Function Coverage | 80%      | 90%      | -    | -    |

### 2. 結合テストカバレッジ確認

#### カバレッジ基準テーブル（結合テスト）

| 指標                                             | 目標 | 現状 | 判定 |
| ------------------------------------------------ | ---- | ---- | ---- |
| サブパスエクスポートの解決（全パス）             | 100% | -    | -    |
| TypeScript paths → exports 整合シナリオ          | 100% | -    | -    |
| Vitest alias 整合シナリオ                        | 100% | -    | -    |
| 異常系シナリオ（不正パス、存在しないモジュール） | 80%+ | -    | -    |

```bash
# 結合テスト（モジュール解決の統合動作確認）
cd apps/desktop
pnpm vitest run --coverage -- src/**/*.integration.test.ts

# @repo/shared ビルド後のモジュール解決テスト
cd packages/shared
pnpm build && pnpm vitest run
```

### 3. 未カバー箇所の特定

カバレッジレポートから未テストのコードパスを特定し、以下に記録する：

| ファイル | 行番号 | 未カバー理由 | 対応方針 |
| -------- | ------ | ------------ | -------- |
| -        | -      | -            | -        |

### 4. カバレッジレポートファイル別確認

| ファイル                           | Lines | Branches | Functions |
| ---------------------------------- | ----- | -------- | --------- |
| `packages/shared/package.json`     | N/A   | N/A      | N/A       |
| `packages/shared/tsconfig.json`    | N/A   | N/A      | N/A       |
| `apps/desktop/tsconfig.json`       | N/A   | N/A      | N/A       |
| `apps/desktop/vitest.config.ts`    | -     | -        | -         |
| 関連テストヘルパー・ユーティリティ | -     | -        | -         |

> **注**: 設定ファイル（JSON）はカバレッジ計測対象外。テストによる動作検証で網羅性を確認する。

---

## 統合テスト連携

| 連携観点       | 内容                                                   | 参照先                                                                      |
| -------------- | ------------------------------------------------------ | --------------------------------------------------------------------------- |
| カバレッジ測定 | shared/desktop の実行結果を同一基準で比較する          | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` |
| 実行環境整合   | Vitest 実行方法（作業ディレクトリ/コマンド）を統一する | `.claude/skills/aiworkflow-requirements/references/technology-devops.md`    |

---

## ゲート判定

### 判定基準

| 条件                    | 結果                       |
| ----------------------- | -------------------------- |
| Line Coverage < 80%     | **不合格** → Phase 6へ戻る |
| Branch Coverage < 60%   | **不合格** → Phase 6へ戻る |
| Function Coverage < 80% | **不合格** → Phase 6へ戻る |
| 結合テスト正常系 < 100% | **不合格** → Phase 6へ戻る |
| 全基準達成              | **合格** → Phase 8へ進む   |

### 判定結果

| 項目              | 内容 |
| ----------------- | ---- |
| 判定              | -    |
| Line Coverage     | -    |
| Branch Coverage   | -    |
| Function Coverage | -    |
| 次のアクション    | -    |

---

## 成果物

| 成果物             | 配置先                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| カバレッジレポート | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/outputs/phase-7/coverage-report.md`         |
| 結合テスト結果     | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/outputs/phase-7/integration-test-result.md` |

---

## 完了条件

- [ ] ユニットテスト Line Coverage 80%以上を達成
- [ ] ユニットテスト Branch Coverage 60%以上を達成
- [ ] ユニットテスト Function Coverage 80%以上を達成
- [ ] 結合テスト正常系シナリオ 100%カバー
- [ ] 結合テスト異常系シナリオ 80%以上カバー
- [ ] `pnpm --filter @repo/shared build` が成功する
- [ ] `pnpm --filter @repo/desktop exec vitest run` が全テスト PASS
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

- **合格の場合**: Phase 8（リファクタリング）へ進む
- **不合格の場合**: Phase 6（テスト拡充）へ戻りテストを追加
