# Phase 4: テストケース一覧

## メタ情報

| 項目       | 値          |
| ---------- | ----------- |
| タスクID   | AUTH-UI-001 |
| Phase      | 4           |
| 作成日     | 2026-02-04  |
| ステータス | 完了        |

---

## テストケースマトリックス

### 1. z-index修正テスト

| ID       | カテゴリ         | テストケース                         | 期待結果                             | 優先度 |
| -------- | ---------------- | ------------------------------------ | ------------------------------------ | ------ |
| TC-Z-001 | 正常系           | アバターメニューがz-[9999]で表示     | メニューにz-[9999]クラスが適用される | 高     |
| TC-Z-002 | 正常系           | メニューがPortal経由でbody直下に描画 | document.body配下にメニューが存在    | 高     |
| TC-Z-003 | 正常系           | 外部クリックでメニュー閉じる         | メニューがDOMから削除される          | 高     |
| TC-Z-004 | 正常系           | Escキーでメニュー閉じる              | メニューがDOMから削除される          | 高     |
| TC-Z-005 | アクセシビリティ | role="menu"属性が存在                | ARIA属性が正しく設定される           | 中     |
| TC-Z-006 | アクセシビリティ | aria-label属性が存在                 | スクリーンリーダー対応               | 中     |

### 2. フォールバック処理テスト

| ID        | カテゴリ   | テストケース                                   | 期待結果                             | 優先度 |
| --------- | ---------- | ---------------------------------------------- | ------------------------------------ | ------ |
| TC-FB-001 | 正常系     | user_profilesテーブル存在時は通常取得          | user_profilesからデータ取得          | 高     |
| TC-FB-002 | 正常系     | user_profilesテーブル不在時はuser_metadata参照 | user_metadataからデータ取得          | 高     |
| TC-FB-003 | 正常系     | フォールバック時にconsole.warn出力             | 警告ログが出力される                 | 中     |
| TC-FB-004 | 正常系     | user_metadata更新成功                          | display_nameが正しく更新される       | 高     |
| TC-FB-005 | 異常系     | 想定外エラーはスローされる                     | エラーがUIに伝播する                 | 高     |
| TC-FB-006 | エラー検出 | "schema cache"パターン検出                     | isUserProfilesTableErrorがtrueを返す | 高     |
| TC-FB-007 | エラー検出 | "does not exist"パターン検出                   | isUserProfilesTableErrorがtrueを返す | 高     |
| TC-FB-008 | エラー検出 | PGRST200コード検出                             | isUserProfilesTableErrorがtrueを返す | 高     |
| TC-FB-009 | エラー検出 | PGRST116コード検出                             | isUserProfilesTableErrorがtrueを返す | 高     |
| TC-FB-010 | エラー検出 | 42P01コード検出                                | isUserProfilesTableErrorがtrueを返す | 高     |
| TC-FB-011 | エラー検出 | 42703コード検出                                | isUserProfilesTableErrorがtrueを返す | 高     |

### 3. 状態更新フローテスト

| ID        | カテゴリ   | テストケース                                   | 期待結果                             | 優先度 |
| --------- | ---------- | ---------------------------------------------- | ------------------------------------ | ------ |
| TC-UI-001 | 正常系     | AUTH_STATE_CHANGED後fetchLinkedProviders呼出   | IPC: profile:get-providersが呼ばれる | 高     |
| TC-UI-002 | 正常系     | AUTH_STATE_CHANGED後fetchProfile呼出           | IPC: profile:getが呼ばれる           | 高     |
| TC-UI-003 | 正常系     | linkedProviders状態が正しく更新される          | 連携プロバイダーリストが更新される   | 高     |
| TC-UI-004 | 正常系     | 連携解除後、UIが即座に更新される               | プロバイダーが「未連携」表示に変わる | 高     |
| TC-UI-005 | 異常系     | fetchLinkedProviders失敗時のエラーハンドリング | エラー状態が設定される               | 中     |
| TC-UI-006 | タイミング | 3秒以内にUI更新完了                            | 3秒以内にlinkedProvidersが更新される | 中     |

---

## 統合テストケース

| ID         | カテゴリ     | テストケース                        | 期待結果                       | 優先度 |
| ---------- | ------------ | ----------------------------------- | ------------------------------ | ------ |
| TC-INT-001 | IPC          | PROFILE_GET IPCが正常動作           | プロフィールデータが取得できる | 高     |
| TC-INT-002 | IPC          | PROFILE_UPDATE IPCが正常動作        | プロフィールデータが更新できる | 高     |
| TC-INT-003 | IPC          | AUTH_STATE_CHANGEDが正しく伝播      | Rendererでイベントを受信できる | 高     |
| TC-INT-004 | データフロー | Supabase→Main→Renderer→UIの経路確認 | データが正しく流れる           | 高     |

---

## 受け入れ基準とテストケースの対応

| 受け入れ基準 | 対応テストケース              |
| ------------ | ----------------------------- |
| AC-Z-001     | TC-Z-001, TC-Z-002            |
| AC-Z-002     | TC-Z-001, TC-Z-002            |
| AC-Z-003     | TC-Z-001（z-[100]との比較）   |
| AC-Z-004     | TC-Z-003                      |
| AC-Z-005     | TC-Z-004                      |
| AC-FB-001    | TC-FB-002, TC-FB-004          |
| AC-FB-002    | TC-FB-002, TC-FB-004          |
| AC-FB-003    | TC-FB-003                     |
| AC-FB-004    | TC-FB-002（リロード後の確認） |
| AC-FB-005    | TC-FB-005                     |
| AC-UI-001    | TC-UI-006                     |
| AC-UI-002    | TC-UI-003, TC-UI-004          |
| AC-UI-003    | TC-UI-001, TC-UI-002          |
| AC-UI-004    | TC-UI-003（リロード後の確認） |
| AC-UI-005    | TC-UI-005                     |

---

## テスト実行コマンド

```bash
# 全テスト実行
pnpm --filter @repo/desktop test

# 特定ファイルのテスト
pnpm --filter @repo/desktop test AccountSection.portal.test
pnpm --filter @repo/desktop test profileHandlers.test
pnpm --filter @repo/desktop test authSlice.test

# カバレッジ付き実行
pnpm --filter @repo/desktop test --coverage
```

---

## 結論

合計 **27件** のテストケースを特定しました：

- z-index関連: 6件
- フォールバック関連: 11件
- 状態更新関連: 6件
- 統合テスト: 4件

既存テストがこれらのケースの大部分をカバーしていることを確認済みです。
