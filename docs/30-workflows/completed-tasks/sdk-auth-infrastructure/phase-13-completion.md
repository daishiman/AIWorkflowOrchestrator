# Phase 13: 完了・PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase      | 13                                       |
| Phase名    | 完了・PR作成                             |
| 前提Phase  | Phase 12 (ドキュメント更新)              |
| 後続Phase  | -（完了）                                |
| ステータス | 未実施                                   |
| 作成日     | 2026-02-07                               |
| タスクID   | TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE    |
| 機能名     | Claude Agent SDK用認証キー管理基盤の構築 |

---

## 目的

変更をコミット・プッシュし、PRを作成してCI確認を行う。成果物の最終確認とタスク完了処理を実施する。

## 背景

全Phaseが完了した状態で、変更を本番ブランチにマージするためのPRを作成する。

---

## 使用スキル

> このPhaseでは `/ai:diff-to-pr` スキルを使用してPR作成を行います。

### diff-to-pr スキルの使用

```bash
# diff-to-pr スキルを呼び出し
/ai:diff-to-pr
```

このスキルが自動的に以下を実行:

1. 変更差分の確認
2. コミットメッセージ生成
3. PR作成
4. CI結果確認

---

## 参照資料

| 参照資料             | パス                                                                                             | 内容                   |
| -------------------- | ------------------------------------------------------------------------------------------------ | ---------------------- |
| 認証キー管理サービス | `apps/desktop/src/main/services/auth/`                                                           | PR対象コード           |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`                                                       | 変更内容のドキュメント |
| 全Phase成果物        | `outputs/phase-*/`                                                                               | 全成果物               |
| タスク指示書         | `docs/30-workflows/skill-import-agent-system/tasks/01c-task-fix-16-1-sdk-auth-infrastructure.md` | タスク詳細             |

---

## 成果物

| 成果物 | パス                          | 内容           |
| ------ | ----------------------------- | -------------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL・CI結果 |

---

## PR作成フロー

```
Phase 13: PR作成（/ai:diff-to-pr 使用）
    ↓
CI通過確認
    ↓
タスクディレクトリを completed-tasks/ に移動
    ↓
artifacts.json の status を "completed" に更新
    ↓
（該当する場合）元タスク指示書を削除
    ↓
（該当する場合）Phase 12で作成した新規未タスク指示書が存在確認
    ↓
変更をコミット・プッシュ
    ↓
ワークフロー完了
```

---

## PR作成時の注意事項

### コミットメッセージ

```
feat(auth): Claude Agent SDK用認証キー管理基盤の構築

- AuthKeyService による認証キーの暗号化保存・復号取得
- SkillExecutor への認証キー注入
- AUTH_KEY_* IPC ハンドラーの実装
- キー未設定時のバリデーション

Closes #{{関連Issue番号}}
```

### PR本文テンプレート

```markdown
## Summary

- Claude Agent SDK `query()` 呼び出し時に必要な認証キー管理基盤を構築
- Electron `safeStorage` を使用した暗号化保存
- Main Process のみで認証キーを扱うセキュアな設計

## Test plan

- [ ] AuthKeyService の暗号化・復号テストがPASS
- [ ] キー未設定時のエラーハンドリングテストがPASS
- [ ] SkillExecutor 経由でのSDK呼び出しテストがPASS
- [ ] セキュリティ手動検証完了（キーがログ・Rendererに露出しない）

## Security checklist

- [ ] 認証キーは Main Process のみでアクセス
- [ ] ログにキーが含まれない
- [ ] IPC 経由で Renderer にキーを送信しない
- [ ] safeStorage 利用不可時のフォールバック対応
```

---

## タスク完了時の移動手順

```bash
# 1. タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/sdk-auth-infrastructure/ docs/30-workflows/completed-tasks/

# 2. 移動を確認
ls docs/30-workflows/completed-tasks/ | grep sdk-auth

# 3. artifacts.json の status を "completed" に更新
# outputs/artifacts.json を編集

# 4. 元タスク指示書を削除（該当する場合）
rm docs/30-workflows/skill-import-agent-system/tasks/01c-task-fix-16-1-sdk-auth-infrastructure.md

# 5. 削除を確認
ls docs/30-workflows/skill-import-agent-system/tasks/ | grep 01c || echo "削除完了"

# 6. 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTUREをcompleted-tasksに移動"
git push
```

> **注意**: 元タスク指示書（`01c-task-fix-16-1-sdk-auth-infrastructure.md`）はタスク完了時に削除します。
> Phase 12で検出・作成した**新規**未タスク指示書は削除しないでください。

---

## 完了条件チェックリスト

| #   | 項目                                                 | 必須 |
| --- | ---------------------------------------------------- | ---- |
| 1   | PRが作成されている                                   | ✅   |
| 2   | CIが全て通過している                                 | ✅   |
| 3   | セキュリティチェックリストが全て確認済み             | ✅   |
| 4   | タスクディレクトリが `completed-tasks/` に移動済み   | ✅   |
| 5   | `artifacts.json` の `status` が `"completed"`        | ✅   |
| 6   | （該当時）元タスク指示書が削除済み                   | 条件 |
| 7   | （該当時）Phase 12で作成した新規未タスク指示書が存在 | 条件 |
| 8   | **本Phase内の全作業を100%完了**                      | ✅   |

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全作業を100%実行完了
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] タスクディレクトリが移動されている
- [ ] artifacts.jsonが更新されている

---

## 依存関係

- **前提**: Phase 12 が完了していること
- **後続**: なし（タスク完了）

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 13 実行記録

### PR情報

- PR URL: {{URL}}
- CI結果: {{PASS/FAIL}}
- マージ状態: {{Merged/Open}}

### セキュリティ最終確認

- 認証キーMain Process限定: {{確認OK}}
- ログ露出なし: {{確認OK}}
- IPC経由漏洩なし: {{確認OK}}

### タスク完了

- completed-tasks移動: {{完了/未完了}}
- artifacts.json更新: {{完了/未完了}}
- 元タスク指示書削除: {{完了/対象外}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 全体振り返り

- 総作業時間: {{時間}}
- 難易度評価: {{高/中/低}}
- 再利用可能なパターン:
```

---

## ワークフロー完了

Phase 13が完了したら、このタスクは完了です。

タスクディレクトリは `docs/30-workflows/completed-tasks/sdk-auth-infrastructure/` に移動されます。

---

## 関連タスクへの引き継ぎ

本タスク完了後、以下のタスクが着手可能になります:

| タスクID                              | タスク名                                | 依存関係                   |
| ------------------------------------- | --------------------------------------- | -------------------------- |
| TASK-FIX-15-1-EXECUTE-HANDLER-ROUTING | SkillExecutorハンドラールーティング修正 | 本タスク完了が前提         |
| TASK-9B-I-SDK-FORMAL-INTEGRATION      | SDK正式統合                             | キー渡し方を本タスクで確立 |

これらのタスクに着手する際は、本タスクで確立した認証キー管理パターンを参照してください。
