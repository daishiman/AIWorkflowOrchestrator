# Phase 7: カバレッジ確認 - SkillExecutionStatus 型同期の再監査

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 7                               |
| 機能名 | execution-status-type-spec-sync |
| 作成日 | 2026-03-20                      |

## 目的

requirements / refs / validator / docs-only blocker の 4 軸で coverage を測り、参照漏れがないことを確認する。

## 実行タスク

- refs coverage 確認: 一次情報と更新対象の網羅率を確認する
- validator coverage 確認: 必須コマンドが残っているか確認する
- 分岐 coverage 確認: ready/blocked の両経路があるか確認する
- current/baseline 記録確認: 差分記録方法が明確か確認する

### タスク1: 参照箇所 coverage 確認

### タスク2: validator coverage 確認

### タスク3: ready/blocked 分岐 coverage 確認

### タスク4: current/baseline の記録方法確認

## 参照資料

| 資料名               | パス                                        | 説明                    |
| -------------------- | ------------------------------------------- | ----------------------- |
| Phase 1 参照箇所     | `outputs/phase-1/reference-locations.md`    | refs inventory          |
| Phase 2 設計         | `outputs/phase-2/design.md`                 | dependency edge         |
| Phase 3 レビュー     | `outputs/phase-3/design-review-result.md`   | review gate / MINOR     |
| Phase 4 テストケース | `outputs/phase-4/test-cases.md`             | command suite           |
| Phase 5 実装サマリー | `outputs/phase-5/implementation-summary.md` | ready/blocked 結果      |
| Phase 6 拡充結果     | `outputs/phase-6/expanded-test-results.md`  | parity / docs-only 検査 |

## 実行手順

### ステップ1: 参照 coverage を測る

| 指標              | 基準                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------ |
| 一次情報 coverage | Task12 一次情報と lessons learned が両方参照されている                                     |
| 更新対象 coverage | `interfaces-agent-sdk-integration.md` と `arch-state-management-core.md` が列挙されている  |
| index coverage    | `resource-map` / `topic-map` / `quick-reference-search-patterns-code` が全て参照されている |

### ステップ2: validator coverage を測る

`validate-phase-output.js`、`verify-all-specs.js`、`diff -qr` が少なくとも workflow 内に現れ、Phase 9/11/12 に引き継がれていることを確認する。

### ステップ3: 分岐 coverage を測る

`ready` / `blocked` の両方について、Phase 5 / 10 / 12 / 13 に扱いが存在することを確認する。

### ステップ4: dependency edge coverage を測る

Phase 2 の lane 設計と Phase 3 の review gate から、以下の edge が切れていないことを確認する。

- Phase 1 抽出 -> Phase 4 テスト
- Phase 4 テスト -> Phase 5 実装
- Phase 5 実装 -> Phase 6 validator
- Phase 10 MINOR -> Phase 11/12 handoff
- Phase 12 docs 契約 -> Phase 13 blocked record

## 統合テスト連携（Phase 7）

| 検証項目                 | 方法                                | 期待結果                    |
| ------------------------ | ----------------------------------- | --------------------------- |
| refs coverage            | Phase 1 と index を突合             | 漏れなし                    |
| validator coverage       | command 出現確認                    | 主要 validator が継承される |
| 分岐 coverage            | ready/blocked 用語を各 phase で確認 | 両分岐が存在する            |
| dependency edge coverage | Phase 2/3 と後続 phase を突合       | handoff の切断なし          |

## 成果物

| 成果物             | パス                                 | 説明              |
| ------------------ | ------------------------------------ | ----------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 4軸 coverage 結果 |

## 完了条件

- [ ] 一次情報 / 更新対象 / index の coverage が確認されている
- [ ] validator coverage が確認されている
- [ ] ready/blocked の分岐 coverage が確認されている
- [ ] dependency edge coverage が確認されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. refs coverage 確認
3. validator coverage 確認
4. 分岐 coverage 確認
5. 成果物作成
6. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/execution-status-type-spec-sync --phase 7
```

## 次のPhase

Phase 8: リファクタリング
