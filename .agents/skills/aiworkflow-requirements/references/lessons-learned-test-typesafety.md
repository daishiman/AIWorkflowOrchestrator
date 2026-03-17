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
| 2026-03-17 | 1.0.0 | lessons-learned-current.md から分割作成 |

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
