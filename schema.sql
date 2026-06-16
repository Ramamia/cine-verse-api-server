
-- Drop tables if they exist so we can recreate them fresh yk
DROP TABLE IF EXISTS followers CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS user_top_movies CASCADE;
DROP TABLE IF EXISTS movies CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS ui_assets CASCADE;

-- Enable the UUID extension (required for generating UUIDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(100),
  bio TEXT,
  avatar_skin VARCHAR(50),
  avatar_acc VARCHAR(50),
  profile_picture_url VARCHAR(255)
);

-- 2. Movies Table
CREATE TABLE movies (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255),
  slogan VARCHAR(255),
  description TEXT,
  release_year INT,
  director VARCHAR(255),
  actors VARCHAR(255),
  poster_url VARCHAR(255),
  genre VARCHAR(50),
  side VARCHAR(50),
  z INT
);

-- 3. User Top Movies Table (Many-to-Many)
CREATE TABLE user_top_movies (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  movie_id VARCHAR(100) REFERENCES movies(id) ON DELETE CASCADE,
  position INT CHECK (position >= 1 AND position <= 5),
  PRIMARY KEY (user_id, movie_id)
);

-- 4. Reviews Table (Cine Social Feed)
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  movie_id VARCHAR(100) REFERENCES movies(id) ON DELETE CASCADE,
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5.0),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Followers Table (Many-to-Many)
CREATE TABLE followers (
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (follower_id, following_id)
);

-- 6. UI Assets Table (Key-Value Store for backgrounds/videos)
CREATE TABLE ui_assets (
  name VARCHAR(255) PRIMARY KEY,
  url TEXT NOT NULL
);

-- ==========================================
-- SEED DATA SECTION (INSERT STATEMENTS)
-- ==========================================


-- Seeding Movies
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('romcom-set-it-up', 'Set It Up', 'Finding love takes some assistants.', 'Two overworked and underpaid assistants come up with a plan to get their bosses off their backs by setting them up with each other.', 2018, 'Claire Scanlon', 'Glen Powell, Zoey Deutch, Taye Diggs, Lucy Liu', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566613/images/romcomMovies/i3vliyuqlfiwdyqlvuyh.png', 'romcom', 'left', -18);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('romcom-the-holiday', 'The Holiday', 'It''s Christmas Eve and we are going to go celebrate being young and being alive.', 'Two women, one American and one British, swap homes at Christmastime following bad breakups. Each woman finds romance with a local man.', 2006, 'Nancy Meyers', 'Cameron Diaz, Kate Winslet, Jude Law, Jack Black', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566613/images/romcomMovies/sg38pgcceexma30fn3wc.png', 'romcom', 'right', -18);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('romcom-people-vacation', 'People We Meet on Vacation', 'On vacation, you''re free to follow your heart.', 'Poppy''s a free spirit. Alex loves a plan. After years of summer vacations, these polar-opposite pals wonder if they could be a perfect romantic match.', 2026, 'Brett Haley', 'Emily Bader, Tom Blyth, Sarah Catherine Hook, Jameela Jamil', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566614/images/romcomMovies/r8nqr75df9tlxxemz0dl.png', 'romcom', 'left', -25);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('romcom-anyone-but-you', 'Anyone But You', 'They only look like the perfect couple.', 'After an amazing first date, Bea and Ben''s fiery attraction turns ice cold — until they find themselves unexpectedly reunited at a destination wedding in Australia.', 2023, 'Will Gluck', 'Sydney Sweeney, Glen Powell, Mia Artemis, Nat Buchanan', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566615/images/romcomMovies/qfkytbtyaeumcltmmey5.png', 'romcom', 'right', -25);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('romcom-the-proposal', 'The Proposal', 'Here comes the bride.', 'Faced with deportation to her native Canada, high-powered book editor Margaret Tate says she''s engaged to marry Andrew Paxton, her hapless assistant. Andrew agrees to the charade, but imposes a few conditions of his own, including flying to Alaska to meet his eccentric family.', 2009, 'Anne Fletcher', 'Sandra Bullock, Ryan Reynolds, Mary Steenburgen, Craig T. Nelson', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566616/images/romcomMovies/ty57kfiwir7cws9nihwq.png', 'romcom', 'left', -32);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('scifi-black-moon', 'Black Moon Rising', 'Meet Sam Quint… Stealing from him is the biggest mistake you can make.', 'An FBI free-lancer stashes a stolen Las Vegas-crime tape in a high-tech car stolen by someone else.', 1986, 'Harley Cokeliss', 'Tommy Lee Jones, Linda Hamilton, Robert Vaughn, Richard Jaeckel', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566617/images/scifiMovies/m37ejwunaxpru39vjmbh.png', 'scifi', 'left', 10);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('scifi-hail-mary', 'Project Hail Mary', 'Believe in the Hail Mary.', 'Science teacher Ryland Grace wakes up on a spaceship light years from home with no recollection of who he is. He must use his scientific knowledge to save Earth from extinction with the help of an unexpected friend.', 2026, 'Phil Lord, Christopher Miller', 'Ryan Gosling, Sandra Hüller, James Ortiz, Lionel Boyce', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566618/images/scifiMovies/vh4qnqpm9k5h3j02kyo4.png', 'scifi', 'right', 10);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('scifi-avatar', 'Avatar', 'Enter the world of Pandora.', 'In the 22nd century, a paraplegic Marine is dispatched to the moon Pandora on a unique mission, but becomes torn between following orders and protecting an alien civilization.', 2009, 'James Cameron', 'Sam Worthington, Zoe Saldaña, Sigourney Weaver, Stephen Lang', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566619/images/scifiMovies/dy6auc2wyyyoiemtwylz.png', 'scifi', 'left', 3);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('horror-cabin-woods', 'The Cabin in the Woods', 'You think you know the story.', 'Five friends set out for a weekend at a remote cabin in the woods, expecting nothing more than fun and relaxation. As night falls, they discover that something far more unsettling is at work and that nothing about their getaway is what it seems.', 2011, 'Drew Goddard', 'Kristen Connolly, Fran Kranz, Chris Hemsworth, Jesse Williams', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566597/images/horrorMovies/agnksturnvpsfq5yfptn.jpg', 'horror', 'right', 3);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('horror-mother', 'mother!', 'Seeing is believing.', 'A couple’s relationship is tested when uninvited guests arrive at their home, disrupting their tranquil existence.', 2017, 'Darren Aronofsky', 'Jennifer Lawrence, Javier Bardem, Ed Harris, Michelle Pfeiffer', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566599/images/horrorMovies/uygjw9quqxkwtopo2ql0.jpg', 'horror', 'left', -4);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('horror-terrifier', 'Terrifier', 'You never forget your first kill.', 'A maniacal clown named Art terrorizes three young women on Halloween night and everyone else who stands in his way.', 2016, 'Damien Leone', 'David Howard Thornton, Jenna Kanell, Samantha Scaffidi, Catherine Corcoran', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566600/images/horrorMovies/quy4km5lbov5opkex0ur.jpg', 'horror', 'right', -4);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('horror-get-out', 'Get Out', 'Just because you’re invited, doesn’t mean you’re welcome.', 'Chris and his girlfriend Rose go upstate to visit her parents for the weekend. At first, Chris reads the family’s overly accommodating behavior as nervous attempts to deal with their daughter’s interracial relationship, but he soon discovers a disturbing truth.', 2017, 'Jordan Peele', 'Daniel Kaluuya, Allison Williams, Catherine Keener, Bradley Whitford', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566600/images/horrorMovies/pbjwih8qoyj3xidksmlq.png', 'horror', 'left', -11);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('horror-saw', 'Saw', 'How much blood would you shed to stay alive?', 'Two men wake up to find themselves shackled in a grimy, abandoned bathroom. They discover they must partake in a gruesome game orchestrated by the sadistic mastermind Jigsaw in order to secure their freedom.', 2004, 'James Wan', 'Tobin Bell, Cary Elwes, Leigh Whannell, Danny Glover', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566601/images/horrorMovies/pkev2abcxjntr562jglm.jpg', 'horror', 'right', -11);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('horror-eden-lake', 'Eden Lake', 'A weekend by the lake, with views to die for.', 'When a young couple goes to a remote wooded lake for a romantic getaway, their quiet weekend is shattered by an aggressive group of local kids. A weekend outing becomes a bloody battle for survival.', 2008, 'James Watkins', 'Kelly Reilly, Michael Fassbender, Jack O''Connell, Finn Atkins', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566602/images/horrorMovies/jgytozkarkado8tgsour.jpg', 'horror', 'left', -18);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('horror-hereditary', 'Hereditary', 'Every family tree hides a secret.', 'Following the death of the Leigh family matriarch, Annie and her children uncover disturbing secrets about their heritage, becoming entangled in a chilling fate from which they cannot escape.', 2018, 'Ari Aster', 'Toni Collette, Alex Wolff, Gabriel Byrne, Milly Shapiro', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566603/images/horrorMovies/qd24ui02ittgljlxkjiz.png', 'horror', 'right', -18);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('horror-orphan', 'Orphan', 'There’s something wrong with Esther.', 'After losing their baby, a married couple adopt 9-year old Esther, who may not be as innocent as she seems.', 2009, 'Jaume Collet-Serra', 'Vera Farmiga, Peter Sarsgaard, Isabelle Fuhrman, CCH Pounder', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566604/images/horrorMovies/omjenhbvvkxsl2s19sfn.jpg', 'horror', 'left', -25);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('scifi-blade-runner', 'Blade Runner 2049', 'The key to the future is finally unearthed.', 'Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what’s left of society into chaos.', 2017, 'Denis Villeneuve', 'Ryan Gosling, Harrison Ford, Ana de Armas, Dave Bautista', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566620/images/scifiMovies/vhnieq6yzxlqlqkqroga.png', 'scifi', 'right', 3);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('scifi-lucy', 'Lucy', 'The average person uses 10% of their brain capacity. Imagine what she could do with 100%.', 'A woman, accidentally caught in a dark deal, turns the tables on her captors and transforms into a merciless warrior evolved beyond human logic.', 2014, 'Luc Besson', 'Scarlett Johansson, Morgan Freeman, Choi Min-sik, Amr Waked', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566620/images/scifiMovies/akh1lpufwkxz39fmafsk.png', 'scifi', 'left', -4);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('scifi-28-days', '28 Days Later', 'The days are numbered.', 'Twenty-eight days after a killer virus is accidentally unleashed from a British research facility, a small group of London survivors are caught in a desperate struggle to protect themselves from the infected.', 2002, 'Danny Boyle', 'Cillian Murphy, Naomie Harris, Brendan Gleeson, Megan Burns', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566621/images/scifiMovies/nyotgqhvo6bfq0b5b7kl.png', 'scifi', 'right', -4);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('scifi-dune', 'Dune', 'It begins.', 'Paul Atreides, a brilliant and gifted young man, must travel to the most dangerous planet in the universe to ensure the future of his family and his people as malevolent forces explode into conflict.', 2021, 'Denis Villeneuve', 'Timothée Chalamet, Rebecca Ferguson, Oscar Isaac, Jason Momoa', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566622/images/scifiMovies/vzefsouqe8ioz6qd9njj.png', 'scifi', 'left', -11);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('scifi-world-war-z', 'World War Z', 'There will come a day when the world we know will end.', 'Former UN investigator Gerry Lane must travel the world in a race against time to stop a pandemic that is toppling armies and governments and threatening to decimate humanity itself.', 2013, 'Marc Forster', 'Brad Pitt, Mireille Enos, Daniella Kertesz, James Badge Dale', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566623/images/scifiMovies/p7riupr24yis5wme5z8j.png', 'scifi', 'right', -11);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('scifi-guardians', 'Guardians of the Galaxy', 'When things get bad, they’ll do their worst.', 'Light years from Earth, Peter Quill finds himself the prime target of a manhunt after discovering an orb wanted by Ronan the Accuser, leading him to form an alliance with a group of extraterrestrial misfits.', 2014, 'James Gunn', 'Chris Pratt, Zoe Saldaña, Dave Bautista, Vin Diesel', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566624/images/scifiMovies/dqs94lgk8gmtpd7svfi5.png', 'scifi', 'left', -18);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('scifi-inception', 'Inception', 'Your mind is the scene of the crime.', 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious, is offered a chance to regain his old life by performing the "impossible" task of implantation.', 2010, 'Christopher Nolan', 'Leonardo DiCaprio, Joseph Gordon-Levitt, Ken Watanabe, Tom Hardy', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566625/images/scifiMovies/rpsdbvywgugctdtqte40.png', 'scifi', 'right', -18);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('scifi-matrix', 'The Matrix', 'Believe the unbelievable.', 'A computer hacker joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth and keep humanity trapped in a simulated reality.', 1999, 'Lana Wachowski, Lilly Wachowski', 'Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss, Hugo Weaving', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566625/images/scifiMovies/pmdv9kgye2yv2asdq96o.png', 'scifi', 'left', -25);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('scifi-interstellar', 'Interstellar', 'Mankind was born on Earth. It was never meant to die here.', 'A group of explorers make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage to find a new home for humanity.', 2014, 'Christopher Nolan', 'Matthew McConaughey, Anne Hathaway, Michael Caine, Jessica Chastain', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566626/images/scifiMovies/nannhxiokpunbf9mpu1c.png', 'scifi', 'right', -25);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('horror-hush', 'Hush', 'Silence can be killer.', 'A deaf woman is stalked by a psychotic killer in her secluded home.', 2016, 'Mike Flanagan', 'Kate Siegel, John Gallagher Jr., Michael Trucco, Samantha Sloyan', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566605/images/horrorMovies/r4dpkoehrcfsw5yugrha.png', 'horror', 'right', -25);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('romcom-10-things', '10 Things I Hate About You', 'How do I loathe thee? Let me count the ways.', 'On the first day at his new school, Cameron instantly falls for Bianca, the gorgeous girl of his dreams. The only problem is that Bianca is forbidden to date until her ill-tempered, completely un-dateable older sister Kat goes out, too.', 1999, 'Gil Junger', 'Heath Ledger, Julia Stiles, Joseph Gordon-Levitt, Larisa Oleynik', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566606/images/romcomMovies/qsasplvxmlyke1b2ehp8.png', 'romcom', 'left', 10);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('romcom-13-going-30', '13 Going on 30', 'For some, 13 feels like it was just yesterday. For Jenna, it was.', 'After total humiliation at her thirteenth birthday party, Jenna Rink wants to just hide until she''s thirty. Thanks to some magic wishing dust, Jenna''s prayer has been answered.', 2004, 'Gary Winick', 'Jennifer Garner, Mark Ruffalo, Judy Greer, Andy Serkis', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566607/images/romcomMovies/gtah7hh1mvkcrfnpdzk5.png', 'romcom', 'right', 10);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('romcom-27-dresses', '27 Dresses', 'She''s about to find the perfect fit.', 'Altruistic Jane finds herself facing her worst nightmare as her younger sister announces her engagement to the man Jane secretly adores.', 2008, 'Anne Fletcher', 'Katherine Heigl, James Marsden, Malin Åkerman, Judy Greer', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566608/images/romcomMovies/cwjmnelmybn1nqhnbsga.png', 'romcom', 'left', 3);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('romcom-shes-the-man', 'She''s the Man', 'Everybody has a secret…', 'Viola Hastings is in a real jam. Complications threaten her scheme to pose as her twin brother, Sebastian, and take his place at a new boarding school.', 2006, 'Andy Fickman', 'Amanda Bynes, Channing Tatum, Laura Ramsey, Vinnie Jones', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566608/images/romcomMovies/opfy7cec96expxuucqm6.png', 'romcom', 'right', 3);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('romcom-cinderella-story', 'A Cinderella Story', 'Once upon a time… can happen any time.', 'Routinely exploited by her wicked stepmother, the downtrodden Samantha Montgomery is excited about the prospect of meeting her Internet beau at the school''s Halloween dance.', 2004, 'Mark Rosman', 'Hilary Duff, Chad Michael Murray, Jennifer Coolidge, Dan Byrd', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566609/images/romcomMovies/ajwgvotjxmonxmbiopuo.png', 'romcom', 'left', -4);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('romcom-how-to-lose', 'How to Lose a Guy in 10 Days', 'One of them is lying. So is the other.', 'It''s the battle of wills, as Andie needs to prove she can dump a guy in 10 days, whereas Ben needs to prove he can win a girl in 10 days.', 2003, 'Donald Petrie', 'Kate Hudson, Matthew McConaughey, Kathryn Hahn, Annie Parisse', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566610/images/romcomMovies/vkcb0rbethuzi93ddz5g.png', 'romcom', 'right', -4);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('romcom-when-harry', 'When Harry Met Sally…', 'Can two friends sleep together and still love each other in the morning?', 'Sex always gets in the way of friendships between men and women. At least, that''s what Harry Burns believes. So when Harry meets Sally Albright and a deep friendship blossoms between them, Harry''s determined not to let his attraction to Sally destroy it.', 1989, 'Rob Reiner', 'Billy Crystal, Meg Ryan, Carrie Fisher, Bruno Kirby', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566611/images/romcomMovies/zh0nyepkwopqlkxo94qg.png', 'romcom', 'left', -11);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('romcom-legally-blonde', 'Legally Blonde', 'Boldly going where no blonde has gone.', 'Fashionable sorority queen Elle Woods has it all, but she wants nothing more than to be Mrs. Warner Huntington III. When he dumps her, she gets into Harvard Law to win him back.', 2001, 'Robert Luketic', 'Reese Witherspoon, Luke Wilson, Selma Blair, Matthew Davis', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566612/images/romcomMovies/djjqzfkul9cozberjyop.png', 'romcom', 'right', -11);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('horror-jacobs-ladder', 'Jacob’s Ladder', 'The most frightening thing about Jacob Singer’s nightmare is that he isn’t dreaming.', 'After returning home from the Vietnam War, veteran Jacob Singer struggles to maintain his sanity. Plagued by hallucinations and flashbacks, Singer rapidly falls apart as the world and people around him morph and twist into disturbing images.', 1990, 'Adrian Lyne', 'Tim Robbins, Elizabeth Peña, Danny Aiello, Matt Craven', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566595/images/horrorMovies/l5v0wbawxaxmghg97sg4.png', 'horror', 'left', 10);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('horror-it', 'It', 'The Master of Horror unleashes everything you were ever afraid of.', 'In 1960, seven outcast kids known as “The Losers’ Club” fight against an ancient shape-shifting alien who poses as a child-killing clown. Thirty years later, they reunite to stop the creature once and for all when it returns to their hometown.', 1990, 'Tommy Lee Wallace', 'Tim Curry, Harry Anderson, Dennis Christopher, Richard Masur', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566596/images/horrorMovies/pknyymz8ixvflldcozgw.png', 'horror', 'right', 10);
INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z) VALUES ('horror-exorcist-3', 'The Exorcist III', 'Do you dare walk these steps again?', 'On the fifteenth anniversary of the exorcism that claimed Father Damien Karras’ life, Police Lieutenant Kinderman’s world is once again shattered when a boy is found decapitated and savagely crucified.', 1990, 'William Peter Blatty', 'George C. Scott, Ed Flanders, Brad Dourif, Jason Miller', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566597/images/horrorMovies/kyl4ueixjyvembz9jqkc.jpg', 'horror', 'left', 3);

-- Seeding UI Assets
INSERT INTO ui_assets (name, url) VALUES ('images/avatarsPFP_baseAvatar.png', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566628/cineverse_assets/images/avatarsPFP/qnwejbs6ruezyolqpkf3.png');
INSERT INTO ui_assets (name, url) VALUES ('images/avatarsPFP_film-strip.png', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566629/cineverse_assets/images/avatarsPFP/qgb2zsbyq9uzpcp5xf5c.png');
INSERT INTO ui_assets (name, url) VALUES ('images/avatarsPFP_greenAvatar.png', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566631/cineverse_assets/images/avatarsPFP/p1culjilhawmyzrs6jvg.png');
INSERT INTO ui_assets (name, url) VALUES ('images/avatarsPFP_greenCowboyAvatar.png', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566633/cineverse_assets/images/avatarsPFP/lghe1es97fsuvuvnuts4.png');
INSERT INTO ui_assets (name, url) VALUES ('images/avatarsPFP_pinkAvatar.png', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566635/cineverse_assets/images/avatarsPFP/k2qwomqd6vacdnjtu0wr.png');
INSERT INTO ui_assets (name, url) VALUES ('images/avatarsPFP_pinkCowboyAvatar.png', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566637/cineverse_assets/images/avatarsPFP/dw6ptqhmazc4i9fvoyb4.png');
INSERT INTO ui_assets (name, url) VALUES ('images/loadingBackgrounds_horror_bg.png', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566638/cineverse_assets/images/loadingBackgrounds/nxxu6wibiknvlw8n8mbn.png');
INSERT INTO ui_assets (name, url) VALUES ('images/loadingBackgrounds_romcom_bg.png', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566639/cineverse_assets/images/loadingBackgrounds/mslemrunssu6v3hyuicw.png');
INSERT INTO ui_assets (name, url) VALUES ('images/loadingBackgrounds_scifi_bg.png', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566640/cineverse_assets/images/loadingBackgrounds/yjoqyujeagctcaqdimev.png');
INSERT INTO ui_assets (name, url) VALUES ('videos_astronaut.mp4', 'https://res.cloudinary.com/dupxhdpod/video/upload/v1781566641/cineverse_assets/videos/zfqiffcodmmlt4vbx16l.mp4');
INSERT INTO ui_assets (name, url) VALUES ('videos_cowboy.mp4', 'https://res.cloudinary.com/dupxhdpod/video/upload/v1781566642/cineverse_assets/videos/cex7tcflzmz79ivhoovl.mp4');
INSERT INTO ui_assets (name, url) VALUES ('videos_glasses.mp4', 'https://res.cloudinary.com/dupxhdpod/video/upload/v1781566643/cineverse_assets/videos/tvwyaygcxlacgummxtda.mp4');
INSERT INTO ui_assets (name, url) VALUES ('videos_marilyn.mp4', 'https://res.cloudinary.com/dupxhdpod/video/upload/v1781566644/cineverse_assets/videos/bckeuuxpbzgwagieezcw.mp4');
INSERT INTO ui_assets (name, url) VALUES ('fav-icon2.png', 'https://res.cloudinary.com/dupxhdpod/image/upload/v1781566645/cineverse_assets/ifarxecimp8xpqcm37lj.png');

-- Seeding Mock Users (hashed password corresponds to 'password123')
INSERT INTO users (id, email, password_hash, nickname, bio, avatar_skin, avatar_acc) VALUES 
('a2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'lara@example.com', '$2b$10$Ovk0F40Y6q.17.GfL/r0O.m/8Vd4R5N9lWqN7u02a4K1.P.2z7p.C', 'Lara', 'love scream and slashers yk', 'pinkAvatar.png', 'cowboy.mp4'),
('b3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'fahed@example.com', '$2b$10$Ovk0F40Y6q.17.GfL/r0O.m/8Vd4R5N9lWqN7u02a4K1.P.2z7p.C', 'Fahed', 'movie critic, only watch peak cinema', 'greenAvatar.png', 'sunglasses.mp4');

-- Seeding Mock Reviews
INSERT INTO reviews (user_id, movie_id, rating, comment) VALUES
('a2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'horror-saw', 5.0, 'The twist in Scream 6 blew my mind!'),
('b3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'horror-terrifier', 2.9, 'I cant believe the ending of that movie it sucks'),
('a2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'scifi-matrix', 4.5, 'minecraft movie was AMAZINGG');

-- Seeding Followers Link
INSERT INTO followers (follower_id, following_id) VALUES
('a2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'b3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f'),
('b3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'a2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e');
