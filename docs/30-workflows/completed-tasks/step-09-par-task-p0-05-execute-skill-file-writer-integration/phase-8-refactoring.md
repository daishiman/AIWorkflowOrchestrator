# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 8                                     |
| Phase名    | リファクタリング                      |
| 対象機能   | execute-skill-file-writer-integration |
| 前提Phase  | Phase 7: カバレッジ確認               |
| 次Phase    | Phase 9: 品質保証                     |
| ステータス | not_started                           |
| 作成日     | 2026-03-30                            |

## 目的

Phase 5〜6 の実装で生じたコードスメル（重複、命名不統一、構造的問題）を整理し、保守性を向上させる。テスト継続成功を担保しながら最小複雑性を追求する。

## 実行タスク

### Task 8-1: パーサー正規表現の定数化・名前付きグループ化

対象: `parseLlmResponseToContent.ts`

- コードブロック抽出用の正規表現をファイル先頭の名前付き定数として切り出す
- 名前付きキャプチャグループ（`(?<lang>...)`, `(?<content>...)`）を使用し可読性を向上
- 見出し行からファイル名を抽出する正規表現も同様に定数化
- 定数名の命名規則: `REGEX_CODE_BLOCK`, `REGEX_HEADING_FILEPATH` 等

````typescript
// Before（インライン正規表現）
const matches = text.matchAll(/```(?:(\w+)\n)?([\s\S]*?)```/g);

// After（定数化・名前付きグループ）
const REGEX_CODE_BLOCK = /```(?:(?<lang>\w+)\n)?(?<content>[\s\S]*?)```/g;
const matches = text.matchAll(REGEX_CODE_BLOCK);
````

### Task 8-2: execute() 内 persist 連携部分のメソッド抽出検討

対象: `RuntimeSkillCreatorFacade.ts`

- execute() 内の Step 3.5〜3.6（パース → persist 呼び出し → エラーハンドリング）を private メソッドに抽出可能か検討
- 抽出候補: `private async persistGeneratedContent(events, skillName): Promise<{ persistResult, persistError }>`
- 判断基準:
  - execute() の行数が 50 行を超える場合は抽出を推奨
  - persist 連携ロジックが自己完結している（外部状態への副作用が限定的）場合は抽出が適切
  - 抽出により execute() のフローが読みやすくなるか

### Task 8-3: エラーハンドリングの共通化検討

対象: `RuntimeSkillCreatorFacade.ts`, `parseLlmResponseToContent.ts`

- 既存の `parsePlanResponse` 等（plan/improve/verify の応答パーサー）とのエラーハンドリングパターンを比較
- 共通化可能な部分を特定:
  - try/catch パターンでの `err instanceof Error ? err.message : String(err)` の重複
  - ログ出力パターンの統一
- 共通ユーティリティ関数（例: `safeErrorMessage(err: unknown): string`）の抽出を検討
- 過度な抽象化は避け、実際に3箇所以上の重複がある場合のみ共通化する

### Task 8-4: コードスメル検出・修正

対象: 全変更ファイル

チェック項目:

| スメル種別       | 確認観点                                                      | 対処方針                            |
| ---------------- | ------------------------------------------------------------- | ----------------------------------- |
| 重複コード       | パーサーとFacade間で同様の文字列処理が重複していないか        | ユーティリティに統合                |
| 命名不統一       | `content`/`generatedContent`/`parsedContent` 等の混在がないか | プロジェクト内の既存命名に統一      |
| マジックナンバー | 正規表現以外にハードコードされた値がないか                    | 定数化                              |
| 長いメソッド     | execute() が過度に長くないか（50行超）                        | Task 8-2 で対処                     |
| 不要なコメント   | 実装過程の TODO/FIXME が残っていないか                        | 解決済みなら削除、未解決ならIssue化 |

### Task 8-5: テスト継続成功の確認

リファクタリング後に以下を実行し、全テストが成功することを確認する:

```bash
# パーサーテスト
pnpm vitest run apps/desktop/src/main/services/runtime/parseLlmResponseToContent.test.ts

# Facade テスト
pnpm vitest run apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.test.ts

# 既存テストへの影響確認（runtime ディレクトリ全体）
pnpm vitest run apps/desktop/src/main/services/runtime/

# 型チェック
pnpm typecheck
```

## 参照資料

| 資料名       | パス                                                                  | 説明                   |
| ------------ | --------------------------------------------------------------------- | ---------------------- |
| Phase 2 設計 | `phase-2-design.md`                                                   | 守るべき設計判断       |
| Phase 5 実装 | `phase-5-implementation.md`                                           | 整理対象の本体         |
| Phase 6 拡充 | `phase-6-test-expansion.md`                                           | 壊してはいけないテスト |
| Phase 7 確認 | `phase-7-coverage-check.md`                                           | 重複削減候補           |
| Facade実装   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 整理対象               |
| パーサー実装 | `apps/desktop/src/main/services/runtime/parseLlmResponseToContent.ts` | 整理対象               |
| 型定義       | `packages/shared/src/types/skillCreator.ts`                           | 整理対象               |

## 統合テスト連携

- リファクタリング後も Phase 7 で確認したカバレッジ水準を維持すること
- 命名変更がテストの expectation を壊していないことを確認する
- 正規表現の定数化後もパーサーの全テストケースが通ることを確認する

## 成果物

| 成果物               | パス                                    | 説明                                 |
| -------------------- | --------------------------------------- | ------------------------------------ |
| リファクタリング記録 | `outputs/phase-8/refactoring-report.md` | 変更内容、判断理由、見送り理由の記録 |

## 完了条件

- [ ] パーサー正規表現が定数化・名前付きグループ化されている
- [ ] execute() 内 persist 連携部分のメソッド抽出について検討結果が記録されている（抽出した or 見送り理由）
- [ ] エラーハンドリングの共通化について検討結果が記録されている
- [ ] コードスメル検出チェックリスト（Task 8-4）が全項目確認されている
- [ ] リファクタリング後に全テストが成功している
- [ ] 最小複雑性の判断理由が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 9: 品質保証](./phase-9-quality-assurance.md)
