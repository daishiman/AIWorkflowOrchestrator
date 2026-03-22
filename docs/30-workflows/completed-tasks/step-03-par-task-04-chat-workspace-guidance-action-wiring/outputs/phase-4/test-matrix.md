# Phase 4: テストマトリクス - Test Matrix

## メタ情報

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| タスクID | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| Phase    | 4                                                  |
| 作成日   | 2026-03-22                                         |

## 1. テストタイプ分類

### 1.1 契約テスト（unit）

| TC-ID | 対象                           | 検証内容                                                   | 優先度 |
| ----- | ------------------------------ | ---------------------------------------------------------- | ------ |
| CT-01 | BLOCKED_GUIDANCE_MAP           | Record<BlockedReason, GuidanceConfig> が全 reason をカバー | 必須   |
| CT-02 | useBlockedGuidance(null)       | null を返すこと                                            | 必須   |
| CT-03 | useBlockedGuidance("NO_MODEL") | BLOCKED_GUIDANCE_MAP.NO_MODEL と同一の GuidanceConfig      | 必須   |
| CT-04 | createGuidanceActionDispatcher | navigate-settings -> navigateToSettings() が呼ばれること   | 必須   |
| CT-05 | createGuidanceActionDispatcher | open-terminal -> openTerminal() が呼ばれること             | 必須   |
| CT-06 | createGuidanceActionDispatcher | copy-command -> copyCommand() が呼ばれること               | 必須   |
| CT-07 | createGuidanceActionDispatcher | retry-connection -> retryConnection() が呼ばれること       | 必須   |

### 1.2 統合テスト（integration）

| TC-ID | シナリオ                                                | 前提条件                           | 期待結果                           | 優先度 |
| ----- | ------------------------------------------------------- | ---------------------------------- | ---------------------------------- | ------ |
| IS-01 | Provider 未選択 → GuidanceBlock 表示 → CTA → Settings   | blockedReason = NO_PROVIDER        | Settings 画面に遷移                | 必須   |
| IS-02 | Model 選択済み → GuidanceBlock 非表示                   | blockedReason = null               | GuidanceBlock が DOM に存在しない  | 必須   |
| IS-03 | POLICY_VIOLATION → handoff variant 表示                 | blockedReason = POLICY_V..         | variant="handoff" の GuidanceBlock | 必須   |
| IS-04 | reason 動的変化（Provider 選択 → API Key 未設定）       | reason が NO_PROVIDER → NO_API_KEY | メッセージ・CTA が即座に更新       | 推奨   |
| IS-05 | ChatView と WorkspaceChatPanel で同一 reason → 同一表示 | 両 surface で NO_MODEL             | 完全一致のメッセージ・CTA          | 必須   |

### 1.3 回帰テスト（regression）

| TC-ID | 回帰観点                       | 検証方法                                                | 関連    |
| ----- | ------------------------------ | ------------------------------------------------------- | ------- |
| RG-01 | GuidanceBlock 再描画ループなし | renderHook + act で re-render 回数検証                  | P31/P48 |
| RG-02 | Store セレクタ参照安定性       | useBlockedGuidance の返り値が同一参照であることを検証   | P31     |
| RG-03 | no-op CTA なし                 | onAction undefined 時にボタンが DOM に存在しないこと    | AC-4    |
| RG-04 | silent fallback なし           | BLOCKED_GUIDANCE_MAP に unknown reason を渡すと型エラー | P62     |
| RG-05 | CTA ラベル統一                 | CV/WP テストで同一 reason → 同一 label を assert        | AC-1    |

### 1.4 手動テスト（manual）- Phase 11 へ引き継ぎ

| TC-ID | 手動シナリオ                          | 確認ポイント                 |
| ----- | ------------------------------------- | ---------------------------- |
| MT-01 | Provider/Model 未選択状態でアプリ起動 | GuidanceBlock blocked が表示 |
| MT-02 | "設定を見る" クリック                 | Settings 画面に1クリック遷移 |
| MT-03 | Settings で設定後 Chat に戻る         | GuidanceBlock が消える       |
| MT-04 | WorkspaceChatPanel でも同一表示       | surface 間一貫性             |
| MT-05 | POLICY_VIOLATION 時 handoff variant   | terminal launcher 導線       |

## 2. テストファイル配置計画

| テストファイル                                                       | テストタイプ | 対象                          |
| -------------------------------------------------------------------- | ------------ | ----------------------------- |
| `guidance/blockedGuidanceConfig.test.ts`                             | unit         | BLOCKED_GUIDANCE_MAP          |
| `guidance/useBlockedGuidance.test.ts`                                | unit         | useBlockedGuidance Hook       |
| `guidance/guidanceActionDispatcher.test.ts`                          | unit         | action dispatcher             |
| `views/ChatView/__tests__/ChatView.guidance.test.tsx`                | integration  | ChatView + guidance           |
| `views/WorkspaceView/__tests__/WorkspaceChatPanel.guidance.test.tsx` | integration  | WorkspaceChatPanel + guidance |
