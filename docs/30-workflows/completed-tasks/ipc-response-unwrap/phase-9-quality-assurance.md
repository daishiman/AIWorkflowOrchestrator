# Phase 9: 品質保証

## メタ情報

| 項目     | 値                             |
| -------- | ------------------------------ |
| Phase    | 9                              |
| 機能名   | ipc-response-unwrap            |
| タスクID | UT-FIX-IPC-RESPONSE-UNWRAP-001 |
| 作成日   | 2026-02-14                     |

## 目的

Lint、型チェック、全テスト実行、ビルド検証を通じて、修正コードが品質ゲートを通過する状態であることを確認する。Phase 10（最終レビュー）への入力を確定する。

## 実行タスク

- TypeScript 型チェック: 型エラーが 0 件であることを確認する
- ESLint チェック: lint エラーが 0 件であることを確認する
- 全テスト実行: desktop パッケージの全テストが PASS することを確認する
- ビルド検証: ビルドエラーがないことを確認する

## 参照資料

| 種別                     | パス                                    |
| ------------------------ | --------------------------------------- |
| Phase 5 実装             | `phase-5-implementation.md`             |
| Phase 8 リファクタリング | `phase-8-refactoring.md`                |
| コード品質ルール         | `.claude/rules/02-code-quality.md`      |
| セキュリティルール       | `.claude/rules/04-electron-security.md` |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容              |
| ------------------ | ---------------------------------------------------------------------------- | ----------------- |
| テスト品質         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | 品質閾値          |
| セキュリティ IPC   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | Electron IPC 観点 |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | エラー分類        |

## 実行手順

### Task 1: TypeScript 型チェック

以下のコマンドを実行し、型エラーが 0 件であることを確認する。

```bash
pnpm typecheck
```

確認観点:

- `skill-api.ts` の型注釈に不整合がないこと
- `safeInvokeUnwrap<T>()` の戻り値型 `Promise<T>` がコール元の期待する型と一致すること
- `IpcResult<T>` 型定義が他の型と矛盾していないこと
- `packages/shared` の共有型定義との整合性が保たれていること

### Task 2: ESLint チェック

以下のコマンドを実行し、lint エラーが 0 件であることを確認する。

```bash
pnpm lint
```

確認観点:

- `any` 型が使用されていないこと（`@typescript-eslint/no-explicit-any`）
- 未使用の import が残っていないこと（`@typescript-eslint/no-unused-vars`）
- `safeInvokeUnwrap` 関数内で `console.log` / `console.warn` が残っていないこと

### Task 3: 全テスト実行

以下のコマンドを実行し、desktop パッケージの全テストが PASS することを確認する。

```bash
cd apps/desktop && pnpm vitest run
```

特に以下のテストスイートが PASS することを個別に確認する:

| テストスイート                                           | 確認内容                        |
| -------------------------------------------------------- | ------------------------------- |
| `src/preload/__tests__/skill-api.test.ts`                | `safeInvokeUnwrap` の単体テスト |
| `src/preload/__tests__/skill-api.unification.test.ts`    | API 統一後の互換性テスト        |
| `src/preload/__tests__/skill-api.permission.test.ts`     | パーミッション検証テスト        |
| `src/renderer/store/slices/__tests__/agentSlice.test.ts` | Store 経由でのスキル取得テスト  |

### Task 4: ビルド検証

以下のコマンドを実行し、ビルドエラーがないことを確認する。

```bash
cd apps/desktop && pnpm build
```

ビルド実行が環境制約で不可能な場合は、Task 1-3 の結果を以てビルド検証の代替とし、その旨を記録する。

## 統合テスト連携【必須】

| 観点         | 記録内容                                                                  |
| ------------ | ------------------------------------------------------------------------- |
| Phase 5 接続 | 実装変更が型チェック・lint を通過していること                             |
| API/IPC      | Preload 層の safeInvoke ホワイトリスト検証が維持されていること            |
| 回帰         | 既存機能（skill-api.unification, skill-api.permission）への影響がないこと |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装の場合           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| データ整合性       | 永続化やDB操作がある場合           | `aiworkflow-requirements: database-*.md`     |
| エラーハンドリング | 例外処理がある場合                 | `aiworkflow-requirements: error-handling.md` |

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | 永続化がある場合            | `aiworkflow-requirements: database-*.md`               |

### 本タスク固有のチェック観点

| 観点                 | 確認内容                                                                           |
| -------------------- | ---------------------------------------------------------------------------------- |
| セキュリティ         | `safeInvoke` のホワイトリスト検証が維持されていること                              |
| 型安全               | `any` 型の使用がないこと、型アサーション（`as`）が最小限であること                 |
| エラーハンドリング   | エラーレスポンス（`success: false`）時に明確な例外がスローされること               |
| IPC レスポンス整合性 | `{ success, data }` ラッパーが Preload 層で展開され、Renderer に生データが渡ること |

## サブタスク管理

1. 参照資料の確認
2. 実行タスクの実施
3. 統合テスト連携の確認（Phase 1-11）
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json更新方針が明記されている
- [ ] Phase末端で完了を明記している

## 成果物

| 成果物       | パス                           | 説明   |
| ------------ | ------------------------------ | ------ |
| 品質保証仕様 | `phase-9-quality-assurance.md` | 本文書 |

## 完了条件

- [ ] pnpm typecheck: 0 エラー
- [ ] pnpm lint: 0 エラー
- [ ] cd apps/desktop && pnpm vitest run: 全テスト PASS
- [ ] `any` 型の使用なし
- [ ] 型アサーション（`as`）の追加なし
- [ ] safeInvoke のホワイトリスト検証が維持されている
- [ ] エラーレスポンス時に明確な例外がスローされる
- [ ] 品質ゲートの判定結果が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 10: 最終レビュー（`phase-10-final-review.md`）
