# Phase 4: テスト設計

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 4                               |
| Phase名    | テスト設計                      |
| 対象機能   | TASK-SC-IMP-CREATE-WORKFLOW-001 |
| 前提Phase  | Phase 3: 設計レビューゲート     |
| 次Phase    | Phase 5: 実装計画               |
| ステータス | 完了                            |
| 作成日     | 2026-04-14                      |

## 目的

TDD の Red フェーズとして、`runCreateWorkflow` 実装前に失敗するテストケースを設計する。
AC-1〜AC-5 を網羅するテストケース一覧と、`collaborative` モードの回帰確認計画を策定する。

## 実行タスク

### Task 1: 新規テストケース設計（AC-1〜AC-4）

- `scriptExecutor.execute` / `resourceLoader.loadAgent` をスパイ可能にする
- AC-1: `loadAgent` が呼び出されることをアサートする
- AC-2: `createSkill()` が文字列パスを返すことをアサートする
- AC-3: `loadAgent` が reject しても `createSkill()` が成功することをアサートする
- AC-4: `options.description` が `structurePlan` に含まれることをアサートする

### Task 2: 回帰テスト計画（AC-5）

- 既存の `collaborative` モードテストケースを特定
- 型変更（void → StructurePlanJson | null）が既存テストに影響しないことを確認
- 回帰テスト実行コマンドを特定

## テストケース一覧

### 新規テストケース（TC-01〜TC-05）

| TC ID | 対応AC | テストタイトル                                              | 期待結果                                     |
| ----- | ------ | ----------------------------------------------------------- | -------------------------------------------- |
| TC-01 | AC-1   | create モードで createSkill() を呼ぶと loadAgent が呼ばれる | `resourceLoader.loadAgent` が最低1回呼ばれる |
| TC-02 | AC-2   | runCreateWorkflow 完了後、createSkill() がスキルパスを返す  | `createSkill()` が文字列パスを返す           |
| TC-03 | AC-3   | loadAgent が例外をスローしても createSkill() は成功する     | `createSkill()` が例外をスローしない         |
| TC-04 | AC-4   | runCreateWorkflow は options.description を使用する         | `structurePlan` に description が含まれる    |
| TC-05 | AC-1   | loadAgent は "extract-purpose" エージェントを読み込む       | `loadAgent("extract-purpose")` が呼ばれる    |

### 回帰テストケース（TC-R01〜TC-R03）

| TC ID  | 対応AC | テストタイトル                                                     | 期待結果       |
| ------ | ------ | ------------------------------------------------------------------ | -------------- |
| TC-R01 | AC-5   | collaborative モード: interviewResult なしでエラーをスローする     | 既存動作と同一 |
| TC-R02 | AC-5   | collaborative モード: 有効な interviewResult でスキルが作成される  | 既存動作と同一 |
| TC-R03 | AC-5   | collaborative モード: runCollaborativeWorkflow が loadAgent を呼ぶ | 既存動作と同一 |

## TDD 確認コマンド

```bash
# Red フェーズ（実装前に TC-01〜TC-05 が失敗することを確認）
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService" --grep "create モード"

# 回帰確認（TC-R01〜TC-R03 が Green であることを確認）
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService" --grep "collaborative"
```

## 参照資料

- `outputs/phase-4/test-design.md` — 本フェーズの詳細成果物（テストコードスケルトン付き）
- `outputs/phase-2/design.md` — 設計書（テスト観測点）

## 成果物

| 成果物         | パス                             |
| -------------- | -------------------------------- |
| test-design.md | `outputs/phase-4/test-design.md` |

## 完了条件

- [x] TC-01〜TC-05 のテストケース設計が完了している
- [x] TC-R01〜TC-R03 の回帰テスト計画が完了している
- [x] テストコードスケルトンが作成されている（`outputs/phase-4/test-design.md` 参照）
- [x] TDD Red フェーズの確認手順が明記されている

## 次 Phase

→ [Phase 5: 実装計画](./phase-5-implementation.md)
