import { v2 as cloudinary } from "cloudinary";
import pool from "./config/db.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Configure cloudinary with your keys from .env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Setup paths to grab the images from your frontend folder
const frontendPublicPath = "c:\\Users\\User\\Desktop\\Y4S2\\Web App\\My work\\cine-verse-WebApp\\public";

// Your exact frontend movies data
const HORROR_MOVIES = [
  { id: 'horror-jacobs-ladder', title: 'Jacob’s Ladder', slogan: 'The most frightening thing about Jacob Singer’s nightmare is that he isn’t dreaming.', description: 'After returning home from the Vietnam War, veteran Jacob Singer struggles to maintain his sanity. Plagued by hallucinations and flashbacks, Singer rapidly falls apart as the world and people around him morph and twist into disturbing images.', year: 1990, director: 'Adrian Lyne', actors: 'Tim Robbins, Elizabeth Peña, Danny Aiello, Matt Craven', poster: '/images/horrorMovies/jacobs_ladder.png', side: 'left', z: 10 },
  { id: 'horror-it', title: 'It', slogan: 'The Master of Horror unleashes everything you were ever afraid of.', description: 'In 1960, seven outcast kids known as “The Losers’ Club” fight against an ancient shape-shifting alien who poses as a child-killing clown. Thirty years later, they reunite to stop the creature once and for all when it returns to their hometown.', year: 1990, director: 'Tommy Lee Wallace', actors: 'Tim Curry, Harry Anderson, Dennis Christopher, Richard Masur', poster: '/images/horrorMovies/it.png', side: 'right', z: 10 },
  { id: 'horror-exorcist-3', title: 'The Exorcist III', slogan: 'Do you dare walk these steps again?', description: 'On the fifteenth anniversary of the exorcism that claimed Father Damien Karras’ life, Police Lieutenant Kinderman’s world is once again shattered when a boy is found decapitated and savagely crucified.', year: 1990, director: 'William Peter Blatty', actors: 'George C. Scott, Ed Flanders, Brad Dourif, Jason Miller', poster: '/images/horrorMovies/exorcist_3.png', side: 'left', z: 3 },
  { id: 'horror-cabin-woods', title: 'The Cabin in the Woods', slogan: 'You think you know the story.', description: 'Five friends set out for a weekend at a remote cabin in the woods, expecting nothing more than fun and relaxation. As night falls, they discover that something far more unsettling is at work and that nothing about their getaway is what it seems.', year: 2011, director: 'Drew Goddard', actors: 'Kristen Connolly, Fran Kranz, Chris Hemsworth, Jesse Williams', poster: '/images/horrorMovies/cabin_in_the_woods.png', side: 'right', z: 3 },
  { id: 'horror-mother', title: 'mother!', slogan: 'Seeing is believing.', description: 'A couple’s relationship is tested when uninvited guests arrive at their home, disrupting their tranquil existence.', year: 2017, director: 'Darren Aronofsky', actors: 'Jennifer Lawrence, Javier Bardem, Ed Harris, Michelle Pfeiffer', poster: '/images/horrorMovies/mother.png', side: 'left', z: -4 },
  { id: 'horror-terrifier', title: 'Terrifier', slogan: 'You never forget your first kill.', description: 'A maniacal clown named Art terrorizes three young women on Halloween night and everyone else who stands in his way.', year: 2016, director: 'Damien Leone', actors: 'David Howard Thornton, Jenna Kanell, Samantha Scaffidi, Catherine Corcoran', poster: '/images/horrorMovies/terrifier.png', side: 'right', z: -4 },
  { id: 'horror-get-out', title: 'Get Out', slogan: 'Just because you’re invited, doesn’t mean you’re welcome.', description: 'Chris and his girlfriend Rose go upstate to visit her parents for the weekend. At first, Chris reads the family’s overly accommodating behavior as nervous attempts to deal with their daughter’s interracial relationship, but he soon discovers a disturbing truth.', year: 2017, director: 'Jordan Peele', actors: 'Daniel Kaluuya, Allison Williams, Catherine Keener, Bradley Whitford', poster: '/images/horrorMovies/get_out.png', side: 'left', z: -11 },
  { id: 'horror-saw', title: 'Saw', slogan: 'How much blood would you shed to stay alive?', description: 'Two men wake up to find themselves shackled in a grimy, abandoned bathroom. They discover they must partake in a gruesome game orchestrated by the sadistic mastermind Jigsaw in order to secure their freedom.', year: 2004, director: 'James Wan', actors: 'Tobin Bell, Cary Elwes, Leigh Whannell, Danny Glover', poster: '/images/horrorMovies/saw.png', side: 'right', z: -11 },
  { id: 'horror-eden-lake', title: 'Eden Lake', slogan: 'A weekend by the lake, with views to die for.', description: 'When a young couple goes to a remote wooded lake for a romantic getaway, their quiet weekend is shattered by an aggressive group of local kids. A weekend outing becomes a bloody battle for survival.', year: 2008, director: 'James Watkins', actors: 'Kelly Reilly, Michael Fassbender, Jack O\'Connell, Finn Atkins', poster: '/images/horrorMovies/eden_lake.png', side: 'left', z: -18 },
  { id: 'horror-hereditary', title: 'Hereditary', slogan: 'Every family tree hides a secret.', description: 'Following the death of the Leigh family matriarch, Annie and her children uncover disturbing secrets about their heritage, becoming entangled in a chilling fate from which they cannot escape.', year: 2018, director: 'Ari Aster', actors: 'Toni Collette, Alex Wolff, Gabriel Byrne, Milly Shapiro', poster: '/images/horrorMovies/hereditary.png', side: 'right', z: -18 },
  { id: 'horror-orphan', title: 'Orphan', slogan: 'There’s something wrong with Esther.', description: 'After losing their baby, a married couple adopt 9-year old Esther, who may not be as innocent as she seems.', year: 2009, director: 'Jaume Collet-Serra', actors: 'Vera Farmiga, Peter Sarsgaard, Isabelle Fuhrman, CCH Pounder', poster: '/images/horrorMovies/orphan.png', side: 'left', z: -25 },
  { id: 'horror-hush', title: 'Hush', slogan: 'Silence can be killer.', description: 'A deaf woman is stalked by a psychotic killer in her secluded home.', year: 2016, director: 'Mike Flanagan', actors: 'Kate Siegel, John Gallagher Jr., Michael Trucco, Samantha Sloyan', poster: '/images/horrorMovies/hush.png', side: 'right', z: -25 }
];

const ROMCOM_MOVIES = [
  { id: 'romcom-10-things', title: '10 Things I Hate About You', slogan: 'How do I loathe thee? Let me count the ways.', description: 'On the first day at his new school, Cameron instantly falls for Bianca, the gorgeous girl of his dreams. The only problem is that Bianca is forbidden to date until her ill-tempered, completely un-dateable older sister Kat goes out, too.', year: 1999, director: 'Gil Junger', actors: 'Heath Ledger, Julia Stiles, Joseph Gordon-Levitt, Larisa Oleynik', poster: '/images/romcomMovies/10 things i hate about you.png', side: 'left', z: 10 },
  { id: 'romcom-13-going-30', title: '13 Going on 30', slogan: 'For some, 13 feels like it was just yesterday. For Jenna, it was.', description: 'After total humiliation at her thirteenth birthday party, Jenna Rink wants to just hide until she\'s thirty. Thanks to some magic wishing dust, Jenna\'s prayer has been answered.', year: 2004, director: 'Gary Winick', actors: 'Jennifer Garner, Mark Ruffalo, Judy Greer, Andy Serkis', poster: '/images/romcomMovies/13 going 30.png', side: 'right', z: 10 },
  { id: 'romcom-27-dresses', title: '27 Dresses', slogan: 'She\'s about to find the perfect fit.', description: 'Altruistic Jane finds herself facing her worst nightmare as her younger sister announces her engagement to the man Jane secretly adores.', year: 2008, director: 'Anne Fletcher', actors: 'Katherine Heigl, James Marsden, Malin Åkerman, Judy Greer', poster: '/images/romcomMovies/27 dresses.png', side: 'left', z: 3 },
  { id: 'romcom-shes-the-man', title: 'She\'s the Man', slogan: 'Everybody has a secret…', description: 'Viola Hastings is in a real jam. Complications threaten her scheme to pose as her twin brother, Sebastian, and take his place at a new boarding school.', year: 2006, director: 'Andy Fickman', actors: 'Amanda Bynes, Channing Tatum, Laura Ramsey, Vinnie Jones', poster: '/images/romcomMovies/she\'s the man.png', side: 'right', z: 3 },
  { id: 'romcom-cinderella-story', title: 'A Cinderella Story', slogan: 'Once upon a time… can happen any time.', description: 'Routinely exploited by her wicked stepmother, the downtrodden Samantha Montgomery is excited about the prospect of meeting her Internet beau at the school\'s Halloween dance.', year: 2004, director: 'Mark Rosman', actors: 'Hilary Duff, Chad Michael Murray, Jennifer Coolidge, Dan Byrd', poster: '/images/romcomMovies/a cinderella story.png', side: 'left', z: -4 },
  { id: 'romcom-how-to-lose', title: 'How to Lose a Guy in 10 Days', slogan: 'One of them is lying. So is the other.', description: 'It\'s the battle of wills, as Andie needs to prove she can dump a guy in 10 days, whereas Ben needs to prove he can win a girl in 10 days.', year: 2003, director: 'Donald Petrie', actors: 'Kate Hudson, Matthew McConaughey, Kathryn Hahn, Annie Parisse', poster: '/images/romcomMovies/how to lose a guy in 10 days.png', side: 'right', z: -4 },
  { id: 'romcom-when-harry', title: 'When Harry Met Sally…', slogan: 'Can two friends sleep together and still love each other in the morning?', description: 'Sex always gets in the way of friendships between men and women. At least, that\'s what Harry Burns believes. So when Harry meets Sally Albright and a deep friendship blossoms between them, Harry\'s determined not to let his attraction to Sally destroy it.', year: 1989, director: 'Rob Reiner', actors: 'Billy Crystal, Meg Ryan, Carrie Fisher, Bruno Kirby', poster: '/images/romcomMovies/when harry met sally.png', side: 'left', z: -11 },
  { id: 'romcom-legally-blonde', title: 'Legally Blonde', slogan: 'Boldly going where no blonde has gone.', description: 'Fashionable sorority queen Elle Woods has it all, but she wants nothing more than to be Mrs. Warner Huntington III. When he dumps her, she gets into Harvard Law to win him back.', year: 2001, director: 'Robert Luketic', actors: 'Reese Witherspoon, Luke Wilson, Selma Blair, Matthew Davis', poster: '/images/romcomMovies/legally blonde.png', side: 'right', z: -11 },
  { id: 'romcom-set-it-up', title: 'Set It Up', slogan: 'Finding love takes some assistants.', description: 'Two overworked and underpaid assistants come up with a plan to get their bosses off their backs by setting them up with each other.', year: 2018, director: 'Claire Scanlon', actors: 'Glen Powell, Zoey Deutch, Taye Diggs, Lucy Liu', poster: '/images/romcomMovies/set it up.png', side: 'left', z: -18 },
  { id: 'romcom-the-holiday', title: 'The Holiday', slogan: 'It\'s Christmas Eve and we are going to go celebrate being young and being alive.', description: 'Two women, one American and one British, swap homes at Christmastime following bad breakups. Each woman finds romance with a local man.', year: 2006, director: 'Nancy Meyers', actors: 'Cameron Diaz, Kate Winslet, Jude Law, Jack Black', poster: '/images/romcomMovies/the holiday.png', side: 'right', z: -18 },
  { id: 'romcom-people-vacation', title: 'People We Meet on Vacation', slogan: 'On vacation, you\'re free to follow your heart.', description: 'Poppy\'s a free spirit. Alex loves a plan. After years of summer vacations, these polar-opposite pals wonder if they could be a perfect romantic match.', year: 2026, director: 'Brett Haley', actors: 'Emily Bader, Tom Blyth, Sarah Catherine Hook, Jameela Jamil', poster: '/images/romcomMovies/people we meet on vacation.png', side: 'left', z: -25 },
  { id: 'romcom-anyone-but-you', title: 'Anyone But You', slogan: 'They only look like the perfect couple.', description: 'After an amazing first date, Bea and Ben\'s fiery attraction turns ice cold — until they find themselves unexpectedly reunited at a destination wedding in Australia.', year: 2023, director: 'Will Gluck', actors: 'Sydney Sweeney, Glen Powell, Mia Artemis, Nat Buchanan', poster: '/images/romcomMovies/anyone but you.png', side: 'right', z: -25 },
  { id: 'romcom-the-proposal', title: 'The Proposal', slogan: 'Here comes the bride.', description: 'Faced with deportation to her native Canada, high-powered book editor Margaret Tate says she\'s engaged to marry Andrew Paxton, her hapless assistant. Andrew agrees to the charade, but imposes a few conditions of his own, including flying to Alaska to meet his eccentric family.', year: 2009, director: 'Anne Fletcher', actors: 'Sandra Bullock, Ryan Reynolds, Mary Steenburgen, Craig T. Nelson', poster: '/images/romcomMovies/the proposal.png', side: 'left', z: -32 }
];

const SCIFI_MOVIES = [
  { id: 'scifi-black-moon', title: 'Black Moon Rising', slogan: 'Meet Sam Quint… Stealing from him is the biggest mistake you can make.', description: 'An FBI free-lancer stashes a stolen Las Vegas-crime tape in a high-tech car stolen by someone else.', year: 1986, director: 'Harley Cokeliss', actors: 'Tommy Lee Jones, Linda Hamilton, Robert Vaughn, Richard Jaeckel', poster: '/images/scifiMovies/Black moon rising.png', side: 'left', z: 10 },
  { id: 'scifi-hail-mary', title: 'Project Hail Mary', slogan: 'Believe in the Hail Mary.', description: 'Science teacher Ryland Grace wakes up on a spaceship light years from home with no recollection of who he is. He must use his scientific knowledge to save Earth from extinction with the help of an unexpected friend.', year: 2026, director: 'Phil Lord, Christopher Miller', actors: 'Ryan Gosling, Sandra Hüller, James Ortiz, Lionel Boyce', poster: '/images/scifiMovies/Project hail mary.png', side: 'right', z: 10 },
  { id: 'scifi-avatar', title: 'Avatar', slogan: 'Enter the world of Pandora.', description: 'In the 22nd century, a paraplegic Marine is dispatched to the moon Pandora on a unique mission, but becomes torn between following orders and protecting an alien civilization.', year: 2009, director: 'James Cameron', actors: 'Sam Worthington, Zoe Saldaña, Sigourney Weaver, Stephen Lang', poster: '/images/scifiMovies/Avatar.png', side: 'left', z: 3 },
  { id: 'scifi-blade-runner', title: 'Blade Runner 2049', slogan: 'The key to the future is finally unearthed.', description: 'Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what’s left of society into chaos.', year: 2017, director: 'Denis Villeneuve', actors: 'Ryan Gosling, Harrison Ford, Ana de Armas, Dave Bautista', poster: '/images/scifiMovies/Blade runner 2049.png', side: 'right', z: 3 },
  { id: 'scifi-lucy', title: 'Lucy', slogan: 'The average person uses 10% of their brain capacity. Imagine what she could do with 100%.', description: 'A woman, accidentally caught in a dark deal, turns the tables on her captors and transforms into a merciless warrior evolved beyond human logic.', year: 2014, director: 'Luc Besson', actors: 'Scarlett Johansson, Morgan Freeman, Choi Min-sik, Amr Waked', poster: '/images/scifiMovies/Lucy.png', side: 'left', z: -4 },
  { id: 'scifi-28-days', title: '28 Days Later', slogan: 'The days are numbered.', description: 'Twenty-eight days after a killer virus is accidentally unleashed from a British research facility, a small group of London survivors are caught in a desperate struggle to protect themselves from the infected.', year: 2002, director: 'Danny Boyle', actors: 'Cillian Murphy, Naomie Harris, Brendan Gleeson, Megan Burns', poster: '/images/scifiMovies/28 days later.png', side: 'right', z: -4 },
  { id: 'scifi-dune', title: 'Dune', slogan: 'It begins.', description: 'Paul Atreides, a brilliant and gifted young man, must travel to the most dangerous planet in the universe to ensure the future of his family and his people as malevolent forces explode into conflict.', year: 2021, director: 'Denis Villeneuve', actors: 'Timothée Chalamet, Rebecca Ferguson, Oscar Isaac, Jason Momoa', poster: '/images/scifiMovies/Dune.png', side: 'left', z: -11 },
  { id: 'scifi-world-war-z', title: 'World War Z', slogan: 'There will come a day when the world we know will end.', description: 'Former UN investigator Gerry Lane must travel the world in a race against time to stop a pandemic that is toppling armies and governments and threatening to decimate humanity itself.', year: 2013, director: 'Marc Forster', actors: 'Brad Pitt, Mireille Enos, Daniella Kertesz, James Badge Dale', poster: '/images/scifiMovies/World war Z.png', side: 'right', z: -11 },
  { id: 'scifi-guardians', title: 'Guardians of the Galaxy', slogan: 'When things get bad, they’ll do their worst.', description: 'Light years from Earth, Peter Quill finds himself the prime target of a manhunt after discovering an orb wanted by Ronan the Accuser, leading him to form an alliance with a group of extraterrestrial misfits.', year: 2014, director: 'James Gunn', actors: 'Chris Pratt, Zoe Saldaña, Dave Bautista, Vin Diesel', poster: '/images/scifiMovies/Guardians of the galaxy.png', side: 'left', z: -18 },
  { id: 'scifi-inception', title: 'Inception', slogan: 'Your mind is the scene of the crime.', description: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious, is offered a chance to regain his old life by performing the "impossible" task of implantation.', year: 2010, director: 'Christopher Nolan', actors: 'Leonardo DiCaprio, Joseph Gordon-Levitt, Ken Watanabe, Tom Hardy', poster: '/images/scifiMovies/Inception.png', side: 'right', z: -18 },
  { id: 'scifi-matrix', title: 'The Matrix', slogan: 'Believe the unbelievable.', description: 'A computer hacker joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth and keep humanity trapped in a simulated reality.', year: 1999, director: 'Lana Wachowski, Lilly Wachowski', actors: 'Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss, Hugo Weaving', poster: '/images/scifiMovies/The matrix.png', side: 'left', z: -25 },
  { id: 'scifi-interstellar', title: 'Interstellar', slogan: 'Mankind was born on Earth. It was never meant to die here.', description: 'A group of explorers make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage to find a new home for humanity.', year: 2014, director: 'Christopher Nolan', actors: 'Matthew McConaughey, Anne Hathaway, Michael Caine, Jessica Chastain', poster: '/images/scifiMovies/Interstellar.png', side: 'right', z: -25 }
];

async function uploadAndSeed() {
    try {
        console.log("Initializing database schema from schema.sql...");
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const schemaPath = path.join(__dirname, "schema.sql");
        const schemaSql = fs.readFileSync(schemaPath, "utf8");
        await pool.query(schemaSql);
        console.log("Schema initialized successfully!");

        console.log("Adding missing columns 'side' and 'z' to movies table just in case...");
        await pool.query(`ALTER TABLE movies ADD COLUMN IF NOT EXISTS side VARCHAR(50)`);
        await pool.query(`ALTER TABLE movies ADD COLUMN IF NOT EXISTS z INT`);

        console.log("Clearing old movies from the database...");
        await pool.query("DELETE FROM movies");

        const processMovie = async (movie, genre) => {
            // grab the actual file path on your computer
            const localImagePath = path.join(frontendPublicPath, movie.poster);
            let cloudUrl = "";

            if (fs.existsSync(localImagePath)) {
                console.log(`Uploading ${movie.title} poster to Cloudinary...`);
                // blast it up to cloudinary
                const result = await cloudinary.uploader.upload(localImagePath, {
                    folder: `cineverse_posters/${genre}`
                });
                cloudUrl = result.secure_url;
                console.log(`Successfully uploaded: ${cloudUrl}`);
            } else {
                console.log(`Warning: Could not find image at ${localImagePath}. Using local path.`);
                cloudUrl = movie.poster;
            }

            // insert into the database with the new cloud URL
            const query = `
                INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre, side, z)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `;
            const values = [
                movie.id, movie.title, movie.slogan, movie.description, parseInt(movie.year),
                movie.director, movie.actors, cloudUrl, genre, movie.side, movie.z
            ];
            await pool.query(query, values);
        };

        console.log("Processing Horror Movies...");
        for (const movie of HORROR_MOVIES) { await processMovie(movie, 'horror'); }

        console.log("Processing RomCom Movies...");
        for (const movie of ROMCOM_MOVIES) { await processMovie(movie, 'romcom'); }

        console.log("Processing Sci-Fi Movies...");
        for (const movie of SCIFI_MOVIES) { await processMovie(movie, 'scifi'); }

        console.log("================================");
        console.log("Setting up ui_assets table for your extra images/videos...");
        await pool.query(`CREATE TABLE IF NOT EXISTS ui_assets (name VARCHAR(100) PRIMARY KEY, url TEXT)`);
        await pool.query(`DELETE FROM ui_assets`);

        const uploadAssetFolder = async (folderName, resourceType = "image") => {
            const dirPath = path.join(frontendPublicPath, folderName);
            if (fs.existsSync(dirPath)) {
                const files = fs.readdirSync(dirPath);
                for (const file of files) {
                    if (file === "desktop.ini") continue;
                    const localPath = path.join(dirPath, file);
                    if (fs.lstatSync(localPath).isFile()) {
                        console.log(`Uploading ${folderName}/${file}...`);
                        const result = await cloudinary.uploader.upload(localPath, {
                            folder: `cineverse_assets/${folderName}`,
                            resource_type: resourceType
                        });
                        const assetName = `${folderName}_${file}`;
                        await pool.query(`INSERT INTO ui_assets (name, url) VALUES ($1, $2)`, [assetName, result.secure_url]);
                        console.log(`Saved ${file} to database!`);
                    }
                }
            }
        };

        await uploadAssetFolder("images/avatarsPFP");
        await uploadAssetFolder("images/loadingBackgrounds");
        await uploadAssetFolder("videos", "video");

        // also grab the fav-icon just in case
        const favIconPath = path.join(frontendPublicPath, "images/fav-icon2.png");
        if (fs.existsSync(favIconPath)) {
            console.log("Uploading fav-icon2.png...");
            const res = await cloudinary.uploader.upload(favIconPath, { folder: "cineverse_assets" });
            await pool.query(`INSERT INTO ui_assets (name, url) VALUES ($1, $2)`, ["fav-icon2.png", res.secure_url]);
        }
        console.log("================================");

        console.log("Successfully uploaded all images/videos and seeded the database!");
        process.exit(0);
    } catch (error) {
        console.error("Error during upload and seed:", error);
        process.exit(1);
    }
}

uploadAndSeed();
