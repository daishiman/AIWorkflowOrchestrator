# Phase 5: 実装（TDD Green）

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 5                  |
| Phase名    | 実装               |
| 前提Phase  | Phase 4            |
| 後続Phase  | Phase 6            |
| ステータス | 未実施             |
| 作成日     | 2026-02-01         |
| 機能名     | TASK-8A 単体テスト |

## 目的

Phase 4で作成したテストスタブにテストロジックを実装し、全テストを通過（Green）させる。

## 背景

TDD Green Phaseでは、テストを通過させるための最小限のテストロジック実装を行う。本タスクでは「テスト対象コード」は既に実装済みのため、テストコード自体のロジック（モックの設定、アサーション、テストデータの準備）を実装する。

## 実行タスク

### Task 1: SkillScanner テスト実装

**目的**: SkillScanner の10テストケースすべてにテストロジックを実装する。

**実行手順**:

1. `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts` を開く
2. Phase 4で追加したスタブに対して、以下のパターンでテストロジックを実装する：
   - **SS-01**: `vi.mocked(fs.readdir).mockRejectedValue(new Error("ENOENT"))` → `expect(result).toEqual([])`
   - **SS-02**: `vi.mocked(fs.readdir).mockResolvedValue([ディレクトリエントリ])` → `expect(result.length).toBe(2)`
   - **SS-03**: `vi.mocked(fs.readFile).mockRejectedValue(new Error("ENOENT"))` → `expect(result).toEqual([])`
   - **SS-04**: `vi.mocked(fs.readFile).mockResolvedValue(YAML文字列)` → `expect(result!.allowedTools).toEqual([...])`
   - **SS-05**: `vi.mocked(fs.readdir).mockResolvedValueOnce([agentファイル])` → `expect(result!.agents.length).toBe(N)`
   - **SS-06**: `vi.mocked(fs.readFile).mockResolvedValue(不正YAML)` → `expect(result).toBeNull()`
   - **SS-07**: 正常なfrontmatterとbodyの分離テスト
   - **SS-08**: frontmatterなしの場合に空オブジェクトが返ることのテスト
   - **SS-09**: Markdownからの説明抽出テスト
   - **SS-10**: `scanSubDirectory` のファイルリスト返却テスト
3. 各テスト実行後、`pnpm --filter @repo/desktop vitest run SkillScanner.test.ts` で通過を確認する

**期待される成果物**:

- `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts`（更新）

### Task 2: SkillImportManager テスト実装

**目的**: SkillImportManager の8テストケースすべてにテストロジックを実装する。

**実行手順**:

1. `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.test.ts` を開く
2. Phase 4で追加したスタブに対して、以下のパターンでテストロジックを実装する：
   - **SIM-01**: モックストアから全スキルを取得し `expect(result).toEqual(mockSkills)` で検証
   - **SIM-02**: モックストアが空の場合に空配列が返ることを検証
   - **SIM-03**: `add` 呼び出し後にストアの `set` が正しい引数で呼ばれることを検証
   - **SIM-04**: 既存スキルと同名の `add` で `expect(() => ...).toThrow()` を検証
   - **SIM-05**: `remove` 呼び出し後にストアの `set` から対象スキルが除外されていることを検証
   - **SIM-06**: `exists` が既存スキル名に対して `true` を返すことを検証
   - **SIM-07**: `exists` が未知のスキル名に対して `false` を返すことを検証
   - **SIM-08**: `update` 呼び出し後にストアのデータが更新されていることを検証
3. 各テスト実行後、`pnpm --filter @repo/desktop vitest run SkillImportManager.test.ts` で通過を確認する

**期待される成果物**:

- `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.test.ts`（更新）

### Task 3: SkillExecutor テスト実装

**目的**: SkillExecutor の8テストケースすべてにテストロジックを実装する。

**実行手順**:

1. `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts` を開く
2. Phase 4で追加したスタブに対して、以下のパターンでテストロジックを実装する：
   - **SE-01**: `execute` 呼び出し後に `result.executionId` が文字列であることを検証
   - **SE-02**: 存在しないスキル名で `expect(...).rejects.toThrow("Skill not found")` を検証
   - **SE-03**: `abort(executionId)` が `true` を返すことを検証
   - **SE-04**: `abort("invalid-id")` が `false` を返すことを検証
   - **SE-05**: `buildPrompt` の戻り値にスキル名・説明・ユーザー入力が含まれることを検証
   - **SE-06**: `buildContextInfo` の戻り値にagents/references情報が含まれることを検証
   - **SE-07**: `createHooks` が PreToolUse/PostToolUse のフック関数を持つオブジェクトを返すことを検証
   - **SE-08**: `handlePermissionResponse` がPermissionResolverの `resolveRequest` を呼び出すことを検証
3. SDK モック（`@anthropic-ai/claude-agent-sdk`）のセットアップが正しいことを確認する
4. 各テスト実行後、`pnpm --filter @repo/desktop vitest run SkillExecutor.test.ts` で通過を確認する

**期待される成果物**:

- `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts`（更新）

### Task 4: PermissionResolver テスト実装

**目的**: PermissionResolver の6テストケースすべてにテストロジックを実装する。

**実行手順**:

1. `apps/desktop/src/main/services/skill/__tests__/PermissionResolver.test.ts` を開く
2. Phase 4で追加したスタブに対して、以下のパターンでテストロジックを実装する：
   - **PR-01**: `waitForResponse` のPromiseが `resolveRequest` 呼び出し後に解決することを検証
   - **PR-02**: `AbortController.abort()` 後に `waitForResponse` のPromiseが拒否されることを検証
   - **PR-03**: `resolveRequest(id, true, true)` で `result.rememberChoice === true` を検証
   - **PR-04**: `resolveRequest` が保留中リクエストに対して `true` を返すことを検証
   - **PR-05**: `resolveRequest` が未知のIDに対して `false` を返すことを検証
   - **PR-06**: `hasPending` が保留中リクエスト存在時に `true` を返すことを検証
3. `vi.useFakeTimers()` / `vi.useRealTimers()` の設定が正しいことを確認する
4. 各テスト実行後、`pnpm --filter @repo/desktop vitest run PermissionResolver.test.ts` で通過を確認する

**期待される成果物**:

- `apps/desktop/src/main/services/skill/__tests__/PermissionResolver.test.ts`（更新）

### Task 5: skillSlice テスト実装

**目的**: skillSlice の12テストケースすべてにテストロジックを実装する。

**実行手順**:

1. `apps/desktop/src/renderer/store/slices/__tests__/skillSlice.test.ts` を開く
2. Phase 4で追加したスタブに対して、以下のパターンでテストロジックを実装する：
   - **SKS-01**: 初期状態の各フィールド（`availableSkills`, `importedSkills`, `selectedSkillName`, `isExecuting`, `executionStatus`）が正しいことを検証
   - **SKS-02**: `fetchSkills` 成功時に `set` が `availableSkills`/`importedSkills` で呼ばれることを検証
   - **SKS-03**: `fetchSkills` エラー時に `set` が `skillError` を含むオブジェクトで呼ばれることを検証
   - **SKS-04**: `importSkill` 成功時に `set` が `isImporting: true` で呼ばれることを検証
   - **SKS-05**: `importSkill` エラー時にエラーメッセージがセットされることを検証
   - **SKS-06**: `removeSkill` 成功時にstateから対象スキルが除外されることを検証
   - **SKS-07**: `selectSkill("name")` で `set` が `{ selectedSkillName: "name" }` で呼ばれることを検証
   - **SKS-08**: `selectSkill(null)` で `set` が `{ selectedSkillName: null }` で呼ばれることを検証
   - **SKS-09**: `selectedSkillName` が null の状態で `executeSkill` を呼ぶと `mockSkillAPI.execute` が呼ばれないことを検証
   - **SKS-10**: `_handleStreamMessage` で `set` が関数引数で呼ばれることを検証
   - **SKS-11**: `_handleComplete` で `isExecuting: false` がセットされることを検証
   - **SKS-12**: `_handlePermissionRequest` で `pendingPermission` と `executionStatus: "permission_pending"` がセットされることを検証
3. `window.electronAPI.skill` のモックが既存パターンと整合していることを確認する
4. 各テスト実行後、`pnpm --filter @repo/desktop vitest run skillSlice.test.ts` で通過を確認する

**期待される成果物**:

- `apps/desktop/src/renderer/store/slices/__tests__/skillSlice.test.ts`（更新）

### Task 6: 全テスト一括実行確認

**目的**: 全44テストケースが通過することを確認する。

**実行手順**:

1. 以下のコマンドで対象5ファイルのテストを一括実行する：
   ```bash
   pnpm --filter @repo/desktop vitest run \
     src/main/services/skill/__tests__/SkillScanner.test.ts \
     src/main/services/skill/__tests__/SkillImportManager.test.ts \
     src/main/services/skill/__tests__/SkillExecutor.test.ts \
     src/main/services/skill/__tests__/PermissionResolver.test.ts \
     src/renderer/store/slices/__tests__/skillSlice.test.ts
   ```
2. 全テストが通過（Green）していることを確認する
3. 失敗テストがある場合、原因を特定し修正する
4. 実行結果を `outputs/phase-5/implementation-summary.md` に記録する

**期待される成果物**:

- `outputs/phase-5/implementation-summary.md`

## 参照資料

| 参照資料               | パス                                                         | 説明                 |
| ---------------------- | ------------------------------------------------------------ | -------------------- |
| テスト仕様書           | `outputs/phase-4/test-specification.md`                      | 追加テストケース一覧 |
| テスト設計書           | `outputs/phase-2/test-design.md`                             | Given-When-Then設計  |
| モック戦略             | `outputs/phase-2/mock-strategy.md`                           | モック手法           |
| SkillScanner実装       | `apps/desktop/src/main/services/skill/SkillScanner.ts`       | テスト対象           |
| SkillImportManager実装 | `apps/desktop/src/main/services/skill/SkillImportManager.ts` | テスト対象           |
| SkillExecutor実装      | `apps/desktop/src/main/services/skill/SkillExecutor.ts`      | テスト対象           |
| PermissionResolver実装 | `apps/desktop/src/main/services/skill/PermissionResolver.ts` | テスト対象           |
| skillSlice実装         | `apps/desktop/src/renderer/store/slices/skillSlice.ts`       | テスト対象           |

## 成果物

| 成果物                    | パス                                                                        | タイプ   | 説明               |
| ------------------------- | --------------------------------------------------------------------------- | -------- | ------------------ |
| SkillScanner テスト       | `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts`       | code     | テストロジック実装 |
| SkillImportManager テスト | `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.test.ts` | code     | テストロジック実装 |
| SkillExecutor テスト      | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts`      | code     | テストロジック実装 |
| PermissionResolver テスト | `apps/desktop/src/main/services/skill/__tests__/PermissionResolver.test.ts` | code     | テストロジック実装 |
| skillSlice テスト         | `apps/desktop/src/renderer/store/slices/__tests__/skillSlice.test.ts`       | code     | テストロジック実装 |
| 実装サマリー              | `outputs/phase-5/implementation-summary.md`                                 | document | テスト実行結果記録 |

## 統合テスト連携

- 単体テストの実行が統合テスト（TASK-8B）の実行に影響しないことを確認する
- テスト実行順序を確認し、単体テストが独立して実行可能であることを保証する

## 完了条件

- [ ] 44テストケースすべてにテストロジックが実装されている
- [ ] 全44テストが通過（Green）している
- [ ] 既存テストが1件も失敗していない
- [ ] 各テストに `any` 型が使用されていない
- [ ] テスト実行結果が `outputs/phase-5/` に記録されている

## Phase末端アクション【必須】

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow "docs/30-workflows/skill-import-agent-system/TASK-8A" \
  --phase 5 \
  --artifacts "outputs/phase-5/implementation-summary.md:実装サマリー"
```

## 依存関係

| 項目      | 内容    |
| --------- | ------- |
| 前提Phase | Phase 4 |
| 後続Phase | Phase 6 |

## 次のPhase

→ [phase-6-test-expansion.md](phase-6-test-expansion.md)
