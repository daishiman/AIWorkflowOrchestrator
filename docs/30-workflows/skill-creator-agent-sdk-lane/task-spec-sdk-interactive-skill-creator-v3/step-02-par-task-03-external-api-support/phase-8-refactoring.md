# Phase 8: リファクタリング -- External API Support（外部APIサポート）

## メタ情報

| 項目      | 値                        |
| --------- | ------------------------- |
| Phase番号 | 8                         |
| 機能名    | external-api-support      |
| タスクID  | TASK-SDK-SC-03            |
| 作成日    | 2026-04-02                |
| 依存Phase | Phase 7（カバレッジ達成） |

## 目的

テストが全件PASSしカバレッジ目標を達成した状態で、コードの品質・保守性・セキュリティを向上させるリファクタリングを実施する。テストを壊さない範囲で行う。

## Task 8-1: APIキー管理の統一化確認

### チェック項目

`HttpExternalApiAdapter` 全体を対象に、APIキー管理が一箇所に集約されているか確認する。

| 確認項目                                               | 確認箇所                      | 判定  |
| ------------------------------------------------------ | ----------------------------- | ----- |
| `this.credential` の設定が `setAuth` のみか            | `HttpExternalApiAdapter` 全体 | - [ ] |
| `buildAuthHeader` のみで認証ヘッダーを構築しているか   | `get` / `post`                | - [ ] |
| `setAuth` 以外の場所で `credential` を参照していないか | 全メソッド                    | - [ ] |

**判断基準**: 認証情報の参照が `buildAuthHeader` 以外に存在する場合は、`buildAuthHeader` への集約を実施する。

## Task 8-2: AbortControllerタイムアウト処理の統一確認

### チェックリスト

- [ ] `fetchWithTimeout` 内でのみ `AbortController` を生成している（分散していない）
- [ ] `clearTimeout` が `finally` ブロックで確実に呼ばれている（メモリリーク防止）
- [ ] `setTimeout` の戻り値が型安全に扱われている

### 正しい実装パターン確認

```typescript
// finally ブロックで確実に clearTimeout を呼ぶ正しいパターン
private async fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    if (!response.ok) throw new ExternalApiHttpError(url, response.status);
    return response;
  } catch (error) {
    if (error instanceof ExternalApiHttpError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ExternalApiTimeoutError(url);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId); // finally で確実にクリーンアップ
  }
}
```

## Task 8-3: ExternalApiConfigForm のバリデーション強化検討

### URL形式バリデーション

現在の実装（`type="url"` による基本バリデーション）に加え、以下を検討する:

| バリデーション項目   | 現在の実装                            | 強化候補                         | 採否判断 |
| -------------------- | ------------------------------------- | -------------------------------- | -------- |
| URL形式チェック      | `type="url"`                          | URLパースで検証                  | 任意     |
| HTTPS警告表示        | なし（バックエンドのみ）              | フォーム上でHTTP入力時に警告表示 | 推奨     |
| 認証情報必須チェック | authType≠noneで入力フィールド表示のみ | 送信前に空チェック               | 必須     |

**優先対応**: 認証情報の空チェックをバリデーションに追加する（authType が none 以外なのに credential が空の場合はエラー）。

### バリデーション追加コード

```typescript
if (authType !== "none" && !credential.trim()) {
  setError("認証情報を入力してください");
  return;
}
```

## Task 8-4: セキュリティレビュー — APIキー露出リスクの最終確認

### HttpExternalApiAdapter のセキュリティ確認

| 確認項目                                               | 確認箇所                                           | 判定  |
| ------------------------------------------------------ | -------------------------------------------------- | ----- |
| `console.log(this.credential)` が存在しないこと        | `setAuth`                                          | - [ ] |
| `console.log(this.buildAuthHeader())` が存在しないこと | `get` / `post`                                     | - [ ] |
| エラーメッセージに認証情報が含まれないこと             | `ExternalApiHttpError` / `ExternalApiTimeoutError` | - [ ] |
| `JSON.stringify(init)` でヘッダーをログしていないこと  | `fetchWithTimeout`                                 | - [ ] |

### ExternalApiConfigForm のセキュリティ確認

| 確認項目                                                 | 確認箇所                 | 判定  |
| -------------------------------------------------------- | ------------------------ | ----- |
| 認証情報フィールドが `type="password"` であること        | credential入力フィールド | - [ ] |
| 送信前に `credential` がコンソールに出力されていないこと | `handleSubmit`           | - [ ] |

## Task 8-5: リファクタリング後のテスト再実行

```bash
pnpm --filter @repo/desktop vitest run \
  src/main/services/runtime/adapters/__tests__/HttpExternalApiAdapter.test.ts \
  --reporter=verbose
```

期待する結果: **T-01〜T-13（補完テストがあれば〜T-15）全件PASS**

```bash
# カバレッジが維持されていることを確認
pnpm --filter @repo/desktop vitest run \
  src/main/services/runtime/adapters/__tests__/HttpExternalApiAdapter.test.ts \
  --coverage
```

## 参照資料

| 資料名             | パス                                                                                                                                                           |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 7 カバレッジ | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-02-par-task-03-external-api-support/phase-7-coverage.md`       |
| Phase 5 実装       | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-02-par-task-03-external-api-support/phase-5-implementation.md` |

## 完了条件

- [ ] APIキー管理が `setAuth` / `buildAuthHeader` に統一されていることを確認した
- [ ] `AbortController` / `clearTimeout` が `finally` ブロックで確実に呼ばれていることを確認した
- [ ] `ExternalApiConfigForm` の認証情報空チェックバリデーションを追加した
- [ ] APIキー露出リスクのセキュリティレビューを全項目チェックした
- [ ] 認証情報フィールドが `type="password"` であることを確認した
- [ ] リファクタリング後も全テストがPASSすることを確認した
- [ ] カバレッジ目標値が維持されていることを確認した

## 次の Phase: Phase 9（phase-9-quality-assurance.md）
