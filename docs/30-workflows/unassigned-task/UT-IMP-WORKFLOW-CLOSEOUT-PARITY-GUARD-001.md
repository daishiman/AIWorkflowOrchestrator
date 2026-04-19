# UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001: workflow close-out parity guard

## メタ情報

| 項目         | 内容                                                                                |
| ------------ | ----------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001                                           |
| タスク名     | workflow close-out parity guard                                                     |
| 分類         | 改善                                                                                |
| 対象機能     | Phase 12 close-out 運用（`index.md` / `artifacts.json` / `outputs/artifacts.json`） |
| 優先度       | 高                                                                                  |
| 見積もり規模 | 中規模                                                                              |
| ステータス   | 未実施                                                                              |
| 発見元       | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001 Phase 12 再監査                 |
| 発見日       | 2026-04-18                                                                          |
| issue_number | 2293                                                                                |

## 1. なぜこのタスクが必要か（Why）

Phase 12 成果物が `completed` を主張していても、workflow 正本の `index.md` と root `artifacts.json` が `pending` のまま残るドリフトが発生した。close-out の単一真実源が壊れると、完了判定そのものが不安定になる。

## 2. 何を達成するか（What）

1. `index.md` frontmatter と Phase 表を `artifacts.json` と同時更新する
2. root `artifacts.json` と `outputs/artifacts.json` を同一内容で閉じる
3. Phase 12 compliance で parity を自己申告ではなく実測確認へ固定する

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` の close-out スクリプト群を実行できること
- workflow ごとの canonical output 名が確定していること

### 3.2 依存タスク

- なし

### 3.3 必要な知識

- `phase-12-documentation-guide.md`
- `patterns-phase12-sync.md`
- `artifacts.json` の phase artifact 構造

### 3.4 推奨アプローチ

1. close-out 完了時に `index.md` / root `artifacts.json` / `outputs/artifacts.json` を同じターンで更新する
2. parity 不一致を検出する validator または static check を追加する
3. skill feedback を `task-specification-creator` 側へ還流する

### 3.5 実装課題と解決策

| 課題                                  | 解決策                                              |
| ------------------------------------- | --------------------------------------------------- |
| outputs 側だけ completed になりやすい | root / outputs の両方を比較する guard を導入する    |
| `index.md` が stale でも見逃す        | Phase 表と frontmatter の status も比較対象に含める |
| compliance 文書が虚偽 PASS になり得る | parity 実測値を引用して PASS 判定する               |

## 4. 実行手順

1. 現行 workflow の close-out 更新経路を棚卸しする
2. parity check を設計する
3. validator かテンプレートへ落とし込む
4. `task-specification-creator` / `aiworkflow-requirements` へ教訓を反映する

## 5. 完了条件チェックリスト

- [ ] `index.md` / root `artifacts.json` / `outputs/artifacts.json` の三者同期 guard が定義済み
- [ ] parity 不一致で compliance を PASS にしないルールが明文化済み
- [ ] 再発防止の skill feedback が反映済み

## 6. 検証方法

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js <workflow>
rg -n '"status": "pending"' <workflow>/artifacts.json <workflow>/outputs/artifacts.json
```

## 7. リスクと対策

| リスク                           | 影響度 | 対策                                       |
| -------------------------------- | ------ | ------------------------------------------ |
| close-out の正本が曖昧なまま残る | 高     | 三者同期を validator に昇格する            |
| 同型事故が他 workflow で再発する | 高     | skill 側へ same-wave sync の知見を還流する |

## 8. 参照情報

- `docs/30-workflows/UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001/`
- `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`

## 9. 備考

このタスクは feature 追加ではなく運用品質の改善タスクである。
