# Phase 6 回帰計画 - Skill Docs Runtime Integration

## 概要

Phase 4 の 22 テストケースに対し、エッジケース・回帰テスト・境界テスト・セキュリティ回帰テストを追加し、合計 73 テストケースを実現した。

## 追加テストファイルと件数

| テストファイル                        | Phase 4 件数 | Phase 6 追加             | 合計 |
| ------------------------------------- | ------------ | ------------------------ | ---- |
| `LLMDocQueryAdapter.test.ts`          | 15           | 11 (T-6-1: 6 + T-6-2: 5) | 26   |
| `SkillDocGenerator.queryFn.test.ts`   | 4            | 0                        | 4    |
| `SkillDocsCapabilityResolver.test.ts` | 3            | 3 (T-6-3)                | 6    |
| `skillHandlers.docs.test.ts` (IPC)    | 0            | 5 (T-6-4)                | 5    |
| **既存** `SkillDocGenerator.test.ts`  | 24           | 0                        | 24   |
| `skillHandlers.docs.test.ts` (既存)   | 32           | 5                        | 37   |

注: 累計は Phase 4 ファイル分のみ。`skillHandlers.docs.test.ts` の既存テストは TASK-9I Phase 4 で作成済み。

## T-6-1: エッジケーステスト (6件)

| ID       | テスト内容                                  | 対象ファイル               | 結果 |
| -------- | ------------------------------------------- | -------------------------- | ---- |
| T-6-1-01 | 空文字列 prompt → code 1001                 | LLMDocQueryAdapter.test.ts | PASS |
| T-6-1-02 | 超長文 (10001文字) prompt → 正常処理        | LLMDocQueryAdapter.test.ts | PASS |
| T-6-1-03 | XSSパターン含むprompt → 正常処理            | LLMDocQueryAdapter.test.ts | PASS |
| T-6-1-04 | Unicode (絵文字・CJK) → 正常処理            | LLMDocQueryAdapter.test.ts | PASS |
| T-6-1-05 | concurrent 3リクエスト → 全て正常           | LLMDocQueryAdapter.test.ts | PASS |
| T-6-1-06 | スペースのみ prompt → P42で拒否 (code 1001) | LLMDocQueryAdapter.test.ts | PASS |

## T-6-2: 失敗パス回帰テスト (5件)

| ID       | テスト内容                                        | 対象ファイル               | 結果 |
| -------- | ------------------------------------------------- | -------------------------- | ---- |
| T-6-2-01 | 429が3回連続 → 毎回 retryable:true code 3002      | LLMDocQueryAdapter.test.ts | PASS |
| T-6-2-02 | 5xx → retry → success シーケンス                  | LLMDocQueryAdapter.test.ts | PASS |
| T-6-2-03 | timeout → timeout 連続 → retryable:true code 3001 | LLMDocQueryAdapter.test.ts | PASS |
| T-6-2-04 | 5xx → 429 複合エラー → 適切なコード               | LLMDocQueryAdapter.test.ts | PASS |
| T-6-2-05 | API key 有効→無効化 → code 2001                   | LLMDocQueryAdapter.test.ts | PASS |

## T-6-3: CapabilityResolver 境界テスト (3件)

| ID       | テスト内容                                        | 対象ファイル                        | 結果 |
| -------- | ------------------------------------------------- | ----------------------------------- | ---- |
| T-6-3-01 | API key 有効→無効化 → guidance-only に遷移        | SkillDocsCapabilityResolver.test.ts | PASS |
| T-6-3-02 | API key 未設定→設定 → integrated-api に遷移       | SkillDocsCapabilityResolver.test.ts | PASS |
| T-6-3-03 | LLM プロバイダダウン→復旧 → integrated-api に遷移 | SkillDocsCapabilityResolver.test.ts | PASS |

## T-6-4: IPC セキュリティ回帰テスト (5件)

| ID       | テスト内容                                         | 対象ファイル               | 結果 |
| -------- | -------------------------------------------------- | -------------------------- | ---- |
| T-6-4-01 | sender 偽装 → IPC 拒否                             | skillHandlers.docs.test.ts | PASS |
| T-6-4-02 | パストラバーサル skillName → IPC 通過 (FS層で防止) | skillHandlers.docs.test.ts | PASS |
| T-6-4-03 | P42: スペースのみ skillName → 拒否                 | skillHandlers.docs.test.ts | PASS |
| T-6-4-04 | P42: 型不一致 (数値) skillName → 拒否              | skillHandlers.docs.test.ts | PASS |
| T-6-4-05 | エラーレスポンスに内部パスが含まれないこと         | skillHandlers.docs.test.ts | PASS |

## T-6-4-02 に関する注記

`skillName: "../../../etc/passwd"` は現在の IPC ハンドラ実装では P42 バリデーション（型/空文字/trim）のみで判定するため、パストラバーサル文字列は IPC 層を通過する。実際のファイルシステムアクセスは SkillFileManager 層で制約される。テストは「現在の動作を記録する回帰テスト」として機能し、将来 skillName のパストラバーサルチェックが追加された場合に変更が必要となる。

## 全テスト実行結果

```
Test Files  4 passed (4)
    Tests  73 passed (73)
  Duration  2.73s
```

全 73 テストケース PASS。
