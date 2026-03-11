# [#1126] "[UT-FIX-ACCOUNTSECTION-LINKED-PROVIDER-KEY-WARNING-001] AccountSection key warning 修正"

## メタ情報

```yaml
task_id: UT-FIX-ACCOUNTSECTION-LINKED-PROVIDER-KEY-WARNING-001
task_name: AccountSection key warning 修正
category: 修正
target_feature: AccountSection linked providers 表示
priority: 低
scale: 小規模
status: 未実施
source_phase: TASK-FIX-SAFEINVOKE-TIMEOUT-001 Phase 11 capture
created_date: 2026-03-10
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-fix-accountsection-linked-provider-key-warning-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

Phase 11 screenshot capture 中に `AccountSection` で “Each child in a list should have a unique key prop” warning が再現した。レンダリングは継続するが、React warning を放置すると将来の差分検知や DOM 更新時の不整合原因になる。

## 2. 何を達成するか（What）

- warning を出している list render を特定する
- 一意な `key` を付与して warning を解消する

## 3. どのように実行するか（How）

### 3.1 推奨アプローチ

1. `AccountSection/index.tsx` の `.map()` 箇所を調査する
2. 安定した id を `key` に使う
3. screenshot harness か test で warning 非再現を確認する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                            | 解決策                                                     | 教訓                                                                               |
| --------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| representative screenshot 中の console warning は見落としやすい | capture 実行ログと `discovered-issues.md` を同時に確認する | 画面証跡取得時は描画結果だけでなく warning/console error も backlog 判定対象にする |

## 4. 実行手順

1. warning 発生箇所を特定する
2. `key` を追加する
3. `AccountSection` 関連 test と screenshot harness で再確認する

## 5. 完了条件チェックリスト

- [ ] warning の発生箇所を特定した
- [ ] 一意な key を付与した
- [ ] warning が再現しないことを確認した

## 6. 検証方法

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/components/organisms/AccountSection/AccountSection.test.tsx
node apps/desktop/scripts/capture-task-fix-safeinvoke-timeout-phase11.mjs
```

## 7. リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                           |
| ------------------------------------ | ------ | -------- | ------------------------------ |
| index を key にして warning だけ消す | 低     | 中       | provider id など安定キーを使う |

## 8. 参照情報

- `apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx`
- `docs/30-workflows/TASK-FIX-SAFEINVOKE-TIMEOUT-001/outputs/phase-11/discovered-issues.md`

## 9. 備考

screen verification で見つかった React warning の formalization。
