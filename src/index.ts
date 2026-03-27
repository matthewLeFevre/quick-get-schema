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
  links: many(link),
  educations: many(education),
  projects: many(project),
  files: many(file),
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

export const profile = pgTable("profile", {
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  headline: text("headline"),
  summary: text("summary"),
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const workExperience = pgTable("work_experience", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => "we_" + nanoid()),
  company: text("company"),
  order: integer("order"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  city: text("city"),
  state: text("state"),
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
  title: text("title"),
  note: text("note"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  city: text("city"),
  state: text("state"),
  order: integer("order").notNull(),
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
    description: text("description"),
  },
);

export const powerStatement = pgTable("power_statement", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => "ps_" + nanoid()),
  description: text("description"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const skill = pgTable("skill", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => "sk_" + nanoid()),
  name: text("name"),
  description: text("description"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const coreValue = pgTable("core_value", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => "cv_" + nanoid()),
  name: text("name"),
  description: text("description"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const application = pgTable("application", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => "app_" + nanoid()),
  company: text("company"),
  position: text("position"),
  status: text("status").default("Pending").notNull(),
  contact: text("contact"),
  jobLink: text("job_link"),
  jobDescription: text("job_description"),
  positionFit: integer("position_fit"),
  analysis: jsonb("analysis"),
  resume: jsonb("resume"),
  coverLetter: jsonb("cover_letter"),
  appliedAt: timestamp("applied_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const link = pgTable("link", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => "lnk_" + nanoid()),
  title: text("title"),
  url: text("url"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const education = pgTable("education", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => "edu_" + nanoid()),
  institution: text("institution"),
  degree: text("degree"),
  fieldOfStudy: text("field_of_study"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  description: text("description"),
  gpa: text("gpa"),
  city: text("city"),
  state: text("state"),
  order: integer("order").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const workExperienceSectionSkill = pgTable(
  "work_experience_section_skill",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => "wessk_" + nanoid()),
    skillId: text("skill_id")
      .notNull()
      .references(() => skill.id, { onDelete: "cascade" }),
    workExperienceSectionId: text("work_experience_section_id")
      .notNull()
      .references(() => workExperienceSection.id, { onDelete: "cascade" }),
  },
);

export const project = pgTable("project", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => "proj_" + nanoid()),
  title: text("title").notNull(),
  description: text("description"),
  workExperienceId: text("work_experience_id").references(
    () => workExperience.id,
    { onDelete: "cascade" },
  ),
  startDate: text("start_date"),
  endDate: text("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const projectSection = pgTable("project_section", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => "prjs_" + nanoid()),
  title: text("title"),
  description: text("description"),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
});

export const projectSkill = pgTable("project_skill", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => "prjsk_" + nanoid()),
  skillId: text("skill_id")
    .notNull()
    .references(() => skill.id, { onDelete: "cascade" }),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
});

export const file = pgTable("file", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => "file-" + nanoid()),
  name: text("name").notNull(),
  url: text("url"),
  mimeType: text("mimeType"),
  awsKey: text("awsKey"),
  size: integer("size"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  projectId: text("project_id").references(() => project.id, {
    onDelete: "cascade",
  }),
  projectSectionId: text("project_section_id").references(
    () => projectSection.id,
    { onDelete: "cascade" },
  ),
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
    projects: many(project),
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
    workExperienceSectionSkills: many(workExperienceSectionSkill),
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

export const skillRelations = relations(skill, ({ one, many }) => ({
  user: one(user, {
    fields: [skill.userId],
    references: [user.id],
  }),
  workExperienceSectionSkills: many(workExperienceSectionSkill),
  projectSkills: many(projectSkill),
}));

export const coreValueRelations = relations(coreValue, ({ one }) => ({
  user: one(user, {
    fields: [coreValue.userId],
    references: [user.id],
  }),
}));

export const linkRelations = relations(link, ({ one }) => ({
  user: one(user, {
    fields: [link.userId],
    references: [user.id],
  }),
}));

export const educationRelations = relations(education, ({ one }) => ({
  user: one(user, {
    fields: [education.userId],
    references: [user.id],
  }),
}));

export const workExperienceSectionSkillRelations = relations(
  workExperienceSectionSkill,
  ({ one }) => ({
    skill: one(skill, {
      fields: [workExperienceSectionSkill.skillId],
      references: [skill.id],
    }),
    workExperienceSection: one(workExperienceSection, {
      fields: [workExperienceSectionSkill.workExperienceSectionId],
      references: [workExperienceSection.id],
    }),
  }),
);

export const projectRelations = relations(project, ({ one, many }) => ({
  user: one(user, {
    fields: [project.userId],
    references: [user.id],
  }),
  workExperience: one(workExperience, {
    fields: [project.workExperienceId],
    references: [workExperience.id],
  }),
  sections: many(projectSection),
  projectSkills: many(projectSkill),
  files: many(file),
}));

export const projectSectionRelations = relations(
  projectSection,
  ({ one, many }) => ({
    project: one(project, {
      fields: [projectSection.projectId],
      references: [project.id],
    }),
    files: many(file),
  }),
);

export const projectSkillRelations = relations(projectSkill, ({ one }) => ({
  skill: one(skill, {
    fields: [projectSkill.skillId],
    references: [skill.id],
  }),
  project: one(project, {
    fields: [projectSkill.projectId],
    references: [project.id],
  }),
}));

export const fileRelations = relations(file, ({ one }) => ({
  user: one(user, {
    fields: [file.userId],
    references: [user.id],
  }),
  project: one(project, {
    fields: [file.projectId],
    references: [project.id],
  }),
  projectSection: one(projectSection, {
    fields: [file.projectSectionId],
    references: [projectSection.id],
  }),
}));
