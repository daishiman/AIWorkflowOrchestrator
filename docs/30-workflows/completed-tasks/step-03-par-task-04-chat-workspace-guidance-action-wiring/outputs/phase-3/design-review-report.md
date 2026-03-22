# Phase 3: 設計レビュー報告 - Design Review Report

## メタ情報

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| タスクID | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| Phase    | 3                                                  |
| 作成日   | 2026-03-22                                         |

## 1. 設計レビュー結果

### 総合判定: **PASS**

Phase 2 の設計は AC-1〜AC-5 の全要件を充足する設計になっている。以下の MINOR 指摘は後続実装タスクで対応可能であり、Phase 4 着手をブロックしない。

## 2. レビュー観点と判定

### 2.1 CTA 一貫性（AC-1）

| チェック項目                                         | 判定 | 根拠                                                              |
| ---------------------------------------------------- | ---- | ----------------------------------------------------------------- |
| 全 6 blocked reason に primary/secondary CTA が定義  | PASS | BLOCKED_GUIDANCE_MAP が Record<BlockedReason, ...> で型安全に網羅 |
| ChatView と WorkspaceChatPanel で同一メッセージ・CTA | PASS | 両 surface が useBlockedGuidance → BLOCKED_GUIDANCE_MAP を参照    |
| CTA 上限（primary 1 + secondary 1）が守られている    | PASS | GuidanceConfig の型定義で強制                                     |

### 2.2 local runtime 判定排除（AC-2）

| チェック項目                                   | 判定 | 根拠                                                            |
| ---------------------------------------------- | ---- | --------------------------------------------------------------- |
| ChatView が policy DTO 経由で blocked 判定     | PASS | 設計で blockedReason を policy DTO から受け取る構造             |
| WorkspaceChatPanel が local 判定を除去する設計 | PASS | controller.selectedModelId === null を blockedReason に置換     |
| chatSlice.callLLMAPI の window check 方針      | PASS | 本タスクスコープ外、後続タスクへ委譲（scope-definition で明記） |

### 2.3 受け渡し境界（AC-3）

| チェック項目                                | 判定 | 根拠                                            |
| ------------------------------------------- | ---- | ----------------------------------------------- |
| State Ownership が表で定義されている        | PASS | contract-matrix.md の State Ownership テーブル  |
| Action Ownership が表で定義されている       | PASS | contract-matrix.md の Action Ownership テーブル |
| Surface 間の responsibility boundary が明示 | PASS | contract-matrix.md のセクション3                |
| HandoffGuidance DTO shape が定義されている  | PASS | contract-matrix.md のセクション4.2              |

### 2.4 no-op CTA 排除（AC-4）

| チェック項目                                      | 判定 | 根拠                                             |
| ------------------------------------------------- | ---- | ------------------------------------------------ |
| GuidanceBlock の AND ガードが維持される設計       | PASS | 既存実装の AND ガードを維持 + secondary CTA 追加 |
| validation-matrix に no-op 検証テストケースがある | PASS | RG-03: no-op CTA が存在しないこと                |
| 禁止事項リスト (D-04) に no-op が明記             | PASS | contract-matrix.md の禁止事項一覧                |

### 2.5 Settings 到達（AC-5）

| チェック項目                         | 判定 | 根拠                                                         |
| ------------------------------------ | ---- | ------------------------------------------------------------ |
| blocked → Settings が 2 クリック以下 | PASS | primary CTA click → setCurrentView("settings") で 1 クリック |
| 手動テスト MT-02 で検証可能          | PASS | validation-matrix.md MT-02                                   |

## 3. P31/P48 再描画リスクレビュー

| 観点                                            | 判定 | 根拠                                               |
| ----------------------------------------------- | ---- | -------------------------------------------------- |
| useBlockedGuidance が useMemo で参照安定化      | PASS | reason が変わらなければ同一参照を返す              |
| derived array（.filter/.map）を返すセレクタなし | PASS | BlockedReason は単一値、配列ではない               |
| useEffect 依存配列に合成 Hook 戻り値を含まない  | PASS | createGuidanceActionDispatcher は useMemo でラップ |
| GuidanceBlock が React.memo 済み                | PASS | 既存実装で確認済み                                 |

## 4. simpler alternative 再評価

### 代替案: inline mapping（Hook なし、定数だけ）

```typescript
const config = BLOCKED_GUIDANCE_MAP[reason];
```

**再評価結果**: useBlockedGuidance Hook は実質的に `BLOCKED_GUIDANCE_MAP[reason]` のラッパー。Hook を省略して直接 lookup しても同等。ただし Hook にすることで:

1. null safety（reason === null → null 返却）が統一される
2. 将来的に handoff context の注入点として機能する
3. テスト時の spy/mock ポイントになる

**結論**: Hook を維持。ただし実装時に過度な抽象化を避け、Hook 内部は3行以下に保つこと。

## 5. MINOR 指摘事項

| ID   | 指摘                                                           | 追跡先         | 優先度 |
| ---- | -------------------------------------------------------------- | -------------- | ------ |
| M-01 | openTerminal handler が placeholder（Task06 依存）             | 後続実装タスク | 低     |
| M-02 | retryConnection handler の IPC 契約が未定義                    | 後続実装タスク | 低     |
| M-03 | chatSlice の未使用 state (G-04〜G-06) のクリーンアップ方針未定 | 後続タスク     | 低     |
| M-04 | 複数 reason 同時存在時の優先度ロジックが未定義                 | 後続実装タスク | 中     |

全 MINOR は後続実装タスクの未タスク仕様書に変換する（Phase 12 Task 4 で formalize）。

## 6. MAJOR / CRITICAL 指摘事項

なし。
