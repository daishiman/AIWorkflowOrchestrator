# [#1631] "[UT-WORKSPACE-MOCK-CONTROLLER-DEDUP-001] [UT"

## メタ情報

```yaml
task_id: UT-WORKSPACE-MOCK-CONTROLLER-DEDUP-001
task_name: [UT
category: -
target_feature: -
priority: 低
scale: -
status: 未実施
source_phase: TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION 30種思考法分析（2026-03-23）
created_date: 2026-03-25
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-ut-workspace-mock-controller-dedup-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 背景・目的

`apps/desktop/src/renderer/views/WorkspaceView/__tests__/` 配下に複数のテストファイルが存在し、それぞれが `createMockController()` ファクトリ関数を独立に定義している。

現在の重複箇所:

- `WorkspaceChatPanel.guidance.test.tsx`: `createMockController()` を定義
- `WorkspaceChatPanel.integration.test.tsx`: 同一シグネチャの `createMockController()` を定義

今後 WorkspaceView 関連テストが追加されるたびに、同じファクトリが複製されて乖離リスクが高まる。`WorkspaceChatController` のインターフェースに変更があった場合、全ファイルを個別に修正する必要がある。

本タスクは `createMockController()` を共通テストヘルパーファイルに抽出し、DRY 原則を確保することを目的とする。

## 実装方針

1. 共通ヘルパーファイルの作成
   - `apps/desktop/src/renderer/views/WorkspaceView/__tests__/testHelpers.ts` を作成する
   - `createMockController(overrides?: Partial<WorkspaceChatController>)` を定義する

2. 既存テストファイルからの抽出
   - `WorkspaceChatPanel.guidance.test.tsx` のローカル `createMockController` を共通ヘルパーの import に置き換える
   - `WorkspaceChatPanel.integration.test.tsx` も同様に置き換える

3. インターフェース変更時の一括対応
   - `WorkspaceChatController` に新しいプロパティが追加された場合、`testHelpers.ts` のみ修正すれば全テストに反映される

## 受け入れ基準

- [ ] `__tests__/testHelpers.ts` に `createMockController()` が定義されている
- [ ] `guidance.test.tsx` と `integration.test.tsx` が共通ヘルパーを import している
- [ ] `grep -rn "createMockController" apps/desktop/src/renderer/views/WorkspaceView/` で定義が1箇所のみである
- [ ] 全既存テストが PASS のままである（リグレッションなし）
- [ ] `pnpm typecheck` がエラーなしで通過する

## 苦戦箇所・知見（該当がある場合）

- P21/P35（DI追加時のテストモック大規模修正）パターンの予防策として、ファクトリを共通化しておくと将来の `WorkspaceChatController` インターフェース変更時の修正箇所が1箇所に集約される
- P9（モジュールスコープ変数のテスト間リーク）に注意し、共通ヘルパーは状態を持たないファクトリ関数として実装すること。`beforeEach` でのリセットは各テストファイル側で行う

## 参照資料

- `apps/desktop/src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.guidance.test.tsx`
- `apps/desktop/src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.integration.test.tsx`
- `.claude/rules/06-known-pitfalls.md#P21`
- `.claude/rules/06-known-pitfalls.md#P35`
- `.claude/rules/02-code-quality.md#テスト設計の注意`
