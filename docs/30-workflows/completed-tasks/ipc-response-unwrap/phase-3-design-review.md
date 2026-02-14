# Phase 3: 設計レビュー - IPC レスポンスラッパー未展開修正

## メタ情報

| 項目         | 値                             |
| ------------ | ------------------------------ |
| Phase        | 3（設計レビュー）              |
| 機能名       | ipc-response-unwrap            |
| タスクID     | UT-FIX-IPC-RESPONSE-UNWRAP-001 |
| GitHub Issue | #816                           |
| 作成日       | 2026-02-14                     |
| 種別         | バグ修正 (fix)                 |

## 目的

Phase 1（要件定義）と Phase 2（設計）の成果物を入力として、要件-設計整合性、セキュリティ、型安全性、既知Pitfall対策の4観点で設計の妥当性を検証し、Phase 4（テスト作成）への進行可否を判定する。

## 実行タスク

| タスク | 内容                    |
| ------ | ----------------------- |
| Task 1 | 要件-設計整合性レビュー |
| Task 2 | セキュリティレビュー    |
| Task 3 | 型安全性レビュー        |
| Task 4 | 既知Pitfall対策レビュー |

## 参照資料

| 種別             | パス                                                                       |
| ---------------- | -------------------------------------------------------------------------- |
| Phase 1 成果物   | `docs/30-workflows/ipc-response-unwrap/phase-1-requirements.md`            |
| Phase 2 成果物   | `docs/30-workflows/ipc-response-unwrap/phase-2-design.md`                  |
| 元タスク仕様書   | `docs/30-workflows/completed-tasks/task-ut-fix-ipc-response-unwrap-001.md` |
| Preload API      | `apps/desktop/src/preload/skill-api.ts`                                    |
| IPC ハンドラ     | `apps/desktop/src/main/ipc/skillHandlers.ts`                               |
| セキュリティ仕様 | `security-api-electron.md`                                                 |
| IPC設計仕様      | `interfaces-agent-sdk-skill.md`                                            |
| 既知Pitfall      | `.claude/rules/06-known-pitfalls.md` P19, P23, P24                         |

## 実行手順

### Task 1: 要件-設計整合性レビュー

Phase 1 の7つの受入基準が Phase 2 の設計でカバーされているかを検証する。

| 基準ID | 受入基準                                             | 設計でのカバー状況                                                             | 判定     |
| ------ | ---------------------------------------------------- | ------------------------------------------------------------------------------ | -------- |
| AC-1   | `getImported()` が `ImportedSkill[]` を直接返す      | `safeInvokeUnwrap<ImportedSkill[]>(IPC_CHANNELS.SKILL_GET_IMPORTED)` で展開    | 確認対象 |
| AC-2   | `list()` が `SkillMetadata[]` を直接返す             | `safeInvokeUnwrap<SkillMetadata[]>(IPC_CHANNELS.SKILL_LIST)` で展開            | 確認対象 |
| AC-3   | `import()` が `ImportedSkill` を直接返す             | `safeInvokeUnwrap<ImportedSkill>(IPC_CHANNELS.SKILL_IMPORT, skillName)` で展開 | 確認対象 |
| AC-4   | `rescan()` が `SkillMetadata[]` を直接返す           | `safeInvokeUnwrap<SkillMetadata[]>(IPC_CHANNELS.SKILL_SCAN)` で展開            | 確認対象 |
| AC-5   | AgentView で `importedSkills.forEach` が正常動作する | Preload 層で配列を返すため、`forEach` 呼び出しが成功する                       | 確認対象 |
| AC-6   | 型注釈と実行時の値が一致する                         | `IpcResult<T>` と `safeInvokeUnwrap` により型推論が正しく機能する              | 確認対象 |
| AC-7   | 既存テストが全て PASS する                           | テスト修正方針が Phase 4 で対応予定                                            | 確認対象 |

#### スコープ逸脱チェック

以下のスコープ外項目が設計に混入していないことを確認する。

| スコープ外項目                                  | 混入していないか |
| ----------------------------------------------- | ---------------- |
| `skill.execute()` のレスポンス形式変更          | 確認対象         |
| Permission API のレスポンス形式変更             | 確認対象         |
| `agentSlice.ts` の `as unknown as Skill[]` 除去 | 確認対象         |
| IPC ハンドラ（`skillHandlers.ts`）の変更        | 確認対象         |

### Task 2: セキュリティレビュー

#### チャンネルホワイトリスト検証の維持

| チェック項目                                                                                       | 判定     |
| -------------------------------------------------------------------------------------------------- | -------- |
| `safeInvokeUnwrap` が内部で `safeInvoke` を呼び出し、ホワイトリスト検証が自動適用される            | 確認対象 |
| `safeInvokeUnwrap` が `ipcRenderer.invoke` を直接呼び出していない（バイパスなし）                  | 確認対象 |
| `safeInvokeUnwrap` が `ALLOWED_INVOKE_CHANNELS` チェックを独自に実装していない（二重チェック回避） | 確認対象 |

#### エラー情報漏洩防止

| チェック項目                                                                                   | 判定     |
| ---------------------------------------------------------------------------------------------- | -------- |
| `result.error` がスタックトレースを含む場合の伝播リスクが評価されている                        | 確認対象 |
| エラーメッセージに IPC チャンネル名（`channel`）を含めることのセキュリティ影響が評価されている | 確認対象 |
| Preload 層でのエラーサニタイズの要否が判断されている                                           | 確認対象 |

#### 確認ポイント

- `safeInvokeUnwrap` のエラーメッセージ `IPC call failed: ${channel}` にチャンネル名が含まれる。チャンネル名は `IPC_CHANNELS` 定数で定義されたアプリ内部の文字列であり、Renderer 側でも参照可能なため、情報漏洩リスクは低い。ただし、`result.error` にMain Process の内部パス情報が含まれる可能性について、IPC ハンドラ側のサニタイズ状況を確認する必要がある

### Task 3: 型安全性レビュー

#### ジェネリック型パラメータ `T` の正当性

| チェック項目                                                                                                          | 判定     |
| --------------------------------------------------------------------------------------------------------------------- | -------- |
| `safeInvokeUnwrap<T>` の `T` が `safeInvoke<IpcResult<T>>` の `IpcResult<T>.data` と一致する                          | 確認対象 |
| `IpcResult<T>` の `data` フィールドが `T` 型で正しく推論される                                                        | 確認対象 |
| 4メソッドの型パラメータ（`ImportedSkill[]`, `SkillMetadata[]`, `ImportedSkill`）が IPC ハンドラの実際の応答と一致する | 確認対象 |

#### `IpcResult<T>` 型の網羅性

| ハンドラ           | 応答形式                                   | `IpcResult<T>` でカバーされるか |
| ------------------ | ------------------------------------------ | ------------------------------- |
| SKILL_LIST         | `{ success: true, data: SkillMetadata[] }` | 確認対象                        |
| SKILL_GET_IMPORTED | `{ success: true, data: ImportedSkill[] }` | 確認対象                        |
| SKILL_SCAN         | `{ success: true, data: SkillMetadata[] }` | 確認対象                        |
| SKILL_IMPORT       | `skillService.importSkills()` の直接戻り値 | 確認対象（特殊ケース）          |
| エラーレスポンス   | `{ success: false, error?: string }`       | 確認対象                        |

#### SKILL_IMPORT 特殊ケースの対応

| チェック項目                                                                                                | 判定     |
| ----------------------------------------------------------------------------------------------------------- | -------- |
| SKILL_IMPORT ハンドラの実際の戻り値がラッパー形式か直接返却かが Phase 5 で確認予定であること                | 確認対象 |
| パターン A（ラッパー形式）の場合: `safeInvokeUnwrap<ImportedSkill>` で対応可能                              | 確認対象 |
| パターン B（直接返却）の場合: `import` メソッドのみ `safeInvoke` をそのまま使用する代替設計が記述されている | 確認対象 |
| パターン B の場合、`ImportResult` 型から `ImportedSkill` 型への変換ロジックの設計が必要                     | 確認対象 |

### Task 4: 既知Pitfall対策レビュー

#### P19: 型アサーション回避

| チェック項目                                                                            | 判定     |
| --------------------------------------------------------------------------------------- | -------- |
| `safeInvokeUnwrap` の実装に `as` 型アサーションが含まれていない                         | 確認対象 |
| `IpcResult<T>` へのキャストが TypeScript の型推論で処理される                           | 確認対象 |
| `safeInvoke<IpcResult<T>>` のジェネリック型指定が実行時検証を伴わない点が認識されている | 確認対象 |

#### P23: API 二重定義の型管理

| チェック項目                                                                                    | 判定     |
| ----------------------------------------------------------------------------------------------- | -------- |
| `skill-api.ts` のメソッド戻り値型と `preload/types.ts` の `SkillAPI` インターフェースが一致する | 確認対象 |
| `IpcResult<T>` 型が `preload/types.ts` に漏洩していない（ファイルスコープ）                     | 確認対象 |
| `pnpm typecheck` で型整合性を検証する手順が Phase 9 に含まれる                                  | 確認対象 |

#### P24: Store 型と Preload 型の不統一

| チェック項目                                                                                          | 判定     |
| ----------------------------------------------------------------------------------------------------- | -------- |
| `agentSlice.ts` の `as unknown as Skill[]` キャストがこのタスクのスコープ外であることが明記されている | 確認対象 |
| Preload 層の修正が Store 層の既存動作を破壊しないことが確認されている                                 | 確認対象 |
| `fetchSkills()` が `ImportedSkill[]`（配列）を受け取るため、`forEach` が正常動作する                  | 確認対象 |

## レビューゲート判定基準

### 判定基準

| 判定              | 条件                                                       | 対応              |
| ----------------- | ---------------------------------------------------------- | ----------------- |
| PASS              | Task 1-4 の全チェック項目がクリア                          | Phase 4 へ進む    |
| MINOR             | 軽微な修正（ドキュメント記述の補足、コメントの追加）が必要 | 修正後 Phase 4 へ |
| MAJOR（要件問題） | 受入基準の不備、スコープ定義の誤り                         | Phase 1 へ戻る    |
| MAJOR（設計問題） | `safeInvokeUnwrap` の設計不備、セキュリティ上の問題        | Phase 2 へ戻る    |

### MAJOR 判定のトリガー条件

以下のいずれかに該当する場合、MAJOR 判定とする:

| トリガー                                                                                         | 分類     |
| ------------------------------------------------------------------------------------------------ | -------- |
| 受入基準（AC-1 〜 AC-7）のいずれかが設計でカバーされていない                                     | 要件問題 |
| スコープ外の項目（`execute()`, Permission API, `agentSlice` のキャスト除去）が設計に混入している | 要件問題 |
| `safeInvokeUnwrap` がチャンネルホワイトリスト検証をバイパスする設計になっている                  | 設計問題 |
| `safeInvokeUnwrap` が `ipcRenderer.invoke` を直接呼び出す設計になっている                        | 設計問題 |
| エラーレスポンス時の振る舞い（例外スロー）が定義されていない                                     | 設計問題 |
| SKILL_IMPORT の特殊ケースへの対応方針が記述されていない                                          | 設計問題 |

### MINOR 判定の例

| 修正内容                                       |
| ---------------------------------------------- |
| JSDoc コメントの記述不足を補完                 |
| エラーメッセージのフォーマット調整             |
| テスト項目の追記（設計の本質に影響しない範囲） |

## 統合テスト連携

### Phase 3 での必須アクション

- [ ] SKILL_LIST / SKILL_GET_IMPORTED / SKILL_SCAN の3ハンドラが `{ success, data }` 形式で返却する前提を確認した
- [ ] SKILL_IMPORT がラッパーなし直接返却である前提を確認し、`import()` は `safeInvoke` のままにする判断を明記した
- [ ] Phase 4 テスト設計へ「ラッパー展開」と「直接返却」の両パターンを引き継ぐことを明記した

## 成果物

| 成果物                     | パス                                                             |
| -------------------------- | ---------------------------------------------------------------- |
| Phase 3 設計レビュー仕様書 | `docs/30-workflows/ipc-response-unwrap/phase-3-design-review.md` |
| レビュー判定結果           | 本仕様書の完了条件チェックリストに記録                           |

## 完了条件

- [ ] Task 1: 7つの受入基準（AC-1 〜 AC-7）全てが Phase 2 設計でカバーされていることを確認した
- [ ] Task 1: スコープ外の4項目（`execute()`, Permission API, `agentSlice` キャスト除去, IPC ハンドラ変更）が設計に混入していないことを確認した
- [ ] Task 2: `safeInvokeUnwrap` が `safeInvoke` 経由でチャンネルホワイトリスト検証を維持することを確認した
- [ ] Task 2: `safeInvokeUnwrap` が `ipcRenderer.invoke` を直接呼び出していないことを確認した
- [ ] Task 2: エラーメッセージの伝播におけるセキュリティリスクが評価された
- [ ] Task 3: ジェネリック型パラメータ `T` が `IpcResult<T>.data` と正しく一致することを確認した
- [ ] Task 3: `IpcResult<T>` 型が SKILL_LIST, SKILL_GET_IMPORTED, SKILL_SCAN, SKILL_IMPORT の全応答形式をカバーすることを確認した
- [ ] Task 3: SKILL_IMPORT の特殊ケース（ラッパーなし）への対応方針が確認された
- [ ] Task 4: P19（型アサーション回避）の対策が設計に含まれていることを確認した
- [ ] Task 4: P23（API二重定義の型管理）の対策が設計に含まれていることを確認した
- [ ] Task 4: P24（Store型定義不統一）への影響が評価されていることを確認した
- [ ] レビューゲート判定（PASS / MINOR / MAJOR）が記録された

## 次のPhase

レビューゲート判定結果に応じて遷移する:

| 判定              | 遷移先                                      |
| ----------------- | ------------------------------------------- |
| PASS              | Phase 4（テスト作成）へ進む                 |
| MINOR             | 修正対応後、Phase 4（テスト作成）へ進む     |
| MAJOR（要件問題） | Phase 1（要件定義）へ戻り、要件を再分析する |
| MAJOR（設計問題） | Phase 2（設計）へ戻り、設計を修正する       |
