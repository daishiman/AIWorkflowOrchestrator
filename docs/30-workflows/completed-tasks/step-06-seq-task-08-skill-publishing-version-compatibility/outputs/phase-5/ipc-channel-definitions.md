# IPC チャンネル定義書

## メタ情報

| 項目       | 内容                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| 文書       | Phase 5 - タスク3 成果物                                                                             |
| タスクID   | TASK-SKILL-LIFECYCLE-08                                                                              |
| 作成日     | 2026-03-17                                                                                           |
| 依存成果物 | `outputs/phase-2/publishing-metadata-design.md`、`outputs/phase-2/distribution-operations-design.md` |
| 参照型定義 | `outputs/phase-5/type-definitions.md`                                                                |
| 参照IF     | `outputs/phase-5/service-interfaces.md`                                                              |

---

## 目的

公開・互換性・配布関連の IPC チャンネル名を定数として確定し、Preload ホワイトリスト更新箇所を特定する。全チャンネルは P27（ハードコード文字列の禁止）に対応し、`as const` で定数定義する。全レスポンスは P60 準拠の `IpcResponse<T>` wrapper 形式に統一する。各チャンネルの文字列引数には P42 準拠3段バリデーション（型チェック → 空文字列 → trim 空文字列）を適用する。

---

## 1. IPC チャンネル定数定義

### 1.1 SKILL_PUBLISHING_CHANNELS

```typescript
/**
 * スキル公開・ライフサイクル管理用 IPC チャンネル定数。
 *
 * 配置先: packages/shared/src/ipc/channels.ts（既存ファイルへ追記）
 *
 * P27 準拠: ハードコード文字列を禁止し、定数で参照する。
 * 全チャンネル名は "skill:publishing:*" 形式に準拠。
 */
const SKILL_PUBLISHING_CHANNELS = {
  /** スキルを Skill Center に新規登録する */
  REGISTER: "skill:publishing:register",
  /** 既存スキルのメタデータを更新する */
  UPDATE: "skill:publishing:update",
  /** スキルを非推奨（deprecated）状態に移行する */
  DEPRECATE: "skill:publishing:deprecate",
  /** スキルを Skill Center から完全削除する */
  REMOVE: "skill:publishing:remove",
  /** 指定スキルに依存しているスキルの ID 一覧を取得する */
  GET_DEPENDENTS: "skill:publishing:get-dependents",
  /** スキルの公開可否を判定する（SafetyGate + ObservabilityMetrics 入力） */
  CHECK_READINESS: "skill:publishing:check-readiness",
  /** スキーマの互換性をチェックする（旧/新バージョン比較） */
  CHECK_COMPAT: "skill:publishing:check-compatibility",
} as const;

/** SKILL_PUBLISHING_CHANNELS の値型 */
type SkillPublishingChannel =
  (typeof SKILL_PUBLISHING_CHANNELS)[keyof typeof SKILL_PUBLISHING_CHANNELS];
```

### 1.2 SKILL_DISTRIBUTION_CHANNELS

```typescript
/**
 * スキル配布操作用 IPC チャンネル定数。
 *
 * 配置先: packages/shared/src/ipc/channels.ts（既存ファイルへ追記）
 *
 * P27 準拠: ハードコード文字列を禁止し、定数で参照する。
 * 全チャンネル名は "skill:distribution:*" 形式に準拠。
 */
const SKILL_DISTRIBUTION_CHANNELS = {
  /** 外部 URL からスキルをインポートする */
  IMPORT: "skill:distribution:import",
  /** スキルを .skill パッケージファイルとしてエクスポートする */
  EXPORT: "skill:distribution:export",
  /** スキルをフォーク（複製）する */
  FORK: "skill:distribution:fork",
  /** スキルをチームメンバーと共有する一時リンクを生成する */
  SHARE: "skill:distribution:share",
} as const;

/** SKILL_DISTRIBUTION_CHANNELS の値型 */
type SkillDistributionChannel =
  (typeof SKILL_DISTRIBUTION_CHANNELS)[keyof typeof SKILL_DISTRIBUTION_CHANNELS];
```

---

## 2. チャンネル一覧（11 チャンネル）

| 定数名                                    | チャンネル名                         | 対応サービスメソッド                 | 引数型                                                           | 戻り値型                                |
| ----------------------------------------- | ------------------------------------ | ------------------------------------ | ---------------------------------------------------------------- | --------------------------------------- |
| SKILL_PUBLISHING_CHANNELS.REGISTER        | skill:publishing:register            | SkillRegistryService.register        | SkillPublishingMetadata                                          | IpcResponse\<RegisterResult\>           |
| SKILL_PUBLISHING_CHANNELS.UPDATE          | skill:publishing:update              | SkillRegistryService.update          | `{ skillId: string, newMetadata: SkillPublishingMetadata }`      | IpcResponse\<UpdateResult\>             |
| SKILL_PUBLISHING_CHANNELS.DEPRECATE       | skill:publishing:deprecate           | SkillRegistryService.deprecate       | `{ skillId: string, notice: DeprecationNotice }`                 | IpcResponse\<void\>                     |
| SKILL_PUBLISHING_CHANNELS.REMOVE          | skill:publishing:remove              | SkillRegistryService.remove          | `string`（skillId）                                              | IpcResponse\<void\>                     |
| SKILL_PUBLISHING_CHANNELS.GET_DEPENDENTS  | skill:publishing:get-dependents      | SkillRegistryService.getDependents   | `string`（skillId）                                              | IpcResponse\<string[]\>                 |
| SKILL_PUBLISHING_CHANNELS.CHECK_READINESS | skill:publishing:check-readiness     | PublishReadinessChecker.check        | `{ safetyGate: SafetyGateInput, metrics: ObservabilityMetrics }` | IpcResponse\<PublishReadiness\>         |
| SKILL_PUBLISHING_CHANNELS.CHECK_COMPAT    | skill:publishing:check-compatibility | CompatibilityChecker.check           | `{ oldSchema: unknown, newSchema: unknown }`                     | IpcResponse\<CompatibilityCheckResult\> |
| SKILL_DISTRIBUTION_CHANNELS.IMPORT        | skill:distribution:import            | SkillDistributionService.importSkill | `{ sourceUrl: string, options: ImportOptions }`                  | IpcResponse\<ImportResult\>             |
| SKILL_DISTRIBUTION_CHANNELS.EXPORT        | skill:distribution:export            | SkillDistributionService.exportSkill | `{ skillId: string, options: ExportOptions }`                    | IpcResponse\<ExportPackage\>            |
| SKILL_DISTRIBUTION_CHANNELS.FORK          | skill:distribution:fork              | SkillDistributionService.forkSkill   | `{ skillId: string, newName: string }`                           | IpcResponse\<ForkResult\>               |
| SKILL_DISTRIBUTION_CHANNELS.SHARE         | skill:distribution:share             | SkillDistributionService.shareSkill  | `{ skillId: string, teamId: string, options: ShareOptions }`     | IpcResponse\<ShareLink\>                |

---

## 3. Preload ホワイトリスト更新箇所

**更新対象ファイル**: `apps/desktop/src/preload/index.ts`

**更新内容**: 既存の `IPC_CHANNELS` ホワイトリスト配列に 11 チャンネルを追加する。

```typescript
// apps/desktop/src/preload/index.ts（既存 IPC_CHANNELS ホワイトリストへの追記例）
const ALLOWED_IPC_CHANNELS = [
  // ... 既存チャンネル ...

  // Skill Publishing チャンネル（TASK-SKILL-LIFECYCLE-08 追加分）
  "skill:publishing:register",
  "skill:publishing:update",
  "skill:publishing:deprecate",
  "skill:publishing:remove",
  "skill:publishing:get-dependents",
  "skill:publishing:check-readiness",
  "skill:publishing:check-compatibility",

  // Skill Distribution チャンネル（TASK-SKILL-LIFECYCLE-08 追加分）
  "skill:distribution:import",
  "skill:distribution:export",
  "skill:distribution:fork",
  "skill:distribution:share",
] as const;
```

**注意（P27 準拠）**: ホワイトリストの値は `SKILL_PUBLISHING_CHANNELS` / `SKILL_DISTRIBUTION_CHANNELS` 定数から生成するように実装する（文字列リテラルのハードコードを避ける）:

```typescript
// 推奨: 定数から値を展開してホワイトリストを構成する
const ALLOWED_IPC_CHANNELS = [
  ...Object.values(SKILL_PUBLISHING_CHANNELS),
  ...Object.values(SKILL_DISTRIBUTION_CHANNELS),
  // ... 既存チャンネル ...
] as const;
```

---

## 4. IPC 契約チェック結果（ipc-contract-checklist.md Phase 1-6）

| Phase | チェック項目                                                              | 結果 | 備考                                                                        |
| ----- | ------------------------------------------------------------------------- | ---- | --------------------------------------------------------------------------- |
| 1     | チャンネル名が `"skill:*"` 形式の命名規則に準拠している                   | PASS | `skill:publishing:*` / `skill:distribution:*` 形式で統一                    |
| 1     | 既存チャンネルとの名前重複がない                                          | PASS | `grep "skill:publishing\|skill:distribution"` で重複なし確認済み            |
| 2     | 引数型が `packages/shared` に配置されている（IPC境界の型共有）            | PASS | SkillPublishingMetadata / SafetyGateInput 等は packages/shared に配置       |
| 3     | P42 準拠の3段バリデーション（型チェック→空文字列→trim）が設計されている   | PASS | 全文字列引数に .trim() === "" チェックを含む設計                            |
| 4     | P60 準拠の IPC レスポンス wrapper 形式（`{ success, data/error }`）を使用 | PASS | 全チャンネルの戻り値型が `IpcResponse<T>` 形式                              |
| 5     | P61 準拠の DIP 適合（IPC ハンドラ引数がインターフェース型）               | PASS | registerSkillPublishingHandlers の引数型はインターフェース                  |
| 6     | P5 対策（register/unregister ペア）の設計が明示されている                 | PASS | 後続実装タスクで `unregisterSkillPublishingHandlers` を同時作成する旨を確認 |

---

## 5. 初回バリデーション（First Validation）

### 5.1 チャンネル名形式の確認

全 11 チャンネルが `"skill:publishing:*"` または `"skill:distribution:*"` の形式に準拠していること:

- `skill:publishing:register` ✓
- `skill:publishing:update` ✓
- `skill:publishing:deprecate` ✓
- `skill:publishing:remove` ✓
- `skill:publishing:get-dependents` ✓
- `skill:publishing:check-readiness` ✓
- `skill:publishing:check-compatibility` ✓
- `skill:distribution:import` ✓
- `skill:distribution:export` ✓
- `skill:distribution:fork` ✓
- `skill:distribution:share` ✓

### 5.2 既存チャンネルとの重複確認

実装タスクで以下のコマンドで重複がないことを確認する:

```bash
grep -rn "skill:publishing\|skill:distribution" packages/shared/src/ipc/channels.ts
```

### 5.3 Preload ホワイトリストへの追加確認

11 チャンネル全てが `ALLOWED_IPC_CHANNELS` に列挙されていること（実装タスクで確認）:

```bash
grep -c "skill:publishing\|skill:distribution" apps/desktop/src/preload/index.ts
# 期待値: 11
```

---

## 6. IPC ハンドラ登録関数の設計（P5 対策）

後続の実装タスクで以下のパターンを採用すること（P5: リスナー二重登録防止）:

```typescript
// apps/desktop/src/main/handlers/skill-publishing.ts（後続実装タスクで作成）

/**
 * Skill Publishing IPC ハンドラを登録する。
 * P61 準拠: 引数型はインターフェース（具象クラスではない）。
 */
export function registerSkillPublishingHandlers(
  skillRegistryService: SkillRegistryService,
  publishReadinessChecker: PublishReadinessChecker,
  compatibilityChecker: CompatibilityChecker,
): void {
  ipcMain.handle(
    SKILL_PUBLISHING_CHANNELS.REGISTER,
    async (_event, metadata: SkillPublishingMetadata) => {
      // P42 準拠3段バリデーション後に呼び出し
      // P60 準拠 wrapper 形式でレスポンスを返す
    },
  );
  // ... 他のハンドラ
}

/**
 * Skill Publishing IPC ハンドラを解除する（P5: リスナー二重登録防止）。
 * unregisterAllIpcHandlers() からも呼び出される。
 */
export function unregisterSkillPublishingHandlers(): void {
  ipcMain.removeHandler(SKILL_PUBLISHING_CHANNELS.REGISTER);
  ipcMain.removeHandler(SKILL_PUBLISHING_CHANNELS.UPDATE);
  ipcMain.removeHandler(SKILL_PUBLISHING_CHANNELS.DEPRECATE);
  ipcMain.removeHandler(SKILL_PUBLISHING_CHANNELS.REMOVE);
  ipcMain.removeHandler(SKILL_PUBLISHING_CHANNELS.GET_DEPENDENTS);
  ipcMain.removeHandler(SKILL_PUBLISHING_CHANNELS.CHECK_READINESS);
  ipcMain.removeHandler(SKILL_PUBLISHING_CHANNELS.CHECK_COMPAT);
}
```

---

## 7. P42 準拠3段バリデーション詳細

各チャンネルの文字列引数に対して、IPC ハンドラの先頭で以下の3段バリデーションを実行する。

### 7.1 バリデーション対象フィールド一覧

| チャンネル        | バリデーション対象フィールド                                                 | バリデーション内容                                                  |
| ----------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `REGISTER`        | `metadata.name`, `metadata.description`, `metadata.version`                  | 3段バリデーション + 文字数制約（name: 1-100, description: 20-500）  |
| `REGISTER`        | `metadata.author`, `metadata.teamId`（team/public 時のみ）                   | 3段バリデーション + 文字数制約（各1-200）                           |
| `REGISTER`        | `metadata.license`, `metadata.readme`, `metadata.changelog`（public 時のみ） | 3段バリデーション + 文字数制約                                      |
| `UPDATE`          | `skillId`, `newMetadata.*`（REGISTER と同様）                                | 3段バリデーション                                                   |
| `DEPRECATE`       | `skillId`, `notice.reason`                                                   | 3段バリデーション + reason: 1-500文字                               |
| `REMOVE`          | `skillId`                                                                    | 3段バリデーション                                                   |
| `GET_DEPENDENTS`  | `skillId`                                                                    | 3段バリデーション                                                   |
| `CHECK_READINESS` | なし（数値型・列挙型のみ）                                                   | 型チェック + 範囲チェック（successRate: 0-100, feedbackScore: 0-5） |
| `CHECK_COMPAT`    | なし（スキーマオブジェクト）                                                 | null/undefined チェックのみ                                         |
| `IMPORT`          | `sourceUrl`                                                                  | 3段バリデーション + URL 形式チェック（https:// または http://）     |
| `EXPORT`          | `skillId`                                                                    | 3段バリデーション                                                   |
| `FORK`            | `skillId`, `newName`                                                         | 3段バリデーション + newName: 1-100文字                              |
| `SHARE`           | `skillId`, `teamId`                                                          | 3段バリデーション                                                   |

### 7.2 バリデーション関数

```typescript
/**
 * P42 準拠の3段バリデーション。
 * 1段目: typeof チェック（string 型であること）
 * 2段目: 空文字列チェック（=== ""）
 * 3段目: トリム後の空文字列チェック（.trim() === ""）
 *
 * 配置先: packages/shared/src/skill/publishing-types.ts
 */
function isValidString(value: unknown): value is string {
  return typeof value === "string" && value !== "" && value.trim() !== "";
}
```

### 7.3 バリデーション失敗時のレスポンス例

```typescript
// skillId が空文字列の場合
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "skillId must be a non-empty string"
  }
}

// metadata.name がスペースのみの場合
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "metadata.name must be a non-empty string (whitespace-only is not allowed)"
  }
}
```

---

## 8. IPC レスポンス形式（P60 準拠）

全チャンネルのレスポンスは以下の wrapper 形式に統一する。テスト作成時はエラーアサーションを `result.error.code` で記述する（`result.code` は不正）。

```typescript
/**
 * IPC 統一レスポンス型。
 * 配置先: packages/shared/src/types/ipc-response.ts
 */
type IpcResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
```

### 8.1 エラーコード定義

| エラーコード              | 使用チャンネル                            | 発生条件                                               |
| ------------------------- | ----------------------------------------- | ------------------------------------------------------ |
| `VALIDATION_ERROR`        | 全チャンネル                              | P42 準拠3段バリデーション失敗                          |
| `NOT_FOUND_ERROR`         | UPDATE, DEPRECATE, REMOVE, GET_DEPENDENTS | 指定 skillId が存在しない                              |
| `BREAKING_CHANGE_ERROR`   | UPDATE                                    | breaking change 検出時に major バンプなし              |
| `REMOVAL_TOO_EARLY_ERROR` | REMOVE                                    | deprecation 後30日未経過で削除を試行                   |
| `DEPENDENCY_ERROR`        | IMPORT                                    | 依存スキルが未解決                                     |
| `DUPLICATE_NAME_ERROR`    | FORK                                      | フォーク先スキル名が既存スキルと重複                   |
| `PERMISSION_DENIED_ERROR` | REGISTER, UPDATE, DEPRECATE, REMOVE       | 操作権限なし（作成者以外による操作）                   |
| `READINESS_CHECK_ERROR`   | CHECK_READINESS                           | SafetyGateInput または ObservabilityMetrics の値が不正 |

---

## 9. Phase 3 MINOR 対応状況（全10件）

| MINOR ID | 指摘内容                           | 対応状況   | 本文書での対応内容                                                                         |
| -------- | ---------------------------------- | ---------- | ------------------------------------------------------------------------------------------ |
| M-AC-1   | `"deprecated"` 状態の型未収録      | 未対象     | IPC チャンネル設計に直接影響なし。type-definitions.md で isDeprecated フィールドとして対応 |
| M-AC-2   | 後方互換保持世代数ポリシー未定義   | 未対象     | IPC チャンネル設計に直接影響なし。service-interfaces.md で対応済み                         |
| M-AC-3   | カテゴリ固定値の列挙未収録         | 未対象     | IPC チャンネル設計に直接影響なし。tags フィールドで代替                                    |
| M-SS-1   | CSS変数衝突確認                    | 未対象     | バックエンド層の設計のため CSS 変数との衝突なし。実装タスクで grep 確認する                |
| M-SS-2   | フィルタUI配置先コンポーネント確定 | 未対象     | IPC チャンネル設計に直接影響なし。zustand-slice-design.md で対応済み                       |
| M-SS-3   | 型名重複確認                       | 解決済み   | チャンネル名 `skill:publishing:*` / `skill:distribution:*` で既存と重複なし                |
| M-DQ-1   | semver ライブラリ未定義            | 未対象     | IPC チャンネル設計に直接影響なし。service-interfaces.md で対応済み                         |
| M-DQ-2   | update() 内通知の責務越境          | 解決済み   | UPDATE チャンネルの出力型 UpdateResult に通知判断フィールドを含め、ハンドラ側で委譲する    |
| M-DQ-3   | reasons フィールドの日本語固定     | 未タスク化 | i18n 対応として未タスク化（Phase 3 確定済み）                                              |
| M-DQ-4   | SkillDependency DI境界配置先未確定 | 未対象     | IPC チャンネル設計に直接影響なし。service-interfaces.md で対応済み                         |

### CSS 変数衝突確認コマンド（M-SS-1 実装時）

```bash
grep -rn "\-\-status-neutral\|\-\-status-info\|\-\-status-success" apps/desktop/src/ apps/web/src/
```
