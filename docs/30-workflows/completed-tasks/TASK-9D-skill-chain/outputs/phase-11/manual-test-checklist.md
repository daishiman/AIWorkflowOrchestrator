# Phase 11: 手動テストチェックリスト

## メタ情報

| 項目   | 内容                         |
| ------ | ---------------------------- |
| Phase  | 11                           |
| 機能名 | TASK-9D-skill-chain          |
| 成果物 | 手動テストチェックリスト     |
| 作成日 | 2026-02-28                   |
| 前提   | Phase 10（最終レビュー）完了 |

---

## 1. テスト環境

| 項目           | 内容                                                                  |
| -------------- | --------------------------------------------------------------------- |
| OS             | macOS (Darwin 24.6.0)                                                 |
| Electron       | プロジェクト設定バージョン                                            |
| Node.js        | プロジェクト設定バージョン                                            |
| テスト実行方法 | `pnpm --filter @repo/desktop dev` で起動後、DevTools コンソールで検証 |

---

## 2. IPC 通信テスト（5 チャネル）

### 2.1 skill:chain:list

| #   | テスト項目                                 | 手順                                                          | 期待結果                                          | 結果 |
| --- | ------------------------------------------ | ------------------------------------------------------------- | ------------------------------------------------- | ---- |
| 1   | チェーン定義が存在しない場合に空配列が返る | DevTools: `window.electronAPI.chain.list()`                   | `{ success: true, data: [] }`                     | -    |
| 2   | チェーン定義が存在する場合に一覧が返る     | 先に save でチェーン作成後、`window.electronAPI.chain.list()` | `{ success: true, data: [SkillChainDefinition] }` | -    |
| 3   | 複数チェーン定義が存在する場合に全件が返る | 2 件以上 save 後、`window.electronAPI.chain.list()`           | data 配列の length が保存件数と一致               | -    |

### 2.2 skill:chain:get

| #   | テスト項目                          | 手順                                                                    | 期待結果                                        | 結果 |
| --- | ----------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------- | ---- |
| 4   | 存在する chainId で定義が取得できる | save で作成した chainId を指定: `window.electronAPI.chain.get(chainId)` | `{ success: true, data: SkillChainDefinition }` | -    |
| 5   | 存在しない chainId で null が返る   | `window.electronAPI.chain.get("non-existent-id")`                       | `{ success: true, data: null }`                 | -    |
| 6   | 空文字列の chainId でエラーが返る   | `window.electronAPI.chain.get("")`                                      | `{ success: false, error: "..." }`              | -    |

### 2.3 skill:chain:save

| #   | テスト項目                                  | 手順                                                                              | 期待結果                                       | 結果 |
| --- | ------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------- | ---- |
| 7   | 新規チェーン定義が保存できる                | 有効な SkillChainDefinition オブジェクトで `window.electronAPI.chain.save(chain)` | `{ success: true, data: { id: "uuid", ... } }` | -    |
| 8   | 保存されたチェーンに id が自動付与される    | 上記の結果の data.id を確認                                                       | UUID v4 形式の文字列                           | -    |
| 9   | 保存されたチェーンに createdAt が設定される | 上記の結果の data.createdAt を確認                                                | ISO 8601 形式の日時文字列                      | -    |
| 10  | 既存チェーンの更新で updatedAt が更新される | 取得したチェーンの name を変更して再 save                                         | updatedAt が createdAt と異なる                | -    |
| 11  | name が空文字列の場合にエラーが返る         | `window.electronAPI.chain.save({ name: "", steps: [], ... })`                     | `{ success: false, error: "..." }`             | -    |
| 12  | steps が空配列でない場合に正常保存される    | steps に 1 件以上のステップを含めて save                                          | `{ success: true }`                            | -    |

### 2.4 skill:chain:delete

| #   | テスト項目                               | 手順                                                      | 期待結果                                      | 結果 |
| --- | ---------------------------------------- | --------------------------------------------------------- | --------------------------------------------- | ---- |
| 13  | 存在するチェーンが削除できる             | save で作成後、`window.electronAPI.chain.delete(chainId)` | `{ success: true, data: { deleted: true } }`  | -    |
| 14  | 削除後に get で取得できないことを確認    | 上記削除後、`window.electronAPI.chain.get(chainId)`       | `{ success: true, data: null }`               | -    |
| 15  | 存在しない chainId の削除で false が返る | `window.electronAPI.chain.delete("non-existent-id")`      | `{ success: true, data: { deleted: false } }` | -    |

### 2.5 skill:chain:execute

| #   | テスト項目                                | 手順                                                                                | 期待結果                                    | 結果 |
| --- | ----------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------- | ---- |
| 16  | 有効なチェーンが実行できる                | 有効なステップを含むチェーンを save 後、`window.electronAPI.chain.execute(chainId)` | `{ success: true, data: SkillChainResult }` | -    |
| 17  | 実行結果に stepResults が含まれる         | 上記結果の data.stepResults を確認                                                  | StepResult 配列（ステップ数と一致）         | -    |
| 18  | 存在しない chainId での実行でエラーが返る | `window.electronAPI.chain.execute("non-existent-id")`                               | `{ success: false, error: "..." }`          | -    |
| 19  | variables を渡してチェーンが実行できる    | `window.electronAPI.chain.execute(chainId, { key: "value" })`                       | variables が各ステップで利用可能            | -    |

---

## 3. バリデーションテスト（不正入力）

### 3.1 chainId バリデーション（P42 準拠 3 段バリデーション）

| #   | テスト項目                         | 手順                                               | 期待結果                           | 結果 |
| --- | ---------------------------------- | -------------------------------------------------- | ---------------------------------- | ---- |
| 20  | null を渡した場合                  | `window.electronAPI.chain.get(null)`               | `{ success: false, error: "..." }` | -    |
| 21  | undefined を渡した場合             | `window.electronAPI.chain.get(undefined)`          | `{ success: false, error: "..." }` | -    |
| 22  | 数値を渡した場合                   | `window.electronAPI.chain.get(123)`                | `{ success: false, error: "..." }` | -    |
| 23  | オブジェクトを渡した場合           | `window.electronAPI.chain.get({})`                 | `{ success: false, error: "..." }` | -    |
| 24  | 空文字列を渡した場合               | `window.electronAPI.chain.get("")`                 | `{ success: false, error: "..." }` | -    |
| 25  | スペースのみの文字列を渡した場合   | `window.electronAPI.chain.get("   ")`              | `{ success: false, error: "..." }` | -    |
| 26  | パストラバーサル文字列を渡した場合 | `window.electronAPI.chain.get("../../etc/passwd")` | エラーが返る（パス操作の防止）     | -    |

### 3.2 chain オブジェクトバリデーション

| #   | テスト項目                   | 手順                                                                                                     | 期待結果                       | 結果 |
| --- | ---------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------ | ---- |
| 27  | name がスペースのみの場合    | `window.electronAPI.chain.save({ name: "   ", steps: [], errorHandling: { strategy: "stop" } })`         | `{ success: false }`           | -    |
| 28  | steps が null の場合         | `window.electronAPI.chain.save({ name: "test", steps: null, errorHandling: { strategy: "stop" } })`      | `{ success: false }`           | -    |
| 29  | steps が配列でない場合       | `window.electronAPI.chain.save({ name: "test", steps: "invalid", errorHandling: { strategy: "stop" } })` | `{ success: false }`           | -    |
| 30  | errorHandling が未指定の場合 | `window.electronAPI.chain.save({ name: "test", steps: [] })`                                             | エラーまたはデフォルト値で保存 | -    |

---

## 4. エラーハンドリングテスト（3 戦略）

### 4.1 stop 戦略

| #   | テスト項目                                                  | 手順                                                                            | 期待結果                                                | 結果 |
| --- | ----------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------- | ---- |
| 31  | ステップ失敗時にチェーン実行が即座に停止する                | errorHandling.strategy = "stop" のチェーンで、2番目のステップが失敗するよう設定 | isSuccess: false、3番目以降のステップが実行されていない | -    |
| 32  | 失敗したステップの error フィールドにエラー情報が記録される | 上記の結果の stepResults[1].error を確認                                        | エラーメッセージが記録されている                        | -    |

### 4.2 skip 戦略

| #   | テスト項目                                           | 手順                                                                            | 期待結果                                              | 結果 |
| --- | ---------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------- | ---- |
| 33  | ステップ失敗時に次のステップに進む                   | errorHandling.strategy = "skip" のチェーンで、2番目のステップが失敗するよう設定 | 3番目のステップが実行されている                       | -    |
| 34  | 失敗ステップの status が "skipped" になる            | 上記の結果の stepResults[1].status を確認                                       | "skipped" または "failed"                             | -    |
| 35  | 他のステップが全て成功した場合に全体結果が成功になる | 上記の結果の isSuccess を確認                                                   | 失敗ステップをスキップした上で isSuccess が判定される | -    |

### 4.3 retry 戦略

| #   | テスト項目                             | 手順                                                                                   | 期待結果                                 | 結果 |
| --- | -------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------- | ---- |
| 36  | ステップ失敗時にリトライが実行される   | errorHandling.strategy = "retry"、retryCount = 2 のステップで、1回目が失敗するよう設定 | 最大2回のリトライが実行される            | -    |
| 37  | リトライ成功時に次のステップに進む     | 2回目の実行で成功するよう設定                                                          | 3番目のステップが実行されている          | -    |
| 38  | リトライ回数超過時にエラーが記録される | 全リトライが失敗するよう設定                                                           | error フィールドにリトライ超過情報が記録 | -    |

---

## 5. データフロー確認テスト

| #   | テスト項目                                        | 手順                                                                      | 期待結果                                              | 結果 |
| --- | ------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------- | ---- |
| 39  | 前ステップの出力が次ステップの入力に渡る          | inputMapping.type = "previousOutput" のステップを含むチェーンを実行       | 後続ステップの input に前ステップの output が含まれる | -    |
| 40  | テンプレート変数が正しく展開される                | inputMapping.type = "template" で `{{variableName}}` を含むステップを実行 | テンプレートが実際の変数値で展開される                | -    |
| 41  | extractPath で出力の部分抽出ができる              | outputMapping.extractPath を指定したステップを実行                        | 指定パスの値のみが出力として記録される                | -    |
| 42  | 条件付き実行で previousSuccess が正しく評価される | condition.type = "previousSuccess" のステップを含むチェーンを実行         | 前ステップ成功時のみ実行される                        | -    |

---

## 6. エラーサニタイズ確認テスト

| #   | テスト項目                                         | 手順                                                            | 期待結果                                   | 結果 |
| --- | -------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------ | ---- |
| 43  | エラーレスポンスに内部パス情報が含まれない         | 不正入力でエラーを発生させ、レスポンスの error フィールドを確認 | ファイルパスやスタックトレースが含まれない | -    |
| 44  | エラーレスポンスにユーザー向けメッセージが含まれる | 上記のエラーレスポンスを確認                                    | 原因を示す簡潔なメッセージが含まれる       | -    |

---

## 7. Preload API 確認テスト

| #   | テスト項目                          | 手順                                                | 期待結果   | 結果 |
| --- | ----------------------------------- | --------------------------------------------------- | ---------- | ---- |
| 45  | window.electronAPI.chain が存在する | DevTools: `typeof window.electronAPI.chain`         | "object"   | -    |
| 46  | chain.list が関数として存在する     | DevTools: `typeof window.electronAPI.chain.list`    | "function" | -    |
| 47  | chain.get が関数として存在する      | DevTools: `typeof window.electronAPI.chain.get`     | "function" | -    |
| 48  | chain.save が関数として存在する     | DevTools: `typeof window.electronAPI.chain.save`    | "function" | -    |
| 49  | chain.delete が関数として存在する   | DevTools: `typeof window.electronAPI.chain.delete`  | "function" | -    |
| 50  | chain.execute が関数として存在する  | DevTools: `typeof window.electronAPI.chain.execute` | "function" | -    |

---

## 8. テスト結果サマリー

| カテゴリ               | テスト数 | PASS | FAIL | 未実施 |
| ---------------------- | -------- | ---- | ---- | ------ |
| IPC 通信（5 チャネル） | 19       | -    | -    | 19     |
| バリデーション         | 11       | -    | -    | 11     |
| エラーハンドリング     | 8        | -    | -    | 8      |
| データフロー           | 4        | -    | -    | 4      |
| エラーサニタイズ       | 2        | -    | -    | 2      |
| Preload API 確認       | 6        | -    | -    | 6      |
| **合計**               | **50**   | -    | -    | **50** |

---

## 9. 備考

- 本チェックリストは Renderer 未実装（TASK-031b で対応予定）のため、DevTools コンソールからの直接呼び出しで検証する
- UI コンポーネント（チェーンエディター、実行ビュー等）の手動テストは TASK-031b の Phase 11 で実施する
- 手動テスト実施時は各項目の「結果」列に PASS / FAIL を記入し、FAIL の場合は備考を追記する

**Phase 11 判定**: 手動テストチェックリスト作成完了。Phase 12（ドキュメント）へ進む。
