# [#1627] "[UT-MODEL-SEARCH-FILTER-UI-001] [UT"

## メタ情報

```yaml
task_id: UT-MODEL-SEARCH-FILTER-UI-001
task_name: [UT
category: -
target_feature: -
priority: 低
scale: -
status: 未実施
source_phase: chat-inline-model-selector Phase 2 + 30種思考法（if思考）（2026-03-21）
created_date: 2026-03-25
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-ut-model-search-filter-ui-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 背景・目的

現在の SelectorDropdown はプロバイダーとモデルの一覧を全件表示する設計であり、`maxHeight: 320px` でスクロール対応している。

現時点のプロバイダー・モデル数では視認性に問題はないが、以下のシナリオで著しく使い勝手が低下する。

- プロバイダーが 10 個以上に増加した場合
- 特定プロバイダーのモデル数が 50 個以上になった場合（OpenAI / Anthropic の実績値から近い将来想定される）
- ユーザーが目的のモデルに素早くアクセスしたい場合

テキスト検索によるフィルタリング機能を追加することで、モデル数の増加に対してスケーラブルな UI を実現する。

## 実装方針

1. 検索入力欄の追加
   - SelectorDropdown の最上部に検索 input 要素を配置する
   - Dropdown が開いた際に自動フォーカスされる設計とする
   - プレースホルダー: 「プロバイダー/モデルを検索...」

2. フィルタリングロジック
   - プロバイダー名とモデル名の両方に対してリアルタイム（onChange）で絞り込みを行う
   - 大文字小文字を区別しない（`toLowerCase()` で正規化）
   - 部分一致検索（`includes()`）を採用する
   - プロバイダー名がヒットした場合は、そのプロバイダー配下の全モデルを表示する
   - モデル名がヒットした場合は、そのモデルが属するプロバイダーヘッダーも表示する

3. 検索結果ゼロ件の表示
   - 「該当するモデルが見つかりません」のメッセージを表示する
   - 検索クリアボタン（× アイコン）を input 末尾に配置する

4. アクセシビリティ対応
   - `role="searchbox"` と `aria-label` を付与する
   - キーボードで検索入力 → ↓キーで一覧にフォーカス移動できる設計とする

## 受け入れ基準

- [ ] SelectorDropdown 内に検索入力欄が表示される
- [ ] プロバイダー名でリアルタイム絞り込みができる
- [ ] モデル名でリアルタイム絞り込みができる
- [ ] 大文字小文字を区別しない検索ができる
- [ ] 検索結果ゼロ件の場合に適切なメッセージが表示される
- [ ] 検索クリアボタンで入力をリセットできる
- [ ] Dropdown を閉じて再度開いた際に検索文字列がリセットされる
- [ ] キーボードナビゲーションが正常に動作する
- [ ] テストカバレッジが Line 80%、Branch 60% を超える

## 苦戦箇所・知見（該当がある場合）

- P48（useShallow 未適用による派生セレクタ無限ループ）に注意し、フィルタリング後の配列を返すセレクタには `useShallow` を適用すること
- 検索入力欄の自動フォーカスは `autoFocus` 属性ではなく `useEffect` + `ref.current?.focus()` で制御し、アクセシビリティツールとの互換性を確保すること

## 参照資料

- `docs/30-workflows/chat-inline-model-selector/phase-2-design.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`
- `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`
- `.claude/rules/06-known-pitfalls.md#P48`
- `.claude/rules/01-architecture.md#アクセシビリティ`
