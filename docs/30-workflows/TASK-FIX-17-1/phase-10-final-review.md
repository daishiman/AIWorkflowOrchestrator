# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 10                                 |
| Phase名    | 最終レビューゲート                 |
| 前提Phase  | Phase 9 (品質保証)                 |
| 後続Phase  | Phase 11 (手動テスト検証)          |
| ステータス | 未実施                             |
| 作成日     | 2026-02-08                         |
| タスクID   | TASK-FIX-17-1-SKILL-SCAN-HANDLER   |
| タスク名   | skill:scan IPCハンドラーの新規追加 |

---

## 目的

全体品質・整合性を検証し、手動テストに進む前の最終確認を行う。

## 背景

実装・テスト・品質保証が完了した状態で、要件との整合性と全体品質を最終確認する。

---

## レビュー観点

### 1. 機能要件の充足

- [ ] `SKILL_SCAN` ハンドラーが `skillHandlers.ts` に登録されている
- [ ] `scanAvailableSkills(true)` が呼び出される（強制リフレッシュ）
- [ ] `withValidation()` ラッパーで登録されている
- [ ] Result パターン（`{ success, data }` / `{ success, error }`）で応答する

### 2. コード品質

- [ ] コーディング規約に準拠している
- [ ] 命名規則が既存ハンドラーと一貫している
- [ ] エラーハンドリングが適切
- [ ] ログ出力が適切なレベルで行われている

### 3. テストカバレッジ

- [ ] Line Coverage 80%+
- [ ] Branch Coverage 60%+
- [ ] Function Coverage 80%+
- [ ] 正常系・異常系の両方がテストされている

### 4. セキュリティ

- [ ] `validateIpcSender` による送信元検証が行われている
- [ ] エラーメッセージに内部情報が漏洩していない
- [ ] チャンネル名がホワイトリストに登録されている（既存確認済み）

### 5. ドキュメント整合性

- [ ] タスク指示書の要件が全て満たされている
- [ ] チャンネル定義（`channels.ts`）との整合性が保たれている

---

## SKILL_LIST との使い分け確認

### 両ハンドラーの比較表

| ハンドラー   | 用途                             | forceRefresh | 引数                     |
| ------------ | -------------------------------- | ------------ | ------------------------ |
| `SKILL_LIST` | 通常のスキル一覧取得             | オプション   | `forceRefresh?: boolean` |
| `SKILL_SCAN` | ファイルシステムの強制再スキャン | 固定 `true`  | なし                     |

### 使い分けの妥当性確認

- [ ] `SKILL_LIST` は通常のスキル一覧取得に使用される
- [ ] `SKILL_SCAN` は明示的な再スキャンが必要な場合に使用される
- [ ] 両者の機能重複が許容範囲内である（`SKILL_SCAN` は `SKILL_LIST(true)` の簡略形）
- [ ] APIの使い分けが明確に定義されている

### コード比較

```typescript
// SKILL_LIST: オプショナルな引数で柔軟に動作
ipcMain.handle(
  IPC_CHANNELS.SKILL_LIST,
  withValidation(async (_event, forceRefresh?: boolean) => {
    const skills = await skillService.scanAvailableSkills(forceRefresh);
    return { success: true, data: skills };
  }),
);

// SKILL_SCAN: 常に強制リフレッシュ（シンプルなAPI）
ipcMain.handle(
  IPC_CHANNELS.SKILL_SCAN,
  withValidation(async (_event) => {
    const skills = await skillService.scanAvailableSkills(true);
    return { success: true, data: skills };
  }),
);
```

---

## 参照資料

| 参照資料       | パス                                                                                        | 内容                 |
| -------------- | ------------------------------------------------------------------------------------------- | -------------------- |
| タスク指示書   | `docs/30-workflows/skill-import-agent-system/tasks/02b-task-fix-17-1-skill-scan-handler.md` | 機能要件             |
| 実装コード     | `apps/desktop/src/main/ipc/skillHandlers.ts`                                                | 実装成果物           |
| チャンネル定義 | `apps/desktop/src/preload/channels.ts`                                                      | チャンネル整合性確認 |
| 品質レポート   | `outputs/phase-9/quality-report.md`                                                         | 品質検証結果         |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                   | 内容             |
| ---------------- | ---------------------------------------------------------------------- | ---------------- |
| レビュー判定基準 | `.claude/skills/aiworkflow-requirements/references/review-criteria.md` | レビュー判定基準 |

---

## 成果物

| 成果物           | パス                                                                                                              | 内容                   |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 最終レビュー結果 | `docs/30-workflows/skill-import-agent-system/phase-outputs/TASK-FIX-17-1/outputs/phase-10/final-review-result.md` | レビュー判定・指摘事項 |

---

## レビュー結果判定

### 期待判定: PASS

今回のタスクは小規模な新規ハンドラー追加であり、以下が確認できれば PASS と判定する:

1. 機能要件が全て満たされている
2. 品質基準を満たしている
3. セキュリティ要件を満たしている
4. テストが全てPASS

### 判定基準

| 判定     | 条件                     | 次のアクション             |
| -------- | ------------------------ | -------------------------- |
| PASS     | 全レビュー観点で問題なし | Phase 11 へ進行            |
| MINOR    | 軽微な指摘あり           | 指摘対応後、Phase 11 へ    |
| MAJOR    | 重大な問題あり           | 影響範囲に応じて戻る       |
| CRITICAL | 致命的な問題あり         | Phase 1 へ戻りユーザー確認 |

### 戻り先決定基準

| 問題の種類 | 戻り先                |
| ---------- | --------------------- |
| 要件の問題 | Phase 1（要件定義）   |
| 設計の問題 | Phase 2（設計）       |
| 実装の問題 | Phase 5（実装）       |
| 品質の問題 | Phase 8（リファクタ） |

---

## 完了条件

- [ ] 全レビュー観点がチェックされている
- [ ] SKILL_LIST との使い分けが確認されている
- [ ] レビュー結果が文書化されている
- [ ] 判定結果（PASS/MINOR/MAJOR/CRITICAL）が記録されている
- [ ] MINOR以下の指摘は対応済みまたは記録済み
- [ ] **本Phase内の全作業を100%完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全作業を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 1, 2, 5, 8, 9 が完了していること
- **後続**: Phase 11 へ進む（PASS/MINOR判定の場合）

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 10 実行記録

### レビュー結果

- 判定: {{PASS/MINOR/MAJOR/CRITICAL}}
- 指摘事項数: {{数}}

### レビュー観点別結果

| 観点               | 結果     | 備考 |
| ------------------ | -------- | ---- |
| 機能要件の充足     | {{結果}} |      |
| コード品質         | {{結果}} |      |
| テストカバレッジ   | {{結果}} |      |
| セキュリティ       | {{結果}} |      |
| ドキュメント整合性 | {{結果}} |      |
| SKILL_LIST使い分け | {{結果}} |      |

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

`docs/30-workflows/skill-import-agent-system/phase-outputs/TASK-FIX-17-1/phase-11-manual-testing.md`
