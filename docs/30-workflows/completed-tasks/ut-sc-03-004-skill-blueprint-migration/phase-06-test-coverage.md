# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 6                                      |
| 機能名   | ut-sc-03-004-skill-blueprint-migration |
| タスクID | UT-SC-03-004                           |
| 作成日   | 2026-03-24                             |
| 更新日   | 2026-03-24                             |

## 目的

Phase 5 実装後のカバレッジ不足箇所を特定し、エッジケース・境界値・組み合わせテストを追加する。特に、Graceful degradation ロジック、バリデーションの境界条件、agents/scripts から files への自動生成ロジックのカバレッジを向上させる。Phase 7（カバレッジ確認）の基準を満たすことを目標とする。

## 実行タスク

### Task 1: カバレッジ計測と不足箇所の特定

1. **カバレッジ計測の実行**

   ```bash
   cd apps/desktop && pnpm vitest run --coverage src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts
   cd packages/shared && pnpm vitest run --coverage src/types/__tests__/skillCreator.type.test.ts
   ```

   - Line Coverage、Branch Coverage、Function Coverage の現在値を記録する
   - 未カバー行番号・分岐を特定する

2. **不足箇所のリストアップ**
   - `isValidPlanResponse()` の新フィールドバリデーション分岐
   - `parsePlanResponse()` の Graceful degradation 分岐
   - `generateFilesFromAgentsAndScripts()` のロジック
   - `isValidPlannedFileEntry()` のバリデーション分岐

### Task 2: category バリデーションのエッジケーステスト

**対象ファイル**: `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`

1. **category が無効な文字列の場合のバリデーション**
   - `category: "invalid-category"` でパースが失敗することを検証する
   - `category: "STANDARD"` (大文字) でパースが失敗することを検証する
   - `category: " standard "` (前後にスペース) でパースが失敗することを検証する
   - `category: ""` (空文字列) でパースが失敗することを検証する

2. **category が文字列以外の型の場合**
   - `category: 123` (数値) でパースが失敗することを検証する
   - `category: true` (boolean) でパースが失敗することを検証する
   - `category: null` の場合は Graceful degradation でデフォルト値が使われることを検証する
   - `category: undefined`（フィールド不在）の場合は Graceful degradation でデフォルト値が使われることを検証する

### Task 3: files バリデーションのエッジケーステスト

1. **files が空配列の場合**
   - `files: []` でパースが成功し、そのまま空配列が返ることを検証する

2. **files の各エントリのバリデーション**
   - `path` が空文字列 `""` のエントリでパースが失敗することを検証する
   - `path` がスペースのみ `"   "` のエントリでパースが失敗することを検証する（P42 準拠）
   - `purpose` が空文字列 `""` のエントリでパースが失敗することを検証する
   - `purpose` がスペースのみ `"   "` のエントリでパースが失敗することを検証する（P42 準拠）
   - `path` フィールドが欠落したエントリでパースが失敗することを検証する
   - `purpose` フィールドが欠落したエントリでパースが失敗することを検証する

3. **files が配列以外の型の場合**
   - `files: "not-an-array"` でパースが失敗することを検証する
   - `files: 123` でパースが失敗することを検証する
   - `files: null` の場合は Graceful degradation が適用されることを検証する

### Task 4: customizations のエッジケーステスト

1. **customizations の各サブフィールドが null/undefined の場合**
   - `customizations: { additionalDirectories: null }` でパースが成功することを検証する（optional フィールドのため）
   - `customizations: { additionalFiles: undefined }` でパースが成功することを検証する
   - `customizations: { excludedDefaults: null }` でパースが成功することを検証する

2. **customizations が不正な型の場合**
   - `customizations: "not-an-object"` でパースが失敗することを検証する
   - `customizations: 123` でパースが失敗することを検証する
   - `customizations: []` (配列) でパースが失敗することを検証する

3. **customizations.additionalFiles のバリデーション**
   - `additionalFiles` が有効な `PlannedFile[]` の場合にパースが成功することを検証する
   - `additionalFiles` が不正な形式の場合にパースが成功/失敗の挙動を検証する（設計に応じて）

### Task 5: Graceful degradation 組み合わせテスト

1. **新フィールドの一部だけが存在する場合**
   - `category` のみ存在、他の新フィールドなし: category は返却値のまま、他はデフォルト値であることを検証する
   - `files` のみ存在、他の新フィールドなし: files は返却値のまま、他はデフォルト値であることを検証する
   - `category` + `reasoning` のみ存在: 両方が返却値、`customizations` と `files` はデフォルト値であることを検証する
   - `customizations` + `files` のみ存在: 両方が返却値、`category` と `reasoning` はデフォルト値であることを検証する

2. **全新フィールドが存在するが一部が不正値の場合**
   - `category` が不正値で他は正常: パースが失敗することを検証する（不正値は Graceful degradation 対象外）
   - `files` が不正形式で他は正常: パースが失敗することを検証する

### Task 6: agents/scripts から files への自動生成ロジックテスト

1. **generateFilesFromAgentsAndScripts() の境界値テスト**
   - agents=0件、scripts=0件の場合: 空配列が返ることを検証する
   - agents=1件、scripts=0件の場合: `[{ path: "agents/{name}.md", purpose: "{role}" }]` が返ることを検証する
   - agents=0件、scripts=1件の場合: `[{ path: "scripts/{name}", purpose: "{purpose}" }]` が返ることを検証する
   - agents=3件、scripts=2件の場合: 5件の PlannedFile が正しい順序（agents 先、scripts 後）で返ることを検証する

2. **自動生成結果の path 形式テスト**
   - agent name が拡張子なし（`"classify-issues"`）の場合: path が `"agents/classify-issues.md"` になることを検証する
   - script name が拡張子付き（`"validate.js"`）の場合: path が `"scripts/validate.js"` になることを検証する
   - script name が拡張子なし（`"build"`）の場合: path が `"scripts/build"` になることを検証する

### Task 7: parsePlanResponse() の Markdown コードブロック + 新フィールドの組み合わせテスト

1. **Markdown コードブロック内に新フィールドを含む LLM レスポンス**
   - ` ```json\n{全フィールド含むJSON}\n``` ` 形式でパースが成功し、新フィールドが正しく抽出されることを検証する

2. **Markdown コードブロック内に新フィールドを含まない LLM レスポンス**
   - ` ```json\n{旧フィールドのみJSON}\n``` ` 形式でパースが成功し、新フィールドにデフォルト値が適用されることを検証する

## 参照資料

- `docs/30-workflows/ut-sc-03-004-skill-blueprint-migration/phase-04-test-creation.md`（Phase 4: テスト設計）
- `docs/30-workflows/ut-sc-03-004-skill-blueprint-migration/phase-05-implementation.md`（Phase 5: 実装）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（実装コード: isValidPlanResponse L446+、parsePlanResponse L400+、generateFilesFromAgentsAndScripts）
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`（既存テスト + Phase 4 追加分）
- `.claude/rules/06-known-pitfalls.md`（P42: .trim() 3段バリデーション）

## 成果物

- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`（更新: エッジケース・境界値テスト追加）

## 完了条件

- [ ] Phase 5 実装後のカバレッジを計測し、不足箇所を特定した
- [ ] category バリデーションのエッジケーステスト（無効文字列、大文字、スペース付き、空文字列、非文字列型）を追加した
- [ ] files バリデーションのエッジケーステスト（空配列、不正エントリ、非配列型）を追加した
- [ ] customizations のエッジケーステスト（null/undefined サブフィールド、不正型）を追加した
- [ ] Graceful degradation 組み合わせテスト（一部フィールド存在/不在の組み合わせ）を追加した
- [ ] agents/scripts から files への自動生成ロジックの境界値テストを追加した
- [ ] Markdown コードブロック + 新フィールドの組み合わせテストを追加した
- [ ] 追加した全テストが PASS した
- [ ] カバレッジ基準を確認した（Line 80%+, Branch 60%+, Function 80%+）
- [ ] テスト実行コマンドを `apps/desktop` ディレクトリから実行した（P40 準拠）
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 統合テスト連携（Phase 1-11 は必須）

| 判定項目                | 基準 | 結果 |
| ----------------------- | ---- | ---- |
| ユニットテスト Line     | 80%+ | -    |
| ユニットテスト Branch   | 60%+ | -    |
| ユニットテスト Function | 80%+ | -    |

## 多角的チェック観点（AI が判断）

| 観点               | 適用判断                                                          | 仕様参照先                           |
| ------------------ | ----------------------------------------------------------------- | ------------------------------------ |
| セキュリティ       | 非適用（テストコードのみ）                                        | -                                    |
| アーキテクチャ     | 非適用（テスト追加のみ）                                          | -                                    |
| エラーハンドリング | **適用**: Graceful degradation の全分岐カバレッジ確認             | Phase 2 設計書 Task 5                |
| UI/UX              | 非適用                                                            | -                                    |
| データ整合性       | **適用**: P42 準拠の .trim() バリデーションのテストカバレッジ確認 | `.claude/rules/06-known-pitfalls.md` |
| パフォーマンス     | 非適用                                                            | -                                    |
| アクセシビリティ   | 非適用                                                            | -                                    |

## サブタスク管理

Phase 実行開始時に、TaskCreate ツールで以下のサブタスクを作成すること:

1. カバレッジ計測と不足箇所の特定（Task 1）
2. category バリデーションのエッジケーステスト追加（Task 2）
3. files バリデーションのエッジケーステスト追加（Task 3）
4. customizations のエッジケーステスト追加（Task 4）
5. Graceful degradation 組み合わせテスト追加（Task 5）
6. agents/scripts から files 自動生成テスト追加（Task 6）
7. Markdown コードブロック組み合わせテスト追加（Task 7）
8. 全テスト実行確認 + カバレッジ再計測
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## テスト実行コマンド

```bash
# P40 準拠: apps/desktop ディレクトリから実行すること
# テスト実行
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts

# カバレッジ計測
cd apps/desktop && pnpm vitest run --coverage src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts

# 全テスト（関連ファイル全体）
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/
```

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

## 次の Phase

Phase 7: カバレッジ確認
