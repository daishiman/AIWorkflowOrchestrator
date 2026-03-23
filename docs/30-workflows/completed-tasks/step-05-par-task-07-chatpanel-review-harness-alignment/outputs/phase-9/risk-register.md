# Phase 9 品質検証: リスク登録簿

- タスク ID: TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001
- 作成日: 2026-03-23
- フェーズ: Phase 9 - 品質検証

---

## 目的

ChatPanel review harness alignment 設計タスクにおいて識別されたリスクを登録・管理する。
各リスクには影響度（High / Medium / Low）、発生確率（High / Medium / Low）、
mitigation（軽減策）、および後続タスク完了後の residual risk を記録する。

---

## Risk-1: openTerminal IPC 未実装の可能性（MINOR-A）

### リスク概要

Phase 3 設計レビューで MINOR-A として指摘された通り、
`app:open-terminal` IPC channel が Main Process に登録されているかどうかが未確認である。
後続実装タスクで `handleOpenTerminal` を配線しようとした際、
channel が存在しない場合はユーザー操作が完全に失敗する。

### リスク属性

| 属性         | 値                                                                                   |
| ------------ | ------------------------------------------------------------------------------------ |
| リスク ID    | RISK-1                                                                               |
| 関連 GAP     | GAP-04                                                                               |
| 関連 MINOR   | MINOR-A                                                                              |
| 影響度       | High（handoff 状態でターミナルが開けない場合、ユーザーワークフローが完全に停止する） |
| 発生確率     | Medium（他の IPC handler が既存実装に存在する可能性があるが未確認）                  |
| リスクスコア | High × Medium = HIGH                                                                 |

### Mitigation（軽減策）

1. **実装前確認（必須）**: 後続実装タスクの Phase 5 着手前に以下を確認する
   ```bash
   grep -rn "open-terminal\|openTerminal" apps/desktop/src/main/
   grep -rn "open-terminal\|openTerminal" apps/desktop/src/preload/
   ```
2. **未実装の場合**: IPC handler を新規作成する（設計書の IPC contract checklist を遵守）
3. **channel 名の統一**: `IPC_CHANNELS` 定数に `APP_OPEN_TERMINAL = 'app:open-terminal'` を追加
4. **Preload allowlist 追加**: `app:open-terminal` を `allowedChannels` に追加
5. **3段バリデーション追加**: P42 準拠のバリデーションをハンドラに実装

### Residual Risk

Mitigation 実施後の残存リスク: **Low**

- channel が Main Process に存在しない場合は新規実装で解消
- Preload allowlist への追加は機械的な作業であり、実装リスクは低い
- ただし、OS 依存（macOS 専用 API）の場合はクロスプラットフォーム対応が必要（別リスク）

---

## Risk-2: 子コンポーネント Props 型に required callback がない場合の no-op 再発リスク

### リスク概要

後続実装タスクで handler 配線を完了しても、子コンポーネント（`ComposerPanel`、
`BlockedBanner`、`HandoffBanner`）の Props 型が callback を `optional`（`?`）として
定義している場合、ChatPanel で callback を渡し忘れても TypeScript エラーが発生しない。
この場合、no-op（実質的に `undefined` call）が再発する可能性がある。

### リスク属性

| 属性         | 値                                                         |
| ------------ | ---------------------------------------------------------- |
| リスク ID    | RISK-2                                                     |
| 関連 GAP     | GAP-01〜04                                                 |
| 関連 MINOR   | MINOR-B（ChatPanelProps role 型追加の要否再評価）          |
| 影響度       | Medium（機能不全だが、アプリがクラッシュするわけではない） |
| 発生確率     | Low（今回の設計で `required` にする方針を明記している）    |
| リスクスコア | Medium × Low = MEDIUM                                      |

### Mitigation（軽減策）

1. **Props 型の `required` 化**: 後続実装タスクで子コンポーネントの callback Props を
   `required`（`?` なし）に変更する。ただし、MINOR-B の評価（ChatPanelProps role 型
   追加の要否）と合わせて判断する
2. **ESLint ルール**: `@typescript-eslint/no-empty-function` を有効化し、
   空の callback を渡した場合に警告を出す
3. **型ガード**: `handleSendMessage` 等の callback を `NonNullable` で型付けする
4. **テスト**: 後続実装タスクの Phase 4 で「callback が呼び出されること」を
   アサートするテストを作成する

```typescript
// 推奨: required callback（'?' なし）
interface ComposerPanelProps {
  onSendMessage: (message: string) => void; // required
  onCancelStream: () => void; // required
}

// 非推奨: optional callback（no-op 再発リスク）
interface ComposerPanelProps {
  onSendMessage?: (message: string) => void; // optional → 渡し忘れ可能
  onCancelStream?: () => void; // optional → 渡し忘れ可能
}
```

### Residual Risk

Mitigation 実施後の残存リスク: **Low**

- `required` 化と ESLint ルールの組み合わせで型レベルで防止できる
- ただし、Props 型変更は BC break であるため、影響範囲調査が必要

---

## Risk-3: 依存タスク（Task03-06）の Phase 2 変更による Drift

### リスク概要

本タスクは並列実行タスク群（Step-05 の Task01〜Task10）の一部として実行されている。
依存タスク（特に Task03〜06: mainline 側の変更を伴うタスク）が Phase 2 設計を変更した場合、
本タスクの以下の設計が drift する可能性がある。

- 8 state union の定義（mainline の chatSlice と連動）
- IPC channel 名（mainline で変更された場合）
- Lane 境界の定義（mainline が別 Lane に移行した場合）

### リスク属性

| 属性         | 値                                                            |
| ------------ | ------------------------------------------------------------- |
| リスク ID    | RISK-3                                                        |
| 依存タスク   | Task03, Task04, Task05, Task06（推定）                        |
| 影響度       | High（state union が変更されると 8 state 全体の再設計が必要） |
| 発生確率     | Low（並列タスクは設計変更を避ける傾向がある）                 |
| リスクスコア | High × Low = MEDIUM                                           |

### Mitigation（軽減策）

1. **事前合意**: 並列タスクのコーディネーターに「chatSlice の state union と
   IPC channel 名を変更しないこと」を事前に合意する
2. **変更通知プロトコル**: Task03-06 の担当が state union を変更した場合は、
   本タスクのレビュアーに通知する（PR レビューで確認）
3. **Phase 10 での整合確認**: 最終レビューで並列タスクの成果物との整合性を確認する
4. **drift 検出スクリプト**: 後続実装タスクの Phase 9 で以下を実行する
   ```bash
   grep -rn "ChatState\|chatState" apps/desktop/src/ | grep -v ".test.ts"
   ```

### Residual Risk

Mitigation 実施後の残存リスク: **Low**

- PR レビュープロセスで drift は検出可能
- state union の変更は型エラーとして TypeScript が検出する

---

## リスクサマリー

| リスク ID | 概要                         | 影響度 | 発生確率 | スコア | Residual |
| --------- | ---------------------------- | ------ | -------- | ------ | -------- |
| RISK-1    | openTerminal IPC 未実装      | High   | Medium   | HIGH   | Low      |
| RISK-2    | no-op 再発（Props optional） | Medium | Low      | MEDIUM | Low      |
| RISK-3    | 依存タスク変更による drift   | High   | Low      | MEDIUM | Low      |

**要対応**: RISK-1 は後続実装タスクの Phase 5 着手前に必ず確認すること

---

## ウォッチリスト（追跡事項）

以下の事項は現時点では「リスク」には分類しないが、後続フェーズで注意が必要である。

| 事項                  | 観察ポイント                                            | 確認タイミング         |
| --------------------- | ------------------------------------------------------- | ---------------------- |
| macOS 専用 API の使用 | `openTerminal` が `open` コマンドか `shell.openPath` か | 後続実装タスク Phase 5 |
| React.memo の適用要否 | 子コンポーネントの再レンダー頻度                        | 後続実装タスク Phase 6 |
| MINOR-B の決定        | ChatPanelProps に `role` 型を追加するか否か             | unassigned-task で管理 |
