# Phase 6: 回帰拡張計画

## メタ情報

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| タスクID | TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001 |
| Phase    | 6                                                     |
| 作成日   | 2026-03-23                                            |
| 前提     | Phase 4 test-matrix.md、Phase 2 validation-matrix.md  |

## 1. 回帰拡張の目的

Phase 4 で定義したテストケース（V07〜V11）は「正常系・基本異常系」を網羅する。
Phase 6 では以下の観点でテストを拡充する:

1. **edge ケース**: 境界値・型エッジ・競合タイミング
2. **error ケース**: 外部依存のエラー伝搬・タイムアウト
3. **fallback ケース**: P62 対策の fallback 経路を全て追跡

設計タスクであるため、本 Phase 6 は「拡充すべきテスト観点の設計」であり、
実際のテストコードは UT-SLIDE-IMPL-001 Phase 6 で実装する。

## 2. edge 観点の拡充

### 2.1 状態遷移の edge ケース

| TC-ID    | 元 V-ID | edge ケース                                        | 検証観点                                         |
| -------- | ------- | -------------------------------------------------- | ------------------------------------------------ |
| EV07-T01 | V-07    | synced → running → synced（即時完了）              | 実行時間0msでも正常遷移する                      |
| EV07-T02 | V-07    | running → degraded → guidance → synced（フル遷移） | 全状態を経由するフルサイクルが完走する           |
| EV07-T03 | V-07    | guidance → running → synced（retryFromGuidance）   | retry 後の正常完了パスが動作する                 |
| EV07-T04 | V-07    | 同一状態への自己遷移（synced → synced）            | no-op または INVALID_TRANSITION のどちらかを統一 |
| EV08-T01 | V-08    | 不正遷移を連続して試みる（5回連続）                | エラー累積せず、状態が変化しないことを確認       |
| EV08-T02 | V-08    | 不正遷移エラー後の正常遷移                         | エラー後も正常遷移が機能することを確認           |

### 2.2 DTO の edge ケース

| TC-ID    | 元 V-ID | edge ケース                                   | 検証観点                                          |
| -------- | ------- | --------------------------------------------- | ------------------------------------------------- |
| EV09-T01 | V-09    | fallback_reason が null（undefined ではなく） | null と undefined の区別を consumer が正しく扱う  |
| EV09-T02 | V-09    | suggested_action が256文字超                  | 長文字列が UI で正しくトリムまたは表示される      |
| EV10-T01 | V-10    | uiStatus が型定義外の文字列（"unknown" 等）   | Preload 層で型ガードが機能し、Renderer に渡さない |
| EV10-T02 | V-10    | blockedReason が空文字列                      | degraded 状態で blockedReason="" の場合の表示     |
| EV10-T03 | V-10    | SlideCapabilityDTO 全フィールドが undefined   | structured clone 失敗前に型ガードで捕捉する       |

### 2.3 ManualBoundary の edge ケース

| TC-ID    | 元 V-ID | edge ケース                          | 検証観点                                      |
| -------- | ------- | ------------------------------------ | --------------------------------------------- |
| EV11-T01 | V-11    | lane 判定が非同期で返る（Promise）   | lane が確定する前に slide sync が開始しない   |
| EV11-T02 | V-11    | integrated → manual への動的切り替え | 実行中（running）に lane が変わった場合の動作 |
| EV11-T03 | V-11    | manual lane で空入力                 | 空入力でも hidden injection が発生しない      |

## 3. error 観点の拡充

### 3.1 外部依存のエラー伝搬

| TC-ID   | エラー種別                                                  | 発生箇所                 | 期待動作                                               |
| ------- | ----------------------------------------------------------- | ------------------------ | ------------------------------------------------------ |
| ERR-T01 | Anthropic SDK タイムアウト                                  | agent-client.ts          | status が running → degraded に遷移、silent retry なし |
| ERR-T02 | Anthropic SDK レート制限（429）                             | agent-client.ts          | fallback_reason="rate_limited" が設定される            |
| ERR-T03 | keychain アクセス拒否                                       | KeychainService          | apiKeySource="none"、blockedReason が設定される        |
| ERR-T04 | IPC `slide:capability:get` が応答なし（タイムアウト）       | slide-capability handler | Renderer 側でタイムアウトエラーを表示                  |
| ERR-T05 | IPC `slide:capability:changed` の送信先 window が閉じている | Main Process             | エラーをキャッチしてログ出力、クラッシュしない         |
| ERR-T06 | skill-executor.ts の lane 判定中に例外                      | skill-executor.ts        | degraded 状態に遷移、自動再試行しない                  |

### 3.2 エラー伝搬のアサーション方針

```typescript
// ERR-T01: SDK タイムアウトのアサーション
mockAgentClient.runSlideSync.mockRejectedValueOnce(
  new Error("Request timed out after 30000ms"),
);
await skillExecutor.executeSlideSync(payload);
expect(currentStatus).toBe("degraded");
// 重要: タイムアウト後に自動リトライしないことを確認
await new Promise((r) => setTimeout(r, 100));
expect(mockAgentClient.runSlideSync).toHaveBeenCalledTimes(1); // 1回のみ

// ERR-T05: window 閉鎖時のクラッシュ防止
mockMainWindow.webContents.send.mockImplementationOnce(() => {
  throw new Error("Object has been destroyed");
});
// handler の send 呼び出しがエラーをキャッチしていることを確認
await expect(sendCapabilityChanged(dto)).resolves.not.toThrow();
```

### 3.3 env fallback の警告ログ検証

P62 対策の警告ログが確実に出力されることを確認する:

| TC-ID   | fallback パターン                 | 期待ログ                                            |
| ------- | --------------------------------- | --------------------------------------------------- |
| ERR-T07 | safeStorage 失敗 → env fallback   | `logger.warn("apiKeySource:env fallback detected")` |
| ERR-T08 | env も未設定 → none               | `logger.error("No API key available")`              |
| ERR-T09 | safeStorage 成功（fallback なし） | warn ログが出ないこと（false positive 防止）        |

## 4. fallback 観点の拡充

### 4.1 fallback 経路の完全追跡

Phase 2 design-summary.md Concern A で特定した fallback 経路を全てカバーする:

| TC-ID  | fallback 経路                                               | 検証観点                                                  |
| ------ | ----------------------------------------------------------- | --------------------------------------------------------- |
| FB-T01 | safeStorage → env fallback（getApiKey の2段フォールバック） | apiKeySource="env" かつ警告ログが出ること                 |
| FB-T02 | env fallback → none（env も未設定）                         | apiKeySource="none" かつ blockedReason が設定             |
| FB-T03 | integrated lane → manual lane（自動ではなくユーザー操作）   | lane 切り替えはユーザーアクションのみ（auto-switch なし） |
| FB-T04 | degraded → guidance（fallback card CTA クリック）           | requestGuidance アクションが正しく状態遷移する            |
| FB-T05 | guidance → synced（手動復旧）                               | resolveManually アクションが正しく状態遷移する            |

### 4.2 silent fallback の再発検知テスト

P62 対策として、silent fallback が発生しないことを検知するテスト:

```typescript
// 絶対に発生してはいけないパターンの検知
it("should never silently fallback to default config", async () => {
  // API key が取得できない状況を作る
  mockKeychainService.getApiKey.mockResolvedValue(null);
  process.env.ANTHROPIC_API_KEY = undefined;

  await skillExecutor.executeSlideSync(payload);

  // slide sync が実行されていないこと
  expect(mockAgentClient.runSlideSync).not.toHaveBeenCalled();
  // capability DTO に none が設定されていること
  expect(currentCapability.apiKeySource).toBe("none");
  // エラーログが出ていること
  expect(mockLogger.error).toHaveBeenCalled();
});
```

## 5. 回帰テストの実行戦略

### 実行順序

```
Phase 4 テスト（正常系・基本異常系）
  ↓ 全 PASS を確認
Phase 6 テスト（edge / error / fallback）
  ↓ 全 PASS を確認
Phase 7 カバレッジ確認
```

### CI 統合方針

| テストスイート             | 実行タイミング | タイムアウト |
| -------------------------- | -------------- | ------------ |
| unit（Phase 4 + Phase 6）  | PR 毎          | 60秒         |
| contract（Phase 4）        | PR 毎          | 30秒         |
| integration（Phase 4 + 6） | PR 毎          | 120秒        |
| e2e / manual（Phase 11）   | リリース前のみ | 手動         |

## 6. 拡充テスト数の見積もり

| 観点     | Phase 4 基本ケース数 | Phase 6 拡充ケース数 | 合計     |
| -------- | -------------------- | -------------------- | -------- |
| V-07     | 9件                  | 4件（EV07）          | 13件     |
| V-08     | 4件                  | 2件（EV08）          | 6件      |
| V-09     | 5件                  | 2件（EV09）          | 7件      |
| V-10     | 7件                  | 3件（EV10）          | 10件     |
| V-11     | 4件                  | 3件（EV11）          | 7件      |
| error    | -                    | 9件（ERR）           | 9件      |
| fallback | -                    | 5件（FB）            | 5件      |
| **合計** | **29件**             | **28件**             | **57件** |

注: 実際の実装数は UT-SLIDE-IMPL-001 Phase 4-6 で確定する。
本見積もりは Phase 7 カバレッジ目標の基準値として使用する。
