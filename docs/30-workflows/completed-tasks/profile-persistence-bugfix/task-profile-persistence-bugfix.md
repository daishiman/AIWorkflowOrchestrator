# プロフィール・アバター機能完全実装 - タスク実行仕様書

## ユーザーからの元の指示

```
@docs/30-workflows/unassigned-task/task-00-profile-persistence-bugfix.md を実行する。
@.kamui/prompt/custom-prompt.txt に落とし込んで。
CRUDの一連の処理が含まれるようにしてほしい。画面も含めて。
```

## メタ情報

| 項目         | 内容                                   |
| ------------ | -------------------------------------- |
| タスクID     | TASK-PROFILE-CRUD-00                   |
| タスク名     | プロフィール・アバター機能完全実装     |
| 分類         | バグ修正 + 機能拡張                    |
| 対象機能     | ユーザープロフィール CRUD + データ同期 |
| 優先度       | 最高（ブロッカー）                     |
| 見積もり規模 | 中規模                                 |
| ステータス   | 実施中                                 |
| 発見元       | ユーザー報告 + コード調査              |
| 発見日       | 2025-12-10                             |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

プロフィール・アバター管理機能が実装されているが、以下の問題がある：

1. **永続化バグ**: `user_profiles`テーブルと`user_metadata`（Supabase Auth）の同期が取れていない
2. **CRUD不完全**: プロフィール削除（アカウント削除）機能が未実装
3. **データ整合性**: 2つのデータソースが独立して更新されており、一貫性がない

### 1.2 現状の実装状況

| 操作       | プロフィール                 | アバター                               | UI          |
| ---------- | ---------------------------- | -------------------------------------- | ----------- |
| **Create** | ⚠️ 自動作成のみ              | N/A                                    | ✅ 実装済み |
| **Read**   | ✅ 実装済み                  | ✅ 実装済み                            | ✅ 実装済み |
| **Update** | ✅ 実装済み **（同期バグ）** | ✅ 実装済み **（同期バグ）**           | ✅ 実装済み |
| **Delete** | ❌ 未実装                    | ⚠️ 実装済み **（同期バグ: 効かない）** | ⚠️ 部分実装 |

### 1.3 問題箇所

```
profileHandlers.ts:256-328
  - profile:update が user_profiles のみ更新
  - user_metadata を更新しない → 永続化されない

avatarHandlers.ts:162-178, 266-282, 354-359
  - avatar:upload/use-provider/remove が user_metadata のみ更新
  - user_profiles.avatar_url を更新しない → 不整合発生

avatarHandlers.ts:305-387 (avatar:remove)
  ★ 特に重要な問題 ★
  - user_metadata.avatar_url = null のみ更新
  - user_profiles.avatar_url は更新されない
  - → 削除しても user_profiles から古いURLが読み込まれる
  - → アバター削除が効かない原因
```

### 1.4 追加要件（2025-12-10）

**ユーザーからの追加指示:**

1. **ソフトデリート（論理削除）**: 完全削除ではなく復元可能に（管理者用メール対応のため）
2. **ProfileCache = UserProfile 型統一**: キャッシュと型を完全同期
3. **アバター削除の修正**: 全データソース（user_profiles, user_metadata, cache）を同期

### 1.5 放置した場合の影響

- ユーザーの変更が保存されず、信頼性が著しく低下
- アプリ再起動で変更がリセットされる
- 他のタスク（TASK-01〜04）の前提条件が満たされない

---

## 2. 何を達成するか（What）

### 2.1 目的

1. プロフィール情報の変更が正しく永続化されるよう、データ同期問題を修正
2. アカウント削除機能を実装し、CRUD操作を完全化
3. UIに削除確認機能を追加

### 2.2 最終ゴール

1. **Create**: 初回ログイン時にプロフィールが正しく作成される（既存）
2. **Read**: プロフィール・アバター情報が正しく取得される（既存）
3. **Update**: 変更が`user_profiles`と`user_metadata`の両方に同期される
4. **Delete**: アカウント削除機能が動作し、UIから実行可能

### 2.3 スコープ

#### 含むもの

- `profileHandlers.ts`の修正（user_metadata同期追加）
- `avatarHandlers.ts`の修正（user_profiles同期追加）
- 同期ユーティリティ関数の作成
- アカウント削除ハンドラーの新規実装
- AccountSectionへの削除UI追加
- 既存テストの修正・追加
- 回帰テストの実施

#### 含まないもの

- プロバイダー連携追加（Electron制約で別タスク）
- Turso（ローカルDB）への移行
- 新規画面の作成（既存AccountSectionを拡張）

### 2.4 成果物一覧

| 種別           | 成果物               | 配置先                                                           |
| -------------- | -------------------- | ---------------------------------------------------------------- |
| 設計書         | データ同期設計       | `docs/30-workflows/profile-persistence-bugfix/design/`           |
| ユーティリティ | profileSync.ts       | `apps/desktop/src/main/infrastructure/profileSync.ts`            |
| 修正コード     | profileHandlers.ts   | `apps/desktop/src/main/ipc/profileHandlers.ts`                   |
| 修正コード     | avatarHandlers.ts    | `apps/desktop/src/main/ipc/avatarHandlers.ts`                    |
| 新規コード     | deleteAccountHandler | `apps/desktop/src/main/ipc/profileHandlers.ts`内                 |
| UI修正         | AccountSection       | `apps/desktop/src/renderer/components/organisms/AccountSection/` |
| テスト         | ユニットテスト       | `apps/desktop/src/main/ipc/*.test.ts`                            |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Supabase認証が動作していること
- 既存のプロフィール・アバター機能がビルドできること
- desktopパッケージのテスト環境が動作すること

### 3.2 依存タスク

- なし（このタスクが他のすべてのタスクのブロッカー）

### 3.3 必要な知識・スキル

- Supabase Auth API（`updateUser`, `getUser`, `admin.deleteUser`）
- Supabase PostgreSQL（`user_profiles`テーブル操作）
- Electron IPC ハンドラー
- React / Redux Toolkit
- TypeScript

### 3.4 推奨アプローチ

1. **設計フェーズ**: データフロー・同期戦略を設計
2. **TDDサイクル**: テスト作成 → 実装 → リファクタリング
3. **段階的実装**: 同期修正 → 削除機能 → UI

---

## 4. 実行手順

### Phase構成

```
Phase 0: 要件定義（完了）
  ↓
Phase 1: 設計
  ↓
Phase 1.5: 設計レビューゲート
  ↓
Phase 2: テスト作成 (TDD: Red)
  ↓
Phase 3: 実装 (TDD: Green)
  ↓
Phase 4: リファクタリング (TDD: Refactor)
  ↓
Phase 5: 品質保証
  ↓
Phase 5.5: 最終レビューゲート
  ↓
Phase 6: ドキュメント更新
```

---

## Phase 1: 設計

### T-01-1: データフロー・同期戦略設計

#### 目的

`user_profiles`テーブルと`user_metadata`の双方向同期戦略を設計する。

#### Claude Code スラッシュコマンド

```
/ai:design-architecture profile-sync
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/arch-police.md`
- **選定理由**: アーキテクチャ設計とレイヤー構造の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                              | 活用方法                     |
| ----------------------------------------------------- | ---------------------------- |
| .claude/skills/clean-architecture-principles/SKILL.md | レイヤー分離、依存方向の設計 |
| .claude/skills/solid-principles/SKILL.md              | 単一責務、依存性逆転         |

- **参照**: `.claude/skills/skill_list.md`

#### 設計内容

##### 4.1.1 データソースの責務分離

```
┌─────────────────────────────────────────────────────────────┐
│                      データソース                            │
├─────────────────────────────┬───────────────────────────────┤
│      user_profiles          │        user_metadata          │
│    (PostgreSQL DB)          │      (Supabase Auth)          │
├─────────────────────────────┼───────────────────────────────┤
│ - display_name              │ - display_name                │
│ - email                     │ - avatar_url                  │
│ - avatar_url                │ - avatar_source               │
│ - plan                      │ - name (OAuth由来)            │
│ - created_at                │ - full_name (OAuth由来)       │
│ - updated_at                │                               │
└─────────────────────────────┴───────────────────────────────┘
```

##### 4.1.2 同期戦略

```
【プライマリソース】
- user_profiles テーブル = Primary Source of Truth
- user_metadata = セッション復元用キャッシュ

【同期ルール】
1. profile:update 時
   → user_profiles 更新 (Primary)
   → user_metadata 同期 (Secondary)
   → ローカルキャッシュ更新

2. avatar:* 操作時
   → user_metadata 更新 (認証情報)
   → user_profiles.avatar_url 同期 (DB)
   → ローカルキャッシュ更新

3. フォールバック
   → user_profiles 不在時は user_metadata から復元
```

##### 4.1.3 同期ユーティリティ設計

```typescript
// apps/desktop/src/main/infrastructure/profileSync.ts

/**
 * プロフィール同期ユーティリティ
 * - user_profiles と user_metadata の双方向同期を管理
 */

interface SyncResult {
  success: boolean;
  error?: { code: string; message: string };
}

/**
 * user_profiles → user_metadata への同期
 * profile:update 時に呼び出し
 */
export async function syncProfileToMetadata(
  supabase: SupabaseClient,
  updates: {
    display_name?: string;
    avatar_url?: string | null;
  },
): Promise<SyncResult>;

/**
 * user_metadata → user_profiles への同期
 * avatar:* 操作時に呼び出し
 */
export async function syncMetadataToProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: {
    avatar_url?: string | null;
  },
): Promise<SyncResult>;

/**
 * 双方向同期（整合性チェック用）
 */
export async function ensureProfileConsistency(
  supabase: SupabaseClient,
  userId: string,
): Promise<SyncResult>;
```

#### 成果物

| 成果物     | パス                                                                 | 内容                   |
| ---------- | -------------------------------------------------------------------- | ---------------------- |
| 同期設計書 | `docs/30-workflows/profile-persistence-bugfix/design/sync-design.md` | データフロー・同期戦略 |

#### 完了条件

- [ ] データソースの責務が明確に定義されている
- [ ] 同期の方向とタイミングが定義されている
- [ ] エラー時のロールバック戦略が定義されている
- [ ] 同期ユーティリティのインターフェースが設計されている

---

### T-01-2: アカウント削除機能設計

#### 目的

アカウント削除機能のフロー・UI・安全性を設計する。

#### 使用エージェント

- **エージェント**: `.claude/agents/domain-modeler.md`
- **選定理由**: ドメインロジックとビジネスルールの設計専門家
- **参照**: `.claude/agents/agent_list.md`

#### 設計内容

##### 4.2.1 削除フロー

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    UI       │    │    IPC      │    │  Supabase   │
│ AccountSection   │    │  Handler    │    │   Auth/DB   │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                   │                   │
       │ 1. 削除ボタン     │                   │
       │────────────────>│                   │
       │                   │                   │
       │ 2. 確認ダイアログ │                   │
       │<────────────────│                   │
       │                   │                   │
       │ 3. 確認入力       │                   │
       │ (メールアドレス)  │                   │
       │────────────────>│                   │
       │                   │                   │
       │                   │ 4. user_profiles削除
       │                   │────────────────>│
       │                   │                   │
       │                   │ 5. Storage削除    │
       │                   │  (アップロード済みアバター)
       │                   │────────────────>│
       │                   │                   │
       │                   │ 6. Auth削除       │
       │                   │  (signOut + deleteUser)
       │                   │────────────────>│
       │                   │                   │
       │ 7. ログアウト     │                   │
       │  → ログイン画面   │                   │
       │<────────────────│                   │
```

##### 4.2.2 IPC チャネル追加

```typescript
// apps/desktop/src/preload/channels.ts に追加
PROFILE_DELETE: 'profile:delete',

// apps/desktop/src/preload/types.ts に追加
interface ProfileDeleteRequest {
  confirmEmail: string; // 確認用メールアドレス入力
}

interface ProfileDeleteResponse {
  success: boolean;
  error?: { code: string; message: string };
}
```

##### 4.2.3 UI設計（AccountSection拡張）

```
┌────────────────────────────────────────────────────────┐
│ アカウント設定                                          │
├────────────────────────────────────────────────────────┤
│                                                        │
│ [既存のプロフィール編集UI]                              │
│                                                        │
│ ──────────────────────────────────────────────────     │
│                                                        │
│ ⚠️ 危険な操作                                          │
│                                                        │
│ アカウントを削除すると、すべてのデータが               │
│ 完全に削除され、復元できません。                       │
│                                                        │
│ [🗑️ アカウントを削除]  ← 赤いボタン                    │
│                                                        │
└────────────────────────────────────────────────────────┘

【削除確認ダイアログ】
┌────────────────────────────────────────────────────────┐
│ ⚠️ アカウントを削除しますか？                          │
├────────────────────────────────────────────────────────┤
│                                                        │
│ この操作は取り消せません。以下のデータが削除されます： │
│                                                        │
│ ・プロフィール情報                                     │
│ ・アップロードしたアバター画像                         │
│ ・すべての設定                                         │
│                                                        │
│ 確認のため、メールアドレスを入力してください：         │
│                                                        │
│ [                                  ]                   │
│                                                        │
│        [キャンセル]    [削除する] ← 赤、disabled       │
│                                    (メール一致で有効化) │
└────────────────────────────────────────────────────────┘
```

#### 成果物

| 成果物       | パス                                                                   | 内容                   |
| ------------ | ---------------------------------------------------------------------- | ---------------------- |
| 削除機能設計 | `docs/30-workflows/profile-persistence-bugfix/design/delete-design.md` | フロー・UI・安全性設計 |

#### 完了条件

- [ ] 削除フローが明確に定義されている
- [ ] 確認ダイアログのUI設計が完了
- [ ] IPCチャネル・型定義が設計されている
- [ ] 削除順序（DB → Storage → Auth）が定義されている

---

## Phase 1.5: 設計レビューゲート

### T-01R: 設計レビュー

#### 目的

実装開始前に設計の妥当性を複数エージェントで検証する。

#### レビュー参加エージェント

| エージェント                     | レビュー観点         | 選定理由                     |
| -------------------------------- | -------------------- | ---------------------------- |
| .claude/agents/arch-police.md    | アーキテクチャ整合性 | レイヤー違反、依存関係の検証 |
| .claude/agents/sec-auditor.md    | セキュリティ設計     | 削除操作の安全性、認証・認可 |
| .claude/agents/domain-modeler.md | ドメインモデル妥当性 | ビジネスルール、データ整合性 |

- **参照**: `.claude/agents/agent_list.md`

#### レビューチェックリスト

**アーキテクチャ整合性** (.claude/agents/arch-police.md)

- [ ] 同期ユーティリティがinfrastructureレイヤーに適切に配置
- [ ] 依存関係逆転の原則(DIP)が守られている
- [ ] 既存アーキテクチャとの整合性がある

**セキュリティ設計** (.claude/agents/sec-auditor.md)

- [ ] 削除操作に適切な確認が実装される
- [ ] 認証状態の検証が含まれている
- [ ] 削除順序が安全（Auth削除は最後）

**ドメインモデル妥当性** (.claude/agents/domain-modeler.md)

- [ ] データソースの責務が明確
- [ ] 同期ルールがビジネス要件を満たす
- [ ] エラー時の振る舞いが定義されている

#### レビュー結果判定

- **PASS**: 全観点で問題なし → Phase 2へ進行
- **MINOR**: 軽微な指摘あり → 指摘対応後Phase 2へ進行
- **MAJOR**: 重大な問題あり → Phase 1へ戻る

#### 完了条件

- [ ] 全レビュー観点で問題なし、またはMINOR指摘のみ
- [ ] MINOR指摘があれば対応完了

---

## Phase 2: テスト作成 (TDD: Red)

### T-02-1: 同期ユーティリティテスト作成

#### 目的

profileSync.tsの同期関数に対するテストを作成。

#### Claude Code スラッシュコマンド

```
/ai:generate-unit-tests apps/desktop/src/main/infrastructure/profileSync.ts
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/unit-tester.md`
- **選定理由**: ユニットテスト作成の専門家、TDDサイクルに精通
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                        | 活用方法                     |
| ----------------------------------------------- | ---------------------------- |
| .claude/skills/test-doubles/SKILL.md            | Supabaseクライアントのモック |
| .claude/skills/tdd-principles/SKILL.md          | Red-Green-Refactorサイクル   |
| .claude/skills/boundary-value-analysis/SKILL.md | 成功/失敗の境界テスト        |

- **参照**: `.claude/skills/skill_list.md`

#### テストケース

```typescript
describe("profileSync", () => {
  describe("syncProfileToMetadata", () => {
    it("display_nameを正しく同期する");
    it("avatar_urlを正しく同期する");
    it("部分更新（display_nameのみ）が動作する");
    it("Supabase Auth APIエラー時にエラーを返す");
  });

  describe("syncMetadataToProfile", () => {
    it("avatar_urlをuser_profilesに同期する");
    it("avatar_url=nullで削除同期する");
    it("DB更新エラー時にエラーを返す");
    it("ユーザーが存在しない場合のエラー処理");
  });

  describe("ensureProfileConsistency", () => {
    it("不整合を検出して修正する");
    it("整合している場合は何もしない");
  });
});
```

#### TDD検証: Red状態確認

```bash
pnpm --filter @repo/desktop test:run profileSync
```

- [ ] テストが失敗することを確認（Red状態）

#### 完了条件

- [ ] syncProfileToMetadataのテスト作成
- [ ] syncMetadataToProfileのテスト作成
- [ ] ensureProfileConsistencyのテスト作成
- [ ] テスト実行時にRed（失敗）状態を確認

---

### T-02-2: profile:update同期テスト作成

#### 目的

profile:update時にuser_profilesとuser_metadataの両方が更新されることを検証。

#### 使用エージェント

- **エージェント**: `.claude/agents/unit-tester.md`
- **参照**: `.claude/agents/agent_list.md`

#### テストケース

```typescript
describe("profile:update 同期テスト", () => {
  it("displayName更新時にuser_metadataも同期される");
  it("avatarUrl更新時にuser_metadataも同期される");
  it("user_metadata同期失敗時はエラーを返す");
  it("user_profiles更新成功後のuser_metadata同期失敗時の振る舞い");
});
```

#### TDD検証: Red状態確認

```bash
pnpm --filter @repo/desktop test:run profileHandlers
```

- [ ] テストが失敗することを確認（Red状態）

#### 完了条件

- [ ] 同期テスト作成
- [ ] エラーケーステスト作成
- [ ] Red状態確認

---

### T-02-3: avatar操作同期テスト作成

#### 目的

avatar:upload/use-provider/remove時にuser_profiles.avatar_urlも更新されることを検証。

#### テストケース

```typescript
describe("avatar操作 同期テスト", () => {
  describe("avatar:upload", () => {
    it("user_metadataとuser_profiles.avatar_urlの両方が更新される");
    it("user_profiles同期失敗時の振る舞い");
  });

  describe("avatar:use-provider", () => {
    it("user_metadataとuser_profiles.avatar_urlの両方が更新される");
  });

  describe("avatar:remove", () => {
    it("user_metadataとuser_profiles.avatar_urlの両方がnullに更新される");
  });
});
```

#### 完了条件

- [ ] avatar:uploadテスト作成
- [ ] avatar:use-providerテスト作成
- [ ] avatar:removeテスト作成
- [ ] Red状態確認

---

### T-02-4: profile:delete テスト作成

#### 目的

アカウント削除機能のテストを作成。

#### テストケース

```typescript
describe("profile:delete", () => {
  it("正しいメールアドレスで削除が実行される");
  it("メールアドレス不一致で拒否される");
  it("認証されていない場合はエラー");
  it("user_profiles → Storage → Auth の順序で削除される");
  it("途中で失敗した場合の振る舞い");
});
```

#### 完了条件

- [ ] 正常系テスト作成
- [ ] 異常系テスト作成
- [ ] 削除順序検証テスト作成
- [ ] Red状態確認

---

## Phase 3: 実装 (TDD: Green)

### T-03-1: 同期ユーティリティ実装

#### 目的

profileSync.tsを実装し、T-02-1のテストをパスさせる。

#### Claude Code スラッシュコマンド

```
/ai:implement-business-logic profile-sync
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/logic-dev.md`
- **選定理由**: ビジネスロジック実装の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 成果物

| 成果物             | パス                                                  | 内容           |
| ------------------ | ----------------------------------------------------- | -------------- |
| 同期ユーティリティ | `apps/desktop/src/main/infrastructure/profileSync.ts` | 双方向同期関数 |

#### TDD検証: Green状態確認

```bash
pnpm --filter @repo/desktop test:run profileSync
```

- [ ] 全テストが成功することを確認（Green状態）

#### 完了条件

- [ ] syncProfileToMetadata実装
- [ ] syncMetadataToProfile実装
- [ ] ensureProfileConsistency実装
- [ ] エラーハンドリング実装
- [ ] テストがGreen

---

### T-03-2: profileHandlers.ts修正

#### 目的

profile:updateでuser_metadataも同期するよう修正。

#### 修正箇所

```
apps/desktop/src/main/ipc/profileHandlers.ts:256-328
```

#### 修正内容

```typescript
// profile:update ハンドラー内
// 1. user_profiles 更新（既存）
// 2. user_metadata 同期（追加）
const syncResult = await syncProfileToMetadata(supabase, {
  display_name: updates.displayName,
  avatar_url: updates.avatarUrl,
});
if (!syncResult.success) {
  console.warn("[ProfileHandlers] user_metadata同期失敗:", syncResult.error);
  // 警告ログのみ、処理は続行（user_profilesが正）
}
// 3. ローカルキャッシュ更新
```

#### TDD検証: Green状態確認

```bash
pnpm --filter @repo/desktop test:run profileHandlers
```

- [ ] profile:update同期テストが成功（Green状態）

#### 完了条件

- [ ] user_metadata同期追加
- [ ] エラーハンドリング（警告ログ）
- [ ] ローカルキャッシュ更新確認
- [ ] テストがGreen

---

### T-03-3: avatarHandlers.ts修正

#### 目的

avatar操作時にuser_profiles.avatar_urlも同期するよう修正。

#### 修正箇所

```
apps/desktop/src/main/ipc/avatarHandlers.ts:162-178 (avatar:upload)
apps/desktop/src/main/ipc/avatarHandlers.ts:266-282 (avatar:use-provider)
apps/desktop/src/main/ipc/avatarHandlers.ts:354-359 (avatar:remove)
```

#### 修正内容

```typescript
// 各ハンドラー内で user_metadata 更新後に追加
await syncMetadataToProfile(supabase, userId, { avatar_url: avatarUrl });
```

#### TDD検証: Green状態確認

```bash
pnpm --filter @repo/desktop test:run avatarHandlers
```

- [ ] avatar同期テストが成功（Green状態）

#### 完了条件

- [ ] avatar:uploadでuser_profiles同期
- [ ] avatar:use-providerでuser_profiles同期
- [ ] avatar:removeでuser_profiles同期（null設定）
- [ ] テストがGreen

---

### T-03-4: profile:delete ハンドラー実装

#### 目的

アカウント削除機能のIPCハンドラーを実装。

#### 使用エージェント

- **エージェント**: `.claude/agents/logic-dev.md`
- **参照**: `.claude/agents/agent_list.md`

#### 実装内容

```typescript
// profileHandlers.ts に追加

ipcMain.handle(
  IPC_CHANNELS.PROFILE_DELETE,
  withValidation(
    IPC_CHANNELS.PROFILE_DELETE,
    async (
      _event,
      { confirmEmail }: { confirmEmail: string },
    ): Promise<IPCResponse<void>> => {
      // 1. 認証確認
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: {
            code: "profile/delete-failed",
            message: "Not authenticated",
          },
        };
      }

      // 2. メールアドレス確認
      if (user.email !== confirmEmail) {
        return {
          success: false,
          error: {
            code: "profile/delete-confirm-mismatch",
            message: "Email mismatch",
          },
        };
      }

      // 3. user_profiles 削除
      await supabase.from("user_profiles").delete().eq("id", user.id);

      // 4. Storage削除（アップロード済みアバター）
      // ... 既存のアバター削除ロジック流用

      // 5. Auth削除（サインアウト + 削除）
      await supabase.auth.signOut();
      // Note: Supabase Admin APIでのユーザー削除はサーバーサイドで必要
      // クライアントサイドではsignOutのみ実行

      return { success: true };
    },
    { getAllowedWindows: () => [mainWindow] },
  ),
);
```

#### TDD検証: Green状態確認

```bash
pnpm --filter @repo/desktop test:run profileHandlers
```

- [ ] profile:deleteテストが成功（Green状態）

#### 完了条件

- [ ] IPCチャネル追加
- [ ] 削除ハンドラー実装
- [ ] 確認メールチェック実装
- [ ] 削除順序（DB → Storage → Auth）実装
- [ ] テストがGreen

---

### T-03-5: AccountSection UI修正

#### 目的

削除機能のUIをAccountSectionに追加。

#### Claude Code スラッシュコマンド

```
/ai:create-component DeleteAccountSection molecule
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/ui-designer.md`
- **選定理由**: UIコンポーネント設計の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                      | 活用方法             |
| --------------------------------------------- | -------------------- |
| .claude/skills/accessibility-wcag/SKILL.md    | アクセシビリティ対応 |
| .claude/skills/tailwind-css-patterns/SKILL.md | スタイリング         |

- **参照**: `.claude/skills/skill_list.md`

#### 実装内容

- 「危険な操作」セクション追加
- 削除ボタン（赤色、警告アイコン）
- 削除確認ダイアログ
- メールアドレス入力による確認
- ローディング状態・エラー表示

#### 完了条件

- [ ] 削除ボタンUI実装
- [ ] 確認ダイアログ実装
- [ ] メール確認入力フィールド実装
- [ ] ローディング・エラー状態実装
- [ ] authSliceにdeleteAccount thunk追加

---

### T-03-6: authSlice 修正

#### 目的

削除機能のRedux Thunkを追加。

#### 実装内容

```typescript
// authSlice.ts に追加

export const deleteAccount = createAsyncThunk(
  'auth/deleteAccount',
  async (confirmEmail: string, { rejectWithValue }) => {
    const result = await window.electronAPI.profile.delete({ confirmEmail });
    if (!result.success) {
      return rejectWithValue(result.error);
    }
    return result;
  }
);

// reducerに追加
.addCase(deleteAccount.pending, (state) => {
  state.deleteLoading = true;
  state.deleteError = null;
})
.addCase(deleteAccount.fulfilled, (state) => {
  // ログアウト状態にリセット
  return initialState;
})
.addCase(deleteAccount.rejected, (state, action) => {
  state.deleteLoading = false;
  state.deleteError = action.payload as AuthError;
})
```

#### 完了条件

- [ ] deleteAccount thunk実装
- [ ] 状態管理（loading, error）追加
- [ ] preload/types.tsに型追加

---

## Phase 4: リファクタリング (TDD: Refactor)

### T-04-1: コード品質改善

#### Claude Code スラッシュコマンド

```
/ai:refactor apps/desktop/src/main/ipc/profileHandlers.ts
/ai:refactor apps/desktop/src/main/ipc/avatarHandlers.ts
/ai:refactor apps/desktop/src/main/infrastructure/profileSync.ts
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/code-quality.md`
- **参照**: `.claude/agents/agent_list.md`

#### TDD検証: 継続Green確認

```bash
pnpm --filter @repo/desktop test:run
```

- [ ] リファクタリング後もテストが成功

#### 完了条件

- [ ] 重複コード排除
- [ ] エラーハンドリング統一
- [ ] 型定義の整理
- [ ] テストが継続Green

---

## Phase 5: 品質保証

### T-05-1: 回帰テスト実行

#### Claude Code スラッシュコマンド

```
/ai:run-all-tests --coverage
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 完了条件

- [ ] 既存テストがすべて成功
- [ ] 新規テストがすべて成功
- [ ] カバレッジ低下なし

---

## 品質ゲートチェックリスト

### 機能検証

- [ ] 全ユニットテスト成功
- [ ] profile:update同期テスト成功
- [ ] avatar操作同期テスト成功
- [ ] profile:delete テスト成功

### コード品質

- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] コードフォーマット適用済み

### テスト網羅性

- [ ] カバレッジ基準達成

### セキュリティ

- [ ] 削除操作に確認ダイアログあり
- [ ] メールアドレス確認による誤操作防止

---

## Phase 5.5: 最終レビューゲート

### T-05R: 最終レビュー

#### レビュー参加エージェント

| エージェント                   | レビュー観点       | 選定理由                   |
| ------------------------------ | ------------------ | -------------------------- |
| .claude/agents/code-quality.md | コード品質         | コーディング規約、可読性   |
| .claude/agents/arch-police.md  | アーキテクチャ遵守 | レイヤー違反、依存関係     |
| .claude/agents/unit-tester.md  | テスト品質         | カバレッジ、テスト設計     |
| .claude/agents/sec-auditor.md  | セキュリティ       | 入力検証、削除操作の安全性 |
| .claude/agents/ui-designer.md  | UI品質             | アクセシビリティ、UX       |

- **参照**: `.claude/agents/agent_list.md`

#### レビューチェックリスト

**コード品質** (.claude/agents/code-quality.md)

- [ ] コーディング規約への準拠
- [ ] 可読性・保守性の確保
- [ ] 適切なエラーハンドリング

**アーキテクチャ遵守** (.claude/agents/arch-police.md)

- [ ] 同期ユーティリティがinfrastructureレイヤーに適切配置
- [ ] レイヤー間の依存関係が適切

**テスト品質** (.claude/agents/unit-tester.md)

- [ ] テストカバレッジが十分
- [ ] 境界値・異常系のテストがある

**セキュリティ** (.claude/agents/sec-auditor.md)

- [ ] 削除確認が適切に実装
- [ ] エラーメッセージに機密情報なし

**UI品質** (.claude/agents/ui-designer.md)

- [ ] アクセシビリティ基準準拠
- [ ] エラー状態・ローディング状態表示

#### 完了条件

- [ ] 全レビュー観点で問題なし、またはMINOR指摘のみ
- [ ] MINOR指摘があれば対応完了

---

## Phase 6: ドキュメント更新

### T-06-1: システムドキュメント更新

#### Claude Code スラッシュコマンド

```
/ai:update-all-docs
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 更新対象

- `docs/00-requirements/08-api-design.md` - profile:delete エンドポイント追加
- 必要に応じて他のドキュメント

#### 完了条件

- [ ] 必要なドキュメントが更新されている
- [ ] タスク完了報告作成

---

## リスクと対策

| リスク                 | 影響度 | 発生確率 | 対策                   | 対応サブタスク |
| ---------------------- | ------ | -------- | ---------------------- | -------------- |
| 部分的な同期失敗       | 高     | 中       | 警告ログ + Primary優先 | T-03-1         |
| 既存機能のデグレード   | 高     | 低       | 回帰テストの徹底       | T-05-1         |
| キャッシュの不整合     | 中     | 中       | キャッシュ無効化戦略   | T-03-2, T-03-3 |
| 削除操作の誤実行       | 高     | 低       | メールアドレス確認     | T-03-4, T-03-5 |
| Supabase Admin API制限 | 中     | 中       | サインアウトのみで対応 | T-03-4         |

---

## 前提条件

- Supabase認証が動作していること
- 既存のプロフィール・アバター機能がビルドできること
- desktopパッケージのテスト環境が動作すること

---

## 備考

### 技術的制約

- Supabase Admin API（ユーザー完全削除）はサーバーサイドでのみ利用可能
- クライアントサイドではsignOutのみ実行し、完全削除は後続タスクで対応
- Turso（ローカルDB）への移行はスコープ外

### 参考資料

- [Supabase Auth - updateUser](https://supabase.com/docs/reference/javascript/auth-updateuser)
- [Supabase Database - Update](https://supabase.com/docs/reference/javascript/update)
- [Supabase Auth - signOut](https://supabase.com/docs/reference/javascript/auth-signout)

### 関連ファイル

- `apps/desktop/src/main/ipc/profileHandlers.ts` - 修正対象
- `apps/desktop/src/main/ipc/avatarHandlers.ts` - 修正対象
- `apps/desktop/src/main/infrastructure/profileCache.ts` - キャッシュ実装
- `apps/desktop/src/main/infrastructure/supabaseClient.ts` - Supabaseクライアント
- `apps/desktop/src/renderer/components/organisms/AccountSection/` - UI修正対象
- `apps/desktop/src/renderer/store/slices/authSlice.ts` - Redux修正対象
