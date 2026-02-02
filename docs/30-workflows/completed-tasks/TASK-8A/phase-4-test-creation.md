# Phase 4: テスト作成（TDD Red）

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 4                  |
| Phase名    | テスト作成         |
| 前提Phase  | Phase 3            |
| 後続Phase  | Phase 5            |
| ステータス | 未実施             |
| 作成日     | 2026-02-01         |
| 機能名     | TASK-8A 単体テスト |

## 目的

Phase 2のテスト設計に基づき、不足テストケースのスタブ（失敗する状態）を作成する。TDD Red Phaseとして、テストが正しく失敗することを確認する。

## 背景

TASK-8Aは既存テストの補完タスクであるため、Phase 4では新規テストファイル作成ではなく、既存テストファイルへの追加が主な作業となる。既存テストを壊さず、不足テストケースのみを追加する。

## 実行タスク

### Task 1: SkillScanner テストスタブ追加

**目的**: SkillScannerの不足テストケース（Phase 1ギャップ分析で特定済み）のスタブを作成する。

**実行手順**:

1. `outputs/phase-1/gap-analysis.md` から SkillScanner の「未カバー」「部分カバー」テストケースを確認する
2. `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts` を開く
3. 以下のテストケースのうち、不足分を `describe` / `it` ブロックとして追加する：
   - SS-01: `scanAll` - 空ディレクトリ（`fs.readdir` が ENOENT を返す場合に空配列を返す）
   - SS-02: `scanAll` - 複数スキルスキャン（2つ以上のスキルディレクトリを正しく検出する）
   - SS-03: `scanAll` - SKILL.mdなしスキップ（SKILL.mdが存在しないディレクトリをスキップする）
   - SS-04: `parseSkill` - Frontmatterパース（YAML frontmatterから `allowedTools` を正しく抽出する）
   - SS-05: `parseSkill` - サブディレクトリスキャン（`agents/` 内のファイルを検出する）
   - SS-06: `parseSkill` - エラーハンドリング（不正なYAMLでエラーをスローせず null を返す）
   - SS-07: `parseFrontmatter` - 正常パース（frontmatterとbodyを正しく分離する）
   - SS-08: `parseFrontmatter` - Frontmatterなし（frontmatter がない場合に空オブジェクトを返す）
   - SS-09: `extractDescription` - 説明抽出（Markdownの最初の段落を説明として抽出する）
   - SS-10: `scanSubDirectory` - ファイル一覧（指定ディレクトリ内のファイルをリスト化する）
4. 各テストスタブは `it("...", async () => { /* TODO: Phase 5で実装 */ })` の形式で作成する
5. 既存テストの `describe` 構造を壊さないよう、適切な位置に追加する

**期待される成果物**:

- `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts`（更新）

### Task 2: SkillImportManager テストスタブ追加

**目的**: SkillImportManagerの不足テストケースのスタブを作成する。

**実行手順**:

1. `outputs/phase-1/gap-analysis.md` から SkillImportManager の不足テストケースを確認する
2. `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.test.ts` を開く
3. 以下のテストケースのうち、不足分を追加する：
   - SIM-01: `get` - 全スキル取得（インポート済みスキル一覧を返す）
   - SIM-02: `get` - 空配列（スキルが未インポートの場合に空配列を返す）
   - SIM-03: `add` - 新規スキル追加（新しいスキルをストアに追加する）
   - SIM-04: `add` - 重複防止（同名スキルの追加でエラーをスローする）
   - SIM-05: `remove` - スキル削除（指定スキルをストアから削除する）
   - SIM-06: `exists` - 存在確認 true（インポート済みスキルで true を返す）
   - SIM-07: `exists` - 存在確認 false（未インポートスキルで false を返す）
   - SIM-08: `update` - スキル更新（既存スキルのメタデータを更新する）
4. 元仕様書では `SkillImportStore` と記載されているが、実装は `SkillImportManager` であるため、既存の `SkillImportManager.test.ts` に追加する

**期待される成果物**:

- `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.test.ts`（更新）

### Task 3: SkillExecutor テストスタブ追加

**目的**: SkillExecutorの不足テストケースのスタブを作成する。

**実行手順**:

1. `outputs/phase-1/gap-analysis.md` から SkillExecutor の不足テストケースを確認する
2. `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts` を開く
3. 以下のテストケースのうち、不足分を追加する：
   - SE-01: `execute` - 実行ID返却（execute が一意の executionId を返す）
   - SE-02: `execute` - スキル未発見エラー（存在しないスキル名で例外をスローする）
   - SE-03: `abort` - 実行中止（実行中のタスクを正常に中止し true を返す）
   - SE-04: `abort` - 存在しない実行（無効な executionId で false を返す）
   - SE-05: `buildPrompt` - プロンプト構築（スキル情報とユーザー入力を結合したプロンプトを生成する）
   - SE-06: `buildContextInfo` - コンテキスト構築（スキルのagents/references情報をコンテキストに含める）
   - SE-07: `createHooks` - Hooks作成（PreToolUse/PostToolUse のフック関数を生成する）
   - SE-08: `handlePermissionResponse` - 権限応答（PermissionResolver経由で権限応答を処理する）
4. SkillExecutor は `@anthropic-ai/claude-agent-sdk` をモックする必要があるため、既存のモック設定との整合性を確認する

**期待される成果物**:

- `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts`（更新）

### Task 4: PermissionResolver テストスタブ追加

**目的**: PermissionResolverの不足テストケースのスタブを作成する。

**実行手順**:

1. `outputs/phase-1/gap-analysis.md` から PermissionResolver の不足テストケースを確認する
2. `apps/desktop/src/main/services/skill/__tests__/PermissionResolver.test.ts` を開く
3. 以下のテストケースのうち、不足分を追加する：
   - PR-01: `waitForResponse` - 応答受信（resolveRequest で応答を返すと Promise が解決する）
   - PR-02: `waitForResponse` - アボート（AbortController.abort() で Promise が拒否される）
   - PR-03: `waitForResponse` - 記憶選択（`rememberChoice: true` で応答を返す）
   - PR-04: `resolveRequest` - リクエスト解決（保留中リクエストを解決し true を返す）
   - PR-05: `resolveRequest` - 存在しないリクエスト（無効な requestId で false を返す）
   - PR-06: `hasPending` - 保留中確認（保留中のリクエストがある場合 true を返す）
4. PermissionResolver は外部依存がないため、モックは不要。`vi.useFakeTimers()` のみ使用する

**期待される成果物**:

- `apps/desktop/src/main/services/skill/__tests__/PermissionResolver.test.ts`（更新）

### Task 5: skillSlice テストスタブ追加

**目的**: skillSliceの不足テストケースのスタブを作成する。

**実行手順**:

1. `outputs/phase-1/gap-analysis.md` から skillSlice の不足テストケースを確認する
2. `apps/desktop/src/renderer/store/slices/__tests__/skillSlice.test.ts` を開く
3. 以下のテストケースのうち、不足分を追加する：
   - SKS-01: initial state（初期状態が正しい値を持つ）
   - SKS-02: `fetchSkills` - 成功（available/imported スキルを取得しstateを更新する）
   - SKS-03: `fetchSkills` - エラー（APIエラー時に skillError をセットする）
   - SKS-04: `importSkill` - 成功（スキルをインポートしstateを更新する）
   - SKS-05: `importSkill` - エラー（インポート失敗時にエラーをセットする）
   - SKS-06: `removeSkill` - 成功（スキルを削除しstateを更新する）
   - SKS-07: `selectSkill` - スキル選択（selectedSkillName を更新する）
   - SKS-08: `selectSkill` - null選択（selectedSkillName を null にリセットする）
   - SKS-09: `executeSkill` - スキル未選択時（selectedSkillName が null の場合 execute を呼ばない）
   - SKS-10: `_handleStreamMessage` - メッセージ追加（streamingMessages にメッセージを追加する）
   - SKS-11: `_handleComplete` - 完了処理（isExecuting を false にし executionStatus を更新する）
   - SKS-12: `_handlePermissionRequest` - 権限リクエスト（pendingPermission をセットする）
4. `window.electronAPI.skill` のモックは既存テストのパターンを踏襲する

**期待される成果物**:

- `apps/desktop/src/renderer/store/slices/__tests__/skillSlice.test.ts`（更新）

### Task 6: テスト仕様書作成

**目的**: Phase 4で作成・更新したテストスタブの一覧を記録する。

**実行手順**:

1. Task 1-5で追加したテストスタブを集計する
2. 以下の情報を含むテスト仕様書を作成する：
   - 追加テストケース数（モジュール別）
   - 各テストケースのファイルパスと行番号
   - Red状態の確認結果（テストが正しく失敗すること）
3. `outputs/phase-4/test-specification.md` に出力する

**期待される成果物**:

- `outputs/phase-4/test-specification.md`

## 参照資料

| 参照資料                       | パス                                                                        | 説明                   |
| ------------------------------ | --------------------------------------------------------------------------- | ---------------------- |
| テスト設計書                   | `outputs/phase-2/test-design.md`                                            | テスト構造・ケース設計 |
| モック戦略                     | `outputs/phase-2/mock-strategy.md`                                          | モック手法             |
| ギャップ分析                   | `outputs/phase-1/gap-analysis.md`                                           | 追加テスト要件         |
| 設計レビュー結果               | `outputs/phase-3/design-review-result.md`                                   | レビュー指摘の反映     |
| 既存 SkillScanner テスト       | `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts`       | 追加先                 |
| 既存 SkillImportManager テスト | `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.test.ts` | 追加先                 |
| 既存 SkillExecutor テスト      | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts`      | 追加先                 |
| 既存 PermissionResolver テスト | `apps/desktop/src/main/services/skill/__tests__/PermissionResolver.test.ts` | 追加先                 |
| 既存 skillSlice テスト         | `apps/desktop/src/renderer/store/slices/__tests__/skillSlice.test.ts`       | 追加先                 |
| 既存テスト監査結果             | `outputs/phase-1/existing-test-audit.md`                                    | Phase 1 成果物         |
| 受け入れ基準                   | `outputs/phase-1/acceptance-criteria.md`                                    | Phase 1 成果物         |
| モジュール分析                 | `outputs/phase-1/module-analysis.md`                                        | Phase 1 成果物         |
| フィクスチャ設計               | `outputs/phase-2/fixture-design.md`                                         | Phase 2 成果物         |
| テストヘルパー設計             | `outputs/phase-2/test-helper-design.md`                                     | Phase 2 成果物         |

## 成果物

| 成果物                    | パス                                                                        | タイプ   | 説明             |
| ------------------------- | --------------------------------------------------------------------------- | -------- | ---------------- |
| SkillScanner テスト       | `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts`       | code     | テストスタブ追加 |
| SkillImportManager テスト | `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.test.ts` | code     | テストスタブ追加 |
| SkillExecutor テスト      | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts`      | code     | テストスタブ追加 |
| PermissionResolver テスト | `apps/desktop/src/main/services/skill/__tests__/PermissionResolver.test.ts` | code     | テストスタブ追加 |
| skillSlice テスト         | `apps/desktop/src/renderer/store/slices/__tests__/skillSlice.test.ts`       | code     | テストスタブ追加 |
| テスト仕様書              | `outputs/phase-4/test-specification.md`                                     | document | 追加テスト一覧   |

## 統合テスト連携

- 単体テストで作成するモックが統合テスト（TASK-8B, TASK-8C）と矛盾しないことを確認する
- テストヘルパーのうち統合テストでも使用可能なものを特定し、共有可能性を記録する

## 完了条件

- [ ] Phase 1ギャップ分析で特定された全ての不足テストケースのスタブが作成されている
- [ ] 追加テストスタブを含む状態で `pnpm --filter @repo/desktop vitest run` を実行し、追加テストが正しく失敗（Red）することを確認している
- [ ] 既存テストが1件も失敗していないことを確認している
- [ ] 各テストスタブに対応するテストケースID（SS-01等）がコメントで記載されている
- [ ] テスト仕様書が `outputs/phase-4/` に生成されている

## Phase末端アクション【必須】

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow "docs/30-workflows/skill-import-agent-system/TASK-8A" \
  --phase 4 \
  --artifacts "outputs/phase-4/test-specification.md:テスト仕様書"
```

## 依存関係

| 項目      | 内容    |
| --------- | ------- |
| 前提Phase | Phase 3 |
| 後続Phase | Phase 5 |

## 次のPhase

→ [phase-5-implementation.md](phase-5-implementation.md)
