# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 8                        |
| Phase名    | リファクタリング         |
| 前提Phase  | Phase 7                  |
| 後続Phase  | Phase 9                  |
| ステータス | 未実施                   |
| 作成日     | 2026-02-02               |
| 機能名     | TASK-8C-D-e2e-permission |

---

## 目的

TDD の Refactor 段階として、テストコードの品質を向上させる。可読性・保守性・再利用性を高め、将来の変更に対応しやすいコードにする。

## 背景

E2Eテストはメンテナンスコストが高いため、テストコード自体の品質を高めておくことが重要。Phase 6 で追加したテストを整理し、保守しやすい構造にする。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: Page Object パターン検討

**目的**: テストの保守性を高めるためのパターン適用を検討する

**実行手順**:

1. Page Object パターンの適用可否を判断

   | 観点           | 評価                                 |
   | -------------- | ------------------------------------ |
   | テスト数       | 5〜10件 → 現時点では過剰設計の可能性 |
   | セレクター重複 | 多い場合は適用検討                   |
   | 将来の拡張     | E2Eテスト増加予定があれば適用        |

2. 適用する場合: PermissionDialogPage クラス作成

   ```typescript
   class PermissionDialogPage {
     constructor(private page: Page) {}

     async waitForDialog(timeout = 10000) {
       await this.page.waitForSelector(`text="${DIALOG_TITLE_TEXT}"`, {
         timeout,
       });
     }

     async approve() {
       await this.page.click(`button:has-text("${APPROVE_BUTTON_TEXT}")`);
     }

     async deny() {
       await this.page.click(`button:has-text("${DENY_BUTTON_TEXT}")`);
     }

     async checkRememberChoice() {
       await this.page.click('[type="checkbox"]');
     }

     get toolInfoLocator() {
       return this.page.locator('text="ツール:"');
     }

     get argsInfoLocator() {
       return this.page.locator('text="引数:"');
     }
   }
   ```

3. 適用しない場合: ヘルパー関数の整理で対応

**期待される成果物**:

- `outputs/phase-8/page-object-decision.md`: Page Object適用判断結果

---

### タスク2: テストデータの外部化

**目的**: テストデータを一元管理し、変更に強くする

**実行手順**:

1. テストデータ定数ファイルの作成（必要に応じて）

   ```typescript
   // src/__tests__/fixtures/permission-test-data.ts
   export const PERMISSION_TEST_DATA = {
     skillName: "test-skill",
     triggerCommand: "Run dangerous command",
     dialogTitle: "権限の確認が必要です",
     approveButton: "許可",
     denyButton: "拒否",
     timeoutMs: 10000,
   } as const;
   ```

2. テストファイルでのインポートと使用

3. マジックナンバー・マジックストリングの排除

**期待される成果物**:

- テストデータが外部化されたテストファイル（または変更不要の判断）

---

### タスク3: テスト構造の最適化

**目的**: テストの論理構造を最適化する

**実行手順**:

1. describe ブロックの整理

   ```typescript
   describe("Skill Permission Dialog E2E", () => {
     describe("Dialog Display", () => {
       it("should show permission dialog when tool requires approval");
       it("should display tool info in permission dialog");
     });

     describe("User Actions", () => {
       it("should approve permission and continue execution");
       it("should deny permission and stop execution");
       it("should remember choice when checkbox is checked");
     });

     describe("Edge Cases", () => {
       it("should handle multiple consecutive permission requests");
       it("should handle permission request timeout");
     });

     describe("Accessibility", () => {
       it("should trap focus within permission dialog");
       it("should close dialog on Escape key");
       it("should have correct ARIA attributes");
     });
   });
   ```

2. beforeEach / afterEach の最適化
   - 共通セットアップの抽出
   - 不要なセットアップの削除

3. テスト間の独立性確認

**期待される成果物**:

- 構造最適化されたテストファイル

---

### タスク4: コード品質確認

**目的**: リファクタリング後のコード品質を確認する

**実行手順**:

1. TypeScript コンパイル確認

   ```bash
   pnpm --filter @repo/desktop typecheck
   ```

2. ESLint 確認・修正

   ```bash
   pnpm --filter @repo/desktop lint
   pnpm --filter @repo/desktop lint:fix
   ```

3. テスト実行確認（リグレッション確認）

   ```bash
   pnpm --filter @repo/desktop test:e2e -- skillPermission
   ```

4. コードレビューチェックリスト

   | チェック項目           | 確認 |
   | ---------------------- | ---- |
   | 重複コードがない       | [ ]  |
   | 命名が明確             | [ ]  |
   | コメントが適切         | [ ]  |
   | マジックナンバーがない | [ ]  |
   | テストが独立している   | [ ]  |

**期待される成果物**:

- `outputs/phase-8/code-quality-report.md`: コード品質レポート

---

## 参照資料

| 参照資料       | パス                                                | 内容           |
| -------------- | --------------------------------------------------- | -------------- |
| Phase 6 テスト | `apps/desktop/src/__tests__/skillPermission.e2e.ts` | 拡充済みテスト |

### システム仕様（aiworkflow-requirements）

> リファクタリング時に以下のシステム仕様を参照してください。

| 参照資料         | パス                                                                                        | 内容             |
| ---------------- | ------------------------------------------------------------------------------------------- | ---------------- |
| 実装パターン     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | テストパターン   |
| 開発ガイドライン | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`               | コーディング規約 |

---

## 成果物

| 成果物              | パス                                                | 内容               |
| ------------------- | --------------------------------------------------- | ------------------ |
| E2Eテストファイル   | `apps/desktop/src/__tests__/skillPermission.e2e.ts` | リファクタリング版 |
| Page Object判断結果 | `outputs/phase-8/page-object-decision.md`           | 適用判断           |
| コード品質レポート  | `outputs/phase-8/code-quality-report.md`            | 品質確認結果       |

---

## 完了条件

- [ ] Page Object パターン適用の判断が完了している
- [ ] テストデータが適切に管理されている
- [ ] テスト構造が論理的に整理されている
- [ ] TypeScript / ESLint エラーがない
- [ ] 全テストが PASS している（リグレッションなし）
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスク1: Page Object パターン検討
3. 実行タスク2: テストデータの外部化
4. 実行タスク3: テスト構造の最適化
5. 実行タスク4: コード品質確認
6. 成果物の作成・配置
7. 完了条件の検証

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
# リファクタリング後もテストがPASSすることを確認
pnpm --filter @repo/desktop test:e2e -- skillPermission
```

**確認項目**:

- [ ] 全テストが PASS（Refactor 完了）

---

## 依存関係

- **前提**: Phase 7（テストカバレッジ確認）が完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/TASK-8C-D-e2e-permission/phase-09-quality.md`
