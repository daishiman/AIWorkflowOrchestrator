# Phase 2: 設計

## メタ情報

| 項目   | 値                       |
| ------ | ------------------------ |
| Phase  | 2                        |
| 機能名 | auth-ui-improvements-282 |
| 作成日 | 2026-02-04               |

## 目的

Phase 1で定義した要件を実現可能な構造に落とし込む。

---

## 実行タスク

### Task 1: z-index階層設計（T-02-1）

#### z-index階層定義

アプリ全体で一貫したz-index階層を設計する:

| z-index値    | 用途                                   | 対象コンポーネント例             |
| ------------ | -------------------------------------- | -------------------------------- |
| z-0          | 通常のコンテンツ                       | メインコンテンツエリア           |
| z-10         | 浮遊要素（カード等）                   | カード、パネル                   |
| z-50         | ドロップダウン・ポップオーバー（既存） | 通常のドロップダウン             |
| z-[100]      | ダイアログ・モーダル（既存）           | 確認ダイアログ                   |
| **z-[9999]** | **ポップアップメニュー・ツールチップ** | **アバター編集メニュー（修正）** |
| z-[10000]    | 緊急通知・トースト                     | エラートースト                   |

#### 変更対象ファイル

| ファイル                                                                  | 変更内容              |
| ------------------------------------------------------------------------- | --------------------- |
| `apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx` | z-50 → z-[9999]に変更 |

#### 変更箇所詳細

変更箇所: 384行目付近

| 変更前                 | 変更後                     |
| ---------------------- | -------------------------- |
| `className="... z-50"` | `className="... z-[9999]"` |

---

### Task 2: フォールバック処理設計（T-02-2）

#### エラー検出ロジック設計

`profileHandlers.ts`のエラー検出条件を設計する:

| 検出条件                                | 判定方法                                   | 追加     |
| --------------------------------------- | ------------------------------------------ | -------- |
| schema cacheエラー                      | `error.message.includes("schema cache")`   | 既存     |
| テーブル不存在エラー                    | `error.message.includes("does not exist")` | 既存     |
| user_profiles関連エラー                 | `error.message.includes("user_profiles")`  | **新規** |
| relation不存在エラー                    | `error.message.includes("relation")`       | **新規** |
| PostgreSQL PGRST200                     | `error.code === "PGRST200"`                | 既存     |
| PostgreSQL PGRST116（行が見つからない） | `error.code === "PGRST116"`                | **新規** |
| PostgreSQL 42P01                        | `error.code === "42P01"`                   | 既存     |

#### フォールバック処理フロー

```
user_profiles取得試行
    ↓
エラー発生?
    ├─ Yes → isUserProfilesTableError(error)?
    │           ├─ Yes → user_metadataにフォールバック
    │           └─ No  → エラーをスロー
    └─ No  → 正常データ返却
```

#### 変更対象ファイル

| ファイル                                       | 変更内容                      |
| ---------------------------------------------- | ----------------------------- |
| `apps/desktop/src/main/ipc/profileHandlers.ts` | エラー検出条件の追加（2箇所） |

#### 変更箇所詳細

変更箇所1: PROFILE_GET（108-120行目付近）
変更箇所2: PROFILE_UPDATE（253-265行目付近）

---

### Task 3: 状態更新フロー設計（T-02-3）

#### 状態更新フロー

`authSlice.ts`の`onAuthStateChanged`リスナー内での修正:

| イベント           | 現在の処理             | 追加処理                       |
| ------------------ | ---------------------- | ------------------------------ |
| AUTH_STATE_CHANGED | fetchProfile()呼び出し | **fetchLinkedProviders()追加** |

#### データフロー図

```
Supabase Auth
    ↓ AUTH_STATE_CHANGED
Main Process
    ↓ IPC: auth:state-changed
Renderer Process (authSlice)
    ↓ onAuthStateChanged
    ├─ fetchProfile()（既存）
    └─ fetchLinkedProviders()（追加）
        ↓ IPC: auth:get-linked-providers
    Main Process
        ↓ Supabase getUserIdentities()
    Renderer Process
        ↓ setLinkedProviders(providers)
    UI更新
```

#### 変更対象ファイル

| ファイル                                              | 変更内容                           |
| ----------------------------------------------------- | ---------------------------------- |
| `apps/desktop/src/renderer/store/slices/authSlice.ts` | fetchLinkedProviders()呼び出し追加 |

#### 変更箇所詳細

変更箇所: 340-343行目付近

| 変更前                  | 変更後                                                     |
| ----------------------- | ---------------------------------------------------------- |
| `get().fetchProfile();` | `get().fetchProfile();`<br>`get().fetchLinkedProviders();` |

---

## 統合テスト連携【必須】

統合ポイントを設計に反映する:

| 統合ポイント      | 契約定義                                                      |
| ----------------- | ------------------------------------------------------------- |
| Renderer→Main IPC | PROFILE_GET, PROFILE_UPDATE, AUTH_GET_LINKED_PROVIDERS        |
| Main→Supabase     | supabase.auth.updateUser(), supabase.auth.getUserIdentities() |
| Main→Renderer     | AUTH_STATE_CHANGED event                                      |

---

## アーキテクチャ層別設計（Electronデスクトップアプリ）

| 層                         | 設計内容                                           | 仕様参照先                 |
| -------------------------- | -------------------------------------------------- | -------------------------- |
| フロントエンド（Renderer） | z-index階層遵守、authSlice状態監視                 | `ui-ux-components.md`      |
| バックエンド（Main）       | isUserProfilesTableError()共通関数、フォールバック | `error-handling.md`        |
| IPC通信                    | 既存チャンネル活用、エラーレスポンス統一           | `interfaces-agent-sdk.md`  |
| 状態管理                   | authSlice拡張（fetchLinkedProviders連動）          | `arch-state-management.md` |

---

## 参照資料

| 資料名        | パス                                                | 説明               |
| ------------- | --------------------------------------------------- | ------------------ |
| Phase 1成果物 | `outputs/phase-1/requirements-definition.md`        | 要件定義書         |
| エラー処理    | `aiworkflow-requirements: error-handling.md`        | エラー処理パターン |
| 状態管理      | `aiworkflow-requirements: arch-state-management.md` | 状態管理パターン   |
| IPC設計       | `aiworkflow-requirements: interfaces-agent-sdk.md`  | IPC契約定義        |

---

## 成果物

| 成果物         | パス                                     | 説明               |
| -------------- | ---------------------------------------- | ------------------ |
| アーキテクチャ | `outputs/phase-2/architecture-design.md` | 本ドキュメント内   |
| 変更計画       | `outputs/phase-2/change-plan.md`         | 変更ファイル・箇所 |

---

## 完了条件

- [ ] z-index階層が定義されている
- [ ] フォールバック処理のエラー検出条件が設計されている
- [ ] 状態更新フローが設計されている
- [ ] 変更対象ファイルと変更箇所が明確である
- [ ] 統合ポイントが設計に反映されている
- [ ] アーキテクチャ層別の設計が完了している
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 3: 設計レビューゲート
