# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase      | 6                             |
| タスクID   | UT-CANCEL-004-01              |
| ステータス | 完了                          |
| 作成日     | 2026-04-22                    |
| タスク種別 | NON_VISUAL（UI変更なし）      |
| 前Phase    | 5: 実装（TDD Green フェーズ） |
| 次Phase    | 7: カバレッジ確認             |
| 参照 Issue | #2350                         |

## 目的

Phase 5 で Green 化した `createSkill` の `signal` 引数実装に対して、
エッジケース・後方互換性・エラー伝播のテストを追加し、実装の堅牢性を高める。

小規模タスク（Renderer Store 層の引数追加）の特性を踏まえ、
以下の観点に絞って効率的に拡充する。

- `signal.aborted` が `true` の状態で呼ばれた場合の早期リターン（IPC 不到達）
- `signal` が `undefined` の場合の後方互換性（IPC は従来どおり呼ばれる）
- `createSkill` 内でエラーが発生した場合の `skillError` セット確認
- `SkillCreateWizard` で `cancelGeneration` が発火したあとの `createSkill` 経路確認

## 実行タスク

### タスク 1: `signal.aborted` 事前チェックのエッジケーステスト追加

**目的**: `createSkill` に渡された signal がすでに中断済みの場合、IPC を呼ばずに早期リターンすることを検証する。

**追加テストケース** （`agentSlice.createSkill.signal.test.ts` に追記）:

#### TC-ABORT-01: signal.aborted が true のとき IPC が呼ばれない

- 前提: `controller.abort()` を実行したあとに `controller.signal` を `createSkill` に渡す
- 実行: `createSkill(description, options, context, controller.signal)`
- 検証:
  - `mockSkillCreate`（`window.electronAPI.skill.create`）が呼ばれないこと
  - 戻り値が `""` であること（エラー扱いまたは空文字早期リターン）

#### TC-ABORT-02: signal.aborted が途中で true になった場合（IPC 呼び出し中断）

- 前提: `window.electronAPI.skill.create` を `Promise` でラップし、内部で `controller.abort()` を発火する
- 実行: IPC が abort によって reject された場合のハンドリング確認
- 検証:
  - `skillError` に `"スキル作成に失敗"` を含む文字列がセットされること
  - `createSkill` が `""` を返すこと（例外が上位へ伝播しないこと）

**実行確認**:

```bash
pnpm --filter @repo/desktop test agentSlice.createSkill.signal
```

---

### タスク 2: 後方互換性（signal なし呼び出し）の回帰テスト追加

**目的**: `signal` 引数を省略した既存の呼び出しパターンが引き続き動作することを検証する。

**追加テストケース** （`agentSlice.createSkill.signal.test.ts` に追記）:

#### TC-COMPAT-01: signal を渡さない呼び出しで IPC が正常に実行される

- 前提: `signal` 引数なしで `createSkill(description, options)` を呼ぶ
- 検証:
  - `mockSkillCreate` が呼ばれること
  - `mockSkillCreate` の引数オブジェクトに `signal: undefined` または `signal` キー自体がないこと
  - 戻り値が `result.path` を返すこと

#### TC-COMPAT-02: context と signal の両方を省略した場合も動作する

- 前提: `createSkill(description, options)` のみ（context・signal なし）
- 検証:
  - `mockSkillCreate` が呼ばれること
  - バリデーションエラーが発生しないこと

**実行確認**:

```bash
pnpm --filter @repo/desktop test agentSlice.createSkill.signal
```

---

### タスク 3: SkillCreateWizard の signal 受け渡しフロー確認テスト追加

**目的**: `handleGenerate` 内で `startGeneration()` の返値が実際に `createSkill` まで届くことを、より詳細に検証する。

**追加テストケース** （`SkillCreateWizard.test.tsx` に追記）:

#### TC-WIZ-02: cancelGeneration が呼ばれた後は createSkill が呼ばれない

- 前提:
  1. `handleGenerate` を呼び出す（生成開始）
  2. 即座に `cancelGeneration()` を実行して signal を abort させる
- 検証:
  - `createSkill`（`useCreateSkill` モック）が呼ばれないこと、または呼ばれても空文字を返すこと
  - コンポーネントにエラーメッセージが表示されないこと（AbortError はユーザーへの通知不要）

#### TC-WIZ-03: startGeneration の返値（signal）が createSkill の第 4 引数と同一インスタンス

- 前提: `useCancelGeneration` の `startGeneration` を `vi.fn()` でモックし、特定の `AbortController().signal` を返す
- 実行: `handleGenerate` を呼び出す
- 検証:
  - `createSkill` が呼ばれた際に第 4 引数が `startGeneration` の返値と `===` 同一であること

**実行確認**:

```bash
pnpm --filter @repo/desktop test SkillCreateWizard
```

---

### タスク 4: 既存テスト全体の PASS 確認（回帰ガード）

**目的**: タスク 1〜3 の追加テストが既存テストを壊していないことを確認する。

**実行手順**:

1. 拡充後のテスト全体を実行する

```bash
pnpm --filter @repo/desktop test agentSlice.createSkill.signal
pnpm --filter @repo/desktop test SkillCreateWizard
```

2. 全体テストで回帰がないことを確認する

```bash
pnpm --filter @repo/desktop test
```

3. 確認対象ファイル:
   - `agentSlice.test.ts`（基本テスト群）
   - `agentSlice.createSkill.context.test.ts`（context テスト群）
   - `useCancelGeneration.e2e.test.ts`（E2E テスト群）
   - `SkillCreateWizard.store-integration.test.tsx`（ストア統合テスト）

---

## 参照資料

| 参照資料                       | パス                                                                                     | 内容                                          |
| ------------------------------ | ---------------------------------------------------------------------------------------- | --------------------------------------------- |
| signal テスト（Green 状態）    | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.createSkill.signal.test.ts` | Phase 5 で Green 化した基本テスト             |
| useCancelGeneration E2E テスト | `apps/desktop/src/renderer/hooks/__tests__/useCancelGeneration.e2e.test.ts`              | startGeneration → cancelGeneration フロー参考 |
| SkillCreateWizard テスト       | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`        | TC-WIZ-01 追記済みファイル                    |
| agentSlice 実装                | `apps/desktop/src/renderer/store/slices/agentSlice.ts` L1200-1233                        | signal 伝播実装の確認                         |

## 成果物

| 成果物                            | パス                                                                                     | 内容                                       |
| --------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------ |
| 拡充済み signal テスト            | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.createSkill.signal.test.ts` | TC-ABORT-01〜02・TC-COMPAT-01〜02 追加済み |
| 拡充済み SkillCreateWizard テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`        | TC-WIZ-02〜03 追加済み                     |
| テスト拡充結果レポート            | `outputs/phase-6/expansion-test-result.md`                                               | 追加テスト ID・PASS 確認・実行時間を記載   |

## 完了条件

- [ ] `TC-ABORT-01`・`TC-ABORT-02` が `agentSlice.createSkill.signal.test.ts` に追加されている
- [ ] `TC-COMPAT-01`・`TC-COMPAT-02` が追加されている
- [ ] `TC-WIZ-02`・`TC-WIZ-03` が `SkillCreateWizard.test.tsx` に追加されている
- [ ] 追加した全テストが `pnpm --filter @repo/desktop test` で PASS している
- [ ] 既存テストが引き続き PASS している
- [ ] `outputs/phase-6/expansion-test-result.md` に追加テスト ID・PASS 確認・実行時間が記載されている

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## 統合テスト連携

- `TC-ABORT-01` のテスト追加により、`signal.aborted` 事前チェックが CI で回帰ガードされる
- `TC-COMPAT-01`・`TC-COMPAT-02` のテスト追加により、既存呼び出しパターンの後方互換性が CI で継続保証される
- `TC-WIZ-02`・`TC-WIZ-03` により、`SkillCreateWizard` → `agentSlice` 間の signal 伝播経路が E2E に近い形で検証される

## 多角的チェック観点

| 観点                      | チェック内容                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------ |
| signal 事前中断の処理     | `signal.aborted === true` の場合に IPC が呼ばれないことが検証されているか                              |
| 後方互換性                | `signal` を省略した既存呼び出しパターンで IPC が正常に呼ばれることが検証されているか                   |
| AbortError の取り扱い     | AbortError が `skillError` に変換されずユーザー通知が不要であることが確認されているか                  |
| signal インスタンス同一性 | `startGeneration()` の返値と `createSkill()` の第 4 引数が同一インスタンスであることが検証されているか |
| 既存テストへの影響        | 追加テストが `agentSlice.test.ts`・`useCancelGeneration.e2e.test.ts` を壊していないか                  |

## サブタスク管理

| サブタスクID | 内容                                                  | ステータス |
| ------------ | ----------------------------------------------------- | ---------- |
| ST-6-01      | signal.aborted 事前チェック テスト追加                | 未実施     |
| ST-6-02      | 後方互換性（signal なし呼び出し）テスト追加           | 未実施     |
| ST-6-03      | SkillCreateWizard signal 受け渡しフロー確認テスト追加 | 未実施     |
| ST-6-04      | 回帰ガード（全体テスト PASS 確認）                    | 未実施     |

## 次 Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UT-CANCEL-004-01/phase-7-coverage.md`
