import {render, fireEvent, waitFor} from '@testing-library/react-native';
import Place from '../components/Place';
import axios from 'axios';
import {AuthContext, DarkModeContext} from '../AuthContext';
import {fetchHost} from '../utils/fetchHost';

jest.mock('axios');
jest.mock('react-native-vector-icons/AntDesign', () => {
  const React = require('react');
  const {Text} = require('react-native');
  return {
    __esModule: true,
    default: props => <Text {...props}>AntDesign</Text>,
  };
});
jest.mock('react-native-vector-icons/Entypo', () => 'Entypo');
jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    Swipeable: ({children, renderRightActions, enabled}) => (
      <View>
        {children}
        {
          enabled &&
            renderRightActions &&
            renderRightActions() 
        }
      </View>
    ),
  };
});

jest.mock('../AuthContext', () => {
  const React = require('react');
  return {
    AuthContext: React.createContext({userId: 'testUserId'}),
    DarkModeContext: React.createContext({
      isDarkMode: false,
      toggleDarkMode: jest.fn(),
    }),
  };
});
jest.mock('../utils/fetchHost', () => ({
  fetchHost: jest.fn(),
}));
jest.mock('../styles/PlaceStyles', () =>
  jest.fn(() => ({
    rightAction: {},
    deleteButton: {},
    modalOverlay: {},
    modalContent: {},
    modalTextContainer: {},
    modalMessage: {},
    confirmButtonContainer: {},
    modalButton: {},
    cancelButton: {},
    modalButtonText: {},
  })),
);

const mockItem = {
  _id: 'place123',
  name: 'Eiffel Tower',
  briefDescription: 'A famous landmark in Paris.',
  photos: ['https://example.com/eiffel.jpg'],
  phoneNumber: '123-456-7890',
  website: 'https://www.toureiffel.paris',
  formatted_address: 'Champ de Mars, 75007 Paris, France',
  openingHours: ['Monday: 9:00 AM - 11:00 PM'],
  types: ['landmark', 'tourist_attraction'],
};

const mockRoute = {
  params: {
    item: {
      _id: 'trip123',
    },
  },
};

describe('Place', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchHost.mockImplementation((tripId, userId, callback) => {
      callback({isHost: true, hostData: {}});
    });
  });

  it('renders correctly with all provided data', async () => {
    const setItems = jest.fn();
    const { getByText, getByPlaceholderText, getByRole, queryByText } = render(
      <AuthContext.Provider value={{ userId: 'testUserId' }}>
        <DarkModeContext.Provider value={{ isDarkMode: false, toggleDarkMode: jest.fn() }}>
          <Place
            item={mockItem}
            items={[mockItem.name]} 
            setItems={setItems}
            index={0}
            refreshPlaces={jest.fn()}
            refreshItinerary={jest.fn()}
            route={mockRoute}
          />
        </DarkModeContext.Provider>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(fetchHost).toHaveBeenCalledWith('trip123', 'testUserId', expect.any(Function));
    });

    expect(getByText('Eiffel Tower')).toBeTruthy();
    expect(getByText('A famous landmark in Paris.')).toBeTruthy();
    expect(getByText('123-456-7890')).toBeTruthy();
    expect(getByText('https://www.toureiffel.paris')).toBeTruthy();
    expect(getByText('Champ de Mars, 75007 Paris, France')).toBeTruthy();
    expect(getByText('9:00 AM - 11:00 PM')).toBeTruthy();
    expect(getByText('landmark')).toBeTruthy();
    expect(getByText('tourist_attraction')).toBeTruthy();
    expect(queryByText('No Image Available')).toBeNull();
  });

  it('renders correctly when no photo is available', async () => {
    const setItems = jest.fn();
    const itemWithoutPhoto = {...mockItem, photos: []};
    const {getByText} = render(
      <AuthContext.Provider value={{userId: 'testUserId'}}>
        <DarkModeContext.Provider
          value={{isDarkMode: false, toggleDarkMode: jest.fn()}}>
          <Place
            item={itemWithoutPhoto}
            items={[]}
            setItems={setItems}
            index={0}
            refreshPlaces={jest.fn()}
            refreshItinerary={jest.fn()}
            route={mockRoute}
          />
        </DarkModeContext.Provider>
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(fetchHost).toHaveBeenCalled();
    });

    expect(getByText('No Image Available')).toBeTruthy();
  });

  it('calls choosePlaces when the place is pressed', async () => {
    const setItems = jest.fn();
    const {getByText} = render(
      <AuthContext.Provider value={{userId: 'testUserId'}}>
        <DarkModeContext.Provider
          value={{isDarkMode: false, toggleDarkMode: jest.fn()}}>
          <Place
            item={mockItem}
            items={[]}
            setItems={setItems}
            index={0}
            refreshPlaces={jest.fn()}
            refreshItinerary={jest.fn()}
            route={mockRoute}
          />
        </DarkModeContext.Provider>
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(fetchHost).toHaveBeenCalled();
    });

    fireEvent.press(getByText('Eiffel Tower'));
    expect(setItems).toHaveBeenCalledWith(expect.any(Function));
  });

  it('handles delete action successfully', async () => {
    axios.delete.mockResolvedValueOnce({data: {message: 'Place deleted'}});
    const refreshPlaces = jest.fn();
    const refreshItinerary = jest.fn();

    const {getByText, getAllByText, queryByText} = render(
      <AuthContext.Provider value={{userId: 'testUserId'}}>
        <DarkModeContext.Provider
          value={{isDarkMode: false, toggleDarkMode: jest.fn()}}>
          <Place
            item={mockItem}
            items={[]}
            setItems={jest.fn()}
            index={0}
            refreshPlaces={refreshPlaces}
            refreshItinerary={refreshItinerary}
            route={mockRoute}
          />
        </DarkModeContext.Provider>
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(fetchHost).toHaveBeenCalled();
    });

    fireEvent.press(getAllByText('AntDesign')[0]); 

    expect(
      getByText(`Are you sure you want to remove ${mockItem.name}?`),
    ).toBeTruthy();
    fireEvent.press(getByText('Delete'));

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        `https://travelapp-32u1.onrender.com/removePlace/${mockItem._id}`,
        {headers: {'Content-Type': 'application/json'}},
      );
      expect(getByText('Place deleted successfully.')).toBeTruthy();
    });

    fireEvent.press(getByText('Close'));
    expect(refreshPlaces).toHaveBeenCalled();
    expect(refreshItinerary).toHaveBeenCalled();
  });

  it('handles delete action failure', async () => {
    axios.delete.mockRejectedValueOnce({
      response: {data: {message: 'Failed to delete'}},
    });
    const refreshPlaces = jest.fn();
    const refreshItinerary = jest.fn();

    const {getByText, getAllByText} = render(
      <AuthContext.Provider value={{userId: 'testUserId'}}>
        <DarkModeContext.Provider
          value={{isDarkMode: false, toggleDarkMode: jest.fn()}}>
          <Place
            item={mockItem}
            items={[]}
            setItems={jest.fn()}
            index={0}
            refreshPlaces={refreshPlaces}
            refreshItinerary={refreshItinerary}
            route={mockRoute}
          />
        </DarkModeContext.Provider>
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(fetchHost).toHaveBeenCalled();
    });

    fireEvent.press(getAllByText('AntDesign')[0]);

    expect(
      getByText(`Are you sure you want to remove ${mockItem.name}?`),
    ).toBeTruthy();
    fireEvent.press(getByText('Delete'));

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalled();
      expect(
        getByText('Failed to delete the place. Please try again.'),
      ).toBeTruthy();
    });

    fireEvent.press(getByText('Close'));
    expect(refreshPlaces).not.toHaveBeenCalled();
    expect(refreshItinerary).not.toHaveBeenCalled();
  });

  it('does not show delete option if isHost is false', async () => {
    fetchHost.mockImplementation((tripId, userId, callback) => {
      callback({isHost: false, hostData: {}});
    });

    const {queryByText} = render(
      <AuthContext.Provider value={{userId: 'testUserId'}}>
        <DarkModeContext.Provider
          value={{isDarkMode: false, toggleDarkMode: jest.fn()}}>
          <Place
            item={mockItem}
            items={[]}
            setItems={jest.fn()}
            index={0}
            refreshPlaces={jest.fn()}
            refreshItinerary={jest.fn()}
            route={mockRoute}
          />
        </DarkModeContext.Provider>
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(fetchHost).toHaveBeenCalled();
    });

    expect(queryByText('AntDesign')).toBeNull(); 
  });

  it('renders in dark mode correctly', async () => {
    const setItems = jest.fn();
    const {getByText} = render(
      <AuthContext.Provider value={{userId: 'testUserId'}}>
        <DarkModeContext.Provider
          value={{isDarkMode: true, toggleDarkMode: jest.fn()}}>
          <Place
            item={mockItem}
            items={[]}
            setItems={setItems}
            index={0}
            refreshPlaces={jest.fn()}
            refreshItinerary={jest.fn()}
            route={mockRoute}
          />
        </DarkModeContext.Provider>
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(fetchHost).toHaveBeenCalled();
    });

    expect(getByText('Eiffel Tower').props.style.color).toBe('lightgray');
  });
});
