/**
 * Knowledge Graph Store エラークラス テスト
 *
 * @module errors.test
 */

import { describe, it, expect } from "vitest";
import {
  KnowledgeGraphError,
  EntityNotFoundError,
  RelationNotFoundError,
  SelfLoopError,
  EvidenceRequiredError,
  DatabaseConnectionError,
  DatabaseQueryError,
  ValidationError,
} from "../errors";

describe("KnowledgeGraphError", () => {
  describe("error construction", () => {
    it("should create error with message", () => {
      const error = new KnowledgeGraphError("Test error message");
      expect(error.message).toBe("Test error message");
    });

    it("should have correct error name", () => {
      const error = new KnowledgeGraphError("Test");
      expect(error.name).toBe("KnowledgeGraphError");
    });

    it("should be instance of Error", () => {
      const error = new KnowledgeGraphError("Test");
      expect(error).toBeInstanceOf(Error);
    });

    it("should be instance of KnowledgeGraphError", () => {
      const error = new KnowledgeGraphError("Test");
      expect(error).toBeInstanceOf(KnowledgeGraphError);
    });

    it("should have correct prototype chain", () => {
      const error = new KnowledgeGraphError("Test");
      expect(Object.getPrototypeOf(error)).toBe(KnowledgeGraphError.prototype);
    });
  });
});

describe("EntityNotFoundError", () => {
  describe("error construction", () => {
    it("should create error with entity ID", () => {
      const error = new EntityNotFoundError("entity-123");
      expect(error.message).toBe("Entity not found: entity-123");
    });

    it("should have correct error name", () => {
      const error = new EntityNotFoundError("entity-123");
      expect(error.name).toBe("EntityNotFoundError");
    });

    it("should store entityId property", () => {
      const error = new EntityNotFoundError("entity-123");
      expect(error.entityId).toBe("entity-123");
    });

    it("should be instance of KnowledgeGraphError", () => {
      const error = new EntityNotFoundError("entity-123");
      expect(error).toBeInstanceOf(KnowledgeGraphError);
    });

    it("should be instance of EntityNotFoundError", () => {
      const error = new EntityNotFoundError("entity-123");
      expect(error).toBeInstanceOf(EntityNotFoundError);
    });

    it("should have correct prototype chain", () => {
      const error = new EntityNotFoundError("entity-123");
      expect(Object.getPrototypeOf(error)).toBe(EntityNotFoundError.prototype);
    });
  });
});

describe("RelationNotFoundError", () => {
  describe("error construction", () => {
    it("should create error with relation ID", () => {
      const error = new RelationNotFoundError("relation-456");
      expect(error.message).toBe("Relation not found: relation-456");
    });

    it("should have correct error name", () => {
      const error = new RelationNotFoundError("relation-456");
      expect(error.name).toBe("RelationNotFoundError");
    });

    it("should store relationId property", () => {
      const error = new RelationNotFoundError("relation-456");
      expect(error.relationId).toBe("relation-456");
    });

    it("should be instance of KnowledgeGraphError", () => {
      const error = new RelationNotFoundError("relation-456");
      expect(error).toBeInstanceOf(KnowledgeGraphError);
    });

    it("should be instance of RelationNotFoundError", () => {
      const error = new RelationNotFoundError("relation-456");
      expect(error).toBeInstanceOf(RelationNotFoundError);
    });

    it("should have correct prototype chain", () => {
      const error = new RelationNotFoundError("relation-456");
      expect(Object.getPrototypeOf(error)).toBe(
        RelationNotFoundError.prototype,
      );
    });
  });
});

describe("SelfLoopError", () => {
  describe("error construction", () => {
    it("should create error with default message", () => {
      const error = new SelfLoopError();
      expect(error.message).toBe("Self-loop relations are not allowed");
    });

    it("should have correct error name", () => {
      const error = new SelfLoopError();
      expect(error.name).toBe("SelfLoopError");
    });

    it("should be instance of KnowledgeGraphError", () => {
      const error = new SelfLoopError();
      expect(error).toBeInstanceOf(KnowledgeGraphError);
    });

    it("should be instance of SelfLoopError", () => {
      const error = new SelfLoopError();
      expect(error).toBeInstanceOf(SelfLoopError);
    });

    it("should have correct prototype chain", () => {
      const error = new SelfLoopError();
      expect(Object.getPrototypeOf(error)).toBe(SelfLoopError.prototype);
    });
  });
});

describe("EvidenceRequiredError", () => {
  describe("error construction", () => {
    it("should create error with default message", () => {
      const error = new EvidenceRequiredError();
      expect(error.message).toBe(
        "At least one evidence is required for a relation",
      );
    });

    it("should have correct error name", () => {
      const error = new EvidenceRequiredError();
      expect(error.name).toBe("EvidenceRequiredError");
    });

    it("should be instance of KnowledgeGraphError", () => {
      const error = new EvidenceRequiredError();
      expect(error).toBeInstanceOf(KnowledgeGraphError);
    });

    it("should be instance of EvidenceRequiredError", () => {
      const error = new EvidenceRequiredError();
      expect(error).toBeInstanceOf(EvidenceRequiredError);
    });

    it("should have correct prototype chain", () => {
      const error = new EvidenceRequiredError();
      expect(Object.getPrototypeOf(error)).toBe(
        EvidenceRequiredError.prototype,
      );
    });
  });
});

describe("DatabaseConnectionError", () => {
  describe("error construction", () => {
    it("should create error with message", () => {
      const error = new DatabaseConnectionError("Connection refused");
      expect(error.message).toBe(
        "Database connection error: Connection refused",
      );
    });

    it("should have correct error name", () => {
      const error = new DatabaseConnectionError("Test");
      expect(error.name).toBe("DatabaseConnectionError");
    });

    it("should store originalError when provided", () => {
      const originalError = new Error("Original error");
      const error = new DatabaseConnectionError(
        "Connection failed",
        originalError,
      );
      expect(error.originalError).toBe(originalError);
    });

    it("should have undefined originalError when not provided", () => {
      const error = new DatabaseConnectionError("Connection failed");
      expect(error.originalError).toBeUndefined();
    });

    it("should be instance of KnowledgeGraphError", () => {
      const error = new DatabaseConnectionError("Test");
      expect(error).toBeInstanceOf(KnowledgeGraphError);
    });

    it("should be instance of DatabaseConnectionError", () => {
      const error = new DatabaseConnectionError("Test");
      expect(error).toBeInstanceOf(DatabaseConnectionError);
    });

    it("should have correct prototype chain", () => {
      const error = new DatabaseConnectionError("Test");
      expect(Object.getPrototypeOf(error)).toBe(
        DatabaseConnectionError.prototype,
      );
    });
  });
});

describe("DatabaseQueryError", () => {
  describe("error construction", () => {
    it("should create error with message", () => {
      const error = new DatabaseQueryError("Query failed");
      expect(error.message).toBe("Database query error: Query failed");
    });

    it("should have correct error name", () => {
      const error = new DatabaseQueryError("Test");
      expect(error.name).toBe("DatabaseQueryError");
    });

    it("should store originalError when provided", () => {
      const originalError = new Error("SQL syntax error");
      const error = new DatabaseQueryError("Query failed", originalError);
      expect(error.originalError).toBe(originalError);
    });

    it("should store query when provided", () => {
      const error = new DatabaseQueryError(
        "Query failed",
        undefined,
        "SELECT * FROM entities",
      );
      expect(error.query).toBe("SELECT * FROM entities");
    });

    it("should store both originalError and query", () => {
      const originalError = new Error("SQL error");
      const error = new DatabaseQueryError(
        "Query failed",
        originalError,
        "SELECT * FROM entities",
      );
      expect(error.originalError).toBe(originalError);
      expect(error.query).toBe("SELECT * FROM entities");
    });

    it("should have undefined properties when not provided", () => {
      const error = new DatabaseQueryError("Query failed");
      expect(error.originalError).toBeUndefined();
      expect(error.query).toBeUndefined();
    });

    it("should be instance of KnowledgeGraphError", () => {
      const error = new DatabaseQueryError("Test");
      expect(error).toBeInstanceOf(KnowledgeGraphError);
    });

    it("should be instance of DatabaseQueryError", () => {
      const error = new DatabaseQueryError("Test");
      expect(error).toBeInstanceOf(DatabaseQueryError);
    });

    it("should have correct prototype chain", () => {
      const error = new DatabaseQueryError("Test");
      expect(Object.getPrototypeOf(error)).toBe(DatabaseQueryError.prototype);
    });
  });
});

describe("ValidationError", () => {
  describe("error construction", () => {
    it("should create error with message", () => {
      const error = new ValidationError("Invalid input");
      expect(error.message).toBe("Validation error: Invalid input");
    });

    it("should have correct error name", () => {
      const error = new ValidationError("Test");
      expect(error.name).toBe("ValidationError");
    });

    it("should store field when provided", () => {
      const error = new ValidationError("Invalid value", "entityName");
      expect(error.field).toBe("entityName");
    });

    it("should have undefined field when not provided", () => {
      const error = new ValidationError("Invalid value");
      expect(error.field).toBeUndefined();
    });

    it("should be instance of KnowledgeGraphError", () => {
      const error = new ValidationError("Test");
      expect(error).toBeInstanceOf(KnowledgeGraphError);
    });

    it("should be instance of ValidationError", () => {
      const error = new ValidationError("Test");
      expect(error).toBeInstanceOf(ValidationError);
    });

    it("should have correct prototype chain", () => {
      const error = new ValidationError("Test");
      expect(Object.getPrototypeOf(error)).toBe(ValidationError.prototype);
    });
  });
});

describe("Error Inheritance", () => {
  it("all custom errors should extend KnowledgeGraphError", () => {
    expect(new EntityNotFoundError("id")).toBeInstanceOf(KnowledgeGraphError);
    expect(new RelationNotFoundError("id")).toBeInstanceOf(KnowledgeGraphError);
    expect(new SelfLoopError()).toBeInstanceOf(KnowledgeGraphError);
    expect(new EvidenceRequiredError()).toBeInstanceOf(KnowledgeGraphError);
    expect(new DatabaseConnectionError("msg")).toBeInstanceOf(
      KnowledgeGraphError,
    );
    expect(new DatabaseQueryError("msg")).toBeInstanceOf(KnowledgeGraphError);
    expect(new ValidationError("msg")).toBeInstanceOf(KnowledgeGraphError);
  });

  it("all custom errors should extend Error", () => {
    expect(new KnowledgeGraphError("msg")).toBeInstanceOf(Error);
    expect(new EntityNotFoundError("id")).toBeInstanceOf(Error);
    expect(new RelationNotFoundError("id")).toBeInstanceOf(Error);
    expect(new SelfLoopError()).toBeInstanceOf(Error);
    expect(new EvidenceRequiredError()).toBeInstanceOf(Error);
    expect(new DatabaseConnectionError("msg")).toBeInstanceOf(Error);
    expect(new DatabaseQueryError("msg")).toBeInstanceOf(Error);
    expect(new ValidationError("msg")).toBeInstanceOf(Error);
  });

  it("errors should be catchable as their specific type", () => {
    try {
      throw new EntityNotFoundError("entity-123");
    } catch (e) {
      expect(e).toBeInstanceOf(EntityNotFoundError);
      expect((e as EntityNotFoundError).entityId).toBe("entity-123");
    }
  });

  it("errors should be catchable as KnowledgeGraphError", () => {
    try {
      throw new ValidationError("Invalid", "field");
    } catch (e) {
      expect(e).toBeInstanceOf(KnowledgeGraphError);
      expect((e as ValidationError).field).toBe("field");
    }
  });

  it("errors should be catchable as Error", () => {
    try {
      throw new DatabaseQueryError("Query failed", undefined, "SELECT *");
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as DatabaseQueryError).query).toBe("SELECT *");
    }
  });
});

describe("Error Messages", () => {
  it("EntityNotFoundError should include entity ID in message", () => {
    const error = new EntityNotFoundError("12345");
    expect(error.message).toContain("12345");
  });

  it("RelationNotFoundError should include relation ID in message", () => {
    const error = new RelationNotFoundError("rel-789");
    expect(error.message).toContain("rel-789");
  });

  it("DatabaseConnectionError should include description in message", () => {
    const error = new DatabaseConnectionError("timeout after 30s");
    expect(error.message).toContain("timeout after 30s");
  });

  it("DatabaseQueryError should include description in message", () => {
    const error = new DatabaseQueryError("syntax error near SELECT");
    expect(error.message).toContain("syntax error near SELECT");
  });

  it("ValidationError should include description in message", () => {
    const error = new ValidationError("name cannot be empty");
    expect(error.message).toContain("name cannot be empty");
  });
});
