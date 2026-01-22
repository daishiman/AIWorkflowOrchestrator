# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 4                                 |
| Phase名    | テスト作成                        |
| 前提Phase  | Phase 3                           |
| 後続Phase  | Phase 5                           |
| ステータス | 未実施                            |
| 作成日     | 2026-01-22                        |
| 機能名     | chat-history-provider-integration |

---

## 目的

TDD（テスト駆動開発）のRed段階として、実装前に失敗するテストを作成する。これにより、実装の期待動作を明確化し、実装完了を検証可能にする。

## 背景

Phase 2で設計されたテスト設計に基づき、具体的なテストコードを作成する。テストは実装前に作成し、失敗することを確認する（Red状態）。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: リポジトリファクトリーテスト作成

**目的**: リポジトリファクトリーのテストを作成する

**実行手順**:

1. テストファイルを作成する:
   - `apps/desktop/src/features/chat-history/repositories/__tests__/index.test.ts`
2. 以下のテストケースを実装する:
   - リポジトリファクトリーがDrizzleChatSessionRepositoryを返すこと
   - リポジトリファクトリーがDrizzleChatMessageRepositoryを返すこと
   - リポジトリがシングルトンであること（複数回呼び出しで同一インスタンス）
3. テストを実行し、失敗することを確認する（Red状態）
4. テスト作成結果を記録する

**期待される成果物**:

- `apps/desktop/src/features/chat-history/repositories/__tests__/index.test.ts`

---

### タスク2: App.tsx統合テスト作成

**目的**: App.tsxへのProvider統合テストを作成する

**実行手順**:

1. テストファイルを作成または更新する:
   - `apps/desktop/src/features/chat-history/__tests__/AppIntegration.test.tsx`
2. 以下のテストケースを実装する:
   - ChatHistoryProviderがApp.tsxでラップされていること
   - 子コンポーネントからuseChatHistoryが使用可能なこと
   - isReadyフラグがtrueに遷移すること
3. テストを実行し、失敗することを確認する（Red状態）
4. テスト作成結果を記録する

**期待される成果物**:

- `apps/desktop/src/features/chat-history/__tests__/AppIntegration.test.tsx`

---

### タスク3: Context伝播テスト作成

**目的**: Context値が正しく伝播するかのテストを作成する

**実行手順**:

1. 既存のテストファイルを更新する:
   - `apps/desktop/src/features/chat-history/__tests__/ChatHistoryIntegration.test.tsx`
2. 以下のテストケースを追加する:
   - 深くネストしたコンポーネントからuseChatHistoryが使用可能なこと
   - 各Use Case（createSession, addUserMessage等）が呼び出し可能なこと
   - Provider未設定時にエラーがスローされること
3. テストを実行し、失敗することを確認する（Red状態）
4. テスト作成結果を記録する

**期待される成果物**:

- `apps/desktop/src/features/chat-history/__tests__/ChatHistoryIntegration.test.tsx`（更新）

---

### タスク4: エラーハンドリングテスト作成

**目的**: エラー発生時の挙動をテストする

**実行手順**:

1. テストファイルを作成する:
   - `apps/desktop/src/features/chat-history/__tests__/ErrorHandling.test.tsx`
2. 以下のテストケースを実装する:
   - Repository未提供時にエラーがスローされること
   - 初期化失敗時の挙動
3. テストを実行し、失敗することを確認する（Red状態）
4. テスト作成結果を記録する

**期待される成果物**:

- `apps/desktop/src/features/chat-history/__tests__/ErrorHandling.test.tsx`

---

### タスク5: テスト作成サマリー

**目的**: Phase 4の成果物をサマリーとしてまとめる

**実行手順**:

1. 作成したテストの一覧を作成する
2. 各テストのRed状態を確認する
3. サマリーを `outputs/phase-4/test-creation-summary.md` に出力する

**期待される成果物**:

- `outputs/phase-4/test-creation-summary.md`

---

## 参照資料

| 参照資料       | パス                                                                                   | 内容                        |
| -------------- | -------------------------------------------------------------------------------------- | --------------------------- |
| テスト設計     | `outputs/phase-2/test-design.md`                                                       | Phase 2で作成したテスト設計 |
| MockProvider   | `apps/desktop/src/features/chat-history/context/__mocks__/MockChatHistoryProvider.tsx` | 既存のMockProvider          |
| 既存統合テスト | `apps/desktop/src/features/chat-history/__tests__/ChatHistoryIntegration.test.tsx`     | 既存の統合テスト            |

---

## 成果物

| 成果物                       | パス                                                                               | 内容               |
| ---------------------------- | ---------------------------------------------------------------------------------- | ------------------ |
| リポジトリファクトリーテスト | `apps/desktop/src/features/chat-history/repositories/__tests__/index.test.ts`      | ファクトリーテスト |
| App統合テスト                | `apps/desktop/src/features/chat-history/__tests__/AppIntegration.test.tsx`         | App.tsx統合テスト  |
| Context伝播テスト            | `apps/desktop/src/features/chat-history/__tests__/ChatHistoryIntegration.test.tsx` | 統合テスト更新     |
| エラーハンドリングテスト     | `apps/desktop/src/features/chat-history/__tests__/ErrorHandling.test.tsx`          | エラー処理テスト   |
| テスト作成サマリー           | `outputs/phase-4/test-creation-summary.md`                                         | テスト作成サマリー |

---

## 統合テスト連携（Phase 1〜11は必須）

Provider統合テストシナリオを作成する:

- Provider統合テストの実装
- Repository注入テストの実装
- Context伝播テストの実装

---

## 完了条件

- [ ] リポジトリファクトリーテストが作成されている
- [ ] App.tsx統合テストが作成されている
- [ ] Context伝播テストが作成/更新されている
- [ ] エラーハンドリングテストが作成されている
- [ ] 全てのテストがRed状態（失敗）であること
- [ ] テスト作成サマリーが作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜5）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --run
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が完了していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/chat-history-provider-integration/phase-5-implementation.md`
