# Phase 4: テスト作成（TDD Red フェーズ）

## メタ情報

| 項目       | 内容                                                            |
| ---------- | --------------------------------------------------------------- |
| PhaseID    | 4                                                               |
| Phase名    | テスト作成（TDD Red フェーズ）                                  |
| タスクID   | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001             |
| タスク名   | SkillLifecyclePanel auth回帰テスト describe.skip クリーンアップ |
| 前Phase    | Phase 3（PASS または MINOR）                                    |
| 次Phase    | Phase 5                                                         |
| 作成日     | 2026-04-18                                                      |
| ステータス | pending                                                         |

## 目的

本タスクは CLEANUP タスクである。Phase 4 は「既存の `describe.skip` を一時的に `describe` に
変換してRed状態を確認する」フェーズ。

5件の `describe.skip`（TC-03/TC-05/TC-06/TC-07/TC-08）を `describe` に変換した状態で
テストを実行し、現在の失敗理由を分類・記録する。
この調査結果が Phase 5 の修正方針（モック修正 / アサーション更新 / ブロック削除）の
判断根拠となる。

## 実行タスク

- [ ] TC-03/TC-05/TC-06/TC-07/TC-08 の `describe.skip` を `describe` に一時変換する
- [ ] テストを実行して現在の失敗理由を記録する
- [ ] 失敗理由を「IPCモック不整合 / コンポーネントAPI変更 / フロー廃止」に分類する
- [ ] 各 TC の失敗ログを `outputs/phase-4/failure-analysis.md` に記録する
- [ ] 分類結果を `outputs/phase-4/test-results-red.md` にまとめる

## 参照資料

| 資料名                                       | パス                                                                                                | 用途                                |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Phase 2 設計書                               | `outputs/phase-2/design.md`                                                                         | 処置設計・検証マトリクス参照        |
| Phase 3 レビュー結果                         | `outputs/phase-3/gate-decision.md`                                                                  | 処置分類の最終確定内容確認          |
| SkillLifecyclePanel.auth-regression.test.tsx | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx` | テスト現在状態の把握                |
| SkillLifecyclePanel.tsx                      | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                | コンポーネントAPI・testidの最終確認 |

## 実行手順

### 0. 現在の `describe.skip` 件数の確認

```bash
# describe.skip の件数確認（5件あることを確認）
grep -n "describe\.skip" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx

# アクティブな describe ブロック（.skip なし）の一覧を確認
grep -n "^describe(" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
```

### 1. 各 TC を `describe` に一時変換するコマンド

TC-03（行305付近）・TC-05（行431付近）・TC-06（行501付近）・TC-07（行590付近）・
TC-08（行686付近）の `describe.skip` を `describe` に変換する。

```bash
# TC-03: skill generation completes without auth:login timeout
# 対象行付近の確認
grep -n "skill generation completes without auth:login timeout\|describe\.skip" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx | \
  head -20

# TC-05: skill generation does not call auth:login when user is unauthenticated
grep -n "does not call auth:login when user is unauthenticated" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx

# TC-06: rapid skill generation clicks do not trigger multiple auth:login
grep -n "rapid skill generation clicks do not trigger multiple auth:login" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx

# TC-07: auth:login is not triggered on component re-render during skill flow
grep -n "auth:login is not triggered on component re-render" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx

# TC-08: authModeSlice state changes do not trigger unexpected auth:login
grep -n "authModeSlice state changes do not trigger unexpected auth:login" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
```

変換は `Edit` ツールで各 `describe.skip(` を `describe(` に変更する（一時変換）。
**Phase 5 実施前にこの変換は元に戻すこと**。

### 2. テスト実行コマンド

```bash
# 一時変換後のテスト実行（verbose モードで失敗理由を記録）
pnpm --filter @repo/desktop test -- --reporter=verbose SkillLifecyclePanel.auth-regression \
  2>&1 | tee /tmp/auth-regression-red-phase.txt

# PASS / FAIL の集計
grep -E "✓|✗|PASS|FAIL|Tests:" /tmp/auth-regression-red-phase.txt | tail -20
```

### 3. 失敗理由の分類

テスト失敗の原因を以下の3種別に分類する。

| 分類 ID | 分類名                | 判定基準                                                                               |
| ------- | --------------------- | -------------------------------------------------------------------------------------- |
| A       | IPCモック不整合       | `window.electronAPI.auth.login` / `skillCreatorAPI` のモックが現行実装と一致していない |
| B       | コンポーネントAPI変更 | コンポーネントの props / state / イベント API が変更されており、テスト操作が失敗する   |
| C       | フロー廃止            | テスト対象のスキル生成フロー自体が現行コードに存在しないため、テストが意味をなさない   |

```bash
# 失敗ログから TypeError / Cannot read / undefined 等を抽出
grep -E "Error|TypeError|Cannot|undefined|not found" /tmp/auth-regression-red-phase.txt | head -30

# IPC 関連エラーの抽出
grep -E "auth:login|electronAPI|skillCreatorAPI|ipc" /tmp/auth-regression-red-phase.txt | head -20

# コンポーネント操作エラーの抽出
grep -E "Unable to find|TestingLibraryElementError|getByRole|getByTestId" \
  /tmp/auth-regression-red-phase.txt | head -20
```

### 4. 失敗ログの記録方法

各 TC の失敗ログを以下の形式で `outputs/phase-4/failure-analysis.md` に記録する。

```markdown
## TC-XX: <テスト名>

**失敗行数**: XX行
**分類**: A / B / C（上記分類表参照）
**エラー内容**:
\`\`\`
<エラーメッセージをそのままコピー>
\`\`\`
**Phase 5 での処置方針**: 修正 / 削除
```

## テスト実行結果記録テーブル

一時変換後のテスト実行結果を以下のテーブルに記録する（実行時に埋める）。

| TC ID | テスト名（省略）                                      | 失敗/PASS | 分類 | 失敗理由（概要） | Phase 5 処置方針 |
| ----- | ----------------------------------------------------- | --------- | ---- | ---------------- | ---------------- |
| TC-03 | skill generation completes without auth:login timeout | pending   |      |                  |                  |
| TC-05 | does not call auth:login when user is unauthenticated | pending   |      |                  |                  |
| TC-06 | rapid clicks do not trigger multiple auth:login       | pending   |      |                  |                  |
| TC-07 | auth:login not triggered on re-render                 | pending   |      |                  |                  |
| TC-08 | authModeSlice changes do not trigger auth:login       | pending   |      |                  |                  |

## 多角的チェック観点

| 観点                     | チェック内容                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| 変換の一時性             | `describe.skip` → `describe` への変換が一時的であることを明記し、Phase 5 前に元に戻しているか           |
| 失敗理由の正確性         | エラーメッセージを原文のまま記録し、推測でなく事実として分類しているか                                  |
| IPCモック不整合の特定    | `window.electronAPI.auth.login` と `skillCreatorAPI` のモックが現行テスト実装と一致しているか確認済みか |
| フロー廃止の判断根拠     | 「フロー廃止（C）」と判断した TC はコンポーネント本体のコード調査で廃止を裏付けているか                 |
| アクティブテストへの影響 | 一時変換中に TC-01/TC-02/TC-04（既存アクティブテスト）の PASS 状態が維持されていることを確認しているか  |

## 統合テスト連携

| 判定項目                                                    | 基準                                | 結果    |
| ----------------------------------------------------------- | ----------------------------------- | ------- |
| 5件の `describe.skip` を `describe` に一時変換済み          | 変換後テスト実行が可能な状態        | pending |
| 各 TC の失敗理由が A / B / C のいずれかに分類済み           | 全 TC に分類が付いている            | pending |
| 失敗ログが `outputs/phase-4/failure-analysis.md` に記録済み | ファイルが存在し、5件分の記録がある | pending |
| TC-01/TC-02/TC-04（アクティブ）の PASS が維持されている     | 一時変換中も既存テストが PASS       | pending |

## 成果物

| 成果物                | パス                                  | 説明                                        |
| --------------------- | ------------------------------------- | ------------------------------------------- |
| テスト実行結果（Red） | `outputs/phase-4/test-results-red.md` | 5件 TC の実行結果・分類・テーブルサマリー   |
| 失敗分析              | `outputs/phase-4/failure-analysis.md` | 各 TC の失敗ログ原文と Phase 5 での処置方針 |

## 完了条件

- [ ] TC-03/TC-05/TC-06/TC-07/TC-08 を `describe` に一時変換してテスト実行済み
- [ ] 各 TC の失敗理由が A（IPCモック不整合）/ B（API変更）/ C（フロー廃止）に分類済み
- [ ] 失敗ログが `outputs/phase-4/failure-analysis.md` に記録済み
- [ ] テスト実行結果記録テーブルが埋まっている
- [ ] TC-01/TC-02/TC-04（アクティブ）の PASS 状態が維持されていることを確認済み
- [ ] 一時変換を元に戻して（`describe` → `describe.skip`）Phase 5 に引き渡す準備が完了
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001
```

## 次Phase

Phase 5（実装）へ進む。
