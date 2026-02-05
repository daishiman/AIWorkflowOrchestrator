# Phase 5: 実装（TDD: Green） - タスク仕様書

## メタ情報

| 項目       | 内容             |
| ---------- | ---------------- |
| Phase      | 5                |
| Phase名    | 実装             |
| 前提Phase  | Phase 4          |
| 後続Phase  | Phase 6          |
| ステータス | 未実施           |
| 作成日     | 2026-02-04       |
| 機能名     | google-login-fix |

---

## 目的

テストを通すための最小限の実装を行う。

## 背景

Phase 4で作成した失敗テストを成功させるため、4つの問題点に対する修正を実装する。

---

## 実行タスク

### タスク1: Auth Callbackエラーハンドリング実装

**目的**: OAuth認証失敗時のエラー処理を実装する

**実行手順**:

1. `apps/desktop/src/main/index.ts` のcallback処理を修正する
2. URL解析でerror/error_descriptionパラメータを検出する
3. エラーメッセージをマッピングして適切なメッセージを生成する
4. AUTH_STATE_CHANGEDイベントでエラー情報をRenderer側に通知する

**対象ファイル**:

- `apps/desktop/src/main/index.ts`

**期待される成果物**:

- 修正済みcallback処理
- エラーメッセージマッピング

---

### タスク2: Supabase設定検証実装

**目的**: 環境変数未設定時の適切なエラーレスポンスを実装する

**実行手順**:

1. `packages/shared/types/auth.ts` のAUTH_ERROR_CODESにAUTH_NOT_CONFIGUREDを追加する
2. `apps/desktop/src/main/infrastructure/supabaseClient.ts` のフォールバック処理を修正する
3. フォールバックハンドラーのエラーレスポンス形式を統一する

**対象ファイル**:

- `packages/shared/types/auth.ts`
- `apps/desktop/src/main/infrastructure/supabaseClient.ts`
- `apps/desktop/src/main/ipc/index.ts`

**期待される成果物**:

- AUTH_NOT_CONFIGUREDエラーコード追加
- 統一されたエラーレスポンス形式

---

### タスク3: セッション管理改善実装

**目的**: リフレッシュトークン期限管理を実装する

**実行手順**:

1. `apps/desktop/src/main/ipc/authHandlers.ts` のセッション情報にリフレッシュトークン期限を含める
2. Supabaseのセッション情報からリフレッシュトークン期限を取得する
3. AUTH_STATE_CHANGEDイベントのペイロードに期限情報を追加する

**対象ファイル**:

- `apps/desktop/src/main/ipc/authHandlers.ts`
- `packages/shared/types/auth.ts` （型定義拡張）

**期待される成果物**:

- リフレッシュトークン期限情報の送信
- 型定義の拡張

---

### タスク4: 認証状態リスナー改善実装

**目的**: リスナー安定性を向上させる実装を行う

**実行手順**:

1. `apps/desktop/src/renderer/store/slices/authSlice.ts` のリスナー登録にフラグを追加する
2. クリーンアップ関数を実装し、二重登録を防止する
3. 500ms固定待機を動的タイムアウトに置き換える（Promiseベース）

**対象ファイル**:

- `apps/desktop/src/renderer/store/slices/authSlice.ts`

**期待される成果物**:

- 二重登録防止実装
- 動的タイムアウト実装

---

## 参照資料

| 参照資料             | パス                                                                                        | 内容                               |
| -------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------- |
| 設計書               | `outputs/phase-2/architecture-design.md`                                                    | Phase 2成果物                      |
| テスト仕様書         | `outputs/phase-4/test-specification.md`                                                     | Phase 4成果物                      |
| 認証インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                      | Auth型、AuthErrorCode定義          |
| 認証IPC API          | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`                         | auth:\* チャンネル、状態管理       |
| エラーハンドリング   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラー分類、リトライ戦略           |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 認証フォールバック、実装パターン集 |
| Electron IPC         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | contextIsolation、CSP              |

---

## 成果物

| 成果物     | パス                                                     | 説明         |
| ---------- | -------------------------------------------------------- | ------------ |
| 実装コード | `apps/desktop/src/main/index.ts`                         | callback     |
| 実装コード | `packages/shared/types/auth.ts`                          | エラーコード |
| 実装コード | `apps/desktop/src/main/infrastructure/supabaseClient.ts` | 設定検証     |
| 実装コード | `apps/desktop/src/main/ipc/authHandlers.ts`              | セッション   |
| 実装コード | `apps/desktop/src/renderer/store/slices/authSlice.ts`    | リスナー     |

---

## 統合テスト連携【必須】

Main/Renderer接続の実装とテスト支援コード整備:

| 実装項目           | 内容                                                    |
| ------------------ | ------------------------------------------------------- |
| API接続            | Supabase OAuth API呼び出し（エラーハンドリング追加）    |
| エラーハンドリング | AUTH_STATE_CHANGEDイベントにerror情報追加               |
| 状態同期           | authSliceリスナー改善（二重登録防止、動的タイムアウト） |

---

## アーキテクチャ層別実装

| 層               | 実装観点                         | 実装ファイル配置                          | 仕様参照先                      |
| ---------------- | -------------------------------- | ----------------------------------------- | ------------------------------- |
| Renderer Process | authSliceリスナー改善            | `apps/desktop/src/renderer/store/slices/` | `ui-ux-*.md`                    |
| Main Process     | callback処理、authHandlers、検証 | `apps/desktop/src/main/`                  | `architecture-auth-security.md` |
| IPC通信          | AUTH_STATE_CHANGEDペイロード拡張 | `apps/desktop/src/main/ipc/`              | `api-ipc-auth.md`               |
| Shared           | AUTH_ERROR_CODES、型定義         | `packages/shared/types/`                  | -                               |

---

## 完了条件

- [ ] Auth Callbackエラーハンドリングが実装されている
- [ ] Supabase設定検証が実装されている
- [ ] セッション管理改善が実装されている
- [ ] 認証状態リスナー改善が実装されている
- [ ] すべてのテストが成功状態（Green）
- [ ] Main/Renderer接続が実装されている
- [ ] アーキテクチャ層別の実装が適切に配置されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-FIX-GOOGLE-LOGIN-001/phase-6-test-expansion.md`
