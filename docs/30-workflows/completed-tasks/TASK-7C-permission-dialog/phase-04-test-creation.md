# Phase 4: テスト作成（TDD: Red） - PermissionDialog コンポーネント

## メタ情報

| 項目      | 値                                        |
| --------- | ----------------------------------------- |
| Phase     | 4                                         |
| Phase名   | テスト作成                                |
| カテゴリ  | TDD-Red                                   |
| Feature   | skill-import-agent-system                 |
| Task      | TASK-7C PermissionDialog コンポーネント   |
| 前提Phase | Phase 3（設計レビューゲート: PASS/MINOR） |
| 次Phase   | Phase 5（実装）                           |
| TDD状態   | Red（テスト失敗を期待）                   |
| 作成日    | 2026-01-30                                |

## 目的

Phase 2の設計に基づき、PermissionDialogコンポーネントのテストをテストファースト（TDD Red）で作成する。この時点ではテストは全て失敗する状態が正常。

## 実行タスク

### Task 1: テストファイルの作成

**目的**: コンポーネントテストファイルを作成する

**手順**:

1. テストファイルを作成する: `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.test.tsx`
2. テスト環境をセットアップする:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Storeのモック
const mockRespondToSkillPermission = vi.fn();
const mockPendingPermission = {
  executionId: "exec-001",
  requestId: "req-001",
  toolName: "Bash",
  args: { command: "ls -la" },
  reason: "ディレクトリ内容を確認するため",
};

vi.mock("../../../store", () => ({
  useAppStore: vi.fn(() => ({
    pendingPermission: mockPendingPermission,
    respondToSkillPermission: mockRespondToSkillPermission,
  })),
}));

import { PermissionDialog } from "../PermissionDialog";
```

### Task 2: 表示/非表示テストの作成

**目的**: 条件付きレンダリングのテストを作成する

**テストケース**:

```typescript
describe("PermissionDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("表示制御", () => {
    it("pendingPermission が null の場合はダイアログを表示しない", () => {
      // useAppStore を pendingPermission: null でモック
      // render(<PermissionDialog />)
      // ダイアログのrole="dialog"要素が存在しないことを確認
    });

    it("pendingPermission が存在する場合にダイアログを表示する", () => {
      // デフォルトモック（pendingPermission あり）で render
      // role="dialog" 要素が存在することを確認
    });
  });
```

### Task 3: ツール情報表示テストの作成

**目的**: ツール名・引数・理由の表示テストを作成する

**テストケース**:

```typescript
describe("ツール情報表示", () => {
  it("ツール名を表示する", () => {
    // pendingPermission.toolName が画面に表示されることを確認
  });

  it("Bash コマンドの引数を直接表示する", () => {
    // args: { command: "ls -la" } の場合、"ls -la" が表示される
  });

  it("ファイルパスの引数を直接表示する", () => {
    // args: { path: "/tmp/file.txt" } の場合、"/tmp/file.txt" が表示される
  });

  it("その他のツールの引数を JSON 形式で表示する", () => {
    // args: { query: "test", limit: 10 } の場合、JSON文字列が表示される
  });

  it("理由が存在する場合に理由を表示する", () => {
    // pendingPermission.reason が存在する場合、reason テキストが表示される
  });

  it("理由が存在しない場合に理由セクションを表示しない", () => {
    // pendingPermission.reason が undefined の場合、理由セクションが存在しない
  });
});
```

### Task 4: ボタンアクションテストの作成

**目的**: 各ボタンのクリックアクションのテストを作成する

**テストケース**:

```typescript
describe("ボタンアクション", () => {
  it("「拒否」ボタンクリックで respondToSkillPermission(false, false) を呼ぶ", () => {
    // render → 「拒否」ボタンをクリック
    // mockRespondToSkillPermission が (false, false) で呼ばれたことを確認
  });

  it("「1回許可」ボタンクリックで respondToSkillPermission(true, false) を呼ぶ", () => {
    // render → 「1回許可」ボタンをクリック
    // mockRespondToSkillPermission が (true, false) で呼ばれたことを確認
  });

  it("「許可」ボタンクリックで respondToSkillPermission(true, false) を呼ぶ（チェックなし）", () => {
    // render → 「許可」ボタンをクリック（チェックボックスなし）
    // mockRespondToSkillPermission が (true, false) で呼ばれたことを確認
  });

  it("チェックボックスON + 「許可」ボタンで respondToSkillPermission(true, true) を呼ぶ", () => {
    // render → チェックボックスをクリック → 「許可」ボタンをクリック
    // mockRespondToSkillPermission が (true, true) で呼ばれたことを確認
  });

  it("閉じるボタン（✕）クリックで拒否と同じ動作をする", () => {
    // render → 閉じるボタンをクリック
    // mockRespondToSkillPermission が (false, false) で呼ばれたことを確認
  });
});
```

### Task 5: チェックボックス状態テストの作成

**目的**: rememberChoice チェックボックスの状態管理テストを作成する

**テストケース**:

```typescript
describe("チェックボックス状態", () => {
  it("チェックボックスのデフォルト状態はOFFである", () => {
    // render → チェックボックスが unchecked であることを確認
  });

  it("チェックボックスをクリックするとONになる", () => {
    // render → チェックボックスをクリック → checked になることを確認
  });

  it("拒否後にチェックボックス状態がリセットされる", () => {
    // render → チェックボックスON → 拒否 → 再表示時に unchecked
  });

  it("1回許可後にチェックボックス状態がリセットされる", () => {
    // render → チェックボックスON → 1回許可 → 再表示時に unchecked
  });

  it("許可後にチェックボックス状態がリセットされる", () => {
    // render → チェックボックスON → 許可 → 再表示時に unchecked
  });
});
```

### Task 6: アクセシビリティテストの作成

**目的**: ARIA属性・キーボード操作のテストを作成する

**テストケース**:

```typescript
  describe("アクセシビリティ", () => {
    it("ダイアログに role='dialog' が設定されている", () => {
      // role="dialog" の要素が存在することを確認
    });

    it("ダイアログに aria-modal='true' が設定されている", () => {
      // aria-modal="true" 属性を確認
    });

    it("ダイアログに aria-labelledby が設定されている", () => {
      // aria-labelledby 属性が存在し、対応する要素がある
    });

    it("Escape キーで拒否操作が実行される", () => {
      // render → Escape キーイベント発火
      // mockRespondToSkillPermission が (false, false) で呼ばれる
    });
  });
});
```

### Task 7: テスト実行（全失敗の確認）

**目的**: 作成したテストが全て失敗することを確認する（TDD Red確認）

**手順**:

1. テストを実行する:
   ```bash
   pnpm --filter @repo/desktop vitest run src/renderer/components/skill/__tests__/PermissionDialog.test.tsx
   ```
2. 全テストが FAIL であることを確認する
3. テスト失敗の理由がコンポーネント未実装であることを確認する（インポートエラー等）

## 統合テスト連携

| カテゴリ     | 確認内容                                                |
| ------------ | ------------------------------------------------------- |
| 状態同期     | Store モックが正しく pendingPermission を返すことを確認 |
| データフロー | respondToSkillPermission のモック引数が期待値と一致する |
| エラー処理   | 不正なデータでの表示テストが含まれている                |

## 成果物

| 成果物名       | パス                                                                             | タイプ   |
| -------------- | -------------------------------------------------------------------------------- | -------- |
| テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.test.tsx` | test     |
| テスト仕様書   | `outputs/phase-4/test-specification.md`                                          | document |

## 完了条件

- [ ] テストファイルが作成されている
- [ ] 表示/非表示テスト（2件）が作成されている
- [ ] ツール情報表示テスト（6件）が作成されている
- [ ] ボタンアクションテスト（5件）が作成されている
- [ ] チェックボックス状態テスト（5件）が作成されている
- [ ] アクセシビリティテスト（4件）が作成されている
- [ ] テスト実行結果が全て FAIL であることを確認（TDD Red）
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/tasks/TASK-7C-permission-dialog --phase 4
```

## 次のPhase

Phase 5: 実装（TDD: Green）

`docs/30-workflows/skill-import-agent-system/tasks/TASK-7C-permission-dialog/phase-05-implementation.md`

## 参照資料

| 参照資料             | パス                                           | 説明                 |
| -------------------- | ---------------------------------------------- | -------------------- |
| Phase 2成果物        | `outputs/phase-2/`                             | 設計書               |
| Phase 3成果物        | `outputs/phase-3/`                             | レビュー結果         |
| タスク定義テスト要件 | `../task-7c-permission-dialog.md`              | テスト要件セクション |
| テスト戦略仕様       | `aiworkflow-requirements: testing-template.md` | テスト基準           |
