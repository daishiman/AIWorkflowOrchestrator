# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 9                                            |
| タスクID   | TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001    |
| タスク名   | Renderer 側エラーメッセージ UI 表示 E2E 確認 |
| 前提Phase  | Phase 8                                      |
| 後続Phase  | Phase 10                                     |
| 作成日     | 2026-04-13                                   |
| ステータス | pending                                      |

## 目的

line budget・lint・型チェック・テスト全通過・責務境界の整合性を一括判定し、
Phase 10 への進行可否を評価する。

## 品質チェック項目

### 自動チェック

```bash
# 1. lint チェック
pnpm --filter @repo/desktop lint

# 2. TypeScript 型チェック
pnpm --filter @repo/desktop typecheck

# 3. 全テスト PASS 確認
pnpm --filter @repo/desktop exec vitest run \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.test.tsx \
  --reporter=verbose

# 4. 関連テストへの回帰影響確認
pnpm --filter @repo/desktop exec vitest run \
  apps/desktop/src/renderer/components/skill/ \
  --reporter=verbose
```

### 手動チェック

| 項目                     | 確認内容                                                                | 判定 |
| ------------------------ | ----------------------------------------------------------------------- | ---- |
| 命名規則整合             | テスト description が受け入れ基準（TC-01〜TC-04）と対応しているか       | -    |
| スコープ遵守             | Main 層・IPC ブリッジへの変更が含まれていないか                         | -    |
| モック安全性             | `vi.stubGlobal("window", ...)` が使用されていないか（[FB-VSCPKR-02]）   | -    |
| `describe.skip` 確認     | 削除した testid が `describe.skip` 内に残存していないか（[FB-TASK-01]） | -    |
| 削除 testid 残存チェック | `grep -rn "skill-lifecycle-error" apps/` の結果が適切か                 | -    |

### リスク評価

| リスク                                                             | 影響度 | 発生確率 | 対策                        |
| ------------------------------------------------------------------ | ------ | -------- | --------------------------- |
| IPC variadic 化が runtime で正常動作しない                         | 高     | 低       | Phase 11 の手動テストで確認 |
| `applyWorkflowSnapshot` が `setWorkflowError` をリセットしてしまう | 中     | 中       | UT-08 でカバー済みを確認    |
| Vitest 環境と実際の Electron runtime の差異                        | 中     | 低       | Phase 11 で実機確認         |

## 因果ループ監査

```
テスト追加 → カバレッジ向上 → 品質信頼度向上 → 本番デプロイ可能
     ↓
モック過多 → runtime 差異 → E2E 不一致リスク（Phase 11 で確認）
```

## 参照資料

| 参照資料       | パス                                             | 説明           |
| -------------- | ------------------------------------------------ | -------------- |
| リファクタ計画 | `outputs/phase-8/refactoring-plan.md`            | Phase 8 成果物 |
| 責務境界マップ | `outputs/phase-8/responsibility-boundary-map.md` | Phase 8 成果物 |

## 成果物

| 成果物         | パス                                   | 説明                 |
| -------------- | -------------------------------------- | -------------------- |
| 品質レポート   | `outputs/phase-9/quality-report.md`    | 全チェック項目の判定 |
| リスク台帳     | `outputs/phase-9/risk-register.md`     | リスクと対策の記録   |
| 因果ループ監査 | `outputs/phase-9/causal-loop-check.md` | 因果ループ分析結果   |

## 完了条件

- [ ] lint が通過している
- [ ] typecheck が通過している
- [ ] 全テスト（UT-01〜UT-11）が PASS している
- [ ] `describe.skip` 内に旧 testid が残存していないことを確認した
- [ ] リスク台帳が作成されている
- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 全品質チェックの判定が記録されている
- [ ] 実行記録を残した

## 次のPhase

Phase 10: 最終レビューゲート
