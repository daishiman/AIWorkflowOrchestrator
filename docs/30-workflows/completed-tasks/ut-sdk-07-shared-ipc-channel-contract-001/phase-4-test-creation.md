# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 4                                         |
| Phase名    | テスト作成                                |
| 前提Phase  | Phase 3（設計レビューゲート）             |
| 後続Phase  | Phase 5                                   |
| ステータス | 未実施                                    |
| 作成日     | 2026-04-06                                |
| 機能名     | ut-sdk-07-shared-ipc-channel-contract-001 |

## 目的

TDD の Red フェーズとして、3 チャンネルの parity テストを作成し、実装前の状態でテストが失敗（Red）することを確認する。Phase 5 実装完了後に Green に変わることを前提として、テストを先に作成する。

## 背景

TDD（Test-Driven Development）の原則に従い、実装前にテストを作成する。Phase 2 で設計した TC-01〜TC-09 を実際のテストコードとして実装し、現時点（shared 未定義・preload 直書き状態）では失敗することを確認する。

**Phase 4 着手前の命名規則確認（必須）**:

Phase 1-3 で確認した以下の命名規則との整合を着手前に実施すること:

- 定数グループ名: SCREAMING_SNAKE_CASE（例: SKILL_CREATOR_RUNTIME_CHANNELS）
- 文字列値: "skill-creator:xxx" の kebab-case 形式（例: "skill-creator:progress"）
- テストファイルの describe ブロック: 上記命名規則に合わせた説明文を使用する
- import パス: `@repo/shared/src/ipc/channels` の形式を使用する（モノレポ規約に準拠）

この確認を完了してからテストコードの実装に着手すること。確認結果を `outputs/phase-4/red-phase-result.md` に記録すること。

## 実行タスク

### タスク1: shared channels テストの作成

**目的**: `packages/shared/src/ipc/__tests__/channels.test.ts` に SKILL_CREATOR_RUNTIME_CHANNELS の値・型・IPC_CHANNELS スプレッドのテストを追加する

**実行手順**:

1. `packages/shared/src/ipc/__tests__/channels.test.ts` が存在するか確認する（存在しない場合は新規作成）
2. Phase 2 の validation-matrix.md を参照し、TC-01〜TC-06 のテストコードを実装する
3. テスト実装後、`pnpm --filter @repo/shared test:run -- src/ipc/__tests__/channels.test.ts` でテストを実行する
4. 実行結果（失敗＝Red）のスクリーンショットまたはログを `outputs/phase-4/red-phase-result.md` に記録する

**追加するテストケース（TC-01〜TC-06）**:

```typescript
// TC-01
it('SKILL_CREATOR_PROGRESS の文字列値が "skill-creator:progress" であること', () => {
  expect(SKILL_CREATOR_RUNTIME_CHANNELS.SKILL_CREATOR_PROGRESS).toBe(
    "skill-creator:progress",
  );
});

// TC-02
it('SKILL_CREATOR_WORKFLOW_STATE_CHANGED の文字列値が "skill-creator:workflow-state-changed" であること', () => {
  expect(
    SKILL_CREATOR_RUNTIME_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
  ).toBe("skill-creator:workflow-state-changed");
});

// TC-03
it('SKILL_CREATOR_ADAPTER_STATUS_CHANGED の文字列値が "skill-creator:adapter-status-changed" であること', () => {
  expect(
    SKILL_CREATOR_RUNTIME_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED,
  ).toBe("skill-creator:adapter-status-changed");
});

// TC-04
it("IPC_CHANNELS.SKILL_CREATOR_PROGRESS が shared の値と等しいこと", () => {
  expect(IPC_CHANNELS.SKILL_CREATOR_PROGRESS).toBe(
    SKILL_CREATOR_RUNTIME_CHANNELS.SKILL_CREATOR_PROGRESS,
  );
});

// TC-05
it("IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED が shared の値と等しいこと", () => {
  expect(IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED).toBe(
    SKILL_CREATOR_RUNTIME_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
  );
});

// TC-06
it("IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED が shared の値と等しいこと", () => {
  expect(IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED).toBe(
    SKILL_CREATOR_RUNTIME_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED,
  );
});
```

**期待される成果物**:

- `packages/shared/src/ipc/__tests__/channels.test.ts`（TC-01〜TC-06 追加済み）
- `outputs/phase-4/red-phase-result.md`（TC-01〜TC-06 の失敗ログ）

---

### タスク2: cross-layer parity テストの作成

**目的**: `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` に 3 チャンネルの cross-layer parity テストを追加する

**実行手順**:

1. `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` が存在するか確認する（存在しない場合は新規作成）
2. Phase 2 の validation-matrix.md を参照し、TC-07〜TC-09 のテストコードを実装する
3. preload の `IPC_CHANNELS` と shared の `IPC_CHANNELS` の同値比較テストを実装する
4. テスト実装後、`pnpm --filter @repo/desktop test:run -- src/main/services/runtime/__tests__/governance-bundle.test.ts` でテストを実行する
5. 実行結果（失敗＝Red）のログを `outputs/phase-4/red-phase-result.md` に追記する

**追加するテストケース（TC-07〜TC-09）**:

```typescript
// TC-07
it("preload IPC_CHANNELS の SKILL_CREATOR_PROGRESS が shared の値と等しいこと（parity）", () => {
  expect(preloadChannels.IPC_CHANNELS.SKILL_CREATOR_PROGRESS).toBe(
    sharedChannels.IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
  );
});

// TC-08
it("preload IPC_CHANNELS の SKILL_CREATOR_WORKFLOW_STATE_CHANGED が shared の値と等しいこと（parity）", () => {
  expect(
    preloadChannels.IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
  ).toBe(sharedChannels.IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED);
});

// TC-09
it("preload IPC_CHANNELS の SKILL_CREATOR_ADAPTER_STATUS_CHANGED が shared の値と等しいこと（parity）", () => {
  expect(
    preloadChannels.IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED,
  ).toBe(sharedChannels.IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED);
});
```

**期待される成果物**:

- `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts`（TC-07〜TC-09 追加済み）
- `outputs/phase-4/red-phase-result.md`（TC-07〜TC-09 の失敗ログを追記）

---

### タスク3: private method テスト方針の確認

**目的**: 本タスクに private method が含まれないことを確認し、テスト方針を記録する

**実行手順**:

1. SKILL_CREATOR_RUNTIME_CHANNELS の設計が純粋な定数オブジェクトであり、private method を持たないことを確認する
2. テスト対象はすべて export された定数・オブジェクトのプロパティであることを red-phase-result.md に記録する
3. 以下の方針を明記する:
   - **private method テスト**: 該当なし（本タスクは定数定義のみを対象とする）
   - **テスト対象の分類**: public constants（SKILL_CREATOR_RUNTIME_CHANNELS・IPC_CHANNELS のスプレッド）

**期待される成果物**:

- `outputs/phase-4/red-phase-result.md`（private method テスト方針を含む）

---

## テストケース一覧

| TC ID | テストファイル                                       | テスト内容                                               | 期待状態（Phase 4） |
| ----- | ---------------------------------------------------- | -------------------------------------------------------- | ------------------- |
| TC-01 | `packages/shared/src/ipc/__tests__/channels.test.ts` | SKILL_CREATOR_PROGRESS の文字列値検証                    | 失敗（Red）         |
| TC-02 | `packages/shared/src/ipc/__tests__/channels.test.ts` | SKILL_CREATOR_WORKFLOW_STATE_CHANGED の文字列値検証      | 失敗（Red）         |
| TC-03 | `packages/shared/src/ipc/__tests__/channels.test.ts` | SKILL_CREATOR_ADAPTER_STATUS_CHANGED の文字列値検証      | 失敗（Red）         |
| TC-04 | `packages/shared/src/ipc/__tests__/channels.test.ts` | IPC_CHANNELS.SKILL_CREATOR_PROGRESS の shared 値との一致 | 失敗（Red）         |
| TC-05 | `packages/shared/src/ipc/__tests__/channels.test.ts` | IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED の一致 | 失敗（Red）         |
| TC-06 | `packages/shared/src/ipc/__tests__/channels.test.ts` | IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED の一致 | 失敗（Red）         |
| TC-07 | governance-bundle.test.ts (desktop)                  | preload SKILL_CREATOR_PROGRESS の parity 検証            | 失敗（Red）         |
| TC-08 | governance-bundle.test.ts (desktop)                  | preload SKILL_CREATOR_WORKFLOW_STATE_CHANGED の parity   | 失敗（Red）         |
| TC-09 | governance-bundle.test.ts (desktop)                  | preload SKILL_CREATOR_ADAPTER_STATUS_CHANGED の parity   | 失敗（Red）         |

## 参照資料

| 参照資料                   | パス                                                 | 内容                                      |
| -------------------------- | ---------------------------------------------------- | ----------------------------------------- |
| Phase 2 設計               | `outputs/phase-2/design.md`                          | テスト実装の設計ガイド                    |
| Phase 2 validation-matrix  | `outputs/phase-2/validation-matrix.md`               | TC-01〜TC-09 の疑似コード                 |
| Phase 3 レビュー結果       | `outputs/phase-3/design-review-result.md`            | MINOR 指摘の反映確認                      |
| Phase 1 受入基準           | `outputs/phase-1/acceptance-criteria.md`             | AC-1〜AC-7（テスト網羅性の確認に使用）    |
| shared channels.ts         | `packages/shared/src/ipc/channels.ts`                | テスト対象の current code（未定義を確認） |
| preload channels.ts        | `apps/desktop/src/preload/channels.ts`               | parity テストの比較対象                   |
| task-specification-creator | `.claude/skills/task-specification-creator/SKILL.md` | Phase テンプレート                        |

## 成果物

| 成果物                 | パス                                                                         | 内容                                         |
| ---------------------- | ---------------------------------------------------------------------------- | -------------------------------------------- |
| shared channels テスト | `packages/shared/src/ipc/__tests__/channels.test.ts`                         | TC-01〜TC-06（実装前は failing）             |
| parity テスト          | `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` | TC-07〜TC-09（実装前は failing）             |
| red-phase-result       | `outputs/phase-4/red-phase-result.md`                                        | TC-01〜TC-09 の失敗ログ・private method 方針 |

## 統合テスト連携

- TC-01〜TC-09 の失敗（Red）を red-phase-result.md に記録することで、Phase 5 実装後の Green 変化を追跡可能にする
- cross-layer parity テスト（TC-07〜TC-09）は AC-5 の達成確認に直接対応する
- Phase 5 実装完了後に同じテストコマンドを実行し、全テストが Green になることを確認する

## 完了条件

- [ ] TC-01〜TC-06 が channels.test.ts (shared) に追加されている
- [ ] TC-07〜TC-09 が governance-bundle.test.ts (desktop) に追加されている
- [ ] TDD Red: 全テスト（TC-01〜TC-09）が失敗することを確認
- [ ] 失敗ログが outputs/phase-4/red-phase-result.md に記録されている
- [ ] private method テスト方針（該当なし）が red-phase-result.md に明記されている
- [ ] 命名規則（SCREAMING_SNAKE_CASE / "skill-creator:xxx" kebab-case）との整合確認が完了している

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が PASS または MINOR 判定で完了していること
- **後続**: Phase 5（実装）へ進む

## 次のPhase

完了後、以下のファイルを実行してください:
`docs/30-workflows/ut-sdk-07-shared-ipc-channel-contract-001/phase-5-implementation.md`
