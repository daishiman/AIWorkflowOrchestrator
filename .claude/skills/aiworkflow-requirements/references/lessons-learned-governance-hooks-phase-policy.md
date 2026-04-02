# 教訓: Governance Hooks / Phase Policy 実装（TASK-P0-09）

> 親仕様書: [lessons-learned-current.md](lessons-learned-current.md)
> タスク: TASK-P0-09 claude-sdk-permission-hooks-governance（2026-03-31）

---

## 1. 定義済み / 接続済み / 可視化済みの区別

| 状態 | 意味 | 失敗パターン |
| --- | --- | --- |
| **定義済み** | 型 / ポリシー / フック関数が実装されている | ここで完了と誤認する |
| **接続済み** | plan / execute / verify / improve など実際の呼び出しパスへ渡されている | 「定義したから使われている」と誤認する |
| **可視化済み** | renderer / UI が GovernanceUiPayload を表示している | IPC 契約追加で完了と誤認する |

**教訓**: TASK-P0-09 の初期段階では execute phase だけが接続済みだったため、定義・接続・可視化を別の完了条件として扱う必要があった。UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001 の完了により、全フェーズ（plan/execute/verify/improve）への接続と renderer 可視化（GovernanceSummaryPanel）が揃った。canonical docs では全フェーズ対応を前提に書き、phase gap がある場合のみ不足 phase 名を明示して追跡する。

タスク完了の定義を「定義」「接続」「可視化」の3段階で明記することで、次の担当者に状態を正確に伝達できる。

---

## 2. UI Payload vs. Visual Evidence の区別

| 概念 | 内容 |
| --- | --- |
| **UI Payload** | `GovernanceUiPayload` として IPC で renderer へ渡せるデータ |
| **Visual Evidence** | 実際に renderer が画面に表示した状態のスクリーンショット / Phase 11 evidence |

**教訓**: `skill-creator:get-governance` IPC チャネルを追加し `GovernanceUiPayload` を公開した時点で「UI 可視化完了」と誤認しやすい。しかし renderer コンポーネントが payload を消費して表示するまでは Visual Evidence は存在しない。

UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001 では renderer UI を実装したうえで、現ワークツリーでは Electron 実行環境がないため Phase 11 を「N/A 根拠つき evidence」として閉じた。UI task では「UI 未実装」と「UI 実装済みだが capture 環境なし」を区別して記録する。

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

## 4. phase gap の警告パターン

いずれかの phase のガバナンス接続が未完了の場合、特定のフェーズ名のみを固定表現で書くのではなく、不足している phase 名を列挙して follow-up を明示する：

```typescript
// phase gap が残る場合のみ記載する
const { hooks, auditSink } = createGovernanceHooks({
  phase: "execute",
  // NOTE: plan / verify / improve のいずれかが未接続なら phase 名を明示する
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

## 6. waitFor + vi.useFakeTimers() 非互換問題（テスト環境）

| 状況 | 挙動 |
| --- | --- |
| `vi.useFakeTimers()` 有効 + `waitFor` 使用 | `waitFor` が内部で `setTimeout` をポーリングに使うため、fake timers に止められ永久待機 → 30秒タイムアウト |
| `vi.useFakeTimers()` 有効 + `act(async () => { await Promise.resolve(); })` 使用 | マイクロタスクキューをフラッシュし、非同期 state update を即座に反映 → PASS |

**根拠**: `GovernanceSummaryPanel.test.tsx` の TC-R-01〜TC-R-06, TC-R-08〜TC-R-12 が最初 `waitFor` で実装されてタイムアウトした。TC-R-07（`act + vi.advanceTimersByTime`）は通過していたことから `waitFor` のみが問題と特定。

**適用ルール**:
- happy-dom + vitest + `vi.useFakeTimers()` 環境では `waitFor` を使わない
- 非同期 state 更新の待機は `await act(async () => { await Promise.resolve(); })` で行う
- `setInterval` の動作確認が必要なテストのみ fake timers を使用し、それ以外は real timers のままにする選択肢もある

---

## 7. canUseTool 引数順序の罠（型が同一な引数の逆転バグ）

```typescript
// 正しい実装（SkillCreatorPermissionPolicy.ts）
export function canUseTool(toolName: string, phase: SkillCreatorGovernancePhase): ...

// 間違ったテスト呼び出し（GovernanceAllPhases.test.ts で発生）
canUseTool("plan", "Write")   // ← phase, toolName の順で逆！
// getPolicy("Write") が undefined を返し TypeError

// 正しい呼び出し
canUseTool("Write", "plan")   // toolName, phase の順
```

**根拠**: `getPolicy(phase)` が `undefined` を返し `policy.disallowedTools` で TypeError → 5テストが失敗。両引数が `string` 型のため TypeScript がコンパイルエラーを出さなかった。

**適用ルール**: 引数が同一型の関数でテストを書く場合、関数シグネチャを必ず参照してから呼び出す。型システムが保護してくれない順序バグは実行時にしか発覚しない。

---

## 8. worktree でのテスト実行と esbuild バージョン不一致

git worktree は独立したチェックアウトを持つが `node_modules` は共有されない場合がある。`pnpm install` を worktree ルートで実行する前にテストを実行すると esbuild のホストバイナリとインストール済みバイナリのバージョンが一致せずビルドが失敗する。

**発生条件**: worktree 作成直後、`pnpm install` 未実行の状態でテスト実行
**エラー**: `Host version 0.21.5 does not match binary version 0.25.12`
**解決策**: worktree ルートで `pnpm install --frozen-lockfile` を実行してから vitest を起動する

**適用ルール**: 新しい worktree でのテスト実行前に必ず `pnpm install` を完了させる。

---

## 関連ファイル

| ファイル | 用途 |
| --- | --- |
| [governance-hooks-factory-audit-sink.md](governance-hooks-factory-audit-sink.md) | GovernanceHooksFactory / GovernanceAuditSink の実装仕様 |
| [interfaces-agent-sdk-skill-reference.md](interfaces-agent-sdk-skill-reference.md) | RuntimeSkillCreatorFacade の Governance 拡張セクション |
| `docs/30-workflows/unassigned-task/UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001.md` | 関連未タスク仕様書 |
