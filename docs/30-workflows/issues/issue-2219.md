# [#2219] "[TASK-LLM-MOD-05-COMPACT-DESC] InlineModelSelector compact モードの description 表示改善"

## メタ情報

```yaml
task_id: TASK-LLM-MOD-05-COMPACT-DESC
task_name: InlineModelSelector compact モードの description 表示改善
category: 改善
target_feature: LLM Model Selector / InlineModelSelector
priority: 低
scale: 小〜中規模
status: 未実施
source_phase: TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY Phase 12（OBS-2）
created_date: 2026-04-16
dependencies: []
spec_path: docs/30-workflows/unassigned-task/TASK-LLM-MOD-05-COMPACT-DESC.md
```

| 項目       | 内容       |
| ---------- | ---------- |
| 優先度     | 低         |
| 規模       | 小〜中規模 |
| ステータス | 未実施     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY` の実装では、`InlineModelSelector` の
`SelectorDropdown` 内で `LLMModelSchema.description` を `title` 属性（native tooltip）
と `sr-only` span の2層構成で表示するようにした。

しかし compact モードでは、ドロップダウンを開かないと description を確認できない
状態が残っている（OBS-2）。これは compact UI のスペース制約に起因する設計上の限界であり、
当該タスクでは「タスク化不要」として観察事項に留めた。

### 1.2 問題点・課題

- compact モードではモデル名のみが表示され、description はドロップダウンを開くまで
  視認できない
- ユーザーは現在選択しているモデルの説明を手軽に確認できない
- `title` 属性は OS/ブラウザ依存（通常1秒後の遅延表示）であり UX が最適ではない

### 1.3 放置した場合の影響

- ユーザーがモデルの特性（高速・高精度など）を把握せずに選択を続ける可能性がある
- `title` 属性依存の tooltip は OS 環境によっては表示されない場合がある
- アクセシビリティ観点では現実装でも `aria-describedby` + `sr-only` により補完されているが、
  視覚的ユーザーへの情報提供が不十分

---

## 2. 何を達成するか（What）

### 2.1 目的

compact モードでも description を視覚的にユーザーに届けられる UX を実現する。

### 2.2 最終ゴール

- compact モードで現在選択中のモデルに description がある場合、ドロップダウンを
  開かなくても視認できる状態
- ネイティブ `title` 属性に依存せず、制御可能な Popover/ツールチップで表示
- スクリーンリーダー対応を維持（`aria-describedby` など）

### 2.3 スコープ

#### 含むもの

- compact モードでの description 表示方式の設計と実装
- Popover / Tooltip ライブラリ（例: Radix UI Tooltip, Floating UI）の評価と導入
- 既存のアクセシビリティ対応（`aria-describedby` + `sr-only`）の維持または改善
- 既存テスト（T1〜T11 40件 + T-DESC-1〜T-DESC-15 15件 = 55件）の回帰確認
- 新しい表示方式に対応したテストケースの追加

#### 含まないもの

- モデルの description 内容自体の変更
- `LLMModelSchema` の型定義変更
- InlineModelSelector 以外のコンポーネントへの適用
- 完全な Popover ライブラリのグローバル導入（評価フェーズを経て判断）

### 2.4 成果物

- 修正済み `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx`
- 対応するテストケース追加済み `apps/desktop/src/renderer/components/llm/__tests__/InlineModelSelector.test.tsx`
- ライブラリ選定ドキュメント（Popover/Tooltip ライブラリ評価結果）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY` が完了済みであること
- Radix UI または Floating UI が利用可能であること（または評価結果で代替を選択）

### 3.2 依存タスク

- TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY（完了）

### 3.3 必要な知識

- Radix UI `Tooltip` / `Popover` コンポーネントの使用方法
- Floating UI の `useFloating` フックによる Tooltip 実装
- React のアクセシビリティ実装パターン（`aria-describedby`、role 属性）
- compact モードの CSS スペース制約（Tailwind CSS クラス）

### 3.4 推奨アプローチ

**オプションA: Radix UI Tooltip 導入**

- `@radix-ui/react-tooltip` を追加
- compact モードの選択中モデルラベル上に Tooltip をラップ
- ホバー時に description をポップアップ表示
- 遅延なし（または最小遅延）で表示可能

**オプションB: Floating UI useFloating 導入**

- `@floating-ui/react` を追加
- 自前で Tooltip 制御ロジックを実装
- より細かい制御が可能だが実装コストが高い

**推奨**: オプションA（Radix UI Tooltip）。既にプロジェクトで Radix UI が採用されている場合は
追加コストなし。compact モードのスペース制約を考慮した Tooltip の配置調整が容易。

---

## 4. 実行手順

### Phase構成

| Phase | 内容                 | 目安 |
| ----- | -------------------- | ---- |
| 1     | ライブラリ評価・設計 | 1h   |
| 2     | Tooltip 実装         | 2h   |
| 3     | アクセシビリティ検証 | 0.5h |
| 4     | テスト追加・回帰確認 | 1.5h |

### Phase 1: ライブラリ評価・設計

#### 目的

compact モードの description 表示に最適なライブラリと実装方針を確定する。

#### 手順

1. `package.json` で Radix UI の導入状況を確認する
2. 既存の Tooltip 実装がある場合は参照し、一貫性を保つ方針を選択する
3. compact モードの DOM 構造を確認し、Tooltip のアンカー要素を特定する
4. Tooltip の表示位置（上/右/下/左）とスペース制約を考慮して設計する

#### 成果物

- ライブラリ選定ドキュメント（`outputs/phase-1/library-evaluation.md`）

#### 完了条件

- 採用ライブラリと実装方針が確定している

### Phase 2: Tooltip 実装

#### 目的

compact モードで選択中モデルの description を Tooltip で表示する。

#### 手順

1. 選択したライブラリを使い、compact モード時の model label を Tooltip でラップする
2. description が存在する場合のみ Tooltip を有効化する（空文字・undefined は非表示）
3. Tooltip の内容に description テキストを設定する
4. 既存の `title` 属性と `sr-only` span との重複を整理する（Tooltip 導入後は `title` 属性を除去または保持を検討）

#### 成果物

- 修正済み `InlineModelSelector.tsx`

#### 完了条件

- compact モードで description がある場合に Tooltip が表示される
- description がない（undefined/空文字）場合は Tooltip が表示されない

### Phase 3: アクセシビリティ検証

#### 目的

Tooltip 導入後もスクリーンリーダー対応が維持されていることを確認する。

#### 手順

1. `aria-describedby` と Tooltip コンポーネントの `aria` 属性の整合性を確認する
2. キーボード操作で Tooltip がフォーカス時に表示されることを確認する（WCAG 1.4.13 対応）
3. ESC キーで Tooltip が閉じることを確認する

#### 成果物

- アクセシビリティ検証記録

#### 完了条件

- スクリーンリーダーで description が読み上げられる
- キーボードのみでの操作で Tooltip が表示・非表示される

### Phase 4: テスト追加・回帰確認

#### 目的

既存テストが PASS を維持し、新しい Tooltip 動作のテストが追加されること。

#### 手順

1. 既存 55 件のテストを実行し、回帰がないことを確認する（`pnpm --filter @repo/desktop test`）
2. compact モード Tooltip の表示・非表示テストケースを追加する
3. description が undefined / 空文字の場合の非表示確認テストを追加する
4. アクセシビリティ属性（`aria-describedby`）のテストを追加する

#### 成果物

- 追加テストケース（最低5件）
- テスト実行結果（全件 PASS）

#### 完了条件

- 全テストが PASS している
- 新規テストで compact モードの Tooltip 動作が検証されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] compact モードでホバー時に description が Tooltip で表示される
- [ ] description が undefined / 空文字の場合は Tooltip が表示されない
- [ ] ドロップダウン内でも引き続き description が表示される（既存動作の維持）

### 品質要件

- [ ] 既存テスト 55 件が全件 PASS
- [ ] 新規テスト（Tooltip 動作）が最低 5 件追加・PASS
- [ ] TypeScript 型エラーなし（`pnpm --filter @repo/desktop typecheck`）
- [ ] ESLint エラーなし（`pnpm --filter @repo/desktop lint`）

### アクセシビリティ要件

- [ ] スクリーンリーダーで description が読み上げられる
- [ ] キーボード操作で Tooltip が表示・ESC で非表示になる
- [ ] WCAG 1.4.13（ホバーまたはフォーカスコンテンツ）に準拠

### ドキュメント要件

- [ ] Phase 12 close-out 時に `unassigned-task-detection.md` の formalized 欄を更新する

---

## 6. 検証方法

### テストケース

| テストID    | 内容                                                           | 確認コマンド                                           |
| ----------- | -------------------------------------------------------------- | ------------------------------------------------------ |
| T-COMPACT-1 | compact モードで description ありモデルにホバーでTooltip表示   | `pnpm --filter @repo/desktop test InlineModelSelector` |
| T-COMPACT-2 | compact モードで description なしモデルにホバーでTooltip非表示 | 同上                                                   |
| T-COMPACT-3 | キーボードフォーカス時にTooltip表示                            | 同上                                                   |
| T-COMPACT-4 | ESCキーでTooltip非表示                                         | 同上                                                   |
| T-COMPACT-5 | 既存T-DESC-1〜T-DESC-15の回帰確認                              | 同上                                                   |

### 検証手順

```bash
# ユニットテスト実行
pnpm --filter @repo/desktop test

# 型チェック
pnpm --filter @repo/desktop typecheck

# Lint
pnpm --filter @repo/desktop lint
```

---

## 7. リスクと対策

| リスク                                        | 影響度 | 発生確率 | 対策                                                            |
| --------------------------------------------- | ------ | -------- | --------------------------------------------------------------- |
| Radix UI Tooltip と既存 Radix UI の競合       | 中     | 低       | `TooltipProvider` のスコープを確認し、アプリルートに1つのみ配置 |
| compact モードのスペース制約でTooltipが隠れる | 中     | 中       | `side="top"` や `collisionPadding` で表示位置を調整             |
| 既存 55 テストへの回帰                        | 高     | 低       | テスト前にコンポーネント構造変更を最小限に留める                |
| Tooltip 遅延なし設定による意図しない多用      | 低     | 中       | `delayDuration` を適切に設定（例: 300ms）                       |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY/outputs/phase-12/unassigned-task-detection.md`
- `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx`
- `apps/desktop/src/renderer/components/llm/__tests__/InlineModelSelector.test.tsx`

### 参考資料

- [Radix UI Tooltip](https://www.radix-ui.com/primitives/docs/components/tooltip)
- [Floating UI](https://floating-ui.com/)
- [WCAG 1.4.13 Content on Hover or Focus](https://www.w3.org/TR/WCAG21/#content-on-hover-or-focus)

---

## 9. 備考

### 苦戦箇所（前タスク TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY からの知見）

| No  | 箇所                     | 内容                                                                                    | 解決策・知見                                                                                |
| --- | ------------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 1   | description 変異パターン | `undefined` / `null` / 空文字 / 空白のみ のいずれでも安全に処理する必要があった         | `typeof model.description === "string" && model.description.trim().length > 0` で正確に判定 |
| 2   | native tooltip の限界    | `title` 属性は OS/ブラウザ依存（通常1秒後の遅延）であり UX が最適ではないことが判明した | Popover/Tooltip ライブラリへの移行を本タスクで実施する                                      |
| 3   | compact UI スペース制約  | compact モードではスペースが限られており、description を inline で表示できなかった      | Tooltip/Popover を使い、オーバーレイ形式で表示することでスペース問題を回避する              |
| 4   | アクセシビリティ2層構成  | `title` 属性だけでなく `aria-describedby` + `sr-only` の2層構成が必要だった             | Tooltip ライブラリ移行後は `aria-describedby` は Tooltip 側で自動付与されるか確認すること   |
| 5   | 既存テスト回帰防止       | description 追加後も既存の 40 テストが全て PASS する必要があった                        | SelectorDropdown の構造を変えず、`models.map` 内で条件付き属性追加に留める設計で回帰なし    |

### 補足事項

- `TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY` の Phase 12 で「タスク化はしない」と記録されたが、
  将来の UX 改善として本タスクを作成した
- Radix UI が既に導入済みの場合は追加ライブラリ不要で実装可能（バンドルサイズへの影響なし）
- compact モードの Tooltip と既存 SelectorDropdown 内の description 表示は、
  それぞれ独立した UX コンテキストであり、両方を維持する設計が望ましい
