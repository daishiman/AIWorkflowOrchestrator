# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容            |
| ---------- | --------------- |
| Phase      | 4               |
| Phase名    | テスト作成      |
| 前提Phase  | Phase 3         |
| 後続Phase  | Phase 5         |
| ステータス | 未実施          |
| 作成日     | 2026-01-25      |
| 機能名     | IPCチャネル定義 |

---

## 目的

TDD Red Phase: IPCチャネル定義の検証テストを作成する。
テストは失敗する状態（Red）で作成し、Phase 5の実装でPassさせる。

## 背景

本タスクは静的解析のみで検証可能な定数定義であるため、
ランタイムテストではなく、TypeScriptコンパイルテストと静的解析テストを作成する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 型チェックテストの設計

**目的**: TypeScript型チェックによる検証テストを設計する

**実行手順**:

1. チャネル定数の存在確認テストを設計する
2. 型エクスポートの確認テストを設計する
3. ホワイトリスト登録の確認テストを設計する

**テスト設計**:

```typescript
// apps/desktop/src/preload/__tests__/channels.test.ts

import { describe, it, expect } from "vitest";
import {
  IPC_CHANNELS,
  ALLOWED_INVOKE_CHANNELS,
  ALLOWED_ON_CHANNELS,
  type IpcChannel,
} from "../channels";

describe("SKILL_CHANNELS", () => {
  describe("チャネル定数の存在確認", () => {
    it("SKILL_SCAN が定義されている", () => {
      expect(IPC_CHANNELS.SKILL_SCAN).toBe("skill:scan");
    });

    it("SKILL_UPDATE が定義されている", () => {
      expect(IPC_CHANNELS.SKILL_UPDATE).toBe("skill:update");
    });

    it("SKILL_COMPLETE が定義されている", () => {
      expect(IPC_CHANNELS.SKILL_COMPLETE).toBe("skill:complete");
    });

    it("SKILL_ERROR が定義されている", () => {
      expect(IPC_CHANNELS.SKILL_ERROR).toBe("skill:error");
    });

    it("SKILL_PERMISSION_REQUEST が定義されている", () => {
      expect(IPC_CHANNELS.SKILL_PERMISSION_REQUEST).toBe(
        "skill:permission:request",
      );
    });

    it("SKILL_PERMISSION_RESPONSE が定義されている", () => {
      expect(IPC_CHANNELS.SKILL_PERMISSION_RESPONSE).toBe(
        "skill:permission:response",
      );
    });
  });

  describe("ホワイトリスト登録確認", () => {
    describe("ALLOWED_INVOKE_CHANNELS", () => {
      it("SKILL_SCAN が登録されている", () => {
        expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.SKILL_SCAN);
      });

      it("SKILL_UPDATE が登録されている", () => {
        expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.SKILL_UPDATE);
      });

      it("SKILL_PERMISSION_RESPONSE が登録されている", () => {
        expect(ALLOWED_INVOKE_CHANNELS).toContain(
          IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
        );
      });
    });

    describe("ALLOWED_ON_CHANNELS", () => {
      it("SKILL_COMPLETE が登録されている", () => {
        expect(ALLOWED_ON_CHANNELS).toContain(IPC_CHANNELS.SKILL_COMPLETE);
      });

      it("SKILL_ERROR が登録されている", () => {
        expect(ALLOWED_ON_CHANNELS).toContain(IPC_CHANNELS.SKILL_ERROR);
      });

      it("SKILL_PERMISSION_REQUEST が登録されている", () => {
        expect(ALLOWED_ON_CHANNELS).toContain(
          IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
        );
      });
    });
  });

  describe("型安全性確認", () => {
    it("IpcChannel型にスキルチャネルが含まれる", () => {
      // 型チェック: コンパイル時に検証
      const channel: IpcChannel = IPC_CHANNELS.SKILL_SCAN;
      expect(typeof channel).toBe("string");
    });
  });
});
```

**期待される成果物**:

- テストファイル設計書

---

### タスク2: テストファイルの作成

**目的**: 実際のテストファイルを作成する

**実行手順**:

1. テストファイルを作成する
2. テストが失敗することを確認する（Red状態）
3. 失敗理由を記録する

**期待される成果物**:

- `apps/desktop/src/preload/__tests__/channels.skill.test.ts`（新規追加テスト用）

---

### タスク3: 静的解析テストの設計

**目的**: ESLint/TypeScriptによる静的解析テストを設計する

**実行手順**:

1. 型チェックコマンドの確認（`pnpm typecheck`）
2. Lintコマンドの確認（`pnpm lint`）
3. テスト対象ファイルの確認

**検証コマンド**:

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# Lint
pnpm --filter @repo/desktop lint

# テスト実行
pnpm --filter @repo/desktop test
```

**期待される成果物**:

- 静的解析テスト手順書

---

## 参照資料

| 参照資料   | パス                                  | 内容               |
| ---------- | ------------------------------------- | ------------------ |
| 設計書     | `outputs/phase-2/design.md`           | Phase 2成果物      |
| 既存テスト | `apps/desktop/src/preload/__tests__/` | 既存テストパターン |

---

## 成果物

| 成果物         | パス                                                        | 内容             |
| -------------- | ----------------------------------------------------------- | ---------------- |
| テストファイル | `apps/desktop/src/preload/__tests__/channels.skill.test.ts` | ユニットテスト   |
| テスト設計書   | `outputs/phase-4/test-design.md`                            | テスト設計の詳細 |

---

## 統合テスト連携（Phase 1〜11は必須）

本タスクは定数定義のため、統合テストは不要。
ユニットテストと静的解析で十分な検証が可能。

---

## 完了条件

- [ ] テスト設計を完了した
- [ ] テストファイルを作成した
- [ ] テストが失敗することを確認した（Red状態）
- [ ] 静的解析テストの手順を確認した

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が完了していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/TASK-4-1-ipc-channels/phase-5-implementation.md`
