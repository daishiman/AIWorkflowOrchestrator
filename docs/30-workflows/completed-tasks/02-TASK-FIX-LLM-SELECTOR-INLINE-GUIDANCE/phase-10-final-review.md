# Phase 10: 最終レビュー

## メタ情報

| 項目       | 値                                                 |
| ---------- | -------------------------------------------------- |
| Phase番号  | 10                                                 |
| 機能名     | LLMモデル選択インラインガイダンス追加              |
| タスクID   | TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE              |
| 作成日     | 2026-03-20                                         |
| ステータス | 作成済み                                           |
| 依存       | [Phase 9 品質検証](./phase-9-quality-assurance.md) |

## 目的

実装全体を多角的観点（要件充足・設計整合性・コード品質・セキュリティ・アクセシビリティ）でレビューし、Phase 11（手動テスト）への進行可否を判定する。

## 実行タスク

### Task 1: 要件充足確認

Phase 1 の機能要件（FR-1〜FR-3）と実装の対応関係を確認する。

| 要件ID | 要件内容                                 | 実装箇所                                   | 充足確認 |
| ------ | ---------------------------------------- | ------------------------------------------ | -------- |
| FR-1-1 | モデル未選択時ガイダンスバナーを表示     | LLMGuidanceBanner.tsx                      | -        |
| FR-1-2 | バナーに未選択メッセージを表示           | LLMGuidanceBanner.tsx                      | -        |
| FR-1-3 | バナーに「設定画面へ」ボタンを表示       | LLMGuidanceBanner.tsx                      | -        |
| FR-1-4 | モデル選択後バナーを自動非表示           | LLMGuidanceBanner.tsx（条件レンダリング）  | -        |
| FR-2-1 | GuidanceBlock に設定画面遷移ボタンを追加 | WorkspaceChatPanel.tsx                     | -        |
| FR-2-2 | ボタンクリックで Settings 画面へ遷移     | WorkspaceChatPanel.tsx                     | -        |
| FR-3-1 | 両画面から Settings 画面へ直接遷移できる | ChatView/index.tsx, WorkspaceChatPanel.tsx | -        |

### Task 2: 設計整合性確認

| チェック項目                                | 判定 | 備考 |
| ------------------------------------------- | ---- | ---- |
| Renderer 層のみの変更（IPC 追加なし）       | -    | -    |
| 個別セレクタ使用（合成 Hook なし、P31対策） | -    | -    |
| LLMSelectorPanel との機能重複がない         | -    | -    |
| コンポーネント依存方向が一方向              | -    | -    |
| GuidanceBlock Props 拡張が後退互換          | -    | -    |

### Task 3: 非機能要件確認

| 要件ID | 要件内容                        | 実装確認                 | 判定 |
| ------ | ------------------------------- | ------------------------ | ---- |
| NFR-1  | Apple HIG 準拠 UI               | カラー・スペーシング確認 | -    |
| NFR-2  | systemBlue アクセントカラー使用 | CSS クラス確認           | -    |
| NFR-3  | アニメーション 200-300ms        | transition-duration 確認 | -    |
| NFR-4  | コントラスト比 4.5:1 以上       | -                        | -    |
| NFR-5  | Zustand 個別セレクタ使用        | -                        | -    |

### Task 4: アクセシビリティ確認

| チェック項目                             | 基準                        | 判定 |
| ---------------------------------------- | --------------------------- | ---- |
| バナーに `role="alert"` が設定されている | 属性存在確認                | -    |
| ボタンが tab キーでフォーカス可能        | focusable 要素              | -    |
| ボタンに aria-label が設定されている     | テキスト or aria-label 存在 | -    |

### Task 5: コードスキャン

```bash
# non-null assertion の残存確認（P52対策）
grep -n '!' apps/desktop/src/renderer/views/ChatView/LLMGuidanceBanner.tsx
grep -n '!' apps/desktop/src/renderer/views/ChatView/index.tsx
grep -n '!' apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx

# any 型の使用確認
grep -n ': any\|as any' \
  apps/desktop/src/renderer/views/ChatView/LLMGuidanceBanner.tsx \
  apps/desktop/src/renderer/views/ChatView/index.tsx \
  apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx
```

### Task 6: レビュー判定

| 判定     | 条件                         | 対応                                               |
| -------- | ---------------------------- | -------------------------------------------------- |
| PASS     | 全チェックが合格             | Phase 11 へ                                        |
| MINOR    | 機能影響のない軽微な指摘あり | 未タスク仕様書に変換後 Phase 11 へ（**省略不可**） |
| MAJOR    | 機能要件の未充足あり         | 影響範囲に応じて Phase 1-5 へ戻る                  |
| CRITICAL | 要件の根本的な見直しが必要   | Phase 1 へ戻る                                     |

**注意**: MINOR 判定の指摘は「機能影響なし」でも全て未タスク仕様書に変換すること（P56対策含む）。

---

## レビュー結果（実施者が記入）

| 観点             | 判定     | 指摘事項                                               |
| ---------------- | -------- | ------------------------------------------------------ |
| 要件充足         | PASS     | FR-1-1〜FR-3-1 全項目充足確認済み                      |
| 設計整合性       | PASS     | Renderer層のみ、個別セレクタ使用、IPC追加なし          |
| 非機能要件       | PASS     | systemBlue使用、duration-200、8pxグリッド準拠          |
| アクセシビリティ | PASS     | role="alert"、aria-label設定、キーボードフォーカス可能 |
| コードスキャン   | PASS     | any型なし、non-null assertion なし、未使用importなし   |
| **総合判定**     | **PASS** | Phase 11 へ進む                                        |

---

## 参照資料

| ファイル                                                                                  | 用途                                  |
| ----------------------------------------------------------------------------------------- | ------------------------------------- |
| `.claude/rules/05-task-execution.md`                                                      | Phase 10 レビューゲート判定基準       |
| `.claude/rules/01-architecture.md`                                                        | Apple HIG 準拠確認                    |
| `.claude/rules/06-known-pitfalls.md#P52`                                                  | non-null assertion 残存チェック       |
| `.claude/rules/06-known-pitfalls.md#P56`                                                  | 再評価クローズ時の GitHub Issue Close |
| `docs/30-workflows/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/phase-2-design.md`            | 設計意図と責務分離の再確認            |
| `docs/30-workflows/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/phase-5-implementation.md`    | 実装実体と設計差分の照合              |
| `docs/30-workflows/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/phase-9-quality-assurance.md` | Lint / typecheck / test の最終結果    |

## 実行手順

### Step 1: 要件充足確認（Task 1）

### Step 2: 設計整合性確認（Task 2）

### Step 3: 非機能要件確認（Task 3）

### Step 4: アクセシビリティ確認（Task 4）

### Step 5: コードスキャン（Task 5）

### Step 6: レビュー判定（Task 6）

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                 | パス                                                         |
| ---------------------- | ------------------------------------------------------------ |
| レビュー結果記録       | 本ファイル「レビュー結果」セクション                         |
| MINOR 未タスク仕様書群 | `docs/30-workflows/unassigned-task/` 配下（MINOR判定時のみ） |

## 完了条件

- [ ] 要件 FR-1〜FR-3 の全項目が充足確認済み
- [ ] 設計整合性チェックが全項目確認済み
- [ ] 非機能要件 NFR-1〜NFR-5 が確認済み
- [ ] アクセシビリティチェックが完了している
- [ ] non-null assertion の残存スキャンが実行されている
- [ ] レビュー判定（PASS / MINOR / MAJOR / CRITICAL）が記録されている
- [ ] MINOR 判定の場合、指摘事項が全て未タスク仕様書に変換されている

## 次Phase

- PASS / MINOR の場合: [Phase 11: 手動テスト](./phase-11-manual-test.md)
- MAJOR の場合: 影響範囲に応じて Phase 1-5 へ戻る
- CRITICAL の場合: [Phase 1: 要件定義](./phase-1-requirements.md) へ戻る
