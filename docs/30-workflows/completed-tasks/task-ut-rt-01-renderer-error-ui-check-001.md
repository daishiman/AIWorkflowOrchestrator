# Renderer 側エラーメッセージ UI 表示 E2E 確認 - タスク指示書

## メタ情報

```yaml
issue_number: 2007
```

## メタ情報

| 項目         | 内容                                                   |
| ------------ | ------------------------------------------------------ |
| タスクID     | TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001              |
| タスク名     | Renderer 側エラーメッセージ UI 表示 E2E 確認           |
| 分類         | 検証 / follow-up                                       |
| 対象機能     | SkillLifecyclePanel.tsx / IPC エラーメッセージ伝搬     |
| 優先度       | 中                                                     |
| 見積もり規模 | 小規模                                                 |
| ステータス   | 完了（completed ledger へ移管）                        |
| 発見元       | Phase 11 既知の制限 / Phase 1 スコープ「含まないもの」 |
| 発見日       | 2026-04-06                                             |
| 親タスク     | TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 |
| issue番号    | 2007                                                   |

---

> 完了済み: 2026-04-13。GitHub Issue #2007 に統一し、completed ledger へ移管済み。

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 では、Main 層（`RuntimeSkillCreatorFacade.ts`・`creatorHandlers.ts`・`skill-creator-api.ts`）のエラーメッセージ伝搬を統一した。

IPC ブリッジ（preload の `onWorkflowStateChanged`）も variadic 化され、`webContents.send(channel, snapshot, errorMessage)` で送信した errorMessage が Renderer 側コールバックの第2引数 `errorMessage?` として受け取れるよう実装済みである。

しかし、Renderer 側（`SkillLifecyclePanel.tsx`）でエラーメッセージが実際に画面上に表示されるかについての E2E テストまたは手動テストによる証跡は存在しない。Phase 1 のスコープ「含まないもの」として意図的に除外されたためである。

### 1.2 問題点・課題

- `onWorkflowStateChanged` コールバックが受け取った `errorMessage` は `setWorkflowError(errorMessage)` でストアに保存され、`currentSurfaceError` を通じて `data-testid="skill-lifecycle-error"` の `<div role="alert">` に表示される実装がある
- しかし、この経路が実際に runtime で正常動作するかは型レベルでしか確認されていない
- `onWorkflowStateSnapshot` の第3引数 `error?` は optional のため、Renderer 側が実際に受け取れているかの E2E 証跡がない
- ユーザーが「スキル実行に失敗した原因」を UI から読み取れることを保証する証跡が存在しない

### 1.3 放置した場合の影響

- スキル実行失敗時にエラーメッセージが UI に表示されず、ユーザーが原因を把握できない
- IPC ブリッジの variadic 化が runtime で意図通りに動作しなかった場合、エラーがサイレントに握り潰される
- ユーザー体験の低下（失敗理由が不明なままスキル実行が終了する）

---

## 2. 何を達成するか（What）

### 2.1 目的

`SkillLifecyclePanel.tsx` において、スキル実行失敗時に IPC 経由で届いたエラーメッセージが `data-testid="skill-lifecycle-error"` の `<div role="alert">` に正しく表示されることを E2E テストまたは手動テストで確認する。

### 2.2 最終ゴール

以下の状態を検証可能な形で確認すること:

1. `onWorkflowStateChanged` コールバックの第2引数 `errorMessage` が Renderer に届いている
2. `setWorkflowError(errorMessage)` によって `workflowError` ストアに保存される
3. `currentSurfaceError`（`localError ?? workflowError ?? skillError`）が `null` でない場合、`data-testid="skill-lifecycle-error"` の `<div role="alert">` にエラーメッセージが表示される
4. execute ack 後に `getWorkflowState()` を再読込し、failure snapshot を優先的に表示するフローが正常に動作する

### 2.3 スコープ

#### 含むもの

- `SkillLifecyclePanel.tsx` のエラー表示経路の E2E テストまたは手動テスト
- `onWorkflowStateChanged` → `setWorkflowError` → `currentSurfaceError` の経路確認
- `executeSkill` 失敗時（`skillExecutionStatus === "error"`）のエラー表示確認
- `getWorkflowState()` 再読込後の failure snapshot 表示確認
- 必要に応じた Renderer 側エラー表示コンポーネントの追加または修正

#### 含まないもの

- Main 層（`RuntimeSkillCreatorFacade.ts`・`creatorHandlers.ts`）の実装変更
- IPC ブリッジ（preload）の実装変更
- `SkillCreateWizard.tsx` など他コンポーネントのエラー表示確認
- exhaustive check 導入（別タスク）

### 2.4 成果物

- E2E テストファイルまたは手動テスト結果レポート
- 必要に応じた `SkillLifecyclePanel.tsx` の修正差分（エラー表示が欠如していた場合）
- 本タスクの完了報告（テスト結果の証跡）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 が完了済みであること（IPC ワイヤリング完了が前提）
- Electron アプリがビルド可能な状態であること
- `pnpm install` 済みであること

### 3.2 依存タスク

| 依存タスク                                             | 内容                       |
| ------------------------------------------------------ | -------------------------- |
| TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 | IPC ワイヤリング完了が前提 |

### 3.3 必要な知識

- `SkillLifecyclePanel.tsx` のエラー表示ロジック（`currentSurfaceError`、`data-testid="skill-lifecycle-error"`）
- `onWorkflowStateChanged` コールバックのシグネチャ（`(snapshot, errorMessage?) => void`）
- Vitest / Playwright を使った Renderer コンポーネントのテスト手法
- Redux ストアの `workflowError` スライスの仕組み
- IPC ブリッジ（preload の `onWorkflowStateChanged`）の variadic 化の仕組み（L-004 教訓を参照）

### 3.4 推奨アプローチ

**アプローチ A（推奨）: Vitest + testing-library による単体/統合テスト**

`SkillLifecyclePanel.test.tsx` に以下のテストを追加する:

1. `onWorkflowStateChanged` モックから `errorMessage` を発火させる
2. `data-testid="skill-lifecycle-error"` の `<div role="alert">` に errorMessage が表示されることを確認する

**アプローチ B: Playwright による E2E テスト**

実際の Electron アプリを起動し、スキル実行失敗シナリオを手動または自動で再現して画面上のエラー表示を確認する。

**アプローチ C: 手動テスト**

開発環境でアプリを起動し、意図的に失敗するスキルを実行してエラーメッセージが UI に表示されることを目視確認する。結果をスクリーンショットまたはログで記録する。

---

## 4. 実行手順

### Phase 構成

本タスクは小規模のため 3 フェーズ構成とする。

```
Phase 1: 現状調査
Phase 2: テスト実装または手動確認
Phase 3: 結果記録・ドキュメント更新
```

---

### Phase 1: 現状調査

#### 目的

`SkillLifecyclePanel.tsx` のエラー表示経路を把握し、テスト対象を特定する。

#### 手順

1. `SkillLifecyclePanel.tsx` の以下の箇所を確認する:
   - `currentSurfaceError` の定義（`localError ?? workflowError ?? skillError`）
   - `data-testid="skill-lifecycle-error"` の `<div role="alert">` の条件分岐
   - `onWorkflowStateChanged` コールバック（`(snapshot, errorMessage) => void`）の実装
2. `useWorkflowError` / `useSetWorkflowError` ストアフックの実装を確認する
3. `skillExecutionStatus === "error"` 時の `sessionEntries` への追記ロジックを確認する（`skillError` の利用箇所）
4. execute ack 後の `getWorkflowState()` 再読込フロー（`handleExecutePlan` 内）を確認する

#### 成果物

- 調査メモ（確認済みのエラー表示経路の一覧）

#### 完了条件

- エラーメッセージが UI に届く全経路（IPC → store → render）が把握できている

---

### Phase 2: テスト実装または手動確認

#### 目的

エラーメッセージが実際に `data-testid="skill-lifecycle-error"` に表示されることを確認する。

#### 手順（アプローチ A: Vitest の場合）

1. 既存のテストファイルを確認する:
   ```bash
   pnpm --filter @repo/desktop exec vitest run --reporter=verbose 2>&1 | grep -i "SkillLifecyclePanel"
   ```
2. `SkillLifecyclePanel.test.tsx` を作成または更新し、以下のテストを追加する:

   ```typescript
   it("onWorkflowStateChanged で errorMessage を受信したとき skill-lifecycle-error に表示する", async () => {
     // window.skillCreatorAPI.onWorkflowStateChanged のモックから errorMessage を発火
     // data-testid="skill-lifecycle-error" の role="alert" にメッセージが表示されることを確認
   });
   ```

3. テストを実行して PASS することを確認する:
   ```bash
   pnpm --filter @repo/desktop exec vitest run apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.test.tsx
   ```

#### 手順（アプローチ C: 手動テストの場合）

1. Electron アプリを開発モードで起動する:
   ```bash
   pnpm --filter @repo/desktop dev
   ```
2. スキルを選択し、意図的に失敗するプロンプトを実行する
3. `data-testid="skill-lifecycle-error"` にエラーメッセージが表示されることを確認する
4. Chrome DevTools で `workflowError` ストアの値を確認する
5. スクリーンショットを撮影してログに残す

#### 成果物

- テストファイル（アプローチ A の場合）またはスクリーンショット付きテスト結果レポート（アプローチ C の場合）

#### 完了条件

- エラーメッセージが `data-testid="skill-lifecycle-error"` に正しく表示されることが確認できている
- テストが PASS している（アプローチ A の場合）

---

### Phase 3: 結果記録・ドキュメント更新

#### 目的

テスト結果を記録し、タスクを完了させる。

#### 手順

1. テスト結果をこのファイルの「検証方法」セクションに追記する
2. 必要に応じて `SkillLifecyclePanel.tsx` に修正を加えた場合は差分を記録する
3. GitHub Issue #2007 をクローズする:
   ```bash
   gh issue close 2007 --comment "TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001 完了: エラーメッセージの UI 表示を確認しました。"
   ```
4. このタスク指示書のステータスを「完了」に更新する

#### 成果物

- 更新済みタスク指示書
- クローズされた GitHub Issue #2007

#### 完了条件

- 本指示書のステータスが「完了」になっている
- GitHub Issue #2007 がクローズされている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `onWorkflowStateChanged` の `errorMessage` が `setWorkflowError` でストアに保存されることが確認済み
- [ ] `workflowError` が `currentSurfaceError` を通じて `data-testid="skill-lifecycle-error"` に表示されることが確認済み
- [ ] `skillExecutionStatus === "error"` 時に `skillError` がセッションログの detail に表示されることが確認済み
- [ ] execute ack 後の `getWorkflowState()` 再読込で failure snapshot が優先表示されることが確認済み

### 品質要件

- [ ] E2E テストまたは手動テストの証跡が残っている
- [ ] エラー表示が欠如していた場合は修正済みで、テストが PASS している
- [ ] `pnpm lint` が通過している（修正した場合）

### ドキュメント要件

- [ ] このタスク指示書のステータスが「完了」になっている
- [ ] GitHub Issue #2007 がクローズされている

---

## 6. 検証方法

### テストケース

| #     | シナリオ                                                                                 | 期待結果                                                                        |
| ----- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| TC-01 | `onWorkflowStateChanged` コールバックに `errorMessage = "実行に失敗しました"` を渡す     | `data-testid="skill-lifecycle-error"` に "実行に失敗しました" が表示される      |
| TC-02 | `skillExecutionStatus` が `"error"` に変化し、`skillError = "タイムアウトエラー"` がある | セッションログの detail に "タイムアウトエラー" が表示される                    |
| TC-03 | `getWorkflowState()` が failure snapshot（`currentPhase: "failed"`）を返す               | failure 状態が UI に反映される                                                  |
| TC-04 | `localError` が設定されている場合                                                        | `workflowError` より優先して `data-testid="skill-lifecycle-error"` に表示される |

### 検証手順

1. `SkillLifecyclePanel.tsx` の `currentSurfaceError` が `null` でないとき `data-testid="skill-lifecycle-error"` がレンダリングされることをコードで確認する
2. テストまたは手動操作でエラーを発生させ、上記テストケースを実行する
3. 全テストケースが期待通りであることを確認する

---

## 7. リスクと対策

| リスク                                                                                                      | 影響度 | 発生確率 | 対策                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------- | ------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| IPC ブリッジの variadic 化が runtime で正常動作しない                                                       | 高     | 低       | preload の `onWorkflowStateChanged` の実装を確認し、`safeOn` が第2引数を正しく渡せているか検証する（L-004 教訓を参照）                  |
| `onWorkflowStateChanged` コールバックが `applyWorkflowSnapshot` 後に `workflowError` を null にリセットする | 中     | 中       | `applyWorkflowSnapshot` 内の `setWorkflowError(null)` は `handoff` フェーズ以外でのみ実行されることを確認する（Issue #1844 の修正内容） |
| Vitest でのコンポーネントテスト環境が未整備                                                                 | 低     | 中       | アプローチ C（手動テスト）に切り替え、スクリーンショットで証跡を残す                                                                    |
| 既存のエラー表示が正常動作しておりテスト不要だった                                                          | 低     | 中       | 手動確認で確認できた場合もその証跡を記録して Issue をクローズする                                                                       |

---

## 8. 参照情報

### 関連ドキュメント

- 親タスク完了ドキュメント: `docs/30-workflows/completed-tasks/task-ut-rt-01-execute-async-snapshot-error-message-001/`
- Phase 12 未タスク検出: `docs/30-workflows/completed-tasks/task-ut-rt-01-execute-async-snapshot-error-message-001/outputs/phase-12/unassigned-task-detection.md`
- Phase 11 発見課題: `docs/30-workflows/completed-tasks/task-ut-rt-01-execute-async-snapshot-error-message-001/outputs/phase-11/discovered-issues.md`
- スキルフィードバックレポート: `docs/30-workflows/completed-tasks/task-ut-rt-01-execute-async-snapshot-error-message-001/outputs/phase-12/skill-feedback-report.md`

### 関連ファイル

- 対象コンポーネント: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- エラー表示箇所（行 1750-1758）: `data-testid="skill-lifecycle-error"` の `<div role="alert">`
- IPC リスナー（行 665-679）: `skillCreatorApi.onWorkflowStateChanged` コールバック

### 参考資料

- GitHub Issue #2007: `[UT-RT-03] Renderer側エラーメッセージUI表示E2E確認`

---

## 9. 備考

### 苦戦箇所【記入必須】

> 以下は親タスク TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 の実装知見から転記した苦戦箇所。本タスク実行時に参照すること。

| 項目     | 内容                                                                                                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状     | IPC ブリッジの可変長引数が runtime で正しく動作するか型レベルだけでは確認できない                                                                                               |
| 原因     | preload の `safeOn` が 1 引数固定の場合、Main 側で `webContents.send(channel, snapshot, errorMessage)` としても errorMessage が Renderer に届かない                             |
| 対応     | multi-arg event は preload bridge を variadic 化し、Renderer 側 callback でも optional errorMessage を受け取るよう修正済み（L-004）。ただし runtime での動作は E2E で確認が必要 |
| 再発防止 | snapshot 以外のメタ情報を同一 IPC イベントで流す場合は preload bridge の variadic 対応を E2E レベルで検証すること                                                               |

| 項目     | 内容                                                                                                      |
| -------- | --------------------------------------------------------------------------------------------------------- |
| 症状     | `onWorkflowStateSnapshot` の第3引数 `error?` は optional のため Renderer 側が実際に受け取れているかが不明 |
| 原因     | optional 引数はコンパイルエラーにならないため、静的解析だけでは受け取れているか判断できない               |
| 対応     | E2E テストまたは手動テストで実際にエラーメッセージが UI に表示されることを確認する（本タスクの目的）      |
| 再発防止 | Main/Renderer 層にまたがるロジックは E2E レベルで統合的に検証することを必須とする                         |

| 項目     | 内容                                                                                                                                          |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状     | execute ack 後に `getWorkflowState()` を再読込して failure snapshot を優先的に表示するフローが想定通りに動作するか不明                        |
| 原因     | ack 受理後の snapshot 取得は非同期であり、後続の workflow event に委譲する設計になっているため、failure snapshot が必ずしも即座に反映されない |
| 対応     | `handleExecutePlan` 内の `getWorkflowState()` 呼び出し後のフローを確認し、failure snapshot の優先表示ロジックを検証する                       |
| 再発防止 | ack → getWorkflowState → processWorkflowOutcome の経路をテストシナリオに含めること                                                            |

### レビュー指摘の原文（該当する場合）

```
（Phase 11 既知の制限より）
Renderer 側 UI 確認は本タスクのスコープ外のため、未タスク候補として Phase 12 で扱っている。

（Phase 12 未タスク検出より）
未タスク 2: Renderer 側 UI 表示確認
- 背景: 本タスクのスコープは Main 層のみ。Renderer 側（SkillCreateWizard.tsx / SkillLifecyclePanel.tsx）でエラー第3引数を受け取る実装はスコープ外
- 課題: onWorkflowStateSnapshot の error? 引数が Renderer UI に実際に表示されているか未確認
- 優先度: IPC ワイヤリングは既存のため低リスクだが、E2E 確認として有用
```

### 補足事項

- `currentSurfaceError` は `localError ?? workflowError ?? skillError` の優先順位で評価される。エラー表示のデバッグ時はこの優先順位を意識すること。
- `applyWorkflowSnapshot` 内では `snapshot.currentPhase !== "handoff"` のとき `setWorkflowError(null)` が呼ばれるため、handoff 以外のフェーズ遷移で `workflowError` がリセットされる可能性がある（Issue #1844 の修正内容）。
- 本タスクは IPC ワイヤリングが既存のため低リスクだが、ユーザー体験の観点から E2E 証跡を残すことが重要。
