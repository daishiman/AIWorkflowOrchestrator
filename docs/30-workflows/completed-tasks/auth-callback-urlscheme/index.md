# 認証コールバックURLスキーム修正 - ワークフローインデックス

## メタ情報

| 項目         | 内容                              |
| ------------ | --------------------------------- |
| タスクID     | TASK-AUTH-CALLBACK-001            |
| Issue番号    | #274                              |
| 機能名       | auth-callback-urlscheme           |
| タスク名     | 認証コールバックURLスキーム修正   |
| 分類         | バグ修正・機能改善                |
| 対象機能     | 認証                              |
| 優先度       | 中                                |
| 見積もり規模 | 中規模                            |
| ステータス   | 未実施                            |
| 作成日       | 2026-02-05                        |
| ブランチ名   | task-auth-callback-urlscheme-spec |

---

## タスク概要

Electron アプリケーションの OAuth 認証コールバックを、不特定多数のユーザーが安全に利用できるよう、以下の改善を実施する:

1. **Implicit Flow → Authorization Code Flow + PKCE への移行**: URLフラグメントにトークンが露出するImplicit Flowから、よりセキュアなPKCEフローに移行
2. **ローカルHTTPサーバー + カスタムURLスキームのハイブリッド方式**: 開発ビルド・パッケージ版の両方で確実に動作するコールバック受信
3. **State parameter検証によるCSRF対策**: OAuth認証開始時にstateを生成し、コールバック時に検証
4. **devMockAuth.ts の一時修正の復元**: 開発環境の認証スキップを元に戻す

### 技術的負債の同時解消

| DEBT ID      | 内容                          | 本タスクでの対応 |
| ------------ | ----------------------------- | ---------------- |
| DEBT-SEC-001 | State parameter検証           | 実装             |
| DEBT-SEC-002 | PKCE実装                      | 実装             |
| DEBT-SEC-003 | カスタムプロトコルURL詳細検証 | 実装             |

---

## Phase一覧

| Phase | 名称                 | 仕様書                                                       | ステータス |
| ----- | -------------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | 未実施     |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | 未実施     |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | 未実施     |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | 未実施     |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | 未実施     |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | 未実施     |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | 未実施     |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | 未実施     |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | 未実施     |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | 未実施     |
| 11    | 手動テスト検証       | [phase-11-manual-testing.md](phase-11-manual-testing.md)     | 未実施     |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | 未実施     |
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | 未実施     |

---

## 依存関係

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
                                                                  ↓
Phase 13 ← Phase 12 ← Phase 11 ← Phase 10 ← Phase 9 ← Phase 8 ←
```

---

## 関連リソース

| リソース               | パス                                                                              |
| ---------------------- | --------------------------------------------------------------------------------- |
| 元タスク指示書         | `docs/30-workflows/unassigned-task/task-auth-callback-url-scheme.md`              |
| GitHub Issue           | #274                                                                              |
| 認証仕様               | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`            |
| セキュリティ仕様       | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md` |
| Electron IPC仕様       | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`      |
| 既存カスタムプロトコル | `apps/desktop/src/main/protocol/customProtocol.ts`                                |
| 既存認証ハンドラー     | `apps/desktop/src/main/ipc/authHandlers.ts`                                       |
| OAuthエラーハンドラー  | `apps/desktop/src/main/auth/oauth-error-handler.ts`                               |
| devMockAuth            | `apps/desktop/src/renderer/utils/devMockAuth.ts`                                  |
| 認証状態管理           | `apps/desktop/src/renderer/store/slices/authSlice.ts`                             |
