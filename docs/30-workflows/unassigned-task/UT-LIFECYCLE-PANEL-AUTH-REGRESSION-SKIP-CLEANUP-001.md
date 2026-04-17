# UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001 - タスク指示書

## メタ情報

```yaml
issue_number: 2237
task_id: UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001
task_name: SkillLifecyclePanel auth回帰テスト describe.skip クリーンアップ
category: 改善
target_feature: SkillLifecyclePanel auth回帰テスト（auth-regression.test.tsx）
priority: 中
scale: 小規模
status: 未実施
source_phase: UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001 Phase 12 未タスク検出
created_date: 2026-04-16
dependencies: [UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001]
spec_path: docs/30-workflows/unassigned-task/UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001.md
```

| 項目         | 内容                                                            |
| ------------ | --------------------------------------------------------------- |
| タスクID     | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001             |
| タスク名     | SkillLifecyclePanel auth回帰テスト describe.skip クリーンアップ |
| 分類         | 改善                                                            |
| 対象機能     | SkillLifecyclePanel auth回帰テスト（auth-regression.test.tsx）  |
| 優先度       | 中                                                              |
| 見積もり規模 | 小規模                                                          |
| ステータス   | 未実施                                                          |
| 発見元       | UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001 Phase 12              |
| 発見日       | 2026-04-16                                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001` の Phase 12 未タスクスキャンにより、
`SkillLifecyclePanel.auth-regression.test.tsx` に **5件の `describe.skip`** が残存していることが判明。

これらは `auth:login` IPC 呼び出しに関する回帰テストで、コンポーネントの認証フロー変更時に
`auth:login` が意図しないタイミングで呼び出されないことを保証するためのものである。

スキップ理由は不明だが、テストが `describe.skip` のまま放置されると
auth:login 回帰が発生しても検出できない状態が続く。

### 1.2 問題点・課題

| #   | 問題                                                                 | 影響                     |
| --- | -------------------------------------------------------------------- | ------------------------ |
| 1   | 5件の `describe.skip` により auth:login 回帰テストが無効化されている | 認証バグの回帰検出が不能 |
| 2   | スキップ理由が不明のため、修正方針が判断できない                     | 調査コストが発生         |
| 3   | auth:login IPC 呼び出しの非意図的な実行が検出されない                | セキュリティリスク       |

**残存する describe.skip 一覧（5件）**:

| テスト名                                                                        | 行  | 内容                                             |
| ------------------------------------------------------------------------------- | --- | ------------------------------------------------ |
| `TC-03: skill generation completes without auth:login timeout`                  | 305 | タイムアウト時に auth:login が呼ばれないこと     |
| `TC-05: skill generation does not call auth:login when user is unauthenticated` | 431 | 非認証時に auth:login が呼ばれないこと           |
| `TC-06: rapid skill generation clicks do not trigger multiple auth:login`       | 501 | 連打で auth:login が複数回呼ばれないこと         |
| `TC-07: auth:login is not triggered on component re-render during skill flow`   | 590 | 再レンダリングで auth:login が呼ばれないこと     |
| `TC-08: authModeSlice state changes do not trigger unexpected auth:login`       | 686 | authModeSlice 変更で auth:login が呼ばれないこと |

### 1.3 放置した場合の影響

- auth:login IPC の意図しない呼び出しが回帰しても気づかない
- 認証フロー改修時の安全網がない状態が続く
- スキップされたテストが増え、テストスイートの信頼性が低下する

---

## 2. 何を達成するか（What）

### 2.1 目的

`SkillLifecyclePanel.auth-regression.test.tsx` の 5件の `describe.skip` の原因を調査し、
修正または削除してテストスイートを有効な状態に戻す。

### 2.2 最終ゴール

1. 5件の `describe.skip` が以下のいずれかで解消されている:
   - **修正**: テストを現行の auth フローに合わせて書き直し、`describe` として有効化
   - **削除**: 現行フローで意味をなさないテストを削除し、理由を記録
2. 修正されたテストが全て PASS
3. 有効化された auth 回帰テストが CI で自動実行される

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx` の `describe.skip` 解消
- スキップ原因の調査・記録
- auth:login IPC モックパターンの現行フローへの整合

#### 含まないもの

- `SkillLifecyclePanel.llm-generation.test.tsx` のスキップ（別タスク: UT-LIFECYCLE-PANEL-LLM-GEN-DESCRIBE-SKIP-CLEANUP-001）
- プロダクションコード（`SkillLifecyclePanel.tsx`）の認証ロジック変更
- 新しい auth 回帰テストの追加

### 2.4 成果物

- クリーンアップ済み `SkillLifecyclePanel.auth-regression.test.tsx`
- スキップ原因・処置理由のログ

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001 が完了済み
- `SkillLifecyclePanel` コンポーネントの現行 auth 処理フローを把握

### 3.2 依存タスク

- UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001（完了）

### 3.3 必要な知識

- `auth:login` IPC チャンネルの呼び出し条件
- `authModeSlice` の状態管理
- `SkillLifecyclePanel` の認証フロー（`useAuthMode`, `useSkillExecution` 等）
- Vitest でのモック IPC パターン

### 3.4 推奨アプローチ

1. **原因調査先行**: 各 `describe.skip` を実際に `describe` にしてテスト実行し、失敗原因を特定する
2. **モック更新**: 現行フローに合わせて IPC モックを修正する
3. **削除判断**: 修正困難または現行フローで意味をなさない場合は削除して理由を記録する

---

## 4. 実行手順

### Phase構成

- Phase A: スキップ原因調査
- Phase B: テスト修正・有効化
- Phase C: テスト実行・確認

### Phase A: スキップ原因調査

#### 目的

各 `describe.skip` を `describe` に変換して実行し、失敗原因を特定する。

#### 手順

1. `SkillLifecyclePanel.auth-regression.test.tsx` の `describe.skip` を一時的に `describe` に変換する（ブランチ作業）
2. テストを実行し、失敗メッセージを確認する:
   ```bash
   pnpm --filter @repo/desktop test -- \
     --reporter=verbose \
     SkillLifecyclePanel.auth-regression
   ```
3. 失敗原因を分類する:
   - `IPC モック不整合`: モックの更新で修正可能
   - `コンポーネント API 変更`: テストロジックの書き直しが必要
   - `フロー廃止`: 現行フローに存在しないケースであれば削除

#### 成果物

- スキップ原因一覧テーブル

#### 完了条件

- 5件全ての原因が特定されている

---

### Phase B: テスト修正・有効化

#### 目的

調査結果に基づいてテストを修正し、`describe.skip` を解消する。

#### 手順

1. `IPC モック不整合` と分類されたテストのモックを現行フローに合わせて修正する
2. `コンポーネント API 変更` と分類されたテストのアサーションを更新する
3. `フロー廃止` と分類されたテストを削除し、理由コメントを git commit message に記録する

**参考: auth:login モックパターン（現行フロー）**:

```typescript
// auth:login が呼ばれないことを検証するパターン
const mockAuthLogin = vi.fn();
vi.mock("@/renderer/hooks/useIpc", () => ({
  useIpc: (channel: string) =>
    channel === "auth:login" ? mockAuthLogin : vi.fn(),
}));

// テスト後の検証
expect(mockAuthLogin).not.toHaveBeenCalled();
```

#### 成果物

- 修正済み `SkillLifecyclePanel.auth-regression.test.tsx`

#### 完了条件

- `describe.skip` が 0 件
- 修正したテストが全て PASS

---

### Phase C: テスト実行・確認

#### 目的

全 auth 回帰テストが PASS することを確認する。

#### 手順

```bash
# auth-regression テスト全件実行
pnpm --filter @repo/desktop test -- \
  --reporter=verbose \
  SkillLifecyclePanel.auth-regression

# describe.skip 残存確認
grep -c "describe\.skip" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
# → 0 になること
```

#### 成果物

- テスト実行ログ

#### 完了条件

- `describe.skip` 件数が 0
- 全テストが PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `SkillLifecyclePanel.auth-regression.test.tsx` の `describe.skip` が 0 件
- [ ] 削除した `describe.skip` の理由が記録されている
- [ ] 修正したテストが全て PASS

### 品質要件

- [ ] auth:login が呼ばれないことを検証するテストが少なくとも 1 件有効化されている
- [ ] CI で auth 回帰テストが自動実行される

### ドキュメント要件

- [ ] 本指示書が `docs/30-workflows/unassigned-task/` に存在する
- [ ] `task-workflow.md` に参照が追加されている

---

## 6. 検証方法

### テストケース

```bash
# describe.skip 残存確認
grep -c "describe\.skip" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
# → 0 になること

# テスト全件 PASS 確認
pnpm --filter @repo/desktop test -- \
  --reporter=verbose \
  SkillLifecyclePanel.auth-regression
```

### 検証手順

1. `describe.skip` 件数が 0 であることを `grep -c` で確認
2. `pnpm test` で PASS/FAIL 件数を確認
3. TC-03, TC-05〜TC-08 の各テストが PASS していることを確認

---

## 7. リスクと対策

| リスク                                                                     | 影響度 | 発生確率 | 対策                                                 |
| -------------------------------------------------------------------------- | ------ | -------- | ---------------------------------------------------- |
| スキップ原因が `auth:login` フロー廃止による場合、テストを全削除する可能性 | 中     | 中       | 削除前に auth:login の現行呼び出し仕様を確認する     |
| モック修正が複雑で時間がかかる                                             | 中     | 中       | Phase A の調査を丁寧に実施し、修正範囲を先に確定する |
| 修正後のテストが CI でフレーキーになる                                     | 高     | 低       | `waitFor` のタイムアウト設定を現行テストと揃える     |

---

## 8. 参照情報

### 関連ドキュメント

- `outputs/phase-12/UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001-unassigned-task-detection.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-skill-wizard-llm-connection.md`
- `docs/30-workflows/unassigned-task/UT-LIFECYCLE-PANEL-LLM-GEN-DESCRIBE-SKIP-CLEANUP-001.md`

### 参考資料

- `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`（現行フロー参考）

---

## 9. 備考

### 苦戦箇所【記入必須】

> 実行中に迷った点、判断に時間がかかった点を記録してください（実施後に記入）

| 項目     | 内容           |
| -------- | -------------- |
| 症状     | （実施後記入） |
| 原因     | （実施後記入） |
| 対応     | （実施後記入） |
| 再発防止 | （実施後記入） |

### 補足事項

- 本タスクは `UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001` の Phase 12 未タスク検出から派生
- auth:login IPC テストは認証フローのセキュリティ観点で重要な回帰検証
- TC-01, TC-02, TC-04 が PASS している場合、それらをスキップ修正のパターン参考にする
