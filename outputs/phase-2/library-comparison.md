# ライブラリ比較 - TASK-UI-SCHEDULE-CRON-SEMANTIC-001

## 比較テーブル

| 評価軸             | cron-parser ライブラリ                 | カスタム実装 | @datasert/cron-validator |
| ------------------ | -------------------------------------- | ------------ | ------------------------ |
| 正確性             | 高（月末日・うるう年・到達可能性判定） | 低〜中       | 中（機能限定）           |
| 実装コスト         | 低                                     | 高           | 低〜中                   |
| バンドルサイズ影響 | ~10KB gzip                             | 0追加        | 小                       |
| 保守性             | 高（npm更新で仕様追従）                | 低           | 中                       |
| テスタビリティ     | 高                                     | 中           | 中                       |
| **総合評価**       | **推奨**                               | 不採用       | 不採用                   |

## 採用決定: `cron-parser`

### 採用理由

1. `CronExpressionParser.parse()` 単一呼び出しで next-execution-time 計算が可能
2. `"0 0 31 2 *"` のような意味論的不正ケースを安全側に検出できる
3. 実測結果に合わせて、day-of-week を含む式は到達可能性を慎重に判定できる
4. Renderer バンドルで tree-shaking が効くため実バンドル影響は限定的

### インストールコマンド

```bash
pnpm --filter @repo/desktop add cron-parser
```

- 追加先: `apps/desktop/package.json` の `dependencies`（Renderer実行時に必要）
- バージョン: `^5.x`（最新安定版）
