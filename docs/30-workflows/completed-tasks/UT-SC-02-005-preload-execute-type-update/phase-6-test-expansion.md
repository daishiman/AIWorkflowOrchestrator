# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 6                                        |
| 機能名 | UT-SC-02-005-preload-execute-type-update |
| 作成日 | 2026-03-25                               |

## 目的

`terminal_handoff` 異常系テストを追加し、回帰チェックを強化する。Phase 4-5 で作成した正常系テストに加え、エッジケースや異常系のカバレッジを拡充する。

## 背景

Phase 5 で実装が完了し Green 状態が確認されたが、異常系やエッジケースのテストが不足している。`terminal_handoff` の `bundle` が不正な値の場合や、`executePlan` のエラーレスポンス（`success: false`）のハンドリング、および plan/improve/execute 間の型ナロイング一貫性の検証が必要である。

## 実行タスク

- タスク1: `terminal_handoff` 異常系テスト追加
- タスク2: `executePlan` エラーレスポンステスト追加
- タスク3: plan/improve/execute 型ナロイング一貫性テスト

---

### タスク1: terminal_handoff 異常系テスト

**目的**: `terminal_handoff` レスポンスの `bundle` が不正な値の場合の動作を検証する。

**テストケース**:

| #   | ケース                                    | 期待結果                              |
| --- | ----------------------------------------- | ------------------------------------- |
| 1   | `bundle` が `undefined` の場合            | エラーにならず早期リターンすること    |
| 2   | `bundle` が空オブジェクト `{}` の場合     | エラーにならず早期リターンすること    |
| 3   | `type` が `"terminal_handoff"` 以外の場合 | 通常の `ExecuteResult` パスに進むこと |

---

### タスク2: executePlan エラーレスポンステスト

**目的**: `executePlan` が `success: false` を返した場合のエラーハンドリングを検証する。

**テストケース**:

| #   | ケース                                          | 期待結果                                                  |
| --- | ----------------------------------------------- | --------------------------------------------------------- |
| 1   | `{ success: false, error: "エラーメッセージ" }` | `setGenerationError` が呼ばれること                       |
| 2   | `{ success: true, data: null }`                 | `setGenerationError` がデフォルトメッセージで呼ばれること |
| 3   | `{ success: false, error: undefined }`          | デフォルトエラーメッセージが設定されること                |

---

### タスク3: plan/improve/execute 型ナロイング一貫性テスト

**目的**: plan/improve/execute の3メソッドで `terminal_handoff` 型ナロイングが一貫したパターンで実装されていることを検証する。

**確認内容**:

```bash
# 3メソッドの型ナロイングパターンを比較
grep -B2 -A5 "terminal_handoff" apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

**テストケース**:

| #   | ケース                                                 | 期待結果                                                 |
| --- | ------------------------------------------------------ | -------------------------------------------------------- |
| 1   | plan が `terminal_handoff` を返す場合の型ナロイング    | `"type" in` パターンで判定されていること                 |
| 2   | improve が `terminal_handoff` を返す場合の型ナロイング | `"type" in` パターンで判定されていること                 |
| 3   | execute が `terminal_handoff` を返す場合の型ナロイング | `"type" in` パターンで判定されていること（Phase 5 実装） |

---

## テスト実行コマンド

```bash
# テスト実行
pnpm --filter @repo/desktop exec vitest run

# 特定テストファイルのみ実行
pnpm --filter @repo/desktop exec vitest run --reporter=verbose
```

## 参照資料

| 参照資料       | パス                        | 内容                              |
| -------------- | --------------------------- | --------------------------------- |
| Phase 2 設計書 | `phase-2-design.md`         | terminal_handoff 型ナロイング設計 |
| Phase 4 テスト | `phase-4-test-creation.md`  | 正常系テストケース定義            |
| Phase 5 実装   | `phase-5-implementation.md` | 実装内容の詳細                    |

## 統合テスト連携【必須】

異常系を含めた統合ポイントのテスト網羅:

| 統合ポイント               | テスト内容                                             | ステータス |
| -------------------------- | ------------------------------------------------------ | ---------- |
| Preload → Main IPC 通信    | エラーレスポンス（`success: false`）のハンドリング     | 未実施     |
| Renderer → Preload API呼出 | `terminal_handoff` 異常系（不正 bundle）のハンドリング | 未実施     |
| 型ナロイング一貫性         | plan/improve/execute で同一パターンの型ナロイング      | 未実施     |

## 成果物

| 成果物           | パス                                        | 説明                       |
| ---------------- | ------------------------------------------- | -------------------------- |
| 拡充テストコード | `apps/desktop/src/**/*.test.ts`             | 異常系・エッジケーステスト |
| テスト結果ログ   | `outputs/phase-6/test-expansion-results.md` | テスト拡充の結果           |

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

- [ ] `terminal_handoff` 異常系テスト（bundle 不正値）が追加されている
- [ ] `executePlan` エラーレスポンス（`success: false`）テストが追加されている
- [ ] plan/improve/execute の型ナロイング一貫性テストが追加されている
- [ ] 全テストが PASS している
- [ ] 既存テストに回帰がないことが確認されている
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

- [ ] タスク1: terminal_handoff 異常系テスト追加完了
- [ ] タスク2: executePlan エラーレスポンステスト追加完了
- [ ] タスク3: plan/improve/execute 型ナロイング一貫性テスト完了
- [ ] 全テスト PASS 確認完了

## 次Phase

Phase 7: カバレッジ確認
