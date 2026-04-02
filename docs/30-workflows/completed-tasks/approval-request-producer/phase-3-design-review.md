# Phase 3: 設計レビューゲート

## メタ情報

| 項目   | 値                        |
| ------ | ------------------------- |
| Phase  | 3                         |
| 機能名 | approval-request-producer |
| 作成日 | 2026-04-01                |

## 目的

Phase 1-2 の要件定義・技術設計を確認し、Phase 4 以降の実装へ進めるゲート判定を行う。PASS / MINOR / MAJOR の戻り先を明示し、simpler alternative の検討結果を記録する。

---

## レビュー結果

| 観点                     | 判定 | 理由                                                                                                                                           |
| ------------------------ | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 問題設定                 | PASS | `TODO(human)` が明示されており、接続が未完成の箇所が特定されている。骨格実装完了済みの確認も P50 チェックで完了している。                      |
| 接続ポイント選択         | PASS | Option A（`HooksFactory.createPreToolUseHook()` 内）採用は既存設計書の判断を引き継いでいる。`mainWindow` 注入済み・単一責務の維持が確認済み。  |
| 変更スコープ             | PASS | producer 本体は `HooksFactory.ts` に集約しつつ、DI 伝搬と既存テスト追従が必要最小限に留まっている。                                            |
| DI チェーン              | PASS | `index.ts` → `agentHandlers` → `ExecutionManager` → `AgentExecutor` → `HooksFactory` の全経路が接続されていることを確認した。                  |
| 型設計                   | PASS | `pushApprovalRequest` の引数型は既存 `approvalHandlers.ts` に合致。追加の型定義は不要。`uuidv4` / `IApprovalGate` は既にインポート済み。       |
| IPC 4 層整合性           | PASS | 既存チャンネル `APPROVAL_REQUEST` の全 4 層（定数定義・ホワイトリスト・ハンドラ登録・Preload API）が整合済み。新規チャンネル追加なし。         |
| 型互換性                 | PASS | `HooksFactory` → `SDKHooks` / `DefaultApprovalGate` → `IApprovalGate` の互換性は `tsc --noEmit` 0 エラーで確認済み（骨格実装完了時に検証）。   |
| simpler alternative 検討 | PASS | "接続なし" のケース（TODO のまま放置）は AC-1〜AC-4 を満たさないため不採用。Option A が変更最小であり採用が妥当。                              |
| テスト可能性             | PASS | `pushApprovalRequest` をモック化して `vi.fn()` で呼び出し有無を検証できる。既存の Vitest テスト資産と整合している。                            |
| リグレッションリスク     | PASS | producer 本体の変更は局所的で、既存 `HooksFactory.test.ts` への影響が最小。`approvalHandlers.ts` は変更しないため IPC 輸送側の回帰リスクなし。 |

---

## 型互換性検証テーブル（Phase 3 確認）

| Factory               | 返す具象型                           | 注入先 Interface                                      | 互換性 |
| --------------------- | ------------------------------------ | ----------------------------------------------------- | ------ |
| `HooksFactory`        | `SDKHooks`（`createHooks()` 戻り値） | `query()` の `hooks` 引数型                           | PASS   |
| `DefaultApprovalGate` | `DefaultApprovalGate`                | `IApprovalGate`（`approvalGate: IApprovalGate` 引数） | PASS   |

同名インターフェース多重定義チェック:

| インターフェース | 確認コマンド例                                                        | 結果                                                       |
| ---------------- | --------------------------------------------------------------------- | ---------------------------------------------------------- |
| `IApprovalGate`  | `grep -rn "interface IApprovalGate" packages/ apps/`                  | 1 箇所のみ（`ApprovalGate.ts`）。型ドリフトなし。          |
| `SDKHooks`       | `grep -rn "interface SDKHooks" apps/desktop/src/main/services/agent/` | 1 箇所のみ（`HooksFactory.ts` 内部定義）。型ドリフトなし。 |

---

## 総合判定

**PASS** — Phase 4 以降の実装に進む。

根拠:

- 変更スコープは producer 本体 + DI 伝搬 + 既存テスト追従に限定され、リグレッションリスクは局所的である
- DI チェーンは既に完結しており、producer を追加することで機能要件を満たせる
- `uuidv4` / `pushApprovalRequest` / `this.mainWindow` / `this.sessionId` は全て既に利用可能な状態
- IPC 4 層整合性チェックで既存チャンネルが全層整合済みを確認済み
- `tsc --noEmit` 0 エラーが骨格実装完了時に確認済み（型安全性担保）

---

## MINOR 追跡テーブル

MINOR 指摘なし（全観点 PASS）。

| MINOR ID | 指摘内容 | 解決予定 Phase | 解決確認 Phase | 備考 |
| -------- | -------- | -------------- | -------------- | ---- |
| -        | -        | -              | -              | なし |

---

## 残課題・注意事項（実装者向け）

| 項目                                               | 内容                                                                                                                                                                                           |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `operationType` の文字列                           | 既存設計書では `"dangerous_command"` だが `HooksFactory.ts` の TODO コメントには `"dangerous_bash_command"` と記載。`"dangerous_bash_command"` を採用する（Bash ツール専用であることを明示）。 |
| 既存テスト `HooksFactory.test.ts` の後方互換       | コンストラクタはすでに `approvalGate` と `sessionId` を受け取る形に変更済み。テストにデフォルト引数またはスタブを渡しているか Phase 4 で確認する。                                             |
| `approvalHandlers.push.test.ts` の現在の PASS 状態 | 既存の helper / channel test として継続利用し、producer の追加では変更しない。                                                                                                                 |

---

## Phase 4 開始条件確認

| 条件                              | 状態 |
| --------------------------------- | ---- |
| Phase 1（要件定義）が完了している | PASS |
| Phase 2（技術設計）が完了している | PASS |
| Phase 3 総合判定が PASS である    | PASS |
| MAJOR 指摘が 0 件である           | PASS |

**Phase 4 への進行を承認する。**

---

## 参照資料

| 資料名                  | パス                        | 説明                 |
| ----------------------- | --------------------------- | -------------------- |
| phase-1-requirements.md | `./phase-1-requirements.md` | FR / NFR / 受入基準  |
| phase-2-design.md       | `./phase-2-design.md`       | 接続ポイント・型設計 |

---

## 成果物

| 成果物       | パス                       | 説明       |
| ------------ | -------------------------- | ---------- |
| レビュー結果 | `phase-3-design-review.md` | 本ファイル |

---

## 完了条件

- [x] Phase 1 の要件が実装可能であることが確認されている
- [x] Phase 2 の設計がリスク・互換性の観点で妥当であることが確認されている
- [x] 総合判定が PASS であり、Phase 4 へ進む理由が明記されている
- [x] 型互換性検証テーブルが確認済みで PASS が記録されている
- [x] MINOR 追跡テーブルが記載されている（指摘なし）
- [x] 残課題・注意事項が実装者向けに列挙されている
- [x] Phase 4 開始条件が全て PASS であることが確認されている
- [x] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 4: テスト作成 → [phase-4-test-creation.md](phase-4-test-creation.md)

## 実行タスク

- current contract の矛盾・漏れ・整合性・依存関係を確認する
- Phase 4 に進めるかを gate 判定する
- 後続 Phase へ渡す修正点を整理する

## 統合テスト連携

- Phase 4 のテスト設計がレビュー結果と一致することを確認する
- Phase 5 の実装がレビュー判定を崩さないことを確認する
