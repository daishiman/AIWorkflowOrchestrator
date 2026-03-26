# [#1617] "[TASK-IMP-SKILLCENTER-HEADER-CTA-RESPONSIVE-001] SkillCenterView ヘッダー CTA レスポンシブ対応"

## メタ情報

```yaml
task_id: TASK-IMP-SKILLCENTER-HEADER-CTA-RESPONSIVE-001
task_name: SkillCenterView ヘッダー CTA レスポンシブ対応
category: UI改善
target_feature: SkillCenterView ヘッダー CTA
priority: LOW
scale: XS（1行変更）
status: unassigned
source_phase: TASK-SKILL-LIFECYCLE-02 Phase 10 MINOR-01
created_date: 2026-03-18
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-imp-skillcenter-header-cta-responsive-001.md
```

| 項目       | 内容          |
| ---------- | ------------- |
| 優先度     | LOW           |
| 規模       | XS（1行変更） |
| ステータス | unassigned    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SKILL-LIFECYCLE-02（SkillCenter 新規作成ルート）の実装において、SkillCenterView のヘッダー領域に「+ 新規作成」CTA ボタンを追加した。Phase 10（最終レビュー）の AC-7（モバイル対応 768px 未満）検証で、ヘッダー CTA のテキスト「新規作成」にレスポンシブ対応クラス `hidden md:inline` が未適用であることが MINOR-01 として検出された。

設計仕様（`ui-ux-navigation.md` v1.7.7）では、768px 未満の画面幅ではテキストを非表示にしアイコンのみ表示する方針が定められている。現在の実装（`index.tsx` L394）では `<span>新規作成</span>` がそのまま記述されており、画面幅に関わらずテキストが常時表示される状態になっている。

### 1.2 問題点・課題

- `apps/desktop/src/renderer/views/SkillCenterView/index.tsx` L394 の `<span>新規作成</span>` に `hidden md:inline` クラスが付与されていない
- 768px 未満の画面幅でもテキスト「新規作成」が表示され続けるため、設計仕様との差異が存在する
- Electron デスクトップアプリでは最小ウィンドウサイズの制約により実質的な UI 影響はないが、コードと仕様の整合性が取れていない

### 1.3 放置した場合の影響

- **短期**: Electron デスクトップ環境に限定される現時点では、ユーザー体験への影響はない
- **中期**: 将来的な Web 版（`apps/web`）への展開時に、768px 未満の画面幅でヘッダー CTA が過密表示となり、タッチターゲットの確保やレイアウト崩れの対応が必要になる
- **長期**: 設計仕様との差異が放置されたまま蓄積すると、他の CTA 実装時にも同様のレスポンシブ対応漏れが発生するリスクがある

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillCenterView ヘッダーの「+ 新規作成」CTA ボタンのテキスト表示を、設計仕様に準拠したレスポンシブ対応にする。768px 未満ではアイコン（`+`）のみ表示し、768px 以上ではアイコンとテキスト「新規作成」の両方を表示する。

### 2.2 最終ゴール

- ヘッダー CTA のテキスト「新規作成」が、768px 未満で非表示・768px 以上で表示されること
- `+` アイコンは画面幅に関わらず常時表示されること
- 設計仕様（`ui-ux-navigation.md` v1.7.7）との差異が解消されること

### 2.3 スコープ

| 対象       | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| スコープ内 | `index.tsx` のヘッダー CTA テキスト span 要素へのクラス追加 |
| スコープ外 | JourneyPanel 内 CTA のレスポンシブ対応（既に対応済み）      |
| スコープ外 | CTA ボタンのスタイル・色・サイズ変更                        |

---

## 3. どう実装するか（How）

### 3.1 対応方針

`<span>新規作成</span>` に `className="hidden md:inline"` を追加する。Tailwind CSS の `hidden` で既定非表示とし、`md:inline`（768px 以上）でインライン表示に切り替える。1行の変更で完結する。

### 3.2 修正箇所

| ファイル                                                    | 行   | 修正内容                                          |
| ----------------------------------------------------------- | ---- | ------------------------------------------------- |
| `apps/desktop/src/renderer/views/SkillCenterView/index.tsx` | L394 | `<span>` に `className="hidden md:inline"` を追加 |

### 3.3 修正案（コード例）

```tsx
// Before（現在の実装）
<span>新規作成</span>

// After（修正後）
<span className="hidden md:inline">新規作成</span>
```

---

## 4. 関連する苦戦箇所・Pitfall

- **AC-7 モバイル対応のレビュー精度**: Phase 10 で MINOR として検出されたが、Electron デスクトップアプリでは実質影響がなく、対応の優先度判断が難しかった。`hidden md:inline` の1行追加で解決する修正であるにもかかわらず、「影響が小さいが設計仕様との差異」をどう扱うかという運用上の判断に苦戦した。Phase 10 MINOR 判定の場合は例外なく未タスク仕様書に変換し、Phase 11 手動テストへ進む運用を確立することで再発を防止する
- **参照 Pitfall**: なし（新規パターン）
- **解決策**: MINOR 判定は影響の大小に関わらず必ず未タスク仕様書に変換する運用を徹底する。Phase 10 の MINOR 指摘は「修正不要」ではなく「即時修正は不要だが記録・追跡が必要」という意味である

---

## 5. 受入基準

- [ ] 768px 未満の画面幅でヘッダー CTA のテキスト「新規作成」が非表示になること
- [ ] 768px 以上の画面幅でヘッダー CTA のテキスト「新規作成」が表示されること
- [ ] `+` アイコンは画面幅に関わらず常時表示されること
- [ ] 既存テスト（`SkillCenterView.cta.test.tsx` 26テスト）が全て PASS すること
- [ ] TypeScript 型チェック・ESLint がエラー 0件であること

---

## 6. 参照

### 6.1 システム仕様書

- `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`（v1.7.7）- SkillCenterView のレスポンシブ対応仕様
- `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-routing-render-view-foundation.md` - ViewType 基盤設計
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-core.md`（S20: データ駆動 CTA 設計パターン）- CTA のデータ駆動設計パターン

### 6.2 ルール・規約

- `.claude/rules/01-architecture.md` - 8px グリッドスペーシング、Apple HIG 準拠
- `.claude/rules/06-known-pitfalls.md` - 関連 Pitfall

### 6.3 タスク成果物

- `docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-02-skillcenter-create-route/outputs/phase-10/final-review-report.md` - MINOR-01 検出元レポート
