# SafetyGatePort 具象クラス実装 - タスク指示書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| タスクID   | UT-06-003                        |
| タスク名   | SafetyGatePort 具象クラス実装    |
| 分類       | 実装                             |
| 優先度     | 高                               |
| ステータス | 未実施                           |
| 依存タスク | TASK-SKILL-LIFECYCLE-08          |
| 発見元     | TASK-SKILL-LIFECYCLE-06 Phase 12 |

## 1. なぜこのタスクが必要か（Why）

`SafetyGatePort` は契約のみ定義されており、Main Process での評価ロジックが未実装。公開前ブロック判定を実行する実体が必要。

## 2. 何を達成するか（What）

`evaluate(skillName)` を実装し、`SafetyGateResult.overallGrade` を `SAFE/SAFE_WITH_WARNINGS/UNSAFE` で返せる状態にする。

## 3. どのように実行するか（How）

`apps/desktop/src/main/permissions/` に `DefaultSafetyGate` を実装し、Task-08 から DI で利用可能にする。

## 4. 実行手順

1. `safety-gate.ts` の `SafetyCheckId` 5種を評価するロジックを実装する。
2. Grade 集約ルール（UNSAFE 優先）を実装する。
3. `skill:evaluate-safety` IPC ハンドラを追加する。
4. 単体テストで blocked/warned/passed の代表ケースを固定する。

## 5. 完了条件チェックリスト

- [ ] `evaluate(skillName): Promise<SafetyGateResult>` が動作する
- [ ] `CRITICAL_TOOL_REQUIRED` が `UNSAFE` へ集約される
- [ ] `HIGH_TOOL_REQUIRED` が `SAFE_WITH_WARNINGS` へ集約される
- [ ] IPC 経由で結果取得できる
- [ ] テストが PASS する

## 6. 検証方法

```bash
pnpm --filter @repo/desktop test src/main/permissions/safety-gate*.test.ts
pnpm --filter @repo/desktop typecheck
```

## 7. リスクと対策

| リスク               | 対策                                                                |
| -------------------- | ------------------------------------------------------------------- |
| 判定基準のずれ       | Phase 5 仕様と `decision-table-risk-permission.md` でダブルチェック |
| 公開処理との結合過多 | DI 境界を維持し、Port インターフェース越しに利用                    |

## 8. 参照情報

- `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-5/safety-gate.ts`
- `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-12/implementation-guide.md`

## 9. 備考

UT-06-001/002 完了後に着手すると実装依存が明確になる。
