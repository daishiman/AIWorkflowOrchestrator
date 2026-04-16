# TASK-SW-STRUCT-001 Phase 4: テスト設計

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| タスクID   | TASK-SW-STRUCT-001 |
| Phase      | 4                  |
| 作成日     | 2026-04-16         |
| ステータス | 完了               |

## Task 1: 新規テストケース設計（AC-1〜AC-4）

テスト対象: `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`

### 新規テストケース一覧

| TC ID        | 対応AC | テストタイトル                                                                    | 期待結果                                                       |
| ------------ | ------ | --------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| TC-STRUCT-01 | AC-1   | runCreateWorkflow が返す purpose は options.description と一致する                | `purpose === options.description`                              |
| TC-STRUCT-02 | AC-2   | runCreateWorkflow が返す agents はエージェント名リストである                      | `agents` が `["extract-purpose", "plan-structure"]` と一致する |
| TC-STRUCT-03 | AC-3   | runCreateWorkflow が返す features は空配列である                                  | `features` が `[]` と一致する                                  |
| TC-STRUCT-04 | AC-4   | create モードで runCreateWorkflow が内部エラーを受けても createSkill() は成功する | `createSkill()` が例外をスローしない                           |

## Task 2: 回帰テスト計画（AC-5）

collaborative モードの既存テストが全てパスすることを確認する。

| TC ID  | 対応AC | テストタイトル                                                          | 期待結果       |
| ------ | ------ | ----------------------------------------------------------------------- | -------------- |
| TC-R01 | AC-5   | SC-006: collaborative workflow が正常に実行される                       | 既存動作と同一 |
| TC-R02 | AC-5   | TC-B04: collaborative モードで extract-purpose エージェントが呼ばれない | 既存動作と同一 |

## Task 3: 既存テストの更新計画

以下の既存テストは旧実装を前提としており、実装修正後に更新が必要:

| テストID                | 現在の期待値                                     | 更新後の期待値                                                          |
| ----------------------- | ------------------------------------------------ | ----------------------------------------------------------------------- |
| TC-01（create モード）  | `loadAgent` が呼ばれる                           | `loadAgent` が一切呼ばれないことを確認                                  |
| TC-04（create モード）  | `purpose: "mock-agent-content"`, `agents: [...]` | `purpose: description`, `agents: ["extract-purpose", "plan-structure"]` |
| TC-05（create モード）  | `loadAgent("extract-purpose")` が呼ばれる        | `loadAgent` が呼ばれないことを確認                                      |
| TC-B01（create モード） | `loadAgent` が2回呼ばれる                        | `loadAgent` が一切呼ばれないことを確認                                  |
| TC-B06（モード分岐）    | `loadAgent("plan-structure")` が呼ばれる         | `loadAgent` が呼ばれないことを確認                                      |

## TDD Red フェーズ確認

実装前に TC-STRUCT-01、TC-STRUCT-02 が失敗することを確認:

- TC-STRUCT-01: `purpose` が `extractPurposeAgent`（旧）のため `options.description` と不一致 → Red
- TC-STRUCT-02: `agents` が `["mock-agent-content", "mock-agent-content"]` のため不一致 → Red

## 完了確認

- [x] TC-STRUCT-01〜TC-STRUCT-04 のテストケース設計が完了している
- [x] TC-R01〜TC-R02 の回帰テスト計画が完了している
- [x] 既存テスト更新計画が完了している
- [x] TDD Red フェーズの確認手順が明記されている
