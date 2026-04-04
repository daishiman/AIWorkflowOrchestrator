# ManifestLoader dynamic pipeline のデフォルト有効化 - タスク指示書

```yaml
issue_number: 1891
task_id: TASK-P0-04
task_name: ManifestLoader dynamic pipeline のデフォルト有効化
category: 設定変更・機能修正（Spec P0系）
target_feature: Skill Creator Agent SDK Lane - ManifestLoader
priority: 高
scale: 小規模
status: 未実施
source: P0是正パック（manifest配置後の有効化が未対応）
created_date: 2026-04-04
step: 10（P0-03後に直列実行）
dependencies:
  - TASK-P0-03（workflow-manifest.json本番配置）
```

## メタ情報

| 項目         | 値                                                 |
| ------------ | -------------------------------------------------- |
| タスクID     | TASK-P0-04                                         |
| タスク名     | ManifestLoader dynamic pipeline のデフォルト有効化 |
| 分類         | 設定変更・機能修正（Spec P0系）                    |
| 対象機能     | Skill Creator Agent SDK Lane - ManifestLoader      |
| 優先度       | 高                                                 |
| 見積もり規模 | 小規模                                             |
| ステータス   | 未実施                                             |
| 発見元       | P0是正パック（manifest配置後の有効化が未対応）     |
| 発見日       | 2026-04-04                                         |
| Step         | 10（P0-03後に直列実行）                            |
| 依存タスク   | TASK-P0-03（workflow-manifest.json本番配置）       |

---

## 1. Why（なぜこのタスクが必要か）

### 1.1 背景

TASK-P0-03 で `workflow-manifest.json` が本番パス（`.claude/skills/skill-creator/` および `.agents/skills/skill-creator/`）に配置された。

しかし ManifestLoader が動的パイプラインを使用するかどうかは、現在「条件付き有効化」（フィーチャーフラグまたは設定値による制御）となっている。その結果、manifest が配置された後も動的パイプラインが自動的に使用されるわけではなく、静的パイプライン（ハードコードされたフェーズ定義）が引き続き使われ続ける。

### 1.2 問題点・課題

- ManifestLoader の動的パイプラインが「条件付き有効化」のままであり、manifest 配置後も動的パイプラインが使用されない
- manifest 配置後はデフォルトで動的パイプラインが使用されるべきであり、フィーチャーフラグや条件分岐は撤廃する必要がある
- 既存の静的パイプライン（ハードコードされたフェーズ定義）から動的パイプラインへの移行が必要
- P0-07（AGENT_NAMES 動的化）および P0-09（permission/hooks ガバナンス）は、本タスクで動的パイプラインが有効化されていることを前提とする

### 1.3 放置した場合の影響

- TASK-P0-03 で manifest を配置しても動的パイプラインが使用されないため、P0-03 の成果が無意味になる
- 静的パイプライン（ハードコード）が本番環境で使われ続け、manifest 定義が完全に無視される
- P0-07 / P0-09 が P0-04 の完了を前提としているため、後続タスクの着手がブロックされる

---

## 2. What（何を達成するか）

### 2.1 目的

ManifestLoader の動的パイプラインをデフォルトで有効化し、`workflow-manifest.json` から読み込んだフェーズ定義・リソース・hooks が実際のパイプライン実行に使用される状態にする。

### 2.2 最終ゴール

1. アプリ起動時（または skill-creator 初回呼び出し時）に ManifestLoader が canonical manifest を自動的に読み込み、動的パイプラインを構築する
2. フィーチャーフラグ・条件分岐による「静的パイプラインへのフォールバック起動」が除去される（ただし manifest 不在時の安全なフォールバックは残す）
3. manifest が存在する環境では常に動的パイプラインが使用される
4. manifest が存在しない環境では、静的パイプラインへ安全にフォールバックし、警告ログを出力する
5. 動的パイプラインと静的パイプラインの型が互換であることがテストで保証される
6. 有効化に関連するユニットテストが更新・追加される

### 2.3 スコープ

#### 含むもの

- ManifestLoader の動的パイプライン有効化条件の変更（フィーチャーフラグの撤廃またはデフォルト true への変更）
- フォールバック設計（manifest 不在時の安全な動作）
- 有効化に伴うユニットテスト更新・追加
- 動的パイプラインと静的パイプラインの型互換性確認

#### 含まないもの

- manifest 内容の定義（TASK-P0-03 の責務）
- AGENT_NAMES の動的化（TASK-P0-07 の責務）
- permission/hooks ガバナンスの統合（TASK-P0-09 の責務）
- ManifestLoader 自体の検証ロジック変更

### 2.4 成果物

| 成果物                                     | パス                                                                                          |
| ------------------------------------------ | --------------------------------------------------------------------------------------------- |
| 有効化条件変更（既存ファイルへの修正）     | `apps/desktop/src/main/services/runtime/ManifestLoader.ts`（または呼び出し元）                |
| フォールバック実装（既存ファイルへの修正） | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`（または呼び出し元）    |
| ユニットテスト更新・追加                   | `apps/desktop/src/main/services/runtime/__tests__/`（既存テストの更新および新規テストの追加） |

---

## 3. How（どのように実行するか）

### 3.1 前提条件

- **TASK-P0-03 が完了していること**（workflow-manifest.json が canonical / mirror 両パスに配置済み）
- `ManifestLoader.ts` の検証ロジック（schemaVersion, phases, resources, entry, exit の相互参照）を理解していること
- 現在の静的パイプライン定義がどこに存在するかを把握していること
- TypeScript 型定義が `LoadedWorkflowManifest`（`@repo/shared/types`）として存在することを確認していること

### 3.2 依存タスク

- **TASK-P0-03**（upstream）: workflow-manifest.json の本番配置が完了していること

後続タスク（本タスク完了後に着手可能）:

- `TASK-P0-07`: AGENT_NAMES の動的解決
- `TASK-P0-09`: permission / hooks / audit ガバナンスの統合

### 3.3 必要な知識

#### ManifestLoader の loadManifest() シグネチャ

```typescript
// apps/desktop/src/main/services/runtime/ManifestLoader.ts
class ManifestLoader {
  async loadManifest(manifestPath: string): Promise<LoadedWorkflowManifest>;
  invalidate(manifestPath?: string): void;
}
```

`loadManifest()` は manifest ファイルを読み込み、多段階の検証を実施した後、`LoadedWorkflowManifest` 型のオブジェクトを返す。このオブジェクトには `phases`（動的フェーズ定義）・`resources`（リソース記述子）・`entry`/`exit`（hooks）が含まれる。

#### 有効化条件の変更方針

動的パイプラインの有効化条件として以下のいずれかのパターンが存在する可能性がある：

- **フィーチャーフラグ定数**: 例 `USE_DYNAMIC_PIPELINE = false` → `true` に変更
- **環境変数チェック**: 例 `process.env.MANIFEST_PIPELINE_ENABLED === "true"` → 常に有効化
- **null チェックによる条件分岐**: manifest が null の場合のみ静的パイプラインを使用 → manifest 存在チェックに変更

Phase 1 で現状のコードを調査し、実際のパターンを特定してから変更方針を確定する。

#### フォールバック設計の指針

manifest が存在しない環境での安全な動作を保証する：

```typescript
// 推奨フォールバックパターン
try {
  const manifest = await manifestLoader.loadManifest(canonicalManifestPath);
  return buildDynamicPipeline(manifest); // 動的パイプライン
} catch (error) {
  if (isFileNotFoundError(error)) {
    logger.warn(
      "workflow-manifest.json が見つかりません。静的パイプラインにフォールバックします。",
    );
    return buildStaticPipeline(); // 静的パイプライン（フォールバック）
  }
  throw error; // manifest が存在するがエラーの場合は再throw
}
```

#### 型互換性の確認ポイント

動的パイプラインが返す型と静的パイプラインが返す型が同一のインターフェースを満たすことを確認する：

- `SkillCreatorWorkflowPhase` 型との互換性
- `phases` 配列の型が呼び出し元で期待される型と一致するか
- `resources` / `entry` / `exit` の各フィールドが既存コードと整合するか

---

## 4. 実行手順

### Phase 1: ManifestLoader 現状確認

#### 目的

現在の ManifestLoader の有効化条件と、動的パイプラインが条件付きで使われている箇所を特定する。

#### 手順

1. `ManifestLoader.ts` の全コードを読み込み、`loadManifest()` の呼び出し箇所を確認する
2. 以下のパターンでコードベースを検索し、有効化条件を特定する：
   - `ManifestLoader` を instantiate・呼び出している箇所
   - フィーチャーフラグ定数（例: `USE_DYNAMIC_PIPELINE`, `MANIFEST_ENABLED` 等）
   - 静的パイプライン定義（ハードコードされたフェーズ定義）の存在箇所
3. `SkillCreatorWorkflowEngine.ts` を読み込み、静的パイプライン定義がどのように使われているかを確認する
4. `__tests__/` 配下の既存テストで ManifestLoader の有効化に関連するテストケースを確認する

#### 成果物

- 現在の有効化条件の特定（フラグ名・ファイル・行番号のメモ）
- 静的パイプライン定義の特定（ファイル・行番号のメモ）

#### 完了条件

- [ ] 有効化条件（フィーチャーフラグまたは条件分岐）が特定されている
- [ ] 静的パイプライン定義がどこに存在するかが特定されている
- [ ] 動的パイプラインと静的パイプラインが返す型が把握されている

---

### Phase 2: 有効化条件変更

#### 目的

ManifestLoader の動的パイプラインをデフォルトで有効化するよう、有効化条件を変更する。

#### 手順

1. Phase 1 で特定した有効化条件を変更する（フィーチャーフラグの削除またはデフォルト値変更）
2. 静的パイプラインを優先する条件分岐を、動的パイプラインを優先する条件分岐に反転する
3. manifest パスを決定する定数または設定値を確認し、canonical パス（`.claude/skills/skill-creator/workflow-manifest.json`）がデフォルトで参照されることを確認する
4. 変更後に TypeScript 型チェックが通ることを確認する：
   ```bash
   pnpm --filter @repo/desktop typecheck
   ```

#### 完了条件

- [ ] フィーチャーフラグが撤廃（または `true` にデフォルト変更）されている
- [ ] 動的パイプラインが優先して使用される条件分岐になっている
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし

---

### Phase 3: フォールバック実装

#### 目的

manifest が存在しない環境（または読み込みに失敗した場合）でも安全に動作するフォールバックを実装する。

#### 手順

1. manifest が存在しない場合（`ENOENT` エラー）を検出し、静的パイプラインへのフォールバックを実装する
2. フォールバック時に警告ログを出力する：
   ```
   [warn] workflow-manifest.json が見つかりません。静的パイプラインにフォールバックします。
   ```
3. manifest が存在するがパースエラー・検証エラーが発生した場合は、フォールバックせず例外を再 throw する（不正な manifest を無視しない）
4. フォールバック時の型互換性を確認する：
   - 静的パイプラインが返す型が動的パイプラインと同一のインターフェースを満たすことを確認する

#### 完了条件

- [ ] manifest 不在時に静的パイプラインへ安全にフォールバックする
- [ ] フォールバック時に警告ログが出力される
- [ ] manifest が存在するがエラーの場合は例外が再 throw される
- [ ] フォールバック時の型が動的パイプラインと互換

---

### Phase 4: テスト更新・追加

#### 目的

有効化に伴うユニットテストを更新・追加し、動的パイプラインがデフォルトで使用されることを確認する。

#### 手順

1. 既存テストの確認と更新：
   - `__tests__/` 配下で静的パイプラインを前提としたテストケースを特定する
   - 動的パイプライン有効化後に失敗するテストを修正する
2. 新規テストケースの追加：
   - `TC-dynamic-01`: manifest が存在する場合に動的パイプラインが使用される
   - `TC-dynamic-02`: manifest が存在しない場合に静的パイプラインへフォールバックする
   - `TC-dynamic-03`: manifest が存在するがパースエラーの場合に例外が throw される
   - `TC-dynamic-04`: 動的パイプラインと静的パイプラインの型が互換である
3. テストを実行し、全件 PASS を確認する：
   ```bash
   pnpm --filter @repo/desktop test ManifestLoader
   pnpm --filter @repo/desktop test ManifestLoader.production-manifest
   ```

#### 完了条件

- [ ] 既存テストの修正が完了し、リグレッションがない
- [ ] `TC-dynamic-01` 〜 `TC-dynamic-04` が全件 PASS
- [ ] `ManifestLoader.test.ts` / `ManifestLoader.production-manifest.test.ts` が全件 PASS

---

### Phase 5: 完了確認・品質保証

#### 目的

有効化後の品質を一括検証し、後続タスク（P0-07 / P0-09）への引き渡し準備を完了する。

#### 手順

1. 全テストを実行し、リグレッションがないことを確認する：
   ```bash
   pnpm --filter @repo/desktop test
   ```
2. TypeScript 型チェックを実行する：
   ```bash
   pnpm --filter @repo/desktop typecheck
   ```
3. lint を実行する：
   ```bash
   pnpm --filter @repo/desktop lint
   ```
4. 以下の完了条件チェックリスト（Section 5）を全項目確認する

#### 完了条件

- [ ] 全テストが PASS（新規追加テスト・既存テスト含む）
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm --filter @repo/desktop lint` がエラーなし
- [ ] 後続タスク（P0-07 / P0-09）の着手が可能な状態になっている

---

## 5. 完了条件チェックリスト

### 機能要件（AC）

- [ ] AC-1: アプリ起動時（または skill-creator 初回呼び出し時）に ManifestLoader が canonical manifest を自動的に読み込む
- [ ] AC-2: フィーチャーフラグ・条件分岐による「静的パイプライン優先起動」が除去されている
- [ ] AC-3: manifest が存在する環境では常に動的パイプラインが使用される
- [ ] AC-4: manifest が存在しない環境では、静的パイプラインへ安全にフォールバックし、警告ログを出力する
- [ ] AC-5: manifest が存在するがエラーの場合（パースエラー・検証エラー）は例外が再 throw される
- [ ] AC-6: 動的パイプラインが返す型と静的パイプラインが返す型が同一インターフェースを満たす

### 品質要件

- [ ] `ManifestLoader.test.ts` の既存テストが PASS（リグレッションなし）
- [ ] `ManifestLoader.production-manifest.test.ts` の全テストケースが PASS
- [ ] 新規追加テスト（`TC-dynamic-01` 〜 `TC-dynamic-04`）が全 PASS
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm --filter @repo/desktop lint` がエラーなし

---

## 6. 検証方法

### テストコマンド

```bash
# ManifestLoader 関連テストをすべて実行（リグレッション確認）
pnpm --filter @repo/desktop test ManifestLoader

# 本番 manifest 統合テストのみ実行
pnpm --filter @repo/desktop test ManifestLoader.production-manifest

# desktop パッケージ全テスト実行
pnpm --filter @repo/desktop test

# TypeScript 型チェック
pnpm --filter @repo/desktop typecheck

# lint チェック
pnpm --filter @repo/desktop lint
```

### テストケース一覧

| テストID      | 内容                                                            | 期待結果                                            |
| ------------- | --------------------------------------------------------------- | --------------------------------------------------- |
| TC-dynamic-01 | manifest が存在する場合に動的パイプラインが使用される           | `LoadedWorkflowManifest` のフェーズ定義が使用される |
| TC-dynamic-02 | manifest が存在しない場合に静的パイプラインへフォールバックする | 警告ログが出力され、静的フェーズ定義が使用される    |
| TC-dynamic-03 | manifest が存在するがパースエラーの場合に例外が throw される    | `Error` が throw される（フォールバックしない）     |
| TC-dynamic-04 | 動的パイプラインと静的パイプラインの型が互換である              | 型チェックが通る                                    |

### 手動確認手順

1. Electron 開発環境起動で動的パイプラインが使われることを確認する：
   ```bash
   pnpm --filter @repo/desktop dev
   ```
2. main process ログで `ManifestLoader` が canonical manifest を読み込んでいることを確認する
3. manifest を一時退避してアプリを再起動し、フォールバック動作（警告ログ・静的パイプライン使用）を確認する（確認後にファイルを復元する）

---

## 7. リスクと対策

| リスク                                                                               | 影響度 | 発生確率 | 対策                                                                                                                                                         |
| ------------------------------------------------------------------------------------ | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| フィーチャーフラグの有効化タイミングが不適切で、起動時に manifest 読み込みが失敗する | 高     | 中       | フォールバック設計（Phase 3）で安全な静的パイプラインへの切り替えを実装する。manifest 不在は警告に留め、起動を止めない                                       |
| 静的パイプラインとの後方互換性が壊れ、既存テストが失敗する                           | 高     | 中       | Phase 1 で静的パイプラインの型と使用箇所を事前に特定し、Phase 4 で既存テストをすべて確認・修正する                                                           |
| 動的パイプラインと静的パイプラインの型が非互換で TypeScript エラーになる             | 中     | 中       | Phase 1 で `LoadedWorkflowManifest` 型と既存の静的パイプライン型の差分を確認し、必要に応じてアダプタ層を追加する                                             |
| Electron main process の実行コンテキストでパス解決が失敗する                         | 中     | 低       | `SKILL_CREATOR_MANIFEST_PATH` 定数を `process.cwd()` / `app.getAppPath()` 等を起点に解決し、dev/prod/test 環境で動作することを Phase 4 のテストで確認する    |
| P0-07 / P0-09 が前提とする動的パイプラインの挙動が変わってしまう                     | 中     | 低       | 本タスクは「有効化条件の変更」と「フォールバック追加」のみを行う。manifest の内容変更・AGENT_NAMES 動的化・permission/hooks は後続タスクの責務として分離する |

---

## 8. 参照情報

### 苦戦箇所: フォールバック設計

manifest が存在しない環境での安全な動作設計が難しい。以下の点に注意する：

- `ENOENT`（ファイル不在）と `SyntaxError`（JSON 破損）と `ManifestLoader` バリデーションエラーを区別してハンドリングする
- `ENOENT` のみ静的パイプラインへフォールバックする（その他は例外を再 throw する）
- フォールバック時の静的パイプライン定義が `LoadedWorkflowManifest` 型と互換な型を返すことを TypeScript レベルで保証する

```typescript
// フォールバック分岐のパターン例
function isFileNotFoundError(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}
```

### 苦戦箇所: 型互換性

`ManifestLoader.loadManifest()` が返す `LoadedWorkflowManifest` 型の `phases` フィールドの型が、既存コードが期待する静的パイプラインの型と一致しない場合がある。

`LoadedWorkflowManifest.phases` の型は `WorkflowManifestPhase[]` であり、`SkillCreatorWorkflowPhase`（`@repo/shared/types`）とは異なる定義の可能性がある。Phase 1 の調査で両者の型を比較し、アダプタが必要か判断する。

### 関連ドキュメント

| ドキュメント                              | パス                                                                                          |
| ----------------------------------------- | --------------------------------------------------------------------------------------------- |
| ManifestLoader 実装                       | `apps/desktop/src/main/services/runtime/ManifestLoader.ts`                                    |
| SkillCreatorWorkflowEngine 実装           | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                        |
| 本番 manifest 統合テスト                  | `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.production-manifest.test.ts` |
| ManifestLoader 単体テスト                 | `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.test.ts`                     |
| ワークフローエンジン単体テスト            | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`         |
| canonical workflow-manifest.json          | `.claude/skills/skill-creator/workflow-manifest.json`                                         |
| mirror workflow-manifest.json             | `.agents/skills/skill-creator/workflow-manifest.json`                                         |
| 先行タスク: manifest 配置                 | `docs/30-workflows/unassigned-task/TASK-P0-03-workflow-manifest-production-placement.md`      |
| 旧 P0-04 仕様書（デフォルト起動ロジック） | `docs/30-workflows/unassigned-task/task-p0-04-manifest-loader-default-startup.md`             |
| P0 是正パック（設計方針）                 | `docs/30-workflows/skill-creator-agent-sdk-lane/p0-verify-manifest-remediation-pack.md`       |

---

## 9. 備考

### 旧仕様書（task-p0-04-manifest-loader-default-startup.md）との差異

本仕様書（`TASK-P0-04-manifest-loader-default-activation.md`）は、同じタスク ID `TASK-P0-04` を対象としているが、旧仕様書とはフォーカスが異なる：

| 観点           | 旧仕様書                                                                      | 本仕様書                                                                            |
| -------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 主題           | ManifestLoader の「呼び出し元がない」問題の解決（デフォルト起動ロジック追加） | ManifestLoader の「条件付き有効化」問題の解決（動的パイプラインのデフォルト有効化） |
| 核心問題       | 呼び出し元が存在しない                                                        | 呼び出し元は存在するが、フィーチャーフラグで無効化されている                        |
| フォールバック | 言及なし                                                                      | manifest 不在時の安全なフォールバック設計を含む                                     |
| 型互換性       | 言及なし                                                                      | 動的・静的パイプラインの型互換性確認を含む                                          |

実装時は Phase 1 の現状調査で実際の問題箇所を特定し、旧仕様書・本仕様書の両観点を踏まえて対応する。

### 後続タスクへの影響

本タスク完了後、以下のタスクが着手可能になる：

- `TASK-P0-07`: AGENT_NAMES を manifest の `resources[]` から動的解決する（本タスクで動的パイプラインが有効化されていることが前提）
- `TASK-P0-09`: Claude Code SDK permission / hooks / audit ガバナンスの統合（P0-04 完了後）

### Step 番号について

本タスクの Step は `10`（TASK-P0-03 の Step 09 の後に直列実行）である。TASK-P0-03 の完了を確認してから本タスクに着手すること。

### PR 作成

タスク完了後の PR タイトル（参考）：

```
feat(runtime): TASK-P0-04 ManifestLoader dynamic pipeline デフォルト有効化
```
