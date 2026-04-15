# Phase 1: P50チェック結果

## 実行日時

2026-04-14

## 直近5回の main ブランチ CI 実行時間（P50計測）

| Run ID      | 実行時間（秒） | 実行時間   | 結論    |
| ----------- | -------------- | ---------- | ------- |
| 24401596710 | 935s           | 15m35s     | success |
| 24399727537 | 921s           | 15m21s     | success |
| 24396184045 | 921s           | 15m21s     | success |
| 24385579547 | 913s           | 15m13s     | success |
| 24381819838 | 932s           | 15m32s     | success |
| **平均**    | **924s**       | **15m24s** | -       |

## 現状確認事項

### ✅ node_modules キャッシュ未実装の確認

`.github/actions/pnpm-install-retry/action.yml` には `actions/cache` が存在しない（確認済み）。
現在のキャッシュは `cache: "pnpm"` による pnpm ストアキャッシュのみ。

```bash
# 確認コマンド実行結果:
# .github/actions/pnpm-install-retry/action.yml: キャッシュ設定なし
# .github/workflows/ci.yml: cache: "pnpm" (pnpmストアキャッシュのみ)
```

### ✅ テストシャード数 16 の確認

```yaml
# .github/workflows/ci.yml (line 190)
shard: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
```

### ✅ CI_MAX_FORKS = 2 の確認

```typescript
// apps/desktop/vitest.config.ts (line 11)
const CI_MAX_FORKS = 2;
```

### ✅ 各ジョブが独立してpnpm installを実行している確認

`pnpm-install-retry` composite action が lint / typecheck / build-shared / test-shared / test-desktop / e2e-desktop / check-module-sync / security / build の全ジョブで個別実行されている。

## 結論

P50チェック完了。直近5回平均は **924s（15m24s）** であり、仕様書記載の ~15m21s と整合する。
全確認事項が未実装状態であり、改善の余地が確認された。
