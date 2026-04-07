# Phase 13: PR 作成・CI 確認

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 13                                          |
| Phase名    | PR 作成                                     |
| タスクID   | UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001   |
| タスク名   | Skill Creator runtime channel shared 正本化 |
| 前提Phase  | Phase 12: ドキュメント更新                  |
| 後続Phase  | -（マージ後完了）                           |
| ステータス | BLOCKED（ユーザー明示承認が必要）           |
| 作成日     | 2026-04-06                                  |

## 目的

ユーザーの明示的な承認後にのみ PR を作成する。ローカルチェックを実行し、承認を得た後にコミット・PR 作成・CI 確認を実施する。

## 背景

`SKILL_CREATOR_RUNTIME_CHANNELS` の shared 正本化と `apps/desktop/src/preload/channels.ts` の import 切り替え、および関連テストの追加・修正をまとめて PR として提出する。本 Phase はデフォルトで BLOCKED 状態であり、ユーザーの明示的な承認があった場合にのみ実行する。

> **重要**: PR 作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。承認がない限り、commit / push / PR 作成は一切実行しない。

## 実行タスク

### タスク1: ローカル最終確認

**目的**: PR 作成前にローカル環境で品質ゲートを通過することを確認する

**実行手順**:

1. `git status` で変更ファイルを確認する
2. shared パッケージの vitest と typecheck を実行して green であることを確認する
3. desktop パッケージの vitest と typecheck を実行して green であることを確認する
4. 結果を `outputs/phase-13/local-check-result.md` に記録する

**実行コマンド**:

```bash
# 変更ファイル確認
git status

# shared vitest
pnpm --filter @repo/shared test:run

# shared typecheck
pnpm --filter @repo/shared typecheck

# desktop vitest
pnpm --filter @repo/desktop test:run

# desktop typecheck
pnpm --filter @repo/desktop typecheck
```

**期待される成果物**:

- `outputs/phase-13/local-check-result.md`

---

### タスク2: commit 作成（ユーザー承認後）

**目的**: 変更内容を適切なコミットメッセージでコミットする

**前提条件**: ユーザーからの明示的な承認

**実行手順**:

1. ユーザーからの承認を確認する（承認がない場合は実行しない）2. コミット対象ファイルをステージングする:
   - `packages/shared/src/ipc/channels.ts`
   - `apps/desktop/src/preload/channels.ts`
   - `apps/desktop/src/preload/channels.test.ts`
   - `packages/shared/src/ipc/__tests__/channels.test.ts`
   - `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts`
   - `packages/shared/vitest.config.ts`
2. コミットを作成する（`--no-verify` は使用禁止）

**commit message**:

```
feat(shared): add SKILL_CREATOR_RUNTIME_CHANNELS to shared IPC contract
```

**実行コマンド**:

```bash
git add packages/shared/src/ipc/channels.ts
git add apps/desktop/src/preload/channels.ts
git add apps/desktop/src/preload/channels.test.ts
git add packages/shared/src/ipc/__tests__/channels.test.ts
git add apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts
git add packages/shared/vitest.config.ts
git commit -m "feat(shared): add SKILL_CREATOR_RUNTIME_CHANNELS to shared IPC contract"
```

> **注意**: `--no-verify` は絶対に使用禁止。

---

### タスク3: PR 作成（ユーザー承認後）

**目的**: GitHub に PR を作成する

**前提条件**: ユーザーからの明示的な承認 + タスク2 完了

**実行手順**:

1. ユーザーからの承認を確認する（承認がない場合は実行しない）
2. リモートブランチに push する
3. `gh pr create` で PR を作成する

**PR title**:

```
[UT-SDK-07] Skill Creator runtime channel shared 正本化
```

**PR body**:

```
## 変更サマリー

UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001: Skill Creator runtime 系 3 チャンネルを shared 正本化。

### 変更内容

- `packages/shared/src/ipc/channels.ts` に `SKILL_CREATOR_RUNTIME_CHANNELS` オブジェクトを追加
  - `SKILL_CREATOR_PROGRESS = "skill-creator:progress"`
  - `SKILL_CREATOR_WORKFLOW_STATE_CHANGED = "skill-creator:workflow-state-changed"`
  - `SKILL_CREATOR_ADAPTER_STATUS_CHANGED = "skill-creator:adapter-status-changed"`
- `apps/desktop/src/preload/channels.ts` の 3 チャンネル直書きを shared import に切り替え
- `apps/desktop/src/preload/channels.test.ts` に runtime allowlist 回帰テストを追加
- `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` に cross-layer parity テストを追加
- `packages/shared/src/ipc/__tests__/channels.test.ts` に shared channels のユニットテストを追加
- `packages/shared/vitest.config.ts` で `src/ipc/channels.ts` を coverage 対象に戻す
- ALLOWED_ON_CHANNELS の 3 チャンネル回帰を追加

## 受入基準確認

- [x] AC-1: `SKILL_CREATOR_PROGRESS` が shared に定義されている
- [x] AC-2: `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` が shared に定義されている
- [x] AC-3: `SKILL_CREATOR_ADAPTER_STATUS_CHANGED` が shared に定義されている
- [x] AC-4: preload が 3 チャンネルを shared から import している
- [x] AC-5: cross-layer parity テストが全 3 チャンネルで PASS
- [x] AC-6: 既存 IPC handler / ALLOWED_ON_CHANNELS に破壊的変更なし
- [x] AC-7: `IPC_CHANNELS` に 3 チャンネルが含まれている

## テスト結果

- pnpm --filter @repo/shared test:run: PASS
- pnpm --filter @repo/shared typecheck: PASS
- pnpm --filter @repo/desktop test:run: PASS
- pnpm --filter @repo/desktop typecheck: PASS

Closes #1682
```

**実行コマンド**:

```bash
git push origin HEAD

gh pr create \
  --title "[UT-SDK-07] Skill Creator runtime channel shared 正本化" \
  --body "..."
```

---

### タスク4: CI 確認

**目的**: CI パイプラインの実行結果を確認する

**前提条件**: タスク3 完了

**実行手順**:

1. PR 作成後、CI の実行状況を確認する
2. CI が全て green であることを確認する
3. CI 失敗がある場合は原因を調査・修正する

**実行コマンド**:

```bash
gh pr checks
```

---

## 参照資料

| 参照資料              | パス                                     | 用途                 |
| --------------------- | ---------------------------------------- | -------------------- |
| Phase 1 受入基準      | `phase-1-requirements.md`                | スコープ・受入基準   |
| Phase 12 ドキュメント | `phase-12-documentation.md`              | ドキュメント更新結果 |
| Phase 11 手動テスト   | `outputs/phase-11/manual-test-result.md` | テスト証跡           |
| ローカルチェック結果  | `outputs/phase-13/local-check-result.md` | 実行時に更新         |
| 変更サマリー          | `outputs/phase-13/change-summary.md`     | PR 説明の素案        |

## 統合テスト連携

- PR 作成前に vitest / typecheck で最終確認を行う
- CI で cross-layer parity テストが通過することを確認する

## 成果物

| 成果物               | パス                                     | 内容                    |
| -------------------- | ---------------------------------------- | ----------------------- |
| ローカルチェック結果 | `outputs/phase-13/local-check-result.md` | 品質ゲート通過記録      |
| 変更サマリー         | `outputs/phase-13/change-summary.md`     | PR 説明の素案・変更一覧 |

## 完了条件

- [ ] ユーザー明示承認済み
- [ ] ローカルチェック（vitest / typecheck）が全て green
- [ ] コミットが作成されている（`--no-verify` 不使用）
- [ ] PR が作成されている（title: `[UT-SDK-07] Skill Creator runtime channel shared 正本化`）
- [ ] CI 通過（全チェック green）
- [ ] `outputs/phase-13/local-check-result.md` が生成されている
- [ ] `outputs/phase-13/change-summary.md` が生成されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 依存関係

| 依存 Phase | 依存成果物                                               |
| ---------- | -------------------------------------------------------- |
| Phase 12   | `outputs/phase-12/phase12-task-spec-compliance-check.md` |
| Phase 12   | `outputs/phase-12/implementation-guide.md`               |

## 次のPhase

- BLOCKED: ユーザー明示承認待ち
- 承認後: commit → push → PR 作成 → CI 確認 → マージ準備完了
