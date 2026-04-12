# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 9                                              |
| タスクID   | UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001   |
| タスク名   | describe.skip 内の旧 testid 参照クリーンアップ |
| 前提Phase  | Phase 8                                        |
| 後続Phase  | Phase 10                                       |
| 作成日     | 2026-04-11                                     |
| ステータス | 未実施                                         |

## 目的

typecheck / lint / test の全通過を確認し、出荷可能品質を保証する。

## 品質ゲート一括判定

### 1. line budget チェック

| ファイル                                       | 変更行数     | 上限  | 判定 |
| ---------------------------------------------- | ------------ | ----- | ---- |
| `SkillLifecyclePanel.llm-generation.test.tsx`  | 削除数行程度 | 500行 | [ ]  |
| `SkillLifecyclePanel.auth-regression.test.tsx` | 削除数行程度 | 500行 | [ ]  |

```bash
# 行数確認
wc -l apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
wc -l apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
```

### 2. TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

**期待結果**: エラーなし（テストファイルの参照削除のみのため型エラーは発生しない）

### 3. ESLint チェック

```bash
pnpm --filter @repo/desktop lint
```

**期待結果**: エラーなし

### 4. テスト PASS 確認

```bash
pnpm --filter @repo/desktop test:run
```

**期待結果**: 全件 PASS

### 5. testid 残存確認

```bash
# skill-lifecycle-request-input が完全に除去されているか確認
grep -rn "skill-lifecycle-request-input" \
  apps/desktop/src/renderer/components/skill/__tests__/
```

**期待結果**: 0件（マッチなし）

### 6. mirror parity 確認

本タスクはテストファイルのみの変更であるため mirror parity は N/A。

## 品質確認観点テーブル

| 確認コマンド                               | 期待結果    | 判定 |
| ------------------------------------------ | ----------- | ---- |
| `pnpm --filter @repo/desktop typecheck`    | エラー 0 件 | [ ]  |
| `pnpm --filter @repo/desktop lint`         | エラー 0 件 | [ ]  |
| `pnpm --filter @repo/desktop test:run`     | 全件 PASS   | [ ]  |
| `grep "skill-lifecycle-request-input" ...` | マッチ 0 件 | [ ]  |

## 因果ループ監査

**修正後の強化ループ（正常動作）**:
`describe.skip` 内の不整合参照を除去 → スキップ解除時もテストが安全に実行可能
→ 開発者の信頼向上 → テストの保守コスト低下

**残存リスク（バランスループ）**:
他のテストファイルに同様の `describe.skip` 内旧 testid 参照が残存する可能性
→ Phase 12 で未タスクとして記録して対処

## リスク台帳

| ID   | リスク                                       | 確率 | 影響 | 対策                          | 状態   |
| ---- | -------------------------------------------- | ---- | ---- | ----------------------------- | ------ |
| R-01 | 他テストファイルで同様の旧 testid 参照が残存 | 中   | 中   | Phase 12 で未タスクとして記録 | 記録済 |
| R-02 | describe.skip 解除後に別の参照エラーが発生   | 低   | 中   | Phase 11 の手動テストで確認   | 記録済 |
| R-03 | typecheck/lint が別の理由で失敗              | 低   | 高   | エラー内容を調査して個別対応  | 未対応 |

## 参照資料

| 資料名               | パス                                        | 用途           |
| -------------------- | ------------------------------------------- | -------------- |
| リファクタリング報告 | `outputs/phase-8/refactoring-report.md`     | Phase 8 成果物 |
| 実装サマリー         | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物 |

## 実行手順

1. 型チェックを実行する（`pnpm --filter @repo/desktop typecheck`）
2. Lint チェックを実行する（`pnpm --filter @repo/desktop lint`）
3. 全テストを実行する（`pnpm --filter @repo/desktop test:run`）
4. testid 残存確認の grep を実行する
5. 品質ゲート一括判定テーブルを更新する
6. 品質レポートを outputs/phase-9/ に出力する

## 実行タスク

- 型チェックを実行する（pnpm --filter @repo/desktop typecheck）
- Lint チェックを実行する（pnpm --filter @repo/desktop lint）
- 全テストを実行する（pnpm --filter @repo/desktop test:run）
- testid 残存確認の grep を実行する
- 品質ゲート一括判定テーブルを更新する
- 品質レポートを outputs/phase-9/ に出力する

## 統合テスト連携

```bash
# 最終品質チェック（全コマンドを順に実行）
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop test:run
grep -rn "skill-lifecycle-request-input" \
  apps/desktop/src/renderer/components/skill/__tests__/ || echo "OK: 0 matches"
```

## 多角的チェック観点

| 観点           | 確認内容                               |
| -------------- | -------------------------------------- |
| 型安全性       | typecheck がエラーなしで通過すること   |
| コードスタイル | lint がエラーなしで通過すること        |
| テスト網羅性   | test:run が全件 PASS すること          |
| 削除完全性     | grep で旧 testid 参照が 0 件であること |
| 回帰テスト     | 既存テストが壊れていないこと           |

## 成果物

| 成果物       | パス                                | 説明                           |
| ------------ | ----------------------------------- | ------------------------------ |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質ゲート判定結果とリスク台帳 |

## 完了条件

- [ ] 全品質ゲートが PASS している
- [ ] 因果ループ監査が完了している
- [ ] リスク台帳が更新されている

## サブタスク管理

| サブタスクID | 内容                  | 状態   |
| ------------ | --------------------- | ------ |
| ST-9-1       | typecheck 実行・確認  | 未実施 |
| ST-9-2       | lint 実行・確認       | 未実施 |
| ST-9-3       | test:run 実行・確認   | 未実施 |
| ST-9-4       | testid 残存 grep 確認 | 未実施 |
| ST-9-5       | 品質レポート出力      | 未実施 |

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成（仕様書として記録）
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001
```

## 次のPhase

Phase 10: 最終レビューゲート
