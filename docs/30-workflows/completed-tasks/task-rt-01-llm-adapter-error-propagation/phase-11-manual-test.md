# Phase 11: 手動テスト検証 - LLMAdapter 初期化エラー UI 通知・状態公開

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase      | 11 - 手動テスト検証                                      |
| タスク種別 | UI task                                                  |
| 機能名     | task-rt-01-llm-adapter-error-propagation                 |
| 作成日     | 2026-04-04                                               |
| 前Phase    | [Phase 10: 最終レビューゲート](phase-10-final-review.md) |

## 目的

Renderer UI（`SkillLifecyclePanel`）上で、LLMAdapter 初期化失敗時にエラーバナーが適切に表示され、
ユーザー導線（任意の「設定を開く」ボタン）と視覚品質（light/dark 含む）が破綻していないことを確認する。

本 Phase は UI task のため、テストケース単位でスクリーンショット証跡（`.png`）を残し、
`validate-phase11-screenshot-coverage.js` による機械検証で「漏れなし」を担保する。

## テスト方式（判定モード）

Phase 11 のテストケース（TC）は、証跡の性質で以下の 2 モードを持つ。

| モード       | 意味                                     | UI task の扱い                                                            |
| ------------ | ---------------------------------------- | ------------------------------------------------------------------------- |
| `SCREENSHOT` | `.png` による視覚証跡を残す              | 原則必須（本タスクは UI task）                                            |
| `NON_VISUAL` | 視覚証跡が不要、または環境制約で取得不能 | 例外。必ず根拠を `manual-test-result.md` に記録し、許容した TC を明示する |

本タスクでは、**全 TC を `SCREENSHOT` で実施**する（例外運用をしない）。

## 参照資料

| 資料名         | パス                 | 用途     |
| -------------- | -------------------- | -------- |
| Phase 2 設計書 | `phase-02-design.md` | 設計確認 |
| Phase 5 成果物 | `outputs/phase-5/`   | 実装参照 |

## 実行タスク

1. **環境準備**: 事前条件（API key 設定/未設定）を用意する
2. **テストケース実行**: `## テストケース` の TC を順に実行する
3. **リアルタイム記録**: 発見事項をその場で分類テーブルへ追記する（後回しにしない）
4. **証跡収集**: TC-ID と 1:1 で `outputs/phase-11/screenshots/*.png` を保存する
5. **検証コマンド実行**: `validate-phase11-screenshot-coverage.js` を PASS させる
6. **成果物作成**: `manual-test-*.md` / `*.json` を outputs に作成し、Phase 12 へ引き継ぐ

## 前提条件・環境

### テスト対象 UI

- 画面: `SkillLifecyclePanel`（アダプタエラー通知バナー）
- 観点: 表示/非表示、メッセージ妥当性、任意ボタン導線、light/dark 視認性、既存 UI への影響

### 実行環境（例）

`phase11-capture-metadata.json` に以下を記録する（例: 手入力でも可）。

- `capturedAt`（ISO8601）
- `os`（例: macOS 14.x / Windows 11）
- `node`（`node -v`）
- `pnpm`（`pnpm -v`）
- `appMode`（dev / prod）
- `theme`（light / dark）
- `notes`（再現条件や制約）

### 起動（例）

```bash
pnpm --filter @repo/desktop dev
```

## ウォークスルーシナリオ発見事項リアルタイム分類欄

各シナリオ実行中に発見した事項を即座に分類するための欄。

| #   | シナリオ | 発見事項 | 分類                  | 対応方針 |
| --- | -------- | -------- | --------------------- | -------- |
| 1   | TC-11-01 | -        | Blocker / Note / Info | -        |

分類基準:

- **Blocker**: Phase 12 完了前に修正必須（仕様整合性、参照断絶、致命的 UX 破綻）
- **Note**: 改善推奨だが Phase 12 をブロックしない
- **Info**: 記録のみ

## テストケース

注意:

- **TC-ID とスクリーンショット（PNG）は 1:1 で対応**させる
- 画像は `outputs/phase-11/screenshots/` に保存し、ファイル名は TC-ID と一致させる（例: `TC-11-01.png`）
- `manual-test-result.md` には、下記のように **`TC-ID` 列 + `証跡` 列**を持つ表を作り、証跡に `.png` 参照を書き込む
  - 例: `screenshots/TC-11-01.png`

| TC-ID    | シナリオ                      | 事前条件                                           | 操作手順（要点）             | 期待結果                                           | 証跡（PNG 1:1）            |
| -------- | ----------------------------- | -------------------------------------------------- | ---------------------------- | -------------------------------------------------- | -------------------------- |
| TC-11-01 | 有効な API key でバナー非表示 | API key: 有効                                      | `SkillLifecyclePanel` を開く | エラーバナーが表示されない                         | `screenshots/TC-11-01.png` |
| TC-11-02 | API key 未設定でバナー表示    | API key: 未設定/空                                 | `SkillLifecyclePanel` を開く | バナーが表示され、API key 系メッセージが表示される | `screenshots/TC-11-02.png` |
| TC-11-03 | 汎用 failureReason 文言       | failureReason: API key 以外（例: network timeout） | `SkillLifecyclePanel` を開く | 汎用メッセージが表示される                         | `screenshots/TC-11-03.png` |
| TC-11-04 | 任意ボタン導線（設定を開く）  | `onOpenWizard` が有効（ボタンが表示される構成）    | バナーの「設定を開く」を押下 | Wizard/設定導線が開く（または遷移する）            | `screenshots/TC-11-04.png` |
| TC-11-05 | light theme の視認性          | theme: light / status: failed                      | TC-11-02 と同条件で確認      | コントラスト、文字可読性、余白が破綻しない         | `screenshots/TC-11-05.png` |
| TC-11-06 | dark theme の視認性           | theme: dark / status: failed                       | theme を dark にして確認     | コントラスト、文字可読性、余白が破綻しない         | `screenshots/TC-11-06.png` |

補足:

- TC-11-03 の再現が難しい場合は、`manual-test-result.md` に「再現手段（設定/故障注入/ログ）」を明記すること
- TC-11-04 でボタンが表示されない場合は Blocker ではなく Info として記録し、構成上の理由を `ui-sanity-visual-review.md` に書く

## 画面カバレッジマトリクス

目的: 「どの UI 状態を、どの証跡でカバーしたか」を人間レビューでも追えるようにする。

| TC-ID    | 画面/コンポーネント                         | 状態              | Theme | 証跡（PNG）                | 備考                      |
| -------- | ------------------------------------------- | ----------------- | ----- | -------------------------- | ------------------------- |
| TC-11-01 | SkillLifecyclePanel / LLMAdapterErrorBanner | ready（非表示）   | light | `screenshots/TC-11-01.png` | バナーが無いことの証跡    |
| TC-11-02 | SkillLifecyclePanel / LLMAdapterErrorBanner | failed（API key） | light | `screenshots/TC-11-02.png` | API key 文言              |
| TC-11-03 | SkillLifecyclePanel / LLMAdapterErrorBanner | failed（generic） | light | `screenshots/TC-11-03.png` | network 等                |
| TC-11-04 | SkillLifecyclePanel / LLMAdapterErrorBanner | failed + action   | light | `screenshots/TC-11-04.png` | 「設定を開く」導線        |
| TC-11-05 | SkillLifecyclePanel / LLMAdapterErrorBanner | failed（API key） | light | `screenshots/TC-11-05.png` | Apple UI/UX 観点（light） |
| TC-11-06 | SkillLifecyclePanel / LLMAdapterErrorBanner | failed（API key） | dark  | `screenshots/TC-11-06.png` | Apple UI/UX 観点（dark）  |

任意の supplemental capture（例: initializing の瞬間）を残す場合は、`screenshots/SUP-01.png` のように保存してよい。
ただし、`validate-phase11-screenshot-coverage.js` の対象に含めないため、**本マトリクスには載せない**（載せると未撮影時に FAIL する）。

## Apple UI/UX 視覚レビュー観点（チェックリスト）

`ui-sanity-visual-review.md` に所見として記録する（TC とは別の総評）。

- hierarchy が明確か（視線誘導、見出し、情報の優先順位）
- 主要アクションが一目で分かるか（「設定を開く」ボタンなど）
- contrast が十分か（light/dark それぞれ）
- whitespace と grouping が自然か
- error state が他の UI を破壊していないか（押し出し/重なり/はみ出し）
- keyboard focus が視覚的に追えるか（ボタンフォーカス等）

## 成果物

UI task の Phase 11 では、以下を `outputs/phase-11/` に作成する。

| 成果物                                     | パス                                             |
| ------------------------------------------ | ------------------------------------------------ |
| walkthrough 結果（TC 単位の結果 + 証跡表） | `outputs/phase-11/manual-test-result.md`         |
| 実施概要と所見                             | `outputs/phase-11/manual-test-report.md`         |
| Blocker/Note 一覧                          | `outputs/phase-11/discovered-issues.md`          |
| 視覚レビュー（Apple UI/UX）                | `outputs/phase-11/ui-sanity-visual-review.md`    |
| capture 実行の evidence inventory          | `outputs/phase-11/phase11-capture-metadata.json` |
| 撮影計画（TC-ID ↔ PNG の計画）             | `outputs/phase-11/screenshot-plan.json`          |
| カバレッジ要約（本仕様の matrix と整合）   | `outputs/phase-11/screenshot-coverage.md`        |
| 実施チェックリスト                         | `outputs/phase-11/manual-test-checklist.md`      |
| スクリーンショット                         | `outputs/phase-11/screenshots/*.png`             |

## 検証コマンド（必須）

TC 単位の証跡漏れがないことを機械検証する。

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/task-rt-01-llm-adapter-error-propagation
```

## 完了条件

- [ ] `outputs/phase-11/` に必須成果物が全て存在する
- [ ] `outputs/phase-11/screenshots/` に `.png` が存在し、TC と 1:1 で対応している
- [ ] `validate-phase11-screenshot-coverage.js` が **exit code 0（PASS）** である
- [ ] `discovered-issues.md` に Blocker/Note/Info が整理されている
- [ ] light/dark の双方で視覚破綻がない（`ui-sanity-visual-review.md` に記録）

## タスク100%実行確認【必須】

- [ ] 上記「完了条件」を全て達成した
- [ ] 成果物を `outputs/phase-11/` に配置した
- [ ] `artifacts.json` の Phase 11 を `completed` に更新した

## 統合テスト連携

本 Phase のテスト成果物は後続 Phase の品質確認・ゲート判定に使用される。

| Phase   | 連携内容                                  |
| ------- | ----------------------------------------- |
| Phase 5 | テスト GREEN を確認してから実装完了とする |
| Phase 9 | 品質保証フェーズで最終確認する            |

## 次Phase

Phase 11 完了後 → [Phase 12: ドキュメント更新](phase-12-documentation.md) へ進む
