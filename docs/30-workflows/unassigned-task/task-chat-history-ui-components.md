# Chat History UI Components - タスク指示書

## メタ情報

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| タスクID     | UT-008                                           |
| タスク名     | Chat History UI Components                       |
| 分類         | 実装                                             |
| 対象機能     | チャット履歴機能（chat-history）                 |
| 優先度       | 中                                               |
| 見積もり規模 | 中規模                                           |
| ステータス   | 未実施                                           |
| 発見元       | Phase 12（UT-006完了後の後続タスク）             |
| 発見日       | 2026-01-22                                       |
| 関連タスク   | UT-006 React Context DI実装, UT-007 Provider統合 |
| 依存タスク   | UT-007 ChatHistoryProvider App Integration       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-006でReact Context DI基盤が実装され、UT-007でアプリへの統合が予定されている。これらの基盤を活用してチャット履歴機能のUIコンポーネントを実装する必要がある。

Clean Architecture設計に基づき、Presentation層（React UI）はApplication層（Use Cases）を通じてチャット履歴データにアクセスする。

### 1.2 問題点・課題

- チャット履歴を表示・操作するUIコンポーネントが未実装
- useChatHistory hookを使用するコンポーネントが存在しない
- セッション一覧、メッセージ表示、検索UIが未整備

### 1.3 放置した場合の影響

- チャット履歴機能がユーザーに提供できない
- 既存のチャットUIとの統合ができない
- ユーザーがセッション管理・検索を行えない

---

## 2. 何を達成するか（What）

### 2.1 目的

useChatHistory hookを使用してチャット履歴機能のUIコンポーネントを実装し、ユーザーがセッションの表示・作成・検索・ピン留めを行えるようにする。

### 2.2 最終ゴール

- セッション一覧コンポーネント（ChatSessionList）
- セッション詳細コンポーネント（ChatSessionDetail）
- セッション作成コンポーネント（NewSessionButton）
- セッション検索コンポーネント（SessionSearch）
- ピン留めトグルコンポーネント（PinToggle）

### 2.3 スコープ

#### 含むもの

- 5種類のUIコンポーネント実装
- useChatHistoryとの統合
- 基本的なスタイリング（Tailwind CSS）
- ローディング・エラー状態のハンドリング
- アクセシビリティ対応（WCAG 2.1 AA）
- ユニットテスト・統合テスト

#### 含まないもの

- リアルタイム更新（WebSocket連携）
- 高度なアニメーション
- キーボードショートカット
- ドラッグ&ドロップ操作
- メッセージ編集・削除機能

### 2.4 成果物

| 成果物               | 配置先                                                         |
| -------------------- | -------------------------------------------------------------- |
| ChatSessionList      | `apps/desktop/src/features/chat-history/components/`           |
| ChatSessionDetail    | `apps/desktop/src/features/chat-history/components/`           |
| NewSessionButton     | `apps/desktop/src/features/chat-history/components/`           |
| SessionSearch        | `apps/desktop/src/features/chat-history/components/`           |
| PinToggle            | `apps/desktop/src/features/chat-history/components/`           |
| コンポーネントテスト | `apps/desktop/src/features/chat-history/components/__tests__/` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-006（React Context DI実装）が完了していること
- UT-007（Provider統合）が完了していること
- useChatHistory hookが利用可能であること
- 以下のUse Casesが利用可能:
  - `createSession`
  - `addUserMessage`
  - `addAssistantMessage`
  - `togglePinned`
  - `searchSessions`

### 3.2 依存タスク

| タスク | ステータス | 必要性 |
| ------ | ---------- | ------ |
| UT-006 | 完了       | 必須   |
| UT-007 | 未着手     | 必須   |

### 3.3 必要な知識

- React（Hooks, Context, Suspense）
- TypeScript
- Tailwind CSS
- React Testing Library
- アクセシビリティ（ARIA）
- Clean Architecture Presentation層

### 3.4 推奨アプローチ

1. 共通のコンポーネント設計パターンを確立
2. 小さいコンポーネントから実装（PinToggle → NewSessionButton）
3. 複合コンポーネントを実装（ChatSessionList → ChatSessionDetail）
4. 検索UIを最後に実装
5. テストとアクセシビリティを並行で対応

---

## 4. 実行手順

### Phase構成

| Phase | 名称                 | 概要                                 |
| ----- | -------------------- | ------------------------------------ |
| 1     | 設計・共通パターン   | コンポーネント設計と共通パターン定義 |
| 2     | 基本コンポーネント   | PinToggle, NewSessionButton          |
| 3     | リストコンポーネント | ChatSessionList                      |
| 4     | 詳細コンポーネント   | ChatSessionDetail                    |
| 5     | 検索コンポーネント   | SessionSearch                        |
| 6     | テスト・検証         | ユニットテスト・統合テスト           |

---

### Phase 1: 設計・共通パターン

#### 目的

コンポーネント設計パターンと共通型を定義する。

#### 手順

1. コンポーネント共通型を定義:

   ```typescript
   // types/component.ts
   export interface BaseComponentProps {
     className?: string;
     testId?: string;
   }

   export interface AsyncComponentProps extends BaseComponentProps {
     isLoading?: boolean;
     error?: Error | null;
   }
   ```

2. フォルダ構造を作成:

   ```
   components/
   ├── ChatSessionList/
   │   ├── index.tsx
   │   ├── ChatSessionList.tsx
   │   └── ChatSessionList.test.tsx
   ├── ...
   ```

#### 成果物

- 型定義ファイル
- フォルダ構造

#### 完了条件

- 共通型が定義されている
- フォルダ構造が作成されている

---

### Phase 2: 基本コンポーネント

#### 目的

シンプルなコンポーネント（PinToggle, NewSessionButton）を実装する。

#### 手順

1. PinToggle実装:

   ```tsx
   export function PinToggle({
     sessionId,
     isPinned,
     onToggle,
   }: PinToggleProps) {
     const { togglePinned } = useChatHistory();

     const handleToggle = async () => {
       const result = await togglePinned.execute({ sessionId });
       if (result.ok) {
         onToggle?.(result.value);
       }
     };

     return (
       <button
         aria-pressed={isPinned}
         aria-label={isPinned ? "ピン留め解除" : "ピン留め"}
         onClick={handleToggle}
       >
         {isPinned ? <PinFilledIcon /> : <PinIcon />}
       </button>
     );
   }
   ```

2. NewSessionButton実装:

   ```tsx
   export function NewSessionButton({ onCreated }: NewSessionButtonProps) {
     const { createSession, isReady } = useChatHistory();

     const handleCreate = async () => {
       const result = await createSession.execute({
         userId: currentUserId,
       });
       if (result.ok) {
         onCreated?.(result.value);
       }
     };

     return (
       <button
         disabled={!isReady}
         onClick={handleCreate}
         aria-label="新しいチャットを作成"
       >
         新規チャット
       </button>
     );
   }
   ```

#### 成果物

- PinToggle.tsx + テスト
- NewSessionButton.tsx + テスト

#### 完了条件

- コンポーネントが動作する
- テストがパスする
- アクセシビリティ属性が設定されている

---

### Phase 3: リストコンポーネント

#### 目的

セッション一覧を表示するChatSessionListを実装する。

#### 手順

1. ChatSessionList実装:

   ```tsx
   export function ChatSessionList({
     userId,
     onSessionSelect,
   }: ChatSessionListProps) {
     const { searchSessions } = useChatHistory();
     const [sessions, setSessions] = useState<ChatSessionDTO[]>([]);
     const [isLoading, setIsLoading] = useState(true);

     useEffect(() => {
       const load = async () => {
         const result = await searchSessions.execute({ userId });
         if (result.ok) {
           setSessions(result.value.items);
         }
         setIsLoading(false);
       };
       load();
     }, [userId]);

     if (isLoading) return <SessionListSkeleton />;

     return (
       <ul role="list" aria-label="チャット履歴">
         {sessions.map((session) => (
           <SessionListItem
             key={session.id}
             session={session}
             onSelect={onSessionSelect}
           />
         ))}
       </ul>
     );
   }
   ```

#### 成果物

- ChatSessionList.tsx + テスト
- SessionListItem.tsx（サブコンポーネント）
- SessionListSkeleton.tsx（ローディング状態）

#### 完了条件

- セッション一覧が表示される
- ローディング状態が表示される
- セッション選択が機能する

---

### Phase 4: 詳細コンポーネント

#### 目的

セッション詳細（メッセージ一覧）を表示するChatSessionDetailを実装する。

#### 手順

1. ChatSessionDetail実装
2. MessageList実装
3. MessageItem実装

#### 成果物

- ChatSessionDetail.tsx + テスト
- MessageList.tsx
- MessageItem.tsx

#### 完了条件

- メッセージ一覧が表示される
- ユーザー/アシスタントメッセージが区別される

---

### Phase 5: 検索コンポーネント

#### 目的

セッション検索UIを実装する。

#### 手順

1. SessionSearch実装:

   ```tsx
   export function SessionSearch({ userId, onResults }: SessionSearchProps) {
     const { searchSessions } = useChatHistory();
     const [query, setQuery] = useState("");

     const handleSearch = useCallback(
       debounce(async (searchQuery: string) => {
         const result = await searchSessions.execute({
           userId,
           query: searchQuery,
         });
         if (result.ok) {
           onResults(result.value.items);
         }
       }, 300),
       [searchSessions, userId, onResults],
     );

     return (
       <input
         type="search"
         placeholder="チャットを検索..."
         value={query}
         onChange={(e) => {
           setQuery(e.target.value);
           handleSearch(e.target.value);
         }}
         aria-label="チャット検索"
       />
     );
   }
   ```

#### 成果物

- SessionSearch.tsx + テスト

#### 完了条件

- 検索入力が機能する
- 検索結果が返される
- デバウンスが適用されている

---

### Phase 6: テスト・検証

#### 目的

全コンポーネントのテストとアクセシビリティ検証を行う。

#### 手順

1. ユニットテスト実行:

   ```bash
   pnpm --filter @repo/desktop test -- --coverage
   ```

2. 型チェック:

   ```bash
   pnpm --filter @repo/desktop typecheck
   ```

3. アクセシビリティテスト（手動）

#### 成果物

- テストレポート
- カバレッジレポート

#### 完了条件

- Line Coverage ≥ 80%
- 全テストパス
- 型エラー0件
- Lintエラー0件

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] ChatSessionListが実装されている
- [ ] ChatSessionDetailが実装されている
- [ ] NewSessionButtonが実装されている
- [ ] SessionSearchが実装されている
- [ ] PinToggleが実装されている

### 品質要件

- [ ] Line Coverage ≥ 80%
- [ ] 型エラー 0件
- [ ] Lintエラー 0件
- [ ] 全テストパス

### アクセシビリティ要件

- [ ] 全てのインタラクティブ要素にaria-labelがある
- [ ] キーボード操作が可能
- [ ] フォーカス管理が適切

### ドキュメント要件

- [ ] 各コンポーネントにJSDocがある
- [ ] 使用例がStorybookまたはコメントで提供

---

## 6. 検証方法

### テストケース

| #   | テストケース             | 期待結果                     |
| --- | ------------------------ | ---------------------------- |
| 1   | セッション一覧表示       | セッションが一覧表示される   |
| 2   | 新規セッション作成       | セッションが作成される       |
| 3   | ピン留めトグル           | ピン状態が切り替わる         |
| 4   | セッション検索           | 検索結果が表示される         |
| 5   | セッション詳細表示       | メッセージ一覧が表示される   |
| 6   | ローディング状態         | スケルトンが表示される       |
| 7   | エラー状態               | エラーメッセージが表示される |
| 8   | キーボードナビゲーション | キーボードで操作できる       |

### 検証手順

1. ユニットテスト実行
2. 型チェック
3. 開発サーバーで動作確認
4. キーボード操作テスト

---

## 7. リスクと対策

| リスク                   | 影響度 | 発生確率 | 対策                   |
| ------------------------ | ------ | -------- | ---------------------- |
| パフォーマンス問題       | 中     | 中       | 仮想スクロール検討     |
| 状態管理の複雑化         | 中     | 中       | カスタムフックで抽象化 |
| アクセシビリティ対応漏れ | 高     | 中       | チェックリストで確認   |
| デザイン不整合           | 低     | 中       | デザインシステム参照   |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント        | パス                                                                             |
| ------------------- | -------------------------------------------------------------------------------- |
| アーキテクチャ仕様  | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md` |
| UI/UXコンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`          |
| アクセシビリティ    | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`      |

### 参考資料

- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [WAI-ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 9. 備考

### 補足事項

- 本タスクはUT-007完了後に着手可能
- デザインシステム（ui-ux-design-system.md）に準拠
- 既存のChatViewコンポーネントとの統合は別タスクで対応
- パフォーマンス最適化（仮想スクロール）は将来対応

---

**作成日**: 2026-01-22
**作成者**: Claude Code
**バージョン**: 1.0
