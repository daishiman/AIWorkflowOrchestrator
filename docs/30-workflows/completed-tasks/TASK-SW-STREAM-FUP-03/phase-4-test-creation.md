# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase      | 4                             |
| Phase名    | テスト作成                    |
| 対象機能   | TASK-SW-STREAM-FUP-03         |
| 前提Phase  | Phase 3: 設計レビュー（PASS） |
| 次Phase    | Phase 5: 実装                 |
| ステータス | 未実施                        |
| 作成日     | 2026-04-17                    |

## 目的

TDD Red フェーズとして、モード別進捗フローを検証するテストケースを作成する。
実装前にテストが失敗することを確認する。

## 前提確認

- **既存テストは変更禁止**: `create` モードを対象とする既存14テストケースは変更しない
- **private method テスト方針**: progress flow は `createSkill()` 経由（public API）で検証する。
  private method の直接テストは、step の切り分けが必要な場合のみ補助的に行う
- **テスト実行**: `pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService.progress"`

## テストファイル

### 対象ファイル

```
apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts
```

（新規作成。既存の `SkillCreatorService.test.ts` は変更しない）

## テストケース設計

### Suite 1: collaborative モード進捗テスト

```typescript
describe("TASK-SW-STREAM-FUP-03: collaborative モード進捗フロー", () => {
  it("TC-01: interview フェーズが最初に通知される", async () => {
    // onProgress を spy で監視
    // createSkill({ mode: "collaborative", ... }) を呼び出す
    // spy.mock.calls[0][0].phase === "interview" を検証
  });

  it("TC-02: consensus フェーズが interview の後に通知される", async () => {
    // spy.mock.calls[1][0].phase === "consensus" を検証
  });

  it("TC-03: collaborative モードの percentage が単調増加する", async () => {
    // 全コールバック呼び出しの percentage が単調増加していることを検証
  });

  it("TC-04: collaborative モードで done フェーズが最後に通知される", async () => {
    // 最後のコールバック呼び出しが { phase: "done", percentage: 100 } であることを検証
  });
});
```

### Suite 2: orchestrate モード進捗テスト

```typescript
describe("TASK-SW-STREAM-FUP-03: orchestrate モード進捗フロー", () => {
  it("TC-05: engine-selection フェーズが最初に通知される", async () => {});
  it("TC-06: orchestrate モードの percentage が単調増加する", async () => {});
  it("TC-07: orchestrate モードで done フェーズが最後に通知される", async () => {});
});
```

### Suite 3: update モード進捗テスト

```typescript
describe("TASK-SW-STREAM-FUP-03: update モード進捗フロー", () => {
  it("TC-08: loading-skill フェーズが最初に通知される", async () => {});
  it("TC-09: analyzing フェーズが loading-skill の後に通知される", async () => {});
  it("TC-10: update モードで done フェーズが最後に通知される", async () => {});
});
```

### Suite 4: improve-prompt モード進捗テスト

```typescript
describe("TASK-SW-STREAM-FUP-03: improve-prompt モード進捗フロー", () => {
  it("TC-11: loading-skill フェーズが最初に通知される", async () => {});
  it("TC-12: improving フェーズが analyzing の後に通知される", async () => {});
  it("TC-13: improve-prompt モードで done フェーズが最後に通知される", async () => {});
});
```

### Suite 5: 回帰テスト（create モード）

```typescript
describe("TASK-SW-STREAM-FUP-03: create モード回帰確認", () => {
  it("TC-14: create モードの5段階フローが変わらない（planning → done）", async () => {
    // 既存フェーズ列が維持されていることを確認
    // planning(10%) → generating-skill(40%) → generating-agents(70%) → validating(90%) → done(100%)
  });
});
```

## テスト命名規則

- テストファイル: `SkillCreatorService.progress.test.ts`（camelCase + ドット区切り）
- describe ブロック: `TASK-SW-STREAM-FUP-03: <モード名> <概要>`
- it ブロック: `TC-NN: <期待動作の説明>`

## 実行タスク

既存成果物と前後 Phase の差分を照合する。

- 受入条件と実装結果の整合を確認する。
- 必要な修正を後続 Phase へ引き継ぐ。

## 参照資料

- `artifacts.json`
- `outputs/artifacts.json`
- 関連する前後 Phase の成果物

## 統合テスト連携

- 検証結果は後続 Phase の品質ゲートへ引き継ぐ。
- 自動テスト結果と矛盾しないことを確認する。

## 成果物

| 成果物                               | パス                                                   |
| ------------------------------------ | ------------------------------------------------------ |
| TASK-SW-STREAM-FUP-03-test-design.md | `outputs/phase-4/TASK-SW-STREAM-FUP-03-test-design.md` |

## 完了条件

- [ ] 新規テストファイル `SkillCreatorService.progress.test.ts` が作成されている
- [ ] TC-01〜TC-14 の全テストケースが実装されている
- [ ] TDD Red: テスト実行時に TC-01〜TC-13 が FAIL することを確認した
- [ ] TDD Red: TC-14（create 回帰）が PASS することを確認した
- [ ] 既存14テストケースに影響がないことを確認した

## タスク100%実行確認【必須】

- [ ] テストファイルを新規作成した
- [ ] Suite 1〜5 の全テストケースを実装した
- [ ] TDD Red を確認した
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 5: 実装](./phase-5-implementation.md)
