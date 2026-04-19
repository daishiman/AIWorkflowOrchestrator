# Phase 12: 実装ガイド

## Part 1: 中学生向け概念説明

### `describe.skip` とは何か

テストには「このグループは今日は休み」と決める仕組みがあります。`describe.skip(...)` はその休み札です。休ませたままだと、こわれても気づけません。

### なぜ今回の対応が必要だったか

`auth:login` は本人確認を始める大事な処理です。これが関係ない場面で勝手に呼ばれると、ユーザーは急にログインを求められます。

たとえば、非常ベルが鳴るべき場所でだけ鳴るかを見張る点検表があり、その点検表の一部がずっと休みだったら困ります。今回は、その休み札を外して、今の画面に合う見張り方へ直しました。

### このタスクで何をしたか

- 旧 UI に依存していた `describe.skip` 4件を削除
- まだ意味のある `authModeSlice` の回帰テストを有効化
- 現行導線に合わせて `onOpenSkillWizard` / `onOpenWizard` / `session-start-new` の 3 経路で `auth:login` 非発火を追加確認

### なぜ大切か

「休ませていたテストをただ消す」のではなく、「今の画面で本当に使っている入口を見張る」状態に戻したためです。

---

## Part 2: 技術者向け実装ガイド

### current contract

`SkillLifecyclePanel` で `auth:login` を直接叩くべきでない導線は、現時点で次の4系統です。

| 導線                           | 実装位置                  | 検証方法 |
| ------------------------------ | ------------------------- | -------- |
| スキル作成ウィザードを開く     | `onOpenSkillWizard`       | TC-01a   |
| 詳細ウィザードを開く           | `onOpenWizard`            | TC-01b   |
| セッション削除後に新規開始する | `handleSessionStartNew()` | TC-01c   |
| 認証モードを切り替える         | `authModeSlice.setMode()` | TC-08    |

### 代表コード

```tsx
<button
  type="button"
  className={lifecycleButtonStyles.primary}
  onClick={onOpenSkillWizard}
  data-testid="skill-lifecycle-open-wizard-button"
>
  スキル作成ウィザードを開く →
</button>
```

```ts
const handleSessionStartNew = useCallback(
  async (checkpointIds?: string[]) => {
    const sessionApi = getSessionResumeApi();
    const targetIds =
      checkpointIds ?? resumableSessions.map((session) => session.checkpointId);
    if (sessionApi?.deleteSession) {
      await Promise.allSettled(
        targetIds.map((checkpointId) =>
          sessionApi.deleteSession!(checkpointId),
        ),
      );
    }
    onOpenWizard?.();
  },
  [onOpenWizard, resumableSessions],
);
```

### cleanup 判断

| 旧テスト      | 処置   | 根拠                                                          |
| ------------- | ------ | ------------------------------------------------------------- |
| TC-03 / TC-05 | 削除   | `skill-lifecycle-prepare-button` 前提が現行 UI に存在しない   |
| TC-06 / TC-07 | 削除   | 旧 prepare フロー固有の境界条件で、現行 UI へ直接移植できない |
| TC-08         | 有効化 | 現行 `authModeSlice` 契約に沿って再検証可能                   |

### 残る follow-up

今回のテスト追加で主要導線は補強したが、旧 TC-06 / TC-07 が担っていた「連打」「再レンダリング」起因の非発火保証は別契約として再設計が必要です。詳細は `outputs/phase-12/unassigned-task-detection.md` を参照。

### 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要。
証跡は `outputs/phase-11/manual-test-result.md` と `outputs/phase-11/evidence-index.md` に集約。
