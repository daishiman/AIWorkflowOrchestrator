# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                             |
| -------- | ------------------------------ |
| Phase    | 8                              |
| 機能名   | ipc-response-unwrap            |
| タスクID | UT-FIX-IPC-RESPONSE-UNWRAP-001 |
| 作成日   | 2026-02-14                     |

## 目的

TDD の Refactor フェーズとして、テストを GREEN に維持しながらコード品質を改善する。`safeInvokeUnwrap` 関数および修正した4メソッドの可読性・保守性を向上させる。

## 実行タスク

- コード構造改善: 不要なコメント・デッドコードの除去、エラーメッセージフォーマットの統一
- 命名規則確認: `safeInvokeUnwrap` と `IpcResult<T>` の命名がプロジェクト慣習に準拠しているか検証する
- 型配置検討: `IpcResult<T>` 型の配置場所の妥当性を検証する
- 回帰確認: リファクタリング前後で全テストが GREEN を維持していることを検証する

## 参照資料

| 種別                   | パス                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| Phase 1 要件定義       | `phase-1-requirements.md`                                                                   |
| Phase 2 設計           | `phase-2-design.md`                                                                         |
| Phase 5 実装           | `phase-5-implementation.md`                                                                 |
| Phase 6 テスト拡充     | `phase-6-test-expansion.md`                                                                 |
| Phase 7 カバレッジ確認 | `phase-7-coverage-verification.md`                                                          |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |
| セキュリティ IPC       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                                        | 内容                        |
| ------------------ | ------------------------------------------------------------------------------------------- | --------------------------- |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 命名/構造の統一パターン     |
| セキュリティ IPC   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | Preload層のセキュリティ原則 |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーメッセージの統一      |

## 実行手順

### Task 1: コード構造の改善検討

以下の観点で `apps/desktop/src/preload/skill-api.ts` を検査する:

1. **エラーメッセージフォーマット統一**: `safeInvokeUnwrap` 内のエラーメッセージが他の Preload 関数のエラーメッセージと同じフォーマットであること
2. **IpcResult<T> 型の配置場所**: `skill-api.ts` 内のローカル定義が妥当か、`apps/desktop/src/preload/types.ts` や `packages/shared` への移動が必要か判断する
3. **不要なコメント・デッドコードの除去**: 修正前のコードが残っていないか、TODO コメントが残っていないか確認する
4. **関数の単一責務**: `safeInvokeUnwrap` が IPC 呼び出しとレスポンス展開の2責務を持つ場合、分離の必要性を検討する

### Task 2: 命名規則の確認

1. **`safeInvokeUnwrap`**: 「安全な IPC 呼び出し + レスポンスラッパー展開」という意図が命名から読み取れるか検証する
2. **`IpcResult<T>`**: プロジェクト内の他の型名（`OperationResult` 等）と衝突していないか確認する
3. **引数名・変数名**: `skill-api.ts` 内の変数名がプロジェクトの命名慣習（camelCase、意味のある名前）に準拠しているか確認する

### Task 3: リファクタリング実行

Task 1-2 で特定した改善点を実施する。実施ごとにテストを実行し、GREEN が維持されていることを確認する。

```bash
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api.test.ts
```

リファクタリング実施時の制約:

- 外部から観測可能な振る舞い（関数のシグネチャ、戻り値の型、エラーメッセージのセマンティクス）は変更しない
- `any` 型を新たに導入しない
- 型アサーション（`as`）を新たに追加しない

### Task 4: 変更の検証

リファクタリング完了後、以下のコマンドで全体の整合性を検証する。

```bash
# 型チェック
pnpm typecheck

# 対象テスト
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api.test.ts

# 関連テスト（統合）
cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/agentSlice.test.ts
```

全てのコマンドが PASS であることを確認する。

## 統合テスト連携【必須】

| 観点         | 記録内容                                                |
| ------------ | ------------------------------------------------------- |
| Phase 5 接続 | 実装結果の振る舞いが維持されていること                  |
| Phase 6 接続 | テスト拡充で追加したケースが全て GREEN のままであること |
| Phase 7 接続 | カバレッジが Phase 7 計測時から低下していないこと       |

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

| 成果物               | パス                     | 説明   |
| -------------------- | ------------------------ | ------ |
| リファクタリング仕様 | `phase-8-refactoring.md` | 本文書 |

## 完了条件

- [ ] リファクタリング前後で全テストが GREEN を維持
- [ ] pnpm typecheck が PASS
- [ ] 不要なコメント・デッドコードが除去されている
- [ ] 命名規則がプロジェクト慣習に準拠している
- [ ] `any` 型の新規使用なし
- [ ] 型アサーション（`as`）の新規追加なし
- [ ] IpcResult<T> 型の配置場所の妥当性が検証されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 9: 品質保証（`phase-9-quality-assurance.md`）
