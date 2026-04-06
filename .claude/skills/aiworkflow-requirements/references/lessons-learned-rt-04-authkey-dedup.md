# Lessons Learned（教訓集） / RT-04 AuthKey コンポーネント重複解消

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: auth / settings lessons (AuthKey component dedup / useAuthKeyManagement hook integration)
> 関連タスク: TASK-RT-04-AUTHKEY-COMPONENT-DEDUP-001, Issue #1903

---

## TASK-RT-04-AUTHKEY-COMPONENT-DEDUP-001: AuthKey コンポーネント重複解消（2026-04-06）

### タスク概要

| 項目       | 値                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-RT-04-AUTHKEY-COMPONENT-DEDUP-001                                                                            |
| 目的       | `AuthKeySection` / `ApiKeySettingsPanel` の IPC ロジック重複を解消し、`useAuthKeyManagement` フックに統合する     |
| 完了日     | 2026-04-06                                                                                                        |
| ステータス | 完了                                                                                                              |
| Issue      | #1903                                                                                                             |

---

## L-RT04-001: 二重送信防止パターン（isSubmittingRef）

| 項目       | 内容                                                                                                                                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | Phase 2 設計段階で `isSubmitting` state だけを定義し、`isSubmittingRef` を設けていなかった。React state は非同期更新のため、高速ダブルクリック時に `isSubmitting === false` のまま2回目の IPC 呼び出しが起動されうる    |
| 再発条件   | `isSubmitting` の state チェックだけで排他制御を行った場合。React のバッチ更新タイミングによって state 反映が遅れ、ガードが機能しないウィンドウが発生する                                                              |
| 解決策     | `isSubmittingRef = useRef(false)` を追加し、`handleSave` / `handleDelete` の先頭で `if (isSubmittingRef.current) return false` を実行。ref 書き込みは同期的に反映されるためガードが確実に機能する                        |
| 標準ルール | 非同期処理の排他制御は `useRef` による同期フラグと state による表示フラグの2本立てで行う。state 単独の排他制御は React のバッチ更新で破綻しうるため使用禁止                                                              |
| 関連タスク | TASK-RT-04-AUTHKEY-COMPONENT-DEDUP-001                                                                                                                                                                                |

---

## L-RT04-002: useAuthKeyManagement フック統合パターン

| 項目       | 内容                                                                                                                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | `AuthKeySection` と `ApiKeySettingsPanel` がそれぞれ独立して IPC 呼び出し・状態管理ロジックを保持しており、同一ロジックが2箇所に存在していた。どちらか一方を修正しても他方に反映されないドリフトが発生しやすい状態だった                |
| 解決策     | 以下の4点を統合した `useAuthKeyManagement` フックを新規作成し、両コンポーネントから呼び出す形に変更した                                                                                                                                    |
|            | 1. **IPC 呼び出し集約**: `authKey.exists()` / `authKey.set()` / `authKey.delete()` をフック内に集約。コンポーネントは IPC を直接呼ばない                                                                                                   |
|            | 2. **onStatusChange コールバック**: `useEffect` で `onStatusChangeRef` に保存し、状態変化時に呼び出す。ref 保持により stale closure を回避しつつ、コールバック参照変化による依存配列の爆発を防ぐ                                          |
|            | 3. **isSubmittingRef 排他制御**: L-RT04-001 記載のパターンを採用。`handleSave` / `handleDelete` 両方で共有する単一の ref を使用                                                                                                           |
|            | 4. **refresh 返却値 boolean 化**: `refresh()` が `Promise<boolean>` を返すことで、delete 後に `await refresh()` し、失敗時に `apiError` を設定する連鎖処理を表現できる                                                                  |
| 標準ルール | 複数コンポーネントで同一 IPC を呼ぶ場合は共通フックに集約する。フックの返却値には成功/失敗を示す boolean を含め、呼び出し元が後続処理を制御できるようにする                                                                                 |
| 関連タスク | TASK-RT-04-AUTHKEY-COMPONENT-DEDUP-001                                                                                                                                                                                                     |

---

## L-RT04-003: check-failed + apiError の二層設計

| 項目       | 内容                                                                                                                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | 旧 `AuthKeySection` では `status="check-failed"` をステータスバッジに表示するのみで、`apiError` メッセージを表示していなかった。ユーザーは「確認失敗」と表示されても何が原因かわからない状態だった  |
| 設計判断   | `check-failed` 時は `apiError` に「ステータスの確認に失敗しました」を設定し、バッジとエラーメッセージの両方を表示する二層設計を採用した                                                           |
|            | - **第1層（ステータスバッジ）**: `status` ベースで大分類（check-failed / error / configured 等）を常時表示                                                                                        |
|            | - **第2層（apiError メッセージ）**: 具体的なエラー内容をインラインメッセージとして表示。`displayMessage = successMessage ?? validationError ?? apiError` の優先順で決定                            |
| 標準ルール | IPC 失敗系のステータス（`check-failed` / `error`）では必ず `apiError` も設定する。バッジだけではユーザーに対する説明が不足する。validationError と apiError は独立した state として保持し優先順位で統合する |
| 関連タスク | TASK-RT-04-AUTHKEY-COMPONENT-DEDUP-001                                                                                                                                                             |

---

## L-RT04-004: ApiKeyStatus への check-failed 追加 — 型拡張の同一 wave 更新

| 項目       | 内容                                                                                                                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `packages/shared/src/types/skillCreator.ts` の `ApiKeyStatus` は `not_set / validating / configured / error` の4値しか持たず、`AuthKeySection` ローカルの `"check-failed"` に対応できていなかった |
| 解決策     | `ApiKeyStatus` に `"check-failed"` を追加し、shared 型を拡張。フック / コンポーネント / テストを同一 wave で更新することで typecheck エラーをゼロに維持した                                   |
| 標準ルール | shared 型の union 拡張は「型定義 → フック実装 → コンポーネント → テスト」を同一 PR/wave 内で完結させる（TASK-RT-02 の L-RT02-004 と同パターン）                                               |
| 関連タスク | TASK-RT-04-AUTHKEY-COMPONENT-DEDUP-001                                                                                                                                                       |

---

## L-RT04-005: ApiKeySettingsPanel 委譲パターン — 廃止より先に委譲

| 項目       | 内容                                                                                                                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `ApiKeySettingsPanel` を即座に削除すると、`SkillLifecyclePanel` 等の呼び出し元を同時に変更する必要があり、スコープが拡大しすぎる                                                                                  |
| 解決策     | まず `ApiKeySettingsPanel` を `AuthKeySection` のラッパー（委譲パターン）に変更し、実装の重複を即時解消。廃止（TASK-RT-04-APIKEYPANEL-REMOVAL-001）は別タスクとして backlog に積む                               |
| 標準ルール | コンポーネント廃止はスコープが広がりやすいため、まず委譲パターンで重複解消し、廃止は独立タスクとして扱う。委譲後の廃止タスクは backlog に明記し、drift（委譲のまま放置）を防ぐ                                    |
| 関連タスク | TASK-RT-04-AUTHKEY-COMPONENT-DEDUP-001, TASK-RT-04-APIKEYPANEL-REMOVAL-001                                                                                                                                      |

---

## 応用候補

以下のフックは `useAuthKeyManagement` と同様の課題（IPC 呼び出し重複・排他制御漏れ・apiError 未表示）を抱えている可能性がある。同パターンでリファクタリングを検討すること。

| フック候補                      | 根拠                                                                               |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| `useWorkspaceManagement`        | Workspace の作成/削除 IPC が複数コンポーネントから呼ばれている可能性               |
| `useProviderKeyManagement`      | LLM プロバイダキーの保存/削除ロジックが `ApiKeyStatus` と同様の状態管理を持つ可能性 |

---

## esbuild バイナリ問題（参照のみ）

worktree 環境での esbuild バイナリプラットフォーム不一致による vitest 実行ブロッカーは、このタスクでも遭遇したが、対処法は既記録のため詳細は以下を参照：

- [`lessons-learned-sdk-session-bridge-vitest-worktree.md`](lessons-learned-sdk-session-bridge-vitest-worktree.md)
