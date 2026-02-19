# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 1                                   |
| 機能名 | TASK-FIX-10-1-VITEST-ERROR-HANDLING |
| 作成日 | 2026-02-19                          |

## 目的

`apps/desktop/vitest.config.ts` L43 の `dangerouslyIgnoreUnhandledErrors: true` 設定を削除するための要件を明文化し、影響範囲を特定する。未処理 Promise 拒否がテストで検出可能になることを受け入れ基準として定義する。

## 実行タスク

- 影響テスト特定: `dangerouslyIgnoreUnhandledErrors: false` に変更した場合に失敗するテストを網羅的にリストアップする
- 要件抽出: 設定変更による影響範囲の調査（vitest.config.ts L43 の変更がテストスイート全体に与える影響）
- 受け入れ基準作成: 全テスト PASS、未処理 Promise 拒否が検出される状態を達成するための検証可能な基準を定義
- 失敗原因分類: 失敗テストをカテゴリ別（SDK 関連、IPC 関連、Store 関連、非同期クリーンアップ関連）に分類

## 参照資料

| 資料名                 | パス                                                                                          | 説明                                  |
| ---------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------- |
| タスク指示書           | `docs/30-workflows/skill-import-agent-system/tasks/07-task-fix-10-1-vitest-error-handling.md` | タスクの目的・スコープ・完了条件      |
| エラーハンドリング仕様 | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                         | プロジェクトのエラーハンドリング方針  |
| Vitest 設定            | `apps/desktop/vitest.config.ts`                                                               | 現在の Vitest 設定（L43 が対象行）    |
| テストセットアップ     | `apps/desktop/src/test/setup.ts`                                                              | テスト環境のセットアップファイル      |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                                          | P22（Vitest Worker 予期しない終了）等 |

## 実行手順

### ステップ 1: 現在の設定と影響範囲の確認

1. `apps/desktop/vitest.config.ts` L43 の `dangerouslyIgnoreUnhandledErrors: true` を確認する
2. `apps/desktop/src/test/setup.ts` の内容を確認し、テスト環境の前提条件を把握する
3. テスト総数を `pnpm --filter @repo/desktop exec vitest run --reporter=json 2>/dev/null | jq '.numTotalTests'` で取得する

### ステップ 2: 失敗テストの特定

1. `apps/desktop/vitest.config.ts` の L43 を `dangerouslyIgnoreUnhandledErrors: false` に一時的に変更する
2. 以下のコマンドでテストスイートを実行する:
   ```bash
   cd apps/desktop && pnpm vitest run 2>&1 | tee /tmp/vitest-unhandled-errors.log
   ```
3. 失敗したテストファイルとテストケース名を全件抽出する
4. 設定を元に戻す（`dangerouslyIgnoreUnhandledErrors: true`）

### ステップ 3: 失敗テストのカテゴリ分類

失敗したテストを以下のカテゴリに分類する:

| カテゴリ                 | 判定基準                                                            |
| ------------------------ | ------------------------------------------------------------------- |
| SDK 関連                 | `@anthropic-ai/claude-agent-sdk` のモック不備または非同期処理に起因 |
| IPC 関連                 | `ipcMain.handle` / `ipcRenderer.invoke` の非同期ハンドラに起因      |
| Store 関連               | Zustand Store の非同期アクション（fetch 系）に起因                  |
| 非同期クリーンアップ関連 | `afterEach` / `afterAll` でのリソース解放漏れに起因                 |
| テストコード問題         | テストコード内の `await` 漏れ、`.catch()` 不足に起因                |
| プロダクションコード問題 | プロダクションコード内の未処理 Promise 拒否に起因                   |

### ステップ 4: 要件と受け入れ基準の定義

ステップ 2-3 の結果に基づき、以下を定義する:

1. **機能要件（FR）**:
   - FR-1: `dangerouslyIgnoreUnhandledErrors` 設定行が `apps/desktop/vitest.config.ts` から削除されている
   - FR-2: 全テスト（`apps/desktop/src/**/*.test.{ts,tsx}`）が PASS する
   - FR-3: 未処理 Promise 拒否がテスト実行時にエラーとして報告される

2. **非機能要件（NFR）**:
   - NFR-1: テスト実行時間が設定変更前と比較して 20% 以上増加しない
   - NFR-2: プロダクションコードの動作（ビルド・実行時の挙動）が変更されない
   - NFR-3: 他のパッケージ（`packages/shared`, `apps/backend`）のテストに影響を与えない

## 統合テスト連携【必須】

本タスクは Vitest 設定変更が主であり、外部 API や認証フローへの接続は含まない。ただし、以下の接続要件を確認する:

| 接続要件カテゴリ | 記載内容                                                                  |
| ---------------- | ------------------------------------------------------------------------- |
| IPC通信          | IPC ハンドラのモック解除時に未処理拒否が発生しないことを確認              |
| SDK連携          | `@anthropic-ai/claude-agent-sdk` モックが非同期エラーを正しく処理すること |
| Store連携        | Zustand Store の非同期アクションが Promise 拒否を握りつぶさないこと       |

## アーキテクチャ層別要件

本タスクはテスト品質改善であり、プロダクションコードの変更は最小限に留める。ただし、以下の層で修正が必要になる可能性がある:

| 層                         | 確認観点                                                                                                 |
| -------------------------- | -------------------------------------------------------------------------------------------------------- |
| バックエンド（Main）       | `apps/desktop/src/main/` 配下のサービステストで未処理 Promise 拒否がないか                               |
| フロントエンド（Renderer） | `apps/desktop/src/renderer/` 配下のコンポーネントテストで未処理 Promise 拒否がないか                     |
| IPC通信                    | IPC ハンドラテストで非同期エラーが `expect().rejects` で検証されているか                                 |
| Shared                     | `packages/shared/` のテストは `dangerouslyIgnoreUnhandledErrors` の影響を受けない（別 vitest.config.ts） |

## 多角的チェック観点

| 観点               | 適用   | 確認項目                                                                          |
| ------------------ | ------ | --------------------------------------------------------------------------------- |
| エラーハンドリング | 該当   | 全テストファイルで非同期エラーが `try/catch` または `.catch()` で処理されているか |
| セキュリティ       | 非該当 | -                                                                                 |
| UI/UX              | 非該当 | -                                                                                 |
| パフォーマンス     | 該当   | テスト実行時間の変動を測定し、許容範囲内か確認                                    |

## 成果物

| 成果物           | パス                                         | 説明                       |
| ---------------- | -------------------------------------------- | -------------------------- |
| 要件定義書       | `outputs/phase-1/requirements-definition.md` | FR/NFR の定義              |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`     | 検証可能な受け入れ基準     |
| スコープ定義     | `outputs/phase-1/scope-definition.md`        | 含む/含まないの明確化      |
| 失敗テストリスト | `outputs/phase-1/failing-tests-list.md`      | カテゴリ別の失敗テスト一覧 |

## 完了条件

- [ ] `dangerouslyIgnoreUnhandledErrors: false` でテストを実行し、失敗テストを全件リストアップしている
- [ ] 失敗テストが6カテゴリ（SDK/IPC/Store/非同期クリーンアップ/テストコード/プロダクションコード）に分類されている
- [ ] FR-1〜FR-3 が定義されている
- [ ] NFR-1〜NFR-3 が定義されている
- [ ] 各要件に検証可能な受け入れ基準がある
- [ ] スコープ（含む/含まない）が明確に定義されている
- [ ] アーキテクチャ層別の影響範囲が整理されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

Phase 実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（タスク指示書、error-handling.md、vitest.config.ts）
2. 失敗テストの特定（ステップ 2 の実行）
3. 失敗テストのカテゴリ分類（ステップ 3 の実行）
4. 要件と受け入れ基準の定義（ステップ 4 の実行）
5. 成果物の作成・配置
6. 完了条件の検証

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-FIX-10-1-VITEST-ERROR-HANDLING --phase 1
```

## 次の Phase

Phase 2: 設計
