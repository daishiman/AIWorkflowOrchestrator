# Phase 4: テスト作成（TDD: Red） - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 4                              |
| Phase名    | テスト作成（TDD: Red）         |
| 前提Phase  | Phase 3（設計レビューゲート）  |
| 後続Phase  | Phase 5（実装）                |
| ステータス | 未実施                         |
| 作成日     | 2026-01-18                     |
| 機能名     | clean-architecture-refactoring |
| タスクID   | ARCH-001                       |

---

## 目的

新しいドメインエンティティ・Use Case・マッパーのテストを実装前に作成する（TDD: Red状態）。

## 背景

TDDサイクルの最初のフェーズとして、まずテストを作成する。これにより、実装の期待動作を明確化し、実装後のリグレッション検出を可能にする。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ドメインエンティティのテスト作成

**目的**: ChatSession/ChatMessageエンティティの単体テストを作成する

**実行手順**:

1. ChatSessionエンティティのテストを作成する:

   ```typescript
   // packages/shared/src/features/chat-history/domain/entities/__tests__/ChatSession.test.ts
   describe("ChatSession", () => {
     describe("create", () => {
       it("有効なパラメータでセッションを作成できる", () => {});
       it("タイトル未指定時はデフォルトタイトルが設定される", () => {});
       it("無効なユーザーIDでエラーを返す", () => {});
     });

     describe("updateTitle", () => {
       it("有効なタイトルで更新できる", () => {});
       it("無効なタイトルでエラーを返す", () => {});
       it("更新後にupdatedAtが更新される", () => {});
     });

     describe("toggleFavorite", () => {
       it("お気に入り状態を切り替えられる", () => {});
     });

     describe("togglePinned", () => {
       it("ピン留め状態を切り替えられる", () => {});
       // ビジネスルール: ピン留め数上限はUse Case層で検証
     });

     describe("updatePreview", () => {
       it("プレビューを更新できる", () => {});
       it("30文字を超える場合は切り詰められる", () => {});
     });
   });
   ```

2. ChatMessageエンティティのテストを作成する:

   ```typescript
   // packages/shared/src/features/chat-history/domain/entities/__tests__/ChatMessage.test.ts
   describe("ChatMessage", () => {
     describe("createUserMessage", () => {
       it("ユーザーメッセージを作成できる", () => {});
       it("空のコンテンツでエラーを返す", () => {});
     });

     describe("createAssistantMessage", () => {
       it("アシスタントメッセージを作成できる", () => {});
       it("LLMメタデータを含めて作成できる", () => {});
     });
   });
   ```

**期待される成果物**:

- `packages/shared/src/features/chat-history/domain/entities/__tests__/ChatSession.test.ts`
- `packages/shared/src/features/chat-history/domain/entities/__tests__/ChatMessage.test.ts`

---

### タスク2: 値オブジェクトのテスト作成

**目的**: 値オブジェクトの単体テストを作成する

**実行手順**:

1. ChatSessionIdのテストを作成する:

   ```typescript
   // packages/shared/src/features/chat-history/domain/value-objects/__tests__/ChatSessionId.test.ts
   describe("ChatSessionId", () => {
     describe("create", () => {
       it("有効なUUIDで作成できる", () => {});
       it("無効な形式でエラーを返す", () => {});
       it("空文字でエラーを返す", () => {});
     });

     describe("generate", () => {
       it("新しいUUIDを生成できる", () => {});
       it("生成されたIDはユニークである", () => {});
     });

     describe("equals", () => {
       it("同じ値のIDは等価である", () => {});
       it("異なる値のIDは等価ではない", () => {});
     });
   });
   ```

2. ChatSessionTitleのテストを作成する:

   ```typescript
   // packages/shared/src/features/chat-history/domain/value-objects/__tests__/ChatSessionTitle.test.ts
   describe("ChatSessionTitle", () => {
     describe("create", () => {
       it("有効なタイトルで作成できる", () => {});
       it("3文字未満でエラーを返す", () => {});
       it("100文字超でエラーを返す", () => {});
       it("空文字でエラーを返す", () => {});
     });

     describe("createDefault", () => {
       it("デフォルトタイトル「新しいチャット」を作成する", () => {});
     });
   });
   ```

3. MessageContentのテストを作成する:

   ```typescript
   // packages/shared/src/features/chat-history/domain/value-objects/__tests__/MessageContent.test.ts
   describe("MessageContent", () => {
     describe("create", () => {
       it("有効なコンテンツで作成できる", () => {});
       it("空文字でエラーを返す", () => {});
       it("100000文字超でエラーを返す", () => {});
     });

     describe("preview", () => {
       it("30文字以下はそのまま返す", () => {});
       it("30文字超は先頭30文字を返す", () => {});
     });
   });
   ```

**期待される成果物**:

- `packages/shared/src/features/chat-history/domain/value-objects/__tests__/ChatSessionId.test.ts`
- `packages/shared/src/features/chat-history/domain/value-objects/__tests__/ChatSessionTitle.test.ts`
- `packages/shared/src/features/chat-history/domain/value-objects/__tests__/MessageContent.test.ts`

---

### タスク3: Use Caseのテスト作成

**目的**: Use Caseの単体テストを作成する（モック使用）

**実行手順**:

1. CreateChatSessionUseCaseのテストを作成する:

   ```typescript
   // packages/shared/src/features/chat-history/application/use-cases/__tests__/CreateChatSessionUseCase.test.ts
   describe("CreateChatSessionUseCase", () => {
     let useCase: CreateChatSessionUseCase;
     let mockSessionRepository: MockIChatSessionRepository;

     beforeEach(() => {
       mockSessionRepository = createMockSessionRepository();
       useCase = new CreateChatSessionUseCase(mockSessionRepository);
     });

     it("新しいセッションを作成できる", async () => {});
     it("タイトル指定でセッションを作成できる", async () => {});
     it("リポジトリエラー時にエラーを返す", async () => {});
   });
   ```

2. AddMessageUseCaseのテストを作成する:

   ```typescript
   // packages/shared/src/features/chat-history/application/use-cases/__tests__/AddMessageUseCase.test.ts
   describe("AddMessageUseCase", () => {
     it("ユーザーメッセージを追加できる", async () => {});
     it("アシスタントメッセージを追加できる", async () => {});
     it("セッションのプレビューが更新される", async () => {});
     it("セッションのupdatedAtが更新される", async () => {});
     it("存在しないセッションでエラーを返す", async () => {});
   });
   ```

3. その他のUse Caseテストを作成する:
   - `SearchSessionsUseCase.test.ts`
   - `ExportSessionUseCase.test.ts`
   - `UpdateSessionUseCase.test.ts`
   - `DeleteSessionUseCase.test.ts`
   - `ToggleFavoriteUseCase.test.ts`
   - `TogglePinnedUseCase.test.ts`

**期待される成果物**:

- `packages/shared/src/features/chat-history/application/use-cases/__tests__/*.test.ts`

---

### タスク4: マッパーのテスト作成

**目的**: ドメイン-永続化マッパーのテストを作成する

**実行手順**:

1. ChatSessionMapperのテストを作成する:

   ```typescript
   // packages/shared/src/infrastructure/persistence/mappers/__tests__/ChatSessionMapper.test.ts
   describe("ChatSessionMapper", () => {
     describe("toDomain", () => {
       it("DBレコードからドメインエンティティに変換できる", () => {});
       it("不正なデータでエラーを返す", () => {});
       it("日付が正しく変換される", () => {});
     });

     describe("toPersistence", () => {
       it("ドメインエンティティからDBレコードに変換できる", () => {});
       it("boolean値がintegerに変換される", () => {});
     });

     describe("toDTO", () => {
       it("ドメインエンティティからDTOに変換できる", () => {});
     });
   });
   ```

2. ChatMessageMapperのテストを作成する:

   ```typescript
   // packages/shared/src/infrastructure/persistence/mappers/__tests__/ChatMessageMapper.test.ts
   describe("ChatMessageMapper", () => {
     describe("toDomain", () => {
       it("DBレコードからドメインエンティティに変換できる", () => {});
       it("LLMメタデータがJSONパースされる", () => {});
     });

     describe("toPersistence", () => {
       it("ドメインエンティティからDBレコードに変換できる", () => {});
       it("LLMメタデータがJSON文字列化される", () => {});
     });

     describe("toDTO", () => {
       it("ドメインエンティティからDTOに変換できる", () => {});
     });
   });
   ```

**期待される成果物**:

- `packages/shared/src/infrastructure/persistence/mappers/__tests__/ChatSessionMapper.test.ts`
- `packages/shared/src/infrastructure/persistence/mappers/__tests__/ChatMessageMapper.test.ts`

---

### タスク5: Result型のテスト作成

**目的**: Result型の単体テストを作成する

**実行手順**:

1. Result型のテストを作成する:

   ```typescript
   // packages/shared/src/core/__tests__/Result.test.ts
   describe("Result", () => {
     describe("Ok", () => {
       it("値を保持できる", () => {});
       it("mapで値を変換できる", () => {});
       it("flatMapでResult型を連鎖できる", () => {});
       it("getOrElseで値を取得できる", () => {});
       it("getOrThrowで値を取得できる", () => {});
     });

     describe("Err", () => {
       it("エラーを保持できる", () => {});
       it("mapはエラーをそのまま返す", () => {});
       it("flatMapはエラーをそのまま返す", () => {});
       it("getOrElseでデフォルト値を返す", () => {});
       it("getOrThrowで例外を投げる", () => {});
     });
   });
   ```

**期待される成果物**:

- `packages/shared/src/core/__tests__/Result.test.ts`

---

### タスク6: テスト実行（Red状態確認）

**目的**: 作成したテストが失敗することを確認する

**実行手順**:

1. テストを実行する:

   ```bash
   pnpm --filter @repo/shared test:run
   ```

2. 以下を確認する:
   - [ ] 全てのテストが失敗すること（Red状態）
   - [ ] テストの失敗理由が「未実装」であること
   - [ ] テストケースが設計と一致していること

**期待される成果物**:

- `outputs/phase-4/test-execution-report.md` - テスト実行結果レポート

---

## 参照資料

| 参照資料           | パス                                        | 内容             |
| ------------------ | ------------------------------------------- | ---------------- |
| Phase 2成果物      | `outputs/phase-2/`                          | 設計成果物       |
| エンティティ設計書 | `outputs/phase-2/domain-entities-design.md` | エンティティ設計 |
| Use Case設計書     | `outputs/phase-2/use-cases-design.md`       | Use Case設計     |
| インフラ層設計書   | `outputs/phase-2/infrastructure-design.md`  | マッパー設計     |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                     | パス                                                                           | 内容                   |
| ---------------------------- | ------------------------------------------------------------------------------ | ---------------------- |
| チャット履歴インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | 既存ビジネスルール仕様 |

---

## 成果物

| 成果物               | パス                                                                         | 内容                     |
| -------------------- | ---------------------------------------------------------------------------- | ------------------------ |
| エンティティテスト   | `packages/shared/src/features/chat-history/domain/entities/__tests__/`       | エンティティ単体テスト   |
| 値オブジェクトテスト | `packages/shared/src/features/chat-history/domain/value-objects/__tests__/`  | 値オブジェクト単体テスト |
| Use Caseテスト       | `packages/shared/src/features/chat-history/application/use-cases/__tests__/` | Use Case単体テスト       |
| マッパーテスト       | `packages/shared/src/infrastructure/persistence/mappers/__tests__/`          | マッパー単体テスト       |
| Result型テスト       | `packages/shared/src/core/__tests__/`                                        | Result型単体テスト       |
| テスト実行レポート   | `outputs/phase-4/test-execution-report.md`                                   | Red状態確認レポート      |

---

## 統合テスト連携

レイヤー分離テスト・依存関係テストを作成すること:

- 各レイヤーが単独でテスト可能であることを確認
- モック/スタブによる依存関係の差し替えが可能であることを確認
- レイヤー間の契約（インターフェース）が正しく定義されていることを確認

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test:run
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## 完了条件

- [ ] 全エンティティのテストが作成されている
- [ ] 全値オブジェクトのテストが作成されている
- [ ] 全Use Caseのテストが作成されている
- [ ] 全マッパーのテストが作成されている
- [ ] Result型のテストが作成されている
- [ ] テスト実行でRed状態（全テスト失敗）が確認されている
- [ ] テスト実行レポートが作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` のPhase 4ステータスを更新

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が完了していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/clean-architecture-refactoring/phase-5-implementation.md`
