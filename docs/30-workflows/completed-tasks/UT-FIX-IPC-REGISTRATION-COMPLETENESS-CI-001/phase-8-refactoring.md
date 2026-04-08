# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 8                                           |
| Phase名    | リファクタリング                            |
| 前提Phase  | Phase 7                                     |
| 後続Phase  | Phase 9                                     |
| ステータス | 未実施                                      |
| 作成日     | 2026-04-07                                  |
| 機能名     | UT-FIX-IPC-REGISTRATION-COMPLETENESS-CI-001 |

---

## 目的

テストコードの重複・ドリフトを除去し、保守性を高める。

## 背景

Phase 5・6 で作成したテストコードに重複があれば共通化し、可読性を向上させる。本タスクはテストのみの変更であるため、リファクタリングのスコープは限定的。

---

## 実行タスク

### タスク1: テストコードのリファクタリング

**目的**: 重複コードの除去・可読性向上を行う

**実行手順**:

1. spy セットアップコードに重複がある場合は `beforeEach` に共通化する
2. チャネル名配列のソートロジックが各 `expect` 内でインラインになっている場合は helper 関数に抽出する
3. `pnpm typecheck` / `pnpm lint` が PASS することを確認する
4. 全テストが引き続き PASS することを確認する

**確認観点（事前定義）**:

| 対象                   | Before                     | After                 | 理由     |
| ---------------------- | -------------------------- | --------------------- | -------- |
| spy セットアップコード | 各テストに重複             | `beforeEach` に共通化 | DRY 原則 |
| チャネル名配列のソート | 各 `expect` 内でインライン | helper 関数に抽出     | 可読性   |

**実行コマンド**:

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop vitest run src/main/ipc/__tests__/ipcHandlerRegistrationSnapshot
```

**期待される成果物**:

- テストファイルの更新（リファクタリング適用後）
- `outputs/phase-8/refactoring-plan.md`
- `outputs/phase-8/post-refactor-test-result.md`

---

## 参照資料

| 参照資料       | パス                                                                         | 内容           |
| -------------- | ---------------------------------------------------------------------------- | -------------- |
| テストファイル | `apps/desktop/src/main/ipc/__tests__/ipcHandlerRegistrationSnapshot.test.ts` | リファクタ対象 |

---

## 成果物

| 成果物         | パス                                           | 説明                     |
| -------------- | ---------------------------------------------- | ------------------------ |
| リファクタ計画 | `outputs/phase-8/refactoring-plan.md`          | 変更箇所・理由の記録     |
| 再テスト結果   | `outputs/phase-8/post-refactor-test-result.md` | リファクタ後の全 TC PASS |

---

## 完了条件

- [ ] コード重複が解消されている（または重複なしと確認済み）
- [ ] `pnpm typecheck` が PASS している
- [ ] `pnpm lint` が PASS している
- [ ] 全テストが引き続き PASS している
- [ ] `outputs/phase-8/` 配下に成果物が配置されている

---

## Phase実行記録

> 実行時にこのセクションへ結果を記録する。

| 項目       | 内容 |
| ---------- | ---- |
| 実行日時   | -    |
| 実行者     | -    |
| 完了判定   | -    |
| 変更箇所数 | -    |
| 特記事項   | -    |
