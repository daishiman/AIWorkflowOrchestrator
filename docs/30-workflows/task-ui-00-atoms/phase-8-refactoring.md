# Phase 8: リファクタリング — TASK-UI-00-ATOMS Atoms共通コンポーネント

## メタ情報

| 項目       | 値                                            |
| ---------- | --------------------------------------------- |
| Phase      | 8                                             |
| Phase名    | リファクタリング（TDD: Refactor）             |
| タスクID   | TASK-UI-00-ATOMS                              |
| 作成日     | 2026-02-22                                    |
| 前提Phase  | Phase 7（カバレッジ確認完了・基準達成）       |
| 後続Phase  | Phase 9（品質保証）                           |
| ステータス | 未着手                                        |
| 依存タスク | TASK-UI-00-TOKENS（デザイントークン実装済み） |

## 目的

TDD の Refactor フェーズとして、テストを維持しながら7つの Atoms コンポーネントのコード品質を向上させる。コンポーネント間の共通パターン抽出、重複コードの除去、命名規約の統一、React パフォーマンス最適化を実施する。

## 背景

Phase 5-7 で実装・テスト済みの7コンポーネントは、個別に開発されたため以下の課題が予想される:

1. **ステータスカラーマッピングの重複**: StatusIndicator と Badge で類似のカラーマッピングロジックが存在する可能性
2. **サイズマッピングの重複**: StatusIndicator, SuggestionBubble, Badge で個別にサイズ定義を持つ
3. **ARIA属性設定パターンの分散**: 各コンポーネントで個別にARIA属性を設定している
4. **React最適化の不統一**: `React.memo`, `forwardRef`, `displayName` の適用が統一されていない可能性

---

## 実行タスク

- 実行方針: 本Phaseで定義した Task セクションを上から順に100%実施する。

### Task 1: コード品質分析

**目的**: 7コンポーネントのコードを横断的に分析し、改善ポイントを特定する

**実行手順**:

1. 7コンポーネントの `index.tsx` を順次読み込む
2. 以下の分析観点で改善ポイントを特定する
3. 分析結果を `outputs/phase-8/code-quality-analysis.md` に記録する

**分析観点**:

| #   | 観点                             | 確認内容                                                                         |
| --- | -------------------------------- | -------------------------------------------------------------------------------- |
| 1   | ステータスカラーマッピングの重複 | StatusIndicator と Badge でカラーマッピングオブジェクトが重複していないか        |
| 2   | サイズ定義の重複                 | 複数コンポーネントで `sm/md/lg` のサイズ値が個別に定義されていないか             |
| 3   | 条件分岐の簡潔化                 | `switch/case` や `if/else` チェーンが `Record<string, T>` マッピングで代替可能か |
| 4   | インライン関数の最適化           | レンダリング内のインライン関数が不要な再生成を引き起こしていないか               |
| 5   | CSS クラス構築パターン           | `clsx` / `cn` の使用が統一されているか                                           |
| 6   | props デストラクチャリング       | 全コンポーネントでprops展開パターンが統一されているか                            |
| 7   | 型定義の配置                     | Props型定義がexportされ、テストから参照可能か                                    |

**期待される成果物**: `outputs/phase-8/code-quality-analysis.md`

---

### Task 2: 共通ユーティリティ抽出

**目的**: コンポーネント間で共有可能なロジックを抽出する

**実行手順**:

1. Task 1 の分析結果をもとに、抽出候補を評価する
2. 抽出する場合は実装し、全テストがPASSすることを確認する
3. 抽出しない場合はその理由を記録する

#### 2.1 抽出候補一覧

| #   | 候補                           | 抽出判断基準                                                              | 抽出先パス候補                                                                           |
| --- | ------------------------------ | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| U-1 | ステータスカラーマッピング関数 | StatusIndicator と Badge で同一ステータス→カラー変換がある場合のみ抽出    | `atoms/utils/statusColors.ts`                                                            |
| U-2 | サイズマッピングの共通化       | 3コンポーネント以上で同一の `sm/md/lg` → ピクセル値変換がある場合のみ抽出 | `atoms/utils/sizeMapping.ts`                                                             |
| U-3 | ARIA属性ヘルパー               | 3コンポーネント以上で同一のARIA設定パターンがある場合のみ抽出             | 抽出不要（各コンポーネント固有の属性が多いため、共通化は過度な抽象化になる可能性が高い） |

**抽出判断ルール**:

- 2コンポーネント以上で同一ロジックが使用される場合のみ抽出を検討する
- 抽出により各コンポーネントの可読性が低下する場合は抽出しない
- 抽出した関数には単体テストを追加する

---

### Task 3: コンポーネント品質改善

**目的**: React のベストプラクティスに沿ったコンポーネント品質を確保する

**実行手順**: 7コンポーネントそれぞれに対して以下のチェックを実施する

#### 3.1 React.memo / forwardRef 確認

| #   | コンポーネント   | `React.memo` 適用判断                                          | `forwardRef` 適用判断     |
| --- | ---------------- | -------------------------------------------------------------- | ------------------------- |
| 1   | StatusIndicator  | 推奨: props が少なく再レンダリングコストが低いため任意         | 不要: DOM参照の必要性なし |
| 2   | FilterChip       | 推奨: リスト内で使用されるため `React.memo` を適用             | 不要: DOM参照の必要性なし |
| 3   | Badge            | 推奨: リスト内で使用されるため `React.memo` を適用             | 不要: DOM参照の必要性なし |
| 4   | SkeletonCard     | 推奨: props が少なく再レンダリングコストが低いため任意         | 不要: DOM参照の必要性なし |
| 5   | SuggestionBubble | 推奨: リスト内で使用されるため `React.memo` を適用             | 不要: DOM参照の必要性なし |
| 6   | EmptyState       | 不要: 単一インスタンスでの使用が想定されるため                 | 不要: DOM参照の必要性なし |
| 7   | RelativeTime     | 推奨: `React.memo` を適用（props変更なしで再レンダリング防止） | 不要: DOM参照の必要性なし |

#### 3.2 displayName 設定確認

全7コンポーネントに `displayName` が設定されていることを確認する。未設定の場合は追加する。

```typescript
// 例: StatusIndicator
StatusIndicator.displayName = "StatusIndicator";
```

#### 3.3 props デストラクチャリングパターン統一

全7コンポーネントで以下のパターンに統一する:

```typescript
// 統一パターン: デフォルト値はデストラクチャリングで設定
export function ComponentName({
  prop1,
  prop2 = "defaultValue",
  ...rest
}: ComponentNameProps) {
  // ...
}
```

---

### Task 4: テスト品質確認

**目的**: リファクタリング後も全テストがPASSし、テストコードの品質も維持されていることを確認する

**実行手順**:

1. リファクタリング完了後に全テストを実行する

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/atoms/{StatusIndicator,FilterChip,Badge,SkeletonCard,SuggestionBubble,EmptyState,RelativeTime}
```

2. テストの命名規約を確認する

| パターン      | フォーマット                                                                |
| ------------- | --------------------------------------------------------------------------- |
| `describe`    | コンポーネント名またはカテゴリ（例: `"StatusIndicator"`, `"エッジケース"`） |
| `it` / `test` | 「〜する」形式（例: `"status='running'でpulseアニメーションが適用される"`） |

3. Badge 既存17テスト + EmptyState 既存6テスト が全てPASSすることを確認する

---

## 参照資料

| 参照                                                                 | パス                                                                                                       |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------- |
| Atoms仕様書                                                          | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/00-2-atoms-components.md`                   |
| Phase 1 要件定義                                                     | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/phase-1-requirements.md`   |
| Phase 2 設計                                                         | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/phase-2-design.md`         |
| Phase 5 実装成果物                                                   | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/phase-5-implementation.md` |
| Phase 6 テスト拡充成果物                                             | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/phase-6-test-expansion.md` |
| Phase 7 カバレッジ成果物                                             | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/phase-7-coverage-check.md` |
| 品質要件                                                             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                |
| UIコンポーネント仕様                                                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                    |
| UIアーキテクチャ                                                     | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                                  |
| コード品質ルール                                                     | `.claude/rules/02-code-quality.md`                                                                         |
| P31: 無限ループ対策                                                  | `.claude/rules/06-known-pitfalls.md#P31`                                                                   |
| 実装サマリー（7コンポーネント実装・R-1〜R-6対応・barrel export更新） | `outputs/phase-5/implementation-summary.md`                                                                | Phase 5 成果物 |
| カバレッジ確認レポート                                               | `outputs/phase-7/coverage-report.md`                                                                       | Phase 7 成果物 |

## 統合テスト連携

リファクタリングでは**動作を変更しない**ことが原則。全テスト（Phase 4-6 で作成分）がPASSし続けることが必須条件。共通ユーティリティを抽出した場合は、そのユーティリティの単体テストも追加する。

## 成果物

| #   | 成果物               | パス                                       |
| --- | -------------------- | ------------------------------------------ |
| 1   | コード品質分析       | `outputs/phase-8/code-quality-analysis.md` |
| 2   | リファクタリングログ | `outputs/phase-8/refactoring-log.md`       |

## 完了条件

- [ ] Task 1: 7コンポーネントの横断的コード品質分析が完了し、`outputs/phase-8/code-quality-analysis.md` に記録されている
- [ ] Task 2: 共通ユーティリティの抽出判断が完了し、抽出した場合はテスト付きで実装されている
- [ ] Task 3-1: `React.memo` の適用判断が全7コンポーネントで完了している（リスト内使用の FilterChip, Badge, SuggestionBubble, RelativeTime は適用推奨）
- [ ] Task 3-2: 全7コンポーネントに `displayName` が設定されている
- [ ] Task 3-3: 全7コンポーネントで props デストラクチャリングパターンが統一されている
- [ ] Task 4: リファクタリング後の全テストがPASS
- [ ] Task 4: Badge 既存17テスト + EmptyState 既存6テスト の維持確認
- [ ] リファクタリングログ（`outputs/phase-8/refactoring-log.md`）に全変更が記録されている
- [ ] `cd apps/desktop && pnpm vitest run` で全テストがPASS

## Phase末端アクション【必須】

- [ ] 成果物ファイル（`outputs/phase-8/` 配下2ファイル）を作成
- [ ] `artifacts.json` の Phase 8 ステータスを `completed` に更新

## 依存関係

- **前提**: Phase 7（カバレッジ確認完了・基準達成）
- **入力**: Phase 5-7 のコンポーネント実装7個 + テストファイル7個
- **出力**: リファクタリング済みコンポーネント + コード品質分析 + リファクタリングログ

## 次のPhase

Phase 9（品質保証）へ進む。Phase 9 では ESLint, TypeScript型チェック, 全テスト実行, ビルド検証を行い、品質ゲート判定を実施する。
