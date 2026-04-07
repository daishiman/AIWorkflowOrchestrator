# Lessons Learned: テスト / 型安全 / 品質

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: テスト設計、型安全パターン、品質検証に関する教訓
> 分割元: [lessons-learned-current.md](lessons-learned-current.md)

## メタ情報

| 項目     | 値                                                                     |
| -------- | ---------------------------------------------------------------------- |
| 正本     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |
| 目的     | テスト/型安全/品質検証に関する教訓を集約                               |
| スコープ | Object.freeze + satisfies、テンプレートリテラル型、Permission Fallback |
| 対象読者 | AIWorkflowOrchestrator 開発者                                          |

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|----------|
| 2026-04-07 | 1.4.0 | TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 教訓1件を追加（L-RT01-TDD-002: TDD 2段階テスト設計 / バグ直撃 Red テストと coverage 補完テストの分離） |
| 2026-04-01 | 1.3.0 | TASK-TRACE-SKILL-AUTH-001 教訓3件を追加（L-AUTH-TRACE-001: never-resolving mock IPC副作用検出 / L-AUTH-TRACE-002: data-testid 安定クエリ / L-AUTH-TRACE-003: useEffect 再レンダリング連鎖検出） |
| 2026-03-29 | 1.2.0 | UT-RT-06-CONS 教訓2件を追加（L-RT-06-CONS-001: グローバル閾値回避の個別カバレッジ計測 / L-RT-06-CONS-002: 最小共通helper抽出パターン） |
| 2026-03-25 | 1.1.0 | UT-LLM-MOD-01-005 の教訓3件を追加（provider registry SSoT / optional `specialMatcher` narrowing / readonly bridge の follow-up 化） |
| 2026-03-17 | 1.0.0 | lessons-learned-current.md から分割作成 |

---

## 2026-03-29 UT-RT-06-CONS（sdkMessageUtils shared helper 抽出 / Phase 7 個別カバレッジ計測）

### L-RT-06-CONS-001: Phase 7 でグローバル閾値が原因の偽陰性を回避する（個別ファイルカバレッジ計測）

| 項目 | 内容 |
| --- | --- |
| 課題 | `pnpm test:coverage` はプロジェクト全体のカバレッジを集計するため、既存ファイルの未カバー部分が原因でグローバル閾値を下回り、新規追加ファイルが100%でも Phase 7 が失敗した |
| 再発条件 | プロジェクト全体のカバレッジ閾値未達の状態で新規ファイルを追加する場合 |
| 解決策 | `pnpm vitest run --coverage --coverage.include='**/targetFile.ts'` で対象ファイルを絞り込んで個別計測。`coverage-standards.md` にガイドライン追記済み |
| 教訓 | Phase 7 の目的は「今回追加したコードのカバレッジ確認」。グローバル閾値失敗は既存負債。対象ファイル個別計測で PASS したら Phase 7 PASS とし、全体改善は別タスクへ |
| 関連タスク | UT-RT-06-SKILL-EXECUTOR-NORMALIZER-CONSOLIDATION-001 |

```bash
# 個別ファイルカバレッジ計測
pnpm vitest run --coverage --coverage.include='**/sdkMessageUtils.ts'
```

### L-RT-06-CONS-002: 最小共通 helper 抽出パターン（前処理の散在を解消）

| 項目 | 内容 |
| --- | --- |
| 課題 | `unknown → record` 型判定と `type` フィールド抽出が `SkillExecutor.ts` と `sdkMessageNormalizer.ts` の2箇所に分散。SDK バージョンアップ時に両方を更新する保守コストが残った |
| 再発条件 | 複数の lane が同じ SDK message を扱い、それぞれに型ガードロジックを独自実装した場合 |
| 解決策 | lane 固有の出力型は維持しつつ、前処理（型判定・フィールド抽出）のみを `sdkMessageUtils.ts` に shared helper として抽出。各 lane は helper を呼び出すだけにする |
| 教訓 | 「出力型が違うから統合できない」は正しい判断だが、前処理の共通部分は分離可能。責務境界を「前処理 vs lane固有変換」で引くと最小差分で重複を解消できる |
| 関連パターン | Single Responsibility Principle: shared helper は型判定責務のみ持つ |
| 関連タスク | UT-RT-06-SKILL-EXECUTOR-NORMALIZER-CONSOLIDATION-001 |

### 同種課題の解決手順

1. 複数モジュールが同じ SDK/外部ライブラリの型を扱う場合は、型判定部分をまず grep で洗い出す
2. 出力型が異なっても「前処理（型判定・フィールド抽出）」は共通化できる場合が多い
3. `--coverage.include` で対象ファイルを絞り込んで Phase 7 の個別カバレッジを確認する

---

## 2026-03-25 UT-LLM-MOD-01-005（provider registry SSoT）

### タスク概要

| 項目 | 内容 |
| --- | --- |
| タスクID | UT-LLM-MOD-01-005 |
| 目的 | `PROVIDER_CONFIGS` / `inferProviderId()` / `LLMProviderIdSchema` の三重管理を解消し、`provider-registry.ts` を正本化する |
| 完了日 | 2026-03-25 |
| ステータス | **完了（Phase 1-12）** |

### 苦戦箇所1: `as const satisfies` と `z.enum()` tuple 要件の両立

| 項目 | 内容 |
| --- | --- |
| 課題 | `PROVIDER_CONFIGS` は `as const satisfies readonly ProviderConfigEntry[]` で安全に保持したい一方、`z.enum()` は `[string, ...string[]]` の tuple を要求するため、そのままでは `LLMProviderIdSchema` を組み立てにくい |
| 解決策 | `ProviderIdUnion = (typeof PROVIDER_CONFIGS)[number]["id"]` を先に定義し、`PROVIDER_IDS` を `ProviderIdUnion` tuple として cast した |
| 教訓 | runtime catalog を SSoT にする場合、`satisfies` と tuple cast を組み合わせて「正本の型安全」と「Zod enum の要件」を両立させる |

### 苦戦箇所2: optional `specialMatcher` の narrowing

| 項目 | 内容 |
| --- | --- |
| 課題 | OpenRouter のような meta provider は prefix ではなく slash form で判定したいが、`specialMatcher?` を optional にすると直接呼び出しで narrowing が崩れる |
| 解決策 | `inferProviderId()` で `"specialMatcher" in provider` を使って narrowing してから呼び出した |
| 教訓 | optional function property を持つ union-like catalog は、存在チェックを経由してから評価する |

### 苦戦箇所3: shared readonly models と Main mutable surface のずれ

| 項目 | 内容 |
| --- | --- |
| 課題 | `provider-registry.ts` の `models` は readonly だが、`LLMProviderSchema` は mutable `LLMModel[]` を前提としているため `handleGetProviders()` で `[...config.models]` が必要になった |
| 解決策 | 今回タスクでは Main surface を維持し、bridge の存在を明文化した上で未タスク `task-llm-handle-get-providers-readonly-models` に切り出した |
| 教訓 | shared catalog を正本化するときは、readonly と public surface の境界差分をその場で消し切れない場合がある。曖昧なまま残さず follow-up として formalize する |

### 同種課題の簡潔解決手順

1. catalog 正本は `as const satisfies` で固定する。
2. Zod enum が必要なら、正本配列から tuple を導出して `z.enum()` へ渡す。
3. optional matcher / readonly bridge のような境界差分は、その場で解決するか未タスクへ formalize する。

---

## 2026-03-16 UT-06-001 (tool-risk-config-implementation)

### タスク概要

| 項目 | 内容 |
| --- | --- |
| タスクID | UT-06-001 |
| 目的 | `packages/shared/src/constants/security.ts` に RiskLevel 型・ToolRiskConfigEntry interface・TOOL_RISK_CONFIG 定数を実装 |
| 完了日 | 2026-03-16 |
| ステータス | **完了** |

### 実装内容

| 変更内容 | ファイル | 説明 |
| --- | --- | --- |
| RiskLevel 型・TOOL_RISK_CONFIG 定数 | `packages/shared/src/constants/security.ts` | 3段階リスクレベル（low/medium/high）、Object.freeze 深層凍結、satisfies パターン |
| テスト | 対応テストファイル | 18テスト ALL PASS |

### 苦戦箇所1: Object.freeze + as キャストの型安全性問題（P19 再発パターン）

| 項目 | 内容 |
| --- | --- |
| **課題** | `Object.freeze()` の戻り値が `Readonly<T>` となり、`Record<K, V>` 型注釈と不一致。初回実装で `as Record<...>` キャストを使用したが、P19（型キャストバイパス）違反 |
| **原因** | `Object.freeze()` は入力型を `Readonly<T>` に変換するため、`as Record<K, V>` で型情報を上書きすると freeze の不変性保証が型レベルで失われる |
| **解決策** | `satisfies Record<K, V>` パターンに置き換え。型チェック + リテラル型保持 + ランタイム不変性の三重防御を実現 |
| **教訓** | セキュリティ定数に `Object.freeze()` を適用する際は `satisfies` で型検査し、`as` キャストを排除する |

**コード例**:

```typescript
// P19違反: as キャストで Readonly<T> を Record<K, V> に偽装
const TOOL_RISK_CONFIG = Object.freeze({
  low: { /* ... */ },
  medium: { /* ... */ },
  high: { /* ... */ },
}) as Record<RiskLevel, ToolRiskConfigEntry>;

// satisfies で型チェック + リテラル型保持 + freeze 不変性
const TOOL_RISK_CONFIG = Object.freeze({
  low: { /* ... */ },
  medium: { /* ... */ },
  high: { /* ... */ },
} satisfies Record<RiskLevel, ToolRiskConfigEntry>);
```

**5分解決カード**: `satisfies` キーワードで `as` を置換 → テスト実行 → ビルド確認

### 苦戦箇所2: SKILL.md 変更履歴テーブル更新漏れ（P29 再発）

| 項目 | 内容 |
| --- | --- |
| **課題** | LOGS.md 2ファイルは更新済みだったが、SKILL.md x2 の変更履歴テーブルへの UT-06-001 エントリ追加が漏れていた |
| **原因** | Phase 12 Step 1-A で LOGS.md を2ファイル更新した時点で「完了」と判断し、SKILL.md 変更履歴の存在を忘れた |
| **解決策** | Phase 12 完了条件チェックリストに「SKILL.md x2 変更履歴更新」を明示的に含める |
| **教訓** | Step 1-A は「LOGS.md x2 + SKILL.md x2」の4ファイル更新が最小単位。LOGS.md だけで完了判定しない |

**関連パターン**: P29（SKILL.md 変更履歴の更新漏れ）、P25（LOGS.md 2ファイル更新漏れ）

### 苦戦箇所3: headerColorToken の型が string のまま残存

| 項目 | 内容 |
| --- | --- |
| **課題** | CSS変数名を `string` 型で定義していたため、タイポを型チェックで検出できなかった |
| **原因** | `headerColorToken: string` では `"--risk-hgih"` のようなタイポがコンパイルを通過する |
| **解決策** | テンプレートリテラル型 `` `--risk-${RiskLevel}` `` に狭小化し、3つの有効な値（`--risk-low` / `--risk-medium` / `--risk-high`）のみ許可 |
| **教訓** | CSS変数名やトークン名をドメイン固有型ではなく `string` で定義すると、タイポが型チェックをすり抜ける。テンプレートリテラル型で値域を制限する |

**コード例**:

```typescript
// string 型ではタイポを検出できない
interface ToolRiskConfigEntry {
  headerColorToken: string;
}

// テンプレートリテラル型で値域を制限
interface ToolRiskConfigEntry {
  headerColorToken: `--risk-${RiskLevel}`;
}
```

### 同種課題の簡潔解決手順（3ステップ）

1. セキュリティ定数に `Object.freeze()` を適用する際は `satisfies Record<K, V>` パターンを使い、`as` キャストを排除する。
2. Phase 12 Step 1-A は「LOGS.md x2 + SKILL.md x2」の4ファイル更新を最小単位として完了判定する。
3. CSS変数名・トークン名にはテンプレートリテラル型を適用し、`string` 型で定義しない。

---

## 2026-03-16 UT-06-005 Permission Fallback（abort/skip/retry/timeout）

### 苦戦箇所 S-PF-1: 既実装コードの4ステップ abort フロー発見遅延

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 4 でテストを書き始めた段階で、abort 4ステップ（cancelAll→revokeSessionEntries→log→IPC通知）が既に SkillExecutor.ts に実装済みだった。Phase 1-3 で「新規実装」前提で仕様を書いたため、既存コードとの重複リスクが発生 |
| 再発条件 | 大規模ファイル（SkillExecutor.ts 1500行超）のコード調査が不十分なまま Phase 1 に入る場合 |
| 解決策 | Phase 1 で `git log --oneline -- <target-file>` と `grep -n "abort\|fallback\|retry" <target-file>` を実行し、既存実装の有無を確認してから要件を策定する |
| 関連パターン | P50（既実装防御の発見による Phase 転換）|
| 関連タスク | UT-06-005 |

### 苦戦箇所 S-PF-2: revokeSessionEntries スタブ実装の設計判断

| 項目 | 内容 |
| --- | --- |
| 課題 | abort フローの Step 2（revokeSessionEntries）がスタブ実装（全エントリクリア）のまま。セッション別フィルタリングには AllowedToolEntry に sessionId 追加が必要で、UT-06-005 のスコープ外と判断した |
| 再発条件 | 既存の型定義（AllowedToolEntry）を拡張すると、関連テスト・仕様書への影響範囲が広すぎる場合 |
| 解決策 | スタブ実装を選択し、本格実装を UT-06-005-B として未タスク化。スタブ判断の根拠を Phase 2 設計ドキュメントに明記する |
| 関連タスク | UT-06-005, UT-06-005-B |

### 苦戦箇所 S-PF-3: PERMISSION_MAX_RETRIES デッドコード化と abortedExecutions メモリリーク

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 10 最終レビューで2件の品質問題を検出: (1) `PERMISSION_MAX_RETRIES=3` が定数として定義されているが、retryCounters で直接 `3` がハードコードされデッドコード化 (2) `abortedExecutions: Set<string>` にクリア機構がなくメモリリーク |
| 再発条件 | 定数を定義しても使用箇所で参照せず直値を使うパターン、Set/Map のクリーンアップ忘れ |
| 解決策 | (1) retryCounters の条件を `PERMISSION_MAX_RETRIES` 参照に変更 (2) abortedExecutions にセッション単位のクリア機構を追加 |
| 関連タスク | UT-06-005 |

### 同種課題の5分解決カード

1. `grep -n "abort\|fallback\|retry\|skip" <target-file>` で既存実装を確認
2. 既実装の場合は Phase 4-5 を「検証・補完」モードに切り替え（P50 準拠）
3. スタブ実装が必要な場合は Phase 2 に判断根拠を記録し、未タスク化を Phase 12 Task 4 に組み込む
4. 定数定義は `grep -rn "CONST_NAME" <file>` で使用箇所を確認、未使用は即修正
5. Set/Map を使う場合は cleanup 機構（セッション終了時の clear/delete）を設計段階で明記

---

## 2026-04-01 TASK-TRACE-SKILL-AUTH-001（スキル生成 auth:login リグレッション調査）

### タスク概要

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-TRACE-SKILL-AUTH-001 |
| 目的 | スキル生成フローで `auth:login` IPC が誤って呼ばれる経路を調査・修正し、回帰テストで封じる |
| 完了日 | 2026-04-01 |
| ステータス | **完了（Phase 1-12）** |
| 最終結論 | 現行コードに不要な `auth:login` 呼び出し経路は存在しなかった。デバッグコード2行除去 + 回帰テスト TC-01〜TC-08 追加で対応完了 |

### L-AUTH-TRACE-001: never-resolving mock による IPC 副作用検出パターン

| 項目 | 内容 |
| --- | --- |
| 課題 | `auth:login` のような IPC 呼び出しが意図しない経路から発生しているか確認する手段がなかった |
| 再発条件 | 5000ms タイムアウト持ちの IPC が予期しない経路から呼ばれると、フローがハングする |
| 解決策 | `mockAuthLogin.mockReturnValue(new Promise<never>(() => {}))` で never-resolving にし、その状態でフロー完了すれば呼び出しゼロを確認できる（TC-03） |
| 教訓 | 副作用の大きい IPC は never-resolving mock で「呼ばれたら必ず詰まる」テストを作ると、呼び出し有無を時間内に確認できる。`not.toHaveBeenCalled()` の単純確認より強力 |
| 関連タスク | TASK-TRACE-SKILL-AUTH-001 TC-03 |

```typescript
// never-resolving mock パターン（TC-03）
const neverResolve = new Promise<never>(() => {}); // 永遠に pending
mockAuthLogin.mockReturnValue(neverResolve);
// → フローが規定時間内に完走 = auth:login は呼ばれていない
expect(mockAuthLogin).not.toHaveBeenCalled();
```

### L-AUTH-TRACE-002: data-testid による多ロール要素の安定クエリ

| 項目 | 内容 |
| --- | --- |
| 課題 | `queryByRole('textbox')` が複数要素にマッチして `TestingLibraryElementError` が発生した |
| 再発条件 | 複数の `<textarea>` / `<input>` が同一画面に存在する場合 |
| 解決策 | 対象要素に `data-testid="skill-lifecycle-request-input"` を付与し、`getByTestId()` でクエリする |
| 教訓 | `getByRole` は意味論的に正しいが、同一ロールが複数存在する UI では `data-testid` が安定したテスト手段になる。重要な操作ターゲットには事前に `data-testid` を付与しておくと、テストが UI 構造変化に強くなる |
| 関連タスク | TASK-TRACE-SKILL-AUTH-001 |

### L-AUTH-TRACE-003: useEffect 再レンダリング連鎖による副作用検出（TC-07 パターン）

| 項目 | 内容 |
| --- | --- |
| 課題 | コンポーネントの `rerender()` が prepare フローを二重起動する可能性を発見できなかった |
| 再発条件 | `useEffect` 依存配列に状態が含まれ、rerender 時に値変化が起きるケース |
| 解決策 | `act(() => rerender(<Component />))` 後に副作用モックが追加呼び出しされていないことを `toHaveBeenCalledTimes(1)` で検証する（TC-07） |
| 教訓 | `useEffect` 依存配列の変化がフローを再起動するバグは、単純な「初回レンダリング」テストでは検出できない。rerender テストを回帰スイートに含めると、予期しない二重実行を封じられる |
| 関連パターン | `useRef` による実行中フラグ（`isRunning` ref）で二重起動を防ぐ |
| 関連タスク | TASK-TRACE-SKILL-AUTH-001 TC-07 |

```typescript
// TC-07 パターン: 再レンダリング後に副作用が起きないことを確認
const { rerender } = render(<Component {...props} />);
await act(async () => { clickPrepareButton(); }); // 初回フロー起動
expect(mockSideEffect).toHaveBeenCalledTimes(1);

await act(async () => {
  rerender(<Component {...props} />); // 再レンダリング
});
expect(mockSideEffect).toHaveBeenCalledTimes(1); // 増えていないこと
```

### 同種課題の5分解決手順

1. 疑わしい IPC に `console.trace("[TEMP DEBUG] [タスクID]")` を挿入しスタックを確認する
2. never-resolving mock を設定し、フローが完走すれば呼び出しゼロと確定する（L-AUTH-TRACE-001）
3. `queryByRole` が複数マッチで失敗する場合は `data-testid` を要素に追加して切り替える（L-AUTH-TRACE-002）
4. rerender テスト（TC-07 パターン）でコンポーネント再描画時の副作用二重起動を防ぐ（L-AUTH-TRACE-003）
5. TC-04 のようなテストで `[TEMP DEBUG]` 痕跡がないことを確認してから Phase クローズする

---

## 2026-04-07 TASK-UT-RT-01（TDD 2段階テスト設計）

### L-RT01-TDD-002: バグ直撃 Red テストと coverage 補完テストを分離する

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 4 で全パターンをまとめて書くと、どのテストが「バグを直接証明する Red テスト」で、どれが「branch coverage のための補完テスト」かが不明瞭になる |
| 解決策 | Phase 4 で「バグを直接捕捉する最小テスト（T-01/T-02）」を先に書き、Phase 6 で「branch coverage の穴を埋めるテスト（T-05/T-06）」を補完する 2 段階設計 |
| 標準ルール | Red テストは「バグが修正されて初めて Green になる」設計を明確にすること。回帰テスト（T-03/T-04）と明確に分離することでテストの意図が読みやすくなる |
| 適用範囲 | TDD で small bug fix（変更4行程度）を実装する場合の Phase 4/6 分業パターン |
| 関連タスク | TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 |
| 発見日 | 2026-04-07 |
