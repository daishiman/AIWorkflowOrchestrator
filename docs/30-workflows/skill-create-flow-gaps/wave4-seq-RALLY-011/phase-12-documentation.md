# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 12                   |
| タスクID   | TASK-RALLY-011       |
| 機能名     | 送信中競合防止UI強化 |
| 前提Phase  | Phase 11             |
| 後続Phase  | Phase 13             |
| 作成日     | 2026-04-21           |
| ステータス | pending              |

## 目的

実装内容をドキュメントとして記録し、後続タスク（RALLY-012）の実装者が前提を正確に把握できるようにする。

## 変更内容の説明（中学生レベル）

このタスクでは「回答を送っている最中に画面が混乱しないようにする仕組み」を作りました。

ラリーでは、ユーザーが回答を送信すると、AIが次の質問を送り返してきます。インターネット通信なので、「回答送信中」と「次の質問到着」がほぼ同時に起きることがあります。

変更前は、回答を送っている途中に次の質問が届くと、「送信中...」のボタンと「次の質問のUI」が同時に表示される問題がありました。

変更後は「バッファ（一時保管場所）」を使い、回答送信が完了するまで次の質問の表示を待機させるようにしました。送信が終わると一時保管されていた「次の質問」が正しく表示されます。

## 変更ファイル

| ファイル                                                                 | 変更内容                                                                     |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx` | `pendingSnapshotRef`・`activeSnapshot` 追加、バッファリング制御useEffect追加 |

## 後続タスクへの引き継ぎ事項

RALLY-012（エラー回復導線追加）の実装者は以下を前提として着手すること：

- `pendingSnapshotRef` と `activeSnapshot` state が追加されている
- UI表示はすべて `activeSnapshot` を参照している
- IPC呼び出し（submit）のみ props の `workflowSnapshot` を参照している
- `isSubmitting` 中は `workflowSnapshot` の更新が `pendingSnapshotRef` にバッファリングされる
- RALLY-012 が変更する `submitAnswer` のエラー処理は `activeSnapshot` 参照への影響を考慮すること

## 成果物

| 成果物           | パス                                            | 説明                   |
| ---------------- | ----------------------------------------------- | ---------------------- |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md`      | 技術的変更内容の説明   |
| 仕様更新サマリー | `outputs/phase-12/spec-update-summary.md`       | AC達成状況と変更概要   |
| 更新履歴         | `outputs/phase-12/documentation-changelog.md`   | 変更履歴               |
| 未タスク検出     | `outputs/phase-12/unassigned-task-detection.md` | 未対応タスクの検出結果 |

## 完了条件

- [ ] 実装ガイドが作成されていること
- [ ] 後続タスク（RALLY-012）への引き継ぎ事項が明記されていること
- [ ] 中学生レベルの変更説明が含まれていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-create-flow-gaps/p11-seq-RALLY-011
```

## 次のPhase

Phase 13: PR作成
