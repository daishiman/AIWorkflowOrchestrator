# Chat History Additional Use Cases - タスク指示書

## メタ情報

```yaml
issue_number: null
```

## メタ情報

| 項目         | 内容                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| タスクID     | UT-009                                                                 |
| タスク名     | Chat History Additional Use Cases                                      |
| 分類         | 実装                                                                   |
| 対象機能     | チャット履歴機能（chat-history）                                       |
| 優先度       | 中                                                                     |
| 見積もり規模 | 中規模                                                                 |
| ステータス   | 未実施                                                                 |
| 発見元       | Phase 12（api-chat-history.md 未実装Use Cases）                        |
| 発見日       | 2026-01-22                                                             |
| 関連タスク   | UT-006 React Context DI実装, UT-007 Provider統合, UT-008 UI Components |
| 依存タスク   | UT-007 ChatHistoryProvider App Integration（完了）                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-006〜UT-008でチャット履歴機能の基盤（Clean Architecture、React Context DI、Provider統合）が実装された。現在実装済みのUse Casesは以下の5つ：

- CreateChatSessionUseCase（新規セッション作成）
- AddUserMessageUseCase（ユーザーメッセージ追加）
- AddAssistantMessageUseCase（AIメッセージ追加）
- TogglePinnedUseCase（ピン留めトグル）
- SearchSessionsUseCase（セッション検索）

しかし、api-chat-history.mdに記載されている「未実装Use Cases（予定）」として以下5つが残っている：

- UpdateSessionTitleUseCase（タイトル更新）
- ToggleFavoriteUseCase（お気に入りトグル）
- DeleteSessionUseCase（セッション削除）
- ExportSessionUseCase（Markdown/JSONエクスポート）
- GetSessionDetailUseCase（セッション詳細取得）

### 1.2 問題点・課題

- セッションタイトルを更新する手段がない
- お気に入り機能が使用できない
- 不要なセッションを削除できない
- セッションのエクスポート機能がない
- セッション詳細を取得するAPIがない

### 1.3 放置した場合の影響

- ユーザーがセッションを整理・管理できない
- お気に入り機能が死蔵状態になる
- データが蓄積される一方で削除できない
- 他のアプリケーションへのデータ移行ができない
- UIコンポーネントの実装がブロックされる

---

## 2. 何を達成するか（What）

### 2.1 目的

5つの追加Use Casesを実装し、チャット履歴機能のCRUD操作を完全にする。

### 2.2 最終ゴール

- UpdateSessionTitleUseCase が実装されている
- ToggleFavoriteUseCase が実装されている
- DeleteSessionUseCase が実装されている
- ExportSessionUseCase が実装されている（Markdown/JSON形式）
- GetSessionDetailUseCase が実装されている
- ChatHistoryContextに新しいUse Casesが追加されている
- 各Use Caseに対応するユニットテストが存在する

### 2.3 スコープ

#### 含むもの

- 5つのUse Case実装（Application層）
- ChatHistoryContext/Providerへの統合
- DTOs定義の拡張
- 各Use Caseのユニットテスト（80%以上カバレッジ）
- リポジトリインターフェースの拡張（必要な場合）

#### 含まないもの

- UIコンポーネントの実装（別タスク: UT-010等）
- バッチ削除機能
- クラウドエクスポート（Google Drive, Dropbox等）
- インポート機能

### 2.4 成果物

| 成果物                    | パス                                                               |
| ------------------------- | ------------------------------------------------------------------ |
| UpdateSessionTitleUseCase | `packages/shared/src/features/chat-history/application/use-cases/` |
| ToggleFavoriteUseCase     | `packages/shared/src/features/chat-history/application/use-cases/` |
| DeleteSessionUseCase      | `packages/shared/src/features/chat-history/application/use-cases/` |
| ExportSessionUseCase      | `packages/shared/src/features/chat-history/application/use-cases/` |
| GetSessionDetailUseCase   | `packages/shared/src/features/chat-history/application/use-cases/` |
| ChatHistoryContext更新    | `apps/desktop/src/features/chat-history/context/`                  |
| ユニットテスト            | `packages/shared/src/features/chat-history/application/__tests__/` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-007（ChatHistoryProvider App Integration）が完了していること
- Clean Architectureパターンを理解していること
- 以下のファイルが存在すること:
  - ChatSession エンティティ
  - IChatSessionRepository インターフェース
  - ChatHistoryContext/Provider

### 3.2 依存タスク

| タスクID | タスク名                   | ステータス |
| -------- | -------------------------- | ---------- |
| UT-006   | React Context DI実装       | ✅ 完了    |
| UT-007   | ChatHistoryProvider統合    | ✅ 完了    |
| UT-008   | Chat History UI Components | 未実施     |

### 3.3 必要な知識・スキル

- Clean Architectureパターン
- TypeScript
- React Context API
- Jest/Vitestテスト

### 3.4 推奨アプローチ

1. **TDD（テスト駆動開発）** で各Use Caseを実装
2. 既存のUse Case（TogglePinnedUseCase等）を参考に実装
3. ChatHistoryContextValueインターフェースを拡張
4. ChatHistoryProviderに新しいUse Casesを追加

---

## 4. 実行手順

### Phase 1: 要件定義

- 各Use Caseの入出力を定義
- DTOsの設計
- リポジトリ拡張が必要か確認

### Phase 2: 設計

- Use Case詳細設計
- エラーハンドリング設計
- テストケース設計

### Phase 3: テスト作成（TDD: Red）

- 5つのUse Caseのテストを先行作成
- モックリポジトリを使用

### Phase 4: 実装（TDD: Green）

- テストが通る最小限の実装

### Phase 5: リファクタリング

- コード品質改善
- 重複排除

### Phase 6: Context/Provider統合

- ChatHistoryContextValueを拡張
- ChatHistoryProviderに新Use Casesを追加

### Phase 7: 統合テスト

- Provider経由での動作確認
- カバレッジ80%以上達成

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] UpdateSessionTitleUseCase: タイトル更新成功
- [ ] ToggleFavoriteUseCase: お気に入りトグル成功
- [ ] DeleteSessionUseCase: セッション削除成功
- [ ] ExportSessionUseCase: Markdown/JSON出力成功
- [ ] GetSessionDetailUseCase: 詳細取得成功

### 品質要件

- [ ] 型エラー: 0件
- [ ] Lintエラー: 0件
- [ ] ユニットテスト: 全件PASS
- [ ] カバレッジ: Line ≥80%, Branch ≥60%

### ドキュメント要件

- [ ] api-chat-history.md更新
- [ ] architecture-chat-history.md更新

---

## 6. 検証方法

### テストケース

| TC-ID  | Use Case         | シナリオ               | 期待結果         |
| ------ | ---------------- | ---------------------- | ---------------- |
| TC-001 | UpdateTitle      | 正常なタイトル更新     | 成功             |
| TC-002 | UpdateTitle      | 空文字タイトル         | ValidationError  |
| TC-003 | ToggleFavorite   | お気に入り追加         | isFavorite=true  |
| TC-004 | ToggleFavorite   | お気に入り解除         | isFavorite=false |
| TC-005 | DeleteSession    | 存在するセッション削除 | 成功             |
| TC-006 | DeleteSession    | 存在しないセッション   | NotFoundError    |
| TC-007 | ExportSession    | Markdown形式出力       | 有効なMarkdown   |
| TC-008 | ExportSession    | JSON形式出力           | 有効なJSON       |
| TC-009 | GetSessionDetail | 存在するセッション     | 詳細取得成功     |
| TC-010 | GetSessionDetail | 存在しないセッション   | NotFoundError    |

---

## 7. リスクと対策

| リスク                   | 影響度 | 対策                           |
| ------------------------ | ------ | ------------------------------ |
| リポジトリ拡張が必要     | 中     | 事前に必要なメソッドを洗い出す |
| エクスポート形式の複雑化 | 低     | まずMarkdown/JSONのみサポート  |
| Context肥大化            | 中     | 必要に応じてContext分割を検討  |

---

## 8. 参照情報

### 関連ドキュメント

- [api-chat-history.md](/.claude/skills/aiworkflow-requirements/references/api-chat-history.md)
- [architecture-chat-history.md](/.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md)
- [interfaces-chat-history.md](/.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md)
- [UT-007 実装ガイド](../chat-history-provider-integration/outputs/phase-12/implementation-guide.md)

### 参考資料

- Clean Architecture（Robert C. Martin）
- React Context API ドキュメント

---

## 9. 備考

### 発見元情報

api-chat-history.md の「未実装Use Cases（予定）」セクション（行417-426）より検出。

### 実装優先度

1. **GetSessionDetailUseCase** - UIで必須
2. **DeleteSessionUseCase** - ユーザー管理で必須
3. **UpdateSessionTitleUseCase** - UX向上
4. **ToggleFavoriteUseCase** - UX向上
5. **ExportSessionUseCase** - 追加機能

---

**作成日**: 2026-01-22
**作成者**: Claude Code
**ステータス**: 未実施
