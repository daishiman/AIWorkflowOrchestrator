# Phase 12: スキルフィードバック — UT-SDK-L34-UI-DISPLAY-SEVERITY-FILTER-001

||||||| Stash base

# Phase 12: スキルフィードバック — TASK-SDK-SC-02

# Phase 12: スキルフィードバック — TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001

## 学び

1. `filterChecksBySeverity` をコンポーネント外の純粋関数として定義したことで、useMemo の依存配列が最小化でき、テスト容易性も向上した
2. `filteredChecksByLayer` を `checksByLayer` の下流に配置するデータフロー設計により、既存の Layer grouping ロジックへの変更ゼロでフィルタを実装できた
3. `severityTotalCounts` をフィルタ前の `checksByLayer` から計算することで、件数バッジが常に「全体件数」を示す直感的な UI になった
4. `activeWorkflowId` 変更時の `useEffect` でフィルタリセットを実装することで、reverify 維持と workflow 切替リセットの両立が自然に実現できた
   ||||||| Stash base
5. Session Bridge 型（`UserInputQuestion`/`UserInputAnswer`）と Workflow 型（`SkillCreatorUserInputRequest`/`InterviewUserAnswer`）の 2 系統が存在する場合、ブリッジ層のマッピング関数は Organism コンポーネント内に閉じ込めるのが安全。型変換の責務が分散すると IPC 境界でのデバッグが困難になる。
6. `multi_select` の「その他（自由入力）」は `selectedValues` 経路として扱い、`selectedOptionIds` とは別系統にすることで、ブリッジでの正規化が明確になる。mixed（選択肢 + 自由入力）を 1 つの配列に混ぜると型安全性が崩れる。
7. `key={questionIndex}` による React コンポーネント再マウントパターンは、前の質問の内部状態を持ち越さない簡潔な手法。ただし、アニメーション付きの場合は `key` 変更のタイミングに注意が必要。
8. `useReducer` の Action 型を discriminated union にすると、不正な状態遷移がコンパイル時に検出できる。`ANSWER_SUBMITTED` のような中間状態が不要な場合は早期に削除して状態機械をシンプルに保つべき。
9. Atom / Molecule / Organism の責務分離により、`ChoiceButton` / `FreeTextInput` は QuestionCard の kind に依存せず独立テスト可能。テストカバレッジの向上にも直結する。

10. `task-workflow.md` は index であり、運用状態は `task-workflow-completed.md` / `task-workflow-backlog.md` に置くほうが分かりやすい。
11. adapter-degraded execute result は shared type で公開し、renderer 側は type guard で message だけを消費する構造が安定している。
12. execute ack だけが返る経路でも `getWorkflowState()` の再読込で failure を拾えるため、UI の取りこぼしを減らせる。
13. improve 失敗時の snapshot は `recordImproveFailure()` に寄せて phase 遷移の正当性を保つべき。
14. NON_VISUAL task でも `manual-test-result.md` と `manual-test-report.md` を current facts に更新しないと、旧 screenshot 証跡が残って見える。
15. Phase 10 の MINOR 指摘は prose のまま残さず、backlog row として早めに formalize したほうが追跡しやすい。

## next action

特になし（本タスクスコープで完結）。
||||||| Stash base

- Session Bridge 型と Workflow 型のブリッジパターンを他の IPC 通信箇所にも適用する
- `multi_select` の「その他」フロー（selectedValues 経路）をインテグレーションテストで E2E 検証する
- Atom コンポーネントの Storybook 登録（将来の Phase で対応）

- 2 件の Phase 10 follow-up を backlog で継続管理する
- `executeAsync()` の snapshot 伝搬統一は follow-up task として継続する
- ack 後 snapshot 再読込の検証ケースを Phase 4 テンプレートへ反映する
- 以後の adapter error 系更新は shared type / system spec / outputs を同 wave で揃える
