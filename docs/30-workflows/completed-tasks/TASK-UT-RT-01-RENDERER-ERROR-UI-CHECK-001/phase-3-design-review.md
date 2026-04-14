# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 3                                            |
| タスクID   | TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001    |
| タスク名   | Renderer 側エラーメッセージ UI 表示 E2E 確認 |
| 前提Phase  | Phase 2                                      |
| 後続Phase  | Phase 4（PASS時）/ Phase 2（MAJOR判定時）    |
| 作成日     | 2026-04-13                                   |
| ステータス | pending                                      |

## 目的

Phase 2 の設計内容をレビューし、Phase 4（テスト作成）へ進めるかを判定するゲートを通過する。

## レビュー観点

### 必須チェック項目

| カテゴリ     | チェック項目                                                              | 判定 |
| ------------ | ------------------------------------------------------------------------- | ---- |
| 矛盾         | 受け入れ基準（TC-01〜TC-04）とテスト設計（UT-01〜UT-05）が整合しているか  | -    |
| モック安全性 | `vi.stubGlobal("window", ...)` 使用禁止が守られているか（[FB-VSCPKR-02]） | -    |
| 命名規則     | 既存コンポーネントの命名規則と整合しているか（[FB-SDK-07-4]）             | -    |
| IPC契約      | `onWorkflowStateChanged` の variadic シグネチャが正しく設計されているか   | -    |
| 境界定義     | Renderer/Store/IPC の責務境界が混在していないか                           | -    |
| スコープ     | Main 層・IPC ブリッジの実装変更がスコープ外として除外されているか         | -    |
| テスト環境   | Vitest + testing-library の既存環境で実行可能か                           | -    |

### ゲート判定基準

| 判定  | 条件                                       | 対応                   |
| ----- | ------------------------------------------ | ---------------------- |
| PASS  | 全チェック項目が PASS、MINOR 指摘が3件以下 | Phase 4 へ進む         |
| MINOR | 軽微な指摘あり（機能影響なし）             | 指摘を未タスク化し進む |
| MAJOR | 設計に重大な矛盾・漏れあり（機能影響あり） | Phase 2 に差し戻し     |

## 矛盾チェック表

| 観点           | Phase 1 要件                                  | Phase 2 設計                             | 整合 |
| -------------- | --------------------------------------------- | ---------------------------------------- | ---- |
| テスト対象     | SkillLifecyclePanel.tsx のエラー表示経路      | UT-01〜UT-05 で同経路をカバー            | -    |
| モック対象     | window.skillCreatorAPI.onWorkflowStateChanged | Object.defineProperty でモック           | -    |
| エラー優先順位 | localError ?? workflowError ?? skillError     | UT-04 で優先順位を検証                   | -    |
| スコープ外     | Main 層の実装変更は対象外                     | テスト設計が Main 層に触れていないか確認 | -    |

## 参照資料

| 参照資料       | パス                                         | 説明           |
| -------------- | -------------------------------------------- | -------------- |
| 要件定義書     | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物 |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`     | Phase 1 成果物 |
| テスト設計書   | `outputs/phase-2/test-design.md`             | Phase 2 成果物 |
| アプローチ選定 | `outputs/phase-2/approach-selection.md`      | Phase 2 成果物 |
| テスト戦略     | `outputs/phase-2/test-strategy.md`           | Phase 2 成果物 |

## 実行手順

1. Phase 1・Phase 2 の全成果物を読み込む
2. 矛盾チェック表の各項目を確認する
3. モック安全性（`vi.stubGlobal` 禁止）を確認する
4. ゲート判定（PASS / MINOR / MAJOR）を下す
5. MINOR 指摘がある場合は未タスク化する
6. 結果を `outputs/phase-3/` に出力する

## 成果物

| 成果物           | パス                                         | 説明               |
| ---------------- | -------------------------------------------- | ------------------ |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md`    | チェック項目の判定 |
| ゲート判定       | `outputs/phase-3/gate-decision.md`           | PASS/MINOR/MAJOR   |
| 矛盾チェック表   | `outputs/phase-3/contradiction-checklist.md` | 矛盾チェック結果   |

## 完了条件

- [ ] 全チェック項目に判定を記録した
- [ ] ゲート判定（PASS / MINOR / MAJOR）を記録した
- [ ] MINOR 指摘があれば未タスク化した
- [ ] MAJOR 判定の場合は Phase 2 差し戻しを記録した
- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] ゲート判定が記録されている
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001
```

## 次のPhase

Phase 4: テスト作成（PASS 判定時）
