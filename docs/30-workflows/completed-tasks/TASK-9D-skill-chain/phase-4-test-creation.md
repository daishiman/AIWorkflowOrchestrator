# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 4                                  |
| Phase名    | テスト作成（TDD: Red）             |
| 前提Phase  | Phase 3（設計レビューゲート PASS） |
| 後続Phase  | Phase 5（実装）                    |
| ステータス | pending                            |
| 作成日     | 2026-02-28                         |
| 機能名     | TASK-9D: スキルチェーン機能実装    |

---

## 目的

TDD（テスト駆動開発）の Red フェーズとして、実装前に失敗するテストを作成する。SkillChainExecutor（5メソッド）、SkillChainStore（4メソッド）、IPCハンドラ（5チャネル）、型定義の全テストを先行作成し、Phase 5 の実装仕様を確定させる。

## 背景

スキルチェーン機能は Main Process 層（Executor/Store）、IPC 層（ハンドラ）、Shared 層（型定義）の3層にまたがる。テスト先行により各層のインターフェース契約を固定し、P44（IPC インターフェース不整合）を未然に防止する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テストシナリオ設計

**目的**: Phase 1 の受け入れ基準と Phase 2 の設計からテストシナリオを導出する

**実行手順**:

1. Phase 1 の受け入れ基準（`outputs/phase-1/acceptance-criteria.md`）を参照し、各基準に対応するテストシナリオを列挙する
2. Phase 2 の設計（`outputs/phase-2/architecture-design.md`、`outputs/phase-2/api-specification.md`）を参照し、各メソッドのテストシナリオを列挙する
3. 以下の3層でテストシナリオを整理する：

| テスト層           | 対象                                   | テスト種別     |
| ------------------ | -------------------------------------- | -------------- |
| Main Process       | SkillChainExecutor、SkillChainStore    | ユニットテスト |
| IPC通信            | 5チャネルのハンドラ                    | ユニットテスト |
| Shared             | 型定義の整合性                         | 型テスト       |
| 統合テスト（設計） | Main→IPC→Preload→Renderer の往復フロー | 統合テスト     |

4. `outputs/phase-4/test-specification.md` にテスト設計を記録する

**期待される成果物**:

- `outputs/phase-4/test-specification.md`

---

### タスク2: SkillChainExecutor テスト作成

**目的**: SkillChainExecutor の5メソッドのテストを作成する

**実行手順**:

1. `apps/desktop/src/main/services/skill/SkillChainExecutor.test.ts` を作成する

2. 以下の5メソッドに対するテストケースを実装する：

#### executeChain テスト

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("SkillChainExecutor", () => {
  describe("executeChain", () => {
    it("2ステップのチェーンを順次実行し、各StepResultを含むSkillChainResultを返す", async () => {
      // Arrange: 2ステップのチェーン定義を作成
      // Act: executeChain を呼び出す
      // Assert: success === true、results.length === 2、totalDuration > 0
    });

    it("前ステップの出力が次ステップの入力として渡される（previousOutput型）", async () => {
      // Arrange: step1 → step2 で previousOutput マッピングを設定
      // Act: executeChain を呼び出す
      // Assert: step2 の入力に step1 の出力が含まれる
    });

    it("errorHandling が 'stop' の場合、ステップ失敗で即座にチェーンを中断する", async () => {
      // Arrange: 3ステップ、step2 が失敗する設定
      // Act: executeChain を呼び出す
      // Assert: success === false、results.length === 2（step3 は未実行）
    });

    it("errorHandling が 'skip' の場合、失敗ステップをスキップして次へ進む", async () => {
      // Arrange: 3ステップ、step2 が失敗する設定、errorHandling: "skip"
      // Act: executeChain を呼び出す
      // Assert: results.length === 3、step2.skipped === true
    });

    it("errorHandling が 'retry' の場合、失敗ステップを retryCount 回まで再試行する", async () => {
      // Arrange: step に retryCount: 2 を設定、1回目失敗・2回目成功
      // Act: executeChain を呼び出す
      // Assert: success === true
    });

    it("空のステップ配列の場合、success: true で空の results を返す", async () => {
      // Arrange: steps: []
      // Act: executeChain を呼び出す
      // Assert: success === true、results === []
    });

    it("variables パラメータが finalVariables に反映される", async () => {
      // Arrange: variables: { key: "value" } を渡す
      // Act: executeChain を呼び出す
      // Assert: finalVariables に初期変数が含まれる
    });

    it("ステップの timeout を超過した場合、そのステップを失敗として扱う", async () => {
      // Arrange: timeout: 100（ms）の設定で長時間かかるスキルを実行
      // Act: executeChain を呼び出す
      // Assert: 該当ステップの error にタイムアウト情報が含まれる
    });
  });
});
```

#### buildStepInput テスト

```typescript
describe("buildStepInput", () => {
  it("type: 'literal' の場合、value をそのまま返す", () => {
    // inputMapping: { type: "literal", value: "hello" }
    // 期待値: "hello"
  });

  it("type: 'variable' の場合、variables から値を取得する", () => {
    // inputMapping: { type: "variable", value: "myVar" }
    // variables: { myVar: "resolved" }
    // 期待値: "resolved"
  });

  it("type: 'template' の場合、テンプレート内の変数を展開する", () => {
    // inputMapping: { type: "template", template: "Hello {{name}}" }
    // variables: { name: "World" }
    // 期待値: "Hello World"
  });

  it("type: 'previousOutput' の場合、前ステップの出力を返す", () => {
    // inputMapping: { type: "previousOutput" }
    // previousOutput: { data: "from-step-1" }
    // 期待値: { data: "from-step-1" }
  });

  it("variable が存在しない場合、undefined を返す", () => {
    // inputMapping: { type: "variable", value: "nonExistent" }
    // variables: {}
    // 期待値: undefined
  });
});
```

#### evaluateCondition テスト

```typescript
describe("evaluateCondition", () => {
  it("type: 'always' の場合、常に true を返す", () => {});

  it("type: 'ifVariable' の場合、指定変数が expectedValue と一致すれば true", () => {
    // condition: { type: "ifVariable", variable: "mode", expectedValue: "prod" }
    // variables: { mode: "prod" }
    // 期待値: true
  });

  it("type: 'ifVariable' で値が不一致の場合、false を返す", () => {});

  it("type: 'ifPreviousSuccess' の場合、前ステップが成功なら true", () => {
    // previousResult: { success: true }
    // 期待値: true
  });

  it("type: 'ifPreviousSuccess' で前ステップが失敗の場合、false を返す", () => {});

  it("type: 'expression' の場合、式を評価して結果を返す", () => {
    // condition: { type: "expression", expression: "count > 5" }
    // variables: { count: 10 }
    // 期待値: true
  });

  it("condition が未設定の場合、true を返す（デフォルト実行）", () => {});
});
```

#### extractOutput テスト

```typescript
describe("extractOutput", () => {
  it("extractPath 指定時、出力オブジェクトから該当パスの値を抽出する", () => {
    // outputMapping: { extractPath: "data.result", variableName: "res" }
    // output: { data: { result: "extracted" } }
    // 期待値: variables["res"] === "extracted"
  });

  it("extractPath 未指定時、出力全体を variableName に格納する", () => {
    // outputMapping: { variableName: "fullOutput" }
    // output: { key: "value" }
    // 期待値: variables["fullOutput"] === { key: "value" }
  });

  it("outputMapping 未設定時、変数を更新しない", () => {});

  it("extractPath のパスが存在しない場合、undefined を格納する", () => {});
});
```

#### renderTemplate テスト

```typescript
describe("renderTemplate", () => {
  it("{{variableName}} を変数値に置換する", () => {
    // template: "Skill: {{skillName}}, Version: {{version}}"
    // variables: { skillName: "test", version: "1.0" }
    // 期待値: "Skill: test, Version: 1.0"
  });

  it("存在しない変数は空文字列に置換する", () => {
    // template: "Hello {{unknown}}"
    // variables: {}
    // 期待値: "Hello "
  });

  it("テンプレート構文が含まれない文字列はそのまま返す", () => {});

  it("ネストした変数参照（{{a.b}}）は未サポートとしてそのまま残す", () => {});
});
```

3. テストが失敗することを確認する（Red 状態）

**期待される成果物**:

- `apps/desktop/src/main/services/skill/SkillChainExecutor.test.ts`

---

### タスク3: SkillChainStore テスト作成

**目的**: SkillChainStore のCRUD操作テストを作成する

**実行手順**:

1. `apps/desktop/src/main/services/skill/SkillChainStore.test.ts` を作成する

2. 以下のテストケースを実装する：

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("SkillChainStore", () => {
  describe("save", () => {
    it("新規チェーン定義を保存し、保存された定義を返す", async () => {
      // Arrange: SkillChainDefinition を作成
      // Act: save を呼び出す
      // Assert: 返り値が保存された定義と一致
    });

    it("既存のチェーン定義を上書き保存する（同一 id）", async () => {
      // Arrange: 同じ id で save を2回呼ぶ
      // Assert: get で取得した結果が2回目の内容
    });

    it("updatedAt が保存時に更新される", async () => {});

    it("id が空文字列の場合、バリデーションエラーを投げる", async () => {});
  });

  describe("get", () => {
    it("指定 chainId のチェーン定義を取得する", async () => {});

    it("存在しない chainId の場合、null を返す", async () => {});
  });

  describe("list", () => {
    it("保存済みの全チェーン定義を配列で返す", async () => {});

    it("チェーンが0件の場合、空配列を返す", async () => {});

    it("複数チェーンが保存されている場合、全件を返す", async () => {});
  });

  describe("delete", () => {
    it("指定 chainId のチェーン定義を削除する", async () => {
      // Arrange: save で保存後に delete を呼ぶ
      // Assert: get で null が返る
    });

    it("存在しない chainId を削除しても例外を投げない", async () => {});

    it("削除後に list の件数が減少する", async () => {});
  });
});
```

3. テストが失敗することを確認する（Red 状態）

**期待される成果物**:

- `apps/desktop/src/main/services/skill/SkillChainStore.test.ts`

---

### タスク4: IPC ハンドラテスト作成

**目的**: 5チャネルのIPCハンドラテスト（バリデーション・正常系・異常系）を作成する

**実行手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.chain.test.ts` を作成する

2. 全5チャネルに対して以下の観点でテストを実装する：
   - **P42 準拠 3段バリデーション**: 文字列引数に対する `typeof` → 空文字列 → `trim()` チェック
   - **sender 検証**: 不正な sender からの呼び出しを拒否
   - **正常系**: 有効な引数での成功パス
   - **異常系**: 不正な引数（null、undefined、数値、空文字列、スペースのみ）

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Skill Chain IPC Handlers", () => {
  // --- skill:chain:list ---
  describe("skill:chain:list", () => {
    it("保存済みチェーン一覧を返す", async () => {});

    it("チェーンが0件の場合、空配列を返す", async () => {});

    it("sender 検証に失敗した場合、エラーを返す", async () => {});
  });

  // --- skill:chain:get ---
  describe("skill:chain:get", () => {
    it("有効な chainId で該当チェーンを返す", async () => {});

    it("存在しない chainId で null を返す", async () => {});

    it("chainId が string 以外の場合、VALIDATION_ERROR を投げる", async () => {
      // P42: typeof チェック
    });

    it("chainId が空文字列の場合、VALIDATION_ERROR を投げる", async () => {
      // P42: 空文字列チェック
    });

    it("chainId がスペースのみの場合、VALIDATION_ERROR を投げる", async () => {
      // P42: trim() チェック
    });
  });

  // --- skill:chain:save ---
  describe("skill:chain:save", () => {
    it("有効な SkillChainDefinition を保存する", async () => {});

    it("definition が null の場合、VALIDATION_ERROR を投げる", async () => {});

    it("definition.id が空文字列の場合、VALIDATION_ERROR を投げる", async () => {});

    it("definition.name がスペースのみの場合、VALIDATION_ERROR を投げる", async () => {
      // P42: trim() チェック
    });

    it("definition.steps が配列でない場合、VALIDATION_ERROR を投げる", async () => {});

    it("definition.errorHandling が許可値以外の場合、VALIDATION_ERROR を投げる", async () => {
      // 許可値: "stop" | "skip" | "retry"
    });
  });

  // --- skill:chain:delete ---
  describe("skill:chain:delete", () => {
    it("有効な chainId でチェーンを削除する", async () => {});

    it("chainId が string 以外の場合、VALIDATION_ERROR を投げる", async () => {});

    it("chainId が空文字列の場合、VALIDATION_ERROR を投げる", async () => {});

    it("chainId がスペースのみの場合、VALIDATION_ERROR を投げる", async () => {});
  });

  // --- skill:chain:execute ---
  describe("skill:chain:execute", () => {
    it("有効な chainId でチェーンを実行し、SkillChainResult を返す", async () => {});

    it("variables を渡した場合、実行時変数として使用される", async () => {});

    it("chainId が string 以外の場合、VALIDATION_ERROR を投げる", async () => {});

    it("chainId が空文字列の場合、VALIDATION_ERROR を投げる", async () => {});

    it("chainId がスペースのみの場合、VALIDATION_ERROR を投げる", async () => {});

    it("存在しない chainId の場合、NOT_FOUND エラーを返す", async () => {});

    it("variables がオブジェクト以外の場合、VALIDATION_ERROR を投げる", async () => {});
  });
});
```

3. テストが失敗することを確認する（Red 状態）

**期待される成果物**:

- `apps/desktop/src/main/ipc/skillHandlers.chain.test.ts`

---

### タスク5: 型定義テスト作成

**目的**: 共有型定義の整合性テストを作成する

**実行手順**:

1. `packages/shared/src/types/skill-chain.test.ts` を作成する

2. 以下の型テストを実装する：

```typescript
import { describe, it, expect } from "vitest";

describe("skill-chain types", () => {
  it("SkillChainDefinition 型が必須フィールドを持つ", () => {
    // 型レベルテスト: id, name, steps, errorHandling, createdAt, updatedAt が必須
  });

  it("InputMapping の type は4つのリテラル型のみ許可する", () => {
    // "literal" | "variable" | "template" | "previousOutput"
  });

  it("SkillChainCondition の type は4つのリテラル型のみ許可する", () => {
    // "always" | "ifVariable" | "ifPreviousSuccess" | "expression"
  });

  it("errorHandling は3つのリテラル型のみ許可する", () => {
    // "stop" | "skip" | "retry"
  });

  it("SkillChainResult が必須フィールドを持つ", () => {
    // chainId, success, results, finalVariables, totalDuration が必須
  });

  it("StepResult の success と skipped はオプショナルである", () => {});

  it("createdAt と updatedAt は ISO 8601 文字列型である", () => {});
});
```

**期待される成果物**:

- `packages/shared/src/types/skill-chain.test.ts`

---

### タスク6: 統合テスト設計

**目的**: Main→IPC→Preload→Renderer の往復テスト設計を文書化する

**実行手順**:

1. 以下の統合テストシナリオを設計する：

| シナリオ                | 起点     | 経由     | 終点     | 検証内容                                             |
| ----------------------- | -------- | -------- | -------- | ---------------------------------------------------- |
| チェーン保存→取得       | Renderer | IPC→Main | Renderer | save したデータが get で取得可能                     |
| チェーン実行→結果取得   | Renderer | IPC→Main | Renderer | execute 結果が正しい形式で返る                       |
| チェーン削除→一覧確認   | Renderer | IPC→Main | Renderer | delete 後に list から除外される                      |
| Date 型シリアライズ検証 | Main     | IPC境界  | Renderer | createdAt/updatedAt が ISO 8601 文字列として渡される |

2. `outputs/phase-4/integration-test-design.md` に設計を記録する

**期待される成果物**:

- `outputs/phase-4/integration-test-design.md`

---

### タスク7: テストケース一覧の作成

**目的**: 全テストケースを一覧として整理する

**実行手順**:

1. タスク2〜5で作成したテストケースを集約し、以下の形式で一覧化する：

| #   | テストファイル             | describe     | it                | 観点   |
| --- | -------------------------- | ------------ | ----------------- | ------ |
| 1   | SkillChainExecutor.test.ts | executeChain | 2ステップ順次実行 | 正常系 |
| ... | ...                        | ...          | ...               | ...    |

2. `outputs/phase-4/test-cases.md` に記録する

**期待される成果物**:

- `outputs/phase-4/test-cases.md`

---

### タスク8: Red 状態確認

**目的**: 全テストが失敗することを確認する（TDD Red フェーズ）

**実行手順**:

1. 以下のコマンドでテストを実行する：

```bash
cd apps/desktop && pnpm vitest run src/main/services/skill/SkillChainExecutor.test.ts src/main/services/skill/SkillChainStore.test.ts src/main/ipc/skillHandlers.chain.test.ts
```

```bash
cd packages/shared && pnpm vitest run src/types/skill-chain.test.ts
```

2. 全テストが失敗することを確認する（対象クラスが未実装のため）

3. `outputs/phase-4/test-red-status.md` にテスト実行結果を記録する

**期待される成果物**:

- `outputs/phase-4/test-red-status.md`（テストケース一覧の test-cases.md に統合可）

---

## 参照資料

| 参照資料              | パス                                                                                                                         | 内容                       |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| 受け入れ基準          | `outputs/phase-1/acceptance-criteria.md`                                                                                     | テストシナリオの源泉       |
| 設計書                | `outputs/phase-2/architecture-design.md`                                                                                     | クラス・メソッド設計       |
| API仕様               | `outputs/phase-2/api-specification.md`                                                                                       | IPC仕様・引数定義          |
| 型設計                | `outputs/phase-2/type-design.md`                                                                                             | 7型の詳細定義              |
| Phase 3 レビュー結果  | `outputs/phase-3/review-result.md`                                                                                           | 設計ゲートの指摘事項       |
| タスク仕様            | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023e-task-9d-skill-chain.md` | 型定義・IPC定義の正本      |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                                                | P42/P44バリデーション      |
| セキュリティIPC       | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                                                    | sender検証パターン         |
| 実装パターン          | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                                  | テスト設計パターン         |
| 認証セキュリティ実装  | `.claude/skills/aiworkflow-requirements/references/security-implementation.md`                                               | authCallbackServer停止条件 |
| 認証実装パターン      | `.claude/skills/aiworkflow-requirements/references/patterns.md`                                                              | ローカルHTTP受信パターン   |
| 教訓集                | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                                       | P39/P41テスト注意事項      |

---

## 成果物

| 成果物             | パス                                                              | 内容                    |
| ------------------ | ----------------------------------------------------------------- | ----------------------- |
| テスト設計         | `outputs/phase-4/test-specification.md`                           | テストシナリオ設計      |
| テストケース一覧   | `outputs/phase-4/test-cases.md`                                   | 全テストケースの一覧表  |
| 統合テスト設計     | `outputs/phase-4/integration-test-design.md`                      | 統合テストシナリオ      |
| Executor テスト    | `apps/desktop/src/main/services/skill/SkillChainExecutor.test.ts` | Executor ユニットテスト |
| Store テスト       | `apps/desktop/src/main/services/skill/SkillChainStore.test.ts`    | Store ユニットテスト    |
| IPC ハンドラテスト | `apps/desktop/src/main/ipc/skillHandlers.chain.test.ts`           | IPCハンドラテスト       |
| 型定義テスト       | `packages/shared/src/types/skill-chain.test.ts`                   | 型整合性テスト          |

---

## TDD検証

### TDD サイクル確認

```bash
# Executor / Store テスト実行
cd apps/desktop && pnpm vitest run src/main/services/skill/SkillChainExecutor.test.ts src/main/services/skill/SkillChainStore.test.ts

# IPC ハンドラテスト実行
cd apps/desktop && pnpm vitest run src/main/ipc/skillHandlers.chain.test.ts

# 型定義テスト実行
cd packages/shared && pnpm vitest run src/types/skill-chain.test.ts
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## 統合テスト連携

**Phase 4 では統合テストの準備として**:

- IPC ハンドラテスト用のモック SkillChainStore / SkillChainExecutor パターンを定義
- sender 検証用の mockEvent オブジェクトパターンを定義
- 統合テストシナリオ（Main→IPC→Preload→Renderer 往復）を設計文書として記録

---

## 多角的チェック観点

### テスト設計品質

| 観点                     | 確認内容                                                          | 結果 |
| ------------------------ | ----------------------------------------------------------------- | ---- |
| P42 バリデーション       | 文字列引数に3段チェック（typeof → 空文字列 → trim()）テストがある | □    |
| P44 契約整合             | IPC引数名と Preload 側の渡し方が一致するテストがある              | □    |
| P39 happy-dom 互換       | テストファイルで `userEvent` を使用していない（`fireEvent` のみ） | □    |
| P9 テスト独立性          | 各テストが `beforeEach` でリセットされ、実行順序に非依存          | □    |
| P41 インライン関数       | v8カバレッジでインライン arrow function のカウントに注意した設計  | □    |
| errorHandling 全パターン | "stop" / "skip" / "retry" の3パターンが全てテストされている       | □    |
| Date シリアライズ        | ISO 8601 文字列としての送受信がテスト設計に含まれている           | □    |

### Electron 固有観点

| 観点              | 確認内容                                                 | 結果 |
| ----------------- | -------------------------------------------------------- | ---- |
| sender 検証       | 不正な sender からの呼び出しを拒否するテストがある       | □    |
| IPC_CHANNELS 定数 | テスト内でチャネル名をハードコード文字列で使用していない | □    |
| Main Process 分離 | テストが Renderer 依存なしで独立実行可能                 | □    |

---

## 完了条件

- [ ] テスト設計（`test-specification.md`）が作成されている
- [ ] テストケース一覧（`test-cases.md`）が作成されている
- [ ] 統合テスト設計（`integration-test-design.md`）が作成されている
- [ ] SkillChainExecutor テスト（5メソッド分）が作成されている
- [ ] SkillChainStore テスト（4メソッド分）が作成されている
- [ ] IPC ハンドラテスト（5チャネル × バリデーション・正常系・異常系）が作成されている
- [ ] 型定義テストが作成されている
- [ ] 全テストが Red 状態（失敗）であることが確認されている
- [ ] P42 準拠の3段バリデーションテストが全文字列引数に含まれている
- [ ] P39 準拠で happy-dom 環境に `userEvent` を使用していない

---

## サブタスク管理

Phase 4 の進行中に検出したサブタスクは以下に記録し、Phase 12 の未タスク検出で処理する：

| #   | サブタスク | 対応Phase | ステータス |
| --- | ---------- | --------- | ---------- |
|     |            |           |            |

---

## タスク100%実行確認

| タスク | 内容               | 完了 |
| ------ | ------------------ | ---- |
| 1      | テストシナリオ設計 | □    |
| 2      | Executor テスト    | □    |
| 3      | Store テスト       | □    |
| 4      | IPC ハンドラテスト | □    |
| 5      | 型定義テスト       | □    |
| 6      | 統合テスト設計     | □    |
| 7      | テストケース一覧   | □    |
| 8      | Red 状態確認       | □    |

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（8タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] テストファイルが各配置先に正しく作成されている

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が PASS していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/TASK-9D-skill-chain/phase-5-implementation.md`
