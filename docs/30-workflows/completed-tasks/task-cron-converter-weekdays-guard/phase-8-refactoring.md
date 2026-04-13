# Phase 8: リファクタリング

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 8                                        |
| タスクID   | TASK-CRON-CONVERTER-WEEKDAYS-GUARD-001   |
| 機能名     | cronConverter weekdays=[] ガード処理追加 |
| 前提Phase  | Phase 7                                  |
| 後続Phase  | Phase 9                                  |
| 作成日     | 2026-04-12                               |
| ステータス | completed                                |

## 目的

Phase 5 の実装を品質・可読性・保守性の観点でリファクタリングし、全テストが Green のまま維持されることを確認する。

## リファクタリング観点

### 1. InvalidConfigError の配置確認

```
現状確認: cronConverter.ts 内に定義し、単一のガード処理として local に閉じる
改善方針: 複数の call site が実際に増えた場合のみ、別タスクで共有化を再検討する
判断基準: 最小複雑性を優先し、今回の変更範囲を超える抽象化を追加しない
```

### 2. ガード処理の記述スタイル整合

```typescript
// リファクタリング前（暫定）
if (config.weekdays.length === 0) {
  throw new InvalidConfigError(
    "weekdays must not be empty when frequency is 'weekly'",
  );
}

// リファクタリング後（既存コードのスタイルに合わせる）
// → 既存の条件チェックスタイルと統一する
```

### 3. エラーメッセージはインライン維持

- 1 箇所しか使わないメッセージを定数へ切り出さない
- 追加の helper / wrapper / export を増やさない

### 4. コード行数・複雑度確認

- ガード追加後も `visualConfigToCron()` の複雑度が許容範囲内であること
- 不要なコメントや冗長な記述がないこと

## リファクタリング成果物テーブル

| 対象                    | Before              | After                     | 理由       |
| ----------------------- | ------------------- | ------------------------- | ---------- |
| InvalidConfigError 配置 | cronConverter.ts 内 | cronConverter.ts 内のまま | 最小複雑性 |
| エラーメッセージ        | インライン文字列    | インライン文字列のまま    | 1 箇所利用 |

## 実行手順

1. Phase 7 成果物を確認する。
2. `InvalidConfigError` の配置は local util に固定し、共有化しない。
3. 既存コードのスタイルに合わせてガード処理の記述を統一する。
4. リファクタリング後に全テストが Green であることを確認する。

## 参照資料

| 資料名           | パス                                    | 用途           |
| ---------------- | --------------------------------------- | -------------- |
| カバレッジ計画   | `outputs/phase-7/coverage-plan.md`      | Phase 7 成果物 |
| 未到達分析       | `outputs/phase-7/uncovered-analysis.md` | Phase 7 成果物 |
| エラークラス設計 | `outputs/phase-2/error-class-design.md` | Phase 2 成果物 |

## 成果物

| 成果物         | パス                                         | 説明                         |
| -------------- | -------------------------------------------- | ---------------------------- |
| リファクタ計画 | `outputs/phase-8/refactoring-plan.md`        | リファクタリング内容と方針   |
| 再テスト計画   | `outputs/phase-8/post-refactor-test-plan.md` | リファクタ後のテスト確認計画 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] リファクタリング後に全テストが Green であること
- [ ] `InvalidConfigError` の配置が適切であること
- [ ] 既存コードのスタイルと統一されていること
- [ ] 矛盾・漏れがないこと
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 7 成果物確認
2. InvalidConfigError 配置確認・調整
3. コードスタイル統一
4. リファクタ後テスト確認
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 9: 品質保証
