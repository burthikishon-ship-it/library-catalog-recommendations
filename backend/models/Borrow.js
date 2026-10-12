const mongoose = require('mongoose');
const { usingFallback } = require('../config/db');
const { store, generateObjectId, MockQuery, matchDoc } = require('../config/store');

const BorrowSchema = new mongoose.Schema(
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
    borrowDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['borrowed', 'returned', 'overdue'],
      default: 'borrowed',
      index: true,
    },
    fine: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

class BorrowModelFallback {
  static wrapDoc(rawDoc) {
    if (!rawDoc) return null;
    const doc = { ...rawDoc };
    doc.save = async function () {
      const borrows = store.getCollection('borrows');
      const idx = borrows.findIndex(b => String(b._id) === String(this._id));
      if (idx !== -1) {
        borrows[idx] = { ...this, updatedAt: new Date() };
      } else {
        borrows.push(this);
      }
      store.save();
      return this;
    };
    return doc;
  }

  static find(filter = {}) {
    return new MockQuery('borrows', filter, BorrowModelFallback);
  }

  static findById(id) {
    return new MockQuery('borrows', { _id: id }, BorrowModelFallback).single();
  }

  static async findOne(filter = {}) {
    const borrows = store.getCollection('borrows');
    const b = borrows.find(item => matchDoc(item, filter));
    return BorrowModelFallback.wrapDoc(b);
  }

  static async create(data) {
    const borrows = store.getCollection('borrows');
    const now = new Date();
    const dueDate = data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const newBorrow = {
      _id: generateObjectId(),
      user: data.user,
      book: data.book,
      borrowDate: data.borrowDate ? new Date(data.borrowDate) : now,
      dueDate,
      returnDate: data.returnDate ? new Date(data.returnDate) : null,
      status: data.status || 'borrowed',
      fine: Number(data.fine) || 0,
      notes: data.notes || '',
      createdAt: now,
      updatedAt: now,
    };
    borrows.push(newBorrow);
    store.save();
    return BorrowModelFallback.wrapDoc(newBorrow);
  }

  static async findByIdAndUpdate(id, update, options = {}) {
    const borrows = store.getCollection('borrows');
    const idx = borrows.findIndex(b => String(b._id) === String(id));
    if (idx === -1) return null;
    const current = borrows[idx];
    const updated = { ...current, ...update, updatedAt: new Date() };
    borrows[idx] = updated;
    store.save();
    return BorrowModelFallback.wrapDoc(updated);
  }

  static async countDocuments(filter = {}) {
    const borrows = store.getCollection('borrows');
    return borrows.filter(b => matchDoc(b, filter)).length;
  }
}

let MongooseBorrow = null;
try {
  MongooseBorrow = mongoose.model('Borrow', BorrowSchema);
} catch (e) {
  MongooseBorrow = mongoose.models.Borrow;
}

const ProxyBorrow = new Proxy(MongooseBorrow, {
  get(target, prop) {
    if (usingFallback()) {
      return BorrowModelFallback[prop] || BorrowModelFallback;
    }
    return target[prop];
  },
  apply(target, thisArg, argumentsList) {
    if (usingFallback()) {
      return BorrowModelFallback.wrapDoc(argumentsList[0]);
    }
    return new target(...argumentsList);
  },
  construct(target, argumentsList) {
    if (usingFallback()) {
      return BorrowModelFallback.wrapDoc(argumentsList[0]);
    }
    return new target(...argumentsList);
  }
});

module.exports = ProxyBorrow;
module.exports.BorrowSchema = BorrowSchema;
