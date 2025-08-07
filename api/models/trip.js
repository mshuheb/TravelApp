const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  name: {type: String, required: true},
  phoneNumber: {type: String},
  website: {type: String},
  openingHours: [String],
  photos: [String],
  reviews: [
    {
      authorName: String,
      rating: Number,
      text: String,
    },
  ],
  briefDescription: {type: String},
  geometry: {
    location: {
      lat: {type: Number, required: true},
      lng: {type: Number, required: true},
    },
    viewport: {
      northeast: {
        lat: {type: Number, required: true},
        lng: {type: Number, required: true},
      },
      southwest: {
        lat: {type: Number, required: true},
        lng: {type: Number, required: true},
      },
    },
  },
  placeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Place',
    required: true,
  },
});

const itinerarySchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  activities: [activitySchema],
});

const placeSchema = new mongoose.Schema({
  name: {type: String, required: true},
  phoneNumber: {type: String},
  website: {type: String},
  openingHours: [String],
  photos: [String],
  reviews: [
    {
      authorName: String,
      rating: Number,
      text: String,
    },
  ],
  types: [String],
  formatted_address: {
    type: String,
    required: true,
  },
  briefDescription: {type: String},
  geometry: {
    location: {
      lat: {type: Number, required: true},
      lng: {type: Number, required: true},
    },
    viewport: {
      northeast: {
        lat: {type: Number, required: true},
        lng: {type: Number, required: true},
      },
      southwest: {
        lat: {type: Number, required: true},
        lng: {type: Number, required: true},
      },
    },
  },
});

const expenseSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  categoryImage: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  splitBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  ],
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  comments: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      text: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const noteSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

const tripSchema = new mongoose.Schema({
  tripName: {
    type: String,
    required: true,
  },
  startDate: {
    type: String,
    required: true,
  },
  endDate: {
    type: String,
    required: true,
  },
  startDay: {
    type: String,
    required: true,
  },
  endDay: {
    type: String,
    required: true,
  },
  background: {
    type: String,
    required: true,
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  travelers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  participants: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  budget: {
    type: Number,
  },
  expenses: [expenseSchema],
  placesToVisit: [placeSchema],

  itinerary: [itinerarySchema],
  notes: [noteSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;
