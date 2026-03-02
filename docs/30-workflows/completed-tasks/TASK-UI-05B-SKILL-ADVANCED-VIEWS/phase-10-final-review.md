# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| Phase      | 10                                  |
| タスクID   | TASK-UI-05B-SKILL-ADVANCED-VIEWS    |
| 機能名     | スキル高度管理ビュー（4ビュー統合） |
| 作成日     | 2026-03-01                          |
| 状態       | 完了                                |
| 前Phase    | Phase 9（品質保証）                 |
| 依存成果物 | `outputs/phase-9/quality-report.md` |

## 目的

4ビュー（SkillChainBuilder, ScheduleManager, DebugPanel, AnalyticsDashboard）の実装完了後、機能完全性・コード品質・テスト品質・セキュリティ・パフォーマンス・ドキュメント整合性・UI/UX を多角的に検証し、Phase 11（手動テスト）への進行可否を判定する。

---

## 判定基準

| 判定     | 条件                             | 対応                                                           |
| -------- | -------------------------------- | -------------------------------------------------------------- |
| PASS     | 全レビュー観点で問題なし         | Phase 11 へ進行                                                |
| MINOR    | 軽微な指摘あり（機能に影響なし） | 全指摘を未タスク仕様書に変換後 Phase 11 へ進行（**省略不可**） |
| MAJOR    | 重大な問題あり                   | 影響範囲に応じて Phase 1-5 へ戻る（戻り先と修正方針を明記）    |
| CRITICAL | 致命的な問題あり                 | Phase 1 へ戻り要件再確認（再確認事項を明記）                   |

---

## 実行タスク

- 機能完全性審査: 4ビューの受け入れ基準充足を審査する
- 品質審査: コード品質・テスト品質・性能品質を審査する
- 契約審査: IPC/型/セキュリティ契約の整合性を審査する
- UX審査: Apple HIG/WCAG/レスポンシブ適合を審査する
- 指摘管理: MINOR/MAJOR/CRITICAL の戻り先と未タスク化を確定する
- 最終判定: Phase 11 進行可否を判定する

### Task 1: 機能完全性検証

Phase 1 の受け入れ基準と実装を突合し、全機能が実装されていることを確認する。

#### 1-1. SkillChainBuilder（3A）

| 受け入れ基準                              | 検証方法                                | 結果 |
| ----------------------------------------- | --------------------------------------- | ---- |
| チェーン一覧の表示（CardGrid レイアウト） | ChainCardGrid のレンダリング確認        |      |
| 新規チェーン作成ダイアログ                | CreateChainDialog の表示・入力・保存    |      |
| ステップの追加・編集・削除・並べ替え      | StepEditor の CRUD 操作確認             |      |
| ステップ間コネクタの表示                  | StepConnector の描画確認                |      |
| チェーン実行                              | skill:chain:execute の IPC 呼び出し確認 |      |
| チェーン削除（確認ダイアログ付き）        | 確認ダイアログ表示 → 削除実行確認       |      |

#### 1-2. ScheduleManager（3B）

| 受け入れ基準                           | 検証方法                                  | 結果 |
| -------------------------------------- | ----------------------------------------- | ---- |
| スケジュール一覧テーブル表示           | ScheduleTable のレンダリング確認          |      |
| スケジュール追加ダイアログ             | ScheduleDialog の表示・入力・保存         |      |
| Cron 式エディタ（プリセット付き）      | CronEditor + CronPresetList の動作確認    |      |
| スケジュール有効/無効トグル            | skill:schedule:toggle の IPC 呼び出し確認 |      |
| スケジュール詳細パネル（実行履歴付き） | ScheduleDetailPanel + RunHistoryList      |      |
| スケジュール編集・削除                 | 更新・削除の IPC 呼び出し確認             |      |

#### 1-3. DebugPanel（3C）

| 受け入れ基準                               | 検証方法                                  | 結果 |
| ------------------------------------------ | ----------------------------------------- | ---- |
| デバッグセッション開始ダイアログ           | StartDebugDialog の表示・スキル選択       |      |
| デバッグコントロール（step/continue/stop） | DebugControls のボタン操作確認            |      |
| コールスタック表示                         | CallStackView のツリー描画確認            |      |
| ステップ履歴リスト                         | StepHistoryList の時系列表示確認          |      |
| 出力コンソール                             | OutputConsole のログ表示確認              |      |
| 変数ウォッチ                               | VariableWatch + VariableNode の表示確認   |      |
| ブレークポイント管理                       | BreakpointEditor + BreakpointRow の CRUD  |      |
| リアルタイムイベント購読                   | skill:debug:event の IPC イベント受信確認 |      |

#### 1-4. AnalyticsDashboard（3D）

| 受け入れ基準                   | 検証方法                              | 結果 |
| ------------------------------ | ------------------------------------- | ---- |
| サマリーカード表示（4指標）    | SummaryCards + SummaryCard の描画確認 |      |
| 使用量チャート（時系列グラフ） | UsageChart の recharts 描画確認       |      |
| スキルランキング表示           | SkillRanking のリスト描画確認         |      |
| 期間切り替え（7日/30日/90日）  | PeriodSelector の切り替え動作確認     |      |
| チャートツールチップ           | ChartTooltip のホバー表示確認         |      |
| データエクスポート             | ExportButton の CSV/JSON 出力確認     |      |

### Task 2: コード品質検証

| 検証項目                 | 合格基準                                                     | 結果 |
| ------------------------ | ------------------------------------------------------------ | ---- |
| Atomic Design 準拠       | Atom: 状態不保持、Molecule: Atom 組合せ、Organism: Hook 使用 |      |
| 単一責務原則（SRP）      | 1 ファイル 1 責務（200 行以下推奨）                          |      |
| エラーハンドリング一貫性 | `IPCResult<T>` パターンで統一                                |      |
| 命名規約                 | boolean は `is`/`has`/`can`/`should` プレフィックス          |      |
| コールバック命名         | `onXxx` パターンで統一                                       |      |
| import 整理              | 未使用 import が 0 箇所                                      |      |
| コンポーネント Props 型  | 全 Props に TypeScript 型定義が存在する                      |      |

### Task 3: テスト品質検証

#### 3-1. カバレッジ基準

| ビュー             | Line Coverage | Branch Coverage | Function Coverage |
| ------------------ | ------------- | --------------- | ----------------- |
| SkillChainBuilder  | 80%+          | 60%+            | 80%+              |
| ScheduleManager    | 80%+          | 60%+            | 80%+              |
| DebugPanel         | 80%+          | 60%+            | 80%+              |
| AnalyticsDashboard | 80%+          | 60%+            | 80%+              |

```bash
cd apps/desktop && pnpm vitest run --coverage src/renderer/views/SkillChainBuilder/
cd apps/desktop && pnpm vitest run --coverage src/renderer/views/ScheduleManager/
cd apps/desktop && pnpm vitest run --coverage src/renderer/views/DebugPanel/
cd apps/desktop && pnpm vitest run --coverage src/renderer/views/AnalyticsDashboard/
```

#### 3-2. テストケース網羅性

| カテゴリ     | 検証内容                                                     |
| ------------ | ------------------------------------------------------------ |
| 正常系       | 全 CRUD 操作の成功パス                                       |
| 異常系       | IPC エラー、ネットワークエラー、バリデーションエラー         |
| 境界値       | 空リスト、最大件数、長い文字列、特殊文字                     |
| 状態遷移     | ローディング→成功、ローディング→エラー、アイドル→実行中→完了 |
| ユーザー操作 | クリック、キーボード入力、フォーカス移動、ダイアログ開閉     |

#### 3-3. テスト環境対策

| 対策項目                    | 確認内容                                          | 結果 |
| --------------------------- | ------------------------------------------------- | ---- |
| P39: happy-dom 互換         | `userEvent` 不使用、`fireEvent` のみ使用          |      |
| P40: テスト実行ディレクトリ | `cd apps/desktop` から実行されている              |      |
| P9: テスト間状態リーク      | `beforeEach` で全モック・状態がリセットされている |      |
| P13: タイマーテスト         | `advanceTimersByTime` 使用（`runAllTimers` 禁止） |      |

### Task 4: セキュリティ検証

| 検証項目                      | 合格基準                                       | 結果 |
| ----------------------------- | ---------------------------------------------- | ---- |
| IPC チャネル名定数使用（P27） | 全チャネルが `IPC_CHANNELS` 定数で参照         |      |
| safeInvoke/safeOn 使用        | `ipcRenderer` 直接呼び出しが 0 箇所            |      |
| 入力バリデーション（P42）     | 全文字列引数に .trim() 3段バリデーション       |      |
| contextBridge 経由通信        | Renderer → Main の全通信が Preload Bridge 経由 |      |
| XSS 対策                      | `dangerouslySetInnerHTML` 使用が 0 箇所        |      |
| CSP 互換                      | インラインスクリプト・eval 不使用              |      |

### Task 5: パフォーマンス検証

| 検証項目                      | 合格基準                                    | 結果 |
| ----------------------------- | ------------------------------------------- | ---- |
| 初期表示速度                  | 各ビュー 1 秒以内でインタラクティブ状態     |      |
| 再レンダリング最適化          | React.memo / useMemo / useCallback が適切   |      |
| recharts 描画                 | ResponsiveContainer に debounce 設定済み    |      |
| 大量データ応答性（100件以上） | スクロール・操作が滑らか（16ms/frame 以内） |      |

### Task 6: ドキュメント整合性検証

| 検証項目                              | 合格基準                                    | 結果 |
| ------------------------------------- | ------------------------------------------- | ---- |
| コンポーネント Props 型とドキュメント | Phase 2 設計書の Props 定義と実装が一致     |      |
| IPC チャネル定義                      | Phase 2 の IPC 設計とバックエンド仕様が一致 |      |
| コンポーネント階層                    | Phase 2 の Atomic Design 階層と実装が一致   |      |
| テストケース                          | Phase 4 のテスト設計と実装が一致            |      |

### Task 7: UI/UX 検証

#### 7-1. Apple HIG 準拠

| 検証項目       | 合格基準                                  | 結果 |
| -------------- | ----------------------------------------- | ---- |
| カラーパレット | Apple System Colors 使用（CSS 変数経由）  |      |
| スペーシング   | 8px グリッドで統一                        |      |
| 角丸           | 8px-12px の範囲で統一                     |      |
| 影             | カード: `0 1px 3px rgba(0,0,0,0.04)` 準拠 |      |
| フォント       | システムフォント（`-apple-system`）使用   |      |

#### 7-2. インタラクション

| 検証項目                 | 合格基準                                 | 結果 |
| ------------------------ | ---------------------------------------- | ---- |
| ホバーフィードバック     | 全インタラクティブ要素にホバー状態がある |      |
| アクティブフィードバック | ボタン押下時に視覚フィードバックがある   |      |
| フォーカス表示           | Tab でフォーカスリングが表示される       |      |
| アニメーション時間       | 200-300ms の範囲                         |      |
| 破壊的操作の確認         | 削除操作に確認ダイアログが表示される     |      |

#### 7-3. レスポンシブ対応

| ブレークポイント   | 検証内容                                    | 結果 |
| ------------------ | ------------------------------------------- | ---- |
| sm（640px 未満）   | モバイルレイアウト（1カラム、スタック配置） |      |
| md（640px-1024px） | タブレットレイアウト（2カラム）             |      |
| lg（1024px 以上）  | デスクトップレイアウト（フルレイアウト）    |      |

### Task 8: 総合判定

全レビュー観点（Task 1-7）の結果を集計し、以下の基準で判定する:

| 条件                                    | 判定     |
| --------------------------------------- | -------- |
| 全 Task で問題なし                      | PASS     |
| 機能に影響しない軽微な指摘が 1 件以上   | MINOR    |
| 機能不全・セキュリティ脆弱性が 1 件以上 | MAJOR    |
| 要件との根本的な乖離が 1 件以上         | CRITICAL |

---

## MINOR 判定時の必須フロー

MINOR 判定の場合、以下の3ステップを全て実行する（**省略不可**）:

1. **指摘事項を未タスク指示書に変換**
   - ファイル: `docs/30-workflows/unassigned-task/UT-UI-05B-XXX.md`
   - 形式: タスク仕様書フォーマット（メタ情報、目的、実行手順、完了条件）
2. **`task-workflow.md` 残課題テーブルに登録**
   - タスクID、概要、優先度、関連 Phase を記録
3. **関連仕様書に参照リンクを追加**
   - 該当する Phase 仕様書（Phase 2 設計書等）に未タスクへのリンクを追記

---

## 参照資料

| 資料                                       | 用途                                                                              |
| ------------------------------------------ | --------------------------------------------------------------------------------- |
| Phase 1 要件定義書                         | 受け入れ基準の突合                                                                |
| Phase 2 設計書                             | コンポーネント階層・IPC 設計                                                      |
| Phase 5 実装サマリー                       | 実装契約とコード実体の突合                                                        |
| Phase 4 テスト設計書                       | テストケース網羅性確認                                                            |
| Phase 9 品質保証レポート                   | 品質検証結果の確認                                                                |
| `01-architecture.md`                       | Apple HIG、Atomic Design                                                          |
| `02-code-quality.md`                       | 型安全・コーディング規約                                                          |
| `04-electron-security.md`                  | IPC セキュリティ原則                                                              |
| `05-task-execution.md` Phase 10 セクション | レビューゲート判定基準                                                            |
| `06-known-pitfalls.md`                     | P5, P13, P27, P31, P39, P40, P42, P47                                             |
| aiworkflow IPC契約                         | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              |
| aiworkflow 型契約                          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` |
| aiworkflow セキュリティ                    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      |
| aiworkflow UI仕様                          | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           |
| aiworkflow Feature仕様                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   |
| aiworkflow 層設計                          | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`         |
| aiworkflow 全体構成                        | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`      |
| aiworkflow 品質要件                        | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       |
| aiworkflow ワークフロー                    | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              |

---

## 実行手順

1. Phase 1 の受け入れ基準を読み込み、4ビューの機能完全性を検証する（Task 1）
2. コード品質を検証する（Task 2）
3. テスト品質を検証する（Task 3）
4. セキュリティを検証する（Task 4）
5. パフォーマンスを検証する（Task 5）
6. ドキュメント整合性を検証する（Task 6）
7. UI/UX を検証する（Task 7）
8. 全レビュー観点の結果を集計し、総合判定を行う（Task 8）
9. MINOR 指摘がある場合、未タスク仕様書に変換する（3ステップ全実行）
10. 最終レビューレポートを作成する

## 統合テスト連携【必須】

| 連携観点             | 実施内容                                         | 受け渡し先                                |
| -------------------- | ------------------------------------------------ | ----------------------------------------- |
| Phase 1/2/5 契約整合 | 要件・設計・実装の三点突合を実施する             | `outputs/phase-10/final-review-result.md` |
| Phase 6/7/9 品質整合 | テスト拡充・カバレッジ・品質保証の証跡を統合する | `outputs/phase-10/review-checklist.md`    |
| MINOR 指摘運用       | 未タスク3ステップ（指示書/台帳/参照）を確定する  | `outputs/phase-10/unassigned-tasks.md`    |
| Phase 11 進行条件    | 手動テストに必要な検証観点を固定する             | `phase-11-manual-test.md`                 |

---

## 成果物

| 成果物                 | パス                                      | 説明                                          |
| ---------------------- | ----------------------------------------- | --------------------------------------------- |
| 最終レビューレポート   | `outputs/phase-10/final-review-result.md` | 全観点の判定結果と総合判定                    |
| レビューチェックリスト | `outputs/phase-10/review-checklist.md`    | 全検証項目のチェック結果一覧                  |
| 未タスク一覧           | `outputs/phase-10/unassigned-tasks.md`    | MINOR 指摘の未タスク化結果（0件でも作成必須） |

---

## 完了条件

- [ ] 機能完全性検証（Task 1）: 4ビュー全ての受け入れ基準が検証済み
- [ ] コード品質検証（Task 2）: 全項目が合格基準を満たしている
- [ ] テスト品質検証（Task 3）: カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を充足
- [ ] セキュリティ検証（Task 4）: IPC セキュリティ原則が全項目遵守されている
- [ ] パフォーマンス検証（Task 5）: 初期表示 1 秒以内、大量データ応答が滑らか
- [ ] ドキュメント整合性検証（Task 6）: 設計書と実装の乖離が 0 箇所
- [ ] UI/UX 検証（Task 7）: Apple HIG 準拠、WCAG 2.1 AA 基準充足
- [ ] 総合判定（Task 8）: PASS / MINOR / MAJOR / CRITICAL のいずれかが記録されている
- [ ] MINOR 指摘がある場合: 全指摘が未タスク仕様書に変換されている（3ステップ全実行）
- [ ] MAJOR 指摘がある場合: 戻り先 Phase と修正方針が明記されている
- [ ] CRITICAL 指摘がある場合: Phase 1 への戻りと要件再確認事項が明記されている
- [ ] 最終レビューレポート（`outputs/phase-10/final-review-result.md`）が作成されている
- [ ] レビューチェックリスト（`outputs/phase-10/review-checklist.md`）が作成されている
- [ ] 未タスク一覧（`outputs/phase-10/unassigned-tasks.md`）が作成されている（0件でも必須）
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 11: 手動テスト検証
