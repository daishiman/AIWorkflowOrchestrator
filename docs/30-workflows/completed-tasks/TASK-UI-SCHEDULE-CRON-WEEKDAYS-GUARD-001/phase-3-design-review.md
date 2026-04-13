# Phase 3: 設計レビューゲート

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 3                                        |
| 機能名 | TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001 |
| 作成日 | 2026-04-12                               |

## 目的

Phase 2 で確定した「空文字退避」の設計が、仕様・テスト・JSDoc の三層で一貫しているかをレビューし、
PASS / MINOR / MAJOR を判定して Phase 4 への進行可否を決定する。

---

## 実行タスク

- **タスク1**: 空文字退避方針が仕様・設計・実装計画で一致しているか確認する
- **タスク2**: 既存テストへの影響が最小であるか確認する
- **タスク3**: JSDoc 記載範囲の妥当性を確認する
- **タスク4**: より単純な代替案を検討し、不採用理由を記録する
- **タスク5**: PASS/MINOR/MAJOR 判定と Phase 4 開始条件を確定する

---

## 参照資料

| 資料名                     | パス                                               | 説明                |
| -------------------------- | -------------------------------------------------- | ------------------- |
| Phase 2 設計決定記録       | `outputs/phase-2/design-decision.md`               | レビュー対象設計    |
| Phase 2 コード差分イメージ | `outputs/phase-2/code-diff-preview.md`             | 変更前/後の差分確認 |
| Phase 1 受入基準           | `outputs/phase-1/acceptance-criteria.md`           | AC-1〜AC-5 との照合 |
| cronConverter 実装         | `apps/desktop/src/renderer/utils/cronConverter.ts` | 現状コード確認      |

---

## レビュー観点

### ステップ1: 方針一貫性チェック

```bash
# cronConverter.ts の現状確認（設計と乖離がないか）
grep -n "visualConfigToCron\|weekdays\|return \"\"\|weekdays.length === 0" \
  apps/desktop/src/renderer/utils/cronConverter.ts

# 既存テストの構造確認
grep -n "describe\|it(\|weekdays" \
  apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts
```

**チェック項目**:

- [ ] 空曜日時に空文字 `""` を返す契約が、仕様書・設計・テスト・JSDoc で統一されていること
- [ ] `outputs/phase-2/design-decision.md` に採用方針と不採用案が理由付きで記録されていること
- [ ] `visualConfigToCron` 以外の関数に責務が拡散していないこと

### ステップ2: 既存テストへの影響チェック

```bash
# 既存テスト全件の確認
pnpm --filter @repo/desktop exec vitest run \
  src/__tests__/utils/cronConverter.edge.test.ts --reporter=verbose 2>&1 | tail -30
```

**チェック項目**:

- [ ] 既存テストケースが「削除」または「変更」されていないこと（追加のみ）
- [ ] 既存の正常ケース（`weekdays` に値あり）は引き続き PASS であること
- [ ] `frequency: "daily"` / `"every-hour"` / `"monthly"` の各ケースに影響がないこと

### ステップ3: JSDoc 記載範囲チェック

| 記載項目                  | 必須 / 推奨  | チェック |
| ------------------------- | ------------ | -------- |
| ガード処理の発動条件      | 必須（AC-5） | TBD      |
| `@returns` での空文字明示 | 必須（AC-5） | TBD      |
| `@remarks` での補足説明   | 必須（AC-5） | TBD      |
| 呼び出し元への推奨事項    | 推奨         | TBD      |

**MINOR 候補**: JSDoc の記載が最小限に留まり、呼び出し元への推奨が欠けている場合。

### ステップ4: simpler alternative の検討

より単純な代替案を検討し、採用しない理由を記録する:

| 代替案                                              | 検討結果                                                                |
| --------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------- |
| 呼び出し元（UI コンポーネント）でのみバリデーション | 否定: 責務分散が発生し、`visualConfigToCron` が不正入力を受け付け続ける |
| `weekdays` の型を `[number, ...number[]]` に変更    | 否定: 既存の型定義を破壊する。スコープ外のリファクタリングが必要        |
| `weekdays` が空のとき null を返す                   | 否定: 戻り値型変更（`string                                             | null`）が必要で影響が大きい |
| 日曜（0）を補完する                                 | 否定: 意図しないスケジュールを作る                                      |

---

## PASS/MINOR/MAJOR 判定基準

| 判定  | 条件                                                                 |
| ----- | -------------------------------------------------------------------- |
| PASS  | 全チェック項目が通過。Phase 4 へ進める                               |
| MINOR | 軽微な指摘あり（JSDoc の補足範囲等）。Phase 5 で解決。Phase 4 継続可 |
| MAJOR | 設計の根本的問題（方針不一貫・既存テスト破壊等）。Phase 2 へ戻る     |

### チェックリスト（判定用）

**方針一貫性**:

- [ ] 空文字退避方針が設計・実装計画・テスト計画で統一されていること
- [ ] 仕様書・実装・テストで `""` の扱いが矛盾していないこと

**既存テストへの影響**:

- [ ] 既存テストが追加のみ（削除・変更なし）であること
- [ ] 他 frequency（`daily`, `every-hour`, `monthly`）への影響がないこと

**JSDoc（AC-5 対応）**:

- [ ] ガード処理仕様が JSDoc に記載される設計となっていること
- [ ] `@returns` と `@remarks` が設計に含まれていること

**スコープ**:

- [ ] IPC 関連の変更が不要であることが確認されていること
- [ ] 変更対象が `cronConverter.ts` と `cronConverter.edge.test.ts` の2ファイルのみであること

---

## MINOR 追跡テーブル

Phase 3 で MINOR 判定された指摘を追跡する（指摘がある場合のみ記入）:

| MINOR ID  | 指摘内容                 | 解決予定 Phase | 解決確認 Phase | 備考             |
| --------- | ------------------------ | -------------- | -------------- | ---------------- |
| TECH-M-01 | JSDoc の記載範囲が最小限 | Phase 5        | Phase 9/10     | 機能に影響しない |
| TECH-M-02 | （指摘がある場合に記入） | -              | -              | -                |

---

## 統合テスト連携

- `visualConfigToCron` は純粋関数のため、IPC 統合テスト不要
- 設計レビューの結果（PASS/MINOR/MAJOR）を `outputs/phase-3/design-review-result.md` に記録
- Phase 4 テスト作成へのゲート判定を明示

---

## サブタスク管理

| ID     | タスク名                            | ステータス |
| ------ | ----------------------------------- | ---------- |
| T-03-1 | 方針一貫性チェック                  | 未実施     |
| T-03-2 | 既存テストへの影響チェック          | 未実施     |
| T-03-3 | JSDoc 記載範囲の妥当性チェック      | 未実施     |
| T-03-4 | simpler alternative の検討          | 未実施     |
| T-03-5 | PASS/MINOR/MAJOR 判定と開始条件確定 | 未実施     |

---

## 成果物

| 成果物             | 配置先                                    | 形式     |
| ------------------ | ----------------------------------------- | -------- |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md` | Markdown |
| MINOR 追跡テーブル | `outputs/phase-3/minor-tracking.md`       | Markdown |

---

## 完了条件

- [ ] 空文字退避方針が一貫して設計されていることが確認済みであること
- [ ] 既存テストへの影響が最小（追加のみ）であることが確認済みであること
- [ ] JSDoc の記載範囲チェックが完了していること
- [ ] simpler alternative の検討が記録されていること
- [ ] レビュー判定（PASS/MINOR/MAJOR）が確定していること
- [ ] Phase 4 開始条件が明示されていること
- [ ] `outputs/phase-3/` に全成果物が生成されていること

---

## タスク100%実行確認【必須】

- [ ] T-03-1: 方針一貫性チェックを実行し `outputs/phase-3/design-review-result.md` に記録済み
- [ ] T-03-2: 既存テストへの影響チェックを記録済み
- [ ] T-03-3: JSDoc 記載範囲チェック結果を記録済み
- [ ] T-03-4: simpler alternative の検討を記録済み
- [ ] T-03-5: PASS/MINOR/MAJOR 判定を明示的に確定済み（「PASS: Phase 4 へ進む」等）
- [ ] MINOR 追跡テーブルを `outputs/phase-3/minor-tracking.md` に記録済み（指摘なしの場合は「なし」と記録）

---

## 次Phase

**Phase 4: テスト作成（Red段階）** — TDD に従い、実装前にテストを先行作成する。
空 `weekdays` ケースのテストを作成し、RED 状態を確認する。

**Phase 4 開始条件**: 本 Phase のレビュー判定が「PASS」または「MINOR のみ」であること。
**Phase 13 blocked 条件**: MAJOR 判定が残存している場合は PR 作成不可。
