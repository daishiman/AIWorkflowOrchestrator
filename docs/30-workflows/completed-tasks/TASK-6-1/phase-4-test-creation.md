# Phase 4: テスト作成（TDD Red Phase） - SkillSlice実装

## テスト概要

SkillSlice の全機能に対する単体テストを作成する。TDDのRed Phaseとして、実装前にテストを作成し、全テストが失敗することを確認する。

## テストファイル

- **パス**: `apps/desktop/src/renderer/store/slices/__tests__/skillSlice.test.ts`
- **テストフレームワーク**: Vitest
- **テストID体系**: TS-6-1-XX

## テストケース一覧

### 1. 初期状態テスト（TS-6-1-01〜TS-6-1-10）

| テストID  | テスト内容                           | 期待結果       |
| --------- | ------------------------------------ | -------------- |
| TS-6-1-01 | availableSkillsが空配列である        | `[]`           |
| TS-6-1-02 | importedSkillsが空配列である         | `[]`           |
| TS-6-1-03 | selectedSkillNameがnullである        | `null`         |
| TS-6-1-04 | isExecutingがfalseである             | `false`        |
| TS-6-1-05 | executionIdがnullである              | `null`         |
| TS-6-1-06 | executionStatusがnullである          | `null`         |
| TS-6-1-07 | streamingMessagesが空配列である      | `[]`           |
| TS-6-1-08 | pendingPermissionがnullである        | `null`         |
| TS-6-1-09 | skillErrorがnullである               | `null`         |
| TS-6-1-10 | 全ローディング状態がfalse/nullである | 全てfalse/null |

### 2. fetchSkillsテスト（TS-6-1-11〜TS-6-1-15）

| テストID  | テスト内容                              | 期待結果                       |
| --------- | --------------------------------------- | ------------------------------ |
| TS-6-1-11 | 成功時にavailableSkillsに値が設定される | スキル一覧が設定される         |
| TS-6-1-12 | 成功時にimportedSkillsに値が設定される  | インポート済み一覧が設定される |
| TS-6-1-13 | 成功時にisLoadingSkillsがfalseになる    | `false`                        |
| TS-6-1-14 | 失敗時にskillErrorに値が設定される      | エラーメッセージ               |
| TS-6-1-15 | 呼び出し中はisLoadingSkillsがtrueである | `true`                         |

### 3. rescanSkillsテスト（TS-6-1-16〜TS-6-1-20）

| テストID  | テスト内容                          | 期待結果         |
| --------- | ----------------------------------- | ---------------- |
| TS-6-1-16 | 成功時にavailableSkillsが更新される | 新しいスキル一覧 |
| TS-6-1-17 | 成功時にisScanningがfalseになる     | `false`          |
| TS-6-1-18 | 失敗時にskillErrorに値が設定される  | エラーメッセージ |
| TS-6-1-19 | 呼び出し中はisScanningがtrueである  | `true`           |
| TS-6-1-20 | 成功時にskillErrorがnullになる      | `null`           |

### 4. importSkillテスト（TS-6-1-21〜TS-6-1-26）

| テストID  | テスト内容                                 | 期待結果               |
| --------- | ------------------------------------------ | ---------------------- |
| TS-6-1-21 | 成功時にimportedSkillsに追加される         | 追加されたスキルを含む |
| TS-6-1-22 | 成功時にavailableSkillsから削除される      | 該当スキルが削除される |
| TS-6-1-23 | 成功時にisImportingがfalseになる           | `false`                |
| TS-6-1-24 | 失敗時にskillErrorに値が設定される         | エラーメッセージ       |
| TS-6-1-25 | 呼び出し中はisImportingがtrueである        | `true`                 |
| TS-6-1-26 | 呼び出し中はimportingSkillNameが設定される | スキル名               |

### 5. removeSkillテスト（TS-6-1-27〜TS-6-1-30）

| テストID  | テスト内容                                      | 期待結果                   |
| --------- | ----------------------------------------------- | -------------------------- |
| TS-6-1-27 | 成功時にimportedSkillsから削除される            | 該当スキルが削除される     |
| TS-6-1-28 | 選択中スキル削除時にselectionがクリアされる     | `selectedSkillName = null` |
| TS-6-1-29 | 選択中でないスキル削除時はselectionが維持される | 変更なし                   |
| TS-6-1-30 | 失敗時にskillErrorに値が設定される              | エラーメッセージ           |

### 6. selectSkillテスト（TS-6-1-31〜TS-6-1-33）

| テストID  | テスト内容             | 期待結果         |
| --------- | ---------------------- | ---------------- |
| TS-6-1-31 | スキル名を設定できる   | 設定したスキル名 |
| TS-6-1-32 | nullを設定できる       | `null`           |
| TS-6-1-33 | 別のスキルを選択できる | 新しいスキル名   |

### 7. executeSkillテスト（TS-6-1-34〜TS-6-1-39）

| テストID  | テスト内容                               | 期待結果     |
| --------- | ---------------------------------------- | ------------ |
| TS-6-1-34 | 成功時にisExecutingがtrueになる          | `true`       |
| TS-6-1-35 | 成功時にexecutionStatusが"running"になる | `"running"`  |
| TS-6-1-36 | 成功時にstreamingMessagesがクリアされる  | `[]`         |
| TS-6-1-37 | 成功時にexecutionIdが設定される          | 実行ID       |
| TS-6-1-38 | 失敗時にexecutionStatusが"error"になる   | `"error"`    |
| TS-6-1-39 | スキル未選択時は実行されない             | 状態変更なし |

### 8. abortExecutionテスト（TS-6-1-40〜TS-6-1-42）

| テストID  | テスト内容                         | 期待結果      |
| --------- | ---------------------------------- | ------------- |
| TS-6-1-40 | isExecutingがfalseになる           | `false`       |
| TS-6-1-41 | executionStatusが"cancelled"になる | `"cancelled"` |
| TS-6-1-42 | executionIdがnull時は何もしない    | 状態変更なし  |

### 9. respondToPermissionテスト（TS-6-1-43〜TS-6-1-46）

| テストID  | テスト内容                            | 期待結果                 |
| --------- | ------------------------------------- | ------------------------ |
| TS-6-1-43 | 承認時にIPCが呼ばれる                 | approved=trueで呼ばれる  |
| TS-6-1-44 | 拒否時にIPCが呼ばれる                 | approved=falseで呼ばれる |
| TS-6-1-45 | pendingPermissionがクリアされる       | `null`                   |
| TS-6-1-46 | pendingPermissionがnull時は何もしない | 状態変更なし             |

### 10. 内部ハンドラテスト（TS-6-1-47〜TS-6-1-53）

| テストID  | テスト内容                                     | 期待結果         |
| --------- | ---------------------------------------------- | ---------------- |
| TS-6-1-47 | \_handleStreamMessageでメッセージが追加される  | 配列に追加される |
| TS-6-1-48 | \_handleCompleteでisExecutingがfalseになる     | `false`          |
| TS-6-1-49 | \_handleCompleteでstatusが"completed"になる    | `"completed"`    |
| TS-6-1-50 | \_handleErrorでisExecutingがfalseになる        | `false`          |
| TS-6-1-51 | \_handleErrorでstatusが"error"になる           | `"error"`        |
| TS-6-1-52 | \_handleErrorでskillErrorが設定される          | エラーメッセージ |
| TS-6-1-53 | \_handlePermissionRequestでpendingが設定される | リクエスト情報   |

### 11. ユーティリティアクションテスト（TS-6-1-54〜TS-6-1-56）

| テストID  | テスト内容                                 | 期待結果     |
| --------- | ------------------------------------------ | ------------ |
| TS-6-1-54 | clearErrorでskillErrorがnullになる         | `null`       |
| TS-6-1-55 | clearStreamingMessagesで配列がクリアされる | `[]`         |
| TS-6-1-56 | 複数のエラーをクリアした後に再度設定できる | 新しいエラー |

## テストコード構造

```typescript
/**
 * @file skillSlice 状態管理のテスト
 * @description TDD Red Phase - 実装前にテストを作成
 * @testIds TS-6-1-XX
 * @feature skill-import-agent-system
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createSkillSlice, type SkillSlice } from "../skillSlice";
import type {
  SkillMetadata,
  ImportedSkill,
  SkillStreamMessage,
  SkillPermissionRequest,
} from "@repo/shared";

describe("skillSlice", () => {
  let store: SkillSlice;
  let mockSet: (
    fn: ((state: SkillSlice) => Partial<SkillSlice>) | Partial<SkillSlice>,
  ) => void;

  beforeEach(() => {
    const state: Partial<SkillSlice> = {};
    mockSet = (fn) => {
      const partial =
        typeof fn === "function" ? fn(store) : (fn as Partial<SkillSlice>);
      Object.assign(state, partial);
      store = { ...store, ...state };
    };

    store = createSkillSlice(
      mockSet as never,
      (() => store) as never,
      {} as never,
    );
  });

  // ===== TS-6-1-01〜10: 初期状態 =====
  describe("初期状態", () => {
    it("TS-6-1-01: availableSkillsが空配列である", () => {});
    it("TS-6-1-02: importedSkillsが空配列である", () => {});
    // ...
  });

  // ===== TS-6-1-11〜15: fetchSkills =====
  describe("fetchSkills", () => {
    describe("成功時", () => {
      it("TS-6-1-11: availableSkillsに値が設定される", () => {});
      // ...
    });
    describe("失敗時", () => {
      it("TS-6-1-14: skillErrorに値が設定される", () => {});
      // ...
    });
  });

  // ... 他のテストケース
});
```

## モックデータ

```typescript
const mockAvailableSkills: SkillMetadata[] = [
  {
    name: "test-skill-1",
    description: "テストスキル1の説明",
    path: "~/.claude/skills/test-skill-1",
    updatedAt: new Date(),
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [],
    otherFiles: [],
  },
  {
    name: "test-skill-2",
    description: "テストスキル2の説明",
    path: "~/.claude/skills/test-skill-2",
    updatedAt: new Date(),
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [],
    otherFiles: [],
  },
];

const mockImportedSkills: ImportedSkill[] = [
  {
    ...mockAvailableSkills[0],
    importedAt: new Date(),
    status: "active",
  },
];

const mockStreamMessage: SkillStreamMessage = {
  executionId: "exec-123",
  type: "assistant",
  content: { text: "テストメッセージ", isPartial: false },
  timestamp: Date.now(),
};

const mockPermissionRequest: SkillPermissionRequest = {
  executionId: "exec-123",
  requestId: "req-456",
  toolName: "Bash",
  args: { command: "ls -la" },
};
```

## IPC APIモック設定

```typescript
beforeEach(() => {
  (global as any).window = {
    electronAPI: {
      skill: {
        list: vi.fn().mockResolvedValue(mockAvailableSkills),
        getImported: vi.fn().mockResolvedValue(mockImportedSkills),
        rescan: vi.fn().mockResolvedValue(mockAvailableSkills),
        import: vi.fn().mockImplementation((name) =>
          Promise.resolve({
            ...mockAvailableSkills[0],
            name,
            importedAt: new Date(),
            status: "active",
          }),
        ),
        remove: vi.fn().mockResolvedValue(undefined),
        execute: vi
          .fn()
          .mockResolvedValue({ executionId: "exec-123", success: true }),
        abort: vi.fn(),
        respondToPermission: vi.fn(),
        onStream: vi.fn().mockReturnValue(() => {}),
        onComplete: vi.fn().mockReturnValue(() => {}),
        onError: vi.fn().mockReturnValue(() => {}),
        onPermissionRequest: vi.fn().mockReturnValue(() => {}),
      },
    },
  };
});
```

## 完了条件

| 条件                                     | 状態 |
| ---------------------------------------- | ---- |
| 全56テストケースが作成されている         | [ ]  |
| テストファイルがTypeScriptコンパイル通過 | [ ]  |
| 全テストが"失敗"状態（Red Phase確認）    | [ ]  |
| モックデータが適切に定義されている       | [ ]  |
| IPC APIモックが設定されている            | [ ]  |

## 実行コマンド

```bash
# テスト実行（失敗を確認）
pnpm --filter @repo/desktop test skillSlice

# カバレッジ確認
pnpm --filter @repo/desktop test:coverage -- --reporter=text skillSlice
```
