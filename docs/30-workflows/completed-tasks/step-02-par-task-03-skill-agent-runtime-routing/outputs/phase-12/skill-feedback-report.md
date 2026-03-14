# スキルフィードバックレポート: runtime ルーティング再監査

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| タスクID   | TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001 |
| Phase      | 12                                       |
| 作成日     | 2026-03-14                               |
| ステータス | completed                                |

## 1. 良かった点

- runtime 関連クラスを関心ごと分離で追加できている（Resolver/Builder/CreatorFacade）。
- `SkillExecutor` / `AgentExecutor` 側は `RuntimeDecision` 受け口まで拡張済み。
- Phase 11 の画面証跡を4枚取得し、validator に必要な TC-ID/証跡トレーサビリティを整備できた。

## 2. 主要ギャップ

1. **配線ギャップ**

- Main IPC 層で resolver を起点にしておらず、runtime 分岐が実行時に有効化されていない。

2. **契約ギャップ**

- `creatorHandlers.ts` の新規チャンネルが preload 公開APIまで接続されていない。

3. **UIギャップ**

- `TerminalHandoffCard` が未使用で、handoff UI 契約を実画面で検証できない。

4. **ドキュメントギャップ（是正済み）**

- 「設計専用・実装なし」記述が残っていたため、実装あり/未配線を分離して記録し直した。

## 3. 再発防止ルール

- Rule-1: 「クラス追加」と「実行導線配線」を別タスクに分けず、同一フェーズで完了判定する。
- Rule-2: Phase 11 は screenshot の有無だけでなく、対象状態へ遷移できたかを必ず判定列に残す。
- Rule-3: Phase 12 は `implementation-guide` validator を早期実行し、10項目不足を先に潰す。

## 4. 次アクション

- formalize 済み未タスクを実行して runtime 統合を閉じる。
  - `UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001`
- 統合後に Phase 11 を再撮影し、TC-11-01/02/04 の `BLOCKED` を解消する。

## 5. skill-creator への改善反映（今回実施）

- `phase12-task-spec-recheck-template.md` に、`audit --target-file` の JSON を一時ファイル保存して `scope.currentFiles=1` を確認する手順を追加した。
- 未タスク個別合否の完了条件を `currentViolations=0` だけでなく `scope.currentFiles=1` まで拡張した。
- これにより、`audit --json` 大容量出力による parse 不安定時でも再確認判定のドリフトを防止できる。
