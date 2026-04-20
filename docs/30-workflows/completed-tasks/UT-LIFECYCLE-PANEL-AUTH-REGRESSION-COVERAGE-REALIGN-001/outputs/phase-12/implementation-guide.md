# implementation-guide.md

## Part 1: 中学生向けの説明

### なぜ必要か

この変更は、「ボタンを押しただけなのに勝手にログイン処理が走る」事故を防ぐための確認です。

たとえば、自動販売機のボタンを何回押しても、勝手に会員登録画面へ飛んだら困ります。
今回のテストはそれと同じで、画面を開いたり、ボタンを連打したり、前回の作業を消して新しく始めたりしても、関係ない `auth:login` が混ざらないことを確かめます。

### この機能でできること

| 項目        | 説明                                                         |
| ----------- | ------------------------------------------------------------ |
| rapid click | ボタンを連打してもログイン処理が走らない                     |
| rerender    | 画面が再描画されてもログイン処理が走らない                   |
| start new   | 前回セッションを削除して新しく始めてもログイン処理が走らない |

### 今回作ったもの

- `TC-GUARD-01c`
- `outputs/phase-7/traceability-matrix.md`
- `outputs/phase-7/coverage-result.md`
- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-12/*.md` の 6 成果物

## Part 2: 技術者向け実装詳細

### 変更ファイル

- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx`

### current contract

- `SkillLifecyclePanel` 自体は `onOpenSkillWizard` / `onOpenWizard` / `handleSessionStartNew` で wizard 側へ制御を委譲する
- これらの導線では `window.electronAPI.auth.login` を呼ばない

### target delta

- `TC-GUARD-01c` を追加し、`SessionResumePrompt` の `session-start-new-btn` から `handleSessionStartNew()` を通したときも `auth:login` 非発火であることを固定した
- Phase 7〜12 の canonical outputs を補完し、受入基準の証跡を揃えた

### 型と API

```ts
type SessionResumeApi = {
  listSessions?: () => Promise<IpcResult<SkillCreatorSessionListItem[]>>;
  deleteSession?: (checkpointId: string) => Promise<void>;
};
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

### APIシグネチャ

`handleSessionStartNew(checkpointIds?: string[]): Promise<void>`

### 使用例

```ts
mockListSessions.mockResolvedValue({
  success: true,
  data: [resumableSession],
});

fireEvent.click(await screen.findByTestId("session-start-new-btn"));
expect(mockDeleteSession).toHaveBeenCalledWith("checkpoint-001");
expect(mockAuthLogin).not.toHaveBeenCalled();
```

### 使用した検証コマンド

```bash
pnpm --filter @repo/desktop exec vitest run --reporter=verbose src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
pnpm --filter @repo/desktop typecheck
```

### エラーハンドリング

- `deleteSession` は `Promise.allSettled` で処理し、個別失敗で flow 全体を止めない

### エッジケース

- `skillError` / `isGenerating` / 多重 rerender でも `auth:login` が混入しないことを回帰で確認
- 前回セッションが存在しても `session-start-new-btn` 押下で login が混ざらない

### 設定項目と定数一覧

| 項目                   | 値                                          |
| ---------------------- | ------------------------------------------- |
| rapid click 検証回数   | 3回 / 5回                                   |
| rerender 検証          | `skillName`, `onOpenWizard`, `isGenerating` |
| session start-new 検証 | `checkpointId = checkpoint-001`             |

### テスト構成

| ブロック              | 役割                            |
| --------------------- | ------------------------------- |
| `TC-06`               | rapid click 回帰                |
| `TC-07`               | rerender 回帰                   |
| `TC-GUARD-01a/b/c`    | callback / start-new 非発火保証 |
| `AUTH-REGRESS-EDGE-*` | 境界条件の補助回帰              |

## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要

- 代替証跡: `outputs/phase-10/final-review-result.md`
- 代替証跡: `outputs/phase-11/manual-test-result.md`
