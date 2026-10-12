const mongoose = require('mongoose');
const { usingFallback } = require('../config/db');
const { store, generateObjectId, MockQuery, matchDoc } = require('../config/store');

const ReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    comment: {
      type: String,
      required: [true, 'Please provide review comment text'],
      maxlength: [1000, 'Review cannot exceed 1000 characters'],
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

class ReviewModelFallback {
  static wrapDoc(rawDoc) {
    if (!rawDoc) return null;
    const doc = { ...rawDoc };
    doc.save = async function () {
      const reviews = store.getCollection('reviews');
      const idx = reviews.findIndex(r => String(r._id) === String(this._id));
      if (idx !== -1) {
        reviews[idx] = { ...this, updatedAt: new Date() };
      } else {
        reviews.push(this);
      }
      store.save();
      return this;
    };
    return doc;
  }

  static find(filter = {}) {
    return new MockQuery('reviews', filter, ReviewModelFallback);
  }

  static async findById(id) {
    const reviews = store.getCollection('reviews');
    const r = reviews.find(item => String(item._id) === String(id));
    return ReviewModelFallback.wrapDoc(r);
  }

  static async findOne(filter = {}) {
    const reviews = store.getCollection('reviews');
    const r = reviews.find(item => matchDoc(item, filter));
    return ReviewModelFallback.wrapDoc(r);
  }

  static async create(data) {
    const reviews = store.getCollection('reviews');
    const now = new Date();
    const newReview = {
      _id: generateObjectId(),
      user: data.user,
      book: data.book,
      rating: Number(data.rating),
      title: data.title || '',
      comment: data.comment,
      likes: Number(data.likes) || 0,
      createdAt: now,
      updatedAt: now,
    };
    reviews.push(newReview);
    store.save();
    return ReviewModelFallback.wrapDoc(newReview);
  }

  static async findByIdAndDelete(id) {
    const reviews = store.getCollection('reviews');
    const idx = reviews.findIndex(r => String(r._id) === String(id));
    if (idx === -1) return null;
    const removed = reviews.splice(idx, 1)[0];
    store.save();
    return ReviewModelFallback.wrapDoc(removed);
  }

  static async countDocuments(filter = {}) {
    const reviews = store.getCollection('reviews');
    return reviews.filter(r => matchDoc(r, filter)).length;
  }
}

let MongooseReview = null;
try {
  MongooseReview = mongoose.model('Review', ReviewSchema);
} catch (e) {
  MongooseReview = mongoose.models.Review;
}

const ProxyReview = new Proxy(MongooseReview, {
  get(target, prop) {
    if (usingFallback()) {
      return ReviewModelFallback[prop] || ReviewModelFallback;
    }
    return target[prop];
  },
  apply(target, thisArg, argumentsList) {
    if (usingFallback()) {
      return ReviewModelFallback.wrapDoc(argumentsList[0]);
    }
    return new target(...argumentsList);
  },
  construct(target, argumentsList) {
    if (usingFallback()) {
      return ReviewModelFallback.wrapDoc(argumentsList[0]);
    }
    return new target(...argumentsList);
  }
});

module.exports = ProxyReview;
module.exports.ReviewSchema = ReviewSchema;
