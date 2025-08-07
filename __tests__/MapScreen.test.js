import {render, fireEvent, waitFor} from '@testing-library/react-native';
import MapScreen from '../screens/MapScreen';
import {AuthContext, DarkModeContext} from '../AuthContext';

jest.mock('axios');
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: jest.fn(),
  };
});

describe('MapScreen', () => {
  const mockAuthContext = {
    token: null,
    setToken: jest.fn(),
  };

  const mockDarkModeContext = {
    isDarkMode: false,
    toggleDarkMode: jest.fn(),
  };

  const mockNavigation = {
    goBack: jest.fn(),
  };

  it('renders the MapScreen correctly', () => {
    const {getByText} = render(
      <AuthContext.Provider value={mockAuthContext}>
        <DarkModeContext.Provider value={mockDarkModeContext}>
          <MapScreen navigation={mockNavigation} />
        </DarkModeContext.Provider>
      </AuthContext.Provider>,
    );

    expect(getByText('Map Screen')).toBeTruthy();
  });

  it('calls the goBack function when the back button is pressed', async () => {
    const {getByTestId} = render(
      <AuthContext.Provider value={mockAuthContext}>
        <DarkModeContext.Provider value={mockDarkModeContext}>
          <MapScreen navigation={mockNavigation} />
        </DarkModeContext.Provider>
      </AuthContext.Provider>,
    );

    const backButton = getByTestId('backButton');
    fireEvent.press(backButton);

    await waitFor(() => {
      expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
    });
  });

  it('renders the map view with the correct style', async () => {
    const {getByTestId} = render(
      <AuthContext.Provider value={mockAuthContext}>
        <DarkModeContext.Provider value={mockDarkModeContext}>
          <MapScreen navigation={mockNavigation} />
        </DarkModeContext.Provider>
      </AuthContext.Provider>,
    );

    const mapView = getByTestId('mapView');
    expect(mapView.props.style).toEqual(
      expect.objectContaining({
        flex: 1,
        backgroundColor: '#fff',
      }),
    );
  });

  it('renders the markers on the map view', async () => {
    const {getByTestId} = render(
      <AuthContext.Provider value={mockAuthContext}>
        <DarkModeContext.Provider value={mockDarkModeContext}>
          <MapScreen navigation={mockNavigation} />
        </DarkModeContext.Provider>
      </AuthContext.Provider>,
    );

    const markers = getByTestId('markers');
    expect(markers.props.children).toHaveLength(1);
  });
});
