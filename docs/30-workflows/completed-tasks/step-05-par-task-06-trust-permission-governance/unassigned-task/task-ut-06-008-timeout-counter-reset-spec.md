# タイムアウトカウンタリセット仕様明確化 - タスク指示書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| タスクID   | UT-06-008                              |
| タスク名   | タイムアウトカウンタリセット仕様明確化 |
| 分類       | 設計                                   |
| 優先度     | 低                                     |
| ステータス | 未実施                                 |
| 依存タスク | UT-06-005                              |
| 発見元     | TASK-SKILL-LIFECYCLE-06 Phase 11/12    |

## 1. なぜこのタスクが必要か（Why）

Phase 2 と Phase 5 で timeout カウンタ仕様が不一致（累積時間か、retryごとリセットか）。実装前に正本を確定しないと挙動差異を生む。

## 2. 何を達成するか（What）

timeout 仕様の正本を1つに統一し、関連文書とテスト期待値を同期する。

## 3. どのように実行するか（How）

設計決定を ADR 相当の短文書で確定し、Phase 2/5 と implementation-guide に反映する。

## 4. 実行手順

1. 現行差分（Phase 2 vs Phase 5）を比較表に整理する。
2. セキュリティ/UX 観点で採用案を決定する。
3. 正本仕様に統一し、差分側へ「更新済み」注記を入れる。
4. timeout 関連テスト期待値を同期する。

## 5. 完了条件チェックリスト

- [ ] timeout 仕様の正本が明記される
- [ ] Phase 2/5 の記述差異が解消される
- [ ] implementation-guide に同一仕様が記載される
- [ ] 関連テスト期待値が同期される

## 6. 検証方法

```bash
rg -n "timeout|300_000|retry" docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance
pnpm --filter @repo/desktop test src/main/**/*timeout*.test.ts
```

## 7. リスクと対策

| リスク                     | 対策                                       |
| -------------------------- | ------------------------------------------ |
| 仕様決定の遅延             | UT-06-005 着手前に必ず決定ゲートを置く     |
| 文書だけ更新して実装未同期 | 変更時にテスト期待値更新を完了条件に含める |

## 8. 参照情報

- `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-2/abort-fallback-design.md`
- `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-5/abort-fallback-contract.md`
- `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-11/discovered-issues.md`

## 9. 備考

実装前に仕様を固定し、ダブルループ（仕様->実装->仕様）で再評価する。
