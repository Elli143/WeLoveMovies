const db = require("../db/connection");
const mapProperties = require("../utils/map-properties");

const tableName = "reviews";

const addCritics = mapProperties({
  critic_id: "critic.critic_id",
  preferred_name: "critic.preferred_name",
  surname: "critic.surname",
  organization_name: "critic.organization_name",
  critic_id: "critic_id"
})

async function destroy(reviewId) {
  // TODO: Write your code here
  return db(tableName)
    .where({ "review_id": reviewId })
    .del();
}

async function list(movie_id) {
  // TODO: Write your code here
  return db(tableName)
   .join("critics", "reviews.critic_id", "critics.critic_id")
    .select("reviews.*", "critics.*")
    .where({ movie_id })
    .then((result) => {
      for(let i = 0; i < result.length; i++) {
        result[i] = addCritics(result[i]);
      }
      return result;
    });
}

async function read(reviewId) {
  // TODO: Write your code here
  return db(tableName)
    .join("critics", "reviews.critic_id", "critics.critic_id")
    .select("*")
    .where({ "review_id": reviewId })
    .first()
    .then(addCritics)
}

async function readCritic(critic_id) {
  return db("critics").where({ critic_id }).first();
}

async function setCritic(review) {
  review.critic = await readCritic(review.critic_id);
  return review;
}

async function update(review) {
  const content = review.content;
  const scope = review.scope;
  return db(tableName)
    .where({ review_id: review.review_id })
    .update({content, scope})
    .then(() => read(review.review_id))
    .then(setCritic);
}

module.exports = {
  destroy,
  list,
  read,
  update,
};
