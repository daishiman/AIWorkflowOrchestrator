# 仕様抽出マップ - TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001

## 正本 ↔ 実装コード 対応マップ

| 仕様正本              | 実装ファイル                                                     | 内容                                                    |
| --------------------- | ---------------------------------------------------------------- | ------------------------------------------------------- |
| `visualCronConfig.ts` | `apps/desktop/src/renderer/types/visualCronConfig.ts`            | `dayOfMonth: number`（1-31, monthly のみ有効）型定義    |
| cron 変換ロジック     | `apps/desktop/src/renderer/utils/cronConverter.ts`               | `visualConfigToCron` 関数（monthly 分岐ガード追加対象） |
| エッジケーステスト    | `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts`    | TC-11〜TC-15 追加対象                                   |
| weekday ガード参考    | `apps/desktop/src/renderer/utils/cronConverter.ts` (weekly 分岐) | 対称パターン参考                                        |

## 呼び出し元（影響確認済み）

`visualConfigToCron` は `VisualCronPicker.tsx` の以下箇所で呼ばれる:

- line 82: `const cron = visualConfigToCron(config);`
- line 124: `const currentCron = visualConfigToCron(config);`
- line 145: `setDirectInput(visualConfigToCron(config));`
- line 153: `setDirectInput(visualConfigToCron(parsed));`
- line 175: `visualConfigToCron(config);`

→ 正常ケース（dayOfMonth=1〜31）は影響なし。空文字返しは既存バリデーションで無効入力として扱われる。
