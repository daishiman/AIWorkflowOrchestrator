# 値オブジェクト設計書

## 概要

本文書は、チャット履歴機能の値オブジェクト（Value Object）設計を定義する。値オブジェクトは不変であり、同一性ではなく値によって識別される。

**作成日**: 2026-01-18
**配置場所**: `packages/shared/src/features/chat-history/domain/value-objects/`

---

## 1. ChatSessionId

### 1.1 責務

- セッションの一意識別子を表現
- UUID v4形式の検証

### 1.2 設計

```typescript
// packages/shared/src/features/chat-history/domain/value-objects/ChatSessionId.ts

import { randomUUID } from "crypto";
import { Result, ok, err } from "../../../../core/Result.js";
import { InvalidIdError } from "../errors/ValueObjectErrors.js";

/**
 * チャットセッションID 値オブジェクト
 *
 * UUID v4形式のセッション一意識別子を表す。
 * 不変かつ値による等価性を持つ。
 */
export class ChatSessionId {
  private static readonly UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  private constructor(private readonly _value: string) {
    Object.freeze(this);
  }

  /**
   * 文字列からChatSessionIdを作成する
   *
   * @param value UUID文字列
   * @returns 成功時: ChatSessionId, 失敗時: InvalidIdError
   */
  static create(value: string): Result<ChatSessionId, InvalidIdError> {
    if (!value || !this.UUID_REGEX.test(value)) {
      return err(new InvalidIdError("ChatSessionId", value));
    }
    return ok(new ChatSessionId(value));
  }

  /**
   * 新しいChatSessionIdを生成する
   *
   * @returns ChatSessionId
   */
  static generate(): ChatSessionId {
    return new ChatSessionId(randomUUID());
  }

  /**
   * 文字列から直接作成する（DBからの復元用）
   * 検証なしで作成するため、内部使用のみ
   *
   * @param value UUID文字列
   * @returns ChatSessionId
   */
  static fromString(value: string): ChatSessionId {
    return new ChatSessionId(value);
  }

  /**
   * 値を取得する
   */
  get value(): string {
    return this._value;
  }

  /**
   * 等価性を判定する
   *
   * @param other 比較対象
   * @returns 等価な場合true
   */
  equals(other: ChatSessionId): boolean {
    return this._value === other._value;
  }

  /**
   * 文字列表現を返す
   */
  toString(): string {
    return this._value;
  }
}
```

---

## 2. ChatMessageId

### 2.1 責務

- メッセージの一意識別子を表現
- UUID v4形式の検証

### 2.2 設計

```typescript
// packages/shared/src/features/chat-history/domain/value-objects/ChatMessageId.ts

import { randomUUID } from "crypto";
import { Result, ok, err } from "../../../../core/Result.js";
import { InvalidIdError } from "../errors/ValueObjectErrors.js";

/**
 * チャットメッセージID 値オブジェクト
 */
export class ChatMessageId {
  private static readonly UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  private constructor(private readonly _value: string) {
    Object.freeze(this);
  }

  static create(value: string): Result<ChatMessageId, InvalidIdError> {
    if (!value || !this.UUID_REGEX.test(value)) {
      return err(new InvalidIdError("ChatMessageId", value));
    }
    return ok(new ChatMessageId(value));
  }

  static generate(): ChatMessageId {
    return new ChatMessageId(randomUUID());
  }

  static fromString(value: string): ChatMessageId {
    return new ChatMessageId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: ChatMessageId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
```

---

## 3. UserId

### 3.1 責務

- ユーザーの一意識別子を表現
- 空文字の検証

### 3.2 設計

```typescript
// packages/shared/src/features/chat-history/domain/value-objects/UserId.ts

import { Result, ok, err } from "../../../../core/Result.js";
import { InvalidIdError } from "../errors/ValueObjectErrors.js";

/**
 * ユーザーID 値オブジェクト
 */
export class UserId {
  private constructor(private readonly _value: string) {
    Object.freeze(this);
  }

  static create(value: string): Result<UserId, InvalidIdError> {
    if (!value || value.trim() === "") {
      return err(new InvalidIdError("UserId", value));
    }
    return ok(new UserId(value.trim()));
  }

  static fromString(value: string): UserId {
    return new UserId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: UserId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
```

---

## 4. ChatSessionTitle

### 4.1 責務

- セッションタイトルを表現
- 文字数制限（3〜100文字）の検証
- デフォルトタイトルの生成

### 4.2 設計

```typescript
// packages/shared/src/features/chat-history/domain/value-objects/ChatSessionTitle.ts

import { Result, ok, err } from "../../../../core/Result.js";
import { InvalidTitleError } from "../errors/ValueObjectErrors.js";

/**
 * チャットセッションタイトル 値オブジェクト
 *
 * 3〜100文字のセッションタイトルを表す。
 */
export class ChatSessionTitle {
  private static readonly MIN_LENGTH = 3;
  private static readonly MAX_LENGTH = 100;
  private static readonly DEFAULT_PREFIX = "新しいチャット";

  private constructor(private readonly _value: string) {
    Object.freeze(this);
  }

  /**
   * タイトルを作成する
   *
   * @param value タイトル文字列
   * @returns 成功時: ChatSessionTitle, 失敗時: InvalidTitleError
   */
  static create(value: string): Result<ChatSessionTitle, InvalidTitleError> {
    const trimmed = value.trim();

    if (trimmed.length < this.MIN_LENGTH) {
      return err(
        new InvalidTitleError(
          `タイトルは${this.MIN_LENGTH}文字以上必要です（現在: ${trimmed.length}文字）`,
        ),
      );
    }

    if (trimmed.length > this.MAX_LENGTH) {
      return err(
        new InvalidTitleError(
          `タイトルは${this.MAX_LENGTH}文字以内にしてください（現在: ${trimmed.length}文字）`,
        ),
      );
    }

    return ok(new ChatSessionTitle(trimmed));
  }

  /**
   * デフォルトタイトルを作成する
   *
   * @returns ChatSessionTitle（"新しいチャット YYYY-MM-DD HH:mm"形式）
   */
  static createDefault(): ChatSessionTitle {
    const now = new Date();
    const formatted = this.formatDateTime(now);
    return new ChatSessionTitle(`${this.DEFAULT_PREFIX} ${formatted}`);
  }

  /**
   * 文字列から直接作成する（DBからの復元用）
   *
   * @param value タイトル文字列
   * @returns ChatSessionTitle
   */
  static fromString(value: string): ChatSessionTitle {
    return new ChatSessionTitle(value);
  }

  /**
   * 日時をフォーマットする
   */
  private static formatDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  get value(): string {
    return this._value;
  }

  equals(other: ChatSessionTitle): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
```

---

## 5. MessageContent

### 5.1 責務

- メッセージ本文を表現
- 文字数制限（1〜100,000文字）の検証
- プレビュー生成

### 5.2 設計

```typescript
// packages/shared/src/features/chat-history/domain/value-objects/MessageContent.ts

import { Result, ok, err } from "../../../../core/Result.js";
import { InvalidContentError } from "../errors/ValueObjectErrors.js";

/**
 * メッセージ内容 値オブジェクト
 *
 * 1〜100,000文字のメッセージ本文を表す。
 */
export class MessageContent {
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 100000;
  private static readonly PREVIEW_LENGTH = 30;
  private static readonly PREVIEW_ELLIPSIS = "...";

  private constructor(private readonly _value: string) {
    Object.freeze(this);
  }

  /**
   * メッセージ内容を作成する
   *
   * @param value 内容文字列
   * @returns 成功時: MessageContent, 失敗時: InvalidContentError
   */
  static create(value: string): Result<MessageContent, InvalidContentError> {
    if (!value || value.length < this.MIN_LENGTH) {
      return err(new InvalidContentError("メッセージ内容は必須です"));
    }

    if (value.length > this.MAX_LENGTH) {
      return err(
        new InvalidContentError(
          `メッセージは${this.MAX_LENGTH.toLocaleString()}文字以内にしてください`,
        ),
      );
    }

    return ok(new MessageContent(value));
  }

  /**
   * 文字列から直接作成する（DBからの復元用）
   *
   * @param value 内容文字列
   * @returns MessageContent
   */
  static fromString(value: string): MessageContent {
    return new MessageContent(value);
  }

  get value(): string {
    return this._value;
  }

  /**
   * プレビュー文字列を取得する（先頭30文字）
   */
  get preview(): string {
    if (this._value.length <= this.constructor.PREVIEW_LENGTH) {
      return this._value;
    }
    const cutLength =
      MessageContent.PREVIEW_LENGTH - MessageContent.PREVIEW_ELLIPSIS.length;
    return this._value.slice(0, cutLength) + MessageContent.PREVIEW_ELLIPSIS;
  }

  /**
   * 文字数を取得する
   */
  get length(): number {
    return this._value.length;
  }

  equals(other: MessageContent): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
```

---

## 6. MessageRole

### 6.1 責務

- メッセージの発信者種別を表現
- 列挙型として`user`/`assistant`を表現

### 6.2 設計

```typescript
// packages/shared/src/features/chat-history/domain/value-objects/MessageRole.ts

/**
 * メッセージロール 値オブジェクト
 *
 * メッセージの発信者種別を表す列挙的な値オブジェクト。
 */
export class MessageRole {
  private static readonly _User = new MessageRole("user");
  private static readonly _Assistant = new MessageRole("assistant");

  private constructor(private readonly _value: "user" | "assistant") {
    Object.freeze(this);
  }

  /**
   * ユーザーロールを取得する
   */
  static get User(): MessageRole {
    return this._User;
  }

  /**
   * アシスタントロールを取得する
   */
  static get Assistant(): MessageRole {
    return this._Assistant;
  }

  /**
   * 文字列からMessageRoleを作成する
   *
   * @param value ロール文字列
   * @returns MessageRole
   * @throws 不正な値の場合
   */
  static fromString(value: string): MessageRole {
    if (value === "user") return this._User;
    if (value === "assistant") return this._Assistant;
    throw new Error(`Invalid message role: ${value}`);
  }

  get value(): "user" | "assistant" {
    return this._value;
  }

  get isUser(): boolean {
    return this._value === "user";
  }

  get isAssistant(): boolean {
    return this._value === "assistant";
  }

  equals(other: MessageRole): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
```

---

## 7. LLMMetadata

### 7.1 責務

- LLM応答のメタデータを表現
- トークン使用量、レスポンス時間等を管理

### 7.2 設計

```typescript
// packages/shared/src/features/chat-history/domain/value-objects/LLMMetadata.ts

import { Result, ok, err } from "../../../../core/Result.js";
import { InvalidLLMMetadataError } from "../errors/ValueObjectErrors.js";

/**
 * トークン使用量
 */
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

/**
 * LLMメタデータ作成パラメータ
 */
export interface CreateLLMMetadataParams {
  provider: string;
  model: string;
  tokenUsage?: TokenUsage;
  responseTime?: number;
  temperature?: number;
  maxTokens?: number;
}

/**
 * LLMメタデータ 値オブジェクト
 *
 * アシスタントメッセージのLLM応答に関するメタデータを表す。
 */
export class LLMMetadata {
  private constructor(
    private readonly _provider: string,
    private readonly _model: string,
    private readonly _tokenUsage: TokenUsage | null,
    private readonly _responseTime: number | null,
    private readonly _temperature: number | null,
    private readonly _maxTokens: number | null,
  ) {
    Object.freeze(this);
  }

  /**
   * LLMメタデータを作成する
   *
   * @param params 作成パラメータ
   * @returns 成功時: LLMMetadata, 失敗時: InvalidLLMMetadataError
   */
  static create(
    params: CreateLLMMetadataParams,
  ): Result<LLMMetadata, InvalidLLMMetadataError> {
    if (!params.provider || params.provider.trim() === "") {
      return err(new InvalidLLMMetadataError("LLMプロバイダーは必須です"));
    }

    if (!params.model || params.model.trim() === "") {
      return err(new InvalidLLMMetadataError("LLMモデルは必須です"));
    }

    return ok(
      new LLMMetadata(
        params.provider.trim(),
        params.model.trim(),
        params.tokenUsage ?? null,
        params.responseTime ?? null,
        params.temperature ?? null,
        params.maxTokens ?? null,
      ),
    );
  }

  /**
   * DBからの復元用
   */
  static reconstitute(
    provider: string,
    model: string,
    metadata: object,
  ): LLMMetadata {
    const meta = metadata as Record<string, unknown>;
    return new LLMMetadata(
      provider,
      model,
      meta.tokenUsage as TokenUsage | null,
      meta.responseTime as number | null,
      meta.temperature as number | null,
      meta.maxTokens as number | null,
    );
  }

  get provider(): string {
    return this._provider;
  }

  get model(): string {
    return this._model;
  }

  get tokenUsage(): TokenUsage | null {
    return this._tokenUsage;
  }

  get responseTime(): number | null {
    return this._responseTime;
  }

  get temperature(): number | null {
    return this._temperature;
  }

  get maxTokens(): number | null {
    return this._maxTokens;
  }

  /**
   * JSON形式に変換する（永続化用）
   */
  toJSON(): object {
    return {
      provider: this._provider,
      model: this._model,
      tokenUsage: this._tokenUsage,
      responseTime: this._responseTime,
      temperature: this._temperature,
      maxTokens: this._maxTokens,
    };
  }

  equals(other: LLMMetadata): boolean {
    return (
      this._provider === other._provider &&
      this._model === other._model &&
      JSON.stringify(this._tokenUsage) === JSON.stringify(other._tokenUsage)
    );
  }
}
```

---

## 8. 値オブジェクトの設計原則

### 8.1 不変性（Immutability）

- 全てのプロパティを`readonly`で宣言
- `Object.freeze(this)`でオブジェクト凍結
- コンストラクタを`private`にしてファクトリーメソッドで作成

### 8.2 値による等価性（Value Equality）

- `equals()`メソッドで値の等価性を判定
- 参照ではなく値で比較

### 8.3 自己完結性（Self-Validation）

- ファクトリーメソッドで不変条件を検証
- 不正な値では`Result.err`を返す

### 8.4 副作用なし（Side-Effect Free）

- 外部状態への依存なし
- 純粋関数として動作

---

## 9. 値オブジェクト一覧

| 値オブジェクト   | 責務                 | 不変条件              |
| ---------------- | -------------------- | --------------------- |
| ChatSessionId    | セッション識別子     | UUID v4形式           |
| ChatMessageId    | メッセージ識別子     | UUID v4形式           |
| UserId           | ユーザー識別子       | 非空文字列            |
| ChatSessionTitle | セッションタイトル   | 3〜100文字            |
| MessageContent   | メッセージ本文       | 1〜100,000文字        |
| MessageRole      | メッセージ発信者種別 | user / assistant      |
| LLMMetadata      | LLM応答メタデータ    | provider, modelは必須 |

---

## 10. エラー型

```typescript
// packages/shared/src/features/chat-history/domain/errors/ValueObjectErrors.ts

import { DomainError } from "../../../../core/errors/DomainError.js";

export class InvalidIdError extends DomainError {
  readonly code = "INVALID_ID";

  constructor(type: string, value: string) {
    super(`Invalid ${type}: ${value}`);
  }
}

export class InvalidTitleError extends DomainError {
  readonly code = "INVALID_TITLE";

  constructor(message: string) {
    super(message);
  }
}

export class InvalidContentError extends DomainError {
  readonly code = "INVALID_CONTENT";

  constructor(message: string) {
    super(message);
  }
}

export class InvalidLLMMetadataError extends DomainError {
  readonly code = "INVALID_LLM_METADATA";

  constructor(message: string) {
    super(message);
  }
}
```
