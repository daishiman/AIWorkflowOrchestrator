# Phase 11: 手動テスト

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| Phase        | 11                                 |
| タスクID     | TASK-FIX-LIFECYCLE-PANEL-ERROR-001 |
| ステータス   | 未実施                             |
| 担当         | 実装者                             |
| 見積もり時間 | 0.5h                               |

## 目的

Electron アプリ上でスキル生成失敗時にエラーメッセージが消えずに表示されたままになることを確認する。環境要因で Electron 起動ができない場合は、ブロッカーを明示したうえで `NON_VISUAL` 証跡として「実行したコマンド」「失敗内容」「代替で確認した事実」を記録する（AC-5 の実測可否を偽装しない）。

## NON_VISUAL 宣言

**本 Phase は NON_VISUAL task である。**

理由: 本タスクは `SkillLifecyclePanel.tsx` のロジック変更（snapshot 取り込み時の条件分岐共通化）であり、表示構造・レイアウト・スタイルの変更を含まない。視覚差分ではなく、`handoff` 時に error を保持する state 遷移と `handoffBundle` 独立性の確認が主眼である。

## 実行タスク

1. Electron アプリのビルドと起動
2. シナリオ 1: スキル生成失敗時にエラーが表示されたまま残ること
3. シナリオ 2: スキル生成成功時にエラーがクリアされること（既存動作維持）
4. 確認結果を `manual-test-result.md` に記録する
5. Electron 起動や `vitest` 実行が環境要因で失敗した場合は、実行コマンドとエラーメッセージを blocker として記録する

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容           |
| ------------------ | ---------------------------------------------------------------------------- | -------------- |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | システム全体像 |

## 統合テスト連携

- 前 Phase の成果物を確認したうえで、`SkillLifecyclePanel.tsx` と `SkillLifecyclePanel.error-persistence.test.tsx` の入力・出力の対応を崩さない。
- `currentPhase` 判定と `handoffBundle` 処理が独立していることを次 Phase に引き継ぐ。
- Phase 2 の成果物 design-topology.md、Phase 5 の修正結果、Phase 6 の拡張テスト結果、Phase 7 のカバレッジ確認結果、Phase 8 の refactoring-notes.md、Phase 9 の qa-report.md、Phase 10 の final-review-result.md を前提に手動確認する。

## 実行手順

### ステップ 1: Electron アプリのビルドと起動

```bash
# desktop パッケージのビルド
pnpm --filter @repo/desktop build

# 開発モードで起動（DevTools 有効）
pnpm --filter @repo/desktop dev
```

### ステップ 2: シナリオ 1 — スキル生成失敗時にエラーが表示されたまま残ること

**事前条件**: Electron アプリが起動し、DevTools が開いている状態

**確認手順**:

1. DevTools の Console タブを開く
2. `SkillLifecyclePanel` がマウントされる導線へ移動する
3. スキル生成を開始し、意図的に失敗させる（無効な設定・ネットワーク切断等）
4. `WORKFLOW_STATE_CHANGED` イベントで `currentPhase: 'handoff'` が届くことを Console で確認する
5. error state が維持されていることを確認する
6. DevTools Console に `setWorkflowError(null)` が `currentPhase: 'handoff'` 受信後に呼ばれていないことを確認する
7. 実施不能なら、実行不能理由を `manual-test-result.md` に記録し、自動テスト結果の転記だけで PASS 判定しない

**期待結果**:

| 確認項目                                                           | 期待値                     | 実際の結果 |
| ------------------------------------------------------------------ | -------------------------- | ---------- |
| `currentPhase: 'handoff'` の `WORKFLOW_STATE_CHANGED` イベント受信 | 受信される                 | TBD        |
| error state の保持                                                 | 維持される（消えない）     | TBD        |
| 修正前の動作（バグ）                                               | エラーが即座に消えてしまう | 参考       |
| 修正後の動作（正しい動作）                                         | エラーが表示されたまま残る | TBD        |

### ステップ 3: シナリオ 2 — スキル生成成功時にエラーがクリアされること（既存動作維持）

**確認手順**:

1. スキル生成を正常に実行する
2. `WORKFLOW_STATE_CHANGED` イベントで `currentPhase: 'execute'` / `currentPhase: 'verify'` が届くことを確認する
3. 前の失敗から残っている error state がクリアされることを確認する

**期待結果**:

| 確認項目                                     | 期待値                 | 実際の結果 |
| -------------------------------------------- | ---------------------- | ---------- |
| `currentPhase: 'execute'` 受信時のエラー表示 | エラーがクリアされる   | TBD        |
| `currentPhase: 'verify'` 受信時のエラー表示  | エラーがクリアされる   | TBD        |
| `handoffBundle` の処理                       | 変わらず正常に動作する | TBD        |

### ステップ 4: 確認結果の記録

全シナリオの実際の結果を `outputs/phase-11/manual-test-result.md` に記録する:

- NON_VISUAL である理由
- 各シナリオの確認項目と実際の結果
- 実行したコマンドと blocker の有無
- エビデンス（DevTools コンソールの出力テキスト、または環境ブロッカーのエラーメッセージ）
- 代替で確認した事実（コードレビュー、追加テスト、静的検証）
- 未解決の問題（あれば）

## 多角的チェック観点

- シナリオ 1 で `setWorkflowError(null)` が呼ばれず error state が維持されることを確認したか
- シナリオ 2 で「既存動作維持」として正常フローでエラーがクリアされることを確認したか
- `WORKFLOW_STATE_CHANGED` イベントが届く状態（TASK-FIX-EXECUTE-PLAN-FF-001 の完了）を前提として確認しているか

## 成果物

| 成果物         | パス                                     | 説明                                                        |
| -------------- | ---------------------------------------- | ----------------------------------------------------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | NON_VISUAL 宣言、各シナリオの実際の結果、blocker/エビデンス |

## 完了条件

- [ ] シナリオ 1: スキル生成失敗時に error state が維持されることが確認されている
- [ ] シナリオ 2: スキル生成成功フローでエラーがクリアされることが確認されている（既存動作維持）
- [ ] `manual-test-result.md` に NON_VISUAL 理由が明記されている
- [ ] 全シナリオの実際の結果が記録されている
- [ ] AC-5 が PASS として記録されている

## タスク100%実行確認【必須】

- [ ] 全実行タスクが完了している
- [ ] 全成果物が存在する（`outputs/phase-11/manual-test-result.md`）
- [ ] 全完了条件が満たされている

## 次Phase

Phase 12: ドキュメント更新 へ進む
