# [#1798] "[UT-UIUX-EVALUATE-ERROR-HANDLING-001] evaluate-ui-ux.js エラーハンドリング強化（タイムアウト/レート制限/ファイルI/O）"

## メタ情報

```yaml
task_id: UT-UIUX-EVALUATE-ERROR-HANDLING-001
task_name: evaluate-ui-ux.js エラーハンドリング強化（タイムアウト/レート制限/ファイルI/O）
category: 改善
target_feature: evaluate-ui-ux.js
priority: 低
scale: 小規模
status: 未実施
source_phase: TASK-UIUX-FEEDBACK-001 Phase 5
created_date: 2026-03-31
dependencies: []
spec_path: docs/30-workflows/unassigned-task/UT-UIUX-EVALUATE-ERROR-HANDLING-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

TASK-UIUX-FEEDBACK-001 の Phase 5 実装で作成された `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js` は `parseEvaluationResponse()` 関数に寛容バリデーション（lenient validation）が実装されているものの、複数のエラーハンドリングが不足している状態にある。

現状では、Claude API タイムアウト・JSON パースエラー・ファイル I/O エラー・API レート制限のいずれが発生しても、適切なリカバリ処理やユーザーへの明確なフィードバックが行われず、スクリプトが予期しない形で終了または誤動作するリスクがある。特に 10 枚超のスクリーンショット評価を伴う長フロー実行時の信頼性が担保されておらず、実運用投入前にエラーハンドリングを補完する必要がある。

## 2. 何を達成するか（What）

`.claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js` に以下のエラーハンドリングを追加する：

1. **Claude API タイムアウト対応**: 30 秒タイムアウトでのリトライ（最大 3 回）と graceful degradation
2. **JSON パースエラー対応**: `parseEvaluationResponse()` 呼び出し側の外層 try-catch 追加と構造化エラー返却
3. **ファイル I/O エラー対応**: スクリーンショット不存在・読み込み不可時に `{ error: "file-not-found", path: "..." }` 形式の構造化エラーを返す
4. **API レート制限対応**: HTTP 429 応答に対する指数バックオフリトライ
5. **コスト見積もりログ**: 実行前に画像枚数 × 単価のコスト見積もりをログ出力

## 3. どのように実行するか（How）

1. `evaluate-ui-ux.js` の現行コードを読み込み、エラーハンドリングが不足している箇所を特定する
2. タイムアウト・リトライロジックを `callClaudeAPI()` または相当の関数に追加する（`AbortController` / `Promise.race` 活用）
3. `parseEvaluationResponse()` の呼び出し箇所を外層 try-catch でラップし、パースエラー時は `{ error: "parse-error", raw: "..." }` を返す
4. ファイル読み込み前に `fs.existsSync()` / `fs.accessSync()` でチェックし、構造化エラーを返す
5. HTTP 429 レスポンスを検出し、指数バックオフ（初回 1 秒、2 倍ずつ）でリトライする
6. 実行開始時に `images.length × 0.018` のコスト見積もりを `console.log` で出力する
7. 変更箇所の単体テストを追加する（タイムアウト・ファイル不在・429 の各シナリオ）

## 3.5 苦戦箇所と解決策

| 苦戦箇所                                      | 原因                                                                                                     | 解決策                                                                                                                         |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 外層 try-catch の欠如                         | `parseEvaluationResponse()` 内部の寛容バリデーションで十分と判断され、呼び出し側ガードが実装されなかった | `parseEvaluationResponse()` の全呼び出し箇所を `try { } catch(e) { return { error: "parse-error", raw: e.message } }` でラップ |
| 2048 token limit による長フローでの動作未検証 | 10 枚超の画像評価では応答が 2048 token を超過し、JSON が途中で切れる可能性がある                         | `max_tokens` を動的に計算（画像枚数 × 300）し、上限を引き上げるか複数バッチに分割する                                          |
| タイムアウト制御の実装難易度                  | Node.js の `fetch` / `axios` でのタイムアウト実装はライブラリ依存のため、統一的な対応が難しい            | `AbortController` + `Promise.race` パターンで実装し、ライブラリに依存しない共通ラッパーを作成する                              |
| コスト監視の基準値不明確                      | 画像 1 枚あたりのコストがモデル・解像度によって異なり、固定値 `$0.018` が常に正確とは限らない            | コスト単価を環境変数 `CLAUDE_IMAGE_COST_PER_IMAGE`（デフォルト 0.018）で上書き可能にする                                       |

## 4. 実行手順

1. 現行の `evaluate-ui-ux.js` を読み込み、関数構造とエラーハンドリング箇所をリストアップする
   ```bash
   cat .claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js
   ```
2. ファイル I/O エラーハンドリングを追加する
   - スクリーンショット読み込み前に `fs.existsSync()` チェックを実装
   - エラー時は `{ error: "file-not-found", path: "<filepath>" }` を返す
3. `parseEvaluationResponse()` 呼び出し箇所に外層 try-catch を追加する
   - エラー時は `{ error: "parse-error", raw: "<rawResponse>" }` を返す
4. Claude API 呼び出し関数にタイムアウト・リトライロジックを追加する
   - `AbortController` で 30 秒タイムアウトを設定
   - タイムアウト・ネットワークエラー時は最大 3 回リトライ
   - 3 回失敗後は `{ error: "api-timeout", retries: 3 }` を返す（graceful degradation）
5. HTTP 429 レスポンスに対する指数バックオフリトライを実装する
   - 初回 1 秒 → 2 秒 → 4 秒 → 最大 3 回
6. 実行開始前コスト見積もりログを追加する
   ```js
   const costPerImage = parseFloat(
     process.env.CLAUDE_IMAGE_COST_PER_IMAGE ?? "0.018",
   );
   console.log(
     `[cost-estimate] ${images.length} images × $${costPerImage} = $${(images.length * costPerImage).toFixed(4)}`,
   );
   ```
7. 単体テストを追加する（Jest / Vitest）
   - ファイル不在シナリオ: `file-not-found` エラーが返ること
   - パースエラーシナリオ: `parse-error` エラーが返ること
   - タイムアウトシナリオ: `CLAUDE_API_TIMEOUT=100` で `api-timeout` エラーが返ること
   - 429 シナリオ: リトライ後に成功または `rate-limit` エラーが返ること
8. 動作確認（手動）を実施する（「6. 検証方法」参照）

## 5. 完了条件チェックリスト

- [ ] ファイルが存在しない場合に `{ error: "file-not-found", path: "..." }` 形式の構造化エラーが返される
- [ ] `parseEvaluationResponse()` 呼び出し箇所の外層 try-catch が実装されており、`{ error: "parse-error", raw: "..." }` が返される
- [ ] Claude API タイムアウト（30 秒）でリトライが最大 3 回動作し、3 回失敗後に graceful degradation される
- [ ] HTTP 429 レスポンスで指数バックオフリトライ（1 秒 → 2 秒 → 4 秒）が動作する
- [ ] 実行開始前にコスト見積もり（`[cost-estimate] N images × $X.XXX = $X.XXXX`）がログ出力される
- [ ] 追加した各エラーハンドリングに対応する単体テストが存在し、全てパスしている
- [ ] `CLAUDE_API_TIMEOUT` 環境変数でタイムアウト値を上書きできる
- [ ] `CLAUDE_IMAGE_COST_PER_IMAGE` 環境変数でコスト単価を上書きできる

## 6. 検証方法

```bash
# ファイルが存在しない状態でエラーが適切に返るか確認
node .claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js --screenshots nonexistent-dir/

# タイムアウトをシミュレート（環境変数でタイムアウトを短縮）
CLAUDE_API_TIMEOUT=100 node .claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js

# コスト見積もりログが出力されることを確認
node .claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js --screenshots fixtures/sample-screenshots/ 2>&1 | grep cost-estimate

# 単体テスト実行
pnpm vitest run .claude/skills/task-specification-creator/scripts/evaluate-ui-ux.test.js
```

## 7. リスクと対策

- リスク: リトライロジックの追加により、意図しない Claude API 課金が増加する
  - 対策: リトライ回数の上限（3 回）を環境変数 `CLAUDE_API_MAX_RETRIES` で設定可能にし、デフォルトを 3 とする
- リスク: 指数バックオフ中にプロセスが長時間ブロックされ、CI タイムアウトが発生する
  - 対策: バックオフの最大待機時間を 10 秒に上限設定し、CI 環境では `CLAUDE_API_MAX_RETRIES=1` を推奨する
- リスク: 外層 try-catch の追加により、従来は例外として検出されていたバグが握りつぶされる
  - 対策: `{ error: "parse-error", raw: "..." }` を返す際に `console.error` にスタックトレースを出力し、デバッグ可能にする
- リスク: `max_tokens` の動的計算が不正確で、長フローでも JSON が切れる
  - 対策: バッチ分割（5 枚ずつ）を実装し、1 バッチあたりのトークン消費を抑える

## 8. 参照情報

- `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js`（対象ファイル）
- `docs/30-workflows/step-09-par-task-uiux-feedback-001/` （TASK-UIUX-FEEDBACK-001 実装記録）
- `docs/30-workflows/unassigned-task/UT-UIUX-PLAYWRIGHT-E2E-COMPLETE-001.md`（関連未タスク）
- [Anthropic API Rate Limits](https://docs.anthropic.com/en/api/rate-limits)
- [Node.js AbortController](https://nodejs.org/api/globals.html#class-abortcontroller)

## 9. 備考

本タスクは品質改善系（Low）。TASK-UIUX-FEEDBACK-001 のメイン実装完了後に着手可能。
UT-UIUX-PLAYWRIGHT-E2E-COMPLETE-001 と並行作業可能だが、E2E テストの整備が完了していると本タスクの回帰確認が容易になるため、E2E テスト整備後の着手が望ましい。
コスト見積もり機能は将来的に UI へ表示する拡張も検討されているため、ログフォーマット（`[cost-estimate]` プレフィックス）は変更しないこと。
