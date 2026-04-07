class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // Filter: ?field=value
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((el) => delete queryObj[el]);
    this.query = this.query.find(queryObj);
    return this;
  }

  // Search: ?search=keyword (searches title and content)
  search(fields = ['title', 'content']) {
    if (this.queryString.search) {
      const searchRegex = new RegExp(this.queryString.search, 'i');
      const searchConditions = fields.map((field) => ({ [field]: searchRegex }));
      this.query = this.query.find({ $or: searchConditions });
    }
    return this;
  }

  // Sort: ?sort=createdAt or ?sort=-createdAt
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  // Pagination: ?page=1&limit=10
  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    this.page = page;
    this.limit = limit;
    return this;
  }
}

module.exports = APIFeatures;
