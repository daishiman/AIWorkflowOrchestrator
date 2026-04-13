# Phase 4: テスト作成（TDD Red フェーズ）

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | UT-W3-ANALYTICS-STORE-INTEGRATION-001          |
| フェーズ | Phase 4                                        |
| 機能名   | renderer analytics slice / SkillAnalytics 連携 |
| 作成日   | 2026-04-13                                     |
| 担当     | 実装担当者                                     |

---

## 目的

TDD Red フェーズとして、実装前にテストを先に作成し、テストが失敗（Red）することを確認する。

テストを先に書くことで、`analyticsSlice`（Zustand slice）の公開 API 設計を明確にし、受入基準（AC-1〜AC-4）との整合性を事前に担保する。

---

## 重要注意事項

- Phase 1-3 で確認した命名規則との整合性を必ず確認すること
  - ストア名: `useAnalyticsStore` / `analyticsSlice`
  - アクション名: `trackSkillStart` / `trackSkillComplete` / `trackSkillError`
  - イベント型名: `SkillAnalyticsEvent`（`packages/shared/src/types/skill-analytics.ts` 参照）
- private method のテストは不要。action は pure helper と `analyticsAdapter.send` のモックで検証する
- `trackEvent` の公開 API シグネチャを変更しないこと（AC-3）
- モック設定: `vi.mock` を使用して `analyticsAdapter` をスタブ化すること

---

## 実行タスク

### T-04-1: 依存関係整合確認

依存関係が正しくインストールされていること、および shared パッケージがビルド済みであることを確認する。

```bash
# 依存関係のインストール
pnpm install

# shared パッケージのビルド
pnpm --filter @repo/shared build
```

確認事項:

- `pnpm install` がエラーなく完了すること
- `@repo/shared` のビルド成果物が `packages/shared/dist/` に存在すること
- `SkillAnalyticsEvent` 型が shared パッケージからインポート可能であること

---

### T-04-2: `analyticsSlice.test.ts` の作成（テストケース設計）

以下のパスにテストファイルを作成する。

**ファイルパス**: `apps/desktop/src/renderer/store/slices/__tests__/analyticsSlice.test.ts`

#### テストケース設計

以下の5つのテストグループを実装すること。

**グループ 1: `trackSkillStart` の基本動作**

| テストID | テスト内容                                                                       | 期待結果                        |
| -------- | -------------------------------------------------------------------------------- | ------------------------------- |
| TC-04-01 | `trackSkillStart(skillId)` 呼び出しで `analyticsAdapter.send` が呼び出されること | `send` が1回呼び出される        |
| TC-04-02 | `trackSkillStart` の引数 `skillId` が送信 payload に含まれること                 | payload に `skillId` が存在する |
| TC-04-03 | イベント名が `skill_start` であること                                            | `eventName === "skill_start"`   |

**グループ 2: `trackSkillComplete` の基本動作**

| テストID | テスト内容                                                                                    | 期待結果                         |
| -------- | --------------------------------------------------------------------------------------------- | -------------------------------- |
| TC-04-04 | `trackSkillComplete(skillId, duration)` 呼び出しで `analyticsAdapter.send` が呼び出されること | `send` が1回呼び出される         |
| TC-04-05 | `duration` が送信 payload に含まれること                                                      | payload に `duration` が存在する |
| TC-04-06 | イベント名が `skill_complete` であること                                                      | `eventName === "skill_complete"` |

**グループ 3: `trackSkillError` の基本動作**

| テストID | テスト内容                                                                              | 期待結果                      |
| -------- | --------------------------------------------------------------------------------------- | ----------------------------- |
| TC-04-07 | `trackSkillError(skillId, error)` 呼び出しで `analyticsAdapter.send` が呼び出されること | `send` が1回呼び出される      |
| TC-04-08 | `error` 情報が送信 payload に含まれること                                               | payload に `error` が存在する |
| TC-04-09 | イベント名が `skill_error` であること                                                   | `eventName === "skill_error"` |

**グループ 4: `trackEvent` 公開 API シグネチャの回帰確認**

| テストID | テスト内容                                        | 期待結果                    |
| -------- | ------------------------------------------------- | --------------------------- |
| TC-04-10 | `trackEvent` が既存のシグネチャを維持していること | 型エラーが発生しない        |
| TC-04-11 | `trackEvent` の引数型が変更されていないこと       | TypeScript コンパイルが通る |

**グループ 5: 並列スキル実行（エッジケース）**

| テストID | テスト内容                                                                                | 期待結果                                 |
| -------- | ----------------------------------------------------------------------------------------- | ---------------------------------------- |
| TC-04-12 | 複数の `trackSkillStart` が同時に呼ばれた場合でもそれぞれのイベントが正しく送信されること | `send` が呼び出し回数分だけ呼ばれる      |
| TC-04-13 | 異なる `skillId` を持つ2つのスキルが並列実行された場合のイベント分離                      | 各 payload に正しい `skillId` が含まれる |

---

### T-04-3: テスト実行（Red 確認）

実装がまだ存在しない状態でテストを実行し、Red（失敗）であることを確認する。

```bash
pnpm --filter @repo/desktop test -- --run apps/desktop/src/renderer/store/slices/__tests__/analyticsSlice.test.ts
```

**期待される結果**: テストが失敗（Red）すること。

失敗の原因として以下が想定される:

- `analyticsSlice.ts` が存在しない
- `SkillAnalyticsEvent` 型が `packages/shared/src/types/skill-analytics.ts` に存在しない
- `trackSkillStart` / `trackSkillComplete` / `trackSkillError` が未実装
- `analyticsAdapter.send` がモックされていない

---

### T-04-4: テストマトリクス作成

Red 確認後、テストの網羅状況をマトリクスとして記録する。

出力先: `docs/30-workflows/UT-W3-ANALYTICS-STORE-INTEGRATION-001/outputs/phase-4/test-matrix.md`

記録内容:

- テストID（TC-04-01〜TC-04-13）
- 受入基準との対応（AC-1〜AC-4）
- テスト結果（Red / Green / Skip）
- 失敗原因（Red の場合）

---

### T-04-5: Red 確認記録

テスト実行結果（エラーメッセージ、スタックトレース）を記録する。

出力先: `docs/30-workflows/UT-W3-ANALYTICS-STORE-INTEGRATION-001/outputs/phase-4/red-confirmation.md`

記録内容:

- 実行日時
- 実行コマンド
- テスト結果サマリー（何件失敗したか）
- 各テストの失敗メッセージ（抜粋）

---

## Red 確認コマンド

```bash
pnpm --filter @repo/desktop test -- --run apps/desktop/src/renderer/store/slices/__tests__/analyticsSlice.test.ts
```

---

## 参照資料

| 資料名                     | パス                                                                        |
| -------------------------- | --------------------------------------------------------------------------- |
| タスク全体仕様             | `docs/30-workflows/UT-W3-ANALYTICS-STORE-INTEGRATION-001/`                  |
| Phase 3 設計書             | `docs/30-workflows/UT-W3-ANALYTICS-STORE-INTEGRATION-001/phase-3-design.md` |
| shared 型定義              | `packages/shared/src/types/skill-analytics.ts`                              |
| analyticsSlice 実装予定先  | `apps/desktop/src/renderer/store/slices/analyticsSlice.ts`                  |
| 既存 analyticsAdapter 実装 | `apps/desktop/src/renderer/utils/analyticsAdapter.ts`                       |
| 既存 trackEvent 実装       | `apps/desktop/src/renderer/utils/trackEvent.ts`                             |

---

## 成果物

| 成果物           | パス                                                                                          | 説明                           |
| ---------------- | --------------------------------------------------------------------------------------------- | ------------------------------ |
| テストファイル   | `apps/desktop/src/renderer/store/slices/__tests__/analyticsSlice.test.ts`                     | TDD Red フェーズ用テストコード |
| テストマトリクス | `docs/30-workflows/UT-W3-ANALYTICS-STORE-INTEGRATION-001/outputs/phase-4/test-matrix.md`      | テストケース網羅確認表         |
| Red 確認記録     | `docs/30-workflows/UT-W3-ANALYTICS-STORE-INTEGRATION-001/outputs/phase-4/red-confirmation.md` | テスト失敗ログ                 |

---

## 完了条件

- [ ] T-04-1: `pnpm install` と `@repo/shared` ビルドが成功している
- [ ] T-04-2: `analyticsSlice.test.ts` が作成され、全13件のテストケースが含まれている
- [ ] T-04-3: テストが Red（失敗）であることが確認できた
- [ ] T-04-4: テストマトリクスが `outputs/phase-4/test-matrix.md` に記録されている
- [ ] T-04-5: Red 確認記録が `outputs/phase-4/red-confirmation.md` に保存されている

---

## 次のフェーズへの移行条件

全ての完了条件を満たした上で、テストが Red であることを確認した後、Phase 5（実装）へ進む。
