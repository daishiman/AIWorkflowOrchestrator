# アバター機能修正 - タスク指示書

## メタ情報

| 項目             | 内容                                           |
| ---------------- | ---------------------------------------------- |
| タスクID         | AVATAR-001                                     |
| タスク名         | アバター画像の保存・変更機能の修正             |
| 分類             | バグ修正                                       |
| 対象機能         | アバターアップロード・プロバイダーアバター使用 |
| 優先度           | 高                                             |
| 見積もり規模     | 中規模                                         |
| ステータス       | 未実施                                         |
| 発見元           | ユーザー報告                                   |
| 発見日           | 2025-12-10                                     |
| 発見エージェント | ユーザー                                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

ユーザーがアバター画像を変更しようとしても、保存されない・反映されないという問題が報告された。実装コードは完備しているが、以下の問題が存在する可能性がある。

### 1.2 問題点・課題

調査の結果、以下の問題点を特定：

#### 問題1: データ同期の不整合

- `avatarHandlers.ts` は `supabase.auth.updateUser()` で `user_metadata.avatar_url` を更新
- `profileHandlers.ts` の `profile:get` は `user_profiles` テーブルを優先して取得
- **結果**: アバター更新後も古いデータが表示される

#### 問題2: Supabase Storage バケット未設定

- `avatarHandlers.ts` は `avatars` バケットへのアップロードを試みる
- Supabase プロジェクトに `avatars` バケットが存在しない場合、アップロードが失敗する
- エラーメッセージが適切にユーザーに表示されていない可能性

#### 問題3: プロファイル更新の同期漏れ

- `uploadAvatar()` 成功後、`authSlice.ts` で `profile.avatarUrl` を更新
- しかし、`profile:get` を再呼び出しないため、古いキャッシュが残る可能性

### 1.3 放置した場合の影響

- ユーザーがアバターをカスタマイズできない
- アカウント設定機能の信頼性低下
- ユーザー体験の著しい低下

---

## 2. 何を達成するか（What）

### 2.1 目的

アバター画像のアップロード・プロバイダーアバター使用・削除機能を正常に動作させる。

### 2.2 最終ゴール

1. アバター画像をアップロードして保存できる
2. プロバイダー（Google/GitHub/Discord）のアバターを使用できる
3. アバターを削除できる
4. 変更が即座にUIに反映される

### 2.3 スコープ

#### 含むもの

- Supabase Storage `avatars` バケットの設定確認・作成
- `avatarHandlers.ts` と `profileHandlers.ts` のデータ同期修正
- `authSlice.ts` のアバター更新後のプロファイル再取得
- エラーメッセージの日本語化と適切な表示
- アバター機能の単体テスト追加

#### 含まないもの

- アバター画像のリサイズ・圧縮機能
- アバター画像のトリミングUI
- GIF アニメーションのサポート

### 2.4 成果物

| 種別         | 成果物                     | 配置先                                                |
| ------------ | -------------------------- | ----------------------------------------------------- |
| 機能         | 修正されたアバターハンドラ | `apps/desktop/src/main/ipc/avatarHandlers.ts`         |
| 機能         | 修正されたauthSlice        | `apps/desktop/src/renderer/store/slices/authSlice.ts` |
| インフラ     | Supabase Storage バケット  | Supabase プロジェクト設定                             |
| ドキュメント | 設定手順書                 | `docs/30-workflows/avatar-fix/`                       |
| 品質         | テストファイル             | `apps/desktop/src/main/ipc/avatarHandlers.test.ts`    |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Supabase プロジェクトへの管理者アクセス権
- 認証機能が正常に動作していること
- `pnpm install` が完了していること

### 3.2 依存タスク

- `login-only-auth` タスクの完了（PR #131 でマージ済み）

### 3.3 必要な知識・スキル

- Supabase Storage API
- Supabase Auth (user_metadata)
- Electron IPC 通信
- Zustand 状態管理

### 3.4 推奨アプローチ

1. **Supabase Storage バケット設定**: まず `avatars` バケットを作成・確認
2. **データ同期の修正**: `user_metadata` を Single Source of Truth として統一
3. **プロファイル再取得**: アバター更新後に `fetchProfile()` を呼び出し
4. **エラーハンドリング強化**: エラー時のフィードバックを改善

---

## 4. 実行手順

### Phase構成

```
Phase 0: 要件定義・問題分析
Phase 1: Supabase Storage バケット設定
Phase 2: テスト作成 (TDD: Red)
Phase 3: 実装・修正 (TDD: Green)
Phase 4: リファクタリング (TDD: Refactor)
Phase 5: 品質保証
Phase 5.5: 最終レビューゲート
Phase 6: ドキュメント更新
```

---

### Phase 0: 要件定義・問題分析

#### 目的

アバター機能の問題を詳細に分析し、修正方針を確定する。

#### Claude Code スラッシュコマンド

> 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:debug-error "アバター画像を保存できない"
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/req-analyst.md`
- **選定理由**: 問題の根本原因を分析し、要件を明確化
- **参照**: `.claude/agents/agent_list.md`

#### 問題の詳細分析

##### 1. アップロードフロー

```
[ユーザー] → [AccountSection] → [authSlice.uploadAvatar()]
                                        ↓
                            [IPC: avatar:upload]
                                        ↓
                            [avatarHandlers.ts]
                                        ↓
                        [Supabase Storage アップロード]
                                        ↓
                        [supabase.auth.updateUser(user_metadata)]
                                        ↓
                            [成功レスポンス]
                                        ↓
                        [authSlice: profile.avatarUrl 更新] ← ★ここで止まる
                                        ↓
                        [profile:get は user_profiles を見る] ← ★ 不整合
```

##### 2. 修正方針

**Option A: user_profiles テーブルも更新する**

- `avatarHandlers.ts` で `user_metadata` と `user_profiles` 両方を更新
- 利点: データの一貫性
- 欠点: 複雑さ増加、user_profiles テーブル必須

**Option B: user_metadata を Single Source of Truth にする (推奨)**

- `profileHandlers.ts` で `user_metadata.avatar_url` を優先使用
- 利点: シンプル、テーブル依存なし
- 欠点: user_profiles テーブルの avatar_url が古くなる可能性

**選定**: Option B を採用（user_profiles テーブルがなくても動作する設計に合致）

#### 成果物

| 成果物           | パス                                       | 内容         |
| ---------------- | ------------------------------------------ | ------------ |
| 分析ドキュメント | `docs/30-workflows/avatar-fix/analysis.md` | 問題分析結果 |

#### 完了条件

- [ ] 問題の根本原因が特定されている
- [ ] 修正方針が決定されている

---

### Phase 1: Supabase Storage バケット設定

#### 目的

`avatars` バケットを Supabase に作成し、適切なポリシーを設定する。

#### 手順

1. Supabase ダッシュボードにログイン
2. Storage → New Bucket → `avatars` を作成
3. Public bucket: **ON** (アバターは公開)
4. RLS ポリシーを設定:

```sql
-- アップロード許可 (認証済みユーザーのみ、自分のファイルのみ)
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 読み取り許可 (全員)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 更新許可 (認証済みユーザーのみ、自分のファイルのみ)
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 削除許可 (認証済みユーザーのみ、自分のファイルのみ)
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Claude Code スラッシュコマンド

> 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:setup-db-backup supabase-storage
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/db-architect.md`
- **選定理由**: Supabase Storage のポリシー設計
- **参照**: `.claude/agents/agent_list.md`

#### 完了条件

- [ ] `avatars` バケットが作成されている
- [ ] RLS ポリシーが適切に設定されている
- [ ] テストアップロードが成功する

---

### Phase 2: テスト作成 (TDD: Red)

#### 目的

アバター機能のテストを先に作成する。

#### Claude Code スラッシュコマンド

> 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:generate-unit-tests apps/desktop/src/main/ipc/avatarHandlers.ts
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/unit-tester.md`
- **選定理由**: TDD原則に基づいたテスト設計
- **参照**: `.claude/agents/agent_list.md`

#### テストケース

| テストID | シナリオ                           | 期待結果                        |
| -------- | ---------------------------------- | ------------------------------- |
| AVT-01   | アバターアップロード成功           | avatarUrl が返される            |
| AVT-02   | 未認証でアップロード               | エラー: Not authenticated       |
| AVT-03   | キャンセル時                       | エラー: upload-cancelled        |
| AVT-04   | 無効なファイル形式                 | エラー: invalid-file-type       |
| AVT-05   | ファイルサイズ超過                 | エラー: file-too-large          |
| AVT-06   | プロバイダーアバター使用成功       | avatarUrl が返される            |
| AVT-07   | 未連携プロバイダー指定             | エラー: provider-not-linked     |
| AVT-08   | アバター削除成功                   | success: true                   |
| AVT-09   | プロファイル取得でavatarUrl反映    | user_metadata.avatar_url を使用 |
| AVT-10   | アップロード後のプロファイル再取得 | 最新のavatarUrlが反映           |

#### TDD検証: Red状態確認

```bash
pnpm --filter @repo/desktop test:run
```

- [ ] テストが失敗することを確認（Red状態）

#### 完了条件

- [ ] 全テストケースが作成されている
- [ ] テストが失敗状態（Red）であること

---

### Phase 3: 実装・修正 (TDD: Green)

#### 目的

テストを通すための修正を行う。

#### Claude Code スラッシュコマンド

> 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:fix-build-error
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/logic-dev.md`, `.claude/agents/electron-architect.md`
- **選定理由**: ビジネスロジック修正と Electron アーキテクチャの専門家
- **参照**: `.claude/agents/agent_list.md`

#### 修正内容

##### 修正1: profileHandlers.ts - user_metadata.avatar_url を優先

```typescript
// apps/desktop/src/main/ipc/profileHandlers.ts
// profile:get ハンドラー内

// user_profilesテーブルが存在しない場合またはavatarUrlがない場合は
// user_metadataからフォールバック
const fallbackProfile: UserProfile = {
  id: user.id,
  displayName:
    (user.user_metadata?.display_name as string) ??
    (user.user_metadata?.name as string) ??
    (user.user_metadata?.full_name as string) ??
    "ユーザー",
  email: user.email ?? "",
  // ★ user_metadata.avatar_url を優先使用
  avatarUrl: (user.user_metadata?.avatar_url as string) ?? null,
  plan: "free",
  createdAt: user.created_at ?? new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
```

##### 修正2: authSlice.ts - アバター更新後にプロファイル再取得

```typescript
// apps/desktop/src/renderer/store/slices/authSlice.ts
// uploadAvatar() 内

if (response.success && response.data) {
  // プロファイルを再取得して最新のavatarUrlを反映
  await get().fetchProfile();
  set({ isLoading: false });
} else {
  // ...
}
```

##### 修正3: avatarHandlers.ts - ファイル名にユーザーIDプレフィックス追加

```typescript
// apps/desktop/src/main/ipc/avatarHandlers.ts
// アップロード時のファイル名

// ユーザーIDをフォルダとして使用（RLSポリシーと整合）
const fileName = `${user.id}/${Date.now()}${path.extname(filePath)}`;
```

##### 修正4: エラーメッセージの日本語化

```typescript
// apps/desktop/src/renderer/store/slices/authSlice.ts

const AVATAR_ERROR_MESSAGES: Record<string, string> = {
  "avatar/upload-failed": "アバターのアップロードに失敗しました",
  "avatar/upload-cancelled": "アップロードがキャンセルされました",
  "avatar/use-provider-failed": "プロバイダーアバターの設定に失敗しました",
  "avatar/provider-not-linked": "このプロバイダーは連携されていません",
  "avatar/no-provider-avatar": "このプロバイダーにアバターがありません",
  "avatar/remove-failed": "アバターの削除に失敗しました",
  "avatar/file-too-large": "ファイルサイズが大きすぎます（最大5MB）",
  "avatar/invalid-file-type":
    "無効なファイル形式です（jpg, png, gif, webp のみ）",
};
```

#### TDD検証: Green状態確認

```bash
pnpm --filter @repo/desktop test:run
```

- [ ] テストが成功することを確認（Green状態）

#### 完了条件

- [ ] 全テストが通過
- [ ] アバターアップロードが動作する
- [ ] プロバイダーアバター使用が動作する
- [ ] アバター削除が動作する

---

### Phase 4: リファクタリング (TDD: Refactor)

#### 目的

コード品質を改善する。

#### Claude Code スラッシュコマンド

> 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:refactor apps/desktop/src/main/ipc/avatarHandlers.ts
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/code-quality.md`
- **選定理由**: コード品質改善の専門家
- **参照**: `.claude/agents/agent_list.md`

#### リファクタリング観点

- [ ] 重複コードの排除
- [ ] エラーハンドリングの統一
- [ ] JSDoc コメントの追加・更新
- [ ] ログ出力の改善

#### TDD検証: 継続Green確認

```bash
pnpm --filter @repo/desktop test:run
```

- [ ] リファクタリング後もテストが成功すること

---

### Phase 5: 品質保証

#### 目的

品質ゲートをすべて通過することを確認する。

#### Claude Code スラッシュコマンド

> 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:run-all-tests --coverage
/ai:lint --fix
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 品質ゲートチェックリスト

- [ ] 全テスト成功
- [ ] Lint エラーなし
- [ ] 型エラーなし
- [ ] カバレッジ 80% 以上（アバター関連コード）

---

### Phase 5.5: 最終レビューゲート

#### 目的

実装完了後の最終品質確認。

#### レビュー参加エージェント

| エージェント    | レビュー観点     |
| --------------- | ---------------- |
| `.claude/agents/code-quality.md` | コード品質       |
| `.claude/agents/sec-auditor.md`  | セキュリティ     |
| `.claude/agents/unit-tester.md`  | テスト品質       |
| `.claude/agents/ui-designer.md`  | UIフィードバック |

#### レビューチェックリスト

**セキュリティ** (`.claude/agents/sec-auditor.md`)

- [ ] ファイルアップロードのサニタイズ
- [ ] RLS ポリシーの適切性
- [ ] ファイルサイズ・形式の検証

**コード品質** (`.claude/agents/code-quality.md`)

- [ ] エラーハンドリングの網羅性
- [ ] ログ出力の適切性
- [ ] コードの可読性

**テスト品質** (`.claude/agents/unit-tester.md`)

- [ ] テストカバレッジ
- [ ] エッジケースの網羅
- [ ] モックの適切性

**UIフィードバック** (`.claude/agents/ui-designer.md`)

- [ ] エラーメッセージの分かりやすさ
- [ ] ローディング状態の表示
- [ ] 成功時のフィードバック

#### 完了条件

- [ ] 全レビュー観点で PASS 評価

---

### Phase 6: ドキュメント更新

#### 目的

システムドキュメントを更新する。

#### Claude Code スラッシュコマンド

> 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:update-all-docs
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 更新対象ドキュメント

- `docs/00-requirements/08-api-design.md` - アバター API の修正内容
- `docs/00-requirements/12-deployment.md` - Supabase Storage 設定手順

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] アバター画像をアップロードできる
- [ ] アップロード後、即座にUIに反映される
- [ ] プロバイダーのアバターを使用できる
- [ ] アバターを削除できる
- [ ] エラー時に適切な日本語メッセージが表示される

### 品質要件

- [ ] テストカバレッジ 80% 以上
- [ ] Lint/型エラーなし
- [ ] Supabase Storage RLS が適切

### ドキュメント要件

- [ ] 設定手順が文書化されている
- [ ] システムドキュメントが更新されている

---

## 6. 検証方法

### テストケース

1. 新しい画像をアップロード → UIに即座に反映される
2. Google のアバターを使用 → UIに即座に反映される
3. アバターを削除 → デフォルトアイコンに戻る
4. 5MBを超えるファイル → エラーメッセージ表示
5. 無効なファイル形式 → エラーメッセージ表示

### 検証手順

1. アプリをビルドして起動
2. ログインしてアカウント設定画面を開く
3. アバターの編集ボタンをクリック
4. 「アップロード」を選択し、画像を選択
5. アバターが変更されることを確認
6. アプリを再起動
7. 変更が保持されていることを確認

---

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                                   |
| ---------------------------- | ------ | -------- | -------------------------------------- |
| Storage バケット未設定       | 高     | 中       | 設定手順の文書化、エラーメッセージ改善 |
| RLS ポリシー設定ミス         | 高     | 低       | テストでの検証、レビュー               |
| 大容量ファイルのアップロード | 低     | 中       | フロント・バックエンドでサイズ制限     |
| user_metadata 更新の失敗     | 中     | 低       | リトライ機構、エラーハンドリング       |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/login-only-auth/` - 認証機能設計
- `apps/desktop/src/main/ipc/avatarHandlers.ts` - 現在の実装
- `apps/desktop/src/renderer/store/slices/authSlice.ts` - 状態管理

### 参考資料

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Auth User Metadata](https://supabase.com/docs/guides/auth/managing-user-data)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)

---

## 9. 備考

### ユーザー報告の原文

```
アバターの画像を保存できないです。変更ができないです。
```

### 補足事項

- `user_profiles` テーブルは optional（なくても動作する設計）
- `user_metadata` を Single Source of Truth として統一することで、テーブル依存を解消
- Supabase Storage の `avatars` バケット設定は必須
