# Phase 1: 要件定義 成果物

## P50チェック結果

- `sdkMessageUtils.ts` は存在しない → 新規作成可
- 既存の shared helper と責務重複なし

## 重複ロジックインベントリ

| ロジック                   | SkillExecutor.ts                        | sdkMessageNormalizer.ts                                   | 共通化可否          |
| -------------------------- | --------------------------------------- | --------------------------------------------------------- | ------------------- |
| null/undefined チェック    | `isValidSDKMessage()` L482-487          | L34 `rawMessage == null`                                  | ✅ 共通化可能       |
| typeof object 判定         | `typeof message !== "object"` L483      | `typeof rawMessage !== "object"` L34                      | ✅ 共通化可能       |
| Record 型へのキャスト      | `const msg = message` (SDKMessage 経由) | `rawMessage as Record<string, unknown>` L38               | ✅ 共通化可能       |
| `type` フィールド読取り    | `msg.type === "text"` 等 L913-922       | `typeof msg.type === "string" ? msg.type : undefined` L39 | ✅ helper化可能     |
| lane 固有の分岐・出力変換  | `convertToStreamMessage()` L899-938     | `normalizeSystemMessage()` 等                             | ❌ 共通化しない     |
| `content` / `error` 解釈差 | `SkillStreamMessage` 向け L913-928      | `SkillCreatorSdkEvent` 向け                               | ❌ 出力契約が異なる |

## 型ガード集約先の方針

| 関数/型                   | 現在の定義箇所           | 移動先             | export 方針  |
| ------------------------- | ------------------------ | ------------------ | ------------ |
| `SdkMessageRecord` 型別名 | なし（新規）             | sdkMessageUtils.ts | named export |
| `asSdkMessageRecord()`    | 各モジュールにインライン | sdkMessageUtils.ts | named export |
| `getSdkMessageType()`     | 各モジュールにインライン | sdkMessageUtils.ts | named export |

配置先: `apps/desktop/src/main/services/runtime/sdkMessageUtils.ts`

## 受け入れ基準（確定）

- AC-1: `unknown -> record` 判定と `type` 抽出が `sdkMessageUtils.ts` の1箇所に集約
- AC-2: `sdkMessageNormalizer.test.ts` が全件 PASS
- AC-3: `SkillExecutor.sdk-types.test.ts` が全件 PASS
- AC-4: `pnpm typecheck` が PASS
- AC-5: `pnpm lint` が PASS
- AC-6: 共通ユーティリティに JSDoc が記述されていること
- AC-7: lane 固有の出力型に変更がないこと
