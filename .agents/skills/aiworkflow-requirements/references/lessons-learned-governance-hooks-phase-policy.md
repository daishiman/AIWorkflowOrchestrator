# 教訓: Governance Hooks / Phase Policy 実装（TASK-P0-09）

> 親仕様書: [lessons-learned-current.md](lessons-learned-current.md)
> タスク: TASK-P0-09 claude-sdk-permission-hooks-governance（2026-03-31）

---

## 1. 定義済み / 接続済み / 可視化済みの区別

| 状態 | 意味 | 失敗パターン |
| --- | --- | --- |
| **定義済み** | 型 / ポリシー / フック関数が実装されている | ここで完了と誤認する |
| **接続済み** | execute など実際の呼び出しパスへ渡されている | 「定義したから使われている」と誤認する |
| **可視化済み** | renderer / UI が GovernanceUiPayload を表示している | IPC 契約追加で完了と誤認する |

**教訓**: TASK-P0-09 では GovernanceHooksFactory / SkillCreatorGovernancePolicy / GovernanceAuditSink を「定義」し、execute phase のみ「接続」した。plan / verify / improve への接続と renderer 可視化は未完了であり、`UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001` として明示的に分離した。

タスク完了の定義を「定義」「接続」「可視化」の3段階で明記することで、次の担当者に状態を正確に伝達できる。

---

## 2. UI Payload vs. Visual Evidence の区別

| 概念 | 内容 |
| --- | --- |
| **UI Payload** | `GovernanceUiPayload` として IPC で renderer へ渡せるデータ |
| **Visual Evidence** | 実際に renderer が画面に表示した状態のスクリーンショット / Phase 11 evidence |

**教訓**: `skill-creator:get-governance` IPC チャネルを追加し `GovernanceUiPayload` を公開した時点で「UI 可視化完了」と誤認しやすい。しかし renderer コンポーネントが payload を消費して表示するまでは Visual Evidence は存在しない。

Phase 11 マニュアルテスト成果物は「N/A（renderer governance UI は follow-up）」と明記し、Visual Evidence 欠如を記録に残す。

---

## 3. パストラバーサル対策の実装パターン（null byte check + path.resolve/relative）

TASK-P0-09 の `SkillCreatorGovernancePolicy` で採用したパターン：

```typescript
function resolvePathSafely(rawPath: string): string | null {
  if (rawPath.includes("\0")) {
    return null;   // null byte による拒否
  }
  return path.resolve(rawPath);
}

// 境界判定
const relativePath = path.relative(normalizedSkillTargetDir, normalizedFilePath);
const isInsideTargetDir =
  relativePath === "" ||
  (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
```

**ポイント**:
- `startsWith("..")` の代わりに `path.relative` ベースで判定することで、シンボリックリンクや OS 差異の影響を低減する
- null byte（`\0`）チェックを最初に実施し、パース前に拒否する
- `skillTargetDir` が未指定の場合 `Write` / `Edit` は常に拒否する（execute phase の場合でも）

---

## 4. execute-only wiring の警告パターン

execute phase 以外のガバナンス接続が未完了の場合、コード上に警告コメントを残すパターン：

```typescript
// execute() 内
const { hooks, auditSink } = createGovernanceHooks({
  phase: "execute",
  // NOTE: plan / verify / improve の governance wiring は
  //       UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001 で継続
  ...
});
```

このコメントにより：
1. 実装の不完全性が grep で検出可能になる
2. follow-up タスク ID が直接コードに結びついている
3. レビュー時に未完了箇所が一目でわかる

---

## 5. follow-up タスクの formalize タイミング

TASK-P0-09 ではフェーズ完了前に `UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001` を task-workflow-backlog / unassigned-task として formalize した。

**教訓**: 「未完了の懸念事項は同じ wave で formalize する」。
- Phase 12 の未タスク検出を完了前に実施し、unassigned 仕様書として独立させる
- 完了記録（task-workflow-completed.md）には「関連未タスク」セクションを追記して追跡可能にする

---

## 関連ファイル

| ファイル | 用途 |
| --- | --- |
| [governance-hooks-factory-audit-sink.md](governance-hooks-factory-audit-sink.md) | GovernanceHooksFactory / GovernanceAuditSink の実装仕様 |
| [interfaces-agent-sdk-skill-reference.md](interfaces-agent-sdk-skill-reference.md) | RuntimeSkillCreatorFacade の Governance 拡張セクション |
| `docs/30-workflows/unassigned-task/UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001.md` | 関連未タスク仕様書 |
