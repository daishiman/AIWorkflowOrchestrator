# UT-IMP-APP-TEST-MOCK-CENTRALIZATION-001: App.tsx テスト共有モックファクトリ集約

## メタ情報

```yaml
issue_number: 1129
task_id: UT-IMP-APP-TEST-MOCK-CENTRALIZATION-001
task_name: App.tsx テスト共有モックファクトリ集約
category: 改善
target_feature: App.tsx / renderer テストモック基盤
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 Phase 12
created_date: 2026-03-10
```

| 項目         | 値                                                           |
| ------------ | ------------------------------------------------------------ |
| タスクID     | UT-IMP-APP-TEST-MOCK-CENTRALIZATION-001                      |
| タスク名     | App.tsx テスト共有モックファクトリ集約                       |
| 分類         | 改善                                                         |
| 対象機能     | renderer テストの `window.electronAPI` / auth / theme モック |
| 優先度       | 中                                                           |
| 見積もり規模 | 中規模                                                       |
| ステータス   | 未実施                                                       |
| 発見元       | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 Phase 12           |
| 発見日       | 2026-03-10                                                   |

## 1. なぜこのタスクが必要か（Why）

App.tsx 系テストで同系統の mock が分散すると、1 つの API 契約変更で複数テストが別々に壊れ、fix ごとの局所対応が増える。

## 2. 何を達成するか（What）

- renderer テストで使う共通モックファクトリを定義する
- `window.electronAPI` / auth / theme / dialog の重複モックを集約する
- harness と unit test で共有できる最小モック単位を用意する

## 3. どのように実行するか（How）

### 3.1 前提条件

- App.tsx / Settings / AuthGuard 周辺テストの重複モック箇所を把握していること

### 3.2 依存タスク

- なし

### 3.3 推奨アプローチ

1. 既存テストのモック断片を分類する
2. 共通 factory を `src/test/` へ切り出す
3. 代表テストから段階移行して重複量を減らす

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                           | 解決策                               | 教訓                                                    |
| ------------------------------ | ------------------------------------ | ------------------------------------------------------- |
| fix ごとに暫定モックが増殖する | factory 化して差分だけ override する | テスト保守性も backlog として明示管理した方が漏れにくい |

## 4. 実行手順

1. `rg -n "electronAPI|mock.*theme|mock.*auth" apps/desktop/src/**/*.test.* apps/desktop/src/test` で重複箇所を抽出する
2. 共通モックファクトリの置き場所を決める
3. 代表テストを数本移行し、破壊的差分がないことを確認する

## 5. 完了条件チェックリスト

- [ ] 共通モックファクトリが導入されている
- [ ] 代表テストが factory 利用へ移行している
- [ ] 既存テストの API 契約が壊れていない

## 6. 検証方法

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer src/test
rg -n "electronAPI" apps/desktop/src/**/*.test.* apps/desktop/src/test
```

## 7. リスクと対策

| リスク                                       | 影響度 | 発生確率 | 対策                            |
| -------------------------------------------- | ------ | -------- | ------------------------------- |
| factory 化で個別テストの意図が見えにくくなる | 中     | 中       | override 点だけを各テストに残す |
| 移行範囲を広げすぎて回帰が増える             | 中     | 中       | 代表テストから段階移行する      |

## 8. 参照情報

- `apps/desktop/src/test/`
- `apps/desktop/src/renderer/`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

## 9. 備考

本タスクはテスト保守性の改善であり、本番機能差分は含まない。
