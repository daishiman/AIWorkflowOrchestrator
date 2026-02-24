# skillHandlers IPCバリデーションエラー応答パターン統一 - タスク指示書

## メタ情報

```yaml
issue_number: 843
```

## メタ情報

| 項目         | 内容                                                   |
| ------------ | ------------------------------------------------------ |
| タスクID     | UT-FIX-SKILL-IPC-ERROR-RESPONSE-001                    |
| タスク名     | skillHandlers IPCバリデーションエラー応答パターン統一  |
| 分類         | リファクタリング                                       |
| 対象機能     | スキル管理IPCハンドラ                                  |
| 優先度       | 中                                                     |
| 見積もり規模 | 中規模                                                 |
| ステータス   | 未実施                                                 |
| 発見元       | UT-FIX-SKILL-REMOVE-INTERFACE-001 実装時（2026-02-20） |
| 発見日       | 2026-02-20                                             |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`apps/desktop/src/main/ipc/skillHandlers.ts` には13個のIPCハンドラが登録されている。これらのハンドラにおけるバリデーションエラー応答（引数不正時のRenderer側への応答方法）が、開発経緯の異なるタスクで個別に実装されたため、3種類のパターンが混在している。

UT-FIX-SKILL-REMOVE-INTERFACE-001（2026-02-20）の実装時にこの不統一が顕在化した。skill:remove をthrowパターンに修正した際、他のハンドラ（skill:get-detail, skill:execute 等）がreturnパターンのままであることが確認された。

**2026-02-24 現状更新**: UT-FIX-SKILL-VALIDATION-CONSISTENCY-001（2026-02-24完了）により、以下の6ハンドラがthrowパターンに統一済みである:

- skill:get-detail, skill:execute, skill:abort, skill:get-status, skill:analyze, skill:improve

これにより、パターンA（throw）のハンドラ数が増加し、パターンB/Cの未統一ハンドラ数は減少している。skill:import, skill:remove も既にthrowパターンに統一済みのため、残りの対象はパターンB（return { success: false }）を使用する skill:list, skill:scan, skill:getImported, skill:optimize, skill:optimize:variants, skill:optimize:evaluate の6ハンドラとなる。

### 1.2 問題点・課題

#### 3つのエラー応答パターンの混在

| パターン                     | 名称               | 使用ハンドラ                                                                                                                                                                                                                                                                           | コード例                                             | IPC伝播経路                      |
| ---------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------- |
| A: throw                     | 例外スロー         | `skill:import`（L130-134）, `skill:remove`（L151-155）                                                                                                                                                                                                                                 | `throw { code: "VALIDATION_ERROR", message: "..." }` | `ipcMain.handle` の reject 経由  |
| B: return { success: false } | 失敗レスポンス返却 | `skill:list`（L65-69）, `skill:scan`（L86-90）, `skill:getImported`（L111-115）, `skill:get-detail`（L174）, `skill:execute`（L206）, `skill:analyze`（L289）, `skill:improve`（L319）, `skill:optimize`（L352）, `skill:optimize:variants`（L384）, `skill:optimize:evaluate`（L419） | `return { success: false, error: "..." }`            | `ipcMain.handle` の resolve 経由 |
| C: return primitive          | プリミティブ値返却 | `skill:abort`（L234-235）, `skill:get-status`（L258-259）                                                                                                                                                                                                                              | `return false` / `return null`                       | `ipcMain.handle` の resolve 経由 |

#### パターン間の動作差異

| 観点                        | パターンA (throw)                                                                 | パターンB (return { success: false })                                                       | パターンC (return primitive)                    |
| --------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Renderer側の受信方法        | `catch` ブロックで捕捉                                                            | `.then()` で受信し `result.success` を確認                                                  | `.then()` で受信し値を直接確認                  |
| safeInvokeUnwrap互換        | ❌ throwは `safeInvoke` の reject として伝播するため、`IpcResult<T>` 形式ではない | ✅ `{ success: false, error }` が `IpcResult<T>` に合致し、`safeInvokeUnwrap` がErrorに変換 | ❌ プリミティブ値は `IpcResult<T>` 形式ではない |
| エラー情報の詳細度          | `code` + `message` の構造化情報                                                   | `error` 文字列のみ                                                                          | エラー情報なし（`false` / `null` のみ）         |
| Preload側の現在の呼び出し方 | `safeInvoke`（throwがrejectに変換される）                                         | `safeInvokeUnwrap`（成功時にdata展開、失敗時にErrorスロー）または `safeInvoke`              | `safeInvoke`（プリミティブ値がそのまま返る）    |

#### 具体的な問題

1. **Renderer側のエラーハンドリングが3パターンに分岐する**: 呼び出し元で `try/catch` と `result.success` チェックと プリミティブ値チェックを使い分ける必要があり、開発者の認知負荷が高い
2. **safeInvokeUnwrapとの整合性**: UT-FIX-IPC-RESPONSE-UNWRAP-001 で導入された `safeInvokeUnwrap` パターンは `{ success: boolean, data?: T, error?: string }` 形式（パターンB）を前提としている。パターンA/Cのハンドラはこの関数と互換性がない
3. **新規ハンドラ実装時の判断コスト**: どのパターンを採用すべきか明確な基準がなく、開発者ごとに異なるパターンを選択するリスクがある
4. **エラー情報の粒度差**: パターンAは `code` と `message` を持つ構造化エラー、パターンBは `error` 文字列のみ、パターンCはエラー情報なし。Renderer側で統一的なエラー表示ができない

### 1.3 放置した場合の影響

1. **新規ハンドラ追加時にパターン混在がさらに拡大する**: 既存コードを参考にする際、コピー元のパターンがそのまま増殖する
2. **safeInvokeUnwrap への移行が困難になる**: パターンA/Cのハンドラが増えるほど、将来的な統一コストが増大する
3. **Renderer側のエラーハンドリング品質が低下する**: パターンCのハンドラは `false` / `null` を返すだけでエラー理由を伝えないため、ユーザーへのエラーメッセージ表示ができない
4. **IPC契約チェックリスト（ipc-contract-checklist.md）の適用が不完全になる**: エラー応答形式がチェック対象に含まれないため、品質ゲートが機能しない

---

## 2. 何を達成するか（What）

### 2.1 目的

skillHandlers.ts 内の全13ハンドラのバリデーションエラー応答を単一パターンに統一し、safeInvokeUnwrap パターンとの完全な互換性を確保する。

### 2.2 最終ゴール

1. 全ハンドラのバリデーションエラーが `{ success: false, error: string }` 形式で返却される（パターンBに統一）
2. 全ハンドラの成功レスポンスが `{ success: true, data: T }` 形式で返却される
3. Preload 側の全メソッドが `safeInvokeUnwrap` を使用する（現在 `safeInvoke` のメソッドを移行）
4. ipc-contract-checklist.md にエラー応答形式のチェック項目を追加する
5. 全テストが統一パターンに対応して PASS する

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/main/ipc/skillHandlers.ts` の全13ハンドラのエラー応答パターン統一
- `apps/desktop/src/preload/skill-api.ts` の `safeInvoke` → `safeInvokeUnwrap` 移行（対象メソッド: `execute`, `abort`, `getExecutionStatus`, `import`, `remove`）
- `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts` のテスト修正
- `apps/desktop/src/preload/__tests__/skill-api.unwrap.test.ts` のテスト追加
- `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` のチェック項目追加

#### 含まないもの

- `skillFileHandlers.ts`（TASK-9A-B で実装済み、既にパターンBで統一されている）
- Renderer 側コンポーネントのエラーハンドリング変更（Preload層で吸収されるため不要）
- `IpcResult<T>` 型の `@repo/shared` への移動（別タスクで検討）
- エラーコード体系の設計（02-code-quality.md のエラーカテゴリ参照、別タスクで包括的に対応）

### 2.4 成果物

| 成果物               | パス                                                                          |
| -------------------- | ----------------------------------------------------------------------------- |
| 修正済みハンドラ     | `apps/desktop/src/main/ipc/skillHandlers.ts`                                  |
| 修正済みPreload API  | `apps/desktop/src/preload/skill-api.ts`                                       |
| ハンドラテスト       | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`                   |
| Preload unwrapテスト | `apps/desktop/src/preload/__tests__/skill-api.unwrap.test.ts`                 |
| チェックリスト更新   | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-FIX-SKILL-REMOVE-INTERFACE-001 が完了済みであること（skill:remove がthrowパターンに修正済み）
- UT-FIX-SKILL-IMPORT-INTERFACE-001 が完了済みであること（skill:import の引数修正済み）
- UT-FIX-IPC-RESPONSE-UNWRAP-001 が完了済みであること（safeInvokeUnwrap パターンが導入済み）

### 3.2 依存タスク

| タスクID                          | 関係             | 説明                                                                  |
| --------------------------------- | ---------------- | --------------------------------------------------------------------- |
| UT-FIX-IPC-RESPONSE-UNWRAP-001    | 先行（完了済み） | safeInvokeUnwrap パターンの導入元                                     |
| UT-FIX-IPC-RESPONSE-UNWRAP-002    | 関連             | Phase 10仕様書整合（本タスクの変更に影響する可能性がある）            |
| UT-FIX-IPC-RESPONSE-UNWRAP-003    | 関連             | safeInvokeUnwrap 型ガード強化（本タスクの統一後に適用する方が効果的） |
| UT-FIX-SKILL-IMPORT-INTERFACE-001 | 先行（完了済み） | skill:import のインターフェース修正                                   |
| UT-FIX-SKILL-REMOVE-INTERFACE-001 | 先行（完了済み） | skill:remove のインターフェース修正                                   |

### 3.3 必要な知識

- Electron IPC (`ipcMain.handle` / `ipcRenderer.invoke`) のエラー伝播メカニズム
- `safeInvoke` / `safeInvokeUnwrap` パターンの動作（`skill-api.ts` L169-197）
- `IpcResult<T>` 型の構造（`skill-api.ts` L160-164）
- P42準拠の3段バリデーションパターン
- P23/P44 のIPC契約ドリフト防止策

### 3.4 推奨アプローチ

#### 統一先パターン: パターンB（`{ success: false, error: string }` 返却）

**選定理由**:

| 観点                   | パターンA (throw)                       | パターンB (return)      | パターンC (primitive)     |
| ---------------------- | --------------------------------------- | ----------------------- | ------------------------- |
| safeInvokeUnwrap互換   | ❌ reject経由のため非互換               | ✅ 完全互換             | ❌ IpcResult形式ではない  |
| エラー情報の詳細度     | ⚠️ 構造化だがsafeInvokeUnwrapで失われる | ✅ error文字列で十分    | ❌ エラー情報なし         |
| 既存採用数             | 2ハンドラ                               | 10ハンドラ              | 2ハンドラ                 |
| Preload側変更量        | 全メソッド修正                          | 最小限                  | 全メソッド修正            |
| 新規ハンドラとの一貫性 | skillFileHandlersと不一致               | skillFileHandlersと一致 | skillFileHandlersと不一致 |

パターンBは既に10/13ハンドラで採用されており、`safeInvokeUnwrap` との互換性があり、`skillFileHandlers.ts`（TASK-9A-B）とも一致する。修正量が最小で、破壊的変更のリスクが最も低い。

#### 修正内容の具体例

##### Before（パターンA: throw） → After（パターンB: return）

```typescript
// ❌ Before: skill:import（パターンA - throw）
ipcMain.handle(IPC_CHANNELS.SKILL_IMPORT, async (event, args) => {
  // ... validateIpcSender ...
  if (!Array.isArray(args?.skillIds)) {
    throw { code: "VALIDATION_ERROR", message: "skillIds must be an array" };
  }
  return skillService.importSkills(args.skillIds);
});

// ✅ After: skill:import（パターンB - return { success: false }）
ipcMain.handle(IPC_CHANNELS.SKILL_IMPORT, async (event, skillName: string) => {
  // ... validateIpcSender ...
  if (typeof skillName !== "string" || skillName.trim() === "") {
    return { success: false, error: "skillName must be a non-empty string" };
  }
  try {
    const result = await skillService.importSkills([skillName]);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "スキルインポートに失敗しました",
    };
  }
});
```

##### Before（パターンC: return primitive） → After（パターンB: return { success: false }）

```typescript
// ❌ Before: skill:abort（パターンC - return false）
ipcMain.handle(IPC_CHANNELS.SKILL_ABORT, async (event, executionId: string) => {
  // ... validateIpcSender ...
  if (typeof executionId !== "string" || executionId === "") {
    return false;
  }
  if (!_skillExecutorInstance) {
    return false;
  }
  return _skillExecutorInstance.abort(executionId);
});

// ✅ After: skill:abort（パターンB - return { success: false }）
ipcMain.handle(IPC_CHANNELS.SKILL_ABORT, async (event, executionId: string) => {
  // ... validateIpcSender ...
  if (typeof executionId !== "string" || executionId.trim() === "") {
    return { success: false, error: "executionId must be a non-empty string" };
  }
  if (!_skillExecutorInstance) {
    return { success: false, error: "SkillExecutor is not initialized" };
  }
  try {
    const result = await _skillExecutorInstance.abort(executionId);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "スキル中断に失敗しました",
    };
  }
});
```

##### Preload側の修正

```typescript
// ❌ Before: safeInvoke（ラッパー展開なし）
import: (skillName: string): Promise<ImportedSkill> =>
  safeInvoke(IPC_CHANNELS.SKILL_IMPORT, skillName),

remove: (skillName: string): Promise<void> =>
  safeInvoke(IPC_CHANNELS.SKILL_REMOVE, skillName),

abort: (executionId: string): Promise<void> =>
  safeInvoke(IPC_CHANNELS.SKILL_ABORT, executionId),

getExecutionStatus: (executionId: string): Promise<ExecutionInfo | null> =>
  safeInvoke(IPC_CHANNELS.SKILL_GET_STATUS, executionId),

// ✅ After: safeInvokeUnwrap（統一パターン）
import: (skillName: string): Promise<ImportedSkill> =>
  safeInvokeUnwrap<ImportedSkill>(IPC_CHANNELS.SKILL_IMPORT, skillName),

remove: (skillName: string): Promise<void> =>
  safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_REMOVE, skillName),

abort: (executionId: string): Promise<void> =>
  safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_ABORT, executionId),

getExecutionStatus: (executionId: string): Promise<ExecutionInfo | null> =>
  safeInvokeUnwrap<ExecutionInfo | null>(IPC_CHANNELS.SKILL_GET_STATUS, executionId),
```

### 3.5 実装課題と解決策（親タスクからの教訓）

#### 課題1: P23パターン — API二重定義の型管理複雑性

| 項目             | 内容                                                                                                                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 発生状況         | Main Process のハンドラと Preload API 間でインターフェース契約が乖離していた。TypeScript コンパイラは Preload のモック化（`contextBridge.exposeInMainWorld`）により不整合を検出できず、ランタイムで初めて顕在化した |
| 本タスクでの対策 | ハンドラの応答形式変更と Preload 側の `safeInvoke` → `safeInvokeUnwrap` 移行を同一コミットで実施する。変更後に `pnpm typecheck` で型整合性を検証する                                                                |
| チェック方法     | ipc-contract-checklist.md Phase 2 に従い、Main/Preload/テストの3箇所同時更新を実施                                                                                                                                  |

#### 課題2: P44パターン — IPC契約ドリフト

| 項目             | 内容                                                                                                                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 発生状況         | ハンドラがオブジェクト形式（`{ skillIds: string[] }` / `{ skillId: string }`）を期待しているのに、Preload 側が単一文字列を渡していたため、`args?.skillIds` / `args?.skillId` が `undefined` になった                |
| 本タスクでの対策 | 統一パターン適用時に、各ハンドラの引数受け取り方を Preload 側の呼び出しと照合する。`skill:import` の `args: { skillIds: string[] }` は UT-FIX-SKILL-IMPORT-INTERFACE-001 で修正済みだが、変更漏れがないか再確認する |
| チェック方法     | 全13ハンドラについて Preload 側の `safeInvoke` / `safeInvokeUnwrap` 引数と Main 側の受け取り型を1対1で照合する                                                                                                      |

#### 課題3: P45パターン — 引数命名の契約ドリフト

| 項目             | 内容                                                                                                                                                                                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 発生状況         | `skillId` vs `skillName` の命名不統一が複数ファイルに分散しており、`grep -rn "skillId" apps/desktop/src/main/` で全箇所を特定するのに苦労した                                                                                                                                   |
| 本タスクでの対策 | 統一パターン適用時に引数名を値のセマンティクスに合わせる。スキル名を示す引数は `skillName`、実行IDを示す引数は `executionId` と命名する。`skill:get-detail` と `skill:execute` で使用されている `args.skillId` の実態がスキル名なのかIDなのかを確認し、必要に応じてリネームする |
| チェック方法     | 修正後に `grep -rn "skillId" apps/desktop/src/main/ipc/skillHandlers.ts` で残存する命名不統一がないことを確認                                                                                                                                                                   |

#### 課題4: safeInvokeUnwrapとの整合性

| 項目             | 内容                                                                                                                                                                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 発生状況         | UT-FIX-IPC-RESPONSE-UNWRAP-001 で `safeInvokeUnwrap` が導入されたが、`skill:import`/`skill:remove`/`skill:abort`/`skill:get-status` はまだ `safeInvoke` を使用している。これらのハンドラの応答形式がパターンA/Cのため、`safeInvokeUnwrap` に移行できなかった        |
| 本タスクでの対策 | ハンドラ側をパターンBに統一した後、Preload 側を `safeInvokeUnwrap` に移行する。順序が逆になるとランタイムエラーが発生するため、必ず **ハンドラ修正 → Preload修正** の順序で実施する                                                                                 |
| チェック方法     | 統一後に `grep -n "safeInvoke(" apps/desktop/src/preload/skill-api.ts` で `safeInvokeUnwrap` ではなく `safeInvoke` を使用している箇所が、`onStream`/`onPermissionRequest`/`sendPermissionResponse`/`onComplete`/`onError`（イベントリスナー系）のみであることを確認 |

### 3.6 実装課題と解決策（UT-FIX-SKILL-VALIDATION-CONSISTENCY-001からの教訓）

UT-FIX-SKILL-VALIDATION-CONSISTENCY-001（2026-02-24完了）で6ハンドラをthrowパターンに統一した際の知見:

| #   | 苦戦箇所                                                                                                                                               | 解決策                                                                                                                 | 本タスクへの適用                                                                                                                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **4種類のreturnパターン混在**: `return { code }`, `return false`, `return null`, `return { success: false }` が混在しており、一括置換が困難            | 各ハンドラを個別に`grep -n "return.*VALIDATION\|return false\|return null\|return.*success.*false"` で分類してから修正 | 本タスクでも同様のパターン分類アプローチが有効。残ハンドラ（skill:list, skill:scan, skill:getImported等）のreturnパターンを先に分類 |
| 2   | **safeInvoke後方互換性**: Main Processのthrowは`ipcRenderer.invoke()`によりPromise rejectionに変換され、safeInvokeが自動キャッチ。Renderer側の変更不要 | Preload層の`safeInvoke`/`safeInvokeUnwrap`それぞれの例外処理パスを確認した                                             | 本タスクではsafeInvokeUnwrapを使用するハンドラも対象。safeInvokeUnwrapのthrow処理パスも事前確認必須                                 |
| 3   | **テストアサーション一括修正**: return→throwにより、テストの期待値が`toBe(false)`/`toBeNull()`から`rejects.toMatchObject`に変更                        | `describe.each`マトリクステストで全ハンドラ×入力パターンを自動生成                                                     | 残ハンドラのテストも同様にマトリクスアプローチで効率化                                                                              |

#### 現在の実装状況（2026-02-24時点）

| パターン                            | 対象ハンドラ                                                                                                             | ステータス        |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| throw統一済み                       | skill:get-detail, skill:execute, skill:abort, skill:get-status, skill:analyze, skill:improve, skill:import, skill:remove | ✅ P42準拠完了    |
| 未統一（return { success: false }） | skill:list, skill:scan, skill:getImported, skill:optimize, skill:optimize:variants, skill:optimize:evaluate              | ⬜ 本タスクで対応 |

#### 参照ドキュメント

- [architecture-implementation-patterns.md S18](../../.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md) — P42準拠バリデーション一括移行パターン（移行チェックリスト・後方互換性テーブル含む）
- [lessons-learned.md](../../.claude/skills/aiworkflow-requirements/references/lessons-learned.md) — UT-FIX-SKILL-VALIDATION-CONSISTENCY-001 苦戦箇所4-6
- [skill-creator/patterns.md](../../.claude/skills/skill-creator/references/patterns.md) — P42バリデーション一括移行パターン（成功パターン）

---

## 4. 実行手順

### Phase構成

| Phase | 名称             | 目的                                       |
| ----- | ---------------- | ------------------------------------------ |
| 1     | 要件定義         | 統一対象ハンドラの確定と変更影響範囲の特定 |
| 2     | 設計             | 統一パターンの詳細設計と移行順序の決定     |
| 3     | 設計レビュー     | 設計の妥当性検証                           |
| 4     | テスト作成       | 統一パターンのテストケース設計・作成       |
| 5     | 実装             | ハンドラとPreload APIの修正                |
| 6     | テスト拡充       | カバレッジ不足箇所のテスト追加             |
| 7     | カバレッジ確認   | カバレッジ基準の充足確認                   |
| 8     | リファクタリング | コード品質改善                             |
| 9     | 品質検証         | Lint・型チェック・全テスト実行             |
| 10    | 最終レビュー     | 多角的品質・整合性検証                     |
| 11    | 手動テスト       | UI操作でのエラーハンドリング動作確認       |
| 12    | ドキュメント     | 実装ガイド・仕様書更新                     |
| 13    | 完了             | PR準備                                     |

### 各Phase詳細

#### Phase 4: テスト作成

以下のテストケースを作成する:

**ハンドラテスト（skillHandlers.test.ts）**:

| #   | テスト対象       | テストケース                         | 期待結果                                                                                   |
| --- | ---------------- | ------------------------------------ | ------------------------------------------------------------------------------------------ |
| 1   | skill:import     | バリデーションエラー（非文字列引数） | `{ success: false, error: "..." }` を返す（throwしない）                                   |
| 2   | skill:import     | バリデーションエラー（空文字列）     | `{ success: false, error: "..." }` を返す                                                  |
| 3   | skill:import     | バリデーションエラー（スペースのみ） | `{ success: false, error: "..." }` を返す                                                  |
| 4   | skill:import     | 成功ケース                           | `{ success: true, data: ... }` を返す                                                      |
| 5   | skill:remove     | バリデーションエラー                 | `{ success: false, error: "..." }` を返す（throwしない）                                   |
| 6   | skill:abort      | バリデーションエラー（空文字列）     | `{ success: false, error: "..." }` を返す（`false` ではなく）                              |
| 7   | skill:abort      | SkillExecutor未初期化                | `{ success: false, error: "..." }` を返す                                                  |
| 8   | skill:abort      | 成功ケース                           | `{ success: true, data: ... }` を返す                                                      |
| 9   | skill:get-status | バリデーションエラー                 | `{ success: false, error: "..." }` を返す（`null` ではなく）                               |
| 10  | skill:get-status | SkillExecutor未初期化                | `{ success: false, error: "..." }` を返す                                                  |
| 11  | skill:get-status | 成功ケース                           | `{ success: true, data: ... }` を返す                                                      |
| 12  | 全ハンドラ       | validateIpcSender失敗                | `throw toIPCValidationError(validation)` を維持（セキュリティバリデーションはthrowのまま） |

**Preload unwrapテスト（skill-api.unwrap.test.ts への追加）**:

| #   | テスト対象               | テストケース       | 期待結果                   |
| --- | ------------------------ | ------------------ | -------------------------- | ------------ |
| 1   | skill.import             | 成功レスポンス展開 | `ImportedSkill` を直接返す |
| 2   | skill.import             | 失敗レスポンス     | `Error` をスロー           |
| 3   | skill.remove             | 成功レスポンス展開 | `void` を返す              |
| 4   | skill.remove             | 失敗レスポンス     | `Error` をスロー           |
| 5   | skill.abort              | 成功レスポンス展開 | `void` を返す              |
| 6   | skill.abort              | 失敗レスポンス     | `Error` をスロー           |
| 7   | skill.getExecutionStatus | 成功レスポンス展開 | `ExecutionInfo             | null` を返す |
| 8   | skill.getExecutionStatus | 失敗レスポンス     | `Error` をスロー           |

#### Phase 5: 実装

以下の順序で修正する（ハンドラ修正 → Preload修正の順序を厳守）:

**Step 1**: `skillHandlers.ts` のパターンA/Cハンドラを修正

1. `skill:import`: throw → return { success: false } + try/catch + return { success: true, data }
2. `skill:remove`: throw → return { success: false } + try/catch + return { success: true, data }
3. `skill:abort`: return false → return { success: false, error } + try/catch + return { success: true, data }
4. `skill:get-status`: return null → return { success: false, error } + try/catch + return { success: true, data }

**Step 2**: `skill-api.ts` の対象メソッドを `safeInvokeUnwrap` に移行

1. `import`: `safeInvoke` → `safeInvokeUnwrap<ImportedSkill>`
2. `remove`: `safeInvoke` → `safeInvokeUnwrap<void>`
3. `abort`: `safeInvoke` → `safeInvokeUnwrap<void>`
4. `getExecutionStatus`: `safeInvoke` → `safeInvokeUnwrap<ExecutionInfo | null>`
5. `execute`: `safeInvoke` → `safeInvokeUnwrap<SkillExecutionResponse>`（既にパターンBだがsafeInvoke使用中）

**Step 3**: テスト修正

1. 既存テストの `throw` 期待を `return { success: false }` 期待に変更
2. 既存テストの `return false` / `return null` 期待を `return { success: false }` 期待に変更

**注意**: `validateIpcSender` の失敗時は `throw toIPCValidationError(validation)` のまま維持する。セキュリティバリデーションはreject経路で伝播させ、アプリケーションバリデーションのみを `return { success: false }` に統一する。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 全13ハンドラのバリデーションエラーが `{ success: false, error: string }` 形式で返却される
- [ ] 全13ハンドラの成功レスポンスが `{ success: true, data: T }` 形式で返却される
- [ ] `validateIpcSender` 失敗時のみ `throw toIPCValidationError()` を維持する
- [ ] Preload側の `import`/`remove`/`abort`/`getExecutionStatus`/`execute` が `safeInvokeUnwrap` を使用する
- [ ] Preload側の `onStream`/`onPermissionRequest`/`sendPermissionResponse`/`onComplete`/`onError`（イベント系）は `safeOn`/`safeInvoke` のまま維持する
- [ ] P42準拠の3段バリデーション（typeof → 空文字列 → trim空文字列）が全文字列引数に適用されている

### 品質要件

- [ ] `pnpm typecheck` が全パッケージでエラーなし
- [ ] `pnpm lint` がエラーなし
- [ ] 全テストが PASS（新規 + 既存回帰）
- [ ] Line Coverage 80%以上、Branch Coverage 60%以上、Function Coverage 80%以上

### ドキュメント要件

- [ ] ipc-contract-checklist.md にエラー応答形式のチェック項目を追加
- [ ] Phase 12 の全チェックリストを完了

---

## 6. 検証方法

### テストケース

Phase 4 のテストケース表を参照。

### 検証手順

1. **ユニットテスト実行**: `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts`
2. **Preload unwrapテスト実行**: `cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api.unwrap.test.ts`
3. **型チェック**: `pnpm typecheck`
4. **Lint**: `pnpm lint`
5. **全テスト実行**: `cd apps/desktop && pnpm vitest run`
6. **パターン残存チェック**:
   - `grep -n "throw {" apps/desktop/src/main/ipc/skillHandlers.ts` → `validateIpcSender` 関連のみ（アプリケーションバリデーションのthrowが0件）
   - `grep -n "return false" apps/desktop/src/main/ipc/skillHandlers.ts` → 0件
   - `grep -n "return null" apps/desktop/src/main/ipc/skillHandlers.ts` → 0件
7. **safeInvoke使用チェック**: `grep -n "safeInvoke(" apps/desktop/src/preload/skill-api.ts` → `safeOn`系のみ（`safeInvokeUnwrap` でない `safeInvoke` が invoke系メソッドに残存していないこと）

---

## 7. リスクと対策

| リスク                                 | 影響度 | 発生可能性 | 対策                                                                                                                                                                                                                                           |
| -------------------------------------- | ------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Renderer側のエラーハンドリングが壊れる | 中     | 低         | `safeInvokeUnwrap` がPreload層でエラーを `Error` オブジェクトに変換するため、Renderer側の `try/catch` パターンは変更不要。ただし `skill:abort` と `skill:get-status` の呼び出し元が `false`/`null` 直接チェックしている場合は修正が必要        |
| skill:abort の戻り値型変更による影響   | 中     | 中         | `SkillAPI.abort` の戻り値型は `Promise<void>` のため、`safeInvokeUnwrap<void>` で互換。Renderer側で `abort()` の戻り値を `boolean` として使用している箇所がないか `grep` で事前確認                                                            |
| skill:get-status の null → Error 変更  | 中     | 中         | 現在 `null` を返していた箇所が `Error` をスローするようになる。Renderer側で `null` チェックしている箇所を `try/catch` に変更する必要がある可能性がある。影響範囲を事前に `grep -rn "getExecutionStatus" apps/desktop/src/renderer/` で確認する |
| テスト数の大幅増加によるCI時間増加     | 低     | 中         | テストケース設計で重複を排除し、必要最小限のケースに絞る                                                                                                                                                                                       |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント               | パス                                                                                        | 参照理由                       |
| -------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------ |
| IPC契約チェックリスト      | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC修正時の品質ゲート          |
| Agent SDK Skill 仕様       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | スキル管理IPCの仕様定義        |
| スキル実行IPCセキュリティ  | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | セキュリティ要件の確認         |
| アーキテクチャ実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | safeInvokeUnwrapパターンの参照 |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`                                                        | P23, P42, P44, P45, P46 の参照 |
| コード品質ルール           | `.claude/rules/02-code-quality.md`                                                          | エラーカテゴリ定義の参照       |
| Electron セキュリティ      | `.claude/rules/04-electron-security.md`                                                     | IPCセキュリティ原則の確認      |

### 参考資料

| 資料                           | パス                                                                                             | 内容                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| safeInvokeUnwrap設計書         | `docs/30-workflows/completed-tasks/ipc-response-unwrap/outputs/phase-2/design-document.md`       | safeInvokeUnwrap の設計決定記録          |
| safeInvokeUnwrap実装ガイド     | `docs/30-workflows/completed-tasks/ipc-response-unwrap/outputs/phase-12/implementation-guide.md` | safeInvokeUnwrap の実装詳細              |
| skill:remove修正タスク         | `docs/30-workflows/completed-tasks/ut-fix-skill-remove-interface/`                               | 親タスクの実装記録（本未タスクの発見元） |
| skillFileHandlers実装          | `apps/desktop/src/main/ipc/skillFileHandlers.ts`                                                 | パターンBの模範実装（TASK-9A-B）         |
| UT-FIX-IPC-RESPONSE-UNWRAP-001 | `docs/30-workflows/completed-tasks/task-ut-fix-ipc-response-unwrap-001.md`                       | safeInvokeUnwrapタスクの完了記録         |

---

## 9. 備考

### セキュリティバリデーションとアプリケーションバリデーションの分離

本タスクで統一する「パターンB（return { success: false }）」は **アプリケーションバリデーション** のエラー応答に適用する。**セキュリティバリデーション**（`validateIpcSender` による送信元検証）は引き続き `throw toIPCValidationError()` を使用する。

| バリデーション種別                | エラー応答                         | 理由                                                                     |
| --------------------------------- | ---------------------------------- | ------------------------------------------------------------------------ |
| セキュリティ（validateIpcSender） | `throw toIPCValidationError()`     | 不正な送信元からのリクエストは即座にrejectし、正常フローに入らせない     |
| アプリケーション（引数チェック）  | `return { success: false, error }` | 正当な送信元からの不正な引数は、エラー情報付きで応答し、UI表示に活用する |

この分離により、`safeInvokeUnwrap` は `ipcRenderer.invoke` の reject（セキュリティエラー）と `IpcResult` の `success: false`（アプリケーションエラー）の両方を `Error` オブジェクトとしてRenderer側に伝播する。

### skill:execute の特殊考慮

`skill:execute` は現在パターンB（`return { success: false }`）を使用しているが、Preload側では `safeInvoke`（展開なし）を使用している。`SkillAPI.execute` の戻り値型は `Promise<SkillExecutionResponse>` だが、実際のハンドラは `{ success: true, data: result }` を返す。Preload側を `safeInvokeUnwrap` に移行する際、`SkillExecutionResponse` が `result` と型互換であるか確認が必要。

### 将来の拡張に関するメモ

- `IpcResult<T>` 型を `@repo/shared` に移動し、Main/Preload/Renderer 全レイヤーで共有する構想がある（UT-FIX-IPC-RESPONSE-UNWRAP-003 関連）
- エラーコードの構造化（`{ code: string, message: string }` → エラーカテゴリ体系）は本タスクのスコープ外とし、包括的なエラーハンドリング設計タスクとして別途検討する
