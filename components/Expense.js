import {Text, View, ScrollView, Pressable} from 'react-native';
import React, {useEffect, useState, useContext} from 'react';
import {useNavigation} from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {fetchHost} from '../utils/fetchHost';
import {AuthContext, DarkModeContext} from '../AuthContext';

const Expense = ({
  budget,
  expenses,
  route,
  modalOpen,
  setModalOpen,
  modal,
  setModal,
  participants,
  fetchParticipants,
  tripId,
  refreshExpenses,
}) => {
  const navigation = useNavigation();

  useEffect(() => {
    fetchParticipants();
  }, []);

  const getUserById = id => participants?.find(p => p._id === id);

  const [isHost, setIsHost] = useState(false);
  const [hostData, setHostData] = useState(null);
  const [hostLoaded, setHostLoaded] = useState(false);
  const {userId} = useContext(AuthContext);
  const {isDarkMode, toggleDarkMode} = useContext(DarkModeContext);

  useEffect(() => {
    if (tripId && userId) {
      fetchHost(tripId, userId, ({isHost, hostData}) => {
        setIsHost(isHost);
        setHostData(hostData);
        setHostLoaded(true);
      });
    }
  }, [tripId, userId]);

  return (
    <ScrollView
      contentContainerStyle={{paddingBottom: 280}}
      style={{backgroundColor: isDarkMode ? '#1e1e1e' : 'white'}}>
      <View>
        <View style={{padding: 10, backgroundColor: '#13274F'}}>
          <View style={{alignItems: 'center', marginBottom: 10}}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 4,
              }}>
              <AntDesign
                name="wallet"
                size={20}
                color="white"
                style={{marginRight: 6}}
              />
              <Text style={{fontSize: 18, color: 'white', fontWeight: '600'}}>
                Trip Budget
              </Text>
            </View>
            <Text
              style={{
                fontSize: 24,
                color: 'white',
                fontWeight: 'bold',
                textAlign: 'center',
              }}>
              ₹{budget ? budget : route?.params?.item?.budget}
            </Text>
          </View>
          {!hostLoaded ? (
            <View
              style={{
                marginVertical: 5,
                height: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={{color: 'transparent', fontSize: 15}}>
                Set a budget
              </Text>
            </View>
          ) : isHost ? (
            <Pressable onPress={() => setModalOpen(!modalOpen)}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginVertical: 5,
                }}>
                <AntDesign
                  name="edit"
                  size={16}
                  color="white"
                  style={{marginRight: 6}}
                />
                <Text
                  style={{textAlign: 'center', color: 'white', fontSize: 15}}>
                  Set a budget
                </Text>
              </View>
            </Pressable>
          ) : (
            <View style={{marginVertical: 5, height: 20}} />
          )}
        </View>
      </View>

      <View>
        <View
          style={{
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text
            style={{
              fontSize: 17,
              fontWeight: 'bold',
              color: isDarkMode ? 'white' : 'black',
            }}>
            Expenses
          </Text>
        </View>

        {expenses?.length > 0 ? (
          <View style={{marginHorizontal: 12}}>
            {expenses.map((item, index) => {
              const payer = getUserById(item.paidBy);
              const splitByNames = item.splitBy
                ?.map(id => getUserById(id)?.name || 'Unknown')
                .join(', ');

              return (
                <Pressable
                  key={index}
                  style={{marginTop: 10}}
                  onPress={() =>
                    navigation.navigate('ExpenseDetails', {
                      expense: item,
                      participants,
                      tripId,
                      setModal,
                      refreshExpenses,
                    })
                  }>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}>
                    <View
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        backgroundColor: '#0066b2',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Text style={{color: 'white', fontWeight: '500'}}>
                        {index + 1}
                      </Text>
                    </View>

                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: '500',
                        flex: 1,
                        color: isDarkMode ? 'white' : 'black',
                      }}>
                      {item.category}
                    </Text>

                    <Text
                      style={{
                        fontSize: 15,
                        color: isDarkMode ? '#F5F5F5' : '#606060',
                      }}>
                      ₹{item.price}
                      {item.splitBy?.length > 0
                        ? item.splitBy.length === participants.length
                          ? ' (Everyone)'
                          : ` (${splitByNames})`
                        : ''}
                    </Text>
                  </View>

                  <Text
                    style={{
                      marginTop: 5,
                      color: isDarkMode ? '#F5F5F5' : '#606060',
                    }}>
                    Paid By - {payer?.name || 'Unknown'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <Text
            style={{
              marginHorizontal: 12,
              color: isDarkMode ? '#F5F5F5' : 'gray',
            }}>
            You haven't added any expenses yet!
          </Text>
        )}

        <Pressable
          onPress={() => setModal(!modal)}
          style={{
            padding: 12,
            backgroundColor: '#FF5733',
            borderRadius: 25,
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: 30,
          }}>
          <Text style={{textAlign: 'center', color: 'white'}}>Add Expense</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default Expense;
