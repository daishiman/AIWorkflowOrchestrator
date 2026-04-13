# Phase 11: 手動テスト

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 11                                       |
| タスクID   | TASK-CRON-CONVERTER-WEEKDAYS-GUARD-001   |
| 機能名     | cronConverter weekdays=[] ガード処理追加 |
| 前提Phase  | Phase 10                                 |
| 後続Phase  | Phase 12                                 |
| 作成日     | 2026-04-12                               |
| ステータス | completed                                |
| Visual種別 | NON_VISUAL                               |

## 目的

`cronConverter.ts` はピュアなユーティリティ関数であり、UI を持たない。本 Phase では、Node.js REPL または Vitest の直接呼び出しで `weekdays=[]` ガードと正常系を確認し、`VisualCronPicker` は既存 UI の参照としてのみ扱う。

## 手動テストシナリオ

### シナリオ 1: 直接呼び出しでのガード確認

| ステップ | 操作                                                                                                                      | 期待結果                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 1        | Node.js REPL で `visualConfigToCron({ frequency: "weekly", weekdays: [], hour: 9, minute: 0, dayOfMonth: 1 })` を実行する | `InvalidConfigError` がスローされること                                  |
| 2        | 例外メッセージを確認する                                                                                                  | `"weekdays must not be empty when frequency is 'weekly'"` が含まれること |

### シナリオ 2: 正常系の直接確認

```javascript
// Node.js REPL で実行
const {
  visualConfigToCron,
  InvalidConfigError,
} = require("./path/to/cronConverter");

const result = visualConfigToCron({
  frequency: "weekly",
  weekdays: [1, 2, 3, 4, 5],
  hour: 9,
  minute: 0,
});
console.log("cron式:", result); // 期待: "0 9 * * 1,2,3,4,5"
```

### シナリオ 3: 既存の非 weekly 変換への影響確認

| ステップ | 操作                                                   | 期待結果                                |
| -------- | ------------------------------------------------------ | --------------------------------------- |
| 1        | `frequency: "daily"` で `weekdays: []` を入力する      | エラーにならず `"0 9 * * *"` が返ること |
| 2        | `frequency: "every-hour"` で `weekdays: []` を入力する | エラーにならず分だけが反映されること    |

## テスト観点

| 観点               | 確認内容                                             |
| ------------------ | ---------------------------------------------------- |
| Semantic           | API 動作が設計通りであること（weekdays=[] → エラー） |
| 回帰               | 既存の VisualCronPicker 動作に影響がないこと         |
| エラーハンドリング | `InvalidConfigError` が正しく補足されること          |

## 参照資料

| 資料名           | パス                                        | 用途            |
| ---------------- | ------------------------------------------- | --------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`   | Phase 10 成果物 |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物  |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`    | Phase 1 成果物  |

## 成果物

| 成果物                 | パス                                     | 説明             |
| ---------------------- | ---------------------------------------- | ---------------- |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md` | シナリオ実施結果 |
| エビデンスインデックス | `outputs/phase-11/evidence-index.md`     | テスト証跡一覧   |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] シナリオ 1〜3 が全て PASS であること
- [ ] VisualCronPicker の既存動作に影響がないことが確認されていること
- [ ] `InvalidConfigError` が正しくスローされることが確認されていること
- [ ] 矛盾・漏れがないこと
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 10 成果物確認
2. Electron 起動
3. シナリオ 1〜3 実施
4. テスト結果記録
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 12: ドキュメント更新
