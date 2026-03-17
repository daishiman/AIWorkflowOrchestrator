# high × time_24h テスト追加 - タスク指示書

## メタ情報

```yaml
issue_number: 1252
```

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| タスクID   | UT-06-006                          |
| タスク名   | high × time_24h テスト追加         |
| 分類       | テスト                             |
| 優先度     | 低                                 |
| ステータス | 未実施                             |
| 依存タスク | UT-06-002                          |
| 発見元     | TASK-SKILL-LIFECYCLE-06 Phase 7/12 |

## 1. なぜこのタスクが必要か（Why）

High リスクでの `time_24h` ポリシーが未検証。仕様変更時の退行検知を可能にするため境界テストを追加する。

## 2. 何を達成するか（What）

High リスク時に 24h 許可UIが表示されないこと、または仕様変更時に expiresAt 計算が正しいことを検証する。

## 3. どのように実行するか（How）

PermissionDialog UI テストと expiryPolicy 計算ロジックの単体テストを追加する。

## 4. 実行手順

1. High リスク描画時の選択肢DOMを検証する。
2. `time_24h` 入力時の `expiresAt = allowedAt + 86_400_000` を検証する。
3. 仕様が「禁止」の場合は UI 不表示を期待値に固定する。

## 5. 完了条件チェックリスト

- [ ] High リスクの 24h ポリシー挙動に対するテストが存在する
- [ ] 期待値が仕様書と一致している
- [ ] CI で PASS する

## 6. 検証方法

```bash
pnpm --filter @repo/desktop test src/main/handlers/permission/expiry-policy-calculator.test.ts
pnpm --filter @repo/desktop test src/renderer/components/permission-dialog/*.test.tsx
```

## 7. リスクと対策

| リスク                     | 対策                                 |
| -------------------------- | ------------------------------------ |
| 仕様変更で期待値が古くなる | test title に仕様日付/タスクIDを記録 |
| UIとMainで判定差異         | UI/Main 両方に同一ケースを追加       |

## 8. 参照情報

- `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-7/coverage-gaps.md`
- `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-12/unassigned-task-detection.md`

## 9. 備考

UT-06-007 と同時に追加すると matrix が読みやすい。
