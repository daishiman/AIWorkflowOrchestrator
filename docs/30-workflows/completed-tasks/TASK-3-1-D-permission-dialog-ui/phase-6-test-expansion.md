# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 6                               |
| Phase名    | テスト拡充                      |
| 前提Phase  | Phase 5                         |
| 後続Phase  | Phase 7                         |
| ステータス | 未実施                          |
| 作成日     | 2026-01-25                      |
| 機能名     | TASK-3-1-D-permission-dialog-ui |

---

## 目的

カバレッジ目標達成に向けて、テストを拡充する。エッジケース、異常系、境界値テストを追加する。

## 背景

Phase 5で基本実装が完了した。Phase 7のカバレッジ確認に向けて、テストを拡充する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: エッジケーステスト追加

**目的**: 境界条件やエッジケースのテストを追加する

**実行手順**:

1. skillAPI permissionエッジケース:

   ```typescript
   describe("skillAPI permission edge cases", () => {
     it("should handle multiple permission requests", () => {
       // 複数リクエスト処理テスト
     });

     it("should handle empty args object", () => {
       // 空args処理テスト
     });

     it("should handle undefined reason", () => {
       // reason未定義テスト
     });

     it("should handle rapid consecutive calls", () => {
       // 連続呼び出しテスト
     });
   });
   ```

2. SkillStreamDisplayエッジケース:

   ```typescript
   describe("SkillStreamDisplay edge cases", () => {
     it("should handle unmount during permission dialog", () => {
       // アンマウント時テスト
     });

     it("should handle permission request while processing", () => {
       // 処理中リクエストテスト
     });
   });
   ```

**期待される成果物**:

- 追加されたエッジケーステスト

---

### タスク2: 異常系テスト追加

**目的**: エラーケースのテストを追加する

**実行手順**:

1. IPC通信エラー:

   ```typescript
   describe("IPC error handling", () => {
     it("should handle IPC invoke failure", () => {
       // invoke失敗テスト
     });

     it("should handle disallowed channel error", () => {
       // 不許可チャネルエラーテスト
     });
   });
   ```

2. 不正なリクエスト処理:

   ```typescript
   describe("invalid request handling", () => {
     it("should handle missing requestId", () => {
       // requestId欠落テスト
     });

     it("should handle invalid request format", () => {
       // 不正フォーマットテスト
     });
   });
   ```

**期待される成果物**:

- 追加された異常系テスト

---

### タスク3: アクセシビリティテスト追加

**目的**: アクセシビリティ関連のテストを追加する

**実行手順**:

1. キーボードナビゲーション:

   ```typescript
   describe("keyboard navigation", () => {
     it("should trap focus within dialog", () => {
       // フォーカストラップテスト
     });

     it("should focus Allow button on open", () => {
       // 初期フォーカステスト
     });

     it("should cycle focus with Tab", () => {
       // Tabキーテスト
     });
   });
   ```

2. ARIA属性:

   ```typescript
   describe("ARIA attributes", () => {
     it('should have role="alertdialog"', () => {
       // role属性テスト
     });

     it('should have aria-modal="true"', () => {
       // aria-modal属性テスト
     });

     it("should have aria-labelledby", () => {
       // aria-labelledby属性テスト
     });
   });
   ```

**期待される成果物**:

- 追加されたアクセシビリティテスト

---

### タスク4: 統合テスト拡充

**目的**: 統合テストシナリオを拡充する

**実行手順**:

1. タイムアウトシナリオ:

   ```typescript
   describe("timeout scenarios", () => {
     it("should handle response timeout gracefully", () => {
       // タイムアウトテスト（Main Process側でタイムアウトされた場合のUI挙動）
     });
   });
   ```

2. キャンセルシナリオ:
   ```typescript
   describe("cancel scenarios", () => {
     it("should handle execution abort during permission", () => {
       // 実行中断時のpermissionダイアログ処理
     });
   });
   ```

**期待される成果物**:

- 追加された統合テスト

---

## 参照資料

| 参照資料             | パス                                                                                 | 内容               |
| -------------------- | ------------------------------------------------------------------------------------ | ------------------ |
| Phase 4テスト        | `apps/desktop/src/preload/__tests__/skill-api.permission.test.ts`                    | 基本テスト         |
| Phase 5実装          | `apps/desktop/src/preload/skill-api.ts`                                              | 実装コード         |
| 既存permissionテスト | `apps/desktop/src/renderer/views/AgentExecutionView/__tests__/*.permission.test.tsx` | テストパターン参考 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料 | パス                                                                        | 内容       |
| -------- | --------------------------------------------------------------------------- | ---------- |
| 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テスト基準 |

---

## 成果物

| 成果物                   | パス                                                                  | 内容             |
| ------------------------ | --------------------------------------------------------------------- | ---------------- |
| 拡充されたテストファイル | `apps/desktop/src/preload/__tests__/skill-api.permission.test.ts`     | エッジケース追加 |
| 拡充されたテストファイル | `apps/desktop/src/renderer/components/AgentView/__tests__/*.test.tsx` | 異常系・a11y追加 |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 6での統合テスト連携アクション:**

- 統合テストの拡充（タイムアウト、キャンセル等）を行う
- 全カテゴリのカバレッジ向上を目指す

---

## 完了条件

- [ ] エッジケーステストが追加されている
- [ ] 異常系テストが追加されている
- [ ] アクセシビリティテストが追加されている
- [ ] 統合テストが拡充されている
- [ ] 全テストがPASSしている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 5（実装）が完了していること
- **後続**: Phase 7（カバレッジ確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-3-1-D-permission-dialog-ui/phase-7-coverage-check.md`
