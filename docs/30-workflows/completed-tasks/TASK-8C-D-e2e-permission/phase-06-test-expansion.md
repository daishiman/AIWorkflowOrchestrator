# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 6                        |
| Phase名    | テスト拡充               |
| 前提Phase  | Phase 5                  |
| 後続Phase  | Phase 7                  |
| ステータス | 未実施                   |
| 作成日     | 2026-02-02               |
| 機能名     | TASK-8C-D-e2e-permission |

---

## 目的

Phase 5 で実装した基本テストを拡充し、エッジケース・異常系・アクセシビリティテストを追加する。

## 背景

基本的な5つのテストケースは正常系フローをカバーしているが、実際のユーザー操作ではエッジケースや異常系も発生する。テストの信頼性を高めるため、これらのケースもカバーする。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: エッジケーステスト追加

**目的**: 境界値・特殊ケースをカバーするテストを追加する

**実行手順**:

1. 複数権限リクエストの連続処理テスト

   ```typescript
   it("should handle multiple consecutive permission requests", async () => {
     // 1回目の権限リクエスト
     await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
     await waitForPermissionDialog(page);
     await page.click(`button:has-text("${APPROVE_BUTTON_TEXT}")`);

     // 2回目の権限リクエスト（別のツール）
     await triggerPermissionDialog(page, "Run another dangerous command");
     await waitForPermissionDialog(page);
     await expect(page.locator(`text="${DIALOG_TITLE_TEXT}"`)).toBeVisible();
   });
   ```

2. ダイアログ表示中の再リクエストテスト

   ```typescript
   it("should queue permission requests when dialog is open", async () => {
     await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
     await waitForPermissionDialog(page);

     // ダイアログ表示中に別のコマンドを実行
     // 期待: キューに追加される or エラーにならない
   });
   ```

3. 空のツール名・引数の表示テスト

**期待される成果物**:

- エッジケーステストが追加されたテストファイル

---

### タスク2: 異常系テスト追加

**目的**: エラーハンドリングをカバーするテストを追加する

**実行手順**:

1. タイムアウト処理テスト（元タスク仕様に記載）

   ```typescript
   it("should handle permission request timeout", async () => {
     await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
     await waitForPermissionDialog(page);

     // タイムアウト待機（テスト用に短いタイムアウトを設定）
     await page.waitForTimeout(5000);

     // タイムアウトメッセージまたはエラー表示を確認
     const timeoutOrError = page
       .locator('text="タイムアウト"')
       .or(page.locator('text="エラー"'));
     await expect(timeoutOrError).toBeVisible({ timeout: 10000 });
   });
   ```

2. ネットワークエラー時の処理テスト（該当する場合）

3. 無効なレスポンスの処理テスト

**期待される成果物**:

- 異常系テストが追加されたテストファイル

---

### タスク3: アクセシビリティテスト追加

**目的**: WCAG 2.1 AA 準拠を検証するテストを追加する

**実行手順**:

1. フォーカストラップテスト

   ```typescript
   it("should trap focus within permission dialog", async () => {
     await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
     await waitForPermissionDialog(page);

     // Tab キーを繰り返し押してフォーカスがダイアログ内でループするか確認
     const dialog = page.locator('[role="alertdialog"]');
     await expect(dialog).toBeFocused();

     await page.keyboard.press("Tab");
     await page.keyboard.press("Tab");
     await page.keyboard.press("Tab");
     // フォーカスがダイアログ内に留まっているか確認
   });
   ```

2. キーボードナビゲーションテスト

   ```typescript
   it("should close dialog on Escape key", async () => {
     await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
     await waitForPermissionDialog(page);

     await page.keyboard.press("Escape");

     await expect(
       page.locator(`text="${DIALOG_TITLE_TEXT}"`),
     ).not.toBeVisible();
   });

   it("should approve on Enter key when approve button is focused", async () => {
     await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
     await waitForPermissionDialog(page);

     // 許可ボタンにフォーカス
     await page.focus(`button:has-text("${APPROVE_BUTTON_TEXT}")`);
     await page.keyboard.press("Enter");

     await expect(
       page.locator(`text="${DIALOG_TITLE_TEXT}"`),
     ).not.toBeVisible();
   });
   ```

3. ARIA属性確認テスト

   ```typescript
   it("should have correct ARIA attributes", async () => {
     await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
     await waitForPermissionDialog(page);

     const dialog = page.locator('[role="alertdialog"]');
     await expect(dialog).toHaveAttribute("aria-modal", "true");
     await expect(dialog).toHaveAttribute("aria-labelledby");
   });
   ```

**期待される成果物**:

- アクセシビリティテストが追加されたテストファイル

---

### タスク4: テスト整理・リファクタリング

**目的**: テストコードの可読性・保守性を向上させる

**実行手順**:

1. テストケースを論理的なグループに整理

   ```typescript
   describe("Skill Permission Dialog E2E", () => {
     describe("Basic Flow", () => {
       // TC-1〜TC-5
     });

     describe("Edge Cases", () => {
       // 複数リクエスト、キュー処理等
     });

     describe("Error Handling", () => {
       // タイムアウト、エラー処理等
     });

     describe("Accessibility", () => {
       // フォーカストラップ、キーボード、ARIA等
     });
   });
   ```

2. 重複コードのヘルパー関数への抽出

3. テストデータの定数化

**期待される成果物**:

- リファクタリングされたテストファイル

---

## 参照資料

| 参照資料       | パス                                                                            | 内容               |
| -------------- | ------------------------------------------------------------------------------- | ------------------ |
| Phase 5 テスト | `apps/desktop/src/__tests__/skillPermission.e2e.ts`                             | 基本テスト         |
| 元タスク仕様   | `docs/30-workflows/skill-import-agent-system/tasks/task-8c-d-e2e-permission.md` | タイムアウトテスト |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                              | 内容               |
| ---------------------- | --------------------------------------------------------------------------------- | ------------------ |
| アクセシビリティテスト | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      | WCAG準拠テスト方法 |
| テストパターン         | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | テストパターン     |

---

## 成果物

| 成果物            | パス                                                | 内容           |
| ----------------- | --------------------------------------------------- | -------------- |
| E2Eテストファイル | `apps/desktop/src/__tests__/skillPermission.e2e.ts` | 拡充版         |
| テスト追加結果    | `outputs/phase-6/test-expansion-result.md`          | 追加テスト一覧 |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 6での統合テスト連携アクション:**

- エッジケーステストが IPC 統合テスト（TASK-8C-A）のカバレッジを補完しているか確認
- アクセシビリティテストが UI 仕様と整合しているか確認

---

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                 | 仕様参照先                                          |
| ------------------ | ------------------------ | --------------------------------------------------- |
| アクセシビリティ   | UI要素のテストを含む場合 | `aiworkflow-requirements: testing-accessibility.md` |
| エラーハンドリング | 異常系テストを含む場合   | `aiworkflow-requirements: error-handling.md`        |

---

## 完了条件

- [ ] エッジケーステストが追加されている
- [ ] 異常系テスト（タイムアウト等）が追加されている
- [ ] アクセシビリティテストが追加されている
- [ ] テストコードがリファクタリングされている
- [ ] 全テストが PASS している
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスク1: エッジケーステスト追加
3. 実行タスク2: 異常系テスト追加
4. 実行タスク3: アクセシビリティテスト追加
5. 実行タスク4: テスト整理・リファクタリング
6. 統合テスト連携の実施
7. 成果物の作成・配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 5（実装）が完了していること
- **後続**: Phase 7（テストカバレッジ確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/TASK-8C-D-e2e-permission/phase-07-coverage.md`
