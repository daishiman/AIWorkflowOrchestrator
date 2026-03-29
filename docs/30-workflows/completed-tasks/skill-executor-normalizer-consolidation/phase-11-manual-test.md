# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目      | 内容       |
| --------- | ---------- |
| Phase     | 11         |
| Phase名   | 手動テスト |
| カテゴリ  | 検証       |
| 前提Phase | Phase 10   |
| 後続Phase | Phase 12   |

## 目的

リファクタリング後のスキル実行・SDK メッセージ変換が、画面証跡なしでも current facts として追跡できることを NON_VISUAL walkthrough で確認する。

## タスク分類判定

- [x] 非表示変更タスク（リファクタリング、インターフェース不変）
- [ ] 表示変更タスク
- [ ] docs-only タスク

本タスクはインターフェース不変のリファクタリングであり、表示変更を伴わないため **NON_VISUAL** 判定とする。確認結果は `manual-test-checklist.md` と `manual-test-result.md` に記録する。

## テスト方式

| 項目       | 方針                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| テスト種別 | NON_VISUAL manual walkthrough                                               |
| 主要確認面 | SkillExecutor lane / skill-creator lane / validator 再実行性                |
| 画像証跡   | 不要（NON_VISUAL）                                                          |
| 補助成果物 | `manual-test-checklist.md`, `manual-test-result.md`, `screenshot-plan.json` |

## 実行タスク

- タスク1で SkillExecutor 経由の実行を確認する
- タスク2で skill-creator lane の正規化動作を確認する
- checklist と result の 2 成果物へ NON_VISUAL 判定を残す

### タスク1: スキル実行の動作確認

**目的**: SkillExecutor 経由のスキル実行が正常に動作することを確認する

**手順**:

1. `SkillExecutor.ts` の `convertToStreamMessage()` 実装を walkthrough する
2. targeted test の期待ケース（text / tool_use / error）を確認する
3. helper 抽出後も lane 固有の分岐が維持されていることを確認する
4. 手動 walkthrough 結果を `manual-test-result.md` に記録する

**確認項目**:

| 確認項目          | 期待動作                                                  | 結果 |
| ----------------- | --------------------------------------------------------- | ---- |
| helper 利用       | `asSdkMessageRecord()` / `getSdkMessageType()` を利用する | TBD  |
| lane 固有分岐維持 | text / tool_use / error の変換責務が維持される            | TBD  |
| 異常入力の扱い    | 非 object / 未知 type で null を返して skip できる        | TBD  |

### タスク2: skill-creator lane の動作確認

**目的**: sdkMessageNormalizer 経由の skill-creator 実行が正常に動作することを確認する

**手順**:

1. `sdkMessageNormalizer.ts` の `normalizeSdkMessage()` / `normalizeSdkStream()` を walkthrough する
2. helper 抽出後も `system` / `assistant` / `result` 分岐が維持されていることを確認する
3. sessionId 伝播のテスト観点を `manual-test-result.md` に記録する

**確認項目**:

| 確認項目         | 期待動作                                                  | 結果 |
| ---------------- | --------------------------------------------------------- | ---- |
| helper 利用      | `asSdkMessageRecord()` / `getSdkMessageType()` を利用する | TBD  |
| メッセージ正規化 | `SkillCreatorSdkEvent` 変換責務が維持される               | TBD  |
| セッション管理   | `normalizeSdkStream()` で sessionId が正しく伝播する      | TBD  |

## テストケース

| テストケース | シナリオ                       | 期待結果                                                                                                                | 記録先                                   |
| ------------ | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| TC-11-01     | SkillExecutor lane walkthrough | helper 抽出後も `SkillStreamMessage` 変換責務が維持される                                                               | `outputs/phase-11/manual-test-result.md` |
| TC-11-02     | skill-creator lane walkthrough | helper 抽出後も `SkillCreatorSdkEvent` 変換と sessionId 伝播が維持される                                                | `outputs/phase-11/manual-test-result.md` |
| TC-11-03     | validator / 品質ゲート replay  | `validate-phase-output` / `verify-all-specs` / `typecheck` / `lint` / `vitest` 再現結果または環境ブロッカーが記録される | `outputs/phase-11/manual-test-result.md` |

## 導線確認マトリクス

| テストケース | 導線                   | 証跡方針   | 理由                                             |
| ------------ | ---------------------- | ---------- | ------------------------------------------------ |
| TC-11-01     | Skill 実行ストリーム   | NON_VISUAL | 表示差分ではなく stream 契約の回帰確認が主目的   |
| TC-11-02     | Skill Creator 実行導線 | NON_VISUAL | renderer contract 不変、session 伝播確認が主目的 |
| TC-11-03     | validator 再実行       | NON_VISUAL | CLI 再現性確認であり追加画像を要しない           |

## 統合テスト連携

インターフェース不変のリファクタリングのため、統合テストの新規追加は不要。Phase 11 では walkthrough と targeted command replay を手動確認として扱う。

## 参照資料

| 参照資料          | パス                               | 内容             |
| ----------------- | ---------------------------------- | ---------------- |
| Phase 10 レビュー | `outputs/phase-10/final-review.md` | 最終レビュー結果 |

## 補助成果物

| 成果物                   | パス                                        | 用途                                   |
| ------------------------ | ------------------------------------------- | -------------------------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | TC-11-01〜03 の実施有無を記録          |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | walkthrough 結果と blocker/note を記録 |
| 証跡計画                 | `outputs/phase-11/screenshot-plan.json`     | NON_VISUAL 判定と補助成果物要件を記録  |

## 成果物

| 成果物                   | パス                                        |
| ------------------------ | ------------------------------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    |
| 証跡計画                 | `outputs/phase-11/screenshot-plan.json`     |

## 完了条件

- [ ] スキル実行の動作が正常であることを手動確認済み
- [ ] skill-creator lane の動作が正常であることを手動確認済み
- [ ] NON_VISUAL 判定が記録されていること
- [ ] `manual-test-checklist.md` と `manual-test-result.md` に NON_VISUAL 根拠が記録されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] タスク1: スキル実行の動作確認 → 完了
- [ ] タスク2: skill-creator lane の動作確認 → 完了

## 次Phase

Phase 12（ドキュメント更新）へ進む。
