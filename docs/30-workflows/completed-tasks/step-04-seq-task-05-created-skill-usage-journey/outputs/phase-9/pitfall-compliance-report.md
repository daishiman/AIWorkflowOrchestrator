# Pitfall 準拠チェックレポート

## メタ情報

| 項目       | 値                           |
| ---------- | ---------------------------- |
| タスクID   | TASK-SKILL-LIFECYCLE-05      |
| タスク名   | 作成済みスキルを使う主導線   |
| Phase      | 9                            |
| 成果物種別 | Pitfall 準拠チェックレポート |
| 作成日     | 2026-03-15                   |

---

## 対象 Pitfall 一覧

| #   | Pitfall ID | タイトル                                            | 確認対象文書                               | 確認観点                                                    |
| --- | ---------- | --------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------- |
| 1   | P31        | Zustand Store Hooks 無限ループ                      | outputs/phase-2/state-management-design.md | 個別セレクタ使用、合成 Hook 不使用                          |
| 2   | P48        | useShallow 未適用による派生セレクタ無限ループ       | outputs/phase-2/state-management-design.md | `.filter()` / `.map()` 派生セレクタに useShallow 適用       |
| 3   | P42        | 文字列引数の .trim() バリデーション漏れ             | outputs/phase-2/ipc-integration-design.md  | 3段バリデーション（型チェック → 空文字列 → トリム空文字列） |
| 4   | P44        | skill:import/remove IPC ハンドラと Preload の不整合 | outputs/phase-2/ipc-integration-design.md  | ハンドラ引数とPreload呼び出しの形式一致                     |
| 5   | P45        | IPC 引数命名の契約ドリフト                          | outputs/phase-2/ipc-integration-design.md  | 引数名がセマンティクスと一致                                |
| 6   | P46        | HTMLAttributes Props 型衝突パターン                 | outputs/phase-2/component-design.md        | `Omit<React.HTMLAttributes, "衝突属性">` 使用               |
| 7   | P47        | CSS 変数ベースのスタイルテストアサーション戦略      | outputs/phase-2/component-design.md        | `Record<Variant, string>` 定数のモジュールスコープ export   |
| 8   | P13        | タイマーテストの無限ループ                          | outputs/phase-4/ 各テスト仕様              | `advanceTimersByTime` 使用、`runAllTimers` 不使用           |
| 9   | P39        | happy-dom 環境での userEvent 非互換                 | outputs/phase-4/ 各テスト仕様              | `fireEvent` 使用、`userEvent.setup()` 不使用                |

---

## 個別チェック結果

### 1. P31: Zustand Store Hooks 無限ループ

| 項目       | 内容                                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 確認箇所   | outputs/phase-2/state-management-design.md セクション3「Store/Slice 拡張設計」およびセクション6「P31/P48 準拠チェックリスト」 |
| 対策の有無 | **あり**                                                                                                                      |
| 判定       | **PASS**                                                                                                                      |

#### 詳細

- セクション3で `useSkillUsageJourneyStore()` を合成 Hook として定義せず、個別セレクタ（`useFavoriteSkillNames()`, `useRecentlyUsedSkills()`, `useToggleFavorite()`, `useRecordUsage()`）を使用する設計が明示されている
- セクション6に P31 準拠チェックリストが含まれ、以下の3項目が確認対象として定義:
  1. 合成 Hook を `useEffect` 依存配列に含めていないこと
  2. 個別セレクタのみを使用していること
  3. アクション関数の参照安定性が確保されていること
- `useEffect` 依存配列に含めるアクション関数は個別セレクタ経由で取得する設計が明記されている

---

### 2. P48: useShallow 未適用による派生セレクタ無限ループ

| 項目       | 内容                                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 確認箇所   | outputs/phase-2/state-management-design.md セクション3「Store/Slice 拡張設計」およびセクション6「P31/P48 準拠チェックリスト」 |
| 対策の有無 | **あり**                                                                                                                      |
| 判定       | **PASS**                                                                                                                      |

#### 詳細

- `useRecentlyUsedSkills()` セレクタが `.slice()` で配列を返すため、`useShallow` が適用される設計が明記されている
- セクション6の P48 準拠チェックリストで以下が確認対象:
  1. `.filter()` / `.map()` / `.slice()` で新しい配列を返すセレクタに `useShallow` が適用されていること
  2. プリミティブ値のみを返すセレクタには `useShallow` を適用しないこと
- `useFavoriteSkillNames()` は `Set<string>` を返すが、Zustand の `Object.is` 比較で同一参照が維持されるため `useShallow` 不要と判定されている（Set は Store 内部で同一参照を維持）

---

### 3. P42: 文字列引数の .trim() バリデーション漏れ

| 項目       | 内容                                                                                |
| ---------- | ----------------------------------------------------------------------------------- |
| 確認箇所   | outputs/phase-2/ipc-integration-design.md セクション6「P42 準拠 3段バリデーション」 |
| 対策の有無 | **あり**                                                                            |
| 判定       | **PASS**                                                                            |

#### 詳細

- セクション6に P42 準拠の3段バリデーションコードが TypeScript で明示的に記載:
  1. `typeof args?.prompt !== "string"` — 型チェック
  2. `args.prompt === ""` — 空文字列チェック
  3. `args.prompt.trim() === ""` — トリム空文字列チェック
- 本タスクでは新規 IPC チャンネルを追加しないが、既存 `skill:optimize:evaluate` の呼び出し時に prompt 引数のバリデーション設計が含まれている
- バリデーション失敗時のエラーレスポンス形式（`{ code: "VALIDATION_ERROR", message: "..." }`）も定義されている

---

### 4. P44: skill:import/remove IPC ハンドラと Preload の不整合

| 項目       | 内容                                                                          |
| ---------- | ----------------------------------------------------------------------------- |
| 確認箇所   | outputs/phase-2/ipc-integration-design.md セクション7「P44/P45 準拠テーブル」 |
| 対策の有無 | **あり**                                                                      |
| 判定       | **PASS**                                                                      |

#### 詳細

- セクション7に P44 準拠テーブルが含まれ、本タスクで使用する IPC チャンネルごとにハンドラ引数形式と Preload 呼び出し形式の一致が確認されている
- `skill:optimize:evaluate` チャンネル: ハンドラが `string` 型の prompt を期待し、Preload 側も `string` を渡す設計で一致
- `skill:list` チャンネル: 引数なしで一致
- 新規チャンネル追加がないため、既存チャンネルの利用が P44 の解決済みパターンに準拠していることを確認

---

### 5. P45: IPC 引数命名の契約ドリフト

| 項目       | 内容                                                                          |
| ---------- | ----------------------------------------------------------------------------- |
| 確認箇所   | outputs/phase-2/ipc-integration-design.md セクション7「P44/P45 準拠テーブル」 |
| 対策の有無 | **あり**                                                                      |
| 判定       | **PASS**                                                                      |

#### 詳細

- セクション7の P45 準拠テーブルで、各チャンネルの引数名がセマンティクスと一致していることが確認されている
- `skill:optimize:evaluate` の引数名 `prompt` は「評価プロンプト文字列」という実際の値のセマンティクスと一致
- 本タスクでは `skillId` vs `skillName` の命名ドリフトパターン（P45 の原因事例）に該当する新規インターフェースは存在しない

---

### 6. P46: HTMLAttributes Props 型衝突パターン

| 項目       | 内容                                                                               |
| ---------- | ---------------------------------------------------------------------------------- |
| 確認箇所   | outputs/phase-2/component-design.md セクション9「P46 HTMLAttributes 衝突チェック」 |
| 対策の有無 | **あり**                                                                           |
| 判定       | **PASS**                                                                           |

#### 詳細

- セクション9に P46 準拠の HTMLAttributes 衝突チェックテーブルが含まれている
- `ScoreGateBadgeProps` が `React.HTMLAttributes<HTMLSpanElement>` を extends する際に、`content` 属性（HTML 標準: `string`、カスタム: `string | number`）の衝突を検出
- 対策として `Omit<React.HTMLAttributes<HTMLSpanElement>, "content">` を使用する設計が TypeScript コードで明示されている
- 衝突しやすい属性リスト（`content`, `color`, `translate`, `hidden`, `title`, `dir`, `slot`）が一覧化されており、設計時のチェック対象として記録されている

---

### 7. P47: CSS 変数ベースのスタイルテストアサーション戦略

| 項目       | 内容                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| 確認箇所   | outputs/phase-2/component-design.md セクション2.5「badgeVariantStyles 定数」 |
| 対策の有無 | **あり**                                                                     |
| 判定       | **PASS**                                                                     |

#### 詳細

- セクション2.5に `badgeVariantStyles` が `Record<ScoringGate, string>` 型のモジュールスコープ定数として定義されている
- コンポーネントファイルから `export` し、テストファイルで `import` して期待値を生成する設計パターンが明記されている
- CSS 変数（`var(--status-error)`, `var(--status-warning)`, `var(--status-success)`）のハードコード文字列比較を回避し、`badgeVariantStyles[gate]` による間接参照でトークン名変更時の修正箇所を1箇所に集約する設計

---

### 8. P13: タイマーテストの無限ループ

| 項目       | 内容                                                                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 確認箇所   | outputs/phase-4/ 配下の全テスト仕様（flow-test-design.md, state-management-test-design.md, ipc-test-design.md, accessibility-test-design.md, scoring-gate-cta-matrix.md） |
| 対策の有無 | **なし（該当なし）**                                                                                                                                                      |
| 判定       | **N/A（設計タスクのため該当なし）**                                                                                                                                       |

#### 詳細

- Phase 4 テスト仕様書では、`setTimeout` + `Promise` + 再スケジュールのパターン（P13 の発生条件）を使用するテストケースが設計に含まれていない
- 本タスクの設計は UI コンポーネント表示・状態管理・IPC 呼び出しに焦点を当てており、タイマーベースの非同期処理テストは設計スコープ外
- `recentlyUsedSkills` の `usedAt` フィールドは ISO 8601 文字列であり、タイマーモック不要（Date.now() のモックで対応可能）
- Phase 12（phase-12-documentation.md L236）で実装時の注意事項として「P13: タイマー（最近使った履歴の usedAt 更新）のテストは `advanceTimersByTime` を使用」と記載されており、実装フェーズへの引き継ぎは行われている

---

### 9. P39: happy-dom 環境での userEvent 非互換

| 項目       | 内容                                                                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 確認箇所   | outputs/phase-4/ 配下の全テスト仕様（flow-test-design.md, state-management-test-design.md, ipc-test-design.md, accessibility-test-design.md, scoring-gate-cta-matrix.md） |
| 対策の有無 | **なし（該当なし）**                                                                                                                                                      |
| 判定       | **N/A（設計タスクのため該当なし）**                                                                                                                                       |

#### 詳細

- Phase 4 テスト仕様書は「テストケース設計」であり、テストコードの具体的な API 選択（`fireEvent` vs `userEvent`）は実装時に決定される
- テスト仕様書では UI インタラクション（クリック、キーボード操作）の期待動作を記述しているが、使用 API（`fireEvent` / `userEvent`）の指定は含まれていない
- Phase 12（phase-12-documentation.md L237）で実装時の注意事項として「P39: happy-dom 環境では `userEvent` を使用せず `fireEvent` を使用」と記載されており、実装フェーズへの引き継ぎは行われている

---

## 非準拠リスト

非準拠箇所は検出されなかった。

P13 および P39 は設計タスクの性質上「該当なし（N/A）」と判定したが、Phase 12 の実装ガイドで実装時の注意事項として引き継がれていることを確認済みである。

---

## 総合判定

| 項目         | 結果                                                                 |
| ------------ | -------------------------------------------------------------------- |
| チェック対象 | 9 Pitfall                                                            |
| PASS         | 7/9                                                                  |
| N/A          | 2/9（P13, P39: 設計タスクのためテストコード API 選択は実装時に決定） |
| FAIL         | 0/9                                                                  |
| 非準拠箇所   | 0件                                                                  |
| **総合判定** | **PASS**                                                             |

Phase 2 設計成果物（state-management-design.md, ipc-integration-design.md, component-design.md）に P31/P48/P42/P44/P45/P46/P47 の7つの Pitfall に対する明示的な対策が設計に組み込まれている。P13/P39 は設計タスクのスコープ外（テストコード実装時の API 選択に関する制約）であるが、Phase 12 実装ガイドで引き継ぎが記載されており、実装時の対策漏れリスクは低い。
