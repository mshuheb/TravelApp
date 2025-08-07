import {render, fireEvent, waitFor} from '@testing-library/react-native';
import Itinerary from '../components/Itinerary';
import moment from 'moment';
import axios from 'axios';
import {AuthContext, DarkModeContext} from '../AuthContext';
import {fetchHost} from '../utils/fetchHost';

jest.mock('moment', () => {
  return jest.fn(() => ({
    format: jest.fn(date => date),
  }));
});

jest.mock('axios');
jest.mock('react-native-vector-icons/MaterialIcons', () => 'MaterialIcons');
jest.mock(
  'react-native-vector-icons/MaterialCommunityIcons',
  () => 'MaterialCommunityIcons',
);

jest.mock('react-native-vector-icons/AntDesign', () => {
  const React = require('react');
  const {Text} = require('react-native');
  return {
    __esModule: true,
    default: props => <Text {...props}>AntDesign</Text>,
  };
});

jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    Swipeable: ({children, renderRightActions}) => (
      <View>
        {children}
        {renderRightActions && renderRightActions()}
      </View>
    ),
  };
});

jest.mock('../hooks/useBlinkingAnimation', () => jest.fn(() => 1));

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
jest.mock('../styles/ItineraryStyles', () =>
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

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

const mockRoute = {
  params: {
    item: {
      _id: 'trip123',
      itinerary: [
        {
          date: '2023-01-01',
          activities: [
            {
              _id: 'act1',
              name: 'Activity 1',
              briefDescription: 'Description 1',
              photos: ['photo1.jpg'],
            },
            {
              _id: 'act2',
              name: 'Activity 2',
              briefDescription: 'Description 2',
              photos: [],
            },
          ],
        },
        {
          date: '2023-01-02',
          activities: [],
        },
      ],
    },
  },
};

describe('Itinerary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    moment.mockImplementation(date => ({
      format: jest.fn(() => {
        if (date === '2023-01-01') return '1 January';
        if (date === '2023-01-02') return '2 January';
        return date;
      }),
    }));
    fetchHost.mockImplementation((tripId, userId, callback) => {
      callback({isHost: true, hostData: {}});
    });
  });

  it('renders correctly with initial data', async () => {
    const {getByText, getAllByText, queryByText} = render(
      <AuthContext.Provider value={{userId: 'testUserId'}}>
        <DarkModeContext.Provider
          value={{isDarkMode: false, toggleDarkMode: jest.fn()}}>
          <Itinerary
            route={mockRoute}
            itinerary={mockRoute.params.item.itinerary}
          />
        </DarkModeContext.Provider>
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(fetchHost).toHaveBeenCalledWith(
        'trip123',
        'testUserId',
        expect.any(Function),
      );
    });

    expect(getAllByText('1 January')[0]).toBeTruthy();
    expect(getAllByText('2 January')[0]).toBeTruthy();
    expect(getByText('Activity 1')).toBeTruthy();
    expect(getByText('Description 1')).toBeTruthy();
    expect(queryByText('No places added')).toBeNull();
  });

  it('toggles description expansion when description is pressed', async () => {
    const {getByText} = render(
      <AuthContext.Provider value={{userId: 'testUserId'}}>
        <DarkModeContext.Provider
          value={{isDarkMode: false, toggleDarkMode: jest.fn()}}>
          <Itinerary
            route={mockRoute}
            itinerary={mockRoute.params.item.itinerary}
          />
        </DarkModeContext.Provider>
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(fetchHost).toHaveBeenCalled();
    });

    const descriptionText = getByText('Description 1');
    fireEvent.press(descriptionText);
    fireEvent.press(descriptionText);
  });

  it('shows "Add a place" input when isHost is true and date is expanded', async () => {
    fetchHost.mockImplementation((tripId, userId, callback) => {
      callback({isHost: true, hostData: {}});
    });

    const {getAllByPlaceholderText} = render(
      <AuthContext.Provider value={{userId: 'testUserId'}}>
        <DarkModeContext.Provider
          value={{isDarkMode: false, toggleDarkMode: jest.fn()}}>
          <Itinerary
            route={mockRoute}
            itinerary={mockRoute.params.item.itinerary}
          />
        </DarkModeContext.Provider>
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(fetchHost).toHaveBeenCalled();
    });

    expect(getAllByPlaceholderText('Add a place')[0]).toBeTruthy();
  });

  it('does not show "Add a place" input when isHost is false', async () => {
    fetchHost.mockImplementation((tripId, userId, callback) => {
      callback({isHost: false, hostData: {}});
    });

    const {queryByPlaceholderText} = render(
      <AuthContext.Provider value={{userId: 'testUserId'}}>
        <DarkModeContext.Provider
          value={{isDarkMode: false, toggleDarkMode: jest.fn()}}>
          <Itinerary
            route={mockRoute}
            itinerary={mockRoute.params.item.itinerary}
          />
        </DarkModeContext.Provider>
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(fetchHost).toHaveBeenCalled();
    });

    expect(queryByPlaceholderText('Add a place')).toBeNull();
  });

  it('handles activity deletion successfully', async () => {
    axios.delete.mockResolvedValueOnce({data: {message: 'Activity deleted'}});
    const mockRefreshItinerary = jest.fn();

    const {getByText, getAllByText} = render(
      <AuthContext.Provider value={{userId: 'testUserId'}}>
        <DarkModeContext.Provider
          value={{isDarkMode: false, toggleDarkMode: jest.fn()}}>
          <Itinerary
            route={mockRoute}
            itinerary={mockRoute.params.item.itinerary}
            refreshItinerary={mockRefreshItinerary}
          />
        </DarkModeContext.Provider>
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(fetchHost).toHaveBeenCalled();
    });

    const deleteButton = getAllByText('AntDesign')[0];
    fireEvent.press(deleteButton);

    expect(
      getByText('Are you sure you want to remove this activity?'),
    ).toBeTruthy();
    fireEvent.press(getByText('Delete'));

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        'http://192.168.31.48:8000/trips/trip123/itinerary/act1',
      );
      expect(getByText('Activity deleted successfully.')).toBeTruthy();
    });

    fireEvent.press(getByText('Close'));
    expect(mockRefreshItinerary).toHaveBeenCalled();
  });

  it('handles activity deletion failure', async () => {
    axios.delete.mockRejectedValueOnce({
      response: {data: {message: 'Failed to delete'}},
    });
    const mockRefreshItinerary = jest.fn();

    const {getByText, getAllByText} = render(
      <AuthContext.Provider value={{userId: 'testUserId'}}>
        <DarkModeContext.Provider
          value={{isDarkMode: false, toggleDarkMode: jest.fn()}}>
          <Itinerary
            route={mockRoute}
            itinerary={mockRoute.params.item.itinerary}
            refreshItinerary={mockRefreshItinerary}
          />
        </DarkModeContext.Provider>
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(fetchHost).toHaveBeenCalled();
    });

    const deleteButton = getAllByText('AntDesign')[0];
    fireEvent.press(deleteButton);

    expect(
      getByText('Are you sure you want to remove this activity?'),
    ).toBeTruthy();
    fireEvent.press(getByText('Delete'));

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalled();
      expect(
        getByText('Failed to delete the activity. Please try again.'),
      ).toBeTruthy();
    });

    fireEvent.press(getByText('Close'));
    expect(mockRefreshItinerary).not.toHaveBeenCalled();
  });

  it('displays "No places added" when there are no activities for a date and isHost is false', async () => {
    fetchHost.mockImplementation((tripId, userId, callback) => {
      callback({isHost: false, hostData: {}});
    });

    const {getAllByText} = render(
      <AuthContext.Provider value={{userId: 'testUserId'}}>
        <DarkModeContext.Provider
          value={{isDarkMode: false, toggleDarkMode: jest.fn()}}>
          <Itinerary
            route={mockRoute}
            itinerary={mockRoute.params.item.itinerary}
          />
        </DarkModeContext.Provider>
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(fetchHost).toHaveBeenCalled();
    });

    expect(getAllByText('No places added').length).toBeGreaterThanOrEqual(1);
  });

  it('does not display "No places added" when isHost is true, even if no activities', async () => {
    fetchHost.mockImplementation((tripId, userId, callback) => {
      callback({isHost: true, hostData: {}});
    });

    const {queryByText} = render(
      <AuthContext.Provider value={{userId: 'testUserId'}}>
        <DarkModeContext.Provider
          value={{isDarkMode: false, toggleDarkMode: jest.fn()}}>
          <Itinerary
            route={mockRoute}
            itinerary={mockRoute.params.item.itinerary}
          />
        </DarkModeContext.Provider>
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(fetchHost).toHaveBeenCalled();
    });

    expect(queryByText('No places added')).toBeNull();
  });

  it('calls setOpenModal when "Add a place" is pressed', async () => {
    const mockSetOpenModal = jest.fn();
    fetchHost.mockImplementation((tripId, userId, callback) => {
      callback({isHost: true, hostData: {}});
    });

    const {getAllByPlaceholderText} = render(
      <AuthContext.Provider value={{userId: 'testUserId'}}>
        <DarkModeContext.Provider
          value={{isDarkMode: false, toggleDarkMode: jest.fn()}}>
          <Itinerary
            route={mockRoute}
            itinerary={mockRoute.params.item.itinerary}
            setOpenModal={mockSetOpenModal}
          />
        </DarkModeContext.Provider>
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(fetchHost).toHaveBeenCalled();
    });

    fireEvent.press(getAllByPlaceholderText('Add a place')[0]);
    expect(mockSetOpenModal).toHaveBeenCalledWith(
      mockRoute.params.item.itinerary[0],
    );
  });

  it('displays correct image or "No Image Available" text', async () => {
    const {getByText, getByTestId} = render(
      <AuthContext.Provider value={{userId: 'testUserId'}}>
        <DarkModeContext.Provider
          value={{isDarkMode: false, toggleDarkMode: jest.fn()}}>
          <Itinerary
            route={mockRoute}
            itinerary={mockRoute.params.item.itinerary}
          />
        </DarkModeContext.Provider>
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(fetchHost).toHaveBeenCalled();
    });

    expect(getByText('No Image Available')).toBeTruthy();
  });

  it('renders in dark mode correctly', async () => {
    const {getByText} = render(
      <AuthContext.Provider value={{userId: 'testUserId'}}>
        <DarkModeContext.Provider
          value={{isDarkMode: true, toggleDarkMode: jest.fn()}}>
          <Itinerary
            route={mockRoute}
            itinerary={mockRoute.params.item.itinerary}
          />
        </DarkModeContext.Provider>
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(fetchHost).toHaveBeenCalled();
    });

    expect(getByText('Activity 1').props.style.color).toBe('lightgray');
  });
});
