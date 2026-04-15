# スキルウィザード 詳細バグ修正（internalAnswers残留・エラー時リセット・q5再計算・ロック解除）- タスク指示書

## メタ情報

```yaml
issue_number: 2132
task_id: TASK-SW-FIX-STATE-DETAIL-001
status: open
priority: medium
scale: medium
task_type: BUGFIX
```

| 項目         | 内容                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------- |
| タスクID     | TASK-SW-FIX-STATE-DETAIL-001                                                                 |
| タスク名     | スキルウィザード 詳細バグ修正（internalAnswers残留・エラー時リセット・q5再計算・ロック解除） |
| 分類         | バグ修正（状態管理クラスター）                                                               |
| 対象機能     | スキルウィザード / `ConversationRoundStep` / `GenerateStep` / `SkillCreateWizard`            |
| 優先度       | 中（`priority:medium`）                                                                      |
| 見積もり規模 | 中規模（`scale:medium`）                                                                     |
| ステータス   | 未実施（`status:open`）                                                                      |
| 実行ウェーブ | Wave C（Wave B完了後に並列実行可能）                                                         |
| 依存タスク   | TASK-SW-FIX-MODE-MGMT-001・TASK-SW-FIX-FEEDBACK-001（Wave B完了後に開始可能）                |
| 発見元       | 30種の思考法による多角的検証（2026-04-12）・問題12・13・18・19                               |
| 発見日       | 2026-04-12                                                                                   |
| タスク分類   | BUGFIX タスク（状態残留・リカバリーパス・競合状態修正）                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

スキルウィザードの多角的検証（2026-04-12）において、状態管理クラスター（B）に属する4件の詳細バグが特定された。これらは Wave A・B の主要バグ修正後も残留する細粒度の問題であり、Wave C での対応が必要である。

### 1.2 問題点・課題

**問題12（internalAnswers残留）**:

`ConversationRoundStep` の `useEffect` が `answers` prop の変化を監視していない。リトライ時に親コンポーネントから新しい空値が渡されても `internalAnswers` state が前回値を保持したまま残留し、ユーザーが再入力を強いられる。

**問題13（templateモードのリカバリーパス欠如）**:

templateモードでエラーが発生した後、ウィザードを Step 0 に戻す UI 手段が存在しない。ユーザーはアプリを再起動するか他の操作で回復するしかなく、UX を著しく損なう。

**問題18（q5変更後の外部連携情報が古いまま）**:

`SkillCreateWizard` で q5（外部連携質問）の回答が変更されても `resolveExternalIntegration` が再呼び出しされない。その結果 `hasExternalIntegration` と `externalToolName` が古い値のまま保持され、スキル生成時に誤った連携設定が使用される。

**問題19（generationLockRef キャンセル競合状態）**:

`generationLockRef` の finally 節でのリセット条件が不完全であり、キャンセル時にロックが `true` のまま残留する潜在的バグが存在する。これにより以降の生成操作が一切不能になる恐れがある。

### 1.3 放置した場合の影響

- リトライ時に前回の入力値が残留してユーザーが混乱する（問題12）
- templateモードのエラー後にウィザードが操作不能になりアプリ再起動が必要になる（問題13）
- スキル生成時に外部連携設定が古い値で使われ、誤ったスキルが作成される（問題18）
- 一度キャンセルすると以降の生成が全て失敗し、アプリ再起動が必要になる（問題19）

---

## 2. 何を達成するか（What）

### 2.1 目的

スキルウィザードの4件の詳細バグを最小変更で修正し、リトライ・エラーリカバリー・q5変更・キャンセル各フローの信頼性を向上させる。

### 2.2 最終ゴール

1. リトライ時に `ConversationRoundStep` の `internalAnswers` が空値にリセットされる
2. templateモードのエラー時にキャンセルボタンが表示され、Step 0 に戻れる
3. q5変更後に `hasExternalIntegration` と `externalToolName` が最新値で再計算される
4. `generationLockRef` がキャンセル後に正しく `false` に戻り、次の生成操作が可能になる
5. 既存の正常フロー（リトライなし・キャンセルなし）に回帰影響がない

### 2.3 スコープ

**含むもの**:

- `ConversationRoundStep.tsx` の `useEffect` 依存配列修正（`answers` prop 追加）
- `GenerateStep.tsx` の templateモードエラー表示ブロックへのキャンセルボタン追加
- `SkillCreateWizard.tsx` の q5 変更検知と `resolveExternalIntegration` 再計算ロジック追加
- `SkillCreateWizard.tsx` の `generationLockRef` finally 節リセット条件修正
- 対応するユニットテスト（AC-1〜AC-5 の検証テスト）

**含まないもの**:

- Step 0〜Step 1 以外のウィザードフロー変更
- Main Process 実装修正
- IPC 契約変更
- Wave A・B 担当のバグ修正（TASK-SW-FIX-MODE-MGMT-001・TASK-SW-FIX-FEEDBACK-001）

### 2.4 成果物

- `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`（useEffect依存修正）
- `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`（キャンセルボタン追加）
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`（q5再計算・ロック解除修正）
- 対応するテストファイル（新規テストケース追加）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Wave B のタスク（TASK-SW-FIX-MODE-MGMT-001・TASK-SW-FIX-FEEDBACK-001）が完了していること
- `ConversationRoundStep.tsx`・`GenerateStep.tsx`・`SkillCreateWizard.tsx` のコード理解
- React `useEffect` の依存配列の動作仕様の理解

### 3.2 依存タスク

| タスクID                  | 関係   | 内容                                      |
| ------------------------- | ------ | ----------------------------------------- |
| TASK-SW-FIX-MODE-MGMT-001 | 依存先 | Wave B 完了後に本タスクを開始可能         |
| TASK-SW-FIX-FEEDBACK-001  | 依存先 | Wave B 完了後に本タスクを開始可能         |
| TASK-SW-FIX-UI-001        | 並列   | Wave C 内で Phase 1-4/6-13 は並列実行可能 |

### 3.3 必要な知識

- React `useEffect` の依存配列と再実行タイミング
- `useRef` を使った非同期ロック管理パターン
- Promiseチェーンの finally 節における非同期処理の制御
- TypeScript のカスタムイベントハンドラー定義

### 3.4 推奨アプローチ

**問題12**: `useEffect` の依存配列に `answers` を追加し、変化時に `setInternalAnswers({})` を実行する。無限ループを避けるため、`answers` の参照同一性ではなく値の変化（`JSON.stringify` 比較等）での検知を検討する。

**問題13**: `GenerateStep` の templateモードエラーブロック内に `onCancel` コールバックを呼び出すボタンを追加する。非templateモードのUIには影響を与えない分岐条件で実装する。

**問題18**: `useEffect` の依存配列に q5 回答値を追加するか、q5 変更ハンドラー内で `resolveExternalIntegration` を直接再呼び出しする方針を選択する。

**問題19**: `generationLockRef.current = false` を finally 節の先頭に無条件で配置し、正常完了・エラー・キャンセルの全3経路でロックが解放されることを保証する。

---

## 4. 実行手順

### Phase 1: 要件定義

- 4件の問題（問題12・13・18・19）を個別の問題文として固定
- AC-1〜AC-5 を検証可能な形で定義
- 含む/含まないスコープ境界を明確化

### Phase 2: 設計

- 問題12: `useEffect` 依存配列修正設計・無限ループ回避方針の確定
- 問題13: templateモードエラーブロックへのキャンセルボタン追加位置と `onCancel` 設計の確定
- 問題18: q5 変更検知のトリガーと `resolveExternalIntegration` 再計算フローの確定
- 問題19: finally 節リセット条件と3経路（正常・エラー・キャンセル）すべてでのロック解放設計の確定

### Phase 3: 設計レビュー

- 4件の修正設計を独立レビュー
- 無限ループリスク・PromiseChain 破壊リスク・UI 回帰リスクの評価
- PASS / MINOR / MAJOR / CRITICAL の判定（MAJOR以上は Phase 2 に差し戻し）

### Phase 4: テスト作成（fail-first）

- AC-1: リトライ時に `internalAnswers` が空値にリセットされることを検証するテスト
- AC-2: templateモードエラー時にキャンセルボタンが表示されること・押下時に Step 0 に戻ることを検証するテスト
- AC-3: q5 変更後に `hasExternalIntegration` / `externalToolName` が最新値になることを検証するテスト
- AC-4: キャンセル後に `generationLockRef.current` が `false` になることを検証するテスト
- AC-5: 既存正常フローの回帰テスト（fail しないことを確認）

### Phase 5: 実装

- `ConversationRoundStep.tsx` の `useEffect` 依存配列に `answers` を追加・リセットロジック実装（問題12）
- `GenerateStep.tsx` の templateモードエラーブロックにキャンセルボタン追加（問題13）
- `SkillCreateWizard.tsx` に q5 変更検知と `resolveExternalIntegration` 再呼び出しロジック追加（問題18）
- `SkillCreateWizard.tsx` の `generationLockRef` finally 節リセット条件修正（問題19）

### Phase 6: テスト拡充

- エッジケースのテスト追加（q5 が未変更の場合に再計算が発生しないこと等）
- 境界値テスト（answers が undefined・null・空オブジェクトのケース）

### Phase 7: カバレッジ確認

- 4件の修正箇所すべてでユニットテストカバレッジ 100% を確認
- 統合テストのカバレッジレポート確認

### Phase 8: リファクタリング

- 修正コードの可読性・保守性の改善
- コメント・JSDoc の整備
- 変数命名・責務分離の見直し

### Phase 9: 品質保証

- `pnpm lint` / `pnpm typecheck` を実行して警告・エラーがないことを確認
- 全テストスイートの PASS 確認
- 回帰テストの実行

### Phase 10: 最終レビュー

- AC-1〜AC-5 とテストの対応表を再確認
- PASS / MINOR は Phase 11 へ、MAJOR は Phase 8 に差し戻し

### Phase 11: 手動テスト

- リトライシナリオで `internalAnswers` が空になることを目視確認
- templateモードエラー後のキャンセルボタン表示と Step 0 遷移を目視確認
- q5 変更後の外部連携情報更新を目視確認
- キャンセル後の再生成操作が可能なことを目視確認

### Phase 12: ドキュメント更新

- 実装記録・変更ファイル一覧の整備
- `useEffect` 依存配列設計方針のコメント追記
- 詳細仕様書の outputs/ 以下に各 Phase 成果物を生成

### Phase 13: PR作成

- ブランチ作成・コミット・PR 作成
- PR タイトル・本文（変更概要・テスト方法）の記述
- レビュアーアサイン

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] AC-1: リトライ時に `ConversationRoundStep` の `internalAnswers` が空値にリセットされる
- [ ] AC-2: templateモードのエラー時にキャンセルボタンが表示され、Step 0 に戻れる
- [ ] AC-3: q5 変更後に `hasExternalIntegration` と `externalToolName` が最新値で再計算される
- [ ] AC-4: `generationLockRef` がキャンセル後に正しく `false` に戻り、次の生成操作が可能になる
- [ ] AC-5: 既存の正常フロー（リトライなし・キャンセルなし）に回帰影響がない

### 品質要件

- [ ] 修正箇所のユニットテストカバレッジが 100%
- [ ] TypeScript 型エラーなし（`pnpm typecheck` PASS）
- [ ] ESLint 警告・エラーなし（`pnpm lint` PASS）
- [ ] 既存テストスイートが全て PASS

### ドキュメント要件

- [ ] `useEffect` 依存配列の修正意図をコードコメントで明記
- [ ] `generationLockRef` のロック解放保証をコードコメントで明記
- [ ] Phase 1-13 の成果物が `outputs/` 以下に生成されている

---

## 6. 検証方法

### テストケース

| テストID | 対象バグ | 入力条件                                                     | 期待結果                                                  | 備考                             |
| -------- | -------- | ------------------------------------------------------------ | --------------------------------------------------------- | -------------------------------- |
| TC-01    | 問題12   | リトライ時に `answers` prop に空オブジェクト `{}` が渡される | `internalAnswers` state が `{}` にリセットされる          | useEffect 再実行確認             |
| TC-02    | 問題12   | 通常フローで `answers` が変化しない                          | `internalAnswers` state が変化しない（回帰）              | 不要なリセットが発生しないこと   |
| TC-03    | 問題13   | templateモードでエラーが発生した状態                         | キャンセルボタンが DOM に存在する                         | `isTemplateMode && isError` 条件 |
| TC-04    | 問題13   | templateモードエラー後にキャンセルボタンを押す               | `onCancel`（または `onReset`）コールバックが呼び出される  | Step 0 遷移の確認                |
| TC-05    | 問題13   | 非templateモード（通常モード）のエラー状態                   | キャンセルボタンが表示されない（回帰）                    | 既存 UI への影響がないこと       |
| TC-06    | 問題18   | q5 の回答を変更する                                          | `resolveExternalIntegration` が再呼び出しされ最新値が返る | 再計算トリガーの確認             |
| TC-07    | 問題18   | q5 以外の質問（q1〜q4）の回答を変更する                      | `resolveExternalIntegration` が再呼び出しされない（回帰） | 不要な再計算が発生しないこと     |
| TC-08    | 問題19   | 生成処理をキャンセルする                                     | `generationLockRef.current` が `false` になる             | finally 節の実行確認             |
| TC-09    | 問題19   | キャンセル後に再度生成操作を行う                             | 生成が正常に開始できる（ロック残留なし）                  | 後続フローの疎通確認             |
| TC-10    | 問題19   | 生成処理が正常完了する                                       | `generationLockRef.current` が `false` になる（回帰）     | 正常終了パスの確認               |

---

## 7. リスクと対策

| リスク                                                          | 影響度 | 発生確率 | 対策                                                                                            |
| --------------------------------------------------------------- | ------ | -------- | ----------------------------------------------------------------------------------------------- |
| `useEffect` 依存配列への `answers` 追加が無限ループを引き起こす | 高     | 中       | `answers` の参照同一性・`JSON.stringify` 比較を用いた変化検知で回避。Phase 3 設計レビューで検証 |
| `generationLockRef` の finally 節修正で正常フローが破壊される   | 高     | 低       | 正常完了・エラー・キャンセルの全3経路でのテストケースを用意し、Phase 4 で fail-first 確認       |
| q5 再計算ロジックが他の回答変更でも発火して性能劣化する         | 中     | 中       | q5 のみを依存配列に含める設計を徹底。Phase 7 でカバレッジと不要発火のテストを確認               |
| Wave C の並列実行で `SkillCreateWizard.tsx` の変更が競合する    | 中     | 中       | Wave C 内の Phase 5 は `TASK-SW-FIX-UI-001` と順次適用。コンフリクト解消をレビューで確認        |
| templateモードキャンセルボタンが通常モードにも表示される        | 低     | 低       | `isTemplateMode && hasError` 条件の分岐を Phase 4 テストで検証                                  |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-wizard-bugfix-wave/WC-par-03a-fix-state-detail/index.md`（詳細仕様書インデックス）
- `docs/30-workflows/skill-wizard-bugfix-wave/WC-par-03a-fix-state-detail/phase-1-requirements.md`（要件定義）
- `docs/30-workflows/skill-wizard-bugfix-wave/WC-par-03a-fix-state-detail/phase-2-design.md`（設計書）
- `docs/30-workflows/skill-wizard-bugfix-wave/WC-par-03a-fix-state-detail/phase-5-implementation.md`（実装指針）
- `docs/30-workflows/skill-wizard-bugfix-wave/index.md`（バグ修正ウェーブ全体方針）

### 関連ファイル

- `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`（問題12の発生箇所）
- `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`（問題13の発生箇所）
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`（問題18・19の発生箇所）
- `packages/shared/src/types/skillCreator.ts`（型定義）

---

## 9. 備考

### 苦戦箇所

| 項目                         | 内容                                                                                                                                                                                                       |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| useEffect無限ループリスク    | `answers` prop を依存配列に追加すると、親コンポーネントが毎レンダリングで新しいオブジェクト参照を渡す場合に無限ループが発生する恐れがある。`useRef` でのメモ化か `JSON.stringify` 比較による変化検知が必要 |
| generationLockRef配置の設計  | finally 節のどこに `generationLockRef.current = false` を配置するかは、Promiseチェーンの分岐（正常・エラー・キャンセル）との関係で複雑。全経路を網羅できるよう先頭配置を推奨                               |
| q5変更検知のタイミング最適化 | `useEffect` の依存配列で q5 のみを監視する設計は、q5 の型構造が複雑な場合に参照比較が機能しないリスクがある。primitive 値での比較か個別フラグでのトリガーを選択する必要がある                              |
| Wave C 並列実行の競合        | `SkillCreateWizard.tsx` は `TASK-SW-FIX-UI-001` でも変更対象になる可能性があるため、Phase 5 の実装は順次適用とし、コンフリクト解消に時間を要する可能性がある                                               |

### 発見経緯

30種の思考法による多角的検証（2026-04-12）において、スキルウィザードの状態管理クラスター（B）に属する詳細バグとして問題12・13・18・19が特定された。Wave A・B の主要バグ修正後も残留する細粒度の問題であり、Wave C（TASK-SW-FIX-STATE-DETAIL-001）として独立タスク化した。

現時点では実害が顕在化していないケースもあるが（問題19は潜在的バグ）、ユーザー操作シナリオ上で高頻度で踏み得るパスであるため、Wave C で優先的に対応することを推奨する。
