# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 4                                 |
| 機能名 | DEBT-SEC-001-auth-state-parameter |
| 作成日 | 2026-02-05                        |
| 状態   | 未着手                            |

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。

## 実行タスク

- TDD原則適用: テストファースト開発の実践
- ユニットテスト作成: StateManagerモジュールのテスト
- セキュリティテスト: 期限切れ、ワンタイムユース、プロバイダー不一致のテスト

---

## テストケース設計

### StateManagerモジュールのテストケース

| テストID | シナリオ                     | 入力                                          | 期待結果                         |
| -------- | ---------------------------- | --------------------------------------------- | -------------------------------- |
| ST-01    | State生成のユニーク性        | generate('google')を2回連続実行               | 2つの異なるstate文字列が返される |
| ST-02    | 正しいstateの検証成功        | generate→validate（同じstate, provider）      | trueが返される                   |
| ST-03    | 不正なstateの検証失敗        | validate('invalid_state', 'google')           | falseが返される                  |
| ST-04    | プロバイダー不一致の検証失敗 | generate('google')→validate(state, 'github')  | falseが返される                  |
| ST-05    | 期限切れstateの検証失敗      | generate後、10分経過→validate                 | falseが返される                  |
| ST-06    | ワンタイムユース             | generate→validate（成功）→validate（同state） | 2回目はfalseが返される           |
| ST-07    | クリーンアップ               | generate→10分経過→cleanup                     | 期限切れエントリが削除される     |

---

## テストファイル

**パス**: `apps/desktop/src/main/infrastructure/stateManager.test.ts`

---

## テストコード

```typescript
// apps/desktop/src/main/infrastructure/stateManager.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { stateManager } from "./stateManager";

describe("StateManager", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("generate", () => {
    it("ST-01: 連続生成で異なるstateが生成される", () => {
      const state1 = stateManager.generate("google");
      const state2 = stateManager.generate("google");

      expect(state1).not.toBe(state2);
      expect(state1).toHaveLength(64); // 32 bytes = 64 hex chars
      expect(state2).toHaveLength(64);
    });
  });

  describe("validate", () => {
    it("ST-02: 生成したstateの検証が成功する", () => {
      const state = stateManager.generate("google");

      const result = stateManager.validate(state, "google");

      expect(result).toBe(true);
    });

    it("ST-03: 存在しないstateの検証が失敗する", () => {
      const result = stateManager.validate("nonexistent_state", "google");

      expect(result).toBe(false);
    });

    it("ST-04: 異なるプロバイダーでの検証が失敗する", () => {
      const state = stateManager.generate("google");

      const result = stateManager.validate(state, "github");

      expect(result).toBe(false);
    });

    it("ST-05: 10分経過後のstateが期限切れで拒否される", () => {
      const state = stateManager.generate("google");

      // 10分 + 1ms 経過
      vi.advanceTimersByTime(10 * 60 * 1000 + 1);

      const result = stateManager.validate(state, "google");

      expect(result).toBe(false);
    });

    it("ST-06: 同じstateの2回目の検証が失敗する（ワンタイムユース）", () => {
      const state = stateManager.generate("google");

      const firstResult = stateManager.validate(state, "google");
      const secondResult = stateManager.validate(state, "google");

      expect(firstResult).toBe(true);
      expect(secondResult).toBe(false);
    });
  });

  describe("cleanup", () => {
    it("ST-07: 期限切れstateが自動削除される", () => {
      const expiredState = stateManager.generate("google");
      const validState = stateManager.generate("github");

      // 10分 + 1ms 経過（expiredStateは期限切れ、validStateも期限切れ）
      vi.advanceTimersByTime(10 * 60 * 1000 + 1);

      // 新しいstateを生成（これは有効）
      const freshState = stateManager.generate("discord");

      stateManager.cleanup();

      // 期限切れのstateは検証失敗
      expect(stateManager.validate(expiredState, "google")).toBe(false);
      expect(stateManager.validate(validState, "github")).toBe(false);
      // 新しいstateは検証成功
      expect(stateManager.validate(freshState, "discord")).toBe(true);
    });
  });
});
```

---

## TDD検証: Red状態確認

```bash
# テスト実行（実装前なのでインポートエラーまたはテスト失敗になる）
pnpm --filter @repo/desktop test:run stateManager.test.ts
```

- [ ] テストが失敗することを確認（Red状態）
- [ ] stateManager.tsが未実装のためインポートエラーが発生する

---

## テスト設計の根拠

### 受け入れ基準とのマッピング

| テストID | 対応する受け入れ基準 | 対応するFR |
| -------- | -------------------- | ---------- |
| ST-01    | AC-01                | FR-01      |
| ST-02    | AC-02                | FR-03      |
| ST-03    | AC-03, AC-04         | FR-04      |
| ST-04    | -                    | FR-07      |
| ST-05    | AC-05                | FR-05      |
| ST-06    | AC-06                | FR-06      |
| ST-07    | -                    | NFR-05     |

### 時間依存テストの設計方針

- `vi.useFakeTimers()`で時間を制御し、10分経過をシミュレート
- `vi.advanceTimersByTime(10 * 60 * 1000 + 1)` で境界値テスト
- `afterEach`で`vi.useRealTimers()`を呼び出し、他テストへの影響を防止

---

## 参照資料

| 資料名       | パス                                         | 説明          |
| ------------ | -------------------------------------------- | ------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 設計書       | `outputs/phase-2/design.md`                  | Phase 2成果物 |
| レビュー結果 | `outputs/phase-3/design-review-result.md`    | Phase 3成果物 |

---

## 実行手順

1. 参照資料を確認する
2. 実行タスクを順番に実施する
3. 各タスクの成果物を作成する
4. 完了条件を全て満たすことを確認する
5. 成果物を所定のパスに配置する

---

## 統合テスト連携【必須】

統合テストシナリオを設計する:

| シナリオカテゴリ   | 検証内容                                       | テストファイル         |
| ------------------ | ---------------------------------------------- | ---------------------- |
| 単体テスト         | StateManager generate/validate/cleanup         | `stateManager.test.ts` |
| セキュリティテスト | ワンタイムユース、期限切れ、プロバイダー不一致 | `stateManager.test.ts` |
| エントロピーテスト | 生成されるstateが64文字hex（256bit）           | `stateManager.test.ts` |

---

## 多角的チェック観点（AIが判断）

本Phaseの成果物に対して、以下の観点から品質を検証する:

| 観点       | 確認内容                                 |
| ---------- | ---------------------------------------- |
| 完全性     | 全ての要求事項が漏れなく反映されているか |
| 一貫性     | 他のPhase成果物との矛盾がないか          |
| 正確性     | 技術的な記述が正確であるか               |
| 追跡可能性 | 要件→設計→実装→テストの追跡が可能か      |

---

## 成果物

| 成果物       | パス                                                        | 説明           |
| ------------ | ----------------------------------------------------------- | -------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md`                     | 本ドキュメント |
| テストコード | `apps/desktop/src/main/infrastructure/stateManager.test.ts` | テストファイル |

---

## 完了条件

- [ ] 受け入れ基準ごとにユニットテストがある（7テストケース）
- [ ] すべてのテストが失敗状態（Red）
- [ ] セキュリティテスト（ワンタイム、期限切れ、プロバイダー不一致）が含まれている
- [ ] 時間依存テストにvi.useFakeTimers()を使用している
- [ ] 境界値テストが含まれている（有効期限の境界値、state文字列長の境界値）
- [ ] カバレッジ目標が設定されている（行カバレッジ80%以上）
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

| サブタスク     | 状態 | 備考 |
| -------------- | ---- | ---- |
| (実行時に記録) | -    | -    |

---

## タスク100%実行確認【必須】

- [ ] 全ての実行タスクを完了した
- [ ] 全ての成果物を作成した
- [ ] 全ての完了条件を満たした
- [ ] 成果物の品質を多角的チェック観点で検証した

> **注意**: このチェックリストが全てチェックされるまで、次のPhaseに進んではならない。

## 次のPhase

Phase 5: 実装（TDD: Green）
