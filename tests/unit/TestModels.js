const expect = require("expect.js");

const User = require("../../models/User");
const Media = require("../../models/Media");
const Profile = require("../../models/Profile");
const Submission = require("../../models/Submission");
const Campaign = require("../../models/Campaign");
const Review = require("../../models/Review");
const Request = require("../../models/Request");
const Comment = require("../../models/Comment");
const Credit = require("../../models/Credit");
const Debit = require("../../models/Debit");

describe("Test common model features", function() {
  it("tests model relations are working", async function() {
    const user = await User.query().insertAndFetch({
      status: "active",
      username: "testing_relations_user",
      email: "bass@gazbond.co.uk",
      password: "Password1",
      confirmed_at: new Date().toISOString()
    });
    let media = await Media.query().insertAndFetch({
      user_id: user.id,
      type: "image",
      url: "https://i1.sndcdn.com/avatars-000488602248-893hp7-t200x200.jpg"
    });
    media = await Media.query()
      .eager("user")
      .findById(media.id);
    expect(media.user.id).to.equal(user.id);
    let profile = await Profile.query().insertAndFetch({
      user_id: user.id,
      artwork_id: media.id,
      thumb_id: media.id
    });
    profile = await Profile.query()
      .eager("[user, artwork, thumb]")
      .findById(profile.id);
    expect(profile.user.id).to.equal(user.id);
    expect(profile.artwork.id).to.equal(media.id);
    expect(profile.thumb.id).to.equal(media.id);
    let submission = await Submission.query().insertAndFetch({
      submitter_id: user.id,
      track_id: media.id,
      artwork_id: media.id,
      thumb_id: media.id
    });
    submission = await Submission.query()
      .eager("[submitter, track, artwork, thumb]")
      .findById(submission.id);
    expect(submission.submitter.id).to.equal(user.id);
    expect(submission.track.id).to.equal(media.id);
    expect(submission.artwork.id).to.equal(media.id);
    expect(submission.thumb.id).to.equal(media.id);
    let campaign = await Campaign.query().insertAndFetch({
      submitter_id: user.id,
      submission_id: submission.id,
      duration: 3,
      artwork_id: media.id,
      thumb_id: media.id
    });
    campaign = await Campaign.query()
      .eager("[submitter, submission, artwork, thumb]")
      .findById(campaign.id);
    expect(campaign.submitter.id).to.equal(user.id);
    expect(campaign.submission.id).to.equal(submission.id);
    expect(campaign.artwork.id).to.equal(media.id);
    expect(campaign.thumb.id).to.equal(media.id);
    let review = await Review.query().insertAndFetch({
      reviewer_id: user.id,
      campaign_id: campaign.id,
      score: 3
    });
    review = await Review.query()
      .eager("[reviewer]")
      .findById(review.id);
    expect(review.reviewer.id).to.equal(user.id);
    let request = await Request.query().insertAndFetch({
      reviewer_id: user.id,
      campaign_id: campaign.id,
      credits: 3
    });
    request = await Request.query()
      .eager("[reviewer]")
      .findById(request.id);
    expect(request.reviewer.id).to.equal(user.id);
    let comment = await Comment.query().insertAndFetch({
      user_id: user.id,
      campaign_id: campaign.id,
      text: "this is a comment"
    });
    comment = await Comment.query()
      .eager("[user]")
      .findById(comment.id);
    expect(comment.user.id).to.equal(user.id);
    let credit = await Credit.query().insertAndFetch({
      submitter_id: user.id,
      campaign_id: campaign.id,
      charge_id: "test-charge-id",
      price: 1.3,
      fee: 0.2,
      currency: "GBP",
      numb_bought: 2,
      numb_spent: 0
    });
    credit = await Credit.query()
      .eager("[submitter]")
      .findById(credit.id);
    expect(credit.submitter.id).to.equal(user.id);
    let debit = await Debit.query().insertAndFetch({
      reviewer_id: user.id,
      credit_id: credit.id,
      numb_spent: 2
    });
    debit = await Debit.query()
      .eager("[reviewer, credit]")
      .findById(debit.id);
    expect(debit.reviewer.id).to.equal(user.id);
    expect(debit.credit.id).to.equal(credit.id);
    campaign = await Campaign.query()
      .eager("[requests, reviews, comments]")
      .findById(campaign.id);
    expect(campaign.requests.length).to.equal(1);
    expect(campaign.requests[0].id).to.equal(request.id);
    expect(campaign.reviews.length).to.equal(1);
    expect(campaign.reviews[0].id).to.equal(review.id);
    expect(campaign.comments.length).to.equal(1);
    expect(campaign.comments[0].id).to.equal(comment.id);
  });
  it("tests model validations are working", async function() {
    let user;
    try {
      user = await User.query().insertAndFetch({
        status: "wrong",
        username: "invalid username",
        email: "invalid email",
        password: "invalid password"
      });
    } catch (err) {
      expect(err.statusCode).to.equal(400);
      expect(err.data).to.have.property("status");
      expect(err.data).to.have.property("username");
      expect(err.data).to.have.property("email");
      expect(err.data).to.have.property("password");
    }
    user = await User.query().insertAndFetch({
      username: "testing_validations_user",
      email: "test@gazbond.co.uk",
      password: "Password1"
    });
    let media;
    try {
      media = await Media.query().insertAndFetch({
        status: "wrong",
        user_id: "wrong",
        type: "wrong",
        url: "not a url"
      });
    } catch (err) {
      expect(err.statusCode).to.equal(400);
      expect(err.data).to.have.property("status");
      expect(err.data).to.have.property("user_id");
      expect(err.data).to.have.property("type");
      expect(err.data).to.have.property("url");
    }
    media = await Media.query().insertAndFetch({
      user_id: user.id,
      type: "image",
      url: "https://i1.sndcdn.com/avatars-000488602248-893hp7-t200x200.jpg"
    });
    let profile;
    try {
      profile = await Profile.query().insertAndFetch({
        status: "wrong",
        user_id: "wrong",
        artwork_id: "wrong",
        thumb_id: "wrong"
      });
    } catch (err) {
      expect(err.statusCode).to.equal(400);
      expect(err.data).to.have.property("status");
      expect(err.data).to.have.property("user_id");
      expect(err.data).to.have.property("artwork_id");
      expect(err.data).to.have.property("thumb_id");
    }
    let submission;
    try {
      submission = await Submission.query().insertAndFetch({
        status: "wrong",
        submitter_id: "wrong",
        track_id: "wrong",
        artwork_id: "wrong",
        thumb_id: "wrong"
      });
    } catch (err) {
      expect(err.statusCode).to.equal(400);
      expect(err.data).to.have.property("status");
      expect(err.data).to.have.property("submitter_id");
      expect(err.data).to.have.property("track_id");
      expect(err.data).to.have.property("artwork_id");
      expect(err.data).to.have.property("thumb_id");
    }
    submission = await Submission.query().insertAndFetch({
      submitter_id: user.id,
      track_id: media.id,
      artwork_id: media.id,
      thumb_id: media.id
    });
    let campaign;
    try {
      campaign = await Campaign.query().insertAndFetch({
        status: "wrong",
        submitter_id: "wrong",
        submission_id: "wrong",
        duration: "wrong",
        artwork_id: "wrong",
        thumb_id: "wrong"
      });
    } catch (err) {
      expect(err.statusCode).to.equal(400);
      expect(err.data).to.have.property("status");
      expect(err.data).to.have.property("submitter_id");
      expect(err.data).to.have.property("submission_id");
      expect(err.data).to.have.property("duration");
      expect(err.data).to.have.property("artwork_id");
      expect(err.data).to.have.property("thumb_id");
    }
    campaign = await Campaign.query().insertAndFetch({
      submitter_id: user.id,
      submission_id: submission.id,
      duration: 3,
      artwork_id: media.id,
      thumb_id: media.id
    });
    let review;
    try {
      review = await Review.query().insertAndFetch({
        status: "wrong",
        reviewer_id: "wrong",
        campaign_id: "wrong",
        score: "wrong"
      });
    } catch (err) {
      expect(err.statusCode).to.equal(400);
      expect(err.data).to.have.property("status");
      expect(err.data).to.have.property("reviewer_id");
      expect(err.data).to.have.property("campaign_id");
      expect(err.data).to.have.property("score");
    }
    review = await Review.query().insertAndFetch({
      reviewer_id: user.id,
      campaign_id: campaign.id,
      score: 3
    });
    let request;
    try {
      request = await Request.query().insertAndFetch({
        status: "wrong",
        reviewer_id: "wrong",
        campaign_id: "wrong",
        credits: "wrong"
      });
    } catch (err) {
      expect(err.statusCode).to.equal(400);
      expect(err.data).to.have.property("status");
      expect(err.data).to.have.property("reviewer_id");
      expect(err.data).to.have.property("campaign_id");
      expect(err.data).to.have.property("credits");
    }
    request = await Request.query().insertAndFetch({
      reviewer_id: user.id,
      campaign_id: campaign.id,
      credits: 3
    });
    let comment;
    try {
      comment = await Comment.query().insertAndFetch({
        status: "wrong",
        user_id: "wrong",
        campaign_id: "wrong"
      });
    } catch (err) {
      expect(err.statusCode).to.equal(400);
      expect(err.data).to.have.property("status");
      expect(err.data).to.have.property("user_id");
      expect(err.data).to.have.property("campaign_id");
      expect(err.data).to.have.property("text");
    }
    comment = await Comment.query().insertAndFetch({
      user_id: user.id,
      campaign_id: campaign.id,
      text: "this is a comment"
    });
    let credit;
    try {
      credit = await Credit.query().insertAndFetch({
        status: "wrong",
        submitter_id: "wrong",
        campaign_id: "wrong",
        numb_bought: "wrong",
        numb_spent: "wrong"
      });
    } catch (err) {
      expect(err.statusCode).to.equal(400);
      expect(err.data).to.have.property("status");
      expect(err.data).to.have.property("submitter_id");
      expect(err.data).to.have.property("campaign_id");
      expect(err.data).to.have.property("charge_id");
      expect(err.data).to.have.property("numb_bought");
      expect(err.data).to.have.property("numb_spent");
    }
    credit = await Credit.query().insertAndFetch({
      submitter_id: user.id,
      campaign_id: campaign.id,
      charge_id: "test-charge-id",
      price: 1.3,
      fee: 0.2,
      currency: "GBP",
      numb_bought: 2,
      numb_spent: 0
    });
    let debit;
    try {
      debit = await Debit.query().insertAndFetch({
        status: "wrong",
        reviewer_id: "wrong",
        credit_id: "wrong",
        numb_spent: "wrong"
      });
    } catch (err) {
      expect(err.statusCode).to.equal(400);
      expect(err.data).to.have.property("status");
      expect(err.data).to.have.property("reviewer_id");
      expect(err.data).to.have.property("credit_id");
      expect(err.data).to.have.property("numb_spent");
    }
  });
});
