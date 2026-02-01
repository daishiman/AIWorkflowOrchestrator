# Phase 7: テストカバレッジ確認

## メタ情報

| 項目   | 値         |
| ------ | ---------- |
| Phase  | 7          |
| 機能名 | TASK-8C-G  |
| 作成日 | 2026-02-01 |

## 目的

Phase 6までに拡充したテストの完全性を確認し、ギャップ分析の全IDがテストでカバーされていることを検証する。

## 実行タスク

- ギャップカバレッジ検証: A1~A10, B1~B9, C1, D1~D3 の全IDに対応するテストが存在することを確認
- テスト全件実行: 全テスト（既存62件+新規）の一括実行と結果確認
- カバレッジレポート作成: テスト結果のレポート化

## 参照資料

| 資料名             | パス                                                                | 説明                 |
| ------------------ | ------------------------------------------------------------------- | -------------------- |
| Phase 4 テスト仕様 | `outputs/phase-04/test-specification.md`                            | テストケース一覧     |
| Phase 5 実装サマリ | `outputs/phase-05/implementation-summary.md`                        | 実装済みフィクスチャ |
| Phase 6 テスト拡充 | `outputs/phase-06/test-expansion-result.md`                         | 追加テスト一覧       |
| ギャップ分析       | `docs/30-workflows/TASK-8C-G/index.md`                              | ギャップID定義       |
| 既存テストファイル | `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts` | テストソース         |

## 実行手順

### 1. ギャップIDカバレッジマトリクス

| ギャップID | テストケース          | フィクスチャ            | ステータス |
| ---------- | --------------------- | ----------------------- | ---------- |
| A1         | TC-076, TC-081        | forbidden-files-skill/  | 未確認     |
| A2         | TC-075, TC-080        | missing-fields-skill/   | 未確認     |
| A3         | TC-077, TC-082        | invalid-name-skill/     | 未確認     |
| A4         | TC-078                | empty-agents-skill/     | 未確認     |
| A5         | TC-069, TC-079        | boundary/invalid-schema | 未確認     |
| A6         | TC-083~TC-086, TC-090 | テスト直接検証          | 未確認     |
| A7         | TC-072                | boundary-skill/         | 未確認     |
| A8         | TC-068                | boundary-skill/agents/  | 未確認     |
| A9         | TC-088, TC-089        | テスト直接検証          | 未確認     |
| A10        | TC-087                | テスト直接検証          | 未確認     |
| B1         | TC-063                | boundary-skill/         | 未確認     |
| B2         | TC-064                | boundary-skill/         | 未確認     |
| B5         | TC-065, TC-066        | boundary-skill/         | 未確認     |
| B6         | TC-070                | boundary-skill/assets/  | 未確認     |
| B7         | TC-071                | boundary-skill/assets/  | 未確認     |
| B9         | TC-067                | boundary-skill/         | 未確認     |
| C1         | TC-075~TC-082         | 複数エラーフィクスチャ  | 未確認     |
| D1         | TC-091, TC-092        | テスト品質改善          | 未確認     |
| D2         | TC-094~TC-096         | テスト品質改善          | 未確認     |
| D3         | TC-093                | テスト品質改善          | 未確認     |

### 2. テスト全件実行

```bash
pnpm vitest run apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts
```

### 3. 未達の場合の対応

カバレッジ未達のギャップIDがある場合、Phase 6へ戻って追加テストを作成する。

## 統合テスト連携

| 判定項目             | 基準 | 結果   |
| -------------------- | ---- | ------ |
| カテゴリA カバレッジ | 100% | 未測定 |
| カテゴリB カバレッジ | 100% | 未測定 |
| カテゴリC カバレッジ | 改善 | 未測定 |
| カテゴリD カバレッジ | 100% | 未測定 |
| テスト全件PASS       | 100% | 未測定 |
| ESLintエラー         | 0件  | 未測定 |

## 成果物

| 成果物             | パス                                  | 説明                   |
| ------------------ | ------------------------------------- | ---------------------- |
| カバレッジレポート | `outputs/phase-07/coverage-report.md` | ギャップカバレッジ結果 |

## 完了条件

- [ ] ギャップ分析の全ID（A1~A10, B1~B9, C1, D1~D3）に対応するテストが存在する
- [ ] 全テストがPASSしている
- [ ] ESLintエラーが0件である
- [ ] カバレッジレポートが作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 8: リファクタリング（TDD: Refactor）
