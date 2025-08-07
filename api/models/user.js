const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    googleId: {type: String, unique: true, sparse: true},
    facebookId: {type: String, unique: true, sparse: true},
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String},
    photo: {
      type: String,
      default:
        'https://res.cloudinary.com/dvqaaywos/image/upload/v1743422773/TripPlanner/sw8mezyzy7tzdu3zcvep.jpg',
    },
    token: {type: String},
    username: {type: String, unique: true},
    wishlist: [{type: String}],
  },
  {timestamps: true},
);
userSchema.pre('save', function (next) {
  if (!this.username) {
    this.username = this.email.split('@')[0];
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
