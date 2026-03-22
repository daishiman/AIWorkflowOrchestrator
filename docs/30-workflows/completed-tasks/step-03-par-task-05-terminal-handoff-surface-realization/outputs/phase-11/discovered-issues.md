# Phase 11 成果物: 発見事項レポート

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| タスクID   | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 |
| Phase      | 11                                                |
| 成果物種別 | 発見事項レポート                                  |
| 作成日     | 2026-03-22                                        |

---

## 重要注記

本タスクは設計タスクのため、Phase 11 での実際のアプリ動作テストは実施していない。本レポートは以下を記録する:

1. 設計レビュー（Phase 3）時点の未解決 MINOR 指摘事項
2. GAP-01〜07 の設計対応状況テーブル
3. 設計レビュー時に発見された潜在的 UI 課題のリスト
4. 後続実装タスクへの引き継ぎ事項

---

## 1. 設計レビュー時点の未解決事項（MINOR 指摘）

| ID   | 指摘内容                                                                       | 発見 Phase | 対応方針                                        | 追跡先         | 解消条件                                                                                              |
| ---- | ------------------------------------------------------------------------------ | ---------- | ----------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------- |
| MN-1 | `toHandoffGuidance()` adapter の配置先が未定義                                 | Phase 3    | Phase 5 で配置先決定（`packages/shared/` 推奨） | 後続実装タスク | adapter が `packages/shared/src/adapters/handoff-adapter.ts` に配置され、全 consumer から import 可能 |
| MN-2 | Terminal Dock の状態遷移で `aborted` state が未定義                            | Phase 3    | Phase 6 edge case で追加                        | 後続実装タスク | `aborted` state の遷移条件・表示・CTA が実装定義に含まれる                                            |
| MN-3 | GuidanceBlock の handoff variant と TerminalHandoffCard の使い分けルールが曖昧 | Phase 3    | Phase 5 で明確な判定条件を記述                  | 後続実装タスク | 「handoff DTO あり → TerminalHandoffCard、guidance-only → GuidanceBlock」のルールが実装に明記される   |

---

## 2. GAP 設計対応状況テーブル

設計タスク開始前に識別された GAP と、本タスクでの設計対応状況を記録する。

| GAP ID | 内容                                              | 設計対応状況 | 対応成果物                     |
| ------ | ------------------------------------------------- | ------------ | ------------------------------ |
| GAP-01 | persistent launcher が設計されていない            | 対応済み     | design-summary.md Concern-A    |
| GAP-02 | HandoffGuidance が統一 DTO として定義されていない | 対応済み     | design-summary.md Concern-B    |
| GAP-03 | Consumer Adapter の migration 戦略が未定義        | 対応済み     | design-summary.md Concern-C    |
| GAP-04 | Manual Boundary が定義されていない                | 対応済み     | contract-matrix.md MB-1〜MB-5  |
| GAP-05 | Screenshot 契約が定義されていない                 | 対応済み     | phase-11/screenshot-plan.json  |
| GAP-06 | AC-1〜AC-4 の受入基準が設計に紐付いていない       | 対応済み     | validation-matrix.md           |
| GAP-07 | Simpler Alternative の検討が未実施                | 対応済み     | design-summary.md セクション 3 |

**結論**: GAP-01〜07 の全設計 GAP が本タスクで対応済み。実装 GAP（MN-1〜MN-3）は後続実装タスクへ引継ぎ。

---

## 3. 設計レビュー時に発見された潜在的 UI 課題

設計フェーズ（Phase 2〜3）のレビューを通じて特定された潜在的 UI 課題を以下に示す。これらは実装時に顕在化する可能性がある。

### UI-ISSUE-1: TerminalHandoffCard の表示領域と既存 UI の競合

**内容**: `TerminalHandoffCard` は「入力欄の上（AgentExecutionControls との間）」に配置される設計だが、Chat Edit surface と Runtime surface で AgentExecutionControls の高さが異なる可能性がある。Card 表示時に入力欄が画面下に押し出されてユーザーが入力しにくくなるリスクがある。

**影響範囲**: TC-MAN-1 / TC-MAN-3

**対応方針**: 後続実装タスクで各 surface の AgentExecutionControls の高さを計測し、Card 表示時のスクロール動作を設計すること

**優先度**: 中（UX 影響あり、機能影響なし）

---

### UI-ISSUE-2: unavailable 状態での tooltip 表示タイミング

**内容**: TC-MAN-9 で検証する `unavailable` 状態の launcher button 上の tooltip について、macOS での hover 遅延（通常 0.5〜1 秒）と iOS 的なロングプレスの両方を考慮する必要がある。設計では表示タイミングが未定義。

**影響範囲**: TC-MAN-9

**対応方針**: 後続実装タスクで tooltip の表示遅延（推奨: 400ms）と表示時間（推奨: 3秒）を明示すること

**優先度**: 低（アクセシビリティ影響あり、機能影響なし）

---

### UI-ISSUE-3: copy フィードバックの表示位置と既存 Toast との競合

**内容**: TC-MAN-2 の copy フィードバック（Toast / アイコン変化）が、アプリ内の既存 Toast 通知システムと競合するリスクがある。同時に複数 Toast が出現した場合の z-index と位置が未定義。

**影響範囲**: TC-MAN-2

**対応方針**: 後続実装タスクでアプリの Toast 管理システム（既存実装）を確認し、copy フィードバックを同一システムに統合すること

**優先度**: 中（UX 影響あり、機能影響なし）

---

### UI-ISSUE-4: guidance-only から integrated への遷移アニメーション

**内容**: TC-MAN-7 で API key を設定後に `guidance-only` → `integrated` に遷移する際の UI 変化について、アニメーション設計が未定義。GuidanceBlock が瞬時に消えて新しい UI が出現すると UX が粗く感じられる。

**影響範囲**: TC-MAN-7

**対応方針**: 後続実装タスクで状態遷移アニメーション（推奨: fade 200ms）を設計すること。Apple HIG の「Deference」原則に従い、コンテンツへの誘導を優先すること

**優先度**: 低（UX 影響あり、機能影響なし）

---

### UI-ISSUE-5: MB-5 の全 surface 検証が TC-MAN-7 と重複する

**内容**: MB-5（guidance-only 判定の正確性）は TC-MAN-7（guidance-only 状態の表示確認）と一部重複する検証を含む。後続実装タスクでは両者を統合するか、明確に分離する必要がある。

**影響範囲**: MB-5 / TC-MAN-7

**対応方針**: 後続実装タスクの手動テスト実行時に、MB-5 を TC-MAN-7 の後で実行し、全 surface 確認のみ MB-5 固有の手順とすること

**優先度**: 低（テスト効率の問題、機能影響なし）

---

## 4. 後続実装タスクへの引き継ぎ事項

### 4.1 実装着手前に確認が必要な設計決定

| 決定事項                         | 設計書所在                  | 重要度 |
| -------------------------------- | --------------------------- | ------ |
| HandoffGuidance 3 フィールド定義 | design-summary.md Concern-B | 必須   |
| Consumer → DTO マッピング表      | design-summary.md Concern-C | 必須   |
| Ownership テーブル               | design-summary.md 2.3       | 必須   |
| 禁止操作テーブル（auto-send等）  | contract-matrix.md          | 必須   |
| IPC 通過型ルール                 | contract-matrix.md          | 必須   |
| 5状態 × 遷移条件 × 禁止事項      | contract-matrix.md 1.1      | 必須   |
| Capability → UiState マッピング  | contract-matrix.md 1.2      | 必須   |

### 4.2 実装時の NFR チェックリスト

後続実装タスクで以下の NFR を満たすことを確認すること:

| NFR ID | 内容                                           | 確認コマンド / 方法                                            |
| ------ | ---------------------------------------------- | -------------------------------------------------------------- |
| NFR-1a | terminalCommand に API key を含まない          | `grep -rn "sk-\|ANTHROPIC_API_KEY" apps/desktop/src/renderer/` |
| NFR-1b | auto-send を行わない                           | Terminal Dock input の default value が空であることを確認      |
| NFR-1c | hidden injection を行わない                    | IPC payload が HandoffGuidance 3 フィールドのみ                |
| NFR-1d | headless execution を行わない                  | ユーザー操作なしで claude process が起動しないことを確認       |
| NFR-1e | terminalCommand に path traversal を含まない   | `sanitizeTerminalCommand()` 関数の実装確認（P55 対策）         |
| NFR-1f | TerminalHandoffBundle を Renderer に公開しない | `grep -rn "TerminalHandoffBundle" apps/desktop/src/renderer/`  |

### 4.3 P42/P55/P62 対策チェックリスト

後続実装タスクで以下のパターンを適用すること:

- **P42**: IPC ハンドラの全文字列引数に `.trim() === ""` チェックを追加（3段バリデーション）
- **P55**: `os.homedir()` 等のパスを正規表現に使う場合は `escapeRegExp()` でエスケープ
- **P62**: Provider/Model が未選択の場合に `DEFAULT_CONFIG` への暗黙 fallback を行わず `assertNoSilentFallback` でエラー

### 4.4 UI 課題への対応方針

上記「3. 設計レビュー時に発見された潜在的 UI 課題」（UI-ISSUE-1〜5）について、後続実装タスクの Phase 5 開始時に各課題の実装対応方針を確認すること。

---

## 5. 既知の制約事項

| 制約                   | 内容                                                                 | 影響範囲                                  |
| ---------------------- | -------------------------------------------------------------------- | ----------------------------------------- |
| Task06 依存            | Terminal Dock の session persistence は Task06 完了後に実装可能      | TC-MAN-6 の検証が Task06 依存             |
| CLI スクリーンショット | Phase 11 での実画面確認が CLI 環境では困難（P53）                    | 後続実装タスクで Playwright 自動化が必要  |
| Electron 未実装        | 設計タスクのため Electron アプリでの実動作確認は後続実装タスクで実施 | 全 TC-MAN・MB の実行が後続依存            |
| unavailable 環境構築   | TC-MAN-9 の検証には CLI ツール除外環境が必要                         | テスト実行時の事前準備（PATH 操作）が必要 |
