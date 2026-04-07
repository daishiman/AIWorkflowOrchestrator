# IPC契約監査パターン（チャネル命名・型伝播） / ipc-naming specification
> 親ファイル: [architecture-implementation-patterns-reference-ipc-contract-audits.md](architecture-implementation-patterns-reference-ipc-contract-audits.md)

## IPCチャネル命名監査の運用パターン（UT-IPC-CHANNEL-NAMING-AUDIT-001 2026-02-25実施）

### 問題

チャネル命名規則を策定しても、横断監査を定期実行しないと「対象内完了」と「対象外ノイズ（例: AUTH重複式）」が混在し、完了判定と未タスク化の境界が曖昧になる。

### 解決パターン

#### 1. 監査結果を 3 区分で分類する

| 区分         | 判定                   | 対応               |
| ------------ | ---------------------- | ------------------ |
| 対象内・重大 | 仕様/実装ブロッカー    | 現タスクで即時是正 |
| 対象内・軽微 | 命名揺れ/記述不足      | リネーム計画に登録 |
| 対象外・軽微 | 別ドメイン由来のノイズ | 未タスクへ分離登録 |

#### 2. 台帳更新を同一ターンで実施する

1. `task-workflow.md` の対象行を完了化（`spec_created` を含む）
2. 新規未タスクがある場合は `unassigned-task/` に指示書を作成
3. `verify-unassigned-links.js` 実行でリンク切れを機械検証

#### 3. 重複式ノイズの再発防止コマンドを固定化する

```bash
# AUTH系 handle 登録の重複式確認
rg -n "ipcMain\\.handle\\(IPC_CHANNELS\\.AUTH_" apps/desktop/src/main/ipc

# チャネル命名監査の対象/対象外を分離確認
jq '.duplicateHandlers | length' /tmp/ut-ipc-usage-analysis.json
jq '[.duplicateHandlers[] | select(.expr | test("SKILL"))] | length' /tmp/ut-ipc-usage-analysis.json
```

### 適用指針

- 仕様書修正のみタスクでも、`Step 1-A/1-C/1-D`（完了記録・関連台帳・索引再生成）を省略しない。
- 「対象外の検出」を理由に完了判定を遅延させず、未タスク分離で追跡性を維持する。
- 未タスク化した項目は、元タスクの Phase 12 レポートと `task-workflow.md` の双方から辿れる状態にする。

---

## 未タスク監査スコープ分離パターン（UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001）

### 問題

未タスク監査を全体実行のみで運用すると、既存違反（baseline）が今回変更（current）の合否判定を覆い隠し、Phase 12 の完了判定が不安定になる。

### 解決パターン

#### 1. 判定軸を current / baseline に分離する

| 監査モード | コマンド                                                | 用途                       | fail条件                      |
| ---------- | ------------------------------------------------------- | -------------------------- | ----------------------------- |
| 対象監査   | `audit-unassigned-tasks.js --json --target-file <path>` | 今回変更の合否判定         | `currentViolations.total > 0` |
| 差分監査   | `audit-unassigned-tasks.js --json --diff-from <ref>`    | 複数変更ファイルの合否判定 | `currentViolations.total > 0` |
| 全体監査   | `audit-unassigned-tasks.js --json`                      | 既存資産健全性の監視       | 全体違反 > 0                  |

#### 2. Phase 12 の記録を2段構成で固定する

1. `unassigned-task-detection.md` に current/baseline を分離記録する
2. baseline違反は未タスク化の候補として管理し、今回タスクの完了判定とは分離する

#### 3. 完了済み未タスク指示書の移管を同一ターンで実施する

1. `unassigned-task/` → `completed-tasks/unassigned-task/` へ物理移動
2. `task-workflow.md` の参照パスを同期更新
3. `verify-unassigned-links.js` で参照整合を確認

#### 4. Phase 12 準拠確認チェーン（skill-creator連携）を固定する

```bash
# 1) 仕様準拠
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/<workflow> --strict
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/<workflow>

# 2) 未タスク参照整合
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md

# 3) スキル構造検証（system skill-creator）
node /Users/dm/dev/dev/ObsidianMemo/.claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
node /Users/dm/dev/dev/ObsidianMemo/.claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
```

### 適用指針

- full監査結果をそのまま「今回差分fail」と解釈しない。
- 完了判定は current、負債管理は baseline に責務分離する。
- 台帳更新と物理移管を同一ターンで処理し、運用ドリフトを防止する。

---

## 共有型インポート標準パターン（TASK-10A-D）

### 問題

Electron 3プロセスモデル（Main/Preload/Renderer）で型定義が各層に分散すると、型不整合の発見が遅延する。特に Renderer 側で `unknown[]` プレースホルダ型を使用した場合、コンパイルは通るが実行時に型不一致が顕在化する（P23/P24/P32 の繰り返しパターン）。

### 解決パターン

#### 1. 型定義の配置ルール

| 型の種類           | 配置先                                           | 例                                            |
| ------------------ | ------------------------------------------------ | --------------------------------------------- |
| ドメインモデル型   | `@repo/shared` (`packages/shared/src/`)          | `Skill`, `SkillLifecycleState`, `Suggestion`  |
| Store Slice 状態型 | `@repo/shared` からimport + Slice固有の拡張      | `AgentSliceState extends { skills: Skill[] }` |
| Preload API 型     | `apps/desktop/src/preload/types.ts`              | `ElectronSkillAPI`, `SkillBridgeAPI`          |
| IPC ハンドラ引数型 | Main Process 内で定義、`@repo/shared` の型を参照 | `handler(event, skillName: string)`           |

#### 2. 新規型追加時のチェックリスト

1. `@repo/shared` に型定義を追加
2. `pnpm --filter @repo/shared build` で共有パッケージをビルド
3. Preload `types.ts` の API 型定義を更新
4. Store Slice の型を `@repo/shared` からの import に変更
5. `pnpm typecheck` で全パッケージの型整合性を検証

#### 3. 禁止パターン

| 禁止パターン                        | 理由                                       | 正しいパターン                     |
| ----------------------------------- | ------------------------------------------ | ---------------------------------- |
| `unknown[]` プレースホルダ型        | 型安全性が失われ、実行時エラーの発見が遅延 | `@repo/shared` から具体型をimport  |
| Slice 内での独自型定義              | Store と Preload で型が乖離する            | `@repo/shared` の型をre-export     |
| `as unknown as TargetType` キャスト | 型不整合を隠蔽する                         | 共有型を統一してキャスト不要にする |

### 適用指針

- 新規 IPC チャネル追加時は P23/P32 準拠で `@repo/shared` → Preload → Store の順に型を定義する
- 既存の `unknown[]` 型は発見次第、具体型への置換を未タスク化する
- `pnpm typecheck` は型変更後に必ず全パッケージ（`--filter @repo/shared && --filter @repo/desktop`）で実行する

---

## IPC レスポンス Wrapper パターン（UT-06-003 2026-03-17実装）

### S35: IPC ハンドラレスポンスの統一 Wrapper 形式

> **発見タスク**: UT-06-003
> **関連Pitfall**: P60（IPC テスト応答形式の不一致）

#### 問題

IPC ハンドラのレスポンス形式が統一されていないと、テスト設計（Phase 4）と実装（Phase 5）の間でアサーション形式が乖離する。フラットな `{ code, message }` 形式を期待するテストに対して、実装が `{ success, error: { code, message } }` の wrapper 形式を返すと、全テストの修正が必要になる。

#### 解決策

IPC ハンドラのレスポンスは以下の統一 wrapper 形式を使用する。

```typescript
// 成功レスポンス
interface IPCSuccessResponse<T> {
  success: true;
  data: T;
}

// エラーレスポンス
interface IPCErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

type IPCResponse<T> = IPCSuccessResponse<T> | IPCErrorResponse;
```

#### テスト設計時の必須確認事項

| チェック項目 | 確認方法 |
| --- | --- |
| 既存ハンドラのレスポンス形式 | `grep -rn "success:" apps/desktop/src/main/handlers/` |
| wrapper 形式の統一性 | Phase 2 設計書にレスポンス型を明記 |
| テストアサーション | `result.error.code` 形式で記述 |

#### コード例

```typescript
// IPC ハンドラ実装
ipcMain.handle("safety-gate:validate", async (_event, args) => {
  try {
    const result = await safetyGate.validateToolExecution(args);
    return { success: true, data: result };
  } catch (error: unknown) {
    // P49 準拠: in 演算子パターンでエラーを検証
    if (
      error != null &&
      typeof error === "object" &&
      "code" in error &&
      typeof error.code === "string"
    ) {
      return { success: false, error: { code: error.code, message: String(error.message ?? "") } };
    }
    return { success: false, error: { code: "INTERNAL_ERROR", message: "Unknown error" } };
  }
});

// テストアサーション（wrapper 形式に合わせる）
expect(result).toEqual({
  success: false,
  error: { code: "VALIDATION_ERROR", message: expect.any(String) },
});
```

#### 適用基準

| 条件 | 適用 |
| --- | --- |
| 新規 IPC ハンドラ | 必須（wrapper 形式を使用） |
| 既存 IPC ハンドラ | 変更時に wrapper 形式へ統一を推奨 |
| Phase 4 テスト設計 | Phase 2 のレスポンス型定義を参照して記述 |

---

## Dynamic Import 型伝播パターン（UT-SC-05-APPLY-IMPROVEMENT-UI 2026-03-24実装）

### S36: Preload types.ts の `import()` 型伝播パターン

> **発見タスク**: UT-SC-05-APPLY-IMPROVEMENT-UI
> **関連Pitfall**: P67（React Props Silent Drop）

#### 問題

Preload API に新メソッドを追加する際、`preload/types.ts` の型定義と `preload/skill-creator-api.ts` の実装の両方を手動で同期する必要がある。型定義の二重管理（P23/P32 パターン）が発生し、メソッド追加時に片方の更新漏れが起きやすい。

#### 解決策

`preload/types.ts` で `import()` 型を使用して実装ファイルから型を自動伝播させる。

```typescript
// preload/types.ts
export interface ElectronAPI {
  skillCreator: import("./skill-creator-api").SkillCreatorAPI;
  // ↑ skill-creator-api.ts の export type が自動伝播
}
```

この方式により、`skill-creator-api.ts` に新メソッド（`applyRuntimeImprovement` 等）を追加すると、`types.ts` の `ElectronAPI` 型に自動的に反映される。`types.ts` 側で個別メソッドを列挙する必要がない。

#### メリットと注意点

| 項目 | 内容 |
| --- | --- |
| メリット | メソッド追加時の型更新が1箇所で完結 |
| メリット | P23/P32 の二重管理リスクを構造的に排除 |
| 注意点 | `import()` 先のファイルが存在しないとコンパイルエラー |
| 注意点 | 循環参照に注意（types.ts → api.ts → types.ts は禁止） |

#### 適用基準

| 条件 | 適用 |
| --- | --- |
| Preload API の型定義 | 推奨（`import()` 型伝播を使用） |
| 共有型（packages/shared） | 非推奨（明示的な export/import を使用） |
| IPC ハンドラの型定義 | 非推奨（Main Process 側は明示的に定義） |

---

## S-IPC-AUTO: IPC契約ドリフト自動検出パターン（UT-TASK06-007）

> 詳細は [architecture-implementation-patterns-reference-ipc-drift-detection.md](architecture-implementation-patterns-reference-ipc-drift-detection.md) を参照

---

