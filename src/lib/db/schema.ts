import { relations } from "drizzle-orm"
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"

export const friendRequestStatusEnum = pgEnum("friend_request_status", [
  "pending",
  "accepted",
  "rejected",
])

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    username: text("username").unique(),
    bio: text("bio"),
    location: text("location"),
    bannedFromPosting: boolean("banned_from_posting").default(false).notNull(),
    bannedFromCommenting: boolean("banned_from_commenting").default(false).notNull(),
    isVerified: boolean("is_verified").default(false).notNull(),
    isPremium: boolean("is_premium").default(false).notNull(),
    profileBackground: text("profile_background"),
    customTheme: jsonb("custom_theme").$type<{
      name?: string
      bg?: string
      fg?: string
      accent?: string
      accentHover?: string
      accentSecondary?: string
      accentTertiary?: string
      muted?: string
      bgStyle?: string
      bgGradient?: string
      cardOpacity?: number
      glassBlur?: string
    }>(),
    onboardingComplete: boolean("onboarding_complete").default(false).notNull(),
    itunesTrackId: text("itunes_track_id"),
    itunesTrackName: text("itunes_track_name"),
    itunesArtistName: text("itunes_artist_name"),
    itunesPreviewUrl: text("itunes_preview_url"),
    itunesArtworkUrl: text("itunes_artwork_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("user_username_idx").on(table.username),
    index("user_name_idx").on(table.name),
  ],
)

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
)

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
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
)

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
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
)

export const post = pgTable(
  "post",
  {
    id: text("id").primaryKey(),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    caption: text("caption"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("post_authorId_idx").on(table.authorId),
    index("post_createdAt_idx").on(table.createdAt),
  ],
)

export const postImage = pgTable(
  "post_image",
  {
    id: text("id").primaryKey(),
    postId: text("post_id")
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("post_image_postId_idx").on(table.postId)],
)

export const wow = pgTable(
  "wow",
  {
    id: text("id").primaryKey(),
    postId: text("post_id")
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("wow_post_user_idx").on(table.postId, table.userId),
    index("wow_postId_idx").on(table.postId),
  ],
)

export const comment = pgTable(
  "comment",
  {
    id: text("id").primaryKey(),
    postId: text("post_id")
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("comment_postId_idx").on(table.postId),
    index("comment_authorId_idx").on(table.authorId),
  ],
)

export const favorite = pgTable(
  "favorite",
  {
    id: text("id").primaryKey(),
    postId: text("post_id")
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("favorite_post_user_idx").on(table.postId, table.userId),
    index("favorite_userId_idx").on(table.userId),
  ],
)

export const friendRequest = pgTable(
  "friend_request",
  {
    id: text("id").primaryKey(),
    senderId: text("sender_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    receiverId: text("receiver_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: friendRequestStatusEnum("status").default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("friend_request_pair_idx").on(table.senderId, table.receiverId),
    index("friend_request_receiverId_idx").on(table.receiverId),
    index("friend_request_senderId_idx").on(table.senderId),
  ],
)

export const explorePost = pgTable(
  "explore_post",
  {
    id: text("id").primaryKey(),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    caption: text("caption"),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("explore_post_authorId_idx").on(table.authorId),
    index("explore_post_createdAt_idx").on(table.createdAt),
  ],
)

export const exploreWow = pgTable(
  "explore_wow",
  {
    id: text("id").primaryKey(),
    postId: text("post_id")
      .notNull()
      .references(() => explorePost.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("explore_wow_post_user_idx").on(table.postId, table.userId),
    index("explore_wow_postId_idx").on(table.postId),
  ],
)

export const exploreComment = pgTable(
  "explore_comment",
  {
    id: text("id").primaryKey(),
    postId: text("post_id")
      .notNull()
      .references(() => explorePost.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("explore_comment_postId_idx").on(table.postId),
    index("explore_comment_authorId_idx").on(table.authorId),
  ],
)

export const exploreSave = pgTable(
  "explore_save",
  {
    id: text("id").primaryKey(),
    postId: text("post_id")
      .notNull()
      .references(() => explorePost.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("explore_save_post_user_idx").on(table.postId, table.userId),
  ],
)

export const repost = pgTable(
  "repost",
  {
    id: text("id").primaryKey(),
    explorePostId: text("explore_post_id")
      .notNull()
      .references(() => explorePost.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("repost_post_user_idx").on(table.explorePostId, table.userId),
  ],
)

export const report = pgTable(
  "report",
  {
    id: text("id").primaryKey(),
    reporterId: text("reporter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    targetUserId: text("target_user_id").references(() => user.id, { onDelete: "cascade" }),
    targetPostId: text("target_post_id"),
    targetExplorePostId: text("target_explore_post_id"),
    reason: text("reason").notNull(),
    status: text("status").default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("report_status_idx").on(table.status)],
)

export const adminLog = pgTable(
  "admin_log",
  {
    id: text("id").primaryKey(),
    action: text("action").notNull(),
    targetUserId: text("target_user_id"),
    details: text("details"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("admin_log_createdAt_idx").on(table.createdAt)],
)

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  posts: many(post),
  wows: many(wow),
  comments: many(comment),
  favorites: many(favorite),
  sentFriendRequests: many(friendRequest, { relationName: "sender" }),
  receivedFriendRequests: many(friendRequest, { relationName: "receiver" }),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const postRelations = relations(post, ({ one, many }) => ({
  author: one(user, {
    fields: [post.authorId],
    references: [user.id],
  }),
  images: many(postImage),
  wows: many(wow),
  comments: many(comment),
  favorites: many(favorite),
}))

export const postImageRelations = relations(postImage, ({ one }) => ({
  post: one(post, {
    fields: [postImage.postId],
    references: [post.id],
  }),
}))

export const wowRelations = relations(wow, ({ one }) => ({
  post: one(post, { fields: [wow.postId], references: [post.id] }),
  user: one(user, { fields: [wow.userId], references: [user.id] }),
}))

export const commentRelations = relations(comment, ({ one }) => ({
  post: one(post, { fields: [comment.postId], references: [post.id] }),
  author: one(user, { fields: [comment.authorId], references: [user.id] }),
}))

export const favoriteRelations = relations(favorite, ({ one }) => ({
  post: one(post, { fields: [favorite.postId], references: [post.id] }),
  user: one(user, { fields: [favorite.userId], references: [user.id] }),
}))

export const friendRequestRelations = relations(friendRequest, ({ one }) => ({
  sender: one(user, {
    fields: [friendRequest.senderId],
    references: [user.id],
    relationName: "sender",
  }),
  receiver: one(user, {
    fields: [friendRequest.receiverId],
    references: [user.id],
    relationName: "receiver",
  }),
}))

export const userRelationsAdd = relations(user, ({ many }) => ({
  explorePosts: many(explorePost),
  exploreWows: many(exploreWow),
  exploreComments: many(exploreComment),
  exploreSaves: many(exploreSave),
  reposts: many(repost),
  reports: many(report, { relationName: "reporter" }),
}))

export const explorePostRelations = relations(explorePost, ({ one, many }) => ({
  author: one(user, {
    fields: [explorePost.authorId],
    references: [user.id],
  }),
  wows: many(exploreWow),
  comments: many(exploreComment),
  saves: many(exploreSave),
  reposts: many(repost),
}))

export const exploreWowRelations = relations(exploreWow, ({ one }) => ({
  post: one(explorePost, { fields: [exploreWow.postId], references: [explorePost.id] }),
  user: one(user, { fields: [exploreWow.userId], references: [user.id] }),
}))

export const exploreCommentRelations = relations(exploreComment, ({ one }) => ({
  post: one(explorePost, { fields: [exploreComment.postId], references: [explorePost.id] }),
  author: one(user, { fields: [exploreComment.authorId], references: [user.id] }),
}))

export const exploreSaveRelations = relations(exploreSave, ({ one }) => ({
  post: one(explorePost, { fields: [exploreSave.postId], references: [explorePost.id] }),
  user: one(user, { fields: [exploreSave.userId], references: [user.id] }),
}))

export const repostRelations = relations(repost, ({ one }) => ({
  explorePost: one(explorePost, { fields: [repost.explorePostId], references: [explorePost.id] }),
  user: one(user, { fields: [repost.userId], references: [user.id] }),
}))

export const adminAnnouncement = pgTable(
  "admin_announcement",
  {
    id: text("id").primaryKey(),
    message: text("message").notNull(),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("admin_announcement_active_idx").on(table.active)],
)

export const featureToggle = pgTable(
  "feature_toggle",
  {
    id: text("id").primaryKey(),
    featureKey: text("feature_key").unique().notNull(),
    enabled: boolean("enabled").default(true).notNull(),
    description: text("description"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("feature_toggle_key_idx").on(table.featureKey)],
)

export const reportRelations = relations(report, ({ one }) => ({
  reporter: one(user, {
    fields: [report.reporterId],
    references: [user.id],
    relationName: "reporter",
  }),
  targetUser: one(user, {
    fields: [report.targetUserId],
    references: [user.id],
  }),
}))
