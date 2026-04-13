# Phase 2: 設計

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 2                                        |
| タスクID   | TASK-CRON-CONVERTER-WEEKDAYS-GUARD-001   |
| 機能名     | cronConverter weekdays=[] ガード処理追加 |
| 作成日     | 2026-04-12                               |
| ステータス | completed                                |

## 目的

`InvalidConfigError` クラスの設計とガード処理の実装方針を確定する。変更箇所を最小に抑え、既存の cron 変換ロジックへの影響をなくす。

## InvalidConfigError 設計

### 既存エラークラス確認

```bash
# プロジェクト内の Error クラス定義確認
grep -r "class.*Error.*extends" apps/desktop/src/
grep -r "InvalidConfigError" apps/desktop/src/
```

### 新規定義（既存がない場合）

```typescript
export class InvalidConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidConfigError";
  }
}
```

配置候補:

- 既存の共通エラー定義ファイルがあれば追記
- なければ `apps/desktop/src/renderer/utils/cronConverter.ts` 内に定義

## ガード処理設計

### visualConfigToCron() の変更方針

```
visualConfigToCron(config: VisualCronConfig): string
│
├─ 既存の前処理
│
├─ [追加] frequency === "weekly" の場合
│   └─ if (config.weekdays.length === 0)
│       └─ throw new InvalidConfigError(
│            "weekdays must not be empty when frequency is 'weekly'"
│          )
│
└─ 既存の変換処理（変更なし）
```

### JSDoc 更新方針

```typescript
/**
 * VisualCronConfig を cron 式文字列に変換する
 * @param config - ビジュアル設定オブジェクト
 * @returns cron 式文字列
 * @throws {InvalidConfigError} frequency が "weekly" のとき weekdays が空配列の場合
 */
```

## 実装箇所特定

変更対象ファイル:

| ファイル                | 変更内容                        |
| ----------------------- | ------------------------------- |
| `cronConverter.ts`      | ガード追加（3-5行）・JSDoc 更新 |
| `cronConverter.test.ts` | テストケース追加（4ケース）     |

## テスト設計

### ガード処理テスト

| ケース       | 入力                                                 | 期待結果                            |
| ------------ | ---------------------------------------------------- | ----------------------------------- |
| 空配列エラー | `{ frequency: "weekly", weekdays: [] }`              | `InvalidConfigError` がスローされる |
| 日曜のみ     | `{ frequency: "weekly", weekdays: [0] }`             | `"0 9 * * 0"`                       |
| 平日のみ     | `{ frequency: "weekly", weekdays: [1,2,3,4,5] }`     | `"0 9 * * 1,2,3,4,5"`               |
| 全曜日       | `{ frequency: "weekly", weekdays: [0,1,2,3,4,5,6] }` | `"0 9 * * 0,1,2,3,4,5,6"`           |

### 回帰テスト

- `frequency: "daily"` の場合は `weekdays` の値に関わらず正常動作すること
- `frequency: "weekly"` かつ `weekdays` が null/undefined の場合の挙動確認

## 成果物

| 成果物             | パス                                     | 説明                        |
| ------------------ | ---------------------------------------- | --------------------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | ガード処理フロー設計        |
| エラークラス設計   | `outputs/phase-2/error-class-design.md`  | InvalidConfigError 設計詳細 |
| テスト戦略         | `outputs/phase-2/test-strategy.md`       | テスト方針と対象ケース      |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] `InvalidConfigError` の配置場所が確定していること
- [ ] ガード処理の挿入箇所が特定されていること
- [ ] JSDoc 更新内容が確定していること
- [ ] テスト戦略が記述されていること
- [ ] 矛盾・漏れがないこと
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 3: 設計レビュー
