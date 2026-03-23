# Phase 1: 要件定義書

## メタ情報

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| タスクID | TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001 |
| Phase    | 1                                                     |
| 作成日   | 2026-03-23                                            |

## 1. 機能要件（FR）

### FR-1: Runtime Lane と Manual Lane の明示的分離

Slide / Modifier の実行パスを以下の 2 lane に分離し、各 lane の責務を明確にする。

| Lane       | 責務                                                  | 入口                        |
| ---------- | ----------------------------------------------------- | --------------------------- |
| integrated | Agent SDK 経由の自動実行（future: Task09 governance） | skill-executor.ts lane 分岐 |
| manual     | ユーザー手動操作（terminal handoff + guidance block） | fallback card CTA           |

### FR-2: Direct SDK Path の整理

`agent-client.ts` の Anthropic SDK 直接呼び出しを以下の方針で整理する。

| 対象               | 方針                                         | タイムライン      |
| ------------------ | -------------------------------------------- | ----------------- |
| agent-client.ts L9 | Agent SDK 統合後に廃止（UT-SLIDE-IMPL-001）  | Task09 後段       |
| SDK import         | `@anthropic-ai/sdk` → Agent SDK adapter 経由 | Task09 governance |

### FR-3: Silent Fallback の明示化

`getApiKey()` の safeStorage → 環境変数 fallback を以下のように変更する。

| 要件                    | 詳細                                         |
| ----------------------- | -------------------------------------------- | ----- | -------------- |
| fallback 発生時の通知   | warning ログ出力（`electron-log` 経由）      |
| capability DTO への反映 | `apiKeySource: "safeStorage"                 | "env" | "none"` を返す |
| Renderer 同期           | capability DTO を IPC 経由で Renderer に提供 |

### FR-4: Slide-Specific UI 4領域の契約定義

SlideWorkspace の 4領域を契約として定義する。

| 領域              | 表示条件                          | CTA                      |
| ----------------- | --------------------------------- | ------------------------ |
| progress row      | 常時表示                          | なし（状態表示のみ）     |
| guidance block    | `degraded` / `guidance` 状態時    | 推奨アクションの提示     |
| fallback card     | `degraded` 状態 + 自動復旧不可時  | "manual fallback を開く" |
| terminal launcher | `guidance` 状態 + terminal 利用時 | "terminal を開く"        |

### FR-5: ModifierResponse の拡張

ModifierResponse に fallback 情報を追加する。

| フィールド         | 型        | 用途                         |
| ------------------ | --------- | ---------------------------- |
| `fallback_reason`  | `string?` | fallback card に表示する理由 |
| `suggested_action` | `string?` | CTA のラベルテキスト         |

## 2. 非機能要件（NFR）

### NFR-1: セキュリティ

- API key は Main Process 内に留める（Renderer に直接渡さない）
- fallback chain の source 情報は capability DTO に限定して開示
- `process.env.ANTHROPIC_API_KEY` の存在は Renderer に直接伝えない

### NFR-2: パフォーマンス

- fallback card の表示遅延: 200ms 以内
- capability DTO の IPC 応答: 100ms 以内

### NFR-3: ガバナンス

- Task09 governance が拾う follow-up ルールを明記する
- legacy path の残存箇所と ownership を追跡可能にする

## 3. 受入基準（AC）詳細化

| ID   | 基準                                                               | 検証方法                                                        |
| ---- | ------------------------------------------------------------------ | --------------------------------------------------------------- |
| AC-1 | Slide / Modifier の runtime lane と manual lane が明示されている   | 設計書に lane 分離表が存在し、各 lane の入口が定義されている    |
| AC-2 | direct SDK / silent fallback の整理順と ownership が定義されている | agent-client.ts の廃止タイムラインと担当タスクID が明記         |
| AC-3 | slide-specific screenshot / walkthrough contract が定義されている  | UX-07 の必須状態（degraded/fallback/guidance）が TC-ID で紐付け |
| AC-4 | Task09 governance が拾う follow-up ルールが明記されている          | follow-up 一覧に governance 観点カラムが存在する                |

## 4. Phase 2 への論点（Concern）

### Concern-1: ModifierResponse 拡張の影響範囲

`modifier-skill.ts` の戻り値型を拡張すると、skill-executor.ts と Renderer 側の消費箇所に波及する。Phase 2 で影響範囲を確認し、変更順序を設計する。

### Concern-2: IPC Namespace 統一のタイミング

legacy channel 名残存と `registerSlideIpcHandlers()` 未接続の解消を Task08 で行うか、Task09 governance に委譲するかを Phase 2 で決定する。

### Concern-3: capability DTO の粒度

`apiKeySource` の開示粒度が過剰にならないよう、Renderer に渡す情報の最小限を Phase 2 で設計する。
