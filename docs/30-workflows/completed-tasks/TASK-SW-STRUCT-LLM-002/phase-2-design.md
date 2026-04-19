# Phase 2: 設計

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 2                                     |
| タスクID   | TASK-SW-STRUCT-LLM-002                |
| 機能名     | skill-creator-features-llm-generation |
| 前提Phase  | Phase 1（要件定義）                   |
| 後続Phase  | Phase 3（設計レビュー）               |
| 作成日     | 2026-04-18                            |
| ステータス | not_started                           |

---

## 目的

Phase 1 で定義した受け入れ基準（AC-1〜AC-4）を満たすための実装設計を行う。`plan-structure` エージェントを活用した features 自動生成の詳細設計、エラーハンドリング設計、および `generateSkillMd()` への反映フローを設計する。

---

## 実行タスク

- `plan-structure` エージェントを活用した features 生成フローの設計
- `runCreateWorkflow` 内での LLM 呼び出し設計（`loadAgent("plan-structure")` 経由）
- `StructurePlanJson.features` の生成フロー設計
- エラーハンドリング設計（LLM 失敗時の `features: []` フォールバック）
- `generateSkillMd()` への features 渡し方の設計
- 4層整合性チェック（IPC チャンネル・ハンドラー・Preload API）
- LLM プロンプト設計（スキル名・説明・目的から features 配列を生成する指示文）
- 既存の purpose 生成パターン（TASK-SW-LLM-PURPOSE-AUTO-EXTRACT）との一貫性確認

---

## 参照資料

| 資料名                        | パス                                                               | 用途                             |
| ----------------------------- | ------------------------------------------------------------------ | -------------------------------- |
| SkillCreatorService           | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`      | 変更対象ファイル（line 937-961） |
| runCreateWorkflow（line 937） | `apps/desktop/src/main/services/skill/SkillCreatorService.ts#L937` | features 生成追加箇所            |
| generateSkillMd（line 961）   | `apps/desktop/src/main/services/skill/SkillCreatorService.ts#L961` | features の SKILL.md 反映フロー  |
| Phase 1 要件定義書            | `docs/30-workflows/TASK-SW-STRUCT-LLM-002/phase-1-requirements.md` | 受け入れ基準 AC-1〜AC-4          |
| 依存タスク仕様                | TASK-SW-LLM-PURPOSE-AUTO-EXTRACT                                   | purpose 生成パターン（設計参考） |

---

## 実行手順

### 1. 変更対象の特定

#### 1.1 変更対象ファイル

| ファイル                                                                              | 変更内容                                                            |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                         | `runCreateWorkflow` 内の `features: []` を LLM 生成に切り替える     |
| `.claude/skills/skill-creator/scripts/generate_features.js`                           | features 生成 script を追加し、Claude 実行と失敗時の非 0 終了を担う |
| `.claude/skills/skill-creator/scripts/generate_skill_md.js`                           | `features` を frontmatter / 本文へ出力する                          |
| `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.features.test.ts` | AC-2/AC-3 の実出力検証を追加する                                    |

変更は複数ファイルにまたがる。`SkillCreatorService.ts` だけでなく、script と test の同 wave 更新を前提にする。

#### 1.2 変更前の現状コード

```typescript
// SkillCreatorService.ts line 937-947 付近（現状）
private async runCreateWorkflow(options) {
  const structurePlan: StructurePlanJson = {
    ...
    purpose: options.description, // AC-1: LLM統合は別タスク
    features: [], // AC-3: LLM統合は別タスク  ← ここを変更対象とする
    agents: ["extract-purpose", "plan-structure"], // AC-2: エージェント名リスト
  };
}
```

#### 1.3 変更後のコード設計

```typescript
// SkillCreatorService.ts line 937-947 付近（変更後）
private async runCreateWorkflow(options) {
  // features を LLM で生成する（失敗時は空配列にフォールバック）
  const features = await this.generateFeaturesWithLlm(
    options.description,
    signal,
  );

  const structurePlan: StructurePlanJson = {
    ...
    purpose: options.description, // AC-1: LLM統合は別タスク（TASK-SW-LLM-PURPOSE-AUTO-EXTRACT）
    features,                     // AC-3: LLM生成に切り替え（本タスク）
    agents: ["extract-purpose", "plan-structure"],
  };
}
```

### 2. features 生成メソッドの設計

#### 2.1 メソッドシグネチャ設計

```typescript
/**
 * LLM（plan-structure エージェント）を使って features 配列を自動生成する。
 * 失敗時は空配列でフォールバックする。
 */
private async generateFeaturesWithLlm(
  description: string,
  signal?: AbortSignal,
): Promise<string[]>
```

#### 2.2 内部処理フロー

```
generateFeaturesWithLlm(params)
  ├── 1. loadAgent("plan-structure") でエージェントを取得
  ├── 2. プロンプトを構築（スキル名・説明・目的を渡す）
  ├── 3. エージェントに features 生成を依頼
  ├── 4. レスポンスを string[] にパース・バリデーション
  ├── 5. 正常系: string[] を返す
  └── 6. 異常系（例外・タイムアウト・パース失敗）: [] を返す（ログ出力あり）
```

#### 2.3 LLM プロンプト設計

`plan-structure` エージェントへのプロンプト構成例:

```
スキル名: {skillName}
説明: {description}
目的: {purpose}

上記のスキルが持つ機能（features）のリストを生成してください。
各機能は短い説明文（1文）で記述してください。
出力形式は JSON 配列（string[]）のみとし、説明文は含めないでください。

例:
["テキストを要約する", "キーワードを抽出する", "感情を分析する"]
```

#### 2.4 レスポンスのパース・バリデーション設計

```typescript
// パース設計
// 1. LLM レスポンスから JSON 配列部分を抽出（正規表現）
// 2. JSON.parse() で string[] に変換
// 3. バリデーション:
//    - Array.isArray() チェック
//    - 各要素が string 型であることの確認
//    - 空文字列の除去
// 4. バリデーション失敗時は [] を返す
```

### 3. エラーハンドリング設計

#### 3.1 フォールバック設計

| エラーケース                       | ハンドリング方法                               | 動作                           |
| ---------------------------------- | ---------------------------------------------- | ------------------------------ |
| LLM タイムアウト                   | try-catch で捕捉し `[]` を返す                 | ワークフロー継続、ログ出力あり |
| ネットワークエラー                 | try-catch で捕捉し `[]` を返す                 | ワークフロー継続、ログ出力あり |
| LLM が不正なレスポンス返却         | パースエラー時に `[]` を返す                   | ワークフロー継続、ログ出力あり |
| `loadAgent("plan-structure")` 失敗 | try-catch で捕捉し `[]` を返す                 | ワークフロー継続、ログ出力あり |
| 空配列が返却された                 | そのまま `[]` として処理（フォールバック扱い） | ワークフロー継続               |

#### 3.2 ログ出力設計

```typescript
// 失敗時のログ出力例
this.logger.warn(
  "[SkillCreatorService] features LLM生成に失敗しました。空配列でフォールバックします。",
  { error: e, skillName: params.skillName },
);
```

#### 3.3 タイムアウト設計

- features 生成のタイムアウトは既存の LLM 呼び出しパターンに準ずる
- 目安: 30秒（ユーザー体験を損なわない範囲）
- タイムアウト発生時も `[]` でフォールバックする

### 4. generateSkillMd() への features 渡し方設計

#### 4.1 既存フロー確認

```
runCreateWorkflow()
  └── structurePlan に features をセット
        └── generateSkillMd(structurePlan) を呼び出す
              └── SKILL.md の features セクションに出力
```

本タスクでは `generateSkillMd()` の変更は不要。`structurePlan.features` に正しい値をセットすることで、既存の `generateSkillMd()` が自動的に SKILL.md の機能一覧に反映する。

#### 4.2 generateSkillMd() の features 参照確認コマンド

```bash
grep -n "features" apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

### 5. 4層整合性チェック

本タスクは `SkillCreatorService` 内部の処理変更であり、IPC チャンネルの追加・変更は発生しない。ただし以下の観点でチェックを行う。

| レイヤー | 確認内容                                                                  | 本タスクでの変更 |
| -------- | ------------------------------------------------------------------------- | ---------------- |
| shared   | IPC チャンネル定数の変更は不要                                            | 変更なし         |
| preload  | Preload API の変更は不要                                                  | 変更なし         |
| main     | `SkillCreatorService.ts` の内部ロジック変更（IPC ハンドラーへの影響なし） | 変更あり（内部） |
| renderer | Renderer 側の変更は不要（features は自動生成されるため UI 変更不要）      | 変更なし         |

### 6. TASK-SW-LLM-PURPOSE-AUTO-EXTRACT との設計一貫性

TASK-SW-LLM-PURPOSE-AUTO-EXTRACT が完了後の場合は、そのタスクで確立した以下のパターンに準拠する:

- `loadAgent()` の呼び出しパターン
- LLM レスポンスのパース方法
- エラーハンドリング・フォールバックの実装パターン
- ログ出力のフォーマット

TASK-SW-LLM-PURPOSE-AUTO-EXTRACT 未完了の場合でも独立実装が可能だが、完了後にリファクタリングでパターンを統一することが望ましい。

---

## 統合テスト連携

- `runCreateWorkflow` の統合テストにおいて、features が非空配列であることを検証するケースを追加する
- LLM モックを用いた正常系テスト（features が配列で返却される）
- LLM 失敗シミュレーションによる異常系テスト（フォールバックで `[]` が返却される）
- フォールバック時でも SKILL.md が正常に生成されることの確認

---

## 多角的チェック観点（AIが判断）

| 観点                 | 確認内容                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| 実装範囲の最小化     | `generateSkillMd()` を変更せず、`runCreateWorkflow` 内の1箇所の変更のみで実現できるか             |
| 型安全性             | `generateFeaturesWithLlm()` の戻り値が `string[]` として型付けされているか（`any` 型不使用）      |
| フォールバック一貫性 | すべての異常系ケースで `[]` フォールバックが確実に実行されるか（例外が漏れていないか）            |
| プロンプト品質       | `plan-structure` エージェントへのプロンプトがスキルの特性を十分に反映した features を生成できるか |
| パフォーマンス影響   | features 生成の LLM 呼び出しが create ワークフロー全体の所要時間に与える影響が許容範囲内か        |
| テストの独立性       | LLM 呼び出し部分が `generateFeaturesWithLlm()` に切り出されることでモックテストが容易になるか     |
| 後方互換性           | update ワークフローへの影響がないか（features 生成は create のみに限定されているか）              |

---

## サブタスク管理

| No. | サブタスク内容                                                       | 状態        |
| --- | -------------------------------------------------------------------- | ----------- |
| 1   | `plan-structure` エージェントの仕様確認と features 生成適合性の検証  | not_started |
| 2   | `generateFeaturesWithLlm()` メソッドのシグネチャ・フロー設計         | not_started |
| 3   | LLM プロンプト設計（スキル名・説明・目的からの features 生成指示文） | not_started |
| 4   | レスポンスのパース・バリデーション設計                               | not_started |
| 5   | エラーハンドリング・フォールバック設計                               | not_started |
| 6   | `generateSkillMd()` への features 渡し方確認                         | not_started |
| 7   | 4層整合性チェック（IPC 変更不要の確認）                              | not_started |
| 8   | TASK-SW-LLM-PURPOSE-AUTO-EXTRACT との一貫性確認                      | not_started |

---

## 成果物

| 成果物         | パス                                                         | 説明           |
| -------------- | ------------------------------------------------------------ | -------------- |
| Phase 2 設計書 | `docs/30-workflows/TASK-SW-STRUCT-LLM-002/phase-2-design.md` | 本ドキュメント |

---

## 完了条件

- [ ] `plan-structure` エージェントを活用した features 生成フローが設計されている
- [ ] `generateFeaturesWithLlm()` のシグネチャ・内部処理フローが定義されている
- [ ] LLM プロンプトの設計（スキル名・説明・目的を渡す方式）が定義されている
- [ ] レスポンスのパース・バリデーション方法が設計されている
- [ ] 全異常系（タイムアウト・ネットワークエラー・パース失敗）のフォールバック設計が完了している
- [ ] `generateSkillMd()` への features 渡し方が確認されている（変更不要であることの確認含む）
- [ ] 4層整合性チェックで IPC 変更が不要であることが確認されている
- [ ] TASK-SW-LLM-PURPOSE-AUTO-EXTRACT との設計一貫性が確認されている

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成

---

## 次Phase

Phase 3（設計レビューゲート）へ
