# パターン集: ガイドライン・フェーズ境界遷移・失敗回避

> 元ファイル: `patterns.md` から分割
> 読み込み条件: コーディングガイドライン、Phase間遷移の知見、失敗回避策を参照したい時。

## ガイドライン

### Markdown見出し検出パターン

- **状況**: スクリプトでMarkdownの特定レベルの見出しを検出する場合
- **指針**:
  - H1のみ: `/^# [^#]/`
  - H2のみ: `/^## [^#]/`
  - H3のみ: `/^### [^#]/`
  - H2以上（H1, H2）: `/^#{1,2} [^#]/`
- **根拠**: 見出しの後にはスペースが続き、より深い見出し（例：###）との誤検出を防ぐ
- **発見日**: 2026-01-24

### forwardRef + useImperativeHandle によるテスト可能性向上

- **状況**: コンポーネント内部のハンドラ関数がUIから直接呼び出されず、Function Coverageが不足する場合
- **パターン**: `forwardRef` + `useImperativeHandle` で内部関数をref経由で外部公開
- **例**（TASK-7D）:
  - ChatPanelの `handleImportRequest` がUI要素に未接続
  - `useImperativeHandle(ref, () => ({ handleImportRequest }))` で公開
  - テストでは `React.createRef<ChatPanelHandle>()` + `act()` で呼び出し
- **効果**:
  - Function Coverage 50% → 100%
  - 親コンポーネントからの制御が可能に
  - テストでの内部関数アクセスが型安全に
- **発見日**: 2026-01-30
- **関連タスク**: TASK-7D

### Exclude型によるType-safe設定マップ

- **状況**: ユニオン型の一部のみを対象とした設定マップを作成する場合
- **パターン**: `Exclude<UnionType, "value">` で対象外の値を除外した型を定義
- **例**（TASK-7D）:
  - `DisplayableStatus = Exclude<SkillExecutionStatus, "idle">`
  - `STATUS_CONFIG: Record<DisplayableStatus, { color: string; label: string }>`
  - 「idle」は表示しないため、設定マップから除外
- **効果**:
  - コンパイル時にすべてのアクティブステータスの設定漏れを検出
  - ランタイムエラーの防止
  - コードの意図が型レベルで明確
- **発見日**: 2026-01-30
- **関連タスク**: TASK-7D

### Store個別セレクタによる再レンダー最適化

- **状況**: Zustand Storeから複数の状態を取得するコンポーネント
- **パターン**: `useAppStore((s) => s.specificField)` を各フィールドごとに呼び出し
- **例**（TASK-7D）:
  ```
  const selectedSkillName = useAppStore((s) => s.selectedSkillName);
  const streamingMessages = useAppStore((s) => s.streamingMessages);
  const isExecuting = useAppStore((s) => s.isExecuting);
  ```
- **効果**:
  - 無関係な状態変更時の不要な再レンダーを防止
  - パフォーマンス最適化（特にストリーミング中の高頻度更新時）
  - 全状態を一括取得するアンチパターンの回避
- **発見日**: 2026-01-30
- **関連タスク**: TASK-7D

### 並列バックグラウンドエージェントによるドキュメント生成

- **状況**: Phase 1-12の大量の出力ドキュメントを効率的に生成する場合
- **パターン**: 独立したPhase群ごとにTask agentを並列起動し、バックグラウンド実行
- **例**（TASK-7D）:
  - Agent 1: Phase 1-3（要件分析・設計・レビュー）
  - Agent 2: Phase 4-7（テスト・実装・カバレッジ）
  - Agent 3: Phase 8-10（リファクタリング・品質・最終レビュー）
  - Agent 4: Phase 11（手動テスト）
  - Agent 5: Phase 12（ドキュメント・実装ガイド）
- **効果**:
  - 33個の出力ドキュメントを効率的に生成
  - コード変更とドキュメント生成を並行して実行可能
  - コンテキスト使用量の分散
- **発見日**: 2026-01-30
- **関連タスク**: TASK-7D

### Record型による定数スタイルマッピング

- **状況**: TypeScriptのユニオン型に対応するUIスタイルを定義する場合
- **パターン**: `Record<EnumType, StyleObject>` でTailwind CSSクラスを型安全にマッピング
- **例**（task-imp-permission-tool-metadata-001）:
  ```
  const RISK_LEVEL_STYLES: Record<RiskLevel, { bg: string; text: string; border: string }> = {
    Low: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
    ...
  };
  ```
- **効果**:
  - 全リスクレベルのスタイル定義が必須（コンパイル時検証）
  - 新しいリスクレベル追加時に未定義スタイルがコンパイルエラー
  - UIの一貫性保証
- **発見日**: 2026-01-31
- **関連タスク**: task-imp-permission-tool-metadata-001

### IIFE（即時実行関数式）によるインラインJSXレンダリング

- **状況**: JSX内で変数束縛を伴う条件付きレンダリングが必要な場合
- **パターン**: `{(() => { const val = compute(); return <span>{val}</span>; })()}` でインライン実行
- **例**（task-imp-permission-tool-metadata-001）:
  - `getRiskLevel(toolName)` の結果を変数に束縛してバッジスタイルを適用
  - 複数のstyleプロパティ（bg, text, border）を組み合わせるためIIFEで中間変数が必要
- **効果**:
  - 別関数に分離するほどでもない小規模なロジックをインラインで表現
  - className構築に中間変数が使える
  - render関数の肥大化を防止
- **発見日**: 2026-01-31
- **関連タスク**: task-imp-permission-tool-metadata-001

### デフォルトメタデータによる安全側フォールバック

- **状況**: 外部入力（ツール名など）に対してメタデータを提供する場合
- **パターン**: 未定義キーに対してDEFAULT値を返し、安全側にフォールバック
- **例**（task-imp-permission-tool-metadata-001）:
  - `DEFAULT_METADATA = { riskLevel: "Medium", securityImpact: "ツールを実行します" }`
  - `TOOL_METADATA[toolName] ?? DEFAULT_METADATA` でnullish coalescing
  - 未知のツールは「Medium」リスク（安全側の中間値）
- **効果**:
  - 新ツール追加時にUIがクラッシュしない
  - 未定義ツールを「安全」ではなく「中程度リスク」として扱う安全設計
  - Null safety保証
- **発見日**: 2026-01-31
- **関連タスク**: task-imp-permission-tool-metadata-001

### 06-known-pitfalls.mdへの新規Pitfall登録フロー

- **状況**: 実装中に新しい落とし穴（Pitfall）を発見した場合
- **登録フロー**:

  | Step | アクション | 成果物 |
  | ---- | ---------- | ------ |
  | 1 | Pitfall IDの採番 | P31, P32, ... （既存の最大ID + 1） |
  | 2 | 06-known-pitfalls.mdに追記 | 教訓・チェックリスト参照・関連タスクを含む |
  | 3 | patterns.mdに成功パターンを追加 | 解決策・コード例・発見日を含む |
  | 4 | phase-templates.mdにチェック項目を追加（該当Phaseがある場合） | Phase 5等のテンプレートに追記 |

- **Pitfall ID採番ルール**:
  ```
  # 既存の最大IDを確認
  grep -n "^### P[0-9]" .claude/rules/06-known-pitfalls.md | tail -1

  # 例: P30が最大なら、新規はP31
  ```
- **必須セクション**（06-known-pitfalls.md）:
  ```markdown
  ### P{{N}}: {{タイトル}}

  - **教訓**: {{得られた教訓}}
  - **症状**: {{どのような問題が発生するか}}
  - **解決策**: {{解決方法}}
  - **関連タスク**: {{タスクID}}
  ```
- **patterns.mdとの連携**:
  - Pitfallには失敗パターンを記録
  - patterns.mdには成功パターン（解決策）を記録
  - 相互参照リンクで結合
- **効果**:
  - 知見の体系的な蓄積
  - 同じ失敗の再発防止
  - 新規タスクへの学びの継承
- **発見日**: 2026-02-10
- **関連タスク**: UT-FIX-STORE-HOOKS-INFINITE-LOOP-001

---

## フェーズ境界遷移パターン（Phase Boundary Transition）

> タスクの12フェーズ実行において、フェーズ間の成果物・知見の引き継ぎが品質を左右する。以下はTASK-7Dで検証された遷移パターン。

| パターン                                | 説明                                                   | 適用場面                                         |
| --------------------------------------- | ------------------------------------------------------ | ------------------------------------------------ |
| Phase 3 → Phase 4 ゲート                | レビュー結果に基づくテスト設計方針の引き継ぎ           | 設計レビューで発見した懸念事項をテスト仕様に反映 |
| Phase 7 → Phase 8 カバレッジ→リファクタ | カバレッジ不足の原因分析を元にリファクタリング方針決定 | Function Coverage不足 → forwardRef導入           |
| Phase 10 → Phase 11 品質→手動テスト     | 品質チェック結果を手動テストシナリオに反映             | 自動テスト検証済み項目は手動テストからスキップ   |
| Phase 11 → Phase 12 テスト→ドキュメント | 手動テスト結果と品質メトリクスをドキュメントに統合     | テスト結果サマリーを実装ガイドに含める           |

- **発見日**: 2026-01-30
- **関連タスク**: TASK-7D

---

## 失敗回避パターン

> Phase実行中に繰り返し発生した失敗を未然に防ぐための回避策。

| パターン                 | 失敗例                                                                 | 回避策                                             |
| ------------------------ | ---------------------------------------------------------------------- | -------------------------------------------------- |
| artifacts.json同期漏れ   | Phase完了後にartifacts.jsonが未更新                                    | 各Phase完了時に必ずartifacts.jsonを更新            |
| 未タスクファイル配置漏れ | Phase 12で検出した未タスクがdocs/30-workflows/unassigned-task/に未配置 | 検出と同時にファイル生成を実行                     |
| topic-map.md再生成忘れ   | システム仕様書更新後にインデックスが古いまま                           | spec更新後は必ずnode scripts/generate-index.js実行 |

- **発見日**: 2026-01-31
- **関連タスク**: TASK-7D
