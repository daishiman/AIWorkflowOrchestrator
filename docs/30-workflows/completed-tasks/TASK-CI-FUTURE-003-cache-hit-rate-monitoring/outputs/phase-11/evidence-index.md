# 証跡インデックス

## メタ情報

| 項目   | 内容               |
| ------ | ------------------ |
| Phase  | 11                 |
| 機能名 | TASK-CI-FUTURE-003 |
| 作成日 | 2026-04-15         |

---

## 証跡一覧

| テストケース | 証跡種別                        | 保存先 / 参照先                                   | 取得状態            |
| ------------ | ------------------------------- | ------------------------------------------------- | ------------------- |
| TC-001       | Summary スクリーンショット      | `outputs/phase-11/screenshot-tc001-exact-hit.png` | PR マージ後取得予定 |
| TC-002       | Summary + Annotations           | `outputs/phase-11/screenshot-tc002-fallback.png`  | PR マージ後取得予定 |
| TC-003       | Summary + Annotations + Warning | `outputs/phase-11/screenshot-tc003-miss.png`      | PR マージ後取得予定 |

---

## 代替証跡（スクリーンショット取得前）

GitHub Actions の実行結果は PR マージ後に以下で確認できる：

```bash
# 最新 CI 実行一覧
gh run list --workflow=ci.yml --limit=5 --repo daishiman/AIWorkflowOrchestrator

# 実行ログ（Summary は Actions Web UI で確認）
gh run view <RUN_ID> --repo daishiman/AIWorkflowOrchestrator
```

---

## 備考

本タスクは GitHub Actions YAML 変更のみのため、実際の証跡（スクリーンショット）は CI 実行後に取得する。実装ロジックは `action.yml` コードレビューで静的に検証済み。
