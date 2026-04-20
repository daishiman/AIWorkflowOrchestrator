# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 11                                    |
| タスクID   | TASK-SW-STRUCT-LLM-002                |
| 機能名     | skill-creator-features-llm-generation |
| 前提Phase  | Phase 10                              |
| 後続Phase  | Phase 12                              |
| 作成日     | 2026-04-18                            |
| ステータス | not_started                           |

## 目的

本タスクは `NON_VISUAL` close-out である。
`SkillCreatorService.ts` のバックエンドロジック変更であり、UI に直接影響しない。
Phase 11 の主目的は「UI 変更の見た目確認」ではなく、
LLM による features 自動生成が SKILL.md の featuresセクションに正しく反映されることを確認することにある。

**種別判定**: NON_VISUAL（バックエンドの LLM 統合）

**UIへの影響**: SKILL.md の features フィールドに内容が入るようになる（間接的）

一次証跡は Electron 実画面のスクリーンショットではなく、
`manual-test-result.md` / `manual-test-checklist.md` / `discovered-issues.md` /
`phase11-capture-metadata.json` を正本とする。

## 実行タスク

- `NON_VISUAL` 方針に基づき、Phase 11 証跡束の要件を確定する
- `SkillCreatorService.ts` の features 生成フローを current facts として cross-check する
- スキル作成フローを実行し、生成された SKILL.md の features セクションを確認する
- `manual-test-result.md` に source review / artifact review の実行結果を記録する
- `manual-test-checklist.md` / `discovered-issues.md` / `phase11-capture-metadata.json` が揃っていることを確認する
- Phase 12 実装ガイドが参照できる形で Phase 11 証跡を固定する

## 参照資料

| 資料名                | パス                                                          | 用途               |
| --------------------- | ------------------------------------------------------------- | ------------------ |
| Phase 2 設計          | `outputs/phase-2/requirements-analysis.md`                    | 観点の再確認       |
| Phase 5 実装          | `outputs/phase-5/implementation-summary.md`                   | current facts      |
| Phase 6 テスト拡充    | `outputs/phase-6/test-expansion-record.md`                    | 回帰観点確認       |
| Phase 7 カバレッジ    | `outputs/phase-7/coverage-report.md`                          | 品質根拠確認       |
| Phase 9 品質保証      | `outputs/phase-9/quality-report.md`                           | close-out 前提確認 |
| Phase 10 最終レビュー | `outputs/phase-10/final-review-result.md`                     | 判定根拠確認       |
| 実装コード            | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | current facts      |

## 実行手順

### 1. current facts 監査

```bash
rg -n "features" apps/desktop/src/main/services/skill/SkillCreatorService.ts
rg -n "generateSkillMd\|features" apps/desktop/src/main/services/skill/SkillCreatorService.ts
rg -n "features" apps/desktop/src/main/services/skill/
```

### 2. 手動確認手順

1. アプリを起動する

   ```bash
   pnpm --filter @repo/desktop dev
   ```

2. スキル作成フローを実行する

3. 生成された SKILL.md の featuresセクションを確認する

4. features 一覧が LLM によって自動生成されていることを確認する

5. features 生成が失敗するケースでは空配列でフォールバックされることを確認する

### 3. SKILL.md 生成結果確認

確認対象の SKILL.md に以下のセクションが存在し、LLM が生成した文字列配列が含まれていることを確認する:

```yaml
features:
  - [LLMが生成した機能説明1]
  - [LLMが生成した機能説明2]
  - ...
```

### 4. 判定ルール

| 観点           | 期待する状態                                                       | 結果   |
| -------------- | ------------------------------------------------------------------ | ------ |
| features 生成  | `runCreateWorkflow()` 実行後に features が空でない文字列配列になる | 確認要 |
| SKILL.md 反映  | 生成された features が SKILL.md の featuresセクションに記録される  | 確認要 |
| フォールバック | LLM 失敗時に `features: []` で処理が継続される                     | 確認要 |
| 回帰確認       | 既存の create/update ワークフローが正常に動作する                  | 確認要 |
| 視覚証跡       | `NON_VISUAL` のため screenshot 不要と明記されている                | 確認要 |
| 未解決課題     | 発見事項が `discovered-issues.md` へ引き継がれる                   | 確認要 |

### 5. Phase 11 証跡束の確認

```bash
find outputs/phase-11 -maxdepth 2 -type f | sort
```

確認対象:

- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/manual-test-checklist.md`
- `outputs/phase-11/discovered-issues.md`
- `outputs/phase-11/phase11-capture-metadata.json`

## 統合テスト連携

| 判定項目                 | 基準                                | 結果   |
| ------------------------ | ----------------------------------- | ------ |
| features 生成フロー監査  | source review で current facts 一致 | 確認要 |
| Phase 11 証跡束確認      | 補助成果物 4 点が存在する           | 確認要 |
| `NON_VISUAL` 判定確認    | screenshot 不要が明記済み           | 確認要 |
| 既存ワークフロー回帰確認 | create/update 両フロー正常動作      | 確認要 |

## 多角的チェック観点（AIが判断）

| 観点           | チェック内容                                                                      |
| -------------- | --------------------------------------------------------------------------------- |
| AC-4 充足      | close-out 証跡束が current facts と矛盾せず固定されているか                       |
| LLM 統合品質   | features の内容がスキルの目的に沿った適切な説明文になっているか                   |
| フォールバック | エラー時の空配列フォールバックが実際に機能することを確認できているか              |
| 証跡整合       | manual-test / checklist / metadata / discovered-issues が同じ方針で書かれているか |
| 回帰安全性     | 既存ワークフローへの影響がないことが証拠をもって確認されているか                  |

## サブタスク管理

1. current facts 監査（features 生成フローの確認）
2. アプリ起動・スキル作成フロー実行
3. SKILL.md features セクションの確認
4. フォールバック動作の確認
5. 補助成果物確認
6. manual-test-result 記録確認
7. discovered issues 引継ぎ確認
8. Phase 12 参照可能状態の固定

## 成果物

| 成果物                   | パス                                             | 説明                      |
| ------------------------ | ------------------------------------------------ | ------------------------- |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`         | 監査結果の主記録          |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md`      | 証跡項目チェック          |
| 発見事項                 | `outputs/phase-11/discovered-issues.md`          | 発見事項と引継ぎ先        |
| 取得メタデータ           | `outputs/phase-11/phase11-capture-metadata.json` | NON_VISUAL 証跡メタデータ |

## 完了条件

- [ ] features 生成フロー（current code）を確認済み
- [ ] スキル作成フローを実行し SKILL.md の features セクションを確認済み
- [ ] フォールバック動作（features: []）を確認済み
- [ ] 既存の create/update ワークフローの回帰なしを確認済み
- [ ] Phase 11 証跡束 4 点を確認済み
- [ ] `NON_VISUAL` 方針と screenshot 不要の理由を記録済み
- [ ] 手動テスト結果が `outputs/phase-11/manual-test-result.md` に記録されている
- [ ] 本 Phase 内の全タスクを100%実行完了した

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 12: ドキュメント更新
