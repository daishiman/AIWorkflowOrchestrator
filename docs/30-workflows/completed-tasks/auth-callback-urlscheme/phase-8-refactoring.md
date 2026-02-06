# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目     | 内容                    |
| -------- | ----------------------- |
| Phase    | 8                       |
| 機能名   | auth-callback-urlscheme |
| 作成日   | 2026-02-05              |
| タスクID | TASK-AUTH-CALLBACK-001  |

---

## 目的

Phase 5で実装した認証コールバック機能の動作を変えずにコード品質を改善する。重複コードの除去、命名の統一、関数分割、型安全性の強化、エラーハンドリングの統一を行い、保守性と可読性を向上させる。

---

## 実行タスク

- Task 1: コード品質改善 - 重複コードの除去、命名の統一、関数分割
- Task 2: 型安全性の強化 - 認証関連の型定義をshared packageに集約
- Task 3: エラーハンドリングの統一 - OAuthエラー、HTTPサーバーエラー、PKCEエラーの統一的な処理
- Task 4: テスト継続成功確認 - リファクタリング後に全テストがパスすることを確認

---

## 参照資料

| 参照資料              | パス                                                                              | 内容                         |
| --------------------- | --------------------------------------------------------------------------------- | ---------------------------- |
| Phase 5実装サマリー   | `outputs/phase-5/implementation-summary.md`                                       | 実装済みコンポーネント一覧   |
| Phase 7カバレッジ     | `outputs/phase-7/coverage-report.md`                                              | テストカバレッジ測定結果     |
| PKCEモジュール        | `apps/desktop/src/main/auth/pkce.ts`                                              | PKCE生成ユーティリティ       |
| HTTPサーバー          | `apps/desktop/src/main/auth/authCallbackServer.ts`                                | コールバック受信サーバー     |
| オーケストレーター    | `apps/desktop/src/main/auth/authFlowOrchestrator.ts`                              | 認証フロー全体制御           |
| 認証ハンドラー        | `apps/desktop/src/main/ipc/authHandlers.ts`                                       | IPC認証ハンドラー            |
| カスタムプロトコル    | `apps/desktop/src/main/protocol/customProtocol.ts`                                | URLスキーム処理              |
| OAuthエラーハンドラー | `apps/desktop/src/main/auth/oauth-error-handler.ts`                               | OAuthエラー検出・マッピング  |
| 認証セキュリティ仕様  | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md` | 認証基盤設計                 |
| 認証インターフェース  | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`            | AuthUser型、プロバイダー定義 |

---

## 実行手順

### Task 1: コード品質改善

**目的**: 重複コードの除去、命名の統一、関数分割によりコードの可読性と保守性を向上させる。

**実行手順**:

1. **authHandlers.tsの既存Implicit Flow処理とPKCE処理の統合**
   - Implicit Flow（旧方式）の処理が残っている場合は削除する
   - PKCE方式に統一されていることを確認
   - authFlowOrchestratorへの委譲パターンが一貫していることを確認

2. **customProtocol.tsのフォールバック処理の整理**
   - `aiworkflow://auth/done`（新方式）と `aiworkflow://auth/callback#...`（旧フォールバック）の処理を整理
   - 条件分岐の構造を明確化（コメント追加、関数抽出）
   - macOS `open-url`イベントとWindows `second-instance`イベントの処理を統一的なパターンに

3. **共通ユーティリティの抽出**
   - Base64URLエンコード処理が複数箇所にある場合は共通関数に集約
   - ログ出力パターンの統一（コンポーネント名プレフィックス）
   - クリーンアップ処理（サーバー停止、Map削除）のパターン統一

4. **コードスメル検出と修正**
   - 長すぎる関数を適切な粒度に分割
   - マジックナンバーの定数化（タイムアウト値、ポート範囲等）
   - ネストの深い条件分岐の早期リターンパターンへの変換

**期待される成果物**:

- リファクタリング済みソースコード（動作変更なし）

---

### Task 2: 型安全性の強化

**目的**: 認証関連の型定義をshared packageに集約し、Main Process / Renderer Process / Preload間で型の一貫性を確保する。

**実行手順**:

1. **shared packageへの型集約**
   - `PKCEPair` 型を `packages/shared/types/` に移動
   - `AuthCallbackResult` 型を `packages/shared/types/` に配置
   - `AuthFlowState`（認証フロー状態: idle / authenticating / success / error）を定義
   - 既存の `AuthUser` 型、`OAuthProvider` 型との整合性を確認

2. **型定義ファイルの作成・更新**

   ```
   packages/shared/types/
   ├── auth.ts          # 既存: AuthUser, OAuthProvider等
   ├── auth-pkce.ts     # 新規: PKCEPair, AuthCallbackResult, AuthFlowState
   └── index.ts         # エクスポート更新
   ```

3. **実装ファイルのimport更新**
   - `apps/desktop/src/main/auth/pkce.ts` から型定義をsharedからimportに変更
   - `apps/desktop/src/main/auth/authCallbackServer.ts` 同様
   - `apps/desktop/src/main/auth/authFlowOrchestrator.ts` 同様

4. **型ガードの追加**
   - `isAuthCallbackResult(value: unknown): value is AuthCallbackResult` を追加
   - IPC通信で受信するデータの型安全性を確保

**期待される成果物**:

- `packages/shared/types/auth-pkce.ts`（新規または既存ファイルへの追加）
- 各実装ファイルのimport更新

---

### Task 3: エラーハンドリングの統一

**目的**: OAuthエラー、HTTPサーバーエラー、PKCEエラーを統一的に処理し、既存のoauth-error-handler.tsとの統合を行う。

**実行手順**:

1. **エラー分類の定義**
   | エラー種別 | 発生箇所 | 処理方式 | AUTH_ERROR_CODESマッピング |
   | -------------------- | --------------------------- | ---------------------------------------- | --------------------------------- |
   | OAuthエラー | Supabase認証プロバイダー | 既存 `parseOAuthError()` で検出 → `mapOAuthErrorToMessage()` でマッピング | 既存マッピングを維持 |
   | HTTPサーバーエラー | authCallbackServer | ポートバインド失敗、タイムアウト | `SERVER_START_FAILED`, `TIMEOUT` |
   | PKCEエラー | pkce.ts | verifier生成失敗、challenge算出失敗 | `PKCE_GENERATION_FAILED` |
   | State検証エラー | authFlowOrchestrator | CSRF攻撃の可能性、期限切れ | `STATE_MISMATCH`, `STATE_EXPIRED` |
   | トークン交換エラー | authFlowOrchestrator | Supabase API応答エラー | `TOKEN_EXCHANGE_FAILED` |

2. **既存oauth-error-handler.tsとの統合**
   - `oauth-error-handler.ts` のエラーマッピング関数を拡張し、新規エラー種別をカバー
   - HTTPサーバーエラー、PKCEエラー、State検証エラーのマッピングルールを追加
   - エラーメッセージの統一的なフォーマット（ユーザー向け/ログ向け）

3. **エラー伝播パターンの統一**
   - authFlowOrchestrator内でのtry/catchパターンを統一
   - IPC経由でのRenderer Processへのエラー通知パターンを確認
   - エラー発生時のクリーンアップ処理（HTTPサーバー停止、Map削除）が漏れなく行われることを確認

4. **エラーログの改善**
   - 各エラーにコンテキスト情報（provider名、エラーコード等）を付加
   - セキュリティ上の機密情報（code_verifier等）がログに出力されないことを確認

**期待される成果物**:

- 統合されたエラーハンドリングコード
- エラーマッピングテーブルの拡張

---

### Task 4: テスト継続成功確認

**目的**: リファクタリング後に全テストがパスし、カバレッジが維持されていることを確認する。

**実行手順**:

1. **全テスト実行**

   ```bash
   # Phase 4/6で作成した全テスト実行
   pnpm --filter @repo/desktop test -- --run src/main/auth/__tests__/

   # 既存テストのリグレッション確認
   pnpm --filter @repo/desktop test -- --run

   # 全パッケージテスト実行
   pnpm vitest run
   ```

2. **カバレッジ維持確認**

   ```bash
   # カバレッジ付きテスト実行
   pnpm --filter @repo/desktop test -- --run --coverage \
     --coverage.include='src/main/auth/pkce.ts' \
     --coverage.include='src/main/auth/authCallbackServer.ts' \
     --coverage.include='src/main/auth/authFlowOrchestrator.ts' \
     --coverage.include='src/main/ipc/authHandlers.ts'
   ```

3. **確認項目**
   - Phase 4で作成した全テストケースがパスすること
   - Phase 6で追加した全テストケースがパスすること
   - 既存テスト（oauth-error-handler.test.ts等）がパスすること
   - カバレッジがPhase 7の測定結果と同等以上であること

**期待される成果物**:

- テスト実行結果（全パス確認）

---

## TDD検証: Refactor後のテスト確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --run

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認（Green維持）
```

---

## 統合テスト連携

リファクタ後の統合テスト継続成功を確認:

```bash
# リファクタリング後の全テスト実行
pnpm --filter @repo/desktop test -- --run
pnpm vitest run
```

| 確認項目                        | 基準            | 結果 | 状態 |
| ------------------------------- | --------------- | ---- | ---- |
| PKCE生成テスト                  | 全パス          | -    | -    |
| HTTPサーバーテスト              | 全パス          | -    | -    |
| オーケストレーターテスト        | 全パス          | -    | -    |
| IPC統合テスト                   | 全パス          | -    | -    |
| 既存oauth-error-handlerテスト   | 全パス          | -    | -    |
| 既存authSliceテスト             | 全パス          | -    | -    |
| カバレッジ維持（Line 80%+）     | Phase 7同等以上 | -    | -    |
| カバレッジ維持（Branch 60%+）   | Phase 7同等以上 | -    | -    |
| カバレッジ維持（Function 80%+） | Phase 7同等以上 | -    | -    |

> 注: 上記の「-」は実行時に測定結果を記入する

---

## 成果物

| 成果物                 | パス                                     | 説明                       |
| ---------------------- | ---------------------------------------- | -------------------------- |
| リファクタリングサマリ | `outputs/phase-8/refactoring-summary.md` | 変更内容と改善点のまとめ   |
| 型定義集約             | `packages/shared/types/auth-pkce.ts`     | shared packageの型定義     |
| テスト結果             | `outputs/phase-8/test-result.md`         | リファクタリング後のテスト |

---

## 完了条件

- [ ] authHandlers.tsの既存Implicit Flow処理とPKCE処理が統合されている
- [ ] customProtocol.tsのフォールバック処理が整理されている
- [ ] 認証関連の型定義がpackages/shared/types/に集約されている
- [ ] OAuthエラー、HTTPサーバーエラー、PKCEエラーが統一的に処理されている
- [ ] 既存のoauth-error-handler.tsとの統合が完了している
- [ ] 全テスト（Phase 4 + Phase 6 + 既存）がGreen状態を維持している
- [ ] カバレッジがPhase 7の測定結果と同等以上である
- [ ] **本Phase内の全タスクを100%実行完了**

---

## タスク100%実行確認

- [ ] Task 1: コード品質改善（重複除去・命名統一・関数分割） - 完了
- [ ] Task 2: 型安全性の強化（shared packageへの型集約） - 完了
- [ ] Task 3: エラーハンドリングの統一（oauth-error-handler統合） - 完了
- [ ] Task 4: テスト継続成功確認（全テストGreen・カバレッジ維持） - 完了

---

## 次のPhase

[Phase 9: 品質保証](phase-9-quality-assurance.md)
