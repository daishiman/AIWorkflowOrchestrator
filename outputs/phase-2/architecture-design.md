# Phase 2: アーキテクチャ設計

## ガード処理フロー

```
visualConfigToCron(config: VisualCronConfig): string
│
├─ case "every-minute" / "every-hour" / "daily" / "monthly" / "custom" → 変更なし
│
└─ case "weekly":
    ├─ [追加] if (config.weekdays.length === 0)
    │   └─ throw new InvalidConfigError(
    │        "weekdays must not be empty when frequency is 'weekly'"
    │      )
    │
    └─ 既存: sorted.join(",") で cron 式を生成（変更なし）
```

## InvalidConfigError 配置方針

- 既存の共通エラークラスなし → `cronConverter.ts` 内に定義
- export して テストからも参照可能にする

## 変更ファイル

| ファイル                                                          | 変更内容                               |
| ----------------------------------------------------------------- | -------------------------------------- |
| `apps/desktop/src/renderer/utils/cronConverter.ts`                | InvalidConfigError 定義・ガード・JSDoc |
| `apps/desktop/src/renderer/utils/__tests__/cronConverter.test.ts` | テストケース新規作成                   |
