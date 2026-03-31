# TASK-P0-02: verify→improve→re-verify 閉ループ修復 — 実装ガイド

## Part 1: 概念説明（中学生レベル）

### なぜこのループが大切なの？

閉ループがないと、「テストの答え合わせはしたけど、間違いを直してもう一度テストを受ける方法がない」状態になります。これでは品質を保証できません。

### この機能でできること

verify で失敗したあとに improve へ戻り、修正後にもう一度 verify へ進めます。さらに pass を明示的に記録して review/handoff までつなげられるので、「確認しただけで終わる」状態を防げます。

### 「検証→改善→再検証」ループって何？

学校のテストを思い浮かべてください。テストを受けて（execute）、答え合わせをして（verify）、間違えた問題を解き直して（improve）、もう一度テストを受ける（re-verify）。最初のテストで80点だったら、間違えた20点分の問題を復習してから、もう一度テストを受けて100点を目指します。

たとえば、AIがスキル（プログラムの部品）を作るとき、作ったスキルが正しいか確認するステップが必要です。もし問題が見つかったら、修正してからもう一度確認します。このサイクルを「閉ループ」と呼びます。

今回の修正前は：

- テストで100点（pass）だったときに「合格」と記録する方法がなかった
- 間違いを直した後、もう一度テストを受ける道がなかった

今回の修正で：

- `recordVerifyPass()` — 100点を取ったときに「合格」と記録できるようになった
- `improve → verify` — 間違いを直した後、もう一度テストを受けられるようになった

---

## Part 2: 技術詳細

### 1. `recordVerifyPass()` メソッド

#### TypeScript 型定義

```typescript
recordVerifyPass(
  planId: string,
  checks: RuntimeSkillCreatorVerifyCheck[],
): SkillCreatorWorkflowStateSnapshot
```

#### API シグネチャ

```typescript
engine.recordVerifyPass(planId, checks);
```

#### パラメータ

| パラメータ | 型                                 | 説明                                                                                                        |
| ---------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `planId`   | `string`                           | 対象ワークフローの plan ID                                                                                  |
| `checks`   | `RuntimeSkillCreatorVerifyCheck[]` | VerificationEngine 側の検証結果。現行実装では state transition 判定には使わず、呼び出し元との契約整合に使う |

#### 戻り値

`SkillCreatorWorkflowStateSnapshot` — 更新後のワークフロー状態スナップショット

#### 動作

1. planId に対応するワークフローを取得
2. `assertTransition(currentPhase, "review")` で verify phase からの遷移を検証
3. `verifyResult.status = "pass"`, `nextAction = "handoff"` を記録
4. `verify_result` artifact を追加
5. `checks` 自体は保存せず、verify detail は engine snapshot から再構成する
6. resume token を更新してスナップショットを返す

#### 使用例

```typescript
// VerificationEngine の結果を受けて pass を記録
const checks = await verificationEngine.verify(skillDir);
const hasError = checks.some((c) => c.severity === "error");

if (!hasError) {
  const snapshot = engine.recordVerifyPass(planId, checks);
  // snapshot.currentPhase === "review"
  // snapshot.verifyResult.status === "pass"
}
```

#### エラーハンドリング

- verify phase 以外で呼ぶと `Error: invalid workflow transition: <current> -> review` をスロー
- planId が存在しない場合は `Error: workflow state not found for planId: <planId>` をスロー

### 2. phase 遷移テーブルの変更

#### Before

```typescript
improve: ["execute"],
```

#### After

```typescript
improve: ["execute", "verify"],
```

#### 遷移図

```
plan → review → execute → verify
                  ↑          ↓ pass → review → handoff
                  |          ↓ fail
                  |       improve
                  |         ↓ ↑
                  ← execute  verify (re-verify)
```

### 3. `getReverifyDisabledReason()` の変更

#### Before

```typescript
if (state.currentPhase === "execute") {
  return "実行中は再検証できません。";
}
```

#### After

```typescript
if (state.routeSnapshot?.type === "terminal_handoff") {
  return "terminal_handoff の再検証導線は Task07 owner のため...";
}
if (state.currentPhase !== "improve") {
  return "improve フェーズ以外では再検証できません。";
}
```

improve-only gate を追加し、execute phase チェックを包含する形に変更。terminal_handoff チェックは improve-only gate より前に配置（既存テストとの互換維持）。

### 4. Facade / IPC handler の変更

- **RuntimeSkillCreatorFacade**: 変更なし。`verifySkill()` は checks を返すのみ、`reverifyWorkflow()` は既存 bridge 維持
- **creatorHandlers.ts**: 変更なし。既存の `skill-creator:get-verify-detail` / `skill-creator:reverify-workflow` 経路を維持
- **新しい IPC channel**: 追加なし

### 5. UI snapshot の変更

- `SkillCreatorWorkflowUiSnapshot` の shape は変更なし
- verify 状態は既存の `verifyResult` フィールドで表現
- `verifyResult.status` は `"pending"` / `"pass"` / `"fail"` の 3 値
- 詳細結果は `RuntimeSkillCreatorVerifyDetail.checks` で取得するが、これは永続化した verification checks の再生ではなく current workflow snapshot からの合成結果

### 6. エッジケース

| ケース                      | 動作                                                                      |
| --------------------------- | ------------------------------------------------------------------------- |
| verification engine 未注入  | `verifySkill()` が空配列を返す。`recordVerifyPass()` は空配列でも動作する |
| checks にerror含む          | `recordVerifyFailure()` で fail→improve 遷移                              |
| checks にerrorなし          | `recordVerifyPass()` で pass→review 遷移                                  |
| 2周以上のre-verify          | improve→verify→fail→improve→verify→pass も正常動作                        |
| verify pass後の重複呼び出し | review phaseからの遷移エラー                                              |

### 7. 設定可能なパラメータと定数

| 定数/設定              | 値                               | 場所                              |
| ---------------------- | -------------------------------- | --------------------------------- |
| VALID_TRANSITIONS      | `improve: ["execute", "verify"]` | SkillCreatorWorkflowEngine.ts:597 |
| verify pass nextAction | `"handoff"`                      | recordVerifyPass() 内             |
| resume token version   | `"task-sdk-02-v1"`               | refreshResumeToken()              |
