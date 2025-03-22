const User = require("../models/UserModel");

module.exports.getLikedMovies = async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    const user = await User.findOne({ email }).select('likedMovies').lean();
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    return res.json({ msg: "success", movies: user.likedMovies });
  } catch (error) {
    console.error("Error in getLikedMovies:", error);
    return res.status(500).json({ msg: "Error fetching movies", error: error.message });
  }
};

module.exports.addToLikedMovies = async (req, res) => {
  try {
    const { email, data } = req.body;
    if (!email || !data) {
      return res.status(400).json({ msg: "Email and movie data are required" });
    }

    let user = await User.findOne({ email });
    
    if (user) {
      const movieAlreadyLiked = user.likedMovies.some(movie => movie.id === data.id);
      
      if (movieAlreadyLiked) {
        return res.status(409).json({ msg: "Movie already added to the liked list" });
      }

      user = await User.findByIdAndUpdate(
        user._id,
        {
          $push: { likedMovies: data }
        },
        { new: true, select: 'likedMovies' }
      ).lean();
    } else {
      user = await User.create({ 
        email, 
        likedMovies: [data] 
      });
    }

    return res.status(201).json({ 
      msg: "Movie successfully added to liked list",
      movies: user.likedMovies
    });
  } catch (error) {
    console.error("Error in addToLikedMovies:", error);
    return res.status(500).json({ 
      msg: "Error adding movie to the liked list",
      error: error.message 
    });
  }
};

module.exports.removeFromLikedMovies = async (req, res) => {
  try {
    const { email, movieId } = req.body;
    if (!email || !movieId) {
      return res.status(400).json({ msg: "Email and movieId are required" });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { 
        $pull: { likedMovies: { id: movieId } }
      },
      { new: true, select: 'likedMovies' }
    ).lean();

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    return res.json({ 
      msg: "Movie successfully removed",
      movies: user.likedMovies
    });
  } catch (error) {
    console.error("Error in removeFromLikedMovies:", error);
    return res.status(500).json({ 
      msg: "Error removing movie from the liked list",
      error: error.message 
    });
  }
};