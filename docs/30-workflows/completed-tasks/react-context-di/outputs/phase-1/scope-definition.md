# Phase 1 - スコープ定義

## 確認日時

2026-01-22

---

## 1. スコープ概要

本タスク（UT-006）は、ReactのContext APIを使用してClean ArchitectureのUse Casesをコンポーネントツリー全体に注入可能にするDI基盤を構築する。

---

## 2. スコープ「含むもの」（In Scope）

| No. | 成果物                    | 説明                                    |
| --- | ------------------------- | --------------------------------------- |
| 1   | ChatHistoryContext        | Use Casesを保持するContext型定義        |
| 2   | ChatHistoryProvider       | Contextを提供するProviderコンポーネント |
| 3   | useChatHistory            | Contextから値を取得するCustom Hook      |
| 4   | useChatHistoryFactory     | Use Casesを生成するFactory Hook         |
| 5   | MockChatHistoryProvider   | テスト用モックProvider                  |
| 6   | ユニットテスト            | Context/Provider/Hookの基本テスト       |
| 7   | index.ts (barrel exports) | 各ディレクトリのexportファイル          |

### 詳細説明

#### 2.1 ChatHistoryContext

- 5種のUse Casesインスタンスを保持する型定義
- `createContext`による初期化
- 型安全なContext値

#### 2.2 ChatHistoryProvider

- Repositoryを受け取りUse Casesを生成
- 子コンポーネントにContextを提供
- Repositoriesの初期化・クリーンアップ対応

#### 2.3 useChatHistory

- Provider外使用時にエラースロー
- 型安全なContext値の取得
- Use Casesへの直接アクセス

#### 2.4 useChatHistoryFactory

- Use Casesインスタンスの生成ロジック
- Repositoryを受け取りUse Casesを返す
- テスト容易性を考慮した設計

#### 2.5 MockChatHistoryProvider

- テスト用のモック実装
- 個別のUse Casesをオーバーライド可能
- スパイ/モック関数のサポート

---

## 3. スコープ「含まないもの」（Out of Scope）

| No. | 除外項目                              | 理由                              |
| --- | ------------------------------------- | --------------------------------- |
| 1   | 実際のUI統合                          | 別タスク（UT-007以降）で対応      |
| 2   | フィーチャーフラグ実装                | 本タスクの範囲外                  |
| 3   | 既存レガシーコードのマイグレーション  | 段階的移行は別タスク              |
| 4   | パフォーマンス最適化（過度なuseMemo） | 必要に応じて後続タスクで対応      |
| 5   | Repository実装（Drizzle等）           | UT-005で対応                      |
| 6   | E2Eテスト                             | 本タスクはユニット/結合テストまで |
| 7   | エラーバウンダリ実装                  | 本タスクはエラースローまで        |

---

## 4. 境界条件

### 4.1 入力境界

- Repository Interfaces（`IChatSessionRepository`, `IChatMessageRepository`）はpackages/sharedから取得
- Use Cases実装はpackages/sharedから取得

### 4.2 出力境界

- apps/desktop内のReactコンポーネントにContext/Hookを提供
- テストコードはContext/Hookの動作を検証

### 4.3 依存境界

- `@repo/shared`パッケージへの依存
- React 18+のContext API使用

---

## 5. 前提条件

| 前提                | 詳細                                 |
| ------------------- | ------------------------------------ |
| packages/shared完成 | Use Cases, Repository IFがexport済み |
| React 18+           | Context/Hook APIが使用可能           |
| TypeScript 5.x      | 型安全性を確保                       |
| Vitest環境          | テスト実行環境が整備済み             |

---

## 6. 制約条件

| 制約                    | 詳細                            |
| ----------------------- | ------------------------------- |
| apps/desktop限定        | 本タスクはdesktopアプリのみ対象 |
| Clean Architecture準拠  | 依存性逆転の原則に従う          |
| テストカバレッジ80%以上 | Line Coverageの最低基準         |

---

## 結論

**Phase 1 タスク2: 完了**

スコープの境界が明確に定義され、本タスクで実装する範囲と除外する範囲が確定した。
