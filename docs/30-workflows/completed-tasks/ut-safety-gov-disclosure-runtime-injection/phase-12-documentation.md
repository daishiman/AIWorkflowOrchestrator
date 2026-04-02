# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 12                                         |
| 機能名 | ut-safety-gov-disclosure-runtime-injection |
| 作成日 | 2026-04-02                                 |

## 目的

実装完了に伴い、関連する unassigned-task 仕様書のステータスを完了に更新し、
workflow local の `artifacts.json` / `outputs/artifacts.json` を同期する。
Phase 12 必須 6 成果物を current workflow 配下にそろえてドキュメントを最新化する。

## 実行タスク

- タスク1: unassigned-task 仕様書のステータス更新（2ファイル）
- タスク2: artifacts.json の更新
- タスク3: 実装ガイド作成（Part 1 + Part 2）【必須】
- タスク4: 未タスク検出【必須・0件でも出力】
- タスク5: スキルフィードバックレポート作成【必須】
- タスク6: Phase 12 準拠チェック作成【必須】

## 実行手順

### タスク1: unassigned-task 仕様書のステータス更新

#### 対象ファイル 1: UT-SAFETY-GOV-DISCLOSURE-RUNTIME-INJECTION-001.md

```bash
# ステータス確認
grep -n "ステータス\|status" \
  docs/30-workflows/completed-tasks/unassigned-task/UT-SAFETY-GOV-DISCLOSURE-RUNTIME-INJECTION-001.md
```

更新内容:

- ステータス: `未実施` → `完了`
- 完了日: `2026-04-02`（実施日を記載）
- 備考: 実装内容の要約を追記

#### 対象ファイル 2: UT-IMP-SAFETY-GOV-DISCLOSURE-TEST-001.md

```bash
# ファイル確認
ls docs/30-workflows/unassigned-task/ | grep DISCLOSURE-TEST
```

更新内容:

- ステータス: `未実施` → `完了`
- 完了日: `2026-04-02`（実施日を記載）
- 備考: `disclosureHandlers.test.ts` 新規作成完了を記載

### タスク2: artifacts.json の更新

```bash
# artifacts.json の場所を確認
ls docs/30-workflows/completed-tasks/ut-safety-gov-disclosure-runtime-injection/outputs/
```

各 Phase の完了ステータスを artifacts.json に更新する:

| Phase    | 更新項目                   | 更新値      |
| -------- | -------------------------- | ----------- |
| Phase 5  | 実装完了ステータス         | completed   |
| Phase 6  | テスト拡充完了ステータス   | completed   |
| Phase 7  | カバレッジ確認ステータス   | completed   |
| Phase 8  | リファクタリングステータス | completed   |
| Phase 9  | 品質保証ステータス         | completed   |
| Phase 10 | 最終レビューステータス     | completed   |
| Phase 11 | 手動テストステータス       | completed   |
| Phase 12 | ドキュメント更新ステータス | in-progress |

### タスク3: 実装ガイド作成

**出力先**: `outputs/phase-12/implementation-guide.md`

**Part 1（初学者向け）**:

- `## Part 1`
  - `### なぜ必要か` — ExecutionConsole の disclosure 情報が常に固定値だった問題
  - `### 何をするか` — `buildDisclosureInfo` が runtime の authMode から動的に aiServiceName を返す
  - `### 日常の例え` — 「たとえば:」必須（例: クレジットカードの明細書が「どのカード会社から」の情報を実際の契約内容から取得するように、disclosure 情報も実際の設定から取得する）
  - `### 今回作ったもの` — 概念一覧表

**Part 2（開発者向け）**:

- `## Part 2`
  - `### 型定義` — `DisclosureInfo` 型と `IAuthModeService` インターフェース
  - `### 使用例` — `buildDisclosureInfo(authModeServiceForRuntime)` の呼び出し例
  - `### エラーハンドリング` — `getDisclosureInfo` 例外時の DISCLOSURE_ERROR 応答
  - `### エッジケース` — authMode が null/undefined の場合の "unknown" fallback
  - `### 設定項目と定数一覧` — `DISCLOSURE_MODEL_NAME = "claude-sonnet-4-6"`
  - `### テスト構成` — `disclosureHandlers.test.ts` のテスト数と実測カバレッジ値

### タスク4: 未タスク検出

**出力先**: `outputs/phase-12/unassigned-task-detection.md`

確認ソース:

1. Phase 3 レビューの MINOR 指摘事項（`phase-3-design-review.md` の「指摘事項」セクション）
   - M-1: `modelName` のハードコードは将来的な設定反映が困難 → 別タスクとして記録
2. Phase 10 最終レビューの MINOR 指摘事項
3. Phase 11 `discovered-issues.md`
4. Phase 成果物の TODO/FIXME コメント
5. コードベースの TODO/FIXME コメント:

```bash
grep -rn "TODO\|FIXME" \
  apps/desktop/src/main/ipc/index.ts \
  apps/desktop/src/main/ipc/disclosureHandlers.ts \
  apps/desktop/src/main/ipc/__tests__/disclosureHandlers.test.ts
```

既知の未タスク候補:

| タスク候補                                      | 起因                   | 優先度 |
| ----------------------------------------------- | ---------------------- | ------ |
| `modelName` を LLM 設定から動的取得する         | Phase 3 MINOR 指摘 M-1 | 低     |
| `externalDestinations` の実際の送信先リスト収集 | Phase 1 スコープ外定義 | 低     |

### タスク5: スキルフィードバックレポート作成

**出力先**: `outputs/phase-12/skill-feedback-report.md`

改善点なしでも出力すること。

### タスク6: ドキュメント更新履歴・準拠チェックの作成

**出力先**: `outputs/phase-12/documentation-changelog.md`
および `outputs/phase-12/phase12-task-spec-compliance-check.md`

タスク1〜4の実行結果を記録する:

| タスク    | 更新ファイル                                                                                          | 更新内容                |
| --------- | ----------------------------------------------------------------------------------------------------- | ----------------------- |
| タスク1-1 | `docs/30-workflows/completed-tasks/unassigned-task/UT-SAFETY-GOV-DISCLOSURE-RUNTIME-INJECTION-001.md` | ステータス → 完了       |
| タスク1-2 | `docs/30-workflows/completed-tasks/unassigned-task/UT-IMP-SAFETY-GOV-DISCLOSURE-TEST-001.md`          | ステータス → 完了       |
| タスク2   | `outputs/*/artifacts.json`                                                                            | Phase完了ステータス更新 |
| タスク3   | `outputs/phase-12/implementation-guide.md`                                                            | 新規作成                |
| タスク4   | `outputs/phase-12/unassigned-task-detection.md`                                                       | 新規作成（0件でも出力） |
| タスク5   | `outputs/phase-12/skill-feedback-report.md`                                                           | 新規作成                |
| タスク6   | `outputs/phase-12/phase12-task-spec-compliance-check.md`                                              | 新規作成                |

## 参照資料

| 資料名                                     | パス                                                                                                  | 説明                       |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------- | -------------------------- |
| unassigned-task 仕様書 1                   | `docs/30-workflows/completed-tasks/unassigned-task/UT-SAFETY-GOV-DISCLOSURE-RUNTIME-INJECTION-001.md` | ステータス更新対象         |
| unassigned-task 仕様書 2                   | `docs/30-workflows/completed-tasks/unassigned-task/UT-IMP-SAFETY-GOV-DISCLOSURE-TEST-001.md`          | ステータス更新対象         |
| Phase 3 設計レビュー（MINOR指摘）          | `phase-3-design-review.md`                                                                            | 未タスク候補の参照元       |
| Phase 11 手動テスト証跡                    | `outputs/phase-11/`                                                                                   | 実装ガイド Part 2 の参照元 |
| task-specification-creator Phase 12 ガイド | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`                | 詳細手順                   |

## 統合テスト連携【必須】

| 判定項目                 | 基準 | 結果   |
| ------------------------ | ---- | ------ |
| ユニットテストLine       | 80%+ | 未計測 |
| ユニットテストBranch     | 60%+ | 未計測 |
| ユニットテストFunction   | 80%+ | 未計測 |
| 結合テストAPI            | 100% | 未計測 |
| 結合テストシナリオ正常系 | 100% | 未計測 |
| 結合テストシナリオ異常系 | 80%+ | 未計測 |

## 成果物

| 成果物               | パス                                                     | 説明                          |
| -------------------- | -------------------------------------------------------- | ----------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`               | Part 1/2（「たとえば:」必須） |
| 仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | system spec 更新判断          |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`            | 更新内容の記録                |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md`          | 0件でも出力                   |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`              | 改善点 or なし                |
| 準拠チェック         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 完了確認             |

## 完了条件

- [ ] `UT-SAFETY-GOV-DISCLOSURE-RUNTIME-INJECTION-001.md` のステータスが「完了」に更新されている
- [ ] `UT-IMP-SAFETY-GOV-DISCLOSURE-TEST-001.md` のステータスが「完了」に更新されている
- [ ] `artifacts.json` と `outputs/artifacts.json` が最新の Phase 完了ステータスに更新されている
- [ ] 実装ガイド（Part 1 + Part 2）が作成されている（「たとえば:」必須）
- [ ] 仕様更新サマリーが作成されている
- [ ] 未タスク検出レポートが出力されている（0件でも出力）
- [ ] スキルフィードバックレポートが作成されている
- [ ] 準拠チェックが作成されている
- [ ] ドキュメント更新履歴が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

| タスク                                                 | 状態 | 備考 |
| ------------------------------------------------------ | ---- | ---- |
| UT-SAFETY-GOV-DISCLOSURE-RUNTIME-INJECTION-001.md 更新 | -    | -    |
| UT-IMP-SAFETY-GOV-DISCLOSURE-TEST-001.md 更新          | -    | -    |
| artifacts.json / outputs/artifacts.json 更新           | -    | -    |
| 実装ガイド作成（Part 1 + Part 2）                      | -    | -    |
| 未タスク検出レポート作成                               | -    | -    |
| スキルフィードバックレポート作成                       | -    | -    |
| Phase 12 準拠チェック作成                              | -    | -    |
| ドキュメント更新履歴作成                               | -    | -    |

## 次のPhase

Phase 13: PR 作成 → [phase-13-pr-creation.md](phase-13-pr-creation.md)

**ゲート**: unassigned-task 仕様書の更新・artifacts.json 更新・実装ガイド作成が完了後にのみ Phase 13 へ進む。
