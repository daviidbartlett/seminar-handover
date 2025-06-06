const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seed");
const { genres, artists, songs, playlists } = require("../db/data/test");
afterAll(() => {
  db.end();
});

beforeEach(() => seed(genres, artists, songs, playlists));

describe("app", () => {
  test("non-existent endpoint responds with 404 and msg", async () => {
    const { body } = await request(app).get("/banana").expect(404);

    expect(body.msg).toBe("Path not found.");
  });
  describe("GET - /api/artists", () => {
    test("responds with status of 200", async () => {
      await request(app).get("/api/artists").expect(200);
    });
    test("responds with an array of artists that contains artist_name and rating", async () => {
      const { body } = await request(app).get("/api/artists");

      expect(Array.isArray(body.artists)).toBe(true);

      expect(body.artists.length > 0).toBe(true);

      body.artists.forEach((artist) => {
        expect(artist.hasOwnProperty("artist_name")).toBe(true);
        expect(artist.hasOwnProperty("rating")).toBe(true);
      });
    });
  });
  describe("GET - /api/artists/:id", () => {
    test("happy path...", () => {});
    test("invalid ID responds with 400 and msg ", async () => {
      const { body } = await request(app)
        .get("/api/artists/invalid-id")
        .expect(400);

      expect(body.msg).toBe("Bad Request.");
    });
    test("valid ID but non-exisitent responds with 404 and msg", async () => {
      const { body } = await request(app).get("/api/artists/9999").expect(404);

      expect(body.msg).toBe("Artist not found.");
    });
  });
  describe("GET - /api/songs", () => {
    test("responds with status of 200", async () => {
      await request(app).get("/api/songs").expect(200);
    });
    test("responds with a songs array", async () => {
      const { body } = await request(app).get("/api/songs");

      expect(Array.isArray(body.songs)).toBe(true);
    });
    test("Each song object should have props: title, release_year, artist_name", async () => {
      const { body } = await request(app).get("/api/songs");

      expect(body.songs.length > 0).toBe(true);

      body.songs.forEach((song) => {
        expect(song.hasOwnProperty("title")).toBe(true);
        expect(song.hasOwnProperty("release_year")).toBe(true);
        expect(song.hasOwnProperty("artist_name")).toBe(true);
      });
    });
    test("songs are ordered by release_year by default", async () => {
      const { body } = await request(app).get("/api/songs");

      expect(body.songs).toBeSortedBy("release_year");
    });
    test("user can order by song_title", async () => {
      const { body } = await request(app).get("/api/songs?sortby=song_title");

      expect(body.songs).toBeSortedBy("title");
    });
    test("responds with 400 and error message for invalid sortby", async () => {
      const { body } = await request(app)
        .get("/api/songs?sortby=invalid")
        .expect(400);

      expect(body.msg).toBe("Bad Request.");
    });
  });
  describe("POST - /api/songs", () => {
    const newSong = {
      song_title: "test song",
      release_year: 2025,
      artist_id: 1,
      genre: "pop",
    };

    test("responds with status 201", async () => {
      await request(app).post("/api/songs").send(newSong).expect(201);
    });
    test("responds with the freshly created song", async () => {
      const { body } = await request(app)
        .post("/api/songs")
        .send(newSong)
        .expect(201);

      expect(body.song).toEqual({ song_id: 9, ...newSong });
    });
    test("responds with 404 and msg for valid but non-existent artist_id", async () => {
      const { body } = await request(app)
        .post("/api/songs")
        .send({ ...newSong, artist_id: 9999 })
        .expect(404);

      expect(body.msg).toBe("Artist not found.");
    });
  });
});
