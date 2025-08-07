import axios from 'axios';

export const fetchHost = async (tripId, userId, callback) => {
  try {
    const response = await axios.get(
      `https://travelapp-32u1.onrender.com/trip/${tripId}/host`,
    );
    const hostData = response.data.host;

    const isHost = hostData?._id === userId;
    callback({isHost, hostData});
  } catch (error) {
    console.error('Error fetching host:', error);
    callback({isHost: false, hostData: null});
  }
};
