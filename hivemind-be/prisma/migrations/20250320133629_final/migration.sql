-- CreateEnum
CREATE TYPE "vote_type" AS ENUM ('up', 'down');

-- CreateFunction
CREATE OR REPLACE FUNCTION uuidv7_sub_ms() RETURNS uuid
AS $$
 select encode(
   substring(int8send(floor(t_ms)::int8) from 3) ||
   int2send((7<<12)::int2 | ((t_ms-floor(t_ms))*4096)::int2) ||
   substring(uuid_send(gen_random_uuid()) from 9 for 8)
  , 'hex')::uuid
  from (select extract(epoch from clock_timestamp())*1000 as t_ms) s
$$ LANGUAGE sql volatile;

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL DEFAULT uuidv7_sub_ms(),
    "username" VARCHAR(30) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "secret" CHAR(60) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile" (
    "id" TEXT NOT NULL,
    "full_name" VARCHAR(70) NOT NULL,
    "birthdate" DATE NOT NULL,
    "bio" TEXT,
    "propic_id" TEXT,
    "cover_id" TEXT,
    "website_url" VARCHAR(255),
    "twitter_url" VARCHAR(255),
    "linkedin_url" VARCHAR(255),
    "facebook_url" VARCHAR(255),
    "instagram_url" VARCHAR(255),
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follow" (
    "id" TEXT NOT NULL DEFAULT uuidv7_sub_ms(),
    "follower_id" TEXT NOT NULL,
    "following_id" TEXT NOT NULL,
    "followed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buzz" (
    "id" TEXT NOT NULL DEFAULT uuidv7_sub_ms(),
    "author_id" TEXT NOT NULL,
    "title" VARCHAR(70) NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "view_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "buzz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hashtag" (
    "id" TEXT NOT NULL DEFAULT uuidv7_sub_ms(),
    "name" TEXT NOT NULL,

    CONSTRAINT "hashtag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmark" (
    "id" TEXT NOT NULL DEFAULT uuidv7_sub_ms(),
    "user_id" TEXT NOT NULL,
    "buzz_id" TEXT NOT NULL,

    CONSTRAINT "bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image" (
    "id" TEXT NOT NULL DEFAULT uuidv7_sub_ms(),
    "owner_id" TEXT NOT NULL,
    "filename" VARCHAR(50) NOT NULL,
    "format" VARCHAR(50) NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buzz_vote" (
    "id" TEXT NOT NULL DEFAULT uuidv7_sub_ms(),
    "voter_id" TEXT NOT NULL,
    "buzz_id" TEXT NOT NULL,
    "type" "vote_type" NOT NULL,
    "voted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "buzz_vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buzz_media" (
    "id" TEXT NOT NULL DEFAULT uuidv7_sub_ms(),
    "buzz_id" TEXT NOT NULL,
    "image_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "buzz_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment" (
    "id" TEXT NOT NULL DEFAULT uuidv7_sub_ms(),
    "author_id" TEXT NOT NULL,
    "buzz_id" TEXT NOT NULL,
    "parent_comment_id" TEXT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment_vote" (
    "id" TEXT NOT NULL DEFAULT uuidv7_sub_ms(),
    "voter_id" TEXT NOT NULL,
    "comment_id" TEXT NOT NULL,
    "type" "vote_type" NOT NULL,
    "voted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comment_vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BuzzToHashtag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateView
CREATE OR REPLACE VIEW "buzz_engagement" AS
    SELECT 
        b.id,
        COUNT(CASE WHEN bz.type = 'up' THEN 1 END) AS upvote_count,
        COUNT(CASE WHEN bz.type = 'down' THEN 1 END) AS downvote_count,
        COUNT(bz.type) AS vote_count,
        COUNT(CASE WHEN bz.type = 'up' THEN 1 END) - 
        COUNT(CASE WHEN bz.type = 'down' THEN 1 END) AS vote_balance,
        1 - (
            ABS(
                COUNT(CASE WHEN bz.type = 'up' THEN 1 END) - 
                COUNT(CASE WHEN bz.type = 'down' THEN 1 END)
            )::NUMERIC 
            / GREATEST(
                COUNT(CASE WHEN bz.type = 'up' THEN 1 END) + 
                COUNT(CASE WHEN bz.type = 'down' THEN 1 END), 1
            )::NUMERIC
        )::NUMERIC(5,4) AS controversy
    FROM "buzz" b
    LEFT JOIN "buzz_vote" bz 
    ON b.id = bz."buzz_id"
    AND bz."voted_at" >= NOW() - INTERVAL '7 days'
    GROUP BY b.id, b.author_id, b.created_at;

-- CreateView
CREATE OR REPLACE VIEW "hashtag_engagement" AS
    SELECT 
        h.id, 
        h.name, 
        COUNT(DISTINCT CASE WHEN b.created_at >= NOW() - INTERVAL '24 hours' THEN b.author_id END) AS usage_count,
        COUNT(DISTINCT b.author_id) AS total_usage_count,
        MIN(b.created_at) AS first_usage_date,  
        MAX(b.created_at) AS last_usage_date
    FROM "hashtag" h
    JOIN "_BuzzToHashtag" bh ON h.id = bh."B"
    JOIN buzz b ON bh."A" = b.id
    GROUP BY h.id, h.name;


-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profile_propic_id_key" ON "profile"("propic_id");

-- CreateIndex
CREATE UNIQUE INDEX "profile_cover_id_key" ON "profile"("cover_id");

-- CreateIndex
CREATE UNIQUE INDEX "follow_following_id_follower_id_key" ON "follow"("following_id", "follower_id");

-- CreateIndex
CREATE UNIQUE INDEX "hashtag_name_key" ON "hashtag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "bookmark_user_id_buzz_id_key" ON "bookmark"("user_id", "buzz_id");

-- CreateIndex
CREATE UNIQUE INDEX "image_filename_key" ON "image"("filename");

-- CreateIndex
CREATE UNIQUE INDEX "buzz_vote_voter_id_buzz_id_key" ON "buzz_vote"("voter_id", "buzz_id");

-- CreateIndex
CREATE UNIQUE INDEX "comment_vote_voter_id_comment_id_key" ON "comment_vote"("voter_id", "comment_id");

-- CreateIndex
CREATE UNIQUE INDEX "_BuzzToHashtag_AB_unique" ON "_BuzzToHashtag"("A", "B");

-- CreateIndex
CREATE INDEX "_BuzzToHashtag_B_index" ON "_BuzzToHashtag"("B");

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_id_fkey" FOREIGN KEY ("id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_propic_id_fkey" FOREIGN KEY ("propic_id") REFERENCES "image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_cover_id_fkey" FOREIGN KEY ("cover_id") REFERENCES "image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow" ADD CONSTRAINT "follow_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow" ADD CONSTRAINT "follow_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buzz" ADD CONSTRAINT "buzz_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmark" ADD CONSTRAINT "bookmark_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmark" ADD CONSTRAINT "bookmark_buzz_id_fkey" FOREIGN KEY ("buzz_id") REFERENCES "buzz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image" ADD CONSTRAINT "image_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buzz_vote" ADD CONSTRAINT "buzz_vote_voter_id_fkey" FOREIGN KEY ("voter_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buzz_vote" ADD CONSTRAINT "buzz_vote_buzz_id_fkey" FOREIGN KEY ("buzz_id") REFERENCES "buzz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buzz_media" ADD CONSTRAINT "buzz_media_buzz_id_fkey" FOREIGN KEY ("buzz_id") REFERENCES "buzz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buzz_media" ADD CONSTRAINT "buzz_media_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_buzz_id_fkey" FOREIGN KEY ("buzz_id") REFERENCES "buzz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_vote" ADD CONSTRAINT "comment_vote_voter_id_fkey" FOREIGN KEY ("voter_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_vote" ADD CONSTRAINT "comment_vote_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BuzzToHashtag" ADD CONSTRAINT "_BuzzToHashtag_A_fkey" FOREIGN KEY ("A") REFERENCES "buzz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BuzzToHashtag" ADD CONSTRAINT "_BuzzToHashtag_B_fkey" FOREIGN KEY ("B") REFERENCES "hashtag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
