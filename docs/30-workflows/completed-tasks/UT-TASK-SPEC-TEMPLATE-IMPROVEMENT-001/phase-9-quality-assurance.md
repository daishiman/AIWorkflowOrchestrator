# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                                               |
| ---------- | ------------------------------------------------------------------ |
| Phase      | 9                                                                  |
| 機能名     | UT-TASK-SPEC-TEMPLATE-IMPROVEMENT-001                              |
| タスク名   | task-specification-creator テンプレートの validator 必須見出し強化 |
| 前提Phase  | Phase 8                                                            |
| 後続Phase  | Phase 10                                                           |
| 作成日     | 2026-04-06                                                         |
| ステータス | 完了                                                               |

## 目的

全テスト・Lint・型チェックが PASS し、品質ゲートを通過することを確認する。

## 実行タスク

### タスク1: 品質チェック実行

**目的**: 全品質基準を満たしていることを確認する

**実行手順**:

1. 全テストを実行する
2. ESLint を実行する
3. TypeScript 型チェックを実行する（対象は JS ファイルのため省略可）
4. Prettier フォーマットチェックを実行する

**実行コマンド**:

```bash
# テスト実行
pnpm vitest run --reporter=verbose -- validate-phase12-implementation-guide

# Lint
pnpm --filter @repo/desktop lint

# 型チェック（該当する場合）
pnpm --filter @repo/desktop typecheck
```

**期待される成果物**:

- `outputs/phase-9/quality-assurance-report.md`

---

## 参照資料

| 参照資料                 | パス                                    | 用途          |
| ------------------------ | --------------------------------------- | ------------- |
| リファクタリングレポート | `outputs/phase-8/refactoring-report.md` | 前 Phase 確認 |

## 統合テスト連携

- 品質保証では全テストを一括実行して回帰がないことを最終確認する

## 品質ゲート

### 機能検証

- [ ] 全ユニットテスト成功
- [ ] `### 使用例` 見出し検査の正常系・異常系テストが PASS

### コード品質

- [ ] ESLint エラーなし
- [ ] コードフォーマット適用済み

### テスト網羅性

- [ ] Line Coverage ≥ 80%
- [ ] Branch Coverage ≥ 60%

## 成果物

| 成果物           | パス                                          | 内容               |
| ---------------- | --------------------------------------------- | ------------------ |
| 品質保証レポート | `outputs/phase-9/quality-assurance-report.md` | 全品質チェック結果 |

## 完了条件

- [ ] 全テスト PASS
- [ ] ESLint エラーなし
- [ ] カバレッジ基準達成
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 10: 最終レビューゲート
