const express = require('express');
const router = express.Router();
const { Review, ReviewImage, Spot, User } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { restoreUser, requireAuth } = require('../../utils/auth');


// ROUTE FOR GETTING ALL REVIEWS BY A CURRENT USER
router.get('/:userId', restoreUser, requireAuth, async (req, res) => {
    const userId = req.params.userId; // Extract userId from the request parameters

    // Find all reviews by this user
    const reviews = await Review.findAll({
        where: {
            userId: userId,
        },
        include: [{ model: Spot, as: 'spot' }, { model: ReviewImage, as: 'images' }]
    });

    // Respond with the reviews
    res.json({ Reviews: reviews });
});



// ROUTE TO ADD AN IMAGE TO A REVIEW BASED ON THE REVIEW'S ID
router.post('/:reviewId/images', restoreUser, requireAuth, async (req, res, next) => {
    const { reviewId } = req.params;
    const { url } = req.body;

    // Get the review
    const review = await Review.findByPk(reviewId);

    //console.log(typeof req.user.id, typeof review.user_id);
    //console.log(req.user.id, review.user_id);

    if (!review) {
        return res.status(404).json({ message: "Review couldn't be found" });
    }


    // Check if number of images for the review is not more than the maximum allowed
    const reviewImages = await review.getImages();
    if (reviewImages.length >= 10) {
        return res.status(403).json({ message: "Maximum number of images for this resource was reached" })
    }

    // Create new image
    const newImage = await ReviewImage.create ({
        reviewId: review.id,
        url: url
    });

    delete newImage.dataValues.createdAt;
    delete newImage.dataValues.updatedAt;
    delete newImage.dataValues.reviewId;

    // Respond with the new image
    res.status(200).json(newImage);
});



// ROUTE FOR EDITING A REVIEW
router.put('/:reviewId', restoreUser, requireAuth, async (req, res, next) => {
    const { reviewId } = req.params;
    const { review, stars, spotId } = req.body;
    const userId = req.user.id; // Get the authenticated user's ID

      // Get the review
      const reviewToUpdate = await Review.findByPk(reviewId);

      // Check if the review couldn't be found
      if (!reviewToUpdate) {
        return res.status(404).json({ message: "Review couldn't be found" });
      }


      // Update the review
      await reviewToUpdate.update({
        review: review,
        stars: stars,
        userId: userId,
        spotId: spotId,
    },
      { fields: ['review', 'stars', 'userId', 'spotId', 'createdAt'] }
    );

      // Fetch the updated review
      const updatedReview = await Review.findByPk(reviewId);



      // Respond with the updated review
      res.status(200).json(updatedReview);

  });



// ROUTE FOR DELETING A REVIEW
router.delete('/:reviewId', restoreUser, requireAuth, async (req, res, next) => {

    const { reviewId } = req.params;

    // Get the review
    const reviewToDelete = await Review.findByPk(reviewId);

    if (!reviewToDelete) {
        return res.status(404).json({ message: "Review couldn't be found" });
    }


    // Delete the review
    await reviewToDelete.destroy();

    // Respond with success message
    res.status(200).json({ message: "Successfully deleted" });

});

    module.exports = router;
