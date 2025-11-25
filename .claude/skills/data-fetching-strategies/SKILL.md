---
name: data-fetching-strategies
description: |
  Reactにおけるデータフェッチとキャッシュのベストプラクティスを専門とするスキル。
  SWR、React Queryを活用した効率的なサーバー状態管理を提供します。

  専門分野:
  - SWR/React Query選択: ユースケースに応じたライブラリ選定
  - キャッシュ戦略: stale-while-revalidate、キャッシュ無効化、再検証トリガー
  - Optimistic Updates: 楽観的更新によるUX向上
  - エラー・ローディング状態: 堅牢なUI状態管理

  使用タイミング:
  - データフェッチライブラリを選定する時
  - キャッシュ戦略を設計する時
  - 楽観的更新を実装する時
  - サーバー状態とクライアント状態を分離する時

  Use proactively when implementing data fetching, caching strategies,
  or optimistic updates in React applications.
version: 1.0.0
---

# Data Fetching Strategies

## 概要

このスキルは、Reactアプリケーションにおけるデータフェッチとキャッシュ管理の
ベストプラクティスを提供します。SWRとReact Queryの特性を理解し、
ユースケースに応じた最適な選択と実装パターンを提供します。

**核心思想**: サーバー状態とクライアント状態は本質的に異なるものとして分離管理する

**主要な価値**:
- 効率的なキャッシュによるパフォーマンス向上
- 楽観的更新によるUX改善
- 堅牢なエラーハンドリングとローディング状態管理

## リソース構造

```
data-fetching-strategies/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── library-comparison.md                  # SWR vs React Query比較
│   ├── caching-patterns.md                    # キャッシュパターン
│   ├── optimistic-updates.md                  # 楽観的更新パターン
│   └── error-loading-states.md                # エラー・ローディング管理
├── scripts/
│   └── analyze-data-fetching.mjs              # データフェッチ分析スクリプト
└── templates/
    ├── swr-hook-template.md                   # SWRフックテンプレート
    └── react-query-hook-template.md           # React Queryフックテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# ライブラリ比較
cat .claude/skills/data-fetching-strategies/resources/library-comparison.md

# キャッシュパターン
cat .claude/skills/data-fetching-strategies/resources/caching-patterns.md

# 楽観的更新パターン
cat .claude/skills/data-fetching-strategies/resources/optimistic-updates.md

# エラー・ローディング管理
cat .claude/skills/data-fetching-strategies/resources/error-loading-states.md
```

### スクリプト実行

```bash
# データフェッチ分析
node .claude/skills/data-fetching-strategies/scripts/analyze-data-fetching.mjs <file.tsx>
```

### テンプレート参照

```bash
# SWRフックテンプレート
cat .claude/skills/data-fetching-strategies/templates/swr-hook-template.md

# React Queryフックテンプレート
cat .claude/skills/data-fetching-strategies/templates/react-query-hook-template.md
```

## いつ使うか

### シナリオ1: ライブラリ選定
**状況**: データフェッチライブラリを選ぶ必要がある

**適用条件**:
- [ ] 新規プロジェクトまたはリファクタリング
- [ ] サーバー状態管理が必要
- [ ] キャッシュ戦略が重要

**期待される成果**: 要件に最適なライブラリの選定と設定

### シナリオ2: キャッシュ最適化
**状況**: データの鮮度とパフォーマンスのバランスが必要

**適用条件**:
- [ ] データの更新頻度が定義されている
- [ ] ユーザー体験への影響が考慮されている
- [ ] ネットワークコストが考慮されている

**期待される成果**: 最適なキャッシュ戦略の実装

### シナリオ3: 楽観的更新
**状況**: ユーザー操作のレスポンスを即座にしたい

**適用条件**:
- [ ] ユーザーが待つ必要があるミューテーション
- [ ] 失敗時のロールバックが許容される
- [ ] UX向上が優先される

**期待される成果**: 楽観的更新の実装とロールバック処理

## 知識領域

### 領域1: ライブラリ選択基準

| 観点 | SWR | React Query |
|------|-----|-------------|
| 学習曲線 | 緩やか | やや急 |
| バンドルサイズ | 小さい | やや大きい |
| キャッシュ制御 | シンプル | 細かい制御可能 |
| DevTools | 基本的 | 高機能 |
| ミューテーション | シンプル | 強力 |
| 推奨ケース | シンプルなキャッシュ | 複雑なサーバー状態 |

**詳細は**: `resources/library-comparison.md` を参照

### 領域2: キャッシュ戦略

**stale-while-revalidate**:
1. キャッシュからデータを即座に返す（stale）
2. バックグラウンドで再検証（revalidate）
3. 新しいデータで更新

**再検証トリガー**:
- フォーカス時再検証
- ネットワーク復帰時再検証
- 定期的なポーリング
- ミューテーション後の再検証

**詳細は**: `resources/caching-patterns.md` を参照

### 領域3: 楽観的更新

**基本フロー**:
1. UI を即座に更新（楽観的）
2. サーバーにリクエストを送信
3. 成功時: 確定
4. 失敗時: ロールバック

**考慮事項**:
- ロールバック時のユーザー通知
- 複数の同時ミューテーション
- 競合状態の処理

**詳細は**: `resources/optimistic-updates.md` を参照

### 領域4: エラー・ローディング状態

**状態の種類**:
- `idle`: 初期状態
- `loading`: データ取得中
- `success`: データ取得成功
- `error`: エラー発生

**UI パターン**:
- スケルトンローダー
- インラインエラー
- リトライボタン
- フォールバックUI

**詳細は**: `resources/error-loading-states.md` を参照

## ワークフロー

### Phase 1: 要件分析
1. データの更新頻度を確認
2. リアルタイム性の要件を確認
3. オフライン対応の必要性を確認

### Phase 2: ライブラリ選定
1. 要件に基づいてSWR/React Queryを選択
2. 必要なプラグイン/オプションを特定
3. プロジェクトに導入

### Phase 3: キャッシュ設計
1. キャッシュキーの設計
2. 再検証戦略の決定
3. キャッシュ無効化ルールの設定

### Phase 4: 実装
1. データフェッチフックの実装
2. ミューテーションの実装
3. 楽観的更新の実装（必要に応じて）

### Phase 5: テスト
1. 正常系のテスト
2. エラー系のテスト
3. キャッシュ動作のテスト

## 設計原則

### サーバー状態分離の原則
サーバーから取得するデータ（サーバー状態）と、
クライアントのみで管理するデータ（クライアント状態）を明確に分離する。

### キャッシュファーストの原則
可能な限りキャッシュからデータを返し、バックグラウンドで鮮度を確保する。

### 楽観的UXの原則
ユーザー操作には即座にフィードバックを返し、失敗時は適切にロールバックする。

### 段階的開示の原則
ローディング、成功、エラー状態を適切にUIで表現し、ユーザーに状況を伝える。

## 関連スキル

- `.claude/skills/react-hooks-advanced/SKILL.md` - React Hooks最適化
- `.claude/skills/custom-hooks-patterns/SKILL.md` - カスタムフック設計
- `.claude/skills/error-boundary/SKILL.md` - エラーハンドリング
- `.claude/skills/state-lifting/SKILL.md` - 状態の持ち上げ

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版リリース |
