# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 8                                 |
| Phase名    | リファクタリング（TDD: Refactor） |
| タスクID   | TASK-9D                           |
| 前提Phase  | Phase 7（カバレッジ確認）         |
| 後続Phase  | Phase 9（品質保証）               |
| ステータス | pending                           |
| 作成日     | 2026-02-28                        |
| 機能名     | TASK-9D-skill-chain               |

---

## 目的

TDD の Refactor フェーズとして、テストを維持しながらスキルチェーン機能全体（SkillChainExecutor / SkillChainStore / IPCハンドラー）のコード品質を向上させる。
重複コードの抽出、SOLID原則の適用、命名の統一を実施し、保守性を改善する。

## 背景

Phase 5〜7 で実装した SkillChainExecutor（チェーン実行エンジン、5メソッド）、SkillChainStore（永続化、4メソッド）、IPCハンドラー5件は、各レイヤーで類似のバリデーション・エラーハンドリングパターンを繰り返している。
特に buildStepInput / extractOutput のデータ変換ロジックと、evaluateCondition / renderTemplate のテンプレート処理ロジックに重複が見込まれる。
5つのIPCハンドラーの3段バリデーション（P42準拠）パターンにも共通化の余地がある。
統合的なリファクタリングにより、レイヤー横断での品質向上と今後のチェーンUI実装（task-031b）時の保守性を確保する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: SkillChainExecutor の重複コード分析・抽出

**目的**: SkillChainExecutor 内の5メソッド（executeChain, buildStepInput, evaluateCondition, extractOutput, renderTemplate）間の重複を分析し、抽出する

**実行手順**:

1. `apps/desktop/src/main/services/skill/SkillChainExecutor.ts` を読み込む
2. buildStepInput と extractOutput で InputMapping / OutputMapping の変換ロジックに重複がないか分析する
3. evaluateCondition と renderTemplate でテンプレート変数の解決ロジックが共通化可能か分析する
4. executeChain 内のステップ反復処理で、エラーハンドリング・ステップ結果の蓄積パターンに重複がないか確認する
5. Result<T, E> パターンの使用が全メソッドで統一されているか確認する
6. SRP（単一責務原則）の観点で、テンプレート処理とデータマッピングの分離を検討する
7. 抽出・分離する場合は実装し、全テストがパスすることを確認する
8. 分離しない場合はその理由を記録する

**分析観点**:

| 観点                                 | 確認内容                                                                                  |
| ------------------------------------ | ----------------------------------------------------------------------------------------- |
| InputMapping/OutputMapping変換の重複 | buildStepInput と extractOutput で同一のマッピング解決ロジックが繰り返されていないか      |
| テンプレート変数解決の重複           | evaluateCondition と renderTemplate で `{{variable}}` 構文の解決コードが共通化可能か      |
| ステップ反復のエラーハンドリング     | executeChain 内で各ステップの try/catch が同一パターンで繰り返されていないか              |
| StepResult 生成パターン              | 成功/失敗/スキップの StepResult 生成コードが複数箇所に散在していないか                    |
| 条件分岐評価ロジック                 | SkillChainCondition の評価（eq/neq/gt/lt/contains/regex）で共通の比較ロジックが抽出可能か |

**判断基準**:

| 判断     | 条件                                                                  |
| -------- | --------------------------------------------------------------------- |
| 抽出する | 3行以上の完全に同一のコードブロックが3箇所以上ある場合                |
| 分離する | テンプレート処理が4メソッド以上から参照され独立した責務を形成する場合 |
| 見送る   | 抽出・分離すると可読性が低下し、テストの保守コストが増加する場合      |

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillChainExecutor --reporter=verbose
```

**期待される成果物**:

- `outputs/phase-8/skillchainexecutor-refactoring-analysis.md`

---

### タスク2: SkillChainStore の永続化ロジック共通化

**目的**: SkillChainStore 内の4メソッド（save, get, list, delete）で永続化ロジックの重複を分析し、共通化する

**実行手順**:

1. `apps/desktop/src/main/services/skill/SkillChainStore.ts` を読み込む
2. save / get / list / delete で electron-store へのアクセスパターンが共通化可能か分析する
3. Date型のシリアライズ/デシリアライズ（ISO 8601形式）が各メソッドで統一されているか確認する
4. electron-store からの読み込みデータの実行時バリデーション（P19対策: `as` による型アサーション回避）が統一されているか確認する
5. SkillChainDefinition のバリデーション（チェーン名重複チェック、ステップ数上限チェック）が `save` 実行時に必ず走ることを確認する
6. 共通アクセスパターンの抽出可否を判断する
7. 抽出する場合は実装し、全テストがパスすることを確認する

**バリデーション重複候補**:

```typescript
// Before: save/get で繰り返されるパターン（想定）
const raw = this.store.get(key) as unknown;
if (raw === undefined || raw === null) {
  return { success: false, error: { code: "NOT_FOUND", message: "..." } };
}
// 実行時バリデーション（P19対策）
if (typeof raw !== "object" || !("id" in raw)) {
  return {
    success: false,
    error: { code: "VALIDATION_ERROR", message: "..." },
  };
}

// After: 共通アクセス関数（検討）
function getValidatedChain(
  store: ElectronStore,
  key: string,
): Result<SkillChainDefinition, AppError> {
  // 読み込み + バリデーションを1箇所に集約
}
```

**Date型シリアライズ確認ポイント**:

| チェック項目              | 確認内容                                                           |
| ------------------------- | ------------------------------------------------------------------ |
| save時のDate→ISO 8601変換 | `createdAt` / `updatedAt` が ISO 8601文字列として保存されている    |
| get時のISO 8601→Date変換  | 文字列から Date オブジェクトに正しく復元されている                 |
| list時の一括変換          | 全チェーン定義の日付フィールドが一括で変換されている               |
| IPC境界での変換           | Renderer に返す際に Date が ISO 8601文字列になっている（JSON互換） |

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillChainStore --reporter=verbose
```

**期待される成果物**:

- `outputs/phase-8/skillchainstore-persistence-commonization.md`

---

### タスク3: IPCハンドラーの共通バリデーション関数化

**目的**: 5つのチェーン関連IPCハンドラーに共通する3段バリデーション（型チェック → 空文字列 → トリム空文字列）を共通関数に抽出する

**実行手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.ts` のチェーン関連5ハンドラーを読み込む
2. 各ハンドラーの `validateIpcSender` → バリデーション → try/catch パターンを分析する
3. P42準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）が各ハンドラーで重複していないか確認する
4. 既存の他のskillHandlers（TASK-9A/9Gで追加されたものを含む）との共通化可能性を確認する
5. 共通バリデーション関数の抽出可否を判断する
6. 抽出する場合は実装し、全テスト（チェーン関連ハンドラーテスト全件）がパスすることを確認する

**抽出候補**:

```typescript
// Before: 各ハンドラーで繰り返されるパターン
// skill:chain:get
if (typeof chainId !== "string" || chainId.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "chainId must be a non-empty string",
  };
}
// skill:chain:save
if (typeof chainDefinition !== "object" || chainDefinition === null) {
  throw {
    code: "VALIDATION_ERROR",
    message: "chainDefinition must be a valid object",
  };
}
// skill:chain:delete
if (typeof chainId !== "string" || chainId.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "chainId must be a non-empty string",
  };
}

// After: 共通バリデーション関数（検討）
function validateStringArg(value: unknown, argName: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw {
      code: "VALIDATION_ERROR",
      message: `${argName} must be a non-empty string`,
    };
  }
  return value.trim();
}

function validateObjectArg<T>(value: unknown, argName: string): T {
  if (typeof value !== "object" || value === null) {
    throw {
      code: "VALIDATION_ERROR",
      message: `${argName} must be a valid object`,
    };
  }
  return value as T;
}
```

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --reporter=verbose --grep "chain"
```

**期待される成果物**:

- `outputs/phase-8/ipc-chain-validation-commonization.md`

---

### タスク4: 命名規則・型定義統一確認

**目的**: スキルチェーン機能の全ファイルで命名規則と型定義が統一されていることを確認する

**実行手順**:

1. 全対象ファイルの命名パターンを確認する
2. P45対策として、IPCハンドラーの引数名が実際の値のセマンティクスと一致しているか確認する
3. boolean変数に `is`/`has`/`can`/`should` プレフィックスが使われているか確認する
4. `packages/shared/src/types/skill-chain.ts` の7つの型名とプロパティ名がプロジェクト全体の命名規則に準拠しているか確認する
5. 全テストがパスすることを確認する

**命名規則チェックリスト**:

| チェック項目         | 基準                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------- |
| 型名                 | PascalCase（例: `SkillChainDefinition`, `SkillChainStep`, `InputMapping`, `OutputMapping`） |
| 関数名               | camelCase（例: `executeChain`, `buildStepInput`, `evaluateCondition`）                      |
| 定数名               | UPPER_SNAKE_CASE（例: `SKILL_CHAIN_LIST`, `SKILL_CHAIN_EXECUTE`）                           |
| boolean変数          | `is`/`has`/`can`/`should` プレフィックス（例: `isCompleted`, `hasError`）                   |
| 引数名セマンティクス | 実際の値と一致（P45対策: chainId/chainName等の乖離なし）                                    |

**対象ファイル**:

| ファイル                                                     | 確認内容           |
| ------------------------------------------------------------ | ------------------ |
| `apps/desktop/src/main/services/skill/SkillChainExecutor.ts` | サービス層命名     |
| `apps/desktop/src/main/services/skill/SkillChainStore.ts`    | ストア層命名       |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                 | IPCハンドラー命名  |
| `packages/shared/src/types/skill-chain.ts`                   | 型定義命名         |
| `apps/desktop/src/preload/skill-api.ts`                      | Preload API命名    |
| `apps/desktop/src/preload/types.ts`                          | 型定義命名         |
| `apps/desktop/src/preload/channels.ts`                       | チャンネル定数命名 |
| `apps/desktop/src/renderer/store/slices/skillSlice.ts`       | Store状態命名      |

**7つの型定義の命名確認**:

| 型名                 | 命名規則準拠 | プロパティの一貫性 |
| -------------------- | ------------ | ------------------ |
| SkillChainDefinition | -            | -                  |
| SkillChainStep       | -            | -                  |
| InputMapping         | -            | -                  |
| OutputMapping        | -            | -                  |
| SkillChainCondition  | -            | -                  |
| SkillChainResult     | -            | -                  |
| StepResult           | -            | -                  |

**確認コマンド**:

```bash
# P45対策: 引数名の一致確認
grep -rn "chainId\|chainName\|skillName" apps/desktop/src/main/services/skill/SkillChainExecutor.ts apps/desktop/src/main/services/skill/SkillChainStore.ts apps/desktop/src/main/ipc/skillHandlers.ts
```

**期待される成果物**:

- `outputs/phase-8/naming-type-unification.md`

---

### タスク5: Renderer Store（skillSlice）のチェーン状態リファクタリング確認

**目的**: skillSlice に追加されたチェーン状態管理が個別セレクタパターン（P31対策）に準拠しているか確認する

**実行手順**:

1. `apps/desktop/src/renderer/store/slices/skillSlice.ts` のチェーン関連状態を読み込む
2. チェーン状態の個別セレクタ（例: `useSkillChains()`, `useSkillChainById()`, `useSkillChainExecutionStatus()`）が提供されているか確認する
3. 合成Store Hook（`useSkillSlice()`）の戻り値にチェーン関連アクションが含まれている場合、個別セレクタへの移行を検討する（P31対策）
4. チェーン実行状態のローディング・エラー管理パターンが既存パターンと統一されているか確認する
5. 全テストがパスすることを確認する

**P31対策チェックリスト**:

| チェック項目                         | 確認内容                                                             |
| ------------------------------------ | -------------------------------------------------------------------- |
| 個別セレクタの提供                   | チェーン状態取得用の個別セレクタが定義されている                     |
| 合成Hookの非推奨マーク               | `@deprecated` タグが付与されている（該当する場合）                   |
| useEffect依存配列の安全性            | アクション関数を依存配列に含める場合、個別セレクタ経由で取得している |
| ローディング・エラー状態パターン統一 | 既存のスキル読み込みパターンと同一の構造を使用している               |

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/renderer/store/__tests__/skillSlice --reporter=verbose --grep "chain"
```

**期待される成果物**:

- `outputs/phase-8/store-chain-state-review.md`

---

## 参照資料

| 参照資料                 | パス                                                                 | 内容                   |
| ------------------------ | -------------------------------------------------------------------- | ---------------------- |
| SkillChainExecutor       | `apps/desktop/src/main/services/skill/SkillChainExecutor.ts`         | チェーン実行エンジン   |
| SkillChainStore          | `apps/desktop/src/main/services/skill/SkillChainStore.ts`            | チェーン永続化         |
| IPCハンドラー            | `apps/desktop/src/main/ipc/skillHandlers.ts`                         | Main Processハンドラー |
| チェーン型定義           | `packages/shared/src/types/skill-chain.ts`                           | 共有型定義（7型）      |
| Preload API              | `apps/desktop/src/preload/skill-api.ts`                              | Preload API実装        |
| Preload型定義            | `apps/desktop/src/preload/types.ts`                                  | 型定義                 |
| チャンネル定数           | `apps/desktop/src/preload/channels.ts`                               | チャンネル定義         |
| skillSlice               | `apps/desktop/src/renderer/store/slices/skillSlice.ts`               | Renderer状態管理       |
| テストファイル           | `apps/desktop/src/main/services/skill/__tests__/SkillChainExecutor*` | Executorテスト         |
| テストファイル           | `apps/desktop/src/main/services/skill/__tests__/SkillChainStore*`    | Storeテスト            |
| Phase 1 要件成果物       | `outputs/phase-1/`                                                   | 要件・受入基準         |
| Phase 2 設計成果物       | `outputs/phase-2/`                                                   | 設計仕様               |
| Phase 5 実装成果物       | `outputs/phase-5/`                                                   | 実装サマリー           |
| Phase 6 テスト拡充成果物 | `outputs/phase-6/`                                                   | 追加テスト結果         |
| Phase 7 カバレッジ成果物 | `outputs/phase-7/`                                                   | カバレッジ判定結果     |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                                        | 内容             |
| ------------------ | ------------------------------------------------------------------------------------------- | ---------------- |
| IPC仕様            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPC チャンネル   |
| サービス設計       | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | Electronサービス |
| セキュリティ原則   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC セキュリティ |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーカテゴリ   |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 設計パターン集   |
| 状態管理           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Zustand設計原則  |

### スキルチェーン設計資産

| 参照資料                 | パス                                                              | 内容                          |
| ------------------------ | ----------------------------------------------------------------- | ----------------------------- |
| チェーン設計エージェント | `.claude/skills/skill-creator/agents/design-skill-chain.md`       | 設計思考プロセス（8ステップ） |
| チェーンパターン集       | `.claude/skills/skill-creator/references/skill-chain-patterns.md` | 基本4+応用2パターン           |
| オーケストレーション     | `.claude/skills/skill-creator/references/orchestration-guide.md`  | 全体アーキテクチャ・変数構文  |

---

## 成果物

| 成果物                       | パス                                                           | 内容                            |
| ---------------------------- | -------------------------------------------------------------- | ------------------------------- |
| SkillChainExecutorリファクタ | `outputs/phase-8/skillchainexecutor-refactoring-analysis.md`   | Executor重複分析・抽出結果      |
| SkillChainStore永続化共通化  | `outputs/phase-8/skillchainstore-persistence-commonization.md` | 永続化ロジック共通化結果        |
| IPCバリデーション共通化      | `outputs/phase-8/ipc-chain-validation-commonization.md`        | 3段バリデーション共通化結果     |
| 命名・型定義統一             | `outputs/phase-8/naming-type-unification.md`                   | 命名規則・型統一確認結果        |
| Store状態レビュー            | `outputs/phase-8/store-chain-state-review.md`                  | skillSlice チェーン状態確認結果 |

---

## 統合テスト連携

> リファクタ後の統合テスト継続成功を確認する

| 確認項目                   | 基準                                       |
| -------------------------- | ------------------------------------------ |
| 全ユニットテスト           | 100% パス                                  |
| SkillChainExecutorテスト   | チェーン実行・条件分岐テスト全件PASS       |
| SkillChainStoreテスト      | CRUD・永続化・バリデーションテスト全件PASS |
| IPCハンドラーテスト（5件） | 全テストケースPASS                         |
| チェーン型テスト           | 7型定義テスト全件PASS                      |
| セキュリティテスト         | sender検証・バリデーションPASS             |
| skillSliceテスト           | チェーン状態管理テスト全件PASS             |
| カバレッジ維持             | リファクタ前と同等以上                     |

---

## TDD検証

### TDD サイクル確認

```bash
# リファクタリング中は継続的にテスト実行
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillChainExecutor --watch
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillChainStore --watch
```

**確認項目**:

- [ ] リファクタリング後もSkillChainExecutorテストが全て成功する
- [ ] リファクタリング後もSkillChainStoreテストが全て成功する
- [ ] リファクタリング後もIPCハンドラーテスト（チェーン関連5件）が全て成功する
- [ ] リファクタリング後も型定義テストが全て成功する
- [ ] リファクタリング後もskillSliceテスト（チェーン関連）が全て成功する

---

## 完了条件

- [ ] SkillChainExecutorの重複コード分析と抽出判断（実施または見送り理由記録）が完了している
- [ ] SkillChainStoreの永続化ロジック共通化判断が完了している
- [ ] IPCハンドラーの3段バリデーション共通化判断が完了している
- [ ] 命名規則・型定義が全ファイルで統一されている（P45対策: chainId/chainName統一を含む）
- [ ] skillSliceのチェーン状態が個別セレクタパターン（P31対策）に準拠している
- [ ] 全てのテストがパスしている
- [ ] カバレッジがリファクタ前と同等以上である

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（5ファイル）が全て生成されていることを確認
- [ ] テストが継続してGreen状態であることを確認

---

## 依存関係

- **前提**: Phase 7 が完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/TASK-9D-skill-chain/phase-9-quality-assurance.md`
