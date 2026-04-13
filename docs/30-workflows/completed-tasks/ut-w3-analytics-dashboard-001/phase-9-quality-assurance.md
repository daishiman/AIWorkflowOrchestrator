# Phase 9: 品質保証

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 9                             |
| 機能名 | UT-W3-ANALYTICS-DASHBOARD-001 |
| 作成日 | 2026-04-13                    |

## 目的

typecheck、lint、全テスト実行を一括で判定し、
実装の品質ゲートを通過していることを確認する。

---

## 実行タスク

- **タスク1**: TypeScript typecheck の実行・PASS 確認
- **タスク2**: ESLint の実行・PASS 確認
- **タスク3**: 関連テストファイルの全 PASS 確認
- **タスク4**: 変更ファイルの不要 import ゼロ確認
- **タスク5**: 品質チェック結果の記録

---

## 参照資料

| 資料名                        | パス                                       | 説明                   |
| ----------------------------- | ------------------------------------------ | ---------------------- |
| Phase 8 リファクタ結果        | `outputs/phase-8/refactoring-result.md`    | リファクタ完了状態確認 |
| Phase 1 受入基準              | `outputs/phase-1/acceptance-criteria.md`   | AC-1〜AC-5 の前確認    |
| 実装結果                      | `outputs/phase-5/implementation-result.md` | Phase 5 成果物         |
| Green確認結果（全テストPASS） | `outputs/phase-5/green-confirmation.md`    | Phase 5 成果物         |

---

## 品質チェック項目

| チェック項目      | コマンド                                           | 合格基準       |
| ----------------- | -------------------------------------------------- | -------------- | ------------ | ---- |
| typecheck         | `pnpm --filter @repo/desktop typecheck`            | エラー 0 件    |
| lint              | `pnpm --filter @repo/desktop lint`                 | エラー 0 件    |
| test（unit）      | `pnpm --filter @repo/desktop test`                 | 全テスト GREEN |
| E2E（Playwright） | `pnpm --filter @repo/desktop exec playwright test` | 全テスト PASS  |
| 不要 import 確認  | `rg -n "unused                                     | TODO           | FIXME" src/` | 0 件 |

---

## 実行手順

### ステップ1: TypeScript typecheck

```bash
pnpm --filter @repo/desktop typecheck
```

### ステップ2: ESLint

```bash
pnpm --filter @repo/desktop lint
```

### ステップ3: 全テスト実行（AC-5 の検証）

```bash
pnpm --filter @repo/desktop test

pnpm --filter @repo/desktop exec playwright test \
  --grep "analytics"
```

**期待結果**: 全テスト GREEN

### ステップ4: 不要 import・不要コードの確認

```bash
rg -n "TODO|FIXME|HACK|XXX" \
  apps/desktop/src/renderer/components/analytics/ \
  apps/desktop/src/renderer/views/SettingsView/ \
  docs/30-workflows/ut-w3-analytics-dashboard-001/
```

### ステップ5: 受入基準（AC-1〜AC-5）の事前確認

| AC番号 | 基準                                                                            | 充足状況 |
| ------ | ------------------------------------------------------------------------------- | -------- |
| AC-1   | 設定画面に `AnalyticsDashboardPanel` が統合されていること                       | TBD      |
| AC-2   | オプトアウト状態の現在値（ON/OFF）が UI で確認できること                        | TBD      |
| AC-3   | 開発モード（NODE_ENV !== 'production'）で dev-only 診断ブロックが表示されること | TBD      |
| AC-4   | Playwright E2E テストが PASS すること                                           | TBD      |
| AC-5   | `pnpm typecheck && pnpm lint && pnpm test` が PASS すること                     | TBD      |

---

## 統合テスト連携

- 品質保証で統合テスト結果を確認
- typecheck / lint / test の全 PASS が Phase 10 への前提条件
- E2E テストが PASS することで AC-4 が充足されることを確認

---

## サブタスク管理

| ID     | タスク名                    | ステータス |
| ------ | --------------------------- | ---------- |
| T-09-1 | typecheck 実行              | 未実施     |
| T-09-2 | ESLint 実行                 | 未実施     |
| T-09-3 | unit テスト実行             | 未実施     |
| T-09-4 | E2E テスト実行              | 未実施     |
| T-09-5 | 不要 import・不要コード確認 | 未実施     |
| T-09-6 | 品質チェック結果記録        | 未実施     |

---

## 成果物

| 成果物           | 配置先                                    | 形式     |
| ---------------- | ----------------------------------------- | -------- |
| 品質チェック結果 | `outputs/phase-9/quality-check-result.md` | Markdown |

---

## 完了条件

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS であること
- [ ] ESLint が PASS であること
- [ ] unit テストが全て GREEN であること
- [ ] Playwright E2E テストが PASS であること
- [ ] 不要 import・不要コードが残っていないこと
- [ ] AC-1〜AC-5 の充足状況が `outputs/phase-9/quality-check-result.md` に記録されていること

---

## タスク100%実行確認【必須】

- [ ] T-09-1: typecheck を実行し結果を記録済み（PASS）
- [ ] T-09-2: ESLint を実行し結果を記録済み（PASS）
- [ ] T-09-3: unit テストを実行し結果を記録済み（全 GREEN）
- [ ] T-09-4: E2E テストを実行し結果を記録済み（PASS）
- [ ] T-09-5: 不要 import・不要コードの確認を済ませた
- [ ] T-09-6: AC-1〜AC-5 の充足状況を `outputs/phase-9/quality-check-result.md` に記録済み

---

## 次Phase

**Phase 10: 最終レビューゲート** — 受入基準との照合・PASS/FAIL 判定を行い、マージ準備完了を確定する。

**Phase 10 開始条件**: Phase 9 の全完了条件を満たすこと。
