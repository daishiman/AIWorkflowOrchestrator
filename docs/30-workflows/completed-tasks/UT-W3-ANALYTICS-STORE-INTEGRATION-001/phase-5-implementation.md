# Phase 5: 実装（TDD Green フェーズ）

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | UT-W3-ANALYTICS-STORE-INTEGRATION-001          |
| フェーズ | Phase 5                                        |
| 機能名   | renderer analytics slice / SkillAnalytics 連携 |
| 作成日   | 2026-04-13                                     |
| 担当     | 実装担当者                                     |

---

## 目的

TDD Green フェーズとして、Phase 4 で作成したテストをすべて通す（Green にする）実装を行う。

実装対象は以下の2ファイルである:

- `packages/shared/src/types/skill-analytics.ts`（型定義）
- `apps/desktop/src/renderer/store/slices/analyticsSlice.ts`（Zustand slice 本体）

実装完了後、`.claude` 正本の更新と mirror 同期を行い、`artifacts.json` の Phase 5 ステータスを `completed` に更新する。

---

## 重要注意事項

- 実装計画には「新規作成」「修正」ファイルパス一覧を**必ず**記載すること
- Phase 4 のテストを変更せずに Green にすること（テスト改ざん禁止）
- `trackEvent` の公開 API シグネチャを変更しないこと（AC-3）
- `analyticsSlice` から `analyticsAdapter` への依存方向は一方向を維持すること
- middleware パターンは使わず、action-first で直接送信すること
- `any` 型の使用を避け、厳密な型定義を維持すること

---

## 変更ファイル一覧（必須記載）

| ファイル                                                   | 変更種別       | 変更内容                                                                                                                       |
| ---------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `apps/desktop/src/renderer/store/slices/analyticsSlice.ts` | 新規           | renderer-side analyticsSlice Zustand slice 本体（`trackSkillStart` / `trackSkillComplete` / `trackSkillError` アクション実装） |
| `packages/shared/src/types/skill-analytics.ts`             | 新規または修正 | `SkillAnalyticsEvent` 型定義（`start` / `complete` / `error` ドメイン型を含む）                                                |
| `packages/shared/src/types/index.ts`                       | 新規または修正 | `SkillAnalyticsEvent` の barrel export（必要時）                                                                               |
| `packages/shared/index.ts`                                 | 新規または修正 | `SkillAnalyticsEvent` の package export（必要時）                                                                              |

---

## 実行タスク

### T-05-1: 変更ファイル一覧の最終確認

実装開始前に、変更対象ファイルの現状を確認する。

確認項目:

- `packages/shared/src/types/skill-analytics.ts` の存在確認（既存ファイルに追記）
- `apps/desktop/src/renderer/store/slices/analyticsSlice.ts` の存在確認（新規のはず）
- 既存の `trackEvent` 実装箇所の特定（シグネチャ確認、非変更）
- Phase 4 のテストファイルが存在し、Red であることを再確認

```bash
# 既存ファイルの確認
ls packages/shared/src/types/
ls apps/desktop/src/renderer/store/slices/

# trackEvent の現在のシグネチャを確認
grep -r "trackEvent" apps/desktop/src/renderer/ --include="*.ts" -l
```

---

### T-05-2: `packages/shared/src/types/skill-analytics.ts` の型定義作成

`SkillAnalyticsEvent` 型を定義する。

**実装仕様**:

```typescript
// SkillAnalyticsEvent の型定義
type SkillAnalyticsEventType = "start" | "complete" | "error";

interface SkillAnalyticsEvent {
  type: SkillAnalyticsEventType;
  skillId: string;
  timestamp: string;
  duration?: number;
  error?: string;
}
```

確認事項:

- 既存の型定義との名前衝突がないこと
- `export` が正しく行われていること
- `@repo/shared/types` と `@repo/shared` の公開面から再エクスポートされていること（必要な場合）

型定義作成後:

```bash
pnpm --filter @repo/shared build
```

---

### T-05-3: `apps/desktop/src/renderer/store/slices/analyticsSlice.ts` の実装

Zustand `create()` を使用して `analyticsSlice` を実装する。

**実装仕様**:

アクション仕様:

| アクション           | 引数                                      | 動作                                                  |
| -------------------- | ----------------------------------------- | ----------------------------------------------------- |
| `trackSkillStart`    | `skillId: string`                         | `analyticsAdapter.send("skill_start", ...)` で記録    |
| `trackSkillComplete` | `skillId: string, duration: number`       | `analyticsAdapter.send("skill_complete", ...)` で記録 |
| `trackSkillError`    | `skillId: string, error: string \| Error` | `analyticsAdapter.send("skill_error", ...)` で記録    |

設計制約:

- `analyticsSlice` → `analyticsAdapter` の依存方向を一方向に維持する
- middleware パターンは使わず、action-first で直接送信する
- Zustand の `create()` を使用し、`useAnalyticsStore` として export する
- 状態（state）は持たず、アクションのみを公開する

---

### T-05-4: テスト実行（Green 確認）

実装後にテストを実行し、全件 Green になることを確認する。

```bash
pnpm --filter @repo/desktop test -- --run apps/desktop/src/renderer/store/slices/__tests__/analyticsSlice.test.ts
pnpm typecheck
```

**期待される結果**:

- 全テストケース（TC-04-01〜TC-04-13）が PASS すること
- `pnpm typecheck` がエラーなく完了すること

Green にならない場合:

1. テストエラーメッセージを確認する
2. 実装を修正する（テストの変更は禁止）
3. 再度 T-05-4 を実行する

---

### T-05-5: `artifacts.json` の Phase 5 ステータスを `completed` に更新

実装と Green 確認が完了したら、タスク管理ファイルを更新する。

更新対象: `docs/30-workflows/UT-W3-ANALYTICS-STORE-INTEGRATION-001/artifacts.json`

```json
{
  "taskId": "UT-W3-ANALYTICS-STORE-INTEGRATION-001",
  "taskName": "skill-analytics-store-integration",
  "featureName": "UT-W3-ANALYTICS-STORE-INTEGRATION-001",
  "createdAt": "2026-04-13T00:00:00Z",
  "status": "spec_created",
  "phases": [
    {
      "phase": 5,
      "name": "実装",
      "status": "completed",
      "completedAt": "<実行日時>",
      "summary": "analyticsSlice.ts で analyticsAdapter へ直接送信し、skill-analytics.ts に SkillAnalyticsEvent を追加した。全13件テスト Green 確認。"
    }
  ]
}
```

---

## Green 確認コマンド

```bash
# analyticsSlice のテスト実行
pnpm --filter @repo/desktop test -- --run apps/desktop/src/renderer/store/slices/__tests__/analyticsSlice.test.ts

# 型チェック
pnpm typecheck
```

---

## 参照資料

| 資料名                   | パス                                                                                     |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| Phase 4 テストファイル   | `apps/desktop/src/renderer/store/slices/__tests__/analyticsSlice.test.ts`                |
| Phase 4 テストマトリクス | `docs/30-workflows/UT-W3-ANALYTICS-STORE-INTEGRATION-001/outputs/phase-4/test-matrix.md` |
| shared 型定義            | `packages/shared/src/types/skill-analytics.ts`                                           |
| analyticsSlice 実装先    | `apps/desktop/src/renderer/store/slices/analyticsSlice.ts`                               |
| Zustand 公式ドキュメント | https://zustand.docs.pmnd.rs/                                                            |

---

## 成果物

| 成果物              | パス                                                                                               | 説明                             |
| ------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------- |
| analyticsSlice 実装 | `apps/desktop/src/renderer/store/slices/analyticsSlice.ts`                                         | Zustand slice 本体               |
| 型定義              | `packages/shared/src/types/skill-analytics.ts`                                                     | `SkillAnalyticsEvent` 型         |
| 公開 export         | `packages/shared/src/types/index.ts`, `packages/shared/index.ts`                                   | 必要時の barrel / package export |
| 実装結果記録        | `docs/30-workflows/UT-W3-ANALYTICS-STORE-INTEGRATION-001/outputs/phase-5/implementation-result.md` | 実装内容のサマリー               |
| Green 確認記録      | `docs/30-workflows/UT-W3-ANALYTICS-STORE-INTEGRATION-001/outputs/phase-5/green-confirmation.md`    | テスト全件 PASS ログ             |

---

## 完了条件

- [ ] T-05-1: 変更ファイル一覧を確認し、既存の `trackEvent` シグネチャを把握した
- [ ] T-05-2: `packages/shared/src/types/skill-analytics.ts` に `SkillAnalyticsEvent` 型が定義された
- [ ] T-05-3: `apps/desktop/src/renderer/store/slices/analyticsSlice.ts` が実装された
- [ ] T-05-4: 全テスト（TC-04-01〜TC-04-13）が Green であることを確認した
- [ ] T-05-4: `pnpm typecheck` がエラーなく完了した
- [ ] T-05-5: `artifacts.json` の Phase 5 ステータスが `completed` に更新された
- [ ] 実装結果記録が `outputs/phase-5/implementation-result.md` に保存された
- [ ] Green 確認記録が `outputs/phase-5/green-confirmation.md` に保存された

---

## 次のフェーズへの移行条件

全ての完了条件を満たした上で、全テストが Green であることを確認した後、Phase 6（テスト拡充）へ進む。
