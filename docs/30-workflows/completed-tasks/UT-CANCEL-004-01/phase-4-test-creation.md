# Phase 4: テスト作成（TDD Red フェーズ）

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 4                     |
| タスクID   | UT-CANCEL-004-01      |
| ステータス | 完了                  |
| 作成日     | 2026-04-22            |
| タスク種別 | NON_VISUAL            |
| 前Phase    | 3: 設計レビューゲート |
| 次Phase    | 5: 実装（TDD Green）  |

## 目的

Renderer guard 契約を Red テストで固定する。今回の Red は「IPC に `signal` を渡すこと」ではなく、「store が `signal` を第4引数として受け取り、aborted なら IPC を呼ばないこと」を確認する。

## 実行タスク

### Step 1: store テスト作成

- TC-01: `createSkill(..., signal)` で non-aborted signal を渡した場合、IPC は現行 shape で呼ばれる
- TC-02: `signal.aborted === true` の場合、IPC が呼ばれない
- TC-03: `signal` 省略時に後方互換で動く

### Step 2: Wizard テスト作成

- TC-WIZ-01: `startGeneration()` の返値が `createSkill` 第4引数に渡る

### Step 3: Red 確認

- focused test 実行で Red を確認する

## 参照資料

| 参照資料                | パス                                                                                      | 内容               |
| ----------------------- | ----------------------------------------------------------------------------------------- | ------------------ |
| Phase 2 設計書          | `outputs/phase-2/design-doc.md`                                                           | 契約設計           |
| agentSlice context test | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.createSkill.context.test.ts` | 既存テストパターン |
| SkillCreateWizard test  | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`         | 既存テスト         |

## 実行手順

1. store テストを追加する
2. Wizard テストを追加する
3. Red を確認する

## 統合テスト連携

- Phase 5 で Green 化する
- `useCancelGeneration.e2e.test.ts` は cancel IPC の既存証跡として参照する

## 多角的チェック観点（AIが判断）

| 観点         | チェック内容                                        |
| ------------ | --------------------------------------------------- |
| 矛盾なし     | `signal` を IPC 引数に入れる期待値になっていないか  |
| 漏れなし     | non-aborted / aborted / omitted の 3 ケースがあるか |
| 整合性       | store と Wizard のテスト意図が Phase 2 と一致するか |
| 依存関係整合 | cancel IPC の既存テストを重複定義していないか       |

## サブタスク管理

| サブタスクID | 内容                  | ステータス |
| ------------ | --------------------- | ---------- |
| ST-4-01      | store Red テスト作成  | 未実施     |
| ST-4-02      | Wizard Red テスト作成 | 未実施     |
| ST-4-03      | Red 確認              | 未実施     |

## 成果物

- `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.createSkill.signal.test.ts`
- `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`
- `outputs/phase-4/red-test-result.md`

## 完了条件

- [ ] TC-01〜TC-03 が定義されている
- [ ] TC-WIZ-01 が定義されている
- [ ] Red の失敗理由が契約未実装であることを確認している

## タスク 100% 実行確認【必須】

- [ ] 全タスクを実行した
- [ ] 成果物名が artifacts と一致している
- [ ] Green 化の入力が揃っている

## 次Phase

[phase-5-implementation.md](phase-5-implementation.md)
