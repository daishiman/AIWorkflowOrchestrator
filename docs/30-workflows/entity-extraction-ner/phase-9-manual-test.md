# Phase 9: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 9                       |
| Phase名    | 手動テスト              |
| 前提Phase  | Phase 8 (最終レビュー)  |
| 後続Phase  | Phase 10 (ドキュメント) |
| ステータス | 未実施                  |
| 作成日     | 2026-01-05              |
| 機能名     | entity-extraction-ner   |

---

## 目的

自動テストでカバーできない実際のユースケースを手動で検証する。

## 背景

LLMベースの機能は出力が非決定的であるため、実際のデータを使用した手動検証が重要。期待通りのエンティティが抽出されるか、品質を目視確認する。

---

## 使用スキル

### スキル1: test-data-management

**パス**: `.claude/skills/test-data-management/SKILL.md`

**Trigger条件**: テストデータ準備、実データテスト

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 手動テスト用データを準備
3. テストケースを実行

**期待される成果物**:

- テストデータセット
- 手動テスト結果

---

## 参照資料

| 参照資料   | パス                                       | 内容       |
| ---------- | ------------------------------------------ | ---------- |
| 実装コード | `packages/shared/src/services/extraction/` | 実装成果物 |

---

## 成果物

| 成果物         | パス                             | 内容                 |
| -------------- | -------------------------------- | -------------------- |
| 手動テスト結果 | `outputs/phase-9/manual-test.md` | テスト結果記録       |
| テストデータ   | `outputs/phase-9/test-data/`     | 使用したテストデータ |

---

## 手動テストケース

### TC-001: LLMエンティティ抽出（技術文書）

**入力データ**:

```
TypeScriptとReactを使用して、Next.jsアプリケーションを構築した。
Vercelにデプロイし、PostgreSQLデータベースと連携。
開発チームはGitHubでソース管理を行っている。
```

**期待結果**:
| エンティティ | タイプ | 信頼度 |
| ------------ | ------------ | ------- |
| TypeScript | technology | 0.9+ |
| React | technology | 0.9+ |
| Next.js | technology | 0.9+ |
| Vercel | organization | 0.8+ |
| PostgreSQL | technology | 0.9+ |
| GitHub | organization | 0.8+ |

---

### TC-002: LLMエンティティ抽出（人物・組織）

**入力データ**:

```
田中太郎はABC株式会社のエンジニアとして、
2024年1月にXYZプロジェクトに参加した。
プロジェクトリーダーの山田花子と共に、
新しいAIシステムを開発している。
```

**期待結果**:
| エンティティ | タイプ | 信頼度 |
| -------------- | ------------ | ------- |
| 田中太郎 | person | 0.9+ |
| ABC株式会社 | organization | 0.9+ |
| 山田花子 | person | 0.9+ |
| XYZプロジェクト | concept | 0.7+ |
| 2024年1月 | date | 0.9+ |

---

### TC-003: ルールベース抽出（フォールバック）

**条件**: LLMプロバイダーがエラーを返す状態

**入力データ**:

```
React 18.2.0とTypeScript 5.0を使用。
Microsoft社のVS Codeで開発。
2024-01-15にリリース予定。
```

**期待結果**:

- ルールベース抽出にフォールバック
- 技術名・日付が正規表現で抽出される

---

### TC-004: バッチ処理

**入力データ**: 10個のチャンク（各100〜200文字）

**確認項目**:

- [ ] 全チャンクが処理される
- [ ] エラーがあってもスキップして継続
- [ ] 重複エンティティがマージされる
- [ ] 処理時間が妥当（30秒以内）

---

### TC-005: フィルタリング

**入力データ**: TC-001と同じ

**オプション**:

```typescript
{
  types: ['technology'],
  minConfidence: 0.9,
  maxEntities: 3
}
```

**期待結果**:

- technologyタイプのみ
- 信頼度0.9以上のみ
- 最大3件

---

## 検証手順

### 実行方法

```typescript
// テストスクリプト例
import { LLMEntityExtractor } from "@repo/shared/services/extraction";

const extractor = new LLMEntityExtractor(llmProvider);

const result = await extractor.extract(chunk, options);
console.log(JSON.stringify(result, null, 2));
```

### 結果記録フォーマット

```markdown
### TC-XXX 結果

- 実行日時: YYYY-MM-DD HH:mm
- 実行者: {{name}}
- 結果: PASS / FAIL
- 処理時間: {{ms}}
- 抽出エンティティ数: {{count}}

#### 抽出結果

| エンティティ | タイプ | 信頼度 | 期待通り |
| ------------ | ------ | ------ | -------- |
| ...          | ...    | ...    | Yes/No   |

#### 備考

-
```

---

## 完了条件

- [ ] TC-001〜TC-005が実行されている
- [ ] 全テストケースがPASSしている
- [ ] テスト結果が `outputs/phase-9/` に記録されている
- [ ] LLM出力の品質が許容範囲内

---

## 依存関係

- **前提**: Phase 8 が完了していること（PASS/MINOR判定）
- **後続**: Phase 10 (ドキュメント更新) へ進む

---

## スキルフィードバック記録

```markdown
## Phase 9 実行記録

### 使用スキル

- test-data-management: {{result}}

### テスト結果

- TC-001: {{PASS/FAIL}}
- TC-002: {{PASS/FAIL}}
- TC-003: {{PASS/FAIL}}
- TC-004: {{PASS/FAIL}}
- TC-005: {{PASS/FAIL}}

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/entity-extraction-ner/phase-10-docs.md`
