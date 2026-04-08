# Phase 4: テスト作成

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 4                                        |
| Phase名    | テスト作成                               |
| 前提Phase  | Phase 3                                  |
| 後続Phase  | Phase 5                                  |
| ステータス | 未実施                                   |
| 作成日     | 2026-04-08                               |
| 機能名     | task-sc-13-verify-channel-implementation |

---

## 目的

TDD の Red フェーズとして、`skill-creator:verify` チャネルのユニットテストと E2E テストケースを
実装が存在しない状態で先に作成する。テストが失敗（Red）することを確認してから Phase 5 へ進む。

**Phase 1 で確認した命名規則との整合チェック**:

- TDD Red 前に、テストパターンが Phase 1-3 で確認した命名規則と整合しているかを確認する
- 既存 `plan/execute/improve` ハンドラのテストパターンと命名規則を踏襲する

---

## 実行タスク

### タスク1: 既存テストパターンの確認

**目的**: Phase 4 テスト作成前に、既存ハンドラテストのパターンを確認する

**実行手順**:

1. `apps/desktop/src/main/ipc/__tests__/` 配下の既存テストファイルを確認する
2. `apps/desktop/src/test/helpers/skill-creator-test-helpers.ts` のヘルパー一覧を確認する
3. `assertIpcError(result, "string")` の定義と使用方法を確認する

```bash
# 既存テストファイルの確認
ls apps/desktop/src/main/ipc/__tests__/

# テストヘルパーの確認
grep -n "export\|assertIpcError\|mockFacade\|validateSender" \
  apps/desktop/src/test/helpers/skill-creator-test-helpers.ts

# 既存の plan ハンドラテストのパターン確認
head -80 apps/desktop/src/main/ipc/__tests__/creatorHandlers.plan.test.ts 2>/dev/null || \
  ls apps/desktop/src/main/ipc/__tests__/
```

**期待される成果物**:

- `outputs/phase-4/test-matrix.md` に既存パターン要約を記載

---

### タスク2: verify ハンドラ UT 作成（TDD Red）

**目的**: `creatorHandlers.verify.test.ts` を作成し、Red 状態（テスト失敗）を確認する

**注意**: private method のテストは `(facade as unknown as FacadePrivate)` キャストまたは
public callback 経由を使う方針（Feedback P0-09-U1-1）。ただし verify は public メソッドなので
直接テスト可能。

**テストケース設計**:

| TC-ID   | テストケース名                            | テストカテゴリ | 期待結果                                                    |
| ------- | ----------------------------------------- | -------------- | ----------------------------------------------------------- |
| TC-V-01 | 正常系: verify 成功                       | 正常系         | `{ success: true, data: VerifyResult }` を返す              |
| TC-V-02 | skillName が空文字の場合                  | バリデーション | `{ success: false, error: "skillName is required" }` を返す |
| TC-V-03 | skillName が null/undefined の場合        | バリデーション | `{ success: false, error: "..." }` を返す                   |
| TC-V-04 | Facade.verify() が例外を投げた場合        | エラー系       | `{ success: false, error: sanitized string }` を返す        |
| TC-V-05 | validateSender が呼ばれていること         | セキュリティ   | `validateSender(event)` が1回呼ばれること                   |
| TC-V-06 | verify レスポンスの error が string 型    | 型チェック     | `typeof result.error === "string"` であること               |
| TC-V-07 | unregister で verify チャネルが解除される | 解除テスト     | `removeHandler(SKILL_CREATOR_VERIFY)` が呼ばれること        |

**テストファイルのスケルトン**:

```typescript
// apps/desktop/src/main/ipc/__tests__/creatorHandlers.verify.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SKILL_CREATOR_VERIFY } from "@repo/shared/ipc/channels";
// ... 必要なインポート

describe("creatorHandlers - verify", () => {
  // TC-V-01: 正常系
  it("should return IpcResult<VerifyResult> on success", async () => {
    // TODO: 実装後に PASS になること
  });

  // TC-V-02: isBlank ガード
  it("should return error when skillName is blank", async () => {
    // TODO: 実装後に PASS になること
  });

  // ... TC-V-03 〜 TC-V-07
});
```

**実行手順**:

1. `creatorHandlers.verify.test.ts` を新規作成する
2. 上記 7 テストケースを全て実装する
3. テストを実行して Red（全件失敗）であることを確認する

```bash
pnpm --filter @repo/desktop test apps/desktop/src/main/ipc/__tests__/creatorHandlers.verify.test.ts
```

**期待される成果物**:

- `apps/desktop/src/main/ipc/__tests__/creatorHandlers.verify.test.ts`（新規作成）
- `outputs/phase-4/red-confirmation.md`（Red 状態の証跡）

---

### タスク3: E2E テストケース追加（TDD Red）

**目的**: `skill-creator-integration.test.ts` に verify シナリオを追加し、Red 状態を確認する

**実行手順**:

1. `apps/desktop/src/test/skill-creator-integration.test.ts` を読み、既存テスト構造を確認する
2. verify テストケースを適切な位置に追加する
3. テストを実行して Red であることを確認する

**追加テストケース設計**:

| TC-ID       | テストケース名             | 期待結果                                       |
| ----------- | -------------------------- | ---------------------------------------------- |
| TC-E2E-V-01 | E2E: verify 正常シナリオ   | `{ success: true, data: VerifyResult }` を返す |
| TC-E2E-V-02 | E2E: verify エラーシナリオ | `{ success: false, error: string }` を返す     |

**実行手順**:

```bash
# E2E テストの Red 確認
pnpm --filter @repo/desktop test apps/desktop/src/test/skill-creator-integration.test.ts
```

**期待される成果物**:

- `apps/desktop/src/test/skill-creator-integration.test.ts`（修正）
- `outputs/phase-4/red-confirmation.md` に E2E Red 状態も記録

---

## TDD検証

### TDD サイクル確認

```bash
# UT テスト（Red 確認）
pnpm --filter @repo/desktop test apps/desktop/src/main/ipc/__tests__/creatorHandlers.verify.test.ts

# E2E テスト（Red 確認）
pnpm --filter @repo/desktop test apps/desktop/src/test/skill-creator-integration.test.ts

# 既存テストへの非影響確認（全件 PASS であること）
pnpm --filter @repo/desktop test apps/desktop/src/main/ipc/__tests__/
```

**確認項目**:

- [ ] `creatorHandlers.verify.test.ts` の全テストが失敗（Red）であること
- [ ] E2E の verify テストケースが失敗（Red）であること
- [ ] **既存 plan/execute/improve テストが全件 PASS であること**（非影響確認）

---

## テストマトリクス

| TC-ID       | テストタイプ | 観点             | 正常/異常      |
| ----------- | ------------ | ---------------- | -------------- |
| TC-V-01     | UT           | 正常系           | 正常           |
| TC-V-02     | UT           | isBlank ガード   | 異常           |
| TC-V-03     | UT           | null ガード      | 異常           |
| TC-V-04     | UT           | 例外ハンドリング | 異常           |
| TC-V-05     | UT           | validateSender   | セキュリティ   |
| TC-V-06     | UT           | error 型確認     | 型チェック     |
| TC-V-07     | UT           | unregister       | ライフサイクル |
| TC-E2E-V-01 | E2E          | 正常シナリオ     | 正常           |
| TC-E2E-V-02 | E2E          | エラーシナリオ   | 異常           |

---

## 参照資料

| 参照資料           | パス                                                                                                                     | 内容                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------------------- |
| Phase 2 設計成果物 | `outputs/phase-2/design-decisions.md`, `outputs/phase-2/type-interface-design.md`, `outputs/phase-2/ipc-flow-diagram.md` | verify 設計と型契約の根拠 |
| テストヘルパー     | `apps/desktop/src/test/helpers/skill-creator-test-helpers.ts`                                                            | モック・アサーション      |
| E2E テストファイル | `apps/desktop/src/test/skill-creator-integration.test.ts`                                                                | 既存 E2E テスト構造       |
| 既存ハンドラテスト | `apps/desktop/src/main/ipc/__tests__/`                                                                                   | plan 等のテストパターン   |

---

## 成果物

| 成果物             | パス                                                                 | 内容                             |
| ------------------ | -------------------------------------------------------------------- | -------------------------------- |
| verify ハンドラ UT | `apps/desktop/src/main/ipc/__tests__/creatorHandlers.verify.test.ts` | 7 テストケース Red 状態          |
| E2E テスト（追記） | `apps/desktop/src/test/skill-creator-integration.test.ts`            | verify シナリオ追加              |
| テストマトリクス   | `outputs/phase-4/test-matrix.md`                                     | TC-V-01〜TC-E2E-V-02             |
| Red 確認証跡       | `outputs/phase-4/red-confirmation.md`                                | 失敗ログ・スクリーンショット代替 |

---

## 統合テスト連携

- 統合テストシナリオ（TC-E2E-V-01/02）を全カテゴリで作成
- `IpcResult<VerifyResult>` の型契約を E2E テストに反映

---

## 完了条件

- [ ] `creatorHandlers.verify.test.ts` が新規作成されていること（7 テストケース）
- [ ] E2E テストに verify シナリオ（TC-E2E-V-01/02）が追加されていること
- [ ] UT テストが Red（全件失敗）であることが確認されていること
- [ ] E2E テストが Red（失敗）であることが確認されていること
- [ ] **既存 plan/execute/improve テストが全件 PASS であることが確認されていること**
- [ ] `outputs/phase-4/` に全成果物が生成されていること

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート PASS）が完了していること
- **後続**: Phase 5 へ進む

---

## 次Phase

**Phase 5: 実装** — TDD Green フェーズとして、4層の実装を行いテストを PASS させる。
