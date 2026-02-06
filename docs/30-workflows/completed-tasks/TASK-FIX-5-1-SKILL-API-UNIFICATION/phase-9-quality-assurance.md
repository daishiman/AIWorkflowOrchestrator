# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 9                                  |
| 機能名 | TASK-FIX-5-1-SKILL-API-UNIFICATION |
| 作成日 | 2026-02-05                         |

## 目的

定義された品質基準をすべて満たすことを検証する。機能検証・コード品質・テスト網羅性・セキュリティの4観点から総合的に品質を保証する。

## 参照資料

| 資料名               | パス                                    | 説明          |
| -------------------- | --------------------------------------- | ------------- |
| リファクタリング報告 | `outputs/phase-8/refactoring-report.md` | Phase 8成果物 |
| 統一API設計書        | `outputs/phase-2/unified-api-design.md` | Phase 2成果物 |
| 仕様書               | `specification.md §4`                   | API仕様定義   |

## 実行タスク

### Task 1: 機能検証

#### 目的

統一SkillAPIの全機能が正しく動作することを検証する。

#### 検証項目

| 機能カテゴリ | 検証内容                                              | 結果       |
| ------------ | ----------------------------------------------------- | ---------- |
| 一覧・管理   | `list()` がスキル一覧を正しく返却する                 | {{RESULT}} |
| 一覧・管理   | `getImported()` がインポート済みスキルを返却する      | {{RESULT}} |
| 一覧・管理   | `import()` がスキルをインポートできる                 | {{RESULT}} |
| 一覧・管理   | `remove()` がスキルを削除できる                       | {{RESULT}} |
| 一覧・管理   | `rescan()` がスキルリストを更新する                   | {{RESULT}} |
| 実行         | `execute()` がスキルを実行し `executionId` を返却する | {{RESULT}} |
| 実行         | `abort()` が実行中のスキルを中止する                  | {{RESULT}} |
| 実行         | `getExecutionStatus()` が実行状態を返却する           | {{RESULT}} |
| イベント     | `onStream()` がストリーミングデータを受信する         | {{RESULT}} |
| イベント     | `onComplete()` が完了通知を受信する                   | {{RESULT}} |
| イベント     | `onError()` がエラー通知を受信する                    | {{RESULT}} |
| 権限         | `onPermissionRequest()` が権限要求を受信する          | {{RESULT}} |
| 権限         | `sendPermissionResponse()` が権限応答を送信する       | {{RESULT}} |

### Task 2: コード品質

#### 目的

lint、型チェック、テストの全てがエラーなしで通過することを確認する。

#### 実行コマンド

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# リント
pnpm --filter @repo/desktop lint

# テスト
pnpm --filter @repo/desktop test

# カバレッジ
pnpm --filter @repo/desktop test:coverage
```

#### 品質ゲート

| 判定項目               | 基準    | 結果       | 判定          |
| ---------------------- | ------- | ---------- | ------------- |
| TypeScript型チェック   | エラー0 | {{RESULT}} | {{PASS/FAIL}} |
| ESLintチェック         | エラー0 | {{RESULT}} | {{PASS/FAIL}} |
| ユニットテスト         | 全PASS  | {{RESULT}} | {{PASS/FAIL}} |
| ユニットテストLine     | 80%+    | {{RESULT}} | {{PASS/FAIL}} |
| ユニットテストBranch   | 60%+    | {{RESULT}} | {{PASS/FAIL}} |
| ユニットテストFunction | 80%+    | {{RESULT}} | {{PASS/FAIL}} |

### Task 3: テスト網羅性

#### 目的

テストが全ての主要パスをカバーしていることを検証する。

#### 検証項目

| テストカテゴリ                      | テスト数 | 結果       |
| ----------------------------------- | -------- | ---------- |
| 統一APIメソッドテスト（13メソッド） | {{NUM}}  | {{RESULT}} |
| エラーハンドリングテスト            | {{NUM}}  | {{RESULT}} |
| 境界値・異常系テスト                | {{NUM}}  | {{RESULT}} |
| イベントリスナーライフサイクル      | {{NUM}}  | {{RESULT}} |
| IPCチャンネル統合テスト             | {{NUM}}  | {{RESULT}} |
| 呼び出し元移行テスト                | {{NUM}}  | {{RESULT}} |

### Task 4: セキュリティ

#### 目的

Electron固有のセキュリティ要件が満たされていることを確認する。

#### セキュリティチェック

| 確認項目                                                      | 結果       |
| ------------------------------------------------------------- | ---------- |
| `contextBridge.exposeInMainWorld` で公開するAPIが最小限である | {{RESULT}} |
| `window.electronAPI.skill` のみが公開ポイントである           | {{RESULT}} |
| `window.skillAPI` が廃止されている                            | {{RESULT}} |
| `validateIpcSender` がMain Process側で維持されている          | {{RESULT}} |
| IPCチャンネルがホワイトリスト方式で管理されている             | {{RESULT}} |
| Preload Scriptが不要なNode.js APIを公開していない             | {{RESULT}} |

## 統合テスト連携【必須】

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop test
pnpm --filter @repo/desktop test:coverage
```

| 判定項目               | 基準    | 結果       |
| ---------------------- | ------- | ---------- |
| 型チェック             | エラー0 | {{RESULT}} |
| リント                 | エラー0 | {{RESULT}} |
| ユニットテストLine     | 80%+    | {{RESULT}} |
| ユニットテストBranch   | 60%+    | {{RESULT}} |
| ユニットテストFunction | 80%+    | {{RESULT}} |

## 成果物

| 成果物       | パス                                | 説明         |
| ------------ | ----------------------------------- | ------------ |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質保証結果 |

## 完了条件

- [ ] 全13メソッドの機能検証が完了している
- [ ] TypeScript型チェックがエラーなし
- [ ] ESLintチェックがエラーなし
- [ ] 全テストがPASSしている
- [ ] カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を満たしている
- [ ] テスト網羅性が確認されている（全カテゴリのテストが存在する）
- [ ] セキュリティチェック（6項目）が全て確認済み
- [ ] `contextBridge` 公開APIが `window.electronAPI.skill` に一本化されている
- [ ] `validateIpcSender` が維持されている
- [ ] 品質レポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 10: 最終レビューゲート
