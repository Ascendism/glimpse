successfully downloaded text file (SHA: c47c130313241ac466b36b80d7807ed25122d17e)

'use strict';

const MOVIES = [
  [
    "terminator-2",
    "Terminator 2: Judgment Day",
    1991,
    "James Cameron",
    "lwSysg9o7wE",
    [
      "sci-fi",
      "action"
    ],
    [
      "T2",
      "Terminator 2"
    ],
    [
      "liquid metal guy",
      "t-1000"
    ],
    [
      "Arnold Schwarzenegger"
    ]
  ],
  [
    "predator",
    "Predator",
    1987,
    "John McTiernan",
    "X2hTY_LZy18",
    [
      "action",
      "sci-fi"
    ],
    [
      "The Predator"
    ],
    [
      "if it bleeds we can kill it"
    ],
    [
      "Arnold Schwarzenegger"
    ]
  ],
  [
    "total-recall",
    "Total Recall",
    1990,
    "Paul Verhoeven",
    "Mw1V8wxtnA0",
    [
      "sci-fi",
      "action"
    ],
    [],
    [
      "get your ass to mars"
    ],
    [
      "Arnold Schwarzenegger"
    ]
  ],
  [
    "true-lies",
    "True Lies",
    1994,
    "James Cameron",
    "e94VCq6rzyE",
    [
      "action",
      "comedy"
    ],
    [],
    [],
    [
      "Arnold Schwarzenegger"
    ]
  ],
  [
    "the-running-man",
    "The Running Man",
    1987,
    "Paul Michael Glaser",
    "g_QHzV3NVPk",
    [
      "sci-fi",
      "action"
    ],
    [],
    [],
    [
      "Arnold Schwarzenegger"
    ]
  ],
  [
    "commando",
    "Commando",
    1985,
    "Mark L. Lester",
    "pPhISgw3I2w",
    [
      "action"
    ],
    [],
    [],
    [
      "Arnold Schwarzenegger"
    ]
  ],
  [
    "alien",
    "Alien",
    1979,
    "Ridley Scott",
    "LjLamj-b0I8",
    [
      "sci-fi",
      "horror"
    ],
    [],
    [
      "in space no one can hear you scream"
    ],
    [
      "Sigourney Weaver"
    ]
  ],
  [
    "aliens",
    "Aliens",
    1986,
    "James Cameron",
    "oD9AVrd7NJw",
    [
      "sci-fi",
      "action"
    ],
    [],
    [
      "get away from her you bitch"
    ],
    [
      "Sigourney Weaver"
    ]
  ],
  [
    "the-thing",
    "The Thing",
    1982,
    "John Carpenter",
    "5ftmr17M-a4",
    [
      "horror",
      "sci-fi"
    ],
    [],
    [
      "blood test movie"
    ],
    [
      "Kurt Russell"
    ]
  ],
  [
    "heat",
    "Heat",
    1995,
    "Michael Mann",
    "PpAhjOvQVj0",
    [
      "crime",
      "action"
    ],
    [],
    [
      "pacino deniro diner"
    ],
    [
      "Al Pacino",
      "Robert De Niro"
    ]
  ],
  [
    "lotr-fellowship",
    "The Lord of the Rings: The Fellowship of the Ring",
    2001,
    "Peter Jackson",
    "V75dMMIW2B4",
    [
      "fantasy"
    ],
    [
      "Fellowship of the Ring",
      "LOTR 1"
    ],
    [],
    [
      "Elijah Wood"
    ]
  ],
  [
    "lotr-two-towers",
    "The Lord of the Rings: The Two Towers",
    2002,
    "Peter Jackson",
    "LbfMDwc4ezU",
    [
      "fantasy"
    ],
    [
      "Two Towers",
      "LOTR 2"
    ],
    [],
    [
      "Viggo Mortensen"
    ]
  ],
  [
    "lotr-return",
    "The Lord of the Rings: The Return of the King",
    2003,
    "Peter Jackson",
    "r5X-hFf6Hys",
    [
      "fantasy"
    ],
    [
      "Return of the King",
      "LOTR 3"
    ],
    [],
    [
      "Viggo Mortensen"
    ]
  ],
  [
    "matrix",
    "The Matrix",
    1999,
    "Lana Wachowski",
    "vKQi3bBA1y8",
    [
      "sci-fi",
      "action"
    ],
    [
      "The Matrix"
    ],
    [
      "red pill",
      "bullet time"
    ],
    [
      "Keanu Reeves"
    ]
  ],
  [
    "pulp-fiction",
    "Pulp Fiction",
    1994,
    "Quentin Tarantino",
    "s7EdQ4FqbhY",
    [
      "crime"
    ],
    [],
    [
      "royale with cheese"
    ],
    [
      "John Travolta",
      "Samuel L. Jackson"
    ]
  ],
  [
    "jaws",
    "Jaws",
    1975,
    "Steven Spielberg",
    "U1fu_sA7XhE",
    [
      "thriller"
    ],
    [],
    [
      "youre gonna need a bigger boat"
    ],
    [
      "Roy Scheider"
    ]
  ],
  [
    "inception",
    "Inception",
    2010,
    "Christopher Nolan",
    "YoHD-tdLUOA",
    [
      "sci-fi"
    ],
    [],
    [
      "dream within a dream"
    ],
    [
      "Leonardo DiCaprio"
    ]
  ],
  [
    "dark-knight",
    "The Dark Knight",
    2008,
    "Christopher Nolan",
    "EXeTwQWrcwY",
    [
      "action"
    ],
    [
      "Batman The Dark Knight"
    ],
    [
      "why so serious"
    ],
    [
      "Christian Bale",
      "Heath Ledger"
    ]
  ],
  [
    "dark-knight-rises",
    "The Dark Knight Rises",
    2012,
    "Christopher Nolan",
    "g8evyE9TuYk",
    [
      "action"
    ],
    [],
    [
      "the fire rises"
    ],
    [
      "Christian Bale"
    ]
  ],
  [
    "batman-begins",
    "Batman Begins",
    2005,
    "Christopher Nolan",
    "neY2xVmOfUM",
    [
      "action"
    ],
    [],
    [
      "why do we fall"
    ],
    [
      "Christian Bale"
    ]
  ],
  [
    "interstellar",
    "Interstellar",
    2014,
    "Christopher Nolan",
    "zSWdZVtXT7E",
    [
      "sci-fi"
    ],
    [],
    [
      "do not go gentle"
    ],
    [
      "Matthew McConaughey"
    ]
  ],
  [
    "oppenheimer",
    "Oppenheimer",
    2023,
    "Christopher Nolan",
    "uYPbbksJxIg",
    [
      "drama"
    ],
    [],
    [
      "i am become death"
    ],
    [
      "Cillian Murphy"
    ]
  ],
  [
    "prestige",
    "The Prestige",
    2006,
    "Christopher Nolan",
    "o4gHCmTQDVI",
    [
      "drama",
      "mystery"
    ],
    [],
    [
      "are you watching closely"
    ],
    [
      "Hugh Jackman",
      "Christian Bale"
    ]
  ],
  [
    "memento",
    "Memento",
    2000,
    "Christopher Nolan",
    "0vzyzKNsA5U",
    [
      "mystery"
    ],
    [],
    [
      "backwards movie"
    ],
    [
      "Guy Pearce"
    ]
  ],
  [
    "fight-club",
    "Fight Club",
    1999,
    "David Fincher",
    "SUXwaEJWr0U",
    [
      "drama"
    ],
    [],
    [
      "first rule of fight club"
    ],
    [
      "Brad Pitt",
      "Edward Norton"
    ]
  ],
  [
    "se7en",
    "Se7en",
    1995,
    "David Fincher",
    "znmZoVkCjpI",
    [
      "thriller"
    ],
    [
      "Seven"
    ],
    [
      "whats in the box"
    ],
    [
      "Brad Pitt",
      "Morgan Freeman"
    ]
  ],
  [
    "social-network",
    "The Social Network",
    2010,
    "David Fincher",
    "lB95KLmpLR4",
    [
      "drama"
    ],
    [],
    [
      "a million dollars isnt cool"
    ],
    [
      "Jesse Eisenberg"
    ]
  ],
  [
    "gone-girl",
    "Gone Girl",
    2014,
    "David Fincher",
    "2-_-1nAUY2A",
    [
      "thriller"
    ],
    [],
    [
      "amazing amy"
    ],
    [
      "Ben Affleck",
      "Rosamund Pike"
    ]
  ],
  [
    "zodiac",
    "Zodiac",
    2007,
    "David Fincher",
    "UNxsY6kHyAc",
    [
      "thriller"
    ],
    [],
    [
      "this is the zodiac speaking"
    ],
    [
      "Jake Gyllenhaal"
    ]
  ],
  [
    "godfather",
    "The Godfather",
    1972,
    "Francis Ford Coppola",
    "sY1YKhjqgw4",
    [
      "crime"
    ],
    [
      "Godfather 1"
    ],
    [
      "im gonna make him an offer"
    ],
    [
      "Marlon Brando",
      "Al Pacino"
    ]
  ],
  [
    "godfather-2",
    "The Godfather Part II",
    1974,
    "Francis Ford Coppola",
    "9O1IYDbuZbQ",
    [
      "crime"
    ],
    [
      "Godfather 2"
    ],
    [],
    [
      "Al Pacino"
    ]
  ],
  [
    "goodfellas",
    "Goodfellas",
    1990,
    "Martin Scorsese",
    "2ilzidi_J8Q",
    [
      "crime"
    ],
    [
      "Good Fellas"
    ],
    [
      "as far back as i can remember"
    ],
    [
      "Ray Liotta",
      "Robert De Niro"
    ]
  ],
  [
    "taxi-driver",
    "Taxi Driver",
    1976,
    "Martin Scorsese",
    "UUxD4-XISis",
    [
      "drama"
    ],
    [],
    [
      "you talkin to me"
    ],
    [
      "Robert De Niro"
    ]
  ],
  [
    "departed",
    "The Departed",
    2006,
    "Martin Scorsese",
    "iojhqm0JTW4",
    [
      "crime"
    ],
    [],
    [
      "cops and irish mob"
    ],
    [
      "Leonardo DiCaprio",
      "Matt Damon"
    ]
  ],
  [
    "wolf-wall-street",
    "The Wolf of Wall Street",
    2013,
    "Martin Scorsese",
    "iszwuX1AK6A",
    [
      "comedy",
      "crime"
    ],
    [],
    [
      "sell me this pen"
    ],
    [
      "Leonardo DiCaprio"
    ]
  ],
  [
    "shawshank",
    "The Shawshank Redemption",
    1994,
    "Frank Darabont",
    "6hB3S9bIaco",
    [
      "drama"
    ],
    [
      "Shawshank"
    ],
    [
      "get busy living"
    ],
    [
      "Tim Robbins",
      "Morgan Freeman"
    ]
  ],
  [
    "forrest-gump",
    "Forrest Gump",
    1994,
    "Robert Zemeckis",
    "bLvqoHBptjg",
    [
      "drama"
    ],
    [],
    [
      "life is like a box of chocolates"
    ],
    [
      "Tom Hanks"
    ]
  ],
  [
    "cast-away",
    "Cast Away",
    2000,
    "Robert Zemeckis",
    "qFqMy0dAnKg",
    [
      "drama"
    ],
    [
      "Castaway"
    ],
    [
      "wilson"
    ],
    [
      "Tom Hanks"
    ]
  ],
  [
    "saving-private-ryan",
    "Saving Private Ryan",
    1998,
    "Steven Spielberg",
    "9CiW_DgxCnQ",
    [
      "war"
    ],
    [],
    [
      "omaha beach"
    ],
    [
      "Tom Hanks"
    ]
  ],
  [
    "schindlers-list",
    "Schindler's List",
    1993,
    "Steven Spielberg",
    "gG22XNhtnoY",
    [
      "drama",
      "war"
    ],
    [
      "Schindlers List"
    ],
    [],
    [
      "Liam Neeson"
    ]
  ],
  [
    "jurassic-park",
    "Jurassic Park",
    1993,
    "Steven Spielberg",
    "QWBKEmWWL38",
    [
      "sci-fi",
      "adventure"
    ],
    [],
    [
      "life finds a way"
    ],
    [
      "Sam Neill"
    ]
  ],
  [
    "e-t",
    "E.T. the Extra-Terrestrial",
    1982,
    "Steven Spielberg",
    "qmcR88XKqI4",
    [
      "sci-fi"
    ],
    [
      "ET",
      "E.T."
    ],
    [
      "e.t. phone home"
    ],
    [
      "Henry Thomas"
    ]
  ],
  [
    "raiders",
    "Raiders of the Lost Ark",
    1981,
    "Steven Spielberg",
    "0xC-xkMqb8c",
    [
      "adventure"
    ],
    [
      "Indiana Jones Raiders"
    ],
    [
      "indiana jones"
    ],
    [
      "Harrison Ford"
    ]
  ],
  [
    "last-crusade",
    "Indiana Jones and the Last Crusade",
    1989,
    "Steven Spielberg",
    "a6JBIRH4CFQ",
    [
      "adventure"
    ],
    [
      "Last Crusade"
    ],
    [],
    [
      "Harrison Ford"
    ]
  ],
  [
    "back-to-the-future",
    "Back to the Future",
    1985,
    "Robert Zemeckis",
    "qvsgGtfP4Ts",
    [
      "sci-fi",
      "comedy"
    ],
    [
      "BTTF"
    ],
    [
      "great scott"
    ],
    [
      "Michael J. Fox"
    ]
  ],
  [
    "back-to-future-2",
    "Back to the Future Part II",
    1989,
    "Robert Zemeckis",
    "MdENmefJRpw",
    [
      "sci-fi"
    ],
    [
      "BTTF 2"
    ],
    [
      "hoverboard"
    ],
    [
      "Michael J. Fox"
    ]
  ],
  [
    "die-hard",
    "Die Hard",
    1988,
    "John McTiernan",
    "2Bm5Xg5Hp4E",
    [
      "action"
    ],
    [],
    [
      "yippee ki yay"
    ],
    [
      "Bruce Willis"
    ]
  ],
  [
    "die-hard-2",
    "Die Hard 2",
    1990,
    "Renny Harlin",
    "CvVBGKEmLjs",
    [
      "action"
    ],
    [
      "Die Harder"
    ],
    [],
    [
      "Bruce Willis"
    ]
  ],
  [
    "lethal-weapon",
    "Lethal Weapon",
    1987,
    "Richard Donner",
    "bTjHpRhLJUk",
    [
      "action"
    ],
    [],
    [],
    [
      "Mel Gibson",
      "Danny Glover"
    ]
  ],
  [
    "speed",
    "Speed",
    1994,
    "Jan de Bont",
    "FkHJb1ZMn5k",
    [
      "action"
    ],
    [],
    [
      "bus that cannot go under 50"
    ],
    [
      "Keanu Reeves"
    ]
  ],
  [
    "point-break",
    "Point Break",
    1991,
    "Kathryn Bigelow",
    "n1BhXqG-nL4",
    [
      "action"
    ],
    [],
    [
      "bank robbing surfers"
    ],
    [
      "Keanu Reeves",
      "Patrick Swayze"
    ]
  ],
  [
    "john-wick",
    "John Wick",
    2014,
    "Chad Stahelski",
    "2AUmvWm5ZDQ",
    [
      "action"
    ],
    [],
    [
      "they killed his dog"
    ],
    [
      "Keanu Reeves"
    ]
  ],
  [
    "john-wick-2",
    "John Wick: Chapter 2",
    2017,
    "Chad Stahelski",
    "XGk2EfbBcXg",
    [
      "action"
    ],
    [
      "John Wick 2"
    ],
    [],
    [
      "Keanu Reeves"
    ]
  ],
  [
    "mad-max-fury",
    "Mad Max: Fury Road",
    2015,
    "George Miller",
    "hEJnMQG9ev8",
    [
      "action"
    ],
    [
      "Fury Road"
    ],
    [
      "witness me"
    ],
    [
      "Tom Hardy",
      "Charlize Theron"
    ]
  ],
  [
    "gladiator",
    "Gladiator",
    2000,
    "Ridley Scott",
    "owK1qxDselE",
    [
      "action",
      "drama"
    ],
    [],
    [
      "are you not entertained"
    ],
    [
      "Russell Crowe"
    ]
  ],
  [
    "blade-runner",
    "Blade Runner",
    1982,
    "Ridley Scott",
    "eogpIG53Cis",
    [
      "sci-fi"
    ],
    [],
    [
      "tears in rain"
    ],
    [
      "Harrison Ford"
    ]
  ],
  [
    "blade-runner-2049",
    "Blade Runner 2049",
    2017,
    "Denis Villeneuve",
    "gCcx85zbxz4",
    [
      "sci-fi"
    ],
    [
      "2049"
    ],
    [],
    [
      "Ryan Gosling"
    ]
  ],
  [
    "dune",
    "Dune",
    2021,
    "Denis Villeneuve",
    "n9xhJrPXop4",
    [
      "sci-fi"
    ],
    [
      "Dune 2021"
    ],
    [
      "fear is the mind killer"
    ],
    [
      "Timothée Chalamet"
    ]
  ],
  [
    "dune-2",
    "Dune: Part Two",
    2024,
    "Denis Villeneuve",
    "Way9Dexny3w",
    [
      "sci-fi"
    ],
    [
      "Dune 2"
    ],
    [],
    [
      "Timothée Chalamet"
    ]
  ],
  [
    "arrival",
    "Arrival",
    2016,
    "Denis Villeneuve",
    "tFMo3UJ4B4g",
    [
      "sci-fi"
    ],
    [],
    [
      "heptapods"
    ],
    [
      "Amy Adams"
    ]
  ],
  [
    "sicario",
    "Sicario",
    2015,
    "Denis Villeneuve",
    "sIMChzE_m2w",
    [
      "thriller"
    ],
    [],
    [],
    [
      "Emily Blunt",
      "Benicio Del Toro"
    ]
  ],
  [
    "no-country",
    "No Country for Old Men",
    2007,
    "Joel Coen",
    "38A__WT3-o0",
    [
      "crime",
      "thriller"
    ],
    [],
    [
      "coin toss"
    ],
    [
      "Javier Bardem"
    ]
  ],
  [
    "big-lebowski",
    "The Big Lebowski",
    1998,
    "Joel Coen",
    "cd-go0oBF4Y",
    [
      "comedy"
    ],
    [
      "Lebowski"
    ],
    [
      "the dude abides"
    ],
    [
      "Jeff Bridges"
    ]
  ],
  [
    "fargo",
    "Fargo",
    1996,
    "Joel Coen",
    "h2tY82z3xXU",
    [
      "crime",
      "comedy"
    ],
    [],
    [
      "oh yah"
    ],
    [
      "Frances McDormand"
    ]
  ],
  [
    "there-will-be-blood",
    "There Will Be Blood",
    2007,
    "Paul Thomas Anderson",
    "FeSLCC7fl8s",
    [
      "drama"
    ],
    [],
    [
      "i drink your milkshake"
    ],
    [
      "Daniel Day-Lewis"
    ]
  ],
  [
    "boogie-nights",
    "Boogie Nights",
    1997,
    "Paul Thomas Anderson",
    "Z-Wy6yZNkG4",
    [
      "drama"
    ],
    [],
    [],
    [
      "Mark Wahlberg"
    ]
  ],
  [
    "magnolia",
    "Magnolia",
    1999,
    "Paul Thomas Anderson",
    "J9q8hrrOzQc",
    [
      "drama"
    ],
    [],
    [
      "frogs"
    ],
    [
      "Tom Cruise"
    ]
  ],
  [
    "phantom-thread",
    "Phantom Thread",
    2017,
    "Paul Thomas Anderson",
    "xN_YXjJTJsQ",
    [
      "drama"
    ],
    [],
    [],
    [
      "Daniel Day-Lewis"
    ]
  ],
  [
    "star-wars-4",
    "Star Wars: A New Hope",
    1977,
    "George Lucas",
    "vZ734NWnAHA",
    [
      "sci-fi"
    ],
    [
      "Star Wars",
      "A New Hope",
      "Episode IV"
    ],
    [
      "a long time ago"
    ],
    [
      "Mark Hamill",
      "Harrison Ford"
    ]
  ],
  [
    "star-wars-5",
    "Star Wars: The Empire Strikes Back",
    1980,
    "Irvin Kershner",
    "JNwNXF9Y6kY",
    [
      "sci-fi"
    ],
    [
      "Empire Strikes Back",
      "Episode V"
    ],
    [
      "i am your father"
    ],
    [
      "Mark Hamill"
    ]
  ],
  [
    "star-wars-6",
    "Star Wars: Return of the Jedi",
    1983,
    "Richard Marquand",
    "7LtaXMB92_I",
    [
      "sci-fi"
    ],
    [
      "Return of the Jedi",
      "Episode VI"
    ],
    [],
    [
      "Mark Hamill"
    ]
  ],
  [
    "star-wars-1",
    "Star Wars: The Phantom Menace",
    1999,
    "George Lucas",
    "bD7bpG-zDJQ",
    [
      "sci-fi"
    ],
    [
      "Phantom Menace",
      "Episode I"
    ],
    [
      "duel of the fates"
    ],
    [
      "Ewan McGregor"
    ]
  ],
  [
    "rogue-one",
    "Rogue One: A Star Wars Story",
    2016,
    "Gareth Edwards",
    "frdj1zb9sMY",
    [
      "sci-fi"
    ],
    [
      "Rogue One"
    ],
    [],
    [
      "Felicity Jones"
    ]
  ],
  [
    "avatar",
    "Avatar",
    2009,
    "James Cameron",
    "5PSNL1qE6VY",
    [
      "sci-fi"
    ],
    [],
    [
      "unobtainium"
    ],
    [
      "Sam Worthington"
    ]
  ],
  [
    "titanic",
    "Titanic",
    1997,
    "James Cameron",
    "kVrqfYjkTdQ",
    [
      "drama",
      "romance"
    ],
    [],
    [
      "im king of the world"
    ],
    [
      "Leonardo DiCaprio",
      "Kate Winslet"
    ]
  ],
  [
    "terminator",
    "The Terminator",
    1984,
    "James Cameron",
    "k64P4l2Wmeg",
    [
      "sci-fi",
      "action"
    ],
    [
      "Terminator 1"
    ],
    [
      "ill be back"
    ],
    [
      "Arnold Schwarzenegger"
    ]
  ],
  [
    "iron-man",
    "Iron Man",
    2008,
    "Jon Favreau",
    "8ugaeA-nMTc",
    [
      "action",
      "sci-fi"
    ],
    [],
    [
      "i am iron man"
    ],
    [
      "Robert Downey Jr."
    ]
  ],
  [
    "avengers",
    "The Avengers",
    2012,
    "Joss Whedon",
    "eOrNdBpGMv8",
    [
      "action"
    ],
    [
      "Avengers Assemble"
    ],
    [],
    [
      "Robert Downey Jr."
    ]
  ],
  [
    "infinity-war",
    "Avengers: Infinity War",
    2018,
    "Anthony Russo",
    "6ZfuNTqbHE8",
    [
      "action"
    ],
    [
      "Infinity War"
    ],
    [
      "perfectly balanced"
    ],
    [
      "Robert Downey Jr."
    ]
  ],
  [
    "endgame",
    "Avengers: Endgame",
    2019,
    "Anthony Russo",
    "TcMBFSGVi1c",
    [
      "action"
    ],
    [
      "Endgame"
    ],
    [
      "i am iron man snap"
    ],
    [
      "Robert Downey Jr."
    ]
  ],
  [
    "black-panther",
    "Black Panther",
    2018,
    "Ryan Coogler",
    "xjDjIWPwcPU",
    [
      "action"
    ],
    [],
    [
      "wakanda forever"
    ],
    [
      "Chadwick Boseman"
    ]
  ],
  [
    "spider-verse",
    "Spider-Man: Into the Spider-Verse",
    2018,
    "Bob Persichetti",
    "g4Hbz2jLxvQ",
    [
      "animation",
      "action"
    ],
    [
      "Into the Spider-Verse"
    ],
    [
      "leap of faith"
    ],
    [
      "Shameik Moore"
    ]
  ],
  [
    "no-way-home",
    "Spider-Man: No Way Home",
    2021,
    "Jon Watts",
    "JfVOs4VSpmA",
    [
      "action"
    ],
    [
      "No Way Home"
    ],
    [
      "multiverse spidermen"
    ],
    [
      "Tom Holland"
    ]
  ],
  [
    "guardians",
    "Guardians of the Galaxy",
    2014,
    "James Gunn",
    "d96cj8aNVFM",
    [
      "action",
      "comedy"
    ],
    [],
    [
      "awesome mix"
    ],
    [
      "Chris Pratt"
    ]
  ],
  [
    "thor-ragnarok",
    "Thor: Ragnarok",
    2017,
    "Taika Waititi",
    "ue80QwXMRHg",
    [
      "action",
      "comedy"
    ],
    [
      "Ragnarok"
    ],
    [],
    [
      "Chris Hemsworth"
    ]
  ],
  [
    "joker",
    "Joker",
    2019,
    "Todd Phillips",
    "zAGVQLHvwOY",
    [
      "drama"
    ],
    [],
    [
      "you get what you deserve"
    ],
    [
      "Joaquin Phoenix"
    ]
  ],
  [
    "barbie",
    "Barbie",
    2023,
    "Greta Gerwig",
    "pBk4NYhWNMM",
    [
      "comedy"
    ],
    [],
    [
      "this barbie"
    ],
    [
      "Margot Robbie"
    ]
  ],
  [
    "get-out",
    "Get Out",
    2017,
    "Jordan Peele",
    "sRfnevzM9kA",
    [
      "horror"
    ],
    [],
    [
      "the sunken place"
    ],
    [
      "Daniel Kaluuya"
    ]
  ],
  [
    "us",
    "Us",
    2019,
    "Jordan Peele",
    "1U2DNHu3q3s",
    [
      "horror"
    ],
    [],
    [
      "tethered"
    ],
    [
      "Lupita Nyong'o"
    ]
  ],
  [
    "nope",
    "Nope",
    2022,
    "Jordan Peele",
    "In8fuzj3gck",
    [
      "horror",
      "sci-fi"
    ],
    [],
    [],
    [
      "Daniel Kaluuya"
    ]
  ],
  [
    "parasite",
    "Parasite",
    2019,
    "Bong Joon-ho",
    "5xH0HfJHsaY",
    [
      "thriller",
      "drama"
    ],
    [],
    [
      "the basement"
    ],
    [
      "Song Kang-ho"
    ]
  ],
  [
    "whiplash",
    "Whiplash",
    2014,
    "Damien Chazelle",
    "7d_jQycdQGo",
    [
      "drama"
    ],
    [],
    [
      "not quite my tempo"
    ],
    [
      "Miles Teller",
      "J.K. Simmons"
    ]
  ],
  [
    "la-la-land",
    "La La Land",
    2016,
    "Damien Chazelle",
    "0pdqf4P9MB8",
    [
      "musical",
      "romance"
    ],
    [],
    [
      "city of stars"
    ],
    [
      "Ryan Gosling",
      "Emma Stone"
    ]
  ],
  [
    "everything-everywhere",
    "Everything Everywhere All at Once",
    2022,
    "Daniel Kwan",
    "wxN1T1uxQ2g",
    [
      "sci-fi",
      "comedy"
    ],
    [
      "EEAAO"
    ],
    [
      "googly eyes"
    ],
    [
      "Michelle Yeoh"
    ]
  ],
  [
    "knives-out",
    "Knives Out",
    2019,
    "Rian Johnson",
    "qGqiHJTsRkQ",
    [
      "mystery",
      "comedy"
    ],
    [],
    [],
    [
      "Daniel Craig"
    ]
  ],
  [
    "glass-onion",
    "Glass Onion",
    2022,
    "Rian Johnson",
    "gj5ibYSz8C0",
    [
      "mystery",
      "comedy"
    ],
    [
      "Knives Out 2"
    ],
    [],
    [
      "Daniel Craig"
    ]
  ],
  [
    "mad-max-2",
    "Mad Max 2: The Road Warrior",
    1981,
    "George Miller",
    "F2b-eY58s-c",
    [
      "action"
    ],
    [
      "The Road Warrior",
      "Mad Max 2"
    ],
    [],
    [
      "Mel Gibson"
    ]
  ],
  [
    "top-gun",
    "Top Gun",
    1986,
    "Tony Scott",
    "ArSM7z4xjJ4",
    [
      "action"
    ],
    [],
    [
      "talk to me goose"
    ],
    [
      "Tom Cruise"
    ]
  ],
  [
    "top-gun-maverick",
    "Top Gun: Maverick",
    2022,
    "Joseph Kosinski",
    "giXcoHAX3Lc",
    [
      "action"
    ],
    [
      "Maverick"
    ],
    [],
    [
      "Tom Cruise"
    ]
  ],
  [
    "mission-fallout",
    "Mission: Impossible - Fallout",
    2018,
    "Christopher McQuarrie",
    "wb49-oV0F8k",
    [
      "action"
    ],
    [
      "Fallout",
      "MI Fallout"
    ],
    [
      "helicopter chase"
    ],
    [
      "Tom Cruise"
    ]
  ],
  [
    "edge-of-tomorrow",
    "Edge of Tomorrow",
    2014,
    "Doug Liman",
    "vw61gLu2sdo",
    [
      "sci-fi",
      "action"
    ],
    [
      "Live Die Repeat"
    ],
    [
      "live die repeat"
    ],
    [
      "Tom Cruise"
    ]
  ],
  [
    "minority-report",
    "Minority Report",
    2002,
    "Steven Spielberg",
    "lwe2L5Hh3kE",
    [
      "sci-fi"
    ],
    [],
    [
      "precrime"
    ],
    [
      "Tom Cruise"
    ]
  ],
  [
    "war-of-worlds",
    "War of the Worlds",
    2005,
    "Steven Spielberg",
    "dVWFnWKqX_s",
    [
      "sci-fi"
    ],
    [],
    [],
    [
      "Tom Cruise"
    ]
  ],
  [
    "casino-royale",
    "Casino Royale",
    2006,
    "Martin Campbell",
    "36mnx8dBbGE",
    [
      "action"
    ],
    [],
    [
      "the name is bond"
    ],
    [
      "Daniel Craig"
    ]
  ],
  [
    "skyfall",
    "Skyfall",
    2012,
    "Sam Mendes",
    "6kw1UVovByw",
    [
      "action"
    ],
    [],
    [
      "skyfall"
    ],
    [
      "Daniel Craig"
    ]
  ],
  [
    "no-time-to-die",
    "No Time to Die",
    2021,
    "Cary Joji Fukunaga",
    "BIhNsAtFcJQ",
    [
      "action"
    ],
    [],
    [],
    [
      "Daniel Craig"
    ]
  ],
  [
    "goldfinger",
    "Goldfinger",
    1964,
    "Guy Hamilton",
    "LdD0g2K2q8M",
    [
      "action"
    ],
    [],
    [
      "no mr bond i expect you to die"
    ],
    [
      "Sean Connery"
    ]
  ],
  [
    "silence-lambs",
    "The Silence of the Lambs",
    1991,
    "Jonathan Demme",
    "W6Mm8MOymPY",
    [
      "thriller",
      "horror"
    ],
    [
      "Silence of the Lambs"
    ],
    [
      "hello clarice"
    ],
    [
      "Jodie Foster",
      "Anthony Hopkins"
    ]
  ],
  [
    "usual-suspects",
    "The Usual Suspects",
    1995,
    "Bryan Singer",
    "oiXVqocD7nk",
    [
      "crime",
      "mystery"
    ],
    [],
    [
      "keyser soze"
    ],
    [
      "Kevin Spacey"
    ]
  ],
  [
    "sixth-sense",
    "The Sixth Sense",
    1999,
    "M. Night Shyamalan",
    "3-ZP95SFIwY",
    [
      "thriller"
    ],
    [],
    [
      "i see dead people"
    ],
    [
      "Bruce Willis"
    ]
  ],
  [
    "unbreakable",
    "Unbreakable",
    2000,
    "M. Night Shyamalan",
    "R_f1uRx5cP8",
    [
      "thriller"
    ],
    [],
    [],
    [
      "Bruce Willis"
    ]
  ],
  [
    "signs",
    "Signs",
    2002,
    "M. Night Shyamalan",
    "F_UrDoGT-a8",
    [
      "sci-fi",
      "thriller"
    ],
    [],
    [
      "swing away"
    ],
    [
      "Mel Gibson"
    ]
  ],
  [
    "halloween",
    "Halloween",
    1978,
    "John Carpenter",
    "oHsXvq_EQDA",
    [
      "horror"
    ],
    [
      "Halloween 1978"
    ],
    [
      "the shape"
    ],
    [
      "Jamie Lee Curtis"
    ]
  ],
  [
    "nightmare-elm",
    "A Nightmare on Elm Street",
    1984,
    "Wes Craven",
    "dCVh4lBfW-c",
    [
      "horror"
    ],
    [
      "Nightmare on Elm Street"
    ],
    [
      "freddy krueger"
    ],
    [
      "Robert Englund"
    ]
  ],
  [
    "scream",
    "Scream",
    1996,
    "Wes Craven",
    "ByXajgHcVRE",
    [
      "horror"
    ],
    [],
    [
      "whats your favorite scary movie"
    ],
    [
      "Neve Campbell"
    ]
  ],
  [
    "exorcist",
    "The Exorcist",
    1973,
    "William Friedkin",
    "YDGw1MEbBKI",
    [
      "horror"
    ],
    [],
    [
      "the power of christ compels you"
    ],
    [
      "Linda Blair"
    ]
  ],
  [
    "shining",
    "The Shining",
    1980,
    "Stanley Kubrick",
    "SnvGCMzBkGg",
    [
      "horror"
    ],
    [],
    [
      "heres johnny"
    ],
    [
      "Jack Nicholson"
    ]
  ],
  [
    "2001",
    "2001: A Space Odyssey",
    1968,
    "Stanley Kubrick",
    "ZFsAiHZ5yAM",
    [
      "sci-fi"
    ],
    [
      "2001"
    ],
    [
      "hal 9000"
    ],
    [
      "Keir Dullea"
    ]
  ],
  [
    "clockwork-orange",
    "A Clockwork Orange",
    1971,
    "Stanley Kubrick",
    "SPRzm8ibDQ8",
    [
      "sci-fi",
      "crime"
    ],
    [],
    [
      "ultraviolence"
    ],
    [
      "Malcolm McDowell"
    ]
  ],
  [
    "full-metal-jacket",
    "Full Metal Jacket",
    1987,
    "Stanley Kubrick",
    "xamGGFKkjMU",
    [
      "war"
    ],
    [],
    [
      "how i learned to stop worrying"
    ],
    [
      "Matthew Modine"
    ]
  ],
  [
    "dr-strangelove",
    "Dr. Strangelove",
    1964,
    "Stanley Kubrick",
    "71I4z9KBfsA",
    [
      "comedy",
      "war"
    ],
    [
      "Dr Strangelove"
    ],
    [
      "precious bodily fluids"
    ],
    [
      "Peter Sellers"
    ]
  ],
  [
    "apocalypse-now",
    "Apocalypse Now",
    1979,
    "Francis Ford Coppola",
    "9l-M2xS1vt4",
    [
      "war"
    ],
    [],
    [
      "i love the smell of napalm"
    ],
    [
      "Martin Sheen",
      "Marlon Brando"
    ]
  ],
  [
    "platoon",
    "Platoon",
    1986,
    "Oliver Stone",
    "hGszkU3HWsA",
    [
      "war"
    ],
    [],
    [],
    [
      "Charlie Sheen"
    ]
  ],
  [
    "casablanca",
    "Casablanca",
    1942,
    "Michael Curtiz",
    "Bkye0oKSleI",
    [
      "romance",
      "drama"
    ],
    [],
    [
      "heres looking at you kid"
    ],
    [
      "Humphrey Bogart"
    ]
  ],
  [
    "psycho",
    "Psycho",
    1960,
    "Alfred Hitchcock",
    "DTNo_h1Q0js",
    [
      "horror",
      "thriller"
    ],
    [],
    [
      "shower scene"
    ],
    [
      "Anthony Perkins",
      "Janet Leigh"
    ]
  ],
  [
    "vertigo",
    "Vertigo",
    1958,
    "Alfred Hitchcock",
    "Z5jvQsvTGHk",
    [
      "thriller"
    ],
    [],
    [],
    [
      "James Stewart"
    ]
  ],
  [
    "rear-window",
    "Rear Window",
    1954,
    "Alfred Hitchcock",
    "m4T-CyTsIBI",
    [
      "thriller"
    ],
    [],
    [],
    [
      "James Stewart"
    ]
  ],
  [
    "north-by-northwest",
    "North by Northwest",
    1959,
    "Alfred Hitchcock",
    "9NnnxVfrzLU",
    [
      "thriller"
    ],
    [],
    [
      "crop duster"
    ],
    [
      "Cary Grant"
    ]
  ],
  [
    "wizard-of-oz",
    "The Wizard of Oz",
    1939,
    "Victor Fleming",
    "H_3T4DGw10U",
    [
      "fantasy",
      "musical"
    ],
    [
      "Wizard of Oz"
    ],
    [
      "were not in kansas"
    ],
    [
      "Judy Garland"
    ]
  ],
  [
    "gone-with-wind",
    "Gone with the Wind",
    1939,
    "Victor Fleming",
    "0X94oZgJis4",
    [
      "drama",
      "romance"
    ],
    [
      "Gone With the Wind"
    ],
    [
      "frankly my dear"
    ],
    [
      "Clark Gable"
    ]
  ],
  [
    "citizen-kane",
    "Citizen Kane",
    1941,
    "Orson Welles",
    "8dxeqp0fMq8",
    [
      "drama"
    ],
    [],
    [
      "rosebud"
    ],
    [
      "Orson Welles"
    ]
  ],
  [
    "rocky",
    "Rocky",
    1976,
    "John G. Avildsen",
    "3VfKKcsy8Vw",
    [
      "drama",
      "sport"
    ],
    [],
    [
      "gonna fly now"
    ],
    [
      "Sylvester Stallone"
    ]
  ],
  [
    "raging-bull",
    "Raging Bull",
    1980,
    "Martin Scorsese",
    "wh70WQ1J4vg",
    [
      "drama",
      "sport"
    ],
    [],
    [],
    [
      "Robert De Niro"
    ]
  ],
  [
    "scarface",
    "Scarface",
    1983,
    "Brian De Palma",
    "7pQQHnqKoVs",
    [
      "crime"
    ],
    [],
    [
      "say hello to my little friend"
    ],
    [
      "Al Pacino"
    ]
  ],
  [
    "casino",
    "Casino",
    1995,
    "Martin Scorsese",
    "EJWD5N8R5qE",
    [
      "crime"
    ],
    [],
    [],
    [
      "Robert De Niro",
      "Joe Pesci"
    ]
  ],
  [
    "donnie-darko",
    "Donnie Darko",
    2001,
    "Richard Kelly",
    "ZZyBaFYEMvs",
    [
      "sci-fi"
    ],
    [],
    [
      "frank the rabbit"
    ],
    [
      "Jake Gyllenhaal"
    ]
  ],
  [
    "eternal-sunshine",
    "Eternal Sunshine of the Spotless Mind",
    2004,
    "Michel Gondry",
    "rb9a00bExY4",
    [
      "romance",
      "sci-fi"
    ],
    [
      "Eternal Sunshine"
    ],
    [
      "memory erase"
    ],
    [
      "Jim Carrey",
      "Kate Winslet"
    ]
  ],
  [
    "amelie",
    "Amélie",
    2001,
    "Jean-Pierre Jeunet",
    "HGIU4Jn2jG4",
    [
      "romance",
      "comedy"
    ],
    [
      "Amelie"
    ],
    [],
    [
      "Audrey Tautou"
    ]
  ],
  [
    "oldboy",
    "Oldboy",
    2003,
    "Park Chan-wook",
    "2HkjrJ6IK5E",
    [
      "thriller"
    ],
    [],
    [
      "hallway hammer"
    ],
    [
      "Choi Min-sik"
    ]
  ],
  [
    "spirited-away",
    "Spirited Away",
    2001,
    "Hayao Miyazaki",
    "ByXai6oFvLw",
    [
      "animation",
      "fantasy"
    ],
    [],
    [
      "no face"
    ],
    []
  ],
  [
    "princess-mononoke",
    "Princess Mononoke",
    1997,
    "Hayao Miyazaki",
    "4OiMOHRDs14",
    [
      "animation",
      "fantasy"
    ],
    [],
    [],
    []
  ],
  [
    "my-neighbor-totoro",
    "My Neighbor Totoro",
    1988,
    "Hayao Miyazaki",
    "92a7Hj0ijLs",
    [
      "animation"
    ],
    [
      "Totoro"
    ],
    [],
    []
  ],
  [
    "akira",
    "Akira",
    1988,
    "Katsuhiro Otomo",
    "nA3YjLEeb3E",
    [
      "animation",
      "sci-fi"
    ],
    [],
    [],
    []
  ],
  [
    "ghost-in-shell",
    "Ghost in the Shell",
    1995,
    "Mamoru Oshii",
    "jH1RpwZ9Tc0",
    [
      "animation",
      "sci-fi"
    ],
    [],
    [],
    []
  ],
  [
    "toy-story",
    "Toy Story",
    1995,
    "John Lasseter",
    "v-PjgYArj9g",
    [
      "animation"
    ],
    [],
    [
      "to infinity and beyond"
    ],
    [
      "Tom Hanks",
      "Tim Allen"
    ]
  ],
  [
    "toy-story-2",
    "Toy Story 2",
    1999,
    "John Lasseter",
    "Lu0sotENK-U",
    [
      "animation"
    ],
    [],
    [],
    [
      "Tom Hanks"
    ]
  ],
  [
    "finding-nemo",
    "Finding Nemo",
    2003,
    "Andrew Stanton",
    "SPHfeNgogVs",
    [
      "animation"
    ],
    [],
    [
      "just keep swimming"
    ],
    [
      "Albert Brooks"
    ]
  ],
  [
    "up",
    "Up",
    2009,
    "Pete Docter",
    "ORFWdXl5gEc",
    [
      "animation"
    ],
    [],
    [
      "adventure is out there"
    ],
    [
      "Ed Asner"
    ]
  ],
  [
    "inside-out",
    "Inside Out",
    2015,
    "Pete Docter",
    "seMwpP0yeu4",
    [
      "animation"
    ],
    [],
    [
      "sadness and joy"
    ],
    [
      "Amy Poehler"
    ]
  ],
  [
    "coco",
    "Coco",
    2017,
    "Lee Unkrich",
    "Rvr68u6k5sI",
    [
      "animation"
    ],
    [],
    [
      "remember me"
    ],
    []
  ],
  [
    "wall-e",
    "WALL-E",
    2008,
    "Andrew Stanton",
    "CZ1P1U3HFnQ",
    [
      "animation",
      "sci-fi"
    ],
    [
      "WALL E",
      "Walle"
    ],
    [],
    []
  ],
  [
    "incredibles",
    "The Incredibles",
    2004,
    "Brad Bird",
    "eZbzbC92zTU",
    [
      "animation",
      "action"
    ],
    [],
    [],
    [
      "Craig T. Nelson"
    ]
  ],
  [
    "ratatouille",
    "Ratatouille",
    2007,
    "Brad Bird",
    "NgsQ8mVkN8w",
    [
      "animation"
    ],
    [],
    [
      "anyone can cook"
    ],
    []
  ],
  [
    "shrek",
    "Shrek",
    2001,
    "Andrew Adamson",
    "CwXOrWvPBPk",
    [
      "animation",
      "comedy"
    ],
    [],
    [
      "ogres are like onions"
    ],
    [
      "Mike Myers"
    ]
  ],
  [
    "lion-king",
    "The Lion King",
    1994,
    "Roger Allers",
    "4sj1MT05lAA",
    [
      "animation"
    ],
    [],
    [
      "hakuna matata"
    ],
    []
  ],
  [
    "aladdin",
    "Aladdin",
    1992,
    "Ron Clements",
    "QapaqcDucww",
    [
      "animation",
      "musical"
    ],
    [],
    [
      "a whole new world"
    ],
    [
      "Robin Williams"
    ]
  ],
  [
    "frozen",
    "Frozen",
    2013,
    "Chris Buck",
    "TbQm5doF_Uc",
    [
      "animation",
      "musical"
    ],
    [],
    [
      "let it go"
    ],
    [
      "Idina Menzel"
    ]
  ],
  [
    "moana",
    "Moana",
    2016,
    "Ron Clements",
    "LKFuXETZUsI",
    [
      "animation",
      "musical"
    ],
    [],
    [
      "youre welcome"
    ],
    [
      "Dwayne Johnson"
    ]
  ],
  [
    "encanto",
    "Encanto",
    2021,
    "Jared Bush",
    "CaimxJE_Y9U",
    [
      "animation",
      "musical"
    ],
    [],
    [
      "we dont talk about bruno"
    ],
    []
  ],
  [
    "super-mario-bros",
    "The Super Mario Bros. Movie",
    2023,
    "Aaron Horvath",
    "TnGl02RsEPH",
    [
      "animation"
    ],
    [
      "Mario Movie"
    ],
    [],
    [
      "Chris Pratt"
    ]
  ],
  [
    "hereditary",
    "Hereditary",
    2018,
    "Ari Aster",
    "V6wWKNij_1M",
    [
      "horror"
    ],
    [],
    [
      "click click"
    ],
    [
      "Toni Collette"
    ]
  ],
  [
    "midsommar",
    "Midsommar",
    2019,
    "Ari Aster",
    "1Vnghdsjmd0",
    [
      "horror"
    ],
    [],
    [
      "maypole"
    ],
    [
      "Florence Pugh"
    ]
  ],
  [
    "the-witch",
    "The Witch",
    2015,
    "Robert Eggers",
    "iQXmlf3Sefg",
    [
      "horror"
    ],
    [
      "The VVitch"
    ],
    [
      "black philip"
    ],
    [
      "Anya Taylor-Joy"
    ]
  ],
  [
    "a-quiet-place",
    "A Quiet Place",
    2018,
    "John Krasinski",
    "WRSeT2A04Ks",
    [
      "horror"
    ],
    [
      "Quiet Place"
    ],
    [
      "if they hear you"
    ],
    [
      "Emily Blunt"
    ]
  ],
  [
    "it",
    "It",
    2017,
    "Andy Muschietti",
    "FnCdOQsX5eI",
    [
      "horror"
    ],
    [
      "IT Pennywise"
    ],
    [
      "youll float too"
    ],
    [
      "Bill Skarsgård"
    ]
  ],
  [
    "conjuring",
    "The Conjuring",
    2013,
    "James Wan",
    "k10ETZ41q5o",
    [
      "horror"
    ],
    [],
    [
      "warren investigators"
    ],
    [
      "Patrick Wilson",
      "Vera Farmiga"
    ]
  ],
  [
    "saw",
    "Saw",
    2004,
    "James Wan",
    "S-1QgOMQ-ok",
    [
      "horror"
    ],
    [],
    [
      "want to play a game"
    ],
    [
      "Tobin Bell"
    ]
  ],
  [
    "ex-machina",
    "Ex Machina",
    2014,
    "Alex Garland",
    "XYGzRB4Pnq8",
    [
      "sci-fi"
    ],
    [],
    [
      "turing test"
    ],
    [
      "Alicia Vikander",
      "Oscar Isaac"
    ]
  ],
  [
    "her",
    "Her",
    2013,
    "Spike Jonze",
    "dJTU48_o4Lk",
    [
      "romance",
      "sci-fi"
    ],
    [],
    [
      "os1 samantha"
    ],
    [
      "Joaquin Phoenix"
    ]
  ],
  [
    "moonlight",
    "Moonlight",
    2016,
    "Barry Jenkins",
    "9NNjwWCsT-c",
    [
      "drama"
    ],
    [],
    [],
    [
      "Mahershala Ali"
    ]
  ],
  [
    "12-years-slave",
    "12 Years a Slave",
    2013,
    "Steve McQueen",
    "z02Ie8wKKRg",
    [
      "drama"
    ],
    [
      "Twelve Years a Slave"
    ],
    [],
    [
      "Chiwetel Ejiofor"
    ]
  ],
  [
    "slumdog",
    "Slumdog Millionaire",
    2008,
    "Danny Boyle",
    "AIzby2Uaz_g",
    [
      "drama"
    ],
    [],
    [],
    [
      "Dev Patel"
    ]
  ],
  [
    "trainspotting",
    "Trainspotting",
    1996,
    "Danny Boyle",
    "8LtAJ39Lqls",
    [
      "drama"
    ],
    [],
    [
      "choose life"
    ],
    [
      "Ewan McGregor"
    ]
  ],
  [
    "28-days-later",
    "28 Days Later",
    2002,
    "Danny Boyle",
    "cHyzL1Vw0hc",
    [
      "horror"
    ],
    [],
    [
      "rage virus"
    ],
    [
      "Cillian Murphy"
    ]
  ],
  [
    "snatch",
    "Snatch",
    2000,
    "Guy Ritchie",
    "9uarP8dC0s8",
    [
      "crime",
      "comedy"
    ],
    [],
    [
      "pikey"
    ],
    [
      "Brad Pitt"
    ]
  ],
  [
    "lock-stock",
    "Lock, Stock and Two Smoking Barrels",
    1998,
    "Guy Ritchie",
    "h6hZlweVUKw",
    [
      "crime",
      "comedy"
    ],
    [
      "Lock Stock"
    ],
    [],
    [
      "Jason Statham"
    ]
  ],
  [
    "anchorman",
    "Anchorman: The Legend of Ron Burgundy",
    2004,
    "Adam McKay",
    "NJQ4qEWm9lU",
    [
      "comedy"
    ],
    [
      "Anchorman"
    ],
    [
      "stay classy san diego"
    ],
    [
      "Will Ferrell"
    ]
  ],
  [
    "step-brothers",
    "Step Brothers",
    2008,
    "Adam McKay",
    "Cewybw4RflU",
    [
      "comedy"
    ],
    [
      "Stepbrothers"
    ],
    [
      "did we just become best friends"
    ],
    [
      "Will Ferrell",
      "John C. Reilly"
    ]
  ],
  [
    "superbad",
    "Superbad",
    2007,
    "Greg Mottola",
    "MNpoTxeydiE",
    [
      "comedy"
    ],
    [],
    [
      "mcLovin"
    ],
    [
      "Jonah Hill",
      "Michael Cera"
    ]
  ],
  [
    "mean-girls",
    "Mean Girls",
    2004,
    "Mark Waters",
    "KAOdjqyG37A",
    [
      "comedy"
    ],
    [],
    [
      "on wednesdays we wear pink"
    ],
    [
      "Lindsay Lohan"
    ]
  ],
  [
    "bridesmaids",
    "Bridesmaids",
    2011,
    "Paul Feig",
    "FNppLrmdyug",
    [
      "comedy"
    ],
    [],
    [],
    [
      "Kristen Wiig"
    ]
  ],
  [
    "groundhog-day",
    "Groundhog Day",
    1993,
    "Harold Ramis",
    "GncQtURdcE4",
    [
      "comedy"
    ],
    [],
    [
      "same day loop"
    ],
    [
      "Bill Murray"
    ]
  ],
  [
    "ghostbusters",
    "Ghostbusters",
    1984,
    "Ivan Reitman",
    "w3ugHP-yZXw",
    [
      "comedy",
      "sci-fi"
    ],
    [],
    [
      "who you gonna call"
    ],
    [
      "Bill Murray"
    ]
  ],
  [
    "caddyshack",
    "Caddyshack",
    1980,
    "Harold Ramis",
    "x9NlBklS4Uo",
    [
      "comedy"
    ],
    [],
    [
      "its in the hole"
    ],
    [
      "Bill Murray"
    ]
  ],
  [
    "office-space",
    "Office Space",
    1999,
    "Mike Judge",
    "dMIpiP-WzCw",
    [
      "comedy"
    ],
    [],
    [
      "pc load letter"
    ],
    [
      "Ron Livingston"
    ]
  ],
  [
    "idiocracy",
    "Idiocracy",
    2006,
    "Mike Judge",
    "BBu_jU3_3EM",
    [
      "comedy",
      "sci-fi"
    ],
    [],
    [
      "brawndo"
    ],
    [
      "Luke Wilson"
    ]
  ],
  [
    "dumb-and-dumber",
    "Dumb and Dumber",
    1994,
    "Peter Farrelly",
    "l13yPhimE3o",
    [
      "comedy"
    ],
    [
      "Dumb And Dumber"
    ],
    [
      "so youre telling me theres a chance"
    ],
    [
      "Jim Carrey",
      "Jeff Daniels"
    ]
  ],
  [
    "mask",
    "The Mask",
    1994,
    "Chuck Russell",
    "LZl69yk5lN4",
    [
      "comedy"
    ],
    [],
    [
      "sssssmokin"
    ],
    [
      "Jim Carrey"
    ]
  ],
  [
    "ace-ventura",
    "Ace Ventura: Pet Detective",
    1994,
    "Tom Shadyac",
    "cXc8PD2Kz7I",
    [
      "comedy"
    ],
    [
      "Ace Ventura"
    ],
    [
      "alrighty then"
    ],
    [
      "Jim Carrey"
    ]
  ],
  [
    "truman-show",
    "The Truman Show",
    1998,
    "Peter Weir",
    "dlnmWmtUG4I",
    [
      "drama",
      "comedy"
    ],
    [],
    [
      "good morning and in case i dont see ya"
    ],
    [
      "Jim Carrey"
    ]
  ],
  [
    "catch-me",
    "Catch Me If You Can",
    2002,
    "Steven Spielberg",
    "s-7pyIxz8Qg",
    [
      "drama",
      "crime"
    ],
    [],
    [],
    [
      "Leonardo DiCaprio",
      "Tom Hanks"
    ]
  ],
  [
    "grand-budapest",
    "The Grand Budapest Hotel",
    2014,
    "Wes Anderson",
    "1Fg5iWmQjwk",
    [
      "comedy"
    ],
    [
      "Grand Budapest"
    ],
    [],
    [
      "Ralph Fiennes"
    ]
  ],
  [
    "green-mile",
    "The Green Mile",
    1999,
    "Frank Darabont",
    "Ki4ha8ggTzQ",
    [
      "drama",
      "fantasy"
    ],
    [],
    [
      "mouse mr jingles"
    ],
    [
      "Tom Hanks"
    ]
  ],
  [
    "american-beauty",
    "American Beauty",
    1999,
    "Sam Mendes",
    "3ycmmJYXR3k",
    [
      "drama"
    ],
    [],
    [
      "plastic bag"
    ],
    [
      "Kevin Spacey"
    ]
  ],
  [
    "american-history-x",
    "American History X",
    1998,
    "Tony Kaye",
    "XfQYHqsiN5g",
    [
      "drama"
    ],
    [],
    [],
    [
      "Edward Norton"
    ]
  ],
  [
    "requiem-for-a-dream",
    "Requiem for a Dream",
    2000,
    "Darren Aronofsky",
    "0nU7dC9bI4o",
    [
      "drama"
    ],
    [],
    [],
    [
      "Ellen Burstyn",
      "Jared Leto"
    ]
  ],
  [
    "black-swan",
    "Black Swan",
    2010,
    "Darren Aronofsky",
    "5ja2-kb5Xz0",
    [
      "drama",
      "thriller"
    ],
    [],
    [],
    [
      "Natalie Portman"
    ]
  ],
  [
    "the-wrestler",
    "The Wrestler",
    2008,
    "Darren Aronofsky",
    "61-GFxjTyV0",
    [
      "drama"
    ],
    [],
    [],
    [
      "Mickey Rourke"
    ]
  ],
  [
    "pi",
    "Pi",
    1998,
    "Darren Aronofsky",
    "oQ1sW0YbgrY",
    [
      "thriller"
    ],
    [
      "π"
    ],
    [],
    []
  ],
  [
    "mother",
    "mother!",
    2017,
    "Darren Aronofsky",
    "XpIDzWlb3_Q",
    [
      "horror",
      "drama"
    ],
    [
      "Mother"
    ],
    [],
    [
      "Jennifer Lawrence"
    ]
  ],
  [
    "the-fountain",
    "The Fountain",
    2006,
    "Darren Aronofsky",
    "lJ87yD_8m3I",
    [
      "sci-fi",
      "romance"
    ],
    [],
    [],
    [
      "Hugh Jackman"
    ]
  ],
  [
    "drive",
    "Drive",
    2011,
    "Nicolas Winding Refn",
    "KBiOF3y1W0Y",
    [
      "action",
      "crime"
    ],
    [],
    [
      "a real hero"
    ],
    [
      "Ryan Gosling"
    ]
  ],
  [
    "only-god-forgives",
    "Only God Forgives",
    2013,
    "Nicolas Winding Refn",
    "M0vDV1oRLjA",
    [
      "crime",
      "thriller"
    ],
    [],
    [],
    [
      "Ryan Gosling"
    ]
  ],
  [
    "neon-demon",
    "The Neon Demon",
    2016,
    "Nicolas Winding Refn",
    "cipW8nUN1Ny",
    [
      "horror"
    ],
    [],
    [],
    [
      "Elle Fanning"
    ]
  ],
  [
    "nightcrawler",
    "Nightcrawler",
    2014,
    "Dan Gilroy",
    "X8G23wSRphk",
    [
      "thriller",
      "crime"
    ],
    [],
    [
      "if it bleeds it leads"
    ],
    [
      "Jake Gyllenhaal"
    ]
  ],
  [
    "prisoners",
    "Prisoners",
    2013,
    "Denis Villeneuve",
    "bpXfcTF73XU",
    [
      "thriller"
    ],
    [],
    [],
    [
      "Hugh Jackman",
      "Jake Gyllenhaal"
    ]
  ],
  [
    "enemy",
    "Enemy",
    2013,
    "Denis Villeneuve",
    "FJbj1lAe0kI",
    [
      "thriller"
    ],
    [],
    [
      "spiders"
    ],
    [
      "Jake Gyllenhaal"
    ]
  ],
  [
    "incendies",
    "Incendies",
    2010,
    "Denis Villeneuve",
    "0nycksytL1A",
    [
      "drama"
    ],
    [],
    [],
    []
  ],
  [
    "sicario-2",
    "Sicario: Day of the Soldado",
    2018,
    "Stefano Sollima",
    "sIMChzE_m2w",
    [
      "action",
      "thriller"
    ],
    [
      "Soldado"
    ],
    [],
    [
      "Benicio Del Toro"
    ]
  ],
  [
    "wind-river",
    "Wind River",
    2017,
    "Taylor Sheridan",
    "s7EbYndQl8g",
    [
      "thriller",
      "crime"
    ],
    [],
    [],
    [
      "Jeremy Renner"
    ]
  ],
  [
    "hell-or-high-water",
    "Hell or High Water",
    2016,
    "David Mackenzie",
    "JQoqsK0hSc4",
    [
      "crime",
      "western"
    ],
    [],
    [],
    [
      "Chris Pine",
      "Ben Foster"
    ]
  ],
  [
    "logan",
    "Logan",
    2017,
    "James Mangold",
    "Div0tPv9oRE",
    [
      "action",
      "drama"
    ],
    [
      "Wolverine 3"
    ],
    [],
    [
      "Hugh Jackman"
    ]
  ],
  [
    "deadpool",
    "Deadpool",
    2016,
    "Tim Miller",
    "Xithigfg7dA",
    [
      "action",
      "comedy"
    ],
    [],
    [],
    [
      "Ryan Reynolds"
    ]
  ],
  [
    "deadpool-2",
    "Deadpool 2",
    2018,
    "David Leitch",
    "D86RtevtfrA",
    [
      "action",
      "comedy"
    ],
    [
      "Deadpool 2"
    ],
    [],
    [
      "Ryan Reynolds"
    ]
  ],
  [
    "wolverine",
    "The Wolverine",
    2013,
    "James Mangold",
    "Nt9L1jCKGnE",
    [
      "action"
    ],
    [],
    [],
    [
      "Hugh Jackman"
    ]
  ],
  [
    "xmen",
    "X-Men",
    2000,
    "Bryan Singer",
    "lyu7v7nWzfo",
    [
      "action",
      "sci-fi"
    ],
    [
      "X-Men"
    ],
    [],
    [
      "Hugh Jackman"
    ]
  ],
  [
    "x2",
    "X2: X-Men United",
    2003,
    "Bryan Singer",
    "oVA8UzwCqXw",
    [
      "action",
      "sci-fi"
    ],
    [
      "X2"
    ],
    [],
    [
      "Hugh Jackman"
    ]
  ],
  [
    "xmen-first-class",
    "X-Men: First Class",
    2011,
    "Matthew Vaughn",
    "kyQqi8Byde0",
    [
      "action",
      "sci-fi"
    ],
    [
      "First Class"
    ],
    [],
    [
      "James McAvoy",
      "Michael Fassbender"
    ]
  ],
  [
    "days-of-future",
    "X-Men: Days of Future Past",
    2014,
    "Bryan Singer",
    "pK2zYHWDZKo",
    [
      "action",
      "sci-fi"
    ],
    [
      "Days of Future Past"
    ],
    [],
    [
      "Hugh Jackman"
    ]
  ],
  [
    "the-martian",
    "The Martian",
    2015,
    "Ridley Scott",
    "ej3ioOneTyE",
    [
      "sci-fi"
    ],
    [],
    [
      "science the shit out of this"
    ],
    [
      "Matt Damon"
    ]
  ],
  [
    "gravity",
    "Gravity",
    2013,
    "Alfonso Cuarón",
    "OiTiK0sc7dg",
    [
      "sci-fi"
    ],
    [],
    [],
    [
      "Sandra Bullock",
      "George Clooney"
    ]
  ],
  [
    "children-of-men",
    "Children of Men",
    2006,
    "Alfonso Cuarón",
    "2VT2eTqQYR0",
    [
      "sci-fi"
    ],
    [],
    [],
    [
      "Clive Owen"
    ]
  ],
  [
    "roma",
    "Roma",
    2018,
    "Alfonso Cuarón",
    "6FZ4G1aQx-k",
    [
      "drama"
    ],
    [],
    [],
    [
      "Yalitza Aparicio"
    ]
  ],
  [
    "y-tu-mama",
    "Y tu mamá también",
    2001,
    "Alfonso Cuarón",
    "8C6ZnIIroY4",
    [
      "drama"
    ],
    [
      "Y Tu Mama Tambien"
    ],
    [],
    []
  ],
  [
    "birdman",
    "Birdman",
    2014,
    "Alejandro G. Iñárritu",
    "uJfLoEVfFzE",
    [
      "comedy",
      "drama"
    ],
    [],
    [],
    [
      "Michael Keaton"
    ]
  ],
  [
    "revenant",
    "The Revenant",
    2015,
    "Alejandro G. Iñárritu",
    "LoebZZ8K5N0",
    [
      "adventure",
      "drama"
    ],
    [],
    [
      "bear attack"
    ],
    [
      "Leonardo DiCaprio"
    ]
  ],
  [
    "babel",
    "Babel",
    2006,
    "Alejandro G. Iñárritu",
    "yH1l0pS3XK0",
    [
      "drama"
    ],
    [],
    [],
    [
      "Brad Pitt"
    ]
  ],
  [
    "21-grams",
    "21 Grams",
    2003,
    "Alejandro G. Iñárritu",
    "b5q8sgpTJCg",
    [
      "drama"
    ],
    [],
    [],
    [
      "Sean Penn",
      "Naomi Watts"
    ]
  ],
  [
    "amore-perros",
    "Amores Perros",
    2000,
    "Alejandro G. Iñárritu",
    "1cIUun8P5vk",
    [
      "drama"
    ],
    [],
    [],
    []
  ],
  [
    "pan-labyrinth",
    "Pan's Labyrinth",
    2006,
    "Guillermo del Toro",
    "E7N2u3jEdDs",
    [
      "fantasy",
      "war"
    ],
    [
      "Pans Labyrinth"
    ],
    [],
    [
      "Ivana Baquero"
    ]
  ],
  [
    "shape-of-water",
    "The Shape of Water",
    2017,
    "Guillermo del Toro",
    "XFYWazbsaDQ",
    [
      "fantasy",
      "romance"
    ],
    [],
    [],
    [
      "Sally Hawkins"
    ]
  ],
  [
    "hellboy",
    "Hellboy",
    2004,
    "Guillermo del Toro",
    "P5-WwI2oKfQ",
    [
      "action",
      "fantasy"
    ],
    [],
    [],
    [
      "Ron Perlman"
    ]
  ],
  [
    "pacific-rim",
    "Pacific Rim",
    2013,
    "Guillermo del Toro",
    "5guMumPFBag",
    [
      "action",
      "sci-fi"
    ],
    [],
    [
      "jaegers"
    ],
    [
      "Idris Elba"
    ]
  ],
  [
    "blade-2",
    "Blade II",
    2002,
    "Guillermo del Toro",
    "vAUB7jcGMsw",
    [
      "action",
      "horror"
    ],
    [
      "Blade 2"
    ],
    [],
    [
      "Wesley Snipes"
    ]
  ],
  [
    "blade",
    "Blade",
    1998,
    "Stephen Norrington",
    "kaU2A7KyOu4",
    [
      "action",
      "horror"
    ],
    [],
    [],
    [
      "Wesley Snipes"
    ]
  ],
  [
    "constantine",
    "Constantine",
    2005,
    "Francis Lawrence",
    "DBa5-yN9f4s",
    [
      "fantasy",
      "action"
    ],
    [],
    [],
    [
      "Keanu Reeves"
    ]
  ],
  [
    "i-am-legend",
    "I Am Legend",
    2007,
    "Francis Lawrence",
    "dtKMEAXyEqs",
    [
      "sci-fi",
      "horror"
    ],
    [],
    [],
    [
      "Will Smith"
    ]
  ],
  [
    "hunger-games",
    "The Hunger Games",
    2012,
    "Gary Ross",
    "mfmrPu43DF8",
    [
      "sci-fi",
      "action"
    ],
    [],
    [
      "may the odds"
    ],
    [
      "Jennifer Lawrence"
    ]
  ],
  [
    "catching-fire",
    "The Hunger Games: Catching Fire",
    2013,
    "Francis Lawrence",
    "EAzGXqJSDJ8",
    [
      "sci-fi",
      "action"
    ],
    [
      "Catching Fire"
    ],
    [],
    [
      "Jennifer Lawrence"
    ]
  ],
  [
    "mockingjay-1",
    "The Hunger Games: Mockingjay – Part 1",
    2014,
    "Francis Lawrence",
    "3KgiX-X-QvU",
    [
      "sci-fi",
      "action"
    ],
    [
      "Mockingjay"
    ],
    [],
    [
      "Jennifer Lawrence"
    ]
  ],
  [
    "twilight",
    "Twilight",
    2008,
    "Catherine Hardwicke",
    "uxj6y1S2I8s",
    [
      "romance",
      "fantasy"
    ],
    [],
    [],
    [
      "Kristen Stewart",
      "Robert Pattinson"
    ]
  ],
  [
    "harry-potter-1",
    "Harry Potter and the Sorcerer's Stone",
    2001,
    "Chris Columbus",
    "VyHV0BRtdxo",
    [
      "fantasy"
    ],
    [
      "Harry Potter 1",
      "Philosophers Stone"
    ],
    [],
    [
      "Daniel Radcliffe"
    ]
  ],
  [
    "harry-potter-2",
    "Harry Potter and the Chamber of Secrets",
    2002,
    "Chris Columbus",
    "1bgFktS0kps",
    [
      "fantasy"
    ],
    [
      "Chamber of Secrets"
    ],
    [],
    [
      "Daniel Radcliffe"
    ]
  ],
  [
    "harry-potter-3",
    "Harry Potter and the Prisoner of Azkaban",
    2004,
    "Alfonso Cuarón",
    "lAh8tTZbTfM",
    [
      "fantasy"
    ],
    [
      "Prisoner of Azkaban"
    ],
    [],
    [
      "Daniel Radcliffe"
    ]
  ],
  [
    "harry-potter-4",
    "Harry Potter and the Goblet of Fire",
    2005,
    "Mike Newell",
    "PFWA57VYCCk",
    [
      "fantasy"
    ],
    [
      "Goblet of Fire"
    ],
    [],
    [
      "Daniel Radcliffe"
    ]
  ],
  [
    "harry-potter-5",
    "Harry Potter and the Order of the Phoenix",
    2007,
    "David Yates",
    "y6ZW7KXaXYk",
    [
      "fantasy"
    ],
    [
      "Order of the Phoenix"
    ],
    [],
    [
      "Daniel Radcliffe"
    ]
  ],
  [
    "harry-potter-6",
    "Harry Potter and the Half-Blood Prince",
    2009,
    "David Yates",
    "jpCPvHJ6p70",
    [
      "fantasy"
    ],
    [
      "Half-Blood Prince"
    ],
    [],
    [
      "Daniel Radcliffe"
    ]
  ],
  [
    "harry-potter-7",
    "Harry Potter and the Deathly Hallows – Part 1",
    2010,
    "David Yates",
    "MxdsxjAFtk8",
    [
      "fantasy"
    ],
    [
      "Deathly Hallows 1"
    ],
    [],
    [
      "Daniel Radcliffe"
    ]
  ],
  [
    "harry-potter-8",
    "Harry Potter and the Deathly Hallows – Part 2",
    2011,
    "David Yates",
    "mObK5XD8udk",
    [
      "fantasy"
    ],
    [
      "Deathly Hallows 2"
    ],
    [],
    [
      "Daniel Radcliffe"
    ]
  ],
  [
    "fantastic-beasts",
    "Fantastic Beasts and Where to Find Them",
    2016,
    "David Yates",
    "ViuDsy7yb8M",
    [
      "fantasy"
    ],
    [
      "Fantastic Beasts"
    ],
    [],
    [
      "Eddie Redmayne"
    ]
  ],
  [
    "narnia",
    "The Chronicles of Narnia: The Lion, the Witch and the Wardrobe",
    2005,
    "Andrew Adamson",
    "pYcGFLgxQVc",
    [
      "fantasy"
    ],
    [
      "Narnia",
      "Lion Witch Wardrobe"
    ],
    [],
    [
      "Tilda Swinton"
    ]
  ],
  [
    "golden-compass",
    "The Golden Compass",
    2007,
    "Chris Weitz",
    "vXmdKOvGYjk",
    [
      "fantasy"
    ],
    [],
    [],
    [
      "Nicole Kidman"
    ]
  ],
  [
    "hobbit-1",
    "The Hobbit: An Unexpected Journey",
    2012,
    "Peter Jackson",
    "SDnYMbYB-nU",
    [
      "fantasy"
    ],
    [
      "Hobbit 1"
    ],
    [],
    [
      "Martin Freeman"
    ]
  ],
  [
    "hobbit-2",
    "The Hobbit: The Desolation of Smaug",
    2013,
    "Peter Jackson",
    "f7oKxlaUHa8",
    [
      "fantasy"
    ],
    [
      "Desolation of Smaug"
    ],
    [],
    [
      "Martin Freeman"
    ]
  ],
  [
    "hobbit-3",
    "The Hobbit: The Battle of the Five Armies",
    2014,
    "Peter Jackson",
    "ZSzeFFsKEt4",
    [
      "fantasy"
    ],
    [
      "Battle of Five Armies"
    ],
    [],
    [
      "Martin Freeman"
    ]
  ],
  [
    "king-kong-2005",
    "King Kong",
    2005,
    "Peter Jackson",
    "1Tfe6O5vwJY",
    [
      "adventure"
    ],
    [],
    [],
    [
      "Naomi Watts"
    ]
  ],
  [
    "district-9",
    "District 9",
    2009,
    "Neill Blomkamp",
    "DydejV4bv9M",
    [
      "sci-fi"
    ],
    [
      "District 9"
    ],
    [
      "prawns"
    ],
    [
      "Sharlto Copley"
    ]
  ],
  [
    "elysium",
    "Elysium",
    2013,
    "Neill Blomkamp",
    "oIEzyhG_e5k",
    [
      "sci-fi"
    ],
    [],
    [],
    [
      "Matt Damon"
    ]
  ],
  [
    "chappie",
    "Chappie",
    2015,
    "Neill Blomkamp",
    "l6bmTNadhJE",
    [
      "sci-fi"
    ],
    [],
    [],
    [
      "Sharito Copley"
    ]
  ],
  [
    "moon",
    "Moon",
    2009,
    "Duncan Jones",
    "twu3lQdGNSE",
    [
      "sci-fi"
    ],
    [],
    [],
    [
      "Sam Rockwell"
    ]
  ],
  [
    "source-code",
    "Source Code",
    2011,
    "Duncan Jones",
    "mnDGfnk2K7g",
    [
      "sci-fi"
    ],
    [],
    [
      "eight minutes"
    ],
    [
      "Jake Gyllenhaal"
    ]
  ],
  [
    "warcraft",
    "Warcraft",
    2016,
    "Duncan Jones",
    "RhFMIRuHAL4",
    [
      "fantasy"
    ],
    [],
    [],
    [
      "Travis Fimmel"
    ]
  ],
  [
    "looper",
    "Looper",
    2012,
    "Rian Johnson",
    "2iKZmRR9HkA",
    [
      "sci-fi"
    ],
    [],
    [
      "time crime"
    ],
    [
      "Joseph Gordon-Levitt",
      "Bruce Willis"
    ]
  ],
  [
    "brick",
    "Brick",
    2005,
    "Rian Johnson",
    "uM7E0W5amvk",
    [
      "mystery"
    ],
    [],
    [],
    [
      "Joseph Gordon-Levitt"
    ]
  ],
  [
    "brothers-bloom",
    "The Brothers Bloom",
    2008,
    "Rian Johnson",
    "KGf9yVK8pZ0",
    [
      "comedy"
    ],
    [],
    [],
    [
      "Adrien Brody"
    ]
  ],
  [
    "star-wars-7",
    "Star Wars: The Force Awakens",
    2015,
    "J.J. Abrams",
    "sGbxmsDFVnE",
    [
      "sci-fi"
    ],
    [
      "Force Awakens",
      "Episode VII"
    ],
    [],
    [
      "Daisy Ridley"
    ]
  ],
  [
    "star-wars-8",
    "Star Wars: The Last Jedi",
    2017,
    "Rian Johnson",
    "Q0CbN8sfihY",
    [
      "sci-fi"
    ],
    [
      "Last Jedi",
      "Episode VIII"
    ],
    [],
    [
      "Daisy Ridley"
    ]
  ],
  [
    "star-wars-9",
    "Star Wars: The Rise of Skywalker",
    2019,
    "J.J. Abrams",
    "8Qn_spdM5Zg",
    [
      "sci-fi"
    ],
    [
      "Rise of Skywalker",
      "Episode IX"
    ],
    [],
    [
      "Daisy Ridley"
    ]
  ],
  [
    "solo",
    "Solo: A Star Wars Story",
    2018,
    "Ron Howard",
    "jPEYprhJzw0",
    [
      "sci-fi"
    ],
    [
      "Solo"
    ],
    [],
    [
      "Alden Ehrenreich"
    ]
  ],
  [
    "clone-wars-movie",
    "Star Wars: The Clone Wars",
    2008,
    "Dave Filoni",
    "O1hF55FcEQw",
    [
      "animation",
      "sci-fi"
    ],
    [
      "Clone Wars"
    ],
    [],
    []
  ],
  [
    "super-8",
    "Super 8",
    2011,
    "J.J. Abrams",
    "hNxt0TVkbGM",
    [
      "sci-fi"
    ],
    [],
    [],
    [
      "Elle Fanning"
    ]
  ],
  [
    "mission-1",
    "Mission: Impossible",
    1996,
    "Brian De Palma",
    "Oh5_4LcGxUY",
    [
      "action"
    ],
    [
      "MI1"
    ],
    [],
    [
      "Tom Cruise"
    ]
  ],
  [
    "mission-2",
    "Mission: Impossible II",
    2000,
    "John Woo",
    "gbT8W4bR1xE",
    [
      "action"
    ],
    [
      "MI2"
    ],
    [],
    [
      "Tom Cruise"
    ]
  ],
  [
    "mission-3",
    "Mission: Impossible III",
    2006,
    "J.J. Abrams",
    "vzs90nR7PJE",
    [
      "action"
    ],
    [
      "MI3"
    ],
    [],
    [
      "Tom Cruise"
    ]
  ],
  [
    "mission-ghost",
    "Mission: Impossible - Ghost Protocol",
    2011,
    "Brad Bird",
    "ED0R9YjH2V8",
    [
      "action"
    ],
    [
      "Ghost Protocol"
    ],
    [
      "burj khalifa"
    ],
    [
      "Tom Cruise"
    ]
  ],
  [
    "mission-rogue",
    "Mission: Impossible - Rogue Nation",
    2015,
    "Christopher McQuarrie",
    "gF3u5O5q3gU",
    [
      "action"
    ],
    [
      "Rogue Nation"
    ],
    [],
    [
      "Tom Cruise"
    ]
  ],
  [
    "mission-dead-reckoning",
    "Mission: Impossible - Dead Reckoning Part One",
    2023,
    "Christopher McQuarrie",
    "avz3SjzblUI",
    [
      "action"
    ],
    [
      "Dead Reckoning"
    ],
    [],
    [
      "Tom Cruise"
    ]
  ],
  [
    "bourne-identity",
    "The Bourne Identity",
    2002,
    "Doug Liman",
    "cD-uQreI2GI",
    [
      "action"
    ],
    [
      "Bourne Identity"
    ],
    [],
    [
      "Matt Damon"
    ]
  ],
  [
    "bourne-supremacy",
    "The Bourne Supremacy",
    2004,
    "Paul Greengrass",
    "Y-HqyyQUrqA",
    [
      "action"
    ],
    [
      "Bourne Supremacy"
    ],
    [],
    [
      "Matt Damon"
    ]
  ],
  [
    "bourne-ultimatum",
    "The Bourne Ultimatum",
    2007,
    "Paul Greengrass",
    "ZTVlrOgb96M",
    [
      "action"
    ],
    [
      "Bourne Ultimatum"
    ],
    [],
    [
      "Matt Damon"
    ]
  ],
  [
    "bourne-legacy",
    "The Bourne Legacy",
    2012,
    "Tony Gilroy",
    "ZWYVDOl2o3Q",
    [
      "action"
    ],
    [
      "Bourne Legacy"
    ],
    [],
    [
      "Jeremy Renner"
    ]
  ],
  [
    "jason-bourne",
    "Jason Bourne",
    2016,
    "Paul Greengrass",
    "v71uP6UHx6I",
    [
      "action"
    ],
    [],
    [],
    [
      "Matt Damon"
    ]
  ],
  [
    "united-93",
    "United 93",
    2006,
    "Paul Greengrass",
    "3Kx3SIppzKM",
    [
      "drama"
    ],
    [],
    [],
    []
  ],
  [
    "captain-phillips",
    "Captain Phillips",
    2013,
    "Paul Greengrass",
    "xyf6pafkkx4",
    [
      "thriller"
    ],
    [],
    [],
    [
      "Tom Hanks"
    ]
  ],
  [
    "news-of-world",
    "News of the World",
    2020,
    "Paul Greengrass",
    "z9GqsdRZj5I",
    [
      "western"
    ],
    [],
    [],
    [
      "Tom Hanks"
    ]
  ],
  [
    "blood-diamond",
    "Blood Diamond",
    2006,
    "Edward Zwick",
    "yknuQBPXh0I",
    [
      "drama",
      "thriller"
    ],
    [],
    [],
    [
      "Leonardo DiCaprio"
    ]
  ],
  [
    "last-samurai",
    "The Last Samurai",
    2003,
    "Edward Zwick",
    "T50_qHEOahk",
    [
      "war",
      "drama"
    ],
    [],
    [],
    [
      "Tom Cruise"
    ]
  ],
  [
    "glory",
    "Glory",
    1989,
    "Edward Zwick",
    "i0l5R0yq1gI",
    [
      "war"
    ],
    [],
    [],
    [
      "Denzel Washington"
    ]
  ],
  [
    "training-day",
    "Training Day",
    2001,
    "Antoine Fuqua",
    "DXPJqRtkDP0",
    [
      "crime"
    ],
    [],
    [
      "king kong aint got shit on me"
    ],
    [
      "Denzel Washington"
    ]
  ],
  [
    "equalizer",
    "The Equalizer",
    2014,
    "Antoine Fuqua",
    "VjctHUEmutw",
    [
      "action"
    ],
    [],
    [],
    [
      "Denzel Washington"
    ]
  ],
  [
    "equalizer-2",
    "The Equalizer 2",
    2018,
    "Antoine Fuqua",
    "HyJhKMfw-1E",
    [
      "action"
    ],
    [],
    [],
    [
      "Denzel Washington"
    ]
  ],
  [
    "magnificent-seven-2016",
    "The Magnificent Seven",
    2016,
    "Antoine Fuqua",
    "q-PJ7XRu9nE",
    [
      "western",
      "action"
    ],
    [],
    [],
    [
      "Denzel Washington"
    ]
  ],
  [
    "olympus-has-fallen",
    "Olympus Has Fallen",
    2013,
    "Antoine Fuqua",
    "ar-IaAxw2rU",
    [
      "action"
    ],
    [],
    [],
    [
      "Gerard Butler"
    ]
  ],
  [
    "london-has-fallen",
    "London Has Fallen",
    2016,
    "Babak Najafi",
    "3D8pmg7g5F0",
    [
      "action"
    ],
    [],
    [],
    [
      "Gerard Butler"
    ]
  ],
  [
    "300",
    "300",
    2006,
    "Zack Snyder",
    "UrIbxk7idYA",
    [
      "action",
      "war"
    ],
    [],
    [
      "this is sparta"
    ],
    [
      "Gerard Butler"
    ]
  ],
  [
    "watchmen",
    "Watchmen",
    2009,
    "Zack Snyder",
    "NUjB9ETqGDw",
    [
      "action",
      "sci-fi"
    ],
    [],
    [],
    [
      "Jackie Earle Haley"
    ]
  ],
  [
    "man-of-steel",
    "Man of Steel",
    2013,
    "Zack Snyder",
    "T6DJcgm3wNY",
    [
      "action",
      "sci-fi"
    ],
    [],
    [],
    [
      "Henry Cavill"
    ]
  ],
  [
    "bvs",
    "Batman v Superman: Dawn of Justice",
    2016,
    "Zack Snyder",
    "0WWzgGyAH6Y",
    [
      "action"
    ],
    [
      "Batman v Superman",
      "BVS"
    ],
    [],
    [
      "Ben Affleck",
      "Henry Cavill"
    ]
  ],
  [
    "justice-league",
    "Justice League",
    2017,
    "Zack Snyder",
    "3cxixDgHUYw",
    [
      "action"
    ],
    [],
    [],
    [
      "Ben Affleck"
    ]
  ],
  [
    "zack-snyder-jl",
    "Zack Snyder's Justice League",
    2021,
    "Zack Snyder",
    "vM-Bja2Gy04",
    [
      "action"
    ],
    [
      "ZSJL",
      "Snyder Cut"
    ],
    [],
    [
      "Ben Affleck"
    ]
  ],
  [
    "dawn-of-dead",
    "Dawn of the Dead",
    2004,
    "Zack Snyder",
    "qWe0YFzhC_I",
    [
      "horror"
    ],
    [],
    [],
    [
      "Sarah Polley"
    ]
  ],
  [
    "sucker-punch",
    "Sucker Punch",
    2011,
    "Zack Snyder",
    "o6g7X0g2Y0Y",
    [
      "action",
      "fantasy"
    ],
    [],
    [],
    [
      "Emily Browning"
    ]
  ],
  [
    "rebel-moon",
    "Rebel Moon",
    2023,
    "Zack Snyder",
    "UEJ7e50ZYk4",
    [
      "sci-fi"
    ],
    [],
    [],
    [
      "Sofia Boutella"
    ]
  ],
  [
    "army-of-the-dead",
    "Army of the Dead",
    2021,
    "Zack Snyder",
    "tI1JGPhYBS8",
    [
      "horror",
      "action"
    ],
    [],
    [],
    [
      "Dave Bautista"
    ]
  ],
  [
    "guardians-2",
    "Guardians of the Galaxy Vol. 2",
    2017,
    "James Gunn",
    "dW1BIid8Osg",
    [
      "action",
      "comedy"
    ],
    [
      "GotG 2"
    ],
    [],
    [
      "Chris Pratt"
    ]
  ],
  [
    "guardians-3",
    "Guardians of the Galaxy Vol. 3",
    2023,
    "James Gunn",
    "u3V5KDHRQvk",
    [
      "action",
      "comedy"
    ],
    [
      "GotG 3"
    ],
    [],
    [
      "Chris Pratt"
    ]
  ],
  [
    "suicide-squad",
    "Suicide Squad",
    2016,
    "David Ayer",
    "CmRih_VtVAs",
    [
      "action"
    ],
    [],
    [],
    [
      "Margot Robbie",
      "Will Smith"
    ]
  ],
  [
    "the-suicide-squad",
    "The Suicide Squad",
    2021,
    "James Gunn",
    "eg5ciqQztZo",
    [
      "action",
      "comedy"
    ],
    [],
    [],
    [
      "Margot Robbie",
      "Idris Elba"
    ]
  ],
  [
    "slither",
    "Slither",
    2006,
    "James Gunn",
    "2j3xg8pRvCo",
    [
      "horror",
      "comedy"
    ],
    [],
    [],
    [
      "Nathan Fillion"
    ]
  ],
  [
    "doctor-strange",
    "Doctor Strange",
    2016,
    "Scott Derrickson",
    "HSzx-zryEgM",
    [
      "action",
      "fantasy"
    ],
    [],
    [],
    [
      "Benedict Cumberbatch"
    ]
  ],
  [
    "multiverse-madness",
    "Doctor Strange in the Multiverse of Madness",
    2022,
    "Sam Raimi",
    "aWzlQ2Nmfss",
    [
      "action",
      "fantasy"
    ],
    [
      "Multiverse of Madness"
    ],
    [],
    [
      "Benedict Cumberbatch"
    ]
  ],
  [
    "spiderman",
    "Spider-Man",
    2002,
    "Sam Raimi",
    "t06RUGShXkM",
    [
      "action"
    ],
    [
      "Spider-Man 1"
    ],
    [],
    [
      "Tobey Maguire"
    ]
  ],
  [
    "spiderman-2",
    "Spider-Man 2",
    2004,
    "Sam Raimi",
    "1s9Yln0YwC0",
    [
      "action"
    ],
    [
      "Spider-Man 2"
    ],
    [
      "pizza time"
    ],
    [
      "Tobey Maguire"
    ]
  ],
  [
    "spiderman-3",
    "Spider-Man 3",
    2007,
    "Sam Raimi",
    "wPosLpgMtMY",
    [
      "action"
    ],
    [
      "Spider-Man 3"
    ],
    [],
    [
      "Tobey Maguire"
    ]
  ],
  [
    "amazing-spiderman",
    "The Amazing Spider-Man",
    2012,
    "Marc Webb",
    "NtQ-mdz51cg",
    [
      "action"
    ],
    [
      "Amazing Spider-Man"
    ],
    [],
    [
      "Andrew Garfield"
    ]
  ],
  [
    "amazing-spiderman-2",
    "The Amazing Spider-Man 2",
    2014,
    "Marc Webb",
    "DlM2jP6s3kI",
    [
      "action"
    ],
    [
      "Amazing Spider-Man 2"
    ],
    [],
    [
      "Andrew Garfield"
    ]
  ],
  [
    "homecoming",
    "Spider-Man: Homecoming",
    2017,
    "Jon Watts",
    "n9DwoQ7HWvI",
    [
      "action"
    ],
    [
      "Homecoming"
    ],
    [],
    [
      "Tom Holland"
    ]
  ],
  [
    "far-from-home",
    "Spider-Man: Far From Home",
    2019,
    "Jon Watts",
    "NtQ-mdz51cg",
    [
      "action"
    ],
    [
      "Far From Home"
    ],
    [],
    [
      "Tom Holland"
    ]
  ],
  [
    "across-spiderverse",
    "Spider-Man: Across the Spider-Verse",
    2023,
    "Joaquim Dos Santos",
    "cqGjhVJWtEg",
    [
      "animation",
      "action"
    ],
    [
      "Across the Spider-Verse"
    ],
    [],
    [
      "Shameik Moore"
    ]
  ],
  [
    "venom",
    "Venom",
    2018,
    "Ruben Fleischer",
    "uib4wW5uK4g",
    [
      "action"
    ],
    [],
    [],
    [
      "Tom Hardy"
    ]
  ],
  [
    "venom-2",
    "Venom: Let There Be Carnage",
    2021,
    "Andy Serkis",
    "-FmWuCgJmxo",
    [
      "action"
    ],
    [
      "Let There Be Carnage"
    ],
    [],
    [
      "Tom Hardy"
    ]
  ],
  [
    "morbius",
    "Morbius",
    2022,
    "Daniel Espinosa",
    "oZ6iiRtzLEk",
    [
      "action"
    ],
    [],
    [],
    [
      "Jared Leto"
    ]
  ],
  [
    "ant-man",
    "Ant-Man",
    2015,
    "Peyton Reed",
    "pWdKf3MnyBo",
    [
      "action",
      "comedy"
    ],
    [],
    [],
    [
      "Paul Rudd"
    ]
  ],
  [
    "ant-man-wasp",
    "Ant-Man and the Wasp",
    2018,
    "Peyton Reed",
    "UUkn-enk2RU",
    [
      "action",
      "comedy"
    ],
    [],
    [],
    [
      "Paul Rudd"
    ]
  ],
  [
    "quantumania",
    "Ant-Man and the Wasp: Quantumania",
    2023,
    "Peyton Reed",
    "ZlNFpri-Y40",
    [
      "action"
    ],
    [
      "Quantumania"
    ],
    [],
    [
      "Paul Rudd"
    ]
  ],
  [
    "captain-america",
    "Captain America: The First Avenger",
    2011,
    "Joe Johnston",
    "JerVrbLldXw",
    [
      "action"
    ],
    [
      "First Avenger"
    ],
    [],
    [
      "Chris Evans"
    ]
  ],
  [
    "winter-soldier",
    "Captain America: The Winter Soldier",
    2014,
    "Anthony Russo",
    "7SlILk2WMTI",
    [
      "action"
    ],
    [
      "Winter Soldier"
    ],
    [],
    [
      "Chris Evans"
    ]
  ],
  [
    "civil-war",
    "Captain America: Civil War",
    2016,
    "Anthony Russo",
    "dKrVegVI0Us",
    [
      "action"
    ],
    [
      "Civil War"
    ],
    [],
    [
      "Chris Evans",
      "Robert Downey Jr."
    ]
  ],
  [
    "marvels",
    "The Marvels",
    2023,
    "Nia DaCosta",
    "wS_qbDztgVY",
    [
      "action"
    ],
    [],
    [],
    [
      "Brie Larson"
    ]
  ],
  [
    "shang-chi",
    "Shang-Chi and the Legend of the Ten Rings",
    2021,
    "Destin Daniel Cretton",
    "8YjFbMbfXaQ",
    [
      "action"
    ],
    [
      "Shang-Chi"
    ],
    [],
    [
      "Simu Liu"
    ]
  ],
  [
    "eternals",
    "Eternals",
    2021,
    "Chloé Zhao",
    "x_me3xsvDgk",
    [
      "action"
    ],
    [],
    [],
    [
      "Gemma Chan"
    ]
  ],
  [
    "black-widow",
    "Black Widow",
    2021,
    "Cate Shortland",
    "ybji16u608U",
    [
      "action"
    ],
    [],
    [],
    [
      "Scarlett Johansson"
    ]
  ],
  [
    "hush",
    "Hush",
    2016,
    "Mike Flanagan",
    "Q_vTglLz5v8",
    [
      "horror"
    ],
    [],
    [],
    [
      "Kate Siegel"
    ]
  ],
  [
    "it-follows",
    "It Follows",
    2014,
    "David Robert Mitchell",
    "HkZYbOHAqsg",
    [
      "horror"
    ],
    [],
    [],
    [
      "Maika Monroe"
    ]
  ],
  [
    "the-babdook",
    "The Babadook",
    2014,
    "Jennifer Kent",
    "k5WQZzDRVtw",
    [
      "horror"
    ],
    [
      "Babadook"
    ],
    [],
    [
      "Essie Davis"
    ]
  ],
  [
    "the-lighthouse",
    "The Lighthouse",
    2019,
    "Robert Eggers",
    "fQq06P2NBXo",
    [
      "horror"
    ],
    [],
    [
      "why did ye spill yer beans"
    ],
    [
      "Willem Dafoe",
      "Robert Pattinson"
    ]
  ],
  [
    "the-northman",
    "The Northman",
    2022,
    "Robert Eggers",
    "oqhNmT2Q0v8",
    [
      "action",
      "drama"
    ],
    [],
    [],
    [
      "Alexander Skarsgård"
    ]
  ],
  [
    "nosferatu-2024",
    "Nosferatu",
    2024,
    "Robert Eggers",
    "IFUw0V5qbbM",
    [
      "horror"
    ],
    [],
    [],
    [
      "Lily-Rose Depp"
    ]
  ],
  [
    "pearl",
    "Pearl",
    2022,
    "Ti West",
    "L5sry5i3U_8",
    [
      "horror"
    ],
    [],
    [],
    [
      "Mia Goth"
    ]
  ],
  [
    "x-2022",
    "X",
    2022,
    "Ti West",
    "A0K8hwNqzRA",
    [
      "horror"
    ],
    [],
    [],
    [
      "Mia Goth"
    ]
  ],
  [
    "maXXXine",
    "MaXXXine",
    2024,
    "Ti West",
    "eHs-YHjQokI",
    [
      "horror"
    ],
    [
      "Maxxxine"
    ],
    [],
    [
      "Mia Goth"
    ]
  ],
  [
    "talk-to-me",
    "Talk to Me",
    2022,
    "Danny Philippou",
    "a07jT2i_c5M",
    [
      "horror"
    ],
    [],
    [],
    [
      "Ari McCarthy"
    ]
  ],
  [
    "smile",
    "Smile",
    2022,
    "Parker Finn",
    "BcDK7lkzzsU",
    [
      "horror"
    ],
    [],
    [],
    [
      "Sosie Bacon"
    ]
  ],
  [
    "scream-2022",
    "Scream",
    2022,
    "Matt Bettinelli-Olpin",
    "be70X9vV5O8",
    [
      "horror"
    ],
    [
      "Scream 5"
    ],
    [],
    [
      "Melissa Barrera"
    ]
  ],
  [
    "scream-6",
    "Scream VI",
    2023,
    "Matt Bettinelli-Olpin",
    "h74AXqw4Oke",
    [
      "horror"
    ],
    [
      "Scream 6"
    ],
    [],
    [
      "Melissa Barrera"
    ]
  ],
  [
    "m3gan",
    "M3GAN",
    2022,
    "Gerard Johnstone",
    "BRb4U99OU80",
    [
      "horror"
    ],
    [
      "Megan"
    ],
    [],
    [
      "Allison Williams"
    ]
  ],
  [
    "ready-or-not",
    "Ready or Not",
    2019,
    "Matt Bettinelli-Olpin",
    "ZtNlhJZxZ0I",
    [
      "horror",
      "comedy"
    ],
    [],
    [],
    [
      "Samara Weaving"
    ]
  ],
  [
    "ocean-eleven",
    "Ocean's Eleven",
    2001,
    "Steven Soderbergh",
    "u7VTkL6Xh5Y",
    [
      "crime",
      "comedy"
    ],
    [
      "Oceans Eleven"
    ],
    [],
    [
      "George Clooney",
      "Brad Pitt"
    ]
  ],
  [
    "ocean-eight",
    "Ocean's 8",
    2018,
    "Gary Ross",
    "n4XtC7rb82I",
    [
      "crime",
      "comedy"
    ],
    [
      "Oceans 8"
    ],
    [],
    [
      "Sandra Bullock"
    ]
  ],
  [
    "erin-brockovich",
    "Erin Brockovich",
    2000,
    "Steven Soderbergh",
    "9Tj2e0LoA0E",
    [
      "drama"
    ],
    [],
    [],
    [
      "Julia Roberts"
    ]
  ],
  [
    "contagion",
    "Contagion",
    2011,
    "Steven Soderbergh",
    "4sYSyuuLk5g",
    [
      "thriller",
      "sci-fi"
    ],
    [],
    [],
    [
      "Matt Damon"
    ]
  ],
  [
    "gray-man",
    "The Gray Man",
    2022,
    "Anthony Russo",
    "BmllgcCv4L0",
    [
      "action"
    ],
    [
      "Grey Man"
    ],
    [],
    [
      "Ryan Gosling",
      "Chris Evans"
    ]
  ],
  [
    "extraction",
    "Extraction",
    2020,
    "Sam Hargrave",
    "L6P3nI6VnlY",
    [
      "action"
    ],
    [],
    [],
    [
      "Chris Hemsworth"
    ]
  ],
  [
    "extraction-2",
    "Extraction 2",
    2023,
    "Sam Hargrave",
    "Y274jZs5s7s",
    [
      "action"
    ],
    [],
    [],
    [
      "Chris Hemsworth"
    ]
  ],
  [
    "red-notice",
    "Red Notice",
    2021,
    "Rawson Marshall Thurber",
    "Pj0wz7zu3Ms",
    [
      "action",
      "comedy"
    ],
    [],
    [],
    [
      "Dwayne Johnson",
      "Ryan Reynolds"
    ]
  ],
  [
    "central-intelligence",
    "Central Intelligence",
    2016,
    "Rawson Marshall Thurber",
    "jYd_pYrGZq0",
    [
      "action",
      "comedy"
    ],
    [],
    [],
    [
      "Dwayne Johnson",
      "Kevin Hart"
    ]
  ],
  [
    "were-the-millers",
    "We're the Millers",
    2013,
    "Rawson Marshall Thurber",
    "0Vsy5Kzieto",
    [
      "comedy"
    ],
    [
      "Were the Millers"
    ],
    [],
    [
      "Jennifer Aniston",
      "Jason Sudeikis"
    ]
  ],
  [
    "dodgeball",
    "Dodgeball: A True Underdog Story",
    2004,
    "Rawson Marshall Thurber",
    "3KgiX-X-QvU",
    [
      "comedy"
    ],
    [
      "Dodgeball"
    ],
    [
      "if you can dodge a wrench"
    ],
    [
      "Vince Vaughn",
      "Ben Stiller"
    ]
  ],
  [
    "zoolander",
    "Zoolander",
    2001,
    "Ben Stiller",
    "MaFtC2UTPa8",
    [
      "comedy"
    ],
    [],
    [
      "blue steel"
    ],
    [
      "Ben Stiller"
    ]
  ],
  [
    "tropic-thunder",
    "Tropic Thunder",
    2008,
    "Ben Stiller",
    "TEuo7a5R4ow",
    [
      "comedy"
    ],
    [],
    [
      "never go full retard"
    ],
    [
      "Ben Stiller",
      "Robert Downey Jr."
    ]
  ],
  [
    "free-guy",
    "Free Guy",
    2021,
    "Shawn Levy",
    "X2m-08cOAbc",
    [
      "comedy",
      "sci-fi"
    ],
    [],
    [],
    [
      "Ryan Reynolds"
    ]
  ],
  [
    "free-guy-ok",
    "The Nice Guys",
    2016,
    "Shane Black",
    "2XlcDOhdHn8",
    [
      "comedy",
      "crime"
    ],
    [
      "Nice Guys"
    ],
    [],
    [
      "Ryan Gosling",
      "Russell Crowe"
    ]
  ],
  [
    "nice-guys",
    "The Nice Guys",
    2016,
    "Shane Black",
    "2XlcDOhdHn8",
    [
      "comedy",
      "crime"
    ],
    [],
    [],
    [
      "Ryan Gosling",
      "Russell Crowe"
    ]
  ],
  [
    "iron-man-3",
    "Iron Man 3",
    2013,
    "Shane Black",
    "Ke1Y3P9D0Bc",
    [
      "action"
    ],
    [],
    [],
    [
      "Robert Downey Jr."
    ]
  ],
  [
    "the-predator",
    "The Predator",
    2018,
    "Shane Black",
    "WaG1KZqrLrQ",
    [
      "action",
      "sci-fi"
    ],
    [],
    [],
    [
      "Boyd Holbrook"
    ]
  ],
  [
    "prey",
    "Prey",
    2022,
    "Dan Trachtenberg",
    "wZ7LytagKlc",
    [
      "action",
      "sci-fi"
    ],
    [],
    [],
    [
      "Amber Midthunder"
    ]
  ],
  [
    "10-cloverfield",
    "10 Cloverfield Lane",
    2016,
    "Dan Trachtenberg",
    "yQyPXz21KiA",
    [
      "sci-fi",
      "thriller"
    ],
    [
      "10 Cloverfield Lane"
    ],
    [],
    [
      "John Goodman"
    ]
  ],
  [
    "the-batman",
    "The Batman",
    2022,
    "Matt Reeves",
    "mqqft2x_Aa4",
    [
      "action",
      "crime"
    ],
    [],
    [],
    [
      "Robert Pattinson"
    ]
  ],
  [
    "old-school",
    "Old School",
    2003,
    "Todd Phillips",
    "VqtDVtpN5cc",
    [
      "comedy"
    ],
    [],
    [],
    [
      "Will Ferrell",
      "Vince Vaughn"
    ]
  ],
  [
    "the-hangover",
    "The Hangover",
    2009,
    "Todd Phillips",
    "tcdUhdOl7O8",
    [
      "comedy"
    ],
    [],
    [
      "what happens in vegas"
    ],
    [
      "Bradley Cooper"
    ]
  ],
  [
    "40-year-old-virgin",
    "The 40-Year-Old Virgin",
    2005,
    "Judd Apatow",
    "YnDpl12iQ10",
    [
      "comedy"
    ],
    [
      "40 Year Old Virgin"
    ],
    [],
    [
      "Steve Carell"
    ]
  ],
  [
    "this-is-the-end",
    "This Is the End",
    2013,
    "Seth Rogen",
    "YmeQ7l2YJzI",
    [
      "comedy"
    ],
    [],
    [],
    [
      "Seth Rogen",
      "James Franco"
    ]
  ],
  [
    "forgetting-sarah",
    "Forgetting Sarah Marshall",
    2008,
    "Nicholas Stoller",
    "KjRv84kEt6U",
    [
      "comedy"
    ],
    [],
    [],
    [
      "Jason Segel",
      "Kristen Bell"
    ]
  ],
  [
    "21-jump-street",
    "21 Jump Street",
    2012,
    "Phil Lord",
    "RLoKWxwkpi8",
    [
      "comedy",
      "action"
    ],
    [],
    [],
    [
      "Jonah Hill",
      "Channing Tatum"
    ]
  ],
  [
    "22-jump-street",
    "22 Jump Street",
    2014,
    "Phil Lord",
    "qP755JkDxyM",
    [
      "comedy",
      "action"
    ],
    [],
    [],
    [
      "Jonah Hill",
      "Channing Tatum"
    ]
  ],
  [
    "lego-movie",
    "The Lego Movie",
    2014,
    "Phil Lord",
    "fZ_JOBCLF-I",
    [
      "animation",
      "comedy"
    ],
    [],
    [
      "everything is awesome"
    ],
    []
  ],
  [
    "lego-batman",
    "The Lego Batman Movie",
    2017,
    "Chris McKay",
    "rGQUKNUVkV0",
    [
      "animation",
      "comedy"
    ],
    [],
    [],
    []
  ],
  [
    "cloudy-meatballs",
    "Cloudy with a Chance of Meatballs",
    2009,
    "Phil Lord",
    "pUaKcFI4BZY",
    [
      "animation",
      "comedy"
    ],
    [],
    [],
    []
  ],
  [
    "kung-fu-panda",
    "Kung Fu Panda",
    2008,
    "Mark Osborne",
    "PXi3Mv6KMzY",
    [
      "animation"
    ],
    [],
    [],
    [
      "Jack Black"
    ]
  ],
  [
    "how-to-train-dragon",
    "How to Train Your Dragon",
    2010,
    "Chris Sanders",
    "oKiYuIsPxYk",
    [
      "animation"
    ],
    [],
    [],
    []
  ],
  [
    "puss-last-wish",
    "Puss in Boots: The Last Wish",
    2022,
    "Joel Crawford",
    "RqrXhwS33yc",
    [
      "animation"
    ],
    [],
    [],
    [
      "Antonio Banderas"
    ]
  ],
  [
    "despicable-me",
    "Despicable Me",
    2010,
    "Pierre Coffin",
    "sUmM-e1PH74",
    [
      "animation"
    ],
    [],
    [],
    [
      "Steve Carell"
    ]
  ],
  [
    "zootopia",
    "Zootopia",
    2016,
    "Byron Howard",
    "jWM0ct-OLsM",
    [
      "animation"
    ],
    [],
    [],
    []
  ],
  [
    "big-hero-6",
    "Big Hero 6",
    2014,
    "Don Hall",
    "z3biFxZIJOQ",
    [
      "animation",
      "action"
    ],
    [],
    [],
    []
  ],
  [
    "frozen-2",
    "Frozen II",
    2019,
    "Chris Buck",
    "bwzLiQZMF84",
    [
      "animation",
      "musical"
    ],
    [
      "Frozen 2"
    ],
    [],
    [
      "Idina Menzel"
    ]
  ],
  [
    "soul",
    "Soul",
    2020,
    "Pete Docter",
    "xOsLIiBStEs",
    [
      "animation"
    ],
    [],
    [],
    [
      "Jamie Foxx"
    ]
  ],
  [
    "inside-out-2",
    "Inside Out 2",
    2024,
    "Kelsey Mann",
    "LEjhY15eCx0",
    [
      "animation"
    ],
    [],
    [],
    [
      "Amy Poehler"
    ]
  ],
  [
    "toy-story-3",
    "Toy Story 3",
    2010,
    "Lee Unkrich",
    "JcpWXaA2qeg",
    [
      "animation"
    ],
    [],
    [],
    [
      "Tom Hanks"
    ]
  ],
  [
    "toy-story-4",
    "Toy Story 4",
    2019,
    "Josh Cooley",
    "wmiIUN-7qhE",
    [
      "animation"
    ],
    [],
    [],
    [
      "Tom Hanks"
    ]
  ]
];

const TV = [
  [
    "breaking-bad-crawl-space",
    "Breaking Bad",
    "Crawl Space",
    4,
    11,
    2011,
    "HhesaQXLuRY",
    [
      "drama",
      "crime"
    ],
    [
      "S4E11"
    ],
    [
      "walter white laughing"
    ],
    "Bryan Cranston"
  ],
  [
    "star-trek-tng-best-of-both",
    "Star Trek: The Next Generation",
    "The Best of Both Worlds",
    3,
    26,
    1990,
    "AYy8o4nXZEY",
    [
      "sci-fi"
    ],
    [
      "TNG",
      "Best of Both Worlds"
    ],
    [
      "resistance is futile"
    ],
    "Patrick Stewart"
  ],
  [
    "the-office-dinner-party",
    "The Office",
    "Dinner Party",
    4,
    13,
    2008,
    "af0GMFIlb4Q",
    [
      "comedy",
      "sitcom"
    ],
    [
      "Office Dinner Party"
    ],
    [
      "foine"
    ],
    "Steve Carell"
  ],
  [
    "sopranos-pine-barrens",
    "The Sopranos",
    "Pine Barrens",
    3,
    11,
    2001,
    "PLMDSKDJFH4",
    [
      "drama",
      "crime"
    ],
    [],
    [
      "paulie woods"
    ],
    "James Gandolfini"
  ],
  [
    "got-winter",
    "Game of Thrones",
    "Winter Is Coming",
    1,
    1,
    2011,
    "KPLWWIOCOOQ",
    [
      "fantasy",
      "drama"
    ],
    [
      "GoT",
      "Game of Thrones"
    ],
    [
      "winter is coming"
    ],
    "Emilia Clarke"
  ],
  [
    "stranger-things",
    "Stranger Things",
    "Chapter One: The Vanishing of Will Byers",
    1,
    1,
    2016,
    "b9EkMc79ZSU",
    [
      "sci-fi",
      "horror"
    ],
    [],
    [
      "upside down"
    ],
    "Millie Bobby Brown"
  ],
  [
    "wire-pilot",
    "The Wire",
    "The Target",
    1,
    1,
    2002,
    "9qK-8eWQLuk",
    [
      "drama",
      "crime"
    ],
    [],
    [
      "all the pieces matter"
    ],
    "Dominic West"
  ],
  [
    "mad-men-smoke",
    "Mad Men",
    "Smoke Gets in Your Eyes",
    1,
    1,
    2007,
    "aWzlQ2Nmfss",
    [
      "drama"
    ],
    [],
    [],
    "Jon Hamm"
  ],
  [
    "succession-pilot",
    "Succession",
    "Celebration",
    1,
    1,
    2018,
    "tzeM8g3zQ_w",
    [
      "drama",
      "comedy"
    ],
    [],
    [
      "boar on the floor"
    ],
    "Brian Cox"
  ],
  [
    "the-bear-system",
    "The Bear",
    "System",
    1,
    1,
    2022,
    "y-lrL4aAe0g",
    [
      "drama",
      "comedy"
    ],
    [],
    [
      "yes chef"
    ],
    "Jeremy Allen White"
  ],
  [
    "better-call-saul",
    "Better Call Saul",
    "Uno",
    1,
    1,
    2015,
    "HN4oylgh0JQ",
    [
      "drama",
      "crime"
    ],
    [],
    [],
    "Bob Odenkirk"
  ],
  [
    "mandalorian",
    "The Mandalorian",
    "Chapter 1",
    1,
    1,
    2019,
    "aOC8E8z_ifw",
    [
      "sci-fi"
    ],
    [
      "Mando"
    ],
    [
      "this is the way"
    ],
    "Pedro Pascal"
  ],
  [
    "andor",
    "Andor",
    "Kassa",
    1,
    1,
    2022,
    "cKOegEuCcfw",
    [
      "sci-fi",
      "drama"
    ],
    [],
    [],
    "Diego Luna"
  ],
  [
    "last-of-us",
    "The Last of Us",
    "When You're Lost in the Darkness",
    1,
    1,
    2023,
    "uLtkt8BonwM",
    [
      "drama",
      "horror"
    ],
    [
      "TLOU"
    ],
    [],
    "Pedro Pascal"
  ],
  [
    "white-lotus",
    "The White Lotus",
    "Arrivals",
    1,
    1,
    2021,
    "TGLq7_ShaVA",
    [
      "comedy",
      "drama"
    ],
    [
      "White Lotus"
    ],
    [],
    "Murray Bartlett"
  ],
  [
    "ted-lasso",
    "Ted Lasso",
    "Pilot",
    1,
    1,
    2020,
    "3u7EIiohs6U",
    [
      "comedy"
    ],
    [],
    [
      "believe"
    ],
    "Jason Sudeikis"
  ],
  [
    "severance",
    "Severance",
    "Good News About Hell",
    1,
    1,
    2022,
    "xEO8U_h1-kE",
    [
      "sci-fi",
      "thriller"
    ],
    [],
    [
      "the work is mysterious"
    ],
    "Adam Scott"
  ],
  [
    "the-boys",
    "The Boys",
    "The Name of the Game",
    1,
    1,
    2019,
    "5SKQ7Q-JlA4",
    [
      "action",
      "comedy"
    ],
    [],
    [
      "homelander"
    ],
    "Karl Urban"
  ],
  [
    "black-mirror",
    "Black Mirror",
    "Fifteen Million Merits",
    1,
    2,
    2011,
    "nmawV1osUbI",
    [
      "sci-fi"
    ],
    [],
    [],
    "Daniel Kaluuya"
  ],
  [
    "sherlock",
    "Sherlock",
    "A Study in Pink",
    1,
    1,
    2010,
    "IrBUnPko4uw",
    [
      "mystery"
    ],
    [],
    [],
    "Benedict Cumberbatch"
  ],
  [
    "doctor-who",
    "Doctor Who",
    "Rose",
    1,
    1,
    2005,
    "1Mq1q6x3X0w",
    [
      "sci-fi"
    ],
    [],
    [],
    "Christopher Eccleston"
  ],
  [
    "x-files",
    "The X-Files",
    "Pilot",
    1,
    1,
    1993,
    "LYu618WRyL8",
    [
      "sci-fi",
      "mystery"
    ],
    [
      "X Files"
    ],
    [
      "the truth is out there"
    ],
    "David Duchovny"
  ],
  [
    "twin-peaks",
    "Twin Peaks",
    "Northwest Passage",
    1,
    1,
    1990,
    "KkywzH5PpxI",
    [
      "mystery"
    ],
    [],
    [
      "damn fine coffee"
    ],
    "Kyle MacLachlan"
  ],
  [
    "lost-pilot",
    "Lost",
    "Pilot",
    1,
    1,
    2004,
    "KTu8iDyh3CE",
    [
      "mystery",
      "drama"
    ],
    [],
    [
      "we have to go back"
    ],
    "Matthew Fox"
  ],
  [
    "battlestar",
    "Battlestar Galactica",
    "33",
    1,
    1,
    2004,
    "ZxHbfLLLJhw",
    [
      "sci-fi"
    ],
    [
      "BSG"
    ],
    [
      "so say we all"
    ],
    "Edward James Olmos"
  ],
  [
    "firefly",
    "Firefly",
    "Serenity",
    1,
    1,
    2002,
    "oBpr7OTkd9Y",
    [
      "sci-fi",
      "western"
    ],
    [],
    [
      "i aim to misbehave"
    ],
    "Nathan Fillion"
  ],
  [
    "buffy",
    "Buffy the Vampire Slayer",
    "Welcome to the Hellmouth",
    1,
    1,
    1997,
    "iH5JZ_qE6kI",
    [
      "fantasy",
      "comedy"
    ],
    [
      "Buffy"
    ],
    [],
    "Sarah Michelle Gellar"
  ],
  [
    "parks-and-rec",
    "Parks and Recreation",
    "Pilot",
    1,
    1,
    2009,
    "Tq8sZ-n6XJY",
    [
      "comedy",
      "sitcom"
    ],
    [
      "Parks and Rec"
    ],
    [
      "treat yo self"
    ],
    "Amy Poehler"
  ],
  [
    "brooklyn-99",
    "Brooklyn Nine-Nine",
    "Pilot",
    1,
    1,
    2013,
    "sEOuJ4z5aTc",
    [
      "comedy",
      "sitcom"
    ],
    [
      "B99",
      "Brooklyn 99"
    ],
    [
      "noice"
    ],
    "Andy Samberg"
  ],
  [
    "community",
    "Community",
    "Pilot",
    1,
    1,
    2009,
    "Y_B6zW5kYcI",
    [
      "comedy",
      "sitcom"
    ],
    [],
    [
      "six seasons and a movie"
    ],
    "Joel McHale"
  ],
  [
    "arrested",
    "Arrested Development",
    "Pilot",
    1,
    1,
    2003,
    "vzU8i5moFQk",
    [
      "comedy",
      "sitcom"
    ],
    [],
    [
      "ive made a huge mistake"
    ],
    "Jason Bateman"
  ],
  [
    "always-sunny",
    "It's Always Sunny in Philadelphia",
    "The Gang Gets Racist",
    1,
    1,
    2005,
    "iK0h39IRbK0",
    [
      "comedy"
    ],
    [
      "Always Sunny",
      "IASIP"
    ],
    [],
    "Charlie Day"
  ],
  [
    "simpsons-bart",
    "The Simpsons",
    "Simpsons Roasting on an Open Fire",
    1,
    1,
    1989,
    "XqZsoesa55w",
    [
      "comedy",
      "animation"
    ],
    [
      "Simpsons"
    ],
    [
      "doh"
    ],
    "Dan Castellaneta"
  ],
  [
    "south-park",
    "South Park",
    "Cartman Gets an Anal Probe",
    1,
    1,
    1997,
    "3X7g1yY6vQ0",
    [
      "comedy",
      "animation"
    ],
    [],
    [
      "oh my god they killed kenny"
    ],
    []
  ],
  [
    "family-guy",
    "Family Guy",
    "Death Has a Shadow",
    1,
    1,
    1999,
    "2FvZcKrE1ZU",
    [
      "comedy",
      "animation"
    ],
    [],
    [],
    "Seth MacFarlane"
  ],
  [
    "rick-morty",
    "Rick and Morty",
    "Pilot",
    1,
    1,
    2013,
    "_uU9dqUw0V4",
    [
      "comedy",
      "sci-fi",
      "animation"
    ],
    [],
    [
      "wubba lubba dub dub"
    ],
    "Justin Roiland"
  ],
  [
    "bojack",
    "BoJack Horseman",
    "BoJack Horseman: The BoJack Horseman Story, Chapter One",
    1,
    1,
    2014,
    "iWEqMx08HRc",
    [
      "comedy",
      "animation",
      "drama"
    ],
    [
      "Bojack"
    ],
    [],
    "Will Arnett"
  ],
  [
    "arcane",
    "Arcane",
    "Welcome to the Playground",
    1,
    1,
    2021,
    "fXmAurh69xk",
    [
      "animation",
      "action"
    ],
    [],
    [],
    []
  ],
  [
    "squid-game",
    "Squid Game",
    "Red Light, Green Light",
    1,
    1,
    2021,
    "oqxAJTy0YqE",
    [
      "thriller"
    ],
    [],
    [
      "red light green light"
    ],
    "Lee Jung-jae"
  ],
  [
    "wednesday",
    "Wednesday",
    "Wednesday's Child Is Full of Woe",
    1,
    1,
    2022,
    "Q73Ot-yTYmI",
    [
      "comedy",
      "fantasy"
    ],
    [],
    [
      "dance scene"
    ],
    "Jenna Ortega"
  ],
  [
    "witcher",
    "The Witcher",
    "The End's Beginning",
    1,
    1,
    2019,
    "ndl1W4ltcmg",
    [
      "fantasy"
    ],
    [],
    [
      "toss a coin"
    ],
    "Henry Cavill"
  ],
  [
    "house-of-dragon",
    "House of the Dragon",
    "The Heirs of the Dragon",
    1,
    1,
    2022,
    "DotnJ7tTA34",
    [
      "fantasy"
    ],
    [
      "HOTD"
    ],
    [],
    "Matt Smith"
  ],
  [
    "rings-of-power",
    "The Lord of the Rings: The Rings of Power",
    "A Shadow of the Past",
    1,
    1,
    2022,
    "x8UAU9j7eDM",
    [
      "fantasy"
    ],
    [
      "Rings of Power"
    ],
    [],
    []
  ],
  [
    "crown",
    "The Crown",
    "Wolferton Splash",
    1,
    1,
    2016,
    "JWtnJZn6-dI",
    [
      "drama"
    ],
    [],
    [],
    "Claire Foy"
  ],
  [
    "chernobyl",
    "Chernobyl",
    "1:23:45",
    1,
    1,
    2019,
    "s9APLXM9Ei8",
    [
      "drama"
    ],
    [],
    [],
    "Jared Harris"
  ],
  [
    "band-of-brothers",
    "Band of Brothers",
    "Currahee",
    1,
    1,
    2001,
    "FFH2_8P8fgI",
    [
      "war",
      "drama"
    ],
    [],
    [],
    "Damian Lewis"
  ],
  [
    "true-detective",
    "True Detective",
    "The Long Bright Dark",
    1,
    1,
    2014,
    "fVQUtkJ3-wU",
    [
      "crime",
      "drama"
    ],
    [],
    [
      "time is a flat circle"
    ],
    "Matthew McConaughey"
  ],
  [
    "fargo-tv",
    "Fargo",
    "The Crocodile's Dilemma",
    1,
    1,
    2014,
    "gN5cZfP9mK4",
    [
      "crime",
      "drama"
    ],
    [
      "Fargo TV"
    ],
    [],
    "Billy Bob Thornton"
  ],
  [
    "westworld",
    "Westworld",
    "The Original",
    1,
    1,
    2016,
    "kP4k9K5qtRs",
    [
      "sci-fi",
      "western"
    ],
    [],
    [
      "these violent delights"
    ],
    "Evan Rachel Wood"
  ],
  [
    "handmaids",
    "The Handmaid's Tale",
    "Offred",
    1,
    1,
    2017,
    "dN1t_vPlh4s",
    [
      "drama"
    ],
    [
      "Handmaids Tale"
    ],
    [
      "blessed be the fruit"
    ],
    "Elisabeth Moss"
  ],
  [
    "house-of-cards",
    "House of Cards",
    "Chapter 1",
    1,
    1,
    2013,
    "8Qn_spdM5Zg",
    [
      "drama"
    ],
    [],
    [],
    "Kevin Spacey"
  ],
  [
    "narcos",
    "Narcos",
    "Descenso",
    1,
    1,
    2015,
    "U7elNhHwgBU",
    [
      "crime",
      "drama"
    ],
    [],
    [
      "plata o plomo"
    ],
    "Wagner Moura"
  ],
  [
    "money-heist",
    "Money Heist",
    "Episode 1",
    1,
    1,
    2017,
    "p_PJbmrX4uk",
    [
      "crime"
    ],
    [
      "La Casa de Papel"
    ],
    [
      "bella ciao"
    ],
    "Úrsula Corberó"
  ],
  [
    "dark",
    "Dark",
    "Secrets",
    1,
    1,
    2017,
    "ESEUoa-mz2c",
    [
      "sci-fi",
      "mystery"
    ],
    [],
    [],
    "Louis Hofmann"
  ],
  [
    "fallout-tv",
    "Fallout",
    "The End",
    1,
    1,
    2024,
    "V-mugKDQ3H0",
    [
      "sci-fi"
    ],
    [],
    [
      "war never changes"
    ],
    "Ella Purnell"
  ],
  [
    "shogun",
    "Shōgun",
    "Anjin",
    1,
    1,
    2024,
    "AMIEBSmAhb4",
    [
      "drama"
    ],
    [
      "Shogun"
    ],
    [],
    "Hiroyuki Sanada"
  ],
  [
    "invincible",
    "Invincible",
    "It's About Time",
    1,
    1,
    2021,
    "0dkUN0aS2d8",
    [
      "animation",
      "action"
    ],
    [],
    [
      "think mark"
    ],
    "Steven Yeun"
  ],
  [
    "the-penguin",
    "The Penguin",
    "After Hours",
    1,
    1,
    2024,
    "p5GoQUlV7SY",
    [
      "crime",
      "drama"
    ],
    [
      "Penguin"
    ],
    [],
    "Colin Farrell"
  ],
  [
    "friends-pilot",
    "Friends",
    "The One Where Monica Gets a Roommate",
    1,
    1,
    1994,
    "qS4n5qCr7pQ",
    [
      "comedy",
      "sitcom"
    ],
    [],
    [
      "how you doin"
    ],
    "Jennifer Aniston"
  ],
  [
    "seinfeld-pilot",
    "Seinfeld",
    "The Seinfeld Chronicles",
    1,
    1,
    1989,
    "6bKn5O4P6qk",
    [
      "comedy",
      "sitcom"
    ],
    [],
    [
      "yada yada"
    ],
    "Jerry Seinfeld"
  ],
  [
    "wire-old-cases",
    "The Wire",
    "Old Cases",
    1,
    4,
    2002,
    "9qK-8eWQLuk",
    [
      "drama",
      "crime"
    ],
    [],
    [
      "you come at the king"
    ],
    "Dominic West"
  ],
  [
    "sopranos-pilot",
    "The Sopranos",
    "The Sopranos",
    1,
    1,
    1999,
    "K0SKbuxAUj4",
    [
      "drama",
      "crime"
    ],
    [],
    [],
    "James Gandolfini"
  ],
  [
    "breaking-bad-pilot",
    "Breaking Bad",
    "Pilot",
    1,
    1,
    2008,
    "HhesaQXLuRY",
    [
      "drama",
      "crime"
    ],
    [],
    [
      "i am the one who knocks"
    ],
    "Bryan Cranston"
  ],
  [
    "breaking-bad-one",
    "Breaking Bad",
    "Ozymandias",
    5,
    14,
    2013,
    "yDms9n6lw1Q",
    [
      "drama",
      "crime"
    ],
    [
      "Ozymandias"
    ],
    [],
    "Bryan Cranston"
  ],
  [
    "better-call-saul-winner",
    "Better Call Saul",
    "Winner",
    4,
    10,
    2018,
    "HN4oylgh0JQ",
    [
      "drama",
      "crime"
    ],
    [],
    [],
    "Bob Odenkirk"
  ],
  [
    "office-pilot",
    "The Office",
    "Pilot",
    1,
    1,
    2005,
    "DYu_bGbZiiQ",
    [
      "comedy",
      "sitcom"
    ],
    [],
    [],
    "Steve Carell"
  ],
  [
    "office-stress-relief",
    "The Office",
    "Stress Relief",
    5,
    14,
    2009,
    "RNlAu8aGDcE",
    [
      "comedy",
      "sitcom"
    ],
    [],
    [
      "fire drill"
    ],
    "Steve Carell"
  ],
  [
    "parks-harvest",
    "Parks and Recreation",
    "Harvest Festival",
    3,
    7,
    2010,
    "Tq8sZ-n6XJY",
    [
      "comedy",
      "sitcom"
    ],
    [],
    [],
    "Amy Poehler"
  ],
  [
    "b99-mlep",
    "Brooklyn Nine-Nine",
    "M.E. Time",
    1,
    4,
    2013,
    "sEOuJ4z5aTc",
    [
      "comedy",
      "sitcom"
    ],
    [],
    [],
    "Andy Samberg"
  ],
  [
    "community-modern-warfare",
    "Community",
    "Modern Warfare",
    1,
    23,
    2010,
    "Y_B6zW5kYcI",
    [
      "comedy",
      "sitcom"
    ],
    [],
    [
      "paintball"
    ],
    "Joel McHale"
  ],
  [
    "always-sunny-chardee",
    "It's Always Sunny in Philadelphia",
    "The Gang Recycles Their Trash",
    8,
    2,
    2012,
    "iK0h39IRbK0",
    [
      "comedy"
    ],
    [],
    [
      "chardee macdennis"
    ],
    "Charlie Day"
  ],
  [
    "arrested-chicken",
    "Arrested Development",
    "Pier Pressure",
    1,
    10,
    2003,
    "vzU8i5moFQk",
    [
      "comedy",
      "sitcom"
    ],
    [],
    [],
    "Jason Bateman"
  ],
  [
    "succession-boar",
    "Succession",
    "Hunting",
    2,
    3,
    2019,
    "tzeM8g3zQ_w",
    [
      "drama",
      "comedy"
    ],
    [],
    [
      "boar on the floor"
    ],
    "Brian Cox"
  ],
  [
    "succession-finale",
    "Succession",
    "With Open Eyes",
    4,
    10,
    2023,
    "tzeM8g3zQ_w",
    [
      "drama"
    ],
    [],
    [],
    "Brian Cox"
  ],
  [
    "mad-men-the-wheel",
    "Mad Men",
    "The Wheel",
    1,
    13,
    2007,
    "aWzlQ2Nmfss",
    [
      "drama"
    ],
    [],
    [
      "carousel"
    ],
    "Jon Hamm"
  ],
  [
    "got-red-wedding",
    "Game of Thrones",
    "The Rains of Castamere",
    3,
    9,
    2013,
    "KPLWWIOCOOQ",
    [
      "fantasy",
      "drama"
    ],
    [
      "Red Wedding"
    ],
    [
      "red wedding"
    ],
    "Richard Madden"
  ],
  [
    "got-battle-bastards",
    "Game of Thrones",
    "Battle of the Bastards",
    6,
    9,
    2016,
    "KPLWWIOCOOQ",
    [
      "fantasy",
      "drama"
    ],
    [],
    [],
    "Kit Harington"
  ],
  [
    "andor-one-way",
    "Andor",
    "One Way Out",
    1,
    10,
    2022,
    "cKOegEuCcfw",
    [
      "sci-fi",
      "drama"
    ],
    [],
    [
      "one way out"
    ],
    "Andy Serkis"
  ],
  [
    "mandalorian-baby",
    "The Mandalorian",
    "The Rescue",
    2,
    8,
    2020,
    "aOC8E8z_ifw",
    [
      "sci-fi"
    ],
    [],
    [
      "this is the way"
    ],
    "Pedro Pascal"
  ],
  [
    "last-of-us-long-long",
    "The Last of Us",
    "Long, Long Time",
    1,
    3,
    2023,
    "uLtkt8BonwM",
    [
      "drama",
      "horror"
    ],
    [],
    [],
    "Nick Offerman"
  ],
  [
    "bear-fishes",
    "The Bear",
    "Fishes",
    2,
    6,
    2023,
    "y-lrL4aAe0g",
    [
      "drama",
      "comedy"
    ],
    [],
    [],
    "Jeremy Allen White"
  ],
  [
    "severance-defiant",
    "Severance",
    "Defiant Jazz",
    1,
    7,
    2022,
    "xEO8U_h1-kE",
    [
      "sci-fi",
      "thriller"
    ],
    [],
    [],
    "Adam Scott"
  ],
  [
    "boys-herogasm",
    "The Boys",
    "Herogasm",
    3,
    6,
    2022,
    "5SKQ7Q-JlA4",
    [
      "action",
      "comedy"
    ],
    [],
    [],
    "Karl Urban"
  ],
  [
    "invincible-s1e8",
    "Invincible",
    "Where I Really Come From",
    1,
    8,
    2021,
    "0dkUN0aS2d8",
    [
      "animation",
      "action"
    ],
    [],
    [
      "think mark"
    ],
    "Steven Yeun"
  ],
  [
    "arcane-oil-water",
    "Arcane",
    "When These Walls Come Tumbling Down",
    1,
    7,
    2021,
    "fXmAurh69xk",
    [
      "animation",
      "action"
    ],
    [],
    [],
    []
  ],
  [
    "rick-rick-potion",
    "Rick and Morty",
    "Rick Potion #9",
    1,
    6,
    2014,
    "_uU9dqUw0V4",
    [
      "comedy",
      "sci-fi",
      "animation"
    ],
    [],
    [],
    "Justin Roiland"
  ],
  [
    "bojack-free-churro",
    "BoJack Horseman",
    "Free Churro",
    5,
    6,
    2018,
    "iWEqMx08HRc",
    [
      "comedy",
      "animation",
      "drama"
    ],
    [],
    [],
    "Will Arnett"
  ],
  [
    "simpsons-last-exit",
    "The Simpsons",
    "Last Exit to Springfield",
    4,
    17,
    1993,
    "XqZsoesa55w",
    [
      "comedy",
      "animation"
    ],
    [],
    [],
    "Dan Castellaneta"
  ],
  [
    "simpsons-homer-enemy",
    "The Simpsons",
    "Homer's Enemy",
    8,
    23,
    1997,
    "XqZsoesa55w",
    [
      "comedy",
      "animation"
    ],
    [],
    [
      "frank grimes"
    ],
    "Dan Castellaneta"
  ],
  [
    "south-park-scott",
    "South Park",
    "Scott Tenorman Must Die",
    5,
    4,
    2001,
    "3X7g1yY6vQ0",
    [
      "comedy",
      "animation"
    ],
    [],
    [],
    []
  ],
  [
    "always-sunny-dennis-system",
    "It's Always Sunny in Philadelphia",
    "The D.E.N.N.I.S. System",
    5,
    10,
    2009,
    "iK0h39IRbK0",
    [
      "comedy"
    ],
    [],
    [],
    "Charlie Day"
  ],
  [
    "seinfeld-contest",
    "Seinfeld",
    "The Contest",
    4,
    11,
    1992,
    "6bKn5O4P6qk",
    [
      "comedy",
      "sitcom"
    ],
    [],
    [
      "master of my domain"
    ],
    "Jerry Seinfeld"
  ],
  [
    "seinfeld-soup-nazi",
    "Seinfeld",
    "The Soup Nazi",
    7,
    6,
    1995,
    "6bKn5O4P6qk",
    [
      "comedy",
      "sitcom"
    ],
    [],
    [
      "no soup for you"
    ],
    "Jerry Seinfeld"
  ],
  [
    "friends-ones-after-superbowl",
    "Friends",
    "The One After the Superbowl",
    2,
    12,
    1996,
    "qS4n5qCr7pQ",
    [
      "comedy",
      "sitcom"
    ],
    [],
    [],
    "Jennifer Aniston"
  ],
  [
    "friends-the-one-unagi",
    "Friends",
    "The One with Unagi",
    6,
    17,
    2000,
    "qS4n5qCr7pQ",
    [
      "comedy",
      "sitcom"
    ],
    [],
    [
      "unagi"
    ],
    "Jennifer Aniston"
  ],
  [
    "xfiles-clyde-bruckman",
    "The X-Files",
    "Clyde Bruckman's Final Repose",
    3,
    4,
    1995,
    "LYu618WRyL8",
    [
      "sci-fi",
      "mystery"
    ],
    [],
    [],
    "David Duchovny"
  ],
  [
    "twin-peaks-ep14",
    "Twin Peaks",
    "Lonely Souls",
    2,
    7,
    1990,
    "KkywzH5PpxI",
    [
      "mystery"
    ],
    [],
    [],
    "Kyle MacLachlan"
  ],
  [
    "lost-constant",
    "Lost",
    "The Constant",
    4,
    5,
    2008,
    "KTu8iDyh3CE",
    [
      "mystery",
      "drama"
    ],
    [],
    [],
    "Matthew Fox"
  ],
  [
    "lost-through-looking",
    "Lost",
    "Through the Looking Glass",
    3,
    22,
    2007,
    "KTu8iDyh3CE",
    [
      "mystery",
      "drama"
    ],
    [],
    [],
    "Matthew Fox"
  ],
  [
    "bsg-exodus",
    "Battlestar Galactica",
    "Exodus",
    3,
    4,
    2006,
    "ZxHbfLLLJhw",
    [
      "sci-fi"
    ],
    [],
    [],
    "Edward James Olmos"
  ],
  [
    "firefly-objects",
    "Firefly",
    "Objects in Space",
    1,
    14,
    2002,
    "oBpr7OTkd9Y",
    [
      "sci-fi",
      "western"
    ],
    [],
    [],
    "Nathan Fillion"
  ],
  [
    "buffy-the-body",
    "Buffy the Vampire Slayer",
    "The Body",
    5,
    16,
    2001,
    "iH5JZ_qE6kI",
    [
      "fantasy",
      "drama"
    ],
    [],
    [],
    "Sarah Michelle Gellar"
  ],
  [
    "buffy-once-more",
    "Buffy the Vampire Slayer",
    "Once More, with Feeling",
    6,
    7,
    2001,
    "iH5JZ_qE6kI",
    [
      "fantasy",
      "musical"
    ],
    [],
    [
      "musical episode"
    ],
    "Sarah Michelle Gellar"
  ],
  [
    "doctor-who-blink",
    "Doctor Who",
    "Blink",
    3,
    10,
    2007,
    "1Mq1q6x3X0w",
    [
      "sci-fi"
    ],
    [],
    [
      "dont blink",
      "weeping angels"
    ],
    "David Tennant"
  ],
  [
    "doctor-who-midnight",
    "Doctor Who",
    "Midnight",
    4,
    8,
    2008,
    "1Mq1q6x3X0w",
    [
      "sci-fi"
    ],
    [],
    [],
    "David Tennant"
  ],
  [
    "sherlock-reichenbach",
    "Sherlock",
    "The Reichenbach Fall",
    2,
    3,
    2012,
    "IrBUnPko4uw",
    [
      "mystery"
    ],
    [],
    [],
    "Benedict Cumberbatch"
  ],
  [
    "true-detective-who-goes",
    "True Detective",
    "Who Goes There",
    1,
    4,
    2014,
    "fVQUtkJ3-wU",
    [
      "crime",
      "drama"
    ],
    [],
    [
      "six minute tracking shot"
    ],
    "Matthew McConaughey"
  ],
  [
    "fargo-tv-buridan",
    "Fargo",
    "Buridan's Ass",
    1,
    6,
    2014,
    "gN5cZfP9mK4",
    [
      "crime",
      "drama"
    ],
    [],
    [],
    "Billy Bob Thornton"
  ],
  [
    "westworld-trace-decay",
    "Westworld",
    "Trace Decay",
    1,
    8,
    2016,
    "kP4k9K5qtRs",
    [
      "sci-fi",
      "western"
    ],
    [],
    [],
    "Evan Rachel Wood"
  ],
  [
    "black-mirror-san-junipero",
    "Black Mirror",
    "San Junipero",
    3,
    4,
    2016,
    "nmawV1osUbI",
    [
      "sci-fi"
    ],
    [],
    [],
    []
  ],
  [
    "black-mirror-uss-callister",
    "Black Mirror",
    "USS Callister",
    4,
    1,
    2017,
    "nmawV1osUbI",
    [
      "sci-fi"
    ],
    [],
    [],
    "Jesse Plemons"
  ],
  [
    "handmaids-night",
    "The Handmaid's Tale",
    "Night",
    1,
    10,
    2017,
    "dN1t_vPlh4s",
    [
      "drama"
    ],
    [],
    [],
    "Elisabeth Moss"
  ],
  [
    "crown-aberfan",
    "The Crown",
    "Aberfan",
    3,
    3,
    2019,
    "JWtnJZn6-dI",
    [
      "drama"
    ],
    [],
    [],
    "Olivia Colman"
  ],
  [
    "chernobyl-open-wide",
    "Chernobyl",
    "Open Wide, O Earth",
    1,
    3,
    2019,
    "s9APLXM9Ei8",
    [
      "drama"
    ],
    [],
    [],
    "Jared Harris"
  ],
  [
    "band-of-brothers-bastogne",
    "Band of Brothers",
    "Bastogne",
    1,
    6,
    2001,
    "FFH2_8P8fgI",
    [
      "war",
      "drama"
    ],
    [],
    [],
    "Damian Lewis"
  ],
  [
    "shogun-crimson-sky",
    "Shōgun",
    "Crimson Sky",
    1,
    9,
    2024,
    "AMIEBSmAhb4",
    [
      "drama"
    ],
    [
      "Shogun"
    ],
    [],
    "Hiroyuki Sanada"
  ],
  [
    "fallout-the-head",
    "Fallout",
    "The Head",
    1,
    2,
    2024,
    "V-mugKDQ3H0",
    [
      "sci-fi"
    ],
    [],
    [],
    "Ella Purnell"
  ],
  [
    "penguin-cent-urion",
    "The Penguin",
    "Cent’Anni",
    1,
    7,
    2024,
    "p5GoQUlV7SY",
    [
      "crime",
      "drama"
    ],
    [],
    [],
    "Colin Farrell"
  ],
  [
    "white-lotus-s2",
    "The White Lotus",
    "Ciao",
    2,
    7,
    2022,
    "TGLq7_ShaVA",
    [
      "comedy",
      "drama"
    ],
    [],
    [],
    "Jennifer Coolidge"
  ],
  [
    "white-lotus-s3",
    "The White Lotus",
    "Full Moon",
    3,
    1,
    2025,
    "TGLq7_ShaVA",
    [
      "comedy",
      "drama"
    ],
    [],
    [],
    "Walton Goggins"
  ],
  [
    "ted-lasso-rainbow",
    "Ted Lasso",
    "Rainbow",
    2,
    5,
    2021,
    "3u7EIiohs6U",
    [
      "comedy"
    ],
    [],
    [],
    "Jason Sudeikis"
  ],
  [
    "only-murders",
    "Only Murders in the Building",
    "True Crime",
    1,
    1,
    2021,
    "bADtQA7aKls",
    [
      "comedy",
      "mystery"
    ],
    [],
    [],
    "Steve Martin"
  ],
  [
    "wednesday-woe",
    "Wednesday",
    "A Murder of Woes",
    1,
    8,
    2022,
    "Q73Ot-yTYmI",
    [
      "comedy",
      "fantasy"
    ],
    [],
    [],
    "Jenna Ortega"
  ],
  [
    "squid-game-gganbu",
    "Squid Game",
    "Gganbu",
    1,
    6,
    2021,
    "oqxAJTy0YqE",
    [
      "thriller"
    ],
    [],
    [],
    "Lee Jung-jae"
  ],
  [
    "dark-alpha-omega",
    "Dark",
    "Alpha and Omega",
    2,
    8,
    2019,
    "ESEUoa-mz2c",
    [
      "sci-fi",
      "mystery"
    ],
    [],
    [],
    "Louis Hofmann"
  ],
  [
    "money-heist-bella",
    "Money Heist",
    "Bella ciao",
    1,
    5,
    2017,
    "p_PJbmrX4uk",
    [
      "crime"
    ],
    [],
    [
      "bella ciao"
    ],
    "Úrsula Corberó"
  ],
  [
    "narcos-exploding-dolls",
    "Narcos",
    "Explosivos",
    1,
    6,
    2015,
    "U7elNhHwgBU",
    [
      "crime",
      "drama"
    ],
    [],
    [],
    "Wagner Moura"
  ],
  [
    "witcher-rare-species",
    "The Witcher",
    "Rare Species",
    1,
    6,
    2019,
    "ndl1W4ltcmg",
    [
      "fantasy"
    ],
    [],
    [],
    "Henry Cavill"
  ],
  [
    "house-dragon-green",
    "House of the Dragon",
    "The Green Council",
    1,
    9,
    2022,
    "DotnJ7tTA34",
    [
      "fantasy"
    ],
    [],
    [],
    "Paddy Considine"
  ],
  [
    "rings-power-alloyed",
    "The Lord of the Rings: The Rings of Power",
    "Alloyed",
    1,
    8,
    2022,
    "x8UAU9j7eDM",
    [
      "fantasy"
    ],
    [],
    [],
    []
  ],
  [
    "stranger-things-upside",
    "Stranger Things",
    "The Upside Down",
    1,
    8,
    2016,
    "b9EkMc79ZSU",
    [
      "sci-fi",
      "horror"
    ],
    [],
    [],
    "Millie Bobby Brown"
  ],
  [
    "stranger-things-piggyback",
    "Stranger Things",
    "The Piggyback",
    4,
    9,
    2022,
    "b9EkMc79ZSU",
    [
      "sci-fi",
      "horror"
    ],
    [],
    [],
    "Millie Bobby Brown"
  ]
];

module.exports = { MOVIES, TV };
