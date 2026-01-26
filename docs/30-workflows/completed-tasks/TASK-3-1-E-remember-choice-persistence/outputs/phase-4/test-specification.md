# テスト仕様書 - rememberChoice機能永続化

## メタ情報

| 項目     | 内容                                   |
| -------- | -------------------------------------- |
| タスクID | TASK-3-1-E                             |
| Phase    | 4                                      |
| 作成日   | 2026-01-25                             |
| 機能名   | task-3-1-e-remember-choice-persistence |

---

## テストファイル一覧

| テストファイル                | パス                                                                                 | 内容           |
| ----------------------------- | ------------------------------------------------------------------------------------ | -------------- |
| PermissionStoreユニットテスト | `apps/desktop/src/main/services/skill/__tests__/PermissionStore.test.ts`             | ユニットテスト |
| PermissionStore統合テスト     | `apps/desktop/src/main/services/skill/__tests__/PermissionStore.integration.test.ts` | 統合テスト     |
| SkillExecutor連携テスト       | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.permission.test.ts`    | 連携テスト     |
| IPCハンドラーテスト           | `apps/desktop/src/main/ipc/__tests__/permission-handlers.test.ts`                    | IPCテスト      |

---

## 1. PermissionStore ユニットテスト

### テストカテゴリ

| カテゴリ              | テスト数 | 概要                   |
| --------------------- | -------- | ---------------------- |
| isToolAllowed         | 4        | 許可状態チェック       |
| allowTool             | 4        | ツール許可追加         |
| revokeTool            | 4        | ツール許可取り消し     |
| getAllowedTools       | 2        | 許可済みツール一覧取得 |
| getAllowedToolEntries | 2        | 許可済みツール詳細取得 |
| clearAll              | 3        | 全許可クリア           |
| Schema Validation     | 4        | スキーマバリデーション |
| Error Handling        | 2        | エラーハンドリング     |
| Performance           | 1        | パフォーマンス         |
| Edge Cases            | 4        | エッジケース           |

### テストケース詳細

#### isToolAllowed

| テストケース                        | 期待結果        |
| ----------------------------------- | --------------- |
| 未許可ツールに対してfalseを返す     | `false`         |
| 許可済みツールに対してtrueを返す    | `true`          |
| 大文字小文字を区別する              | `Read !== read` |
| 空文字のツール名に対してfalseを返す | `false`         |

#### allowTool

| テストケース                         | 期待結果             |
| ------------------------------------ | -------------------- |
| ツールを許可リストに追加する         | キャッシュに追加     |
| 既に許可済みのツールは重複追加しない | 1件のまま、日時更新  |
| 許可時にstoreを更新する              | `store.set` 呼び出し |
| 複数のツールを許可できる             | 各ツールが許可される |

#### revokeTool

| テストケース                          | 期待結果               |
| ------------------------------------- | ---------------------- |
| ツールを許可リストから削除する        | キャッシュから削除     |
| 存在しないツールの削除は無視する      | 例外なし               |
| 削除時にstoreを更新する               | `store.set` 呼び出し   |
| 存在しないツール削除時はstore更新なし | `store.set` 未呼び出し |

#### clearAll

| テストケース                   | 期待結果             |
| ------------------------------ | -------------------- |
| 全許可設定をクリアする         | 空の許可リスト       |
| クリア時にstoreを更新する      | `store.set` 呼び出し |
| 空の状態でクリアしても問題ない | 例外なし             |

---

## 2. PermissionStore 統合テスト

### テストカテゴリ

| カテゴリ                             | テスト数 | 概要                   |
| ------------------------------------ | -------- | ---------------------- |
| データフロー: 許可→永続化→再読み込み | 4        | 完全フロー検証         |
| エラーハンドリング: 破損回復         | 5        | 異常系回復検証         |
| 状態同期                             | 3        | キャッシュ・ストア同期 |
| スキーママイグレーション             | 2        | バージョン互換性       |
| 負荷・並行処理                       | 3        | パフォーマンス検証     |

### テストシナリオ

#### データフローテスト

1. **許可→永続化シナリオ**
   - ツール許可 → store.set 呼び出し確認

2. **再起動シナリオ**
   - 既存データでインスタンス化 → 許可状態復元確認

3. **完全フロー**
   - 許可 → 永続化 → 再読み込み → 自動許可

4. **削除フロー**
   - 削除 → 永続化 → 再読み込み → 削除確認

#### エラーハンドリングテスト

1. **破損スキーマ回復**
   - 不正なversion型 → デフォルトリセット

2. **不完全エントリ回復**
   - toolNameなしエントリ → デフォルトリセット

3. **nullデータ回復**
   - null → デフォルト初期化

4. **書き込みエラー回復**
   - store.setエラー → キャッシュ維持

5. **読み取りエラー回復**
   - store.storeエラー → デフォルト初期化

---

## 3. SkillExecutor 連携テスト

### テストカテゴリ

| カテゴリ                       | テスト数 | 概要                     |
| ------------------------------ | -------- | ------------------------ |
| 自動許可（ダイアログスキップ） | 3        | 許可済みツールの自動承認 |
| 権限永続化（rememberChoice）   | 4        | 許可選択の永続化         |
| handlePermissionResponse       | 2        | toolNameパラメータ処理   |
| 後方互換性                     | 1        | PermissionStore未注入時  |

### テストシナリオ

#### 自動許可シナリオ

```
[テスト] 許可済みツールで権限ダイアログがスキップされる
  Given: Read ツールは PermissionStore で許可済み
  When: sendPermissionRequest("Read") を呼び出す
  Then: ダイアログ表示なし、approved=true を返す

[テスト] 未許可ツールで権限ダイアログが表示される
  Given: Bash ツールは PermissionStore で未許可
  When: sendPermissionRequest("Bash") を呼び出す
  Then: IPC で権限リクエストが送信される
```

#### 永続化シナリオ

```
[テスト] rememberChoice=true で許可時にツールが永続化される
  Given: 未許可のツール
  When: handlePermissionResponse(approved=true, rememberChoice=true, toolName="Read")
  Then: permissionStore.allowTool("Read") が呼ばれる

[テスト] rememberChoice=false で許可時にツールが永続化されない
  Given: 未許可のツール
  When: handlePermissionResponse(approved=true, rememberChoice=false, toolName="Read")
  Then: permissionStore.allowTool は呼ばれない
```

---

## 4. IPC ハンドラーテスト

### テストカテゴリ

| カテゴリ                   | テスト数 | 概要             |
| -------------------------- | -------- | ---------------- |
| registerPermissionHandlers | 4        | ハンドラー登録   |
| permission:getAllowedTools | 3        | 許可リスト取得   |
| permission:revokeTool      | 5        | 許可取り消し     |
| permission:clearAll        | 3        | 全クリア         |
| セキュリティ               | 3        | 入力サニタイズ   |
| エッジケース               | 5        | 並行処理・型変換 |

### テストシナリオ

#### permission:getAllowedTools

```typescript
// 正常系
it("許可済みツール一覧を返す", async () => {
  // mockPermissionStore.getAllowedToolEntries.mockReturnValue([...])
  // result = await handler()
  // expect(result).toEqual({ tools: [...] })
});

// エラー系
it("PermissionStore エラー時に空配列を返す", async () => {
  // mockPermissionStore.getAllowedToolEntries.mockThrow(...)
  // result = await handler()
  // expect(result).toEqual({ tools: [] })
});
```

---

## TDD Red 状態確認

### プレースホルダー形式

すべてのテストケースは以下の形式で TDD Red プレースホルダーを使用：

```typescript
it("テストケース", () => {
  // 準備
  // ...設定コード（コメントアウト）...

  // TODO: 実装後にコメント解除
  // const store = new PermissionStore();
  // ...テストコード（コメントアウト）...

  // 検証
  // expect(...).toBe(...);
  expect(true).toBe(true); // TDD Red: プレースホルダー
});
```

### 実装後の対応

1. `import { PermissionStore } from "../PermissionStore"` のコメント解除
2. 各テストの TODO コメント解除
3. `expect(true).toBe(true)` プレースホルダー削除
4. テスト実行で Green 確認

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-25 | 初版作成 |
