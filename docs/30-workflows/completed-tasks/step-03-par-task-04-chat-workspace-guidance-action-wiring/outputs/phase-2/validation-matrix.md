# Phase 2: 検証マトリクス - Validation Matrix

## メタ情報

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| タスクID | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| Phase    | 2                                                  |
| 作成日   | 2026-03-22                                         |

## 1. Reason x Surface 検証マトリクス

### ChatView

| TC-ID | blocked reason   | 期待 variant | 期待 message (prefix)              | 期待 primary CTA  | 期待 secondary CTA | CTA click -> 遷移先 |
| ----- | ---------------- | ------------ | ---------------------------------- | ----------------- | ------------------ | ------------------- |
| CV-01 | NO_PROVIDER      | blocked      | "AI Provider が選択されていません" | "設定を見る"      | "terminal を開く"  | Settings            |
| CV-02 | NO_MODEL         | blocked      | "AI モデルが選択されていません"    | "設定を見る"      | "terminal を開く"  | Settings            |
| CV-03 | NO_API_KEY       | blocked      | "API キーが設定されていません"     | "設定を見る"      | "terminal を開く"  | Settings            |
| CV-04 | AUTH_EXPIRED     | error        | "認証の有効期限が切れています"     | "設定を見る"      | "terminal を開く"  | Settings            |
| CV-05 | NETWORK_ERROR    | error        | "ネットワーク接続に問題があります" | "接続を再確認"    | "terminal を開く"  | Health check        |
| CV-06 | POLICY_VIOLATION | handoff      | "この操作は現在の設定では実行..."  | "terminal を開く" | "command をコピー" | Terminal            |
| CV-07 | null (ready)     | -            | GuidanceBlock 非表示               | -                 | -                  | -                   |

### WorkspaceChatPanel

| TC-ID | blocked reason   | 期待 variant | 期待 message (prefix)              | 期待 primary CTA  | 期待 secondary CTA | CTA click -> 遷移先 |
| ----- | ---------------- | ------------ | ---------------------------------- | ----------------- | ------------------ | ------------------- |
| WP-01 | NO_PROVIDER      | blocked      | "AI Provider が選択されていません" | "設定を見る"      | "terminal を開く"  | Settings            |
| WP-02 | NO_MODEL         | blocked      | "AI モデルが選択されていません"    | "設定を見る"      | "terminal を開く"  | Settings            |
| WP-03 | NO_API_KEY       | blocked      | "API キーが設定されていません"     | "設定を見る"      | "terminal を開く"  | Settings            |
| WP-04 | AUTH_EXPIRED     | error        | "認証の有効期限が切れています"     | "設定を見る"      | "terminal を開く"  | Settings            |
| WP-05 | NETWORK_ERROR    | error        | "ネットワーク接続に問題があります" | "接続を再確認"    | "terminal を開く"  | Health check        |
| WP-06 | POLICY_VIOLATION | handoff      | "この操作は現在の設定では実行..."  | "terminal を開く" | "command をコピー" | Terminal            |
| WP-07 | null (ready)     | -            | GuidanceBlock 非表示               | -                 | -                  | -                   |

## 2. 契約テスト観点

| TC-ID | テストタイプ | 対象                           | 検証内容                                                   |
| ----- | ------------ | ------------------------------ | ---------------------------------------------------------- |
| CT-01 | 型安全       | BLOCKED_GUIDANCE_MAP           | Record<BlockedReason, GuidanceConfig> が全 reason をカバー |
| CT-02 | 型安全       | useBlockedGuidance             | null reason -> null 返却、valid reason -> GuidanceConfig   |
| CT-03 | 契約         | GuidanceBlock props            | variant / message / actionLabel / onAction の型整合        |
| CT-04 | 契約         | createGuidanceActionDispatcher | 全 GuidanceActionType の handler が呼ばれること            |
| CT-05 | 禁止         | ChatView                       | local runtime 判定が存在しないこと（grep 検証）            |
| CT-06 | 禁止         | WorkspaceChatPanel             | local runtime 判定が存在しないこと（grep 検証）            |
| CT-07 | 一貫性       | CV-01 vs WP-01                 | 同一 reason で同一 message/CTA が表示されること            |

## 3. 統合シナリオ

| TC-ID | シナリオ                                                    | 関連 AC | テストタイプ |
| ----- | ----------------------------------------------------------- | ------- | ------------ |
| IS-01 | Provider 未選択 → GuidanceBlock 表示 → CTA click → Settings | AC-1,5  | integration  |
| IS-02 | Model 選択済み → GuidanceBlock 非表示 → 送信可能            | AC-2    | integration  |
| IS-03 | POLICY_VIOLATION → handoff variant → terminal launcher      | AC-1,3  | integration  |
| IS-04 | blocked reason 動的変化（Provider 選択後 → API Key 未設定） | AC-1    | integration  |
| IS-05 | 複数 reason 同時存在時の優先度判定                          | AC-1    | unit         |

## 4. 回帰テスト観点

| TC-ID | 回帰観点                                         | 関連 Pitfall | テストタイプ |
| ----- | ------------------------------------------------ | ------------ | ------------ |
| RG-01 | GuidanceBlock 再描画ループなし                   | P31, P48     | unit         |
| RG-02 | Store セレクタの参照安定性                       | P31          | unit         |
| RG-03 | no-op CTA が存在しないこと                       | AC-4         | unit         |
| RG-04 | silent fallback が発生しないこと                 | P62          | unit         |
| RG-05 | CTA ラベルが BLOCKED_GUIDANCE_MAP と一致すること | AC-1         | unit         |

## 5. 手動テスト観点（Phase 11 用）

| TC-ID | 手動シナリオ                                            | 確認ポイント                               |
| ----- | ------------------------------------------------------- | ------------------------------------------ |
| MT-01 | Provider/Model 未選択状態でアプリ起動                   | GuidanceBlock blocked variant が表示される |
| MT-02 | GuidanceBlock "設定を見る" クリック                     | Settings 画面に1クリックで遷移             |
| MT-03 | Settings で Provider/Model 選択後、Chat に戻る          | GuidanceBlock が消える                     |
| MT-04 | WorkspaceChatPanel でも同一メッセージ・CTA が表示される | surface 間の一貫性                         |
| MT-05 | POLICY_VIOLATION 時に handoff variant が表示される      | terminal launcher 導線                     |

## 6. Phase 3 review への handoff

### review すべき観点

1. **CTA 一貫性**: CV-01〜CV-06 と WP-01〜WP-06 で同一の message/CTA ラベルが出ること
2. **P31/P48 安全性**: useBlockedGuidance が useMemo で参照安定化されていること
3. **no-op 排除**: GuidanceBlock の AND ガード + action dispatcher の全 case カバー
4. **責務境界**: ChatView / WorkspaceChatPanel が blockedReason 以外の runtime 判定を持たないこと
5. **simpler alternative**: inline mapping の不採用理由が妥当か
