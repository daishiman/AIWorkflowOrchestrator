# Googleアバター取得修正 - タスク指示書

## ユーザーからの元の指示

```
Googleのアバターを使用する表示がされないです。Google連携できているはずです
```

## メタ情報

| 項目             | 内容                                              |
| ---------------- | ------------------------------------------------- |
| タスクID         | AUTH-UI-004                                       |
| タスク名         | Googleアバター取得修正                            |
| 分類             | バグ修正                                          |
| 対象機能         | AccountSection アバターメニュー                   |
| 優先度           | 高                                                |
| 見積もり規模     | 小規模                                            |
| ステータス       | 一部実装済み（コード修正完了、動作確認待ち）      |
| 発見元           | Phase 5.5 最終レビュー                            |
| 発見日           | 2025-12-10                                        |
| 発見エージェント | ユーザーフィードバック                            |
| 関連タスク       | AUTH-UI-001, AUTH-UI-002, AUTH-UI-003, AVATAR-001 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

AUTH-UI-003でアバターメニューの動的表示機能を実装した際、Google連携が正常に行われているにもかかわらず「Googleのアバターを使用」オプションがメニューに表示されない問題が報告された。

### 1.2 問題点・課題

#### 根本原因

Supabase Auth の `identity_data` 内でアバターURLのキー名がプロバイダーによって異なる：

| プロバイダー | アバターURLのキー名 |
| ------------ | ------------------- |
| Google       | `picture`           |
| GitHub       | `avatar_url`        |
| Discord      | `avatar_url`        |

#### 技術的問題

1. `toLinkedProvider()` 関数が `identity_data?.avatar_url` のみを参照
2. Google の場合 `identity_data?.picture` にアバターURLが格納される
3. その結果、Google の `avatarUrl` が `null` となりメニューに表示されない

#### 該当コード（修正前）

```typescript
// packages/shared/infrastructure/auth/supabase-client.ts
export function toLinkedProvider(identity: SupabaseIdentity): LinkedProvider {
  return {
    provider: identity.provider as OAuthProvider,
    providerId: identity.id,
    email: identity.identity_data?.email ?? "",
    displayName: identity.identity_data?.name ?? null,
    avatarUrl: identity.identity_data?.avatar_url ?? null, // ← Googleの場合null
    linkedAt: identity.created_at,
  };
}
```

### 1.3 放置した場合の影響

- Google連携ユーザーが自分のGoogleアバターを使用できない
- アバターメニューの機能が不完全
- ユーザー体験の低下

---

## 2. 何を達成するか（What）

### 2.1 目的

Google、GitHub、Discord すべてのプロバイダーでアバターURLを正しく取得し、アバターメニューに表示する。

### 2.2 最終ゴール

1. Google連携時に「Googleのアバターを使用」オプションが表示される
2. すべてのプロバイダーでアバターURLが正しく取得される
3. プロバイダーごとのキー名の違いを吸収する

### 2.3 スコープ

#### 含むもの

- `toLinkedProvider()` 関数の修正
- `SupabaseIdentity` 型への `picture` プロパティ追加
- 動作確認テスト

#### 含まないもの

- 他のプロバイダーへの対応（Apple, Twitter等）
- アバター画像の変換・リサイズ

### 2.4 成果物

| 種別   | 成果物                         | 配置先                                                   |
| ------ | ------------------------------ | -------------------------------------------------------- |
| 機能   | 修正された toLinkedProvider    | `packages/shared/infrastructure/auth/supabase-client.ts` |
| 型定義 | 拡張された SupabaseIdentity 型 | `packages/shared/types/auth.ts`                          |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Google認証が正常に動作していること
- `pnpm install` が完了していること
- shared パッケージのビルドが可能であること

### 3.2 依存タスク

- AUTH-UI-001（認証UI改善）完了済み
- AUTH-UI-003（アバターメニュー動的表示）完了済み

### 3.3 必要な知識・スキル

- TypeScript
- Supabase Auth API
- OAuth プロバイダーの identity_data 仕様

### 3.4 推奨アプローチ

1. `SupabaseIdentity` 型に `picture` プロパティを追加
2. `toLinkedProvider()` で `avatar_url` と `picture` の両方をフォールバック参照
3. sharedパッケージをビルドして変更を反映
4. アプリで動作確認

---

## 4. 実行手順

### Phase構成

```
Phase 1: 設計確認
Phase 2: テスト作成 (TDD: Red)
Phase 3: 実装 (TDD: Green) ← 実装済み
Phase 4: リファクタリング
Phase 5: 品質保証
Phase 5.5: 最終レビューゲート
Phase 6: ドキュメント更新
```

---

### Phase 1: 設計確認

#### 目的

プロバイダーごとの identity_data の仕様を確認する。

#### 確認事項

| プロバイダー | identity_data の主要キー                           |
| ------------ | -------------------------------------------------- |
| Google       | `email`, `name`, `picture`, `sub`                  |
| GitHub       | `email`, `name`, `avatar_url`, `login`             |
| Discord      | `email`, `username`, `avatar_url`, `discriminator` |

#### 完了条件

- [ ] 各プロバイダーのidentity_data仕様が確認されている

---

### Phase 2: テスト作成 (TDD: Red)

#### 目的

`toLinkedProvider()` 関数のテストを追加する。

#### Claude Code スラッシュコマンド

> 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:generate-unit-tests packages/shared/infrastructure/auth/supabase-client.ts
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `@unit-tester`
- **選定理由**: TDD原則に基づいたテスト設計
- **参照**: `.claude/agents/agent_list.md`

#### テストケース

| テストID | シナリオ                           | 期待結果                     |
| -------- | ---------------------------------- | ---------------------------- |
| GAV-01   | Google identity (picture あり)     | avatarUrl が picture の値    |
| GAV-02   | GitHub identity (avatar_url あり)  | avatarUrl が avatar_url の値 |
| GAV-03   | Discord identity (avatar_url あり) | avatarUrl が avatar_url の値 |
| GAV-04   | 両方存在する場合                   | avatar_url が優先される      |
| GAV-05   | 両方存在しない場合                 | avatarUrl が null            |

#### TDD検証: Red状態確認

```bash
pnpm --filter @repo/shared test:run
```

- [ ] テストが失敗することを確認（Red状態）

#### 完了条件

- [ ] テストケースが作成されている
- [ ] テストが失敗状態（Red）である

---

### Phase 3: 実装 (TDD: Green)

#### 目的

テストを通すための実装を行う。

#### 実装内容（実装済み）

##### 修正1: SupabaseIdentity 型の拡張

```typescript
// packages/shared/types/auth.ts
export interface SupabaseIdentity {
  id: string;
  provider: string;
  identity_data?: {
    email?: string;
    name?: string;
    avatar_url?: string;
    picture?: string; // Google uses 'picture' instead of 'avatar_url'
  };
  created_at: string;
}
```

##### 修正2: toLinkedProvider 関数の修正

```typescript
// packages/shared/infrastructure/auth/supabase-client.ts
export function toLinkedProvider(identity: SupabaseIdentity): {
  provider: OAuthProvider;
  providerId: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  linkedAt: string;
} {
  // プロバイダーによってavatarのキー名が異なる
  // Google: picture, GitHub/Discord: avatar_url
  const avatarUrl =
    identity.identity_data?.avatar_url ??
    identity.identity_data?.picture ??
    null;

  return {
    provider: identity.provider as OAuthProvider,
    providerId: identity.id,
    email: identity.identity_data?.email ?? "",
    displayName: identity.identity_data?.name ?? null,
    avatarUrl,
    linkedAt: identity.created_at,
  };
}
```

#### TDD検証: Green状態確認

```bash
pnpm --filter @repo/shared build
pnpm --filter @repo/desktop test:run
```

- [x] テストが成功することを確認（Green状態）
- [x] 1265テスト全通過

#### 完了条件

- [x] コード修正が完了している
- [x] テストが通過している

---

### Phase 4: リファクタリング

#### 目的

コード品質を確認・改善する。

#### チェック項目

- [x] JSDocコメントが適切に記述されている
- [x] プロバイダーごとのキー名の違いがコメントで説明されている
- [ ] 将来的なプロバイダー追加への対応を検討

---

### Phase 5: 品質保証

#### 目的

品質ゲートを通過することを確認する。

#### Claude Code スラッシュコマンド

```
/ai:run-all-tests
/ai:lint --fix
```

#### 品質ゲートチェックリスト

- [x] 全テスト成功（1265テスト）
- [x] 型チェック通過
- [ ] 実機での動作確認

#### 実機確認手順

1. `pnpm --filter @repo/shared build` でsharedパッケージをビルド
2. `pnpm --filter @repo/desktop dev` でアプリを起動
3. Google連携済みアカウントでログイン
4. アバター編集メニューを開く
5. 「Googleのアバターを使用」オプションが表示されることを確認

---

### Phase 5.5: 最終レビューゲート

#### レビュー参加エージェント

| エージェント    | レビュー観点 |
| --------------- | ------------ |
| `@code-quality` | コード品質   |
| `@unit-tester`  | テスト品質   |
| `@sec-auditor`  | セキュリティ |

#### レビューチェックリスト

**コード品質** (`@code-quality`)

- [x] フォールバックロジックの正確性
- [x] 型安全性の確保
- [x] コメントの適切性

**テスト品質** (`@unit-tester`)

- [x] 既存テストが通過
- [ ] toLinkedProvider のユニットテスト追加

**セキュリティ** (`@sec-auditor`)

- [x] 外部データの適切な取り扱い
- [x] nullチェックの実施

---

### Phase 6: ドキュメント更新

#### 更新対象ドキュメント

- `docs/00-requirements/16-ui-ux-guidelines.md` - アバターメニュー設計（更新済み）
- `docs/00-requirements/17-security-guidelines.md` - プロバイダー別データ仕様（必要に応じて）

---

## 5. 完了条件チェックリスト

### 機能要件

- [x] コード修正が完了している
- [ ] Google連携時に「Googleのアバターを使用」オプションが表示される
- [ ] Googleアバターをクリックして使用できる
- [ ] GitHub/Discordアバターも引き続き動作する

### 品質要件

- [x] 全テスト通過（1265テスト）
- [x] 型エラーなし
- [x] Lintエラーなし

### ドキュメント要件

- [x] UI/UXガイドラインが更新されている
- [x] コードにJSDocコメントが追加されている

---

## 6. 検証方法

### テストケース

1. Google連携 → アバターメニューを開く → 「Googleのアバターを使用」が表示される
2. GitHub連携 → アバターメニューを開く → 「GitHubのアバターを使用」が表示される
3. Discord連携 → アバターメニューを開く → 「Discordのアバターを使用」が表示される
4. 複数連携 → 現在使用中以外のプロバイダーのみ表示される

### 検証手順

1. `pnpm --filter @repo/shared build` でsharedパッケージをビルド
2. `pnpm --filter @repo/desktop dev` でアプリを起動
3. Google連携済みアカウントでログイン
4. アカウント設定画面を開く
5. アバター編集ボタンをクリック
6. 「Googleのアバターを使用」オプションが表示されることを確認
7. クリックしてGoogleアバターに変更できることを確認

---

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                             |
| ---------------------------- | ------ | -------- | -------------------------------- |
| 他プロバイダーで異なるキー名 | 中     | 低       | 将来的にプロバイダー追加時に確認 |
| identity_data がnull         | 低     | 低       | null チェック済み                |
| sharedパッケージのビルド忘れ | 高     | 中       | 検証手順に明記                   |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/auth-ui-improvements/task-auth-ui-z-index-fix.md` - AUTH-UI-002
- `docs/00-requirements/16-ui-ux-guidelines.md` - UI/UXガイドライン

### 関連ファイル

- `packages/shared/types/auth.ts` - SupabaseIdentity型
- `packages/shared/infrastructure/auth/supabase-client.ts` - toLinkedProvider関数
- `apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx` - アバターメニューUI

### 参考資料

- [Google OAuth identity claims](https://developers.google.com/identity/openid-connect/openid-connect#an-id-tokens-payload)
- [GitHub OAuth user data](https://docs.github.com/en/rest/users/users#get-the-authenticated-user)
- [Discord OAuth user object](https://discord.com/developers/docs/resources/user#user-object)

---

## 9. 備考

### 実装状況

コード修正は完了しており、テストも通過しています。残りは実機での動作確認のみです。

### 修正コード

#### packages/shared/types/auth.ts

```typescript
export interface SupabaseIdentity {
  id: string;
  provider: string;
  identity_data?: {
    email?: string;
    name?: string;
    avatar_url?: string;
    picture?: string; // Google uses 'picture' instead of 'avatar_url'
  };
  created_at: string;
}
```

#### packages/shared/infrastructure/auth/supabase-client.ts

```typescript
const avatarUrl =
  identity.identity_data?.avatar_url ?? identity.identity_data?.picture ?? null;
```

### 補足事項

- sharedパッケージの変更はビルドが必要（`pnpm --filter @repo/shared build`）
- アプリの再起動が必要
