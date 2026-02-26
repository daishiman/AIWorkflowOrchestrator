# Phase 4 成果物: テスト仕様書

## メタ情報

| 項目       | 内容         |
| ---------- | ------------ |
| タスクID   | TASK-9B      |
| Phase      | 4            |
| 成果物     | テスト仕様書 |
| 作成日     | 2026-02-26   |
| ステータス | 完了         |

## テスト戦略

### TDD Red フェーズの方針

1. 新規7メソッド（improveSkill, forkSkill, shareSkill, scheduleSkill, debugSkill, generateDocs, getStats）のユニットテストを追加
2. 4つの新規サブコンポーネント（HearingFacilitator, TaskGenerator, CodeGenerator, Validator）のユニットテストを新規作成
3. IPCバリデーションテストを新規作成
4. 統合テストを拡充
5. 境界値テストを追加

### 既存テスト状態

| テストファイル                          | 既存テストID        | 状態  |
| --------------------------------------- | ------------------- | ----- |
| SkillCreatorService.test.ts             | SC-001〜SC-019      | Green |
| SkillCreatorService.test.ts             | BC-001〜BC-005      | Green |
| skillCreatorHandlers.security.test.ts   | SEC-01a〜SEC-REG-03 | Green |
| SkillCreatorService.integration.test.ts | 機能テスト          | Green |
| skillCreatorIpc.integration.test.ts     | IPC-001〜           | Green |
| skill-creator-api.test.ts               | Preloadテスト       | Green |

### 新規テスト一覧（Red状態）

| カテゴリ | テストファイル                                  | テストID         | テスト数 |
| -------- | ----------------------------------------------- | ---------------- | -------- |
| A        | SkillCreatorService.test.ts（拡充）             | SC-020〜SC-031   | 12       |
| B        | HearingFacilitator.test.ts（新規）              | HF-001〜HF-006   | 6        |
| C        | TaskGenerator.test.ts（新規）                   | TG-001〜TG-007   | 7        |
| D        | CodeGenerator.test.ts（新規）                   | CG-001〜CG-005   | 5        |
| E        | Validator.test.ts（新規）                       | VL-001〜VL-007   | 7        |
| F        | skillCreatorHandlers.validation.test.ts（新規） | IPC-001〜IPC-012 | 12       |
| G        | SkillCreatorService.integration.test.ts（拡充） | INT-001〜INT-005 | 5        |
| H        | 境界値テスト（各ファイルに分散）                | BV-001〜BV-008   | 8        |
| **合計** |                                                 |                  | **62**   |

## モック設計

### 共通モックパターン

```typescript
// 既存のScriptExecutor/ResourceLoaderモック（継承）
vi.mock("../ScriptExecutor");
vi.mock("../ResourceLoader");

// 新規サブコンポーネントモック
vi.mock("../HearingFacilitator");
vi.mock("../TaskGenerator");
vi.mock("../CodeGenerator");
vi.mock("../ApiIntegrator");
vi.mock("../Validator");
```

### DI設計への影響（P35対策）

- Setter Injection使用のため、既存テストへのモック追加は不要
- 新規サブコンポーネントはSkillCreatorService内部で生成されるため、vi.mock()でモジュールレベルでモック化

## カバレッジ目標

| 指標              | 目標値 | Phase 4時点（Red） |
| ----------------- | ------ | ------------------ |
| Line Coverage     | 80%+   | 0%（未実装のため） |
| Branch Coverage   | 60%+   | 0%（未実装のため） |
| Function Coverage | 80%+   | 0%（未実装のため） |
