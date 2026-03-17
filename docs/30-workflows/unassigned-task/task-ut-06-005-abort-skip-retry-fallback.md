# abort/skip/retry fallback 組み込み - タスク指示書

## メタ情報

```yaml
issue_number: 1303
```

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| タスクID   | UT-06-005                          |
| タスク名   | abort/skip/retry fallback 組み込み |
| 分類       | 実装                               |
| 優先度     | 高                                 |
| ステータス | 未実施                             |
| 依存タスク | TASK-SKILL-LIFECYCLE-08            |
| 発見元     | TASK-SKILL-LIFECYCLE-06 Phase 12   |

## 1. なぜこのタスクが必要か（Why）

Permission 拒否時の挙動が実装に固定化されていない。abort/skip/retry 契約を実装しないと安全停止と継続実行の境界が曖昧になる。

## 2. 何を達成するか（What）

abort 4ステップ、skip 契約、retry 最大3回、timeout 300000ms の挙動を SkillExecutor に実装する。

## 3. どのように実行するか（How）

`PermissionResolver` と `PermissionStore` を利用し、fail-closed を基本にフロー分岐を実装する。

## 4. 実行手順

1. abort フロー（cancelAll -> revokeSessionEntries -> log -> IPC）を実装する。
2. skip フロー（`{ approved:false, skip:true }`）を実装する。
3. retry フロー（最大3回、3回目でabort）を実装する。
4. timeout 発生時に retry へ行かず abort へ遷移させる。

## 5. 完了条件チェックリスト

- [ ] abort フロー4ステップが実行される
- [ ] skip で後続処理が継続する
- [ ] retry が3回で打ち切られる
- [ ] timeout で abort に遷移する
- [ ] 冪等性テストが PASS する

## 6. 検証方法

```bash
pnpm --filter @repo/desktop test src/main/execution/**/*permission*.test.ts
pnpm --filter @repo/desktop test src/main/handlers/**/*abort*.test.ts
```

## 7. リスクと対策

| リスク                       | 対策                                       |
| ---------------------------- | ------------------------------------------ |
| 中断漏れで zombie 処理が残る | cancelAll 後の pending 件数を assert する  |
| timeout 解釈差異             | Phase 5 契約を正本として実装コメントに固定 |

## 8. 参照情報

- `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-5/abort-fallback-contract.md`
- `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-12/implementation-guide.md`

## 9. 備考

UT-06-008（タイムアウト仕様明確化）を先に反映すると再修正が減る。
