# タスク仕様書: 認証キー設定画面UI統合

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| タスクID   | UT-AUTH-008                           |
| 作成日     | 2026-02-08                            |
| 優先度     | Medium                                |
| 見積もり   | 4-8時間                               |
| 関連タスク | TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE |
| 発見元     | Phase 5 残課題                        |
| ステータス | 未着手                                |

## 背景

TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE で Claude Agent SDK 用の認証キー管理基盤が構築されたが、
ユーザーがUIから認証キーを設定するための画面は実装されていない。
現在、認証キー管理APIは完成しており、Preload経由で `window.electronAPI.authKey` として
Renderer から利用可能だが、設定画面のUIコンポーネントが存在しない。

## 目的

ユーザーが設定画面から Anthropic API Key を入力・保存・削除できるUIを実装する。

## スコープ

### 含む

- 設定画面に「API キー設定」セクションを追加
- Anthropic API Key の入力フィールド実装
- キーの保存・削除機能の実装
- キー設定状態の表示（設定済み / 未設定）
- 入力値のマスク表示（パスワードフィールド形式）
- `window.electronAPI.authKey.save()` / `.delete()` / `.get()` の呼び出し

### 含まない

- 認証キー管理APIの変更（既に完成済み）
- 複数プロバイダー対応（将来タスク）
- キーのインポート/エクスポート機能

## 技術仕様

### 利用可能なAPI

```typescript
// Preload で公開済みの API
window.electronAPI.authKey.save(key: string): Promise<boolean>
window.electronAPI.authKey.delete(): Promise<boolean>
window.electronAPI.authKey.get(): Promise<string | null>
window.electronAPI.authKey.validate(key: string): Promise<boolean>
```

### UIコンポーネント設計

- 配置場所: 設定画面の認証セクション内
- コンポーネント: `ApiKeySettings.tsx`
- 状態管理: ローカルステート（`useState`）または Zustand slice

### セキュリティ考慮事項

- APIキーは入力後すぐにMain Processへ送信し、Rendererには保持しない
- 表示時は下4桁以外をマスク（例: `sk-ant-***...***abcd`）
- バリデーション結果のみをUIに表示（キー内容は表示しない）

## 完了条件

- [ ] 設定画面に「API キー設定」セクションが表示される
- [ ] APIキーを入力して保存できる
- [ ] 保存済みキーを削除できる
- [ ] キー設定状態（設定済み / 未設定）が正しく表示される
- [ ] 入力フィールドがパスワード形式でマスクされている
- [ ] 保存時にバリデーション結果がフィードバックされる
- [ ] アクセシビリティ要件（WCAG 2.1 AA）を満たす
- [ ] コンポーネントテストが追加されている

## 実装課題と解決策（TASK-FIX-16-1からの学び）

### P21: 既存テストへの DI 追加時の大規模修正

**問題**: 新しいサービス（AuthKeyService）を Dependency Injection で追加すると、既存のテストファイルすべてにモックを追加する必要がある。本タスクで設定画面コンポーネントを追加する際も、同様の問題が発生する可能性がある。

**教訓**: SkillExecutor に AuthKeyService を追加した際、5つのテストファイル（test, auth, retry, integration, permission）すべてに `mockAuthKeyService` を追加する必要があった。

**解決策**:

1. 新しいコンポーネントを追加する際は、関連テストファイルを事前に洗い出す
2. テストファイルごとにモックオブジェクトを定義
3. `beforeEach` でモックをリセット

**本タスクへの適用**: `ApiKeySettings.tsx` コンポーネントを追加する際、`window.electronAPI.authKey` のモックを全テストに適用する方式を検討すること。

### P22: Vitest Worker の予期しない終了

**問題**: 大規模テスト実行時（9000+ テスト）に Vitest Worker が予期せず終了することがある。

**解決策**: テストを分割実行するか、`--poolOptions.workers.max` を調整。コンポーネントテスト追加時は、テスト全体実行への影響を確認すること。

---

## 使用スキル

- task-specification-creator
- aiworkflow-requirements

## 参照資料

| ドキュメント               | パス                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------ |
| 認証キー管理API仕様        | `.claude/skills/claude-agent-sdk/references/query-api.md`                            |
| Preload API定義            | `apps/desktop/src/preload/authKeyApi.ts`                                             |
| IPC ハンドラ実装           | `apps/desktop/src/main/ipc/authKeyHandlers.ts`                                       |
| 設定画面既存実装           | `apps/desktop/src/renderer/features/settings/`                                       |
| UI/UXデザイン原則          | `.claude/rules/01-architecture.md`                                                   |
| 認証キー管理基盤実装ガイド | `docs/30-workflows/sdk-auth-infrastructure/outputs/phase-12/implementation-guide.md` |

## 関連タスク

| タスクID                              | 関係 | 説明                                   |
| ------------------------------------- | ---- | -------------------------------------- |
| TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE | 前提 | 認証キー管理基盤（本タスクの前提）     |
| UT-AUTH-009                           | 関連 | Supabase認証との統合（将来の統合対象） |
| UT-AUTH-002                           | 関連 | SDK apiKeyオプション対応確認           |
