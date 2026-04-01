# TASK-FIX-LIFECYCLE-PANEL-ERROR-001: SkillLifecyclePanel phase:failed 時エラー消去バグ修正

## メタ情報

```yaml
issue_number: ~
```

## メタ情報

| 項目         | 値                                                              |
| ------------ | --------------------------------------------------------------- |
| issue_number | ~（要 Issue 作成）                                              |
| タスクID     | TASK-FIX-LIFECYCLE-PANEL-ERROR-001                              |
| タスク名     | fix-step5-seq-lifecycle-panel-error                             |
| 分類         | バグ修正                                                        |
| 対象機能     | スキル生成UI エラー表示（Renderer 側）                          |
| 優先度       | 高                                                              |
| 見積もり規模 | 小規模（1 行の条件分岐追加 + テスト追加）                       |
| ステータス   | 未実施                                                          |
| 発見元       | TASK-FIX-EXECUTE-PLAN-FF-001（step3）完了後に顕在化するバグ予測 |
| 発見日       | 2026-04-01                                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`SkillLifecyclePanel.tsx` の `onWorkflowStateChanged` コールバックは、IPC 経由で届くワークフロー状態スナップショットを受け取るたびに `setWorkflowError(null)` を無条件呼び出している。

TASK-FIX-EXECUTE-PLAN-FF-001（step3）の完了により、`SKILL_CREATOR_WORKFLOW_STATE_CHANGED` イベントが fire-and-forget 方式でバックグラウンドから随時配信されるようになる。その結果、`phase: 'failed'` スナップショットが届いた直後に別のスナップショットが届き、エラー状態がゼロクリアされてしまう問題が発現する。

### 1.2 問題点・課題

- `setWorkflowError(null)` の無条件呼び出しにより、`phase: 'failed'` 後に配信される他のスナップショットでエラーメッセージが即座に消える
- ユーザーはエラーが発生したことを確認できないまま操作を続けてしまう
- 修正箇所は `SkillLifecyclePanel.tsx:539` の 1 行のみだが、影響範囲の把握が複雑（fire-and-forget 移行との依存関係）

### 1.3 放置した場合の影響

- スキル生成が失敗してもユーザーに通知されず、再試行の機会を逃す
- エラー原因の特定が困難になり、サポートコストが増大する
- TASK-FIX-EXECUTE-PLAN-FF-001（step3）以降、エラー表示が完全に機能しなくなる

---

## 2. 何を達成するか（What）

### 2.1 目的

スキル生成が `phase: 'failed'` で終了したとき、UI 上のエラーメッセージが消えずに表示されたままになること。

### 2.2 最終ゴール

1. `onWorkflowStateChanged` コールバックが `phase: 'failed'` 時に `setWorkflowError(null)` を呼ばないようにする
2. エラー永続化のテストを追加し、回帰を防止する

### 2.3 スコープ

#### 含むもの

- `SkillLifecyclePanel.tsx:539` の条件分岐追加
- `SkillLifecyclePanel.error-persistence.test.tsx` の新規作成

#### 含まないもの

- 他コンポーネントへの変更
- エラーメッセージの表示 UI 改善
- WORKFLOW_STATE_CHANGED イベントスキーマの変更

### 2.4 成果物

| 成果物                       | パス                                                                                                  | 種別       |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- | ---------- |
| SkillLifecyclePanel.tsx 修正 | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                  | コード修正 |
| エラー永続化テスト           | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.error-persistence.test.tsx` | テスト追加 |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-FIX-ENV-STRIPPING（step0）完了済み — SDK が動作する状態であること ✅
- TASK-FIX-EXECUTE-PLAN-FF-001（step3）完了済み — `WORKFLOW_STATE_CHANGED` が fire-and-forget から届く状態であること（**未完了**）

### 3.2 依存タスク

| タスクID                       | 状態      | 内容                                                     |
| ------------------------------ | --------- | -------------------------------------------------------- |
| TASK-FIX-ENV-STRIPPING         | ✅ 完了   | SDK 動作環境の復旧（env オプション全環境変数上書き修正） |
| TASK-FIX-AUTH-LOGIN-IPC-NB-001 | 🟡 着手中 | auth:login IPC ノンブロッキング化（step2）               |
| TASK-FIX-EXECUTE-PLAN-FF-001   | ❌ 未着手 | execute-plan の fire-and-forget 化（step3）              |
| TASK-NOTIFICATION-SERVICE-001  | ❌ 未着手 | 通知サービス実装（step4）                                |

### 3.3 必要な知識

- `SkillLifecyclePanel.tsx` の `onWorkflowStateChanged` コールバック処理
- IPC イベント `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` のペイロード構造
- React 状態管理（`setWorkflowError` の使われ方）

### 3.4 推奨アプローチ

修正は `if (snapshot.phase !== 'failed')` で `setWorkflowError(null)` を囲む 1 行変更。
テストは `phase: 'failed'` スナップショット後に別スナップショットが届いても `workflowError` が null にならないことを検証する。

### 3.5 実装課題と解決策（関連タスクからの教訓）

| 課題                                                               | 発見経緯                                                                                  | 解決策                                                                                | 教訓                                                               |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| env オプションが全環境変数を上書きする問題                         | SkillExecutor.ts で `env: { ANTHROPIC_API_KEY: apiKey }` と記述したため PATH 等が消えた   | `env: { ...process.env, ANTHROPIC_API_KEY: apiKey }` にスプレッドで上書き優先         | `child_process.spawn` の env は完全置換。スプレッドを忘れずに      |
| auth:login IPC がブロッキング処理でタイムアウト 500ms に引っかかる | TASK-FIX-IPC-TIMEOUT-001 調査で判明。IPC チャンネルごとにタイムアウト設定が必要だった     | `CHANNEL_TIMEOUTS` にチャンネル別タイムアウトを定義する方式で解決                     | safeInvoke 共通タイムアウトはチャンネル特性を考慮していなかった    |
| step3 完了前に step5 を実装すると問題が再現しない                  | fire-and-forget 化（step3）により初めて連続スナップショットが届くため、手前での検証が困難 | step3 完了後に step5 を着手する設計を維持する。単体テストはイベント配信をモックで再現 | 依存タスクの完了がバグ顕在化のトリガーになる設計は仕様書で明示する |

---

## 4. 実行手順

### Phase構成

| Phase | 名称             | 主な作業                                 |
| ----- | ---------------- | ---------------------------------------- |
| 1     | 要件定義         | 受入条件（AC）定義・P50チェック          |
| 2     | 設計             | 1 concern 変更設計、変更前後コード比較   |
| 3     | 設計レビュー     | AC 充足確認、Phase 4 進行判定            |
| 4     | テスト作成       | テストファイル 1 本作成（Red 状態）      |
| 5     | 実装             | 修正ファイル 1 本、テスト Green 化       |
| 6     | テスト拡充       | エッジケース・回帰テスト追加             |
| 7     | カバレッジ確認   | コールバック全体のカバレッジ目標達成確認 |
| 8     | リファクタリング | コメント改善、定数化の検討               |
| 9     | 品質保証         | 全体テスト実行、ESLint、型チェック       |
| 10    | 最終レビュー     | AC-1〜AC-5 充足確認、PR 可否判定         |
| 11    | 手動テスト       | エラー表示の有無による確認（NON_VISUAL） |
| 12    | ドキュメント更新 | 実装ガイド・仕様書同期                   |
| 13    | PR作成           | ユーザー明示承認後のみ実施               |

### Phase 1: 要件定義

#### 目的

受入条件を明確化し、修正スコープを確定する。

#### 手順

1. `SkillLifecyclePanel.tsx:539` 周辺コードを精読し現状バグを確認する
2. AC-1〜AC-5 を定義する（phase:failed 時のエラー永続化条件）
3. P50 チェック（修正が 50 行以内であることを確認）

#### 成果物

- 受入条件チェックリスト

#### 完了条件

- AC が漏れなく定義され、Phase 2 進行の判断が可能

### Phase 2: 設計

#### 目的

1 concern の変更設計を確定する。

#### 手順

1. 変更前コード（現状）と変更後コード（修正案）を比較する
2. `if (snapshot.phase !== 'failed')` の挿入位置を確認する

#### 成果物

- Before/After コード比較ドキュメント

#### 完了条件

- 変更が 1 行のみで AC を充足することを確認

### Phase 4: テスト作成（TDD Red）

#### 目的

修正前に失敗するテストを作成する。

#### 手順

1. `SkillLifecyclePanel.error-persistence.test.tsx` を作成する
2. `phase: 'failed'` 後に `setWorkflowError(null)` が呼ばれないことを検証するテストを追加する
3. テストが Red（失敗）であることを確認する

#### 成果物

- テストファイル（Red 状態）

#### 完了条件

- テストが Red であること

### Phase 5: 実装

#### 目的

テストを Green にする。

#### 手順

1. `SkillLifecyclePanel.tsx:539` を修正する（`if (snapshot.phase !== 'failed')` で囲む）
2. テストが Green になることを確認する

#### 成果物

- 修正済み `SkillLifecyclePanel.tsx`

#### 完了条件

- テストが Green であること

### Phase 12: ドキュメント更新

#### 目的

実装内容をドキュメントへ反映する。

#### 成果物（outputs/phase-12/ に配置）

| ファイル                              | 内容                                 |
| ------------------------------------- | ------------------------------------ |
| implementation-guide.md               | 修正手順・設計判断の解説             |
| system-spec-update-summary.md         | 仕様書更新サマリー                   |
| unassigned-task-detection.md          | 未タスク検出結果（派生タスクの有無） |
| skill-feedback-report.md              | スキル実行フィードバック             |
| documentation-changelog.md            | ドキュメント変更ログ                 |
| phase12-task-spec-compliance-check.md | タスク仕様書準拠確認                 |

#### 完了条件

- outputs/phase-12/ に 6 ファイルが揃っていること

---

## 5. テストカバレッジ目標

| 対象ファイル                                                       | 行カバレッジ | ブランチカバレッジ | 備考                                 |
| ------------------------------------------------------------------ | ------------ | ------------------ | ------------------------------------ |
| `SkillLifecyclePanel.tsx`（`onWorkflowStateChanged` コールバック） | 90% 以上     | 90% 以上           | `phase` 条件分岐・handoffBundle 処理 |
