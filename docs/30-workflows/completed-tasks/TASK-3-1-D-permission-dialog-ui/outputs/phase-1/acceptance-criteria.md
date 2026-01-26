# 受け入れ基準定義書

## メタ情報

| 項目   | 内容                            |
| ------ | ------------------------------- |
| Phase  | 1                               |
| 作成日 | 2026-01-25                      |
| 機能名 | TASK-3-1-D-permission-dialog-ui |

---

## 1. 機能受け入れ基準

### AC-D-001: skillAPIにpermission関連メソッドが追加されている

**検証内容**:

- [ ] `skillAPI.onPermission(callback)`メソッドが存在する
- [ ] `skillAPI.respondPermission(response)`メソッドが存在する
- [ ] TypeScript型定義が正しく設定されている

**テスト方法**:

```typescript
// 型チェック
const unsubscribe = skillAPI.onPermission((request) => {
  console.log(request.requestId, request.toolName);
});
await skillAPI.respondPermission({ requestId: "test", approved: true });
unsubscribe();
```

### AC-D-002: Main Processからの権限リクエストを受信できる

**検証内容**:

- [ ] `skill:permission:request`チャネルからのIPCメッセージを受信できる
- [ ] 受信したデータが`SkillPermissionRequest`型に準拠している
- [ ] コールバック関数が正しく呼び出される

**テスト方法**:

```typescript
// モックIPCでテスト
const mockRequest = {
  executionId: "exec-1",
  requestId: "req-1",
  toolName: "Bash",
  args: { command: "echo test" },
  reason: "コマンドを実行: echo test",
};
ipcRenderer.emit("skill:permission:request", null, mockRequest);
// コールバックが呼ばれることを検証
```

### AC-D-003: PermissionDialogが表示される

**検証内容**:

- [ ] 権限リクエスト受信時にPermissionDialogがレンダリングされる
- [ ] ツール名が表示される
- [ ] 引数がJSON形式で表示される
- [ ] 理由が表示される

**テスト方法**: React Testing LibraryでUIレンダリングを検証

### AC-D-004: 「許可」クリックで`approved: true`が送信される

**検証内容**:

- [ ] 許可ボタンクリックで`respondPermission`が呼ばれる
- [ ] 送信データに`approved: true`が含まれる
- [ ] 同じ`requestId`が含まれる
- [ ] `rememberChoice`の状態が反映される

**テスト方法**:

```typescript
// クリックイベント発火後、IPCメッセージを検証
fireEvent.click(screen.getByRole("button", { name: "許可" }));
expect(mockInvoke).toHaveBeenCalledWith(
  "skill:permission:respond",
  expect.objectContaining({
    requestId: "req-1",
    approved: true,
  }),
);
```

### AC-D-005: 「拒否」クリックで`approved: false`が送信される

**検証内容**:

- [ ] 拒否ボタンクリックで`respondPermission`が呼ばれる
- [ ] 送信データに`approved: false`が含まれる
- [ ] 同じ`requestId`が含まれる
- [ ] `rememberChoice`の状態が反映される

**テスト方法**:

```typescript
fireEvent.click(screen.getByRole("button", { name: "拒否" }));
expect(mockInvoke).toHaveBeenCalledWith(
  "skill:permission:respond",
  expect.objectContaining({
    requestId: "req-1",
    approved: false,
  }),
);
```

---

## 2. 品質受け入れ基準

### AC-D-006: ユニットテストカバレッジ80%以上

**対象ファイル**:

| ファイル                        | 最低カバレッジ |
| ------------------------------- | -------------- |
| `skill-api.ts` (permission関連) | 80%            |
| 統合コンポーネント              | 80%            |

**検証方法**:

```bash
pnpm --filter @repo/desktop test:coverage
```

### AC-D-007: TypeScript strict PASS

**検証内容**:

- [ ] `strict: true`設定でコンパイルエラーがない
- [ ] 新規追加コードに`any`型が使用されていない（やむを得ない場合を除く）

**検証方法**:

```bash
pnpm --filter @repo/desktop typecheck
```

### AC-D-008: ESLint PASS

**検証内容**:

- [ ] ESLintエラーがゼロ
- [ ] ESLint警告が最小限（既存警告以下）

**検証方法**:

```bash
pnpm --filter @repo/desktop lint
```

### AC-D-009: アクセシビリティ（WCAG 2.1 AA準拠）

**検証内容**:

- [ ] `role="alertdialog"`が設定されている
- [ ] `aria-modal="true"`が設定されている
- [ ] `aria-labelledby`でタイトルが紐付けられている
- [ ] フォーカストラップが動作する
- [ ] キーボードのみで操作可能

**検証方法**:

- Lighthouse アクセシビリティスコア90以上
- 手動キーボード操作テスト

---

## 3. 統合テスト受け入れ基準

### AC-D-010: IPC通信が正常に動作する

**検証内容**:

- [ ] Main → Renderer: `skill:permission:request`が送受信される
- [ ] Renderer → Main: `skill:permission:respond`が送受信される
- [ ] `requestId`による応答の紐付けが正しく動作する

**テストシナリオ**:

1. Main ProcessがSkillExecutor.sendPermissionRequest()を呼び出す
2. Renderer Processでコールバックが呼ばれる
3. Renderer Processがskillapi.respondPermission()を呼び出す
4. Main ProcessのPermissionResolverがresolveする

### AC-D-011: ダイアログ表示・応答フローが正常に動作する

**検証内容**:

- [ ] 権限リクエスト受信 → ダイアログ表示が正常に動作
- [ ] 許可クリック → ダイアログ非表示 → 応答送信が正常に動作
- [ ] 拒否クリック → ダイアログ非表示 → 応答送信が正常に動作

**E2Eテストシナリオ**:

```typescript
// 1. スキル実行を開始
// 2. ツール実行で権限リクエストが発生
// 3. ダイアログが表示されることを確認
// 4. 許可/拒否をクリック
// 5. ダイアログが閉じることを確認
// 6. スキル実行が継続/中断されることを確認
```

### AC-D-012: 既存機能への影響がない

**検証内容**:

- [ ] agentAPI.onPermission/respondPermissionが正常に動作する
- [ ] 既存のスキル実行フロー（permission以外）が正常に動作する
- [ ] 既存テストがすべてPASSする

**検証方法**:

```bash
pnpm --filter @repo/desktop test
```

---

## 4. セキュリティ受け入れ基準

### AC-D-013: IPCチャネルホワイトリストが正しく設定されている

**検証内容**:

- [ ] `SKILL_PERMISSION_REQUEST`が`ALLOWED_ON_CHANNELS`に登録されている
- [ ] `SKILL_PERMISSION_RESPOND`が`ALLOWED_INVOKE_CHANNELS`に登録されている
- [ ] 未登録チャネルからのメッセージは無視される

### AC-D-014: 引数サニタイズが機能する

**検証内容**:

- [ ] `password`, `token`, `key`等の機密キーが`[REDACTED]`に置換される
- [ ] 500文字を超える文字列が省略される
- [ ] サニタイズはMain Process側で実施される（TASK-3-1-Cで実装済み）

---

## 5. 受け入れ基準サマリー

### 機能要件

| ID       | 基準                                 | 必須 |
| -------- | ------------------------------------ | ---- |
| AC-D-001 | skillAPIにpermission関連メソッド追加 | ✓    |
| AC-D-002 | Main Processからの権限リクエスト受信 | ✓    |
| AC-D-003 | PermissionDialog表示                 | ✓    |
| AC-D-004 | 「許可」で`approved: true`送信       | ✓    |
| AC-D-005 | 「拒否」で`approved: false`送信      | ✓    |

### 品質要件

| ID       | 基準                            | 必須 |
| -------- | ------------------------------- | ---- |
| AC-D-006 | ユニットテストカバレッジ80%以上 | ✓    |
| AC-D-007 | TypeScript strict PASS          | ✓    |
| AC-D-008 | ESLint PASS                     | ✓    |
| AC-D-009 | WCAG 2.1 AA準拠                 | ✓    |

### 統合テスト要件

| ID       | 基準                           | 必須 |
| -------- | ------------------------------ | ---- |
| AC-D-010 | IPC通信正常動作                | ✓    |
| AC-D-011 | ダイアログ表示・応答フロー正常 | ✓    |
| AC-D-012 | 既存機能への影響なし           | ✓    |

### セキュリティ要件

| ID       | 基準                          | 必須 |
| -------- | ----------------------------- | ---- |
| AC-D-013 | IPCチャネルホワイトリスト正確 | ✓    |
| AC-D-014 | 引数サニタイズ機能            | ✓    |

---

## 6. 合格判定基準

**タスク完了と判定するための条件**:

1. すべての「必須」受け入れ基準（AC-D-001〜AC-D-014）がPASS
2. ユニットテストカバレッジが80%以上
3. TypeScript/ESLintエラーがゼロ
4. 既存テストがすべてPASS
5. 統合テストシナリオがPASS
