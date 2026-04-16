# モード別 onProgress 進捗フロー詳細化 - タスク指示書

## メタ情報

```yaml
issue_number: 2208
```

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| タスクID     | FUP-SW-STREAM-001-03                     |
| タスク名     | skill-creator-progress-mode-specific     |
| 分類         | 機能改善                                 |
| 対象機能     | SkillCreatorService - モード別進捗フロー |
| 優先度       | **中**                                   |
| 見積もり規模 | 中規模                                   |
| ステータス   | 未着手                                   |
| 発見元       | TASK-SW-STREAM-001 Phase 12 未タスク検出 |
| 発見日       | 2026-04-16                               |
| depends_on   | TASK-SW-STREAM-002（IPC 配線）完了後推奨 |
| 推奨前提     | FUP-SW-STREAM-001-02（定数化）完了後     |
| 関連タスク   | TASK-SW-STREAM-001 / TASK-SW-STREAM-002  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SW-STREAM-001 で実装した進捗通知は、全モード（`create` / `collaborative` / `orchestrate` / `update` / `improve-prompt`）で
同一の 5 段階（planning→generating-skill→generating-agents→validating→done）を使用している。

しかし実際の処理フローはモードによって異なる：

| モード         | 処理フロー                                                      |
| -------------- | --------------------------------------------------------------- |
| create         | structurePlan → generateSkillMd → generateAgentSpecs → validate |
| collaborative  | インタラクティブ対話 → generateSkillMd → validate               |
| orchestrate    | タスク分解 → 並列エージェント起動 → 集約 → validate             |
| update         | diff 解析 → 差分適用 → validate                                 |
| improve-prompt | プロンプト評価 → 改善案生成 → validate                          |

### 1.2 問題点・課題

- `collaborative` モードでは `generating-agents` ステップが不要（エージェント定義は対話型で行う）のに、
  UI 側でプログレスバーが `generating-agents` 段階を通過するかのように見える
- `update` モードでは `planning` の内容が `"構造を計画しています"` と表示されるが、
  実際は diff 解析をしているため、ユーザーにとって意味が分からない
- UX 改善として、現在何をしているかをモード別の適切なメッセージで伝えるべき

### 1.3 放置した場合の影響

- IPC 配線（TASK-SW-STREAM-002）完了後、Renderer のプログレスバーが全モードで同じメッセージを表示し、
  `collaborative` や `update` モードのユーザーに誤解を与える
- モード別フロー実装時に後付けで変更すると、テストコードの修正が大きくなる

---

## 2. 何を達成するか（What）

### 2.1 目的

`SkillCreatorService.createSkill()` の各モードに適したフェーズ定義と progress メッセージを用意し、
ユーザーが実際の処理内容を理解できる進捗表示を実現する。

### 2.2 最終ゴール

- モードごとに異なる phase セットと message が定義されている
- `onProgress` コールバックが各モードの処理ステップに応じた情報を通知する
- モード別のテストケースが追加され、各フェーズが正しい順序・値で発火することを検証している
- 全モードで percentage が 0→100 の昇順で通知される

### 2.3 スコープ

#### 含むもの

- モード別 progress フェーズ定義（`PROGRESS_PHASES_BY_MODE` 等）
- `SkillCreatorService.ts` の各モード分岐への `onProgress` 呼び出し追加
- モード別のテストケース追加（最低 `update` / `collaborative` の 2 モード）

#### 含まないもの

- IPC 配線の実装（TASK-SW-STREAM-002 のスコープ）
- Renderer 側のモード別 UI 実装（後続タスクのスコープ）
- `orchestrate` / `improve-prompt` モードの詳細フロー実装（フロー未確定のため）

### 2.4 成果物

| 種別     | 成果物                           | 配置先                                                                                |
| -------- | -------------------------------- | ------------------------------------------------------------------------------------- |
| 定数     | PROGRESS_PHASES_BY_MODE 定数     | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                         |
| 機能改善 | モード別 onProgress 呼び出し     | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                         |
| テスト   | モード別フェーズ検証テストケース | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts` |

---

## 3. どのように実装するか（How）

### 3.1 設計方針

#### 3.1.1 モード別フェーズ定義の構造

```typescript
const PROGRESS_PHASES_BY_MODE = {
  create: [
    {
      phase: "planning",
      percentage: 10,
      message: "スキル構造を計画しています",
    },
    {
      phase: "generating-skill",
      percentage: 40,
      message: "SKILL.md を生成しています",
    },
    {
      phase: "generating-agents",
      percentage: 70,
      message: "エージェント定義を生成しています",
    },
    { phase: "validating", percentage: 90, message: "スキルを検証しています" },
    { phase: "done", percentage: 100, message: "完了しました" },
  ],
  update: [
    { phase: "planning", percentage: 10, message: "変更差分を解析しています" },
    {
      phase: "generating-skill",
      percentage: 50,
      message: "SKILL.md を更新しています",
    },
    {
      phase: "validating",
      percentage: 90,
      message: "更新内容を検証しています",
    },
    { phase: "done", percentage: 100, message: "更新が完了しました" },
  ],
  collaborative: [
    {
      phase: "planning",
      percentage: 20,
      message: "対話フローを準備しています",
    },
    {
      phase: "generating-skill",
      percentage: 60,
      message: "SKILL.md を生成しています",
    },
    { phase: "validating", percentage: 90, message: "スキルを検証しています" },
    { phase: "done", percentage: 100, message: "完了しました" },
  ],
  // orchestrate / improve-prompt は TASK-SW-STREAM-002 以降のフロー確定後に追加
} as const satisfies Record<
  string,
  Array<{ phase: string; percentage: number; message: string }>
>;
```

#### 3.1.2 helper 関数への切り出し

```typescript
private notifyProgress(
  onProgress: ((data: SkillCreatorProgressData) => void) | undefined,
  mode: SkillCreatorMode,
  step: number // 0-indexed
): void {
  if (!onProgress) return;
  const phases = PROGRESS_PHASES_BY_MODE[mode] ?? PROGRESS_PHASES_BY_MODE.create;
  const phaseData = phases[step];
  if (phaseData) onProgress(phaseData);
}
```

### 3.2 実装手順

1. `PROGRESS_PHASES_BY_MODE` 定数を定義する（FUP-02 の `PROGRESS_PHASES` を拡張する形で）
2. `notifyProgress()` プライベートメソッドを `SkillCreatorService` に追加する
3. 各モードの処理分岐内で `notifyProgress()` を呼び出す
4. `update` / `collaborative` モードのテストケースを追加する

### 3.3 確認コマンド

```bash
# 全モードのテスト実行
pnpm --filter @repo/desktop test -- --run SkillCreatorService

# 型チェック
pnpm --filter @repo/desktop typecheck
```

---

## 4. 受け入れ基準（Acceptance Criteria）

| AC番号 | 条件                                                                | 検証方法           |
| ------ | ------------------------------------------------------------------- | ------------------ |
| AC-1   | `create` モードで 5 段階の progress が正しい順序・値で通知される    | vitest             |
| AC-2   | `update` モードで `create` とは異なるメッセージが通知される         | vitest             |
| AC-3   | `collaborative` モードで `generating-agents` フェーズが通知されない | vitest             |
| AC-4   | 全モードで percentage が昇順（0→100）で通知される                   | vitest             |
| AC-5   | 既存の progress テスト 14 個が全て PASS のまま維持される            | vitest run         |
| AC-6   | `pnpm typecheck`（desktop）が PASS                                  | typecheck コマンド |

---

## 5. 苦戦箇所と知見

### 5.1 モード別フェーズ数の違いによる percentage 計算の複雑化

**苦戦した点**: `create` は 5 段階、`update` は 4 段階、`collaborative` は 4 段階と
フェーズ数が異なると、percentage を等分割で自動計算するか、手動で定義するかの判断が難しかった。

**知見**: percentage を定数オブジェクトに明示的に定義する方式（手動設定）を採用する。
理由は以下の通り：

- 等分割自動計算にすると「計画が 10% で完了する」「SKILL.md 生成が 40% で完了する」という
  重みのコントロールができなくなる
- UI 側（プログレスバー）は視覚的に「重い処理が後半に集中している」感を出したい場合があり、
  手動設定の方が UX チューニングに柔軟に対応できる

### 5.2 orchestrate / improve-prompt モードの後回し判断

**苦戦した点**: 全モードを一気に実装しようとしたが、`orchestrate` や `improve-prompt` の
処理フローが未確定のため、フェーズ定義ができなかった。

**知見**: スコープを「フロー確定済みのモード（create / update / collaborative）のみ」に絞り、
`orchestrate` / `improve-prompt` は TASK-SW-STREAM-002 完了後に追加する形にする。
`satisfies` 制約で型安全性を担保しつつ、後続モードを追加しやすい構造にしておく。

---

## 関連リンク

- [TASK-SW-STREAM-001 仕様書](../completed-tasks/p01-par-STREAM-001/index.md)
- [TASK-SW-STREAM-002 仕様書](../completed-tasks/p02-par-STREAM-002/index.md)
- [FUP-02: 進捗定数化](./FUP-SW-STREAM-001-constant-definition.md)
- [SkillCreatorService.ts](../../../../apps/desktop/src/main/services/skill/SkillCreatorService.ts)
