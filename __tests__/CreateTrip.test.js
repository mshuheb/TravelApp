import {render, fireEvent, waitFor} from '@testing-library/react-native';
import CreateTrip from '../screens/CreateTrip';
import {AuthContext, DarkModeContext} from '../AuthContext';
import {useNavigation, useRoute} from '@react-navigation/native';
import renderer from 'react-test-renderer';

jest.mock('axios');
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: jest.fn(),
    useRoute: jest.fn(),
  };
});

describe('CreateTrip component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<CreateTrip />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('CreateTrip', () => {
  jest.mock('axios');
  jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
      ...actualNav,
      useNavigation: jest.fn(),
      useRoute: jest.fn(),
    };
  });

  describe('CreateTrip', () => {
    const mockAuthContext = {
      userId: 'mock-user-id',
      setUserId: jest.fn(),
      setToken: jest.fn(),
      userInfo: {},
      setUserInfo: jest.fn(),
    };

    const mockDarkModeContext = {
      isDarkMode: false,
      toggleDarkMode: jest.fn(),
    };

    const mockNavigation = {
      navigate: jest.fn(),
    };

    beforeEach(() => {
      useNavigation.mockReturnValue(mockNavigation);
      useRoute.mockReturnValue({params: {}});
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('shows a modal when required fields are missing', async () => {
      const {getByText} = render(
        <AuthContext.Provider value={mockAuthContext}>
          <DarkModeContext.Provider value={mockDarkModeContext}>
            <CreateTrip />
          </DarkModeContext.Provider>
        </AuthContext.Provider>,
      );

      const createButton = getByText('Create');
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(getByText('Please fill all fields')).toBeTruthy();
      });
    });

    it('should navigate to Home when Cancel is pressed', async () => {
      const {getByText} = render(
        <AuthContext.Provider value={mockAuthContext}>
          <DarkModeContext.Provider value={mockDarkModeContext}>
            <CreateTrip />
          </DarkModeContext.Provider>
        </AuthContext.Provider>,
      );

      fireEvent.press(getByText('Cancel'));
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
    });

    it('should open Choose screen with correct params when Choose Image is pressed', async () => {
      const {getByText, getByPlaceholderText} = render(
        <AuthContext.Provider value={mockAuthContext}>
          <DarkModeContext.Provider value={mockDarkModeContext}>
            <CreateTrip />
          </DarkModeContext.Provider>
        </AuthContext.Provider>,
      );

      fireEvent.changeText(getByPlaceholderText('Trip name'), 'Test Trip');
      fireEvent.press(getByText('Choose Image'));

      expect(mockNavigation.navigate).toHaveBeenCalledWith(
        'Choose',
        expect.objectContaining({
          tripName: 'Test Trip',
          startDate: null,
          endDate: null,
          startDay: '',
          endDay: '',
          image: expect.any(String),
          selectedTimeZone: 'Asia/Kolkata',
        }),
      );
    });

    it('should update tripName input value', () => {
      const {getByPlaceholderText} = render(
        <AuthContext.Provider value={mockAuthContext}>
          <DarkModeContext.Provider value={mockDarkModeContext}>
            <CreateTrip />
          </DarkModeContext.Provider>
        </AuthContext.Provider>,
      );

      const input = getByPlaceholderText('Trip name');
      fireEvent.changeText(input, 'Holiday');
      expect(input.props.value).toBe('Holiday');
    });
  });
});
