# ChatHistoryProvider App Integration - タスク指示書

## メタ情報

| 項目         | 内容                                 |
| ------------ | ------------------------------------ |
| タスクID     | UT-007                               |
| タスク名     | ChatHistoryProvider App Integration  |
| 分類         | 実装                                 |
| 対象機能     | チャット履歴機能（chat-history）     |
| 優先度       | 高                                   |
| 見積もり規模 | 小規模                               |
| ステータス   | 未実施                               |
| 発見元       | Phase 12（UT-006完了後の後続タスク） |
| 発見日       | 2026-01-22                           |
| 関連タスク   | UT-006 React Context DI実装          |
| 依存タスク   | UT-006 React Context DI実装（完了）  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-006にてReact Context DI（ChatHistoryContext, ChatHistoryProvider, useChatHistory）が実装された。しかし、これらはまだElectronデスクトップアプリのエントリポイントに統合されていない。

Providerをアプリのルートレベルでラップすることで、全てのコンポーネントからUse Casesにアクセス可能になる。

### 1.2 問題点・課題

- ChatHistoryProviderがアプリエントリポイントに未統合
- チャット履歴機能がUIコンポーネントから利用できない状態
- DrizzleリポジトリとProviderの接続が未実装

### 1.3 放置した場合の影響

- チャット履歴UIコンポーネントの実装がブロックされる
- useChatHistory hookが使用できない
- チャット履歴機能がデスクトップアプリで動作しない

---

## 2. 何を達成するか（What）

### 2.1 目的

ChatHistoryProviderをElectronデスクトップアプリのエントリポイントに統合し、全コンポーネントからチャット履歴Use Casesへのアクセスを可能にする。

### 2.2 最終ゴール

- ChatHistoryProviderがアプリルートでラップされている
- DrizzleリポジトリがProviderに正しく注入されている
- 任意のコンポーネントからuseChatHistoryが使用可能
- 初期化状態（isReady）が正しく管理されている

### 2.3 スコープ

#### 含むもの

- アプリエントリポイント（main.tsx または App.tsx）の更新
- DrizzleリポジトリのProvider注入設定
- 初期化処理の実装（DB接続確認）
- 基本的な動作確認テスト

#### 含まないもの

- UIコンポーネントの実装（別タスク: UT-008）
- 状態管理ライブラリとの統合
- パフォーマンス最適化

### 2.4 成果物

| 成果物            | 配置先                                              |
| ----------------- | --------------------------------------------------- |
| 更新されたApp.tsx | `apps/desktop/src/App.tsx`                          |
| 初期化フック      | `apps/desktop/src/features/chat-history/hooks/`     |
| 統合テスト        | `apps/desktop/src/features/chat-history/__tests__/` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-006（React Context DI実装）が完了していること
- Drizzle ORMがセットアップ済みであること
- 以下のファイルが存在すること:
  - `ChatHistoryContext.tsx`
  - `ChatHistoryProvider.tsx`
  - `useChatHistory.ts`

### 3.2 依存タスク

| タスク | ステータス | 必要性 |
| ------ | ---------- | ------ |
| UT-006 | 完了       | 必須   |
| UT-005 | 未着手     | 推奨   |

### 3.3 必要な知識

- React Context API
- Electron Main/Renderer プロセス
- Drizzle ORM

### 3.4 推奨アプローチ

1. Drizzleリポジトリのファクトリーまたはシングルトンを作成
2. App.tsxでChatHistoryProviderをラップ
3. 初期化処理でDB接続を確認
4. 統合テストで動作検証

---

## 4. 実行手順

### Phase構成

| Phase | 名称           | 概要                            |
| ----- | -------------- | ------------------------------- |
| 1     | リポジトリ設定 | Drizzleリポジトリのセットアップ |
| 2     | Provider統合   | App.tsxへのProvider追加         |
| 3     | 初期化実装     | DB接続確認と初期化処理          |
| 4     | テスト・検証   | 統合テストと動作確認            |

---

### Phase 1: リポジトリ設定

#### 目的

DrizzleリポジトリをProviderに注入するための設定を行う。

#### 手順

1. リポジトリファクトリーを作成:

   ```typescript
   // apps/desktop/src/features/chat-history/repositories/index.ts
   import { db } from "@/lib/db";
   import {
     DrizzleChatSessionRepository,
     DrizzleChatMessageRepository,
   } from "@repo/shared";

   export const sessionRepository = new DrizzleChatSessionRepository(db);
   export const messageRepository = new DrizzleChatMessageRepository(db);
   ```

2. エクスポートを設定

#### 成果物

- `repositories/index.ts`

#### 完了条件

- リポジトリがシングルトンとして利用可能

---

### Phase 2: Provider統合

#### 目的

ChatHistoryProviderをアプリルートに追加する。

#### 手順

1. App.tsxを更新:

   ```tsx
   import { ChatHistoryProvider } from "@/features/chat-history/context";
   import {
     sessionRepository,
     messageRepository,
   } from "@/features/chat-history/repositories";

   function App() {
     return (
       <ChatHistoryProvider
         sessionRepository={sessionRepository}
         messageRepository={messageRepository}
       >
         {/* 既存のアプリコンテンツ */}
       </ChatHistoryProvider>
     );
   }
   ```

#### 成果物

- 更新されたApp.tsx

#### 完了条件

- Providerがルートレベルでラップされている

---

### Phase 3: 初期化実装

#### 目的

DB接続確認と初期化状態の管理を実装する。

#### 手順

1. 初期化フックを作成（必要に応じて）
2. ローディング状態のハンドリングを追加
3. エラーハンドリングを実装

#### 成果物

- 初期化ロジック

#### 完了条件

- isReadyフラグが正しく遷移する

---

### Phase 4: テスト・検証

#### 目的

統合が正しく機能することを検証する。

#### 手順

1. 統合テストを作成:

   ```typescript
   describe("ChatHistoryProvider Integration", () => {
     it("should provide use cases throughout the app", () => {
       // テスト実装
     });
   });
   ```

2. ビルドと型チェック:

   ```bash
   pnpm --filter @repo/desktop build
   pnpm --filter @repo/desktop typecheck
   ```

3. テスト実行:

   ```bash
   pnpm --filter @repo/desktop test
   ```

#### 成果物

- 統合テスト
- テストレポート

#### 完了条件

- 全テストパス
- 型エラー0件

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] ChatHistoryProviderがApp.tsxでラップされている
- [ ] DrizzleリポジトリがProviderに注入されている
- [ ] useChatHistoryが任意のコンポーネントで使用可能
- [ ] isReadyフラグが正しく動作する

### 品質要件

- [ ] 型エラー 0件
- [ ] Lintエラー 0件
- [ ] 統合テストパス

### ドキュメント要件

- [ ] 使用例がコメントに含まれている

---

## 6. 検証方法

### テストケース

| #   | テストケース           | 期待結果               |
| --- | ---------------------- | ---------------------- |
| 1   | アプリ起動             | エラーなく起動         |
| 2   | useChatHistory呼び出し | Use Casesが取得できる  |
| 3   | createSession実行      | セッションが作成される |
| 4   | isReady確認            | trueに遷移             |

### 検証手順

1. ビルド・型チェック
2. テスト実行
3. 開発サーバー起動・動作確認

---

## 7. リスクと対策

| リスク                 | 影響度 | 発生確率 | 対策                        |
| ---------------------- | ------ | -------- | --------------------------- |
| DB初期化タイミング問題 | 中     | 中       | 非同期初期化とisReadyフラグ |
| 循環依存               | 高     | 低       | 依存関係の整理              |
| パフォーマンス低下     | 低     | 低       | 将来的にuseMemoで最適化     |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント         | パス                                                                             |
| -------------------- | -------------------------------------------------------------------------------- |
| アーキテクチャ仕様   | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md` |
| React Context DI仕様 | `docs/30-workflows/react-context-di/outputs/phase-12/implementation-guide.md`    |

### 参考資料

- [React Context Documentation](https://react.dev/reference/react/createContext)

---

## 9. 備考

### 補足事項

- 本タスクはUT-006の直接の後続タスク
- UT-008（Chat History UIコンポーネント）の前提条件
- Drizzleリポジトリの実装状況によって手順が変わる可能性あり

---

**作成日**: 2026-01-22
**作成者**: Claude Code
**バージョン**: 1.0
