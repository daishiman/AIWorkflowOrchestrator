# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目      | 内容    |
| --------- | ------- |
| Phase     | 2       |
| Phase名   | 設計    |
| カテゴリ  | 設計    |
| 前提Phase | Phase 1 |
| 後続Phase | Phase 3 |

## 目的

Phase 1 で特定した重複ロジックの共通化設計を行い、`sdkMessageUtils.ts` に置く最小 helper のインターフェースと実装方針を確定する。

## 実行タスク

### タスク1: sdkMessageUtils.ts の API 設計

**目的**: 共通ユーティリティの公開インターフェースを設計する

**手順**:

1. Phase 1 の重複ロジックインベントリを参照する
2. 共通化する関数のシグネチャを設計する
3. JSDoc を含む型定義を確定する

**設計成果物（API シグネチャ）**:

```typescript
// apps/desktop/src/main/services/runtime/sdkMessageUtils.ts

/** SDK 生メッセージ候補を表す最小 record。lane 固有 shape はここに閉じ込めない。 */
export type SdkMessageRecord = Record<string, unknown>;

/** unknown を SDK メッセージ候補 record に正規化する。配列・null は除外する。 */
export function asSdkMessageRecord(message: unknown): SdkMessageRecord | null;

/** SDK メッセージ候補 record から type フィールドを安全に取り出す。 */
export function getSdkMessageType(
  message: SdkMessageRecord,
): string | undefined;
```

### タスク2: concern ごとの target topology 設計

**目的**: 変更対象ファイルの依存関係と変更内容を明確化する

**target topology**:

```
sdkMessageUtils.ts (新規)
  ├── asSdkMessageRecord()
  └── getSdkMessageType()
       ↑                    ↑
       │                    │
SkillExecutor.ts     sdkMessageNormalizer.ts
(import & 利用)      (import & 利用)
```

**concern テーブル**:

| concern                   | 対象ファイル                | 変更内容                                                               | lane |
| ------------------------- | --------------------------- | ---------------------------------------------------------------------- | ---- |
| 共通ユーティリティ作成    | `sdkMessageUtils.ts` (新規) | `asSdkMessageRecord` / `getSdkMessageType` の定義                      | A    |
| SkillExecutor 更新        | `SkillExecutor.ts`          | ローカル `SDKMessage` / `isValidSDKMessage` を削除し helper 利用へ置換 | A    |
| sdkMessageNormalizer 更新 | `sdkMessageNormalizer.ts`   | インライン前処理と type 読取りを shared helper に置換                  | A    |

**lane 数: 1**（全 concern が直列依存のため）

### タスク3: validation matrix 設計

**目的**: 各変更に対する検証コマンドを定義する

| 変更                         | 検証コマンド                                                                                                    | 期待結果      |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------- |
| sdkMessageUtils.ts 作成      | `pnpm typecheck`                                                                                                | PASS          |
| SkillExecutor.ts 更新        | `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillExecutor.sdk-types.test.ts` | 全テスト PASS |
| sdkMessageNormalizer.ts 更新 | `pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/__tests__/sdkMessageNormalizer.test.ts`  | 全テスト PASS |
| 全体検証                     | `pnpm typecheck && pnpm lint`                                                                                   | PASS          |

## 参照資料

| 参照資料         | パス                                                                                      | 内容                     |
| ---------------- | ----------------------------------------------------------------------------------------- | ------------------------ |
| Phase 1 成果物   | `outputs/phase-1/requirements.md`                                                         | 重複ロジックインベントリ |
| SDK Executor仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-core.md` | SkillExecutor 型定義     |

## 統合テスト連携

インターフェース不変のリファクタリングのため、新規統合テストは不要。既存テストの回帰確認で網羅可能。

## 成果物

| 成果物 | パス                        |
| ------ | --------------------------- |
| 設計書 | `outputs/phase-2/design.md` |

## 完了条件

- [ ] sdkMessageUtils.ts の最小 helper API が確定していること
- [ ] target topology が図示されていること
- [ ] validation matrix が定義されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] タスク1: sdkMessageUtils.ts の API 設計 → 完了
- [ ] タスク2: concern ごとの target topology 設計 → 完了
- [ ] タスク3: validation matrix 設計 → 完了

## 次Phase

Phase 3（設計レビュー）へ進む。Phase 2 完了まで Phase 3 に着手しないこと。
