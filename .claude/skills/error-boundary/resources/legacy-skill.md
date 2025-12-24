---
name: .claude/skills/error-boundary/SKILL.md
description: |
    ReactにおけるError Boundaryとエラーハンドリングのベストプラクティスを専門とするスキル。
    堅牢なエラー処理とユーザーフレンドリーなフォールバックUIを提供します。
    専門分野:
    - Error Boundary: クラスコンポーネントによるエラーキャッチ
    - フォールバックUI: エラー時の代替表示パターン
    - エラー報告: 外部サービスへのエラー送信
    - リカバリー戦略: エラーからの復旧パターン
    使用タイミング:
    - アプリケーションのエラーハンドリングを設計する時
    - クラッシュからの回復UIを実装する時
    - エラー監視を設定する時
    - 非同期エラーを処理する時
    Use proactively when implementing error handling,
    designing fallback UIs, or setting up error monitoring.

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/error-boundary/resources/error-boundary-basics.md`: Error Boundaryの基本実装とライフサイクルメソッド
  - `.claude/skills/error-boundary/resources/error-reporting.md`: エラー監視サービス連携とスタックトレース送信
  - `.claude/skills/error-boundary/resources/fallback-ui-patterns.md`: エラー時のフォールバックUI設計パターン集
  - `.claude/skills/error-boundary/resources/recovery-strategies.md`: エラーからの復旧戦略とリトライ機構
  - `.claude/skills/error-boundary/templates/error-boundary-template.md`: Error Boundaryコンポーネントのテンプレート
  - `.claude/skills/error-boundary/templates/error-fallback-template.md`: フォールバックUIコンポーネントのテンプレート
  - `.claude/skills/error-boundary/scripts/analyze-error-handling.mjs`: エラーハンドリング実装の分析スクリプト

version: 1.0.0
---

# Error Boundary

## 概要

このスキルは、React アプリケーションにおける Error Boundary と
エラーハンドリングのベストプラクティスを提供します。
「グレースフルデグラデーション」の原則に基づき、
エラー時もユーザー体験を維持する設計を支援します。

**核心思想**: エラーは起きるもの。重要なのは、エラー時にユーザーを助けること

**主要な価値**:

- アプリケーション全体のクラッシュ防止
- ユーザーフレンドリーなエラー表示
- 効果的なエラー監視と分析

## リソース構造

```
error-boundary/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── error-boundary-basics.md               # Error Boundary基礎
│   ├── fallback-ui-patterns.md                # フォールバックUIパターン
│   ├── error-reporting.md                     # エラー報告・監視
│   └── recovery-strategies.md                 # リカバリー戦略
├── scripts/
│   └── analyze-error-handling.mjs             # エラーハンドリング分析
└── templates/
    ├── error-boundary-template.md             # Error Boundaryテンプレート
    └── error-fallback-template.md             # フォールバックUIテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# Error Boundary基礎
cat .claude/skills/error-boundary/resources/error-boundary-basics.md

# フォールバックUIパターン
cat .claude/skills/error-boundary/resources/fallback-ui-patterns.md

# エラー報告
cat .claude/skills/error-boundary/resources/error-reporting.md

# リカバリー戦略
cat .claude/skills/error-boundary/resources/recovery-strategies.md
```

### スクリプト実行

```bash
# エラーハンドリング分析
node .claude/skills/error-boundary/scripts/analyze-error-handling.mjs <file.tsx>
```

### テンプレート参照

```bash
# Error Boundaryテンプレート
cat .claude/skills/error-boundary/templates/error-boundary-template.md

# フォールバックUIテンプレート
cat .claude/skills/error-boundary/templates/error-fallback-template.md
```

## いつ使うか

### シナリオ 1: Error Boundary 実装

**状況**: コンポーネントツリーのエラーをキャッチしたい

**適用条件**:

- [ ] 特定の UI 領域をエラーから保護したい
- [ ] エラー時に代替 UI を表示したい
- [ ] ユーザーにリカバリーオプションを提供したい

**期待される成果**: 堅牢な Error Boundary の実装

### シナリオ 2: フォールバック UI 設計

**状況**: エラー時のユーザー体験を改善したい

**適用条件**:

- [ ] エラーの種類に応じた表示が必要
- [ ] ユーザーアクション（再試行など）を提供したい
- [ ] ブランドに合ったエラー表示が必要

**期待される成果**: ユーザーフレンドリーなフォールバック UI

### シナリオ 3: エラー監視設定

**状況**: プロダクションのエラーを追跡したい

**適用条件**:

- [ ] エラーの発生頻度を把握したい
- [ ] エラーの原因を特定したい
- [ ] ユーザー影響を測定したい

**期待される成果**: 効果的なエラー監視システム

## 知識領域

### 領域 1: Error Boundary の基本

**キャッチできるエラー**:

- レンダリング中のエラー
- ライフサイクルメソッド内のエラー
- コンストラクタ内のエラー

**キャッチできないエラー**:

- イベントハンドラ内のエラー
- 非同期コード（setTimeout、Promise）
- サーバーサイドレンダリング
- Error Boundary 自身のエラー

**詳細は**: `resources/error-boundary-basics.md` を参照

### 領域 2: フォールバック UI パターン

| パターン           | 適用ケース                       |
| ------------------ | -------------------------------- |
| シンプルエラー     | 重要でない機能のエラー           |
| 再試行付き         | 一時的なエラーの可能性がある場合 |
| 詳細情報付き       | 開発/デバッグ時                  |
| カスタムアクション | 特定の回復手段がある場合         |

**詳細は**: `resources/fallback-ui-patterns.md` を参照

### 領域 3: エラー報告

**報告すべき情報**:

- エラーメッセージとスタックトレース
- コンポーネントスタック
- ユーザーコンテキスト
- アプリケーション状態

**主要なサービス**:

- Sentry
- Bugsnag
- LogRocket
- DataDog

**詳細は**: `resources/error-reporting.md` を参照

### 領域 4: リカバリー戦略

**戦略**:

1. **再試行**: 同じ操作を再実行
2. **リセット**: コンポーネント状態をリセット
3. **フォールバック**: 代替機能を提供
4. **ナビゲーション**: 安全なページに移動

**詳細は**: `resources/recovery-strategies.md` を参照

## ワークフロー

### Phase 1: エラー分析

1. エラーが発生する可能性のある箇所を特定
2. エラーの影響範囲を評価
3. 適切な Error Boundary 配置を決定

### Phase 2: Error Boundary 実装

1. クラスコンポーネントで Error Boundary を作成
2. getDerivedStateFromError でエラー状態を設定
3. componentDidCatch でエラーをログ

### Phase 3: フォールバック UI 実装

1. エラーの種類に応じた UI を設計
2. リカバリーアクションを実装
3. ユーザーフィードバックを追加

### Phase 4: 監視設定

1. エラー報告サービスを統合
2. アラートを設定
3. ダッシュボードを構築

## 設計原則

### グレースフルデグラデーションの原則

エラーが発生しても、可能な限り機能を維持する。
全体がクラッシュするより、一部が使えなくなる方が良い。

### ユーザー中心のエラー表示

技術的なエラーメッセージではなく、ユーザーが理解でき、
次のアクションがわかるメッセージを表示する。

### 多層防御の原則

複数のレイヤーでエラーをキャッチする。
グローバル → ページ → セクション → コンポーネント

### 透明性の原則

開発時はエラーの詳細を表示し、
本番ではユーザーフレンドリーなメッセージを表示する。

## 関連スキル

- `.claude/skills/react-hooks-advanced/SKILL.md` - useErrorBoundary
- `.claude/skills/data-fetching-strategies/SKILL.md` - フェッチエラー処理
- `.claude/skills/state-lifting/SKILL.md` - エラー状態の伝播
- `.claude/skills/custom-hooks-patterns/SKILL.md` - エラー処理フック

## 変更履歴

| バージョン | 日付       | 変更内容     |
| ---------- | ---------- | ------------ |
| 1.0.0      | 2025-11-25 | 初版リリース |
