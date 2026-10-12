const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { usingFallback } = require('../config/db');
const { store, generateObjectId, MockQuery } = require('../config/store');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    favoriteGenres: {
      type: [String],
      default: [],
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      maxlength: [300, 'Bio cannot exceed 300 characters'],
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Fallback Model Wrapper
class UserModelFallback {
  static wrapDoc(rawDoc) {
    if (!rawDoc) return null;
    const doc = { ...rawDoc };
    doc.matchPassword = async function (enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password);
    };
    doc.save = async function () {
      const users = store.getCollection('users');
      const idx = users.findIndex(u => String(u._id) === String(this._id));
      if (idx !== -1) {
        users[idx] = { ...this, updatedAt: new Date() };
      } else {
        users.push(this);
      }
      store.save();
      return this;
    };
    return doc;
  }

  static find(filter = {}) {
    return new MockQuery('users', filter, UserModelFallback);
  }

  static async findById(id) {
    const users = store.getCollection('users');
    const u = users.find(item => String(item._id) === String(id));
    return UserModelFallback.wrapDoc(u);
  }

  static async findOne(filter = {}) {
    const list = store.getCollection('users');
    const { matchDoc } = require('../config/store');
    const u = list.find(item => matchDoc(item, filter));
    return UserModelFallback.wrapDoc(u);
  }

  static async create(data) {
    const users = store.getCollection('users');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    const now = new Date();
    const newUser = {
      _id: generateObjectId(),
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      role: data.role || 'user',
      favoriteGenres: data.favoriteGenres || [],
      avatar: data.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.name)}`,
      bio: data.bio || '',
      createdAt: now,
      updatedAt: now,
    };
    users.push(newUser);
    store.save();
    return UserModelFallback.wrapDoc(newUser);
  }

  static async findByIdAndUpdate(id, update, options = {}) {
    const users = store.getCollection('users');
    const idx = users.findIndex(u => String(u._id) === String(id));
    if (idx === -1) return null;
    const current = users[idx];
    const updated = { ...current, ...update, updatedAt: new Date() };
    if (update.password && !update.password.startsWith('$2')) {
      const salt = await bcrypt.genSalt(10);
      updated.password = await bcrypt.hash(update.password, salt);
    }
    users[idx] = updated;
    store.save();
    return UserModelFallback.wrapDoc(updated);
  }

  static async findByIdAndDelete(id) {
    const users = store.getCollection('users');
    const idx = users.findIndex(u => String(u._id) === String(id));
    if (idx === -1) return null;
    const removed = users.splice(idx, 1)[0];
    store.save();
    return UserModelFallback.wrapDoc(removed);
  }

  static async countDocuments(filter = {}) {
    const users = store.getCollection('users');
    const { matchDoc } = require('../config/store');
    return users.filter(u => matchDoc(u, filter)).length;
  }
}

let MongooseUser = null;
try {
  MongooseUser = mongoose.model('User', UserSchema);
} catch (e) {
  MongooseUser = mongoose.models.User;
}

const ProxyUser = new Proxy(MongooseUser, {
  get(target, prop) {
    if (usingFallback()) {
      return UserModelFallback[prop] || UserModelFallback;
    }
    return target[prop];
  },
  apply(target, thisArg, argumentsList) {
    if (usingFallback()) {
      return UserModelFallback.wrapDoc(argumentsList[0]);
    }
    return new target(...argumentsList);
  },
  construct(target, argumentsList) {
    if (usingFallback()) {
      return UserModelFallback.wrapDoc(argumentsList[0]);
    }
    return new target(...argumentsList);
  }
});

module.exports = ProxyUser;
module.exports.UserSchema = UserSchema;
