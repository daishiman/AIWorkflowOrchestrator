# Phase 3: 設計レビュー — ConstraintChips

## メタ情報

| 項目       | 値                                                                                    |
| ---------- | ------------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-LIFECYCLE-CONSTRAINT-CHIPS-001                                               |
| Phase      | 3 / 13                                                                                |
| 目的       | Phase 2 の設計ドキュメントを多角的観点からレビューし、PASS / MINOR / MAJOR を判定する |
| 前提成果物 | `outputs/phase-2/design-document.md`（Phase 2 完了済み）                              |
| 成果物     | `outputs/phase-3/design-review-report.md`                                             |

## 目的

Phase 2 で確定した設計（ConstraintChip Props、ConstraintChipList Props、SkillConstraint 型、SkillLifecyclePanel 統合設計、IPC 連携方式、ビジュアルスタイル）が以下の基準を満たしているかを検証する。

1. Atomic Design 原則への準拠
2. 既存 FilterChip との UI 整合性
3. SkillCreatorAPI との IPC 契約整合性
4. WCAG 2.1 AA アクセシビリティ要件
5. Apple HIG カラーパレット準拠

## 参照資料

| 資料                   | パス                                                                                | 参照目的                              |
| ---------------------- | ----------------------------------------------------------------------------------- | ------------------------------------- |
| Phase 2 成果物         | `outputs/phase-2/design-document.md`                                                | レビュー対象の設計仕様                |
| Phase 1 成果物         | `outputs/phase-1/requirements-analysis.md`                                          | 要件との整合性確認                    |
| UI/UX 正本             | `docs/30-workflows/skill-lifecycle-unification/ui-ux-realization.md` L34–38, L52–62 | create ステップ必須UI・状態マトリクス |
| FilterChip atom        | `apps/desktop/src/renderer/components/atoms/FilterChip/index.tsx`                   | UI 一貫性比較                         |
| SkillLifecyclePanel    | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                | 統合設計の妥当性確認                  |
| アーキテクチャルール   | `.claude/rules/01-architecture.md`（Atomic Design・Apple HIG・WCAG 2.1 AA）         | 設計基準                              |
| コード品質ルール       | `.claude/rules/02-code-quality.md`（TypeScript 型安全・boolean プレフィックス）     | 設計品質基準                          |
| IPC セキュリティルール | `.claude/rules/04-electron-security.md`（IPC 契約ドリフト防止）                     | IPC 設計検証                          |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md` P44/P45（IPC インターフェース不整合）          | IPC 設計リスク確認                    |

## 実行手順

### レビュー観点 1: Atomic Design 原則への準拠

**検証対象**: `design-document.md` の ConstraintChip / ConstraintChipList 設計

チェック項目:

- [ ] `ConstraintChip`（atom）が単一の UI 要素（削除可能なタグ chip）のみを担当しているか
  - 合格基準: ConstraintChip が入力フィールドや状態管理ロジックを内包していないこと
- [ ] `ConstraintChipList`（molecule）が複数 atom の組み合わせとして設計されているか
  - 合格基準: ConstraintChipList が ConstraintChip と入力フィールドを組み合わせており、ビジネスロジック（IPC 呼び出し等）を内包していないこと
- [ ] `SkillLifecyclePanel`（organism）が molecule を使用する側として設計されており、molecule の内部詳細に依存していないか
  - 合格基準: SkillLifecyclePanel が `constraints` state と `handleAddConstraint` / `handleRemoveConstraint` を管理し、ConstraintChipList に Props として渡す Controlled パターンが採用されていること

**判定**:

- PASS: 全チェック項目が合格
- MINOR: Controlled パターンが記述されているが、SkillLifecyclePanel 側のコールバック定義が不完全
- MAJOR: ConstraintChipList が IPC 呼び出しや Store 参照を内包している（SRP 違反）

### レビュー観点 2: 既存 FilterChip との UI 一貫性

**検証対象**: Phase 2 設計の「FilterChip との差異」セクション、および ConstraintChip のスタイル設計

チェック項目:

- [ ] ConstraintChip と FilterChip が同一の CSS変数トークンを使用しているか
  - 合格基準: 両コンポーネントが `--status-primary`, `--bg-tertiary`, `--text-primary`, `--border-primary` を共用し、視覚的一貫性が確保されている
- [ ] ConstraintChip の chip 形状（角丸・パディング）が FilterChip と同系のビジュアルを維持しているか
  - 合格基準: 角丸が 8px (`rounded-lg`) または 20px (`rounded-full`) に統一されており、FilterChip の `rounded-full` と混在している場合は理由が明記されている
- [ ] 新規コンポーネントを作成した根拠（FilterChip を再利用しない理由）が設計書に明記されているか
  - 合格基準: 「`isSelected` の意味的差異（トグルフィルター vs 削除可能タグ）」または「`onRemove` ボタンの存在」が差異として記載されている

**判定**:

- PASS: 全チェック項目が合格
- MINOR: スタイルトークンの使用は正しいが、FilterChip との差異の説明が不十分（1行程度の記述のみ）
- MAJOR: ConstraintChip がハードコード hex カラーを使用しており、既存コンポーネントとのテーマ整合性が破綻している

### レビュー観点 3: SkillCreatorAPI との IPC 契約整合性

**検証対象**: Phase 2 設計の「SkillCreatorAPI 連携設計」セクション

チェック項目:

- [ ] 選択肢 A（IPC 引数拡張）を採用した場合、P44/P45 の契約ドリフト防止策が設計に含まれているか
  - 合格基準: Main Process ハンドラ・Preload API・型定義の3箇所を同時更新する設計になっている
  - 合格基準: `constraints` 引数の型（`SkillConstraint[]` vs 文字列配列）がハンドラとPreload 双方で一致している
- [ ] 選択肢 B（文字列埋め込み）を採用した場合、埋め込みフォーマットが確定しているか
  - 合格基準: 埋め込み文字列のフォーマット例（例: `制約条件:\n- 〇〇\n- △△`）が設計書に記載されている
- [ ] 選択した方式の理由（IPC 変更コスト vs 制約条件の構造保持の優先度）が明記されているか

**判定**:

- PASS: 全チェック項目が合格
- MINOR: 選択理由が記載されているが、P44/P45 対策の記述が不十分
- MAJOR: IPC 引数拡張を採用しているが、Preload/Main 双方の型定義更新設計が存在しない（P44 違反リスク）

### レビュー観点 4: WCAG 2.1 AA アクセシビリティ要件

**検証対象**: Phase 2 設計の ARIA 属性設計セクション

チェック項目:

- [ ] `ConstraintChipList` が `role="list"` を持ち、各 `ConstraintChip` が `role="listitem"` を持つ設計になっているか
- [ ] `×` ボタンの `aria-label` が `"${label} を削除"` の形式で確定しているか
- [ ] `ConstraintChipList` の入力フィールドに `aria-label` または `<label>` 要素が設計されているか
  - 合格基準: `aria-label="制約条件を入力"` または対応する `<label>` 要素が存在する
- [ ] キーボード操作設計が完全であるか
  - 合格基準: Enter キーで chip 追加、`×` ボタンに Tab でフォーカス移動 + Enter/Space で削除が設計されている
  - 合格基準: IME 確定中（`isComposing === true`）の Enter キーを無視する設計が明記されている
- [ ] コントラスト比が WCAG 2.1 AA 基準（テキスト 4.5:1 以上）を満たすか
  - 合格基準: `--text-primary` on `--bg-tertiary` の組み合わせが Apple HIG 基準で 4.5:1 以上であること（Apple System Color は基準を満たすことを前提とし、カスタムカラーを使用する場合のみ個別検証を要求する）

**判定**:

- PASS: 全チェック項目が合格
- MINOR: ARIA の一部（`aria-label` の文字列フォーマット等）が未確定だが、Phase 5 実装時に確定可能
- MAJOR: `role="list"` / `role="listitem"` が設計から欠落している、またはキーボード操作設計が存在しない

### レビュー観点 5: Apple HIG カラーパレット準拠

**検証対象**: Phase 2 設計のビジュアルスタイル仕様テーブル

チェック項目:

- [ ] 全スタイルが CSS変数（`var(--〇〇)`）を使用しており、ハードコード hex / rgb 値が存在しないか
- [ ] `--status-primary` が systemBlue（ライト: `#007AFF`, ダーク: `#0A84FF`）に対応する変数として使用されているか
- [ ] Tailwind の `slate-*` 系カラーが使用されていないか（`01-architecture.md` 禁止事項）
- [ ] 背景色に `--bg-tertiary`（`systemGray5`/`tertiarySystemBackground` に相当）が使用されているか

**判定**:

- PASS: 全チェック項目が合格
- MINOR: `slate-*` 系カラーは使用していないが、一部の要素に CSS変数ではなくデフォルト Tailwind カラー（`gray-*` 等）が使用されている
- MAJOR: ハードコード hex カラーが設計に含まれており、ダークモード切替で表示が破綻するリスクがある

## 判定基準

| 総合判定          | 対応                                                                                                     |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| PASS              | Phase 4（テスト作成）へ進む                                                                              |
| MINOR             | 全指摘を `outputs/phase-3/design-review-report.md` に記録し、Phase 2 仕様書を修正した後に Phase 4 へ進む |
| MAJOR（要件問題） | Phase 1 へ戻り要件を再定義する                                                                           |
| MAJOR（設計問題） | Phase 2 へ戻り設計を修正する                                                                             |

MINOR 指摘は「機能影響なし」であっても未タスク化を省略しない（`05-task-execution.md` Phase 10 ルール準拠）。

## 統合テスト連携

Phase 3 はレビューであり、テストコードを作成しない。ただし以下をレビューレポートに記載し、Phase 4 テスト設計に引き継ぐこと。

- レビュー観点 4（アクセシビリティ）で検出した ARIA 設計の確認項目を Phase 4 の ARIA テストケースとして一覧化する
- レビュー観点 3（IPC 契約）で検出したリスク項目を Phase 4 の統合テストケースとして一覧化する

## 多角的チェック観点（レビュー観点の自己評価）

本 Phase のレビュー観点が以下の基準を満たしていることを確認する:

| 評価項目               | 確認内容                                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| 網羅性                 | 5つのレビュー観点が Phase 2 設計の全セクションをカバーしているか                                     |
| 独立性                 | 各レビュー観点が独立した判定基準を持ち、1つの MAJOR が他の観点のスコアに影響しないか                 |
| 判定可能性             | 各チェック項目が「合格基準」を定量的・定性的に明示しており、判定者によるブレが発生しないか           |
| 既知の落とし穴との対応 | P44/P45（IPC 契約ドリフト）、P46（Props 型衝突）、P47（CSS変数テスト）に対応する観点が含まれているか |

## 成果物

### 必須出力ファイル

パス: `docs/30-workflows/skill-lifecycle-unification/tasks/step-07-par-task-10-constraint-chips-create-ui/outputs/phase-3/design-review-report.md`

必須セクション:

1. **総合判定**: PASS / MINOR / MAJOR のいずれか（1行で明記）
2. **レビュー観点別判定テーブル**: 5観点それぞれの判定（PASS/MINOR/MAJOR）と根拠
3. **MINOR 指摘一覧**（該当する場合）: 指摘内容・修正箇所・修正方法を箇条書き
4. **MAJOR 指摘一覧**（該当する場合）: 指摘内容・戻り先 Phase・修正方針
5. **Phase 4 テスト設計への引き継ぎ事項**: ARIA テストケース・IPC 統合テストケース一覧

## 完了条件

- [ ] `outputs/phase-3/design-review-report.md` が作成されている
- [ ] 5つのレビュー観点全てに対して PASS / MINOR / MAJOR の判定が記載されている
- [ ] 総合判定が明記されている
- [ ] MINOR 判定の場合: 全指摘が修正済みであること、または修正内容が Phase 2 仕様書に反映されていること
- [ ] MAJOR 判定の場合: 戻り先 Phase が指定されており、このチェックリストは「MAJOR により差し戻し」として記録される
- [ ] Phase 4 テスト設計への引き継ぎ事項が記載されている

## 次 Phase

Phase 4: テスト作成（総合判定が PASS または MINOR 修正済みの場合のみ進む）

移行条件: 総合判定が PASS、または MINOR 指摘を全て Phase 2 仕様書に反映した後。
