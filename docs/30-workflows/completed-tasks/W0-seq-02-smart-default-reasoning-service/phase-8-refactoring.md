# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 8                                              |
| タスクID   | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 |
| 機能名     | スマートデフォルト推論サービス実装             |
| 前提Phase  | Phase 7                                        |
| 後続Phase  | Phase 9                                        |
| 作成日     | 2026-04-07                                     |
| ステータス | pending                                        |

## 目的

Phase 5 の実装を品質・可読性・保守性の観点でリファクタリングし、全テストが Green のまま維持されることを確認する。

## 実行タスク

1. 推論ルールを定数へ抽出する。
2. ロジックを小さく分割する。
3. inferenceLog の型安全性を確認する。

## 統合テスト連携

- Phase 9 での静的解析と因果ループ監査に支障がない形に整える。
- Phase 7 の coverage を落とさないようにする。

## リファクタリング観点

### 1. 推論ルールの定数化

推論キーワードを定数として分離し、追加・変更が容易な構造にする。

```typescript
// Before: 推論ルールがロジックに埋め込まれている
if (purpose.includes("Slack")) { ... }

// After: 定数として分離
const TOOL_KEYWORDS: Record<NonNullable<SmartDefaultResult["tool"]>, string> = {
  slack: "Slack",
  github: "GitHub",
  notion: "Notion",
};
```

### 2. 推論ロジックの分割（オプション）

ツール推論・タイミング推論・フォーマット推論を個別のプライベート関数に分割し、
各関数が単一責務を持つよう改善する（テスト可能性向上）。

```typescript
function inferTool(purpose: string): SmartDefaultResult["tool"] { ... }
function inferTiming(purpose: string): SmartDefaultResult["timing"] { ... }
function inferFormat(category: SkillInfoFormData["category"]): SmartDefaultResult["format"] { ... }
```

### 3. inferenceLog の型安全化

`inferenceLog` エントリの文字列フォーマットを統一し、コメントで契約を明示する。

### 4. 不要なコメントの整理

インラインコメントを最小化し、JSDoc 形式の説明に統一する。

## 責務境界マップ

| ファイル                                         | 責務                                                     |
| ------------------------------------------------ | -------------------------------------------------------- |
| `smartDefaultReasoningService.ts`                | `inferSmartDefaults` 関数・推論ルール定数・内部補助関数  |
| `__tests__/smartDefaultReasoningService.test.ts` | 全推論ルール・フォールバック・組み合わせのユニットテスト |
| `services/skillCreator/index.ts`                 | `inferSmartDefaults` のエクスポート（barrel）            |

## 参照資料

| 資料名                 | パス                                              | 用途           |
| ---------------------- | ------------------------------------------------- | -------------- |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`          | Phase 1 成果物 |
| API 設計               | `outputs/phase-2/api-design.md`                   | Phase 2 成果物 |
| 回帰テスト結果         | `outputs/phase-6/regression-test-result.md`       | Phase 6 成果物 |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                | Phase 7 成果物 |
| 未到達分析             | `outputs/phase-7/uncovered-analysis-plan.md`      | Phase 7 成果物 |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md` | Phase 7 成果物 |

## 実行手順

1. Phase 7 成果物を確認する。
2. 推論キーワードの定数化を検討・実施する（カバレッジ不足時は優先）。
3. 推論ロジックの分割が可読性向上に有効かを判断する。
4. 不要なコメントを整理する。
5. リファクタリング後に全テストが Green であることを確認する。

## 成果物

| 成果物         | パス                                             | 説明                         |
| -------------- | ------------------------------------------------ | ---------------------------- |
| リファクタ計画 | `outputs/phase-8/refactoring-plan.md`            | リファクタリング内容と方針   |
| 再テスト計画   | `outputs/phase-8/post-refactor-test-plan.md`     | リファクタ後のテスト確認計画 |
| 責務境界マップ | `outputs/phase-8/responsibility-boundary-map.md` | ファイル責務の整理           |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] リファクタリング後に全テストが Green であること
- [ ] 責務境界マップが完成していること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 推論キーワードの定数化検討・実施
3. 推論ロジック分割の検討
4. コメント整理
5. リファクタ後テスト確認
6. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 9: 品質保証
