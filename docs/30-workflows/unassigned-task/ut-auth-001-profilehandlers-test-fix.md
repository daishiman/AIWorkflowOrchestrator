---
task_id: UT-AUTH-001
task_name: profileHandlers.test.ts IPCハンドラモック環境修正
category: 改善
target_feature: 認証プロフィール管理
priority: 低
scale: 小規模
status: 未実施
source_phase: Phase 5
created_date: 2026-02-04
dependencies: []
issue_number: 703
---

# profileHandlers.test.ts IPCハンドラモック環境修正 - タスク指示書

## メタ情報

| 項目         | 内容                                              |
| ------------ | ------------------------------------------------- |
| タスクID     | UT-AUTH-001                                       |
| タスク名     | profileHandlers.test.ts IPCハンドラモック環境修正 |
| 分類         | テスト環境改善                                    |
| 対象機能     | 認証プロフィール管理                              |
| 優先度       | 低                                                |
| 見積もり規模 | 小規模（2-4時間）                                 |
| ステータス   | 未着手                                            |
| 発見元       | AUTH-UI-001 Phase 5 テスト実行                    |
| 発見日       | 2026-02-04                                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

AUTH-UI-001（認証UIバグ修正）タスクの実行中、Phase 5でテストを実行した際、
`profileHandlers.test.ts`の33テストが全て失敗する現象が発生した。
実装コード自体は正常に動作しているが、テスト環境でIPCハンドラのモック設定が
正しく機能していないことが判明した。

### 1.2 問題点・課題

```
Error: PROFILE_UPDATE handler not registered
Error: PROFILE_GET_PROVIDERS handler not registered
```

上記エラーが示すように、テストセットアップで`ipcMain.handle()`のモックが
正しく登録されておらず、ハンドラが呼び出された際に「未登録」エラーが発生している。

**具体的な問題**:

- テスト内の`beforeEach`/`afterEach`でIPCハンドラの登録/解除が不適切
- Vitestのモジュールモック設定が`ipcMain`に対して正しく適用されていない
- モック関数の呼び出し順序またはタイミングの問題

### 1.3 放置した場合の影響

- `profileHandlers.ts`の33テストが継続的に失敗状態
- CI/CDでのテストカバレッジ計算から除外される
- 将来の`profileHandlers.ts`変更時にリグレッションを検出できない

**注意**: 実装コード（profileHandlers.ts）自体は正常に動作しているため、
プロダクション品質には影響しない。ただし、テスト品質の観点から修正が望ましい。

---

## 2. 何を達成するか（What）

### 2.1 目的

`profileHandlers.test.ts`の33テストが全て正常にパスするよう、
IPCハンドラのモック環境を修正する。

### 2.2 最終ゴール

- 33テスト全件PASS
- `pnpm --filter @repo/desktop test -- profileHandlers`が成功する
- カバレッジレポートに`profileHandlers.ts`が正しく含まれる

### 2.3 スコープ

#### 含むもの

- `profileHandlers.test.ts`のbeforeEach/afterEach修正
- Vitestモジュールモック設定の修正
- IPCハンドラ登録/解除のタイミング調整

#### 含まないもの

- `profileHandlers.ts`の実装変更（正常動作中のため不要）
- 他のIPCハンドラテストファイルの修正
- 新規テストケースの追加

### 2.4 成果物

| 成果物                         | 説明                       |
| ------------------------------ | -------------------------- |
| profileHandlers.test.ts修正    | モック環境を正しく設定     |
| vitest.config.ts調整（必要時） | モジュールモック設定の追加 |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- AUTH-UI-001が完了していること
- Vitestテスト環境の基本理解
- Electron IPC通信パターンの理解

### 3.2 依存タスク

| タスクID    | タスク名       | ステータス |
| ----------- | -------------- | ---------- |
| AUTH-UI-001 | 認証UIバグ修正 | ✅ 完了    |

### 3.3 必要な知識

- Vitest モックパターン（`vi.mock()`, `vi.doMock()`, `vi.spyOn()`）
- Electron ipcMain/ipcRenderer モック手法
- Node.js モジュールシステム（ESM vs CJS）

### 3.4 推奨アプローチ

**パターン1: vi.doMock()動的再読み込みパターン**

```typescript
// beforeEach内で
vi.doMock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
}));
// モジュールを動的再読み込み
const { registerProfileHandlers } = await import("../profileHandlers");
```

**パターン2: vi.mock()ホイスト + resetModules**

```typescript
vi.mock("electron");
beforeEach(() => {
  vi.resetModules();
  // ハンドラを新規登録
});
```

### 3.5 実装課題と解決策（AUTH-UI-001からの学び）

AUTH-UI-001タスクの実行中に発見・解決された課題パターン。本タスクと直接関係はないが、
IPCハンドラやテスト環境に関連する実装で参考になる。

| 課題カテゴリ       | 課題                                                                | 解決策                                                                          | 参照パターン                                                          |
| ------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **テスト環境**     | profileHandlers.test.tsで33テストが全失敗（handler not registered） | vi.doMock()動的再読み込みまたはvi.mock()ホイスト+resetModulesで解決             | patterns.md: vi.doMock動的モジュール再読み込みパターン                |
| **UI z-index**     | AccountSectionのselectがメニューの背後に隠れる                      | React Portal + z-[9999]でbody直下に描画し、CSSスタッキングコンテキストを回避    | architecture-implementation-patterns.md: React Portalパターン         |
| **状態更新**       | OAuthプロバイダー連携後にUIが即時更新されない                       | AUTH_STATE_CHANGEDイベント後にfetchLinkedProviders()を呼び出すフロー追加        | architecture-implementation-patterns.md: 認証状態変更後UI更新パターン |
| **フォールバック** | user_profiles未作成時にプロフィール取得失敗                         | isUserProfilesTableError()で404/PGRST116を検出し、user_metadataにフォールバック | error-handling.md: Supabaseエラーフォールバックパターン               |

**実装のポイント**:

1. **テスト環境の分離**: IPCハンドラテストでは、各テストケースで完全に分離されたモック環境が必要
2. **モジュールキャッシュ**: Vitestはモジュールをキャッシュするため、`vi.resetModules()`で明示的にリセットが必要
3. **ESM互換性**: `vi.doMock()`を使用する場合は`await import()`で動的インポートが必須

---

## 4. 実行手順

### Step 1: 現状分析

1. `profileHandlers.test.ts`の現在のモック設定を確認
2. エラーメッセージから未登録ハンドラを特定
3. `beforeEach`/`afterEach`のタイミングを確認

### Step 2: モック環境修正

1. `vi.doMock()`パターンを適用
2. `ipcMain.handle()`のモック実装を追加
3. ハンドラ登録/解除の順序を調整

### Step 3: 検証

1. 単体で`pnpm --filter @repo/desktop test -- profileHandlers`を実行
2. 33テスト全件PASSを確認
3. 全テスト実行で他のテストに影響がないことを確認

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `profileHandlers.test.ts`の33テストが全件PASS
- [ ] エラー「handler not registered」が解消

### 品質要件

- [ ] 他のテストファイルに影響を与えていない
- [ ] テスト実行時間が大幅に増加していない

### ドキュメント要件

- [ ] 修正内容がコメントで説明されている
- [ ] patterns.mdにモック修正パターンを追記（該当する場合）

---

## 6. 検証方法

### テストコマンド

```bash
# profileHandlersテストのみ実行
pnpm --filter @repo/desktop test -- profileHandlers

# 全テスト実行（影響確認）
pnpm --filter @repo/desktop test
```

### 期待結果

```
 ✓ profileHandlers.test.ts (33 tests)
   ✓ PROFILE_UPDATE handler
   ✓ PROFILE_GET_PROVIDERS handler
   ...
```

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                                |
| -------------------------- | ------ | -------- | ----------------------------------- |
| モック変更が他テストに影響 | 中     | 低       | vi.doMockで分離、全テスト実行で確認 |
| ESModuleモック制約         | 中     | 中       | vi.spyOn代替、実際のエラー条件使用  |
| テスト実行時間の増加       | 低     | 低       | beforeAllでの共通セットアップ検討   |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                  | パス                                                               |
| ----------------------------- | ------------------------------------------------------------------ |
| Vitestモックガイド            | https://vitest.dev/guide/mocking.html                              |
| patterns.md（モックパターン） | `.claude/skills/task-specification-creator/references/patterns.md` |
| profileHandlers実装           | `apps/desktop/src/main/ipc/profileHandlers.ts`                     |

### システム仕様書参照（aiworkflow-requirements）

| 仕様書                                  | 該当セクション               | 参照目的                           |
| --------------------------------------- | ---------------------------- | ---------------------------------- |
| architecture-auth-security.md           | 技術的負債（UT-AUTH-001）    | 本タスクの登録先・関連負債一覧     |
| architecture-implementation-patterns.md | Electronモックパターン       | vi.doMock/vi.spyOnの実装パターン   |
| testing-component-patterns.md           | Vitestベストプラクティス     | モック設定・非同期テストパターン   |
| interfaces-ipc-channels.md              | IPCハンドラ仕様              | profileHandlers IPCチャネル定義    |
| error-handling.md                       | Supabaseエラーフォールバック | isUserProfilesTableError()実装詳細 |

### 関連タスク

| タスクID    | 関係   | 説明                             |
| ----------- | ------ | -------------------------------- |
| AUTH-UI-001 | 発見元 | 認証UIバグ修正タスクで問題を発見 |

---

## 9. 備考

### 発見時の状況

AUTH-UI-001のPhase 5（実装）でテストを実行した際、以下の状況が発生：

- `AccountSection.portal.test.tsx`: 27テスト PASS
- `authSlice.test.ts`: 105テスト PASS
- `profileHandlers.test.ts`: 33テスト FAIL（全件）

実装コード（profileHandlers.ts）のフォールバック処理は正常に動作しており、
手動テスト（Phase 11）でも問題なく機能することを確認済み。

### 既知のパターン参照

patterns.mdに記載の「vi.doMock動的モジュール再読み込みパターン」が
本問題の解決に適用可能。

```
### vi.doMock 動的モジュール再読み込みパターン

- **状況**: テスト対象モジュールがコンストラクタ内で外部依存（electron-store等）を初期化し、各テストで異なるモック設定が必要な場合
- **パターン**: `vi.doMock()`でモジュールモックを設定後、`await import()`でモジュールを動的再読み込み
```
