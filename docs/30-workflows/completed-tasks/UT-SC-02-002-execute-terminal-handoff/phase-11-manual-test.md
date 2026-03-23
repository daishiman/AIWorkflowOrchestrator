# Phase 11: 手動テスト

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| Phase    | 11                                    |
| タスクID | UT-SC-02-002                          |
| 機能名   | UT-SC-02-002-execute-terminal-handoff |
| 作成日   | 2026-03-23                            |

## 目的

`RuntimeSkillCreatorFacade.execute()` への `terminal_handoff` 分岐追加が正しく動作することを確認する。
本タスクは Main Process のバックエンドロジック修正であり、UI コンポーネントへの変更を含まないため、
視覚的な手動テスト（スクリーンショット確認等）は不要（NON_VISUAL 許容）。
自動テストの実行結果をもって手動テストの代替確認とする。

> 注意 (P53): CLI 環境では Electron アプリの実画面キャプチャが不可能なため、
> スクリーンショット取得は省略し、自動テスト PASS 結果を間接的な視覚検証とする。

## 実行タスク

| #   | タスク                                 | 方法                  | 期待結果         |
| --- | -------------------------------------- | --------------------- | ---------------- |
| T1  | `terminal_handoff` テストが PASS       | 自動テスト実行        | 全テスト GREEN   |
| T2  | `integrated_api` テストが引き続き PASS | 自動テスト実行        | 既存テスト非破壊 |
| T3  | Union 型の型チェックが通る             | TypeScript コンパイル | エラーなし       |

## 参照資料

| 資料                   | パス                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------ |
| Phase 4 テスト仕様書   | `docs/30-workflows/UT-SC-02-002-execute-terminal-handoff/phase-04-test-creation.md`  |
| Phase 5 実装仕様書     | `docs/30-workflows/UT-SC-02-002-execute-terminal-handoff/phase-05-implementation.md` |
| Phase 9 品質検証結果   | `docs/30-workflows/UT-SC-02-002-execute-terminal-handoff/phase-09-quality.md`        |
| 修正対象テストファイル | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` |

## 実行手順

### Step 1: 対象テストファイルを実行

```bash
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts
```

#### 確認ポイント

- `terminal_handoff` を含むテストケースが PASS すること
- `integrated_api` を含む既存テストケースが引き続き PASS すること
- テストスイート全体でエラーが 0 件であること

#### 期待される出力（例）

```
 PASS  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts

  RuntimeSkillCreatorFacade
    execute()
      ✓ integrated_api の場合は LLM を呼び出す
      ✓ terminal_handoff の場合はハンドオフ結果を返す
      ✓ terminal_handoff の場合は LLM を呼び出さない
      ✓ 未知の execution_type の場合はエラーを返す
      ...

Test Files  1 passed (1)
Tests       X passed (X)
```

### Step 2: TypeScript 型チェック

```bash
cd apps/desktop && pnpm tsc --noEmit
```

#### 確認ポイント

- `skillCreator.ts` の Union 型定義に型エラーがないこと
- `RuntimeSkillCreatorFacade.ts` の分岐ロジックに型エラーがないこと

### Step 3: 関連パッケージの型チェック

```bash
pnpm --filter @repo/shared tsc --noEmit
```

#### 確認ポイント

- `packages/shared/src/types/skillCreator.ts` に型エラーがないこと

## 多角的チェック観点

| 観点               | 適用判断                          | 確認内容                                         |
| ------------------ | --------------------------------- | ------------------------------------------------ |
| セキュリティ       | terminal_handoff でのセキュリティ | SkillExecutor 非呼び出しの保証                   |
| アーキテクチャ     | 3メソッドのパターン統一           | plan/improve/execute の分岐パターンの一貫性      |
| エラーハンドリング | Optional chaining の安全性        | `response.error?.message` 等の null 安全パターン |

## 統合テスト連携

本 Phase では自動テストを代替の統合確認として使用する。

| テスト種別     | コマンド                                                                                | 確認内容                      |
| -------------- | --------------------------------------------------------------------------------------- | ----------------------------- |
| ユニットテスト | `pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` | terminal_handoff 分岐ロジック |
| 型チェック     | `pnpm tsc --noEmit`                                                                     | Union 型の整合性              |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## 成果物

| 成果物         | パス           | 説明                                      |
| -------------- | -------------- | ----------------------------------------- |
| テスト実行ログ | コンソール出力 | `terminal_handoff` テスト PASS の確認結果 |
| 型チェックログ | コンソール出力 | TypeScript コンパイルエラーなしの確認結果 |

## 完了条件

- [ ] `terminal_handoff` を含む全テストケースが PASS している
- [ ] `integrated_api` を含む既存テストケースが引き続き PASS している
- [ ] `pnpm tsc --noEmit` がエラーなしで完了している
- [ ] `pnpm --filter @repo/shared tsc --noEmit` がエラーなしで完了している
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次の Phase

Phase 12: ドキュメント更新
→ `docs/30-workflows/UT-SC-02-002-execute-terminal-handoff/phase-12-documentation.md`
