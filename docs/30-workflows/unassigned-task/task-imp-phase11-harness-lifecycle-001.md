# UT-IMP-PHASE11-HARNESS-LIFECYCLE-001: Phase 11 harness ファイルのライフサイクル管理

## メタ情報

```yaml
issue_number: 1130
task_id: UT-IMP-PHASE11-HARNESS-LIFECYCLE-001
task_name: Phase 11 harness ファイルのライフサイクル管理
category: 改善
target_feature: Phase 11 dedicated harness 運用
priority: 低
scale: 小規模
status: 未実施
source_phase: TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 Phase 12
created_date: 2026-03-10
```

| 項目         | 値                                                             |
| ------------ | -------------------------------------------------------------- |
| タスクID     | UT-IMP-PHASE11-HARNESS-LIFECYCLE-001                           |
| タスク名     | Phase 11 harness ファイルのライフサイクル管理                  |
| 分類         | 改善                                                           |
| 対象機能     | `apps/desktop/src/renderer/phase11-*.tsx` / screenshot scripts |
| 優先度       | 低                                                             |
| 見積もり規模 | 小規模                                                         |
| ステータス   | 未実施                                                         |
| 発見元       | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 Phase 12             |
| 発見日       | 2026-03-10                                                     |

## 1. なぜこのタスクが必要か（Why）

Phase 11 の専用 harness は監査に有効だが、増え続けると本番コードとの境界が曖昧になり、不要ファイルや重複モックの温床になる。

## 2. 何を達成するか（What）

- harness 命名規約・配置規約・削除条件を定義する
- Phase 完了後も残すべき harness と一時ファイルを区別する
- screenshot script と renderer harness の対応表を整備する

## 3. どのように実行するか（How）

### 3.1 前提条件

- 既存の `phase11-*.tsx` / `capture-*.mjs` の実在を確認していること

### 3.2 依存タスク

- なし

### 3.3 推奨アプローチ

1. harness を「継続利用」「一時利用」「削除候補」に分類する
2. 規約を task-specification / aiworkflow requirements の双方に反映する
3. 新規 harness 追加時の最低要件をテンプレート化する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                       | 解決策                           | 教訓                                                |
| -------------------------- | -------------------------------- | --------------------------------------------------- |
| harness が場当たりで増える | 命名・配置・保存基準を先に決める | 画面検証を強化すると harness 自体の管理が必要になる |

## 4. 実行手順

1. `apps/desktop/src/renderer/phase11-*.tsx` と `apps/desktop/scripts/capture-*.mjs` を棚卸しする
2. 保守対象・暫定対象・削除候補を分類する
3. 規約を system spec / skill reference に追記する

## 5. 完了条件チェックリスト

- [ ] harness 一覧と用途が整理されている
- [ ] 配置・命名・寿命のルールが文書化されている
- [ ] 今後の Phase 11 追加分に同ルールを適用できる

## 6. 検証方法

```bash
rg --files apps/desktop/src/renderer | rg "phase11-"
rg --files apps/desktop/scripts | rg "capture-.*phase11"
```

## 7. リスクと対策

| リスク                             | 影響度 | 発生確率 | 対策                                 |
| ---------------------------------- | ------ | -------- | ------------------------------------ |
| 監査用コードが本番コードと混線する | 中     | 中       | 命名規約と配置規約で境界を明確化する |

## 8. 参照情報

- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `apps/desktop/src/renderer/phase11-auth-mode.tsx`
- `apps/desktop/src/renderer/phase11-safeinvoke-timeout.tsx`

## 9. 備考

監査品質を上げるタスクであり、個別機能の仕様変更は含まない。
