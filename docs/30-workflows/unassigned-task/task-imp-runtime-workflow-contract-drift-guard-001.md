# UT-IMP-RUNTIME-WORKFLOW-CONTRACT-DRIFT-GUARD-001: runtime workflow の IPC / preload / shared 契約ドリフトガード強化

## メタ情報

```yaml
issue_number: 1648
task_id: UT-IMP-RUNTIME-WORKFLOW-CONTRACT-DRIFT-GUARD-001
task_name: runtime workflow の IPC / preload / shared 契約ドリフトガード強化
category: 改善
target_feature: Runtime workflow 契約の cross-layer parity test
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-SDK-02 Phase 12 レビュー / 2回確認
created_date: 2026-03-26
dependencies: [TASK-SDK-02]
```

| 項目         | 内容                                                              |
| ------------ | ----------------------------------------------------------------- |
| タスクID     | UT-IMP-RUNTIME-WORKFLOW-CONTRACT-DRIFT-GUARD-001                  |
| タスク名     | runtime workflow の IPC / preload / shared 契約ドリフトガード強化 |
| 分類         | 改善                                                              |
| 対象機能     | `RuntimeSkillCreator*Response` 契約と IPC / preload 公開面        |
| 優先度       | 中                                                                |
| 見積もり規模 | 中規模                                                            |
| ステータス   | 未実施                                                            |
| 発見元       | TASK-SDK-02 Phase 12 レビュー / 2回確認                           |
| 発見日       | 2026-03-26                                                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Task02 では `RuntimeSkillCreatorExecuteResponse` の union 化を導入したが、現在の parity test は shared 型を自己参照するだけで、IPC handler / preload / barrel export の実配線ずれを検出できない。

### 1.2 問題点・課題

- `packages/shared` だけで完結するテストになっており、cross-layer drift を防げない
- Phase 6 で要求した `public contract drift` 観点がテストに十分反映されていない
- 将来 `creatorHandlers.ts` と preload の戻り値がズレても今回の test では落ちない

### 1.3 放置した場合の影響

- 過去に発生した IPC/preload/shared 型ズレが再発する
- system spec が「更新済み」に見えても public surface だけ古いまま残る
- Renderer 実装が type narrowing を誤り、runtime handoff を誤処理する

---

## 2. 何を達成するか（What）

### 2.1 目的

runtime workflow 契約を shared 自己整合ではなく、Main / Preload / shared の実接続で検証する。

### 2.2 最終ゴール

- `RuntimeSkillCreator*Response` が shared / IPC handler / preload API で同一 shape を要求される
- barrel export 欠落や戻り値 drift が targeted test で即検出される
- Task02 の Phase 6 仕様と実テストが一致する

### 2.3 スコープ

#### 含むもの

- parity test の再設計
- IPC handler / preload / shared 型の cross import 検証
- public error envelope / terminal_handoff shape の回帰テスト

#### 含まないもの

- workflow engine 内部状態の詳細テスト
- UI の描画テスト

### 2.4 成果物

- cross-layer parity test
- Phase 6 / Phase 7 文書の同期

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `creatorHandlers.ts`、`skill-creator-api.ts`、`packages/shared/src/types/skillCreator.ts` の現行契約を理解している

### 3.2 依存タスク

- TASK-SDK-02

### 3.3 必要な知識

- `.agents/skills/aiworkflow-requirements/references/api-ipc-system-core.md`
- `.agents/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`
- `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/phase-6-test-expansion.md`

### 3.4 推奨アプローチ

1. shared 型の自己整合テストを残しつつ、cross-layer 契約テストを追加する
2. `terminal_handoff`、success result、error envelope をそれぞれ独立に検証する
3. 仕様上の public surface とテスト対象を 1 対 1 で対応づける

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                           | 発見経緯                                 | 解決策                                                       | 教訓                                         |
| -------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------ | -------------------------------------------- |
| parity test が「自分自身の型」を見て満足していた               | review で shared only test と判明        | handler / preload を import した cross-layer test へ拡張する | contract parity は層を跨いで初めて意味を持つ |
| validator PASS が public contract 実装済みの証明になっていない | Phase 12 compliance が存在確認中心だった | Phase 6 で要求した drift case を explicit test 化する        | 「ファイルがある」と「契約が守られる」は別物 |

---

## 4. 実行手順

### Phase A: 現行 contract map 作成

1. shared / IPC / preload の response type と channel を一覧化する
2. `terminal_handoff`、success、error の3経路を比較する

### Phase B: parity test 改修

1. shared only test を cross-layer assertion へ拡張する
2. barrel export を含む import path で compile-time drift を検知する
3. IPC / preload 既存 runtime test に型観点の assertion を追加する

### Phase C: 文書同期

1. Phase 6 の `public contract drift` 観点を実テスト名へ反映する
2. Phase 7 coverage summary に contract coverage を追記する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] shared / IPC / preload の戻り値 drift を検出できる
- [ ] `terminal_handoff` union shape の変更がテストで落ちる
- [ ] barrel export 欠落が検知される

### 品質要件

- [ ] shared only の自己整合テストに依存していない
- [ ] Phase 6 の要求観点がテストケース名と一致している

### ドキュメント要件

- [ ] Phase 6 / 7 文書が実テスト内容に同期している

---

## 6. 検証方法

### テストケース

- Case 1: handler 戻り値型が shared union と一致する
- Case 2: preload API 戻り値型が shared union と一致する
- Case 3: `terminal_handoff` bundle / guidance の shape drift を検出できる

### 検証手順

```bash
ESBUILD_BINARY_PATH=$PWD/node_modules/.pnpm/esbuild@0.21.5/node_modules/esbuild/bin/esbuild \
  pnpm vitest run \
  apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.runtime.test.ts \
  apps/desktop/src/preload/__tests__/skill-creator-api.runtime.test.ts \
  packages/shared/src/types/__tests__/skillCreator.contract-parity.test.ts
```

---

## 7. リスクと対策

| リスク                                               | 影響度 | 発生確率 | 対策                                                            |
| ---------------------------------------------------- | ------ | -------- | --------------------------------------------------------------- |
| テストが shared 内に閉じたまま再度形骸化する         | 中     | 中       | cross import を必須化し、層を跨ぐ assertion を追加する          |
| runtime test と type test が重複し保守コストが増える | 低     | 中       | type drift と runtime envelope を役割分担してテスト名に明記する |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/phase-6-test-expansion.md`
- `.agents/skills/aiworkflow-requirements/references/api-ipc-system-core.md`
- `.agents/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`

### 参考資料

- `apps/desktop/src/main/ipc/creatorHandlers.ts`
- `apps/desktop/src/preload/skill-creator-api.ts`
- `packages/shared/src/types/skillCreator.ts`

---

## 9. 備考

### レビュー指摘の原文（要約）

> `skillCreator.contract-parity.test.ts` は shared 自己整合しか見ておらず、IPC / preload drift を防げない。
