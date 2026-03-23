# Phase 4: テストマトリクス

## メタ情報

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| タスクID | TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001 |
| Phase    | 4                                                     |
| 作成日   | 2026-03-23                                            |
| 前提     | Phase 2 validation-matrix.md（V-07〜V-11）            |

## 1. テスト観点サマリー

設計タスクであるため、テスト対象は「将来の実装コード」ではなく「設計契約の検証可能性」を定義する。
各 V-ID は Phase 2 validation-matrix.md に対応する。

| V-ID | 検証観点                       | テストタイプ | 優先度 | 自動化可否 |
| ---- | ------------------------------ | ------------ | ------ | ---------- |
| V-07 | 状態遷移の正当性               | unit         | P0     | 可         |
| V-08 | 禁止遷移の拒否                 | unit         | P0     | 可         |
| V-09 | ModifierResponse 後方互換      | contract     | P1     | 可         |
| V-10 | SlideCapabilityDTO の IPC 整合 | integration  | P1     | 条件付き可 |
| V-11 | ManualBoundary 制約            | unit         | P0     | 可         |

## 2. V-07: 状態遷移の正当性（unit）

### 検証対象

SlideUIStatus の遷移関数（実装時は `slideStatusReducer` 相当）

### テストケース一覧

| TC-ID   | 入力状態 | アクション        | 期待出力状態 | 正常/異常            |
| ------- | -------- | ----------------- | ------------ | -------------------- |
| V07-T01 | synced   | startSync         | running      | 正常                 |
| V07-T02 | running  | completeSync      | synced       | 正常                 |
| V07-T03 | running  | reportDegradation | degraded     | 正常                 |
| V07-T04 | running  | requestGuidance   | guidance     | 正常（注）           |
| V07-T05 | degraded | requestGuidance   | guidance     | 正常                 |
| V07-T06 | degraded | resolveManually   | synced       | 正常                 |
| V07-T07 | guidance | resolveManually   | synced       | 正常                 |
| V07-T08 | guidance | retryFromGuidance | running      | 正常                 |
| V07-T09 | guidance | openTerminal      | guidance     | 正常（状態変化なし） |

注: running → guidance は running → degraded → guidance の短絡遷移として扱う実装も許容するが、設計書 contract-matrix.md の遷移表に従い一方向のみとする。

### 想定テストファイルパス

```
apps/desktop/src/main/services/__tests__/slide-status-reducer.unit.test.ts
```

### アサーション例

```typescript
// V07-T01
expect(reduce(SlideUIStatus.synced, { type: "startSync" })).toBe(
  SlideUIStatus.running,
);

// V07-T09（openTerminal は状態変化なし）
expect(reduce(SlideUIStatus.guidance, { type: "openTerminal" })).toBe(
  SlideUIStatus.guidance,
);
```

## 3. V-08: 禁止遷移の拒否（unit）

### 検証対象

不正遷移4パターン（contract-matrix.md § 1 「不正遷移（禁止パターン）」準拠）

### テストケース一覧

| TC-ID   | 入力状態 | 試行遷移          | 期待動作                         |
| ------- | -------- | ----------------- | -------------------------------- |
| V08-T01 | synced   | reportDegradation | throw / 状態変化なし             |
| V08-T02 | synced   | requestGuidance   | throw / 状態変化なし             |
| V08-T03 | guidance | reportDegradation | throw / 状態変化なし             |
| V08-T04 | degraded | startSync         | throw / 状態変化なし（P62 対策） |

### エラーコード規約

禁止遷移時は以下のコード形式でエラーを返す（実装時に統一）:

```typescript
{ code: "INVALID_TRANSITION", from: SlideUIStatus, to: SlideUIStatus }
```

### 想定テストファイルパス

```
apps/desktop/src/main/services/__tests__/slide-status-reducer.unit.test.ts
```

（V-07 と同一ファイルに `describe("forbidden transitions")` で分割）

### 重要注記

V08-T04（degraded → running）は P62（DEFAULT_CONFIG への暗黙 fallback 禁止）と同じ考え方。
degraded 状態からの自動再実行は silent retry に相当するため、実装コードでも `if (status === "degraded") throw` を必須とする。

## 4. V-09: ModifierResponse 後方互換（contract）

### 検証対象

ModifierResponse の既存 consumer が `fallback_reason` / `suggested_action` なしでも正常動作すること

### 対象 consumer ファイル（将来の実装調査対象）

| ファイル                  | 参照箇所         | 後方互換リスク |
| ------------------------- | ---------------- | -------------- |
| modifier-skill.ts         | Response 生成元  | なし（生成側） |
| SlideWorkspace.tsx        | Response 消費元  | あり           |
| slideSettingsStore.ts     | Store 経由消費   | あり           |
| slideSyncResultHandler.ts | IPC handler 経由 | あり（想定）   |

### テストケース一覧

| TC-ID   | シナリオ                                        | 期待動作                                  |
| ------- | ----------------------------------------------- | ----------------------------------------- |
| V09-T01 | fallback_reason なしの ModifierResponse を渡す  | consumer がエラーなく処理完了             |
| V09-T02 | suggested_action なしの ModifierResponse を渡す | consumer がエラーなく処理完了             |
| V09-T03 | 両フィールドなしの ModifierResponse（既存形式） | 既存動作と完全一致                        |
| V09-T04 | fallback_reason あり + suggested_action あり    | consumer が新フィールドを正常に読み取れる |
| V09-T05 | fallback_reason が空文字列                      | consumer が空文字列を graceful に処理     |

### 想定テストファイルパス

```
apps/desktop/src/main/services/__tests__/modifier-response-contract.contract.test.ts
```

### アサーション方針

- optional フィールドのデフォルト値は `undefined`（`null` ではない）
- `?.` チェーンで安全にアクセスできることをアサート

## 5. V-10: SlideCapabilityDTO の IPC 整合（integration）

### 検証対象

MN-01 対応: SlideCapabilityDTO が Main → Preload → Renderer の3層を通じて正しく伝搬すること

### IPC Channel 設計（MN-01 解決）

| Channel 名                 | 方向            | ペイロード         |
| -------------------------- | --------------- | ------------------ |
| `slide:capability:get`     | Renderer → Main | なし               |
| `slide:capability:changed` | Main → Renderer | SlideCapabilityDTO |

注: channel 名の確定は Phase 5 implementation-plan.md で行う（MN-01 の完了条件）。
ここでは「IPC channel が必要である」という設計意図を記録する。

### テストケース一覧

| TC-ID   | シナリオ                                       | 検証レイヤー | 期待動作                                        |
| ------- | ---------------------------------------------- | ------------ | ----------------------------------------------- |
| V10-T01 | integrated lane 時の capability 取得           | integration  | lane="integrated" が返る                        |
| V10-T02 | manual lane 時の capability 取得               | integration  | lane="manual" が返る                            |
| V10-T03 | safeStorage 利用時の apiKeySource              | integration  | apiKeySource="safeStorage" が返る               |
| V10-T04 | env fallback 時の apiKeySource                 | integration  | apiKeySource="env" が返る、警告ログが出力される |
| V10-T05 | API key なし時の apiKeySource                  | integration  | apiKeySource="none"、blockedReason が設定       |
| V10-T06 | degraded 状態の blockedReason                  | integration  | blockedReason が非 null                         |
| V10-T07 | uiStatus が全4状態を網羅してシリアライズされる | integration  | DTO が contextBridge を通過できる               |

### 想定テストファイルパス

```
apps/desktop/src/__tests__/slide-capability-ipc.integration.test.ts
```

### 注意事項（P40 対策）

integration テストは `apps/desktop/` ディレクトリから実行する必要がある:

```bash
cd apps/desktop && pnpm vitest run src/__tests__/slide-capability-ipc.integration.test.ts
```

## 6. V-11: ManualBoundary 制約（unit）

### 検証対象

禁止アクション3種（auto-send / hidden injection / silent retry）が manual lane で実行されないこと

### テストケース一覧

| TC-ID   | 禁止アクション    | 検証対象                   | 期待動作                               |
| ------- | ----------------- | -------------------------- | -------------------------------------- |
| V11-T01 | auto-send         | skill-executor.ts の分岐   | manual lane では自動送信関数を呼ばない |
| V11-T02 | hidden injection  | modifier-skill.ts の入力系 | ユーザー非認知の挿入操作を行わない     |
| V11-T03 | silent retry      | slide sync ループ処理      | degraded 後の自動リトライなし          |
| V11-T04 | lane 判定の一貫性 | skill-executor.ts          | integrated/manual が混在しない         |

### 想定テストファイルパス

```
apps/desktop/src/main/services/__tests__/manual-boundary.unit.test.ts
```

### モック方針

- `skill-executor.ts` の `isIntegratedLane()` をスパイして呼び出し有無を検証
- `modifier-skill.ts` の入力加工関数は渡した入力がそのまま返ることをアサート

## 7. テスト作成フロー（設計タスクのため参考）

設計タスクである本タスクでは、実際のテストコードは UT-SLIDE-IMPL-001 / UT-SLIDE-UI-001 で作成する。
本 Phase 4 成果物は「テスト契約の定義」として機能し、後続実装タスクの Phase 4 入力となる。

```
本タスク Phase 4（テストマトリクス定義）
  └→ UT-SLIDE-IMPL-001 Phase 4（テストコード実装）
       └→ UT-SLIDE-UI-001 Phase 4（UI テストコード実装）
```

## 8. テストタイプ別ファイルマップ（全体観）

| テストタイプ | ファイルパス（想定）                                                                   | 対応 V-ID  |
| ------------ | -------------------------------------------------------------------------------------- | ---------- |
| unit         | `apps/desktop/src/main/services/__tests__/slide-status-reducer.unit.test.ts`           | V-07, V-08 |
| unit         | `apps/desktop/src/main/services/__tests__/manual-boundary.unit.test.ts`                | V-11       |
| contract     | `apps/desktop/src/main/services/__tests__/modifier-response-contract.contract.test.ts` | V-09       |
| integration  | `apps/desktop/src/__tests__/slide-capability-ipc.integration.test.ts`                  | V-10       |
| e2e/manual   | Phase 11 手動テスト仕様書（UX-07 screenshot 契約）                                     | V-12〜V-15 |
