import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  bigint,
  jsonb,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { relations } from "drizzle-orm";

// User Stuff

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  workExperiences: many(workExperience),
  powerStatements: many(powerStatement),
  skills: many(skill),
  coreValues: many(coreValue),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// Rest of tables

export const workExperience = pgTable("work_experience", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => "we_" + nanoid()),
  company: text("employer").notNull(),
  order: integer("order").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const workExperienceSection = pgTable("work_experience_section", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => "wes_" + nanoid()),
  workExperienceId: text("work_experience_id")
    .notNull()
    .references(() => workExperience.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  note: text("note"),
  startDate: text("start_date"),
  endDate: text("end_date"),
});

export const workExperienceSectionResult = pgTable(
  "work_experience_section_result",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "wesr_" + nanoid()),
    workExperienceSectionId: text("work_experience_section_id")
      .notNull()
      .references(() => workExperienceSection.id, { onDelete: "cascade" }),
    order: integer("order").notNull(),
    description: text("description").notNull(),
  },
);

export const powerStatement = pgTable("power_statement", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => "ps_" + nanoid()),
  description: text("description").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const skill = pgTable("skill", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => "sk_" + nanoid()),
  name: text("name").notNull(),
  description: text("description"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const coreValue = pgTable("core_value", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => "cv_" + nanoid()),
  name: text("name").notNull(),
  description: text("description"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

// Relations

export const workExperienceRelations = relations(
  workExperience,
  ({ one, many }) => ({
    user: one(user, {
      fields: [workExperience.userId],
      references: [user.id],
    }),
    sections: many(workExperienceSection),
  }),
);

export const workExperienceSectionRelations = relations(
  workExperienceSection,
  ({ one, many }) => ({
    workExperience: one(workExperience, {
      fields: [workExperienceSection.workExperienceId],
      references: [workExperience.id],
    }),
    results: many(workExperienceSectionResult),
  }),
);

export const workExperienceSectionResultRelations = relations(
  workExperienceSectionResult,
  ({ one }) => ({
    section: one(workExperienceSection, {
      fields: [workExperienceSectionResult.workExperienceSectionId],
      references: [workExperienceSection.id],
    }),
  }),
);

export const powerStatementRelations = relations(powerStatement, ({ one }) => ({
  user: one(user, {
    fields: [powerStatement.userId],
    references: [user.id],
  }),
}));

export const skillRelations = relations(skill, ({ one }) => ({
  user: one(user, {
    fields: [skill.userId],
    references: [user.id],
  }),
}));

export const coreValueRelations = relations(coreValue, ({ one }) => ({
  user: one(user, {
    fields: [coreValue.userId],
    references: [user.id],
  }),
}));
