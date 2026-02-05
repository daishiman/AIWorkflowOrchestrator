# Phase 4: テスト作成（TDD: Red） - タスク仕様書

## メタ情報

| 項目       | 内容             |
| ---------- | ---------------- |
| Phase      | 4                |
| Phase名    | テスト作成       |
| 前提Phase  | Phase 3          |
| 後続Phase  | Phase 5          |
| ステータス | 未実施           |
| 作成日     | 2026-02-04       |
| 機能名     | google-login-fix |

---

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。

## 背景

TDD原則に従い、4つの問題点それぞれに対するテストを先に作成し、現状で失敗することを確認する。

---

## 実行タスク

### タスク1: Auth Callbackエラーハンドリングテスト作成

**目的**: OAuth認証失敗時のエラー処理テストを作成する

**実行手順**:

1. `apps/desktop/src/main/index.ts` のcallback処理に対するテストを作成する
2. 以下のケースをカバーする:
   - error=access_denied パラメータがある場合
   - error_description パラメータがある場合
   - error パラメータのみの場合
   - 正常なトークンがある場合（既存動作確認）

**期待される成果物**:

- `apps/desktop/src/main/__tests__/auth-callback.test.ts`

---

### タスク2: Supabase設定検証テスト作成

**目的**: 環境変数未設定時のエラーレスポンステストを作成する

**実行手順**:

1. AUTH_ERROR_CODESにAUTH_NOT_CONFIGUREDが含まれることをテストする
2. フォールバックハンドラーのレスポンス形式をテストする
3. 環境変数未設定時の挙動をモックでテストする

**期待される成果物**:

- `packages/shared/types/__tests__/auth.test.ts` （エラーコードテスト）
- `apps/desktop/src/main/infrastructure/__tests__/supabaseClient.test.ts`

---

### タスク3: セッション管理テスト作成

**目的**: リフレッシュトークン期限管理のテストを作成する

**実行手順**:

1. セッション情報にリフレッシュトークン期限が含まれることをテストする
2. 期限切れ前警告のロジックをテストする
3. トークンリフレッシュ失敗時の挙動をテストする

**期待される成果物**:

- `apps/desktop/src/main/ipc/__tests__/authHandlers.test.ts` （追加テスト）

---

### タスク4: 認証状態リスナーテスト作成

**目的**: リスナー安定性のテストを作成する

**実行手順**:

1. リスナーの二重登録防止をテストする
2. 動的タイムアウトの挙動をテストする
3. 再ログイン時の状態遷移をテストする

**期待される成果物**:

- `apps/desktop/src/renderer/store/slices/__tests__/authSlice.test.ts` （追加テスト）

---

## 参照資料

| 参照資料     | パス                                         | 内容          |
| ------------ | -------------------------------------------- | ------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 設計書       | `outputs/phase-2/architecture-design.md`     | Phase 2成果物 |
| レビュー結果 | `outputs/phase-3/design-review-result.md`    | Phase 3成果物 |

---

## 成果物

| 成果物             | パス                                         | 説明               |
| ------------------ | -------------------------------------------- | ------------------ |
| テスト仕様書       | `outputs/phase-4/test-specification.md`      | テスト設計         |
| テストケース       | `outputs/phase-4/test-cases.md`              | ケース一覧         |
| 統合テストシナリオ | `outputs/phase-4/integration-test-design.md` | 統合テスト設計     |
| テストファイル     | `apps/desktop/src/**/*.test.ts`              | 実際のテストコード |

---

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ   | 検証内容                                       | テストファイル          |
| ------------------ | ---------------------------------------------- | ----------------------- |
| API接続テスト      | Supabase OAuth API疎通・レスポンス形式         | `*.integration.test.ts` |
| データフローテスト | OAuth→トークン保存→セッション復元→Renderer通知 | `*.flow.test.ts`        |
| エラーハンドリング | OAuth失敗時のRenderer表示・リトライ            | `*.error.test.ts`       |
| 認証連携テスト     | トークン取得・リフレッシュ・期限切れ処理       | `*.auth.test.ts`        |
| 状態同期テスト     | authSlice状態更新・リスナー二重登録防止        | `*.sync.test.ts`        |

---

## アーキテクチャ層別テスト

| 層               | テスト観点                                   | テストファイル配置                       |
| ---------------- | -------------------------------------------- | ---------------------------------------- |
| Renderer Process | authSlice、リスナー管理、状態遷移            | `apps/desktop/src/renderer/**/*.test.ts` |
| Main Process     | callback処理、authHandlers、supabaseClient   | `apps/desktop/src/main/**/*.test.ts`     |
| IPC通信          | AUTH_STATE_CHANGEDイベント、エラーペイロード | `*.ipc.test.ts`                          |
| Shared           | AUTH_ERROR_CODES、型定義                     | `packages/shared/**/*.test.ts`           |

---

## 完了条件

- [ ] Auth Callbackエラーハンドリングのテストが作成されている
- [ ] Supabase設定検証のテストが作成されている
- [ ] セッション管理のテストが作成されている
- [ ] 認証状態リスナーのテストが作成されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] テストカバレッジ目標が設定されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が完了していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-FIX-GOOGLE-LOGIN-001/phase-5-implementation.md`
