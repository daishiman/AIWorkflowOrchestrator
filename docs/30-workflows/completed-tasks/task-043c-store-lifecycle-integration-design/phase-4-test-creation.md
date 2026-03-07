# Phase 4: テスト作成

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| Phase    | 4                                  |
| 機能名   | store-lifecycle-integration-design |
| タスクID | TASK-10A-E-C                       |
| 作成日   | 2026-03-06                         |

## 目的

Phase 2（設計）で定義した selector/action/状態遷移を検証するテストケースを設計する。import 成功/失敗/再試行/連打防止/idempotency/P31 回避の全観点をカバーする。

## 実行タスク

- selector 単体テスト設計
- action 状態遷移テスト設計
- import 成功/失敗/再試行/連打防止テスト設計
- P31 回避テスト設計
- TASK-10A-F 境界テスト設計

## 参照資料

| 参照資料       | パス                                                                         | 使用目的                 |
| -------------- | ---------------------------------------------------------------------------- | ------------------------ |
| Phase 1 成果物 | `phase-1-requirements.md`                                                    | テスト対象の要件         |
| Phase 2 成果物 | `phase-2-design.md`                                                          | テスト対象の設計         |
| Phase 3 成果物 | `phase-3-design-review.md`                                                   | MINOR 指摘（M1）への対応 |
| 状態管理仕様   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | P31 テストパターン       |
| 品質要件       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | カバレッジ基準           |
| エラー仕様     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | エラーケースのカテゴリ   |

## 実行手順

### Step 1: テストファイル構成

| テストファイル                               | テスト対象            | テスト種別 |
| -------------------------------------------- | --------------------- | ---------- |
| `agentSlice.import-lifecycle.test.ts`        | import 状態遷移       | 単体テスト |
| `agentSlice.selectors.test.ts`（既存に追加） | selector 算出ロジック | 単体テスト |
| `agentSlice.boundary.test.ts`                | TASK-10A-F 境界検証   | 単体テスト |

テストファイル配置: `apps/desktop/src/renderer/store/slices/__tests__/`

### Step 2: Selector 単体テスト設計

#### 2.1 useImportedSkills テスト

| #   | テストケース                                | 期待結果                     |
| --- | ------------------------------------------- | ---------------------------- |
| 1   | 初期状態で空配列を返す                      | `[]`                         |
| 2   | importedSkills が設定された状態で正しく返す | 設定された `ImportedSkill[]` |

#### 2.2 useAvailableSkillsMetadata テスト

| #   | テストケース                                   | 期待結果                     |
| --- | ---------------------------------------------- | ---------------------------- |
| 1   | 初期状態で空配列を返す                         | `[]`                         |
| 2   | availableSkillsMetadata が設定された状態で返す | 設定された `SkillMetadata[]` |

#### 2.3 useFilteredAvailableSkills テスト（M1 対応: コンポーネントテスト）

| #   | テストケース                                   | 期待結果                         |
| --- | ---------------------------------------------- | -------------------------------- |
| 1   | フィルター空文字列で全件返す                   | `availableSkillsMetadata` と同一 |
| 2   | フィルター文字列で name マッチのみ返す         | マッチするメタデータのみ         |
| 3   | フィルター文字列で description マッチのみ返す  | マッチするメタデータのみ         |
| 4   | フィルター文字列でマッチなしで空配列返す       | `[]`                             |
| 5   | フィルター文字列が大文字小文字無視でマッチする | case-insensitive マッチ          |

#### 2.4 useIsImportingSkill / useImportingSkillName テスト

| #   | テストケース                      | 期待結果                |
| --- | --------------------------------- | ----------------------- |
| 1   | 初期状態で false / null を返す    | `false` / `null`        |
| 2   | import 中に true / スキル名を返す | `true` / `"test-skill"` |

### Step 3: Action 状態遷移テスト設計

#### 3.1 importSkill 成功フロー

```
describe("importSkill - 成功フロー")

テスト手順:
  1. IPC mock を成功レスポンスで設定
  2. importSkill("test-skill") を呼び出し
  3. 呼び出し直後の状態を検証:
     - isImporting === true
     - importingSkillName === "test-skill"
     - skillError === null
  4. await 完了後の状態を検証:
     - isImporting === false
     - importingSkillName === null
     - importedSkills に "test-skill" が含まれる
     - availableSkillsMetadata から "test-skill" が除外されている
```

#### 3.2 importSkill 失敗フロー

```
describe("importSkill - 失敗フロー")

テスト手順:
  1. IPC mock をエラーレスポンスで設定
  2. importSkill("test-skill") を呼び出し
  3. await 完了後の状態を検証:
     - isImporting === false
     - importingSkillName === null
     - skillError にエラーメッセージが設定されている
     - importedSkills が変更されていない
     - availableSkillsMetadata が変更されていない
```

#### 3.3 importSkill 連打防止テスト

```
describe("importSkill - 連打防止")

テスト手順:
  1. IPC mock を遅延レスポンスで設定
  2. importSkill("skill-1") を呼び出し（await しない）
  3. isImporting === true を確認
  4. importSkill("skill-2") を呼び出し
  5. IPC mock が1回しか呼ばれていないことを検証
  6. importingSkillName === "skill-1" のままであることを検証
```

#### 3.4 importSkill Idempotency Guard テスト

```
describe("importSkill - idempotency guard")

テスト手順:
  1. importedSkills に "existing-skill" を設定
  2. availableSkillsMetadata に "existing-skill" を含める
  3. importSkill("existing-skill") を呼び出し
  4. IPC mock が呼ばれていないことを検証
  5. availableSkillsMetadata から "existing-skill" が除外されていることを検証
  6. isImporting === false のままであることを検証
```

#### 3.5 clearSkillError テスト

```
describe("clearSkillError")

テスト手順:
  1. skillError に "some error" を設定
  2. clearSkillError() を呼び出し
  3. skillError === null を検証
```

#### 3.6 removeSkill テスト

```
describe("removeSkill")

テスト手順:
  1. importedSkills に "test-skill" を設定
  2. IPC mock を成功レスポンスで設定
  3. removeSkill("test-skill") を呼び出し
  4. await 完了後の状態を検証:
     - importedSkills から "test-skill" が除外されている
```

### Step 4: P31 回避テスト設計

#### 4.1 個別セレクタ安定参照テスト

```
describe("P31 - 個別セレクタ安定参照")

テスト手順:
  1. useImportSkill の戻り値を取得（render 1回目）
  2. 無関係な状態を更新（例: skillFilter を変更）
  3. useImportSkill の戻り値を再取得（render 2回目）
  4. 1回目と2回目の参照が同一であることを検証（Object.is）
```

#### 4.2 合成 Hook 禁止検証（静的解析観点）

```
describe("P31 - 合成 Hook 不使用")

テスト手順:
  1. SkillManagementPanel のソースコードに useSkillStore が含まれていないことを検証
  2. SkillImportDialog のソースコードに useSkillStore が含まれていないことを検証
  注: これは grep ベースの静的検証であり、実行時テストではない
```

### Step 5: TASK-10A-F 境界テスト設計

#### 5.1 Import が Analyze 状態に影響しないテスト

```
describe("境界 - import は analyze 状態に影響しない")

テスト手順:
  1. isAnalyzing = true, currentAnalysis = { ... } を設定
  2. importSkill("test-skill") を呼び出し
  3. await 完了後:
     - isAnalyzing === true のまま（変更なし）
     - currentAnalysis が変更されていない
     - isImproving が変更されていない
```

#### 5.2 Import が Create 状態に影響しないテスト

```
describe("境界 - import は create 状態に影響しない")

テスト手順:
  1. 任意の create 関連状態を設定
  2. importSkill("test-skill") を呼び出し
  3. await 完了後:
     - create 関連状態が変更されていない
```

### Step 6: テストケース一覧サマリ

| カテゴリ             | テスト数 | テストファイル                        |
| -------------------- | -------- | ------------------------------------- |
| Selector 単体        | 11       | `agentSlice.selectors.test.ts`        |
| Import 成功フロー    | 1        | `agentSlice.import-lifecycle.test.ts` |
| Import 失敗フロー    | 1        | `agentSlice.import-lifecycle.test.ts` |
| 連打防止             | 1        | `agentSlice.import-lifecycle.test.ts` |
| Idempotency Guard    | 1        | `agentSlice.import-lifecycle.test.ts` |
| clearSkillError      | 1        | `agentSlice.import-lifecycle.test.ts` |
| removeSkill          | 1        | `agentSlice.import-lifecycle.test.ts` |
| P31 安定参照         | 1        | `agentSlice.import-lifecycle.test.ts` |
| P31 合成 Hook 不使用 | 1        | `agentSlice.import-lifecycle.test.ts` |
| TASK-10A-F 境界      | 2        | `agentSlice.boundary.test.ts`         |
| **合計**             | **21**   |                                       |

### Step 7: テスト環境要件

| 要件                 | 値                                                             |
| -------------------- | -------------------------------------------------------------- |
| テストフレームワーク | Vitest                                                         |
| テスト環境           | happy-dom（P39 準拠）                                          |
| IPC モック           | `vi.fn()` で `window.electronAPI` をモック                     |
| Store 初期化         | 各テストの `beforeEach` で `useAppStore.getState()` をリセット |
| ユーザーイベント     | `fireEvent`（happy-dom 環境では `userEvent` 不使用、P39 準拠） |

### Step 8: カバレッジ目標

| 指標              | 最低基準 | 本テスト設計の目標 |
| ----------------- | -------- | ------------------ |
| Line Coverage     | 80%      | 90%                |
| Branch Coverage   | 60%      | 75%                |
| Function Coverage | 80%      | 90%                |

## 統合テスト連携

Phase 6（テスト拡充）で以下の観点を追加する候補:

- エラーメッセージの具体的な内容検証（エラーカテゴリ別）
- 複数 import の連続実行（1つ目成功後に2つ目を実行）
- availableSkillsMetadata の大量データでの性能テスト
- SkillImportDialog 内の `useMemo` によるフィルタリングの re-render 回数テスト

## 多角的チェック観点

| 観点           | 確認内容                                                  |
| -------------- | --------------------------------------------------------- |
| 要件カバレッジ | FR-1 ~ FR-5, NFR-1 ~ NFR-4 全てにテストが対応しているか   |
| 境界テスト     | TASK-10A-F との境界が独立にテストされているか             |
| P31 テスト     | 安定参照と合成 Hook 不使用の両面でテストされているか      |
| エラーパス     | 成功/失敗の両パスがテストされているか                     |
| テスト独立性   | テスト間で状態が共有されていないか（beforeEach リセット） |
| M1 対応        | Phase 3 の MINOR 指摘 M1 がテスト設計に反映されているか   |

## 成果物

| 成果物       | パス                       | 説明           |
| ------------ | -------------------------- | -------------- |
| テスト設計書 | `phase-4-test-creation.md` | 本ドキュメント |

## 完了条件

- [x] selector 単体テストが 11 ケース設計されている
- [x] import 成功/失敗フローのテストが設計されている
- [x] 連打防止テストが設計されている
- [x] Idempotency Guard テストが設計されている
- [x] P31 回避テスト（安定参照 + 合成 Hook 不使用）が設計されている
- [x] TASK-10A-F 境界テストが 2 ケース設計されている
- [x] テスト環境要件（Vitest + happy-dom + IPC モック）が定義されている
- [x] カバレッジ目標が定義されている
- [x] Phase 3 MINOR 指摘 M1（useFilteredAvailableSkills コンポーネントテスト）が反映されている
- [x] 合計 21 テストケースが設計されている

## 次の Phase

Phase 5: 実装 (`phase-5-implementation.md`)
