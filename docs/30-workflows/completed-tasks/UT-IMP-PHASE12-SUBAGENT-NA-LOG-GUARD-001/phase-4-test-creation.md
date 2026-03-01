# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目       | 値                                                      |
| ---------- | ------------------------------------------------------- |
| Phase      | 4                                                       |
| 機能名     | UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001                |
| 作成日     | 2026-03-01                                              |
| タスク種別 | Phase 12 運用ガード強化（スクリプト・テンプレート中心） |

## 目的

Phase 12 完了判定の三点突合、N/A判定ログの必須化、監査結果の一貫判定を検証するテストシナリオとテストコードを先に作成する（Red状態）。

## 実行タスク

- 検証シナリオ設計: 三点突合・N/A判定ログ・監査結果判定の検証シナリオを導出
- バリデーションテスト作成: N/A判定ログの必須フィールド検証テスト
- 三点突合テスト作成: 完了判定ロジックの合否テスト
- 監査コマンド連携テスト設計: `audit --diff-from HEAD` 出力のパーステスト

## 参照資料

| 資料名                     | パス                                                                                 | 説明                                        |
| -------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------- |
| Phase 12 運用テンプレート  | `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`  | SubAgent分担・N/A判定ログの既存テンプレート |
| Phase 11-12 ガイド         | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`          | Phase 12 の5タスク構成                      |
| 未タスクガイドライン       | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md` | 未タスク検出基準                            |
| タスクワークフロー         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                 | フェーズ遷移・品質ゲート                    |
| Phase 2 設計成果物         | `outputs/phase-2/`                                                                   | テストケース設計の入力                      |
| Phase 3 設計レビュー成果物 | `outputs/phase-3/`                                                                   | レビューゲート判定の入力                    |

### システム仕様（aiworkflow-requirements）参照テーブル

| 仕様書                      | 参照目的                           | 適用判定 |
| --------------------------- | ---------------------------------- | -------- |
| `task-workflow.md`          | 残課題テーブル・完了タスク記録形式 | 参照     |
| `development-guidelines.md` | テストファースト原則               | 参照     |
| `error-handling.md`         | バリデーションエラーのコード範囲   | 参照     |

## 実行手順

### ステップ 1: 検証シナリオ設計

Phase 12 完了判定で発生しうる全パターンを洗い出し、テストケースとして文書化する。以下の6ケースを必ず含める:

| Case ID | シナリオ名                          | 入力状態                                      | 期待結果             |
| ------- | ----------------------------------- | --------------------------------------------- | -------------------- |
| TC-01   | N/A判定ログ未記載                   | 仕様書に `更新` も `N/A` も記録なし           | 完了不可（ERROR）    |
| TC-02   | artifacts.json が pending           | Phase 12 ステータスが `pending`               | 完了不可（ERROR）    |
| TC-03   | phase-12-documentation.md 未同期    | changelog に未記録の仕様書変更がある          | 完了不可（ERROR）    |
| TC-04   | audit --diff-from HEAD で current=0 | `currentViolations.total === 0`               | 合格（PASS）         |
| TC-05   | N/A判定の理由フィールド空           | `reason: ""` のN/A判定ログ                    | バリデーションエラー |
| TC-06   | 三点突合3要素すべてPASS             | artifacts=complete, changelog=synced, audit=0 | 完了判定（PASS）     |

### ステップ 2: N/A判定ログバリデーションテスト作成

N/A判定ログの必須フィールドを検証するテストを作成する:

```
必須フィールド:
- specName: 仕様書名（空文字列・trimで空を拒否）
- status: "更新" | "N/A" のいずれか
- reason: N/Aの場合は1文字以上の理由（空文字列を拒否）
- alternativeEvidence: N/Aの場合の代替証跡パス（空文字列を拒否）
- updatedBy: SubAgent識別子（"SubAgent-A" 〜 "SubAgent-E" または "leader"）
```

テストファイル配置先: `.claude/scripts/__tests__/na-log-validator.test.ts`

### ステップ 3: 三点突合テスト作成

三点突合の完了判定ロジックをテストする:

```
三点突合の3要素:
1. artifacts.json の Phase 12 ステータス === "completed"
2. documentation-changelog.md に全変更仕様書が記録されている
3. audit --diff-from HEAD の currentViolations.total === 0
```

判定ロジック:

- 3要素すべて PASS → 完了判定
- 1要素以上 FAIL → 完了不可（FAIL要素を明示）
- 部分一致（2/3 PASS）→ 完了不可（残り1要素を明示）

テストファイル配置先: `.claude/scripts/__tests__/triple-check-validator.test.ts`

### ステップ 4: 監査コマンド出力パーステスト設計

`audit-unassigned-tasks --diff-from HEAD` の出力から `currentViolations.total` を正確にパースするテストを設計する:

```
テスト対象の出力形式:
{
  "currentViolations": { "total": 0, "details": [] },
  "baselineViolations": { "total": 3, "details": [...] }
}
```

検証項目:

- JSON パースが成功する
- `currentViolations.total` が数値型である
- `total === 0` の場合に PASS を返す
- `total > 0` の場合に FAIL と詳細を返す
- 不正な JSON の場合にエラーを返す

テストファイル配置先: `.claude/scripts/__tests__/audit-output-parser.test.ts`

## 統合テスト連携【必須】

本タスクは Electron UI ではなく Phase 12 運用スクリプトの検証であるため、統合テストは以下のスクリプト間連携を対象とする:

| 連携カテゴリ         | 検証内容                                        | テスト種別     |
| -------------------- | ----------------------------------------------- | -------------- |
| スクリプト間連携     | N/Aログ検証 → 三点突合 → 監査コマンドの順次実行 | 結合テスト     |
| ファイルI/O検証      | テンプレートからのN/Aログ生成 → バリデーション  | ユニットテスト |
| コマンド出力パース   | `audit --diff-from HEAD` の stdout パース       | ユニットテスト |
| 完了判定パイプライン | 三点突合の全要素を順次検証し最終判定を出力      | 統合テスト     |

## 多角的チェック観点

| 観点               | 適用判断           | 確認項目                                              |
| ------------------ | ------------------ | ----------------------------------------------------- |
| エラーハンドリング | バリデーション実装 | N/Aログの必須フィールド空チェック、型チェック         |
| データ整合性       | 三点突合           | artifacts.json・changelog・audit結果の3ファイル整合性 |
| セキュリティ       | 対象外             | -                                                     |
| UI/UX              | 対象外             | -                                                     |

## 成果物

| 成果物                      | パス                                                       | 説明                              |
| --------------------------- | ---------------------------------------------------------- | --------------------------------- |
| テスト仕様書                | `outputs/phase-4/test-specification.md`                    | 検証シナリオ全体の設計書          |
| テストケース一覧            | `outputs/phase-4/test-cases.md`                            | TC-01〜TC-06 の詳細ケース         |
| 統合テスト設計              | `outputs/phase-4/integration-test-design.md`               | スクリプト間連携の検証設計        |
| N/Aログバリデーションテスト | `.claude/scripts/__tests__/na-log-validator.test.ts`       | N/A判定ログのフィールド検証テスト |
| 三点突合テスト              | `.claude/scripts/__tests__/triple-check-validator.test.ts` | 完了判定ロジックのテスト          |
| 監査出力パーステスト        | `.claude/scripts/__tests__/audit-output-parser.test.ts`    | audit コマンド出力のパーステスト  |

## 完了条件

- [ ] TC-01〜TC-06 の全テストケースが文書化されている
- [ ] N/Aログバリデーションテストが `.claude/scripts/__tests__/na-log-validator.test.ts` に作成されている
- [ ] 三点突合テストが `.claude/scripts/__tests__/triple-check-validator.test.ts` に作成されている
- [ ] 監査出力パーステストが `.claude/scripts/__tests__/audit-output-parser.test.ts` に作成されている
- [ ] すべてのテストが失敗状態（Red）であることを確認
- [ ] 統合テストシナリオ（スクリプト間連携）が設計されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. TC-01〜TC-06 の検証シナリオ設計と文書化
3. N/Aログバリデーションテスト作成
4. 三点突合テスト作成
5. 監査出力パーステスト設計
6. 統合テスト連携の設計
7. 成果物の作成・配置
8. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001 --phase 4
```

## TDD検証

```bash
# テスト実行コマンド（テストファイル作成後）
cd .claude/scripts && pnpm vitest run __tests__/na-log-validator.test.ts __tests__/triple-check-validator.test.ts __tests__/audit-output-parser.test.ts

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

## 次のPhase

Phase 5: 実装（TDD: Green）
