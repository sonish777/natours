const express = require('express');

const router = express.Router();

const {
  getAllTours,
  getTour,
  makeTour,
  updateTour,
  removeTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages
} = require('./../controllers/tourController');

const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

//NESTED ROUTES
//POST /tour/123wasdf3/reviews
//GET /tour/asdf243fgfd/reviews
//GET /tour/sdfh2893jsdf/reviews/123wddfj872389

// Redirecting to review routes
router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-tours').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    getMonthlyPlan
  );

router
  .route('/tours-within/:distance/center/:latlon/unit/:unit')
  .get(getToursWithin);
//Or use query string as /tours-within?distance=233&center=-40,46&unit=miles

router.route('/distances/:latlon/unit/:unit').get(getDistances);

router
  .route('/')
  .get(getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    makeTour
  ); //Chaining 2 middleware functions checkBody and makeTour

router
  .route('/:id')
  .get(getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    uploadTourImages,
    resizeTourImages,
    updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    removeTour
  );

module.exports = router;
