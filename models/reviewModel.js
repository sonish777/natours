const mongoose = require('mongoose');
const Tour = require('./tours');

const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Please enter a review']
    },
    rating: {
      type: Number,
      // required: [true, 'Please provide a rate.'],
      min: [1, 'The minimum rate must be above 1.0'],
      max: [5, 'The maximum rate must be below 5.0']
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.pre(/^find/, function(next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name'
  // }).populate({
  //   path: 'user',
  //   select: 'name photo'
  // });
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

reviewSchema.statics.calcRatingStats = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        numRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].numRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 1,
      ratingsQuantity: 0
    });
  }
};

reviewSchema.post('save', function() {
  //this points to current review doc
  //this.constructor points to Model
  this.constructor.calcRatingStats(this.tour);
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// reviewSchema.pre(/^findOneAnd/, async function(next) {
//   this.r = await this.findOne();
//   // console.log(this.r);
//   next();
// });

reviewSchema.post(/^findOneAnd/, function(doc, next) {
  // this.r.constructor.calcRatingStats(this.r.tour);
  doc.constructor.calcRatingStats(doc.tour);
  // console.log('GETTING DOC');
  // console.log(doc);
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
