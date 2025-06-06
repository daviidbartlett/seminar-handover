const { fetchArtists, fetchArtistById } = require("../models/artists");

exports.getArtists = async (req, res) => {
  const artists = await fetchArtists();
  res.status(200).send({ artists });
};

exports.getArtistById = async (req, res) => {
  const { id } = req.params;
  const artist = await fetchArtistById(id);

  res.status(200).send({ artist });
};
