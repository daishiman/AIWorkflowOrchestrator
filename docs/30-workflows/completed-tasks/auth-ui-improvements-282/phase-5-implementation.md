# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                       |
| ------ | ------------------------ |
| Phase  | 5                        |
| 機能名 | auth-ui-improvements-282 |
| 作成日 | 2026-02-04               |

## 目的

Phase 4で作成したテストを通すための最小限の実装を行う。

---

## 実行タスク

### Task 1: z-index修正実装（T-05-1）

#### 変更ファイル

`apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx`

#### 変更内容

| 行番号  | 変更前 | 変更後     | 理由                       |
| ------- | ------ | ---------- | -------------------------- |
| 384行目 | `z-50` | `z-[9999]` | ポップアップを最前面に表示 |

#### 実装手順

1. ファイルを開く
2. 384行目付近のclassNameを検索
3. `z-50`を`z-[9999]`に変更
4. テスト実行で確認

---

### Task 2: フォールバック処理実装（T-05-2）

#### 変更ファイル

`apps/desktop/src/main/ipc/profileHandlers.ts`

#### 変更内容

##### 変更箇所1: PROFILE_GET（108-120行目付近）

エラー検出条件に以下を追加:

| 追加条件                                  | 理由                           |
| ----------------------------------------- | ------------------------------ |
| `error.message.includes("user_profiles")` | テーブル名を含むエラー検出     |
| `error.message.includes("relation")`      | PostgreSQLのrelationエラー検出 |
| `error.code === "PGRST116"`               | 行が見つからないエラー検出     |

##### 変更箇所2: PROFILE_UPDATE（253-265行目付近）

同様の条件を追加。

#### 実装例

```typescript
// エラー検出条件（追加部分）
if (
  error.message.includes("schema cache") ||
  error.message.includes("does not exist") ||
  error.message.includes("user_profiles") || // 追加
  error.message.includes("relation") || // 追加
  error.code === "PGRST200" ||
  error.code === "PGRST116" || // 追加
  error.code === "42P01"
) {
  // user_metadataにフォールバック
}
```

---

### Task 3: 状態更新フロー実装（T-05-3）

#### 変更ファイル

`apps/desktop/src/renderer/store/slices/authSlice.ts`

#### 変更内容

| 行番号    | 変更前                  | 変更後                                                     |
| --------- | ----------------------- | ---------------------------------------------------------- |
| 340-343行 | `get().fetchProfile();` | `get().fetchProfile();`<br>`get().fetchLinkedProviders();` |

#### 実装手順

1. onAuthStateChangedリスナー内を検索
2. `fetchProfile()`の直後に`fetchLinkedProviders()`を追加
3. コメントを更新

#### 実装例

```typescript
// Refresh profile and linked providers after auth state change
// (連携解除時などにUIを即座に更新するため)
get().fetchProfile();
get().fetchLinkedProviders(); // 追加
```

---

## 統合テスト連携【必須】

Main-Renderer連携実装とテスト支援コード整備:

| 実装項目           | 内容                                           |
| ------------------ | ---------------------------------------------- |
| IPC通信            | 既存チャンネル（PROFILE_GET/UPDATE等）を活用   |
| エラーハンドリング | フォールバック処理をprofileHandlersに実装      |
| 状態同期           | AUTH_STATE_CHANGED後のfetchLinkedProviders追加 |

---

## アーキテクチャ層別実装

| 層                         | 実装内容           | ファイル配置                              |
| -------------------------- | ------------------ | ----------------------------------------- |
| フロントエンド（Renderer） | z-index修正        | `apps/desktop/src/renderer/components/`   |
| バックエンド（Main）       | フォールバック処理 | `apps/desktop/src/main/ipc/`              |
| 状態管理                   | authSlice更新      | `apps/desktop/src/renderer/store/slices/` |

---

## TDD検証: Green状態確認

```bash
# テスト実行
pnpm --filter @repo/desktop test:run src/renderer/components/organisms/AccountSection
pnpm --filter @repo/desktop test:run src/main/ipc/profileHandlers.test.ts
pnpm --filter @repo/desktop test:run src/renderer/store/slices/authSlice.test.ts

# 確認項目
# - [ ] すべてのテストが成功することを確認（Green状態）
```

---

## 参照資料

| 資料名             | パス                                                               | 説明                        |
| ------------------ | ------------------------------------------------------------------ | --------------------------- |
| Phase 4成果物      | `outputs/phase-4/`                                                 | テスト仕様                  |
| エラー処理         | `aiworkflow-requirements: error-handling.md`                       | エラー処理指針              |
| 状態管理           | `aiworkflow-requirements: arch-state-management.md`                | Store設計                   |
| UI/UXポータル      | `aiworkflow-requirements: ui-ux-portal-patterns.md`                | z-index階層（z-[9999]根拠） |
| 認証アーキテクチャ | `aiworkflow-requirements: architecture-auth-security.md`           | Supabase+Electron構造       |
| 実装パターン       | `aiworkflow-requirements: architecture-implementation-patterns.md` | フォールバックパターン      |
| 認証IPC仕様        | `aiworkflow-requirements: api-ipc-auth.md`                         | IPC API詳細                 |
| セキュリティ       | `aiworkflow-requirements: security-api-electron.md`                | Preload APIセキュリティ     |

---

## 成果物

| 成果物          | パス                                                                      | 説明               |
| --------------- | ------------------------------------------------------------------------- | ------------------ |
| 修正ファイル(1) | `apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx` | z-index修正        |
| 修正ファイル(2) | `apps/desktop/src/main/ipc/profileHandlers.ts`                            | フォールバック追加 |
| 修正ファイル(3) | `apps/desktop/src/renderer/store/slices/authSlice.ts`                     | 状態更新追加       |

---

## 完了条件

- [ ] z-indexが`z-[9999]`に変更されている
- [ ] フォールバック処理のエラー検出条件が追加されている
- [ ] onAuthStateChanged内でfetchLinkedProvidersが呼ばれる
- [ ] すべてのテストが成功状態（Green）
- [ ] Main-Renderer連携が正しく実装されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 6: テスト拡充
