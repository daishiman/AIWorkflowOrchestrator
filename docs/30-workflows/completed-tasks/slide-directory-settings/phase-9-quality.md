# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 9                        |
| Phase名    | 品質保証                 |
| 前提Phase  | Phase 8                  |
| 後続Phase  | Phase 10                 |
| ステータス | 未実施                   |
| 作成日     | 2026-01-13               |
| 機能名     | slide-directory-settings |

---

## 目的

静的解析、セキュリティチェック、コード品質の総合的な検証を行う。品質基準を満たしていることを確認し、最終レビューゲートに進む準備をする。

## 背景

Phase 8でリファクタリングが完了した。このPhaseでは、コード品質の最終確認を行い、セキュリティ・パフォーマンス・保守性の観点で問題がないことを確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 静的解析の実行

**目的**: 静的解析ツールでコード品質を検証する

**実行手順**:

1. ESLint実行:

   ```bash
   pnpm --filter @repo/desktop lint
   ```

2. TypeScript型チェック:

   ```bash
   pnpm --filter @repo/desktop typecheck
   ```

3. Prettier整形確認:

   ```bash
   pnpm --filter @repo/desktop format:check
   ```

4. 結果を確認:
   - エラー: 0件
   - 警告: 許容範囲内（セキュリティ関連は0件必須）

5. 結果を `outputs/phase-9/static-analysis-report.md` に出力

**期待される成果物**:

- `outputs/phase-9/static-analysis-report.md`

---

### タスク2: セキュリティチェック

**目的**: セキュリティ要件の充足を検証する

**実行手順**:

1. IPCセキュリティチェック:

| チェック項目       | 確認方法                                  | 結果       |
| ------------------ | ----------------------------------------- | ---------- |
| ホワイトリスト方式 | SLIDE_SETTINGS_CHANNELSで全チャンネル定義 | [ ] 確認済 |
| sender検証         | validateIpcSender使用                     | [ ] 確認済 |
| contextIsolation   | true設定                                  | [ ] 確認済 |
| nodeIntegration    | false設定                                 | [ ] 確認済 |

2. パストラバーサル対策チェック:

| チェック項目       | 確認方法               | 結果       |
| ------------------ | ---------------------- | ---------- |
| パス正規化         | path.normalize使用     | [ ] 確認済 |
| ../検出            | 相対パス上位参照の拒否 | [ ] 確認済 |
| シンボリックリンク | realpath検証           | [ ] 確認済 |
| ベースパス検証     | startsWith確認         | [ ] 確認済 |

3. 入力バリデーションチェック:

| チェック項目 | 確認方法           | 結果       |
| ------------ | ------------------ | ---------- |
| 空文字列拒否 | バリデーション実装 | [ ] 確認済 |
| 長さ制限     | 最大長チェック     | [ ] 確認済 |
| 文字種制限   | 許可文字のみ       | [ ] 確認済 |

4. 結果を `outputs/phase-9/security-check-report.md` に出力

**期待される成果物**:

- `outputs/phase-9/security-check-report.md`

---

### タスク3: 依存関係の脆弱性チェック

**目的**: 依存パッケージのセキュリティを検証する

**実行手順**:

1. 脆弱性スキャン:

   ```bash
   pnpm audit --filter @repo/desktop
   ```

2. 結果の確認:
   - Critical: 0件必須
   - High: 0件必須
   - Medium: 許容範囲内
   - Low: 記録のみ

3. 脆弱性が検出された場合の対応:
   - Critical/High: 即時対応（パッケージ更新またはパッチ）
   - Medium: 次回リリースまでに対応予定を記録
   - Low: 定期メンテナンスで対応

4. 結果を `outputs/phase-9/dependency-audit-report.md` に出力

**期待される成果物**:

- `outputs/phase-9/dependency-audit-report.md`

---

### タスク4: コード品質メトリクス確認

**目的**: コード品質メトリクスを確認する

**実行手順**:

1. テストカバレッジ確認:
   - Line Coverage: 80%以上
   - Branch Coverage: 60%以上
   - Function Coverage: 80%以上

2. 複雑度確認（任意）:
   - 関数の複雑度が許容範囲内

3. 依存関係の確認:
   - 循環参照がないこと
   - 依存方向が適切であること

4. 結果を `outputs/phase-9/code-quality-report.md` に出力

**期待される成果物**:

- `outputs/phase-9/code-quality-report.md`

---

### タスク5: 品質保証総合判定

**目的**: 品質保証の総合判定を行う

**実行手順**:

1. 全チェック結果を集約

2. 判定基準:

| 判定  | 条件           | 次のアクション         |
| ----- | -------------- | ---------------------- |
| PASS  | 全項目合格     | Phase 10へ進行         |
| MINOR | 軽微な警告あり | Phase 10へ進行（記録） |
| FAIL  | 重大な問題あり | 問題修正後再確認       |

3. チェックリスト総合判定:

**機能検証**

- [ ] 全ユニットテスト成功
- [ ] 全統合テスト成功

**コード品質**

- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] コードフォーマット適用済み

**テスト網羅性**

- [ ] Line Coverage 80%以上達成
- [ ] Branch Coverage 60%以上達成

**セキュリティ**

- [ ] 脆弱性スキャン完了
- [ ] Critical/High脆弱性なし
- [ ] IPCセキュリティ要件充足
- [ ] パストラバーサル対策実装

4. 判定結果を `outputs/phase-9/quality-verdict.md` に出力

**期待される成果物**:

- `outputs/phase-9/quality-verdict.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                           | 内容                 |
| -------------------- | ------------------------------------------------------------------------------ | -------------------- |
| 品質要件             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | 品質基準             |
| セキュリティ実装     | `.claude/skills/aiworkflow-requirements/references/security-implementation.md` | セキュリティ要件     |
| Electronセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`   | Electronセキュリティ |

### 関連ドキュメント

| 参照資料          | パス               | 内容                 |
| ----------------- | ------------------ | -------------------- |
| Phase 8結果       | `outputs/phase-8/` | リファクタリング結果 |
| Phase 7カバレッジ | `outputs/phase-7/` | カバレッジレポート   |

---

## 成果物

| 成果物               | パス                                         | 内容                     |
| -------------------- | -------------------------------------------- | ------------------------ |
| 静的解析レポート     | `outputs/phase-9/static-analysis-report.md`  | Lint/型チェック結果      |
| セキュリティレポート | `outputs/phase-9/security-check-report.md`   | セキュリティチェック結果 |
| 依存関係監査         | `outputs/phase-9/dependency-audit-report.md` | 脆弱性チェック結果       |
| 品質メトリクス       | `outputs/phase-9/code-quality-report.md`     | 品質メトリクス           |
| 品質判定             | `outputs/phase-9/quality-verdict.md`         | 総合判定結果             |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 9での統合テスト連携アクション**:

- 品質保証で統合テスト結果を確認
- 全テストがパスしていることを確認

---

## 完了条件

- [ ] 静的解析がパスしている
- [ ] セキュリティチェックがパスしている
- [ ] 依存関係の脆弱性がCritical/Highなし
- [ ] コード品質メトリクスが基準を満たしている
- [ ] 品質保証総合判定がPASSまたはMINOR
- [ ] 統合テスト連携アクションが完了している
- [ ] 全成果物が `outputs/phase-9/` に配置されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 品質ゲート

### 品質チェックリスト

#### 機能検証

- [ ] 全ユニットテスト成功
- [ ] 全統合テスト成功

#### コード品質

- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] コードフォーマット適用済み

#### テスト網羅性

- [ ] Line Coverage 80%以上

#### セキュリティ

- [ ] 脆弱性スキャン完了
- [ ] 重大な脆弱性なし

---

## 依存関係

- **前提**: Phase 8 が完了していること
- **後続**: Phase 10（最終レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/slide-directory-settings/phase-10-final-review.md`
