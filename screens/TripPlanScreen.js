import {
  Text,
  View,
  SafeAreaView,
  Image,
  Pressable,
  TextInput,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Animated,
} from 'react-native';
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useContext,
} from 'react';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import {BottomModal} from 'react-native-modals';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import Modal, {
  ModalContent,
  ModalTitle,
  SlideAnimation,
} from 'react-native-modals';
import Place from '../components/Place';
import {Swipeable} from 'react-native-gesture-handler';
import Itinerary from '../components/Itinerary';
import useBlinkingAnimation from '../hooks/useBlinkingAnimation';
import DinRest from '../components/DinRest';
import {AuthContext, DarkModeContext} from '../AuthContext';
import {fetchHost} from '../utils/fetchHost';
import Expense from '../components/Expense';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import styles from '../styles/TripPlanScreenStyles';

const TripPlanScreen = () => {
  const route = useRoute();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modal, setModal] = useState(false);
  console.log('hey hey hey', route?.params);
  console.log('user photo uri', route?.params?.user?.user?.photo);
  console.log('user id', route?.params?.user?.user?._id);
  console.log(route?.params);
  const [option, setOption] = useState('Overview');
  const navigation = useNavigation();
  const [expenses, setExpenses] = useState([]);
  const tripId = route?.params?.item?._id;
  const {isDarkMode, toggleDarkMode} = useContext(DarkModeContext);
  const [placeDetails, setPlaceDetails] = useState([]);
  const [price, setPrice] = useState(0);
  const [itinerary, setItinerary] = useState([]);
  const [places, setPlaces] = useState([]);
  const [isPaidByExpanded, setPaidByExpanded] = useState(false);
  const [isSplitExpanded, setSplitExpanded] = useState(false);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isPlacesExpanded, setIsPlacesExpanded] = useState(true);
  const opacity = useBlinkingAnimation(5000);
  const [selectedPayer, setSelectedPayer] = useState(route?.params?.user?._id);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://192.168.31.48:8000/trip/${tripId}/notes`,
      );
      setNotes(response.data.notes);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      showModal(
        'Note cannot be empty',
        'Please enter some text before adding a note.',
      );
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `http://192.168.31.48:8000/trip/${tripId}/addNote`,
        {
          text: newNote,
        },
      );

      setNotes([...notes, response.data.note]);
      setNewNote('');
      setEditingNote(null);
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditNote = async (id, newText) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `http://192.168.31.48:8000/trip/${tripId}/editNote/${id}`,
        {
          text: newText,
        },
      );

      setNotes(
        notes.map(note => (note._id === id ? response.data.note : note)),
      );
      setEditingNote(null);
    } catch (error) {
      console.error('Error updating note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async noteId => {
    try {
      await fetch(
        `http://192.168.31.48:8000/trip/${tripId}/deleteNote/${noteId}`,
        {
          method: 'DELETE',
        },
      );

      setNotes(notes.filter(note => note._id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const noteRenderRightActions = noteId => (
    <TouchableOpacity
      onPress={() => handleDeleteNote(noteId)}
      style={{
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        width: 70,
        height: '80%',
        borderRadius: 10,
        marginLeft: 10,
        marginTop: 10,
      }}>
      <AntDesign name="delete" size={25} color="white" />
    </TouchableOpacity>
  );
  const togglePaidBy = () => {
    setPaidByExpanded(!isPaidByExpanded);
    if (!isPaidByExpanded) {
      fetchParticipants();
    }
  };

  const toggleSplit = () => setSplitExpanded(!isSplitExpanded);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [splitLabel, setSplitLabel] = useState("Don't Split");

  const handleSelectParticipant = participant => {
    setSelectedParticipants(prev => {
      const isAlreadySelected = prev.some(p => p._id === participant._id);
      if (isAlreadySelected) {
        return prev.filter(p => p._id !== participant._id);
      }
      return [...prev, participant];
    });
  };
  const handleSelectEveryone = () => {
    if (selectedParticipants.length === participants.length) {
      setSelectedParticipants([]);
    } else {
      setSelectedParticipants(participants);
    }
  };
  const handleDontSplit = () => {
    setSelectedParticipants([]);
    setSplitLabel("Don't Split");
    setSplitExpanded(false);
  };
  const handleSave = () => {
    if (selectedParticipants.length === participants.length) {
      setSplitLabel('Everyone');
    } else if (selectedParticipants.length > 0) {
      const label = selectedParticipants
        .map(p => (p._id === participants[0]?._id ? 'You' : p.name))
        .join(', ');
      setSplitLabel(label);
    } else {
      setSplitLabel("Don't Split");
    }
    setSplitExpanded(false);
  };

  const inputRef = useRef(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const [openingHours, setOpeningHours] = useState('');
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [number, setNumber] = useState('');
  const [reviews, setReviews] = useState('');
  const [photos, setPhotos] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const fetchPlaceDetails = async placeId => {
    const API_KEY = 'AIzaSyAcrTZPToPzWZJhtGgehxe3MYxhkUN_W0U';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${API_KEY}`;

    try {
      const response = await axios.get(url);
      const details = response.data.result;

      console.log('Place Details:', details);

      const openingHours = details.opening_hours?.weekday_text;
      const phoneNumber = details.formatted_phone_number;
      const website = details.website;
      const reviews = details.reviews;
      const photos = details.photos;
      const description =
        details.editorial_summary?.overview ||
        details.reviews?.[0]?.text ||
        'No description available';

      const geometry = details?.geometry;

      setOpeningHours(openingHours);
      setNumber(phoneNumber);
      setWebsite(website);
      setReviews(reviews);
      setPhotos(photos);

      console.log('dfdf', geometry);

      try {
        const response = await axios.post(
          `http://192.168.31.48:8000/trip/${tripId}/addPlace`,
          {
            placeId: placeId,
          },
        );

        console.log('Updated Trip:', response.data);

        if (response.status == 200) {
          setModalVisible(false);
        }
      } catch (error) {
        console.error('Error adding place to trip:', error);
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  };

  const fetchPlacesToVisit = async () => {
    try {
      const response = await axios.get(
        `http://192.168.31.48:8000/trip/${tripId}/placesToVisit`,
      );
      const placesToVisit = response.data;
      console.log('Places to Visit:', placesToVisit);
      setPlaces(placesToVisit);
    } catch (error) {
      console.error('Error fetching places to visit:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchPlacesToVisit();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPlacesToVisit();
    }, [modalVisible]),
  );

  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [onModalClose, setOnModalClose] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [modalTitle, setModalTitle] = useState('');

  const handleCloseModal = () => {
    setCustomModalVisible(false);
    if (typeof onModalClose === 'function') {
      const callback = onModalClose;
      setOnModalClose(null);
      callback();
    }
  };

  const showModal = (title, message, callback = null) => {
    setModalTitle(title);
    setModalMessage(message);
    setCustomModalVisible(true);
    setOnModalClose(() => callback);
  };

  const [recommendedPlaces, setRecommendedPlaces] = useState([]);

  useEffect(() => {
    if (!places?.length) return;

    const {latitude, longitude} = {
      latitude: places[0].geometry.location.lat,
      longitude: places[0].geometry.location.lng,
    };

    const fetchRecommendedPlaces = async () => {
      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
          {
            params: {
              location: `${latitude},${longitude}`,
              radius: 10000,
              type: 'tourist_attraction',
              key: 'AIzaSyAcrTZPToPzWZJhtGgehxe3MYxhkUN_W0U',
            },
          },
        );

        setRecommendedPlaces(response.data.results.slice(0, 10));
      } catch (error) {
        console.error('Error fetching recommended places:', error);
      }
    };

    fetchRecommendedPlaces();
  }, [places]);

  const fetchDetails = async placeId => {
    const API_KEY = 'AIzaSyAcrTZPToPzWZJhtGgehxe3MYxhkUN_W0U';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${API_KEY}`;

    try {
      const response = await axios.get(url);
      const details = response.data.result;

      console.log('Place Details:', details);

      return details;
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  };

  const fetchAllPlaceDetails = async () => {
    const detailsPromises = recommendedPlaces
      .slice(0, 10)
      .map(place => fetchDetails(place.place_id));
    const fetchedDetails = await Promise.all(detailsPromises);
    const validDetails = fetchedDetails.filter(details => details !== null);

    setPlaceDetails(validDetails);
  };

  useEffect(() => {
    if (recommendedPlaces.length > 0) {
      fetchAllPlaceDetails();
    }
  }, [recommendedPlaces]);

  useEffect(() => {
    fetchItinerary();
  }, [modalVisible]);

  const fetchItinerary = async () => {
    try {
      const response = await axios.get(
        `http://192.168.31.48:8000/trip/${tripId}/itinerary`,
      );
      const itinerary = response.data;

      console.log('Itinerary fetched successfully:', itinerary);
      setItinerary(itinerary);
    } catch (error) {
      console.error('Error fetching itinerary:', error);
    }
  };

  const setOpenModal = item => {
    setSelectedDate(item?.date);
    setModalVisible(true);
  };

  const addPlaceToItinerary = async place => {
    console.log('place', place);
    const newActivity = {
      placeId: place._id,
      date: selectedDate,
      name: place.name,
      phoneNumber: place.phoneNumber,
      website: place.website,
      openingHours: place.openingHours,
      photos: place.photos,
      reviews: place.reviews,
      briefDescription: place.briefDescription,
      geometry: {
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        },
        viewport: {
          northeast: {
            lat: place.geometry.viewport.northeast.lat,
            lng: place.geometry.viewport.northeast.lng,
          },
          southwest: {
            lat: place.geometry.viewport.southwest.lat,
            lng: place.geometry.viewport.southwest.lng,
          },
        },
      },
    };

    try {
      const response = await axios.post(
        `http://192.168.31.48:8000/trips/${tripId}/itinerary/${selectedDate}`,
        newActivity,
      );
      console.log('Activity added successfully:', response.data);
      setModalVisible(false);
    } catch (error) {
      console.error('Error adding place to itinerary:', error);
    }
  };

  console.log('ititi', itinerary);
  const [modalView, setModalView] = useState('original');
  const goToBlankView = () => setModalView('blank');
  const goToOriginalView = () => setModalView('original');

  const [items, setItems] = useState([]);

  const choosePlaces = name => {
    setItems(prevItems => {
      if (prevItems.includes(name)) {
        return prevItems.filter(item => item !== name);
      } else {
        return [...prevItems, name];
      }
    });
  };

  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');

  const selectCategory = item => {
    setCategory(item?.name);
    setImage(item?.image);
    setModalView('original');
  };

  console.log('hhfs', route?.params?.user?.email);

  const data = [
    {
      id: '0',
      name: 'Flights',
      image:
        'https://t3.ftcdn.net/jpg/02/58/40/90/240_F_258409001_w0gCLGQ5pFdJEyNB8KiiNrijHCGSdUpQ.jpg',
    },
    {
      id: '2',
      name: 'Lodges',
      image:
        'https://t3.ftcdn.net/jpg/02/21/73/46/240_F_221734695_OLItP2OWAkRqBLol8esvA4a9PuTV5pgK.jpg',
    },
    {
      id: '3',
      name: 'Car Rental',
      image:
        'https://t3.ftcdn.net/jpg/01/92/21/40/240_F_192214085_QnQ58x0ZKRLSUEgarcjVHNWrnmH8uWTA.jpg',
    },
    {
      id: '4',
      name: 'Food',
      image:
        'https://t3.ftcdn.net/jpg/00/81/02/86/240_F_81028652_e31aujidvR7NAtA8Cl4VxjDUJFUeAFte.jpg',
    },
    {
      id: '5',
      name: 'Activities',
      image:
        'https://t4.ftcdn.net/jpg/02/64/91/73/240_F_264917306_HnNaVViUQshIGnOGm1LA2FuE4YhTdu1l.jpg',
    },
    {
      id: '6',
      name: 'Shopping',
      image: 'https://cdn-icons-png.flaticon.com/128/2838/2838694.png',
    },
    {
      id: '9',
      name: 'Tour',
      image:
        'https://t3.ftcdn.net/jpg/08/37/58/92/240_F_837589252_QQfYmY2md3yunH4jRARAi6uNVf9yap53.jpg',
    },
    {
      id: '7',
      name: 'Petrol',
      image:
        'https://media.istockphoto.com/id/925225820/vector/gas-station-icon.jpg?b=1&s=612x612&w=is&k=20&c=w6pmbKjeR0z637e5fKhlDWGOJP6dgrafypC6tUI6LxM=',
    },
    {
      id: '8',
      name: 'Other',
      image:
        'https://t3.ftcdn.net/jpg/02/73/79/70/240_F_273797075_lqtsBJvUc9QsulXvIexCUHGLJWntTOL5.jpg',
    },
  ];

  const [budget, setBudget] = useState('');

  const handleSetBudget = () => {
    setTripBudget(Number(budget));
  };

  const setTripBudget = async budget => {
    console.log('budge', budget);
    try {
      const response = await axios.put(
        `http://192.168.31.48:8000/setBudget/${tripId}`,
        {
          budget,
        },
      );
      setModalOpen(false);
      console.log('Budget updated successfully:', response.data);
    } catch (error) {
      console.error('Error setting budget:', error);
    }
  };
  const addExpenseToTrip = async () => {
    console.log('user', route?.params?.user?._id);
    if (!category || !price || !route?.params?.user?.name) {
      showModal('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    if (isNaN(price)) {
      showModal('Invalid Input', 'Price must be a valid number.');
      return;
    }
    if (splitLabel !== "Don't Split" && selectedParticipants.length === 0) {
      showModal(
        'Select Participants',
        'Please select at least one participant to split with.',
      );
      return;
    }
    try {
      const expenseData = {
        category,
        categoryImage: image,
        price,
        splitBy: selectedParticipants.map(user => user._id),
        paidBy: selectedPayer,
        createdBy: route?.params?.user?._id,
        date: selectedExpenseDate || new Date(),
      };

      const response = await axios.post(
        `http://192.168.31.48:8000/addExpense/${tripId}`,
        expenseData,
      );

      if (response.status === 200) {
        console.log('Expense added successfully:', response.data);
        setModal(!modal);

        setPrice('');
        selectCategory('');
        setSelectedPayer(setSelectedPayer);
        setSelectedParticipants([]);
        setSelectedExpenseDate(null);
        setSplitLabel("Don't Split");
        setSplitExpanded(false);
      } else {
        console.error('Failed to add expense:', response.data.message);
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const editExpenseInTrip = async () => {
    if (!category || !price || !route?.params?.user?.name) {
      showModal('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    if (isNaN(price)) {
      showModal('Invalid Input', 'Price must be a valid number.');
      return;
    }

    if (splitLabel !== "Don't Split" && selectedParticipants.length === 0) {
      showModal(
        'Select Participants',
        'Please select at least one participant to split with.',
      );
      return;
    }

    try {
      const expenseData = {
        category,
        categoryImage: image,
        price: parseFloat(price),
        splitBy: selectedParticipants.map(user => user._id),
        paidBy: selectedPayer,
        date: selectedExpenseDate || new Date(),
      };

      const response = await axios.put(
        `http://192.168.31.48:8000/editExpense/${tripId}/${modal._id}`,
        expenseData,
      );

      if (response.status === 200) {
        console.log('Expense updated successfully:', response.data);
        setModal(false);
        const updatedExpenseRaw = response.data.trip.expenses.find(
          exp => exp._id === modal._id,
        );

        const paidByUser = participants.find(
          p => p._id === updatedExpenseRaw.paidBy,
        );
        const splitByUsers = updatedExpenseRaw.splitBy.map(id =>
          participants.find(p => p._id === id),
        );

        const updatedExpense = {
          ...updatedExpenseRaw,
          paidBy: selectedPayer,
          splitBy: selectedParticipants.map(user => user._id),
        };

        navigation.navigate('ExpenseDetails', {
          expense: updatedExpense,
          participants,
          tripId,
          setModal,
          modalOpen,
        });
        setPrice('');
        selectCategory('');
        setSelectedPayer('');
        setSelectedParticipants([]);
        setSelectedExpenseDate(null);
        setSplitLabel("Don't Split");
        setSplitExpanded(false);
      } else {
        console.error('Failed to update expense:', response.data.message);
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchExpenses();
  }, [modal]);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(
        `http://192.168.31.48:8000/getExpenses/${tripId}`,
      );

      if (response.status === 200) {
        console.log('Expenses fetched successfully:', response.data.expenses);

        setExpenses(response.data.expenses);
      } else {
        console.error('Failed to fetch expenses:', response.data.message);
      }
    } catch (error) {
      console.error(
        'Error fetching expenses:',
        error.response ? error.response.data : error.message,
      );
    }
  };

  const [participants, setParticipants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [partModalVisible, setPartModalVisible] = useState(false);

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      setLoadingParticipants(true);
      const response = await axios.get(
        `http://192.168.31.48:8000/trip/${tripId}/participants`,
      );
      setParticipants(response.data.participants);
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const searchUsers = async query => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(
        `http://192.168.31.48:8000/users/search?query=${query}&tripId=${tripId}`,
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleAddParticipant = async userId => {
    try {
      setLoadingParticipants(true);
      await axios.post(
        `http://192.168.31.48:8000/trip/${tripId}/addParticipant`,
        {userId},
      );
      await fetchParticipants();

      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error adding participant:', error);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const [showSearch, setShowSearch] = useState(false);
  const [isParticipantExpanded, setIsParticipantExpanded] = useState(true);

  const handleRemoveParticipant = async userId => {
    try {
      setLoadingParticipants(true);

      await axios.delete(
        `http://192.168.31.48:8000/trip/${tripId}/removeParticipant/${userId}`,
      );
      await fetchParticipants();
    } catch (error) {
      console.error('Error removing participant:', error);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const participantRenderRightActions = (participantId, index) => {
    if (index === 0) return null;

    return (
      <TouchableOpacity
        onPress={() => handleRemoveParticipant(participantId)}
        style={{
          backgroundColor: 'red',
          justifyContent: 'center',
          alignItems: 'center',
          width: 70,
          height: '100%',
          borderRadius: 10,
          marginLeft: 10,
        }}>
        <Text style={{color: 'white', fontWeight: 'bold'}}>Remove</Text>
      </TouchableOpacity>
    );
  };

  const [isHost, setIsHost] = useState(false);
  const [hostData, setHostData] = useState(null);
  const {userId} = useContext(AuthContext);

  const [isHostLoading, setIsHostLoading] = useState(true);

  useEffect(() => {
    const loadHost = async () => {
      setIsHostLoading(true);
      await fetchHost(tripId, userId, ({isHost, hostData}) => {
        setIsHost(isHost);
        setHostData(hostData);
        setIsHostLoading(false);
      });
    };
    loadHost();
  }, []);

  const [selectedExpenseDate, setSelectedExpenseDate] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = date => {
    setSelectedExpenseDate(date);
    hideDatePicker();
  };

  const formatDate = date => {
    if (date) {
      return moment(date).format('DD MMMM YYYY');
    }
    return 'Set Date';
  };

  useEffect(() => {
    if (modal?._id) {
      setPrice(modal.price?.toString());
      setCategory(modal.category);
      setSelectedPayer(modal.paidBy);
      setSelectedExpenseDate(modal.date);
      setImage(modal.categoryImage);

      const splitParticipants =
        participants?.filter(p => modal.splitBy?.includes(p._id)) || [];

      setSelectedParticipants(splitParticipants);

      if (modal.splitBy?.length === 0) {
        setSplitLabel("Don't Split");
      } else if (modal.splitBy?.length === participants?.length) {
        setSplitLabel('Everyone');
      } else {
        const label = splitParticipants
          .map(p => (p._id === participants[0]?._id ? 'You' : p.name))
          .join(', ');
        setSplitLabel(label);
      }
    }
  }, [modal, participants]);

  const currentStyles = styles(isDarkMode);
  return (
    <View style={{flex: 1, backgroundColor: isDarkMode ? '#1e1e1e' : 'white'}}>
      <SafeAreaView>
        <ScrollView contentContainerStyle={{paddingBottom: 50}}>
          <View>
            <Image
              style={{width: '100%', height: 200, resizeMode: 'cover'}}
              source={{
                uri: 'https://m.media-amazon.com/images/I/61ayA5u2BbL._AC_UF1000,1000_QL80_.jpg',
              }}
            />
            <View>
              <View>
                <Pressable
                  style={{
                    padding: 20,
                    backgroundColor: isDarkMode ? '#1e1e1e' : 'white',
                    width: 300,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    borderRadius: 10,
                    position: 'absolute',
                    top: -100,
                    left: '50%',
                    transform: [{translateX: -150}],
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      textAlign: 'left',
                      fontSize: 22,
                      fontWeight: 'bold',
                      color: isDarkMode ? 'white' : '#1e1e1e',
                    }}>
                    Trip To {route?.params?.item?.tripName}
                  </Text>
                  <View style={{marginTop: 10}}>
                    <View>
                      <Text
                        style={{
                          fontWeight: '500',
                          color: isDarkMode ? 'lightgray' : 'black',
                        }}>
                        {route?.params?.item.startDate} -{' '}
                        {route?.params?.item.endDate}
                      </Text>
                      <Text
                        style={{
                          color: isDarkMode ? 'lightgray' : 'gray',
                          marginTop: 4,
                        }}>
                        {route?.params?.item?.startDay} -{' '}
                        {route?.params?.item?.endDay}
                      </Text>
                    </View>

                    <View style={{marginTop: 10}}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 10,
                        }}>
                        <View
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 8,
                            borderRadius: 25,
                            alignSelf: 'flex-start',
                            backgroundColor: 'black',
                            borderWidth: 1,
                            borderColor: 'white',
                          }}>
                          <Text
                            style={{
                              textAlign: 'center',
                              color: 'white',
                              fontSize: 12,
                              fontWeight: '500',
                            }}>
                            Trip Hosted By :
                          </Text>
                        </View>

                        {isHostLoading ? (
                          <ActivityIndicator
                            size="small"
                            color={isDarkMode ? 'lightgray' : '#000'}
                          />
                        ) : (
                          hostData?.photo && (
                            <Image
                              style={{width: 34, height: 34, borderRadius: 17}}
                              source={{uri: hostData.photo}}
                            />
                          )
                        )}
                      </View>
                    </View>
                  </View>
                </Pressable>
              </View>
            </View>

            <View
              style={{
                backgroundColor: isDarkMode ? '#2e2e2e' : 'white',
                height: 80,
                zIndex: -100,
              }}
            />

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 25,
                justifyContent: 'space-around',
                backgroundColor: isDarkMode ? '#2e2e2e' : 'white',
                padding: 12,
              }}>
              <Pressable onPress={() => setOption('Overview')}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: option == 'Overview' ? '#ed6509' : 'gray',
                  }}>
                  Overview
                </Text>
              </Pressable>
              <Pressable onPress={() => setOption('Itinerary')}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: option == 'Itinerary' ? '#ed6509' : 'gray',
                  }}>
                  Itinerary
                </Text>
              </Pressable>
              <Pressable onPress={() => setOption('Explore')}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: option == 'Explore' ? '#ed6509' : 'gray',
                  }}>
                  Explore
                </Text>
              </Pressable>
              <Pressable onPress={() => setOption('$')}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: option == '$' ? '#ed6509' : 'gray',
                  }}>
                  $
                </Text>
              </Pressable>
            </View>
            <View style={{}}>
              {option == 'Overview' && (
                <ScrollView
                  contentContainerStyle={{marginBottom: 25}}
                  style={{
                    marginTop: 15,
                    borderRadius: 10,
                  }}>
                  <View
                    style={{
                      backgroundColor: isDarkMode ? '#2e2e2e' : 'white',
                      padding: 12,
                    }}>
                    {/* Header Section */}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                      <TouchableOpacity
                        onPress={() => setIsExpanded(prev => !prev)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 5,
                        }}>
                        <MaterialIcons
                          name={
                            isExpanded
                              ? 'keyboard-arrow-down'
                              : 'keyboard-arrow-right'
                          }
                          size={25}
                          color={isDarkMode ? 'white' : 'black'}
                        />
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: 'bold',
                            color: isDarkMode ? 'white' : 'black',
                          }}>
                          Notes
                        </Text>
                      </TouchableOpacity>
                      {isHost && (
                        <View style={{marginRight: -150}}>
                          <Animated.View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              opacity,
                            }}>
                            <MaterialCommunityIcons
                              name="arrow-left"
                              size={13}
                              color={isDarkMode ? 'white' : 'gray'}
                            />
                            <Text
                              style={{
                                fontSize: 13,
                                color: isDarkMode ? 'white' : 'gray',
                                marginLeft: 3,
                              }}>
                              Swipe left to delete note
                            </Text>
                          </Animated.View>
                        </View>
                      )}
                      {isHost && (
                        <TouchableOpacity onPress={() => setEditingNote('new')}>
                          <MaterialCommunityIcons
                            name="plus"
                            size={25}
                            color={isDarkMode ? 'white' : 'gray'}
                          />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Notes List (Conditional Rendering) */}
                    {isExpanded && (
                      <>
                        {loading ? (
                          <ActivityIndicator
                            size="small"
                            color="gray"
                            style={{marginTop: 10}}
                          />
                        ) : notes.length === 0 ? (
                          <Text
                            style={{
                              fontWeight: '500',
                              fontStyle: 'italic',
                              color: isDarkMode ? 'darkgray' : 'gray',
                              marginTop: 10,
                            }}>
                            {isHost
                              ? 'Write or paste general notes here, e.g. how to get'
                              : 'No note added'}
                          </Text>
                        ) : (
                          <FlatList
                            data={notes}
                            keyExtractor={item => item._id}
                            scrollEnabled={false}
                            renderItem={({item}) => (
                              <Swipeable
                                renderRightActions={() =>
                                  noteRenderRightActions(item._id)
                                }>
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    paddingVertical: 8,
                                    paddingLeft: 15,
                                    borderWidth: 0.5,
                                    borderColor: '#ccc',
                                    borderRadius: 5,
                                    marginTop: 10,
                                  }}>
                                  {editingNote === item._id ? (
                                    <TextInput
                                      style={{
                                        flex: 1,
                                        borderBottomWidth: 1,
                                        borderColor: '#0066b2',
                                        padding: 5,
                                        color: isDarkMode ? 'white' : 'black',
                                      }}
                                      value={item.text}
                                      onChangeText={text =>
                                        setNotes(
                                          notes.map(n =>
                                            n._id === item._id
                                              ? {...n, text}
                                              : n,
                                          ),
                                        )
                                      }
                                      onBlur={() =>
                                        handleEditNote(item._id, item.text)
                                      }
                                    />
                                  ) : (
                                    <Text
                                      style={{
                                        flex: 1,
                                        color: isDarkMode ? 'white' : 'black',
                                      }}>
                                      {item.text}
                                    </Text>
                                  )}
                                  {isHost && (
                                    <TouchableOpacity
                                      onPress={() =>
                                        editingNote === item._id &&
                                        item.text.trim()
                                          ? handleEditNote(item._id, item.text)
                                          : setEditingNote(item._id)
                                      }
                                      disabled={
                                        editingNote === item._id &&
                                        !item.text.trim()
                                      }>
                                      <MaterialCommunityIcons
                                        name={
                                          editingNote === item._id
                                            ? 'check'
                                            : 'pencil'
                                        }
                                        size={20}
                                        color={
                                          editingNote === item._id &&
                                          !item.text.trim()
                                            ? isDarkMode
                                              ? '#555'
                                              : 'lightgray'
                                            : editingNote === item._id
                                            ? 'green'
                                            : 'gray'
                                        }
                                      />
                                    </TouchableOpacity>
                                  )}
                                </View>
                              </Swipeable>
                            )}
                          />
                        )}

                        {/* Input for New Notes */}
                        {editingNote === 'new' && (
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginTop: 10,
                            }}>
                            <TextInput
                              style={{
                                flex: 1,
                                borderBottomWidth: 1,
                                borderColor: '#0066b2',
                                padding: 5,
                                color: isDarkMode ? 'white' : 'black',
                              }}
                              value={newNote}
                              onChangeText={setNewNote}
                              placeholder="Enter your note"
                              placeholderTextColor={
                                isDarkMode ? '#888' : '#aaa'
                              }
                            />
                            <TouchableOpacity
                              onPress={handleAddNote}
                              style={{marginLeft: 10}}
                              disabled={!newNote.trim()}>
                              <MaterialCommunityIcons
                                name="check"
                                size={25}
                                color={!newNote.trim() ? 'lightgray' : 'green'}
                              />
                            </TouchableOpacity>
                          </View>
                        )}
                      </>
                    )}
                  </View>
                  <View
                    style={{
                      backgroundColor: isDarkMode ? '#2e2e2e' : 'white',
                      padding: 12,
                      marginVertical: 15,
                    }}>
                    {/* Header Section */}
                    <TouchableOpacity
                      onPress={() => setIsPlacesExpanded(prev => !prev)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                      {/* Left Side - Icon + Title */}
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 5,
                        }}>
                        <MaterialIcons
                          name={
                            isPlacesExpanded
                              ? 'keyboard-arrow-down'
                              : 'keyboard-arrow-right'
                          }
                          size={25}
                          color={isDarkMode ? 'white' : 'black'}
                        />
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: 'bold',
                            color: isDarkMode ? 'white' : 'black',
                          }}>
                          Places to Visit
                        </Text>
                      </View>
                      {isHost && (
                        <View style={{marginRight: 30}}>
                          <Animated.View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              opacity,
                            }}>
                            <MaterialCommunityIcons
                              name="arrow-left"
                              size={13}
                              color={isDarkMode ? 'white' : 'gray'}
                            />
                            <Text
                              style={{
                                fontSize: 13,
                                color: isDarkMode ? 'white' : 'gray',
                                marginLeft: 3,
                              }}>
                              Swipe left to delete place
                            </Text>
                          </Animated.View>
                        </View>
                      )}
                    </TouchableOpacity>

                    {/* Expandable Content */}
                    {isPlacesExpanded && (
                      <>
                        {/* Places List */}
                        <View>
                          {places && places.length > 0
                            ? places.map((item, index) => (
                                <Place
                                  key={item._id}
                                  index={index}
                                  item={item}
                                  items={items}
                                  setItems={setItems}
                                  refreshPlaces={fetchPlacesToVisit}
                                  refreshItinerary={fetchItinerary}
                                  route={route}
                                />
                              ))
                            : !isHost && (
                                <Text
                                  style={{
                                    marginLeft: 15,
                                    color: isDarkMode ? 'white' : 'gray',
                                    marginTop: 10,
                                  }}>
                                  No places added
                                </Text>
                              )}
                        </View>

                        {/* Input Section */}
                        <View
                          style={{
                            marginTop: 10,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 10,
                            width: 400,
                          }}>
                          <View></View>

                          {isHost && (
                            <Pressable
                              onPress={() => setModalVisible(!modalVisible)}
                              style={{
                                padding: 10,
                                borderRadius: 10,
                                backgroundColor: isDarkMode
                                  ? '#4A4A4A'
                                  : '#F0F0F0',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 5,
                                flex: 1,
                              }}>
                              <MaterialIcons
                                name="location-pin"
                                size={25}
                                color={isDarkMode ? 'lightgray' : 'gray'}
                              />
                              <TextInput
                                placeholderTextColor={
                                  isDarkMode ? 'lightgray' : 'black'
                                }
                                style={{}}
                                placeholder="Add a place"
                              />
                            </Pressable>
                          )}
                        </View>

                        {/* Recommended Places Section */}
                        {isHost && (
                          <Text
                            style={{
                              fontSize: 15,
                              fontWeight: '500',
                              marginLeft: 10,
                              marginTop: 15,
                              color: isDarkMode ? 'white' : 'black',
                            }}>
                            Recommended Places
                          </Text>
                        )}

                        {isHost && (
                          <View
                            style={{marginHorizontal: 10, marginVertical: 15}}>
                            {placeDetails && (
                              <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}>
                                {placeDetails?.map((item, index) => {
                                  const firstPhoto = item?.photos?.[0];
                                  const imageUrl = firstPhoto
                                    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${firstPhoto.photo_reference}&key=AIzaSyAcrTZPToPzWZJhtGgehxe3MYxhkUN_W0U`
                                    : null;

                                  return (
                                    <Pressable
                                      style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginRight: 12,
                                        borderWidth: 1,
                                        borderColor: '#E0E0E0',
                                        borderRadius: 8,
                                        padding: 10,
                                        marginBottom: 10,
                                        height: 100,
                                        overflow: 'hidden',
                                      }}
                                      key={index}>
                                      <View style={{marginRight: 10}}>
                                        {imageUrl ? (
                                          <Image
                                            source={{uri: imageUrl}}
                                            style={{
                                              width: 80,
                                              height: 80,
                                              borderRadius: 6,
                                            }}
                                            resizeMode="cover"
                                          />
                                        ) : (
                                          <View
                                            style={{
                                              width: 80,
                                              height: 80,
                                              borderRadius: 10,
                                              backgroundColor: isDarkMode
                                                ? 'lightgray'
                                                : '#f0f0f0',
                                              justifyContent: 'center',
                                              alignItems: 'center',
                                            }}>
                                            <Text
                                              style={{
                                                color: 'black',
                                                fontSize: 12,
                                                textAlign: 'center',
                                              }}>
                                              No Image Available
                                            </Text>
                                          </View>
                                        )}
                                      </View>
                                      <Text
                                        style={{
                                          flex: 1,
                                          fontSize: 16,
                                          fontWeight: '500',
                                          color: isDarkMode ? 'white' : '#333',
                                          width: 150,
                                        }}
                                        numberOfLines={2}
                                        ellipsizeMode="tail">
                                        {item?.name}
                                      </Text>
                                    </Pressable>
                                  );
                                })}
                              </ScrollView>
                            )}
                          </View>
                        )}
                      </>
                    )}
                  </View>
                  <View
                    style={{
                      backgroundColor: isDarkMode ? '#2e2e2e' : 'white',
                      padding: 12,
                      marginTop: 10,
                    }}>
                    {/* Header */}
                    <TouchableOpacity
                      onPress={() => {
                        setIsParticipantExpanded(prev => {
                          if (prev) {
                            setShowSearch(false);
                          }
                          return !prev;
                        });
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 5,
                          paddingBottom: 5,
                        }}>
                        <MaterialIcons
                          name={
                            isParticipantExpanded
                              ? 'keyboard-arrow-down'
                              : 'keyboard-arrow-right'
                          }
                          size={25}
                          color={isDarkMode ? 'white' : 'black'}
                        />
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: 'bold',
                            color: isDarkMode ? 'white' : 'black',
                          }}>
                          Participants
                        </Text>
                      </View>
                      {isHost && (
                        <View style={{marginRight: -60}}>
                          <Animated.View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              opacity,
                            }}>
                            <MaterialCommunityIcons
                              name="arrow-left"
                              size={13}
                              color={isDarkMode ? 'white' : 'gray'}
                            />
                            <Text
                              style={{
                                fontSize: 13,
                                color: isDarkMode ? 'white' : 'gray',
                                marginLeft: 3,
                              }}>
                              Swipe left to remove participant
                            </Text>
                          </Animated.View>
                        </View>
                      )}

                      {/* Search Icon */}
                      {isHost && (
                        <TouchableOpacity
                          onPress={() => {
                            setShowSearch(true);
                            setIsParticipantExpanded(true);
                          }}>
                          <Ionicons
                            name="search"
                            size={20}
                            color={isDarkMode ? 'white' : 'gray'}
                          />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>

                    {/* Expandable Section */}

                    {isParticipantExpanded && (
                      <>
                        {/* Search Bar */}
                        {showSearch && (
                          <Pressable
                            onPress={() => setPartModalVisible(true)}
                            style={{
                              padding: 10,
                              borderRadius: 10,
                              backgroundColor: isDarkMode
                                ? '#4A4A4A'
                                : '#F0F0F0',
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 5,
                              marginBottom: 10,
                            }}>
                            <MaterialIcons
                              name="search"
                              size={25}
                              color={isDarkMode ? 'white' : 'gray'}
                            />
                            <TextInput
                              placeholder="Search users..."
                              placeholderTextColor={
                                isDarkMode ? 'lightgray' : 'black'
                              }
                              editable={false}
                              style={{flex: 1}}
                            />
                          </Pressable>
                        )}

                        {/* Participants List */}
                        {loadingParticipants ? (
                          <ActivityIndicator
                            size="small"
                            color="gray"
                            style={{marginTop: 10}}
                          />
                        ) : (
                          <FlatList
                            data={participants}
                            keyExtractor={item => item._id}
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                            renderItem={({item, index}) => (
                              <Swipeable
                                renderRightActions={() =>
                                  participantRenderRightActions(item._id, index)
                                }
                                enabled={isHost && index !== 0}>
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingVertical: 8,
                                    paddingLeft: 10,
                                    justifyContent: 'space-between',
                                  }}>
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                    }}>
                                    <Image
                                      source={{
                                        uri:
                                          item.photo ||
                                          'https://via.placeholder.com/30',
                                      }}
                                      style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 20,
                                        marginRight: 10,
                                        backgroundColor: '#ccc',
                                      }}
                                    />
                                    <View>
                                      <Text
                                        style={{
                                          fontSize: 16,
                                          fontWeight: '500',
                                          color: isDarkMode ? 'white' : 'black',
                                        }}>
                                        {item.name}
                                      </Text>
                                      <Text
                                        style={{
                                          fontSize: 12,
                                          color: isDarkMode ? 'white' : 'gray',
                                        }}>
                                        {index === 0 ? 'Host' : 'Member'}
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                              </Swipeable>
                            )}
                          />
                        )}
                      </>
                    )}
                  </View>
                </ScrollView>
              )}
            </View>

            <View>
              {option == 'Itinerary' && (
                <Itinerary
                  route={route}
                  itinerary={itinerary}
                  setOpenModal={setOpenModal}
                  refreshItinerary={fetchItinerary}
                />
              )}
            </View>

            <View>
              {option == 'Explore' && (
                <DinRest fetchDetails={fetchDetails} places={places} />
              )}
            </View>

            <View>
              {option == '$' && (
                <Expense
                  route={route}
                  budget={budget}
                  expenses={expenses}
                  modalOpen={modalOpen}
                  setModalOpen={setModalOpen}
                  modal={modal}
                  setModal={setModal}
                  participants={participants}
                  fetchParticipants={fetchParticipants}
                  tripId={tripId}
                  refreshExpenses={fetchExpenses}
                />
              )}
            </View>
          </View>

          <BottomModal
            onBackdropPress={() => setModalVisible(!modalVisible)}
            swipeDirection={['up', 'down']}
            swipeThreshold={200}
            modalAnimation={
              new SlideAnimation({
                slideFrom: 'bottom',
              })
            }
            onHardwareBackPress={() => setModalVisible(!modalVisible)}
            visible={modalVisible}
            onTouchOutside={() => setModalVisible(!modalVisible)}>
            <ModalContent
              style={{
                width: '100%',
                height: 800,
                backgroundColor: isDarkMode ? '#2e2e2e' : 'white',
              }}>
              <View>
                <Text
                  style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: isDarkMode ? 'white' : 'black',
                  }}>
                  Add a Place
                </Text>
                <View style={{width: '100%'}}>
                  <GooglePlacesAutocomplete
                    styles={{
                      container: {
                        flex: 0,
                        marginLeft: 15,
                        width: '90%',
                        borderRadius: 20,
                        borderColor: isDarkMode ? '#2e2e2e' : 'white',
                        borderWidth: 1,
                        marginTop: 20,
                      },
                      textInput: {
                        height: 38,
                        color: '#5d5d5d',
                        fontSize: 16,
                        borderRadius: 24,
                        backgroundColor: isDarkMode ? '#4A4A4A' : '#F0F0F0',
                        color: isDarkMode ? '#f0f0f0' : '#5d5d5d',
                      },
                      textInputContainer: {
                        borderRadius: 20,
                      },
                      listView: {
                        backgroundColor: isDarkMode ? '#4A4A4A' : '#F0F0F0',
                        borderRadius: 10,
                        elevation: 4,
                        marginTop: 5,
                      },
                      row: {
                        backgroundColor: isDarkMode ? '#4A4A4A' : '#F0F0F0',
                        padding: 13,
                        height: 44,
                        flexDirection: 'row',
                      },
                      description: {
                        color: isDarkMode ? '#eee' : '#000',
                      },
                      separator: {
                        height: 0.5,
                        backgroundColor: isDarkMode ? '#4A4A4A' : '#F0F0F0',
                      },
                    }}
                    textInputProps={{
                      placeholderTextColor: isDarkMode ? '#ccc' : '#666',
                    }}
                    placeholder="Search"
                    fetchDetails={true}
                    onPress={(data, details = null) => {
                      console.log('Selected Place:', data);
                      setName(data?.description);
                      if (!details) {
                        console.error('Details are null or undefined');
                        return;
                      }
                      console.log('Full Place Details:', details);

                      if (details) {
                        const placeId = details.place_id;
                        fetchPlaceDetails(placeId);
                      }
                    }}
                    query={{
                      key: 'AIzaSyAcrTZPToPzWZJhtGgehxe3MYxhkUN_W0U',
                      language: 'en',
                    }}
                  />
                </View>

                <View>
                  <Text
                    style={{
                      textAlign: 'center',
                      color: isDarkMode ? 'white' : 'gray',
                      marginTop: 12,
                    }}>
                    Places In your list
                  </Text>
                  <FlatList
                    data={places}
                    keyExtractor={(item, index) => index.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{paddingBottom: 300}}
                    renderItem={({item, index}) => (
                      <Pressable
                        onPress={() => addPlaceToItinerary(item)}
                        style={{marginTop: 12}}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 10,
                          }}>
                          <View
                            style={{flex: 1, flexShrink: 1, paddingRight: 10}}>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 7,
                              }}>
                              <View
                                style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: 15,
                                  backgroundColor: 'blue',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}>
                                <Text
                                  style={{color: 'white', fontWeight: '500'}}>
                                  {index + 1}
                                </Text>
                              </View>

                              <Text
                                style={{
                                  fontSize: 16,
                                  fontWeight: '500',
                                  flexShrink: 1,
                                  color: isDarkMode ? 'white' : 'black',
                                }}>
                                {item?.name}
                              </Text>
                            </View>

                            <Text
                              style={{
                                color: isDarkMode ? 'white' : 'gray',
                                marginTop: 7,
                                width: '80%',
                              }}
                              numberOfLines={4}
                              ellipsizeMode="tail">
                              {item?.briefDescription}
                            </Text>
                          </View>

                          <View>
                            {item?.photos?.length > 0 && item.photos[0] ? (
                              <Image
                                source={{uri: item.photos[0]}}
                                style={{
                                  width: 100,
                                  height: 100,
                                  borderRadius: 10,
                                }}
                                resizeMode="cover"
                              />
                            ) : (
                              <View
                                style={{
                                  width: 100,
                                  height: 100,
                                  borderRadius: 10,
                                  backgroundColor: isDarkMode
                                    ? 'lightgray'
                                    : '#f0f0f0',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}>
                                <Text
                                  style={{
                                    color: 'black',
                                    fontSize: 12,
                                    textAlign: 'center',
                                  }}>
                                  No Image Available
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </Pressable>
                    )}
                  />
                </View>
              </View>
            </ModalContent>
          </BottomModal>

          <BottomModal
            visible={partModalVisible}
            onTouchOutside={() => setPartModalVisible(false)}
            onBackdropPress={() => setPartModalVisible(false)}
            swipeDirection={['up', 'down']}
            swipeThreshold={200}
            modalAnimation={new SlideAnimation({slideFrom: 'bottom'})}>
            <ModalContent
              style={{
                width: '100%',
                height: 800,
                backgroundColor: isDarkMode ? '#2e2e2e' : 'white',
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: isDarkMode ? 'white' : 'black',
                }}>
                Search Users
              </Text>
              <TextInput
                placeholder="Search users..."
                placeholderTextColor={isDarkMode ? 'lightgray' : 'black'}
                value={searchQuery}
                onChangeText={searchUsers}
                style={{
                  marginTop: 10,
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 8,
                  padding: 8,
                  width: '90%',
                  alignSelf: 'center',
                  color: isDarkMode ? 'white' : 'black',
                }}
              />

              {searchQuery.length > 0 ? (
                searchResults.length > 0 ? (
                  <FlatList
                    data={searchResults}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{paddingBottom: 100}}
                    renderItem={({item}) => (
                      <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 10,
                        }}
                        onPress={() => {
                          handleAddParticipant(item._id);
                          setPartModalVisible(false);
                        }}>
                        <Image
                          source={{uri: item.photo}}
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 15,
                            marginRight: 10,
                          }}
                        />
                        <Text style={{color: isDarkMode ? 'white' : 'black'}}>
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                ) : (
                  <Text
                    style={{
                      textAlign: 'center',
                      marginTop: 20,
                      color: isDarkMode ? 'white' : 'gray',
                    }}>
                    No users found
                  </Text>
                )
              ) : null}
            </ModalContent>
          </BottomModal>

          <BottomModal
            onBackdropPress={() => setModal(!modal)}
            swipeDirection={['up', 'down']}
            swipeThreshold={200}
            modalAnimation={
              new SlideAnimation({
                slideFrom: 'bottom',
              })
            }
            onHardwareBackPress={() => setModal(!modal)}
            visible={modal}
            onTouchOutside={() => setModal(!modal)}>
            <ModalContent
              style={{
                width: '100%',
                height: 600,
                backgroundColor: isDarkMode ? '#2e2e2e' : 'white',
              }}>
              {modalView === 'original' ? (
                <View>
                  {/* Original Modal Content */}
                  <Text
                    style={{
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: isDarkMode ? 'white' : 'black',
                    }}>
                    {modal?._id ? 'Edit expense' : 'Add an Expense'}
                  </Text>

                  <ScrollView
                    style={{maxHeight: 500}}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{paddingBottom: 50}}>
                    <View
                      style={{
                        marginVertical: 15,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '500',
                          color: isDarkMode ? 'white' : 'black',
                        }}>
                        Rs
                      </Text>
                      <TextInput
                        value={price}
                        onChangeText={setPrice}
                        style={{
                          color: isDarkMode ? 'white' : 'gray',
                          fontSize: 16,
                        }}
                        placeholderTextColor="gray"
                        placeholder="0.00"
                      />
                    </View>

                    <Pressable
                      onPress={goToBlankView}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '500',
                          color: isDarkMode ? 'white' : 'black',
                        }}>
                        Event
                      </Text>
                      <Text
                        style={{
                          color: isDarkMode ? 'white' : 'gray',
                          fontSize: 16,
                          fontWeight: '800',
                        }}>
                        {category ? `${category}` : 'Select Item'}
                      </Text>
                    </Pressable>

                    <View
                      style={{
                        height: 2,
                        borderColor: '#E0E0E0',
                        borderWidth: 3,
                        marginVertical: 20,
                        borderRadius: 4,
                      }}
                    />

                    <Pressable
                      onPress={togglePaidBy}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingVertical: 10,
                      }}>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: '500',
                          color: isDarkMode ? 'white' : 'black',
                        }}>
                        Paid By:{' '}
                        {selectedPayer === route?.params?.user?._id
                          ? `You (${route?.params?.user?.name})`
                          : participants.find(p => p._id === selectedPayer)
                              ?.name}
                      </Text>

                      <MaterialIcons
                        name={
                          isPaidByExpanded
                            ? 'keyboard-arrow-down'
                            : 'keyboard-arrow-right'
                        }
                        size={25}
                        color={isDarkMode ? '#f0f0f0' : 'black'}
                      />
                    </Pressable>

                    {isPaidByExpanded && (
                      <FlatList
                        data={participants}
                        keyExtractor={item => item._id}
                        scrollEnabled={false}
                        showsVerticalScrollIndicator={false}
                        renderItem={({item}) => {
                          const isSelected = item.name === selectedPayer;
                          return (
                            <Pressable
                              onPress={() => {
                                setSelectedPayer(item._id);
                                setPaidByExpanded(false);
                              }}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingVertical: 8,
                                paddingLeft: 10,
                                justifyContent: 'space-between',
                                marginBottom: 10,
                                backgroundColor: isSelected
                                  ? '#123458'
                                  : isDarkMode
                                  ? '#4A4A4A'
                                  : 'white',
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: isSelected ? '#123458' : 'gray',
                              }}>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                }}>
                                <Image
                                  source={{
                                    uri:
                                      item.photo ||
                                      'https://via.placeholder.com/30',
                                  }}
                                  style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    marginRight: 10,
                                    backgroundColor: '#ccc',
                                  }}
                                />
                                <View>
                                  <Text
                                    style={{
                                      fontSize: 16,
                                      fontWeight: '500',
                                      color: isSelected
                                        ? 'white'
                                        : isDarkMode
                                        ? 'white'
                                        : 'black',
                                    }}>
                                    {item._id === route?.params?.user?._id
                                      ? ' (You) '
                                      : ''}
                                    {item.name}
                                  </Text>
                                </View>
                              </View>
                            </Pressable>
                          );
                        }}
                      />
                    )}

                    <Pressable
                      onPress={toggleSplit}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 15,
                      }}>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: '500',
                          color: isDarkMode ? 'white' : 'black',
                        }}>
                        Split: {splitLabel}
                      </Text>
                      <MaterialIcons
                        name={
                          isSplitExpanded
                            ? 'keyboard-arrow-down'
                            : 'keyboard-arrow-right'
                        }
                        size={25}
                        color={isDarkMode ? '#f0f0f0' : 'black'}
                      />
                    </Pressable>

                    {isSplitExpanded && (
                      <View
                        style={{
                          marginTop: 10,
                          flexDirection: 'column',
                          gap: 10,
                        }}>
                        {/* Participants List */}
                        <FlatList
                          data={participants}
                          keyExtractor={item => item._id}
                          scrollEnabled={false}
                          renderItem={({item}) => {
                            const isSelected = selectedParticipants.some(
                              p => p._id === item._id,
                            );
                            return (
                              <Pressable
                                onPress={() => handleSelectParticipant(item)}
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  paddingVertical: 8,
                                  paddingLeft: 10,
                                  marginBottom: 10,
                                  justifyContent: 'space-between',
                                  backgroundColor: isSelected
                                    ? '#123458'
                                    : isDarkMode
                                    ? '#4A4A4A'
                                    : 'white',
                                  borderWidth: 1,
                                  borderColor: isSelected ? '#123458' : 'gray',
                                  borderRadius: 10,
                                }}>
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                  }}>
                                  <Image
                                    source={{
                                      uri:
                                        item.photo ||
                                        'https://via.placeholder.com/30',
                                    }}
                                    style={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: 20,
                                      marginRight: 10,
                                      backgroundColor: '#ccc',
                                    }}
                                  />
                                  <Text
                                    style={{
                                      fontSize: 16,
                                      fontWeight: '500',
                                      color: isSelected
                                        ? 'white'
                                        : isDarkMode
                                        ? 'white'
                                        : 'black',
                                    }}>
                                    {item._id === route?.params?.user?._id
                                      ? ' (You) '
                                      : ''}
                                    {item.name}
                                  </Text>
                                </View>
                              </Pressable>
                            );
                          }}
                        />

                        {/* Everyone Option */}
                        <Pressable
                          onPress={handleSelectEveryone}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingVertical: 10,
                            borderWidth: 5,
                            borderRadius: 10,
                            backgroundColor: isDarkMode ? '#4A4A4A' : 'white',
                            borderColor:
                              selectedParticipants.length ===
                              participants.length
                                ? isDarkMode
                                  ? 'white'
                                  : '#123458'
                                : 'gray',
                          }}>
                          <Text
                            style={{
                              fontSize: 19,
                              color:
                                selectedParticipants.length ===
                                participants.length
                                  ? isDarkMode
                                    ? 'white'
                                    : '#123458'
                                  : 'gray',
                              fontWeight: '900',
                            }}>
                            Everyone
                          </Text>
                        </Pressable>

                        {/* Don't Split Option */}
                        <Pressable
                          onPress={handleDontSplit}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingVertical: 10,
                            borderWidth: 5,
                            borderRadius: 10,
                            backgroundColor: isDarkMode ? '#4A4A4A' : 'white',
                            borderColor:
                              splitLabel === "Don't Split" &&
                              selectedParticipants.length === 0
                                ? isDarkMode
                                  ? 'white'
                                  : '#123458'
                                : 'gray',
                          }}>
                          <Text
                            style={{
                              fontSize: 19,
                              color:
                                splitLabel === "Don't Split" &&
                                selectedParticipants.length === 0
                                  ? isDarkMode
                                    ? 'white'
                                    : '#123458'
                                  : 'gray',
                              fontWeight: '900',
                            }}>
                            Don't Split
                          </Text>
                        </Pressable>

                        {/* Save Button */}
                        <Pressable
                          onPress={handleSave}
                          style={{
                            backgroundColor: '#007bff',
                            padding: 10,
                            borderRadius: 10,
                            alignItems: 'center',
                            marginTop: 10,
                            width: 100,
                            alignSelf: 'center',
                            backgroundColor: '#FF5733',
                          }}>
                          <Text style={{color: 'white', fontSize: 15}}>
                            Save
                          </Text>
                        </Pressable>
                      </View>
                    )}

                    <View>
                      <Pressable
                        onPress={showDatePicker}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginVertical: 14,
                        }}>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: '500',
                            color: isDarkMode ? 'white' : 'black',
                          }}>
                          {selectedExpenseDate
                            ? `Date: ${formatDate(selectedExpenseDate)}`
                            : 'Date: Select Date'}
                        </Text>
                        <MaterialIcons
                          name="keyboard-arrow-right"
                          size={25}
                          color={isDarkMode ? '#f0f0f0' : 'black'}
                        />
                      </Pressable>

                      <DateTimePickerModal
                        isVisible={isDatePickerVisible}
                        mode="date"
                        onConfirm={handleConfirm}
                        onCancel={hideDatePicker}
                      />
                    </View>

                    <Pressable
                      onPress={
                        modal?._id ? editExpenseInTrip : addExpenseToTrip
                      }
                      style={{
                        backgroundColor: '#FF5733',
                        padding: 10,
                        borderRadius: 10,
                        alignItems: 'center',
                        marginTop: 10,
                        width: 130,
                        alignSelf: 'center',
                      }}>
                      <Text style={{color: 'white', fontSize: 15}}>
                        {modal?._id ? 'Update Expense' : 'Save Expense'}
                      </Text>
                    </Pressable>
                  </ScrollView>
                </View>
              ) : (
                <View>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontWeight: '600',
                      marginTop: 10,
                      color: isDarkMode ? 'white' : 'black',
                    }}>
                    Expense Category
                  </Text>
                  <Pressable
                    onPress={goToOriginalView}
                    style={{
                      marginTop: 20,
                      alignSelf: 'center',
                      padding: 10,
                      backgroundColor: 'blue',
                      borderRadius: 5,
                    }}>
                    <Text style={{color: 'white'}}>Go Back</Text>
                  </Pressable>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 60,
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      marginTop: 15,
                    }}>
                    {data?.map((item, index) => (
                      <Pressable
                        onPress={() => selectCategory(item)}
                        key={index}>
                        <View
                          style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <Image
                            style={{
                              width: 50,
                              height: 50,
                              borderRadius: 30,

                              resizeMode: 'center',
                            }}
                            source={{uri: item?.image}}
                          />
                          <Text
                            style={{
                              textAlign: 'center',
                              marginTop: 10,
                              fontSize: 13,
                              color: isDarkMode ? 'white' : 'black',
                            }}>
                            {item?.name}
                          </Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
            </ModalContent>
          </BottomModal>
        </ScrollView>
      </SafeAreaView>

      <Modal
        onBackdropPress={() => setModalOpen(!modalOpen)}
        onHardwareBackPress={() => setModalOpen(!modalOpen)}
        swipeDirection={['up', 'down']}
        swipeThreshold={200}
        modalTitle={
          <ModalTitle
            title="Budget Info"
            textStyle={{color: isDarkMode ? 'white' : 'black'}}
            style={{backgroundColor: isDarkMode ? '#2e2e2e' : 'white'}}
          />
        }
        modalAnimation={
          new SlideAnimation({
            slideFrom: 'bottom',
          })
        }
        visible={modalOpen}
        onTouchOutside={() => setModalOpen(!modalOpen)}>
        <ModalContent
          style={{
            width: 350,
            height: 'auto',
            backgroundColor: isDarkMode ? '#2e2e2e' : 'white',
          }}>
          <View style={{}}>
            <View
              style={{
                marginTop: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '500',
                  color: isDarkMode ? 'white' : 'black',
                }}>
                Enter budget
              </Text>

              <Feather
                name="edit-2"
                size={20}
                color={isDarkMode ? 'white' : 'black'}
              />
            </View>

            <View
              style={{
                marginTop: 12,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <TextInput
                style={{
                  width: '95%',
                  marginTop: 10,

                  paddingBottom: 10,
                  fontFamily: 'GeezaPro-Bold',
                  borderColor: '#E0E0E0',
                  borderWidth: 1,
                  padding: 10,

                  borderRadius: 20,
                  color: isDarkMode ? 'white' : 'black',
                }}
                value={budget}
                onChangeText={setBudget}
                placeholder={'Enter the budget'}
                placeholderTextColor={isDarkMode ? 'lightgray' : 'black'}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                marginTop: 15,
                alignItems: 'center',
                gap: 20,
                justifyContent: 'center',
              }}>
              <Pressable
                onPress={() => setModalOpen(false)}
                style={{
                  padding: 10,
                  borderRadius: 25,
                  borderColor: '#E0E0E0',
                  borderWidth: 1,
                  width: 100,
                }}>
                <Text
                  style={{
                    textAlign: 'center',
                    color: isDarkMode ? 'white' : 'black',
                  }}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setTripBudget(budget)}
                style={{
                  padding: 10,
                  borderRadius: 25,
                  backgroundColor: '#720e9e',
                  width: 100,
                }}>
                <Text style={{textAlign: 'center', color: 'white'}}>Save</Text>
              </Pressable>
            </View>
          </View>
        </ModalContent>
      </Modal>

      <Pressable
        onPress={() =>
          navigation.navigate('Ai', {
            name: route?.params?.item?.tripName,
          })
        }
        style={{
          width: 60,
          height: 60,
          borderRadius: 40,
          justifyContent: 'center',
          backgroundColor: '#662d91',
          marginLeft: 'auto',
          position: 'absolute',
          bottom: 150,
          right: 25,
          alignContent: 'center',
        }}>
        <MaterialIcons
          name="auto-fix-high"
          style={{textAlign: 'center'}}
          size={24}
          color="white"
        />
      </Pressable>

      <Pressable
        onPress={() =>
          navigation.navigate('Map', {
            places: places,
          })
        }
        style={{
          width: 60,
          height: 60,
          borderRadius: 40,
          justifyContent: 'center',
          backgroundColor: 'black',
          marginLeft: 'auto',
          position: 'absolute',
          bottom: 75,
          right: 25,
          alignContent: 'center',
        }}>
        <Feather
          style={{textAlign: 'center'}}
          name="map"
          size={24}
          color="white"
        />
      </Pressable>
      <Modal
        visible={customModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isDarkMode ? 'black' : 'rgba(0, 0, 0, 0.3)',
          }}>
          <View style={currentStyles.modalContent}>
            <View contentContainerStyle={currentStyles.modalTextContainer}>
              <Text style={currentStyles.modalTitle}>{modalTitle}</Text>
              <Text style={currentStyles.modalMessage}>{modalMessage}</Text>
            </View>
            <TouchableOpacity
              onPress={handleCloseModal}
              style={currentStyles.modalButton}>
              <Text style={currentStyles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TripPlanScreen;

//Future Implementation:-

//1]Share Feature:-

// const [openShareModal, setOpenShareModal] = useState(false);
// const senderName = route?.params?.item?.name;
// const [email, setEmail] = useState('');
// const [isValidEmail, setIsValidEmail] = useState(false);
{
  /* <Pressable
                          onPress={() => setOpenShareModal(!openShareModal)}
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 8,
                            borderRadius: 25,
                            alignSelf: 'flex-start',
                            backgroundColor: 'black',
                          }}>
                          <Text
                            style={{
                              textAlign: 'center',
                              color: 'white',
                              fontSize: 12,
                              fontWeight: '500',
                            }}>
                            Share
                          </Text>
                        </Pressable> */
}

// const validateEmail = email => {
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   return emailRegex.test(email);
// };

// const handleEmailChange = input => {
//   setEmail(input);
//   setIsValidEmail(validateEmail(input));
// };

// const handleSendInvite = async () => {
//   if (isValidEmail) {
//     try {
//       // Call the API to send the invite
//       const response = await axios.post(
//         'http://192.168.31.48:8000/sendInviteEmail',
//         // const response = await axios.post(
//         //   'http://localhost:8000/sendInviteEmail',
//         {
//           email, // Email entered by the user
//           tripId, // ID of the current trip (you should have this from your state/context)
//           tripName, // Name of the trip (you should have this from your state/context)
//           senderName, // Name of the person sending the invite (you can get it from the user context)
//         },
//       );

//       if (response.status === 200) {
//         console.log('Invitation sent successfully');
//         setOpenShareModal(false);
//       } else {
//         console.log('Failed to send invitation');
//       }
//     } catch (error) {
//       console.error('Error sending invite email:', error);
//       // alert('Error occurred while sending the invitation.');
//     } finally {
//       setEmail(''); // Clear the input after sending the invite
//     }
//   } else {
//     alert('Please enter a valid email.');
//   }
// };

{
  /* <BottomModal
        onBackdropPress={() => setOpenShareModal(!openShareModal)}
        swipeDirection={['up', 'down']}
        swipeThreshold={200}
        modalAnimation={
          new SlideAnimation({
            slideFrom: 'bottom',
          })
        }
        onHardwareBackPress={() => setOpenShareModal(!openShareModal)}
        visible={openShareModal}
        onTouchOutside={() => setOpenShareModal(!openShareModal)}>
        <ModalContent
          style={{width: '100%', height: 400, backgroundColor: '#F8F8F8'}}>
          <View>
            <Text
              style={{fontSize: 15, fontWeight: '500', textAlign: 'center'}}>
              Invite Tripmates
            </Text>
            <View
              style={{
                marginVertical: 16,
                flexDirection: 'row',
                alignItems: 'center',
                padding: 12,
                backgroundColor: '#E0E0E0',
                gap: 8,
                borderRadius: 7,
              }}>
              <Ionicons name="person-add-sharp" size={20} color="gray" />
              <TextInput
                value={email}
                onChangeText={handleEmailChange}
                placeholderTextColor={'gray'}
                placeholder="Invite by Email address"
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 20,
                justifyContent: 'center',
                alignSelf: 'center',
                marginTop: 12,
              }}>
              <View>
                <Pressable
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: '#E0E0E0',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <AntDesign name="link" size={23} color="gray" />
                </Pressable>
                <Text
                  style={{
                    fontSize: 13,
                    textAlign: 'center',
                    color: 'gray',
                    marginTop: 8,
                  }}>
                  Link
                </Text>
              </View>

              <View>
                <Pressable
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: '#E0E0E0',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <AntDesign name="message1" size={23} color="gray" />
                </Pressable>
                <Text
                  style={{
                    fontSize: 13,
                    textAlign: 'center',
                    color: 'gray',
                    marginTop: 10,
                  }}>
                  Text
                </Text>
              </View>

              <View>
                <Pressable
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: '#E0E0E0',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <AntDesign name="sharealt" size={23} color="gray" />
                </Pressable>
                <Text
                  style={{
                    fontSize: 13,
                    textAlign: 'center',
                    color: 'gray',
                    marginTop: 10,
                  }}>
                  Other
                </Text>
              </View>
            </View>

            {isValidEmail && (
              <Pressable
                style={{
                  backgroundColor: '#E97451',
                  marginTop: 16,
                  padding: 10,
                  borderRadius: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={handleSendInvite}>
                <Text style={{color: 'white', fontSize: 16, fontWeight: '500'}}>
                  Send 1 invite
                </Text>
              </Pressable>
            )}
          </View>
        </ModalContent>
      </BottomModal> */
}
