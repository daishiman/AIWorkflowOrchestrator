# Log Rotation 基礎知識

> **相対パス**: `references/basics.md`
> **読込条件**: 初回使用時

---

## ログローテーションとは

| 概念               | 説明                                               |
| ------------------ | -------------------------------------------------- |
| ログローテーション | ログファイルを一定条件で分割・アーカイブする仕組み |
| 目的               | ディスク容量管理、検索性向上、コンプライアンス対応 |
| 方式               | サイズベース、時間ベース、ハイブリッド             |

---

## ローテーション方式比較

| 方式         | トリガー           | 適用シーン                 |
| ------------ | ------------------ | -------------------------- |
| サイズベース | ファイルサイズ超過 | ログ生成量が不定なアプリ   |
| 時間ベース   | 日次/週次/月次     | 規則的なログ生成、監査要件 |
| ハイブリッド | 両方の条件         | 大規模システム、柔軟な要件 |

---

## ツール選択ガイド

| ツール            | レベル           | 特徴                             |
| ----------------- | ---------------- | -------------------------------- |
| pm2-logrotate     | プロセス管理     | PM2 統合、設定が簡単             |
| Winston           | アプリケーション | コード内制御、柔軟なフォーマット |
| logrotate (Linux) | OS               | システム全体、cron 連携          |

---

## 基本設定パラメータ

### pm2-logrotate

```bash
# 設定確認
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss
pm2 set pm2-logrotate:rotateModule true
```

### Winston DailyRotateFile

```typescript
import DailyRotateFile from "winston-daily-rotate-file";

const transport = new DailyRotateFile({
  filename: "application-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d",
  compress: true,
});
```

---

## ディスク使用量分析

### 基本コマンド

```bash
# ログディレクトリサイズ
du -sh /var/log/app/

# ファイル別サイズ
ls -lhS /var/log/app/*.log

# ディスク使用率
df -h /var/log
```

### 分析観点

| 指標       | 計算方法                           | 基準値        |
| ---------- | ---------------------------------- | ------------- |
| 日次生成量 | 1週間の平均                        | システム依存  |
| ピーク倍率 | 最大値 / 平均値                    | 3-5倍を想定   |
| 必要容量   | 日次生成量 × 保持日数 × ピーク倍率 | 20%余裕を確保 |

---

## 保持期間の決定

| 要件タイプ       | 典型的な期間 | 決定要因             |
| ---------------- | ------------ | -------------------- |
| 運用デバッグ     | 7-14日       | 問題調査に必要な期間 |
| コンプライアンス | 1-7年        | 法的要件（業界別）   |
| 監査             | 90日-1年     | 内部監査ポリシー     |
| セキュリティ     | 30-90日      | インシデント調査期間 |

---

## 関連リソース

- **ローテーションパターン詳細**: See [rotation-patterns.md](rotation-patterns.md)
- **PM2 設定ガイド**: See [pm2-logrotate-guide.md](pm2-logrotate-guide.md)
- **ログ集約システム**: See [log-aggregation.md](log-aggregation.md)
