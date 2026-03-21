# 境界条件マトリクス

## メタ情報

| 項目       | 値                                    |
| ---------- | ------------------------------------- |
| Phase      | 6 - テスト拡充                        |
| タスク     | TASK-02-RUNTIME-POLICY-CENTRALIZATION |
| 作成日     | 2026-03-21                            |
| 前提成果物 | phase-4/validation-matrix.md          |

---

## 境界条件一覧

### E-1: authMode 未定義（undefined）

| 項目           | 内容                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------ |
| 入力値         | `authMode = undefined`                                                                     |
| 期待される動作 | `RuntimeDecision` で `status: "blocked"` を返す。明示的な拒否であり、エラーではない        |
| 理由           | authMode 未設定はユーザーが認証方式を選択していない状態。fallback ではなく明示的拒否が安全 |
| 検証方法       | `resolve(undefined, validApiKey)` の戻り値で `decision.status === "blocked"` を assert     |

### E-2: apiKey 空文字列（""）

| 項目           | 内容                                                                                   |
| -------------- | -------------------------------------------------------------------------------------- |
| 入力値         | `apiKey = ""`                                                                          |
| 期待される動作 | `RuntimeDecision` で `status: "blocked"` を返す。P42 準拠の3段バリデーションで早期拒否 |
| 理由           | 空文字列は有効な API キーではない。LLM プロバイダへの不正リクエスト送信を防止          |
| 検証方法       | `resolve("api_key", "")` の戻り値で `decision.status === "blocked"` を assert          |

### E-3: apiKey スペースのみ（" "）

| 項目           | 内容                                                                              |
| -------------- | --------------------------------------------------------------------------------- |
| 入力値         | `apiKey = "   "`（半角スペース3文字）                                             |
| 期待される動作 | `RuntimeDecision` で `status: "blocked"` を返す。P42 準拠 `.trim() === ""` で拒否 |
| 理由           | `.trim()` 後に空文字列となるため、E-2 と同等の扱い                                |
| 検証方法       | `resolve("api_key", "   ")` の戻り値で `decision.status === "blocked"` を assert  |

### E-4: apiKey null

| 項目           | 内容                                                                                   |
| -------------- | -------------------------------------------------------------------------------------- |
| 入力値         | `apiKey = null`                                                                        |
| 期待される動作 | `RuntimeDecision` で `status: "blocked"` を返す。typeof チェックで早期拒否             |
| 理由           | null は文字列型ではないため、型チェック段階で拒否                                      |
| 検証方法       | `resolve("api_key", null as any)` の戻り値で `decision.status === "blocked"` を assert |

### E-5: apiKey undefined

| 項目           | 内容                                                                                 |
| -------------- | ------------------------------------------------------------------------------------ |
| 入力値         | `apiKey = undefined`                                                                 |
| 期待される動作 | `RuntimeDecision` で `status: "blocked"` を返す。typeof チェックで早期拒否           |
| 理由           | undefined は文字列型ではないため、型チェック段階で拒否                               |
| 検証方法       | `resolve("api_key", undefined)` の戻り値で `decision.status === "blocked"` を assert |

### E-6: apiKey 超長文字列（10000文字）

| 項目           | 内容                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------- |
| 入力値         | `apiKey = "a".repeat(10000)`                                                                 |
| 期待される動作 | バリデーション通過後、health check へ進む。API キー長の上限制約は LLM プロバイダ側で判定     |
| 理由           | RuntimePolicyResolver は API キーの形式検証（空/null/undefined）のみ行い、長さ制約は課さない |
| 検証方法       | `resolve("api_key", "a".repeat(10000))` がバリデーションエラーを返さないことを確認           |

### E-7: health check タイムアウト

| 項目           | 内容                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------- |
| 入力値         | health check リクエストが設定タイムアウト時間内に応答しない                              |
| 期待される動作 | `HealthCheckResult.status = "unknown"` を返す。blocked ではなく unknown（判定不能）      |
| 理由           | タイムアウトは一時的なネットワーク障害の可能性がある。完全拒否ではなく判定不能として扱う |
| 検証方法       | mock で `llm:check-health` を遅延応答させ、`status === "unknown"` を assert              |

### E-8: surface 未知値

| 項目           | 内容                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------- |
| 入力値         | `surface = "unknown-surface"` （SurfaceType 型外の文字列）                                  |
| 期待される動作 | TypeScript コンパイルエラー（型安全）。実行時は exhaustive check の `default` 分岐でエラー  |
| 理由           | SurfaceType はリテラルユニオン型。未知値は型レベルで防止し、実行時は never 到達ガードで捕捉 |
| 検証方法       | コンパイル時: `as never` で型エラー発生確認。実行時: `default: throw new Error()` を検証    |

### E-9: authMode 変更中の race condition

| 項目           | 内容                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------- |
| 入力値         | `resolve()` 実行中に authMode が `api_key` から `supabase` に変更される                     |
| 期待される動作 | 呼び出し時点の authMode で判定が完了する。途中変更は次回呼び出しに反映                      |
| 理由           | resolve() は引数として authMode を受け取るため、呼び出し時点の値で確定する（値渡し）        |
| 検証方法       | resolve() 実行中に Store の authMode を変更し、戻り値が呼び出し時の authMode 基準であること |

---

## 境界条件サマリ

| ID  | カテゴリ       | 入力値                  | 期待 status                     | P42 3段バリデーション |
| --- | -------------- | ----------------------- | ------------------------------- | --------------------- |
| E-1 | authMode       | undefined               | blocked                         | -                     |
| E-2 | apiKey         | ""                      | blocked                         | 空文字列チェック      |
| E-3 | apiKey         | " "                     | blocked                         | trim 空文字列チェック |
| E-4 | apiKey         | null                    | blocked                         | 型チェック            |
| E-5 | apiKey         | undefined               | blocked                         | 型チェック            |
| E-6 | apiKey         | 10000文字               | 通過 → health                   | -                     |
| E-7 | health         | タイムアウト            | unknown                         | -                     |
| E-8 | surface        | 型外文字列              | コンパイルエラー / 実行時エラー | -                     |
| E-9 | race condition | resolve中のauthMode変更 | 呼出時点値                      | -                     |
