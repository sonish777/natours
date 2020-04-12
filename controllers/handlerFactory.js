const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

module.exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(
        new AppError(`The document with given ID was not found`, 404)
      );
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  });

module.exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) {
      return next(
        new AppError('The document with given ID was not found', 404)
      );
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

module.exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

module.exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    //To allow for nested GET reviews on tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const docs = await features.query.explain();
    const docs = await features.query;
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTIme,
      results: docs.length,
      data: {
        data: docs
      }
    });
  });

module.exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) {
      return next(
        new AppError('The document with given ID was not found', '404')
      );
    }
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTIme,
      data: {
        doc
      }
    });
  });
