# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                            |
| ------ | --------------------------------------------- |
| Phase  | 12                                            |
| 機能名 | task-ut-rt-01-notify-helper-consolidation-001 |
| 作成日 | 2026-04-18                                    |

## Task 12-1: 実装ガイド（2パート）

### Part 1（中学生レベル）

**なぜこれが必要か？**

プログラムの中に「同じ処理のコピーが3つ」ある状態を想像してください。たとえば、同じ電話番号に電話する処理を3か所に別々に書くのではなく、「電話する」という関数を1つ作って、どこからでも呼べるようにするのが良いプログラムの書き方です。

今回は「スキル作成に失敗しました」という通知を送る処理が3か所にバラバラに書かれています。これを1か所にまとめることで、将来「通知のメッセージを変えたい」「通知にログを追加したい」というときに1か所だけ直せばよくなります。

- 変更前: 同じ通知処理が3か所に分散 → 変更時は3箇所すべてを直す必要がある
- 変更後: ヘルパー関数1つに集約 → 変更時は1箇所だけ直せばよい

### Part 2（技術者レベル）

**変更ファイル**:

| ファイル                                                              | 変更内容                                         |
| --------------------------------------------------------------------- | ------------------------------------------------ |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | `notifySkillCreationFailure()` 追加・3箇所の置換 |

**ヘルパー関数シグネチャ**:

```typescript
private notifySkillCreationFailure(message: string): void {
  try {
    this.notificationService?.notify("スキル作成失敗", message);
  } catch {
    // 通知の失敗は呼び出し元の処理結果に影響しない
  }
}
```

**置換前後の比較**:

```typescript
// Before（各箇所にインライン記述）
try {
  this.notificationService?.notify("スキル作成失敗", errorMessage);
} catch {
  // ...
}

// After（ヘルパー呼び出し）
this.notifySkillCreationFailure(errorMessage);
```

## Task 12-2: システム仕様書更新

- `task-workflow-completed.md` に本タスクの完了記録を追加
- `task-workflow-backlog.md` の本タスクのステータスを `open` → `completed` に更新
- `aiworkflow-requirements/LOGS.md` を更新

## Task 12-3: 未タスク検出

追加の未タスクはなし（リファクタリングスコープ内に収まる）。

## 成果物

| 成果物                 | 配置先                                           |
| ---------------------- | ------------------------------------------------ |
| 実装ガイド             | `outputs/phase-12/implementation-guide.md`       |
| システム仕様書更新要約 | `outputs/phase-12/system-spec-update-summary.md` |
| ドキュメント変更履歴   | `outputs/phase-12/documentation-changelog.md`    |
| 未タスク検出レポート   | `outputs/phase-12/unassigned-task-detection.md`  |

## 完了条件

- [ ] 実装ガイド作成完了
- [ ] システム仕様書更新完了
- [ ] Phase 13 開始条件が整っている

## 次Phase

→ [Phase 13: PR作成](phase-13-pr-creation.md)
