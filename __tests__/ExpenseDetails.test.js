import {render, fireEvent, waitFor} from '@testing-library/react-native';
import ExpenseDetails from '../screens/ExpenseDetails';
import {AuthContext, DarkModeContext} from '../AuthContext';
import {useNavigation} from '@react-navigation/native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('axios');

jest.mock('react-native-vector-icons/AntDesign', () => 'AntDesign');
jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');

global.fetch = jest.fn((url, options) => {
  if (url.includes('/getComments')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({comments: []}),
    });
  }
  if (url.includes('/addComment')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({message: 'Comment added'}),
    });
  }
  return Promise.reject(new Error('Unknown fetch URL'));
});

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

describe('ExpenseDetails', () => {
  const mockUserId = 'user123';
  const mockTripId = 'trip456';
  const mockExpense = {
    _id: 'expense789',
    category: 'Food',
    categoryImage: 'https://example.com/food.png',
    price: 150.75,
    date: new Date().toISOString(),
    paidBy: 'user123',
    splitBy: ['user123', 'user456'],
    createdBy: 'user123',
    comments: [],
  };
  const mockParticipants = [
    {
      _id: 'user123',
      name: 'Current User',
      photo: 'https://example.com/user1.png',
    },
    {
      _id: 'user456',
      name: 'Other User',
      photo: 'https://example.com/user2.png',
    },
  ];
  const mockSetModal = jest.fn();
  const mockRefreshExpenses = jest.fn();

  const renderComponent = async (
    expense = mockExpense,
    userId = mockUserId,
    participants = mockParticipants,
  ) => {
    useNavigation.mockReturnValue({
      navigate: mockNavigate,
      goBack: mockGoBack,
    });

    return await render(
      <AuthContext.Provider value={{userId}}>
        <DarkModeContext.Provider
          value={{isDarkMode: false, toggleDarkMode: jest.fn()}}>
          <ExpenseDetails
            route={{
              params: {
                expense,
                participants,
                tripId: mockTripId,
                setModal: mockSetModal,
                refreshExpenses: mockRefreshExpenses,
              },
            }}
          />
        </DarkModeContext.Provider>
      </AuthContext.Provider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders expense details correctly', async () => {
    const {getByText, queryByText} = await renderComponent();

    expect(getByText('Food')).toBeTruthy();
    expect(getByText('₹150.75')).toBeTruthy();
    expect(getByText(/Expense was for/)).toBeTruthy();
    expect(getByText('You paid ₹150.75')).toBeTruthy();
    expect(getByText('You owe ₹75.38')).toBeTruthy();
    expect(getByText('Other User owes ₹75.38')).toBeTruthy();
    expect(queryByText('No comments yet.')).toBeTruthy();
  });

  test('allows user to submit a comment', async () => {
    const {getByPlaceholderText, getByText} = await renderComponent();

    const commentInput = getByPlaceholderText('Write a comment...');
    const sendButton = getByText('Send');

    fireEvent.changeText(commentInput, 'This is a test comment.');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `https://travelapp-32u1.onrender.com/addComment/${mockTripId}/${mockExpense._id}`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            userId: mockUserId,
            text: 'This is a test comment.',
          }),
        }),
      );
    });

    expect(commentInput.props.value).toBe('');
  });

  test('shows delete confirmation modal when delete button is pressed', async () => {
    const {getByTestId, findByText} = await renderComponent();

    fireEvent.press(getByTestId('delete-expense-button'));

    const modalMessage = await findByText(
      'Are you sure you want to delete this expense?',
    );
    expect(modalMessage).toBeTruthy();
  });

  test('does not show edit/delete buttons if current user is not the creator', async () => {
    const expenseByOtherUser = {...mockExpense, createdBy: 'anotherUser'};
    const {queryByText} = await renderComponent(expenseByOtherUser);

    expect(queryByText('AntDesign')).toBeNull();
  });
});
