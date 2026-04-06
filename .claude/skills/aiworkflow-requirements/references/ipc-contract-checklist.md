# IPC契約チェックリスト

> **相対パス**: `references/ipc-contract-checklist.md`
> **読み込み条件**: IPC ハンドラー / Preload API / チャネル定義の新規作成・修正時
> **管理**: `.claude/skills/aiworkflow-requirements/`

---

## メタ情報

| 項目         | 値                                                                            |
| ------------ | ----------------------------------------------------------------------------- |
| 正本         | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` |
| 目的         | IPC修正時のインターフェース不整合（契約ドリフト）を防止するチェックリスト     |
| スコープ     | Main Process ハンドラー、Preload API、型定義、テスト、仕様書の同時更新        |
| 対象読者     | AIWorkflowOrchestrator 開発者                                                 |
| 統合パターン | P23, P32, P42, P44                                                            |

---

## 変更履歴

| 日付       | バージョン | 変更内容                                                                                                                                                                                                                                          |
| ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-04-06 | 1.5.0      | TASK-UI-02 ConversationPanel孤立解消: Skill Creator IPC ハンドラー scope 分離マトリクス（Session vs Runtime）追加。`CONFIGURE_API` / `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED` の `creatorHandlers.ts` 移管を whitelist 登録確認事項として追記 |
| 2026-03-08 | 1.4.0      | TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001: CC-7 を7項目に拡充（CC-7-1〜CC-7-7）。Renderer側の存在確認・二重チェック・Array.isArray・type predicate・フォールバックUI・try-catch・non-null assertion禁止。検出コマンドとテストパターン参照を追加 |
| 2026-03-07 | 1.3.0      | 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 を反映。CC-7（レスポンス配列フィールドの防御検証）を追加                                                                                                                                           |
| 2026-03-06 | 1.2.0      | TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001 を反映。shared transport DTO 正本化、`IPCResponse<T>` envelope、event payload と quick-reference 同期の確認項目を追加                                                                                   |
| 2026-02-25 | 1.1.0      | AUTH IPC登録一元化（UT-IPC-AUTH-HANDLE-DUPLICATE-001）を反映。通常経路とfallback経路の二重登録監査チェックを追加                                                                                                                                  |
| 2026-02-20 | 1.0.0      | 初版作成（UT-FIX-SKILL-REMOVE-INTERFACE-001 の教訓から抽出）                                                                                                                                                                                      |

---

## 背景

IPC（Inter-Process Communication）のインターフェース変更では、Main Process ハンドラーと Preload API の間で引数の型・名前・構造が乖離する「契約ドリフト」が繰り返し発生している。TypeScript コンパイラは Preload 層のモック化により不整合を検出できず、ランタイムで初めて顕在化する。

本チェックリストは以下の4つの Pitfall パターンを統合し、IPC修正時の品質ゲートとして機能する。

| Pitfall | パターン名                   | 概要                                                          |
| ------- | ---------------------------- | ------------------------------------------------------------- |
| P23     | API二重定義の型管理複雑性    | 型定義ファイルの同時更新漏れ                                  |
| P32     | 型定義の二箇所同時更新必須   | `packages/shared` と `apps/desktop/src/preload` の型乖離      |
| P42     | `.trim()` バリデーション漏れ | 文字列引数のスペースのみ入力がバリデーション通過              |
| P44     | IPC契約ドリフト              | ハンドラーとPreloadの引数形式不整合（オブジェクト vs 文字列） |

---

## チェックリスト

### Phase 1: 変更前の契約確認

IPC ハンドラーまたは Preload API を変更する前に、現在の契約状態を確認する。

- [ ] **1-1**: 対象チャネルの現在の request / response / event shape を4箇所で確認
  - `apps/desktop/src/main/ipc/` 内のハンドラー（実引数の受け取り方）
  - `apps/desktop/src/preload/index.ts` または公開APIモジュール（`safeInvoke` / `safeOn` の引数の渡し方）
  - `apps/desktop/src/preload/types.ts`
  - `packages/shared/src/types/` 配下の shared transport DTO（存在する場合はここを唯一の正本にする）
- [ ] **1-2**: 引数の命名が3箇所で一致することを確認（`skillId` vs `skillName` のような命名ドリフトがないか）
- [ ] **1-3**: 引数の構造が一致することを確認（オブジェクト `{ skillIds: string[] }` vs 直接値 `string` のような構造ドリフトがないか）
- [ ] **1-4**: 成功 / 失敗 envelope が一致することを確認（`success`, `data`, `error.code`, `error.message`, `guidance?`）
- [ ] **1-5**: event channel が invoke と別DTOを勝手に持たず、shared status DTO を再利用していることを確認

### Phase 2: 実装変更（3箇所同時更新）

変更は必ず以下の3箇所を1つのコミットで同時に行う。

- [ ] **2-1**: Main Process ハンドラーの引数受け取り更新
  - 対象ファイル: `apps/desktop/src/main/ipc/skillHandlers.ts` 等
- [ ] **2-2**: Preload API の引数渡し更新
  - 対象ファイル: `apps/desktop/src/preload/index.ts` または対象APIモジュール
- [ ] **2-3**: Renderer / Store / テストの期待値更新
  - 対象ファイル: `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts` 等
- [ ] **2-4**: 通常経路 + fallback経路の登録点を同時監査（AUTH系など）
  - `ipcMain.handle(IPC_CHANNELS.AUTH_*)` の重複直書きがないこと
  - 配列/共通ヘルパーによる宣言的登録に集約されていること
- [ ] **2-5**: shared transport DTO が存在する場合、Main / Preload / Renderer の local 型再定義を import / re-export へ置換する
- [ ] **2-6**: invoke 系と event 系を同時更新し、`status()` / `onChanged()` の表示契約が分裂しないことを確認する

### Phase 3: バリデーション確認（P42準拠）

文字列引数を受け取るハンドラーは、P42準拠の3段バリデーションを実装する。

- [ ] **3-1**: `typeof` チェック（型チェック）
- [ ] **3-2**: `=== ""` チェック（空文字列チェック）
- [ ] **3-3**: `.trim() === ""` チェック（トリム空文字列チェック）

```typescript
// P42準拠3段バリデーション標準パターン
if (
  typeof skillName !== "string" ||
  skillName === "" ||
  skillName.trim() === ""
) {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillName must be a non-empty string",
  };
}
```

### Phase 4: 型定義同期（P23/P32準拠）

型定義変更がある場合、以下のファイルを同時に更新する。

- [ ] **4-1**: `packages/shared/src/types/` 配下の shared transport DTO（共有型定義）
- [ ] **4-2**: `apps/desktop/src/preload/types.ts`（shared 型の import / re-export を優先）
- [ ] **4-3**: Renderer 側で参照する slice / component / test の型注釈
- [ ] **4-4**: `pnpm typecheck` で型整合性を検証
- [ ] **4-5**: contract test で `IPCResponse<T>` / event payload shape を固定する

### Phase 5: 仕様書同期

コード変更に対応する仕様書を更新する。

- [ ] **5-1**: `api-ipc-system.md` または対象 `api-ipc-*.md` のチャネル仕様更新
- [ ] **5-2**: 対応する `interfaces-*.md`（例: auth は `interfaces-auth.md`）の型定義・API仕様更新
- [ ] **5-3**: `security-electron-ipc.md` または `security-skill-ipc.md` の検証テーブル更新
- [ ] **5-4**: `error-handling.md` の error envelope / error code 更新（該当する場合）
- [ ] **5-5**: `indexes/quick-reference.md` に早見表として載せるべき channel / DTO が増えたか確認
- [ ] **5-6**: `lessons-learned.md` に苦戦箇所を記録（該当する場合）
- [ ] **5-7**: 戻り値型がRendererの期待する型と一致することを確認（例: `skill:import` は `ImportedSkill` を返すこと。`ImportResult` ではない）

### CC-7: Renderer コンポーネントの IPC レスポンス防御（06-TASK 追加・拡充）

IPC経由で配列を含むオブジェクトを受け取る全 Renderer コンポーネントに適用する。

| チェック | 確認事項                                                                                      |
| -------- | --------------------------------------------------------------------------------------------- |
| CC-7-1   | `window.electronAPI?.xxx` の存在確認がある                                                    |
| CC-7-2   | `result?.success` と `result?.data` の二重チェックがある                                      |
| CC-7-3   | 配列フィールドに `Array.isArray()` ガードがある                                               |
| CC-7-4   | 配列要素に type predicate + `.filter()` がある（P49準拠: `in` 演算子使用、`as` キャスト禁止） |
| CC-7-5   | フォールバック UI（エラーメッセージ/空状態表示）がある                                        |
| CC-7-6   | try-catch で reject をハンドリングしている                                                    |
| CC-7-7   | non-null assertion (`!`) を使用していない（P48準拠）                                          |

**適用条件**: IPC経由で配列を含むオブジェクトを受け取る全 Renderer コンポーネント

**検出コマンド**:

```bash
# non-null assertion の使用箇所を検出（CC-7-7）
rg -n "result\.data!" apps/desktop/src/renderer
rg -n "\.data!\." apps/desktop/src/renderer

# Array.isArray ガード漏れの検出（CC-7-3）
rg -n "\.providers|\.items|\.skills" apps/desktop/src/renderer | rg -v "Array\.isArray"
```

**テストパターン**: [testing-component-patterns.md セクション15](./testing-component-patterns.md#15-ipc-レスポンス異常値テストパターンtask-fix-settings-apikey-contract-guard-001) の4カテゴリで検証

**関連タスク**: TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001
**関連Pitfall**: P48（non-null assertion禁止）、P49（type predicate の `in` 演算子使用）

### Phase 6: テスト検証

- [ ] **6-1**: 変更対象のテストファイルを実行し全PASS確認
- [ ] **6-2**: 正常系テスト（有効な引数での成功パス）
- [ ] **6-3**: 異常系テスト（無効な引数でのバリデーションエラー）
  - 型不一致（数値、null、undefined）
  - 空文字列 `""`
  - スペースのみ `"   "`（P42検証）
- [ ] **6-4**: セキュリティテスト（sender検証、パストラバーサル検証）
- [ ] **6-5**: fallback経路（外部依存未設定時）の回帰テストを追加/更新し、戻り値契約を固定

---

## 契約ドリフト検出コマンド

IPC契約の整合性を手動で確認する際のコマンド集。

### 引数命名の不一致検出

```bash
# ハンドラーとPreloadで同一チャネルの request / response / event が異なるか確認
rg -n "auth-mode|get\\(|status\\(|validate\\(|onModeChanged|skill:remove|SKILL_REMOVE" \
  apps/desktop/src/main/ipc \
  apps/desktop/src/preload \
  apps/desktop/src/renderer
```

### ハードコード文字列の検出

```bash
# safeInvoke/safeOn でIPC_CHANNELS定数を使用していない箇所を検出
rg -n "safeInvoke|safeOn" apps/desktop/src/preload | rg -v "IPC_CHANNELS"
```

### バリデーション漏れの検出

```bash
# .trim() を使用していないバリデーション箇所を検出
rg -n "typeof .*string|=== \\\"\\\"" apps/desktop/src/main/ipc | rg -v "trim"
```

---

## 関連ドキュメント

| ドキュメント                                                                         | 関連性                            |
| ------------------------------------------------------------------------------------ | --------------------------------- |
| [security-skill-ipc.md](./security-skill-ipc.md)                                     | IPCチャネル検証テーブル（正本）   |
| [security-electron-ipc.md](./security-electron-ipc.md)                               | IPC全般のセキュリティ原則         |
| [interfaces-agent-sdk-skill.md](./interfaces-agent-sdk-skill.md)                     | SkillAPI型定義・統一API仕様       |
| [lessons-learned.md](./lessons-learned.md)                                           | 実装苦戦箇所の詳細記録            |
| [architecture-implementation-patterns.md](./architecture-implementation-patterns.md) | 実装パターン集（S1: API二重定義） |
| [skill-creator patterns.md](../../skill-creator/references/patterns.md)              | IPC契約ドリフト防止パターン       |
| [06-known-pitfalls.md](../../../rules/06-known-pitfalls.md)                          | P23/P32/P42/P44 の詳細と解決策    |

---

## 適用事例

| タスクID                                    | チャネル       | ドリフト内容                                                                                       | 解決方法                                                                                                                                                                                                          |
| ------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UT-FIX-SKILL-REMOVE-INTERFACE-001           | `skill:remove` | ハンドラー `{ skillId }` vs Preload `skillName: string`                                            | ハンドラーを `skillName: string` に統一                                                                                                                                                                           |
| UT-FIX-SKILL-IMPORT-INTERFACE-001           | `skill:import` | ハンドラー `{ skillIds: string[] }` vs Preload `skillName: string`                                 | ハンドラーを `skillName: string` に統一、内部で `[skillName]` 配列化                                                                                                                                              |
| UT-FIX-SKILL-IMPORT-RETURN-TYPE-001         | `skill:import` | 戻り値型が `ImportResult` だが Renderer は `ImportedSkill` を期待                                  | 完了（2026-02-21）: ハンドラーを2ステップ変換（`importSkills` → `getSkillByName`）に修正。記録: `docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-task-ut-fix-skill-import-return-type-001.md` |
| UT-IPC-AUTH-HANDLE-DUPLICATE-001            | `auth:*`       | 通常経路/ fallback経路で `ipcMain.handle` 登録式が重複し監査ノイズ化                               | 共通登録ヘルパー + fallback配列登録へ集約し、AUTH 5チャネル回帰テストで契約固定                                                                                                                                   |
| TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001   | `auth-mode:*`  | Main / Preload / Renderer が `get/status/validate/changed` で別shapeを持ち、error code も分裂      | `packages/shared/src/types/auth-mode.ts` を正本化し、`IPCResponse<T>` / `AuthModeStatus` / event payload を import / re-export に統一                                                                             |
| TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 | `api-key:list` | Renderer側で `result.data!.providers` の non-null assertion 使用、配列要素の type predicate 未実装 | CC-7 を3項目→7項目に拡充。`Array.isArray` + P49準拠 type predicate + P48準拠 non-null assertion 禁止でRendererの防御を標準化                                                                                      |
| TASK-UI-02 | `CONFIGURE_API` / `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED` | `SkillCreatorIpcBridge` と `creatorHandlers.ts` の両方にハンドラーが分散し、Session IPC と Runtime IPC で同チャンネルを処理する構造が発生 | `SkillCreatorIpcBridge` の責務を `SKILL_CREATOR_SESSION_START` / `SKILL_CREATOR_SESSION_ANSWER` のみに限定。`CONFIGURE_API` / `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED` を `creatorHandlers.ts` へ一元移管し、`ALLOWED_INVOKE_CHANNELS` whitelist を `preload/channels.ts` に同期 |

---

## Skill Creator IPC ハンドラー scope 分離マトリクス（TASK-UI-02）

IPC チャンネルを Session scope と Runtime scope の2軸で管理する。

| チャンネル | scope | 正本ハンドラー | 備考 |
| --- | --- | --- | --- |
| `SKILL_CREATOR_SESSION_START` | Session | `SkillCreatorIpcBridge` | セッション起動専任 |
| `SKILL_CREATOR_SESSION_ANSWER` | Session | `SkillCreatorIpcBridge` | 回答受信専任 |
| `CONFIGURE_API` | Runtime | `creatorHandlers.ts` | TASK-UI-02 で Session → Runtime へ移管 |
| `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED` | Runtime | `creatorHandlers.ts` | TASK-UI-02 で Session → Runtime へ移管 |
| `SKILL_CREATOR_OUTPUT_READY` | Runtime event | `creatorHandlers.ts` | 既存 Runtime 管理 |
| `SKILL_CREATOR_OPEN_SKILL` | Runtime event | `creatorHandlers.ts` | 既存 Runtime 管理 |

### whitelist 登録確認（ALLOWED_INVOKE_CHANNELS）

`CONFIGURE_API` / `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED` が `preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` に登録されていることを確認する。

```bash
# whitelist 登録確認コマンド
grep -n "CONFIGURE_API\|SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED" apps/desktop/src/preload/channels.ts
```

**SSoT reference**: `packages/shared/src/ipc/channels.ts` の `SKILL_CREATOR_EXTERNAL_API_CHANNELS` が正本。`preload/channels.ts` の whitelist は shared 正本と同期していること（関連未タスク: UT-TASK06-007）。

---

## 自動検出ツール（UT-TASK06-007）

手動チェックリストに加え、以下の自動検出スクリプトで IPC 契約ドリフトを検証可能:

```bash
# レポートモード（常に exit 0）
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only

# 厳格モード（不一致検出時 exit 1）
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --strict

# JSON出力
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only --format json
```

自動検出対象ルール:
- **R-01**: チャンネル孤児（Main/Preloadの片方にのみ存在）- warning
- **R-02**: 引数形式不一致（P44パターン）- error
- **R-03**: チャンネル名ハードコード（P27パターン）- warning
- **R-04**: 定数定義済みだが Main 未登録のチャンネル - error

2026-03-19 再監査時点の補足:
- preload 抽出は `safeInvoke<T>` / `safeOn<T>` と複数行呼び出しに対応済み
- チャンネル解決は `IPC_CHANNELS` に限定されず、複数 const object を収集する
- ただし event parity と alias/re-export/dynamic const は follow-up 管理とする

既知の制約: タプル配列経由ハンドラ（`[IPC_CHANNELS.XXX, handler]` 形式）は未抽出で、event channel parity もノイズを残す。

### 将来拡張（未タスク）

- [UT-TASK06-007-EXT-001](../../../docs/30-workflows/unassigned-task/ut-task06-007-ext-001-tuple-array-handler-extraction.md): タプル配列経由ハンドラ抽出（`[IPC_CHANNELS.XXX, handler]` 形式の約108件未抽出を解消）
- [UT-TASK06-007-EXT-002](../../../docs/30-workflows/unassigned-task/ut-task06-007-ext-002-multi-channel-const-resolution.md): エイリアス / 再export / 動的定数のチャンネル解決強化
- [UT-TASK06-007-EXT-003](../../../docs/30-workflows/unassigned-task/ut-task06-007-ext-003-ipc-on-pattern-enhancement.md): ipcMain.on検証強化（`ipcMain.on` と `safeOn` の照合精度向上）
- [UT-TASK06-007-EXT-004](../../../docs/30-workflows/unassigned-task/ut-task06-007-ext-004-script-modular-split.md): check-ipc-contracts.ts モジュール分割リファクタリング（C-04制約対応、578行→モジュール分割）
- [UT-TASK06-007-EXT-005](../../../docs/30-workflows/unassigned-task/ut-task06-007-ext-005-r02-semantic-precision.md): R-02 セマンティクスチェック精度向上（偽陽性削減・P45自動検出）
