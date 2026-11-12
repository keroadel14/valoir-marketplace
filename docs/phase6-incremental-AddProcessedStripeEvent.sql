START TRANSACTION;

CREATE TABLE "ProcessedStripeEvents" (
    "Id" uuid NOT NULL,
    "EventId" character varying(128) NOT NULL,
    "EventType" character varying(120) NOT NULL,
    "ProcessedAt" timestamp with time zone NOT NULL,
    "Outcome" text,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "RowVersion" bytea,
    CONSTRAINT "PK_ProcessedStripeEvents" PRIMARY KEY ("Id")
);

CREATE UNIQUE INDEX "IX_ProcessedStripeEvents_EventId" ON "ProcessedStripeEvents" ("EventId");

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20261111161941_AddProcessedStripeEvent', '8.0.11');

COMMIT;

