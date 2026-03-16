# Phase 5 実装計画 - Skill Docs Runtime Integration

## 実装完了ファイル

### Step 1: 型定義拡張

| ファイル                                  | 変更種別 | 内容                                                                                                                    |
| ----------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| `packages/shared/src/types/skill-docs.ts` | 変更     | DocOperationResult, DocError, DocErrorGuidance, DocErrorCategory, SkillDocsCapability, SkillDocsCapabilityResult 型追加 |
| `packages/shared/index.ts`                | 変更     | 新規型のエクスポート追加                                                                                                |

### Step 2: LLMDocQueryAdapter

| ファイル                                                     | 変更種別 | 内容                                                                 |
| ------------------------------------------------------------ | -------- | -------------------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/LLMDocQueryAdapter.ts` | 新規     | ILLMDocQueryAdapter インターフェース + LLMDocQueryAdapter 実装クラス |

### Step 3b: SkillDocsCapabilityResolver

| ファイル                                                              | 変更種別 | 内容                         |
| --------------------------------------------------------------------- | -------- | ---------------------------- |
| `apps/desktop/src/main/services/skill/SkillDocsCapabilityResolver.ts` | 新規     | capability 3パス判定ロジック |

## MINOR 指摘対処

| ID       | 指摘内容                                | 対処                                                                                  |
| -------- | --------------------------------------- | ------------------------------------------------------------------------------------- |
| MINOR-03 | リトライの lastResult 初期値            | LLMDocQueryAdapter.mapError で non-null assertion なしのエラーマッピング実装          |
| MINOR-04 | SkillDocGenerator constructor は 2 引数 | queryFn, skillFileManager の 2 引数を維持（変更なし）                                 |
| MINOR-05 | error フィールドの型変更は後方互換維持  | DocError 型は新規追加、既存の string エラーは DocOperationResult.error.message に格納 |

## エラーコード体系

| コード | カテゴリ         | 意味           | リトライ |
| ------ | ---------------- | -------------- | -------- |
| 1001   | VALIDATION       | prompt が空    | 不可     |
| 2001   | BUSINESS         | API key 未設定 | 不可     |
| 2002   | BUSINESS         | API key 無効   | 不可     |
| 3001   | EXTERNAL_SERVICE | タイムアウト   | 可能     |
| 3002   | EXTERNAL_SERVICE | レートリミット | 可能     |
| 3003   | EXTERNAL_SERVICE | サーバーエラー | 可能     |
| 5001   | INTERNAL         | 内部エラー     | 不可     |

## テスト結果

- 新規テスト: 22 PASS / 0 FAIL
- 既存回帰テスト: 24 PASS / 0 FAIL (SkillDocGenerator.test.ts)
