# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 6                                                  |
| Phase 名   | テスト拡充                                         |
| タスクID   | TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001 |
| 前提 Phase | Phase 5                                            |
| 後続 Phase | Phase 7（カバレッジ確認）                          |
| ステータス | not_started                                        |
| 作成日     | 2026-03-19                                         |
| 機能名     | settings-shell-access-matrix-mainline              |

## 目的

Settings / App shell mainline access matrix の edge / fallback / regression 観点を拡張する。

## 実行タスク

- 回帰観点追加: error / blocked / fallback / permission 境界を追加する
- 性能・安定性観点: 再レンダー、二重登録、重複 handoff の観点を追加する
- 手戻り防止: Phase 7-10 で見るべき不足領域を明文化する

## 参照資料

| 参照資料               | パス                                                                                                                                       | 内容                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| 親パック index         | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                                                                 | 依存順・並列可否・設計ゲート                      |
| Task index             | docs/30-workflows/ai-runtime-execution-responsibility-realignment/tasks/step-03-par-task-03-settings-shell-access-matrix-mainline/index.md | 対象 task のメタ情報と受入基準                    |
| Phase 1                | phase-1-requirements.md                                                                                                                    | 要件定義の確定内容                                |
| Phase 2                | phase-2-design.md                                                                                                                          | 設計内容と validation matrix                      |
| Phase 3                | phase-3-design-review.md                                                                                                                   | review gate の判定                                |
| Phase 4                | phase-4-test-creation.md                                                                                                                   | Phase 4（テスト作成）の仕様書                     |
| Phase 5                | phase-5-implementation.md                                                                                                                  | Phase 5（実装）の仕様書                           |
| 旧canonical workflow   | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md                                              | execution responsibility を主語にした既存問題設定 |
| 親パック UI/UX 正本    | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md                                                     | 状態語彙・CTA・handoff 契約                       |
| 親パック UI/UX 図解    | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-diagrams.md                                                        | 状態遷移・画面構成・導線図                        |
| 親パック監査マトリクス | docs/30-workflows/ai-runtime-execution-responsibility-realignment/design-audit-matrix.md                                                   | 矛盾・依存・漏れの監査軸                          |
| workflow 正本          | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md                              | runtime 責務再配線の current canonical            |
| resource map           | .claude/skills/aiworkflow-requirements/indexes/resource-map.md                                                                             | 必要仕様の初動選定                                |
| quick reference        | .claude/skills/aiworkflow-requirements/indexes/quick-reference.md                                                                          | 型・IPC・UI 仕様の即時参照                        |
| interfaces-auth        | .claude/skills/aiworkflow-requirements/references/interfaces-auth.md                                                                       | auth/access 契約の親入口                          |
| api-ipc-system         | .claude/skills/aiworkflow-requirements/references/api-ipc-system.md                                                                        | system IPC 契約の親入口                           |
| arch-state-management  | .claude/skills/aiworkflow-requirements/references/arch-state-management.md                                                                 | Renderer 責務境界の親入口                         |
| Task02 index           | docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization/index.md                                               | 共有 policy の消費契約                            |
| ui-ux-settings         | .claude/skills/aiworkflow-requirements/references/ui-ux-settings.md                                                                        | Settings 正本の親入口                             |
| ui-ux-settings-core    | .claude/skills/aiworkflow-requirements/references/ui-ux-settings-core.md                                                                   | Settings IA / bypass / screenshot 契約            |
| ui-ux-navigation       | .claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md                                                                      | settings 公開導線・nav 契約                       |
| llm-ipc-types          | .claude/skills/aiworkflow-requirements/references/llm-ipc-types.md                                                                         | health row の型契約                               |

## 実行手順

### ステップ1: Phase 5 実装結果と Phase 4 テスト PASS 状況を確認する

1. `outputs/phase-5/file-change-scope.md` で変更ファイル一覧を確認する
2. Phase 4 の全 TC-ID（TC-C01〜C06, TC-H01〜H04, TC-P01〜P03, TC-L01〜L03）が PASS していることを確認する
3. 現時点のカバレッジを `cd apps/desktop && pnpm vitest run --coverage` で取得し、不足領域を特定する

### ステップ2: 統合シナリオ SC-01〜SC-06 のテストを実装する

Phase 4 で定義した統合シナリオを実テストコードに落とし込む。

| SC-ID | シナリオ                                     | テスト方針                                                                |
| ----- | -------------------------------------------- | ------------------------------------------------------------------------- |
| SC-01 | 認証済み → Settings → capability full 表示   | Store に認証済み状態を設定し、AccessMatrixSection をレンダーして検証      |
| SC-02 | 未認証 → Settings → guidance-only 表示       | Store に未認証状態を設定し、CTA 非表示 + ガイダンスメッセージを検証       |
| SC-03 | launcher クリック → terminal 起動            | TerminalLauncher クリックで IPC 呼び出しが発火することを検証              |
| SC-04 | provider 変更 → health 再取得 → Row 更新     | provider セレクタ変更後に health 取得 IPC が再呼び出しされることを検証    |
| SC-05 | blocked 状態 → CTA 非活性 → blockedInfo 表示 | capability=blocked で CTA disabled + blockedInfo テキスト表示を検証       |
| SC-06 | loading → skeleton → ready 遷移              | uiState を loading → ready に変更し、skeleton 消失 + コンテンツ表示を検証 |

### ステップ3: 回帰観点 RG-01〜RG-06 のテストを実装する

既知の pitfall パターンに対する回帰テストを追加する。

| RG-ID | 回帰観点                          | テスト内容                                                                                           |
| ----- | --------------------------------- | ---------------------------------------------------------------------------------------------------- |
| RG-01 | P31: Store Hook 無限ループ防止    | 個別セレクタ使用時に re-render 回数が閾値以下であることを `renderCount` で検証する                   |
| RG-02 | P48: non-null assertion 禁止      | IPC レスポンスの `data` が `undefined` の場合にクラッシュせずフォールバック表示されることを検証する  |
| RG-03 | P5: リスナー二重登録防止          | `StrictMode` 下で health 取得リスナーが1回だけ登録されることを検証する                               |
| RG-04 | P62: DEFAULT_CONFIG fallback 禁止 | provider/model 未選択時に `DEFAULT_CONFIG` が使用されず、エラー/ガイダンスが表示されることを検証する |
| RG-05 | Settings bypass 防止              | `isAuthenticated=false` で Settings 内の操作系 CTA が一切活性化しないことを検証する                  |
| RG-06 | CTA 契約整合性                    | 各 capability 状態で表示される CTA テキストが ui-ux-realization.md の定義と一致することを検証する    |

### ステップ4: 境界ケースを整理し、成果物に出力する

1. 追加した SC テスト・RG テストを実行し、全 PASS を確認する
2. 回帰拡張計画を `outputs/phase-6/regression-expansion-plan.md` に記録する（SC-01〜06, RG-01〜06 の実装状況と結果）
3. 未カバーの境界ケースを `outputs/phase-6/edge-case-matrix.md` に記録する
   - 例: 同時認証切り替え中のレース条件、provider API タイムアウト時の health 表示、capability 状態遷移の中間状態
4. Phase 7 で確認すべき不足領域を明文化し、完了条件チェックリストを検証する

## 統合テスト連携（Phase 1〜11は必須）

regression へ blocked / fallback / legacy coexistence の観点を追加する。

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                | 仕様参照先                                                            |
| ---------------------- | --------------------------------------- | --------------------------------------------------------------------- |
| UI/UX                  | 画面/CTA/状態語彙が関係する場合         | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | 責務境界・state・service 設計を触る場合 | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | Main-Renderer 契約を扱う場合            | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | ledger / backlog / lessons を触る場合   | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: Settings / AppLayout / public unauthenticated shell に capability cards / health row / terminal launcher を実装する設計を固める

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の反映（Phase 1〜11）
4. 成果物パスと outputs/phase-N の整合確認
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物         | パス                                         | 内容                               |
| -------------- | -------------------------------------------- | ---------------------------------- |
| 回帰拡張計画   | outputs/phase-6/regression-expansion-plan.md | edge / error / fallback 観点の追加 |
| 境界ケース一覧 | outputs/phase-6/edge-case-matrix.md          | 未検証境界の明文化                 |

## 完了条件

- [ ] fallback / blocked / legacy の回帰観点が追加されている
- [ ] Phase 7-9 で確認すべき不足が見える化されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-6/` と一致している
- [ ] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [ ] 前Phaseの gate 条件を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 7（カバレッジ確認）](./phase-7-coverage-check.md)
