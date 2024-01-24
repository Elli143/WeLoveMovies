const service = require("./reviews.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const methodNotAllowed = require("../errors/methodNotAllowed");

async function reviewExists(request, response, next) {
  // TODO: Write your code here
  const { reviewId } = request.params;
  const review = await service.read(reviewId);
  if(review) {
    response.locals.review = review;
    return next();
  }
  next({ status: 404, message: "Review cannot be found" });
}

async function destroy(request, response) {
  // TODO: Write your code here
  const { reviewId } = request.params;
  await service.destroy(reviewId);
  response.sendStatus(204);
}

async function list(request, response) {
  // TODO: Write your code here
  const { movieId } = request.params;
  const reviews = await service.list(movieId);
  response.json({ data: reviews });
}

function hasMovieIdInPath(request, response, next) {
  if (request.params.movieId) {
    return next();
  }
  methodNotAllowed(request, response, next);
}

function noMovieIdInPath(request, response, next) {
  if (request.params.movieId) {
    return methodNotAllowed(request, response, next);
  }
  next();
}

function hasRequiredProperties(request, response, next) {
  const { data: { score, content } } = request.body;
  if(score || content) {
      return next();
  }
  next({ status: 400, message: "Missing required properties for review"});
}

async function update(request, response) {
  // TODO: Write your code here
  const review = response.locals.review;
  const { data : { content, score } } = request.body;
  if(content) {
    review.content = content;
  }
  if(score) {
    review.score = score;
  }
  const updatedReview = await service.update(review);
  response.json({ data: updatedReview})
}

module.exports = {
  destroy: [
    noMovieIdInPath,
    asyncErrorBoundary(reviewExists),
    asyncErrorBoundary(destroy),
  ],
  list: [hasMovieIdInPath, asyncErrorBoundary(list)],
  update: [
    noMovieIdInPath,
    asyncErrorBoundary(reviewExists),
    asyncErrorBoundary(hasRequiredProperties),
    asyncErrorBoundary(update),
  ],
};
