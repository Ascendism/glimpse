successfully downloaded text file (SHA: 7690eb64002b49874d6b91df8764c97609bb25f7)

'use strict';

const SONGS = [
  [
    "metallica-enter-sandman",
    "Enter Sandman",
    "Metallica",
    1991,
    "CD-EBM7QAM0",
    [
      "metal"
    ],
    [
      "Sandman",
      "Enter the Sandman"
    ],
    [
      "exit light enter night"
    ]
  ],
  [
    "tbdm-horrible-night",
    "What a Horrible Night to Have a Curse",
    "The Black Dahlia Murder",
    2007,
    "mEACzoMJuMA",
    [
      "metal"
    ],
    [
      "Horrible Night"
    ],
    [
      "castlevania quote metal"
    ]
  ],
  [
    "darude-sandstorm",
    "Sandstorm",
    "Darude",
    1999,
    "y6120QOlsfU",
    [
      "electronic"
    ],
    [
      "Sand Storm"
    ],
    [
      "dudududu",
      "dududududu"
    ]
  ],
  [
    "queen-bohemian",
    "Bohemian Rhapsody",
    "Queen",
    1975,
    "fJ9rUzIMcZQ",
    [
      "rock"
    ],
    [
      "Bohemian Rap City"
    ],
    [
      "galileo figaro",
      "mama just killed a man"
    ]
  ],
  [
    "nirvana-smells",
    "Smells Like Teen Spirit",
    "Nirvana",
    1991,
    "hTWKbfoikeg",
    [
      "grunge",
      "rock"
    ],
    [
      "Teen Spirit"
    ],
    [
      "hello hello hello"
    ]
  ],
  [
    "rick-astley-nggyu",
    "Never Gonna Give You Up",
    "Rick Astley",
    1987,
    "dQw4w9WgXcQ",
    [
      "pop"
    ],
    [
      "Rickroll"
    ],
    [
      "never gonna let you down"
    ]
  ],
  [
    "guns-sweet-child",
    "Sweet Child O Mine",
    "Guns N' Roses",
    1987,
    "1w7OgIMMRc4",
    [
      "rock"
    ],
    [
      "Sweet Child O' Mine"
    ],
    [
      "where do we go now"
    ]
  ],
  [
    "guns-november-rain",
    "November Rain",
    "Guns N' Roses",
    1992,
    "8SbUC-UaAxE",
    [
      "rock"
    ],
    [],
    [
      "nothing lasts forever"
    ]
  ],
  [
    "acdc-thunderstruck",
    "Thunderstruck",
    "AC/DC",
    1990,
    "v2AC41dglnM",
    [
      "rock"
    ],
    [],
    [
      "thunder"
    ]
  ],
  [
    "acdc-highway",
    "Highway to Hell",
    "AC/DC",
    1979,
    "l482T0yNkeo",
    [
      "rock"
    ],
    [],
    [
      "highway to hell"
    ]
  ],
  [
    "acdc-back-in-black",
    "Back in Black",
    "AC/DC",
    1980,
    "pAgn71qQeE0",
    [
      "rock"
    ],
    [],
    [
      "back in black"
    ]
  ],
  [
    "mj-thriller",
    "Thriller",
    "Michael Jackson",
    1983,
    "sOnqjkJTMaA",
    [
      "pop"
    ],
    [],
    [
      "creature of the night"
    ]
  ],
  [
    "mj-beat-it",
    "Beat It",
    "Michael Jackson",
    1983,
    "oRdxUFDoQe0",
    [
      "pop"
    ],
    [],
    [
      "beat it"
    ]
  ],
  [
    "mj-billie-jean",
    "Billie Jean",
    "Michael Jackson",
    1983,
    "Zi_mjVAcZ1A",
    [
      "pop"
    ],
    [],
    [
      "not my lover"
    ]
  ],
  [
    "aerosmith-dream-on",
    "Dream On",
    "Aerosmith",
    1973,
    "69RdQFDuYPI",
    [
      "rock"
    ],
    [],
    [
      "dream on"
    ]
  ],
  [
    "bon-jovi-prayer",
    "Livin' on a Prayer",
    "Bon Jovi",
    1986,
    "lDK9QqIzhwk",
    [
      "rock"
    ],
    [
      "Living on a Prayer"
    ],
    [
      "whoa we are halfway there"
    ]
  ],
  [
    "journey-dont-stop",
    "Don't Stop Believin'",
    "Journey",
    1981,
    "1k8craCGpgs",
    [
      "rock"
    ],
    [
      "Dont Stop Believing"
    ],
    [
      "just a small town girl"
    ]
  ],
  [
    "survivor-eye-tiger",
    "Eye of the Tiger",
    "Survivor",
    1982,
    "btPJPFnesV4",
    [
      "rock"
    ],
    [],
    [
      "rising up to the challenge"
    ]
  ],
  [
    "europe-final-countdown",
    "The Final Countdown",
    "Europe",
    1986,
    "9jK-NcRmVcw",
    [
      "rock"
    ],
    [],
    [
      "final countdown"
    ]
  ],
  [
    "toto-africa",
    "Africa",
    "Toto",
    1982,
    "FTQbiNvZqaY",
    [
      "rock",
      "pop"
    ],
    [],
    [
      "gonna take some time to do"
    ]
  ],
  [
    "a-ha-take-on-me",
    "Take On Me",
    "a-ha",
    1985,
    "djV11Xbc914",
    [
      "pop"
    ],
    [
      "Take On Me"
    ],
    [
      "take on me"
    ]
  ],
  [
    "tears-rule-world",
    "Everybody Wants to Rule the World",
    "Tears for Fears",
    1985,
    "aGCdLKXNF3w",
    [
      "pop"
    ],
    [],
    [
      "rule the world"
    ]
  ],
  [
    "eurythmics-sweet-dreams",
    "Sweet Dreams (Are Made of This)",
    "Eurythmics",
    1983,
    "qeMFqkcPYcg",
    [
      "pop"
    ],
    [
      "Sweet Dreams"
    ],
    [
      "sweet dreams are made of this"
    ]
  ],
  [
    "madonna-like-a-prayer",
    "Like a Prayer",
    "Madonna",
    1989,
    "79fzeNUqQbQ",
    [
      "pop"
    ],
    [],
    [
      "like a prayer"
    ]
  ],
  [
    "madonna-vogue",
    "Vogue",
    "Madonna",
    1990,
    "GuJQSAiODqI",
    [
      "pop"
    ],
    [],
    [
      "strike a pose"
    ]
  ],
  [
    "prince-kiss",
    "Kiss",
    "Prince",
    1986,
    "H9tEvfIsDyo",
    [
      "funk",
      "pop"
    ],
    [],
    [
      "you dont have to be beautiful"
    ]
  ],
  [
    "prince-purple-rain",
    "Purple Rain",
    "Prince",
    1984,
    "TvnYmWpD_T8",
    [
      "rock",
      "pop"
    ],
    [],
    [
      "purple rain"
    ]
  ],
  [
    "whitney-i-will-always",
    "I Will Always Love You",
    "Whitney Houston",
    1992,
    "3JWTaaS7LdU",
    [
      "pop"
    ],
    [],
    [
      "i will always love you"
    ]
  ],
  [
    "whitney-i-wanna-dance",
    "I Wanna Dance with Somebody",
    "Whitney Houston",
    1987,
    "eH3giaIzONA",
    [
      "pop"
    ],
    [],
    [
      "dance with somebody"
    ]
  ],
  [
    "celine-titanic",
    "My Heart Will Go On",
    "Celine Dion",
    1997,
    "3gKPpxYFvU0",
    [
      "pop"
    ],
    [
      "Titanic song"
    ],
    [
      "near far wherever you are"
    ]
  ],
  [
    "abba-dancing-queen",
    "Dancing Queen",
    "ABBA",
    1976,
    "xFrGuyw1V8s",
    [
      "pop"
    ],
    [],
    [
      "dancing queen"
    ]
  ],
  [
    "beegees-stayin-alive",
    "Stayin' Alive",
    "Bee Gees",
    1977,
    "I_izvAbhExY",
    [
      "disco"
    ],
    [
      "Staying Alive"
    ],
    [
      "ah ah ah ah stayin alive"
    ]
  ],
  [
    "earth-wind-september",
    "September",
    "Earth, Wind & Fire",
    1978,
    "Gs069dnK2U4",
    [
      "disco",
      "funk"
    ],
    [],
    [
      "ba de ya"
    ]
  ],
  [
    "village-ymca",
    "Y.M.C.A.",
    "Village People",
    1978,
    "CS9OO0S5w2k",
    [
      "disco"
    ],
    [
      "YMCA"
    ],
    [
      "young man"
    ]
  ],
  [
    "queen-we-will-rock-you",
    "We Will Rock You",
    "Queen",
    1977,
    "-tJYN-eG1zk",
    [
      "rock"
    ],
    [],
    [
      "we will we will rock you"
    ]
  ],
  [
    "queen-we-are-champions",
    "We Are the Champions",
    "Queen",
    1977,
    "04854XqcfCY",
    [
      "rock"
    ],
    [],
    [
      "we are the champions"
    ]
  ],
  [
    "beatles-hey-jude",
    "Hey Jude",
    "The Beatles",
    1968,
    "A_MjCqQoLLA",
    [
      "rock"
    ],
    [],
    [
      "hey jude"
    ]
  ],
  [
    "beatles-let-it-be",
    "Let It Be",
    "The Beatles",
    1970,
    "QDYfEBY9NM4",
    [
      "rock"
    ],
    [],
    [
      "let it be"
    ]
  ],
  [
    "beatles-yesterday",
    "Yesterday",
    "The Beatles",
    1965,
    "NrgmdOz227I",
    [
      "rock"
    ],
    [],
    [
      "yesterday"
    ]
  ],
  [
    "rolling-satisfaction",
    "(I Cannot Get No) Satisfaction",
    "The Rolling Stones",
    1965,
    "nrIPxlFzDi0",
    [
      "rock"
    ],
    [
      "Satisfaction"
    ],
    [
      "cannot get no satisfaction"
    ]
  ],
  [
    "doors-light-my-fire",
    "Light My Fire",
    "The Doors",
    1967,
    "mbq3bhRjo_U",
    [
      "rock"
    ],
    [],
    [
      "light my fire"
    ]
  ],
  [
    "hendrix-purple-haze",
    "Purple Haze",
    "Jimi Hendrix",
    1967,
    "WGoDaY9o8JU",
    [
      "rock"
    ],
    [],
    [
      "purple haze"
    ]
  ],
  [
    "led-zeppelin-kashmir",
    "Kashmir",
    "Led Zeppelin",
    1975,
    "PD-MdiUm1_Y",
    [
      "rock"
    ],
    [],
    [
      "kashmir"
    ]
  ],
  [
    "pink-floyd-another-brick",
    "Another Brick in the Wall, Part 2",
    "Pink Floyd",
    1979,
    "HrxX9TBj2zY",
    [
      "rock"
    ],
    [
      "We Dont Need No Education"
    ],
    [
      "we dont need no education"
    ]
  ],
  [
    "pink-floyd-wish-you-were",
    "Wish You Were Here",
    "Pink Floyd",
    1975,
    "IXdNnw99-Ic",
    [
      "rock"
    ],
    [],
    [
      "wish you were here"
    ]
  ],
  [
    "eagles-hotel-california",
    "Hotel California",
    "Eagles",
    1977,
    "BciS5krYL80",
    [
      "rock"
    ],
    [],
    [
      "welcome to the hotel california"
    ]
  ],
  [
    "lynyrd-sweet-home",
    "Sweet Home Alabama",
    "Lynyrd Skynyrd",
    1974,
    "ye5BuYQd4vs",
    [
      "rock"
    ],
    [],
    [
      "sweet home alabama"
    ]
  ],
  [
    "boston-more-than-feeling",
    "More Than a Feeling",
    "Boston",
    1976,
    "SSR6ZzjUZCc",
    [
      "rock"
    ],
    [],
    [
      "more than a feeling"
    ]
  ],
  [
    "styx-come-sail",
    "Come Sail Away",
    "Styx",
    1977,
    "e5MAg_yWsq8",
    [
      "rock"
    ],
    [],
    [
      "come sail away"
    ]
  ],
  [
    "kansas-dust-in-wind",
    "Dust in the Wind",
    "Kansas",
    1977,
    "tH2w6Oxx0kQ",
    [
      "rock"
    ],
    [],
    [
      "dust in the wind"
    ]
  ],
  [
    "supertramp-logical-song",
    "The Logical Song",
    "Supertramp",
    1979,
    "ukdN7Xe2vI8",
    [
      "rock"
    ],
    [],
    [
      "logical"
    ]
  ],
  [
    "police-every-breath",
    "Every Breath You Take",
    "The Police",
    1983,
    "OMOGmigkzsQ",
    [
      "rock"
    ],
    [],
    [
      "every breath you take"
    ]
  ],
  [
    "police-roxanne",
    "Roxanne",
    "The Police",
    1978,
    "3T1c7GkzRQQ",
    [
      "rock"
    ],
    [],
    [
      "roxanne"
    ]
  ],
  [
    "u2-with-or-without",
    "With or Without You",
    "U2",
    1987,
    "XmSdTa9oYXM",
    [
      "rock"
    ],
    [],
    [
      "with or without you"
    ]
  ],
  [
    "u2-sunday-bloody",
    "Sunday Bloody Sunday",
    "U2",
    1983,
    "EM4vblG6BVY",
    [
      "rock"
    ],
    [],
    [
      "sunday bloody sunday"
    ]
  ],
  [
    "u2-one",
    "One",
    "U2",
    1991,
    "ftjEcrrf7r0",
    [
      "rock"
    ],
    [],
    [
      "one love"
    ]
  ],
  [
    "rem-losing-my-religion",
    "Losing My Religion",
    "R.E.M.",
    1991,
    "xwtdhWltSIg",
    [
      "rock"
    ],
    [],
    [
      "thats me in the corner"
    ]
  ],
  [
    "oasis-wonderwall",
    "Wonderwall",
    "Oasis",
    1995,
    "bx1Bh8ZvH84",
    [
      "rock"
    ],
    [],
    [
      "today is gonna be the day"
    ]
  ],
  [
    "oasis-dont-look-back",
    "Don't Look Back in Anger",
    "Oasis",
    1996,
    "cmpRLQ_G0a8",
    [
      "rock"
    ],
    [],
    [
      "so sally can wait"
    ]
  ],
  [
    "blur-song-2",
    "Song 2",
    "Blur",
    1997,
    "SSbwc_l3v_I",
    [
      "rock"
    ],
    [
      "woo hoo"
    ],
    [
      "woo hoo"
    ]
  ],
  [
    "radiohead-creep",
    "Creep",
    "Radiohead",
    1992,
    "XFozcm4_yYQ",
    [
      "rock"
    ],
    [],
    [
      "im a creep"
    ]
  ],
  [
    "radiohead-karma-police",
    "Karma Police",
    "Radiohead",
    1997,
    "1Ly_U5sKg4c",
    [
      "rock"
    ],
    [],
    [
      "karma police"
    ]
  ],
  [
    "soundgarden-black-hole",
    "Black Hole Sun",
    "Soundgarden",
    1994,
    "3mbBbFH9fAg",
    [
      "grunge"
    ],
    [],
    [
      "black hole sun"
    ]
  ],
  [
    "alice-in-chains-man-in-box",
    "Man in the Box",
    "Alice in Chains",
    1990,
    "jK0KJhQ5kCM",
    [
      "grunge"
    ],
    [],
    [
      "man in the box"
    ]
  ],
  [
    "pearl-jam-alive",
    "Alive",
    "Pearl Jam",
    1991,
    "qM0zIDghn7Q",
    [
      "grunge"
    ],
    [],
    [
      "im still alive"
    ]
  ],
  [
    "pearl-jam-jeremy",
    "Jeremy",
    "Pearl Jam",
    1991,
    "MS91knuzoOA",
    [
      "grunge"
    ],
    [],
    [
      "jeremy spoke in class today"
    ]
  ],
  [
    "rhcp-under-bridge",
    "Under the Bridge",
    "Red Hot Chili Peppers",
    1991,
    "GLvohMXgcBo",
    [
      "rock"
    ],
    [],
    [
      "under the bridge downtown"
    ]
  ],
  [
    "rhcp-californication",
    "Californication",
    "Red Hot Chili Peppers",
    1999,
    "YlUKcNNmywk",
    [
      "rock"
    ],
    [],
    [
      "californication"
    ]
  ],
  [
    "rhcp-cant-stop",
    "Can't Stop",
    "Red Hot Chili Peppers",
    2002,
    "8DyziWtkfBw",
    [
      "rock"
    ],
    [
      "Cant Stop"
    ],
    [
      "cant stop"
    ]
  ],
  [
    "white-stripes-seven-nation",
    "Seven Nation Army",
    "The White Stripes",
    2003,
    "0J2QdDbelmY",
    [
      "rock"
    ],
    [],
    [
      "seven nation army"
    ]
  ],
  [
    "foo-fighters-everlong",
    "Everlong",
    "Foo Fighters",
    1997,
    "eBG7P-K-r1Y",
    [
      "rock"
    ],
    [],
    [
      "hello ive waited here for you"
    ]
  ],
  [
    "foo-fighters-learn-to-fly",
    "Learn to Fly",
    "Foo Fighters",
    1999,
    "1VQ_3sBZEm0",
    [
      "rock"
    ],
    [],
    [
      "learn to fly"
    ]
  ],
  [
    "green-day-basket-case",
    "Basket Case",
    "Green Day",
    1994,
    "NUTCJWM3NUQ",
    [
      "punk",
      "rock"
    ],
    [],
    [
      "do you have the time"
    ]
  ],
  [
    "green-day-american-idiot",
    "American Idiot",
    "Green Day",
    2004,
    "Ee_uujKuJMI",
    [
      "punk",
      "rock"
    ],
    [],
    [
      "american idiot"
    ]
  ],
  [
    "green-day-boulevard",
    "Boulevard of Broken Dreams",
    "Green Day",
    2004,
    "Soa3gO7tL-c",
    [
      "punk",
      "rock"
    ],
    [],
    [
      "i walk alone"
    ]
  ],
  [
    "offspring-pretty-fly",
    "Pretty Fly (For a White Guy)",
    "The Offspring",
    1998,
    "Qt2mbGP6vFI",
    [
      "punk"
    ],
    [
      "Pretty Fly"
    ],
    [
      "give it to me baby"
    ]
  ],
  [
    "blink-all-the-small",
    "All the Small Things",
    "blink-182",
    1999,
    "9Ht5RZpzPqw",
    [
      "punk"
    ],
    [],
    [
      "all the small things"
    ]
  ],
  [
    "sum41-fat-lip",
    "Fat Lip",
    "Sum 41",
    2001,
    "2s3iGpDqQpQ",
    [
      "punk"
    ],
    [],
    [
      "storm in the morning light"
    ]
  ],
  [
    "linkin-numb",
    "Numb",
    "Linkin Park",
    2003,
    "kXYiU_JCYtU",
    [
      "rock"
    ],
    [],
    [
      "ive become so numb"
    ]
  ],
  [
    "linkin-in-the-end",
    "In the End",
    "Linkin Park",
    2001,
    "eVTXPUF4Oz4",
    [
      "rock"
    ],
    [],
    [
      "i tried so hard"
    ]
  ],
  [
    "evanescence-bring-me-life",
    "Bring Me to Life",
    "Evanescence",
    2003,
    "3YxaaGgTQYM",
    [
      "rock"
    ],
    [],
    [
      "wake me up inside"
    ]
  ],
  [
    "system-chop-suey",
    "Chop Suey!",
    "System of a Down",
    2001,
    "CSvFpBOe8eY",
    [
      "metal"
    ],
    [
      "Chop Suey"
    ],
    [
      "wake up"
    ]
  ],
  [
    "disturbed-down-with-sickness",
    "Down with the Sickness",
    "Disturbed",
    2000,
    "09LTT0xwdfw",
    [
      "metal"
    ],
    [],
    [
      "ooh wah ah ah ah"
    ]
  ],
  [
    "korn-freak-on-a-leash",
    "Freak on a Leash",
    "Korn",
    1998,
    "jRGrNDV11vo",
    [
      "metal"
    ],
    [],
    [
      "something takes a part of me"
    ]
  ],
  [
    "slipknot-duality",
    "Duality",
    "Slipknot",
    2004,
    "6fVE8kSM43I",
    [
      "metal"
    ],
    [],
    [
      "i push my fingers into my eyes"
    ]
  ],
  [
    "rammstein-du-hast",
    "Du Hast",
    "Rammstein",
    1997,
    "W3q8Od5qJio",
    [
      "metal"
    ],
    [
      "Du Hast"
    ],
    [
      "du hast mich"
    ]
  ],
  [
    "daft-punk-one-more-time",
    "One More Time",
    "Daft Punk",
    2000,
    "FGBhQbmPwH8",
    [
      "electronic"
    ],
    [],
    [
      "one more time"
    ]
  ],
  [
    "daft-punk-get-lucky",
    "Get Lucky",
    "Daft Punk",
    2013,
    "5NV6Rdv1a3I",
    [
      "electronic",
      "pop"
    ],
    [],
    [
      "were up all night to get lucky"
    ]
  ],
  [
    "avicii-wake-me-up",
    "Wake Me Up",
    "Avicii",
    2013,
    "IcrbM1l_BoI",
    [
      "electronic"
    ],
    [],
    [
      "wake me up when its all over"
    ]
  ],
  [
    "avicii-levels",
    "Levels",
    "Avicii",
    2011,
    "_ovdm2yX4MA",
    [
      "electronic"
    ],
    [],
    [
      "levels"
    ]
  ],
  [
    "calvin-feel-so-close",
    "Feel So Close",
    "Calvin Harris",
    2011,
    "dGghkjpNCQ8",
    [
      "electronic"
    ],
    [],
    [
      "i feel so close to you right now"
    ]
  ],
  [
    "lmfao-party-rock",
    "Party Rock Anthem",
    "LMFAO",
    2011,
    "KQ6zr6kCPj8",
    [
      "electronic",
      "pop"
    ],
    [],
    [
      "shuffling"
    ]
  ],
  [
    "psy-gangnam",
    "Gangnam Style",
    "PSY",
    2012,
    "9bZkp7q19f0",
    [
      "pop"
    ],
    [
      "Gangnam"
    ],
    [
      "oppa gangnam style"
    ]
  ],
  [
    "luis-fonsi-despacito",
    "Despacito",
    "Luis Fonsi",
    2017,
    "kJQP7kiw5Fk",
    [
      "pop",
      "latin"
    ],
    [],
    [
      "despacito"
    ]
  ],
  [
    "ed-sheeran-shape",
    "Shape of You",
    "Ed Sheeran",
    2017,
    "JGwWNGJdvx8",
    [
      "pop"
    ],
    [],
    [
      "im in love with your body"
    ]
  ],
  [
    "ed-sheeran-perfect",
    "Perfect",
    "Ed Sheeran",
    2017,
    "2Vv-BfVoq4g",
    [
      "pop"
    ],
    [],
    [
      "i found a love"
    ]
  ],
  [
    "ed-sheeran-thinking-out",
    "Thinking Out Loud",
    "Ed Sheeran",
    2014,
    "lp-EO5I60KA",
    [
      "pop"
    ],
    [],
    [
      "when your legs dont work"
    ]
  ],
  [
    "wiz-see-you-again",
    "See You Again",
    "Wiz Khalifa",
    2015,
    "RgKAFK5djSk",
    [
      "hip-hop",
      "pop"
    ],
    [],
    [
      "its been a long day"
    ]
  ],
  [
    "mark-ronson-uptown",
    "Uptown Funk",
    "Mark Ronson",
    2014,
    "OPf0YbXqDm0",
    [
      "pop",
      "funk"
    ],
    [],
    [
      "uptown funk you up"
    ]
  ],
  [
    "pharrell-happy",
    "Happy",
    "Pharrell Williams",
    2013,
    "ZbZSe6N_BXs",
    [
      "pop"
    ],
    [],
    [
      "because im happy"
    ]
  ],
  [
    "justin-timberlake-cant-stop",
    "Can't Stop the Feeling!",
    "Justin Timberlake",
    2016,
    "ru0K8uYEZWw",
    [
      "pop"
    ],
    [
      "Cant Stop the Feeling"
    ],
    [
      "i got this feeling"
    ]
  ],
  [
    "justin-bieber-sorry",
    "Sorry",
    "Justin Bieber",
    2015,
    "fRh_vgS2dFE",
    [
      "pop"
    ],
    [],
    [
      "is it too late now to say sorry"
    ]
  ],
  [
    "justin-bieber-baby",
    "Baby",
    "Justin Bieber",
    2010,
    "kffacxfA7G4",
    [
      "pop"
    ],
    [],
    [
      "baby baby baby oh"
    ]
  ],
  [
    "the-weeknd-blinding",
    "Blinding Lights",
    "The Weeknd",
    2019,
    "4NRXx6U8ABQ",
    [
      "pop"
    ],
    [],
    [
      "i been tryna call"
    ]
  ],
  [
    "the-weeknd-starboy",
    "Starboy",
    "The Weeknd",
    2016,
    "34Na4j8AVgA",
    [
      "pop"
    ],
    [],
    [
      "im a starboy"
    ]
  ],
  [
    "drake-gods-plan",
    "God's Plan",
    "Drake",
    2018,
    "xpVfcZ0ZcFM",
    [
      "hip-hop"
    ],
    [
      "Gods Plan"
    ],
    [
      "gods plan"
    ]
  ],
  [
    "drake-hotline",
    "Hotline Bling",
    "Drake",
    2015,
    "uxWWzhq-LsY",
    [
      "hip-hop"
    ],
    [],
    [
      "you used to call me on my"
    ]
  ],
  [
    "drake-one-dance",
    "One Dance",
    "Drake",
    2016,
    "q0hyYWKXF0Q",
    [
      "hip-hop"
    ],
    [],
    [
      "one dance"
    ]
  ],
  [
    "kendrick-humble",
    "HUMBLE.",
    "Kendrick Lamar",
    2017,
    "tvTRZJ-4EyI",
    [
      "hip-hop"
    ],
    [
      "Humble"
    ],
    [
      "sit down be humble"
    ]
  ],
  [
    "kendrick-alright",
    "Alright",
    "Kendrick Lamar",
    2015,
    "Z-48u_uWMHY",
    [
      "hip-hop"
    ],
    [],
    [
      "we gon be alright"
    ]
  ],
  [
    "eminem-lose-yourself",
    "Lose Yourself",
    "Eminem",
    2002,
    "_Yhyp-_hX2s",
    [
      "hip-hop"
    ],
    [],
    [
      "his palms are sweaty"
    ]
  ],
  [
    "eminem-without-me",
    "Without Me",
    "Eminem",
    2002,
    "YVkUvmDQ3HY",
    [
      "hip-hop"
    ],
    [],
    [
      "guess whos back"
    ]
  ],
  [
    "eminem-real-slim",
    "The Real Slim Shady",
    "Eminem",
    2000,
    "eJO5HU_7_1w",
    [
      "hip-hop"
    ],
    [],
    [
      "will the real slim shady"
    ]
  ],
  [
    "50cent-in-da-club",
    "In Da Club",
    "50 Cent",
    2003,
    "5qm8PH4xAss",
    [
      "hip-hop"
    ],
    [
      "In the Club"
    ],
    [
      "go shorty its your birthday"
    ]
  ],
  [
    "kanye-stronger",
    "Stronger",
    "Kanye West",
    2007,
    "PsO6ZnUZI0g",
    [
      "hip-hop"
    ],
    [],
    [
      "that that dont kill me"
    ]
  ],
  [
    "kanye-gold-digger",
    "Gold Digger",
    "Kanye West",
    2005,
    "6vwNcNOTVzY",
    [
      "hip-hop"
    ],
    [],
    [
      "gold digger"
    ]
  ],
  [
    "outkast-hey-ya",
    "Hey Ya!",
    "OutKast",
    2003,
    "PWgvGjAhvIw",
    [
      "hip-hop",
      "pop"
    ],
    [
      "Hey Ya"
    ],
    [
      "shake it like a polaroid"
    ]
  ],
  [
    "outkast-ms-jackson",
    "Ms. Jackson",
    "OutKast",
    2000,
    "MYxAiK6VnXk",
    [
      "hip-hop"
    ],
    [
      "Miss Jackson"
    ],
    [
      "im sorry ms jackson"
    ]
  ],
  [
    "beyonce-crazy-in-love",
    "Crazy in Love",
    "Beyoncé",
    2003,
    "ViwtNLUqkMY",
    [
      "pop",
      "rnb"
    ],
    [],
    [
      "got me looking so crazy"
    ]
  ],
  [
    "beyonce-single-ladies",
    "Single Ladies (Put a Ring on It)",
    "Beyoncé",
    2008,
    "4m1EFMoRFvY",
    [
      "pop"
    ],
    [
      "Single Ladies"
    ],
    [
      "put a ring on it"
    ]
  ],
  [
    "rihanna-umbrella",
    "Umbrella",
    "Rihanna",
    2007,
    "CvBfmoZ2cQY",
    [
      "pop"
    ],
    [],
    [
      "under my umbrella"
    ]
  ],
  [
    "rihanna-we-found-love",
    "We Found Love",
    "Rihanna",
    2011,
    "tg00YEETFzg",
    [
      "pop"
    ],
    [],
    [
      "we found love in a hopeless place"
    ]
  ],
  [
    "lady-gaga-bad-romance",
    "Bad Romance",
    "Lady Gaga",
    2009,
    "qrO4YZeyl0I",
    [
      "pop"
    ],
    [],
    [
      "ra ra ah ah ah"
    ]
  ],
  [
    "lady-gaga-poker-face",
    "Poker Face",
    "Lady Gaga",
    2008,
    "bESGLojNYSo",
    [
      "pop"
    ],
    [],
    [
      "poker face"
    ]
  ],
  [
    "katy-perry-firework",
    "Firework",
    "Katy Perry",
    2010,
    "QGJuMBdaqIw",
    [
      "pop"
    ],
    [],
    [
      "baby youre a firework"
    ]
  ],
  [
    "katy-perry-roar",
    "Roar",
    "Katy Perry",
    2013,
    "CevxZvSJLk8",
    [
      "pop"
    ],
    [],
    [
      "you hear me roar"
    ]
  ],
  [
    "katy-perry-teenage-dream",
    "Teenage Dream",
    "Katy Perry",
    2010,
    "98WtmXsYS1Q",
    [
      "pop"
    ],
    [],
    [
      "teenage dream"
    ]
  ],
  [
    "taylor-shake-it-off",
    "Shake It Off",
    "Taylor Swift",
    2014,
    "nfWlot6h_JM",
    [
      "pop"
    ],
    [],
    [
      "players gonna play"
    ]
  ],
  [
    "taylor-blank-space",
    "Blank Space",
    "Taylor Swift",
    2014,
    "e-ORhEE9VVg",
    [
      "pop"
    ],
    [],
    [
      "got a blank space baby"
    ]
  ],
  [
    "taylor-love-story",
    "Love Story",
    "Taylor Swift",
    2008,
    "8xg3vE8Ie_E",
    [
      "pop",
      "country"
    ],
    [],
    [
      "romeo save me"
    ]
  ],
  [
    "taylor-anti-hero",
    "Anti-Hero",
    "Taylor Swift",
    2022,
    "b1kbLwvov3A",
    [
      "pop"
    ],
    [],
    [
      "its me hi"
    ]
  ],
  [
    "adele-rolling",
    "Rolling in the Deep",
    "Adele",
    2010,
    "rYEDA3JcQqw",
    [
      "pop"
    ],
    [],
    [
      "we could have had it all"
    ]
  ],
  [
    "adele-someone-like-you",
    "Someone Like You",
    "Adele",
    2011,
    "hLQl3WQQoQ0",
    [
      "pop"
    ],
    [],
    [
      "never mind ill find someone like you"
    ]
  ],
  [
    "adele-hello",
    "Hello",
    "Adele",
    2015,
    "YQHsXMglC9A",
    [
      "pop"
    ],
    [],
    [
      "hello from the other side"
    ]
  ],
  [
    "sia-chandelier",
    "Chandelier",
    "Sia",
    2014,
    "2vjPBrBU-TM",
    [
      "pop"
    ],
    [],
    [
      "im gonna swing from the chandelier"
    ]
  ],
  [
    "sia-cheap-thrills",
    "Cheap Thrills",
    "Sia",
    2016,
    "nYh-n7EOtMA",
    [
      "pop"
    ],
    [],
    [
      "cheap thrills"
    ]
  ],
  [
    "maroon5-this-love",
    "This Love",
    "Maroon 5",
    2004,
    "xL_sMXfsxTs",
    [
      "pop",
      "rock"
    ],
    [],
    [
      "this love has taken its toll"
    ]
  ],
  [
    "maroon5-she-will-be-loved",
    "She Will Be Loved",
    "Maroon 5",
    2004,
    "nIjVuRTm-dc",
    [
      "pop"
    ],
    [],
    [
      "slow down girl"
    ]
  ],
  [
    "maroon5-moves-like-jagger",
    "Moves Like Jagger",
    "Maroon 5",
    2011,
    "iEPTlhBb6zY",
    [
      "pop"
    ],
    [],
    [
      "moves like jagger"
    ]
  ],
  [
    "coldplay-yellow",
    "Yellow",
    "Coldplay",
    2000,
    "yKNxeF4KMsY",
    [
      "rock",
      "pop"
    ],
    [],
    [
      "look at the stars"
    ]
  ],
  [
    "coldplay-viva",
    "Viva La Vida",
    "Coldplay",
    2008,
    "dvgZkm1xWPE",
    [
      "rock",
      "pop"
    ],
    [],
    [
      "i used to rule the world"
    ]
  ],
  [
    "coldplay-clocks",
    "Clocks",
    "Coldplay",
    2002,
    "d020hcWA_Wg",
    [
      "rock"
    ],
    [],
    [
      "lights go out and i cant be saved"
    ]
  ],
  [
    "coldplay-fix-you",
    "Fix You",
    "Coldplay",
    2005,
    "k4V3Mo61fJM",
    [
      "rock"
    ],
    [],
    [
      "lights will guide you home"
    ]
  ],
  [
    "onerepublic-counting-stars",
    "Counting Stars",
    "OneRepublic",
    2013,
    "hT_nvWreIhg",
    [
      "pop"
    ],
    [],
    [
      "counting stars"
    ]
  ],
  [
    "imagine-radioactive",
    "Radioactive",
    "Imagine Dragons",
    2012,
    "ktvTqknDobU",
    [
      "rock",
      "pop"
    ],
    [],
    [
      "welcome to the new age"
    ]
  ],
  [
    "imagine-believer",
    "Believer",
    "Imagine Dragons",
    2017,
    "7wtfhZwyrcc",
    [
      "rock",
      "pop"
    ],
    [],
    [
      "pay the ungratefull"
    ]
  ],
  [
    "fun-we-are-young",
    "We Are Young",
    "fun.",
    2011,
    "Sv6dMFF_yts",
    [
      "pop"
    ],
    [],
    [
      "tonight we are young"
    ]
  ],
  [
    "gotye-somebody",
    "Somebody That I Used to Know",
    "Gotye",
    2011,
    "8UVNT4wvIGY",
    [
      "pop"
    ],
    [],
    [
      "somebody that i used to know"
    ]
  ],
  [
    "carly-call-me-maybe",
    "Call Me Maybe",
    "Carly Rae Jepsen",
    2012,
    "fWNaR-rxAic",
    [
      "pop"
    ],
    [],
    [
      "hey i just met you"
    ]
  ],
  [
    "meghan-all-about-bass",
    "All About That Bass",
    "Meghan Trainor",
    2014,
    "7PCkvCUeEzo",
    [
      "pop"
    ],
    [],
    [
      "all about that bass"
    ]
  ],
  [
    "bruno-just-the-way",
    "Just the Way You Are",
    "Bruno Mars",
    2010,
    "LjhCEhWiKXk",
    [
      "pop"
    ],
    [],
    [
      "just the way you are"
    ]
  ],
  [
    "bruno-grenade",
    "Grenade",
    "Bruno Mars",
    2010,
    "SR6iYW_jNbQ",
    [
      "pop"
    ],
    [],
    [
      "took a grenade"
    ]
  ],
  [
    "bruno-24k",
    "24K Magic",
    "Bruno Mars",
    2016,
    "UqyT8IEBkvY",
    [
      "pop",
      "funk"
    ],
    [
      "24K"
    ],
    [
      "twenty four karat magic"
    ]
  ],
  [
    "john-legend-all-of-me",
    "All of Me",
    "John Legend",
    2013,
    "450p7goxZqg",
    [
      "pop",
      "rnb"
    ],
    [],
    [
      "all of me loves all of you"
    ]
  ],
  [
    "sam-smith-stay-with-me",
    "Stay With Me",
    "Sam Smith",
    2014,
    "pB-5XG-DbAA",
    [
      "pop"
    ],
    [],
    [
      "stay with me"
    ]
  ],
  [
    "billie-bad-guy",
    "bad guy",
    "Billie Eilish",
    2019,
    "DyDfgMOUjCI",
    [
      "pop"
    ],
    [
      "Bad Guy"
    ],
    [
      "duh"
    ]
  ],
  [
    "olivia-drivers-license",
    "drivers license",
    "Olivia Rodrigo",
    2021,
    "ZmDBbnmKpqQ",
    [
      "pop"
    ],
    [
      "Drivers License"
    ],
    [
      "drivers license"
    ]
  ],
  [
    "miley-flowers",
    "Flowers",
    "Miley Cyrus",
    2023,
    "G7KNmW9aDh4",
    [
      "pop"
    ],
    [],
    [
      "i can buy myself flowers"
    ]
  ],
  [
    "harry-as-it-was",
    "As It Was",
    "Harry Styles",
    2022,
    "H5v3kku4y6Q",
    [
      "pop"
    ],
    [],
    [
      "in this world"
    ]
  ],
  [
    "lil-nas-old-town",
    "Old Town Road",
    "Lil Nas X",
    2019,
    "w2GuVq1d3bM",
    [
      "country",
      "hip-hop"
    ],
    [],
    [
      "old town road"
    ]
  ],
  [
    "childish-redbone",
    "Redbone",
    "Childish Gambino",
    2016,
    "Kp7eSUU9oy8",
    [
      "rnb",
      "funk"
    ],
    [],
    [
      "stay woke"
    ]
  ],
  [
    "sza-kill-bill",
    "Kill Bill",
    "SZA",
    2023,
    "msT3G2uFCs8",
    [
      "rnb"
    ],
    [],
    [
      "kill bill"
    ]
  ],
  [
    "doja-say-so",
    "Say So",
    "Doja Cat",
    2020,
    "pokggp6jgc4",
    [
      "pop"
    ],
    [],
    [
      "why dont you say so"
    ]
  ],
  [
    "dua-dont-start",
    "Don't Start Now",
    "Dua Lipa",
    2019,
    "oygrmJFKYZY",
    [
      "pop"
    ],
    [
      "Dont Start Now"
    ],
    [
      "dont show up"
    ]
  ],
  [
    "the-killers-mr-brightside",
    "Mr. Brightside",
    "The Killers",
    2004,
    "gGdGFtwCNBE",
    [
      "rock"
    ],
    [
      "Mr Brightside"
    ],
    [
      "coming out of my cage"
    ]
  ],
  [
    "arctic-i-bet-you",
    "I Bet You Look Good on the Dancefloor",
    "Arctic Monkeys",
    2005,
    "pD1gDSao1eA",
    [
      "rock"
    ],
    [],
    [
      "simulated minifigures"
    ]
  ],
  [
    "strokes-last-nite",
    "Last Nite",
    "The Strokes",
    2001,
    "TOypSnKFHrE",
    [
      "rock"
    ],
    [
      "Last Night"
    ],
    [
      "last nite"
    ]
  ],
  [
    "weezer-buddy-holly",
    "Buddy Holly",
    "Weezer",
    1994,
    "GLiPTR_UoJ4",
    [
      "rock"
    ],
    [],
    [
      "ooh wee ooh"
    ]
  ],
  [
    "weezer-island-in-sun",
    "Island in the Sun",
    "Weezer",
    2001,
    "erG5rgNYSdk",
    [
      "rock"
    ],
    [],
    [
      "island in the sun"
    ]
  ],
  [
    "vampire-a-more-perfect",
    "A-Punk",
    "Vampire Weekend",
    2008,
    "bM7Z0SodKE4",
    [
      "rock"
    ],
    [
      "A Punk"
    ],
    [
      "a-punk"
    ]
  ],
  [
    "stevie-superstition",
    "Superstition",
    "Stevie Wonder",
    1972,
    "0CFuCYNx-1g",
    [
      "funk",
      "soul"
    ],
    [],
    [
      "very superstitious"
    ]
  ],
  [
    "aretha-respect",
    "Respect",
    "Aretha Franklin",
    1967,
    "6FOUqQt3Kg0",
    [
      "soul"
    ],
    [],
    [
      "r-e-s-p-e-c-t"
    ]
  ],
  [
    "marvin-whats-going",
    "What's Going On",
    "Marvin Gaye",
    1971,
    "H-kA3UtBn_A",
    [
      "soul"
    ],
    [
      "Whats Going On"
    ],
    []
  ],
  [
    "al-green-lets-stay",
    "Let's Stay Together",
    "Al Green",
    1971,
    "COiIC3A0ROM",
    [
      "soul"
    ],
    [
      "Lets Stay Together"
    ],
    []
  ],
  [
    "otis-sittin",
    "(Sittin' On) The Dock of the Bay",
    "Otis Redding",
    1968,
    "rTVjnBo_CL8",
    [
      "soul"
    ],
    [
      "Dock of the Bay"
    ],
    []
  ],
  [
    "sam-cooke-change",
    "A Change Is Gonna Come",
    "Sam Cooke",
    1964,
    "wEBlaM2HMZ0",
    [
      "soul"
    ],
    [],
    []
  ],
  [
    "james-brown-good-foot",
    "Get Up (I Feel Like Being a) Sex Machine",
    "James Brown",
    1970,
    "I5sJhP7STbQ",
    [
      "funk"
    ],
    [
      "Sex Machine"
    ],
    []
  ],
  [
    "parliament-flash-light",
    "Flash Light",
    "Parliament",
    1977,
    "gw-0NYElG0s",
    [
      "funk"
    ],
    [
      "Flashlight"
    ],
    []
  ],
  [
    "kool-get-down-on-it",
    "Get Down On It",
    "Kool & The Gang",
    1981,
    "uMm1W_2zMRY",
    [
      "funk"
    ],
    [],
    []
  ],
  [
    "chaka-im-every-woman",
    "I'm Every Woman",
    "Chaka Khan",
    1978,
    "63xqBp0pC6Y",
    [
      "funk",
      "soul"
    ],
    [
      "Im Every Woman"
    ],
    []
  ],
  [
    "gloria-i-will-survive",
    "I Will Survive",
    "Gloria Gaynor",
    1978,
    "ARt9h4JJiDA",
    [
      "disco"
    ],
    [],
    [
      "i will survive"
    ]
  ],
  [
    "donna-hot-stuff",
    "Hot Stuff",
    "Donna Summer",
    1979,
    "1pSpE3bQnT0",
    [
      "disco"
    ],
    [],
    []
  ],
  [
    "bee-gees-night-fever",
    "Night Fever",
    "Bee Gees",
    1977,
    "qODe7n4uF0Y",
    [
      "disco"
    ],
    [],
    []
  ],
  [
    "kc-thats-the-way",
    "That's the Way (I Like It)",
    "KC and the Sunshine Band",
    1975,
    "i-hWQLlHgf4",
    [
      "disco"
    ],
    [],
    []
  ],
  [
    "sister-sledge-we-are-family",
    "We Are Family",
    "Sister Sledge",
    1979,
    "eBpYgpF1cK8",
    [
      "disco"
    ],
    [],
    []
  ],
  [
    "dolly-jolene",
    "Jolene",
    "Dolly Parton",
    1973,
    "Ix_jNqL0vYc",
    [
      "country"
    ],
    [],
    [
      "jolene jolene"
    ]
  ],
  [
    "johnny-ring-of-fire",
    "Ring of Fire",
    "Johnny Cash",
    1963,
    "1WaV2x8GXj0",
    [
      "country"
    ],
    [],
    []
  ],
  [
    "johnny-hurt",
    "Hurt",
    "Johnny Cash",
    2002,
    "8AHCfZTRGiI",
    [
      "country"
    ],
    [],
    []
  ],
  [
    "willie-on-the-road-again",
    "On the Road Again",
    "Willie Nelson",
    1980,
    "1gB7W5qH6lI",
    [
      "country"
    ],
    [],
    []
  ],
  [
    "shania-man-i-feel",
    "Man! I Feel Like a Woman!",
    "Shania Twain",
    1997,
    "ZylF3cdK1Z0",
    [
      "country",
      "pop"
    ],
    [],
    []
  ],
  [
    "carrie-before-he-cheats",
    "Before He Cheats",
    "Carrie Underwood",
    2006,
    "WaSy8yy-mr8",
    [
      "country"
    ],
    [],
    []
  ],
  [
    "kenny-the-gambler",
    "The Gambler",
    "Kenny Rogers",
    1978,
    "7hx4gdlfamo",
    [
      "country"
    ],
    [],
    [
      "know when to fold em"
    ]
  ],
  [
    "patsy-crazy",
    "Crazy",
    "Patsy Cline",
    1961,
    "KzZ_0rYz_0Q",
    [
      "country"
    ],
    [],
    []
  ],
  [
    "hank-your-cheatin",
    "Your Cheatin' Heart",
    "Hank Williams",
    1953,
    "waKf1yK7uS8",
    [
      "country"
    ],
    [
      "Your Cheating Heart"
    ],
    []
  ],
  [
    "bob-dylan-like-a-rolling",
    "Like a Rolling Stone",
    "Bob Dylan",
    1965,
    "IwOfCgkyEj0",
    [
      "rock"
    ],
    [],
    [
      "how does it feel"
    ]
  ],
  [
    "bob-dylan-knockin",
    "Knockin' on Heaven's Door",
    "Bob Dylan",
    1973,
    "RF7H7lP7Ixo",
    [
      "rock"
    ],
    [
      "Knocking on Heavens Door"
    ],
    []
  ],
  [
    "neil-young-heart-of-gold",
    "Heart of Gold",
    "Neil Young",
    1972,
    "Ehx1j2h9c9Y",
    [
      "rock"
    ],
    [],
    []
  ],
  [
    "ccr-fortunate-son",
    "Fortunate Son",
    "Creedence Clearwater Revival",
    1969,
    "Z6_CFMwK2p0",
    [
      "rock"
    ],
    [],
    []
  ],
  [
    "ccr-have-you-ever",
    "Have You Ever Seen the Rain",
    "Creedence Clearwater Revival",
    1970,
    "u1V8yrjYRmY",
    [
      "rock"
    ],
    [],
    []
  ],
  [
    "fleetwood-dreams",
    "Dreams",
    "Fleetwood Mac",
    1977,
    "mrZRURcb1cM",
    [
      "rock"
    ],
    [],
    []
  ],
  [
    "fleetwood-go-your-own",
    "Go Your Own Way",
    "Fleetwood Mac",
    1977,
    "6ul-cZ_oAeY",
    [
      "rock"
    ],
    [],
    []
  ],
  [
    "fleetwood-the-chain",
    "The Chain",
    "Fleetwood Mac",
    1977,
    "xwTDcURr3Q4",
    [
      "rock"
    ],
    [],
    []
  ],
  [
    "eagles-take-it-easy",
    "Take It Easy",
    "Eagles",
    1972,
    "K7l5tf0jD9o",
    [
      "rock"
    ],
    [],
    []
  ],
  [
    "eagles-lyin-eyes",
    "Lyin' Eyes",
    "Eagles",
    1975,
    "I2sRc3j7EU0",
    [
      "rock"
    ],
    [
      "Lying Eyes"
    ],
    []
  ],
  [
    "billy-piano-man",
    "Piano Man",
    "Billy Joel",
    1973,
    "gxEPV4kolz0",
    [
      "pop",
      "rock"
    ],
    [],
    [
      "sing us a song"
    ]
  ],
  [
    "billy-uptown-girl",
    "Uptown Girl",
    "Billy Joel",
    1983,
    "hCuMWrfXG4E",
    [
      "pop"
    ],
    [],
    []
  ],
  [
    "elton-tiny-dancer",
    "Tiny Dancer",
    "Elton John",
    1971,
    "yY2Lx3SCvXg",
    [
      "pop",
      "rock"
    ],
    [],
    []
  ],
  [
    "elton-rocket-man",
    "Rocket Man",
    "Elton John",
    1972,
    "DtVBCG6ThDk",
    [
      "pop",
      "rock"
    ],
    [],
    []
  ],
  [
    "elton-your-song",
    "Your Song",
    "Elton John",
    1970,
    "DT04nWLmPWU",
    [
      "pop"
    ],
    [],
    []
  ],
  [
    "david-bowie-heroes",
    "Heroes",
    "David Bowie",
    1977,
    "lXgkuM2NhYI",
    [
      "rock"
    ],
    [
      "Heroes"
    ],
    []
  ],
  [
    "david-bowie-lets-dance",
    "Let's Dance",
    "David Bowie",
    1983,
    "vb5sauKCqws",
    [
      "pop",
      "rock"
    ],
    [
      "Lets Dance"
    ],
    []
  ],
  [
    "david-bowie-space-oddity",
    "Space Oddity",
    "David Bowie",
    1969,
    "iYYRH4apXDo",
    [
      "rock"
    ],
    [],
    [
      "ground control to major tom"
    ]
  ],
  [
    "queen-dont-stop-me",
    "Don't Stop Me Now",
    "Queen",
    1978,
    "HgzGwKwLmgM",
    [
      "rock"
    ],
    [
      "Dont Stop Me Now"
    ],
    []
  ],
  [
    "queen-somebody-to-love",
    "Somebody to Love",
    "Queen",
    1976,
    "kijpcUv-b8M",
    [
      "rock"
    ],
    [],
    []
  ],
  [
    "queen-crazy-little",
    "Crazy Little Thing Called Love",
    "Queen",
    1979,
    "zO6D_BAuYCI",
    [
      "rock"
    ],
    [],
    []
  ],
  [
    "wham-last-christmas",
    "Last Christmas",
    "Wham!",
    1984,
    "E8gmARFvTq0",
    [
      "pop"
    ],
    [],
    []
  ],
  [
    "wham-wake-me-up",
    "Wake Me Up Before You Go-Go",
    "Wham!",
    1984,
    "pIgZ7gMze7A",
    [
      "pop"
    ],
    [],
    []
  ],
  [
    "george-faith",
    "Faith",
    "George Michael",
    1987,
    "6Cs3Pvmmv0E",
    [
      "pop"
    ],
    [],
    []
  ],
  [
    "george-careless",
    "Careless Whisper",
    "George Michael",
    1984,
    "izGwDsrQ1eQ",
    [
      "pop"
    ],
    [],
    [
      "guilty feet"
    ]
  ],
  [
    "phil-in-the-air",
    "In the Air Tonight",
    "Phil Collins",
    1981,
    "YkADjMfmMU4",
    [
      "pop",
      "rock"
    ],
    [],
    [
      "i can feel it coming"
    ]
  ],
  [
    "phil-another-day",
    "Another Day in Paradise",
    "Phil Collins",
    1989,
    "Qt2mbGP6vFI",
    [
      "pop"
    ],
    [],
    []
  ],
  [
    "genesis-land-of-confusion",
    "Land of Confusion",
    "Genesis",
    1986,
    "StZcUAPRRac",
    [
      "rock"
    ],
    [],
    []
  ],
  [
    "peter-sledgehammer",
    "Sledgehammer",
    "Peter Gabriel",
    1986,
    "OJWJE0u7Igk",
    [
      "rock",
      "pop"
    ],
    [],
    []
  ],
  [
    "sting-fields-of-gold",
    "Fields of Gold",
    "Sting",
    1993,
    "q8lA6g3tY0I",
    [
      "pop",
      "rock"
    ],
    [],
    []
  ],
  [
    "sting-englishman",
    "Englishman in New York",
    "Sting",
    1987,
    "d27gTrPPAyk",
    [
      "pop"
    ],
    [],
    []
  ],
  [
    "dire-sultans",
    "Sultans of Swing",
    "Dire Straits",
    1978,
    "h0ffijn7YQ4",
    [
      "rock"
    ],
    [],
    []
  ],
  [
    "dire-money-for-nothing",
    "Money for Nothing",
    "Dire Straits",
    1985,
    "wTP2RUD_cL0",
    [
      "rock"
    ],
    [],
    [
      "i want my mtv"
    ]
  ],
  [
    "dire-walk-of-life",
    "Walk of Life",
    "Dire Straits",
    1985,
    "k9oQ0i4V2Eo",
    [
      "rock"
    ],
    [],
    []
  ],
  [
    "bryan-summer-of-69",
    "Summer of 69",
    "Bryan Adams",
    1984,
    "eFjjO_lhf9c",
    [
      "rock"
    ],
    [
      "Summer of '69"
    ],
    []
  ],
  [
    "bryan-everything-i-do",
    "(Everything I Do) I Do It for You",
    "Bryan Adams",
    1991,
    "Y0pdQU87dc8",
    [
      "pop",
      "rock"
    ],
    [],
    []
  ],
  [
    "bon-jovi-wanted",
    "Wanted Dead or Alive",
    "Bon Jovi",
    1986,
    "SRvK4eYdF8I",
    [
      "rock"
    ],
    [],
    []
  ],
  [
    "bon-jovi-its-my-life",
    "It's My Life",
    "Bon Jovi",
    2000,
    "vx2u5uUu3DE",
    [
      "rock"
    ],
    [
      "Its My Life"
    ],
    []
  ],
  [
    "def-pour-some-sugar",
    "Pour Some Sugar on Me",
    "Def Leppard",
    1987,
    "TDveM4FkKPA",
    [
      "rock"
    ],
    [],
    []
  ],
  [
    "whitesnake-here-i-go",
    "Here I Go Again",
    "Whitesnake",
    1987,
    "0fARgoKdYwI",
    [
      "rock"
    ],
    [],
    []
  ],
  [
    "twisted-were-not-gonna",
    "We're Not Gonna Take It",
    "Twisted Sister",
    1984,
    "4xmckWVPRaI",
    [
      "rock"
    ],
    [
      "Were Not Gonna Take It"
    ],
    []
  ],
  [
    "kiss-rock-and-roll-all-nite",
    "Rock and Roll All Nite",
    "KISS",
    1975,
    "oZOcLnQxB7s",
    [
      "rock"
    ],
    [],
    []
  ],
  [
    "kiss-i-was-made",
    "I Was Made for Lovin You",
    "KISS",
    1979,
    "l5aZJBL0wuc",
    [
      "rock"
    ],
    [],
    []
  ],
  [
    "van-halen-jump",
    "Jump",
    "Van Halen",
    1983,
    "046JaM-uZsM",
    [
      "rock"
    ],
    [],
    []
  ],
  [
    "van-halen-panama",
    "Panama",
    "Van Halen",
    1984,
    "q-wV6ZQI6rQ",
    [
      "rock"
    ],
    [],
    []
  ],
  [
    "van-halen-hot-for-teacher",
    "Hot for Teacher",
    "Van Halen",
    1984,
    "6NYY_5d3G2M",
    [
      "rock"
    ],
    [],
    []
  ],
  [
    "ozzy-crazy-train",
    "Crazy Train",
    "Ozzy Osbourne",
    1980,
    "RMR5zf1J1ds",
    [
      "metal"
    ],
    [],
    []
  ],
  [
    "black-sabbath-paranoid",
    "Paranoid",
    "Black Sabbath",
    1970,
    "0lVdT2o6Sss",
    [
      "metal"
    ],
    [],
    []
  ],
  [
    "iron-maiden-run-to-hills",
    "Run to the Hills",
    "Iron Maiden",
    1982,
    "86ofW1n5A5A",
    [
      "metal"
    ],
    [],
    []
  ],
  [
    "iron-maiden-number-beast",
    "The Number of the Beast",
    "Iron Maiden",
    1982,
    "WxnN05vOuSM",
    [
      "metal"
    ],
    [],
    []
  ],
  [
    "judas-breaking-the-law",
    "Breaking the Law",
    "Judas Priest",
    1980,
    "qrZ3e4uYI-I",
    [
      "metal"
    ],
    [],
    []
  ],
  [
    "motorhead-ace-of-spades",
    "Ace of Spades",
    "Motörhead",
    1980,
    "X4bF_quwNtw",
    [
      "metal"
    ],
    [
      "Ace of Spades"
    ],
    []
  ],
  [
    "dio-holy-diver",
    "Holy Diver",
    "Dio",
    1983,
    "2d1zxq7g5F0",
    [
      "metal"
    ],
    [],
    []
  ],
  [
    "scorpions-wind-of-change",
    "Wind of Change",
    "Scorpions",
    1990,
    "n4RjJKxsamQ",
    [
      "rock"
    ],
    [],
    []
  ],
  [
    "scorpions-rock-you",
    "Rock You Like a Hurricane",
    "Scorpions",
    1984,
    "NcCKlsTgjeM",
    [
      "rock"
    ],
    [],
    []
  ],
  [
    "guns-paradise-city",
    "Paradise City",
    "Guns N' Roses",
    1987,
    "Rbm6GXllBiw",
    [
      "rock"
    ],
    [],
    []
  ],
  [
    "guns-welcome-jungle",
    "Welcome to the Jungle",
    "Guns N' Roses",
    1987,
    "o1tj2zJ2Wvg",
    [
      "rock"
    ],
    [],
    []
  ],
  [
    "metallica-nothing-else",
    "Nothing Else Matters",
    "Metallica",
    1991,
    "tAGnKpE4NCI",
    [
      "metal"
    ],
    [],
    []
  ],
  [
    "metallica-one",
    "One",
    "Metallica",
    1988,
    "WM8bTdBs7cw",
    [
      "metal"
    ],
    [],
    []
  ],
  [
    "metallica-master-puppets",
    "Master of Puppets",
    "Metallica",
    1986,
    "E0ozmU9cJDg",
    [
      "metal"
    ],
    [],
    []
  ],
  [
    "nirvana-come-as-you-are",
    "Come as You Are",
    "Nirvana",
    1991,
    "vabnZ9-ex7o",
    [
      "grunge"
    ],
    [],
    []
  ],
  [
    "nirvana-lithium",
    "Lithium",
    "Nirvana",
    1991,
    "pkqzFUhCPB4",
    [
      "grunge"
    ],
    [],
    []
  ],
  [
    "nirvana-heart-shaped",
    "Heart-Shaped Box",
    "Nirvana",
    1993,
    "n6P0SitRYyI",
    [
      "grunge"
    ],
    [
      "Heart Shaped Box"
    ],
    []
  ],
  [
    "foo-my-hero",
    "My Hero",
    "Foo Fighters",
    1997,
    "eqaNkW8wqqA",
    [
      "rock"
    ],
    [],
    []
  ],
  [
    "foo-best-of-you",
    "Best of You",
    "Foo Fighters",
    2005,
    "h_L4Rixya64",
    [
      "rock"
    ],
    [],
    []
  ],
  [
    "foo-the-pretender",
    "The Pretender",
    "Foo Fighters",
    2007,
    "SBjQ9tuuTJQ",
    [
      "rock"
    ],
    [],
    []
  ],
  [
    "red-hot-give-it-away",
    "Give It Away",
    "Red Hot Chili Peppers",
    1991,
    "Mr_uHJPUlO8",
    [
      "rock"
    ],
    [],
    []
  ],
  [
    "red-hot-otherside",
    "Otherside",
    "Red Hot Chili Peppers",
    1999,
    "rn_YodiJO6k",
    [
      "rock"
    ],
    [],
    []
  ],
  [
    "red-hot-dani-california",
    "Dani California",
    "Red Hot Chili Peppers",
    2006,
    "Sb5aq5HcS1A",
    [
      "rock"
    ],
    [],
    []
  ],
  [
    "weezer-say-it-aint",
    "Say It Ain't So",
    "Weezer",
    1994,
    "KGai_1gWBao",
    [
      "rock"
    ],
    [
      "Say It Aint So"
    ],
    []
  ],
  [
    "green-day-when-september",
    "Wake Me Up When September Ends",
    "Green Day",
    2004,
    "NU71-U3I0WM",
    [
      "punk",
      "rock"
    ],
    [],
    []
  ],
  [
    "green-day-good-riddance",
    "Good Riddance (Time of Your Life)",
    "Green Day",
    1997,
    "CnQ8N1KacJc",
    [
      "punk",
      "rock"
    ],
    [
      "Time of Your Life"
    ],
    []
  ],
  [
    "offspring-the-kids",
    "The Kids Aren't Alright",
    "The Offspring",
    1998,
    "qKdZy6WI0-8",
    [
      "punk"
    ],
    [
      "Kids Arent Alright"
    ],
    []
  ],
  [
    "offspring-self-esteem",
    "Self Esteem",
    "The Offspring",
    1994,
    "8K9j5vSjkI8",
    [
      "punk"
    ],
    [],
    []
  ],
  [
    "blink-whats-my-age",
    "What's My Age Again?",
    "blink-182",
    1999,
    "K7l5tf0jD9o",
    [
      "punk"
    ],
    [
      "Whats My Age Again"
    ],
    []
  ],
  [
    "blink-i-miss-you",
    "I Miss You",
    "blink-182",
    2003,
    "s1tAYmBLiYY",
    [
      "punk"
    ],
    [],
    []
  ],
  [
    "paramore-misery-business",
    "Misery Business",
    "Paramore",
    2007,
    "aCyGvGEtOwc",
    [
      "rock",
      "pop"
    ],
    [],
    []
  ],
  [
    "paramore-still-into-you",
    "Still Into You",
    "Paramore",
    2013,
    "Qxw0YQ_tV9E",
    [
      "rock",
      "pop"
    ],
    [],
    []
  ],
  [
    "fall-out-sugar",
    "Sugar, We're Goin Down",
    "Fall Out Boy",
    2005,
    "uhG-vLZrb-g",
    [
      "rock",
      "pop"
    ],
    [
      "Sugar Were Going Down"
    ],
    []
  ],
  [
    "fall-out-thnks",
    "Thnks fr th Mmrs",
    "Fall Out Boy",
    2007,
    "P7OEcdQVxhM",
    [
      "rock",
      "pop"
    ],
    [
      "Thanks for the Memories"
    ],
    []
  ],
  [
    "panic-i-write-sins",
    "I Write Sins Not Tragedies",
    "Panic! at the Disco",
    2005,
    "vc6vs-l5dkc",
    [
      "rock",
      "pop"
    ],
    [],
    []
  ],
  [
    "my-chem-welcome-black",
    "Welcome to the Black Parade",
    "My Chemical Romance",
    2006,
    "RRKJiM9Njr8",
    [
      "rock"
    ],
    [
      "Black Parade"
    ],
    []
  ],
  [
    "my-chem-helena",
    "Helena",
    "My Chemical Romance",
    2005,
    "7xwKCl7j2wI",
    [
      "rock"
    ],
    [],
    []
  ],
  [
    "evanescence-my-immortal",
    "My Immortal",
    "Evanescence",
    2003,
    "5anLPw0Efmo",
    [
      "rock"
    ],
    [],
    []
  ]
];

module.exports = { SONGS };
