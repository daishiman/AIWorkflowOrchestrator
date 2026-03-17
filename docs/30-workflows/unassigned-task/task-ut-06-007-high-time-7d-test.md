# high × time_7d テスト追加 - タスク指示書

## メタ情報

```yaml
issue_number: 1254
```

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| タスクID   | UT-06-007                          |
| タスク名   | high × time_7d テスト追加          |
| 分類       | テスト                             |
| 優先度     | 低                                 |
| ステータス | 未実施                             |
| 依存タスク | UT-06-002                          |
| 発見元     | TASK-SKILL-LIFECYCLE-06 Phase 7/12 |

## 1. なぜこのタスクが必要か（Why）

High リスクに対する `time_7d` ポリシーは禁止設計だが、回帰テストが不足している。制約破りを検知するテストが必要。

## 2. 何を達成するか（What）

High リスクで 7日許可が表示・保存されないことを検証する。

## 3. どのように実行するか（How）

UI テストでボタン不表示を検証し、Store テストで `time_7d` エントリ不保存を検証する。

## 4. 実行手順

1. PermissionDialog の High リスク描画で `time_7d` 選択肢がないことを確認。
2. Store 書き込み時に High + `time_7d` が reject されることを確認。
3. 失敗時メッセージの文言を固定。

## 5. 完了条件チェックリスト

- [ ] High リスクで `time_7d` が表示されない
- [ ] High リスクで `time_7d` が保存されない
- [ ] 失敗ケースのログ/エラーが検証される
- [ ] テストが PASS する

## 6. 検証方法

```bash
pnpm --filter @repo/desktop test src/renderer/components/permission-dialog/*.test.tsx
pnpm --filter @repo/desktop test src/main/stores/permission-store*.test.ts
```

## 7. リスクと対策

| リスク                 | 対策                                 |
| ---------------------- | ------------------------------------ |
| silent fail            | エラーコードを固定しテストで検証     |
| 将来仕様で許可に変わる | 仕様変更時はテスト意図コメントを更新 |

## 8. 参照情報

- `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-7/coverage-gaps.md`
- `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-4/decision-table-risk-permission.md`

## 9. 備考

UT-06-006 とセットで matrix coverage を維持する。
