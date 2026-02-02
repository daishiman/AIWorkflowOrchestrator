# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 5                        |
| Phase名    | 実装                     |
| 前提Phase  | Phase 4                  |
| 後続Phase  | Phase 6                  |
| ステータス | 未実施                   |
| 作成日     | 2026-02-02               |
| 機能名     | TASK-8C-D-e2e-permission |

---

## 目的

Phase 4 で作成したテストスケルトンを完成させ、E2Eテストが実行可能な状態にする。TDD の Green 段階として、テストが PASS する実装を行う。

## 背景

E2Eテストの場合、テスト対象のアプリケーション実装は既に完了している（TASK-7D で ChatPanel 統合済み）。このフェーズでは、テストコード自体の完成度を上げ、安定して実行できる状態にする。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テストユーティリティ実装

**目的**: Phase 2 で設計したテストユーティリティを実装する

**実行手順**:

1. テストファイル先頭にヘルパー関数を追加

   ```typescript
   // テストデータ定数
   const TEST_SKILL_NAME = "test-skill";
   const PERMISSION_TRIGGER_CMD = "Run dangerous command";
   const DIALOG_TITLE_TEXT = "権限の確認が必要です";
   const APPROVE_BUTTON_TEXT = "許可";
   const DENY_BUTTON_TEXT = "拒否";

   // ヘルパー関数
   async function importAndSelectSkill(page: Page, skillName: string) {
     await page.evaluate(async (name) => {
       await window.electronAPI?.skill?.import?.(name);
     }, skillName);

     await page.click('[aria-label="スキルを選択"]');
     await page.click(`[role="option"]:has-text("${skillName}")`);
   }

   async function triggerPermissionDialog(page: Page, command: string) {
     await page.fill('[data-testid="chat-input"]', command);
     await page.press('[data-testid="chat-input"]', "Enter");
   }

   async function waitForPermissionDialog(page: Page, timeout = 10000) {
     await page.waitForSelector(`text="${DIALOG_TITLE_TEXT}"`, { timeout });
   }
   ```

2. ヘルパー関数をテストケースで使用するようにリファクタリング

**期待される成果物**:

- テストユーティリティが実装されたテストファイル

---

### タスク2: モック・フィクスチャ連携実装

**目的**: E2Eテストがフィクスチャを正しく使用できるようにする

**実行手順**:

1. フィクスチャパス設定の確認

   ```typescript
   const FIXTURES_DIR = path.join(__dirname, "__fixtures__/skills");
   ```

2. Electron 起動時の環境変数設定

   ```typescript
   electronApp = await electron.launch({
     args: [path.join(__dirname, "../../dist/main/index.js")],
     env: {
       ...process.env,
       NODE_ENV: "test",
       TEST_SKILLS_DIR: FIXTURES_DIR,
     },
   });
   ```

3. フィクスチャスキルが読み込まれることを確認するヘルパーテスト追加（オプション）

**期待される成果物**:

- フィクスチャ連携が正しく設定されたテストファイル

---

### タスク3: テストケース完成

**目的**: TC-1〜TC-5 のテストケースを完成させる

**実行手順**:

1. TC-1〜TC-5 の実装を確認・完成
   - セレクターが実際のDOMと一致するか確認
   - 待機戦略が適切か確認
   - アサーションが正しいか確認

2. タイムアウトテスト（オプション）の実装完成

3. エラーハンドリングの追加
   - テスト失敗時のスクリーンショット保存
   - デバッグ情報の出力

**実装確認チェックリスト**:

| テストケース | 実装完了 | セレクター確認 | 待機戦略確認 |
| ------------ | -------- | -------------- | ------------ |
| TC-1         | [ ]      | [ ]            | [ ]          |
| TC-2         | [ ]      | [ ]            | [ ]          |
| TC-3         | [ ]      | [ ]            | [ ]          |
| TC-4         | [ ]      | [ ]            | [ ]          |
| TC-5         | [ ]      | [ ]            | [ ]          |

**期待される成果物**:

- 完成したE2Eテストファイル

---

### タスク4: テスト実行・Green確認

**目的**: 全テストが PASS することを確認する（TDD Green）

**実行手順**:

1. TypeScript コンパイル確認

   ```bash
   pnpm --filter @repo/desktop typecheck
   ```

2. ESLint 確認

   ```bash
   pnpm --filter @repo/desktop lint
   ```

3. E2Eテスト実行

   ```bash
   pnpm --filter @repo/desktop test:e2e -- skillPermission
   ```

4. 結果確認
   - 全5件（または6件）のテストが PASS
   - 実行時間が許容範囲内（各テスト30秒以内）

**期待される成果物**:

- `outputs/phase-5/test-execution-result.md`: テスト実行結果

---

## 参照資料

| 参照資料        | パス                                                | 内容             |
| --------------- | --------------------------------------------------- | ---------------- |
| Phase 4 テスト  | `apps/desktop/src/__tests__/skillPermission.e2e.ts` | テストスケルトン |
| Phase 2 設計書  | `outputs/phase-2/`                                  | テスト設計       |
| E2Eフィクスチャ | `apps/desktop/src/__tests__/__fixtures__/skills/`   | テスト用スキル   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料      | パス                                                                                        | 内容           |
| ------------- | ------------------------------------------------------------------------------------------- | -------------- |
| E2Eテスト仕様 | `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md`                  | テスト戦略     |
| 実装パターン  | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | テストパターン |

---

## 成果物

| 成果物            | パス                                                | 内容          |
| ----------------- | --------------------------------------------------- | ------------- |
| E2Eテストファイル | `apps/desktop/src/__tests__/skillPermission.e2e.ts` | 完成版        |
| テスト実行結果    | `outputs/phase-5/test-execution-result.md`          | PASS/FAIL記録 |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 5での統合テスト連携アクション:**

- E2Eテストが IPC 通信を正しくシミュレート/テストしているか確認
- フィクスチャが統合テストと整合しているか確認

---

## 完了条件

- [ ] テストユーティリティが実装されている
- [ ] フィクスチャ連携が正しく設定されている
- [ ] 5件のテストケースが完成している
- [ ] 全テストが PASS している（TDD Green）
- [ ] TypeScript / ESLint エラーがない
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスク1: テストユーティリティ実装
3. 実行タスク2: モック・フィクスチャ連携実装
4. 実行タスク3: テストケース完成
5. 実行タスク4: テスト実行・Green確認
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

## TDD検証

### TDD サイクル確認

```bash
# E2Eテスト実行
pnpm --filter @repo/desktop test:e2e -- skillPermission
```

**確認項目**:

- [ ] 全テストが PASS（Green状態）

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/TASK-8C-D-e2e-permission/phase-06-test-expansion.md`
