# Phase 9: 品質保証 -- External API Support（外部APIサポート）

## メタ情報

| 項目      | 値                          |
| --------- | --------------------------- |
| Phase番号 | 9                           |
| 機能名    | external-api-support        |
| タスクID  | TASK-SDK-SC-03              |
| 作成日    | 2026-04-02                  |
| 依存Phase | Phase 8（リファクタリング） |

## 目的

コード品質・型安全性・セキュリティの3軸で品質保証チェックを実施し、全件クリアを確認する。
OWASP Top10の観点から外部APIアダプターのセキュリティレビューを行う。

## Task 9-1: TypeScript型チェック

```bash
# shared パッケージ
pnpm --filter @repo/shared typecheck

# desktop パッケージ
pnpm --filter @repo/desktop typecheck
```

期待する結果: **エラー 0件**

### 確認ポイント

- [ ] `skillCreatorExternalApi.ts` に型エラーなし
- [ ] `HttpExternalApiAdapter.ts` に型エラーなし
- [ ] `ExternalApiConfigForm.tsx` に型エラーなし
- [ ] `channels.ts` の追加チャネル定数に型エラーなし

## Task 9-2: ESLint チェック

```bash
pnpm --filter @repo/shared lint
pnpm --filter @repo/desktop lint
```

期待する結果: **エラー 0件・警告 0件**

### 確認ポイント

- [ ] `no-console` ルール: `warnIfNotHttps` の `console.warn` が適切に例外設定されているか
- [ ] `@typescript-eslint/no-explicit-any` ルール: `any` 型不使用
- [ ] `@typescript-eslint/no-non-null-assertion` ルール: `!` 演算子不使用
- [ ] React hooks ルール: `ExternalApiConfigForm` 内の useState / useEffect が適切に使用されているか

## Task 9-3: Vitest 全件 PASS 確認

```bash
pnpm --filter @repo/desktop vitest run \
  src/main/services/runtime/adapters/__tests__/HttpExternalApiAdapter.test.ts \
  --reporter=verbose
```

期待する結果: **T-01〜T-13（補完テストがあれば〜T-15）全件 PASS**

## Task 9-4: OWASP Top10 観点セキュリティレビュー

外部APIアダプターに関連するOWASP Top10の観点でレビューを行う。

### A01: アクセス制御の不備

- [ ] `ExternalApiConfigForm` がログイン済みユーザーにのみ表示されること（親コンポーネントで制御）
- [ ] `skill-creator:configure-api` IPCハンドラーがMainプロセスで認証済みセッションからのみ受け付けること

### A02: 暗号化の失敗

- [ ] APIキーをIPCで送信する場合、Electronのコンテキスト分離が有効であること（contextIsolation: true）
- [ ] HTTP通信に警告を出しているが、本番環境ではHTTPS強制を推奨として記録すること

### A03: インジェクション

- [ ] URLフィールドへのXSSインジェクションが `type="url"` バリデーションで防止されていること
- [ ] カスタムヘッダーのJSONパース時に `JSON.parse` のエラーハンドリングが実装されていること

### A07: 識別と認証の失敗

- [ ] APIキーが認証情報フィールド（`type="password"`）で入力されていること
- [ ] APIキーがログ・エラーメッセージに含まれていないこと（FR-005）

### A09: セキュリティログとモニタリングの失敗

- [ ] HTTPSでないURL使用時に警告ログが出力されること（`warnIfNotHttps`）
- [ ] タイムアウト・HTTP 4xx/5xxエラーが適切にログ記録されること（エラークラスのメッセージ確認）

## Task 9-5: 品質保証サマリー

| チェック項目          | コマンド                                 | 期待結果        | 実行結果 |
| --------------------- | ---------------------------------------- | --------------- | -------- |
| TypeScript（shared）  | `pnpm --filter @repo/shared typecheck`   | エラー0件       | -        |
| TypeScript（desktop） | `pnpm --filter @repo/desktop typecheck`  | エラー0件       | -        |
| ESLint（shared）      | `pnpm --filter @repo/shared lint`        | エラー・警告0件 | -        |
| ESLint（desktop）     | `pnpm --filter @repo/desktop lint`       | エラー・警告0件 | -        |
| Vitest                | `pnpm --filter @repo/desktop vitest run` | 全件PASS        | -        |
| OWASP Top10レビュー   | コードレビュー                           | 全件クリア      | -        |

## 参照資料

| 資料名                   | パス                                                                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Phase 8 リファクタリング | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-02-par-task-03-external-api-support/phase-8-refactoring.md`  |
| Phase 1 要件定義         | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-02-par-task-03-external-api-support/phase-1-requirements.md` |

## 完了条件

- [ ] `pnpm typecheck` 全パッケージで0エラー
- [ ] `pnpm lint` 全パッケージで0エラー・0警告
- [ ] `pnpm vitest run` 全件PASS
- [ ] OWASP Top10（A01/A02/A03/A07/A09）の観点でセキュリティレビューを完了した
- [ ] APIキーログ非出力・HTTPS警告・IPC平文送信なしのセキュリティチェックリストを全件クリアした

## 次の Phase: Phase 10（phase-10-final-review.md）
