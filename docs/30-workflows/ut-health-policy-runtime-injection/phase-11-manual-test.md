# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 11                                 |
| 機能名 | ut-health-policy-runtime-injection |
| 作成日 | 2026-04-07                         |

## 目的

デスクトップアプリを実際に起動し、`RuntimeSkillCreatorFacade` 経由のスキル実行フローが
正常に動作することを手動で確認する。本タスクは Main Process の DI 変更のみであるため、
UI 上の見た目変化はないが、エラーなく動作することを確認する。

## テスト方式

- 本タスクは UI/UX 変更なしの `NON_VISUAL` 扱いとする
- スクリーンショット計画は作成しない
- 代わりに、起動ログ・実行結果・非視覚レビューを `manual-test-report.md` / `ui-sanity-visual-review.md` に記録する
- `phase11-capture-metadata.json` には `captureMode: "NON_VISUAL"` と理由を残す

---

## 実行タスク

- **タスク1**: デスクトップアプリのビルド・起動
- **タスク2**: スキル実行フローの動作確認（plan 実行）
- **タスク3**: エラーログの確認（healthPolicy DI 関連のエラーがないこと）
- **タスク4**: 手動テスト結果・所見・非視覚レビューの記録

---

## 参照資料

| 資料名                    | パス                                      | 説明           |
| ------------------------- | ----------------------------------------- | -------------- |
| Phase 10 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | PASS 判定確認  |
| Phase 1 受入基準          | `outputs/phase-1/acceptance-criteria.md`  | 手動テスト観点 |

---

## 実行手順

### ステップ1: デスクトップアプリのビルド・起動

```bash
# デスクトップアプリのビルド
pnpm --filter @repo/desktop build

# 開発モードで起動（ログ確認のため）
pnpm --filter @repo/desktop dev
```

### ステップ2: スキル実行フローの動作確認

**確認シナリオ**:

| シナリオ                   | 手順                                 | 期待結果                           |
| -------------------------- | ------------------------------------ | ---------------------------------- |
| アプリ起動時のエラーなし   | アプリを起動し、コンソールログを確認 | `healthPolicy` DI エラーなし       |
| スキル plan 実行           | Skill Creator の Plan 機能を実行     | 正常に plan が生成される           |
| API Key 設定状態での動作   | API Key を設定した状態でスキルを実行 | 正常に実行される                   |
| API Key 未設定状態での動作 | API Key を未設定の状態でスキルを実行 | 適切なエラーメッセージが表示される |

### ステップ3: エラーログの確認

起動後のコンソールで以下を確認:

```bash
# 起動ログに healthPolicy DI 関連のエラーがないことを確認
# 特に以下のエラーが発生していないことを確認:
# - "Cannot read properties of undefined (reading 'isDegraded')"
# - "healthPolicy is not defined"
# - TypeError 関連のエラー
```

**確認ポイント**:

- [ ] アプリ起動時にクラッシュしないこと
- [ ] `RuntimeSkillCreatorFacade` の初期化時にエラーが発生しないこと
- [ ] `resolveHealthPolicy` の初期入力（`lastHealthCheck: null` を含む）が正常に動作すること
      （`healthStatus: "unknown"`, `isDegraded: false` として動作）

### ステップ4: 手動統合テスト（非視覚 / API接続確認）

| 確認項目                              | 結果 |
| ------------------------------------- | ---- |
| デスクトップアプリが正常に起動する    | TBD  |
| Skill Creator の Plan 機能が実行可能  | TBD  |
| `healthPolicy` 関連のエラーログがない | TBD  |
| 既存の Skill 実行フローに変化がない   | TBD  |

**記録条件**:

- `manual-test-result.md`: 実行結果と判定
- `manual-test-report.md`: 手動テストの要約と所見
- `discovered-issues.md`: 発見課題が 0 件でも出力
- `ui-sanity-visual-review.md`: `NON_VISUAL` の理由と確認範囲
- `phase11-capture-metadata.json`: `captureMode: "NON_VISUAL"` の記録

---

## 統合テスト連携

- 手動でデスクトップアプリの Skill 実行フローを確認
- Main Process の DI 変更のみであるため、UI 変化は期待しない
- エラーなく動作することが「DI チェーン完成」の最終証拠

---

## サブタスク管理

| ID     | タスク名                 | ステータス |
| ------ | ------------------------ | ---------- |
| T-11-1 | アプリのビルド・起動     | 未実施     |
| T-11-2 | スキル実行フロー動作確認 | 未実施     |
| T-11-3 | エラーログ確認           | 未実施     |
| T-11-4 | 手動テスト結果記録       | 未実施     |

---

## 成果物

| 成果物             | 配置先                                           | 形式     |
| ------------------ | ------------------------------------------------ | -------- |
| 手動テスト結果     | `outputs/phase-11/manual-test-result.md`         | Markdown |
| 手動テストレポート | `outputs/phase-11/manual-test-report.md`         | Markdown |
| 発見課題一覧       | `outputs/phase-11/discovered-issues.md`          | Markdown |
| 非視覚レビュー     | `outputs/phase-11/ui-sanity-visual-review.md`    | Markdown |
| capture メタデータ | `outputs/phase-11/phase11-capture-metadata.json` | JSON     |

---

## 完了条件

- [ ] デスクトップアプリが正常に起動することを確認済みであること
- [ ] スキル実行フローが正常に動作することを確認済みであること
- [ ] `healthPolicy` DI 関連のエラーログが発生していないことを確認済みであること
- [ ] 手動テスト結果が `outputs/phase-11/manual-test-result.md` に記録されていること
- [ ] 手動テストレポート・発見課題・非視覚レビュー・capture メタデータが出力されていること

---

## タスク100%実行確認【必須】

- [ ] T-11-1: アプリのビルド・起動を実行済み
- [ ] T-11-2: スキル実行フローの動作確認を実行済み
- [ ] T-11-3: エラーログ確認を実行済み（エラーなし）
- [ ] T-11-4: 手動テスト結果・所見・非視覚レビュー・capture メタデータを記録済み

---

## 次Phase

**Phase 12: ドキュメント更新** — 仕様書・CHANGELOG・未タスク記録の更新を行う。

**Phase 12 開始条件**: Phase 11 の全完了条件を満たすこと。
