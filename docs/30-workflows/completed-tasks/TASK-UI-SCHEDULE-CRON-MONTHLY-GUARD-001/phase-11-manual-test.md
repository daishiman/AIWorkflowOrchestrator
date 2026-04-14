# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 11                                      |
| Phase名    | 手動テスト検証                          |
| 前提Phase  | Phase 10（最終レビューゲート PASS）     |
| 後続Phase  | Phase 12                                |
| ステータス | 未実施                                  |
| 作成日     | 2026-04-13                              |
| 機能名     | TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001 |

---

## 目的

単体テストでは検証できないユーザー視点での動作確認を行う。
スケジュール設定 UI で `monthly` 設定時に不正な `dayOfMonth` が入力された際、
適切にバリデーションが機能することを確認する。

---

## Phase 11 手動テスト方針

> このタスクは内部ユーティリティ関数（`cronConverter.ts`）の変更であるため、
> UI に直接影響する視覚的変更はない（NON_VISUAL）。
> MTC-01〜MTC-03 は UI 差分確認ではなく、動作確認の smoke check として任意実施する。
>
> - `manual-test-checklist.md` を必ず作成する
> - `discovered-issues.md` を必ず作成する
> - `screenshot-plan.json` は生成しない
> - primary evidence は `vitest` / `typecheck` / `lint` / 動作確認ログ
> - `manual-test-result.md` には `TC-ID ↔ evidence` の対応を明記する

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 手動テストチェックリスト作成

**目的**: 手動確認する項目を定義する

**実行手順**:

1. 以下のチェックリストを `outputs/phase-11/manual-test-checklist.md` に作成する:

   | TC-ID  | 確認内容                                                                         | 確認方法       |
   | ------ | -------------------------------------------------------------------------------- | -------------- |
   | MTC-01 | デスクトップアプリが正常に起動できる                                             | アプリ起動確認 |
   | MTC-02 | スケジュール設定画面で `monthly` を選択できる                                    | UI操作         |
   | MTC-03 | UI 上で `dayOfMonth` フィールドに有効値（1〜31）を入力すると cron 式が生成される | UI確認         |
   | MTC-04 | `visualConfigToCron` が直接テストで正常に動作する（プログラム的確認）            | vitest 実行    |
   | MTC-05 | 型チェックが通過する                                                             | typecheck 実行 |
   | MTC-06 | Lint が通過する                                                                  | lint 実行      |

**期待される成果物**:

- `outputs/phase-11/manual-test-checklist.md`（手動テストチェックリスト）

---

### タスク2: 手動確認実施

**目的**: チェックリストの各項目を確認する

**実行手順**:

1. MTC-04〜MTC-06（プログラム的確認）を実行する:

   ```bash
   # MTC-04: テスト実行
   pnpm vitest run apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts

   # MTC-05: 型チェック
   pnpm --filter @repo/desktop typecheck

   # MTC-06: Lint
   pnpm --filter @repo/desktop lint
   ```

2. MTC-01〜MTC-03（UI確認）を実施する場合:
   - デスクトップアプリを起動する: `pnpm --filter @repo/desktop dev`
   - スケジュール設定画面を開く
   - `monthly` 設定で `dayOfMonth` の動作を確認する

3. 各確認結果を記録する

**期待される成果物**:

- `outputs/phase-11/manual-test-result.md`（手動テスト結果）

---

### タスク3: 発見事項記録

**目的**: 手動確認で発見した問題や気づきを記録する

**実行手順**:

1. 問題がある場合はその詳細を記録する
2. 問題がない場合も「問題なし」として記録する
3. `outputs/phase-11/discovered-issues.md` を作成する

**期待される成果物**:

- `outputs/phase-11/discovered-issues.md`（発見事項記録）

---

## 参照資料

| 参照資料        | パス                                                          | 内容             |
| --------------- | ------------------------------------------------------------- | ---------------- |
| 実装ファイル    | `apps/desktop/src/renderer/utils/cronConverter.ts`            | 確認対象実装     |
| テストファイル  | `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts` | プログラム的確認 |
| Phase 10 成果物 | `outputs/phase-10/ac-final-check.md`                          | AC 最終確認書    |

---

## 成果物

| 成果物                   | パス                                        | 内容                    |
| ------------------------ | ------------------------------------------- | ----------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | 確認項目一覧            |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | TC-ID ↔ evidence 対応表 |
| 発見事項記録             | `outputs/phase-11/discovered-issues.md`     | 問題・気づき一覧        |

---

## 統合テスト連携

- MTC-04〜MTC-06（プログラム的確認）を主要 evidence とする
- placeholder-only の証跡は PASS 扱いにしない

---

## 完了条件

- [ ] `outputs/phase-11/manual-test-checklist.md` が作成されている
- [ ] `outputs/phase-11/manual-test-result.md` が作成されている（TC-ID ↔ evidence 対応あり）
- [ ] `outputs/phase-11/discovered-issues.md` が作成されている
- [ ] MTC-04〜MTC-06（プログラム的確認）が全て Pass である
- [ ] NON_VISUAL である理由が `manual-test-result.md` に記載されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜3）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 10（最終レビューゲート）が PASS であること
- **後続**: Phase 12（ドキュメント更新）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001/phase-12-documentation.md`
