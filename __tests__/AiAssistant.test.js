import {render, fireEvent, waitFor} from '@testing-library/react-native';
import AiAssistant from '../screens/AiAssistant';
import {ChatContext} from '../ChatContext';
import {DarkModeContext} from '../AuthContext';
import {Keyboard} from 'react-native';

jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');

jest.spyOn(Keyboard, 'addListener').mockImplementation((event, callback) => ({
  remove: jest.fn(),
}));

beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(message => {
    if (
      message.includes('Clipboard has been extracted') ||
      message.includes('ProgressBarAndroid has been extracted')
    ) {
      return;
    }
    console.warn(message);
  });
});

describe('AiAssistant', () => {
  const mockNavigation = {goBack: jest.fn()};
  const mockSetMessages = jest.fn();
  const mockChatContext = {
    messages: [],
    setMessages: mockSetMessages,
  };
  const mockDarkModeContext = {
    isDarkMode: false,
    toggleDarkMode: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('renders the AiAssistant component correctly', () => {
    const {getByPlaceholderText, getByText} = render(
      <ChatContext.Provider value={mockChatContext}>
        <DarkModeContext.Provider value={mockDarkModeContext}>
          <AiAssistant navigation={mockNavigation} />
        </DarkModeContext.Provider>
      </ChatContext.Provider>,
    );

    expect(getByText('Travel Assistant')).toBeTruthy();
    expect(getByPlaceholderText('Trip plans, food, stays...')).toBeTruthy();
  });

  it('sends a message and handles relevant input', async () => {
    const mockResponse = {reply: 'Here is some travel advice.'};
    fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    const {getByPlaceholderText, getByText} = render(
      <ChatContext.Provider value={mockChatContext}>
        <DarkModeContext.Provider value={mockDarkModeContext}>
          <AiAssistant navigation={mockNavigation} />
        </DarkModeContext.Provider>
      </ChatContext.Provider>,
    );

    const input = getByPlaceholderText('Trip plans, food, stays...');
    const sendButton = getByText('Send');

    fireEvent.changeText(input, 'Tell me about travel');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(mockSetMessages).toHaveBeenCalled();

      let accumulated = [];
      mockSetMessages.mock.calls.forEach(([arg]) => {
        accumulated = arg(accumulated);
      });

      expect(accumulated).toEqual(
        expect.arrayContaining([
          expect.objectContaining({text: 'Tell me about travel'}),
          expect.objectContaining({text: 'Here is some travel advice.'}),
        ]),
      );
    });
  });

  it('handles irrelevant input gracefully', async () => {
    const {getByPlaceholderText, getByText} = render(
      <ChatContext.Provider value={mockChatContext}>
        <DarkModeContext.Provider value={mockDarkModeContext}>
          <AiAssistant navigation={mockNavigation} />
        </DarkModeContext.Provider>
      </ChatContext.Provider>,
    );

    const input = getByPlaceholderText('Trip plans, food, stays...');
    const sendButton = getByText('Send');

    fireEvent.changeText(input, 'Random text');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(mockSetMessages).toHaveBeenCalled();

      let accumulated = [];
      mockSetMessages.mock.calls.forEach(([arg]) => {
        accumulated = arg(accumulated);
      });

      expect(accumulated).toEqual(
        expect.arrayContaining([
          expect.objectContaining({text: 'Random text'}),
          expect.objectContaining({
            text: expect.stringContaining('I can help with trip planning'),
          }),
        ]),
      );
    });
  });

  it('adjusts keyboard offset when keyboard is shown or hidden', () => {
    const {getByPlaceholderText} = render(
      <ChatContext.Provider value={mockChatContext}>
        <DarkModeContext.Provider value={mockDarkModeContext}>
          <AiAssistant navigation={mockNavigation} />
        </DarkModeContext.Provider>
      </ChatContext.Provider>,
    );

    const input = getByPlaceholderText('Trip plans, food, stays...');
    fireEvent(input, 'focus');

    expect(mockSetMessages).not.toHaveBeenCalled();
  });

  it('applies dark mode styles when enabled', () => {
    const darkModeContext = {...mockDarkModeContext, isDarkMode: true};

    const {getByPlaceholderText} = render(
      <ChatContext.Provider value={mockChatContext}>
        <DarkModeContext.Provider value={darkModeContext}>
          <AiAssistant navigation={mockNavigation} />
        </DarkModeContext.Provider>
      </ChatContext.Provider>,
    );

    const input = getByPlaceholderText('Trip plans, food, stays...');
    expect(input.props.placeholderTextColor).toBe('lightgray');
  });
});
