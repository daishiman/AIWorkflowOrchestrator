# Level 1: Basics

## 概要

Ryan Dahlのイベント駆動・非同期I/O思想に基づくファイルシステム監視の専門知識。 Chokidarライブラリを中心に、Observer Patternによる効率的なファイル変更検知、 クロスプラットフォーム対応、EventEmitterによる疎結合な通知システムを提供。

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when handling event driven file watching tasks.

### 必要な知識
- 対象領域: Ryan Dahlのイベント駆動・非同期I/O思想に基づくファイルシステム監視の専門知識。 Chokidarライブラリを中心に、Observer Patternによる効率的なファイル変更検知、 クロスプラットフォーム対応、EventEmitterによる疎結合な通知システムを提供。
- 主要概念: Chokidar設定リファレンス / 1. ignored（除外パターン） / 2. awaitWriteFinish（書き込み完了待機） / EventEmitter実装パターン / 基本パターン
- 実務指針: Chokidarによるファイル監視システムを設計・実装する時
- 実務指針: Observer Patternでイベント通知を設計する時
- 実務指針: ファイルシステムイベントのハンドリングを実装する時

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/watcher-template.ts`

### 参照書籍
- 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/watcher-template.ts`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している
