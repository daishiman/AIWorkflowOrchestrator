# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 4                              |
| Phase名    | テスト作成（TDD: Red）         |
| 前提Phase  | Phase 3                        |
| 後続Phase  | Phase 5                        |
| ステータス | 未実施                         |
| 作成日     | 2026-01-22                     |
| 機能名     | skill-import-store-persistence |

---

## 目的

問題を再現するテストを作成し、修正前にテストが失敗することを確認する（TDDのRed状態）。

## 背景

ユニットテストではモックを使用しているため、実環境固有の問題が検出されなかった。本Phaseでは、実際のelectron-storeとの連携を検証するテストを作成する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 問題再現テストの作成

**目的**: 報告された問題を再現するテストを作成する

**実行手順**:

1. Phase 1の要件定義を確認する
2. 以下のテストケースを作成する
   - `skill:import`でインポート後、`skill:list-imported`で取得できること
   - ストアファイルが正しい場所に作成されること
   - ストアファイルの内容が正しい形式であること
3. テストファイルを作成または追加する
   - `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.integration.test.ts`
4. テストが**失敗する**ことを確認する（Red状態）

**テストコード例**:

```typescript
describe("SkillImportManager Integration Tests", () => {
  describe("実環境でのストア永続化", () => {
    it("インポートしたスキルIDがストアに保存されること", async () => {
      // Arrange
      const manager = new SkillImportManager();
      const skillId = "test-skill-001";

      // Act
      manager.importSkill(skillId);
      const importedIds = manager.getImportedSkillIds();

      // Assert
      expect(importedIds).toContain(skillId);
    });

    it("ストアファイルが正しい場所に作成されること", async () => {
      // Arrange
      const manager = new SkillImportManager();

      // Act & Assert
      const storePath = manager.getStorePath();
      expect(fs.existsSync(storePath)).toBe(true);
    });
  });
});
```

**期待される成果物**:

- `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.integration.test.ts`

---

### タスク2: IPC経由の永続化テストの作成

**目的**: IPC経由でのスキルインポート永続化をテストする

**実行手順**:

1. IPC Handlerレベルのテストを作成する
2. 以下のシナリオをテストする
   - `skill:import` → `skill:list-imported`のフロー
   - エラーハンドリング
3. テストファイルを作成または追加する

**期待される成果物**:

- `apps/desktop/src/main/ipc/__tests__/skillHandlers.integration.test.ts`

---

### タスク3: テスト実行と失敗確認

**目的**: 作成したテストが現状で失敗することを確認する

**実行手順**:

1. 作成したテストを実行する
   ```bash
   pnpm --filter @repo/desktop test -- SkillImportManager.integration
   ```
2. テストが失敗することを確認する
3. 失敗理由が期待通りか確認する
4. テスト実行結果を記録する

**期待される成果物**:

- `outputs/phase-04/test-results.md`（失敗するテストのリスト）

---

## 参照資料

| 参照資料       | パス                                               | 内容            |
| -------------- | -------------------------------------------------- | --------------- |
| Phase 2 設計書 | `outputs/phase-02/test-strategy.md`                | テスト戦略      |
| 既存テスト     | `apps/desktop/src/main/services/skill/__tests__/`  | 既存テスト      |
| electron-store | https://github.com/sindresorhus/electron-store#api | APIドキュメント |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                        | 内容             |
| ------------------------- | --------------------------------------------------------------------------- | ---------------- |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | skill:\* IPC仕様 |

---

## 成果物

| 成果物     | パス                                                                                    | 内容           |
| ---------- | --------------------------------------------------------------------------------------- | -------------- |
| 統合テスト | `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.integration.test.ts` | 永続化テスト   |
| IPCテスト  | `apps/desktop/src/main/ipc/__tests__/skillHandlers.integration.test.ts`                 | IPC経由テスト  |
| テスト結果 | `outputs/phase-04/test-results.md`                                                      | 失敗テスト記録 |

---

## 統合テスト連携（Phase 1〜11は必須）

このPhaseでは統合テストシナリオを全カテゴリで作成する：

| カテゴリ           | テスト内容                                         |
| ------------------ | -------------------------------------------------- |
| API接続テスト      | skill:import、skill:list-imported IPCの疎通        |
| データフローテスト | Renderer→IPC→SkillService→SkillImportManager→Store |
| エラーハンドリング | 無効なskillId、ストア書き込み失敗時のエラー表示    |
| 状態同期テスト     | インポート→一覧取得の状態整合性                    |

---

## 完了条件

- [ ] 問題を再現する統合テストが作成されている
- [ ] IPC経由の永続化テストが作成されている
- [ ] テストが**失敗する**ことが確認されている（Red状態）
- [ ] 失敗理由が期待通りの内容である

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証（Phase 4, 5, 8 の場合）

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- SkillImportManager.integration
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

`docs/30-workflows/skill-import-store-persistence/phase-5-implementation.md`
