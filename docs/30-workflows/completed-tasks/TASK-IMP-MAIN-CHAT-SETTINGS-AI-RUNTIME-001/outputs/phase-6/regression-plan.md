# Phase 6: 回帰テスト計画

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| Phase    | 6                                          |
| 機能名   | Main Chat / Settings runtime 同期          |
| タスクID | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |
| 成果物   | regression-plan.md                         |
| 作成日   | 2026-03-17                                 |

---

## 1. 回帰テスト方針

### 1.1 基本方針

- **変更範囲の特定**: Phase 5 で変更するファイルから影響を受ける既存機能を列挙し、各機能の回帰テストを設計する
- **高リスク箇所の優先**: AI_CHAT 経路・authMode 初期化・LLM Selector など、ユーザーの主要フローに影響する変更を最優先でテストする
- **廃止変更の追跡**: AI_CHECK_CONNECTION 廃止・DEFAULT_CONFIG fallback 廃止など、後方互換性を破る変更については削除の完全性を確認する
- **自動化優先**: P0/P1 テストはすべて自動化し、CI で回帰検出を行う

### 1.2 回帰テスト発動条件

| トリガー           | 実行するテスト                 |
| ------------------ | ------------------------------ |
| Phase 5 実装完了後 | 全回帰テスト（RT-001〜RT-030） |
| PR レビュー前      | P0/P1 の自動テストのみ         |
| CI push            | 自動テスト全件                 |

---

## 2. 影響範囲分析テーブル

| 変更箇所                                      | 影響を受ける機能                                           | リスクレベル |
| --------------------------------------------- | ---------------------------------------------------------- | ------------ |
| AI_CHAT providerId/modelId 必須化             | チャット送信（全メッセージ）                               | 高           |
| AI_CHAT バリデーション追加                    | API key 未設定時のエラー表示、型無効時の送信拒否           | 高           |
| AI_CHECK_CONNECTION 削除                      | Health Check 表示（既存の AI_CHECK_CONNECTION 呼び出し先） | 高           |
| DEFAULT_CONFIG fallback 廃止                  | LLM 設定未選択時の動作                                     | 高           |
| authMode 語彙変更 (ready/blocked/unavailable) | Settings 画面の Access Card 表示、AuthModeSelector         | 中           |
| auth-key:exists source フィールド追加         | AuthKeySection の key 存在確認                             | 中           |
| api-key:set clearInstance() 追加              | Provider 切り替え後の最初の AI リクエスト                  | 中           |
| llm:set-selected-config 同期                  | Provider/Model 選択後の AI_CHAT での使用                   | 中           |
| systemPromptTemplateSlice 更新                | システムプロンプト適用状態の AI_CHAT 送信                  | 中           |
| onModeChanged P5 ガード                       | authMode 切り替え後のリスナー状態                          | 低           |
| ApiKeysSection デバウンス追加                 | API key 入力のバリデーション応答性                         | 低           |
| ragSlice Main authority 昇格                  | RAG 有効/無効の切り替えと状態保持                          | 低           |

---

## 3. 回帰テストケース一覧

| ID     | 対象機能                      | テスト内容                                                                     | 優先度 | 自動/手動 |
| ------ | ----------------------------- | ------------------------------------------------------------------------------ | ------ | --------- |
| RT-001 | チャット送信 基本フロー       | Provider/Model 選択済みの状態でメッセージを送信し、AI応答を受け取る            | P0     | 自動      |
| RT-002 | チャット送信 API key 未設定   | API key 未設定状態でメッセージ送信し AUTH_ERROR を受け取る                     | P0     | 自動      |
| RT-003 | チャット送信 Provider 未選択  | selectedProviderId が null の状態で送信ボタンが disabled であること            | P0     | 自動      |
| RT-004 | チャット送信 streaming        | AI_CHAT streaming が途切れなく動作すること                                     | P0     | 自動      |
| RT-005 | Health Check 表示             | llm:check-health で取得した結果が LLMSelectorPanel に反映される                | P0     | 自動      |
| RT-006 | AI_CHECK_CONNECTION 廃止      | AI_CHECK_CONNECTION を呼び出すコードが残っていないこと                         | P0     | 自動      |
| RT-007 | Provider 選択 → 同期          | Provider を変更すると llm:set-selected-config IPC が呼ばれる                   | P0     | 自動      |
| RT-008 | Model 選択 → 同期             | Model を変更すると llm:set-selected-config IPC が呼ばれる                      | P0     | 自動      |
| RT-009 | authMode 初期化               | アプリ起動時に authMode.get IPC が呼ばれ mode が取得される                     | P0     | 自動      |
| RT-010 | authMode 変更                 | AuthModeSelector で mode 変更後に onModeChanged イベントを受信する             | P0     | 自動      |
| RT-011 | Settings Access Card 表示     | authMode.status の結果に応じて Access Card が ready/missing-key/blocked を表示 | P1     | 自動      |
| RT-012 | API key 設定後の cache クリア | api-key:set 後に LLMAdapterFactory.clearInstance() が呼ばれる                  | P1     | 自動      |
| RT-013 | API key 削除後の cache クリア | api-key:delete 後に LLMAdapterFactory.clearInstance() が呼ばれる               | P1     | 自動      |
| RT-014 | auth-key:exists source 確認   | auth-key:exists のレスポンスに source フィールドが含まれる                     | P1     | 自動      |
| RT-015 | System Prompt 適用            | currentTemplate を設定した状態でのチャット送信に systemPrompt が含まれる       | P1     | 自動      |
| RT-016 | System Prompt 保存            | systemPrompt:save IPC でテンプレートが保存される                               | P1     | 自動      |
| RT-017 | System Prompt 削除            | systemPrompt:delete IPC でテンプレートが削除される                             | P1     | 自動      |
| RT-018 | RAG 状態 Main 同期            | ragSlice の enabled 変更が rag:set-state IPC で Main に送信される              | P1     | 自動      |
| RT-019 | API key validate デバウンス   | ApiKeysSection で連続入力後 300ms 以内は IPC が呼ばれない                      | P1     | 自動      |
| RT-020 | P5: リスナー二重登録なし      | authMode 画面を複数回マウント/アンマウントしてもリスナーが1つのみ              | P1     | 自動      |
| RT-021 | P48: Provider 一覧再レンダー  | Provider 一覧の状態変更で不要な再レンダーが発生しない（useShallow）            | P1     | 自動      |
| RT-022 | チャット送信後の UI復元       | 送信完了後に isStreaming が false に戻り、入力フォームが活性化される           | P1     | 自動      |
| RT-023 | エラー表示 → 再試行           | AI_CHAT エラー後に再試行すると再度送信できる                                   | P1     | 自動      |
| RT-024 | Settings 画面 初期化          | SettingsView マウント時に全 IPC 取得が正常に完了する                           | P1     | 自動      |
| RT-025 | Provider Card 状態連動        | api-key:list の結果に基づいて Provider Card の状態が更新される                 | P1     | 自動      |
| RT-026 | チャット送信 手動確認         | Electron 実機で Provider/Model 選択 → メッセージ送信 → AI応答表示              | P1     | 手動      |
| RT-027 | Settings 画面 手動確認        | Electron 実機で Settings 画面を開き Access Card 状態が正しく表示される         | P1     | 手動      |
| RT-028 | authMode 切り替え 手動確認    | Electron 実機で authMode を変更し、Access Card がリアルタイムで更新される      | P1     | 手動      |
| RT-029 | API key 設定 手動確認         | Electron 実機で API key 設定後、Provider の Health Check が成功する            | P2     | 手動      |
| RT-030 | System Prompt 適用 手動確認   | Electron 実機でテンプレートを選択してチャットし、プロンプトが反映される        | P2     | 手動      |

---

## 4. 既存テストへの影響

### 4.1 修正が必要な既存テストファイル

| テストファイル                                         | 修正理由                                                            | 修正内容                                                    |
| ------------------------------------------------------ | ------------------------------------------------------------------- | ----------------------------------------------------------- |
| `apps/desktop/src/__tests__/aiHandlers.test.ts`        | AI_CHECK_CONNECTION ハンドラのテスト削除が必要                      | AI_CHECK_CONNECTION に関連するテストケースを削除            |
| `apps/desktop/src/__tests__/aiHandlers.test.ts`        | AI_CHAT の providerId/modelId 必須化によりテストの引数変更が必要    | 全テストケースに providerId/modelId を追加                  |
| `apps/desktop/src/__tests__/llm.test.ts`               | handleCheckHealth() の実装変更によりモック設定の変更が必要          | LLMAdapterFactory.getAdapter().checkHealth() のモックを追加 |
| `apps/desktop/src/__tests__/chatSlice.test.ts`         | sendMessage() が providerId/modelId を必須化したことによる引数変更  | テストの引数に providerId/modelId を追加                    |
| `apps/desktop/src/__tests__/llmSlice.test.ts`          | checkHealth() が AI_CHECK_CONNECTION を呼ばないことの確認テスト追加 | AI_CHECK_CONNECTION が呼ばれないアサーションを追加          |
| `apps/desktop/src/__tests__/authModeSlice.test.ts`     | mode 語彙が変更されたため、テストの期待値を更新                     | "valid"/"invalid" → "ready"/"blocked"/"unavailable" に置換  |
| `apps/desktop/src/__tests__/LLMConfigProvider.test.ts` | DEFAULT_CONFIG fallback 廃止のため、fallback を期待するテストを削除 | null を返すケースのテストに変更                             |
| `apps/desktop/src/__tests__/apiKeyHandlers.test.ts`    | api-key:set/delete 後の clearInstance() 呼び出しテストを追加        | clearInstance モックの呼び出し確認アサーションを追加        |
| `apps/desktop/src/__tests__/SettingsView.test.ts`      | Access Capability Card の CSS クラス・aria 属性が変更されるため更新 | variantStyles 定数を export して P47 準拠でテストを書き直す |

### 4.2 削除が必要な既存テストケース

| テストファイル                                         | 削除対象テストケース                             | 削除理由            |
| ------------------------------------------------------ | ------------------------------------------------ | ------------------- |
| `apps/desktop/src/__tests__/aiHandlers.test.ts`        | `"AI_CHECK_CONNECTION は success を返す"` 等     | ハンドラ削除のため  |
| `apps/desktop/src/__tests__/LLMConfigProvider.test.ts` | `"config が未設定時に DEFAULT_CONFIG を返す"` 等 | fallback 廃止のため |
| `apps/desktop/src/__tests__/authModeSlice.test.ts`     | `"mode が 'valid' の場合に..." ` 等              | 語彙変更のため      |

### 4.3 影響なしと判断したファイル

| テストファイル                                            | 影響なしの理由                          |
| --------------------------------------------------------- | --------------------------------------- |
| `apps/desktop/src/__tests__/authKeyHandlers.test.ts`      | exists の追加フィールドは後方互換性あり |
| `apps/desktop/src/__tests__/systemPromptHandlers.test.ts` | IPC 契約変更なし                        |
| `apps/desktop/src/__tests__/SecureStorage.test.ts`        | SecureStorage 自体は変更なし            |

---

## 5. 回帰テスト実行計画

### 5.1 実行コマンド

```bash
# P0/P1 自動テスト（CI 実行）
pnpm --filter @repo/desktop test

# 特定カテゴリのみ実行
pnpm --filter @repo/desktop exec vitest run src/__tests__/aiHandlers.test.ts
pnpm --filter @repo/desktop exec vitest run src/__tests__/chatSlice.test.ts
pnpm --filter @repo/desktop exec vitest run src/__tests__/llmSlice.test.ts

# カバレッジ付き実行
pnpm --filter @repo/desktop exec vitest run --coverage
```

### 5.2 実行順序

```
1. Type Check（全ファイルの型整合性確認）
   pnpm --filter @repo/desktop typecheck

2. Unit Tests（サービス・スライス単体）
   RT-006 → RT-007/008 → RT-009/010 → RT-012/013

3. Integration Tests（IPC End-to-End）
   RT-001 → RT-002/003 → RT-005 → RT-011

4. Component Tests（React UI）
   RT-003 → RT-011 → RT-020/021

5. 手動テスト（Electron 実機）
   RT-026 → RT-027 → RT-028 → RT-029 → RT-030
```

### 5.3 合否判定基準

| 判定  | 条件                                              |
| ----- | ------------------------------------------------- |
| PASS  | 全 P0 テストが GREEN、P1 テストが 95% 以上 GREEN  |
| MINOR | P1 テストで 1-2 件 FAILED（重要機能への影響なし） |
| FAIL  | P0 テストで 1 件以上 FAILED                       |
