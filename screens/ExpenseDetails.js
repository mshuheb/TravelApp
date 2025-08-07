import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import React, {useState, useContext, useEffect} from 'react';
import {AuthContext, DarkModeContext} from '../AuthContext';
import dayjs from 'dayjs';
import AntDesign from 'react-native-vector-icons/AntDesign';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from '../styles/ExpenseDetailsStyles';

const ExpenseDetails = ({route}) => {
  const {userId} = useContext(AuthContext);

  const {expense, participants, tripId, setModal, refreshExpenses} =
    route.params;
  const navigation = useNavigation();
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(expense?.comments || []);

  const getUserById = id => participants?.find(p => p._id === id);
  const payer = getUserById(expense?.paidBy);
  const {isDarkMode, toggleDarkMode} = useContext(DarkModeContext);

  const formattedDate = expense?.date
    ? new Date(expense.date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'N/A';

  const youPaid = userId === expense?.paidBy;

  const fetchComments = async () => {
    try {
      const res = await fetch(
        `https://travelapp-32u1.onrender.com/getComments/${tripId}/${expense._id}`,
      );
      const data = await res.json();

      if (res.ok && data.comments) {
        const sorted = data.comments.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setComments(sorted);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleSendComment = async () => {
    if (commentText.trim() === '') return;

    const payload = {
      userId: userId,
      text: commentText.trim(),
    };

    try {
      const res = await fetch(
        `https://travelapp-32u1.onrender.com/addComment/${tripId}/${expense._id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      if (res.ok) {
        setCommentText('');
        fetchComments();
      }
    } catch (error) {
      console.error('Failed to send comment:', error);
    }
  };

  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
      fetchComments();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [onModalClose, setOnModalClose] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleCloseModal = () => {
    setCustomModalVisible(false);
    setShowDeleteConfirm(false);

    if (typeof onModalClose === 'function') {
      const callback = onModalClose;
      setOnModalClose(null);
      callback();
    }
  };

  const showModal = (message, callback = null) => {
    setModalMessage(message);
    setCustomModalVisible(true);
    setOnModalClose(() => callback);
  };

  const deleteExpense = expenseId => {
    if (!expenseId) {
      console.error('Missing expenseId');
      showModal('Expense ID is missing.');
      return;
    }

    setModalMessage('Are you sure you want to delete this expense?');
    setCustomModalVisible(true);
    setShowDeleteConfirm(true);

    setOnModalClose(() => async () => {
      try {
        const response = await axios.delete(
          `https://travelapp-32u1.onrender.com/deleteExpense/${tripId}/${expenseId}`,
        );

        if (response.status === 200) {
          console.log('Expense deleted successfully:', response.data);

          showModal('Expense deleted successfully.', () => {
            navigation.goBack();
          });
        } else {
          console.error('Failed to delete expense:', response.data.message);
          showModal('Failed to delete the expense. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting expense:', error);
        showModal('An unexpected error occurred while deleting the expense.');
      }

      refreshExpenses();
    });
  };

  const currentStyles = styles(isDarkMode);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{flex: 1}}>
      <ScrollView contentContainerStyle={currentStyles.scrollContent}>
        {/* --- Top Expense Details --- */}
        <View style={currentStyles.headerRow}>
          <View style={currentStyles.leftHeader}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={currentStyles.backButton}>
              <View style={currentStyles.backIconContainer}>
                <Ionicons name="arrow-back" size={20} color="black" />
              </View>
            </Pressable>

            <View style={currentStyles.categoryInfo}>
              {expense?.categoryImage && (
                <Image
                  source={{uri: expense.categoryImage}}
                  style={currentStyles.categoryImage}
                />
              )}
              <Text style={currentStyles.title}>
                {expense?.category || 'Untitled'}
              </Text>
            </View>
          </View>

          {expense?.createdBy === userId && (
            <View style={currentStyles.iconRow}>
              <TouchableOpacity onPress={() => setModal?.(expense)}>
                <AntDesign
                  name="edit"
                  size={25}
                  color={isDarkMode ? '#FFFFFF' : '#000000'}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteExpense(expense._id)} testID="delete-expense-button">
                <AntDesign
                  name="delete"
                  size={25}
                  color={isDarkMode ? '#FFFFFF' : '#000000'}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={currentStyles.amount}>₹{expense?.price?.toFixed(2)}</Text>
        <Text style={currentStyles.subText}>
          Expense was for {formattedDate}
        </Text>
        <View style={currentStyles.sectionWrapper}>
          <View style={currentStyles.section}>
            <View style={currentStyles.paidByContainer}>
              {payer?.photo && (
                <Image
                  source={{uri: payer.photo}}
                  style={currentStyles.avatar}
                />
              )}
              <Text style={currentStyles.highlight}>
                {youPaid ? 'You' : payer?.name || 'Someone'} paid ₹
                {expense?.price}
              </Text>
            </View>

            <View style={currentStyles.splitSection}>
              {expense?.splitBy?.map((uid, index) => {
                const user = getUserById(uid);
                const owedAmount = (
                  expense.price / expense.splitBy.length
                ).toFixed(2);
                const isCurrentUser = uid === userId;

                return (
                  <View key={index} style={currentStyles.oweRow}>
                    {user?.photo && (
                      <Image
                        source={{uri: user.photo}}
                        style={currentStyles.smallAvatar}
                      />
                    )}
                    <Text style={currentStyles.oweText}>
                      {isCurrentUser ? 'You' : user?.name || 'Unknown'}{' '}
                      {isCurrentUser ? 'owe' : 'owes'} ₹{owedAmount}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
        <View style={currentStyles.divider} />

        {/* --- Comment Section --- */}
        <View style={currentStyles.shadowWrapper}>
          <View style={currentStyles.commentsContainer}>
            <Text style={currentStyles.commentsTitle}>Comments</Text>

            {comments.length > 0 ? (
              comments.map((comment, index) => {
                const user = comment.userId;

                return (
                  <View key={index} style={currentStyles.commentRow}>
                    {user?.photo && (
                      <Image
                        source={{uri: user.photo}}
                        style={currentStyles.commentAvatar}
                      />
                    )}
                    <View style={{flex: 1}}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={currentStyles.commentName}>
                          {user._id === userId ? 'You' : user?.name || 'User'}
                        </Text>
                        <Text style={currentStyles.commentTime}>
                          {comment.createdAt
                            ? dayjs(comment.createdAt).fromNow()
                            : 'Now'}
                        </Text>
                      </View>
                      <Text style={currentStyles.commentText}>
                        {comment.text}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={currentStyles.noComments}>No comments yet.</Text>
            )}

            {/* Input for new comment */}
            <View style={currentStyles.inputRow}>
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Write a comment..."
                placeholderTextColor={isDarkMode ? 'lightgray' : '#2E2E2E'}
                style={currentStyles.input}
              />
              <TouchableOpacity
                onPress={handleSendComment}
                style={currentStyles.sendBtn}>
                <Text style={currentStyles.sendText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <Modal
          visible={customModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={handleCloseModal}>
          <View style={currentStyles.modalOverlay}>
            <View style={currentStyles.modalContent}>
              <ScrollView
                contentContainerStyle={currentStyles.modalTextContainer}>
                <Text style={currentStyles.modalMessage}>{modalMessage}</Text>
              </ScrollView>

              {showDeleteConfirm ? (
                <View style={currentStyles.confirmButtonContainer}>
                  <TouchableOpacity
                    onPress={() => {
                      setCustomModalVisible(false);
                      setShowDeleteConfirm(false);
                      setOnModalClose(null);
                    }}
                    style={[
                      currentStyles.modalButton,
                      currentStyles.cancelButton,
                    ]}>
                    <Text style={currentStyles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={async () => {
                      setCustomModalVisible(false);
                      setShowDeleteConfirm(false);

                      if (typeof onModalClose === 'function') {
                        const callback = onModalClose;
                        setOnModalClose(null);
                        await callback();
                      }
                    }}
                    style={currentStyles.modalButton}>
                    <Text style={currentStyles.modalButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleCloseModal}
                  style={currentStyles.modalButton}>
                  <Text style={currentStyles.modalButtonText}>Close</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ExpenseDetails;
