# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 8                                  |
| 機能名 | store-lifecycle-integration-design |
| 作成日 | 2026-03-06                         |

## 目的

Phase 5-7 で実装・テスト・カバレッジ確認を完了した selector/action のコード品質を改善し、保守性とパフォーマンスを向上させる。

## 実行タスク

- selector のメモ化最適化を検討・適用する
- action の共通エラーハンドリングパターンを抽出する
- 命名規約の統一を確認する
- 不要なコードの削除と整理を行う

## 参照資料

| 参照資料       | パス                                                                                        | 使用目的                 |
| -------------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 1 成果物 | `outputs/phase-1/requirements-definition.md`                                                | 要件定義書               |
| Phase 2 成果物 | `outputs/phase-2/architecture-design.md`                                                    | 設計書                   |
| Phase 5 成果物 | `phase-5-implementation.md`                                                                 | 実装内容の確認           |
| Phase 6 成果物 | `outputs/phase-6/coverage-report.md`                                                        | テスト拡充結果           |
| Phase 7 成果物 | `phase-7-coverage-check.md`                                                                 | カバレッジ結果の確認     |
| 状態管理仕様   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | selector/action パターン |
| 実装パターン   | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | リファクタリングパターン |

## 実行手順

### Step 1: Selector メモ化最適化

#### 1-1. 再計算頻度の分析

各 selector の再計算タイミングを確認し、不要な再計算を抑制する。

| Selector                      | 再計算トリガー                                     | 最適化方針                               |
| ----------------------------- | -------------------------------------------------- | ---------------------------------------- |
| `useAvailableSkillsForImport` | `availableSkills` または `importedSkills` の変更   | 依存状態が変わらなければ前回の結果を返す |
| `useFilteredAvailableSkills`  | available + `skillFilter` + `skillCategory` の変更 | 多段フィルタの計算量を確認               |

#### 1-2. Zustand selector の shallow 比較

- 配列を返す selector は `useShallow` でラップすることを検討する
- ただし、参照の安定性が既に確保されている場合は不要
- 実測値: 100件のスキルリストでフィルタ計算が 1ms 未満であれば最適化不要

#### 1-3. 過剰メモ化の回避

- selector 内で `useMemo` を使用しない（Zustand の selector 関数自体がメモ化の単位）
- 不要な `useCallback` ラップを削除する
- シンプルな状態アクセス（`state.isImporting`）には shallow 比較不要

### Step 2: Action エラーハンドリングの共通化

#### 2-1. 共通パターンの抽出

import/remove/create/analyze で共通するエラーハンドリングパターンを確認する。

| 共通パターン                  | 現在の実装             | リファクタリング方針                          |
| ----------------------------- | ---------------------- | --------------------------------------------- |
| try-catch + skillError セット | 各 action 内で個別実装 | パターンが3箇所以上重複する場合のみ共通関数化 |
| isXxx フラグの set/reset      | 各 action で手動管理   | フラグ管理が複雑でなければ現状維持            |

#### 2-2. 抽出の判断基準

- 共通化するのは **3箇所以上で同一パターンが繰り返される場合のみ**
- 2箇所の重複は共通化せず、そのまま維持する（過剰抽象化の回避）
- エラーメッセージのフォーマットが統一されていることを確認する

### Step 3: 命名規約の統一確認

#### 3-1. チェックリスト

| 確認項目                                  | 期待値                                             |
| ----------------------------------------- | -------------------------------------------------- |
| 個別セレクタがドメインサフィックスを持つ  | `useIsImportingSkill`（`useIsImporting` ではない） |
| アクションセレクタが動詞 + 対象パターン   | `useImportSkill`、`useRemoveSkill`                 |
| 汎用名が使われていない                    | `useError` ではなく `useSkillError`                |
| 型名が State/Actions/Slice パターンに従う | `AgentState`、`AgentActions`、`AgentSlice`         |

#### 3-2. 既存セレクタとの整合

- 新規追加した selector と既存の Agent Store selector（25個）の命名が一貫していること
- 既存の `useImportedSkills` との命名衝突がないこと

### Step 4: 不要コードの削除

| 確認対象                       | 対応                                    |
| ------------------------------ | --------------------------------------- |
| 直接 IPC 呼び出しの残存        | 完全削除（store action 経由に統一済み） |
| 使用されていない import 文     | 削除                                    |
| コメントアウトされたコード     | 削除（git 履歴で復元可能）              |
| `console.log` / `console.warn` | テスト汚染防止のため削除（P20 準拠）    |

### Step 5: テスト再実行

リファクタリング後に全テストが PASS することを確認する。

```bash
cd apps/desktop
pnpm exec vitest run src/renderer/store/slices/__tests__/agentSlice*.test.ts
```

## 統合テスト連携

- リファクタリングは外部インターフェースを変更しない（内部改善のみ）
- Phase 4-6 の全テストが PASS することを確認する
- P31 回帰テストが PASS することを確認する

## 多角的チェック観点

| 観点           | チェック内容                                  |
| -------------- | --------------------------------------------- |
| パフォーマンス | selector の再計算が最適化されていること       |
| 保守性         | 命名規約が統一されていること                  |
| 簡潔性         | 不要なコード・過剰抽象化がないこと            |
| 回帰           | リファクタリング後に全テストが PASS すること  |
| P20            | console.log / console.warn が残っていないこと |

## 成果物

| 成果物                          | パス                                                   | 説明             |
| ------------------------------- | ------------------------------------------------------ | ---------------- |
| リファクタリング済み agentSlice | `apps/desktop/src/renderer/store/slices/agentSlice.ts` | コード品質改善   |
| リファクタリング済みセレクタ    | `apps/desktop/src/renderer/store/index.ts`             | 命名統一・最適化 |

## 完了条件

- [ ] selector のメモ化最適化が検討・適用されている（または不要と判断した根拠が記録されている）
- [ ] action のエラーハンドリングが統一されている
- [ ] 命名規約（ドメインサフィックス、動詞+対象）が全セレクタで統一されている
- [ ] 不要コード（直接IPC、未使用import、console.log）が削除されている
- [ ] リファクタリング後に全テストが PASS する
- [ ] 外部インターフェースに変更がないこと

## 次のPhase

Phase 9: 品質保証 (`phase-9-quality-assurance.md`)
