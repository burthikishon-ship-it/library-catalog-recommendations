const mongoose = require('mongoose');
const { usingFallback } = require('../config/db');
const { store, generateObjectId, MockQuery, matchDoc } = require('../config/store');

const BookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a book title'],
      trim: true,
      index: true,
    },
    author: {
      type: String,
      required: [true, 'Please add an author'],
      trim: true,
      index: true,
    },
    ISBN: {
      type: String,
      required: [true, 'Please add an ISBN'],
      unique: true,
      trim: true,
    },
    genre: {
      type: [String],
      required: [true, 'Please specify at least one genre'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    publicationYear: {
      type: Number,
      required: [true, 'Please add publication year'],
    },
    publisher: {
      type: String,
      default: 'Independent Publisher',
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80',
    },
    totalCopies: {
      type: Number,
      default: 5,
      min: [1, 'Total copies must be at least 1'],
    },
    availableCopies: {
      type: Number,
      default: 5,
      min: [0, 'Available copies cannot be negative'],
    },
    availability: {
      type: Boolean,
      default: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
    borrowCount: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    pageCount: {
      type: Number,
      default: 300,
    },
    language: {
      type: String,
      default: 'English',
    },
  },
  {
    timestamps: true,
  }
);

BookSchema.index({ title: 'text', author: 'text', description: 'text', genre: 'text', tags: 'text' });

class BookModelFallback {
  static wrapDoc(rawDoc) {
    if (!rawDoc) return null;
    const doc = { ...rawDoc };
    doc.save = async function () {
      const books = store.getCollection('books');
      const idx = books.findIndex(b => String(b._id) === String(this._id));
      this.availability = (this.availableCopies > 0);
      if (idx !== -1) {
        books[idx] = { ...this, updatedAt: new Date() };
      } else {
        books.push(this);
      }
      store.save();
      return this;
    };
    return doc;
  }

  static find(filter = {}) {
    return new MockQuery('books', filter, BookModelFallback);
  }

  static async findById(id) {
    const books = store.getCollection('books');
    const b = books.find(item => String(item._id) === String(id));
    return BookModelFallback.wrapDoc(b);
  }

  static async findOne(filter = {}) {
    const books = store.getCollection('books');
    const b = books.find(item => matchDoc(item, filter));
    return BookModelFallback.wrapDoc(b);
  }

  static async create(data) {
    const books = store.getCollection('books');
    const now = new Date();
    const total = data.totalCopies !== undefined ? Number(data.totalCopies) : 5;
    const avail = data.availableCopies !== undefined ? Number(data.availableCopies) : total;

    const newBook = {
      _id: generateObjectId(),
      title: data.title,
      author: data.author,
      ISBN: data.ISBN,
      genre: Array.isArray(data.genre) ? data.genre : [data.genre],
      description: data.description || '',
      publicationYear: Number(data.publicationYear) || new Date().getFullYear(),
      publisher: data.publisher || 'Independent Publisher',
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80',
      totalCopies: total,
      availableCopies: avail,
      availability: avail > 0,
      averageRating: Number(data.averageRating) || 0,
      ratingsCount: Number(data.ratingsCount) || 0,
      borrowCount: Number(data.borrowCount) || 0,
      tags: data.tags || [],
      featured: Boolean(data.featured),
      pageCount: Number(data.pageCount) || 300,
      language: data.language || 'English',
      createdAt: now,
      updatedAt: now,
    };
    books.push(newBook);
    store.save();
    return BookModelFallback.wrapDoc(newBook);
  }

  static async insertMany(list) {
    const books = store.getCollection('books');
    const inserted = [];
    for (const item of list) {
      const created = await BookModelFallback.create(item);
      inserted.push(created);
    }
    return inserted;
  }

  static async findByIdAndUpdate(id, update, options = {}) {
    const books = store.getCollection('books');
    const idx = books.findIndex(b => String(b._id) === String(id));
    if (idx === -1) return null;
    const current = books[idx];
    const updated = { ...current, ...update, updatedAt: new Date() };
    if (updated.availableCopies !== undefined) {
      updated.availability = updated.availableCopies > 0;
    }
    books[idx] = updated;
    store.save();
    return BookModelFallback.wrapDoc(updated);
  }

  static async findByIdAndDelete(id) {
    const books = store.getCollection('books');
    const idx = books.findIndex(b => String(b._id) === String(id));
    if (idx === -1) return null;
    const removed = books.splice(idx, 1)[0];
    store.save();
    return BookModelFallback.wrapDoc(removed);
  }

  static async countDocuments(filter = {}) {
    const books = store.getCollection('books');
    return books.filter(b => matchDoc(b, filter)).length;
  }

  static async distinct(field) {
    const books = store.getCollection('books');
    const set = new Set();
    books.forEach(b => {
      const val = b[field];
      if (Array.isArray(val)) {
        val.forEach(v => set.add(v));
      } else if (val) {
        set.add(val);
      }
    });
    return Array.from(set);
  }
}

let MongooseBook = null;
try {
  MongooseBook = mongoose.model('Book', BookSchema);
} catch (e) {
  MongooseBook = mongoose.models.Book;
}

const ProxyBook = new Proxy(MongooseBook, {
  get(target, prop) {
    if (usingFallback()) {
      return BookModelFallback[prop] || BookModelFallback;
    }
    return target[prop];
  },
  apply(target, thisArg, argumentsList) {
    if (usingFallback()) {
      return BookModelFallback.wrapDoc(argumentsList[0]);
    }
    return new target(...argumentsList);
  },
  construct(target, argumentsList) {
    if (usingFallback()) {
      return BookModelFallback.wrapDoc(argumentsList[0]);
    }
    return new target(...argumentsList);
  }
});

module.exports = ProxyBook;
module.exports.BookSchema = BookSchema;
