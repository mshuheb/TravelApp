const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const moment = require('moment');

const axios = require('axios');

const app = express();
const port = 8000;
const cors = require('cors');
app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors({origin: '*'}));

const jwt = require('jsonwebtoken');

mongoose
  .connect(
    'mongodb+srv://mshuheb20:shuheb20@cluster0.ydgge.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  )
  .then(() => {
    console.log('Connected to Mongo Db');
  })
  .catch(err => {
    console.log('Error connecting to MongoDb', err);
  });

app.listen(port, () => {
  console.log('Server running on port 8000');
});

const multer = require('multer');
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const path = require('path');
require('dotenv').config();

const storage = multer.memoryStorage();
const upload = multer({storage});

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const generateFileName = originalName => {
  const ext = path.extname(originalName);
  const base = crypto.randomBytes(16).toString('hex');
  return `profile-pictures/${base}${ext}`;
};

app.put('/user/:userId/photo', upload.single('photo'), async (req, res) => {
  try {
    const {userId} = req.params;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({message: 'User not found'});

    if (!req.file) return res.status(400).json({message: 'No file uploaded'});

    const fileName = generateFileName(req.file.originalname);

    const uploadParams = {
      Bucket: 'profilepicturetravelapp',
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);

    const fileUrl = `https://${uploadParams.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    user.photo = fileUrl;
    await user.save();

    res.status(200).json({message: 'Profile photo updated', user});
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({message: 'Failed to upload profile photo'});
  }
});

const {GoogleGenerativeAI} = require('@google/generative-ai');
console.log('GoogleGenerativeAI object:', GoogleGenerativeAI);
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const pkg = require('@google/generative-ai/package.json');
console.log('Gemini SDK version:', pkg.version);

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({model: 'gemini-2.0-flash-lite'});

app.post('/chat', async (req, res) => {
  const {message} = req.body;

  if (!message) {
    return res.status(400).json({error: 'Message is required'});
  }

  const allowedTopics = [
    'travel',
    'trip',
    'planning',
    'itinerary',
    'destination',
    'place',
    'vacation',
    'stay',
    'hotel',
    'accommodation',
    'transportation',
    'flight',
    'bus',
    'train',
    'ride',
    'food',
    'restaurant',
    'dining',
    'cuisine',
    'attraction',
    'things to do',
    'sightseeing',
    'activity',
    'weather',
    'safety',
    'forecast',
    'culture',
    'language',
    'local phrases',
    'shopping',
    'souvenir',
    'market',
    'money',
    'currency',
    'atm',
    'sim card',
    'connectivity',
    'cities',
    'city',
    'country',
    'region',
    'local',
    'advice',
    'tips',
  ];

  const isRelevant = text => {
    const normalizedText = text.toLowerCase();
    return allowedTopics.some(kw => normalizedText.includes(kw));
  };

  if (!isRelevant(message)) {
    return res.json({
      reply:
        "I'm here to help with trip planning, accommodation, transportation, food, attractions, weather, culture, shopping, and connectivity. Could you ask something related?",
    });
  }

  const restrictedPrompt = `
You are a helpful and strict travel assistant. You should ONLY provide direct answers to questions related to:
- Trip Planning
- Accommodation
- Transportation
- Food & Dining
- Things to Do / Attractions
- Weather & Safety
- Local Culture & Language
- Shopping & Souvenirs
- Money & Connectivity

If the user's input is related to one of these topics, provide a direct answer without asking further questions. 

User: ${message}
`;

  try {
    const result = await model.generateContent(restrictedPrompt);
    const response = await result.response;

    let reply = '';
    if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      reply = response.candidates[0].content.parts[0].text;
    } else {
      reply =
        'Sorry, I didn’t get a relevant response about trips, travel, food, or places.';
    }

    res.json({reply});
  } catch (err) {
    console.error('Gemini API Error:', err);
    return res.status(500).json({
      error: 'Gemini API Error',
      details: err.message,
    });
  }
});

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`AI Chat server running on http://localhost:${PORT}`);
});

const DEFAULT_PHOTO_URL =
  'https://res.cloudinary.com/dvqaaywos/image/upload/v1743422773/TripPlanner/sw8mezyzy7tzdu3zcvep.jpg';

app.delete('/user/:userId/photo', async (req, res) => {
  try {
    const {userId} = req.params;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({message: 'User not found'});

    if (user.photo && user.photo !== DEFAULT_PHOTO_URL) {
      const key = user.photo.split('/').pop();

      const deleteParams = {
        Bucket: 'profilepicturetravelapp',
        Key: key,
      };

      const command = new DeleteObjectCommand(deleteParams);
      await s3.send(command);
    }

    user.photo = DEFAULT_PHOTO_URL;
    await user.save();

    res.status(200).json({message: 'Profile photo removed', user});
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({message: 'Failed to remove profile photo'});
  }
});

app.put('/user/:id/name', async (req, res) => {
  const {id} = req.params;
  const {name} = req.body;

  if (!name || name.trim().length === 0) {
    return res.status(400).json({error: 'Name cannot be empty'});
  }

  try {
    const user = await User.findByIdAndUpdate(id, {name}, {new: true});

    if (!user) {
      return res.status(404).json({error: 'User not found'});
    }

    res.json({message: 'Name updated successfully', user});
  } catch (err) {
    console.error('Error updating name:', err);
    res.status(500).json({error: 'Server error'});
  }
});

const Trip = require('./models/trip');
const User = require('./models/user');

app.post('/trip', async (req, res) => {
  const {
    tripName,
    startDate,
    endDate,
    startDay,
    endDay,
    background,
    host: userId,
  } = req.body;

  try {
    const start = moment(startDate);
    const end = moment(endDate);

    const itinerary = [];

    let currentDate = start.clone();

    while (currentDate.isSameOrBefore(end)) {
      itinerary.push({
        date: currentDate.format('YYYY-MM-DD'),
        activities: [],
      });
      currentDate.add(1, 'days');
    }

    console.log(itinerary);

    const trip = new Trip({
      tripName,
      startDate: moment(startDate).format('DD MMMM YYYY'),
      endDate: moment(endDate).format('DD MMMM YYYY'),
      startDay,
      endDay,
      itinerary,
      background,
      host: userId,
      participants: [],
      travelers: [],
    });

    await trip.save();
    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
});

app.delete('/trip/:tripId', async (req, res) => {
  const {tripId} = req.params;
  const {userId} = req.query;

  try {
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({message: 'Invalid Trip ID'});
    }

    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({message: 'Trip not found'});
    }

    if (trip.host.toString() !== userId) {
      return res
        .status(403)
        .json({
          message:
            'You are not authorized to delete this trip. Please ask the host to remove you from the participants list.',
        });
    }

    await Trip.findByIdAndDelete(tripId);
    res.status(200).json({message: 'Trip deleted successfully'});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
});

app.get('/trips/:userId', async (req, res) => {
  const {userId} = req.params;

  console.log('Fetching trips for user:', userId);

  try {
    const trips = await Trip.find({
      $or: [{host: userId}, {participants: userId}, {travelers: userId}],
    }).populate('travelers', 'name email photo');

    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
});

app.post('/trip/:tripId/addNote', async (req, res) => {
  const {tripId} = req.params;
  const {text} = req.body;

  try {
    const updatedTrip = await Trip.findByIdAndUpdate(
      tripId,
      {$push: {notes: {text}}},
      {new: true},
    );

    res
      .status(200)
      .json({note: updatedTrip.notes[updatedTrip.notes.length - 1]});
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({error: 'Failed to add note'});
  }
});

app.put('/trip/:tripId/editNote/:noteId', async (req, res) => {
  const {tripId, noteId} = req.params;
  const {text} = req.body;

  try {
    const updatedTrip = await Trip.findOneAndUpdate(
      {_id: tripId, 'notes._id': noteId},
      {$set: {'notes.$.text': text}},
      {new: true},
    );

    const updatedNote = updatedTrip.notes.find(
      note => note._id.toString() === noteId,
    );
    res.status(200).json({note: updatedNote});
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({error: 'Failed to update note'});
  }
});

app.get('/trip/:tripId/notes', async (req, res) => {
  const {tripId} = req.params;

  try {
    const trip = await Trip.findById(tripId);
    res.status(200).json({notes: trip.notes});
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({error: 'Failed to fetch notes'});
  }
});

app.delete('/trip/:tripId/deleteNote/:noteId', async (req, res) => {
  const {tripId, noteId} = req.params;

  try {
    const updatedTrip = await Trip.findByIdAndUpdate(
      tripId,
      {$pull: {notes: {_id: noteId}}},
      {new: true},
    );

    res
      .status(200)
      .json({message: 'Note deleted successfully', notes: updatedTrip.notes});
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({error: 'Failed to delete note'});
  }
});

app.get('/users/search', async (req, res) => {
  const {query, tripId} = req.query;

  try {
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({error: 'Trip not found'});
    }
    const users = await User.find(
      {
        username: new RegExp(query, 'i'),
        _id: {$ne: trip.host},
      },
      'name photo',
    ).limit(10);

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({error: 'Failed to search users'});
  }
});

app.get('/trip/:tripId/participants', async (req, res) => {
  const {tripId} = req.params;

  try {
    const trip = await Trip.findById(tripId)
      .populate('host', 'name photo')
      .populate('participants', 'name photo');

    if (!trip) {
      return res.status(404).json({error: 'Trip not found'});
    }

    const allParticipants = [trip.host, ...trip.participants];

    res.status(200).json({participants: allParticipants});
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({error: 'Failed to fetch participants'});
  }
});

app.get('/trip/:tripId/host', async (req, res) => {
  const {tripId} = req.params;

  try {
    const trip = await Trip.findById(tripId).populate('host', 'name photo');

    if (!trip) {
      return res.status(404).json({error: 'Trip not found'});
    }

    res.status(200).json({host: trip.host});
  } catch (error) {
    console.error('Error fetching host:', error);
    res.status(500).json({error: 'Failed to fetch host'});
  }
});

app.post('/trip/:tripId/addParticipant', async (req, res) => {
  const {tripId} = req.params;
  const {userId} = req.body;

  try {
    const updatedTrip = await Trip.findByIdAndUpdate(
      tripId,
      {$addToSet: {participants: userId}},
      {new: true},
    ).populate('participants', 'name photo');

    res.status(200).json({participants: updatedTrip.participants});
  } catch (error) {
    console.error('Error adding participant:', error);
    res.status(500).json({error: 'Failed to add participant'});
  }
});

app.delete('/trip/:tripId/removeParticipant/:userId', async (req, res) => {
  const {tripId, userId} = req.params;

  try {
    const updatedTrip = await Trip.findByIdAndUpdate(
      tripId,
      {$pull: {participants: userId}},
      {new: true},
    ).populate('participants', 'name photo');

    if (!updatedTrip) {
      return res.status(404).json({error: 'Trip not found'});
    }

    res.status(200).json({
      message: 'Participant removed successfully',
      participants: updatedTrip.participants,
    });
  } catch (error) {
    console.error('Error removing participant:', error);
    res.status(500).json({error: 'Failed to remove participant'});
  }
});

app.post('/trip/:tripId/addPlace', async (req, res) => {
  const {tripId} = req.params;
  const {placeId} = req.body;

  const API_KEY = 'AIzaSyAcrTZPToPzWZJhtGgehxe3MYxhkUN_W0U';

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${API_KEY}`;
    const response = await axios.get(url);
    const details = response.data.result;

    console.log('det', details);

    const placeData = {
      name: details.name,
      phoneNumber: details.formatted_phone_number,
      website: details.website,
      openingHours: details.opening_hours?.weekday_text,
      photos: details.photos?.map(
        photo =>
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${API_KEY}`,
      ),
      reviews: details.reviews?.map(review => ({
        authorName: review.author_name,
        rating: review.rating,
        text: review.text,
      })),
      types: details?.types,
      formatted_address: details?.formatted_address,
      briefDescription:
        details.editorial_summary?.overview ||
        details.reviews?.[0]?.text ||
        'No description available',
      geometry: {
        location: {
          lat: details.geometry?.location?.lat,
          lng: details.geometry?.location?.lng,
        },
        viewport: {
          northeast: {
            lat: details.geometry.viewport.northeast.lat,
            lng: details.geometry.viewport.northeast.lng,
          },
          southwest: {
            lat: details.geometry.viewport.southwest.lat,
            lng: details.geometry.viewport.southwest.lng,
          },
        },
      },
    };

    const updatedTrip = await Trip.findByIdAndUpdate(
      tripId,
      {$push: {placesToVisit: placeData}},
      {new: true},
    );

    res.status(200).json(updatedTrip);
  } catch (error) {
    console.error('Error adding place to trip:', error);
    res.status(500).json({error: 'Failed to add place to trip'});
  }
});

app.delete('/removePlace/:placeId', async (req, res) => {
  const {placeId} = req.params;

  if (!placeId) {
    return res.status(400).json({error: 'Missing placeId'});
  }

  try {
    const updatedTrip = await Trip.findOneAndUpdate(
      {'placesToVisit._id': new mongoose.Types.ObjectId(placeId)},
      {$pull: {placesToVisit: {_id: new mongoose.Types.ObjectId(placeId)}}},
      {new: true},
    );

    if (!updatedTrip) {
      return res.status(404).json({error: 'Place not found'});
    }
    const updatedItinerary = await Trip.updateMany(
      {},
      {
        $pull: {
          'itinerary.$[].activities': {
            placeId: new mongoose.Types.ObjectId(placeId),
          },
        },
      },
      {new: true},
    );

    res.status(200).json(updatedTrip);
  } catch (error) {
    console.error('Error removing place:', error);
    res.status(500).json({error: 'Failed to remove place'});
  }
});

app.get('/trip/:tripId/placesToVisit', async (req, res) => {
  const {tripId} = req.params;

  try {
    const trip = await Trip.findById(tripId).select('placesToVisit');

    if (!trip) {
      return res.status(404).json({error: 'Trip not found'});
    }

    res.status(200).json(trip.placesToVisit);
  } catch (error) {
    console.error('Error fetching places to visit:', error);
    res.status(500).json({error: 'Failed to fetch places to visit'});
  }
});

app.get('/trips/:tripId/places', async (req, res) => {
  try {
    const {tripId} = req.params;
    const trip = await Trip.findById(tripId).select('placesToVisit');

    if (!trip) {
      return res.status(404).json({message: 'Trip not found'});
    }

    res.status(200).json(trip.placesToVisit);
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Server error'});
  }
});

app.post('/trips/:tripId/itinerary/:date', async (req, res) => {
  const {tripId, date} = req.params;
  const newActivity = req.body;

  try {
    const updatedTrip = await Trip.findByIdAndUpdate(
      tripId,
      {
        $push: {
          'itinerary.$[entry].activities': newActivity,
        },
      },
      {
        new: true,
        arrayFilters: [{'entry.date': date}],
      },
    );

    if (!updatedTrip) {
      return res.status(404).json({message: 'Trip not found'});
    }

    res.status(200).json({
      message: 'Activity added successfully',
      itinerary: updatedTrip.itinerary,
    });
  } catch (error) {
    console.error('Error adding activity:', error);
    res.status(500).json({message: 'Internal server error'});
  }
});

app.delete('/trips/:tripId/itinerary/:activityId', async (req, res) => {
  const {tripId, activityId} = req.params;

  try {
    const updatedTrip = await Trip.findByIdAndUpdate(
      tripId,
      {
        $pull: {'itinerary.$[].activities': {_id: activityId}},
      },
      {
        new: true,
      },
    );

    if (!updatedTrip) {
      return res.status(404).json({message: 'Trip not found'});
    }

    res.status(200).json({
      message: 'Activity deleted successfully',
      itinerary: updatedTrip.itinerary,
    });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({message: 'Internal server error'});
  }
});

app.get('/trip/:tripId/itinerary', async (req, res) => {
  const {tripId} = req.params;

  try {
    const trip = await Trip.findById(tripId).select('itinerary');

    if (!trip) {
      return res.status(404).json({error: 'Trip not found'});
    }

    res.status(200).json(trip.itinerary);
  } catch (error) {
    console.error('Error fetching places to visit:', error);
    res.status(500).json({error: 'Failed to fetch places to visit'});
  }
});

const JWT_SECRET = crypto.randomBytes(64).toString('hex');

app.post('/google-login', async (req, res) => {
  const {idToken} = req.body;

  try {
    const response = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`,
    );

    const {sub, email, name, given_name, family_name, picture} = response.data;

    if (!email) {
      return res.status(400).json({message: 'Google email is required'});
    }

    let user = await User.findOne({email});

    if (user) {
      if (user.facebookId && !user.googleId) {
        return res.status(409).json({
          message:
            'Account already exists with Facebook. Please sign in using your Facebook account.',
          provider: 'facebook',
        });
      }

      if (!user.googleId) {
        user.googleId = sub;
        await user.save();
      }
    } else {
      const username = email.split('@')[0];
      user = new User({
        googleId: sub,
        email,
        name,
        username,
        familyName: family_name,
        givenName: given_name,
        photo: picture,
      });
      await user.save();
    }

    const token = jwt.sign({userId: user._id, email: user.email}, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({
      message: 'Google login successful',
      user,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({message: 'Google authentication failed', error});
  }
});

app.post('/signup', async (req, res) => {
  const {name, email, password} = req.body;

  try {
    let user = await User.findOne({email});
    if (user) {
      return res.status(400).json({message: 'Email already exists'});
    }
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res
        .status(400)
        .json({
          message:
            'Password must contain at least one uppercase letter, one number, one special character, and be at least 8 characters long',
        });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const username = email.split('@')[0];

    user = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign({userId: user._id, email: user.email}, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(201).json({message: 'User registered successfully', token});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Server Error'});
  }
});

app.put('/user/:id/password', async (req, res) => {
  const {id} = req.params;
  const {currentPassword, newPassword} = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({message: 'Current password is incorrect'});
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          'New password must contain at least one uppercase letter, one number, one special character, and be at least 8 characters long',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({message: 'Password updated successfully'});
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({message: 'Server Error'});
  }
});

app.post('/user/:userId/wishlist', async (req, res) => {
  const {userId} = req.params;
  const {placeId} = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({message: 'User not found'});

    const index = user.wishlist.indexOf(placeId);
    if (index === -1) {
      user.wishlist.push(placeId);
      await user.save();
      return res
        .status(200)
        .json({message: 'Place added to wishlist', wishlisted: true});
    } else {
      user.wishlist.splice(index, 1);
      await user.save();
      return res
        .status(200)
        .json({message: 'Place removed from wishlist', wishlisted: false});
    }
  } catch (error) {
    console.error('Error updating wishlist:', error);
    res.status(500).json({message: 'Server error'});
  }
});

app.get('/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('wishlist');
    if (!user) return res.status(404).json({message: 'User not found'});

    res.status(200).json({wishlist: user.wishlist});
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({message: 'Server error'});
  }
});

app.post('/signin', async (req, res) => {
  try {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if (!user) {
      return res.status(400).json({message: 'Invalid email or password'});
    }
    if (user.googleSignIn) {
      return res.status(400).json({
        message:
          'This email is registered via Google/Facebook. Please sign in using Google/Facebook.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({message: 'Invalid email or password'});
    }

    const token = jwt.sign({userId: user._id, email: user.email}, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({token, user: {id: user._id, email: user.email, name: user.name}});
  } catch (error) {
    console.error('Sign-in Error:', error);
    res.status(500).json({message: 'Server error. Please try again.'});
  }
});

app.post('/facebook-login', async (req, res) => {
  const {accessToken} = req.body;

  try {
    const fbResponse = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`,
    );

    const {id, email, name, picture} = fbResponse.data;

    let userEmail = email || `${id}@facebook.placeholder.com`;

    const username = email ? email.split('@')[0] : id;

    let user = await User.findOne({email: userEmail});

    if (user) {
      if (user.googleId && !user.facebookId) {
        return res.status(409).json({
          message:
            'Account already exists with Google. Please sign in using your Google account.',
          provider: 'google',
        });
      }

      if (!user.facebookId) {
        user.facebookId = id;
        await user.save();
      }
    } else {
      user = new User({
        facebookId: id,
        email: userEmail,
        name,
        username,
        photo: picture?.data?.url,
      });
      await user.save();
    }

    const token = jwt.sign({userId: user._id, email: user.email}, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({
      message: 'Facebook login successful',
      user,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({message: 'Facebook authentication failed', error});
  }
});

app.get('/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
});

app.get('/user/:userId', async (req, res) => {
  try {
    const {userId} = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(200).json({message: 'User not found'});
    }

    return res.status(200).json({user});
  } catch (error) {
    console.log('Error', error);
    res.status(500).json({message: 'failed to fetch user'});
  }
});

app.put('/setBudget/:tripId', async (req, res) => {
  const {tripId} = req.params;
  const {budget} = req.body;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({message: 'Trip not found'});
    }

    trip.budget = budget;
    await trip.save();

    res.status(200).json({message: 'Budget updated successfully', trip});
  } catch (error) {
    res.status(500).json({message: 'Error updating budget', error});
  }
});

app.post('/addExpense/:tripId', async (req, res) => {
  const {tripId} = req.params;
  const {category, categoryImage, price, paidBy, splitBy, createdBy, date} =
    req.body;

  try {
    console.log('Received data:', req.body);
    const trip = await Trip.findById(tripId);

    if (!trip) {
      console.log('Trip not found');
      return res.status(404).json({message: 'Trip not found'});
    }

    const newExpense = {
      category,
      categoryImage,
      price,
      paidBy,
      splitBy,
      createdBy,
      date: date ? new Date(date) : new Date(),
    };

    trip.expenses.push(newExpense);
    await trip.save();

    const updatedTrip = await Trip.findById(tripId)
      .populate('expenses.paidBy', 'name photo')
      .populate('expenses.splitBy', 'name photo');

    res
      .status(200)
      .json({message: 'Expense added successfully', trip: updatedTrip});
  } catch (error) {
    console.error('Error adding expense:', error);
    res
      .status(500)
      .json({message: 'Error adding expense', error: error.message});
  }
});
app.delete('/deleteExpense/:tripId/:expenseId', async (req, res) => {
  const {tripId, expenseId} = req.params;

  try {
    const trip = await Trip.findByIdAndUpdate(
      tripId,
      {$pull: {expenses: {_id: expenseId}}},
      {new: true},
    );

    if (!trip) {
      return res.status(404).json({message: 'Trip not found'});
    }

    res.status(200).json({message: 'Expense deleted successfully', trip});
  } catch (error) {
    console.error('Error deleting expense:', error);
    res
      .status(500)
      .json({message: 'Error deleting expense', error: error.message});
  }
});

app.put('/editExpense/:tripId/:expenseId', async (req, res) => {
  const {tripId, expenseId} = req.params;
  const {category, categoryImage, price, paidBy, splitBy, date} = req.body;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({message: 'Trip not found'});

    const expense = trip.expenses.id(expenseId);
    if (!expense) return res.status(404).json({message: 'Expense not found'});

    expense.category = category;
    expense.categoryImage = categoryImage;
    expense.price = price;
    expense.paidBy = paidBy;
    expense.splitBy = splitBy;
    expense.date = date ? new Date(date) : new Date();

    await trip.save();

    const updatedTrip = await Trip.findById(tripId)
      .populate('expenses.paidBy', 'name photo')
      .populate('expenses.splitBy', 'name photo');

    res
      .status(200)
      .json({message: 'Expense updated successfully', trip: updatedTrip});
  } catch (error) {
    console.error('Error updating expense:', error);
    res
      .status(500)
      .json({message: 'Error updating expense', error: error.message});
  }
});

app.post('/addComment/:tripId/:expenseId', async (req, res) => {
  const {tripId, expenseId} = req.params;
  const {userId, text} = req.body;

  console.log('Add Comment Request:', {tripId, expenseId, userId, text});

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      console.log('Trip not found');
      return res.status(404).json({message: 'Trip not found'});
    }

    const expense = trip.expenses.id(expenseId);
    if (!expense) {
      console.log('Expense not found');
      return res.status(404).json({message: 'Expense not found'});
    }

    const comment = {
      userId,
      text,
      createdAt: new Date(),
    };

    expense.comments.push(comment);
    await trip.save();

    const updatedTrip = await Trip.findById(tripId)
      .populate('expenses.paidBy', 'name photo')
      .populate('expenses.splitBy', 'name photo')
      .populate('expenses.comments.userId', 'name photo');

    console.log('Comment added successfully');
    res.status(200).json({message: 'Comment added', trip: updatedTrip});
  } catch (error) {
    console.error('Error adding comment:', error);
    res
      .status(500)
      .json({message: 'Error adding comment', error: error.message});
  }
});

app.get('/getComments/:tripId/:expenseId', async (req, res) => {
  const {tripId, expenseId} = req.params;

  try {
    const trip = await Trip.findById(tripId).populate(
      'expenses.comments.userId',
      'name photo',
    );

    if (!trip) {
      return res.status(404).json({message: 'Trip not found'});
    }

    const expense = trip.expenses.id(expenseId);
    if (!expense) {
      return res.status(404).json({message: 'Expense not found'});
    }

    const comments = expense.comments || [];
    res.status(200).json({comments});
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    res.status(500).json({message: 'Error fetching comments'});
  }
});

app.get('/getExpenses/:tripId', async (req, res) => {
  const {tripId} = req.params;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({message: 'Trip not found'});
    }

    res.status(200).json({expenses: trip.expenses});
  } catch (error) {
    res.status(500).json({message: 'Error fetching expenses', error});
  }
});

//Future Implementation:-

//1]Share Modal:-

//const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'sujananand0@gmail.com', // Your email address
//     pass: 'ryqudxkkxlhnxptz',
//   },
// });

// app.post('/sendInviteEmail', async (req, res) => {
//   const {email, tripId, tripName, senderName} = req.body;

//   // Construct the email content
//   const emailContent = `
//     <h3>Hello,</h3>
//     <p>${senderName} has invited you to join their trip "<strong>${tripName}</strong>".</p>
//     <p>Click the button below to join the trip:</p>
//     <a href="https://travelapp-32u1.onrender.com/joinTrip?tripId=${tripId}&email=${email}"
//       style="background-color: #4B61D1; color: white; padding: 10px 20px; text-decoration: none; font-size: 16px; border-radius: 5px;">
//       Join Trip
//     </a>
//     <p>If the button doesn't work, copy and paste this link into your browser:</p>
//     <p>https://travelapp-32u1.onrender.com/joinTrip?tripId=${tripId}&email=${email}</p>
//     <p>Best regards,</p>
//     <p>Wanderlog team</p>
//   `;

//   // Send email using nodemailer
//   try {
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: `Invitation to join the trip: ${tripName}`,
//       html: emailContent, // Email content in HTML format
//     });

//     res.status(200).json({message: 'Invitation email sent successfully'});
//   } catch (error) {
//     console.error('Error sending email:', error);
//     res.status(500).json({message: 'Error sending invitation email', error});
//   }
// });

// // Add User to Travelers List
// app.get('/joinTrip', async (req, res) => {
//   const {tripId, email} = req.query;

//   try {
//     console.log('trip', tripId);
//     console.log('email', email);
//     const normalizedEmail = email.toLowerCase();
//     // Find the user by email
//     const user = await User.findOne({email: normalizedEmail});
//     if (!user) {
//       return res.status(404).json({message: 'User not found'});
//     }

//     // Find the trip by tripId
//     const trip = await Trip.findById(tripId);
//     if (!trip) {
//       return res.status(404).json({message: 'Trip not found'});
//     }

//     // Check if the user is already in the travelers list
//     if (trip.travelers.includes(user._id)) {
//       return res.status(400).json({message: 'User is already a traveler'});
//     }

//     // Add the user to the travelers array
//     trip.travelers.push(user._id);
//     await trip.save();

//     res
//       .status(200)
//       .json({message: 'You have been successfully added to the trip'});
//   } catch (error) {
//     res.status(500).json({message: 'Error adding user to trip', error});
//   }
// });
