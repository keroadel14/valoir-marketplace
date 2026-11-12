CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;

CREATE TABLE "AdminAuditLogs" (
    "Id" uuid NOT NULL,
    "AdminUserId" uuid NOT NULL,
    "Action" character varying(200) NOT NULL,
    "TargetType" text,
    "TargetId" uuid,
    "PreviousValueJson" text,
    "NewValueJson" text,
    "Reason" text,
    "IpAddress" text,
    "CorrelationId" text,
    "OccurredAt" timestamp with time zone NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "RowVersion" bytea,
    CONSTRAINT "PK_AdminAuditLogs" PRIMARY KEY ("Id")
);

CREATE TABLE "AspNetRoles" (
    "Id" uuid NOT NULL,
    "Name" character varying(256),
    "NormalizedName" character varying(256),
    "ConcurrencyStamp" text,
    CONSTRAINT "PK_AspNetRoles" PRIMARY KEY ("Id")
);

CREATE TABLE "AspNetUsers" (
    "Id" uuid NOT NULL,
    "FullName" text,
    "AccountStatus" integer NOT NULL,
    "HasAcceptedTerms" boolean NOT NULL,
    "AcceptedTermsAt" timestamp with time zone,
    "HasAcceptedPrivacyPolicy" boolean NOT NULL,
    "AcceptedPrivacyPolicyAt" timestamp with time zone,
    "TermsAcceptanceIp" text,
    "PreferredLanguage" text NOT NULL,
    "PreferredTheme" text NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "SuspendedAt" timestamp with time zone,
    "SuspensionReason" text,
    "UserName" character varying(256),
    "NormalizedUserName" character varying(256),
    "Email" character varying(256),
    "NormalizedEmail" character varying(256),
    "EmailConfirmed" boolean NOT NULL,
    "PasswordHash" text,
    "SecurityStamp" text,
    "ConcurrencyStamp" text,
    "PhoneNumber" text,
    "PhoneNumberConfirmed" boolean NOT NULL,
    "TwoFactorEnabled" boolean NOT NULL,
    "LockoutEnd" timestamp with time zone,
    "LockoutEnabled" boolean NOT NULL,
    "AccessFailedCount" integer NOT NULL,
    CONSTRAINT "PK_AspNetUsers" PRIMARY KEY ("Id")
);

CREATE TABLE "Boutiques" (
    "Id" uuid NOT NULL,
    "OwnerUserId" uuid NOT NULL,
    "StoreName" character varying(200) NOT NULL,
    "Slug" character varying(120) NOT NULL,
    "LogoUrl" text,
    "CoverUrl" text,
    "TradeLicenseOrVatId" text,
    "Description" text,
    "CommissionRate" numeric(5,4) NOT NULL,
    "Status" integer NOT NULL,
    "StripeAccountId" text,
    "DetailsSubmitted" boolean NOT NULL,
    "PayoutsEnabled" boolean NOT NULL,
    "ChargesEnabled" boolean NOT NULL,
    "PayoutHoldEnabled" boolean NOT NULL,
    "SuspensionReason" text,
    "RejectionReason" text,
    "ApprovedAt" timestamp with time zone,
    "ApprovedByAdminId" uuid,
    "IsDeleted" boolean NOT NULL,
    "DeletedAt" timestamp with time zone,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "RowVersion" bytea,
    CONSTRAINT "PK_Boutiques" PRIMARY KEY ("Id")
);

CREATE TABLE "Disputes" (
    "Id" uuid NOT NULL,
    "VendorOrderId" uuid NOT NULL,
    "OrderItemId" uuid,
    "BuyerId" uuid NOT NULL,
    "BoutiqueId" uuid NOT NULL,
    "Reason" character varying(500) NOT NULL,
    "Details" text,
    "Status" integer NOT NULL,
    "AdminNote" text,
    "ResolutionReason" text,
    "ResolvedByAdminId" uuid,
    "ResolvedAt" timestamp with time zone,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "RowVersion" bytea,
    CONSTRAINT "PK_Disputes" PRIMARY KEY ("Id")
);

CREATE TABLE "InventoryReservations" (
    "Id" uuid NOT NULL,
    "VariantId" uuid NOT NULL,
    "OrderId" uuid NOT NULL,
    "Quantity" integer NOT NULL,
    "ExpiresAt" timestamp with time zone NOT NULL,
    "IsReleased" boolean NOT NULL,
    "IsConfirmed" boolean NOT NULL,
    "RedisKey" text,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "RowVersion" bytea,
    CONSTRAINT "PK_InventoryReservations" PRIMARY KEY ("Id")
);

CREATE TABLE "Orders" (
    "Id" uuid NOT NULL,
    "OrderNumber" character varying(40) NOT NULL,
    "BuyerId" uuid NOT NULL,
    "TotalAmount" numeric(18,2) NOT NULL,
    "ShippingAmount" numeric(18,2) NOT NULL,
    "Status" integer NOT NULL,
    "StripePaymentIntentId" text,
    "ExpiresAt" timestamp with time zone,
    "PaidAt" timestamp with time zone,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "RowVersion" bytea,
    CONSTRAINT "PK_Orders" PRIMARY KEY ("Id")
);

CREATE TABLE "OutboxMessages" (
    "Id" uuid NOT NULL,
    "Type" character varying(200) NOT NULL,
    "PayloadJson" text NOT NULL,
    "IdempotencyKey" character varying(120),
    "Status" integer NOT NULL,
    "AttemptCount" integer NOT NULL,
    "ProcessedAt" timestamp with time zone,
    "LastError" text,
    "NextAttemptAt" timestamp with time zone,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "RowVersion" bytea,
    CONSTRAINT "PK_OutboxMessages" PRIMARY KEY ("Id")
);

CREATE TABLE "Products" (
    "Id" uuid NOT NULL,
    "BoutiqueId" uuid NOT NULL,
    "CategoryId" uuid,
    "Title" character varying(300) NOT NULL,
    "Slug" character varying(200) NOT NULL,
    "Description" text,
    "BasePrice" numeric(18,2) NOT NULL,
    "Status" integer NOT NULL,
    "IsFeatured" boolean NOT NULL,
    "UnlistReason" text,
    "IsDeleted" boolean NOT NULL,
    "DeletedAt" timestamp with time zone,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "RowVersion" bytea,
    CONSTRAINT "PK_Products" PRIMARY KEY ("Id")
);

CREATE TABLE "RefreshTokens" (
    "Id" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "TokenHash" character varying(128) NOT NULL,
    "ExpiresAt" timestamp with time zone NOT NULL,
    "RevokedAt" timestamp with time zone,
    "ReplacedByTokenHash" text,
    "CreatedByIp" text,
    "RevokedByIp" text,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "RowVersion" bytea,
    CONSTRAINT "PK_RefreshTokens" PRIMARY KEY ("Id")
);

CREATE TABLE "VendorLedgerEntries" (
    "Id" uuid NOT NULL,
    "BoutiqueId" uuid NOT NULL,
    "TransactionType" integer NOT NULL,
    "Amount" numeric(18,2) NOT NULL,
    "VendorOrderId" uuid,
    "OrderId" uuid,
    "StripeTransferId" text,
    "StripeRefundId" text,
    "StripeTransferReversalId" text,
    "Notes" text,
    "IdempotencyKey" character varying(120),
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "RowVersion" bytea,
    CONSTRAINT "PK_VendorLedgerEntries" PRIMARY KEY ("Id")
);

CREATE TABLE "AspNetRoleClaims" (
    "Id" integer GENERATED BY DEFAULT AS IDENTITY,
    "RoleId" uuid NOT NULL,
    "ClaimType" text,
    "ClaimValue" text,
    CONSTRAINT "PK_AspNetRoleClaims" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_AspNetRoleClaims_AspNetRoles_RoleId" FOREIGN KEY ("RoleId") REFERENCES "AspNetRoles" ("Id") ON DELETE CASCADE
);

CREATE TABLE "AspNetUserClaims" (
    "Id" integer GENERATED BY DEFAULT AS IDENTITY,
    "UserId" uuid NOT NULL,
    "ClaimType" text,
    "ClaimValue" text,
    CONSTRAINT "PK_AspNetUserClaims" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_AspNetUserClaims_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE
);

CREATE TABLE "AspNetUserLogins" (
    "LoginProvider" text NOT NULL,
    "ProviderKey" text NOT NULL,
    "ProviderDisplayName" text,
    "UserId" uuid NOT NULL,
    CONSTRAINT "PK_AspNetUserLogins" PRIMARY KEY ("LoginProvider", "ProviderKey"),
    CONSTRAINT "FK_AspNetUserLogins_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE
);

CREATE TABLE "AspNetUserRoles" (
    "UserId" uuid NOT NULL,
    "RoleId" uuid NOT NULL,
    CONSTRAINT "PK_AspNetUserRoles" PRIMARY KEY ("UserId", "RoleId"),
    CONSTRAINT "FK_AspNetUserRoles_AspNetRoles_RoleId" FOREIGN KEY ("RoleId") REFERENCES "AspNetRoles" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_AspNetUserRoles_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE
);

CREATE TABLE "AspNetUserTokens" (
    "UserId" uuid NOT NULL,
    "LoginProvider" text NOT NULL,
    "Name" text NOT NULL,
    "Value" text,
    CONSTRAINT "PK_AspNetUserTokens" PRIMARY KEY ("UserId", "LoginProvider", "Name"),
    CONSTRAINT "FK_AspNetUserTokens_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE
);

CREATE TABLE "VendorOrders" (
    "Id" uuid NOT NULL,
    "OrderId" uuid NOT NULL,
    "BoutiqueId" uuid NOT NULL,
    "Subtotal" numeric(18,2) NOT NULL,
    "CommissionRateSnapshot" numeric(5,4) NOT NULL,
    "CommissionAmount" numeric(18,2) NOT NULL,
    "VendorNetPayout" numeric(18,2) NOT NULL,
    "ShippingFee" numeric(18,2) NOT NULL,
    "Status" integer NOT NULL,
    "TrackingNumber" text,
    "Carrier" text,
    "StripeTransferId" text,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "RowVersion" bytea,
    CONSTRAINT "PK_VendorOrders" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_VendorOrders_Orders_OrderId" FOREIGN KEY ("OrderId") REFERENCES "Orders" ("Id") ON DELETE CASCADE
);

CREATE TABLE "ProductVariants" (
    "Id" uuid NOT NULL,
    "ProductId" uuid NOT NULL,
    "Sku" character varying(64) NOT NULL,
    "ColorName" text,
    "ColorHex" text,
    "Size" text,
    "StockQuantity" integer NOT NULL,
    "ReservedQuantity" integer NOT NULL,
    "PriceOverride" numeric(18,2),
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "RowVersion" bytea,
    CONSTRAINT "PK_ProductVariants" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_ProductVariants_Products_ProductId" FOREIGN KEY ("ProductId") REFERENCES "Products" ("Id") ON DELETE CASCADE
);

CREATE TABLE "OrderItems" (
    "Id" uuid NOT NULL,
    "VendorOrderId" uuid NOT NULL,
    "VariantId" uuid NOT NULL,
    "Quantity" integer NOT NULL,
    "UnitPriceSnapshot" numeric(18,2) NOT NULL,
    "ProductTitleSnapshot" character varying(300) NOT NULL,
    "SkuSnapshot" text,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "RowVersion" bytea,
    CONSTRAINT "PK_OrderItems" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_OrderItems_VendorOrders_VendorOrderId" FOREIGN KEY ("VendorOrderId") REFERENCES "VendorOrders" ("Id") ON DELETE CASCADE
);

CREATE INDEX "IX_AdminAuditLogs_AdminUserId" ON "AdminAuditLogs" ("AdminUserId");

CREATE INDEX "IX_AdminAuditLogs_OccurredAt" ON "AdminAuditLogs" ("OccurredAt");

CREATE INDEX "IX_AdminAuditLogs_TargetType_TargetId" ON "AdminAuditLogs" ("TargetType", "TargetId");

CREATE INDEX "IX_AspNetRoleClaims_RoleId" ON "AspNetRoleClaims" ("RoleId");

CREATE UNIQUE INDEX "RoleNameIndex" ON "AspNetRoles" ("NormalizedName");

CREATE INDEX "IX_AspNetUserClaims_UserId" ON "AspNetUserClaims" ("UserId");

CREATE INDEX "IX_AspNetUserLogins_UserId" ON "AspNetUserLogins" ("UserId");

CREATE INDEX "IX_AspNetUserRoles_RoleId" ON "AspNetUserRoles" ("RoleId");

CREATE INDEX "EmailIndex" ON "AspNetUsers" ("NormalizedEmail");

CREATE UNIQUE INDEX "UserNameIndex" ON "AspNetUsers" ("NormalizedUserName");

CREATE INDEX "IX_Boutiques_OwnerUserId" ON "Boutiques" ("OwnerUserId");

CREATE UNIQUE INDEX "IX_Boutiques_Slug" ON "Boutiques" ("Slug");

CREATE INDEX "IX_Boutiques_Status" ON "Boutiques" ("Status");

CREATE INDEX "IX_Disputes_BoutiqueId" ON "Disputes" ("BoutiqueId");

CREATE INDEX "IX_Disputes_BuyerId" ON "Disputes" ("BuyerId");

CREATE INDEX "IX_Disputes_Status" ON "Disputes" ("Status");

CREATE INDEX "IX_Disputes_VendorOrderId" ON "Disputes" ("VendorOrderId");

CREATE INDEX "IX_InventoryReservations_IsReleased_IsConfirmed_ExpiresAt" ON "InventoryReservations" ("IsReleased", "IsConfirmed", "ExpiresAt");

CREATE INDEX "IX_InventoryReservations_OrderId" ON "InventoryReservations" ("OrderId");

CREATE INDEX "IX_InventoryReservations_VariantId" ON "InventoryReservations" ("VariantId");

CREATE INDEX "IX_OrderItems_VariantId" ON "OrderItems" ("VariantId");

CREATE INDEX "IX_OrderItems_VendorOrderId" ON "OrderItems" ("VendorOrderId");

CREATE INDEX "IX_Orders_BuyerId" ON "Orders" ("BuyerId");

CREATE UNIQUE INDEX "IX_Orders_OrderNumber" ON "Orders" ("OrderNumber");

CREATE INDEX "IX_Orders_Status" ON "Orders" ("Status");

CREATE INDEX "IX_Orders_StripePaymentIntentId" ON "Orders" ("StripePaymentIntentId");

CREATE UNIQUE INDEX "IX_OutboxMessages_IdempotencyKey" ON "OutboxMessages" ("IdempotencyKey") WHERE "IdempotencyKey" IS NOT NULL;

CREATE INDEX "IX_OutboxMessages_Status_NextAttemptAt" ON "OutboxMessages" ("Status", "NextAttemptAt");

CREATE INDEX "IX_Products_BoutiqueId" ON "Products" ("BoutiqueId");

CREATE INDEX "IX_Products_Slug" ON "Products" ("Slug");

CREATE INDEX "IX_Products_Status" ON "Products" ("Status");

CREATE INDEX "IX_ProductVariants_ProductId" ON "ProductVariants" ("ProductId");

CREATE INDEX "IX_ProductVariants_Sku" ON "ProductVariants" ("Sku");

CREATE UNIQUE INDEX "IX_RefreshTokens_TokenHash" ON "RefreshTokens" ("TokenHash");

CREATE INDEX "IX_RefreshTokens_UserId" ON "RefreshTokens" ("UserId");

CREATE INDEX "IX_RefreshTokens_UserId_RevokedAt_ExpiresAt" ON "RefreshTokens" ("UserId", "RevokedAt", "ExpiresAt");

CREATE INDEX "IX_VendorLedgerEntries_BoutiqueId" ON "VendorLedgerEntries" ("BoutiqueId");

CREATE UNIQUE INDEX "IX_VendorLedgerEntries_IdempotencyKey" ON "VendorLedgerEntries" ("IdempotencyKey") WHERE "IdempotencyKey" IS NOT NULL;

CREATE INDEX "IX_VendorLedgerEntries_VendorOrderId" ON "VendorLedgerEntries" ("VendorOrderId");

CREATE INDEX "IX_VendorOrders_BoutiqueId" ON "VendorOrders" ("BoutiqueId");

CREATE INDEX "IX_VendorOrders_OrderId" ON "VendorOrders" ("OrderId");

CREATE INDEX "IX_VendorOrders_Status" ON "VendorOrders" ("Status");

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20261111153033_InitialCreate', '8.0.11');

COMMIT;

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

