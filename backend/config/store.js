const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'embedded_db.json');

const generateObjectId = () => crypto.randomBytes(12).toString('hex');

class EmbeddedStore {
  constructor() {
    this.data = {
      users: [],
      books: [],
      borrows: [],
      reviews: [],
    };
    this.init();
  }

  init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Error loading embedded database file:', err.message);
      }
    } else {
      this.save();
    }
  }

  save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting embedded DB:', err.message);
    }
  }

  getCollection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
    }
    return this.data[name];
  }
}

const store = new EmbeddedStore();

class MockQuery {
  constructor(collectionName, filter = {}, modelRef) {
    this.collectionName = collectionName;
    this.filter = filter;
    this.modelRef = modelRef;
    this._sort = null;
    this._skip = 0;
    this._limit = null;
    this._populateFields = [];
    this._isSingle = false;
  }

  single() {
    this._isSingle = true;
    return this;
  }

  populate(field, select) {
    this._populateFields.push({ field, select });
    return this;
  }

  sort(sortCriteria) {
    this._sort = sortCriteria;
    return this;
  }

  skip(count) {
    this._skip = Number(count) || 0;
    return this;
  }

  limit(count) {
    this._limit = Number(count) || 0;
    return this;
  }

  select(fields) {
    // fields string or obj
    return this;
  }

  exec() {
    return this.then(resolve => resolve(this._execute()));
  }

  then(resolve, reject) {
    try {
      const res = this._execute();
      return Promise.resolve(res).then(resolve);
    } catch (err) {
      if (reject) return Promise.reject(err).catch(reject);
      throw err;
    }
  }

  _execute() {
    const list = store.getCollection(this.collectionName);
    let matched = list.filter(item => matchDoc(item, this.filter));

    if (this._sort) {
      matched = sortDocuments(matched, this._sort);
    }

    if (this._skip > 0) {
      matched = matched.slice(this._skip);
    }

    if (this._limit && this._limit > 0) {
      matched = matched.slice(0, this._limit);
    }

    // Populate
    const populated = matched.map(doc => {
      const clone = { ...doc };
      for (const pop of this._populateFields) {
        if (clone[pop.field]) {
          const targetId = clone[pop.field]._id || clone[pop.field];
          let refCol = null;
          if (pop.field === 'user') refCol = 'users';
          if (pop.field === 'book') refCol = 'books';
          if (refCol) {
            const found = store.getCollection(refCol).find(i => String(i._id) === String(targetId));
            if (found) {
              const copy = { ...found };
              delete copy.password;
              clone[pop.field] = copy;
            }
          }
        }
      }
      return clone;
    });

    if (this._isSingle) {
      if (populated.length === 0) return null;
      return this.modelRef.wrapDoc(populated[0]);
    }
    return populated.map(doc => this.modelRef.wrapDoc(doc));
  }
}

function matchDoc(item, filter) {
  if (!filter || Object.keys(filter).length === 0) return true;

  for (const [key, val] of Object.entries(filter)) {
    if (key === '$or' && Array.isArray(val)) {
      const matchesAny = val.some(subFilter => matchDoc(item, subFilter));
      if (!matchesAny) return false;
      continue;
    }

    if (key === '$text') {
      const searchStr = (val.$search || '').toLowerCase();
      const textToSearch = [
        item.title,
        item.author,
        item.description,
        Array.isArray(item.genre) ? item.genre.join(' ') : item.genre,
        Array.isArray(item.tags) ? item.tags.join(' ') : item.tags,
      ].filter(Boolean).join(' ').toLowerCase();

      if (!textToSearch.includes(searchStr)) return false;
      continue;
    }

    const itemVal = item[key];

    if (val && typeof val === 'object' && !(val instanceof RegExp)) {
      if (val.$regex) {
        const regex = new RegExp(val.$regex, val.$options || 'i');
        if (!regex.test(String(itemVal || ''))) return false;
      }
      if (val.$in && Array.isArray(val.$in)) {
        if (Array.isArray(itemVal)) {
          const hasCommon = itemVal.some(i => val.$in.includes(i));
          if (!hasCommon) return false;
        } else if (!val.$in.includes(itemVal)) {
          return false;
        }
      }
      if (val.$gte !== undefined && (itemVal < val.$gte)) return false;
      if (val.$lte !== undefined && (itemVal > val.$lte)) return false;
      if (val.$gt !== undefined && (itemVal <= val.$gt)) return false;
      if (val.$lt !== undefined && (itemVal >= val.$lt)) return false;
      if (val.$ne !== undefined && String(itemVal) === String(val.$ne)) return false;
    } else if (val instanceof RegExp) {
      if (!val.test(String(itemVal || ''))) return false;
    } else {
      if (String(itemVal) !== String(val)) {
        // if itemVal is an array (like genre: ['Fiction']), check inclusion
        if (Array.isArray(itemVal) && itemVal.includes(val)) {
          // matched
        } else {
          return false;
        }
      }
    }
  }

  return true;
}

function sortDocuments(list, sortCriteria) {
  const result = [...list];
  let field = '';
  let direction = 1;

  if (typeof sortCriteria === 'string') {
    if (sortCriteria.startsWith('-')) {
      field = sortCriteria.substring(1);
      direction = -1;
    } else {
      field = sortCriteria;
      direction = 1;
    }
  } else if (typeof sortCriteria === 'object') {
    const keys = Object.keys(sortCriteria);
    if (keys.length > 0) {
      field = keys[0];
      direction = sortCriteria[field] === -1 || sortCriteria[field] === 'desc' ? -1 : 1;
    }
  }

  if (!field) return result;

  return result.sort((a, b) => {
    const valA = a[field];
    const valB = b[field];
    if (valA === valB) return 0;
    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;
    if (typeof valA === 'string' && typeof valB === 'string') {
      return direction * valA.localeCompare(valB);
    }
    return direction * (valA > valB ? 1 : -1);
  });
}

module.exports = {
  store,
  generateObjectId,
  MockQuery,
  matchDoc,
};
