---
id: AUTH-UI-004
tier: 1
title: Googleアバター取得修正
phase: 11
depends_on: [AUTH-UI-001, AUTH-UI-003]
parallel_with: []
blocks: []
status: in_progress
priority: high
estimated_complexity: small
tags: [bugfix, auth, shared, avatar]
issue_number: 347
created_at: 2026-02-04
---

# AUTH-UI-004: Googleアバター取得修正 - メインタスク仕様書

## 概要

Google連携時に「Googleのアバターを使用」オプションがアバターメニューに表示されない問題を修正する。Supabase Auth の `identity_data` 内でアバターURLのキー名がプロバイダーごとに異なることが原因であり、`toLinkedProvider()` 関数でフォールバック処理を実装する。

## 目的

- Google連携ユーザーがGoogleアバターを使用できるようにする
- プロバイダーごとのキー名の違い（Google: `picture`, GitHub/Discord: `avatar_url`）を吸収する
- 全プロバイダーでアバターURLが正しく取得されることを保証する

## 背景

AUTH-UI-003でアバターメニューの動的表示機能を実装した際、Google連携が正常に行われているにもかかわらず「Googleのアバターを使用」オプションがメニューに表示されない問題が報告された。

### 根本原因

| プロバイダー | アバターURLのキー名 |
| ------------ | ------------------- |
| Google       | `picture`           |
| GitHub       | `avatar_url`        |
| Discord      | `avatar_url`        |

`toLinkedProvider()` 関数が `identity_data?.avatar_url` のみを参照していたため、Googleの場合 `avatarUrl` が `null` となっていた。

## スコープ

### 対象

- `toLinkedProvider()` 関数の修正
- `SupabaseIdentity` 型への `picture` プロパティ追加
- 手動動作確認
- ユニットテストの追加

### 対象外

- 他のプロバイダーへの対応（Apple, Twitter等）
- アバター画像の変換・リサイズ

---

## Phase構成

| Phase | 名称                 | 目的                             | ステータス | ドキュメント                                                |
| ----- | -------------------- | -------------------------------- | ---------- | ----------------------------------------------------------- |
| 1     | 要件定義             | 目的・スコープ・受け入れ基準定義 | **完了**   | [phase-01-requirements.md](./phase-01-requirements.md)      |
| 2     | 設計                 | アーキテクチャ・詳細設計         | **完了**   | [phase-02-design.md](./phase-02-design.md)                  |
| 3     | 設計レビューゲート   | 要件・設計の妥当性検証           | **完了**   | [phase-03-design-review.md](./phase-03-design-review.md)    |
| 4     | テスト作成           | TDD: Red（失敗するテスト作成）   | **完了**   | [phase-04-test-creation.md](./phase-04-test-creation.md)    |
| 5     | 実装                 | TDD: Green（テストを通す実装）   | **完了**   | [phase-05-implementation.md](./phase-05-implementation.md)  |
| 6     | テスト拡充           | カバレッジ目標達成               | **完了**   | [phase-06-test-expansion.md](./phase-06-test-expansion.md)  |
| 7     | テストカバレッジ確認 | カバレッジ目標検証               | **完了**   | [phase-07-coverage-verification.md](./phase-07-coverage.md) |
| 8     | リファクタリング     | TDD: Refactor（品質改善）        | **完了**   | [phase-08-refactoring.md](./phase-08-refactoring.md)        |
| 9     | 品質保証             | 静的解析・セキュリティ           | **完了**   | [phase-09-quality-assurance.md](./phase-09-quality.md)      |
| 10    | 最終レビューゲート   | 全体品質・整合性検証             | **完了**   | [phase-10-final-review.md](./phase-10-final-review.md)      |
| 11    | 手動テスト検証       | 実環境動作確認                   | 作業中     | [phase-11-manual-test.md](./phase-11-manual-test.md)        |
| 12    | ドキュメント更新     | ドキュメント更新・仕様反映       | 未着手     | [phase-12-documentation.md](./phase-12-documentation.md)    |
| 13    | PR作成               | コミット・PR・CI確認             | 未着手     | [phase-13-pr-creation.md](./phase-13-pr-creation.md)        |

---

## 成果物一覧

| 成果物                                                   | Phase | 説明                     | ステータス |
| -------------------------------------------------------- | ----- | ------------------------ | ---------- |
| `packages/shared/types/auth.ts`                          | 5     | SupabaseIdentity型修正   | **完了**   |
| `packages/shared/infrastructure/auth/supabase-client.ts` | 5     | toLinkedProvider関数修正 | **完了**   |
| テストケース                                             | 4, 6  | ユニットテスト           | **完了**   |
| 手動テスト結果                                           | 11    | 動作確認レポート         | 未着手     |
| 実装ガイド                                               | 12    | ドキュメント             | 未着手     |

---

## 依存関係

### 前提タスク

| タスクID    | タイトル                 | 依存内容             | ステータス |
| ----------- | ------------------------ | -------------------- | ---------- |
| AUTH-UI-001 | 認証UI改善               | 認証基盤             | 完了       |
| AUTH-UI-003 | アバターメニュー動的表示 | アバターメニュー機能 | 完了       |

### 後続タスク

なし（バグ修正のため）

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料           | パス                                                                              | 内容                    |
| ------------------ | --------------------------------------------------------------------------------- | ----------------------- |
| 認証アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md` | Supabase + Electron認証 |
| 認証型定義         | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`            | 認証・プロフィール型    |
| 認証IPCチャネル    | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`               | IPC通信仕様             |

### 関連ファイル

| ファイル                                                                  | 説明                 |
| ------------------------------------------------------------------------- | -------------------- |
| `packages/shared/types/auth.ts`                                           | SupabaseIdentity型   |
| `packages/shared/infrastructure/auth/supabase-client.ts`                  | toLinkedProvider関数 |
| `apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx` | アバターメニューUI   |

---

## 完了条件（全Phase完了時）

### 機能要件

- [x] コード修正が完了している
- [ ] Google連携時に「Googleのアバターを使用」オプションが表示される
- [ ] Googleアバターをクリックして使用できる
- [ ] GitHub/Discordアバターも引き続き動作する

### 品質要件

- [x] 全テスト通過（1265テスト）
- [x] 型エラーなし
- [x] Lintエラーなし
- [ ] 手動テスト検証完了

### ドキュメント要件

- [x] コードにJSDocコメントが追加されている
- [ ] 実装ガイドが作成されている
- [ ] 未タスク検出レポートが作成されている

---

## 実装済みコード

### packages/shared/types/auth.ts

```typescript
export interface SupabaseIdentity {
  id: string;
  provider: string;
  identity_data?: {
    email?: string;
    name?: string;
    avatar_url?: string;
    picture?: string; // Google uses 'picture' instead of 'avatar_url'
  };
  created_at: string;
}
```

### packages/shared/infrastructure/auth/supabase-client.ts

```typescript
// プロバイダーによってavatarのキー名が異なる
// Google: picture, GitHub/Discord: avatar_url
const avatarUrl =
  identity.identity_data?.avatar_url ?? identity.identity_data?.picture ?? null;
```

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-02-04 | 初版作成 |
