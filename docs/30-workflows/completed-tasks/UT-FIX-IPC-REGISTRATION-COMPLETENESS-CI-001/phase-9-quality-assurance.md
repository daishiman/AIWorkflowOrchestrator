# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 9                                           |
| Phase名    | 品質保証                                    |
| 前提Phase  | Phase 8                                     |
| 後続Phase  | Phase 10                                    |
| ステータス | 未実施                                      |
| 作成日     | 2026-04-07                                  |
| 機能名     | UT-FIX-IPC-REGISTRATION-COMPLETENESS-CI-001 |

---

## 目的

lint・typecheck・テスト通過を一括確認し、Phase 10 最終レビューへ向けて品質を担保する。

## 背景

リファクタリング後の全体品質を確認するフェーズ。個別の確認はここで集約し、1 回のコマンド実行で全品質指標が PASS することを記録する。

---

## 実行タスク

### タスク1: 全品質チェックの一括実施

**目的**: typecheck・lint・全テストが PASS することを確認し記録する

**実行手順**:

1. TypeScript 型チェックを実行する
2. ESLint を実行する
3. 全テストを実行する
4. 全チェックの結果を `outputs/phase-9/quality-report.md` に記録する

**実行コマンド**:

```bash
# TypeScript 型チェック
pnpm --filter @repo/desktop typecheck

# ESLint
pnpm --filter @repo/desktop lint

# 全テスト
pnpm --filter @repo/desktop vitest run

# CI 全体テスト（オプション）
pnpm vitest run
```

**品質チェックリスト**:

| チェック                  | 判定基準                    | 結果 |
| ------------------------- | --------------------------- | ---- |
| `pnpm typecheck`          | エラー 0 件                 | -    |
| `pnpm lint`               | エラー・警告 0 件           | -    |
| `pnpm vitest run`（単体） | 全テスト PASS               | -    |
| `pnpm vitest run`（全体） | 全テスト PASS（オプション） | -    |

**期待される成果物**:

- `outputs/phase-9/quality-report.md`

---

## 参照資料

| 参照資料       | パス                                                                         | 内容       |
| -------------- | ---------------------------------------------------------------------------- | ---------- |
| テストファイル | `apps/desktop/src/main/ipc/__tests__/ipcHandlerRegistrationSnapshot.test.ts` | 対象テスト |
| 実装ファイル   | `apps/desktop/src/main/ipc/creatorHandlers.ts`                               | 対象実装   |

---

## 成果物

| 成果物       | パス                                | 説明                              |
| ------------ | ----------------------------------- | --------------------------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | typecheck / lint / test PASS 記録 |

---

## 完了条件

- [ ] `pnpm typecheck` PASS
- [ ] `pnpm lint` PASS（警告 0 件）
- [ ] 全テスト PASS
- [ ] `outputs/phase-9/` 配下に品質レポートが配置されている

---

## Phase実行記録

> 実行時にこのセクションへ結果を記録する。

| 項目           | 内容 |
| -------------- | ---- |
| 実行日時       | -    |
| 実行者         | -    |
| 完了判定       | -    |
| typecheck 結果 | -    |
| lint 結果      | -    |
| 全テスト結果   | -    |
| 特記事項       | -    |
