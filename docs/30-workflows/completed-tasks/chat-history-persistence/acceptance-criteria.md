# チャット履歴永続化機能 - 受け入れ基準書

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| ドキュメント | 受け入れ基準書（AC）           |
| タスクID     | TASK-CHAT-HISTORY-001          |
| バージョン   | 1.0.0                          |
| 作成日       | 2025-12-20                     |
| 対象         | チャット履歴永続化機能         |
| 形式         | Given-When-Then (BDD)          |
| テストツール | Vitest + React Testing Library |

---

## 1. 概要

### 1.1 目的

チャット履歴永続化機能の受け入れ基準を、BDD（Behavior-Driven Development）スタイルのGiven-When-Then形式で定義し、実装完了後のテストケースに直接変換できるようにする。

### 1.2 シナリオ分類

| 分類         | 説明                             | 記号 |
| ------------ | -------------------------------- | ---- |
| 正常系       | ユーザーが期待する通常の動作     | ✅   |
| 異常系       | エラー発生時の適切なハンドリング | ❌   |
| 境界値       | 入力の上限・下限・特殊値のテスト | 🔢   |
| エッジケース | 稀だが重要なシナリオ             | 🔄   |

---

## 2. セッション管理

### AC-001: チャットセッション自動作成（正常系） ✅

```gherkin
Given ユーザーがアプリを起動している
When ユーザーが「新しいチャット」ボタンをクリックする
Then 新しいチャットセッションが作成される
And セッションIDがUUID v4形式で生成される
And デフォルトタイトルが「新しいチャット - YYYY-MM-DD HH:mm」形式で設定される
And セッションの作成日時がUTCで記録される
And セッションがサイドバーの一覧の最上部に表示される
```

**Vitestテストコード例**:

```typescript
describe('AC-001: チャットセッション自動作成', () => {
  it('新しいチャットボタンをクリックすると、セッションが作成される', async () => {
    // Given
    const { getByRole, getByText } = render(<ChatApp />);

    // When
    const newChatButton = getByRole('button', { name: /新しいチャット/i });
    await userEvent.click(newChatButton);

    // Then
    const session = await db.query.chatSessions.findFirst();
    expect(session).toBeDefined();
    expect(session.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i); // UUID v4
    expect(session.title).toMatch(/^新しいチャット - \d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
    expect(getByText(session.title)).toBeInTheDocument();
  });
});
```

---

### AC-002: セッションIDの一意性保証（境界値） 🔢

```gherkin
Given データベースに既存のセッションが存在する
When 新しいセッションを10,000回連続で作成する
Then すべてのセッションIDが一意である
And セッションID重複エラーが発生しない
```

---

### AC-003: セッション一覧の表示（正常系） ✅

```gherkin
Given データベースに50件のセッションが保存されている
When ユーザーがアプリを起動する
Then サイドバーに最新50件のセッションが表示される
And セッションは作成日時の降順（最新が上）でソートされている
And 各セッション項目には以下が含まれる:
  | タイトル           |
  | 最終更新日時       |
  | メッセージ数バッジ |
  | プレビューテキスト |
```

---

### AC-004: 空のセッション一覧（異常系） ❌

```gherkin
Given データベースにセッションが1件も存在しない
When ユーザーがアプリを起動する
Then サイドバーに「まだチャット履歴がありません」というメッセージが表示される
And 「新しいチャットを開始」ボタンが表示される
```

---

### AC-005: セッション削除（正常系） ✅

```gherkin
Given セッション一覧に「テストセッション」が表示されている
And 「テストセッション」には5件のメッセージが含まれている
When ユーザーが「テストセッション」の削除ボタンをクリックする
And 確認ダイアログで「削除」ボタンをクリックする
Then 「テストセッション」がセッション一覧から削除される
And 関連する5件のメッセージもデータベースから削除される
And 削除成功のトースト通知が表示される
```

---

### AC-006: セッション削除のキャンセル（正常系） ✅

```gherkin
Given セッション一覧に「テストセッション」が表示されている
When ユーザーが「テストセッション」の削除ボタンをクリックする
And 確認ダイアログで「キャンセル」ボタンをクリックする
Then 「テストセッション」は削除されずに一覧に残っている
And データベースに変更はない
```

---

## 3. メッセージ保存

### AC-007: ユーザーメッセージの保存（正常系） ✅

```gherkin
Given 「テストセッション」が開かれている
When ユーザーがメッセージ入力欄に「こんにちは」と入力する
And 送信ボタンをクリックする
Then メッセージがチャット画面に表示される
And メッセージがデータベースに保存される
And 保存されたメッセージには以下の情報が含まれる:
  | フィールド    | 値               |
  | role          | "user"           |
  | content       | "こんにちは"     |
  | timestamp     | ISO 8601形式     |
  | message_index | 0（最初のメッセージ） |
```

**Vitestテストコード例**:

```typescript
describe('AC-007: ユーザーメッセージの保存', () => {
  it('ユーザーがメッセージを送信すると、DBに保存される', async () => {
    // Given
    const sessionId = await createTestSession();
    const { getByPlaceholderText, getByRole } = render(<ChatScreen sessionId={sessionId} />);

    // When
    const input = getByPlaceholderText(/メッセージを入力/i);
    await userEvent.type(input, 'こんにちは');
    const sendButton = getByRole('button', { name: /送信/i });
    await userEvent.click(sendButton);

    // Then
    await waitFor(async () => {
      const message = await db.query.messages.findFirst({
        where: eq(messages.sessionId, sessionId),
      });
      expect(message).toBeDefined();
      expect(message.role).toBe('user');
      expect(message.content).toBe('こんにちは');
      expect(message.messageIndex).toBe(0);
      expect(message.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/); // ISO 8601
    });
  });
});
```

---

### AC-008: アシスタント応答の保存（正常系） ✅

```gherkin
Given ユーザーが「こんにちは」というメッセージを送信した
When LLMから「こんにちは!何かお手伝いできますか?」という応答が返される
Then アシスタントの応答がチャット画面に表示される
And 応答がデータベースに保存される
And 保存された応答には以下の情報が含まれる:
  | フィールド    | 値                                |
  | role          | "assistant"                       |
  | content       | "こんにちは!何かお手伝いできますか?" |
  | timestamp     | ISO 8601形式                      |
  | message_index | 1（2番目のメッセージ）            |
```

---

### AC-009: LLMメタデータの記録（正常系） ✅

```gherkin
Given ユーザーが「こんにちは」というメッセージを送信した
When Anthropic Claude 3.5 Sonnetから応答が返される
And 以下のLLMパラメータが使用された:
  | provider    | anthropic                    |
  | model       | claude-3-5-sonnet-20241022   |
  | temperature | 0.7                          |
  | max_tokens  | 4096                         |
Then アシスタントメッセージと一緒にLLMメタデータが保存される
And メタデータには以下が含まれる:
  | provider       | anthropic                  |
  | model          | claude-3-5-sonnet-20241022 |
  | version        | 20241022                   |
  | metadata.temperature | 0.7                  |
  | metadata.max_tokens  | 4096                 |
  | metadata.token_usage | { input: N, output: M } |
```

**Vitestテストコード例**:

```typescript
describe("AC-009: LLMメタデータの記録", () => {
  it("アシスタント応答保存時にLLMメタデータが記録される", async () => {
    // Given
    const sessionId = await createTestSession();
    await sendUserMessage(sessionId, "こんにちは");

    // When
    const llmResponse = {
      content: "こんにちは!何かお手伝いできますか?",
      metadata: {
        provider: "anthropic",
        model: "claude-3-5-sonnet-20241022",
        version: "20241022",
        temperature: 0.7,
        max_tokens: 4096,
        token_usage: { input_tokens: 10, output_tokens: 15 },
      },
    };
    await saveAssistantMessage(sessionId, llmResponse);

    // Then
    const message = await db.query.messages.findFirst({
      where: and(
        eq(messages.sessionId, sessionId),
        eq(messages.role, "assistant"),
      ),
    });
    expect(message.llmProvider).toBe("anthropic");
    expect(message.llmModel).toBe("claude-3-5-sonnet-20241022");
    expect(message.llmMetadata).toMatchObject({
      temperature: 0.7,
      max_tokens: 4096,
      token_usage: { input_tokens: 10, output_tokens: 15 },
    });
  });
});
```

---

### AC-010: メッセージ最大文字数制限（境界値） 🔢

```gherkin
Given ユーザーが新しいチャットを開始している
When ユーザーが100,000文字のメッセージを送信する
Then メッセージが正常に保存される
And メッセージ全文が保存される
```

---

### AC-011: メッセージ最大文字数超過（境界値） 🔢

```gherkin
Given ユーザーが新しいチャットを開始している
When ユーザーが100,001文字のメッセージを送信しようとする
Then エラーメッセージが表示される
And エラーメッセージは「メッセージは100,000文字以内にしてください」と表示される
And メッセージは送信されない
```

---

### AC-012: ストリーミング応答の保存（正常系） ✅

```gherkin
Given ユーザーがメッセージを送信した
When LLMからストリーミング形式で応答が返される
And ストリーミングが完了する
Then 完全な応答テキストがデータベースに一括保存される
And ストリーミング中は一時バッファに保持される
And 保存されるメッセージは1件のみ（チャンクごとに保存されない）
```

---

### AC-013: ストリーミング中断時のエラーハンドリング（異常系） ❌

```gherkin
Given ユーザーがメッセージを送信した
When LLMからストリーミング応答が開始される
And ストリーミングが途中でネットワークエラーにより中断される
Then エラーメッセージが表示される
And 部分的な応答は「[応答が中断されました]」という注釈付きで保存される
And LLMメタデータには error: true フラグが記録される
```

---

## 4. 検索機能

### AC-014: キーワード検索（正常系） ✅

```gherkin
Given 以下のセッションが保存されている:
  | タイトル           | メッセージ内容                |
  | React開発について  | "useEffectの使い方は?"        |
  | TypeScript質問     | "型定義の方法を教えて"        |
  | データベース設計   | "PostgreSQLとMySQLの違い"    |
When ユーザーが検索ボックスに「React」と入力する
Then 検索結果に「React開発について」が表示される
And 検索結果に「TypeScript質問」は表示されない
And マッチした箇所がハイライト表示される
```

---

### AC-015: メッセージ内容からの検索（正常系） ✅

```gherkin
Given セッション「質問集」に以下のメッセージが含まれている:
  | "useEffectの使い方は?" |
  | "useStateとの違いは?" |
When ユーザーが検索ボックスに「useEffect」と入力する
Then 検索結果に「質問集」が表示される
And プレビューテキストに「useEffectの使い方は?」が表示される
```

---

### AC-016: 検索結果0件（異常系） ❌

```gherkin
Given データベースに5件のセッションが保存されている
When ユーザーが検索ボックスに「存在しないキーワード」と入力する
Then 「検索結果が見つかりませんでした」というメッセージが表示される
And セッション一覧は空になる
```

---

### AC-017: 特殊文字を含む検索（境界値） 🔢

```gherkin
Given セッション「コード質問」に「const [state, setState] = useState()」というメッセージが含まれている
When ユーザーが検索ボックスに「[state, setState]」と入力する
Then 検索結果に「コード質問」が表示される
And 特殊文字がエスケープされて正しく検索される
```

---

### AC-018: 日付範囲検索（正常系） ✅

```gherkin
Given 以下のセッションが保存されている:
  | タイトル | 作成日     |
  | セッション1 | 2025-12-01 |
  | セッション2 | 2025-12-10 |
  | セッション3 | 2025-12-20 |
When ユーザーが日付フィルターで「2025-12-05」から「2025-12-15」を選択する
Then 検索結果に「セッション2」のみが表示される
And 「セッション1」と「セッション3」は表示されない
```

---

### AC-019: LLMモデルフィルタリング（正常系） ✅

```gherkin
Given 以下のセッションが保存されている:
  | タイトル | 使用モデル                 |
  | GPTチャット | openai/gpt-4            |
  | Claudeチャット | anthropic/claude-3-5-sonnet |
  | Geminiチャット | google/gemini-pro       |
When ユーザーがモデルフィルターで「anthropic」を選択する
Then 検索結果に「Claudeチャット」のみが表示される
And 他のセッションは表示されない
```

---

## 5. エクスポート機能

### AC-020: Markdownエクスポート（正常系） ✅

```gherkin
Given セッション「テストチャット」が開かれている
And セッションには以下のメッセージが含まれている:
  | role      | content             |
  | user      | こんにちは          |
  | assistant | こんにちは!お手伝いできますか? |
When ユーザーがエクスポートメニューから「Markdown形式」を選択する
Then ファイル保存ダイアログが表示される
And デフォルトファイル名が「テストチャット_20251220_143000.md」形式である
And ユーザーが「保存」をクリックする
Then Markdownファイルが指定した場所に保存される
And ファイルには以下の形式でメッセージが含まれる:
  """
  # テストチャット

  **作成日**: 2025-12-20 14:30:00
  **メッセージ数**: 2件

  ---

  ## ユーザー (2025-12-20 14:30:05)
  こんにちは

  ## アシスタント (2025-12-20 14:30:10)
  **モデル**: anthropic/claude-3-5-sonnet
  こんにちは!お手伝いできますか?
  """
```

**Vitestテストコード例**:

```typescript
describe("AC-020: Markdownエクスポート", () => {
  it("セッションをMarkdown形式でエクスポートできる", async () => {
    // Given
    const sessionId = await createTestSession("テストチャット");
    await sendUserMessage(sessionId, "こんにちは");
    await sendAssistantMessage(sessionId, "こんにちは!お手伝いできますか?", {
      provider: "anthropic",
      model: "claude-3-5-sonnet",
    });

    // When
    const exportService = new ExportService();
    const markdown = await exportService.exportToMarkdown(sessionId);

    // Then
    expect(markdown).toContain("# テストチャット");
    expect(markdown).toContain("**作成日**:");
    expect(markdown).toContain("**メッセージ数**: 2件");
    expect(markdown).toContain("## ユーザー");
    expect(markdown).toContain("こんにちは");
    expect(markdown).toContain("## アシスタント");
    expect(markdown).toContain("**モデル**: anthropic/claude-3-5-sonnet");
    expect(markdown).toContain("こんにちは!お手伝いできますか?");
  });
});
```

---

### AC-021: JSONエクスポート（正常系） ✅

```gherkin
Given セッション「テストチャット」が開かれている
When ユーザーがエクスポートメニューから「JSON形式」を選択する
Then ファイル保存ダイアログが表示される
And デフォルトファイル名が「テストチャット_20251220_143000.json」形式である
And ユーザーが「保存」をクリックする
Then JSONファイルが指定した場所に保存される
And JSONには以下の構造が含まれる:
  """json
  {
    "session_id": "uuid",
    "title": "テストチャット",
    "created_at": "2025-12-20T14:30:00.000Z",
    "messages": [
      {
        "role": "user",
        "content": "こんにちは",
        "timestamp": "2025-12-20T14:30:05.000Z",
        "llm_metadata": null
      },
      {
        "role": "assistant",
        "content": "こんにちは!お手伝いできますか?",
        "timestamp": "2025-12-20T14:30:10.000Z",
        "llm_metadata": {
          "provider": "anthropic",
          "model": "claude-3-5-sonnet"
        }
      }
    ]
  }
  """
```

---

### AC-022: ディスク容量不足時のエクスポートエラー（異常系） ❌

```gherkin
Given セッション「大容量チャット」に1,000件のメッセージが含まれている
And ディスクの空き容量が1MB未満である
When ユーザーがエクスポートメニューから「Markdown形式」を選択する
And 保存先を選択して「保存」をクリックする
Then エラーメッセージが表示される
And エラーメッセージは「ディスク容量が不足しています」と表示される
And ファイルは保存されない
```

---

### AC-023: 大容量セッションのエクスポート（境界値） 🔢

```gherkin
Given セッション「長時間チャット」に1,000件のメッセージが含まれている
When ユーザーがエクスポートメニューから「Markdown形式」を選択する
And 保存先を選択して「保存」をクリックする
Then エクスポート処理が開始される
And プログレスバーが表示される（"処理中: 150/1000 メッセージ"形式）
And 30秒以内にエクスポートが完了する
And Markdownファイルが保存される
And ファイルサイズが5MB以下である
```

### AC-023a: 超大容量セッションのエクスポート警告（境界値） 🔢

```gherkin
Given セッション「超長時間チャット」に1,001件以上のメッセージが含まれている
When ユーザーがエクスポートボタンをクリックする
Then 警告ダイアログが表示される: "1,000件を超えるメッセージが含まれています。エクスポートに時間がかかる可能性があります。"
And "続行" と "キャンセル" のボタンが表示される
When ユーザーが "続行" をクリックする
Then エクスポート処理が開始される
And プログレスバーが表示される
```

---

## 6. 履歴管理UI

### AC-024: 過去の会話の再開（正常系） ✅

```gherkin
Given セッション一覧に「過去のチャット」が表示されている
And 「過去のチャット」には10件のメッセージが含まれている
When ユーザーが「過去のチャット」をクリックする
Then チャット画面が「過去のチャット」に切り替わる
And 10件のメッセージが時系列順に表示される
And スクロール位置が最下部（最新メッセージ）にある
And ユーザーは新しいメッセージを送信できる
```

---

### AC-025: タイトル編集（正常系） ✅

```gherkin
Given セッション一覧に「新しいチャット - 2025-12-20 14:30」が表示されている
When ユーザーがタイトル部分をダブルクリックする
Then タイトルがテキストボックスに変換される
And 既存のタイトルテキストが選択状態になる
When ユーザーが「React開発の質問」と入力する
And Enterキーを押す
Then タイトルが「React開発の質問」に更新される
And データベースに新しいタイトルが保存される
And セッション一覧に「React開発の質問」が表示される
```

---

### AC-026: タイトル編集のキャンセル（正常系） ✅

```gherkin
Given セッション一覧に「既存のタイトル」が表示されている
When ユーザーがタイトル部分をダブルクリックする
And テキストボックスで「新しいタイトル」と入力する
And Escキーを押す
Then タイトル編集がキャンセルされる
And タイトルは「既存のタイトル」のまま変更されない
And データベースに変更は保存されない
```

---

### AC-027: タイトル最大文字数制限（境界値） 🔢

```gherkin
Given セッション一覧に「テストセッション」が表示されている
When ユーザーがタイトルを編集しようとする
And 101文字のタイトルを入力する
Then エラーメッセージが表示される
And エラーメッセージは「タイトルは100文字以内にしてください」と表示される
And タイトルは保存されない
```

---

### AC-028: 空のタイトル入力（境界値） 🔢

```gherkin
Given セッション一覧に「既存のタイトル」が表示されている
When ユーザーがタイトル部分をダブルクリックする
And すべてのテキストを削除して空にする
And Enterキーを押す
Then タイトルがデフォルト値「新しいチャット - YYYY-MM-DD HH:mm」に戻る
And ユーザーに警告トーストが表示される: "タイトルが空のため、デフォルトタイトルに設定されました"
And 警告トーストは3秒後に自動消失する
```

---

### AC-029: お気に入り追加（正常系） ✅

```gherkin
Given セッション一覧に「重要なチャット」が表示されている
When ユーザーが星アイコンをクリックする
Then 星アイコンが塗りつぶされた状態になる
And 「重要なチャット」がセッション一覧の上部「お気に入り」セクションに移動する
And データベースの is_favorite フラグが true に更新される
```

---

### AC-030: ピン留め（境界値） 🔢

```gherkin
Given すでに10件のセッションがピン留めされている
When ユーザーが11件目のセッションをピン留めしようとする
Then エラーメッセージが表示される
And エラーメッセージは「ピン留めは最大10件までです」と表示される
And 11件目のセッションはピン留めされない
```

---

## 7. パフォーマンス

### AC-031: セッション一覧の高速表示（パフォーマンス） ⚡

```gherkin
Given データベースに100件のセッションが保存されている
When ユーザーがアプリを起動する
Then セッション一覧が100ms以内に表示される
And 初回表示は最新50件のみロードされる
```

---

### AC-032: 大量セッションのスクロール性能（パフォーマンス） ⚡

```gherkin
Given データベースに1,000件のセッションが保存されている
When ユーザーがセッション一覧を下にスクロールする
Then スクロールが滑らかに動作する（60fps以上）
And スクロール時に追加で50件ずつ遅延ロードされる
And メモリ使用量が500MB以下に保たれる
```

---

### AC-033: メッセージ保存の低遅延（パフォーマンス） ⚡

```gherkin
Given ユーザーが新しいチャットを開始している
When ユーザーがメッセージを送信する
Then メッセージが50ms以内（P95）にデータベースに保存される
And UIの応答性が保たれる（ブロッキングしない）
```

---

## 8. エラーハンドリング

### AC-034: データベースロック時のリトライ（異常系） ❌

```gherkin
Given データベースが別のトランザクションによってロックされている
When ユーザーがメッセージを送信する
Then システムが最大3回リトライする
And Exponential Backoffで待機時間を調整する（100ms, 200ms, 400ms）
And リトライ成功時は通常通りメッセージが保存される
And 3回失敗した場合はエラーメッセージが表示される
```

---

### AC-035: ネットワークエラー時の同期（エッジケース） 🔄

```gherkin
Given Turso Embedded Replicasが有効化されている
And ネットワーク接続が切断されている
When ユーザーがメッセージを送信する
Then メッセージはローカルDBに保存される
And ユーザーには「オフラインモード」と表示される
And ネットワーク復帰時に自動的にクラウドDBと同期される
```

---

## 9. テストカバレッジ目標

| カテゴリ           | シナリオ数 | 優先度分布        |
| ------------------ | ---------- | ----------------- |
| セッション管理     | 6          | Must Have: 4      |
| メッセージ保存     | 7          | Must Have: 5      |
| 検索機能           | 6          | Must Have: 2      |
| エクスポート       | 4          | Should Have: 4    |
| 履歴管理UI         | 7          | Must Have: 2      |
| パフォーマンス     | 3          | Must Have: 2      |
| エラーハンドリング | 2          | Must Have: 2      |
| **合計**           | **35**     | **Must Have: 17** |

---

## 10. テスト実行計画

### 10.1 ユニットテスト

- **ツール**: Vitest
- **対象**: リポジトリクラス、サービスクラス、ユーティリティ関数
- **カバレッジ目標**: Line 80%以上、Branch 70%以上
- **実行タイミング**: 各コミット前、CI/CDパイプライン

### 10.2 統合テスト

- **ツール**: Vitest + Testing Library
- **対象**: UIコンポーネント + データベース連携
- **カバレッジ目標**: 全AC（35シナリオ）の80%以上
- **実行タイミング**: PR作成時、リリース前

### 10.3 E2Eテスト

- **ツール**: Playwright
- **対象**: クリティカルパス（セッション作成 → メッセージ送信 → 検索 → エクスポート）
- **カバレッジ目標**: 主要フロー5パス
- **実行タイミング**: リリース前、毎日夜間

---

## 11. 次のステップ

- [ ] Vitestテストスイートの作成（AC-001〜AC-035）
- [ ] Playwrightテストシナリオの作成
- [ ] CI/CDパイプラインへのテスト統合
- [ ] テストカバレッジレポートの自動生成
