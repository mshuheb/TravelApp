import {render, fireEvent, waitFor} from '@testing-library/react-native';
import DinRest from '../components/DinRest';
import {DarkModeContext} from '../AuthContext';
import axios from 'axios';

jest.mock('axios');

describe('DinRest Component', () => {
  const mockFetchDetails = jest.fn().mockResolvedValue({
    name: 'Mock Restaurant',
    reviews: [{text: 'Mock review'}],
    photos: [{photo_reference: 'mock_photo_reference'}],
    formatted_phone_number: '123-456-7890',
    opening_hours: {weekday_text: ['Monday: 9 AM - 5 PM']},
    website: 'http://mockwebsite.com',
    formatted_address: '123 Mock St, Mock City',
    types: ['restaurant', 'food'],
  });

  const mockPlaces = [
    {
      geometry: {
        location: {lat: 37.7749, lng: -122.4194},
      },
    },
  ];

  beforeEach(() => {
    axios.get.mockResolvedValue({
      data: {
        results: [
          {place_id: 'mock_place_id_1', name: 'Mock Restaurant'},
          {place_id: 'mock_place_id_2', name: 'Mock Restaurant'},
        ],
      },
    });
  });

  const renderComponent = (isDarkMode = false) => {
    return render(
      <DarkModeContext.Provider value={{isDarkMode, toggleDarkMode: jest.fn()}}>
        <DinRest fetchDetails={mockFetchDetails} places={mockPlaces} />
      </DarkModeContext.Provider>,
    );
  };

  it('renders loading indicator when loading', async () => {
    const {getByText} = renderComponent();
    expect(getByText('Loading Restaurants...')).toBeTruthy();
  });

  it('renders no restaurants found message when no data', async () => {
    axios.get.mockResolvedValueOnce({data: {results: []}});
    const {findByText} = renderComponent();
    expect(await findByText('No restaurants found.')).toBeTruthy();
  });

  it('renders restaurant list correctly', async () => {
    const {findAllByText} = renderComponent();
    const restaurants = await findAllByText('Mock Restaurant');
    expect(restaurants.length).toBe(2);
  });

  it('renders restaurant details when expanded', async () => {
    const {findAllByText, getByText} = renderComponent();
    const restaurantNames = await findAllByText('Mock Restaurant');
    fireEvent.press(restaurantNames[0]);
    await waitFor(() => {
      expect(getByText('123-456-7890')).toBeTruthy();
      expect(getByText('http://mockwebsite.com')).toBeTruthy();
    });
  });
});
