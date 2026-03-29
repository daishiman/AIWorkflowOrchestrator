# Phase 2: 設計 成果物

## sdkMessageUtils.ts API 設計

### 公開インターフェース

```typescript
// apps/desktop/src/main/services/runtime/sdkMessageUtils.ts

/** SDK 生メッセージ候補を表す最小 record。lane 固有 shape はここに閉じ込めない。 */
export type SdkMessageRecord = Record<string, unknown>;

/**
 * unknown を SDK メッセージ候補 record に正規化する。
 * null / undefined / 非オブジェクト / 配列は除外する。
 *
 * @param message - 検証対象の値（型は unknown）
 * @returns plain object なら SdkMessageRecord、それ以外は null
 */
export function asSdkMessageRecord(message: unknown): SdkMessageRecord | null;

/**
 * SDK メッセージ候補 record から type フィールドを安全に取り出す。
 * type が string でない場合は undefined を返す。
 *
 * @param message - SdkMessageRecord（asSdkMessageRecord の戻り値）
 * @returns type フィールドの値、または undefined
 */
export function getSdkMessageType(
  message: SdkMessageRecord,
): string | undefined;
```

## Target Topology

```
sdkMessageUtils.ts (新規)
  ├── SdkMessageRecord (type alias)
  ├── asSdkMessageRecord()
  └── getSdkMessageType()
       ↑                    ↑
       │                    │
SkillExecutor.ts     sdkMessageNormalizer.ts
(import & 利用)      (import & 利用)
```

## Concern テーブル

| concern                   | 対象ファイル                | 変更内容                                                               | lane |
| ------------------------- | --------------------------- | ---------------------------------------------------------------------- | ---- |
| 共通ユーティリティ作成    | `sdkMessageUtils.ts` (新規) | `asSdkMessageRecord` / `getSdkMessageType` の定義                      | A    |
| SkillExecutor 更新        | `SkillExecutor.ts`          | ローカル `SDKMessage` / `isValidSDKMessage` を削除し helper 利用へ置換 | A    |
| sdkMessageNormalizer 更新 | `sdkMessageNormalizer.ts`   | インライン前処理と type 読取りを shared helper に置換                  | A    |

Lane 数: 1（全 concern が直列依存）

## Validation Matrix

| 変更                         | 検証コマンド                                                                                                    | 期待結果      |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------- |
| sdkMessageUtils.ts 作成      | `pnpm typecheck`                                                                                                | PASS          |
| SkillExecutor.ts 更新        | `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillExecutor.sdk-types.test.ts` | 全テスト PASS |
| sdkMessageNormalizer.ts 更新 | `pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/__tests__/sdkMessageNormalizer.test.ts`  | 全テスト PASS |
| 全体検証                     | `pnpm typecheck && pnpm lint`                                                                                   | PASS          |
