# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 8                                        |
| 機能名 | UT-SC-02-005-preload-execute-type-update |
| 作成日 | 2026-03-25                               |

## 目的

動作を変えずにコード品質を改善する。TDD の Refactor フェーズとして、テストが全て PASS する状態を維持しながら、import 文の整理や型ナロイングパターンの共通化を検討・実施する。

## 背景

Phase 5 で実装した型修正と型ナロイングは機能的に正しいが、不要な import が残存している可能性や、plan/improve/execute で重複する型ナロイングパターンの共通化余地がある。リファクタリングによりコードの保守性を向上させる。

## 実行タスク

- タスク1: import 文の整理
- タスク2: terminal_handoff 型ナロイングパターンの共通化検討
- タスク3: リファクタリング後のテスト回帰確認

---

### タスク1: import 文の整理

**目的**: 不要な `RuntimeSkillCreatorExecuteResult` の import を削除し、import 文を整理する。

**対象ファイル**: `apps/desktop/src/preload/skill-creator-api.ts`

**確認手順**:

```bash
# RuntimeSkillCreatorExecuteResult の使用箇所を確認
grep -n "RuntimeSkillCreatorExecuteResult" apps/desktop/src/preload/skill-creator-api.ts

# RuntimeSkillCreatorExecuteResult が他で使用されていないか確認
grep -rn "RuntimeSkillCreatorExecuteResult" apps/desktop/src/preload/
```

**判断基準**:

| 状況                                                    | アクション                            |
| ------------------------------------------------------- | ------------------------------------- |
| `RuntimeSkillCreatorExecuteResult` が未使用             | import から削除                       |
| `RuntimeSkillCreatorExecuteResult` が他で使用されている | import を維持（コメントで理由を記載） |

---

### タスク2: terminal_handoff 型ナロイングパターンの共通化検討

**目的**: plan/improve/execute で重複する `terminal_handoff` 型ナロイングパターンがあれば共通化を検討する。

**確認手順**:

```bash
# 3メソッドの型ナロイングパターンを比較
grep -B3 -A8 "terminal_handoff" apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

**検討内容**:

| 共通化案                                      | 採否 | 理由                                                             |
| --------------------------------------------- | ---- | ---------------------------------------------------------------- |
| ヘルパー関数 `isTerminalHandoff(data)` を作成 | 検討 | 型ガード関数として再利用可能。ただし小規模修正のスコープ内か判断 |
| インラインの `"type" in` チェックを維持       | 検討 | シンプルで読みやすい。重複が少なければこちらを採用               |
| 共通化は別タスクとして切り出し                | 検討 | 本タスクのスコープを超える場合は未タスクとして登録               |

**判断基準**:

- plan/improve/execute の3箇所で全く同じパターンが使われている場合 → 型ガード関数の抽出を検討
- 2箇所以下、または微妙に異なるパターンの場合 → インラインを維持し、共通化は別タスクとして登録

---

### タスク3: リファクタリング後のテスト回帰確認

**目的**: リファクタリング後も全テストが PASS することを確認する。

**確認コマンド**:

```bash
# 全テスト実行
pnpm --filter @repo/desktop exec vitest run

# 型チェック
pnpm typecheck
```

**期待結果**:

- 全テストが PASS（Phase 4-6 で作成した全テストを含む）
- `pnpm typecheck` が PASS（型エラー 0件）
- リファクタリング前後でテスト結果に差異がないこと

---

## TDD 検証: Refactor 状態の確認

リファクタリング後もテストが全て PASS することを確認し、TDD サイクル（Red → Green → Refactor）を完了させる。

```bash
# Refactor 状態の確認
pnpm --filter @repo/desktop exec vitest run --reporter=verbose
pnpm typecheck
```

## 参照資料

| 参照資料               | パス                                         | 内容                     |
| ---------------------- | -------------------------------------------- | ------------------------ |
| Phase 1 要件定義       | `outputs/phase-1/requirements-definition.md` | 受け入れ基準と制約       |
| Phase 2 設計書         | `phase-2-design.md`                          | 影響範囲と変更内容の設計 |
| Phase 5 実装           | `phase-5-implementation.md`                  | 実装内容の詳細           |
| Phase 6 テスト拡充結果 | `outputs/phase-6/test-expansion-results.md`  | 追加回帰ケース           |
| Phase 7 カバレッジ     | `phase-7-coverage-check.md`                  | カバレッジ基準達成状況   |

## 統合テスト連携【必須】

リファクタリング後の統合ポイント検証:

| 統合ポイント               | 検証内容                                                   | ステータス |
| -------------------------- | ---------------------------------------------------------- | ---------- |
| Preload → Main IPC 通信    | import 整理後も IPC 通信に影響がないこと                   | 未実施     |
| Renderer → Preload API呼出 | 型ナロイング共通化（実施した場合）後も動作に変更がないこと | 未実施     |
| 全テスト回帰確認           | リファクタリング後に Phase 4-6 の全テストが PASS すること  | 未実施     |

## 成果物

| 成果物               | パス                                 | 説明                       |
| -------------------- | ------------------------------------ | -------------------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md` | 実施した変更と判断の記録   |
| 未タスク（必要時）   | `docs/30-workflows/unassigned-task/` | 共通化を別タスクとした場合 |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 適用判断 | 仕様参照先                                             |
| ------------------ | -------- | ------------------------------------------------------ |
| セキュリティ       | 適用     | `aiworkflow-requirements: security-api-electron.md`    |
| アーキテクチャ     | 適用     | `aiworkflow-requirements: architecture-*.md`           |
| API設計            | 適用     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| エラーハンドリング | 適用     | `aiworkflow-requirements: error-handling.md`           |
| UI/UX              | 非適用   | -                                                      |
| データ整合性       | 非適用   | -                                                      |
| パフォーマンス     | 非適用   | -                                                      |
| アクセシビリティ   | 非適用   | -                                                      |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断 | 仕様参照先                                             |
| -------------------------- | -------- | ------------------------------------------------------ |
| IPC通信                    | 適用     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | 適用     | `aiworkflow-requirements: security-api-electron.md`    |
| フロントエンド（Renderer） | 適用     | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | 非適用   | -                                                      |
| ローカルストレージ         | 非適用   | -                                                      |

## 完了条件

- [ ] import 文の整理が完了している（不要な import が削除されている）
- [ ] terminal_handoff 型ナロイングパターンの共通化が検討され、判断結果が記録されている
- [ ] リファクタリング後も全テストが PASS している
- [ ] `pnpm typecheck` が PASS している
- [ ] リファクタリング前後でテスト結果に差異がないことが確認されている
- [ ] TDD サイクル（Red → Green → Refactor）が完了している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

- [ ] タスク1: import 文の整理完了
- [ ] タスク2: terminal_handoff 型ナロイングパターンの共通化検討完了
- [ ] タスク3: リファクタリング後のテスト回帰確認完了
- [ ] TDD Refactor 状態確認完了

## 次Phase

Phase 9: 品質保証
