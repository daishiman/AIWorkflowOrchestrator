# SkillScanner ファイル削除レースコンディション対策 - タスク指示書

## メタ情報

```yaml
issue_number: 653
```

## メタ情報

| 項目         | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| タスクID     | task-skillscanner-file-deletion-race                  |
| タスク名     | SkillScanner SKILL.md途中削除レースコンディション対策 |
| 分類         | 改善                                                  |
| 対象機能     | SkillScanner                                          |
| 優先度       | 低                                                    |
| 見積もり規模 | 小規模                                                |
| ステータス   | 未実施                                                |
| 発見元       | TASK-8A Phase 11 手動テスト エッジケース #4           |
| 発見日       | 2026-02-02                                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-8A Phase 11 の手動テストにおいて、SkillScanner が `readdir` でディレクトリを列挙した後、`readFile` で SKILL.md を読み込むまでの間にファイルが削除された場合のエッジケースが検出された。現在の実装ではこのレースコンディションに対する明示的なハンドリングが存在しない。

### 1.2 問題点・課題

- `readdir` と `readFile` の間にファイルが削除されると、ENOENT エラーが発生する
- 現在の SkillScanner はエラーをキャッチしてスキルをスキップするが、ユーザーへのフィードバックが不十分
- ログメッセージが `[SkillScanner] Skipping skill at...` という汎用メッセージで、ファイル消失固有のメッセージがない

### 1.3 放置した場合の影響

- 実運用上の発生確率は極めて低い（P3）
- 発生した場合、エラー原因の特定に時間がかかる可能性がある
- スキルの自動インポート・ウォッチャー機能が将来追加された場合、発生確率が上昇する可能性

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillScanner の `readFile` 実行時に ENOENT エラーが発生した場合、ファイル消失固有のエラーハンドリングとログメッセージを追加し、デバッグ容易性を向上させる。

### 2.2 最終ゴール

- ENOENT エラーが発生した場合、`[SkillScanner] SKILL.md was deleted during scan: {path}` のような固有メッセージをログ出力する
- スキルスキャン全体は中断せず、当該スキルのみスキップして継続する
- 該当ケースをカバーする単体テストが追加される

### 2.3 スコープ

#### 含むもの

- SkillScanner.ts の `readFile` エラーハンドリング改善
- ENOENT 固有のログメッセージ追加
- 単体テスト追加（vi.mock で ENOENT をシミュレート）

#### 含まないもの

- ファイルウォッチャー機能の実装（別タスクスコープ）
- リトライ機構の追加（レースコンディションのためリトライは不適切）
- SkillScanner 以外のモジュールへの変更

### 2.4 成果物

| 成果物               | パス                                                                  |
| -------------------- | --------------------------------------------------------------------- |
| SkillScanner.ts 修正 | `apps/desktop/src/main/services/skill/SkillScanner.ts`                |
| 単体テスト追加       | `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts` |

---

## 3. どのように実装するか（How）

### 3.1 前提条件

- TASK-8A 完了（SkillScanner の単体テスト基盤が存在すること）

### 3.2 依存タスク

| 依存タスク | 状態 | 説明                        |
| ---------- | ---- | --------------------------- |
| TASK-8A    | 完了 | SkillScanner 単体テスト49件 |

### 3.3 必要な知識

- Node.js fs/promises API のエラーコード（ENOENT, EACCES 等）
- Vitest の vi.mock / vi.doMock によるファイルシステムモック
- SkillScanner の内部実装フロー

### 3.4 実装ステップ

1. SkillScanner.ts の `readFile` 呼び出し箇所を特定
2. catch ブロックで `error.code === 'ENOENT'` を判定
3. ENOENT 固有のログメッセージを出力
4. 該当スキルをスキップして次のスキルに進む
5. 単体テストを追加（vi.doMock で途中削除をシミュレート）

---

## 4. 検証方法

### 4.1 テストケース

| テストケース                | 期待結果                               |
| --------------------------- | -------------------------------------- |
| SKILL.md が途中で削除される | ENOENT 固有のログが出力される          |
| スキャン全体が中断しない    | 他のスキルのスキャンは正常に継続       |
| EACCES エラーの場合         | 従来の汎用エラーメッセージが出力される |

### 4.2 完了条件

- [ ] ENOENT 固有のログメッセージが実装されている
- [ ] 他のスキルへの影響がないことがテストで確認されている
- [ ] カバレッジ低下がない（84%以上維持）

---

## 5. リスクと対策

| リスク                           | 対策                                              |
| -------------------------------- | ------------------------------------------------- |
| エラーハンドリング変更の影響範囲 | 既存テスト49件のリグレッション確認                |
| ENOENT 以外のファイルエラー      | ENOENT のみ特別扱いし、他は従来通りのハンドリング |

---

## 6. 参考資料

| 資料                  | パス                                                                        |
| --------------------- | --------------------------------------------------------------------------- |
| TASK-8A Phase 11 結果 | `docs/30-workflows/TASK-8A/outputs/phase-11/manual-test-result.md`          |
| SkillScanner テスト   | `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts`       |
| SkillScanner 実装     | `apps/desktop/src/main/services/skill/SkillScanner.ts`                      |
| 品質要件仕様書        | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` |
