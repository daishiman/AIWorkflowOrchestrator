# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| Phase      | 4                                                                     |
| Phase名    | テスト作成                                                            |
| 対象機能   | UT-SDK-07-APPROVAL-REQUEST-SURFACE-001: approval:request surface 追加 |
| 前提Phase  | Phase 3: 設計レビュー（PASS/MINOR）                                   |
| 次Phase    | Phase 5: 実装                                                         |
| ステータス | pending                                                               |
| 作成日     | 2026-04-06                                                            |
| 更新日     | 2026-04-06                                                            |

## 目的

TDD Red フェーズとして、実装前にテストを先行作成する。preload listener・approval UI コンポーネント・respondToApproval 接続の各層でテストケースを設計する。

## 実行手順

### Step 1: Phase 2 の設計書と Phase 3 の設計レビュー結果を確認

- `outputs/phase-2/architecture-design.md`: `onApprovalRequest` 型・UI Props 型
- `outputs/phase-3/design-review-result.md`: MINOR 指摘事項（あれば反映）

### Step 2: 既存テストのパターンを確認

```bash
# governance-bundle の既存テスト確認
cat apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts

# preload skill-creator-api の既存テスト確認（あれば）
ls apps/desktop/src/preload/__tests__/

# SkillLifecyclePanel の既存テスト確認
ls apps/desktop/src/renderer/components/skill/__tests__/
```

## 実行タスク

### Task 1: preload listener テスト（`skill-creator-api.test.ts`）

`onApprovalRequest` listener のテストを設計する:

```typescript
// テストケース設計（実際のファイルパスは Phase 5 実装時に確定）
describe("skillCreatorAPI.onApprovalRequest", () => {
  it("approval:request イベントを受信して callback を呼び出す", () => {
    // ipcRenderer.on のモック
    // APPROVAL_REQUEST チャネルへのイベント送信
    // callback 呼び出しの確認
  });

  it("cleanup function を呼び出すと listener が解除される", () => {
    // cleanup() 呼び出し後にイベントを発行
    // callback が呼ばれないことを確認
  });

  it("ApprovalRequest 型のデータが正しく渡される", () => {
    // requestId・toolName・expiresAt 等のフィールド確認
  });
});
```

### Task 2: ApprovalRequestPanel コンポーネントテスト

```typescript
describe("ApprovalRequestPanel", () => {
  describe("pending 状態", () => {
    it("ツール名・引数が表示される", () => {});
    it("承認ボタンと拒否ボタンが表示される", () => {});
    it("TTL残り時間が表示される", () => {});
  });

  describe("expired 状態", () => {
    it("承認ボタンと拒否ボタンが disabled になる", () => {});
    it("expired 警告メッセージが表示される", () => {});
  });

  describe("approve 操作", () => {
    it("承認ボタンクリックで onApprove(requestId) が呼ばれる", () => {});
    it("onApprove 完了後に resolved 状態に遷移する", () => {});
  });

  describe("reject 操作", () => {
    it("拒否ボタンクリックで onReject(requestId) が呼ばれる", () => {});
    it("onReject 完了後に resolved 状態に遷移する", () => {});
  });
});
```

### Task 3: SkillLifecyclePanel 統合テスト（approval 受信フロー）

```typescript
describe("SkillLifecyclePanel - approval 受信フロー", () => {
  it("onApprovalRequest イベント受信時に ApprovalRequestPanel が表示される", () => {
    // onApprovalRequest コールバックを発火
    // ApprovalRequestPanel が render されることを確認
  });

  it("approve 操作で respondToApproval({ approved: true }) が呼ばれる", () => {
    // mock respondToApproval
    // 承認ボタンクリック
    // 引数の確認
  });

  it("reject 操作で respondToApproval({ approved: false }) が呼ばれる", () => {});

  it("approval 解決後に ApprovalRequestPanel が非表示になる", () => {});
});
```

### Task 4: テストファイル配置計画

| テストファイル                                                                                             | テスト対象                          | 優先度 |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------ |
| `apps/desktop/src/preload/__tests__/skill-creator-api.approval.test.ts`（新規）                            | onApprovalRequest listener          | 高     |
| `apps/desktop/src/renderer/components/skill/__tests__/ApprovalRequestPanel.test.tsx`（新規）               | ApprovalRequestPanel コンポーネント | 高     |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.approval.test.tsx`（新規or拡張） | approval 受信フロー統合             | 高     |

### Task 5: テストケース一覧の作成

`outputs/phase-4/test-cases.md` に全テストケースを一覧化する。各ケースに:

- テストID（TC-001 等）
- テスト名
- テスト対象
- 前提条件
- 期待結果
- 実装 Phase（Phase 4 先行 or Phase 6 拡充）

## 参照資料

| 資料名               | パス                                                                                                  | 説明                       |
| -------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------- |
| Phase 2 設計書       | `outputs/phase-2/architecture-design.md`                                                              | 型定義・コンポーネント設計 |
| Phase 3 レビュー結果 | `outputs/phase-3/design-review-result.md`                                                             | MINOR 指摘事項             |
| governance-bundle    | `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts`                          | approval テストのパターン  |
| lessons-learned      | `.claude/skills/aiworkflow-requirements/references/lessons-learned-skill-lifecycle-test-hardening.md` | テスト標準化               |

## 多角的チェック観点

| 観点       | 適用判断                             | 確認内容                                         |
| ---------- | ------------------------------------ | ------------------------------------------------ |
| TDD        | 実装前テスト先行のため適用           | テストが RED（実装前に失敗）することを確認       |
| 命名規則   | Phase 1 で確認した規則に合わせるため | テストファイル名・describe/it 名の命名規則確認   |
| カバレッジ | Phase 7 目標に備えるため             | pending/expired/approved/rejected の全状態カバー |
| Mock 設計  | preload IPC のモック方針のため       | `ipcRenderer` のモック方針を統一する             |

## 統合テスト連携

- Phase 4 のテストケースは Phase 5 の実装でそのまま RED→GREEN に使える形へ引き継ぐ。
- approval surface の pending / expired / resolve の各状態は Phase 6 と Phase 11 の検証軸に引き継ぐ。

## 成果物

| 成果物         | パス                            | 説明                                     |
| -------------- | ------------------------------- | ---------------------------------------- |
| テストケース表 | `outputs/phase-4/test-cases.md` | 全テストケース一覧（TC-001〜）と配置計画 |

## 完了条件

- [ ] preload listener テストケースが設計されている（cleanup・型検証含む）
- [ ] ApprovalRequestPanel コンポーネントテストケースが設計されている（全状態）
- [ ] SkillLifecyclePanel 統合テストケースが設計されている
- [ ] テストファイルの配置計画が確定している
- [ ] `outputs/phase-4/test-cases.md` が作成されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 5: 実装](./phase-5-implementation.md)
