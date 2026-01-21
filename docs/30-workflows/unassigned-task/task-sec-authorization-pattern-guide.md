# 認可パターン拡張ガイドライン作成 - タスク指示書

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | SEC-GUIDE-001                              |
| タスク名     | 認可パターン拡張ガイドライン作成           |
| 分類         | ドキュメント                               |
| 対象機能     | 全サービス層（認可チェック対象）           |
| 優先度       | 低                                         |
| 見積もり規模 | 小規模                                     |
| ステータス   | 未実施                                     |
| 発見元       | Phase 12（SECURITY-001システム仕様更新時） |
| 発見日       | 2026-01-19                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

SECURITY-001タスクでChatHistoryServiceに認可チェックパターンを実装した。このパターンは以下の要素で構成される：

- `requestUserId`パラメータによる認可チェック
- `verifySessionOwnership`メソッドによる所有者検証
- `UnauthorizedError`クラスによるエラーハンドリング
- Fail-Secure設計原則

今後、他のサービス（将来追加されるもの）にも同様のパターンを適用する必要があるが、実装ガイドラインがドキュメント化されていない。

**aiworkflow-requirements参照**:

- `references/interfaces-chat-history.md` - 認可チェック実装例
- `references/error-handling.md` - UnauthorizedError仕様
- `references/security-principles.md` - セキュリティ設計原則

### 1.2 問題点・課題

**現在のドキュメント状態**:

- ChatHistoryServiceの認可実装は仕様書に記載済み
- 他サービスへの適用方法が明確でない
- 認可パターンの再利用性が低い
- 新規開発者が認可実装を誤る可能性

**開発プロセス上の問題**:

- 一貫性のない認可実装が発生するリスク
- コードレビューでの指摘基準が曖昧
- 認可漏れ（OWASP A01）が発生しやすい

### 1.3 放置した場合の影響

| 影響領域       | 影響度 | 説明                         |
| -------------- | ------ | ---------------------------- |
| 開発効率       | Medium | 認可実装の学習コストが高い   |
| コード品質     | Medium | 一貫性のない認可実装が増える |
| セキュリティ   | Medium | 認可漏れのリスクが高まる     |
| コードレビュー | Low    | レビュー基準が曖昧になる     |

---

## 2. 何を達成するか（What）

### 2.1 目的

SECURITY-001で実装した認可パターンを他のサービスに適用するためのガイドラインを作成し、一貫性のある認可実装を促進する。

### 2.2 最終ゴール

- ✅ 認可パターン実装ガイドラインの作成
- ✅ サービス層認可チェックのテンプレートコード提供
- ✅ 認可対象リソース判定基準の明文化
- ✅ コードレビューチェックリストの作成
- ✅ aiworkflow-requirements仕様への追加

### 2.3 スコープ

#### 含むもの

- 認可パターン実装ガイドライン（Markdown）
- サービス層認可チェックテンプレート
- 認可対象リソース判定フローチャート
- コードレビュー用認可チェックリスト
- aiworkflow-requirements仕様更新

#### 含まないもの

- 具体的なサービス実装（別タスクで対応）
- IPC層認可バリデーション（SEC-IPC-001で対応）
- 認可失敗監視機能（SEC-MONITOR-001で対応）

### 2.4 成果物

| 種別           | 成果物                             | 配置先                                                                              |
| -------------- | ---------------------------------- | ----------------------------------------------------------------------------------- |
| ドキュメント   | 認可パターン実装ガイドライン       | `.claude/skills/aiworkflow-requirements/references/security-authorization-guide.md` |
| テンプレート   | サービス層認可チェックテンプレート | 上記ガイドライン内に含む                                                            |
| チェックリスト | コードレビュー用認可チェックリスト | 上記ガイドライン内に含む                                                            |
| 仕様更新       | security-principles.md更新         | `.claude/skills/aiworkflow-requirements/references/`                                |
| 仕様更新       | topic-map.md更新                   | `.claude/skills/aiworkflow-requirements/indexes/`                                   |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [x] SECURITY-001（ChatHistoryService認可チェック）が完了していること
- [x] aiworkflow-requirements仕様書が最新化されていること

### 3.2 依存タスク

**先に完了している必要があるタスク**:

- SECURITY-001: ChatHistoryService認可チェック（完了済み）

**同時実施可能なタスク**:

- SEC-IPC-001: IPC層認可バリデーション
- SEC-MONITOR-001: 認可失敗監視・アラート機能

### 3.3 必要な知識

- OWASP A01:2021 Broken Access Control
- TypeScript設計パターン
- Markdownドキュメント作成
- aiworkflow-requirements仕様構造

### 3.4 推奨アプローチ

1. **既存実装の分析**: ChatHistoryServiceの認可実装を分析し、パターンを抽出
2. **ガイドライン構造設計**: Why/What/How/Checklist形式でドキュメント構造を設計
3. **テンプレート作成**: 再利用可能なコードテンプレートを作成
4. **チェックリスト作成**: コードレビュー用の認可チェックリストを作成
5. **仕様書更新**: aiworkflow-requirements仕様を更新

---

## 4. 実行手順

### Phase構成

```
Phase 1: 既存実装分析とパターン抽出
  ↓
Phase 2: ガイドライン構造設計
  ↓
Phase 3: ガイドライン作成
  ↓
Phase 4: テンプレート・チェックリスト作成
  ↓
Phase 5: aiworkflow-requirements仕様更新
```

---

### Phase 1: 既存実装分析とパターン抽出

#### 目的

ChatHistoryServiceの認可実装から再利用可能なパターンを抽出する。

#### 手順

1. `chat-history-service.ts`の認可実装を分析
2. `errors.ts`のUnauthorizedError実装を分析
3. `interfaces-chat-history.md`の認可仕様を確認
4. 以下のパターン要素を抽出:
   - requestUserIdパラメータの追加方法
   - verifyOwnership検証メソッドの構造
   - UnauthorizedErrorのスロー条件
   - Fail-Secure設計の適用方法

#### 抽出すべきパターン

| パターン要素       | 説明                                    |
| ------------------ | --------------------------------------- |
| パラメータ追加     | メソッドシグネチャへのrequestUserId追加 |
| 所有者検証メソッド | verifyXxxOwnership private メソッド     |
| エラー生成         | UnauthorizedError(message, type, id)    |
| Fail-Secure        | 存在チェックと認可チェックの統合        |
| 情報漏洩防止       | 存在/認可で同一エラーメッセージ         |

#### 完了条件

- [ ] 認可パターン5要素の抽出完了
- [ ] パターン要素のコード例収集完了

---

### Phase 2: ガイドライン構造設計

#### 目的

ガイドラインドキュメントの構造を設計する。

#### 推奨構造

```markdown
# 認可パターン実装ガイドライン

## 1. 概要

## 2. 対象読者

## 3. 認可が必要なリソース判定

## 4. 実装パターン

### 4.1 パラメータ追加

### 4.2 所有者検証メソッド

### 4.3 エラーハンドリング

### 4.4 Fail-Secure設計

## 5. テンプレートコード

## 6. 適用手順

## 7. コードレビューチェックリスト

## 8. よくある間違いと対策

## 9. 関連ドキュメント
```

#### 完了条件

- [ ] ガイドライン構造設計完了

---

### Phase 3: ガイドライン作成

#### 目的

認可パターン実装ガイドラインを作成する。

#### 手順

1. `security-authorization-guide.md`を新規作成
2. Phase 2の構造に従ってコンテンツを記述
3. コード例を含める（ChatHistoryServiceから抽出）
4. 図表を追加（認可フロー図等）

#### ガイドライン内容例

````markdown
## 4. 実装パターン

### 4.1 パラメータ追加

認可チェックが必要なメソッドには`requestUserId`パラメータを追加する。

**Before**:

```typescript
async getResource(resourceId: string): Promise<Resource>
```
````

**After**:

```typescript
async getResource(resourceId: string, requestUserId: string): Promise<Resource>
```

### 4.2 所有者検証メソッド

Private メソッドで所有者検証を実装する。

```typescript
private async verifyResourceOwnership(
  resourceId: string,
  requestUserId: string,
): Promise<Resource> {
  const resource = await this.repository.findById(resourceId);

  // Fail-Secure: 存在チェックと認可チェックで同一エラー
  if (!resource || resource.userId !== requestUserId) {
    throw new UnauthorizedError(
      UNAUTHORIZED_ERROR_MESSAGE,
      'RESOURCE',
      resourceId,
    );
  }

  return resource;
}
```

````

#### 完了条件

- [ ] security-authorization-guide.md作成完了
- [ ] 全セクション記述完了
- [ ] コード例追加完了

---

### Phase 4: テンプレート・チェックリスト作成

#### 目的

再利用可能なテンプレートとコードレビュー用チェックリストを作成する。

#### テンプレート例

```typescript
// === 認可チェックテンプレート ===
// 1. メソッドシグネチャにrequestUserIdを追加
async getXxx(xxxId: string, requestUserId: string): Promise<Xxx> {
  // 2. 所有者検証メソッドを呼び出し
  const xxx = await this.verifyXxxOwnership(xxxId, requestUserId);

  // 3. ビジネスロジック実行
  return xxx;
}

// 4. 所有者検証メソッド（private）
private async verifyXxxOwnership(
  xxxId: string,
  requestUserId: string,
): Promise<Xxx> {
  const xxx = await this.repository.findById(xxxId);

  // 5. Fail-Secure: 存在と認可を同一エラーで処理
  if (!xxx || xxx.userId !== requestUserId) {
    throw new UnauthorizedError(
      UNAUTHORIZED_ERROR_MESSAGE,
      RESOURCE_TYPE.XXX,
      xxxId,
    );
  }

  return xxx;
}
````

#### チェックリスト例

```markdown
## コードレビュー認可チェックリスト

### 必須確認項目

- [ ] リソースアクセスメソッドにrequestUserIdパラメータがあるか
- [ ] verifyXxxOwnership検証メソッドが実装されているか
- [ ] 存在チェックと認可チェックで同一エラーを返しているか
- [ ] UnauthorizedErrorが正しくスローされているか
- [ ] エラーメッセージに機密情報が含まれていないか
- [ ] 認可テストが追加されているか
```

#### 完了条件

- [ ] テンプレートコード作成完了
- [ ] チェックリスト作成完了

---

### Phase 5: aiworkflow-requirements仕様更新

#### 目的

aiworkflow-requirementsのシステム仕様を更新する。

#### 手順

1. `references/security-authorization-guide.md`をreferences/に配置
2. `references/security-principles.md`に認可パターンセクションを追加
3. `indexes/topic-map.md`にエントリを追加
4. `SKILL.md`の変更履歴を更新

#### 完了条件

- [ ] security-authorization-guide.md配置完了
- [ ] security-principles.md更新完了
- [ ] topic-map.md更新完了
- [ ] SKILL.md変更履歴追記

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 認可パターン実装ガイドライン作成完了
- [ ] テンプレートコード作成完了
- [ ] コードレビューチェックリスト作成完了

### 品質要件

- [ ] ガイドラインがWhy/What/How形式で記述されている
- [ ] コード例が正しく動作する
- [ ] 100人中100人が同じ理解で実行できる粒度

### ドキュメント要件

- [ ] security-authorization-guide.md作成
- [ ] security-principles.md更新
- [ ] topic-map.md更新
- [ ] SKILL.md変更履歴追記

---

## 6. 検証方法

### レビュー観点

1. ガイドラインの明確性 - 新規開発者が理解できるか
2. テンプレートの再利用性 - 他サービスに適用可能か
3. チェックリストの網羅性 - 認可漏れを検出できるか

### 検証手順

1. 新規開発者にガイドラインを読んでもらい、理解度を確認
2. テンプレートを使用して新規サービスの認可実装を試行
3. チェックリストを使用して既存コードをレビュー

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                           |
| -------------------------- | ------ | -------- | ------------------------------ |
| ガイドラインが抽象的すぎる | Medium | Medium   | 具体的なコード例を豊富に含める |
| チェックリストの漏れ       | Medium | Low      | OWASP A01を参照して網羅性確保  |
| 更新が追随しない           | Low    | Medium   | SKILL.md変更履歴で追跡         |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` - 認可実装例
- `.claude/skills/aiworkflow-requirements/references/error-handling.md` - UnauthorizedError仕様
- `.claude/skills/aiworkflow-requirements/references/security-principles.md` - セキュリティ原則

### 参考資料

- [OWASP A01:2021 - Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)

---

## 9. 備考

### 発見経緯

SECURITY-001タスクのPhase 12（システム仕様更新）において、aiworkflow-requirementsを更新した際、認可パターンの再利用ガイドラインが不足していることを検出した。

### 補足事項

- このガイドラインはSECURITY-001のナレッジを組織知識化するためのタスク
- 将来的に追加されるサービスはこのガイドラインに従って認可を実装すること
- ガイドラインは定期的にレビューし、必要に応じて更新すること
