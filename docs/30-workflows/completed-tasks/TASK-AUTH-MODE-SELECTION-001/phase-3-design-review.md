# Phase 3: 設計レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 3                            |
| Phase名    | 設計レビューゲート           |
| タスクID   | TASK-AUTH-MODE-SELECTION-001 |
| Issue      | #750                         |
| 前提Phase  | Phase 2 (設計)               |
| 後続Phase  | Phase 4 (テスト作成)         |
| ステータス | 未実施                       |
| 作成日     | 2026-02-08                   |
| 機能名     | auth-mode-selection          |

---

## 目的

Phase 1〜2の成果物を包括的にレビューし、設計の妥当性・実現可能性を検証する。

## 背景

実装フェーズに進む前に、要件定義と設計の品質を確保し、手戻りを防止する。特に認証機能はセキュリティに関わる重要機能のため、設計段階での入念なレビューが必要。

---

## 判定基準

| 判定     | 条件             | 対応                                |
| -------- | ---------------- | ----------------------------------- |
| PASS     | 全観点で問題なし | Phase 4へ進行                       |
| MINOR    | 軽微な指摘あり   | 指摘対応後Phase 4へ進行             |
| MAJOR    | 重大な問題あり   | 影響範囲に応じて戻り先を決定        |
| CRITICAL | 致命的な問題あり | Phase 1へ戻りユーザーと要件を再確認 |

### 戻り先決定基準

| 問題の種類             | 戻り先              |
| ---------------------- | ------------------- |
| 要件の問題             | Phase 1（要件定義） |
| 設計の問題             | Phase 2（設計）     |
| 要件と設計の両方に問題 | Phase 1（要件定義） |

---

## レビュー観点

### 1. 要件と設計の整合性

**チェック項目**:

- [ ] 全機能要件（FR-1〜FR-8）が設計でカバーされている
- [ ] 非機能要件（NFR-1〜NFR-5）が設計に反映されている
- [ ] 受入基準（AC-1〜AC-7）がテスト可能な形で設計されている
- [ ] ユーザーストーリー（US-1〜US-5）の実現方法が明確

**確認事項**:

| 要件ID | 設計での実現方法                      | カバレッジ |
| ------ | ------------------------------------- | ---------- |
| FR-1   | AuthModeSelector UIコンポーネント     | ○ / ×      |
| FR-2   | electron-store永続化、AuthModeService | ○ / ×      |
| FR-3   | SkillExecutor → AuthModeService連携   | ○ / ×      |
| FR-4   | AuthModeValidationResult.errors       | ○ / ×      |
| FR-5   | AuthModeValidationResult.errors       | ○ / ×      |
| FR-6   | AuthModeStatusIndicator UI            | ○ / ×      |
| FR-7   | （推奨）確認ダイアログ設計            | ○ / ×      |
| FR-8   | （任意）CLI認証調査結果を踏まえた設計 | ○ / ×      |

### 2. セキュリティ（トークン取り扱い）

**チェック項目**:

- [ ] トークン・APIキーはMain Processでのみ管理されている
- [ ] Rendererにトークン・APIキーが直接送信されない
- [ ] 認証エラーはサニタイズされている
- [ ] IPCチャンネルはホワイトリストで管理されている
- [ ] withValidationラッパーが全ハンドラーに適用されている

**セキュリティ原則の適用確認**:

| 原則             | 設計での実装                      | 適合  |
| ---------------- | --------------------------------- | ----- |
| 最小権限         | Rendererには認証状態のみ公開      | ○ / × |
| 多層防御         | IPC検証 + 暗号化 + ホワイトリスト | ○ / × |
| フェイルセキュア | 認証失敗時はデフォルト拒否        | ○ / × |
| 完全仲介         | 全IPCアクセスを検証               | ○ / × |

### 3. Electron 3プロセスモデル準拠

**チェック項目**:

- [ ] Main Process: 認証ロジック、トークン管理
- [ ] Preload: contextBridgeによる安全なAPI公開
- [ ] Renderer: UI、状態管理のみ（Node.js API不使用）

**プロセス間責務分離の確認**:

| プロセス | 責務                                 | 設計での実装 | 適合  |
| -------- | ------------------------------------ | ------------ | ----- |
| Main     | AuthModeService, 永続化, IPC Handler | ○ / ×        | ○ / × |
| Preload  | auth-mode:\* チャンネル公開          | ○ / ×        | ○ / × |
| Renderer | authModeSlice, AuthModeSelector      | ○ / ×        | ○ / × |

### 4. 既存AuthKeyServiceとの統合方式

**チェック項目**:

- [ ] AuthKeyServiceのインターフェースを変更せずに統合可能
- [ ] SkillExecutorへの影響が最小限
- [ ] 既存テストの破壊的変更がない
- [ ] 依存性注入（DI）パターンが適切に使用されている

**統合影響分析**:

| 既存コンポーネント | 変更内容                     | 影響度 |
| ------------------ | ---------------------------- | ------ |
| AuthKeyService     | インターフェース変更なし     | 低     |
| SkillExecutor      | AuthModeService依存追加      | 中     |
| authSlice          | authModeSlice追加（分離）    | 低     |
| authHandlers       | authModeHandlers追加（分離） | 低     |

### 5. 型安全性

**チェック項目**:

- [ ] AuthMode, AuthModeStatus型が厳密に定義されている
- [ ] IPCリクエスト/レスポンス型が定義されている
- [ ] Discriminated Unionが適切に使用されている
- [ ] 実行時バリデーション（Zod等）が考慮されている

### 6. 状態管理

**チェック項目**:

- [ ] authModeSliceがZustand設計原則に従っている
- [ ] リスナー二重登録防止が設計されている
- [ ] 状態遷移が明確に定義されている
- [ ] エラー状態のリカバリーが設計されている

---

## 統合テスト連携【必須】

### Phase 3での必須アクション

- [ ] 統合テスト観点のレビューゲートを実施
- [ ] 統合ポイントの契約が適切に定義されているか確認
- [ ] エラー伝播パターンが統合テストで検証可能か確認

**統合テスト観点レビュー**:

| レビュー観点       | 確認項目                                             | 適合  |
| ------------------ | ---------------------------------------------------- | ----- |
| API設計            | auth-mode:\* チャンネル定義の妥当性                  | ○ / × |
| データフロー       | Renderer → IPC → Main → 認証プロバイダーのフロー設計 | ○ / × |
| エラーハンドリング | 認証失敗時のフロントエンド表示設計                   | ○ / × |
| 認証連携           | AuthKeyService/Supabase Authとの連携設計             | ○ / × |

---

## 参照資料

| 参照資料                     | パス                                                                         | 内容                         |
| ---------------------------- | ---------------------------------------------------------------------------- | ---------------------------- |
| 要件定義書                   | `outputs/phase-1/requirements-definition.md`                                 | 機能・非機能要件             |
| 受入基準                     | `outputs/phase-1/acceptance-criteria.md`                                     | テスト可能な受け入れ条件     |
| AuthModeService設計          | `outputs/phase-2/auth-mode-service-design.md`                                | サービスインターフェース設計 |
| SubscriptionAuthProvider設計 | `outputs/phase-2/subscription-auth-provider-design.md`                       | 認証プロバイダー設計         |
| IPC仕様                      | `outputs/phase-2/ipc-specification.md`                                       | IPCチャンネル詳細設計        |
| UIワイヤーフレーム           | `outputs/phase-2/ui-wireframe.md`                                            | UIコンポーネント設計         |
| 状態管理設計                 | `outputs/phase-2/state-management-design.md`                                 | Zustand Slice設計            |
| 型定義                       | `outputs/phase-2/type-definitions.ts`                                        | TypeScript型定義             |
| アーキテクチャ設計           | `outputs/phase-2/architecture-design.md`                                     | 全体設計まとめ               |
| セキュリティ原則             | `.claude/skills/aiworkflow-requirements/references/security-principles.md`   | セキュリティ設計原則         |
| Electronセキュリティ         | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | Electron固有セキュリティ     |

---

## 成果物

| 成果物           | パス                                      | 内容                   |
| ---------------- | ----------------------------------------- | ---------------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | レビュー判定・指摘事項 |

---

## レビュー結果テンプレート

```markdown
# 設計レビュー結果

## メタ情報

| 項目         | 内容                         |
| ------------ | ---------------------------- |
| レビュー日   | 2026-02-XX                   |
| タスクID     | TASK-AUTH-MODE-SELECTION-001 |
| レビュー対象 | Phase 1-2成果物              |

## 判定結果

**判定: {{PASS / MINOR / MAJOR / CRITICAL}}**

## レビュー結果詳細

### 1. 要件と設計の整合性

| 観点                 | 結果 | 詳細 |
| -------------------- | ---- | ---- |
| 機能要件カバレッジ   | ○/×  |      |
| 非機能要件反映       | ○/×  |      |
| 受入基準テスト可能性 | ○/×  |      |

### 2. セキュリティ

| 観点             | 結果 | 詳細 |
| ---------------- | ---- | ---- |
| トークン管理     | ○/×  |      |
| IPC検証          | ○/×  |      |
| エラーサニタイズ | ○/×  |      |

### 3. Electron 3プロセスモデル

| 観点               | 結果 | 詳細 |
| ------------------ | ---- | ---- |
| プロセス間責務分離 | ○/×  |      |
| contextBridge使用  | ○/×  |      |

### 4. 既存AuthKeyService統合

| 観点                   | 結果 | 詳細 |
| ---------------------- | ---- | ---- |
| インターフェース互換性 | ○/×  |      |
| 影響範囲               | ○/×  |      |

### 5. 統合テスト観点

| 観点             | 結果 | 詳細 |
| ---------------- | ---- | ---- |
| 統合ポイント契約 | ○/×  |      |
| エラー伝播設計   | ○/×  |      |

## 指摘事項

### 重大な問題（MAJOR/CRITICAL）

（該当なし / 問題の詳細）

### 軽微な指摘（MINOR）

1. （指摘内容）
   - 影響:
   - 対応案:

## 次のアクション

- 判定がPASS/MINORの場合: Phase 4へ進行
- 判定がMAJORの場合: Phase {{1/2}}へ戻る
- 判定がCRITICALの場合: Phase 1へ戻り要件再確認
```

---

## 完了条件

- [ ] 全レビュー観点がチェックされている
- [ ] レビュー結果が文書化されている
- [ ] 判定結果（PASS/MINOR/MAJOR/CRITICAL）が記録されている
- [ ] MINOR以下の指摘は対応済みまたは記録済み
- [ ] 統合テスト観点のレビューが完了している
- [ ] **本Phase内のレビュー作業を100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 1, 2 が完了していること
- **後続**: Phase 4 へ進む（PASS/MINOR判定の場合）

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 3 実行記録

### 使用スキル

- code-smell-detection: {{result}}
- security-review: {{result}}

### レビュー結果

- 判定: {{PASS/MINOR/MAJOR/CRITICAL}}
- 指摘事項数: {{数}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-AUTH-MODE-SELECTION-001/phase-4-test-creation.md`
