# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 4                                       |
| Phase名    | テスト作成                              |
| 前提Phase  | Phase 3: 設計レビューゲート（PASS判定） |
| 後続Phase  | なし（最終Phase）                       |
| ステータス | 完了                                    |
| 作成日     | 2026-04-16                              |
| 機能名     | ut-fix-ci-ipc-continue-on-error-001     |

---

## 目的

本タスクはCI設定（YAML）の変更であるため、ユニットテストコードの作成は不要である。代わりに以下の2点を設計・実施する。

1. `node scripts/verify-ipc-4layer.cjs` のローカル実行確認手順
2. CIトリガーによる動作確認プラン（変更後のCIが正しくブロッキング動作することを検証するシナリオ）

## 背景

`continue-on-error: true` を削除した後、IPC違反があればCIがREDになる。この変更が正しく機能していることを確認するためには、(a) 通常フロー（違反なし→PASS）と (b) 異常フロー（違反あり→FAIL・ブロック）の両方をCIで検証する必要がある。

---

## 実行タスク

### タスク1: ローカル事前確認手順

**目的**: 実装（Phase 5）前に、現在のコードベースがRule-1/2/3全PASSであることをローカルで確認する。これにより、変更後のCIが誤検知でREDにならないことを保証する。

**実行手順**:

1. プロジェクトルートへ移動する

   ```bash
   cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260416-141958-wt-5
   ```

2. スクリプトを実行する

   ```bash
   node scripts/verify-ipc-4layer.cjs
   ```

3. 出力を確認する（期待出力）

   ```
   === IPC 4-Layer Alignment Verification ===

   [Rule-1] shared で定義されたチャネルが preload ホワイトリストに未登録: PASS
   [Rule-2] preload invoke ホワイトリストのチャネルが main ハンドラに未実装: PASS
   [Rule-3] renderer で使用されたチャネルが shared/preload に未定義: PASS

   --- Summary ---
   Total rules: 3
   Passed: 3
   Failed: 0
   ```

4. 終了コードが 0 であることを確認する

   ```bash
   node scripts/verify-ipc-4layer.cjs; echo "Exit code: $?"
   # 期待値: Exit code: 0
   ```

5. FAILがある場合は実装前に修正する
   - FAILの内容を確認し、該当するIPC違反（未登録チャネル・未実装ハンドラ・未定義チャネル）を修正する
   - 修正後に再度ステップ2〜4を実施して全PASSを確認する

**期待される成果物**:

- `Failed: 0` の実行ログ（作業者が記録）

**判定基準**:

| 結果                  | 次のアクション              |
| --------------------- | --------------------------- |
| `Failed: 0`（全PASS） | Phase 5（実装）へ進行       |
| `Failed: 1以上`       | IPC違反を修正してから再確認 |

---

### タスク2: CI実行確認プラン（通常フロー）

**目的**: `continue-on-error: true` 削除後、IPC違反がない状態でCIが正常にPASSすることを確認する。

**トリガー方法**:

```
ブランチ作成 → ci.yml 変更（continue-on-error: true 削除）→ PR作成
```

**確認手順**:

1. 実装ブランチを作成する

   ```bash
   git checkout -b fix/remove-continue-on-error-ipc-guard
   ```

2. `.github/workflows/ci.yml` の `continue-on-error: true`（297行目）を削除する

   ```bash
   # 変更前後の確認
   grep -n "continue-on-error" .github/workflows/ci.yml
   # 期待出力（変更後）: 410: continue-on-error: true  ← security ジョブのみ残る
   ```

3. コミットしてPRを作成する

   ```bash
   git add .github/workflows/ci.yml
   git commit -m "fix(ci): remove continue-on-error from verify-ipc-4layer job"
   gh pr create --title "fix(ci): enable IPC 4-layer guard as blocking CI check" \
     --body "Removes continue-on-error: true from verify-ipc-4layer job to enable CI blocking."
   ```

4. CI実行結果を確認する
   ```bash
   gh run list --branch fix/remove-continue-on-error-ipc-guard
   gh run view <run-id>
   ```

**期待されるCI結果（通常フロー）**:

| ジョブ              | 期待結果   | 確認ポイント                               |
| ------------------- | ---------- | ------------------------------------------ |
| `verify-ipc-4layer` | PASS（緑） | `Failed: 0` のログ出力                     |
| `build`             | PASS（緑） | `verify-ipc-4layer` PASSを受けて実行される |
| その他ジョブ        | 変更なし   | lint, typecheck, test-\* は影響を受けない  |

**期待される成果物**:

- CIが全ジョブPASSした結果の確認（PRのCI結果URL）

---

### タスク3: CI実行確認プラン（異常フロー・IPC違反混入シナリオ）

**目的**: IPC違反を意図的に混入させた場合に、`continue-on-error: true` 削除後のCIが正しくブロックされることを確認する。

**重要**: このシナリオはテスト用の一時的な変更であり、確認完了後は必ず元に戻すこと。

**シナリオ1: Rule-1違反（shared定義チャネルがpreloadホワイトリストに未登録）**

1. `packages/shared/src/ipc/channels.ts` に検証用チャネルを追加する

   ```typescript
   // 検証用（テスト後に削除）
   export const TEST_VIOLATION_CHANNEL = "test:ipc-guard-violation" as const;
   ```

2. `apps/desktop/src/preload/channels.ts` には追加しない（意図的な未登録）

3. CI実行時の期待動作:
   ```
   verify-ipc-4layer:
     [Rule-1] shared で定義されたチャネルが preload ホワイトリストに未登録: FAIL (1 missing)
       ::error::Rule-1: Channel "test:ipc-guard-violation" - shared で定義されたチャネルが preload ホワイトリストに未登録
     Failed: 1
   → Exit code: 1
   → verify-ipc-4layer ジョブ: FAIL（赤）
   → build ジョブ: SKIP（verify-ipc-4layer に依存）
   ```

**シナリオ2: Rule-2違反（preload invokeホワイトリストのチャネルがmainハンドラに未実装）**

1. `apps/desktop/src/preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` に検証用チャネルを追加する

   ```typescript
   // 検証用（テスト後に削除）
   IPC_CHANNELS.TEST_UNIMPLEMENTED,
   ```

2. `apps/desktop/src/preload/channels.ts` の `IPC_CHANNELS` に対応エントリを追加する

   ```typescript
   TEST_UNIMPLEMENTED: "test:unimplemented-handler" as const,
   ```

3. `apps/desktop/src/main/` にはハンドラを実装しない（意図的な未実装）

4. CI実行時の期待動作:
   ```
   verify-ipc-4layer:
     [Rule-2] preload invoke ホワイトリストのチャネルが main ハンドラに未実装: FAIL (1 missing)
     Failed: 1
   → verify-ipc-4layer ジョブ: FAIL（赤）
   → build ジョブ: SKIP
   ```

**シナリオ3: Rule-3違反（rendererで使用されたチャネルがshared/preloadに未定義）**

1. `apps/desktop/src/renderer/` 配下の任意のファイルに存在しないチャネルへの呼び出しを追加する

   ```typescript
   // 検証用（テスト後に削除）
   safeInvoke("test:undefined-channel-in-renderer");
   ```

2. `packages/shared/src/ipc/channels.ts` および `apps/desktop/src/preload/channels.ts` には追加しない

3. CI実行時の期待動作:
   ```
   verify-ipc-4layer:
     [Rule-3] renderer で使用されたチャネルが shared/preload に未定義: FAIL (1 missing)
     Failed: 1
   → verify-ipc-4layer ジョブ: FAIL（赤）
   → build ジョブ: SKIP
   ```

**確認後の復元手順**:

```bash
# 検証用変更を全て元に戻す
git checkout -- packages/shared/src/ipc/channels.ts
git checkout -- apps/desktop/src/preload/channels.ts
git checkout -- apps/desktop/src/renderer/  # シナリオ3を実施した場合
```

**期待される成果物**:

- 各シナリオにおいてCIがブロック（`verify-ipc-4layer` FAIL）したことの確認ログ

---

### タスク4: テストシナリオのサマリと実施チェックリスト

**目的**: テスト計画全体を整理し、実施状況を追跡する。

**テストシナリオ一覧**:

| シナリオID | シナリオ名                  | 種別     | 対象Rule   | 期待結果                |
| ---------- | --------------------------- | -------- | ---------- | ----------------------- |
| TS-01      | ローカル全PASS確認          | 事前確認 | Rule-1/2/3 | `Failed: 0`             |
| TS-02      | CI通常フロー（違反なし）    | CI確認   | -          | 全ジョブGREEN           |
| TS-03      | CI異常フロー Rule-1違反混入 | CI確認   | Rule-1     | `verify-ipc-4layer` RED |
| TS-04      | CI異常フロー Rule-2違反混入 | CI確認   | Rule-2     | `verify-ipc-4layer` RED |
| TS-05      | CI異常フロー Rule-3違反混入 | CI確認   | Rule-3     | `verify-ipc-4layer` RED |

**実施優先度**:

| 優先度 | シナリオID | 理由                                                 |
| ------ | ---------- | ---------------------------------------------------- |
| 必須   | TS-01      | 実装前に必ず実施（誤検知リスク排除）                 |
| 必須   | TS-02      | 変更後の正常動作確認                                 |
| 推奨   | TS-03〜05  | Guard機能の動作証明（少なくとも1シナリオを実施推奨） |

**実施チェックリスト**:

- [ ] TS-01: ローカルで `node scripts/verify-ipc-4layer.cjs` を実行し `Failed: 0` を確認
- [ ] TS-02: PRのCI結果で `verify-ipc-4layer` ジョブがPASSしたことを確認
- [ ] TS-03: Rule-1違反混入時に `verify-ipc-4layer` ジョブがFAILし、`build` ジョブがSKIPされたことを確認（任意）
- [ ] TS-04: Rule-2違反混入時に `verify-ipc-4layer` ジョブがFAILし、`build` ジョブがSKIPされたことを確認（任意）
- [ ] TS-05: Rule-3違反混入時に `verify-ipc-4layer` ジョブがFAILし、`build` ジョブがSKIPされたことを確認（任意）
- [ ] TS-03〜05 実施後は必ず混入変更を `git checkout --` で元に戻したことを確認

**期待される成果物**:

- テストシナリオ一覧と実施チェックリスト（本タスク内に記載済み）

---

## 参照資料

| 参照資料             | パス                                                                             | 内容                                              |
| -------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------- |
| Phase 1 要件定義     | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/phase-1-requirements.md`  | ローカルPASS確認の詳細手順                        |
| Phase 2 設計         | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/phase-2-design.md`        | Before/After スニペット、変更実装方針             |
| Phase 3 設計レビュー | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/phase-3-design-review.md` | レビュー判定結果                                  |
| CI設定ファイル       | `.github/workflows/ci.yml`                                                       | 変更対象（297行目）と build.needs（442〜453行目） |
| IPC検証スクリプト    | `scripts/verify-ipc-4layer.cjs`                                                  | Rule-1/2/3の検証ロジック、終了コード仕様          |
| Shared チャネル定義  | `packages/shared/src/ipc/channels.ts`                                            | シナリオTS-03の違反混入先                         |
| Preload チャネル定義 | `apps/desktop/src/preload/channels.ts`                                           | シナリオTS-04の違反混入先                         |

---

## 成果物

| 成果物              | パス                                                                             | 内容                                   |
| ------------------- | -------------------------------------------------------------------------------- | -------------------------------------- |
| テスト作成仕様書    | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/phase-4-test-creation.md` | 本ファイル                             |
| CI実行確認プラン    | 本ファイル内（タスク2）                                                          | 通常フローの確認手順                   |
| IPC違反混入シナリオ | 本ファイル内（タスク3）                                                          | 異常フローの確認手順（TS-03〜05）      |
| テストシナリオ一覧  | 本ファイル内（タスク4）                                                          | 全シナリオのサマリと実施チェックリスト |

---

## 統合テスト連携

- TS-01（ローカル事前確認）はPhase 1タスク1と対応する
- TS-02〜05（CI実行確認）は実装（Phase 5）完了後に実施する
- TS-03〜05の違反混入シナリオは、独立したブランチまたはフォーク環境で実施し、mainブランチへのマージ前に必ず元に戻すこと

---

## 完了条件

- [ ] TS-01（ローカル全PASS確認）の手順を定義した
- [ ] TS-02（CI通常フロー確認）のトリガー方法・確認手順・期待結果を定義した
- [ ] TS-03〜05（IPC違反混入シナリオ）のRule別混入方法・期待動作・復元手順を定義した
- [ ] テストシナリオ一覧と実施チェックリストを作成した
- [ ] 必須シナリオ（TS-01・TS-02）と推奨シナリオ（TS-03〜05）の優先度を明示した

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜4）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 3: 設計レビューゲート（PASS判定が必要）
- **後続**: なし（最終Phase）

---

## 備考

本Phaseは「テスト作成」フェーズであるが、CI設定変更という性質上、ユニットテストコードの新規作成は発生しない。代わりに以下を「テスト成果物」として扱う。

- **ローカル実行確認**: `node scripts/verify-ipc-4layer.cjs` の実行ログ
- **CI実行確認プラン**: どのブランチ・どのトリガーでCIを起動し何を確認するかの手順書
- **IPC違反混入シナリオ**: IPC Guard が正しくCIをブロックすることを証明するテストシナリオ定義

実際のCI実行はPhase 5（実装）完了後に行う。
