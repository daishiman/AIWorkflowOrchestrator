# [#1770] "[TASK-AGENTVIEW-PHASE11-SCREENSHOT-RECAPTURE-001] AgentView Phase 11 実画面証跡の再取得"

## メタ情報

```yaml
task_id: TASK-AGENTVIEW-PHASE11-SCREENSHOT-RECAPTURE-001
task_name: AgentView Phase 11 実画面証跡の再取得
category: 品質保証
target_feature: AgentView manual evidence
priority: 中
scale: 小規模
status: 未実施
source_phase: agentview-permission-api-fix Phase 12 unassigned-task-detection（2026-03-30）
created_date: 2026-03-30
dependencies: [agentview-permission-api-fix]
spec_path: docs/30-workflows/unassigned-task/task-agentview-phase11-screenshot-recapture-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 11 の manual-test / screenshot evidence は current contract に基づく実画面 PNG を持っていない。placeholder 画像だけでは UI/UX 検証の証跡として不十分である。

### 1.2 問題点・課題

- `validate-phase11-screenshot-coverage.js` が `.png` 参照不足で fail する
- `manual-test-result.md` は BLOCKED 記録のみで、実証が完了していない
- `apps/desktop/src/renderer/phase11-agent-view.tsx` と実行環境の `esbuild` mismatch が再取得を妨げている

### 1.3 放置した場合の影響

- Phase 11/12 close-out が false green になりやすい
- 画面回帰が発生しても視覚証跡で追えない
- implementation guide の screenshot 参照が空文化する

---

## 2. 何を達成するか（What）

### 2.1 目的

AgentView Permission API 修正に対する Phase 11 実画面証跡を current contract で再取得し、manual result / screenshot evidence / implementation guide に反映する。

### 2.2 最終ゴール

- TC-11-01〜05 に対応する PNG が `outputs/phase-11/screenshots/` に揃う
- `manual-test-result.md` の証跡列が `.png` を参照する
- screenshot coverage validator が PASS する

### 2.3 スコープ

#### 含むもの

- `phase11-agent-view.tsx` の current contract 確認
- desktop 起動環境の `esbuild` mismatch 解消
- TC-11-01〜05 の実画面 capture
- Phase 11 / Phase 12 成果物反映

#### 含まないもの

- AgentView 本体の新機能追加
- permission mode 永続化

---

## 3. 実行手順

1. `esbuild` platform mismatch を解消して desktop app を起動可能にする
2. `window.permissionAPI` 前提で Phase 11 harness を確認する
3. TC-11-01〜05 のスクリーンショットを取得する
4. `manual-test-result.md` と `screenshot-evidence.md` に PNG を紐付ける
5. Phase 11 screenshot coverage validator を再実行する

---

## 4. 完了条件チェックリスト

- [ ] TC-11-01〜05 の PNG が存在する
- [ ] `manual-test-result.md` の証跡列に PNG 参照がある
- [ ] `validate-phase11-screenshot-coverage.js` が PASS する
- [ ] `implementation-guide.md` の screenshot 参照が current facts に更新される

---

## 5. 参照情報

- `docs/30-workflows/agentview-permission-api-fix/phase-11-manual-test.md`
- `docs/30-workflows/agentview-permission-api-fix/outputs/phase-11/manual-test-result.md`
- `docs/30-workflows/agentview-permission-api-fix/outputs/phase-11/screenshot-evidence.md`
- `apps/desktop/src/renderer/phase11-agent-view.tsx`
