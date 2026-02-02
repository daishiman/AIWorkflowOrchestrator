# Phase 2: モック戦略設計書

## 実行日時

2026-02-02

---

## 1. モック対象API一覧

### 1.1 skillAPI（Renderer側）

| API                               | モック方式           | 理由                 | 実装優先度 |
| --------------------------------- | -------------------- | -------------------- | ---------- |
| `skillAPI.import`                 | 成功レスポンス固定   | スキルインポート前提 | 高         |
| `skillAPI.list`                   | フィクスチャ返却     | 利用可能スキル一覧   | 高         |
| `skillAPI.execute`                | イベント発火トリガー | 実行開始             | 高         |
| `skillAPI.onPermission`           | コールバック保持     | 権限リクエスト発火   | 高         |
| `skillAPI.sendPermissionResponse` | 呼び出し検証         | 応答内容確認         | 高         |

### 1.2 electronAPI（Main-Renderer間）

| API                                        | モック方式    | 理由                   |
| ------------------------------------------ | ------------- | ---------------------- |
| `electronAPI.skill.import`                 | 即時成功      | テスト高速化           |
| `electronAPI.skill.list`                   | 固定リスト    | フィクスチャ連携       |
| `electronAPI.skill.getImported`            | 空/固定リスト | 状態管理               |
| `electronAPI.skill.execute`                | イベント発火  | 権限リクエストトリガー |
| `electronAPI.skill.sendPermissionResponse` | スパイ関数    | 呼び出し検証           |

---

## 2. モック注入方式

### 2.1 addInitScript によるモック注入

```typescript
// テストセットアップ
await page.addInitScript(() => {
  // モック用イベントリスナー保持
  const permissionListeners: Array<(req: SkillPermissionRequest) => void> = [];
  let permissionResponseSpy: jest.Mock | null = null;

  // electronAPIモック
  window.electronAPI = {
    skill: {
      // スキル一覧
      list: async () => [{ name: "test-skill", description: "E2Eテスト用" }],

      // インポート済みスキル
      getImported: async () => [],

      // スキルインポート
      import: async (skillName: string) => ({
        name: skillName,
        importedAt: new Date().toISOString(),
      }),

      // スキル実行（権限リクエストをトリガー）
      execute: async ({ skillId, prompt }) => {
        // 実行ID生成
        const executionId = `exec-${Date.now()}`;

        // 権限リクエストをシミュレート
        setTimeout(() => {
          const req = {
            requestId: `req-${Date.now()}`,
            executionId,
            toolName: "Bash",
            args: { command: prompt },
            timestamp: Date.now(),
          };
          permissionListeners.forEach((listener) => listener(req));
        }, 100);

        return { executionId };
      },

      // 権限リクエストリスナー登録
      onPermissionRequest: (callback) => {
        permissionListeners.push(callback);
        return () => {
          const idx = permissionListeners.indexOf(callback);
          if (idx > -1) permissionListeners.splice(idx, 1);
        };
      },

      // 権限応答送信
      sendPermissionResponse: (response) => {
        permissionResponseSpy?.(response);
        // 記憶された選択肢を保持
        if (response.rememberChoice) {
          window.__rememberedPermissions = window.__rememberedPermissions || {};
          window.__rememberedPermissions[response.requestId] =
            response.approved;
        }
      },

      // 中断
      abort: () => {},
    },
  };

  // テスト用ユーティリティ
  window.__testUtils = {
    setPermissionResponseSpy: (spy) => {
      permissionResponseSpy = spy;
    },
    getPermissionResponseSpy: () => permissionResponseSpy,
    triggerPermissionRequest: (req) => {
      permissionListeners.forEach((listener) => listener(req));
    },
  };
});
```

---

## 3. Permission リクエストのシミュレーション

### 3.1 方式1: execute経由の自動トリガー

```typescript
// スキル実行時に自動で権限リクエストを発火
it("should show permission dialog", async () => {
  // コマンド入力して実行
  await page.fill('[data-testid="chat-input"]', "Run dangerous command");
  await page.press('[data-testid="chat-input"]', "Enter");

  // execute内部で権限リクエストが自動発火
  // → skillSlice._handlePermissionRequest が呼ばれる
  // → pendingPermission が設定される
  // → PermissionDialog が表示される

  await expect(page.locator('text="権限の確認が必要です"')).toBeVisible();
});
```

### 3.2 方式2: page.evaluate経由の手動トリガー

```typescript
// テストから直接権限リクエストを発火
it("should show permission dialog (manual trigger)", async () => {
  await page.evaluate(() => {
    window.__testUtils.triggerPermissionRequest({
      requestId: "test-req-1",
      executionId: "test-exec-1",
      toolName: "Bash",
      args: { command: "ls -la" },
      timestamp: Date.now(),
    });
  });

  await expect(page.locator('text="権限の確認が必要です"')).toBeVisible();
});
```

### 3.3 採用方式

**方式1（execute経由）を採用**

理由:

- 実際のユーザーフローに近い
- E2Eテストとして自然
- 方式2は単体テスト向き

---

## 4. rememberChoice 永続化のモック

### 4.1 In-Memory Storage 方式

```typescript
// addInitScript内
window.__rememberedPermissions = {};

// sendPermissionResponse内
sendPermissionResponse: (response) => {
  if (response.rememberChoice && response.approved) {
    const toolName = currentPendingRequest?.toolName;
    if (toolName) {
      window.__rememberedPermissions[toolName] = true;
    }
  }
},

// execute内（次回実行時のチェック）
execute: async ({ skillId, prompt }) => {
  const toolName = 'Bash'; // 実際はプロンプト解析

  // 記憶された許可があればスキップ
  if (window.__rememberedPermissions[toolName]) {
    return { executionId: `exec-${Date.now()}`, autoApproved: true };
  }

  // 通常の権限リクエスト発火
  // ...
},
```

### 4.2 テストでの検証

```typescript
it("should remember choice", async () => {
  // 1回目: ダイアログ表示、チェックボックスON、許可
  await triggerPermissionDialog(page, "Run dangerous command");
  await page.click('[type="checkbox"]');
  await page.click('button:has-text("許可")');

  // 2回目: ダイアログが表示されない
  await page.fill('[data-testid="chat-input"]', "Run dangerous command");
  await page.press('[data-testid="chat-input"]', "Enter");

  await page.waitForTimeout(1000);
  await expect(page.locator('text="権限の確認が必要です"')).not.toBeVisible();
});
```

---

## 5. モック保守性考慮

### 5.1 インターフェース変更時の影響

| 変更種類   | 影響範囲       | 対応               |
| ---------- | -------------- | ------------------ |
| API名変更  | addInitScript  | モック実装を更新   |
| 引数追加   | 該当モック関数 | オプショナルで対応 |
| 戻り値変更 | アサーション   | 期待値を更新       |

### 5.2 モックと実装の乖離防止

| 対策                 | 実装                              |
| -------------------- | --------------------------------- |
| 型共有               | `@repo/shared` からインポート     |
| インターフェース定義 | `SkillPermissionRequest` 等を使用 |
| 定期検証             | 実装変更時にE2Eテスト実行         |

---

## 6. 統合テスト連携

### 6.1 TASK-8C-A（IPC統合テスト）との整合性

| テスト種類    | 検証範囲           | モック対象      |
| ------------- | ------------------ | --------------- |
| IPC統合テスト | Main-Renderer IPC  | Main Process    |
| E2Eテスト     | ユーザーフロー全体 | electronAPI全体 |

### 6.2 モック一貫性

- E2EテストとIPC統合テストで同じインターフェースを参照
- 型定義は `@repo/shared` で共有
- モック動作は実装を簡略化したものであり、異なる動作はしない
