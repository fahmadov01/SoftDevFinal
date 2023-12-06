DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE IF NOT EXISTS  users(
    username VARCHAR(50) PRIMARY KEY,
    password CHAR(60) NOT NULL
);

DROP TABLE IF EXISTS liked_articles;
CREATE TABLE IF NOT EXISTS liked_articles (
    article_title VARCHAR(1000) NOT NULL,
    article_url VARCHAR(1000) NOT NULL,
    article_img VARCHAR(1000) NOT NULL
);