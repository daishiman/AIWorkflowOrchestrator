# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 11                                             |
| タスクID   | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 |
| 機能名     | スマートデフォルト推論サービス実装             |
| 前提Phase  | Phase 10                                       |
| 後続Phase  | Phase 12                                       |
| 作成日     | 2026-04-08                                     |
| ステータス | completed                                      |

## 目的

REPL / Vitest UI を主証跡としてスマートデフォルト推論の動作を手動確認し、
自動テストでは検出できない問題を発見する。

> **分類**: 本タスクは `NON_VISUAL` として扱う。証跡の主ソースは REPL / Vitest の実行結果に置く。
> W2-seq-03a（SkillCreateWizard 統合）完了後のみ UI 画面の補助確認を追加する。

## Phase 11 手動テスト方針（NON_VISUAL）

- `manual-test-checklist.md` を必ず作成する
- `discovered-issues.md` を必ず作成する
- `screenshot-plan.json` は生成しない
- primary evidence は `vitest` / `typecheck` / `lint` / REPL 確認記録
- `manual-test-result.md` には `TC-ID ↔ evidence`、NON_VISUAL である理由、代替 evidence を明記する
- placeholder-only の証跡は PASS 扱いにしない

## 実行タスク

1. REPL / Vitest UI で inferSmartDefaults の入出力を確認する。
2. W2-seq-03a が存在する場合のみ統合後の UI 動作を確認する。
3. フォールバックと inferenceLog を目視確認する。

## 統合テスト連携

- Phase 4 / 6 のテスト結果を手動確認の前提にする。
- NON_VISUAL のためスクリーンショットは不要。証跡は REPL / CLI 出力で残す。

## 手動テストシナリオ

### シナリオ 1: 推論サービスの REPL 動作確認（統合前）

W2-seq-03a が完了していない場合、以下で推論サービスを直接動作確認する。

```bash
# Vitest UI で推論結果を確認
pnpm --filter @repo/shared test:run --ui

# または pnpm --filter @repo/shared test:run で全件 PASS を確認
pnpm --filter @repo/shared test:run -- src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts
```

### シナリオ 2: inferenceLog の確認

```bash
# テスト出力で inferenceLog を確認
pnpm --filter @repo/shared test:run -- src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts --reporter=verbose
```

### シナリオ 3: フォールバック動作確認

全フィールドが null になるケースが正しく動作するかを確認する。
TC-12（全フィールド null）のテスト結果を証跡として使用する。

## 手動テストチェックリスト

| TC-ID | シナリオ                             | 確認方法        | 判定 |
| ----- | ------------------------------------ | --------------- | ---- |
| MT-01 | Slack 推論: tool = 'slack'           | vitest 出力確認 | [ ]  |
| MT-02 | 毎日タイミング: timing = 'scheduled' | vitest 出力確認 | [ ]  |
| MT-03 | code-support: format = 'code'        | vitest 出力確認 | [ ]  |
| MT-04 | 全フォールバック: inferenceLog = []  | vitest 出力確認 | [ ]  |
| MT-05 | inferenceLog に推論根拠が記録される  | vitest 出力確認 | [ ]  |

## 参照資料

| 資料名                     | パス                                              | 用途            |
| -------------------------- | ------------------------------------------------- | --------------- |
| リリース準備チェックリスト | `outputs/phase-10/release-readiness-checklist.md` | Phase 10 成果物 |
| テスト仕様書               | `outputs/phase-4/test-specification.md`           | Phase 4 成果物  |

## 実行手順

1. Phase 10 のリリース準備チェックリストを確認する。
2. シナリオ 1〜3 の手動確認を実施する。
3. 手動テストチェックリスト（MT-01〜MT-05）を評価する。
4. 発見事項があれば `discovered-issues.md` に記録する。

## 成果物

| 成果物                   | パス                                        | 説明                       |
| ------------------------ | ------------------------------------------- | -------------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | MT-01〜MT-05 確認リスト    |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | TC-ID ↔ evidence 対応記録  |
| 発見事項                 | `outputs/phase-11/discovered-issues.md`     | スコープ外の発見・改善提案 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] `manual-test-checklist.md` が作成されていること
- [ ] `manual-test-result.md` に NON_VISUAL である理由が明記されていること
- [ ] `discovered-issues.md` が作成されていること（0件でも出力必須）
- [ ] MT-01〜MT-05 の全確認が完了していること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 12: ドキュメント更新
