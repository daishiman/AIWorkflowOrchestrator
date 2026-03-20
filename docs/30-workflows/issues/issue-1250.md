# [#1250] [UT-06-005] abort/skip/retry fallback 組み込み

## メタ情報

```yaml
issue_number: 1250
title: [UT-06-005] abort/skip/retry fallback 組み込み
state: CLOSED
priority: 高
scale: -
category: -
status: 未実施
created_date: 2026-03-16
updated_date: 2026-03-16
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1250
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 高     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 目的

Permission 拒否時の挙動が実装に固定化されていない。abort/skip/retry 契約を実装しないと、安全停止と継続実行の境界が曖昧になる。

abort 4ステップ、skip 契約、retry 最大3回、timeout 300000ms の挙動を SkillExecutor に実装する。

## 実装内容

`PermissionResolver` と `PermissionStore` を利用し、fail-closed を基本にフロー分岐を実装する。

1. abort フロー（cancelAll -> revokeSessionEntries -> log -> IPC）を実装する
2. skip フロー（`{ approved:false, skip:true }`）を実装する
3. retry フロー（最大3回、3回目で abort）を実装する
4. timeout 発生時に retry へ行かず abort へ遷移させる

## 受入基準

- [ ] abort フロー4ステップが実行される
- [ ] skip で後続処理が継続する
- [ ] retry が3回で打ち切られる
- [ ] timeout で abort に遷移する
- [ ] 冪等性テストが PASS する

## 検証コマンド

```bash
pnpm --filter @repo/desktop test src/main/execution/**/*permission*.test.ts
pnpm --filter @repo/desktop test src/main/handlers/**/*abort*.test.ts
```

## リスクと対策

| リスク                       | 対策                                       |
| ---------------------------- | ------------------------------------------ |
| 中断漏れで zombie 処理が残る | cancelAll 後の pending 件数を assert する  |
| timeout 解釈差異             | Phase 5 契約を正本として実装コメントに固定 |

## 関連情報

- **タスクID**: UT-06-005
- **分類**: 実装
- **依存タスク**: TASK-SKILL-LIFECYCLE-08
- **発見元**: TASK-SKILL-LIFECYCLE-06 Phase 12
- **備考**: UT-06-008（タイムアウト仕様明確化）を先に反映すると再修正が減る

## 参照

- `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-5/abort-fallback-contract.md`
- `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-12/implementation-guide.md`
