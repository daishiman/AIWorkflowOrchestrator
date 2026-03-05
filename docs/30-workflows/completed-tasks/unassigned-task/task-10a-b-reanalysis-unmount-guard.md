# UT-TASK-10A-B-010 改善適用後再分析のアンマウント安全化ガード - タスク指示書

## メタ情報

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| タスクID     | UT-TASK-10A-B-010                                              |
| タスク名     | 改善適用後再分析のアンマウント安全化ガード                     |
| 分類         | 改善                                                           |
| 対象機能     | SkillAnalysisView `useSkillAnalysis`（改善適用後の再分析制御） |
| 優先度       | 中                                                             |
| 見積もり規模 | 小規模                                                         |
| ステータス   | 完了（2026-03-05）                                             |
| 発見元       | UT-TASK-10A-B-003 実装後テスト失敗（Phase 12 再確認）          |
| 発見日       | 2026-03-05                                                     |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`SkillAnalysisView` の「改善適用後に分析結果を再取得する」テストで、`analyze` の呼び出し回数が期待値より増える不安定状態が検出された（期待2回、実測4回）。

### 1.2 問題点・課題

- 改善適用後の非同期処理完了タイミングとコンポーネントのアンマウントが競合し、再分析呼び出しがテスト間へリークする。
- アンマウント後に `setState` / 再分析を継続し、挙動の再現性が下がる。
- UI挙動そのものは見えるが、回帰テストの信頼性が低下する。

### 1.3 放置した場合の影響

- テストが継続的に不安定化し、CIで断続的な失敗を招く。
- 改善適用フローの変更時に、本質的でない失敗調査コストが増える。

## 2. 何を達成するか（What）

### 2.1 目的

改善適用後の再分析フローにアンマウント安全性を持たせ、`analyze` 呼び出し回数と状態更新を決定論的にする。

### 2.2 最終ゴール

1. 改善適用成功時の再分析は 1 回のみ実行される。
2. コンポーネントアンマウント後に `setState` と再分析が実行されない。
3. 対象テストと関連テスト群が安定して PASS する。

### 2.3 スコープ

#### 含むもの

- `useSkillAnalysis` の非同期処理にアンマウントガードを追加
- 改善適用後再分析の呼び出し条件整理
- テスト再実行による回帰確認

#### 含まないもの

- IPC契約（`skill:analyze` / `skill:applyImprovements`）の仕様変更
- 改善結果表示UIのデザイン変更

### 2.4 成果物

- `useSkillAnalysis` の安全化実装差分
- テスト実行ログ（対象テスト + 関連テスト）
- 本未タスク指示書と台帳同期

## 3. どのように実行するか（How）

### 3.1 前提条件

- `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts` が存在すること
- `SkillAnalysisView.test.tsx` を実行できること

### 3.2 依存タスク

- TASK-10A-B（完了）
- UT-TASK-10A-B-003（完了）

### 3.3 必要な知識

- React Hooks（`useRef` / `useEffect` cleanup）
- 非同期処理とコンポーネントライフサイクルの競合パターン
- React Testing Library / Vitest の待機系アサーション

### 3.4 推奨アプローチ

1. `isMountedRef` を導入し、アンマウント後の `setState` / 再分析呼び出しを遮断する。
2. `applyImprovements` / `autoImprove` 成功後の再分析呼び出しをガードする。
3. 再分析呼び出し回数の回帰テストを固定し、文書台帳へ即時同期する。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                         | 発見経緯                                                     | 解決策                                                                 | 教訓                                                                |
| -------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `analyze` 呼び出しが 2 回想定から 4 回へ増加 | `SkillAnalysisView` テストで `toHaveBeenCalledTimes` が失敗  | 改善適用後の再分析をアンマウント状態で抑止し、呼び出し条件を明示化     | 再分析付き非同期処理は「成功判定 + マウント状態」の二重ガードが必要 |
| アンマウント後の状態更新リスク               | 非同期処理完了時にコンポーネントが既に破棄されるケースで再現 | `useEffect` cleanup で `isMountedRef=false` を設定し、全更新箇所で参照 | Hook内非同期は cleanup 前提で設計し、テストで明示検証する           |

## 4. 実行手順

### Phase構成

- Phase A: 再現条件の固定
- Phase B: Hook安全化実装
- Phase C: テスト検証
- Phase D: 台帳同期

### Phase A: 再現条件の固定

#### 目的

失敗条件を再現可能な形で固定する。

#### 手順

1. 対象テストを単体実行して失敗内容を確認する。
2. `analyze` 呼び出し回数の実測値を記録する。

#### 成果物

- 失敗再現ログ

#### 完了条件

- 失敗条件（期待値と実測値差分）が明確化されている。

### Phase B: Hook安全化実装

#### 目的

アンマウント後に非同期更新が残らない実装へ是正する。

#### 手順

1. `useSkillAnalysis` に `isMountedRef` を追加する。
2. `handleAnalyze` / `handleApplySelected` / `handleAutoImprove` の更新処理へガードを適用する。
3. cleanup で `isMountedRef` を `false` にする。

#### 成果物

- Hook実装差分

#### 完了条件

- アンマウント後に状態更新・再分析が発生しない。

### Phase C: テスト検証

#### 目的

回帰と安定性を確認する。

#### 手順

1. 対象テスト（再分析呼び出し回数）を実行する。
2. `SkillAnalysisView.test.tsx` 全体を実行する。

#### 成果物

- テスト実行結果

#### 完了条件

- 対象テストと関連テストが PASS。

### Phase D: 台帳同期

#### 目的

未タスク台帳とシステム仕様書を同期する。

#### 手順

1. 本指示書を `docs/30-workflows/completed-tasks/unassigned-task/` に配置する。
2. `task-workflow.md` と `ui-ux-feature-components.md` に `UT-TASK-10A-B-010` を登録する。
3. `ui-ux-components.md` / `lessons-learned.md` / `SKILL.md` / `LOGS.md` を同期する。
4. リンク検証と対象監査を実行する。

#### 成果物

- 更新済み仕様台帳

#### 完了条件

- `verify-unassigned-links` と `audit --target-file` が成功する。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 改善適用後の再分析が 1 回に固定されている
- [ ] アンマウント後の状態更新が発生しない

### 品質要件

- [ ] 対象テストが PASS
- [ ] `SkillAnalysisView.test.tsx` 全体が PASS
- [ ] 既存の改善フローUI挙動を壊していない

### ドキュメント要件

- [x] 本指示書が `docs/30-workflows/completed-tasks/unassigned-task/` に配置済み
- [ ] `task-workflow.md` / `ui-ux-feature-components.md` に登録済み
- [ ] `lessons-learned.md` に苦戦箇所が反映済み

## 6. 検証方法

### テストケース

- Case 1: 改善適用成功後に `analyze` が追加で 1 回だけ呼ばれる
- Case 2: 非同期完了前にアンマウントしても状態更新が走らない
- Case 3: `SkillAnalysisView` 関連テストが安定して PASS する

### 検証手順

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx -t "改善適用後に分析結果を再取得する"
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/unassigned-task/task-10a-b-reanalysis-unmount-guard.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

## 7. リスクと対策

| リスク                                 | 影響度 | 発生確率 | 対策                                                                                      |
| -------------------------------------- | ------ | -------- | ----------------------------------------------------------------------------------------- |
| ガード漏れで別経路の状態更新が残る     | 高     | 中       | 非同期処理の全更新箇所に `isMountedRef` を適用し、テストで確認する                        |
| 呼び出し回数調整で正常再分析まで止まる | 中     | 低       | 「成功時のみ再分析」の条件を明示し、改善成功シナリオを重点検証する                        |
| 台帳同期漏れで未タスク追跡が欠落する   | 中     | 中       | 指示書作成と同ターンで `task-workflow` / `ui-ux-feature` / `lessons` を更新し機械検証する |

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts`
- `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx`
- `docs/30-workflows/completed-tasks/task-10a-b-improvement-result-breakdown-ui/outputs/phase-12/documentation-changelog.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

### 参考資料

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/assets/unassigned-task-template.md`

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
AssertionError: expected "spy" to be called 2 times, but got 4 times
```

### 補足事項

本タスクは非同期ライフサイクル安全化が目的であり、分析ロジックやIPC契約自体の仕様変更は対象外とする。
