import {render, fireEvent} from '@testing-library/react-native';
import {useNavigation} from '@react-navigation/native';
import {AuthContext, DarkModeContext} from '../AuthContext';
import {fetchHost} from '../utils/fetchHost';
import Expense from '../components/Expense';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('react-native-vector-icons/AntDesign', () => 'AntDesign');

jest.mock('../utils/fetchHost', () => ({
  fetchHost: jest.fn(),
}));

describe('Expense', () => {
  const mockNavigate = jest.fn();
  beforeEach(() => {
    useNavigation.mockReturnValue({navigate: mockNavigate});
    fetchHost.mockClear();
    mockNavigate.mockClear();
  });

  const defaultProps = {
    budget: 1000,
    expenses: [],
    route: {params: {item: {budget: 1200}}},
    modalOpen: false,
    setModalOpen: jest.fn(),
    modal: false,
    setModal: jest.fn(),
    participants: [
      {_id: 'p1', name: 'Alice'},
      {_id: 'p2', name: 'Bob'},
    ],
    fetchParticipants: jest.fn(),
    tripId: 'trip123',
    refreshExpenses: jest.fn(),
  };

  const renderComponent = (
    props = {},
    authContext = {},
    darkModeContext = {},
  ) => {
    return render(
      <AuthContext.Provider value={{userId: 'user123', ...authContext}}>
        <DarkModeContext.Provider
          value={{isDarkMode: false, ...darkModeContext}}>
          <Expense {...defaultProps} {...props} />
        </DarkModeContext.Provider>
      </AuthContext.Provider>,
    );
  };

  it('renders correctly with no expenses', () => {
    const {getByText} = renderComponent();
    expect(getByText('Trip Budget')).toBeTruthy();
    expect(getByText('₹1000')).toBeTruthy();
    expect(getByText("You haven't added any expenses yet!")).toBeTruthy();
    expect(getByText('Add Expense')).toBeTruthy();
  });

  it('displays budget from route params if budget prop is not provided', () => {
    const {getByText} = renderComponent({budget: undefined});
    expect(getByText('₹1200')).toBeTruthy();
  });

  it('displays "Set a budget" button for host', async () => {
    fetchHost.mockImplementation((tripId, userId, callback) => {
      callback({isHost: true, hostData: {}});
    });
    const {findByText} = renderComponent();
    expect(await findByText('Set a budget')).toBeTruthy();
  });

  it('does not display "Set a budget" button for non-host', async () => {
    fetchHost.mockImplementation((tripId, userId, callback) => {
      callback({isHost: false, hostData: {}});
    });
    const {queryByText} = renderComponent();
    expect(queryByText('Set a budget')).toBeNull();
  });

  it('calls setModalOpen when "Set a budget" is pressed by host', async () => {
    fetchHost.mockImplementation((tripId, userId, callback) => {
      callback({isHost: true, hostData: {}});
    });
    const {findByText} = renderComponent();
    const setBudgetButton = await findByText('Set a budget');
    fireEvent.press(setBudgetButton);
    expect(defaultProps.setModalOpen).toHaveBeenCalledWith(true);
  });

  it('calls setModal when "Add Expense" is pressed', () => {
    const {getByText} = renderComponent();
    fireEvent.press(getByText('Add Expense'));
    expect(defaultProps.setModal).toHaveBeenCalledWith(true);
  });

  it('navigates to ExpenseDetails when an expense is pressed', () => {
    const expenses = [
      {
        _id: 'e1',
        category: 'Food',
        price: 500,
        paidBy: 'p1',
        splitBy: ['p1', 'p2'],
      },
    ];
    const {getByText} = renderComponent({expenses});
    fireEvent.press(getByText('Food'));
    expect(mockNavigate).toHaveBeenCalledWith('ExpenseDetails', {
      expense: expenses[0],
      participants: defaultProps.participants,
      tripId: defaultProps.tripId,
      setModal: defaultProps.setModal,
      refreshExpenses: defaultProps.refreshExpenses,
    });
  });

  it('displays "Everyone" when splitBy includes all participants', () => {
    const expenses = [
      {
        _id: 'e1',
        category: 'Accommodation',
        price: 1000,
        paidBy: 'p1',
        splitBy: ['p1', 'p2'],
      },
    ];
    const {getByText} = renderComponent({expenses});
    expect(getByText('₹1000 (Everyone)')).toBeTruthy();
  });

  it('applies dark mode styles', () => {
    const {getByText} = renderComponent({}, {}, {isDarkMode: true});
    const expensesText = getByText('Expenses');
    expect(expensesText.props.style.color).toBe('white');
  });

  it('applies light mode styles', () => {
    const {getByText} = renderComponent({}, {}, {isDarkMode: false});
    const expensesText = getByText('Expenses');
    expect(expensesText.props.style.color).toBe('black');
  });
});
