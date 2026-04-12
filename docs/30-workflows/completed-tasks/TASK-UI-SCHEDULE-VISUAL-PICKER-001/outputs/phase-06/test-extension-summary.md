# Phase 6 テスト拡充サマリー

作成日: 2026-04-09
タスク: TASK-UI-SCHEDULE-VISUAL-PICKER-001

## 追加テストファイル

| テストファイル                                             | テスト数 | 内容                                 |
| ---------------------------------------------------------- | -------- | ------------------------------------ |
| `src/__tests__/utils/cronConverter.edge.test.ts`           | 4        | CC-EX: 境界値・エッジケース          |
| `src/__tests__/utils/cronParser.edge.test.ts`              | 5        | CP-EX: 空白・複数スペース・7曜日     |
| `src/__tests__/utils/scheduleConfigValidator.edge.test.ts` | 9        | SCV-EX: ステップ値・範囲・タブ区切り |

## 追加テスト詳細

### cronConverter エッジケース

- `CC-EX-02`: every-hour minute=0 が `"00 * * * *"` でなく `"0 * * * *"` であること
- `CC-EX-03`: daily hour=23 最大値
- `CC-EX-04`: monthly dayOfMonth=31 最大値
- `CC-EX-06`: custom rawCronExpression 空文字 → `""` を返す（エラーにならない）

### cronParser エッジケース

- 先頭・末尾空白のトリム
- 複数スペース区切りのパース
- 曜日 `7` を weekly として扱う
- 6フィールドは null 返却
- 範囲指定 `1-5` は custom フォールバック

### scheduleConfigValidator エッジケース

- ステップ値 `*/15` は有効
- 範囲指定 `1-5` は有効
- カンマ区切り `1,3,5` は有効
- hour=24 はエラー
- minute=60 はエラー
- タブ区切りフィールドも正常に検証
- `Europe/London`, `Asia/Singapore` は有効タイムゾーン
- 空白のみはエラー

## カバレッジ改善

エッジケーステスト追加後:

- cronHumanizer: 英語ロケールブランチが未カバーだったため、英語テスト5件を追加
- ブランチカバレッジ: 63.6% → 96.55%

## 完了状態

全18テスト（エッジケース）Green 確認済み
