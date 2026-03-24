# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                             |
| ------ | ---------------------------------------------- |
| Phase  | 4                                              |
| 機能名 | ut-imp-navcontract-execution-console-entry-001 |
| 作成日 | 2026-03-24                                     |

## 目的

Phase 5 実装前に、executionConsole エントリ追加に対するテストケースを設計し、既存テストの期待値更新方針を定める。

## 実行タスク

- テストケース設計: TC-01〜TC-08の全テストケースを設計し、Before/After/根拠を明確化する
- 既存テスト影響特定: navContract.test.ts と types.test.ts の変更箇所を特定する
- テスト実行手順定義: TDD Redフェーズの手順（既存テスト確認→テスト更新→FAIL確認）を定義する

## 参照資料

| 資料名       | パス                                                       |
| ------------ | ---------------------------------------------------------- |
| Phase 2 設計 | `phase-2-design.md`                                        |
| 現行テスト   | `apps/desktop/src/renderer/navigation/navContract.test.ts` |
| 型テスト     | `apps/desktop/src/renderer/store/types.test.ts`            |

## テストケース一覧

### TC-01: NAV_SECTIONS items count 更新

| 項目   | 内容                                                 |
| ------ | ---------------------------------------------------- |
| 対象   | `navContract.test.ts` L43                            |
| Before | `expect(...items.length).toEqual([6, 2, 1])`         |
| After  | `expect(...items.length).toEqual([6, 3, 1])`         |
| 根拠   | sub セクションに executionConsole を追加（6+3+1=10） |

### TC-02: APP_DOCK_NAV_ITEMS id 配列更新

| 項目   | 内容                                                                            |
| ------ | ------------------------------------------------------------------------------- |
| 対象   | `navContract.test.ts` L49-59                                                    |
| Before | 9 項目（dashboard〜settings）                                                   |
| After  | 10 項目（editor の後に `"executionConsole"` を追加）                            |
| 根拠   | sub セクションの末尾に配置するため、editor → executionConsole → settings の順序 |

### TC-03: shortcut 配列更新

| 項目   | 内容                                         |
| ------ | -------------------------------------------- |
| 対象   | `navContract.test.ts` L60-70                 |
| Before | 9 shortcut（Cmd+1〜Cmd+8, Cmd+,）            |
| After  | 10 shortcut（Cmd+8 の後に `"Cmd+9"` を追加） |
| 根拠   | Cmd+9 を executionConsole に割当             |

### TC-04: MOBILE_SECONDARY_NAV_ITEMS 更新

| 項目   | 内容                                                               |
| ------ | ------------------------------------------------------------------ |
| 対象   | `navContract.test.ts` L81-86                                       |
| Before | 4 項目（historySearch, graph, editor, settings）                   |
| After  | 5 項目（historySearch, graph, editor, executionConsole, settings） |
| 根拠   | `isMobilePrimary` 未設定（= false）なので secondary に分類         |

### TC-05: NAV_SHORTCUT_TO_VIEW length 更新

| 項目   | 内容                                       |
| ------ | ------------------------------------------ |
| 対象   | `navContract.test.ts` L209                 |
| Before | `toHaveLength(9)` + `new Set().size = 9`   |
| After  | `toHaveLength(10)` + `new Set().size = 10` |
| 根拠   | `"9": "executionConsole"` を追加           |

### TC-06: Cmd+9 ショートカット解決テスト（新規）

| 項目   | 内容                                                                                |
| ------ | ----------------------------------------------------------------------------------- |
| 対象   | `navContract.test.ts` `getViewFromNavigationShortcut` describe 内に追加             |
| テスト | `getViewFromNavigationShortcut({ key: "9", metaKey: true })` → `"executionConsole"` |
| 根拠   | 新規ショートカットの正常動作を検証                                                  |

### TC-07: ViewType existingViewTypes length 更新

| 項目   | 内容                                                                 |
| ------ | -------------------------------------------------------------------- |
| 対象   | `types.test.ts` L61-78                                               |
| Before | `existingViewTypes` に15項目、`toHaveLength(15)`                     |
| After  | `existingViewTypes` に `"executionConsole"` 追加、`toHaveLength(16)` |
| 根拠   | `executionConsole` は既に `ViewType` に追加済みだがテスト未反映      |

### TC-08: ViewType allViewTypes length 更新

| 項目   | 内容                                                            |
| ------ | --------------------------------------------------------------- |
| 対象   | `types.test.ts` L82-101                                         |
| Before | `allViewTypes` に17項目、`toHaveLength(17)`                     |
| After  | `allViewTypes` に `"executionConsole"` 追加、`toHaveLength(18)` |
| 根拠   | ViewType union の全 member を網羅するテスト                     |

## 実行手順

### ステップ 1: 既存テストの現状確認

```bash
cd apps/desktop && pnpm vitest run src/renderer/navigation/navContract.test.ts src/renderer/store/types.test.ts
```

### ステップ 2: テストコード更新

TC-01〜TC-08 の変更を適用する。この時点ではテストは FAIL する（実装が未完了のため）。

### ステップ 3: テスト FAIL 確認

TDD の Red フェーズとして、テストが期待通りに FAIL することを確認する。

## 多角的チェック観点

| 観点        | 適用 | 確認事項                                                     |
| ----------- | ---- | ------------------------------------------------------------ |
| 型安全      | 適用 | テスト内のDockViewType・ViewType期待値が型定義と整合すること |
| P40準拠     | 適用 | テスト実行はapps/desktop/ディレクトリから行うこと            |
| P47準拠     | N/A  | CSS変数ベースのスタイルテストは本タスクのスコープ外          |
| TDD Red確認 | 適用 | テスト更新後、実装前にFAILすることを確認すること             |

## 統合テスト連携

navContract の変更は GlobalNavStrip コンポーネントに影響する。Phase 6 で以下を検証:

| テスト項目                 | 確認内容                                   | 期待結果                                     |
| -------------------------- | ------------------------------------------ | -------------------------------------------- |
| GlobalNavStripレンダリング | 新しいnav itemが正しくレンダリングされるか | executionConsoleがsub セクションに表示される |
| ショートカットキー動作     | Cmd+9が正しく動作するか                    | executionConsoleビューに遷移する             |
| モバイルナビ分類           | secondary nav itemsに正しく含まれるか      | MOBILE_SECONDARY_NAV_ITEMSに5項目存在する    |

## 成果物

| 成果物                  | パス                                                       | 説明                                                     |
| ----------------------- | ---------------------------------------------------------- | -------------------------------------------------------- |
| navContract.test.ts変更 | `apps/desktop/src/renderer/navigation/navContract.test.ts` | TC-01〜TC-06の期待値更新と新規テスト追加（コード成果物） |
| types.test.ts変更       | `apps/desktop/src/renderer/store/types.test.ts`            | TC-07〜TC-08のViewType member count更新（コード成果物）  |

## 完了条件

- [ ] TC-01〜TC-08 の全テストケースが設計されている
- [ ] 既存テストの変更箇所が特定されている
- [ ] テスト実行手順が定義されている
- [ ] TDD Red確認: テストがFAILすることを確認した（実装前）
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（テストケース設計、既存テスト影響特定、テスト実行手順定義）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次の Phase

Phase 5: 実装
