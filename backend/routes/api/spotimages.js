const express = require('express');
const router = express.Router();
const { Spot, SpotImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');


// ROUTE TO DELETE A SPOT IMAGE
router.delete('/spots/:spotId/images/:imageId', requireAuth, async (req, res, next) => {
    const { spotId, imageId } = req.params;

        // Find the spot
        const spot = await Spot.findByPk(spotId);

        // If spot not found or does not belong to the user, throw an error
        if (!spot || spot.ownerId !== req.user.id) {
            return res.status(404).json({ message: "Spot couldn't be found" });
        }

        // Find the image
        const image = await SpotImage.findOne({
            where: {
                id: imageId,
                spot_id: spotId
            }
        });

        // If image not found, throw an error
        if (!image) {
            return res.status(404).json({ message: "Spot Image couldn't be found" });
        }

        // Delete the image
        await image.destroy();

        return res.status(200).json({ message: "Successfully deleted" });

});

module.exports = router;