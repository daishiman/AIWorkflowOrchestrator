# 非機能要件測定ガイド

## 概要

非機能要件は測定可能でなければ意味がありません。
このガイドでは、各品質特性の具体的な測定方法を提供します。

## 測定の基本原則

### SMART基準

非機能要件の目標値は以下を満たすべきです：

| 基準 | 説明 | 例 |
|-----|------|---|
| **S**pecific | 具体的 | 「速い」→「200ms以内」 |
| **M**easurable | 測定可能 | 数値で表現 |
| **A**chievable | 達成可能 | 現実的な目標 |
| **R**elevant | 関連性 | ビジネス目標と整合 |
| **T**ime-bound | 期限付き | いつまでに達成 |

### 測定の3つの要素

1. **何を測定するか**（指標）
2. **どうやって測定するか**（方法）
3. **いつ測定するか**（頻度）

## カテゴリ別測定方法

### 1. パフォーマンス測定

#### 応答時間

**指標**:
- 平均応答時間
- 95パーセンタイル（P95）
- 99パーセンタイル（P99）
- 最大応答時間

**測定方法**:
| 方法 | ツール | 用途 |
|-----|-------|-----|
| APM | DataDog, New Relic, Dynatrace | 本番環境モニタリング |
| 負荷テスト | k6, JMeter, Gatling | リリース前検証 |
| ブラウザ計測 | Lighthouse, WebPageTest | フロントエンド性能 |

**計測コード例（k6）**:
```javascript
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95%のリクエストが200ms以内
  },
};

export default function() {
  const res = http.get('https://api.example.com/search');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
}
```

#### スループット

**指標**:
- リクエスト/秒（RPS）
- トランザクション/秒（TPS）

**測定方法**:
- 負荷テストでの最大処理能力測定
- 本番環境でのリアルタイムモニタリング

### 2. 可用性測定

#### 稼働率

**指標**:
```
稼働率(%) = (総時間 - ダウンタイム) / 総時間 × 100
```

**測定方法**:
| 方法 | ツール | 特徴 |
|-----|-------|-----|
| 外部監視 | Pingdom, StatusCake, UptimeRobot | 外部からの死活監視 |
| 内部監視 | Prometheus + Grafana | 詳細なメトリクス |
| APM | DataDog, New Relic | 総合監視 |

**監視設定例（Prometheus）**:
```yaml
# アラートルール
groups:
  - name: availability
    rules:
      - alert: ServiceDown
        expr: up{job="api"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
```

#### MTBF / MTTR

**指標**:
```
MTBF = 総稼働時間 / 障害発生回数
MTTR = 総ダウンタイム / 障害発生回数
```

**測定方法**:
- インシデント管理システムからの集計
- 障害報告書からの計算

### 3. セキュリティ測定

#### 脆弱性

**指標**:
- 重大脆弱性の数（Critical/High）
- 脆弱性修正までの平均時間
- セキュリティテストの合格率

**測定方法**:
| 方法 | ツール | 用途 |
|-----|-------|-----|
| SAST | SonarQube, Snyk, CodeQL | 静的コード分析 |
| DAST | OWASP ZAP, Burp Suite | 動的分析 |
| 依存関係チェック | npm audit, Dependabot | ライブラリ脆弱性 |
| ペネトレーションテスト | 専門業者 | 総合セキュリティ検証 |

**CI/CDでの自動チェック例**:
```yaml
# GitHub Actions
- name: Security Scan
  uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
  with:
    args: --severity-threshold=high
```

#### 認証セキュリティ

**指標**:
- ブルートフォース攻撃の検出率
- 不正ログイン試行数
- MFA採用率

**測定方法**:
- セキュリティログの分析
- SIEM（Security Information and Event Management）

### 4. ユーザビリティ測定

#### アクセシビリティ

**指標**:
- WCAG準拠率
- 自動テストの合格項目数
- アクセシビリティスコア

**測定方法**:
| 方法 | ツール | 用途 |
|-----|-------|-----|
| 自動チェック | axe-core, Lighthouse, WAVE | 基本的な違反検出 |
| 手動テスト | スクリーンリーダー | 実際の使用性確認 |

**自動テスト例（Playwright + axe）**:
```javascript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('accessibility check', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2aa'])
    .analyze();

  expect(results.violations).toHaveLength(0);
});
```

#### ユーザー満足度

**指標**:
- NPS（Net Promoter Score）
- SUS（System Usability Scale）スコア
- タスク完了率
- エラー率

**測定方法**:
- ユーザーアンケート
- ユーザビリティテスト
- 分析ツール（Google Analytics等）

### 5. 保守性測定

#### コード品質

**指標**:
- テストカバレッジ
- 循環的複雑度
- 技術的負債指数
- コード重複率

**測定方法**:
| 指標 | ツール | 目標例 |
|-----|-------|-------|
| カバレッジ | Jest, Istanbul, Pytest | >80% |
| 複雑度 | SonarQube, CodeClimate | <10 |
| 負債 | SonarQube | Aランク |
| 重複 | SonarQube, jscpd | <3% |

**SonarQube品質ゲート例**:
```json
{
  "conditions": [
    {"metric": "coverage", "op": "LT", "error": "80"},
    {"metric": "duplicated_lines_density", "op": "GT", "error": "3"},
    {"metric": "reliability_rating", "op": "GT", "error": "1"},
    {"metric": "security_rating", "op": "GT", "error": "1"}
  ]
}
```

#### デプロイ指標

**指標**:
- デプロイ頻度
- 変更リードタイム
- 変更失敗率
- MTTR（デプロイ起因の障害）

**測定方法**:
- CI/CDパイプラインのメトリクス
- デプロイログの分析

### 6. スケーラビリティ測定

**指標**:
- 最大同時接続数
- スケールアウト時間
- リソース効率（ユーザー/インスタンス）

**測定方法**:
- 負荷テスト（段階的負荷増加）
- クラウドモニタリング

**負荷テスト例（k6）**:
```javascript
export const options = {
  stages: [
    { duration: '2m', target: 100 },   // 100ユーザーまで増加
    { duration: '5m', target: 100 },   // 100ユーザーで維持
    { duration: '2m', target: 500 },   // 500ユーザーまで増加
    { duration: '5m', target: 500 },   // 500ユーザーで維持
    { duration: '2m', target: 1000 },  // 1000ユーザーまで増加
    { duration: '5m', target: 1000 },  // 限界テスト
    { duration: '2m', target: 0 },     // クールダウン
  ],
};
```

## 測定結果の報告

### ダッシュボード設計

**推奨メトリクス**:
1. **トップレベル**: SLA達成状況、稼働率
2. **パフォーマンス**: 応答時間推移、エラー率
3. **リソース**: CPU、メモリ、ディスク使用率
4. **ビジネス**: アクティブユーザー数、トランザクション数

### レポートテンプレート

```markdown
# 非機能要件測定レポート

**期間**: YYYY/MM/DD - YYYY/MM/DD

## サマリー
| 指標 | 目標 | 実績 | 判定 |
|-----|-----|-----|-----|
| 稼働率 | 99.9% | 99.95% | ✅ |
| 応答時間(P95) | 200ms | 180ms | ✅ |
| エラー率 | <0.1% | 0.08% | ✅ |

## 詳細

### パフォーマンス
[グラフ・詳細データ]

### 可用性
[インシデント一覧・影響時間]

### セキュリティ
[脆弱性レポート・対応状況]

## アクション
- [ ] 改善項目1
- [ ] 改善項目2
```

## チェックリスト

### 測定計画
- [ ] 各非機能要件に測定方法が定義されているか？
- [ ] 測定ツールが選定されているか？
- [ ] 測定頻度が決められているか？
- [ ] 担当者が決められているか？

### 測定実施
- [ ] ベースライン測定を実施したか？
- [ ] 継続的なモニタリングが設定されているか？
- [ ] アラートが設定されているか？

### 測定結果
- [ ] 定期的なレポートが作成されているか？
- [ ] 目標未達の場合の対応が決められているか？
- [ ] 測定結果が関係者に共有されているか？
