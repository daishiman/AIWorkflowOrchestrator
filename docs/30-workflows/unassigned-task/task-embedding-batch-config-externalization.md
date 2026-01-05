# BatchProcessor設定外部化 - タスク指示書

## メタ情報

| 項目         | 内容                          |
| ------------ | ----------------------------- |
| タスクID     | UNASSIGNED-EMB-003            |
| タスク名     | BatchProcessor設定外部化      |
| 分類         | 改善                          |
| 対象機能     | embedding-generation-pipeline |
| 優先度       | 低                            |
| 見積もり規模 | 小規模                        |
| ステータス   | 未実施                        |
| 発見元       | Phase 7: 最終レビューゲート   |
| 発見日       | 2025-12-26                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 7のアーキテクチャレビューで、BatchProcessorの設定値がハードコードされている可能性が指摘された。

12-Factor Appの原則では、環境ごとに異なる設定は環境変数で管理すべきとされている。

### 1.2 問題点・課題

**現在の問題**:

- バッチサイズ、並列度などがコード内に固定
- 環境ごと（開発/ステージング/本番）の設定変更にコード修正が必要
- パフォーマンスチューニングが煩雑

**12-Factor App違反**:

- III. Config: 設定は環境変数で管理すべき
- 現状: コード内にハードコード

### 1.3 放置した場合の影響

**短期的影響**:

- デプロイごとにコード変更が必要
- チューニング作業の手間

**中長期的影響**:

- 運用性の低下
- 環境ごとの最適化が困難

**影響度**: 低（機能は動作するが運用性に影響）

---

## 2. 何を達成するか（What）

### 2.1 目的

BatchProcessorの設定値を環境変数または設定ファイルから読み込めるようにし、環境ごとの柔軟な設定変更を可能にする。

### 2.2 最終ゴール

- 環境変数で全設定を上書き可能
- デフォルト値 < 環境変数 < 引数 の優先順位
- `.env.local.template`に設定例を記載

### 2.3 スコープ

#### 含むもの

- ✅ BatchProcessorConfig型定義
- ✅ loadBatchProcessorConfig()関数
- ✅ BatchProcessorのコンストラクタ修正
- ✅ .env.local.templateの更新
- ✅ ユニットテスト

#### 含まないもの

- ❌ 他のサービスの設定外部化
- ❌ JSON設定ファイル対応（将来拡張として検討）

### 2.4 成果物

1. `packages/shared/src/services/embedding/config/batch-processor-config.ts`
2. `packages/shared/src/services/embedding/config/load-batch-config.ts`
3. 修正された`batch-processor.ts`
4. 更新された`.env.local.template`
5. テストファイル

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] BatchProcessorが実装済み
- [ ] dotenvまたは環境変数読み込み機構が設定済み
- [ ] 既存テストが通過

### 3.2 依存タスク

なし

### 3.3 必要な知識・スキル

- 環境変数の扱い
- TypeScriptのinterface定義
- 12-Factor Appの原則

### 3.4 推奨アプローチ

1. 設定型を先に定義
2. 環境変数読み込み関数を実装
3. BatchProcessorを段階的に修正
4. テストで検証

---

## 4. 実行手順

### Phase構成

```
Phase 1: 設定型定義
Phase 2: 環境変数読み込み関数実装
Phase 3: BatchProcessor修正
Phase 4: テスト作成
```

### Phase 1: 設定型定義

#### 実行手順

`packages/shared/src/services/embedding/config/batch-processor-config.ts`:

```typescript
export interface BatchProcessorConfig {
  batchSize: number;
  concurrency: number;
  delayBetweenBatches: number;
  maxRetries: number;
  timeout: number;
}

export const DEFAULT_BATCH_CONFIG: BatchProcessorConfig = {
  batchSize: 50,
  concurrency: 2,
  delayBetweenBatches: 100,
  maxRetries: 3,
  timeout: 30000,
};
```

#### 成果物

- ✅ `batch-processor-config.ts`

#### 完了条件

- [ ] インターフェースとデフォルト値が定義されている

### Phase 2: 環境変数読み込み

#### 実行手順

`packages/shared/src/services/embedding/config/load-batch-config.ts`:

```typescript
export function loadBatchProcessorConfig(
  env: NodeJS.ProcessEnv = process.env,
): BatchProcessorConfig {
  return {
    batchSize: parseIntEnv(
      env.EMBEDDING_BATCH_SIZE,
      DEFAULT_BATCH_CONFIG.batchSize,
    ),
    concurrency: parseIntEnv(
      env.EMBEDDING_CONCURRENCY,
      DEFAULT_BATCH_CONFIG.concurrency,
    ),
    // ... 他の設定
  };
}

function parseIntEnv(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}
```

#### 成果物

- ✅ `load-batch-config.ts`

#### 完了条件

- [ ] 全設定が環境変数から読み込める
- [ ] デフォルト値が適用される

### Phase 3: BatchProcessor修正

#### 実行手順

コンストラクタで設定をマージ:

```typescript
constructor(config?: Partial<BatchProcessorConfig>) {
  const envConfig = loadBatchProcessorConfig();
  this.config = {
    ...DEFAULT_BATCH_CONFIG,
    ...envConfig,
    ...config,
  };
}
```

#### 成果物

- ✅ 修正された`batch-processor.ts`

#### 完了条件

- [ ] 設定の優先順位が正しい

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] BatchProcessorConfigが定義されている
- [ ] loadBatchProcessorConfig()が実装されている
- [ ] 環境変数で設定を上書きできる
- [ ] 優先順位が正しい（デフォルト < 環境変数 < 引数）

### 品質要件

- [ ] ユニットテストが追加されている
- [ ] 無効な環境変数を処理できる
- [ ] 全テストが通過する

### ドキュメント要件

- [ ] .env.local.templateに設定例が記載されている

---

## 6. 検証方法

### テストケース

| No  | テストケース | 期待結果                     |
| --- | ------------ | ---------------------------- |
| 1   | 環境変数なし | デフォルト値が使用される     |
| 2   | 環境変数あり | 環境変数の値が使用される     |
| 3   | 無効な値     | デフォルト値にフォールバック |

### 検証手順

```bash
pnpm test load-batch-config
pnpm test batch-processor
```

---

## 7. リスクと対策

| リスク             | 影響度 | 発生確率 | 対策                               |
| ------------------ | ------ | -------- | ---------------------------------- |
| 既存の動作が変わる | 低     | 低       | デフォルト値を現在の値と同じにする |
| 環境変数の設定ミス | 中     | 中       | バリデーションとデフォルト値で対応 |

---

## 8. 参照情報

### 関連ドキュメント

- [Phase 7 最終レビュー結果](../embedding-generation-pipeline/review-final.md)
- [BatchProcessor実装](../../../packages/shared/src/services/embedding/batch-processor.ts)

### 参考資料

- The Twelve-Factor App: https://12factor.net/config

---

## 9. 備考

### レビュー指摘の原文

```
Phase 7: arch-police エージェント

BatchProcessorの設定外部化

問題: バッチサイズやレート制限がハードコードされている可能性
推奨: 設定をコンストラクタ経由で注入可能にする
優先度: 低
```

### 補足事項

- 12-Factor Appの原則に従った設定の外部化
- 本番環境ではSecret Managerとの統合も検討可能
- パフォーマンスチューニングが容易になる
