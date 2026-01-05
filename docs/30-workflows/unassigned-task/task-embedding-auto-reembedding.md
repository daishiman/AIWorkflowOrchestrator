# モデル変更時の自動再埋め込み - タスク指示書

## メタ情報

| 項目         | 内容                          |
| ------------ | ----------------------------- |
| タスクID     | UNASSIGNED-EMB-007            |
| タスク名     | モデル変更時の自動再埋め込み  |
| 分類         | 改善                          |
| 対象機能     | embedding-generation-pipeline |
| 優先度       | 低                            |
| 見積もり規模 | 中規模                        |
| ステータス   | 未実施                        |
| 発見元       | Phase 8: 手動テスト検証       |
| 発見日       | 2025-12-26                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 8の手動テスト時に、運用時のメンテナンス作業の自動化が課題として認識された。

埋め込みモデルを変更した場合（例: text-embedding-ada-002 → text-embedding-3-small）、既存の埋め込みベクトルは新しいモデルと互換性がなくなる。

### 1.2 問題点・課題

**モデル変更時の問題**:

1. **互換性の喪失**
   - 古い埋め込みと新しい埋め込みが混在
   - 異なるベクトル空間での比較は無意味

2. **手動作業の煩雑さ**
   - どのドキュメントを再埋め込みすべきか特定が必要
   - 手動実行は漏れが発生しやすい
   - 大量のドキュメントがある場合、非常に時間がかかる

3. **検索品質の低下**
   - 異なるモデルの埋め込みが混在すると検索品質が著しく低下
   - ユーザー体験の悪化

### 1.3 放置した場合の影響

**短期的影響**:

- モデル変更後も古い埋め込みが使用される
- 検索品質の低下

**中長期的影響**:

- データベースの一貫性喪失
- 運用作業の増加
- モデル変更に対する心理的障壁

**影響度**: 低（現時点ではモデル変更の頻度が低いが、将来的に問題化）

---

## 2. 何を達成するか（What）

### 2.1 目的

埋め込みモデル変更を自動検出し、影響を受けるドキュメントの再埋め込み処理を自動的にトリガーする仕組みを実装する。

### 2.2 最終ゴール

- モデル変更の自動検出
- 再埋め込みジョブの自動起動（オプション）
- 進捗モニタリングとログ出力
- CLIコマンドでの手動実行もサポート

### 2.3 スコープ

#### 含むもの

- ✅ ModelChangeDetector実装
- ✅ ReembeddingJob実装
- ✅ AutoReembeddingOrchestrator実装
- ✅ CLIコマンド実装
- ✅ 進捗イベント機構
- ✅ ジョブの中止機能

#### 含まないもの

- ❌ GUI/UIでの進捗表示
- ❌ Slack/Email通知（将来拡張）
- ❌ 段階的ロールアウト機能（将来拡張）

### 2.4 成果物

1. `packages/shared/src/services/embedding/model-change-detector.ts`
2. `packages/shared/src/services/embedding/reembedding-job.ts`
3. `packages/shared/src/services/embedding/auto-reembedding-orchestrator.ts`
4. `packages/shared/src/services/embedding/cli/reembedding-cli.ts`
5. テストファイル
6. 更新された`package.json`（CLIスクリプト追加）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] EmbeddingServiceが実装済み
- [ ] BatchProcessorが実装済み
- [ ] ドキュメントストアが実装済み
- [ ] モデル情報を永続化できる仕組みがある

### 3.2 依存タスク

- UNASSIGNED-EMB-003: BatchProcessorの設定外部化（推奨）
- UNASSIGNED-EMB-006: Redis統合（キャッシュ無効化との連携）

### 3.3 必要な知識・スキル

- EventEmitter の使用
- CLIツール作成（commander）
- バッチ処理
- ファイルシステム操作

### 3.4 推奨アプローチ

1. モデル変更検出をイベント駆動で実装
2. 再埋め込みジョブは独立したクラスとして実装
3. オーケストレーターで両者を統合
4. CLIで手動実行もサポート

---

## 4. 実行手順

### Phase構成

```
Phase 1: ModelChangeDetector実装
Phase 2: ReembeddingJob実装
Phase 3: AutoReembeddingOrchestrator実装
Phase 4: CLIコマンド実装
Phase 5: テスト作成
```

### Phase 1: ModelChangeDetector実装

#### 目的

モデル変更を検出し、イベント発火

#### 実行手順

主要機能:

- モデル情報の永続化（JSON）
- 前回との比較
- 変更検出時のイベント発火
- リスナー登録機構

#### 成果物

- ✅ `model-change-detector.ts`

#### 完了条件

- [ ] モデル変更を検出できる
- [ ] イベントが発火される

### Phase 2: ReembeddingJob実装

#### 目的

再埋め込み処理のバッチジョブを実装

#### 実行手順

主要機能:

- ドキュメント一覧取得
- バッチ処理で再埋め込み
- 進捗イベント発火
- ジョブの中止機能

#### 成果物

- ✅ `reembedding-job.ts`

#### 完了条件

- [ ] バッチ処理が機能する
- [ ] 進捗が報告される
- [ ] 中止が機能する

### Phase 3: AutoReembeddingOrchestrator実装

#### 目的

ModelChangeDetectorとReembeddingJobを統合

#### 実行手順

主要機能:

- ModelChangeDetectorのイベントをリッスン
- 必要に応じてReembeddingJobを起動
- autoStartフラグで自動/手動を選択

#### 成果物

- ✅ `auto-reembedding-orchestrator.ts`

#### 完了条件

- [ ] イベント連携が機能する
- [ ] 自動起動が機能する

### Phase 4: CLIコマンド実装

#### 目的

コマンドラインから再埋め込みを実行可能に

#### 実行手順

コマンド:

- `pnpm reembed:check` - モデル変更チェック
- `pnpm reembed:run --model <model>` - 再埋め込み実行
- `pnpm reembed:abort` - ジョブ中止

#### 成果物

- ✅ `reembedding-cli.ts`
- ✅ 更新された`package.json`

#### 完了条件

- [ ] CLIコマンドが機能する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] ModelChangeDetectorがモデル変更を検出できる
- [ ] ReembeddingJobがバッチ処理で再埋め込みを実行できる
- [ ] AutoReembeddingOrchestratorが自動的に再埋め込みをトリガーできる
- [ ] CLIコマンドが機能する

### 品質要件

- [ ] ユニットテストが実装されている
- [ ] 進捗イベントが適切に発火される
- [ ] ジョブの中止が機能する
- [ ] 全テストが通過する

### ドキュメント要件

- [ ] CLIコマンドの使用方法が文書化されている
- [ ] 推定処理時間が文書化されている

---

## 6. 検証方法

### テストケース

| No  | テストケース   | 期待結果                   |
| --- | -------------- | -------------------------- |
| 1   | モデル変更検出 | イベントが発火される       |
| 2   | 再埋め込み実行 | ドキュメントが再処理される |
| 3   | ジョブ中止     | 処理が停止する             |
| 4   | CLIコマンド    | 正常に実行される           |

### 検証手順

```bash
pnpm reembed:check
pnpm reembed:run --model text-embedding-3-small
pnpm test model-change-detector
```

---

## 7. リスクと対策

| リスク                 | 影響度 | 発生確率 | 対策                             |
| ---------------------- | ------ | -------- | -------------------------------- |
| 大量データでの処理時間 | 高     | 高       | バックグラウンドジョブとして実行 |
| 処理中のサービス停止   | 中     | 低       | 再開可能な設計                   |
| モデル情報の不整合     | 中     | 低       | JSONファイルの定期バックアップ   |

---

## 8. 参照情報

### 関連ドキュメント

- [Phase 8 パフォーマンステスト結果](../embedding-generation-pipeline/performance-test-manual.md)
- [埋め込みサービス設計](../embedding-generation-pipeline/design-embedding.md)

### 参考資料

- Node.js EventEmitter: https://nodejs.org/api/events.html
- Commander.js: https://github.com/tj/commander.js

---

## 9. 備考

### 補足事項

**推定処理時間**:

| ドキュメント数 | 推定時間 |
| -------------- | -------- |
| 100件          | ~2分     |
| 1,000件        | ~20分    |
| 10,000件       | ~3時間   |

**実行シナリオ**:

手動実行:

```bash
pnpm reembed:check
pnpm reembed:run --model text-embedding-3-small
```

自動実行:

- アプリケーション起動時に自動チェック
- モデル変更検出時に自動実行（autoStart有効時）
