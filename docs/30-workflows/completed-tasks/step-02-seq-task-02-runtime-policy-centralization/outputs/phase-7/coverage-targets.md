# カバレッジ目標

## メタ情報

| 項目       | 値                                                        |
| ---------- | --------------------------------------------------------- |
| Phase      | 7 - カバレッジ確認                                        |
| タスク     | TASK-02-RUNTIME-POLICY-CENTRALIZATION                     |
| 作成日     | 2026-03-21                                                |
| 前提成果物 | phase-4/validation-matrix.md, phase-6/edge-case-matrix.md |

---

## Ownership 4カテゴリごとのカバレッジ目標

### 1. runtime 実行可否（RuntimePolicyResolver.resolve）

| 指標              | 目標   | 根拠                                                   |
| ----------------- | ------ | ------------------------------------------------------ |
| Line Coverage     | >= 90% | 判定ロジックは全パスを網羅する必要がある（高精度必須） |
| Branch Coverage   | >= 70% | authMode x apiKey の組み合わせ分岐を網羅               |
| Function Coverage | >= 90% | resolve() と内部ヘルパー関数の呼び出しを検証           |

**必須テスト観点**:

- authMode 全値（api_key, supabase, undefined）に対する判定パス
- apiKey バリデーション（E-1 ~ E-6）の全分岐
- 正常ケース（allowed）と拒否ケース（blocked）の両方

### 2. health check（llm:check-health 経由）

| 指標              | 目標   | 根拠                                        |
| ----------------- | ------ | ------------------------------------------- |
| Line Coverage     | >= 80% | 外部依存のため mock ベースの検証が中心      |
| Branch Coverage   | >= 60% | 成功/失敗/タイムアウトの3分岐を網羅         |
| Function Coverage | >= 80% | health check 呼び出しと結果変換の関数を検証 |

**必須テスト観点**:

- タイムアウト境界テスト（E-7）: タイムアウト発生時に `status: "unknown"` を返すこと
- 成功時の `status: "healthy"` 変換
- 失敗時の `status: "unhealthy"` 変換とエラー情報の保持

### 3. handoff bundle（TerminalHandoffBundle / HandoffGuidance）

| 指標            | 目標         | 根拠                                     |
| --------------- | ------------ | ---------------------------------------- |
| Line Coverage   | >= 80%       | bundle 構築ロジックの網羅                |
| Branch Coverage | >= 60%       | surface ごとの分岐を検証                 |
| シナリオテスト  | >= 2シナリオ | surface 横断の統合テストで独立判定を確認 |

**必須テスト観点**:

- シナリオ A（Chat → Agent → Skill 連続実行）: 各 surface の独立判定
- シナリオ B（中途 blocked の非伝播）: blocked 後の後続 surface が影響を受けないこと
- contextSummary に正しい surface 名が含まれること（シナリオ C）

### 4. authMode 参照（Store 連携）

| 指標              | 目標   | 根拠                                                |
| ----------------- | ------ | --------------------------------------------------- |
| Line Coverage     | >= 80% | Store からの authMode 取得と resolve() への引き渡し |
| Branch Coverage   | >= 60% | authMode 未定義境界のテスト必須                     |
| Function Coverage | >= 80% | セレクタと resolve 呼び出し元の関数を検証           |

**必須テスト観点**:

- authMode 未定義境界テスト（E-1）: Store に authMode が設定されていない初期状態
- authMode 変更中の race condition（E-9）: 値渡しによる安全性の検証

---

## Phase 9 へ持ち越す Residual Risk

| ID   | リスク内容                                     | 理由                                                   | 対応タイミング     |
| ---- | ---------------------------------------------- | ------------------------------------------------------ | ------------------ |
| RR-1 | M-1（RuntimeDecisionForRenderer サニタイズ型） | 型定義は実装タスクで作成するため、設計段階では検証不可 | 実装タスク Phase 5 |
| RR-2 | M-2（resolve シグネチャ確定結果の適用確認）    | Phase 4 で確定済みだが、実装時の適用が正しいか検証必要 | 実装タスク Phase 5 |
| RR-3 | AI_CHECK_CONNECTION 呼び出し元のゼロ確認       | 実装タスク完了後にのみ grep でゼロヒットを検証可能     | 実装タスク完了後   |
