# 未実装タスクレポート

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| タスクID   | TASK-SKILL-LIFECYCLE-05    |
| タスク名   | 作成済みスキルを使う主導線 |
| Phase      | 10                         |
| 成果物種別 | 未実装タスクレポート       |
| 作成日     | 2026-03-15                 |

---

## 検出件数サマリー

| カテゴリ     | 件数  | ブロッカー |
| ------------ | ----- | ---------- |
| UX 改善      | 1     | 0          |
| 技術実装     | 2     | 0          |
| ドキュメント | 1     | 0          |
| 設計補完     | 1     | 0          |
| **合計**     | **5** | **0**      |

---

## 未タスク一覧

### UT-SKILL-LIFECYCLE-05-001: ボタンホバー/アクティブ状態スタイル定義

| 項目       | 値                                      |
| ---------- | --------------------------------------- |
| ID         | UT-SKILL-LIFECYCLE-05-001               |
| タスク名   | ボタンホバー/アクティブ状態スタイル定義 |
| 優先度     | LOW                                     |
| カテゴリ   | UX 改善                                 |
| 発見源     | Phase 3 MINOR-01                        |
| ブロッカー | No                                      |

**内容**: CTA ボタン（「今すぐ使う」「保存して後で使う」「改善する」「もう一度使う」等）のホバー状態（`:hover`）およびアクティブ状態（`:active`）の詳細なスタイル定義が設計書に未記載。Apple HIG の「すべての操作にフィードバック」原則に基づき、各ボタンの状態変化（背景色の明度変化、影の深度変化、スケール変化）を定義する必要がある。

**影響範囲**: component-design.md の全 CTA ボタン定義（ScoreGateBadge は対象外）。Phase 5 実装時に Tailwind の hover:/active: バリアントとして定義する。

**推奨対応**: Phase 5（実装）開始時に、Apple HIG System Colors に基づくホバー/アクティブ状態のカラー変化テーブルを作成し、各 CTA ボタンに適用する。Primary ボタンは systemBlue の明度 +10%/-10%、Secondary は systemGray5 の明度変化を基準とする。

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

**内容**: customStorage の `getItem` で Set 型を復元する際に `as string[]` 型キャストが使用されている。P19（型キャストによる実行時検証バイパス）に該当する可能性がある。`Array.isArray()` による実行時型検証に置換し、破損データからの安全な回復を保証する必要がある。

**影響範囲**: state-management-design.md の customStorage 実装設計。既存の customStorage 実装（apps/desktop/src/renderer/store/index.ts）の Set 型変換ロジック。

**推奨対応**: customStorage の `getItem` 内で `JSON.parse` 結果を `unknown` 型で受け取り、`Array.isArray()` チェック後に `.filter(item => typeof item === "string")` で要素レベルのバリデーションを追加する。

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

**内容**: `useIsFavorite(skillName)` セレクタが `Set.has()` の結果（boolean プリミティブ）を返すため参照安定性は問題ないが、Set 自体の再生成タイミングによっては不要な再レンダーが発生する可能性がある。P48 準拠で useShallow の適用要否を検証する必要がある。

**影響範囲**: state-management-design.md の個別セレクタ設計。FavoriteStarButton コンポーネントの再レンダー頻度。

**推奨対応**: Phase 5 実装時に `useIsFavorite` のレンダー回数をプロファイリングし、不要な再レンダーが確認された場合のみ `useShallow` または `React.memo` を適用する。boolean プリミティブを返すセレクタは通常 useShallow 不要だが、親の Set が変更されるケースでの挙動を検証する。

---

### UT-SKILL-LIFECYCLE-05-004: 曖昧表現修正（テスト合否基準の明確化）

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| ID         | UT-SKILL-LIFECYCLE-05-004              |
| タスク名   | 曖昧表現修正（テスト合否基準の明確化） |
| 優先度     | MEDIUM                                 |
| カテゴリ   | ドキュメント                           |
| 発見源     | Phase 9 曖昧表現検出 11 件             |
| ブロッカー | No                                     |

**内容**: Phase 9 品質検証で「適切に表示される」「正しく動作する」等の曖昧表現が 11 件検出された。テストケースの合否基準として機能するためには、各表現を具体的な検証条件（表示されるテキスト内容、DOM 要素の存在、CSS クラスの適用状態等）に置換する必要がある。

**影響範囲**: Phase 4 テスト設計書（scoring-gate-cta-matrix.md, flow-test-design.md 等）内の期待結果記述。Phase 5 実装時のテストコード記述に影響。

**推奨対応**: 11 件の曖昧表現それぞれについて、以下の形式で具体化する。

- 「適切に表示される」→ 「`[data-testid="score-gate-badge"]` 要素が存在し、`textContent` が `"80点"` を含む」
- 「正しく動作する」→ 「`onClick` ハンドラが1回呼び出され、引数が `{ skillName: "test-skill", route: "workspace" }` である」

---

### UT-SKILL-LIFECYCLE-05-005: Empty State UI 詳細設計

| 項目       | 値                        |
| ---------- | ------------------------- |
| ID         | UT-SKILL-LIFECYCLE-05-005 |
| タスク名   | Empty State UI 詳細設計   |
| 優先度     | LOW                       |
| カテゴリ   | 設計補完                  |
| 発見源     | Phase 11 エッジケース     |
| ブロッカー | No                        |

**内容**: Skill Center の各セクション（おすすめ/最近使った/保存済み）がゼロ件の場合に表示する Empty State UI の詳細設計が未定義。コンポーネントツリーには各セクションの存在が定義されているが、データが空の場合のイラスト/メッセージ/CTA（「スキルを作成する」導線等）のレイアウトとコピーが未設計。

**影響範囲**: SkillCenterView 配下の RecommendedSkillSection, RecentlyUsedSection, SavedSkillList の各コンポーネント。初回起動時や新規ユーザーの体験に直結する。

**推奨対応**: Phase 5 実装時に以下の Empty State パターンを定義する。

- おすすめゼロ件: 「スキルを作成すると、ここにおすすめが表示されます」+ 「スキルを作成する」Secondary CTA
- 最近使ったゼロ件: 「まだスキルを使っていません」（CTA なし、他セクションへの自然な誘導）
- 保存済みゼロ件: 「保存したスキルはここに表示されます」+ 「Skill Center を探す」Tertiary CTA
