# TASK-P0-09-U1-C: audit 永続化 — タスク指示書

```yaml
issue_number: 1955
task_id: TASK-P0-09-U1-C
task_name: audit-persistence
category: インフラ
target_feature: SkillCreatorAuditSink / 永続化層
priority: 低
scale: 中規模
status: 未着手
source_phase: Phase 12（TASK-P0-09-U1 unassigned-task-detection）
created_date: 2026-04-06
parent_task: TASK-P0-09-U1
dependencies:
  - TASK-P0-09-U1
```

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスクID     | TASK-P0-09-U1-C                                |
| タスク名     | audit-persistence                              |
| 分類         | インフラ                                       |
| 対象機能     | SkillCreatorAuditSink / 永続化層               |
| 優先度       | 低                                             |
| 見積もり規模 | 中規模                                         |
| ステータス   | 未着手                                         |
| 発見元       | Phase 12（TASK-P0-09-U1 スコープ外として明示） |
| 発見日       | 2026-04-06                                     |

---

## 苦戦箇所・知見（TASK-P0-09-U1 実装時）

### 苦戦箇所 1: in-memory ring buffer の容量設計

現在の `SkillCreatorAuditSink` は in-memory ring buffer でイベントを保持している。リングバッファのサイズ（デフォルト 100 件）を超えると古いイベントが失われる。永続化する場合、書き込みタイミング（同期 vs 非同期）と I/O エラーハンドリングが課題になる。

**知見**: 永続化の実装には「書き込み失敗でも governance 判定を止めない」設計が必須。audit はあくまでログであり、失敗しても`allow`/`deny`の判定結果に影響させてはならない。非同期 fire-and-forget + エラーハンドリングでログ記録する。

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-P0-09-U1 で実装した `SkillCreatorAuditSink` は in-memory ring buffer でイベントを保持している。アプリ再起動で全イベントが失われるため、長期的なセキュリティ監査・デバッグには不十分。

### 1.2 問題点・課題

- アプリ再起動で audit ログが消える（セキュリティ監査に使えない）。
- ring buffer の容量（100件）を超えると古いイベントが失われる。
- 本番環境での governance deny パターン分析ができない。

### 1.3 放置した場合の影響

- セキュリティインシデント発生時に governance の動作履歴を確認できない。
- governance policy の改善に必要なデータが蓄積されない。
- コンプライアンス要件（将来的な）を満たせない可能性。

---

## 2. 何を達成するか（What）

### 2.1 目的

`SkillCreatorAuditSink` の in-memory ring buffer をファイル（または DB）へ永続化し、アプリ再起動後も audit ログを参照できるようにする。

### 2.2 最終ゴール

1. governance イベントがファイル（JSONL 形式推奨）またはローカル DB に永続化される。
2. アプリ再起動後も過去の audit ログを確認できる。
3. 永続化の失敗が governance 判定（allow/deny）に影響しない（fire-and-forget）。
4. ログのローテーション（サイズ/日付）が機能する。

### 2.3 スコープ

#### 含むもの

- `SkillCreatorAuditSink` への永続化層追加
- JSONL ファイルへの非同期書き込み（または SQLite/LevelDB）
- ログローテーション（最大サイズ or 日付ベース）
- 永続化失敗時のフォールバック（in-memory のみ継続）

#### 含まないもの

- renderer 側でのログ表示 UI（TASK-P0-09-U1-B）
- クラウドへの audit ログ送信（将来スコープ）
- audit ログの検索・フィルタリング API（将来スコープ）

### 2.4 成果物

| 成果物                           | パス                                                                                    |
| -------------------------------- | --------------------------------------------------------------------------------------- |
| 修正: `SkillCreatorAuditSink.ts` | `apps/desktop/src/main/services/runtime/governance/SkillCreatorAuditSink.ts`            |
| 追加: `AuditLogWriter.ts`        | `apps/desktop/src/main/services/runtime/governance/AuditLogWriter.ts`                   |
| テスト                           | `apps/desktop/src/main/services/runtime/__tests__/governance/audit-persistence.test.ts` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-P0-09-U1 が完了していること（AuditSink 実装済み）
- Electron の `app.getPath('userData')` でユーザーデータディレクトリを取得できること
- Node.js の `fs/promises` または既存のファイル書き込みユーティリティを使用できること

### 3.2 依存タスク

- TASK-P0-09-U1（path-scoped-governance-runtime-enforcement）: **完了済み**

### 3.3 推奨アプローチ

```typescript
// AuditLogWriter 設計イメージ
class AuditLogWriter {
  constructor(
    private readonly logPath: string, // app.getPath('userData') + '/audit.jsonl'
    private readonly maxSizeBytes = 10 * 1024 * 1024, // 10MB
  ) {}

  // fire-and-forget: 失敗しても governance 判定に影響させない
  async write(event: AuditEvent): Promise<void> {
    try {
      const line =
        JSON.stringify({ ...event, timestamp: new Date().toISOString() }) +
        "\n";
      await fs.appendFile(this.logPath, line, "utf-8");
      await this.rotateIfNeeded();
    } catch (err) {
      // ログ書き込み失敗はサイレントに処理（governance 判定には影響しない）
      logger.warn("AuditLogWriter: write failed", err);
    }
  }

  private async rotateIfNeeded(): Promise<void> {
    const stat = await fs.stat(this.logPath).catch(() => null);
    if (stat && stat.size > this.maxSizeBytes) {
      // ローテーション: audit.jsonl → audit-YYYYMMDD.jsonl
      const archive = this.logPath.replace(".jsonl", `-${dateStr()}.jsonl`);
      await fs.rename(this.logPath, archive);
    }
  }
}
```

### 3.4 ストレージ選択

| 方式    | メリット                        | デメリット                   | 推奨度 |
| ------- | ------------------------------- | ---------------------------- | ------ |
| JSONL   | シンプル、外部ツールで解析容易  | 大量データで検索が遅い       | ★★★    |
| SQLite  | クエリ可能、インデックス対応    | 依存追加、スキーマ管理が必要 | ★★     |
| LevelDB | 高速 K/V、Electron と親和性高い | クエリ非対応                 | ★      |

**推奨**: JSONL（シンプルさを優先、将来的に SQLite へ移行可能な設計にする）

---

## 4. 実行手順

### Phase 1: 現状調査

`SkillCreatorAuditSink` の実装とファイル書き込みユーティリティを調査する。

### Phase 2: 設計

`AuditLogWriter` の設計とローテーション戦略を決定する。

### Phase 3: 設計レビュー

fire-and-forget パターンとエラーハンドリングの整合を確認する。

### Phase 4: テスト作成（TDD Red）

永続化・ローテーション・失敗フォールバックのテストを先に書く。

### Phase 5: 実装（Green）

`AuditLogWriter` 実装 → `SkillCreatorAuditSink` への統合。

### Phase 6: テスト拡充

高頻度書き込み・ファイルロック・ディスク満杯のエッジケースを追加する。

### Phase 7: カバレッジ確認

branch coverage 80%+ を確認する。

### Phase 8: リファクタリング

`AuditLogWriter` の責務分離を確認する。

### Phase 9: 品質保証

```bash
pnpm --filter @repo/desktop lint --quiet
pnpm --filter @repo/desktop typecheck
cd apps/desktop && npx vitest run src/main/services/runtime/__tests__/governance/
```

### Phase 10: 最終レビュー

- [ ] audit イベントがファイルに永続化される
- [ ] 永続化失敗が governance 判定に影響しない
- [ ] ローテーションが機能する
- [ ] 既存テスト全 PASS

### Phase 11: 動作確認（NON_VISUAL）

テスト証跡を記録する。

### Phase 12: ドキュメント更新

`outputs/phase-12/` に全 6 成果物を作成する。

### Phase 13: PR 作成

PR タイトル: `feat(governance): TASK-P0-09-U1-C SkillCreatorAuditSink JSONL 永続化`

---

## 5. 完了条件チェックリスト

- [ ] governance イベントが JSONL ファイルに永続化される
- [ ] アプリ再起動後も過去のログを参照できる
- [ ] 10MB 超でローテーションが発生する
- [ ] 永続化失敗時は in-memory のみ継続（governance 判定に影響しない）
- [ ] 既存 101 件 governance tests が全 PASS
- [ ] TypeScript 型エラーなし
- [ ] lint エラーなし

---

## 6. リスクと対策

| リスク                                   | 影響度 | 発生確率 | 対策                                                |
| ---------------------------------------- | ------ | -------- | --------------------------------------------------- |
| 書き込み失敗が governance 判定をブロック | 高     | 低       | fire-and-forget + try/catch で分離                  |
| ディスク使用量の増大                     | 中     | 中       | ローテーション + 古いアーカイブの自動削除           |
| テスト環境でのファイル書き込み           | 低     | 低       | テスト用の一時ディレクトリ（`tmp/`）を使用          |
| Windows / macOS パスの違い               | 低     | 中       | `path.join` と `app.getPath` を使用し OS 差異を吸収 |

---

## 7. 参照情報

| 資料                      | パス                                                                                          |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| 親タスク（U1）実装記録    | `docs/30-workflows/completed-tasks/task-p0-09-u1-path-scoped-governance-runtime-enforcement/` |
| AuditSink 実装            | `apps/desktop/src/main/services/runtime/governance/SkillCreatorAuditSink.ts`                  |
| unassigned-task-detection | `outputs/phase-12/unassigned-task-detection.md`（TASK-P0-09-U1）                              |
| Electron userData パス    | `app.getPath('userData')` — Electron 公式ドキュメント参照                                     |
