# Phase 4: テスト作成

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 4                                      |
| 機能名   | ut-sc-03-004-skill-blueprint-migration |
| タスクID | UT-SC-03-004                           |
| 作成日   | 2026-03-24                             |
| 更新日   | 2026-03-24                             |

## 目的

Phase 2 で設計した SkillBlueprint 型の追加、RuntimeSkillCreatorPlanResult の拡張、parsePlanResponse() の Graceful degradation ロジックについて、テストファーストでテストケースを設計・実装する。TDD Red フェーズとして、Phase 5 実装前に全テストを作成し、実装がない状態で FAIL することを確認する。

## 実行タスク

### Task 1: SkillBlueprint 型テスト

**対象ファイル**: `packages/shared/src/types/__tests__/skillCreator.type.test.ts`（新規作成）

SkillBlueprint 関連の型定義が正しくエクスポートされ、定数が期待どおりの値を持つことを検証する。

1. **SkillCategory の5つの値が有効であることを確認**
   - `"simple"`, `"standard"`, `"complex"`, `"automation"`, `"integration"` の各値が SkillCategory 型に代入可能であることを型テストで検証する
   - 無効な値（`"unknown"` 等）が型エラーとなることをコメントで注記する（コンパイル時検証）

2. **PlannedFile 型のプロパティ検証**
   - `path: string` と `purpose: string` の2フィールドが必須であることを検証する
   - 型準拠のオブジェクトが PlannedFile として扱えることを確認する

3. **CategoryTemplate 型のプロパティ検証**
   - `dirs: string[]` と `desc: string` の2フィールドが必須であることを検証する

4. **CATEGORY_TEMPLATES の全カテゴリのベース構造が正しいこと**
   - `CATEGORY_TEMPLATES` が `Record<SkillCategory, CategoryTemplate>` 型であることを検証する
   - 5つのカテゴリキー（`simple`, `standard`, `complex`, `automation`, `integration`）が全て存在することを検証する
   - `simple.dirs` が空配列であることを検証する
   - `standard.dirs` が `["agents", "references"]` を含むことを検証する
   - `complex.dirs` が `["agents", "scripts", "references", "schemas"]` を含むことを検証する
   - `automation.dirs` が `["agents", "scripts", "assets"]` を含むことを検証する
   - `integration.dirs` が `["agents", "scripts", "references", "schemas", "assets"]` を含むことを検証する
   - 各カテゴリの `desc` が非空文字列であることを検証する

### Task 2: parsePlanResponse() 拡張テスト

**対象ファイル**: `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`（既存ファイルに追加）

既存テストファイルに新しい describe ブロックを追加する。

1. **全フィールド含む LLM レスポンスのパース成功**
   - `skillName`, `description`, `category`, `customizations`, `files`, `reasoning`, `agents`, `scripts`, `triggers`, `anchors` を全て含む有効な JSON をパースし、全フィールドが正しく抽出されることを検証する
   - 参照: `parsePlanResponse()`（`RuntimeSkillCreatorFacade.ts` L400-410）

2. **category フィールドのバリデーション**
   - 有効な5値（`"simple"`, `"standard"`, `"complex"`, `"automation"`, `"integration"`）の各値でパースが成功することを検証する
   - 無効な値（`"invalid"`, `""`, `123`）でパースが失敗する（エラーがスローされる）ことを検証する
   - 参照: `isValidPlanResponse()`（`RuntimeSkillCreatorFacade.ts` L446-471）

3. **customizations フィールドのバリデーション**
   - 空オブジェクト `{}` でパースが成功することを検証する
   - `additionalDirectories` のみ存在する部分オブジェクトでパースが成功することを検証する
   - `additionalFiles` のみ存在する部分オブジェクトでパースが成功することを検証する
   - `excludedDefaults` のみ存在する部分オブジェクトでパースが成功することを検証する
   - 全フィールドが存在する完全オブジェクトでパースが成功することを検証する

4. **files フィールドのバリデーション**
   - 有効な `PlannedFile[]` 形式（`[{ path: "agents/foo.md", purpose: "..." }]`）でパースが成功することを検証する
   - `path` が空文字列のエントリでパースが失敗することを検証する
   - `purpose` が欠落したエントリでパースが失敗することを検証する

5. **reasoning フィールドのバリデーション**
   - 非空文字列でパースが成功することを検証する
   - 空文字列でもパースが成功することを検証する（Graceful degradation: 空文字列は許容）

6. **Graceful degradation: 新フィールド未返却時のデフォルト値**
   - `category` 未返却時にデフォルト値 `"standard"` が設定されることを検証する
   - `customizations` 未返却時にデフォルト値 `{}` が設定されることを検証する
   - `files` 未返却時に `agents` + `scripts` から自動生成されることを検証する
     - 例: `agents: [{ name: "foo", role: "..." }]` + `scripts: [{ name: "bar.js", purpose: "..." }]` の場合、`files` は `[{ path: "agents/foo.md", purpose: "..." }, { path: "scripts/bar.js", purpose: "..." }]` となる
   - `reasoning` 未返却時にデフォルト値 `""` が設定されることを検証する
   - 全新フィールドが未返却（既存フィールドのみ）の場合に全デフォルト値が適用されることを検証する

### Task 3: plan() メソッドテスト

**対象ファイル**: `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`（既存ファイルに追加）

1. **通常経路: SkillBlueprint フィールドが戻り値に含まれることの検証**
   - LLM が全新フィールドを返した場合、`plan()` の戻り値に `category`, `customizations`, `files`, `reasoning` が含まれることを検証する
   - `estimatedSteps` が `files.length` と一致することを検証する
   - 参照: `plan()` L154-164（`RuntimeSkillCreatorFacade.ts`）

2. **スタブ経路（llmAdapter 未注入時）: デフォルト値の検証**
   - `category` が `"standard"` であることを検証する
   - `customizations` が `{}` であることを検証する
   - `files` が `[]` であることを検証する
   - `reasoning` が `""` であることを検証する
   - 参照: `plan()` L120-132（`RuntimeSkillCreatorFacade.ts`）

3. **terminal_handoff 経路: 影響なしの確認**
   - terminal_handoff 経路では新フィールドが返されないこと（`type: "terminal_handoff"` + `guidance` のみ）を検証する
   - 既存の terminal_handoff テスト（L232-298）が引き続き PASS することを確認する

### Task 4: 後方互換性テスト

**対象ファイル**: `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`（既存ファイルに追加）

1. **既存フィールドが保持されていることの検証**
   - 全新フィールドを含む LLM レスポンスで `plan()` を呼び出した場合に、以下の既存フィールドが全て存在し、正しい値であることを検証する:
     - `planId`: `"plan-{timestamp}"` 形式
     - `skillSpec`: 入力テキストと一致
     - `estimatedSteps`: 数値
     - `skillName`: LLM レスポンスの値と一致
     - `description`: LLM レスポンスの値と一致
     - `agents`: LLM レスポンスの配列と一致
     - `scripts`: LLM レスポンスの配列と一致
     - `triggers`: LLM レスポンスの配列と一致
     - `anchors`: LLM レスポンスの配列と一致

2. **既存テストとの互換性確認**
   - `RuntimeSkillCreatorFacade.test.ts` の既存テスト（`plan` describe ブロック L31-175）が変更なしで PASS することを確認する
   - 既存テストのスタブ戻り値アサーション（L86-96）に新フィールドのデフォルト値を追加する必要があることを検出する

## 参照資料

- `docs/30-workflows/ut-sc-03-004-skill-blueprint-migration/phase-02-design.md`（前 Phase 成果物: 設計書）
- `docs/30-workflows/ut-sc-03-004-skill-blueprint-migration/phase-03-design-review.md`（前 Phase 成果物: レビュー結果）
- `packages/shared/src/types/skillCreator.ts`（現行型定義 L327-337）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（plan() L90-165、parsePlanResponse() L400-410、isValidPlanResponse() L446-471）
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`（既存 plan テスト）
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`（既存ユニットテスト）
- `.claude/rules/06-known-pitfalls.md`（P39: happy-dom 環境での userEvent 非互換、P40: テスト実行ディレクトリ依存）

## 成果物

- `packages/shared/src/types/__tests__/skillCreator.type.test.ts`（新規: SkillBlueprint 型テスト）
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`（更新: parsePlanResponse 拡張 + plan() SkillBlueprint + 後方互換性テスト追加）

## 完了条件

- [ ] SkillCategory の5値バリデーションテストを作成した
- [ ] PlannedFile 型プロパティ検証テストを作成した
- [ ] CategoryTemplate 型プロパティ検証テストを作成した
- [ ] CATEGORY_TEMPLATES の全カテゴリ構造テストを作成した
- [ ] parsePlanResponse() の全フィールドパーステストを作成した
- [ ] category フィールドのバリデーションテスト（有効5値 + 無効値）を作成した
- [ ] customizations フィールドのバリデーションテスト（空/部分/完全）を作成した
- [ ] files フィールドのバリデーションテスト（有効/無効エントリ）を作成した
- [ ] reasoning フィールドのバリデーションテストを作成した
- [ ] Graceful degradation テスト（新フィールド未返却時のデフォルト値）を作成した
- [ ] plan() 通常経路の SkillBlueprint フィールド検証テストを作成した
- [ ] plan() スタブ経路のデフォルト値検証テストを作成した
- [ ] plan() terminal_handoff 経路の影響なし確認テストを作成した
- [ ] 後方互換性テスト（既存9フィールドの保持確認）を作成した
- [ ] 全テストが Phase 5 実装前の状態で FAIL することを確認した（TDD Red フェーズ）
- [ ] テスト実行コマンドを `apps/desktop` ディレクトリから実行した（P40 準拠）
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 統合テスト連携（Phase 1-11 は必須）

| 判定項目                | 基準 | 結果                                     |
| ----------------------- | ---- | ---------------------------------------- |
| ユニットテスト Line     | 80%+ | N/A（Phase 5 実装前のため全テスト FAIL） |
| ユニットテスト Branch   | 60%+ | N/A（Phase 5 実装前のため全テスト FAIL） |
| ユニットテスト Function | 80%+ | N/A（Phase 5 実装前のため全テスト FAIL） |

## 多角的チェック観点（AI が判断）

| 観点               | 適用判断                                                 | 仕様参照先            |
| ------------------ | -------------------------------------------------------- | --------------------- |
| セキュリティ       | 非適用（テストコードのみ）                               | -                     |
| アーキテクチャ     | **適用**: テストが型定義と実装の両方をカバーしていること | Phase 2 設計書        |
| エラーハンドリング | **適用**: Graceful degradation のテストケース網羅性      | Phase 2 設計書 Task 5 |
| UI/UX              | 非適用                                                   | -                     |
| データ整合性       | **適用**: 後方互換性テストによる既存フィールド保持の検証 | Phase 1 要件定義書    |
| パフォーマンス     | 非適用                                                   | -                     |
| アクセシビリティ   | 非適用                                                   | -                     |

## サブタスク管理

Phase 実行開始時に、TaskCreate ツールで以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 2 設計書、既存テストコード）
2. SkillBlueprint 型テストの作成（Task 1）
3. parsePlanResponse() 拡張テストの作成（Task 2）
4. plan() メソッドテストの作成（Task 3）
5. 後方互換性テストの作成（Task 4）
6. テスト実行確認（TDD Red フェーズ: 全テスト FAIL 確認）
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## テスト実行コマンド

```bash
# P40 準拠: apps/desktop ディレクトリから実行すること
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts

# 型テスト
cd packages/shared && pnpm vitest run src/types/__tests__/skillCreator.type.test.ts
```

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

## 次の Phase

Phase 5: 実装
