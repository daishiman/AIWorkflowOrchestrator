# Phase 11: 手動テスト — TASK-UI-00-ATOMS

## メタ情報

| 項目               | 値                                             |
| ------------------ | ---------------------------------------------- |
| タスクID           | TASK-UI-00-ATOMS                               |
| Phase              | 11 — 手動テスト                                |
| 前提Phase          | Phase 10（最終レビュー）PASS または MINOR 判定 |
| 成果物ディレクトリ | `task-ui-00-atoms/outputs/phase-11/`           |

## 目的

自動テストでは検証できないビジュアル表示・インタラクション体験・アクセシビリティの実機検証を行う。3テーマ（kanagawa-dragon/light/dark）× 3ブレークポイント（mobile/tablet/desktop）の組み合わせで全7コンポーネントを目視・操作確認する。

## 背景

Atoms コンポーネントは上位の Molecules/Organisms から呼び出されるため、ビジュアルの不備がここで検出されないと、後続タスクで大量の修正が発生する。テーマ切替時のちらつき、アニメーションの不自然さ、フォーカスリングの視認性はユニットテストでは捕捉できない。

## 実行タスク

- 実行方針: 本Phaseで定義した Task セクションを上から順に100%実施する。

### Task 1: テーマ切替テスト

各テーマで全7コンポーネントの表示を確認する。

#### 1-1. テストケーステーブル

| #   | テスト項目                                      | 期待結果                                                 | 結果 | 備考 |
| --- | ----------------------------------------------- | -------------------------------------------------------- | ---- | ---- |
| 1   | kanagawa-dragon で StatusIndicator 6種表示      | 各ステータスが kanagawa-dragon カラーパレットで表示      |      |      |
| 2   | kanagawa-dragon で FilterChip 選択/非選択表示   | 選択時のアクセントカラーが kanagawa-dragon に準拠        |      |      |
| 3   | kanagawa-dragon で Badge primary variant 表示   | primary バリアントが kanagawa-dragon アクセントカラー    |      |      |
| 4   | kanagawa-dragon で SkeletonCard 3バリエーション | パルスアニメーションの背景色が kanagawa-dragon に適合    |      |      |
| 5   | kanagawa-dragon で SuggestionBubble 3サイズ     | ホバー時の背景変化が kanagawa-dragon テーマに調和        |      |      |
| 6   | kanagawa-dragon で EmptyState 3 mood            | 各 mood のイラスト/テキストが kanagawa-dragon で視認可能 |      |      |
| 7   | kanagawa-dragon で RelativeTime 表示            | テキストカラーが kanagawa-dragon テーマに適合            |      |      |
| 8   | light テーマで全7コンポーネント表示             | Apple HIG ライトモード System Colors 適用                |      |      |
| 9   | dark テーマで全7コンポーネント表示              | Apple HIG ダークモード System Colors 適用                |      |      |
| 10  | テーマ切替（light → dark）時のトランジション    | ちらつきなし、300ms以内でスムーズに切り替わる            |      |      |
| 11  | テーマ切替（dark → kanagawa-dragon）時          | CSS変数の即時反映、中間状態が視認されない                |      |      |

### Task 2: レスポンシブテスト

DevTools のデバイスエミュレーションを使用し、3ブレークポイントで確認する。

#### 2-1. テストケーステーブル

| #   | テスト項目                              | 期待結果                                                                       | 結果 | 備考 |
| --- | --------------------------------------- | ------------------------------------------------------------------------------ | ---- | ---- |
| 12  | mobile (<768px) で StatusIndicator      | ドットサイズが仕様値（sm:8px/md:10px/lg:14px）で表示され、テキストが見切れない |      |      |
| 13  | mobile (<768px) で FilterChip           | タッチ領域 44px 以上、テキストが省略されない                                   |      |      |
| 14  | mobile (<768px) で SuggestionBubble     | smサイズ高さ36pxで表示され、横スクロールが発生しない                           |      |      |
| 15  | mobile (<768px) で SkeletonCard         | カード幅がビューポートに収まる                                                 |      |      |
| 16  | tablet (768-1023px) で全7コンポーネント | レイアウト崩れがなく、左右余白が16px以上を維持する                             |      |      |
| 17  | desktop (≥1024px) で全7コンポーネント   | 最大幅制約が適用、余白が呼吸感を持つ                                           |      |      |

### Task 3: インタラクションテスト

#### 3-1. テストケーステーブル

| #   | テスト項目                                        | 期待結果                                            | 結果 | 備考 |
| --- | ------------------------------------------------- | --------------------------------------------------- | ---- | ---- |
| 18  | FilterChip クリックで選択/非選択切替              | `isSelected` 状態が反転、視覚的フィードバックあり   |      |      |
| 19  | FilterChip ホバーで背景色変化                     | ホバー状態が明確に視認できる                        |      |      |
| 20  | SuggestionBubble ホバーで scale 拡大              | `scale(1.02)`〜`scale(1.05)` の控えめな拡大         |      |      |
| 21  | SuggestionBubble クリックで success-bounce        | バウンスアニメーション後に onClick コールバック発火 |      |      |
| 22  | SuggestionBubble アクティブ状態（押下中）         | 押下中は scale がわずかに縮小                       |      |      |
| 23  | StatusIndicator running 時の pulse アニメーション | 脈動が自然で目障りでない、1-2秒の間隔               |      |      |
| 24  | StatusIndicator pulse={false} で停止              | running でも pulse アニメーションが停止             |      |      |
| 25  | SkeletonCard パルスアニメーション                 | 明滅が自然、速すぎず遅すぎない（1-2秒間隔）         |      |      |
| 26  | RelativeTime 時間経過での表示更新                 | 「3秒前」→「1分前」のように自動更新される           |      |      |
| 27  | EmptyState suggestions クリック                   | suggestions 内のアクション要素がクリック可能        |      |      |

### Task 4: キーボード操作テスト

#### 4-1. テストケーステーブル

| #   | テスト項目                                        | 期待結果                                            | 結果 | 備考 |
| --- | ------------------------------------------------- | --------------------------------------------------- | ---- | ---- |
| 28  | SuggestionBubble: Tab でフォーカス移動            | フォーカスリングが明確に表示される                  |      |      |
| 29  | SuggestionBubble: Enter で onClick 発火           | クリックと同じ動作（success-bounce + コールバック） |      |      |
| 30  | SuggestionBubble: Space で onClick 発火           | Enter と同じ動作                                    |      |      |
| 31  | FilterChip: Tab でフォーカス移動                  | フォーカスリングが明確に表示される                  |      |      |
| 32  | FilterChip: Enter で選択切替                      | クリックと同じ動作                                  |      |      |
| 33  | FilterChip: Space で選択切替                      | Enter と同じ動作                                    |      |      |
| 34  | EmptyState action: Tab でフォーカス、Enter で実行 | アクションボタンがキーボード操作可能                |      |      |

### Task 5: アクセシビリティ手動検証

#### 5-1. スクリーンリーダー（VoiceOver）テスト

| #   | テスト項目                             | 期待結果                                            | 結果 | 備考 |
| --- | -------------------------------------- | --------------------------------------------------- | ---- | ---- |
| 35  | StatusIndicator の VoiceOver 読み上げ  | 「ステータス: running」のように状態が読み上げられる |      |      |
| 36  | FilterChip の VoiceOver 読み上げ       | 「{label}, チェックボックス, {選択/未選択}」        |      |      |
| 37  | Badge (number) の VoiceOver 読み上げ   | 「通知 {count}件」が読み上げられる                  |      |      |
| 38  | SkeletonCard の VoiceOver 読み上げ     | 「読み込み中」が読み上げられる                      |      |      |
| 39  | SuggestionBubble の VoiceOver 読み上げ | 「{label}, ボタン」が読み上げられる                 |      |      |
| 40  | RelativeTime の VoiceOver 読み上げ     | 相対時間が正しく読み上げられる                      |      |      |

#### 5-2. コントラスト比検証

| #   | テスト項目                                      | 期待結果                  | 結果 | 備考 |
| --- | ----------------------------------------------- | ------------------------- | ---- | ---- |
| 41  | 全テキスト（通常サイズ）のコントラスト比        | 4.5:1 以上（WCAG 2.1 AA） |      |      |
| 42  | 全テキスト（大サイズ / UI部品）のコントラスト比 | 3:1 以上（WCAG 2.1 AA）   |      |      |
| 43  | StatusIndicator ドットの背景とのコントラスト    | 3:1 以上                  |      |      |
| 44  | FilterChip 非選択時テキストのコントラスト       | 4.5:1 以上                |      |      |

#### 5-3. フォーカスインジケーター

| #   | テスト項目                                | 期待結果                            | 結果 | 備考 |
| --- | ----------------------------------------- | ----------------------------------- | ---- | ---- |
| 45  | SuggestionBubble フォーカスリングの視認性 | 背景色との区別が明確、2px以上の太さ |      |      |
| 46  | FilterChip フォーカスリングの視認性       | 背景色との区別が明確、2px以上の太さ |      |      |
| 47  | 3テーマ全てでフォーカスリングが視認可能   | テーマごとにコントラスト確保        |      |      |

### Task 6: 後方互換性確認

| #   | テスト項目                                     | 期待結果                                        | 結果 | 備考 |
| --- | ---------------------------------------------- | ----------------------------------------------- | ---- | ---- |
| 48  | GlobalNavStrip 内の Badge 表示                 | 既存の表示と同等、レイアウト崩れなし            |      |      |
| 49  | AgentView 内の EmptyState 表示                 | 既存の表示と同等、mood 未指定時はデフォルト動作 |      |      |
| 50  | Badge に variant 未指定で既存と同等の表示      | デフォルト variant が従来の見た目を維持         |      |      |
| 51  | EmptyState に suggestions 未指定で既存動作維持 | suggestions 省略時は従来のレイアウトが表示      |      |      |

## 参照資料

| 参照                     | パス                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------ | --------------- |
| Atoms仕様書              | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/00-2-atoms-components.md`                                 |
| Phase 2 設計成果物       | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/phase-2-design.md`                       |
| Phase 5 実装成果物       | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/phase-5-implementation.md`               |
| Phase 6 テスト拡充成果物 | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/phase-6-test-expansion.md`               |
| Phase 7 カバレッジ成果物 | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/phase-7-coverage-check.md`               |
| Phase 8 リファクタ成果物 | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/phase-8-refactoring.md`                  |
| Phase 9 品質成果物       | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/phase-9-quality-assurance.md`            |
| Phase 10 レビュー結果    | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/outputs/phase-10/final-review-result.md` |
| UIコンポーネント仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                                  |
| UIデザイン原則           | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                                           |
| UIアーキテクチャ         | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                                                |
| a11yテスト基準           | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                                             |
| Apple HIG カラー         | `.claude/rules/01-architecture.md` UI/UX デザイン哲学セクション                                                          |
| WCAG 2.1 AA基準          | コントラスト比 4.5:1（通常テキスト）/ 3:1（大テキスト/UI部品）                                                           |
| 要件-実装整合性検証      | `outputs/phase-10/requirements-implementation-alignment.md`                                                              | Phase 10 成果物 |
| テストカバレッジ総括     | `outputs/phase-10/test-coverage-summary.md`                                                                              | Phase 10 成果物 |
| デザイントークン監査     | `outputs/phase-10/design-token-audit.md`                                                                                 | Phase 10 成果物 |

## 統合テスト連携

- Phase 10 最終レビュー結果の MINOR 指摘がある場合、対象コンポーネントを重点的に手動検証する
- Phase 9 品質検証で報告された警告がある場合、対応する UI 領域を目視確認する

## 成果物

| #   | 成果物                     | パス                                            |
| --- | -------------------------- | ----------------------------------------------- |
| 1   | テーマテスト結果           | `outputs/phase-11/theme-test-result.md`         |
| 2   | レスポンシブテスト結果     | `outputs/phase-11/responsive-test-result.md`    |
| 3   | インタラクションテスト結果 | `outputs/phase-11/interaction-test-result.md`   |
| 4   | アクセシビリティテスト結果 | `outputs/phase-11/accessibility-test-result.md` |
| 5   | 手動テスト総括             | `outputs/phase-11/manual-test-result.md`        |

## 完了条件

- [ ] Task 1: 3テーマ全てで7コンポーネントの表示を確認（テスト#1〜#11 全PASS）
- [ ] Task 2: 3ブレークポイントで表示崩れなし（テスト#12〜#17 全PASS）
- [ ] Task 3: 全インタラクションが期待通り動作（テスト#18〜#27 全PASS）
- [ ] Task 4: キーボード操作で全機能にアクセス可能（テスト#28〜#34 全PASS）
- [ ] Task 5: VoiceOver 読み上げ文言が仕様テキストと一致（テスト#35〜#40 全PASS）
- [ ] Task 5: コントラスト比 WCAG 2.1 AA 準拠（テスト#41〜#44 全PASS）
- [ ] Task 5: フォーカスインジケーター視認性確保（テスト#45〜#47 全PASS）
- [ ] Task 6: 既存コンポーネント使用箇所で後方互換性維持（テスト#48〜#51 全PASS）
- [ ] 全51テストケースの結果が記録されている
- [ ] 発見された問題がある場合、severity（Critical/Major/Minor）と対応方針が記録されている

## Phase末端アクション【必須】

- [ ] `artifacts.json` の Phase 11 ステータスを `completed` に更新
- [ ] 発見された Critical/Major 問題がある場合、Phase 差し戻し判断を記録
- [ ] Minor 問題は未タスク仕様書候補としてリストアップ（Phase 12 Task 4 で処理）

## 依存関係

| 方向 | Phase / タスク           | 内容                               |
| ---- | ------------------------ | ---------------------------------- |
| 前提 | Phase 10（最終レビュー） | PASS または MINOR 判定             |
| 後続 | Phase 12（ドキュメント） | 手動テスト結果を未タスク検出に活用 |

## 次のPhase

→ Phase 12（ドキュメント）`phase-12-documentation.md`
