# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 6                                            |
| タスクID   | TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001       |
| ステータス | 未実施                                       |
| 作成日     | 2026-04-19                                   |
| 前Phase    | 5: 実装（Wave 1 スナップショットテスト導入） |
| 次Phase    | 7: カバレッジ確認                            |

---

## 目的

Wave 1 の契約を固定したうえで、Wave 2 対象 handler の registration snapshot テストを完了させる。
追加の fail path は、実装契約に裏付けがあるものだけを採用し、
人工的な自己検証テストを必須にしない。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: Wave 1テスト契約の補強

**目的**: Wave 1対象handlerに対し、必要であれば契約に基づく補助テストを追加する

**実行手順**:

1. `apps/desktop/src/main/ipc/__tests__/` 配下のWave 1テストファイルを列挙する
2. 各テストファイルに対して以下の観点を見直す
   - `REG-SNAP` / `REG-DEDUP` / `REG-COUNT` で十分か
   - mixed / `on only` handler に追加確認が必要か
   - 実装が保証していない「例外発生」を仕様で要求していないか
3. 追加したテストが `pnpm vitest run` でPASSすることを確認する

**対象ファイル例**:

```
apps/desktop/src/main/ipc/__tests__/
  creatorHandlers.registrationSnapshot.test.ts
  ※ 各handlerに対応するテストファイル
```

**補助テストの雛形例**:

```typescript
describe("fail path: チャンネル欠損検出", () => {
  it("登録されるべきチャンネルが全て handle されている", () => {
    const registeredChannels = captureHandledChannels(() => {
      registerXxxHandlers(mockIpcMain, mockDeps);
    });
    expect(registeredChannels).toEqual(
      expect.arrayContaining(EXPECTED_CHANNELS_FOR_XXX),
    );
  });
});

describe("fail path: 重複チャンネル検出", () => {
  it("同一チャンネルが二重登録されていないことを検証できる", () => {
    registerXxxHandlers(mockIpcMain, mockDeps);
    expect(new Set(captureHandledChannels()).size).toBe(
      captureHandledChannels().length,
    );
  });
});
```

**期待される成果物**:

- Wave 1テストファイル（各 `register*Handlers` に対応）のfail pathテスト追加

---

### タスク2: Wave 2対象handlerのテスト作成開始

**目的**: `wave-plan.md` で承認された Wave 2 対象 handler の registration snapshot テストを新規作成する

**実行手順**:

1. `apps/desktop/src/main/ipc/` 配下のhandlerファイルを列挙し、Wave 2対象を特定する
2. `wave-plan.md` の Wave 2 対象を正本としてテストファイルを新規作成する
3. 各テストファイルに以下を実装する
   - `ipcMain.handle` / `ipcMain.on` 呼び出しをキャプチャするmockセットアップ
   - `register*Handlers()` 実行後のチャンネル一覧スナップショット
   - チャンネル数が期待値と一致することのアサーション
4. 作成したテストが `pnpm vitest run` でPASSすることを確認する

**テストファイル配置先**:

```
apps/desktop/src/main/ipc/__tests__/
  windowHandlers.registrationSnapshot.test.ts
  authHandlers.registrationSnapshot.test.ts
  profileHandlers.registrationSnapshot.test.ts
```

**期待される成果物**:

- `outputs/phase-6/wave2-test-plan.md`: Wave 2テスト計画（対象handler・チャンネル一覧）
- Wave 2テストファイル群（`apps/desktop/src/main/ipc/__tests__/` 配下）

---

### タスク3: Wave 1テスト全体のCI PASS確認

**目的**: Wave 1の全スナップショットテストがCIで正常にPASSすることを確認する

**実行手順**:

1. 以下のコマンドを実行してWave 1テストが全PASStすることを確認する

```bash
pnpm vitest run apps/desktop/src/main/ipc/__tests__/
```

2. 失敗したテストがある場合は原因を特定し修正する
3. スナップショットが更新されている場合は `--update-snapshots` フラグを使用せず、変更内容を精査してから手動で更新する
4. 全PASSを確認したらその結果を記録する

**期待される成果物**:

- Wave 1テスト全PASS確認（コマンド出力結果）

---

## 参照資料

| 参照資料                    | パス                                                                               | 内容                                |
| --------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------- |
| Wave 1既存テスト            | `apps/desktop/src/main/ipc/__tests__/creatorHandlers.registrationSnapshot.test.ts` | 既存 registration snapshot パターン |
| IPCハンドラー登録ファイル群 | `apps/desktop/src/main/ipc/`                                                       | 全 register\*Handlers ファイル      |
| index.md（Wave分割方針）    | `docs/30-workflows/TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001/index.md`                | Wave 1/2/3の対象handler定義         |
| IPC Handler Pattern         | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`       | IPCハンドラー登録パターン           |

---

## 成果物

| 成果物                 | パス                                                                | 内容                         |
| ---------------------- | ------------------------------------------------------------------- | ---------------------------- |
| Wave 1補助テスト       | `apps/desktop/src/main/ipc/__tests__/*registrationSnapshot.test.ts` | 契約補強が必要な場合のみ追加 |
| Wave 2テスト計画書     | `outputs/phase-6/wave2-test-plan.md`                                | 対象handler・チャンネル一覧  |
| Wave 2テストファイル群 | `apps/desktop/src/main/ipc/__tests__/`（windowHandlers等）          | 新規スナップショットテスト   |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 6の統合テスト連携アクション**:

- Wave 1テストのfail path追加により、handlerチャンネル欠損・重複のCI検出を強化する
- Wave 2テスト作成により、IPC handler登録の回帰guard範囲をWave 1以外に拡張する
- 本Phaseで追加・作成した全テストが `pnpm vitest run` でPASSすることを統合確認する
- スナップショットファイルがGitにコミットされ、差分検知が機能することを確認する

---

## 多角的チェック観点（AIが判断）

| 観点                   | チェック内容                                                             |
| ---------------------- | ------------------------------------------------------------------------ |
| 正常系カバレッジ       | 全Wave 2 handlerの登録チャンネルがスナップショットに含まれているか       |
| 異常系カバレッジ       | チャンネル欠損・重複登録の両パターンがテストされているか                 |
| スナップショット有効性 | スナップショットが意図しない変更を検出できる粒度（チャンネル名ベース）か |
| handle/on 区別         | `ipcMain.handle` と `ipcMain.on` を別々にキャプチャしているか            |
| テスト独立性           | 各テストが他のテストに依存せず独立して実行できるか                       |
| CI時間への影響         | テスト追加によるCI実行時間の増分が許容範囲内（30秒以内/Wave）か          |

---

## サブタスク管理

| サブタスクID | 内容                               | ステータス |
| ------------ | ---------------------------------- | ---------- |
| ST-6-01      | Wave 1 fail path（欠損）テスト追加 | 未実施     |
| ST-6-02      | Wave 1 fail path（重複）テスト追加 | 未実施     |
| ST-6-03      | Wave 2テスト計画書作成             | 未実施     |
| ST-6-04      | Wave 2テストファイル新規作成       | 未実施     |
| ST-6-05      | Wave 1全テストCI PASS確認          | 未実施     |

---

## 完了条件

- [ ] Wave 1 の必須テスト契約（REG-SNAP・REG-DEDUP・REG-COUNT）が維持されている
- [ ] Wave 2対象handler（registerWindowHandlers, registerAuthHandlers, registerProfileHandlersなど）のテストファイルが新規作成されている
- [ ] `outputs/phase-6/wave2-test-plan.md` が生成されている
- [ ] `pnpm vitest run` でWave 1の全テストがPASSしている
- [ ] Wave 2 対象のテストが作成され、少なくとも代表ケースで PASS が確認されている
- [ ] スナップショットファイルがGitの追跡対象に含まれている

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001/phase-7-coverage.md`
