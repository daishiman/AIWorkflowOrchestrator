# SkillExecutor パフォーマンステスト - タスク指示書

## メタ情報

```yaml
issue_number: 497
```

## メタ情報

| 項目         | 内容                                  |
| ------------ | ------------------------------------- |
| タスクID     | TASK-SKILL-PERF-TEST                  |
| タスク名     | SkillExecutor パフォーマンステスト    |
| 分類         | パフォーマンス                        |
| 対象機能     | SkillExecutor                         |
| 優先度       | 低                                    |
| 見積もり規模 | 小規模                                |
| ステータス   | 未実施                                |
| 発見元       | TASK-3-1-A Phase 11（手動テスト検証） |
| 発見日       | 2026-01-25                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-3-1-A（SkillExecutor SDK query()基本実装）のPhase 11手動テスト検証において、以下の将来確認事項が推奨された:

1. 実SDK接続時の応答時間計測
2. 長時間実行時のメモリ使用量モニタリング
3. 高頻度実行時のパフォーマンス測定

現在はモック環境でのテストのみで、本番SDK環境でのパフォーマンス特性は未検証。

### 1.2 問題点・課題

- 本番環境でのレスポンス時間が未計測
- メモリリークの可能性が未検証
- 同時実行数制限（最大5件）の妥当性が未検証
- 高負荷時の挙動が未確認

### 1.3 放置した場合の影響

- 本番環境で予期しないパフォーマンス劣化が発生する可能性
- メモリリークによるアプリケーションクラッシュのリスク
- ユーザー体験の低下（応答遅延）

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillExecutorの本番環境におけるパフォーマンス特性を把握し、必要に応じて改善点を特定する。

### 2.2 最終ゴール

- 応答時間のベースラインが計測されている
- メモリ使用量の推移が把握されている
- 同時実行時の挙動が検証されている
- パフォーマンス改善の推奨事項がドキュメント化されている

### 2.3 スコープ

#### 含むもの

- 応答時間計測（平均、P95、P99）
- メモリ使用量モニタリング
- 同時実行テスト
- 長時間実行テスト（1時間以上）
- ベンチマークレポート作成

#### 含まないもの

- パフォーマンス改善実装（別タスク）
- UI側のパフォーマンステスト
- ネットワーク帯域テスト

### 2.4 成果物

- `outputs/performance-benchmark-report.md`
- `outputs/memory-profile-report.md`
- `outputs/recommendations.md`
- パフォーマンステストスクリプト（オプション）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-3-1-A（SkillExecutor SDK query()基本実装）が完了していること ✅
- TASK-3-1-B（IPC Handler統合）が完了していること（推奨）
- Claude Agent SDK APIキーが設定されていること

### 3.2 依存タスク

| タスクID   | タスク名             | ステータス |
| ---------- | -------------------- | ---------- |
| TASK-3-1-A | SDK query() 基本実装 | 完了       |
| TASK-3-1-B | IPC Handler統合      | 未実施     |

### 3.3 必要な知識

- Node.js パフォーマンス計測（performance.now()、process.memoryUsage()）
- Claude Agent SDK API
- Electron メモリプロファイリング

### 3.4 推奨アプローチ

#### 応答時間計測

```typescript
// パフォーマンステストスクリプト例
async function measureResponseTime(iterations: number = 100) {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await skillExecutor.execute(testRequest, testSkill);
    const end = performance.now();
    times.push(end - start);
  }

  return {
    average: times.reduce((a, b) => a + b, 0) / times.length,
    p95: percentile(times, 95),
    p99: percentile(times, 99),
    min: Math.min(...times),
    max: Math.max(...times),
  };
}
```

#### メモリ使用量モニタリング

```typescript
async function monitorMemory(durationMinutes: number = 60) {
  const samples: MemorySample[] = [];
  const intervalMs = 10000; // 10秒ごと

  const interval = setInterval(() => {
    const usage = process.memoryUsage();
    samples.push({
      timestamp: Date.now(),
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      rss: usage.rss,
    });
  }, intervalMs);

  // 継続的にスキル実行
  for (let i = 0; i < durationMinutes * 6; i++) {
    await skillExecutor.execute(testRequest, testSkill);
    await sleep(10000);
  }

  clearInterval(interval);
  return samples;
}
```

#### 同時実行テスト

```typescript
async function testConcurrentExecution(concurrency: number = 10) {
  const promises = Array(concurrency)
    .fill(null)
    .map(() => skillExecutor.execute(testRequest, testSkill));

  const results = await Promise.allSettled(promises);

  return {
    succeeded: results.filter((r) => r.status === "fulfilled").length,
    failed: results.filter((r) => r.status === "rejected").length,
    errors: results
      .filter((r) => r.status === "rejected")
      .map((r) => (r as PromiseRejectedResult).reason),
  };
}
```

---

## 4. 実行手順

### Phase構成

3フェーズ構成（テスト・計測タスク）

### Phase 1: テスト環境準備

#### 目的

パフォーマンステスト環境をセットアップする

#### 手順

1. 本番SDK接続設定を確認
2. テストスクリプトを作成
3. 計測ツールを準備

#### 成果物

- `scripts/performance-test.ts`
- `scripts/memory-monitor.ts`

#### 完了条件

- テストスクリプトが動作する
- SDK接続が成功する

### Phase 2: テスト実行・計測

#### 目的

各種パフォーマンステストを実行する

#### 手順

1. 応答時間テスト実行（100回繰り返し）
2. 同時実行テスト（5, 10, 20同時）
3. 長時間実行テスト（1時間）
4. メモリ使用量記録

#### 成果物

- 計測データ（CSV/JSON）

#### 完了条件

- 全テストが完了している
- データが収集されている

### Phase 3: レポート作成

#### 目的

計測結果を分析しレポートを作成する

#### 手順

1. データ分析
2. グラフ作成（オプション）
3. ベンチマークレポート作成
4. 改善推奨事項まとめ

#### 成果物

- `outputs/performance-benchmark-report.md`
- `outputs/recommendations.md`

#### 完了条件

- レポートが完成している
- 推奨事項が明記されている

---

## 5. 完了条件チェックリスト

### テスト要件

- [ ] 応答時間テスト（100回以上）が完了している
- [ ] 同時実行テスト（5/10/20同時）が完了している
- [ ] 長時間実行テスト（1時間以上）が完了している
- [ ] メモリ使用量が記録されている

### レポート要件

- [ ] ベンチマークレポートが作成されている
- [ ] メモリプロファイルが作成されている
- [ ] 改善推奨事項が明記されている

---

## 6. 検証方法

### 計測項目

| 項目               | 目標値                 | 備考                   |
| ------------------ | ---------------------- | ---------------------- |
| 平均応答時間       | < 5秒                  | 簡単なプロンプトの場合 |
| P95応答時間        | < 10秒                 |                        |
| メモリ増加率       | < 10MB/時間            | 長時間実行時           |
| 同時実行成功率     | 100%（5同時）          | 制限内の場合           |
| 同時実行制限エラー | 明確なエラーメッセージ | 制限超過時             |

### 判定基準

- メモリリークの兆候がないこと
- 応答時間が許容範囲内であること
- 同時実行制限が正しく動作すること

---

## 7. リスクと対策

| リスク             | 影響度 | 発生確率 | 対策                         |
| ------------------ | ------ | -------- | ---------------------------- |
| APIコスト増大      | 中     | 高       | テスト回数を制限、モック併用 |
| 長時間テスト中断   | 低     | 中       | チェックポイント保存         |
| 環境依存の結果差異 | 中     | 中       | 複数環境でテスト             |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/TASK-3-1-A-sdk-query/outputs/phase-11/discovered-issues.md`
- `docs/30-workflows/TASK-3-1-A-sdk-query/outputs/phase-12/implementation-guide.md`

### 参考資料

- Node.js Performance Hooks: https://nodejs.org/api/perf_hooks.html
- Electron Memory Management: https://www.electronjs.org/docs/latest/tutorial/performance

---

## 9. 備考

### 発見元の原文

```
今後の確認事項（Phase 11 discovered-issues.md より）:
1. 実SDK接続時の応答時間計測
2. 長時間実行時のメモリ使用量モニタリング
3. 高頻度実行時のパフォーマンス測定
```

### 補足事項

- 本タスクは情報収集が主目的
- 改善実装は別タスクとして切り出す
- APIコストを考慮してテスト回数を調整
