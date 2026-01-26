# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 4                                      |
| Phase名    | テスト作成（TDD: Red）                 |
| 前提Phase  | Phase 3                                |
| 後続Phase  | Phase 5                                |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-25                             |
| 機能名     | task-3-1-e-remember-choice-persistence |

---

## 目的

TDDの「Red」フェーズとして、PermissionStoreおよび関連機能の失敗するテストを作成する。

## 背景

テストファーストの原則に従い、実装前にテストを作成することで、要件を明確にし、設計の妥当性を検証する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: PermissionStoreユニットテスト作成

**目的**: PermissionStoreクラスのユニットテストを作成する

**実行手順**:

1. `apps/desktop/src/main/services/skill/__tests__/PermissionStore.test.ts`を作成
2. 以下のテストケースを実装:
   - `isToolAllowed`: 未許可ツールでfalse、許可済みツールでtrueを返す
   - `allowTool`: ツールを許可リストに追加
   - `revokeTool`: ツールを許可リストから削除
   - `getAllowedTools`: 許可済みツール一覧を返す
   - `clearAll`: 全許可設定をクリア
3. エッジケースのテストを追加（重複許可、存在しないツール削除など）
4. electron-storeのモック設定

**期待される成果物**:

- `apps/desktop/src/main/services/skill/__tests__/PermissionStore.test.ts`

**テストケース例**:

```typescript
describe('PermissionStore', () => {
  describe('isToolAllowed', () => {
    it('未許可ツールに対してfalseを返す', () => { ... });
    it('許可済みツールに対してtrueを返す', () => { ... });
  });

  describe('allowTool', () => {
    it('ツールを許可リストに追加する', () => { ... });
    it('既に許可済みのツールは重複追加しない', () => { ... });
  });

  describe('revokeTool', () => {
    it('ツールを許可リストから削除する', () => { ... });
    it('存在しないツールの削除は無視する', () => { ... });
  });

  describe('getAllowedTools', () => {
    it('許可済みツール一覧を返す', () => { ... });
    it('許可済みツールがない場合は空配列を返す', () => { ... });
  });

  describe('clearAll', () => {
    it('全許可設定をクリアする', () => { ... });
  });
});
```

---

### タスク2: SkillExecutor連携テスト作成

**目的**: SkillExecutorとPermissionStoreの連携テストを作成する

**実行手順**:

1. `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.permission.test.ts`を作成
2. 以下のテストケースを実装:
   - 許可済みツールで権限ダイアログがスキップされる
   - 未許可ツールで権限ダイアログが表示される
   - rememberChoice=trueで許可時にツールが永続化される
   - rememberChoice=falseで許可時にツールが永続化されない
3. PermissionStoreとPermissionResolverのモック設定

**期待される成果物**:

- `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.permission.test.ts`

---

### タスク3: 統合テストシナリオ作成

**目的**: 全カテゴリの統合テストシナリオを作成する

**実行手順**:

1. 以下のカテゴリのテストシナリオを設計:
   - **データフローテスト**: 許可→永続化→再読み込み
   - **エラーハンドリング**: 設定ファイル破損時の回復
   - **状態同期テスト**: Main-Renderer間の許可状態同期
2. 各シナリオをテストコードとして実装

**期待される成果物**:

- `apps/desktop/src/main/services/skill/__tests__/PermissionStore.integration.test.ts`

---

### タスク4: IPCハンドラーテスト作成

**目的**: 権限設定用IPCハンドラーのテストを作成する

**実行手順**:

1. `apps/desktop/src/main/ipc/__tests__/permission-handlers.test.ts`を作成
2. 以下のテストケースを実装:
   - `permission:getAllowedTools`の正常系テスト
   - `permission:revokeTool`の正常系テスト
   - `permission:clearAll`の正常系テスト
   - 各ハンドラーのエラー系テスト

**期待される成果物**:

- `apps/desktop/src/main/ipc/__tests__/permission-handlers.test.ts`

---

### タスク5: テスト実行（Red確認）

**目的**: 作成したテストが失敗することを確認する

**実行手順**:

1. 以下のコマンドでテストを実行:
   ```bash
   pnpm --filter @repo/desktop test -- --grep "PermissionStore"
   ```
2. 全テストが失敗（または実装がないためエラー）であることを確認
3. テスト結果をスクリーンショットまたはログで記録

**期待される成果物**:

- テスト実行結果（全テスト失敗の確認）

---

## 参照資料

| 参照資料                  | パス                                                                        | 内容               |
| ------------------------- | --------------------------------------------------------------------------- | ------------------ |
| Phase 2設計成果物         | `outputs/phase-2/`                                                          | 設計ドキュメント   |
| 既存テストパターン        | `apps/desktop/src/main/services/skill/__tests__/`                           | テストパターン参照 |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | 型定義参照         |

---

## 成果物

| 成果物                  | パス                                                                                 | 内容           |
| ----------------------- | ------------------------------------------------------------------------------------ | -------------- |
| PermissionStoreテスト   | `apps/desktop/src/main/services/skill/__tests__/PermissionStore.test.ts`             | ユニットテスト |
| SkillExecutor連携テスト | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.permission.test.ts`    | 連携テスト     |
| 統合テスト              | `apps/desktop/src/main/services/skill/__tests__/PermissionStore.integration.test.ts` | 統合テスト     |
| IPCハンドラーテスト     | `apps/desktop/src/main/ipc/__tests__/permission-handlers.test.ts`                    | IPCテスト      |

---

## 統合テスト連携（Phase 1〜11は必須）

- 統合テストシナリオを全カテゴリで作成
- データフローテスト（許可→永続化→再読み込み）を作成
- エラーハンドリングテスト（設定ファイル破損回復）を作成

---

## 完了条件

- [ ] PermissionStoreのユニットテストが作成された
- [ ] SkillExecutor連携テストが作成された
- [ ] 統合テストシナリオが作成された
- [ ] IPCハンドラーテストが作成された
- [ ] 全テストが失敗（Red状態）であることを確認した

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --grep "PermissionStore"
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

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

`docs/30-workflows/task-3-1-e-remember-choice-persistence/phase-05-implementation.md`
