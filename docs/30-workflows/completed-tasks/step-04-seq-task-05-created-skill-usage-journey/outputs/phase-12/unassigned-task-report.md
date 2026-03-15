# 未タスク検出レポート: TASK-SKILL-LIFECYCLE-05 Phase 12

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| タスクID   | TASK-SKILL-LIFECYCLE-05    |
| タスク名   | 作成済みスキルを使う主導線 |
| Phase      | 12                         |
| 成果物種別 | 未タスク検出レポート       |
| 検出日時   | 2026-03-15                 |
| タスク種別 | 設計タスク                 |

---

## 検出件数サマリー

| 種別               | 件数    | ブロッカー |
| ------------------ | ------- | ---------- |
| 設計補完タスク     | 1件     | 0          |
| UX改善タスク       | 1件     | 0          |
| 技術実装タスク     | 2件     | 0          |
| ドキュメントタスク | 1件     | 0          |
| テスト追加タスク   | 1件     | 0          |
| **合計**           | **6件** | **0**      |

---

## 未タスク一覧

### UT-SKILL-LIFECYCLE-05-001: ボタンホバー/アクティブ状態スタイル定義

| 項目       | 値                                      |
| ---------- | --------------------------------------- |
| ID         | UT-SKILL-LIFECYCLE-05-001               |
| タスク名   | ボタンホバー/アクティブ状態スタイル定義 |
| 優先度     | LOW                                     |
| カテゴリ   | UX改善                                  |
| 発見源     | Phase 3 MINOR-01                        |
| ブロッカー | No                                      |

**内容**: CTA ボタン（「今すぐ使う」「保存して後で使う」「改善する」「もう一度使う」等）のホバー状態（`:hover`）およびアクティブ状態（`:active`）の詳細なスタイル定義が設計書に未記載。Apple HIG の「すべての操作にフィードバック」原則に基づき、各ボタンの状態変化（背景色の明度変化、影の深度変化、スケール変化）を定義する必要がある。

**影響範囲**: component-design.md の全 CTA ボタン定義（ScoreGateBadge は対象外）。Phase 5 実装時に Tailwind の hover:/active: バリアントとして定義する。SkillCard, SkillDetailPanel, PostExecutionActionBar の各コンポーネント内のボタンが対象。

**推奨対応**: 実装タスク開始時に、Apple HIG System Colors に基づくホバー/アクティブ状態のカラー変化テーブルを作成し、各 CTA ボタンに適用する。Primary ボタンは systemBlue の明度 +10%/-10%、Secondary は systemGray5 の明度変化を基準とする。既存の Button コンポーネントのスタイルを継承することで作業量を最小化する。

---

### UT-SKILL-LIFECYCLE-05-002: customStorage バリデーション型キャスト統一

| 項目       | 値                                         |
| ---------- | ------------------------------------------ |
| ID         | UT-SKILL-LIFECYCLE-05-002                  |
| タスク名   | customStorage バリデーション型キャスト統一 |
| 優先度     | LOW                                        |
| カテゴリ   | 技術実装                                   |
| 発見源     | Phase 3 MINOR-02                           |
| ブロッカー | No                                         |

**内容**: customStorage の `getItem` で Set 型を復元する際に `as string[]` 型キャストが使用されている設計箇所がある。P19（型キャストによる実行時検証バイパス）および P49（type predicate 内での `as` キャスト）に該当する可能性がある。`Array.isArray()` による実行時型検証に置換し、破損データからの安全な回復を保証する必要がある。

**影響範囲**: state-management-design.md の customStorage 実装設計。既存の customStorage 実装（`apps/desktop/src/renderer/store/index.ts`）の Set 型変換ロジック。favoriteSkillNames の persist/restore サイクルに影響。

**推奨対応**: customStorage の `getItem` 内で `JSON.parse` 結果を `unknown` 型で受け取り、`Array.isArray()` チェック後に `.filter(item => typeof item === "string")` で要素レベルのバリデーションを追加する。実装ガイド セクション B の customStorage コード例を参照。

---

### UT-SKILL-LIFECYCLE-05-003: useIsFavorite セレクタ安定性改善

| 項目       | 値                               |
| ---------- | -------------------------------- |
| ID         | UT-SKILL-LIFECYCLE-05-003        |
| タスク名   | useIsFavorite セレクタ安定性改善 |
| 優先度     | LOW                              |
| カテゴリ   | 技術実装                         |
| 発見源     | Phase 3 MINOR-03                 |
| ブロッカー | No                               |

**内容**: `useIsFavorite(skillName)` セレクタが `Set.has()` の結果（boolean プリミティブ）を返すため参照安定性自体は問題ないが、Set 自体の再生成タイミング（他のスキルのお気に入りトグル操作時）によっては、関係ないコンポーネントの不要な再レンダーが発生する可能性がある。P48 準拠で useShallow の適用要否を検証する必要がある。

**影響範囲**: state-management-design.md の個別セレクタ設計。FavoriteStarButton コンポーネントの再レンダー頻度。SkillCard 内にお気に入りボタンを配置する場合、一覧画面で多数の SkillCard が同時にレンダーされるため、パフォーマンスへの影響が顕在化する可能性がある。

**推奨対応**: 実装時に `useIsFavorite` のレンダー回数を React DevTools Profiler でプロファイリングし、不要な再レンダーが確認された場合のみ `useShallow` または `React.memo` を適用する。boolean プリミティブを返すセレクタは通常 useShallow 不要だが、親の Set が変更されるケースでの Zustand の挙動（Set の参照比較 vs 値比較）を実装時に検証する。

---

### UT-SKILL-LIFECYCLE-05-004: 曖昧表現修正（テスト合否基準明確化）

| 項目       | 値                                   |
| ---------- | ------------------------------------ |
| ID         | UT-SKILL-LIFECYCLE-05-004            |
| タスク名   | 曖昧表現修正（テスト合否基準明確化） |
| 優先度     | MEDIUM                               |
| カテゴリ   | ドキュメント                         |
| 発見源     | Phase 9 曖昧表現検出                 |
| ブロッカー | No                                   |

**内容**: Phase 9 品質検証で「適切に表示される」「正しく動作する」等の曖昧表現が設計書内に検出された。テストケースの合否基準として機能するためには、各表現を具体的な検証条件（表示されるテキスト内容、DOM 要素の存在、CSS クラスの適用状態等）に置換する必要がある。02-code-quality.md の「仕様書・コメントに曖昧表現（適切に、必要に応じて、など）を使わない」ルールに準拠させる。

**影響範囲**: Phase 4 テスト設計書（scoring-gate-cta-matrix.md, flow-test-design.md 等）内の期待結果記述。Phase 5 実装時のテストコード記述に影響。具体的には以下のテストケースが対象:

- TC-MATRIX 系の期待結果記述
- TC-FLOW 系の遷移確認条件
- TC-A11Y 系のアクセシビリティ検証条件

**推奨対応**: 実装タスクでテストコードを書く際に、各曖昧表現を具体的な検証条件に置換する。

- 「適切に表示される」→ 「`[data-testid="score-gate-badge"]` 要素が存在し、`textContent` が `"80点"` を含む」
- 「正しく動作する」→ 「`onClick` ハンドラが1回呼び出され、引数が `{ skillName: "test-skill", route: "workspace" }` である」
- Phase 9 の ambiguity-detection-report.md に記載の修正推奨テキストを参照する

---

### UT-SKILL-LIFECYCLE-05-005: Empty State UI 詳細設計

| 項目       | 値                        |
| ---------- | ------------------------- |
| ID         | UT-SKILL-LIFECYCLE-05-005 |
| タスク名   | Empty State UI 詳細設計   |
| 優先度     | LOW                       |
| カテゴリ   | 設計補完                  |
| 発見源     | Phase 11 エッジケース検証 |
| ブロッカー | No                        |

**内容**: Skill Center の各セクション（おすすめ/最近使った/保存済み）がゼロ件の場合に表示する Empty State UI の詳細設計が未定義。コンポーネントツリーには各セクションの存在が定義されているが、データが空の場合のイラスト/メッセージ/CTA（「スキルを作成する」導線等）のレイアウトとコピーテキストが未設計。初回起動時や新規ユーザーの体験に直結する。

**影響範囲**: SkillCenterView 配下の RecommendedSkillSection, RecentlyUsedSection, SavedSkillList の各コンポーネント。新規ユーザーが最初に Skill Center を開いたときの体験に直結する。

**推奨対応**: 実装タスクで以下の Empty State パターンを定義する:

- おすすめゼロ件: 「スキルを作成すると、ここにおすすめが表示されます」+ 「スキルを作成する」Secondary CTA
- 最近使ったゼロ件: 「まだスキルを使っていません」（CTA なし、他セクションへの自然な誘導）
- 保存済みゼロ件: 「保存したスキルはここに表示されます」+ 「Skill Center を探す」Tertiary CTA
- 全セクションゼロ件（完全初回）: 統合 Empty State で「最初のスキルを作りましょう」+ Primary CTA

---

### UT-SKILL-LIFECYCLE-05-006: 3シナリオ E2E テスト作成

| 項目       | 値                        |
| ---------- | ------------------------- |
| ID         | UT-SKILL-LIFECYCLE-05-006 |
| タスク名   | 3シナリオ E2E テスト作成  |
| 優先度     | MEDIUM                    |
| カテゴリ   | テスト追加                |
| 発見源     | Phase 12 実装ガイド作成時 |
| ブロッカー | No                        |

**内容**: 3シナリオ（作成直後 → 即時利用、Skill Center → 再利用、履歴 → 再実行）の E2E テストが未作成。Phase 4 で設計したテストケース（TC-FLOW-A01〜A05, TC-FLOW-B01〜B05, TC-FLOW-C01〜C05）をカバーする Playwright E2E テストを作成し、画面遷移とデータフローの統合検証を行う必要がある。

**影響範囲**: 各シナリオの画面遷移フロー全体。SkillCreator → Workspace → Agent（シナリオA）、SkillCenter → Workspace → Agent（シナリオB）、Agent 履歴 → Agent（シナリオC）の3導線をカバーする。

**推奨対応**: 実装完了後に Playwright でE2E テストを作成する。テストシナリオは以下の3本:

1. `e2e/created-skill-immediate-use.spec.ts`: スキル作成 → EP-1 → CTA → Workspace → Agent 実行 → PostExecutionActionBar 表示
2. `e2e/skill-center-reuse.spec.ts`: Skill Center 一覧 → SkillCard クリック → SkillDetailPanel → 「使う」→ Agent 実行
3. `e2e/history-rerun.spec.ts`: Agent 履歴タブ → 過去実行選択 → パラメータ復元 → 再実行
