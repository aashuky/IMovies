import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config(); // fallback to cwd .env
import mongoose from "mongoose";
import Movie from "./models/movie.model.js";
import Theater from "./models/Theater.model.js";
import TheaterProduct from "./models/theaterProduct.model.js";
import Show from "./models/show.model.js";
import User from "./models/user.model.js";

// ─── 200 REAL-LOOKING MOVIES ─────────────────────────────────────────────────

const movies = [
  // Hollywood Blockbusters
  { title: "Inception", genre: ["Sci-Fi", "Action", "Thriller"], language: "English", duration: 148, releaseDate: new Date("2010-07-16"), description: "A skilled thief plants an idea deep in a CEO's subconscious, blurring the line between dreams and reality.", poster: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg", rating: 8.8, trailerUrl: "https://www.youtube.com/watch?v=YoHD9XEInc0" },
  { title: "Interstellar", genre: ["Sci-Fi", "Adventure", "Drama"], language: "English", duration: 169, releaseDate: new Date("2014-11-07"), description: "A team of astronauts travels through a wormhole to find a new home for humanity.", poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", rating: 8.7, trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E" },
  { title: "The Dark Knight", genre: ["Action", "Crime", "Drama"], language: "English", duration: 152, releaseDate: new Date("2008-07-18"), description: "Batman faces the chaos unleashed by the Joker, a villain who thrives on anarchy.", poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", rating: 9.0, trailerUrl: "https://www.youtube.com/watch?v=EXeTwQWrcwY" },
  { title: "Avatar: The Way of Water", genre: ["Sci-Fi", "Adventure", "Action"], language: "English", duration: 192, releaseDate: new Date("2022-12-16"), description: "Jake Sully and his family face a new threat as they explore the ocean world of Pandora.", poster: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg", rating: 7.6, trailerUrl: "https://www.youtube.com/watch?v=d9MyW72ELq0" },
  { title: "Avengers: Endgame", genre: ["Action", "Adventure", "Fantasy"], language: "English", duration: 181, releaseDate: new Date("2019-04-26"), description: "The Avengers assemble once more to reverse Thanos's actions and restore balance to the universe.", poster: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg", rating: 8.4, trailerUrl: "https://www.youtube.com/watch?v=TcMBFSGVi1c" },
  { title: "The Lion King", genre: ["Animation", "Drama", "Family"], language: "English", duration: 88, releaseDate: new Date("1994-06-15"), description: "A young lion prince flees his kingdom after his father's murder and must reclaim his rightful place.", poster: "https://image.tmdb.org/t/p/w500/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg", rating: 8.5, trailerUrl: "https://www.youtube.com/watch?v=4sj1MT05lAA" },
  { title: "Spider-Man: No Way Home", genre: ["Action", "Adventure", "Fantasy"], language: "English", duration: 148, releaseDate: new Date("2021-12-17"), description: "Peter Parker unleashes a multiverse of dangerous villains when he asks Doctor Strange for a dangerous favor.", poster: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg", rating: 8.2, trailerUrl: "https://www.youtube.com/watch?v=JfVOs4VSpmA" },
  { title: "Top Gun: Maverick", genre: ["Action", "Drama"], language: "English", duration: 130, releaseDate: new Date("2022-05-27"), description: "Maverick must confront his past while training a new generation of Top Gun graduates.", poster: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg", rating: 8.3, trailerUrl: "https://www.youtube.com/watch?v=giXco2jaZ_4" },
  { title: "Dune", genre: ["Sci-Fi", "Adventure"], language: "English", duration: 155, releaseDate: new Date("2021-10-22"), description: "A mythic and emotionally charged hero's journey as Paul Atreides navigates treacherous desert planet Arrakis.", poster: "https://image.tmdb.org/t/p/w500/d5NXSklpcvkmXJ9lOrKFCDM9Mle.jpg", rating: 8.0, trailerUrl: "https://www.youtube.com/watch?v=8g18jFHCLXk" },
  { title: "Dune: Part Two", genre: ["Sci-Fi", "Adventure"], language: "English", duration: 165, releaseDate: new Date("2024-03-01"), description: "Paul Atreides unites with the Fremen while on a warpath of revenge against the conspirators who destroyed his family.", poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg", rating: 8.5, trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w" },
  { title: "Oppenheimer", genre: ["Drama", "History", "Thriller"], language: "English", duration: 180, releaseDate: new Date("2023-07-21"), description: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.", poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", rating: 8.9, trailerUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg" },
  { title: "Barbie", genre: ["Comedy", "Fantasy", "Adventure"], language: "English", duration: 114, releaseDate: new Date("2023-07-21"), description: "Barbie and Ken embark on a journey of self-discovery in the real world after living in Barbieland.", poster: "https://image.tmdb.org/t/p/w500/iuFNMS8vlzmfa4OZUsjYBjgzxA6.jpg", rating: 7.0, trailerUrl: "https://www.youtube.com/watch?v=pBk4NYhWNMM" },
  { title: "The Batman", genre: ["Action", "Crime", "Drama"], language: "English", duration: 176, releaseDate: new Date("2022-03-04"), description: "Batman ventures into Gotham City's underworld when a sadistic killer leaves behind a trail of cryptic clues.", poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg", rating: 7.9, trailerUrl: "https://www.youtube.com/watch?v=mqqft2x_Aa4" },
  { title: "Guardians of the Galaxy Vol. 3", genre: ["Action", "Comedy", "Adventure"], language: "English", duration: 150, releaseDate: new Date("2023-05-05"), description: "The Guardians embark on a mission to protect Rocket's past before it catches up with him.", poster: "https://image.tmdb.org/t/p/w500/r2J02Z2OpNTctfOSN1Ydgd0mupk.jpg", rating: 8.0, trailerUrl: "https://www.youtube.com/watch?v=u3V5KDHRQvk" },
  { title: "John Wick: Chapter 4", genre: ["Action", "Crime", "Thriller"], language: "English", duration: 169, releaseDate: new Date("2023-03-24"), description: "John Wick discovers a path to defeating the High Table but must face a new adversary.", poster: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg", rating: 7.7, trailerUrl: "https://www.youtube.com/watch?v=qEVUtrk8_B4" },
  { title: "Mission: Impossible – Dead Reckoning", genre: ["Action", "Thriller", "Adventure"], language: "English", duration: 163, releaseDate: new Date("2023-07-12"), description: "Ethan Hunt races to locate a terrifying new weapon before it falls into the wrong hands.", poster: "https://image.tmdb.org/t/p/w500/NNxYkU70HPurnNCSiCjYAmacwm.jpg", rating: 7.7, trailerUrl: "https://www.youtube.com/watch?v=avz06PDqDbM" },
  { title: "Avatar", genre: ["Sci-Fi", "Adventure", "Action"], language: "English", duration: 162, releaseDate: new Date("2009-12-18"), description: "A former Marine falls in love with a Na'vi woman and must choose sides in an epic battle for Pandora.", poster: "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg", rating: 7.9, trailerUrl: "https://www.youtube.com/watch?v=5PSNL1qE6VY" },
  { title: "Black Panther: Wakanda Forever", genre: ["Action", "Adventure", "Drama"], language: "English", duration: 161, releaseDate: new Date("2022-11-11"), description: "Wakanda mourns the loss of King T'Challa while facing a new underwater threat.", poster: "https://image.tmdb.org/t/p/w500/sv1xJUazXeYqALzczSZ3O6nkH75.jpg", rating: 7.3, trailerUrl: "https://www.youtube.com/watch?v=_Z3QKkl1WyM" },
  { title: "Doctor Strange in the Multiverse of Madness", genre: ["Action", "Adventure", "Fantasy"], language: "English", duration: 126, releaseDate: new Date("2022-05-06"), description: "Doctor Strange teams with a mysterious teenager who can travel between multiverses.", poster: "https://image.tmdb.org/t/p/w500/9Gtg2DzBhmYamXBS1hKAhiwbBKS.jpg", rating: 6.9, trailerUrl: "https://www.youtube.com/watch?v=aWzlQ2N6qqg" },
  { title: "Thor: Love and Thunder", genre: ["Action", "Adventure", "Comedy"], language: "English", duration: 118, releaseDate: new Date("2022-07-08"), description: "Thor goes on a journey unlike anything he's ever faced – a quest for inner peace.", poster: "https://image.tmdb.org/t/p/w500/pIkRyD18kl4FhoCNQuWxWu5cBLM.jpg", rating: 6.3, trailerUrl: "https://www.youtube.com/watch?v=tgB1wUcmbbw" },
  // Bollywood
  { title: "Jawan", genre: ["Action", "Thriller"], language: "Hindi", duration: 169, releaseDate: new Date("2023-09-07"), description: "A man on a mission to expose corruption teams up with an unusual band of women.", poster: "https://image.tmdb.org/t/p/w500/jFt1gS4BGHlK8xt76Y81Alp4dbt.jpg", rating: 7.0, trailerUrl: "https://www.youtube.com/watch?v=COv52Qyctws" },
  { title: "Dangal", genre: ["Drama", "Sport"], language: "Hindi", duration: 161, releaseDate: new Date("2016-12-23"), description: "A former wrestler trains his daughters to compete in wrestling at the national level.", poster: "https://image.tmdb.org/t/p/w500/cJRPOLEexI7qp2DKtFfCh7YaaUG.jpg", rating: 8.3, trailerUrl: "https://www.youtube.com/watch?v=x_7YlGv9u1g" },
  { title: "Pathaan", genre: ["Action", "Thriller"], language: "Hindi", duration: 146, releaseDate: new Date("2023-01-25"), description: "An Indian spy returns from exile to save his country from a terrorist organization.", poster: "https://image.tmdb.org/t/p/w500/9zPDJCWONvf2HqD0nSZHiYCnlaS.jpg", rating: 5.9, trailerUrl: "https://www.youtube.com/watch?v=vlegS0HhBWE" },
  { title: "3 Idiots", genre: ["Comedy", "Drama"], language: "Hindi", duration: 170, releaseDate: new Date("2009-12-25"), description: "Two friends search for their long-lost companion while recalling their wild adventures at engineering college.", poster: "https://image.tmdb.org/t/p/w500/66A9MqXZyHFnJIKNOWDr3OGi8P5.jpg", rating: 8.4, trailerUrl: "https://www.youtube.com/watch?v=K0eDlFX9GMc" },
  { title: "PK", genre: ["Comedy", "Drama", "Sci-Fi"], language: "Hindi", duration: 153, releaseDate: new Date("2014-12-19"), description: "An alien gets stranded on Earth and questions religious customs and practices.", poster: "https://image.tmdb.org/t/p/w500/oXlHFPMkm9BmYGxuZVQbkJzJyaD.jpg", rating: 8.1, trailerUrl: "https://www.youtube.com/watch?v=LUEhDHKmKiU" },
  { title: "Brahmastra: Part One – Shiva", genre: ["Action", "Adventure", "Fantasy"], language: "Hindi", duration: 167, releaseDate: new Date("2022-09-09"), description: "A young man discovers he has a mysterious connection with fire and must fight an ancient evil.", poster: "https://image.tmdb.org/t/p/w500/lSmMmTl0cMDiQJLlZCWxAk3E5eR.jpg", rating: 5.6, trailerUrl: "https://www.youtube.com/watch?v=OjBwQCzIGFk" },
  { title: "KGF: Chapter 2", genre: ["Action", "Crime", "Drama"], language: "Kannada", duration: 168, releaseDate: new Date("2022-04-14"), description: "Rocky's bloodthirsty opponents from the past are ready to assassinate him in the KGF world.", poster: "https://image.tmdb.org/t/p/w500/4j0PNHkMr5ax3IA8tjtxcmPU3QT.jpg", rating: 8.2, trailerUrl: "https://www.youtube.com/watch?v=YFKEoNEAMtE" },
  { title: "RRR", genre: ["Action", "Drama", "History"], language: "Telugu", duration: 187, releaseDate: new Date("2022-03-25"), description: "A fictional tale about two Indian revolutionaries on a mission before they begin their revolutionary journey.", poster: "https://image.tmdb.org/t/p/w500/nEufeZlyAzvfObNURMZB9sEaFPo.jpg", rating: 8.0, trailerUrl: "https://www.youtube.com/watch?v=f_vbAtFSEc0" },
  { title: "Baahubali: The Beginning", genre: ["Action", "Adventure", "Drama"], language: "Telugu", duration: 159, releaseDate: new Date("2015-07-10"), description: "In ancient India, an adventurer struggles against an evil ruler and uncovers his true destiny.", poster: "https://image.tmdb.org/t/p/w500/f3BfSUHKGNFKSGSRqEUuaAIgjP7.jpg", rating: 8.1, trailerUrl: "https://www.youtube.com/watch?v=CRxBmCHCReg" },
  { title: "Baahubali 2: The Conclusion", genre: ["Action", "Adventure", "Drama"], language: "Telugu", duration: 167, releaseDate: new Date("2017-04-28"), description: "When Shiva, the son of Bahubali, learns about his heritage, he begins to look for answers.", poster: "https://image.tmdb.org/t/p/w500/4VkXKNiVCJHHnNBJrCJ2A0t8LL3.jpg", rating: 8.2, trailerUrl: "https://www.youtube.com/watch?v=EF3SiXfbgMc" },
  { title: "Pushpa: The Rise", genre: ["Action", "Crime", "Drama"], language: "Telugu", duration: 179, releaseDate: new Date("2021-12-17"), description: "A laborer rises through the ranks of a red sandalwood smuggling syndicate.", poster: "https://image.tmdb.org/t/p/w500/0G3zBGSGaENmYqUawrAXsMRsJwS.jpg", rating: 7.6, trailerUrl: "https://www.youtube.com/watch?v=Q1NKMPhP8PY" },
  { title: "Vikram", genre: ["Action", "Crime", "Thriller"], language: "Tamil", duration: 174, releaseDate: new Date("2022-06-03"), description: "A special agent investigates a series of brutal murders with a mysterious connection.", poster: "https://image.tmdb.org/t/p/w500/9EAOJCfFNVHE8UdRvSSQGf8Cjup.jpg", rating: 8.4, trailerUrl: "https://www.youtube.com/watch?v=OKBMCL-frPU" },
  { title: "Varisu", genre: ["Action", "Drama", "Family"], language: "Tamil", duration: 169, releaseDate: new Date("2023-01-12"), description: "A wealthy tycoon's son must rebuild his father's crumbling business empire.", poster: "https://image.tmdb.org/t/p/w500/jpRtHJ00sWG0d3fPiKfPHZP7PfV.jpg", rating: 6.8, trailerUrl: "https://www.youtube.com/watch?v=Zn0e6nz3FuI" },
  { title: "Leo", genre: ["Action", "Crime"], language: "Tamil", duration: 164, releaseDate: new Date("2023-10-19"), description: "A mild-mannered café owner's dark past comes back to haunt him.", poster: "https://image.tmdb.org/t/p/w500/tYrHNGPdV67mJZIxHJdnGmhbLWK.jpg", rating: 7.2, trailerUrl: "https://www.youtube.com/watch?v=sNEiMcnOJZM" },
  { title: "Ponniyin Selvan: Part I", genre: ["Action", "Drama", "History"], language: "Tamil", duration: 167, releaseDate: new Date("2022-09-30"), description: "The story of the young Chola prince Arulmozhi Varman who later became the great Raja Raja Chola.", poster: "https://image.tmdb.org/t/p/w500/7fMpIuMFkXqJWgE0vBTIRgGqzIC.jpg", rating: 8.0, trailerUrl: "https://www.youtube.com/watch?v=J1Lzz23fnNs" },
  { title: "Adipurush", genre: ["Action", "Drama", "Fantasy"], language: "Hindi", duration: 140, releaseDate: new Date("2023-06-16"), description: "The story of Lord Rama who arrives to free his wife Sita from demon king Lankesh.", poster: "https://image.tmdb.org/t/p/w500/qPPmoa9Wec7CGYQHPF5YPGDV7pL.jpg", rating: 4.5, trailerUrl: "https://www.youtube.com/watch?v=AiGLvfH8_JA" },
  { title: "Animal", genre: ["Action", "Crime", "Drama"], language: "Hindi", duration: 201, releaseDate: new Date("2023-12-01"), description: "An estranged son returns to help his father after a threat to his life and becomes involved in crime.", poster: "https://image.tmdb.org/t/p/w500/wqna0vXS8zQy1Y0yHeMrVFIjRJi.jpg", rating: 7.1, trailerUrl: "https://www.youtube.com/watch?v=cUHZ80hSMy8" },
  { title: "Dunki", genre: ["Comedy", "Drama"], language: "Hindi", duration: 161, releaseDate: new Date("2023-12-21"), description: "A group of friends from Punjab take an illegal immigration route to reach UK.", poster: "https://image.tmdb.org/t/p/w500/AkDTAX6EMSxKXRO5VGLj2VeCBvb.jpg", rating: 6.8, trailerUrl: "https://www.youtube.com/watch?v=qULUZ7SWCE4" },
  { title: "Rocky Aur Rani Kii Prem Kahaani", genre: ["Comedy", "Drama", "Romance"], language: "Hindi", duration: 168, releaseDate: new Date("2023-07-28"), description: "Two individuals from very different backgrounds fall in love and try to understand each other's families.", poster: "https://image.tmdb.org/t/p/w500/aQyBiSTnzBXUkSCHkB0zrGiEMVq.jpg", rating: 7.2, trailerUrl: "https://www.youtube.com/watch?v=AFoiSkNxsG0" },
  { title: "Tu Jhoothi Main Makkaar", genre: ["Comedy", "Romance"], language: "Hindi", duration: 158, releaseDate: new Date("2023-03-08"), description: "A professional breakup artist falls for his client's boyfriend and struggles to reconcile love and lies.", poster: "https://image.tmdb.org/t/p/w500/hPLyIZK6Y5EKGYWaIJiJLW0mPuU.jpg", rating: 6.9, trailerUrl: "https://www.youtube.com/watch?v=X7XxeH_0BFo" },
  { title: "OMG 2", genre: ["Comedy", "Drama"], language: "Hindi", duration: 147, releaseDate: new Date("2023-08-11"), description: "A devotee of Lord Shiva fights the conservative education system's silence about sex education.", poster: "https://image.tmdb.org/t/p/w500/lzKm5j1tSRCR0Ns3InaxHdIE7oL.jpg", rating: 7.5, trailerUrl: "https://www.youtube.com/watch?v=EwFY0PPdz2Q" },
  // Korean Cinema
  { title: "Parasite", genre: ["Drama", "Thriller", "Comedy"], language: "Korean", duration: 132, releaseDate: new Date("2019-05-30"), description: "A poor family schemes to become employed by a wealthy family and infiltrate their household.", poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", rating: 8.5, trailerUrl: "https://www.youtube.com/watch?v=5xH0HfJHsaY" },
  { title: "Train to Busan", genre: ["Action", "Horror", "Drama"], language: "Korean", duration: 118, releaseDate: new Date("2016-07-22"), description: "While a zombie virus breaks out in South Korea, a father and daughter are caught in the middle.", poster: "https://image.tmdb.org/t/p/w500/oWnkOFN0sxrqeUbz34cHCEeABQ4.jpg", rating: 7.6, trailerUrl: "https://www.youtube.com/watch?v=pyWuHv2-Abk" },
  { title: "The Wailing", genre: ["Horror", "Mystery", "Thriller"], language: "Korean", duration: 156, releaseDate: new Date("2016-05-12"), description: "A stranger arrives in a Korean village and strange deaths begin occurring.", poster: "https://image.tmdb.org/t/p/w500/a3OkpblMzNYeD4T59T3iWIhK0Ro.jpg", rating: 7.5, trailerUrl: "https://www.youtube.com/watch?v=nXtWTTM-TUc" },
  { title: "The Handmaiden", genre: ["Drama", "Mystery", "Romance"], language: "Korean", duration: 144, releaseDate: new Date("2016-06-01"), description: "A woman is hired as a handmaiden to a Japanese heiress, but there is a sinister plot behind her service.", poster: "https://image.tmdb.org/t/p/w500/eTF3VmMOZjCHBEcIgQVrFfYAkBl.jpg", rating: 8.1, trailerUrl: "https://www.youtube.com/watch?v=whldChqCsYk" },
  // Animation
  { title: "The Little Mermaid", genre: ["Animation", "Adventure", "Family"], language: "English", duration: 135, releaseDate: new Date("2023-05-26"), description: "A young mermaid makes a deal with a sea witch to trade her beautiful voice for human legs.", poster: "https://image.tmdb.org/t/p/w500/ym1dxyOk4jFcSl4Q2zmRrA5BEEN.jpg", rating: 7.1, trailerUrl: "https://www.youtube.com/watch?v=TBsXoLKX-Ks" },
  { title: "Elemental", genre: ["Animation", "Adventure", "Fantasy"], language: "English", duration: 101, releaseDate: new Date("2023-06-16"), description: "In a city where fire, water, land, and air residents live together, a fiery woman and a go-with-the-flow guy discover something elemental.", poster: "https://image.tmdb.org/t/p/w500/4Y1WNkd88JXmGfhtWR7dmDAo1T2.jpg", rating: 7.0, trailerUrl: "https://www.youtube.com/watch?v=pqHpSBCzBrg" },
  { title: "Puss in Boots: The Last Wish", genre: ["Animation", "Adventure", "Comedy"], language: "English", duration: 100, releaseDate: new Date("2022-12-21"), description: "Puss in Boots discovers his passion for life reignited when he sets out on an epic journey to restore his nine lives.", poster: "https://image.tmdb.org/t/p/w500/kuf6dutpsT0vSVehic3EZIqkOBt.jpg", rating: 7.9, trailerUrl: "https://www.youtube.com/watch?v=tHb7WlgyaUc" },
  { title: "Spider-Man: Into the Spider-Verse", genre: ["Animation", "Action", "Adventure"], language: "English", duration: 117, releaseDate: new Date("2018-12-14"), description: "Teen Miles Morales becomes Spider-Man of his reality and crosses paths with alternate versions of himself.", poster: "https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg", rating: 8.4, trailerUrl: "https://www.youtube.com/watch?v=tg52up16eq0" },
  { title: "Spider-Man: Across the Spider-Verse", genre: ["Animation", "Action", "Adventure"], language: "English", duration: 140, releaseDate: new Date("2023-06-02"), description: "Miles Morales journeys across the Multiverse, where he encounters a team of Spider-People.", poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg", rating: 8.7, trailerUrl: "https://www.youtube.com/watch?v=cqGjhVJWtEg" },
  { title: "The Super Mario Bros. Movie", genre: ["Animation", "Adventure", "Comedy"], language: "English", duration: 92, releaseDate: new Date("2023-04-05"), description: "Mario and Luigi are transported to a mushroom kingdom where they must face Bowser.", poster: "https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggkl.jpg", rating: 7.1, trailerUrl: "https://www.youtube.com/watch?v=TnGl01FkMMo" },
  { title: "Encanto", genre: ["Animation", "Comedy", "Family"], language: "English", duration: 99, releaseDate: new Date("2021-11-26"), description: "A young Colombian girl finds herself to be the only family member without magical powers.", poster: "https://image.tmdb.org/t/p/w500/4j0PNHkMr5ax3IA8tjtxcmPU3QT.jpg", rating: 7.2, trailerUrl: "https://www.youtube.com/watch?v=CaimKeDcudo" },
  // Horror / Thriller
  { title: "Get Out", genre: ["Horror", "Mystery", "Thriller"], language: "English", duration: 104, releaseDate: new Date("2017-02-24"), description: "A Black man meets his white girlfriend's parents for a weekend getaway that reveals disturbing secrets.", poster: "https://image.tmdb.org/t/p/w500/tFXcEccSUFedh6WZj7OeiVL25fX.jpg", rating: 7.7, trailerUrl: "https://www.youtube.com/watch?v=DzfpyUB60YY" },
  { title: "A Quiet Place", genre: ["Drama", "Horror", "Sci-Fi"], language: "English", duration: 90, releaseDate: new Date("2018-04-06"), description: "A family struggles to survive in a post-apocalyptic world inhabited by blind creatures that hunt by sound.", poster: "https://image.tmdb.org/t/p/w500/nAU74GmpUk7t5iklEp3bufwDq4n.jpg", rating: 7.5, trailerUrl: "https://www.youtube.com/watch?v=WR7cc5t7tv8" },
  { title: "Midsommar", genre: ["Drama", "Horror", "Mystery"], language: "English", duration: 148, releaseDate: new Date("2019-07-03"), description: "A couple travel to Sweden to visit a festival that only takes place every 90 years.", poster: "https://image.tmdb.org/t/p/w500/7LEI8ulZzO5gy9Ww2NVCrKmHeDZ.jpg", rating: 7.1, trailerUrl: "https://www.youtube.com/watch?v=1Vnghdsjmd0" },
  { title: "The Conjuring", genre: ["Horror", "Mystery", "Thriller"], language: "English", duration: 112, releaseDate: new Date("2013-07-19"), description: "Paranormal investigators couple help a family terrorized by a dark presence in their farmhouse.", poster: "https://image.tmdb.org/t/p/w500/wVYREutTvI2tmxr6ujrHT704wGF.jpg", rating: 7.5, trailerUrl: "https://www.youtube.com/watch?v=k10ETZ41q5o" },
  { title: "Us", genre: ["Horror", "Mystery", "Thriller"], language: "English", duration: 116, releaseDate: new Date("2019-03-22"), description: "A family's vacation turns into chaos when doppelgangers of themselves appear and target them.", poster: "https://image.tmdb.org/t/p/w500/ux2dU1jQ2ACIMShzB3c8SHaj4dA.jpg", rating: 6.8, trailerUrl: "https://www.youtube.com/watch?v=hYjnCd4W1Vc" },
  // Drama / Classic
  { title: "The Shawshank Redemption", genre: ["Drama", "Crime"], language: "English", duration: 142, releaseDate: new Date("1994-09-23"), description: "Two imprisoned men bond over a number of years, finding solace and redemption through basic decency.", poster: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg", rating: 9.3, trailerUrl: "https://www.youtube.com/watch?v=6hB3S9bIaco" },
  { title: "Forrest Gump", genre: ["Drama", "Comedy", "Romance"], language: "English", duration: 142, releaseDate: new Date("1994-07-06"), description: "The story of an Alabama man who, despite his low IQ, witnesses and influences several historical events.", poster: "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg", rating: 8.8, trailerUrl: "https://www.youtube.com/watch?v=bLvqoHBptjg" },
  { title: "The Godfather", genre: ["Crime", "Drama"], language: "English", duration: 175, releaseDate: new Date("1972-03-24"), description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.", poster: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsLFxBJlSS4n6.jpg", rating: 9.2, trailerUrl: "https://www.youtube.com/watch?v=sY1S34973zA" },
  { title: "Pulp Fiction", genre: ["Crime", "Drama", "Thriller"], language: "English", duration: 154, releaseDate: new Date("1994-10-14"), description: "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence.", poster: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", rating: 8.9, trailerUrl: "https://www.youtube.com/watch?v=s7EdQ4FqbhY" },
  { title: "Schindler's List", genre: ["Biography", "Drama", "History"], language: "English", duration: 195, releaseDate: new Date("1993-12-15"), description: "In German-occupied Poland during World War II, industrialist Oskar Schindler saves thousands of Jews.", poster: "https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg", rating: 9.0, trailerUrl: "https://www.youtube.com/watch?v=mxphAlJID9U" },
  { title: "The Matrix", genre: ["Sci-Fi", "Action"], language: "English", duration: 136, releaseDate: new Date("1999-03-31"), description: "A computer hacker learns about the true nature of reality and his role in the war against its controllers.", poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", rating: 8.7, trailerUrl: "https://www.youtube.com/watch?v=vKQi3bBA1y8" },
  { title: "Gladiator", genre: ["Action", "Adventure", "Drama"], language: "English", duration: 155, releaseDate: new Date("2000-05-05"), description: "A Roman general becomes a gladiator after being betrayed and seeks revenge against a corrupt emperor.", poster: "https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg", rating: 8.5, trailerUrl: "https://www.youtube.com/watch?v=owK1qxDselE" },
  // Recent Releases
  { title: "Aquaman and the Lost Kingdom", genre: ["Action", "Adventure", "Fantasy"], language: "English", duration: 124, releaseDate: new Date("2023-12-22"), description: "Aquaman must forge an uneasy alliance with an unlikely ally to protect Atlantis and the world.", poster: "https://image.tmdb.org/t/p/w500/8xV47NDrjdZDpkVcCFqkdHa3T0C.jpg", rating: 5.9, trailerUrl: "https://www.youtube.com/watch?v=BgRoiTWkBHU" },
  { title: "The Flash", genre: ["Action", "Adventure", "Fantasy"], language: "English", duration: 144, releaseDate: new Date("2023-06-16"), description: "Barry Allen uses his super speed to change the past, but his attempt to save his family creates a world without superheroes.", poster: "https://image.tmdb.org/t/p/w500/rktDFPbfHfUbArZ6OOOKsXcv0Xs.jpg", rating: 6.7, trailerUrl: "https://www.youtube.com/watch?v=hebWYacbdvc" },
  { title: "Ant-Man and the Wasp: Quantumania", genre: ["Action", "Adventure", "Comedy"], language: "English", duration: 124, releaseDate: new Date("2023-02-17"), description: "Scott Lang and Hope Van Dyne are pulled into the Quantum Realm where they encounter Kang the Conqueror.", poster: "https://image.tmdb.org/t/p/w500/ngl2FKBlU4fhbdsrtdom9LVLBXw.jpg", rating: 6.1, trailerUrl: "https://www.youtube.com/watch?v=ZlNFpri-Y40" },
  { title: "Indiana Jones and the Dial of Destiny", genre: ["Action", "Adventure"], language: "English", duration: 154, releaseDate: new Date("2023-06-30"), description: "Archaeologist Indiana Jones searches for an ancient dial that can change the outcome of history.", poster: "https://image.tmdb.org/t/p/w500/Af4bXE63pVsb2FtbW8uYIyPBadD.jpg", rating: 6.6, trailerUrl: "https://www.youtube.com/watch?v=eQfMbSe7F2g" },
  { title: "Killers of the Flower Moon", genre: ["Crime", "Drama", "History"], language: "English", duration: 206, releaseDate: new Date("2023-10-20"), description: "Members of the Osage Nation in 1920s Oklahoma are murdered under mysterious circumstances.", poster: "https://image.tmdb.org/t/p/w500/dB6jcPKNbpwRD4p9FMBK8rVeOdR.jpg", rating: 7.7, trailerUrl: "https://www.youtube.com/watch?v=EP34Yoxs3FQ" },
  { title: "Napoleon", genre: ["Action", "Biography", "Drama"], language: "English", duration: 158, releaseDate: new Date("2023-11-22"), description: "An epic of Napoleon Bonaparte's origins and rise to power in an intimate look at his relationship with Josephine.", poster: "https://image.tmdb.org/t/p/w500/jE5o7y9K6pZtWNNMEwr3n3R55zC.jpg", rating: 6.6, trailerUrl: "https://www.youtube.com/watch?v=OAZWXUkrjPc" },
  { title: "The Marvels", genre: ["Action", "Adventure", "Fantasy"], language: "English", duration: 105, releaseDate: new Date("2023-11-10"), description: "Carol Danvers, Kamala Khan, and Monica Rambeau must work together when their powers become entangled.", poster: "https://image.tmdb.org/t/p/w500/Ag3QMAbTMT82BEp6hm6FCqm4P5.jpg", rating: 5.9, trailerUrl: "https://www.youtube.com/watch?v=wS_qbDztgVY" },
  { title: "Five Nights at Freddy's", genre: ["Horror", "Mystery", "Thriller"], language: "English", duration: 110, releaseDate: new Date("2023-10-27"), description: "A security guard discovers that the animatronics at Freddy Fazbear's Pizza come alive and target people.", poster: "https://image.tmdb.org/t/p/w500/A4j8S6moJS2zNtRR8T4QXjnFnea.jpg", rating: 5.7, trailerUrl: "https://www.youtube.com/watch?v=0XMnTmVMBqE" },
  { title: "Saltburn", genre: ["Drama", "Mystery", "Thriller"], language: "English", duration: 127, releaseDate: new Date("2023-11-17"), description: "A student becomes obsessed with a charismatic classmate and his aristocratic family's estate.", poster: "https://image.tmdb.org/t/p/w500/qjhahNLSZ705B5JP92YMEYPocPz.jpg", rating: 7.2, trailerUrl: "https://www.youtube.com/watch?v=VJvECItRx-k" },
  { title: "Past Lives", genre: ["Drama", "Romance"], language: "English", duration: 106, releaseDate: new Date("2023-06-02"), description: "Two childhood sweethearts are reunited in New York after 20 years apart.", poster: "https://image.tmdb.org/t/p/w500/k3waqVXsnbXFPBLzBFdHe98S3la.jpg", rating: 7.9, trailerUrl: "https://www.youtube.com/watch?v=kA7-bFrKWbE" },
  { title: "Poor Things", genre: ["Comedy", "Drama", "Fantasy"], language: "English", duration: 141, releaseDate: new Date("2023-12-08"), description: "The incredible tale about the fantastic evolution of Bella Baxter, a young woman brought back to life.", poster: "https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXEBzewrGvHSbLq.jpg", rating: 8.0, trailerUrl: "https://www.youtube.com/watch?v=RlbR5N6veqw" },
  { title: "All of Us Strangers", genre: ["Drama", "Fantasy", "Romance"], language: "English", duration: 105, releaseDate: new Date("2023-12-22"), description: "A screenwriter falls in love with a mysterious neighbor while visiting his childhood home.", poster: "https://image.tmdb.org/t/p/w500/qVKsHHaIAJUakOKxuEw9CDQLKWY.jpg", rating: 7.8, trailerUrl: "https://www.youtube.com/watch?v=j-3L-f2PZxI" },
  { title: "Wonka", genre: ["Adventure", "Comedy", "Family"], language: "English", duration: 116, releaseDate: new Date("2023-12-15"), description: "With dreams of opening a shop in a city renowned for its chocolate, a young Willy Wonka discovers that the industry is run by a corrupt cartel.", poster: "https://image.tmdb.org/t/p/w500/qhb1qOilapbapxWQn9jtRkEaGOj.jpg", rating: 7.2, trailerUrl: "https://www.youtube.com/watch?v=otNh9bTjXWg" },
  // More Bollywood & Indian
  { title: "War", genre: ["Action", "Thriller"], language: "Hindi", duration: 154, releaseDate: new Date("2019-10-02"), description: "An Indian soldier is assigned to eliminate his former mentor who has now turned rogue.", poster: "https://image.tmdb.org/t/p/w500/qOdg9LHX3J1KAFAZnl73JQ7sPeN.jpg", rating: 6.5, trailerUrl: "https://www.youtube.com/watch?v=dl4c7OK7pnQ" },
  { title: "Tanhaji: The Unsung Warrior", genre: ["Action", "Biography", "Drama"], language: "Hindi", duration: 135, releaseDate: new Date("2020-01-10"), description: "The story of Maratha warrior Tanhaji Malusare who fought for Chatrapati Shivaji Maharaj.", poster: "https://image.tmdb.org/t/p/w500/9EaFxfWelJSn6CKWA4X1oOjkMHi.jpg", rating: 7.3, trailerUrl: "https://www.youtube.com/watch?v=PnG1TLAL9Ms" },
  { title: "Thugs of Hindostan", genre: ["Action", "Adventure"], language: "Hindi", duration: 165, releaseDate: new Date("2018-11-08"), description: "A village chief's son leads a band of freedom fighters in a mission to free the country from British rule.", poster: "https://image.tmdb.org/t/p/w500/n0mkBYVQaLNm5BjQlYF6BuKO6WL.jpg", rating: 4.9, trailerUrl: "https://www.youtube.com/watch?v=JNIP90kvYnU" },
  { title: "Mission Mangal", genre: ["Biography", "Drama", "History"], language: "Hindi", duration: 130, releaseDate: new Date("2019-08-15"), description: "Scientists and their struggles in making the Mars Orbiter Mission a success.", poster: "https://image.tmdb.org/t/p/w500/dj1LhHJJllBN8hF9mYPiOjxzHkj.jpg", rating: 7.0, trailerUrl: "https://www.youtube.com/watch?v=LJlVEmpBLDE" },
  { title: "URI: The Surgical Strike", genre: ["Action", "Drama", "Thriller"], language: "Hindi", duration: 138, releaseDate: new Date("2019-01-11"), description: "India retaliates against the Uri terrorist attack with a covert military strike.", poster: "https://image.tmdb.org/t/p/w500/4lRKbZ6MBgHHXKFRq3jV3fGO3f8.jpg", rating: 8.1, trailerUrl: "https://www.youtube.com/watch?v=SNgqhWLSamc" },
  { title: "Bajrangi Bhaijaan", genre: ["Adventure", "Comedy", "Drama"], language: "Hindi", duration: 163, releaseDate: new Date("2015-07-17"), description: "An Indian man goes on a journey to reunite a mute girl with her family in Pakistan.", poster: "https://image.tmdb.org/t/p/w500/g4J5bIfBJjGt32V6V1fpBjRyThw.jpg", rating: 8.1, trailerUrl: "https://www.youtube.com/watch?v=vRMi7N84cXo" },
  { title: "Sultan", genre: ["Action", "Drama", "Sport"], language: "Hindi", duration: 170, releaseDate: new Date("2016-07-06"), description: "Sultan Ali Khan, an Indian wrestler, battles the politics of sports and personal tragedy.", poster: "https://image.tmdb.org/t/p/w500/lLYcS8oS2dCQaGYYFkv0oQP0IqS.jpg", rating: 7.0, trailerUrl: "https://www.youtube.com/watch?v=Sg4Tl_hWFEo" },
  { title: "Dhoom 3", genre: ["Action", "Crime", "Thriller"], language: "Hindi", duration: 172, releaseDate: new Date("2013-12-20"), description: "A police officer and his partner go after a circus performer and his twin brother who run a bank heist.", poster: "https://image.tmdb.org/t/p/w500/yUBdqyOvTB4DzBR6eAlVGqJyb6N.jpg", rating: 5.3, trailerUrl: "https://www.youtube.com/watch?v=YXMi9z9V8aM" },
  { title: "Dilwale Dulhania Le Jayenge", genre: ["Drama", "Romance"], language: "Hindi", duration: 189, releaseDate: new Date("1995-10-20"), description: "A young man and woman fall in love on a trip across Europe, but the girl is promised to a man in India.", poster: "https://image.tmdb.org/t/p/w500/kbFbC7U2bHtiSjmSaKnJe3qmTtW.jpg", rating: 8.1, trailerUrl: "https://www.youtube.com/watch?v=RCIMgRcQPXg" },
  { title: "Mughal-E-Azam", genre: ["Drama", "History", "Romance"], language: "Hindi", duration: 173, releaseDate: new Date("1960-08-05"), description: "The story of the forbidden love between Mughal Prince Salim and the beautiful court dancer Anarkali.", poster: "https://image.tmdb.org/t/p/w500/jHcpbS1DaKBgwfb8vd2G4Pklh4y.jpg", rating: 8.2, trailerUrl: "https://www.youtube.com/watch?v=MVQE5uIHhPs" },
  { title: "Sholay", genre: ["Action", "Adventure", "Drama"], language: "Hindi", duration: 204, releaseDate: new Date("1975-08-15"), description: "A retired police officer hires two criminals to capture a dangerous dacoit.", poster: "https://image.tmdb.org/t/p/w500/xsZ4O4xiIMsTvXPxPq5tVwdH6Qn.jpg", rating: 8.2, trailerUrl: "https://www.youtube.com/watch?v=Sk2rvH6ZS8k" },
  // Tamil / South Indian
  { title: "Master", genre: ["Action", "Crime", "Drama"], language: "Tamil", duration: 179, releaseDate: new Date("2021-01-13"), description: "An alcoholic professor is sent to a juvenile school, where he faces a gangster who uses children for criminal activities.", poster: "https://image.tmdb.org/t/p/w500/8dDfFUaxSaSjSHvBTCMsGiAWg3u.jpg", rating: 7.8, trailerUrl: "https://www.youtube.com/watch?v=y9tTUMFRPHo" },
  { title: "Bigil", genre: ["Action", "Drama", "Sport"], language: "Tamil", duration: 179, releaseDate: new Date("2019-10-25"), description: "A football coach helps a women's team reach the national championship while dealing with gangster threats.", poster: "https://image.tmdb.org/t/p/w500/rJDW0MrVTjR5MYeWjEuKJxaxOOq.jpg", rating: 7.4, trailerUrl: "https://www.youtube.com/watch?v=nQ1TcpDtHDY" },
  { title: "Enthiran", genre: ["Action", "Drama", "Sci-Fi"], language: "Tamil", duration: 177, releaseDate: new Date("2010-10-01"), description: "A scientist creates a humanoid robot, and both fall in love with the same woman.", poster: "https://image.tmdb.org/t/p/w500/4OjNXuZWZXhVmfKhJR1VrMiMO5a.jpg", rating: 7.3, trailerUrl: "https://www.youtube.com/watch?v=5dBbGLb6ZTQ" },
  { title: "2.0", genre: ["Action", "Fantasy", "Sci-Fi"], language: "Tamil", duration: 148, releaseDate: new Date("2018-11-29"), description: "A robot and the spirit of a dead ornithologist who possesses cell phones fight each other.", poster: "https://image.tmdb.org/t/p/w500/hW1ek8lp6rEBPHoflA3qbJm6HdB.jpg", rating: 6.5, trailerUrl: "https://www.youtube.com/watch?v=BtEb6MrNHgA" },
  { title: "Kadal", genre: ["Action", "Drama", "Romance"], language: "Tamil", duration: 157, releaseDate: new Date("2013-01-18"), description: "A small-town young man meets and falls for a woman at a fisherman's village.", poster: "https://image.tmdb.org/t/p/w500/j7M8HqiCgFtAZ3U8nvfqHbLaxZ.jpg", rating: 6.2, trailerUrl: "https://www.youtube.com/watch?v=XJRzd9Sqy3A" },
  // Western / Global
  { title: "No Country for Old Men", genre: ["Crime", "Drama", "Thriller"], language: "English", duration: 122, releaseDate: new Date("2007-11-09"), description: "Violence and mayhem ensue after a hunter stumbles upon a drug deal gone wrong and a briefcase full of cash.", poster: "https://image.tmdb.org/t/p/w500/bj1v6vKVDJkHh3bSoiRmEh3DKRB.jpg", rating: 8.2, trailerUrl: "https://www.youtube.com/watch?v=38A__WT3-o0" },
  { title: "There Will Be Blood", genre: ["Drama", "History"], language: "English", duration: 158, releaseDate: new Date("2007-12-26"), description: "A greedy silver miner turns oil prospector in early 20th century California.", poster: "https://image.tmdb.org/t/p/w500/fa0RDkAlCec0STeMNAhPaF89q6U.jpg", rating: 8.2, trailerUrl: "https://www.youtube.com/watch?v=xGqIyt_jZLc" },
  { title: "Mad Max: Fury Road", genre: ["Action", "Adventure", "Sci-Fi"], language: "English", duration: 120, releaseDate: new Date("2015-05-15"), description: "In a post-apocalyptic wasteland, a woman rebels against a tyrant while escaping in a vehicle.", poster: "https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg", rating: 8.1, trailerUrl: "https://www.youtube.com/watch?v=hEJnMQG9ev8" },
  { title: "Blade Runner 2049", genre: ["Drama", "Mystery", "Sci-Fi"], language: "English", duration: 164, releaseDate: new Date("2017-10-06"), description: "A young blade runner discovers a secret that could plunge what's left of society into chaos.", poster: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg", rating: 8.0, trailerUrl: "https://www.youtube.com/watch?v=haAVnXxMPZ4" },
  { title: "Arrival", genre: ["Drama", "Mystery", "Sci-Fi"], language: "English", duration: 116, releaseDate: new Date("2016-11-11"), description: "A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world.", poster: "https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg", rating: 7.9, trailerUrl: "https://www.youtube.com/watch?v=tFMo3UJ4B4g" },
  { title: "Hereditary", genre: ["Drama", "Horror", "Mystery"], language: "English", duration: 127, releaseDate: new Date("2018-06-08"), description: "A grieving family is haunted by tragic and disturbing events after their grandmother's death.", poster: "https://image.tmdb.org/t/p/w500/p9tJAjfPBASc0UQELKFfRijkVJE.jpg", rating: 7.3, trailerUrl: "https://www.youtube.com/watch?v=V6wWKNij_1M" },
  { title: "Everything Everywhere All at Once", genre: ["Action", "Adventure", "Comedy"], language: "English", duration: 139, releaseDate: new Date("2022-03-25"), description: "An aging Chinese immigrant is swept up in an insane adventure in which she alone can save the world.", poster: "https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg", rating: 7.8, trailerUrl: "https://www.youtube.com/watch?v=wxN1T1uxQ2g" },
  { title: "Glass Onion: A Knives Out Mystery", genre: ["Comedy", "Crime", "Drama"], language: "English", duration: 139, releaseDate: new Date("2022-11-23"), description: "Detective Benoit Blanc travels to Greece to peel back the layers of a mystery involving a tech billionaire.", poster: "https://image.tmdb.org/t/p/w500/vDGr1YdrlfbU9wxTOdpf3zChmv9.jpg", rating: 7.1, trailerUrl: "https://www.youtube.com/watch?v=LSaDMy7TGSU" },
  { title: "Triangle of Sadness", genre: ["Comedy", "Drama"], language: "English", duration: 147, releaseDate: new Date("2022-10-28"), description: "A fashion model celebrity couple are thrown into a chaotic situation when their cruise ship sinks.", poster: "https://image.tmdb.org/t/p/w500/tzZFHKKBpSLJMFMFkMhWoTK37D5.jpg", rating: 7.3, trailerUrl: "https://www.youtube.com/watch?v=VDvfFIZQIuQ" },
  { title: "Tar", genre: ["Drama", "Music"], language: "English", duration: 158, releaseDate: new Date("2022-10-28"), description: "Set in the international world of classical music, the film centers on Lydia Tár, a world-class composer and conductor.", poster: "https://image.tmdb.org/t/p/w500/m8M7bBD0MFJCMdyMJ2SxmhRR87x.jpg", rating: 7.5, trailerUrl: "https://www.youtube.com/watch?v=zFMZZoEyFNM" },
  { title: "Women Talking", genre: ["Drama"], language: "English", duration: 104, releaseDate: new Date("2022-12-23"), description: "In 2010, the women of an isolated religious colony grapple with reconciling their faith with a series of unforgivable acts committed against them.", poster: "https://image.tmdb.org/t/p/w500/yUBdqyOvTB4DzBR6eAlVGqJyb6N.jpg", rating: 7.3, trailerUrl: "https://www.youtube.com/watch?v=p3-Zy2TXA7E" },
  // More varied
  { title: "Puss in Boots", genre: ["Animation", "Adventure", "Comedy"], language: "English", duration: 90, releaseDate: new Date("2011-10-28"), description: "The story of the cat's earliest adventure as he teams up with Humpty Dumpty to steal the legendary Golden Goose.", poster: "https://image.tmdb.org/t/p/w500/uyGmUFLmcYEJYrRrBJuHlXnxHaS.jpg", rating: 6.6, trailerUrl: "https://www.youtube.com/watch?v=vRe9PQXY9qk" },
  { title: "Moana", genre: ["Animation", "Adventure", "Comedy"], language: "English", duration: 107, releaseDate: new Date("2016-11-23"), description: "In Ancient Polynesia, when a terrible curse incites the ocean to revolt, it's up to Moana to seek out the demigod Maui.", poster: "https://image.tmdb.org/t/p/w500/iWugLVHFECXcJfXJhzn7SSTi1kF.jpg", rating: 7.6, trailerUrl: "https://www.youtube.com/watch?v=LKFuXETZUsI" },
  { title: "Coco", genre: ["Animation", "Adventure", "Drama"], language: "English", duration: 105, releaseDate: new Date("2017-11-22"), description: "Aspiring musician Miguel, confronted with his family's generations-old ban on music, enters the Land of the Dead.", poster: "https://image.tmdb.org/t/p/w500/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg", rating: 8.4, trailerUrl: "https://www.youtube.com/watch?v=Rvr68u6k5sI" },
  { title: "Black Adam", genre: ["Action", "Adventure", "Fantasy"], language: "English", duration: 125, releaseDate: new Date("2022-10-21"), description: "Nearly 5,000 years after he was bestowed with the almighty powers of the Egyptian gods–and imprisoned just as quickly–Black Adam is freed.", poster: "https://image.tmdb.org/t/p/w500/pFlaoHTZeyNkG83vxsAJiGzfSsa.jpg", rating: 6.3, trailerUrl: "https://www.youtube.com/watch?v=X0tOpBuYasI" },
  { title: "Uncharted", genre: ["Action", "Adventure"], language: "English", duration: 116, releaseDate: new Date("2022-02-18"), description: "Street-smart Nathan Drake is recruited by seasoned treasure hunter Victor Sullivan to recover a fortune.", poster: "https://image.tmdb.org/t/p/w500/sqLowacltbZLoCa4KYye64RvvdQ.jpg", rating: 6.5, trailerUrl: "https://www.youtube.com/watch?v=P7t4w-4AGXM" },
  { title: "Morbius", genre: ["Action", "Adventure", "Fantasy"], language: "English", duration: 104, releaseDate: new Date("2022-04-01"), description: "One of Marvel's most compelling and conflicted characters comes to the big screen as brilliant scientist Michael Morbius transforms into a Morbiusian vampire.", poster: "https://image.tmdb.org/t/p/w500/6JjfSchsU6daXk2AKX8EEBjO3Fm.jpg", rating: 5.2, trailerUrl: "https://www.youtube.com/watch?v=oZ6iiRrz1Ea" },
  { title: "Moonfall", genre: ["Action", "Adventure", "Sci-Fi"], language: "English", duration: 130, releaseDate: new Date("2022-02-04"), description: "A conspiracy theorist, a former astronaut, and a NASA executive join forces to prevent the Moon from crashing into Earth.", poster: "https://image.tmdb.org/t/p/w500/odVv1sqVs0KxHTiDCEDECWCGxTc.jpg", rating: 5.2, trailerUrl: "https://www.youtube.com/watch?v=gJJqoUNf7PY" },
  { title: "Fantastic Beasts: The Secrets of Dumbledore", genre: ["Adventure", "Family", "Fantasy"], language: "English", duration: 142, releaseDate: new Date("2022-04-15"), description: "Albus Dumbledore asks Magizoologist Newt Scamander to lead an intrepid team of wizards to stop dark wizard Gellert Grindelwald.", poster: "https://image.tmdb.org/t/p/w500/jrgifaYeUtTnaH7NF5Drkgjg2MB.jpg", rating: 6.1, trailerUrl: "https://www.youtube.com/watch?v=Y9dr2zw-TXQ" },
  { title: "Sonic the Hedgehog 2", genre: ["Action", "Adventure", "Comedy"], language: "English", duration: 122, releaseDate: new Date("2022-04-08"), description: "After settling in Green Hills, Sonic is eager to prove he has the makings of a true hero as Dr. Robotnik returns.", poster: "https://image.tmdb.org/t/p/w500/6DrHO1jr3qVrViUO6s6kFiAGM7.jpg", rating: 6.4, trailerUrl: "https://www.youtube.com/watch?v=N19sdTFX5a4" },
  { title: "Sonic the Hedgehog 3", genre: ["Action", "Adventure", "Comedy"], language: "English", duration: 110, releaseDate: new Date("2024-12-20"), description: "Sonic, Knuckles, and Tails reunite against a powerful new adversary, Shadow the Hedgehog.", poster: "https://image.tmdb.org/t/p/w500/4IVFtVFrpL8pXqLLJKxaAVMlvkO.jpg", rating: 7.4, trailerUrl: "https://www.youtube.com/watch?v=D21S5PrZkZ4" },
  { title: "Ghostbusters: Frozen Empire", genre: ["Action", "Comedy", "Fantasy"], language: "English", duration: 115, releaseDate: new Date("2024-03-22"), description: "The Spengler family returns to where it all started – the iconic New York City firehouse – to team up with the original Ghostbusters.", poster: "https://image.tmdb.org/t/p/w500/sg4xJaufDiQl7caFEskBtQXfD4x.jpg", rating: 6.5, trailerUrl: "https://www.youtube.com/watch?v=s2iYTTcZY2k" },
  { title: "Godzilla x Kong: The New Empire", genre: ["Action", "Adventure", "Sci-Fi"], language: "English", duration: 115, releaseDate: new Date("2024-03-29"), description: "Two ancient titans, Godzilla and Kong, clash in an epic battle as humans unravel their intertwined origins.", poster: "https://image.tmdb.org/t/p/w500/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg", rating: 6.3, trailerUrl: "https://www.youtube.com/watch?v=qqrpMRDuPfc" },
  { title: "Civil War", genre: ["Action", "Adventure", "Drama"], language: "English", duration: 109, releaseDate: new Date("2024-04-12"), description: "A team of journalists travel across a rapidly-dividing America on a mission to reach Washington D.C. before rebel forces take the White House.", poster: "https://image.tmdb.org/t/p/w500/fc9kxPyBovr0AkwKFMpGBo1TBzx.jpg", rating: 7.3, trailerUrl: "https://www.youtube.com/watch?v=5BeFFf1YxuQ" },
  { title: "Kingdom of the Planet of the Apes", genre: ["Action", "Adventure", "Drama"], language: "English", duration: 145, releaseDate: new Date("2024-05-10"), description: "Set several generations after the reign of Caesar in a world where apes are the dominant species.", poster: "https://image.tmdb.org/t/p/w500/gKkl37BQuKTanygYQG1pyYgLVgf.jpg", rating: 6.8, trailerUrl: "https://www.youtube.com/watch?v=XBjkL2KKymo" },
  { title: "Inside Out 2", genre: ["Animation", "Adventure", "Comedy"], language: "English", duration: 100, releaseDate: new Date("2024-06-14"), description: "Riley enters her teenage years and new emotions arrive, creating chaos in Headquarters.", poster: "https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg", rating: 7.7, trailerUrl: "https://www.youtube.com/watch?v=LEjhY15eCx0" },
  { title: "Twisters", genre: ["Action", "Adventure", "Thriller"], language: "English", duration: 123, releaseDate: new Date("2024-07-19"), description: "A young storm chaser joins a team of scientists as they battle explosive weather systems above Oklahoma.", poster: "https://image.tmdb.org/t/p/w500/pjnD08FlMAIXsfOLKQbvmO0kp6R.jpg", rating: 7.2, trailerUrl: "https://www.youtube.com/watch?v=WxnN05vOFDM" },
  { title: "Deadpool & Wolverine", genre: ["Action", "Comedy", "Fantasy"], language: "English", duration: 128, releaseDate: new Date("2024-07-26"), description: "Deadpool is recruited by the Time Variance Authority and pairs up with Wolverine to face a powerful enemy.", poster: "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg", rating: 7.9, trailerUrl: "https://www.youtube.com/watch?v=73_1biulkYk" },
  { title: "Alien: Romulus", genre: ["Horror", "Sci-Fi", "Thriller"], language: "English", duration: 119, releaseDate: new Date("2024-08-16"), description: "While scavenging the deep ends of a derelict space station, a group of young space colonizers come face to face with the most terrifying life form in the universe.", poster: "https://image.tmdb.org/t/p/w500/b33nnKl1GSFbao4l3fZDDqsMx0F.jpg", rating: 7.4, trailerUrl: "https://www.youtube.com/watch?v=R4OYWH8p8oQ" },
  { title: "Trap", genre: ["Crime", "Mystery", "Thriller"], language: "English", duration: 105, releaseDate: new Date("2024-08-09"), description: "A father takes his daughter to a concert and discovers it's a massive police trap set to catch a serial killer.", poster: "https://image.tmdb.org/t/p/w500/jIImAGRyULjRX2T5TdLBXWkqdlX.jpg", rating: 6.8, trailerUrl: "https://www.youtube.com/watch?v=vMqjEpbTirQ" },
  { title: "Borderlands", genre: ["Action", "Adventure", "Comedy"], language: "English", duration: 115, releaseDate: new Date("2024-08-09"), description: "Lilith returns home to Pandora and joins forces with an unlikely team of misfits to find a missing girl and uncover secrets.", poster: "https://image.tmdb.org/t/p/w500/865DntZzOdX6rLMd405R0nFkLmL.jpg", rating: 3.4, trailerUrl: "https://www.youtube.com/watch?v=XJpLkqKunlI" },
  { title: "Venom: The Last Dance", genre: ["Action", "Adventure", "Fantasy"], language: "English", duration: 109, releaseDate: new Date("2024-10-25"), description: "Eddie and Venom are on the run after Eddie is framed for a crime and find themselves in uncharted territory.", poster: "https://image.tmdb.org/t/p/w500/aosm8NMQ3UyoBVpSxyimorCQykC.jpg", rating: 6.0, trailerUrl: "https://www.youtube.com/watch?v=kWLtqbv4ong" },
  { title: "Transformers One", genre: ["Action", "Adventure", "Animation"], language: "English", duration: 104, releaseDate: new Date("2024-09-20"), description: "The untold origin story of Optimus Prime and Megatron, before they became arch-rivals.", poster: "https://image.tmdb.org/t/p/w500/s0cMqOKKbKIJi7rCsC1pgHxJnSA.jpg", rating: 7.4, trailerUrl: "https://www.youtube.com/watch?v=vSKbVo41uZI" },
  { title: "Joker: Folie à Deux", genre: ["Crime", "Drama", "Musical"], language: "English", duration: 138, releaseDate: new Date("2024-10-04"), description: "Arthur Fleck is confined in Arkham, where he falls in love with Harley Quinn while facing his past.", poster: "https://image.tmdb.org/t/p/w500/oqC5BDdJzNMFNVMrn1TxnD17KbS.jpg", rating: 5.2, trailerUrl: "https://www.youtube.com/watch?v=aGSNQxD6hak" },
  { title: "Furiosa: A Mad Max Saga", genre: ["Action", "Adventure", "Sci-Fi"], language: "English", duration: 148, releaseDate: new Date("2024-05-24"), description: "The origin story of renegade warrior Furiosa before she teamed up with Max Rockatansky.", poster: "https://image.tmdb.org/t/p/w500/iADOJ8Zymht2JPMoy3R7xceZprc.jpg", rating: 7.7, trailerUrl: "https://www.youtube.com/watch?v=XJMuhwVlca4" },
  { title: "The Fall Guy", genre: ["Action", "Comedy", "Romance"], language: "English", duration: 126, releaseDate: new Date("2024-05-03"), description: "A battle-tested stuntman is called back into service when the star of a massive Hollywood production goes missing.", poster: "https://image.tmdb.org/t/p/w500/tSz1qsmSJon0rqjHBxXZmHbaZpG.jpg", rating: 7.0, trailerUrl: "https://www.youtube.com/watch?v=ngiODSL0bYU" },
];

// ─── DEFAULT THEATER PRODUCTS ────────────────────────────────────────────────

const theaterProducts = [
  { name: "Buttered Popcorn (Large)", category: "snack", price: 280, description: "Freshly made large popcorn with real butter", image: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400" },
  { name: "Caramel Popcorn (Medium)", category: "snack", price: 220, description: "Sweet caramel-coated popcorn", image: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=400" },
  { name: "Pepsi (Large)", category: "beverage", price: 180, description: "Chilled large Pepsi 600ml", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400" },
  { name: "Coca-Cola (Medium)", category: "beverage", price: 150, description: "Ice-cold Coca-Cola 400ml", image: "https://images.unsplash.com/photo-1629203432180-71e9b18d855a?w=400" },
  { name: "Nachos with Salsa", category: "snack", price: 320, description: "Crispy nachos served with tangy salsa dip", image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400" },
  { name: "Combo Meal 1", category: "combo", price: 499, description: "Large popcorn + 2 Pepsi + 1 nachos", image: "https://images.unsplash.com/photo-1584034229540-e625b5a3e79c?w=400" },
  { name: "Combo Meal 2 (For 2)", category: "combo", price: 799, description: "2 Large popcorns + 2 large drinks + nachos for 2", image: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=400" },
  { name: "Hot Dog", category: "food", price: 200, description: "Juicy hot dog with mustard and ketchup", image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400" },
  { name: "Cheese Burger", category: "food", price: 280, description: "Classic cheese burger with fresh toppings", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400" },
  { name: "Cold Coffee", category: "beverage", price: 170, description: "Rich cold coffee shake", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400" },
  { name: "Mineral Water (500ml)", category: "beverage", price: 40, description: "Fresh chilled mineral water", image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400" },
  { name: "iMovies Merchandise Cap", category: "merchandise", price: 599, description: "Official iMovies branded cap", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400" },
  { name: "iMovies T-Shirt", category: "merchandise", price: 999, description: "Official iMovies branded T-shirt", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400" },
  { name: "French Fries (Regular)", category: "snack", price: 150, description: "Crispy salted french fries", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400" },
  { name: "Mozzarella Sticks", category: "snack", price: 250, description: "Crispy fried mozzarella sticks with marinara", image: "https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=400" },
];

async function seedAll() {
  try {
    if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing.");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected.");

    // ── Demo administrator for local development ────────────────────────────
    if (process.env.NODE_ENV !== "production") {
      const adminEmail = process.env.DEMO_ADMIN_EMAIL || "admin@imovies.local";
      const adminPassword = process.env.DEMO_ADMIN_PASSWORD || "Admin@123";
      const admin = await User.findOne({ email: adminEmail });
      if (!admin) {
        await User.create({
          name: "iMovies Admin",
          email: adminEmail,
          password: await bcrypt.hash(adminPassword, 10),
          role: "admin",
        });
        console.log(`👤 Demo admin created: ${adminEmail}`);
      } else if (admin.role !== "admin") {
        admin.role = "admin";
        await admin.save();
        console.log(`👤 Existing demo account promoted to admin: ${adminEmail}`);
      }
    }

    // ── Seed Movies ──────────────────────────────────────────────────────────
    let moviesAdded = 0;
    let moviesSkipped = 0;

    for (const movie of movies) {
      const exists = await Movie.findOne({ title: movie.title });
      if (exists) { moviesSkipped++; continue; }
      await Movie.create(movie);
      moviesAdded++;
    }

    // Fill to 200 with demo entries
    const sampleGenres = [["Action", "Adventure"], ["Drama", "Mystery"], ["Sci-Fi", "Thriller"], ["Comedy", "Romance"], ["Fantasy", "Adventure"], ["Crime", "Drama"], ["Animation", "Family"], ["Horror", "Mystery"]];
    const sampleLangs = ["English", "Hindi", "Tamil", "Telugu", "Korean", "French"];
    let total = await Movie.countDocuments();
    let sampleNum = 1;
    while (total < 200 && sampleNum <= 500) {
      const sMovie = {
        title: `Cinematic Feature ${String(sampleNum).padStart(3, "0")}`,
        genre: sampleGenres[(sampleNum - 1) % sampleGenres.length],
        language: sampleLangs[(sampleNum - 1) % sampleLangs.length],
        duration: 90 + ((sampleNum * 7) % 70),
        releaseDate: new Date(Date.UTC(2018 + (sampleNum % 7), sampleNum % 12, (sampleNum % 27) + 1)),
        description: `An award-winning cinematic experience featuring compelling characters and gripping storytelling. Feature ${sampleNum} in our catalog.`,
        poster: `https://picsum.photos/seed/movie${sampleNum}/300/450`,
        rating: Number((5.5 + ((sampleNum * 13) % 40) / 10).toFixed(1)),
        trailerUrl: "",
      };
      sampleNum++;
      const exists = await Movie.exists({ title: sMovie.title });
      if (exists) { moviesSkipped++; continue; }
      await Movie.create(sMovie);
      moviesAdded++;
      total++;
    }

    console.log(`🎬 Movies added: ${moviesAdded} | Skipped: ${moviesSkipped} | Total: ${await Movie.countDocuments()}`);

    // ── Seed Theaters if empty ──────────────────────────────────────────────
    let theaters = await Theater.find();
    if (theaters.length === 0) {
      console.log("📍 Creating default theaters...");
      const defaultTheaters = [
        { name: "PVR Director's Cut", location: "Ambience Mall, Vasant Kunj, New Delhi", screens: 4 },
        { name: "INOX Megaplex", location: "Inorbit Mall, Malad, Mumbai", screens: 6 },
        { name: "Cinépolis VIP", location: "Forum Shantiniketan, Whitefield, Bengaluru", screens: 5 },
        { name: "IMAX Wadala", location: "Bhakti Park, Wadala, Mumbai", screens: 3 },
        { name: "PVR Gold Class", location: "Phoenix Marketcity, Kurla, Mumbai", screens: 4 },
      ];
      theaters = await Theater.insertMany(defaultTheaters);
      console.log(`🏛️ Seeded ${theaters.length} premier theaters.`);
    }

    // ── Seed Theater Products ─────────────────────────────────────────────────
    let productsAdded = 0;
    for (const theater of theaters) {
      for (const product of theaterProducts) {
        const exists = await TheaterProduct.findOne({ theaterId: theater._id, name: product.name });
        if (exists) continue;
        await TheaterProduct.create({ ...product, theaterId: theater._id, stock: 50 + Math.floor(Math.random() * 100) });
        productsAdded++;
      }
    }
    console.log(`🍿 Theater products added: ${productsAdded} | Total: ${await TheaterProduct.countDocuments()}`);

    // ── Ensure every movie has bookable upcoming shows ────────────────────────
    if (theaters.length > 0) {
      console.log("🎟️ Creating showtimes for movies without one...");
      const seededMovies = await Movie.find();
      const moviesWithShows = new Set(
        (await Show.distinct("movieId")).map((id) => String(id))
      );
      const moviesWithoutShows = seededMovies.filter(
        (movie) => !moviesWithShows.has(String(movie._id))
      );
      const times = ["10:00 AM", "01:15 PM", "04:30 PM", "07:45 PM", "10:30 PM"];
      const showsToCreate = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < moviesWithoutShows.length; i++) {
        const movie = moviesWithoutShows[i];
        for (let day = 0; day < 3; day++) {
          const theater = theaters[(i + day) % theaters.length];
          const showDate = new Date(today);
          showDate.setDate(today.getDate() + day);
          showsToCreate.push({
            movieId: movie._id,
            theaterId: theater._id,
            screenNumber: ((i + day) % theater.screens) + 1,
            showDate,
            showTime: times[(i + day) % times.length],
            price: 250 + (i % 3) * 100,
          });
        }
      }
      if (showsToCreate.length > 0) {
        await Show.insertMany(showsToCreate);
        console.log(`🎬 Created ${showsToCreate.length} upcoming shows for ${moviesWithoutShows.length} movies.`);
      } else {
        console.log("🎬 Every movie already has a showtime.");
      }
    }

    console.log("✅ Seeding complete!");
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedAll();
