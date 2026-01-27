# Phase 4: テスト作成（TDD Red）

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 4                                  |
| カテゴリ   | TDD-Red                            |
| 前提Phase  | Phase 3（設計レビューゲート PASS） |
| ステータス | 未実施                             |

---

## 1. 目的

TDD Red フェーズとして、実装前にコンポーネントのテストを作成する。この段階ではテストは全て失敗する。

---

## 2. タスク一覧

### Task 1: FileAttachmentButton テスト作成

#### 概要

FileAttachmentButtonコンポーネントの単体テストを作成する。

#### テストファイル

`apps/desktop/src/renderer/features/workspace-chat-edit/components/__tests__/FileAttachmentButton.test.tsx`

#### テストケース

| TC-ID   | テスト名                             | 検証内容                           |
| ------- | ------------------------------------ | ---------------------------------- |
| FAB-001 | renders with default props           | デフォルトPropsでレンダリング      |
| FAB-002 | calls onFilesSelected on file select | ファイル選択時コールバック呼び出し |
| FAB-003 | respects disabled prop               | disabled時にクリック無効           |
| FAB-004 | respects maxFiles limit              | 最大ファイル数制限                 |
| FAB-005 | keyboard navigation works            | Enter/Spaceでダイアログ開く        |
| FAB-006 | has correct aria-label               | aria-labelが正しく設定             |

#### 手順

1. テストファイルを作成
2. 各テストケースを `it.todo()` または `it()` で定義
3. テスト実行し全て失敗することを確認

#### 成果物

- `FileAttachmentButton.test.tsx`

---

### Task 2: FileContextList テスト作成

#### 概要

FileContextListコンポーネントの単体テストを作成する。

#### テストファイル

`apps/desktop/src/renderer/features/workspace-chat-edit/components/__tests__/FileContextList.test.tsx`

#### テストケース

| TC-ID   | テスト名                           | 検証内容                  |
| ------- | ---------------------------------- | ------------------------- |
| FCL-001 | renders empty state                | 空状態メッセージ表示      |
| FCL-002 | renders file contexts              | ファイル一覧表示          |
| FCL-003 | calls onRemove when badge removed  | 削除コールバック呼び出し  |
| FCL-004 | calls onSelect when badge selected | 選択コールバック呼び出し  |
| FCL-005 | shows selected state               | 選択状態のスタイル適用    |
| FCL-006 | scrolls with many files            | 10件超でスクロール可能    |
| FCL-007 | keyboard navigation works          | Tab/Delete操作            |
| FCL-008 | has correct aria attributes        | role="list"とlistitem設定 |

#### 手順

1. テストファイルを作成
2. 各テストケースを定義
3. テスト実行し全て失敗することを確認

#### 成果物

- `FileContextList.test.tsx`

---

### Task 3: アクセシビリティテスト作成

#### 概要

axe-coreを使用したアクセシビリティ自動テストを作成する。

#### テストファイル

`apps/desktop/src/renderer/features/workspace-chat-edit/components/__tests__/accessibility.test.tsx`

#### テストケース

| TC-ID    | テスト名                                     | 検証内容             |
| -------- | -------------------------------------------- | -------------------- |
| A11Y-001 | FileAttachmentButton has no a11y violations  | WCAG 2.1 AA準拠      |
| A11Y-002 | FileContextList has no a11y violations       | WCAG 2.1 AA準拠      |
| A11Y-003 | FileContextList with items has no violations | アイテム表示時も準拠 |

#### 手順

1. `@axe-core/react` または `jest-axe` をテストで使用
2. 各コンポーネントのアクセシビリティテストを定義
3. テスト実行し全て失敗することを確認

#### 成果物

- `accessibility.test.tsx`

---

### Task 4: 統合テスト作成

#### 概要

コンポーネント間の連携を検証する統合テストを作成する。

#### テストファイル

`apps/desktop/src/renderer/features/workspace-chat-edit/components/__tests__/integration-ui.test.tsx`

#### テストケース

| TC-ID   | テスト名             | 検証内容                   |
| ------- | -------------------- | -------------------------- |
| INT-001 | file attachment flow | ファイル追加→一覧表示→削除 |
| INT-002 | keyboard only flow   | キーボードのみで全操作     |
| INT-003 | error handling flow  | エラー発生→表示→クリア     |

#### 手順

1. 統合テストファイルを作成
2. useFileContextフックのモックを設定
3. IPCモックを設定
4. 各テストケースを定義

#### 成果物

- `integration-ui.test.tsx`

---

## 3. 完了条件

- [ ] FileAttachmentButton.test.tsx が作成されている
- [ ] FileContextList.test.tsx が作成されている
- [ ] accessibility.test.tsx が作成されている
- [ ] integration-ui.test.tsx が作成されている
- [ ] 全テストが実行可能（ただし失敗）

---

## 4. 検証コマンド

```bash
# テスト実行（全て失敗することを確認）
pnpm --filter @repo/desktop test -- --run --reporter=verbose apps/desktop/src/renderer/features/workspace-chat-edit/components/__tests__/FileAttachmentButton.test.tsx
pnpm --filter @repo/desktop test -- --run --reporter=verbose apps/desktop/src/renderer/features/workspace-chat-edit/components/__tests__/FileContextList.test.tsx
```

---

## 5. 統合テスト連携【必須】

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ   | 検証内容                                         | テストファイル             |
| ------------------ | ------------------------------------------------ | -------------------------- |
| IPC接続テスト      | `chat-edit:read-file` チャンネル疎通・レスポンス | `*.ipc.test.ts`            |
| データフローテスト | Renderer→IPC→Main→FileSystem の往復              | `integration-ui.test.tsx`  |
| エラーハンドリング | ファイル読込失敗時のUI表示・リトライ             | `integration-ui.test.tsx`  |
| 状態同期テスト     | chatEditSlice への fileContexts 反映             | `FileContextList.test.tsx` |

---

## 6. 多角的チェック観点

タスクの性質に応じて、以下の観点を確認する:

| 観点               | 適用判断          | 仕様参照先                                       |
| ------------------ | ----------------- | ------------------------------------------------ |
| UI/UX              | ✅ UIテスト       | `aiworkflow-requirements: arch-ui-components.md` |
| アクセシビリティ   | ✅ axe-coreテスト | `aiworkflow-requirements: arch-ui-components.md` |
| エラーハンドリング | ✅ 異常系テスト   | `aiworkflow-requirements: error-handling.md`     |
| テスタビリティ     | ✅ TDDテスト設計  | -                                                |

**Electronデスクトップアプリ観点（アーキテクチャ層別テスト）**:

| 層                         | テスト観点                                   | テストファイル配置                        |
| -------------------------- | -------------------------------------------- | ----------------------------------------- |
| フロントエンド（Renderer） | ✅ UIコンポーネント、状態管理、Hooks         | `apps/desktop/src/renderer/**/*.test.tsx` |
| バックエンド（Main）       | サービス、ビジネスロジック（本タスク対象外） | `apps/desktop/src/main/**/*.test.ts`      |
| IPC通信                    | ✅ Main-Renderer連携、チャンネル             | `*.ipc.test.ts`                           |
| Preload                    | API公開、型安全性（本タスク対象外）          | `apps/desktop/src/preload/**/*.test.ts`   |

---

## 7. サブタスク管理

Phase実行開始時に、以下のサブタスクを作成・管理すること:

1. Task 1: FileAttachmentButton テスト作成
2. Task 2: FileContextList テスト作成
3. Task 3: アクセシビリティテスト作成
4. Task 4: 統合テスト作成
5. テスト実行確認（全て失敗 = Red状態）
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに完了に更新すること。

---

## 8. タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスク（Task 1-4）を100%実行完了
- [ ] 各タスクの成果物（\*.test.tsx）が生成されている
- [ ] テストが実行可能で全て失敗する（Red状態）
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

---

## 9. 次のPhase

Phase 5: 実装（TDD Green）
